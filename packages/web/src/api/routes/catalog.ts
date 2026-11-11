import { z } from "zod";
import { eq } from "drizzle-orm";
import { base } from "../__core/app";
import { db } from "../database";
import * as schema from "../database/schema";
import { COMPANIES, TEAMS, SPORT_MEDIA, TBH_CONTACTS } from "../data/catalog";
import { risolviLogo } from "../data/identita";
import { articoloTouchPlaza, vetrinaTouchPlaza } from "../lib/catalogo-touch-plaza";
import { riconciliaSeServe } from "../lib/stripe-sync";

/**
 * UN CONTENUTO, UN RECORD, UN LOGO ORIGINALE (aggiornamento del 17/09/2026, punto 9).
 *
 * Difetto reale trovato con la scansione del sito: «A.C. San Marino Calcio» ha lo
 * stemma originale nell'anagrafica delle squadre (sport.ts) ma `logo: null` in
 * catalog.ts, quindi la stessa società risultava completa in /sport/squadre e vuota
 * in /sport/societa-seguite. Lo stesso valeva per le altre società seguite.
 *
 * Qui NON si copiano i file a mano in una seconda anagrafica (sarebbero due record):
 * si risolve il logo dall'identità unica al momento della lettura. Se l'originale non
 * esiste in nessuna anagrafica il logo resta null e la card mostra il nome per esteso
 * con la nota IN ALLESTIMENTO.
 */
const TEAMS_RISOLTE = TEAMS.map((t) => {
  const r = risolviLogo(t.name, t.logo);
  return r.logo === t.logo ? t : { ...t, logo: r.logo };
});

const COMPANIES_RISOLTE = COMPANIES.map((c) => {
  const r = risolviLogo(c.name, c.logo);
  return r.logo === c.logo ? c : { ...c, logo: r.logo };
});

export const catalog = {
  products: base
    .input(z.object({ category: z.string().optional() }).optional())
    .handler(async ({ input }) => {
      // 03/10/2026 — listino del sito + schede sincronizzate da Stripe (una sola per Product).
      riconciliaSeServe();
      const tutti = await vetrinaTouchPlaza();
      const category = input?.category;
      const items = category && category !== "Tutti"
        ? tutti.filter((p) => p.category === category)
        : tutti;
      return {
        items,
        categories: ["Tutti", ...Array.from(new Set(tutti.map((p) => p.category)))],
      };
    }),

  product: base.input(z.object({ slug: z.string() })).handler(async ({ input }) => {
    return (await articoloTouchPlaza(input.slug)) ?? null;
  }),

  companies: base.handler(() => ({
    societa: COMPANIES_RISOLTE.filter((c) => c.kind === "societa"),
    attivita: COMPANIES_RISOLTE.filter((c) => c.kind === "attivita"),
  })),

  teams: base.handler(() => ({ teams: TEAMS_RISOLTE, media: SPORT_MEDIA })),

  contacts: base.handler(() => TBH_CONTACTS),

  /** Contatore presenze reale. */
  visits: base.handler(async () => {
    const [row] = await db
      .select()
      .from(schema.settings)
      .where(eq(schema.settings.key, "visits"));
    return { count: row ? Number(row.value) : 0 };
  }),

  trackVisit: base.handler(async () => {
    const [row] = await db
      .select()
      .from(schema.settings)
      .where(eq(schema.settings.key, "visits"));
    const next = (row ? Number(row.value) : 0) + 1;
    if (row) {
      await db
        .update(schema.settings)
        .set({ value: String(next) })
        .where(eq(schema.settings.key, "visits"));
    } else {
      await db.insert(schema.settings).values({ key: "visits", value: String(next) });
    }
    return { count: next };
  }),
};
