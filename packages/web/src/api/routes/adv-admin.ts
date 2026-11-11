import { z } from "zod";
import { desc, eq } from "drizzle-orm";
import { ORPCError } from "@orpc/server";
import { base } from "../__core/app";
import { db } from "../database";
import * as schema from "../database/schema";
import { STATI_PRATICA } from "../data/adv-tv";
import {
  addonAdv,
  assicuraPrezzoAddonStripe,
  assicuraPrezzoStripe,
  listinoAdv,
  registraEvento,
} from "../lib/adv";
import { modalitaStripe, segretoWebhook, stripeConfigurato } from "../lib/stripe";

/**
 * ADMIN → SHOP → TV & STREAMING ADV (specifica di Claudio del 15/09/2026).
 *
 * Da qui si cambia tutto senza toccare il codice: prezzo pieno, promo con date, prezzo
 * Fidelity, disponibilità, servizi extra, registro dei clienti fidelizzati, stato delle
 * pratiche, cashback e report.
 *
 * Accesso con lo stesso codice del pannello di allestimento (TBH_CODICE_ALLESTIMENTO):
 * qui è protetta anche la lettura, perché sono dati di clienti e di incassi.
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
  .optional()
  .nullable();

function testo(v: string | null | undefined, max: number) {
  const s = (v ?? "").trim();
  return s ? s.slice(0, max) : null;
}

export const advAdmin = {
  stato: base.input(auth.partial()).handler(({ input }) => {
    const configurato = CODICE().length > 0;
    const valido = configurato && (input.codice ?? "").trim() === CODICE();
    return {
      configurato,
      valido,
      stripeConfigurato: stripeConfigurato(),
      modalita: modalitaStripe(),
      webhookConfigurato: Boolean(segretoWebhook()),
      stati: STATI_PRATICA,
    };
  }),

  /** Listino come lo vede l'amministratore: valori in vigore + collegamenti Stripe. */
  listino: base.input(auth).handler(async ({ input }) => {
    controlla(input.codice);
    const pacchetti = await listinoAdv();
    const righe = await db.select().from(schema.advListino);
    const perSlug = new Map(righe.map((r) => [r.slug, r]));
    return {
      pacchetti: pacchetti.map((p) => {
        const r = perSlug.get(p.slug);
        return {
          slug: p.slug,
          sku: p.sku,
          titolo: p.titolo,
          descrizione: p.descrizione,
          pienoCents: p.pienoCents,
          promoCents: p.promoCents,
          promoDal: p.promoDal,
          promoAl: p.promoAl,
          fidelityCents: p.fidelityCents,
          ivaAliquota: p.ivaAliquota,
          disponibile: p.disponibile,
          cashbackPercento: p.cashbackPercento,
          promoAttiva: p.promoAttiva,
          daPannello: p.daPannello,
          immagineUrl: r?.immagineUrl ?? null,
          stripeProductId: r?.stripeProductId ?? null,
          stripePricePieno: r?.stripePricePieno ?? null,
          stripePricePromo: r?.stripePricePromo ?? null,
          stripePriceFidelity: r?.stripePriceFidelity ?? null,
        };
      }),
      addon: await addonAdv(false),
    };
  }),

  /** Salva prezzi, finestra promozionale, disponibilità e cashback di un pacchetto. */
  salvaPacchetto: base
    .input(
      auth.extend({
        slug: z.string().trim().max(60),
        titolo: z.string().trim().max(120).optional(),
        descrizione: z.string().trim().max(1200).optional(),
        immagineUrl: z.string().trim().max(400).optional().nullable(),
        pienoCents: z.number().int().min(0).max(100_000_000),
        promoCents: z.number().int().min(0).max(100_000_000).optional().nullable(),
        promoDal: dataIso,
        promoAl: dataIso,
        fidelityCents: z.number().int().min(0).max(100_000_000).optional().nullable(),
        ivaAliquota: z.number().int().min(0).max(30).default(22),
        disponibile: z.boolean().default(true),
        cashbackPercento: z.number().int().min(0).max(100).default(100),
      }),
    )
    .handler(async ({ input }) => {
      controlla(input.codice);
      const pacchetto = await listinoAdv().then((l) => l.find((p) => p.slug === input.slug));
      if (!pacchetto) throw new ORPCError("NOT_FOUND", { message: "Pacchetto non in listino." });
      if (input.promoDal && input.promoAl && input.promoDal > input.promoAl) {
        throw new ORPCError("BAD_REQUEST", { message: "La data di inizio promo è dopo la fine." });
      }
      if (input.promoCents && input.promoCents > input.pienoCents) {
        throw new ORPCError("BAD_REQUEST", {
          message: "Il prezzo promo non può essere più alto del prezzo pieno.",
        });
      }
      if (input.fidelityCents && input.fidelityCents > input.pienoCents) {
        throw new ORPCError("BAD_REQUEST", {
          message: "Il prezzo Fidelity deve essere il più conveniente.",
        });
      }

      const valori = {
        sku: pacchetto.sku,
        titolo: testo(input.titolo, 120) ?? pacchetto.titolo,
        descrizione: testo(input.descrizione, 1200) ?? pacchetto.descrizione,
        immagineUrl: testo(input.immagineUrl, 400),
        pienoCents: input.pienoCents,
        promoCents: input.promoCents ?? null,
        promoDal: testo(input.promoDal, 20),
        promoAl: testo(input.promoAl, 20),
        fidelityCents: input.fidelityCents ?? null,
        ivaAliquota: input.ivaAliquota,
        disponibile: input.disponibile ? 1 : 0,
        cashbackPercento: input.cashbackPercento,
        aggiornatoIl: new Date(),
      };

      const [esiste] = await db
        .select()
        .from(schema.advListino)
        .where(eq(schema.advListino.slug, input.slug));

      if (esiste) {
        await db
          .update(schema.advListino)
          .set(valori)
          .where(eq(schema.advListino.slug, input.slug));
      } else {
        await db.insert(schema.advListino).values({ slug: input.slug, ...valori });
      }
      return { ok: true };
    }),

  /** Crea o aggiorna un servizio extra del configuratore. */
  salvaAddon: base
    .input(
      auth.extend({
        codiceAddon: z.string().trim().min(2).max(20),
        nome: z.string().trim().min(2).max(120),
        descrizione: z.string().trim().max(600).optional(),
        prezzoCents: z.number().int().min(0).max(10_000_000),
        attivo: z.boolean().default(true),
      }),
    )
    .handler(async ({ input }) => {
      controlla(input.codice);
      const codice = input.codiceAddon.trim().toUpperCase();
      const valori = {
        nome: input.nome.trim(),
        descrizione: testo(input.descrizione, 600),
        prezzoCents: input.prezzoCents,
        attivo: input.attivo ? 1 : 0,
        aggiornatoIl: new Date(),
      };
      const [esiste] = await db
        .select()
        .from(schema.advAddon)
        .where(eq(schema.advAddon.codice, codice));
      if (esiste) {
        await db.update(schema.advAddon).set(valori).where(eq(schema.advAddon.codice, codice));
      } else {
        await db.insert(schema.advAddon).values({ codice, ...valori });
      }
      return { ok: true, codice };
    }),

  /** REGISTRO FIDELITY: l'elenco dei clienti che hanno diritto al prezzo riservato. */
  fidelityElenco: base.input(auth).handler(async ({ input }) => {
    controlla(input.codice);
    const righe = await db
      .select()
      .from(schema.advFidelity)
      .orderBy(desc(schema.advFidelity.id));
    return { righe };
  }),

  fidelitySalva: base
    .input(
      auth.extend({
        id: z.number().int().positive().optional(),
        intestatario: z.string().trim().min(2).max(160),
        codiceTbh: z.string().trim().max(32).optional(),
        email: z.string().trim().max(160).optional(),
        codiceFiscale: z.string().trim().max(32).optional(),
        partitaIva: z.string().trim().max(32).optional(),
        livello: z.string().trim().max(60).optional(),
        cashback: z.boolean().default(true),
        attivo: z.boolean().default(true),
        scadenza: dataIso,
        note: z.string().trim().max(600).optional(),
      }),
    )
    .handler(async ({ input }) => {
      controlla(input.codice);
      if (!input.email && !input.codiceFiscale && !input.partitaIva && !input.codiceTbh) {
        throw new ORPCError("BAD_REQUEST", {
          message: "Serve almeno un dato verificabile: email, codice fiscale, partita IVA o codice TBH.",
        });
      }
      const valori = {
        intestatario: input.intestatario.trim(),
        codiceTbh: testo(input.codiceTbh, 32),
        email: testo(input.email, 160)?.toLowerCase() ?? null,
        codiceFiscale: testo(input.codiceFiscale, 32)?.toUpperCase() ?? null,
        partitaIva: testo(input.partitaIva, 32)?.toUpperCase() ?? null,
        livello: testo(input.livello, 60),
        cashback: input.cashback ? 1 : 0,
        attivo: input.attivo ? 1 : 0,
        scadenza: testo(input.scadenza, 20),
        note: testo(input.note, 600),
      };
      if (input.id) {
        await db
          .update(schema.advFidelity)
          .set(valori)
          .where(eq(schema.advFidelity.id, input.id));
        return { ok: true, id: input.id };
      }
      const [riga] = await db.insert(schema.advFidelity).values(valori).returning();
      return { ok: true, id: riga.id };
    }),

  fidelityElimina: base
    .input(auth.extend({ id: z.number().int().positive() }))
    .handler(async ({ input }) => {
      controlla(input.codice);
      await db.delete(schema.advFidelity).where(eq(schema.advFidelity.id, input.id));
      return { ok: true };
    }),

  /** Le pratiche di campagna, dalla più recente. */
  pratiche: base
    .input(auth.extend({ stato: z.enum(STATI_PRATICA).optional() }))
    .handler(async ({ input }) => {
      controlla(input.codice);
      const base_ = db.select().from(schema.advPratiche);
      const righe = input.stato
        ? await base_.where(eq(schema.advPratiche.stato, input.stato)).orderBy(desc(schema.advPratiche.id))
        : await base_.orderBy(desc(schema.advPratiche.id));
      return {
        righe: righe.map((p) => ({
          ...p,
          addon: JSON.parse(p.addonJson ?? "[]") as { nome: string; prezzoCents: number }[],
          configurazione: JSON.parse(p.configurazioneJson ?? "{}") as Record<string, unknown>,
          report: p.reportJson ? (JSON.parse(p.reportJson) as Record<string, unknown>) : null,
        })),
      };
    }),

  /** Avanzamento pratica, cashback e caricamento del report di campagna. */
  aggiornaPratica: base
    .input(
      auth.extend({
        id: z.number().int().positive(),
        stato: z.enum(STATI_PRATICA).optional(),
        nota: z.string().trim().max(600).optional(),
        noteInterne: z.string().trim().max(1200).optional(),
        cashbackCents: z.number().int().min(0).max(100_000_000).optional(),
        cashbackStato: z
          .enum(["non-eleggibile", "eleggibile", "in-maturazione", "maturato", "utilizzato"])
          .optional(),
        reportUrl: z.string().trim().max(400).optional().nullable(),
        report: z
          .object({
            impression: z.number().int().min(0).optional(),
            deviceUnici: z.number().int().min(0).optional(),
            ctr: z.number().min(0).max(100).optional(),
            vtr: z.number().min(0).max(100).optional(),
            frequency: z.number().min(0).max(1000).optional(),
            geografia: z.string().trim().max(600).optional(),
            fasciaOraria: z.string().trim().max(600).optional(),
            note: z.string().trim().max(600).optional(),
          })
          .optional(),
      }),
    )
    .handler(async ({ input }) => {
      controlla(input.codice);
      const [pratica] = await db
        .select()
        .from(schema.advPratiche)
        .where(eq(schema.advPratiche.id, input.id));
      if (!pratica) throw new ORPCError("NOT_FOUND", { message: "Pratica non trovata." });

      const valori: Record<string, unknown> = { updatedAt: new Date() };
      if (input.stato) valori.stato = input.stato;
      if (input.noteInterne !== undefined) valori.noteInterne = testo(input.noteInterne, 1200);
      if (input.cashbackCents !== undefined) valori.cashbackCents = input.cashbackCents;
      if (input.cashbackStato) valori.cashbackStato = input.cashbackStato;
      if (input.reportUrl !== undefined) valori.reportUrl = testo(input.reportUrl, 400);
      if (input.report) {
        const pulito = Object.fromEntries(
          Object.entries(input.report).filter(([, v]) => v !== undefined && v !== ""),
        );
        valori.reportJson = Object.keys(pulito).length ? JSON.stringify(pulito) : null;
      }

      await db.update(schema.advPratiche).set(valori).where(eq(schema.advPratiche.id, input.id));
      if (input.stato && input.stato !== pratica.stato) {
        await registraEvento(input.id, input.stato, testo(input.nota, 600), "pannello");
      }
      return { ok: true };
    }),

  /** Storico degli stati di una pratica. */
  eventi: base
    .input(auth.extend({ praticaId: z.number().int().positive() }))
    .handler(async ({ input }) => {
      controlla(input.codice);
      const righe = await db
        .select()
        .from(schema.advEventi)
        .where(eq(schema.advEventi.praticaId, input.praticaId))
        .orderBy(desc(schema.advEventi.id));
      return { righe };
    }),

  /**
   * Allinea Stripe al listino: crea/riusa Product e Price veri per ogni pacchetto e fascia,
   * così il checkout non improvvisa mai un importo.
   */
  sincronizzaStripe: base.input(auth).handler(async ({ input }) => {
    controlla(input.codice);
    if (!stripeConfigurato()) {
      throw new ORPCError("SERVICE_UNAVAILABLE", {
        message: "Manca STRIPE_SECRET_KEY: non è possibile creare prodotti e prezzi su Stripe.",
      });
    }
    const pacchetti = await listinoAdv();
    const esito: { pacchetto: string; fascia: string; priceId: string | null; errore?: string }[] = [];

    for (const p of pacchetti) {
      const fasce: { f: "pieno" | "promo" | "fidelity"; importo: number | null }[] = [
        { f: "pieno", importo: p.pienoCents },
        { f: "promo", importo: p.promoCents },
        { f: "fidelity", importo: p.fidelityCents },
      ];
      for (const { f, importo } of fasce) {
        if (!importo) continue;
        try {
          const r = await assicuraPrezzoStripe(p, f, importo);
          esito.push({ pacchetto: p.titolo, fascia: f, priceId: r.priceId });
        } catch (e) {
          esito.push({
            pacchetto: p.titolo,
            fascia: f,
            priceId: null,
            errore: e instanceof Error ? e.message : String(e),
          });
        }
      }
    }

    for (const a of await addonAdv(true)) {
      try {
        const r = await assicuraPrezzoAddonStripe(a);
        esito.push({ pacchetto: a.nome, fascia: "servizio extra", priceId: r.priceId });
      } catch (e) {
        esito.push({
          pacchetto: a.nome,
          fascia: "servizio extra",
          priceId: null,
          errore: e instanceof Error ? e.message : String(e),
        });
      }
    }

    return { esito };
  }),
};
