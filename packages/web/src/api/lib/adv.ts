/**
 * TBH TV & STREAMING ADV — MOTORE SERVER.
 *
 * Qui stanno le tre cose che NON devono mai passare dal browser (specifica del 15/09/2026):
 *
 * 1. il PREZZO: pieno, promo o Fidelity lo decide il server leggendo il listino e il calendario
 *    della promozione. `price=`, `discount=`, `fascia=` arrivati dal client vengono ignorati;
 * 2. la FIDELITY: si verifica sul registro `adv_fidelity`, non si autodichiara;
 * 3. il PAGAMENTO: la sessione di Checkout nasce su Product e Price veri di Stripe e lo stato
 *    «pagato» lo scrive solo il webhook firmato.
 */

import { and, eq, or, sql } from "drizzle-orm";
import { db } from "../database";
import * as schema from "../database/schema";
import {
  ADDON_ADV,
  ADV_IVA,
  PACCHETTI_ADV,
  scomponi,
  type Fasce,
  type PacchettoAdv,
} from "../data/adv-tv";
import { stripeGet, stripePost } from "./stripe";

/**
 * Riga di listino in vigore. I tre prezzi e i due testi vengono esclusi dal tipo base
 * perché il pannello può sovrascriverli, e la promo può anche non esserci: senza
 * `Omit` l'intersezione terrebbe i campi obbligatori della slide e rifiuterebbe il null.
 */
export type RigaListino = Omit<
  PacchettoAdv,
  "titolo" | "descrizione" | "pienoCents" | "promoCents" | "fidelityCents"
> & {
  titolo: string;
  descrizione: string;
  pienoCents: number;
  promoCents: number | null;
  fidelityCents: number | null;
  promoDal: string | null;
  promoAl: string | null;
  ivaAliquota: number;
  disponibile: boolean;
  cashbackPercento: number;
  /** true quando la promozione è nella sua finestra di validità: scaduta, si torna al pieno. */
  promoAttiva: boolean;
  /** Il listino è stato modificato dal pannello oppure è ancora quello della slide. */
  daPannello: boolean;
};

export type RigaAddon = {
  codice: string;
  nome: string;
  descrizione: string;
  prezzoCents: number;
  attivo: boolean;
  daPannello: boolean;
};

export function oggiIso() {
  return new Date().toISOString().slice(0, 10);
}

function dentroFinestra(dal: string | null, al: string | null, oggi = oggiIso()) {
  if (dal && oggi < dal) return false;
  if (al && oggi > al) return false;
  return true;
}

/**
 * Il listino vero: base della slide + eventuali modifiche salvate dal pannello.
 * Nessun pacchetto sparisce e nessuno viene inventato: le righe sono sempre queste quattro.
 */
export async function listinoAdv(): Promise<RigaListino[]> {
  const righe = await db.select().from(schema.advListino);
  const perSlug = new Map(righe.map((r) => [r.slug, r]));
  const oggi = oggiIso();

  return PACCHETTI_ADV.map((p) => {
    const r = perSlug.get(p.slug);
    const promoCents = r ? r.promoCents : p.promoCents;
    const promoDal = r?.promoDal ?? null;
    const promoAl = r?.promoAl ?? null;
    return {
      ...p,
      titolo: r?.titolo?.trim() || p.titolo,
      descrizione: r?.descrizione?.trim() || p.descrizione,
      pienoCents: r ? r.pienoCents : p.pienoCents,
      promoCents: promoCents ?? null,
      fidelityCents: r ? r.fidelityCents : p.fidelityCents,
      promoDal,
      promoAl,
      ivaAliquota: r?.ivaAliquota ?? ADV_IVA,
      disponibile: r ? r.disponibile === 1 : true,
      cashbackPercento: r?.cashbackPercento ?? 100,
      promoAttiva: Boolean(promoCents) && dentroFinestra(promoDal, promoAl, oggi),
      daPannello: Boolean(r),
    };
  });
}

export async function pacchettoAdv(slug: string) {
  const listino = await listinoAdv();
  return listino.find((p) => p.slug === slug) ?? null;
}

/** I servizi extra: base della specifica + prezzi aggiornati dal pannello. */
export async function addonAdv(soloAttivi = true): Promise<RigaAddon[]> {
  const righe = await db.select().from(schema.advAddon);
  const perCodice = new Map(righe.map((r) => [r.codice, r]));
  const out: RigaAddon[] = ADDON_ADV.map((a) => {
    const r = perCodice.get(a.codice);
    return {
      codice: a.codice,
      nome: r?.nome?.trim() || a.nome,
      descrizione: r?.descrizione?.trim() || a.cosa,
      prezzoCents: r ? r.prezzoCents : a.daCents,
      attivo: r ? r.attivo === 1 : true,
      daPannello: Boolean(r),
    };
  });
  // Servizi extra aggiunti a mano dal pannello, oltre ai quattro di listino.
  for (const r of righe) {
    if (ADDON_ADV.some((a) => a.codice === r.codice)) continue;
    out.push({
      codice: r.codice,
      nome: r.nome,
      descrizione: r.descrizione ?? "",
      prezzoCents: r.prezzoCents,
      attivo: r.attivo === 1,
      daPannello: true,
    });
  }
  return soloAttivi ? out.filter((a) => a.attivo) : out;
}

export type EsitoFidelity = {
  fidelizzato: boolean;
  /** Riga del registro che ha autorizzato il prezzo riservato. */
  id: number | null;
  intestatario: string | null;
  livello: string | null;
  cashback: boolean;
  riferimento: string | null;
  messaggio: string;
};

function pulisci(v: string | null | undefined) {
  const s = (v ?? "").trim();
  return s ? s : null;
}

/**
 * VERIFICA FIDELITY — server-side, unica strada per ottenere il prezzo riservato.
 * Si cerca per email, codice fiscale/partita IVA o codice TBH sul registro dei clienti
 * fidelizzati. Registro vuoto o nessuna corrispondenza = prezzo pieno o promo.
 */
export async function verificaFidelity(input: {
  email?: string | null;
  codiceFiscale?: string | null;
  codiceTbh?: string | null;
}): Promise<EsitoFidelity> {
  const email = pulisci(input.email)?.toLowerCase() ?? null;
  const fiscale = pulisci(input.codiceFiscale)?.toUpperCase() ?? null;
  const codice = pulisci(input.codiceTbh)?.toUpperCase() ?? null;

  const negativo = (messaggio: string): EsitoFidelity => ({
    fidelizzato: false,
    id: null,
    intestatario: null,
    livello: null,
    cashback: false,
    riferimento: null,
    messaggio,
  });

  if (!email && !fiscale && !codice) {
    return negativo("Serve almeno email, codice fiscale/partita IVA o codice TBH.");
  }

  const condizioni = [
    email ? sql`lower(${schema.advFidelity.email}) = ${email}` : null,
    fiscale ? sql`upper(${schema.advFidelity.codiceFiscale}) = ${fiscale}` : null,
    fiscale ? sql`upper(${schema.advFidelity.partitaIva}) = ${fiscale}` : null,
    codice ? sql`upper(${schema.advFidelity.codiceTbh}) = ${codice}` : null,
  ].filter(Boolean);

  const righe = await db
    .select()
    .from(schema.advFidelity)
    .where(and(eq(schema.advFidelity.attivo, 1), or(...(condizioni as never[]))));

  const oggi = oggiIso();
  const valida = righe.find((r) => !r.scadenza || r.scadenza >= oggi);

  if (!valida) {
    const scaduta = righe.length > 0;
    return negativo(
      scaduta
        ? "La posizione Fidelity risulta scaduta: il prezzo applicato è quello pieno o promozionale. Contattaci per il rinnovo."
        : "Nessuna posizione Fidelity TBH trovata con questi dati: si applica il prezzo pieno o la promozione attiva.",
    );
  }

  return {
    fidelizzato: true,
    id: valida.id,
    intestatario: valida.intestatario,
    livello: valida.livello,
    cashback: valida.cashback === 1,
    riferimento: valida.codiceTbh ?? valida.email ?? valida.codiceFiscale ?? null,
    messaggio: `Posizione Fidelity TBH verificata: ${valida.intestatario}.`,
  };
}

export type Preventivo = {
  slug: string;
  sku: string;
  titolo: string;
  fascia: Fasce;
  /** Perché è stata applicata questa fascia. */
  motivo: string;
  pacchettoCents: number;
  addon: { codice: string; nome: string; prezzoCents: number }[];
  addonCents: number;
  lordoCents: number;
  nettoCents: number;
  ivaCents: number;
  ivaAliquota: number;
  /** Confronti mostrati nel riepilogo. */
  pienoCents: number;
  promoCents: number | null;
  promoAttiva: boolean;
  fidelityCents: number | null;
  risparmioCents: number;
  cashbackCents: number;
  cashbackEleggibile: boolean;
};

/**
 * CALCOLO PREZZO — l'unico punto in cui si decide quanto si paga.
 * Ordine: Fidelity verificata → promozione attiva → prezzo pieno.
 */
export async function calcolaPreventivo(params: {
  pacchetto: RigaListino;
  addonCodici: string[];
  fidelity: EsitoFidelity;
}): Promise<Preventivo> {
  const { pacchetto, fidelity } = params;
  const disponibili = await addonAdv(true);
  const addon = params.addonCodici
    .map((c) => disponibili.find((a) => a.codice === c))
    .filter((a): a is RigaAddon => Boolean(a))
    .map((a) => ({ codice: a.codice, nome: a.nome, prezzoCents: a.prezzoCents }));

  let fascia: Fasce = "pieno";
  let pacchettoCents = pacchetto.pienoCents;
  let motivo = "Prezzo pieno di listino.";

  if (fidelity.fidelizzato && pacchetto.fidelityCents) {
    fascia = "fidelity";
    pacchettoCents = pacchetto.fidelityCents;
    motivo = "Prezzo riservato ai clienti fidelizzati TBH, verificato sul registro.";
  } else if (pacchetto.promoAttiva && pacchetto.promoCents) {
    fascia = "promo";
    pacchettoCents = pacchetto.promoCents;
    motivo = pacchetto.promoAl
      ? `Promozione attiva fino al ${pacchetto.promoAl}.`
      : "Promozione attiva.";
  }

  const addonCents = addon.reduce((s, a) => s + a.prezzoCents, 0);
  const lordoCents = pacchettoCents + addonCents;
  const f = scomponi(lordoCents, pacchetto.ivaAliquota);
  const cashbackEleggibile = fidelity.fidelizzato && fidelity.cashback;

  return {
    slug: pacchetto.slug,
    sku: pacchetto.sku,
    titolo: pacchetto.titolo,
    fascia,
    motivo,
    pacchettoCents,
    addon,
    addonCents,
    lordoCents,
    nettoCents: f.netto,
    ivaCents: f.iva,
    ivaAliquota: f.ivaAliquota,
    pienoCents: pacchetto.pienoCents,
    promoCents: pacchetto.promoCents,
    promoAttiva: pacchetto.promoAttiva,
    fidelityCents: pacchetto.fidelityCents,
    risparmioCents: Math.max(0, pacchetto.pienoCents - pacchettoCents),
    cashbackCents: cashbackEleggibile
      ? Math.round((pacchettoCents * pacchetto.cashbackPercento) / 100)
      : 0,
    cashbackEleggibile,
  };
}

/** Sigla di protocollo per pacchetto: ADV/CTV/2026/000001 e simili. */
const SIGLE: Record<string, string> = {
  "tbh-tv-frame": "TVF",
  "tbh-video-tv": "VTV",
  "tbh-tv-impact": "TVI",
  "tbh-ctv-premium": "CTV",
};

/** Contatore progressivo annuale, conservato in `settings`. */
async function prossimoProgressivo(anno: number) {
  const chiave = `adv:progressivo:${anno}`;
  const [riga] = await db
    .select()
    .from(schema.settings)
    .where(eq(schema.settings.key, chiave));
  const prossimo = (Number(riga?.value ?? 0) || 0) + 1;
  if (riga) {
    await db
      .update(schema.settings)
      .set({ value: String(prossimo) })
      .where(eq(schema.settings.key, chiave));
  } else {
    await db.insert(schema.settings).values({ key: chiave, value: String(prossimo) });
  }
  return prossimo;
}

export async function numeriPratica(slug: string) {
  const anno = new Date().getFullYear();
  const n = await prossimoProgressivo(anno);
  const progressivo = String(n).padStart(6, "0");
  const sigla = SIGLE[slug] ?? "ADV";
  return {
    numeroOrdine: `TBH-TV-${anno}-${progressivo}`,
    protocollo: `ADV/${sigla}/${anno}/${progressivo}`,
  };
}

export async function registraEvento(
  praticaId: number,
  stato: string,
  nota: string | null,
  origine: "sistema" | "webhook" | "pannello",
) {
  await db.insert(schema.advEventi).values({ praticaId, stato, nota, origine });
}

type StripeProduct = { id: string };
type StripePrice = { id: string; unit_amount?: number; active?: boolean };

const CAMPO_PREZZO: Record<Fasce, "stripePricePieno" | "stripePricePromo" | "stripePriceFidelity"> =
  {
    pieno: "stripePricePieno",
    promo: "stripePricePromo",
    fidelity: "stripePriceFidelity",
  };

/**
 * Product + Price VERI su Stripe per un pacchetto e una fascia.
 * Il Price si riusa se esiste e se l'importo combacia; se il prezzo di listino è cambiato
 * si crea un Price nuovo (su Stripe un Price non si modifica) e si archivia il vecchio.
 */
export async function assicuraPrezzoStripe(pacchetto: RigaListino, fascia: Fasce, importo: number) {
  const [riga] = await db
    .select()
    .from(schema.advListino)
    .where(eq(schema.advListino.slug, pacchetto.slug));

  let productId = riga?.stripeProductId ?? null;
  if (!productId) {
    const prodotto = await stripePost<StripeProduct>(
      "/products",
      {
        name: pacchetto.titolo,
        description: pacchetto.descrizione.slice(0, 250),
        metadata: { sku: pacchetto.sku, slug: pacchetto.slug, circuito: "TBH TV & STREAMING ADV" },
      },
      `tbh-adv-product-${pacchetto.slug}`,
    );
    productId = prodotto.id;
  }

  const campo = CAMPO_PREZZO[fascia];
  let priceId = riga?.[campo] ?? null;

  if (priceId) {
    const esistente = await stripeGet<StripePrice>(`/prices/${priceId}`);
    if (esistente.unit_amount !== importo || esistente.active === false) {
      await stripePost(`/prices/${priceId}`, { active: false }).catch(() => undefined);
      priceId = null;
    }
  }

  if (!priceId) {
    const prezzo = await stripePost<StripePrice>(
      "/prices",
      {
        currency: "eur",
        unit_amount: importo,
        product: productId,
        nickname: `${pacchetto.sku} · ${fascia}`,
        metadata: { slug: pacchetto.slug, fascia, iva_inclusa: "true" },
      },
      `tbh-adv-price-${pacchetto.slug}-${fascia}-${importo}`,
    );
    priceId = prezzo.id;
  }

  const valori = { stripeProductId: productId, [campo]: priceId } as Record<string, string>;
  if (riga) {
    await db
      .update(schema.advListino)
      .set({ ...valori, aggiornatoIl: new Date() })
      .where(eq(schema.advListino.slug, pacchetto.slug));
  } else {
    await db.insert(schema.advListino).values({
      slug: pacchetto.slug,
      sku: pacchetto.sku,
      titolo: pacchetto.titolo,
      descrizione: pacchetto.descrizione,
      pienoCents: pacchetto.pienoCents,
      promoCents: pacchetto.promoCents,
      fidelityCents: pacchetto.fidelityCents,
      promoDal: pacchetto.promoDal,
      promoAl: pacchetto.promoAl,
      ivaAliquota: pacchetto.ivaAliquota,
      disponibile: pacchetto.disponibile ? 1 : 0,
      cashbackPercento: pacchetto.cashbackPercento,
      ...valori,
    });
  }

  return { productId, priceId };
}

/** Lo stesso per un servizio extra: Product + Price reali, riusati se l'importo non cambia. */
export async function assicuraPrezzoAddonStripe(addon: RigaAddon) {
  const [riga] = await db
    .select()
    .from(schema.advAddon)
    .where(eq(schema.advAddon.codice, addon.codice));

  let productId = riga?.stripeProductId ?? null;
  if (!productId) {
    const prodotto = await stripePost<StripeProduct>(
      "/products",
      {
        name: `TBH ADV · ${addon.nome}`,
        description: addon.descrizione.slice(0, 250),
        metadata: { codice: addon.codice, tipo: "servizio-extra" },
      },
      `tbh-adv-addon-product-${addon.codice}`,
    );
    productId = prodotto.id;
  }

  let priceId = riga?.stripePriceId ?? null;
  if (priceId) {
    const esistente = await stripeGet<StripePrice>(`/prices/${priceId}`);
    if (esistente.unit_amount !== addon.prezzoCents || esistente.active === false) {
      await stripePost(`/prices/${priceId}`, { active: false }).catch(() => undefined);
      priceId = null;
    }
  }
  if (!priceId) {
    const prezzo = await stripePost<StripePrice>(
      "/prices",
      {
        currency: "eur",
        unit_amount: addon.prezzoCents,
        product: productId,
        nickname: `${addon.codice} · servizio extra`,
        metadata: { codice: addon.codice, iva_inclusa: "true" },
      },
      `tbh-adv-addon-price-${addon.codice}-${addon.prezzoCents}`,
    );
    priceId = prezzo.id;
  }

  if (riga) {
    await db
      .update(schema.advAddon)
      .set({ stripeProductId: productId, stripePriceId: priceId, aggiornatoIl: new Date() })
      .where(eq(schema.advAddon.codice, addon.codice));
  } else {
    await db.insert(schema.advAddon).values({
      codice: addon.codice,
      nome: addon.nome,
      descrizione: addon.descrizione,
      prezzoCents: addon.prezzoCents,
      attivo: 1,
      stripeProductId: productId,
      stripePriceId: priceId,
    });
  }

  return { productId, priceId };
}
