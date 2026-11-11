import { useQuery } from "@tanstack/react-query";
import { orpc } from "../lib/api";

/**
 * PALINSESTO PARTITE DEI CANALI SQUADRA (17/10/2026) — dati letti dal server su
 * Romagna Sport e tenuti in memoria 30 minuti: qui si rilegge ogni 10 minuti.
 */
export function usePalinsestoSquadra(squadra: string) {
  return useQuery({ ...orpc.calendari.squadra.queryOptions({ input: { squadra } }), staleTime: 5 * 60_000, refetchInterval: 10 * 60_000 });
}

export function usePalinsestoCanaliSquadra() {
  return useQuery({ ...orpc.calendari.canali.queryOptions(), staleTime: 5 * 60_000, refetchInterval: 10 * 60_000 });
}
