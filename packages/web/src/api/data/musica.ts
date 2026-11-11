/**
 * AREA MUSICA / HUGÒ — brief "PORTALE A MONITOR", punto 3.
 *
 * REGOLE RISPETTATE ALLA LETTERA:
 * · SOLO link ufficiali già confermati da Claudio: profilo Suno, playlist YouTube, pagina Facebook;
 * · nessun titolo di brano, data di uscita, discografia o evento inventati: i blocchi restano
 *   dichiarati "in allestimento" finché non arriva l'elenco reale;
 * · nessuna foto ricreata: `foto` null → nome per esteso, come per i loghi;
 * · nessun prezzo di booking pubblicato: la richiesta passa da WhatsApp.
 */

import type { StatoSpazio } from "./sport";

export const HUGO = {
  slug: "jc-hugo",
  nome: "J.C. Hugò",
  nomeEsteso: "J.C. Hugò — Deejay, producer e voce del gruppo TBH",
  payoff: "Musica, videoclip e serate del mondo Touch.",
  colore: "#b46bff",
  /** Foto ufficiale da ricevere: nessuna immagine generata. */
  foto: null as string | null,
  esterni: [
    { rete: "Suno", url: "https://suno.com/@hugoveejay", nota: "Profilo ufficiale con i brani." },
    {
      rete: "YouTube",
      url: "https://youtube.com/playlist?list=PL49Zpi4F05aeSrQjiJE0Bv0SM0GlLhetc",
      nota: "Playlist ufficiale videoclip e brani.",
    },
    { rete: "Facebook", url: "https://www.facebook.com/share/17eYrSEhzB/", nota: "Pagina ufficiale." },
    {
      rete: "YouTube",
      url: "https://www.youtube.com/@touchmusicradiotv",
      nota: "Canale ufficiale Touch Music Radio TV (verificato il 29/08/2026).",
    },
  ],
  monitor: [
    {
      titolo: "MONITOR VIDEOCLIP",
      url: null as string | null,
      cta: "Guarda i videoclip",
      /** Playlist ufficiale: l'archivio esiste ed è reale. */
      archivio: "https://youtube.com/playlist?list=PL49Zpi4F05aeSrQjiJE0Bv0SM0GlLhetc" as string | null,
    },
    {
      titolo: "MONITOR AUDIO — ASCOLTA I BRANI",
      url: null as string | null,
      cta: "Ascolta su Suno",
      archivio: "https://suno.com/@hugoveejay" as string | null,
    },
  ],
  blocchi: [
    {
      titolo: "Discografia",
      attesa: "Elenco ufficiale dei brani con titoli e date da ricevere: nessun titolo viene inventato.",
    },
    {
      titolo: "Video",
      attesa: "I video ufficiali sono nella playlist YouTube. Elenco per singolo videoclip da ricevere.",
    },
    { titolo: "News", attesa: "Comunicati e uscite da pubblicare quando arrivano." },
    { titolo: "Eventi e date", attesa: "Date confermate da ricevere: nessuna data inventata." },
    { titolo: "Gallery", attesa: "Foto ufficiali da ricevere." },
  ],
  spazi: [
    {
      titolo: "Spot dentro i videoclip",
      descrizione: "Presenza del brand nei contenuti video, con logo ufficiale e pagina interna dedicata.",
      stato: "disponibile-da-confermare" as StatoSpazio,
    },
    {
      titolo: "Partner serata / evento",
      descrizione: "Presenza commerciale sulle serate e sui set del progetto musicale.",
      stato: "disponibile-da-confermare" as StatoSpazio,
    },
  ],
};

/**
 * SLOT BRANI — ordine di Claudio (29/08/2026): «VOGLIO CHE SI VEDANO TUTTI I BRANI
 * PER ASCOLTARLI E SOPRA IL MONITOR CON CUI INSERIRE URL DEL BRANO STESSO».
 *
 * L'elenco ufficiale dei titoli NON è ancora arrivato: quindi NESSUN titolo viene inventato.
 * Qui ci sono slot numerati e dichiarati, ognuno con il proprio spazio URL: appena arrivano
 * i titoli reali (o i link Suno dei singoli brani) prendono il posto degli slot.
 */
export type SlotBrano = {
  numero: number;
  /** Titolo ufficiale: null finché non lo riceviamo. Nessun titolo di fantasia. */
  titolo: string | null;
  /** URL ufficiale del brano: null finché non lo riceviamo. */
  url: string | null;
};

/**
 * CATALOGO VIDEO UFFICIALE — canale YouTube «Touch Music Radio TV».
 *
 * Estratto il 29/08/2026 dal canale ufficiale https://www.youtube.com/@touchmusicradiotv
 * su ordine di Claudio («prelevi tutti i video e url x DJ Hugò»).
 * TITOLI E URL COPIATI ALLA LETTERA dal canale: nessun titolo riscritto, nessun link costruito
 * a mano, nessuna data di uscita e nessuna discografia inventata.
 */

export const CANALE_TOUCH_MUSIC = "https://www.youtube.com/@touchmusicradiotv";

export type VoceVideo = { numero: number; titolo: string; url: string };

/** Brani e videoclip di DJ Hugò / Touch Music. */
export const BRANI_HUGO: VoceVideo[] = [
  { numero: 1, titolo: "Carina Ninna Nanna by Hugo DJ", url: "https://www.youtube.com/watch?v=wxHTkUBHsVo" },
  { numero: 2, titolo: "DJHugoFile0", url: "https://www.youtube.com/watch?v=1nj6TUe-0KY" },
  { numero: 3, titolo: "HAPPY BIRTH BY TOUCH MUSIC FEAT DJ HUGO", url: "https://www.youtube.com/watch?v=aRnCXHHqPq8" },
  { numero: 4, titolo: "VERTIGO HIGH - HUGO DJ - TOUCH MUSIC RADIO", url: "https://www.youtube.com/watch?v=t_vPR-y0ybM" },
  { numero: 5, titolo: "Ariete - Aries - Infinite Energy - DJ Hugo", url: "https://www.youtube.com/watch?v=Y9944vJB32U" },
  { numero: 6, titolo: "Ariete - Aries - First Spark Ignition - DJ Hugo", url: "https://www.youtube.com/watch?v=vJaffpdcwjA" },
  { numero: 7, titolo: "Ariete - Aries - Aperitivo Mood - DJ Hugo", url: "https://www.youtube.com/watch?v=kEFaEklABos" },
  { numero: 8, titolo: "Ariete - Aries - Deep Horizon  - DJ Hugo", url: "https://www.youtube.com/watch?v=-yed5p88RfA" },
  { numero: 9, titolo: "Ariete Relax - Aries Sadness Epic by DJ Hugo", url: "https://www.youtube.com/watch?v=i6dU2OK4ilA" },
  { numero: 10, titolo: "Toro - Taurus - The Bull’s Serenity - DJ Hugo", url: "https://www.youtube.com/watch?v=EUnFJUP7Oi4" },
  { numero: 11, titolo: "Toro - Taurus - Steadfast Soul - DJ Hugo", url: "https://www.youtube.com/watch?v=AF04_bGc9So" },
  { numero: 12, titolo: "GEMINI - GEMELLI - DJ HUGO - TOUCH MUSIC", url: "https://www.youtube.com/watch?v=1u0g2eHK8Us" },
  { numero: 13, titolo: "Black Pearl - Come on Where we go", url: "https://www.youtube.com/watch?v=QEUeaXtEuQk" },
  { numero: 14, titolo: "Black Pearl SoundTracks - DJ Hugo - Touch Music", url: "https://www.youtube.com/watch?v=QYowBaqaEWM" },
  { numero: 15, titolo: "BALLA E DANZA CON ME - DJ HUGO - TOUCH MUSIC", url: "https://www.youtube.com/watch?v=tokyERDfoK8" },
  { numero: 16, titolo: "FAKIRO SHOW - HUGO DJ - TOUCH MUSIC", url: "https://www.youtube.com/watch?v=yCFJJo_aE5w" },
  { numero: 17, titolo: "HUGOLAND RAGGAE - DJ HUGO - TOUCH MUSIC", url: "https://www.youtube.com/watch?v=cRlK_4ESN3w" },
  { numero: 18, titolo: "VERDE - MINICLUB - DJ HUGO - TOUCH MUSIC", url: "https://www.youtube.com/watch?v=XoMowJPnWFQ" },
  { numero: 19, titolo: "BUON NATALE - DJ HUGO - TOUCH MUSIC", url: "https://www.youtube.com/watch?v=Ocip40lQEXI" },
  { numero: 20, titolo: "DISTANZE 0 - DJ HUGO - TOUCH MUSIC", url: "https://www.youtube.com/watch?v=q9LLL9BY7EQ" },
  { numero: 21, titolo: "DEEJAY HUGO - DJ HUGO - TOUCH MUSIC", url: "https://www.youtube.com/watch?v=J7cGiEotUPU" },
  { numero: 22, titolo: "MG - DJ HUGO", url: "https://www.youtube.com/watch?v=e0mCQI7BaC8" },
  { numero: 23, titolo: "FACCIAMO CASINO - DJ HUGO - TOUCH MUSIC", url: "https://www.youtube.com/watch?v=zlJrg3smGKc" },
  { numero: 24, titolo: "SKIES NEON - DJ HUGO - TOUCH MUSIC", url: "https://www.youtube.com/watch?v=kWmRf2iM-Qc" },
  { numero: 25, titolo: "VALHALLA - DJ HUGO - TOUCH MUSIC", url: "https://www.youtube.com/watch?v=xIp6yrPnBfc" },
  { numero: 26, titolo: "METROPOLITAN - TOUCH MUSIC", url: "https://www.youtube.com/watch?v=obwwZQfyqus" },
  { numero: 27, titolo: "Melissa Loop   DJ Hugo   Touch Music", url: "https://www.youtube.com/watch?v=v1KrG-dwzKI" },
  { numero: 28, titolo: "Colei che amo - DJ Hugo - Touch Music", url: "https://www.youtube.com/watch?v=2zoCSLYajWk" },
  { numero: 29, titolo: "Io amo te - DJ Hugo - Touch Music", url: "https://www.youtube.com/watch?v=43DG59gtVKE" },
  { numero: 30, titolo: "Ombre nella luce - DJ Hugo - Touch Music", url: "https://www.youtube.com/watch?v=qaI7_PSW188" },
  { numero: 31, titolo: "Il mio amore per noi", url: "https://www.youtube.com/watch?v=58fj2uTRuGk" },
  { numero: 32, titolo: "ZumbaFitness HugoDJ TouchMusic", url: "https://www.youtube.com/watch?v=g3G38r8m6xI" },
  { numero: 33, titolo: "TOUCH MUSIC   DJ HUGO   A QUEL PAESE DEVI ANDARE", url: "https://www.youtube.com/watch?v=cX19QishB84" },
  { numero: 34, titolo: "TOUCH MUSIC   DJ HUGO   A QUEL PAESE DEVI ANDARE", url: "https://www.youtube.com/watch?v=KtbwfLQtA40" },
  { numero: 35, titolo: "TOUCH MUSIC DJ HUGO ANDIAMO A BALLARE A RIMINI", url: "https://www.youtube.com/watch?v=D3kYCOStBBo" },
  { numero: 36, titolo: "Capitan Touch colonna sonora del film", url: "https://www.youtube.com/watch?v=oFxoGC2AVRM" },
  { numero: 37, titolo: "TOCCA LA MUSICA", url: "https://www.youtube.com/watch?v=2h6CK3ZlPq4" },
  { numero: 38, titolo: "TOUCHMUSIC", url: "https://www.youtube.com/watch?v=y4-TfC4x1_w" },
  { numero: 39, titolo: "TOUCH MUSIC", url: "https://www.youtube.com/watch?v=KaSNhFwmIEA" },
  { numero: 40, titolo: "TANTI AUGURI MANUEL", url: "https://www.youtube.com/watch?v=hTCrxjNSmoQ" },
];

/** Sigle e spot del gruppo TBH presenti sullo stesso canale. */
export const SIGLE_SPOT_TBH: VoceVideo[] = [
  { numero: 1, titolo: "Sigla Spot Touch Music TV", url: "https://www.youtube.com/watch?v=hwGW0SDB9LQ" },
  { numero: 2, titolo: "Sigla Rubriche Touch Music Radio", url: "https://www.youtube.com/watch?v=Lvzg2NwtJb0" },
  { numero: 3, titolo: "Sigla Touch Shopping Completa", url: "https://www.youtube.com/watch?v=kSuMsQxavc4" },
  { numero: 4, titolo: "Sigla Touch Pay Store", url: "https://www.youtube.com/watch?v=uUJVKD0ZUkQ" },
  { numero: 5, titolo: "Sigla Padova Pride & Sport Village", url: "https://www.youtube.com/watch?v=6zJGTHqlPX4" },
  { numero: 6, titolo: "Sigla Padova Pride & Sport Village", url: "https://www.youtube.com/watch?v=quFjiwHZFTQ" },
  { numero: 7, titolo: "Touch Jobs Commercial 1.0", url: "https://www.youtube.com/watch?v=d0RyM2Sgqys" },
  { numero: 8, titolo: "Spot Casting & Jobs", url: "https://www.youtube.com/watch?v=W3uRnOvNMHo" },
  { numero: 9, titolo: "Spot Touch Village Entertainment Srl", url: "https://www.youtube.com/watch?v=p0fTRxZAqBo" },
  { numero: 10, titolo: "Spot Metropolitan Servizi Srl IT10971100960", url: "https://www.youtube.com/watch?v=-xnwxhjEAVI" },
  { numero: 11, titolo: "Spot TBH", url: "https://www.youtube.com/watch?v=ZWR6FRd7FOA" },
  { numero: 12, titolo: "TBH - TOUCH BUSINESS HOLDING - WWW.TOUCHBUSINESS.COM", url: "https://www.youtube.com/watch?v=SdcJ8SAlIfA" },
  { numero: 13, titolo: "SpotTV", url: "https://www.youtube.com/watch?v=Uq6SeAvJPik" },
  { numero: 14, titolo: "Entra anche tu nella nostra Crew", url: "https://www.youtube.com/watch?v=9N2lhzrxpH4" },
  { numero: 15, titolo: "Benvenuti su Touch Cafè, il luogo ideale per gli amanti del caffè e delle esperienze uniche!", url: "https://www.youtube.com/watch?v=MNlosZsuZPg" },
  { numero: 16, titolo: "SIT COM FIT & GNAM INTRO E TITOLI", url: "https://www.youtube.com/watch?v=83faFenjvHw" },
];

/** Servizi cinema e audiovisivi. */
export const SERVIZI_CINEMA: VoceVideo[] = [
  { numero: 1, titolo: "TOUCH CINEMA", url: "https://www.youtube.com/watch?v=m95wLYErsz4" },
  { numero: 2, titolo: "EMILIA ROMAGNA SERVIZI CINEMA", url: "https://www.youtube.com/watch?v=SgFbLFe6ris" },
  { numero: 3, titolo: "LIGURIA SERVIZI CINEMA", url: "https://www.youtube.com/watch?v=VqgWStlBKM8" },
  { numero: 4, titolo: "SICILIA SERVIZI CINEMA", url: "https://www.youtube.com/watch?v=8hZEzWy3GN4" },
  { numero: 5, titolo: "PIETRA PAOLA MARINA SERVIZI CINEMA", url: "https://www.youtube.com/watch?v=_msbkyuUU6k" },
  { numero: 6, titolo: "Sport servizi audiovisivi", url: "https://www.youtube.com/watch?v=Hm_v29hNDU0" },
];

/** Materiale sportivo sul canale. NON è etichettato come «partita integrale» né
 *  «highlights»: il titolo del video non lo dice e la conferma non è arrivata. */
export const VIDEO_SPORT: VoceVideo[] = [
  { numero: 1, titolo: "VERUCCHIO  - TORCONCA", url: "https://www.youtube.com/watch?v=bMA52sWy2YQ" },
  { numero: 2, titolo: "VERUCCHIO GRANATA", url: "https://www.youtube.com/watch?v=1_1fOXUaP10" },
  { numero: 3, titolo: "Giovanile Rimini Football Academy", url: "https://www.youtube.com/watch?v=yFrQBeA7wmg" },
];

/** Compatibilità: il portale continua a leggere SLOT_BRANI, che ora contiene i brani reali. */
export const SLOT_BRANI: SlotBrano[] = BRANI_HUGO;

export const NUMERO_SLOT_BRANI = 40;

export const BRANI_NOTA =
  "Playlist ufficiale del canale YouTube Touch Music Radio TV, estratta il 29/08/2026: " +
  "40 brani e videoclip di DJ Hugò con titolo e link reali, copiati alla lettera dal canale. " +
  "Nessun titolo è stato riscritto e nessuna data di uscita è stata aggiunta: la discografia con date " +
  "ufficiali resta da ricevere. Sul canale ci sono anche sigle, spot TBH, servizi cinema e materiale " +
  "sportivo, elencati a parte.";

export const MUSICA_NOTA =
  "Il progetto musicale pubblica solo i canali ufficiali confermati. Discografia, date ed eventi compaiono appena riceviamo l'elenco reale: nessun titolo, nessuna data e nessun compenso di booking vengono inventati.";

/* ══════════════════════════════════════════════════════════════════════════════
   CATALOGO MASTER DEI BRANI — Priorità 2ter (ordine di Claudio del 29/09/2026).

   «I brani sono AUDIO PUBBLICATO. Non sono produzioni audiovisive già realizzate.»

   Qui nasce il RECORD UNICO del brano: titolo, copertina, audio, stato dell'audio e i
   campi del videoclip. Non è un secondo elenco: è `BRANI_HUGO` — i 40 titoli reali del
   canale Touch Music Radio TV — letto con i campi che servono alla classificazione.
   Lo stato del videoclip arriva dalla tabella `brani_video`, dove lo scrive la direzione
   dal pannello: finché non c'è, il brano resta SOLO AUDIO.

   Perché parte da SOLO AUDIO e non da «videoclip pubblicato»: sul canale ufficiale non è
   scritto quali caricamenti sono videoclip girati e quali sono l'audio con la copertina
   ferma. L'unica cosa certa è che l'AUDIO è pubblicato, quindi è l'unica cosa dichiarata.
   Regola di Claudio: «vietato mostrare il simbolo VIDEO su brani che hanno solo audio».
   ══════════════════════════════════════════════════════════════════════════════ */

/** I tre stati del videoclip, e nessun altro. */
export const STATI_VIDEO = ["da-realizzare", "in-produzione", "pubblicato"] as const;
export type StatoVideo = (typeof STATI_VIDEO)[number];

/**
 * Le fasi di lavorazione, valide solo mentre il videoclip è `in-produzione`.
 * Ordine dato dalla direzione il 29/09/2026 (secondo invio):
 * CONCEPT → CASTING → PRE-PRODUZIONE → RIPRESE → MONTAGGIO → POST-PRODUZIONE → COMPLETAMENTO.
 */
export const FASI_PRODUZIONE = [
  "concept",
  "casting",
  "pre-produzione",
  "riprese",
  "montaggio",
  "post-produzione",
  "completamento",
] as const;
export type FaseProduzione = (typeof FASI_PRODUZIONE)[number];

/** La classificazione che il visitatore vede: tre sole etichette. */
export type ClasseBrano = "solo-audio" | "video-in-produzione" | "audio-e-video";

export type BranoMaster = {
  /** ID stabile del brano: è anche la chiave in `brani_video` e il prefisso dello slot immagine. */
  id: string;
  numero: number;
  titolo: string;
  /** Firma artistica, come da canale ufficiale. */
  artista: string;
  /** Dove l'audio è pubblicato davvero. */
  audioUrl: string;
  /** Oggi un solo valore possibile: l'audio di questi 40 titoli è pubblicato. */
  statoAudio: "pubblicato";
  /** Copertina della pubblicazione ufficiale. Null se non c'è: non si inventa. */
  cover: string | null;
  /** Spazio immagini per la copertina d'artista, se la direzione ne carica una migliore. */
  slotCover: string;
  videoUrl: string | null;
  statoVideo: StatoVideo;
  statoProduzione: FaseProduzione | null;
  thumbnailVideo: string | null;
  annoVideoPrevisto: string | null;
  genere: string | null;
  /** Anno o data di pubblicazione dell'audio: vuoto finché il dato ufficiale non arriva. */
  anno: string | null;
  /** Canale su cui l'audio è pubblicato. */
  fonte: string;
  /** La classe calcolata dai due stati: non si scrive a mano da nessuna parte. */
  classe: ClasseBrano;
};

/** Il codice del video dentro un indirizzo YouTube. Null se l'indirizzo non è YouTube. */
export function idYouTube(url: string): string | null {
  const m = url.match(/[?&]v=([\w-]{6,})/) ?? url.match(/youtu\.be\/([\w-]{6,})/);
  return m ? m[1] : null;
}

/**
 * La copertina della pubblicazione: è l'immagine che YouTube mostra per QUEL caricamento,
 * cioè la copertina reale dell'uscita. Serve come copertina dell'audio e non viene mai
 * presentata come videoclip (regola: «vietato usare la cover come se fosse un videoclip»).
 */
export function copertinaPubblicazione(url: string): string | null {
  const id = idYouTube(url);
  return id ? `https://i.ytimg.com/vi/${id}/hqdefault.jpg` : null;
}

/** Da due stati a una sola etichetta visibile. */
export function classeBrano(statoVideo: StatoVideo): ClasseBrano {
  if (statoVideo === "pubblicato") return "audio-e-video";
  if (statoVideo === "in-produzione") return "video-in-produzione";
  return "solo-audio";
}

/** L'ID del brano a partire dal suo numero di catalogo: `hugo-07`. */
export function idBrano(numero: number): string {
  return `hugo-${String(numero).padStart(2, "0")}`;
}

export const ARTISTA_BRANI = "J.C. Hugò / Touch Music";

/**
 * IL CATALOGO, senza stato del video: lo stato arriva dal database e viene unito nella
 * route. Qui i brani nascono tutti SOLO AUDIO, che è la verità verificabile.
 */
export const CATALOGO_BRANI: BranoMaster[] = BRANI_HUGO.map((b) => ({
  id: idBrano(b.numero),
  numero: b.numero,
  titolo: b.titolo,
  artista: ARTISTA_BRANI,
  audioUrl: b.url,
  statoAudio: "pubblicato" as const,
  cover: copertinaPubblicazione(b.url),
  slotCover: `brano:${idBrano(b.numero)}`,
  videoUrl: null,
  statoVideo: "da-realizzare" as const,
  statoProduzione: null,
  thumbnailVideo: null,
  annoVideoPrevisto: null,
  genere: null,
  anno: null,
  fonte: "Touch Music Radio TV",
  classe: "solo-audio" as const,
}));

export const CATALOGO_NOTA =
  "Catalogo audio pubblicato: 40 titoli reali del canale ufficiale Touch Music Radio TV, " +
  "copiati alla lettera il 29/08/2026. Ogni brano è classificato SOLO AUDIO finché la " +
  "direzione non registra la produzione del videoclip dal pannello: nessun videoclip viene " +
  "dichiarato al posto suo. L'elenco completo delle uscite Suno con titoli e date ufficiali " +
  "resta da ricevere e non viene stimato.";

export const ROAD_2030_NOTA =
  "«Road to 2030» è il piano di trasformazione del catalogo audio in videoclip: è l'unico " +
  "posto in cui è corretto vedere tutti i brani insieme, perché qui rappresentano la coda di " +
  "lavorazione e non produzioni già realizzate. Il flusso è: catalogo audio pubblicato → " +
  "brani da trasformare in videoclip → pre-produzione → produzione → post-produzione → " +
  "videoclip completato → audio + video.";

/** Le fasi del percorso, per il disegno del flusso: testo unico, non riscritto in pagina. */
export const FLUSSO_ROAD_2030 = [
  "Brano audio pubblicato",
  "Videoclip da realizzare",
  "Concept",
  "Casting aperto",
  "Candidature",
  "Selezione cast e crew",
  "Pre-produzione",
  "Riprese",
  "Montaggio",
  "Post-produzione",
  "Videoclip completato",
  "Pubblicazione",
  "Audio + Video",
];

/**
 * L'obiettivo del progetto, scritto una volta sola. Nessun totale dentro il testo:
 * i numeri arrivano solo dai contatori dinamici, come ordinato.
 */
export const ROAD_2030_OBIETTIVO =
  "Tutti i brani musicali pubblicati dovranno progressivamente diventare anche videoclip " +
  "musicali entro il 2030.";

/**
 * LE CATEGORIE DI RUOLO DEL CASTING (Priorità 2quater). Queste sei sono quelle date dalla
 * direzione; altre si aggiungono dal pannello quando serve, senza toccare il codice.
 */
export const CATEGORIE_CASTING = [
  { k: "cantanti", segno: "🎤", nome: "Cantanti" },
  { k: "ballerini", segno: "💃", nome: "Ballerini/e" },
  { k: "attori", segno: "🎭", nome: "Attori/Attrici" },
  { k: "modelli", segno: "📸", nome: "Modelli/e" },
  { k: "figuranti", segno: "👥", nome: "Figuranti" },
  { k: "crew", segno: "🎬", nome: "Crew tecnica" },
] as const;

export const STATI_CASTING = ["aperto", "in-selezione", "chiuso", "cast-completato"] as const;
export type StatoCasting = (typeof STATI_CASTING)[number];

export const AMBITI_CASTING = ["videoclip", "cinema", "tv-format", "reality", "altro"] as const;
export type AmbitoCasting = (typeof AMBITI_CASTING)[number];

export const STATI_CANDIDATURA = [
  "ricevuta",
  "da-valutare",
  "preselezionata",
  "contattata",
  "convocata",
  "selezionata",
  "non-selezionata",
] as const;
export type StatoCandidatura = (typeof STATI_CANDIDATURA)[number];

/** I generi di allegato ammessi nella candidatura: foto, CV, portfolio, showreel, documenti. */
export const GENERI_ALLEGATO = ["foto", "cv", "portfolio", "showreel", "documento"] as const;
export type GenereAllegato = (typeof GENERI_ALLEGATO)[number];

export const CASTING_SOTTOTITOLO =
  "Partecipa ai prossimi progetti musicali di J.C. Hugò / Touch Music.";

/**
 * I consensi da spuntare. ATTENZIONE: qui c'è solo l'ETICHETTA della spunta, non il testo
 * legale. I documenti definitivi sono quelli approvati e forniti dall'editore e non vengono
 * scritti dal sito (ordine: «non inserire testi legali inventati»).
 */
export const CONSENSI_CASTING = [
  { k: "privacy", etichetta: "Informativa privacy", obbligatorio: true },
  { k: "dati", etichetta: "Trattamento dei dati per la selezione", obbligatorio: true },
  { k: "materiali", etichetta: "Utilizzo dei materiali inviati per la selezione", obbligatorio: true },
  { k: "immagini", etichetta: "Liberatoria immagini", obbligatorio: false },
  { k: "audiovisiva", etichetta: "Liberatoria audiovisiva", obbligatorio: false },
] as const;

export const CONSENSI_NOTA =
  "I testi integrali di informativa e liberatorie sono quelli forniti dall'editore: il sito " +
  "non pubblica testi legali propri. Fino alla consegna dei documenti ufficiali la spunta " +
  "raccoglie solo il consenso alla selezione.";
