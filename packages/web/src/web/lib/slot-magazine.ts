/**
 * MAGAZINE — nomi degli spazi di allestimento, numero per numero.
 *
 * Ordine di Claudio (04/09/2026): «Anche tutte le copertine dei magazine i vari numeri vorrei
 * inserire foto una ad una e anche poi la scheda dove ci sono anche le pagine di tutta la rivista
 * numero per numero, numeri speciali ed inserti sportivi che ci saranno da gennaio 2027».
 *
 * Ogni numero ha tre spazi indipendenti, così si carica una foto alla volta:
 * · copertina        → l'immagine di copertina di quel numero;
 * · pagine           → tutte le pagine della rivista, una a una;
 * · inserto sportivo → l'inserto sport, previsto da Gennaio 2027.
 *
 * I nomi degli spazi contengono lo slug del numero (2022-0, 2022-5-bis, 2023-6 …), quindi
 * restano stabili anche quando arrivano i numeri nuovi.
 */

export const PREFISSO_COPERTINA = "influencity:copertina:";
export const PREFISSO_PAGINE = "influencity:pagine:";
export const PREFISSO_INSERTO_SPORT = "influencity:inserto-sport:";
/** Il file sfogliabile (PDF) del numero: allegato, non immagine. */
export const PREFISSO_SFOGLIABILE = "influencity:sfogliabile:";

export function slotCopertina(slug: string) {
  return `${PREFISSO_COPERTINA}${slug}`;
}

export function slotPagine(slug: string) {
  return `${PREFISSO_PAGINE}${slug}`;
}

export function slotInsertoSport(slug: string) {
  return `${PREFISSO_INSERTO_SPORT}${slug}`;
}

export function slotSfogliabile(slug: string) {
  return `${PREFISSO_SFOGLIABILE}${slug}`;
}

/** Da quando partono gli inserti sportivi, come dichiarato da TBH. */
export const INSERTI_SPORT_DA = "Gennaio 2027";

/** Primo anno con inserto sportivo: prima di quella data l'inserto non esisteva. */
export const INSERTI_SPORT_ANNO = 2027;
