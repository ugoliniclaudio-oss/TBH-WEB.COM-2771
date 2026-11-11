/**
 * HOME «CANALE 0» — I 28 CHANNEL IN 5 BLOCCHI E 4 CAROSELLI (ordine di Claudio del 18/10/2026).
 *
 * FASE 1 = SOLO STRUTTURA, SOLO TESTO:
 *   · ordine delle file e dei Channel ALLA LETTERA, nessun doppione, nessun numero;
 *   · nessun logo, stemma, immagine generata, icona o grafica sostitutiva: i loghi si
 *     assegnano solo dopo l'approvazione di tutti i 27 Channel;
 *   · `pagina` = pagina GIÀ ESISTENTE del sito; null = «IN ALLESTIMENTO» (nessun
 *     contenuto finto);
 *   · i caroselli hanno per ora solo il TITOLO; la struttura delle schede è pronta
 *     (titolo, descrizione, immagine, link, pulsante attivo) ma resta vuota.
 *
 * FASE 2 (18/10/2026) — le 12 decisioni di Claudio, applicate qui:
 *   1 Arm Wrestling → nuova pagina /arm-wrestling (titolo + IN ALLESTIMENTO)
 *   2 Touch Cinema → scheda CINEMA esistente di /tbh/produzioni
 *   3 Touch Spot → nuova pagina /spot con la playlist reale degli spot interni
 *   4 Touch Reality Show → /media/reality-show/academy; Giovanile resta su /media/reality-show
 *   5 Touch Travels → pagina separata /touch-travels (titolo + IN ALLESTIMENTO); Hugoland su /hugoland
 *   6 Influencity → /influencity · 7 DM → /dm · 8 J.C. Hugò → /dj-hugo
 *   9 Junior Gambettola → nuova pagina squadra (titolo + IN ALLESTIMENTO, nessun video)
 *  10 video DM Rimini/Gambettola: ancora in lavorazione → nessun video finché non confermati
 *  11 frecce dei caroselli: approvate · 12 monitor TV/Radio: solo testo
 * `daDecidere` ora elenca solo i punti ANCORA APERTI (mostrati solo nell'anteprima).
 *
 * 18/10/2026 — 28° Channel «MONDO OLISTICO CHANNEL» (richiesta di Claudio): aggiunto in
 * coda alla fila F senza toccare l'ordine dei 27; pagina /channel/mondo-olistico; palinsesto
 * IN ALLESTIMENTO finché non si collega una fonte autorizzata e verificata.
 *
 * 18/10/2026 — LAYOUT UFFICIALE A 28 CHANNEL (Claudio): 5 blocchi e 4 caroselli.
 *   A 01–06 → CAROSELLO 1 · ATTIVITÀ TBH
 *   B 07–12 → (nessun carosello)
 *   C 13–18 → CAROSELLO 2
 *   D 19–24 → CAROSELLO 3
 *   E 25–28 → CAROSELLO 4 · CASTING E CONCORSI
 *   (stesso giorno, configurazione ufficiale: TOUCH PLAZA · PALINSESTO DM · TBH LAVORO, CORSI
 *   E CASTING · CERCO LAVORO IN HOTEL — vedi CAROSELLI_HOME)
 * Riordinati solo l'elenco e il campo `fila`; gli slug NON cambiano, quindi palinsesti,
 * archivi e impostazioni restano agganciati. `numero` è solo interno (mai a schermo).
 * Hugoland passa dal blocco D al blocco A; «DM» diventa «DM Comunicazioni» (nome usato in tutto il sito e sulla pagina /dm; nella tabella di Claudio è scritto «Comunicazione»).
 *
 * 18–19/10/2026 — LOGHI: Claudio ha approvato i primi 13 originali (DM, 9 squadre, Touch TV,
 * Touch Plaza, Touch R.F.A.). Stanno in loghi-channel.ts, chiave = slug di questo elenco; qui
 * non cambia nulla (né numeri né slug). Touch R.F.A. non è fra i 28: logo registrato, nessun
 * numero, nessun posto in home finché Claudio non decide. Junior Gambettola: nessun logo.
 *
 * Lo stesso elenco serve al server per i palinsesti automatici dei Channel
 * (api/lib/channel-palinsesti.ts): lo slug è stabile e non va mai cambiato.
 */

export type FilaChannel = "A" | "B" | "C" | "D" | "E";

export type CategoriaChannel =
  | "tv"
  | "radio"
  | "editoria"
  | "musica"
  | "shop"
  | "media-partner"
  | "squadra"
  | "sport"
  | "eventi"
  | "casting"
  | "fashion"
  | "lavoro"
  | "show"
  | "cinema"
  | "spot"
  | "benessere";

export type ChannelHome = {
  /** Identificativo stabile (palinsesti, pannello, statistiche). */
  slug: string;
  /** Nome base: a schermo diventa «<nome> Channel». */
  nome: string;
  /** Titolo esatto da mostrare quando non segue la regola «<nome> Channel». */
  titolo?: string;
  /** Posizione 1–28 nell'ordine ufficiale. SOLO USO INTERNO: mai mostrata a schermo. */
  numero: number;
  fila: FilaChannel;
  categoria: CategoriaChannel;
  /** Pagina interna già esistente; null = IN ALLESTIMENTO. */
  pagina: string | null;
  /** Slug della società in dm-video.ts / sport.ts, per i Channel squadra. */
  squadra?: string;
  /** DM è un media partner ESTERNO, non una società TBH. */
  mediaPartnerEsterno?: boolean;
  /** Punto aperto da far decidere a Claudio (mostrato solo nella bozza). */
  daDecidere?: string;
};

export const titoloChannel = (c: Pick<ChannelHome, "nome" | "titolo">) => c.titolo ?? `${c.nome} Channel`;

export const CHANNEL_HOME: ChannelHome[] = [
  /* ── BLOCCO A ───────────────────────────────────────────────────────────── */
  { slug: "touch-tv", nome: "Touch TV", numero: 1, fila: "A", categoria: "tv", pagina: "/tv" },
  {
    slug: "touch-influencity",
    nome: "Touch Influencity Magazine / Edicola",
    numero: 2,
    fila: "A",
    categoria: "editoria",
    pagina: "/influencity",
  },
  { slug: "touch-radio", nome: "Touch Radio", numero: 3, fila: "A", categoria: "radio", pagina: "/radio" },
  {
    slug: "touch-deejay-jc-hugo",
    nome: "Touch Deejay J.C. Hugò",
    /* 28/10/2026 (round 14) — solo il titolo mostrato, come nel banner di Claudio; nome, numero, slug e pagina invariati. */
    titolo: "Deejay Hugò Channel",
    numero: 4,
    fila: "A",
    categoria: "musica",
    pagina: "/dj-hugo",
    daDecidere: "/dj-hugo è un rinvio automatico a /musica/jc-hugo, il cui titolo resta «TOUCH MUSIC» (rubrica): pagina non modificata.",
  },
  { slug: "touch-plaza-shop", nome: "Touch Plaza Shop", numero: 5, fila: "A", categoria: "shop", pagina: "/shop" },
  { slug: "touch-hugoland", nome: "Touch Hugoland", numero: 6, fila: "A", categoria: "eventi", pagina: "/hugoland" },

  /* ── BLOCCO B ───────────────────────────────────────────────────────────── */
  {
    slug: "dm",
    nome: "DM Comunicazioni",
    numero: 7,
    fila: "B",
    categoria: "media-partner",
    pagina: "/dm",
    mediaPartnerEsterno: true,
  },
  { slug: "vis-novafeltria", nome: "Vis Novafeltria Calcio", numero: 8, fila: "B", categoria: "squadra", pagina: "/sport/squadre/vis-novafeltria", squadra: "vis-novafeltria" },
  { slug: "pietracuta", nome: "Pietracuta Calcio", numero: 9, fila: "B", categoria: "squadra", pagina: "/sport/squadre/pietracuta", squadra: "pietracuta" },
  { slug: "verucchio", nome: "Verucchio Calcio", numero: 10, fila: "B", categoria: "squadra", pagina: "/sport/squadre/verucchio", squadra: "verucchio" },
  { slug: "victoria", nome: "Victoria Calcio", numero: 11, fila: "B", categoria: "squadra", pagina: "/sport/squadre/victoria-1968", squadra: "victoria-1968" },
  { slug: "san-marino", nome: "San Marino Calcio", numero: 12, fila: "B", categoria: "squadra", pagina: "/sport/squadre/san-marino-calcio", squadra: "san-marino-calcio" },

  /* ── BLOCCO C ───────────────────────────────────────────────────────────── */
  { slug: "gabicce-gradara", nome: "Gabicce Gradara Calcio", numero: 13, fila: "C", categoria: "squadra", pagina: "/sport/squadre/gabicce-gradara", squadra: "gabicce-gradara" },
  { slug: "bellaria-igea-marina", nome: "Bellaria Igea Marina Calcio", numero: 14, fila: "C", categoria: "squadra", pagina: "/sport/squadre/bellaria-igea-marina", squadra: "bellaria-igea-marina" },
  { slug: "tropical-coriano", nome: "Tropical Coriano Calcio", numero: 15, fila: "C", categoria: "squadra", pagina: "/sport/squadre/tropical-coriano", squadra: "tropical-coriano" },
  {
    slug: "junior-gambettola",
    nome: "Junior Gambettola Calcio",
    numero: 16,
    fila: "C",
    categoria: "squadra",
    pagina: "/sport/squadre/junior-gambettola",
    squadra: "junior-gambettola",
    daDecidere: "Pagina creata (titolo + IN ALLESTIMENTO). Video DM in lavorazione: nessun video finché non confermati.",
  },
  {
    slug: "rimini-calcio",
    nome: "Rimini Calcio",
    numero: 17,
    fila: "C",
    categoria: "squadra",
    pagina: "/sport/squadre/rimini",
    squadra: "rimini",
    daDecidere: "Video DM in lavorazione: palinsesto IN ALLESTIMENTO finché non confermati.",
  },
  { slug: "touch-motorsport", nome: "Touch Motorsport", numero: 18, fila: "C", categoria: "sport", pagina: "/sport/motorsport" },

  /* ── BLOCCO D ───────────────────────────────────────────────────────────── */
  {
    slug: "touch-arm-wrestling",
    nome: "Touch Arm Wrestling",
    numero: 19,
    fila: "D",
    categoria: "sport",
    pagina: "/arm-wrestling",
    daDecidere: "Pagina creata (titolo + IN ALLESTIMENTO). Nessun contenuto Arm Wrestling ancora disponibile.",
  },
  {
    slug: "mondo-olistico",
    nome: "Mondo Olistico",
    titolo: "MONDO OLISTICO CHANNEL",
    numero: 20,
    fila: "D",
    categoria: "benessere",
    pagina: "/channel/mondo-olistico",
    daDecidere: "Nuovo Channel (28°): pagina creata, palinsesto IN ALLESTIMENTO finché non si collegano fonti autorizzate e verificate. Nessun logo.",
  },
  {
    slug: "touch-travels",
    nome: "Touch Travels",
    numero: 21,
    fila: "D",
    categoria: "eventi",
    pagina: "/touch-travels",
    daDecidere: "Pagina separata da Hugoland (IN ALLESTIMENTO). 29/10/2026: la scheda collega schede città, hospitality, fiere, circuiti, campi e tappe già presenti nel sito.",
  },
  { slug: "touch-fashion", nome: "Touch Fashion", numero: 22, fila: "D", categoria: "fashion", pagina: "/fashion" },
  {
    slug: "touch-casting",
    nome: "Touch Casting",
    numero: 23,
    fila: "D",
    categoria: "casting",
    pagina: "/casting",
    daDecidere: "Collegato ai casting pubblicati: oggi nessun casting aperto, palinsesto IN ALLESTIMENTO finché non se ne pubblica uno.",
  },
  /* 28/10/2026 (round 14) — Touch Lavoro = Touch Human Resources (banner HR): cambia solo il titolo mostrato;
     nome, numero 24, slug e pagina /lavoro-casting invariati, nessun doppione. */
  /* 29/10/2026 (round 15) — nuovo banner «Touch Lavoro Channel» (lavoratori e skyline): titolo mostrato
     «Touch Lavoro Channel» (prima «Touch Human Resources Channel»). Stesso Channel, HR resta collegamento. */
  { slug: "touch-lavoro", nome: "Touch Lavoro", titolo: "Touch Lavoro Channel", numero: 24, fila: "D", categoria: "lavoro", pagina: "/lavoro-casting" },

  /* ── BLOCCO E ───────────────────────────────────────────────────────────── */
  {
    slug: "giovanile-rimini-show",
    nome: "Giovanile Rimini Show",
    numero: 25,
    fila: "E",
    categoria: "show",
    pagina: "/media/reality-show",
  },
  {
    slug: "touch-reality-show",
    nome: "Touch Reality Show",
    // 29/10/2026 (round 15): titolo mostrato «Touch Reality Channel» (Claudio, banner TR). Slug, numero e pagina invariati.
    titolo: "Touch Reality Channel",
    numero: 26,
    fila: "E",
    categoria: "show",
    pagina: "/media/reality-show/academy",
  },
  {
    slug: "touch-cinema",
    nome: "Touch Cinema",
    numero: 27,
    fila: "E",
    categoria: "cinema",
    // 18/10/2026: programmazione provvisoria = catalogo HEDDY.video (prima: /tbh/produzioni?ambito=cinema, che resta attiva).
    pagina: "/channel/touch-cinema",
  },
  {
    slug: "touch-spot",
    nome: "Touch Spot",
    numero: 28,
    fila: "E",
    categoria: "spot",
    pagina: "/spot",
  },
];

/**
 * 28/10/2026 — Channel AGGIUNTI in home «Canale 0» DOPO il layout ufficiale dei 28.
 * Stanno FUORI da CHANNEL_HOME apposta: i 28 (numeri, file, slug, palinsesti automatici di
 * channel-palinsesti.ts) restano identici e il registro non riceve doppioni. Ogni voce qui è
 * già nel registro unico (channel-registro.ts) con lo stesso slug; in home compare in coda
 * alla sua fila. `numero` è solo interno (mai a schermo).
 *   · TOUCH TALENT & PROFESSIONALS → in coda al blocco E (casting e concorsi): ha un palinsesto
 *     proprio (api/lib/touch-talent.ts), non quello automatico dei 28.
 */
export const CHANNEL_HOME_AGGIUNTI: ChannelHome[] = [
  {
    slug: "touch-talent-professionals",
    nome: "Touch Talent & Professionals",
    numero: 29,
    fila: "E",
    categoria: "casting",
    pagina: "/channel/touch-talent-professionals",
  },
];

/* ── CAROSELLI ───────────────────────────────────────────────────────────── */

/** Scheda di un carosello: struttura pronta, contenuti in arrivo nella fase 2. */
export type SchedaCarosello = {
  titolo: string;
  descrizione: string;
  /** Immagine REALE in public/ o URL ufficiale; null finché non c'è. */
  immagine: string | null;
  link: string | null;
  /** Il pulsante si accende solo se la scheda ha un link vero. */
  pulsanteAttivo: boolean;
  etichettaPulsante?: string;
};

export type CaroselloHome = {
  slug: string;
  titolo: string;
  /** Il carosello compare subito DOPO questo blocco; null = definizione conservata ma NON mostrata in home. */
  dopoFila: FilaChannel | null;
  schede: SchedaCarosello[];
};

/**
 * Layout ufficiale del 18/10/2026: 4 caroselli, dopo i blocchi A, C, D, E (nessuno dopo B).
 * Claudio non ha dato un titolo ai caroselli 2 e 3: restano «CAROSELLO 2» / «CAROSELLO 3».
 * I tre caroselli della disposizione precedente (Plaza Shop, Corsi, Candidature) NON sono
 * cancellati: restano qui con `dopoFila: null` e si possono riassegnare in qualsiasi momento.
 */
export const CAROSELLI_HOME: CaroselloHome[] = [
  /* Titoli della «CONFIGURAZIONE UFFICIALE DEI 4 CAROSELLI» di Claudio (18/10/2026). Gli slug
     restano quelli di prima (chiavi interne e dei contatori), cambiano solo titolo e contenuti:
     le schede vive arrivano dal server (api/lib/caroselli-home.ts), qui solo la struttura. */
  { slug: "attivita-tbh", titolo: "TOUCH PLAZA", dopoFila: "A", schede: [] },
  { slug: "carosello-2", titolo: "PALINSESTO DM", dopoFila: "C", schede: [] },
  { slug: "carosello-3", titolo: "TBH LAVORO, CORSI E CASTING", dopoFila: "D", schede: [] },
  { slug: "casting-concorsi", titolo: "CERCO LAVORO IN HOTEL", dopoFila: "E", schede: [] },
  /* conservati, non visibili in home */
  { slug: "touch-plaza-shop", titolo: "TOUCH PLAZA SHOP", dopoFila: null, schede: [] },
  { slug: "corsi-formazione", titolo: "CORSI E FORMAZIONE", dopoFila: null, schede: [] },
  { slug: "candidature-lavoro", titolo: "CANDIDATURE LAVORO", dopoFila: null, schede: [] },
];

/** Caroselli effettivamente mostrati in home, nell'ordine dei blocchi. */
export const CAROSELLI_VISIBILI = CAROSELLI_HOME.filter((k) => k.dopoFila !== null);

export const FILE_HOME: FilaChannel[] = ["A", "B", "C", "D", "E"];

/** I tre monitor sotto il menu. TV e Radio leggono lo stesso palinsesto sincronizzato. */
export const MONITOR_REGIA = [
  { slug: "touch-tv", titolo: "TOUCH TV", sotto: "Televisione", pagina: "/tv" },
  { slug: "spot-interni", titolo: "SPOT PUBBLICITÀ INTERNA", sotto: "Promozioni e comunicazioni TBH", pagina: "/spot" },
  { slug: "touch-radio", titolo: "TOUCH RADIO", sotto: "Radiovisione", pagina: "/radio" },
] as const;
