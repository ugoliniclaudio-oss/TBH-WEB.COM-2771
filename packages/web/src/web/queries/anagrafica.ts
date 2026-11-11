import { useQuery } from "@tanstack/react-query";
import { orpc } from "../lib/api";

/** Anagrafica master: una scheda per attività/luogo/emittente, richiamata da ogni sezione. */
export function useAnagrafica() {
  return useQuery(orpc.anagrafica.elenco.queryOptions());
}

export function useSchedaMaster(slug: string) {
  return useQuery(orpc.anagrafica.scheda.queryOptions({ input: { slug } }));
}

export function useRadioPartner() {
  return useQuery(orpc.anagrafica.radio.queryOptions());
}
