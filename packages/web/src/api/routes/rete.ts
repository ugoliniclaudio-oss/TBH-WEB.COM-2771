import { z } from "zod";
import { base } from "../__core/app";
import {
  PROSPECTS,
  AREE_MASTER,
  LUOGHI,
  CATEGORIE_LUOGO,
  TERRITORI,
  CIRCUITI,
  CAMPIONATI_MOTORI,
  PARTNER_TECNICI,
  CAMPIONATI_CALCIO,
  FONTI_CALCIO,
  RADIO,
  TV,
  TG,
  RIVISTE,
  GIOCHI,
  SPOT_A_VISTA,
} from "../data/rete";
import { TBH_CONTACTS } from "../data/catalog";

export const rete = {
  /** Anagrafica commerciale unica TBH + DM, con filtri. */
  prospects: base
    .input(
      z
        .object({
          regione: z.string().optional(),
          settore: z.string().optional(),
          priorita: z.string().optional(),
          q: z.string().optional(),
        })
        .optional(),
    )
    .handler(({ input }) => {
      const f = input ?? {};
      const all = (s?: string) => !s || s === "Tutti" || s === "Tutte";
      const q = (f.q ?? "").trim().toLowerCase();
      const items = PROSPECTS.filter(
        (p) =>
          (all(f.regione) || p.regione === f.regione) &&
          (all(f.settore) || p.settore === f.settore) &&
          (all(f.priorita) || p.priorita === f.priorita) &&
          (!q ||
            p.azienda.toLowerCase().includes(q) ||
            p.citta.toLowerCase().includes(q) ||
            p.settore.toLowerCase().includes(q)),
      );
      return {
        items,
        totale: PROSPECTS.length,
        obiettivo: 500,
        regioni: ["Tutte", ...Array.from(new Set(PROSPECTS.map((p) => p.regione))).sort()],
        settori: ["Tutti", ...Array.from(new Set(PROSPECTS.map((p) => p.settore))).sort()],
        priorita: ["Tutte", "A", "A/B", "B", "C", "D"],
        areeMaster: AREE_MASTER,
        colonne: [
          "LOGO",
          "AZIENDA",
          "SETTORE",
          "CITTÀ",
          "PROVINCIA",
          "REGIONE",
          "SITO",
          "TELEFONO",
          "EMAIL",
          "REFERENTE",
          "SOCIAL",
          "PRIORITÀ",
          "GIÀ SPONSOR SPORT?",
          "PROPOSTA DM",
          "LIVELLO TBH",
          "BUDGET POTENZIALE",
          "STATO CONTATTO",
          "NOTE",
        ],
      };
    }),

  /** Mappa del territorio: luoghi dove il gruppo è passato almeno una volta. */
  luoghi: base
    .input(z.object({ categoria: z.string().optional(), soloCircuito: z.boolean().optional() }).optional())
    .handler(({ input }) => {
      const cat = input?.categoria;
      const solo = input?.soloCircuito ?? false;
      const items = LUOGHI.filter(
        (l) =>
          (!cat || cat === "Tutte" || l.categoria === cat) && (!solo || l.circuitoTBH),
      );
      return {
        items,
        categorie: CATEGORIE_LUOGO,
        totale: LUOGHI.length,
        circuito: LUOGHI.filter((l) => l.circuitoTBH).length,
      };
    }),

  /** Banner random: attività con vetrofania del circuito TBH. */
  circuitoRandom: base
    .input(z.object({ n: z.number().min(1).max(12).optional() }).optional())
    .handler(({ input }) => {
      const n = input?.n ?? 4;
      const pool = LUOGHI.filter((l) => l.circuitoTBH);
      const shuffled = [...pool].sort(() => Math.random() - 0.5);
      return { items: shuffled.slice(0, n) };
    }),

  territori: base.handler(() => ({ items: TERRITORI })),

  motorsport: base.handler(() => ({
    circuiti: CIRCUITI,
    campionati: CAMPIONATI_MOTORI,
    partner: PARTNER_TECNICI,
  })),

  calcio: base.handler(() => ({
    campionati: CAMPIONATI_CALCIO,
    sezioni: ["Emilia e Romagna", "Marche", "Nazionale"],
    fonti: FONTI_CALCIO,
  })),

  media: base.handler(() => ({ radio: RADIO, tv: TV, tg: TG, riviste: RIVISTE })),

  giochi: base.handler(() => ({ items: GIOCHI })),

  /** Dati per la pagina "Stiamo lavorando per voi". */
  allestimento: base.handler(() => ({
    contatti: TBH_CONTACTS,
    spotAVista: SPOT_A_VISTA,
  })),
};
