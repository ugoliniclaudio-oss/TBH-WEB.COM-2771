import { base } from "../__core/app";
import { STRUTTURA } from "../lib/struttura";

/**
 * STRUTTURA COMUNE Home → Canale → Attività → Scheda completa (28/10/2026).
 * Pubblico, sola lettura: per ogni Channel del registro le sue attività già verificate,
 * ognuna con la sua destinazione UNICA (la stessa da qualunque Channel). Nessun dato nuovo.
 */
export const struttura = {
  mappa: base.handler(() => ({ channel: STRUTTURA })),
};
