/**
 * SCHEDE DEI MONITOR — contenuto di ogni monitor del portale.
 * Specifica di Claudio del 16/09/2026, seconda parte («struttura di ogni scheda»).
 *
 * UN MONITOR HA DUE BARRE, E NON SI CONFONDONO MAI:
 *   1. URL CONTENUTO DEL MONITOR  → `contenutoUrl` + `tipoContenuto`
 *      (YouTube, Vimeo, MP4/WebM, JPG/PNG/WebP, pagina interna, diretta, fotogallery).
 *   2. URL O LINK DEL PULSANTE    → `pulsanteUrl` + `pulsante`
 *      La destinazione del pulsante è INDIPENDENTE dal contenuto: il monitor può
 *      mostrare un video promozionale e il pulsante portare al prodotto.
 *
 * REGOLE RISPETTATE
 * · nessuno sponsor inventato: qui ci sono SOLO promo del gruppo TBH e l'annuncio
 *   dello spazio disponibile. I partner veri li inserisce Claudio dal pannello
 *   /allestimento/monitor e finiscono nella tabella `monitor_campagne`;
 * · nessun logo ridisegnato: le immagini sono materiale reale già usato sul sito
 *   (`/brand-visibilita/*`, `/brand/tbh-*`);
 * · nessun prezzo qui dentro: i prezzi restano nel listino ufficiale
 *   (`api/data/adv-tv.ts`) e si leggono sulla pagina di destinazione;
 * · NUMERO DEL CANALE: campo predisposto (`canale`) ma lasciato vuoto. Claudio
 *   consegna la tabella dei numeri a parte: finché non arriva non si stampa
 *   nessun numero, perché un numero sbagliato è un dato inventato;
 * · la pubblicità non sostituisce mai il contenuto ufficiale: quando il contenuto
 *   ufficiale arriva, la campagna scende sotto il monitor (vedi il componente
 *   `web/components/spazio-pubblicitario.tsx`).
 */

/* ════════════════════════ STATI DELLA SCHEDA (8) ════════════════════════ */

export type StatoCampagna =
  | "bozza"
  | "in_attesa"
  | "pubblicita_temporanea"
  | "programmato"
  | "in_onda"
  | "contenuto_ufficiale"
  | "scaduto"
  | "disattivato";

export type InfoStato = {
  codice: StatoCampagna;
  nome: string;
  spiegazione: string;
  /** true = può comparire nei monitor del sito pubblico. */
  pubblico: boolean;
};

export const STATI_CAMPAGNA_INFO: InfoStato[] = [
  {
    codice: "bozza",
    nome: "BOZZA",
    spiegazione: "Solo nel pannello: si vede l'anteprima, il pubblico non la vede.",
    pubblico: false,
  },
  {
    codice: "in_attesa",
    nome: "IN ATTESA",
    spiegazione: "Pronta ma ferma: attende materiale, conferma o pagamento.",
    pubblico: false,
  },
  {
    codice: "pubblicita_temporanea",
    nome: "PUBBLICITÀ TEMPORANEA",
    spiegazione: "Riempie un monitor libero finché non arriva il contenuto ufficiale.",
    pubblico: true,
  },
  {
    codice: "programmato",
    nome: "PROGRAMMATO",
    spiegazione: "Va in onda da sola dentro la finestra di date indicata.",
    pubblico: true,
  },
  {
    codice: "in_onda",
    nome: "IN ONDA",
    spiegazione: "Attiva adesso sul sito pubblico.",
    pubblico: true,
  },
  {
    codice: "contenuto_ufficiale",
    nome: "CONTENUTO UFFICIALE",
    spiegazione: "Contenuto definitivo del canale: ha la precedenza su ogni pubblicità.",
    pubblico: true,
  },
  {
    codice: "scaduto",
    nome: "SCADUTO",
    spiegazione: "Finestra chiusa: resta in archivio con viste e click.",
    pubblico: false,
  },
  {
    codice: "disattivato",
    nome: "DISATTIVATO",
    spiegazione: "Spenta a mano: non entra in nessun monitor.",
    pubblico: false,
  },
];

export const STATI_CAMPAGNA: StatoCampagna[] = STATI_CAMPAGNA_INFO.map((s) => s.codice);

/** Nomi vecchi (prima del 16/09/2026) tradotti nei nuovi otto stati. */
const STATO_VECCHIO: Record<string, StatoCampagna> = {
  ufficiale: "contenuto_ufficiale",
  pubblicita: "pubblicita_temporanea",
  attesa: "in_attesa",
  disattivato: "disattivato",
};

export function normalizzaStato(v: string | null | undefined): StatoCampagna {
  const s = (v ?? "").trim();
  if ((STATI_CAMPAGNA as string[]).includes(s)) return s as StatoCampagna;
  return STATO_VECCHIO[s] ?? "bozza";
}

export function nomeStato(s: StatoCampagna): string {
  return STATI_CAMPAGNA_INFO.find((x) => x.codice === s)?.nome ?? s;
}

export function statoPubblico(s: StatoCampagna): boolean {
  return STATI_CAMPAGNA_INFO.find((x) => x.codice === s)?.pubblico ?? false;
}

/* ════════════════════════ ETICHETTE E DISPOSITIVI ════════════════════════ */

export type EtichettaCampagna = "SPAZIO PUBBLICITARIO" | "PROMO TBH" | "PARTNER DEL CANALE";
export type DispositivoCampagna = "tutti" | "mobile" | "tablet" | "desktop";

export const ETICHETTE_CAMPAGNA: EtichettaCampagna[] = [
  "SPAZIO PUBBLICITARIO",
  "PROMO TBH",
  "PARTNER DEL CANALE",
];

export const DISPOSITIVI_CAMPAGNA: DispositivoCampagna[] = [
  "tutti",
  "mobile",
  "tablet",
  "desktop",
];

/* ════════════════════════ TESTI DEL PULSANTE (12) ════════════════════════ */

/**
 * Elenco chiuso deciso da Claudio il 16/09/2026: solo questi dodici, nessun
 * testo libero. Il pulsante compare solo se ha una destinazione.
 */
export const TESTI_PULSANTE = [
  "APRI SCHEDA",
  "GUARDA ORA",
  "SCOPRI",
  "ACQUISTA",
  "PRENOTA",
  "CANDIDATI",
  "RICHIEDI INFORMAZIONI",
  "MI TROVI QUI",
  "WHATSAPP",
  "ASCOLTA",
  "LEGGI",
  "VAI AL SITO UFFICIALE",
  /* 28/10/2026 — testo ESATTO chiesto da Claudio per lo spot «Offerta da Urlo 122 €». */
  "SCOPRI L'OFFERTA — 122 €",
] as const;

export type TestoPulsante = (typeof TESTI_PULSANTE)[number];

export function normalizzaPulsante(v: string | null | undefined): TestoPulsante | null {
  const s = (v ?? "").trim().toUpperCase();
  if (!s) return null;
  const esatto = TESTI_PULSANTE.find((t) => t === s);
  if (esatto) return esatto;
  // Testi liberi scritti prima dell'elenco chiuso: si traducono nel più vicino.
  if (/acquist|compra|carrello/i.test(s)) return "ACQUISTA";
  if (/prenot|tavolo|bigliett/i.test(s)) return "PRENOTA";
  if (/whatsapp/i.test(s)) return "WHATSAPP";
  if (/ascolt|radio|podcast/i.test(s)) return "ASCOLTA";
  if (/legg|magazine|articol/i.test(s)) return "LEGGI";
  if (/guarda|video|diretta|vedi/i.test(s)) return "GUARDA ORA";
  if (/candidat|lavoro|casting/i.test(s)) return "CANDIDATI";
  if (/inform|contatt|preventiv/i.test(s)) return "RICHIEDI INFORMAZIONI";
  if (/mappa|dove|indirizzo/i.test(s)) return "MI TROVI QUI";
  if (/sito/i.test(s)) return "VAI AL SITO UFFICIALE";
  if (/scopri|formati|posizioni|listino/i.test(s)) return "SCOPRI";
  return "APRI SCHEDA";
}

/* ════════════════════════ TIPO DI CONTENUTO ════════════════════════ */

export type TipoContenuto =
  | "youtube"
  | "vimeo"
  | "video"
  | "immagine"
  | "pagina"
  | "diretta"
  | "fotogallery"
  | "pdf"
  | "carosello"
  | "pubblicita"
  | "nessuno";

export const TIPI_CONTENUTO: { codice: TipoContenuto; nome: string }[] = [
  { codice: "nessuno", nome: "— nessun contenuto (resta IN ALLESTIMENTO)" },
  { codice: "youtube", nome: "Video YouTube" },
  { codice: "vimeo", nome: "Video Vimeo" },
  { codice: "video", nome: "File video MP4 / WebM" },
  { codice: "immagine", nome: "Immagine JPG / PNG / WebP" },
  { codice: "pdf", nome: "Documento PDF (copertina + APRI DOCUMENTO)" },
  { codice: "carosello", nome: "Carosello di più immagini / video" },
  { codice: "pagina", nome: "Pagina web o pagina interna TBH-WEB" },
  { codice: "diretta", nome: "Diretta / streaming" },
  { codice: "fotogallery", nome: "Fotogallery" },
  { codice: "pubblicita", nome: "Contenuto pubblicitario" },
];

/* ═══════════════════ ROTAZIONE DEI CONTENUTI (punto 3) ═══════════════════ */

export type RotazioneCampagna = "ordine" | "casuale";

export const ROTAZIONI_CAMPAGNA: { codice: RotazioneCampagna; nome: string }[] = [
  { codice: "ordine", nome: "Ordine manuale (come impostato)" },
  { codice: "casuale", nome: "Rotazione casuale" },
];

export function normalizzaRotazione(v: string | null | undefined): RotazioneCampagna {
  return (v ?? "").trim() === "casuale" ? "casuale" : "ordine";
}

export function nomeTipoContenuto(t: TipoContenuto): string {
  return TIPI_CONTENUTO.find((x) => x.codice === t)?.nome ?? t;
}

/** Riconosce da solo che cos'è l'URL incollato nella barra del contenuto. */
export function rilevaTipoContenuto(url: string | null | undefined): TipoContenuto {
  const s = (url ?? "").trim();
  if (!s) return "nessuno";
  // Più indirizzi separati da virgola o riga nuova = carosello (punto 2).
  if (indirizzi(s).length > 1) return "carosello";
  if (filePdf(s)) return "pdf";
  if (s.startsWith("/")) {
    if (/galler|foto/i.test(s)) return "fotogallery";
    if (/\.(jpe?g|a?png|webp|avif|gif)(\?|$)/i.test(s)) return "immagine";
    if (/\.(mp4|webm|m4v|mov)(\?|$)/i.test(s)) return "video";
    return "pagina";
  }
  if (/youtube\.com|youtu\.be/i.test(s)) return "youtube";
  if (/vimeo\.com/i.test(s)) return "vimeo";
  if (/\.(m3u8|mpd)(\?|$)/i.test(s) || /twitch\.tv|dailymotion|live/i.test(s)) return "diretta";
  if (/\.(mp4|webm|m4v|mov)(\?|$)/i.test(s)) return "video";
  if (/\.(jpe?g|a?png|webp|avif|gif)(\?|$)/i.test(s)) return "immagine";
  return "pubblicita";
}

/** Spezza una barra URL che può contenere più indirizzi (carosello). */
export function indirizzi(v: string | null | undefined): string[] {
  return (v ?? "")
    .split(/[\n,]+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

/** Indirizzo incorporabile di YouTube / Vimeo, muto e in loop. Null se non lo è. */
export function embedVideo(url: string | null | undefined): string | null {
  const s = (url ?? "").trim();
  if (!s) return null;
  try {
    const u = new URL(s);
    if (u.hostname.includes("youtube.com")) {
      const v = u.searchParams.get("v");
      const lista = u.searchParams.get("list");
      if (v) {
        return `https://www.youtube-nocookie.com/embed/${v}?autoplay=1&mute=1&loop=1&playlist=${v}&controls=0&playsinline=1&rel=0`;
      }
      if (lista) {
        return `https://www.youtube-nocookie.com/embed/videoseries?list=${lista}&autoplay=1&mute=1&controls=0&playsinline=1&rel=0`;
      }
      if (u.pathname.startsWith("/embed/")) return s;
    }
    if (u.hostname === "youtu.be") {
      const id = u.pathname.slice(1);
      if (id) {
        return `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&mute=1&loop=1&playlist=${id}&controls=0&playsinline=1&rel=0`;
      }
    }
    if (u.hostname.includes("vimeo.com")) {
      const id = u.pathname.split("/").filter(Boolean)[0];
      if (id) return `https://player.vimeo.com/video/${id}?autoplay=1&muted=1&loop=1&background=1`;
    }
    return null;
  } catch {
    return null;
  }
}

export function fileVideo(url: string | null | undefined) {
  return /\.(mp4|webm|m4v|mov)(\?|$)/i.test((url ?? "").trim());
}

export function fileImmagine(url: string | null | undefined) {
  return /\.(jpe?g|a?png|webp|avif|gif)(\?|$)/i.test((url ?? "").trim());
}

export function filePdf(url: string | null | undefined) {
  return /\.pdf(\?|#|$)/i.test((url ?? "").trim());
}

/** Un elemento del carosello, già classificato. */
export type ElementoMedia = {
  url: string;
  tipo: TipoContenuto;
  /** Indirizzo incorporabile, per YouTube e Vimeo. */
  embed: string | null;
};

/** Classifica ogni indirizzo della barra contenuto: serve al carosello. */
export function elencoMedia(v: string | null | undefined): ElementoMedia[] {
  return indirizzi(v).map((url) => {
    const tipo = filePdf(url)
      ? ("pdf" as TipoContenuto)
      : fileVideo(url)
        ? ("video" as TipoContenuto)
        : fileImmagine(url)
          ? ("immagine" as TipoContenuto)
          : rilevaTipoContenuto(url);
    return { url, tipo, embed: embedVideo(url) };
  });
}

/* ════════════════════════ CATEGORIE E TEMI ════════════════════════ */

export const TEMI_CAMPAGNA = [
  "sport",
  "musica",
  "azienda",
  "corso",
  "prodotto",
  "servizio",
  "evento",
] as const;

/** Categorie delle schede: servono a raggruppare i monitor nel pannello. */
export const CATEGORIE_MONITOR = [
  "Squadre e sport",
  "Musica e videoclip",
  "Programmi e TV",
  "Aziende del gruppo",
  "Prodotti e shop",
  "Servizi",
  "Corsi e formazione",
  "Eventi",
  "Turismo e hospitality",
  "Lavoro e casting",
  "Spazi pubblicitari",
] as const;

/* ════════════════════════ LA SCHEDA ════════════════════════ */

export type CampagnaMonitor = {
  id: number;
  stato: StatoCampagna;
  etichetta: EtichettaCampagna;
  titolo: string;
  descrizione: string | null;
  sponsor: string | null;
  /** Categoria della scheda (elenco CATEGORIE_MONITOR). */
  categoria: string | null;
  /** Numero del canale: resta null finché Claudio consegna la tabella dei numeri. */
  canale: number | null;
  logoUrl: string | null;
  /** BARRA 1 — contenuto del monitor, qualunque tipo. */
  contenutoUrl: string | null;
  tipoContenuto: TipoContenuto;
  /** Copertina di riserva: si vede se il video non parte o non è ancora in vista. */
  immagineUrl: string | null;
  /** Campo storico: video del monitor. Vale ancora se `contenutoUrl` è vuoto. */
  videoUrl: string | null;
  /** BARRA 2 — destinazione del pulsante, indipendente dal contenuto. */
  pulsanteUrl: string | null;
  pulsante: TestoPulsante | null;
  /** Campi storici della destinazione: valgono se `pulsanteUrl` è vuoto. */
  linkInterno: string | null;
  linkEsterno: string | null;
  /** Temi ammessi: vuoto = qualunque monitor. */
  temi: string[];
  /** Spazi specifici (id record, slug pagina): vuoto = qualunque spazio. */
  spazi: string[];
  dispositivo: DispositivoCampagna;
  priorita: number;
  durataSec: number;
  /** Riproduzione video in loop: SÌ/NO deciso dall'amministratore (punto 1). */
  loop: boolean;
  /** Ordine manuale oppure rotazione casuale (punto 1 e punto 3). */
  rotazione: RotazioneCampagna;
  frequenzaMax: number;
  dal: string | null;
  al: string | null;
  colore: string | null;
  /** true = campagna di riserva scritta nel codice, non una riga del pannello. */
  interna: boolean;
  /**
   * 28/10/2026 — «contain» = locandina mostrata INTERA (nessun ritaglio, nessun velo né
   * testo sopra): serve alle locandine con QR da scansionare. Assente = come prima.
   */
  adatta?: "contain";
  /**
   * 28/10/2026 — promo che si ALTERNA anche alle campagne del pannello (non solo riserva):
   * entra in ogni spazio pubblicitario esistente senza togliere le altre.
   */
  sempreInRotazione?: boolean;
};

/** Destinazione del pulsante: prima la barra nuova, poi i campi storici. */
export function destinazioneCampagna(c: {
  pulsanteUrl?: string | null;
  linkInterno?: string | null;
  linkEsterno?: string | null;
}): { interno: string | null; esterno: string | null } {
  const p = (c.pulsanteUrl ?? "").trim();
  if (p.startsWith("/")) return { interno: p, esterno: null };
  if (p.startsWith("https://") || p.startsWith("http://")) return { interno: null, esterno: p };
  const interno = (c.linkInterno ?? "").trim();
  const esterno = (c.linkEsterno ?? "").trim();
  return { interno: interno || null, esterno: esterno || null };
}

/** Che cosa mostra il vetro del monitor, dedotto da barra 1 + campi storici. */
export function mediaCampagna(c: {
  contenutoUrl?: string | null;
  tipoContenuto?: TipoContenuto | null;
  immagineUrl?: string | null;
  videoUrl?: string | null;
}): {
  tipo: TipoContenuto;
  video: string | null;
  embed: string | null;
  immagine: string | null;
  pagina: string | null;
  /** PDF da aprire col pulsante APRI DOCUMENTO. */
  documento: string | null;
  /** Elementi del carosello: vuoto quando il contenuto è singolo. */
  elenco: ElementoMedia[];
} {
  const grezzo = (c.contenutoUrl ?? "").trim() || null;
  const pezzi = elencoMedia(grezzo);
  const url = pezzi.length > 1 ? (pezzi[0]?.url ?? null) : grezzo;
  const tipo =
    c.tipoContenuto && c.tipoContenuto !== "nessuno"
      ? pezzi.length > 1
        ? "carosello"
        : c.tipoContenuto
      : rilevaTipoContenuto(grezzo ?? c.videoUrl ?? c.immagineUrl);

  const copertina = (c.immagineUrl ?? "").trim() || null;
  const videoStorico = (c.videoUrl ?? "").trim() || null;

  const candidatoVideo = url && fileVideo(url) ? url : fileVideo(videoStorico) ? videoStorico : null;
  const candidatoEmbed = embedVideo(url) ?? embedVideo(videoStorico);
  const candidatoImmagine = url && fileImmagine(url) ? url : copertina;
  const vuoti = { documento: null, elenco: [] as ElementoMedia[] };

  switch (tipo) {
    case "carosello":
      return {
        tipo,
        video: null,
        embed: null,
        immagine: copertina ?? pezzi.find((p) => p.tipo === "immagine")?.url ?? null,
        pagina: null,
        documento: null,
        elenco: pezzi,
      };
    case "pdf":
      return {
        tipo,
        video: null,
        embed: null,
        // Copertina: solo se caricata davvero. Niente immagine inventata.
        immagine: copertina,
        pagina: null,
        documento: url,
        elenco: [],
      };
  }

  switch (tipo) {
    case "youtube":
    case "vimeo":
    case "diretta":
      return {
        tipo,
        video: null,
        embed: candidatoEmbed,
        immagine: copertina,
        pagina: null,
        ...vuoti,
      };
    case "video":
      return { tipo, video: candidatoVideo, embed: null, immagine: copertina, pagina: null, ...vuoti };
    case "immagine":
      return { tipo, video: null, embed: null, immagine: candidatoImmagine, pagina: null, ...vuoti };
    case "pagina":
    case "fotogallery":
      return { tipo, video: null, embed: null, immagine: copertina, pagina: url, ...vuoti };
    case "pubblicita":
      return {
        tipo,
        video: candidatoVideo,
        embed: candidatoVideo ? null : candidatoEmbed,
        immagine: candidatoImmagine,
        pagina: null,
        ...vuoti,
      };
    default:
      return {
        tipo: candidatoVideo || candidatoEmbed || candidatoImmagine ? "pubblicita" : "nessuno",
        video: candidatoVideo,
        embed: candidatoVideo ? null : candidatoEmbed,
        immagine: candidatoImmagine,
        pagina: null,
        ...vuoti,
      };
  }
}

/** Nota discreta che accompagna sempre uno spazio temporaneo. */
export const NOTA_CONTENUTO_UFFICIALE = "Contenuto ufficiale del canale in preparazione.";

/**
 * Testo obbligatorio degli spazi ancora senza contenuto (specifica 16/09/2026,
 * punto 1). Riesportato qui perché ogni monitor lo usa.
 */
export { IN_ALLESTIMENTO_TITOLO, IN_ALLESTIMENTO_NOTA } from "./allestimento-vuoto";

const NEON = "#d9ff00";

type Riserva = {
  id: number;
  etichetta: EtichettaCampagna;
  titolo: string;
  descrizione: string;
  categoria: string;
  logoUrl?: string | null;
  contenutoUrl?: string | null;
  immagineUrl?: string | null;
  pulsanteUrl: string;
  pulsante: TestoPulsante;
  temi?: string[];
  priorita: number;
  durataSec: number;
  colore: string;
  adatta?: "contain";
  sempreInRotazione?: boolean;
  rotazione?: RotazioneCampagna;
};

/** Costruisce una promo di riserva con tutti i campi della scheda compilati. */
function riserva(r: Riserva): CampagnaMonitor {
  const contenutoUrl = r.contenutoUrl ?? r.immagineUrl ?? null;
  return {
    id: r.id,
    stato: "pubblicita_temporanea",
    etichetta: r.etichetta,
    titolo: r.titolo,
    descrizione: r.descrizione,
    sponsor: null,
    categoria: r.categoria,
    canale: null,
    logoUrl: r.logoUrl ?? null,
    contenutoUrl,
    tipoContenuto: rilevaTipoContenuto(contenutoUrl),
    immagineUrl: r.immagineUrl ?? null,
    videoUrl: null,
    pulsanteUrl: r.pulsanteUrl,
    pulsante: r.pulsante,
    linkInterno: r.pulsanteUrl.startsWith("/") ? r.pulsanteUrl : null,
    linkEsterno: r.pulsanteUrl.startsWith("/") ? null : r.pulsanteUrl,
    temi: r.temi ?? [],
    spazi: [],
    dispositivo: "tutti",
    priorita: r.priorita,
    durataSec: r.durataSec,
    loop: true,
    rotazione: r.rotazione ?? "ordine",
    frequenzaMax: 0,
    dal: null,
    al: null,
    colore: r.colore,
    interna: true,
    ...(r.adatta ? { adatta: r.adatta } : {}),
    ...(r.sempreInRotazione ? { sempreInRotazione: true } : {}),
  };
}

/**
 * PROMO DI RISERVA — valgono quando il pannello non ha ancora campagne per quello
 * spazio. Sono pagine reali del portale: chi clicca arriva dove promesso.
 */
export const CAMPAGNE_TBH: CampagnaMonitor[] = [
  riserva({
    id: -1,
    etichetta: "SPAZIO PUBBLICITARIO",
    titolo: "Questo monitor è disponibile per la tua azienda",
    descrizione:
      "TV & STREAMING ADV: cornice durante il programma, spot fullscreen, landing dedicata e report. Listino e formati sulla pagina ufficiale.",
    categoria: "Spazi pubblicitari",
    logoUrl: "/brand/tbh-logo-orizzontale.png",
    immagineUrl: "/brand/tbh-logo-skyline-nero.jpg",
    pulsanteUrl: "/shop/tv-streaming-adv",
    pulsante: "SCOPRI",
    priorita: 60,
    durataSec: 14,
    colore: NEON,
  }),
  riserva({
    id: -2,
    etichetta: "PROMO TBH",
    titolo: "Il tuo marchio dentro il programma sportivo",
    descrizione:
      "Dieci ruoli da partner in una sola partita: sigla, bordo campo, grafica del risultato, interviste e post-partita.",
    categoria: "Spazi pubblicitari",
    immagineUrl: "/brand-visibilita/sportivo.jpg",
    pulsanteUrl: "/tbh/brand-personalizzazioni/visibilita-in-onda",
    pulsante: "SCOPRI",
    temi: ["sport"],
    priorita: 70,
    durataSec: 14,
    colore: "#22d3ee",
  }),
  riserva({
    id: -3,
    etichetta: "PROMO TBH",
    titolo: "Diretta, replay e highlights delle società seguite",
    descrizione:
      "Calendario, squadre e sintesi pubblicate dai media partner del canale Sport TBH.",
    categoria: "Squadre e sport",
    immagineUrl: "/brand-visibilita/diretta.jpg",
    pulsanteUrl: "/sport/calendario",
    pulsante: "APRI SCHEDA",
    temi: ["sport", "evento"],
    priorita: 50,
    durataSec: 12,
    colore: "#22d3ee",
  }),
  riserva({
    id: -4,
    etichetta: "PROMO TBH",
    titolo: "Postazione radio e video-podcast",
    descrizione:
      "Nove posizioni tra audio e video per chi vuole essere ospite o partner delle trasmissioni musicali.",
    categoria: "Musica e videoclip",
    immagineUrl: "/brand-visibilita/radio.jpg",
    pulsanteUrl: "/media/radio-tv",
    pulsante: "ASCOLTA",
    temi: ["musica"],
    priorita: 70,
    durataSec: 14,
    colore: "#f472b6",
  }),
  riserva({
    id: -5,
    etichetta: "PROMO TBH",
    titolo: "Trasmissione in studio: 16 posizioni in una puntata",
    descrizione:
      "Dalla scenografia alla grafica, dal leggio al monitor di fondo: come entra un marchio in una puntata TBH.",
    categoria: "Programmi e TV",
    immagineUrl: "/brand-visibilita/studio.jpg",
    pulsanteUrl: "/tbh/brand-personalizzazioni/visibilita-in-onda",
    pulsante: "SCOPRI",
    temi: ["azienda", "servizio", "prodotto"],
    priorita: 65,
    durataSec: 14,
    colore: NEON,
  }),
  riserva({
    id: -6,
    etichetta: "PROMO TBH",
    titolo: "Intervista durante l'evento",
    descrizione:
      "Dieci posizioni sul posto e nel post-evento: il marchio resta nelle gallery e negli archivi del canale.",
    categoria: "Eventi",
    immagineUrl: "/brand-visibilita/evento.jpg",
    pulsanteUrl: "/tbh/brand-personalizzazioni/visibilita-in-onda",
    pulsante: "SCOPRI",
    temi: ["evento", "corso"],
    priorita: 60,
    durataSec: 13,
    colore: "#f59e0b",
  }),
  riserva({
    id: -7,
    etichetta: "PROMO TBH",
    titolo: "Touch Business Hub · la guida dei 24 canali",
    descrizione:
      "Ogni canale, ogni numero, ogni programma: la regia completa del network in una sola pagina.",
    categoria: "Programmi e TV",
    logoUrl: "/brand/tbh-logo-orizzontale.png",
    immagineUrl: "/brand/tbh-master-neon.jpg",
    pulsanteUrl: "/guida",
    pulsante: "APRI SCHEDA",
    priorita: 30,
    durataSec: 12,
    colore: NEON,
  }),
  /**
   * 28/10/2026 — SPOT PROMO RANDOM «TBH Art & Entertainment Network — Offerta da Urlo 122 €
   * una tantum» (istruzioni di Claudio). Locandina ufficiale INTERA (adatta: contain, nessun
   * testo sopra), pulsante «SCOPRI L'OFFERTA — 122 €» → Payment Link Stripe, 20 s per
   * passaggio (15–30 richiesti), temi vuoti = ogni monitor; `sempreInRotazione` = si alterna
   * anche alle campagne del pannello. Attiva finché non la si spegne dal pannello monitor
   * (/allestimento/monitor → Promo di riserva).
   */
  riserva({
    id: -8,
    etichetta: "PROMO TBH",
    titolo: "TBH Art & Entertainment Network — Offerta da Urlo 122 € una tantum",
    descrizione:
      "Iscrizione gratuita. Pacchetto promozionale base: 122 € UNA TANTUM. PAGHI UNA VOLTA E NON PAGHI PIÙ PER IL PACCHETTO BASE! " +
      "Nessun rinnovo obbligatorio. Piani Circuito TBH, canali esclusivi e servizi extra esclusi. " +
      "Passaggi e prestazioni secondo regolamento; nessun ingaggio garantito.",
    categoria: "Prodotti e shop",
    immagineUrl: "/shop/offerta-122/locandina-tbh-art-entertainment-network.apng",
    pulsanteUrl: "https://buy.stripe.com/dRmcMZdiJ9QJ29l8iIfQI0i",
    pulsante: "SCOPRI L'OFFERTA — 122 €",
    priorita: 75,
    durataSec: 20,
    colore: NEON,
    adatta: "contain",
    sempreInRotazione: true,
  }),
];
