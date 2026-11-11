/**
 * MODALITÀ DI PAGAMENTO E FINANZIAMENTO — fonte unica di verità.
 *
 * Regole rispettate:
 * - `sitoUfficiale` contiene SOLO domini ufficiali verificati. Dove il dominio non è
 *   confermato → `null` + stato "link-da-confermare". Nessun link inventato.
 * - Nessuna commissione, TAEG, durata rate o importo massimo dichiarato: non sono
 *   dati verificati con gli operatori → "da definire con l'operatore".
 * - `logo: null` finché non arriva il logo ufficiale: la UI mostra il monogramma.
 */

export type TipoPagamento =
  | "Carta e conto"
  | "Rateizzazione e finanziamento"
  | "Bonifico e conto"
  | "Servizio postale"
  | "Wallet e app";

export type StatoPagamento =
  /** Utilizzabile su richiesta: l'operatore TBH conferma i dati e invia le istruzioni. */
  | "attivo-su-richiesta"
  /** Il metodo esiste, ma il link/referral ufficiale TBH è da confermare con Claudio. */
  | "link-da-confermare";

export type MetodoPagamento = {
  slug: string;
  nome: string;
  tipo: TipoPagamento;
  descrizione: string;
  /** Istruzioni passo passo, come richiesto: l'utente deve capire cosa fare. */
  comeFunziona: string[];
  sitoUfficiale: string | null;
  stato: StatoPagamento;
  logo: string | null;
  nota: string | null;
};

export const STATO_LABEL: Record<StatoPagamento, string> = {
  "attivo-su-richiesta": "Attivo su richiesta",
  "link-da-confermare": "Link ufficiale da confermare",
};

/** Passi generali del flusso d'acquisto: uguale per tutti i metodi. */
export const FLUSSO_ACQUISTO = [
  {
    titolo: "1 · Scegli il prodotto o il servizio",
    testo:
      "Dal Touch Plaza Shop o da una scheda società/attività scegli ciò che ti interessa. Ogni voce riporta il prezzo esatto: nessun costo nascosto.",
  },
  {
    titolo: "2 · Invia la richiesta d'ordine",
    testo:
      "Premi il pulsante d'ordine: si apre WhatsApp con il messaggio già scritto (prodotto, codice e prezzo). Se preferisci, puoi scriverci via email.",
  },
  {
    titolo: "3 · SCEGLI MODALITÀ DI PAGAMENTO",
    testo:
      "L'operatore TBH ti presenta le modalità disponibili per quel prodotto: pagamento unico, rateizzazione o finanziamento. Scegli quella che preferisci.",
  },
  {
    titolo: "4 · Conferma e ricevuta",
    testo:
      "Ricevi il riepilogo con l'importo, la modalità scelta e i riferimenti del pagamento. Solo a quel punto il pagamento si perfeziona.",
  },
];

export const PAGAMENTI_NOTA =
  "Importi, numero di rate, eventuali interessi e requisiti dipendono dall'operatore scelto e dall'esito della sua valutazione: non sono decisi da TBH. Nessuna cifra viene indicata qui se non è confermata.";

export const METODI: MetodoPagamento[] = [
  /* ─────────────── CARTA E CONTO ─────────────── */
  {
    slug: "stripe",
    nome: "Stripe (carte di credito e debito)",
    tipo: "Carta e conto",
    descrizione:
      "Pagamento con carta direttamente sul sito. È il circuito che gestirà il checkout online del Touch Plaza Shop.",
    comeFunziona: [
      "Scegli il prodotto nel Touch Plaza Shop.",
      "Premi il pulsante di acquisto: si apre la pagina di pagamento sicura.",
      "Inserisci i dati della carta e confermi.",
      "Ricevi la ricevuta via email dall'indirizzo del negozio.",
    ],
    sitoUfficiale: "https://stripe.com/it",
    stato: "attivo-su-richiesta",
    logo: null,
    nota:
      "Il checkout online è già predisposto ma resta spento fino all'inserimento della chiave Stripe da parte della proprietà. Nel frattempo l'ordine si completa con l'operatore.",
  },
  {
    slug: "paypal",
    nome: "PayPal",
    tipo: "Carta e conto",
    descrizione:
      "Pagamento con il conto PayPal o con la carta collegata, senza comunicare i dati della carta al venditore.",
    comeFunziona: [
      "Comunica all'operatore che vuoi pagare con PayPal.",
      "Ricevi la richiesta di pagamento sull'indirizzo email che ci indichi.",
      "Accedi al tuo conto PayPal e confermi l'importo.",
      "La conferma arriva sia a te sia all'operatore.",
    ],
    sitoUfficiale: "https://www.paypal.com/it/",
    stato: "attivo-su-richiesta",
    logo: null,
    nota: null,
  },
  {
    slug: "revolut",
    nome: "Revolut",
    tipo: "Carta e conto",
    descrizione:
      "Conto e carta digitale, utile per pagamenti immediati anche dall'estero e in valuta diversa dall'euro.",
    comeFunziona: [
      "Chiedi all'operatore i riferimenti per il pagamento Revolut.",
      "Apri l'app Revolut e invii l'importo ai riferimenti ricevuti.",
      "Invii all'operatore la conferma della transazione.",
    ],
    sitoUfficiale: "https://www.revolut.com/it-it/",
    stato: "attivo-su-richiesta",
    logo: null,
    nota: "Il conto TBH da usare per l'accredito viene comunicato dall'operatore: non è pubblicato qui.",
  },
  {
    slug: "wise",
    nome: "Wise",
    tipo: "Bonifico e conto",
    descrizione:
      "Trasferimenti internazionali con cambio valuta trasparente: la soluzione consigliata per i clienti fuori dall'Italia.",
    comeFunziona: [
      "Indica all'operatore il paese e la valuta di partenza.",
      "Ricevi i riferimenti del conto su cui effettuare il trasferimento.",
      "Esegui il trasferimento dall'app o dal sito Wise.",
      "Invii la ricevuta all'operatore per la conferma dell'ordine.",
    ],
    sitoUfficiale: "https://wise.com/it/",
    stato: "attivo-su-richiesta",
    logo: null,
    nota: null,
  },
  {
    slug: "bonifico-bancario",
    nome: "Bonifico bancario (SEPA)",
    tipo: "Bonifico e conto",
    descrizione:
      "Il pagamento classico tramite banca. Consigliato per gli importi più alti e per le pratiche aziendali.",
    comeFunziona: [
      "Chiedi all'operatore l'IBAN intestato alla società del gruppo che emette la fattura.",
      "Esegui il bonifico indicando nella causale il codice dell'ordine.",
      "Invii la ricevuta del bonifico all'operatore.",
      "Alla ricezione dei fondi l'ordine viene confermato.",
    ],
    sitoUfficiale: null,
    stato: "attivo-su-richiesta",
    logo: null,
    nota: "L'IBAN non viene pubblicato online per sicurezza: lo comunica l'operatore insieme alla fattura.",
  },

  /* ─────────────── WALLET E APP ─────────────── */
  {
    slug: "satispay",
    nome: "Satispay",
    tipo: "Wallet e app",
    descrizione: "Pagamento dallo smartphone tramite app, collegato al conto bancario.",
    comeFunziona: [
      "Comunica all'operatore che vuoi pagare con Satispay.",
      "Ricevi il riferimento del negozio o il QR da inquadrare.",
      "Confermi l'importo dall'app.",
    ],
    sitoUfficiale: "https://www.satispay.com/it-it/",
    stato: "link-da-confermare",
    logo: null,
    nota: "Account esercente TBH da confermare prima di pubblicare un QR o un link diretto.",
  },
  {
    slug: "bancomat-pay",
    nome: "BANCOMAT Pay",
    tipo: "Wallet e app",
    descrizione:
      "Pagamento tramite l'app della tua banca, con il numero di telefono o il QR, senza carta fisica.",
    comeFunziona: [
      "Verifica che la tua banca abbia BANCOMAT Pay attivo.",
      "Chiedi all'operatore il riferimento per l'incasso.",
      "Autorizzi il pagamento dall'app della tua banca.",
    ],
    sitoUfficiale: "https://bancomat.it/bancomat-pay",
    stato: "link-da-confermare",
    logo: null,
    nota: "Account esercente TBH da confermare.",
  },
  {
    slug: "poste-italiane",
    nome: "Poste Italiane (bollettino, PostePay, ricarica)",
    tipo: "Servizio postale",
    descrizione:
      "Pagamento allo sportello postale, dall'app o dal sito: bollettino, bonifico postale o ricarica di carta PostePay.",
    comeFunziona: [
      "Comunica all'operatore che vuoi pagare tramite Poste Italiane.",
      "Ricevi i riferimenti esatti (tipo di pagamento e causale).",
      "Paghi allo sportello, in tabaccheria abilitata, dall'app o dal sito.",
      "Fotografi la ricevuta e la invii all'operatore.",
    ],
    sitoUfficiale: "https://www.poste.it/",
    stato: "attivo-su-richiesta",
    logo: null,
    nota: "Il conto o la carta da usare per l'accredito viene indicato dall'operatore: non è pubblicato qui.",
  },

  /* ─────────────── RATEIZZAZIONE E FINANZIAMENTO ─────────────── */
  {
    slug: "klarna",
    nome: "Klarna",
    tipo: "Rateizzazione e finanziamento",
    descrizione:
      "Compra ora e paga dopo, oppure dividi l'importo in più rate. Soggetto alla valutazione di Klarna.",
    comeFunziona: [
      "Comunica all'operatore che vuoi rateizzare con Klarna.",
      "Ricevi la richiesta di pagamento con l'opzione Klarna.",
      "Completi la richiesta con i tuoi dati sulla piattaforma Klarna.",
      "Klarna valuta la richiesta e ti comunica il piano delle rate.",
    ],
    sitoUfficiale: "https://www.klarna.com/it/",
    stato: "attivo-su-richiesta",
    logo: null,
    nota: "Numero di rate, importi e costi sono decisi da Klarna: da definire con l'operatore.",
  },
  {
    slug: "scalapay",
    nome: "Scalapay",
    tipo: "Rateizzazione e finanziamento",
    descrizione: "Dividi l'acquisto in rate senza interessi, con addebito sulla tua carta.",
    comeFunziona: [
      "Comunica all'operatore che vuoi pagare con Scalapay.",
      "Ricevi il link alla richiesta di pagamento rateale.",
      "Inserisci i dati della carta e confermi il piano proposto.",
      "Le rate successive vengono addebitate automaticamente.",
    ],
    sitoUfficiale: "https://www.scalapay.com/it",
    stato: "attivo-su-richiesta",
    logo: null,
    nota: "Numero e importo delle rate sono decisi da Scalapay: da definire con l'operatore.",
  },
  {
    slug: "heylight",
    nome: "HeyLight (gruppo Compass)",
    tipo: "Rateizzazione e finanziamento",
    descrizione:
      "Soluzioni di pagamento rateale in negozio e online, del gruppo Compass (già Pagolight). Soggette a valutazione dell'ente.",
    comeFunziona: [
      "Comunica all'operatore che vuoi rateizzare con HeyLight.",
      "Prepara un documento d'identità e i dati richiesti dall'ente.",
      "L'operatore avvia la pratica presso HeyLight.",
      "HeyLight valuta la richiesta e comunica il piano rate.",
    ],
    sitoUfficiale: "https://heylight.com/it/it",
    stato: "attivo-su-richiesta",
    logo: null,
    nota:
      "Durata, numero di rate ed eventuali interessi dipendono dall'ente e dall'importo: da definire con l'operatore. Il convenzionamento del punto vendita TBH va confermato.",
  },
  {
    slug: "jatapay",
    nome: "JataPay",
    tipo: "Rateizzazione e finanziamento",
    descrizione:
      "Piattaforma italiana per pagamenti digitali, dilazioni, abbonamenti e noleggio, pensata per le aziende.",
    comeFunziona: [
      "Comunica all'operatore che vuoi un piano dilazionato JataPay.",
      "L'operatore configura il piano sulla piattaforma.",
      "Ricevi la proposta con il piano e la confermi.",
    ],
    sitoUfficiale: "https://www.jatapay.it/",
    stato: "link-da-confermare",
    logo: null,
    nota:
      "Account TBH e link diretto/referral da confermare con la proprietà prima di pubblicare un pulsante di pagamento.",
  },
  {
    slug: "johix",
    nome: "Johix",
    tipo: "Rateizzazione e finanziamento",
    descrizione:
      "Piattaforma di finanza alternativa per noleggio, abbonamenti e dilazioni, anche verso clienti esteri.",
    comeFunziona: [
      "Comunica all'operatore l'interesse per una soluzione a noleggio o dilazione Johix.",
      "L'operatore verifica l'idoneità del prodotto o servizio.",
      "Ricevi la proposta Johix e la confermi.",
    ],
    sitoUfficiale: "https://www.johix.com/",
    stato: "link-da-confermare",
    logo: null,
    nota:
      "Account TBH e link diretto/referral da confermare con la proprietà prima di pubblicare un pulsante di pagamento.",
  },
];

export const TIPI_ORDINE: TipoPagamento[] = [
  "Carta e conto",
  "Rateizzazione e finanziamento",
  "Wallet e app",
  "Bonifico e conto",
  "Servizio postale",
];
