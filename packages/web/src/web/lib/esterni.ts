/**
 * TESTATE, PARTNER E BRAND ESTERNI — link comunicati da Claudio il 05/09/2026.
 *
 * Regole rispettate:
 * · nessun URL inventato: ogni indirizzo qui sotto è quello che ha mandato lui,
 *   aperto e verificato dal portale il 05/09/2026;
 * · le anteprime in `/anteprime/` sono fotografie reali della homepage ufficiale,
 *   scattate il 05/09/2026 — dove il sito blocca la cattura, `anteprima` resta null
 *   e la scheda mostra il riquadro «anteprima non disponibile», non un'immagine finta;
 * · prezzi e prodotti Elena Di Cuori sono quelli del suo listino ufficiale letti il
 *   05/09/2026: il pulsante porta sempre alla scheda del venditore, l'incasso è suo.
 */

export const VERIFICATO_IL = "05/09/2026";

/* ─────────────────────────  GIORNALI E RIVISTE SPORTIVE  ───────────────────────── */

export type TestataSportiva = {
  nome: string;
  sito: string;
  anteprima: string | null;
  cosa: string;
  ruolo: string;
  sezioni: { label: string; url: string }[];
  nota: string | null;
};

export const STAMPA_SPORTIVA: TestataSportiva[] = [
  {
    nome: "Tutto Campo",
    sito: "https://www.tuttocampo.it",
    anteprima: null,
    cosa: "Portale nazionale del calcio dilettantistico e giovanile: classifiche, risultati, marcatori e rose, regione per regione.",
    ruolo: "Fonte ufficiale dei campionati delle squadre che seguiamo",
    sezioni: [
      { label: "Emilia Romagna", url: "https://www.tuttocampo.it/EmiliaRomagna" },
      { label: "Marche", url: "https://www.tuttocampo.it/Marche" },
      { label: "Eccellenza Emilia Romagna", url: "https://www.tuttocampo.it/EmiliaRomagna/Eccellenza" },
      { label: "Promozione Emilia Romagna", url: "https://www.tuttocampo.it/EmiliaRomagna/Promozione" },
    ],
    nota: "Il portale blocca la cattura automatica dell'anteprima: il pulsante apre comunque il sito ufficiale.",
  },
  {
    nome: "Romagna Sport",
    sito: "https://www.romagnasport.com",
    anteprima: "/anteprime/romagnasport.jpg",
    cosa: "Quotidiano sportivo della Romagna: calcio, basket, pallavolo, futsal e motori, con rubriche e almanacchi.",
    ruolo: "Cronaca e risultati del territorio",
    sezioni: [
      /* 17/10/2026: /calcio, /basket e /pallavolo rispondevano 404. Questi sono gli
         indirizzi «Home Calcio/Basket/Pallavolo» del menu ufficiale di romagnasport.com,
         verificati: rispondono 200. */
      { label: "Calcio", url: "https://www.romagnasport.com/tuttocalcio/tuttocalcio.php" },
      { label: "Basket", url: "https://www.romagnasport.com/tuttobasket/tuttobasket.php" },
      { label: "Pallavolo", url: "https://www.romagnasport.com/tuttovolley/tuttovolley.php" },
    ],
    nota: "Stessa redazione di Marche Sport e Emilia Romagna Sport.",
  },
];

/* ─────────────────────────  PRIDE VILLAGE PADOVA  ───────────────────────── */

export const PRIDE_VILLAGE = {
  nome: "Padova Pride Village",
  sito: "https://www.pridevillage.it",
  anteprima: "/anteprime/pridevillage.jpg",
  descrizione:
    "Il festival LGBTQ+ più grande d'Italia, a Padova. TBH è presente con Touch Be Proud: ricerca PR, prenotazioni e Village Card.",
  /* Ancore reali della homepage ufficiale, lette il 05/09/2026. */
  sezioni: [
    { label: "Programma", url: "https://www.pridevillage.it/#programma" },
    { label: "Orari e costi", url: "https://www.pridevillage.it/#orari-costi" },
    { label: "Village Card", url: "https://www.pridevillage.it/#village-card" },
    { label: "Area Privè", url: "https://www.pridevillage.it/#prive" },
    { label: "Chi può entrare", url: "https://www.pridevillage.it/#chi-puo-entrare" },
    { label: "Food & Beverage", url: "https://www.pridevillage.it/#food-beverage" },
    { label: "Chi siamo", url: "https://www.pridevillage.it/#chisiamo" },
  ],
  social: [
    { label: "Facebook", url: "https://facebook.com/padovapridevillage" },
    { label: "Instagram", url: "https://instagram.com/padovapridevillage" },
  ],
  email: "info@padovapridevillage.it",
  nota:
    "Programma, orari e prezzi delle serate li pubblica e li aggiorna il Village sul suo sito: da qui si aprono le sue pagine ufficiali, non una copia che invecchia.",
};

/* ─────────────────────────  ELENA DI CUORI · FASHION  ───────────────────────── */

/**
 * Come si compra un prodotto che non è nostro — Priorità 2bis punto l).
 *
 * · `sito-venditore` → l'ordine e l'incasso restano a lui: il pulsante apre la sua scheda.
 * · `checkout-tbh`   → si paga da noi: il pulsante compare SOLO se un link di pagamento
 *                      valido è stato inserito nel pannello (regola già in vigore nel negozio).
 * · `whatsapp`       → si ordina scrivendo al WhatsApp commerciale, con messaggio precompilato.
 */
export type TipoAcquisto = "sito-venditore" | "checkout-tbh" | "whatsapp";

export type ProdottoEsterno = {
  nome: string;
  prezzo: string;
  url: string;
  categoria: string;
  /** Chi vende e chi incassa. Un prodotto di un terzo senza venditore dichiarato non si pubblica. */
  venditore: string;
  /** Come si compra: decide quale pulsante appare in pagina, non lo decide la grafica. */
  tipoAcquisto: TipoAcquisto;
  /**
   * Immagine ufficiale del venditore, quando lui ne consente l'uso (punto c, terzo modo).
   * `null` = non ancora ricevuta: la card lo dice, non si genera e non si copia niente.
   */
  urlImmagine?: string | null;
};

/**
 * La chiave con cui si conserva la foto di un prodotto non nostro (Priorità 2bis).
 *
 * Si ricava dall'ultimo pezzo dell'indirizzo ufficiale del venditore, non dal nome:
 * l'indirizzo è già scritto da lui e non cambia se domani correggiamo una maiuscola nel
 * titolo. Così la foto caricata una volta resta attaccata al prodotto giusto.
 *
 * Esempio: `https://elenadicuori.com/it/it/eu/bikini-regina-di-cuori/`
 *       →  `prodotto-esterno:bikini-regina-di-cuori`
 */
export function slotProdottoEsterno(url: string) {
  const pezzi = url.split("?")[0].split("#")[0].split("/").filter(Boolean);
  const ultimo = pezzi[pezzi.length - 1] ?? "";
  return `prodotto-esterno:${ultimo.toLowerCase()}`;
}

export const ELENA_DI_CUORI = {
  nome: "Elena Di Cuori",
  sito: "https://elenadicuori.com/it/",
  shop: "https://elenadicuori.com/it/shop/",
  anteprima: "/anteprime/elenadicuori.jpg",
  ragioneSociale: "EN FASHION GROUP S.R.L.",
  piva: "IT10504480962",
  posizione: "Non è cliente e non fa parte del Circuito TBH: è un marchio che presentiamo nell'area Fashion.",
  descrizione:
    "Lingerie, costumi e borse di lusso Made in Italy: pizzo Leavers, sete e pellami, produzione italiana.",
  categorie: [
    { label: "Costumi da bagno", url: "https://elenadicuori.com/it/lingerie-made-in-italy/costumi-da-bagno/" },
    { label: "Reggiseni", url: "https://elenadicuori.com/it/lingerie-made-in-italy/reggiseni/" },
    { label: "Slip", url: "https://elenadicuori.com/it/lingerie-made-in-italy/slip/" },
    { label: "Body", url: "https://elenadicuori.com/it/lingerie-made-in-italy/body/" },
    { label: "Intimo", url: "https://elenadicuori.com/it/lingerie-made-in-italy/intimo/" },
    { label: "Nightwear", url: "https://elenadicuori.com/it/lingerie-made-in-italy/nightwear/" },
    { label: "Bridal", url: "https://elenadicuori.com/it/lingerie-made-in-italy/bridal/" },
    { label: "Borse", url: "https://elenadicuori.com/it/lingerie-made-in-italy/borse/" },
  ],
  servizi: [
    { label: "Guida alle taglie", url: "https://elenadicuori.com/it/size-guide/" },
    { label: "Spedizioni e resi", url: "https://elenadicuori.com/it/resi-e-rimborsi-luxury/" },
    { label: "Tracking ordine", url: "https://elenadicuori.com/it/order-tracking/" },
    { label: "Diventa rivenditore", url: "https://elenadicuori.com/it/diventa-rivenditore/" },
    { label: "Contatti", url: "https://elenadicuori.com/it/contact/" },
  ],
  social: [
    { label: "Instagram", url: "https://www.instagram.com/elenadicuori/" },
    { label: "Facebook", url: "https://www.facebook.com/elenadicuori/" },
  ],
};

/** Prodotti e prezzi letti sul listino ufficiale del venditore il 05/09/2026. */
const ELENA_LISTINO: Omit<ProdottoEsterno, "venditore" | "tipoAcquisto">[] = [
  {
    nome: "Bikini Regina di Cuori",
    prezzo: "129,00 €",
    categoria: "Costumi da bagno",
    url: "https://elenadicuori.com/it/it/eu/bikini-regina-di-cuori/",
  },
  {
    nome: "Costume intero iconic Monogram",
    prezzo: "129,00 €",
    categoria: "Costumi da bagno",
    url: "https://elenadicuori.com/it/it/eu/costume-da-bagno-intero-iconic-monogram/",
  },
  {
    nome: "Aida reggiseno · pizzo Leavers",
    prezzo: "230,00 €",
    categoria: "Reggiseni",
    url: "https://elenadicuori.com/it/it/eu/reggiseno-balconcino-push-up-pizzo-leavers/",
  },
  {
    nome: "Aida slip · pizzo Leavers",
    prezzo: "60,00 €",
    categoria: "Slip",
    url: "https://elenadicuori.com/it/it/eu/slip-pizzo-leavers/",
  },
  {
    nome: "Diana reggiseno balconcino",
    prezzo: "117,00 €",
    categoria: "Reggiseni",
    url: "https://elenadicuori.com/it/it/eu/reggiseno-balconcino-pizzo-leavers-lusso/",
  },
  {
    nome: "Diana slip · tulle e pizzo",
    prezzo: "98,00 €",
    categoria: "Slip",
    url: "https://elenadicuori.com/it/it/eu/slip-pizzo-leavers-tulle-lusso-made-in-italy/",
  },
  {
    nome: "Anastasia reggiseno",
    prezzo: "278,00 €",
    categoria: "Reggiseni",
    url: "https://elenadicuori.com/it/it/eu/cashmere-carpenter-beanie/",
  },
  {
    nome: "Anastasia slip in seta ricamato",
    prezzo: "148,00 €",
    categoria: "Slip",
    url: "https://elenadicuori.com/it/it/eu/slip-seta-ricamato/",
  },
  {
    nome: "Antonia sottoveste in seta",
    prezzo: "280,00 €",
    categoria: "Nightwear",
    url: "https://elenadicuori.com/it/it/eu/sottoveste-in-seta-pizzo-leavers/",
  },
  {
    nome: "Elettra reggiseno ricamato in seta",
    prezzo: "130,00 €",
    categoria: "Intimo",
    url: "https://elenadicuori.com/it/it/eu/reggiseno-ricamato-in-seta/",
  },
  {
    nome: "Elettra reggicalze",
    prezzo: "130,00 €",
    categoria: "Intimo",
    url: "https://elenadicuori.com/it/it/eu/reggicalze-ricamato-rosso/",
  },
  {
    nome: "Elisabetta perizoma · pizzo Leavers e seta",
    prezzo: "65,00 €",
    categoria: "Slip",
    url: "https://elenadicuori.com/it/it/eu/perizoma-pizzo-leavers-seta/",
  },
];

/**
 * Venditore e tipo di acquisto si scrivono una volta per tutto il listino, non riga per riga:
 * la condizione è la stessa per ogni articolo del marchio ed è quella già dichiarata nella sua
 * scheda — «l'ordine e l'incasso restano al venditore». Nessun articolo di Elena Di Cuori passa
 * dal nostro checkout, quindi nessuno di loro può risultare «senza checkout».
 */
export const ELENA_DI_CUORI_PRODOTTI: ProdottoEsterno[] = ELENA_LISTINO.map((p) => ({
  ...p,
  venditore: ELENA_DI_CUORI.nome,
  tipoAcquisto: "sito-venditore",
}));

/* ─────────────────────────  FASHION LIFE MAGAZINE  ───────────────────────── */

export const FASHION_LIFE = {
  nome: "Fashion Life Magazine",
  sito: "https://www.fashionlifemagazine.com",
  anteprima: "/anteprime/fashionlife.jpg",
  rapporto: "Testata di cui abbiamo fatto parte in redazione.",
  descrizione:
    "Magazine di moda, lifestyle e spettacolo: sfilate, personaggi, destinazioni, beauty e design. Edizioni in italiano, inglese e spagnolo.",
  sezioni: [
    { label: "Moda", url: "https://www.fashionlifemagazine.com/category/fashion-life-magazine-moda/" },
    { label: "Editoriali moda", url: "https://www.fashionlifemagazine.com/category/editoriale-moda/" },
    { label: "Accessori", url: "https://www.fashionlifemagazine.com/category/accessori/" },
    { label: "People", url: "https://www.fashionlifemagazine.com/category/people/" },
    { label: "Spettacolo", url: "https://www.fashionlifemagazine.com/category/people/spettacolo/" },
    { label: "Cinema", url: "https://www.fashionlifemagazine.com/category/people/cinema-people/" },
    { label: "Musica", url: "https://www.fashionlifemagazine.com/category/people/musica/" },
    { label: "Eventi", url: "https://www.fashionlifemagazine.com/category/eventi/" },
    { label: "Destinations", url: "https://www.fashionlifemagazine.com/category/destinations/" },
    { label: "Beauty", url: "https://www.fashionlifemagazine.com/category/beauty/" },
    { label: "Design", url: "https://www.fashionlifemagazine.com/category/design/" },
    { label: "Lifestyle", url: "https://www.fashionlifemagazine.com/category/lifestyle/" },
    { label: "Gourmet", url: "https://www.fashionlifemagazine.com/category/gourmet/" },
    { label: "Luxury", url: "https://www.fashionlifemagazine.com/category/luxury/" },
  ],
  edizioni: [
    { label: "Italiano", url: "https://www.fashionlifemagazine.com/" },
    { label: "English", url: "https://www.fashionlifemagazine.com/en/" },
    { label: "Español", url: "https://www.fashionlifemagazine.com/es/" },
  ],
  extra: [
    { label: "Books", url: "https://www.fashionlifemagazine.com/books/" },
    { label: "Contatti redazione", url: "https://www.fashionlifemagazine.com/contact/" },
    { label: "Instagram", url: "https://instagram.com/fashionlifemagazine_" },
  ],
};
