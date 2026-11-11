import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { orpc, client } from "../lib/api";
import type { FaseProduzione, StatoVideo } from "../../api/data/musica";

/**
 * CATALOGO BRANI — lato pagine (Priorità 2ter).
 *
 * Una sola lettura per tutto: Musica TBH, J.C. Hugò, Produzioni, Road to 2030 e
 * Videoclip usano questo stesso elenco e cambiano solo il filtro. È la regola di
 * Claudio: «un solo record per brano, le pagine lo interrogano in modo diverso».
 */
export function useCatalogoBrani() {
  return useQuery(orpc.musica.catalogo.queryOptions());
}

/** Registra o aggiorna la produzione del videoclip di un brano (serve il codice). */
export function useSalvaVideoBrano() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (v: {
      codice: string;
      branoId: string;
      statoVideo: StatoVideo;
      statoProduzione?: FaseProduzione | null;
      videoUrl?: string | null;
      thumbnailVideo?: string | null;
      annoVideoPrevisto?: string | null;
      genere?: string | null;
      nota?: string | null;
    }) => client.musica.salvaVideo(v),
    onSuccess: () => qc.invalidateQueries({ queryKey: orpc.musica.key() }),
  });
}

/** Riporta il brano a SOLO AUDIO cancellando la riga di produzione. */
export function useAzzeraVideoBrano() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (v: { codice: string; branoId: string }) => client.musica.azzeraVideo(v),
    onSuccess: () => qc.invalidateQueries({ queryKey: orpc.musica.key() }),
  });
}
