/**
 * ────────────────────────────────────────────────────────────────────────────────
 * J.C. HUGÒ RADIO — motore del palinsesto automatico 24/7.
 *
 * Regola madre: la scaletta di un giorno è un ordine casuale FISSO per quella data
 * (ora di Roma). Chiunque apra la radio — sito, app, TV — calcola la stessa scaletta e
 * sente lo stesso brano nello stesso secondo. Niente server di streaming separato.
 *
 * · Brani: solo dal catalogo unico (`catalogoCompleto()`), non nascosti, con una
 *   sorgente trasmissibile e una durata reale fra 1:30 e 10:00. Un brano = una sola
 *   versione al giorno (scelta dalla data).
 * · Pausa pubblicitaria: al primo cambio brano dopo 12 minuti, mai oltre i 15.
 * · Fasce DM: negli orari confermati del palinsesto DM la musica lascia il posto alla
 *   diretta dal canale YouTube ufficiale DM.
 * ────────────────────────────────────────────────────────────────────────────────
 */
import { catalogoCompleto, type BranoCatalogo, type SorgenteBrano } from "./catalogo-musicale";
import { PALINSESTO_DM } from "../data/tbh";
import { GIORNI } from "../data/palinsesto";
import {
  DM_RADIO,
  DURATE_YOUTUBE,
  ESCLUSI_ROTAZIONE,
  REGOLE_RADIO,
  RADIO,
  SIGLA_SPOT,
  SPOT_GRUPPO,
  STAGIONALI,
  type SpotRadio,
} from "../data/radio";
import type { RubricaId } from "../data/touch-canali";

const FUSO = RADIO.fuso;

/* ════════════════════════════════════════════════════════════════════════════════
   1 · ORA DI ROMA
   ════════════════════════════════════════════════════════════════════════════════ */

const formatoRoma = new Intl.DateTimeFormat("en-CA", {
  timeZone: FUSO,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hourCycle: "h23",
});

function partiRoma(ms: number) {
  const p: Record<string, string> = {};
  for (const x of formatoRoma.formatToParts(new Date(ms))) p[x.type] = x.value;
  return {
    anno: Number(p.year),
    mese: Number(p.month),
    giorno: Number(p.day),
    ora: Number(p.hour),
    minuto: Number(p.minute),
    secondo: Number(p.second),
  };
}

/** Differenza (ms) fra l'ora di Roma e UTC in quell'istante. */
function scartoRoma(ms: number): number {
  const p = partiRoma(ms);
  const comeUtc = Date.UTC(p.anno, p.mese - 1, p.giorno, p.ora, p.minuto, p.secondo);
  return comeUtc - Math.floor(ms / 1000) * 1000;
}

/** L'istante (ms) di un'ora «da orologio» di Roma: data YYYY-MM-DD + hh:mm. */
export function istanteRoma(data: string, ora = "00:00"): number {
  const [a, m, g] = data.split("-").map(Number);
  const [h, min] = ora.split(":").map(Number);
  const ingenuo = Date.UTC(a!, m! - 1, g!, h ?? 0, min ?? 0, 0);
  let t = ingenuo - scartoRoma(ingenuo);
  t = ingenuo - scartoRoma(t); // seconda passata: corregge i giorni del cambio d'ora
  return t;
}

/** La data di Roma (YYYY-MM-DD) di un istante. */
export function dataRoma(ms: number): string {
  const p = partiRoma(ms);
  return `${p.anno}-${String(p.mese).padStart(2, "0")}-${String(p.giorno).padStart(2, "0")}`;
}

export function giornoDopo(data: string, n = 1): string {
  const [a, m, g] = data.split("-").map(Number);
  const d = new Date(Date.UTC(a!, m! - 1, g! + n, 12));
  return d.toISOString().slice(0, 10);
}

/** 1 = lunedì … 7 = domenica. */
export function giornoSettimana(data: string): number {
  const [a, m, g] = data.split("-").map(Number);
  const d = new Date(Date.UTC(a!, m! - 1, g!, 12)).getUTCDay();
  return d === 0 ? 7 : d;
}

export function oraRoma(ms: number): string {
  const p = partiRoma(ms);
  return `${String(p.ora).padStart(2, "0")}:${String(p.minuto).padStart(2, "0")}`;
}

/* ════════════════════════════════════════════════════════════════════════════════
   2 · CASO FISSO PER DATA
   ════════════════════════════════════════════════════════════════════════════════ */

function seme(testo: string): number {
  let h = 2166136261;
  for (let i = 0; i < testo.length; i++) {
    h ^= testo.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function generatore(s: number) {
  let a = s;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function mescola<T>(lista: T[], caso: () => number): T[] {
  const a = [...lista];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(caso() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}

/* ════════════════════════════════════════════════════════════════════════════════
   3 · I BRANI IN ROTAZIONE
   ════════════════════════════════════════════════════════════════════════════════ */

export type FonteRadio =
  | { tipo: "audio"; piattaforma: "suno"; src: string }
  | { tipo: "youtube"; piattaforma: "youtube"; videoId: string };

export type BranoRadio = {
  branoId: string;
  titolo: string;
  artista: string | null;
  cover: string | null;
  durataSec: number;
  fonte: FonteRadio;
  /** Link pubblico alla pagina originale del brano (Suno o YouTube). */
  link: string;
  versione: string | null;
};

function inStagione(id: string, data: string): boolean {
  const s = STAGIONALI[id];
  if (!s) return true;
  const md = data.slice(5);
  return s.da <= s.a ? md >= s.da && md <= s.a : md >= s.da || md <= s.a;
}

function durata(s: SorgenteBrano): number | null {
  if (s.durataSec) return Math.round(s.durataSec);
  if (s.piattaforma === "youtube" && s.idEsterno) return DURATE_YOUTUBE[s.idEsterno] ?? null;
  return null;
}

function trasmissibile(s: SorgenteBrano, data: string): boolean {
  if (!s.idEsterno) return false;
  if (s.piattaforma !== "suno" && s.piattaforma !== "youtube") return false;
  if (s.tipo === "videoclip") return false;
  if (ESCLUSI_ROTAZIONE.includes(s.idEsterno) || !inStagione(s.idEsterno, data)) return false;
  const d = durata(s);
  return !!d && d >= REGOLE_RADIO.durataMinSec && d <= REGOLE_RADIO.durataMaxSec;
}

function branoRadio(b: BranoCatalogo, s: SorgenteBrano): BranoRadio {
  const id = s.idEsterno!;
  return {
    branoId: b.id,
    titolo: b.titolo,
    artista: b.artista,
    cover: b.cover ?? s.cover,
    durataSec: durata(s)!,
    fonte:
      s.piattaforma === "suno"
        ? { tipo: "audio", piattaforma: "suno", src: `https://cdn1.suno.ai/${id}.mp4` }
        : { tipo: "youtube", piattaforma: "youtube", videoId: id },
    link: s.piattaforma === "suno" ? `https://suno.com/song/${id}` : `https://www.youtube.com/watch?v=${id}`,
    versione: s.versione,
  };
}

/**
 * Un brano entra in rotazione con UNA sorgente: l'audio Suno quando c'è (è il master
 * audio), altrimenti il visual audio YouTube. Fra due versioni Suno sceglie la data.
 */
function rotazione(catalogo: BranoCatalogo[], data: string): BranoRadio[] {
  const caso = generatore(seme(`versioni-${data}`));
  const out: BranoRadio[] = [];
  for (const b of catalogo) {
    if (b.nascosto) continue;
    const valide = b.sorgenti.filter((s) => trasmissibile(s, data));
    const suno = valide.filter((s) => s.piattaforma === "suno");
    const scelta = suno.length
      ? suno[Math.floor(caso() * suno.length)]!
      : (valide.find((s) => s.principale) ?? valide[0]);
    if (scelta) out.push(branoRadio(b, scelta));
  }
  return out;
}

/* ════════════════════════════════════════════════════════════════════════════════
   4 · LA SCALETTA DEL GIORNO
   ════════════════════════════════════════════════════════════════════════════════ */

export type ElementoRadio = {
  /** Istanti assoluti (ms, epoch): ogni dispositivo li confronta col suo orologio corretto. */
  inizio: number;
  fine: number;
  ora: string;
  durataSec: number;
  /** Rubrica del palinsesto a cui appartiene il passaggio; null = pausa pubblicitaria. */
  rubrica: RubricaId | null;
} & (
  | ({ tipo: "brano" } & BranoRadio)
  | {
      tipo: "spot";
      sigla: boolean;
      titolo: string;
      inserzionista: string;
      videoId: string;
      link: string;
    }
  | {
      tipo: "dm";
      titolo: string;
      descrizione: string;
      slug: string;
      embed: string;
      link: string;
      repliche: string;
    }
);

type Fascia = { inizio: number; fine: number; programma: (typeof PALINSESTO_DM)[number] };

function fasceDm(data: string): Fascia[] {
  const g = giornoSettimana(data);
  return PALINSESTO_DM.filter((p) => p.giorno === g && p.ora)
    .map((p) => {
      const inizio = istanteRoma(data, p.ora!);
      return { inizio, fine: inizio + p.durataMin * 60_000, programma: p };
    })
    .sort((a, b) => a.inizio - b.inizio);
}

function elementoSpot(s: SpotRadio, inizio: number, sigla: boolean): ElementoRadio {
  return {
    tipo: "spot",
    rubrica: null,
    sigla,
    titolo: s.titolo,
    inserzionista: s.inserzionista,
    videoId: s.id,
    link: s.youtube,
    inizio,
    fine: inizio + s.durataSec * 1000,
    ora: oraRoma(inizio),
    durataSec: s.durataSec,
  };
}

function scalettaGiorno(data: string, brani: BranoRadio[]): ElementoRadio[] {
  const caso = generatore(seme(`jc-hugo-radio-${data}`));
  const inizioGiorno = istanteRoma(data);
  const fineGiorno = istanteRoma(giornoDopo(data));
  const fasce = fasceDm(data);

  // Finestre musicali: il giorno meno le fasce DM.
  const finestre: { da: number; a: number }[] = [];
  let cursore = inizioGiorno;
  for (const f of fasce) {
    if (f.inizio > cursore) finestre.push({ da: cursore, a: f.inizio });
    cursore = Math.max(cursore, f.fine);
  }
  if (cursore < fineGiorno) finestre.push({ da: cursore, a: fineGiorno });

  const out: ElementoRadio[] = [];
  let coda: BranoRadio[] = [];
  let ultimo: string | null = null;
  const prossimaCoda = () => {
    const nuova = mescola(brani, caso);
    // Mai lo stesso brano due volte di fila al cambio giro.
    if (nuova.length > 1 && nuova[0]!.branoId === ultimo) nuova.push(nuova.shift()!);
    return nuova;
  };
  let spotIndice = Math.floor(caso() * Math.max(1, SPOT_GRUPPO.length));

  for (const w of finestre) {
    let t = w.da;
    let dallaPausa = 0;
    while (t < w.a && brani.length) {
      if (!coda.length) coda = prossimaCoda();
      const spazio = REGOLE_RADIO.spotMaxSec - dallaPausa;
      let i = coda.findIndex((b) => b.durataSec <= spazio);
      const pausa = dallaPausa >= REGOLE_RADIO.spotDopoSec || (i < 0 && dallaPausa > 0);

      if (pausa && SPOT_GRUPPO.length) {
        const blocco: { s: SpotRadio; sigla: boolean }[] = [{ s: SIGLA_SPOT, sigla: true }];
        for (let k = 0; k < REGOLE_RADIO.spotPerPausa; k++) {
          blocco.push({ s: SPOT_GRUPPO[spotIndice % SPOT_GRUPPO.length]!, sigla: false });
          spotIndice++;
        }
        for (const { s, sigla } of blocco) {
          if (t >= w.a) break;
          const e = elementoSpot(s, t, sigla);
          e.fine = Math.min(e.fine, w.a);
          out.push(e);
          t = e.fine;
        }
        dallaPausa = 0;
        continue;
      }

      if (i < 0) i = 0;
      const b = coda.splice(i, 1)[0]!;
      const fine = Math.min(t + b.durataSec * 1000, w.a);
      out.push({ tipo: "brano", rubrica: "touch-music", ...b, inizio: t, fine, ora: oraRoma(t), durataSec: b.durataSec });
      ultimo = b.branoId;
      dallaPausa += b.durataSec;
      t = fine;
    }
  }

  for (const f of fasce) {
    const p = f.programma;
    out.push({
      tipo: "dm",
      rubrica: "dm-on-air",
      titolo: p.name,
      descrizione: p.descrizione,
      slug: p.slug,
      embed: DM_RADIO.live,
      link: DM_RADIO.youtube,
      repliche: DM_RADIO.repliche,
      inizio: f.inizio,
      fine: f.fine,
      ora: oraRoma(f.inizio),
      durataSec: p.durataMin * 60,
    });
  }
  return out.sort((a, b) => a.inizio - b.inizio);
}

/* ════════════════════════════════════════════════════════════════════════════════
   5 · CACHE E LETTURE PUBBLICHE
   ════════════════════════════════════════════════════════════════════════════════ */

const DURATA_CACHE = 10 * 60_000;
let cacheCatalogo: { quando: number; catalogo: BranoCatalogo[] } | null = null;
const cacheScalette = new Map<string, { quando: number; elementi: ElementoRadio[]; brani: number }>();

async function catalogo(): Promise<BranoCatalogo[]> {
  if (cacheCatalogo && Date.now() - cacheCatalogo.quando < DURATA_CACHE) return cacheCatalogo.catalogo;
  const c = await catalogoCompleto();
  cacheCatalogo = { quando: Date.now(), catalogo: c };
  return c;
}

export async function scaletta(data: string) {
  const c = cacheScalette.get(data);
  if (c && Date.now() - c.quando < DURATA_CACHE) return c;
  const brani = rotazione(await catalogo(), data);
  const elementi = scalettaGiorno(data, brani);
  const voce = { quando: Date.now(), elementi, brani: brani.length };
  cacheScalette.set(data, voce);
  if (cacheScalette.size > 20) cacheScalette.delete(cacheScalette.keys().next().value!);
  return voce;
}

export function nomeGiorno(data: string): string {
  return GIORNI[giornoSettimana(data)] ?? "";
}

/** La settimana: per ogni giorno le fasce (musica / DM), senza il dettaglio dei brani. */
export function settimanaDa(data: string) {
  return Array.from({ length: 7 }, (_, i) => {
    const d = giornoDopo(data, i);
    const fasce = fasceDm(d);
    const blocchi: { da: string; a: string; tipo: "musica" | "dm"; rubrica: RubricaId; titolo: string }[] = [];
    let cursore = "00:00";
    for (const f of fasce) {
      const da = oraRoma(f.inizio);
      if (da > cursore)
        blocchi.push({ da: cursore, a: da, tipo: "musica", rubrica: "touch-music", titolo: "TOUCH MUSIC · Musica originale J.C. Hugò" });
      const a = oraRoma(f.fine);
      blocchi.push({ da, a, tipo: "dm", rubrica: "dm-on-air", titolo: `DM ON AIR — ${f.programma.name}` });
      cursore = a;
    }
    blocchi.push({ da: cursore, a: "24:00", tipo: "musica", rubrica: "touch-music", titolo: "TOUCH MUSIC · Musica originale J.C. Hugò" });
    return { data: d, giorno: nomeGiorno(d), blocchi };
  });
}
