import { z } from "zod";
import { base } from "../__core/app";
import {
  DM_CANALE,
  PROGRAMMI_DM,
  PALINSESTO_DM,
  LIVELLI,
  FASCE_LIVELLO,
  BRAND_PAGES,
  ANNUNCI,
  ISTITUZIONI,
  ISTITUZIONI_DISCLAIMER,
  ATTIVITA_GRUPPO,
  ATTIVITA_DISCLAIMER,
} from "../data/tbh";
import { TBH_CONTACTS, COMPANIES, TEAMS } from "../data/catalog";
import { LUOGHI, PROSPECTS, PARTNER_TECNICI, TV, RADIO, SPOT_A_VISTA } from "../data/rete";
import { GIORNI, statoPuntata } from "../data/palinsesto";
import { EVENTI_SPORT, FILTRI_CALENDARIO, NOTA_CALENDARIO } from "../data/calendario-sport";
import { chiave } from "../data/registro";
import { REGISTRO_RISOLTO as REGISTRO } from "../data/identita";


export const tbh = {
  /** 10-11 · DM Comunicazioni + palinsesto con stato calcolato. */
  dm: base.handler(() => ({
    canale: DM_CANALE,
    programmi: PROGRAMMI_DM.map((p) => ({
      ...p,
      giornoLabel: p.giorno ? GIORNI[p.giorno]! : null,
      ...statoPuntata(p.giorno, p.ora, p.durataMin),
    })),
    /** Palinsesto settimanale confermato da DM Sport Live: solo i quattro programmi in onda. */
    palinsesto: PALINSESTO_DM.map((p) => ({
      slug: p.slug,
      name: p.name,
      giorno: p.giorno,
      giornoLabel: p.giorno ? GIORNI[p.giorno]! : null,
      ora: p.ora,
      descrizione: p.descrizione,
      ...statoPuntata(p.giorno, p.ora, p.durataMin),
    })),
    contatti: TBH_CONTACTS,
  })),

  programma: base.input(z.object({ slug: z.string() })).handler(({ input }) => {
    /* Gli slug storici restano validi: nessun vecchio link si rompe. */
    const p =
      PROGRAMMI_DM.find((x) => x.slug === input.slug) ??
      PROGRAMMI_DM.find((x) => x.alias.includes(input.slug));
    if (!p) return null;
    return {
      ...p,
      giornoLabel: p.giorno ? GIORNI[p.giorno]! : null,
      ...statoPuntata(p.giorno, p.ora, p.durataMin),
      canale: DM_CANALE,
    };
  }),

  /** CALENDARIO SPORT — unico per tutto (ordine del 15/09/2026).
   *  Gli appuntamenti DM non sono riscritti a mano: arrivano dal palinsesto confermato. */
  calendarioSport: base.handler(() => {
    const programmi = PALINSESTO_DM.map((p) => ({
      id: `dm-${p.slug}`,
      ordine: `ricorrente-${p.giorno ?? 9}`,
      periodo: p.giorno && p.ora ? `${GIORNI[p.giorno]!} · ${p.ora}` : "Orario da confermare",
      titolo: `${p.name} — Diretta DM`,
      localita: null as string | null,
      categoria: "PROGRAMMI" as const,
      stato: "CONFERMATO" as const,
      descrizione: p.descrizione,
      categorieCoinvolte: null as string | null,
      /** Pagina canonica del programma: mai copie duplicate del video. */
      dettagli: `/dm/programmi?p=${p.slug}`,
      collegatoA: null as string | null,
      dm: true,
      ricorrenza: p.giorno && p.ora ? `Ogni ${GIORNI[p.giorno]!} alle ${p.ora}` : null,
    }));

    return {
      filtri: [...FILTRI_CALENDARIO],
      nota: NOTA_CALENDARIO,
      eventi: [...EVENTI_SPORT],
      programmi,
      dmSportLive: DM_CANALE.sitoEditoriale,
    };
  }),

  /** 29 · I 25 livelli TBH. */
  livelli: base.handler(() => ({
    fasce: FASCE_LIVELLO.map((f) => ({
      ...f,
      livelli: LIVELLI.filter((l) => l.fascia === f.nome),
    })),
    totale: LIVELLI.length,
    contatti: TBH_CONTACTS,
  })),

  /** 14-17 · Pagine brand (Touch Fashion, Miss Cool, Reality, HEDDY.video). */
  brand: base.input(z.object({ slug: z.string() })).handler(({ input }) => {
    return BRAND_PAGES.find((b) => b.slug === input.slug) ?? null;
  }),

  brandList: base.handler(() => ({ items: BRAND_PAGES })),

  /** 30-31 · Lavoro & Casting + link istituzionali. */
  lavoro: base.handler(() => ({
    annunci: ANNUNCI,
    contatti: TBH_CONTACTS,
  })),

  istituzioni: base.handler(() => ({
    gruppi: ISTITUZIONI,
    disclaimer: ISTITUZIONI_DISCLAIMER,
  })),

  /** 05 · Produzioni del gruppo (solo entità reali già in anagrafica). */
  produzioni: base.handler(() => {
    const codici = ["TBH-004", "TBH-002", "TBH-001", "TBH-A12", "TBH-A13", "TBH-A14", "TBH-A15"];
    return {
      items: codici
        .map((c) => COMPANIES.find((x) => x.code === c))
        .filter((x): x is (typeof COMPANIES)[number] => Boolean(x)),
      brand: BRAND_PAGES.filter((b) => b.slug === "reality-show" || b.slug === "heddy-video"),
      contatti: TBH_CONTACTS,
    };
  }),

  /** 03-04 · Separazione netta: società con P.IVA vs attività senza P.IVA propria. */
  entita: base.handler(() => ({
    societa: COMPANIES.filter((c) => c.kind === "societa"),
    attivitaConCodice: COMPANIES.filter((c) => c.kind === "attivita"),
    attivitaExtra: ATTIVITA_GRUPPO,
    brand: BRAND_PAGES.filter((b) => b.kind === "attivita" || b.kind === "concorso"),
    disclaimer: ATTIVITA_DISCLAIMER,
    contatti: TBH_CONTACTS,
  })),

  /** 06 · Catalogo servizi con indicazione di chi eroga. */
  servizi: base.handler(() => {
    const settori = [...new Set(COMPANIES.map((c) => c.sector))].sort((a, b) =>
      a.localeCompare(b, "it"),
    );
    return {
      gruppi: settori.map((s) => ({
        settore: s,
        erogato: COMPANIES.filter((c) => c.sector === s).map((c) => ({
          code: c.code,
          name: c.name,
          kind: c.kind,
          vat: c.vat,
          site: c.site,
          logo: c.logo,
        })),
      })),
      contatti: TBH_CONTACTS,
    };
  }),

  /** 09 · Circuito TBH — solo luoghi con vetrofania confermata.
   *  05/09/2026 — ogni luogo porta con sé lo slug della sua scheda /e/<slug>: prima le schede
   *  esistevano ma nessuno le collegava (erano raggiungibili solo dalla homepage). */
  circuito: base.handler(() => {
    const items = LUOGHI.filter((l) => l.circuitoTBH);
    const categorie = [...new Set(items.map((l) => l.categoria))];
    const schedaDi = (nome: string) =>
      REGISTRO.find((e) => chiave(e.nome) === chiave(nome))?.id ?? null;
    return {
      totale: items.length,
      categorie: categorie.map((c) => ({
        categoria: c,
        luoghi: items
          .filter((l) => l.categoria === c)
          .map((l) => ({ ...l, slug: schedaDi(l.nome) })),
      })),
      contatti: TBH_CONTACTS,
    };
  }),

  /** 08 · Clienti / sponsor / partner del network. Nessun nome pubblicato senza conferma. */
  network: base.input(z.object({ tipo: z.enum(["clienti", "sponsor", "partner"]) })).handler(
    ({ input }) => {
      if (input.tipo === "clienti") {
        const clienti = PROSPECTS.filter((p) => p.statoContatto === "Cliente");
        const trattativa = PROSPECTS.filter((p) => p.statoContatto === "In trattativa").length;
        return {
          tipo: input.tipo,
          items: clienti.map((c) => ({
            nome: c.azienda,
            dettaglio: `${c.settore} · ${c.citta} (${c.provincia})`,
            sito: c.sito,
            logo: c.logo,
          })),
          nota:
            clienti.length === 0
              ? "Nessun cliente pubblicato: l'elenco esce solo con l'autorizzazione dell'azienda. In anagrafica ci sono " +
                `${PROSPECTS.length} aziende contattabili e ${trattativa} trattative aperte.`
              : null,
          contatti: TBH_CONTACTS,
        };
      }
      if (input.tipo === "sponsor") {
        return {
          tipo: input.tipo,
          items: [],
          nota: "Elenco sponsor in allestimento: pubblichiamo solo contratti firmati e loghi ufficiali. Per diventare sponsor, scrivici su WhatsApp.",
          contatti: TBH_CONTACTS,
        };
      }
      return {
        tipo: input.tipo,
        items: [
          {
            nome: DM_CANALE.name,
            dettaglio: DM_CANALE.ruolo,
            sito: DM_CANALE.youtube,
            logo: DM_CANALE.logo,
          },
          ...TEAMS.map((t) => ({
            nome: t.name,
            dettaglio: t.role,
            sito: t.site,
            logo: t.logo,
          })),
          ...PARTNER_TECNICI.map((p) => ({
            nome: p.nome,
            dettaglio: p.nota,
            sito: p.sito,
            logo: null as string | null,
          })),
        ],
        nota: null,
        contatti: TBH_CONTACTS,
      };
    },
  ),

  /** 01 · Streaming hub — solo piattaforme e canali ufficiali. */
  streaming: base.handler(() => ({
    tv: TV,
    radio: RADIO,
    spotAVista: SPOT_A_VISTA,
    contatti: TBH_CONTACTS,
  })),
};
