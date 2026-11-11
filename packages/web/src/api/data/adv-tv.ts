/**
 * TBH TV & STREAMING ADV — listino reale, letto sulla slide ufficiale consegnata da
 * Claudio il 15/09/2026 (`/listini/tv-streaming-adv.jpg`) e sulla sua specifica
 * operativa dello stesso giorno.
 *
 * Regole rispettate:
 * · nessun prezzo inventato: i quattro pacchetti e le tre fasce sono quelli della slide;
 * · i prezzi della slide sono IVA INCLUSA. Qui si conserva la scomposizione
 *   netto / IVA / lordo, così fattura e checkout non dipendono dal testo mostrato;
 * · il prezzo Fidelity è un prezzo del sistema, non un parametro del browser:
 *   la verifica avviene sempre sul server (vedi `api/routes/adv.ts`);
 * · le durate oltre i 30 secondi restano produzioni/distribuzioni TBH soggette alla
 *   compatibilità della piattaforma scelta: non si dichiarano garantite.
 */

export const ADV_VERIFICATO_IL = "15/09/2026";
export const ADV_SLIDE = "/listini/tv-streaming-adv.jpg";
export const ADV_IVA = 22;

/** Scomposizione fiscale a partire dal prezzo IVA inclusa della slide. */
export type Fascia = {
  lordo: number;
  netto: number;
  iva: number;
  ivaAliquota: number;
};

export function scomponi(lordoCents: number, aliquota = ADV_IVA): Fascia {
  const netto = Math.round(lordoCents / (1 + aliquota / 100));
  return { lordo: lordoCents, netto, iva: lordoCents - netto, ivaAliquota: aliquota };
}

export type PacchettoAdv = {
  sku: string;
  slug: string;
  /** Titolo per esteso, come sulla slide. */
  titolo: string;
  claim: string;
  colore: string;
  /** Prezzi della slide, in centesimi, IVA inclusa. */
  pienoCents: number;
  promoCents: number;
  fidelityCents: number;
  /** Sconti dichiarati sulla slide. */
  scontoPromo: string;
  scontoFidelity: string;
  descrizione: string;
  incluso: string[];
  /** Etichetta del pulsante, come da specifica del 15/09/2026. */
  cta: string;
  /** Il configuratore chiede anche la durata dello spot. */
  chiedeDurata: boolean;
  /** Piattaforme indicate sulla slide (solo per il pacchetto CTV). */
  piattaforme: string[] | null;
};

export const PACCHETTI_ADV: PacchettoAdv[] = [
  {
    sku: "TBH-TVF-01",
    slug: "tbh-tv-frame",
    titolo: "TBH TV FRAME",
    claim: "Il tuo brand sempre in vista",
    colore: "#d9ff00",
    pienoCents: 300000,
    promoCents: 250000,
    fidelityCents: 210000,
    scontoPromo: "-17%",
    scontoFidelity: "-30%",
    descrizione:
      "Formato pubblicitario a cornice durante il programma, interattivo con pagina dedicata: il brand resta visibile insieme al contenuto.",
    incluso: [
      "Formato a cornice durante il programma",
      "Interattivo con pagina dedicata",
      "Ideale per brand locali e nazionali",
      "Alta memorabilità",
    ],
    cta: "Configura e acquista",
    chiedeDurata: false,
    piattaforme: null,
  },
  {
    sku: "TBH-VTV-01",
    slug: "tbh-video-tv",
    titolo: "TBH VIDEO TV",
    claim: "Il tuo spot, tutto lo schermo",
    colore: "#22d3ee",
    pienoCents: 500000,
    promoCents: 425000,
    fidelityCents: 350000,
    scontoPromo: "-15%",
    scontoFidelity: "-30%",
    descrizione:
      "Video pubblicitario fullscreen non skippabile, distribuito sulle posizioni e sulle piattaforme compatibili.",
    incluso: [
      "Fullscreen non skippabile",
      "Disponibile in pre-roll e mid-roll",
      "Fino a 3 minuti di durata",
      "Su TV, mobile, tablet e desktop",
    ],
    cta: "Scegli durata e acquista",
    chiedeDurata: true,
    piattaforme: null,
  },
  {
    sku: "TBH-TVI-01",
    slug: "tbh-tv-impact",
    titolo: "TBH TV IMPACT",
    claim: "La soluzione completa",
    colore: "#f472b6",
    pienoCents: 750000,
    promoCents: 637500,
    fidelityCents: 525000,
    scontoPromo: "-15%",
    scontoFidelity: "-30%",
    descrizione:
      "Pacchetto combinato: TV Frame + Video + Landing dedicata + Targeting + Report. La landing può contenere prodotti, servizi, fotografie, contatti e QR Code.",
    incluso: [
      "TV Frame + Video + Landing dedicata",
      "Targeting avanzato",
      "Report dettagliato",
      "Massima copertura e impatto",
    ],
    cta: "Configura Impact",
    chiedeDurata: true,
    piattaforme: null,
  },
  {
    sku: "TBH-CTV-01",
    slug: "tbh-ctv-premium",
    titolo: "TBH CTV PREMIUM",
    claim: "Oltre la TV, tutto lo streaming",
    colore: "#4ade80",
    pienoCents: 2000000,
    promoCents: 1700000,
    fidelityCents: 1400000,
    scontoPromo: "-15%",
    scontoFidelity: "-30%",
    descrizione:
      "Soluzione superiore per campagne TV, CTV e streaming, con configurazione di audience, territorio, piattaforme, creatività e reporting.",
    incluso: [
      "Presenza su più piattaforme",
      "Audience profilate",
      "Contenuti editoriali e verticali",
      "Soluzioni personalizzate",
    ],
    cta: "Configura CTV Premium",
    chiedeDurata: true,
    piattaforme: [
      "Mediaset Infinity",
      "NOW",
      "Disney+",
      "Netflix",
      "YouTube",
      "Prime Video",
      "DAZN",
      "Spotify",
      "Amazon Music",
    ],
  },
];

/** Le 5 posizioni pubblicitarie della slide. */
export const POSIZIONI_ADV = [
  {
    n: 1,
    nome: "Durante il programma (TV Frame)",
    cosa: "Formato a cornice interattiva, circa 40% dello schermo.",
  },
  { n: 2, nome: "Pre-roll (prima del contenuto)", cosa: "Massima attenzione dal primo secondo." },
  { n: 3, nome: "Mid-roll (durante il contenuto)", cosa: "Il tuo messaggio nel momento giusto." },
  { n: 4, nome: "Fullscreen (non skippabile)", cosa: "Impatto totale, il tuo spot al centro." },
  {
    n: 5,
    nome: "Landing interattiva (dopo il click)",
    cosa: "Pagina dedicata con prodotti, contatti, QR Code e altro.",
  },
];

/** Durate spot disponibili, come da slide. */
export const DURATE_ADV = [
  { secondi: 30, nome: "Spot" },
  { secondi: 60, nome: "Extended" },
  { secondi: 90, nome: "Story" },
  { secondi: 120, nome: "Story Extended" },
  { secondi: 150, nome: "Branded Content" },
  { secondi: 180, nome: "Premium Story" },
];

export const DURATE_NOTA =
  "Il formato addressable della piattaforma sorgente accetta video fino a 30 secondi: le durate superiori sono produzioni e distribuzioni TBH, soggette alla compatibilità della piattaforma scelta. Non sono una disponibilità garantita.";

/**
 * Servizi extra attivabili nel configuratore. Prezzi commerciali TBH proposti,
 * «da», IVA inclusa: restano modificabili dall'amministratore senza toccare il codice.
 */
export type AddonAdv = {
  codice: string;
  nome: string;
  daCents: number;
  cosa: string;
};

export const ADDON_ADV: AddonAdv[] = [
  {
    codice: "PROD",
    nome: "Produzione creatività",
    daCents: 39000,
    cosa: "Realizzazione dello spot o del materiale grafico da parte di TBH.",
  },
  {
    codice: "LAND",
    nome: "Landing dedicata",
    daCents: 29000,
    cosa: "Pagina dedicata con prodotti, servizi, contatti, foto e QR Code.",
  },
  {
    codice: "REPO",
    nome: "Report avanzato",
    daCents: 19000,
    cosa: "Impression, visite, CTR, VTR, device unici, frequenza, geografia e fasce orarie.",
  },
  {
    codice: "GEST",
    nome: "Gestione e ottimizzazione",
    daCents: 29000,
    cosa: "Presidio della campagna con ottimizzazione in corso d'opera.",
  },
];

/** I quattro blocchi di garanzia della slide. */
export const GARANZIE_ADV = [
  {
    titolo: "Targeting avanzato",
    voci: ["Città e provincia", "Età e genere", "Interessi e stili di vita"],
  },
  {
    titolo: "Audience reali",
    voci: ["Oltre 21 milioni di TV connesse", "Più di 10 milioni di famiglie raggiunte"],
  },
  {
    titolo: "Report dettagliato",
    voci: [
      "Impression, visite, CTR, VTR",
      "Device unici, frequenza",
      "Suddivisione geografica",
      "Fascia oraria e contenuti",
    ],
  },
  {
    titolo: "Ambiente premium",
    voci: ["Contenuti editoriali di qualità", "Ambiente sicuro e brand safe"],
  },
];

export const CASHBACK_ADV = {
  titolo: "Cashback TBH 100%",
  righe: [
    "Riservato ai clienti fidelizzati TBH.",
    "Maturazione progressiva secondo regolamento.",
    "Utilizzabile su tutti i servizi del Circuito.",
  ],
  nota: "Non è un rimborso automatico del pagamento: è un credito TBH che matura progressivamente secondo il regolamento del Circuito.",
};

/** I benefici del cliente fidelizzato, come in fondo alla slide. */
export const BENEFICI_FIDELITY = [
  "Prezzi riservati",
  "Accesso a servizi e partner esclusivi",
  "Consulenza dedicata",
  "Priorità nelle pianificazioni",
  "Supporto continuo",
];

/** Territori selezionabili nel configuratore: le sedi TBH ufficiali + copertura nazionale. */
export const TERRITORI_ADV = [
  "Nazionale Italia",
  "Emilia-Romagna",
  "Rimini e Riviera",
  "Lombardia",
  "Milano",
  "Cremona",
  "Veneto",
  "Padova",
  "Liguria",
  "Sanremo",
  "Lazio",
  "Roma",
  "Repubblica di San Marino",
  "Europa",
  "Altro territorio (lo indico nelle note)",
];

export const PUBBLICO_ADV = [
  "Tutti · 18+",
  "18-34",
  "25-54",
  "35-64",
  "Over 55",
  "Prevalenza uomini",
  "Prevalenza donne",
  "Famiglie",
  "Sport e motori",
  "Musica e intrattenimento",
  "Moda e beauty",
  "Casa e arredo",
  "Food e ristorazione",
  "Turismo e viaggi",
  "Business e professionisti",
];

export const DURATE_CAMPAGNA_ADV = [
  "1 settimana",
  "2 settimane",
  "1 mese",
  "2 mesi",
  "3 mesi",
  "6 mesi",
  "Da valutare insieme",
];

/**
 * La pratica di campagna: gli stati sono quelli della specifica del 15/09/2026.
 * Il materiale pubblicitario può essere soggetto a validazione creativa e legale
 * prima dell'attivazione, quindi «pagato» non vuol dire «in onda».
 */
export const STATI_PRATICA = [
  "in-attesa-pagamento",
  "pagato",
  "materiali-da-ricevere",
  "istruttoria",
  "validazione",
  "pianificazione",
  "attiva",
  "completata",
  "report",
  "cashback",
  "annullata",
] as const;

export type StatoPratica = (typeof STATI_PRATICA)[number];

export const ETICHETTE_STATO: Record<StatoPratica, string> = {
  "in-attesa-pagamento": "In attesa di pagamento",
  pagato: "Pagato",
  "materiali-da-ricevere": "Materiali da ricevere",
  istruttoria: "Istruttoria",
  validazione: "Validazione creativa e legale",
  pianificazione: "Pianificazione",
  attiva: "Campagna attiva",
  completata: "Completata",
  report: "Report disponibile",
  cashback: "Cashback in maturazione",
  annullata: "Annullata",
};

/** Fasce prezzo gestite dal sistema. */
export const FASCE = ["pieno", "promo", "fidelity"] as const;
export type Fasce = (typeof FASCE)[number];

export const ETICHETTE_FASCIA: Record<Fasce, string> = {
  pieno: "Prezzo pieno",
  promo: "Prezzo promo",
  fidelity: "Prezzo Fidelity TBH",
};
