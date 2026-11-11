/* ────────────────────────────────────────────────────────────────────────────
   TERRITORIO TBH — ARCHIVIO UNICO E FUNZIONI DI LETTURA

   Qui si entra nell'archivio: le tre città stanno in tre file separati, questo
   file le raccoglie e offre le funzioni con cui le pagine leggono i dati.

   Nessuna funzione qui dentro inventa un dato: costruisce un collegamento solo
   quando il dato è già in scheda, e restituisce `null` quando non c'è. Un
   pulsante che non porta in nessun posto non deve poter nascere.
   ──────────────────────────────────────────────────────────────────────────── */

import type { AttivitaTBH, CittaSlug, CittaTBH } from "./tipi";
import { CATEGORIE_TBH, CITTA_TBH, DINTORNI_TBH } from "./tipi";
import { RIMINI } from "./rimini";
import { SANREMO } from "./sanremo";
import { PADOVA } from "./padova";

export * from "./tipi";
export { RIMINI } from "./rimini";
export { SANREMO } from "./sanremo";
export { PADOVA } from "./padova";

/** Tutte le schede master del Territorio TBH, nelle tre città. */
export const TERRITORIO_TBH: AttivitaTBH[] = [...RIMINI, ...SANREMO, ...PADOVA];

/* ── CITTÀ ──────────────────────────────────────────────────────────────── */

export function citta(slug: string): CittaTBH | null {
  return CITTA_TBH.find((c) => c.slug === slug) ?? null;
}

/** La città capofila di una scheda: un dintorno risponde con la sua città. */
export function cittaCapofila(slug: CittaSlug): CittaSlug {
  return DINTORNI_TBH[slug]?.dentro ?? slug;
}

/** Le schede di una città, dintorni compresi. */
export function attivitaCitta(slug: string): AttivitaTBH[] {
  return TERRITORIO_TBH.filter((a) => cittaCapofila(a.citta) === slug);
}

/** Come si legge la località di una scheda: il dintorno lo dichiara. */
export function etichettaLuogo(a: AttivitaTBH): string {
  const dintorno = DINTORNI_TBH[a.citta];
  if (dintorno) return dintorno.etichetta;
  const c = citta(a.citta);
  return c ? `${c.nome} · ${c.area}` : a.citta;
}

/* ── CATEGORIE ──────────────────────────────────────────────────────────── */

/** Le schede di una categoria dentro una città. Una scheda in due categorie
    compare in entrambe restando un solo record. */
export function attivitaPerCategoria(cittaSlug: string, categoriaSlug: string): AttivitaTBH[] {
  return attivitaCitta(cittaSlug).filter((a) => a.categorie.includes(categoriaSlug));
}

/** Le categorie che in questa città hanno almeno una scheda, nell'ordine TBH. */
export function categorieCitta(cittaSlug: string) {
  const dentro = attivitaCitta(cittaSlug);
  return CATEGORIE_TBH.map((c) => ({
    ...c,
    attivita: dentro.filter((a) => a.categorie.includes(c.slug)),
  })).filter((c) => c.attivita.length > 0);
}

/* ── UNA SCHEDA ─────────────────────────────────────────────────────────── */

export function attivita(slug: string): AttivitaTBH | null {
  return TERRITORIO_TBH.find((a) => a.slug === slug) ?? null;
}

export function attivitaPerId(id: string): AttivitaTBH | null {
  return TERRITORIO_TBH.find((a) => a.id === id) ?? null;
}

/* ── COLLEGAMENTI ───────────────────────────────────────────────────────── */

/** Mappa: si costruisce solo su un indirizzo verificato. Con le coordinate in
    scheda il punto è esatto; senza coordinate si cerca per nome e indirizzo. */
export function urlMappa(a: AttivitaTBH): string | null {
  if (typeof a.lat === "number" && typeof a.lon === "number") {
    return `https://www.google.com/maps/search/?api=1&query=${a.lat}%2C${a.lon}`;
  }
  const indirizzo = (a.indirizzo ?? "").trim();
  if (!indirizzo) return null;
  const luogo = citta(cittaCapofila(a.citta))?.nome ?? "";
  const query = [a.nome, indirizzo, luogo].filter(Boolean).join(", ");
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

/** Mappa incorporata nella scheda interna: solo dove c'è un punto verificato. */
export function urlMappaIncorporata(a: AttivitaTBH): string | null {
  if (typeof a.lat === "number" && typeof a.lon === "number") {
    const d = 0.004;
    const bbox = [a.lon - d, a.lat - d, a.lon + d, a.lat + d].join("%2C");
    return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${a.lat}%2C${a.lon}`;
  }
  return null;
}

/** LA SCHEDA INTERNA: dove porta APRI SCHEDA. Non si esce dalla piattaforma. */
export function percorsoScheda(a: AttivitaTBH): string {
  return `/luogo/${a.slug}`;
}

/** Chiamata: solo su un numero letto dalla fonte ufficiale. */
export function urlTelefono(a: AttivitaTBH): string | null {
  const t = (a.telefono ?? "").replace(/[^\d+]/g, "");
  return t.length >= 8 ? `tel:${t}` : null;
}

/** WhatsApp dell'attività: solo se è il suo sito a pubblicarlo. */
export function urlWhatsapp(a: AttivitaTBH): string | null {
  const n = (a.whatsapp ?? "").replace(/[^\d]/g, "");
  return n.length >= 10 ? `https://wa.me/${n}` : null;
}

/** Posta elettronica letta dalla fonte ufficiale. */
export function urlEmail(a: AttivitaTBH): string | null {
  const m = (a.email ?? "").trim();
  return m.includes("@") ? `mailto:${m}` : null;
}

/* ── STATO DELL'ARCHIVIO ────────────────────────────────────────────────── */

/** Una scheda è completa quando ha immagine, sito, indirizzo, telefono e testo. */
export function schedaCompleta(a: AttivitaTBH): boolean {
  return Boolean(a.immagine && a.sito && a.indirizzo && a.telefono && a.descrizione);
}

/** Quante schede sono complete e quante hanno ancora un dato da ricevere. */
export function contaAllestimento(cittaSlug?: string) {
  const dentro = cittaSlug ? attivitaCitta(cittaSlug) : TERRITORIO_TBH;
  const daCompletare = dentro.filter((a) => !schedaCompleta(a)).length;
  return { totale: dentro.length, daCompletare, complete: dentro.length - daCompletare };
}

/** Il riepilogo che serve alla home del Territorio: un monitor per città. */
export function monitorCitta() {
  return CITTA_TBH.map((c) => {
    const dentro = attivitaCitta(c.slug);
    return {
      ...c,
      totale: dentro.length,
      categorie: categorieCitta(c.slug).length,
      daCompletare: dentro.filter((a) => !schedaCompleta(a)).length,
    };
  });
}
