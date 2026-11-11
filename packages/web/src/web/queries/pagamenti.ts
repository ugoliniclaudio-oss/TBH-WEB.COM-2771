import { useQuery } from "@tanstack/react-query";
import { orpc } from "../lib/api";

/** Modalità di pagamento e finanziamento: fonte unica per la pagina e per il blocco Touch Pay. */
export function usePagamenti() {
  return useQuery(orpc.pagamenti.lista.queryOptions());
}
