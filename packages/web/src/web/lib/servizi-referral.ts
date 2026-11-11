/**
 * SERVIZI & REFERRAL — «Guadagna con noi».
 *
 * Fonte: istruzioni operative e mockup consegnati da Claudio il 05/09/2026.
 * REGOLE RISPETTATE:
 * · logo, immagine, titolo e pulsante «Apri servizio» → sito UFFICIALE del brand;
 * · pulsante «Guadagna con noi» → link referral PERSONALE di Claudio Ugolini;
 * · nessun link inventato: dove il referral non c'è (bunq) lo stato è «da confermare»
 *   e il pulsante resta un'etichetta non cliccabile, non un bottone morto;
 * · nessun logo ricreato con l'IA: i loghi ufficiali si caricano dal pannello
 *   /allestimento nello spazio `servizi-referral:loghi`.
 */

export type StatoReferral = "attivo" | "da confermare" | "solo profilo";

export type ServizioReferral = {
  id: string;
  nome: string;
  categoria: string;
  etichetta?: string;
  descrizione: string;
  bonus?: string;
  vantaggi?: string[];
  codiceInvito?: string;
  linkUfficiale: string;
  linkReferral: string | null;
  labelUfficiale: string;
  labelReferral: string;
  statoReferral: StatoReferral;
  colore: string;
};

export const SERVIZI_REFERRAL: ServizioReferral[] = [
  {
    id: "revolut-personal",
    nome: "Revolut Personal",
    categoria: "Banca personale",
    etichetta: "Conto personale",
    descrizione:
      "La finanza più smart, semplice e globale. Gestisci il tuo denaro ovunque nel mondo.",
    vantaggi: ["Conto multivaluta", "Carta internazionale", "App semplice e sicura"],
    linkUfficiale: "https://www.revolut.com/it-IT/",
    linkReferral:
      "https://revolut.com/referral/?referral-code=claudi1es0!SEP1-26-AR-RPB&geo-redirect",
    labelUfficiale: "Apri servizio",
    labelReferral: "Guadagna con noi",
    statoReferral: "attivo",
    colore: "var(--tbh-platinum)",
  },
  {
    id: "revolut-business",
    nome: "Revolut Business",
    categoria: "Banca business",
    etichetta: "Per aziende e freelance",
    descrizione:
      "La soluzione business per far crescere la tua attività. Conto, pagamenti e gestione spese in un'unica piattaforma.",
    vantaggi: ["Conto business globale", "Carte aziendali", "Strumenti di gestione"],
    linkUfficiale: "https://business.revolut.com/",
    linkReferral:
      "https://business.revolut.com/signup?promo=C2B-SEP1-26-AR-H2&ext=claudi1es0&context=C2B_REFERRAL",
    labelUfficiale: "Apri servizio",
    labelReferral: "Guadagna con noi",
    statoReferral: "attivo",
    colore: "var(--tbh-platinum)",
  },
  {
    id: "bigo-live",
    nome: "BIGO LIVE",
    categoria: "Social live streaming",
    etichetta: "Social & network",
    descrizione: "Live Your Moment. La piattaforma di dirette social per creare e farsi seguire.",
    bonus:
      "Guadagna bonus in BIGO LIVE! I nuovi utenti che inseriscono il codice di invito 10573217228 riceveranno altre sorprese!",
    codiceInvito: "10573217228",
    linkUfficiale: "https://www.bigo.tv/it/",
    linkReferral: "https://slink.bigovideo.tv/7tVYM6",
    labelUfficiale: "Apri servizio",
    labelReferral: "Guadagna con noi",
    statoReferral: "attivo",
    colore: "#33e0ff",
  },
  {
    id: "bump",
    nome: "Bump",
    categoria: "Social & network",
    etichetta: "Social & network",
    descrizione:
      "Connetti, condividi, cresci. Il modo più semplice per conoscere nuove persone e ampliare il tuo network.",
    linkUfficiale: "https://bump.app/",
    linkReferral: "https://bump.app/p/pDAMlQZBtIWDK",
    labelUfficiale: "Apri Bump",
    labelReferral: "Aggiungimi su Bump",
    statoReferral: "solo profilo",
    colore: "#9dff3c",
  },
  {
    id: "bunq",
    nome: "bunq",
    categoria: "Banca digitale",
    etichetta: "La banca che semplifica la vita",
    descrizione: "La banca che semplifica la vita. Scarica l'app e registrati in 5 minuti.",
    bonus:
      "DEEJAY HUGO pensa che bunq ti piacerà molto, la banca che semplifica la vita. Scarica l'app e registrati in 5 minuti. Come bonus aggiuntivo, riceverete entrambi 50 € di Interesse Extra.",
    linkUfficiale: "https://bunq.com/download",
    linkReferral: null,
    labelUfficiale: "Scarica app",
    labelReferral: "Invito da confermare",
    statoReferral: "da confermare",
    colore: "#ff5bb0",
  },
  {
    id: "vivid-money",
    nome: "Vivid Money",
    categoria: "Banca personale",
    etichetta: "Conto personale",
    descrizione: "Più libertà per il tuo denaro. Conto, investimenti, cashback e molto altro.",
    vantaggi: ["Conto e carta gratuita", "Investimenti semplici", "Fino al 10% di cashback"],
    linkUfficiale: "https://vivid.money/",
    linkReferral: "https://vivid.money/r/claudioY98/0",
    labelUfficiale: "Apri servizio",
    labelReferral: "Guadagna con noi",
    statoReferral: "attivo",
    colore: "#b46bff",
  },
  {
    id: "vivid-business",
    nome: "Vivid Business",
    categoria: "Banca business",
    etichetta: "Per aziende e freelance",
    descrizione:
      "Ottieni un bonus in contanti, guadagna il 4% di interesse nel mese 1, il 3% nel mese 2 — più fino al 10% di cashback, 30 IBAN e fatturazione & contabilità integrate.",
    vantaggi: ["Bonus in contanti", "Fino al 10% di cashback", "30 IBAN, fatturazione e contabilità"],
    linkUfficiale: "https://vivid.money/business",
    linkReferral: "https://vivid.money/r/claudioY98/1",
    labelUfficiale: "Apri servizio",
    labelReferral: "Guadagna con noi",
    statoReferral: "attivo",
    colore: "#b46bff",
  },
];

export const REFERRAL_TITOLO = "Servizi & Referral";
export const REFERRAL_SOTTOTITOLO = "Guadagna con noi";
export const REFERRAL_INTRO =
  "Scopri i migliori servizi, iscriviti tramite i nostri link e ottieni bonus, vantaggi e opportunità. È semplice, sicuro e conviene a tutti.";

export const REFERRAL_PASSI = [
  {
    passo: 1,
    titolo: "Scegli il servizio",
    testo: "Trova la piattaforma che ti interessa.",
  },
  {
    passo: 2,
    titolo: "Clicca su Apri servizio",
    testo: "Verrai indirizzato al sito ufficiale del brand.",
  },
  {
    passo: 3,
    titolo: "Registrati e completa i passaggi",
    testo: "Segui le istruzioni della piattaforma.",
  },
  {
    passo: 4,
    titolo: "Ottieni i bonus",
    testo: "Tu e noi riceviamo i vantaggi previsti dal programma.",
  },
];

export const REFERRAL_PUNTI = [
  { titolo: "Servizi affidabili", testo: "Solo piattaforme sicure e ufficiali." },
  { titolo: "Più vantaggi", testo: "Bonus, cashback e opportunità." },
  { titolo: "Cresci insieme a noi", testo: "Ogni iscrizione ci aiuta a fare di più." },
  { titolo: "Semplice e veloce", testo: "Bastano pochi minuti." },
];

export const REFERRAL_NOTA =
  "I bonus, le percentuali e le condizioni sono quelli pubblicati dalle piattaforme: valgono le regole del programma ufficiale di ciascun servizio al momento dell'iscrizione. TBH non gestisce i conti né i pagamenti dei brand elencati.";
