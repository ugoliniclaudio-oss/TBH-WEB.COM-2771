import { and, eq } from "drizzle-orm";
import { db } from "../database";
import * as schema from "../database/schema";
import { AMBIENTE, chiaveAmbito } from "./ambiente";

/**
 * INTERRUTTORE DELLA HOME (fase 2 «Canale 0», 18/10/2026).
 *
 *   classica → `/` mostra la home precedente (pages/index.tsx), INVARIATA;
 *   canale0  → `/` mostra la home «Canale 0».
 *
 * Il valore vive nella tabella `settings` con la chiave del proprio ambito
 * (`home_attiva:staging`, `home_attiva:produzione`): cambiarlo nell'anteprima non tocca
 * il sito pubblico, e viceversa. Nessuna chiave = «classica».
 * Il ripristino è immediato: un clic nel pannello, nessuna nuova pubblicazione.
 * Ogni cambio resta nello storico `home_attiva_storico:<ambito>`.
 */
/** 28/10/2026: «tbh3» = home TBH a 5 sezioni (/channel). «classica» e «canale0» restano riattivabili. */
export type HomeAttiva = "classica" | "canale0" | "tbh3";

const CHIAVE = chiaveAmbito("home_attiva");
const STORICO = chiaveAmbito("home_attiva_storico");

async function leggi(chiave: string) {
  const [r] = await db.select().from(schema.settings).where(eq(schema.settings.key, chiave));
  return r?.value ?? null;
}

async function scrivi(chiave: string, value: string) {
  await db.insert(schema.settings).values({ key: chiave, value }).onConflictDoUpdate({ target: schema.settings.key, set: { value } });
}

export async function homeAttiva(): Promise<HomeAttiva> {
  const v = await leggi(CHIAVE);
  return v === "canale0" || v === "tbh3" ? v : "classica";
}

export type VoceStorico = { quando: number; da: HomeAttiva; a: HomeAttiva };

export async function storicoHome(): Promise<VoceStorico[]> {
  try {
    return JSON.parse((await leggi(STORICO)) ?? "[]") as VoceStorico[];
  } catch {
    return [];
  }
}

export async function impostaHome(a: HomeAttiva) {
  const da = await homeAttiva();
  await scrivi(CHIAVE, a);
  const storico = [{ quando: Date.now(), da, a }, ...(await storicoHome())].slice(0, 50);
  await scrivi(STORICO, JSON.stringify(storico));
  return { da, a, ambiente: AMBIENTE };
}

/**
 * Solo nel sito pubblico: copia nell'ambito «produzione» le scelte fatte e collaudate
 * nell'anteprima (impostazioni, fasce orarie, contenuti aggiunti a mano, ordine, durata,
 * frequenza e contenuti spenti). Lo staging viene SOLO letto, mai modificato.
 */
export async function importaDaStaging() {
  if (AMBIENTE === "staging") throw new Error("L'importazione si esegue dal sito pubblico, non dall'anteprima.");
  const [imp, fasce, contenuti, propri] = await Promise.all([
    db.select().from(schema.channelImpostazioni).where(eq(schema.channelImpostazioni.ambiente, "staging")),
    db.select().from(schema.channelFasce).where(eq(schema.channelFasce.ambiente, "staging")),
    db.select().from(schema.channelContenuti).where(eq(schema.channelContenuti.ambiente, "staging")),
    db.select().from(schema.channelContenuti).where(eq(schema.channelContenuti.ambiente, AMBIENTE)),
  ]);
  let impostazioni = 0;
  for (const r of imp) {
    const { ambiente: _a, channel: _ch, ...valori } = r;
    await db
      .insert(schema.channelImpostazioni)
      .values({ ...r, ambiente: AMBIENTE })
      .onConflictDoUpdate({ target: [schema.channelImpostazioni.ambiente, schema.channelImpostazioni.channel], set: { ...valori, updatedAt: new Date() } });
    impostazioni++;
  }
  // Fasce: si sostituiscono quelle dell'ambito con quelle collaudate.
  await db.delete(schema.channelFasce).where(eq(schema.channelFasce.ambiente, AMBIENTE));
  for (const f of fasce) {
    const { id: _id, ambiente: _a, ...resto } = f;
    await db.insert(schema.channelFasce).values({ ...resto, ambiente: AMBIENTE });
  }
  let aggiornati = 0;
  let aggiunti = 0;
  const mappa = new Map(propri.map((p) => [`${p.channel}|${p.sorgente}`, p]));
  for (const c of contenuti) {
    const p = mappa.get(`${c.channel}|${c.sorgente}`);
    if (p) {
      await db
        .update(schema.channelContenuti)
        .set({ titolo: c.titolo, ordine: c.ordine, frequenza: c.frequenza, durataSec: c.durataSec, attivo: c.attivo, updatedAt: new Date() })
        .where(and(eq(schema.channelContenuti.id, p.id), eq(schema.channelContenuti.ambiente, AMBIENTE)));
      aggiornati++;
    } else if (c.origine === "manuale") {
      const { id: _id, ambiente: _a, createdAt: _c, updatedAt: _u, ...resto } = c;
      await db.insert(schema.channelContenuti).values({ ...resto, ambiente: AMBIENTE }).onConflictDoNothing();
      aggiunti++;
    }
  }
  return { impostazioni, fasce: fasce.length, aggiornati, aggiunti };
}
