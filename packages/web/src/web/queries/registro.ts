import { useQuery } from "@tanstack/react-query";
import { orpc } from "../lib/api";

export function useRegistro(input: { q?: string; qualifica?: string; soloDoppioni?: boolean }) {
  return useQuery(orpc.registro.lista.queryOptions({ input }));
}

export function useEntita(id: string) {
  return useQuery(orpc.registro.entita.queryOptions({ input: { id } }));
}
