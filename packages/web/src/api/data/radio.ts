/**
 * ────────────────────────────────────────────────────────────────────────────────
 * J.C. HUGÒ RADIO — dati fissi della web radio 24/7 (istruzioni di Claudio, 14/10/2026).
 *
 * La radio NON ha un catalogo suo: legge il catalogo musicale unico
 * (`catalogoCompleto()`: 40 uscite storiche del canale + brani importati da Suno e
 * YouTube). Qui ci sono solo le regole del palinsesto e i pochi dati che il catalogo
 * non contiene: le durate delle 40 uscite storiche e gli spot del gruppo.
 * Sito, app futura e TV leggono la stessa API `radio`: nessun sistema duplicato.
 * ────────────────────────────────────────────────────────────────────────────────
 */

export const RADIO = {
  occhiello: "TOUCH RADIO · TOUCH TV", // 15/10/2026: due canali distinti del gruppo TBH
  nome: "J.C. HUGÒ RADIO",
  payoff: "MUSIC • RADIO • DJ SET • STREAMING",
  inOnda: "IN ONDA — RADIO 24/7",
  fuso: "Europe/Rome",
} as const;

/** Regole del palinsesto automatico. */
export const REGOLE_RADIO = {
  /** Pausa pubblicitaria al primo cambio brano dopo 12 minuti… */
  spotDopoSec: 12 * 60,
  /** …e comunque mai oltre 15 minuti di musica senza pausa. */
  spotMaxSec: 15 * 60,
  /** In rotazione solo i brani con durata reale fra 1:30 e 10:00. */
  durataMinSec: 90,
  durataMaxSec: 600,
  /** Spot per pausa, dopo la sigla. */
  spotPerPausa: 2,
} as const;

/** Durate reali (secondi) delle 40 uscite storiche del canale, lette da YouTube il 14/10/2026. */
export const DURATE_YOUTUBE: Record<string, number> = {
  "wxHTkUBHsVo": 242,
  "1nj6TUe-0KY": 272,
  "aRnCXHHqPq8": 959,
  "t_vPR-y0ybM": 304,
  "Y9944vJB32U": 418,
  "vJaffpdcwjA": 424,
  "kEFaEklABos": 396,
  "-yed5p88RfA": 318,
  "i6dU2OK4ilA": 698,
  "EUnFJUP7Oi4": 433,
  "AF04_bGc9So": 454,
  "1u0g2eHK8Us": 398,
  "QEUeaXtEuQk": 307,
  "QYowBaqaEWM": 1113,
  "tokyERDfoK8": 397,
  "yCFJJo_aE5w": 926,
  "cRlK_4ESN3w": 377,
  "XoMowJPnWFQ": 204,
  "Ocip40lQEXI": 241,
  "q9LLL9BY7EQ": 182,
  "J7cGiEotUPU": 438,
  "e0mCQI7BaC8": 187,
  "zlJrg3smGKc": 320,
  "kWmRf2iM-Qc": 235,
  "xIp6yrPnBfc": 400,
  "obwwZQfyqus": 225,
  "v1KrG-dwzKI": 184,
  "2zoCSLYajWk": 233,
  "43DG59gtVKE": 187,
  "qaI7_PSW188": 190,
  "58fj2uTRuGk": 216,
  "g3G38r8m6xI": 536,
  "cX19QishB84": 169,
  "KtbwfLQtA40": 169,
  "D3kYCOStBBo": 213,
  "oFxoGC2AVRM": 205,
  "2h6CK3ZlPq4": 154,
  "y4-TfC4x1_w": 241,
  "KaSNhFwmIEA": 241,
  "hTCrxjNSmoQ": 194,
};

/**
 * Uscite storiche escluse dalla rotazione automatica:
 * · dedica personale, non un brano da radio;
 * · brano natalizio: in onda solo dal 1° dicembre al 6 gennaio.
 */
export const ESCLUSI_ROTAZIONE: string[] = ["hTCrxjNSmoQ"];
export const STAGIONALI: Record<string, { da: string; a: string }> = {
  Ocip40lQEXI: { da: "12-01", a: "01-06" },
};

export type SpotRadio = {
  id: string;
  titolo: string;
  inserzionista: string;
  youtube: string;
  durataSec: number;
};

/**
 * SPOT DEL GRUPPO — sul canale YouTube ufficiale Touch Music Radio TV. Vanno in onda nelle
 * pause finché non arrivano gli spot degli inserzionisti (decisione di Claudio, 14/10/2026).
 * Solo spot fino a 2:30: gli spot lunghi e le sigle complete restano nel catalogo video.
 */
export const SIGLA_SPOT: SpotRadio = {
  id: "hwGW0SDB9LQ",
  titolo: "Sigla Spot Touch Music TV",
  inserzionista: "Touch Music Radio TV",
  youtube: "https://www.youtube.com/watch?v=hwGW0SDB9LQ",
  durataSec: 11,
};

export const SPOT_GRUPPO: SpotRadio[] = [
  { id: "d0RyM2Sgqys", titolo: "Spot Touch Jobs 1.0", inserzionista: "Touch Jobs", youtube: "https://www.youtube.com/watch?v=d0RyM2Sgqys", durataSec: 61 },
  { id: "W3uRnOvNMHo", titolo: "Spot Casting & Jobs", inserzionista: "TBH Casting & Jobs", youtube: "https://www.youtube.com/watch?v=W3uRnOvNMHo", durataSec: 144 },
  { id: "p0fTRxZAqBo", titolo: "Spot Touch Village Entertainment Srl", inserzionista: "Touch Village Entertainment Srl", youtube: "https://www.youtube.com/watch?v=p0fTRxZAqBo", durataSec: 32 },
  { id: "-xnwxhjEAVI", titolo: "Spot Metropolitan Servizi Srl", inserzionista: "Metropolitan Servizi Srl", youtube: "https://www.youtube.com/watch?v=-xnwxhjEAVI", durataSec: 9 },
  { id: "Uq6SeAvJPik", titolo: "SpotTV", inserzionista: "Touch Music Radio TV", youtube: "https://www.youtube.com/watch?v=Uq6SeAvJPik", durataSec: 93 },
  { id: "9N2lhzrxpH4", titolo: "Entra anche tu nella nostra Crew", inserzionista: "Touch Music Radio TV", youtube: "https://www.youtube.com/watch?v=9N2lhzrxpH4", durataSec: 7 },
  { id: "MNlosZsuZPg", titolo: "Benvenuti su Touch Cafè", inserzionista: "Touch Cafè", youtube: "https://www.youtube.com/watch?v=MNlosZsuZPg", durataSec: 9 },
  { id: "Bz6ooT3bXd4", titolo: "Touch Travel — tour operator del gruppo TBH", inserzionista: "Touch Travel", youtube: "https://www.youtube.com/watch?v=Bz6ooT3bXd4", durataSec: 9 },
];

export const SPOT_NOTA =
  "Pause pubblicitarie ogni 12–15 minuti. Per ora vanno in onda gli spot del gruppo pubblicati sul " +
  "canale ufficiale Touch Music Radio TV. Gli spot degli inserzionisti sono da caricare.";

/** DM — diretta dal canale YouTube ufficiale di Daniele Manuelli. */
export const DM_RADIO = {
  canale: "Daniele Manuelli — DM Comunicazione",
  youtube: "https://www.youtube.com/@DanieleManuelli1981",
  canaleId: "UCjafNyVdE8lX9M_IOEOJHMw",
  live: "https://www.youtube.com/embed/live_stream?channel=UCjafNyVdE8lX9M_IOEOJHMw",
  repliche:
    "Repliche anche in TV sul canale 88 del digitale terrestre a Bologna (Made in Bo). Orari delle repliche da confermare.",
};

export const APP_RADIO = {
  stato: "PROSSIMO LANCIO",
  testo:
    "L'app ufficiale userà lo stesso catalogo, lo stesso palinsesto e lo stesso streaming di questa pagina: nessun sistema separato.",
};

/**
 * TOUCH MUSIC TV — pulsante «GUARDA LA TV» (14/10/2026).
 * Non esiste ancora una diretta TV 24/7: il pulsante apre i video ufficiali del canale
 * YouTube Touch Music Radio TV (playlist «caricamenti» del canale, id UU… = UC…).
 * Nessun flusso inventato: la diretta resta IN ALLESTIMENTO.
 */
export const TV_RADIO = {
  nome: "TOUCH TV", // 15/10/2026: il canale video si chiama TOUCH TV (TOUCH MUSIC è una rubrica)
  canale: "https://www.youtube.com/@touchmusicradiotv",
  canaleId: "UC3XCd1pbBvstBreYcQGWsSw",
  embed: "https://www.youtube.com/embed/videoseries?list=UU3XCd1pbBvstBreYcQGWsSw",
  diretta: "IN ALLESTIMENTO",
  testo:
    "La diretta TV 24/7 è in allestimento. Intanto qui scorrono i video ufficiali del canale YouTube Touch Music Radio TV; negli orari DM la radio passa alla diretta video DM.",
};
