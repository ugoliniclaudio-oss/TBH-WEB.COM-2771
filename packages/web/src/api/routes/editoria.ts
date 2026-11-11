import { z } from "zod";
import { base } from "../__core/app";
import {
  ANCORA_NUMERAZIONE,
  ANOMALIE_NUMERAZIONE,
  CATEGORIE_NEWS,
  EDICOLA_NOTA,
  NEWS_NOTA,
  NUMERI,
  RUBRICHE,
  speciali,
  trovaNumero,
} from "../data/editoria";
import { TBH_CONTACTS } from "../data/catalog";

/** FASE 7 — edicola Influencity, speciali annuali e struttura News. Zero contenuti inventati. */
export const editoria = {
  /** Edicola completa, raggruppata per anno (dal più recente). */
  edicola: base.handler(() => {
    const anni = [...new Set(NUMERI.map((n) => n.anno))].sort((a, b) => b - a);
    return {
      anni: anni.map((anno) => ({
        anno,
        /* Si ordina per il campo `ordine`, non leggendo il numero come cifra: così i "bis"
           restano al loro posto dietro l'ultima uscita dell'anno. */
        numeri: NUMERI.filter((n) => n.anno === anno).sort((a, b) => b.ordine - a.ordine),
      })),
      totale: NUMERI.length,
      ultimo: [...NUMERI].sort((a, b) => b.ordine - a.ordine)[0] ?? null,
      rubriche: RUBRICHE,
      nota: EDICOLA_NOTA,
      /* Ancora dichiarata e controllo di coerenza: se una copertina reale finisse sul numero
         sbagliato, l'anomalia arriva in pagina invece di restare nascosta nei dati. */
      ancora: ANCORA_NUMERAZIONE,
      anomalie: ANOMALIE_NUMERAZIONE,
      contatti: TBH_CONTACTS,
    };
  }),

  /** Solo gli speciali di fine anno (i numeri "bis"). */
  speciali: base.handler(() => ({
    items: speciali(),
    nota: EDICOLA_NOTA,
  })),

  /** Scheda del singolo numero. */
  numero: base.input(z.object({ slug: z.string() })).handler(({ input }) => {
    /* `trovaNumero` accetta anche i vecchi indirizzi (alias): un link condiviso prima della
       correzione della numerazione apre comunque il numero giusto. */
    const item = trovaNumero(input.slug);
    const idx = item ? NUMERI.findIndex((n) => n.slug === item.slug) : -1;
    return {
      item,
      /** Indirizzo canonico: se si è arrivati da un alias, la pagina sa dove sta di casa. */
      slugCanonico: item?.slug ?? null,
      precedente: idx > 0 ? NUMERI[idx - 1] : null,
      successivo: idx >= 0 && idx < NUMERI.length - 1 ? NUMERI[idx + 1] : null,
      nota: EDICOLA_NOTA,
      contatti: TBH_CONTACTS,
    };
  }),

  /** Struttura della sezione News: categorie e collegamenti interni reali. */
  news: base.input(z.object({ categoria: z.string().optional() })).handler(({ input }) => {
    const categoria = input.categoria
      ? (CATEGORIE_NEWS.find((c) => c.slug === input.categoria) ?? null)
      : null;
    return {
      categorie: CATEGORIE_NEWS,
      categoria,
      nota: NEWS_NOTA,
      contatti: TBH_CONTACTS,
    };
  }),
};
