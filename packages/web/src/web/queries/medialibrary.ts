import { useQuery } from "@tanstack/react-query";
import { orpc } from "../lib/api";

export function useMediaLibrary() {
  return useQuery(orpc.medialibrary.libreria.queryOptions());
}
