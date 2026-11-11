/**
 * AREA SANREMO — brief "PORTALE A MONITOR", punto 2. Mappa editoriale + commerciale, "stile DM".
 *
 * REGOLE RISPETTATE ALLA LETTERA:
 * · foto: SOLO gli scatti forniti da Claudio (Teatro Ariston, Palafiori, Piazza Bresca).
 *   Dove non c'è la foto reale il riquadro resta dichiarato "foto ufficiale da ricevere";
 * · nessun evento, data, ospite o contenuto inventato: gli eventi compaiono quando arrivano;
 * · stato commerciale: TUTTI "disponibile-da-confermare" per scelta di Claudio, finché non manda
 *   l'elenco reale DISPONIBILE / IN TRATTATIVA / ASSEGNATO;
 * · nessun contatto o URL inventato: i luoghi non hanno sito ufficiale finché non lo riceviamo.
 */

import type { StatoSpazio } from "./sport";

export type LuogoSanremo = {
  slug: string;
  nome: string;
  tipo: string;
  /** Descrizione fattuale, senza promesse e senza dati inventati. */
  descrizione: string;
  indirizzo: string | null;
  /** Foto reale in /public/sanremo. null = riquadro dichiarato, nessuna immagine inventata. */
  foto: string | null;
  /** Colore del pin sulla mappa. */
  colore: string;
  /** Posizione del pin sulla mappa schematica, in percentuale (x, y). Riferimento: mappa fornita. */
  pin: { x: number; y: number };
  /**
   * POSIZIONAMENTO PRECISO — ordine di Claudio (29/08/2026): «METTERE IN MANIERA PRECISA
   * SULLA MAPPA I CONTENUTI INSERITI». Le coordinate sono geocodificate dagli indirizzi reali
   * già presenti in scheda tramite OpenStreetMap/Nominatim. Dove l'indirizzo non è confermato
   * lat/lon restano null e il luogo è dichiarato NON posizionato: nessuna coordinata inventata.
   */
  lat: number | null;
  lon: number | null;
  fonteCoordinate: string | null;
  motivoNonPosizionato?: string;
  /** Monitor video del luogo: null = in allestimento. */
  video: string | null;
  /** Spazi commerciali del luogo. */
  spazi: { titolo: string; descrizione: string; stato: StatoSpazio }[];
  note: string[];
};

const SPAZI_STANDARD = (luogo: string) => [
  {
    titolo: `Spazio monitor — ${luogo}`,
    descrizione:
      "Presenza nel mini monitor video del luogo: logo ufficiale, nome per esteso e pagina interna dedicata.",
    stato: "disponibile-da-confermare" as StatoSpazio,
  },
  {
    titolo: `Spazio contenuti DM — ${luogo}`,
    descrizione:
      "Presenza nei contenuti editoriali e nelle interviste realizzate sul luogo da DM Comunicazioni (media partner autonomo).",
    stato: "disponibile-da-confermare" as StatoSpazio,
  },
  {
    titolo: `Vetrina attività — ${luogo}`,
    descrizione: "Scheda attività collegata al luogo, con sito e canali ufficiali quando disponibili.",
    stato: "disponibile-da-confermare" as StatoSpazio,
  },
];

export const LUOGHI_SANREMO: LuogoSanremo[] = [
  {
    slug: "teatro-ariston",
    nome: "Teatro Ariston",
    tipo: "Teatro · Cuore del Festival",
    descrizione:
      "Il teatro di Via Matteotti dove si svolge il Festival della Canzone Italiana: il punto di riferimento della settimana sanremese.",
    indirizzo: "Via Matteotti 218, Sanremo (IM)",
    foto: "/sanremo/teatro-ariston.jpg",
    colore: "#ff2b2b",
    pin: { x: 30, y: 46 },
    lat: 43.81751,
    lon: 7.7779584,
    fonteCoordinate: "Teatro Ariston, Via Bartolomeo Asquasciati — OpenStreetMap",
    video: null,
    spazi: SPAZI_STANDARD("Teatro Ariston"),
    note: ["Foto fornita da Claudio."],
  },
  {
    slug: "palafiori-casa-sanremo",
    nome: "Palafiori — Casa Sanremo",
    tipo: "Centro congressi · Hospitality del Festival",
    descrizione:
      "Il Palafiori ospita l'hospitality e gli spazi incontro della settimana del Festival: interviste, incontri con la stampa, aree brand.",
    indirizzo: "Corso Garibaldi 1, Sanremo (IM)",
    foto: "/sanremo/palafiori.jpg",
    colore: "#33e0ff",
    pin: { x: 46, y: 20 },
    lat: 43.8195211,
    lon: 7.7788162,
    fonteCoordinate: "Palafiori, Corso Giuseppe Garibaldi — OpenStreetMap",
    video: null,
    spazi: SPAZI_STANDARD("Palafiori — Casa Sanremo"),
    note: ["Foto fornita da Claudio."],
  },
  {
    slug: "piazza-bresca",
    nome: "Piazza Bresca",
    tipo: "Piazza · Locali e ristorazione",
    descrizione:
      "La piazza dei locali e dei ristoranti a due passi dal porto: il punto di ritrovo serale della città.",
    indirizzo: "Piazza Eroi Bresca, Sanremo (IM)",
    foto: "/sanremo/piazza-bresca.jpg",
    colore: "#ff8a00",
    pin: { x: 24, y: 62 },
    lat: 43.8163397,
    lon: 7.7782879,
    fonteCoordinate: "Piazza Bresca — OpenStreetMap",
    video: null,
    spazi: SPAZI_STANDARD("Piazza Bresca"),
    note: ["Foto fornita da Claudio."],
  },
  {
    slug: "piazza-colombo",
    nome: "Piazza Colombo",
    tipo: "Piazza · Palco e eventi",
    descrizione:
      "La piazza centrale che durante il Festival ospita palco, eventi e collegamenti in diretta.",
    indirizzo: "Piazza Colombo, Sanremo (IM)",
    foto: null,
    colore: "#d7ff00",
    pin: { x: 38, y: 34 },
    lat: 43.8186456,
    lon: 7.7781136,
    fonteCoordinate: "Piazza Colombo — OpenStreetMap",
    video: null,
    spazi: SPAZI_STANDARD("Piazza Colombo"),
    note: ["Foto ufficiale da ricevere: nessuna immagine ricostruita."],
  },
  {
    slug: "hotel-des-anglais",
    nome: "Grand Hotel & Des Anglais",
    tipo: "Hotel · Ospitalità",
    descrizione:
      "Hotel quattro stelle della Belle Époque (1888) a due passi dal Casinò e dalla Passeggiata Imperatrice.",
    indirizzo: "Salita Grande Albergo, 8 — 18038 Sanremo (IM)",
    foto: null,
    colore: "#845ef7",
    pin: { x: 58, y: 52 },
    lat: 43.8129172,
    lon: 7.7647057,
    fonteCoordinate: "Grand Hotel Des Anglais, Sanremo — OpenStreetMap",
    video: null,
    spazi: SPAZI_STANDARD("Grand Hotel & Des Anglais"),
    note: [
      "Nome, indirizzo, telefono ed email letti dal sito ufficiale hoteldesanglais.com il 18/09/2026.",
      "Convenzione e condizioni da confermare prima della pubblicazione.",
    ],
  },
  {
    slug: "villa-ormond",
    nome: "Villa Ormond",
    tipo: "Villa storica · Eventi e congressi",
    descrizione: "Villa storica con parco, sede di eventi, mostre e appuntamenti congressuali.",
    indirizzo: "Corso Cavallotti 113, Sanremo (IM)",
    foto: null,
    colore: "#12b886",
    pin: { x: 70, y: 30 },
    lat: 43.8227041,
    lon: 7.7901922,
    fonteCoordinate: "Villa Ormond, Via Duca degli Abruzzi — OpenStreetMap",
    video: null,
    spazi: SPAZI_STANDARD("Villa Ormond"),
    note: ["Foto ufficiale da ricevere."],
  },
  {
    slug: "morgana-bay",
    nome: "Morgana Bay",
    tipo: "Locale · Musica e serate",
    descrizione: "Locale sul mare, riferimento per serate, musica dal vivo e dj set.",
    indirizzo: "Sanremo (IM) — indirizzo esatto da confermare",
    foto: null,
    colore: "#ff3df0",
    pin: { x: 62, y: 70 },
    lat: null,
    lon: null,
    fonteCoordinate: null,
    motivoNonPosizionato: "Indirizzo esatto non confermato: il luogo NON viene posizionato sulla mappa.",
    video: null,
    spazi: SPAZI_STANDARD("Morgana Bay"),
    note: ["Foto e canali ufficiali da ricevere."],
  },
  {
    slug: "piazza-borromea",
    nome: "Piazza Borromea",
    tipo: "Piazza · Attività e passaggio",
    descrizione: "Piazza del centro con attività commerciali e forte passaggio nei giorni del Festival.",
    indirizzo: "Piazza Borromea, Sanremo (IM)",
    foto: null,
    colore: "#4dabf7",
    pin: { x: 18, y: 30 },
    lat: null,
    lon: null,
    fonteCoordinate: null,
    motivoNonPosizionato: "Nelle mappe ufficiali non risulta una \"Piazza Borromea\" a Sanremo: nome/indirizzo da confermare, nessuna coordinata inventata.",
    video: null,
    spazi: SPAZI_STANDARD("Piazza Borromea"),
    note: ["Foto ufficiale da ricevere."],
  },
  {
    slug: "piazza-eroi-sanremesi",
    nome: "Piazza Eroi Sanremesi",
    tipo: "Piazza · Mercato e centro città",
    descrizione: "Piazza del centro, area mercato e collegamento con la zona pedonale.",
    indirizzo: "Piazza Eroi Sanremesi, Sanremo (IM)",
    foto: null,
    colore: "#f59f00",
    pin: { x: 44, y: 58 },
    lat: 43.8175907,
    lon: 7.7742067,
    fonteCoordinate: "Piazza Eroi Sanremesi — OpenStreetMap",
    video: null,
    spazi: SPAZI_STANDARD("Piazza Eroi Sanremesi"),
    note: ["Foto ufficiale da ricevere."],
  },
];

export const SANREMO_NOTA =
  "Mappa editoriale e commerciale in costruzione. Le foto pubblicate sono quelle reali fornite dalla direzione; dove manca lo scatto ufficiale il riquadro resta dichiarato. Tutti gli spazi commerciali sono indicati come disponibili DA CONFERMARE: lo stato reale (disponibile, in trattativa, assegnato) viene pubblicato solo su indicazione della direzione commerciale.";

export const MAPPA_RIFERIMENTO = "/sanremo/mappa-riferimento.jpg";

export function luogoSanremo(slug: string) {
  return LUOGHI_SANREMO.find((l) => l.slug === slug) ?? null;
}
