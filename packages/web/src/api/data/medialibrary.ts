/**
 * MEDIA LIBRARY TBH — archivio unico di loghi, immagini e collegamenti.
 *
 * REGOLE (dettate da Claudio, 29/08/2026):
 * - I loghi si prendono SOLO dal sito ufficiale dell'organizzazione o dal materiale
 *   che ha fornito Claudio. Nessun logo ricreato o ridisegnato dall'AI.
 * - I loghi TBH e DM restano gli originali forniti: non si sostituiscono mai con
 *   risultati trovati online.
 * - Ogni record porta la fonte e lo stato di verifica. Dove il dato non è verificato
 *   il campo resta `null` e lo stato è "da-verificare": non si inventa nulla.
 * - Le fotografie sono classificate per provenienza (nostre, ufficiali utilizzabili,
 *   incorporate da servizi esterni, semplice URL di riferimento) per non riempire il
 *   sito di materiale senza provenienza o con diritti poco chiari.
 */

import { LOGHI_CHANNEL } from "./loghi-channel";

/** Categorie previste per l'importazione massiva. */
export const CATEGORIE_MEDIA = [
  { slug: "loghi-tbh", label: "Loghi ufficiali TBH e DM", nota: "Materiale fornito da Claudio: non si sostituisce mai con risultati trovati online." },
  { slug: "societa-sportive", label: "Loghi società sportive", nota: "Stemmi ufficiali o estratti dai mockup forniti." },
  { slug: "fiere-location", label: "Fiere e location europee", nota: "Fonte prioritaria: sito ufficiale della fiera o della struttura." },
  { slug: "circuiti", label: "Circuiti e motorsport", nota: null },
  { slug: "hotel", label: "Hotel e strutture ricettive", nota: null },
  { slug: "destinazioni", label: "Città e destinazioni Touch Travels", nota: null },
  { slug: "media-partner", label: "Media partner", nota: "Un media censito non è automaticamente un partner TBH." },
  { slug: "radio-tv", label: "Radio, TV, web TV e podcast", nota: "Scheda unica per ogni media, richiamata nelle varie sezioni senza duplicazioni." },
  { slug: "piattaforme-musicali", label: "Piattaforme musicali", nota: null },
  { slug: "pagamenti", label: "Pagamenti e finanza", nota: null },
  { slug: "enti-pubblici", label: "Enti pubblici e istituzioni", nota: null },
  { slug: "social", label: "Social, pagine, gruppi e community", nota: null },
  { slug: "eventi-produzioni", label: "Immagini eventi e produzioni", nota: null },
  { slug: "musica-tbh", label: "DJ Hugò / J.C. Hugò", nota: null },
] as const;

/** Provenienza di una immagine: serve a tenere pulita la questione diritti. */
export type ProvenienzaImmagine =
  | "foto-nostra"
  | "immagine-ufficiale"
  | "incorporata"
  | "url-di-riferimento"
  | "assente";

export type StatoVerifica = "verificato" | "da-verificare" | "non-disponibile";

/**
 * Record della Media Library. I campi ricalcano esattamente il tracciato di
 * importazione chiesto da Claudio:
 * ID | Categoria | Nome | Logo URL | Image URL 1 | Image URL 2 | Gallery URL |
 * Sito ufficiale | Google Maps | YouTube | Social | Pagina TBH | Fonte | Stato verifica
 */
export type RecordMedia = {
  id: string;
  categoria: string;
  nome: string;
  logoUrl: string | null;
  immagine1: string | null;
  immagine2: string | null;
  galleryUrl: string | null;
  sito: string | null;
  maps: string | null;
  youtube: string | null;
  social: { rete: string; url: string }[];
  paginaTbh: string | null;
  provenienzaImmagini: ProvenienzaImmagine;
  fonte: string;
  stato: StatoVerifica;
  nota: string | null;
};

const VERIFICA_29 = "Verificato via HTTP il 29/08/2026 (risposta 200).";

/** Record già verificati. Cresce a ogni importazione. */
export const MEDIA_RECORDS: RecordMedia[] = [
  // ── Radio nazionali (censite, NON partner TBH) ───────────────────────────
  {
    id: "RADIO-001",
    categoria: "radio-tv",
    nome: "Radio m2o",
    logoUrl: null,
    immagine1: null,
    immagine2: null,
    galleryUrl: null,
    sito: "https://www.m2o.it/",
    maps: null,
    youtube: null,
    social: [],
    paginaTbh: "/media/radio-tv",
    provenienzaImmagini: "assente",
    fonte: VERIFICA_29,
    stato: "verificato",
    nota: "Media censito, non partner TBH. Frequenze, DAB, app e social ufficiali: da verificare uno per uno prima di pubblicarli.",
  },
  {
    id: "RADIO-002",
    categoria: "radio-tv",
    nome: "Radio Deejay",
    logoUrl: null,
    immagine1: null,
    immagine2: null,
    galleryUrl: null,
    sito: "https://www.deejay.it/",
    maps: null,
    youtube: "https://www.youtube.com/user/radiodeejay",
    social: [{ rete: "Facebook", url: "https://www.facebook.com/RadioDeejay/" }],
    paginaTbh: "/media/radio-tv",
    provenienzaImmagini: "assente",
    fonte: VERIFICA_29,
    stato: "verificato",
    nota: "Media censito, non partner TBH. Instagram e app: da verificare.",
  },
  {
    id: "RADIO-003",
    categoria: "radio-tv",
    nome: "Radio 105",
    logoUrl: null,
    immagine1: null,
    immagine2: null,
    galleryUrl: null,
    sito: "https://www.105.net/",
    maps: null,
    youtube: null,
    social: [{ rete: "Facebook", url: "https://www.facebook.com/Radio105/" }],
    paginaTbh: "/media/radio-tv",
    provenienzaImmagini: "assente",
    fonte: VERIFICA_29,
    stato: "verificato",
    nota: "Media censito, non partner TBH. Canale DTT, Instagram e app: da verificare.",
  },
  {
    id: "RADIO-004",
    categoria: "radio-tv",
    nome: "RTL 102.5",
    logoUrl: null,
    immagine1: null,
    immagine2: null,
    galleryUrl: null,
    sito: "https://rtl.it/",
    maps: null,
    youtube: null,
    social: [{ rete: "Facebook", url: "https://www.facebook.com/RTL102.5/" }],
    paginaTbh: "/media/radio-tv",
    provenienzaImmagini: "assente",
    fonte: VERIFICA_29,
    stato: "verificato",
    nota: "Media censito, non partner TBH. Frequenze, canale TV, Instagram e app: da verificare.",
  },

  // ── Pagine e community di Claudio Ugolini ────────────────────────────────
  {
    id: "FB-001",
    categoria: "social",
    nome: "Showrunner Cinema Radio TV",
    logoUrl: null,
    immagine1: null,
    immagine2: null,
    galleryUrl: null,
    sito: null,
    maps: null,
    youtube: null,
    social: [{ rete: "Facebook", url: "https://www.facebook.com/showrunnercinemaradiotv" }],
    paginaTbh: "/media/radio-tv",
    provenienzaImmagini: "assente",
    fonte: "URL fornito da Claudio il 29/08/2026 e verificato via HTTP (risposta 200).",
    stato: "verificato",
    nota:
      "Facebook non consente di leggere pubblicamente il contenuto della pagina da qui: " +
      "follower, descrizione e altri dati non vengono pubblicati finché non sono verificati.",
  },

  // ── Media partner del gruppo (già acquisiti nel portale) ─────────────────
  {
    id: "MP-001",
    categoria: "media-partner",
    nome: "DM Comunicazioni — Daniele Manuelli Official",
    logoUrl: LOGHI_CHANNEL["dm"]!.src,
    immagine1: null,
    immagine2: null,
    galleryUrl: null,
    sito: null,
    maps: null,
    youtube: "https://www.youtube.com/@DanieleManuelli1981",
    social: [
      { rete: "Facebook", url: "https://www.facebook.com/share/17pCJoQvh4" },
      { rete: "Facebook — Sport Up Rimini", url: "https://www.facebook.com/sportuprimini" },
    ],
    paginaTbh: "/dm",
    provenienzaImmagini: "immagine-ufficiale",
    fonte: "Logo e link ufficiali forniti da Claudio.",
    stato: "verificato",
    nota: "Media partner autonomo: NON è una società del gruppo TBH. Nessun sito web autonomo comunicato.",
  },
  {
    id: "MP-002",
    categoria: "radio-tv",
    nome: "Touch Music Radio TV",
    logoUrl: null,
    immagine1: null,
    immagine2: null,
    galleryUrl: null,
    sito: null,
    maps: null,
    youtube: "https://www.youtube.com/@touchmusicradiotv",
    social: [],
    paginaTbh: "/musica",
    provenienzaImmagini: "assente",
    fonte: VERIFICA_29,
    stato: "verificato",
    nota: "Canale del gruppo: 40 brani DJ Hugò, 16 sigle e spot, 6 servizi cinema, 3 video sport già in catalogo.",
  },
  {
    id: "MUS-001",
    categoria: "musica-tbh",
    nome: "J.C. Hugò — profilo Suno",
    logoUrl: null,
    immagine1: null,
    immagine2: null,
    galleryUrl: null,
    sito: "https://suno.com/@hugoveejay",
    maps: null,
    youtube: "https://www.youtube.com/@touchmusicradiotv",
    social: [],
    paginaTbh: "/musica/jc-hugo",
    provenienzaImmagini: "assente",
    fonte: "Link fornito da Claudio.",
    stato: "verificato",
    nota: "Immagine artista e copertine: da ricevere.",
  },
  {
    id: "REAL-001",
    categoria: "eventi-produzioni",
    nome: "Reality Show Rimini — Giovanili Rimini",
    logoUrl: null,
    immagine1: null,
    immagine2: null,
    galleryUrl: null,
    sito: "https://www.giovanilerimini.org/",
    maps: null,
    youtube: "https://www.youtube.com/@asdgovanileriminifootball7338",
    social: [],
    paginaTbh: "/media/reality-show",
    provenienzaImmagini: "assente",
    fonte: "Link forniti da Claudio il 29/08/2026 e verificati via HTTP (risposta 200).",
    stato: "verificato",
    nota: "Instagram, TikTok e terzo canale dichiarato: non ancora comunicati.",
  },

  // ── Fiere e strutture Touch Travels già verificate ───────────────────────
  {
    id: "FIE-001",
    categoria: "fiere-location",
    nome: "Leipziger Messe",
    logoUrl: null,
    immagine1: null,
    immagine2: null,
    galleryUrl: null,
    sito: "https://www.leipziger-messe.de/",
    maps: "https://www.google.com/maps/search/?api=1&query=Messe-Allee+1%2C+04356+Leipzig",
    youtube: null,
    social: [],
    paginaTbh: "/hugoland",
    provenienzaImmagini: "assente",
    fonte: "Sito ufficiale verificato il 29/08/2026 (Messe-Allee 1, 04356 Lipsia).",
    stato: "verificato",
    nota: null,
  },
  {
    id: "HOT-001",
    categoria: "hotel",
    nome: "Hotel Adlon Kempinski Berlin",
    logoUrl: null,
    immagine1: null,
    immagine2: null,
    galleryUrl: null,
    sito: "https://www.kempinski.com/en/hotel-adlon",
    maps: "https://www.google.com/maps/search/?api=1&query=Unter+den+Linden+77%2C+10117+Berlin",
    youtube: null,
    social: [],
    paginaTbh: "/hugoland",
    provenienzaImmagini: "assente",
    fonte: "Sito ufficiale verificato il 29/08/2026.",
    stato: "verificato",
    nota: null,
  },
  {
    id: "HOT-002",
    categoria: "hotel",
    nome: "Qubus Hotel Kraków",
    logoUrl: null,
    immagine1: null,
    immagine2: null,
    galleryUrl: null,
    sito: "https://www.qubushotel.com/en/hotel-krakow/",
    maps: "https://www.google.com/maps/search/?api=1&query=ul.+Nadwi%C5%9Bla%C5%84ska+6%2C+30-527+Krak%C3%B3w",
    youtube: null,
    social: [],
    paginaTbh: "/hugoland",
    provenienzaImmagini: "assente",
    fonte: "Sito ufficiale verificato il 29/08/2026.",
    stato: "verificato",
    nota: null,
  },
  {
    id: "FIE-002",
    categoria: "fiere-location",
    nome: "Incheba Expo Bratislava",
    logoUrl: null,
    immagine1: null,
    immagine2: null,
    galleryUrl: null,
    sito: "https://www.incheba.sk/",
    maps: "https://www.google.com/maps/search/?api=1&query=Vieden%C5%A1k%C3%A1+cesta+3-7%2C+851+01+Bratislava",
    youtube: null,
    social: [],
    paginaTbh: "/hugoland",
    provenienzaImmagini: "assente",
    fonte: "Sito ufficiale verificato il 29/08/2026.",
    stato: "verificato",
    nota: null,
  },
];

/** Voci richieste ma NON ancora verificabili: restano fuori dal portale finché non arrivano i dati. */
export const MEDIA_DA_RICEVERE = [
  "Casting / Lavoro — link Facebook: nel testo del 29/08/2026 è citato ma l'URL non è stato incollato. Serve il link per attivare il pulsante «Casting e opportunità di lavoro».",
  "Profilo Facebook pubblico di Claudio Ugolini (formato facebook.com/nomeutente, non /share/): senza quello non è possibile censire pagine, gruppi e community collegate.",
  "Loghi ufficiali di radio, TV, fiere e circuiti: si prendono solo dai siti ufficiali, mai ricreati.",
  "Fotografie di eventi e produzioni con provenienza dichiarata (foto nostra / immagine ufficiale utilizzabile / incorporata / URL di riferimento).",
  "Frequenze, canali DTT, app iOS e Android, Instagram e streaming ufficiali delle emittenti censite.",
];

export const MEDIA_NOTA =
  "Media Library TBH: archivio unico di loghi, immagini e collegamenti, con importazione massiva da CSV o JSON. " +
  "I loghi arrivano esclusivamente dai siti ufficiali o dal materiale fornito dalla direzione: nessun logo ricreato. " +
  "I loghi TBH e DM restano gli originali. Ogni record porta fonte e stato di verifica; dove il dato non è verificato il campo resta vuoto. " +
  "Un media censito in questa libreria NON è per questo un partner o un cliente TBH.";

/** Intestazione del tracciato di importazione massiva (CSV e JSON). */
export const TRACCIATO_IMPORT = [
  "id",
  "categoria",
  "nome",
  "logoUrl",
  "immagine1",
  "immagine2",
  "galleryUrl",
  "sito",
  "maps",
  "youtube",
  "social",
  "paginaTbh",
  "provenienzaImmagini",
  "fonte",
  "stato",
  "nota",
];

/** File di esempio scaricabili dalla pagina Media Library. */
export const FILE_IMPORT = {
  csv: "/import/medialibrary-tracciato.csv",
  json: "/import/medialibrary-tracciato.json",
};
