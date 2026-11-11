import { and, eq } from "drizzle-orm";
import { db } from "../database";
import * as schema from "../database/schema";
import { PRODUCTS } from "../data/catalog";
import { eventoCatalogo, type VarianteStripe } from "../data/stripe-catalogo";
import { ErroreStripe, firmaWebhookValida, stripeGetCon } from "./stripe";
import { dimenticaCatalogo } from "./catalogo-touch-plaza";
import { accountConfigurati, modalitaChiave, rigaStato, trovaAccount, type AccountStripe } from "./stripe-account";

/**
 * SINCRONIZZAZIONE STRIPE → TOUCH PLAZA (03/10/2026).
 *
 *  1. Prima importazione: Product + Price attivi + Payment Link di ogni account autorizzato.
 *  2. Poi in automatico: webhook firmato (creazioni, modifiche, archiviazioni).
 *  3. Riconciliazione periodica: alla lettura del negozio, se l'ultima sync è vecchia,
 *     ne parte una in sottofondo; dal pannello c'è «Sincronizza ora».
 *
 * Chiave unica per la scheda: (account, Product ID). Un evento ripetuto non crea doppioni
 * (tabella stripe_eventi) e la stessa scheda non nasce due volte (indice unico).
 * La sync scrive SOLO i campi commerciali: testo, categoria, immagini aggiuntive,
 * condizioni e IVA confermata restano quelli del sito.
 */

type ProdottoApi = {
  id: string;
  name: string;
  description: string | null;
  images: string[];
  active: boolean;
  livemode: boolean;
};

type PrezzoApi = {
  id: string;
  active: boolean;
  currency: string;
  unit_amount: number | null;
  type: "one_time" | "recurring";
  recurring: { interval: VarianteStripe["intervallo"]; interval_count: number } | null;
  nickname: string | null;
  product: string | { id: string };
};

type LinkApi = { id: string; url: string; active: boolean };
type RigaLinkApi = { price: { id: string } | null; quantity: number | null };
type Lista<T> = { data: T[]; has_more: boolean };

/** Ogni ora di differenza oltre questa soglia fa partire la riconciliazione. */
const RICONCILIA_DOPO_MS = 6 * 60 * 60 * 1000;
const LINK_VALIDI_MS = 5 * 60 * 1000;

async function elencaTutti<T extends { id: string }>(key: string, percorso: string): Promise<T[]> {
  const out: T[] = [];
  let dopo: string | null = null;
  for (let pagina = 0; pagina < 50; pagina += 1) {
    const sep = percorso.includes("?") ? "&" : "?";
    const url: string = `${percorso}${sep}limit=100${dopo ? `&starting_after=${dopo}` : ""}`;
    const lista: Lista<T> = await stripeGetCon<Lista<T>>(key, url);
    out.push(...lista.data);
    if (!lista.has_more || lista.data.length === 0) break;
    dopo = lista.data[lista.data.length - 1].id;
  }
  return out;
}

/* ───────────────────────── Payment Link → Price ───────────────────────── */

type MappaLink = Map<string, { url: string; id: string }>;
const cacheLink = new Map<string, { quando: number; mappa: MappaLink }>();

export function dimenticaLink(account: string) {
  cacheLink.delete(account);
}

/**
 * Price ID → Payment Link. Vale solo un link ATTIVO con UNA SOLA riga: un link che
 * contiene più articoli non viene usato, perché legherebbe articoli diversi allo stesso
 * pagamento. Se lo stesso prezzo ha più link, vale il più vecchio (ordine stabile).
 */
async function mappaLink(acc: AccountStripe): Promise<MappaLink> {
  const c = cacheLink.get(acc.nome);
  if (c && Date.now() - c.quando < LINK_VALIDI_MS) return c.mappa;

  const link = (await elencaTutti<LinkApi>(acc.chiave, "/payment_links?active=true")).reverse();
  const mappa: MappaLink = new Map();
  for (let i = 0; i < link.length; i += 5) {
    const gruppo = link.slice(i, i + 5);
    const righe = await Promise.all(
      gruppo.map((l) =>
        stripeGetCon<Lista<RigaLinkApi>>(acc.chiave, `/payment_links/${l.id}/line_items?limit=10`),
      ),
    );
    gruppo.forEach((l, j) => {
      const r = righe[j].data;
      if (r.length !== 1 || !r[0].price) return;
      if (!mappa.has(r[0].price.id)) mappa.set(r[0].price.id, { url: l.url, id: l.id });
    });
  }
  cacheLink.set(acc.nome, { quando: Date.now(), mappa });
  return mappa;
}

/* ───────────────────────────── utilità ───────────────────────────── */

function normalizzaUrl(u: string) {
  return u.trim().replace(/[?#].*$/, "").replace(/\/+$/, "").toLowerCase();
}

function slugDa(nome: string) {
  return (
    nome
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60) || "articolo"
  );
}

/** Slug fissato alla prima importazione, unico fra listino del sito e schede Stripe. */
async function slugUnico(nome: string, productId: string) {
  const base = slugDa(nome);
  const occupati = new Set(PRODUCTS.map((p) => p.slug));
  for (const r of await db.select({ slug: schema.stripeProdotti.slug }).from(schema.stripeProdotti))
    occupati.add(r.slug);
  if (!occupati.has(base)) return base;
  const coda = productId.replace(/^prod_/, "").slice(-6).toLowerCase();
  const conCoda = `${base}-${coda}`;
  if (!occupati.has(conCoda)) return conCoda;
  return `${base}-${productId.toLowerCase()}`;
}

function idProdotto(p: PrezzoApi["product"]) {
  return typeof p === "string" ? p : p.id;
}

function variantiDa(prezzi: PrezzoApi[], mappa: MappaLink): VarianteStripe[] {
  return prezzi
    .filter((p) => p.active)
    .sort((a, b) => (a.unit_amount ?? 0) - (b.unit_amount ?? 0))
    .map((p) => ({
      priceId: p.id,
      nome: p.nickname?.trim() || null,
      importoCents: p.unit_amount,
      valuta: p.currency,
      tipo: p.type === "recurring" ? "ricorrente" : "una-tantum",
      intervallo: p.recurring?.interval ?? null,
      intervalloConteggio: p.recurring?.interval_count ?? null,
      paymentLink: mappa.get(p.id)?.url ?? null,
      paymentLinkId: mappa.get(p.id)?.id ?? null,
    }));
}

/**
 * Scheda del sito già esistente che usa uno dei Payment Link di questo Product:
 * la sync la AGGANCIA invece di crearne una nuova (niente doppioni). È il caso della
 * Visita Medica Marshall Motorsport, inserita a mano col suo link.
 */
async function schedaSitoDaLink(varianti: VarianteStripe[], escludiId: number | null) {
  const link = new Set(varianti.map((v) => v.paymentLink).filter(Boolean).map((u) => normalizzaUrl(u!)));
  if (!link.size) return null;
  const trovata = PRODUCTS.find((p) => p.checkout?.stripe && link.has(normalizzaUrl(p.checkout.stripe)));
  if (!trovata) return null;
  const [gia] = await db
    .select({ id: schema.stripeProdotti.id })
    .from(schema.stripeProdotti)
    .where(eq(schema.stripeProdotti.slugSito, trovata.slug));
  if (gia && gia.id !== escludiId) return null;
  return trovata.slug;
}

/* ───────────────────────────── scrittura ───────────────────────────── */

type Esito = "creato" | "aggiornato" | "archiviato" | "ignorato";

async function salvaProdotto(
  acc: AccountStripe,
  prodotto: ProdottoApi,
  prezzi: PrezzoApi[],
  mappa: MappaLink,
): Promise<{ esito: Esito; slug: string | null }> {
  const [esistente] = await db
    .select()
    .from(schema.stripeProdotti)
    .where(
      and(
        eq(schema.stripeProdotti.account, acc.nome),
        eq(schema.stripeProdotti.stripeProductId, prodotto.id),
      ),
    );

  // Un Product già archiviato su Stripe non diventa una scheda nuova.
  if (!esistente && !prodotto.active) return { esito: "ignorato", slug: null };
  dimenticaCatalogo();

  const varianti = prodotto.active ? variantiDa(prezzi, mappa) : [];
  const commerciali = {
    nome: prodotto.name,
    descrizione: prodotto.description?.trim() || null,
    immagini: JSON.stringify(prodotto.images ?? []),
    prezzi: JSON.stringify(varianti),
    attivo: prodotto.active ? 1 : 0,
    livemode: prodotto.livemode ? 1 : 0,
    ultimaSync: new Date(),
    errore: null as string | null,
  };

  if (esistente) {
    const slugSito = esistente.slugSito ?? (await schedaSitoDaLink(varianti, esistente.id));
    await db
      .update(schema.stripeProdotti)
      .set({ ...commerciali, slugSito })
      .where(eq(schema.stripeProdotti.id, esistente.id));
    return { esito: prodotto.active ? "aggiornato" : "archiviato", slug: esistente.slug };
  }

  const slug = await slugUnico(prodotto.name, prodotto.id);
  const slugSito = await schedaSitoDaLink(varianti, null);
  await db
    .insert(schema.stripeProdotti)
    .values({ account: acc.nome, stripeProductId: prodotto.id, slug, slugSito, ...commerciali })
    .onConflictDoUpdate({
      target: [schema.stripeProdotti.account, schema.stripeProdotti.stripeProductId],
      set: commerciali,
    });
  dimenticaCatalogo();
  return { esito: "creato", slug };
}

async function archivia(account: string, productId: string) {
  dimenticaCatalogo();
  await db
    .update(schema.stripeProdotti)
    .set({ attivo: 0, prezzi: "[]", ultimaSync: new Date(), errore: null })
    .where(
      and(eq(schema.stripeProdotti.account, account), eq(schema.stripeProdotti.stripeProductId, productId)),
    );
  return { esito: "archiviato" as const, slug: null };
}

/** Rilegge da Stripe UN Product (con prezzi e link) e aggiorna la sua scheda. */
export async function sincronizzaProdotto(acc: AccountStripe, productId: string) {
  let prodotto: ProdottoApi;
  try {
    prodotto = await stripeGetCon<ProdottoApi>(acc.chiave, `/products/${encodeURIComponent(productId)}`);
  } catch (e) {
    if (e instanceof ErroreStripe && /no such product/i.test(e.message)) return archivia(acc.nome, productId);
    throw e;
  }
  const prezzi = prodotto.active
    ? await elencaTutti<PrezzoApi>(acc.chiave, `/prices?active=true&product=${encodeURIComponent(productId)}`)
    : [];
  return salvaProdotto(acc, prodotto, prezzi, await mappaLink(acc));
}

/* ───────────────────────────── sync completa ───────────────────────────── */

const inCorso = new Map<string, Promise<RisultatoSync>>();

export type RisultatoSync = {
  account: string;
  ok: boolean;
  creati: number;
  aggiornati: number;
  archiviati: number;
  errore: string | null;
};

async function eseguiSync(acc: AccountStripe): Promise<RisultatoSync> {
  const r: RisultatoSync = { account: acc.nome, ok: true, creati: 0, aggiornati: 0, archiviati: 0, errore: null };
  await rigaStato(acc.nome, acc.origine);
  try {
    dimenticaLink(acc.nome);
    const [prodotti, prezzi, mappa] = await Promise.all([
      elencaTutti<ProdottoApi>(acc.chiave, "/products"),
      elencaTutti<PrezzoApi>(acc.chiave, "/prices?active=true"),
      mappaLink(acc),
    ]);
    const perProdotto = new Map<string, PrezzoApi[]>();
    for (const p of prezzi) {
      const id = idProdotto(p.product);
      perProdotto.set(id, [...(perProdotto.get(id) ?? []), p]);
    }
    const visti = new Set<string>();
    for (const p of prodotti) {
      visti.add(p.id);
      try {
        const e = await salvaProdotto(acc, p, perProdotto.get(p.id) ?? [], mappa);
        if (e.esito === "creato") r.creati += 1;
        if (e.esito === "aggiornato") r.aggiornati += 1;
        if (e.esito === "archiviato") r.archiviati += 1;
      } catch (err) {
        await db
          .update(schema.stripeProdotti)
          .set({ errore: (err as Error).message })
          .where(
            and(eq(schema.stripeProdotti.account, acc.nome), eq(schema.stripeProdotti.stripeProductId, p.id)),
          );
      }
    }
    // Product cancellati del tutto da Stripe: escono dalla vendita.
    const nostri = await db.select().from(schema.stripeProdotti).where(eq(schema.stripeProdotti.account, acc.nome));
    for (const n of nostri) {
      if (!visti.has(n.stripeProductId) && n.attivo === 1) {
        await archivia(acc.nome, n.stripeProductId);
        r.archiviati += 1;
      }
    }
    await db
      .update(schema.stripeAccount)
      .set({ ultimaSync: new Date(), ultimoErrore: null, livemode: modalitaChiave(acc.chiave) === "live" ? 1 : 0 })
      .where(eq(schema.stripeAccount.nome, acc.nome));
  } catch (err) {
    r.ok = false;
    r.errore = (err as Error).message;
    await db
      .update(schema.stripeAccount)
      .set({ ultimoErrore: r.errore })
      .where(eq(schema.stripeAccount.nome, acc.nome));
  }
  return r;
}

/** Una sola sync alla volta per account: le richieste concorrenti aspettano la stessa. */
export function sincronizzaAccount(acc: AccountStripe) {
  const gia = inCorso.get(acc.nome);
  if (gia) return gia;
  const p = eseguiSync(acc).finally(() => inCorso.delete(acc.nome));
  inCorso.set(acc.nome, p);
  return p;
}

export async function sincronizzaTutti(soloAccount?: string) {
  const account = (await accountConfigurati()).filter((a) => !soloAccount || a.nome === soloAccount);
  return Promise.all(account.map((a) => sincronizzaAccount(a)));
}

/**
 * RICONCILIAZIONE PERIODICA — il sito non ha un orologio di sistema: la lettura del negozio
 * controlla l'età dell'ultima sync e, se supera le 6 ore, ne avvia una in sottofondo.
 * La pagina non aspetta: vede i dati attuali, la prossima lettura quelli aggiornati.
 */
let ultimoControllo = 0;
export function riconciliaSeServe() {
  if (Date.now() - ultimoControllo < 60_000) return;
  ultimoControllo = Date.now();
  void (async () => {
    try {
      const account = await accountConfigurati();
      if (!account.length) return;
      const stati = await db.select().from(schema.stripeAccount);
      for (const a of account) {
        const s = stati.find((x) => x.nome === a.nome);
        const eta = s?.ultimaSync ? Date.now() - s.ultimaSync.getTime() : Infinity;
        if (eta > RICONCILIA_DOPO_MS) void sincronizzaAccount(a);
      }
    } catch {
      /* la riconciliazione non deve mai rompere la lettura del negozio */
    }
  })();
}

/* ───────────────────────────── webhook ───────────────────────────── */

type EventoStripe = {
  id: string;
  type: string;
  data: { object: Record<string, unknown> & { id?: string } };
};

/** Prodotti da rileggere per un evento del catalogo. */
async function prodottiDaEvento(acc: AccountStripe, evento: EventoStripe): Promise<string[]> {
  const o = evento.data?.object ?? {};
  if (evento.type.startsWith("product.")) return o.id ? [String(o.id)] : [];
  if (evento.type.startsWith("price.")) {
    const p = o.product as PrezzoApi["product"] | undefined;
    return p ? [idProdotto(p)] : [];
  }
  if (evento.type.startsWith("payment_link.")) {
    dimenticaLink(acc.nome);
    const ids = new Set<string>();
    // I prodotti che oggi usano quel link (serve quando il link viene disattivato)…
    const nostri = await db.select().from(schema.stripeProdotti).where(eq(schema.stripeProdotti.account, acc.nome));
    for (const n of nostri) {
      const v = JSON.parse(n.prezzi || "[]") as VarianteStripe[];
      if (v.some((x) => x.paymentLinkId === o.id)) ids.add(n.stripeProductId);
    }
    // …e quelli che il link contiene adesso.
    if (o.id) {
      const righe = await stripeGetCon<Lista<RigaLinkApi>>(acc.chiave, `/payment_links/${o.id}/line_items?limit=10`);
      const prezzi = await Promise.all(
        righe.data.filter((r) => r.price).map((r) => stripeGetCon<PrezzoApi>(acc.chiave, `/prices/${r.price!.id}`)),
      );
      for (const p of prezzi) ids.add(idProdotto(p.product));
    }
    return [...ids];
  }
  return [];
}

/**
 * Elabora un evento del catalogo GIÀ VERIFICATO. Ogni evento si elabora una volta sola:
 * se arriva di nuovo (Stripe ritenta), risponde «già elaborato». Se l'elaborazione fallisce
 * l'evento non resta segnato, così Stripe lo rimanda.
 */
export async function gestisciEventoCatalogo(nomeAccount: string, evento: EventoStripe) {
  if (!eventoCatalogo(evento.type)) return { esito: "evento-non-del-catalogo" };
  const acc = await trovaAccount(nomeAccount);
  if (!acc) return { esito: "account-non-configurato" };

  const [nuovo] = await db
    .insert(schema.stripeEventi)
    .values({ eventId: evento.id, account: acc.nome, tipo: evento.type, esito: "in-corso" })
    .onConflictDoNothing()
    .returning();
  if (!nuovo) return { esito: "gia-elaborato" };

  try {
    const esiti: string[] = [];
    if (evento.type === "product.deleted" && evento.data?.object?.id) {
      esiti.push((await archivia(acc.nome, String(evento.data.object.id))).esito);
    } else {
      for (const id of await prodottiDaEvento(acc, evento)) esiti.push((await sincronizzaProdotto(acc, id)).esito);
    }
    const esito = esiti.join(",") || "nessun-prodotto";
    await db.update(schema.stripeEventi).set({ esito }).where(eq(schema.stripeEventi.eventId, evento.id));
    return { esito };
  } catch (err) {
    await db.delete(schema.stripeEventi).where(eq(schema.stripeEventi.eventId, evento.id));
    throw err;
  }
}

/** Handler HTTP di POST /api/webhooks/stripe-catalogo/:account (un segreto per account). */
export async function webhookCatalogo(nomeAccount: string, corpo: string, firma: string | null) {
  const acc = await trovaAccount(nomeAccount);
  if (!acc) return { stato: 404 as const, corpo: { errore: "Account Stripe non collegato." } };
  if (!acc.segretoWebhook)
    return { stato: 503 as const, corpo: { errore: "Segreto webhook non configurato per questo account." } };
  if (!(await firmaWebhookValida(corpo, firma, acc.segretoWebhook)))
    return { stato: 400 as const, corpo: { errore: "Firma Stripe non valida." } };

  let evento: EventoStripe;
  try {
    evento = JSON.parse(corpo) as EventoStripe;
  } catch {
    return { stato: 400 as const, corpo: { errore: "Corpo non leggibile." } };
  }
  try {
    return { stato: 200 as const, corpo: { ricevuto: true, ...(await gestisciEventoCatalogo(acc.nome, evento)) } };
  } catch (err) {
    return { stato: 500 as const, corpo: { errore: (err as Error).message } };
  }
}
