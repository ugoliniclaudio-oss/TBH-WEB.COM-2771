import { and, asc, eq } from "drizzle-orm";
import { db } from "../database";
import * as schema from "../database/schema";
import { AMBIENTE, chiaveAmbito } from "./ambiente";
import { analizzaUrl, recuperaInfo } from "./canali-tematici";

/**
 * TOUCH TALENT & PROFESSIONALS CHANNEL (Claudio, 28/10/2026).
 *
 * Nessuna tabella nuova (regola fissa):
 *  · ogni MONITOR è una riga di `channel_contenuti` con channel = «talent:touch-talent-professionals»
 *    e fonte = «touch-talent» (non entra mai negli altri palinsesti). Protagonista, categorie,
 *    «Emergente», piattaforma, miniatura, verifica, errori e capacità di sincronizzazione stanno in
 *    `descrizione` come JSON. Indice unico (ambiente, channel, sorgente) = niente doppioni;
 *  · il PALINSESTO H24 è memorizzato in `settings` (chiave d'ambito «touch_talent_palinsesto»):
 *    ordine del giro, durate congelate, istante d'inizio. È lo stesso per tutti gli spettatori e
 *    esiste anche senza nessuno collegato: ogni pagina calcola dall'ORA DEL SERVER il monitor in onda
 *    e il punto di riproduzione;
 *  · impostazioni di priorità in «touch_talent_impostazioni», registro errori in «touch_talent_errori».
 *
 * Regole del palinsesto: giro mescolato (pesato: emergenti e nuovi caricamenti tendono a uscire prima),
 * si completa il giro prima di rimescolare, mai lo stesso monitor due volte di fila (anche a cavallo
 * fra due giri), mai lo stesso protagonista di seguito se c'è un'alternativa, ripartenza automatica a
 * fine catalogo, nuovi monitor inseriti nella parte futura del giro senza interrompere quello in onda,
 * monitor non disponibili tolti dal palinsesto e segnalati all'amministratore.
 * Mescolamento con seme deterministico: due richieste contemporanee generano lo stesso giro.
 */

export const SLUG_TALENT = "touch-talent-professionals";
export const CANALE_TALENT = `talent:${SLUG_TALENT}`;
const FONTE = "touch-talent";

export const CATEGORIE_TALENT = ["artisti", "staff", "crew", "indipendenti"] as const;
export type CategoriaTalent = (typeof CATEGORIE_TALENT)[number];
export const STATI_MONITOR = ["bozza", "attivo", "disattivato", "non-disponibile"] as const;
export type StatoMonitor = (typeof STATI_MONITOR)[number];
export type PiattaformaTalent = "youtube" | "vimeo" | "dailymotion" | "tiktok" | "facebook" | "instagram" | "video";

const CHIAVE_PALINSESTO = chiaveAmbito("touch_talent_palinsesto");
const CHIAVE_IMPOSTAZIONI = chiaveAmbito("touch_talent_impostazioni");
const CHIAVE_ERRORI = chiaveAmbito("touch_talent_errori");

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

/* ── capacità delle fonti ─────────────────────────────────────────────────── */

export type Capacita = {
  /** La fonte fornisce la durata (senza durata il palinsesto usa uno slot stimato). */
  durata: boolean;
  /** Il player permette di partire dal punto giusto (sincronizzazione fra spettatori). */
  seek: boolean;
  /** Il player avvisa a fine video. Il cambio monitor segue comunque l'orologio del palinsesto. */
  fine: boolean;
  /** Riproduzione automatica possibile (sempre soggetta al blocco del browser → «Avvia canale»). */
  autoplay: boolean;
};

export const CAPACITA: Record<PiattaformaTalent, Omit<Capacita, "durata"> & { durataFonte: boolean; nome: string }> = {
  youtube: { nome: "YouTube", durataFonte: true, seek: true, fine: true, autoplay: true },
  vimeo: { nome: "Vimeo", durataFonte: true, seek: true, fine: true, autoplay: true },
  dailymotion: { nome: "Dailymotion", durataFonte: true, seek: true, fine: false, autoplay: true },
  video: { nome: "File video", durataFonte: false, seek: true, fine: true, autoplay: true },
  tiktok: { nome: "TikTok", durataFonte: false, seek: false, fine: false, autoplay: true },
  facebook: { nome: "Facebook", durataFonte: false, seek: false, fine: false, autoplay: false },
  instagram: { nome: "Instagram", durataFonte: false, seek: false, fine: false, autoplay: false },
};

/* ── analisi degli URL ────────────────────────────────────────────────────── */

export type AnalisiTalent = { piattaforma: PiattaformaTalent; embedId: string | null; url: string; sorgente: string };

/** YouTube (anche Shorts e live), Vimeo, Dailymotion, TikTok, Facebook, Instagram, file video. Le pagine web non sono monitor. */
export function analizzaTalent(grezzo: string): AnalisiTalent | { errore: string } {
  const t = grezzo.trim();
  let u: URL;
  try {
    u = new URL(/^https?:\/\//i.test(t) ? t : `https://${t}`);
  } catch {
    return { errore: "Indirizzo non valido." };
  }
  if (!/^https?:$/.test(u.protocol) || !u.hostname.includes(".")) return { errore: "Indirizzo non valido." };
  const host = u.hostname.replace(/^www\.|^m\./, "").toLowerCase();
  if (/(^|\.)tiktok\.com$/.test(host)) {
    const m = u.pathname.match(/\/(?:video|v|embed(?:\/v2)?|player\/v1)\/(\d{8,})/);
    if (m) return { piattaforma: "tiktok", embedId: m[1]!, url: `https://www.tiktok.com${u.pathname.match(/^\/@[^/]+/)?.[0] ?? "/@"}/video/${m[1]}`, sorgente: `tiktok:${m[1]}` };
    return { errore: "TikTok: serve il link completo del video (…/@utente/video/NUMERO). I link brevi vanno aperti e ricopiati." };
  }
  if (/(^|\.)instagram\.com$/.test(host)) {
    const m = u.pathname.match(/^\/(?:[^/]+\/)?(reel|reels|p|tv)\/([A-Za-z0-9_-]+)/);
    if (m) {
      const tipo = m[1] === "p" ? "p" : m[1] === "tv" ? "tv" : "reel";
      return { piattaforma: "instagram", embedId: `${tipo}/${m[2]}`, url: `https://www.instagram.com/${tipo}/${m[2]}/`, sorgente: `instagram:${m[2]}` };
    }
    return { errore: "Instagram: serve il link di un reel o di un post video." };
  }
  if (/(^|\.)facebook\.com$|^fb\.watch$/.test(host)) {
    if (!/\/(videos?|watch|reel|share\/[rv])\b/.test(u.pathname) && host !== "fb.watch" && !u.searchParams.get("v"))
      return { errore: "Facebook: serve il link di un video o di un reel pubblico." };
    u.hash = "";
    const url = u.toString();
    return { piattaforma: "facebook", embedId: null, url, sorgente: `facebook:${url.replace(/^https?:\/\/(www\.|m\.)?/, "").replace(/\/$/, "")}` };
  }
  const a = analizzaUrl(t);
  if (!a) return { errore: "Indirizzo non valido." };
  if (a.piattaforma === "pagina") return { errore: "È una pagina web, non un video: incollare il link del video (YouTube, Vimeo, Dailymotion, TikTok, Facebook, Instagram o file .mp4/.webm)." };
  return { piattaforma: a.piattaforma, embedId: a.embedId, url: a.url, sorgente: a.sorgente };
}

/* ── verifica e dati della fonte ──────────────────────────────────────────── */

export type VerificaTalent = { quando: number; esito: "ok" | "errore" | "non-verificabile"; messaggio: string };
export type InfoTalent = VerificaTalent & {
  titolo: string | null;
  autore: string | null;
  miniatura: string | null;
  durataSec: number | null;
  /** Diretta (durata indefinita): non adatta a un palinsesto a rotazione. */
  diretta: boolean;
};

const UA_BROWSER = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36";

async function scarica(url: string, ms = 9000, intestazioni: Record<string, string> = {}) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), ms);
  try {
    return await fetch(url, { signal: ctrl.signal, redirect: "follow", headers: { "user-agent": UA_BROWSER, accept: "*/*", ...intestazioni } });
  } finally {
    clearTimeout(t);
  }
}

const vuota = (esito: VerificaTalent["esito"], messaggio: string): InfoTalent => ({
  quando: Date.now(),
  esito,
  messaggio,
  titolo: null,
  autore: null,
  miniatura: null,
  durataSec: null,
  diretta: false,
});

/** Pagina pubblica del video YouTube: durata, incorporabilità e stato (l'oEmbed non dà la durata). */
async function datiPaginaYouTube(id: string): Promise<{ durata: number | null; incorporabile: boolean | null; stato: string | null; motivo: string | null; diretta: boolean } | null> {
  try {
    const r = await scarica(`https://www.youtube.com/watch?v=${id}&hl=it`, 10000, { cookie: "CONSENT=YES+1; SOCS=CAI", "accept-language": "it-IT,it;q=0.9" });
    if (!r.ok) return null;
    const h = await r.text();
    const durata = Number(h.match(/"lengthSeconds":"(\d+)"/)?.[1] ?? NaN);
    const emb = h.match(/"playableInEmbed":(true|false)/)?.[1];
    const stato = h.match(/"playabilityStatus":\{"status":"([A-Z_]+)"/)?.[1] ?? null;
    const motivo = h.match(/"playabilityStatus":\{"status":"[A-Z_]+","reason":"([^"]{1,200})"/)?.[1] ?? null;
    const diretta = /"isLiveContent":true/.test(h) && /"isLive":true|"isLiveNow":true/.test(h);
    return { durata: Number.isFinite(durata) && durata > 0 ? durata : null, incorporabile: emb ? emb === "true" : null, stato, motivo, diretta };
  } catch {
    return null;
  }
}

async function oembed(endpoint: string, nome: string): Promise<InfoTalent> {
  const r = await scarica(endpoint);
  if (r.status === 401 || r.status === 403) return vuota("errore", `${nome}: il proprietario non consente l'incorporamento del video.`);
  if (r.status === 404 || r.status === 400) return vuota("errore", `${nome}: video inesistente, privato o rimosso.`);
  if (!r.ok) return vuota("non-verificabile", `${nome} non ha risposto (HTTP ${r.status}): riprovare più tardi.`);
  const j = (await r.json().catch(() => ({}))) as Record<string, unknown>;
  const s = (k: string) => (typeof j[k] === "string" && (j[k] as string).trim() ? (j[k] as string).trim() : null);
  return {
    ...vuota("ok", `${nome}: video pubblico e incorporabile.`),
    titolo: s("title"),
    autore: s("author_name"),
    miniatura: s("thumbnail_url"),
    durataSec: typeof j.duration === "number" && j.duration > 0 ? Math.round(j.duration) : null,
  };
}

export async function infoTalent(a: AnalisiTalent): Promise<InfoTalent> {
  try {
    const q = encodeURIComponent(a.url);
    switch (a.piattaforma) {
      case "youtube": {
        const [o, letta] = await Promise.all([oembed(`https://www.youtube.com/oembed?format=json&url=${q}`, "YouTube"), datiPaginaYouTube(a.embedId!)]);
        // YouTube a volte chiede al SERVER la verifica anti-robot («confermare di non essere un bot»): non dice nulla
        // sul video. In quel caso vale solo l'oEmbed ufficiale (pubblico e incorporabile) e la durata la legge il player.
        const antiRobot = !!letta && letta.stato === "LOGIN_REQUIRED" && /bot|robot|non essere un/i.test(letta.motivo ?? "");
        const p = antiRobot ? null : letta;
        if (antiRobot && o.esito === "ok")
          return { ...o, messaggio: "YouTube: video pubblico e incorporabile (oEmbed ufficiale). Durata non letta: YouTube ha chiesto al server la verifica anti-robot; la legge il player alla prima messa in onda, oppure inserirla a mano." };
        if (p?.incorporabile === false) return { ...o, esito: "errore", messaggio: "YouTube: il proprietario non consente la riproduzione fuori da YouTube (incorporamento disattivato)." };
        if (p?.stato && p.stato !== "OK" && p.stato !== "LIVE_STREAM_OFFLINE")
          return { ...o, esito: "errore", messaggio: `YouTube: video non riproducibile${p.motivo ? ` («${p.motivo}»)` : ` (${p.stato})`}.` };
        if (o.esito !== "ok") return o;
        if (p?.diretta) return { ...o, diretta: true, esito: "errore", messaggio: "YouTube: è una diretta in corso (durata indefinita): non può entrare in un palinsesto a rotazione." };
        return { ...o, durataSec: p?.durata ?? null, messaggio: p?.durata ? "YouTube: video pubblico e incorporabile, durata letta dalla pagina pubblica." : "YouTube: video incorporabile; durata non leggibile (si usa lo slot stimato o la durata inserita a mano)." };
      }
      case "vimeo":
        return await oembed(`https://vimeo.com/api/oembed.json?url=${q}`, "Vimeo");
      case "dailymotion": {
        const r = await scarica(`https://api.dailymotion.com/video/${a.embedId}?fields=title,duration,thumbnail_720_url,owner.screenname,allow_embed,private,status`);
        if (r.status === 404 || r.status === 400 || r.status === 403) return vuota("errore", "Dailymotion: video inesistente, privato o rimosso.");
        if (!r.ok) return vuota("non-verificabile", `Dailymotion non ha risposto (HTTP ${r.status}).`);
        const j = (await r.json()) as Record<string, unknown>;
        if (j.allow_embed === false) return vuota("errore", "Dailymotion: il proprietario non consente l'incorporamento.");
        if (j.status && j.status !== "published") return vuota("errore", `Dailymotion: video non pubblicato (${String(j.status)}).`);
        return {
          ...vuota("ok", "Dailymotion: video pubblico e incorporabile."),
          titolo: typeof j.title === "string" ? j.title : null,
          autore: typeof j["owner.screenname"] === "string" ? (j["owner.screenname"] as string) : null,
          miniatura: typeof j.thumbnail_720_url === "string" ? j.thumbnail_720_url : null,
          durataSec: typeof j.duration === "number" && j.duration > 0 ? Math.round(j.duration) : null,
        };
      }
      case "tiktok": {
        const o = await oembed(`https://www.tiktok.com/oembed?url=${q}`, "TikTok");
        return o.esito === "ok" ? { ...o, messaggio: "TikTok: video pubblico. TikTok non fornisce la durata né il punto di partenza: inserire la durata a mano." } : o;
      }
      case "facebook":
        return { ...vuota("non-verificabile", "Facebook non permette la verifica senza credenziali: controllare l'anteprima e inserire titolo e durata a mano."), titolo: null };
      case "instagram":
        return vuota("non-verificabile", "Instagram non permette la verifica senza credenziali e non garantisce l'avvio automatico: controllare l'anteprima e inserire titolo e durata a mano.");
      case "video": {
        const r = await recuperaInfo({ piattaforma: "video", embedId: null, url: a.url, sorgente: a.sorgente });
        return { ...vuota(r.esito, r.esito === "ok" ? "File video raggiungibile. La durata viene letta dal player alla prima riproduzione (o inserita a mano)." : r.messaggio), titolo: r.titolo };
      }
    }
  } catch (e) {
    const m = e instanceof Error ? e.message : String(e);
    return vuota("non-verificabile", `Verifica non riuscita (${/abort/i.test(m) ? "tempo scaduto" : m}): riprovare.`);
  }
}

/* ── monitor ──────────────────────────────────────────────────────────────── */

export type MetaMonitor = {
  v: 1;
  stato: StatoMonitor;
  piattaforma: PiattaformaTalent;
  embedId: string | null;
  miniatura: string | null;
  protagonista: string | null;
  /** Pagina profilo ESISTENTE indicata dall'amministratore (mai inventata). */
  linkProtagonista: string | null;
  categorie: CategoriaTalent[];
  emergente: boolean;
  /** Da dove viene la durata: fonte ufficiale, inserita a mano, letta dal player. */
  durataDa: "fonte" | "manuale" | "player" | null;
  verifica: VerificaTalent | null;
  errori: number;
  ultimoErrore: { quando: number; messaggio: string } | null;
  attivatoIl: number | null;
};

type Riga = typeof schema.channelContenuti.$inferSelect;

export function leggiMetaMonitor(r: Riga): MetaMonitor {
  let m: Partial<MetaMonitor> = {};
  try {
    m = r.descrizione ? (JSON.parse(r.descrizione) as Partial<MetaMonitor>) : {};
  } catch {
    m = {};
  }
  const a = analizzaTalent(r.link ?? r.sorgente);
  const ok = "piattaforma" in a ? a : null;
  return {
    v: 1,
    stato: STATI_MONITOR.includes(m.stato as StatoMonitor) ? (m.stato as StatoMonitor) : "bozza",
    piattaforma: m.piattaforma ?? ok?.piattaforma ?? "video",
    embedId: m.embedId ?? ok?.embedId ?? null,
    miniatura: m.miniatura ?? null,
    protagonista: m.protagonista ?? null,
    linkProtagonista: m.linkProtagonista ?? null,
    categorie: Array.isArray(m.categorie) ? m.categorie.filter((c): c is CategoriaTalent => (CATEGORIE_TALENT as readonly string[]).includes(c)) : [],
    emergente: !!m.emergente,
    durataDa: m.durataDa ?? (r.durataSec ? "fonte" : null),
    verifica: m.verifica ?? null,
    errori: m.errori ?? 0,
    ultimoErrore: m.ultimoErrore ?? null,
    attivatoIl: m.attivatoIl ?? null,
  };
}
export const scriviMetaMonitor = (m: MetaMonitor) => JSON.stringify(m);

export type Monitor = Omit<MetaMonitor, "v"> & {
  id: number;
  titolo: string;
  url: string;
  sorgente: string;
  fonte: string | null;
  durataSec: number | null;
  ordine: number;
  creato: number;
  aggiornato: number;
  capacita: Capacita;
};

export function monitor(r: Riga): Monitor {
  const { v: _v, ...m } = leggiMetaMonitor(r);
  const c = CAPACITA[m.piattaforma];
  return {
    id: r.id,
    titolo: r.titolo,
    url: r.link ?? r.sorgente,
    sorgente: r.sorgente,
    fonte: r.attribuzione,
    durataSec: r.durataSec,
    ordine: r.ordine,
    creato: r.createdAt.getTime(),
    aggiornato: r.updatedAt.getTime(),
    capacita: { durata: !!r.durataSec, seek: c.seek, fine: c.fine, autoplay: c.autoplay },
    ...m,
  };
}

export async function righeTalent(): Promise<Riga[]> {
  return db
    .select()
    .from(schema.channelContenuti)
    .where(and(eq(schema.channelContenuti.ambiente, AMBIENTE), eq(schema.channelContenuti.channel, CANALE_TALENT)))
    .orderBy(asc(schema.channelContenuti.ordine), asc(schema.channelContenuti.id));
}
export async function monitorPerId(id: number): Promise<Riga | null> {
  const [r] = await db
    .select()
    .from(schema.channelContenuti)
    .where(and(eq(schema.channelContenuti.id, id), eq(schema.channelContenuti.ambiente, AMBIENTE), eq(schema.channelContenuti.channel, CANALE_TALENT)));
  return r ?? null;
}
export async function aggiornaMonitor(id: number, valori: Partial<typeof schema.channelContenuti.$inferInsert>) {
  await db
    .update(schema.channelContenuti)
    .set({ ...valori, updatedAt: new Date() })
    .where(and(eq(schema.channelContenuti.id, id), eq(schema.channelContenuti.ambiente, AMBIENTE), eq(schema.channelContenuti.channel, CANALE_TALENT)));
}
export async function eliminaMonitor(id: number) {
  await db
    .delete(schema.channelContenuti)
    .where(and(eq(schema.channelContenuti.id, id), eq(schema.channelContenuti.ambiente, AMBIENTE), eq(schema.channelContenuti.channel, CANALE_TALENT)));
}

export type DatiNuovoMonitor = {
  titolo?: string | null;
  miniatura?: string | null;
  protagonista?: string | null;
  linkProtagonista?: string | null;
  categorie?: CategoriaTalent[];
  emergente?: boolean;
  durataSec?: number | null;
  fonte?: string | null;
};

export type EsitoMonitor = {
  url: string;
  esito: "inserito" | "duplicato" | "non-valido" | "non-riproducibile";
  id?: number;
  titolo?: string;
  messaggio: string;
  stato?: StatoMonitor;
};

/** Crea UN monitor (bozza, o attivo se richiesto e la verifica lo consente). Doppioni e URL non riproducibili sono segnalati. */
export async function creaMonitor(grezzo: string, dati: DatiNuovoMonitor, attiva: boolean, righe: Riga[]): Promise<EsitoMonitor> {
  const a = analizzaTalent(grezzo);
  if ("errore" in a) return { url: grezzo, esito: "non-valido", messaggio: a.errore };
  const stesso = righe.find((r) => r.sorgente === a.sorgente);
  if (stesso) return { url: a.url, esito: "duplicato", id: stesso.id, titolo: stesso.titolo, messaggio: `Già presente come monitor «${stesso.titolo}»: non inserito di nuovo.` };
  const info = await infoTalent(a);
  const host = new URL(a.url).hostname.replace(/^www\./, "");
  const titolo = (dati.titolo?.trim() || info.titolo || `Senza titolo · ${host}`).slice(0, 300);
  const durata = dati.durataSec && dati.durataSec > 0 ? Math.round(dati.durataSec) : info.durataSec;
  const puoAttivare = attiva && info.esito !== "errore";
  const ora = Date.now();
  const meta: MetaMonitor = {
    v: 1,
    stato: puoAttivare ? "attivo" : "bozza",
    piattaforma: a.piattaforma,
    embedId: a.embedId,
    miniatura: dati.miniatura?.trim() || info.miniatura,
    protagonista: dati.protagonista?.trim() || null,
    linkProtagonista: dati.linkProtagonista?.trim() || null,
    categorie: [...new Set(dati.categorie ?? [])],
    emergente: !!dati.emergente,
    durataDa: dati.durataSec && dati.durataSec > 0 ? "manuale" : info.durataSec ? "fonte" : null,
    verifica: { quando: info.quando, esito: info.esito, messaggio: info.messaggio },
    errori: 0,
    ultimoErrore: null,
    attivatoIl: puoAttivare ? ora : null,
  };
  const ordine = righe.reduce((m, r) => Math.max(m, r.ordine + 1), 0);
  const [nuova] = await db
    .insert(schema.channelContenuti)
    .values({
      ambiente: AMBIENTE,
      channel: CANALE_TALENT,
      tipo: "video",
      titolo,
      descrizione: scriviMetaMonitor(meta),
      sorgente: a.sorgente,
      link: a.url,
      durataSec: durata ?? null,
      attribuzione: dati.fonte?.trim() || info.autore || host,
      origine: "manuale",
      fonte: FONTE,
      ordine,
      attivo: puoAttivare ? 1 : 0,
    })
    .onConflictDoNothing()
    .returning();
  if (!nuova) return { url: a.url, esito: "duplicato", messaggio: "Già presente come monitor." };
  righe.push(nuova);
  if (puoAttivare) await aggiungiAlPalinsesto(nuova.id);
  return {
    url: a.url,
    esito: attiva && info.esito === "errore" ? "non-riproducibile" : "inserito",
    id: nuova.id,
    titolo,
    stato: meta.stato,
    messaggio: attiva && info.esito === "errore" ? `Salvato in bozza, NON attivato: ${info.messaggio}` : `${puoAttivare ? "Attivato" : "Salvato in bozza"}. ${info.messaggio}`,
  };
}

/* ── impostazioni di priorità ─────────────────────────────────────────────── */

export type ImpostazioniTalent = {
  /** 0 = nessuna priorità; 1–5 = gli emergenti tendono a uscire prima nel giro. */
  pesoEmergenti: number;
  /** 0 = nessuna priorità; 1–5 = i nuovi caricamenti tendono a uscire prima (e a entrare presto nel giro in corso). */
  pesoNuovi: number;
  /** Per quanti giorni dall'attivazione un monitor conta come «nuovo». */
  giorniNuovo: number;
  /** Slot (secondi) per i monitor senza durata nota. */
  durataPredefinita: number;
  /** Pausa (secondi) fra un monitor e il successivo (tempo di caricamento del player). */
  stacco: number;
};
export const IMPOSTAZIONI_PREDEFINITE: ImpostazioniTalent = { pesoEmergenti: 2, pesoNuovi: 2, giorniNuovo: 14, durataPredefinita: 180, stacco: 2 };

export async function impostazioni(): Promise<ImpostazioniTalent> {
  const s = await leggiSetting<Partial<ImpostazioniTalent>>(CHIAVE_IMPOSTAZIONI);
  return { ...IMPOSTAZIONI_PREDEFINITE, ...(s ?? {}) };
}
export const salvaImpostazioni = (i: ImpostazioniTalent) => scriviSetting(CHIAVE_IMPOSTAZIONI, i);

/* ── palinsesto H24 memorizzato ───────────────────────────────────────────── */

export type Slot = { id: number; durata: number; stimata: boolean; protagonista: string | null };
export type Palinsesto = {
  v: 1;
  /** Numero del giro (cresce sempre; un giro = tutti i monitor attivi una volta). */
  giro: number;
  /** Istante (ms) in cui inizia ordine[0]. */
  avvio: number;
  ordine: Slot[];
  /** Monitor già andati in onda in questo giro (tolti dalla testa dell'ordine). */
  visti: number[];
  /** Ultimo monitor/protagonista del giro precedente: il nuovo giro non riparte da lì. */
  ultimo: { id: number; protagonista: string | null } | null;
  aggiornato: number;
};

function mulberry32(seme: number) {
  let a = seme >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function hash(...parti: (number | string)[]) {
  let h = 2166136261;
  for (const c of parti.join("|")) {
    h ^= c.charCodeAt(0);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

const protagonistaDi = (m: Monitor) => (m.protagonista ? m.protagonista.trim().toLowerCase() : null);

function peso(m: Monitor, imp: ImpostazioniTalent, ora: number) {
  const nuovo = (m.attivatoIl ?? m.creato) > ora - imp.giorniNuovo * 86_400_000;
  return 1 + (m.emergente ? imp.pesoEmergenti : 0) + (nuovo ? imp.pesoNuovi : 0);
}

const slotDi = (m: Monitor, imp: ImpostazioniTalent): Slot => ({
  id: m.id,
  durata: (m.durataSec && m.durataSec > 0 ? m.durataSec : imp.durataPredefinita) + imp.stacco,
  stimata: !(m.durataSec && m.durataSec > 0),
  protagonista: protagonistaDi(m),
});

/** Mai lo stesso protagonista di seguito quando esiste un'alternativa più avanti nell'ordine. */
function distanziaProtagonisti(s: Slot[], prima: Slot["protagonista"] = null, primoId: number | null = null) {
  for (let i = 0; i < s.length; i++) {
    const prec = i === 0 ? prima : s[i - 1]!.protagonista;
    const precId = i === 0 ? primoId : s[i - 1]!.id;
    const urta = (x: Slot) => (x.protagonista && x.protagonista === prec) || x.id === precId;
    if (!urta(s[i]!)) continue;
    const j = s.findIndex((x, k) => k > i && !urta(x));
    if (j > i) {
      const [x] = s.splice(j, 1);
      s.splice(i, 0, x!);
    }
  }
  // in coda al giro non c'è più nulla da anticipare: lo slot che urta si sposta più indietro, fra due vicini diversi
  const stesso = (a: Slot | null, b: Slot | null) => !!a && !!b && (a.id === b.id || (!!a.protagonista && a.protagonista === b.protagonista));
  const inizio: Slot | null = prima || primoId !== null ? { id: primoId ?? -1, durata: 0, stimata: false, protagonista: prima } : null;
  for (let i = s.length - 1; i > 0; i--) {
    if (!stesso(s[i - 1]!, s[i]!)) continue;
    const [x] = s.splice(i, 1);
    let k = -1;
    for (let c = i - 1; c >= 0; c--) {
      const sx = c === 0 ? inizio : s[c - 1]!;
      if (!stesso(sx, x!) && !stesso(s[c]!, x!)) {
        k = c;
        break;
      }
    }
    s.splice(k >= 0 ? k : i, 0, x!);
  }
  return s;
}

/** Giro nuovo: mescolamento pesato (Efraimidis–Spirakis) con seme deterministico. */
function nuovoGiro(attivi: Monitor[], imp: ImpostazioniTalent, giro: number, avvio: number, ultimo: Palinsesto["ultimo"]): Slot[] {
  const r = mulberry32(hash(giro, avvio, ...attivi.map((m) => m.id)));
  const ordinati = attivi
    .map((m) => ({ m, k: Math.pow(r() || 1e-9, 1 / peso(m, imp, avvio)) }))
    .sort((a, b) => b.k - a.k)
    .map((x) => slotDi(x.m, imp));
  return distanziaProtagonisti(ordinati, ultimo?.protagonista ?? null, ultimo?.id ?? null);
}

const totale = (s: Slot[]) => s.reduce((t, x) => t + x.durata * 1000, 0);

/** Posizione all'istante `ora`: indice dello slot e millisecondi trascorsi al suo interno; -1 = giro finito. */
function posizione(p: Palinsesto, ora: number) {
  let t = p.avvio;
  for (let i = 0; i < p.ordine.length; i++) {
    const fine = t + p.ordine[i]!.durata * 1000;
    if (ora < fine) return { i, inizio: t, fine, offset: Math.max(0, ora - t) };
    t = fine;
  }
  return { i: -1, inizio: t, fine: t, offset: 0 };
}

/** Taglia la parte già trasmessa: l'ordine riparte dallo slot in onda (stesso istante d'inizio). */
function ribasa(p: Palinsesto, ora: number) {
  const pos = posizione(p, ora);
  if (pos.i <= 0) return p;
  p.visti.push(...p.ordine.slice(0, pos.i).map((s) => s.id));
  p.ordine = p.ordine.slice(pos.i);
  p.avvio = pos.inizio;
  return p;
}

let coda: Promise<unknown> = Promise.resolve();
/** Le modifiche al palinsesto passano in fila (stesso processo): niente scritture sovrapposte. */
function inFila<T>(fn: () => Promise<T>): Promise<T> {
  const p = coda.then(fn, fn);
  coda = p.catch(() => undefined);
  return p;
}

async function attiviOra(): Promise<Monitor[]> {
  return (await righeTalent()).map(monitor).filter((m) => m.stato === "attivo");
}

/**
 * Palinsesto aggiornato all'istante `ora`: allinea l'ordine al catalogo (monitor spenti tolti, durate
 * aggiornate solo negli slot futuri), genera i giri successivi quando quello in corso è finito.
 * Se nessuno guarda per giorni, i giri trascorsi si saltano con l'aritmetica (stessa durata totale).
 */
export function palinsestoAggiornato(ora = Date.now()): Promise<{ p: Palinsesto | null; attivi: Monitor[] }> {
  return inFila(async () => {
    const [attivi, imp, salvato] = await Promise.all([attiviOra(), impostazioni(), leggiSetting<Palinsesto>(CHIAVE_PALINSESTO)]);
    if (!attivi.length) {
      if (salvato && salvato.ordine.length) await scriviSetting(CHIAVE_PALINSESTO, { ...salvato, ordine: [], visti: [], aggiornato: ora });
      return { p: null, attivi };
    }
    const perId = new Map(attivi.map((m) => [m.id, m]));
    let p: Palinsesto = salvato && salvato.v === 1 ? salvato : { v: 1, giro: 0, avvio: ora, ordine: [], visti: [], ultimo: null, aggiornato: ora };
    const prima = JSON.stringify(p);

    if (p.ordine.length && posizione(p, ora).i >= 0) {
      p = ribasa(p, ora);
      const pos = posizione(p, ora);
      const inOnda = pos.i === 0 ? p.ordine[0]! : null;
      if (inOnda && !perId.has(inOnda.id)) {
        // il monitor in onda è stato spento/eliminato: il successivo parte adesso
        p.visti.push(inOnda.id);
        p.ordine = p.ordine.slice(1);
        p.avvio = ora;
      }
      const futuroDa = inOnda && perId.has(inOnda.id) ? 1 : 0;
      p.ordine = p.ordine.filter((s, k) => k < futuroDa || perId.has(s.id)).map((s, k) => (k < futuroDa ? s : slotDi(perId.get(s.id)!, imp)));
      // monitor attivi che non sono né in onda né in coda né già visti in questo giro: entrano nella parte futura
      const presenti = new Set([...p.ordine.map((s) => s.id), ...p.visti]);
      const mancanti = attivi.filter((m) => !presenti.has(m.id));
      if (mancanti.length) p.ordine = inserisciNelFuturo(p.ordine, futuroDa, mancanti, imp, p.giro);
    }

    const pos = posizione(p, ora);
    if (pos.i === -1 || !p.ordine.length) {
      // giro finito (o primo avvio): si rimescola tutto il catalogo attivo
      const fineGiro = p.ordine.length ? pos.fine : ora;
      const ultimoSlot = p.ordine[p.ordine.length - 1];
      let ultimo = ultimoSlot ? { id: ultimoSlot.id, protagonista: ultimoSlot.protagonista } : p.ultimo;
      let giro = p.giro + 1;
      let avvio = fineGiro;
      let ordine = nuovoGiro(attivi, imp, giro, avvio, ultimo);
      const durata = totale(ordine);
      if (ora >= avvio + durata) {
        const saltati = Math.floor((ora - avvio) / durata);
        giro += saltati;
        avvio += saltati * durata;
        const salto = ordine[ordine.length - 1];
        ultimo = salto ? { id: salto.id, protagonista: salto.protagonista } : null;
        ordine = nuovoGiro(attivi, imp, giro, avvio, ultimo);
        // il totale non cambia (stessi monitor, stesse durate): la posizione resta valida
      }
      p = ribasa({ v: 1, giro, avvio, ordine, visti: [], ultimo, aggiornato: ora }, ora);
    }
    if (JSON.stringify(p) !== prima) {
      p.aggiornato = ora;
      await scriviSetting(CHIAVE_PALINSESTO, p);
    }
    return { p, attivi };
  });
}

/** Nuovi monitor nel giro in corso, dopo quello in onda: posizione casuale (più vicina se «nuovo» ha priorità), protagonisti distanziati. */
function inserisciNelFuturo(ordine: Slot[], da: number, nuovi: Monitor[], imp: ImpostazioniTalent, giro: number): Slot[] {
  const s = [...ordine];
  for (const m of nuovi) {
    const r = mulberry32(hash("ins", giro, m.id));
    const spazio = s.length - da + 1;
    const anticipo = 1 + imp.pesoNuovi + (m.emergente ? imp.pesoEmergenti : 0);
    let k = da + Math.floor(Math.pow(r(), anticipo) * spazio);
    const slot = slotDi(m, imp);
    const urta = (i: number) => (i - 1 >= 0 && slot.protagonista && s[i - 1]?.protagonista === slot.protagonista) || (slot.protagonista && s[i]?.protagonista === slot.protagonista);
    for (let t = 0; t < spazio && urta(k); t++) k = da + ((k - da + 1) % spazio);
    s.splice(k, 0, slot);
  }
  // più nuovi dello stesso protagonista attivati insieme: si ridistanzia la sola parte futura
  const prec = da > 0 ? s[da - 1]! : null;
  return [...s.slice(0, da), ...distanziaProtagonisti(s.slice(da), prec?.protagonista ?? null, prec?.id ?? null)];
}

/** Un monitor appena attivato entra subito nella parte futura del giro (nessuna interruzione). */
export const aggiungiAlPalinsesto = async (_id: number) => {
  await palinsestoAggiornato();
};

/** Rimescola da adesso (solo su richiesta esplicita dal pannello): il monitor in onda viene interrotto. */
export function rigeneraPalinsesto(ora = Date.now()) {
  return inFila(async () => {
    const salvato = await leggiSetting<Palinsesto>(CHIAVE_PALINSESTO);
    const ultimoSlot = salvato ? posizione(salvato, ora) : null;
    const inOnda = salvato && ultimoSlot && ultimoSlot.i >= 0 ? salvato.ordine[ultimoSlot.i] : null;
    await scriviSetting(CHIAVE_PALINSESTO, {
      v: 1,
      giro: salvato?.giro ?? 0,
      avvio: ora,
      ordine: [],
      visti: [],
      ultimo: inOnda ? { id: inOnda.id, protagonista: inOnda.protagonista } : null,
      aggiornato: ora,
    } satisfies Palinsesto);
  }).then(() => palinsestoAggiornato(ora));
}

export function statoOnda(p: Palinsesto, ora: number, quanti = 8) {
  const pos = posizione(p, ora);
  if (pos.i < 0) return null;
  const seguenti: { slot: Slot; inizio: number }[] = [];
  let t = pos.fine;
  for (const s of p.ordine.slice(pos.i + 1, pos.i + 1 + quanti)) {
    seguenti.push({ slot: s, inizio: t });
    t += s.durata * 1000;
  }
  return { slot: p.ordine[pos.i]!, inizio: pos.inizio, fine: pos.fine, offset: pos.offset, seguenti, fineGiro: p.avvio + totale(p.ordine), restanti: p.ordine.length - pos.i - 1 };
}

/* ── registro degli errori ────────────────────────────────────────────────── */

export type ErroreTalent = { quando: number; id: number; titolo: string; codice: string; messaggio: string; esito: string };
export async function registroErroriTalent(): Promise<ErroreTalent[]> {
  return (await leggiSetting<ErroreTalent[]>(CHIAVE_ERRORI)) ?? [];
}
export async function aggiungiErroreTalent(e: ErroreTalent) {
  const lista = await registroErroriTalent();
  lista.unshift(e);
  await scriviSetting(CHIAVE_ERRORI, lista.slice(0, 200));
}
export const svuotaErroriTalent = () => scriviSetting(CHIAVE_ERRORI, []);
export const leggiPalinsestoSalvato = () => leggiSetting<Palinsesto>(CHIAVE_PALINSESTO);
