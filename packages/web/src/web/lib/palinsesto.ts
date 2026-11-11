/**
 * PALINSESTO TBH-WEB — specifica MASTER di Claudio del 05/09/2026.
 *
 * Il sito si comporta come una televisione: un contenitore generale (TBH-WEB.com) con
 * dentro CANALI, ognuno con nome, funzione, categoria e programmazione propria.
 *
 * ORDINE, NON NUMERAZIONE (ordine di Claudio del 28/09/2026): il `numero` resta
 * come CODICE INTERNO (rotta /canale/N, zapping, chiavi tecniche) ma NON si
 * stampa mai a schermo. Il visitatore legge solo i nomi: TBH · INFLUENCITY ·
 * DM SPORT. La sequenza in cui i canali compaiono viene dal campo `ordine`
 * (intervalli di 10, così si inseriscono canali nuovi senza rinumerare) e dalla
 * `prioritaCanale`, che è calcolata e non casuale.
 *
 *   codice 0  = HOME / REGIA, da cui si raggiungono tutti i canali
 *   codice 99 = TBH / CEO, l'area istituzionale, sempre raggiungibile
 *
 * REGOLA FONDAMENTALE (punto 43 della specifica): una pagina può essere promossa ovunque,
 * ma esiste UNA SOLA VOLTA. Qui dentro non nascono pagine nuove: ogni voce della
 * programmazione punta alla pagina CANONICA che esiste già. Niente doppioni tecnici.
 *
 * REGOLA SUI DATI: nessun link, logo o contenuto inventato. Dove manca qualcosa si usa
 * lo stato tecnico (`in-allestimento`, `logo-mancante`, ...), mai un riempitivo finto.
 */

import { srcLogoChannel } from "../../api/data/loghi-channel";

/** Stato tecnico di un canale o di un contenuto (punto 36 della specifica). */
export type StatoPalinsesto =
  | "attivo"
  | "in-allestimento"
  | "link-mancante"
  | "logo-mancante"
  | "immagine-mancante"
  | "contenuto-mancante"
  | "sospeso"
  | "spazio-libero";

/** Badge di appartenenza (punto 8): spiega il rapporto con TBH senza creare altri menu. */
export type BadgePalinsesto =
  | "TBH"
  | "CIRCUITO TBH"
  | "CLIENTE"
  | "PARTNER"
  | "SPONSOR"
  | "FRIEND"
  | "TERRITORIO"
  | "EDITORIALE"
  | "ATTIVITÀ"
  | "ESTERNO";

/** Livello di esposizione (punto 28): decide quanto spesso un contenuto compare. */
export type EsposizionePalinsesto =
  | "normale"
  | "evidenza"
  | "alta-visibilita"
  | "premium"
  | "appuntamento-fisso"
  | "sponsor"
  | "prioritario";

export type ContenutoCanale = {
  /** Etichetta superiore del pulsante: dice a quale canale/settore appartiene. */
  etichetta: string;
  /** Contenuto principale del pulsante: dice cosa si apre. */
  titolo: string;
  /** Pagina CANONICA. Sempre una rotta interna già esistente. */
  url: string;
  descrizione: string;
  badge: BadgePalinsesto[];
  esposizione: EsposizionePalinsesto;
  stato: StatoPalinsesto;
  /** True se va promosso come grande pulsante autonomo in HOME (punto 12). */
  inHome?: boolean;
};

/**
 * PRIORITÀ EDITORIALE (ordine di Claudio del 28/09/2026). Non è casuale: si
 * CALCOLA da quello che il canale ha davvero (materiale reale + contenuti).
 * Serve per decidere chi occupa le vetrine della Home: un canale in allestimento
 * non deve mai passare davanti a uno già allestito.
 */
export type PrioritaEditoriale =
  | "prioritario"
  | "alta-visibilita"
  | "evidenza"
  | "normale"
  | "in-allestimento";

/** Peso numerico decrescente: si ordina per questo, mai a caso. */
export const PESO_PRIORITA: Record<PrioritaEditoriale, number> = {
  prioritario: 5,
  "alta-visibilita": 4,
  evidenza: 3,
  normale: 2,
  "in-allestimento": 1,
};

export const ETICHETTA_PRIORITA: Record<PrioritaEditoriale, string> = {
  prioritario: "Prioritario",
  "alta-visibilita": "Alta visibilità",
  evidenza: "In evidenza",
  normale: "Normale",
  "in-allestimento": "In allestimento",
};

export type Canale = {
  /**
   * CODICE INTERNO del canale. NON va mai stampato a schermo (ordine di Claudio
   * del 28/09/2026: «ordine, non numerazione»). Serve solo come chiave tecnica,
   * per la rotta /canale/N e per lo zapping. Il 99 è l'area TBH/CEO.
   */
  numero: number;
  /**
   * ORDINE EDITORIALE interno, a intervalli di 10: così un canale nuovo si
   * infila in mezzo (per esempio 45) senza rinumerare niente. Anche questo
   * non si mostra mai: il visitatore legge solo i NOMI.
   */
  ordine: number;
  nome: string;
  categoria: string;
  /** A cosa serve il canale, in una riga. */
  funzione: string;
  /** Pagina canonica del canale. */
  url: string;
  colore: string;
  badge: BadgePalinsesto[];
  stato: StatoPalinsesto;
  programmazione: ContenutoCanale[];
};

const N = "normale" as const;

/**
 * Marchi ufficiali già in nostro possesso, per canale. Solo file che esistono
 * davvero in packages/web/public: serve a calcolare la priorità («contenuto +
 * immagine reale = più visibilità»). Nessun logo ricostruito.
 */
export const LOGO_CANALE_PALINSESTO: Record<number, string> = {
  0: "/brand/loghi/tbh-tondo.png",
  1: "/brand/loghi/tbh-master-neon.png",
  7: srcLogoChannel("dm"),
  9: "/brand/loghi/touch-production.png",
  10: "/brand/loghi/hugoland.png",
  13: "/brand/loghi/hvs-master.png",
  // Canale dell'artista (30/09/2026): marchio ufficiale già in archivio.
  23: "/brand/loghi/jc-hugo.png",
  // TOUCH TALENT & PROFESSIONALS CHANNEL (28/10/2026): logo abbinato consegnato da Claudio.
  24: srcLogoChannel("touch-talent-professionals"),
};

export const CANALI: Canale[] = [
  {
    numero: 0,
    ordine: 0,
    nome: "TBH-WEB",
    categoria: "Home",
    funzione: "La guida generale del palinsesto: telecomando, vetrina e accesso rapido ai canali.",
    url: "/",
    colore: "#d7ff00",
    badge: ["TBH"],
    stato: "attivo",
    programmazione: [
      {
        etichetta: "Palinsesto",
        titolo: "Guida canali",
        url: "/guida",
        descrizione: "Tutti i canali di TBH-WEB in una schermata sola, con numero e funzione.",
        badge: ["TBH"],
        esposizione: "prioritario",
        stato: "attivo",
        inHome: true,
      },
      {
        etichetta: "Utility",
        titolo: "Cerca nel sito",
        url: "/cerca",
        descrizione: "Ricerca su società, attività, prodotti, squadre e pagine del portale.",
        badge: ["TBH"],
        esposizione: N,
        stato: "attivo",
      },
    ],
  },
  {
    numero: 1,
    ordine: 10,
    nome: "TOUCH BUSINESS HOLDING",
    categoria: "Business",
    funzione: "Il perimetro del gruppo: mappa delle pagine, registro, anagrafica e livelli.",
    url: "/tbh/pagine",
    colore: "#d7ff00",
    badge: ["TBH"],
    stato: "attivo",
    programmazione: [
      {
        etichetta: "Touch Business Holding",
        titolo: "Mappa delle pagine TBH",
        url: "/tbh/pagine",
        descrizione: "Tutte le pagine del gruppo raccolte in un elenco unico.",
        badge: ["TBH"],
        esposizione: "evidenza",
        stato: "attivo",
      },
      {
        etichetta: "Touch Business Holding",
        titolo: "Registro TBH",
        url: "/tbh/registro",
        descrizione: "Codici, società, attività e marchi del gruppo.",
        badge: ["TBH"],
        esposizione: N,
        stato: "attivo",
      },
      {
        etichetta: "Touch Business Holding",
        titolo: "Anagrafica master",
        url: "/anagrafica",
        descrizione: "La scheda master di ogni soggetto censito.",
        badge: ["TBH"],
        esposizione: N,
        stato: "attivo",
      },
      {
        etichetta: "Touch Business Holding",
        titolo: "I 25 livelli TBH",
        url: "/tbh/livelli",
        descrizione: "La scala di adesione al gruppo, livello per livello.",
        badge: ["TBH"],
        esposizione: "evidenza",
        stato: "attivo",
      },
      {
        etichetta: "Business",
        titolo: "Business Desk",
        url: "/business-desk",
        descrizione: "Lo sportello per aziende, professionisti e attività.",
        badge: ["TBH"],
        esposizione: N,
        stato: "attivo",
        inHome: true,
      },
      {
        etichetta: "Business",
        titolo: "Management",
        url: "/management",
        descrizione: "Ruoli, referenti e struttura operativa.",
        badge: ["TBH"],
        esposizione: N,
        stato: "attivo",
      },
      {
        etichetta: "Istituzioni",
        titolo: "Istituzioni & crediti",
        url: "/istituzioni",
        descrizione: "Portali ufficiali, crediti d'imposta, enti e adempimenti.",
        badge: ["ESTERNO"],
        esposizione: N,
        stato: "attivo",
      },
    ],
  },
  {
    numero: 2,
    ordine: 20,
    nome: "SOCIETÀ TBH",
    categoria: "Business",
    funzione: "La directory societaria: società con partita IVA, attività del gruppo e marchi.",
    url: "/tbh/societa",
    colore: "#d7ff00",
    badge: ["TBH"],
    stato: "attivo",
    programmazione: [
      {
        etichetta: "Società TBH",
        titolo: "Le società del gruppo",
        url: "/tbh/societa",
        descrizione: "Ogni società con logo ufficiale, dati e scheda propria.",
        badge: ["TBH"],
        esposizione: "evidenza",
        stato: "attivo",
        inHome: true,
      },
      {
        etichetta: "Società TBH",
        titolo: "Le attività del gruppo",
        url: "/tbh/attivita",
        descrizione: "Le attività attinenti al gruppo, distinte dalle società con partita IVA.",
        badge: ["ATTIVITÀ"],
        esposizione: N,
        stato: "attivo",
      },
      {
        etichetta: "Società TBH",
        titolo: "Brand e personalizzazioni",
        url: "/tbh/brand-personalizzazioni",
        descrizione: "I marchi Touch e le personalizzazioni disponibili.",
        badge: ["TBH"],
        esposizione: N,
        stato: "attivo",
      },
    ],
  },
  {
    numero: 3,
    ordine: 140,
    nome: "TBH SERVICES",
    categoria: "Servizi",
    funzione: "Tutti i servizi del gruppo e gli strumenti a disposizione di clienti e aderenti.",
    url: "/tbh/servizi",
    colore: "#e2c37a",
    badge: ["TBH"],
    stato: "attivo",
    programmazione: [
      {
        etichetta: "TBH Services",
        titolo: "I servizi del gruppo",
        url: "/tbh/servizi",
        descrizione: "Catalogo dei servizi, area per area.",
        badge: ["TBH"],
        esposizione: "evidenza",
        stato: "attivo",
      },
      {
        etichetta: "TBH Services",
        titolo: "TBH Assist",
        url: "/tbh-assist",
        descrizione: "Assistenza e supporto diretto.",
        badge: ["TBH"],
        esposizione: N,
        stato: "attivo",
      },
      {
        etichetta: "TBH Services",
        titolo: "TBH App",
        url: "/tbh-app",
        descrizione: "L'applicazione del gruppo e i suoi strumenti.",
        badge: ["TBH"],
        esposizione: N,
        stato: "attivo",
      },
      {
        etichetta: "TBH Services",
        titolo: "Club TBH",
        url: "/club",
        descrizione: "Il club dei fidelizzati e i suoi vantaggi.",
        badge: ["CIRCUITO TBH"],
        esposizione: N,
        stato: "attivo",
      },
      {
        etichetta: "TBH Services",
        titolo: "Offerte e promo",
        url: "/offerte",
        descrizione: "Le proposte attive del gruppo e del circuito.",
        badge: ["TBH"],
        esposizione: "evidenza",
        stato: "attivo",
      },
    ],
  },
  {
    numero: 4,
    ordine: 170,
    nome: "TOUCH PAY · TOUCH FINANCE",
    categoria: "Finanza",
    funzione: "Pagamenti, rateizzazioni, finanziamenti e cashback del circuito.",
    url: "/pagamenti",
    colore: "#33e0ff",
    badge: ["TBH"],
    stato: "attivo",
    programmazione: [
      {
        etichetta: "Touch Finance",
        titolo: "Finanziamenti",
        url: "/pagamenti",
        descrizione: "Rateizzazioni, finanziamenti e modalità di pagamento del circuito.",
        badge: ["TBH"],
        esposizione: "prioritario",
        stato: "attivo",
        inHome: true,
      },
      {
        etichetta: "Touch Finance",
        titolo: "Livelli e adesioni",
        url: "/tbh/livelli",
        descrizione: "Come si aderisce e cosa comprende ogni livello.",
        badge: ["CIRCUITO TBH"],
        esposizione: N,
        stato: "attivo",
      },
      {
        etichetta: "Touch Finance",
        titolo: "Guadagna con noi",
        url: "/servizi-referral",
        descrizione: "Banche, wallet e servizi con doppio percorso: sito ufficiale e referral.",
        badge: ["ESTERNO"],
        esposizione: "evidenza",
        stato: "attivo",
      },
    ],
  },
  {
    numero: 5,
    ordine: 160,
    nome: "CIRCUITO TBH",
    categoria: "Network",
    funzione: "Chi è dentro al circuito: clienti, partner, sponsor e rete commerciale.",
    url: "/network/circuito",
    colore: "#d7ff00",
    badge: ["CIRCUITO TBH"],
    stato: "attivo",
    programmazione: [
      {
        etichetta: "Circuito TBH",
        titolo: "Il Circuito",
        url: "/network/circuito",
        descrizione: "Come funziona il circuito e cosa comporta aderire.",
        badge: ["CIRCUITO TBH"],
        esposizione: "prioritario",
        stato: "attivo",
        inHome: true,
      },
      {
        etichetta: "Circuito TBH",
        titolo: "Clienti",
        url: "/network/clienti",
        descrizione: "Le attività clienti del gruppo.",
        badge: ["CLIENTE"],
        esposizione: N,
        stato: "attivo",
      },
      {
        etichetta: "Circuito TBH",
        titolo: "Partner",
        url: "/network/partner",
        descrizione: "I partner del network.",
        badge: ["PARTNER"],
        esposizione: N,
        stato: "attivo",
      },
      {
        etichetta: "Circuito TBH",
        titolo: "Sponsor",
        url: "/network/sponsor",
        descrizione: "Gli sponsor e le attività sostenitrici.",
        badge: ["SPONSOR"],
        esposizione: "sponsor",
        stato: "attivo",
      },
      {
        etichetta: "Circuito TBH",
        titolo: "Rete commerciale",
        url: "/network/rete-commerciale",
        descrizione: "Come entrare nella rete commerciale del gruppo.",
        badge: ["TBH"],
        esposizione: N,
        stato: "attivo",
      },
    ],
  },
  {
    numero: 6,
    ordine: 90,
    nome: "TERRITORIO TBH",
    categoria: "Territorio",
    funzione: "Dove siamo: mappa, spazi, città e presenze sul territorio.",
    url: "/territorio/mappa",
    colore: "#33e0ff",
    badge: ["TERRITORIO"],
    stato: "attivo",
    programmazione: [
      {
        etichetta: "Territorio",
        titolo: "Cercami · Seguimi · Trovami",
        url: "/territorio/mappa",
        descrizione: "La mappa delle presenze e delle sedi del gruppo.",
        badge: ["TERRITORIO"],
        esposizione: "evidenza",
        stato: "attivo",
        inHome: true,
      },
      {
        etichetta: "Territorio",
        titolo: "Spazi e luoghi",
        url: "/territorio/spazi",
        descrizione: "Piazze, spazi e location del circuito.",
        badge: ["TERRITORIO"],
        esposizione: N,
        stato: "attivo",
      },
      {
        etichetta: "Territorio",
        titolo: "Sanremo",
        url: "/sanremo",
        descrizione: "Il presidio di Sanremo, luogo per luogo.",
        badge: ["TERRITORIO"],
        esposizione: N,
        stato: "attivo",
      },
      {
        etichetta: "Territorio",
        titolo: "Community",
        url: "/community",
        descrizione: "La community del territorio e del circuito.",
        badge: ["TERRITORIO"],
        esposizione: N,
        stato: "attivo",
      },
    ],
  },
  {
    numero: 7,
    ordine: 40,
    nome: "DM COMUNICAZIONI",
    categoria: "Media partner",
    funzione: "Il canale di DM Comunicazioni: programmi, crew e sport. Media partner, non società TBH.",
    url: "/dm",
    colore: "#ff2b2b",
    badge: ["PARTNER", "ESTERNO"],
    stato: "attivo",
    programmazione: [
      {
        etichetta: "DM Comunicazioni",
        titolo: "Il canale DM",
        url: "/dm",
        descrizione: "Programmi, dirette e repliche di DM Comunicazioni.",
        badge: ["PARTNER"],
        esposizione: "appuntamento-fisso",
        stato: "attivo",
        inHome: true,
      },
      {
        etichetta: "DM Comunicazioni",
        titolo: "DM Crew",
        url: "/media/dm/crew",
        descrizione: "Operatori, giornalisti e volti della crew.",
        badge: ["PARTNER"],
        esposizione: N,
        stato: "attivo",
      },
      {
        etichetta: "DM Comunicazioni",
        titolo: "Highlights DM",
        url: "/sport/highlights-dm",
        descrizione: "Le riprese e i servizi sportivi firmati DM.",
        badge: ["PARTNER"],
        esposizione: N,
        stato: "attivo",
      },
      {
        etichetta: "Network",
        titolo: "Media partner",
        url: "/network/media-partner",
        descrizione: "Tutti i media partner del gruppo.",
        badge: ["PARTNER"],
        esposizione: N,
        stato: "attivo",
      },
    ],
  },
  {
    numero: 8,
    ordine: 30,
    nome: "TOUCH MEDIA",
    categoria: "Media",
    funzione: "Magazine, TV, radio, news, streaming e rubriche: tutto il fronte editoriale.",
    url: "/media",
    colore: "#9dff3c",
    badge: ["EDITORIALE"],
    stato: "attivo",
    programmazione: [
      {
        etichetta: "Touch Media",
        titolo: "Il canale media",
        url: "/media",
        descrizione: "La programmazione editoriale del gruppo.",
        badge: ["EDITORIALE"],
        esposizione: "evidenza",
        stato: "attivo",
      },
      {
        etichetta: "Touch Media",
        titolo: "Influencity Magazine",
        url: "/influencity",
        descrizione: "L'unica rivista ufficiale del gruppo, numero per numero.",
        badge: ["EDITORIALE"],
        esposizione: "prioritario",
        stato: "attivo",
        inHome: true,
      },
      {
        etichetta: "Touch Media",
        titolo: "News",
        url: "/news",
        descrizione: "L'edicola digitale, solo fonti in chiaro e link ufficiali.",
        badge: ["EDITORIALE"],
        esposizione: "evidenza",
        stato: "attivo",
        inHome: true,
      },
      {
        etichetta: "Touch Media",
        titolo: "TV, radio e streaming",
        url: "/media/streaming",
        descrizione: "Canali e player ufficiali, in chiaro.",
        badge: ["EDITORIALE"],
        esposizione: "evidenza",
        stato: "attivo",
        inHome: true,
      },
      {
        etichetta: "Touch Media",
        titolo: "Radio e TV: le curiosità",
        url: "/media/radio-tv",
        descrizione: "Rubrica su radio e televisione.",
        badge: ["EDITORIALE"],
        esposizione: N,
        stato: "attivo",
      },
      {
        etichetta: "Touch Media",
        titolo: "Media library",
        url: "/media/libreria",
        descrizione: "Archivio di materiali, video e documenti pubblici.",
        badge: ["EDITORIALE"],
        esposizione: N,
        stato: "attivo",
      },
      {
        etichetta: "Touch Media",
        titolo: "Giochi e rubriche",
        url: "/media/giochi",
        descrizione: "Giochi di mente, punti e rubriche del magazine.",
        badge: ["EDITORIALE"],
        esposizione: N,
        stato: "attivo",
      },
    ],
  },
  {
    numero: 9,
    ordine: 80,
    nome: "TOUCH PRODUCTION",
    categoria: "Produzioni",
    funzione: "Cinema, audiovisivo, format, reality e musica prodotti dal gruppo.",
    url: "/tbh/produzioni",
    colore: "#ff5bb0",
    badge: ["TBH"],
    stato: "attivo",
    programmazione: [
      {
        etichetta: "Touch Production",
        titolo: "Le produzioni",
        url: "/tbh/produzioni",
        descrizione: "Cinema, format e contenuti originali del gruppo.",
        badge: ["TBH"],
        esposizione: "evidenza",
        stato: "attivo",
        inHome: true,
      },
      {
        etichetta: "Touch Production",
        titolo: "Reality Show",
        url: "/media/reality-show",
        descrizione: "Il reality prodotto dal gruppo.",
        badge: ["TBH"],
        esposizione: "evidenza",
        stato: "attivo",
      },
      {
        etichetta: "Touch Production",
        titolo: "Academy del Reality",
        url: "/media/reality-show/academy",
        descrizione: "Reclutamento e percorso academy legati al reality.",
        badge: ["TBH"],
        esposizione: N,
        stato: "attivo",
      },
      {
        etichetta: "Touch Production",
        titolo: "HEDDY.video",
        url: "/media/heddy-video",
        descrizione: "Film da comprare o noleggiare.",
        badge: ["TBH"],
        esposizione: N,
        stato: "attivo",
      },
      /* 30/09/2026 — ordine di Claudio: «l'artista DJ J. C. Hugò deve diventare
         canale». La voce è stata PROMOSSA a canale proprio (codice 23) e qui non
         viene più ripetuta: Touch Production la raggiunge dal canale dell'artista.
         Niente doppione, niente pagina nuova: la canonica resta /musica/jc-hugo. */
    ],
  },
  {
    /* ───────── CANALE DELL'ARTISTA — nato il 30/09/2026 ─────────
       Prima J.C. Hugò era una voce dentro TOUCH PRODUCTION. Ordine di Claudio:
       l'artista è un canale, non un contenuto di qualcun altro.
       La pagina canonica NON cambia (/musica/jc-hugo): non nasce nessuna pagina
       nuova, cambia solo il posto che il progetto occupa nel palinsesto.
       `ordine: 75` lo mette fra HUGOLAND (70) e TOUCH PRODUCTION (80), dentro
       l'area Entertainment, senza rinumerare nessun altro canale. */
    numero: 23,
    ordine: 75,
    nome: "DJ J.C. HUGÒ",
    categoria: "Entertainment",
    funzione:
      "Il canale dell'artista: brani ufficiali, catalogo audio, dj set, live e booking.",
    url: "/musica/jc-hugo",
    // Lo stesso viola della scheda artista (api/data/musica.ts → HUGO.colore).
    colore: "#b46bff",
    badge: ["TBH"],
    stato: "attivo",
    programmazione: [
      {
        etichetta: "DJ J.C. Hugò",
        titolo: "Il canale dell'artista",
        url: "/musica/jc-hugo",
        descrizione:
          "Catalogo audio, brani ufficiali, monitor d'ascolto, live e booking del progetto.",
        badge: ["TBH"],
        esposizione: "evidenza",
        stato: "attivo",
        inHome: true,
      },
      {
        etichetta: "DJ J.C. Hugò",
        titolo: "DJ set con la crew",
        url: "/shop/p/dj-set-con-crew",
        descrizione: "La serata con dj set e crew, prenotabile dallo shop.",
        badge: ["TBH"],
        esposizione: N,
        stato: "attivo",
      },
    ],
  },
  {
    /* ───────── TOUCH TALENT & PROFESSIONALS CHANNEL — nato il 28/10/2026 ─────────
       Monitor verticali 9:16 con palinsesto H24 casuale memorizzato sul server
       (pagina /channel/touch-talent-professionals). Fa parte dell'area Touch Hugoland:
       `ordine: 78` lo mette fra DJ J.C. HUGÒ (75) e TOUCH PRODUCTION (80). */
    numero: 24,
    ordine: 78,
    nome: "TOUCH TALENT & PROFESSIONALS",
    categoria: "Entertainment",
    funzione: "Artisti, staff, crew e indipendenti in monitor verticali, H24 a rotazione casuale.",
    url: "/channel/touch-talent-professionals",
    colore: "#d4af37",
    badge: ["TBH"],
    stato: "attivo",
    programmazione: [
      {
        etichetta: "Touch Talent & Professionals",
        titolo: "Il Channel dei talenti",
        url: "/channel/touch-talent-professionals",
        descrizione: "Monitor 9:16 in onda H24: Artisti, Staff, Crew e Indipendenti.",
        badge: ["TBH"],
        esposizione: N,
        stato: "attivo",
      },
    ],
  },
  {
    numero: 10,
    ordine: 70,
    nome: "HUGOLAND",
    categoria: "Entertainment",
    funzione: "Il mondo Hugoland: eventi, fiere, viaggi, Capitan Touch e concorsi.",
    url: "/hugoland",
    colore: "#33e0ff",
    badge: ["TBH"],
    stato: "attivo",
    programmazione: [
      {
        etichetta: "Hugoland",
        titolo: "Il mondo Hugoland",
        url: "/hugoland",
        descrizione: "Eventi, tour e appuntamenti del gruppo.",
        badge: ["TBH"],
        esposizione: "evidenza",
        stato: "attivo",
      },
      {
        etichetta: "Hugoland",
        titolo: "Capitan Touch",
        url: "/capitan-touch",
        descrizione: "La mascotte e il suo mondo.",
        badge: ["TBH"],
        esposizione: "evidenza",
        stato: "attivo",
        inHome: true,
      },
      {
        etichetta: "Eventi",
        titolo: "Fiere internazionali",
        url: "/eventi/fiere-internazionali",
        descrizione: "Il calendario delle fiere in Italia e in Europa.",
        badge: ["TBH"],
        esposizione: "evidenza",
        stato: "attivo",
        inHome: true,
      },
      {
        etichetta: "Touch Talent & Professionals",
        titolo: "Touch Talent & Professionals Channel",
        url: "/channel/touch-talent-professionals",
        descrizione: "I talenti, lo staff e la crew in monitor verticali, H24.",
        badge: ["TBH"],
        esposizione: N,
        stato: "attivo",
      },
      {
        etichetta: "Touch Travels",
        titolo: "Viaggi e tour",
        url: "/touch-travels",
        descrizione: "Tappe, tour e trasferte del gruppo.",
        badge: ["ATTIVITÀ"],
        esposizione: N,
        stato: "attivo",
      },
      {
        etichetta: "Eventi",
        titolo: "Touch Miss Cool",
        url: "/eventi/miss-cool",
        descrizione: "Il concorso di bellezza e la versione web.",
        badge: ["TBH"],
        esposizione: N,
        stato: "attivo",
      },
    ],
  },
  {
    numero: 11,
    ordine: 50,
    nome: "TOUCH SPORTS",
    categoria: "Sport",
    funzione: "Calcio, squadre seguite, highlights e programmi sportivi.",
    url: "/sport",
    colore: "#2f7bff",
    badge: ["TBH"],
    stato: "attivo",
    programmazione: [
      {
        etichetta: "Touch Sports",
        titolo: "Il canale sport",
        url: "/sport",
        descrizione: "Tutto lo sport del gruppo in una schermata.",
        badge: ["TBH"],
        esposizione: "evidenza",
        stato: "attivo",
        inHome: true,
      },
      {
        etichetta: "Touch Sports",
        titolo: "Calcio",
        url: "/sport/calcio",
        descrizione: "Il fronte calcistico, campionati e territorio.",
        badge: ["TBH"],
        esposizione: N,
        stato: "attivo",
      },
      {
        etichetta: "Touch Sports",
        titolo: "Squadre",
        url: "/sport/squadre",
        descrizione: "Le squadre con scheda, stemma ufficiale e collegamenti.",
        badge: ["TERRITORIO"],
        esposizione: "evidenza",
        stato: "attivo",
        inHome: true,
      },
      {
        etichetta: "Touch Sports",
        titolo: "Società seguite",
        url: "/sport/societa-seguite",
        descrizione: "Le società seguite sul territorio.",
        badge: ["TERRITORIO"],
        esposizione: N,
        stato: "attivo",
      },
      {
        etichetta: "Touch Sports",
        titolo: "Highlights",
        url: "/sport/highlights-dm",
        descrizione: "Riprese, servizi e momenti salienti.",
        badge: ["PARTNER"],
        esposizione: N,
        stato: "attivo",
      },
    ],
  },
  {
    numero: 12,
    ordine: 60,
    nome: "MOTORSPORT",
    categoria: "Sport",
    funzione: "Circuiti, campionati, presidi di pista ed eventi motoristici.",
    url: "/sport/motorsport",
    colore: "#2f7bff",
    badge: ["TBH"],
    stato: "attivo",
    programmazione: [
      {
        etichetta: "Motorsport",
        titolo: "Circuiti e campionati",
        url: "/sport/motorsport",
        descrizione: "Autodromi, campionati ufficiali e calendario.",
        badge: ["TBH"],
        esposizione: "evidenza",
        stato: "attivo",
        inHome: true,
      },
      {
        etichetta: "Motorsport",
        titolo: "SBK Cremona Circuit 2026",
        url: "/cremona-circuit-2026",
        descrizione: "Presidio evento e ricerca operatori: tre squadre, una sola pagina.",
        badge: ["TBH"],
        esposizione: "prioritario",
        stato: "attivo",
        inHome: true,
      },
    ],
  },
  {
    numero: 13,
    ordine: 130,
    nome: "TOUCH HIGH VISIBILITY SCOUT",
    categoria: "Visibilità",
    funzione: "Lo scouting della visibilità: HVS, academy della crew e visibilità in onda.",
    url: "/hvs",
    colore: "#d7ff00",
    badge: ["TBH"],
    stato: "attivo",
    programmazione: [
      {
        etichetta: "High Visibility Scout",
        titolo: "HVS",
        url: "/hvs",
        descrizione: "Il progetto di scouting e i suoi annunci.",
        badge: ["TBH"],
        esposizione: "evidenza",
        stato: "attivo",
      },
      {
        etichetta: "High Visibility Scout",
        titolo: "Crew Academy",
        url: "/touch-academy",
        descrizione: "Formazione e ingresso nella crew.",
        badge: ["TBH"],
        esposizione: N,
        stato: "attivo",
      },
      {
        etichetta: "Visibilità",
        titolo: "Visibilità in onda",
        url: "/tbh/brand-personalizzazioni/visibilita-in-onda",
        descrizione: "Come finire in onda con il proprio marchio.",
        badge: ["SPONSOR"],
        esposizione: "sponsor",
        stato: "attivo",
      },
    ],
  },
  {
    numero: 14,
    ordine: 150,
    nome: "TOUCH HOST",
    categoria: "Hospitality",
    funzione: "Hotel, strutture, camping, ristorazione ed esperienze turistiche.",
    url: "/hospitality",
    colore: "#33e0ff",
    badge: ["PARTNER"],
    stato: "attivo",
    programmazione: [
      {
        etichetta: "Touch Host",
        titolo: "Hotel & strutture",
        url: "/hospitality",
        descrizione: "Strutture ricettive, ristorazione ed esperienze del circuito.",
        badge: ["PARTNER"],
        esposizione: "evidenza",
        stato: "attivo",
        inHome: true,
      },
      {
        etichetta: "Touch Host",
        titolo: "Hotel Aurora",
        url: "/hotel-aurora",
        descrizione: "Misano Adriatico, con AgriBus Experience e Tenuta Due Tigli.",
        badge: ["PARTNER"],
        esposizione: "evidenza",
        stato: "attivo",
        inHome: true,
      },
    ],
  },
  {
    numero: 15,
    ordine: 110,
    nome: "TOUCH JOBS",
    categoria: "Lavoro",
    funzione: "Offerte di lavoro, recruiting, accrediti e opportunità.",
    url: "/lavoro-casting",
    colore: "#e2c37a",
    badge: ["TBH"],
    stato: "attivo",
    programmazione: [
      {
        etichetta: "Touch Jobs",
        titolo: "Lavoro & casting",
        url: "/lavoro-casting",
        descrizione: "Il canale del lavoro: come candidarsi e cosa cerchiamo.",
        badge: ["TBH"],
        esposizione: "prioritario",
        stato: "attivo",
        inHome: true,
      },
      {
        etichetta: "Touch Jobs",
        titolo: "SBK Cremona Circuit 2026",
        url: "/cremona-circuit-2026",
        descrizione: "Ricerca operatori: antincendio livello 3, ordinario giorno e notte.",
        badge: ["TBH"],
        esposizione: "prioritario",
        stato: "attivo",
      },
      {
        etichetta: "Touch Jobs",
        titolo: "Academy e reclutamento",
        url: "/media/reality-show/academy",
        descrizione: "Percorsi di ingresso e formazione.",
        badge: ["TBH"],
        esposizione: N,
        stato: "attivo",
      },
    ],
  },
  {
    numero: 16,
    ordine: 120,
    nome: "TOUCH CASTING",
    categoria: "Casting",
    funzione: "La bacheca degli annunci: casting, artisti, selezioni e candidature.",
    url: "/lavoro-casting/bacheca",
    colore: "#e2c37a",
    badge: ["TBH"],
    stato: "attivo",
    programmazione: [
      {
        etichetta: "Touch Casting",
        titolo: "Bacheca annunci",
        url: "/lavoro-casting/bacheca",
        descrizione: "Annunci di lavoro, casting e opportunità artistiche.",
        badge: ["TBH"],
        esposizione: "evidenza",
        stato: "attivo",
        inHome: true,
      },
      {
        etichetta: "Touch Casting",
        titolo: "Crew Academy",
        url: "/touch-academy",
        descrizione: "Il percorso per entrare nella crew.",
        badge: ["TBH"],
        esposizione: N,
        stato: "attivo",
      },
    ],
  },
  {
    numero: 17,
    ordine: 180,
    nome: "TOUCH SOCIAL",
    categoria: "Social",
    funzione: "Tutti i canali social ufficiali e la community.",
    url: "/contatti-social",
    colore: "#ff3df0",
    badge: ["TBH"],
    stato: "attivo",
    programmazione: [
      {
        etichetta: "Touch Social",
        titolo: "Social ufficiali",
        url: "/contatti-social",
        descrizione: "La directory dei canali social del gruppo.",
        badge: ["TBH"],
        esposizione: "evidenza",
        stato: "attivo",
        inHome: true,
      },
      {
        etichetta: "Touch Social",
        titolo: "Community",
        url: "/community",
        descrizione: "Chi ci segue, chi partecipa, come si entra.",
        badge: ["TBH"],
        esposizione: N,
        stato: "attivo",
      },
    ],
  },
  {
    numero: 18,
    ordine: 190,
    nome: "TOUCH SHOP",
    categoria: "Shop",
    funzione: "Il negozio: solo ciò che si può davvero acquistare.",
    url: "/shop",
    colore: "#ff8a00",
    badge: ["TBH"],
    stato: "attivo",
    programmazione: [
      {
        etichetta: "Touch Shop",
        titolo: "Il negozio",
        url: "/shop",
        descrizione: "Prodotti, combo, pacchetti e servizi acquistabili.",
        badge: ["TBH"],
        esposizione: "prioritario",
        stato: "attivo",
        inHome: true,
      },
      {
        etichetta: "Touch Shop",
        titolo: "Offerte",
        url: "/offerte",
        descrizione: "Le promozioni attive.",
        badge: ["TBH"],
        esposizione: "evidenza",
        stato: "attivo",
      },
    ],
  },
  {
    numero: 19,
    ordine: 200,
    nome: "VETRINA",
    categoria: "Vetrina",
    funzione: "Mostrare: attività, aziende, clienti, partner e sponsor. Non è il negozio.",
    url: "/network",
    colore: "#d7ff00",
    badge: ["CIRCUITO TBH"],
    stato: "attivo",
    programmazione: [
      {
        etichetta: "Vetrina",
        titolo: "La vetrina del network",
        url: "/network",
        descrizione: "Chi è in vetrina su TBH-WEB, per categoria.",
        badge: ["CIRCUITO TBH"],
        esposizione: "evidenza",
        stato: "attivo",
        inHome: true,
      },
      {
        etichetta: "Vetrina",
        titolo: "Partner",
        url: "/network/partner",
        descrizione: "I partner in evidenza.",
        badge: ["PARTNER"],
        esposizione: N,
        stato: "attivo",
      },
      {
        etichetta: "Vetrina",
        titolo: "Sponsor",
        url: "/network/sponsor",
        descrizione: "Gli sponsor in evidenza.",
        badge: ["SPONSOR"],
        esposizione: "sponsor",
        stato: "attivo",
      },
      {
        etichetta: "Vetrina",
        titolo: "Spazi e location",
        url: "/territorio/spazi",
        descrizione: "Spazi disponibili e location del circuito.",
        badge: ["TERRITORIO"],
        esposizione: N,
        stato: "attivo",
      },
    ],
  },
  {
    numero: 20,
    ordine: 100,
    nome: "TOUCH FASHION",
    categoria: "Fashion",
    funzione: "Moda, marchi, concorsi di bellezza ed eventi fashion.",
    url: "/fashion",
    colore: "#ff3df0",
    badge: ["TBH"],
    stato: "attivo",
    programmazione: [
      {
        etichetta: "Touch Fashion",
        titolo: "Il canale fashion",
        url: "/fashion",
        descrizione: "Moda, brand e collaborazioni.",
        badge: ["TBH"],
        esposizione: "evidenza",
        stato: "attivo",
        inHome: true,
      },
      {
        etichetta: "Touch Fashion",
        titolo: "Il marchio Touch Fashion",
        url: "/tbh/touch-fashion",
        descrizione: "La scheda del marchio del gruppo.",
        badge: ["TBH"],
        esposizione: N,
        stato: "attivo",
      },
      {
        etichetta: "Eventi",
        titolo: "Pride Village",
        url: "/pride-village",
        descrizione: "Il presidio di Padova e le collaborazioni.",
        badge: ["PARTNER"],
        esposizione: N,
        stato: "attivo",
      },
    ],
  },
  {
    numero: 21,
    ordine: 210,
    nome: "GUADAGNA CON NOI",
    categoria: "Referral",
    funzione: "Servizi con doppio percorso: sito ufficiale del brand e referral personale.",
    url: "/servizi-referral",
    colore: "#e2c37a",
    badge: ["ESTERNO"],
    stato: "attivo",
    programmazione: [
      {
        etichetta: "Guadagna con noi",
        titolo: "Servizi & referral",
        url: "/servizi-referral",
        descrizione: "Revolut, BIGO LIVE, Bump, bunq, Vivid: apri il servizio o entra col referral.",
        badge: ["ESTERNO"],
        esposizione: "prioritario",
        stato: "attivo",
        inHome: true,
      },
      {
        etichetta: "Touch Finance",
        titolo: "Pagamenti e finanziamenti",
        url: "/pagamenti",
        descrizione: "Come si paga, si rateizza e si finanzia nel circuito.",
        badge: ["TBH"],
        esposizione: N,
        stato: "attivo",
      },
    ],
  },
  {
    numero: 22,
    ordine: 230,
    nome: "CONTATTI",
    categoria: "Contatti",
    funzione: "Email, telefono, WhatsApp, Telegram, social, sedi e ricerca.",
    url: "/contatti",
    colore: "#d7ff00",
    badge: ["TBH"],
    stato: "attivo",
    programmazione: [
      {
        etichetta: "Contatti",
        titolo: "Tutti i contatti",
        url: "/contatti",
        descrizione: "Recapiti ufficiali del gruppo e delle società.",
        badge: ["TBH"],
        esposizione: "prioritario",
        stato: "attivo",
        inHome: true,
      },
      {
        etichetta: "Contatti",
        titolo: "Social ufficiali",
        url: "/contatti-social",
        descrizione: "I canali social verificati.",
        badge: ["TBH"],
        esposizione: N,
        stato: "attivo",
      },
      {
        etichetta: "Utility",
        titolo: "Cerca",
        url: "/cerca",
        descrizione: "Ricerca interna sul portale.",
        badge: ["TBH"],
        esposizione: N,
        stato: "attivo",
      },
      {
        etichetta: "Contatti",
        titolo: "TBH Assist",
        url: "/tbh-assist",
        descrizione: "Assistenza diretta.",
        badge: ["TBH"],
        esposizione: N,
        stato: "attivo",
      },
    ],
  },
  {
    numero: 99,
    ordine: 220,
    nome: "TBH / CEO",
    categoria: "Istituzionale",
    funzione: "Touch Business Holding, Claudio Ugolini, identità, storia e struttura del gruppo.",
    url: "/ceo",
    colore: "#e2c37a",
    badge: ["TBH"],
    stato: "attivo",
    programmazione: [
      {
        etichetta: "TBH / CEO",
        titolo: "Claudio Ugolini · CEO",
        url: "/ceo",
        descrizione: "Editore, CEO, artista e imprenditore: il percorso e le società.",
        badge: ["TBH"],
        esposizione: "prioritario",
        stato: "attivo",
        inHome: true,
      },
      {
        etichetta: "TBH / CEO",
        titolo: "Le società del gruppo",
        url: "/tbh/societa",
        descrizione: "La struttura societaria.",
        badge: ["TBH"],
        esposizione: N,
        stato: "attivo",
      },
      {
        etichetta: "TBH / CEO",
        titolo: "Anagrafica master",
        url: "/anagrafica",
        descrizione: "Il registro dei soggetti censiti.",
        badge: ["TBH"],
        esposizione: N,
        stato: "attivo",
      },
      {
        etichetta: "TBH / CEO",
        titolo: "Identità visiva",
        url: "/design",
        descrizione: "Colori, loghi e regole del marchio.",
        badge: ["TBH"],
        esposizione: N,
        stato: "attivo",
      },
    ],
  },
];

/* ── ORDINE E PRIORITÀ ─────────────────────────────────────────────────────── */

/**
 * La priorità di un canale, calcolata (non scritta a mano, così non si
 * disallinea): conta i contenuti attivi e il materiale visuale reale.
 */
export function prioritaCanale(c: Canale): PrioritaEditoriale {
  if (c.stato !== "attivo") return "in-allestimento";
  const attivi = c.programmazione.filter((p) => p.stato === "attivo").length;
  if (attivi === 0) return "in-allestimento";
  const visuale = Boolean(LOGO_CANALE_PALINSESTO[c.numero]);
  const promossi = c.programmazione.some((p) => p.inHome || p.esposizione === "prioritario");
  if (visuale && promossi) return "prioritario";
  if (visuale && attivi >= 3) return "alta-visibilita";
  if (attivi >= 3) return "evidenza";
  return "normale";
}

/**
 * I canali nell'ordine giusto: prima la priorità editoriale, poi l'ordine
 * interno. Mai `Math.random`, mai l'ordine di scrittura del file.
 */
export function canaliOrdinati(opzioni?: { conHome?: boolean }): Canale[] {
  const base = opzioni?.conHome ? CANALI : CANALI.filter((c) => c.numero !== 0);
  return [...base].sort(
    (a, b) =>
      PESO_PRIORITA[prioritaCanale(b)] - PESO_PRIORITA[prioritaCanale(a)] ||
      a.ordine - b.ordine,
  );
}

/** Il marchio ufficiale del canale, se ce l'abbiamo davvero. Mai ricostruito. */
export function canaleLogo(c: Canale): string | null {
  return LOGO_CANALE_PALINSESTO[c.numero] ?? null;
}

/** Solo i canali che possono occupare le vetrine principali della Home. */
export function canaliInVetrina(): Canale[] {
  return canaliOrdinati().filter((c) => prioritaCanale(c) !== "in-allestimento");
}

/** I numeri, nell'ordine editoriale, per lo zapping ciclico. */
export const NUMERI_CANALE = canaliOrdinati({ conHome: true }).map((c) => c.numero);

export function canalePerNumero(numero: number): Canale | undefined {
  return CANALI.find((c) => c.numero === numero);
}

/** Il canale a cui appartiene il percorso corrente: prima la pagina canonica, poi la programmazione. */
export function canaleDiPercorso(percorso: string): Canale | undefined {
  const pulito = percorso.length > 1 ? percorso.replace(/\/$/, "") : percorso;
  // Mini-homepage di canale: /canale/N vince su tutto.
  const diretto = /^\/canale\/(\d+)$/.exec(pulito);
  if (diretto) {
    const trovato = canalePerNumero(Number.parseInt(diretto[1]!, 10));
    if (trovato) return trovato;
  }
  const canonico = CANALI.find((c) => c.numero !== 0 && c.url === pulito);
  if (canonico) return canonico;
  const dentro = CANALI.find(
    (c) => c.numero !== 0 && c.programmazione.some((p) => p.url === pulito),
  );
  if (dentro) return dentro;
  return canalePerNumero(0);
}

/** Zapping ciclico: +1 e -1 sulla successione dei numeri, non sul valore numerico. */
export function canaleSuccessivo(numero: number): Canale {
  const i = NUMERI_CANALE.indexOf(numero);
  const prossimo = NUMERI_CANALE[(i + 1 + NUMERI_CANALE.length) % NUMERI_CANALE.length]!;
  return canalePerNumero(prossimo)!;
}

export function canalePrecedente(numero: number): Canale {
  const i = NUMERI_CANALE.indexOf(numero);
  const prima = NUMERI_CANALE[(i - 1 + NUMERI_CANALE.length) % NUMERI_CANALE.length]!;
  return canalePerNumero(prima)!;
}

/** Il percorso interno del canale: lo 0 è la home, gli altri hanno la loro mini-homepage. */
export function percorsoCanale(numero: number): string {
  return numero === 0 ? "/" : `/canale/${numero}`;
}

/** I contenuti promossi in HOME come grandi pulsanti autonomi (punto 12 della specifica). */
export const CONTENUTI_IN_HOME = CANALI.flatMap((c) =>
  c.programmazione.filter((p) => p.inHome).map((p) => ({ ...p, canale: c })),
);

export const PALINSESTO_TITOLO = "I CANALI TBH";
export const PALINSESTO_SOTTOTITOLO =
  "Ogni canale ha un nome, non un numero: scegli quello che ti interessa, entra e continua a scorrere.";
export const PALINSESTO_NOTA =
  "Ogni pagina esiste una sola volta: può essere richiamata da più canali, ma l'indirizzo resta unico. Dove manca un logo o un contenuto vero, lo spazio resta segnalato come in allestimento: non inventiamo nulla.";
