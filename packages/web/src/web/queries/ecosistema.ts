import { useQuery } from "@tanstack/react-query";
import { orpc } from "../lib/api";

export function useMondi() {
  return useQuery(orpc.ecosistema.mondi.queryOptions());
}

export function useVetrina() {
  return useQuery(orpc.ecosistema.vetrina.queryOptions());
}

export function useAdesioni() {
  return useQuery(orpc.ecosistema.adesioni.queryOptions());
}

export function useHospitality(categoria?: string) {
  return useQuery(orpc.ecosistema.hospitality.queryOptions({ input: { categoria } }));
}

export function useAssist() {
  return useQuery(orpc.ecosistema.assist.queryOptions());
}

export function usePromo() {
  return useQuery(orpc.ecosistema.promo.queryOptions());
}
