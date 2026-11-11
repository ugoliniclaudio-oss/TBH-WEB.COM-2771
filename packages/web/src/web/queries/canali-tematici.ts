import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { client, orpc } from "../lib/api";

/**
 * CANALI TEMATICI (Touch Music · Touch Influencity Magazine · Arm Wrestling + quelli aggiunti dal pannello).
 * Il catalogo si ricarica ogni 60 s: il player applica le novità alla coda SENZA interrompere il video in corso.
 */

export function useCanaliTematici() {
  return useQuery({ ...orpc.canaliTematici.elenco.queryOptions(), staleTime: 60_000 });
}

export function useCanaleTematico(slug: string) {
  return useQuery({
    ...orpc.canaliTematici.canale.queryOptions({ input: { slug } }),
    staleTime: 30_000,
    refetchInterval: 60_000,
    refetchOnWindowFocus: true,
  });
}

export const segnalaErroreTematico = (v: Parameters<typeof client.canaliTematici.segnalaErrore>[0]) =>
  client.canaliTematici.segnalaErrore(v).catch(() => null);

export function useQuadroTematici(codice: string) {
  return useQuery({
    ...orpc.canaliTematiciAdmin.quadro.queryOptions({ input: { codice } }),
    enabled: codice.trim().length > 0,
    retry: false,
  });
}

export type QuadroTematici = Awaited<ReturnType<typeof client.canaliTematiciAdmin.quadro>>;
export type VoceAdmin = QuadroTematici["voci"][number];
export type CanaleTematicoDati = QuadroTematici["canali"][number];
export type VideoTematico = Awaited<ReturnType<typeof client.canaliTematici.canale>>["video"][number];

function mutazione<A, R>(fn: (a: A) => Promise<R>) {
  return function useMutazione() {
    const qc = useQueryClient();
    return useMutation({
      mutationFn: fn,
      onSuccess: () => {
        void qc.invalidateQueries({ queryKey: orpc.canaliTematiciAdmin.key() });
        void qc.invalidateQueries({ queryKey: orpc.canaliTematici.key() });
      },
    });
  };
}

type P<K extends keyof typeof client.canaliTematiciAdmin> = Parameters<(typeof client.canaliTematiciAdmin)[K]>[0];

export const useSalvaCanaleTematico = mutazione((v: P<"salvaCanale">) => client.canaliTematiciAdmin.salvaCanale(v));
export const useEliminaCanaleTematico = mutazione((v: P<"eliminaCanale">) => client.canaliTematiciAdmin.eliminaCanale(v));
export const useAggiungiVoceTematica = mutazione((v: P<"aggiungi">) => client.canaliTematiciAdmin.aggiungi(v));
export const useImportaTematici = mutazione((v: P<"importa">) => client.canaliTematiciAdmin.importa(v));
export const useAggiornaVoceTematica = mutazione((v: P<"aggiorna">) => client.canaliTematiciAdmin.aggiorna(v));
export const useVerificaVoceTematica = mutazione((v: P<"verifica">) => client.canaliTematiciAdmin.verifica(v));
export const useStatoVoceTematica = mutazione((v: P<"stato">) => client.canaliTematiciAdmin.stato(v));
export const useOrdinaTematici = mutazione((v: P<"ordina">) => client.canaliTematiciAdmin.ordina(v));
export const useEliminaVoceTematica = mutazione((v: P<"elimina">) => client.canaliTematiciAdmin.elimina(v));
export const useSvuotaErroriTematici = mutazione((v: P<"svuotaErrori">) => client.canaliTematiciAdmin.svuotaErrori(v));
/** Anteprima di un URL senza inserirlo (non invalida nulla). */
export const analizzaUrlTematico = (v: P<"analizza">) => client.canaliTematiciAdmin.analizza(v);
