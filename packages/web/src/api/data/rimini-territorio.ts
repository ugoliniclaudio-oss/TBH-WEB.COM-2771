/* ────────────────────────────────────────────────────────────────────────────
   TERRITORIO TBH — RIMINI
   «Dove dormire, mangiare e divertirsi a Rimini»

   REGOLA FERREA rispettata in questo file: nessun dato inventato.
   Indirizzi, telefoni e indirizzi internet qui sotto sono stati letti UNO PER UNO
   dal sito ufficiale dell'attività (verifica del 17/09/2026). Dove il dato sul
   sito ufficiale non esiste, il campo resta `null`: la scheda mostra
   IN ALLESTIMENTO oppure «Immagine in aggiornamento», MAI un valore plausibile
   messo lì per riempire e MAI un pulsante che non porta in nessun posto.

   UN CONTENUTO, UN RECORD: un'attività presente in due categorie (Frontemare è
   ristorante e beach club) ha UN SOLO record e compare in entrambe le fasce
   tramite `categorie`, non due volte scritta a mano.

   Le etichette commerciali (Partner TBH, Convenzionato, Promozione) restano
   `null` fino a conferma dell'accordo: non si dichiara una convenzione che non
   è stata firmata.
   ──────────────────────────────────────────────────────────────────────────── */

/** Etichette commerciali ammesse. Nessun'altra parola va messa sul nastro. */
export type EtichettaTbh = "Partner TBH" | "Convenzionato" | "Promozione";

/** Che cosa c'è nel riquadro: il marchio ufficiale o una fotografia reale. */
export type TipoImmagine = "logo" | "foto";

export type CategoriaRimini = {
  slug: string;
  emoji: string;
  titolo: string;
  /** Colore dell'etichetta di categoria sulla scheda. */
  colore: string;
  /** Riga di servizio sotto il titolo della fascia. */
  testo: string;
};

export type AttivitaRimini = {
  id: string;
  slug: string;
  /** Nome per esteso: è anche il ripiego quando il marchio manca. */
  nome: string;
  /** Una o più categorie: l'attività compare in tutte, restando un solo record. */
  categorie: string[];
  /** Descrizione pubblicata SOLO se ricavata dalla fonte ufficiale. */
  descrizione: string | null;
  /** Località / zona come la scrive il sito ufficiale. */
  localita: string | null;
  /** Indirizzo come lo pubblica il sito ufficiale. */
  indirizzo: string | null;
  /** Telefono come lo pubblica il sito ufficiale. */
  telefono: string | null;
  /** Sito ufficiale verificato raggiungibile. */
  sito: string | null;
  /** File del marchio o della fotografia, già dentro il sito. */
  immagine: string | null;
  tipoImmagine: TipoImmagine | null;
  /**
   * Piastra sotto il marchio. I marchi bianchi su fondo trasparente su piastra
   * chiara sparirebbero: qui si dichiara `"scuro"` e si leggono come sul loro
   * sito. Il file NON viene toccato: cambia solo il fondo del riquadro.
   */
  fondoLogo?: "chiaro" | "scuro";
  /** Prenotazione assistita TBH: `true` dove c'è qualcosa da prenotare. */
  prenotabile: boolean;
  etichetta: EtichettaTbh | null;
  /** Perché un dato manca, oppure che cosa c'è nel riquadro. */
  nota: string | null;
};

export const RIMINI_TITOLO = "Dove dormire, mangiare e divertirsi a Rimini";

export const RIMINI_DESCRIZIONE =
  "Selezione TBH di hotel, ristoranti, beach club, villaggi, aree shopping e portali turistici utili per vivere Rimini e la Riviera.";

export const RIMINI_PERCORSO = "/territorio/rimini/dove-dormire-mangiare-divertirsi";

export const CATEGORIE_RIMINI: CategoriaRimini[] = [
  {
    slug: "hotel",
    emoji: "🏨",
    titolo: "Hotel",
    colore: "#33e0ff",
    testo: "Strutture con sito ufficiale verificato e recapiti letti dalla fonte.",
  },
  {
    slug: "ristoranti",
    emoji: "🍽️",
    titolo: "Ristoranti",
    colore: "#ff8a3d",
    testo: "Cucina di mare e di Romagna, in centro e sul lungomare.",
  },
  {
    slug: "beach",
    emoji: "🏖️",
    titolo: "Beach club e locali",
    colore: "#e8ff00",
    testo: "Stabilimenti, beach bar e locali sul mare di Rimini.",
  },
  {
    slug: "camping",
    emoji: "⛺",
    titolo: "Camping e villaggi",
    colore: "#7dff9b",
    testo: "Villaggi, camping e aree di sosta attrezzate.",
  },
  {
    slug: "shopping",
    emoji: "🛍️",
    titolo: "Shopping e centri commerciali",
    colore: "#ff5fa2",
    testo: "Centri commerciali e outlet dell'area riminese.",
  },
  {
    slug: "info",
    emoji: "ℹ️",
    titolo: "Portali turistici utili",
    colore: "#c9a9ff",
    testo: "Informazione ufficiale su città e Riviera.",
  },
];

const BASE_IMG = "/territorio/rimini";

export const ATTIVITA_RIMINI: AttivitaRimini[] = [
  /* ── 🏨 HOTEL ───────────────────────────────────────────────────────────── */
  {
    id: "TBH-RN-001",
    slug: "hotel-ancora-rimini",
    nome: "Hotel Ancora Rimini",
    categorie: ["hotel"],
    descrizione: "Hotel sul lungomare di viale Regina Elena, zona Marina Centro.",
    localita: "Rimini — Marina Centro (RN)",
    indirizzo: "Viale Regina Elena, 90",
    telefono: "+39 0541 380323",
    sito: "https://www.hotelancorarimini.com/",
    immagine: `${BASE_IMG}/hotel-ancora.png`,
    tipoImmagine: "logo",
    prenotabile: true,
    etichetta: null,
    nota: null,
  },
  {
    id: "TBH-RN-002",
    slug: "hotel-brezza-rimini",
    nome: "Hotel Brezza Rimini",
    categorie: ["hotel"],
    descrizione: null,
    localita: "Rimini (RN)",
    indirizzo: "Viale XXV Marzo 1831, 21 — 47922 Rimini",
    telefono: "+39 0541 141 2959",
    sito: "https://www.hotelbrezza.it/",
    immagine: `${BASE_IMG}/hotel-brezza.png`,
    tipoImmagine: "logo",
    prenotabile: true,
    etichetta: null,
    nota: null,
  },
  {
    id: "TBH-RN-003",
    slug: "hotel-paloma-rimini",
    nome: "Hotel Paloma Rimini",
    categorie: ["hotel"],
    descrizione: null,
    localita: "Rimini (RN)",
    indirizzo: "Via Ortigara, 28 — 47921 Rimini",
    telefono: "+39 0541 1840410",
    sito: "https://www.hotelpalomarimini.it/",
    immagine: `${BASE_IMG}/hotel-paloma.png`,
    tipoImmagine: "logo",
    prenotabile: true,
    etichetta: null,
    nota: null,
  },
  {
    id: "TBH-RN-004",
    slug: "sovrana-hotel-spa-rimini",
    nome: "Sovrana Hotel & SPA Rimini",
    categorie: ["hotel"],
    descrizione: "Hotel con centro benessere, zona viale Misurata.",
    localita: "Rimini (RN)",
    indirizzo: "Viale Misurata, 14 — 47921 Rimini",
    telefono: "+39 0541 391310",
    sito: "https://www.sovranahotel.it/",
    immagine: `${BASE_IMG}/sovrana-hotel-spa.png`,
    tipoImmagine: "logo",
    fondoLogo: "scuro",
    prenotabile: true,
    etichetta: null,
    nota: null,
  },
  {
    id: "TBH-RN-005",
    slug: "club-family-hotel-rimini-village",
    nome: "Club Family Hotel Rimini Village",
    /* Resta nella sola fascia Hotel: è un hotel per famiglie, non un camping. */
    categorie: ["hotel"],
    descrizione: "Hotel per famiglie a Torre Pedrera.",
    localita: "Torre Pedrera — Rimini (RN)",
    indirizzo: "Via Tolemaide, 4 — 47922 Torre Pedrera",
    telefono: "+39 0547 051008",
    sito: "https://www.clubfamilyhotelrimini.it/",
    immagine: `${BASE_IMG}/club-family-hotel-rimini-village.png`,
    tipoImmagine: "logo",
    prenotabile: true,
    etichetta: null,
    nota: null,
  },

  /* ── 🍽️ RISTORANTI ─────────────────────────────────────────────────────── */
  {
    id: "TBH-RN-006",
    slug: "frontemare-beach-club",
    nome: "Frontemare Beach Club",
    /* Un solo record, due fasce: ristorante e beach club. */
    categorie: ["ristoranti", "beach"],
    descrizione: "Beach club con ristorante sul lungomare di Rimini.",
    localita: "Rimini (RN)",
    indirizzo: "Viale Principe di Piemonte, 30",
    telefono: "+39 0541 478542",
    sito: "https://www.frontemarerimini.it/",
    immagine: `${BASE_IMG}/frontemare-beach-club.webp`,
    tipoImmagine: "logo",
    prenotabile: true,
    etichetta: null,
    nota: null,
  },
  {
    id: "TBH-RN-007",
    slug: "ristorante-sabbioni",
    nome: "Ristorante Sabbioni",
    categorie: ["ristoranti"],
    descrizione: null,
    localita: "Rimini (RN)",
    indirizzo: "Viale Regina Elena, 13 — 47921 Rimini",
    telefono: "+39 0541 393527",
    sito: null,
    immagine: null,
    tipoImmagine: null,
    prenotabile: true,
    etichetta: null,
    nota: "Sito ufficiale non presente alla verifica: indirizzo e telefono sono reali, il marchio non è pubblicato da nessuna fonte ufficiale.",
  },
  {
    id: "TBH-RN-008",
    slug: "il-re-dei-mari",
    nome: "Il Re dei Mari",
    categorie: ["ristoranti"],
    descrizione: null,
    localita: "Rimini (RN)",
    indirizzo: "Viale Regina Elena, 167",
    telefono: "+39 0541 926325",
    sito: "https://ilredeimari.it/",
    immagine: `${BASE_IMG}/il-re-dei-mari.svg`,
    tipoImmagine: "logo",
    fondoLogo: "scuro",
    prenotabile: true,
    etichetta: null,
    nota: null,
  },
  {
    id: "TBH-RN-009",
    slug: "ristorante-romagna-mia",
    nome: "Ristorante Romagna Mia",
    categorie: ["ristoranti"],
    descrizione: null,
    localita: "Rimini (RN)",
    indirizzo: null,
    telefono: null,
    sito: null,
    immagine: null,
    tipoImmagine: null,
    prenotabile: false,
    etichetta: null,
    nota: "Dato in verifica: a Rimini risultano due attività con questo nome e indirizzi diversi. Nessun recapito viene pubblicato prima della conferma di quale sia la struttura indicata.",
  },
  {
    id: "TBH-RN-010",
    slug: "la-mi-mama",
    nome: "La Mi Mama",
    categorie: ["ristoranti"],
    descrizione: "Ristorante in centro storico, zona piazza Malatesta.",
    localita: "Rimini centro (RN)",
    indirizzo: "Via Poletti, 32 — 47923 Rimini",
    telefono: "+39 0541 787509",
    sito: "https://www.lamimama.it/",
    immagine: `${BASE_IMG}/la-mi-mama.png`,
    tipoImmagine: "logo",
    fondoLogo: "scuro",
    prenotabile: true,
    etichetta: null,
    nota: null,
  },

  /* ── 🏖️ BEACH CLUB E LOCALI ────────────────────────────────────────────── */
  {
    id: "TBH-RN-011",
    slug: "libra-beach-village",
    nome: "Libra Beach Village",
    categorie: ["beach"],
    descrizione: null,
    localita: "Rimini (RN)",
    indirizzo: "Lungomare Giuseppe di Vittorio, 8/8B — 47921 Rimini",
    telefono: "+39 338 4151215",
    sito: "https://www.librarimini.it/",
    immagine: `${BASE_IMG}/libra-beach-village.png`,
    tipoImmagine: "logo",
    prenotabile: true,
    etichetta: null,
    nota: null,
  },
  {
    id: "TBH-RN-012",
    slug: "lazy-beach-club",
    nome: "Lazy Beach Club",
    categorie: ["beach"],
    descrizione: "Beach club a Rivabella di Rimini.",
    localita: "Rivabella — Rimini (RN)",
    indirizzo: "Viale Paolo Toscanelli, 39a — 47921 Rimini",
    telefono: "+39 351 429 1955",
    sito: "https://www.lazyclub.it/",
    immagine: `${BASE_IMG}/lazy-beach-club.png`,
    tipoImmagine: "logo",
    prenotabile: true,
    etichetta: null,
    nota: null,
  },
  {
    id: "TBH-RN-013",
    slug: "turquoise-beach-club",
    nome: "Turquoise Beach Club",
    categorie: ["beach"],
    descrizione: null,
    localita: "Rimini (RN)",
    indirizzo: "Lungomare Claudio Tintori, 6 — 47921 Rimini",
    telefono: "+39 327 889 9487",
    sito: null,
    immagine: null,
    tipoImmagine: null,
    prenotabile: true,
    etichetta: null,
    nota: "Sito ufficiale non presente alla verifica: l'attività comunica solo sui canali social. Indirizzo e telefono sono verificati, il marchio non è pubblicato in un file ufficiale.",
  },
  {
    id: "TBH-RN-014",
    slug: "tortuga-beach",
    nome: "Tortuga Beach",
    categorie: ["beach"],
    descrizione: "Spiaggia e beach bar al bagno 67 di Rimini.",
    localita: "Rimini (RN)",
    indirizzo: "Lungomare Giuseppe di Vittorio, 16 (bagno 67) — 47921 Rimini",
    telefono: "+39 334 8408293",
    sito: "https://tortugabeach.it/",
    immagine: `${BASE_IMG}/tortuga-beach.jpg`,
    tipoImmagine: "foto",
    prenotabile: true,
    etichetta: null,
    nota: "Il sito ufficiale non pubblica un marchio: nel riquadro c'è una fotografia reale della spiaggia.",
  },
  {
    id: "TBH-RN-015",
    slug: "kalima-beach-club",
    nome: "Kalima Beach Club",
    categorie: ["beach"],
    descrizione: "Beach club al bagno 17 di Viserba.",
    localita: "Viserba — Rimini (RN)",
    indirizzo: "Viale Paolo Toscanelli, 71 — 47922 Rimini",
    telefono: "+39 0541 732648",
    sito: "https://www.kalimabeachclubviserba.it/",
    immagine: `${BASE_IMG}/kalima-beach-club.jpg`,
    tipoImmagine: "logo",
    prenotabile: true,
    etichetta: null,
    nota: null,
  },
  {
    id: "TBH-RN-016",
    slug: "coconuts-rimini",
    nome: "Coconuts Rimini",
    categorie: ["beach"],
    descrizione: "Locale sul mare in lungomare Claudio Tintori.",
    localita: "Rimini (RN)",
    indirizzo: "Lungomare Claudio Tintori, 5 — 47921 Rimini",
    telefono: "+39 379 2570961",
    sito: "https://coconuts.it/",
    immagine: `${BASE_IMG}/coconuts-rimini.svg`,
    tipoImmagine: "logo",
    fondoLogo: "scuro",
    prenotabile: true,
    etichetta: null,
    nota: null,
  },

  /* ── ⛺ CAMPING E VILLAGGI ─────────────────────────────────────────────── */
  {
    id: "TBH-RN-017",
    slug: "club-del-sole-rimini-family-resort",
    /* Nome come lo scrive il sito ufficiale: "Rimini Family Resort".
       L'indirizzo web conserva ancora il vecchio percorso "...-family-village". */
    nome: "Club del Sole — Rimini Family Resort",
    categorie: ["camping"],
    descrizione: "Villaggio e camping del gruppo Club del Sole, a Viserba.",
    localita: "Viserba — Rimini (RN)",
    indirizzo: "Viale Paolo Toscanelli, 112 — 47922 Rimini",
    telefono: "+39 0541 732882",
    sito: "https://www.clubdelsole.com/it/destinazioni/emilia-romagna-romagna-e-bologna/rimini-family-village",
    immagine: null,
    tipoImmagine: null,
    prenotabile: true,
    etichetta: null,
    nota: "Marchio del villaggio non disponibile: il sito ufficiale pubblica soltanto il logo del gruppo, non quello della struttura di Rimini.",
  },
  {
    id: "TBH-RN-018",
    slug: "camper-park-rimini",
    nome: "Camper Park Rimini",
    categorie: ["camping"],
    descrizione: "Area di sosta attrezzata per camper.",
    localita: "Rimini (RN)",
    indirizzo: "Viale Principe di Piemonte, 65",
    telefono: "+39 389 198 3488",
    sito: "https://www.camperparkrimini.it/",
    immagine: `${BASE_IMG}/camper-park-rimini.png`,
    tipoImmagine: "logo",
    prenotabile: true,
    etichetta: null,
    nota: null,
  },

  /* ── 🛍️ SHOPPING ───────────────────────────────────────────────────────── */
  {
    id: "TBH-RN-019",
    slug: "centro-commerciale-le-befane",
    nome: "Centro Commerciale Le Befane",
    categorie: ["shopping"],
    descrizione: "Centro commerciale di Rimini.",
    localita: "Rimini (RN)",
    indirizzo: "Via Caduti di Nassiriya, 20 — 47924 Rimini",
    telefono: "+39 0541 387995",
    sito: "https://www.lebefane.it/",
    immagine: `${BASE_IMG}/le-befane.png`,
    tipoImmagine: "logo",
    prenotabile: false,
    etichetta: null,
    nota: null,
  },
  {
    id: "TBH-RN-020",
    slug: "centro-commerciale-i-malatesta",
    nome: "Centro Commerciale I Malatesta",
    categorie: ["shopping"],
    descrizione: "Centro commerciale sulla via Emilia.",
    localita: "Rimini (RN)",
    indirizzo: "Via Emilia, 150 — Rimini",
    telefono: "+39 331 1242351",
    sito: "https://www.centroimalatesta.it/",
    immagine: `${BASE_IMG}/i-malatesta.png`,
    tipoImmagine: "logo",
    prenotabile: false,
    etichetta: null,
    nota: null,
  },
  {
    id: "TBH-RN-021",
    slug: "marecchia-center",
    nome: "Marecchia Center",
    categorie: ["shopping"],
    descrizione: null,
    localita: "Rimini (RN)",
    indirizzo: null,
    telefono: null,
    sito: "http://www.marecchiacenter.it/index2.html",
    immagine: `${BASE_IMG}/marecchia-center.jpg`,
    tipoImmagine: "foto",
    prenotabile: false,
    etichetta: null,
    nota: "Il sito ufficiale non pubblica né indirizzo né telefono: recapiti in verifica. Nel riquadro c'è l'unica immagine pubblicata dal sito, non un marchio.",
  },
  {
    id: "TBH-RN-022",
    slug: "time-outlet-rimini",
    nome: "Time Outlet Rimini",
    categorie: ["shopping"],
    descrizione: null,
    localita: "Rimini (RN)",
    indirizzo: null,
    telefono: null,
    sito: "https://timeoutlet.it/",
    immagine: `${BASE_IMG}/time-outlet.svg`,
    tipoImmagine: "logo",
    prenotabile: false,
    etichetta: null,
    nota: "Indirizzo e telefono non pubblicati sul sito ufficiale: recapiti in verifica, non vengono ripresi da fonti non ufficiali.",
  },

  /* ── ℹ️ PORTALI TURISTICI ──────────────────────────────────────────────── */
  {
    id: "TBH-RN-023",
    slug: "rimini-turismo",
    nome: "Rimini Turismo",
    categorie: ["info"],
    descrizione: "Portale turistico della città di Rimini.",
    localita: "Rimini (RN)",
    indirizzo: null,
    telefono: null,
    sito: "https://riminiturismo.it/",
    immagine: `${BASE_IMG}/rimini-turismo.png`,
    tipoImmagine: "logo",
    prenotabile: false,
    etichetta: null,
    nota: "Portale informativo: i recapiti degli uffici non sono stati ripresi in scheda, si consultano sul sito.",
  },
  {
    id: "TBH-RN-024",
    slug: "riviera-di-rimini",
    nome: "Riviera di Rimini",
    categorie: ["info"],
    descrizione: "Portale turistico della Riviera di Rimini.",
    localita: "Rimini (RN)",
    indirizzo: "Piazzale Federico Fellini, 3 — 47921 Rimini",
    telefono: null,
    sito: "https://riviera.rimini.it/it",
    immagine: `${BASE_IMG}/riviera-di-rimini.png`,
    tipoImmagine: "logo",
    prenotabile: false,
    etichetta: null,
    nota: null,
  },
];

/** Le attività di una fascia, nell'ordine in cui sono state elencate. */
export function attivitaPerCategoria(slug: string): AttivitaRimini[] {
  return ATTIVITA_RIMINI.filter((a) => a.categorie.includes(slug));
}

/** Indirizzo internet della mappa: si costruisce solo su un indirizzo verificato. */
export function urlMappa(a: AttivitaRimini): string | null {
  const indirizzo = (a.indirizzo ?? "").trim();
  if (!indirizzo) return null;
  const query = `${a.nome}, ${indirizzo}`;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

/** Collegamento per chiamare: solo su un numero letto dalla fonte ufficiale. */
export function urlTelefono(a: AttivitaRimini): string | null {
  const t = (a.telefono ?? "").replace(/[^\d+]/g, "");
  return t.length >= 8 ? `tel:${t}` : null;
}

/** Quante schede sono complete e quante hanno ancora un dato da ricevere. */
export function contaAllestimento() {
  const daCompletare = ATTIVITA_RIMINI.filter(
    (a) => !a.immagine || !a.sito || !a.indirizzo || !a.telefono || !a.descrizione,
  ).length;
  return { totale: ATTIVITA_RIMINI.length, daCompletare };
}
