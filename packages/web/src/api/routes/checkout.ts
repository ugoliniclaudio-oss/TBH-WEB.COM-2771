import { z } from "zod";
import { eq } from "drizzle-orm";
import { ORPCError } from "@orpc/server";
import { base } from "../__core/app";
import { db } from "../database";
import * as schema from "../database/schema";
import { articoloTouchPlaza } from "../lib/catalogo-touch-plaza";
import { prezzoPubblicoCents } from "../data/prezzi-tbh";
import { linkConOrdine, riferimentoOrdine } from "../lib/ordini-touch-plaza";
import {
  euro,
  numeroWhatsApp,
  prezziProdotto,
  normalizzaStatoProdotto,
  prodottoPubblico,
  QUANTITA_MAX,
  type VarianteProdotto,
} from "../data/prodotti-tbh";

const STRIPE_API = "https://api.stripe.com/v1/checkout/sessions";

/** Etichetta leggibile della variante scelta: "Nero · Taglia M". */
function nomeVariante(v: VarianteProdotto | null): string | null {
  if (!v) return null;
  const pezzi = [v.colore, v.taglia ? `Taglia ${v.taglia}` : null].filter(Boolean);
  return pezzi.length ? pezzi.join(" · ") : null;
}

/**
 * Crea una Stripe Checkout Session reale.
 * Se STRIPE_SECRET_KEY non è configurata, l'errore è esplicito: la UI mostra il fallback WhatsApp.
 */
export const checkout = {
  status: base.handler(() => ({
    configured: Boolean(process.env.STRIPE_SECRET_KEY),
    mode: process.env.STRIPE_SECRET_KEY?.startsWith("sk_live") ? "live" : "test",
  })),

  create: base
    .input(
      z.object({
        slug: z.string(),
        quantity: z.number().int().min(1).max(20).default(1),
        origin: z.string().url(),
      }),
    )
    .handler(async ({ input }) => {
      const product = await articoloTouchPlaza(input.slug);
      if (!product) throw new ORPCError("NOT_FOUND", { message: "Prodotto non trovato" });
      // Un articolo collegato a Stripe paga SOLO col suo Price (stripeSync.acquista).
      if (product.stripe)
        throw new ORPCError("BAD_REQUEST", {
          message: "Questo articolo si paga col suo pagamento Stripe: usa il pulsante «Acquista» della scheda.",
        });

      const key = process.env.STRIPE_SECRET_KEY;
      if (!key) {
        throw new ORPCError("SERVICE_UNAVAILABLE", {
          message:
            "Stripe non è ancora configurato: manca STRIPE_SECRET_KEY. Ordina via WhatsApp oppure inserisci la chiave Stripe.",
        });
      }

      const [order] = await db
        .insert(schema.orders)
        .values({
          productSlug: product.slug,
          productTitle: product.title,
          amountCents: prezzoPubblicoCents(product) * input.quantity,
          quantity: input.quantity,
          status: "pending",
        })
        .returning();

      const body = new URLSearchParams();
      body.set("mode", "payment");
      body.set("success_url", `${input.origin}/shop?pagamento=ok&ordine=${order.id}`);
      body.set("cancel_url", `${input.origin}/shop?pagamento=annullato`);
      body.set("client_reference_id", riferimentoOrdine(order.id));
      body.set("line_items[0][quantity]", String(input.quantity));
      body.set("line_items[0][price_data][currency]", "eur");
      body.set("line_items[0][price_data][unit_amount]", String(prezzoPubblicoCents(product)));
      body.set("line_items[0][price_data][product_data][name]", product.title);
      body.set("line_items[0][price_data][product_data][description]", product.blurb.slice(0, 250));

      const res = await fetch(STRIPE_API, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${key}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body,
      });

      const json = (await res.json()) as { id?: string; url?: string; error?: { message?: string } };
      if (!res.ok || !json.url) {
        throw new ORPCError("BAD_GATEWAY", {
          message: json.error?.message ?? "Stripe ha rifiutato la richiesta di pagamento.",
        });
      }

      await db
        .update(schema.orders)
        .set({ stripeSessionId: json.id })
        .where(eq(schema.orders.id, order.id));

      return { url: json.url };
    }),

  /**
   * ACQUISTO DI UNA SCHEDA DEL PANNELLO (specifica 16/09/2026, punto 5A).
   *
   * Stripe si prende PER PRODOTTO O PER VARIANTE, nell'ordine:
   *   1) Payment Link della variante, 2) Payment Link del prodotto,
   *   3) Price ID della variante, 4) Price ID del prodotto,
   *   5) prezzo scritto nella scheda (sessione creata al volo).
   * Se non c'è nessuna delle cinque cose, l'errore lo dice: si ordina su WhatsApp.
   */
  creaProdotto: base
    .input(
      z.object({
        prodottoId: z.number().int().positive(),
        varianteId: z.number().int().positive().nullish(),
        quantita: z.number().int().min(1).max(QUANTITA_MAX).default(1),
        personalizzazione: z.string().trim().max(200).nullish(),
        origin: z.string().url(),
      }),
    )
    .handler(async ({ input }) => {
      const riga = (
        await db.select().from(schema.prodotti).where(eq(schema.prodotti.id, input.prodottoId))
      )[0];
      if (!riga) throw new ORPCError("NOT_FOUND", { message: "Scheda non trovata." });
      if (!prodottoPubblico(normalizzaStatoProdotto(riga.stato)))
        throw new ORPCError("FORBIDDEN", { message: "Questa scheda non è in vendita." });

      const varianti = await db
        .select()
        .from(schema.prodottoVarianti)
        .where(eq(schema.prodottoVarianti.prodottoId, riga.id));
      const variante = input.varianteId
        ? (varianti.find((v) => v.id === input.varianteId) ?? null)
        : null;
      if (input.varianteId && !variante)
        throw new ORPCError("NOT_FOUND", { message: "Variante non trovata." });

      const v = variante as VarianteProdotto | null;
      const prezzi = prezziProdotto(riga, v);
      const quantita = Math.min(
        Math.max(input.quantita, riga.quantitaMin || 1),
        riga.quantitaMax || QUANTITA_MAX,
      );
      const etichetta = nomeVariante(v);
      const codice = v?.codice ?? riga.codice ?? null;

      const paymentLink = v?.stripeLink ?? riga.stripeLink ?? null;
      const priceId = v?.stripePriceId ?? riga.stripePriceId ?? null;
      const key = process.env.STRIPE_SECRET_KEY;

      if (!paymentLink && !priceId && prezzi.attivo === null) {
        throw new ORPCError("SERVICE_UNAVAILABLE", {
          message:
            "Per questa scheda il pagamento con carta non è ancora attivo: ordina su WhatsApp.",
        });
      }
      if (!paymentLink && !key) {
        throw new ORPCError("SERVICE_UNAVAILABLE", {
          message:
            "Stripe non è ancora configurato: manca STRIPE_SECRET_KEY. Ordina su WhatsApp oppure inserisci la chiave Stripe.",
        });
      }

      // L'ordine si scrive SEMPRE prima: così il numero esiste anche se il cliente
      // abbandona il pagamento, e il pannello lo vede.
      const [ordine] = await db
        .insert(schema.orders)
        .values({
          productSlug: riga.slug,
          productTitle: riga.nome,
          amountCents: (prezzi.attivo ?? 0) * quantita,
          quantity: quantita,
          status: "pending",
          codice,
          variante: etichetta,
          personalizzazione: input.personalizzazione?.trim() || null,
          prodottoId: riga.id,
        })
        .returning();

      // 1-2) Payment Link già pronto: si apre quello, col numero d'ordine attaccato.
      if (paymentLink) {
        return {
          url: linkConOrdine(paymentLink, ordine!.id),
          ordineId: ordine!.id,
          via: "payment_link" as const,
        };
      }

      const body = new URLSearchParams();
      body.set("mode", "payment");
      body.set("success_url", `${input.origin}/ordine-confermato?ordine=${ordine!.id}`);
      body.set("cancel_url", `${input.origin}/gadget/${riga.slug}?pagamento=annullato`);
      body.set("client_reference_id", riferimentoOrdine(ordine!.id));
      body.set("line_items[0][quantity]", String(quantita));
      if (priceId) {
        // 3-4) Price ID della variante o del prodotto.
        body.set("line_items[0][price]", priceId);
      } else {
        // 5) Prezzo scritto nella scheda.
        const nome = etichetta ? `${riga.nome} — ${etichetta}` : riga.nome;
        body.set("line_items[0][price_data][currency]", "eur");
        body.set("line_items[0][price_data][unit_amount]", String(prezzi.attivo));
        body.set("line_items[0][price_data][product_data][name]", nome);
        if (riga.descrizione)
          body.set(
            "line_items[0][price_data][product_data][description]",
            riga.descrizione.slice(0, 250),
          );
      }
      if (input.personalizzazione?.trim())
        body.set("metadata[personalizzazione]", input.personalizzazione.trim().slice(0, 200));
      if (codice) body.set("metadata[codice]", codice);

      const res = await fetch(STRIPE_API, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${key}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body,
      });
      const json = (await res.json()) as { id?: string; url?: string; error?: { message?: string } };
      if (!res.ok || !json.url) {
        throw new ORPCError("BAD_GATEWAY", {
          message: json.error?.message ?? "Stripe ha rifiutato la richiesta di pagamento.",
        });
      }
      await db
        .update(schema.orders)
        .set({ stripeSessionId: json.id })
        .where(eq(schema.orders.id, ordine!.id));

      return {
        url: json.url,
        ordineId: ordine!.id,
        via: priceId ? ("price_id" as const) : ("prezzo_scheda" as const),
      };
    }),

  /** Un ordine per la pagina di conferma: numero, prodotto, totale e numero WhatsApp. */
  ordine: base
    .input(z.object({ id: z.number().int().positive() }))
    .handler(async ({ input }) => {
      const riga = (
        await db.select().from(schema.orders).where(eq(schema.orders.id, input.id))
      )[0];
      if (!riga) return { ordine: null, whatsapp: numeroWhatsApp(null) };
      const prodotto = riga.prodottoId
        ? ((
            await db.select().from(schema.prodotti).where(eq(schema.prodotti.id, riga.prodottoId))
          )[0] ?? null)
        : null;
      return {
        ordine: {
          id: riga.id,
          prodotto: riga.productTitle,
          slug: riga.productSlug,
          codice: riga.codice,
          variante: riga.variante,
          personalizzazione: riga.personalizzazione,
          quantita: riga.quantity,
          totale: riga.amountCents ? euro(riga.amountCents) : null,
          stato: riga.status,
          creato: riga.createdAt,
        },
        whatsapp: numeroWhatsApp(prodotto?.whatsappNumero ?? null),
      };
    }),
};

