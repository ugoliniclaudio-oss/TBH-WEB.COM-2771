import { inArray } from "drizzle-orm";
import { db } from "../database";
import * as schema from "../database/schema";
import { CAROSELLI_VISIBILI } from "../data/channel-home";
import { PALINSESTO_DM } from "../data/tbh";
import { PUNTATE_DM } from "../data/dm-puntate";
import { DM_RADIO } from "../data/radio";
import { MISS_COOL } from "../data/miss-cool";
import { ANNUNCI_TBH, scaduto } from "../../web/lib/bacheca-annunci";
import { vetrinaTouchPlaza } from "./catalogo-touch-plaza";
import { dataRoma, giornoDopo, giornoSettimana, istanteRoma } from "./radio-palinsesto";
import { vociPubbliche, type VocePubblica } from "./cms";

/**
 * I 4 CAROSELLI DI CANALE 0 — contenuti reali in ordine casuale del giorno
 * (Claudio, 18/10/2026: «crea caroselli tu a random tanto da verificare i passaggi giornalieri
 * direttamente da questi banner»). Configurazione ufficiale dei 4 caroselli dello stesso giorno:
 *
 *  1 · TOUCH PLAZA — articoli in vetrina con Payment Link Stripe e prezzo > 0 (il corso
 *      antincendio a 0 € resta fuori: «Acquista» su un articolo gratuito sarebbe ambiguo).
 *      I corsi a pagamento stanno SOLO qui (regola «nessun duplicato»).
 *  2 · PALINSESTO DM — prossime dirette dal palinsesto ufficiale (giorno e ora confermati),
 *      ultima puntata di ogni programma (replica) e ultimi video del feed YouTube ufficiale
 *      di DM. Partite del Rimini escluse (ordine del 29/08). Nessuna partita futura: DM non
 *      pubblica un calendario ufficiale.
 *  3 · TBH LAVORO, CORSI E CASTING — annunci TBH non scaduti (scheda → candidatura),
 *      casting aperti dell'archivio, Touch Miss Cool Web (→ adesione).
 *  4 · CERCO LAVORO IN HOTEL — IN ALLESTIMENTO: manca l'autorizzazione scritta di
 *      Federalberghi Riccione al riuso degli annunci.
 *
 * «Random» = ordine mescolato con un seme fisso per giorno e carosello: tutti vedono lo stesso
 * ordine nella stessa giornata (i conteggi del giorno restano confrontabili), il giorno dopo
 * cambia. Nessuna scheda inventata, nessuna immagine inventata.
 */

export type SchedaViva = {
  /** Identificativo stabile della scheda: è la chiave dei contatori. */
  id: string;
  titolo: string;
  sottotitolo: string | null;
  /** Riga breve in evidenza (prezzo, data e ora, stato). */
  etichetta: string | null;
  immagine: string | null;
  link: string;
  esterno: boolean;
  pulsante: string;
};

export type CaroselloVivo = {
  slug: string;
  titolo: string;
  stato: "attivo" | "in-allestimento";
  nota: string | null;
  /** Colore d'accento: giallo TBH, rosso solo per DM. */
  accento: "giallo" | "rosso-dm";
  schede: SchedaViva[];
};

/* ── ordine casuale del giorno ─────────────────────────────────────────── */

function seme(testo: string) {
  let h = 2166136261;
  for (let i = 0; i < testo.length; i++) {
    h ^= testo.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mescola<T>(lista: T[], chiave: string): T[] {
  let s = seme(chiave) || 1;
  const casuale = () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const a = [...lista];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(casuale() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}

/* ── 1 · TOUCH PLAZA ───────────────────────────────────────────────────── */

/** Ricorrenza verificata sul Payment Link Stripe il 18/10/2026 (il listino non la riporta). */
const RICORRENZA: Record<string, string> = { "tbh-fidelity-partita-iva": "/anno" };

const euro = (cent: number) =>
  `${(cent / 100).toLocaleString("it-IT", { minimumFractionDigits: cent % 100 ? 2 : 0, maximumFractionDigits: 2 })} €`;

async function schedeTouchPlaza(): Promise<SchedaViva[]> {
  const vetrina = await vetrinaTouchPlaza();
  return vetrina
    .filter((p) => !!p.checkout?.stripe && p.priceCents > 0)
    .map((p) => ({
      id: `plaza:${p.slug}`,
      titolo: p.title,
      sottotitolo: p.category,
      etichetta: `${euro(p.priceCents)}${RICORRENZA[p.slug] ?? ""}`,
      immagine: p.image,
      link: p.checkout!.stripe!,
      esterno: true,
      pulsante: "ACQUISTA",
    }));
}

/* ── 2 · PALINSESTO DM ─────────────────────────────────────────────────── */

const GIORNI_BREVI = ["", "LUN", "MAR", "MER", "GIO", "VEN", "SAB", "DOM"];
const dataBreve = (d: string) => `${d.slice(8, 10)}/${d.slice(5, 7)}`;
const ESCLUSI_DM = /rimini/i;

type VideoFeed = { id: string; titolo: string; pubblicato: string };
let cacheFeed: { quando: number; video: VideoFeed[] } | null = null;

/** Feed YouTube ufficiale di DM (ultimi 15 video). Lettura al massimo ogni ora; errore = nessun video dal feed. */
async function feedDm(): Promise<VideoFeed[]> {
  if (cacheFeed && Date.now() - cacheFeed.quando < 60 * 60_000) return cacheFeed.video;
  try {
    const r = await fetch(`https://www.youtube.com/feeds/videos.xml?channel_id=${DM_RADIO.canaleId}`, {
      signal: AbortSignal.timeout(8000),
    });
    if (!r.ok) throw new Error(String(r.status));
    const xml = await r.text();
    const video: VideoFeed[] = [];
    for (const e of xml.split("<entry>").slice(1)) {
      const id = /<yt:videoId>([^<]+)<\/yt:videoId>/.exec(e)?.[1];
      const titolo = /<title>([^<]*)<\/title>/.exec(e)?.[1];
      const pubblicato = /<published>([^<]+)<\/published>/.exec(e)?.[1];
      if (id && titolo && pubblicato) video.push({ id, titolo: decodifica(titolo), pubblicato });
    }
    cacheFeed = { quando: Date.now(), video };
    return video;
  } catch {
    // Nuovo tentativo dopo 10 minuti; nel frattempo resta l'ultima lettura riuscita.
    cacheFeed = { quando: Date.now() - 50 * 60_000, video: cacheFeed?.video ?? [] };
    return cacheFeed.video;
  }
}

function decodifica(s: string) {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

const norm = (t: string) => t.toLowerCase().replace(/[^a-z0-9]/g, "");

/** Puntata più recente di un programma DM: feed ufficiale o archivio, vince la data più recente. */
function ultimaPuntata(
  nome: string,
  archivio: { videoId: string; titolo: string; pubblicata?: string | null } | undefined,
  feed: VideoFeed[],
): { videoId: string; titolo: string; pubblicata: string | null } | null {
  const chiave = norm(nome);
  const trovati = feed.filter((v) => norm(v.titolo).startsWith(chiave) && /puntata/i.test(v.titolo));
  // A parità di data preferisce la versione senza emoji (quella con 📱 è il formato verticale).
  const recente = trovati.length ? Math.max(...trovati.map((v) => Date.parse(v.pubblicato))) : 0;
  const pari = trovati.filter((v) => Date.parse(v.pubblicato) === recente);
  const daFeed = pari.find((v) => !/\p{Extended_Pictographic}/u.test(v.titolo)) ?? pari[0];
  const dataArchivio = archivio?.pubblicata ? Date.parse(archivio.pubblicata) : 0;
  if (daFeed && recente >= dataArchivio) return { videoId: daFeed.id, titolo: daFeed.titolo, pubblicata: daFeed.pubblicato };
  return archivio ? { videoId: archivio.videoId, titolo: archivio.titolo, pubblicata: archivio.pubblicata ?? null } : null;
}

async function schedeDm(adesso: number): Promise<SchedaViva[]> {
  const oggi = dataRoma(adesso);
  const schede: SchedaViva[] = [];
  const usati = new Set<string>();

  // Prossima diretta di ogni programma del palinsesto ufficiale.
  for (const p of PALINSESTO_DM) {
    if (!p.giorno || !p.ora) continue;
    for (let i = 0; i < 8; i++) {
      const d = giornoDopo(oggi, i);
      if (giornoSettimana(d) !== p.giorno) continue;
      const inizio = istanteRoma(d, p.ora);
      const fine = inizio + p.durataMin * 60_000;
      if (fine <= adesso) continue;
      const ora = inizio <= adesso;
      schede.push({
        id: `dm-diretta:${p.slug}`,
        titolo: p.name,
        sottotitolo: "DM Comunicazione · palinsesto ufficiale",
        etichetta: ora ? `IN DIRETTA ORA · fino alle ${new Date(fine).toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit", timeZone: "Europe/Rome" })}` : `DIRETTA · ${GIORNI_BREVI[p.giorno]} ${dataBreve(d)} · ${p.ora}`,
        immagine: null,
        link: `/dm/programmi?p=${p.slug}`,
        esterno: false,
        pulsante: ora ? "GUARDA LA DIRETTA" : "APRI PROGRAMMA",
      });
      break;
    }
  }

  // Ultima puntata di ogni programma (replica): la più recente tra il feed ufficiale
  // (titolo che inizia col nome del programma e contiene «puntata») e l'archivio PUNTATE_DM.
  const feed = await feedDm();
  for (const p of PALINSESTO_DM) {
    const u = ultimaPuntata(p.name, PUNTATE_DM[p.slug]?.[0], feed);
    if (!u || ESCLUSI_DM.test(u.titolo)) continue;
    usati.add(u.videoId);
    schede.push({
      id: `dm-replica:${u.videoId}`,
      titolo: u.titolo,
      sottotitolo: p.name,
      etichetta: u.pubblicata ? `REPLICA · pubblicata il ${dataBreve(dataRoma(Date.parse(u.pubblicata)))}` : "REPLICA · ultima puntata",
      immagine: `https://i.ytimg.com/vi/${u.videoId}/hqdefault.jpg`,
      link: `https://www.youtube.com/watch?v=${u.videoId}`,
      esterno: true,
      pulsante: "GUARDA",
    });
  }

  // Ultimi video del feed ufficiale (highlights, interviste, servizi), senza doppioni e senza Rimini.
  for (const v of feed.slice(0, 15)) {
    if (usati.has(v.id) || ESCLUSI_DM.test(v.titolo)) continue;
    usati.add(v.id);
    const d = dataRoma(Date.parse(v.pubblicato));
    schede.push({
      id: `dm-video:${v.id}`,
      titolo: v.titolo,
      sottotitolo: "Daniele Manuelli — DM Comunicazione",
      etichetta: `PUBBLICATO IL ${dataBreve(d)}/${d.slice(0, 4)}`,
      immagine: `https://i.ytimg.com/vi/${v.id}/hqdefault.jpg`,
      link: `https://www.youtube.com/watch?v=${v.id}`,
      esterno: true,
      pulsante: "GUARDA",
    });
  }
  return schede;
}

/* ── 3 · TBH LAVORO, CORSI E CASTING ───────────────────────────────────── */

async function schedeLavoro(adesso: number): Promise<SchedaViva[]> {
  const oggi = dataRoma(adesso);
  const schede: SchedaViva[] = ANNUNCI_TBH.filter((a) => !scaduto(a, oggi)).map((a) => {
    const modulo = a.contatti.modulo ?? null;
    const scheda = a.scheda.tipo === "interna" ? a.scheda.to : a.scheda.url;
    return {
      id: `lavoro:${a.slug}`,
      titolo: a.titolo,
      sottotitolo: a.localita,
      etichetta: a.settore ? a.settore.toUpperCase() : null,
      immagine: a.immagine,
      link: modulo ?? scheda,
      esterno: !(modulo ?? scheda).startsWith("/"),
      pulsante: modulo ? "CANDIDATI" : "VEDI E CANDIDATI",
    };
  });

  try {
    const aperti = await db
      .select()
      .from(schema.castings)
      .where(inArray(schema.castings.stato, ["aperto", "in-selezione"]));
    for (const c of aperti) {
      if (c.scadenza && c.scadenza < oggi) continue;
      const img = c.locandina && (c.locandina.startsWith("/") || c.locandina.startsWith("http")) ? c.locandina : null;
      schede.push({
        id: `casting:${c.slug}`,
        titolo: c.titolo,
        sottotitolo: c.location,
        etichetta: "CASTING",
        immagine: img,
        link: `/casting/${c.slug}`,
        esterno: false,
        pulsante: "CANDIDATI",
      });
    }
  } catch {
    /* archivio casting non leggibile: si mostrano gli altri */
  }

  schede.push({
    id: "miss-cool:adesione",
    titolo: MISS_COOL.titoloWeb,
    sottotitolo: MISS_COOL.sottotitolo,
    etichetta: "CONCORSO · CASTING",
    immagine: "/miss-cool/miss-cool-2027-01.jpg",
    link: "/eventi/miss-cool/adesione",
    esterno: false,
    pulsante: "ISCRIVITI",
  });
  return schede;
}

/* ── composizione ─────────────────────────────────────────────────────── */

let cache: { chiave: string; quando: number; caroselli: CaroselloVivo[] } | null = null;

/** I 4 caroselli della home, nell'ordine dei blocchi. Ricalcolo al massimo ogni 5 minuti. */
export async function caroselliHome(adesso = Date.now()): Promise<{ giorno: string; caroselli: CaroselloVivo[] }> {
  const giorno = dataRoma(adesso);
  if (cache && cache.chiave === giorno && adesso - cache.quando < 5 * 60_000) return { giorno, caroselli: await conCms(cache.caroselli, adesso) };

  const [plaza, dm, lavoro] = await Promise.all([
    schedeTouchPlaza().catch(() => [] as SchedaViva[]),
    schedeDm(adesso).catch(() => [] as SchedaViva[]),
    schedeLavoro(adesso).catch(() => [] as SchedaViva[]),
  ]);
  // DM: le dirette restano in testa (ordine della settimana), il resto si mescola.
  const dirette = dm.filter((s) => s.id.startsWith("dm-diretta:"));
  const resto = dm.filter((s) => !s.id.startsWith("dm-diretta:"));

  const perSlug: Record<string, Omit<CaroselloVivo, "slug" | "titolo">> = {
    "attivita-tbh": { stato: "attivo", nota: null, accento: "giallo", schede: mescola(plaza, `${giorno}:plaza`) },
    "carosello-2": { stato: "attivo", nota: null, accento: "rosso-dm", schede: [...dirette, ...mescola(resto, `${giorno}:dm`)] },
    "carosello-3": { stato: "attivo", nota: null, accento: "giallo", schede: mescola(lavoro, `${giorno}:lavoro`) },
    "casting-concorsi": {
      stato: "in-allestimento",
      nota: "Offerte di Cerco Lavoro in Hotel in arrivo: in attesa dell'autorizzazione di Federalberghi Riccione.",
      accento: "giallo",
      schede: [],
    },
  };
  const caroselli = CAROSELLI_VISIBILI.map((k) => {
    const v = perSlug[k.slug] ?? { stato: "in-allestimento" as const, nota: null, accento: "giallo" as const, schede: [] };
    return { slug: k.slug, titolo: k.titolo, ...v, stato: v.schede.length ? v.stato : ("in-allestimento" as const) };
  });
  cache = { chiave: giorno, quando: adesso, caroselli };
  return { giorno, caroselli: await conCms(caroselli, adesso) };
}

/**
 * 28/10/2026 — schede della GESTIONE CONTENUTI E PALINSESTO collocate su questi caroselli
 * (Home 0 o «tutte le Home»): in testa, nell'ordine del pannello, lette a ogni richiesta
 * (niente attesa della cache di 5 minuti dopo «Pubblica»).
 */
async function conCms(caroselli: CaroselloVivo[], adesso: number): Promise<CaroselloVivo[]> {
  const voci = await vociPubbliche((c) => !!c.carosello && (c.home === null || c.home === "0"), adesso).catch(() => []);
  if (!voci.length) return caroselli;
  return caroselli.map((k) => {
    const mie = voci.filter((v) => voceDi(v, k.slug));
    if (!mie.length) return k;
    const schede: SchedaViva[] = mie.map((v) => {
      const link = v.destinazione ?? v.video?.url ?? "/";
      return {
        id: `cms:${v.collocazione}`,
        titolo: v.titolo,
        sottotitolo: v.descrizione ? v.descrizione.slice(0, 160) : null,
        etichetta: v.fonte || null,
        immagine: v.immagine,
        link,
        esterno: /^https?:\/\//.test(link),
        pulsante: v.pulsante || (v.video ? "GUARDA" : "APRI"),
      };
    });
    return { ...k, stato: "attivo" as const, schede: [...schede, ...k.schede] };
  });
}
const voceDi = (v: VocePubblica, slug: string) => v.carosello === slug;
