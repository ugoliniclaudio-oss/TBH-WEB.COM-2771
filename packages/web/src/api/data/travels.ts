/** TOUCH TRAVELS — FIERE INTERNAZIONALI E TAPPE ESTERE.
 *
 *  REGOLA APPLICATA: nessun indirizzo e nessun URL inventato.
 *  - `sito` è valorizzato SOLO con il dominio ufficiale verificato il 29/08/2026.
 *  - `indirizzo` è valorizzato SOLO dove risulta dalla fonte ufficiale.
 *  - `puntoRiferimento` (aggiunto il 29/08/2026 su ordine di Claudio) NON è un indirizzo:
 *    è il riferimento da usare sulla mappa quando la location esatta non è ancora nota.
 *    Claudio: «nella indecisione come punto di riferimento nella mappa ci metti una piazza
 *    al centro storico». Quindi puntiamo al CENTRO STORICO della città, senza nominare
 *    piazze specifiche non verificate.
 *  - `periodo`: le quattro date della cronologia sono state CONFERMATE da Claudio il
 *    29/08/2026 e ora sono pubblicate. Tutte le altre restano null.
 *  - Dove la struttura non è identificabile con certezza (Hotel Golem Praga,
 *    Four Points by Sheraton Bratislava) il sito resta null e il dubbio è dichiarato. */

export type TipoTappa = "fiera" | "hotel" | "citta" | "eventi" | "hospitality";

export type TappaEstero = {
  slug: string;
  paese: string;
  /** Codice ISO a 2 lettere: usato per la bandiera testuale, non per grafica inventata. */
  iso: string;
  citta: string;
  /** Nome per esteso della sede, dell'hotel o della città. */
  nome: string;
  tipo: TipoTappa;
  /** Sito ufficiale verificato. null = non verificato o struttura non identificata. */
  sito: string | null;
  /** Indirizzo dalla fonte ufficiale. null = non verificato. */
  indirizzo: string | null;
  /** Riferimento mappa provvisorio (centro storico). NON è un indirizzo verificato. */
  puntoRiferimento: string | null;
  /** Periodo dichiarato e confermato da Claudio. null = da confermare. */
  periodo: string | null;
  note: string[];
};

/** Riferimento mappa standard per le città senza location esatta. */
const centroStorico = (citta: string) => `${citta} centro storico`;

export const TAPPE_ESTERO: TappaEstero[] = [
  /* GERMANIA */
  {
    slug: "lipsia-leipziger-messe",
    paese: "Germania",
    iso: "DE",
    citta: "Lipsia",
    nome: "Leipziger Messe — polo fieristico di Lipsia",
    tipo: "fiera",
    sito: "https://www.leipziger-messe.de/",
    indirizzo: "Messe-Allee 1, 04356 Leipzig, Germania",
    puntoRiferimento: null,
    periodo: "febbraio – aprile 2024",
    note: [
      "Sede fieristica presente nella vecchia grafica «Esplora il mondo con TBH».",
      "Periodo confermato dalla direzione TBH il 29/08/2026.",
      "Nome della fiera specifica ospitata in quel periodo: da indicare.",
    ],
  },
  {
    slug: "berlino",
    paese: "Germania",
    iso: "DE",
    citta: "Berlino",
    nome: "Berlino",
    tipo: "citta",
    sito: null,
    indirizzo: null,
    puntoRiferimento: centroStorico("Berlino"),
    periodo: null,
    note: ["Tappa città / soggiorno. Fiera o evento collegato da confermare."],
  },
  {
    slug: "berlino-hotel-adlon",
    paese: "Germania",
    iso: "DE",
    citta: "Berlino",
    nome: "Hotel Adlon Kempinski Berlin",
    tipo: "hotel",
    sito: "https://www.kempinski.com/en/hotel-adlon",
    indirizzo: "Unter den Linden 77, 10117 Berlino, Germania",
    puntoRiferimento: null,
    periodo: null,
    note: ["Struttura citata nella vecchia grafica «Esplora il mondo con TBH»."],
  },
  {
    slug: "monaco-di-baviera",
    paese: "Germania",
    iso: "DE",
    citta: "Monaco di Baviera",
    nome: "Monaco di Baviera",
    tipo: "citta",
    sito: null,
    indirizzo: null,
    puntoRiferimento: centroStorico("Monaco di Baviera"),
    periodo: null,
    note: ["Tappa città. Fiera, location e struttura da confermare."],
  },
  {
    slug: "dresda",
    paese: "Germania",
    iso: "DE",
    citta: "Dresda",
    nome: "Dresda",
    tipo: "citta",
    sito: null,
    indirizzo: null,
    puntoRiferimento: centroStorico("Dresda"),
    periodo: null,
    note: ["Tappa città. Fiera, location e struttura da confermare."],
  },
  {
    slug: "francoforte",
    paese: "Germania",
    iso: "DE",
    citta: "Francoforte",
    nome: "Francoforte sul Meno",
    tipo: "citta",
    sito: null,
    indirizzo: null,
    puntoRiferimento: centroStorico("Francoforte sul Meno"),
    periodo: null,
    note: ["Tappa città. Fiera, location e struttura da confermare."],
  },
  {
    slug: "gottingen",
    paese: "Germania",
    iso: "DE",
    citta: "Göttingen",
    nome: "Göttingen",
    tipo: "citta",
    sito: null,
    indirizzo: null,
    puntoRiferimento: centroStorico("Göttingen"),
    periodo: null,
    note: ["Tappa indicata da Claudio il 29/08/2026. Fiera, location e struttura da confermare."],
  },
  {
    slug: "norimberga",
    paese: "Germania",
    iso: "DE",
    citta: "Norimberga",
    nome: "Norimberga",
    tipo: "citta",
    sito: null,
    indirizzo: null,
    puntoRiferimento: centroStorico("Norimberga"),
    periodo: null,
    note: ["Tappa indicata da Claudio il 29/08/2026. Fiera, location e struttura da confermare."],
  },
  {
    slug: "regensburg",
    paese: "Germania",
    iso: "DE",
    citta: "Ratisbona",
    nome: "Ratisbona (Regensburg)",
    tipo: "citta",
    sito: null,
    indirizzo: null,
    puntoRiferimento: centroStorico("Regensburg"),
    periodo: null,
    note: ["Tappa indicata da Claudio il 29/08/2026. Fiera, location e struttura da confermare."],
  },
  {
    slug: "rostock",
    paese: "Germania",
    iso: "DE",
    citta: "Rostock",
    nome: "Rostock",
    tipo: "citta",
    sito: null,
    indirizzo: null,
    puntoRiferimento: centroStorico("Rostock"),
    periodo: null,
    note: ["Tappa indicata da Claudio il 29/08/2026. Fiera, location e struttura da confermare."],
  },
  {
    slug: "lubecca",
    paese: "Germania",
    iso: "DE",
    citta: "Lubecca",
    nome: "Lubecca (Lübeck)",
    tipo: "citta",
    sito: null,
    indirizzo: null,
    puntoRiferimento: centroStorico("Lubecca"),
    periodo: null,
    note: [
      "Tappa indicata da Claudio il 29/08/2026 come «Lubec»: letta come Lubecca (Lübeck).",
      "Fiera, location e struttura da confermare.",
    ],
  },
  {
    slug: "brema",
    paese: "Germania",
    iso: "DE",
    citta: "Brema",
    nome: "Brema (Bremen)",
    tipo: "citta",
    sito: null,
    indirizzo: null,
    puntoRiferimento: centroStorico("Brema"),
    periodo: null,
    note: ["Tappa indicata da Claudio il 29/08/2026. Fiera, location e struttura da confermare."],
  },
  {
    slug: "motel-one",
    paese: "Germania",
    iso: "DE",
    citta: "Più città",
    nome: "Motel One — catena alberghiera",
    tipo: "hospitality",
    sito: "https://www.motel-one.com/",
    indirizzo: null,
    puntoRiferimento: null,
    periodo: null,
    note: [
      "Catena: le singole strutture utilizzate (città e indirizzi) sono da elencare.",
      "Gli «hotel partner» citati nel materiale non sono ancora un elenco nominativo: da fornire.",
    ],
  },

  /* POLONIA */
  {
    slug: "cracovia-qubus",
    paese: "Polonia",
    iso: "PL",
    citta: "Cracovia",
    nome: "Qubus Hotel Kraków",
    tipo: "hotel",
    sito: "https://www.qubushotel.com/en/hotel-krakow/",
    indirizzo: "ul. Nadwiślańska 6, 30-527 Kraków, Polonia",
    puntoRiferimento: null,
    periodo: null,
    note: ["Struttura citata nella vecchia grafica «Esplora il mondo con TBH»."],
  },
  {
    slug: "wroclaw",
    paese: "Polonia",
    iso: "PL",
    citta: "Wrocław",
    nome: "Wrocław (Breslavia)",
    tipo: "citta",
    sito: null,
    indirizzo: null,
    puntoRiferimento: centroStorico("Wrocław"),
    periodo: null,
    note: [
      "Wrocław risulta anche tra le sedi TBH dell'organigramma: il collegamento fra sede e tappa fieristica è da confermare.",
    ],
  },
  {
    slug: "poznan",
    paese: "Polonia",
    iso: "PL",
    citta: "Poznań",
    nome: "Poznań",
    tipo: "citta",
    sito: null,
    indirizzo: null,
    puntoRiferimento: centroStorico("Poznań"),
    periodo: null,
    note: ["Tappa indicata da Claudio il 29/08/2026. Fiera, location e struttura da confermare."],
  },
  {
    slug: "slupsk",
    paese: "Polonia",
    iso: "PL",
    citta: "Słupsk",
    nome: "Słupsk",
    tipo: "citta",
    sito: null,
    indirizzo: null,
    puntoRiferimento: centroStorico("Słupsk"),
    periodo: null,
    note: ["Tappa indicata da Claudio il 29/08/2026. Fiera, location e struttura da confermare."],
  },
  {
    slug: "elblag",
    paese: "Polonia",
    iso: "PL",
    citta: "Elbląg",
    nome: "Elbląg",
    tipo: "citta",
    sito: null,
    indirizzo: null,
    puntoRiferimento: centroStorico("Elbląg"),
    periodo: null,
    note: ["Tappa indicata da Claudio il 29/08/2026. Fiera, location e struttura da confermare."],
  },

  /* AUSTRIA */
  {
    slug: "klagenfurt",
    paese: "Austria",
    iso: "AT",
    citta: "Klagenfurt",
    nome: "Klagenfurt am Wörthersee",
    tipo: "eventi",
    sito: null,
    indirizzo: null,
    puntoRiferimento: centroStorico("Klagenfurt am Wörthersee"),
    periodo: "marzo – agosto 2023",
    note: [
      "Attività dichiarata: eventi e comunicazione. Location esatta da indicare (fiera, sala, hotel).",
      "Periodo confermato dalla direzione TBH il 29/08/2026.",
    ],
  },
  {
    slug: "graz",
    paese: "Austria",
    iso: "AT",
    citta: "Graz",
    nome: "Graz",
    tipo: "citta",
    sito: null,
    indirizzo: null,
    puntoRiferimento: centroStorico("Graz"),
    periodo: null,
    note: ["Tappa indicata da Claudio il 29/08/2026. Fiera, location e struttura da confermare."],
  },

  /* REPUBBLICA CECA */
  {
    slug: "praga-hotel-golem",
    paese: "Repubblica Ceca",
    iso: "CZ",
    citta: "Praga",
    nome: "Hotel Golem — Praga",
    tipo: "hotel",
    sito: null,
    indirizzo: null,
    puntoRiferimento: null,
    periodo: null,
    note: [
      "STRUTTURA NON IDENTIFICATA CON CERTEZZA: a Praga risultano due realtà diverse con quel nome, il Golden Golem Hotel a Praga 8 Březiněves e il Golem Bed & Breakfast in centro (Maiselova).",
      "Claudio il 29/08/2026: «non ricordo, lascialo da confermare». Nessuno dei due viene pubblicato.",
    ],
  },
  {
    slug: "mlada-boleslav",
    paese: "Repubblica Ceca",
    iso: "CZ",
    citta: "Mladá Boleslav",
    nome: "Mladá Boleslav",
    tipo: "eventi",
    sito: null,
    indirizzo: null,
    puntoRiferimento: centroStorico("Mladá Boleslav"),
    periodo: "maggio – luglio 2024",
    note: [
      "Attività dichiarata: eventi e attività. Location e struttura da indicare.",
      "Periodo confermato dalla direzione TBH il 29/08/2026.",
    ],
  },

  /* SLOVACCHIA */
  {
    slug: "bratislava-incheba-expo",
    paese: "Slovacchia",
    iso: "SK",
    citta: "Bratislava",
    nome: "Incheba Expo Bratislava",
    tipo: "fiera",
    sito: "https://www.incheba.sk/",
    indirizzo: "Viedenská cesta 3-7, 851 01 Bratislava, Slovacchia",
    puntoRiferimento: null,
    periodo: "agosto – ottobre 2024",
    note: [
      "Polo fieristico ed espositivo.",
      "Periodo confermato dalla direzione TBH il 29/08/2026. Nome della fiera specifica da indicare.",
    ],
  },
  {
    slug: "bratislava-four-points",
    paese: "Slovacchia",
    iso: "SK",
    citta: "Bratislava",
    nome: "Four Points by Sheraton — Bratislava",
    tipo: "hotel",
    sito: null,
    indirizzo: null,
    puntoRiferimento: null,
    periodo: null,
    note: [
      "STRUTTURA DA CONFERMARE: a Bratislava non risulta un Four Points by Sheraton; l'hotel Marriott presente in città è lo Sheraton Bratislava Hotel (Pribinova 12).",
      "Claudio il 29/08/2026: «non ricordo, lascialo da confermare». Nessun link pubblicato.",
    ],
  },

  /* SVEZIA */
  {
    slug: "goteborg",
    paese: "Svezia",
    iso: "SE",
    citta: "Göteborg",
    nome: "Göteborg (Gotemburgo)",
    tipo: "citta",
    sito: null,
    indirizzo: null,
    puntoRiferimento: centroStorico("Göteborg"),
    periodo: null,
    note: ["Tappa indicata da Claudio il 29/08/2026. Fiera, location e struttura da confermare."],
  },

  /* FRANCIA */
  {
    slug: "avignone",
    paese: "Francia",
    iso: "FR",
    citta: "Avignone",
    nome: "Avignone (Avignon)",
    tipo: "citta",
    sito: null,
    indirizzo: null,
    puntoRiferimento: centroStorico("Avignone"),
    periodo: null,
    note: ["Tappa indicata da Claudio il 29/08/2026. Fiera, location e struttura da confermare."],
  },

  /* SPAGNA */
  {
    slug: "valencia",
    paese: "Spagna",
    iso: "ES",
    citta: "Valencia",
    nome: "Valencia",
    tipo: "citta",
    sito: null,
    indirizzo: null,
    puntoRiferimento: centroStorico("Valencia"),
    periodo: null,
    note: [
      "Tappa indicata da Claudio il 29/08/2026 come «Valengia»: letta come Valencia (Spagna).",
      "Fiera, location e struttura da confermare.",
    ],
  },
  {
    slug: "sabadell",
    paese: "Spagna",
    iso: "ES",
    citta: "Sabadell",
    nome: "Sabadell",
    tipo: "citta",
    sito: null,
    indirizzo: null,
    puntoRiferimento: centroStorico("Sabadell"),
    periodo: null,
    note: ["Tappa indicata da Claudio il 29/08/2026. Fiera, location e struttura da confermare."],
  },
  {
    slug: "girona",
    paese: "Spagna",
    iso: "ES",
    citta: "Girona",
    nome: "Girona (Gerona)",
    tipo: "citta",
    sito: null,
    indirizzo: null,
    puntoRiferimento: centroStorico("Girona"),
    periodo: null,
    note: ["Tappa indicata da Claudio il 29/08/2026. Fiera, location e struttura da confermare."],
  },
  {
    slug: "tarragona",
    paese: "Spagna",
    iso: "ES",
    citta: "Tarragona",
    nome: "Tarragona",
    tipo: "citta",
    sito: null,
    indirizzo: null,
    puntoRiferimento: centroStorico("Tarragona"),
    periodo: null,
    note: ["Tappa indicata da Claudio il 29/08/2026. Fiera, location e struttura da confermare."],
  },
  {
    slug: "saragozza",
    paese: "Spagna",
    iso: "ES",
    citta: "Saragozza",
    nome: "Saragozza (Zaragoza)",
    tipo: "citta",
    sito: null,
    indirizzo: null,
    puntoRiferimento: centroStorico("Saragozza"),
    periodo: null,
    note: ["Tappa indicata da Claudio il 29/08/2026. Fiera, location e struttura da confermare."],
  },
  {
    slug: "castellon",
    paese: "Spagna",
    iso: "ES",
    citta: "Castellón",
    nome: "Castellón de la Plana",
    tipo: "citta",
    sito: null,
    indirizzo: null,
    puntoRiferimento: centroStorico("Castellón de la Plana"),
    periodo: null,
    note: ["Tappa indicata da Claudio il 29/08/2026. Fiera, location e struttura da confermare."],
  },

  /* ANDORRA */
  {
    slug: "andorra",
    paese: "Andorra",
    iso: "AD",
    citta: "Andorra",
    nome: "Andorra (Principato)",
    tipo: "citta",
    sito: null,
    indirizzo: null,
    puntoRiferimento: "Andorra la Vella centro",
    periodo: null,
    note: [
      "Tappa indicata da Claudio il 29/08/2026 come «Andorra», senza città precisa.",
      "Riferimento mappa provvisorio sulla capitale Andorra la Vella: località esatta da confermare.",
    ],
  },
];

/** Cronologia recuperata dalla vecchia grafica CV e CONFERMATA da Claudio il 29/08/2026.
 *  Le date sono ora pubblicate anche nelle schede delle rispettive tappe. */
export const CRONOLOGIA_CONFERMATA: {
  luogo: string;
  periodoIndicato: string;
  fonte: string;
}[] = [
  { luogo: "Klagenfurt (Austria)", periodoIndicato: "marzo – agosto 2023", fonte: "confermata dalla direzione TBH il 29/08/2026" },
  { luogo: "Lipsia — Leipziger Messe (Germania)", periodoIndicato: "febbraio – aprile 2024", fonte: "confermata dalla direzione TBH il 29/08/2026" },
  { luogo: "Mladá Boleslav (Rep. Ceca)", periodoIndicato: "maggio – luglio 2024", fonte: "confermata dalla direzione TBH il 29/08/2026" },
  { luogo: "Bratislava — Incheba Expo (Slovacchia)", periodoIndicato: "agosto – ottobre 2024", fonte: "confermata dalla direzione TBH il 29/08/2026" },
];

/** Alias mantenuto per compatibilità con eventuali import precedenti. */
export const CRONOLOGIA_DA_CONFERMARE = CRONOLOGIA_CONFERMATA;

/** Video ufficiale Touch Travel sul canale Touch Music Radio TV (verificato il 29/08/2026). */
export const TRAVELS_VIDEO = {
  titolo: "Touch Travel è il marchio tour operator del gruppo italiano Touch Business Holding (TBH).",
  url: "https://www.youtube.com/watch?v=Bz6ooT3bXd4",
  canale: "https://www.youtube.com/@touchmusicradiotv",
};

export const TRAVELS_NOTA =
  "Touch Travels è un'attività del gruppo TBH senza P.IVA propria. Questa pagina raccoglie le tappe estere del materiale storico: i siti ufficiali e gli indirizzi mostrati sono stati verificati uno per uno il 29/08/2026 e i quattro periodi indicati sono stati confermati dalla direzione. Dove la location esatta non è ancora nota, la mappa punta al centro storico della città ed è dichiarato apertamente che non si tratta di un indirizzo verificato. Nessuna data, nessun link e nessun indirizzo è stato ricostruito a memoria.";

/** Cosa manca per chiudere il database ANNO → PAESE → CITTÀ → FIERA → LOCATION → HOTEL. */
export const TRAVELS_MANCANTI: string[] = [
  "Anni e periodi di tutte le tappe diverse dalle quattro già confermate (Klagenfurt, Lipsia, Mladá Boleslav, Bratislava).",
  "Nome della fiera o dell'evento specifico per ogni città, non solo il polo fieristico.",
  "Quale «Hotel Golem» di Praga e se il «Four Points by Sheraton» di Bratislava era lo Sheraton Bratislava.",
  "Elenco nominativo dei Motel One e degli hotel partner realmente utilizzati, città per città.",
  "Location e indirizzi esatti delle città che oggi hanno solo il riferimento «centro storico».",
  "«Cosecha»: località non identificata nell'elenco del 29/08/2026, forse un refuso — da chiarire.",
  "Le altre tappe che Claudio non ricorda: elenco da completare («poi non mi ricordo»).",
  "Foto reali delle tappe: senza immagini gli spazi restano dichiarati vuoti, nessuna foto di repertorio.",
  "Eventuali locali e ristoranti collegati a ogni tappa, con indirizzo.",
];
