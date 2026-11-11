import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { client, orpc } from "../lib/api";

/** Modulo online di un annuncio della bacheca lavoro. */
export function useModuloLavoro(annuncio: string) {
  return useQuery({
    ...orpc.candidatureLavoro.modulo.queryOptions({ input: { annuncio } }),
    enabled: annuncio.length > 0,
    retry: false,
  });
}

export type InvioCandidaturaLavoro = Parameters<typeof client.candidatureLavoro.invia>[0];

export function useInviaCandidaturaLavoro() {
  return useMutation({
    mutationFn: (v: InvioCandidaturaLavoro) => client.candidatureLavoro.invia(v),
  });
}

/** Pannello: elenco candidature (serve il codice di allestimento). */
export function useCandidatureLavoro(codice: string, annuncio?: string) {
  return useQuery({
    ...orpc.candidatureLavoro.elenco.queryOptions({ input: { codice, annuncio } }),
    enabled: codice.trim().length > 0,
    retry: false,
  });
}

export function useStatoCandidaturaLavoro() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (v: Parameters<typeof client.candidatureLavoro.stato>[0]) =>
      client.candidatureLavoro.stato(v),
    onSuccess: () => qc.invalidateQueries({ queryKey: orpc.candidatureLavoro.key() }),
  });
}
