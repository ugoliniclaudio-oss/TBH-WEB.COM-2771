import { z } from "zod";
import { base } from "../__core/app";
import {
  MONDI,
  CATEGORIE_EVIDENZA,
  ADESIONI,
  ADESIONI_NOTA,
  HOSPITALITY_CATEGORIE,
  HOSPITALITY_AZIONI,
  HOSPITALITY_NOTA,
  ASSIST_DIGITALE,
  ASSIST_LIMITE,
  BANNER,
  CATEGORIE_BANNER,
  OFFERTE,
  TIPI_PERIODO,
  CODICI,
  PROMO_NOTA,
} from "../data/ecosistema";
import { REGISTRO_RISOLTO as REGISTRO } from "../data/identita";
import type { Entita } from "../data/registro";
import { TBH_CONTACTS } from "../data/catalog";

/** Banner attivi oggi, ordinati per priorità. Nessuna data inventata: null = sempre attivo. */
function bannerAttivi(posizione?: string) {
  const oggi = new Date().toISOString().slice(0, 10);
  return BANNER.filter((b) => b.attivo)
    .filter((b) => (b.dal ? b.dal <= oggi : true) && (b.al ? b.al >= oggi : true))
    .filter((b) => (posizione ? b.posizione === posizione : true))
    .sort((a, b) => b.priorita - a.priorita);
}

function testo(e: Entita) {
  return `${e.nome} ${e.settore ?? ""} ${e.citta ?? ""} ${e.note.join(" ")}`.toLowerCase();
}

/** Entità reali del registro che corrispondono alle chiavi di una categoria. */
function perChiavi(chiavi: string[], limite: number) {
  return REGISTRO.filter((e) => {
    const t = testo(e);
    return chiavi.some((k) => t.includes(k));
  }).slice(0, limite);
}

/** Rotazione stabile nell'arco della giornata: nessun contenuto casuale a ogni refresh. */
function ruota<T>(items: T[], n: number) {
  if (items.length === 0) return [];
  const giorno = Math.floor(Date.now() / 86400000);
  const start = giorno % items.length;
  const doppio = [...items, ...items];
  return doppio.slice(start, start + Math.min(n, items.length));
}

export const ecosistema = {
  /** 02 · I mondi del portale: la mappa dell'ecosistema. */
  mondi: base.handler(() => ({ mondi: MONDI })),

  /** 03 · Home vetrina: tutti i blocchi nell'ordine del mockup. */
  vetrina: base.handler(() => {
    const evidenza = CATEGORIE_EVIDENZA.map((c) => ({
      label: c.label,
      to: c.to,
      entita: perChiavi(c.chiavi, 6).map((e) => ({
        id: e.id,
        nome: e.nome,
        logo: e.logo,
        settore: e.settore,
        citta: e.citta,
      })),
    }));

    const circuito = REGISTRO.filter(
      (e) =>
        (e.qualifiche as string[]).includes("circuito-tbh") ||
        (e.qualifiche as string[]).includes("cliente"),
    );

    return {
      mondi: MONDI,
      bannerAlto: bannerAttivi("home-alto"),
      bannerBasso: bannerAttivi("home-basso"),
      evidenza,
      clientiCircuito: ruota(circuito, 12).map((e) => ({
        id: e.id,
        nome: e.nome,
        logo: e.logo,
        settore: e.settore,
        citta: e.citta,
      })),
      clientiCircuitoTotale: circuito.length,
      offerte: OFFERTE.filter((o) => o.attiva),
      codici: CODICI.filter((c) => c.attivo),
      promoNota: PROMO_NOTA,
      adesioni: ADESIONI,
      contatti: TBH_CONTACTS,
    };
  }),

  /** 11 · Adesioni Club, P.IVA/Ambulante, Circuito: prezzi definitivi confermati. */
  adesioni: base.handler(() => ({
    adesioni: ADESIONI,
    nota: ADESIONI_NOTA,
    contatti: TBH_CONTACTS,
  })),

  /** 09 · Hospitality: categorie + strutture reali dal registro unico. */
  hospitality: base.input(z.object({ categoria: z.string().optional() })).handler(({ input }) => {
    const categorie = HOSPITALITY_CATEGORIE.map((c) => ({
      slug: c.slug,
      label: c.label,
      descrizione: c.descrizione,
      n: perChiavi(c.chiavi, 999).length,
    }));

    const scelta = input.categoria
      ? (HOSPITALITY_CATEGORIE.find((c) => c.slug === input.categoria) ?? null)
      : null;

    const items = scelta
      ? perChiavi(scelta.chiavi, 120)
      : HOSPITALITY_CATEGORIE.flatMap((c) => perChiavi(c.chiavi, 8));

    const visti = new Set<string>();
    const unici = items.filter((e) => (visti.has(e.id) ? false : (visti.add(e.id), true)));

    return {
      categorie,
      categoria: scelta ? { slug: scelta.slug, label: scelta.label, descrizione: scelta.descrizione } : null,
      items: unici,
      azioni: HOSPITALITY_AZIONI,
      nota: HOSPITALITY_NOTA,
      contatti: TBH_CONTACTS,
    };
  }),

  /** 10 · TBH Assist: assistenza tecnica e digitale, con il limite dichiarato. */
  assist: base.handler(() => ({
    servizi: ASSIST_DIGITALE,
    limite: ASSIST_LIMITE,
    contatti: TBH_CONTACTS,
  })),

  /** 19-22 · Motore banner, offerte periodiche e codici promozionali. */
  promo: base.handler(() => ({
    banner: bannerAttivi(),
    categorieBanner: CATEGORIE_BANNER,
    offerte: OFFERTE,
    tipiPeriodo: TIPI_PERIODO,
    codici: CODICI,
    nota: PROMO_NOTA,
    contatti: TBH_CONTACTS,
  })),
};
