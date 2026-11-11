/* ────────────────────────────────────────────────────────────────────────────
   TOUCH PLAZA — PREZZI, PROMO, CIRCUITO TBH E CASHBACK (regole del 03/10/2026).

   Fonte: «REGOLE SHOP: PREZZI, PROMO, CIRCUITO TBH E CASHBACK» di Claudio.

     PREZZO PIENO  = prezzo ufficiale di listino (`priceCents` del prodotto).
     PROMO PUBBLICA = accessibile a tutti nel periodo indicato, SOLO se configurata qui.
     VANTAGGIO TBH  = personale, richiedibile solo dagli aderenti al Circuito TBH.
     CASHBACK TBH   = richiedibile solo dagli aderenti, quando previsto per l'articolo.

   REGOLE DI CODICE
     · Nessuna promo, percentuale, sconto o cashback generato in automatico: un campo
       non compilato resta `null` / assente e la pagina NON mostra nulla di inventato.
     · Lo sconto TBH non si applica mai da solo: si RICHIEDE (WhatsApp / e-mail).
     · La cumulabilità si dichiara promo per promo: mai promessa in automatico.
     · Una promo vale solo se `attiva` e dentro le sue date (inizio/fine incluse).
   ──────────────────────────────────────────────────────────────────────────── */

/** Campagne pubbliche previste dal regolamento (punto 2). */
export const TIPI_PROMO = [
  "PROMO",
  "OFFERTA",
  "OFFERTA SPECIALE",
  "LOW COST",
  "SOTTOCOSTO",
  "BLACK FRIDAY",
  "NATALE",
  "SALDI / STAGIONALI",
  "LANCIO",
  "LAST MINUTE",
  "EVENTO SPECIALE",
  "ALTRA CAMPAGNA TBH",
] as const;
export type TipoPromo = (typeof TIPI_PROMO)[number];

/** Una promozione pubblica REALMENTE configurata su un articolo (punti 2, 5, 10). */
export type PromoArticolo = {
  /** Promo attiva SÌ/NO. */
  attiva: boolean;
  tipo: TipoPromo;
  /** Percentuale di sconto dichiarata (es. 20 = -20%), se la campagna è in percentuale. */
  scontoPercentuale: number | null;
  /** Importo dello sconto in centesimi, se la campagna è a importo. */
  scontoCents: number | null;
  /** Prezzo promozionale in centesimi: sempre scritto, mai calcolato a caso. */
  prezzoPromoCents: number;
  /** Data inizio / fine promo, formato AAAA-MM-GG (fine inclusa). */
  inizio: string | null;
  fine: string | null;
  /** CUMULABILE CON VANTAGGI TBH: SÌ / NO (punto 5). */
  cumulabileTbh: boolean;
  /** Codice promo richiesto SÌ/NO. */
  codiceRichiesto: boolean;
  /** Condizioni della campagna, se ci sono. */
  condizioni?: string | null;
};

/** Campi commerciali di un articolo Touch Plaza (punto 10). Tutti facoltativi. */
export type CampiCommerciali = {
  /** IVA in percentuale (es. 22). null = non indicata. */
  ivaPercentuale?: number | null;
  /** true se `priceCents` è già IVA inclusa. null = non indicato. */
  prezzoIvaInclusa?: boolean | null;
  promo?: PromoArticolo | null;
  /** Cashback TBH SÌ/NO. null/assente = nessun cashback configurato. */
  cashbackTbh?: boolean | null;
  /** Vantaggi TBH dedicati già previsti per l'articolo (etichetta VANTAGGI TBH). */
  vantaggiTbh?: boolean | null;
  /** Condizioni specifiche dell'articolo. */
  condizioni?: string | null;
  /**
   * 15/10/2026 — come si legge il listino, accanto al prezzo, quando Claudio lo scrive
   * (es. «+ IVA / anno» per TBH SPORT). Assente = solo l'importo.
   */
  notaPrezzo?: string | null;
};

type ConPrezzo = CampiCommerciali & { priceCents: number };

function oggiIso(ora: Date) {
  const y = ora.getFullYear();
  const m = String(ora.getMonth() + 1).padStart(2, "0");
  const d = String(ora.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** La promo vale adesso? Solo se attiva, dentro le date e davvero più bassa del listino. */
export function promoAttiva(p: ConPrezzo, ora: Date = new Date()): PromoArticolo | null {
  const promo = p.promo;
  if (!promo || !promo.attiva) return null;
  const oggi = oggiIso(ora);
  if (promo.inizio && oggi < promo.inizio) return null;
  if (promo.fine && oggi > promo.fine) return null;
  if (!(promo.prezzoPromoCents >= 0 && promo.prezzoPromoCents < p.priceCents)) return null;
  return promo;
}

/** Prezzo che paga chiunque oggi: promo pubblica attiva, altrimenti prezzo pieno. */
export function prezzoPubblicoCents(p: ConPrezzo, ora: Date = new Date()) {
  return promoAttiva(p, ora)?.prezzoPromoCents ?? p.priceCents;
}

/** Etichette del negozio (punto 9): compaiono SOLO quando la condizione è attiva. */
export const ETICHETTE_SHOP = [
  "PREZZO PIENO",
  "IN PROMO",
  "LOW COST",
  "SOTTOCOSTO",
  "OFFERTA SPECIALE",
  "VANTAGGI TBH",
  "CASHBACK TBH",
  "BLACK FRIDAY",
  "NATALE / STAGIONALE",
] as const;
export type EtichettaShop = (typeof ETICHETTE_SHOP)[number];

export function etichetteAttive(p: ConPrezzo, ora: Date = new Date()): EtichettaShop[] {
  const out: EtichettaShop[] = [];
  const promo = promoAttiva(p, ora);
  if (!promo) out.push("PREZZO PIENO");
  else {
    out.push("IN PROMO");
    if (promo.tipo === "LOW COST") out.push("LOW COST");
    if (promo.tipo === "SOTTOCOSTO") out.push("SOTTOCOSTO");
    if (promo.tipo === "OFFERTA SPECIALE" || promo.tipo === "OFFERTA") out.push("OFFERTA SPECIALE");
    if (promo.tipo === "BLACK FRIDAY") out.push("BLACK FRIDAY");
    if (promo.tipo === "NATALE" || promo.tipo === "SALDI / STAGIONALI") out.push("NATALE / STAGIONALE");
  }
  if (p.vantaggiTbh === true) out.push("VANTAGGI TBH");
  if (p.cashbackTbh === true) out.push("CASHBACK TBH");
  return out;
}
