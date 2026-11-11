/**
 * ════════════════════════════════════════════════════════════════════════════════
 * SORGENTI MUSICALI — riconoscimento, normalizzazione e controllo duplicati.
 *
 * REGOLA DI PARTENZA (ordine del 29/09/2026): «la musica deve poter esistere ed
 * essere pubblicata anche senza videoclip». Qui dentro non esiste nessun obbligo di
 * MP4: un indirizzo Suno è un AUDIO, un indirizzo YouTube può essere un VIDEOCLIP
 * oppure un AUDIO con immagine fissa, e in nessun caso un audio viene presentato
 * come se fosse un video.
 *
 * COSA NON FA: non inventa titoli, copertine, artisti, anni. Se la piattaforma non
 * restituisce il dato, il campo resta vuoto e la scheda si completa a mano dal
 * pannello. Meglio un campo vuoto che un dato falso.
 * ════════════════════════════════════════════════════════════════════════════════
 */

/** Che cosa è quel contenuto, non da dove arriva. */
export const TIPI_SORGENTE = ["audio", "videoclip", "visual-audio"] as const;
export type TipoSorgente = (typeof TIPI_SORGENTE)[number];

/** Da dove arriva quel contenuto, non che cosa è. */
export const PIATTAFORME = [
  "suno",
  "youtube",
  "youtube-music",
  "file-audio",
  "file-video",
  "altro",
] as const;
export type Piattaforma = (typeof PIATTAFORME)[number];

export const ETICHETTE_PIATTAFORMA: Record<Piattaforma, string> = {
  suno: "SUNO",
  youtube: "YOUTUBE",
  "youtube-music": "YOUTUBE MUSIC",
  "file-audio": "FILE AUDIO",
  "file-video": "FILE VIDEO",
  altro: "ALTRO",
};

export const ETICHETTE_TIPO: Record<TipoSorgente, string> = {
  audio: "AUDIO",
  videoclip: "VIDEOCLIP",
  "visual-audio": "VISUAL AUDIO",
};

/** Estensioni che dicono con certezza che quell'indirizzo è un file, non una pagina. */
const ESTENSIONI_AUDIO = [".mp3", ".wav", ".m4a", ".aac", ".ogg", ".oga", ".flac"];
const ESTENSIONI_VIDEO = [".mp4", ".webm", ".mov", ".m4v"];

export const FORMATI_AMMESSI = {
  audio: "MP3 · WAV · M4A · AAC · OGG",
  video: "MP4 · WebM",
  link: "Suno · YouTube · YouTube Music · altri indirizzi pubblici",
};

export type SorgenteRiconosciuta = {
  /** Indirizzo come l'ha consegnato l'editore. */
  urlOriginale: string;
  /** Indirizzo normalizzato: per Suno la pagina `song/<uuid>`, per YouTube il `watch?v=`. */
  url: string;
  piattaforma: Piattaforma;
  tipo: TipoSorgente;
  /** UUID Suno o ID video YouTube: è la chiave del controllo duplicati. */
  idEsterno: string | null;
  /** Vero se è un link breve `suno.com/s/...` da risolvere per avere l'UUID. */
  daRisolvere: boolean;
  /** Perché non è stato riconosciuto, quando la piattaforma resta `altro`. */
  avviso: string | null;
};

/** L'ID del video dentro un indirizzo YouTube, in tutte le forme che YouTube usa. */
export function idVideoYouTube(url: string): string | null {
  const m =
    url.match(/[?&]v=([\w-]{6,})/) ??
    url.match(/youtu\.be\/([\w-]{6,})/) ??
    url.match(/youtube\.com\/(?:embed|shorts|live)\/([\w-]{6,})/);
  return m ? m[1] : null;
}

/** L'UUID del brano dentro un indirizzo `suno.com/song/<uuid>`. */
export function uuidSuno(url: string): string | null {
  const m = url.match(
    /suno\.com\/song\/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/i,
  );
  return m ? m[1].toLowerCase() : null;
}

/** Il codice breve dentro un indirizzo `suno.com/s/XXXXXXXX`. */
export function codiceBreveSuno(url: string): string | null {
  const m = url.match(/suno\.com\/s\/([\w-]{6,})/);
  return m ? m[1] : null;
}

/** La copertina reale di una pubblicazione Suno: è il file della cdn, non un'immagine generata. */
export function coverSuno(uuid: string): string {
  return `https://cdn2.suno.ai/image_large_${uuid}.jpeg`;
}

/** La copertina reale di un caricamento YouTube: la miniatura di QUEL video. */
export function coverYouTube(id: string): string {
  return `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
}

/** L'indirizzo da dare a un player incorporato, o null se la piattaforma non lo consente. */
export function indirizzoPlayer(s: {
  piattaforma: string;
  idEsterno: string | null;
  url: string;
}): string | null {
  if (s.piattaforma === "suno" && s.idEsterno) return `https://suno.com/embed/${s.idEsterno}`;
  if ((s.piattaforma === "youtube" || s.piattaforma === "youtube-music") && s.idEsterno)
    return `https://www.youtube.com/embed/${s.idEsterno}`;
  if (s.piattaforma === "file-audio" || s.piattaforma === "file-video") return s.url;
  return null;
}

/**
 * RICONOSCE UN INDIRIZZO. Non chiama nessun servizio: guarda solo la forma del testo.
 * È il primo passo del pulsante «ANALIZZA LINK», quello che deve rispondere subito.
 */
export function riconosci(raw: string): SorgenteRiconosciuta | null {
  const testo = raw.trim().replace(/^[<([]|[>)\]]$/g, "");
  if (!testo) return null;
  // Un indirizzo senza schema è comunque un indirizzo: si completa, non si scarta.
  const url = /^https?:\/\//i.test(testo) ? testo : `https://${testo.replace(/^\/+/, "")}`;
  let host = "";
  try {
    host = new URL(url).hostname.toLowerCase().replace(/^www\./, "");
  } catch {
    return {
      urlOriginale: raw.trim(),
      url,
      piattaforma: "altro",
      tipo: "audio",
      idEsterno: null,
      daRisolvere: false,
      avviso: "Indirizzo non leggibile: va corretto a mano.",
    };
  }

  const base = {
    urlOriginale: raw.trim(),
    daRisolvere: false,
    avviso: null as string | null,
  };

  // ── SUNO ─────────────────────────────────────────────────────────────────────
  // Sorgente musicale di prima classe: sempre AUDIO, mai video.
  if (host === "suno.com" || host.endsWith(".suno.com") || host === "suno.ai") {
    const uuid = uuidSuno(url);
    if (uuid)
      return {
        ...base,
        url: `https://suno.com/song/${uuid}`,
        piattaforma: "suno",
        tipo: "audio",
        idEsterno: uuid,
      };
    const breve = codiceBreveSuno(url);
    if (breve)
      return {
        ...base,
        url: `https://suno.com/s/${breve}`,
        piattaforma: "suno",
        tipo: "audio",
        idEsterno: null,
        daRisolvere: true,
      };
    return {
      ...base,
      url,
      piattaforma: "suno",
      tipo: "audio",
      idEsterno: null,
      avviso: "Indirizzo Suno non riconosciuto: servono le forme /s/… oppure /song/….",
    };
  }

  // ── YOUTUBE MUSIC ────────────────────────────────────────────────────────────
  // È un servizio di ascolto: qui il contenuto è AUDIO, anche quando l'ID è di un video.
  if (host === "music.youtube.com") {
    const id = idVideoYouTube(url);
    return {
      ...base,
      url: id ? `https://music.youtube.com/watch?v=${id}` : url,
      piattaforma: "youtube-music",
      tipo: "audio",
      idEsterno: id,
      avviso: id ? null : "Indirizzo YouTube Music senza codice brano: va completato a mano.",
    };
  }

  // ── YOUTUBE ──────────────────────────────────────────────────────────────────
  // Il tipo NON si indovina: un caricamento YouTube può essere un videoclip vero
  // oppure solo l'audio con un'immagine fissa. Si parte da `visual-audio`, che è
  // l'ipotesi che non dichiara un videoclip inesistente, e la direzione conferma.
  if (host === "youtube.com" || host === "youtu.be" || host.endsWith(".youtube.com")) {
    const id = idVideoYouTube(url);
    return {
      ...base,
      url: id ? `https://www.youtube.com/watch?v=${id}` : url,
      piattaforma: "youtube",
      tipo: "visual-audio",
      idEsterno: id,
      avviso: id
        ? "Da confermare in scheda: videoclip reale oppure audio con immagine fissa."
        : "Indirizzo YouTube senza codice video: va completato a mano.",
    };
  }

  // ── FILE DIRETTI ─────────────────────────────────────────────────────────────
  const percorso = url.split("?")[0].toLowerCase();
  if (ESTENSIONI_AUDIO.some((e) => percorso.endsWith(e)))
    return { ...base, url, piattaforma: "file-audio", tipo: "audio", idEsterno: null };
  if (ESTENSIONI_VIDEO.some((e) => percorso.endsWith(e)))
    return { ...base, url, piattaforma: "file-video", tipo: "videoclip", idEsterno: null };

  // ── ALTRO ────────────────────────────────────────────────────────────────────
  return {
    ...base,
    url,
    piattaforma: "altro",
    tipo: "audio",
    idEsterno: null,
    avviso: "Piattaforma non riconosciuta: tipo e dati vanno indicati a mano.",
  };
}

/** Riconosce un elenco incollato, una riga per indirizzo, saltando righe vuote e doppioni. */
export function riconosciElenco(testo: string): {
  sorgenti: SorgenteRiconosciuta[];
  scartate: string[];
  ripetuteNelTesto: number;
} {
  const righe = testo
    .split(/[\r\n,;\s]+/)
    .map((r) => r.trim().replace(/^[-*•]\s*/, "").replace(/^\[|\]$/g, ""))
    .filter(Boolean);
  const sorgenti: SorgenteRiconosciuta[] = [];
  const scartate: string[] = [];
  const visti = new Set<string>();
  let ripetuteNelTesto = 0;

  for (const riga of righe) {
    // Le parole di accompagnamento («brano», «versione 2») non sono indirizzi: si
    // ignorano in silenzio. In «scartate» finisce solo ciò che sembrava un indirizzo.
    const pareUnIndirizzo = /^https?:\/\//i.test(riga) || /\w\.[a-z]{2,}/i.test(riga);
    if (!pareUnIndirizzo) continue;
    const s = riconosci(riga);
    if (!s) {
      scartate.push(riga);
      continue;
    }
    const chiave = (s.idEsterno ?? s.url).toLowerCase();
    if (visti.has(chiave)) {
      ripetuteNelTesto += 1;
      continue;
    }
    visti.add(chiave);
    sorgenti.push(s);
  }
  return { sorgenti, scartate, ripetuteNelTesto };
}

/** Il conteggio da mostrare accanto al pulsante: «27 URL rilevati — 26 Suno — 1 YouTube». */
export function riepilogoElenco(sorgenti: SorgenteRiconosciuta[]): {
  totale: number;
  perPiattaforma: { piattaforma: Piattaforma; etichetta: string; quanti: number }[];
  testo: string;
} {
  const conta = new Map<Piattaforma, number>();
  for (const s of sorgenti) conta.set(s.piattaforma, (conta.get(s.piattaforma) ?? 0) + 1);
  const perPiattaforma = PIATTAFORME.filter((p) => conta.has(p)).map((p) => ({
    piattaforma: p,
    etichetta: ETICHETTE_PIATTAFORMA[p],
    quanti: conta.get(p) ?? 0,
  }));
  const testo = [
    `${sorgenti.length} URL rilevati`,
    ...perPiattaforma.map((p) => `${p.quanti} ${p.etichetta}`),
  ].join(" — ");
  return { totale: sorgenti.length, perPiattaforma, testo };
}

/**
 * LA CHIAVE DEL TITOLO per il controllo duplicati. Lettere e numeri, niente accenti,
 * niente punteggiatura, niente firme d'artista: «LA VITA CHE BRUCIA - DJ Hugo» e
 * «La vita che brucia» finiscono sulla stessa chiave e quindi sullo stesso brano master.
 */
export function chiaveTitolo(titolo: string): string {
  let t = titolo
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
  // Prefissi redazionali che non fanno parte del titolo.
  t = t.replace(/^\s*(?:titolo|title)\s*[:\-–]\s*/i, "");
  t = t.replace(/^\s*(?:titolo|title)\s+(?=\S)/i, "");
  // Firma dell'artista in coda, nelle forme che Suno e YouTube producono.
  t = t.replace(
    /\s*(?:[-–—|]|\bby\b|\bfeat\.?\b|\bft\.?\b)\s*(?:by\s+)?(?:dj|deejay|d\.j\.|j\.?c\.?)?\s*hug[oò]\b.*$/i,
    "",
  );
  t = t.replace(/\s*(?:[-–—|])\s*(?:touch music(?: radio)?(?: tv)?)\b.*$/i, "");
  t = t.replace(/\s*\b(?:by|feat\.?|ft\.?)\s+touch music\b.*$/i, "");
  // Indicazione di versione in coda: non distingue due brani, distingue due versioni.
  t = t.replace(/\s*[-–—|(\[]?\s*(?:v(?:ers(?:ione)?)?\.?\s*\d+(?:[.,]\d+)?)\s*[)\]]?\s*$/i, "");
  t = t.replace(/\s*[-–—|(\[]?\s*(?:radio edit|extended|remix|remaster(?:ed)?|club mix)\s*[)\]]?\s*$/i, "");
  // Numero di versione scritto senza etichetta: «VERTIGO HIGH 2.0» → «vertigohigh».
  t = t.replace(/\s+\d+[.,]\d+\s*$/, "");
  return t.replace(/[^a-z0-9]+/g, "");
}

/**
 * LA VERSIONE LETTA DAL TITOLO, quando l'autore ce l'ha scritta dentro: «VERTIGO HIGH 2.0»
 * → «2.0». Serve a collegare due uscite dello stesso titolo allo stesso brano master
 * invece di creare due brani. Null quando il titolo non dice niente: non si inventa.
 */
export function versioneDalTitolo(titolo: string): string | null {
  const m =
    titolo.match(/\bv(?:ers(?:ione)?)?\.?\s*(\d+(?:[.,]\d+)?)\b/i) ??
    titolo.match(/\s(\d+[.,]\d+)\s*$/);
  if (m) return `V${m[1].replace(",", ".")}`;
  const parola = titolo.match(/\b(radio edit|extended|remix|remaster(?:ed)?|club mix)\b/i);
  return parola ? parola[1].toUpperCase() : null;
}

/** Il titolo ripulito dai prefissi redazionali, senza toccare le parole dell'autore. */
export function titoloPulito(titolo: string): string {
  return titolo
    .replace(/^\s*(?:titolo|title)\s*[:\-–]\s*/i, "")
    .replace(/^\s*(?:TITOLO|TITLE)\s+(?=\S)/, "")
    .replace(/\s+/g, " ")
    .trim();
}

/** Un ID nuovo per un brano master: `mus-` + 8 caratteri. Non dipende dal titolo. */
export function nuovoIdBrano(): string {
  const alfabeto = "abcdefghijklmnopqrstuvwxyz0123456789";
  let coda = "";
  for (let i = 0; i < 8; i += 1)
    coda += alfabeto[Math.floor(Math.random() * alfabeto.length)];
  return `mus-${coda}`;
}

/**
 * ────────────────────────────────────────────────────────────────────────────────
 * LE ETICHETTE DI STATO, con i colori richiesti dalla direzione.
 *
 * SCELTA TECNICA: sono CALCOLATE sopra gli stati che il database già usa
 * (`brani_video.statoVideo`, `brani_video.statoProduzione`, casting aperto). Non è
 * stato aggiunto nessuno stato nuovo in tabella, così la pipeline del casting già
 * verificata continua a funzionare senza modifiche.
 * ────────────────────────────────────────────────────────────────────────────────
 */
export type EtichettaStato = { pallino: string; testo: string; chiave: string };

export function etichettaStato(b: {
  statoAudio: string;
  statoVideo: string;
  statoProduzione: string | null;
  castingAperto: boolean;
  videoUrl: string | null;
}): EtichettaStato {
  const audio = b.statoAudio === "pubblicato";
  if (audio && b.statoVideo === "pubblicato" && b.videoUrl)
    return { pallino: "🟢", testo: "AUDIO + VIDEO PUBBLICATI", chiave: "audio-video" };
  if (b.castingAperto) return { pallino: "🔴", testo: "CASTING APERTO", chiave: "casting" };
  if (b.statoVideo === "in-produzione") {
    if (b.statoProduzione === "post-produzione")
      return { pallino: "🟣", testo: "POST-PRODUZIONE", chiave: "post" };
    if (b.statoProduzione === "pre-produzione")
      return { pallino: "🟠", testo: "VIDEOCLIP IN PRE-PRODUZIONE", chiave: "pre" };
    if (b.statoProduzione === "programmato")
      return { pallino: "🟡", testo: "VIDEOCLIP PROGRAMMATO", chiave: "programmato" };
    return { pallino: "🔵", testo: "VIDEOCLIP IN PRODUZIONE", chiave: "produzione" };
  }
  if (audio) return { pallino: "🟢", testo: "AUDIO PUBBLICATO", chiave: "audio" };
  return { pallino: "⚪️", testo: "SCHEDA DA COMPLETARE", chiave: "da-completare" };
}

/** L'etichetta del videoclip, che sta accanto a quella dell'audio e non la sostituisce. */
export function etichettaVideoclip(b: {
  statoVideo: string;
  videoUrl: string | null;
}): EtichettaStato {
  if (b.statoVideo === "pubblicato" && b.videoUrl)
    return { pallino: "🎬", testo: "VIDEOCLIP PUBBLICATO", chiave: "pubblicato" };
  if (b.statoVideo === "in-produzione")
    return { pallino: "🎬", testo: "VIDEOCLIP IN LAVORAZIONE", chiave: "in-produzione" };
  return { pallino: "🎬", testo: "VIDEOCLIP — DA REALIZZARE", chiave: "da-realizzare" };
}

/** La tornata di importazione aperta dalla direzione il 29/09/2026. */
export const TORNATA_CORRENTE = "IMPORTAZIONE J.C. HUGÒ 29/09/2026";

export const STATI_SCHEDA = ["da-verificare", "verificato"] as const;
export type StatoScheda = (typeof STATI_SCHEDA)[number];

export const CATALOGO_MUSICALE_NOTA =
  "Il brano è l'elemento principale del catalogo: audio, video, copertina, link, versioni, " +
  "playlist, videoclip e casting sono contenuti associati allo stesso brano, non schede " +
  "separate. Un brano si pubblica con la sua sorgente audio reale, senza aspettare il " +
  "videoclip: nessun contenuto viene richiesto in formato video per poter uscire. " +
  "Il conteggio del catalogo è il numero di brani master distinti: le versioni dello stesso " +
  "titolo non contano come brani diversi.";

export const IMPORTAZIONE_NOTA =
  "Ogni indirizzo passa dal controllo duplicati prima di diventare una scheda: se l'indirizzo, " +
  "il codice della piattaforma o il titolo risultano già in catalogo la scheda non viene " +
  "creata di nuovo, e la sorgente viene aggiunta al brano che esiste già. Quando la " +
  "piattaforma non restituisce i metadati la scheda si crea comunque vuota e si completa a " +
  "mano: non vengono generati titoli, copertine o dati di fantasia.";
