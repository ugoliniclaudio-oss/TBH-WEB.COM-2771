import { and, asc, eq, like } from "drizzle-orm";
import { db } from "../database";
import * as schema from "../database/schema";
import { AMBIENTE, chiaveAmbito } from "./ambiente";
import { idYouTube } from "./channel-palinsesti";
import { DURATA_MAX_VIDEO_SEC, controllaDurata, datiYouTube, testoDurata, type ControlloDurata } from "./durata-video";

/**
 * CANALI TEMATICI (Claudio, 28/10/2026 — TOUCH MUSIC · TOUCH INFLUENCITY MAGAZINE · ARM WRESTLING).
 *
 * Nessuna tabella nuova (regola fissa):
 *  · i CANALI sono un elenco JSON in `settings` (chiave d'ambito «canali_tematici»): si creano,
 *    modificano, spengono ed eliminano dal pannello, senza toccare il codice;
 *  · i CONTENUTI sono righe di `channel_contenuti` con channel = «tematico:<slug>» (così non entrano
 *    mai nei palinsesti dei Channel di Canale 0) e fonte = «canale-tematico». Stato editoriale,
 *    piattaforma, miniatura, campi propri del canale (artista, atleti, numero del magazine…) e
 *    ultima verifica stanno in `descrizione` come JSON. `attivo` = interruttore acceso/spento;
 *  · indice unico (ambiente, channel, sorgente): lo stesso URL non entra due volte nello stesso
 *    canale; fra canali diversi il doppione viene SEGNALATO.
 *
 * Regole: solo player ufficiali (YouTube, Vimeo, Dailymotion) o file video diretti indicati
 * dall'amministratore; niente download né ripubblicazione. Nessun contenuto inserito d'ufficio.
 */

export type StatoCanale = "allestimento" | "attivo" | "non-disponibile";
export type StatoVoce = "bozza" | "approvato" | "pubblicato" | "non-disponibile";
export type TipoVoce = "video" | "articolo" | "immagine" | "numero";
export type Piattaforma = "youtube" | "vimeo" | "dailymotion" | "video" | "pagina";

export const STATI_CANALE: StatoCanale[] = ["allestimento", "attivo", "non-disponibile"];
export const STATI_VOCE: StatoVoce[] = ["bozza", "approvato", "pubblicato", "non-disponibile"];
export const TIPI_VOCE: TipoVoce[] = ["video", "articolo", "immagine", "numero"];

export type CampoCanale = { chiave: string; etichetta: string };
export type CanaleTematico = {
  slug: string;
  nome: string;
  descrizione: string;
  stato: StatoCanale;
  /** false = canale spento: sparisce dal sito, resta nel pannello con il suo catalogo. */
  abilitato: boolean;
  /** Channel del registro collegato (logo e scheda /channel/scheda/<slug>). */
  slugRegistro: string | null;
  /** Logo ufficiale (percorso in /public o https). */
  logo: string | null;
  /** Pagina del sito già esistente che mostra questo canale (oltre a /canali/<slug>). */
  pagina: string | null;
  tipiAmmessi: TipoVoce[];
  campi: CampoCanale[];
  ordine: number;
  /**
   * 28/10/2026 — «casuale» = successione casuale per spettatore (TOUCH MUSIC); «sequenza» = i video
   * nell'ordine della scaletta, uno dopo l'altro.
   */
  riproduzione: Riproduzione;
  /** Ciclo continuo H24: finita la scaletta si riparte dal primo video (somma dei video ≤ 24 h). */
  cicloH24: boolean;
  /** Secondi di ogni anteprima / immagine statica nella rotazione (3–120). */
  secondiImmagine: number;
};
export type Riproduzione = "casuale" | "sequenza";
export const RIPRODUZIONI: Riproduzione[] = ["casuale", "sequenza"];
export const SECONDI_IMMAGINE_PREDEFINITI = 7;

/** I tre canali chiesti da Claudio: valgono finché il pannello non salva il primo elenco. */
export const CANALI_PREDEFINITI: CanaleTematico[] = [
  {
    slug: "touch-music",
    nome: "TOUCH MUSIC",
    descrizione: "Videoclip, esibizioni e contenuti musicali in successione casuale.",
    stato: "allestimento",
    abilitato: true,
    slugRegistro: "touch-music-channel",
    logo: "/channel/loghi/tematici/touch-music.jpe",
    pagina: null,
    tipiAmmessi: ["video"],
    campi: [
      { chiave: "artista", etichetta: "Artista" },
      { chiave: "genere", etichetta: "Genere" },
    ],
    ordine: 1,
    riproduzione: "casuale",
    cicloH24: false,
    secondiImmagine: SECONDI_IMMAGINE_PREDEFINITI,
  },
  {
    slug: "touch-influencity-magazine",
    nome: "TOUCH INFLUENCITY MAGAZINE",
    descrizione: "Interviste, moda, bellezza, modelle, influencer e personaggi dei numeri del magazine.",
    stato: "allestimento",
    abilitato: true,
    slugRegistro: "touch-influencity",
    logo: "/channel/loghi/tematici/touch-influencity.jpe",
    pagina: "/influencity",
    tipiAmmessi: ["video", "articolo", "immagine", "numero"],
    campi: [
      { chiave: "numero", etichetta: "Numero del magazine" },
      { chiave: "linkNumero", etichetta: "Link al numero" },
      { chiave: "protagonista", etichetta: "Protagonista" },
      { chiave: "argomento", etichetta: "Argomento" },
    ],
    ordine: 2,
    riproduzione: "casuale",
    cicloH24: false,
    secondiImmagine: SECONDI_IMMAGINE_PREDEFINITI,
  },
  {
    slug: "arm-wrestling",
    nome: "ARM WRESTLING",
    descrizione: "Braccio di ferro: incontri, tornei, allenamenti, interviste e approfondimenti.",
    stato: "allestimento",
    abilitato: true,
    slugRegistro: "touch-arm-wrestling",
    logo: "/channel/loghi/tematici/touch-arm-wrestling.apng",
    pagina: "/arm-wrestling",
    tipiAmmessi: ["video"],
    campi: [
      { chiave: "atleti", etichetta: "Atleti" },
      { chiave: "evento", etichetta: "Evento" },
      { chiave: "categoria", etichetta: "Categoria" },
    ],
    ordine: 3,
    riproduzione: "sequenza",
    cicloH24: true,
    secondiImmagine: SECONDI_IMMAGINE_PREDEFINITI,
  },
];

const CHIAVE_CANALI = chiaveAmbito("canali_tematici");
const CHIAVE_ERRORI = chiaveAmbito("canali_tematici_errori");
export const PREFISSO = "tematico:";
const FONTE = "canale-tematico";

async function leggiSetting<T>(chiave: string): Promise<T | null> {
  const [r] = await db.select().from(schema.settings).where(eq(schema.settings.key, chiave));
  if (!r) return null;
  try {
    return JSON.parse(r.value) as T;
  } catch {
    return null;
  }
}
async function scriviSetting(chiave: string, valore: unknown) {
  const value = JSON.stringify(valore);
  await db.insert(schema.settings).values({ key: chiave, value }).onConflictDoUpdate({ target: schema.settings.key, set: { value } });
}

/** Elenchi salvati prima del 28/10/2026 non hanno riproduzione / ciclo / secondi: si completano con i valori di sempre. */
function completa(c: Partial<CanaleTematico> & { slug: string }): CanaleTematico {
  const n = Number(c.secondiImmagine);
  return {
    ...(c as CanaleTematico),
    riproduzione: RIPRODUZIONI.includes(c.riproduzione as Riproduzione) ? (c.riproduzione as Riproduzione) : "casuale",
    cicloH24: c.cicloH24 === true,
    secondiImmagine: Number.isFinite(n) && n >= 3 && n <= 120 ? Math.round(n) : SECONDI_IMMAGINE_PREDEFINITI,
  };
}

export async function elencoCanali(): Promise<CanaleTematico[]> {
  const salvati = await leggiSetting<CanaleTematico[]>(CHIAVE_CANALI);
  const lista = (Array.isArray(salvati) ? salvati : CANALI_PREDEFINITI).map(completa);
  return lista.sort((a, b) => a.ordine - b.ordine || a.nome.localeCompare(b.nome));
}
export const salvaCanali = (lista: CanaleTematico[]) => scriviSetting(CHIAVE_CANALI, lista);

/* ── analisi degli URL ────────────────────────────────────────────────────── */

export type Analisi = { piattaforma: Piattaforma; embedId: string | null; url: string; sorgente: string };

export function analizzaUrl(grezzo: string): Analisi | null {
  const t = grezzo.trim();
  let u: URL;
  try {
    u = new URL(/^https?:\/\//i.test(t) ? t : `https://${t}`);
  } catch {
    return null;
  }
  if (!/^https?:$/.test(u.protocol) || !u.hostname.includes(".")) return null;
  u.hash = "";
  const url = u.toString();
  const host = u.hostname.replace(/^www\.|^m\./, "");
  if (/(^|\.)youtube(-nocookie)?\.com$|^youtu\.be$/.test(host)) {
    const id = idYouTube(url);
    if (id) return { piattaforma: "youtube", embedId: id, url: `https://www.youtube.com/watch?v=${id}`, sorgente: id };
  }
  if (/(^|\.)vimeo\.com$/.test(host)) {
    const m = u.pathname.match(/(?:video\/)?(\d{5,})/);
    if (m) return { piattaforma: "vimeo", embedId: m[1]!, url: `https://vimeo.com/${m[1]}`, sorgente: `vimeo:${m[1]}` };
  }
  if (/(^|\.)dailymotion\.com$|^dai\.ly$/.test(host)) {
    const m = u.pathname.match(/(?:video\/|^\/)(x[a-z0-9]+)/i);
    if (m) return { piattaforma: "dailymotion", embedId: m[1]!, url: `https://www.dailymotion.com/video/${m[1]}`, sorgente: `dailymotion:${m[1]}` };
  }
  const senzaBarra = url.replace(/\/$/, "");
  if (/\.(mp4|webm|m4v|ogv|mov)$/i.test(u.pathname)) return { piattaforma: "video", embedId: null, url, sorgente: senzaBarra };
  return { piattaforma: "pagina", embedId: null, url, sorgente: senzaBarra };
}

/* ── verifica di riproducibilità (oEmbed ufficiali) ───────────────────────── */

export type Verifica = {
  quando: number;
  esito: "ok" | "errore" | "non-verificabile";
  messaggio: string;
};
export type Info = Verifica & {
  titolo: string | null;
  autore: string | null;
  miniatura: string | null;
  durataSec: number | null;
  /** Da dove viene la durata: oEmbed / pagina pubblica / risultati di ricerca pubblici. */
  durataDa: "fonte" | "pagina" | "ricerca" | null;
  /** Solo per le pagine: video incorporati trovati davvero nella pagina. */
  videoIncorporati: string[];
};

const UA = "Mozilla/5.0 (compatible; TBH-Canali/1.0; +https://tbh)";

async function scarica(url: string, ms = 9000) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), ms);
  try {
    return await fetch(url, { signal: ctrl.signal, redirect: "follow", headers: { "user-agent": UA, accept: "*/*" } });
  } finally {
    clearTimeout(t);
  }
}

const vuota = (esito: Verifica["esito"], messaggio: string): Info => ({
  quando: Date.now(),
  esito,
  messaggio,
  titolo: null,
  autore: null,
  miniatura: null,
  durataSec: null,
  durataDa: null,
  videoIncorporati: [],
});

async function oembed(endpoint: string, nome: string): Promise<Info> {
  const r = await scarica(endpoint);
  if (r.status === 401 || r.status === 403) return vuota("errore", `${nome}: il proprietario non consente l'incorporamento del video.`);
  if (r.status === 404 || r.status === 400) return vuota("errore", `${nome}: video inesistente, privato o rimosso.`);
  if (!r.ok) return vuota("non-verificabile", `${nome} non ha risposto (HTTP ${r.status}): riprovare più tardi.`);
  const j = (await r.json()) as Record<string, unknown>;
  const s = (k: string) => (typeof j[k] === "string" && (j[k] as string).trim() ? (j[k] as string).trim() : null);
  return {
    ...vuota("ok", `${nome}: video pubblico e incorporabile.`),
    titolo: s("title"),
    autore: s("author_name"),
    miniatura: s("thumbnail_url"),
    durataSec: typeof j.duration === "number" && j.duration > 0 ? Math.round(j.duration) : null,
    durataDa: typeof j.duration === "number" && j.duration > 0 ? "fonte" : null,
  };
}

/** YouTube: oEmbed ufficiale (pubblico/incorporabile, titolo, miniatura) + durata dalla pagina pubblica o dalla ricerca. */
async function youtube(a: Analisi): Promise<Info> {
  const [o, p] = await Promise.all([
    oembed(`https://www.youtube.com/oembed?format=json&url=${encodeURIComponent(a.url)}`, "YouTube"),
    datiYouTube(a.embedId!).catch(() => null),
  ]);
  if (o.esito !== "ok" || !p) return o;
  if (p.incorporabile === false) return { ...o, esito: "errore", messaggio: "YouTube: il proprietario non consente la riproduzione fuori da YouTube (incorporamento disattivato)." };
  if (p.diretta) return { ...o, esito: "errore", messaggio: "YouTube: è una diretta in corso (durata indefinita): non può entrare in una scaletta." };
  const durata = { durataSec: p.durata, durataDa: p.durataDa };
  if (p.stato && p.stato !== "OK")
    return {
      ...o,
      ...durata,
      esito: "non-verificabile",
      messaggio: `YouTube: oEmbed pubblico, ma la pagina vista dal server dice «${p.motivo ?? p.stato}» (può dipendere dal paese del server). Controllare l'anteprima e confermare.`,
    };
  const comeDurata = p.durataDa === "pagina" ? "durata letta dalla pagina pubblica" : p.durataDa === "ricerca" ? "durata letta dai risultati di ricerca pubblici di YouTube" : "durata non leggibile: inserirla a mano";
  const nota = p.antiRobot ? " Restrizioni di paese e incorporamento non leggibili dal server (verifica anti-robot di YouTube): le controlla il player." : "";
  return { ...o, ...durata, messaggio: `YouTube: video pubblico e incorporabile (oEmbed ufficiale), ${comeDurata}.${nota}` };
}

function attributo(html: string, prop: string) {
  const re = new RegExp(`<meta[^>]+(?:property|name)=["']${prop}["'][^>]*content=["']([^"']+)["']|<meta[^>]+content=["']([^"']+)["'][^>]*(?:property|name)=["']${prop}["']`, "i");
  const m = html.match(re);
  return m ? (m[1] ?? m[2] ?? "").replace(/&amp;/g, "&").replace(/&#0?39;/g, "'").replace(/&quot;/g, '"').trim() || null : null;
}

async function pagina(url: string): Promise<Info> {
  const r = await scarica(url);
  const html = r.ok || r.status === 202 ? await r.text() : "";
  if (/sgcaptcha|captcha\/\?|Robot Challenge|cf-chl-|challenge-platform/i.test(html) || r.status === 202)
    return vuota(
      "non-verificabile",
      "Il sito protegge le pagine con una verifica anti-robot: il server non può leggerle. Aprire l'articolo nel browser e incollare qui l'URL del video (YouTube/Vimeo).",
    );
  if (!r.ok) return vuota("errore", `Pagina non raggiungibile (HTTP ${r.status}).`);
  const trovati = new Set<string>();
  for (const m of html.matchAll(/<(?:iframe|video|source|embed)[^>]+src=["']([^"']+)["']/gi)) {
    const a = analizzaUrl(m[1]!.startsWith("//") ? `https:${m[1]}` : m[1]!);
    if (a && a.piattaforma !== "pagina") trovati.add(a.url);
  }
  return {
    ...vuota(
      "non-verificabile",
      trovati.size
        ? `Pagina editoriale: ${trovati.size} video incorporat${trovati.size === 1 ? "o" : "i"} trovat${trovati.size === 1 ? "o" : "i"}. Una pagina non è un video: inserire l'URL del video o usarla come scheda.`
        : "Pagina editoriale senza video incorporato riconoscibile: si può usare solo come scheda (articolo / immagine / numero).",
    ),
    titolo: attributo(html, "og:title") ?? html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1]?.trim() ?? null,
    miniatura: attributo(html, "og:image"),
    autore: attributo(html, "og:site_name"),
    videoIncorporati: [...trovati].slice(0, 20),
  };
}

async function fileVideo(url: string): Promise<Info> {
  let r = await scarica(url);
  if (r.status === 405) r = await scarica(url);
  const tipo = r.headers.get("content-type") ?? "";
  try {
    await r.body?.cancel();
  } catch {
    /* corpo già chiuso */
  }
  if (!r.ok) return vuota("errore", `File video non raggiungibile (HTTP ${r.status}).`);
  if (!/^video\/|application\/octet-stream/i.test(tipo)) return vuota("errore", `L'indirizzo non è un file video (tipo «${tipo || "sconosciuto"}»).`);
  return { ...vuota("ok", "File video raggiungibile: si riproduce con il player del browser, senza copie."), titolo: decodeURIComponent(new URL(url).pathname.split("/").pop() ?? "") || null };
}

export async function recuperaInfo(a: Analisi): Promise<Info> {
  try {
    const q = encodeURIComponent(a.url);
    switch (a.piattaforma) {
      case "youtube":
        return await youtube(a);
      case "vimeo":
        return await oembed(`https://vimeo.com/api/oembed.json?url=${q}`, "Vimeo");
      case "dailymotion":
        return await oembed(`https://www.dailymotion.com/services/oembed?format=json&url=${q}`, "Dailymotion");
      case "video":
        return await fileVideo(a.url);
      default:
        return await pagina(a.url);
    }
  } catch (e) {
    const m = e instanceof Error ? e.message : String(e);
    return vuota("non-verificabile", `Verifica non riuscita (${/abort/i.test(m) ? "tempo scaduto" : m}): riprovare.`);
  }
}

/* ── contenuti ────────────────────────────────────────────────────────────── */

export type MetaVoce = {
  v: 1;
  stato: StatoVoce;
  piattaforma: Piattaforma;
  embedId: string | null;
  miniatura: string | null;
  campi: Record<string, string>;
  verifica: Verifica | null;
  errori: number;
  ultimoErrore: { quando: number; messaggio: string } | null;
  /** Stato prima che una segnalazione lo mettesse «non disponibile» (per ripristinarlo). */
  statoPrecedente?: StatoVoce;
  /** Origine della durata: «manuale» = scritta dall'amministratore. */
  durataDa?: "manuale" | "fonte" | "pagina" | "ricerca" | null;
  /** Oltre i 90 minuti: l'amministratore ha confermato l'inserimento (il video non viene tagliato). */
  confermaOltre?: boolean;
};

type Riga = typeof schema.channelContenuti.$inferSelect;

export function leggiMeta(r: Riga): MetaVoce {
  let m: Partial<MetaVoce> = {};
  try {
    m = r.descrizione ? (JSON.parse(r.descrizione) as Partial<MetaVoce>) : {};
  } catch {
    m = {};
  }
  const a = analizzaUrl(r.link ?? r.sorgente);
  return {
    v: 1,
    stato: STATI_VOCE.includes(m.stato as StatoVoce) ? (m.stato as StatoVoce) : "bozza",
    piattaforma: m.piattaforma ?? a?.piattaforma ?? "pagina",
    embedId: m.embedId ?? a?.embedId ?? null,
    miniatura: m.miniatura ?? null,
    campi: m.campi && typeof m.campi === "object" ? m.campi : {},
    verifica: m.verifica ?? null,
    errori: m.errori ?? 0,
    ultimoErrore: m.ultimoErrore ?? null,
    ...(m.statoPrecedente ? { statoPrecedente: m.statoPrecedente } : {}),
    ...(m.durataDa ? { durataDa: m.durataDa } : {}),
    ...(m.confermaOltre ? { confermaOltre: true } : {}),
  };
}

export const scriviMeta = (m: MetaVoce) => JSON.stringify(m);

export type Voce = {
  id: number;
  canale: string;
  tipo: TipoVoce;
  titolo: string;
  url: string;
  sorgente: string;
  fonte: string | null;
  durataSec: number | null;
  abilitato: boolean;
  ordine: number;
  aggiornato: number;
  /** Supera i 90 minuti per singolo video (segnalato, mai tagliato). */
  oltreLimite: boolean;
} & Omit<MetaVoce, "v">;

export function voce(r: Riga): Voce {
  const { v: _v, ...m } = leggiMeta(r);
  return {
    id: r.id,
    canale: r.channel.slice(PREFISSO.length),
    tipo: (TIPI_VOCE.includes(r.tipo as TipoVoce) ? r.tipo : "video") as TipoVoce,
    titolo: r.titolo,
    url: r.link ?? r.sorgente,
    sorgente: r.sorgente,
    fonte: r.attribuzione,
    durataSec: r.durataSec,
    abilitato: !!r.attivo,
    ordine: r.ordine,
    aggiornato: r.updatedAt.getTime(),
    oltreLimite: (r.tipo ?? "video") === "video" && !!r.durataSec && r.durataSec > DURATA_MAX_VIDEO_SEC,
    ...m,
  };
}

/** Video che possono andare in onda: acceso, approvato o pubblicato, su un player ufficiale. */
export const inOnda = (v: Voce) => v.tipo === "video" && v.abilitato && (v.stato === "approvato" || v.stato === "pubblicato") && v.piattaforma !== "pagina";
/** Schede consultabili (articoli, immagini, numeri del magazine): mai trattate come video. */
export const schedaVisibile = (v: Voce) => v.tipo !== "video" && v.abilitato && (v.stato === "approvato" || v.stato === "pubblicato");

export async function righeTematiche(slug?: string): Promise<Riga[]> {
  return db
    .select()
    .from(schema.channelContenuti)
    .where(
      and(
        eq(schema.channelContenuti.ambiente, AMBIENTE),
        slug ? eq(schema.channelContenuti.channel, PREFISSO + slug) : like(schema.channelContenuti.channel, `${PREFISSO}%`),
      ),
    )
    .orderBy(asc(schema.channelContenuti.ordine), asc(schema.channelContenuti.id));
}

export async function rigaPerId(id: number): Promise<Riga | null> {
  const [r] = await db
    .select()
    .from(schema.channelContenuti)
    .where(and(eq(schema.channelContenuti.id, id), eq(schema.channelContenuti.ambiente, AMBIENTE), like(schema.channelContenuti.channel, `${PREFISSO}%`)));
  return r ?? null;
}

export async function aggiornaRiga(id: number, valori: Partial<typeof schema.channelContenuti.$inferInsert>) {
  await db
    .update(schema.channelContenuti)
    .set({ ...valori, updatedAt: new Date() })
    .where(and(eq(schema.channelContenuti.id, id), eq(schema.channelContenuti.ambiente, AMBIENTE)));
}

export type EsitoInserimento = {
  url: string;
  esito: "inserito" | "duplicato" | "non-valido" | "oltre-limite";
  id?: number;
  titolo?: string;
  messaggio: string;
  /** Lo stesso URL è già in altri canali (segnalazione, non blocco). */
  ancheIn?: string[];
  verifica?: Verifica;
  videoIncorporati?: string[];
  durataSec?: number | null;
  durata?: ControlloDurata;
};

/** Inserisce UN URL come BOZZA nel canale, con titolo e miniatura recuperati quando la fonte lo permette. */
export async function inserisci(
  slug: string,
  grezzo: string,
  opz: {
    tipo: TipoVoce;
    titolo?: string | null;
    miniatura?: string | null;
    fonte?: string | null;
    campi?: Record<string, string>;
    /** Durata scritta dall'amministratore (prevale su quella letta dalla fonte). */
    durataSec?: number | null;
    /** Conferma esplicita per un video oltre i 90 minuti. */
    confermaOltre?: boolean;
  },
  tutte?: Riga[],
): Promise<EsitoInserimento> {
  const a = analizzaUrl(grezzo);
  if (!a) return { url: grezzo, esito: "non-valido", messaggio: "Indirizzo non valido." };
  const righe = tutte ?? (await righeTematiche());
  const stesso = righe.find((r) => r.channel === PREFISSO + slug && r.sorgente === a.sorgente);
  if (stesso) return { url: a.url, esito: "duplicato", id: stesso.id, titolo: stesso.titolo, messaggio: "URL già presente in questo canale: non inserito di nuovo." };
  const ancheIn = [...new Set(righe.filter((r) => r.sorgente === a.sorgente).map((r) => r.channel.slice(PREFISSO.length)))];
  const info = await recuperaInfo(a);
  const tipo = opz.tipo;
  const nota =
    tipo === "video" && a.piattaforma === "pagina"
      ? " Una pagina web non è un video: resta in bozza finché non si indica la sorgente video (o si cambia tipo in scheda)."
      : "";
  const host = new URL(a.url).hostname.replace(/^www\./, "");
  const titolo = (opz.titolo?.trim() || info.titolo || `Senza titolo · ${host}`).slice(0, 300);
  const manuale = opz.durataSec && opz.durataSec > 0 ? Math.round(opz.durataSec) : null;
  const durataSec = manuale ?? info.durataSec;
  const durata = controllaDurata(durataSec);
  if (tipo === "video" && durata.esito === "oltre" && !opz.confermaOltre)
    return {
      url: a.url,
      esito: "oltre-limite",
      titolo,
      durataSec,
      durata,
      messaggio: `NON inserito: ${durata.messaggio}`,
      verifica: { quando: info.quando, esito: info.esito, messaggio: info.messaggio },
    };
  const meta: MetaVoce = {
    v: 1,
    stato: "bozza",
    piattaforma: a.piattaforma,
    embedId: a.embedId,
    miniatura: opz.miniatura?.trim() || info.miniatura,
    campi: opz.campi ?? {},
    verifica: { quando: info.quando, esito: info.esito, messaggio: info.messaggio },
    errori: 0,
    ultimoErrore: null,
    durataDa: manuale ? "manuale" : info.durataDa,
    ...(tipo === "video" && durata.esito === "oltre" ? { confermaOltre: true } : {}),
  };
  const ordine = righe.filter((r) => r.channel === PREFISSO + slug).reduce((m, r) => Math.max(m, r.ordine + 1), 0);
  const [nuova] = await db
    .insert(schema.channelContenuti)
    .values({
      ambiente: AMBIENTE,
      channel: PREFISSO + slug,
      tipo,
      titolo,
      descrizione: scriviMeta(meta),
      sorgente: a.sorgente,
      link: a.url,
      durataSec,
      attribuzione: opz.fonte?.trim() || info.autore || host,
      origine: "manuale",
      fonte: FONTE,
      ordine,
      attivo: 1,
    })
    .onConflictDoNothing()
    .returning();
  if (!nuova) return { url: a.url, esito: "duplicato", messaggio: "URL già presente in questo canale." };
  righe.push(nuova);
  return {
    url: a.url,
    esito: "inserito",
    id: nuova.id,
    titolo,
    messaggio: `Inserito in bozza. ${info.messaggio}${nota}${tipo === "video" ? ` ${durata.esito === "oltre" ? `ATTENZIONE: ${testoDurata(durataSec)}, oltre i 90 minuti (inserito su conferma, non tagliato).` : durata.messaggio}` : ""}`,
    durataSec,
    durata,
    ancheIn: ancheIn.length ? ancheIn : undefined,
    verifica: meta.verifica!,
    videoIncorporati: info.videoIncorporati.length ? info.videoIncorporati : undefined,
  };
}

/* ── registro degli errori di riproduzione ────────────────────────────────── */

export type ErroreRegistrato = { quando: number; canale: string; id: number; titolo: string; codice: string; messaggio: string; esito: string };

export async function registroErrori(): Promise<ErroreRegistrato[]> {
  return (await leggiSetting<ErroreRegistrato[]>(CHIAVE_ERRORI)) ?? [];
}
export async function aggiungiErrore(e: ErroreRegistrato) {
  const lista = await registroErrori();
  lista.unshift(e);
  await scriviSetting(CHIAVE_ERRORI, lista.slice(0, 200));
}
export const svuotaErrori = () => scriviSetting(CHIAVE_ERRORI, []);
