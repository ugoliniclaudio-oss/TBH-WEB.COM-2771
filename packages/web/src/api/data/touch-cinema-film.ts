/**
 * TOUCH CINEMA · PROIEZIONI — i tre film indicati da Claudio il 28/10/2026, NELL'ORDINE dato.
 *
 * Ogni dato viene da una fonte verificata il 28/10/2026 (elencate in `fonti`):
 *   · titolo YouTube, durata e miniatura: pagina del video su YouTube (lengthSeconds, miniatura
 *     maxresdefault 1280×720, copiata in public/channel/touch-cinema/<slug>.jpg);
 *   · titolo del film, anno, regia, cast e trama: descrizione del video + schede pubbliche
 *     (IMDb, MYmovies, CG Entertainment, ANSA). Trama e cast sono legati SOLO al proprio titolo.
 *   · i tre video su YouTube sono visibili solo dall'Italia (Città del Vaticano e San Marino per
 *     il secondo): fuori da quei Paesi il player è bloccato e si mostra «Guarda su YouTube».
 * Nessun orario: finché non viene definito si mostra «Contenuti disponibili».
 */

export type FilmTouchCinema = {
  slug: string;
  videoId: string;
  /** Titolo del film (scheda ufficiale). */
  titolo: string;
  /** Titolo esatto del video su YouTube. */
  titoloYouTube: string;
  canaleYouTube: string;
  anno: number;
  /** Nota su date discordanti fra le fonti (mostrata nella scheda). */
  notaAnno?: string;
  /** Durata del video su YouTube, in secondi. */
  durataSec: number;
  genere: string;
  paese: string;
  regia: string;
  sceneggiatura?: string;
  cast: string[];
  /** Interpreti e personaggi quando la fonte li indica. */
  ruoli?: { attore: string; personaggio: string }[];
  /** Trama in breve, riscritta dalle fonti indicate in `fonteTrama`. */
  trama: string;
  fonteTrama: string;
  /** Legame con gli altri film della scaletta (prequel/sequel), se esiste. */
  legame?: string;
  miniatura: string;
  fonti: { nome: string; url: string }[];
};

export const yt = (id: string) => `https://www.youtube.com/watch?v=${id}`;

export const FILM_TOUCH_CINEMA: FilmTouchCinema[] = [
  {
    slug: "la-banda-del-buffardello-e-il-manoscritto-di-leonardo-da-vinci",
    videoId: "-TAPcj1H1Lw",
    titolo: "La Banda del Buffardello e il manoscritto di Leonardo da Vinci",
    titoloYouTube: "La banda del buffardello e il manoscritto di Leonardo Da Vinci - Film completo/Full movie",
    canaleYouTube: "CG Entertainment",
    anno: 2022,
    notaAnno: "Uscito in Italia il 1° marzo 2022 (IMDb, MYmovies); la scheda di CG Entertainment indica il 2023.",
    durataSec: 5620,
    genere: "Commedia",
    paese: "Italia",
    regia: "Mario Chiavalin",
    cast: ["Maurizio Mattioli", "Pippo Franco", "Rudy Smaila", "Tatiana Previati", "Cesare Ragazzi", "Max Cavallari", "Umberto Smaila"],
    ruoli: [
      { attore: "Umberto Smaila", personaggio: "Aldebrando Testori" },
      { attore: "Rudy Smaila", personaggio: "Giovanni" },
      { attore: "Tatiana Previati", personaggio: "Deborah" },
      { attore: "Pippo Franco", personaggio: "il professor Tornabuoni" },
      { attore: "Maurizio Mattioli", personaggio: "il Pinturicchio" },
      { attore: "Max Cavallari", personaggio: "Marco Contini Bonaccorsi" },
      { attore: "Cesare Ragazzi", personaggio: "il maresciallo dei carabinieri" },
    ],
    trama:
      "Aldebrando Testori, editore fallito e senza un soldo, ha un'idea: mettere in piedi una banda di falsari, creare un finto manoscritto di Leonardo da Vinci e venderlo a un'asta come autentico. Gli servono Giovanni, scrittore, e Deborah, abile disegnatrice; il professor Tornabuoni, capace di invecchiare l'inchiostro; il Pinturicchio, che falsifica qualsiasi firma; e l'antiquario Marco Contini Bonaccorsi. Ma il maresciallo dei carabinieri abita proprio sotto il loro covo segreto.",
    fonteTrama: "MYmovies, scheda del film (20/10/2022)",
    legame: "Primo film della Banda del Buffardello: il seguito è «L'Elisir di Leonardo da Vinci e la Banda del Buffardello» (2024).",
    miniatura: "/channel/touch-cinema/la-banda-del-buffardello-e-il-manoscritto-di-leonardo-da-vinci.jpg",
    fonti: [
      { nome: "YouTube · CG Entertainment", url: yt("-TAPcj1H1Lw") },
      { nome: "IMDb", url: "https://www.imdb.com/title/tt22819556/" },
      { nome: "MYmovies", url: "https://www.mymovies.it/film/2022/la-banda-del-buffardello-e-il-manoscritto-di-leonardo-da-vinci/" },
      { nome: "CG Entertainment", url: "https://cgtv.it/product/la-banda-del-buffardello-e-il-manoscritto-di-leonardo-da-vinci/" },
    ],
  },
  {
    slug: "l-elisir-di-leonardo-da-vinci-e-la-banda-del-buffardello",
    videoId: "U-XejC20eEw",
    titolo: "L'Elisir di Leonardo da Vinci e la Banda del Buffardello",
    titoloYouTube: "L elisir E La Banda Del Buffardello HD Film Commedia in Italiano",
    canaleYouTube: "Film Italia",
    anno: 2024,
    notaAnno: "Nelle sale italiane dal 14 marzo 2024.",
    durataSec: 5440,
    genere: "Commedia",
    paese: "Italia",
    regia: "Mario Chiavalin",
    cast: [
      "Maurizio Mattioli",
      "Pippo Franco",
      "Sergio Vastano",
      "Umberto Smaila",
      "Salvatore Misticone",
      "Luca Marchi",
      "Erika Franceschini",
      "Filippo Crispo",
    ],
    trama:
      "La Banda del Buffardello si è sciolta da tempo e ognuno è tornato alla propria vita. Tutto cambia con il ritorno di Max Mosley, ricco produttore americano, che vuole riunire la banda: ha trovato una vecchia pergamena firmata da Leonardo da Vinci con la ricetta di un vino specialissimo, un elisir d'amore. Per crearlo bisogna risolvere una serie di enigmi, e la banda torna insieme sulle orme del Genio.",
    fonteTrama: "Descrizione ufficiale del video su YouTube (Film Italia)",
    legame: "Seguito de «La Banda del Buffardello e il manoscritto di Leonardo da Vinci» (2022).",
    miniatura: "/channel/touch-cinema/l-elisir-di-leonardo-da-vinci-e-la-banda-del-buffardello.jpg",
    fonti: [
      { nome: "YouTube · Film Italia", url: yt("U-XejC20eEw") },
      { nome: "IMDb", url: "https://www.imdb.com/title/tt29861225/" },
      { nome: "Davinotti", url: "https://www.davinotti.com/film/l-elisir-di-leonardo-da-vinci-e-la-banda-del-buffardello-2024" },
    ],
  },
  {
    slug: "il-circo-delle-meraviglie",
    videoId: "MGBmy3dBpUQ",
    titolo: "Il circo delle meraviglie",
    titoloYouTube: "Il circo delle meraviglie - Film completo/Full movie",
    canaleYouTube: "CG Entertainment",
    anno: 2024,
    notaAnno: "Anteprima nazionale il 18 maggio 2024 a Nola e Abano Terme.",
    durataSec: 5159,
    genere: "Commedia romantica",
    paese: "Italia",
    regia: "Mario Chiavalin",
    sceneggiatura: "Mario Chiavalin con Luca Arnaù",
    cast: [
      "Remo Girone",
      "Pippo Franco",
      "Salvatore Misticone",
      "Iva Zanicchi",
      "Chiara Boveri",
      "Erik Triulzi",
      "Manuela Metri",
      "Max Pieriboni",
      "Ambra Orfei",
      "Gioia Orfei",
      "Antonella Splendore",
      "Miriana Sermini",
      "Alfio Visalli",
      "Melina Arena",
      "Ginevra Orfei",
      "Cristina Castanhito",
    ],
    trama:
      "Il Circo delle Meraviglie pianta il suo tendone sul piazzale di un immaginario paesino ligure, fatto di tradizioni e di magia. Qui nasce l'amore tra Sofia, detta la Principessa Volante, erede di una grande famiglia circense, e Andrea, rampollo di un ricco imprenditore navale. Il loro sentimento ricorda agli artisti quanto sia bello mettere radici e riporta un po' di magia nel cuore di chi, come Giovanni Battista Parodi, ha dimenticato cosa significhi stupirsi.",
    fonteTrama: "ANSA (16/05/2024) e Taxidrivers (14/05/2024)",
    miniatura: "/channel/touch-cinema/il-circo-delle-meraviglie.jpg",
    fonti: [
      { nome: "YouTube · CG Entertainment", url: yt("MGBmy3dBpUQ") },
      { nome: "IMDb", url: "https://www.imdb.com/title/tt29861602/" },
      { nome: "ANSA", url: "https://www.ansa.it/sito/notizie/cultura/cinema/2024/05/16/da-pippo-franco-a-iva-zanicchi-ecco-il-circo-delle-meraviglie_cffb69b9-dafb-46ad-9443-07a295608ded.html" },
      { nome: "Taxidrivers", url: "https://www.taxidrivers.it/374110/latest-news/da-pippo-franco-a-iva-zanicchi-arriva-il-circo-delle-meraviglie.html" },
      { nome: "CG Entertainment", url: "https://cgtv.it/product/il-circo-delle-meraviglie/" },
    ],
  },
];

export const filmPerSlug = (slug: string) => FILM_TOUCH_CINEMA.find((f) => f.slug === slug);

export const schedaFilm = (slug: string) => `/channel/touch-cinema/film/${slug}`;

/** «1 h 33 min 40 s» → per la scheda; mai stimata, viene da YouTube. */
export function durataLeggibile(sec: number) {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  return `${h > 0 ? `${h} h ` : ""}${m} min${s ? ` ${s} s` : ""}`;
}

/** «1:33:40», come sul player. */
export function durataOrologio(sec: number) {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  return `${h > 0 ? `${h}:` : ""}${String(m).padStart(h > 0 ? 2 : 1, "0")}:${String(s).padStart(2, "0")}`;
}
