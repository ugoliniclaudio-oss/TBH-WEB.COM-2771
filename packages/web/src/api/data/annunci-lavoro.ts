/**
 * ANNUNCI DELLA BACHECCA LAVORO CON CANDIDATURA ONLINE (ordine di Claudio del 04/10/2026).
 *
 * Elenco CHIUSO: il modulo online accetta solo gli annunci qui sotto. Titoli, ruoli e
 * voci richieste sono presi dal testo e dalle locandine ufficiali di Claudio, senza
 * aggiunte. Per aprire il modulo a un altro annuncio basta aggiungere una voce qui:
 * pagina, server e pannello si adeguano da soli.
 */

export type CampoExtra = "zona" | "attrezzatura" | "disponibilita" | "linkLavori";

export type AnnuncioLavoro = {
  slug: string;
  titolo: string;
  /** Riga breve sotto il titolo. */
  sottotitolo: string;
  /** Oggetto dell'avviso e-mail, lo stesso dell'annuncio. */
  oggetto: string;
  /** L'annuncio chiede l'oggetto «OGGETTO — RUOLO SCELTO»: il ruolo entra nell'oggetto dell'avviso. */
  oggettoConRuolo?: boolean;
  /** Locandina ufficiale usata come anteprima. Null = nessuna locandina ufficiale (nessuna immagine inventata). */
  locandina: string | null;
  /** Ancora dell'annuncio in bacheca. */
  ancora: string;
  /** Pagina di ritorno quando l'annuncio non sta in bacheca (es. Academy del Reality). */
  ritorno?: { url: string; etichetta: string };
  /** Ruoli tra cui scegliere. Vuoto = ruolo unico (il titolo). */
  ruoli: string[];
  /** Campi in più richiesti dall'annuncio stesso. */
  extra: CampoExtra[];
  /** Cosa chiede l'annuncio di inviare (dal testo originale). */
  daInviare: string[];
};

export const ANNUNCI_LAVORO: AnnuncioLavoro[] = [
  {
    /* 15/10/2026 — «LAVORA CON NOI · Selezioni 2026–2027» (testo e locandina di Claudio). */
    slug: "selezioni-audiovisivo-2026-2027",
    titolo: "Lavora con noi — Selezioni audiovisivo 2026–2027",
    sottotitolo: "Videomaker • Assistente alle riprese • Commerciale audiovisivo",
    oggetto: "CANDIDATURA AUDIOVISIVO TBH",
    oggettoConRuolo: true,
    locandina: "/lavoro/selezioni-audiovisivo/locandina.jpg",
    ancora: "selezioni-audiovisivo-2026-2027",
    ruoli: [
      "Videomaker / Operatore audiovisivo",
      "Assistente alle riprese / Supporto produzione",
      "Commerciale / Procacciatore produzioni audiovisive",
      "Ruolo combinato: Videomaker + Assistente + Commerciale",
    ],
    extra: ["zona", "attrezzatura", "disponibilita", "linkLavori"],
    daInviare: [
      "nome e cognome",
      "località di residenza e disponibilità agli spostamenti",
      "ruolo o ruoli di interesse",
      "esperienze, attrezzature e competenze",
      "portfolio, showreel o collegamenti a lavori precedenti, se disponibili",
      "disponibilità settimanale",
    ],
  },
  {
    slug: "casting-inviate-2026-2027",
    titolo: "Casting Inviate 2026-2027",
    sottotitolo: "Nuovi volti · fino a 14 posizioni",
    oggetto: "CASTING INVIATE 2026-2027",
    locandina: "/lavoro/casting-inviate/locandina-principale.jpg",
    ancora: "casting-inviate-2026-2027",
    ruoli: [
      "Presentatrice e collegamenti",
      "Interviste e contenuti",
      "Supporto alla produzione",
      "Contenuti web e social",
      "Organizzazione sul posto",
      "Relazione e presenza",
      "Partecipazione a produzioni musicali",
    ],
    extra: ["zona", "disponibilita"],
    daInviare: ["foto recenti", "breve presentazione", "zona di disponibilità", "eventuali esperienze"],
  },
  {
    slug: "ricerca-videomaker-2026-2027",
    titolo: "Ricerca Videomaker 2026/2027",
    sottotitolo: "Sportivo ed eventi · inserimento immediato",
    oggetto: "RICERCA VIDEOMAKER 2026/2027",
    locandina: "/lavoro/videomaker/videomaker-eventi-sportivo.jpg",
    ancora: "ricerca-videomaker-2026-2027",
    ruoli: [
      "Videomaker Sportivo ed Eventi",
      "Videomaker Calcio",
      "Videomaker Motorsport",
      "Videomaker Eventi e Musica",
      "Videomaker Turismo e Territorio",
      "Videomaker + Inviata",
      "Montatore Video e Post Produzione",
    ],
    extra: ["zona", "attrezzatura", "disponibilita", "linkLavori"],
    daInviare: [
      "nome e cognome",
      "zona di residenza/domicilio",
      "numero di telefono",
      "esperienza",
      "attrezzatura disponibile",
      "link showreel / lavori precedenti",
      "disponibilità weekend e trasferte",
    ],
  },
  {
    slug: "assistente-di-produzione",
    titolo: "Assistente di produzione",
    sottotitolo: "Una carriera stabile nel nostro team",
    oggetto: "ASSISTENTE DI PRODUZIONE",
    locandina: "/lavoro/assistente-produzione/locandina.jpg",
    ancora: "assistente-di-produzione",
    ruoli: [],
    extra: ["zona"],
    daInviare: ["CV", "breve presentazione", "zona di disponibilità", "eventuali esperienze"],
  },
  {
    /* 14/10/2026 — Claudio: le candidature dell'Academy non passano più da WhatsApp ma dal
       modulo Lavoro. Voci richieste = quelle già scritte sulla pagina Academy. */
    slug: "academy-reality-show-rimini",
    titolo: "Academy & reclutamento giocatori",
    sottotitolo: "Reality Show Rimini · colloqui conoscitivi",
    oggetto: "ACADEMY REALITY SHOW RIMINI",
    locandina: null,
    ancora: "academy-reality-show-rimini",
    ritorno: { url: "/media/reality-show/academy", etichetta: "Torna all'Academy" },
    ruoli: [],
    extra: ["zona", "disponibilita", "linkLavori"],
    daInviare: ["nome e cognome", "età", "ruolo in campo", "squadre precedenti", "disponibilità alle riprese"],
  },
];

export function trovaAnnuncioLavoro(slug: string) {
  return ANNUNCI_LAVORO.find((a) => a.slug === slug) ?? null;
}

export const STATI_CANDIDATURA_LAVORO = [
  "ricevuta",
  "da-valutare",
  "contattata",
  "colloquio",
  "selezionata",
  "non-selezionata",
] as const;

export type StatoCandidaturaLavoro = (typeof STATI_CANDIDATURA_LAVORO)[number];

/** Consensi: solo etichette di spunta. I testi legali integrali li fornisce l'editore. */
export const CONSENSI_LAVORO = [
  { k: "privacy", etichetta: "Informativa privacy", obbligatorio: true },
  { k: "dati", etichetta: "Trattamento dei dati per la selezione", obbligatorio: true },
  { k: "materiali", etichetta: "Utilizzo dei materiali inviati per la selezione", obbligatorio: true },
] as const;

export const CONSENSI_LAVORO_NOTA =
  "I testi integrali di informativa sono quelli forniti dall'editore: il sito non pubblica testi " +
  "legali propri. La spunta raccoglie il consenso alla sola selezione.";

/** Unico destinatario delle candidature, come da annunci. */
export const DESTINATARIO_CANDIDATURE = "lavoro@tibihacca.com";
