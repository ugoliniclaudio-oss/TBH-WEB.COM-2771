/* ────────────────────────────────────────────────────────────────────────────
   TERRITORIO TBH — PADOVA · VENETO

   Archivio APERTO e VUOTO: nessuna scheda è ancora stata verificata sul sito
   ufficiale delle attività. Il file esiste perché la città è già nel modello,
   non perché ci sia un dato da mostrare.

   Finché questo elenco resta vuoto la pagina di Padova scrive IN ALLESTIMENTO:
   è la regola ferrea di tipi.ts. Non si riempie con hotel «plausibili», con
   dati ripresi da Booking o TripAdvisor, né con recapiti ricostruiti: ogni
   scheda entra qui solo dopo la lettura del sito ufficiale dell'attività.

   Per aggiungere: copiare la forma di rimini.ts — scheda({ id: "TBH-PD-001",
   … citta: "padova" }) — e scrivere solo i campi letti dalla fonte, con la
   data della verifica in `fonte`.
   ──────────────────────────────────────────────────────────────────────────── */

import type { AttivitaTBH } from "./tipi";

export const PADOVA: AttivitaTBH[] = [];

/** Che cosa manca per aprire Padova: lo dichiara la pagina, non lo nasconde. */
export const PADOVA_DA_RICEVERE = [
  "Elenco delle attività da censire (hotel, ristoranti, locali, fiere, location)",
  "Siti ufficiali da cui leggere indirizzi e recapiti",
  "Loghi e fotografie ufficiali",
];
