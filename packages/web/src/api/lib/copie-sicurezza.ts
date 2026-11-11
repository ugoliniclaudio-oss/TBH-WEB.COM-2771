import { and, desc, eq, like, notLike } from "drizzle-orm";
import { db } from "../database";
import * as schema from "../database/schema";
import { AMBIENTE } from "./ambiente";

/**
 * COPIE DI SICUREZZA (28/10/2026, richiesta di Claudio: «Prima crea una copia recuperabile; evita
 * reset distruttivi»).
 *
 * Una copia è una fotografia, salvata nella tabella `settings` (chiave `copia_sicurezza:<quando>`),
 * di tutto ciò che si imposta a mano:
 *   · le chiavi di configurazione di `settings` (canali tematici, home, CMS, spazi…) di TUTTI gli
 *     ambiti — esclusi contatori di visite e registri di sincronizzazione, che si rigenerano;
 *   · le righe di `channel_contenuti` inserite a mano (origine «manuale», canali tematici compresi)
 *     di tutti gli ambiti; le righe «auto» si ricostruiscono da sole dagli archivi;
 *   · `channel_impostazioni` e `channel_fasce`.
 * Il RIPRISTINO non cancella nulla: prima fa una nuova copia dello stato attuale, poi riscrive i
 * valori salvati (righe aggiornate o reinserite). Ciò che è nato dopo la copia resta al suo posto.
 */

const PREFISSO = "copia_sicurezza:";
/** Le copie pesano poche decine di KB: se ne tengono le ultime 100. */
const MASSIMO = 100;
const ESCLUSE = /^(copia_sicurezza:|visite$|pagine$|contatore_inizio$|channel_sync_ultimo)/;

type Riga = typeof schema.channelContenuti.$inferSelect;
type Fotografia = {
  v: 1;
  id: string;
  quando: number;
  motivo: string;
  daAmbiente: string;
  settings: { key: string; value: string }[];
  contenuti: (Omit<Riga, "createdAt" | "updatedAt"> & { createdAt: number; updatedAt: number })[];
  impostazioni: (Omit<typeof schema.channelImpostazioni.$inferSelect, "updatedAt"> & { updatedAt: number })[];
  fasce: (Omit<typeof schema.channelFasce.$inferSelect, "createdAt"> & { createdAt: number })[];
};

export type CopiaInElenco = {
  id: string;
  quando: number;
  motivo: string;
  daAmbiente: string;
  voci: { settings: number; contenuti: number; impostazioni: number; fasce: number };
  kb: number;
};

const riassunto = (f: Fotografia, kb: number): CopiaInElenco => ({
  id: f.id,
  quando: f.quando,
  motivo: f.motivo,
  daAmbiente: f.daAmbiente,
  voci: { settings: f.settings.length, contenuti: f.contenuti.length, impostazioni: f.impostazioni.length, fasce: f.fasce.length },
  kb,
});

export async function creaCopia(motivo: string): Promise<CopiaInElenco> {
  const [set, cont, imp, fasce] = await Promise.all([
    db.select().from(schema.settings).where(notLike(schema.settings.key, `${PREFISSO}%`)),
    db.select().from(schema.channelContenuti).where(eq(schema.channelContenuti.origine, "manuale")),
    db.select().from(schema.channelImpostazioni),
    db.select().from(schema.channelFasce),
  ]);
  const quando = Date.now();
  const f: Fotografia = {
    v: 1,
    id: String(quando),
    quando,
    motivo: motivo.slice(0, 200),
    daAmbiente: AMBIENTE,
    settings: set.filter((s) => !ESCLUSE.test(s.key)),
    contenuti: cont.map((c) => ({ ...c, createdAt: c.createdAt.getTime(), updatedAt: c.updatedAt.getTime() })),
    impostazioni: imp.map((i) => ({ ...i, updatedAt: i.updatedAt.getTime() })),
    fasce: fasce.map((x) => ({ ...x, createdAt: x.createdAt.getTime() })),
  };
  const value = JSON.stringify(f);
  await db.insert(schema.settings).values({ key: PREFISSO + f.id, value }).onConflictDoUpdate({ target: schema.settings.key, set: { value } });
  // Si tengono le ultime MASSIMO copie (le più vecchie escono dalla rotazione).
  const tutte = await db.select({ key: schema.settings.key }).from(schema.settings).where(like(schema.settings.key, `${PREFISSO}%`)).orderBy(desc(schema.settings.key));
  for (const vecchia of tutte.slice(MASSIMO)) await db.delete(schema.settings).where(eq(schema.settings.key, vecchia.key));
  return riassunto(f, Math.round(value.length / 1024));
}

async function leggiCopia(id: string): Promise<{ f: Fotografia; kb: number } | null> {
  const [r] = await db.select().from(schema.settings).where(eq(schema.settings.key, PREFISSO + id));
  if (!r) return null;
  try {
    return { f: JSON.parse(r.value) as Fotografia, kb: Math.round(r.value.length / 1024) };
  } catch {
    return null;
  }
}

export async function elencoCopie(): Promise<CopiaInElenco[]> {
  const righe = await db.select().from(schema.settings).where(like(schema.settings.key, `${PREFISSO}%`)).orderBy(desc(schema.settings.key));
  const out: CopiaInElenco[] = [];
  for (const r of righe) {
    try {
      out.push(riassunto(JSON.parse(r.value) as Fotografia, Math.round(r.value.length / 1024)));
    } catch {
      /* copia illeggibile: non si mostra */
    }
  }
  return out;
}

/**
 * Dati del pannello «Gestione contenuti e palinsesto» (cms_v1:*): il ripristino UNISCE invece di
 * sostituire — le voci della copia tornano com'erano, quelle nate dopo la copia restano.
 * Il registro errori non si ripristina (null = chiave lasciata com'è).
 */
async function unisciCms(key: string, salvato: string): Promise<string | null> {
  if (key === "cms_v1:errori") return null;
  const [r] = await db.select().from(schema.settings).where(eq(schema.settings.key, key));
  if (!r) return salvato;
  try {
    const ora = JSON.parse(r.value) as unknown;
    const prima = JSON.parse(salvato) as unknown;
    const chiaveDi = (x: Record<string, unknown>) => String(x.id ?? x.slug ?? JSON.stringify(x));
    const unisci = (a: unknown[], b: unknown[]) => {
      const dallaCopia = new Map(b.map((x) => [chiaveDi(x as Record<string, unknown>), x]));
      const nuovi = a.filter((x) => !dallaCopia.has(chiaveDi(x as Record<string, unknown>)));
      return [...b, ...nuovi];
    };
    if (Array.isArray(ora) && Array.isArray(prima)) return JSON.stringify(unisci(ora, prima));
    if (key === "cms_v1:canali" && ora && prima && typeof ora === "object" && typeof prima === "object") {
      const o = ora as { extra?: unknown[]; modifiche?: Record<string, unknown> };
      const p = prima as { extra?: unknown[]; modifiche?: Record<string, unknown> };
      return JSON.stringify({ extra: unisci(o.extra ?? [], p.extra ?? []), modifiche: { ...(o.modifiche ?? {}), ...(p.modifiche ?? {}) } });
    }
    return salvato;
  } catch {
    return salvato;
  }
}

/** Ripristino NON distruttivo: copia dello stato attuale, poi riscrittura dei valori salvati. */
export async function ripristinaCopia(id: string) {
  const letta = await leggiCopia(id);
  if (!letta) throw new Error("Copia non trovata.");
  const { f } = letta;
  const prima = await creaCopia(`Automatica prima del ripristino della copia del ${new Date(f.quando).toISOString()}`);
  for (const s of f.settings) {
    const value = s.key.startsWith("cms_v1:") ? await unisciCms(s.key, s.value) : s.value;
    if (value === null) continue;
    await db.insert(schema.settings).values({ key: s.key, value }).onConflictDoUpdate({ target: schema.settings.key, set: { value } });
  }
  let aggiornati = 0;
  let reinseriti = 0;
  for (const c of f.contenuti) {
    const { id: _id, createdAt, updatedAt: _u, ...valori } = c;
    const [esiste] = await db
      .select({ id: schema.channelContenuti.id })
      .from(schema.channelContenuti)
      .where(and(eq(schema.channelContenuti.ambiente, c.ambiente), eq(schema.channelContenuti.channel, c.channel), eq(schema.channelContenuti.sorgente, c.sorgente)));
    if (esiste) {
      await db.update(schema.channelContenuti).set({ ...valori, updatedAt: new Date() }).where(eq(schema.channelContenuti.id, esiste.id));
      aggiornati++;
    } else {
      await db.insert(schema.channelContenuti).values({ ...valori, createdAt: new Date(createdAt), updatedAt: new Date() });
      reinseriti++;
    }
  }
  for (const i of f.impostazioni) {
    const { ambiente, channel, updatedAt: _u, ...valori } = i;
    await db
      .insert(schema.channelImpostazioni)
      .values({ ...i, updatedAt: new Date() })
      .onConflictDoUpdate({ target: [schema.channelImpostazioni.ambiente, schema.channelImpostazioni.channel], set: { ...valori, updatedAt: new Date() } });
    void ambiente;
    void channel;
  }
  for (const x of f.fasce) {
    await db
      .insert(schema.channelFasce)
      .values({ ...x, createdAt: new Date(x.createdAt) })
      .onConflictDoNothing();
  }
  return { ripristinata: f.id, copiaPrimaDelRipristino: prima.id, settings: f.settings.length, aggiornati, reinseriti, impostazioni: f.impostazioni.length, fasce: f.fasce.length };
}
