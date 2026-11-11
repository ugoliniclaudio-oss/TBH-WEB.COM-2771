/**
 * Catalogo reale TBH — dati confermati da Claudio.
 * Nessun contenuto inventato: dove il dato manca si usa `null` e la UI scrive "In allestimento".
 */

/**
 * Link di pagamento UFFICIALI di un articolo, quelli che Claudio ci ha consegnato.
 *
 * Stanno in archivio, non in localStorage: quando un articolo ha un link qui, il pulsante di
 * pagamento è pubblico per TUTTI i visitatori e lo spazio URL da incollare sparisce (non serve).
 * Dove un fornitore manca, sul prodotto resta il campo per incollare il link al volo.
 */
import { LOGHI_CHANNEL, logoSquadra } from "./loghi-channel";
import type { CampiCommerciali } from "./prezzi-tbh";
import type { InfoStripe } from "./stripe-catalogo";

export type CheckoutUfficiale = {
  revolut?: string;
  paypal?: string;
  stripe?: string;
  jatapay?: string;
  johix?: string;
  whatsapp?: string;
};

/**
 * 03/10/2026 — «REGOLE SHOP: PREZZI, PROMO, CIRCUITO TBH E CASHBACK»: ogni articolo può
 * portare IVA, promo pubblica, cumulabilità, cashback e condizioni (vedi prezzi-tbh.ts).
 * Oggi NESSUN articolo ne ha: i campi restano assenti e la UI mostra solo il listino.
 */
export type Product = CampiCommerciali & {
  slug: string;
  title: string;
  category: string;
  priceCents: number;
  blurb: string;
  image: string | null;
  installments: boolean;
  /** Pagina interna con la scheda completa, quando esiste (es. la pagina di un corso). */
  scheda?: string | null;
  /** Link di pagamento ufficiali già confermati: rendono pubblico il pulsante. */
  checkout?: CheckoutUfficiale;
  /** QR ufficiale del checkout, quando il fornitore ce l'ha consegnato. */
  qr?: string | null;
  /** 28/10/2026 — true = QR generato dal vivo dal link Stripe in archivio (quando manca `qr`). */
  qrDalVivo?: boolean;
  /** Righe di vantaggio da mostrare in scheda. Solo testi confermati. */
  vantaggi?: string[];
  /** Cosa è compreso nel prezzo, quando confermato (es. «braccialetto NFC incluso»). */
  incluso?: string | null;
  /** Condizioni dell'articolo, una per riga, quando confermate (es. dalla slide ufficiale). */
  condizioniElenco?: string[];
  /** Altre immagini della scheda (immagini Stripe e aggiuntive del sito). */
  galleria?: string[];
  /**
   * 03/10/2026 — dati della sincronizzazione Stripe → Touch Plaza, quando l'articolo è
   * collegato a un Product Stripe. Assente = articolo solo manuale.
   */
  stripe?: InfoStripe | null;
  /**
   * 15/10/2026 — PUBBLICAZIONE TOUCH PLAZA (ordine di Claudio «nuovi articoli e Stripe
   * Checkout»): stato, visibilità, negozio e fornitore del checkout scritti sul record.
   * Assenti sugli articoli storici = valgono come pubblicati e visibili (com'era prima).
   * `visible: false` o `status: "draft"` tolgono l'articolo dalla vetrina.
   */
  status?: "active/published" | "draft";
  visible?: boolean;
  shop?: "Touch Plaza";
  checkoutProvider?: "Stripe";
};

export type Company = {
  code: string;
  name: string;
  vat: string | null;
  kind: "societa" | "attivita";
  sector: string;
  logo: string | null;
  site: string | null;
};

export type Team = {
  slug: string;
  name: string;
  role: string;
  site: string | null;
  logo: string | null;
  note: string;
};

/** Contatti centrali professionali TBH — validi per tutte le società. */
export const TBH_CONTACTS = {
  whatsapp: "+39 379 208 8524",
  whatsappUrl: "https://wa.me/393792088524",
  telItalia: "+39 327 123 7328",
  telEstero: "+49 152 2212 3816",
  email: "supporto@touch-business.com",
};

export const PRODUCTS: Product[] = [
  /**
   * 30/09/2026 — primo articolo con CHECKOUT UFFICIALE IN ARCHIVIO.
   * Testo, prezzo, «braccialetto NFC incluso», i sei vantaggi e il Payment Link Stripe
   * arrivano dalla scheda e dal link consegnati da Claudio: niente riscritto, niente dedotto.
   */
  {
    slug: "tbh-fidelity-consumer",
    title: "TBH FIDELITY CONSUMER",
    category: "Servizi",
    priceCents: 7200,
    blurb:
      "TBH Fidelity Consumer è la formula di fidelizzazione del circuito Touch Business Holding. " +
      "Permette di accedere a prezzi e promozioni riservate su prodotti, servizi, corsi ed eventi TBH " +
      "e alle opportunità dedicate dei partner aderenti.",
    image: "/shop/tbh-fidelity-consumer.png",
    installments: false,
    incluso: "Braccialetto NFC incluso. Prezzo una tantum.",
    vantaggi: [
      "Sconti riservati",
      "Servizi dedicati",
      "Corsi agevolati",
      "Eventi esclusivi",
      "Promo speciali",
      "Vantaggi partner",
    ],
    checkout: { stripe: "https://buy.stripe.com/fZu00da6x2oh01d7eEfQI00" },
    qr: "/shop/tbh-fidelity-consumer-qr.png",
  },
  /**
   * 28/10/2026 — «TBH ART & ENTERTAINMENT NETWORK — OFFERTA DA URLO 122 € UNA TANTUM».
   * Testo, prezzo e Payment Link Stripe consegnati da Claudio: niente riscritto.
   * Immagine = locandina ufficiale INTERA (3 pannelli, file originale non ricompresso).
   * QR: quello stampato nella locandina (nessun QR separato consegnato).
   */
  {
    slug: "tbh-art-entertainment-network",
    title: "TBH ART & ENTERTAINMENT NETWORK",
    category: "Servizi",
    priceCents: 12200,
    blurb:
      "TBH Art & Entertainment Network: visibilità per artisti e professionisti di arte, moda e spettacolo. " +
      "Promozione multicanale TV, radio, social e magazine secondo regolamento. " +
      "Iscrizione gratuita; attivazione del pacchetto base a 122 € una tantum, senza rinnovi. " +
      "Accesso continuativo ai vantaggi inclusi. Piani Circuito TBH, canale esclusivo, produzioni, tutoraggio, " +
      "viaggi e altri servizi personalizzati sono opzionali e a pagamento. Info: TBH-WEB.com",
    image: "/shop/offerta-122/locandina-tbh-art-entertainment-network.apng",
    installments: false,
    incluso: "Prezzo una tantum, nessun rinnovo obbligatorio.",
    condizioniElenco: [
      "Iscrizione gratuita.",
      "Pacchetto promozionale base: 122 € UNA TANTUM. PAGHI UNA VOLTA E NON PAGHI PIÙ PER IL PACCHETTO BASE!",
      "Nessun rinnovo obbligatorio. Piani Circuito TBH, canali esclusivi e servizi extra esclusi. Passaggi e prestazioni secondo regolamento; nessun ingaggio garantito.",
      "A cantanti, DJ, band, attori, ballerini, modelle e modelli, fotografi, videomaker, registi, artisti, tecnici, creator, associazioni e professionisti del mondo artistico. Anche a chi è all'inizio!",
      "TBH-WEB.com · WhatsApp/Telegram: 379 208 8524 · marketing@tibihacca.com",
      "TOUCH BUSINESS HOLDING · Il tuo talento. La nostra rete. In collaborazione con Touch Influencity Magazine.",
    ],
    checkout: { stripe: "https://buy.stripe.com/dRmcMZdiJ9QJ29l8iIfQI0i" },
    qr: null,
    /* Il QR stampato nella locandina non si decodifica a schermo: qui un QR dal vivo dello STESSO link. */
    qrDalVivo: true,
  },
  /**
   * 30/09/2026 — la formula per chi ha Partita IVA, consegnata da Claudio con la sua
   * slide ufficiale, il suo Payment Link Stripe e il suo QR. È ANNUALE: quella Consumer
   * è una tantum. Le due righe non si mescolano, perché sono due prezzi e due durate.
   */
  {
    slug: "tbh-fidelity-partita-iva",
    title: "TBH FIDELITY PARTITA IVA",
    category: "Servizi",
    priceCents: 9150,
    blurb:
      "TBH Fidelity Partita IVA è la formula annuale dedicata ad aziende, professionisti e attività " +
      "economiche che entrano nel Circuito Touch Business Holding. Consente di accedere a prezzi e " +
      "condizioni riservate su prodotti e servizi TBH e, nelle promozioni abilitate, di accumulare " +
      "ulteriori vantaggi.",
    image: "/shop/tbh-fidelity-partita-iva.png",
    installments: false,
    incluso: "Quota annuale, senza vincolo di rinnovo.",
    vantaggi: [
      "Prezzi riservati",
      "Promozioni esclusive",
      "Servizi dedicati",
      "Eventi e network",
      "Visibilità e opportunità",
      "Accumulo vantaggi",
    ],
    checkout: { stripe: "https://buy.stripe.com/dRm6oB5Qh6Ex3dpgPefQI01" },
    qr: "/shop/tbh-fidelity-partita-iva-qr.png",
  },
  /**
   * 03/10/2026 — PRIMO ARTICOLO DELLA SINCRONIZZAZIONE STRIPE → TOUCH PLAZA.
   * Titolo, sottotitolo, prezzo (72,00 € IVA 22% inclusa: imponibile 59,02 + IVA 12,98),
   * i quattro riquadri e le cinque condizioni sono quelli della slide ufficiale di Claudio
   * (public/shop/visita-medica-marshall-motorsport.jpg). Payment Link consegnato da Claudio.
   * Il QR della slide NON si legge con un lettore: non viene pubblicato come QR di pagamento.
   * 04/10/2026: 72,00 € confermato dalla pagina pubblica del Payment Link Stripe
   * («Visita Medica Sportiva non Agonistica»).
   * Alla prima sincronizzazione con la chiave Stripe la scheda si aggancia da sola al Product
   * che contiene questo Payment Link, e il prezzo viene confermato da Stripe.
   */
  {
    slug: "visita-medica-marshall-motorsport",
    title: "VISITA MEDICA — MARSHALL MOTORSPORT",
    category: "Formazione",
    priceCents: 7200,
    ivaPercentuale: 22,
    prezzoIvaInclusa: true,
    blurb: "Visita medica prevista per il percorso Marshall Auto e/o Moto. Visita Medica Sportiva non Agonistica.",
    image: "/shop/visita-medica-marshall-motorsport.jpg",
    installments: false,
    vantaggi: [
      "Visita medica dedicata",
      "Rilascio certificazione (ove prevista)",
      "Idoneità",
      "Prenotazione in base alla disponibilità",
    ],
    condizioniElenco: [
      "Partecipazione soggetta a requisiti.",
      "Idoneità subordinata all'esito della visita.",
      "La visita è parte del percorso Marshall Motorsport Auto e/o Moto.",
      "Date e sedi comunicate dopo l'acquisto.",
      "Operatività secondo regole organizzatori/enti.",
    ],
    checkout: { stripe: "https://buy.stripe.com/4gM8wJ6Ul4wpg0b42sfQI04" },
    qr: null,
  },
  /**
   * 03/10/2026 — CORSO MARSHALL AUTO, dal poster ufficiale di Claudio
   * (public/shop/corso-marshall-auto.jpg). Prezzo totale 219,60 € IVA inclusa:
   * Auto Club 60 + Visita medica 60 + Corso Auto 60 = imponibile 180,00 + IVA 22% 39,60.
   * Payment Link consegnato da Claudio. QR del poster non leggibile: non pubblicato.
   * Sedi e date: «comunicate dopo l'acquisto» (nessuna sede inventata).
   */
  {
    slug: "corso-marshall-auto",
    title: "CORSO MARSHALL AUTO — PERCORSO FORMATIVO COMPLETO",
    category: "Formazione",
    priceCents: 21960,
    ivaPercentuale: 22,
    prezzoIvaInclusa: true,
    blurb:
      "Percorso formativo completo Marshall Auto: quota Auto Club, visita medica e corso Marshall Auto con teoria e pratica.",
    image: "/shop/corso-marshall-auto.jpg",
    installments: false,
    incluso:
      "Compreso: Quota Auto Club 60 € + Visita medica 60 € + Corso Marshall Auto 60 € = imponibile 180,00 € + IVA 22% 39,60 €.",
    vantaggi: [
      "Quota Auto Club — iscrizione e tesseramento",
      "Visita medica — valutazione idoneità",
      "Corso Marshall Auto — teoria e pratica",
      "Procedure di percorso — segnalazioni, bandiere, comunicazioni",
      "Gestione situazioni di emergenza",
      "Organizzazione evento — operatività in circuito",
    ],
    condizioniElenco: [
      "Partecipazione soggetta a requisiti.",
      "Idoneità subordinata all'esito della visita medica.",
      "Date e sedi comunicate dopo l'acquisto.",
      "Operatività secondo regole organizzatori/enti.",
    ],
    checkout: { stripe: "https://buy.stripe.com/3cI5kxguV9QJ4ht6aAfQI05" },
    qr: null,
  },
  /**
   * 04/10/2026 — CORSO MARSHALL MOTO, dal poster ufficiale di Claudio
   * (public/shop/corso-marshall-moto.jpg). Il poster non riporta il prezzo: 219,60 € letto
   * dalla pagina pubblica del Payment Link Stripe consegnato da Claudio (nome e descrizione
   * sono quelli scritti su Stripe). QR ufficiale consegnato a parte e verificato con un
   * lettore: apre esattamente questo Payment Link. Scomposizione IVA non indicata né sul
   * poster né su Stripe per il Moto: non viene mostrata.
   */
  {
    slug: "corso-marshall-moto",
    title: "CORSO MARSHALL MOTO — PERCORSO FORMATIVO COMPLETO",
    category: "Formazione",
    priceCents: 21960,
    blurb:
      "Percorso dedicato alla formazione Marshall nel settore motociclistico. Comprende quota Moto Club, visita medica e corso Marshall Moto, con formazione su procedure di percorso, segnalazioni, bandiere, comunicazioni operative, sicurezza e gestione delle situazioni di emergenza.",
    image: "/shop/corso-marshall-moto.jpg",
    installments: false,
    vantaggi: [
      "Quota Moto Club",
      "Visita medica",
      "Corso Marshall Moto",
      "Procedure di percorso, segnalazioni e bandiere",
      "Comunicazioni operative e sicurezza",
      "Gestione delle situazioni di emergenza",
    ],
    condizioniElenco: ["Partecipazione soggetta ai requisiti previsti e all'idoneità medica."],
    checkout: { stripe: "https://buy.stripe.com/7sY14h2E5bYRg0bdD2fQI06" },
    qr: "/shop/qr-corso-marshall-moto.png",
  },
  /**
   * 04/10/2026 — CORSO MARSHALL AUTO + MOTO, dal poster ufficiale di Claudio
   * (public/shop/corso-marshall-auto-moto.jpg). Il poster non riporta il prezzo: 366,00 €
   * letto dalla pagina pubblica del Payment Link Stripe consegnato da Claudio (descrizione
   * = quella scritta su Stripe). QR ufficiale verificato con un lettore: apre esattamente
   * questo Payment Link. Scomposizione IVA non indicata: non viene mostrata.
   */
  {
    slug: "corso-marshall-auto-moto",
    title: "CORSO MARSHALL AUTO + MOTO — PERCORSO COMPLETO",
    category: "Formazione",
    priceCents: 36600,
    blurb:
      "Percorso completo dedicato alla formazione Marshall nei settori automobilistico e motociclistico. Comprende quota Auto Club, quota Moto Club, visita medica, corso Marshall Auto e corso Marshall Moto. La formazione affronta procedure di percorso, segnalazioni e bandiere, comunicazioni operative, sicurezza, gestione delle emergenze e operatività durante gli eventi motorsport.",
    image: "/shop/corso-marshall-auto-moto.jpg",
    installments: false,
    vantaggi: [
      "Quota Auto Club",
      "Quota Moto Club",
      "Visita medica",
      "Corso Marshall Auto",
      "Corso Marshall Moto",
      "Procedure di percorso, segnalazioni e bandiere",
      "Comunicazioni operative e sicurezza",
      "Gestione delle emergenze e operatività negli eventi motorsport",
    ],
    condizioniElenco: ["Partecipazione subordinata ai requisiti previsti e all'idoneità medica."],
    checkout: { stripe: "https://buy.stripe.com/aFaaER1A1e6ZdS3dD2fQI07" },
    qr: "/shop/qr-corso-marshall-auto-moto.png",
  },
  /* ── 15/10/2026 — 9 NUOVI ARTICOLI CON STRIPE CHECKOUT ─────────────────────────
     Ordine di Claudio «AGGIORNAMENTO TOUCH PLAZA — NUOVI ARTICOLI E STRIPE CHECKOUT».
     · Un articolo = una scheda = il SUO Payment Link (nessun link condiviso, nessun
       checkout generico). Titolo e prezzo di listino sono quelli dell'ordine.
     · Descrizione = testo scritto da Claudio sul Product Stripe (letto dalla pagina
       pubblica del Payment Link il 15/10/2026), senza la frase del prezzo: il prezzo
       si legge nel suo riquadro, così non si contraddice (la Discovery Box su Stripe
       scrive «€16,00» nel testo ma incassa 32,00 €: segnalato a Claudio).
     · Prezzo memorizzato = PREZZO PIENO DI LISTINO. Nessuna promo attiva: `promo` assente.
     · Immagine = composta SOLO da logo TBH originale + sigillo Touch Plaza originale +
       QR dello stesso Payment Link (public/shop/touch-plaza-9/, < 2 MB ciascuna).
     · Verifica 15/10/2026: i 9 link aprono la pagina Stripe «Paga Touch Business Holding»
       con l'importo in euro uguale al listino. */
  {
    slug: "tbh-sport-essential",
    title: "TBH SPORT — ESSENTIAL",
    category: "SERVIZI / SPORT",
    priceCents: 240000,
    prezzoIvaInclusa: false,
    notaPrezzo: "+ IVA / anno",
    blurb:
      "La soluzione digitale di ingresso TBH SPORT per società, associazioni e club. Comprende sito web professionale personalizzato, gestione di squadre, atleti e staff, calendario partite e risultati, pubblicazione di news, foto ed eventi, spazi sponsor, presenza nel Circuito TBH e assistenza tecnica.",
    image: "/shop/touch-plaza-9/tbh-sport-essential.jpg",
    installments: false,
    incluso: "TBH ESSENTIAL — IL TUO CLUB ONLINE. Quota annuale.",
    condizioniElenco: ["Promo e vantaggi Circuito TBH soggetti alle condizioni attive."],
    checkout: { stripe: "https://buy.stripe.com/7sY6oB5Qhe6Z3dp56wfQI09" },
    qr: "/shop/touch-plaza-9/tbh-sport-essential-qr.png",
    status: "active/published",
    visible: true,
    shop: "Touch Plaza",
    checkoutProvider: "Stripe",
  },
  {
    slug: "tbh-sport-connect",
    title: "TBH SPORT — CONNECT",
    category: "SERVIZI / SPORT",
    priceCents: 350000,
    prezzoIvaInclusa: false,
    notaPrezzo: "+ IVA / anno",
    blurb:
      "Porta il club oltre il semplice sito. Comprende TBH ESSENTIAL e aggiunge strumenti dedicati a iscrizioni, pagamenti, comunicazione, community, contenuti, sponsor e fidelizzazione. Una soluzione pensata per trasformare la presenza digitale della società in uno strumento operativo e commerciale.",
    image: "/shop/touch-plaza-9/tbh-sport-connect.jpg",
    installments: false,
    incluso: "TBH CONNECT — COMUNICAZIONE & COMMUNITY. Quota annuale.",
    condizioniElenco: ["Promo e vantaggi Circuito TBH soggetti alle condizioni attive."],
    checkout: { stripe: "https://buy.stripe.com/eVqfZbfqR6Ex01d7eEfQI0a" },
    qr: "/shop/touch-plaza-9/tbh-sport-connect-qr.png",
    status: "active/published",
    visible: true,
    shop: "Touch Plaza",
    checkoutProvider: "Stripe",
  },
  {
    slug: "tbh-sport-media-pro",
    title: "TBH SPORT — MEDIA PRO",
    category: "SERVIZI / SPORT",
    priceCents: 670000,
    prezzoIvaInclusa: false,
    notaPrezzo: "+ IVA / anno",
    blurb:
      "Comprende i servizi dei livelli precedenti e amplia il progetto con produzione e comunicazione audiovisiva: contenuti video, highlights, interviste, attività media e campagne avanzate. Una soluzione dedicata ai club che vogliono aumentare visibilità, valore per gli sponsor e qualità della propria comunicazione.",
    image: "/shop/touch-plaza-9/tbh-sport-media-pro.jpg",
    installments: false,
    incluso: "TBH MEDIA PRO — IL CLUB DIVENTA MEDIA. Quota annuale.",
    condizioniElenco: ["Promo e vantaggi Circuito TBH soggetti alle condizioni attive."],
    checkout: { stripe: "https://buy.stripe.com/bJeeV70vXe6Z7tF0QgfQI0b" },
    qr: "/shop/touch-plaza-9/tbh-sport-media-pro-qr.png",
    status: "active/published",
    visible: true,
    shop: "Touch Plaza",
    checkoutProvider: "Stripe",
  },
  {
    slug: "tbh-sport-arena",
    title: "TBH SPORT — ARENA",
    category: "SERVIZI / SPORT",
    priceCents: 915000,
    prezzoIvaInclusa: false,
    notaPrezzo: "+ IVA / anno",
    blurb:
      "Il livello superiore TBH SPORT. Integra i servizi digitali, community e media dei piani precedenti con un progetto più ampio dedicato a comunicazione, produzioni, attività commerciali, eventi, hospitality e valorizzazione del club e dei suoi partner. Pensato per società che vogliono costruire un ecosistema completo.",
    image: "/shop/touch-plaza-9/tbh-sport-arena.jpg",
    installments: false,
    incluso: "TBH ARENA — L’ESPERIENZA COMPLETA. Quota annuale.",
    condizioniElenco: ["Promo e vantaggi TBH soggetti alle condizioni attive."],
    checkout: { stripe: "https://buy.stripe.com/8x25kxfqR3sldS31UkfQI0c" },
    qr: "/shop/touch-plaza-9/tbh-sport-arena-qr.png",
    status: "active/published",
    visible: true,
    shop: "Touch Plaza",
    checkoutProvider: "Stripe",
  },
  {
    slug: "now-gingerblast-500ml",
    title: "NOW GINGERBLAST — 500 ML",
    category: "PRODOTTI / FOOD & BEVERAGE / NOW",
    priceCents: 800,
    blurb:
      "Scopri Gingerblast, una delle varianti NOW – Not Ordinary Water disponibili attraverso il Circuito TBH. Acquista la bottiglia singola da 500 ml oppure scopri successivamente i formati multipli disponibili.",
    image: "/shop/touch-plaza-9/now-gingerblast-500ml.jpg",
    installments: false,
    incluso: "Bottiglia singola da 500 ml.",
    condizioniElenco: [
      "Possibili promo pubbliche.",
      "Gli aderenti al Circuito TBH possono richiedere codici, condizioni dedicate e, quando previsto, cashback.",
    ],
    checkout: { stripe: "https://buy.stripe.com/6oUaER6Ulfb315hcyYfQI0d" },
    qr: "/shop/touch-plaza-9/now-gingerblast-500ml-qr.png",
    status: "active/published",
    visible: true,
    shop: "Touch Plaza",
    checkoutProvider: "Stripe",
  },
  {
    slug: "now-polarberry-500ml",
    title: "NOW POLARBERRY — 500 ML",
    category: "PRODOTTI / FOOD & BEVERAGE / NOW",
    priceCents: 800,
    blurb:
      "Scopri Polarberry, variante NOW – Not Ordinary Water disponibile attraverso il Circuito TBH. Acquista la bottiglia singola da 500 ml oppure scegli successivamente i formati multipli disponibili.",
    image: "/shop/touch-plaza-9/now-polarberry-500ml.jpg",
    installments: false,
    incluso: "Bottiglia singola da 500 ml.",
    condizioniElenco: [
      "Possibili promo pubbliche.",
      "Gli aderenti al Circuito TBH possono richiedere codici, condizioni dedicate e, quando previsto, cashback.",
    ],
    checkout: { stripe: "https://buy.stripe.com/7sYeV74Md5At5lx56wfQI0e" },
    qr: "/shop/touch-plaza-9/now-polarberry-500ml-qr.png",
    status: "active/published",
    visible: true,
    shop: "Touch Plaza",
    checkoutProvider: "Stripe",
  },
  {
    slug: "now-tropical-500ml",
    title: "NOW TROPICAL — 500 ML",
    category: "PRODOTTI / FOOD & BEVERAGE / NOW",
    priceCents: 800,
    blurb:
      "Scopri Tropical, variante NOW – Not Ordinary Water disponibile attraverso il Circuito TBH. Acquista la bottiglia singola da 500 ml oppure scegli successivamente i formati multipli disponibili.",
    image: "/shop/touch-plaza-9/now-tropical-500ml.jpg",
    installments: false,
    incluso: "Bottiglia singola da 500 ml.",
    condizioniElenco: [
      "Possibili promo pubbliche.",
      "Gli aderenti al Circuito TBH possono richiedere codici, condizioni dedicate e, quando previsto, cashback.",
    ],
    checkout: { stripe: "https://buy.stripe.com/28E14h4Md3slbJV7eEfQI0f" },
    qr: "/shop/touch-plaza-9/now-tropical-500ml-qr.png",
    status: "active/published",
    visible: true,
    shop: "Touch Plaza",
    checkoutProvider: "Stripe",
  },
  {
    slug: "now-lime-peppermint-500ml",
    title: "NOW LIME & PEPPERMINT — 500 ML",
    category: "PRODOTTI / FOOD & BEVERAGE / NOW",
    priceCents: 800,
    blurb:
      "Scopri Lime & Peppermint, variante NOW – Not Ordinary Water che combina le note fresche del lime con quelle della peppermint. Disponibile attraverso il Circuito TBH in bottiglia singola da 500 ml.",
    image: "/shop/touch-plaza-9/now-lime-peppermint-500ml.jpg",
    installments: false,
    incluso: "Bottiglia singola da 500 ml.",
    condizioniElenco: [
      "Possibili promo pubbliche.",
      "Gli aderenti al Circuito TBH possono richiedere codici, condizioni dedicate e, quando previsto, cashback.",
    ],
    checkout: { stripe: "https://buy.stripe.com/14A7sFfqR3slg0b7eEfQI0g" },
    qr: "/shop/touch-plaza-9/now-lime-peppermint-500ml-qr.png",
    status: "active/published",
    visible: true,
    shop: "Touch Plaza",
    checkoutProvider: "Stripe",
  },
  /** Articolo AUTONOMO, non variante di una bottiglia (ordine del 15/10/2026). */
  {
    slug: "now-discovery-box",
    title: "NOW DISCOVERY BOX — MULTIGUSTO",
    category: "PRODOTTI / FOOD & BEVERAGE / NOW",
    priceCents: 3200,
    blurb:
      "Scopri NOW – Not Ordinary Water con una selezione di 4 bottiglie assortite. La Discovery Box permette di provare più gusti NOW in un unico acquisto prima di scegliere le proprie varianti preferite.",
    image: "/shop/touch-plaza-9/now-discovery-box.jpg",
    installments: false,
    incluso: "Contenuto: 4 bottiglie assortite.",
    condizioniElenco: [
      "Possibili promo pubbliche.",
      "Gli aderenti al Circuito TBH possono richiedere condizioni dedicate e, quando previsto, cashback.",
    ],
    checkout: { stripe: "https://buy.stripe.com/4gMeV7fqR9QJ5lx9mMfQI0h" },
    qr: "/shop/touch-plaza-9/now-discovery-box-qr.png",
    status: "active/published",
    visible: true,
    shop: "Touch Plaza",
    checkoutProvider: "Stripe",
  },
  {
    slug: "accredito-partner-shop",
    title: "ACCREDITO PARTNER SHOP",
    category: "Servizi",
    priceCents: 61000,
    blurb: "Accredito come partner del Touch Plaza Shop: vetrina prodotti, listino e rete commerciale TBH.",
    image: null,
    installments: true,
  },
  {
    slug: "all-you-can-touch-fidelity",
    title: "ALL YOU CAN TOUCH FIDELITY",
    category: "Servizi",
    priceCents: 91500,
    blurb: "Programma fidelity completo: accesso ai servizi del gruppo e cashback Touch Pay.",
    image: null,
    installments: true,
  },
  {
    slug: "kit-aggregazione-business",
    title: "KIT AGGREGAZIONE BUSINESS",
    category: "Servizi",
    priceCents: 152500,
    blurb: "Combo: Accredito Partner Shop + All You Can Touch Fidelity in un unico kit.",
    image: null,
    installments: true,
  },
  {
    slug: "corso-formazione-completo",
    title: "CORSO DI FORMAZIONE COMPLETO",
    category: "Formazione",
    priceCents: 61000,
    blurb:
      "Corsi del catalogo Touch Jobs (HACCP, BLSD, DAE, Cinofila, Salvataggio, Zumba, PT, Massaggio). Esame a parte. L'Antincendio Livello 3 ha un listino dedicato.",
    image: null,
    installments: true,
  },
  {
    slug: "esame-certificazione",
    title: "ESAME DI CERTIFICAZIONE",
    category: "Formazione",
    priceCents: 7200,
    blurb: "Quota esame finale con rilascio attestato, da abbinare al corso.",
    image: null,
    installments: false,
  },
  /* ── CORSO ADDETTO ANTINCENDIO — LIVELLO 3 (ex Alto Rischio) ─────────────────
     Listino comunicato da Claudio il 15/09/2026: per l'antincendio SOSTITUISCE la
     voce generica da 610 € + 72 €. Scheda completa: /corsi/antincendio-livello-3 */
  /**
   * 30/09/2026 — Claudio ha consegnato la slide ufficiale del corso gratuito, il suo
   * Payment Link Stripe (prenotazione del posto) e il QR. Il testo qui sotto è il suo,
   * parola per parola: il corso è a 0 €, gli oneri obbligatori restano esclusi e
   * l'accesso passa dall'istruttoria TBH. Non aggiungiamo promesse che non ha scritto.
   */
  {
    slug: "antincendio-livello-3-gratuito",
    title: "ANTINCENDIO LIVELLO 3 — CORSO GRATUITO",
    category: "Formazione",
    priceCents: 0,
    blurb:
      "Corso di formazione Antincendio Livello 3 proposto gratuitamente: €0 per il corso. " +
      "Restano esclusi eventuali oneri obbligatori, pratiche, esami, certificazioni o servizi " +
      "accessori, ove previsti. L'accesso è subordinato a disponibilità dei posti, requisiti " +
      "richiesti e completamento dell'istruttoria TBH. Prenotazione obbligatoria.",
    image: "/shop/antincendio-livello-3-gratuito.png",
    installments: false,
    incluso:
      "Formazione per attività a rischio elevato, 16 ore (12 teoriche + 4 pratiche). " +
      "Sedi: Ravenna, Modena, Rimini. Massimo 15 partecipanti per corso.",
    /** I sei argomenti e i destinatari sono quelli stampati sulla slide ufficiale. */
    vantaggi: [
      "Prevenzione incendi",
      "Uso estintori",
      "Idranti e naspi",
      "Gestione emergenze",
      "Evacuazione e piani di sicurezza",
      "Normativa e procedure",
    ],
    checkout: { stripe: "https://buy.stripe.com/dRm5kx7Yp7IBaFR0QgfQI02" },
    qr: "/shop/antincendio-livello-3-gratuito-qr.png",
    scheda: "/corsi/antincendio-livello-3",
  },
  {
    slug: "antincendio-livello-3-completo",
    title: "ANTINCENDIO LIVELLO 3 — CORSO COMPLETO",
    category: "Formazione",
    priceCents: 28800,
    blurb:
      "Formazione teorica e pratica, gestione e prenotazione dell'esame, esame presso i Vigili del Fuoco e relativi oneri, assistenza fino al rilascio dell'attestazione. Prezzo promozionale, da 366 €. Sedi: Ravenna, Modena, Rimini. Massimo 15 partecipanti per corso.",
    image: "/corsi/antincendio-livello-3.jpg",
    installments: true,
    scheda: "/corsi/antincendio-livello-3",
  },
  {
    slug: "antincendio-livello-3-fidelity",
    title: "ANTINCENDIO LIVELLO 3 — CORSO + FIDELITY CONSUMER",
    category: "Formazione",
    priceCents: 24400,
    blurb:
      "Corso completo ed esame compresi, più la tessera TBH Fidelity Consumer (72 € una tantum): prezzi riservati su corsi, prodotti e servizi del gruppo, braccialetto NFC in regalo, sconti su antinfortunistica e Total Black, gadget e bonus «Porta un amico». Valore reale 360 €.",
    image: "/corsi/antincendio-livello-3.jpg",
    installments: true,
    scheda: "/corsi/antincendio-livello-3",
  },
  {
    slug: "kit-beauty-base",
    title: "KIT BEAUTY BASE",
    category: "Beauty",
    priceCents: 8800,
    blurb: "Kit beauty base, prodotti selezionati Touch.",
    image: null,
    installments: false,
  },
  {
    slug: "kit-beauty-professional",
    title: "KIT BEAUTY PROFESSIONAL",
    category: "Beauty",
    priceCents: 48800,
    blurb: "Kit beauty professionale per centri estetici e operatori.",
    image: null,
    installments: true,
  },
  {
    slug: "kit-benessere-touch-fit",
    title: "KIT BENESSERE TOUCH FIT",
    category: "Beauty",
    priceCents: 9150,
    blurb: "Kit benessere Touch Fit: integrazione e percorso wellness.",
    image: null,
    installments: false,
  },
  {
    slug: "corso-animazione",
    title: "CORSO DI ANIMAZIONE",
    category: "Formazione",
    priceCents: 3000,
    blurb: "Corso base di animazione turistica per villaggi e strutture della Riviera.",
    image: null,
    installments: false,
  },
  {
    slug: "capodanno-riviera",
    title: "CAPODANNO RIVIERA",
    category: "Viaggi",
    priceCents: 29900,
    blurb: "Pacchetto Capodanno sulla Riviera di Rimini.",
    image: null,
    installments: true,
  },
  {
    slug: "dj-set-con-crew",
    title: "DJ SET CON CREW",
    category: "Eventi",
    priceCents: 250000,
    blurb: "DJ set con crew completa (DJ Hugo + Touch Crew Entertainment): audio, luci e spettacolo.",
    image: null,
    installments: true,
  },
  {
    slug: "inserimento-professionale",
    title: "INSERIMENTO PROFESSIONALE",
    category: "Servizi",
    priceCents: 86400,
    blurb: "Percorso di inserimento professionale con Touch Human Resources.",
    image: null,
    installments: true,
  },
  {
    slug: "stand-street-food-s",
    title: "STAND STREET FOOD — MISURA S",
    category: "Street Food",
    priceCents: 12200,
    blurb: "Postazione espositore Touch Street Food & Beverage, misura S.",
    image: null,
    installments: false,
  },
  {
    slug: "stand-street-food-m",
    title: "STAND STREET FOOD — MISURA M",
    category: "Street Food",
    priceCents: 61000,
    blurb: "Postazione espositore Touch Street Food & Beverage, misura M.",
    image: null,
    installments: true,
  },
  {
    slug: "stand-street-food-l",
    title: "STAND STREET FOOD — MISURA L",
    category: "Street Food",
    priceCents: 91500,
    blurb: "Postazione espositore Touch Street Food & Beverage, misura L.",
    image: null,
    installments: true,
  },
  {
    slug: "stand-street-food-xl",
    title: "STAND STREET FOOD — MISURA XL",
    category: "Street Food",
    priceCents: 305000,
    blurb: "Area espositiva Touch Street Food & Beverage, misura XL.",
    image: null,
    installments: true,
  },
  {
    slug: "stand-street-food-xxl",
    title: "STAND STREET FOOD — MISURA XXL",
    category: "Street Food",
    priceCents: 610000,
    blurb: "Area espositiva Touch Street Food & Beverage, misura XXL (main partner).",
    image: null,
    installments: true,
  },
];

export const COMPANIES: Company[] = [
  { code: "TBH-001", name: "Touch Communications", vat: "04228620409", kind: "societa", sector: "Comunicazione & Media", logo: null, site: null },
  { code: "TBH-002", name: "Touch Metropolitan Media Srls", vat: "10971100960", kind: "societa", sector: "Media & Editoria", logo: "/societa/touch-metropolitan-media/logo.png", site: null },
  { code: "TBH-003", name: "Touch Village Entertainment Srl", vat: "10268470969", kind: "societa", sector: "Entertainment & Villaggi", logo: "/societa/touch-village/logo.png", site: null },
  { code: "TBH-004", name: "Touch Production Ltd & Srls", vat: "01760300085", kind: "societa", sector: "Produzione TV & Cinema", logo: "/brand/loghi/touch-production.png", site: null },
  { code: "TBH-005", name: "Touch Hello Srl", vat: "12073000965", kind: "societa", sector: "Telco · SIM · 5G", logo: "/societa/touch-hello/logo.png", site: null },
  { code: "TBH-006", name: "Touch Be Proud Srl", vat: "04894760281", kind: "societa", sector: "Eventi LGBTQ+ · Pride Village", logo: "/societa/touch-be-proud/logo.jpg", site: null },
  { code: "TBH-007", name: "Touch Home Consulia Srl & Sagl", vat: "02661280699", kind: "societa", sector: "Consulenza Casa IT + CH", logo: "/societa/touch-home-consulia/logo.png", site: null },
  { code: "TBH-008", name: "R.F.A. Rimini Football Academy A.S.D.", vat: "04124660400", kind: "societa", sector: "Sport · Settore giovanile", logo: "/societa/rfa/stemma.png", site: null },
  { code: "TBH-A01", name: "Touch Ho.Re.Ca", vat: null, kind: "attivita", sector: "Hospitality · Ristorazione · Catering", logo: null, site: null },
  { code: "TBH-A02", name: "Touch Travels", vat: null, kind: "attivita", sector: "Viaggi · Booking · Mobilità", logo: null, site: null },
  { code: "TBH-A03", name: "Touch Human Resources", vat: null, kind: "attivita", sector: "Recruiting · Formazione · Lavoro", logo: null, site: null },
  { code: "TBH-A09", name: "Touch Restaurant", vat: null, kind: "attivita", sector: "Franchising ristorazione", logo: null, site: null },
  { code: "TBH-A12", name: "Touch TV", vat: null, kind: "attivita", sector: "Televisione", logo: LOGHI_CHANNEL["touch-tv"]!.src, site: null },
  { code: "TBH-A13", name: "Touch Music TV", vat: null, kind: "attivita", sector: "TV musicale", logo: "/brand/loghi/touch-music-tv.png", site: null },
  { code: "TBH-A14", name: "Touch Music Radio", vat: null, kind: "attivita", sector: "Radio", logo: "/brand/loghi/touch-music-radio.png", site: null },
  { code: "TBH-A15", name: "Touch Cinema", vat: null, kind: "attivita", sector: "Cinema · Rimini / Emilia-Romagna", logo: "/brand/loghi/touch-cinema-studios.png", site: null },
  { code: "TBH-A16", name: "Touch Booking Host", vat: null, kind: "attivita", sector: "Booking & Host", logo: null, site: null },
  { code: "TBH-B01", name: "DJ Hugo", vat: null, kind: "attivita", sector: "Artista · Musica", logo: "/brand/loghi/deejay-hugo.png", site: "https://suno.com/@hugoveejay" },
  { code: "TBH-B02", name: "Touch Crew Entertainment", vat: null, kind: "attivita", sector: "Crew · Spettacolo", logo: null, site: null },
  { code: "TBH-B03", name: "Touch Casting", vat: null, kind: "attivita", sector: "Casting · Talenti", logo: null, site: "https://www.touchcasting.it" },
  { code: "TBH-B04", name: "Touch Security", vat: null, kind: "attivita", sector: "Sicurezza · Prevenzione · Formazione", logo: null, site: null },
  { code: "TBH-B05", name: "Touch Street Food & Beverage", vat: null, kind: "attivita", sector: "Street food · Espositori", logo: null, site: null },
  { code: "TBH-B09", name: "Touch Cleaning", vat: null, kind: "attivita", sector: "Pulizie · Sanificazioni", logo: null, site: null },
  { code: "TBH-B10", name: "Touch Miss Cool 2026", vat: null, kind: "attivita", sector: "Concorso di bellezza", logo: null, site: null },
  { code: "TBH-B11", name: "Touch Rent", vat: null, kind: "attivita", sector: "Noleggio · Logistica · Attrezzature", logo: null, site: null },
];

/** Squadre di calcio partner — link ufficiali confermati da Claudio. */
export const TEAMS: Team[] = [
  {
    slug: "verucchio",
    name: "A.S.D. Verucchio Calcio 1957",
    role: "Squadra partner · Claudio Ugolini videoperatore ufficiale 2026/27",
    site: "https://www.asdverucchio.it/",
    logo: logoSquadra("verucchio"),
    note: "Prima Categoria — Stadio Comunale, Via Aldo Moro 363, Villa Verucchio (RN).",
  },
  {
    slug: "victoria-1968",
    name: "A.S.D. Victoria 1968",
    role: "Squadra partner · riprese e produzione video TBH",
    site: "https://www.asdvictoria1968.it/",
    logo: logoSquadra("victoria-1968"),
    note: "Rimini Nord — Stadio Bani, Viserba. Progetto Victoria Card.",
  },
  {
    slug: "rfa-rimini-football-academy",
    name: "R.F.A. Rimini Football Academy A.S.D.",
    role: "Società del gruppo TBH-008 · settore giovanile",
    site: null,
    logo: "/societa/rfa/stemma.png",
    note: "P.IVA 04124660400 — Rimini. Sito ufficiale in allestimento.",
  },
  {
    slug: "vis-novafeltria",
    name: "Vis Novafeltria Calcio F.C.D.",
    role: "Società seguita · riprese e servizi media",
    site: "https://www.facebook.com/VisNovafeltria/",
    logo: logoSquadra("vis-novafeltria"),
    note: "Eccellenza girone B Emilia-Romagna — Stadio Comunale Urbini e Casali, Novafeltria (RN). Il vecchio dominio novafeltriacalcio.com è scaduto: pagina ufficiale su Facebook.",
  },
  {
    slug: "pietracuta",
    name: "U.S. Pietracuta A.S.D.",
    role: "Società seguita · riprese e servizi media",
    site: "https://www.facebook.com/u.s.pietracuta/",
    logo: logoSquadra("pietracuta"),
    note: "Eccellenza girone B Emilia-Romagna — Campo Comunale C. Bindi, Via F. Coppi 1, Pietracuta (RN). Sito ufficiale non presente: canale ufficiale Facebook.",
  },
  {
    slug: "san-marino-calcio",
    name: "A.C. San Marino Calcio",
    role: "Società seguita · riprese e servizi media",
    site: "https://acsanmarinocalcio.sm/",
    logo: logoSquadra("san-marino-calcio"),
    note: "Eccellenza girone B Emilia-Romagna — Via Consiglio dei Sessanta 99, Serravalle (RSM).",
  },
  {
    slug: "tropical-coriano",
    name: "A.S.D. Tropical Coriano",
    role: "Società seguita · riprese e servizi media",
    site: "https://www.tropicalcoriano.it/",
    logo: logoSquadra("tropical-coriano"),
    note: "Serie D girone D — Via Piane 100, Coriano (RN). Settore giovanile: juniorcoriano.com.",
  },
  {
    slug: "gabicce-gradara",
    name: "A.S.D. Gabicce Gradara",
    role: "Società seguita · riprese e servizi media",
    site: "https://www.gabiccegradaracalcio.net/",
    logo: logoSquadra("gabicce-gradara"),
    note: "Marche — Campo Comunale G. Magi, Via Aldo Moro, Gabicce Mare (PU). P.IVA 02226510416.",
  },
  {
    slug: "rimini",
    name: "Rimini Calcio",
    role: "Società di calcio di interesse del territorio",
    site: null,
    logo: logoSquadra("rimini"),
    note: "Sito ufficiale da verificare: dopo la vicenda societaria del Rimini FC 1912 il riferimento web ufficiale va riconfermato prima di pubblicarlo.",
  },
  {
    slug: "bellaria-igea-marina",
    name: "A.P.D. Bellaria Igea Marina 1956",
    role: "Società seguita · riprese e servizi media",
    site: "https://www.bellariaigeamarina1956.it/",
    logo: logoSquadra("bellaria-igea-marina"),
    note: "Promozione girone D Emilia-Romagna — Stadio E. Nanni, Via Rossini 5, Bellaria Igea Marina (RN).",
  },
];

/** Media partner sportivi collegati alle squadre. */
export const SPORT_MEDIA = [
  {
    name: "SportUp — DM Comunicazioni",
    schedule: "Lunedì 19:45 diretta",
    site: "https://youtube.com/@danielemanuelli1981",
    note: "Programma di Daniele Manuelli / DM TV. Repliche su canale 88 (Made in Bo).",
  },
  {
    name: "Calcio di Rigore",
    schedule: "Lunedì 20:30 diretta",
    site: "https://youtube.com/@danielemanuelli1981",
    note: "Dilettanti: Serie D, Eccellenza, Promozione — Marche e Romagna.",
  },
  {
    name: "Anteprima SportUp",
    schedule: "Venerdì diretta",
    site: "https://youtube.com/@danielemanuelli1981",
    note: "Anteprima del turno con ospiti.",
  },
  {
    name: "Giovanili Rimini",
    schedule: "Portale settore giovanile",
    site: "https://www.giovanilerimini.org",
    note: "Risultati e classifiche del calcio giovanile riminese.",
  },
];
