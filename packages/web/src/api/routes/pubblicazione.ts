import { z } from "zod";
import { ORPCError } from "@orpc/server";
import { base } from "../__core/app";
import { AMBIENTE } from "../lib/ambiente";
import { creaCopia, elencoCopie, ripristinaCopia } from "../lib/copie-sicurezza";
import { confrontoTematici, promuoviTematici } from "../lib/promozione";

/**
 * PUBBLICAZIONE DEI DATI E COPIE DI SICUREZZA (28/10/2026) — solo Super Admin (codice di allestimento).
 * Il pulsante Publish di Runable pubblica il codice; i dati salvati nell'anteprima arrivano su
 * www.tbh-web.com solo da qui (canali tematici) o perché il CMS li salva già condivisi.
 */

function controlla(codice: string) {
  const atteso = (process.env.TBH_CODICE_ALLESTIMENTO ?? "").trim();
  if (!atteso) throw new ORPCError("SERVICE_UNAVAILABLE", { message: "Codice di allestimento non configurato sul server." });
  if (codice.trim() !== atteso) throw new ORPCError("UNAUTHORIZED", { message: "Codice di allestimento errato." });
}
const CODICE = z.object({ codice: z.string() });
const errore = (e: unknown) => new ORPCError("BAD_REQUEST", { message: e instanceof Error ? e.message : String(e) });

export const pubblicazioneAdmin = {
  copie: base.input(CODICE).handler(async ({ input }) => {
    controlla(input.codice);
    return { ambiente: AMBIENTE, copie: await elencoCopie() };
  }),
  creaCopia: base.input(CODICE.extend({ motivo: z.string().trim().max(200).default("") })).handler(async ({ input }) => {
    controlla(input.codice);
    return creaCopia(input.motivo || "Copia manuale dal pannello");
  }),
  ripristina: base.input(CODICE.extend({ id: z.string().regex(/^\d{10,16}$/) })).handler(async ({ input }) => {
    controlla(input.codice);
    try {
      return await ripristinaCopia(input.id);
    } catch (e) {
      throw errore(e);
    }
  }),
  confrontoTematici: base.input(CODICE).handler(async ({ input }) => {
    controlla(input.codice);
    return { ambiente: AMBIENTE, canali: await confrontoTematici() };
  }),
  promuoviTematici: base.input(CODICE.extend({ slug: z.string().regex(/^[a-z0-9][a-z0-9-]{1,48}$/).optional() })).handler(async ({ input }) => {
    controlla(input.codice);
    try {
      return await promuoviTematici(input.slug);
    } catch (e) {
      throw errore(e);
    }
  }),
};

/** Export con il nome della feature (convenzione dei file di route); il router usa le chiavi sopra. */
export const pubblicazione = { pubblicazioneAdmin };
