import { z } from "zod";
import { desc, eq, sql } from "drizzle-orm";
import { ORPCError } from "@orpc/server";
import { base } from "../__core/app";
import { db } from "../database";
import * as schema from "../database/schema";
import { chiudiPratica } from "./pratiche";
import {
  CLASSIFICA,
  CONSENSI,
  CONSENSI_NOTA,
  CONVERGENZA,
  FLUSSO_BACKOFFICE,
  FLUSSO_NOTA,
  MAGAZINE_PER_TUTTE,
  MISS_COOL,
  MODULO_ACCETTAZIONE,
  MODULO_ADESIONE,
  MODULO_PORTFOLIO,
  OFFICIAL_CANDIDATE,
  PERCORSI,
  PIANI_LIVELLI,
  REGOLAMENTO,
  REGOLAMENTO_NOTA,
  ROADMAP,
  ROADMAP_NOTA,
  SCHEDA_DIGITALE,
  SEZIONI_MASTER,
  SLIDE_KIT,
} from "../data/miss-cool";

/**
 * TOUCH MISS COOL — servizio del concorso (Kit Digitale 2027).
 *
 * Tre regole che governano il file:
 *
 * 1. NIENTE CANDIDATE FINTE. Le schede pubbliche escono solo dalla tabella
 *    `miss_cool_candidature`, che parte vuota. Finché nessuna candidatura reale
 *    è stata approvata e pubblicata, l'elenco è vuoto e la pagina lo dichiara.
 *
 * 2. NIENTE IMPORTI INVENTATI. Compensi, gettoni, premi ed esclusive arrivano
 *    da `api/data/miss-cool.ts`, dove valgono «DA DEFINIRE» come nel Kit.
 *
 * 3. UNA SOLA FONTE. La struttura del concorso non è riscritta nelle pagine:
 *    le pagine leggono da qui, e qui si legge il Kit approvato.
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

/** Compie 18 anni entro oggi? Il Kit lo chiede come requisito d'ingresso. */
function maggiorenne(dataNascita: string): boolean {
  const d = new Date(dataNascita + "T00:00:00Z");
  if (Number.isNaN(d.getTime())) return false;
  const limite = new Date();
  limite.setUTCFullYear(limite.getUTCFullYear() - 18);
  return d.getTime() <= limite.getTime();
}

type Riga = typeof schema.missCoolCandidature.$inferSelect;

/** Forma pubblica della scheda: solo ciò che il consenso B autorizza. */
function schedaPubblica(r: Riga) {
  return {
    slug: r.slug,
    numeroGara: r.numeroGara,
    nome: r.nomeArtistico?.trim() || r.nome,
    comune: r.comune,
    presentazione: r.presentazione,
    esperienze: r.esperienze,
    ruoli: r.ruoli,
    fotoUfficiale: r.fotoUfficiale,
    portfolioUrl: r.consensoE ? r.portfolioUrl : null,
    videoUrl: r.consensoE ? r.videoUrl : null,
    social: r.consensoD ? r.socialAutorizzati : null,
    votiValidi: r.votiValidi,
    percorso: r.percorso,
    posizioneFinale: r.posizioneFinale,
  };
}

export const missCool = {
  /** Tutto il Kit in una chiamata: la pagina master non riscrive nulla. */
  kit: base.handler(async () => {
    const [conteggio] = await db
      .select({
        totali: sql<number>`count(*)`,
        pubblicate: sql<number>`sum(case when stato = 'pubblicata' then 1 else 0 end)`,
      })
      .from(schema.missCoolCandidature);

    return {
      concorso: MISS_COOL,
      percorsi: PERCORSI,
      convergenza: CONVERGENZA,
      classifica: CLASSIFICA,
      officialCandidate: OFFICIAL_CANDIDATE,
      magazinePerTutte: MAGAZINE_PER_TUTTE,
      pianiLivelli: PIANI_LIVELLI,
      roadmap: ROADMAP,
      roadmapNota: ROADMAP_NOTA,
      sezioni: SEZIONI_MASTER,
      schedaDigitale: SCHEDA_DIGITALE,
      flusso: FLUSSO_BACKOFFICE,
      flussoNota: FLUSSO_NOTA,
      slide: SLIDE_KIT,
      candidature: {
        totali: Number(conteggio?.totali ?? 0),
        pubblicate: Number(conteggio?.pubblicate ?? 0),
      },
    };
  }),

  /** Regolamento: indice e testo dei 18 articoli. */
  regolamento: base.handler(async () => ({
    concorso: MISS_COOL,
    articoli: REGOLAMENTO,
    nota: REGOLAMENTO_NOTA,
    classifica: CLASSIFICA,
    officialCandidate: OFFICIAL_CANDIDATE,
  })),

  /** Liberatoria: Modulo 02 (materiale) + Modulo 03 (sei consensi). */
  liberatoria: base.handler(async () => ({
    concorso: MISS_COOL,
    portfolio: MODULO_PORTFOLIO,
    consensi: CONSENSI,
    nota: CONSENSI_NOTA,
  })),

  /** Struttura del modulo di adesione e del modulo di accettazione. */
  moduli: base.handler(async () => ({
    concorso: MISS_COOL,
    adesione: MODULO_ADESIONE,
    portfolio: MODULO_PORTFOLIO,
    consensi: CONSENSI,
    consensiNota: CONSENSI_NOTA,
    accettazione: MODULO_ACCETTAZIONE,
  })),

  /**
   * Schede pubbliche delle candidate. Solo chi è pubblicata e ha il consenso B.
   * Nessun profilo di esempio: se è vuoto, è vuoto.
   */
  schede: base
    .input(z.object({ edizione: z.string().trim().max(10).optional() }).optional())
    .handler(async ({ input }) => {
      const edizione = input?.edizione?.trim() || MISS_COOL.edizione;
      const righe = await db
        .select()
        .from(schema.missCoolCandidature)
        .where(eq(schema.missCoolCandidature.edizione, edizione))
        .orderBy(desc(schema.missCoolCandidature.votiValidi))
        .limit(200);
      const pubblicate = righe.filter(
        (r) => r.stato === "pubblicata" && r.consensoB === 1 && r.slug,
      );
      return {
        edizione,
        formato: SCHEDA_DIGITALE,
        schede: pubblicate.map(schedaPubblica),
        nota:
          pubblicate.length === 0
            ? "Nessuna scheda pubblicata: le candidature dell'edizione 2027 si aprono a ottobre 2026 secondo la roadmap del Kit. Qui non compaiono profili di esempio."
            : null,
      };
    }),

  /** Una singola scheda pubblica. */
  scheda: base
    .input(z.object({ slug: z.string().trim().min(1).max(120) }))
    .handler(async ({ input }) => {
      const [riga] = await db
        .select()
        .from(schema.missCoolCandidature)
        .where(eq(schema.missCoolCandidature.slug, input.slug))
        .limit(1);
      if (!riga || riga.stato !== "pubblicata" || riga.consensoB !== 1) {
        throw new ORPCError("NOT_FOUND", { message: "Scheda non pubblicata." });
      }
      return { formato: SCHEDA_DIGITALE, scheda: schedaPubblica(riga) };
    }),

  /**
   * INVIO DELLA DOMANDA DI PARTECIPAZIONE (Modulo 01 + dichiarazioni + consensi).
   * Entra nel flusso allo stato «inviata»: la verifica 18+, i documenti e
   * l'approvazione li fa la redazione, non il modulo.
   */
  candidati: base
    .input(
      z.object({
        percorso: z.enum(["live", "web", "entrambi"]).default("entrambi"),
        nome: z.string().trim().min(3, "Serve nome e cognome.").max(120),
        nomeArtistico: z.string().trim().max(120).optional(),
        dataNascita: z
          .string()
          .trim()
          .regex(/^\d{4}-\d{2}-\d{2}$/, "Data di nascita in formato AAAA-MM-GG."),
        comune: z.string().trim().min(2, "Serve comune e provincia.").max(120),
        telefono: z.string().trim().min(6, "Serve un telefono raggiungibile.").max(40),
        email: z.string().trim().email("Serve un indirizzo e-mail valido.").max(160),
        professione: z.string().trim().max(160).optional(),
        esperienze: z.string().trim().max(2000).optional(),
        trasferte: z.string().trim().max(300).optional(),
        ruoli: z.string().trim().max(500).optional(),
        presentazione: z.string().trim().max(2000).optional(),
        dichiaraMaggiorenne: z.boolean(),
        accettaRegolamento: z.boolean(),
        lettaPrivacy: z.boolean(),
        consensoA: z.boolean(),
        consensoB: z.boolean(),
        consensoC: z.boolean(),
        consensoD: z.boolean(),
        consensoE: z.boolean(),
        consensoF: z.boolean(),
        /**
         * Pratica di caricamento aperta dal modulo quando la candidata ha scelto dei
         * file (foto, portfolio, allegati). All'invio i file passano sugli slot
         * definitivi della candidatura. Se manca, la candidatura è valida comunque:
         * il materiale si consegna dopo, come prima.
         */
        pratica: z.string().trim().min(8).max(64).optional(),
      }),
    )
    .handler(async ({ input }) => {
      // Le tre dichiarazioni del Kit sono obbligatorie: senza, non si invia.
      if (!input.dichiaraMaggiorenne || !input.accettaRegolamento || !input.lettaPrivacy) {
        throw new ORPCError("BAD_REQUEST", {
          message:
            "Per inviare la domanda servono le tre dichiarazioni del modulo: 18 anni compiuti, accettazione del regolamento, lettura dell'informativa privacy.",
        });
      }
      // Consenso A e F sono i due senza cui l'organizzazione non può nemmeno
      // prendere in carico né convocare: lo dice il Modulo 03.
      if (!input.consensoA || !input.consensoF) {
        throw new ORPCError("BAD_REQUEST", {
          message:
            "Servono almeno il consenso A (gestione della candidatura) e il consenso F (comunicazioni organizzative): senza, la candidatura non può essere presa in carico.",
        });
      }
      if (!maggiorenne(input.dataNascita)) {
        throw new ORPCError("BAD_REQUEST", {
          message:
            "Il concorso è riservato a chi ha già compiuto 18 anni alla data della candidatura (articolo 4 del regolamento).",
        });
      }

      const b = (v: boolean) => (v ? 1 : 0);
      const [riga] = await db
        .insert(schema.missCoolCandidature)
        .values({
          edizione: MISS_COOL.edizione,
          percorso: input.percorso,
          nome: input.nome,
          nomeArtistico: input.nomeArtistico || null,
          dataNascita: input.dataNascita,
          comune: input.comune,
          telefono: input.telefono,
          email: input.email,
          professione: input.professione || null,
          esperienze: input.esperienze || null,
          trasferte: input.trasferte || null,
          ruoli: input.ruoli || null,
          presentazione: input.presentazione || null,
          dichiaraMaggiorenne: 1,
          accettaRegolamento: 1,
          lettaPrivacy: 1,
          consensoA: b(input.consensoA),
          consensoB: b(input.consensoB),
          consensoC: b(input.consensoC),
          consensoD: b(input.consensoD),
          consensoE: b(input.consensoE),
          consensoF: b(input.consensoF),
          stato: "inviata",
          pratica: input.pratica || null,
          statoVerifica18: "da fare",
          statoDocumenti: "da fare",
          statoConsensi: "ricevuti dal modulo",
          statoApprovazione: "da fare",
          statoPubblicazione: "da fare",
        })
        .returning();

      /**
       * I file caricati dal modulo passano sugli slot definitivi della candidatura
       * (`missCool:candidatura:<id>:<campo>`) e la pratica si chiude: dal pannello
       * si vedono e si scaricano con gli stessi comandi del resto del sito.
       * Le foto restano in bozza (le pubblica la redazione); portfolio e allegati
       * restano riservati e non escono mai dalle pagine pubbliche.
       */
      const materiale =
        riga?.id != null
          ? await chiudiPratica({
              token: input.pratica,
              ambito: "miss-cool",
              slotBase: `missCool:candidatura:${riga.id}`,
              riferimento: `missCoolCandidature:${riga.id}`,
            })
          : { collegata: false as const, nFile: 0, fotoPrincipale: null as string | null };

      if (riga?.id != null && materiale.collegata && materiale.nFile > 0) {
        await db
          .update(schema.missCoolCandidature)
          .set({
            materiale: "caricato dal modulo online",
            materialeNFile: materiale.nFile,
            materialeDataConsegna: new Date().toISOString().slice(0, 10),
            statoDocumenti: "ricevuti dal modulo",
            ...(materiale.fotoPrincipale ? { fotoUfficiale: materiale.fotoPrincipale } : {}),
            updatedAt: new Date(),
          })
          .where(eq(schema.missCoolCandidature.id, riga.id));
      }

      return {
        ok: true,
        id: riga?.id ?? null,
        fileRicevuti: materiale.nFile,
        prossimiPassi: [
          "La candidatura è registrata allo stato «inviata».",
          materiale.nFile > 0
            ? `Il materiale caricato dal modulo è arrivato: ${materiale.nFile} file allegati alla candidatura.`
            : "Il materiale del Modulo 02 (primo piano, figura intera, portfolio, video, CV artistico) si può caricare dal modulo oppure consegnare alla segreteria.",
          "La segreteria verifica i 18 anni con un documento in corso di validità.",
          "L'approvazione e la pubblicazione della scheda sono disposte dall'organizzazione.",
        ],
        contatti: MISS_COOL.contatti,
      };
    }),
};

/* ════════════════════════ PANNELLO REDAZIONE ════════════════════════════ */

export const missCoolAdmin = {
  /** Elenco completo delle candidature reali, per il back office in 8 passaggi. */
  elenco: base.input(auth.partial()).handler(async ({ input }) => {
    const configurato = CODICE().length > 0;
    const valido = configurato && (input.codice ?? "").trim() === CODICE();
    if (!valido) return { configurato, valido, candidature: [], flusso: FLUSSO_BACKOFFICE };
    const righe = await db
      .select()
      .from(schema.missCoolCandidature)
      .orderBy(desc(schema.missCoolCandidature.createdAt))
      .limit(500);
    return { configurato, valido, candidature: righe, flusso: FLUSSO_BACKOFFICE };
  }),

  /** Avanza una candidatura nel flusso: stato, data e operatore tracciati. */
  aggiorna: base
    .input(
      auth.extend({
        id: z.number().int().positive(),
        stato: z
          .enum([
            "inviata",
            "verifica-18",
            "documenti",
            "consensi",
            "approvata",
            "pubblicata",
            "esclusa",
            "ritirata",
          ])
          .optional(),
        numeroGara: z.number().int().positive().max(9999).optional(),
        slug: z
          .string()
          .trim()
          .min(2)
          .max(120)
          .regex(/^[a-z0-9-]+$/, "Solo minuscole, numeri e trattini.")
          .optional(),
        fotoUfficiale: z.string().trim().max(400).optional(),
        posizioneFinale: z.number().int().positive().max(999).optional(),
        squadraDm: z.string().trim().max(120).optional(),
        operatore: z.string().trim().max(120).optional(),
        notaInterna: z.string().trim().max(2000).optional(),
      }),
    )
    .handler(async ({ input }) => {
      controlla(input.codice);
      const { codice: _codice, id, ...campi } = input;
      const patch: Record<string, unknown> = { updatedAt: new Date() };
      for (const [k, v] of Object.entries(campi)) {
        if (v !== undefined) patch[k] = v;
      }
      if (input.stato === "pubblicata") patch.statoPubblicazione = "fatta";
      if (input.stato === "approvata") patch.statoApprovazione = "fatta";
      const [riga] = await db
        .update(schema.missCoolCandidature)
        .set(patch)
        .where(eq(schema.missCoolCandidature.id, id))
        .returning();
      if (!riga) throw new ORPCError("NOT_FOUND", { message: "Candidatura inesistente." });
      return { ok: true, candidatura: riga };
    }),
};
