import { and, eq, gte } from "drizzle-orm";
import { z } from "zod";
import { db } from "../database";
import * as schema from "../database/schema";
import { CAROSELLI_VISIBILI } from "../data/channel-home";
import { AMBIENTE } from "./ambiente";
import { dataRoma, giornoDopo } from "./radio-palinsesto";

/**
 * CONTATORI DEI CAROSELLI — vista e clic per scheda, per giorno (ora di Roma).
 * Misura interna e leggera: un beacon dal browser, nessun GA4, nessun pixel.
 * · una riga per (carosello, scheda, tipo, ambito, sessione, giorno): ricaricare non gonfia;
 * · bot, anteprime di link e browser automatici esclusi dallo user-agent;
 * · ogni ambito (anteprima / collaudo / sito pubblico) conta solo le proprie righe.
 */

const BOT =
  /bot|crawl|spider|slurp|bing|yandex|baidu|duckduck|facebookexternalhit|embedly|preview|lighthouse|pagespeed|headless|phantom|playwright|puppeteer|selenium|python|curl|wget|httpx|axios|node-fetch|go-http|java\//i;

const evento = z.object({
  carosello: z.string().refine((s) => CAROSELLI_VISIBILI.some((k) => k.slug === s)),
  scheda: z.string().trim().min(3).max(200),
  tipo: z.enum(["vista", "clic"]),
  sessione: z.string().regex(/^[a-z0-9-]{6,60}$/),
});

export async function registraEventoCarosello(corpo: string, userAgent: string | null) {
  if (!userAgent || BOT.test(userAgent)) return { stato: 200 as const, corpo: { registrato: false, motivo: "escluso" } };
  let dati: unknown;
  try {
    dati = JSON.parse(corpo);
  } catch {
    return { stato: 400 as const, corpo: { registrato: false, errore: "corpo non leggibile" } };
  }
  const letto = evento.safeParse(dati);
  if (!letto.success) return { stato: 400 as const, corpo: { registrato: false, errore: "campi non validi" } };
  try {
    await db
      .insert(schema.caroselloEventi)
      .values({ ...letto.data, ambito: AMBIENTE, giorno: dataRoma(Date.now()) })
      .onConflictDoNothing();
    return { stato: 200 as const, corpo: { registrato: true } };
  } catch {
    return { stato: 200 as const, corpo: { registrato: false } };
  }
}

/** Conteggi per giorno e scheda degli ultimi `giorni` giorni, solo per l'ambito corrente. */
export async function conteggiCaroselli(giorni: number) {
  const oggi = dataRoma(Date.now());
  const dal = giornoDopo(oggi, -(giorni - 1));
  const righe = await db
    .select({
      carosello: schema.caroselloEventi.carosello,
      scheda: schema.caroselloEventi.scheda,
      tipo: schema.caroselloEventi.tipo,
      giorno: schema.caroselloEventi.giorno,
    })
    .from(schema.caroselloEventi)
    .where(and(eq(schema.caroselloEventi.ambito, AMBIENTE), gte(schema.caroselloEventi.giorno, dal)));

  const mappa = new Map<string, { giorno: string; carosello: string; scheda: string; viste: number; clic: number }>();
  for (const r of righe) {
    const k = `${r.giorno}|${r.carosello}|${r.scheda}`;
    const v = mappa.get(k) ?? { giorno: r.giorno, carosello: r.carosello, scheda: r.scheda, viste: 0, clic: 0 };
    if (r.tipo === "vista") v.viste++;
    else v.clic++;
    mappa.set(k, v);
  }
  const righeOut = [...mappa.values()].sort(
    (a, b) => b.giorno.localeCompare(a.giorno) || a.carosello.localeCompare(b.carosello) || b.viste - a.viste,
  );
  const perGiorno = new Map<string, { giorno: string; viste: number; clic: number }>();
  for (const r of righeOut) {
    const g = perGiorno.get(r.giorno) ?? { giorno: r.giorno, viste: 0, clic: 0 };
    g.viste += r.viste;
    g.clic += r.clic;
    perGiorno.set(r.giorno, g);
  }
  return {
    ambito: AMBIENTE,
    dal,
    al: oggi,
    giorni: [...perGiorno.values()],
    righe: righeOut,
    titoli: Object.fromEntries(CAROSELLI_VISIBILI.map((k) => [k.slug, k.titolo])),
  };
}
