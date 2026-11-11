import { useQuery } from "@tanstack/react-query";
import { orpc } from "../lib/api";

/** Ordine 4 · ricerca globale su entità, prodotti, programmi, città, media e sezioni. */
export function useRicerca(q: string) {
  return useQuery({
    ...orpc.ricerca.cerca.queryOptions({ input: { q } }),
    enabled: q.trim().length >= 2,
  });
}
