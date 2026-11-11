/* ────────────────────────────────────────────────────────────────────────────
   I 10 AMBIENTI DI TBH-WEB — struttura richiesta da Claudio il 06/09/2026.

   HOME 0 (palinsesto) · 8 canali · CONTATTI.
   Ogni ambiente è una MINI-HOMEPAGE del suo settore, con fino a 24 pulsanti.

   REGOLA: qui NON nascono pagine nuove e non si duplica niente. Ogni pulsante
   punta alla pagina canonica che esiste già. Lo stesso contenuto può comparire
   in più ambienti (Hotel Aurora sta in Host e in Home 0): stessa URL, stesso
   logo, stessa pagina. Si riordina la navigazione, non i contenuti.

   Fonte dei percorsi: le rotte dichiarate in app.tsx. Uno script di verifica
   controlla che ogni `to` di questo file esista davvero.
   ──────────────────────────────────────────────────────────────────────────── */

export type PulsanteAmbiente = {
  /** Categoria che compare SOPRA il nome, come da istruzione 04. */
  categoria: string;
  label: string;
  to: string;
};

export type Ambiente = {
  /** Numero di canale: 0 = Home, 1-98 = canali, 99 = CEO/TBH. */
  numero: number;
  slug: string;
  /** Riga piccola sopra il titolo nella card della carrellata. */
  categoria: string;
  nome: string;
  claim: string;
  colore: string;
  /** Pagina canonica dell'ambiente: la card ci porta qui. */
  to: string;
  /** Mini-homepage del settore: fino a 24 pulsanti, tutti già esistenti. */
  pulsanti: PulsanteAmbiente[];
};

const NEON = "#d7ff00";
const ROSSO_DM = "#ff2b2b";
const ARANCIO = "#ff8a00";
const AZZURRO = "#33e0ff";
const BLU = "#2f7bff";
const VERDE = "#9dff3c";
const ORO = "#e2c37a";
const ROSA = "#ff5bb0";

export const AMBIENTI: Ambiente[] = [
  {
    numero: 0,
    slug: "home",
    categoria: "Palinsesto",
    nome: "HOME 0",
    claim: "La guida generale: canali, novità e contenuti in evidenza.",
    colore: NEON,
    to: "/check-web",
    pulsanti: [],
  },

  /* ── 1 ─────────────────────────────────────────────────────────────────── */
  {
    numero: 1,
    slug: "business-finance",
    categoria: "Finanza",
    nome: "TOUCH FINANCE",
    claim: "Conti, pagamenti, rate, finanziamenti e referral del gruppo.",
    colore: ORO,
    to: "/business-desk",
    pulsanti: [
      { categoria: "Sportello", label: "Business Desk", to: "/business-desk" },
      { categoria: "Pagamenti", label: "Pagamenti, rate e finanziamenti", to: "/pagamenti" },
      { categoria: "Referral", label: "Servizi & Referral", to: "/servizi-referral" },
      { categoria: "Programma", label: "25 Livelli TBH", to: "/tbh/livelli" },
      { categoria: "Assistenza", label: "TBH Assist", to: "/tbh-assist" },
      { categoria: "Rete", label: "Rete commerciale", to: "/network/rete-commerciale" },
      { categoria: "Rete", label: "Clienti TBH", to: "/network/clienti" },
      { categoria: "Rete", label: "Sponsor TBH", to: "/network/sponsor" },
      { categoria: "Rete", label: "Partner TBH", to: "/network/partner" },
      { categoria: "Circuito", label: "Circuito TBH", to: "/network/circuito" },
      { categoria: "Istituzioni", label: "Portali istituzionali", to: "/istituzioni" },
      { categoria: "Contratti", label: "Management · contratti", to: "/management" },
      { categoria: "Vetrina", label: "Brand & personalizzazioni", to: "/tbh/brand-personalizzazioni" },
      { categoria: "Vetrina", label: "Visibilità in onda", to: "/tbh/brand-personalizzazioni/visibilita-in-onda" },
      { categoria: "Offerte", label: "Offerte del periodo", to: "/offerte" },
      { categoria: "Scouting", label: "HVS · High Visibility Scout", to: "/hvs" },
      { categoria: "Anagrafica", label: "Anagrafica master TBH", to: "/anagrafica" },
    ],
  },

  /* ── 2 ─────────────────────────────────────────────────────────────────── */
  {
    numero: 2,
    slug: "media-dm",
    categoria: "Media",
    nome: "TOUCH MEDIA & DM",
    claim: "Magazine, TV, radio, news, video e i programmi di DM Comunicazioni.",
    colore: ROSSO_DM,
    to: "/media",
    pulsanti: [
      { categoria: "Media", label: "Media Hub TBH", to: "/media" },
      { categoria: "Editoria", label: "Touch Influencity Magazine", to: "/influencity" },
      { categoria: "Editoria", label: "Speciali annuali", to: "/influencity/speciali" },
      { categoria: "Editoria", label: "Fashion & riviste", to: "/fashion" },
      { categoria: "News", label: "News TBH", to: "/news" },
      { categoria: "TV", label: "TV, radio e streaming", to: "/tv-radio-streaming" },
      { categoria: "Radio", label: "Radio, TV & curiosità", to: "/media/radio-tv" },
      { categoria: "Streaming", label: "Streaming", to: "/media/streaming" },
      { categoria: "Video", label: "Loghi e collegamenti ufficiali", to: "/media/libreria" },
      { categoria: "Video", label: "HEDDY Video", to: "/media/heddy-video" },
      { categoria: "Produzioni", label: "Produzioni TBH", to: "/tbh/produzioni" },
      { categoria: "Produzioni", label: "Reality Show", to: "/media/reality-show" },
      { categoria: "Produzioni", label: "Reality · Academy", to: "/media/reality-show/academy" },
      { categoria: "Musica", label: "Musica TBH", to: "/musica" },
      { categoria: "Musica", label: "J.C. Hugò", to: "/musica/jc-hugo" },
      { categoria: "DM", label: "DM Comunicazioni", to: "/dm" },
      { categoria: "DM", label: "DM Crew", to: "/media/dm/crew" },
      { categoria: "DM", label: "Archivio highlights DM", to: "/sport/highlights-dm" },
      { categoria: "Media partner", label: "Media Partner TBH", to: "/network/media-partner" },
      { categoria: "Palinsesto", label: "Guida ai canali", to: "/guida" },
    ],
  },

  /* ── 3 ─────────────────────────────────────────────────────────────────── */
  {
    numero: 3,
    slug: "sport-motorsport",
    categoria: "Sport",
    nome: "TOUCH SPORTS",
    claim: "Calcio, squadre seguite, circuiti, motorsport ed eventi sportivi.",
    colore: BLU,
    to: "/sport",
    pulsanti: [
      { categoria: "Sport", label: "Sport Hub", to: "/sport" },
      { categoria: "Calcio", label: "Calcio e stampa sportiva", to: "/sport/calcio" },
      { categoria: "Calcio", label: "Le società di calcio", to: "/sport/squadre" },
      { categoria: "Calcio", label: "Società seguite", to: "/sport/societa-seguite" },
      { categoria: "Video", label: "Archivio highlights DM", to: "/sport/highlights-dm" },
      { categoria: "Motori", label: "Motorsport TBH", to: "/sport/motorsport" },
      { categoria: "Motori", label: "Cremona Circuit 2026", to: "/cremona-circuit-2026" },
      { categoria: "Academy", label: "Touch Academy", to: "/touch-academy" },
      { categoria: "Academy", label: "Academy & reclutamento", to: "/media/reality-show/academy" },
      { categoria: "Community", label: "Capitan Touch", to: "/capitan-touch" },
      { categoria: "Media partner", label: "DM Comunicazioni", to: "/dm" },
      { categoria: "Territorio", label: "Mappa del territorio", to: "/territorio/mappa" },
    ],
  },

  /* ── 4 ─────────────────────────────────────────────────────────────────── */
  {
    numero: 4,
    slug: "host-turismo",
    categoria: "Hospitality",
    nome: "TOUCH HOST",
    claim: "Hotel, ristoranti, locali, esperienze, viaggi e territorio.",
    colore: AZZURRO,
    to: "/hospitality",
    pulsanti: [
      { categoria: "Hospitality", label: "Hospitality TBH", to: "/hospitality" },
      { categoria: "Strutture", label: "Hotel e strutture", to: "/hospitality/hotel" },
      { categoria: "Struttura", label: "Hotel Aurora", to: "/hotel-aurora" },
      { categoria: "Ristorazione", label: "Ristoranti", to: "/hospitality/ristoranti" },
      { categoria: "Locali", label: "Locali e beach", to: "/hospitality/locali" },
      { categoria: "Esperienze", label: "Esperienze", to: "/hospitality/esperienze" },
      { categoria: "Mobilità", label: "Transfer e mobilità", to: "/hospitality/transfer" },
      { categoria: "Viaggi", label: "Touch Travels", to: "/touch-travels" },
      { categoria: "Territorio", label: "Mappa del territorio", to: "/territorio/mappa" },
      { categoria: "Territorio", label: "Spazi territoriali", to: "/territorio/spazi" },
      {
        categoria: "Territorio",
        label: "Rimini · dove dormire, mangiare e divertirsi",
        to: "/territorio/rimini/dove-dormire-mangiare-divertirsi",
      },
      { categoria: "Eventi", label: "Calendario fiere ed eventi", to: "/eventi/fiere-internazionali" },
      { categoria: "Eventi", label: "Hugoland", to: "/hugoland" },
      { categoria: "Eventi", label: "Area Sanremo", to: "/sanremo" },
      { categoria: "Eventi", label: "Pride Village Padova", to: "/pride-village" },
      { categoria: "Eventi", label: "Touch Miss Cool", to: "/eventi/miss-cool" },
      { categoria: "Circuito", label: "Circuito TBH", to: "/network/circuito" },
    ],
  },

  /* ── 5 ─────────────────────────────────────────────────────────────────── */
  {
    numero: 5,
    slug: "lavoro-community",
    categoria: "Lavoro",
    nome: "TOUCH JOBS",
    claim: "Offerte, casting, academy, community e giochi con premi.",
    colore: VERDE,
    to: "/lavoro-casting",
    pulsanti: [
      { categoria: "Lavoro", label: "Job & Casting", to: "/lavoro-casting" },
      { categoria: "Annunci", label: "Bacheca annunci", to: "/lavoro-casting/bacheca" },
      { categoria: "Formazione", label: "Touch Academy", to: "/touch-academy" },
      { categoria: "Selezioni", label: "Academy & reclutamento", to: "/media/reality-show/academy" },
      { categoria: "Scouting", label: "HVS · High Visibility Scout", to: "/hvs" },
      { categoria: "Community", label: "Community TBH", to: "/community" },
      { categoria: "Community", label: "TBH Club", to: "/club" },
      { categoria: "Gioco", label: "Giochi di mente", to: "/media/giochi" },
      { categoria: "Gioco", label: "Neuroni premio", to: "/neuroni" },
      { categoria: "Gioco", label: "Capitan Touch", to: "/capitan-touch" },
      { categoria: "Concorsi", label: "Touch Miss Cool", to: "/eventi/miss-cool" },
      { categoria: "Referral", label: "Servizi & Referral", to: "/servizi-referral" },
      { categoria: "Contatti", label: "Contatti e assistenza", to: "/contatti" },
    ],
  },

  /* ── 6 ─────────────────────────────────────────────────────────────────── */
  {
    numero: 6,
    slug: "shop-vetrina",
    categoria: "Shopping",
    nome: "TOUCH PLAZA",
    claim: "Il negozio, i prodotti, i marchi, le offerte e il referral.",
    colore: ARANCIO,
    to: "/shop",
    pulsanti: [
      { categoria: "Negozio", label: "Touch Plaza Shop", to: "/shop" },
      { categoria: "Prodotti", label: "Prodotti TBH", to: "/tbh/prodotti" },
      { categoria: "Offerte", label: "Offerte del periodo", to: "/offerte" },
      { categoria: "Pagamenti", label: "Pagamenti, rate e finanziamenti", to: "/pagamenti" },
      { categoria: "Referral", label: "Servizi & Referral", to: "/servizi-referral" },
      { categoria: "Marchi", label: "Brand & personalizzazioni", to: "/tbh/brand-personalizzazioni" },
      { categoria: "Marchi", label: "Touch Fashion", to: "/tbh/touch-fashion" },
      { categoria: "Vetrina", label: "Visibilità in onda", to: "/tbh/brand-personalizzazioni/visibilita-in-onda" },
      { categoria: "Vetrina", label: "Clienti TBH", to: "/network/clienti" },
      { categoria: "Vetrina", label: "Sponsor TBH", to: "/network/sponsor" },
      { categoria: "Servizi", label: "Tutti i servizi TBH", to: "/tbh/servizi" },
      { categoria: "App", label: "TBH App · download e archivio", to: "/tbh-app" },
    ],
  },

  /* ── 7 ─────────────────────────────────────────────────────────────────── */
  {
    numero: 7,
    slug: "societa-servizi",
    categoria: "Gruppo",
    nome: "SOCIETÀ & SERVIZI",
    claim: "Le società con P.IVA, le attività del gruppo, i servizi e il circuito.",
    colore: NEON,
    to: "/tbh/societa",
    pulsanti: [
      { categoria: "Gruppo", label: "Società con P.IVA", to: "/tbh/societa" },
      { categoria: "Gruppo", label: "Attività del gruppo", to: "/tbh/attivita" },
      { categoria: "Anagrafica", label: "Registro entità TBH", to: "/tbh/registro" },
      { categoria: "Anagrafica", label: "Anagrafica master TBH", to: "/anagrafica" },
      { categoria: "Servizi", label: "Tutti i servizi TBH", to: "/tbh/servizi" },
      { categoria: "Servizi", label: "TBH Assist", to: "/tbh-assist" },
      { categoria: "Produzioni", label: "Produzioni TBH", to: "/tbh/produzioni" },
      { categoria: "Network", label: "TBH Network", to: "/network" },
      { categoria: "Network", label: "Circuito TBH", to: "/network/circuito" },
      { categoria: "Network", label: "Partner TBH", to: "/network/partner" },
      { categoria: "Network", label: "Media Partner TBH", to: "/network/media-partner" },
      { categoria: "Network", label: "Rete commerciale", to: "/network/rete-commerciale" },
      { categoria: "Programma", label: "25 Livelli TBH", to: "/tbh/livelli" },
      { categoria: "Indice", label: "Pagine TBH", to: "/tbh/pagine" },
      { categoria: "Indice", label: "Mappa del sito", to: "/mappa-sito" },
      { categoria: "Contratti", label: "Management · contratti", to: "/management" },
    ],
  },

  /* ── 8 ─────────────────────────────────────────────────────────────────── */
  {
    numero: 99,
    slug: "ceo-tbh",
    categoria: "Istituzionale",
    nome: "CEO / TBH",
    claim: "Identità, guida del gruppo, ruoli e visione: la cabina di regia.",
    colore: ORO,
    to: "/ceo",
    pulsanti: [
      { categoria: "Istituzionale", label: "Editore · CEO · Artista · Imprenditore", to: "/ceo" },
      { categoria: "Gruppo", label: "Società con P.IVA", to: "/tbh/societa" },
      { categoria: "Gruppo", label: "Attività del gruppo", to: "/tbh/attivita" },
      { categoria: "Identità", label: "Design system TBH", to: "/design" },
      { categoria: "Indice", label: "Pagine TBH", to: "/tbh/pagine" },
      { categoria: "Indice", label: "Mappa del sito", to: "/mappa-sito" },
      { categoria: "Palinsesto", label: "Guida ai canali", to: "/guida" },
      { categoria: "Contatti", label: "Contatti e assistenza", to: "/contatti" },
    ],
  },

  /* ── 9 ─────────────────────────────────────────────────────────────────── */
  {
    numero: 9,
    slug: "contatti",
    categoria: "Contatti",
    nome: "CONTATTI",
    claim: "Un solo hub contatti: WhatsApp, telefoni, email e social.",
    colore: ROSA,
    to: "/contatti",
    pulsanti: [
      { categoria: "Contatti", label: "Contatti e assistenza", to: "/contatti" },
      { categoria: "Social", label: "Touch Social", to: "/contatti-social" },
      { categoria: "Sportello", label: "Business Desk", to: "/business-desk" },
      { categoria: "Assistenza", label: "TBH Assist", to: "/tbh-assist" },
      { categoria: "Lavoro", label: "Job & Casting", to: "/lavoro-casting" },
      { categoria: "Indice", label: "Mappa del sito", to: "/mappa-sito" },
      { categoria: "Ricerca", label: "Cerca nel sito", to: "/cerca" },
    ],
  },
];

/** I canali della carrellata: tutto tranne la Home, che è la pagina stessa. */
export const AMBIENTI_CARRELLATA = AMBIENTI.filter((a) => a.slug !== "home");

export function ambientePerSlug(slug: string): Ambiente | undefined {
  return AMBIENTI.find((a) => a.slug === slug);
}
