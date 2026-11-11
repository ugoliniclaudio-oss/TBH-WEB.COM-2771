/**
 * EDICOLA TBH — STRUTTURA (specifica della direzione del 20/09/2026).
 *
 * Qui stanno SOLO struttura e dati di fatto: i nomi delle sezioni, i territori
 * prioritari, i segni zodiacali con il loro periodo, l'elenco dei giochi.
 * Nessun articolo, nessun titolo, nessuna immagine e nessun prezzo: i contenuti
 * arrivano dalle fonti verificate (api/data/edicola-fonti.ts) o dalla redazione.
 *
 * Regola di non-duplicazione (punto «non duplicare contenuti/database già
 * presenti»): quando una sezione del portale esiste già — Touch Influencity
 * Magazine, Giochi di mente, DM, Touch Miss Cool, Lavoro & Casting, Sport —
 * l'Edicola la RICHIAMA con un rimando alla sua pagina canonica. Non ne fa una
 * copia e non apre un secondo archivio.
 */

export const EDICOLA_TITOLO = "EDICOLA TBH";
export const EDICOLA_SOTTOTITOLO =
  "News • Eventi • Sport • Musica • Cinema • TV • Animali • Oroscopo • Giochi.";

export const EDICOLA_NOTA =
  "L'Edicola pubblica solo contenuti che arrivano da fonti verificate o dalla redazione TBH. " +
  "Degli articoli delle testate esterne mostriamo titolo, sintesi breve, immagine dichiarata dal " +
  "feed, testata e data: il testo integrale si legge sulla fonte originale. Dove il materiale " +
  "ufficiale non c'è, la scheda lo dichiara e non lo inventa.";

export const EDICOLA_NOTA_ESTERNI =
  "Contenuto di una testata esterna: TBH non ne rivendica la proprietà e non ne ripubblica il testo integrale.";

/* ── CATEGORIE (i 16 caroselli della home Edicola) ────────────────────────── */

export type TipoCategoria =
  /** Alimentata dalle fonti esterne verificate. */
  | "esterna"
  /** Contenuti scritti dalla redazione TBH. */
  | "redazione"
  /** Sezione interna dell'Edicola (oroscopo, giochi). */
  | "interna"
  /** Richiama una sezione che esiste già nel portale: zero doppioni. */
  | "rimando";

export type CategoriaEdicola = {
  slug: string;
  emoji: string;
  titolo: string;
  descrizione: string;
  tipo: TipoCategoria;
  colore: string;
  /** Pagina canonica già esistente nel portale, quando la sezione c'è. */
  rimando?: { testo: string; href: string };
  /** Sottocategorie dichiarate dalla direzione. */
  sottocategorie?: string[];
};

export const CATEGORIE_EDICOLA: CategoriaEdicola[] = [
  {
    slug: "in-evidenza",
    emoji: "⭐",
    titolo: "In Evidenza TBH",
    descrizione:
      "La selezione della redazione: i contenuti con priorità più alta del momento, da tutte le sezioni dell'Edicola.",
    tipo: "redazione",
    colore: "#FFD400",
  },
  {
    slug: "ultima-ora",
    emoji: "🔴",
    titolo: "Ultima Ora",
    descrizione: "Le notizie appena uscite dalle testate nazionali verificate.",
    tipo: "esterna",
    colore: "#FF3B30",
  },
  {
    slug: "territorio",
    emoji: "📍",
    titolo: "Territorio",
    descrizione:
      "Rimini e Romagna, San Marino, Sanremo e Liguria, Padova e Veneto, Milano e Lombardia, Roma e Lazio.",
    tipo: "esterna",
    colore: "#2ED3B7",
  },
  {
    slug: "eventi",
    emoji: "🎪",
    titolo: "Eventi & Fiere",
    descrizione: "Fiere, festival, rassegne e appuntamenti con data e luogo dichiarati dalla fonte.",
    tipo: "esterna",
    colore: "#FF9F0A",
  },
  {
    slug: "sport",
    emoji: "⚽",
    titolo: "Sport",
    descrizione: "Calcio e sport dalle testate verificate. Le squadre seguite da TBH restano nella sezione Sport.",
    tipo: "esterna",
    colore: "#30D158",
    rimando: { testo: "Sport TBH", href: "/sport" },
  },
  {
    slug: "motorsport",
    emoji: "🏁",
    titolo: "Motorsport",
    descrizione: "Formula 1, MotoGP, circuiti e motori dalle fonti verificate.",
    tipo: "esterna",
    colore: "#FF453A",
    rimando: { testo: "Motorsport TBH", href: "/sport/motorsport" },
  },
  {
    slug: "musica",
    emoji: "🎵",
    titolo: "Musica",
    descrizione: "Dischi, live e classifiche dalle testate musicali verificate.",
    tipo: "esterna",
    colore: "#BF5AF2",
    rimando: { testo: "Musica TBH", href: "/musica" },
  },
  {
    slug: "cinema",
    emoji: "🎬",
    titolo: "Cinema & Spettacolo",
    descrizione: "Film, serie, spettacolo e cultura dalle fonti verificate.",
    tipo: "esterna",
    colore: "#64D2FF",
  },
  {
    slug: "guida-tv",
    emoji: "📺",
    titolo: "Guida TV",
    descrizione:
      "Notizie e anticipazioni televisive. Il palinsesto ora per ora non è in nessun feed autorizzato: non viene inventato.",
    tipo: "esterna",
    colore: "#5E5CE6",
    rimando: { testo: "Guida canali TBH", href: "/guida" },
  },
  {
    slug: "animali",
    emoji: "🐾",
    titolo: "Animali",
    descrizione: "Cani, gatti, pappagalli e uccelli, furetti, rettili, cavalli e altri animali.",
    tipo: "esterna",
    colore: "#FFD60A",
    sottocategorie: [
      "Cani",
      "Gatti",
      "Pappagalli e uccelli",
      "Furetti",
      "Rettili",
      "Cavalli",
      "Altri animali",
      "Educazione uomo-animale",
      "Eventi e discipline",
    ],
  },
  {
    slug: "uomo-animale",
    emoji: "🐕",
    titolo: "Uomo & Animale",
    descrizione:
      "Educazione, discipline e convivenza. Le federazioni e le associazioni contattate non espongono un feed pubblico: la sezione si apre quando arrivano i testi autorizzati.",
    tipo: "redazione",
    colore: "#AC8E68",
  },
  {
    slug: "oroscopo",
    emoji: "🔮",
    titolo: "Oroscopo",
    descrizione: "I 12 segni e il Segno del Giorno, con i testi della redazione TBH.",
    tipo: "interna",
    colore: "#F0A0FF",
    rimando: { testo: "Apri l'Oroscopo", href: "/edicola/oroscopo" },
  },
  {
    slug: "giochi",
    emoji: "🎮",
    titolo: "Giochi",
    descrizione: "Quiz, memory, sudoku e sondaggi TBH. Nessuna scommessa in denaro, mai.",
    tipo: "interna",
    colore: "#32D74B",
    rimando: { testo: "Apri i Giochi", href: "/edicola/giochi" },
  },
  {
    slug: "miss-cool",
    emoji: "👑",
    titolo: "Touch Miss Cool",
    descrizione: "Il concorso del gruppo: la pagina ufficiale è già nel portale, qui ne arrivano le novità.",
    tipo: "rimando",
    colore: "#FF6FD8",
    rimando: { testo: "Pagina ufficiale Miss Cool", href: "/eventi/miss-cool" },
  },
  {
    slug: "dm",
    emoji: "📺",
    titolo: "DM",
    descrizione: "DM Comunicazione: programmi, crew e produzioni restano sulle loro pagine canoniche.",
    tipo: "rimando",
    colore: "#0A84FF",
    rimando: { testo: "Apri DM", href: "/dm" },
  },
  {
    slug: "opportunita",
    emoji: "💼",
    titolo: "Opportunità TBH",
    descrizione:
      "Partnership, media, sponsor, hospitality, personale, turismo e commerciale: le occasioni del gruppo.",
    tipo: "rimando",
    colore: "#FFD400",
    rimando: { testo: "Lavoro & Casting", href: "/lavoro-casting" },
    sottocategorie: [
      "PARTNERSHIP",
      "MEDIA",
      "VIDEO",
      "SPONSOR",
      "HOSPITALITY",
      "PERSONALE",
      "TURISMO",
      "COMMERCIALE",
    ],
  },
];

export function categoriaEdicola(slug: string): CategoriaEdicola | null {
  return CATEGORIE_EDICOLA.find((c) => c.slug === slug) ?? null;
}

export function categoriaValida(slug: string): boolean {
  return CATEGORIE_EDICOLA.some((c) => c.slug === slug);
}

/* ── TERRITORI PRIORITARI (punto 4) ──────────────────────────────────────── */

export type TerritorioEdicola = {
  slug: string;
  nome: string;
  breve: string;
  /** Peso nell'ordinamento: il territorio TBH viene prima. */
  peso: number;
};

export const TERRITORI_EDICOLA: TerritorioEdicola[] = [
  { slug: "rimini", nome: "Rimini e Romagna", breve: "Rimini", peso: 30 },
  { slug: "san-marino", nome: "San Marino", breve: "San Marino", peso: 28 },
  { slug: "sanremo", nome: "Sanremo e Liguria", breve: "Sanremo", peso: 26 },
  { slug: "padova", nome: "Padova e Veneto", breve: "Padova", peso: 24 },
  { slug: "milano", nome: "Milano e Lombardia", breve: "Milano", peso: 22 },
  { slug: "roma", nome: "Roma e Lazio", breve: "Roma", peso: 20 },
  { slug: "italia", nome: "Italia", breve: "Italia", peso: 4 },
];

export function territorioEdicola(slug: string | null | undefined): TerritorioEdicola | null {
  if (!slug) return null;
  return TERRITORI_EDICOLA.find((t) => t.slug === slug) ?? null;
}

export function pesoTerritorio(slug: string | null | undefined): number {
  return territorioEdicola(slug)?.peso ?? 0;
}

/* ── OROSCOPO: i 12 segni, dati di fatto ─────────────────────────────────── */

export type SegnoZodiacale = {
  slug: string;
  nome: string;
  simbolo: string;
  /** Periodo convenzionale del segno. */
  dal: string;
  al: string;
  elemento: "Fuoco" | "Terra" | "Aria" | "Acqua";
  /** Mese-giorno di inizio e fine in formato MM-DD, per il calcolo del segno. */
  inizio: string;
  fine: string;
};

export const SEGNI_ZODIACALI: SegnoZodiacale[] = [
  { slug: "ariete", nome: "Ariete", simbolo: "♈", dal: "21 marzo", al: "19 aprile", elemento: "Fuoco", inizio: "03-21", fine: "04-19" },
  { slug: "toro", nome: "Toro", simbolo: "♉", dal: "20 aprile", al: "20 maggio", elemento: "Terra", inizio: "04-20", fine: "05-20" },
  { slug: "gemelli", nome: "Gemelli", simbolo: "♊", dal: "21 maggio", al: "20 giugno", elemento: "Aria", inizio: "05-21", fine: "06-20" },
  { slug: "cancro", nome: "Cancro", simbolo: "♋", dal: "21 giugno", al: "22 luglio", elemento: "Acqua", inizio: "06-21", fine: "07-22" },
  { slug: "leone", nome: "Leone", simbolo: "♌", dal: "23 luglio", al: "22 agosto", elemento: "Fuoco", inizio: "07-23", fine: "08-22" },
  { slug: "vergine", nome: "Vergine", simbolo: "♍", dal: "23 agosto", al: "22 settembre", elemento: "Terra", inizio: "08-23", fine: "09-22" },
  { slug: "bilancia", nome: "Bilancia", simbolo: "♎", dal: "23 settembre", al: "22 ottobre", elemento: "Aria", inizio: "09-23", fine: "10-22" },
  { slug: "scorpione", nome: "Scorpione", simbolo: "♏", dal: "23 ottobre", al: "21 novembre", elemento: "Acqua", inizio: "10-23", fine: "11-21" },
  { slug: "sagittario", nome: "Sagittario", simbolo: "♐", dal: "22 novembre", al: "21 dicembre", elemento: "Fuoco", inizio: "11-22", fine: "12-21" },
  { slug: "capricorno", nome: "Capricorno", simbolo: "♑", dal: "22 dicembre", al: "19 gennaio", elemento: "Terra", inizio: "12-22", fine: "01-19" },
  { slug: "acquario", nome: "Acquario", simbolo: "♒", dal: "20 gennaio", al: "18 febbraio", elemento: "Aria", inizio: "01-20", fine: "02-18" },
  { slug: "pesci", nome: "Pesci", simbolo: "♓", dal: "19 febbraio", al: "20 marzo", elemento: "Acqua", inizio: "02-19", fine: "03-20" },
];

export const OROSCOPO_NOTA =
  "L'Oroscopo TBH è scritto dalla redazione dal pannello: nessun testo viene generato dal sito e " +
  "nessuna API non autorizzata viene interrogata. Finché il testo del giorno non è stato scritto, " +
  "il segno mostra soltanto i suoi dati di fatto e la dicitura IN ALLESTIMENTO.";

export const OROSCOPO_AREE = [
  { chiave: "amore", titolo: "Amore", emoji: "❤️" },
  { chiave: "lavoro", titolo: "Lavoro", emoji: "💼" },
  { chiave: "fortuna", titolo: "Fortuna", emoji: "🍀" },
  { chiave: "benessere", titolo: "Benessere", emoji: "🌿" },
] as const;

export function segnoDiOggi(oggi = new Date()): SegnoZodiacale {
  const md = `${String(oggi.getMonth() + 1).padStart(2, "0")}-${String(oggi.getDate()).padStart(2, "0")}`;
  for (const s of SEGNI_ZODIACALI) {
    if (s.inizio <= s.fine) {
      if (md >= s.inizio && md <= s.fine) return s;
    } else if (md >= s.inizio || md <= s.fine) return s;
  }
  return SEGNI_ZODIACALI[0]!;
}

/** Il «Segno del Giorno»: gira ogni giorno in modo stabile, non a caso a ogni visita. */
export function segnoDelGiorno(oggi = new Date()): SegnoZodiacale {
  const giorni = Math.floor(oggi.getTime() / 86_400_000);
  return SEGNI_ZODIACALI[giorni % SEGNI_ZODIACALI.length]!;
}

export function segno(slug: string): SegnoZodiacale | null {
  return SEGNI_ZODIACALI.find((s) => s.slug === slug) ?? null;
}

/* ── GIOCHI (punto 7) ────────────────────────────────────────────────────── */

export type GiocoEdicola = {
  slug: string;
  titolo: string;
  emoji: string;
  descrizione: string;
  /** attivo = si gioca davvero adesso. in-allestimento = dichiarato, non finto. */
  stato: "attivo" | "in-allestimento";
  /** Dove si gioca: pagina canonica già esistente, niente doppioni. */
  href?: string;
  nota?: string;
};

export const GIOCHI_EDICOLA: GiocoEdicola[] = [
  {
    slug: "memory",
    titolo: "Memory dei 10 mondi TBH",
    emoji: "🧩",
    descrizione: "Accoppia i dieci mondi del gruppo. Gioco reale, già attivo, con gettoni veri.",
    stato: "attivo",
    href: "/media/giochi",
  },
  {
    slug: "quiz-tbh",
    titolo: "Quiz TBH",
    emoji: "❓",
    descrizione: "Domande sul gruppo costruite solo su fatti verificati del portale.",
    stato: "attivo",
    href: "/media/giochi",
  },
  {
    slug: "sudoku",
    titolo: "Sudoku 4×4",
    emoji: "🔢",
    descrizione: "Lo schema breve, buono per una pausa. Già attivo.",
    stato: "attivo",
    href: "/media/giochi",
  },
  { slug: "vero-falso", titolo: "Vero o Falso", emoji: "⚖️", descrizione: "Affermazioni da smentire o confermare.", stato: "in-allestimento", nota: "Serve una batteria di affermazioni verificate: nessuna domanda inventata." },
  { slug: "indovina", titolo: "Indovina", emoji: "🔍", descrizione: "Un dettaglio, un'immagine, una risposta.", stato: "in-allestimento", nota: "In attesa delle immagini ufficiali da usare." },
  { slug: "parola-del-giorno", titolo: "Parola del Giorno", emoji: "🔤", descrizione: "Una parola al giorno, da indovinare.", stato: "in-allestimento", nota: "In attesa dell'elenco parole della redazione." },
  { slug: "sondaggio", titolo: "Sondaggio", emoji: "📊", descrizione: "La domanda della settimana, con risultati reali.", stato: "in-allestimento", nota: "Si accende quando la redazione pubblica la prima domanda: nessun risultato finto." },
  { slug: "quiz-sport", titolo: "Quiz Sport", emoji: "⚽", descrizione: "Domande sullo sport.", stato: "in-allestimento", nota: "Domande da verificare una per una prima di pubblicarle." },
  { slug: "quiz-cinema", titolo: "Quiz Cinema", emoji: "🎬", descrizione: "Domande su film e serie.", stato: "in-allestimento", nota: "Domande da verificare una per una prima di pubblicarle." },
  { slug: "quiz-musica", titolo: "Quiz Musica", emoji: "🎵", descrizione: "Domande su dischi e artisti.", stato: "in-allestimento", nota: "Domande da verificare una per una prima di pubblicarle." },
];

export const GIOCHI_NOTA =
  "Nell'Edicola TBH non esiste e non esisterà nessuna scommessa in denaro: si gioca per i gettoni " +
  "TBH, e il valore di un eventuale bonus lo conferma sempre una persona del gruppo.";

/* ── PERCORSI CANONICI (un contenuto, un solo indirizzo) ─────────────────── */

export const EDICOLA_BASE = "/edicola";

export function percorsoCategoria(slug: string) {
  return `${EDICOLA_BASE}/${slug}`;
}

export function percorsoArticolo(slug: string) {
  return `${EDICOLA_BASE}/articolo/${slug}`;
}

export function percorsoEvento(slug: string) {
  return `${EDICOLA_BASE}/eventi/${slug}`;
}

/** L'indirizzo canonico di un contenuto: evento o articolo, mai due pagine. */
export function percorsoContenuto(c: { slug: string; category: string; eventDate?: string | null }) {
  return c.category === "eventi" || c.eventDate ? percorsoEvento(c.slug) : percorsoArticolo(c.slug);
}
