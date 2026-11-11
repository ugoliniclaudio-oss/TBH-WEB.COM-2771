/**
 * RETE COMMERCIALE TBH + DM — anagrafica unica, territorio, sport, media.
 * REGOLA FERREA: nessun logo ricreato dall'IA, nessun contatto inventato.
 * Il logo si prende SOLO dal sito/brand ufficiale. Dove il dato non è verificato → null,
 * e la UI scrive "da verificare" / "in allestimento" con pulsante attivo.
 */

/* ─────────────────────────  ANAGRAFICA COMMERCIALE UNICA  ───────────────────────── */

export type Prospect = {
  logo: string | null;
  azienda: string;
  settore: string;
  citta: string;
  provincia: string;
  regione: string;
  sito: string | null;
  telefono: string | null;
  email: string | null;
  referente: string | null;
  social: string | null;
  priorita: "A" | "A/B" | "B" | "C" | "D";
  giaSponsorSport: boolean | null;
  propostaDM: string | null;
  livelloTBH: string | null;
  budgetPotenziale: string | null;
  statoContatto: "Da contattare" | "Contattato" | "In trattativa" | "Cliente" | "Sospeso";
  note: string | null;
};

/** Primo nucleo VERIFICATO (fonte: anagrafica Claudio 28/08/2026). */
export const PROSPECTS: Prospect[] = [
  { logo: null, azienda: "Marcar Opel Rimini", settore: "Automotive", citta: "Rimini", provincia: "RN", regione: "Emilia-Romagna", sito: null, telefono: "0541 374312", email: null, referente: null, social: null, priorita: "A", giaSponsorSport: null, propostaDM: null, livelloTBH: null, budgetPotenziale: null, statoContatto: "Da contattare", note: "Logo da sito ufficiale Marcar/Opel." },
  { logo: null, azienda: "Grand Hotel Rimini", settore: "Hospitality / Luxury", citta: "Rimini", provincia: "RN", regione: "Emilia-Romagna", sito: "https://www.grandhotelrimini.com", telefono: "0541 56000", email: "info@grandhotelrimini.com", referente: null, social: null, priorita: "A", giaSponsorSport: null, propostaDM: null, livelloTBH: null, budgetPotenziale: null, statoContatto: "Da contattare", note: "Icona felliniana, target luxury." },
  { logo: null, azienda: "La Galvanina S.p.A.", settore: "Beverage / Food", citta: "Rimini", provincia: "RN", regione: "Emilia-Romagna", sito: "https://www.galvanina.com", telefono: null, email: null, referente: null, social: null, priorita: "A", giaSponsorSport: null, propostaDM: null, livelloTBH: null, budgetPotenziale: null, statoContatto: "Da contattare", note: "Sede: Via della Torretta 2, Rimini." },
  { logo: null, azienda: "RiminiWellness", settore: "Sport / Fitness / Eventi", citta: "Rimini", provincia: "RN", regione: "Emilia-Romagna", sito: "https://www.riminiwellness.com", telefono: "0541 744555", email: null, referente: null, social: null, priorita: "A", giaSponsorSport: null, propostaDM: null, livelloTBH: null, budgetPotenziale: null, statoContatto: "Da contattare", note: "Evento IEG — fiera del fitness." },
  { logo: null, azienda: "Hotel Imperiale Rimini & SPA", settore: "Hotel / Wellness", citta: "Rimini", provincia: "RN", regione: "Emilia-Romagna", sito: null, telefono: "0541 52255", email: null, referente: null, social: null, priorita: "A/B", giaSponsorSport: null, propostaDM: null, livelloTBH: null, budgetPotenziale: null, statoContatto: "Da contattare", note: null },
  { logo: null, azienda: "Lo Zodiaco", settore: "Ristorazione", citta: "Rimini", provincia: "RN", regione: "Emilia-Romagna", sito: null, telefono: "0541 370344", email: null, referente: null, social: null, priorita: "B", giaSponsorSport: null, propostaDM: null, livelloTBH: null, budgetPotenziale: null, statoContatto: "Da contattare", note: null },
  { logo: null, azienda: "Frascarelli Auto — km0 e usate Rimini", settore: "Automotive", citta: "Rimini", provincia: "RN", regione: "Emilia-Romagna", sito: null, telefono: "0541 759501", email: null, referente: null, social: null, priorita: "A", giaSponsorSport: null, propostaDM: null, livelloTBH: null, budgetPotenziale: null, statoContatto: "Da contattare", note: null },
  { logo: null, azienda: "Agenzia Immobiliare Tempocasa Rimini", settore: "Immobiliare", citta: "Rimini", provincia: "RN", regione: "Emilia-Romagna", sito: "https://www.tempocasa.it", telefono: "0541 383353", email: null, referente: null, social: null, priorita: "B", giaSponsorSport: null, propostaDM: null, livelloTBH: null, budgetPotenziale: null, statoContatto: "Da contattare", note: "Logo da brand Tempocasa." },
  { logo: null, azienda: "Rete Immobiliare Rimini Viserba", settore: "Immobiliare", citta: "Rimini / Viserba", provincia: "RN", regione: "Emilia-Romagna", sito: null, telefono: "0541 734863", email: null, referente: null, social: null, priorita: "B", giaSponsorSport: null, propostaDM: null, livelloTBH: null, budgetPotenziale: null, statoContatto: "Da contattare", note: null },
  { logo: null, azienda: "Origin Fitness & Wellness Experience", settore: "Fitness / Wellness", citta: "Rimini", provincia: "RN", regione: "Emilia-Romagna", sito: null, telefono: "334 3041151", email: null, referente: null, social: null, priorita: "B", giaSponsorSport: null, propostaDM: null, livelloTBH: null, budgetPotenziale: null, statoContatto: "Da contattare", note: "Logo da sito/social ufficiali." },
  { logo: null, azienda: "Nyala Suite Hotel", settore: "Hospitality", citta: "Sanremo", provincia: "IM", regione: "Liguria", sito: "https://www.nyalahotel.com", telefono: "0184 667668", email: null, referente: null, social: null, priorita: "A/B", giaSponsorSport: null, propostaDM: null, livelloTBH: null, budgetPotenziale: null, statoContatto: "Da contattare", note: null },
  { logo: null, azienda: "Grand Hotel & Des Anglais", settore: "Hospitality", citta: "Sanremo", provincia: "IM", regione: "Liguria", sito: "https://www.hoteldesanglais.com/", telefono: "+39 0184 667840", email: "info@hoteldesanglais.com", referente: null, social: null, priorita: "A", giaSponsorSport: null, propostaDM: null, livelloTBH: null, budgetPotenziale: null, statoContatto: "Da contattare", note: "Zona Festival — priorità alta. Salita Grande Albergo 8, Sanremo: indirizzo e recapiti letti dal sito ufficiale il 18/09/2026." },
  { logo: null, azienda: "Hotel Belle Epoque", settore: "Hospitality", citta: "Sanremo", provincia: "IM", regione: "Liguria", sito: null, telefono: "0184 577110", email: null, referente: null, social: null, priorita: "B", giaSponsorSport: null, propostaDM: null, livelloTBH: null, budgetPotenziale: null, statoContatto: "Da contattare", note: null },
  { logo: null, azienda: "Milano Automobili Srl", settore: "Automotive", citta: "Milano", provincia: "MI", regione: "Lombardia", sito: null, telefono: "02 54108385", email: null, referente: null, social: null, priorita: "A", giaSponsorSport: null, propostaDM: null, livelloTBH: null, budgetPotenziale: null, statoContatto: "Da contattare", note: null },
  { logo: null, azienda: "Immobiliare.it", settore: "Real Estate / Digital", citta: "Milano", provincia: "MI", regione: "Lombardia", sito: "https://www.immobiliare.it", telefono: null, email: null, referente: null, social: null, priorita: "A", giaSponsorSport: null, propostaDM: null, livelloTBH: null, budgetPotenziale: null, statoContatto: "Da contattare", note: "Sede: Via Carlo Farini 41, Milano." },
  { logo: null, azienda: "ML Intermediazioni Immobiliari", settore: "Immobiliare", citta: "Milano", provincia: "MI", regione: "Lombardia", sito: null, telefono: "375 6020745", email: null, referente: null, social: null, priorita: "B", giaSponsorSport: null, propostaDM: null, livelloTBH: null, budgetPotenziale: null, statoContatto: "Da contattare", note: null },
  { logo: null, azienda: "BYPILLOW Grand Central", settore: "Hospitality", citta: "Padova", provincia: "PD", regione: "Veneto", sito: "https://www.bypillow.com", telefono: "049 8761111", email: "grandcentral@bypillow.com", referente: null, social: null, priorita: "A/B", giaSponsorSport: null, propostaDM: null, livelloTBH: null, budgetPotenziale: null, statoContatto: "Da contattare", note: "Abbinabile a Pride Summer Village Padova." },
  { logo: null, azienda: "Automotive Center Roma", settore: "Automotive", citta: "Roma", provincia: "RM", regione: "Lazio", sito: null, telefono: "06 20976268", email: null, referente: null, social: null, priorita: "B", giaSponsorSport: null, propostaDM: null, livelloTBH: null, budgetPotenziale: null, statoContatto: "Da contattare", note: "Ragione sociale da verificare." },
  { logo: null, azienda: "Omega Fitness Club", settore: "Fitness", citta: "Roma", provincia: "RM", regione: "Lazio", sito: null, telefono: "06 68210058", email: null, referente: null, social: null, priorita: "B", giaSponsorSport: null, propostaDM: null, livelloTBH: null, budgetPotenziale: null, statoContatto: "Da contattare", note: null },
  { logo: null, azienda: "Roma-Immobiliare.it", settore: "Immobiliare", citta: "Roma", provincia: "RM", regione: "Lazio", sito: null, telefono: "06 6663738", email: null, referente: null, social: null, priorita: "B", giaSponsorSport: null, propostaDM: null, livelloTBH: null, budgetPotenziale: null, statoContatto: "Da contattare", note: null },
  { logo: null, azienda: "Delfit Wellness Club — Piazza Bologna", settore: "Fitness / Wellness", citta: "Roma", provincia: "RM", regione: "Lazio", sito: null, telefono: "06 69227280", email: null, referente: null, social: null, priorita: "B", giaSponsorSport: null, propostaDM: null, livelloTBH: null, budgetPotenziale: null, statoContatto: "Da contattare", note: null },
  { logo: null, azienda: "Agenzia Immobiliare Iconacasa Vieste", settore: "Immobiliare / Turismo", citta: "Vieste", provincia: "FG", regione: "Puglia", sito: "https://www.iconacasa.it", telefono: "379 2192681", email: null, referente: null, social: null, priorita: "B", giaSponsorSport: null, propostaDM: null, livelloTBH: null, budgetPotenziale: null, statoContatto: "Da contattare", note: "Logo da brand Iconacasa." },
  { logo: null, azienda: "Gargano Real Estate", settore: "Immobiliare / Turismo", citta: "Vieste", provincia: "FG", regione: "Puglia", sito: null, telefono: "0884 708129", email: null, referente: null, social: null, priorita: "A/B", giaSponsorSport: null, propostaDM: null, livelloTBH: null, budgetPotenziale: null, statoContatto: "Da contattare", note: null },
  { logo: null, azienda: "www.vieste.it s.r.l.", settore: "Turismo / Travel / Web", citta: "Vieste", provincia: "FG", regione: "Puglia", sito: "https://www.vieste.it", telefono: "346 6318865", email: null, referente: null, social: null, priorita: "A", giaSponsorSport: null, propostaDM: null, livelloTBH: null, budgetPotenziale: null, statoContatto: "Da contattare", note: null },
  { logo: null, azienda: "Osteria Al Vicolo dell'Amore", settore: "Ristorazione", citta: "Vieste", provincia: "FG", regione: "Puglia", sito: null, telefono: "350 5676232", email: null, referente: null, social: null, priorita: "B", giaSponsorSport: null, propostaDM: null, livelloTBH: null, budgetPotenziale: null, statoContatto: "Da contattare", note: null },
  { logo: null, azienda: "Vecchia Vieste Ristorante Tipico", settore: "Ristorazione", citta: "Vieste", provincia: "FG", regione: "Puglia", sito: null, telefono: "0884 707083", email: null, referente: null, social: null, priorita: "B", giaSponsorSport: null, propostaDM: null, livelloTBH: null, budgetPotenziale: null, statoContatto: "Da contattare", note: null },
  { logo: null, azienda: "Copacabana Beach", settore: "Beach / Food / Entertainment", citta: "Marina di Pietrapaola", provincia: "CS", regione: "Calabria", sito: null, telefono: "328 2805398", email: null, referente: null, social: null, priorita: "A/B", giaSponsorSport: null, propostaDM: null, livelloTBH: null, budgetPotenziale: null, statoContatto: "Da contattare", note: null },
  { logo: null, azienda: "Autosab", settore: "Automotive", citta: "Firenze", provincia: "FI", regione: "Toscana", sito: null, telefono: "055 7321221", email: null, referente: null, social: null, priorita: "A", giaSponsorSport: null, propostaDM: null, livelloTBH: null, budgetPotenziale: null, statoContatto: "Da contattare", note: null },
  { logo: null, azienda: "Firenze Auto", settore: "Automotive", citta: "Firenze", provincia: "FI", regione: "Toscana", sito: null, telefono: "055 3437289", email: null, referente: null, social: null, priorita: "A/B", giaSponsorSport: null, propostaDM: null, livelloTBH: null, budgetPotenziale: null, statoContatto: "Da contattare", note: null },
];

/** Aree da completare con la stessa anagrafica (non riempite con aziende non controllate). */
export const AREE_MASTER = [
  "Gabicce Mare / Gradara", "Cattolica", "San Giovanni in Marignano", "Misano Adriatico",
  "Riccione", "Coriano", "Rimini", "Bellaria", "Santarcangelo", "Verucchio", "Novafeltria",
  "Pennabilli", "Sant'Agata Feltria", "Savignano", "Cesena", "Forlì", "Cervia", "Ravenna",
  "Faenza", "Imola", "Sanremo / Liguria", "Milano / Lombardia", "Padova / Veneto",
  "Roma / Lazio", "Vieste-Peschici / Gargano", "Pietrapaola Marina / Calabria",
  "Toscana", "Sicilia",
];

/* ─────────────────────────  MAPPA DEL TERRITORIO  ───────────────────────── */

export type Luogo = {
  nome: string;
  categoria: string;
  citta: string;
  indirizzo: string | null;
  circuitoTBH: boolean;
  /**
   * NEGOZIO / LOCALE FISICO DEL GRUPPO — campo nato il 30/09/2026.
   *
   * Ordine di Claudio: il nuovo sigillo «Prodotti Ufficiali TBH» va SOLO sul
   * negozio online, sui negozi fisici legati al gruppo e sugli articoli TBH;
   * «tutto il resto che sarà esposto sarà originale» dei rispettivi titolari.
   *
   * `circuitoTBH` non bastava: dice solo che il posto ha la vetrofania del
   * Circuito, non che l'insegna è nostra. Qui si marca `true` SOLO dove la
   * scheda già dichiarava «attività del gruppo» o «franchising del gruppo»:
   * nessun locale è stato promosso di nostra iniziativa.
   */
  delGruppo?: boolean;
  logo: string | null;
  sito: string | null;
  note: string | null;
};

export const CATEGORIE_LUOGO = [
  "Tutte",
  "Stabilimento balneare",
  "Hotel / Resort",
  "Camping / Villaggio",
  "Ristorante",
  "Bar / Caffè",
  "Negozio / Market",
  "Locale / Discoteca",
  "Parco tematico",
  "Fiera / Piazza",
];

/** Luoghi dove il gruppo è passato almeno una volta. circuitoTBH = ha la vetrofania TBH. */
export const LUOGHI: Luogo[] = [
  { nome: "Bahia Rico's Cafè", categoria: "Stabilimento balneare", citta: "Rimini Viserba", indirizzo: "Via Giuliano Dati, bagni 35/36, Viserba (RN)", circuitoTBH: true, logo: null, sito: null, note: "Stabilimento balneare 35/36." },
  { nome: "La Playa 85", categoria: "Stabilimento balneare", citta: "Rimini", indirizzo: null, circuitoTBH: true, logo: null, sito: null, note: "Indirizzo preciso da confermare." },
  { nome: "Copacabana Beach", categoria: "Stabilimento balneare", citta: "Marina di Pietrapaola (CS)", indirizzo: null, circuitoTBH: false, logo: null, sito: null, note: "Beach · food · entertainment." },
  { nome: "Touch Beach & Sea", categoria: "Stabilimento balneare", citta: "Riviera di Rimini", indirizzo: null, circuitoTBH: true, delGruppo: true, logo: null, sito: null, note: "Attività del gruppo TBH." },

  { nome: "Hotel Villaggio Il Carlino", categoria: "Camping / Villaggio", citta: "Pietrapaola Marina (CS)", indirizzo: "Pietrapaola Marina, Cosenza", circuitoTBH: true, logo: null, sito: null, note: null },
  { nome: "Villaggio Camping Riviera", categoria: "Camping / Villaggio", citta: "Numana / Porto Recanati", indirizzo: null, circuitoTBH: true, logo: null, sito: null, note: null },
  { nome: "Camping Village Hawaii", categoria: "Camping / Villaggio", citta: "Grosseto", indirizzo: null, circuitoTBH: true, logo: null, sito: null, note: null },
  { nome: "Villaggio Turistico La Gemma", categoria: "Camping / Villaggio", citta: "Baia di Manaccora (FG)", indirizzo: null, circuitoTBH: true, logo: null, sito: null, note: "Costa Garganica." },

  { nome: "Hotel Zurigo", categoria: "Hotel / Resort", citta: "Rivazzurra di Rimini", indirizzo: null, circuitoTBH: true, logo: null, sito: null, note: null },
  { nome: "Villa Zina Resort Suite Hotel", categoria: "Hotel / Resort", citta: "Custonaci (TP)", indirizzo: "Custonaci, Trapani", circuitoTBH: true, logo: null, sito: null, note: "Sicilia." },
  { nome: "Hotel Sanremo", categoria: "Hotel / Resort", citta: "Montebelluna (TV)", indirizzo: null, circuitoTBH: true, logo: null, sito: null, note: null },
  { nome: "HTop Calella Palace Hotel", categoria: "Hotel / Resort", citta: "Calella de la Catalunya (Barcellona)", indirizzo: null, circuitoTBH: true, logo: null, sito: "https://www.htophotels.com", note: "Base del Reality Show Spagna 2026." },
  { nome: "Hotel A-point", categoria: "Hotel / Resort", citta: "Arezzo / Porto Ercole", indirizzo: null, circuitoTBH: true, logo: null, sito: null, note: null },

  { nome: "Ristorante La Gemma", categoria: "Ristorante", citta: "Baia di Manaccora (FG)", indirizzo: null, circuitoTBH: true, logo: null, sito: null, note: null },
  { nome: "Ristorante Locanda Rosa dei Venti", categoria: "Ristorante", citta: "Novafeltria (RN)", indirizzo: null, circuitoTBH: true, logo: null, sito: null, note: null },
  { nome: "Touch Restaurant", categoria: "Ristorante", citta: "Riviera di Rimini", indirizzo: null, circuitoTBH: true, delGruppo: true, logo: null, sito: null, note: "Franchising del gruppo." },

  { nome: "BlackPearl paninoteca & cocktail bar", categoria: "Bar / Caffè", citta: "Pietrapaola Marina (CS)", indirizzo: "Piazza di Mundo, Pietrapaola Marina", circuitoTBH: true, logo: null, sito: null, note: null },
  { nome: "Touch Cafè", categoria: "Bar / Caffè", citta: "Riviera di Rimini", indirizzo: null, circuitoTBH: true, delGruppo: true, logo: null, sito: null, note: "Attività del gruppo." },
  { nome: "Touch Ice Cream", categoria: "Bar / Caffè", citta: "Riviera di Rimini", indirizzo: null, circuitoTBH: true, delGruppo: true, logo: null, sito: null, note: "Attività del gruppo." },

  { nome: "Market & Panzerotteria Da Nunzia", categoria: "Negozio / Market", citta: "Baia di Manaccora (FG)", indirizzo: "presso Villaggio La Gemma", circuitoTBH: true, logo: null, sito: null, note: null },
  { nome: "Elena di Cuori — lingerie e costumi", categoria: "Negozio / Market", citta: "Italia", indirizzo: null, circuitoTBH: true, logo: null, sito: null, note: "Lingerie e costumi di lusso." },

  { nome: "Bounty Rimini", categoria: "Locale / Discoteca", citta: "Rimini", indirizzo: null, circuitoTBH: true, logo: null, sito: null, note: null },
  { nome: "Pride Summer Village", categoria: "Locale / Discoteca", citta: "Padova", indirizzo: null, circuitoTBH: true, logo: null, sito: null, note: "Prenotazione biglietti e tavoli + QR utente." },
  { nome: "Touch Hugoland", categoria: "Locale / Discoteca", citta: "Riviera di Rimini", indirizzo: null, circuitoTBH: true, delGruppo: true, logo: null, sito: null, note: "Attività del gruppo." },

  { nome: "Mirabilandia", categoria: "Parco tematico", citta: "Savio di Ravenna", indirizzo: null, circuitoTBH: false, logo: null, sito: "https://www.mirabilandia.it", note: null },
  { nome: "Fiabilandia", categoria: "Parco tematico", citta: "Rimini", indirizzo: null, circuitoTBH: false, logo: null, sito: "https://www.fiabilandia.it", note: null },
  { nome: "Italia in Miniatura", categoria: "Parco tematico", citta: "Rimini", indirizzo: null, circuitoTBH: false, logo: null, sito: "https://www.italiainminiatura.com", note: null },
  { nome: "Acquafan", categoria: "Parco tematico", citta: "Riccione", indirizzo: null, circuitoTBH: false, logo: null, sito: "https://www.acquafan.it", note: null },
  { nome: "Atlantica", categoria: "Parco tematico", citta: "Cesenatico", indirizzo: null, circuitoTBH: false, logo: null, sito: "https://www.atlantica.it", note: null },

  { nome: "Rimini Fiera (IEG)", categoria: "Fiera / Piazza", citta: "Rimini", indirizzo: null, circuitoTBH: false, logo: null, sito: "https://www.iegexpo.it", note: null },
  { nome: "Milano Rho Fiera", categoria: "Fiera / Piazza", citta: "Rho (MI)", indirizzo: null, circuitoTBH: false, logo: null, sito: "https://www.fieramilano.it", note: null },
  { nome: "BolognaFiere", categoria: "Fiera / Piazza", citta: "Bologna", indirizzo: null, circuitoTBH: false, logo: null, sito: "https://www.bolognafiere.it", note: null },
  { nome: "Fiera di Forlì", categoria: "Fiera / Piazza", citta: "Forlì", indirizzo: null, circuitoTBH: false, logo: null, sito: null, note: "Link ufficiale da verificare." },
  { nome: "PalaFiori Sanremo", categoria: "Fiera / Piazza", citta: "Sanremo", indirizzo: null, circuitoTBH: false, logo: null, sito: null, note: "Link ufficiale da verificare." },
];

/* ─────────────────────────  TERRITORI / SPAZI DEDICATI  ───────────────────────── */

export type Territorio = {
  slug: string;
  nome: string;
  area: string;
  perche: string;
  highlights: string[];
  stato: "attivo" | "in allestimento";
};

export const TERRITORI: Territorio[] = [
  { slug: "rimini", nome: "Rimini & Riviera", area: "Emilia-Romagna", perche: "Quartier generale operativo del gruppo.", highlights: ["Touch Plaza Shop", "Squadre partner Verucchio e Victoria 1968", "Rimini Fiera · RiminiWellness", "Stabilimenti e locali del circuito"], stato: "attivo" },
  { slug: "sanremo", nome: "Sanremo", area: "Liguria", perche: "Festival, PalaFiori, RadioSanremo, hôtellerie di fascia alta.", highlights: ["Settimana del Festival", "Grand Hotel & Des Anglais · Nyala · Belle Epoque", "RadioSanremo e Radio Montecarlo 2"], stato: "attivo" },
  { slug: "roma", nome: "Roma", area: "Lazio", perche: "Media, istituzioni, automotive e fitness.", highlights: ["Rete automotive e immobiliare", "Fitness club partner", "Produzione e casting"], stato: "attivo" },
  { slug: "milano", nome: "Milano", area: "Lombardia", perche: "Fiera Rho, real estate digitale, automotive.", highlights: ["Milano Rho Fiera", "Immobiliare.it", "Milano Automobili"], stato: "attivo" },
  { slug: "padova", nome: "Padova & Pride Village", area: "Veneto", perche: "Pride Summer Village e Touch Be Proud.", highlights: ["Pride Summer Village Padova", "Biglietti e tavoli con QR utente", "Ricerca PR — You Pay To Cash Back"], stato: "attivo" },
  { slug: "venezia", nome: "Festival di Venezia", area: "Veneto", perche: "Mostra del Cinema — presidio media e red carpet.", highlights: ["Accrediti stampa", "Touch Production Ltd", "Touch Cinema"], stato: "in allestimento" },
  { slug: "cannes", nome: "Cannes", area: "Francia", perche: "Festival del Cinema e mercato internazionale.", highlights: ["Presidio media", "Coproduzioni"], stato: "in allestimento" },
  { slug: "calella", nome: "Calella de la Catalunya", area: "Spagna · Barcellona", perche: "Base del Reality Show Spagna 2026.", highlights: ["HTop Calella Palace Hotel", "15 puntate + 8 partite integrali", "Staff e collaboratori"], stato: "attivo" },
  { slug: "pietrapaola", nome: "Pietrapaola Marina", area: "Calabria", perche: "Villaggi, spiagge e locali del circuito.", highlights: ["Hotel Villaggio Il Carlino", "BlackPearl paninoteca & cocktail bar", "Copacabana Beach"], stato: "attivo" },
  { slug: "gargano", nome: "Costa Garganica — da Vieste a Peschici", area: "Puglia", perche: "Turismo, villaggi, ristorazione e immobiliare.", highlights: ["Villaggio e Ristorante La Gemma", "Market & Panzerotteria Da Nunzia", "Vieste.it · Gargano Real Estate"], stato: "attivo" },
  { slug: "sardegna", nome: "Sardegna — Olbia", area: "Sardegna", perche: "Ex Geovillage e polo eventi/sport.", highlights: ["Olbia — ex Geovillage", "Ritiri sportivi ed eventi"], stato: "in allestimento" },
  { slug: "sicilia", nome: "Sicilia", area: "Sicilia", perche: "Isole Eolie, Sommatino, Catania, Custonaci, Palermo, Messina.", highlights: ["Villa Zina Resort — Custonaci", "Isole Eolie", "Sommatino · Catania · Palermo · Messina"], stato: "attivo" },
];

/* ─────────────────────────  MOTORSPORT  ───────────────────────── */

export const CIRCUITI = [
  { nome: "Misano World Circuit Marco Simoncelli", citta: "Misano Adriatico (RN)", sito: "https://www.misanocircuit.com" },
  { nome: "Autodromo Enzo e Dino Ferrari", citta: "Imola (BO)", sito: "https://www.autodromoimola.it" },
  { nome: "Autodromo Nazionale Monza", citta: "Monza (MB)", sito: "https://www.monzanet.it" },
  { nome: "Autodromo di Cremona", citta: "San Martino del Lago (CR)", sito: "https://www.cremonacircuit.it" },
  { nome: "Autodromo Piero Taruffi — Vallelunga", citta: "Campagnano di Roma (RM)", sito: "https://www.vallelunga.it" },
  { nome: "Autodromo Riccardo Paletti", citta: "Varano de' Melegari (PR)", sito: "https://www.autodromovarano.it" },
  { nome: "Autodromo di Pomposa", citta: "Codigoro (FE)", sito: null },
  { nome: "Adria International Raceway", citta: "Adria (RO)", sito: null },
  { nome: "Autodromo Internazionale del Mugello", citta: "Scarperia (FI)", sito: "https://www.mugellocircuit.com" },
  { nome: "Circuit de Monaco", citta: "Monte Carlo", sito: null },
  { nome: "Circuit de Barcelona-Catalunya", citta: "Montmeló (Barcellona)", sito: "https://www.circuitcat.com" },
  { nome: "TT Circuit Assen", citta: "Assen (NL)", sito: "https://www.ttcircuit.com" },
  { nome: "Automotodrom Brno", citta: "Brno (CZ)", sito: null },
];

export const CAMPIONATI_MOTORI = [
  { nome: "Formula 1", sito: "https://www.formula1.com", nota: "Campionato mondiale FIA." },
  { nome: "MotoGP", sito: "https://www.motogp.com", nota: "Organizzazione Dorna Sports." },
  { nome: "WorldSBK — Superbike", sito: "https://www.worldsbk.com", nota: "Mondiale Superbike, Dorna." },
  { nome: "CIV — Campionato Italiano Velocità", sito: "https://www.civ.tv", nota: "FMI." },
  { nome: "Formula 4 Italia", sito: "https://www.acisport.it", nota: "ACI Sport." },
  { nome: "Grand Prix Endurance", sito: null, nota: "Calendario in allestimento." },
  { nome: "HR Challenge", sito: null, nota: "Calendario in allestimento." },
  { nome: "WDW 2026 — World Ducati Week", sito: "https://www.ducati.com", nota: "Misano World Circuit." },
];

export const PARTNER_TECNICI = [
  { nome: "Dorna Sports", sito: "https://www.dorna.com", nota: "Promotore MotoGP e WorldSBK." },
  { nome: "Acerbis", sito: "https://www.acerbis.com", nota: "Componentistica e abbigliamento." },
  { nome: "Motul", sito: "https://www.motul.com", nota: "Lubrificanti." },
  { nome: "Ducati", sito: "https://www.ducati.com", nota: "WDW 2026." },
];

/* ─────────────────────────  CALCIO  ───────────────────────── */

export const CAMPIONATI_CALCIO = [
  { nome: "Serie D", sezione: "Nazionale", fonte: "https://www.dilettanti.figc.it", nota: "Dipartimento Interregionale FIGC." },
  { nome: "Eccellenza — Emilia-Romagna", sezione: "Emilia e Romagna", fonte: "https://www.tuttocampo.it/EmiliaRomagna/Eccellenza", nota: "Classifiche, risultati, prossimo turno." },
  { nome: "Promozione — Emilia-Romagna", sezione: "Emilia e Romagna", fonte: "https://www.tuttocampo.it/EmiliaRomagna/Promozione", nota: "Classifiche, risultati, prossimo turno." },
  { nome: "Prima Categoria — Girone H", sezione: "Emilia e Romagna", fonte: "https://www.tuttocampo.it/EmiliaRomagna/PrimaCategoria/GironeH", nota: "Girone di Verucchio e Victoria 1968." },
  { nome: "Eccellenza — Marche", sezione: "Marche", fonte: "https://www.tuttocampo.it/Marche/Eccellenza", nota: "Sezione Marche." },
  { nome: "Promozione — Marche", sezione: "Marche", fonte: "https://www.tuttocampo.it/Marche/Promozione", nota: "Sezione Marche." },
  { nome: "Prima Categoria — Marche", sezione: "Marche", fonte: "https://www.tuttocampo.it/Marche/PrimaCategoria", nota: "Sezione Marche." },
];

export const FONTI_CALCIO = [
  { nome: "Tutto Campo", sito: "https://www.tuttocampo.it", nota: "Portale nazionale dei dilettanti: classifiche, risultati, rose." },
  { nome: "Romagna Sport", sito: "https://www.romagnasport.com", nota: "Risultati e classifiche Romagna." },
  { nome: "Emilia Romagna Sport", sito: "https://www.emiliaromagnasport.com", nota: "Risultati e classifiche regionali." },
  { nome: "Giovanili Rimini", sito: "https://www.giovanilerimini.org", nota: "Settore giovanile riminese." },
  { nome: "SportUp / DM TV", sito: "https://youtube.com/@danielemanuelli1981", nota: "Dirette lunedì 19:45 e 20:30, anteprima venerdì." },
];

/* ─────────────────────────  MEDIA: RADIO · TV · RIVISTE · TG  ───────────────────────── */

export const RADIO = [
  { nome: "RadioSanremo", sito: "https://www.radiosanremo.it", nota: "Palinsesto e diretta sul sito ufficiale." },
  { nome: "Radio Montecarlo 2", sito: "https://www.rmc2.net", nota: "Palinsesto e diretta sul sito ufficiale." },
  { nome: "Radio Milano Lombardia", sito: "https://radiomilanolombardia.it", nota: "Palinsesto e diretta sul sito ufficiale." },
  { nome: "Radio Venezia", sito: "https://radiovenezia.com", nota: "Palinsesto e diretta sul sito ufficiale." },
  { nome: "Radio Match Music", sito: "https://www.rmc2.net/webradio/mc2-match-music-channel", nota: "Canale web MC2 — palinsesto sul sito ufficiale." },
  { nome: "Radio Match Music Europa", sito: null, nota: "Radio partner — link del canale europeo da confermare." },
  { nome: "Touch Music Radio", sito: null, nota: "Radio del gruppo (TBH-A14) — in allestimento." },
];

export const TV = [
  { nome: "RaiPlay", sito: "https://www.raiplay.it", nota: "Diretta e on demand Rai." },
  { nome: "Mediaset Infinity", sito: "https://mediasetinfinity.mediaset.it", nota: "Diretta e on demand Mediaset." },
  { nome: "Pluto TV", sito: "https://pluto.tv/it", nota: "Canali gratuiti." },
  { nome: "Rakuten TV", sito: "https://rakuten.tv", nota: "Film e canali free." },
  { nome: "Tivù.tv", sito: "https://www.tivu.tv", nota: "Guida canali in chiaro." },
  { nome: "Touch TV · Touch Music TV", sito: null, nota: "Canali del gruppo — in allestimento." },
];

export const TG = [
  { nome: "Rainews24", sito: "https://www.rainews.it", nota: "Diretta all news." },
  { nome: "Sky TG24", sito: "https://tg24.sky.it", nota: "Diretta all news." },
  { nome: "TGCom24", sito: "https://www.tgcom24.mediaset.it", nota: "Diretta all news." },
  { nome: "TG1", sito: "https://www.tg1.rai.it", nota: null },
  { nome: "TG2", sito: "https://www.tg2.rai.it", nota: null },
  { nome: "TG3", sito: "https://www.tg3.rai.it", nota: null },
  { nome: "ANSA", sito: "https://www.ansa.it", nota: "Agenzia di stampa." },
];

export const RIVISTE = [
  { nome: "Touch Influencity Magazine", sito: null, nota: "La rivista ufficiale del gruppo. Rubrica interna: Touch Spotlight." },
  { nome: "Corriere della Sera", sito: "https://www.corriere.it", nota: null },
  { nome: "la Repubblica", sito: "https://www.repubblica.it", nota: null },
  { nome: "Il Sole 24 Ore", sito: "https://www.ilsole24ore.com", nota: null },
  { nome: "La Gazzetta dello Sport", sito: "https://www.gazzetta.it", nota: null },
  { nome: "Quotidiani.net", sito: "https://www.quotidiani.net", nota: "Edicola online." },
];

export const GIOCHI = [
  { nome: "Rebus", nota: "Punti bonus per sconti e omaggi.", stato: "in allestimento" },
  { nome: "Cruciverba", nota: "Punti bonus per sconti e omaggi.", stato: "in allestimento" },
  { nome: "Sudoku", nota: "Punti bonus per sconti e omaggi.", stato: "in allestimento" },
  { nome: "Memory TBH", nota: "Con i loghi del gruppo.", stato: "in allestimento" },
  { nome: "Quiz Touch", nota: "Domande su gruppo, sport e territorio.", stato: "in allestimento" },
];

/** Playlist YouTube "Spot a Vista" — da confermare l'URL definitivo. */
export const SPOT_A_VISTA = {
  nome: "Spot a Vista",
  descrizione: "Playlist video degli spot TBH e delle attività del circuito.",
  url: null as string | null,
};
