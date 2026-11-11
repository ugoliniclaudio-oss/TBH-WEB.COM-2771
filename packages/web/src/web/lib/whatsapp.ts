/** Punto 23 della Master List: WhatsApp commerciale con messaggio SEMPRE precompilato. */
export const WA_NUMERO = "+39 379 208 8524";
export const WA_NUMERO_2 = "+39 327 123 7328";

const BASE = "https://wa.me/393792088524";

export function wa(testo: string) {
  return `${BASE}?text=${encodeURIComponent(testo)}`;
}

/** Prezzo in euro leggibile per i messaggi WhatsApp (ordine 10-13). */
function prezzo(priceCents?: number | null) {
  if (priceCents == null) return null;
  if (priceCents === 0) return "gratuito";
  return new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: "EUR",
  }).format(priceCents / 100);
}

/** Ordine prodotto: nome + codice + prezzo, sempre precompilati. */
export function waOrdine(prodotto: string, codice: string, priceCents?: number | null) {
  const p = prezzo(priceCents);
  return wa(
    `Buongiorno, vorrei ordinare ${prodotto} — codice ${codice}${p ? ` — prezzo ${p}` : ""}.`,
  );
}

/** Richiesta di rateizzazione / finanziamento (punto 27). */
export function waFinanziamento(prodotto: string, codice: string, priceCents?: number | null) {
  const p = prezzo(priceCents);
  return wa(
    `Buongiorno, vorrei informazioni sulla rateizzazione di ${prodotto} — codice ${codice}${
      p ? ` — prezzo ${p}` : ""
    }.`,
  );
}

/** Richiesta informazioni su un livello TBH (punto 29). */
export function waLivello(numero: number, nome: string) {
  return wa(`Buongiorno, vorrei informazioni sul Livello TBH ${numero} — ${nome}.`);
}

/* 14/10/2026 — waCandidatura rimossa: le candidature TBH passano solo da lavoro@tibihacca.com
   e dai moduli online. WhatsApp resta per le sole informazioni (waInfo). */

/** Richiesta generica su una sezione o un brand. */
export function waInfo(argomento: string) {
  return wa(`Buongiorno, vorrei informazioni su ${argomento}.`);
}

/**
 * 03/10/2026 — «RICHIEDI VANTAGGI TBH» (regole shop, punto 4): l'aderente al Circuito TBH
 * chiede PRIMA di pagare sconto personalizzato, codici, condizioni riservate e cashback.
 * Nessun vantaggio è automatico: il messaggio è una richiesta, la verifica la fa TBH.
 */
export function waVantaggiTbh(prodotto: string, codice: string, priceCents?: number | null) {
  const p = prezzo(priceCents);
  return wa(
    `Buongiorno, sono nel Circuito TBH e prima di pagare vorrei richiedere i miei vantaggi TBH (sconto personalizzato, codice dedicato, condizioni riservate, eventuale cashback) su ${prodotto} — codice ${codice}${
      p ? ` — prezzo ${p}` : ""
    }.`,
  );
}

/** Richiesta generica di vantaggi TBH, senza un articolo preciso (pagina regolamento). */
export function waVantaggiTbhGenerico() {
  return wa(
    "Buongiorno, sono nel Circuito TBH e vorrei sapere quali vantaggi TBH (sconti personalizzati, codici dedicati, condizioni riservate, cashback) posso richiedere su Touch Plaza.",
  );
}
