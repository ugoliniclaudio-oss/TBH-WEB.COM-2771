import { z } from "zod";
import { ORPCError } from "@orpc/server";
import { eq } from "drizzle-orm";
import { base } from "../__core/app";
import { db } from "../database";
import * as schema from "../database/schema";
import { creaCopia } from "../lib/copie-sicurezza";
import {
  CATEGORIE_SOCIAL,
  ID_CATEGORIE,
  ID_PIATTAFORME,
  PIATTAFORME_SOCIAL,
  SOCIAL_BASE,
  STATI_SOCIAL,
  TIPI_SOCIAL,
  type PiattaformaSocial,
  type TipoSocial,
  type VoceSocial,
} from "../data/touch-social";

/**
 * TOUCH SOCIAL — directory interattiva dei profili ufficiali (09/11/2026).
 *
 * Base: `data/touch-social.ts` (dati consegnati, mai riscritti dal pannello).
 * Pannello: `settings` → `cms_v1:social` (modifiche alle voci base, voci aggiunte, verifiche dei link,
 * dati pubblici letti con Open Graph) e `cms_v1:social_clic` (solo conteggi aggregati, nessun dato personale).
 *
 * Regole: nessun follow simulato, nessun accesso con credenziali, nessuno scraping vietato. I link si
 * controllano con una sola richiesta pubblica; se la piattaforma blocca i robot (Instagram, Facebook) il
 * link resta com'è e risulta «non verificabile dal server». Un link rotto si SEGNALA e si toglie dalla
 * pagina pubblica finché non lo si corregge: non si cancella mai in automatico.
 */

const K = { archivio: "cms_v1:social", clic: "cms_v1:social_clic" } as const;
const GIORNO = 24 * 60 * 60 * 1000;
const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36";

const CODICE = () => (process.env.TBH_CODICE_ALLESTIMENTO ?? "").trim();
function controlla(codice: string) {
  const atteso = CODICE();
  if (!atteso) throw new ORPCError("SERVICE_UNAVAILABLE", { message: "Codice di allestimento non configurato sul server." });
  if (codice.trim() !== atteso) throw new ORPCError("UNAUTHORIZED", { message: "Codice di allestimento errato." });
}

/* ── archivio ─────────────────────────────────────────────────────────────── */

const ESITI = ["ok", "non-trovato", "non-verificabile", "errore"] as const;
type Esito = (typeof ESITI)[number];
type Verifica = { url: string; quando: number; esito: Esito; http: number | null; messaggio: string };
type MetaPubblici = {
  url: string;
  quando: number;
  titolo: string | null;
  descrizione: string | null;
  immagine: string | null;
  sito: string | null;
  /** YouTube: id del canale letto dal feed RSS pubblico, serve all'anteprima con il player ufficiale */
  canaleYouTube: string | null;
};
type Modifica = Partial<Omit<VoceSocial, "id" | "fonte">> & { aggiornato?: number };
type Archivio = {
  v: 1;
  modifiche: Record<string, Modifica>;
  extra: VoceSocial[];
  verifiche: Record<string, Verifica>;
  meta: Record<string, MetaPubblici>;
  ultimoGiro: number | null;
};
type Clic = { voci: Record<string, Record<string, number>>; giorni: Record<string, number> };

async function leggi<T>(chiave: string): Promise<T | null> {
  const [r] = await db.select().from(schema.settings).where(eq(schema.settings.key, chiave));
  if (!r) return null;
  try {
    return JSON.parse(r.value) as T;
  } catch {
    return null;
  }
}
async function scrivi(chiave: string, valore: unknown) {
  const value = JSON.stringify(valore);
  await db.insert(schema.settings).values({ key: chiave, value }).onConflictDoUpdate({ target: schema.settings.key, set: { value } });
}
async function archivio(): Promise<Archivio> {
  const a = await leggi<Partial<Archivio>>(K.archivio);
  return {
    v: 1,
    modifiche: a?.modifiche ?? {},
    extra: Array.isArray(a?.extra) ? a.extra : [],
    verifiche: a?.verifiche ?? {},
    meta: a?.meta ?? {},
    ultimoGiro: a?.ultimoGiro ?? null,
  };
}
/** Le scritture passano in fila: due salvataggi ravvicinati non si sovrascrivono. */
let fila: Promise<unknown> = Promise.resolve();
function inFila<T>(fn: () => Promise<T>): Promise<T> {
  const p = fila.then(fn, fn);
  fila = p.catch(() => null);
  return p;
}
const aggiorna = (fn: (a: Archivio) => void | Promise<void>) =>
  inFila(async () => {
    const a = await archivio();
    await fn(a);
    await scrivi(K.archivio, a);
    return a;
  });

const ID_BASE = new Set(SOCIAL_BASE.map((v) => v.id));

function unite(a: Archivio): VoceSocial[] {
  const base = SOCIAL_BASE.map((b) => {
    const m = a.modifiche[b.id];
    if (!m) return b;
    const { aggiornato: _x, ...campi } = m;
    return { ...b, ...campi, id: b.id, fonte: b.fonte };
  });
  return [...base, ...a.extra];
}

/* ── URL e piattaforme ────────────────────────────────────────────────────── */

function normalizza(url: string) {
  try {
    const u = new URL(url);
    const host = u.hostname.toLowerCase().replace(/^(www|m|mobile)\./, "");
    const list = u.searchParams.get("list");
    return `${host}${u.pathname.replace(/\/+$/, "").toLowerCase()}${list ? `?list=${list}` : ""}`;
  } catch {
    return url.trim().toLowerCase();
  }
}

function riconosci(url: string): { piattaforma: PiattaformaSocial; tipo: TipoSocial; handle: string | null } {
  const u = new URL(url);
  const h = u.hostname.toLowerCase().replace(/^(www|m|mobile)\./, "");
  const seg = u.pathname.split("/").filter(Boolean);
  const primo = seg[0] ?? "";
  const at = primo.startsWith("@") ? primo : null;
  const conChiocciola = primo && !["share", "p", "groups", "channel", "c", "user", "in", "company", "playlist", "watch"].includes(primo) ? `@${primo.replace(/^@/, "")}` : null;
  const fine = (h: string, d: string) => h === d || h.endsWith(`.${d}`);
  if (fine(h, "youtube.com") || h === "youtu.be")
    return { piattaforma: "youtube", tipo: u.searchParams.get("list") ? "playlist" : "canale", handle: at };
  if (fine(h, "facebook.com") || h === "fb.com" || h === "fb.me")
    return { piattaforma: "facebook", tipo: primo === "groups" ? "gruppo" : primo === "share" ? "profilo" : "pagina", handle: null };
  if (fine(h, "instagram.com")) return { piattaforma: "instagram", tipo: "profilo", handle: conChiocciola };
  if (fine(h, "tiktok.com")) return { piattaforma: "tiktok", tipo: "profilo", handle: at };
  if (h === "x.com" || h === "twitter.com") return { piattaforma: "x", tipo: "profilo", handle: conChiocciola };
  if (fine(h, "linkedin.com")) return { piattaforma: "linkedin", tipo: primo === "company" ? "pagina" : "profilo", handle: null };
  if (h === "ok.ru") return { piattaforma: "okru", tipo: primo === "group" ? "gruppo" : "profilo", handle: null };
  if (h === "vk.com" || h === "vk.ru") return { piattaforma: "vk", tipo: "profilo", handle: conChiocciola };
  if (/(^|\.)pinterest\.[a-z.]+$/.test(h) || h === "pin.it") return { piattaforma: "pinterest", tipo: "profilo", handle: conChiocciola };
  if (/(^|\.)bigo\.(tv|live)$/.test(h)) return { piattaforma: "bigo", tipo: "diretta", handle: null };
  if (h.includes("toptop")) return { piattaforma: "toptop", tipo: "profilo", handle: null };
  if (fine(h, "bump.app")) return { piattaforma: "bump", tipo: "profilo", handle: null };
  if (h === "chat.whatsapp.com") return { piattaforma: "whatsapp", tipo: "gruppo", handle: null };
  if (h === "wa.me" || fine(h, "whatsapp.com")) return { piattaforma: "whatsapp", tipo: primo === "channel" ? "canale" : "contatto", handle: null };
  if (h === "t.me" || h === "telegram.me")
    return { piattaforma: "telegram", tipo: primo.startsWith("+") || primo === "joinchat" ? "gruppo" : "canale", handle: null };
  if (fine(h, "twitch.tv")) return { piattaforma: "twitch", tipo: "canale", handle: conChiocciola };
  if (h === "discord.gg" || fine(h, "discord.com")) return { piattaforma: "discord", tipo: "gruppo", handle: null };
  if (fine(h, "spotify.com")) return { piattaforma: "spotify", tipo: primo === "playlist" ? "playlist" : "profilo", handle: null };
  if (fine(h, "music.apple.com")) return { piattaforma: "apple-music", tipo: "profilo", handle: null };
  if (fine(h, "suno.com")) return { piattaforma: "suno", tipo: "profilo", handle: at };
  if (fine(h, "behance.net")) return { piattaforma: "behance", tipo: "profilo", handle: null };
  return { piattaforma: "altro", tipo: "profilo", handle: null };
}

/** Anteprima con i player/plugin UFFICIALI delle piattaforme, solo dove li offrono. */
function embed(v: VoceSocial, m: MetaPubblici | undefined): string | null {
  if (!v.url) return null;
  let u: URL;
  try {
    u = new URL(v.url);
  } catch {
    return null;
  }
  const h = u.hostname.replace(/^(www|m)\./, "");
  if (v.piattaforma === "youtube") {
    const list = u.searchParams.get("list");
    if (list) return `https://www.youtube-nocookie.com/embed/videoseries?list=${encodeURIComponent(list)}`;
    const id = m?.url === v.url ? m.canaleYouTube : null;
    if (id && /^UC[\w-]{22}$/.test(id)) return `https://www.youtube-nocookie.com/embed/videoseries?list=UU${id.slice(2)}`;
    return null;
  }
  if (v.piattaforma === "facebook" && v.tipo === "pagina" && h === "facebook.com" && !u.pathname.startsWith("/share/"))
    return `https://www.facebook.com/plugins/page.php?href=${encodeURIComponent(v.url)}&tabs=timeline&width=500&height=600&small_header=true&adapt_container_width=true&hide_cover=false`;
  if (v.piattaforma === "spotify" && h === "open.spotify.com") {
    const m2 = u.pathname.match(/^\/(?:intl-[a-z]+\/)?(artist|playlist|album|track|show)\/([A-Za-z0-9]+)/);
    if (m2) return `https://open.spotify.com/embed/${m2[1]}/${m2[2]}`;
  }
  if (v.piattaforma === "apple-music" && h === "music.apple.com") return `https://embed.music.apple.com${u.pathname}`;
  return null;
}

/* ── richieste pubbliche (una sola GET, nessun login) ─────────────────────── */

async function scarica(url: string, ms = 10_000) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), ms);
  try {
    return await fetch(url, {
      signal: ctrl.signal,
      redirect: "follow",
      headers: { "user-agent": UA, accept: "text/html,application/xhtml+xml,*/*;q=0.8", "accept-language": "it-IT,it;q=0.9,en;q=0.6" },
    });
  } finally {
    clearTimeout(t);
  }
}

const LOGIN = /\/login|\/checkpoint|accounts\/login|\/authwall|signin|consent\.(youtube|google)/i;

async function verificaUrl(url: string): Promise<Verifica> {
  const quando = Date.now();
  try {
    const r = await scarica(url);
    void r.body?.cancel().catch(() => null);
    const finale = r.url || url;
    if (r.status === 404 || r.status === 410)
      return { url, quando, esito: "non-trovato", http: r.status, messaggio: `La piattaforma risponde «pagina non trovata» (HTTP ${r.status}). Controllare o correggere l'indirizzo.` };
    if (r.ok && LOGIN.test(new URL(finale).pathname + new URL(finale).hostname) && !LOGIN.test(url))
      return { url, quando, esito: "non-verificabile", http: r.status, messaggio: "La piattaforma chiede l'accesso: il server non può controllare il profilo (il link resta valido per i visitatori)." };
    if (r.ok) return { url, quando, esito: "ok", http: r.status, messaggio: `Raggiungibile (HTTP ${r.status}).` };
    if ([400, 401, 403, 429, 999].includes(r.status))
      return { url, quando, esito: "non-verificabile", http: r.status, messaggio: `La piattaforma blocca i controlli automatici (HTTP ${r.status}): verificare aprendo il link nel browser.` };
    return { url, quando, esito: "errore", http: r.status, messaggio: `Risposta inattesa (HTTP ${r.status}).` };
  } catch {
    return { url, quando, esito: "errore", http: null, messaggio: "Indirizzo non raggiungibile in questo momento (tempo scaduto o rete)." };
  }
}

const ENTITA: Record<string, string> = { amp: "&", quot: '"', apos: "'", lt: "<", gt: ">", nbsp: " " };
const decodifica = (s: string) =>
  s
    .replace(/&#x([0-9a-f]+);/gi, (_, h: string) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d: string) => String.fromCodePoint(Number(d)))
    .replace(/&([a-z]+);/gi, (t, n: string) => ENTITA[n.toLowerCase()] ?? t)
    .trim();

function metaTag(html: string, nome: string): string | null {
  const re = new RegExp(`<meta[^>]+(?:property|name|itemprop)=["']${nome}["'][^>]*>`, "i");
  const tag = html.match(re)?.[0];
  const c = tag?.match(/content=["']([^"']*)["']/i)?.[1];
  return c ? decodifica(c) || null : null;
}

async function leggiMetadati(url: string): Promise<MetaPubblici & { verifica: Verifica }> {
  const quando = Date.now();
  const vuoto = { url, quando, titolo: null, descrizione: null, immagine: null, sito: null, canaleYouTube: null };
  try {
    const r = await scarica(url);
    const verifica = (() => {
      if (r.status === 404 || r.status === 410) return { url, quando, esito: "non-trovato" as const, http: r.status, messaggio: `Pagina non trovata (HTTP ${r.status}).` };
      if (!r.ok) return { url, quando, esito: "non-verificabile" as const, http: r.status, messaggio: `La piattaforma non consente la lettura automatica (HTTP ${r.status}).` };
      return { url, quando, esito: "ok" as const, http: r.status, messaggio: `Raggiungibile (HTTP ${r.status}).` };
    })();
    if (!r.ok) {
      void r.body?.cancel().catch(() => null);
      return { ...vuoto, verifica };
    }
    const html = (await r.text()).slice(0, 2_500_000); // YouTube mette i meta og: oltre gli 800 KB
    const titolo = metaTag(html, "og:title") ?? metaTag(html, "twitter:title") ?? (html.match(/<title[^>]*>([^<]{1,300})<\/title>/i)?.[1] ? decodifica(html.match(/<title[^>]*>([^<]{1,300})<\/title>/i)![1]!) : null);
    const immagine = metaTag(html, "og:image") ?? metaTag(html, "twitter:image");
    return {
      url,
      quando,
      titolo: titolo || null,
      descrizione: metaTag(html, "og:description") ?? metaTag(html, "description"),
      immagine: immagine && /^https:\/\//.test(immagine) ? immagine : null,
      sito: metaTag(html, "og:site_name"),
      canaleYouTube: html.match(/feeds\/videos\.xml\?channel_id=(UC[\w-]{22})/)?.[1] ?? metaTag(html, "channelId") ?? null,
      verifica,
    };
  } catch {
    return { ...vuoto, verifica: { url, quando, esito: "errore", http: null, messaggio: "Indirizzo non raggiungibile in questo momento." } };
  }
}

async function aGruppi<T, R>(elenco: T[], n: number, fn: (x: T) => Promise<R>): Promise<R[]> {
  const out: R[] = new Array(elenco.length);
  let i = 0;
  await Promise.all(
    Array.from({ length: Math.min(n, elenco.length) }, async () => {
      while (i < elenco.length) {
        const k = i++;
        out[k] = await fn(elenco[k]!);
      }
    }),
  );
  return out;
}

/** Giro di controllo periodico (al massimo una volta al giorno, avviato dalla prima visita): segnala, non cancella. */
let giroInCorso: Promise<number> | null = null;
function giroVerifica(ids?: string[]): Promise<number> {
  if (giroInCorso && !ids) return giroInCorso;
  const lavoro = (async () => {
    const a = await archivio();
    const voci = unite(a).filter((v) => v.url && (!ids || ids.includes(v.id)) && v.stato !== "nascosto");
    const esiti = await aGruppi(voci, 4, async (v) => [v.id, await verificaUrl(v.url!)] as const);
    await aggiorna((b) => {
      for (const [id, e] of esiti) b.verifiche[id] = e;
      if (!ids) b.ultimoGiro = Date.now();
    });
    return esiti.length;
  })();
  if (!ids) {
    giroInCorso = lavoro;
    void lavoro.finally(() => {
      giroInCorso = null;
    });
  }
  return lavoro;
}

/* ── vista pubblica ───────────────────────────────────────────────────────── */

/** Si pubblica solo ciò che è «pubblico», ha un indirizzo e non è risultato «non trovato» sull'indirizzo attuale. */
function pubblicabile(v: VoceSocial, a: Archivio) {
  if (v.stato !== "pubblico" || !v.url) return false;
  const ver = a.verifiche[v.id];
  return !(ver && ver.url === v.url && ver.esito === "non-trovato");
}

function pubblica(v: VoceSocial, a: Archivio) {
  const m = a.meta[v.id];
  const ver = a.verifiche[v.id];
  return {
    id: v.id,
    piattaforma: v.piattaforma,
    tipo: v.tipo,
    categoria: v.categoria,
    nome: v.nome,
    handle: v.handle,
    url: v.url!,
    descrizione: v.descrizione,
    logo: v.logo,
    immagine: v.immagine,
    persona: v.persona,
    channel: v.channel,
    pagine: v.pagine,
    evidenza: v.evidenza,
    campagna: v.campagna,
    ordine: v.ordine,
    embed: embed(v, m),
    verifica: ver && ver.url === v.url ? { esito: ver.esito, quando: ver.quando } : null,
  };
}
export type VoceSocialPubblica = ReturnType<typeof pubblica>;

const ordinate = (voci: VoceSocial[]) => {
  const pos = new Map<string, number>(ID_CATEGORIE.map((c, i) => [c, i]));
  return [...voci].sort((x, y) => (pos.get(x.categoria) ?? 99) - (pos.get(y.categoria) ?? 99) || x.ordine - y.ordine || x.nome.localeCompare(y.nome));
};

function avviaGiroSeServe(a: Archivio) {
  if (!a.ultimoGiro || Date.now() - a.ultimoGiro > GIORNO) void giroVerifica().catch(() => null);
}

const AZIONI = ["apri", "segui", "anteprima", "condividi", "copia", "qr", "preferito"] as const;

export const touchSocial = {
  elenco: base.handler(async () => {
    const a = await archivio();
    avviaGiroSeServe(a);
    const voci = ordinate(unite(a).filter((v) => pubblicabile(v, a))).map((v) => pubblica(v, a));
    return {
      voci,
      piattaforme: PIATTAFORME_SOCIAL.map((p) => ({ ...p })),
      categorie: CATEGORIE_SOCIAL.map((c) => ({ ...c })),
      tipi: [...TIPI_SOCIAL],
      ultimoControllo: a.ultimoGiro,
    };
  }),

  /** Le voci collegate a un Channel o a una pagina del sito: la stessa voce, mai copiata. */
  collegati: base
    .input(z.object({ channel: z.string().max(80).optional(), pagina: z.string().max(200).optional() }))
    .handler(async ({ input }) => {
      const a = await archivio();
      const voci = ordinate(
        unite(a).filter(
          (v) => pubblicabile(v, a) && ((input.channel && v.channel.includes(input.channel)) || (input.pagina && v.pagine.includes(input.pagina))),
        ),
      );
      return voci.map((v) => pubblica(v, a));
    }),

  registraClic: base
    .input(z.object({ id: z.string().min(1).max(80), azione: z.enum(AZIONI) }))
    .handler(async ({ input }) => {
      const a = await archivio();
      if (!unite(a).some((v) => v.id === input.id)) return { ok: false };
      await inFila(async () => {
        const c = (await leggi<Clic>(K.clic)) ?? { voci: {}, giorni: {} };
        const voce = (c.voci[input.id] ??= {});
        voce[input.azione] = (voce[input.azione] ?? 0) + 1;
        const g = new Date().toISOString().slice(0, 10);
        c.giorni[g] = (c.giorni[g] ?? 0) + 1;
        const giorni = Object.keys(c.giorni).sort();
        for (const vecchio of giorni.slice(0, Math.max(0, giorni.length - 120))) delete c.giorni[vecchio];
        await scrivi(K.clic, c);
      });
      return { ok: true };
    }),
};

/* ── pannello (codice di allestimento) ────────────────────────────────────── */

const URL_HTTPS = z
  .string()
  .trim()
  .max(600)
  .refine((s) => /^https:\/\/[^\s/]+\.[^\s]+$/i.test(s), "Indirizzo completo, con https://");
const CAMPI = z.object({
  piattaforma: z.enum(ID_PIATTAFORME),
  tipo: z.enum(TIPI_SOCIAL),
  categoria: z.enum(ID_CATEGORIE),
  nome: z.string().trim().min(2).max(160),
  handle: z.string().trim().max(120).nullable(),
  url: URL_HTTPS.nullable(),
  descrizione: z.string().trim().max(600).nullable(),
  logo: z.string().trim().max(600).nullable(),
  immagine: z.string().trim().max(1200).nullable(),
  persona: z.boolean(),
  channel: z.array(z.string().trim().min(1).max(80)).max(40),
  pagine: z.array(z.string().trim().regex(/^\/[^\s]*$/, "Percorso del sito, es. /contatti").max(200)).max(40),
  stato: z.enum(STATI_SOCIAL),
  evidenza: z.boolean(),
  campagna: z.string().trim().max(140).nullable(),
  nota: z.string().trim().max(600).nullable(),
});

function nonDuplicato(voci: VoceSocial[], url: string | null, id: string | null) {
  if (!url) return;
  const n = normalizza(url);
  const altro = voci.find((v) => v.id !== id && v.url && normalizza(v.url) === n);
  if (altro)
    throw new ORPCError("CONFLICT", {
      message: `Questo indirizzo c'è già: «${altro.nome}». Per mostrarlo in un'altra pagina basta collegarlo (Channel o pagine), senza duplicarlo.`,
    });
}

const nuovoId = (p: string) => `social-${p}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 5)}`;
const oggi = () => new Date().toLocaleDateString("it-IT", { timeZone: "Europe/Rome" });

export const touchSocialAdmin = {
  quadro: base.input(z.object({ codice: z.string() })).handler(async ({ input }) => {
    controlla(input.codice);
    const a = await archivio();
    const clic = (await leggi<Clic>(K.clic)) ?? { voci: {}, giorni: {} };
    const voci = ordinate(unite(a)).map((v) => ({
      ...v,
      base: ID_BASE.has(v.id),
      modificata: !!a.modifiche[v.id],
      inPagina: pubblicabile(v, a),
      embed: embed(v, a.meta[v.id]),
      verifica: a.verifiche[v.id] ?? null,
      meta: a.meta[v.id] ?? null,
      clic: clic.voci[v.id] ?? {},
    }));
    return {
      voci,
      piattaforme: PIATTAFORME_SOCIAL.map((p) => ({ ...p })),
      categorie: CATEGORIE_SOCIAL.map((c) => ({ ...c })),
      tipi: [...TIPI_SOCIAL],
      stati: [...STATI_SOCIAL],
      ultimoGiro: a.ultimoGiro,
      giorni: Object.entries(clic.giorni)
        .sort(([x], [y]) => x.localeCompare(y))
        .slice(-30)
        .map(([giorno, n]) => ({ giorno, n })),
    };
  }),

  salva: base
    .input(z.object({ codice: z.string(), id: z.string().max(80).nullable(), voce: CAMPI }))
    .handler(async ({ input }) => {
      controlla(input.codice);
      let id = input.id;
      await aggiorna((a) => {
        const voci = unite(a);
        nonDuplicato(voci, input.voce.url, id);
        const ora = Date.now();
        if (id && ID_BASE.has(id)) {
          a.modifiche[id] = { ...input.voce, aggiornato: ora };
          return;
        }
        const k = id ? a.extra.findIndex((v) => v.id === id) : -1;
        if (id && k < 0) throw new ORPCError("NOT_FOUND", { message: "Voce non trovata." });
        if (k >= 0) {
          a.extra[k] = { ...a.extra[k]!, ...input.voce };
          return;
        }
        id = nuovoId(input.voce.piattaforma);
        const ultimo = Math.max(0, ...voci.filter((v) => v.categoria === input.voce.categoria).map((v) => v.ordine));
        a.extra.push({ ...input.voce, id, ordine: ultimo + 10, fonte: `Aggiunto dal pannello il ${oggi()}` });
      });
      return { id };
    }),

  /** Voce base: si nasconde (resta in archivio). Voce aggiunta: si toglie, dopo la copia di sicurezza. */
  rimuovi: base.input(z.object({ codice: z.string(), id: z.string().max(80) })).handler(async ({ input }) => {
    controlla(input.codice);
    const copia = await creaCopia(`Automatica prima di togliere la voce social «${input.id}»`);
    let esito: "nascosta" | "rimossa" = "rimossa";
    await aggiorna((a) => {
      if (ID_BASE.has(input.id)) {
        a.modifiche[input.id] = { ...(a.modifiche[input.id] ?? {}), stato: "nascosto", aggiornato: Date.now() };
        esito = "nascosta";
        return;
      }
      const prima = a.extra.length;
      a.extra = a.extra.filter((v) => v.id !== input.id);
      if (a.extra.length === prima) throw new ORPCError("NOT_FOUND", { message: "Voce non trovata." });
      delete a.verifiche[input.id];
      delete a.meta[input.id];
    });
    return { esito, copia: copia.id };
  }),

  /** Voce base: torna ai dati consegnati (annulla le modifiche fatte dal pannello). */
  ripristina: base.input(z.object({ codice: z.string(), id: z.string().max(80) })).handler(async ({ input }) => {
    controlla(input.codice);
    if (!ID_BASE.has(input.id)) throw new ORPCError("BAD_REQUEST", { message: "Solo le voci della base si ripristinano." });
    await aggiorna((a) => {
      delete a.modifiche[input.id];
    });
    return { ok: true };
  }),

  /** Elenco di URL (uno per riga): ogni nuovo indirizzo entra «da verificare», con il nome letto dai dati pubblici. */
  importaUrl: base
    .input(z.object({ codice: z.string(), testo: z.string().max(40_000), categoria: z.enum(ID_CATEGORIE) }))
    .handler(async ({ input }) => {
      controlla(input.codice);
      const righe = [...new Set(input.testo.split(/[\s,;]+/).map((r) => r.trim()).filter(Boolean))].slice(0, 200);
      const a0 = await archivio();
      const presenti = new Map(unite(a0).filter((v) => v.url).map((v) => [normalizza(v.url!), v.nome]));
      const risultati: { url: string; esito: "aggiunto" | "duplicato" | "non-valido"; messaggio: string; id?: string }[] = [];
      const daLeggere: { url: string; ric: ReturnType<typeof riconosci> }[] = [];
      for (const r of righe) {
        const grezzo = /^https?:\/\//i.test(r) ? r.replace(/^http:/i, "https:") : `https://${r}`;
        let u: URL;
        try {
          u = new URL(grezzo);
          if (!u.hostname.includes(".")) throw new Error();
        } catch {
          risultati.push({ url: r, esito: "non-valido", messaggio: "Non è un indirizzo web." });
          continue;
        }
        u.hash = "";
        const url = u.toString();
        const n = normalizza(url);
        if (presenti.has(n)) {
          risultati.push({ url, esito: "duplicato", messaggio: `Già presente: «${presenti.get(n)}».` });
          continue;
        }
        presenti.set(n, url);
        daLeggere.push({ url, ric: riconosci(url) });
      }
      const letti = await aGruppi(daLeggere, 4, async (x) => ({ ...x, meta: await leggiMetadati(x.url) }));
      const nuove: { voce: VoceSocial; meta: MetaPubblici; verifica: Verifica }[] = letti.map(({ url, ric, meta }) => {
        const { verifica, ...m } = meta;
        const u = new URL(url);
        const nome = m.titolo?.slice(0, 160) || ric.handle || `${u.hostname.replace(/^www\./, "")}${u.pathname.replace(/\/+$/, "")}`.slice(0, 160);
        return {
          voce: {
            id: nuovoId(ric.piattaforma),
            piattaforma: ric.piattaforma,
            tipo: ric.tipo,
            categoria: input.categoria,
            nome,
            handle: ric.handle,
            url,
            descrizione: m.descrizione?.slice(0, 600) ?? null,
            logo: null,
            immagine: null,
            persona: false,
            channel: [],
            pagine: [],
            stato: "da-verificare",
            evidenza: false,
            campagna: null,
            ordine: 0,
            fonte: `Importato dal pannello il ${oggi()}`,
            nota: m.titolo ? "Nome letto dai dati pubblici della pagina: controllarlo prima di pubblicare." : "Nome provvisorio ricavato dall'indirizzo: scrivere il nome per esteso prima di pubblicare.",
          },
          meta: m,
          verifica,
        };
      });
      if (nuove.length)
        await aggiorna((a) => {
          let ultimo = Math.max(0, ...unite(a).filter((v) => v.categoria === input.categoria).map((v) => v.ordine));
          for (const n of nuove) {
            if (unite(a).some((v) => v.url && normalizza(v.url) === normalizza(n.voce.url!))) continue;
            a.extra.push({ ...n.voce, ordine: (ultimo += 10) });
            a.meta[n.voce.id] = n.meta;
            a.verifiche[n.voce.id] = n.verifica;
            risultati.push({ url: n.voce.url!, esito: "aggiunto", id: n.voce.id, messaggio: `${n.voce.nome} · ${n.verifica.messaggio}` });
          }
        });
      return { risultati };
    }),

  /** Legge i dati pubblici (Open Graph) di un indirizzo incollato. Non salva nulla se non si indica la voce. */
  metadati: base
    .input(z.object({ codice: z.string(), url: URL_HTTPS, id: z.string().max(80).nullable() }))
    .handler(async ({ input }) => {
      controlla(input.codice);
      const { verifica, ...meta } = await leggiMetadati(input.url);
      if (input.id) {
        const id = input.id;
        await aggiorna((a) => {
          if (!unite(a).some((v) => v.id === id)) return;
          a.meta[id] = meta;
          a.verifiche[id] = verifica;
        });
      }
      return { ...meta, riconosciuto: riconosci(input.url), verifica };
    }),

  verificaLink: base
    .input(z.object({ codice: z.string(), ids: z.array(z.string().max(80)).max(300).optional() }))
    .handler(async ({ input }) => {
      controlla(input.codice);
      const n = await giroVerifica(input.ids);
      return { controllati: n };
    }),

  ordina: base
    .input(z.object({ codice: z.string(), ids: z.array(z.string().max(80)).min(1).max(500) }))
    .handler(async ({ input }) => {
      controlla(input.codice);
      await aggiorna((a) => {
        input.ids.forEach((id, i) => {
          const ordine = (i + 1) * 10;
          if (ID_BASE.has(id)) a.modifiche[id] = { ...(a.modifiche[id] ?? {}), ordine, aggiornato: Date.now() };
          else {
            const v = a.extra.find((x) => x.id === id);
            if (v) v.ordine = ordine;
          }
        });
      });
      return { ok: true };
    }),
};
