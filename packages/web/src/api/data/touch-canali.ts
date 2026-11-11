/**
 * ────────────────────────────────────────────────────────────────────────────────
 * CANALI E RUBRICHE TBH — regola definitiva di Claudio del 15/10/2026.
 *
 *   TOUCH BUSINESS HOLDING  → il gruppo
 *   TOUCH RADIO             → canale AUDIO, logo proprio
 *   TOUCH TV                → canale VIDEO, logo proprio
 *   PALINSESTO GENERALE     → oggi CONDIVISO dai due canali, domani indipendente
 *   RUBRICHE DEL PALINSESTO → TOUCH MUSIC · DM ON AIR · DM HIGHLIGHTS (+ future)
 *
 * TOUCH MUSIC è una RUBRICA: non è il nome dei canali né del palinsesto.
 *
 * LOGHI. I canali NON hanno ancora un logo assegnato: nessun file esistente legge
 * esattamente «TOUCH RADIO», e i marchi «Touch Music Radio» / «Touch Music TV» /
 * «Touch TV» già nel sito vanno confermati da Claudio prima di diventare i loghi dei
 * canali. Fino all'approvazione lo slot logo resta «IN ATTESA DI APPROVAZIONE» e
 * l'anteprima dei candidati è su /check-web/loghi-canali. Nessun logo generato.
 * ────────────────────────────────────────────────────────────────────────────────
 */
import { TV_RADIO } from "./radio";
import { LOGHI_CHANNEL } from "./loghi-channel";

export const CANALI_ID = ["radio", "tv"] as const;
export type CanaleTouchId = (typeof CANALI_ID)[number];

export const RUBRICHE_ID = ["touch-music", "dm-on-air", "dm-highlights"] as const;
export type RubricaId = (typeof RUBRICHE_ID)[number];

export type ModalitaPalinsesto = "condiviso" | "separati";

/** Chiave della tabella `settings` che tiene la modalità del palinsesto. */
export const CHIAVE_MODALITA = "touch_palinsesto_modalita";
export const MODALITA_INIZIALE: ModalitaPalinsesto = "condiviso";

export type CanaleTouch = {
  id: CanaleTouchId;
  nome: string;
  tipo: "Canale audio" | "Canale video";
  formato: string;
  percorso: string;
  /** null finché Claudio non approva il logo ufficiale del canale. */
  logo: string | null;
  statoLogo: string;
  identita: { etichetta: string; valore: string }[];
  collegamenti: { label: string; href: string; esterno?: boolean }[];
  comando: string;
};

export const CANALI_TOUCH: Record<CanaleTouchId, CanaleTouch> = {
  radio: {
    id: "radio",
    nome: "TOUCH RADIO",
    tipo: "Canale audio",
    formato: "Streaming audio 24/7",
    percorso: "/radio",
    logo: null,
    statoLogo: "IN ATTESA DI APPROVAZIONE",
    identita: [
      { etichetta: "Canale", valore: "TOUCH RADIO" },
      { etichetta: "Tipo", valore: "Canale audio · streaming 24/7" },
      { etichetta: "Gruppo", valore: "Touch Business Holding (TBH)" },
      { etichetta: "Palinsesto", valore: "Palinsesto generale TBH — oggi condiviso con TOUCH TV" },
      { etichetta: "Rubriche", valore: "TOUCH MUSIC · DM ON AIR · DM HIGHLIGHTS" },
      { etichetta: "Ora di riferimento", valore: "Ora di Roma (Europe/Rome)" },
      { etichetta: "Logo ufficiale", valore: "In attesa di approvazione" },
    ],
    collegamenti: [
      { label: "Palinsesto di oggi", href: "/radio/palinsesto" },
      { label: "TOUCH TV", href: "/tv" },
      { label: "Rubriche del palinsesto", href: "/rubriche" },
      { label: "Touch Business Holding", href: "/tbh/societa/touch-business-holding" },
    ],
    comando: "ASCOLTA RADIO",
  },
  tv: {
    id: "tv",
    nome: "TOUCH TV",
    tipo: "Canale video",
    formato: "Streaming video 24/7",
    percorso: "/tv",
    /* 19/10/2026: originale approvato da Claudio (loghi-channel.ts). */
    logo: LOGHI_CHANNEL["touch-tv"]!.src,
    statoLogo: "APPROVATO",
    identita: [
      { etichetta: "Canale", valore: "TOUCH TV" },
      { etichetta: "Tipo", valore: "Canale video · streaming 24/7" },
      { etichetta: "Gruppo", valore: "Touch Business Holding (TBH)" },
      { etichetta: "Palinsesto", valore: "Palinsesto generale TBH — oggi condiviso con TOUCH RADIO" },
      { etichetta: "Rubriche", valore: "TOUCH MUSIC · DM ON AIR · DM HIGHLIGHTS" },
      { etichetta: "Contenuti solo audio", valore: "Copertina ufficiale del brano: nessun videoclip inventato" },
      { etichetta: "Canale YouTube", valore: TV_RADIO.canale.replace("https://www.", "") },
      { etichetta: "Logo ufficiale", valore: "Originale approvato il 19/10/2026" },
    ],
    collegamenti: [
      { label: "Palinsesto di oggi", href: "/tv/palinsesto" },
      { label: "TOUCH RADIO", href: "/radio" },
      { label: "Rubriche del palinsesto", href: "/rubriche" },
      { label: "Touch Business Holding", href: "/tbh/societa/touch-business-holding" },
      { label: "Canale YouTube ufficiale", href: TV_RADIO.canale, esterno: true },
    ],
    comando: "GUARDA TV",
  },
};

export type Rubrica = {
  id: RubricaId;
  nome: string;
  sottotitolo: string;
  descrizione: string;
  /** File originale consegnato; null = logo IN ALLESTIMENTO. */
  logo: string | null;
  appartenenza: "tbh" | "dm";
  colore: string;
  /** Orari dichiarati quando NON stanno nel palinsesto automatico. */
  notaOrari: string | null;
  archivio: { label: string; href: string; esterno?: boolean }[];
};

export const RUBRICHE: Rubrica[] = [
  {
    id: "touch-music",
    nome: "TOUCH MUSIC",
    sottotitolo: "Musica e DJ J.C. Hugò",
    descrizione:
      "La rubrica musicale del palinsesto: i brani originali di J.C. Hugò in rotazione automatica 24/7, " +
      "in ordine diverso ogni giorno, con pausa pubblicitaria ogni 12–15 minuti. DJ set e speciali in allestimento.",
    logo: "/brand/loghi/rubrica-touch-music.jpg",
    appartenenza: "tbh",
    colore: "#d7ff00",
    notaOrari: null,
    archivio: [
      { label: "Catalogo completo J.C. Hugò", href: "/musica/jc-hugo#brani" },
      { label: "Canale YouTube ufficiale", href: TV_RADIO.canale, esterno: true },
    ],
  },
  {
    id: "dm-on-air",
    nome: "DM ON AIR",
    sottotitolo: "Informazione e dirette",
    descrizione:
      "Le dirette dei programmi DM Comunicazioni: negli orari confermati del palinsesto DM la musica lascia " +
      "il posto alla diretta dal canale YouTube ufficiale di Daniele Manuelli.",
    logo: null,
    appartenenza: "dm",
    colore: "#ff2b2b",
    notaOrari: null,
    archivio: [
      { label: "Programmi DM", href: "/dm/programmi" },
      { label: "Canale YouTube DM", href: "https://www.youtube.com/@DanieleManuelli1981", esterno: true },
    ],
  },
  {
    id: "dm-highlights",
    nome: "DM HIGHLIGHTS",
    sottotitolo: "Sport e interviste",
    descrizione:
      "Highlights e interviste delle società seguite da DM Comunicazioni, con i titoli originali pubblicati " +
      "da Daniele Manuelli sul canale ufficiale.",
    logo: null,
    appartenenza: "dm",
    colore: "#ff2b2b",
    notaOrari:
      "Fasce orarie nel palinsesto da confermare: oggi la rubrica non ha ancora uno spazio fisso nella programmazione. " +
      "I contenuti sono disponibili in archivio.",
    archivio: [
      { label: "Archivio Highlights DM", href: "/sport/highlights-dm" },
      { label: "Canale YouTube DM", href: "https://www.youtube.com/@DanieleManuelli1981", esterno: true },
    ],
  },
];

export function rubricaDa(id: string | null | undefined): Rubrica | null {
  return RUBRICHE.find((r) => r.id === id) ?? null;
}

/**
 * ANTEPRIMA LOGHI PER L'APPROVAZIONE — asset ORIGINALI già presenti nel sito.
 * Solo proposta: nessuno di questi file diventa logo di canale senza il sì di Claudio.
 */
export const LOGHI_CANDIDATI = [
  {
    file: "/brand/loghi/touch-music-radio.png",
    scritta: "TOUCH MUSIC RADIO · Feel the music • Live the moment",
    proposta: "Candidato per TOUCH RADIO? La scritta contiene «MUSIC»: va confermato o sostituito con un file «TOUCH RADIO».",
    perCanale: "radio" as CanaleTouchId,
  },
  {
    file: LOGHI_CHANNEL["touch-tv"]!.src,
    scritta: "TOUCH TV · See the future • Live the experience",
    proposta: "APPROVATO il 19/10/2026: originale consegnato dall'editore (Touch TV + Touch Business Holding).",
    perCanale: "tv" as CanaleTouchId,
  },
  {
    file: "/brand/loghi/touch-music-tv.png",
    scritta: "TOUCH MUSIC TV",
    proposta: "Alternativa per TOUCH TV? La scritta contiene «MUSIC»: da confermare.",
    perCanale: "tv" as CanaleTouchId,
  },
];

export const LOGO_RUBRICA_TOUCH_MUSIC = {
  file: "/brand/loghi/rubrica-touch-music.jpg",
  nota: "Logo originale della rubrica TOUCH MUSIC consegnato il 15/10/2026. Usato SOLO per la rubrica, mai per i canali.",
};
