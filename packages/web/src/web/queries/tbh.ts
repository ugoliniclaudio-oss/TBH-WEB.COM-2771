import { useQuery } from "@tanstack/react-query";
import { orpc } from "../lib/api";

export function useDm() {
  return useQuery(orpc.tbh.dm.queryOptions());
}

/** Calendario unico dello sport TBH: eventi + programmi DM + filtri. */
export function useCalendarioSport() {
  return useQuery(orpc.tbh.calendarioSport.queryOptions());
}

export function useProgramma(slug: string) {
  return useQuery(orpc.tbh.programma.queryOptions({ input: { slug } }));
}

export function useLivelli() {
  return useQuery(orpc.tbh.livelli.queryOptions());
}

export function useBrand(slug: string) {
  return useQuery(orpc.tbh.brand.queryOptions({ input: { slug } }));
}

export function useBrandList() {
  return useQuery(orpc.tbh.brandList.queryOptions());
}

export function useLavoro() {
  return useQuery(orpc.tbh.lavoro.queryOptions());
}

export function useIstituzioni() {
  return useQuery(orpc.tbh.istituzioni.queryOptions());
}

export function useProduzioni() {
  return useQuery(orpc.tbh.produzioni.queryOptions());
}

export function useServizi() {
  return useQuery(orpc.tbh.servizi.queryOptions());
}

export function useCircuito() {
  return useQuery(orpc.tbh.circuito.queryOptions());
}

export function useNetwork(tipo: "clienti" | "sponsor" | "partner") {
  return useQuery(orpc.tbh.network.queryOptions({ input: { tipo } }));
}

export function useStreaming() {
  return useQuery(orpc.tbh.streaming.queryOptions());
}

export function useEntita() {
  return useQuery(orpc.tbh.entita.queryOptions());
}
