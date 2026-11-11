/**
 * ECOSISTEMA TBH — brief punti 02, 04, 09, 10, 11, 19, 20, 21, 22, 26, 29.
 *
 * REGOLE RISPETTATE ALLA LETTERA:
 * · nessun logo, contatto, URL, social o prezzo inventato;
 * · nessuna offerta o codice promozionale inventato: il motore è predisposto e VUOTO
 *   finché Claudio non fornisce le promozioni reali (slot visibile, contenuto onesto);
 * · un'attività presente nel portale NON diventa automaticamente cliente o aderente
 *   al Circuito: il badge compare solo con vantaggi realmente attivi (punto 04);
 * · nessuna promessa di guadagno o ritorno garantito (punto 11);
 * · nessun QR fuori dalle funzioni per cui è espressamente richiesto (punto 28).
 */

/* ─────────────────────────────  MONDI (punto 02 + 29)  ───────────────────────────── */

export type Mondo = {
  slug: string;
  nome: string;
  claim: string;
  /** Colore funzionale del mondo: entra come bordo/glow/titolo, mai come sfondo. */
  colore: string;
  to: string;
  categorie: { label: string; to: string }[];
};

export const MONDI: Mondo[] = [
  {
    slug: "tbh",
    nome: "TBH",
    claim: "Il gruppo, le società, le attività, i livelli",
    colore: "#d7ff00",
    to: "/tbh/societa",
    categorie: [
      { label: "Società con P.IVA", to: "/tbh/societa" },
      { label: "Attività del gruppo", to: "/tbh/attivita" },
      { label: "Servizi", to: "/tbh/servizi" },
      { label: "25 Livelli TBH", to: "/tbh/livelli" },
      { label: "Registro entità", to: "/tbh/registro" },
    ],
  },
  {
    slug: "touch-plaza",
    nome: "TOUCH PLAZA",
    claim: "Il centro commerciale digitale: prodotti e servizi",
    colore: "#ff8a00",
    to: "/shop",
    categorie: [
      { label: "Prodotti", to: "/shop" },
      { label: "Servizi", to: "/tbh/servizi" },
      { label: "Offerte e codici", to: "/offerte" },
      { label: "Pagamenti e rate", to: "/pagamenti" },
    ],
  },
  {
    slug: "fan-club",
    nome: "TBH FAN CLUB",
    claim: "Club, Circuito, vantaggi e adesioni",
    colore: "#ff3df0",
    to: "/club",
    categorie: [
      { label: "Adesioni", to: "/club" },
      { label: "Circuito TBH", to: "/network/circuito" },
      { label: "Community", to: "/community" },
    ],
  },
  {
    slug: "dm-comunicazioni",
    nome: "DM COMUNICAZIONI",
    claim: "Media partner autonomo: interviste, sport, dirette",
    colore: "#ff2b2b",
    to: "/dm",
    categorie: [
      { label: "Programmi", to: "/dm" },
      { label: "Brand in onda", to: "/tbh/brand-personalizzazioni/visibilita-in-onda" },
      { label: "Streaming", to: "/media/streaming" },
    ],
  },
  {
    slug: "influencity",
    nome: "INFLUENCITY MAGAZINE",
    claim: "Edicola digitale dal numero 0 a oggi",
    colore: "#9dff3c",
    to: "/influencity",
    categorie: [
      { label: "Edicola digitale", to: "/influencity" },
      { label: "Speciali annuali", to: "/influencity/speciali" },
      { label: "Touch Spotlight (rubrica)", to: "/influencity" },
    ],
  },
  {
    slug: "news",
    nome: "NEWS",
    claim: "Ultime notizie del portale e del territorio",
    colore: "#9dff3c",
    to: "/news",
    categorie: [
      { label: "Tutte le news", to: "/news" },
      { label: "TBH News", to: "/news/tbh-news" },
      { label: "Sport", to: "/news/sport" },
    ],
  },
  {
    slug: "sport",
    nome: "SPORT",
    claim: "Squadre, campionati, motorsport",
    colore: "#2f7bff",
    to: "/sport",
    categorie: [
      { label: "Squadre partner", to: "/sport/squadre" },
      { label: "Calcio", to: "/sport/calcio" },
      { label: "Motorsport", to: "/sport/motorsport" },
    ],
  },
  {
    slug: "eventi",
    nome: "EVENTI",
    claim: "Calendario, concorsi, spettacolo",
    colore: "#ff5bb0",
    to: "/eventi/fiere-internazionali",
    categorie: [
      { label: "Calendario eventi", to: "/eventi/fiere-internazionali" },
      { label: "Touch Miss Cool", to: "/eventi/miss-cool" },
    ],
  },
  {
    slug: "hospitality",
    nome: "HOSPITALITY",
    claim: "Hotel, ristoranti, locali, esperienze, prenotazioni",
    colore: "#33e0ff",
    to: "/hospitality",
    categorie: [
      { label: "Hotel", to: "/hospitality/hotel" },
      { label: "Ristoranti", to: "/hospitality/ristoranti" },
      { label: "Locali", to: "/hospitality/locali" },
      { label: "Prenotazione assistita", to: "/tbh-assist" },
    ],
  },
  {
    slug: "attivita",
    nome: "ATTIVITÀ",
    claim: "Negozi, aziende, professionisti sul territorio",
    colore: "#d7ff00",
    to: "/territorio/mappa",
    categorie: [
      { label: "Mappa del territorio", to: "/territorio/mappa" },
      { label: "Rete commerciale", to: "/network/rete-commerciale" },
      { label: "Clienti TBH", to: "/network/clienti" },
    ],
  },
  {
    slug: "servizi",
    nome: "SERVIZI",
    claim: "Servizi del gruppo e TBH Assist",
    colore: "#33e0ff",
    to: "/tbh/servizi",
    categorie: [
      { label: "Servizi del gruppo", to: "/tbh/servizi" },
      { label: "TBH Assist", to: "/tbh-assist" },
      { label: "Business Desk", to: "/business-desk" },
    ],
  },
  {
    slug: "opportunita",
    nome: "OPPORTUNITÀ / CASTING",
    claim: "Lavoro, casting, crew e academy",
    colore: "#ff3df0",
    to: "/lavoro-casting",
    categorie: [
      { label: "Annunci e candidature", to: "/lavoro-casting" },
      { label: "Bacheca", to: "/lavoro-casting/bacheca" },
      { label: "Crew & Academy", to: "/crew-academy" },
    ],
  },
  {
    slug: "music",
    nome: "MUSIC",
    claim: "Deejay, produzioni musicali, radio",
    colore: "#b46bff",
    to: "/media/radio-tv",
    categorie: [
      { label: "TV · Radio · Streaming", to: "/media/streaming" },
      { label: "Radio partner", to: "/media" },
      { label: "Produzioni", to: "/tbh/produzioni" },
    ],
  },
];

/* ───────────────────────  VETRINA "IN EVIDENZA" (punto 03)  ─────────────────────── */

/** Categorie del mockup. Le schede reali arrivano dal registro unico, non da liste doppie. */
export const CATEGORIE_EVIDENZA: { label: string; chiavi: string[]; to: string }[] = [
  { label: "Hotel", chiavi: ["hotel", "hospitality", "resort", "b&b", "villaggio"], to: "/hospitality/hotel" },
  { label: "Locali", chiavi: ["locale", "bar", "disco", "lounge", "cafè", "cafe", "beach"], to: "/hospitality/locali" },
  { label: "Ristoranti", chiavi: ["ristor", "pizz", "food", "trattoria", "paninoteca"], to: "/hospitality/ristoranti" },
  { label: "Negozi", chiavi: ["negozio", "retail", "moda", "fashion", "abbigliamento", "shop"], to: "/territorio/mappa" },
  { label: "Servizi", chiavi: ["serviz", "consulenza", "immobiliare", "formazione", "agenzia"], to: "/tbh/servizi" },
  { label: "Eventi", chiavi: ["event", "concorso", "festival", "fiera", "pride"], to: "/eventi/fiere-internazionali" },
];

/* ─────────────────────  ADESIONI: CLUB E CIRCUITO (punto 11)  ───────────────────── */

export type Adesione = {
  slug: string;
  titolo: string;
  destinatario: string;
  prezzoLabel: string;
  cadenza: string;
  /** Confermato da Claudio il 29/08/2026 come prezzo definitivo. */
  prezzoCents: number;
  ricorrente: boolean;
  incluso: string[];
  nota: string | null;
};

export const ADESIONI: Adesione[] = [
  {
    slug: "tbh-club",
    titolo: "TBH CLUB",
    destinatario: "Consumatore / privato",
    prezzoLabel: "€ 72 / anno",
    cadenza: "Quota annuale rinnovabile",
    prezzoCents: 7200,
    ricorrente: true,
    incluso: [
      "Accesso al Club e alle iniziative riservate ai soci",
      "Vantaggi presso le attività che li hanno realmente attivati",
      "Prenotazione assistita TBH Assist secondo condizioni applicabili",
      "Comunicazioni su eventi, anteprime e appuntamenti del circuito",
    ],
    nota: "L'elenco puntuale dei vantaggi attivi viene pubblicato attività per attività: nessun vantaggio dichiarato se non è realmente in essere.",
  },
  {
    slug: "piva-ambulante",
    titolo: "P.IVA / AMBULANTE",
    destinatario: "Titolare di partita IVA e ambulante",
    prezzoLabel: "€ 91,50 una tantum",
    cadenza: "Ingresso una tantum",
    prezzoCents: 9150,
    ricorrente: false,
    incluso: [
      "Ingresso registrato nel sistema TBH con memoria del primo accesso",
      "Scheda attività nel portale con pagina dedicata",
      "Accesso alle condizioni commerciali riservate agli operatori",
    ],
    nota: "Il sistema conserva memoria dell'avvenuto primo ingresso; le condizioni commerciali successive saranno definite e pubblicate quando disponibili.",
  },
  {
    slug: "circuito-tbh",
    titolo: "CIRCUITO TBH",
    destinatario: "Attività, azienda, locale, struttura",
    prezzoLabel: "€ 915 una tantum",
    cadenza: "Ingresso una tantum",
    prezzoCents: 91500,
    ricorrente: false,
    incluso: [
      "Adesione al Circuito TBH con vetrofania e badge digitale",
      "Pagina dedicata dell'attività con contatti, gallery e azioni",
      "Presenza nella rotazione dei clienti Circuito in Home",
      "Accesso al network, alle convenzioni e agli spazi di visibilità",
      "Possibilità di attivare sconti, promo, cashback e programmi referral",
    ],
    nota: "Vantaggi, cashback, convenzioni e programmi contributivi vengono pubblicati solo quando attivi e documentati. Nessun ritorno economico è promesso o garantito.",
  },
];

export const ADESIONI_NOTA =
  "Prezzi confermati da Touch Business Holding. L'adesione non costituisce promessa di guadagno, " +
  "rendimento o ritorno economico: dà accesso a servizi, visibilità e condizioni del circuito.";

/* ───────────────────────────  HOSPITALITY (punto 09)  ─────────────────────────── */

export const HOSPITALITY_CATEGORIE: { slug: string; label: string; chiavi: string[]; descrizione: string }[] = [
  { slug: "hotel", label: "Hotel e strutture", chiavi: ["hotel", "resort", "villaggio", "camping", "b&b", "motel", "suite"], descrizione: "Strutture ricettive del circuito e partner del territorio." },
  { slug: "ristoranti", label: "Ristoranti", chiavi: ["ristor", "trattoria", "pizz", "paninoteca", "food"], descrizione: "Ristorazione, cucina di territorio, format del gruppo." },
  { slug: "locali", label: "Locali e stabilimenti", chiavi: ["bar", "cafè", "cafe", "beach", "lounge", "disco", "locale", "stabilimento"], descrizione: "Bar, caffetterie, stabilimenti balneari, locali serali." },
  { slug: "esperienze", label: "Esperienze", chiavi: ["parco", "experience", "tour", "escursion", "wellness", "spa"], descrizione: "Esperienze, parchi, benessere, attività da vivere." },
  { slug: "eventi", label: "Eventi", chiavi: ["event", "festival", "fiera", "concorso"], descrizione: "Eventi con servizi di ospitalità collegati." },
  { slug: "transfer", label: "Transfer e mobilità", chiavi: ["rent", "transfer", "noleggio", "mobility", "logistic"], descrizione: "Noleggio, transfer, mobilità e logistica." },
];

export const HOSPITALITY_AZIONI = [
  "VAI AL SITO UFFICIALE — quando la struttura ha un sito verificato",
  "RICHIEDI PRENOTAZIONE ASSISTITA — l'assistenza TBH segue la richiesta",
];

export const HOSPITALITY_NOTA =
  "La prenotazione assistita è disponibile anche a chi non fa parte del Circuito, secondo condizioni " +
  "e prezzi applicabili. Ogni struttura mantiene i propri collegamenti ufficiali: TBH non si sostituisce " +
  "alla struttura e non pubblica disponibilità o tariffe non confermate.";

/* ────────────────────────────  TBH ASSIST (punto 10)  ─────────────────────────── */

export type ServizioAssist = { slug: string; titolo: string; cosaFa: string; comeSiChiede: string };

export const ASSIST_DIGITALE: ServizioAssist[] = [
  { slug: "prenotazioni", titolo: "Prenotazioni assistite", cosaFa: "Ti seguiamo nella richiesta di prenotazione presso strutture, locali ed eventi del circuito.", comeSiChiede: "WhatsApp con nome, data e struttura." },
  { slug: "registrazioni", titolo: "Registrazioni e iscrizioni", cosaFa: "Supporto operativo nella registrazione a portali, piattaforme e iniziative.", comeSiChiede: "WhatsApp indicando il portale." },
  { slug: "acquisti-online", titolo: "Acquisti online", cosaFa: "Assistenza durante l'acquisto: scelta, carrello, pagamento, conferma.", comeSiChiede: "WhatsApp con il link del prodotto." },
  { slug: "configurazioni", titolo: "Configurazioni digitali", cosaFa: "Configurazione di dispositivi, account, app e strumenti di lavoro.", comeSiChiede: "WhatsApp con il dispositivo interessato." },
  { slug: "uso-piattaforme", titolo: "Utilizzo delle piattaforme", cosaFa: "Ti mostriamo come si usa una piattaforma passo per passo.", comeSiChiede: "WhatsApp indicando la piattaforma." },
  { slug: "compilazione-guidata", titolo: "Compilazione guidata", cosaFa: "Compilazione guidata di moduli e richieste digitali, con te.", comeSiChiede: "WhatsApp con il modulo da compilare." },
  { slug: "supporto-operativo", titolo: "Supporto operativo", cosaFa: "Affiancamento operativo su attività digitali ricorrenti.", comeSiChiede: "WhatsApp descrivendo l'attività." },
  { slug: "informazioni", titolo: "Richiesta informazioni", cosaFa: "Ti mettiamo in contatto con la realtà giusta del circuito.", comeSiChiede: "WhatsApp con la richiesta." },
];

export const ASSIST_LIMITE =
  "TBH Assist è assistenza tecnica e digitale. Le attività professionali o regolamentate — fiscali, legali, " +
  "sanitarie, finanziarie, di intermediazione — restano riservate ai soggetti autorizzati: in quei casi " +
  "l'assistenza si limita all'indirizzamento verso il professionista o l'ente competente.";

/* ─────────────────  BANNER, OFFERTE, CODICI (punti 19, 20, 21, 22)  ───────────── */

export type CategoriaBanner =
  | "tbh"
  | "dm"
  | "touch-plaza"
  | "cliente-random"
  | "offerta"
  | "codice"
  | "evento"
  | "hospitality"
  | "influencity"
  | "prodotto-servizio";

export const CATEGORIE_BANNER: { id: CategoriaBanner; label: string }[] = [
  { id: "tbh", label: "Banner TBH" },
  { id: "dm", label: "Banner DM Comunicazioni" },
  { id: "touch-plaza", label: "Banner Touch Plaza" },
  { id: "cliente-random", label: "Banner cliente TBH random" },
  { id: "offerta", label: "Banner offerta del periodo" },
  { id: "codice", label: "Banner codice promozionale" },
  { id: "evento", label: "Banner evento" },
  { id: "hospitality", label: "Banner Hospitality" },
  { id: "influencity", label: "Banner Influencity" },
  { id: "prodotto-servizio", label: "Banner prodotto / servizio" },
];

export type Banner = {
  id: string;
  categoria: CategoriaBanner;
  posizione: "home-alto" | "home-basso" | "colonna" | "sezione";
  priorita: number;
  titolo: string;
  testo: string;
  cta: string;
  to: string;
  immagine: string | null;
  /** ISO date o null = sempre attivo. */
  dal: string | null;
  al: string | null;
  attivo: boolean;
  target: string | null;
};

/**
 * Banner attivi: SOLO rimandi a contenuti reali già pubblicati nel portale.
 * Nessun banner con sconti, percentuali o promesse non confermate.
 */
export const BANNER: Banner[] = [
  {
    id: "bnr-tbh-gruppo",
    categoria: "tbh",
    posizione: "home-alto",
    priorita: 10,
    titolo: "TBH — il circuito che premia",
    testo: "Società, attività, servizi e territorio dentro un solo ecosistema.",
    cta: "Scopri il gruppo",
    to: "/tbh/societa",
    immagine: null,
    dal: null,
    al: null,
    attivo: true,
    target: null,
  },
  {
    id: "bnr-dm-visibilita",
    categoria: "dm",
    posizione: "home-alto",
    priorita: 9,
    titolo: "DM COMUNICAZIONI — media, sport, eventi",
    testo: "Il tuo brand in intervista, in studio, in diretta: 70 posizioni spiegate una per una.",
    cta: "Vedi le posizioni",
    to: "/tbh/brand-personalizzazioni/visibilita-in-onda",
    immagine: null,
    dal: null,
    al: null,
    attivo: true,
    target: null,
  },
  {
    id: "bnr-plaza",
    categoria: "touch-plaza",
    posizione: "home-alto",
    priorita: 8,
    titolo: "TOUCH PLAZA — prodotti e servizi",
    testo: "Il centro commerciale digitale del circuito, con pagamenti e rateizzazioni.",
    cta: "Entra nel Plaza",
    to: "/shop",
    immagine: null,
    dal: null,
    al: null,
    attivo: true,
    target: null,
  },
  {
    id: "bnr-club",
    categoria: "tbh",
    posizione: "home-basso",
    priorita: 7,
    titolo: "ISCRIVITI AL CLUB TBH",
    testo: "Club, P.IVA/Ambulante e Circuito: condizioni chiare, nessuna promessa di guadagno.",
    cta: "Vedi le adesioni",
    to: "/club",
    immagine: null,
    dal: null,
    al: null,
    attivo: true,
    target: null,
  },
  {
    id: "bnr-hospitality",
    categoria: "hospitality",
    posizione: "home-basso",
    priorita: 6,
    titolo: "TBH HOSPITALITY",
    testo: "Hotel, ristoranti, locali ed esperienze con prenotazione assistita.",
    cta: "Apri Hospitality",
    to: "/hospitality",
    immagine: null,
    dal: null,
    al: null,
    attivo: true,
    target: null,
  },
  {
    id: "bnr-influencity",
    categoria: "influencity",
    posizione: "sezione",
    priorita: 5,
    titolo: "INFLUENCITY MAGAZINE",
    testo: "Edicola digitale dal numero 0 (giugno/luglio 2022) a oggi.",
    cta: "Apri l'edicola",
    to: "/influencity",
    immagine: null,
    dal: null,
    al: null,
    attivo: true,
    target: null,
  },
];

export type Offerta = {
  id: string;
  titolo: string;
  periodo: string;
  descrizione: string;
  prezzoOriginaleCents: number | null;
  prezzoPromoCents: number | null;
  prezzoCircuitoCents: number | null;
  dal: string | null;
  al: string | null;
  condizioni: string | null;
  cta: string;
  to: string;
  attiva: boolean;
};

/**
 * MOTORE OFFERTE PERIODICHE — predisposto e VUOTO.
 * Nessuna offerta, percentuale o scadenza è stata inventata: appena Claudio fornisce
 * le promozioni reali entrano qui e compaiono in Home, nei banner e nella pagina Offerte.
 */
export const OFFERTE: Offerta[] = [];

export const TIPI_PERIODO = [
  "Offerta del giorno",
  "Settimana",
  "Weekend",
  "Mese",
  "Stagione",
  "Evento",
  "Black Friday",
  "Natale",
  "Sanremo",
  "Estate",
  "Halloween",
  "Anniversari",
  "Promozione speciale",
];

export type CodicePromo = {
  codice: string;
  descrizione: string;
  valore: string;
  dal: string | null;
  al: string | null;
  ambito: string;
  soloCircuito: boolean;
  utilizziMax: number | null;
  attivo: boolean;
};

/** GESTIONE CODICI — predisposta e VUOTA: nessun codice inventato. */
export const CODICI: CodicePromo[] = [];

export const PROMO_NOTA =
  "Il motore promozionale è attivo e pronto: offerte periodiche, prezzi Circuito e codici entrano " +
  "in tutte le vetrine del portale nel momento in cui vengono forniti. Finché non sono confermati " +
  "non viene pubblicato nessuno sconto, nessuna percentuale e nessuna scadenza.";
