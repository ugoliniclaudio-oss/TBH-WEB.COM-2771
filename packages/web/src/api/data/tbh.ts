/**
 * Entità del Mondo TBH derivate dalla Master List (docs/master-list.md).
 * Regola: nessun prezzo, benefit, contatto o logo inventato.
 * Dove il dato manca → null + la UI scrive "da definire" / "in allestimento".
 */

import { ultimaPuntataDa } from "./dm-puntate";
import { LOGHI_CHANNEL } from "./loghi-channel";

export type StatoDato = "verificato" | "da-verificare" | "in-allestimento";

/* ------------------------------------------------------------------ *
 * 10-11 · DM COMUNICAZIONI — media partner, NON società del gruppo TBH
 * ------------------------------------------------------------------ */

export const DM_CANALE = {
  slug: "dm",
  name: "DM Comunicazioni",
  ruolo: "Media partner — soggetto autonomo, non società del gruppo TBH",
  /** Logo UFFICIALE DM (diavolo rosso/nero) fornito da Claudio il 29/08/2026. Nessuna variante ricreata. */
  logo: LOGHI_CHANNEL["dm"]!.src as string | null,
  /** Canale ufficiale «Daniele Manuelli Official» — DM Comunicazione. Link fornito da Claudio il 29/08/2026. */
  youtube: "https://www.youtube.com/@DanieleManuelli1981",
  canaleNome: "Daniele Manuelli Official",
  /** Sito editoriale UFFICIALE DM — indicato da Claudio il 15/09/2026. Non è una fonte esterna
   *  come Tuttocampo o Romagna Sport: è il sito di DM. Resta un link esterno, non una copia interna. */
  sito: "https://www.dmsportlive.it/" as string | null,
  sitoEditoriale: {
    nome: "DM Sport Live",
    url: "https://www.dmsportlive.it/",
    /** Pagina del palinsesto sul sito ufficiale: da lì arrivano giorni e orari. */
    palinsesto: "https://www.dmsportlive.it/?p=596",
    cosa: "Notizie, produzioni, servizi e Web TV di DM: Serie D, Eccellenza, Promozione, Coppa Italia.",
  },
  /** Social UFFICIALI verificati (nessun profilo inventato). */
  social: [
    { rete: "youtube", etichetta: "YouTube · Daniele Manuelli Official", url: "https://www.youtube.com/@DanieleManuelli1981" },
    { rete: "facebook", etichetta: "Facebook · Daniele Manuelli", url: "https://www.facebook.com/share/17pCJoQvh4" },
    { rete: "facebook", etichetta: "Facebook · Sport Up Rimini", url: "https://www.facebook.com/sportuprimini" },
  ] as { rete: string; etichetta: string; url: string }[],
  /** Dati di canale comunicati da Claudio il 29/08/2026: nessun numero stimato. */
  canaleDati: {
    descrizione: "Canale ufficiale DM Comunicazione",
    iscritti: "3,14K iscritti",
    video: "2.768 video",
    visualizzazioni: "1.613.553 visualizzazioni",
    dalGiorno: "Iscritto il 9 giugno 2014",
    paese: "Italia",
  },
  referente: "Daniele Manuelli",
  note: "Repliche televisive su canale 88 (Made in Bo). TBH collabora alle riprese con Claudio Ugolini videoperatore.",
  stato: "verificato" as StatoDato,
};

export type PuntataDM = {
  titolo: string;
  edizione: string | null;
  durata: string | null;
  canale: string | null;
  video: string | null;
  videoId: string | null;
};

export type ProgrammaDM = {
  slug: string;
  /** Slug usati in passato: restano validi, nessun link si rompe. */
  alias: string[];
  name: string;
  /** 1 = lunedì ... 7 = domenica. null se la ricorrenza non è confermata. */
  giorno: number | null;
  ora: string | null;
  durataMin: number;
  descrizione: string;
  youtube: string | null;
  /** true = fa parte del palinsesto settimanale confermato da DM Sport Live. */
  inPalinsesto: boolean;
  /** Ultima puntata pubblicata: solo con link ufficiale verificato, altrimenti null. */
  ultimaPuntata: PuntataDM | null;
  stato: StatoDato;
};

const YT_DM = "https://www.youtube.com/@DanieleManuelli1981";

/**
 * PALINSESTO DM confermato dal sito ufficiale DM Sport Live (?p=596) — dati passati da
 * Claudio il 15/09/2026. Quattro programmi: nessun orario inventato, nessuna puntata finta.
 */
export const PROGRAMMI_DM: ProgrammaDM[] = [
  {
    slug: "calcio-di-rigore",
    alias: [],
    name: "Calcio di Rigore",
    giorno: 1,
    ora: "19:45",
    durataMin: 90,
    descrizione:
      "Il programma sul calcio dilettantistico: Serie D, Eccellenza, Promozione e Prima Categoria. Ospiti in studio, interviste e commento del turno.",
    youtube: YT_DM,
    inPalinsesto: true,
    /** 16/10/2026: ultima puntata dall'archivio ufficiale dm-puntate.ts (prima: null). */
    ultimaPuntata: ultimaPuntataDa("calcio-di-rigore", "Calcio di Rigore"),
    stato: "verificato",
  },
  {
    slug: "tg-sport",
    alias: ["tg-sportivo"],
    name: "TG Sport",
    giorno: 2,
    ora: "18:45",
    durataMin: 30,
    descrizione:
      "Il notiziario con i risultati, i servizi dai campi e le interviste del fine settimana.",
    youtube: YT_DM,
    inPalinsesto: true,
    /** 16/10/2026: ultima puntata dall'archivio ufficiale dm-puntate.ts (prima: null). */
    ultimaPuntata: ultimaPuntataDa("tg-sport", "TG Sport"),
    stato: "verificato",
  },
  {
    slug: "il-calcio-di-tutti",
    alias: ["calcio-d-tutti"],
    name: "Il Calcio D Tutti",
    giorno: 2,
    ora: "19:45",
    durataMin: 90,
    descrizione:
      "Il programma dedicato ai nove gironi della Serie D nazionale. Programmazione confermata: ogni martedì alle ore 19:45.",
    youtube: YT_DM,
    inPalinsesto: true,
    /** Fino al 16/10/2026 qui c'era la 1ª puntata (Ft9hDwhjQUo, link fornito da Claudio):
        resta nell'archivio dm-puntate.ts. Ora l'ultima puntata pubblicata. */
    ultimaPuntata: ultimaPuntataDa("il-calcio-di-tutti", "Il Calcio D Tutti"),
    stato: "verificato",
  },
  {
    slug: "anteprima-sport",
    alias: [],
    name: "AnteprimaSport",
    giorno: 5,
    ora: "19:45",
    durataMin: 90,
    descrizione:
      "La presentazione del turno successivo: anticipazioni, probabili formazioni e commento dei campionati dilettantistici.",
    youtube: YT_DM,
    inPalinsesto: true,
    /** Nessun monitor provvisorio: la puntata si pubblica solo con il link ufficiale.
        16/10/2026: link ufficiali presenti in dm-puntate.ts (sul canale «Anteprima SportUp»). */
    ultimaPuntata: ultimaPuntataDa("anteprima-sport", "AnteprimaSport"),
    stato: "verificato",
  },
  {
    /* Storico: programma NON presente nel palinsesto confermato del 15/09/2026.
       Il dato non si cancella, ma non si pubblica come se fosse in onda. */
    slug: "sport-up",
    alias: [],
    name: "Sport Up",
    giorno: null,
    ora: null,
    durataMin: 90,
    descrizione:
      "Approfondimento sul calcio riminese con ospiti e collegamenti. Programmazione non presente nel palinsesto settimanale attuale: in attesa di conferma da DM.",
    youtube: YT_DM,
    inPalinsesto: false,
    ultimaPuntata: null,
    stato: "da-verificare",
  },
];

/** I quattro programmi del palinsesto confermato, nell'ordine della settimana. */
export const PALINSESTO_DM = PROGRAMMI_DM.filter((p) => p.inPalinsesto);

/* ------------------------------------------------------------------ *
 * 29 · I 25 LIVELLI TBH — area master unica
 * ------------------------------------------------------------------ */

export type Livello = {
  numero: number;
  nome: string;
  fascia: "ESSENZIALE" | "START UP" | "PROFESSIONALE" | "LUXURY" | "ALL INCLUSIVE";
  /** Prezzi e benefit restano null finché Claudio non li fornisce. */
  prezzoPubblicoCents: number | null;
  prezzoCircuitoCents: number | null;
  benefit: string[];
};

const L = (
  numero: number,
  nome: string,
  fascia: Livello["fascia"],
): Livello => ({
  numero,
  nome,
  fascia,
  prezzoPubblicoCents: null,
  prezzoCircuitoCents: null,
  benefit: [],
});

export const LIVELLI: Livello[] = [
  L(1, "Free Pass", "ESSENZIALE"),
  L(2, "First Pass", "ESSENZIALE"),
  L(3, "Acqua", "START UP"),
  L(4, "Aria", "START UP"),
  L(5, "Fuoco", "START UP"),
  L(6, "Terra", "START UP"),
  L(7, "Sabbia", "START UP"),
  L(8, "Flower", "START UP"),
  L(9, "Jungle", "START UP"),
  L(10, "Artist", "PROFESSIONALE"),
  L(11, "Crew", "PROFESSIONALE"),
  L(12, "Hospitality", "PROFESSIONALE"),
  L(13, "Sponsor & Partner", "PROFESSIONALE"),
  L(14, "VIP Club", "LUXURY"),
  L(15, "Special Guest", "LUXURY"),
  L(16, "Expo", "LUXURY"),
  L(17, "City Tank", "LUXURY"),
  L(18, "Pietra", "ALL INCLUSIVE"),
  L(19, "Legno", "ALL INCLUSIVE"),
  L(20, "Bronzo", "ALL INCLUSIVE"),
  L(21, "Argento", "ALL INCLUSIVE"),
  L(22, "Oro", "ALL INCLUSIVE"),
  L(23, "Diamante", "ALL INCLUSIVE"),
  L(24, "Platino", "ALL INCLUSIVE"),
  L(25, "Cromatico", "ALL INCLUSIVE"),
];

export const FASCE_LIVELLO = [
  {
    nome: "ESSENZIALE",
    descrizione: "L'ingresso nel mondo TBH: accesso base al Circuito e alla community.",
  },
  {
    nome: "START UP",
    descrizione: "Per chi apre un'attività o entra nel Circuito con una prima visibilità.",
  },
  {
    nome: "PROFESSIONALE",
    descrizione: "Per artisti, crew, hospitality, sponsor e partner operativi.",
  },
  { nome: "LUXURY", descrizione: "Massima visibilità, ospitalità e presenza negli eventi." },
  {
    nome: "ALL INCLUSIVE",
    descrizione: "Pacchetti completi: visibilità, servizi, eventi e cashback insieme.",
  },
] as const;

/* ------------------------------------------------------------------ *
 * 14-17 · Brand e produzioni con pagina propria
 * ------------------------------------------------------------------ */

export type BrandPage = {
  slug: string;
  name: string;
  kind: "attivita" | "produzione" | "concorso" | "piattaforma";
  claim: string;
  descrizione: string;
  punti: string[];
  logo: string | null;
  link: { label: string; url: string }[];
  stato: StatoDato;
};

export const BRAND_PAGES: BrandPage[] = [
  {
    slug: "touch-fashion",
    name: "Touch Fashion",
    kind: "attivita",
    claim: "Moda, sfilate, styling e produzione immagine",
    descrizione:
      "Attività del gruppo TBH (senza P.IVA propria) dedicata alla moda: sfilate, casting moda, styling, shooting e collaborazioni con brand e negozi del territorio.",
    punti: [
      "Sfilate ed eventi moda su Riviera e tour",
      "Casting modelle e modelli in collaborazione con Touch Casting",
      "Shooting e contenuti per brand e negozi del Circuito",
      "Vetrina prodotti moda nel Touch Plaza Shop",
    ],
    logo: null,
    link: [],
    stato: "in-allestimento",
  },
  {
    /* CORREZIONE del 28/09/2026, ordine di Claudio. Questa scheda diceva
       «Miss Cool / Miss & Mister Cool», «concorso maschile e femminile»,
       «candidature aperte a ragazze e ragazzi». Il Kit Digitale 2027 — che è la
       fonte approvata — parla SOLO al femminile: «TOUCH MISS COOL», «candidata»,
       «PROFILO CANDIDATA», e non nomina mai mister/maschile/ragazzi (verificato
       sulle 15 slide: zero occorrenze). Claudio ha confermato: «vale il Kit».
       Il testo maschile era un dato non verificato ed è stato rimosso.

       I contenuti veri del concorso stanno ora in api/data/miss-cool.ts e la
       pagina /eventi/miss-cool è la pagina master del concorso, non più questa
       scheda brand generica. Questo record resta solo come voce di registro. */
    slug: "miss-cool",
    name: "Touch Miss Cool",
    kind: "concorso",
    claim: "Il concorso di bellezza del gruppo TBH · Edizione 2027",
    descrizione:
      "Concorso di bellezza del gruppo TBH, edizione 2027. Si corre su due percorsi paralleli — le tappe live e la versione Touch Miss Cool Web con voto verificato — che confluiscono nella finale ufficiale e nell'assegnazione degli 11 incarichi annuali.",
    punti: [
      "Due percorsi: tappe live e Touch Miss Cool Web",
      "11 premiazioni con incarico annuale, dalla 12ª Official Candidate",
      "Regolamento in 18 articoli e moduli di candidatura",
      "Compensi, gettoni e premi: DA DEFINIRE dalla direzione TBH",
    ],
    logo: null,
    link: [],
    stato: "in-allestimento",
  },
  {
    slug: "reality-show",
    name: "Reality Show Giovanile Rimini",
    kind: "produzione",
    claim: "Produzione TBH · case history documentata",
    descrizione:
      "Format di reality giovanile prodotto dal gruppo. Le visualizzazioni raccolte nelle edizioni passate sono riportate come case history documentabile, non come risultato garantito per gli sponsor.",
    punti: [
      "Case history: oltre 5 milioni di visualizzazioni sulle edizioni passate (dato dichiarato dalla produzione, da documentare)",
      "Puntate e partite integrali: archivio in allestimento",
      "Staff, giocatori e collaboratori in scheda",
      "Produzione: Touch Production · sezione Touch Cinema",
      "Canali collegati: sito Giovanili Rimini e canale YouTube ASD Giovanile Rimini Football (link verificati il 29/08/2026)",
      "Claudio dichiara almeno 3 canali collegati: il terzo non è ancora stato comunicato",
      "Instagram e TikTok del format: da collegare, nessun profilo viene indicato senza il nome reale",
      "Academy e reclutamento giocatori tramite colloqui: pagina dedicata /media/reality-show/academy",
    ],
    logo: null,
    link: [
      { label: "Giovanili Rimini — sito ufficiale", url: "https://www.giovanilerimini.org/" },
      {
        label: "YouTube — ASD Giovanile Rimini Football",
        url: "https://www.youtube.com/@asdgovanileriminifootball7338",
      },
    ],
    stato: "da-verificare",
  },
  {
    slug: "heddy-video",
    name: "HEDDY.video",
    kind: "piattaforma",
    claim: "Il contenitore video e film del gruppo",
    descrizione:
      "Piattaforma dedicata a film, docufilm, videoclip e contenuti video del gruppo: acquisto e noleggio dei titoli disponibili.",
    punti: [
      "Catalogo film e docufilm",
      "Videoclip e contenuti delle produzioni TBH",
      "Acquisto e noleggio: in allestimento",
      "Link ufficiale della piattaforma: da fornire",
    ],
    logo: null,
    link: [],
    stato: "in-allestimento",
  },
  {
    slug: "touch-crew-entertainment",
    name: "Touch Crew Entertainment",
    kind: "attivita",
    claim: "Animazione, spettacolo e crew per locali ed eventi",
    descrizione:
      "Attività del gruppo dedicata all'intrattenimento: crew di animazione, spettacolo, DJ set e servizio artistico per locali, villaggi, hotel ed eventi privati.",
    punti: [
      "Crew animazione per villaggi, hotel e stabilimenti",
      "DJ set, spettacolo e conduzione serate",
      "Selezione e formazione del personale artistico con Touch Casting",
      "Preventivi su richiesta: nessun listino pubblicato senza conferma",
    ],
    logo: null,
    link: [],
    stato: "in-allestimento",
  },
  {
    slug: "touch-spotlight",
    name: "Touch Spotlight",
    kind: "attivita",
    claim: "La rubrica che mette in vetrina sponsor, partner e aziende",
    descrizione:
      "Touch Spotlight NON è una rivista separata: è la rubrica/inserto interno di Touch Influencity Magazine che porta in vetrina e in primo piano sponsor, partner, aziende e imprese, con intervista dedicata.",
    punti: [
      "Vetrina e primo piano dentro Touch Influencity Magazine",
      "Intervista dedicata all'azienda o al partner",
      "Collegata alle schede Clienti, Sponsor e Partner del Network",
      "Codice TBH e costi: da confermare",
    ],
    logo: null,
    link: [],
    stato: "verificato",
  },
  {
    slug: "touch-academy",
    name: "Touch Academy",
    kind: "attivita",
    claim: "Formazione e crescita professionale del gruppo",
    descrizione:
      "Percorsi di formazione professionale del gruppo TBH. Il catalogo corsi completo e i costi si confermano prima della pubblicazione: nessun prezzo pubblicato senza conferma.",
    punti: [
      "Corsi professionali e percorsi di crescita",
      "Collegamento diretto con Lavoro & Casting",
      "Attestati e esami: dettagli da confermare",
      "Informazioni e iscrizioni via WhatsApp",
    ],
    logo: null,
    link: [],
    stato: "in-allestimento",
  },
  {
    slug: "touch-influencity-magazine",
    name: "Touch Influencity Magazine",
    kind: "piattaforma",
    claim: "L'unica rivista ufficiale del gruppo TBH",
    descrizione:
      "La rivista ufficiale del gruppo: una sola testata, con la rubrica interna Touch Spotlight dedicata a sponsor, partner e aziende. Numeri mensili dal 2022, con un numero bis di dicembre come highlights dell'anno.",
    punti: [
      "N°0 giugno/luglio 2022, poi uscite mensili",
      "Numero bis di dicembre = highlights dell'anno",
      "Rubrica interna: Touch Spotlight",
      "Anteprime e copertine reali: in arrivo da Claudio",
    ],
    logo: null,
    link: [],
    stato: "in-allestimento",
  },
  {
    slug: "touch-music",
    name: "Touch Music",
    kind: "attivita",
    claim: "Musica, artisti e produzione sonora del gruppo",
    descrizione:
      "Area musicale del gruppo: artisti, produzioni sonore, radio e canali musicali collegati. Include Touch Music Radio e Touch Music TV, oggi in allestimento.",
    punti: [
      "Artisti e produzioni musicali del gruppo",
      "Touch Music Radio · Touch Music TV: in allestimento",
      "Collaborazioni con radio partner del Network",
      "Link ufficiali dei canali: da fornire",
    ],
    logo: null,
    link: [],
    stato: "in-allestimento",
  },
  {
    slug: "touch-tv",
    name: "Touch TV",
    kind: "piattaforma",
    claim: "Il canale televisivo del gruppo TBH",
    descrizione:
      "Canale TV del gruppo per spot, programmi e contenuti delle società e delle attività TBH. Palinsesto e link di diretta in allestimento.",
    punti: [
      "Spot e contenuti delle società del gruppo",
      "Programmi collegati a DM Comunicazioni e alle produzioni TBH",
      "Palinsesto: in allestimento",
      "Link ufficiale del canale: da fornire",
    ],
    logo: null,
    link: [],
    stato: "in-allestimento",
  },
  {
    slug: "touch-cinema",
    name: "Touch Cinema",
    kind: "produzione",
    claim: "Film, docufilm e produzione cinematografica",
    descrizione:
      "Sezione cinema del gruppo, dentro Touch Production: film, docufilm, videoclip e format. I titoli disponibili vengono distribuiti su HEDDY.video.",
    punti: [
      "Film, docufilm e videoclip",
      "Produzione: Touch Production",
      "Distribuzione dei titoli su HEDDY.video",
      "Catalogo completo: in allestimento",
    ],
    logo: null,
    link: [],
    stato: "in-allestimento",
  },
  {
    slug: "hugoland",
    name: "Hugoland / Eventi Hugoland",
    kind: "attivita",
    claim: "Il format di eventi e serate del gruppo",
    descrizione:
      "Format di eventi e serate del gruppo TBH, presente anche nella mappa del territorio come luogo del Circuito TBH. Calendario delle date da confermare.",
    punti: [
      "Serate ed eventi sul territorio",
      "Presente nella mappa del Circuito TBH",
      "Calendario date: da confermare",
      "Prenotazioni e info via WhatsApp",
    ],
    logo: null,
    link: [],
    stato: "da-verificare",
  },
];

/* ------------------------------------------------------------------ *
 * 30-31 · Lavoro & Casting + link istituzionali
 * ------------------------------------------------------------------ */

export type Annuncio = {
  slug: string;
  titolo: string;
  luogo: string;
  tipo: string;
  descrizione: string;
  requisiti: string[];
  scadenza: string | null;
  stato: StatoDato;
};

/** Solo annunci realmente confermati. Nessuna posizione inventata. */
export const ANNUNCI: Annuncio[] = [
  {
    slug: "operatori-cremona-circuit-2026",
    titolo: "Cremona Circuit 2026 — operatori per presidio evento motorsport",
    luogo: "Cremona Circuit",
    tipo: "Presidio evento · 24 · 25 · 26 · 27 settembre 2026",
    descrizione:
      "Raccolta di candidature e disponibilità per i servizi previsti dal 24 al 27 settembre 2026. Turni diurni 07:00-18:00 e notturni 18:00-07:00: 6 operatori ordinari per ogni notturno, 55 operatori venerdì e sabato (20 antincendio + 35 ordinari) e 60 la domenica (20 antincendio + 40 ordinari). Gli operatori antincendio sono già compresi nei totali.",
    requisiti: [
      "Operatori ordinari e operatori con idoneità tecnica antincendio",
      "Candidatura per una o più giornate, indicando i turni disponibili (diurno e/o notturno)",
      "Per gli operatori antincendio: segnalare nella candidatura l'idoneità tecnica antincendio",
    ],
    scadenza: "27 settembre 2026",
    stato: "verificato",
  },
  {
    slug: "tbh-high-visibility-scout",
    titolo: "TBH High Visibility Scout — collaboratori e collaboratrici",
    luogo: "Rimini · Valmarecchia · Riviera · Padova · Milano · Roma · Sanremo · Sommatino · Italia · Calella (ES)",
    tipo: "Collaborazione · on field, smart working e da remoto",
    descrizione:
      "Ricerca collaboratori e collaboratrici per la rete scout TBH: trovi le opportunità, TBH presenta, tratta e chiude. Compenso per contatti qualificati (20 contatti €250 · 50 contatti €500 · 100 contatti €1.000) più il 25% di bonus su ogni cliente acquisito.",
    requisiti: [
      "Persone dinamiche, affidabili, organizzate, con buone capacità relazionali",
      "Non è indispensabile essere venditori professionisti",
      "Saper individuare opportunità, creare il primo contatto e riconoscere un interesse concreto",
    ],
    scadenza: null,
    stato: "verificato",
  },
  {
    slug: "pr-pride-village-2026",
    titolo: "Cerchiamo PR — Pride Village",
    luogo: "Padova · Pride Summer Village",
    tipo: "Collaborazione PR",
    descrizione:
      "Ricerca PR per la promozione degli eventi del Village: vendita accrediti, tavoli e Village Card con formula You Pay To Cash Back.",
    requisiti: [
      "Predisposizione al contatto con il pubblico",
      "Disponibilità nelle serate evento",
      "Maggiore età",
    ],
    scadenza: null,
    stato: "verificato",
  },
];

export const ISTITUZIONI: { gruppo: string; voci: { name: string; url: string; note: string }[] }[] =
  [
    {
      gruppo: "Lavoro e politiche attive",
      voci: [
        {
          name: "Portale per le politiche attive del lavoro (Ministero del Lavoro)",
          url: "https://www.lavoro.gov.it/strumenti-e-servizi/pagine/portale-politiche-attive-lavoro",
          note: "DID online, CV e servizi che hanno sostituito MyANPAL. I Centri per l'Impiego si raggiungono da qui, regione per regione.",
        },
        {
          name: "SIUL — Sistema Informativo Unitario Lavoro (Regione Lombardia)",
          url: "https://www.regione.lombardia.it/istruzione-formazione-e-lavoro/lavoro-e-occupazione/siul---sistema-informativo-unitario-lavoro",
          note: "Comunicazioni obbligatorie e servizi al lavoro in Lombardia.",
        },
      ],
    },
    {
      gruppo: "Previdenza e assicurazione",
      voci: [
        { name: "INPS", url: "https://www.inps.it/", note: "Portale istituzionale." },
        {
          name: "INPS — Lavoratori dello spettacolo (ex ENPALS)",
          url: "https://www.inps.it/it/it/dettaglio-scheda.it.schede-servizio-strumento.schede-aree-tematiche.59273.servizi-per-i-lavoratori-dello-spettacolo.html",
          note: "Agibilità, contributi e servizi per artisti e tecnici.",
        },
        { name: "INAIL", url: "https://www.inail.it/", note: "Assicurazione infortuni sul lavoro." },
      ],
    },
    {
      gruppo: "Fisco e impresa",
      voci: [
        {
          name: "Agenzia delle Entrate",
          url: "https://www.agenziaentrate.gov.it/",
          note: "Cassetto fiscale, fatturazione elettronica, dichiarazioni.",
        },
        {
          name: "Agenzia Entrate-Riscossione",
          url: "https://www.agenziaentrateriscossione.gov.it/",
          note: "Cartelle, rateizzazioni e situazione debitoria.",
        },
        {
          name: "Registro Imprese — Camere di Commercio",
          url: "https://www.registroimprese.it/",
          note: "Visure, bilanci e pratiche camerali.",
        },
        {
          name: "Unioncamere",
          url: "https://www.unioncamere.gov.it/",
          note: "Sistema camerale italiano.",
        },
      ],
    },
  ];

/** Nota obbligatoria: TBH non è un ente pubblico. */
export const ISTITUZIONI_DISCLAIMER =
  "Touch Business Holding non è un ente pubblico e non gestisce pratiche per conto degli enti indicati. Questi sono collegamenti diretti ai portali ufficiali, forniti come servizio informativo.";

/* ─────────────────  PUNTO 04 · ATTIVITÀ SENZA P.IVA PROPRIA  ─────────────────
 * Attività/progetti citati nel Master che NON compaiono in COMPANIES.
 * Nessun codice TBH inventato: dove non è stato comunicato resta null.
 * REGOLA: un'attività non diventa mai automaticamente una società.
 */
export type AttivitaGruppo = {
  slug: string;
  nome: string;
  ambito: string;
  descrizione: string;
  codiceTBH: string | null;
  pagina: string | null;
  stato: StatoDato;
};

export const ATTIVITA_GRUPPO: AttivitaGruppo[] = [
  {
    slug: "touch-spotlight",
    nome: "Touch Spotlight",
    ambito: "Rubrica editoriale",
    descrizione:
      "Rubrica/inserto interno di Touch Influencity Magazine: mette in vetrina sponsor, partner e aziende con intervista dedicata. Non è una rivista separata.",
    codiceTBH: null,
    pagina: null,
    stato: "verificato",
  },
  {
    slug: "touch-academy",
    nome: "Touch Academy",
    ambito: "Formazione",
    descrizione:
      "Percorsi di formazione e crescita professionale del gruppo. Catalogo corsi e costi da confermare prima della pubblicazione.",
    codiceTBH: null,
    pagina: null,
    stato: "in-allestimento",
  },
  {
    slug: "hugoland",
    nome: "Hugoland / Eventi Hugoland",
    ambito: "Eventi · Intrattenimento",
    descrizione:
      "Format di eventi e serate del gruppo. Presente anche nella mappa del territorio come luogo del Circuito TBH.",
    codiceTBH: null,
    pagina: "/territorio/mappa",
    stato: "da-verificare",
  },
  {
    slug: "jc-hugo",
    nome: "J.C. Hugò",
    ambito: "Attività musicale",
    descrizione:
      "Attività musicale collegata al gruppo. Produzioni e pubblicazioni da confermare: nessun link inserito senza conferma.",
    codiceTBH: null,
    pagina: null,
    stato: "da-verificare",
  },
];

export const ATTIVITA_DISCLAIMER =
  "Le attività del gruppo non hanno partita IVA propria: operano sotto le società TBH indicate nelle rispettive schede. " +
  "Un'attività non viene mai promossa automaticamente a società: la denominazione societaria e i dati fiscali si pubblicano solo dopo conferma di Claudio.";
