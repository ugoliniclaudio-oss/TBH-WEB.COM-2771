/* ────────────────────────────────────────────────────────────────────────────
   SINCRONIZZAZIONE STRIPE → TOUCH PLAZA (richiesta di Claudio del 03/10/2026).

   Tipi e regole PURE, condivise fra server e pagine. Nessuna chiamata di rete qui.

   REGOLE
     · I dati COMMERCIALI (nome, descrizione, immagini, prezzi, valuta, una tantum o
       ricorrente, stato attivo) vengono da Stripe e la sync li aggiorna.
     · I dati EDITORIALI (testo, categoria, immagini aggiuntive, condizioni) restano
       del sito: la sync non li tocca mai.
     · IVA e trattamento fiscale si mostrano SOLO se confermati dal pannello (o dalla
       scheda ufficiale dell'articolo): mai dedotti in automatico da Stripe.
     · Ogni variante paga col SUO pagamento: Payment Link legato a quel solo prezzo,
       oppure Checkout Session creata dal server su quel Price. Mai due articoli
       sullo stesso pagamento.
   ──────────────────────────────────────────────────────────────────────────── */

export type VarianteStripe = {
  priceId: string;
  /** Nome della variante: il nickname del Price su Stripe, se c'è. */
  nome: string | null;
  /** Importo in centesimi. null = prezzo libero (non gestito: l'articolo resta da completare). */
  importoCents: number | null;
  valuta: string;
  tipo: "una-tantum" | "ricorrente";
  intervallo: "day" | "week" | "month" | "year" | null;
  intervalloConteggio: number | null;
  /** Payment Link ATTIVO che contiene SOLO questo prezzo. null = si paga con Checkout Session. */
  paymentLink: string | null;
  paymentLinkId: string | null;
};

export type StatoStripe = "pubblicato" | "in-allestimento" | "archiviato";

/** Le informazioni Stripe che viaggiano insieme a un articolo del Touch Plaza. */
export type InfoStripe = {
  /** "stripe" = scheda nata dalla sync; "manuale" = scheda del sito associata a un Product. */
  origine: "stripe" | "manuale";
  account: string;
  productId: string;
  varianti: VarianteStripe[];
  stato: StatoStripe;
  /** Cosa manca perché l'articolo sia acquistabile (per il pannello: «Da completare»). */
  mancanti: string[];
  ultimaSync: string | null;
};

/** Eventi Stripe da attivare sul webhook del catalogo. */
export const EVENTI_CATALOGO = [
  "product.created",
  "product.updated",
  "product.deleted",
  "price.created",
  "price.updated",
  "price.deleted",
  "payment_link.created",
  "payment_link.updated",
] as const;

export function eventoCatalogo(tipo: string) {
  return (EVENTI_CATALOGO as readonly string[]).includes(tipo);
}

const INTERVALLI: Record<string, [string, string]> = {
  day: ["giorno", "giorni"],
  week: ["settimana", "settimane"],
  month: ["mese", "mesi"],
  year: ["anno", "anni"],
};

/** «ogni mese», «ogni 3 mesi»; null per i pagamenti una tantum. */
export function testoRicorrenza(v: Pick<VarianteStripe, "tipo" | "intervallo" | "intervalloConteggio">) {
  if (v.tipo !== "ricorrente" || !v.intervallo) return null;
  const [uno, molti] = INTERVALLI[v.intervallo] ?? [v.intervallo, v.intervallo];
  const n = v.intervalloConteggio ?? 1;
  return n > 1 ? `ogni ${n} ${molti}` : `ogni ${uno}`;
}

/** Importo nella valuta del Price (EUR, ma anche altre se l'account le usa). */
export function importoVariante(v: Pick<VarianteStripe, "importoCents" | "valuta">) {
  if (v.importoCents === null) return "Prezzo da definire";
  if (v.importoCents === 0) return "Gratuito";
  return new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: v.valuta.toUpperCase(),
    minimumFractionDigits: 2,
    useGrouping: true,
  }).format(v.importoCents / 100);
}

/** Etichetta completa per il selettore delle varianti. */
export function etichettaVariante(v: VarianteStripe) {
  const r = testoRicorrenza(v);
  return [v.nome, `${importoVariante(v)}${r ? ` ${r}` : ""}`].filter(Boolean).join(" · ");
}
