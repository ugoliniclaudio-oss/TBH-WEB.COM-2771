/**
 * TOUCH SOCIAL — archivio centralizzato dei collegamenti social ufficiali (09/11/2026).
 *
 * Riunisce in UN solo posto i profili che prima stavano sparsi (directory del 04/09/2026, scheda
 * Touch Music del 29/08/2026, profili di Claudio del 06/10/2026, scheda DM, Touch Music Records,
 * servizi referral). Ogni voce ha un id stabile: le pagine del sito la richiamano per id o per
 * Channel, senza copiarne i dati.
 *
 * REGOLE
 *   · nessun account, username o indirizzo inventato: `url` è quello consegnato, scritto tale e quale;
 *   · `stato: "pubblico"` solo per i link consegnati e verificati; `da-completare` = manca l'indirizzo;
 *     `da-verificare` = l'indirizzo consegnato oggi non risponde (si mostra solo nel pannello);
 *   · DM Comunicazioni resta MEDIA PARTNER distinto (categoria «partner»), non proprietà TBH.
 * Il pannello /allestimento/touch-social aggiunge voci e modifiche in `settings` (cms_v1:social),
 * condivise fra anteprima e www; questo file resta la base e non si riscrive dal pannello.
 */

/* Rosso #ff2b2b riservato a DM: nessuna piattaforma lo usa. */
export const PIATTAFORME_SOCIAL = [
  { id: "youtube", nome: "YouTube", colore: "#ff8a00" },
  { id: "facebook", nome: "Facebook", colore: "#2f7bff" },
  { id: "instagram", nome: "Instagram", colore: "#ff3df0" },
  { id: "tiktok", nome: "TikTok", colore: "#33e0ff" },
  { id: "x", nome: "X", colore: "#e8e8e8" },
  { id: "linkedin", nome: "LinkedIn", colore: "#33a0ff" },
  { id: "okru", nome: "Odnoklassniki (OK)", colore: "#ff8a00" },
  { id: "vk", nome: "VKontakte (VK)", colore: "#4c8dff" },
  { id: "pinterest", nome: "Pinterest", colore: "#ff3df0" },
  { id: "bigo", nome: "BIGO LIVE", colore: "#33e0ff" },
  { id: "toptop", nome: "TopTop", colore: "#ff8a00" },
  { id: "bump", nome: "Bump", colore: "#d7ff00" },
  { id: "whatsapp", nome: "WhatsApp", colore: "#25d366" },
  { id: "telegram", nome: "Telegram", colore: "#33b5ff" },
  { id: "twitch", nome: "Twitch", colore: "#a970ff" },
  { id: "discord", nome: "Discord", colore: "#7289ff" },
  { id: "spotify", nome: "Spotify", colore: "#1ed760" },
  { id: "apple-music", nome: "Apple Music", colore: "#ff3df0" },
  { id: "suno", nome: "Suno", colore: "#d4af37" },
  { id: "behance", nome: "Behance", colore: "#3d7bff" },
  { id: "altro", nome: "Altri social", colore: "#d4af37" },
] as const;
export type PiattaformaSocial = (typeof PIATTAFORME_SOCIAL)[number]["id"];
export const ID_PIATTAFORME = PIATTAFORME_SOCIAL.map((p) => p.id) as [PiattaformaSocial, ...PiattaformaSocial[]];

export const TIPI_SOCIAL = ["profilo", "pagina", "gruppo", "canale", "diretta", "playlist", "contatto"] as const;
export type TipoSocial = (typeof TIPI_SOCIAL)[number];

export const CATEGORIE_SOCIAL = [
  { id: "tbh", nome: "Touch Business Holding e società collegate" },
  { id: "media", nome: "Touch TV, Touch Radio e Touch Metropolitan Media" },
  { id: "musica", nome: "Touch Music Records e DJ J.C. Hugò" },
  { id: "production", nome: "Touch Production, cinema e audiovisivo" },
  { id: "hugoland", nome: "Touch Hugoland e Capitan Touch" },
  { id: "fashion", nome: "Touch Fashion e Touch Miss Cool" },
  { id: "casting", nome: "Touch Casting, lavoro e formazione" },
  { id: "sports", nome: "Touch Sports, turismo, eventi e altri progetti" },
  { id: "editore", nome: "Profili dell'editore · Claudio Ugolini" },
  { id: "partner", nome: "Media partner e realtà esterne" },
] as const;
export type CategoriaSocial = (typeof CATEGORIE_SOCIAL)[number]["id"];
export const ID_CATEGORIE = CATEGORIE_SOCIAL.map((c) => c.id) as [CategoriaSocial, ...CategoriaSocial[]];

export const STATI_SOCIAL = ["pubblico", "da-verificare", "da-completare", "nascosto"] as const;
export type StatoSocial = (typeof STATI_SOCIAL)[number];

export type VoceSocial = {
  id: string;
  piattaforma: PiattaformaSocial;
  tipo: TipoSocial;
  categoria: CategoriaSocial;
  /** nome per esteso, come consegnato */
  nome: string;
  handle: string | null;
  url: string | null;
  descrizione: string | null;
  /** logo ufficiale già in archivio (public/), solo se il profilo è di quel marchio */
  logo: string | null;
  /** Channel del sito (slug) nelle cui schede compare il profilo */
  channel: string[];
  /** pagine del sito (percorso, es. «/contatti») dove la stessa voce compare, senza copiarla */
  pagine: string[];
  /** immagine del profilo: solo quella pubblica letta dal pannello (og:image) o caricata */
  immagine: string | null;
  /** profilo di una persona (non pagina di marchio): serve al filtro Persone / Pagine / Gruppi */
  persona: boolean;
  stato: StatoSocial;
  evidenza: boolean;
  /** campagna in corso (testo breve), mostrata in evidenza sul banner */
  campagna: string | null;
  ordine: number;
  /** da dove arriva il dato e quando è stato consegnato */
  fonte: string;
  nota: string | null;
};

const ig = (h: string) => `https://www.instagram.com/${h}/`;
let n = 0;
type Facoltativi = "ordine" | "evidenza" | "channel" | "descrizione" | "logo" | "nota" | "handle" | "pagine" | "immagine" | "persona" | "campagna";
const v = (x: Omit<VoceSocial, Facoltativi> & Partial<VoceSocial>): VoceSocial => ({
  handle: null,
  descrizione: null,
  logo: null,
  channel: [],
  pagine: [],
  immagine: null,
  persona: x.categoria === "editore",
  evidenza: false,
  campagna: null,
  nota: null,
  ordine: (n += 10),
  ...x,
});

const DIR = "Directory social consegnata da Claudio il 04/09/2026";
const SCHEDA_TM = "Scheda ufficiale Touch Music, 29/08/2026";
const PROFILI = "Profili di Claudio Ugolini consegnati il 06/10/2026";
const DM = "Scheda media partner DM Comunicazioni";

export const SOCIAL_BASE: VoceSocial[] = [
  /* ── Touch Business Holding e società collegate ─────────────────────────── */
  v({ id: "instagram-tbh", piattaforma: "instagram", tipo: "profilo", categoria: "tbh", nome: "Touch Business Holding", handle: "@touchbusinessholding", url: ig("touchbusinessholding"), logo: "/brand/tbh-icona-app.png", channel: ["touch-business-holding"], evidenza: true, stato: "pubblico", fonte: DIR }),
  v({ id: "instagram-touchvillage", piattaforma: "instagram", tipo: "profilo", categoria: "tbh", nome: "Touch Village Entertainment Srl", handle: "@touchvillageentertainmentsrl", url: "https://www.instagram.com/touchvillageentertainmentsrl", logo: "/channel/loghi/tbh/touch-village.jpe", channel: ["touch-village"], stato: "pubblico", fonte: SCHEDA_TM }),
  v({ id: "tiktok-touchvillagesrl", piattaforma: "tiktok", tipo: "profilo", categoria: "tbh", nome: "Touch Village Srl", handle: "@touchvillagesrl", url: "https://www.tiktok.com/@touchvillagesrl?lang=it-IT", logo: "/channel/loghi/tbh/touch-village.jpe", channel: ["touch-village"], stato: "pubblico", fonte: SCHEDA_TM }),
  v({ id: "instagram-beproud", piattaforma: "instagram", tipo: "profilo", categoria: "tbh", nome: "Touch Be Proud Srl", handle: "@touch_be_proud_srl", url: ig("touch_be_proud_srl"), logo: "/channel/loghi/tbh/touch-be-proud.jpe", channel: ["touch-be-proud"], stato: "pubblico", fonte: DIR }),
  v({ id: "whatsapp-catalogo", piattaforma: "whatsapp", tipo: "contatto", categoria: "tbh", nome: "WhatsApp Business · catalogo", handle: "+39 379 208 8524", url: "https://wa.me/c/393792088524", channel: [], pagine: ["/contatti"], stato: "pubblico", fonte: SCHEDA_TM }),
  v({ id: "linkedin-touch-village", piattaforma: "linkedin", tipo: "pagina", categoria: "tbh", nome: "Touch Village Entertainment Srl", url: null, stato: "da-completare", fonte: DIR, nota: "Indirizzo della pagina aziendale LinkedIn da incollare." }),

  /* ── Touch TV, Touch Radio e Touch Metropolitan Media ───────────────────── */
  v({ id: "youtube-touchmusicradiotv", piattaforma: "youtube", tipo: "canale", categoria: "media", nome: "Touch Music Radio TV", handle: "@touchmusicradiotv", url: "https://www.youtube.com/@touchmusicradiotv", logo: "/brand/loghi/touch-music-radio.png", channel: ["touch-tv", "touch-radio", "touch-music-channel"], evidenza: true, stato: "pubblico", fonte: "Canale ufficiale verificato il 29/08/2026" }),
  v({ id: "instagram-touchmusictv", piattaforma: "instagram", tipo: "profilo", categoria: "media", nome: "Touch Music TV", handle: "@touchmusictv", url: ig("touchmusictv"), logo: "/brand/loghi/touch-music-tv.png", channel: ["touch-tv"], stato: "pubblico", fonte: DIR }),
  v({ id: "instagram-touchmusicradio", piattaforma: "instagram", tipo: "profilo", categoria: "media", nome: "Touch Music Radio", handle: "@touchmusicradio", url: ig("touchmusicradio"), logo: "/brand/loghi/touch-music-radio.png", channel: ["touch-radio"], stato: "pubblico", fonte: DIR }),
  v({ id: "facebook-touchmusicradio", piattaforma: "facebook", tipo: "pagina", categoria: "media", nome: "Touch Music Radio", handle: "facebook.com/TouchMusicRadio", url: "https://facebook.com/TouchMusicRadio", logo: "/brand/loghi/touch-music-radio.png", channel: ["touch-radio"], stato: "pubblico", fonte: SCHEDA_TM }),
  v({ id: "x-touchtvmusic", piattaforma: "x", tipo: "profilo", categoria: "media", nome: "Touch TV Music", handle: "@touchtvmusic", url: "https://x.com/touchtvmusic", channel: ["touch-tv"], stato: "pubblico", fonte: DIR }),
  v({ id: "instagram-metropolitan", piattaforma: "instagram", tipo: "profilo", categoria: "media", nome: "Metropolitan Servizi Srls", handle: "@metropolitanservizisrls", url: ig("metropolitanservizisrls"), logo: "/brand/loghi/touch-metropolitan-media.png", channel: ["touch-metropolitan-media"], stato: "pubblico", fonte: DIR }),
  v({ id: "instagram-magazine", piattaforma: "instagram", tipo: "profilo", categoria: "media", nome: "Touch Business Magazine", handle: "@touchbusinessmagazine", url: ig("touchbusinessmagazine"), stato: "pubblico", fonte: DIR }),
  v({ id: "telegram-touch", piattaforma: "telegram", tipo: "canale", categoria: "media", nome: "Telegram Touch", handle: "t.me/irfxn0iFUddmYmFk", url: "https://t.me/irfxn0iFUddmYmFk", stato: "pubblico", fonte: SCHEDA_TM, nota: "Nel testo originale c'era uno spazio («t.me/ irfxn0iFUddmYmFk»): da confermare." }),
  v({ id: "x-reteromatvradio", piattaforma: "x", tipo: "profilo", categoria: "media", nome: "Rete Roma TV Radio", handle: "@ReteRomaTvRadio", url: "https://twitter.com/ReteRomaTvRadio", stato: "da-verificare", fonte: SCHEDA_TM, nota: "Controllo del 09/11/2026: X risponde «pagina non trovata» (HTTP 404). Resta in archivio: confermare o correggere l'indirizzo." }),

  /* ── Touch Music Records e DJ J.C. Hugò ─────────────────────────────────── */
  v({ id: "facebook-jc-hugo", piattaforma: "facebook", tipo: "pagina", categoria: "musica", nome: "DJ J.C. Hugò · pagina ufficiale", url: "https://www.facebook.com/share/17eYrSEhzB/", logo: "/brand/loghi/jc-hugo.png", channel: ["touch-music-channel", "touch-music-records", "touch-deejay-jc-hugo"], evidenza: true, stato: "pubblico", fonte: "Scheda DJ J.C. Hugò" }),
  v({ id: "youtube-playlist-jc-hugo", piattaforma: "youtube", tipo: "playlist", categoria: "musica", nome: "J.C. Hugò · videoclip e brani", url: "https://youtube.com/playlist?list=PL49Zpi4F05aeSrQjiJE0Bv0SM0GlLhetc", logo: "/brand/loghi/jc-hugo.png", channel: ["touch-music-channel", "touch-music-records", "touch-deejay-jc-hugo"], stato: "pubblico", fonte: "Scheda DJ J.C. Hugò", descrizione: "Playlist ufficiale videoclip e brani." }),
  v({ id: "tiktok-touchveejay", piattaforma: "tiktok", tipo: "profilo", categoria: "musica", nome: "Touch Veejay", handle: "@touchveejay", url: "https://www.tiktok.com/@touchveejay", logo: "/brand/loghi/deejay-hugo.png", channel: ["touch-music-channel", "touch-deejay-jc-hugo"], stato: "pubblico", fonte: DIR, nota: "Nello schema grafico compariva anche @touchtvlegal: da confermare quale dei due è corretto." }),
  v({ id: "instagram-touchmusiceu", piattaforma: "instagram", tipo: "profilo", categoria: "musica", nome: "Touch Music EU", handle: "@touchmusic.eu", url: ig("touchmusic.eu"), channel: ["touch-music-channel", "touch-music-records"], stato: "pubblico", fonte: DIR }),
  v({ id: "suno-hugoveejay", piattaforma: "suno", tipo: "profilo", categoria: "musica", nome: "Touch Music su Suno", handle: "@hugoveejay", url: "https://suno.com/@hugoveejay", logo: "/brand/loghi/jc-hugo.png", channel: ["touch-music-channel", "touch-music-records"], stato: "pubblico", fonte: "Scheda DJ J.C. Hugò", descrizione: "Profilo ufficiale con i brani." }),
  v({ id: "facebook-ugolini-10", piattaforma: "facebook", tipo: "profilo", categoria: "musica", nome: "10 DJ - Jean Claude Hugò", url: "https://www.facebook.com/share/19bMHiPmjK/", channel: ["touch-deejay-jc-hugo"], persona: true, stato: "pubblico", fonte: PROFILI }),
  v({ id: "tiktok-2", piattaforma: "tiktok", tipo: "profilo", categoria: "musica", nome: "TikTok 2", url: null, stato: "da-completare", fonte: DIR, nota: "Link ancora da inserire." }),

  /* ── Touch Production, cinema e audiovisivo ─────────────────────────────── */
  v({ id: "instagram-production", piattaforma: "instagram", tipo: "profilo", categoria: "production", nome: "Touch Production Ltd", handle: "@touchproductionltd", url: ig("touchproductionltd"), logo: "/brand/loghi/touch-production.png", channel: ["touch-production"], stato: "pubblico", fonte: DIR }),
  v({ id: "instagram-showrunner", piattaforma: "instagram", tipo: "profilo", categoria: "production", nome: "Showrunner Cinema Radio Moda TV", handle: "@showrunnercinemaradiomodatv", url: ig("showrunnercinemaradiomodatv"), channel: ["touch-cinema"], stato: "pubblico", fonte: DIR }),
  v({ id: "facebook-showrunner", piattaforma: "facebook", tipo: "pagina", categoria: "production", nome: "Showrunner Cinema Radio TV", handle: "facebook.com/showrunnercinemaradiotv", url: "https://www.facebook.com/showrunnercinemaradiotv", channel: ["touch-cinema"], stato: "pubblico", fonte: "Media library TBH" }),

  /* ── Touch Sports, turismo, eventi e altri progetti ─────────────────────── */
  v({ id: "instagram-touchrestaurant", piattaforma: "instagram", tipo: "profilo", categoria: "sports", nome: "Touch Restaurant Disco", handle: "@touchrestaurantdisco", url: ig("touchrestaurantdisco"), stato: "pubblico", fonte: DIR }),
  v({ id: "youtube-giovanile-rimini", piattaforma: "youtube", tipo: "canale", categoria: "sports", nome: "ASD Giovanile Rimini Football", handle: "@asdgovanileriminifootball7338", url: "https://www.youtube.com/@asdgovanileriminifootball7338", logo: "/channel/loghi/tbh/giovanile-rimini-show.jpe", channel: ["giovanile-rimini-show"], stato: "da-verificare", fonte: "Scheda Channel Giovanile Rimini Show", nota: "Controllo del 09/11/2026: YouTube risponde «canale non trovato» (HTTP 404). Resta in archivio: confermare l'indirizzo." }),

  /* ── Profili dell'editore · Claudio Ugolini ─────────────────────────────── */
  v({ id: "linkedin-claudio", piattaforma: "linkedin", tipo: "profilo", categoria: "editore", nome: "Claudio Ugolini", url: "https://it.linkedin.com/in/touchvillageentertertainmentsrl", stato: "pubblico", evidenza: true, fonte: PROFILI }),
  v({ id: "behance-claudio", piattaforma: "behance", tipo: "profilo", categoria: "editore", nome: "Claudio Ugolini", url: "https://www.behance.net/claudiougolini1", stato: "pubblico", fonte: PROFILI }),
  v({ id: "instagram-claudiotouchvillage", piattaforma: "instagram", tipo: "profilo", categoria: "editore", nome: "Claudio Touch Village", handle: "@claudiotouchvillage", url: ig("claudiotouchvillage"), stato: "pubblico", fonte: DIR }),
  v({ id: "bump-claudio", piattaforma: "bump", tipo: "profilo", categoria: "editore", nome: "Bump · profilo di Claudio", url: "https://bump.app/p/pDAMlQZBtIWDK", stato: "pubblico", fonte: "Servizi e referral TBH" }),
  ...(
    [
      ["1", "01 Claudio Ugolini", "https://www.facebook.com/share/1Df21cWk7Y/"],
      ["2", "02 Claudio Ugolini", "https://www.facebook.com/share/1DsYBW1BMr/"],
      ["3", "03 Claudio Ugolini Terzo Profilo", "https://www.facebook.com/share/19n94RV4Rg/"],
      ["4", "04 Claudio Ugolini Quarto Profilo", "https://www.facebook.com/share/1DxaxLNzXV/"],
      ["5", "05 Claudio Ugolini", "https://www.facebook.com/share/18m47mYqjv/"],
      ["6", "06 Claudio Ugolini Sesto Profilo", "https://www.facebook.com/share/1Kavqa8WsL/"],
      ["7", "07 Claudio Ugolini", "https://www.facebook.com/share/19Ex5HSu4W/"],
      ["8", "08 Claudio Ugolini", "https://www.facebook.com/share/1Jn3tSkcDG/"],
      ["9", "09 Claude Hiugo", "https://www.facebook.com/share/1EfuVuJsgf/"],
    ] as const
  ).map(([i, nome, url]) => v({ id: `facebook-ugolini-${i}`, piattaforma: "facebook", tipo: "profilo", categoria: "editore", nome, url, stato: "pubblico", fonte: PROFILI })),
  v({ id: "bigo-live", piattaforma: "bigo", tipo: "diretta", categoria: "editore", nome: "BIGO LIVE", url: null, persona: false, stato: "da-completare", fonte: DIR, nota: "Codice invito 10573217228 · indirizzo del profilo da incollare." }),
  v({ id: "okru-tbh", piattaforma: "okru", tipo: "profilo", categoria: "tbh", nome: "OK.ru · Touch Business Holding", handle: "@touchbusinessholding", url: null, stato: "da-completare", fonte: DIR, nota: "Su OK.ru l'indirizzo non si ricava dall'handle: da incollare." }),

  /* ── Media partner e realtà esterne (DM Comunicazioni distinto da TBH) ──── */
  v({ id: "youtube-dm", piattaforma: "youtube", tipo: "canale", categoria: "partner", nome: "DM Comunicazioni · Daniele Manuelli Official", handle: "@DanieleManuelli1981", url: "https://www.youtube.com/@DanieleManuelli1981", logo: "/brand/dm-comunicazioni.jpg", channel: ["dm"], stato: "pubblico", fonte: DM, descrizione: "Media partner. Canale di proprietà di DM Comunicazioni, non di TBH." }),
  v({ id: "facebook-dm", piattaforma: "facebook", tipo: "profilo", categoria: "partner", nome: "Daniele Manuelli", url: "https://www.facebook.com/share/17pCJoQvh4", persona: true, logo: "/brand/dm-comunicazioni.jpg", channel: ["dm"], stato: "pubblico", fonte: DM, descrizione: "Media partner DM Comunicazioni." }),
  v({ id: "facebook-sportuprimini", piattaforma: "facebook", tipo: "pagina", categoria: "partner", nome: "Sport Up Rimini", handle: "facebook.com/sportuprimini", url: "https://www.facebook.com/sportuprimini", channel: ["dm"], stato: "pubblico", fonte: DM, descrizione: "Media partner DM Comunicazioni." }),
];
