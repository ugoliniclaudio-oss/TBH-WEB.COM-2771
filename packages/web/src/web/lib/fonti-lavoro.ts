/**
 * Modelli della directory «Fonti esterne» di TBH Lavoro (06/10/2026).
 * I dati veri stanno in `fonti-lavoro-dati.ts`, generato da `_ricerca-lavoro/genera_ts.py`
 * a partire da fonti ufficiali: qui solo tipi, costanti di fonte e ricerca.
 *
 * Censimento PROGRESSIVO: non è un elenco nazionale completo. Copertura attuale dei CPI:
 * Emilia-Romagna, Marche, Abruzzo, Molise (da riconfermare) e provincia di Foggia.
 */

export interface CentroImpiego {
  id: string;
  regione: string;
  /** Nome per esteso della provincia, come lo scrive la fonte regionale. */
  provincia: string;
  nome: string;
  /** Comuni o area servita, solo se la fonte li indica. */
  territorio: string | null;
  indirizzo: string | null;
  telefono: string | null;
  email: string | null;
  /** Pagina ufficiale della sede (o elenco ufficiale regionale quando la scheda non è raggiungibile). */
  pagina: string;
  fonte: string;
  /** Data di verifica, AAAA-MM-GG. */
  verificato: string;
  nota: string | null;
  stato: "verificato" | "da-riconfermare";
}

export interface AssociazioneAlberghi {
  id: string;
  territorio: string;
  nome: string;
  regione: string;
  /** Sigla della provincia (es. RN). */
  provincia: string;
  indirizzo: string | null;
  telefono: string | null;
  email: string | null;
  /** Sito locale, pubblicato solo se risponde con una pagina vera dell'associazione. */
  sito: string | null;
  verificato: string;
}

export const FONTE_FEDERALBERGHI = {
  nome: "Federalberghi — Associazioni territoriali (elenco nazionale ufficiale)",
  url: "https://www.federalberghi.it/menu/associazioni-territoriali.aspx",
};

/** Portale degli albergatori della Riviera (Federalberghi), in evidenza in TBH Lavoro. */
export const CERCO_LAVORO_HOTEL = {
  nome: "Cerco Lavoro in Hotel — Riviera Romagnola",
  sito: "https://www.cercolavoroinhotel.it/",
  bacheca: "https://www.cercolavoroinhotel.it/bacheca-annunci",
  federalberghi: "https://www.federalberghi.it/",
};

/** Normalizza per la ricerca: minuscole, senza accenti, spazi compressi. */
export function normalizza(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/** Vero se tutte le parole della ricerca compaiono nel testo. */
export function corrisponde(testo: string, ricerca: string) {
  const r = normalizza(ricerca);
  if (!r) return true;
  const t = normalizza(testo);
  return r.split(" ").every((p) => t.includes(p));
}

export function dataIt(iso: string | null) {
  if (!iso) return null;
  const [a, m, g] = iso.split("-");
  return `${g}/${m}/${a}`;
}
