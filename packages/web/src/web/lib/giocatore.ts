/**
 * Codice giocatore per il gioco «Capitan Touch — a caccia dei neuroni perduti».
 *
 * Il portale non ha area utente con registrazione, quindi il giocatore viene
 * riconosciuto da un codice anonimo salvato sul dispositivo. Conseguenza da
 * tenere presente: il limite dei 3 ritrovamenti al giorno vale per dispositivo
 * e si azzera svuotando i dati del browser. La scarsità dei premi invece è
 * blindata sul server (i 5 Neuroni d'Oro restano 5 per tutto il portale).
 */

const CHIAVE = "tbh-giocatore";

function nuovoCodice() {
  try {
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
      return crypto.randomUUID();
    }
  } catch {
    /* si passa al ripiego */
  }
  return `g-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;
}

/** Legge il codice del dispositivo, creandolo alla prima visita. */
export function codiceGiocatore(): string {
  if (typeof window === "undefined") return "";
  try {
    const salvato = localStorage.getItem(CHIAVE);
    if (salvato && salvato.length >= 6) return salvato;
    const nuovo = nuovoCodice();
    localStorage.setItem(CHIAVE, nuovo);
    return nuovo;
  } catch {
    /* navigazione privata o archivio bloccato: codice valido solo per la sessione */
    return nuovoCodice();
  }
}
