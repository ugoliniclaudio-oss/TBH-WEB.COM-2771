import { z } from "zod";
import { desc, eq, sql } from "drizzle-orm";
import { ORPCError } from "@orpc/server";
import { base } from "../__core/app";
import { db } from "../database";
import * as schema from "../database/schema";
import {
  ADV_IVA,
  ADV_SLIDE,
  ADV_VERIFICATO_IL,
  BENEFICI_FIDELITY,
  CASHBACK_ADV,
  DURATE_ADV,
  DURATE_CAMPAGNA_ADV,
  DURATE_NOTA,
  GARANZIE_ADV,
  POSIZIONI_ADV,
  PUBBLICO_ADV,
  TERRITORI_ADV,
  scomponi,
} from "../data/adv-tv";
import {
  addonAdv,
  assicuraPrezzoAddonStripe,
  assicuraPrezzoStripe,
  calcolaPreventivo,
  listinoAdv,
  numeriPratica,
  pacchettoAdv,
  registraEvento,
  verificaFidelity,
} from "../lib/adv";
import { ErroreStripe, modalitaStripe, segretoWebhook, stripeConfigurato, stripePost } from "../lib/stripe";

/**
 * TBH TV & STREAMING ADV — vetrina, configuratore e acquisto.
 *
 * Non si accetta MAI un prezzo dal browser: il client manda solo il pacchetto scelto, i
 * servizi extra, la configurazione della campagna e i dati per la verifica Fidelity.
 * Fascia, importi, IVA e cashback li calcola il server (`api/lib/adv.ts`).
 */

const WA = "https://wa.me/393792088524";

const datiFidelity = z.object({
  /** Il cliente dice di essere fidelizzato: è solo una richiesta di verifica, non una prova. */
  dichiarato: z.boolean().default(false),
  email: z.string().trim().max(160).optional(),
  codiceFiscale: z.string().trim().max(32).optional(),
  codiceTbh: z.string().trim().max(32).optional(),
});

const datiCliente = z.object({
  nome: z.string().trim().min(2).max(160),
  email: z.string().trim().email().max(160),
  telefono: z.string().trim().max(40).optional(),
  riferimentoFiscale: z.string().trim().max(32).optional(),
});

const datiCampagna = z.object({
  territorio: z.string().trim().max(120),
  pubblico: z.string().trim().max(120),
  durataCampagna: z.string().trim().max(60),
  dataInizio: z.string().trim().max(20).optional(),
  citta: z.string().trim().max(200).optional(),
  eta: z.string().trim().max(60).optional(),
  genere: z.string().trim().max(60).optional(),
  interessi: z.string().trim().max(300).optional(),
  note: z.string().trim().max(1200).optional(),
});

const datiContenuto = z.object({
  materiali: z.enum(["cliente", "tbh"]),
  durataSpot: z.number().int().min(30).max(180).optional(),
});

function fasceVisibili(p: Awaited<ReturnType<typeof listinoAdv>>[number]) {
  return {
    pieno: scomponi(p.pienoCents, p.ivaAliquota),
    promo: p.promoCents ? scomponi(p.promoCents, p.ivaAliquota) : null,
    fidelity: p.fidelityCents ? scomponi(p.fidelityCents, p.ivaAliquota) : null,
  };
}

export const adv = {
  /** Stato del modulo: serve alla pagina per sapere se il checkout è davvero acceso. */
  stato: base.handler(() => ({
    stripeConfigurato: stripeConfigurato(),
    modalita: modalitaStripe(),
    webhookConfigurato: Boolean(segretoWebhook()),
    ivaAliquota: ADV_IVA,
    verificatoIl: ADV_VERIFICATO_IL,
    slide: ADV_SLIDE,
    whatsapp: WA,
  })),

  /** Listino completo: quattro pacchetti, tre fasce, servizi extra e contenuti della slide. */
  listino: base.handler(async () => {
    const pacchetti = await listinoAdv();
    return {
      verificatoIl: ADV_VERIFICATO_IL,
      slide: ADV_SLIDE,
      ivaAliquota: ADV_IVA,
      pacchetti: pacchetti.map((p) => ({
        sku: p.sku,
        slug: p.slug,
        titolo: p.titolo,
        claim: p.claim,
        colore: p.colore,
        descrizione: p.descrizione,
        incluso: p.incluso,
        cta: p.cta,
        chiedeDurata: p.chiedeDurata,
        piattaforme: p.piattaforme,
        scontoPromo: p.scontoPromo,
        scontoFidelity: p.scontoFidelity,
        disponibile: p.disponibile,
        promoAttiva: p.promoAttiva,
        promoDal: p.promoDal,
        promoAl: p.promoAl,
        cashbackPercento: p.cashbackPercento,
        prezzi: fasceVisibili(p),
        /** Il prezzo Fidelity è di listino, ma si applica solo dopo verifica sul server. */
        fidelityRichiedeVerifica: true,
      })),
      addon: await addonAdv(true),
      posizioni: POSIZIONI_ADV,
      durate: DURATE_ADV,
      durateNota: DURATE_NOTA,
      garanzie: GARANZIE_ADV,
      cashback: CASHBACK_ADV,
      beneficiFidelity: BENEFICI_FIDELITY,
      territori: TERRITORI_ADV,
      pubblico: PUBBLICO_ADV,
      durateCampagna: DURATE_CAMPAGNA_ADV,
    };
  }),

  /**
   * STEP 5 del configuratore: verifica della posizione Fidelity.
   * Il risultato arriva dal registro `adv_fidelity`, non dalla dichiarazione del cliente.
   */
  verificaFidelity: base
    .input(
      z.object({
        email: z.string().trim().max(160).optional(),
        codiceFiscale: z.string().trim().max(32).optional(),
        codiceTbh: z.string().trim().max(32).optional(),
      }),
    )
    .handler(async ({ input }) => {
      const esito = await verificaFidelity(input);
      return {
        fidelizzato: esito.fidelizzato,
        intestatario: esito.intestatario,
        livello: esito.livello,
        cashback: esito.cashback,
        messaggio: esito.messaggio,
      };
    }),

  /** STEP 6: riepilogo con la fascia decisa dal server, IVA scomposta e cashback eleggibile. */
  preventivo: base
    .input(
      z.object({
        slug: z.string().trim().max(60),
        addon: z.array(z.string().trim().max(20)).max(12).default([]),
        fidelity: datiFidelity.default({ dichiarato: false }),
      }),
    )
    .handler(async ({ input }) => {
      const pacchetto = await pacchettoAdv(input.slug);
      if (!pacchetto) throw new ORPCError("NOT_FOUND", { message: "Pacchetto non trovato." });

      const esito = input.fidelity.dichiarato
        ? await verificaFidelity(input.fidelity)
        : {
            fidelizzato: false,
            id: null,
            intestatario: null,
            livello: null,
            cashback: false,
            riferimento: null,
            messaggio: "Verifica Fidelity non richiesta: si applica il prezzo pieno o promozionale.",
          };

      const preventivo = await calcolaPreventivo({
        pacchetto,
        addonCodici: input.addon,
        fidelity: esito,
      });

      return {
        ...preventivo,
        fidelity: {
          fidelizzato: esito.fidelizzato,
          intestatario: esito.intestatario,
          livello: esito.livello,
          messaggio: esito.messaggio,
        },
        beneficiFidelity: BENEFICI_FIDELITY,
        cashbackNota: CASHBACK_ADV.nota,
      };
    }),

  /**
   * ACQUISTO: apre la pratica e crea la Stripe Checkout Session su Product/Price veri.
   * Lo stato «pagato» NON si scrive qui: lo scrive il webhook firmato di Stripe.
   */
  acquista: base
    .input(
      z.object({
        slug: z.string().trim().max(60),
        addon: z.array(z.string().trim().max(20)).max(12).default([]),
        cliente: datiCliente,
        campagna: datiCampagna,
        contenuto: datiContenuto,
        fidelity: datiFidelity.default({ dichiarato: false }),
        origin: z.string().url(),
      }),
    )
    .handler(async ({ input }) => {
      const pacchetto = await pacchettoAdv(input.slug);
      if (!pacchetto) throw new ORPCError("NOT_FOUND", { message: "Pacchetto non trovato." });
      if (!pacchetto.disponibile) {
        throw new ORPCError("CONFLICT", {
          message: `${pacchetto.titolo} è momentaneamente non disponibile. Scrivici su WhatsApp per la pianificazione.`,
        });
      }
      if (pacchetto.chiedeDurata && !input.contenuto.durataSpot) {
        throw new ORPCError("BAD_REQUEST", { message: "Scegli la durata dello spot." });
      }
      if (!stripeConfigurato()) {
        throw new ORPCError("SERVICE_UNAVAILABLE", {
          message:
            "Il pagamento con carta non è ancora attivo su questo portale: manca STRIPE_SECRET_KEY. La configurazione resta valida, completala con noi su WhatsApp.",
        });
      }

      const esito = input.fidelity.dichiarato
        ? await verificaFidelity({
            email: input.fidelity.email ?? input.cliente.email,
            codiceFiscale: input.fidelity.codiceFiscale ?? input.cliente.riferimentoFiscale,
            codiceTbh: input.fidelity.codiceTbh,
          })
        : {
            fidelizzato: false,
            id: null,
            intestatario: null,
            livello: null,
            cashback: false,
            riferimento: null,
            messaggio: "Verifica Fidelity non richiesta.",
          };

      const preventivo = await calcolaPreventivo({
        pacchetto,
        addonCodici: input.addon,
        fidelity: esito,
      });

      const numeri = await numeriPratica(pacchetto.slug);
      const [pratica] = await db
        .insert(schema.advPratiche)
        .values({
          numeroOrdine: numeri.numeroOrdine,
          protocollo: numeri.protocollo,
          pacchettoSlug: pacchetto.slug,
          pacchettoTitolo: pacchetto.titolo,
          sku: pacchetto.sku,
          fascia: preventivo.fascia,
          nettoCents: preventivo.nettoCents,
          ivaCents: preventivo.ivaCents,
          lordoCents: preventivo.lordoCents,
          ivaAliquota: preventivo.ivaAliquota,
          addonJson: JSON.stringify(preventivo.addon),
          configurazioneJson: JSON.stringify({
            campagna: input.campagna,
            contenuto: input.contenuto,
            fasciaMotivo: preventivo.motivo,
          }),
          materiali: input.contenuto.materiali,
          durataSpot: input.contenuto.durataSpot ?? null,
          stato: "in-attesa-pagamento",
          clienteNome: input.cliente.nome,
          clienteEmail: input.cliente.email.toLowerCase(),
          clienteTelefono: input.cliente.telefono ?? null,
          clienteRiferimentoFiscale: input.cliente.riferimentoFiscale ?? null,
          fidelityVerificata: esito.fidelizzato ? 1 : 0,
          fidelityId: esito.id,
          fidelityRiferimento: esito.riferimento,
          cashbackCents: preventivo.cashbackCents,
          cashbackStato: preventivo.cashbackEleggibile ? "eleggibile" : "non-eleggibile",
        })
        .returning();

      await registraEvento(
        pratica.id,
        "in-attesa-pagamento",
        `${preventivo.motivo} Fascia ${preventivo.fascia}.`,
        "sistema",
      );

      try {
        const prezzo = await assicuraPrezzoStripe(
          pacchetto,
          preventivo.fascia,
          preventivo.pacchettoCents,
        );
        const disponibili = await addonAdv(true);
        const righeAddon: { price: string; quantity: number }[] = [];
        for (const a of preventivo.addon) {
          const riga = disponibili.find((d) => d.codice === a.codice);
          if (!riga) continue;
          const p = await assicuraPrezzoAddonStripe(riga);
          if (p.priceId) righeAddon.push({ price: p.priceId, quantity: 1 });
        }

        const sessione = await stripePost<{ id: string; url?: string }>("/checkout/sessions", {
          mode: "payment",
          success_url: `${input.origin}/le-mie-campagne?ordine=${pratica.numeroOrdine}&pagamento=ok`,
          cancel_url: `${input.origin}/tv-streaming-adv?pagamento=annullato`,
          client_reference_id: String(pratica.id),
          customer_email: pratica.clienteEmail,
          line_items: [{ price: prezzo.priceId, quantity: 1 }, ...righeAddon],
          metadata: {
            pratica: String(pratica.id),
            ordine: pratica.numeroOrdine,
            protocollo: pratica.protocollo,
            sku: pacchetto.sku,
            fascia: preventivo.fascia,
            fidelity: esito.fidelizzato ? "verificata" : "no",
          },
        });

        if (!sessione.url) throw new ErroreStripe("Stripe non ha restituito la pagina di pagamento.");

        await db
          .update(schema.advPratiche)
          .set({ stripeSessionId: sessione.id, updatedAt: new Date() })
          .where(eq(schema.advPratiche.id, pratica.id));

        return {
          url: sessione.url,
          numeroOrdine: pratica.numeroOrdine,
          protocollo: pratica.protocollo,
          fascia: preventivo.fascia,
          lordoCents: preventivo.lordoCents,
        };
      } catch (e) {
        await db
          .update(schema.advPratiche)
          .set({ stato: "annullata", noteInterne: String(e), updatedAt: new Date() })
          .where(eq(schema.advPratiche.id, pratica.id));
        await registraEvento(pratica.id, "annullata", "Checkout non aperto.", "sistema");
        throw new ORPCError("BAD_GATEWAY", {
          message: e instanceof Error ? e.message : "Stripe ha rifiutato la richiesta di pagamento.",
        });
      }
    }),

  /**
   * LE MIE CAMPAGNE — area cliente senza registrazione: si apre con l'email dell'ordine
   * più un riferimento reale (numero ordine o protocollo). Con la sola email non si vede
   * nulla: i dati di campagna non sono pubblici.
   */
  mieCampagne: base
    .input(
      z.object({
        email: z.string().trim().email().max(160),
        riferimento: z.string().trim().min(6).max(60),
      }),
    )
    .handler(async ({ input }) => {
      const email = input.email.toLowerCase();
      const rif = input.riferimento.trim().toUpperCase();

      const [chiave] = await db
        .select()
        .from(schema.advPratiche)
        .where(
          sql`lower(${schema.advPratiche.clienteEmail}) = ${email} and (upper(${schema.advPratiche.numeroOrdine}) = ${rif} or upper(${schema.advPratiche.protocollo}) = ${rif})`,
        );

      if (!chiave) {
        throw new ORPCError("NOT_FOUND", {
          message:
            "Nessuna pratica trovata con questa email e questo riferimento. Controlla il numero d'ordine o il protocollo ricevuto via email.",
        });
      }

      const righe = await db
        .select()
        .from(schema.advPratiche)
        .where(sql`lower(${schema.advPratiche.clienteEmail}) = ${email}`)
        .orderBy(desc(schema.advPratiche.id));

      return {
        cliente: { nome: chiave.clienteNome, email: chiave.clienteEmail },
        pratiche: righe.map((p) => ({
          numeroOrdine: p.numeroOrdine,
          protocollo: p.protocollo,
          pacchettoTitolo: p.pacchettoTitolo,
          sku: p.sku,
          fascia: p.fascia,
          lordoCents: p.lordoCents,
          nettoCents: p.nettoCents,
          ivaCents: p.ivaCents,
          stato: p.stato,
          materiali: p.materiali,
          durataSpot: p.durataSpot,
          addon: JSON.parse(p.addonJson ?? "[]") as { nome: string; prezzoCents: number }[],
          configurazione: JSON.parse(p.configurazioneJson ?? "{}") as Record<string, unknown>,
          fidelityVerificata: p.fidelityVerificata === 1,
          cashbackCents: p.cashbackCents,
          cashbackStato: p.cashbackStato,
          report: p.reportJson ? (JSON.parse(p.reportJson) as Record<string, unknown>) : null,
          reportUrl: p.reportUrl,
          pagatoIl: p.pagatoIl,
          createdAt: p.createdAt,
        })),
      };
    }),
};
