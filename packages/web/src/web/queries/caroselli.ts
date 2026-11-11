import { useQuery } from "@tanstack/react-query";
import { orpc } from "../lib/api";

/**
 * CAROSELLI DI CANALE 0 — schede vive dal server (ordine casuale del giorno) e contatori.
 */
export function useCaroselliHome() {
  return useQuery({ ...orpc.caroselli.home.queryOptions(), staleTime: 5 * 60_000, refetchInterval: 15 * 60_000 });
}

export function useConteggiCaroselli(codice: string, giorni = 14) {
  return useQuery({
    ...orpc.caroselliAdmin.conteggi.queryOptions({ input: { codice, giorni } }),
    enabled: codice.trim().length > 0,
    retry: false,
    refetchInterval: 60_000,
  });
}
