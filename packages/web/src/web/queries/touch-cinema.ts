import { useQuery } from "@tanstack/react-query";
import { orpc } from "../lib/api";

/**
 * TOUCH CINEMA — programmazione provvisoria (catalogo HEDDY.video) letta dal server.
 */
export function useProgrammazioneTouchCinema() {
  return useQuery({ ...orpc.touchCinema.programmazione.queryOptions(), staleTime: 5 * 60_000 });
}
