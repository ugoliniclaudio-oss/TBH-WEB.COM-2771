import { z } from "zod";
import { sql } from "drizzle-orm";
import { base } from "../__core/app";
import { db } from "../database";
import * as schema from "../database/schema";

/**
 * CONTATORE REALE DI PRESENZE E INTERAZIONI.
 *
 * Regola di Claudio: nessun numero inventato, nessuna stima, nessuna cifra pubblicitaria.
 * Ogni valore è un contatore scritto sul database (tabella `settings`, chiave/valore)
 * e cresce solo quando succede davvero qualcosa, una volta sola:
 *
 * · visite            → una sola volta per sessione del browser (non a ogni ricarica);
 * · navigazioni       → una sola volta per sessione, e solo se la visita è "reale":
 *                       almeno 2 pagine viste, oppure oltre 30 secondi sul portale,
 *                       oppure un clic vero su una sezione;
 * · pagine            → ogni pagina realmente aperta durante la navigazione;
 * · schede            → ogni scheda/vetrina davvero aperta (società, attività, sponsor,
 *                       partner, squadre, prodotti, corsi, eventi, sedi, magazine);
 * · interazioni       → ogni clic reale su pulsante o link interno;
 * · uscite            → ogni clic verso siti, social e canali ufficiali esterni;
 * · feedback          → solo se l'utente vota davvero («utile» / «da migliorare»);
 * · ordini            → righe reali della tabella ordini del Touch Plaza Shop.
 *
 * Il contatore parte da zero il giorno della messa online: è un dato vero del portale.
 * I numeri storici del network (visualizzazioni complessive, contatti in database, ecc.)
 * NON stanno qui: sono dichiarazioni del gruppo e vanno mostrate separate, mai mescolate
 * con i dati rilevati dal sito.
 */

const CHIAVI = [
  "visite",
  "navigazioni",
  "pagine",
  "schede",
  "interazioni",
  "uscite",
  "feedback_utili",
  "feedback_migliorare",
] as const;
type Chiave = (typeof CHIAVI)[number];

const INIZIO = "contatore_inizio";

async function leggi(): Promise<Record<string, string>> {
  const righe = await db.select().from(schema.settings);
  return Object.fromEntries(righe.map((r) => [r.key, r.value]));
}

/** Somma atomica: se la chiave non c'è la crea, altrimenti aggiorna il valore esistente. */
async function somma(chiave: string, quanti: number) {
  await db
    .insert(schema.settings)
    .values({ key: chiave, value: String(quanti) })
    .onConflictDoUpdate({
      target: schema.settings.key,
      set: {
        value: sql`CAST(${schema.settings.value} AS INTEGER) + ${quanti}`,
      },
    });
}

async function riepilogo() {
  const valori = await leggi();
  const numero = (k: string) => Number(valori[k] ?? 0) || 0;

  let ordini = 0;
  try {
    const r = await db.select({ n: sql<number>`count(*)` }).from(schema.orders);
    ordini = Number(r[0]?.n ?? 0) || 0;
  } catch {
    ordini = 0;
  }

  const utili = numero("feedback_utili");
  const migliorare = numero("feedback_migliorare");
  const votiTotali = utili + migliorare;

  return {
    visite: numero("visite"),
    navigazioni: numero("navigazioni"),
    pagine: numero("pagine"),
    schede: numero("schede"),
    interazioni: numero("interazioni"),
    uscite: numero("uscite"),
    feedback_utili: utili,
    feedback_migliorare: migliorare,
    feedback_totali: votiTotali,
    ordini,
    dal: valori[INIZIO] ?? null,
    nota:
      "Dati aggiornati automaticamente dalle visite reali del portale. Nessun numero inventato: " +
      "il valore cresce con l'utilizzo. I visitatori sono contati una volta per sessione, " +
      "le schede quando vengono davvero aperte, i feedback solo se l'utente vota.",
  };
}

export const statistiche = {
  /** Numeri correnti, usati dal contatore in Home e nel piè di pagina. */
  riepilogo: base.handler(async () => riepilogo()),

  /**
   * Registra ciò che è appena successo e restituisce i numeri aggiornati.
   * Visita e navigazione arrivano una sola volta per sessione del browser.
   */
  registra: base
    .input(
      z.object({
        visita: z.boolean().default(false),
        navigazione: z.boolean().default(false),
        pagine: z.number().int().min(0).max(50).default(0),
        schede: z.number().int().min(0).max(50).default(0),
        interazioni: z.number().int().min(0).max(200).default(0),
        uscite: z.number().int().min(0).max(200).default(0),
        feedback: z.enum(["utile", "migliorare"]).nullish(),
      }),
    )
    .handler(async ({ input }) => {
      const valori = await leggi();
      if (!valori[INIZIO]) {
        await db
          .insert(schema.settings)
          .values({ key: INIZIO, value: new Date().toISOString() })
          .onConflictDoNothing();
      }

      const da_sommare: Array<[Chiave, number]> = [
        ["visite", input.visita ? 1 : 0],
        ["navigazioni", input.navigazione ? 1 : 0],
        ["pagine", input.pagine],
        ["schede", input.schede],
        ["interazioni", input.interazioni],
        ["uscite", input.uscite],
        ["feedback_utili", input.feedback === "utile" ? 1 : 0],
        ["feedback_migliorare", input.feedback === "migliorare" ? 1 : 0],
      ];

      for (const [chiave, quanti] of da_sommare) {
        if (quanti > 0) await somma(chiave, quanti);
      }

      return riepilogo();
    }),
};
