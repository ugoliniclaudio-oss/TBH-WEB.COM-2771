import { and, eq, sql } from "drizzle-orm";
import { db } from "../database";
import * as schema from "../database/schema";
import { firmaWebhookValida, segretoWebhook } from "../lib/stripe";
import { registraEvento } from "../lib/adv";
import { eventoCatalogo } from "../data/stripe-catalogo";
import { gestisciEventoCatalogo } from "./stripe-sync";
import { ACCOUNT_PRINCIPALE } from "./stripe-account";
import { ordineDaRiferimento } from "./ordini-touch-plaza";

/**
 * WEBHOOK STRIPE — l'unica voce che può dire «pagato».
 *
 * Regola della specifica del 15/09/2026: l'arrivo del browser sulla pagina di ritorno NON
 * è una conferma d'incasso. La pratica passa a PAGATO solo qui, dopo la verifica della
 * firma `Stripe-Signature` con STRIPE_WEBHOOK_SECRET.
 *
 * Da configurare su Stripe → Developers → Webhooks, indirizzo `/api/webhooks/stripe`,
 * eventi: checkout.session.completed, checkout.session.async_payment_succeeded,
 * checkout.session.expired, charge.refunded.
 */

type Sessione = {
  id: string;
  client_reference_id?: string | null;
  payment_status?: string;
  payment_intent?: string | null;
  amount_total?: number | null;
  customer_details?: { email?: string | null } | null;
  metadata?: Record<string, string> | null;
};

type EventoStripe = {
  id: string;
  type: string;
  data: { object: Sessione & Record<string, unknown> };
};

async function trovaPratica(sessione: Sessione) {
  const id = Number(sessione.client_reference_id ?? sessione.metadata?.pratica ?? 0);
  if (id > 0) {
    const [p] = await db
      .select()
      .from(schema.advPratiche)
      .where(eq(schema.advPratiche.id, id));
    if (p) return p;
  }
  const [perSessione] = await db
    .select()
    .from(schema.advPratiche)
    .where(eq(schema.advPratiche.stripeSessionId, sessione.id));
  return perSessione ?? null;
}

async function segnaPagata(sessione: Sessione) {
  const pratica = await trovaPratica(sessione);
  if (!pratica) return { esito: "pratica-non-trovata" };
  if (pratica.pagatoIl) return { esito: "gia-registrata", ordine: pratica.numeroOrdine };

  /** Dopo l'incasso la pratica entra subito nel suo binario di lavorazione. */
  const prossimo = pratica.materiali === "tbh" ? "istruttoria" : "materiali-da-ricevere";

  await db
    .update(schema.advPratiche)
    .set({
      stato: prossimo,
      pagatoIl: new Date(),
      stripePaymentIntent: sessione.payment_intent ?? null,
      stripeSessionId: sessione.id,
      cashbackStato: pratica.cashbackCents > 0 ? "in-maturazione" : pratica.cashbackStato,
      updatedAt: new Date(),
    })
    .where(eq(schema.advPratiche.id, pratica.id));

  await registraEvento(
    pratica.id,
    "pagato",
    `Incasso confermato da Stripe (${sessione.id}).`,
    "webhook",
  );
  await registraEvento(
    pratica.id,
    prossimo,
    prossimo === "istruttoria"
      ? "Creatività a carico di TBH: la pratica passa in istruttoria."
      : "In attesa dei materiali pubblicitari del cliente.",
    "webhook",
  );

  return { esito: "pagata", ordine: pratica.numeroOrdine, protocollo: pratica.protocollo };
}

async function segnaScaduta(sessione: Sessione) {
  const pratica = await trovaPratica(sessione);
  if (!pratica || pratica.pagatoIl) return { esito: "ignorata" };
  await db
    .update(schema.advPratiche)
    .set({ stato: "annullata", updatedAt: new Date() })
    .where(eq(schema.advPratiche.id, pratica.id));
  await registraEvento(pratica.id, "annullata", "Sessione di pagamento scaduta.", "webhook");
  return { esito: "annullata", ordine: pratica.numeroOrdine };
}

async function segnaRimborso(oggetto: Record<string, unknown>) {
  const intent = typeof oggetto.payment_intent === "string" ? oggetto.payment_intent : null;
  if (!intent) return { esito: "senza-payment-intent" };
  const [pratica] = await db
    .select()
    .from(schema.advPratiche)
    .where(sql`${schema.advPratiche.stripePaymentIntent} = ${intent}`);
  if (!pratica) return { esito: "pratica-non-trovata" };
  await db
    .update(schema.advPratiche)
    .set({ noteInterne: "Rimborso registrato su Stripe.", updatedAt: new Date() })
    .where(eq(schema.advPratiche.id, pratica.id));
  await registraEvento(pratica.id, pratica.stato, "Rimborso registrato su Stripe.", "webhook");
  return { esito: "rimborso-annotato", ordine: pratica.numeroOrdine };
}

/** Handler HTTP montato in `src/api/index.ts` su POST /api/webhooks/stripe. */
export async function webhookStripe(corpo: string, firma: string | null) {
  const segreto = segretoWebhook();
  if (!segreto) {
    return { stato: 503 as const, corpo: { errore: "STRIPE_WEBHOOK_SECRET non configurato." } };
  }
  if (!(await firmaWebhookValida(corpo, firma, segreto))) {
    return { stato: 400 as const, corpo: { errore: "Firma Stripe non valida." } };
  }

  let evento: EventoStripe;
  try {
    evento = JSON.parse(corpo) as EventoStripe;
  } catch {
    return { stato: 400 as const, corpo: { errore: "Corpo non leggibile." } };
  }

  const oggetto = evento.data?.object ?? ({} as Sessione & Record<string, unknown>);

  /* 03/10/2026 — eventi del catalogo (product.*, price.*, payment_link.*) dell'account
     principale: se sono attivati su questo stesso indirizzo, aggiornano il Touch Plaza. */
  if (eventoCatalogo(evento.type)) {
    try {
      const esito = await gestisciEventoCatalogo(ACCOUNT_PRINCIPALE, evento);
      return { stato: 200 as const, corpo: { ricevuto: true, ...esito } };
    } catch (err) {
      return { stato: 500 as const, corpo: { errore: (err as Error).message } };
    }
  }

  /* Ordini del Touch Plaza (riferimento `tp-ordine-N`): non sono pratiche ADV. */
  const ordineTp = ordineDaRiferimento(oggetto.client_reference_id);
  if (ordineTp !== null) {
    if (evento.type === "checkout.session.completed" || evento.type === "checkout.session.async_payment_succeeded") {
      if (oggetto.payment_status && oggetto.payment_status !== "paid") {
        return { stato: 200 as const, corpo: { ricevuto: true, esito: "non-ancora-pagata" } };
      }
      await db
        .update(schema.orders)
        .set({
          status: "paid",
          stripeSessionId: oggetto.id,
          customerEmail: oggetto.customer_details?.email ?? null,
        })
        .where(eq(schema.orders.id, ordineTp));
      return { stato: 200 as const, corpo: { ricevuto: true, esito: "ordine-pagato", ordine: ordineTp } };
    }
    if (evento.type === "checkout.session.expired") {
      await db
        .update(schema.orders)
        .set({ status: "expired" })
        .where(and(eq(schema.orders.id, ordineTp), eq(schema.orders.status, "pending")));
      return { stato: 200 as const, corpo: { ricevuto: true, esito: "ordine-scaduto", ordine: ordineTp } };
    }
  }

  switch (evento.type) {
    case "checkout.session.completed":
    case "checkout.session.async_payment_succeeded": {
      if (oggetto.payment_status && oggetto.payment_status !== "paid") {
        return { stato: 200 as const, corpo: { ricevuto: true, esito: "non-ancora-pagata" } };
      }
      return { stato: 200 as const, corpo: { ricevuto: true, ...(await segnaPagata(oggetto)) } };
    }
    case "checkout.session.expired":
      return { stato: 200 as const, corpo: { ricevuto: true, ...(await segnaScaduta(oggetto)) } };
    case "charge.refunded":
      return { stato: 200 as const, corpo: { ricevuto: true, ...(await segnaRimborso(oggetto)) } };
    default:
      return { stato: 200 as const, corpo: { ricevuto: true, esito: "evento-non-gestito" } };
  }
}
