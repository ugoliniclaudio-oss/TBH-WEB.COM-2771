import { useQuery } from "@tanstack/react-query";
import { orpc } from "../lib/api";

/**
 * SCANSIONE DEL SITO — collegamenti al server (specifica 17/09/2026, punto 8).
 * L'elenco dei difetti è calcolato dal server leggendo le anagrafiche e i file
 * veri: il browser non ricontrolla e non stima niente.
 */

export function useStatoScansione() {
  return useQuery(orpc.scansioneAdmin.stato.queryOptions({ input: {} }));
}

export function useScansione(codice: string) {
  return useQuery({
    ...orpc.scansioneAdmin.elenco.queryOptions({ input: { codice } }),
    enabled: codice.trim().length > 0,
    staleTime: 30_000,
  });
}
