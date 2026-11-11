/* ────────────────────────────────────────────────────────────────────────────
   TERRITORIO TBH — MODELLO UNICO DELLA SCHEDA MASTER

   Gerarchia: TERRITORIO TBH → CITTÀ → CATEGORIA → ATTIVITÀ → SCHEDA MASTER.

   UNA ATTIVITÀ = UNA SOLA SCHEDA MASTER. Un'attività che appartiene a più
   categorie (Portosole è nautica ed eventi, Victory Morgana Bay è ristorante e
   locale) resta UN SOLO record e compare in tutte le sue fasce tramite
   `categorie`: non viene riscritta due volte.

   REGOLA FERREA: nessun dato inventato e nessun dato ripreso da portali terzi
   (Booking, TripAdvisor, Facebook, Google Maps…). Ogni indirizzo, telefono,
   email e indirizzo internet in questo archivio è stato letto dal SITO
   UFFICIALE dell'attività. Dove il sito ufficiale non pubblica il dato, il
   campo resta `null`: la scheda scrive IN ALLESTIMENTO oppure «Immagine in
   aggiornamento», mai un valore messo lì per riempire e mai un pulsante che
   non porta in nessun posto.

   I dati commerciali (stato della trattativa, referente, note) NON stanno qui:
   sono in territorio-crm.ts, che le pagine pubbliche non importano.
   ──────────────────────────────────────────────────────────────────────────── */

/** Etichette commerciali ammesse. Nessun'altra parola va messa sul nastro. */
export type EtichettaTbh = "Partner TBH" | "Convenzionato" | "Promozione";

/** Che cosa c'è nel riquadro: il marchio ufficiale o una fotografia reale. */
export type TipoImmagine = "logo" | "foto";

/** Le città del Territorio TBH. `diano-marina` è un dintorno, non una città capofila. */
export type CittaSlug = "rimini" | "sanremo" | "padova" | "diano-marina";

export type SocialAttivita = {
  /** Nome della rete come la si legge sul pulsante. */
  rete: string;
  url: string;
};

/** LA SCHEDA MASTER: tutto quello che il sito sa di un'attività, in un record. */
export type AttivitaTBH = {
  /** ID TBH: identificativo stabile, è anche la chiave del CRM privato. */
  id: string;
  slug: string;
  /** Nome per esteso, scritto come lo scrive il sito ufficiale. */
  nome: string;
  citta: CittaSlug;
  /** Zona o quartiere, quando il sito ufficiale lo dichiara. */
  zona: string | null;
  /** Una o più categorie: l'attività compare in tutte, restando un solo record. */
  categorie: string[];
  descrizione: string | null;
  /** Località come la scrive la fonte ufficiale. */
  localita: string | null;
  indirizzo: string | null;
  /** Coordinate del punto: servono al pulsante GOOGLE MAP quando esistono.
      Si scrivono solo se lette da una fonte cartografica (OpenStreetMap) sopra
      un indirizzo già verificato: mai stimate «a occhio». */
  lat: number | null;
  lon: number | null;
  /** Da dove vengono le coordinate, e perché un punto non è posizionato. */
  fonteCoordinate: string | null;
  telefono: string | null;
  /** Numero WhatsApp dell'attività, solo se lo pubblica il suo sito. */
  whatsapp: string | null;
  email: string | null;
  sito: string | null;
  social: SocialAttivita[];
  /** Marchio ufficiale o fotografia reale: il file sta già dentro il sito. */
  immagine: string | null;
  tipoImmagine: TipoImmagine | null;
  /** Piastra sotto il marchio: `scuro` per i marchi bianchi su fondo trasparente. */
  fondoLogo?: "chiaro" | "scuro";
  /** Altre immagini ufficiali già presenti nel sito. */
  gallery: string[];
  /** Video ufficiale dell'attività. */
  video: string | null;
  /** Servizi dichiarati dalla fonte ufficiale. */
  servizi: string[];
  /** Prenotazione assistita TBH via WhatsApp: `true` dove c'è qualcosa da prenotare. */
  prenotabile: boolean;
  /** Prenotazione diretta sul canale ufficiale dell'attività, se pubblicato. */
  prenotazione: string | null;
  etichetta: EtichettaTbh | null;
  /** Perché un dato manca, oppure che cosa c'è nel riquadro. */
  nota: string | null;
  /** Da dove è stato letto il dato e quando: la tracciabilità sta in scheda. */
  fonte: string | null;
};

export type CittaTBH = {
  slug: CittaSlug;
  /** Nome della città sul monitor. */
  nome: string;
  /** Riga sotto il nome: RIMINI • RIVIERA ROMAGNOLA. */
  area: string;
  emoji: string;
  colore: string;
  titolo: string;
  descrizione: string;
  /** Percorso della pagina città. */
  percorso: string;
  /** Immagine di copertina del monitor, solo se reale. */
  cover: string | null;
};

export type CategoriaTBH = {
  slug: string;
  emoji: string;
  titolo: string;
  colore: string;
  testo: string;
};

/* ── CITTÀ ──────────────────────────────────────────────────────────────── */

export const CITTA_TBH: CittaTBH[] = [
  {
    slug: "rimini",
    nome: "Rimini",
    area: "Riviera Romagnola",
    emoji: "🏖️",
    colore: "#33e0ff",
    titolo: "Dove dormire, mangiare e divertirsi a Rimini",
    descrizione:
      "Selezione TBH di hotel, ristoranti, locali, beach club, villaggi, aree shopping, location per eventi e portali turistici della Riviera Romagnola.",
    percorso: "/territorio/rimini",
    cover: null,
  },
  {
    slug: "sanremo",
    nome: "Sanremo",
    area: "Riviera dei Fiori",
    emoji: "🌺",
    colore: "#ff8a3d",
    titolo: "Dove dormire, mangiare e divertirsi a Sanremo",
    descrizione:
      "Hotel storici, camping, ristoranti sul porto, nautica, shopping ed eventi della città del Festival e della Riviera dei Fiori.",
    percorso: "/territorio/sanremo",
    cover: null,
  },
  {
    slug: "padova",
    nome: "Padova",
    area: "Veneto",
    emoji: "🏛️",
    colore: "#c9a9ff",
    titolo: "Dove dormire, mangiare e divertirsi a Padova",
    descrizione:
      "Hotel del centro e della cintura, osterie e bacari, locali, centri commerciali, fiere e location per eventi con i portali istituzionali del Veneto.",
    percorso: "/territorio/padova",
    cover: null,
  },
];

/** Dintorni: non hanno un monitor proprio, compaiono dentro la città capofila. */
export const DINTORNI_TBH: Record<string, { nome: string; dentro: CittaSlug; etichetta: string }> = {
  "diano-marina": {
    nome: "Diano Marina",
    dentro: "sanremo",
    etichetta: "Riviera dei Fiori · dintorni di Sanremo",
  },
};

/* ── CATEGORIE ──────────────────────────────────────────────────────────── */

export const CATEGORIE_TBH: CategoriaTBH[] = [
  {
    slug: "hotel",
    emoji: "🏨",
    titolo: "Hotel",
    colore: "#33e0ff",
    testo: "Strutture con sito ufficiale verificato e recapiti letti dalla fonte.",
  },
  {
    slug: "camping",
    emoji: "⛺",
    titolo: "Camping e villaggi",
    colore: "#7dff9b",
    testo: "Villaggi, camping e aree di sosta attrezzate.",
  },
  {
    slug: "ristoranti",
    emoji: "🍽️",
    titolo: "Ristoranti e cucina",
    colore: "#ff8a3d",
    testo: "Cucina di mare, di terra e cucina tipica del posto.",
  },
  {
    slug: "locali",
    emoji: "🍸",
    titolo: "Locali e nightlife",
    colore: "#ff5fa2",
    testo: "Cocktail bar, caffetterie e locali da sera.",
  },
  {
    slug: "beach",
    emoji: "🏖️",
    titolo: "Beach club",
    colore: "#e8ff00",
    testo: "Stabilimenti, beach bar e locali sul mare.",
  },
  {
    slug: "nautica",
    emoji: "⛵",
    titolo: "Porti e nautica",
    colore: "#5fd0ff",
    testo: "Porti turistici, circoli nautici e servizi di ormeggio.",
  },
  {
    slug: "shopping",
    emoji: "🛍️",
    titolo: "Shopping e centri commerciali",
    colore: "#ffb3d1",
    testo: "Centri commerciali, gallerie e outlet.",
  },
  {
    slug: "eventi",
    emoji: "🎭",
    titolo: "Eventi e location",
    colore: "#ffd45f",
    testo: "Fiere, teatri, palazzi e spazi per congressi e spettacoli.",
  },
  {
    slug: "attrazioni",
    emoji: "📍",
    titolo: "Piazze e luoghi simbolo",
    colore: "#9bf0ff",
    testo: "Piazze, ville storiche, monumenti e punti di ritrovo della città.",
  },
  {
    slug: "teatri",
    emoji: "🎬",
    titolo: "Teatri e cinema",
    colore: "#ff6b6b",
    testo: "Teatri, cinema e sale di spettacolo.",
  },
  {
    slug: "info",
    emoji: "ℹ️",
    titolo: "Portali e istituzioni",
    colore: "#c9a9ff",
    testo: "Informazione turistica ufficiale, comuni e uffici competenti.",
  },
];

/* ── COSTRUTTORE DELLA SCHEDA ───────────────────────────────────────────────
   Si scrive solo quello che è stato letto dalla fonte ufficiale: tutti gli
   altri campi nascono vuoti, cioè IN ALLESTIMENTO. Così un dato mancante non
   può essere confuso con un dato dimenticato. */

type SchedaMinima = {
  id: string;
  slug: string;
  nome: string;
  citta: CittaSlug;
  categorie: string[];
} & Partial<AttivitaTBH>;

export function scheda(a: SchedaMinima): AttivitaTBH {
  return {
    zona: null,
    descrizione: null,
    localita: null,
    indirizzo: null,
    lat: null,
    lon: null,
    fonteCoordinate: null,
    telefono: null,
    whatsapp: null,
    email: null,
    sito: null,
    social: [],
    immagine: null,
    tipoImmagine: null,
    gallery: [],
    video: null,
    servizi: [],
    prenotabile: false,
    prenotazione: null,
    etichetta: null,
    nota: null,
    fonte: null,
    ...a,
  };
}

/** La categoria dietro il suo slug: serve alle schede per colore ed emoji. */
export function categoria(slug: string): CategoriaTBH {
  return (
    CATEGORIE_TBH.find((c) => c.slug === slug) ?? {
      slug,
      emoji: "📍",
      titolo: slug,
      colore: "#ffffff",
      testo: "",
    }
  );
}
