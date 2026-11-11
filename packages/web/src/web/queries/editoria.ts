import { useQuery } from "@tanstack/react-query";
import { orpc } from "../lib/api";

export function useEdicola() {
  return useQuery(orpc.editoria.edicola.queryOptions());
}

export function useSpeciali() {
  return useQuery(orpc.editoria.speciali.queryOptions());
}

export function useNumero(slug: string) {
  return useQuery(orpc.editoria.numero.queryOptions({ input: { slug } }));
}

export function useNews(categoria?: string) {
  return useQuery(orpc.editoria.news.queryOptions({ input: { categoria } }));
}
