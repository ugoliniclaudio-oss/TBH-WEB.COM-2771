/**
 * PRODOTTI E GADGET TBH — specifica di Claudio del 16/09/2026, punti 4, 5 e 6.
 *
 * Schede prodotto modificabili dal pannello: magliette, cappellini, braccialetti,
 * lanyard, pass, portachiavi, adesivi, shopper e altri gadget per fan e supporter.
 *
 * REGOLE RISPETTATE
 * · nessun prezzo inventato: se il prezzo non è stato inserito la scheda resta
 *   IN ALLESTIMENTO e nessun pulsante di acquisto compare;
 * · nessun logo ridisegnato o generato: si usano SOLO i loghi originali caricati
 *   dal pannello (tabella `media`, upload reale su bucket);
 * · nessuna data e nessuna disponibilità indovinata: i campi vuoti restano vuoti;
 * · due modalità di acquisto configurabili PER PRODOTTO E PER VARIANTE:
 *   A) Stripe Checkout (Payment Link oppure Price ID proprio della variante)
 *   B) Ordine WhatsApp con messaggio già scritto.
 */

import { IN_ALLESTIMENTO_NOTA, IN_ALLESTIMENTO_TITOLO } from "./allestimento-vuoto";

export { IN_ALLESTIMENTO_TITOLO, IN_ALLESTIMENTO_NOTA };

/* ════════════════════════ NUMERO WHATSAPP TBH ════════════════════════ */

/** Valore predefinito indicato da Claudio: si può sovrascrivere per prodotto. */
export const WHATSAPP_PREDEFINITO = "+39 379 208 8524";

/** Solo cifre, come vuole wa.me (39 379 208 8524 → 393792088524). */
export function numeroWhatsApp(v: string | null | undefined): string {
  const s = (v ?? "").trim() || WHATSAPP_PREDEFINITO;
  const cifre = s.replace(/[^\d]/g, "");
  return cifre;
}

/* ════════════════════════ CATEGORIE DEI GADGET ════════════════════════ */

export const CATEGORIE_PRODOTTO = [
  "Magliette",
  "Cappellini",
  "Braccialetti",
  "Lanyard",
  "Pass",
  "Portachiavi",
  "Adesivi",
  "Shopper",
  "Felpe",
  "Altri gadget",
] as const;

export type CategoriaProdotto = (typeof CATEGORIE_PRODOTTO)[number];

/* ════════════════════════ STATO E DISPONIBILITÀ ════════════════════════ */

export type StatoProdotto = "bozza" | "pubblicato" | "sospeso";

export const STATI_PRODOTTO: { codice: StatoProdotto; nome: string; pubblico: boolean }[] = [
  { codice: "bozza", nome: "BOZZA — solo nel pannello", pubblico: false },
  { codice: "pubblicato", nome: "PUBBLICATO — visibile sul sito", pubblico: true },
  { codice: "sospeso", nome: "SOSPESO — resta in archivio, non si vede", pubblico: false },
];

export function normalizzaStatoProdotto(v: string | null | undefined): StatoProdotto {
  const s = (v ?? "").trim();
  return s === "pubblicato" || s === "sospeso" ? s : "bozza";
}

export function prodottoPubblico(s: StatoProdotto): boolean {
  return STATI_PRODOTTO.find((x) => x.codice === s)?.pubblico ?? false;
}

export type Disponibilita = "disponibile" | "su_ordinazione" | "esaurito" | "in_allestimento";

export const DISPONIBILITA: { codice: Disponibilita; nome: string }[] = [
  { codice: "in_allestimento", nome: "IN ALLESTIMENTO — non ancora definita" },
  { codice: "disponibile", nome: "DISPONIBILE — pronto in magazzino" },
  { codice: "su_ordinazione", nome: "SU ORDINAZIONE — prodotto su richiesta" },
  { codice: "esaurito", nome: "ESAURITO — momentaneamente non ordinabile" },
];

export function normalizzaDisponibilita(v: string | null | undefined): Disponibilita {
  const s = (v ?? "").trim();
  return s === "disponibile" || s === "su_ordinazione" || s === "esaurito"
    ? s
    : "in_allestimento";
}

export function nomeDisponibilita(d: Disponibilita): string {
  return DISPONIBILITA.find((x) => x.codice === d)?.nome.split(" — ")[0] ?? IN_ALLESTIMENTO_TITOLO;
}

/* ════════════════════════ LA SCHEDA PRODOTTO ════════════════════════ */

export type VarianteProdotto = {
  id: number;
  prodottoId: number;
  /** Colore, modello o versione. */
  colore: string | null;
  taglia: string | null;
  /** Codice della variante: quello che finisce nel messaggio WhatsApp e su Stripe. */
  codice: string | null;
  /** Prezzi propri della variante: null = valgono quelli del prodotto. */
  prezzoCents: number | null;
  prezzoPromoCents: number | null;
  prezzoFidelityCents: number | null;
  /** Stripe della singola variante (Payment Link oppure Price ID). */
  stripeLink: string | null;
  stripePriceId: string | null;
  immagineUrl: string | null;
  disponibilita: Disponibilita;
  ordine: number;
};

export type Prodotto = {
  id: number;
  slug: string;
  nome: string;
  /** Codice prodotto usato negli ordini e nel messaggio WhatsApp. */
  codice: string | null;
  categoria: string | null;
  stato: StatoProdotto;
  /** Logo o marchio originale caricato: mai generato, mai ridisegnato. */
  logoUrl: string | null;
  descrizione: string | null;
  /** Galleria: immagini e video, un indirizzo per riga o separati da virgola. */
  galleriaUrl: string | null;
  prezzoCents: number | null;
  prezzoPromoCents: number | null;
  prezzoFidelityCents: number | null;
  disponibilita: Disponibilita;
  /** Tempi di produzione e consegna dichiarati da Claudio (testo libero). */
  tempiConsegna: string | null;
  /** true = si può far stampare un nome o un testo. */
  personalizzabile: boolean;
  etichettaPersonalizzazione: string | null;
  /** true = il cliente può caricare la propria immagine o il proprio logo. */
  caricaLogoCliente: boolean;
  /** Stripe del prodotto (vale se la variante non ha il suo). */
  stripeLink: string | null;
  stripePriceId: string | null;
  /** Numero WhatsApp dedicato: vuoto = WHATSAPP_PREDEFINITO. */
  whatsappNumero: string | null;
  quantitaMin: number;
  quantitaMax: number;
  /** Finestra di pubblicazione AAAA-MM-GG: fuori finestra la scheda si sospende. */
  dal: string | null;
  al: string | null;
  ordine: number;
  varianti: VarianteProdotto[];
};

/* ════════════════════════ PREZZI ════════════════════════ */

export type PrezziProdotto = {
  pieno: number | null;
  promo: number | null;
  fidelity: number | null;
  /** Prezzo che il cliente paga: promo se c'è, altrimenti pieno. */
  attivo: number | null;
};

/** I prezzi effettivi: quelli della variante, se ci sono, poi quelli del prodotto. */
export function prezziProdotto(
  p: Pick<Prodotto, "prezzoCents" | "prezzoPromoCents" | "prezzoFidelityCents">,
  v?: Pick<VarianteProdotto, "prezzoCents" | "prezzoPromoCents" | "prezzoFidelityCents"> | null,
): PrezziProdotto {
  const pieno = v?.prezzoCents ?? p.prezzoCents ?? null;
  const promo = v?.prezzoPromoCents ?? p.prezzoPromoCents ?? null;
  const fidelity = v?.prezzoFidelityCents ?? p.prezzoFidelityCents ?? null;
  return { pieno, promo, fidelity, attivo: promo ?? pieno };
}

export function euro(cents: number | null | undefined): string {
  if (cents === null || cents === undefined) return IN_ALLESTIMENTO_TITOLO;
  return (cents / 100).toLocaleString("it-IT", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
  });
}

/** Totale della riga: prezzo attivo × quantità. Null se il prezzo non c'è. */
export function totaleCents(attivo: number | null, quantita: number): number | null {
  if (attivo === null) return null;
  const q = Math.max(1, Math.trunc(quantita || 1));
  return attivo * q;
}

/* ════════════════════════ REGOLE DEI PULSANTI (punto 6) ════════════════════════ */

export const PULSANTE_STRIPE = "ACQUISTA ORA — STRIPE";
export const PULSANTE_STRIPE_BREVE = "ACQUISTA ORA";
export const PULSANTE_WHATSAPP = "ORDINA O RICHIEDI INFORMAZIONI SU WHATSAPP";
export const PULSANTE_WHATSAPP_BREVE = "CONTATTA / ORDINA SU WHATSAPP";

export type ModalitaAcquisto = {
  /** Stripe configurato per questo prodotto o per questa variante. */
  stripe: boolean;
  /** Payment Link diretto, quando inserito. */
  stripeLink: string | null;
  /** Price ID della variante o del prodotto, quando inserito. */
  stripePriceId: string | null;
  whatsapp: boolean;
  numeroWhatsapp: string | null;
  /** true = niente configurato: la scheda mostra IN ALLESTIMENTO. */
  inAllestimento: boolean;
  /** Testi da stampare: seguono esattamente le quattro regole del punto 6. */
  testoStripe: string | null;
  testoWhatsapp: string | null;
};

/**
 * Le quattro regole del punto 6:
 *  · solo Stripe            → ACQUISTA ORA
 *  · solo WhatsApp          → CONTATTA / ORDINA SU WHATSAPP
 *  · entrambi               → entrambi i pulsanti
 *  · nessuno dei due        → IN ALLESTIMENTO
 * Senza prezzo non si vende: Stripe con Price ID resta valido (il prezzo è su
 * Stripe), ma un prezzo assente senza Price ID blocca l'acquisto.
 */
export function modalitaAcquisto(
  p: Pick<Prodotto, "stripeLink" | "stripePriceId" | "whatsappNumero" | "disponibilita">,
  v?: Pick<VarianteProdotto, "stripeLink" | "stripePriceId" | "disponibilita"> | null,
  prezzoAttivo?: number | null,
): ModalitaAcquisto {
  const link = (v?.stripeLink ?? p.stripeLink ?? "").trim() || null;
  const priceId = (v?.stripePriceId ?? p.stripePriceId ?? "").trim() || null;
  const numero = (p.whatsappNumero ?? "").trim() || WHATSAPP_PREDEFINITO;
  const esaurito = (v?.disponibilita ?? p.disponibilita) === "esaurito";

  const stripe = Boolean((link || priceId || (prezzoAttivo ?? null) !== null) && !esaurito);
  // WhatsApp resta sempre possibile: è un contatto, non una vendita.
  const whatsapp = Boolean(numero);

  const soloStripe = stripe && !whatsapp;
  return {
    stripe,
    stripeLink: link,
    stripePriceId: priceId,
    whatsapp,
    numeroWhatsapp: whatsapp ? numero : null,
    inAllestimento: !stripe && !whatsapp,
    testoStripe: stripe ? (soloStripe ? PULSANTE_STRIPE_BREVE : PULSANTE_STRIPE) : null,
    testoWhatsapp: whatsapp ? (stripe ? PULSANTE_WHATSAPP : PULSANTE_WHATSAPP_BREVE) : null,
  };
}

/* ════════════════════════ MESSAGGIO WHATSAPP (punto 5B) ════════════════════════ */

export type DatiOrdine = {
  nome: string;
  codice?: string | null;
  colore?: string | null;
  taglia?: string | null;
  quantita?: number | null;
  personalizzazione?: string | null;
  prezzo?: string | null;
  linkProdotto?: string | null;
};

/** Le righe vuote restano vuote: non si inventa nulla per riempire il messaggio. */
function riga(etichetta: string, valore: string | null | undefined): string {
  return `${etichetta}: ${(valore ?? "").toString().trim()}`;
}

/** Il messaggio esattamente nel formato chiesto da Claudio. */
export function messaggioWhatsApp(d: DatiOrdine): string {
  return [
    "Buongiorno TBH, desidero informazioni/ordinare:",
    riga("Prodotto", d.nome),
    riga("Codice", d.codice),
    riga("Colore", d.colore),
    riga("Taglia", d.taglia),
    riga("Quantità", d.quantita ? String(d.quantita) : ""),
    riga("Personalizzazione", d.personalizzazione),
    riga("Prezzo visualizzato", d.prezzo),
    riga("Link prodotto", d.linkProdotto),
  ].join("\n");
}

/** Indirizzo completo del pulsante WhatsApp, con messaggio già codificato. */
export function linkWhatsApp(numero: string | null | undefined, d: DatiOrdine): string {
  return `https://wa.me/${numeroWhatsApp(numero)}?text=${encodeURIComponent(messaggioWhatsApp(d))}`;
}

/* ════════════════════════ FINESTRA DI PUBBLICAZIONE ════════════════════════ */

/** Sospensione automatica dei contenuti scaduti, senza toccare l'archivio. */
export function inFinestra(
  p: Pick<Prodotto, "dal" | "al">,
  oggi = new Date().toISOString().slice(0, 10),
): boolean {
  const dal = (p.dal ?? "").trim();
  const al = (p.al ?? "").trim();
  if (dal && oggi < dal) return false;
  if (al && oggi > al) return false;
  return true;
}

/** true = la scheda si può mostrare al pubblico adesso. */
export function prodottoInVetrina(p: Prodotto, oggi?: string): boolean {
  return prodottoPubblico(p.stato) && inFinestra(p, oggi);
}

/* ════════════════════════ TAGLIE E COLORI SUGGERITI ════════════════════════ */

/**
 * Elenchi di comodo per il pannello: sono solo scorciatoie di scrittura, non
 * dati di prodotto. Nessuna variante esiste finché Claudio non la salva.
 */
export const TAGLIE_SUGGERITE = ["XS", "S", "M", "L", "XL", "XXL", "3XL", "TAGLIA UNICA"] as const;
export const QUANTITA_MAX = 200;
