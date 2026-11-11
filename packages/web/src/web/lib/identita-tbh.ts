/**
 * IDENTITÀ TBH — sorgente UNICA di payoff, aree e navigazione.
 *
 * Ordine di Claudio del 05/09/2026 (restyling «UN SITO, TANTE HOMEPAGE»):
 * - payoff ufficiale scritto da lui, parola per parola;
 * - menu DEFINITIVO a 16 voci, come nel mockup IMG_9031;
 * - palette: nero + giallo fluo. Il rosso #E30613 resta il colore del solo mondo DM.
 * - numeri in vetrina: SOLO quelli reali della nostra anagrafica, mai «8+ / ∞».
 *
 * Da questo file nascono: la barra di navigazione, la barra scorrevole mobile,
 * la griglia delle aree in homepage e le hero delle singole sezioni.
 * Regola madre: nessuna destinazione del sito viene persa quando il menu cambia.
 *
 * NOME DEL SITO — ordine di Claudio del 05/09/2026: «Tibihacca bocciato, TBH-WEB promosso».
 * Il portale si chiama TBH-WEB (dominio tbh-web.com) e questo nome vale in testata, nel footer,
 * nei metadati, nei messaggi WhatsApp e nei QR. «TiBiHacca» NON va più scritto da nessuna parte
 * come nome del sito: si veda NOME_SITO / DOMINIO_SITO qui sotto e lo script
 * scripts/verifica-nome-tbh-web.py, che fallisce se il vecchio nome ricompare.
 * Unica eccezione consentita: le email @tibihacca.com, che sono recapiti REALI del materiale
 * ufficiale di Claudio e restano valide finché non comunica i nuovi indirizzi.
 */

/** Nome ufficiale del portale. Unica sorgente: non scrivere il nome a mano altrove. */
export const NOME_SITO = "TBH-WEB";
export const DOMINIO_SITO = "tbh-web.com";
export const URL_SITO = "https://tbh-web.com/";
/** Nome bocciato il 05/09/2026: se ricompare come nome del sito è un errore. */
export const NOME_SITO_BOCCIATO = "TiBiHacca";

/** Payoff ufficiale — testo consegnato da Claudio il 05/09/2026. Non modificarlo. */
export const PAYOFF_TBH = "VISIBILITÀ SENZA CONFINI";
export const PAYOFF_TBH_SOTTO =
  "Business. Media. Sport. Eventi. Territorio. Sempre presenti. Ovunque conta.";

/** Giallo fluo del gruppo. Il rosso è riservato a DM. */
export const COLORE_TBH = "#d7ff00";
export const COLORE_DM = "#ff2b2b";

export type VoceArea = { to: string; label: string };

export type AreaTbh = {
  /** Etichetta corta, quella che si legge nel menu. */
  label: string;
  /** Titolo per esteso, usato nelle hero e nelle schede. */
  titolo: string;
  /** Pagina principale dell'area: il titolo del menu è sempre cliccabile. */
  to: string;
  colore: string;
  /** Occhiello sopra il titolo nella hero della sezione. */
  occhiello: string;
  /** Riga di richiamo: cosa trova davvero chi entra. */
  claim: string;
  /** Pulsante principale della scheda/hero. */
  cta: string;
  /** Tendina del menu: tutte le destinazioni dell'area. */
  items: VoceArea[];
  /** Le tendine molto lunghe si aprono su più colonne. */
  mega?: boolean;
};

/**
 * LE 16 AREE — ordine esatto del mockup IMG_9031:
 * HOME · TBH · DM · SPORT · RADIO · FASHION · SHOP · EVENTI · TURISMO ·
 * COMMUNITY · LAVORO · MOTORSPORT · SQUADRE · PRODUZIONI · DJ HUGÒ · CONTATTI
 */
export const AREE: AreaTbh[] = [
  {
    label: "TBH",
    titolo: "Touch Business Holding",
    to: "/tbh/societa",
    colore: COLORE_TBH,
    occhiello: "Il gruppo",
    claim: "Le nostre società, le attività, i servizi e il network commerciale.",
    cta: "Scopri il gruppo",
    mega: true,
    items: [
      { to: "/tbh/societa", label: "Società con P.IVA" },
      { to: "/tbh/attivita", label: "Attività del gruppo" },
      { to: "/tbh/registro", label: "Registro entità TBH" },
      { to: "/anagrafica", label: "Anagrafica master TBH" },
      { to: "/tbh/servizi", label: "Tutti i servizi TBH" },
      { to: "/tbh-assist", label: "TBH Assist" },
      { to: "/tbh/livelli", label: "25 Livelli TBH" },
      { to: "/network/circuito", label: "Circuito TBH" },
      { to: "/tbh/pagine", label: "Pagine TBH" },
      { to: "/tbh/brand-personalizzazioni", label: "Brand & Personalizzazioni" },
      { to: "/tbh/brand-personalizzazioni/visibilita-in-onda", label: "Visibilità in onda" },
      { to: "/business-desk", label: "Business Desk" },
      { to: "/network", label: "TBH Network" },
      { to: "/network/clienti", label: "Clienti TBH" },
      { to: "/network/sponsor", label: "Sponsor TBH" },
      { to: "/network/partner", label: "Partner TBH" },
      { to: "/network/media-partner", label: "Media Partner TBH" },
      { to: "/network/rete-commerciale", label: "Rete commerciale" },
      { to: "/management", label: "Management · Contratti e liberatorie" },
      { to: "/istituzioni", label: "Portali istituzionali" },
    ],
  },
  {
    // DM Comunicazioni è MEDIA PARTNER AUTONOMO: non è una società del gruppo TBH.
    label: "DM",
    titolo: "DM Comunicazioni",
    to: "/dm",
    colore: COLORE_DM,
    occhiello: "Media partner",
    claim:
      "Calcio di Rigore, TG Sport, Il Calcio D Tutti e AnteprimaSport: il calcio raccontato in modo diverso.",
    cta: "Apri il mondo DM",
    items: [
      { to: "/dm", label: "DM Comunicazioni · Home" },
      { to: "/dm/programmi", label: "I programmi" },
      { to: "/media/dm/crew", label: "DM Crew" },
      { to: "/sport/societa-seguite", label: "Società seguite" },
      { to: "/sport/highlights-dm", label: "Archivio video e highlights" },
    ],
  },
  {
    // Menu Sport: solo quattro voci (ordine del 15/09/2026). Le squadre stanno
    // dentro CALCIO, le partite dentro VIDEO, i tornei dentro CALENDARIO.
    label: "Sport",
    titolo: "Sport & Media",
    to: "/sport",
    colore: COLORE_TBH,
    occhiello: "Sport",
    claim: "Calcio, video, calendario e motorsport: tutto lo sport TBH in quattro accessi.",
    cta: "Scopri lo sport",
    items: [
      { to: "/sport/calcio", label: "Calcio" },
      { to: "/sport/calendario", label: "Calendario" },
      // 28/09/2026 (audit BLOCCO 1): «Motorsport» non si ripete qui, ha un mondo suo.
    ],
  },
  {
    label: "Radio",
    titolo: "Radio & TV",
    to: "/media/radio-tv",
    colore: COLORE_TBH,
    occhiello: "Sempre in onda",
    claim: "Le nostre radio partner, i palinsesti e i canali TV in chiaro.",
    cta: "Ascolta live",
    items: [
      { to: "/media/radio-tv", label: "Radio, TV & Curiosità" },
      { to: "/tv-radio-streaming", label: "TV, radio e streaming" },
      { to: "/media", label: "Media Hub TBH" },
    ],
  },
  {
    label: "Fashion",
    titolo: "Fashion & Riviste",
    to: "/fashion",
    colore: COLORE_TBH,
    occhiello: "Stile senza confini",
    claim: "Moda, magazine, tendenze e creatività: i marchi e le riviste del circuito.",
    cta: "Scopri il mondo fashion",
    items: [
      { to: "/fashion", label: "Fashion & Riviste" },
      { to: "/tbh/touch-fashion", label: "Touch Fashion" },
    ],
  },
  {
    label: "Shop",
    titolo: "Touch Plaza Shop",
    to: "/shop",
    colore: COLORE_TBH,
    occhiello: "Prodotti, idee, passioni",
    claim: "Il centro commerciale digitale: dai nostri brand ai migliori partner.",
    cta: "Entra nello shop",
    items: [
      { to: "/shop", label: "Touch Plaza Shop" },
      { to: "/tbh/prodotti", label: "Prodotti TBH" },
      { to: "/tv-streaming-adv", label: "TV & Streaming ADV · Pubblicità in onda" },
      { to: "/le-mie-campagne", label: "Le mie campagne ADV" },
      { to: "/offerte", label: "Offerte del periodo" },
      { to: "/pagamenti", label: "Pagamenti, rate e finanziamenti" },
      { to: "/tbh-app", label: "TBH App · Download e archivio" },
    ],
  },
  {
    label: "Eventi",
    titolo: "Eventi dal vivo",
    to: "/eventi/fiere-internazionali",
    colore: COLORE_TBH,
    occhiello: "Emozioni dal vivo",
    claim: "Festival, fiere, manifestazioni e grandi momenti, in Italia e all'estero.",
    cta: "Scopri gli eventi",
    items: [
      { to: "/eventi/fiere-internazionali", label: "Calendario fiere ed eventi" },
      { to: "/hugoland", label: "Hugoland" },
      { to: "/sanremo", label: "Area Sanremo" },
      { to: "/pride-village", label: "Pride Village Padova" },
      { to: "/eventi/miss-cool", label: "Touch Miss Cool" },
    ],
  },
  {
    label: "Turismo",
    titolo: "Turismo & Territorio",
    to: "/touch-travels",
    colore: COLORE_TBH,
    occhiello: "Scopri, vivi, condividi",
    claim: "Territorio, esperienze, hotel, ristoranti e località del circuito.",
    cta: "Scopri il territorio",
    items: [
      { to: "/touch-travels", label: "Touch Travels" },
      { to: "/hospitality", label: "Hospitality TBH" },
      { to: "/hospitality/hotel", label: "Hotel e strutture" },
      { to: "/hospitality/ristoranti", label: "Ristoranti" },
      { to: "/hospitality/locali", label: "Locali e beach" },
      { to: "/hospitality/esperienze", label: "Esperienze" },
      { to: "/hospitality/transfer", label: "Transfer e mobilità" },
      { to: "/territorio/mappa", label: "Mappa del territorio" },
      { to: "/territorio/spazi", label: "Spazi territoriali" },
      {
        to: "/territorio/rimini/dove-dormire-mangiare-divertirsi",
        label: "Rimini · dove dormire, mangiare e divertirsi",
      },
    ],
  },
  {
    label: "Community",
    titolo: "Community TBH",
    to: "/community",
    colore: COLORE_TBH,
    occhiello: "Persone, idee, opportunità",
    claim: "Unisciti al network: club, giochi, ricerca e mappa di tutto il portale.",
    cta: "Entra nella community",
    items: [
      { to: "/community", label: "Community TBH" },
      { to: "/club", label: "TBH Club" },
      { to: "/media/giochi", label: "Giochi di mente" },
      { to: "/capitan-touch", label: "Capitan Touch" },
      { to: "/neuroni", label: "Neuroni premio" },
      { to: "/cerca", label: "Ricerca globale" },
      // 28/09/2026 (audit BLOCCO 1): la mappa del sito non è una voce di Community.
      // Sta fra le azioni rapide del menu e nel footer, in un posto solo.
    ],
  },
  {
    label: "Lavoro",
    titolo: "Lavoro & Casting",
    to: "/lavoro-casting",
    colore: COLORE_TBH,
    occhiello: "Il tuo talento, le nostre opportunità",
    claim: "Offerte, casting, selezioni, corsi e collaborazioni.",
    cta: "Scopri le opportunità",
    items: [
      { to: "/lavoro-casting", label: "Job & Casting" },
      { to: "/lavoro-casting/bacheca", label: "Bacheca annunci" },
      { to: "/touch-academy", label: "Touch Academy" },
      { to: "/media/reality-show/academy", label: "Academy & reclutamento" },
      { to: "/hvs", label: "HVS · High Visibility Scout" },
      // 28/09/2026 — arrivava dal vecchio mega-menu «Altro», che era un doppione
      // di questi mondi. Qui è al suo posto: è un modo di collaborare e guadagnare.
      { to: "/servizi-referral", label: "Servizi & Referral · guadagna con noi" },
    ],
  },
  {
    label: "Motorsport",
    titolo: "Motorsport",
    to: "/sport/motorsport",
    colore: COLORE_TBH,
    occhiello: "Velocità, emozioni, business",
    claim: "Circuiti, eventi, team e servizi di pista.",
    cta: "Entra nel motorsport",
    items: [
      { to: "/cremona-circuit-2026", label: "Cremona Circuit 2026" },
    ],
  },
  {
    label: "Squadre",
    titolo: "Le squadre che seguiamo",
    to: "/sport/squadre",
    colore: COLORE_TBH,
    occhiello: "Territorio, passione, futuro",
    claim: "Le società sportive del cuore di TBH, una per una.",
    cta: "Scopri tutte le squadre",
    items: [
      { to: "/sport/squadre", label: "Tutte le società" },
      // 28/09/2026 — unica voce del vecchio mega-menu «Altro» che non era già in un
      // mondo: il suo posto naturale è qui, fra le squadre e il territorio.
      { to: "/sport/squadre/rimini", label: "Rimini · territorio" },
    ],
  },
  {
    label: "Produzioni",
    titolo: "Produzioni TBH",
    to: "/tbh/produzioni",
    colore: COLORE_TBH,
    occhiello: "Idee che diventano realtà",
    claim: "Cinema, TV, radio, magazine: contenuti e distribuzione.",
    cta: "Scopri le produzioni",
    items: [
      { to: "/tbh/produzioni", label: "Produzioni TBH" },
      { to: "/media/reality-show", label: "Reality Show" },
      { to: "/media/heddy-video", label: "HEDDY Video" },
      { to: "/media/libreria", label: "Loghi e collegamenti ufficiali" },
      { to: "/influencity", label: "Touch Influencity Magazine" },
      { to: "/influencity/speciali", label: "Speciali annuali" },
      { to: "/news", label: "News TBH" },
      // EDICOLA TBH — ordine di Claudio del 28/09/2026: entra subito nel menu.
      // Sta nel mondo «Produzioni» perché è editoria, e sta solo qui: nessuna
      // destinazione ripetuta in due mondi. Il carosello «OGGI SU TBH» resta
      // invece nella bozza /check-web/edicola, la home non si tocca.
      { to: "/edicola", label: "Edicola TBH · Rassegna stampa" },
      { to: "/edicola/oroscopo", label: "Oroscopo del giorno" },
      { to: "/edicola/fonti", label: "Edicola · Le nostre fonti" },
    ],
  },
  {
    // BLOCCO 1 (28/09/2026): nome canonico «J.C. Hugò» (ordine esplicito
    // DJ Hugò → J.C. Hugò). Il vecchio indirizzo /dj-hugo resta valido come
    // redirect ma il menu punta solo alla rotta canonica. «Deejay Hugò» resta
    // dove firma il materiale ufficiale consegnato (locandine), non nei menu.
    label: "J.C. Hugò",
    titolo: "J.C. Hugò",
    to: "/musica/jc-hugo",
    colore: COLORE_TBH,
    occhiello: "Music · Show · Experience",
    claim: "Live, set, eventi e produzioni musicali.",
    cta: "Scopri J.C. Hugò",
    items: [
      { to: "/musica/jc-hugo", label: "J.C. Hugò · pagina ufficiale" },
      { to: "/musica", label: "Musica TBH" },
    ],
  },
  {
    label: "Contatti",
    titolo: "Contatti",
    to: "/contatti",
    colore: COLORE_TBH,
    occhiello: "Sempre con te",
    claim: "Scrivici, chiamaci, vieni a trovarci.",
    cta: "Entra in contatto",
    items: [
      { to: "/contatti", label: "Contatti e assistenza" },
      { to: "/ceo", label: "Editore · CEO · Artista · Imprenditore" },
      { to: "/contatti-social", label: "Touch Social · seguici ovunque" },
      { to: "/in-allestimento", label: "Stiamo lavorando per voi" },
    ],
  },
];

/** Barra scorrevole di mobile e tablet: Home + le 16 aree, nessuna ripetizione. */
export const AREE_SCORREVOLI: VoceArea[] = [
  { to: "/", label: "Home" },
  ...AREE.map((a) => ({ to: a.to, label: a.label })),
];

/** Elenco piatto senza duplicati: footer e mappa del sito. */
export const AREE_FLAT: VoceArea[] = (() => {
  const visti = new Set<string>();
  return AREE.flatMap((a) => a.items).filter((i) =>
    visti.has(i.to) ? false : (visti.add(i.to), true),
  );
})();

/** Trova l'area a cui appartiene un percorso: serve alle hero delle sezioni. */
export function areaDiPercorso(path: string): AreaTbh | undefined {
  return AREE.find(
    (a) =>
      path === a.to ||
      path.startsWith(`${a.to}/`) ||
      a.items.some((i) => path === i.to || path.startsWith(`${i.to}/`)),
  );
}
