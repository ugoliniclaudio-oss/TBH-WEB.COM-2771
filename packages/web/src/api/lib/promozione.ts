import { and, eq, like } from "drizzle-orm";
import { db } from "../database";
import * as schema from "../database/schema";
import { CANALI_PREDEFINITI, PREFISSO, leggiMeta, type CanaleTematico } from "./canali-tematici";
import { creaCopia } from "./copie-sicurezza";

/**
 * PUBBLICAZIONE DEI CANALI TEMATICI SU www.tbh-web.com (28/10/2026).
 *
 * DIAGNOSI del caso ARM WRESTLING: anteprima e sito pubblico girano sulla STESSA build ma leggono
 * righe di dati SEPARATE (api/lib/ambiente.ts). Il pannello dell'anteprima scriveva solo nelle righe
 * «staging»; il pulsante Publish di Runable pubblica il CODICE, non copia i dati. Risultato: su www
 * il canale restava ai valori iniziali (IN ALLESTIMENTO, nessun video).
 *
 * Questa funzione porta nell'ambito «produzione» ciò che è stato salvato nell'anteprima:
 *   · prima crea una copia di sicurezza (recuperabile dal pannello);
 *   · elenco dei canali: il canale dell'anteprima sostituisce quello di www con lo stesso slug;
 *     i canali che esistono solo su www restano;
 *   · contenuti: aggiunti o aggiornati per (canale, sorgente); quelli presenti solo su www NON si
 *     cancellano (si contano e si segnalano).
 * Lo staging viene solo letto.
 */

const CHIAVE_STAGING = "canali_tematici:staging";
const CHIAVE_PRODUZIONE = "canali_tematici:produzione";

async function leggiLista(chiave: string): Promise<CanaleTematico[] | null> {
  const [r] = await db.select().from(schema.settings).where(eq(schema.settings.key, chiave));
  if (!r) return null;
  try {
    const v = JSON.parse(r.value);
    return Array.isArray(v) ? (v as CanaleTematico[]) : null;
  } catch {
    return null;
  }
}

const righe = (ambiente: string, slug?: string) =>
  db
    .select()
    .from(schema.channelContenuti)
    .where(
      and(
        eq(schema.channelContenuti.ambiente, ambiente),
        slug ? eq(schema.channelContenuti.channel, PREFISSO + slug) : like(schema.channelContenuti.channel, `${PREFISSO}%`),
      ),
    );

export type ConfrontoCanale = {
  slug: string;
  nome: string;
  anteprima: { stato: string; voci: number; pubblicate: number };
  www: { stato: string; voci: number; pubblicate: number };
  allineato: boolean;
};

const pubblicata = (r: typeof schema.channelContenuti.$inferSelect) => {
  const s = leggiMeta(r).stato;
  return !!r.attivo && (s === "pubblicato" || s === "approvato");
};

/** Confronto fra anteprima e www, canale per canale (solo lettura). */
export async function confrontoTematici(): Promise<ConfrontoCanale[]> {
  const [ls, lp, rs, rp] = await Promise.all([leggiLista(CHIAVE_STAGING), leggiLista(CHIAVE_PRODUZIONE), righe("staging"), righe("produzione")]);
  const s = ls ?? CANALI_PREDEFINITI;
  const p = lp ?? CANALI_PREDEFINITI;
  const slugs = [...new Set([...s.map((c) => c.slug), ...p.map((c) => c.slug)])];
  return slugs.map((slug) => {
    const cs = s.find((c) => c.slug === slug);
    const cp = p.find((c) => c.slug === slug);
    const vs = rs.filter((r) => r.channel === PREFISSO + slug);
    const vp = rp.filter((r) => r.channel === PREFISSO + slug);
    const a = { stato: cs?.stato ?? "—", voci: vs.length, pubblicate: vs.filter(pubblicata).length };
    const w = { stato: cp?.stato ?? "—", voci: vp.length, pubblicate: vp.filter(pubblicata).length };
    const ordineS = vs.filter(pubblicata).sort((x, y) => x.ordine - y.ordine).map((r) => r.sorgente).join("|");
    const ordineP = vp.filter(pubblicata).sort((x, y) => x.ordine - y.ordine).map((r) => r.sorgente).join("|");
    const impostazioni = (c?: CanaleTematico) => (c ? JSON.stringify([c.stato, c.abilitato, c.riproduzione, c.cicloH24, c.secondiImmagine, c.nome, c.ordine]) : "");
    return {
      slug,
      nome: cs?.nome ?? cp?.nome ?? slug,
      anteprima: a,
      www: w,
      allineato: impostazioni(cs) === impostazioni(cp) && ordineS === ordineP,
    };
  });
}

export async function promuoviTematici(slug?: string) {
  const copia = await creaCopia(`Automatica prima di pubblicare su www ${slug ? `il canale tematico «${slug}»` : "tutti i canali tematici"}`);
  const s = (await leggiLista(CHIAVE_STAGING)) ?? CANALI_PREDEFINITI;
  const p = [...((await leggiLista(CHIAVE_PRODUZIONE)) ?? CANALI_PREDEFINITI)];
  const daPortare = slug ? s.filter((c) => c.slug === slug) : s;
  if (slug && !daPortare.length) throw new Error(`Canale «${slug}» non trovato nell'anteprima.`);
  for (const c of daPortare) {
    const i = p.findIndex((x) => x.slug === c.slug);
    if (i >= 0) p[i] = c;
    else p.push(c);
  }
  const value = JSON.stringify(p);
  await db.insert(schema.settings).values({ key: CHIAVE_PRODUZIONE, value }).onConflictDoUpdate({ target: schema.settings.key, set: { value } });

  const [rs, rp] = await Promise.all([righe("staging", slug), righe("produzione", slug)]);
  const slugsPortati = new Set(daPortare.map((c) => PREFISSO + c.slug));
  const mappa = new Map(rp.map((r) => [`${r.channel}|${r.sorgente}`, r]));
  let aggiunti = 0;
  let aggiornati = 0;
  for (const r of rs) {
    if (!slugsPortati.has(r.channel)) continue;
    const valori = {
      tipo: r.tipo,
      titolo: r.titolo,
      descrizione: r.descrizione,
      link: r.link,
      durataSec: r.durataSec,
      ordine: r.ordine,
      frequenza: r.frequenza,
      attribuzione: r.attribuzione,
      origine: r.origine,
      fonte: r.fonte,
      attivo: r.attivo,
    };
    const esiste = mappa.get(`${r.channel}|${r.sorgente}`);
    if (esiste) {
      await db.update(schema.channelContenuti).set({ ...valori, updatedAt: new Date() }).where(eq(schema.channelContenuti.id, esiste.id));
      aggiornati++;
    } else {
      await db.insert(schema.channelContenuti).values({ ...valori, ambiente: "produzione", channel: r.channel, sorgente: r.sorgente }).onConflictDoNothing();
      aggiunti++;
    }
  }
  const chiaviS = new Set(rs.map((r) => `${r.channel}|${r.sorgente}`));
  const soloWww = rp.filter((r) => slugsPortati.has(r.channel) && !chiaviS.has(`${r.channel}|${r.sorgente}`)).length;
  return { canali: daPortare.map((c) => c.slug), aggiunti, aggiornati, conservatiSoloWww: soloWww, copia: copia.id };
}
