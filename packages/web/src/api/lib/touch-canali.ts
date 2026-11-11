/**
 * ────────────────────────────────────────────────────────────────────────────────
 * TOUCH RADIO / TOUCH TV — motore dei due canali sopra il palinsesto generale.
 *
 * · Modalità CONDIVISO (fase 1, oggi): i due canali leggono la stessa scaletta del
 *   palinsesto generale (`radio-palinsesto.ts`), secondo per secondo.
 * · Modalità SEPARATI (fase 2): ogni canale parte dal palinsesto generale e, nelle
 *   fasce dei SUOI spazi in calendario (`touch_palinsesto`), trasmette quegli spazi al
 *   posto del palinsesto generale. Un canale senza spazi resta sul palinsesto generale.
 *   Nessun sistema da ricostruire: si aggiungono righe dal pannello.
 *
 * Il palinsesto generale non viene mai toccato né cancellato da qui.
 * ────────────────────────────────────────────────────────────────────────────────
 */
import { and, eq } from "drizzle-orm";
import { db } from "../database";
import * as schema from "../database/schema";
import { giornoSettimana, istanteRoma, oraRoma, scaletta, type ElementoRadio } from "./radio-palinsesto";
import {
  CHIAVE_MODALITA,
  MODALITA_INIZIALE,
  RUBRICHE_ID,
  type CanaleTouchId,
  type ModalitaPalinsesto,
  type RubricaId,
} from "../data/touch-canali";

export type FormatoSpazio = "diretta" | "video" | "audio" | "spot";

/** Uno spazio del calendario di un canale, trasformato in passaggio di scaletta. */
export type ElementoProgramma = {
  inizio: number;
  fine: number;
  ora: string;
  durataSec: number;
  rubrica: RubricaId | null;
  tipo: "programma";
  formato: FormatoSpazio;
  titolo: string;
  descrizione: string | null;
  sorgente: string;
  link: string | null;
  inserzionista: string | null;
  spazioId: number;
};

export type ElementoCanale = ElementoRadio | ElementoProgramma;

type Spazio = typeof schema.touchPalinsesto.$inferSelect;

/* ── cache breve: la modalità e gli spazi cambiano solo dal pannello ─────────── */
const DURATA = 15_000;
let cacheModalita: { quando: number; valore: ModalitaPalinsesto } | null = null;
let cacheSpazi: { quando: number; righe: Spazio[] } | null = null;

export function svuotaCacheCanali() {
  cacheModalita = null;
  cacheSpazi = null;
}

export async function modalitaPalinsesto(): Promise<ModalitaPalinsesto> {
  if (cacheModalita && Date.now() - cacheModalita.quando < DURATA) return cacheModalita.valore;
  let valore: ModalitaPalinsesto = MODALITA_INIZIALE;
  try {
    const [r] = await db.select().from(schema.settings).where(eq(schema.settings.key, CHIAVE_MODALITA));
    if (r?.value === "separati" || r?.value === "condiviso") valore = r.value;
  } catch {
    /* tabella non raggiungibile: resta il palinsesto condiviso */
  }
  cacheModalita = { quando: Date.now(), valore };
  return valore;
}

export async function impostaModalita(valore: ModalitaPalinsesto) {
  await db
    .insert(schema.settings)
    .values({ key: CHIAVE_MODALITA, value: valore })
    .onConflictDoUpdate({ target: schema.settings.key, set: { value: valore } });
  svuotaCacheCanali();
}

export async function spaziAttivi(): Promise<Spazio[]> {
  if (cacheSpazi && Date.now() - cacheSpazi.quando < DURATA) return cacheSpazi.righe;
  let righe: Spazio[] = [];
  try {
    righe = await db.select().from(schema.touchPalinsesto).where(eq(schema.touchPalinsesto.attivo, 1));
  } catch {
    righe = [];
  }
  cacheSpazi = { quando: Date.now(), righe };
  return righe;
}

export async function spaziCanale(canale: CanaleTouchId) {
  try {
    return await db
      .select()
      .from(schema.touchPalinsesto)
      .where(and(eq(schema.touchPalinsesto.canale, canale)));
  } catch {
    return [];
  }
}

function rubricaValida(r: string): RubricaId | null {
  return (RUBRICHE_ID as readonly string[]).includes(r) ? (r as RubricaId) : null;
}

function spazioInScaletta(s: Spazio, data: string): ElementoProgramma {
  const inizio = istanteRoma(data, s.ora);
  return {
    tipo: "programma",
    formato: s.tipo as FormatoSpazio,
    rubrica: s.tipo === "spot" ? null : rubricaValida(s.rubrica),
    titolo: s.titolo,
    descrizione: s.descrizione,
    sorgente: s.sorgente,
    link: s.link,
    inserzionista: s.inserzionista,
    spazioId: s.id,
    inizio,
    fine: inizio + s.durataMin * 60_000,
    ora: oraRoma(inizio),
    durataSec: s.durataMin * 60,
  };
}

/** Le parti di uno spazio del canale che non toccano nessuna diretta DM. */
export function fuoriDalleDirette(p: ElementoProgramma, dirette: { inizio: number; fine: number }[]): ElementoProgramma[] {
  let pezzi: ElementoProgramma[] = [p];
  for (const d of dirette) {
    pezzi = pezzi.flatMap((x) => {
      if (d.fine <= x.inizio || x.fine <= d.inizio) return [x];
      const out: ElementoProgramma[] = [];
      if (x.inizio < d.inizio) out.push({ ...x, fine: d.inizio, durataSec: (d.inizio - x.inizio) / 1000 });
      if (d.fine < x.fine) out.push({ ...x, inizio: d.fine, ora: oraRoma(d.fine), durataSec: (x.fine - d.fine) / 1000 });
      return out;
    });
  }
  return pezzi.filter((x) => x.fine - x.inizio >= 60_000);
}

export type ScalettaCanale = {
  elementi: ElementoCanale[];
  brani: number;
  modalita: ModalitaPalinsesto;
  /** condiviso = palinsesto generale · proprio = palinsesto generale + spazi del canale. */
  fonte: "condiviso" | "proprio";
  spazi: number;
};

/** La scaletta di UN canale per una data (ora di Roma). */
export async function scalettaCanale(canale: CanaleTouchId, data: string): Promise<ScalettaCanale> {
  const base = await scaletta(data);
  const modalita = await modalitaPalinsesto();
  if (modalita === "condiviso") return { elementi: base.elementi, brani: base.brani, modalita, fonte: "condiviso", spazi: 0 };

  const g = giornoSettimana(data);
  const propri = (await spaziAttivi())
    .filter((s) => s.canale === canale && (s.data ? s.data === data : s.giorno === g))
    .map((s) => spazioInScaletta(s, data))
    .sort((a, b) => a.inizio - b.inizio);
  if (!propri.length) return { elementi: base.elementi, brani: base.brani, modalita, fonte: "condiviso", spazi: 0 };

  /* Il palinsesto generale resta sotto: dove c'è uno spazio del canale, lo spazio ha la precedenza.
     Un passaggio che sconfina nello spazio si ferma all'inizio dello spazio. */
  const out: ElementoCanale[] = [];
  for (const e of base.elementi) {
    const toccati = propri.filter((p) => p.inizio < e.fine && e.inizio < p.fine);
    if (!toccati.length) {
      out.push(e);
      continue;
    }
    const primo = Math.min(...toccati.map((p) => p.inizio));
    if (e.inizio < primo) out.push({ ...e, fine: primo });
  }
  out.push(...propri);
  out.sort((a, b) => a.inizio - b.inizio);
  return { elementi: out, brani: base.brani, modalita, fonte: "proprio", spazi: propri.length };
}

/** Elemento in onda adesso, secondi trascorsi e i prossimi cinque. */
export function inOndaDa(lista: ElementoCanale[], adesso: number) {
  const i = lista.findIndex((e) => e.inizio <= adesso && adesso < e.fine);
  const corrente = i >= 0 ? lista[i]! : null;
  const dopo = i >= 0 ? i + 1 : lista.findIndex((e) => e.inizio > adesso);
  return {
    corrente,
    trascorsoSec: corrente ? Math.max(0, (adesso - corrente.inizio) / 1000) : 0,
    prossimi: dopo >= 0 ? lista.slice(dopo, dopo + 5) : [],
  };
}
