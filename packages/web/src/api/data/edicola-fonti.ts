/**
 * EDICOLA TBH — REGISTRO DELLE FONTI VERIFICATE (20/09/2026).
 *
 * REGOLA FERREA: qui dentro non esiste un solo feed «plausibile». Ogni riga è
 * stata provata con una richiesta reale il 20/09/2026 e ha risposto 200 con un
 * numero di articoli davvero presenti (`itemVerificati`). I feed che hanno dato
 * 404, 403, 503, DNS assente o zero articoli NON sono in questo elenco: stanno
 * in `FONTI_SCARTATE`, dichiarate con il motivo, così nessuno le ricarica per
 * sbaglio pensando che siano state dimenticate.
 *
 * Di ogni articolo esterno l'Edicola conserva solo i dati consentiti — titolo,
 * sintesi breve, immagine dichiarata dal feed, nome della testata, data — e non
 * copia mai il testo integrale: il pulsante «LEGGI SULLA FONTE» apre l'originale.
 *
 * Questo elenco è il punto di partenza: le fonti si accendono, si spengono, si
 * correggono e si aggiungono dal pannello ADMIN (tabella `edicola_fonti`), senza
 * toccare il codice.
 */

export type FonteEdicola = {
  slug: string;
  nome: string;
  /** Indirizzo del feed RSS/Atom, verificato. */
  feedUrl: string;
  /** Sito ufficiale della testata (attribuzione). */
  sitoUrl: string;
  categoria: string;
  sottocategoria?: string;
  /** Territorio TBH: rimini | san-marino | sanremo | padova | milano | roma | italia */
  territorio: string;
  /** Il feed dichiara un'immagine per gli articoli? Verificato, non supposto. */
  immagini: boolean;
  /** Articoli trovati nella verifica del 20/09/2026. */
  itemVerificati: number;
  verificatoIl: string;
  /** Priorità editoriale della fonte (entra nell'ordinamento, non è casuale). */
  priorita?: number;
  nota?: string;
};

const V = "2026-09-20";

export const FONTI_EDICOLA: FonteEdicola[] = [
  /* ── ULTIMA ORA · testate nazionali ─────────────────────────────────────── */
  { slug: "ansa-homepage", nome: "ANSA", feedUrl: "https://www.ansa.it/sito/ansait_rss.xml", sitoUrl: "https://www.ansa.it", categoria: "ultima-ora", territorio: "italia", immagini: false, itemVerificati: 28, verificatoIl: V, priorita: 6 },
  { slug: "rainews", nome: "Rainews", feedUrl: "https://www.rainews.it/rss/tutti", sitoUrl: "https://www.rainews.it", categoria: "ultima-ora", territorio: "italia", immagini: true, itemVerificati: 40, verificatoIl: V, priorita: 5 },
  { slug: "tgcom24", nome: "TGCOM24", feedUrl: "https://www.tgcom24.mediaset.it/rss/homepage.xml", sitoUrl: "https://www.tgcom24.mediaset.it", categoria: "ultima-ora", territorio: "italia", immagini: true, itemVerificati: 30, verificatoIl: V, priorita: 4 },
  { slug: "corriere-homepage", nome: "Corriere della Sera", feedUrl: "https://xml2.corriereobjects.it/rss/homepage.xml", sitoUrl: "https://www.corriere.it", categoria: "ultima-ora", territorio: "italia", immagini: true, itemVerificati: 69, verificatoIl: V, priorita: 4 },
  { slug: "repubblica-home", nome: "la Repubblica", feedUrl: "https://www.repubblica.it/rss/homepage/rss2.0.xml", sitoUrl: "https://www.repubblica.it", categoria: "ultima-ora", territorio: "italia", immagini: false, itemVerificati: 30, verificatoIl: V, priorita: 3 },
  { slug: "sole24ore-italia", nome: "Il Sole 24 Ore", feedUrl: "https://www.ilsole24ore.com/rss/italia.xml", sitoUrl: "https://www.ilsole24ore.com", categoria: "ultima-ora", territorio: "italia", immagini: true, itemVerificati: 12, verificatoIl: V, priorita: 3 },
  { slug: "agi-cronaca", nome: "AGI", feedUrl: "https://www.agi.it/cronaca/rss", sitoUrl: "https://www.agi.it", categoria: "ultima-ora", territorio: "italia", immagini: true, itemVerificati: 20, verificatoIl: V, priorita: 3 },

  /* ── TERRITORIO · Rimini e Romagna ──────────────────────────────────────── */
  { slug: "ansa-emilia-romagna", nome: "ANSA Emilia-Romagna", feedUrl: "https://www.ansa.it/emiliaromagna/notizie/emiliaromagna_rss.xml", sitoUrl: "https://www.ansa.it/emiliaromagna", categoria: "territorio", territorio: "rimini", immagini: false, itemVerificati: 32, verificatoIl: V, priorita: 8 },
  { slug: "riminitoday", nome: "RiminiToday", feedUrl: "https://www.riminitoday.it/rss/", sitoUrl: "https://www.riminitoday.it", categoria: "territorio", territorio: "rimini", immagini: true, itemVerificati: 25, verificatoIl: V, priorita: 9 },
  { slug: "chiamamicitta", nome: "Chiamami Città", feedUrl: "https://www.chiamamicitta.it/feed/", sitoUrl: "https://www.chiamamicitta.it", categoria: "territorio", territorio: "rimini", immagini: false, itemVerificati: 10, verificatoIl: V, priorita: 8 },
  { slug: "altarimini", nome: "AltaRimini", feedUrl: "https://www.altarimini.it/feed/", sitoUrl: "https://www.altarimini.it", categoria: "territorio", territorio: "rimini", immagini: true, itemVerificati: 20, verificatoIl: V, priorita: 8 },
  { slug: "bolognatoday", nome: "BolognaToday", feedUrl: "https://www.bolognatoday.it/rss/", sitoUrl: "https://www.bolognatoday.it", categoria: "territorio", sottocategoria: "Emilia", territorio: "rimini", immagini: true, itemVerificati: 25, verificatoIl: V, priorita: 4, nota: "Area Emilia: entra nel territorio Rimini/Romagna come contorno regionale." },

  /* ── TERRITORIO · San Marino ────────────────────────────────────────────── */
  { slug: "libertas-sm", nome: "Libertas San Marino", feedUrl: "https://www.libertas.sm/feed/", sitoUrl: "https://www.libertas.sm", categoria: "territorio", territorio: "san-marino", immagini: true, itemVerificati: 100, verificatoIl: V, priorita: 9, nota: "San Marino RTV non espone un feed raggiungibile: verificato 404 il 20/09/2026." },

  /* ── TERRITORIO · Sanremo e Liguria ─────────────────────────────────────── */
  { slug: "riviera24", nome: "Riviera24", feedUrl: "https://www.riviera24.it/feed/", sitoUrl: "https://www.riviera24.it", categoria: "territorio", territorio: "sanremo", immagini: false, itemVerificati: 10, verificatoIl: V, priorita: 9 },
  { slug: "ansa-liguria", nome: "ANSA Liguria", feedUrl: "https://www.ansa.it/liguria/notizie/liguria_rss.xml", sitoUrl: "https://www.ansa.it/liguria", categoria: "territorio", territorio: "sanremo", immagini: false, itemVerificati: 36, verificatoIl: V, priorita: 7 },
  { slug: "genovatoday", nome: "GenovaToday", feedUrl: "https://www.genovatoday.it/rss/", sitoUrl: "https://www.genovatoday.it", categoria: "territorio", territorio: "sanremo", immagini: true, itemVerificati: 25, verificatoIl: V, priorita: 5 },

  /* ── TERRITORIO · Padova e Veneto ───────────────────────────────────────── */
  { slug: "padovaoggi", nome: "PadovaOggi", feedUrl: "https://www.padovaoggi.it/rss/", sitoUrl: "https://www.padovaoggi.it", categoria: "territorio", territorio: "padova", immagini: true, itemVerificati: 25, verificatoIl: V, priorita: 9 },
  { slug: "ansa-veneto", nome: "ANSA Veneto", feedUrl: "https://www.ansa.it/veneto/notizie/veneto_rss.xml", sitoUrl: "https://www.ansa.it/veneto", categoria: "territorio", territorio: "padova", immagini: false, itemVerificati: 24, verificatoIl: V, priorita: 7 },
  { slug: "trevisotoday", nome: "TrevisoToday", feedUrl: "https://www.trevisotoday.it/rss/", sitoUrl: "https://www.trevisotoday.it", categoria: "territorio", territorio: "padova", immagini: true, itemVerificati: 25, verificatoIl: V, priorita: 4 },

  /* ── TERRITORIO · Milano e Lombardia ────────────────────────────────────── */
  { slug: "milanotoday", nome: "MilanoToday", feedUrl: "https://www.milanotoday.it/rss/", sitoUrl: "https://www.milanotoday.it", categoria: "territorio", territorio: "milano", immagini: true, itemVerificati: 25, verificatoIl: V, priorita: 9 },
  { slug: "ansa-lombardia", nome: "ANSA Lombardia", feedUrl: "https://www.ansa.it/lombardia/notizie/lombardia_rss.xml", sitoUrl: "https://www.ansa.it/lombardia", categoria: "territorio", territorio: "milano", immagini: false, itemVerificati: 46, verificatoIl: V, priorita: 7 },

  /* ── TERRITORIO · Roma e Lazio ──────────────────────────────────────────── */
  { slug: "romatoday", nome: "RomaToday", feedUrl: "https://www.romatoday.it/rss/", sitoUrl: "https://www.romatoday.it", categoria: "territorio", territorio: "roma", immagini: true, itemVerificati: 25, verificatoIl: V, priorita: 9 },
  { slug: "ansa-lazio", nome: "ANSA Lazio", feedUrl: "https://www.ansa.it/lazio/notizie/lazio_rss.xml", sitoUrl: "https://www.ansa.it/lazio", categoria: "territorio", territorio: "roma", immagini: false, itemVerificati: 29, verificatoIl: V, priorita: 7 },

  /* ── EVENTI & FIERE ─────────────────────────────────────────────────────── */
  { slug: "visitrimini", nome: "Visit Rimini", feedUrl: "https://www.visitrimini.com/feed/", sitoUrl: "https://www.visitrimini.com", categoria: "eventi", territorio: "rimini", immagini: false, itemVerificati: 10, verificatoIl: V, priorita: 8 },
  { slug: "bolognafiere", nome: "BolognaFiere", feedUrl: "https://www.bolognafiere.it/feed/", sitoUrl: "https://www.bolognafiere.it", categoria: "eventi", sottocategoria: "Fiere", territorio: "italia", immagini: false, itemVerificati: 10, verificatoIl: V, priorita: 6, nota: "IEG / Rimini Fiera non espone un feed raggiungibile: verificato 404 il 20/09/2026." },

  /* ── SPORT ──────────────────────────────────────────────────────────────── */
  { slug: "gazzetta-home", nome: "Gazzetta dello Sport", feedUrl: "https://www.gazzetta.it/rss/home.xml", sitoUrl: "https://www.gazzetta.it", categoria: "sport", territorio: "italia", immagini: true, itemVerificati: 125, verificatoIl: V, priorita: 6 },
  { slug: "gazzetta-calcio", nome: "Gazzetta · Calcio", feedUrl: "https://www.gazzetta.it/rss/calcio.xml", sitoUrl: "https://www.gazzetta.it/calcio", categoria: "sport", sottocategoria: "Calcio", territorio: "italia", immagini: true, itemVerificati: 100, verificatoIl: V, priorita: 6 },
  { slug: "ansa-calcio", nome: "ANSA Calcio", feedUrl: "https://www.ansa.it/sito/notizie/sport/calcio/calcio_rss.xml", sitoUrl: "https://www.ansa.it/sito/notizie/sport/calcio", categoria: "sport", sottocategoria: "Calcio", territorio: "italia", immagini: false, itemVerificati: 85, verificatoIl: V, priorita: 5 },
  { slug: "ansa-sport", nome: "ANSA Sport", feedUrl: "https://www.ansa.it/sito/notizie/sport/sport_rss.xml", sitoUrl: "https://www.ansa.it/sito/notizie/sport", categoria: "sport", territorio: "italia", immagini: false, itemVerificati: 52, verificatoIl: V, priorita: 5 },
  { slug: "skysport", nome: "Sky Sport", feedUrl: "https://sport.sky.it/rss/sport.xml", sitoUrl: "https://sport.sky.it", categoria: "sport", territorio: "italia", immagini: true, itemVerificati: 100, verificatoIl: V, priorita: 5 },
  { slug: "corriere-sport", nome: "Corriere · Sport", feedUrl: "https://xml2.corriereobjects.it/rss/sport.xml", sitoUrl: "https://www.corriere.it/sport", categoria: "sport", territorio: "italia", immagini: true, itemVerificati: 49, verificatoIl: V, priorita: 4 },

  /* ── MOTORSPORT ─────────────────────────────────────────────────────────── */
  { slug: "gazzetta-motori", nome: "Gazzetta · Motori", feedUrl: "https://www.gazzetta.it/rss/motori.xml", sitoUrl: "https://www.gazzetta.it/motori", categoria: "motorsport", territorio: "italia", immagini: true, itemVerificati: 101, verificatoIl: V, priorita: 6 },
  { slug: "ansa-motori", nome: "ANSA Motori", feedUrl: "https://www.ansa.it/canale_motori/notizie/motori_rss.xml", sitoUrl: "https://www.ansa.it/canale_motori", categoria: "motorsport", territorio: "italia", immagini: false, itemVerificati: 29, verificatoIl: V, priorita: 5 },
  { slug: "fia-news", nome: "FIA", feedUrl: "https://www.fia.com/rss/news", sitoUrl: "https://www.fia.com", categoria: "motorsport", sottocategoria: "Formula 1 / FIA", territorio: "italia", immagini: false, itemVerificati: 10, verificatoIl: V, priorita: 6, nota: "Fonte ufficiale FIA, in lingua inglese." },
  { slug: "cds-motori", nome: "Corriere dello Sport · Motori", feedUrl: "https://www.corrieredellosport.it/rss/motori", sitoUrl: "https://www.corrieredellosport.it/motori", categoria: "motorsport", territorio: "italia", immagini: true, itemVerificati: 30, verificatoIl: V, priorita: 5 },
  { slug: "motorionline", nome: "Motorionline", feedUrl: "https://www.motorionline.com/feed/", sitoUrl: "https://www.motorionline.com", categoria: "motorsport", territorio: "italia", immagini: true, itemVerificati: 30, verificatoIl: V, priorita: 4 },
  { slug: "gpone", nome: "GPone", feedUrl: "https://www.gpone.com/it/rss.xml", sitoUrl: "https://www.gpone.com", categoria: "motorsport", sottocategoria: "Moto", territorio: "italia", immagini: false, itemVerificati: 50, verificatoIl: V, priorita: 5 },
  { slug: "formulapassion", nome: "FormulaPassion", feedUrl: "https://www.formulapassion.it/feed", sitoUrl: "https://www.formulapassion.it", categoria: "motorsport", territorio: "italia", immagini: false, itemVerificati: 20, verificatoIl: V, priorita: 4 },

  /* ── MUSICA ─────────────────────────────────────────────────────────────── */
  { slug: "allmusicitalia", nome: "All Music Italia", feedUrl: "https://www.allmusicitalia.it/feed", sitoUrl: "https://www.allmusicitalia.it", categoria: "musica", territorio: "italia", immagini: true, itemVerificati: 25, verificatoIl: V, priorita: 6 },

  /* ── CINEMA & SPETTACOLO ────────────────────────────────────────────────── */
  { slug: "ansa-cinema", nome: "ANSA Cinema", feedUrl: "https://www.ansa.it/sito/notizie/cultura/cinema/cinema_rss.xml", sitoUrl: "https://www.ansa.it/sito/notizie/cultura/cinema", categoria: "cinema", territorio: "italia", immagini: false, itemVerificati: 25, verificatoIl: V, priorita: 6 },
  { slug: "repubblica-spettacoli", nome: "Repubblica · Spettacoli", feedUrl: "https://www.repubblica.it/rss/spettacoli_e_cultura/rss2.0.xml", sitoUrl: "https://www.repubblica.it/spettacoli", categoria: "cinema", territorio: "italia", immagini: true, itemVerificati: 15, verificatoIl: V, priorita: 5 },
  { slug: "badtaste", nome: "BadTaste", feedUrl: "https://www.badtaste.it/feed/", sitoUrl: "https://www.badtaste.it", categoria: "cinema", territorio: "italia", immagini: true, itemVerificati: 20, verificatoIl: V, priorita: 4 },
  { slug: "ansa-cultura", nome: "ANSA Cultura", feedUrl: "https://www.ansa.it/sito/notizie/cultura/cultura_rss.xml", sitoUrl: "https://www.ansa.it/sito/notizie/cultura", categoria: "cinema", sottocategoria: "Cultura", territorio: "italia", immagini: false, itemVerificati: 175, verificatoIl: V, priorita: 3 },

  /* ── GUIDA TV ───────────────────────────────────────────────────────────── */
  { slug: "tvblog", nome: "TvBlog", feedUrl: "https://www.tvblog.it/feed", sitoUrl: "https://www.tvblog.it", categoria: "guida-tv", territorio: "italia", immagini: false, itemVerificati: 40, verificatoIl: V, priorita: 6, nota: "Notizie e anticipazioni TV. Il palinsesto ora per ora non è in questo feed: non si inventa." },
  { slug: "davidemaggio", nome: "DavideMaggio.it", feedUrl: "https://www.davidemaggio.it/feed", sitoUrl: "https://www.davidemaggio.it", categoria: "guida-tv", territorio: "italia", immagini: false, itemVerificati: 10, verificatoIl: V, priorita: 5 },

  /* ── ANIMALI ────────────────────────────────────────────────────────────── */
  { slug: "kodami", nome: "Kodami", feedUrl: "https://www.kodami.it/feed/", sitoUrl: "https://www.kodami.it", categoria: "animali", territorio: "italia", immagini: false, itemVerificati: 10, verificatoIl: V, priorita: 6 },
  { slug: "quattrozampe", nome: "Quattro Zampe", feedUrl: "https://www.quattrozampe.online/feed/", sitoUrl: "https://www.quattrozampe.online", categoria: "animali", territorio: "italia", immagini: true, itemVerificati: 10, verificatoIl: V, priorita: 6 },
  { slug: "petsblog", nome: "PetsBlog", feedUrl: "https://www.petsblog.it/feed", sitoUrl: "https://www.petsblog.it", categoria: "animali", territorio: "italia", immagini: false, itemVerificati: 31, verificatoIl: V, priorita: 4 },
  { slug: "oipa", nome: "OIPA Italia", feedUrl: "https://www.oipa.org/italia/feed/", sitoUrl: "https://www.oipa.org/italia", categoria: "animali", sottocategoria: "Tutela e adozioni", territorio: "italia", immagini: true, itemVerificati: 10, verificatoIl: V, priorita: 5 },
];

/**
 * FONTI PROVATE E SCARTATE — si tengono scritte per non riprovarle a vuoto e
 * per poter dire a Claudio, con precisione, PERCHÉ una testata che aspettava
 * non c'è. Nessuna di queste alimenta il sito.
 */
export const FONTI_SCARTATE: { nome: string; feedUrl: string; motivo: string }[] = [
  { nome: "Sentireascoltare", feedUrl: "https://sentireascoltare.com/feed/", motivo: "HTTP 403 al ricontrollo del 20/09/2026: il sito blocca la lettura automatica. Fuori dall'Edicola finché non risponde." },
  { nome: "San Marino RTV", feedUrl: "https://www.sanmarinortv.sm/rss", motivo: "404 su /rss, /feed e /news/feed (20/09/2026): la TV di Stato non espone un feed pubblico." },
  { nome: "Corriere Romagna", feedUrl: "https://www.corriereromagna.it/feed/", motivo: "Feed non raggiungibile (20/09/2026)." },
  { nome: "NewsRimini", feedUrl: "https://www.newsrimini.it/feed/", motivo: "403: accesso automatico bloccato dalla testata." },
  { nome: "Sanremonews", feedUrl: "https://www.sanremonews.it/rss/", motivo: "Feed non raggiungibile (20/09/2026)." },
  { nome: "Il Post", feedUrl: "https://www.ilpost.it/feed/", motivo: "403: accesso automatico bloccato." },
  { nome: "Fanpage", feedUrl: "https://www.fanpage.it/feed/", motivo: "403: accesso automatico bloccato." },
  { nome: "Repubblica Sport", feedUrl: "https://www.repubblica.it/rss/sport/rss2.0.xml", motivo: "404: il feed sport non esiste." },
  { nome: "Rockol", feedUrl: "https://www.rockol.it/rss/news", motivo: "403 e 404 sugli indirizzi alternativi." },
  { nome: "ComingSoon", feedUrl: "https://www.comingsoon.it/rss/cinema/", motivo: "Feed non raggiungibile (20/09/2026)." },
  { nome: "MyMovies", feedUrl: "https://www.mymovies.it/rss/news.xml", motivo: "404." },
  { nome: "CONI", feedUrl: "https://www.coni.it/it/rss.html", motivo: "503: servizio non disponibile." },
  { nome: "CSEN", feedUrl: "https://www.csen.it/feed/", motivo: "503: servizio non disponibile." },
  { nome: "FIGC", feedUrl: "https://www.figc.it/it/rss/", motivo: "Risponde 200 ma con zero articoli: non utilizzabile." },
  { nome: "FISE", feedUrl: "https://www.fise.it/feed/", motivo: "404: nessun feed equitazione ufficiale." },
  { nome: "ENCI", feedUrl: "https://www.enci.it/feed/", motivo: "404: nessun feed cinofilo ufficiale." },
  { nome: "ENPA", feedUrl: "https://www.enpa.it/news/feed/", motivo: "Risponde 200 ma con zero articoli." },
  { nome: "MotoGP.com", feedUrl: "https://www.motogp.com/en/news/rss", motivo: "404." },
  { nome: "ACI Sport", feedUrl: "https://www.acisport.it/it/feed/", motivo: "403." },
  { nome: "Misano World Circuit", feedUrl: "https://www.misanocircuit.com/feed/", motivo: "Risponde 200 ma con zero articoli." },
  { nome: "IEG · Rimini Fiera", feedUrl: "https://www.iegexpo.it/it/rss", motivo: "404: nessun feed pubblico." },
  { nome: "Fiera Milano", feedUrl: "https://www.fieramilano.it/rss.html", motivo: "Risponde 200 ma con zero articoli." },
  { nome: "Ministero della Cultura", feedUrl: "https://cultura.gov.it/comunicati/rss", motivo: "404 su entrambi gli indirizzi provati." },
  { nome: "Comune di Sanremo", feedUrl: "https://www.comune.sanremo.im.it/feed/", motivo: "410 Gone." },
  { nome: "Comune di Padova", feedUrl: "https://www.padovanet.it/rss.xml", motivo: "404." },
  { nome: "Comune di Milano", feedUrl: "https://www.comune.milano.it/rss", motivo: "403." },
  { nome: "Comune di Roma", feedUrl: "https://www.comune.roma.it/rss", motivo: "Risponde 200 ma con zero articoli." },
  { nome: "Sky TG24", feedUrl: "https://tg24.sky.it/rss", motivo: "404 sull'indirizzo provato." },
  { nome: "Adnkronos", feedUrl: "https://www.adnkronos.com/rss", motivo: "Risponde 200 ma con zero articoli." },
  { nome: "Emilia Romagna Turismo", feedUrl: "https://www.emiliaromagnaturismo.it/feed/", motivo: "Risponde 200 ma con zero articoli." },
  { nome: "ANSA Musica", feedUrl: "https://www.ansa.it/sito/notizie/cultura/musica/musica_rss.xml", motivo: "Feed non raggiungibile (20/09/2026)." },
];

export function fonte(slug: string) {
  return FONTI_EDICOLA.find((f) => f.slug === slug) ?? null;
}

export function fontiPerCategoria(categoria: string) {
  return FONTI_EDICOLA.filter((f) => f.categoria === categoria);
}

/** Categorie dell'Edicola che hanno almeno una fonte esterna verificata. */
export function categorieConFonti(): string[] {
  return [...new Set(FONTI_EDICOLA.map((f) => f.categoria))];
}
