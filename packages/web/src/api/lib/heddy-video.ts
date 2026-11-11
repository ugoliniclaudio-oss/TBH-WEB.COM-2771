import { HEDDY_CATEGORIE, HEDDY_FILM, HEDDY_URL, type FilmHeddy } from "../data/heddy-video";

/**
 * CATALOGO VIVO DI HEDDY.video per il Channel «Touch Cinema».
 *
 * Il server rilegge le pagine pubbliche di HEDDY.video (home + 7 categorie, robots.txt libero)
 * al massimo ogni 6 ore e unisce il risultato alla fotografia verificata del 18/10/2026
 * (api/data/heddy-video.ts):
 *  · film presente sia vivo sia in fotografia → dati della fotografia (scheda completa);
 *  · film nuovo, solo vivo → titolo, regia, durata e locandina come scritti nella card HEDDY;
 *  · film sparito dal sito vivo → esce dalla lista, e il sync del Channel lo SPEGNE (mai cancella).
 * Se HEDDY non risponde, o la lettura trova meno del 70% dei titoli della fotografia (pagina cambiata,
 * errore parziale), si usa la fotografia così com'è: nessun film viene spento per un guasto.
 */

const UA = "Mozilla/5.0 (compatible; TBH-WEB Touch Cinema; +https://www.tbh-web.com)";
const OGNI_MS = 6 * 60 * 60_000;
const ESCLUSI = new Set(["login", "cart", "faqs-heddy-video", "privacy-policy-heddy-video", "servizio-clienti-heddy-video", "termini-e-condizioni-heddy-video-", "na-mugliera-zetella"]);

export type CatalogoHeddy = { film: FilmHeddy[]; origine: "vivo" | "fotografia"; letto: number; nuovi: number; errore: string | null };

let cache: { quando: number; dati: CatalogoHeddy } | null = null;
let inCorso: Promise<CatalogoHeddy> | null = null;

async function pagina(url: string): Promise<string> {
  const r = await fetch(url, { headers: { "user-agent": UA }, signal: AbortSignal.timeout(20_000) });
  if (!r.ok) throw new Error(`${url} → HTTP ${r.status}`);
  return r.text();
}

const pulisci = (s: string) =>
  s
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&#0?39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, " ")
    .trim();

type Card = { slug: string; titolo: string | null; poster: string | null; regia: string | null; durataMin: number | null };

/** Card film di una pagina elenco (home: carosello con data-src; categoria: griglia cat-cover). */
function card(html: string): Card[] {
  const out: Card[] = [];
  const re = /(?:<div class="swiper-slide">|cat-cover">)\s*<a href="https:\/\/heddy\.video\/([^"?#]+)">([\s\S]*?)<\/a>/g;
  for (const m of html.matchAll(re)) {
    const slug = m[1]!;
    // «commedia/il-circo-delle-meraviglie» è un film vero con lo slash nello slug: si scartano solo le cartelle tecniche.
    if (ESCLUSI.has(slug) || /^(css|js|media|images|related-tags)\//.test(slug)) continue;
    const corpo = m[2]!;
    const img = corpo.match(/data-src="([^"]+)"/)?.[1] ?? corpo.match(/src="([^"]+)"/)?.[1] ?? null;
    const titolo = corpo.match(/<h6 class="film-title[^"]*">([\s\S]*?)<\/h6>/)?.[1];
    const regia = corpo.match(/video-directors">([\s\S]*?)<\/p>/)?.[1];
    const min = corpo.match(/(\d{2,3})\s*min/)?.[1];
    out.push({
      slug,
      titolo: titolo ? pulisci(titolo) : null,
      poster: img && !img.includes("category-lazy") ? img : null,
      regia: regia ? pulisci(regia).replace(/\s*\|\s*$/, "").replace(/^"|"$/g, "").trim() || null : null,
      durataMin: min ? Number(min) : null,
    });
  }
  return out;
}

async function leggiVivo(): Promise<Map<string, Card>> {
  const trovati = new Map<string, Card>();
  const aggiungi = (c: Card) => {
    const g = trovati.get(c.slug);
    if (!g) trovati.set(c.slug, c);
    else trovati.set(c.slug, { slug: c.slug, titolo: g.titolo ?? c.titolo, poster: g.poster ?? c.poster, regia: g.regia ?? c.regia, durataMin: g.durataMin ?? c.durataMin });
  };
  for (let p = 1; p <= 6; p++) {
    const html = await pagina(p === 1 ? HEDDY_URL + "/" : `${HEDDY_URL}/?page=${p}`);
    const prima = trovati.size;
    card(html).forEach(aggiungi);
    if (trovati.size === prima) break;
  }
  for (const [slug] of HEDDY_CATEGORIE)
    for (let p = 1; p <= 10; p++) {
      const html = await pagina(`${HEDDY_URL}/${slug}?page=${p}`);
      const c = card(html);
      c.forEach(aggiungi);
      if (!c.length || !html.includes(`page=${p + 1}`)) break;
    }
  return trovati;
}

async function rileggi(): Promise<CatalogoHeddy> {
  try {
    const vivo = await leggiVivo();
    const minimo = Math.ceil(HEDDY_FILM.length * 0.7);
    const inFoto = HEDDY_FILM.filter((f) => vivo.has(f.slug));
    if (inFoto.length < minimo)
      return { film: HEDDY_FILM, origine: "fotografia", letto: vivo.size, nuovi: 0, errore: `lettura parziale: ${inFoto.length}/${HEDDY_FILM.length} titoli` };
    const noti = new Set(HEDDY_FILM.map((f) => f.slug));
    const nuovi: FilmHeddy[] = [...vivo.values()]
      .filter((c) => !noti.has(c.slug) && c.titolo)
      .map((c) => ({ slug: c.slug, titolo: c.titolo!, regia: c.regia, anno: null, paese: null, durataMin: c.durataMin, stagioni: null, categorie: [], poster: c.poster }));
    // La loggia occulta è solo nel banner della home (non nelle card): resta finché la sua scheda esiste in fotografia.
    const restano = HEDDY_FILM.filter((f) => vivo.has(f.slug) || f.slug === "la-loggia-occulta-democrazia-a-rischio");
    return { film: [...nuovi, ...restano], origine: "vivo", letto: vivo.size, nuovi: nuovi.length, errore: null };
  } catch (e) {
    return { film: HEDDY_FILM, origine: "fotografia", letto: 0, nuovi: 0, errore: e instanceof Error ? e.message : String(e) };
  }
}

/** Catalogo HEDDY attuale (vivo se raggiungibile, altrimenti fotografia). Al massimo una lettura ogni 6 ore. */
export async function catalogoHeddy(): Promise<CatalogoHeddy> {
  if (cache && Date.now() - cache.quando < OGNI_MS) return cache.dati;
  if (!inCorso)
    inCorso = rileggi()
      .then((dati) => {
        // Una lettura fallita si riprova dopo 30 minuti, non dopo 6 ore.
        cache = { quando: dati.errore ? Date.now() - OGNI_MS + 30 * 60_000 : Date.now(), dati };
        return dati;
      })
      .finally(() => (inCorso = null));
  return inCorso;
}

/** Scheda HEDDY per slug: fotografia, poi ultima lettura viva. */
export function schedaHeddy(slug: string): FilmHeddy | null {
  return HEDDY_FILM.find((f) => f.slug === slug) ?? cache?.dati.film.find((f) => f.slug === slug) ?? null;
}

/**
 * Versione che non fa mai aspettare: per il sync dei Channel (che gira anche durante le visite
 * alla home). Se la lettura viva non è pronta la avvia in sottofondo e intanto restituisce
 * l'ultima lettura o la fotografia — la fotografia non spegne nulla, quindi è sempre sicura.
 */
export function catalogoHeddyRapido(): CatalogoHeddy {
  const fresca = cache && Date.now() - cache.quando < OGNI_MS;
  if (!fresca) void catalogoHeddy();
  return cache?.dati ?? { film: HEDDY_FILM, origine: "fotografia", letto: 0, nuovi: 0, errore: null };
}
