import { z } from "zod";
import { ORPCError } from "@orpc/server";
import { base } from "../__core/app";
import { caroselliHome } from "../lib/caroselli-home";
import { conteggiCaroselli } from "../lib/caroselli-eventi";

/**
 * CAROSELLI DI CANALE 0 — schede vive (pubblico) e contatori per scheda (riservato).
 * Gli eventi vista/clic arrivano dal beacon HTTP /api/caroselli/evento (vedi index.ts).
 */

function controlla(codice: string) {
  const atteso = (process.env.TBH_CODICE_ALLESTIMENTO ?? "").trim();
  if (!atteso) throw new ORPCError("SERVICE_UNAVAILABLE", { message: "Codice di allestimento non configurato sul server." });
  if (codice.trim() !== atteso) throw new ORPCError("UNAUTHORIZED", { message: "Codice di allestimento errato." });
}

export const caroselli = {
  home: base.handler(async () => caroselliHome()),
};

export const caroselliAdmin = {
  conteggi: base
    .input(z.object({ codice: z.string(), giorni: z.number().int().min(1).max(90).default(14) }))
    .handler(async ({ input }) => {
      controlla(input.codice);
      return conteggiCaroselli(input.giorni);
    }),
};
