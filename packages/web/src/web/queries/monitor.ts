import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { client, orpc } from "../lib/api";

/**
 * MONITOR A ROTAZIONE — durata di ogni immagine (8 s predefiniti, modificabile dal pannello).
 * Finché il server non risponde si usano gli 8 secondi: la rotazione parte subito.
 */
export function useDurataRotazione(): number {
  const q = useQuery({ ...orpc.monitor.impostazioni.queryOptions(), staleTime: 5 * 60_000 });
  return q.data?.rotazioneSec ?? 8;
}

export function useImpostazioniMonitor() {
  return useQuery({ ...orpc.monitor.impostazioni.queryOptions(), staleTime: 30_000 });
}

export function useImpostaRotazione() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (v: { codice: string; rotazioneSec: number }) => client.monitorAdmin.impostaRotazione(v),
    onSuccess: () => void qc.invalidateQueries({ queryKey: orpc.monitor.key() }),
  });
}
