/**
 * PONTE STRIPE — chiamate diritte all'API di Stripe (form-encoded) e verifica della firma
 * dei webhook. Nessuna libreria aggiuntiva: Stripe accetta `application/x-www-form-urlencoded`.
 *
 * Regola della specifica TBH del 15/09/2026: i pagamenti si fanno su Product e Price VERI
 * creati su Stripe, non su importi improvvisati con `price_data` a partire da quello che
 * arriva dal browser.
 */

const BASE = "https://api.stripe.com/v1";

export function chiaveStripe() {
  return (process.env.STRIPE_SECRET_KEY ?? "").trim();
}

export function stripeConfigurato() {
  return chiaveStripe().length > 0;
}

export function modalitaStripe() {
  return chiaveStripe().startsWith("sk_live") ? "live" : "test";
}

export function segretoWebhook() {
  return (process.env.STRIPE_WEBHOOK_SECRET ?? "").trim();
}

/** Appiattisce un oggetto annidato nella notazione form di Stripe (`a[b][0][c]`). */
function appiattisci(dati: Record<string, unknown>, prefisso = "", out = new URLSearchParams()) {
  for (const [k, v] of Object.entries(dati)) {
    if (v === undefined || v === null) continue;
    const chiave = prefisso ? `${prefisso}[${k}]` : k;
    if (Array.isArray(v)) {
      v.forEach((riga, i) => {
        if (riga !== null && typeof riga === "object") {
          appiattisci(riga as Record<string, unknown>, `${chiave}[${i}]`, out);
        } else {
          out.set(`${chiave}[${i}]`, String(riga));
        }
      });
    } else if (typeof v === "object") {
      appiattisci(v as Record<string, unknown>, chiave, out);
    } else {
      out.set(chiave, String(v));
    }
  }
  return out;
}

export class ErroreStripe extends Error {}

/** POST su Stripe. `idempotenza` evita doppioni se la stessa richiesta parte due volte. */
export async function stripePost<T>(
  percorso: string,
  dati: Record<string, unknown>,
  idempotenza?: string,
): Promise<T> {
  const key = chiaveStripe();
  if (!key) throw new ErroreStripe("Stripe non è configurato: manca STRIPE_SECRET_KEY.");
  return stripePostCon<T>(key, percorso, dati, idempotenza);
}

export async function stripeGet<T>(percorso: string): Promise<T> {
  const key = chiaveStripe();
  if (!key) throw new ErroreStripe("Stripe non è configurato: manca STRIPE_SECRET_KEY.");
  return stripeGetCon<T>(key, percorso);
}

/** POST con la chiave di un account preciso (sincronizzazione multi-account Touch Plaza). */
export async function stripePostCon<T>(
  key: string,
  percorso: string,
  dati: Record<string, unknown>,
  idempotenza?: string,
): Promise<T> {
  const headers: Record<string, string> = {
    Authorization: `Bearer ${key}`,
    "Content-Type": "application/x-www-form-urlencoded",
  };
  if (idempotenza) headers["Idempotency-Key"] = idempotenza;

  const res = await fetch(`${BASE}${percorso}`, {
    method: "POST",
    headers,
    body: appiattisci(dati),
  });
  const json = (await res.json()) as T & { error?: { message?: string } };
  if (!res.ok) throw new ErroreStripe(json.error?.message ?? `Stripe ha risposto ${res.status}.`);
  return json;
}

/** GET con la chiave di un account preciso. */
export async function stripeGetCon<T>(key: string, percorso: string): Promise<T> {
  const res = await fetch(`${BASE}${percorso}`, { headers: { Authorization: `Bearer ${key}` } });
  const json = (await res.json()) as T & { error?: { message?: string } };
  if (!res.ok) throw new ErroreStripe(json.error?.message ?? `Stripe ha risposto ${res.status}.`);
  return json;
}

function esadecimale(buf: ArrayBuffer) {
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

/** Confronto a tempo costante, per non dare indizi sulla firma. */
function ugualiCostante(a: string, b: string) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i += 1) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

/**
 * Verifica l'intestazione `Stripe-Signature` di un webhook (schema v1, HMAC-SHA256).
 * Senza firma valida il corpo non si guarda nemmeno: è l'unica prova che l'incasso è vero.
 */
export async function firmaWebhookValida(
  corpo: string,
  intestazione: string | null,
  segreto: string,
  tolleranzaSecondi = 300,
) {
  if (!intestazione || !segreto) return false;

  let timestamp = "";
  const firme: string[] = [];
  for (const parte of intestazione.split(",")) {
    const [k, v] = parte.split("=");
    if (k?.trim() === "t") timestamp = (v ?? "").trim();
    if (k?.trim() === "v1") firme.push((v ?? "").trim());
  }
  if (!timestamp || firme.length === 0) return false;

  const eta = Math.abs(Math.floor(Date.now() / 1000) - Number(timestamp));
  if (!Number.isFinite(eta) || eta > tolleranzaSecondi) return false;

  const chiave = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(segreto),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const attesa = esadecimale(
    await crypto.subtle.sign("HMAC", chiave, new TextEncoder().encode(`${timestamp}.${corpo}`)),
  );
  return firme.some((f) => ugualiCostante(f, attesa));
}
