/**
 * «Turismo ed eventi — Referenti istituzionali» (canale Fiere e Sagre).
 * Solo dati letti sulle pagine ufficiali dei Comuni, verificati il 14/10/2026.
 * Censimento PROGRESSIVO: si parte dai territori TBH della costa adriatica.
 * Dove le deleghe sono divise, ogni referente ha la sua scheda.
 */
export interface ReferenteTurismo {
  id: string;
  ente: string;
  regione: string;
  provincia: string;
  comune: string;
  ruolo: string;
  referente: string;
  /** Deleghe come le scrive la pagina ufficiale. */
  delega: string;
  pagina: string;
  email: string | null;
  telefono: string | null;
  /** Ufficio turismo/eventi dell'ente, se indicato dalla fonte. */
  ufficio: { nome: string; email: string | null; telefono: string | null; pagina: string | null } | null;
  calendario: string | null;
  verificato: string;
}

const V = "2026-10-14";

const UFFICIO_RICCIONE = {
  nome: "Sezione Gestione amministrativa Turismo e Cultura",
  email: "turismo@comune.riccione.rn.it",
  telefono: "0541 426040",
  pagina: "https://www.comune.riccione.rn.it/it/unita_organizzative/sezione-gestione-amministrativa-turismo-e-cultura",
};

export const REFERENTI_TURISMO: ReferenteTurismo[] = [
  {
    id: "rimini-sindaco",
    ente: "Comune di Rimini",
    regione: "Emilia-Romagna",
    provincia: "RN",
    comune: "Rimini",
    ruolo: "Sindaco",
    referente: "Jamil Sadegholvaad",
    delega: "Turismo e Promozione della Città, Relazioni Europee e Internazionali, Piano Strategico",
    pagina: "https://www.comune.rimini.it/amministrazione/politici/jamil-sadegholvaad",
    email: "sindaco@comune.rimini.it",
    telefono: "+39 0541 704352",
    ufficio: null,
    calendario: "https://riminiturismo.it/eventi",
    verificato: V,
  },
  {
    id: "rimini-lari",
    ente: "Comune di Rimini",
    regione: "Emilia-Romagna",
    provincia: "RN",
    comune: "Rimini",
    ruolo: "Assessore",
    referente: "Michele Lari",
    delega: "Sport, Cultura",
    pagina: "https://www.comune.rimini.it/amministrazione/personale-amministrativo/michele-lari",
    email: "michele.lari@comune.rimini.it",
    telefono: "+39 0541 704231",
    ufficio: null,
    calendario: "https://riminiturismo.it/eventi",
    verificato: V,
  },
  {
    id: "riccione-guidi",
    ente: "Comune di Riccione",
    regione: "Emilia-Romagna",
    provincia: "RN",
    comune: "Riccione",
    ruolo: "Assessore",
    referente: "Mattia Guidi",
    delega: "Affari Generali - Turismo ed Eventi",
    pagina: "https://www.comune.riccione.rn.it/it/persone/guidi-mattia",
    email: "mguidi@comune.riccione.rn.it",
    telefono: "0541 426039",
    ufficio: UFFICIO_RICCIONE,
    calendario: "https://riccione.it/calendario-eventi/",
    verificato: V,
  },
  {
    id: "riccione-villa",
    ente: "Comune di Riccione",
    regione: "Emilia-Romagna",
    provincia: "RN",
    comune: "Riccione",
    ruolo: "Vicesindaca e Assessora",
    referente: "Sandra Villa",
    delega: "Scuola - Servizi Educativi - Politiche Giovanili - Cultura",
    pagina: "https://www.comune.riccione.rn.it/it/persone/villa-sandra",
    email: "sandravilla@comune.riccione.rn.it",
    telefono: "0541 426039 (Cultura)",
    ufficio: UFFICIO_RICCIONE,
    calendario: "https://riccione.it/calendario-eventi/",
    verificato: V,
  },
  {
    id: "cattolica-bartolucci",
    ente: "Comune di Cattolica",
    regione: "Emilia-Romagna",
    provincia: "RN",
    comune: "Cattolica",
    ruolo: "Assessora",
    referente: "Elisabetta Bartolucci",
    delega:
      "Turismo – attività economiche – politiche del lavoro e dell'occupazione – grandi eventi – artigianato – fiere e mercati – tutela del mare – tutela delle acque – riserve naturali – pesca – politiche europee",
    pagina: "https://www.comune.cattolica.rn.it/it/persone/bartolucci-elisabetta",
    email: "bartoluccielisabetta@cattolica.net",
    telefono: "0541 966621",
    ufficio: {
      nome: "Servizi turistici e manifestazioni",
      email: "turismo@cattolica.net",
      telefono: "0541 966697",
      pagina: "https://www.comune.cattolica.rn.it/it/unita_organizzative/servizi-turistici-e-manifestazioni",
    },
    calendario: "https://www.comune.cattolica.rn.it/it/eventi",
    verificato: V,
  },
];
