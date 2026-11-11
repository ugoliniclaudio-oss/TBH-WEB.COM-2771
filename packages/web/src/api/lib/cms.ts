import { eq } from "drizzle-orm";
import { db } from "../database";
import * as schema from "../database/schema";
import { CAROSELLI_HOME, CAROSELLI_VISIBILI, CHANNEL_HOME, CHANNEL_HOME_AGGIUNTI, FILE_HOME } from "../data/channel-home";
import { CHANNEL_REGISTRO, SEZIONI_CHANNEL, registroPerSlug, type SezioneChannel } from "../data/channel-registro";
import { istanteRoma, giornoSettimana, dataRoma, oraRoma } from "./radio-palinsesto";

/**
 * GESTIONE CONTENUTI E PALINSESTO — Super Admin TBH (28/10/2026).
 *
 * PERSISTENZA: tutto vive nella tabella `settings` con chiavi CONDIVISE fra anteprima e sito
 * pubblico (`cms_v1:*`, senza ambito). È la correzione della causa del caso ARM WRESTLING: ciò che
 * si salva e si pubblica dal pannello è subito lo stesso dato su www.tbh-web.com — il pulsante
 * Publish di Runable pubblica il codice e non tocca questi dati; riavvii e reset dell'anteprima
 * non li riportano ai valori iniziali (i valori iniziali si usano SOLO se la chiave non esiste).
 * La sicurezza la danno gli STATI: bozza (mai visibile al pubblico) → attivo → sospeso, e per le
 * Home una versione «bozza» separata da quella «pubblicata».
 *
 *   · SCHEDA = il contenuto, salvato UNA volta (video, immagine, destinazione, testi, durata);
 *   · COLLOCAZIONE = dove compare (Home, Channel, carosello, playlist, posizione, date, ripetizione).
 *     La stessa scheda può avere più collocazioni: nessun doppione dell'originale;
 *   · PLAYLIST = sequenza ordinata: «play» (parte da capo quando lo spettatore preme Play) oppure
 *     «diretta» (sincronizzata sull'orologio: tutti vedono lo stesso punto), con ciclo continuo;
 *   · CAROSELLI, HOME (Home 0 + 2.0 + 3.0 + altre, senza limite), CHANNEL E PAGINE aggiunti.
 * Nessun dato inventato: senza titolo non si salva, la durata è quella letta o scritta a mano.
 */

export const STATI = ["bozza", "attivo", "sospeso"] as const;
export type Stato = (typeof STATI)[number];
export type Piattaforma = "youtube" | "vimeo" | "dailymotion" | "video" | "pagina";

export type Scheda = {
  id: string;
  titolo: string;
  descrizione: string;
  fonte: string;
  pulsante: string;
  video: { url: string; piattaforma: Piattaforma; embedId: string | null; caricato: boolean; nomeFile?: string | null; peso?: number | null } | null;
  immagine: { url: string; caricato: boolean; nomeFile?: string | null; peso?: number | null } | null;
  destinazione: string | null;
  durataSec: number | null;
  durataDa: "fonte" | "pagina" | "ricerca" | "manuale" | null;
  verifica: { quando: number; esito: "ok" | "errore" | "non-verificabile"; messaggio: string } | null;
  stato: Stato;
  creato: number;
  aggiornato: number;
  pubblicato: number | null;
};

export const RIPETIZIONI = ["sempre", "giornaliera", "settimanale"] as const;
export type Ripetizione = { tipo: (typeof RIPETIZIONI)[number]; giorni: number[]; dalle: string | null; alle: string | null };

export type Collocazione = {
  id: string;
  schedaId: string;
  /** null = in tutte le Home (per i caroselli); altrimenti lo slug della Home. */
  home: string | null;
  channel: string | null;
  carosello: string | null;
  playlist: string | null;
  posizione: number;
  /** Passaggi per giro di playlist (ripetizioni). */
  passaggi: number;
  /** «YYYY-MM-DDTHH:mm» ora di Roma; null = subito / senza scadenza. */
  inizio: string | null;
  fine: string | null;
  ripetizione: Ripetizione;
  stato: "attivo" | "sospeso";
  aggiornato: number;
};

export type Playlist = {
  id: string;
  nome: string;
  modalita: "play" | "diretta";
  ciclo: boolean;
  /** Solo diretta: istante di partenza del primo giro (ms). */
  ancora: number;
  stato: Stato;
  aggiornato: number;
};

export type Carosello = { id: string; nome: string; accento: "giallo" | "rosso-dm"; stato: Stato; predefinito: boolean; nota: string | null };

export type Blocco = { id: string; titolo: string; channel: string[]; carosello: string | null };
export type LayoutHome = { blocchi: Blocco[]; palinsesti: string[] };
export type Home = {
  slug: string;
  nome: string;
  ordine: number;
  stato: Stato;
  bozza: LayoutHome;
  pubblicata: LayoutHome | null;
  aggiornato: number;
  pubblicataIl: number | null;
};

export type CanaleExtra = {
  slug: string;
  nome: string;
  tipo: "channel" | "pagina";
  sezione: SezioneChannel;
  url: string | null;
  logo: string | null;
  descrizione: string;
  stato: Stato;
  ordine: number;
  creato: number;
  /** 04/11/2026 (round 18) — spazio vuoto aggiunto in blocco dal pannello: si compila con «Modifica» (poi è un Channel normale). */
  spazio?: boolean;
};
export type ModificaRegistro = {
  nome?: string;
  ordine?: number;
  attivo?: boolean;
  /** 28/10/2026 (round 14) — dalla Regia: logo sostitutivo (URL https o /percorso), sito del Channel e collegamenti in più. */
  logo?: string;
  sito?: string;
  collegamenti?: { nome: string; href: string }[];
  /** 29/10/2026 (round 15) — SCHEDA informativa dalla Regia (separata dal palinsesto): prevale sui dati di base. */
  scheda?: SchedaRegia;
};
export type SchedaRegia = {
  descrizione?: string;
  servizi?: string[];
  telefono?: string;
  whatsapp?: string;
  email?: string;
  social?: { nome: string; href: string }[];
  indirizzo?: string;
  maps?: string;
  indicazioni?: string;
};
export type Canali = { extra: CanaleExtra[]; modifiche: Record<string, ModificaRegistro> };

export type ErroreVideo = { quando: number; schedaId: string; titolo: string; codice: string; messaggio: string; dove: string };

/* ── archivio (settings, chiavi condivise) ───────────────────────────────── */

const K = {
  schede: "cms_v1:schede",
  collocazioni: "cms_v1:collocazioni",
  playlist: "cms_v1:playlist",
  caroselli: "cms_v1:caroselli",
  homes: "cms_v1:homes",
  canali: "cms_v1:canali",
  errori: "cms_v1:errori",
} as const;

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

export const nuovoId = (p: string) => `${p}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;

export const leggiSchede = async () => (await leggi<Scheda[]>(K.schede)) ?? [];
export const salvaSchede = (v: Scheda[]) => scrivi(K.schede, v);
export const leggiCollocazioni = async () => (await leggi<Collocazione[]>(K.collocazioni)) ?? [];
export const salvaCollocazioni = (v: Collocazione[]) => scrivi(K.collocazioni, v);
export const leggiPlaylist = async () => (await leggi<Playlist[]>(K.playlist)) ?? [];
export const salvaPlaylist = (v: Playlist[]) => scrivi(K.playlist, v);
export const leggiCanali = async (): Promise<Canali> => {
  const c = await leggi<Canali>(K.canali);
  return { extra: c?.extra ?? [], modifiche: c?.modifiche ?? {} };
};
export const salvaCanali = (v: Canali) => scrivi(K.canali, v);
export const leggiErrori = async () => (await leggi<ErroreVideo[]>(K.errori)) ?? [];
export async function registraErrore(e: ErroreVideo) {
  const l = await leggiErrori();
  l.unshift(e);
  await scrivi(K.errori, l.slice(0, 200));
}
export const svuotaErrori = () => scrivi(K.errori, []);

/* ── caroselli: quelli della home (predefiniti) + le schede Lavoro + quelli nuovi ── */

/** Schede della barra CERCO / OFFRO LAVORO: ogni fonte ha il suo carosello. */
export const SCHEDE_LAVORO = [
  {
    id: "lavoro-subito",
    nome: "Subito.it",
    fonte: null as string | null,
    attesa: "Nessun annuncio TBH attivo su Subito.it in questo momento.",
  },
  {
    id: "lavoro-bakeca",
    nome: "Bakeca",
    fonte: null,
    attesa: "Annunci TBH su Bakeca in verifica: si pubblicano solo i singoli annunci TBH confermati.",
  },
  { id: "lavoro-indeed", nome: "Indeed", fonte: "https://it.indeed.com/", attesa: "In attesa del link diretto agli annunci TBH su Indeed." },
  {
    id: "casting-concorsi",
    nome: "Cerco Lavoro in Hotel",
    fonte: null,
    attesa: "Offerte di Cerco Lavoro in Hotel in arrivo: in attesa dell'autorizzazione di Federalberghi Riccione.",
  },
] as const;

export async function leggiCaroselli(): Promise<Carosello[]> {
  const salvati = (await leggi<Carosello[]>(K.caroselli)) ?? [];
  const predefiniti: Carosello[] = [
    ...CAROSELLI_HOME.map((k) => ({
      id: k.slug,
      nome: k.slug === "casting-concorsi" ? "CERCO / OFFRO LAVORO · Cerco Lavoro in Hotel" : k.titolo,
      accento: (k.slug === "carosello-2" ? "rosso-dm" : "giallo") as Carosello["accento"],
      stato: "attivo" as Stato,
      predefinito: true,
      nota: k.dopoFila ? `Home 0, dopo il blocco ${k.dopoFila}` : "Conservato, non mostrato in Home 0",
    })),
    ...SCHEDE_LAVORO.filter((s) => s.id !== "casting-concorsi").map((s) => ({
      id: s.id,
      nome: `CERCO / OFFRO LAVORO · ${s.nome}`,
      accento: "giallo" as const,
      stato: "attivo" as Stato,
      predefinito: true,
      nota: "Scheda della barra lavoro",
    })),
  ];
  const ids = new Set(predefiniti.map((p) => p.id));
  return [...predefiniti.map((p) => ({ ...p, ...(salvati.find((s) => s.id === p.id) ?? {}), predefinito: true })), ...salvati.filter((s) => !ids.has(s.id))];
}
export async function salvaCarosello(c: Carosello) {
  const salvati = (await leggi<Carosello[]>(K.caroselli)) ?? [];
  const i = salvati.findIndex((x) => x.id === c.id);
  if (i >= 0) salvati[i] = c;
  else salvati.push(c);
  await scrivi(K.caroselli, salvati);
}

/* ── Home ─────────────────────────────────────────────────────────────────── */

/** Home 0 = la home «Canale 0» di sempre: 28 Channel + Touch Talent nelle file A–E, 4 caroselli. */
export function layoutHome0(): LayoutHome {
  return {
    blocchi: FILE_HOME.map((f) => ({
      id: f,
      titolo: `Blocco ${f}`,
      channel: [...CHANNEL_HOME.filter((c) => c.fila === f), ...CHANNEL_HOME_AGGIUNTI.filter((c) => c.fila === f)].map((c) => c.slug),
      carosello: CAROSELLI_VISIBILI.find((k) => k.dopoFila === f)?.slug ?? null,
    })),
    palinsesti: [],
  };
}
/** Channel fissi di Home 0 (non si tolgono né si spostano dal pannello). */
export const FISSI_HOME0 = new Set([...CHANNEL_HOME, ...CHANNEL_HOME_AGGIUNTI].map((c) => c.slug));

export async function leggiHomes(): Promise<Home[]> {
  const salvate = await leggi<Home[]>(K.homes);
  if (salvate && salvate.length) return [...salvate].sort((a, b) => a.ordine - b.ordine);
  const ora = Date.now();
  const l0 = layoutHome0();
  return [
    { slug: "0", nome: "Home 0", ordine: 0, stato: "attivo", bozza: l0, pubblicata: l0, aggiornato: ora, pubblicataIl: null },
    { slug: "2-0", nome: "Home 2.0", ordine: 20, stato: "bozza", bozza: structuredClone(l0), pubblicata: null, aggiornato: ora, pubblicataIl: null },
    { slug: "3-0", nome: "Home 3.0", ordine: 30, stato: "bozza", bozza: structuredClone(l0), pubblicata: null, aggiornato: ora, pubblicataIl: null },
  ];
}
export const salvaHomes = (v: Home[]) => scrivi(K.homes, v);
export const percorsoHome = (slug: string) => (slug === "0" ? "/" : `/home/${slug}`);

/* ── Channel e pagine: registro unico + aggiunti dal pannello ─────────────── */

export type ChannelRisolto = {
  slug: string;
  nome: string;
  tipo: "channel" | "pagina";
  sezione: SezioneChannel;
  pagina: string | null;
  esterno: boolean;
  scheda: string;
  logo: string | null;
  descrizione: string | null;
  attivo: boolean;
  ordine: number;
  aggiunto: boolean;
  stato: Stato | null;
  /** 04/11/2026 (round 18) — spazio vuoto non ancora compilato (solo per gli aggiunti). */
  spazio: boolean;
};

/** Channel e pagine aggiunti dal pannello: UNA scheda e UN URL, /pagina/<slug> (gli URL del registro non cambiano). */
export const schedaExtra = (e: Pick<CanaleExtra, "slug" | "tipo">) => `/pagina/${e.slug}`;

export function risolviCanali(c: Canali): ChannelRisolto[] {
  const base = CHANNEL_REGISTRO.map((r, i): ChannelRisolto => {
    const m = c.modifiche[r.slug] ?? {};
    return {
      slug: r.slug,
      nome: m.nome?.trim() || r.nome,
      tipo: "channel",
      sezione: r.sezione,
      pagina: r.pagina,
      esterno: false,
      scheda: r.scheda,
      logo: r.logo,
      descrizione: null,
      attivo: m.attivo !== false,
      ordine: m.ordine ?? (i + 1) * 10,
      aggiunto: false,
      stato: null,
      spazio: false,
    };
  });
  const extra = c.extra.map(
    (e): ChannelRisolto => ({
      slug: e.slug,
      nome: e.nome,
      tipo: e.tipo,
      sezione: e.sezione,
      pagina: e.url,
      esterno: !!e.url && e.url.startsWith("https://"),
      scheda: schedaExtra(e),
      logo: e.logo,
      descrizione: e.descrizione || null,
      attivo: e.stato === "attivo",
      ordine: e.ordine,
      aggiunto: true,
      stato: e.stato,
      spazio: !!e.spazio,
    }),
  );
  const sez = SEZIONI_CHANNEL.map((s) => s.id);
  return [...base, ...extra].sort((a, b) => sez.indexOf(a.sezione) - sez.indexOf(b.sezione) || a.ordine - b.ordine);
}

export const esisteSlug = (slug: string, c: Canali) => !!registroPerSlug(slug) || c.extra.some((e) => e.slug === slug);

/* ── programmazione: finestre di date, ripetizioni, playlist ─────────────── */

export const istante = (s: string | null) => {
  if (!s) return null;
  const [d, o] = s.split("T");
  return istanteRoma(d!, (o ?? "00:00").slice(0, 5));
};

/** La collocazione è «in programma» in questo istante? (date di inizio/fine e ripetizione, ora di Roma). */
export function inProgramma(c: Collocazione, adesso: number): boolean {
  const da = istante(c.inizio);
  const a = istante(c.fine);
  if (da !== null && adesso < da) return false;
  if (a !== null && adesso >= a) return false;
  const r = c.ripetizione;
  if (r.tipo === "sempre") return true;
  if (r.tipo === "settimanale" && r.giorni.length && !r.giorni.includes(giornoSettimana(dataRoma(adesso)))) return false;
  if (r.dalle && r.alle) {
    const ora = oraRoma(adesso);
    return r.dalle <= r.alle ? ora >= r.dalle && ora < r.alle : ora >= r.dalle || ora < r.alle;
  }
  return true;
}

export function statoProgramma(c: Collocazione, adesso: number): "in-onda" | "programmato" | "scaduto" | "fuori-orario" | "sospeso" {
  if (c.stato === "sospeso") return "sospeso";
  const da = istante(c.inizio);
  const a = istante(c.fine);
  if (a !== null && adesso >= a) return "scaduto";
  if (da !== null && adesso < da) return "programmato";
  return inProgramma(c, adesso) ? "in-onda" : "fuori-orario";
}

export type VocePubblica = {
  collocazione: string;
  scheda: string;
  titolo: string;
  descrizione: string;
  fonte: string;
  pulsante: string;
  video: Scheda["video"];
  immagine: string | null;
  destinazione: string | null;
  esterno: boolean;
  durataSec: number | null;
  posizione: number;
  passaggi: number;
  carosello: string | null;
  channel: string | null;
  playlist: string | null;
  /** Esito della verifica del video (es. incorporamento non consentito → link alla fonte). */
  verifica: Scheda["verifica"];
};

const voce = (s: Scheda, c: Collocazione): VocePubblica => ({
  collocazione: c.id,
  scheda: s.id,
  titolo: s.titolo,
  descrizione: s.descrizione,
  fonte: s.fonte,
  pulsante: s.pulsante,
  video: s.video,
  immagine: s.immagine?.url ?? (s.video?.piattaforma === "youtube" && s.video.embedId ? `https://i.ytimg.com/vi/${s.video.embedId}/hqdefault.jpg` : null),
  destinazione: s.destinazione,
  esterno: !!s.destinazione && /^https?:\/\//.test(s.destinazione),
  durataSec: s.durataSec,
  posizione: c.posizione,
  passaggi: c.passaggi,
  carosello: c.carosello,
  channel: c.channel,
  playlist: c.playlist,
  verifica: s.verifica,
});

/** Voci visibili al pubblico ADESSO per un filtro (solo schede e collocazioni attive, in programma). */
export async function vociPubbliche(filtro: (c: Collocazione) => boolean, adesso = Date.now()): Promise<VocePubblica[]> {
  const [schede, coll] = await Promise.all([leggiSchede(), leggiCollocazioni()]);
  const perId = new Map(schede.map((s) => [s.id, s]));
  return coll
    .filter((c) => c.stato === "attivo" && filtro(c) && inProgramma(c, adesso))
    .map((c) => ({ c, s: perId.get(c.schedaId) }))
    .filter((x): x is { c: Collocazione; s: Scheda } => !!x.s && x.s.stato === "attivo")
    .sort((a, b) => a.c.posizione - b.c.posizione || a.c.aggiornato - b.c.aggiornato)
    .map(({ s, c }) => voce(s, c));
}

/** Anteprima di una scheda come la vedrà il pubblico (anche in bozza): solo per il pannello. */
export const vocePerAnteprima = (s: Scheda) =>
  voce(s, { id: "anteprima", schedaId: s.id, home: null, channel: null, carosello: null, playlist: null, posizione: 0, passaggi: 1, inizio: null, fine: null, ripetizione: { tipo: "sempre", giorni: [], dalle: null, alle: null }, stato: "attivo", aggiornato: 0 });

export async function playlistPubblica(id: string, adesso = Date.now()) {
  const p = (await leggiPlaylist()).find((x) => x.id === id);
  if (!p || p.stato !== "attivo") return null;
  const voci = await vociPubbliche((c) => c.playlist === id, adesso);
  /* Ripetizioni: ogni voce compare `passaggi` volte per giro, distribuite nel giro. */
  const sequenza: VocePubblica[] = [];
  const max = Math.max(1, ...voci.map((v) => v.passaggi));
  for (let giro = 0; giro < max; giro++) for (const v of voci) if (v.passaggi > giro) sequenza.push(v);
  /* Video con incorporamento rifiutato dalla fonte: fuori dal player (restano come link nelle schede). */
  const esclusi = voci.filter((v) => v.video && v.verifica?.esito === "errore").map((v) => ({ titolo: v.titolo, motivo: v.verifica!.messaggio, url: v.video!.url }));
  const conVideo = sequenza.filter((v) => v.video && v.video.piattaforma !== "pagina" && v.verifica?.esito !== "errore");
  const senzaDurata = conVideo.filter((v) => !v.durataSec).length;
  const totale = conVideo.reduce((t, v) => t + (v.durataSec ?? 0), 0);
  return { id: p.id, nome: p.nome, modalita: p.modalita, ciclo: p.ciclo, ancora: p.ancora, sequenza: conVideo, durataTotaleSec: totale, senzaDurata, esclusi, adesso };
}

/* ── catalogo pubblico: Home attive, Channel e pagine aggiunti (guida, zapping, ricerca) ── */

export async function catalogoPubblico() {
  const [homes, canali] = await Promise.all([leggiHomes(), leggiCanali()]);
  return {
    homes: homes.filter((h) => h.stato === "attivo" && (h.slug === "0" || h.pubblicata)).map((h) => ({ slug: h.slug, nome: h.nome, percorso: percorsoHome(h.slug) })),
    extra: risolviCanali(canali)
      .filter((c) => c.aggiunto && c.attivo && !c.spazio)
      .map((c) => ({ slug: c.slug, nome: c.nome, tipo: c.tipo, sezione: c.sezione, percorso: c.scheda, logo: c.logo, descrizione: c.descrizione })),
    /** Channel del registro spenti dal pannello (mai i 28 ufficiali). */
    spenti: Object.entries(canali.modifiche)
      .filter(([s, m]) => m.attivo === false && !FISSI_HOME0.has(s))
      .map(([s]) => s),
  };
}

export type RisultatoCms = { id: string; titolo: string; tipo: string; dettaglio: string | null; to: string; esterno: string | null };

export async function indiceRicercaCms(): Promise<RisultatoCms[]> {
  const [cat, voci] = await Promise.all([catalogoPubblico(), vociPubbliche(() => true)]);
  const out: RisultatoCms[] = [];
  for (const h of cat.homes) if (h.slug !== "0") out.push({ id: `cms-home-${h.slug}`, titolo: h.nome, tipo: "Home", dettaglio: null, to: h.percorso, esterno: null });
  for (const e of cat.extra) out.push({ id: `cms-${e.tipo}-${e.slug}`, titolo: e.nome, tipo: e.tipo === "pagina" ? "Pagina" : "Channel", dettaglio: e.descrizione, to: e.percorso, esterno: null });
  const viste = new Set<string>();
  for (const v of voci) {
    if (viste.has(v.scheda)) continue;
    viste.add(v.scheda);
    const dest = v.destinazione ?? v.video?.url ?? null;
    if (!dest) continue;
    const esterno = /^https?:\/\//.test(dest);
    out.push({ id: `cms-scheda-${v.scheda}`, titolo: v.titolo, tipo: "Contenuto", dettaglio: v.fonte || v.descrizione.slice(0, 120) || null, to: esterno ? "/" : dest, esterno: esterno ? dest : null });
  }
  return out;
}
