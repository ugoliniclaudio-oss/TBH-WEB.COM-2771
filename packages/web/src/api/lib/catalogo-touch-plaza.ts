import { db } from "../database";
import * as schema from "../database/schema";
import { PRODUCTS, type Product } from "../data/catalog";
import type { InfoStripe, StatoStripe, VarianteStripe } from "../data/stripe-catalogo";
import { accountConfigurati } from "./stripe-account";

/**
 * CATALOGO TOUCH PLAZA = listino del sito (PRODUCTS) + schede nate da Stripe.
 *
 *  · Una scheda del sito associata a un Product Stripe (`slugSito`) resta UNA scheda:
 *    prende da Stripe prezzo, varianti e pagamento, tiene i suoi testi e la sua categoria.
 *  · Un Product Stripe senza scheda del sito genera la sua scheda /shop/p/<slug>.
 *  · Completa (nome, descrizione, immagine, prezzo attivo, pagamento) = pubblicata da sola.
 *    Incompleta = «Da completare» nel pannello, «In allestimento» in vetrina, senza acquisto.
 *  · Archiviata su Stripe = fuori dalla vendita.
 *  · Un Payment Link usato da due articoli diversi non vale per nessuno dei due:
 *    si paga con la Checkout Session del proprio Price.
 */

type Riga = typeof schema.stripeProdotti.$inferSelect;

function json<T>(v: string | null | undefined, ripiego: T): T {
  if (!v) return ripiego;
  try {
    return JSON.parse(v) as T;
  } catch {
    return ripiego;
  }
}

function righeTesto(v: string | null | undefined) {
  return (v ?? "")
    .split("\n")
    .map((r) => r.trim())
    .filter(Boolean);
}

function normalizzaUrl(u: string) {
  return u.trim().replace(/[?#].*$/, "").replace(/\/+$/, "").toLowerCase();
}

export type ArticoloTouchPlaza = Product & { stripe?: InfoStripe | null };

function costruisci(r: Riga, sito: Product | null, accountOk: boolean): ArticoloTouchPlaza {
  const varianti = json<VarianteStripe[]>(r.prezzi, []);
  const immaginiStripe = json<string[]>(r.immagini, []);
  const extra = json<string[]>(r.immaginiExtra, []);
  const conPrezzo = varianti.filter((v) => v.importoCents !== null);

  const titolo = sito?.title ?? r.nome;
  const testo = r.testoEditoriale?.trim() || sito?.blurb || r.descrizione || "";
  const immagine = sito?.image ?? immaginiStripe[0] ?? extra[0] ?? null;
  const galleria = [...immaginiStripe, ...extra].filter((u) => u && u !== immagine);
  const condizioni = righeTesto(r.condizioni);

  const mancanti: string[] = [];
  if (!titolo.trim()) mancanti.push("Nome");
  if (!testo.trim()) mancanti.push("Descrizione");
  if (!immagine) mancanti.push("Immagine");
  if (!conPrezzo.length) mancanti.push("Prezzo attivo su Stripe");
  if (conPrezzo.some((v) => !v.paymentLink) && !accountOk)
    mancanti.push("Pagamento: chiave dell'account Stripe non disponibile");

  const stato: StatoStripe = r.attivo !== 1 ? "archiviato" : mancanti.length ? "in-allestimento" : "pubblicato";
  const info: InfoStripe = {
    origine: sito ? "manuale" : "stripe",
    account: r.account,
    productId: r.stripeProductId,
    varianti: conPrezzo,
    stato,
    mancanti,
    ultimaSync: r.ultimaSync ? r.ultimaSync.toISOString() : null,
  };

  // Un solo prezzo con il suo Payment Link = pulsante diretto. Più prezzi = si sceglie prima.
  const linkUnico = conPrezzo.length === 1 ? conPrezzo[0].paymentLink : null;
  const { stripe: _vecchio, ...restoCheckout } = sito?.checkout ?? {};
  const checkout = linkUnico ? { ...restoCheckout, stripe: linkUnico } : restoCheckout;

  const iva =
    r.ivaPercentuale !== null
      ? { ivaPercentuale: r.ivaPercentuale, prezzoIvaInclusa: r.ivaInclusa === null ? null : r.ivaInclusa === 1 }
      : { ivaPercentuale: sito?.ivaPercentuale ?? null, prezzoIvaInclusa: sito?.prezzoIvaInclusa ?? null };

  return {
    ...(sito ?? {}),
    slug: sito?.slug ?? r.slug,
    title: titolo,
    category: r.categoria?.trim() || sito?.category || "Touch Plaza",
    priceCents: conPrezzo[0]?.importoCents ?? sito?.priceCents ?? 0,
    blurb: testo,
    image: immagine,
    installments: sito?.installments ?? false,
    ...iva,
    checkout,
    // Il QR del sito vale solo se il pagamento resta quel link.
    qr: sito?.qr && sito.checkout?.stripe && linkUnico === sito.checkout.stripe ? sito.qr : null,
    galleria: [...(sito?.galleria ?? []), ...galleria],
    condizioniElenco: condizioni.length ? condizioni : sito?.condizioniElenco,
    stripe: info,
  };
}

/** Toglie i Payment Link usati da più di un articolo: ciascuno paga col proprio Price. */
function senzaLinkCondivisi(lista: ArticoloTouchPlaza[]) {
  const usi = new Map<string, Set<string>>();
  const segna = (url: string | null | undefined, slug: string) => {
    if (!url) return;
    const k = normalizzaUrl(url);
    usi.set(k, (usi.get(k) ?? new Set()).add(slug));
  };
  for (const p of lista) {
    segna(p.checkout?.stripe, p.slug);
    for (const v of p.stripe?.varianti ?? []) segna(v.paymentLink, p.slug);
  }
  const condiviso = (url: string | null | undefined) => !!url && (usi.get(normalizzaUrl(url))?.size ?? 0) > 1;

  return lista.map((p) => {
    if (!p.stripe) return p;
    const varianti = p.stripe.varianti.map((v) =>
      condiviso(v.paymentLink) ? { ...v, paymentLink: null, paymentLinkId: null } : v,
    );
    const toltoDiretto = condiviso(p.checkout?.stripe);
    if (!toltoDiretto && varianti.every((v, i) => v === p.stripe!.varianti[i])) return p;
    const { stripe: _s, ...resto } = p.checkout ?? {};
    return {
      ...p,
      checkout: toltoDiretto ? resto : p.checkout,
      stripe: { ...p.stripe, varianti },
    };
  });
}

let cache: { quando: number; tutti: ArticoloTouchPlaza[]; righe: Riga[] } | null = null;
const VALIDA_MS = 5_000;

/** Da chiamare dopo ogni sync o modifica del pannello. */
export function dimenticaCatalogo() {
  cache = null;
}

/** Tutti gli articoli, compresi quelli archiviati (servono alla scheda e al pannello). */
export async function catalogoCompleto() {
  if (cache && Date.now() - cache.quando < VALIDA_MS) return cache;
  let righe: Riga[];
  let account: Awaited<ReturnType<typeof accountConfigurati>>;
  try {
    [righe, account] = await Promise.all([db.select().from(schema.stripeProdotti), accountConfigurati()]);
  } catch (e) {
    // 28/10/2026 — errore temporaneo del database: niente 500 sulla vetrina. Si serve l'ultima
    // copia valida (o il solo listino del sito) e si riprova alla richiesta successiva.
    console.error("[catalogo] lettura stripe_prodotti non riuscita:", e);
    const soloListino: NonNullable<typeof cache> = { quando: 0, tutti: senzaLinkCondivisi([...PRODUCTS]), righe: [] };
    return cache ?? soloListino;
  }
  const nomi = new Set(account.map((a) => a.nome));
  const perSito = new Map<string, Riga>();
  for (const r of righe) if (r.slugSito) perSito.set(r.slugSito, r);

  const tutti: ArticoloTouchPlaza[] = PRODUCTS.map((p) => {
    const r = perSito.get(p.slug);
    return r ? costruisci(r, p, nomi.has(r.account)) : p;
  });
  for (const r of righe) {
    if (r.slugSito && PRODUCTS.some((p) => p.slug === r.slugSito)) continue;
    tutti.push(costruisci(r, null, nomi.has(r.account)));
  }
  cache = { quando: Date.now(), tutti: senzaLinkCondivisi(tutti), righe };
  return cache;
}

/** In vetrina? Non archiviato su Stripe, non nascosto, non in bozza sul record. */
export function inVetrina(p: ArticoloTouchPlaza) {
  return p.stripe?.stato !== "archiviato" && p.visible !== false && p.status !== "draft";
}

/** Articoli in vetrina: tutto tranne gli archiviati su Stripe e i record nascosti o in bozza. */
export async function vetrinaTouchPlaza() {
  return (await catalogoCompleto()).tutti.filter(inVetrina);
}

/** Una scheda per slug. Lo slug Stripe di una scheda agganciata porta alla scheda del sito. */
export async function articoloTouchPlaza(slug: string) {
  const { tutti, righe } = await catalogoCompleto();
  const diretto = tutti.find((p) => p.slug === slug);
  if (diretto) return diretto;
  const r = righe.find((x) => x.slug === slug && x.slugSito);
  return r ? (tutti.find((p) => p.slug === r.slugSito) ?? null) : null;
}
