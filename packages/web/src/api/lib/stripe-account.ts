import { eq } from "drizzle-orm";
import { db } from "../database";
import * as schema from "../database/schema";
import { stripeGetCon, ErroreStripe } from "./stripe";

/**
 * ACCOUNT STRIPE AUTORIZZATI DEL TOUCH PLAZA.
 *
 *  · «principale» = STRIPE_SECRET_KEY + STRIPE_WEBHOOK_SECRET del file .env del server.
 *  · altri account = collegati dal pannello /allestimento/stripe: chiave e segreto webhook
 *    restano in archivio sul server e non vengono MAI rimandati al browser (si vede solo
 *    la parte finale della chiave, per riconoscerla).
 */

export const ACCOUNT_PRINCIPALE = "principale";

export type AccountStripe = {
  nome: string;
  origine: "env" | "pannello";
  chiave: string;
  segretoWebhook: string | null;
};

function principaleDaEnv(): AccountStripe | null {
  const chiave = (process.env.STRIPE_SECRET_KEY ?? "").trim();
  if (!chiave) return null;
  return {
    nome: ACCOUNT_PRINCIPALE,
    origine: "env",
    chiave,
    segretoWebhook: (process.env.STRIPE_WEBHOOK_SECRET ?? "").trim() || null,
  };
}

/** Tutti gli account con una chiave utilizzabile. */
export async function accountConfigurati(): Promise<AccountStripe[]> {
  const out: AccountStripe[] = [];
  const env = principaleDaEnv();
  if (env) out.push(env);
  const righe = await db.select().from(schema.stripeAccount);
  for (const r of righe) {
    if (r.origine !== "pannello" || !r.chiave) continue;
    if (env && r.nome === ACCOUNT_PRINCIPALE) continue;
    out.push({ nome: r.nome, origine: "pannello", chiave: r.chiave, segretoWebhook: r.segretoWebhook });
  }
  return out;
}

export async function trovaAccount(nome: string) {
  return (await accountConfigurati()).find((a) => a.nome === nome) ?? null;
}

/** Parte finale della chiave, per riconoscerla senza mostrarla. */
export function chiaveMascherata(chiave: string | null) {
  if (!chiave) return null;
  const prefisso = chiave.startsWith("sk_live") ? "sk_live" : chiave.startsWith("rk_") ? "rk" : "sk_test";
  return `${prefisso}_••••${chiave.slice(-4)}`;
}

export function modalitaChiave(chiave: string) {
  return chiave.includes("_live_") ? "live" : "test";
}

/** Garantisce la riga di stato dell'account (serve anche al «principale» da .env). */
export async function rigaStato(nome: string, origine: "env" | "pannello") {
  const [r] = await db.select().from(schema.stripeAccount).where(eq(schema.stripeAccount.nome, nome));
  if (r) return r;
  await db.insert(schema.stripeAccount).values({ nome, origine }).onConflictDoNothing();
  const [nuova] = await db.select().from(schema.stripeAccount).where(eq(schema.stripeAccount.nome, nome));
  return nuova;
}

/** Controlla davvero la chiave su Stripe prima di salvarla. */
export async function verificaChiave(chiave: string) {
  if (!/^(sk|rk)_(test|live)_[A-Za-z0-9]{10,}$/.test(chiave)) {
    throw new ErroreStripe("La chiave deve iniziare con sk_live_, sk_test_, rk_live_ o rk_test_.");
  }
  try {
    const acc = await stripeGetCon<{
      id: string;
      business_profile?: { name?: string | null } | null;
      settings?: { dashboard?: { display_name?: string | null } } | null;
    }>(chiave, "/account");
    return {
      nomeStripe: acc.settings?.dashboard?.display_name ?? acc.business_profile?.name ?? acc.id,
    };
  } catch {
    // Le chiavi «restricted» possono non leggere /account: basta che leggano i prodotti.
    await stripeGetCon(chiave, "/products?limit=1");
    return { nomeStripe: null };
  }
}
