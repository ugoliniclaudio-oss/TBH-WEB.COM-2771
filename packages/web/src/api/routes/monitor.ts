import { z } from "zod";
import { ORPCError } from "@orpc/server";
import { eq } from "drizzle-orm";
import { base } from "../__core/app";
import { db } from "../database";
import * as schema from "../database/schema";
import { AMBIENTE, chiaveAmbito } from "../lib/ambiente";

/**
 * MONITOR A ROTAZIONE (28/10/2026) — durata di ogni immagine, locandina o miniatura sui monitor
 * di palinsesti, spot e Touch Cinema. Ordine di Claudio: 8 secondi ciascuna, durata modificabile.
 * Il valore vive nella tabella `settings` (chiave dell'ambito: anteprima e sito pubblico separati);
 * nessuna chiave = 8 secondi. Si modifica dal pannello /allestimento/channel con il codice.
 */

export const ROTAZIONE_PREDEFINITA_SEC = 8;
const CHIAVE = chiaveAmbito("monitor_rotazione_sec");

async function leggiRotazione(): Promise<number> {
  try {
    const [r] = await db.select().from(schema.settings).where(eq(schema.settings.key, CHIAVE));
    const n = Number(r?.value);
    return Number.isFinite(n) && n >= 3 && n <= 120 ? Math.round(n) : ROTAZIONE_PREDEFINITA_SEC;
  } catch {
    return ROTAZIONE_PREDEFINITA_SEC;
  }
}

function controlla(codice: string) {
  const atteso = (process.env.TBH_CODICE_ALLESTIMENTO ?? "").trim();
  if (!atteso) throw new ORPCError("SERVICE_UNAVAILABLE", { message: "Codice di allestimento non configurato sul server." });
  if (codice.trim() !== atteso) throw new ORPCError("UNAUTHORIZED", { message: "Codice di allestimento errato." });
}

export const monitor = {
  impostazioni: base.handler(async () => ({
    rotazioneSec: await leggiRotazione(),
    predefinita: ROTAZIONE_PREDEFINITA_SEC,
    ambiente: AMBIENTE,
  })),
};

export const monitorAdmin = {
  impostaRotazione: base
    .input(z.object({ codice: z.string(), rotazioneSec: z.number().int().min(3).max(120) }))
    .handler(async ({ input }) => {
      controlla(input.codice);
      const value = String(input.rotazioneSec);
      await db
        .insert(schema.settings)
        .values({ key: CHIAVE, value })
        .onConflictDoUpdate({ target: schema.settings.key, set: { value } });
      return { rotazioneSec: input.rotazioneSec, ambiente: AMBIENTE };
    }),
};
