import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { orpc } from "../lib/api";

/** Numeri reali del contatore di presenze (aggiornati ogni 30 secondi). */
export function useStatistiche() {
  return useQuery({
    ...orpc.statistiche.riepilogo.queryOptions(),
    refetchInterval: 30_000,
  });
}

/** Invia al server ciò che è appena successo (visita, pagine aperte, clic). */
export function useRegistraStatistiche() {
  const qc = useQueryClient();
  return useMutation({
    ...orpc.statistiche.registra.mutationOptions(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: orpc.statistiche.riepilogo.queryKey() });
    },
  });
}
