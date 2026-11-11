/** Prezzo in euro per la UI. Spostato qui da components/tiles.tsx (03/10/2026) per evitare
 * import circolari; tiles.tsx lo riesporta, quindi gli import esistenti restano validi. */
export function euro(cents: number) {
  // Una voce a costo zero si scrive «Gratuito», non «0,00 €» (corso antincendio, 15/09/2026).
  if (cents === 0) return "Gratuito";
  // `useGrouping: "always"` è obbligatorio: su alcuni browser con dati ICU ridotti il locale
  // it-IT perde il punto delle migliaia e «3.000,00 €» diventerebbe «3000,00 €».
  return new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
    useGrouping: true,
  }).format(cents / 100);
}
