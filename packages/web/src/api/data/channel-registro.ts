import { CHANNEL_HOME, titoloChannel, type ChannelHome, type FilaChannel } from "./channel-home";
import { CHANNEL_IN_PREPARAZIONE } from "./channel-in-preparazione";
import { LOGHI_CHANNEL, logoDelChannel } from "./loghi-channel";

/**
 * REGISTRO UNICO DEI CHANNEL — TBH-WEB ampliamento del 28/10/2026 («Procedi subito con l'ampliamento»).
 *
 * Un solo elenco, DEDUPLICATO, di tutti i Channel che esistono davvero nei dati del sito:
 *   · i 28 dell'elenco ufficiale (CHANNEL_HOME) — numeri, file, slug e pagine INVARIATI;
 *   · i 9 in preparazione (channel-in-preparazione.ts) — «ordine da indicare»;
 *   · Touch Miss Cool (telecomando.ts);
 *   · 28/10/2026: i Channel TBH delle società (Touch Music Channel + 8 società, R.F.A. compreso,
 *     spostato da «Altri» a HOME TBH), card co-firmate TBH;
 *   · spazi VUOTI per i media partner esterni NOVA TV e BEST ENTERTAINMENT: nessun nome,
 *     logo o contenuto inventato — solo lo slot, che si compila dal pannello (nome + URL).
 *
 * Esclusi come DOPPIONI (stesso Channel con un altro slug):
 *   · telecomando.ts: dm-channel (= dm), motorsport (= touch-motorsport), bacheca-lavoro
 *     (/lavoro-casting/bacheca = sotto-pagina di Touch Lavoro /lavoro-casting) e gli altri
 *     slug che ripetono i 28;
 *   · archivio-73.ts 061–073: proposte di CONTENUTI dentro Channel esistenti, non Channel nuovi
 *     (061/071 doppioni di Influencity/Plaza). Non entrano qui.
 *
 * APPARTENENZA: solo da dati confermati. TBH = elenco ufficiale dei 28 (escluso DM);
 * DM = DM Comunicazioni + 10 squadre (media partner esterno); «da assegnare» = tutto il resto,
 * finché la Direzione TBH non conferma. «libero» = spazio vuoto disponibile.
 *
 * Gli URL esistenti non cambiano: `pagina` è la pagina già esistente; `scheda` è la nuova
 * scheda pubblica /channel/scheda/<slug> (la vecchia anteprima /check-web/channel/<slug> resta).
 */

export type SezioneChannel = "home-tbh" | "dm" | "nova" | "best" | "altri";
export type AppartenenzaChannel = "TBH" | "DM" | "libero" | "da assegnare";

export type ChannelRegistro = {
  slug: string;
  nome: string;
  sezione: SezioneChannel;
  appartenenza: AppartenenzaChannel;
  /** Pagina interna già esistente; null = solo scheda (IN ALLESTIMENTO). */
  pagina: string | null;
  /** Scheda pubblica del Channel (sempre presente). */
  scheda: string;
  /** Logo originale approvato già registrato (loghi-channel.ts); null = slot «logo da caricare». */
  logo: string | null;
  /** Origine del dato, per il resoconto. */
  fonte: "elenco-28" | "in-preparazione" | "fuori-elenco" | "telecomando" | "slot" | "societa-tbh";
  /** Solo per i 28: posizione e fila ufficiali, invariate (uso interno). */
  numero?: number;
  fila?: FilaChannel;
  categoria: string;
  squadra?: string;
  mediaPartnerEsterno?: boolean;
  /** Spazio vuoto: il nome e l'URL arrivano dal pannello. */
  slotVuoto?: boolean;
  ordineDaIndicare?: boolean;
  nota?: string;
  /** Pagine già esistenti collegate (es. scheda della società): mostrate nella scheda, non sono la pagina del Channel. */
  collegamenti?: { nome: string; href: string; esterno: boolean; nota: string }[];
};

export const schedaPubblica = (slug: string) => `/channel/scheda/${slug}`;

export const SEZIONI_CHANNEL: { id: SezioneChannel; titolo: string; sotto: string; partnerEsterno?: boolean }[] = [
  { id: "home-tbh", titolo: "HOME TBH", sotto: "Channel del gruppo Touch Business Holding" },
  { id: "dm", titolo: "DM", sotto: "DM Comunicazioni e squadre · media partner esterno", partnerEsterno: true },
  { id: "nova", titolo: "NOVA TV", sotto: "Media partner esterno · spazi da compilare", partnerEsterno: true },
  { id: "best", titolo: "BEST ENTERTAINMENT", sotto: "Media partner esterno · spazi da compilare", partnerEsterno: true },
  { id: "altri", titolo: "ALTRI CHANNEL E SPAZI LIBERI", sotto: "Channel in preparazione, da assegnare e spazi disponibili" },
];

/**
 * 28/10/2026 (round 14) — Channel mostrati a BLOCCHI DA 6 (una fila completa su schermo grande), in PAGINE
 * da massimo 15 Channel, navigabili (frecce, tastiera, swipe). Prima: gruppi 3/6/12.
 */
export const PER_BLOCCO = 6;
export const PER_PAGINA = 15;
export function inGruppi<T>(lista: T[], n: number = PER_BLOCCO): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < lista.length; i += n) out.push(lista.slice(i, i + n));
  return out;
}
/** Pagine da massimo 15 Channel. */
export const inPagine = <T,>(lista: T[]): T[][] => inGruppi(lista, PER_PAGINA);

const logoDi = (slug: string) => logoDelChannel(slug)?.src ?? null;

const daElenco = (c: ChannelHome): ChannelRegistro => {
  const dm = !!c.mediaPartnerEsterno || c.categoria === "squadra";
  return {
    slug: c.slug,
    nome: titoloChannel(c),
    sezione: dm ? "dm" : "home-tbh",
    appartenenza: dm ? "DM" : "TBH",
    pagina: c.pagina,
    scheda: schedaPubblica(c.slug),
    logo: logoDi(c.slug),
    fonte: "elenco-28",
    numero: c.numero,
    fila: c.fila,
    categoria: c.categoria,
    squadra: c.squadra,
    mediaPartnerEsterno: dm,
    nota: c.daDecidere,
    collegamenti: COLLEGAMENTI_ELENCO[c.slug],
  };
};

/**
 * 28/10/2026 (round 14) — collegamenti a pagine GIÀ ESISTENTI per alcuni dei 28 (numero, slug e pagina invariati).
 * Touch Lavoro = Touch Human Resources (stesso Channel, nessun doppione): la scheda società TBH-A03 è un collegamento.
 */
const COLLEGAMENTI_ELENCO: Record<string, NonNullable<ChannelRegistro["collegamenti"]>> = {
  /* 29/10/2026 (round 15) — Touch Travels: hub verso pagine esistenti (nessun Channel territoriale nuovo).
     L'elenco completo (campi, tappe, circuiti con Maps) è nella scheda: channel-schede.ts GRUPPI_TRAVELS. */
  "touch-travels": [
    { nome: "Hospitality · hotel, ristoranti, esperienze, transfer", href: "/hospitality", esterno: false, nota: "Pagina esistente." },
    { nome: "Fiere internazionali e tappe estere", href: "/eventi/fiere-internazionali", esterno: false, nota: "Pagina esistente." },
    { nome: "Rimini · dove dormire, mangiare e divertirsi", href: "/territorio/rimini/dove-dormire-mangiare-divertirsi", esterno: false, nota: "Scheda città esistente." },
    { nome: "Mappa del territorio TBH", href: "/territorio/mappa", esterno: false, nota: "Pagina esistente." },
  ],
  "touch-lavoro": [
    {
      nome: "Scheda della società · Touch Human Resources",
      href: "/tbh/societa/tbh-a03",
      esterno: false,
      nota: "Touch Lavoro e Touch Human Resources sono lo stesso Channel.",
    },
  ],
};

const slot = (sezione: SezioneChannel, prefisso: string, n: number, appartenenza: AppartenenzaChannel, nota: string): ChannelRegistro[] =>
  Array.from({ length: n }, (_, i) => ({
    slug: `${prefisso}-${i + 1}`,
    nome: `${{ nova: "NOVA TV · Spazio", best: "BEST ENTERTAINMENT · Spazio", altri: "Spazio libero", dm: "Spazio", "home-tbh": "Spazio" }[sezione]} ${i + 1}`,
    sezione,
    appartenenza,
    pagina: null,
    scheda: schedaPubblica(`${prefisso}-${i + 1}`),
    logo: null,
    fonte: "slot" as const,
    categoria: "slot",
    slotVuoto: true,
    mediaPartnerEsterno: sezione === "nova" || sezione === "best",
    nota,
  }));

/** 28/10/2026 — Channel TBH delle società (ordine di Claudio: Touch Music Channel sopra le società). */
const societa = (codice: string, nome: string) => ({
  nome: `Scheda della società · ${nome}`,
  href: `/tbh/societa/${codice.toLowerCase()}`,
  esterno: false,
  nota: "Pagina esistente della società del gruppo TBH.",
});
const CHANNEL_SOCIETA_TBH: { slug: string; nome: string; categoria: string; nota: string; collegamenti: NonNullable<ChannelRegistro["collegamenti"]> }[] = [
  {
    slug: "touch-music-channel",
    nome: "Touch Music Channel",
    categoria: "musica",
    nota: "Channel a sé, approvato il 28/10/2026. La rubrica TOUCH MUSIC del palinsesto Touch TV/Radio resta invariata.",
    collegamenti: [
      { nome: "Pagina Musica del sito", href: "/musica", esterno: false, nota: "Pagina esistente (musica J.C. Hugò)." },
      /* 04/11/2026 (round 16) — collegamenti reciproci dell'area musica. */
      { nome: "Touch Music Records Channel", href: "/channel/scheda/touch-music-records", esterno: false, nota: "Etichetta delle produzioni interne." },
      { nome: "Calendario uscite", href: "/musica/calendario-uscite", esterno: false, nota: "Singoli e album con data e piattaforme." },
      /* 04/11/2026 (round 17) */
      { nome: "Discografia", href: "/musica/discografia", esterno: false, nota: "Singoli, album, prossime uscite e produzioni DJ J.C. Hugò." },
      { nome: "Touch Music Radio", href: "/radio", esterno: false, nota: "Canale audio 24/7 con la rubrica TOUCH MUSIC." },
    ],
  },
  /* 04/11/2026 (round 16) — Touch Music Records Channel (logo «PRODUZIONI INTERNE» + banner co-firmato TBH
     consegnati da Claudio). Nessun Channel equivalente esisteva: «TBH Records» è il marchio della pagina
     Musica (loghi-tbh.ts), non un Channel, e resta invariato. */
  {
    slug: "touch-music-records",
    nome: "Touch Music Records Channel",
    categoria: "musica · etichetta",
    nota: "Banner approvato il 04/11/2026. Etichetta delle produzioni interne (es. «È ora di derby!»).",
    collegamenti: [
      { nome: "DJ J.C. Hugò · pagina dell'artista", href: "/musica/jc-hugo", esterno: false, nota: "Pagina esistente dell'artista." },
      { nome: "Catalogo musicale", href: "/musica/jc-hugo#brani", esterno: false, nota: "Tutti i brani, ciascuno con la sua scheda." },
      { nome: "Calendario uscite", href: "/musica/calendario-uscite", esterno: false, nota: "Singoli e album con data e piattaforme." },
      /* 04/11/2026 (round 17) */
      { nome: "Discografia", href: "/musica/discografia", esterno: false, nota: "Singoli, album, prossime uscite e produzioni DJ J.C. Hugò." },
      { nome: "Touch Music Channel", href: "/channel/scheda/touch-music-channel", esterno: false, nota: "Channel della musica del gruppo." },
      { nome: "Touch Music Radio", href: "/radio", esterno: false, nota: "Canale audio 24/7 con la rubrica TOUCH MUSIC." },
    ],
  },
  { slug: "touch-village", nome: "Touch Village Channel", categoria: "società TBH", nota: "Channel della società Touch Village Entertainment Srl.", collegamenti: [societa("TBH-003", "Touch Village Entertainment")] },
  { slug: "touch-be-proud", nome: "Touch Be Proud Channel", categoria: "società TBH", nota: "Channel della società Touch Be Proud Srl.", collegamenti: [societa("TBH-006", "Touch Be Proud")] },
  { slug: "touch-hello", nome: "Touch Hello Channel", categoria: "società TBH", nota: "Channel della società Touch Hello Srl.", collegamenti: [societa("TBH-005", "Touch Hello")] },
  { slug: "touch-home-consulia", nome: "Touch Home Consulia Channel", categoria: "società TBH", nota: "Channel della società Touch Home Consulia Srl & Sagl.", collegamenti: [societa("TBH-007", "Touch Home Consulia")] },
  {
    slug: "touch-rfa",
    nome: "Touch R.F.A. Channel",
    categoria: "società TBH",
    nota: "Logo approvato il 19/10/2026; il 28/10/2026 versione co-firmata TBH e spostato da «Altri» a HOME TBH.",
    collegamenti: [societa("TBH-008", "R.F.A. Rimini Football Academy")],
  },
  { slug: "touch-metropolitan-media", nome: "Touch Metropolitan Media Channel", categoria: "società TBH", nota: "Channel della società Touch Metropolitan Media.", collegamenti: [societa("TBH-002", "Touch Metropolitan Media")] },
  { slug: "touch-production", nome: "Touch Production Channel", categoria: "società TBH", nota: "Channel della società Touch Production Ltd & Srls.", collegamenti: [societa("TBH-004", "Touch Production")] },
  { slug: "touch-business-holding", nome: "Touch Business Holding Channel", categoria: "società TBH", nota: "Channel della capogruppo Touch Business Holding.", collegamenti: [societa("touch-business-holding", "Touch Business Holding")] },  /* 28/10/2026 (round 14) — 6 Channel NUOVI dai banner TBH. Solo collegamenti a pagine che esistono già;
     nessun sito esterno inventato (www.touchpay.store NON confermato → non usato). */
  {
    slug: "touch-fit-wellness",
    nome: "Touch Fit & Wellness Channel",
    categoria: "benessere",
    nota: "Banner approvato il 28/10/2026. Nessuna pagina del marchio nel sito.",
    collegamenti: [],
  },
  {
    slug: "touch-pay",
    nome: "Touch Pay Channel",
    categoria: "pagamenti",
    nota: "Banner approvato il 28/10/2026.",
    collegamenti: [{ nome: "Touch Pay · Pagamenti", href: "/pagamenti", esterno: false, nota: "Pagina esistente dei pagamenti del sito." }],
  },
  { slug: "touch-rent", nome: "Touch Rent Channel", categoria: "società TBH", nota: "Banner approvato il 28/10/2026.", collegamenti: [societa("TBH-B11", "Touch Rent")] },
  {
    slug: "touch-care-assistance",
    nome: "Touch Care Assistance Channel",
    categoria: "assistenza",
    nota: "Banner approvato il 28/10/2026. Nessuna pagina nel sito.",
    collegamenti: [],
  },
  { slug: "touch-booking-host", nome: "Touch Booking Host Channel", categoria: "società TBH", nota: "Banner approvato il 28/10/2026.", collegamenti: [societa("TBH-A16", "Touch Booking Host")] },
  { slug: "touch-security", nome: "Touch Security Channel", categoria: "società TBH", nota: "Banner approvato il 28/10/2026.", collegamenti: [societa("TBH-B04", "Touch Security")] },
  /* 29/10/2026 (round 15) — 2 Channel NUOVI dai banner 11–20 (gli altri 8 aggiornano Channel già esistenti). */
  {
    slug: "touch-project",
    nome: "Touch Project Channel",
    categoria: "progetti",
    nota: "Banner approvato il 29/10/2026 («Dove i progetti nascono»). Nessuna pagina del marchio nel sito.",
    collegamenti: [],
  },
  {
    slug: "touch-spotlight",
    nome: "Touch Spotlight Channel",
    categoria: "editoria",
    nota: "Banner approvato il 29/10/2026. Rubrica di Touch Influencity Magazine.",
    collegamenti: [{ nome: "Touch Spotlight · pagina del marchio", href: "/tbh/p/touch-spotlight", esterno: false, nota: "Pagina esistente del marchio nel sito TBH." }],
  },
];

export const CHANNEL_REGISTRO: ChannelRegistro[] = [
  // 28 ufficiali, nell'ordine ufficiale
  ...[...CHANNEL_HOME].sort((a, b) => a.numero - b.numero).map(daElenco),
  // 28/10/2026 — Channel TBH delle società del gruppo (card co-firmate TBH consegnate da Claudio).
  // Ordine: Touch Music Channel per primo (unico sopra le società), poi l'ordine delle card 1–7,
  // poi Touch Business Holding. Nessun contenuto inventato: pagina = null (IN ALLESTIMENTO, palinsesto A/B
  // predisposto dal pannello); la scheda della società è solo un collegamento.
  ...CHANNEL_SOCIETA_TBH.map(
    (s): ChannelRegistro => ({
      slug: s.slug,
      nome: LOGHI_CHANNEL[s.slug]?.nome ?? s.nome,
      sezione: "home-tbh",
      appartenenza: "TBH",
      pagina: null,
      scheda: schedaPubblica(s.slug),
      logo: logoDi(s.slug),
      fonte: s.slug === "touch-rfa" ? "fuori-elenco" : "societa-tbh",
      categoria: s.categoria,
      nota: s.nota,
      collegamenti: s.collegamenti,
    }),
  ),
  // 28/10/2026 — TOUCH TALENT & PROFESSIONALS: Channel TBH con pagina propria (monitor verticali 9:16,
  // palinsesto H24 casuale memorizzato sul server). Catalogo vuoto finché il pannello non attiva i monitor.
  {
    slug: "touch-talent-professionals",
    nome: LOGHI_CHANNEL["touch-talent-professionals"]?.nome ?? "Touch Talent & Professionals Channel",
    sezione: "home-tbh",
    appartenenza: "TBH",
    pagina: "/channel/touch-talent-professionals",
    scheda: schedaPubblica("touch-talent-professionals"),
    logo: logoDi("touch-talent-professionals"),
    fonte: "fuori-elenco",
    categoria: "Artisti · Staff · Crew · Indipendenti",
    nota: "Channel approvato il 28/10/2026: monitor verticali, palinsesto H24 casuale sincronizzato, carosello «Ultimi talenti e contenuti».",
    collegamenti: [{ nome: "Touch Hugoland", href: "/hugoland", esterno: false, nota: "Il Channel è anche nell'area Touch Hugoland." }],
  },
  // 29/10/2026 (round 15) — Touch Miss Cool Web Channel: banner approvato (co-firmato Touch Business Holding)
  // → appartenenza TBH verificata («Concorso di bellezza del gruppo TBH», tbh.ts). Slug e pagina invariati;
  // spostato da «Altri» a HOME TBH.
  {
    slug: "touch-miss-cool",
    nome: LOGHI_CHANNEL["touch-miss-cool"]?.nome ?? "Touch Miss Cool Web Channel",
    sezione: "home-tbh",
    appartenenza: "TBH",
    pagina: "/eventi/miss-cool",
    scheda: schedaPubblica("touch-miss-cool"),
    logo: logoDi("touch-miss-cool"),
    fonte: "telecomando",
    categoria: "Moda, Fotomania, Touch Miss Cool e Touch Miss Cool Web",
    nota: "Banner approvato il 29/10/2026 (corona rosa, co-firmato TBH). Pagina /eventi/miss-cool invariata.",
  },
  // NOVA TV e BEST ENTERTAINMENT: solo spazi, nessun dato inventato
  ...slot("nova", "nova-tv-spazio", 3, "da assegnare", "Spazio per un Channel NOVA TV: nome, URL e logo da fornire."),
  ...slot("best", "best-entertainment-spazio", 3, "da assegnare", "Spazio per un Channel BEST ENTERTAINMENT: nome, URL e logo da fornire."),
  // 9 in preparazione: ordine da indicare dalla Direzione TBH
  ...CHANNEL_IN_PREPARAZIONE.map(
    (p): ChannelRegistro => ({
      slug: p.slug,
      nome: p.nome,
      sezione: "altri",
      appartenenza: "da assegnare",
      pagina: null,
      scheda: schedaPubblica(p.slug),
      logo: logoDi(p.slug),
      fonte: "in-preparazione",
      categoria: p.categoria,
      ordineDaIndicare: true,
      nota: p.daChiarire ?? "Approvato il 19/10/2026: posizione definitiva da indicare.",
    }),
  ),
  ...slot("altri", "spazio-libero", 1, "libero", "Spazio libero: si compila dal pannello con nome e URL."),
];

export const registroPerSlug = (slug: string) => CHANNEL_REGISTRO.find((c) => c.slug === slug);
export const SLUG_REGISTRO = new Set(CHANNEL_REGISTRO.map((c) => c.slug));

/* Controllo doppioni all'avvio: uno slug ripetuto è un errore di dati, non si mostra due volte. */
if (SLUG_REGISTRO.size !== CHANNEL_REGISTRO.length) {
  const visti = new Set<string>();
  for (const c of CHANNEL_REGISTRO) {
    if (visti.has(c.slug)) console.error(`[channel-registro] slug doppio: ${c.slug}`);
    visti.add(c.slug);
  }
}
