import { useQuery } from "@tanstack/react-query";
import { orpc } from "../lib/api";

export function useProspects(filters: {
  regione?: string;
  settore?: string;
  priorita?: string;
  q?: string;
}) {
  return useQuery(orpc.rete.prospects.queryOptions({ input: filters }));
}

export function useLuoghi(categoria?: string, soloCircuito?: boolean) {
  return useQuery(orpc.rete.luoghi.queryOptions({ input: { categoria, soloCircuito } }));
}

export function useCircuitoRandom(n = 4) {
  return useQuery(orpc.rete.circuitoRandom.queryOptions({ input: { n } }));
}

export function useTerritori() {
  return useQuery(orpc.rete.territori.queryOptions());
}

export function useMotorsport() {
  return useQuery(orpc.rete.motorsport.queryOptions());
}

export function useCalcio() {
  return useQuery(orpc.rete.calcio.queryOptions());
}

export function useMedia() {
  return useQuery(orpc.rete.media.queryOptions());
}

export function useGiochi() {
  return useQuery(orpc.rete.giochi.queryOptions());
}

export function useAllestimento() {
  return useQuery(orpc.rete.allestimento.queryOptions());
}
