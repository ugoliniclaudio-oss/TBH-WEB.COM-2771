/**
 * TOUCH MUSIC RADIO TV · TOUCH PRODUCTION LTD
 *
 * Dati e link COPIATI ALLA LETTERA dalla scheda canale inviata da Claudio il 29/08/2026.
 * Regole rispettate:
 * · nessun numero, nessun link e nessun servizio inventato o completato a mano;
 * · i dati del canale sono dichiarati con la data del rilevamento, perché cambiano nel tempo;
 * · il dato «2.2K 23 -» presente nel testo inviato NON è pubblicato: non è chiaro a cosa si
 *   riferisca (ascolti Suno? brani?), quindi resta da confermare invece di essere interpretato;
 * · Touch Production Ltd è la società di produzione già in anagrafica (TBH-004): qui si
 *   pubblicano solo le aree di produzione dichiarate da lei stessa.
 */

export const CANALE_TOUCH_MUSIC_TV = {
  nome: "Touch Music Radio TV",
  titolare: "©Touch Music Radio TV®",
  url: "https://www.youtube.com/@touchmusicradiotv",
  sito: "https://touchmusicradiotv.com",
  paese: "Italia",
  dataIscrizione: "12 febbraio 2015",
  iscritti: 55,
  video: 123,
  visualizzazioni: 9573,
  rilevato: "29/08/2026",
  nota:
    "Dati del canale rilevati il 29/08/2026 dalla scheda ufficiale inviata dalla direzione: " +
    "55 iscritti, 123 video, 9.573 visualizzazioni, canale aperto il 12 febbraio 2015. " +
    "I numeri cambiano nel tempo: si aggiornano solo su nuovo dato ufficiale.",
};

export const SUNO_HUGO = {
  handle: "@hugoveejay",
  url: "https://suno.com/@hugoveejay",
  nota:
    "Profilo ufficiale dei brani. Il dato «2.2K 23» riportato nella scheda inviata non viene " +
    "pubblicato: la voce esatta a cui si riferisce è da confermare.",
};

/** Aree di produzione dichiarate da ©Touch Production Ltd® (testo ufficiale della società). */
export const PRODUZIONI_TOUCH: string[] = [
  "Produzioni e Servizi Cinema",
  "Produzioni e Servizi TV",
  "Produzioni e Servizi Radio",
  "Produzioni e Servizi Magazine",
  "Produzioni e Servizi Musicali",
  "Produzioni e Servizi Editoriali",
  "Produzioni e Servizi Eventi",
  "Produzioni e Servizi Logistica",
  "Produzioni e Servizi Service DJ Set e Concerti",
];

export const SELEZIONI_TOUCH = {
  titolo: "Selezioni ufficialmente aperte",
  testo:
    "«Cosa state aspettando, questa è la tua occasione: puoi crescere insieme a noi.» " +
    "Contattaci per informazioni, preventivi, sopralluoghi e colloqui conoscitivi.",
  telefono: "+39 379 208 8524",
  whatsapp: "https://wa.me/393792088524",
};

export type LinkUfficiale = { etichetta: string; dettaglio: string; url: string };

/** Siti ufficiali del gruppo indicati nella scheda canale. */
export const SITI_TOUCH: LinkUfficiale[] = [
  { etichetta: "Touch Production LTD", dettaglio: "touchmusicradiotv.com", url: "https://touchmusicradiotv.com" },
  { etichetta: "Touch Academy", dettaglio: "touchjobsandcasting.com", url: "https://touchjobsandcasting.com" },
  { etichetta: "Touch Business Holding", dettaglio: "touchpay.store", url: "https://touchpay.store" },
];

/** Social ufficiali indicati nella scheda canale, uno per uno, senza aggiunte. */
export const SOCIAL_TOUCH: LinkUfficiale[] = [
  { etichetta: "Facebook", dettaglio: "facebook.com/TouchMusicRadio", url: "https://facebook.com/TouchMusicRadio" },
  { etichetta: "Twitter / X", dettaglio: "twitter.com/ReteRomaTvRadio", url: "https://twitter.com/ReteRomaTvRadio" },
  {
    etichetta: "TikTok",
    dettaglio: "tiktok.com/@touchvillagesrl",
    url: "https://www.tiktok.com/@touchvillagesrl?lang=it-IT",
  },
  {
    etichetta: "LinkedIn",
    dettaglio: "linkedin.com/in/touchvillageentertertainmentsrl",
    url: "https://www.linkedin.com/in/touchvillageentertertainmentsrl",
  },
  {
    etichetta: "Instagram",
    dettaglio: "instagram.com/touchvillageentertainmentsrl",
    url: "https://www.instagram.com/touchvillageentertainmentsrl",
  },
  { etichetta: "Telegram", dettaglio: "t.me/irfxn0iFUddmYmFk", url: "https://t.me/irfxn0iFUddmYmFk" },
  {
    etichetta: "Telegram 2.0",
    dettaglio: "web.telegram.org",
    url: "https://web.telegram.org/k/?account=2#6717733210",
  },
  {
    etichetta: "WhatsApp Business",
    dettaglio: "Catalogo wa.me/c/393792088524",
    url: "https://wa.me/c/393792088524",
  },
];

export const TOUCH_MUSIC_NOTA =
  "Tutti i link di questa sezione sono quelli della scheda ufficiale del canale inviata dalla direzione " +
  "il 29/08/2026, riportati senza modifiche. Il link Telegram nel testo originale conteneva uno spazio " +
  "(«t.me/ irfxn0iFUddmYmFk»): è stato letto come t.me/irfxn0iFUddmYmFk — da confermare. " +
  "Il Telegram 2.0 è un indirizzo di sessione web e potrebbe non aprirsi da altri account.";
