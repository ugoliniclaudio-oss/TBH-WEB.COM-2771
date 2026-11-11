import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { orpc, client } from "../lib/api";

/**
 * TBH CONTENT HUB — pre-allestimento.
 * Un contenuto si carica una volta e diventa record canonico. Niente pubblicazione
 * automatica: nasce in bozza, si controlla, poi si porta ad «attivo» a mano.
 */

/** Il Content Hub è attivo sul server? (dipende dal codice di allestimento) */
export function useStatoHub() {
  return useQuery(orpc.hub.stato.queryOptions());
}

/** Elenco dei contenuti in pre-allestimento. Senza codice non si chiede nulla. */
export function useElencoContenuti(codice: string, stato?: string, canale?: string) {
  return useQuery({
    ...orpc.hub.elenco.queryOptions({
      input: {
        codice,
        ...(stato ? { stato: stato as "bozza" | "allestimento" | "attivo" | "nascosto" } : {}),
        ...(canale ? { canale } : {}),
      },
    }),
    enabled: codice.length > 0,
  });
}

/** Un singolo record, per riaprirlo in modifica. */
export function useContenuto(codice: string, id: number | null) {
  return useQuery({
    ...orpc.hub.dettaglio.queryOptions({ input: { codice, id: id ?? 0 } }),
    enabled: codice.length > 0 && !!id,
  });
}

function useInvalida() {
  const qc = useQueryClient();
  return () => {
    qc.invalidateQueries({ queryKey: orpc.hub.elenco.key() });
    qc.invalidateQueries({ queryKey: orpc.hub.dettaglio.key() });
  };
}

export function useSalvaContenuto() {
  const invalida = useInvalida();
  return useMutation({ ...orpc.hub.salva.mutationOptions(), onSuccess: invalida });
}

export function useCambiaStato() {
  const invalida = useInvalida();
  return useMutation({ ...orpc.hub.cambiaStato.mutationOptions(), onSuccess: invalida });
}

export function useEliminaContenuto() {
  const invalida = useInvalida();
  return useMutation({ ...orpc.hub.elimina.mutationOptions(), onSuccess: invalida });
}

/** IMPORTA DA URL: si incolla un indirizzo e il Hub prepara la scheda. */
export function useImportaUrl() {
  return useMutation(orpc.hub.importaUrl.mutationOptions());
}

export type DatiFileHub = { codice: string; file: File; cartella?: string };

/**
 * Caricamento reale in due passi: link firmato → PUT del file nell'archivio del portale.
 * Restituisce l'indirizzo definitivo da mettere nel campo giusto della scheda.
 */
export function useCaricaFileHub() {
  return useMutation({
    mutationFn: async (d: DatiFileHub) => {
      const tipo = d.file.type || "application/octet-stream";
      const { url, indirizzo } = await client.hub.presign({
        codice: d.codice,
        filename: d.file.name,
        contentType: tipo,
        cartella: d.cartella,
      });
      const r = await fetch(url, { method: "PUT", body: d.file, headers: { "Content-Type": tipo } });
      if (!r.ok) throw new Error(`Caricamento non riuscito (${r.status}).`);
      return { indirizzo, nome: d.file.name, tipo };
    },
  });
}
