import { z } from "zod";
import { and, eq, sql } from "drizzle-orm";
import { ORPCError } from "@orpc/server";
import { base } from "../__core/app";
import { db } from "../database";
import * as schema from "../database/schema";
import { mediaServito, mediaServitoElenco } from "../lib/media-url";
import {
  CATEGORIE_PRODOTTO,
  DISPONIBILITA,
  IN_ALLESTIMENTO_NOTA,
  IN_ALLESTIMENTO_TITOLO,
  PULSANTE_STRIPE,
  PULSANTE_STRIPE_BREVE,
  PULSANTE_WHATSAPP,
  PULSANTE_WHATSAPP_BREVE,
  QUANTITA_MAX,
  STATI_PRODOTTO,
  TAGLIE_SUGGERITE,
  WHATSAPP_PREDEFINITO,
  inFinestra,
  normalizzaDisponibilita,
  normalizzaStatoProdotto,
  prodottoPubblico,
  type Prodotto,
  type VarianteProdotto,
} from "../data/prodotti-tbh";

/**
 * PRODOTTI E GADGET — servizio delle schede prodotto (specifica 16/09/2026,
 * punti 4, 5, 6 e 7).
 *
 * Il pubblico vede solo schede PUBBLICATE e dentro la finestra di date. Chi
 * amministra vede tutto, anche bozze e scadute, perché la scadenza sospende la
 * scheda ma non la cancella dall'archivio.
 *
 * Nessun prodotto, prezzo o logo scritto nel codice: la tabella parte vuota e la
 * vetrina resta "IN ALLESTIMENTO" finché Claudio non salva una scheda vera.
 */

const CODICE = () => (process.env.TBH_CODICE_ALLESTIMENTO ?? "").trim();

function controlla(codice: string) {
  const atteso = CODICE();
  if (!atteso) {
    throw new ORPCError("SERVICE_UNAVAILABLE", {
      message: "Codice di allestimento non configurato sul server (TBH_CODICE_ALLESTIMENTO).",
    });
  }
  if (codice.trim() !== atteso) {
    throw new ORPCError("UNAUTHORIZED", { message: "Codice di allestimento errato." });
  }
}

const auth = z.object({ codice: z.string().min(1).max(120) });

const dataIso = z
  .string()
  .trim()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Usa il formato AAAA-MM-GG.")
  .nullish();

function oggiIso() {
  return new Date().toISOString().slice(0, 10);
}

function testo(v: string | null | undefined, max: number) {
  const s = (v ?? "").trim();
  return s ? s.slice(0, max) : null;
}

/** Slug pulito: solo minuscole, cifre e trattini. */
function slugPulito(v: string) {
  return (
    v
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 80) || "prodotto"
  );
}

type RigaProdotto = typeof schema.prodotti.$inferSelect;
type RigaVariante = typeof schema.prodottoVarianti.$inferSelect;

function daVariante(r: RigaVariante): VarianteProdotto {
  return {
    id: r.id,
    prodottoId: r.prodottoId,
    colore: r.colore ?? null,
    taglia: r.taglia ?? null,
    codice: r.codice ?? null,
    prezzoCents: r.prezzoCents ?? null,
    prezzoPromoCents: r.prezzoPromoCents ?? null,
    prezzoFidelityCents: r.prezzoFidelityCents ?? null,
    stripeLink: r.stripeLink ?? null,
    stripePriceId: r.stripePriceId ?? null,
    immagineUrl: mediaServito(r.immagineUrl),
    disponibilita: normalizzaDisponibilita(r.disponibilita),
    ordine: r.ordine,
  };
}

function daProdotto(r: RigaProdotto, varianti: RigaVariante[]): Prodotto {
  return {
    id: r.id,
    slug: r.slug,
    nome: r.nome,
    codice: r.codice ?? null,
    categoria: r.categoria ?? null,
    stato: normalizzaStatoProdotto(r.stato),
    logoUrl: mediaServito(r.logoUrl),
    descrizione: r.descrizione ?? null,
    galleriaUrl: mediaServitoElenco(r.galleriaUrl),
    prezzoCents: r.prezzoCents ?? null,
    prezzoPromoCents: r.prezzoPromoCents ?? null,
    prezzoFidelityCents: r.prezzoFidelityCents ?? null,
    disponibilita: normalizzaDisponibilita(r.disponibilita),
    tempiConsegna: r.tempiConsegna ?? null,
    personalizzabile: r.personalizzabile !== 0,
    etichettaPersonalizzazione: r.etichettaPersonalizzazione ?? null,
    caricaLogoCliente: r.caricaLogoCliente !== 0,
    stripeLink: r.stripeLink ?? null,
    stripePriceId: r.stripePriceId ?? null,
    whatsappNumero: r.whatsappNumero ?? null,
    quantitaMin: Math.max(1, r.quantitaMin),
    quantitaMax: Math.min(QUANTITA_MAX, Math.max(1, r.quantitaMax)),
    dal: r.dal ?? null,
    al: r.al ?? null,
    ordine: r.ordine,
    varianti: varianti
      .filter((v) => v.prodottoId === r.id)
      .sort((a, b) => a.ordine - b.ordine || a.id - b.id)
      .map(daVariante),
  };
}

async function leggiTutto() {
  const [righe, varianti] = await Promise.all([
    db.select().from(schema.prodotti),
    db.select().from(schema.prodottoVarianti),
  ]);
  return righe
    .sort((a, b) => b.ordine - a.ordine || a.nome.localeCompare(b.nome, "it"))
    .map((r) => daProdotto(r, varianti));
}

/** Conteggi reali per prodotto: righe vere in `prodotto_eventi`. */
async function conteggi() {
  const righe = await db
    .select({
      prodottoId: schema.prodottoEventi.prodottoId,
      tipo: schema.prodottoEventi.tipo,
      totale: sql<number>`count(*)`,
    })
    .from(schema.prodottoEventi)
    .groupBy(schema.prodottoEventi.prodottoId, schema.prodottoEventi.tipo);
  const mappa = new Map<string, number>();
  for (const r of righe) mappa.set(`${r.prodottoId}:${r.tipo}`, Number(r.totale));
  return (id: number, tipo: string) => mappa.get(`${id}:${tipo}`) ?? 0;
}

/** Ordini reali collegati alla scheda. */
async function ordiniPerProdotto() {
  const righe = await db
    .select({
      prodottoId: schema.orders.prodottoId,
      totale: sql<number>`count(*)`,
    })
    .from(schema.orders)
    .groupBy(schema.orders.prodottoId);
  const mappa = new Map<number, number>();
  for (const r of righe) if (r.prodottoId) mappa.set(r.prodottoId, Number(r.totale));
  return (id: number) => mappa.get(id) ?? 0;
}

const OPZIONI = {
  categorie: [...CATEGORIE_PRODOTTO],
  stati: STATI_PRODOTTO,
  disponibilita: DISPONIBILITA,
  taglie: [...TAGLIE_SUGGERITE],
  whatsappPredefinito: WHATSAPP_PREDEFINITO,
  quantitaMax: QUANTITA_MAX,
  testiPulsante: {
    stripe: PULSANTE_STRIPE,
    stripeBreve: PULSANTE_STRIPE_BREVE,
    whatsapp: PULSANTE_WHATSAPP,
    whatsappBreve: PULSANTE_WHATSAPP_BREVE,
  },
  inAllestimento: { titolo: IN_ALLESTIMENTO_TITOLO, nota: IN_ALLESTIMENTO_NOTA },
};

/* ════════════════════════ SERVIZIO PUBBLICO ════════════════════════ */

export const prodotti = {
  /** Vetrina pubblica: solo schede pubblicate e dentro la finestra di date. */
  vetrina: base.handler(async () => {
    const oggi = oggiIso();
    const tutti = await leggiTutto();
    const vetrina = tutti.filter((p) => prodottoPubblico(p.stato) && inFinestra(p, oggi));
    return {
      oggi,
      prodotti: vetrina,
      /** Quante schede esistono in tutto: serve a spiegare una vetrina vuota. */
      totaleArchivio: tutti.length,
      stripeConfigurato: Boolean(process.env.STRIPE_SECRET_KEY),
      ...OPZIONI,
    };
  }),

  /** Una scheda sola. Null = non esiste o non è pubblica: la pagina scrive IN ALLESTIMENTO. */
  scheda: base
    .input(z.object({ slug: z.string().trim().min(1).max(120) }))
    .handler(async ({ input }) => {
      const oggi = oggiIso();
      const tutti = await leggiTutto();
      const p = tutti.find((x) => x.slug === input.slug) ?? null;
      const visibile = p && prodottoPubblico(p.stato) && inFinestra(p, oggi);
      return {
        oggi,
        prodotto: visibile ? p : null,
        stripeConfigurato: Boolean(process.env.STRIPE_SECRET_KEY),
        ...OPZIONI,
      };
    }),

  /** Vista, click, apertura WhatsApp, avvio Stripe: righe vere, nessuna stima. */
  traccia: base
    .input(
      z.object({
        prodottoId: z.number().int().positive(),
        tipo: z.enum(["vista", "click", "whatsapp", "stripe"]),
        varianteId: z.number().int().positive().nullish(),
        dispositivo: z.enum(["mobile", "tablet", "desktop"]).nullish(),
      }),
    )
    .handler(async ({ input }) => {
      await db.insert(schema.prodottoEventi).values({
        prodottoId: input.prodottoId,
        tipo: input.tipo,
        varianteId: input.varianteId ?? null,
        dispositivo: input.dispositivo ?? null,
      });
      return { registrato: true };
    }),
};

/* ════════════════════════ PANNELLO AMMINISTRATORE ════════════════════════ */

const variante = z.object({
  id: z.number().int().positive().nullish(),
  colore: z.string().trim().max(80).nullish(),
  taglia: z.string().trim().max(40).nullish(),
  codice: z.string().trim().max(60).nullish(),
  prezzoCents: z.number().int().min(0).max(100000000).nullish(),
  prezzoPromoCents: z.number().int().min(0).max(100000000).nullish(),
  prezzoFidelityCents: z.number().int().min(0).max(100000000).nullish(),
  stripeLink: z.string().trim().max(500).nullish(),
  stripePriceId: z.string().trim().max(120).nullish(),
  immagineUrl: z.string().trim().max(500).nullish(),
  disponibilita: z
    .enum(["disponibile", "su_ordinazione", "esaurito", "in_allestimento"])
    .default("in_allestimento"),
  ordine: z.number().int().min(0).max(9999).default(0),
});

const scheda = z.object({
  id: z.number().int().positive().nullish(),
  slug: z.string().trim().max(120).nullish(),
  nome: z.string().trim().min(2).max(200),
  codice: z.string().trim().max(60).nullish(),
  categoria: z.string().trim().max(60).nullish(),
  stato: z.enum(["bozza", "pubblicato", "sospeso"]).default("bozza"),
  /** Solo loghi originali caricati: l'indirizzo arriva dall'upload o da Claudio. */
  logoUrl: z.string().trim().max(500).nullish(),
  descrizione: z.string().trim().max(2000).nullish(),
  /** Galleria: più indirizzi (immagini e video), uno per riga o per virgola. */
  galleriaUrl: z.string().trim().max(3000).nullish(),
  prezzoCents: z.number().int().min(0).max(100000000).nullish(),
  prezzoPromoCents: z.number().int().min(0).max(100000000).nullish(),
  prezzoFidelityCents: z.number().int().min(0).max(100000000).nullish(),
  disponibilita: z
    .enum(["disponibile", "su_ordinazione", "esaurito", "in_allestimento"])
    .default("in_allestimento"),
  tempiConsegna: z.string().trim().max(300).nullish(),
  personalizzabile: z.boolean().default(false),
  etichettaPersonalizzazione: z.string().trim().max(120).nullish(),
  caricaLogoCliente: z.boolean().default(false),
  stripeLink: z.string().trim().max(500).nullish(),
  stripePriceId: z.string().trim().max(120).nullish(),
  whatsappNumero: z.string().trim().max(40).nullish(),
  quantitaMin: z.number().int().min(1).max(QUANTITA_MAX).default(1),
  quantitaMax: z.number().int().min(1).max(QUANTITA_MAX).default(20),
  dal: dataIso,
  al: dataIso,
  ordine: z.number().int().min(0).max(9999).default(0),
  varianti: z.array(variante).max(60).default([]),
});

export const prodottiAdmin = {
  stato: base.input(auth.partial()).handler(({ input }) => {
    const configurato = CODICE().length > 0;
    return {
      configurato,
      valido: configurato && (input.codice ?? "").trim() === CODICE(),
      stripeConfigurato: Boolean(process.env.STRIPE_SECRET_KEY),
    };
  }),

  /** Tutto l'archivio, con viste, click e ordini reali per ogni scheda. */
  elenco: base.input(auth).handler(async ({ input }) => {
    controlla(input.codice);
    const oggi = oggiIso();
    const [tutti, per, ordini] = await Promise.all([leggiTutto(), conteggi(), ordiniPerProdotto()]);
    return {
      oggi,
      stripeConfigurato: Boolean(process.env.STRIPE_SECRET_KEY),
      ...OPZIONI,
      prodotti: tutti.map((p) => ({
        ...p,
        viste: per(p.id, "vista"),
        click: per(p.id, "click"),
        aperture: per(p.id, "whatsapp") + per(p.id, "stripe"),
        ordini: ordini(p.id),
        /** true = si vede adesso sul sito pubblico. */
        inVetrina: prodottoPubblico(p.stato) && inFinestra(p, oggi),
        /** true = finestra chiusa: sospesa da sola, resta in archivio. */
        scaduta: Boolean(p.al && oggi > p.al),
      })),
    };
  }),

  salva: base.input(auth.extend({ prodotto: scheda })).handler(async ({ input }) => {
    controlla(input.codice);
    const p = input.prodotto;

    const categoriaScritta = testo(p.categoria, 60);
    const categoria =
      categoriaScritta && (CATEGORIE_PRODOTTO as readonly string[]).includes(categoriaScritta)
        ? categoriaScritta
        : null;

    const base_ = {
      nome: p.nome,
      codice: testo(p.codice, 60),
      categoria,
      stato: p.stato,
      logoUrl: testo(p.logoUrl, 500),
      descrizione: testo(p.descrizione, 2000),
      galleriaUrl: testo(p.galleriaUrl, 3000),
      prezzoCents: p.prezzoCents ?? null,
      prezzoPromoCents: p.prezzoPromoCents ?? null,
      prezzoFidelityCents: p.prezzoFidelityCents ?? null,
      disponibilita: p.disponibilita,
      tempiConsegna: testo(p.tempiConsegna, 300),
      personalizzabile: p.personalizzabile ? 1 : 0,
      etichettaPersonalizzazione: testo(p.etichettaPersonalizzazione, 120),
      caricaLogoCliente: p.caricaLogoCliente ? 1 : 0,
      stripeLink: testo(p.stripeLink, 500),
      stripePriceId: testo(p.stripePriceId, 120),
      whatsappNumero: testo(p.whatsappNumero, 40),
      quantitaMin: p.quantitaMin,
      quantitaMax: Math.max(p.quantitaMin, p.quantitaMax),
      dal: testo(p.dal, 10),
      al: testo(p.al, 10),
      ordine: p.ordine,
      updatedAt: new Date(),
    };

    let id = p.id ?? 0;
    if (id) {
      const slug = testo(p.slug, 120);
      await db
        .update(schema.prodotti)
        .set(slug ? { ...base_, slug: slugPulito(slug) } : base_)
        .where(eq(schema.prodotti.id, id));
    } else {
      // Slug unico: se esiste già si aggiunge un numero, senza sovrascrivere nulla.
      const presi = new Set((await db.select({ slug: schema.prodotti.slug }).from(schema.prodotti)).map((r) => r.slug));
      let slug = slugPulito(testo(p.slug, 120) ?? p.nome);
      let n = 2;
      while (presi.has(slug)) slug = `${slugPulito(testo(p.slug, 120) ?? p.nome)}-${n++}`;
      const [riga] = await db
        .insert(schema.prodotti)
        .values({ ...base_, slug })
        .returning();
      id = riga!.id;
    }

    // Varianti: si riscrive l'elenco della scheda, una riga per variante.
    await db.delete(schema.prodottoVarianti).where(eq(schema.prodottoVarianti.prodottoId, id));
    if (p.varianti.length) {
      await db.insert(schema.prodottoVarianti).values(
        p.varianti.map((v, i) => ({
          prodottoId: id,
          colore: testo(v.colore, 80),
          taglia: testo(v.taglia, 40),
          codice: testo(v.codice, 60),
          prezzoCents: v.prezzoCents ?? null,
          prezzoPromoCents: v.prezzoPromoCents ?? null,
          prezzoFidelityCents: v.prezzoFidelityCents ?? null,
          stripeLink: testo(v.stripeLink, 500),
          stripePriceId: testo(v.stripePriceId, 120),
          immagineUrl: testo(v.immagineUrl, 500),
          disponibilita: v.disponibilita,
          ordine: v.ordine || i,
        })),
      );
    }

    const riga = (await db.select().from(schema.prodotti).where(eq(schema.prodotti.id, id)))[0];
    return { id, slug: riga?.slug ?? null, creata: !p.id };
  }),

  /** Duplica una scheda: copia in BOZZA, così l'originale resta intatto. */
  duplica: base
    .input(auth.extend({ id: z.number().int().positive() }))
    .handler(async ({ input }) => {
      controlla(input.codice);
      const riga = (
        await db.select().from(schema.prodotti).where(eq(schema.prodotti.id, input.id))
      )[0];
      if (!riga) throw new ORPCError("NOT_FOUND", { message: "Scheda non trovata." });
      const presi = new Set(
        (await db.select({ slug: schema.prodotti.slug }).from(schema.prodotti)).map((r) => r.slug),
      );
      let slug = `${riga.slug}-copia`;
      let n = 2;
      while (presi.has(slug)) slug = `${riga.slug}-copia-${n++}`;

      const { id: _vecchio, createdAt: _c, updatedAt: _u, ...resto } = riga;
      const [nuova] = await db
        .insert(schema.prodotti)
        .values({ ...resto, slug, nome: `${riga.nome} (copia)`, stato: "bozza" })
        .returning();
      const varianti = await db
        .select()
        .from(schema.prodottoVarianti)
        .where(eq(schema.prodottoVarianti.prodottoId, input.id));
      if (varianti.length) {
        await db.insert(schema.prodottoVarianti).values(
          varianti.map(({ id: _i, prodottoId: _p, ...v }) => ({ ...v, prodottoId: nuova!.id })),
        );
      }
      return { id: nuova!.id, slug };
    }),

  elimina: base
    .input(auth.extend({ id: z.number().int().positive() }))
    .handler(async ({ input }) => {
      controlla(input.codice);
      await db.delete(schema.prodottoVarianti).where(eq(schema.prodottoVarianti.prodottoId, input.id));
      await db.delete(schema.prodotti).where(eq(schema.prodotti.id, input.id));
      return { eliminata: true };
    }),

  /** Ultimi eventi reali e ultimi ordini: nessun numero inventato. */
  eventi: base.input(auth).handler(async ({ input }) => {
    controlla(input.codice);
    const [eventi, ordini] = await Promise.all([
      db
        .select()
        .from(schema.prodottoEventi)
        .orderBy(sql`${schema.prodottoEventi.createdAt} desc`)
        .limit(200),
      db
        .select()
        .from(schema.orders)
        .where(and(sql`${schema.orders.prodottoId} is not null`))
        .orderBy(sql`${schema.orders.createdAt} desc`)
        .limit(100),
    ]);
    return { eventi, ordini };
  }),
};
