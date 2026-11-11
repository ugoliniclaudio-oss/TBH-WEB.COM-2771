/**
 * PUNTO 02 DELLA MASTER LIST — REGISTRO UNICO DELLE ENTITÀ.
 *
 * Regola: "crea una volta, collega ovunque".
 * Questo file NON aggiunge dati nuovi e non inventa nulla: legge le anagrafiche già
 * esistenti (COMPANIES, PRODUCTS, TEAMS, PROSPECTS, LUOGHI, PROGRAMMI_DM, BRAND_PAGES,
 * PARTNER_TECNICI) e le fonde in un registro con un ID stabile per ogni entità reale.
 *
 * Se la stessa entità compare in più anagrafiche (es. R.F.A. è società TBH-008 *e* squadra,
 * Touch Restaurant è attività *e* luogo del Circuito), il registro la riconosce come UNA
 * entità con più QUALIFICHE (punto 08) e più pagine collegate, invece di duplicarla.
 */

import { COMPANIES, PRODUCTS, TEAMS } from "./catalog";
import { LUOGHI, PROSPECTS, PARTNER_TECNICI } from "./rete";
import { BRAND_PAGES, PROGRAMMI_DM, DM_CANALE, ATTIVITA_GRUPPO } from "./tbh";

export type Qualifica =
  | "societa"
  | "attivita"
  | "produzione"
  | "prodotto"
  | "squadra"
  | "luogo"
  | "circuito-tbh"
  | "prospect"
  | "cliente"
  | "partner-tecnico"
  | "media-partner"
  | "programma-tv";

export const QUALIFICA_LABEL: Record<Qualifica, string> = {
  societa: "Società con P.IVA",
  attivita: "Attività del gruppo",
  produzione: "Produzione",
  prodotto: "Prodotto / servizio a listino",
  squadra: "Società sportiva",
  luogo: "Luogo sul territorio",
  "circuito-tbh": "Circuito TBH",
  prospect: "Prospect commerciale",
  cliente: "Cliente",
  "partner-tecnico": "Partner tecnico",
  "media-partner": "Media partner",
  "programma-tv": "Programma TV",
};

export type Collegamento = { label: string; href: string };

export type Entita = {
  id: string;
  nome: string;
  qualifiche: Qualifica[];
  codiceTBH: string | null;
  piva: string | null;
  settore: string | null;
  citta: string | null;
  sito: string | null;
  logo: string | null;
  note: string[];
  /** Pagine interne dove la stessa entità è già pubblicata. */
  pagine: Collegamento[];
  /** Anagrafiche di origine: se sono più di una, il registro ha risolto un doppione. */
  fonti: string[];
};

/** Chiave di identità: nome normalizzato (accenti, punteggiatura e forme societarie via). */
export function chiave(nome: string) {
  return nome
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(
      /\b(s\.?r\.?l\.?|s\.?p\.?a\.?|ltd|sagl|a\.?s\.?d\.?|s\.?s\.?d\.?|societa|srls|scarl|&)\b/g,
      " ",
    )
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function slugify(nome: string) {
  return chiave(nome).replace(/\s+/g, "-").slice(0, 60) || "entita";
}

type Frammento = {
  nome: string;
  qualifiche: Qualifica[];
  fonte: string;
  codiceTBH?: string | null;
  piva?: string | null;
  settore?: string | null;
  citta?: string | null;
  sito?: string | null;
  logo?: string | null;
  note?: (string | null | undefined)[];
  pagine?: Collegamento[];
};

function frammenti(): Frammento[] {
  const out: Frammento[] = [];

  for (const c of COMPANIES) {
    out.push({
      nome: c.name,
      qualifiche: [c.kind === "societa" ? "societa" : "attivita"],
      fonte: "COMPANIES (anagrafica gruppo)",
      codiceTBH: c.code,
      piva: c.vat,
      settore: c.sector,
      sito: c.site,
      logo: c.logo,
      // 04/10/2026 — la voce apre la SCHEDA SPECIFICA della società, non l'elenco.
      pagine: [
        { label: `Scheda ${c.name}`, href: `/tbh/societa/${c.code.toLowerCase()}` },
        { label: "Società e attività", href: "/tbh/societa" },
        { label: "Servizi del gruppo", href: "/tbh/servizi" },
      ],
    });
  }

  for (const a of ATTIVITA_GRUPPO) {
    out.push({
      nome: a.nome,
      qualifiche: ["attivita"],
      fonte: "ATTIVITA_GRUPPO (Master punto 04)",
      codiceTBH: a.codiceTBH,
      settore: a.ambito,
      note: [a.descrizione],
      pagine: [{ label: "Attività del gruppo", href: "/tbh/attivita" }],
    });
  }

  for (const p of PRODUCTS) {
    out.push({
      nome: p.title,
      qualifiche: ["prodotto"],
      fonte: "PRODUCTS (listino Touch Plaza Shop)",
      settore: p.category,
      logo: p.image,
      note: [p.blurb, p.installments ? "Rateizzabile su richiesta." : null],
      pagine: [{ label: "Scheda Touch Plaza", href: `/shop/p/${p.slug}` }],
    });
  }

  for (const t of TEAMS) {
    out.push({
      nome: t.name,
      qualifiche: ["squadra"],
      fonte: "TEAMS (sport)",
      sito: t.site,
      logo: t.logo,
      note: [t.role, t.note],
      pagine: [{ label: "Società sportive", href: "/sport/squadre" }],
    });
  }

  for (const l of LUOGHI) {
    out.push({
      nome: l.nome,
      qualifiche: l.circuitoTBH ? ["luogo", "circuito-tbh"] : ["luogo"],
      fonte: "LUOGHI (mappa del territorio)",
      settore: l.categoria,
      citta: l.citta,
      sito: l.sito,
      logo: l.logo,
      note: [l.indirizzo, l.note],
      pagine: l.circuitoTBH
        ? [
            { label: "Circuito TBH", href: "/network/circuito" },
            { label: "Mappa del territorio", href: "/territorio/mappa" },
          ]
        : [{ label: "Mappa del territorio", href: "/territorio/mappa" }],
    });
  }

  for (const p of PROSPECTS) {
    const q: Qualifica[] = p.statoContatto === "Cliente" ? ["prospect", "cliente"] : ["prospect"];
    out.push({
      nome: p.azienda,
      qualifiche: q,
      fonte: "PROSPECTS (rete commerciale)",
      settore: p.settore,
      citta: `${p.citta} (${p.provincia})`,
      sito: p.sito,
      logo: p.logo,
      note: [p.note, `Stato contatto: ${p.statoContatto}. Priorità ${p.priorita}.`],
      pagine: [
        { label: "Rete commerciale", href: "/network/rete-commerciale" },
        { label: p.statoContatto === "Cliente" ? "Clienti" : "Prospect", href: "/network/clienti" },
      ],
    });
  }

  for (const p of PARTNER_TECNICI) {
    out.push({
      nome: p.nome,
      qualifiche: ["partner-tecnico"],
      fonte: "PARTNER_TECNICI (motorsport)",
      sito: p.sito,
      note: [p.nota],
      pagine: [
        { label: "Partner", href: "/network/partner" },
        { label: "Motorsport", href: "/sport/motorsport" },
      ],
    });
  }

  for (const b of BRAND_PAGES) {
    out.push({
      nome: b.name,
      qualifiche: [b.kind === "produzione" ? "produzione" : "attivita"],
      fonte: "BRAND_PAGES (pagine dedicate)",
      logo: b.logo,
      note: [b.claim],
      pagine: [{ label: `Pagina ${b.name}`, href: paginaBrand(b.slug) }],
    });
  }

  out.push({
    nome: DM_CANALE.name,
    qualifiche: ["media-partner"],
    fonte: "DM_CANALE (media partner)",
    sito: DM_CANALE.youtube,
    logo: DM_CANALE.logo,
    note: [
      "Media partner autonomo: NON è una società del gruppo TBH.",
      DM_CANALE.referente ? `Referente: ${DM_CANALE.referente}.` : null,
    ],
    pagine: [{ label: "DM Comunicazioni", href: "/dm" }],
  });

  for (const p of PROGRAMMI_DM) {
    out.push({
      nome: p.name,
      qualifiche: ["programma-tv"],
      fonte: "PROGRAMMI_DM (palinsesto)",
      note: [p.descrizione],
      pagine: [{ label: "Scheda programma", href: `/dm/programmi?p=${p.slug}` }],
    });
  }

  return out;
}

function paginaBrand(slug: string) {
  if (slug === "reality-show") return "/media/reality-show";
  if (slug === "heddy-video") return "/media/heddy-video";
  if (slug === "miss-cool") return "/eventi/miss-cool";
  return `/tbh/${slug}`;
}

/** Registro unico: un ID per entità reale, con tutte le qualifiche e le pagine collegate. */
export const REGISTRO: Entita[] = (() => {
  const map = new Map<string, Entita>();

  for (const f of frammenti()) {
    const k = chiave(f.nome);
    const esistente = map.get(k);

    if (!esistente) {
      map.set(k, {
        id: slugify(f.nome),
        nome: f.nome,
        qualifiche: [...f.qualifiche],
        codiceTBH: f.codiceTBH ?? null,
        piva: f.piva ?? null,
        settore: f.settore ?? null,
        citta: f.citta ?? null,
        sito: f.sito ?? null,
        logo: f.logo ?? null,
        note: (f.note ?? []).filter((n): n is string => Boolean(n)),
        pagine: [...(f.pagine ?? [])],
        fonti: [f.fonte],
      });
      continue;
    }

    for (const q of f.qualifiche) if (!esistente.qualifiche.includes(q)) esistente.qualifiche.push(q);
    esistente.codiceTBH ??= f.codiceTBH ?? null;
    esistente.piva ??= f.piva ?? null;
    esistente.settore ??= f.settore ?? null;
    esistente.citta ??= f.citta ?? null;
    esistente.sito ??= f.sito ?? null;
    esistente.logo ??= f.logo ?? null;
    for (const n of f.note ?? []) if (n && !esistente.note.includes(n)) esistente.note.push(n);
    for (const p of f.pagine ?? [])
      if (!esistente.pagine.some((x) => x.href === p.href)) esistente.pagine.push(p);
    if (!esistente.fonti.includes(f.fonte)) esistente.fonti.push(f.fonte);
  }

  return [...map.values()].sort((a, b) => a.nome.localeCompare(b.nome, "it"));
})();

export const REGISTRO_NOTA =
  "Registro generato automaticamente dalle anagrafiche esistenti: nessun dato è stato aggiunto a mano. " +
  "Le entità presenti in più anagrafiche sono unite in un solo record con più qualifiche, così non esistono doppioni. " +
  "Dove un dato non è verificato resta vuoto e va confermato da Claudio.";
