/**
 * ────────────────────────────────────────────────────────────────────────────────
 * TELECOMANDO CANALI TBH — i 17 canali, ordine e dati della specifica di Claudio
 * «TBH-WEB.com — TELECOMANDO MULTICANALE» (16/10/2026).
 *
 * SOLO ANTEPRIMA: il telecomando vive su /check-web/home-canali e le pagine-canale
 * su /check-web/canali/:slug. Home vera, menu e AREE non cambiano senza ok.
 *
 * REGOLE APPLICATE
 *  · prima si collegano le pagine già esistenti (`pagina`): nessun doppione;
 *  · loghi: solo file ORIGINALI già negli asset. `logo.stato`:
 *      "ufficiale"  → file già usato dal sito per quel soggetto (stemmi, DM);
 *      "candidato"  → file originale proposto come logo del CANALE: in anteprima,
 *                     da approvare prima dell'assegnazione;
 *      null         → nessun originale negli asset: LOGO IN ALLESTIMENTO;
 *  · TOUCH MUSIC è una rubrica: il suo logo non va su nessun canale;
 *  · nessun video inventato: i video vengono dall'archivio DM (dm-video.ts) o, per
 *    Gambettola e Rimini, dall'elenco qui sotto, titoli letti sull'oEmbed ufficiale.
 * ────────────────────────────────────────────────────────────────────────────────
 */

import { LOGHI_CHANNEL, notaApprovazione, srcLogoChannel } from "./loghi-channel";

export type StatoCanale = "ON AIR" | "REPLICA" | "CONTENUTI DISPONIBILI" | "IN ALLESTIMENTO";

export type TipoCanale =
  | "tv"
  | "radio"
  | "dm"
  | "squadra"
  | "lavoro"
  | "shop"
  | "motorsport"
  | "miss-cool";

export type LogoCanale = { src: string; stato: "ufficiale" | "candidato"; nota: string } | null;

export type VoceCanale = {
  slug: string;
  nome: string;
  tipo: TipoCanale;
  /** Riga «Programmazione / contenuto» della specifica, alla lettera. */
  programmazione: string;
  /** Pagina GIÀ ESISTENTE del sito che il canale recupera (null = non esiste ancora). */
  pagina: string | null;
  logo: LogoCanale;
  /** Slug della società in sport.ts / dm-video.ts, per i canali squadra. */
  squadra?: string;
  /** Problemi e collegamenti mancanti rilevati dal collaudo del 16/10/2026. */
  problemi: string[];
};

const CANDIDATO = "Logo originale già negli asset, proposto per il canale: da approvare.";

export const CANALI_TELECOMANDO: VoceCanale[] = [
  {
    slug: "touch-tv",
    nome: "Touch TV Channel",
    tipo: "tv",
    programmazione: "Musica, DM in diretta o replica e pubblicità, tutti i giorni",
    pagina: "/tv",
    logo: { src: LOGHI_CHANNEL["touch-tv"]!.src, stato: "ufficiale", nota: notaApprovazione("touch-tv") },
    problemi: [
      "Fasce DM 12:00 · 18:00 · 00:00: attive solo in questa anteprima (repliche delle ultime puntate DM, a turno ogni giorno); /tv non le ha ancora.",
      "Una copertina Suno del palinsesto risponde 403 (immagine del brano non caricata).",
    ],
  },
  {
    slug: "touch-radio",
    nome: "Touch Radio Channel",
    tipo: "radio",
    programmazione: "Highlights DM, interviste casuali delle squadre seguite, musica e pubblicità",
    pagina: "/radio",
    logo: {
      src: "/brand/archivio-73/TBH-019.png",
      stato: "candidato",
      nota: "File originale «RADIO TOUCH» (archivio TBH-019, TOUCH-MUSIC-RADIO1.png): le parole sono invertite, da approvare.",
    },
    problemi: [
      "Highlights e interviste DM esistono solo come video YouTube: la versione AUDIO (estratti autorizzati) è da fornire.",
      "Nessun file originale che legga esattamente «TOUCH RADIO».",
      "Una copertina Suno del palinsesto risponde 403.",
    ],
  },
  {
    slug: "dm-channel",
    nome: "DM Channel",
    tipo: "dm",
    programmazione: "Programmi DM quotidiani, dirette, repliche e archivio",
    pagina: "/dm",
    logo: { src: srcLogoChannel("dm"), stato: "ufficiale", nota: notaApprovazione("dm") },
    problemi: [
      "Regola del 16/10/2026: all'orario ufficiale solo DIRETTA, in ogni altro orario REPLICA delle 29 puntate 2026-27 a rotazione. Le repliche TV sul canale 88 (Made in Bo) restano con orari «da confermare» (dato DM).",
      "Date esatte solo per le 5 puntate presenti nel feed RSS ufficiale del canale: per le altre la data è da confermare.",
    ],
  },
  {
    slug: "verucchio",
    nome: "Verucchio Channel",
    tipo: "squadra",
    squadra: "verucchio",
    programmazione: "Partite, goal, interviste e notizie",
    pagina: "/sport/squadre/verucchio",
    logo: { src: srcLogoChannel("verucchio"), stato: "ufficiale", nota: notaApprovazione("verucchio") },
    problemi: [],
  },
  {
    slug: "victoria",
    nome: "Victoria Channel",
    tipo: "squadra",
    squadra: "victoria-1968",
    programmazione: "Partite, goal, interviste e notizie",
    pagina: "/sport/squadre/victoria-1968",
    logo: { src: srcLogoChannel("victoria"), stato: "ufficiale", nota: notaApprovazione("victoria") },
    problemi: ["Archivio DM ridotto (8 video)."],
  },
  {
    slug: "vis-novafeltria",
    nome: "Vis Novafeltria Channel",
    tipo: "squadra",
    squadra: "vis-novafeltria",
    programmazione: "Partite, goal, interviste e notizie",
    pagina: "/sport/squadre/vis-novafeltria",
    logo: { src: srcLogoChannel("vis-novafeltria"), stato: "ufficiale", nota: notaApprovazione("vis-novafeltria") },
    problemi: [],
  },
  {
    slug: "pietracuta",
    nome: "Pietracuta Channel",
    tipo: "squadra",
    squadra: "pietracuta",
    programmazione: "Partite, goal, interviste e notizie",
    pagina: "/sport/squadre/pietracuta",
    logo: { src: srcLogoChannel("pietracuta"), stato: "ufficiale", nota: notaApprovazione("pietracuta") },
    problemi: [],
  },
  {
    slug: "tropical-coriano",
    nome: "Tropical Coriano Channel",
    tipo: "squadra",
    squadra: "tropical-coriano",
    programmazione: "Partite, goal, interviste e notizie",
    pagina: "/sport/squadre/tropical-coriano",
    logo: { src: srcLogoChannel("tropical-coriano"), stato: "ufficiale", nota: notaApprovazione("tropical-coriano") },
    problemi: [],
  },
  {
    slug: "san-marino",
    nome: "San Marino Channel",
    tipo: "squadra",
    squadra: "san-marino-calcio",
    programmazione: "Partite, goal, interviste e notizie",
    pagina: "/sport/squadre/san-marino-calcio",
    logo: { src: srcLogoChannel("san-marino"), stato: "ufficiale", nota: notaApprovazione("san-marino") },
    problemi: [],
  },
  {
    slug: "gabicce-gradara",
    nome: "Gabicce Gradara Channel",
    tipo: "squadra",
    squadra: "gabicce-gradara",
    programmazione: "Partite, goal, interviste e notizie",
    pagina: "/sport/squadre/gabicce-gradara",
    logo: { src: srcLogoChannel("gabicce-gradara"), stato: "ufficiale", nota: notaApprovazione("gabicce-gradara") },
    problemi: [],
  },
  {
    slug: "bellaria-igea-marina",
    nome: "Bellaria Igea Marina Channel",
    tipo: "squadra",
    squadra: "bellaria-igea-marina",
    programmazione: "Partite, goal, interviste e notizie",
    pagina: "/sport/squadre/bellaria-igea-marina",
    logo: { src: srcLogoChannel("bellaria-igea-marina"), stato: "ufficiale", nota: notaApprovazione("bellaria-igea-marina") },
    problemi: [],
  },
  {
    slug: "junior-gambettola",
    nome: "Junior Gambettola Channel",
    tipo: "squadra",
    squadra: "junior-gambettola",
    programmazione: "Partite, goal, interviste e notizie",
    pagina: null,
    logo: null,
    problemi: [
      "La società non è nell'area sport: /sport/squadre/junior-gambettola risponde «Società non trovata».",
      "Nessuno stemma originale negli asset. 18/10/2026: escluso dai loghi approvati (resta senza logo).",
      "11 video reali del canale DM nominano «Gambettola»: in anteprima, da confermare che siano della Junior Gambettola. Il 17/10 se ne sono aggiunti 2, e uno («Victoria vs Junior Gambettola 2-2») scrive il nome per esteso.",
    ],
  },
  {
    slug: "rimini-calcio",
    nome: "Rimini Calcio Channel",
    tipo: "squadra",
    squadra: "rimini",
    programmazione: "Partite, goal, interviste e notizie",
    pagina: "/sport/squadre/rimini",
    logo: { src: LOGHI_CHANNEL["rimini-calcio"]!.src, stato: "ufficiale", nota: notaApprovazione("rimini-calcio") },
    problemi: [
      "Ordine del 29/08/2026: Rimini società di interesse del territorio, NON seguita da DM. Superato SOLO per il nastro stemmi il 16/10/2026: «Rimini calcio lo metti alla fine del treno di tutte le squadre seguite da DM».",
      "17/10/2026, decisione di Claudio: la pagina società live /sport/squadre/rimini resta com'è, cambia solo il nastro. Per questo i 4 video reali del canale DM sul Rimini restano in anteprima, da confermare.",
    ],
  },
  {
    slug: "bacheca-lavoro",
    nome: "Bacheca Lavoro Channel",
    tipo: "lavoro",
    programmazione: "Annunci, casting, candidature",
    pagina: "/lavoro-casting/bacheca",
    logo: { src: "/brand/archivio-73/TBH-070.png", stato: "candidato", nota: `Touch Human Resources (archivio TBH-070). ${CANDIDATO}` },
    problemi: ["Nessun logo originale «Bacheca Lavoro» / «TBH Lavoro»: proposto Touch Human Resources."],
  },
  {
    slug: "touch-plaza-shop",
    nome: "Touch Plaza Shop Channel",
    tipo: "shop",
    programmazione: "Prodotti, servizi, articoli, corsi e offerte",
    pagina: "/shop",
    logo: { src: LOGHI_CHANNEL["touch-plaza-shop"]!.src, stato: "ufficiale", nota: notaApprovazione("touch-plaza-shop") },
    problemi: ["20 articoli su 35 non hanno ancora un'immagine originale: restano fuori dal carosello (IN ALLESTIMENTO)."],
  },
  {
    slug: "motorsport",
    nome: "Motorsport Channel",
    tipo: "motorsport",
    programmazione: "Canale dedicato, in allestimento",
    pagina: "/sport/motorsport",
    logo: null,
    problemi: [
      "Nessun logo ufficiale Motorsport negli asset.",
      "Nessun video, gara, intervista o highlight riproducibile: canale IN ALLESTIMENTO.",
    ],
  },
  {
    slug: "touch-miss-cool",
    nome: "Touch Miss Cool Channel",
    tipo: "miss-cool",
    programmazione: "Moda, Fotomania, Touch Miss Cool e Touch Miss Cool Web",
    pagina: "/eventi/miss-cool",
    logo: { src: "/brand/archivio-73/TBH-069.jpg", stato: "candidato", nota: `Touch Miss Cool Web (archivio TBH-069). ${CANDIDATO}` },
    problemi: [
      "«Fotomania»: nessun contenuto nel sito.",
      "touchmisscoolweb.com non risponde (nessun DNS).",
    ],
  },
];

/** Gli 8 accessi principali del telecomando (specifica, punto 1). */
export const ACCESSI_PRINCIPALI: { nome: string; sotto: string; canale: string | null; ancora?: string }[] = [
  { nome: "TOUCH TV", sotto: "Musica · DM · Pubblicità", canale: "touch-tv" },
  { nome: "TOUCH RADIO", sotto: "Highlights · Interviste · Musica", canale: "touch-radio" },
  { nome: "DM CHANNEL", sotto: "Programmi quotidiani", canale: "dm-channel" },
  { nome: "SQUADRE DM", sotto: "10 canali calcistici", canale: null, ancora: "squadre-dm" },
  { nome: "LAVORO", sotto: "Bacheca e candidature", canale: "bacheca-lavoro" },
  { nome: "TOUCH PLAZA", sotto: "Negozio e prodotti", canale: "touch-plaza-shop" },
  { nome: "MOTORSPORT", sotto: "Canale in preparazione", canale: "motorsport" },
  { nome: "TOUCH MISS COOL", sotto: "Moda · Fotomania · Concorsi", canale: "touch-miss-cool" },
];

/**
 * Fasce DM di TOUCH TV (specifica, punto 3). Le dirette ufficiali (PALINSESTO_DM)
 * prevalgono sempre: una replica che si sovrappone a una diretta viene tagliata.
 */
export const FASCE_REPLICA_DM = ["00:00", "12:00", "18:00"] as const;

export type VideoArchivio = { id: string; titolo: string; tipo: "highlights" | "interviste" | "servizi" };

/**
 * Video REALI del canale ufficiale DM («Daniele Manuelli -DM Comunicazione-») per le due
 * società fuori da dm-video.ts. Titoli letti il 16/10/2026 sull'endpoint oEmbed ufficiale
 * di YouTube, alla lettera. Mostrati SOLO in anteprima, da confermare.
 */
export const VIDEO_DM_DA_CONFERMARE: Record<string, VideoArchivio[]> = {
  "junior-gambettola": [
    /* aggiunti il 17/10/2026, titoli nativi dall'oEmbed ufficiale */
    { id: "ja7DB9gQw4w", titolo: "Highlights | Prima Categoria | Girone H |  Victoria vs Junior Gambettola 2-2", tipo: "highlights" },
    { id: "VID5J9Tstu4", titolo: "Highlights| Prima Categoria | Girone H |  Gambettola vs Verucchio 1-0", tipo: "highlights" },
    { id: "-wtdf1awUI0", titolo: "PLAY OUT|  Promozione Romagna| Gambettola vs Bellaria I. Marina 1956 0-4", tipo: "highlights" },
    { id: "be2j4jD4Oqg", titolo: "Highlights| Promozione Romagna|  Gambettola vs Bellaria I.Marina 1-1", tipo: "highlights" },
    { id: "gdP5sR1PdPM", titolo: "Highlights| Eccellenza Romagna|  Pietracuta vs Gambettola 1-0", tipo: "highlights" },
    { id: "6axGIlW1bmM", titolo: "Highlights Eccellenza Romagna.  Tropical Coriano vs Gambettola 1-0", tipo: "highlights" },
    { id: "BzANkkfSDAA", titolo: "HIGHLIGHTS. Eccellenza Romagna. Novafeltria vs Gambettola 0-3", tipo: "highlights" },
    { id: "I6W3Kzo67eg", titolo: "Highlights  Ritorno  Coppa Italia Eccellenza. Sestese vs Gambettola 1-1", tipo: "highlights" },
    { id: "8zQPgKWYoA8", titolo: "Highlights. Coppa Italia Eccellenza.  Gambettola vs Sestese 0 -1", tipo: "highlights" },
    { id: "Sp1Nok44t7M", titolo: "Interviste Righini e Fabbri post Gambettola", tipo: "interviste" },
    { id: "ZFM7SDWlRXE", titolo: "Interviste Fregnani e Forti post Gambettola", tipo: "interviste" },
  ],
  rimini: [
    { id: "Js3X0wC2BjY", titolo: "Highlights| Eccellenza Romagna| Girone B | Rimini vs Russi 3-0", tipo: "highlights" },
    { id: "GjUD1KFsk0w", titolo: "Highlights| Eccellenza| Girone B| Rimini vs Novafeltria 2-0", tipo: "highlights" },
    { id: "eRXHeyrnr9s", titolo: "Highlights| Primavera Nazionale Under19| Rimini vs Triestina 0-4", tipo: "highlights" },
    /* aggiunto il 17/10/2026, titolo nativo dall'oEmbed ufficiale */
    { id: "h3nMOxelr3g", titolo: "Highlights | Eccellenza Girone B |  Rimini vs San Marino 1-0", tipo: "highlights" },
  ],
};

/**
 * Società dell'elenco qui sopra che la direzione ha poi messo fra le squadre seguite da DM:
 * i loro video escono dallo stato «da confermare». 16/10/2026: Rimini Calcio («alla fine del
 * treno di tutte le squadre seguite da DM»).
 * 17/10/2026: Claudio decide «Lasciala com'è per ora, solo il nastro cambia» → il Rimini torna
 * fuori da questa lista (i suoi video restano da confermare). Il meccanismo resta pronto.
 */
export const VIDEO_DM_CONFERMATI: string[] = [];

/** Struttura del canale Motorsport (specifica, punto 7): le sezioni restano dichiarate. */
export const SEZIONI_MOTORSPORT = ["Video", "Gare", "Interviste", "Highlights", "Sponsor"] as const;

/** Le quattro voci del canale Touch Miss Cool (specifica, punto 8). */
export const VOCI_MISS_COOL: { nome: string; pagina: string | null; nota: string }[] = [
  { nome: "Touch Miss Cool", pagina: "/eventi/miss-cool", nota: "Concorso 2027: kit digitale, regolamento, premiazioni." },
  { nome: "Touch Miss Cool Web", pagina: "/eventi/miss-cool", nota: "Percorso online del concorso (touchmisscoolweb.com non risponde)." },
  { nome: "Moda", pagina: "/fashion", nota: "Area Fashion & Riviste del sito." },
  { nome: "Fotomania", pagina: null, nota: "IN ALLESTIMENTO: nessun contenuto Fotomania nel sito." },
];
