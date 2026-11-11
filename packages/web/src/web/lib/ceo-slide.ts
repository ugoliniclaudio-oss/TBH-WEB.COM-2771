/**
 * Pagina «Editore · CEO · Artista · Imprenditore» — Claudio Ugolini.
 *
 * Le slide sono le sue, ufficiali: file in `packages/web/public/ceo/`.
 * Ogni testo qui sotto è TRASCRITTO dalle slide: niente aggiunte, niente riscritture.
 * Tutte e 12 le slide della presentazione sono online (05/09/2026), più la 13ª:
 * il biglietto da visita digitale fronte/retro.
 *
 * Sequenza confermata da Claudio il 05/09/2026: gli export 4 e 6 hanno sostituito
 * le versioni con la numerazione doppia. Lo spazio `ceo:slide` resta disponibile
 * dal pannello `/allestimento` per i materiali successivi.
 */

export const CEO_NOME = "Claudio Ugolini";
export const CEO_RUOLI = "Imprenditore · Manager · Producer · Artista";
export const CEO_CARICA = "CEO & Founder — Touch Business Holding";
export const CEO_ARTISTA = "J.C. Hugò — DJ · VJ · Producer · Editore";
export const CEO_CLAIM = "More than business. A human ecosystem.";
export const CEO_FIRMA = "Ideas today. A brighter tomorrow.";
export const CEO_SLIDE_TOTALI = 12;
export const CEO_SLIDE_AGGIORNATO = "05/09/2026";

export type SlideCeo = {
  n: number;
  /** Numero stampato sulla slide. Dal 05/09/2026 coincide sempre con `n`. */
  stampato: string | null;
  titolo: string;
  sottotitolo: string | null;
  file: string | null;
};

/**
 * Sequenza ufficiale confermata da Claudio il 05/09/2026.
 * Le slide 4 e 6 sono state sostituite con gli export corretti (prima portavano
 * i numeri doppi «3/12» e «5/12»). La 13 è il biglietto da visita digitale.
 */
export const CEO_SLIDE: SlideCeo[] = [
  {
    n: 1,
    stampato: "1/12",
    titolo: "Claudio Ugolini",
    sottotitolo: "Imprenditore · Manager · Producer · Artista",
    file: "/ceo/01-claudio-ugolini.jpg",
  },
  {
    n: 2,
    stampato: "2/12",
    titolo: "Chi sono",
    sottotitolo: "Imprenditore, manager, producer, artista",
    file: "/ceo/02-chi-sono.jpg",
  },
  {
    n: 3,
    stampato: "3/12",
    titolo: "Il mio percorso",
    sottotitolo: "Esperienza e ruoli",
    file: "/ceo/03-il-mio-percorso.jpg",
  },
  {
    n: 4,
    stampato: "4/12",
    titolo: "Le mie società",
    sottotitolo: "Un ecosistema di impresa, creatività e territorio",
    file: "/ceo/04-le-mie-societa.jpg",
  },
  {
    n: 5,
    stampato: "5/12",
    titolo: "Cinema & Produzione",
    sottotitolo: "Showrunner · Location manager · Scout · Casting · Set · Post",
    file: "/ceo/05-cinema-e-produzione.jpg",
  },
  {
    n: 6,
    stampato: "6/12",
    titolo: "I nostri servizi",
    sottotitolo: "Soluzioni su misura",
    file: "/ceo/06-i-nostri-servizi.jpg",
  },
  {
    n: 7,
    stampato: "7/12",
    titolo: "Media & Comunicazione",
    sottotitolo: "Radio · TV · Web · Magazine · Streaming",
    file: "/ceo/07-media-comunicazione.jpg",
  },
  {
    n: 8,
    stampato: "8/12",
    titolo: "Eventi & Entertainment",
    sottotitolo: "Show · Hospitality · Crew · Territorio",
    file: "/ceo/08-eventi-entertainment.jpg",
  },
  {
    n: 9,
    stampato: "9/12",
    titolo: "Touch Business Holding",
    sottotitolo: "Il mio ecosistema di impresa",
    file: "/ceo/09-touch-business-holding.jpg",
  },
  {
    n: 10,
    stampato: "10/12",
    titolo: "Territori & Network",
    sottotitolo: "Dove le relazioni diventano opportunità",
    file: "/ceo/10-territori-network.jpg",
  },
  {
    n: 11,
    stampato: "11/12",
    titolo: "J.C. Hugò & Editoria",
    sottotitolo: "DJ · VJ · Producer · Editore",
    file: "/ceo/11-jc-hugo-editoria.jpg",
  },
  {
    n: 12,
    stampato: "12/12",
    titolo: "Obiettivi & Contatti",
    sottotitolo: "Partnership · Produzioni · Business development · Booking",
    file: "/ceo/12-obiettivi-contatti.jpg",
  },
  {
    n: 13,
    stampato: "13/13",
    titolo: "Biglietto da visita digitale",
    sottotitolo: "Fronte e retro · QR collegato al sito",
    file: "/ceo/13-biglietto-da-visita.jpg",
  },
];

export const CEO_SLIDE_CONSEGNATE = CEO_SLIDE.filter((s) => s.file !== null);
export const CEO_SLIDE_ATTESE = CEO_SLIDE.filter((s) => s.file === null);

/** Le 12 slide della presentazione (senza il biglietto da visita). */
export const CEO_SLIDE_PRESENTAZIONE = CEO_SLIDE.filter((s) => s.n <= CEO_SLIDE_TOTALI);
/** Slide 13: il biglietto da visita digitale, fronte e retro. */
export const CEO_BIGLIETTO = CEO_SLIDE.find((s) => s.n === 13) ?? null;

/* ── Slide 1: le quattro colonne ── */
export const CEO_COLONNE: { titolo: string; testo: string }[] = [
  { titolo: "Chi sono", testo: "Visione imprenditoriale, operativa e creativa." },
  { titolo: "Cosa faccio", testo: "Business, media, eventi, marketing ed entertainment." },
  {
    titolo: "Ruoli operativi",
    testo: "Location Manager, produzione, casting, coordinamento e media.",
  },
  { titolo: "Territori", testo: "Sanremo, Milano, Padova, Rimini, Roma e oltre." },
];

/* ── Slide 2 «Chi sono» ── */
export const CEO_CHI_SONO_TESTO =
  "Un percorso professionale costruito tra business, media, eventi, cinema, comunicazione, " +
  "territorio e creatività, con l'obiettivo di creare valore, connessioni e opportunità reali.";

export const CEO_CHI_SONO: { titolo: string; testo: string }[] = [
  { titolo: "Visione", testo: "Unire impresa, creatività e strategia in un ecosistema coerente." },
  {
    titolo: "Esperienza",
    testo: "Percorso trasversale tra società, produzioni, eventi e progetti multimediali.",
  },
  {
    titolo: "Relazioni",
    testo: "Network professionale costruito tra territori, persone e opportunità.",
  },
  {
    titolo: "Obiettivi",
    testo: "Sviluppare nuove partnership, produzioni e collaborazioni di valore.",
  },
];

export const CEO_AMBITI = [
  "Business",
  "Media",
  "Cinema",
  "Eventi",
  "Radio",
  "Musica",
  "Sport",
  "Territorio",
];

/* ── Slide 3 «Il mio percorso» ── */
export const CEO_PERCORSO_TESTO =
  "Un percorso costruito nel tempo tra imprese, produzioni, comunicazione, eventi, " +
  "relazioni professionali e sviluppo di nuove opportunità.";

export const CEO_PERCORSO: { titolo: string; voci: string[] }[] = [
  {
    titolo: "Società & progetti",
    voci: [
      "Touch Business Holding",
      "Touch Cinema",
      "Touch Village Entertainment",
      "Metropolitan",
      "Consulia",
      "Touch Be Proud",
    ],
  },
  {
    titolo: "Esperienze storiche",
    voci: [
      "Rete Roma Communications",
      "Openline Mobile",
      "Lazio Servizi Cinema",
      "Rimini Fashion TV",
      "San Marino TV",
    ],
  },
  {
    titolo: "Ruoli & competenze",
    voci: [
      "Imprenditore",
      "Manager",
      "Producer",
      "Videomaker",
      "Coordinamento",
      "Scouting territoriale",
    ],
  },
  {
    titolo: "Territori & network",
    voci: ["Sanremo", "Milano", "Padova", "Rimini", "Roma", "San Marino"],
  },
];

/* ── Slide 4 «Le mie società» ──
   `to` solo dove la pagina interna esiste davvero: niente pulsanti che finiscono nel vuoto. */
export const CEO_SOCIETA: {
  nome: string;
  voci: string[];
  to: string | null;
}[] = [
  {
    nome: "Touch Cinema",
    voci: ["Cinema", "TV", "Produzioni", "Casting", "Location", "Servizi per la produzione"],
    to: "/tbh/produzioni",
  },
  {
    nome: "Touch Village Entertainment",
    voci: ["Eventi", "Entertainment", "Hospitality", "Turismo", "Format e grandi eventi"],
    to: "/hospitality",
  },
  {
    nome: "Metropolitan Servizi",
    voci: ["Servizi", "Logistica", "Advertising", "Supporto operativo"],
    to: "/tbh/servizi",
  },
  {
    nome: "Consulia",
    voci: ["Consulenza", "Immobiliare", "Strategia", "Investimenti", "Sviluppo progetti"],
    to: "/tbh/servizi",
  },
  {
    nome: "Touch Be Proud",
    voci: ["Eventi", "Community", "Inclusione", "Cultura", "Territorio", "Valore sociale"],
    to: "/pride-village",
  },
];

export const CEO_ALTRE_SOCIETA = [
  "Liguria Servizi Cinema",
  "Lazio Servizi Cinema",
  "Openline Mobile",
  "Rete Roma Communications",
  "Rimini Fashion TV",
  "San Marino TV",
  "Billionaire Club",
  "BB Club",
];

export const CEO_SVILUPPO = [
  "Sviluppo di impresa",
  "Persone e team",
  "Idee e progetti",
  "Partnership e territori",
  "Opportunità internazionali",
];

/* ── Slide 5 «Cinema & Produzione» ── */
export const CEO_CINEMA_TESTO =
  "Claudio Ugolini opera nel cinema, nella TV, nei media e nei servizi di produzione, " +
  "unendo creatività, organizzazione, scouting, crew e delivery in un unico ecosistema " +
  "di competenze e relazioni.";

export const CEO_CINEMA_RUOLI = "Showrunner · Location Manager · Location Scout · Production Manager";

export const CEO_CINEMA: { titolo: string; testo: string }[] = [
  { titolo: "Showrunner & Format", testo: "Sviluppo, concept e coordinamento creativo-produttivo." },
  { titolo: "Location Manager & Scout", testo: "Ricerca location, sopralluoghi, permessi e logistica." },
  { titolo: "Produzione & Casting", testo: "Crew, talent, organizzazione set e backstage." },
  { titolo: "Post & Distribuzione", testo: "Montaggio, promozione, delivery, festival e piattaforme." },
];

export const CEO_CINEMA_AMBITI = [
  "Cinema",
  "TV",
  "Format",
  "Casting",
  "Location",
  "Crew",
  "Post",
  "Distribuzione",
];

/* ── Slide 6 «I nostri servizi» ── */
export const CEO_SERVIZI_TESTO =
  "Un ecosistema completo per dare visibilità, valore e opportunità a persone, attività, " +
  "brand e territori.";

export const CEO_SERVIZI: { titolo: string; voci: string[]; to: string | null }[] = [
  {
    titolo: "Produzione audiovisiva",
    voci: [
      "Video",
      "Foto",
      "Montaggio",
      "Regia",
      "Live Streaming",
      "Spot",
      "Interviste",
      "Documentari",
      "Post Produzione",
    ],
    to: "/tbh/produzioni",
  },
  {
    titolo: "Marketing e comunicazione",
    voci: [
      "Social",
      "Campagne",
      "ADV",
      "Branding",
      "Ufficio stampa",
      "Digital Marketing",
      "Content Creation",
      "Gestione community",
    ],
    to: "/tbh/brand-personalizzazioni",
  },
  {
    titolo: "Eventi e hospitality",
    voci: [
      "Organizzazione",
      "Produzione",
      "Location",
      "Staff",
      "Accoglienza",
      "Turismo",
      "Experience",
      "Entertainment",
      "Fiere",
      "Eventi privati e pubblici",
    ],
    to: "/eventi/fiere-internazionali",
  },
  {
    titolo: "Talent & Casting",
    voci: [
      "Artisti",
      "DJ",
      "Performer",
      "Modelle/i",
      "Hostess",
      "Crew",
      "Selezioni",
      "Coordinamento",
      "Management",
      "Scouting",
      "Formazione",
      "Opportunità",
    ],
    to: "/lavoro-casting",
  },
  {
    titolo: "Territorio e sviluppo",
    voci: [
      "Promozione",
      "Progetti",
      "Reti",
      "Opportunità locali",
      "Turismo",
      "Cultura",
      "Sport",
      "Sociale",
      "Sviluppo e valorizzazione",
    ],
    to: "/territorio/mappa",
  },
];

export const CEO_PILASTRI = [
  "Idea e strategia",
  "Produzione e tecnologia",
  "Persone e team",
  "Visibilità e risultati",
  "Network e partnership",
  "Territorio e opportunità",
];

/* ── Slide 7 «Media & Comunicazione» ── */
export const CEO_MEDIA_OCCHIELLO = "Radio · TV · Web · Magazine · Streaming";
export const CEO_MEDIA_TESTO =
  "Un ecosistema editoriale e multimediale pensato per raccontare attività, persone, " +
  "territori ed eventi attraverso contenuti, relazioni e visibilità.";

export const CEO_MEDIA: { titolo: string; voci: string[]; to: string | null }[] = [
  {
    titolo: "Radio & Podcast",
    voci: ["Interviste", "Rubriche", "Format audio", "Speaker · conduzione", "Branded content"],
    to: "/media/radio-tv",
  },
  {
    titolo: "TV & Web content",
    voci: ["Format", "Riprese", "Backstage", "Produzione video", "Clip · storytelling"],
    to: "/media",
  },
  {
    titolo: "Social & Digital media",
    voci: ["Contenuti", "Campagne", "Community", "Branding", "Visibilità · promozione"],
    to: "/contatti-social",
  },
  {
    titolo: "Magazine & Ufficio stampa",
    voci: [
      "Articoli",
      "Interviste",
      "Comunicati",
      "Touch Influencity Magazine",
      "Press & media relations",
    ],
    to: "/magazine",
  },
  {
    titolo: "Live streaming & Multicamera",
    voci: ["Dirette", "Eventi", "Regia", "Distribuzione", "Piattaforme · audience"],
    to: "/media/streaming",
  },
];

export const CEO_MEDIA_CHIP = [
  "Contenuti",
  "Audience",
  "Relazioni",
  "Produzione",
  "Promozione",
  "Territorio",
];

/* ── Slide 8 «Eventi & Entertainment» ── */
export const CEO_EVENTI_OCCHIELLO = "Show · Hospitality · Crew · Territorio";
export const CEO_EVENTI_TESTO =
  "Un'area che unisce organizzazione, produzione, esperienze live, hospitality, " +
  "coordinamento dello staff, eventi per la community, supporto al motorsport e " +
  "promozione del territorio.";
export const CEO_EVENTI_CLAIM = "Live people, better together";

export const CEO_EVENTI: { titolo: string; voci: string[]; to: string | null }[] = [
  {
    titolo: "Eventi & Spettacolo",
    voci: ["Organizzazione", "Produzione", "Format", "Live experience"],
    to: "/eventi/fiere-internazionali",
  },
  {
    titolo: "Hospitality & Accoglienza",
    voci: ["Staff", "Accoglienza", "Turismo", "Servizi"],
    to: "/hospitality",
  },
  {
    titolo: "Pride & Community",
    voci: ["Eventi", "Inclusione", "Intrattenimento", "Relazione"],
    to: "/pride-village",
  },
  {
    titolo: "Motorsport & Grandi eventi",
    voci: ["Crew", "Coordinamento", "Supporto operativo", "Visibilità"],
    to: "/sport/motorsport",
  },
  {
    titolo: "Territorio & Network",
    voci: ["Promozione", "Partnership", "Opportunità", "Sviluppo"],
    to: "/network",
  },
];

export const CEO_EVENTI_CHIP = [
  "Live experience",
  "Persone e team",
  "Eventi",
  "Partnership",
  "Territorio",
  "Opportunità",
];

/* ── Slide 9 «Touch Business Holding» ── */
export const CEO_HOLDING_OCCHIELLO = "Il mio ecosistema di impresa";
export const CEO_HOLDING_TESTO =
  "Una rete di società, servizi, media, eventi, produzione e territorio coordinata da " +
  "una visione unica: creare valore, relazioni e opportunità.";

export const CEO_HOLDING: { titolo: string; voci: string[]; to: string | null }[] = [
  {
    titolo: "Società & Partecipazioni",
    voci: [
      "Touch Cinema",
      "Touch Village Entertainment",
      "Metropolitan Servizi",
      "Consulia",
      "Touch Be Proud",
    ],
    to: "/tbh/societa",
  },
  {
    titolo: "Servizi integrati",
    voci: ["Business", "Media", "Marketing", "Produzione", "Eventi", "Hospitality"],
    to: "/tbh/servizi",
  },
  {
    titolo: "Media & Visibilità",
    voci: ["Radio", "TV", "Web", "Magazine", "Social", "Streaming"],
    to: "/media",
  },
  {
    titolo: "Territorio & Network",
    voci: ["Sanremo", "Milano", "Padova", "Rimini", "Roma", "San Marino"],
    to: "/territorio/mappa",
  },
  {
    titolo: "Progetti & Opportunità",
    voci: ["Partnership", "Sponsorship", "Produzioni", "Eventi", "Sviluppo"],
    to: "/network/partner",
  },
];

export const CEO_HOLDING_CHIP = [
  "Impresa",
  "Persone",
  "Media",
  "Territorio",
  "Opportunità",
];

/* ── Slide 10 «Territori & Network» ── */
export const CEO_TERRITORI_OCCHIELLO = "Dove le relazioni diventano opportunità";
export const CEO_TERRITORI_TESTO =
  "Un percorso costruito tra città, media, eventi, imprese, sport e produzione, " +
  "collegando persone, progetti e opportunità.";

export const CEO_TERRITORI: { citta: string; voci: string[]; to: string | null }[] = [
  { citta: "Sanremo", voci: ["Radio", "Musica", "Eventi"], to: "/sanremo" },
  { citta: "Milano", voci: ["Business", "Media", "Radio"], to: null },
  { citta: "Padova", voci: ["Pride", "Eventi", "Entertainment"], to: "/pride-village" },
  { citta: "Rimini / Riccione", voci: ["Media", "Sport", "Turismo"], to: "/sport" },
  { citta: "Roma", voci: ["Cinema", "Produzione", "Comunicazione"], to: "/tbh/produzioni" },
  { citta: "San Marino", voci: ["TV", "Relazioni", "Territorio"], to: null },
];

export const CEO_TERRITORI_CHIP = [
  "Relazioni",
  "Territorio",
  "Media",
  "Eventi",
  "Business",
  "Opportunità",
];

/* ── Slide 11 «J.C. Hugò & Editoria» ── */
export const CEO_HUGO_OCCHIELLO = "DJ · VJ · Producer · Editore";
export const CEO_HUGO_RIGA = "Musica · Visual · Contenuti · Magazine · Relazioni";
export const CEO_HUGO_TESTO =
  "L'identità artistica e creativa che affianca il percorso imprenditoriale, tra musica, " +
  "performance, produzione, contenuti e progetti editoriali.";

export const CEO_HUGO: { titolo: string; voci: string[]; to: string | null }[] = [
  {
    titolo: "DJ set & Performance",
    voci: ["Club", "Eventi", "Format", "Live experience"],
    to: "/musica/jc-hugo",
  },
  {
    titolo: "VJ & Live visual",
    voci: ["Visual show", "Video content", "Regia creativa"],
    to: "/musica/jc-hugo",
  },
  {
    titolo: "Produzione musicale",
    voci: ["Concept", "Produzione", "Remix", "Sound identity"],
    to: "/musica",
  },
  {
    titolo: "Touch Influencity Magazine",
    voci: ["Editoria", "Articoli", "Interviste", "Storytelling"],
    to: "/magazine",
  },
  {
    titolo: "Contenuti & Storytelling",
    voci: ["Video", "Social", "Immagine", "Creatività"],
    to: "/media",
  },
];

export const CEO_HUGO_CHIP = [
  "Musica",
  "Visual",
  "Magazine",
  "Contenuti",
  "Eventi",
  "Branding",
  "Produzione",
  "Creatività",
];

/* ── Slide 12 «Obiettivi & Contatti» ── */
export const CEO_OBIETTIVI_OCCHIELLO =
  "Partnership · Produzioni · Business development · Booking";
export const CEO_OBIETTIVI_TESTO =
  "Una visione costruita per generare valore, relazioni e nuove opportunità tra impresa, " +
  "media, territori, creatività ed eventi.";
export const CEO_OBIETTIVI_CHIUSURA =
  "Costruiamo insieme nuove relazioni, progetti e opportunità.";
export const CEO_OBIETTIVI_PAYOFF = "Stesse idee. Nuovi orizzonti. Sempre insieme.";

export const CEO_OBIETTIVI: { titolo: string; voci: string[]; to: string | null }[] = [
  {
    titolo: "Partnership & Sviluppo",
    voci: ["Collaborazioni", "Sponsorship", "Crescita"],
    to: "/network/partner",
  },
  {
    titolo: "Produzioni & Media",
    voci: ["Cinema", "TV", "Radio", "Web", "Magazine"],
    to: "/tbh/produzioni",
  },
  {
    titolo: "Eventi & Territorio",
    voci: ["Format", "Hospitality", "Network", "Promozione"],
    to: "/hospitality",
  },
  {
    titolo: "J.C. Hugò / Booking",
    voci: ["DJ", "VJ", "Producer", "Live projects"],
    to: "/musica/jc-hugo",
  },
  {
    titolo: "Contatti & Canali",
    voci: ["Email", "WhatsApp", "Sito web", "Social", "Videocall"],
    to: "/contatti",
  },
];

/* ── Slide 13: biglietto da visita digitale ──
   Ogni dato è quello STAMPATO sul biglietto: nessuna aggiunta.
   I social senza URL confermato restano etichette non cliccabili (domanda aperta 103). */
export const CEO_CARD_RUOLI = [
  "Imprenditore",
  "Regista",
  "Showrunner",
  "Editore",
  "Produttore",
  "Cinema",
  "Musica",
  "Magazine",
  "Casting director",
  "Videomaker",
  "Fonico",
];

export const CEO_CARD_TELEFONO = "+39 327 123 7328";
export const CEO_CARD_TELEFONO_HREF = "tel:+393271237328";
export const CEO_CARD_WHATSAPP = "+39 379 208 8524";
export const CEO_CARD_WHATSAPP_HREF = "https://wa.me/393792088524";
export const CEO_CARD_EMAIL = "direzione@tibihacca.com";
export const CEO_CARD_SITO = "www.tbh-web.com";
export const CEO_CARD_SEDI = [
  "Sanremo",
  "Milano",
  "Padova",
  "Rimini",
  "Roma",
  "San Marino",
];
export const CEO_CARD_PAYOFF = "People create tomorrow";

/** I social stampati sul biglietto. `url: null` = link ancora da confermare. */
export const CEO_CARD_SOCIAL: { nome: string; url: string | null }[] = [
  { nome: "Instagram", url: null },
  { nome: "TikTok", url: null },
  { nome: "YouTube", url: "https://www.youtube.com/@touchmusicradiotv" },
  { nome: "Facebook", url: "https://www.facebook.com/showrunnercinemaradiotv" },
  { nome: "Bigo Live", url: null },
  { nome: "Bump", url: null },
  { nome: "X", url: null },
  { nome: "LinkedIn", url: null },
  { nome: "Telegram", url: null },
  { nome: "Twitch", url: null },
  { nome: "Spotify", url: null },
];
