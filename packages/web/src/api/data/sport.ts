/**
 * AREA SPORT — brief "PORTALE A MONITOR", punti 1 e 5.
 *
 * REGOLE RISPETTATE ALLA LETTERA:
 * · loghi: `logo` è valorizzato SOLO con file ricevuti da Claudio. Gli stemmi delle 9 società
 *   con mockup sono stati ESTRATTI dai mockup che Claudio ha inviato e che ha confermato
 *   ufficiali il 29/08/2026 ("Sono ufficiali: usali"). NESSUNO stemma è ridisegnato o inventato:
 *   dove non esiste materiale, `logo` resta null → nel front-end compare il NOME PER ESTESO
 *   (mai monogrammi, mai iniziali);
 *   18/10/2026: le 9 società con Channel usano ora i loghi ORIGINALI consegnati dall'editore e
 *   approvati (fonte unica loghi-channel.ts, file in /channel/loghi/). I vecchi /teams/*.png
 *   restano in archivio. Junior Gambettola escluso per ora: nessun logo;
 * · nessun risultato, classifica, calendario o data partita inventati: i blocchi esistono ma
 *   restano VUOTI e dichiarati ("dato ufficiale da collegare") finché non arrivano le fonti reali.
 *   Nei mockup quei numeri sono esempi grafici, esattamente come lo erano gli sconti "-20%";
 * · nessun social inventato: `social` contiene solo URL confermati da Claudio;
 * · monitor video: `url` null → il riquadro mostra "in allestimento" + WhatsApp, nessun player finto;
 * · stato commerciale degli spazi: "disponibile-da-confermare" finché Claudio non manda gli stati reali.
 */

import { logoSquadra } from "./loghi-channel";

export type StatoSpazio = "disponibile-da-confermare" | "in-trattativa" | "assegnato";

export type Monitor = {
  /** Titolo del monitor come nei mockup: PARTITA INTEGRALE / HIGHLIGHTS. */
  titolo: string;
  /** URL reale del video. null = in allestimento, nessun player finto. */
  url: string | null;
  /** Etichetta della CTA sotto il riquadro. */
  cta: string;
  /** Link all'archivio, quando esiste una fonte reale. */
  archivio: string | null;
};

export type Squadra = {
  slug: string;
  /** Nome esteso, sempre per esteso: mai sigle da sole. */
  nome: string;
  /** Nome breve usato nei blocchi monitor. */
  nomeBreve: string;
  payoff: string | null;
  /** Colore sociale: bordo, titolo, glow. Mai sfondo pieno. */
  colore: string;
  categoria: string | null;
  campo: string | null;
  citta: string | null;
  /** File ufficiale in /public/teams. null = nome per esteso. */
  logo: string | null;
  sito: string | null;
  social: { rete: "facebook" | "instagram" | "youtube" | "tiktok" | "linkedin"; url: string }[];
  monitor: Monitor[];
  /** Media partner reali che seguono la squadra (fonti già verificate). */
  media: { nome: string; url: string; nota: string }[];
  note: string[];
  /** Società del gruppo TBH (badge TBH OFFICIAL) oppure società seguita/partner. */
  gruppo: boolean;
  /** true = società di calcio di interesse del territorio, NON seguita da DM Comunicazioni.
   *  Ordine della direzione del 29/08/2026: vale solo per il Rimini Calcio. */
  territorio?: boolean;
};

const MONITOR_VUOTI: Monitor[] = [
  {
    titolo: "PARTITA INTEGRALE",
    url: null,
    cta: "Guarda partita integrale",
    archivio: null,
  },
  {
    titolo: "HIGHLIGHTS",
    url: null,
    cta: "Guarda highlights",
    archivio: null,
  },
];

const _DM_SPORTUP = {
  nome: "SportUp — DM Comunicazioni",
  url: "https://youtube.com/@danielemanuelli1981",
  nota: "Programma di Daniele Manuelli. Repliche su canale 88 (Made in Bo).",
};

const DM_RIGORE = {
  nome: "Calcio di Rigore — DM Comunicazioni",
  url: "https://youtube.com/@danielemanuelli1981",
  nota: "Dilettanti: Serie D, Eccellenza, Promozione — Marche e Romagna. Lunedì 20:45 (orario da riconfermare).",
};

export const SQUADRE: Squadra[] = [
  {
    slug: "rimini",
    nome: "Rimini Calcio",
    nomeBreve: "Rimini",
    payoff: null,
    colore: "#ff2b2b",
    categoria: null,
    campo: "Stadio Romeo Neri — Rimini",
    citta: "Rimini",
    logo: logoSquadra("rimini"),
    sito: null,
    social: [],
    monitor: MONITOR_VUOTI,
    media: [],
    note: [
      "Società di calcio di interesse del territorio, per il territorio: NON è fra le squadre seguite da DM Comunicazioni (ordine della direzione del 29/08/2026).",
      "Sito ufficiale da verificare: dopo la vicenda societaria del Rimini FC 1912 il riferimento web va riconfermato prima di pubblicarlo.",
      "Stemma preso dal mockup inviato da Claudio e confermato ufficiale: se il file non corrisponde va sostituito con il vettoriale della società.",
    ],
    gruppo: false,
    territorio: true,
  },
  {
    slug: "verucchio",
    nome: "A.S.D. Verucchio Calcio 1957",
    nomeBreve: "Verucchio",
    payoff: "Passione, identità, territorio.",
    colore: "#e0439c",
    categoria: "Prima Categoria",
    campo: "Stadio Comunale, Via Aldo Moro 363 — Villa Verucchio (RN)",
    citta: "Verucchio",
    logo: logoSquadra("verucchio"),
    sito: "https://www.asdverucchio.it/",
    social: [],
    monitor: MONITOR_VUOTI,
    media: [DM_RIGORE],
    note: [
      "Claudio Ugolini videoperatore ufficiale stagione 2026/27.",
      "Stemma ufficiale ASD Verucchio 1957 fornito da Claudio.",
    ],
    gruppo: false,
  },
  {
    slug: "victoria-1968",
    nome: "A.S.D. Victoria 1968",
    nomeBreve: "Victoria",
    payoff: null,
    colore: "#2f7bff",
    categoria: null,
    campo: "Stadio Bani — Viserba (Rimini Nord)",
    citta: "Rimini",
    logo: logoSquadra("victoria-1968"),
    sito: "https://www.asdvictoria1968.it/",
    social: [],
    monitor: MONITOR_VUOTI,
    media: [DM_RIGORE],
    note: ["Riprese e produzione video TBH. Progetto Victoria Card."],
    gruppo: false,
  },
  {
    slug: "vis-novafeltria",
    nome: "Vis Novafeltria Calcio F.C.D.",
    nomeBreve: "Vis Novafeltria",
    payoff: null,
    colore: "#12b886",
    categoria: "Eccellenza girone B Emilia-Romagna",
    campo: "Stadio Comunale Urbini e Casali — Novafeltria (RN)",
    citta: "Novafeltria",
    logo: logoSquadra("vis-novafeltria"),
    sito: null,
    social: [{ rete: "facebook", url: "https://www.facebook.com/VisNovafeltria/" }],
    monitor: MONITOR_VUOTI,
    media: [DM_RIGORE],
    note: [
      "Il vecchio dominio novafeltriacalcio.com è scaduto: il canale ufficiale è la pagina Facebook.",
    ],
    gruppo: false,
  },
  {
    slug: "pietracuta",
    nome: "U.S. Pietracuta A.S.D.",
    nomeBreve: "Pietracuta",
    payoff: null,
    colore: "#f59f00",
    categoria: "Eccellenza girone B Emilia-Romagna",
    campo: "Campo Comunale C. Bindi, Via F. Coppi 1 — Pietracuta (RN)",
    citta: "Pietracuta",
    logo: logoSquadra("pietracuta"),
    sito: null,
    social: [{ rete: "facebook", url: "https://www.facebook.com/u.s.pietracuta/" }],
    monitor: MONITOR_VUOTI,
    media: [DM_RIGORE],
    note: ["Sito ufficiale non presente: il canale ufficiale è la pagina Facebook."],
    gruppo: false,
  },
  {
    slug: "san-marino-calcio",
    nome: "A.C. San Marino Calcio",
    nomeBreve: "San Marino",
    payoff: null,
    colore: "#4dabf7",
    /* 17/10/2026: confermata da Claudio la categoria di Romagna Sport (girone 4). Era «Serie D». */
    categoria: "Eccellenza girone B Emilia-Romagna",
    campo: "Via Consiglio dei Sessanta 99 — Serravalle (RSM)",
    citta: "Serravalle",
    logo: logoSquadra("san-marino-calcio"),
    sito: "https://acsanmarinocalcio.sm/",
    social: [],
    monitor: MONITOR_VUOTI,
    media: [DM_RIGORE],
    note: [],
    gruppo: false,
  },
  {
    slug: "tropical-coriano",
    nome: "A.S.D. Tropical Coriano",
    nomeBreve: "Tropical Coriano",
    payoff: null,
    colore: "#20c997",
    categoria: "Serie D girone D",
    campo: "Via Piane 100 — Coriano (RN)",
    citta: "Coriano",
    logo: logoSquadra("tropical-coriano"),
    sito: "https://www.tropicalcoriano.it/",
    social: [],
    monitor: MONITOR_VUOTI,
    media: [DM_RIGORE],
    note: ["Settore giovanile: juniorcoriano.com."],
    gruppo: false,
  },
  {
    slug: "gabicce-gradara",
    nome: "A.S.D. Gabicce Gradara",
    nomeBreve: "Gabicce Gradara",
    payoff: null,
    colore: "#ff6b6b",
    categoria: "Marche",
    campo: "Campo Comunale G. Magi, Via Aldo Moro — Gabicce Mare (PU)",
    citta: "Gabicce Mare",
    logo: logoSquadra("gabicce-gradara"),
    sito: "https://www.gabiccegradaracalcio.net/",
    social: [],
    monitor: MONITOR_VUOTI,
    media: [DM_RIGORE],
    note: ["P.IVA 02226510416."],
    gruppo: false,
  },
  {
    slug: "bellaria-igea-marina",
    nome: "A.P.D. Bellaria Igea Marina 1956",
    nomeBreve: "Bellaria Igea Marina",
    payoff: null,
    colore: "#845ef7",
    categoria: "Promozione girone D Emilia-Romagna",
    campo: "Stadio E. Nanni, Via Rossini 5 — Bellaria Igea Marina (RN)",
    citta: "Bellaria Igea Marina",
    logo: logoSquadra("bellaria-igea-marina"),
    sito: "https://www.bellariaigeamarina1956.it/",
    social: [],
    monitor: MONITOR_VUOTI,
    media: [DM_RIGORE],
    note: [],
    gruppo: false,
  },
  {
    slug: "rfa-rimini-football-academy",
    nome: "R.F.A. Rimini Football Academy A.S.D.",
    nomeBreve: "Rimini Football Academy",
    payoff: "Unity · Strength · Passion",
    colore: "#d7ff00",
    categoria: "Settore giovanile",
    campo: null,
    citta: "Rimini",
    /* Stemma ufficiale inviato da Claudio il 02/10/2026 (scontornato, non ridisegnato).
       Il kit completo — scheda, timbro e firma, banner di gruppo — è in /tbh/societa/tbh-008. */
    logo: "/societa/rfa/stemma.png",
    sito: null,
    social: [],
    monitor: MONITOR_VUOTI,
    media: [],
    note: [
      "Società del gruppo TBH-008 — A.S.D. Giovanile Rimini (Rimini Football Academy), dal 2002.",
      "P.IVA e C.F. 04124660400 — Sede legale Rimini (RN). Presidente Claudio Ugolini.",
      "Sito ufficiale in allestimento.",
    ],
    gruppo: true,
  },
];

/**
 * Blocchi dati sportivi (risultati, classifica, calendario, prossima partita).
 * Struttura pronta, contenuto VUOTO per scelta: i numeri ufficiali arrivano dalla fonte federale.
 */
export type BloccoDati = {
  chiave:
    | "risultati"
    | "classifica"
    | "calendario"
    | "prossima"
    | "marcatori"
    | "diffidati"
    | "giocatore-settimana";
  titolo: string;
  /** Cosa serve per riempirlo: mostrato in pagina, così la sezione è onesta e non finta. */
  attesa: string;
  cta: string;
};

export const BLOCCHI_DATI: BloccoDati[] = [
  {
    chiave: "prossima",
    titolo: "Prossima partita",
    attesa: "Data, ora, avversario e campo ufficiali da ricevere dalla società o dal comunicato federale.",
    cta: "Segnala la prossima partita",
  },
  {
    chiave: "risultati",
    titolo: "Risultati ultima giornata",
    attesa: "Risultati ufficiali da collegare alla fonte federale (FIGC / LND Emilia-Romagna e Marche).",
    cta: "Invia i risultati ufficiali",
  },
  {
    chiave: "classifica",
    titolo: "Classifica",
    attesa: "Classifica ufficiale del girone da collegare alla fonte federale.",
    cta: "Invia la classifica ufficiale",
  },
  {
    chiave: "calendario",
    titolo: "Prossimo turno",
    attesa: "Calendario ufficiale del girone da collegare alla fonte federale.",
    cta: "Invia il calendario ufficiale",
  },
  {
    chiave: "marcatori",
    titolo: "Marcatori",
    attesa:
      "Elenco marcatori ufficiale da ricevere dalla società o dal referto federale: nessun nome e nessun gol vengono inventati.",
    cta: "Invia i marcatori ufficiali",
  },
  {
    chiave: "diffidati",
    titolo: "Diffidati e squalificati",
    attesa:
      "Diffide e squalifiche arrivano solo dal comunicato ufficiale del Giudice Sportivo: nessun nome viene pubblicato senza quel documento.",
    cta: "Invia il comunicato del Giudice Sportivo",
  },
  {
    chiave: "giocatore-settimana",
    titolo: "Il giocatore della settimana",
    attesa:
      "Estrazione a random tra i giocatori della rosa: si accende appena riceviamo la rosa ufficiale con nomi e numeri di maglia.",
    cta: "Invia la rosa ufficiale",
  },
];

export const SPORT_NOTA =
  "Risultati, classifiche, calendari e date delle partite compaiono solo quando arriva il dato ufficiale della società o della fonte federale: in questo portale non vengono inventati numeri. I monitor video si accendono appena riceviamo i link reali delle riprese.";

/** Spazi commerciali della pagina squadra: stato reale, mai inventato. */
export type SpazioSquadra = {
  titolo: string;
  descrizione: string;
  stato: StatoSpazio;
  /** A quale rete commerciale appartiene lo spazio: rete TBH, rete DM oppure entrambe. */
  rete: "TBH" | "DM" | "TBH + DM";
};

export const SPAZI_SQUADRA: SpazioSquadra[] = [
  {
    titolo: "Fascia partner — imprese e professionisti",
    descrizione:
      "Il tuo logo ufficiale e il nome per esteso nella fascia dei partner della squadra, con pagina interna dedicata.",
    stato: "disponibile-da-confermare",
    rete: "TBH",
  },
  {
    titolo: "Spazio sotto il monitor partita",
    descrizione: "Presenza commerciale sotto il riquadro della partita integrale e degli highlights.",
    stato: "disponibile-da-confermare",
    rete: "TBH + DM",
  },
  {
    titolo: "Spazio news di squadra",
    descrizione: "Presenza nel blocco delle ultime news della società seguita.",
    stato: "disponibile-da-confermare",
    rete: "TBH",
  },
  {
    titolo: "Spazio dentro i contenuti DM",
    descrizione:
      "Presenza nei servizi, nelle interviste e nelle riprese realizzate da DM Comunicazioni (media partner autonomo, non società del gruppo TBH).",
    stato: "disponibile-da-confermare",
    rete: "DM",
  },
];

/**
 * BLOCCO APP UFFICIALE — dichiarato, non finto: nei mockup comparivano i badge
 * App Store e Google Play, ma nessuna app è pubblicata. Nessun badge, nessun link morto.
 */
export const APP_SQUADRA = {
  titolo: "Scarica l'app ufficiale",
  stato: "in allestimento",
  testo:
    "L'app della squadra non è ancora pubblicata: nessun badge App Store o Google Play viene mostrato finché non esiste il link reale dello store.",
  cta: "Chiedi informazioni sull'app",
};

export function squadra(slug: string) {
  return SQUADRE.find((s) => s.slug === slug) ?? null;
}
