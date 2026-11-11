/**
 * ANAGRAFICA MASTER — MOTORE ANTI-DOPPIONE
 * Ordine di Claudio del 30/08/2026: «ogni elemento esiste UNA VOLTA SOLA, con un ID MASTER,
 * e viene richiamato da tutte le sezioni che lo citano».
 *
 * Regole rispettate qui:
 * - un solo record per luogo/attività/radio: le sezioni lo richiamano per ID, non lo ricopiano;
 * - niente dati inventati: indirizzo, telefono, email, social, orari restano `null` finché
 *   Claudio non li manda. Al posto del dato mancante la scheda mostra il pulsante
 *   «MI TROVI QUI» oppure «In allestimento»;
 * - i loghi ci sono solo se il file è arrivato davvero (`logo: null` = pulsante, non immagine).
 *
 * Formato ID MASTER: TBH-COMPANY-001 · DM-PROGRAM-001 · DM-TEAM-001 · PLACE-<CITTÀ>-001 ·
 * SHOP-PRODUCT-001 · MEDIA-RADIO-001
 */

export type Universo =
  | "TBH"
  | "CIRCUITO"
  | "TERRITORIO"
  | "CERCAMI"
  | "MEDIA"
  | "DM"
  | "MOTORSPORT"
  | "EVENTI";

export type SchedaMaster = {
  /** ID MASTER: chiave unica, mai duplicata. */
  id: string;
  slug: string;
  nome: string;
  categoria: string;
  /** Universi TBH in cui la scheda compare. La scheda resta UNA. */
  universi: Universo[];
  citta: string | null;
  provincia: string | null;
  regione: string | null;
  indirizzo: string | null;
  lat: number | null;
  lon: number | null;
  sito: string | null;
  telefono: string | null;
  email: string | null;
  social: { rete: string; url: string }[];
  /** Percorso del logo dentro /public. `null` = nessun file ricevuto → si mostra il pulsante. */
  logo: string | null;
  descrizione: string | null;
  /** Rotte interne del portale collegate a questa scheda (nessun rimando fuori dal sito). */
  correlati: { to: string; label: string }[];
  /** Cosa manca davvero, scritto in chiaro. Niente riempitivi. */
  daRicevere: string[];
};

export const SCHEDE_MASTER: SchedaMaster[] = [
  {
    id: "TBH-PLACE-001",
    slug: "bounty-rimini",
    nome: "Bounty Rimini",
    categoria: "Pub · Restaurant · Entertainment",
    universi: ["CIRCUITO", "TERRITORIO", "CERCAMI"],
    citta: "Rimini",
    provincia: "RN",
    regione: "Emilia-Romagna",
    indirizzo: null,
    lat: null,
    lon: null,
    sito: null,
    telefono: null,
    email: null,
    social: [],
    logo: "/attivita/bounty-rimini.png",
    descrizione: null,
    correlati: [
      { to: "/network/circuito", label: "Circuito TBH" },
      { to: "/territorio/mappa", label: "Mappa del territorio" },
    ],
    daRicevere: ["Indirizzo esatto", "Telefono", "Sito o pagina social ufficiale", "Foto reali", "Orari"],
  },
  {
    id: "TBH-PLACE-002",
    slug: "la-lanterna-rimini",
    nome: "La Lanterna",
    categoria: "Ristorante di pesce",
    universi: ["CIRCUITO", "TERRITORIO"],
    citta: "Rimini",
    provincia: "RN",
    regione: "Emilia-Romagna",
    indirizzo: null,
    lat: null,
    lon: null,
    sito: null,
    telefono: null,
    email: null,
    social: [],
    logo: null,
    descrizione: null,
    correlati: [
      { to: "/hospitality/ristoranti", label: "Ristoranti TBH" },
      { to: "/network/circuito", label: "Circuito TBH" },
    ],
    daRicevere: ["Logo ufficiale", "Indirizzo esatto", "Telefono", "Sito o social", "Foto reali", "Menù"],
  },
  {
    id: "TBH-COMPANY-002",
    slug: "touch-metropolitan-media",
    nome: "Touch Metropolitan Media Srl",
    categoria: "Comunicazione · Logistica · Sicurezza · Eventi",
    universi: ["TBH", "MEDIA"],
    citta: null,
    provincia: null,
    regione: null,
    indirizzo: null,
    lat: null,
    lon: null,
    sito: null,
    telefono: "+39 379 208 8524",
    email: "supporto@touch-business.com",
    social: [],
    logo: "/brand/loghi/touch-metropolitan-media.png",
    descrizione:
      "Società del gruppo Touch Business Holding. P.IVA 10971100960 (dato fornito da Claudio).",
    correlati: [
      { to: "/tbh/societa", label: "Società TBH con P.IVA" },
      { to: "/media", label: "Media Hub TBH" },
    ],
    daRicevere: ["Sede da pubblicare (città o indirizzo)", "Sito ufficiale", "Social ufficiali"],
  },
  {
    id: "PLACE-MISANO-001",
    slug: "misano-world-circuit",
    nome: "Misano World Circuit",
    categoria: "Circuito · Motorsport",
    universi: ["MOTORSPORT", "CERCAMI", "TERRITORIO"],
    citta: "Misano Adriatico",
    provincia: "RN",
    regione: "Emilia-Romagna",
    indirizzo: null,
    lat: null,
    lon: null,
    sito: null,
    telefono: null,
    email: null,
    social: [],
    logo: null,
    descrizione: null,
    correlati: [
      { to: "/sport/motorsport", label: "Motorsport TBH" },
      { to: "/territorio/mappa", label: "Mappa del territorio" },
    ],
    daRicevere: [
      "Conferma del sito ufficiale da linkare",
      "Indirizzo esatto",
      "Date reali degli eventi da pubblicare",
      "Foto e video nostri della tappa",
    ],
  },
  {
    id: "PLACE-SANREMO-005",
    slug: "hotel-des-anglais",
    nome: "Grand Hotel & Des Anglais",
    categoria: "Hotel · Area Sanremo",
    universi: ["TERRITORIO", "CERCAMI", "EVENTI"],
    citta: "Sanremo",
    provincia: "IM",
    regione: "Liguria",
    indirizzo: "Salita Grande Albergo, 8 — 18038 Sanremo (IM)",
    lat: 43.8129172,
    lon: 7.7647057,
    sito: "https://www.hoteldesanglais.com/",
    telefono: "+39 0184 667840",
    email: "info@hoteldesanglais.com",
    social: [],
    logo: null,
    descrizione:
      "Hotel quattro stelle della Belle Époque (1888), a due passi dal Casinò e dalla Passeggiata Imperatrice. Dati letti dal sito ufficiale il 18/09/2026.",
    correlati: [
      { to: "/sanremo/hotel-des-anglais", label: "Scheda Area Sanremo" },
      { to: "/hospitality/hotel", label: "Hotel e strutture" },
    ],
    daRicevere: ["Logo ufficiale", "Foto reali", "Coordinate mappa"],
  },
];

/**
 * RADIO E TV PARTNER — link ufficiali comunicati da Claudio il 30/08/2026.
 * Frequenze, loghi, streaming e dati di ascolto NON sono stati comunicati: restano vuoti,
 * dichiarati, e la scheda mostra il pulsante al posto del logo.
 */
export type SchedaRadio = {
  id: string;
  slug: string;
  nome: string;
  tipo: string;
  sito: string;
  logo: string | null;
  frequenze: string | null;
  streaming: string | null;
  daRicevere: string[];
};

export const RADIO_MASTER: SchedaRadio[] = [
  {
    id: "MEDIA-RADIO-001",
    slug: "radio-montecarlo-2",
    nome: "Radio Montecarlo 2 · MC2",
    tipo: "Radio",
    sito: "https://www.rmc2.net",
    logo: null,
    frequenze: null,
    streaming: null,
    daRicevere: ["Logo ufficiale", "Frequenze FM/DAB", "URL streaming diretto"],
  },
  {
    id: "MEDIA-RADIO-002",
    slug: "radio-venezia",
    nome: "Radio Venezia",
    tipo: "Radio",
    sito: "https://www.radiovenezia.com",
    logo: null,
    frequenze: null,
    streaming: null,
    daRicevere: ["Logo ufficiale", "Frequenze FM/DAB", "URL streaming diretto"],
  },
  {
    id: "MEDIA-RADIO-003",
    slug: "radio-milano-lombardia",
    nome: "Radio Milano Lombardia",
    tipo: "Radio",
    sito: "https://radiomilanolombardia.it",
    logo: null,
    frequenze: null,
    streaming: null,
    daRicevere: ["Logo ufficiale", "Frequenze FM/DAB", "URL streaming diretto"],
  },
  {
    id: "MEDIA-RADIO-004",
    slug: "radio-sanremo",
    nome: "Radio Sanremo",
    tipo: "Radio",
    sito: "https://www.radiosanremo.it",
    logo: null,
    frequenze: null,
    streaming: null,
    daRicevere: ["Logo ufficiale", "Frequenze FM/DAB", "URL streaming diretto"],
  },
  {
    id: "MEDIA-RADIO-005",
    slug: "match-music-tv",
    nome: "Match Music TV",
    tipo: "TV musicale",
    sito: "https://www.rmc2.net/webradio/mc2-match-music-channel",
    logo: null,
    frequenze: null,
    streaming: null,
    daRicevere: ["Logo ufficiale", "Numero di canale DTT", "URL streaming diretto"],
  },
];

export const ANAGRAFICA_NOTA =
  "Anagrafica master TBH: ogni attività, luogo, società o emittente esiste una volta sola con il suo ID MASTER e viene richiamata da tutte le sezioni. I campi vuoti non vengono riempiti con dati di fantasia: dove manca il dato compare «In allestimento» o il pulsante «Mi trovi qui».";

export function schedaMaster(slug: string) {
  return SCHEDE_MASTER.find((s) => s.slug === slug) ?? null;
}
