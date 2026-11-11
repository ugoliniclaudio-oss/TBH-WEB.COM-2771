/* ────────────────────────────────────────────────────────────────────────────
   KIT UFFICIALE DI OGNI SOCIETÀ / ATTIVITÀ DEL GRUPPO — 02/10/2026.

   Claudio: «di ogni società abbiamo creato apposita scheda, logo pulsante e logo
   con timbro e firma. Slide annunci di lavoro, settore, ruoli eccetera.
   Articoli per negozio in allestimento».

   Ogni società e ogni attività ha quindi lo stesso kit, sempre negli stessi spazi
   (REGOLA GLOBALE «ANTEPRIMA → PULSANTE → SCHEDA» del 02/10/2026):
     1. LOGO                 → SOLO allestimento e identità: non è un pulsante
     2. LOGO PULSANTE        → logo + appartenenza (es. R.F.A. + TBH): l'anteprima
                               cliccabile che apre la scheda da tutto il sito
     3. SCHEDA UFFICIALE     → la slide-scheda con identità, mission, servizi
     4. TIMBRO E FIRMA       → logo con timbro e firma del legale rappresentante
     5. ANNUNCI DI LAVORO    → slide con settore e ruoli ricercati
     6. ARTICOLI NEGOZIO     → prodotti della società nello shop (in allestimento)
   Più la GALLERIA: altre slide e foto, aggiunte qui senza toccare la pagina.

   REGOLA: qui entra SOLO materiale inviato da Claudio, trascritto com'è.
   Uno spazio senza materiale resta null e la pagina scrive «in arrivo» /
   «in allestimento»: nessun testo, ruolo, prezzo o articolo inventato.
   ──────────────────────────────────────────────────────────────────────────── */

export type VoceIdentita = { etichetta: string; valore: string };

export type AnnuncioKit = {
  titolo: string;
  settore: string;
  ruoli: string[];
  immagine: string | null;
};

export type ArticoloKit = {
  titolo: string;
  /** Slug dello shop, se l'articolo è già a listino. */
  slugShop: string | null;
};

import { TBH, type Appartenenza } from "./appartenenza";
import type { Slide } from "../components/galleria-slide";

export type KitSocieta = {
  /** Codice TBH: è anche l'indirizzo della pagina (/tbh/societa/tbh-008).
   *  Per la capogruppo, che un codice TBH non ce l'ha, è lo slug della pagina. */
  codice: string;
  /** true solo per Touch Business Holding: la testata scrive «Capogruppo», non un codice. */
  capogruppo?: boolean;
  /** Altri indirizzi che aprono la stessa pagina (nessuna pagina doppia). */
  alias: string[];
  nome: string;
  acronimo: string | null;
  sottotitolo: string | null;
  /** Parole chiave della fascia alta della scheda. */
  aree: string[];
  motto: string[];
  claim: string | null;
  /** Circuito reale di appartenenza (regola globale, punto 4): mai inventato. */
  appartenenza: Appartenenza;
  materiali: {
    /** SOLO LOGO: allestimento, intestazioni, identità. NON è un pulsante. */
    logo: string | null;
    /** Versione originale del logo, con il suo fondo, così come è stata consegnata. */
    logoOriginale: string | null;
    /** LOGO PULSANTE = logo + appartenenza (es. R.F.A. + Touch Business Holding):
     *  è l'anteprima cliccabile che apre questa scheda da tutto il sito. */
    logoPulsante: string | null;
    schedaUfficiale: string | null;
    timbroFirma: string | null;
    /** true quando il logo pulsante ufficiale è una colonna verticale: nelle griglie di card
     *  (riquadri orizzontali) diventerebbe minuscolo, quindi lì si usa il LOGO su fondo nero
     *  con sotto la fascia d'appartenenza; la colonna intera resta nella galleria della scheda. */
    pulsanteVerticale?: boolean;
  };
  /** Altre slide / foto / grafiche: si aggiungono qui e compaiono nella galleria. */
  galleria: Slide[];
  identita: VoceIdentita[];
  mission: string | null;
  valori: string[];
  attivita: string[];
  servizi: string[];
  divise: string[];
  /** Pagine interne collegate alla stessa entità (un record, più pagine). */
  collegamenti: { label: string; href: string }[];
  annunciLavoro: AnnuncioKit[];
  articoliNegozio: ArticoloKit[];
};

export const KIT_SOCIETA: KitSocieta[] = [
  {
    /* Materiale inviato il 02/10/2026: stemma, timbro e firma, banner con TBH,
       scheda ufficiale. Testi trascritti dalla scheda, parola per parola. */
    codice: "TBH-008",
    alias: ["rfa", "rfa-rimini-football-academy"],
    nome: "R.F.A. Rimini Football Academy",
    acronimo: "R.F.A.",
    sottotitolo: "Società Sportiva Dilettantistica · Nel gruppo Touch Business Holding",
    aree: ["Media", "Eventi", "Sport", "Formazione", "Territorio"],
    motto: ["Unity", "Strength", "Passion"],
    claim: "La nostra città, il nostro campo, il nostro futuro.",
    appartenenza: TBH,
    materiali: {
      logo: "/societa/rfa/stemma.png",
      logoOriginale: "/societa/rfa/stemma-originale.jpg",
      logoPulsante: "/societa/rfa/banner-gruppo.jpg",
      schedaUfficiale: "/societa/rfa/scheda-ufficiale.jpg",
      timbroFirma: "/societa/rfa/timbro-firma.jpg",
    },
    /* Scheda «Dati aziendali» ricevuta il 03/09/2026, aggiunta il 03/10/2026. */
    galleria: [{ src: "/societa/rfa/dati-aziendali.jpg", titolo: "Dati aziendali" }],
    identita: [
      { etichetta: "Denominazione", valore: "A.S.D. Giovanile Rimini (Rimini Football Academy)" },
      { etichetta: "Acronimo", valore: "R.F.A." },
      { etichetta: "Natura giuridica", valore: "Associazione Sportiva Dilettantistica (A.S.D.)" },
      { etichetta: "Anno di fondazione", valore: "2002" },
      { etichetta: "Sede legale", valore: "Rimini (RN) – Italia" },
      { etichetta: "Codice fiscale", valore: "04124660400" },
      { etichetta: "P.IVA", valore: "04124660400" },
      {
        etichetta: "Affiliazione",
        valore: "FIGC – Settore Giovanile e Scolastico (eventuali codici da aggiornare)",
      },
      { etichetta: "Presidente", valore: "Claudio Ugolini" },
      { etichetta: "Direzione sportiva", valore: "Staff tecnico RFA" },
    ],
    mission:
      "Formare giovani calciatori dentro e fuori dal campo, attraverso sport, disciplina, rispetto e valori condivisi, con l'obiettivo di far crescere persone e talenti, rappresentando Rimini e il suo territorio.",
    valori: ["Passione", "Rispetto", "Disciplina", "Unità", "Crescita", "Impegno"],
    attivita: [
      "Scuola calcio (base)",
      "Settore giovanile",
      "Attività agonistica e amatoriale",
      "Camp estivi e stage",
      "Tornei ed eventi",
      "Formazione tecnica",
      "Progetti sociali e inclusivi",
      "Collaborazioni e partnership nazionali e internazionali",
    ],
    servizi: [
      "Scuola calcio",
      "Settore giovanile",
      "Academy internazionale",
      "Camp & stage",
      "Tornei & eventi",
      "Formazione tecnica",
      "Progetti sociali",
      "Collaborazioni & partnership",
    ],
    divise: ["Kit home", "Kit away", "Kit third", "Portieri"],
    collegamenti: [
      { label: "Pagina squadra · area Sport", href: "/sport/squadre/rfa-rimini-football-academy" },
      { label: "Reality Show Giovanile Rimini", href: "/media/reality-show" },
      { label: "Società & Attività del gruppo", href: "/tbh/societa" },
    ],
    /* Slide annunci di lavoro: annunciate da Claudio, non ancora ricevute. */
    annunciLavoro: [],
    /* Articoli per il negozio: in allestimento (parole di Claudio). */
    articoliNegozio: [],
  },
  /* ── Schede «DATI AZIENDALI» ufficiali ricevute il 03/09/2026 (una per società).
     03/10/2026: dalla stessa slide, SENZA ridisegnare nulla, sono ritagliati
       - logo.png      → il riquadro del logo (solo identità, non è un pulsante)
       - pulsante.jpg  → la colonna «logo + PARTE DEL GRUPPO TOUCH BUSINESS HOLDING»
                         = logo + appartenenza: è l'anteprima che apre la scheda
     e la slide intera è la scheda ufficiale. Dati trascritti dalla slide, com'è.
     Mission, valori, servizi, timbro e firma: non ricevuti → restano vuoti / «in arrivo». ── */
  {
    codice: "TBH-002",
    alias: ["touch-metropolitan-media", "metropolitan"],
    nome: "Touch Metropolitan Media Srls",
    acronimo: null,
    sottotitolo: "Divisione di Touch Business Holding",
    aree: ["Comunicazione", "Marketing", "Media", "Produzioni", "Eventi", "Servizi"],
    motto: ["Advertising", "Communication", "Media", "Services"],
    claim: null,
    appartenenza: TBH,
    materiali: {
      logo: "/societa/touch-metropolitan-media/logo.png",
      logoOriginale: null,
      logoPulsante: "/societa/touch-metropolitan-media/banner-gruppo.jpg",
      schedaUfficiale: "/societa/touch-metropolitan-media/scheda-ufficiale.jpg",
      timbroFirma: null,
    },
    galleria: [],
    identita: [
      { etichetta: "Ragione sociale reale", valore: "METROPOLITAN SERVIZI S.R.L.S." },
      { etichetta: "Partita IVA / Codice fiscale", valore: "10971100960" },
      { etichetta: "Sede legale", valore: "Via Ugo Bassi 12/A, 20092 Cinisello Balsamo (MI)" },
      { etichetta: "Sedi operative", valore: "NESSUNA" },
      { etichetta: "Codice REA", valore: "MI - 2569671" },
      { etichetta: "Codice ATECO", valore: "73.11.01 · Ideazione di campagne pubblicitarie" },
      { etichetta: "Ruolo di Claudio Ugolini", valore: "Socio unico (ruolo documentato)" },
      { etichetta: "Parte del gruppo", valore: "Touch Business Holding" },
    ],
    mission: null,
    valori: [],
    attivita: [],
    servizi: [],
    divise: [],
    collegamenti: [{ label: "Società & Attività del gruppo", href: "/tbh/societa" }],
    annunciLavoro: [],
    articoliNegozio: [],
  },
  {
    codice: "TBH-003",
    alias: ["touch-village", "touch-village-entertainment"],
    nome: "Touch Village Entertainment Srl",
    acronimo: null,
    sottotitolo: "Società a responsabilità limitata · Parte del gruppo Touch Business Holding",
    aree: [],
    motto: [],
    claim: null,
    appartenenza: TBH,
    materiali: {
      logo: "/societa/touch-village/logo.png",
      logoOriginale: null,
      logoPulsante: "/societa/touch-village/banner-gruppo.jpg",
      schedaUfficiale: "/societa/touch-village/scheda-ufficiale.jpg",
      timbroFirma: null,
    },
    galleria: [],
    identita: [
      { etichetta: "Ragione sociale reale", valore: "TOUCH VILLAGE ENTERTAINMENT S.R.L." },
      { etichetta: "Partita IVA / Codice fiscale", valore: "10268470969" },
      { etichetta: "Sede legale", valore: "Circonvallazione Clodia, 167, 00195 Roma (RM) – Italia" },
      { etichetta: "Sedi operative", valore: "Come da documentazione ufficiale (da comunicare)" },
      { etichetta: "Codice REA", valore: "RM – 1592186" },
      {
        etichetta: "Codice ATECO",
        valore: "59.11.00 · Attività di produzione cinematografica, di video e di programmi televisivi",
      },
      { etichetta: "Ruolo di Claudio Ugolini", valore: "Socio unico (ruolo documentato)" },
      { etichetta: "Parte del gruppo", valore: "Touch Business Holding" },
    ],
    mission: null,
    valori: [],
    attivita: [],
    servizi: [],
    divise: [],
    collegamenti: [{ label: "Società & Attività del gruppo", href: "/tbh/societa" }],
    annunciLavoro: [],
    articoliNegozio: [],
  },
  {
    codice: "TBH-005",
    alias: ["touch-hello", "openlinemobile"],
    nome: "Touch Hello Srl",
    acronimo: null,
    sottotitolo: "Connessioni che uniscono · A Touch Business Holding brand",
    aree: [],
    motto: [],
    claim: null,
    appartenenza: TBH,
    materiali: {
      logo: "/societa/touch-hello/logo.png",
      logoOriginale: null,
      logoPulsante: "/societa/touch-hello/banner-gruppo.jpg",
      schedaUfficiale: "/societa/touch-hello/scheda-ufficiale.jpg",
      timbroFirma: null,
    },
    galleria: [],
    identita: [
      { etichetta: "Ragione sociale reale", valore: "OPENLINEMOBILE S.R.L." },
      { etichetta: "Natura giuridica", valore: "Società a responsabilità limitata (S.R.L.)" },
      { etichetta: "Partita IVA / Codice fiscale", valore: "12073000965" },
      { etichetta: "Sede legale", valore: "Via G. Battista Pergolesi, 2, 20124 Milano (MI) – Italia" },
      { etichetta: "Sedi operative", valore: "—" },
      { etichetta: "Codice REA", valore: "MI – 2639597" },
      { etichetta: "Codice ATECO", valore: "61.90.99 · Altre attività di telecomunicazioni n.c.a." },
      { etichetta: "Ruolo di Claudio Ugolini", valore: "Rappresentante legale (ruolo documentato)" },
      { etichetta: "Parte del gruppo", valore: "Touch Business Holding" },
    ],
    mission: null,
    valori: [],
    attivita: [],
    servizi: [],
    divise: [],
    collegamenti: [{ label: "Società & Attività del gruppo", href: "/tbh/societa" }],
    annunciLavoro: [],
    articoliNegozio: [],
  },
  {
    codice: "TBH-007",
    alias: ["touch-home-consulia", "consulia"],
    nome: "Touch Home Consulia Srl & Sagl",
    acronimo: null,
    sottotitolo: "Consulia Srl (Italia) · Consulia Sagl (Svizzera) · Parte del gruppo Touch Business Holding",
    aree: [],
    motto: [],
    claim: null,
    appartenenza: TBH,
    materiali: {
      logo: "/societa/touch-home-consulia/logo.png",
      logoOriginale: null,
      logoPulsante: "/societa/touch-home-consulia/banner-gruppo.jpg",
      schedaUfficiale: "/societa/touch-home-consulia/scheda-ufficiale.jpg",
      timbroFirma: null,
    },
    galleria: [],
    identita: [
      { etichetta: "Sede legale", valore: "Via Saline 21, Frazione Brecciarola, 66100 Chieti (CH)" },
      { etichetta: "Partita IVA / Codice fiscale", valore: "02661280699" },
      { etichetta: "REA", valore: "CH - 407750" },
      { etichetta: "Codice Camera di Commercio", valore: "CH" },
      {
        etichetta: "Codice ATECO",
        valore: "68.11.00 · Compravendita di beni immobili effettuata su beni propri",
      },
      { etichetta: "Consulia Srl", valore: "Italia · P.IVA 02661280699" },
      { etichetta: "Consulia Sagl", valore: "Svizzera" },
      {
        etichetta: "Claudio Ugolini",
        valore: "Amministratore unico e rappresentante dell'impresa · Nomina 19/01/2024 · Iscrizione 02/02/2024 · Durata a tempo indeterminato",
      },
      { etichetta: "Data atto di costituzione", valore: "09/05/2019" },
      { etichetta: "Data iscrizione", valore: "16/05/2019" },
      { etichetta: "Parte del gruppo", valore: "Touch Business Holding" },
    ],
    mission: null,
    valori: [],
    attivita: [],
    servizi: [],
    divise: [],
    collegamenti: [{ label: "Società & Attività del gruppo", href: "/tbh/societa" }],
    annunciLavoro: [],
    articoliNegozio: [],
  },

  /* ── 04/10/2026 — «10 loghi, 10 pulsanti, 10 anteprime schede»: banner ufficiali
     «logo società | TOUCH BUSINESS HOLDING» inviati da Claudio. Sono il LOGO PULSANTE
     (logo + appartenenza) di ogni società; le colonne verticali ritagliate dalle slide
     «Dati aziendali» restano dentro la scheda ufficiale. Altri contenuti visivi delle
     schede: in arrivo. ── */
  {
    codice: "touch-business-holding",
    capogruppo: true,
    alias: ["tbh", "holding"],
    nome: "Touch Business Holding",
    acronimo: "TBH",
    sottotitolo: "Capogruppo · Business · Media · Events · Marketing · Entertainment",
    aree: ["Business", "Media", "Events", "Marketing", "Entertainment"],
    motto: [],
    claim: null,
    appartenenza: TBH,
    materiali: {
      logo: "/brand/loghi/tbh-tondo.png",
      logoOriginale: null,
      logoPulsante: "/societa/touch-business-holding/banner-gruppo.jpg",
      schedaUfficiale: null,
      timbroFirma: null,
    },
    galleria: [],
    identita: [
      { etichetta: "Denominazione", valore: "Touch Business Holding" },
      { etichetta: "Ruolo", valore: "Capogruppo" },
      {
        etichetta: "Società del gruppo",
        valore:
          "Touch Home Consulia Srl & Sagl · Touch Be Proud Srl · Touch Village Entertainment Srl · Touch Hello Srl · A.S.D. Rimini Football Academy (R.F.A.) · Touch Metropolitan Media Srls · Touch Production Ltd & Srls",
      },
      { etichetta: "Dati societari", valore: "In arrivo (pubblicati solo quando confermati)" },
    ],
    mission: null,
    valori: [],
    attivita: [],
    servizi: [],
    divise: [],
    collegamenti: [
      { label: "Società & Attività del gruppo", href: "/tbh/societa" },
      { label: "Attività del gruppo", href: "/tbh/attivita" },
      { label: "Il CEO · Claudio Ugolini", href: "/ceo" },
      { label: "Contatti", href: "/contatti" },
    ],
    annunciLavoro: [],
    articoliNegozio: [],
  },
  {
    codice: "TBH-006",
    alias: ["touch-be-proud", "be-proud"],
    nome: "Touch Be Proud Srl",
    acronimo: null,
    sottotitolo: "Eventi · Pride · Inclusione · Territorio · A Touch Business brand",
    aree: ["Eventi", "Pride", "Inclusione", "Territorio"],
    motto: [],
    claim: null,
    appartenenza: TBH,
    materiali: {
      /* Ritaglio dal banner ufficiale, senza ridisegnare nulla. */
      logo: "/societa/touch-be-proud/logo.jpg",
      logoOriginale: null,
      logoPulsante: "/societa/touch-be-proud/banner-gruppo.jpg",
      schedaUfficiale: null,
      timbroFirma: null,
    },
    galleria: [],
    identita: [
      { etichetta: "Denominazione", valore: "Touch Be Proud S.R.L." },
      { etichetta: "Partita IVA", valore: "04894760281" },
      { etichetta: "Parte del gruppo", valore: "Touch Business Holding" },
    ],
    mission: null,
    valori: [],
    attivita: [],
    servizi: [],
    divise: [],
    collegamenti: [{ label: "Società & Attività del gruppo", href: "/tbh/societa" }],
    annunciLavoro: [],
    articoliNegozio: [],
  },
  {
    codice: "TBH-004",
    alias: ["touch-production", "touch-production-ltd"],
    nome: "Touch Production Ltd & Srls",
    acronimo: null,
    sottotitolo: "Cinema · Video · Produzioni · Eventi · Società del gruppo Touch Business Holding",
    aree: ["Cinema", "Video", "Produzioni", "Eventi"],
    motto: [],
    claim: null,
    appartenenza: TBH,
    materiali: {
      logo: "/brand/loghi/touch-production.png",
      logoOriginale: null,
      logoPulsante: "/societa/touch-production/banner-gruppo.jpg",
      schedaUfficiale: null,
      timbroFirma: null,
    },
    galleria: [],
    identita: [
      { etichetta: "Touch Production Ltd", valore: "P.IVA 01760300085" },
      { etichetta: "Touch Production Srls", valore: "Dati in arrivo" },
      { etichetta: "Parte del gruppo", valore: "Touch Business Holding" },
    ],
    mission: null,
    valori: [],
    attivita: [],
    servizi: [],
    divise: [],
    collegamenti: [
      { label: "Produzioni del gruppo", href: "/tbh/produzioni" },
      { label: "Società & Attività del gruppo", href: "/tbh/societa" },
    ],
    annunciLavoro: [],
    articoliNegozio: [],
  },
];

/**
 * Le anteprime-pulsante del gruppo, nell'ordine dato da Claudio il 04/10/2026:
 * capogruppo, poi le società. Ogni voce apre la SUA scheda (hrefSocieta).
 */
export const ORDINE_GRUPPO = [
  "touch-business-holding",
  "TBH-007",
  "TBH-006",
  "TBH-003",
  "TBH-005",
  "TBH-008",
  "TBH-002",
  "TBH-004",
] as const;

/** Grafica dell'anteprima nelle griglie di card (riquadro orizzontale). */
export function anteprimaGriglia(k: KitSocieta | null): string | null {
  if (!k) return null;
  const m = k.materiali;
  return m.pulsanteVerticale ? (m.logo ?? m.logoPulsante) : m.logoPulsante;
}

/** Indirizzo della pagina dedicata di una società o attività, dal codice TBH. */
export function hrefSocieta(codice: string) {
  return `/tbh/societa/${codice.toLowerCase()}`;
}

export function trovaKit(slugOCodice: string): KitSocieta | null {
  const s = slugOCodice.toLowerCase();
  return (
    KIT_SOCIETA.find((k) => k.codice.toLowerCase() === s || k.alias.includes(s)) ?? null
  );
}

/** Gli spazi del kit, in ordine, con lo stato reale di ognuno. */
export function spaziKit(k: KitSocieta | null) {
  return [
    { chiave: "logo", titolo: "Logo", pronto: Boolean(k?.materiali.logo) },
    { chiave: "pulsante", titolo: "Logo pulsante", pronto: Boolean(k?.materiali.logoPulsante) },
    { chiave: "scheda", titolo: "Scheda ufficiale", pronto: Boolean(k?.materiali.schedaUfficiale) },
    { chiave: "timbro", titolo: "Timbro e firma", pronto: Boolean(k?.materiali.timbroFirma) },
    { chiave: "lavoro", titolo: "Annunci di lavoro", pronto: Boolean(k?.annunciLavoro.length) },
    { chiave: "negozio", titolo: "Articoli negozio", pronto: Boolean(k?.articoliNegozio.length) },
  ];
}

/** Tutte le slide della scheda, nell'ordine della galleria: scheda, pulsante, timbro, extra, annunci. */
export function slideKit(k: KitSocieta): Slide[] {
  const m = k.materiali;
  return [
    ...(m.schedaUfficiale ? [{ src: m.schedaUfficiale, titolo: "Scheda ufficiale" }] : []),
    ...(m.logoPulsante ? [{ src: m.logoPulsante, titolo: `${k.acronimo ?? k.nome} nel circuito` }] : []),
    ...(m.timbroFirma ? [{ src: m.timbroFirma, titolo: "Timbro e firma", fondo: "bianco" as const }] : []),
    ...k.galleria,
    ...k.annunciLavoro.filter((a) => a.immagine).map((a) => ({ src: a.immagine!, titolo: a.titolo })),
  ];
}
