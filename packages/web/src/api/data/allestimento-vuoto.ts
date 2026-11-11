/**
 * TESTO STANDARD DEGLI SPAZI ANCORA SENZA CONTENUTO
 * Specifica di Claudio del 16/09/2026, punto 1.
 *
 * Regola: in tutti i monitor, banner, schede o pulsanti senza contenuto si scrive
 * SEMPRE ed ESATTAMENTE questo testo. Mai un riquadro grigio, mai uno spazio
 * vuoto, mai un pulsante inattivo, mai un contenuto inventato per riempire.
 */

export const IN_ALLESTIMENTO_TITOLO = "IN ALLESTIMENTO";
export const IN_ALLESTIMENTO_NOTA = "Contenuto disponibile prossimamente";

/** Le due righe insieme, per i posti in cui serve una stringa sola. */
export const IN_ALLESTIMENTO_TESTO = `${IN_ALLESTIMENTO_TITOLO}\n${IN_ALLESTIMENTO_NOTA}`;

/** true = non c'è niente di reale da mostrare, quindi vale IN ALLESTIMENTO. */
export function vuoto(...valori: (string | null | undefined)[]): boolean {
  return valori.every((v) => !(v ?? "").trim());
}
