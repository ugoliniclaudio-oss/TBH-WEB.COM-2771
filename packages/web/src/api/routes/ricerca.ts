import { z } from "zod";
import { base } from "../__core/app";
import { QUALIFICA_LABEL } from "../data/registro";
import { REGISTRO_RISOLTO as REGISTRO } from "../data/identita";
import { TBH_CONTACTS } from "../data/catalog";
import { vetrinaTouchPlaza } from "../lib/catalogo-touch-plaza";
import { PROGRAMMI_DM, BRAND_PAGES } from "../data/tbh";
import { TERRITORI, CIRCUITI, RADIO, TV, RIVISTE } from "../data/rete";
import { indiceRicercaCms } from "../lib/cms";

/**
 * ORDINE 4 · Ricerca globale: attività, servizi, aziende, programmi, squadre, prodotti,
 * partner, città, media e sezioni del sito. Cerca solo nelle anagrafiche reali.
 */

type Risultato = {
  id: string;
  titolo: string;
  tipo: string;
  dettaglio: string | null;
  to: string;
  esterno: string | null;
};

function norm(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}

/** Sezioni del sito: la ricerca trova anche le pagine, non solo le entità. */
const SEZIONI: Risultato[] = [
  { id: "sez-shop", titolo: "Touch Plaza Shop", tipo: "Sezione", dettaglio: "Prodotti e servizi a listino", to: "/shop", esterno: null },
  { id: "sez-societa", titolo: "Società con P.IVA", tipo: "Sezione", dettaglio: "Il gruppo TBH", to: "/tbh/societa", esterno: null },
  { id: "sez-capogruppo", titolo: "Touch Business Holding", tipo: "Capogruppo", dettaglio: "Scheda della capogruppo", to: "/tbh/societa/touch-business-holding", esterno: null },
  { id: "sez-attivita", titolo: "Attività senza P.IVA", tipo: "Sezione", dettaglio: "Attività del gruppo", to: "/tbh/attivita", esterno: null },
  { id: "sez-produzioni", titolo: "Produzioni TBH", tipo: "Sezione", dettaglio: null, to: "/tbh/produzioni", esterno: null },
  { id: "sez-servizi", titolo: "Servizi TBH", tipo: "Sezione", dettaglio: null, to: "/tbh/servizi", esterno: null },
  { id: "sez-livelli", titolo: "25 Livelli TBH", tipo: "Sezione", dettaglio: "Fasce e livelli", to: "/tbh/livelli", esterno: null },
  { id: "sez-registro", titolo: "Registro entità", tipo: "Sezione", dettaglio: "Una scheda per ogni entità reale", to: "/tbh/registro", esterno: null },
  { id: "sez-network", titolo: "TBH Network", tipo: "Sezione", dettaglio: "Circuito, clienti, sponsor, partner", to: "/network", esterno: null },
  { id: "sez-mediahub", titolo: "Media Hub", tipo: "Sezione", dettaglio: "Radio, TV, TG, riviste", to: "/media", esterno: null },
  { id: "sez-dm", titolo: "DM Comunicazioni", tipo: "Media partner", dettaglio: "Programmi, dirette, archivio", to: "/dm", esterno: null },
  { id: "sez-streaming", titolo: "TV · Radio · Streaming", tipo: "Sezione", dettaglio: null, to: "/media/streaming", esterno: null },
  { id: "sez-community", titolo: "Community TBH", tipo: "Sezione", dettaglio: null, to: "/community", esterno: null },
  { id: "sez-lavoro", titolo: "Job & Casting", tipo: "Sezione", dettaglio: "Bacheca, candidature, casting", to: "/lavoro-casting", esterno: null },
  { id: "sez-crew", titolo: "Crew & Academy", tipo: "Sezione", dettaglio: "Touch Crew, Academy, Spotlight", to: "/crew-academy", esterno: null },
  { id: "sez-sport", titolo: "Sport Hub", tipo: "Sezione", dettaglio: "Calcio e Motorsport", to: "/sport", esterno: null },
  { id: "sez-business", titolo: "Business Desk", tipo: "Sezione", dettaglio: "Portali istituzionali e gestionali", to: "/business-desk", esterno: null },
  { id: "sez-territorio", titolo: "Mappa del territorio", tipo: "Sezione", dettaglio: null, to: "/territorio/mappa", esterno: null },
];

async function indice(): Promise<Risultato[]> {
  const out: Risultato[] = [...SEZIONI];

  for (const e of REGISTRO) {
    // I prodotti arrivano sotto dal catalogo vivo (sito + Stripe): niente doppioni.
    if (e.qualifiche.length === 1 && e.qualifiche[0] === "prodotto") continue;
    out.push({
      id: `reg-${e.id}`,
      titolo: e.nome,
      tipo: e.qualifiche.map((q) => QUALIFICA_LABEL[q]).join(" · "),
      dettaglio: [e.codiceTBH, e.settore, e.citta].filter(Boolean).join(" · ") || null,
      to: e.pagine[0]?.href ?? "/tbh/registro",
      esterno: e.sito,
    });
  }

  // 03/10/2026 — anche le schede sincronizzate da Stripe; ogni voce apre la SUA scheda.
  for (const p of await vetrinaTouchPlaza())
    out.push({
      id: `pro-${p.slug}`,
      titolo: p.title,
      tipo: `Prodotto · ${p.category}`,
      dettaglio:
        p.stripe && p.stripe.stato !== "pubblicato"
          ? "In allestimento"
          : (p.priceCents / 100).toLocaleString("it-IT", { style: "currency", currency: "EUR" }),
      to: `/shop/p/${p.slug}`,
      esterno: null,
    });

  for (const p of PROGRAMMI_DM)
    out.push({
      id: `dm-${p.slug}`,
      titolo: p.name,
      tipo: "Programma DM Comunicazioni",
      dettaglio: p.ora ? `ore ${p.ora}` : "orario da confermare",
      to: `/dm/programmi?p=${p.slug}`,
      esterno: null,
    });

  for (const b of BRAND_PAGES)
    out.push({
      id: `brand-${b.slug}`,
      titolo: b.nome,
      tipo: "Pagina TBH",
      dettaglio: b.claim ?? null,
      to: `/tbh/p/${b.slug}`,
      esterno: null,
    });

  for (const t of TERRITORI)
    out.push({
      id: `terr-${norm(t.nome).replace(/\s+/g, "-")}`,
      titolo: t.nome,
      tipo: "Territorio",
      dettaglio: t.nota ?? null,
      to: "/territorio/spazi",
      esterno: null,
    });

  for (const c of CIRCUITI)
    out.push({
      id: `circ-${norm(c.nome).replace(/\s+/g, "-")}`,
      titolo: c.nome,
      tipo: "Circuito",
      dettaglio: c.citta,
      to: "/sport/motorsport",
      esterno: c.sito,
    });

  for (const m of [...RADIO, ...TV, ...RIVISTE])
    out.push({
      id: `media-${norm(m.nome).replace(/\s+/g, "-")}`,
      titolo: m.nome,
      tipo: "Media",
      dettaglio: m.nota ?? null,
      to: "/media",
      esterno: m.sito,
    });

  /* 28/10/2026 — Home, Channel, pagine e contenuti attivi della Gestione contenuti e palinsesto. */
  out.push(...(await indiceRicercaCms().catch(() => [])));

  return out;
}

export const ricerca = {
  cerca: base.input(z.object({ q: z.string() })).handler(async ({ input }) => {
    const term = norm(input.q.trim());
    const tutto = await indice();
    if (term.length < 2)
      return { items: [] as Risultato[], trovati: 0, indicizzati: tutto.length, contatti: TBH_CONTACTS };

    const items = tutto.filter((r) => {
      const blob = norm(`${r.titolo} ${r.tipo} ${r.dettaglio ?? ""}`);
      return blob.includes(term);
    });

    return {
      items: items.slice(0, 120),
      trovati: items.length,
      indicizzati: tutto.length,
      contatti: TBH_CONTACTS,
    };
  }),
};
