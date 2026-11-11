/**
 * FASE 7 — Editoria TBH.
 *
 * Regola: nessun contenuto inventato. La numerazione di Touch Influencity Magazine è quella reale
 * confermata da TBH (uscita d'esordio Giugno/Luglio 2022, poi mensile, con un "Dicembre bis" di
 * fine anno che raccoglie gli highlights dell'anno concluso) ed è ancorata al numero stampato
 * sull'unica copertina reale che abbiamo in mano: N°31 · Gennaio 2025 (vedi ANCORA_NUMERAZIONE).
 * Dal 28/09/2026 ogni uscita porta scritto il suo NUMERO: non si conta più dalla posizione.
 * Le altre copertine e i PDF NON esistono ancora nel portale:
 * restano `null` e la scheda dichiara "copertina da ricevere" / "sfogliabile in allestimento".
 * Nessun titolo di articolo, nessun sommario, nessun autore è stato scritto al posto di TBH.
 */

export type Numero = {
  /** Chiave URL: ricavata dal NUMERO reale dell'uscita (2022-1, 2022-6-bis, 2025-31 …). */
  slug: string;
  /**
   * Vecchi indirizzi della stessa uscita. Dopo la correzione della numerazione (28/09/2026)
   * i link già condivisi continuano ad aprire il numero giusto invece di finire su una pagina
   * vuota: nessun indirizzo pubblicato viene abbandonato.
   */
  alias: string[];
  anno: number;
  /**
   * NUMERO DI COPERTINA, ESPLICITO PER OGNI USCITA.
   * Ordine di Claudio (28/09/2026): non si deduce mai dalla posizione nell'array né dal numero
   * di elementi presenti. Se TBH corregge un numero, si cambia qui e cambia in tutto il portale.
   */
  numero: string;
  /** Solo per ordinare l'edicola: i "bis" seguono l'ultima uscita dell'anno. Non è il numero. */
  ordine: number;
  /** Periodo di copertina, in italiano. */
  periodo: string;
  /** true = numero speciale di fine anno con gli highlights (il "bis", fuori dal conteggio). */
  speciale: boolean;
  /** Copertina reale. null = da ricevere: non si genera nulla al suo posto. */
  copertina: string | null;
  /** PDF o sfogliabile ufficiale. null = in allestimento. */
  pdf: string | null;
};

/** Ultimo mese pubblicato dell'anno in corso (aggiornare quando TBH invia i numeri nuovi). */
export const ULTIMO_ANNO = 2026;
export const ULTIMO_MESE = 8;

/**
 * ANCORA DELLA NUMERAZIONE — 28/09/2026.
 * La numerazione dell'edicola non è più calcolata: è ancorata all'unico dato stampato e
 * verificato che abbiamo in mano, la copertina reale ricevuta da TBH.
 */
export const ANCORA_NUMERAZIONE = {
  periodo: "Gennaio 2025",
  numero: "31",
  fonte: "copertina reale «N°31 · GENNAIO 2025 · NEW ERA EDITION» inviata da TBH",
};

/**
 * Copertine REALI ricevute da TBH, indicizzate per periodo di copertina.
 * Nessuna copertina è stata creata, ricostruita o rinominata: qui entrano solo i file inviati
 * da Claudio, con il numero che portano stampato sopra.
 */
export const COPERTINE_REALI: Record<string, { file: string; numeroStampato: string }> = {
  "Gennaio 2025": { file: "/brand/influencity-n31-cover.jpg", numeroStampato: "31" },
};

/**
 * ELENCO UFFICIALE DELLE USCITE — numero esplicito, uscita per uscita.
 *
 * Correzione del 28/09/2026 (ordine di Claudio): la copertina reale del N°31 veniva mostrata
 * come N°30, perché il portale contava i numeri dalla posizione nell'elenco (N°0 di
 * Giugno/Luglio 2022, poi mensile) e per Gennaio 2025 arrivava al 30. Ora il numero è un dato
 * scritto su ogni riga e l'elenco è ancorato alla copertina reale: Gennaio 2025 = N°31,
 * Dicembre 2024 = N°30. Di conseguenza il numero d'esordio di Giugno/Luglio 2022 risulta il
 * N°1 (nelle prime comunicazioni era indicato anche come «numero zero»).
 *
 * DA CONFERMARE CON TBH: l'esordio di Giugno/Luglio 2022 va chiamato N°1 o N°0? È l'unico
 * punto della sequenza che non abbiamo su carta. Se TBH conferma «N°0», allora fra Giugno 2022
 * e Gennaio 2025 esiste un'uscita in più che non ci è stata comunicata: si aggiunge qui nella
 * sua riga e i numeri successivi si spostano di uno, senza toccare nient'altro del portale.
 *
 * I "bis"/speciali di fine anno restano distinti e fuori dal conteggio ordinario.
 * Gli inserti sportivi (da Gennaio 2027) NON modificano la numerazione principale: vivono
 * come spazio separato dentro la scheda del numero.
 */
const USCITE: Numero[] = [
  {
    slug: "2022-1",
    alias: ["2022-0"],
    anno: 2022,
    numero: "1",
    ordine: 1,
    periodo: "Giugno/Luglio 2022",
    speciale: false,
    copertina: null,
    pdf: null,
  },
  {
    slug: "2022-2",
    alias: ["2022-1"],
    anno: 2022,
    numero: "2",
    ordine: 2,
    periodo: "Agosto 2022",
    speciale: false,
    copertina: null,
    pdf: null,
  },
  {
    slug: "2022-3",
    alias: ["2022-2"],
    anno: 2022,
    numero: "3",
    ordine: 3,
    periodo: "Settembre 2022",
    speciale: false,
    copertina: null,
    pdf: null,
  },
  {
    slug: "2022-4",
    alias: ["2022-3"],
    anno: 2022,
    numero: "4",
    ordine: 4,
    periodo: "Ottobre 2022",
    speciale: false,
    copertina: null,
    pdf: null,
  },
  {
    slug: "2022-5",
    alias: ["2022-4"],
    anno: 2022,
    numero: "5",
    ordine: 5,
    periodo: "Novembre 2022",
    speciale: false,
    copertina: null,
    pdf: null,
  },
  {
    slug: "2022-6",
    alias: ["2022-5"],
    anno: 2022,
    numero: "6",
    ordine: 6,
    periodo: "Dicembre 2022",
    speciale: false,
    copertina: null,
    pdf: null,
  },
  {
    slug: "2022-6-bis",
    alias: ["2022-5-bis"],
    anno: 2022,
    numero: "6 bis",
    ordine: 7,
    periodo: "31 Dicembre 2022 · Highlights dell'anno",
    speciale: true,
    copertina: null,
    pdf: null,
  },
  {
    slug: "2023-7",
    alias: ["2023-6"],
    anno: 2023,
    numero: "7",
    ordine: 8,
    periodo: "Gennaio 2023",
    speciale: false,
    copertina: null,
    pdf: null,
  },
  {
    slug: "2023-8",
    alias: ["2023-7"],
    anno: 2023,
    numero: "8",
    ordine: 9,
    periodo: "Febbraio 2023",
    speciale: false,
    copertina: null,
    pdf: null,
  },
  {
    slug: "2023-9",
    alias: ["2023-8"],
    anno: 2023,
    numero: "9",
    ordine: 10,
    periodo: "Marzo 2023",
    speciale: false,
    copertina: null,
    pdf: null,
  },
  {
    slug: "2023-10",
    alias: ["2023-9"],
    anno: 2023,
    numero: "10",
    ordine: 11,
    periodo: "Aprile 2023",
    speciale: false,
    copertina: null,
    pdf: null,
  },
  {
    slug: "2023-11",
    alias: ["2023-10"],
    anno: 2023,
    numero: "11",
    ordine: 12,
    periodo: "Maggio 2023",
    speciale: false,
    copertina: null,
    pdf: null,
  },
  {
    slug: "2023-12",
    alias: ["2023-11"],
    anno: 2023,
    numero: "12",
    ordine: 13,
    periodo: "Giugno 2023",
    speciale: false,
    copertina: null,
    pdf: null,
  },
  {
    slug: "2023-13",
    alias: ["2023-12"],
    anno: 2023,
    numero: "13",
    ordine: 14,
    periodo: "Luglio 2023",
    speciale: false,
    copertina: null,
    pdf: null,
  },
  {
    slug: "2023-14",
    alias: ["2023-13"],
    anno: 2023,
    numero: "14",
    ordine: 15,
    periodo: "Agosto 2023",
    speciale: false,
    copertina: null,
    pdf: null,
  },
  {
    slug: "2023-15",
    alias: ["2023-14"],
    anno: 2023,
    numero: "15",
    ordine: 16,
    periodo: "Settembre 2023",
    speciale: false,
    copertina: null,
    pdf: null,
  },
  {
    slug: "2023-16",
    alias: ["2023-15"],
    anno: 2023,
    numero: "16",
    ordine: 17,
    periodo: "Ottobre 2023",
    speciale: false,
    copertina: null,
    pdf: null,
  },
  {
    slug: "2023-17",
    alias: ["2023-16"],
    anno: 2023,
    numero: "17",
    ordine: 18,
    periodo: "Novembre 2023",
    speciale: false,
    copertina: null,
    pdf: null,
  },
  {
    slug: "2023-18",
    alias: ["2023-17"],
    anno: 2023,
    numero: "18",
    ordine: 19,
    periodo: "Dicembre 2023",
    speciale: false,
    copertina: null,
    pdf: null,
  },
  {
    slug: "2023-18-bis",
    alias: ["2023-17-bis"],
    anno: 2023,
    numero: "18 bis",
    ordine: 20,
    periodo: "31 Dicembre 2023 · Highlights dell'anno",
    speciale: true,
    copertina: null,
    pdf: null,
  },
  {
    slug: "2024-19",
    alias: ["2024-18"],
    anno: 2024,
    numero: "19",
    ordine: 21,
    periodo: "Gennaio 2024",
    speciale: false,
    copertina: null,
    pdf: null,
  },
  {
    slug: "2024-20",
    alias: ["2024-19"],
    anno: 2024,
    numero: "20",
    ordine: 22,
    periodo: "Febbraio 2024",
    speciale: false,
    copertina: null,
    pdf: null,
  },
  {
    slug: "2024-21",
    alias: ["2024-20"],
    anno: 2024,
    numero: "21",
    ordine: 23,
    periodo: "Marzo 2024",
    speciale: false,
    copertina: null,
    pdf: null,
  },
  {
    slug: "2024-22",
    alias: ["2024-21"],
    anno: 2024,
    numero: "22",
    ordine: 24,
    periodo: "Aprile 2024",
    speciale: false,
    copertina: null,
    pdf: null,
  },
  {
    slug: "2024-23",
    alias: ["2024-22"],
    anno: 2024,
    numero: "23",
    ordine: 25,
    periodo: "Maggio 2024",
    speciale: false,
    copertina: null,
    pdf: null,
  },
  {
    slug: "2024-24",
    alias: ["2024-23"],
    anno: 2024,
    numero: "24",
    ordine: 26,
    periodo: "Giugno 2024",
    speciale: false,
    copertina: null,
    pdf: null,
  },
  {
    slug: "2024-25",
    alias: ["2024-24"],
    anno: 2024,
    numero: "25",
    ordine: 27,
    periodo: "Luglio 2024",
    speciale: false,
    copertina: null,
    pdf: null,
  },
  {
    slug: "2024-26",
    alias: ["2024-25"],
    anno: 2024,
    numero: "26",
    ordine: 28,
    periodo: "Agosto 2024",
    speciale: false,
    copertina: null,
    pdf: null,
  },
  {
    slug: "2024-27",
    alias: ["2024-26"],
    anno: 2024,
    numero: "27",
    ordine: 29,
    periodo: "Settembre 2024",
    speciale: false,
    copertina: null,
    pdf: null,
  },
  {
    slug: "2024-28",
    alias: ["2024-27"],
    anno: 2024,
    numero: "28",
    ordine: 30,
    periodo: "Ottobre 2024",
    speciale: false,
    copertina: null,
    pdf: null,
  },
  {
    slug: "2024-29",
    alias: ["2024-28"],
    anno: 2024,
    numero: "29",
    ordine: 31,
    periodo: "Novembre 2024",
    speciale: false,
    copertina: null,
    pdf: null,
  },
  {
    slug: "2024-30",
    alias: ["2024-29"],
    anno: 2024,
    numero: "30",
    ordine: 32,
    periodo: "Dicembre 2024",
    speciale: false,
    copertina: null,
    pdf: null,
  },
  {
    slug: "2024-30-bis",
    alias: ["2024-29-bis"],
    anno: 2024,
    numero: "30 bis",
    ordine: 33,
    periodo: "31 Dicembre 2024 · Highlights dell'anno",
    speciale: true,
    copertina: null,
    pdf: null,
  },
  {
    slug: "2025-31",
    alias: ["2025-30"],
    anno: 2025,
    numero: "31",
    ordine: 34,
    periodo: "Gennaio 2025",
    speciale: false,
    copertina: null,
    pdf: null,
  },
  {
    slug: "2025-32",
    alias: ["2025-31"],
    anno: 2025,
    numero: "32",
    ordine: 35,
    periodo: "Febbraio 2025",
    speciale: false,
    copertina: null,
    pdf: null,
  },
  {
    slug: "2025-33",
    alias: ["2025-32"],
    anno: 2025,
    numero: "33",
    ordine: 36,
    periodo: "Marzo 2025",
    speciale: false,
    copertina: null,
    pdf: null,
  },
  {
    slug: "2025-34",
    alias: ["2025-33"],
    anno: 2025,
    numero: "34",
    ordine: 37,
    periodo: "Aprile 2025",
    speciale: false,
    copertina: null,
    pdf: null,
  },
  {
    slug: "2025-35",
    alias: ["2025-34"],
    anno: 2025,
    numero: "35",
    ordine: 38,
    periodo: "Maggio 2025",
    speciale: false,
    copertina: null,
    pdf: null,
  },
  {
    slug: "2025-36",
    alias: ["2025-35"],
    anno: 2025,
    numero: "36",
    ordine: 39,
    periodo: "Giugno 2025",
    speciale: false,
    copertina: null,
    pdf: null,
  },
  {
    slug: "2025-37",
    alias: ["2025-36"],
    anno: 2025,
    numero: "37",
    ordine: 40,
    periodo: "Luglio 2025",
    speciale: false,
    copertina: null,
    pdf: null,
  },
  {
    slug: "2025-38",
    alias: ["2025-37"],
    anno: 2025,
    numero: "38",
    ordine: 41,
    periodo: "Agosto 2025",
    speciale: false,
    copertina: null,
    pdf: null,
  },
  {
    slug: "2025-39",
    alias: ["2025-38"],
    anno: 2025,
    numero: "39",
    ordine: 42,
    periodo: "Settembre 2025",
    speciale: false,
    copertina: null,
    pdf: null,
  },
  {
    slug: "2025-40",
    alias: ["2025-39"],
    anno: 2025,
    numero: "40",
    ordine: 43,
    periodo: "Ottobre 2025",
    speciale: false,
    copertina: null,
    pdf: null,
  },
  {
    slug: "2025-41",
    alias: ["2025-40"],
    anno: 2025,
    numero: "41",
    ordine: 44,
    periodo: "Novembre 2025",
    speciale: false,
    copertina: null,
    pdf: null,
  },
  {
    slug: "2025-42",
    alias: ["2025-41"],
    anno: 2025,
    numero: "42",
    ordine: 45,
    periodo: "Dicembre 2025",
    speciale: false,
    copertina: null,
    pdf: null,
  },
  {
    slug: "2025-42-bis",
    alias: ["2025-41-bis"],
    anno: 2025,
    numero: "42 bis",
    ordine: 46,
    periodo: "31 Dicembre 2025 · Highlights dell'anno",
    speciale: true,
    copertina: null,
    pdf: null,
  },
  {
    slug: "2026-43",
    alias: ["2026-42"],
    anno: 2026,
    numero: "43",
    ordine: 47,
    periodo: "Gennaio 2026",
    speciale: false,
    copertina: null,
    pdf: null,
  },
  {
    slug: "2026-44",
    alias: ["2026-43"],
    anno: 2026,
    numero: "44",
    ordine: 48,
    periodo: "Febbraio 2026",
    speciale: false,
    copertina: null,
    pdf: null,
  },
  {
    slug: "2026-45",
    alias: ["2026-44"],
    anno: 2026,
    numero: "45",
    ordine: 49,
    periodo: "Marzo 2026",
    speciale: false,
    copertina: null,
    pdf: null,
  },
  {
    slug: "2026-46",
    alias: ["2026-45"],
    anno: 2026,
    numero: "46",
    ordine: 50,
    periodo: "Aprile 2026",
    speciale: false,
    copertina: null,
    pdf: null,
  },
  {
    slug: "2026-47",
    alias: ["2026-46"],
    anno: 2026,
    numero: "47",
    ordine: 51,
    periodo: "Maggio 2026",
    speciale: false,
    copertina: null,
    pdf: null,
  },
  {
    slug: "2026-48",
    alias: ["2026-47"],
    anno: 2026,
    numero: "48",
    ordine: 52,
    periodo: "Giugno 2026",
    speciale: false,
    copertina: null,
    pdf: null,
  },
  {
    slug: "2026-49",
    alias: ["2026-48"],
    anno: 2026,
    numero: "49",
    ordine: 53,
    periodo: "Luglio 2026",
    speciale: false,
    copertina: null,
    pdf: null,
  },
  {
    slug: "2026-50",
    alias: ["2026-49"],
    anno: 2026,
    numero: "50",
    ordine: 54,
    periodo: "Agosto 2026",
    speciale: false,
    copertina: null,
    pdf: null,
  },
];

/** Le copertine reali si attaccano alla loro uscita per periodo, senza toccare il numero. */
export const NUMERI: Numero[] = USCITE.map((numero) => {
  const reale = COPERTINE_REALI[numero.periodo];
  return reale ? { ...numero, copertina: reale.file } : numero;
});

/**
 * Controllo automatico della coerenza: una copertina reale deve stare sull'uscita che porta
 * stampato quel numero. Se qualcuno sposta una riga o cambia un numero senza aggiornare
 * l'elenco, l'anomalia compare qui (e nella pagina di controllo) invece di restare invisibile.
 */
export const ANOMALIE_NUMERAZIONE: string[] = [
  ...Object.entries(COPERTINE_REALI).map(([periodo, reale]) => {
    const uscita = NUMERI.find((x) => x.periodo === periodo);
    if (!uscita) return `${periodo}: periodo non presente in edicola`;
    if (uscita.numero !== reale.numeroStampato) {
      return `${periodo}: in edicola N°${uscita.numero}, sulla copertina N°${reale.numeroStampato}`;
    }
    return null;
  }),
  (() => {
    const ancora = NUMERI.find((x) => x.periodo === ANCORA_NUMERAZIONE.periodo);
    if (!ancora) return `ancora ${ANCORA_NUMERAZIONE.periodo}: uscita non trovata`;
    return ancora.numero === ANCORA_NUMERAZIONE.numero
      ? null
      : `ancora ${ANCORA_NUMERAZIONE.periodo}: atteso N°${ANCORA_NUMERAZIONE.numero}, trovato N°${ancora.numero}`;
  })(),
  (() => {
    const doppi = NUMERI.map((x) => x.numero).filter((v, i, a) => a.indexOf(v) !== i);
    return doppi.length ? `numeri ripetuti in edicola: ${[...new Set(doppi)].join(", ")}` : null;
  })(),
].filter((x): x is string => x !== null);

/** Trova un'uscita dal suo indirizzo, accettando anche i vecchi indirizzi (alias). */
export function trovaNumero(slug: string): Numero | null {
  return (
    NUMERI.find((x) => x.slug === slug) ?? NUMERI.find((x) => x.alias.includes(slug)) ?? null
  );
}

export const EDICOLA_NOTA =
  "Numerazione ufficiale confermata da TBH. Copertine, anteprime e sfogliabili non sono ancora nel portale: appena arrivano i file reali compaiono qui al posto della dicitura “da ricevere”. Nessuna copertina è stata creata o ricostruita.";

/** Touch Spotlight NON è una rivista a sé: è una rubrica interna al magazine. */
export const RUBRICHE = [
  {
    slug: "touch-spotlight",
    nome: "TOUCH SPOTLIGHT",
    descrizione:
      "Rubrica interna al magazine: mette in vetrina sponsor, partner, aziende e imprese del Circuito con una presentazione e un'intervista. Non è una rivista separata.",
    to: "/tbh/brand-personalizzazioni",
  },
  {
    slug: "oroscopo",
    nome: "OROSCOPO E GIOCHI DI MENTE",
    descrizione:
      "Rubrica di intrattenimento del magazine: oroscopo, “L'Oroskifo” e giochi di mente con gettoni.",
    to: "/in-allestimento",
  },
  {
    slug: "sport",
    nome: "SPORT E TERRITORIO",
    descrizione:
      "Rubrica dedicata a società sportive seguite, campionati e produzioni sportive del gruppo.",
    to: "/sport",
  },
];

/** Speciali annuali: sono i numeri "bis" di fine anno. */
export function speciali(): Numero[] {
  return NUMERI.filter((x) => x.speciale);
}

/**
 * Categorie della sezione News. Solo la struttura: nessun articolo, titolo o fonte inventata.
 * Le fonti in chiaro già collegate nel portale restano dove sono (sezione Media).
 */
export type CategoriaNews = {
  slug: string;
  nome: string;
  descrizione: string;
  /** Rotta interna del portale dove il tema è già trattato, se esiste. */
  collegata: string | null;
};

export const CATEGORIE_NEWS: CategoriaNews[] = [
  {
    slug: "gruppo",
    nome: "GRUPPO TBH",
    descrizione: "Novità su società, attività, servizi e Circuito di Touch Business Holding.",
    collegata: "/tbh/societa",
  },
  {
    slug: "circuito",
    nome: "CIRCUITO E CLIENTI",
    descrizione: "Nuovi aderenti, convenzioni attive e iniziative del Circuito TBH.",
    collegata: "/network/circuito",
  },
  {
    slug: "sport",
    nome: "SPORT",
    descrizione: "Società seguite, campionati e produzioni sportive.",
    collegata: "/sport",
  },
  {
    slug: "eventi",
    nome: "EVENTI",
    descrizione: "Tour, fiere, serate e appuntamenti del gruppo e dei partner.",
    collegata: "/eventi/miss-cool",
  },
  {
    slug: "media",
    nome: "MEDIA E PROGRAMMI",
    descrizione: "Programmi TV e radio, produzioni e canali partner.",
    collegata: "/media",
  },
  {
    slug: "hospitality",
    nome: "HOSPITALITY",
    descrizione: "Hotel, ristoranti, locali ed esperienze del Circuito.",
    collegata: "/hospitality",
  },
  {
    slug: "lavoro",
    nome: "LAVORO E CASTING",
    descrizione: "Annunci, selezioni, corsi e opportunità artistiche.",
    collegata: "/lavoro-casting",
  },
  {
    slug: "shop",
    nome: "TOUCH PLAZA",
    descrizione: "Prodotti, servizi e listini del negozio digitale.",
    collegata: "/shop",
  },
];

export const NEWS_NOTA =
  "La sezione è pronta e collegata: le notizie compaiono qui appena TBH invia i testi ufficiali. Non pubblichiamo articoli scritti al posto della redazione, né rilanci non verificati.";
