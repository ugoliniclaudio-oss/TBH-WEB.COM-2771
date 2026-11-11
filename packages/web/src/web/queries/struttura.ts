import { useQuery } from "@tanstack/react-query";
import { orpc } from "../lib/api";

/**
 * STRUTTURA COMUNE Home → Canale → Attività → Scheda (28/10/2026): mappa statica dei Channel
 * e delle loro attività verificate. Dati dei file del sito: si legge una volta sola.
 */
export function useStruttura() {
  return useQuery({ ...orpc.struttura.mappa.queryOptions(), staleTime: Number.POSITIVE_INFINITY, gcTime: Number.POSITIVE_INFINITY });
}

export type ChannelStrutturaWeb = NonNullable<ReturnType<typeof useStruttura>["data"]>["channel"][number];
export type CardStrutturaWeb = ChannelStrutturaWeb["attivita"][number];
