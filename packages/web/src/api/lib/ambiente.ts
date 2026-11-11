/**
 * AMBITO DEI DATI — fase 2 «Canale 0» (18/10/2026).
 *
 * Anteprima (server di sviluppo Vite) e sito pubblico (bun src/__server.ts) usano lo
 * STESSO database. Per non interferire, le tabelle dei Channel e le chiavi della home
 * portano l'ambito:
 *   · staging     → anteprima Runable (Vite in sviluppo: import.meta.env.DEV === true);
 *   · produzione  → www.tbh-web.com (server Bun: import.meta.env.DEV non esiste);
 *   · collaudo    → SOLO per i test locali che simulano il server pubblico senza
 *                   scrivere nelle righe vere della produzione (variabile passata a mano
 *                   sulla riga di comando, mai nel file .env).
 * Ogni ambito legge e scrive SOLO le proprie righe.
 */
export type Ambiente = "staging" | "produzione" | "collaudo";

function rileva(): Ambiente {
  if (process.env.TBH_AMBIENTE_COLLAUDO === "1") return "collaudo";
  return import.meta.env?.DEV === true ? "staging" : "produzione";
}

export const AMBIENTE: Ambiente = rileva();

/** Chiave della tabella `settings` riservata all'ambito corrente. */
export const chiaveAmbito = (base: string) => `${base}:${AMBIENTE}`;
