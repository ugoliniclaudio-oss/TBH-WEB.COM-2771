/**
 * USCITE MUSICALI — 04/11/2026 (round 16, Claudio: «COLLEGAMENTI DA INSERIRE E INTEGRARE»).
 *
 * Una USCITA è la scheda di pubblicazione di un singolo o di un album del catalogo musicale.
 * Si aggancia al BRANO del catalogo (stesso id di `brani_master`): titolo, artista, copertina,
 * audio e videoclip restano quelli del brano; qui stanno solo i dati della pubblicazione:
 *   · data di uscita (inserita a mano, MAI ricavata dalla presenza di un link);
 *   · i collegamenti alle piattaforme, ciascuno con data programmata, disponibilità
 *     confermata e ultima verifica.
 *
 * Chiave CONDIVISA `cms_v1:uscite` (tabella settings): stesso dato su anteprima e www, resta dopo
 * Publish e riavvii. Tutte le sezioni del sito (catalogo, pagina dell'artista, calendario uscite,
 * Channel Touch Music, Radio) leggono questa stessa scheda.
 *
 * HyperFollow (DistroKid) è il punto d'accesso alla pubblicazione, NON un'integrazione automatica:
 * i link diretti agli store si inseriscono a mano dal pannello /allestimento/musica → «Uscite e store».
 * Un pulsante compare solo quando il suo indirizzo è presente.
 */

export const TIPI_USCITA = ["singolo", "album"] as const;
export type TipoUscita = (typeof TIPI_USCITA)[number];

export const PIATTAFORME_USCITA = [
  "hyperfollow",
  "spotify",
  "apple-music",
  "itunes",
  "amazon-music",
  "youtube-music",
  "youtube-video",
  "deezer",
  "tidal",
  "altro-store",
  "facebook",
  "instagram",
  "tiktok",
] as const;
export type PiattaformaUscita = (typeof PIATTAFORME_USCITA)[number];

/** brano = collegamento al brano/uscita; profilo = profilo ufficiale (solo social). */
export const AMBITI_LINK = ["brano", "profilo"] as const;
export type AmbitoLink = (typeof AMBITI_LINK)[number];

export type InfoPiattaforma = {
  nome: string;
  /** Testo del pulsante pubblico (per i social dipende dall'ambito). */
  pulsante: string;
  gruppo: "accesso" | "store" | "social";
  /** Domini ammessi: un link incollato nel campo sbagliato viene rifiutato con una frase chiara. */
  domini: string[] | null;
  /** Solo i social hanno anche il «profilo ufficiale». */
  social?: boolean;
};

export const INFO_PIATTAFORME: Record<PiattaformaUscita, InfoPiattaforma> = {
  hyperfollow: { nome: "HyperFollow DistroKid", pulsante: "Pre-save / Ascolta", gruppo: "accesso", domini: ["distrokid.com"] },
  spotify: { nome: "Spotify", pulsante: "Ascolta su Spotify", gruppo: "store", domini: ["spotify.com", "spotify.link"] },
  "apple-music": { nome: "Apple Music", pulsante: "Ascolta su Apple Music", gruppo: "store", domini: ["music.apple.com", "itunes.apple.com"] },
  /* 04/11/2026 (round 17) — iTunes Store: stesso dominio di Apple Music, link con ?app=itunes. */
  itunes: { nome: "iTunes", pulsante: "Acquista su iTunes", gruppo: "store", domini: ["music.apple.com", "itunes.apple.com"] },
  "amazon-music": { nome: "Amazon Music", pulsante: "Ascolta su Amazon Music", gruppo: "store", domini: ["music.amazon.com", "music.amazon.it", "amazon.com", "amazon.it", "amzn.to"] },
  "youtube-music": { nome: "YouTube Music", pulsante: "Ascolta su YouTube Music", gruppo: "store", domini: ["music.youtube.com"] },
  "youtube-video": { nome: "Video ufficiale YouTube", pulsante: "Guarda il video ufficiale", gruppo: "store", domini: ["youtube.com", "youtu.be"] },
  deezer: { nome: "Deezer", pulsante: "Ascolta su Deezer", gruppo: "store", domini: ["deezer.com", "deezer.page.link", "dzr.page.link"] },
  tidal: { nome: "Tidal", pulsante: "Ascolta su Tidal", gruppo: "store", domini: ["tidal.com"] },
  "altro-store": { nome: "Altro store confermato", pulsante: "Ascolta", gruppo: "store", domini: null },
  facebook: { nome: "Facebook", pulsante: "Facebook", gruppo: "social", domini: ["facebook.com", "fb.watch", "fb.com"], social: true },
  instagram: { nome: "Instagram", pulsante: "Instagram", gruppo: "social", domini: ["instagram.com"], social: true },
  tiktok: { nome: "TikTok", pulsante: "TikTok", gruppo: "social", domini: ["tiktok.com"], social: true },
};

export type LinkUscita = {
  id: string;
  piattaforma: PiattaformaUscita;
  ambito: AmbitoLink;
  /** Testo del pulsante (facoltativo); per «Altro store» è il NOME dello store, obbligatorio. */
  etichetta: string | null;
  url: string;
  /** AAAA-MM-GG — data programmata su quella piattaforma, se comunicata. */
  dataProgrammata: string | null;
  /** Vero solo quando qualcuno ha controllato che il brano è davvero disponibile lì. */
  disponibilitaConfermata: boolean;
  /** AAAA-MM-GG — ultimo controllo fatto a mano. */
  ultimaVerifica: string | null;
  /** Nota sulla verifica (es. «pagina protetta, non leggibile dal server»). */
  notaVerifica: string | null;
};

/* ── 04/11/2026 (round 17) — DISCOGRAFIA ─────────────────────────────────────────────────
   Dati di pubblicazione in più (tutti facoltativi, nella stessa chiave cms_v1:uscite):
   artista distribuito, distribuzione, ISRC, UPC, stato e ricorrenza.
   La RICORRENZA classifica i singoli di Natale, Capodanno, compleanno, Avvento: ognuno resta una
   pubblicazione a sé, mai raggruppata automaticamente in un album. */

/** null = stato automatico (pubblicata se la data di uscita è passata, altrimenti prossima). */
export const STATI_USCITA = ["pubblicata", "prossima", "in-preparazione"] as const;
export type StatoUscita = (typeof STATI_USCITA)[number];
export const STATO_LEGGIBILE: Record<StatoUscita, string> = {
  pubblicata: "Pubblicata",
  prossima: "Prossima uscita",
  "in-preparazione": "In preparazione",
};

export const RICORRENZE = ["nessuna", "natale", "capodanno", "compleanno", "avvento", "altra"] as const;
export type Ricorrenza = (typeof RICORRENZE)[number];
export const RICORRENZA_LEGGIBILE: Record<Ricorrenza, string> = {
  nessuna: "Nessuna ricorrenza",
  natale: "Singolo di Natale",
  capodanno: "Singolo di Capodanno",
  compleanno: "Singolo di compleanno",
  avvento: "Singolo dell'Avvento",
  altra: "Singolo di ricorrenza",
};

/** ISRC: 12 caratteri (paese 2 lettere · registrante 3 · anno 2 cifre · codice 5 cifre). */
export function erroreIsrc(v: string): string | null {
  const t = v.replace(/[\s-]/g, "").toUpperCase();
  return /^[A-Z]{2}[A-Z0-9]{3}\d{7}$/.test(t) ? null : "ISRC non valido: 12 caratteri, es. QTAEV2679933.";
}
/** UPC/EAN: 12 o 13 cifre. */
export function erroreUpc(v: string): string | null {
  const t = v.replace(/[\s-]/g, "");
  return /^\d{12,13}$/.test(t) ? null : "UPC non valido: 12 o 13 cifre, es. 700149429129.";
}

/** Data di oggi a Roma, AAAA-MM-GG. */
export function oggiRoma(d = new Date()): string {
  return d.toLocaleDateString("sv-SE", { timeZone: "Europe/Rome" });
}

/** Stato mostrato: quello scelto a mano, altrimenti dedotto dalla data (senza data = prossima). */
export function statoEffettivo(u: { stato?: StatoUscita | null; dataUscita: string | null }, oggi = oggiRoma()): StatoUscita {
  if (u.stato) return u.stato;
  if (u.dataUscita && u.dataUscita <= oggi) return "pubblicata";
  return "prossima";
}

/** Indirizzo del player Spotify ufficiale (album, singolo, brano, playlist) da un link Spotify. */
export function embedSpotify(url: string): string | null {
  const m = /^https:\/\/open\.spotify\.com\/(?:intl-[a-z]{2}\/)?(album|track|playlist|episode|show)\/([A-Za-z0-9]{10,40})/.exec(url.trim());
  return m ? `https://open.spotify.com/embed/${m[1]}/${m[2]}` : null;
}

export type Uscita = {
  /** = id del brano nel catalogo musicale. */
  id: string;
  tipo: TipoUscita;
  /** Nome con cui l'artista è distribuito sugli store (es. «J. C. Hugò Deejay»), se diverso. */
  artistaDistribuito?: string | null;
  /** Distributore (es. «DistroKid»). */
  distribuzione?: string | null;
  isrc?: string | null;
  upc?: string | null;
  /** null = automatico dalla data. */
  stato?: StatoUscita | null;
  ricorrenza?: Ricorrenza | null;
  /** Compare in «Produzioni DJ J.C. Hugò». */
  produzioneJcHugo?: boolean;
  /** AAAA-MM-GG — data di uscita ufficiale; null = «Data da confermare». */
  dataUscita: string | null;
  /** Etichetta discografica, solo se indicata (es. sulla copertina). */
  etichettaDiscografica: string | null;
  /** Messaggio mostrato finché non ci sono collegamenti d'ascolto. */
  messaggioAttesa: string | null;
  /** Nota pubblica sui materiali (es. audio e video non ancora consegnati). */
  notaMateriali: string | null;
  link: LinkUscita[];
  /** ISO — ultimo salvataggio della scheda. */
  aggiornato: string;
};

export const MESSAGGIO_ATTESA = "Collegamenti di ascolto in arrivo";

export const ORDINE_PIATTAFORME = new Map(PIATTAFORME_USCITA.map((p, i) => [p, i]));

/** Testo del pulsante pubblico di un link. */
export function testoPulsante(l: Pick<LinkUscita, "piattaforma" | "ambito" | "etichetta">): string {
  if (l.etichetta?.trim()) return l.etichetta.trim();
  const i = INFO_PIATTAFORME[l.piattaforma];
  if (i.social) return l.ambito === "profilo" ? `Profilo ufficiale ${i.nome}` : `Il brano su ${i.nome}`;
  return i.pulsante;
}

/** Controllo dell'indirizzo per piattaforma: null = valido, altrimenti la frase d'errore. */
export function erroreUrl(piattaforma: PiattaformaUscita, url: string): string | null {
  let u: URL;
  try {
    u = new URL(url.trim());
  } catch {
    return "Indirizzo non valido: incolla l'URL completo (https://…).";
  }
  if (u.protocol !== "https:") return "L'indirizzo deve iniziare con https://.";
  const host = u.hostname.toLowerCase().replace(/^www\./, "").replace(/^m\./, "");
  const i = INFO_PIATTAFORME[piattaforma];
  if (piattaforma === "hyperfollow" && !(host === "distrokid.com" && u.pathname.startsWith("/hyperfollow/")))
    return "Il link HyperFollow deve iniziare con https://distrokid.com/hyperfollow/.";
  if (i.domini && !i.domini.some((d) => host === d || host.endsWith(`.${d}`)))
    return `Questo indirizzo non è di ${i.nome} (dominio ${host}). Controlla di averlo incollato nel campo giusto.`;
  return null;
}

/** Data AAAA-MM-GG → «12/11/2026». */
export function dataLeggibile(d: string | null): string | null {
  if (!d) return null;
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(d);
  return m ? `${m[3]}/${m[2]}/${m[1]}` : d;
}

/* ── Percorsi interni (derivati dalle rotte esistenti in src/web/app.tsx) ─────────────── */

export const PERCORSI_MUSICA = {
  scheda: (id: string) => `/musica/brano/${encodeURIComponent(id)}`,
  calendario: "/musica/calendario-uscite",
  discografia: "/musica/discografia",
  artista: "/musica/jc-hugo",
  catalogo: "/musica/jc-hugo#brani",
  radio: "/radio",
  tv: "/tv",
  touchMusicChannel: "/channel/scheda/touch-music-channel",
  touchMusicRecords: "/channel/scheda/touch-music-records",
} as const;
