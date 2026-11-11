import { useQuery } from "@tanstack/react-query";
import { orpc } from "../lib/api";

export function useEstero() {
  return useQuery(orpc.travels.estero.queryOptions());
}
