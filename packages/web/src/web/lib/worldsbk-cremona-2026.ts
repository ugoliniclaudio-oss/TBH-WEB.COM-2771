/**
 * WORLDSBK 2026 · EICMA ITALIAN ROUND — CREMONA CIRCUIT
 *
 * Fonte: comunicato ufficiale del Cremona Circuit («2 WEEKS TO GO — PRONTA LA MAPPA
 * DEL WORLDSBK») consegnato da Claudio il 15/09/2026, riportato alla lettera.
 * Date, denominazione del round e indirizzo verificati sulle fonti ufficiali
 * (worldsbk.com/en/calendar/event/2026-CRE e cremonacircuit.it/worldsbk) il 15/09/2026.
 *
 * REGOLA: qui si riporta solo ciò che è scritto nel comunicato. La mappa ufficiale è
 * un'immagine del circuito e NON ci è stata consegnata: si rimanda al canale ufficiale,
 * non se ne pubblica una versione rifatta o inventata.
 */

export const WSBK_ROUND = "EICMA Italian Round";
export const WSBK_CAMPIONATO = "MOTUL FIM Superbike World Championship";
export const WSBK_ROUND_NUMERO = "Round 10 del Mondiale 2026";
export const WSBK_DATE = "25 · 26 · 27 settembre 2026";
export const WSBK_INDIRIZZO = "Cremona Circuit — Strada Giuseppina 2, San Martino del Lago (CR)";
export const WSBK_VERIFICATO_IL = "15/09/2026";

/** Link ufficiali verificati il 15/09/2026: aperti in scheda nuova, nessuna copia interna. */
export const WSBK_LINK = {
  circuito: "https://cremonacircuit.it/worldsbk/",
  circuitoHome: "https://cremonacircuit.it/",
  mondiale: "https://www.worldsbk.com/en/calendar/event/2026-CRE",
  biglietti: "https://tickets.worldsbk.com/en/66578-italy/",
  facebook: "https://www.facebook.com/cremonacircuit/",
  mappaGoogle:
    "https://www.google.com/maps/search/?api=1&query=Cremona+Circuit+Strada+Giuseppina+2+San+Martino+del+Lago",
};

/** Modulo ufficiale di accredito lavoro: è il modulo TBH, non un modulo del circuito. */
export const WSBK_MODULO_ACCREDITO = "https://form.jotform.com/262572912134051";

export type AreaParcheggio = {
  sigla: string;
  nome: string;
  colore: string;
  testo: string;
  riservato: boolean;
};

/** Aree parcheggio come da mappa ufficiale, colori del comunicato. */
export const WSBK_PARCHEGGI: AreaParcheggio[] = [
  {
    sigla: "P",
    nome: "Free Parking",
    colore: "#3b82f6",
    testo: "Parcheggio principale gratuito per il pubblico.",
    riservato: false,
  },
  {
    sigla: "P",
    nome: "Free Parking moto e camper",
    colore: "#3b82f6",
    testo: "Parcheggio gratuito per moto e camper.",
    riservato: false,
  },
  {
    sigla: "P1",
    nome: "Reserved Staff Parking",
    colore: "#ef4444",
    testo:
      "Area riservata a staff e persone autorizzate, con spazi anche per persone con disabilità.",
    riservato: true,
  },
  {
    sigla: "P2",
    nome: "Reserved Guest Parking",
    colore: "#f59e0b",
    testo: "Parcheggio riservato a staff, ospiti e persone autorizzate.",
    riservato: true,
  },
];

export const WSBK_PARCHEGGI_NOTA =
  "Prima di partire, controllate sulla mappa il parcheggio di riferimento e il relativo accesso al circuito.";

export type AreaEvento = {
  id: string;
  titolo: string;
  sottotitolo: string;
  voci: string[];
  nota?: string;
};

/** Le aree del weekend descritte nel comunicato ufficiale. */
export const WSBK_AREE: AreaEvento[] = [
  {
    id: "paddock",
    titolo: "Paddock & Paddock Show",
    sottotitolo: "Il cuore del weekend, accessibile al pubblico",
    voci: [
      "Hospitality e truck dei team, per vivere da vicino l'atmosfera del Mondiale",
      "Paddock Show con parco chiuso, podio, aree food & drink e stand espositivi",
      "Fra gli stand, quello di «2 tempi bei tempi»",
    ],
    nota: "È qui che si festeggia con i piloti sotto al podio.",
  },
  {
    id: "village",
    titolo: "Cremona Village",
    sottotitolo: "Area dedicata a moto e intrattenimento",
    voci: [
      "Demo Ride Minicross per bambini e ragazzi",
      "Attività dedicate alle donne e alla moto, con l'istruttrice Chantal Pavoni dal Mondiale Motocross Femminile",
      "Espositori e stand",
    ],
  },
  {
    id: "food",
    titolo: "Food & Drink",
    sottotitolo: "Punti ristoro indicati sulla mappa",
    voci: [
      "Food truck e punti ristoro nelle Aree 1 e 2, tra le tribune, e nel Paddock Show",
      "Bar Stradivari, accanto al Cremona Village, con una selezione di menù dedicati al weekend",
      "Menù bambini al Bar Stradivari",
    ],
  },
  {
    id: "tribune",
    titolo: "Aree tribune",
    sottotitolo: "Le aree dedicate al pubblico",
    voci: [
      "Tribune di Zona 1 e Zona 2 per i biglietti circolari",
      "Tribuna VIP sopra il rettilineo, dedicata al biglietto VIP",
    ],
  },
];

export const WSBK_MAPPA_AVVISO =
  "La mappa ufficiale di paddock, parcheggi, tribune e Cremona Village è pubblicata dal Cremona Circuit sui suoi canali: si apre dal pulsante qui sotto. Noi non ne pubblichiamo una copia rifatta — vale solo quella ufficiale del circuito.";
