/* ────────────────────────────────────────────────────────────────────────────
   TBH SPORT — LE 4 ESPERIENZE (listino di Claudio, 15/10/2026).

   Quattro piani progressivi per società sportive, associazioni, club e
   organizzatori di eventi. Ogni piano comprende tutti i servizi del precedente.

   · Testi e prezzi trascritti ESATTAMENTE dal listino inviato da Claudio
     (fa fede il testo, non le scritte dentro le grafiche).
   · Prezzi annuali, IVA esclusa, in centesimi.
   · Gli sconti (−20% promo per tutti, −40% Fidelity TBH) sono quelli della
     proposta grafica e restano DA APPROVARE: la pagina lo dice chiaramente.
   · Pagamento online: link Stripe di Claudio (15/10/2026) — ESSENTIAL €2.400,
     CONNECT €3.500, MEDIA PRO €6.700, ARENA €9.150: tutti al prezzo pieno di listino.
     Promo e Fidelity NON sono automatiche: si richiedono prima di pagare.
   · Locandine: le 5 grafiche ufficiali consegnate da Claudio (public/tbh-sport/).
   ──────────────────────────────────────────────────────────────────────────── */

export type PrezziEsperienza = {
  /** Prezzo pieno di listino, centesimi, IVA esclusa, annuale. */
  pieno: number;
  /** Promo per tutti (−20%). */
  promo: number;
  /** Fidelity TBH (−40%). */
  fidelity: number;
};

export type EsperienzaSport = {
  numero: 1 | 2 | 3 | 4;
  slug: "essential" | "connect" | "media-pro" | "arena";
  nome: string;
  claim: string;
  obiettivo: string;
  /** Piano precedente compreso per intero (null per il primo). */
  comprende: string | null;
  /** Solo i servizi che il piano AGGIUNGE al precedente. */
  servizi: string[];
  prezzi: PrezziEsperienza;
  locandina: string;
  /** Link di pagamento Stripe ufficiale (incassa il PREZZO PIENO di listino). null = in allestimento. */
  pagamento: string | null;
};

export const SCONTO_PROMO_PCT = 20;
export const SCONTO_FIDELITY_PCT = 40;
export const SCONTI_DA_APPROVARE = true;

export const ESPERIENZE_SPORT: EsperienzaSport[] = [
  {
    numero: 1,
    slug: "essential",
    nome: "TBH ESSENTIAL",
    claim: "Il tuo club online",
    obiettivo: "Dare alla società sportiva una presenza digitale professionale.",
    comprende: null,
    servizi: [
      "Sito web professionale personalizzato.",
      "Gestione squadre, atleti e staff.",
      "Calendari delle partite e risultati.",
      "Pubblicazione di notizie, fotografie ed eventi.",
      "Spazi dedicati a sponsor e partner.",
      "Profilo della società nel Circuito TBH.",
      "Assistenza tecnica.",
    ],
    prezzi: { pieno: 240000, promo: 192000, fidelity: 144000 },
    locandina: "/tbh-sport/essential.jpg",
    pagamento: "https://buy.stripe.com/7sY6oB5Qhe6Z3dp56wfQI09",
  },
  {
    numero: 2,
    slug: "connect",
    nome: "TBH CONNECT",
    claim: "Comunicazione e community",
    obiettivo: "Trasformare il sito in uno strumento di comunicazione, iscrizione e fidelizzazione.",
    comprende: "ESSENTIAL",
    servizi: [
      "Iscrizioni e pagamenti online.",
      "Cinque caselle email professionali.",
      "Strumenti per social media e contenuti.",
      "Comunicazione e promozione degli sponsor.",
      "Funzionalità Fidelity e collegamento NFC.",
      "Consulenza commerciale.",
    ],
    prezzi: { pieno: 350000, promo: 280000, fidelity: 210000 },
    locandina: "/tbh-sport/connect.jpg",
    pagamento: "https://buy.stripe.com/eVqfZbfqR6Ex01d7eEfQI0a",
  },
  {
    numero: 3,
    slug: "media-pro",
    nome: "TBH MEDIA PRO",
    claim: "Racconta il tuo talento",
    obiettivo: "Aumentare la visibilità della società attraverso video, contenuti e pubblicità.",
    comprende: "CONNECT",
    servizi: [
      "Produzione video annuale.",
      "Highlights delle partite e interviste.",
      "Contenuti audiovisivi speciali.",
      "Campagne pubblicitarie avanzate.",
      "Visibilità sui canali editoriali TBH.",
      "Supporto prioritario.",
      "Accesso a eventi e format TBH.",
    ],
    prezzi: { pieno: 670000, promo: 536000, fidelity: 402000 },
    locandina: "/tbh-sport/media-pro.jpg",
    pagamento: "https://buy.stripe.com/bJeeV70vXe6Z7tF0QgfQI0b",
  },
  {
    numero: 4,
    slug: "arena",
    nome: "TBH ARENA",
    claim: "L’esperienza completa",
    obiettivo:
      "Offrire alla società sportiva un ecosistema completo di servizi digitali, media, eventi e opportunità commerciali.",
    comprende: "MEDIA PRO",
    servizi: [
      "Gestione completa dei contenuti.",
      "Produzioni video aggiuntive durante la stagione.",
      "Campagne pubblicitarie premium.",
      "Organizzazione di eventi e hospitality.",
      "Attività promozionali sul territorio.",
      "Formazione e servizi dedicati.",
      "Integrazione nell’ecosistema commerciale TBH.",
      "Supporto esclusivo e personalizzato.",
    ],
    prezzi: { pieno: 915000, promo: 732000, fidelity: 549000 },
    locandina: "/tbh-sport/arena.jpg",
    pagamento: "https://buy.stripe.com/8x25kxfqR3sldS31UkfQI0c",
  },
];

/** Locandina riepilogativa «4 ESPERIENZE TBH SPORT». */
export const LOCANDINA_4_ESPERIENZE = "/tbh-sport/4-esperienze.jpg";

/** Il percorso, come nella grafica riepilogativa di Claudio. */
export const PERCORSO_TBH_SPORT: { titolo: string; testo: string }[] = [
  { titolo: "Scegli", testo: "la tua esperienza TBH" },
  { titolo: "Attiviamo", testo: "il tuo progetto" },
  { titolo: "Realizziamo", testo: "i contenuti e i servizi" },
  { titolo: "Fai crescere", testo: "il tuo club" },
  { titolo: "Entri nel Circuito TBH", testo: "più clienti, più visibilità, più opportunità" },
];

export const NOTE_TBH_SPORT: string[] = [
  "Tutti i prezzi sono annuali, esposti IVA esclusa, come richiesto per il listino commerciale.",
  "Gli sconti indicati sono quelli della proposta grafica e restano da approvare.",
  "Le quantità delle produzioni, le ore di assistenza, gli spazi pubblicitari e le prestazioni degli eventi devono essere specificati contrattualmente.",
  "I vantaggi Fidelity sono subordinati all’adesione e alle condizioni applicabili del Circuito TBH.",
];

export const DESTINATARI_TBH_SPORT = "società sportive, associazioni, club e organizzatori di eventi";
export const EMAIL_TBH_SPORT = "marketing@tibihacca.com";
