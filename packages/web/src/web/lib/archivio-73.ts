/* ────────────────────────────────────────────────────────────────────────────
   ARCHIVIO 73 ASSET + PACCHETTO «13 CANALI» (TBH-061…073) — importazione 15/10/2026.

   Fonte: due ZIP inviati da Claudio (catalogo_73.json/csv + canali_61_73.json).
   Le immagini sono gli ORIGINALI, copiati senza modifiche in
   public/brand/archivio-73/ con il loro codice (TBH-001…073).

   REGOLE (da ISTRUZIONI_RUNABLE.txt):
   - 73 asset ≠ 73 canali: marchi esterni, foto personali, varianti e duplicati
     NON diventano canali TBH.
   - Nessun URL inventato: le destinazioni sono SOLO pagine che esistono già
     nel sito. Dove non c'è una pagina → bozza senza link.
   - Ogni associazione è una PROPOSTA: niente va nel palinsesto vero, in home o
     nel menu finché Claudio non approva.

   ATTENZIONE: i codici «TBH-0xx» di questo archivio sono codici di FILE.
   Non coincidono con i codici del registro società (TBH-001 = Touch
   Communications, …, TBH-008 = R.F.A.). Per questo a schermo si scrive
   sempre «ASSET TBH-0xx».

   Ogni nome è stato verificato guardando l'immagine: dove il nome del CSV
   non corrisponde al file, c'è `nomeVerificato` e l'avviso a schermo.
   ──────────────────────────────────────────────────────────────────────────── */

export const CARTELLA_ARCHIVIO = "/brand/archivio-73";

export type StatoAsset =
  | "tbh-pagina"
  | "tbh-bozza"
  | "variante"
  | "duplicato"
  | "rubrica"
  | "conflitto"
  | "collegato"
  | "esterno"
  | "foto"
  | "grafica"
  | "da-verificare";

export const STATO_ASSET: Record<StatoAsset, { etichetta: string; spiega: string; colore: string }> = {
  "tbh-pagina": {
    etichetta: "MARCHIO TBH · PAGINA ESISTENTE",
    spiega: "Marchio del gruppo con una pagina già pubblicata nel sito.",
    colore: "#d7ff00",
  },
  "tbh-bozza": {
    etichetta: "MARCHIO TBH · SENZA PAGINA",
    spiega: "Marchio del gruppo che nel sito non ha ancora una pagina: resta in bozza, senza link.",
    colore: "#f5c542",
  },
  variante: {
    etichetta: "VARIANTE",
    spiega: "Seconda grafica di un marchio già presente: non crea un marchio nuovo.",
    colore: "#9fd3ff",
  },
  duplicato: {
    etichetta: "DUPLICATO",
    spiega: "Stessa immagine (o quasi) di un altro asset: non si pubblica due volte.",
    colore: "#9aa0a6",
  },
  rubrica: {
    etichetta: "RUBRICA TOUCH MUSIC",
    spiega: "Logo della rubrica TOUCH MUSIC: mai sui canali TOUCH RADIO / TOUCH TV.",
    colore: "#e86bff",
  },
  conflitto: {
    etichetta: "BLOCCATO · REGOLA CANALI",
    spiega: "Riporta «Touch Music Radio»: non si assegna a TOUCH RADIO senza il tuo sì.",
    colore: "#ff8a3d",
  },
  collegato: {
    etichetta: "STRUTTURA / EMITTENTE NEL SITO",
    spiega: "Non è un marchio TBH, ma la scheda esiste già (Circuito o anagrafica): il logo potrebbe andare lì.",
    colore: "#7ee3b0",
  },
  esterno: {
    etichetta: "MARCHIO ESTERNO",
    spiega: "Marchio di terzi: non si pubblica come canale TBH.",
    colore: "#c7c7c7",
  },
  foto: {
    etichetta: "FOTO PERSONALE",
    spiega: "Foto di persona: non si pubblica come canale.",
    colore: "#c7c7c7",
  },
  grafica: {
    etichetta: "GRAFICA / SCREENSHOT",
    spiega: "Illustrazione o schermata, non un marchio.",
    colore: "#c7c7c7",
  },
  "da-verificare": {
    etichetta: "DA VERIFICARE",
    spiega: "Serve la tua conferma su cosa sia e dove vada.",
    colore: "#ff8a3d",
  },
};

export type Destinazione = { href: string; label: string };

export type AssetArchivio = {
  codice: string;
  /** Nome scritto nel catalogo_73.csv. */
  nomeCsv: string;
  /** Presente solo quando l'immagine NON corrisponde al nome del CSV. */
  nomeVerificato?: string;
  file: string;
  originale: string;
  larghezza: number;
  altezza: number;
  bytes: number;
  stato: StatoAsset;
  /** Asset canonico del marchio (per varianti e duplicati). */
  canonico?: string;
  /** Pagina ESISTENTE proposta. Null = nessuna pagina: bozza. */
  destinazione: Destinazione | null;
  nota: string;
};

const f = (codice: string, ext: string) => `${CARTELLA_ARCHIVIO}/${codice}.${ext}`;

const RUBRICA: Destinazione = { href: "/rubriche/touch-music", label: "Rubrica TOUCH MUSIC" };
const SECURITY: Destinazione = { href: "/tbh/societa/tbh-b04", label: "Scheda Touch Security (TBH-B04)" };
const INFLUENCITY: Destinazione = { href: "/influencity", label: "Touch Influencity Magazine" };
const SPOTLIGHT: Destinazione = { href: "/tbh/p/touch-spotlight", label: "Pagina Touch Spotlight" };
const TRAVELS: Destinazione = { href: "/touch-travels", label: "Pagina Touch Travels" };
const MISS_COOL: Destinazione = { href: "/eventi/miss-cool", label: "Touch Miss Cool" };

export const ARCHIVIO_73: AssetArchivio[] = [
  { codice: "TBH-001", nomeCsv: "Touch Music bianco A", file: f("TBH-001", "jpg"), originale: "01_TOUCH_MUSIC_bianco_A.jpeg", larghezza: 960, altezza: 680, bytes: 37681, stato: "rubrica", destinazione: RUBRICA, nota: "Logo TOUCH MUSIC su fondo bianco. La rubrica usa già l'originale nero: questo resta come versione chiara." },
  { codice: "TBH-002", nomeCsv: "Teschio cuffie", file: f("TBH-002", "jpg"), originale: "02_Teschio_cuffie.jpeg", larghezza: 1290, altezza: 2796, bytes: 480606, stato: "grafica", destinazione: null, nota: "Illustrazione senza marchio." },
  { codice: "TBH-003", nomeCsv: "Match Music", file: f("TBH-003", "jpg"), originale: "03_MATCH_MUSIC.jpeg", larghezza: 320, altezza: 320, bytes: 8711, stato: "collegato", destinazione: { href: "/anagrafica", label: "Anagrafica · Radio e TV partner (MEDIA-RADIO-005)" }, nota: "La scheda MEDIA-RADIO-005 Match Music TV aspetta proprio il «logo ufficiale»: questo file potrebbe essere quello, se confermi." },
  { codice: "TBH-004", nomeCsv: "Talia Media", file: f("TBH-004", "jpg"), originale: "04_TALIA_MEDIA.jpeg", larghezza: 225, altezza: 225, bytes: 5397, stato: "esterno", destinazione: null, nota: "Talia Media Ltd — music and video editions." },
  { codice: "TBH-005", nomeCsv: "App Movie", file: f("TBH-005", "jpg"), originale: "05_APP_MOVIE.jpeg", larghezza: 185, altezza: 185, bytes: 3844, stato: "esterno", destinazione: null, nota: "Nessuna pagina nel sito." },
  { codice: "TBH-006", nomeCsv: "Touch Music bianco B", file: f("TBH-006", "jpg"), originale: "06_TOUCH_MUSIC_bianco_B.jpeg", larghezza: 1600, altezza: 1133, bytes: 40741, stato: "duplicato", canonico: "TBH-001", destinazione: RUBRICA, nota: "Stessa grafica di TBH-001 a risoluzione più alta." },
  { codice: "TBH-007", nomeCsv: "Touch Music nero", file: f("TBH-007", "jpg"), originale: "07_TOUCH_MUSIC_nero.jpeg", larghezza: 842, altezza: 842, bytes: 22128, stato: "rubrica", destinazione: RUBRICA, nota: "Logo TOUCH MUSIC su fondo nero, come quello già in uso dalla rubrica." },
  { codice: "TBH-008", nomeCsv: "Centro Vacanze La Gemma", file: f("TBH-008", "jpg"), originale: "08_CENTRO_VACANZE_LA_GEMMA.jpeg", larghezza: 247, altezza: 204, bytes: 31216, stato: "collegato", destinazione: { href: "/e/villaggio-turistico-la-gemma", label: "Scheda Villaggio Turistico La Gemma" }, nota: "Nel Circuito c'è «Villaggio Turistico La Gemma»: da confermare che sia la stessa struttura." },
  { codice: "TBH-009", nomeCsv: "Nova Web TV", file: f("TBH-009", "jpg"), originale: "09_NOVA_WEB_TV.jpeg", larghezza: 1330, altezza: 1330, bytes: 70316, stato: "esterno", destinazione: null, nota: "Nessuna pagina nel sito." },
  { codice: "TBH-010", nomeCsv: "Prima la Sicilia", file: f("TBH-010", "jpg"), originale: "10_PRIMA_LA_SICILIA.jpeg", larghezza: 720, altezza: 1600, bytes: 83402, stato: "grafica", destinazione: null, nota: "Schermata del sito primalasicilia.blog (telefono)." },
  { codice: "TBH-011", nomeCsv: "Life Poliambulatorio", file: f("TBH-011", "jpg"), originale: "IMG_0542.jpeg", larghezza: 225, altezza: 225, bytes: 32519, stato: "esterno", destinazione: null, nota: "Nessuna pagina nel sito." },
  { codice: "TBH-012", nomeCsv: "Power Band", file: f("TBH-012", "jpg"), originale: "IMG_0668.jpeg", larghezza: 1080, altezza: 1053, bytes: 136315, stato: "esterno", destinazione: null, nota: "Nessuna pagina nel sito." },
  { codice: "TBH-013", nomeCsv: "Radio Touch", nomeVerificato: "M.C. Security", file: f("TBH-013", "jpg"), originale: "IMG_6654.jpeg", larghezza: 250, altezza: 324, bytes: 25626, stato: "esterno", destinazione: null, nota: "Scudo tricolore «M.C. Security»: non è Touch Security." },
  { codice: "TBH-014", nomeCsv: "Life Poliambulatorio (copia)", nomeVerificato: "Wizz Air", file: f("TBH-014", "png"), originale: "IMG_7468.png", larghezza: 1200, altezza: 798, bytes: 70628, stato: "esterno", destinazione: null, nota: "Compagnia aerea." },
  { codice: "TBH-015", nomeCsv: "MC Security", nomeVerificato: "Ryanair", file: f("TBH-015", "png"), originale: "IMG_7469.png", larghezza: 348, altezza: 348, bytes: 2174, stato: "esterno", destinazione: null, nota: "Compagnia aerea." },
  { codice: "TBH-016", nomeCsv: "Wizz Air", nomeVerificato: "Volotea", file: f("TBH-016", "jpg"), originale: "IMG_7470.jpeg", larghezza: 346, altezza: 146, bytes: 14119, stato: "esterno", destinazione: null, nota: "Compagnia aerea." },
  { codice: "TBH-017", nomeCsv: "Ryanair", nomeVerificato: "Airbnb", file: f("TBH-017", "png"), originale: "IMG_7471.png", larghezza: 225, altezza: 225, bytes: 6801, stato: "esterno", destinazione: null, nota: "Piattaforma alloggi." },
  { codice: "TBH-018", nomeCsv: "Booking.com", file: f("TBH-018", "webp"), originale: "IMG_7472.webp", larghezza: 1024, altezza: 400, bytes: 33846, stato: "esterno", destinazione: null, nota: "Piattaforma alloggi." },
  { codice: "TBH-019", nomeCsv: "Airbnb", nomeVerificato: "Radio Touch", file: f("TBH-019", "png"), originale: "TOUCH-MUSIC-RADIO1.png", larghezza: 294, altezza: 186, bytes: 49272, stato: "da-verificare", destinazione: null, nota: "Logo «RADIO TOUCH» con globo e cuffie (file originale TOUCH-MUSIC-RADIO1). È un vecchio logo radio? Non va su TOUCH RADIO senza il tuo sì." },
  { codice: "TBH-020", nomeCsv: "Volotea", nomeVerificato: "Life Poliambulatorio", file: f("TBH-020", "jpg"), originale: "c17b1ab1-c8d9-4f9d-979a-c7d2aa9a9d77.jpeg", larghezza: 224, altezza: 224, bytes: 8613, stato: "duplicato", canonico: "TBH-011", destinazione: null, nota: "Stesso logo di TBH-011." },
  { codice: "TBH-021", nomeCsv: "British Airways", file: f("TBH-021", "png"), originale: "21_IMG_7473.png", larghezza: 3000, altezza: 2000, bytes: 30865, stato: "esterno", destinazione: null, nota: "Compagnia aerea." },
  { codice: "TBH-022", nomeCsv: "Airbnb (variante)", file: f("TBH-022", "png"), originale: "22_IMG_7471(1).png", larghezza: 225, altezza: 225, bytes: 6801, stato: "duplicato", canonico: "TBH-017", destinazione: null, nota: "File identico byte per byte a TBH-017." },
  { codice: "TBH-023", nomeCsv: "Pride Village Padova", file: f("TBH-023", "jpg"), originale: "23_IMG_8112.jpeg", larghezza: 1388, altezza: 619, bytes: 428908, stato: "collegato", destinazione: { href: "/pride-village", label: "Pagina Pride Village" }, nota: "Banner Pride Village (Fiera di Padova). La pagina esiste (Touch Be Proud, TBH-006)." },
  { codice: "TBH-024", nomeCsv: "S·Nap Shot", file: f("TBH-024", "jpg"), originale: "24_2E7E709E-9164-48F5-9429-0788D31574B8.jpeg", larghezza: 1536, altezza: 864, bytes: 326417, stato: "esterno", destinazione: null, nota: "Insegna «S·Nap Shot — Brain fuel»." },
  { codice: "TBH-025", nomeCsv: "Claudio foto cappellino", file: f("TBH-025", "jpg"), originale: "25_IMG_8827.jpeg", larghezza: 1536, altezza: 709, bytes: 254309, stato: "foto", destinazione: null, nota: "Foto personale." },
  { codice: "TBH-026", nomeCsv: "Claudio foto frontale", file: f("TBH-026", "jpg"), originale: "26_2c0b2db1-caa6-45aa-b378-d9b35b9fb7a4.jpeg", larghezza: 1153, altezza: 2048, bytes: 392082, stato: "foto", destinazione: null, nota: "Foto personale." },
  { codice: "TBH-027", nomeCsv: "Hotel Villaggio Il Carlino", file: f("TBH-027", "png"), originale: "27_IMG_9891.png", larghezza: 462, altezza: 463, bytes: 382465, stato: "collegato", destinazione: { href: "/e/hotel-villaggio-il-carlino", label: "Scheda Hotel Villaggio Il Carlino" }, nota: "Struttura del Circuito TBH." },
  { codice: "TBH-028", nomeCsv: "Black Pearl insegna", file: f("TBH-028", "jpg"), originale: "28_09471ca2-748b-4e33-8187-a3d1a7375541.jpeg", larghezza: 1600, altezza: 509, bytes: 118826, stato: "collegato", destinazione: { href: "/e/blackpearl-paninoteca-cocktail-bar", label: "Scheda BlackPearl" }, nota: "Bozzetto insegna con misure (3000 × 900 mm)." },
  { codice: "TBH-029", nomeCsv: "Radio MC2 schermata", file: f("TBH-029", "png"), originale: "29_IMG_0119.png", larghezza: 1125, altezza: 2436, bytes: 545081, stato: "grafica", destinazione: null, nota: "Schermata di una storia Instagram con il logo MC2: non è un logo pulito." },
  { codice: "TBH-030", nomeCsv: "Hotel Zurigo", file: f("TBH-030", "jpg"), originale: "30_IMG_1729.jpeg", larghezza: 481, altezza: 415, bytes: 21821, stato: "collegato", destinazione: { href: "/e/hotel-zurigo", label: "Scheda Hotel Zurigo" }, nota: "Struttura del Circuito TBH (Rivazzurra – Rimini)." },
  { codice: "TBH-031", nomeCsv: "Touch Pay", file: f("TBH-031", "jpg"), originale: "31_IMG_2632.jpeg", larghezza: 1024, altezza: 1024, bytes: 92287, stato: "tbh-pagina", destinazione: { href: "/pagamenti", label: "Touch Pay · Pagamenti" }, nota: "Nella grafica compare «www.touchpay.store»: non è stato collegato, va confermato." },
  { codice: "TBH-032", nomeCsv: "Black Pearl variante", file: f("TBH-032", "jpg"), originale: "32_IMG_2634.jpeg", larghezza: 474, altezza: 335, bytes: 27910, stato: "variante", canonico: "TBH-028", destinazione: { href: "/e/blackpearl-paninoteca-cocktail-bar", label: "Scheda BlackPearl" }, nota: "Logo BlackPearl su fondo bianco." },
  { codice: "TBH-033", nomeCsv: "Touch Fit & Wellness", file: f("TBH-033", "jpg"), originale: "33_62edaaf5-33f8-4f84-9c22-b18b44d295f4.jpeg", larghezza: 1024, altezza: 1024, bytes: 67829, stato: "tbh-bozza", destinazione: null, nota: "Nessuna pagina del marchio. Nel negozio esiste solo il prodotto «Kit benessere Touch Fit»." },
  { codice: "TBH-034", nomeCsv: "Touch Fashion Magazine", file: f("TBH-034", "jpg"), originale: "34_4523820c-6110-414e-80aa-95869dd6a0a7.jpeg", larghezza: 1024, altezza: 1024, bytes: 159329, stato: "tbh-pagina", destinazione: { href: "/fashion", label: "Canale Touch Fashion" }, nota: "Impaginato del magazine (copertina + pagine interne)." },
  { codice: "TBH-035", nomeCsv: "Touch Travel", file: f("TBH-035", "jpg"), originale: "35_IMG_3237.jpeg", larghezza: 1024, altezza: 1024, bytes: 301714, stato: "variante", canonico: "TBH-059", destinazione: TRAVELS, nota: "Grafica «TOUCH TRAVEL» (senza S) con «Cos'è questo?»: verifica il nome." },
  { codice: "TBH-036", nomeCsv: "Claudio foto intera nero", file: f("TBH-036", "jpg"), originale: "36_552ebbe5-5bd0-4a25-ba77-9f069b0d0c24.jpeg", larghezza: 1024, altezza: 1024, bytes: 62584, stato: "foto", destinazione: null, nota: "Foto personale." },
  { codice: "TBH-037", nomeCsv: "Claudio foto intera bianco", file: f("TBH-037", "jpg"), originale: "37_b69f0c4d-c0dc-4315-8712-f7f98fde04a7.jpeg", larghezza: 1024, altezza: 1024, bytes: 53994, stato: "foto", destinazione: null, nota: "Foto personale." },
  { codice: "TBH-038", nomeCsv: "Miss Cool 2026", file: f("TBH-038", "jpg"), originale: "38_d2aa2e89-d689-4d51-a8a9-e0fcf329f413.jpeg", larghezza: 1024, altezza: 1024, bytes: 207872, stato: "tbh-pagina", destinazione: MISS_COOL, nota: "Logo «Miss Cool 2026» (il sito ora presenta l'edizione 2027)." },
  { codice: "TBH-039", nomeCsv: "Touch Spotlight Open Call", file: f("TBH-039", "jpg"), originale: "39_8cd9ba05-37b7-4893-b450-50e88e70718e.jpeg", larghezza: 1024, altezza: 1024, bytes: 164442, stato: "variante", canonico: "TBH-057", destinazione: SPOTLIGHT, nota: "Locandina «Open call» del marchio Touch Spotlight." },
  { codice: "TBH-040", nomeCsv: "Giovanile Rimini", file: f("TBH-040", "jpg"), originale: "40_IMG_3605.jpeg", larghezza: 1024, altezza: 1024, bytes: 156628, stato: "da-verificare", destinazione: null, nota: "Stemma «Giovanile Rimini». Nel sito c'è solo il «Reality Show Giovanile Rimini»: dimmi a cosa appartiene." },
  { codice: "TBH-041", nomeCsv: "Touch Music Radio grafica", file: f("TBH-041", "jpg"), originale: "41_0f1f039d-720d-4ed8-ab8a-3f2fb958dd67.jpeg", larghezza: 1536, altezza: 1024, bytes: 342422, stato: "conflitto", destinazione: null, nota: "Locandina «TOUCH MUSIC RADIO · TBH-004 brand division»." },
  { codice: "TBH-042", nomeCsv: "Touch Influencity Magazine", file: f("TBH-042", "jpg"), originale: "42_76E23BC2-CC19-45BD-B015-345A4410C8EC(1).jpeg", larghezza: 1536, altezza: 772, bytes: 383457, stato: "tbh-pagina", destinazione: INFLUENCITY, nota: "Versione notturna (skyline)." },
  { codice: "TBH-043", nomeCsv: "Touch Café", file: f("TBH-043", "png"), originale: "43_570C95AF-E27D-43B5-8812-4F8C58D2FF51.png", larghezza: 1254, altezza: 1254, bytes: 702855, stato: "tbh-pagina", destinazione: { href: "/e/touch-cafe", label: "Scheda Touch Cafè" }, nota: "Nel Circuito si chiama «Touch Cafè»." },
  { codice: "TBH-044", nomeCsv: "Touch Ice Cream", file: f("TBH-044", "png"), originale: "44_8EB4AB0D-3A21-48DD-A958-24BF2CC78B45.png", larghezza: 1254, altezza: 1254, bytes: 925231, stato: "tbh-pagina", destinazione: { href: "/e/touch-ice-cream", label: "Scheda Touch Ice Cream" }, nota: "Luogo del Circuito TBH." },
  { codice: "TBH-045", nomeCsv: "Touch Beach", file: f("TBH-045", "jpg"), originale: "45_B76A0E55-8556-40F1-A3CB-E43C2CB63959.jpeg", larghezza: 1254, altezza: 1254, bytes: 462429, stato: "tbh-pagina", destinazione: { href: "/e/touch-beach-sea", label: "Scheda Touch Beach & Sea" }, nota: "Nel Circuito si chiama «Touch Beach & Sea»: confermare che sia lo stesso." },
  { codice: "TBH-046", nomeCsv: "Touch Restaurant", file: f("TBH-046", "jpg"), originale: "46_5164BE26-B1F2-4D05-9E0D-E07E7A681B45.jpeg", larghezza: 1254, altezza: 1254, bytes: 391494, stato: "tbh-pagina", destinazione: { href: "/tbh/societa/tbh-a09", label: "Scheda Touch Restaurant (TBH-A09)" }, nota: "Attività del gruppo." },
  { codice: "TBH-047", nomeCsv: "Touch Kids", file: f("TBH-047", "jpg"), originale: "47_9B3FC6FF-A7A4-4769-A682-6DC0A97A2827.jpeg", larghezza: 1254, altezza: 1254, bytes: 595727, stato: "tbh-bozza", destinazione: null, nota: "Nessuna pagina nel sito." },
  { codice: "TBH-048", nomeCsv: "Touch Move Logistics", file: f("TBH-048", "jpg"), originale: "48_9E0E0E01-3CCE-4A95-B104-97BE18F041E3.jpeg", larghezza: 1536, altezza: 1024, bytes: 495708, stato: "tbh-bozza", destinazione: null, nota: "Nessuna pagina nel sito." },
  { codice: "TBH-049", nomeCsv: "FMI variante 1", file: f("TBH-049", "jpg"), originale: "49_IMG_5900.jpeg", larghezza: 499, altezza: 400, bytes: 40941, stato: "esterno", destinazione: null, nota: "Federazione Motociclistica Italiana." },
  { codice: "TBH-050", nomeCsv: "FMI variante 2", file: f("TBH-050", "jpg"), originale: "50_IMG_5901.jpeg", larghezza: 588, altezza: 297, bytes: 21089, stato: "duplicato", canonico: "TBH-049", destinazione: null, nota: "Stesso stemma FMI, più piccolo." },
  { codice: "TBH-051", nomeCsv: "Touch Hugoland", file: f("TBH-051", "jpg"), originale: "51_474788de-1056-4ef5-aad8-f1aa72574785.jpeg", larghezza: 1536, altezza: 1024, bytes: 500693, stato: "tbh-pagina", destinazione: { href: "/hugoland", label: "Canale Hugoland" }, nota: "«Il villaggio del divertimento»." },
  { codice: "TBH-052", nomeCsv: "Touch Security", file: f("TBH-052", "jpg"), originale: "52_f0d971df-dce1-4362-8f58-fb472c1d8630.jpeg", larghezza: 1536, altezza: 1024, bytes: 411870, stato: "tbh-pagina", destinazione: SECURITY, nota: "Marchio canonico di Touch Security." },
  { codice: "TBH-053", nomeCsv: "Touch Cleaning", file: f("TBH-053", "jpg"), originale: "53_e4b42945-96c8-4830-b42b-019a3111a3c9.jpeg", larghezza: 1254, altezza: 1254, bytes: 180626, stato: "tbh-pagina", destinazione: { href: "/tbh/societa/tbh-b09", label: "Scheda Touch Cleaning (TBH-B09)" }, nota: "Attività del gruppo." },
  { codice: "TBH-054", nomeCsv: "Touch Project", file: f("TBH-054", "jpg"), originale: "54_4c8d44f4-7580-4f81-9479-a7e697303e53.jpeg", larghezza: 1254, altezza: 1254, bytes: 175665, stato: "tbh-bozza", destinazione: null, nota: "Marchio canonico di Touch Project. Nessuna pagina nel sito." },
  { codice: "TBH-055", nomeCsv: "Touch Academy", file: f("TBH-055", "jpg"), originale: "55_82d9bd86-bb32-4920-9b7d-5929d6556642.jpeg", larghezza: 1254, altezza: 1254, bytes: 173614, stato: "tbh-pagina", destinazione: { href: "/touch-academy", label: "Touch Academy" }, nota: "Formazione, certificazioni, crescita professionale." },
  { codice: "TBH-056", nomeCsv: "Touch Casting", file: f("TBH-056", "jpg"), originale: "56_a49c9168-1b48-4f07-89b0-d5161fcbede6.jpeg", larghezza: 1254, altezza: 1254, bytes: 230297, stato: "tbh-pagina", destinazione: { href: "/casting", label: "Casting" }, nota: "Attività del gruppo (TBH-B03)." },
  { codice: "TBH-057", nomeCsv: "Touch Spotlight", file: f("TBH-057", "jpg"), originale: "57_ae85a049-b56b-44fe-a05e-d6bd25643a0c.jpeg", larghezza: 1600, altezza: 900, bytes: 154753, stato: "tbh-pagina", destinazione: SPOTLIGHT, nota: "Marchio canonico di Touch Spotlight." },
  { codice: "TBH-058", nomeCsv: "Touch Fit & Wellness variante", file: f("TBH-058", "jpg"), originale: "58_04435C4B-03F4-41EC-8AB9-F8DD66E6213B.jpeg", larghezza: 1254, altezza: 1254, bytes: 304620, stato: "variante", canonico: "TBH-033", destinazione: null, nota: "Versione chiara «a division of Touch Business Holding»." },
  { codice: "TBH-059", nomeCsv: "Touch Travels", file: f("TBH-059", "jpg"), originale: "59_ABA0CBF9-5C92-425E-BD7D-9E54E4F1FC6E.jpeg", larghezza: 1254, altezza: 1254, bytes: 492322, stato: "tbh-pagina", destinazione: TRAVELS, nota: "Marchio canonico di Touch Travels." },
  { codice: "TBH-060", nomeCsv: "Touch E-Bike", file: f("TBH-060", "jpg"), originale: "60_CBE915D2-F36F-4F90-BC51-2A7F355B3473.jpeg", larghezza: 1536, altezza: 768, bytes: 305411, stato: "tbh-bozza", destinazione: null, nota: "Nessuna pagina nel sito." },
  { codice: "TBH-061", nomeCsv: "Touch Influencity Magazine variante", file: f("TBH-061", "jpg"), originale: "F9B96AAD-E00E-4FB1-87F9-26E7CE94205F.jpeg", larghezza: 1536, altezza: 768, bytes: 285857, stato: "variante", canonico: "TBH-042", destinazione: INFLUENCITY, nota: "Versione chiara. È anche la voce TBH-061 del pacchetto 13 canali." },
  { codice: "TBH-062", nomeCsv: "Touch Street Food & Beverage", file: f("TBH-062", "jpg"), originale: "291BFEB1-00FC-4BF8-8181-4A5D6F8185CF.jpeg", larghezza: 1536, altezza: 864, bytes: 471796, stato: "tbh-pagina", destinazione: { href: "/tbh/societa/tbh-b05", label: "Scheda Touch Street Food & Beverage (TBH-B05)" }, nota: "Voce TBH-062 del pacchetto 13 canali." },
  { codice: "TBH-063", nomeCsv: "Touch Security variante", file: f("TBH-063", "jpg"), originale: "6b6f4137-6029-434d-bad2-67ad12bc91f3.jpeg", larghezza: 1536, altezza: 1024, bytes: 423364, stato: "variante", canonico: "TBH-052", destinazione: SECURITY, nota: "Quasi identica a TBH-052." },
  { codice: "TBH-064", nomeCsv: "Touch Project variante", file: f("TBH-064", "jpg"), originale: "711B0E28-FDC5-4E43-8C6B-7323D0D5AC65.jpeg", larghezza: 1254, altezza: 1254, bytes: 309305, stato: "variante", canonico: "TBH-054", destinazione: null, nota: "Nessuna pagina Touch Project nel sito." },
  { codice: "TBH-065", nomeCsv: "Touch Music Radio variante", file: f("TBH-065", "jpg"), originale: "D8304121-9361-48E6-8638-07BCAE0B4C89.jpeg", larghezza: 1536, altezza: 1024, bytes: 92640, stato: "conflitto", destinazione: null, nota: "Grafica diversa dal file già nel sito (/brand/loghi/touch-music-radio.png)." },
  { codice: "TBH-066", nomeCsv: "Touch Booking Host", file: f("TBH-066", "jpg"), originale: "031F93AD-2BF5-4E61-8D4B-180F95A76C9E.jpeg", larghezza: 1536, altezza: 1024, bytes: 410675, stato: "tbh-pagina", destinazione: { href: "/tbh/societa/tbh-a16", label: "Scheda Touch Booking Host (TBH-A16)" }, nota: "Voce TBH-066 del pacchetto 13 canali." },
  { codice: "TBH-067", nomeCsv: "Touch Rent", file: f("TBH-067", "jpg"), originale: "99D7B784-9251-4A33-A579-E7165DB4DB31.jpeg", larghezza: 1536, altezza: 1024, bytes: 501898, stato: "tbh-pagina", destinazione: { href: "/tbh/societa/tbh-b11", label: "Scheda Touch Rent (TBH-B11)" }, nota: "Voce TBH-067 del pacchetto 13 canali." },
  { codice: "TBH-068", nomeCsv: "Touch Care Assistance", file: f("TBH-068", "jpg"), originale: "7C8B918C-1257-4FB9-BB8C-9AC94EABB8E1.jpeg", larghezza: 1536, altezza: 1024, bytes: 362363, stato: "tbh-bozza", destinazione: null, nota: "Nessuna pagina nel sito." },
  { codice: "TBH-069", nomeCsv: "Touch Miss Cool Web", file: f("TBH-069", "jpg"), originale: "CF37DDCF-53C5-4C0C-9976-4FA27FDDAB76.jpeg", larghezza: 1254, altezza: 1254, bytes: 648405, stato: "tbh-pagina", destinazione: MISS_COOL, nota: "Versione online del concorso Touch Miss Cool." },
  { codice: "TBH-070", nomeCsv: "Touch Human Resources", file: f("TBH-070", "png"), originale: "62564421-99EA-4AF5-98F8-5CA7ABB97579.png", larghezza: 1536, altezza: 1024, bytes: 1039508, stato: "tbh-pagina", destinazione: { href: "/tbh/societa/tbh-a03", label: "Scheda Touch Human Resources (TBH-A03)" }, nota: "Voce TBH-070 del pacchetto 13 canali." },
  { codice: "TBH-071", nomeCsv: "Touch Plaza", file: f("TBH-071", "jpg"), originale: "TBH-071_Touch_Plaza.jpeg", larghezza: 1659, altezza: 948, bytes: 503731, stato: "tbh-pagina", destinazione: { href: "/shop", label: "Touch Plaza · Negozio" }, nota: "Il centro commerciale digitale." },
  { codice: "TBH-072", nomeCsv: "Touch Security variante 2", file: f("TBH-072", "jpg"), originale: "TBH-072_Touch_Security.jpeg", larghezza: 1024, altezza: 1024, bytes: 288709, stato: "variante", canonico: "TBH-052", destinazione: null, nota: "SCRITTE DEFORMATE: «SAPETY», «TRAIHING», «PRIVO COCCORSO», «BISD & DAE», «SAIVATACCIO». Non pubblicabile così." },
  { codice: "TBH-073", nomeCsv: "Touch Disco", file: f("TBH-073", "jpg"), originale: "TBH-073_Touch_Disco.jpeg", larghezza: 1536, altezza: 1024, bytes: 125324, stato: "tbh-bozza", destinazione: null, nota: "Nessuna pagina nel sito." },
];

export function assetPerCodice(codice: string) {
  return ARCHIVIO_73.find((a) => a.codice === codice);
}

/* ────────────────────────────────────────────────────────────────────────────
   PACCHETTO «13 CANALI» (canali_61_73.json). Testi copiati dal JSON, senza
   riscritture. Per ognuno: canale del palinsesto che lo OSPITEREBBE (come
   pulsante dentro un canale esistente, non come canale nuovo) e pagina di
   destinazione del «Scopri di più».
   ──────────────────────────────────────────────────────────────────────────── */

export type EsitoMonitor = "pronto" | "variante" | "bozza" | "bloccato";

export const ESITO_MONITOR: Record<EsitoMonitor, { etichetta: string; colore: string }> = {
  pronto: { etichetta: "PRONTO · ASPETTA IL TUO SÌ", colore: "#d7ff00" },
  variante: { etichetta: "VARIANTE · NESSUN MARCHIO NUOVO", colore: "#9fd3ff" },
  bozza: { etichetta: "BOZZA · NESSUNA PAGINA DA COLLEGARE", colore: "#f5c542" },
  bloccato: { etichetta: "BLOCCATO · SERVE LA TUA DECISIONE", colore: "#ff8a3d" },
};

export type MonitorImport = {
  codice: string;
  titolo: string;
  descrizione: string;
  noteJson: string;
  cta: string;
  /** Link scritto nel JSON (può essere null). */
  hrefJson: string | null;
  /** Dove porterebbe davvero «Scopri di più»: solo pagine esistenti. */
  destinazione: Destinazione | null;
  /** Canale del palinsesto che lo ospiterebbe (numero interno + nome). */
  canaleProposto: { numero: number; nome: string } | null;
  canonico?: string;
  esito: EsitoMonitor;
  avviso: string | null;
};

export const MONITOR_61_73: MonitorImport[] = [
  {
    codice: "TBH-061",
    titolo: "Touch Influencity Magazine",
    descrizione: "Magazine, media, marketing, comunicazione, eventi",
    noteJson: "TIBIHACCA.COM; Il centro commerciale digitale",
    cta: "Scopri di più",
    hrefJson: null,
    destinazione: INFLUENCITY,
    canaleProposto: { numero: 8, nome: "TOUCH MEDIA" },
    esito: "pronto",
    avviso: "Il pulsante «Influencity Magazine» esiste già nel canale TOUCH MEDIA: proposta = dargli questa immagine, non un doppione.",
  },
  {
    codice: "TBH-062",
    titolo: "Touch Street Food & Beverage",
    descrizione:
      "Food truck; street food; beverage e drink; stand ambulanti; festival e sagre; ricerca e selezione ambulanti; mercatini e fiere patronali; eventi comunali e pro loco; villaggi turistici e manifestazioni sportive; coordinamento operatori HO.RE.CA.",
    noteJson: "Drink & Trucks Friends; Il gusto che unisce, gli eventi che restano.",
    cta: "Scopri di più",
    hrefJson: null,
    destinazione: { href: "/tbh/societa/tbh-b05", label: "Scheda Touch Street Food & Beverage (TBH-B05)" },
    canaleProposto: { numero: 2, nome: "SOCIETÀ TBH" },
    esito: "pronto",
    avviso: null,
  },
  {
    codice: "TBH-063",
    titolo: "Touch Security",
    descrizione:
      "Sicurezza e controllo; antincendio rischio alto; marshall e percorso in pista; pronto intervento emergenze; primo soccorso; BLSD e DAE; salvataggio; radiocomunicazioni; supporto logistico; formazione",
    noteJson: "Safety • Security • Prevention • Training; duplicato del marchio TBH-052",
    cta: "Scopri di più",
    hrefJson: null,
    destinazione: SECURITY,
    canaleProposto: { numero: 2, nome: "SOCIETÀ TBH" },
    canonico: "TBH-052",
    esito: "variante",
    avviso: "Variante di TBH-052: si usa come seconda immagine della scheda Touch Security, non come marchio nuovo.",
  },
  {
    codice: "TBH-064",
    titolo: "Touch Project",
    descrizione: "Supporto a enti e aziende nella presentazione di progetti a gare e bandi",
    noteJson: "Dove i progetti nascono, i sogni diventano realtà; duplicato del marchio TBH-054",
    cta: "Scopri di più",
    hrefJson: null,
    destinazione: null,
    canaleProposto: { numero: 2, nome: "SOCIETÀ TBH" },
    canonico: "TBH-054",
    esito: "bozza",
    avviso: "Variante di TBH-054. Nel sito non c'è una pagina Touch Project: il pulsante resta senza link finché non la crei o me ne indichi una.",
  },
  {
    codice: "TBH-065",
    titolo: "Touch Music Radio",
    descrizione: "Marchio radiofonico con equalizzatore giallo, bianco, nero e fucsia",
    noteJson: "Feel the music • Live the moment (testo grafico)",
    cta: "Scopri di più",
    hrefJson: null,
    destinazione: null,
    canaleProposto: null,
    esito: "bloccato",
    avviso:
      "Regola canali: TOUCH RADIO, TOUCH TV e la rubrica TOUCH MUSIC restano separati. Questo marchio dice «Touch Music Radio» ed è diverso dal file già nel sito: non lo assegno a nessun canale finché non decidi.",
  },
  {
    codice: "TBH-066",
    titolo: "Touch Booking Host",
    descrizione:
      "Alloggi; hotel; villaggi; esperienze; transfer; eventi; servizi; sinergie Touch Travels, Touch Village, Touch HO.RE.CA., Touch Cleaning, Touch Security, Touch Move Logistics",
    noteJson: "La tua prenotazione. La nostra ospitalità.",
    cta: "Scopri di più",
    hrefJson: null,
    destinazione: { href: "/tbh/societa/tbh-a16", label: "Scheda Touch Booking Host (TBH-A16)" },
    canaleProposto: { numero: 14, nome: "TOUCH HOST" },
    esito: "pronto",
    avviso: null,
  },
  {
    codice: "TBH-067",
    titolo: "Touch Rent",
    descrizione: "Noleggio veicoli; noleggio attrezzature; noleggio materiali; noleggio operativo; logistica e trasporti",
    noteJson: "Rent • Logistics • Equipment • Mobility",
    cta: "Scopri di più",
    hrefJson: null,
    destinazione: { href: "/tbh/societa/tbh-b11", label: "Scheda Touch Rent (TBH-B11)" },
    canaleProposto: { numero: 2, nome: "SOCIETÀ TBH" },
    esito: "pronto",
    avviso: null,
  },
  {
    codice: "TBH-068",
    titolo: "Touch Care Assistance",
    descrizione:
      "Assistenza alla persona; area sociosanitaria; mobilità e accompagnamento; sicurezza e supporto; ricerca e selezione personale",
    noteJson: "Care • Health • Mobility • Support; Caserta • Rimini • Italia",
    cta: "Scopri di più",
    hrefJson: null,
    destinazione: null,
    canaleProposto: { numero: 3, nome: "TBH SERVICES" },
    esito: "bozza",
    avviso: "Nel sito non c'è una pagina Touch Care Assistance (TBH Assist è un'altra cosa): resta senza link.",
  },
  {
    codice: "TBH-069",
    titolo: "Touch Miss Cool Web",
    descrizione:
      "Casting online; iscrizioni digitali; votazioni del pubblico; dirette streaming; interviste e podcast; shooting foto e video; premi e classifiche",
    noteJson: "Il concorso online; touchmisscoolweb.com",
    cta: "Scopri di più",
    hrefJson: "https://touchmisscoolweb.com",
    destinazione: MISS_COOL,
    canaleProposto: { numero: 10, nome: "HUGOLAND" },
    esito: "pronto",
    avviso:
      "Il dominio touchmisscoolweb.com oggi (15/10) non risponde: non risolve nei DNS. Per ora il pulsante porta alla pagina Touch Miss Cool già nel sito; il link esterno si attiva quando il dominio è online.",
  },
  {
    codice: "TBH-070",
    titolo: "Touch Human Resources",
    descrizione: "Identità grafica della divisione risorse umane",
    noteJson: "A division of Touch Business Holding",
    cta: "Scopri di più",
    hrefJson: null,
    destinazione: { href: "/tbh/societa/tbh-a03", label: "Scheda Touch Human Resources (TBH-A03)" },
    canaleProposto: { numero: 15, nome: "TOUCH JOBS" },
    esito: "pronto",
    avviso: null,
  },
  {
    codice: "TBH-071",
    titolo: "Touch Plaza",
    descrizione: "Centro commerciale digitale; Touch Pay; shopping e servizi",
    noteJson: "",
    cta: "Scopri di più",
    hrefJson: "https://www.tbh-web.com/",
    destinazione: { href: "/shop", label: "Touch Plaza · Negozio (/shop)" },
    canaleProposto: { numero: 18, nome: "TOUCH SHOP" },
    esito: "pronto",
    avviso: "https://www.tbh-web.com/ è la home di questo sito: Touch Plaza nel sito è /shop (anche /touch-plaza porta lì), quindi il pulsante resta interno.",
  },
  {
    codice: "TBH-072",
    titolo: "Touch Security",
    descrizione: "Variante grafica; verificare scritte minori prima di pubblicare",
    noteJson: "",
    cta: "Scopri di più",
    hrefJson: null,
    destinazione: null,
    canaleProposto: null,
    canonico: "TBH-052",
    esito: "bloccato",
    avviso:
      "Verifica grafica fatta: le scritte piccole sono deformate («SAPETY», «TRAIHING», «SERVISUDI SICNNECZA», «AHTINCENDIO», «PRIVO COCCORSO», «BISD & DAE», «SAIVATACCIO», «EMERGENSE»). Non la pubblico finché non arriva una versione corretta.",
  },
  {
    codice: "TBH-073",
    titolo: "Touch Disco",
    descrizione: "DJ, discoteca, intrattenimento musicale",
    noteJson: "",
    cta: "Scopri di più",
    hrefJson: null,
    destinazione: null,
    canaleProposto: null,
    esito: "bozza",
    avviso: "Nel sito non c'è una pagina Touch Disco e non è chiaro in quale canale vada: dimmelo tu.",
  },
];
