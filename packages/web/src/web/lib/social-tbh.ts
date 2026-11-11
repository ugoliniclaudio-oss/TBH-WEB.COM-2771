/**
 * DIRECTORY SOCIAL TBH — schema consegnato da Claudio il 04/09/2026.
 *
 * Regole della sezione (dallo schema grafico):
 * - l'URL NON deve essere visibile: si vede anteprima + loghino piattaforma + nome/handle
 *   + un pulsante attivo "Apri profilo";
 * - macro aree separate per piattaforma.
 *
 * ONESTÀ SUI DATI — nel messaggio di Claudio i link erano allegati al testo "Apri profilo"
 * e sono arrivati SENZA indirizzo: degli account sono sopravvissuti solo gli handle.
 * Quindi:
 * - `url` valorizzato SOLO dove l'indirizzo è ricavabile dall'handle che ha scritto lui
 *   (Instagram, X, TikTok) o già confermato in precedenza;
 * - `url: null` = link ANCORA DA INCOLLARE (Facebook 1-9, LinkedIn, Bump, BIGO, OK.ru,
 *   TikTok 2). Il pulsante resta spento e la card lo dichiara: nessun indirizzo inventato.
 */

export type Piattaforma =
  | "bump"
  | "bigo"
  | "facebook"
  | "instagram"
  | "x"
  | "linkedin"
  | "tiktok"
  | "okru";

export type AccountSocial = {
  /** spazio del pannello /allestimento: social:<id> */
  id: string;
  piattaforma: Piattaforma;
  /** nome mostrato in card */
  nome: string;
  /** handle mostrato sotto il nome, senza URL */
  handle: string | null;
  /** indirizzo reale del profilo; null = da incollare */
  url: string | null;
  /** anteprima: logo ufficiale già in archivio, altrimenti null (fallback iniziali) */
  logo: string | null;
  /** riga informativa aggiuntiva mostrata in card */
  nota: string | null;
};

export const AREE_SOCIAL: { id: Piattaforma; nome: string; colore: string }[] = [
  { id: "bump", nome: "Bump", colore: "#d7ff00" },
  { id: "bigo", nome: "BIGO LIVE", colore: "#33e0ff" },
  { id: "facebook", nome: "Facebook", colore: "#2f7bff" },
  { id: "instagram", nome: "Instagram", colore: "#ff3df0" },
  { id: "x", nome: "X / Twitter", colore: "#e2c37a" },
  { id: "linkedin", nome: "LinkedIn", colore: "#33e0ff" },
  { id: "tiktok", nome: "TikTok", colore: "#9dff3c" },
  { id: "okru", nome: "OK.ru", colore: "#ff8a00" },
];

/** Instagram: indirizzo canonico dell'handle scritto da Claudio. */
const ig = (handle: string) => `https://www.instagram.com/${handle}/`;

export const ACCOUNT_SOCIAL: AccountSocial[] = [
  // ── BUMP ───────────────────────────────────────────────────────────────────
  {
    id: "bump-claudio",
    piattaforma: "bump",
    nome: "Bump — profilo TBH",
    handle: null,
    url: null,
    logo: null,
    nota: "Indirizzo del profilo da incollare.",
  },

  // ── BIGO LIVE ──────────────────────────────────────────────────────────────
  {
    id: "bigo-live",
    piattaforma: "bigo",
    nome: "BIGO LIVE",
    handle: null,
    url: null,
    logo: null,
    nota: "Codice invito 10573217228 · indirizzo del profilo da incollare.",
  },

  // ── FACEBOOK — 9 profili, nessun indirizzo arrivato ────────────────────────
  ...Array.from({ length: 9 }, (_, i) => ({
    id: `facebook-ugolini-${i + 1}`,
    piattaforma: "facebook" as Piattaforma,
    nome: `Ugolini ${i + 1}`,
    handle: null,
    url: null,
    logo: null,
    nota: "Indirizzo del profilo da incollare.",
  })),

  // ── INSTAGRAM — 11 profili, handle confermati da Claudio ───────────────────
  {
    id: "instagram-showrunner",
    piattaforma: "instagram",
    nome: "Showrunner Cinema Radio Moda TV",
    handle: "@showrunnercinemaradiomodatv",
    url: ig("showrunnercinemaradiomodatv"),
    logo: null,
    nota: null,
  },
  {
    id: "instagram-metropolitan",
    piattaforma: "instagram",
    nome: "Metropolitan Servizi Srls",
    handle: "@metropolitanservizisrls",
    url: ig("metropolitanservizisrls"),
    logo: "/brand/loghi/touch-metropolitan-media.png",
    nota: null,
  },
  {
    id: "instagram-tbh",
    piattaforma: "instagram",
    nome: "Touch Business Holding",
    handle: "@touchbusinessholding",
    url: ig("touchbusinessholding"),
    logo: "/brand/tbh-icona-app.png",
    nota: null,
  },
  {
    id: "instagram-touchmusictv",
    piattaforma: "instagram",
    nome: "Touch Music TV",
    handle: "@touchmusictv",
    url: ig("touchmusictv"),
    logo: "/brand/loghi/touch-music-tv.png",
    nota: null,
  },
  {
    id: "instagram-touchrestaurant",
    piattaforma: "instagram",
    nome: "Touch Restaurant Disco",
    handle: "@touchrestaurantdisco",
    url: ig("touchrestaurantdisco"),
    logo: null,
    nota: null,
  },
  {
    id: "instagram-beproud",
    piattaforma: "instagram",
    nome: "Touch Be Proud Srl",
    handle: "@touch_be_proud_srl",
    url: ig("touch_be_proud_srl"),
    logo: null,
    nota: null,
  },
  {
    id: "instagram-touchmusicradio",
    piattaforma: "instagram",
    nome: "Touch Music Radio",
    handle: "@touchmusicradio",
    url: ig("touchmusicradio"),
    logo: "/brand/loghi/touch-music-radio.png",
    nota: null,
  },
  {
    id: "instagram-magazine",
    piattaforma: "instagram",
    nome: "Touch Business Magazine",
    handle: "@touchbusinessmagazine",
    url: ig("touchbusinessmagazine"),
    logo: null,
    nota: null,
  },
  {
    id: "instagram-production",
    piattaforma: "instagram",
    nome: "Touch Production Ltd",
    handle: "@touchproductionltd",
    url: ig("touchproductionltd"),
    logo: "/brand/loghi/touch-production.png",
    nota: null,
  },
  {
    id: "instagram-claudiotouchvillage",
    piattaforma: "instagram",
    nome: "Claudio Touch Village",
    handle: "@claudiotouchvillage",
    url: ig("claudiotouchvillage"),
    logo: null,
    nota: null,
  },
  {
    id: "instagram-touchmusiceu",
    piattaforma: "instagram",
    nome: "Touch Music EU",
    handle: "@touchmusic.eu",
    url: ig("touchmusic.eu"),
    logo: null,
    nota: null,
  },

  // ── X / TWITTER ────────────────────────────────────────────────────────────
  {
    id: "x-touchtvmusic",
    piattaforma: "x",
    nome: "Touch TV Music",
    handle: "@touchtvmusic",
    url: "https://x.com/touchtvmusic",
    logo: null,
    nota: null,
  },

  // ── LINKEDIN ───────────────────────────────────────────────────────────────
  {
    id: "linkedin-touch-village",
    piattaforma: "linkedin",
    nome: "Touch Village Entertainment Srl",
    handle: null,
    url: null,
    logo: null,
    nota: "Indirizzo della pagina LinkedIn da incollare.",
  },

  // ── TIKTOK ─────────────────────────────────────────────────────────────────
  {
    id: "tiktok-touchveejay",
    piattaforma: "tiktok",
    nome: "Touch Veejay",
    handle: "@touchveejay",
    url: "https://www.tiktok.com/@touchveejay",
    logo: "/brand/loghi/deejay-hugo.png",
    nota: "Nello schema grafico compariva @touchtvlegal: da confermare quale dei due è corretto.",
  },
  {
    id: "tiktok-2",
    piattaforma: "tiktok",
    nome: "TikTok 2",
    handle: null,
    url: null,
    logo: null,
    nota: "Link ancora da inserire.",
  },

  // ── OK.RU ──────────────────────────────────────────────────────────────────
  {
    id: "okru-tbh",
    piattaforma: "okru",
    nome: "OK.ru — Touch Business Holding",
    handle: "@touchbusinessholding",
    url: null,
    logo: null,
    nota: "Su OK.ru l'indirizzo non si ricava dall'handle: da incollare.",
  },
];

export const ACCOUNT_DA_COMPLETARE = ACCOUNT_SOCIAL.filter((a) => !a.url).length;
export const ACCOUNT_ATTIVI = ACCOUNT_SOCIAL.filter((a) => a.url).length;
