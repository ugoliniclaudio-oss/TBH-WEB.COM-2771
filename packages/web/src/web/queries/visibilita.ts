import { useQuery } from "@tanstack/react-query";
import { orpc } from "../lib/api";

/** Scene dimostrative e posizioni pubblicitarie di "Brand in intervista · studio · diretta". */
export function useVisibilita() {
  return useQuery(orpc.visibilita.scene.queryOptions());
}
