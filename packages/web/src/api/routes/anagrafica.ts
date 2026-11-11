import { z } from "zod";
import { base } from "../__core/app";
import {
  SCHEDE_MASTER,
  RADIO_MASTER,
  ANAGRAFICA_NOTA,
  schedaMaster,
} from "../data/anagrafica";

/**
 * ANAGRAFICA MASTER — un solo record per attività/luogo/emittente (motore anti-doppione).
 * Ordine di Claudio del 30/08/2026. Nessun campo riempito d'ufficio: ciò che manca resta null
 * e la scheda lo dichiara.
 */
export const anagrafica = {
  /** Elenco completo delle schede master, con il conteggio di ciò che manca. */
  elenco: base.handler(() => ({
    nota: ANAGRAFICA_NOTA,
    totale: SCHEDE_MASTER.length,
    schede: SCHEDE_MASTER.map((s) => ({
      id: s.id,
      slug: s.slug,
      nome: s.nome,
      categoria: s.categoria,
      universi: s.universi,
      citta: s.citta,
      provincia: s.provincia,
      logo: s.logo,
      sito: s.sito,
      mancanti: s.daRicevere.length,
    })),
  })),

  /** Scheda master singola, richiamata da qualunque sezione con lo stesso slug. */
  scheda: base
    .input(z.object({ slug: z.string() }))
    .handler(({ input }) => ({ scheda: schedaMaster(input.slug), nota: ANAGRAFICA_NOTA })),

  /** Radio e TV partner: solo i link ufficiali comunicati da Claudio. */
  radio: base.handler(() => ({
    radio: RADIO_MASTER,
    nota: "Link ufficiali comunicati da Claudio il 30/08/2026. Loghi, frequenze e streaming diretti non sono ancora stati forniti: al posto del logo compare il pulsante con il nome dell'emittente.",
  })),
};
