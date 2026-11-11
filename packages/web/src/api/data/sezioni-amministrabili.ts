/**
 * ────────────────────────────────────────────────────────────────────────────────
 * REGISTRO DELLE SEZIONI AMMINISTRABILI — ordine di Claudio del 28/09/2026.
 *
 * «Entri → scegli la sezione → Modifica → carichi foto → inserisci informazioni →
 *  anteprima → pubblichi. Vale anche per le sezioni che creeremo in futuro, così non
 *  ci ritroviamo tra qualche mese con altre 20 pagine che possono essere aggiornate
 *  soltanto intervenendo sul progetto.»
 *
 * Qui dentro c'è l'elenco di TUTTE le sezioni che l'amministratore può riempire dal
 * sito. Ogni voce dice soltanto:
 *   · come si chiama la sezione e dove si vede sul sito;
 *   · quali informazioni servono (i campi comuni + eventuali campi propri);
 *   · se prevede immagine principale, gallery, allegati;
 *   · se i suoi contenuti sono riservati (dati personali: mai pubblici).
 *
 * Il database, le route, il pannello e i componenti sono gli stessi per tutte: per
 * aprire una sezione nuova si aggiunge una voce QUI e la sezione è già amministrabile,
 * con caricamento immagini, gallery, ciclo bozza → anteprima → pubblicato → archiviato.
 * NON si aggiungono tabelle e non si scrive codice nuovo.
 *
 * REGOLA TBH MAI VIOLATA: questo file non contiene contenuti. Non un titolo finto, non
 * una data inventata, non un prezzo. Descrive solo i campi da riempire: i contenuti li
 * carica Claudio dal pannello.
 * ────────────────────────────────────────────────────────────────────────────────
 */

/** I campi testuali comuni, uguali per tutte le sezioni (punto 4 dell'ordine). */
export const CAMPI_COMUNI = [
  "sottotitolo",
  "descrizione",
  "testo",
  "data",
  "categoria",
  "contatti",
  "telefono",
  "email",
  "luogo",
  "indirizzo",
  "mapsUrl",
  "linkUrl",
  "pulsanti",
] as const;

export type CampoComune = (typeof CAMPI_COMUNI)[number];

/** Come si presenta un campo proprio della sezione nel pannello. */
export type TipoCampoExtra = "testo" | "lungo" | "numero" | "data" | "url" | "scelta" | "si-no";

export type CampoExtra = {
  /** Chiave dentro il JSON `campi` della scheda: stabile, non si cambia. */
  chiave: string;
  /** Etichetta mostrata nel pannello. */
  nome: string;
  tipo: TipoCampoExtra;
  /** Valori ammessi per il tipo "scelta". */
  opzioni?: string[];
  /** Riga di aiuto sotto il campo. */
  aiuto?: string;
};

export type SezioneAmministrabile = {
  /** Chiave stabile: è il prefisso delle schede e degli slot immagine. */
  chiave: string;
  nome: string;
  /** Raggruppamento nel pannello: TBH, INFLUENCITY, TOUCH MISS COOL, DM, … */
  gruppo: string;
  /** Una riga che spiega a cosa serve la sezione. */
  descrizione: string;
  /** Pagina del sito dove i contenuti si vedono (vuoto = non ancora collegata). */
  pagina?: string;
  /** Categoria della Libreria Media TBH in cui finiscono le immagini della sezione. */
  categoriaMedia: string;
  /** Come si chiama un singolo contenuto: «tappa», «brano», «partita», «annuncio». */
  elemento: string;
  campi: CampoComune[];
  extra?: CampoExtra[];
  /** Immagine principale / copertina. */
  copertina: boolean;
  /** Gallery di foto con riordino e scelta dell'immagine principale. */
  gallery: boolean;
  /** Allegati (PDF, documenti, CV, liberatorie). */
  allegati: boolean;
  /**
   * true = i contenuti di questa sezione contengono dati personali o amministrativi:
   * nascono riservati e il server non li restituisce senza codice di allestimento,
   * qualunque sia il loro stato. (Punti 10 e 15 dell'ordine.)
   */
  riservata?: boolean;
  /** Nota operativa mostrata in cima al pannello della sezione. */
  nota?: string;
};

const BASE: CampoComune[] = ["sottotitolo", "descrizione", "testo", "data", "categoria"];
const CONTATTO: CampoComune[] = ["contatti", "telefono", "email", "linkUrl"];
const POSTO: CampoComune[] = ["luogo", "indirizzo", "mapsUrl"];

export const SEZIONI_AMMINISTRABILI: SezioneAmministrabile[] = [
  /* ── INFLUENCITY MAGAZINE / EDICOLA ─────────────────────────────────────── */
  {
    chiave: "influencity-numeri",
    nome: "Influencity Magazine — numeri",
    gruppo: "INFLUENCITY",
    descrizione:
      "Un contenuto per ogni numero della rivista: numero, data, anno, tipo, copertina, eventuale inserto e pagine.",
    pagina: "/influencity",
    categoriaMedia: "influencity",
    elemento: "numero",
    campi: [...BASE, "linkUrl", "pulsanti"],
    extra: [
      { chiave: "numero", nome: "Numero editoriale", tipo: "numero", aiuto: "La numerazione già in uso: non ricominciare da 1." },
      { chiave: "anno", nome: "Anno", tipo: "numero" },
      {
        chiave: "tipo",
        nome: "Tipo di uscita",
        tipo: "scelta",
        opzioni: ["Standard", "BIS", "Speciale"],
      },
      { chiave: "inserto", nome: "Inserto allegato", tipo: "testo", aiuto: "Es. inserto sportivo: lascia vuoto se non c'è." },
      { chiave: "pagine", nome: "Numero di pagine", tipo: "numero" },
    ],
    copertina: true,
    gallery: true,
    allegati: true,
    nota:
      "La sola COPERTINA si può pubblicare anche se il resto del numero non è ancora allestito: copertina e pagine sono indipendenti.",
  },
  {
    chiave: "edicola-news",
    nome: "News / Edicola",
    gruppo: "INFLUENCITY",
    descrizione: "Notizie e uscite redazionali pubblicate a mano, fuori dai feed automatici.",
    pagina: "/edicola",
    categoriaMedia: "influencity",
    elemento: "notizia",
    campi: [...BASE, "linkUrl", "pulsanti"],
    extra: [{ chiave: "fonte", nome: "Fonte", tipo: "testo", aiuto: "Testata o autore: solo se verificata." }],
    copertina: true,
    gallery: true,
    allegati: false,
  },

  /* ── TOUCH MISS COOL ────────────────────────────────────────────────────── */
  {
    chiave: "miss-cool-tappe",
    nome: "Touch Miss Cool — tappe",
    gruppo: "TOUCH MISS COOL",
    descrizione: "Le tappe del concorso: data, luogo, informazioni, foto della serata.",
    pagina: "/eventi/miss-cool",
    categoriaMedia: "miss-cool",
    elemento: "tappa",
    campi: [...BASE, ...POSTO, ...CONTATTO, "pulsanti"],
    extra: [
      { chiave: "edizione", nome: "Edizione", tipo: "testo" },
      { chiave: "orario", nome: "Orario", tipo: "testo" },
      { chiave: "ingresso", nome: "Ingresso", tipo: "testo" },
    ],
    copertina: true,
    gallery: true,
    allegati: false,
  },
  {
    chiave: "miss-cool-candidate",
    nome: "Touch Miss Cool — schede candidate",
    gruppo: "TOUCH MISS COOL",
    descrizione:
      "La scheda pubblica di una candidata: foto ufficiale, portfolio, presentazione, risultati. I dati privati restano nella candidatura.",
    pagina: "/eventi/miss-cool/schede",
    categoriaMedia: "miss-cool",
    elemento: "candidata",
    campi: [...BASE, "linkUrl", "pulsanti"],
    extra: [
      { chiave: "numeroGara", nome: "Numero di gara", tipo: "numero" },
      { chiave: "percorso", nome: "Percorso", tipo: "scelta", opzioni: ["Live", "Web", "Entrambi"] },
      { chiave: "squadraDm", nome: "Squadra DM", tipo: "testo" },
      { chiave: "posizione", nome: "Posizione in classifica", tipo: "numero" },
    ],
    copertina: true,
    gallery: true,
    allegati: false,
    nota:
      "Qui va SOLO ciò che la candidata ha autorizzato a pubblicare. Recapiti, documenti e liberatorie restano nella sezione Candidature, riservata.",
  },
  {
    chiave: "miss-cool-risultati",
    nome: "Touch Miss Cool — risultati e classifiche",
    gruppo: "TOUCH MISS COOL",
    descrizione: "Esiti delle tappe, classifiche, vincitrici, premi assegnati.",
    pagina: "/eventi/miss-cool/premiazioni",
    categoriaMedia: "miss-cool",
    elemento: "risultato",
    campi: [...BASE, "luogo", "linkUrl"],
    extra: [
      { chiave: "edizione", nome: "Edizione", tipo: "testo" },
      { chiave: "tappa", nome: "Tappa di riferimento", tipo: "testo" },
      { chiave: "classifica", nome: "Classifica", tipo: "lungo", aiuto: "Una posizione per riga: 1. Nome — 2. Nome…" },
    ],
    copertina: true,
    gallery: true,
    allegati: false,
  },
  {
    chiave: "miss-cool-web",
    nome: "Touch Miss Cool Web",
    gruppo: "TOUCH MISS COOL",
    descrizione: "Il percorso web del concorso: contenuti, votazioni, contenuti multimediali online.",
    pagina: "/eventi/miss-cool",
    categoriaMedia: "miss-cool",
    elemento: "contenuto",
    campi: [...BASE, "linkUrl", "pulsanti"],
    extra: [{ chiave: "piattaforma", nome: "Piattaforma", tipo: "testo" }],
    copertina: true,
    gallery: true,
    allegati: false,
  },

  /* ── LAVORO ─────────────────────────────────────────────────────────────── */
  {
    chiave: "lavoro-annunci",
    nome: "Lavoro — posizioni aperte",
    gruppo: "LAVORO",
    descrizione: "Le posizioni ricercate: ruolo, sede, disponibilità richiesta, come candidarsi.",
    pagina: "/lavoro-casting/bacheca",
    categoriaMedia: "lavoro",
    elemento: "posizione",
    campi: [...BASE, ...POSTO, ...CONTATTO, "pulsanti"],
    extra: [
      { chiave: "ruolo", nome: "Ruolo", tipo: "testo" },
      { chiave: "disponibilita", nome: "Disponibilità richiesta", tipo: "testo" },
      { chiave: "inquadramento", nome: "Inquadramento", tipo: "testo" },
      { chiave: "scadenza", nome: "Scadenza candidature", tipo: "data" },
    ],
    copertina: true,
    gallery: false,
    allegati: true,
  },
  {
    chiave: "lavoro-candidature",
    nome: "Lavoro — candidature ricevute",
    gruppo: "LAVORO",
    descrizione:
      "Anagrafica, ruolo, disponibilità, CV, portfolio, allegati, stato della candidatura, note amministrative.",
    categoriaMedia: "lavoro",
    elemento: "candidatura",
    campi: [...BASE, ...POSTO, ...CONTATTO],
    extra: [
      { chiave: "ruolo", nome: "Ruolo per cui si candida", tipo: "testo" },
      { chiave: "disponibilita", nome: "Disponibilità", tipo: "testo" },
      { chiave: "nascita", nome: "Data di nascita", tipo: "data" },
      {
        chiave: "statoCandidatura",
        nome: "Stato della candidatura",
        tipo: "scelta",
        opzioni: ["Ricevuta", "In valutazione", "Colloquio", "Accettata", "Non idonea", "Archiviata"],
      },
      { chiave: "portfolioUrl", nome: "Portfolio", tipo: "url" },
    ],
    copertina: true,
    gallery: false,
    allegati: true,
    riservata: true,
    nota:
      "SEZIONE RISERVATA. Nomi, recapiti, CV e allegati non escono mai in pubblico: si vedono solo qui, con il codice di allestimento.",
  },
  {
    chiave: "rete-commerciale",
    nome: "Rete Commerciale",
    gruppo: "LAVORO",
    descrizione: "Agenti, procacciatori e referenti commerciali: zona, contatti, materiali.",
    pagina: "/network/rete-commerciale",
    categoriaMedia: "lavoro",
    elemento: "referente",
    campi: [...BASE, ...POSTO, ...CONTATTO, "pulsanti"],
    extra: [
      { chiave: "zona", nome: "Zona assegnata", tipo: "testo" },
      { chiave: "ruolo", nome: "Ruolo", tipo: "testo" },
      { chiave: "pubblico", nome: "Contatti pubblicabili", tipo: "si-no", aiuto: "No = i recapiti restano interni." },
    ],
    copertina: true,
    gallery: false,
    allegati: true,
    nota: "Pubblica un recapito personale solo se il referente lo ha autorizzato.",
  },

  /* ── DM COMUNICAZIONI / DM SPORT ────────────────────────────────────────── */
  {
    chiave: "dm-comunicazioni",
    nome: "DM Comunicazioni",
    gruppo: "DM",
    descrizione: "Programmi, rubriche, comunicati e contenuti della redazione DM.",
    pagina: "/dm",
    categoriaMedia: "dm",
    elemento: "contenuto",
    campi: [...BASE, ...CONTATTO, "pulsanti"],
    extra: [
      { chiave: "programma", nome: "Programma", tipo: "testo" },
      { chiave: "conduzione", nome: "Conduzione", tipo: "testo" },
      { chiave: "orario", nome: "Messa in onda", tipo: "testo", aiuto: "Solo orari confermati." },
      { chiave: "videoUrl", nome: "Video", tipo: "url" },
    ],
    copertina: true,
    gallery: true,
    allegati: false,
  },
  {
    chiave: "dm-sport-squadre",
    nome: "DM Sport — squadre seguite",
    gruppo: "DM",
    descrizione: "Le squadre seguite: stemma, categoria, campo, referenti.",
    pagina: "/sport/squadre",
    categoriaMedia: "sport",
    elemento: "squadra",
    campi: [...BASE, ...POSTO, ...CONTATTO, "pulsanti"],
    extra: [
      { chiave: "categoria", nome: "Categoria / girone", tipo: "testo" },
      { chiave: "colori", nome: "Colori sociali", tipo: "testo" },
      { chiave: "stagione", nome: "Stagione", tipo: "testo" },
    ],
    copertina: true,
    gallery: true,
    allegati: false,
    nota: "Lo stemma va caricato come LOGO: non viene mai ridimensionato né ricompresso.",
  },
  {
    chiave: "dm-sport-partite",
    nome: "DM Sport — partite e gallery",
    gruppo: "DM",
    descrizione:
      "Una scheda per partita: cover, informazioni, risultato e gallery fotografica caricata a mano.",
    pagina: "/sport/calendario",
    categoriaMedia: "sport",
    elemento: "partita",
    campi: [...BASE, ...POSTO, "linkUrl", "pulsanti"],
    extra: [
      { chiave: "squadraCasa", nome: "Squadra in casa", tipo: "testo" },
      { chiave: "squadraOspite", nome: "Squadra ospite", tipo: "testo" },
      { chiave: "risultato", nome: "Risultato", tipo: "testo" },
      { chiave: "competizione", nome: "Competizione", tipo: "testo" },
      { chiave: "orario", nome: "Orario", tipo: "testo" },
      { chiave: "videoUrl", nome: "Video della partita", tipo: "url", aiuto: "Link ufficiale DM, se già pubblicato." },
    ],
    copertina: true,
    gallery: true,
    allegati: false,
    nota:
      "Il caricamento a mano resta sempre disponibile. Quando entrerà in funzione l'acquisizione automatica dei video dalle fonti DM ufficiali, i due sistemi conviveranno: l'automatico riempirà il campo Video, foto e cover restano di chi amministra.",
  },

  /* ── MUSICA / J.C. HUGÒ / PRODUZIONI ────────────────────────────────────── */
  {
    chiave: "jc-hugo-brani",
    nome: "J.C. Hugò — brani",
    gruppo: "MUSICA",
    descrizione: "Un contenuto per brano: cover, artwork, descrizione, data, link YouTube e Suno.",
    pagina: "/musica/jc-hugo",
    categoriaMedia: "jc-hugo",
    elemento: "brano",
    campi: [...BASE, "linkUrl", "pulsanti"],
    extra: [
      { chiave: "youtube", nome: "Link YouTube", tipo: "url" },
      { chiave: "suno", nome: "Link Suno", tipo: "url" },
      { chiave: "spotify", nome: "Altro link piattaforma", tipo: "url" },
      { chiave: "durata", nome: "Durata", tipo: "testo" },
      { chiave: "genere", nome: "Genere", tipo: "testo" },
      {
        chiave: "collegatoA",
        nome: "Stessa pubblicazione di",
        tipo: "testo",
        aiuto: "Chiave della scheda madre: una pubblicazione su più piattaforme resta un solo brano.",
      },
    ],
    copertina: true,
    gallery: true,
    allegati: false,
  },
  {
    chiave: "jc-hugo-produzioni",
    nome: "J.C. Hugò — produzioni",
    gruppo: "MUSICA",
    descrizione: "Progetti, album, collaborazioni e produzioni firmate J.C. Hugò.",
    pagina: "/musica/jc-hugo",
    categoriaMedia: "jc-hugo",
    elemento: "produzione",
    campi: [...BASE, "linkUrl", "pulsanti"],
    extra: [
      { chiave: "ruolo", nome: "Ruolo nella produzione", tipo: "testo" },
      { chiave: "youtube", nome: "Link YouTube", tipo: "url" },
      { chiave: "brani", nome: "Brani inclusi", tipo: "lungo", aiuto: "Un titolo per riga." },
    ],
    copertina: true,
    gallery: true,
    allegati: false,
  },
  {
    chiave: "produzioni",
    nome: "Produzioni TBH",
    gruppo: "MUSICA",
    descrizione: "Produzioni video, spot, format e lavori realizzati dal gruppo.",
    pagina: "/tbh/produzioni",
    categoriaMedia: "produzioni",
    elemento: "produzione",
    campi: [...BASE, ...CONTATTO, "pulsanti"],
    extra: [
      { chiave: "cliente", nome: "Cliente", tipo: "testo" },
      { chiave: "tipo", nome: "Tipo di produzione", tipo: "testo" },
      { chiave: "videoUrl", nome: "Video", tipo: "url" },
    ],
    copertina: true,
    gallery: true,
    allegati: true,
  },

  /* ── EVENTI / FIERE / TERRITORIO ────────────────────────────────────────── */
  {
    chiave: "eventi",
    nome: "Eventi",
    gruppo: "TERRITORIO",
    descrizione: "Serate, presentazioni, appuntamenti: data, luogo, informazioni, foto.",
    pagina: "/edicola/eventi",
    categoriaMedia: "eventi",
    elemento: "evento",
    campi: [...BASE, ...POSTO, ...CONTATTO, "pulsanti"],
    extra: [
      { chiave: "orario", nome: "Orario", tipo: "testo" },
      { chiave: "ingresso", nome: "Ingresso", tipo: "testo" },
      { chiave: "organizzatore", nome: "Organizzatore", tipo: "testo" },
    ],
    copertina: true,
    gallery: true,
    allegati: true,
  },
  {
    chiave: "fiere",
    nome: "Fiere",
    gruppo: "TERRITORIO",
    descrizione: "Fiere e manifestazioni con presenza TBH: padiglione, stand, materiali.",
    pagina: "/eventi/fiere-internazionali",
    categoriaMedia: "eventi",
    elemento: "fiera",
    campi: [...BASE, ...POSTO, ...CONTATTO, "pulsanti"],
    extra: [
      { chiave: "padiglione", nome: "Padiglione / stand", tipo: "testo" },
      { chiave: "periodo", nome: "Periodo", tipo: "testo" },
    ],
    copertina: true,
    gallery: true,
    allegati: true,
  },
  {
    chiave: "turismo",
    nome: "Turismo",
    gruppo: "TERRITORIO",
    descrizione: "Proposte turistiche, itinerari, ospitalità: informazioni e immagini reali.",
    pagina: "/touch-travels",
    categoriaMedia: "territorio",
    elemento: "proposta",
    campi: [...BASE, ...POSTO, ...CONTATTO, "pulsanti"],
    extra: [
      { chiave: "periodo", nome: "Periodo", tipo: "testo" },
      { chiave: "prezzo", nome: "Prezzo", tipo: "testo", aiuto: "Solo se confermato dal fornitore." },
    ],
    copertina: true,
    gallery: true,
    allegati: true,
  },
  {
    chiave: "territorio",
    nome: "Territorio TBH",
    gruppo: "TERRITORIO",
    descrizione: "Luoghi, comuni, quartieri e punti di interesse della rete TBH.",
    pagina: "/territorio/spazi",
    categoriaMedia: "territorio",
    elemento: "luogo",
    campi: [...BASE, ...POSTO, ...CONTATTO, "pulsanti"],
    extra: [
      { chiave: "comune", nome: "Comune", tipo: "testo" },
      { chiave: "provincia", nome: "Provincia", tipo: "testo" },
    ],
    copertina: true,
    gallery: true,
    allegati: false,
  },
  {
    chiave: "touch-plaza",
    nome: "Touch Plaza",
    gruppo: "TERRITORIO",
    descrizione: "Spazi, vetrine e presenze fisiche di Touch Plaza.",
    pagina: "/shop",
    categoriaMedia: "tbh",
    elemento: "spazio",
    campi: [...BASE, ...POSTO, ...CONTATTO, "pulsanti"],
    copertina: true,
    gallery: true,
    allegati: true,
  },
  {
    chiave: "motorsport",
    nome: "Motorsport",
    gruppo: "TERRITORIO",
    descrizione: "Gare, piloti, team e appuntamenti motoristici seguiti dal gruppo.",
    pagina: "/sport/motorsport",
    categoriaMedia: "sport",
    elemento: "contenuto",
    campi: [...BASE, ...POSTO, ...CONTATTO, "pulsanti"],
    extra: [
      { chiave: "disciplina", nome: "Disciplina", tipo: "testo" },
      { chiave: "pilota", nome: "Pilota / team", tipo: "testo" },
      { chiave: "risultato", nome: "Risultato", tipo: "testo" },
    ],
    copertina: true,
    gallery: true,
    allegati: false,
  },

  /* ── FORMAZIONE E PERSONE ───────────────────────────────────────────────── */
  {
    chiave: "touch-academy",
    nome: "Touch Academy",
    gruppo: "ACADEMY",
    descrizione: "Corsi, percorsi formativi, docenti, calendario e materiali.",
    pagina: "/touch-academy",
    categoriaMedia: "academy",
    elemento: "corso",
    campi: [...BASE, ...POSTO, ...CONTATTO, "pulsanti"],
    extra: [
      { chiave: "docente", nome: "Docente", tipo: "testo" },
      { chiave: "durata", nome: "Durata", tipo: "testo" },
      { chiave: "posti", nome: "Posti disponibili", tipo: "numero" },
      { chiave: "quota", nome: "Quota di partecipazione", tipo: "testo", aiuto: "Solo se già deliberata." },
    ],
    copertina: true,
    gallery: true,
    allegati: true,
  },
  {
    chiave: "touch-crew",
    nome: "Touch Crew",
    gruppo: "ACADEMY",
    descrizione: "Operatori, giornalisti e collaboratori della crew: foto, ruolo, contatti pubblicabili.",
    pagina: "/media/dm/crew",
    categoriaMedia: "tbh",
    elemento: "persona",
    campi: [...BASE, ...CONTATTO, "luogo", "pulsanti"],
    extra: [
      { chiave: "ruolo", nome: "Ruolo", tipo: "testo" },
      { chiave: "reparto", nome: "Reparto", tipo: "testo" },
      { chiave: "pubblico", nome: "Contatti pubblicabili", tipo: "si-no", aiuto: "No = i recapiti restano interni." },
    ],
    copertina: true,
    gallery: false,
    allegati: false,
    nota: "Foto e recapiti di una persona si pubblicano solo con il suo consenso.",
  },

  /* ── MATERIALI ──────────────────────────────────────────────────────────── */
  {
    chiave: "download",
    nome: "Download",
    gruppo: "TBH",
    descrizione: "Materiali scaricabili: listini, cataloghi, moduli, presentazioni.",
    pagina: "/tbh-app",
    categoriaMedia: "tbh",
    elemento: "materiale",
    campi: [...BASE, "linkUrl", "pulsanti"],
    extra: [{ chiave: "versione", nome: "Versione", tipo: "testo" }],
    copertina: true,
    gallery: false,
    allegati: true,
  },
];

/** Tutte le sezioni raggruppate come compaiono nel pannello. */
export const GRUPPI_SEZIONI = Array.from(new Set(SEZIONI_AMMINISTRABILI.map((s) => s.gruppo)));

export function sezione(chiave: string) {
  return SEZIONI_AMMINISTRABILI.find((s) => s.chiave === chiave);
}

/** Gli stati del ciclo richiesto: si comincia oggi e si finisce quando il materiale arriva. */
export const STATI_SCHEDA = ["bozza", "anteprima", "pubblicato", "archiviato"] as const;
export type StatoScheda = (typeof STATI_SCHEDA)[number];

export const ETICHETTE_STATO: Record<StatoScheda, string> = {
  bozza: "BOZZA",
  anteprima: "ANTEPRIMA",
  pubblicato: "PUBBLICATO",
  archiviato: "ARCHIVIATO",
};

/** Slot del Media Manager usati da una scheda: nascono dalla sua chiave, non si inventano. */
export function slotScheda(chiave: string) {
  return {
    copertina: `${chiave}:copertina`,
    gallery: `${chiave}:gallery`,
    allegati: `${chiave}:allegati`,
  };
}
