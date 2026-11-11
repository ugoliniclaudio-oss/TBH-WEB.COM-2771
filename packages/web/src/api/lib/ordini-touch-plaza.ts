/**
 * Riferimento d'ordine del Touch Plaza per Stripe. 03/10/2026: prima era il solo numero
 * (`12`), lo stesso formato delle pratiche ADV — il webhook avrebbe potuto scambiare un
 * ordine del negozio per la pratica ADV con lo stesso numero. Col prefisso non succede.
 */
export function riferimentoOrdine(ordineId: number) {
  return `tp-ordine-${ordineId}`;
}

/** Aggiunge il numero d'ordine a un Payment Link Stripe, senza rompere i suoi parametri. */
export function linkConOrdine(link: string, ordineId: number): string {
  const separatore = link.includes("?") ? "&" : "?";
  return `${link}${separatore}client_reference_id=${riferimentoOrdine(ordineId)}`;
}

/** Numero d'ordine Touch Plaza da un `client_reference_id`, oppure null se non è nostro. */
export function ordineDaRiferimento(rif: string | null | undefined) {
  const m = /^tp-ordine-(\d+)$/.exec(rif ?? "");
  return m ? Number(m[1]) : null;
}
