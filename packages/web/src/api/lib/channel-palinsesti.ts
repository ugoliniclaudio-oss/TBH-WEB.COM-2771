import { and, asc, eq } from "drizzle-orm";
import { db } from "../database";
import * as schema from "../database/schema";
import { CHANNEL_HOME, type ChannelHome } from "../data/channel-home";
import { CHANNEL_REGISTRO } from "../data/channel-registro";
import { DM_VIDEO_SQUADRE } from "../data/dm-video";
import { ALTRE_DIRETTE_DM, PUNTATE_DM } from "../data/dm-puntate";
import { VIDEO_DM_CONFERMATI, VIDEO_DM_DA_CONFERMARE } from "../data/telecomando";
import { BRANI_HUGO, SERVIZI_CINEMA, SIGLE_SPOT_TBH, ARTISTA_BRANI } from "../data/musica";
import { DM_RADIO, DURATE_YOUTUBE } from "../data/radio";
import { PALINSESTO_DM } from "../data/tbh";
import { ANNUNCI_LAVORO } from "../data/annunci-lavoro";
import { vetrinaTouchPlaza } from "./catalogo-touch-plaza";
import { dataRoma, giornoSettimana, istanteRoma } from "./radio-palinsesto";
import { AMBIENTE, chiaveAmbito } from "./ambiente";
import { catalogoHeddyRapido } from "./heddy-video";
import { urlFilmHeddy } from "../data/heddy-video";

/**
 * PALINSESTI AUTOMATICI DEI 28 CHANNEL (ordine di Claudio del 18/10/2026; 28° = Mondo Olistico).
 *
 * Regole, alla lettera:
 *  · nessun video, orario, diretta o contenuto inventato: le righe automatiche arrivano
 *    SOLO dagli archivi del sito già verificati, elencati in `FONTI_VERIFICATE`;
 *  · i video DM «da confermare» entrano solo quando la società è in VIDEO_DM_CONFERMATI;
 *  · un Channel squadra riceve SOLO i video della propria società, firmati DM
 *    (media partner esterno, non società TBH);
 *  · indice unico (channel, sorgente): lo stesso contenuto non entra mai due volte;
 *  · un contenuto che sparisce dalla sua fonte (prodotto tolto dalla vetrina, casting
 *    chiuso, annuncio ritirato) viene SPENTO, mai cancellato;
 *  · le modalità Diretta / Replica / Playlist automatica valgono solo quando sono vere;
 *    altrimenti il Channel è «In allestimento»;
 *  · TOUCH TV e TOUCH RADIO restano sul palinsesto condiviso (api/lib/touch-canali.ts);
 *  · AMBITO (api/lib/ambiente.ts): ogni lettura e scrittura è filtrata su `ambiente`,
 *    così l'anteprima (staging) e il sito pubblico (produzione) non si toccano mai.
 */

export type TipoContenuto = "video" | "audio" | "diretta" | "spot" | "scheda" | "annuncio" | "film" | "immagine";
/**
 * 28/10/2026 — «commerciale» = PALINSESTO B: rotazione H24 dei soli materiali commerciali
 * disponibili (contenuti attivi del Channel + spot interni attivi di Touch Spot), per i Channel
 * senza programmazione editoriale. Il palinsesto A (editoriale) resta quello di sempre.
 */
export type ModalitaChannel = "auto" | "diretta" | "replica" | "playlist" | "allestimento" | "commerciale";
export const MODALITA_CHANNEL: ModalitaChannel[] = ["auto", "diretta", "replica", "playlist", "allestimento", "commerciale"];
export type StatoEffettivo = "DIRETTA" | "REPLICA" | "PLAYLIST AUTOMATICA" | "IN ALLESTIMENTO" | "PALINSESTO CONDIVISO" | "PALINSESTO COMMERCIALE H24";

/** Ciò che serve al palinsesto di un Channel: vale per i 28 e per tutto il registro. */
export type ChannelConPalinsesto = Pick<ChannelHome, "slug"> & { categoria: string; squadra?: string };

const ATTRIBUZIONE_DM = "Video DM · Daniele Manuelli Official — media partner esterno";
const CONDIVISI = new Set(["touch-tv", "touch-radio"]);
const SLUG_SPOT = "touch-spot";

/** Archivi da cui il sistema può leggere da solo, con la ragione per cui sono affidabili. */
export const FONTI_VERIFICATE: Record<string, { nome: string; perche: string; channel: string[] }> = {
  "dm-video": {
    nome: "Video DM per società (dm-video.ts)",
    perche: "Titoli e URL copiati alla lettera dal canale ufficiale Daniele Manuelli Official, abbinati per società.",
    channel: CHANNEL_HOME.filter((c) => c.categoria === "squadra").map((c) => c.slug),
  },
  "dm-puntate": {
    nome: "Puntate e dirette DM (dm-puntate.ts)",
    perche: "Puntate dei programmi DM con durata reale dal canale ufficiale.",
    channel: ["dm"],
  },
  "brani-hugo": { nome: "Brani J.C. Hugò (musica.ts)", perche: "Brani pubblicati sul canale Touch Music.", channel: ["touch-deejay-jc-hugo"] },
  "sigle-spot-tbh": { nome: "Sigle e spot TBH (musica.ts)", perche: "Spot interni del gruppo pubblicati su YouTube.", channel: [SLUG_SPOT] },
  "servizi-cinema": { nome: "Servizi cinema (musica.ts)", perche: "Video «Touch Cinema» e servizi cinema pubblicati.", channel: ["touch-cinema"] },
  "heddy-video": {
    nome: "Film su HEDDY.video (catalogo vivo + fotografia 18/10/2026)",
    perche: "Ordine di Claudio del 18/10/2026: la programmazione provvisoria di Touch Cinema = tutti i film pubblicati su heddy.video. Dati copiati dalle schede HEDDY; i film si guardano su HEDDY.video.",
    channel: ["touch-cinema"],
  },
  "vetrina-touch-plaza": {
    nome: "Vetrina Touch Plaza Shop (catalogo)",
    perche: "Solo articoli in vetrina con foto reale; si aggiorna quando cambia il catalogo.",
    channel: ["touch-plaza-shop"],
  },
  "annunci-lavoro": { nome: "Annunci TBH Lavoro (annunci-lavoro.ts)", perche: "Annunci pubblicati in bacheca.", channel: ["touch-lavoro"] },
  casting: {
    nome: "Casting pubblicati (tabella castings)",
    perche: "Solo casting aperti o in selezione. Le candidature personali non vanno mai in onda.",
    channel: ["touch-casting"],
  },
};

type Candidato = {
  tipo: TipoContenuto;
  titolo: string;
  sorgente: string;
  link: string | null;
  durataSec: number | null;
  attribuzione: string | null;
  fonte: string;
  descrizione?: string | null;
};

export function idYouTube(url: string): string | null {
  if (/^[\w-]{11}$/.test(url)) return url;
  const m = url.match(/(?:v=|youtu\.be\/|embed\/|shorts\/|live\/)([\w-]{11})/);
  return m ? m[1]! : null;
}

export function normalizzaSorgente(s: string): string {
  const t = s.trim();
  return idYouTube(t) ?? t;
}

const yt = (id: string) => `https://www.youtube.com/watch?v=${id}`;

/** Candidati di UN Channel, letti dalle fonti verificate. [] = nessuna fonte affidabile. */
async function candidatiDi(c: ChannelConPalinsesto): Promise<Candidato[]> {
  if (c.categoria === "squadra" && c.squadra) {
    const out: Candidato[] = [];
    const arch = DM_VIDEO_SQUADRE.find((s) => s.slug === c.squadra);
    if (arch)
      for (const v of [...arch.highlights, ...arch.interviste, ...arch.servizi]) {
        const id = idYouTube(v.url);
        if (id) out.push({ tipo: "video", titolo: v.titolo, sorgente: id, link: v.url, durataSec: null, attribuzione: ATTRIBUZIONE_DM, fonte: "dm-video" });
      }
    if (VIDEO_DM_CONFERMATI.includes(c.squadra))
      for (const v of VIDEO_DM_DA_CONFERMARE[c.squadra] ?? [])
        out.push({ tipo: "video", titolo: v.titolo, sorgente: v.id, link: yt(v.id), durataSec: null, attribuzione: ATTRIBUZIONE_DM, fonte: "dm-video" });
    return out;
  }
  switch (c.slug) {
    case "dm":
      return [...Object.values(PUNTATE_DM).flat(), ...ALTRE_DIRETTE_DM].map((p) => ({
        tipo: "video" as const,
        titolo: p.titolo,
        sorgente: p.videoId,
        link: yt(p.videoId),
        durataSec: p.durataSec || null,
        attribuzione: ATTRIBUZIONE_DM,
        fonte: "dm-puntate",
      }));
    case "touch-deejay-jc-hugo":
      return BRANI_HUGO.flatMap((b) => {
        const id = idYouTube(b.url);
        return id ? [{ tipo: "video" as const, titolo: b.titolo, sorgente: id, link: b.url, durataSec: DURATE_YOUTUBE[id] ?? null, attribuzione: ARTISTA_BRANI, fonte: "brani-hugo" }] : [];
      });
    case SLUG_SPOT:
      return SIGLE_SPOT_TBH.flatMap((b) => {
        const id = idYouTube(b.url);
        return id ? [{ tipo: "spot" as const, titolo: b.titolo, sorgente: id, link: b.url, durataSec: DURATE_YOUTUBE[id] ?? null, attribuzione: "TBH · spot interno", fonte: "sigle-spot-tbh" }] : [];
      });
    case "touch-cinema": {
      // Programmazione film = catalogo HEDDY.video (ordine di Claudio, 18/10/2026); i 6 servizi cinema restano in archivio.
      const heddy = catalogoHeddyRapido();
      const film = heddy.film.map((f) => ({
        tipo: "film" as const,
        titolo: f.titolo,
        sorgente: `heddy:${f.slug}`,
        link: urlFilmHeddy(f.slug),
        durataSec: f.durataMin ? f.durataMin * 60 : null,
        attribuzione: "HEDDY.video",
        fonte: "heddy-video",
        descrizione: [f.regia, f.anno, f.paese].filter(Boolean).join(" · ") || null,
      }));
      const servizi = SERVIZI_CINEMA.flatMap((b) => {
        const id = idYouTube(b.url);
        return id ? [{ tipo: "video" as const, titolo: b.titolo, sorgente: id, link: b.url, durataSec: DURATE_YOUTUBE[id] ?? null, attribuzione: "Touch Cinema", fonte: "servizi-cinema" }] : [];
      });
      return [...film, ...servizi];
    }
    case "touch-plaza-shop": {
      const vetrina = await vetrinaTouchPlaza();
      return vetrina
        .filter((p) => !!p.image)
        .map((p) => ({ tipo: "scheda" as const, titolo: p.title, sorgente: `/shop/p/${p.slug}`, link: `/shop/p/${p.slug}`, durataSec: null, attribuzione: "Touch Plaza Shop", fonte: "vetrina-touch-plaza" }));
    }
    case "touch-lavoro":
      return ANNUNCI_LAVORO.map((a) => {
        const pagina = a.ritorno?.url ?? `/lavoro-casting#${a.ancora}`;
        return { tipo: "annuncio" as const, titolo: a.titolo, sorgente: `annuncio:${a.slug}`, link: pagina, durataSec: null, attribuzione: "TBH Lavoro", fonte: "annunci-lavoro" };
      });
    case "touch-casting": {
      const righe = await db.select().from(schema.castings);
      return righe
        .filter((r) => r.stato === "aperto" || r.stato === "in-selezione")
        .map((r) => ({ tipo: "annuncio" as const, titolo: r.titolo, sorgente: `/casting/${r.slug}`, link: `/casting/${r.slug}`, durataSec: null, attribuzione: "Touch Casting", fonte: "casting" }));
    }
    default:
      return [];
  }
}

/* ── impostazioni ─────────────────────────────────────────────────────────── */

export type Impostazioni = {
  modalita: ModalitaChannel;
  casuale: boolean;
  repliche: boolean;
  spotOgni: number;
  durataScheda: number;
  aggiornamentoAuto: boolean;
};

const PREDEFINITE: Impostazioni = { modalita: "auto", casuale: false, repliche: true, spotOgni: 0, durataScheda: 20, aggiornamentoAuto: true };

function daRiga(r: typeof schema.channelImpostazioni.$inferSelect | undefined): Impostazioni {
  if (!r) return { ...PREDEFINITE };
  return {
    modalita: ((MODALITA_CHANNEL as string[]).includes(r.modalita) ? r.modalita : "auto") as ModalitaChannel,
    casuale: !!r.casuale,
    repliche: !!r.repliche,
    spotOgni: Math.max(0, r.spotOgni),
    durataScheda: Math.max(5, r.durataScheda),
    aggiornamentoAuto: !!r.aggiornamentoAuto,
  };
}

export async function tutteLeImpostazioni(): Promise<Record<string, Impostazioni>> {
  const righe = await db.select().from(schema.channelImpostazioni).where(eq(schema.channelImpostazioni.ambiente, AMBIENTE));
  const out: Record<string, Impostazioni> = {};
  // 28/10/2026: tutto il registro (i 28 + i Channel nuovi e gli spazi), ognuno con le sue impostazioni.
  for (const c of CHANNEL_REGISTRO) out[c.slug] = daRiga(righe.find((r) => r.channel === c.slug));
  return out;
}

export async function salvaImpostazioni(slug: string, v: Impostazioni) {
  const valori = {
    modalita: v.modalita,
    casuale: v.casuale ? 1 : 0,
    repliche: v.repliche ? 1 : 0,
    spotOgni: Math.max(0, Math.min(50, Math.round(v.spotOgni))),
    durataScheda: Math.max(5, Math.min(600, Math.round(v.durataScheda))),
    aggiornamentoAuto: v.aggiornamentoAuto ? 1 : 0,
    updatedAt: new Date(),
  };
  await db
    .insert(schema.channelImpostazioni)
    .values({ ambiente: AMBIENTE, channel: slug, ...valori })
    .onConflictDoUpdate({ target: [schema.channelImpostazioni.ambiente, schema.channelImpostazioni.channel], set: valori });
}

/* ── sincronizzazione automatica ──────────────────────────────────────────── */

export type EsitoSync = { channel: string; fonte: number; nuovi: number; spenti: number; errore?: string };

const CHIAVE_SYNC = chiaveAmbito("channel_sync_ultimo");
const OGNI_MS = 30 * 60_000;
let inCorso: Promise<EsitoSync[]> | null = null;

export async function sincronizza(): Promise<EsitoSync[]> {
  const imp = await tutteLeImpostazioni();
  const esiti: EsitoSync[] = [];
  for (const c of CHANNEL_REGISTRO) {
    if (CONDIVISI.has(c.slug) || !imp[c.slug]!.aggiornamentoAuto) continue;
    try {
      const lista = await candidatiDi(c);
      if (!lista.length) {
        esiti.push({ channel: c.slug, fonte: 0, nuovi: 0, spenti: 0 });
        continue;
      }
      const esistenti = await contenutiDi(c.slug);
      const gia = new Set(esistenti.map((e) => e.sorgente));
      const visti = new Set<string>();
      let nuovi = 0;
      const base = esistenti.reduce((m, e) => Math.max(m, e.ordine), 0);
      for (const [i, x] of lista.entries()) {
        if (visti.has(x.sorgente)) continue; // doppione dentro la stessa fonte
        visti.add(x.sorgente);
        if (gia.has(x.sorgente)) continue;
        await db
          .insert(schema.channelContenuti)
          .values({ ambiente: AMBIENTE, channel: c.slug, ...x, ordine: esistenti.length ? base + 1 + i : i, origine: "auto" })
          .onConflictDoNothing();
        nuovi++;
      }
      let spenti = 0;
      for (const e of esistenti)
        if (e.origine === "auto" && e.attivo && !visti.has(e.sorgente)) {
          await db
            .update(schema.channelContenuti)
            .set({ attivo: 0, updatedAt: new Date() })
            .where(and(eq(schema.channelContenuti.id, e.id), eq(schema.channelContenuti.ambiente, AMBIENTE)));
          spenti++;
        }
      esiti.push({ channel: c.slug, fonte: visti.size, nuovi, spenti });
    } catch (e) {
      esiti.push({ channel: c.slug, fonte: 0, nuovi: 0, spenti: 0, errore: e instanceof Error ? e.message : String(e) });
    }
  }
  const valore = JSON.stringify({ quando: Date.now(), esiti });
  await db.insert(schema.settings).values({ key: CHIAVE_SYNC, value: valore }).onConflictDoUpdate({ target: schema.settings.key, set: { value: valore } });
  return esiti;
}

export async function ultimoSync(): Promise<{ quando: number; esiti: EsitoSync[] } | null> {
  const [r] = await db.select().from(schema.settings).where(eq(schema.settings.key, CHIAVE_SYNC));
  if (!r) return null;
  try {
    return JSON.parse(r.value);
  } catch {
    return null;
  }
}

/** Sincronizza al massimo ogni 30 minuti, una volta sola anche con più richieste insieme. */
export async function sincronizzaSeServe() {
  const u = await ultimoSync();
  if (u && Date.now() - u.quando < OGNI_MS) return;
  if (!inCorso) inCorso = sincronizza().finally(() => (inCorso = null));
  await inCorso;
}

/* ── scaletta e stato ─────────────────────────────────────────────────────── */

type Contenuto = typeof schema.channelContenuti.$inferSelect;
type Fascia = typeof schema.channelFasce.$inferSelect;

export async function contenutiDi(slug: string): Promise<Contenuto[]> {
  return db
    .select()
    .from(schema.channelContenuti)
    .where(and(eq(schema.channelContenuti.ambiente, AMBIENTE), eq(schema.channelContenuti.channel, slug)))
    .orderBy(asc(schema.channelContenuti.ordine), asc(schema.channelContenuti.id));
}

export async function fasceDi(slug: string): Promise<Fascia[]> {
  return db
    .select()
    .from(schema.channelFasce)
    .where(and(eq(schema.channelFasce.ambiente, AMBIENTE), eq(schema.channelFasce.channel, slug)))
    .orderBy(asc(schema.channelFasce.ora));
}

/** Mescolanza con seme: stessa sequenza per tutti nello stesso giorno, diversa ogni giorno. */
function mescola<T>(lista: T[], chiave: string): T[] {
  let h = 2166136261;
  for (const ch of chiave) h = Math.imul(h ^ ch.charCodeAt(0), 16777619);
  const a = [...lista];
  for (let i = a.length - 1; i > 0; i--) {
    h = Math.imul(h ^ (h >>> 13), 1274126177);
    const j = Math.abs(h) % (i + 1);
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}

export type VoceSequenza = {
  id: number;
  tipo: string;
  titolo: string;
  sorgente: string;
  link: string | null;
  durataSec: number | null;
  attribuzione: string | null;
  spot: boolean;
};

/** Sequenza di un giorno: ordine o rotazione casuale, frequenze, spot interni a intervallo. */
export async function sequenzaDi(slug: string, giorno: string, imp: Impostazioni): Promise<VoceSequenza[]> {
  if (imp.modalita === "commerciale" && !CONDIVISI.has(slug)) return sequenzaCommerciale(slug, giorno, imp);
  /* 28/10/2026 (round 14) — i Channel FUORI dai 28 trasmettono anche i propri spot (tipo «spot» scelto in Regia);
     per i 28 resta la regola di sempre (spot solo da Touch Spot, a intervallo). */
  const propriSpot = slug === SLUG_SPOT || !CHANNEL_HOME.some((h) => h.slug === slug);
  const attivi = (await contenutiDi(slug)).filter((c) => c.attivo && (propriSpot || c.tipo !== "spot"));
  const giri = Math.max(1, ...attivi.map((c) => c.frequenza));
  let lista: Contenuto[] = [];
  for (let g = 0; g < giri; g++) lista.push(...attivi.filter((c) => c.frequenza > g));
  if (imp.casuale) lista = mescola(lista, `${slug}-${giorno}`);
  const voce = (c: Contenuto, spot = false): VoceSequenza => ({
    id: c.id,
    tipo: c.tipo,
    titolo: c.titolo,
    sorgente: c.sorgente,
    link: c.link,
    durataSec: c.tipo === "scheda" || c.tipo === "annuncio" || c.tipo === "immagine" ? (c.durataSec ?? imp.durataScheda) : c.durataSec,
    attribuzione: c.attribuzione,
    spot,
  });
  const out: VoceSequenza[] = [];
  const spot = imp.spotOgni > 0 && slug !== SLUG_SPOT ? (await contenutiDi(SLUG_SPOT)).filter((c) => c.attivo) : [];
  let k = Math.abs([...giorno].reduce((n, ch) => n * 31 + ch.charCodeAt(0), 7)) % Math.max(1, spot.length);
  lista.forEach((c, i) => {
    out.push(voce(c));
    if (spot.length && (i + 1) % imp.spotOgni === 0) out.push(voce(spot[k++ % spot.length]!, true));
  });
  return out;
}

/**
 * PALINSESTO B · COMMERCIALE H24: contenuti attivi del Channel + spot interni attivi di Touch
 * Spot, in rotazione (casuale del giorno se richiesto), mai due volte di fila lo stesso
 * materiale. Solo materiali già in archivio: senza materiali la sequenza è vuota.
 */
async function sequenzaCommerciale(slug: string, giorno: string, imp: Impostazioni): Promise<VoceSequenza[]> {
  const propri = (await contenutiDi(slug)).filter((c) => c.attivo);
  const spot = slug === SLUG_SPOT ? [] : (await contenutiDi(SLUG_SPOT)).filter((c) => c.attivo);
  let lista: { c: Contenuto; spot: boolean }[] = [
    ...propri.map((c) => ({ c, spot: c.tipo === "spot" })),
    ...spot.filter((s) => !propri.some((p) => p.sorgente === s.sorgente)).map((c) => ({ c, spot: true })),
  ];
  if (imp.casuale) lista = mescola(lista, `${slug}-commerciale-${giorno}`);
  return lista.map(({ c, spot: sp }) => ({
    id: c.id,
    tipo: c.tipo,
    titolo: c.titolo,
    sorgente: c.sorgente,
    link: c.link,
    durataSec: c.tipo === "scheda" || c.tipo === "annuncio" || c.tipo === "immagine" ? (c.durataSec ?? imp.durataScheda) : c.durataSec,
    attribuzione: c.attribuzione,
    spot: sp,
  }));
}

function fasciaAdesso(fasce: Fascia[], adesso: number) {
  const oggi = dataRoma(adesso);
  const g = giornoSettimana(oggi);
  for (const f of fasce) {
    if (!f.attivo || (f.giorno !== null && f.giorno !== g)) continue;
    const inizio = istanteRoma(oggi, f.ora);
    if (inizio <= adesso && adesso < inizio + f.durataMin * 60_000) return f;
  }
  return null;
}

function direttaDmAdesso(adesso: number) {
  const oggi = dataRoma(adesso);
  const g = giornoSettimana(oggi);
  for (const p of PALINSESTO_DM) {
    if (p.giorno !== g || !p.ora) continue;
    const inizio = istanteRoma(oggi, p.ora);
    if (inizio <= adesso && adesso < inizio + p.durataMin * 60_000) return { titolo: p.name, embed: DM_RADIO.live };
  }
  return null;
}

export type StatoChannel = {
  stato: StatoEffettivo;
  /** Riga di testo vera da mostrare sotto il titolo (null = niente da dire). */
  nota: string | null;
  disponibili: { diretta: boolean; replica: boolean; playlist: boolean };
  contenutiAttivi: number;
  direttaEmbed: string | null;
};

/** Stato VERO di un Channel adesso. La modalità scelta nel pannello vale solo se è disponibile. */
export function calcolaStato(slug: string, imp: Impostazioni, attivi: number, fasce: Fascia[], adesso: number, spotDisponibili = 0): StatoChannel {
  if (CONDIVISI.has(slug))
    return { stato: "PALINSESTO CONDIVISO", nota: "Stesso palinsesto sincronizzato di TV e Radio", disponibili: { diretta: false, replica: false, playlist: true }, contenutiAttivi: attivi, direttaEmbed: null };
  if (imp.modalita === "commerciale") {
    const n = attivi + spotDisponibili;
    const disp = { diretta: false, replica: false, playlist: n > 0 };
    return n
      ? { stato: "PALINSESTO COMMERCIALE H24", nota: `${n} material${n === 1 ? "e" : "i"} commercial${n === 1 ? "e" : "i"} in rotazione`, disponibili: disp, contenutiAttivi: attivi, direttaEmbed: null }
      : { stato: "IN ALLESTIMENTO", nota: "Palinsesto commerciale scelto: nessun materiale disponibile", disponibili: disp, contenutiAttivi: attivi, direttaEmbed: null };
  }
  const f = fasciaAdesso(fasce, adesso);
  const dm = slug === "dm" ? direttaDmAdesso(adesso) : null;
  const direttaOra = dm ?? (f?.modalita === "diretta" && f.sorgente ? { titolo: f.titolo, embed: f.sorgente } : null);
  const disponibili = {
    diretta: !!direttaOra,
    replica: attivi > 0,
    playlist: attivi > 0,
  };
  const base = { disponibili, contenutiAttivi: attivi };
  if (imp.modalita === "allestimento") return { ...base, stato: "IN ALLESTIMENTO", nota: null, direttaEmbed: null };
  if (direttaOra && (imp.modalita === "auto" || imp.modalita === "diretta"))
    return { ...base, stato: "DIRETTA", nota: direttaOra.titolo, direttaEmbed: direttaOra.embed };
  if (!attivi) return { ...base, stato: "IN ALLESTIMENTO", nota: null, direttaEmbed: null };
  const replica = imp.modalita === "replica" || (imp.modalita === "auto" && (f?.modalita === "replica" || slug === "dm"));
  return {
    ...base,
    stato: replica ? "REPLICA" : "PLAYLIST AUTOMATICA",
    nota: `${attivi} contenut${attivi === 1 ? "o" : "i"} in archivio`,
    direttaEmbed: null,
  };
}

export async function quadroChannel<T extends ChannelConPalinsesto = ChannelHome>(adesso: number, elenco: readonly T[] = CHANNEL_HOME as unknown as T[]) {
  const [imp, righe, fasce] = await Promise.all([
    tutteLeImpostazioni(),
    db.select().from(schema.channelContenuti).where(eq(schema.channelContenuti.ambiente, AMBIENTE)),
    db.select().from(schema.channelFasce).where(eq(schema.channelFasce.ambiente, AMBIENTE)),
  ]);
  const spotAttivi = righe.filter((r) => r.channel === SLUG_SPOT && r.attivo).length;
  return elenco.map((c) => {
    const propri = righe.filter((r) => r.channel === c.slug);
    const attivi = propri.filter((r) => r.attivo && (c.slug === SLUG_SPOT || r.tipo !== "spot")).length;
    return {
      ...c,
      impostazioni: imp[c.slug]!,
      totali: propri.length,
      ...calcolaStato(c.slug, imp[c.slug]!, attivi, fasce.filter((f) => f.channel === c.slug), adesso, c.slug === SLUG_SPOT ? 0 : spotAttivi),
    };
  });
}

export async function contenutoPerId(id: number) {
  const [r] = await db
    .select()
    .from(schema.channelContenuti)
    .where(and(eq(schema.channelContenuti.id, id), eq(schema.channelContenuti.ambiente, AMBIENTE)));
  return r ?? null;
}

export async function giaPresente(slug: string, sorgente: string) {
  const [r] = await db
    .select({ id: schema.channelContenuti.id })
    .from(schema.channelContenuti)
    .where(
      and(eq(schema.channelContenuti.ambiente, AMBIENTE), eq(schema.channelContenuti.channel, slug), eq(schema.channelContenuti.sorgente, sorgente)),
    );
  return !!r;
}

export const CHANNEL_CONDIVISI = CONDIVISI;

/* ── sincronizzazione periodica ───────────────────────────────────────────── */

const CHIAVE_TIMER = "__tbhChannelTimer";

/**
 * Oltre alla sincronizzazione «a richiesta» (ogni visita controlla se sono passati 30
 * minuti), il server prova da solo ogni 5 minuti: così l'archivio si aggiorna ogni 30
 * minuti anche senza visite. Un solo timer per processo, anche quando Vite ricarica.
 */
export function avviaSincronizzazionePeriodica() {
  const g = globalThis as unknown as Record<string, ReturnType<typeof setInterval> | undefined>;
  if (g[CHIAVE_TIMER]) return;
  const giro = () => {
    sincronizzaSeServe().catch(() => {
      /* fonte non raggiungibile: si riprova al giro successivo */
    });
  };
  g[CHIAVE_TIMER] = setInterval(giro, 5 * 60_000);
  setTimeout(giro, 15_000);
}

export const OGNI_MINUTI_SYNC = OGNI_MS / 60_000;
