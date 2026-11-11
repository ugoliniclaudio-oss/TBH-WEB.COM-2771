import { z } from "zod";
import { eq } from "drizzle-orm";
import { ORPCError } from "@orpc/server";
import { base } from "../__core/app";
import { db } from "../database";
import * as schema from "../database/schema";
import { PRODUCTS } from "../data/catalog";
import { EVENTI_CATALOGO } from "../data/stripe-catalogo";
import { ErroreStripe, stripePostCon } from "../lib/stripe";
import {
  ACCOUNT_PRINCIPALE,
  accountConfigurati,
  chiaveMascherata,
  modalitaChiave,
  trovaAccount,
  verificaChiave,
} from "../lib/stripe-account";
import { sincronizzaProdotto, sincronizzaTutti } from "../lib/stripe-sync";
import { articoloTouchPlaza, catalogoCompleto, dimenticaCatalogo } from "../lib/catalogo-touch-plaza";
import { linkConOrdine, riferimentoOrdine } from "../lib/ordini-touch-plaza";

/**
 * SINCRONIZZAZIONE STRIPE → TOUCH PLAZA — servizio del pannello /allestimento/stripe
 * e acquisto delle schede collegate a Stripe (03/10/2026).
 */

const CODICE = () => (process.env.TBH_CODICE_ALLESTIMENTO ?? "").trim();

function controlla(codice: string) {
  const atteso = CODICE();
  if (!atteso) {
    throw new ORPCError("SERVICE_UNAVAILABLE", {
      message: "Codice di allestimento non configurato sul server (TBH_CODICE_ALLESTIMENTO).",
    });
  }
  if (codice.trim() !== atteso) {
    throw new ORPCError("UNAUTHORIZED", { message: "Codice di allestimento errato." });
  }
}

const auth = z.object({ codice: z.string().min(1).max(120) });
const nomeAccount = z
  .string()
  .trim()
  .toLowerCase()
  .regex(/^[a-z0-9][a-z0-9-]{1,39}$/, "Nome account: lettere minuscole, numeri e trattini (2-40).");

function erroreStripe(e: unknown): never {
  if (e instanceof ORPCError) throw e;
  throw new ORPCError("BAD_GATEWAY", {
    message: e instanceof ErroreStripe ? `Stripe: ${e.message}` : (e as Error).message,
  });
}

async function statoPannello() {
  const [account, righeAccount, { tutti, righe }] = await Promise.all([
    accountConfigurati(),
    db.select().from(schema.stripeAccount),
    catalogoCompleto(),
  ]);

  const elencoAccount = [
    ...account.map((a) => {
      const s = righeAccount.find((r) => r.nome === a.nome);
      return {
        nome: a.nome,
        origine: a.origine,
        chiave: chiaveMascherata(a.chiave),
        modalita: modalitaChiave(a.chiave),
        webhookConfigurato: !!a.segretoWebhook,
        nomeStripe: s?.nomeStripe ?? null,
        ultimaSync: s?.ultimaSync?.toISOString() ?? null,
        ultimoErrore: s?.ultimoErrore ?? null,
        percorsoWebhook: `/api/webhooks/stripe-catalogo/${a.nome}`,
      };
    }),
  ];

  const prodotti = righe.map((r) => {
    const art = tutti.find((p) => p.slug === (r.slugSito ?? r.slug));
    return {
      id: r.id,
      account: r.account,
      stripeProductId: r.stripeProductId,
      nomeStripe: r.nome,
      slug: art?.slug ?? r.slug,
      slugSito: r.slugSito,
      origine: r.slugSito ? "Scheda del sito + Stripe" : "Stripe",
      categoria: r.categoria,
      testoEditoriale: r.testoEditoriale,
      immaginiExtra: (() => {
        try {
          return JSON.parse(r.immaginiExtra ?? "[]") as string[];
        } catch {
          return [];
        }
      })(),
      condizioni: r.condizioni,
      ivaPercentuale: r.ivaPercentuale,
      ivaInclusa: r.ivaInclusa === null ? null : r.ivaInclusa === 1,
      attivo: r.attivo === 1,
      livemode: r.livemode === 1,
      ultimaSync: r.ultimaSync?.toISOString() ?? null,
      errore: r.errore,
      stato: art?.stripe?.stato ?? (r.attivo === 1 ? "in-allestimento" : "archiviato"),
      mancanti: art?.stripe?.mancanti ?? [],
      varianti: art?.stripe?.varianti ?? [],
      immagine: art?.image ?? null,
      prezzoSitoCents: r.slugSito ? (PRODUCTS.find((p) => p.slug === r.slugSito)?.priceCents ?? null) : null,
    };
  });

  // Schede inserite a mano con un link Stripe ma non ancora agganciate a un Product.
  const agganciate = new Set(righe.map((r) => r.slugSito).filter(Boolean));
  const manuali = PRODUCTS.filter((p) => p.checkout?.stripe).map((p) => ({
    slug: p.slug,
    titolo: p.title,
    priceCents: p.priceCents,
    paymentLink: p.checkout!.stripe!,
    associata: agganciate.has(p.slug),
  }));

  const eventi = await db.select().from(schema.stripeEventi);
  const ultimiEventi = eventi
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 15)
    .map((e) => ({ id: e.eventId, account: e.account, tipo: e.tipo, esito: e.esito, quando: e.createdAt.toISOString() }));

  return {
    account: elencoAccount,
    principaleDaEnv: account.some((a) => a.nome === ACCOUNT_PRINCIPALE && a.origine === "env"),
    eventiDaAttivare: [...EVENTI_CATALOGO],
    prodotti,
    manuali,
    schedeSito: PRODUCTS.map((p) => ({ slug: p.slug, titolo: p.title })),
    ultimiEventi,
  };
}

export const stripeSync = {
  /** Pannello: account, prodotti sincronizzati, schede manuali con link, ultimi eventi. */
  stato: base.input(auth).handler(async ({ input }) => {
    controlla(input.codice);
    return statoPannello();
  }),

  /** Collega un account Stripe dal pannello: la chiave viene verificata su Stripe e resta sul server. */
  collegaAccount: base
    .input(
      auth.extend({
        nome: nomeAccount,
        chiave: z.string().trim().min(20).max(300),
        segretoWebhook: z.string().trim().max(300).nullish(),
      }),
    )
    .handler(async ({ input }) => {
      controlla(input.codice);
      if (input.nome === ACCOUNT_PRINCIPALE && (process.env.STRIPE_SECRET_KEY ?? "").trim())
        throw new ORPCError("CONFLICT", { message: "«principale» è già l'account del server (.env)." });
      if (input.segretoWebhook && !input.segretoWebhook.startsWith("whsec_"))
        throw new ORPCError("BAD_REQUEST", { message: "Il segreto webhook inizia con whsec_." });
      let verifica: { nomeStripe: string | null };
      try {
        verifica = await verificaChiave(input.chiave);
      } catch (e) {
        erroreStripe(e);
      }
      const valori = {
        origine: "pannello",
        chiave: input.chiave,
        segretoWebhook: input.segretoWebhook || null,
        nomeStripe: verifica.nomeStripe,
        livemode: modalitaChiave(input.chiave) === "live" ? 1 : 0,
        ultimoErrore: null,
      };
      await db
        .insert(schema.stripeAccount)
        .values({ nome: input.nome, ...valori })
        .onConflictDoUpdate({ target: schema.stripeAccount.nome, set: valori });
      dimenticaCatalogo();
      const [risultato] = await sincronizzaTutti(input.nome);
      return { ok: true, sync: risultato ?? null };
    }),

  /** Scollega un account del pannello. Le sue schede escono dalla vendita (restano in archivio). */
  scollegaAccount: base.input(auth.extend({ nome: nomeAccount })).handler(async ({ input }) => {
    controlla(input.codice);
    const [r] = await db.select().from(schema.stripeAccount).where(eq(schema.stripeAccount.nome, input.nome));
    if (!r || r.origine !== "pannello")
      throw new ORPCError("BAD_REQUEST", { message: "Si scollegano solo gli account aggiunti dal pannello." });
    await db.delete(schema.stripeAccount).where(eq(schema.stripeAccount.nome, input.nome));
    await db.update(schema.stripeProdotti).set({ attivo: 0 }).where(eq(schema.stripeProdotti.account, input.nome));
    dimenticaCatalogo();
    return { ok: true };
  }),

  /** «Sincronizza ora»: tutti gli account, o uno solo. */
  sincronizzaOra: base
    .input(auth.extend({ account: nomeAccount.nullish() }))
    .handler(async ({ input }) => {
      controlla(input.codice);
      const account = await accountConfigurati();
      if (!account.length)
        throw new ORPCError("PRECONDITION_FAILED", {
          message: "Nessun account Stripe collegato: serve STRIPE_SECRET_KEY o un account dal pannello.",
        });
      const risultati = await sincronizzaTutti(input.account ?? undefined);
      dimenticaCatalogo();
      return { risultati };
    }),

  /**
   * Associa una scheda del sito a un Product Stripe per ID (evita i doppioni), oppure
   * toglie l'associazione (slugSito null). Il Product viene riletto subito da Stripe.
   */
  associa: base
    .input(
      auth.extend({
        account: nomeAccount,
        stripeProductId: z.string().trim().regex(/^prod_[A-Za-z0-9]+$/, "ID Product: prod_…"),
        slugSito: z.string().trim().max(120).nullable(),
      }),
    )
    .handler(async ({ input }) => {
      controlla(input.codice);
      const acc = await trovaAccount(input.account);
      if (!acc) throw new ORPCError("NOT_FOUND", { message: "Account Stripe non collegato." });
      if (input.slugSito && !PRODUCTS.some((p) => p.slug === input.slugSito))
        throw new ORPCError("NOT_FOUND", { message: "Scheda del sito inesistente." });
      if (input.slugSito) {
        const [gia] = await db
          .select()
          .from(schema.stripeProdotti)
          .where(eq(schema.stripeProdotti.slugSito, input.slugSito));
        if (gia && gia.stripeProductId !== input.stripeProductId)
          throw new ORPCError("CONFLICT", {
            message: `La scheda è già associata al Product ${gia.stripeProductId} (${gia.account}).`,
          });
      }
      let esito;
      try {
        esito = await sincronizzaProdotto(acc, input.stripeProductId);
      } catch (e) {
        erroreStripe(e);
      }
      if (esito.esito === "ignorato")
        throw new ORPCError("BAD_REQUEST", { message: "Il Product è archiviato su Stripe: non si associa." });
      await db
        .update(schema.stripeProdotti)
        .set({ slugSito: input.slugSito })
        .where(eq(schema.stripeProdotti.stripeProductId, input.stripeProductId));
      dimenticaCatalogo();
      return { ok: true };
    }),

  /** Campi editoriali del sito: la sync non li tocca. */
  salvaEditoriale: base
    .input(
      auth.extend({
        id: z.number().int().positive(),
        categoria: z.string().trim().max(60).nullish(),
        testoEditoriale: z.string().trim().max(4000).nullish(),
        immaginiExtra: z.array(z.string().trim().url().max(500)).max(12).default([]),
        condizioni: z.string().trim().max(2000).nullish(),
        ivaPercentuale: z.number().int().min(0).max(30).nullish(),
        ivaInclusa: z.boolean().nullish(),
      }),
    )
    .handler(async ({ input }) => {
      controlla(input.codice);
      await db
        .update(schema.stripeProdotti)
        .set({
          categoria: input.categoria || null,
          testoEditoriale: input.testoEditoriale || null,
          immaginiExtra: JSON.stringify(input.immaginiExtra),
          condizioni: input.condizioni || null,
          ivaPercentuale: input.ivaPercentuale ?? null,
          ivaInclusa: input.ivaPercentuale == null || input.ivaInclusa == null ? null : input.ivaInclusa ? 1 : 0,
        })
        .where(eq(schema.stripeProdotti.id, input.id));
      dimenticaCatalogo();
      return { ok: true };
    }),

  /**
   * ACQUISTA — una variante, un pagamento: il Payment Link di QUEL prezzo, altrimenti una
   * Checkout Session creata dal server su quel Price. L'ordine viene registrato prima.
   */
  acquista: base
    .input(z.object({ slug: z.string().max(120), priceId: z.string().max(80), origin: z.string().url() }))
    .handler(async ({ input }) => {
      const p = await articoloTouchPlaza(input.slug);
      if (!p?.stripe) throw new ORPCError("NOT_FOUND", { message: "Articolo non collegato a Stripe." });
      if (p.stripe.stato !== "pubblicato")
        throw new ORPCError("FORBIDDEN", { message: "Articolo in allestimento: l'acquisto non è ancora attivo." });
      const v = p.stripe.varianti.find((x) => x.priceId === input.priceId);
      if (!v || v.importoCents === null)
        throw new ORPCError("BAD_REQUEST", { message: "Variante non disponibile: scegli un prezzo dell'elenco." });

      const [ordine] = await db
        .insert(schema.orders)
        .values({
          productSlug: p.slug,
          productTitle: p.title,
          amountCents: v.importoCents,
          quantity: 1,
          status: "pending",
          codice: v.priceId,
          variante: v.nome,
        })
        .returning();

      if (v.paymentLink) return { url: linkConOrdine(v.paymentLink, ordine.id), tipo: "payment-link" as const };

      const acc = await trovaAccount(p.stripe.account);
      if (!acc) throw new ORPCError("SERVICE_UNAVAILABLE", { message: "Account Stripe dell'articolo non disponibile." });
      try {
        const sessione = await stripePostCon<{ id: string; url: string }>(
          acc.chiave,
          "/checkout/sessions",
          {
            mode: v.tipo === "ricorrente" ? "subscription" : "payment",
            line_items: [{ price: v.priceId, quantity: 1 }],
            client_reference_id: riferimentoOrdine(ordine.id),
            success_url: `${input.origin}/shop/p/${p.slug}?pagamento=ok&ordine=${ordine.id}`,
            cancel_url: `${input.origin}/shop/p/${p.slug}?pagamento=annullato`,
            metadata: { origine: "touch-plaza", ordine: String(ordine.id), slug: p.slug, account: acc.nome },
          },
          `tp-ordine-${ordine.id}`,
        );
        await db.update(schema.orders).set({ stripeSessionId: sessione.id }).where(eq(schema.orders.id, ordine.id));
        return { url: sessione.url, tipo: "checkout-session" as const };
      } catch (e) {
        await db.update(schema.orders).set({ status: "errore" }).where(eq(schema.orders.id, ordine.id));
        erroreStripe(e);
      }
    }),
};
