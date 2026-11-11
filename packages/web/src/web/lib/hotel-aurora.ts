/**
 * HOTEL AURORA — Misano Adriatico (RN).
 * Materiale ufficiale consegnato da Claudio: la card «AgriBus Experience».
 * REGOLA: qui dentro finiscono SOLO i dati leggibili sulla card ufficiale.
 * Niente stelle, servizi, recensioni, foto o link dedotti o inventati.
 */

export const AURORA_NOME = "Hotel Aurora";
export const AURORA_TIPO = "Family Hotel";
/** Sulla card ufficiale il logo riporta 2 stelle. */
export const AURORA_STELLE = 2;
export const AURORA_CITTA = "Misano Adriatico (RN)";
export const AURORA_INDIRIZZO = "Via Bramante 2/A";
export const AURORA_INDIRIZZO_COMPLETO = "Via Bramante 2/A, Misano Adriatico (RN)";

export const AURORA_TEL = "+39 331 9624329";
export const AURORA_TEL_HREF = "tel:+393319624329";
export const AURORA_EMAIL = "aurora@familyhotel.it";
export const AURORA_PEC = "hotelmisano@tolinkpec.it";
export const AURORA_SITO = "https://www.familyhotel.it";
export const AURORA_SITO_LABEL = "www.familyhotel.it";
export const AURORA_PIVA = "00321000408";

export const AURORA_INSTAGRAM_HANDLE = "@hotelaurora.misano";
export const AURORA_INSTAGRAM_URL = "https://www.instagram.com/hotelaurora.misano/";

/** Sulla card compare solo il nome della pagina Facebook, non l'indirizzo: resta da incollare. */
export const AURORA_FACEBOOK_NOME = "Hotel Aurora - Family Hotel";
export const AURORA_FACEBOOK_URL: string | null = null;

/** Sulla card c'è il pulsante WhatsApp ma non un numero WhatsApp distinto: da confermare. */
export const AURORA_WHATSAPP_URL: string | null = null;

export const AURORA_MAPPA = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
  "Hotel Aurora Via Bramante 2/A Misano Adriatico",
)}`;

export const AURORA_PAYOFF = "La tua vacanza in famiglia, tra mare e natura";
export const AURORA_CLAIM = "Scopri un'altra Romagna";

export const AURORA_AGRIBUS = {
  titolo: "AgriBus Experience",
  sottotitolo: "Dal mare alla campagna",
  testo:
    "Servizio navetta verso Tenuta Due Tigli, tra natura, tradizioni e prodotti del territorio.",
  capienza: "20 posti",
  destinazione: "Tenuta Due Tigli",
  frasi: ["Viaggia comodo, vivi la natura!", "Piccole gite, grandi emozioni"],
  valori: ["Natura", "Gusto", "Tradizione", "Famiglia"],
};

export const AURORA_PILASTRI = [
  { titolo: "Natura e relax", testo: "La campagna a pochi minuti dalla spiaggia di Misano." },
  { titolo: "Prodotti del territorio", testo: "Sapori e tradizioni della Tenuta Due Tigli." },
  {
    titolo: "Esperienze per tutta la famiglia",
    testo: "Piccole gite pensate per grandi e bambini.",
  },
  { titolo: "Tenuta Due Tigli", testo: "La destinazione della navetta AgriBus." },
];

/** Card ufficiale consegnata da Claudio (pubblicabile così com'è). */
export const AURORA_CARD = {
  file: "/hotel-aurora/01-agribus-experience.jpg",
  titolo: "AgriBus Experience — Dal mare alla campagna",
  descrizione:
    "La card ufficiale dell'Hotel Aurora con il servizio navetta verso la Tenuta Due Tigli.",
};

/** Cosa manca ancora, dichiarato in chiaro invece di essere inventato. */
export const AURORA_DA_CONFERMARE = [
  "Foto reali della struttura (camere, spiaggia, colazione).",
  "Indirizzo della pagina Facebook ufficiale.",
  "Numero WhatsApp, se diverso dal telefono.",
  "Elenco dei servizi e periodi di apertura.",
];
