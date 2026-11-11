/* ────────────────────────────────────────────────────────────────────────────
   TERRITORIO TBH — SANREMO · RIVIERA DEI FIORI

   Le schede nascono dai luoghi già censiti e controllati dell'Area Sanremo
   (api/data/sanremo.ts, «portale a monitor»): stesso archivio, un solo record
   per luogo, adesso nel modello unico della scheda master.

   Vale la regola ferrea di tipi.ts:
     · indirizzi, telefoni, email e siti letti dal SITO UFFICIALE del luogo;
     · coordinate lette da OpenStreetMap sopra un indirizzo già verificato;
     · fotografie: solo gli scatti reali forniti dalla direzione. Dove lo
       scatto non c'è il riquadro resta dichiarato, nessuna immagine ricostruita.
   ──────────────────────────────────────────────────────────────────────────── */

import { scheda, type AttivitaTBH } from "./tipi";

const IMG = "/sanremo";
const FOTO_CLAUDIO = "Fotografia ufficiale fornita dalla direzione TBH";
const OSM = "OpenStreetMap, sopra l'indirizzo in scheda";

export const SANREMO: AttivitaTBH[] = [
  /* ── 🎬 TEATRI E SALE ──────────────────────────────────────────────────── */
  scheda({
    id: "TBH-SR-001",
    slug: "teatro-ariston",
    nome: "Teatro Ariston",
    citta: "sanremo",
    categorie: ["teatri", "eventi"],
    descrizione:
      "Il teatro di via Matteotti dove si svolge il Festival della Canzone Italiana: il punto di riferimento della settimana sanremese.",
    localita: "Sanremo — centro (IM)",
    zona: "Centro",
    indirizzo: "Via Matteotti, 218",
    lat: 43.81751,
    lon: 7.7779584,
    fonteCoordinate: "Teatro Ariston, Via Bartolomeo Asquasciati — OpenStreetMap",
    immagine: `${IMG}/teatro-ariston.jpg`,
    tipoImmagine: "foto",
    fonte: FOTO_CLAUDIO,
  }),

  /* ── 🎭 EVENTI E LOCATION ─────────────────────────────────────────────── */
  scheda({
    id: "TBH-SR-002",
    slug: "palafiori-casa-sanremo",
    nome: "Palafiori — Casa Sanremo",
    citta: "sanremo",
    categorie: ["eventi"],
    descrizione:
      "Il Palafiori ospita l'hospitality e gli spazi incontro della settimana del Festival: interviste, incontri con la stampa, aree brand.",
    localita: "Sanremo — centro (IM)",
    zona: "Centro",
    indirizzo: "Corso Garibaldi, 1",
    lat: 43.8195211,
    lon: 7.7788162,
    fonteCoordinate: "Palafiori, Corso Giuseppe Garibaldi — OpenStreetMap",
    immagine: `${IMG}/palafiori.jpg`,
    tipoImmagine: "foto",
    fonte: FOTO_CLAUDIO,
  }),
  scheda({
    id: "TBH-SR-003",
    slug: "villa-ormond",
    nome: "Villa Ormond",
    citta: "sanremo",
    categorie: ["eventi", "attrazioni"],
    descrizione: "Villa storica con parco, sede di eventi, mostre e appuntamenti congressuali.",
    localita: "Sanremo (IM)",
    indirizzo: "Corso Cavallotti, 113",
    lat: 43.8227041,
    lon: 7.7901922,
    fonteCoordinate: "Villa Ormond, Via Duca degli Abruzzi — OpenStreetMap",
    nota: "Fotografia ufficiale da ricevere: nessuna immagine ricostruita.",
    fonte: OSM,
  }),

  /* ── 🏨 HOTEL ─────────────────────────────────────────────────────────── */
  scheda({
    id: "TBH-SR-004",
    slug: "grand-hotel-des-anglais",
    nome: "Grand Hotel & Des Anglais",
    citta: "sanremo",
    categorie: ["hotel"],
    descrizione:
      "Hotel quattro stelle della Belle Époque, aperto nel 1888, a due passi dal Casinò e dalla Passeggiata Imperatrice.",
    localita: "Sanremo (IM)",
    indirizzo: "Salita Grande Albergo, 8 — 18038 Sanremo",
    lat: 43.8129172,
    lon: 7.7647057,
    fonteCoordinate: "Grand Hotel Des Anglais, Sanremo — OpenStreetMap",
    telefono: "+39 0184 667840",
    email: "info@hoteldesanglais.com",
    sito: "https://www.hoteldesanglais.com/",
    prenotabile: true,
    nota: "Logo e fotografie ufficiali da ricevere. Convenzione TBH da confermare.",
    fonte: "Sito ufficiale hoteldesanglais.com — verifica del 18/09/2026",
  }),

  /* ── 🍸 LOCALI ────────────────────────────────────────────────────────── */
  scheda({
    id: "TBH-SR-005",
    slug: "morgana-bay",
    nome: "Morgana Bay",
    citta: "sanremo",
    categorie: ["locali", "ristoranti"],
    descrizione: "Locale sul mare, riferimento per serate, musica dal vivo e dj set.",
    localita: "Sanremo (IM)",
    nota: "Indirizzo, recapiti, sito e fotografie ufficiali da ricevere: senza indirizzo verificato il punto non viene posizionato sulla mappa.",
  }),

  /* ── 📍 PIAZZE E LUOGHI SIMBOLO ───────────────────────────────────────── */
  scheda({
    id: "TBH-SR-006",
    slug: "piazza-bresca",
    nome: "Piazza Bresca",
    citta: "sanremo",
    categorie: ["attrazioni", "locali"],
    descrizione:
      "La piazza dei locali e dei ristoranti a due passi dal porto: il punto di ritrovo serale della città.",
    localita: "Sanremo — porto (IM)",
    zona: "Porto",
    indirizzo: "Piazza Eroi Bresca",
    lat: 43.8163397,
    lon: 7.7782879,
    fonteCoordinate: "Piazza Bresca — OpenStreetMap",
    immagine: `${IMG}/piazza-bresca.jpg`,
    tipoImmagine: "foto",
    fonte: FOTO_CLAUDIO,
  }),
  scheda({
    id: "TBH-SR-007",
    slug: "piazza-colombo",
    nome: "Piazza Colombo",
    citta: "sanremo",
    categorie: ["attrazioni", "eventi"],
    descrizione:
      "La piazza centrale che durante il Festival ospita palco, eventi e collegamenti in diretta.",
    localita: "Sanremo — centro (IM)",
    zona: "Centro",
    indirizzo: "Piazza Colombo",
    lat: 43.8186456,
    lon: 7.7781136,
    fonteCoordinate: "Piazza Colombo — OpenStreetMap",
    nota: "Fotografia ufficiale da ricevere: nessuna immagine ricostruita.",
    fonte: OSM,
  }),
  scheda({
    id: "TBH-SR-008",
    slug: "piazza-eroi-sanremesi",
    nome: "Piazza Eroi Sanremesi",
    citta: "sanremo",
    categorie: ["attrazioni", "shopping"],
    descrizione: "Piazza del centro, area mercato e collegamento con la zona pedonale.",
    localita: "Sanremo — centro (IM)",
    zona: "Centro",
    indirizzo: "Piazza Eroi Sanremesi",
    lat: 43.8175907,
    lon: 7.7742067,
    fonteCoordinate: "Piazza Eroi Sanremesi — OpenStreetMap",
    nota: "Fotografia ufficiale da ricevere.",
    fonte: OSM,
  }),
  scheda({
    id: "TBH-SR-009",
    slug: "piazza-borromea",
    nome: "Piazza Borromea",
    citta: "sanremo",
    categorie: ["attrazioni"],
    descrizione:
      "Piazza del centro con attività commerciali e forte passaggio nei giorni del Festival.",
    localita: "Sanremo (IM)",
    nota: "Nelle mappe ufficiali non risulta una «Piazza Borromea» a Sanremo: nome e indirizzo da confermare, nessuna coordinata inventata e nessun pulsante mappa.",
  }),
];
