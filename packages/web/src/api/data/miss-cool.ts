import { TBH_CONTACTS } from "./catalog";

/**
 * TOUCH MISS COOL & TOUCH MISS COOL WEB — KIT DIGITALE 2027.
 *
 * REGOLA UNICA DI QUESTO FILE: ogni riga qui dentro è copiata dal Kit Digitale
 * 2027 approvato da Claudio (file `public/miss-cool/touch-miss-cool-kit-2027.pdf`,
 * versione «AGGIORNATO» con le 11 premiazioni) oppure è una sua dichiarazione
 * esplicita in chiaro. Niente importi, niente date, niente premi inventati:
 * dove il Kit dice «DA DEFINIRE», qui c'è DA_DEFINIRE e il sito lo scrive così.
 *
 * Dichiarazione di Claudio del 28/09/2026 sui soldi:
 *   «Compensi, gettoni e premi economici restano DA DEFINIRE, in attesa dei tuoi importi»
 *   «Cachet in base all'evento e alla tipologia di evento»
 * Finché non arrivano gli importi, nessuna cifra compare da nessuna parte.
 */

export const DA_DEFINIRE = "DA DEFINIRE" as const;

export const MISS_COOL = {
  edizione: "2027",
  titolo: "TOUCH MISS COOL",
  titoloWeb: "TOUCH MISS COOL WEB",
  sottotitolo: "Kit digitale · Edizione 2027",
  claim: "Concorso · Casting · Web voting · Eventi · Sport · Produzione",
  occhiello: "Un concorso, due percorsi",
  descrizione:
    "Touch Miss Cool è il concorso di bellezza del gruppo TBH. Si corre su due percorsi paralleli — le tappe live e la versione Web con voto verificato — che confluiscono nella finale ufficiale e nell'assegnazione degli 11 incarichi annuali.",
  kitPdf: "/miss-cool/touch-miss-cool-kit-2027.pdf",
  /** Nota sui soldi: la stessa frase compare su ogni pagina che parla di premi. */
  notaCompensi:
    "Compensi fissi, gettoni di presenza, premi ed esclusive sono DA DEFINIRE: il cachet viene stabilito in base all'evento e alla tipologia di evento. Nessun importo è pubblicato finché la direzione TBH non lo comunica per iscritto.",
  notaBozza:
    "I moduli e il regolamento sono la versione digitale del Kit 2027: prima della raccolta delle candidature vanno validati dalla direzione TBH e dal consulente privacy. Il sito non aggiunge nulla che non sia nel Kit.",
  contatti: {
    whatsapp: TBH_CONTACTS.whatsapp,
    telefonoItalia: TBH_CONTACTS.telItalia,
    /* WhatsApp e telefono Italia arrivano da TBH_CONTACTS: recapiti già verificati
       del gruppo. Le due e-mail sono state comunicate da Claudio il 28/09/2026:
       nel Kit PDF non compare nessun indirizzo (verificato con pdftotext), quindi
       la fonte è la sua comunicazione diretta, non il documento.
       ATTENZIONE alla differenza d'uso, dichiarata da Claudio:
       - casting@tibihacca.com → recapito ATTIVO: pulsante diretto, si può scrivere.
       - touchgirlacademy@gmail.com → SOLO COLLEGAMENTO: si mostra come riferimento
         di Touch Girl Academy, non come casella operativa del concorso. */
    email: "casting@tibihacca.com",
    emailAttiva: true,
    emailCollegata: "touchgirlacademy@gmail.com",
    emailCollegataNota:
      "Riferimento Touch Girl Academy: solo collegamento, non è la casella operativa delle candidature.",
  },
} as const;

/** SLIDE 02 — i due percorsi e la convergenza. */
export const PERCORSI = [
  {
    slug: "live",
    nome: "TOUCH MISS COOL",
    passi: ["Casting", "Tappe live", "Shooting", "Prove", "Semifinale", "Finale"],
  },
  {
    slug: "web",
    nome: "TOUCH MISS COOL WEB",
    passi: [
      "Profilo candidata",
      "Voto verificato",
      "Classifica",
      "Qualificazione Web",
    ],
  },
] as const;

export const CONVERGENZA =
  "Le due selezioni confluiscono nella finale ufficiale e nell'assegnazione degli 11 incarichi annuali.";

/**
 * SLIDE 03 + 11 + 12 + 13 — LA CLASSIFICA UFFICIALE.
 * Esattamente 11 premiazioni, come corretto da Claudio il 28/09/2026.
 * Dalla 12ª in poi non si è vincitrici: si è Official Candidate.
 */
export type Premiazione = {
  posizione: number;
  fascia: "PLATINUM" | "DIAMOND" | "GOLD" | "SILVER+" | "SILVER" | "BRONZE+" | "BRONZE";
  livello: "A" | "B" | "C" | "D" | "E";
  incarico: string;
  ruolo: string;
  competenze: string[];
  /** Squadra DM assegnata: si compila sul modulo di accettazione, non qui. */
  squadraDm: string | null;
  colore: string;
  compensoFisso: string;
  gettonePresenza: string;
  premio: string;
  esclusiva: string;
};

const SOLDI = {
  compensoFisso: DA_DEFINIRE,
  gettonePresenza: DA_DEFINIRE,
  premio: DA_DEFINIRE,
  esclusiva: DA_DEFINIRE,
} as const;

export const CLASSIFICA: Premiazione[] = [
  {
    posizione: 1,
    fascia: "PLATINUM",
    livello: "A",
    incarico: "Testimonial & Ambassador commerciale ufficiale",
    ruolo: "Ambassador commerciale",
    competenze: [
      "Massima visibilità su tutti i canali TBH",
      "Priorità commerciale su campagne e partner",
      "Rappresentanza ufficiale del gruppo",
      "Spazio dedicato in Touch Influencity Magazine",
    ],
    squadraDm: null,
    colore: "#e5e4e2",
    ...SOLDI,
  },
  {
    posizione: 2,
    fascia: "DIAMOND",
    livello: "B",
    incarico: "Madrina eventi & co-presentatrice",
    ruolo: "Eventi e conduzione",
    competenze: [
      "Madrina degli eventi del gruppo",
      "Co-presentazione e conduzione",
      "Rappresentanza sulle tappe",
      "Spazio dedicato in Touch Influencity Magazine",
    ],
    squadraDm: null,
    colore: "#9fe8ff",
    ...SOLDI,
  },
  {
    posizione: 3,
    fascia: "GOLD",
    livello: "C",
    incarico: "Touch Production · cinema, spot, audiovisivo",
    ruolo: "Produzione",
    competenze: [
      "Produzioni Touch Production Ltd",
      "Casting prioritari su cinema, spot e audiovisivo",
      "Contenuti per il Circuito TBH",
      "Spazio dedicato in Touch Influencity Magazine",
    ],
    squadraDm: null,
    colore: "#e2c37a",
    ...SOLDI,
  },
  // 4ª → 11ª: le 8 Team Ambassador DM, una per ciascuna delle 8 squadre seguite
  // da DM Comunicazioni. La 4ª ha la priorità più alta, poi a scendere.
  ...([4, 5, 6, 7, 8, 9, 10, 11] as const).map((posizione): Premiazione => {
    const silver = posizione <= 8;
    const fascia: Premiazione["fascia"] = silver
      ? posizione === 4
        ? "SILVER+"
        : "SILVER"
      : posizione === 9
        ? "BRONZE+"
        : "BRONZE";
    return {
      posizione,
      fascia,
      livello: silver ? "D" : "E",
      incarico: "Team Ambassador DM",
      ruolo:
        posizione === 4
          ? "Team Ambassador DM · priorità più alta"
          : "Team Ambassador DM",
      competenze: [
        "Ambassador di una delle 8 squadre seguite da DM Comunicazioni",
        "Incarico annuale di 12 mesi",
        silver
          ? "Priorità progressiva sulle attività (livello D)"
          : "Attività sulle tappe e sui contenuti (livello E)",
        "Spazio dedicato in Touch Influencity Magazine",
      ],
      squadraDm: null,
      colore: silver ? "#c9ccd1" : "#c98b52",
      ...SOLDI,
    } satisfies Premiazione;
  }),
];

/** SLIDE 11 + 13 + 15 — dalla 12ª in poi. */
export const OFFICIAL_CANDIDATE = {
  titolo: "OFFICIAL CANDIDATE",
  da: "Dalla 12ª classificata in poi",
  spiegazione:
    "Dalla 12ª in poi non si entra fra le vincitrici, ma resta il riconoscimento ufficiale di partecipazione.",
  cosaRicevono: [
    "Premio di consolazione",
    "Riconoscimento di presenza",
    "Spazio dedicato nel magazine",
  ],
  notaPremio:
    "Il premio di consolazione è previsto dal Kit 2027: contenuto e valore sono DA DEFINIRE dalla direzione TBH.",
} as const;

export const MAGAZINE_PER_TUTTE =
  "Tutte le partecipanti regolarmente ammesse avranno uno spazio editoriale dedicato in Touch Influencity Magazine.";

/** SLIDE 13 — piani e livelli: la posizione determina il livello del pacchetto. */
export const PIANI_LIVELLI = [
  {
    fascia: "PLATINUM",
    posizioni: "1ª",
    livello: "A",
    cosa: "Massima visibilità · priorità commerciale",
  },
  {
    fascia: "DIAMOND",
    posizioni: "2ª",
    livello: "B",
    cosa: "Eventi · conduzione · rappresentanza",
  },
  {
    fascia: "GOLD",
    posizioni: "3ª",
    livello: "C",
    cosa: "Produzioni · casting prioritari",
  },
  {
    fascia: "SILVER",
    posizioni: "4ª–8ª",
    livello: "D",
    cosa: "Team Ambassador · priorità progressiva",
  },
  {
    fascia: "BRONZE",
    posizioni: "9ª–11ª",
    livello: "E",
    cosa: "Team Ambassador · incarico annuale",
  },
  {
    fascia: "OFFICIAL CANDIDATE",
    posizioni: "12ª+",
    livello: "—",
    cosa: "Premio di consolazione · riconoscimento presenza · spazio magazine",
  },
] as const;

/**
 * SLIDE 04 — ROADMAP 2026 → 2027.
 * Il Kit le chiama «date operative proposte, modificabili prima della
 * pubblicazione»: sul sito vanno scritte esattamente così, come proposta.
 */
export const ROADMAP = [
  { periodo: "OTT–NOV 2026", cosa: "Candidature" },
  { periodo: "DIC 2026 – GEN 2027", cosa: "Casting e profili" },
  { periodo: "01 FEB 2027", cosa: "Start Touch Miss Cool Web" },
  { periodo: "MAR–LUG 2027", cosa: "Tappe live" },
  { periodo: "AGO 2027", cosa: "Finale Web" },
  { periodo: "31 AGO 2027 · 23:59", cosa: "Stop al voto" },
  { periodo: "SET 2027", cosa: "Finale ufficiale" },
] as const;

export const ROADMAP_NOTA =
  "Date operative proposte dal Kit 2027 e modificabili prima della pubblicazione: non sono ancora il calendario definitivo.";

/** SLIDE 05 — le 8 sezioni della pagina master. */
/* INDIRIZZO CANONICO — decisione di Claudio del 28/09/2026: «/eventi/miss-cool
   diventa direttamente la nuova pagina master». Quell'indirizzo era già linkato
   da dieci punti del sito (menu, ecosistema, edicola, editoria, registro,
   palinsesto, Capitan Touch, ambienti): spostare la master altrove avrebbe
   rotto quei collegamenti o creato due URL per la stessa cosa. Quindi la master
   sta lì e le sotto-pagine sono sue figlie: /eventi/miss-cool/<sezione>.
   Una sezione senza pagina reale vale `null` e in pagina non è cliccabile. */
export const BASE_MISS_COOL = "/eventi/miss-cool";

export const SEZIONI_MASTER = [
  {
    slug: "partecipa",
    titolo: "PARTECIPA",
    cosa: "Modulo candidatura",
    href: `${BASE_MISS_COOL}/adesione`,
  },
  {
    slug: "candidate",
    titolo: "CANDIDATE",
    cosa: "Schede e portfolio",
    href: `${BASE_MISS_COOL}/schede`,
  },
  /* VOTA e CLASSIFICA WEB: il Kit li prevede, ma il meccanismo di voto
     verificato non è ancora stato definito (art. 9 del regolamento: DA
     DEFINIRE). Finché non c'è, nessuna pagina e nessun pulsante finto. */
  { slug: "vota", titolo: "VOTA", cosa: "Voto verificato", href: null },
  { slug: "classifica-web", titolo: "CLASSIFICA WEB", cosa: "Ranking Web", href: null },
  /* Il calendario delle tappe non è ancora fissato: vale la roadmap, che è
     dichiarata come proposta modificabile. Si rimanda alla master. */
  { slug: "tappe", titolo: "TAPPE", cosa: "Calendario", href: null },
  {
    slug: "regolamento",
    titolo: "REGOLAMENTO",
    cosa: "Regole ufficiali",
    href: `${BASE_MISS_COOL}/regolamento`,
  },
  {
    slug: "premiazioni",
    titolo: "PREMIAZIONI",
    cosa: "Gli 11 incarichi annuali",
    href: `${BASE_MISS_COOL}/premiazioni`,
  },
  { slug: "albo", titolo: "ALBO D'ORO", cosa: "Edizioni e vincitrici", href: null },
] as const;

/** SLIDE 06 — il formato della scheda digitale della candidata. */
export const SCHEDA_DIGITALE = {
  titolo: "PROFILO CANDIDATA",
  sottotitolo: "Formato pensato per sito, mobile e monitor.",
  blocchi: [
    { titolo: "FOTO UFFICIALE", cosa: "Primo piano ufficiale della candidata" },
    { titolo: "MISS #000", cosa: "Numero di gara · nome o nome artistico" },
    {
      titolo: "PROFILO",
      cosa: "Provincia · interessi · presentazione · esperienze",
    },
    { titolo: "MEDIA", cosa: "Portfolio · video · gallery" },
    { titolo: "VOTO", cosa: "Pulsante VOTA e conteggio valido" },
  ],
} as const;

/** SLIDE 07 — MODULO 01, domanda di partecipazione. */
export type CampoModulo = {
  nome: string;
  etichetta: string;
  tipo: "testo" | "data" | "telefono" | "email" | "lungo";
  obbligatorio: boolean;
  aiuto?: string;
};

export const MODULO_ADESIONE: {
  titolo: string;
  sottotitolo: string;
  campi: CampoModulo[];
  dichiarazioni: { chiave: string; testo: string }[];
} = {
  titolo: "DOMANDA DI PARTECIPAZIONE",
  sottotitolo: "Versione digitale precompilabile e stampabile.",
  campi: [
    { nome: "nome", etichetta: "Nome e cognome", tipo: "testo", obbligatorio: true },
    {
      nome: "nomeArtistico",
      etichetta: "Nome artistico",
      tipo: "testo",
      obbligatorio: false,
      aiuto: "Se non ne usi uno, lascia vuoto.",
    },
    { nome: "dataNascita", etichetta: "Data di nascita", tipo: "data", obbligatorio: true },
    {
      nome: "comune",
      etichetta: "Comune / Provincia",
      tipo: "testo",
      obbligatorio: true,
    },
    { nome: "telefono", etichetta: "Telefono", tipo: "telefono", obbligatorio: true },
    { nome: "email", etichetta: "E-mail", tipo: "email", obbligatorio: true },
    {
      nome: "professione",
      etichetta: "Professione / Studi",
      tipo: "testo",
      obbligatorio: false,
    },
    { nome: "esperienze", etichetta: "Esperienze", tipo: "lungo", obbligatorio: false },
    {
      nome: "trasferte",
      etichetta: "Disponibilità trasferte",
      tipo: "testo",
      obbligatorio: false,
      aiuto: "Es. solo Emilia-Romagna, tutta Italia, anche estero.",
    },
    {
      nome: "ruoli",
      etichetta: "Ruoli di interesse",
      tipo: "lungo",
      obbligatorio: false,
      aiuto: "Ambassador, eventi e conduzione, produzione, Team Ambassador DM.",
    },
  ],
  dichiarazioni: [
    { chiave: "maggiorenne", testo: "Dichiaro di avere almeno 18 anni" },
    { chiave: "regolamento", testo: "Accetto il regolamento" },
    { chiave: "privacy", testo: "Ho letto l'informativa privacy" },
  ],
};

/** SLIDE 08 — MODULO 02, consegna foto / video / portfolio. */
export const MODULO_PORTFOLIO = {
  titolo: "CONSEGNA FOTO · VIDEO · PORTFOLIO",
  sottotitolo: "Tracciamento del materiale consegnato dalla candidata.",
  materiale: [
    "Primo piano",
    "Figura intera",
    "Portfolio PDF",
    "Video presentazione",
    "CV artistico",
    "Link social autorizzati",
  ],
  dichiarazione:
    "La candidata dichiara di avere titolo a consegnare i materiali e le autorizzazioni necessarie per gli utilizzi indicati nella liberatoria.",
  tracciamento: [
    "Data consegna",
    "Numero di file",
    "Note",
    "Firma candidata",
  ],
} as const;

/** SLIDE 09 — MODULO 03, i sei consensi separati. */
export const CONSENSI = [
  {
    lettera: "A",
    titolo: "Partecipazione e gestione candidatura",
    finalita:
      "Ricevere, verificare e gestire la candidatura al concorso: identità, requisito dei 18 anni, documenti, comunicazioni di selezione, classifica e finale.",
    conseguenza:
      "Senza questo consenso la candidatura non può essere presa in carico.",
    revocabile: "Sì, in qualsiasi momento; la revoca chiude la candidatura.",
  },
  {
    lettera: "B",
    titolo: "Pubblicazione profilo sul sito",
    finalita:
      "Pubblicare la scheda digitale della candidata sul sito TBH e sulla versione Touch Miss Cool Web: nome o nome artistico, numero di gara, foto ufficiale, provincia, presentazione, interessi, esperienze.",
    conseguenza:
      "Senza questo consenso non è possibile partecipare al percorso Web con voto pubblico.",
    revocabile: "Sì; alla revoca la scheda viene rimossa dal sito.",
  },
  {
    lettera: "C",
    titolo: "Foto e video di casting ed eventi",
    finalita:
      "Riprendere, fotografare, registrare e utilizzare le immagini realizzate durante casting, shooting, prove, tappe live, semifinale e finale, per la documentazione e la comunicazione del concorso.",
    conseguenza:
      "Senza questo consenso non è possibile accedere a casting e tappe live, che sono per natura ripresi.",
    revocabile:
      "Per il futuro sì; il materiale già pubblicato segue le condizioni indicate nella liberatoria.",
  },
  {
    lettera: "D",
    titolo: "Social e comunicazione promozionale",
    finalita:
      "Utilizzare nome, immagine e contenuti sui canali social e nei materiali promozionali del gruppo TBH, dei partner e degli sponsor del concorso.",
    conseguenza:
      "Facoltativo: si può partecipare anche senza questo consenso.",
    revocabile: "Sì, in qualsiasi momento per gli utilizzi futuri.",
  },
  {
    lettera: "E",
    titolo: "Portfolio consegnato",
    finalita:
      "Conservare e utilizzare il materiale consegnato dalla candidata (foto, video, portfolio PDF, CV artistico, link social autorizzati) per la valutazione e, se autorizzato, per la pubblicazione.",
    conseguenza:
      "Facoltativo: senza questo consenso il materiale consegnato non viene utilizzato.",
    revocabile: "Sì; alla revoca il materiale viene restituito o cancellato.",
  },
  {
    lettera: "F",
    titolo: "Comunicazioni organizzative",
    finalita:
      "Inviare alla candidata comunicazioni operative sul concorso: convocazioni, date, luoghi, variazioni, esiti.",
    conseguenza:
      "Senza questo consenso l'organizzazione non può convocare la candidata.",
    revocabile: "Sì, in qualsiasi momento.",
  },
] as const;

export const CONSENSI_NOTA =
  "Ogni consenso deve riportare finalità, base giuridica o condizioni applicabili, durata, revoca ove prevista e riferimenti del titolare. Il testo definitivo va validato dal consulente privacy della direzione TBH prima della raccolta delle candidature.";

/**
 * SLIDE 10 — REGOLAMENTO, i 18 articoli.
 * I titoli sono quelli del Kit. Il corpo è la stesura operativa da validare:
 * dove il Kit non dice un numero, l'articolo dice DA DEFINIRE e non inventa.
 */
export const REGOLAMENTO: { n: number; titolo: string; testo: string[] }[] = [
  {
    n: 1,
    titolo: "Organizzatore",
    testo: [
      "Il concorso Touch Miss Cool e la sua versione online Touch Miss Cool Web sono organizzati dal gruppo Touch Business Holding (TBH), tramite le società e le attività del gruppo indicate nel registro entità TBH pubblicato sul sito.",
      "Riferimenti dell'organizzazione: WhatsApp e Telegram " +
        TBH_CONTACTS.whatsapp +
        ", telefono Italia " +
        TBH_CONTACTS.telItalia +
        ", e-mail casting@tibihacca.com. Il riferimento touchgirlacademy@gmail.com è indicato come collegamento a Touch Girl Academy e non come casella operativa per le candidature.",
      "La società titolare del trattamento dei dati e la sede legale di riferimento sono indicate nell'informativa privacy allegata ai moduli.",
    ],
  },
  {
    n: 2,
    titolo: "Finalità",
    testo: [
      "Il concorso seleziona ogni anno undici figure che ricevono un incarico di dodici mesi all'interno del gruppo TBH: un'ambassador commerciale, una madrina eventi e co-presentatrice, una figura per le produzioni Touch Production e otto Team Ambassador DM, una per ciascuna delle otto squadre seguite da DM Comunicazioni.",
      "Il concorso non è una manifestazione a premi con estrazione: la selezione avviene per merito, secondo i criteri dell'articolo 13.",
      "Tutte le partecipanti regolarmente ammesse ricevono uno spazio editoriale dedicato in Touch Influencity Magazine.",
    ],
  },
  {
    n: 3,
    titolo: "Durata",
    testo: [
      "Il calendario dell'edizione 2027 proposto dal Kit Digitale è il seguente: candidature ottobre–novembre 2026; casting e costruzione dei profili dicembre 2026 – gennaio 2027; avvio di Touch Miss Cool Web il 1 febbraio 2027; tappe live da marzo a luglio 2027; finale Web nell'agosto 2027; chiusura del voto il 31 agosto 2027 alle 23:59; finale ufficiale nel settembre 2027.",
      "Le date sono proposte e modificabili fino alla pubblicazione del regolamento definitivo. Ogni variazione viene comunicata sul sito e alle candidate iscritte.",
    ],
  },
  {
    n: 4,
    titolo: "Requisiti · 18+",
    testo: [
      "La partecipazione è riservata a persone che abbiano compiuto 18 anni alla data di invio della candidatura.",
      "La candidata dichiara il requisito nel modulo di partecipazione e lo documenta con un documento di identità in corso di validità al momento della verifica.",
      "L'organizzazione verifica il requisito prima dell'ammissione: una candidatura senza verifica positiva non viene pubblicata né ammessa alle tappe.",
    ],
  },
  {
    n: 5,
    titolo: "Iscrizione",
    testo: [
      "L'iscrizione avviene compilando la domanda di partecipazione sul sito, oppure consegnando il modulo stampato ai contatti ufficiali indicati all'articolo 1.",
      "La domanda richiede: nome e cognome, eventuale nome artistico, data di nascita, comune e provincia, telefono, e-mail, professione o studi, esperienze, disponibilità alle trasferte e ruoli di interesse.",
      "L'iscrizione si perfeziona con le tre dichiarazioni obbligatorie del modulo: maggiore età, accettazione del regolamento, lettura dell'informativa privacy.",
      "Eventuali quote o costi di iscrizione: DA DEFINIRE dalla direzione TBH. Finché non sono pubblicati, l'iscrizione non comporta alcun pagamento.",
    ],
  },
  {
    n: 6,
    titolo: "Documenti",
    testo: [
      "Per completare la candidatura l'organizzazione richiede: documento di identità in corso di validità, i sei consensi del Modulo 03 firmati e il materiale indicato nel Modulo 02.",
      "Il materiale previsto è: primo piano, figura intera, portfolio PDF, video di presentazione, CV artistico, link social autorizzati. Ogni consegna viene tracciata con data, numero di file, note e firma della candidata.",
      "La candidata dichiara di avere titolo a consegnare i materiali e le autorizzazioni necessarie per gli utilizzi indicati nella liberatoria.",
    ],
  },
  {
    n: 7,
    titolo: "Ammissione",
    testo: [
      "L'ammissione è disposta dall'organizzazione dopo la verifica dei 18 anni, il controllo dei documenti e la raccolta dei consensi, secondo il flusso di back office in otto passaggi del Kit: invio, verifica 18+, documenti, consensi, approvazione, pubblicazione, voto, finale. Ogni passaggio riporta stato, data e operatore.",
      "L'organizzazione può non ammettere una candidatura incompleta, non verificabile o non conforme al regolamento, dandone comunicazione alla candidata.",
    ],
  },
  {
    n: 8,
    titolo: "Touch Miss Cool Web",
    testo: [
      "Touch Miss Cool Web è il percorso online del concorso: ogni candidata ammessa e che abbia prestato il consenso B ha una scheda digitale pubblica con numero di gara, foto ufficiale, provincia, presentazione, interessi, esperienze, media autorizzati e pulsante di voto.",
      "Il percorso Web si apre alla data indicata all'articolo 3 e si chiude con lo stop al voto.",
      "Il percorso Web e le tappe live confluiscono nella finale ufficiale: il peso della qualificazione Web sulla classifica finale è stabilito dai criteri dell'articolo 13.",
    ],
  },
  {
    n: 9,
    titolo: "Votazione",
    testo: [
      "Il voto su Touch Miss Cool Web è verificato: ogni votante viene identificato con un meccanismo tecnico che impedisce voti multipli non autorizzati.",
      "Modalità operative del voto (frequenza consentita per votante, eventuali voti bonus, registrazione richiesta): DA DEFINIRE e da pubblicare prima dell'apertura del voto.",
      "Il conteggio valido è quello registrato dai sistemi dell'organizzazione alla chiusura del voto.",
    ],
  },
  {
    n: 10,
    titolo: "Antifrode",
    testo: [
      "L'organizzazione adotta controlli antifrode sul voto: individuazione di voti automatizzati, duplicati, provenienti da sistemi di manipolazione o acquistati.",
      "I voti riconosciuti come irregolari vengono annullati senza preavviso e non rientrano nel conteggio.",
      "La candidata che partecipi, direttamente o tramite terzi, a manipolazioni del voto viene esclusa dal concorso.",
    ],
  },
  {
    n: 11,
    titolo: "Tappe live",
    testo: [
      "Le tappe live comprendono casting, shooting, prove, semifinale e finale, nel periodo indicato all'articolo 3.",
      "Le convocazioni indicano data, ora e luogo e vengono inviate ai contatti dichiarati nella domanda di partecipazione, in forza del consenso F.",
      "La partecipazione alle tappe presuppone il consenso C sulle riprese: casting, prove ed eventi sono per natura fotografati e ripresi.",
      "Spese di viaggio, vitto e alloggio per le tappe e le trasferte: DA DEFINIRE dalla direzione TBH.",
    ],
  },
  {
    n: 12,
    titolo: "Giuria",
    testo: [
      "La giuria è nominata dall'organizzazione ed è composta da rappresentanti del gruppo TBH, delle produzioni e dei partner del concorso.",
      "Composizione nominativa della giuria dell'edizione 2027: DA DEFINIRE e da pubblicare prima della semifinale.",
      "Il giudizio della giuria è definitivo per le valutazioni di merito che le competono.",
    ],
  },
  {
    n: 13,
    titolo: "Criteri",
    testo: [
      "La classifica finale tiene conto del giudizio della giuria sulle tappe live, del risultato della qualificazione Web e dell'attitudine della candidata ai ruoli messi a concorso: rappresentanza commerciale, conduzione ed eventi, produzione audiovisiva, ambassador sportiva.",
      "Il peso numerico di ciascun criterio sul punteggio finale: DA DEFINIRE e da pubblicare prima dell'apertura del voto.",
      "L'assegnazione dell'incarico tiene conto della disponibilità dichiarata alle trasferte e dei ruoli di interesse indicati nella domanda.",
    ],
  },
  {
    n: 14,
    titolo: "Classifica",
    testo: [
      "La classifica assegna le posizioni dalla 1ª all'11ª, a cui corrispondono gli undici incarichi annuali e i relativi livelli: PLATINUM per la 1ª, DIAMOND per la 2ª, GOLD per la 3ª, SILVER dalla 4ª all'8ª, BRONZE dalla 9ª all'11ª.",
      "La 4ª classificata ha la priorità più alta fra le otto Team Ambassador DM; seguono in ordine 5ª, 6ª, 7ª, 8ª, 9ª, 10ª e 11ª.",
      "Dalla 12ª posizione in poi la candidata riceve la qualifica di Official Candidate: premio di consolazione, riconoscimento di presenza e spazio dedicato nel magazine.",
    ],
  },
  {
    n: 15,
    titolo: "Finale",
    testo: [
      "La finale ufficiale si tiene nel settembre 2027, nella data e nella sede comunicate dall'organizzazione.",
      "In finale vengono proclamate le undici vincitrici e assegnati gli incarichi; per le Team Ambassador DM viene indicata la squadra di riferimento.",
      "I risultati e l'albo d'oro dell'edizione vengono pubblicati sul sito.",
    ],
  },
  {
    n: 16,
    titolo: "Gli 11 incarichi",
    testo: [
      "Ciascuna delle undici vincitrici riceve un incarico della durata di dodici mesi, formalizzato con il modulo di accettazione premiazione / incarico.",
      "L'incarico comprende: compenso fisso DA DEFINIRE, gettone di presenza DA DEFINIRE, premio DA DEFINIRE, esclusiva DA DEFINIRE. La direzione TBH ha dichiarato che il cachet viene stabilito in base all'evento e alla tipologia di evento.",
      "Nessun importo è impegnativo per l'organizzazione né esigibile dalla vincitrice finché non è indicato per iscritto nel modulo di accettazione sottoscritto dalle parti.",
      "Il livello del pacchetto (A per PLATINUM, B per DIAMOND, C per GOLD, D per SILVER, E per BRONZE) determina competenze, priorità e privilegi, secondo la gerarchia dei piani e livelli TBH.",
    ],
  },
  {
    n: 17,
    titolo: "Accettazione",
    testo: [
      "L'incarico si perfeziona con la sottoscrizione del modulo di accettazione, che riporta la posizione in classifica su 11, l'incarico assegnato, l'eventuale squadra DM, la durata di dodici mesi e le condizioni economiche.",
      "La mancata accettazione entro il termine indicato dall'organizzazione comporta lo scorrimento della classifica alla posizione successiva.",
      "L'accettazione comporta l'impegno della vincitrice alle attività previste dal proprio livello e il rispetto del codice di comportamento del gruppo.",
    ],
  },
  {
    n: 18,
    titolo: "Privacy e immagine",
    testo: [
      "Il trattamento dei dati personali avviene secondo l'informativa consegnata con i moduli e i sei consensi separati A, B, C, D, E, F del Modulo 03.",
      "Ogni consenso indica finalità, base giuridica o condizioni applicabili, durata, modalità di revoca ove prevista e riferimenti del titolare.",
      "La revoca di un consenso ha effetto sugli utilizzi futuri; il materiale già legittimamente pubblicato segue le condizioni indicate nella liberatoria sottoscritta.",
      "Il testo definitivo dell'informativa e dei consensi è validato dal consulente privacy della direzione TBH prima dell'apertura delle candidature.",
    ],
  },
];

export const REGOLAMENTO_NOTA =
  "Indice dei 18 articoli come da Kit Digitale 2027. La stesura pubblicata qui è la versione operativa da validare dalla direzione TBH e dal consulente privacy: dove il Kit non indica un numero, l'articolo scrive DA DEFINIRE e non lo inventa.";

/** SLIDE 12 — MODULO 04, accettazione premiazione / incarico. */
export const MODULO_ACCETTAZIONE = {
  titolo: "ACCETTAZIONE PREMIAZIONE / INCARICO",
  sottotitolo: "Da utilizzare esclusivamente per le 11 vincitrici.",
  posizione: "Classifica: ______ / 11",
  scelte: [
    "1ª · Ambassador commerciale",
    "2ª · Madrina / co-presentatrice",
    "3ª · Production",
    "4ª–11ª · Team Ambassador DM",
  ],
  squadra: "Squadra DM assegnata",
  condizioni: [
    { voce: "Durata incarico", valore: "12 mesi" },
    { voce: "Compenso fisso", valore: DA_DEFINIRE },
    { voce: "Gettone presenza", valore: DA_DEFINIRE },
    { voce: "Premio", valore: DA_DEFINIRE },
    { voce: "Esclusiva", valore: DA_DEFINIRE },
  ],
} as const;

/** SLIDE 14 — flusso di back office, otto passaggi tracciabili. */
export const FLUSSO_BACKOFFICE = [
  { n: 1, titolo: "INVIO" },
  { n: 2, titolo: "VERIFICA 18+" },
  { n: 3, titolo: "DOCUMENTI" },
  { n: 4, titolo: "CONSENSI" },
  { n: 5, titolo: "APPROVAZIONE" },
  { n: 6, titolo: "PUBBLICAZIONE" },
  { n: 7, titolo: "VOTO" },
  { n: 8, titolo: "FINALE" },
] as const;

export const FLUSSO_NOTA =
  "Ogni passaggio è tracciabile: stato, data e operatore.";

/**
 * LE 15 SLIDE DEL KIT — titoli reali letti dal PDF approvato.
 * Servono come slide promozionali sul sito: si aprono a schermo pieno e si
 * scaricano dal Kit completo. Nessuna didascalia inventata.
 */
export const SLIDE_KIT = [
  { n: 1, sezione: "COPERTINA", titolo: "Touch Miss Cool & Touch Miss Cool Web · Kit digitale 2027" },
  { n: 2, sezione: "ARCHITETTURA", titolo: "Un concorso, due percorsi" },
  { n: 3, sezione: "CLASSIFICA UFFICIALE", titolo: "11 premiazioni · 11 incarichi" },
  { n: 4, sezione: "CALENDARIO", titolo: "Roadmap 2026 → 2027" },
  { n: 5, sezione: "SITO", titolo: "Pagina master · Touch Miss Cool" },
  { n: 6, sezione: "SCHEDA DIGITALE", titolo: "Profilo candidata" },
  { n: 7, sezione: "MODULO 01", titolo: "Domanda di partecipazione" },
  { n: 8, sezione: "MODULO 02", titolo: "Consegna foto · video · portfolio" },
  { n: 9, sezione: "MODULO 03", titolo: "Consensi separati" },
  { n: 10, sezione: "REGOLAMENTO", titolo: "Indice digitale dei 18 articoli" },
  { n: 11, sezione: "CLASSIFICA", titolo: "Dalla 1ª all'11ª, poi Official Candidate" },
  { n: 12, sezione: "MODULO 04", titolo: "Accettazione premiazione / incarico" },
  { n: 13, sezione: "PIANI & LIVELLI", titolo: "Competenze e privilegi" },
  { n: 14, sezione: "BACK OFFICE", titolo: "Flusso candidatura" },
  { n: 15, sezione: "CHIUSURA", titolo: "11 premiazioni · una community per tutte" },
].map((s) => ({
  ...s,
  immagine: `/miss-cool/miss-cool-2027-${String(s.n).padStart(2, "0")}.jpg`,
}));

export function premiazione(posizione: number) {
  return CLASSIFICA.find((p) => p.posizione === posizione) ?? null;
}
