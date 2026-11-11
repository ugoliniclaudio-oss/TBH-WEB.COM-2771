/**
 * RECORD MASTER DEI MARCHI — regole di lettura e scrittura (specifica 17/09/2026).
 *
 * «UN CONTENUTO, UN RECORD, UN LOGO ORIGINALE, PIÙ ADATTAMENTI AUTOMATICI.»
 *
 * Qui dentro NON c'è nessun marchio, nessun colore, nessun contatto: solo i tipi e
 * le regole. I dati stanno nelle tabelle `marchi` e `marchio_media` e li scrive
 * Claudio dal pannello. Finché una scheda non esiste, la pagina scrive
 * "IN ALLESTIMENTO / Contenuto disponibile prossimamente": non si inventa nulla.
 */

import { RUOLI_KIT, type RuoloKit } from "./formati-logo";

/* ─────────────────────────── STATO DELLA SCHEDA ─────────────────────────── */

/**
 * Tre stati, come chiesto al punto 7: una scheda non è MAI vuota e non si cancella.
 * · in_allestimento — si vede, con titolo e "Contenuto disponibile prossimamente";
 * · bozza — visibile solo a chi amministra, non sul sito pubblico;
 * · attiva — pubblicata. Il passaggio da IN ALLESTIMENTO ad ATTIVA non cambia
 *   l'indirizzo della scheda né i collegamenti già in giro per il sito.
 */
export const STATI_MARCHIO = ["attiva", "bozza", "in_allestimento"] as const;
export type StatoMarchio = (typeof STATI_MARCHIO)[number];

export const STATO_MARCHIO_LABEL: Record<StatoMarchio, string> = {
  attiva: "ATTIVA",
  bozza: "BOZZA",
  in_allestimento: "IN ALLESTIMENTO",
};

export function normalizzaStatoMarchio(v: string | null | undefined): StatoMarchio {
  const s = (v ?? "").trim().toLowerCase().replace(/[\s-]+/g, "_");
  return (STATI_MARCHIO as readonly string[]).includes(s)
    ? (s as StatoMarchio)
    : "in_allestimento";
}

/** Una scheda si vede sul sito pubblico se è ATTIVA o IN ALLESTIMENTO (mai vuota). */
export function marchioPubblico(stato: StatoMarchio) {
  return stato !== "bozza";
}

/** Testi esatti dettati da Claudio: non si riscrivono con altre parole. */
export const IN_ALLESTIMENTO_TITOLO = "IN ALLESTIMENTO";
export const IN_ALLESTIMENTO_NOTA = "Contenuto disponibile prossimamente";

/* ───────────────────────────── CATEGORIE ───────────────────────────── */

/**
 * Le famiglie di contenuto elencate nella specifica: servono solo a raggruppare le
 * schede nei menu e nei pannelli. Una categoria sconosciuta non blocca il
 * salvataggio: resta `null` e la scheda si vede comunque.
 */
export const CATEGORIE_MARCHIO = [
  { slug: "societa-tbh", label: "Società del gruppo TBH" },
  { slug: "circuito-tbh", label: "Circuito TBH" },
  { slug: "attivita-territorio", label: "Attività sul territorio" },
  { slug: "squadre", label: "Squadre e società sportive" },
  { slug: "programmi", label: "Programmi e format" },
  { slug: "media", label: "Media, radio e TV" },
  { slug: "magazine", label: "Magazine ed editoria" },
  { slug: "prodotti", label: "Prodotti e gadget" },
  { slug: "servizi", label: "Servizi" },
  { slug: "corsi", label: "Corsi e formazione" },
  { slug: "eventi", label: "Eventi" },
  { slug: "turismo", label: "Turismo e viaggi" },
  { slug: "lavoro", label: "Lavoro e selezione" },
  { slug: "pubblicita", label: "Pubblicità e banner" },
  { slug: "partner", label: "Partner e sponsor" },
] as const;

export type CategoriaMarchio = (typeof CATEGORIE_MARCHIO)[number]["slug"];

export function categoriaValida(v: string | null | undefined): string | null {
  const s = (v ?? "").trim();
  if (!s) return null;
  return CATEGORIE_MARCHIO.some((c) => c.slug === s) ? s : null;
}

export function categoriaLabel(slug: string | null | undefined): string | null {
  const c = CATEGORIE_MARCHIO.find((x) => x.slug === (slug ?? "").trim());
  return c ? c.label : null;
}

/* ─────────────────────────── IL RECORD MASTER ─────────────────────────── */

/** Un file del kit ufficiale: esiste solo se è stato davvero fornito. */
export type MediaMarchio = {
  id: number;
  ruolo: RuoloKit;
  /** Indirizzo già pronto da mettere in pagina. */
  url: string;
  tipo: "immagine" | "video" | "pdf" | "url";
  titolo: string | null;
  larghezza: number | null;
  altezza: number | null;
  fonte: string | null;
  nota: string | null;
  ordine: number;
};

/**
 * La scheda unica. Ogni card, monitor, menu e pagina del sito legge QUESTO oggetto:
 * la stessa entità non può essere completa in una pagina e vuota in un'altra.
 */
export type Marchio = {
  id: number;
  slug: string;
  nome: string;
  nomeBreve: string | null;
  /** Nome normalizzato del registro unico: il ponte con le anagrafiche pubblicate. */
  chiaveEntita: string | null;
  categoria: string | null;
  categoriaLabel: string | null;
  stato: StatoMarchio;
  statoLabel: string;
  descrizione: string | null;
  /** L'ORIGINALE: non si sovrascrive mai, le misure sono derivate. */
  logoMaster: string | null;
  logoMasterTipo: string | null;
  logoMasterLarghezza: number | null;
  logoMasterAltezza: number | null;
  coloriUfficiali: string[];
  copertinaUrl: string | null;
  videoUrl: string | null;
  caroselloUrl: string[];
  sito: string | null;
  mapsUrl: string | null;
  telefono: string | null;
  whatsapp: string | null;
  email: string | null;
  social: string[];
  /** Pagina interna da aprire al clic: mai un salto fuori dal sito. */
  paginaTbh: string;
  fonte: string | null;
  nota: string | null;
  ordine: number;
  /** Il kit ufficiale realmente fornito, ruolo per ruolo. */
  kit: MediaMarchio[];
  /** Quello che manca davvero, per il controllo del punto 8. */
  mancanze: string[];
  /** true = c'è abbastanza materiale per una scheda completa. */
  completa: boolean;
};

/* ─────────────────────────── REGOLE DI SERVIZIO ─────────────────────────── */

/** Slug pulito: solo minuscole, cifre e trattini. Non cambia più dopo il primo salvataggio. */
export function slugMarchio(v: string) {
  return (
    v
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 80) || "marchio"
  );
}

/** Elenco scritto uno per riga (o separato da virgole) → array senza righe vuote. */
export function righe(v: string | null | undefined): string[] {
  return (v ?? "")
    .split(/[\n,;]+/)
    .map((r) => r.trim())
    .filter(Boolean);
}

/** Colore ufficiale valido solo se è un colore scritto davvero (#rrggbb o nome). */
export function coloriPuliti(v: string | null | undefined): string[] {
  return righe(v)
    .map((c) => c.replace(/\s+/g, ""))
    .filter((c) => /^#?[0-9a-fA-F]{3,8}$/.test(c) || /^[a-zA-Z]{3,20}$/.test(c))
    .map((c) => (/^[0-9a-fA-F]{6}$/.test(c) ? `#${c}` : c))
    .slice(0, 12);
}

/**
 * Cosa manca a questa scheda. Serve all'elenco amministrativo del punto 8: si
 * scrive quello che manca, non si riempie il buco con materiale inventato.
 */
export function mancanzeMarchio(m: {
  logoMaster: string | null;
  descrizione: string | null;
  copertinaUrl: string | null;
  sito: string | null;
  telefono: string | null;
  whatsapp: string | null;
  mapsUrl: string | null;
  stato: StatoMarchio;
}): string[] {
  const out: string[] = [];
  if (!m.logoMaster) out.push("logo originale non caricato");
  if (!m.descrizione) out.push("descrizione assente");
  if (!m.copertinaUrl) out.push("immagine di copertina assente");
  if (!m.sito) out.push("sito non indicato");
  if (!m.telefono && !m.whatsapp) out.push("nessun contatto telefonico");
  if (!m.mapsUrl) out.push("posizione su Maps assente");
  return out;
}

/** Ruoli del kit ammessi in scrittura. */
export const RUOLI_MEDIA = RUOLI_KIT;

export function ruoloValido(v: string | null | undefined): RuoloKit | null {
  const s = (v ?? "").trim().toLowerCase();
  return (RUOLI_KIT as readonly string[]).includes(s) ? (s as RuoloKit) : null;
}

/** Tipi di file ammessi in una riga di kit. */
export const TIPI_MEDIA = ["immagine", "video", "pdf", "url"] as const;
export type TipoMediaMarchio = (typeof TIPI_MEDIA)[number];

export function tipoMediaValido(v: string | null | undefined): TipoMediaMarchio {
  const s = (v ?? "").trim().toLowerCase();
  return (TIPI_MEDIA as readonly string[]).includes(s) ? (s as TipoMediaMarchio) : "immagine";
}
