/* ────────────────────────────────────────────────────────────────────────────
   FORMATI UFFICIALI DEL MARCHIO — aggiornamento globale del 17/09/2026, punto 3.

   REGOLA UNICA, VALIDA PER TUTTA LA PIATTAFORMA:
     «UN CONTENUTO, UN RECORD, UN LOGO ORIGINALE, PIÙ ADATTAMENTI AUTOMATICI»

   Dal logo master si ricavano automaticamente tutte le misure qui sotto. Il file
   originale NON si sovrascrive e NON si modifica: le varianti sono sempre derivate.

   Come si adatta un logo, in ogni formato, senza eccezioni:
     · `object-fit: contain` — il marchio entra intero, non si taglia mai;
     · centrato nei due assi;
     · sfondo trasparente;
     · area di rispetto minima del 10% del lato minore del contenitore;
     · le proporzioni del marchio non si toccano: un logo verticale resta verticale,
       un quadrato resta quadrato, un orizzontale resta orizzontale.
       Cambia il CONTENITORE, non il MARCHIO.

   Quindi le misure qui dichiarate sono la misura del CONTENITORE, non quella a cui
   l'immagine viene stirata. Un 240×240 su un logo 1024×1536 dà un logo alto 240·0.8
   e largo in proporzione: nessuna deformazione, nessun ritaglio.
   ──────────────────────────────────────────────────────────────────────────── */

/** Area di rispetto: percentuale del lato minore lasciata libera intorno al marchio. */
export const AREA_DI_RISPETTO = 0.1;

/** Nomi dei formati. Nelle pagine si usano SOLO questi: non se ne inventano altri. */
export type FormatoLogo =
  | "icona-piccola"
  | "icona-standard"
  | "app-512"
  | "app-192"
  | "app-180"
  | "app-32"
  | "pulsante"
  | "scheda-attivita"
  | "scheda-squadra"
  | "hero"
  | "orizzontale"
  | "banner-desktop"
  | "banner-tablet"
  | "banner-mobile"
  | "social-og";

export type DefinizioneFormato = {
  formato: FormatoLogo;
  /** Larghezza del contenitore in pixel. */
  larghezza: number;
  /** Altezza del contenitore in pixel. */
  altezza: number;
  /** A cosa serve: si stampa nel pannello, così chi allestisce sa cosa sta guardando. */
  uso: string;
  /** Gruppo per il pannello: icone, schede, banner. */
  gruppo: "icona" | "scheda" | "banner";
};

/**
 * I formati chiesti da Claudio, nell'ordine in cui li ha elencati.
 * Chi aggiunge una misura la aggiunge QUI: le pagine non definiscono misure proprie.
 */
export const FORMATI_LOGO: DefinizioneFormato[] = [
  { formato: "icona-piccola", larghezza: 64, altezza: 64, uso: "Icona piccola, elenchi compatti e righe di tabella.", gruppo: "icona" },
  { formato: "icona-standard", larghezza: 128, altezza: 128, uso: "Icona standard, tessere e caroselli di loghi.", gruppo: "icona" },
  { formato: "app-512", larghezza: 512, altezza: 512, uso: "Icona applicazione e manifest (512).", gruppo: "icona" },
  { formato: "app-192", larghezza: 192, altezza: 192, uso: "Icona applicazione Android (192).", gruppo: "icona" },
  { formato: "app-180", larghezza: 180, altezza: 180, uso: "Icona schermata Home iPhone e iPad (180).", gruppo: "icona" },
  { formato: "app-32", larghezza: 32, altezza: 32, uso: "Favicon della scheda del browser (32).", gruppo: "icona" },
  { formato: "pulsante", larghezza: 96, altezza: 96, uso: "Logo dentro un pulsante o una voce di menu.", gruppo: "icona" },
  { formato: "scheda-attivita", larghezza: 320, altezza: 200, uso: "Scheda di un'attività del Circuito.", gruppo: "scheda" },
  { formato: "scheda-squadra", larghezza: 240, altezza: 240, uso: "Scheda e stemma di una squadra.", gruppo: "scheda" },
  { formato: "hero", larghezza: 600, altezza: 600, uso: "Apertura della pagina interna del marchio.", gruppo: "scheda" },
  { formato: "orizzontale", larghezza: 1200, altezza: 400, uso: "Logo orizzontale, intestazioni e firme.", gruppo: "scheda" },
  { formato: "banner-desktop", larghezza: 1920, altezza: 640, uso: "Banner e monitor su schermo grande.", gruppo: "banner" },
  { formato: "banner-tablet", larghezza: 1200, altezza: 600, uso: "Banner su tablet.", gruppo: "banner" },
  { formato: "banner-mobile", larghezza: 1080, altezza: 1350, uso: "Banner verticale su smartphone.", gruppo: "banner" },
  { formato: "social-og", larghezza: 1200, altezza: 630, uso: "Anteprima social e condivisioni (OG).", gruppo: "banner" },
];

const INDICE: Record<string, DefinizioneFormato> = Object.fromEntries(
  FORMATI_LOGO.map((f) => [f.formato, f]),
);

/** Definizione di un formato. Formato sconosciuto → `null`, non un valore inventato. */
export function formatoLogo(nome: string): DefinizioneFormato | null {
  return INDICE[nome] ?? null;
}

/** Elenco dei nomi: serve al pannello e alla validazione della rotta. */
export const NOMI_FORMATI = FORMATI_LOGO.map((f) => f.formato);

/**
 * Misure effettive del marchio dentro il contenitore, area di rispetto compresa.
 * Serve al motore delle varianti e al pannello di anteprima.
 */
export function areaUtile(f: DefinizioneFormato) {
  const margine = Math.round(Math.min(f.larghezza, f.altezza) * AREA_DI_RISPETTO);
  return {
    margine,
    larghezza: Math.max(1, f.larghezza - margine * 2),
    altezza: Math.max(1, f.altezza - margine * 2),
  };
}

/* ────────────────────────────────────────────────────────────────────────────
   KIT UFFICIALE DEL MARCHIO — punto 4.
   Ogni società TBH, attività del Circuito e squadra PUÒ avere queste versioni.
   Se una versione non esiste NON si inventa: si usa il master dentro il
   contenitore, senza modificarlo.
   ──────────────────────────────────────────────────────────────────────────── */

export type RuoloKit =
  | "master"
  | "orizzontale"
  | "icona"
  | "positivo"
  | "negativo"
  | "monocromatico"
  | "copertina"
  | "video"
  | "carosello";

export const RUOLO_KIT_LABEL: Record<RuoloKit, string> = {
  master: "Logo principale (master)",
  orizzontale: "Logo orizzontale",
  icona: "Icona / sigillo",
  positivo: "Versione positiva per fondo chiaro",
  negativo: "Versione negativa bianca per fondo scuro",
  monocromatico: "Versione monocromatica",
  copertina: "Immagine di copertina",
  video: "Video",
  carosello: "Carosello",
};

export const RUOLI_KIT = Object.keys(RUOLO_KIT_LABEL) as RuoloKit[];

/**
 * Quale file usare per un certo fondo. Se la versione dedicata manca si torna
 * SEMPRE al master: mai una versione ricavata a occhio o ricolorata.
 */
export function ruoloPerFondo(fondo: "chiaro" | "scuro"): RuoloKit[] {
  return fondo === "scuro" ? ["negativo", "master", "positivo"] : ["positivo", "master", "negativo"];
}

/* ────────────────────────────────────────────────────────────────────────────
   FORMATI DI FILE AMMESSI — punto 2.
   L'originale si conserva e non si sovrascrive mai.
   ──────────────────────────────────────────────────────────────────────────── */

export const FORMATI_AMMESSI = {
  logo: {
    preferito: "SVG vettoriale",
    alternativa: "PNG trasparente, lato minimo 2.000 px",
    stampa: "PDF vettoriale",
    mime: ["image/svg+xml", "image/png", "application/pdf"],
    latoMinimoPng: 2000,
  },
  fotografia: {
    preferito: "WebP",
    alternativa: "JPG qualità 85%",
    mime: ["image/webp", "image/jpeg"],
    qualita: 85,
  },
  video: {
    preferito: "MP4 H.264",
    alternativa: "WebM",
    mime: ["video/mp4", "video/webm"],
  },
} as const;

/** Vietati: loghi generati dall'IA, ridisegnati, deformati o segnaposto. */
export const LOGHI_VIETATI =
  "Vietati loghi AI, ridisegnati, deformati o segnaposto: si carica solo il file originale del marchio.";

/**
 * Controllo del file in arrivo. Non blocca il caricamento di un originale valido,
 * ma restituisce gli avvisi da mostrare a chi allestisce.
 */
export function avvisiFile(input: {
  ruolo: RuoloKit;
  mime: string | null;
  larghezza?: number | null;
  altezza?: number | null;
}): string[] {
  const avvisi: string[] = [];
  const mime = (input.mime ?? "").toLowerCase();
  const eLogo = input.ruolo !== "copertina" && input.ruolo !== "video" && input.ruolo !== "carosello";

  if (input.ruolo === "video") {
    if (mime && !FORMATI_AMMESSI.video.mime.includes(mime as never)) {
      avvisi.push("Formato video non previsto: usare MP4 H.264 oppure WebM.");
    }
    return avvisi;
  }

  if (eLogo) {
    if (mime && !FORMATI_AMMESSI.logo.mime.includes(mime as never)) {
      avvisi.push(
        "Per un logo il formato previsto è SVG vettoriale, in alternativa PNG trasparente oppure PDF vettoriale per la stampa.",
      );
    }
    const lato = Math.max(input.larghezza ?? 0, input.altezza ?? 0);
    if (mime === "image/png" && lato > 0 && lato < FORMATI_AMMESSI.logo.latoMinimoPng) {
      avvisi.push(
        `Questo PNG misura ${lato} px sul lato maggiore: sotto i ${FORMATI_AMMESSI.logo.latoMinimoPng} px il logo si vedrà sfocato su banner e stampa. Serve il file originale più grande o l'SVG.`,
      );
    }
  } else if (mime && !FORMATI_AMMESSI.fotografia.mime.includes(mime as never)) {
    avvisi.push("Per una fotografia il formato previsto è WebP oppure JPG a qualità 85%.");
  }

  return avvisi;
}
