import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { client, orpc } from "../lib/api";

/**
 * CHANNEL — i 27 Channel della home «Canale 0» e i loro palinsesti automatici.
 * Stato e sequenze arrivano sempre dal server: il browser non decide nulla.
 */

export function useElencoChannel() {
  return useQuery({ ...orpc.channel.elenco.queryOptions(), staleTime: 30_000, refetchInterval: 60_000 });
}

export function usePalinsestoChannel(slug: string | null) {
  return useQuery({
    ...orpc.channel.palinsesto.queryOptions({ input: { slug: slug ?? "touch-tv" } }),
    enabled: !!slug,
    staleTime: 30_000,
  });
}

export function useQuadroChannelAdmin(codice: string) {
  return useQuery({
    ...orpc.channelAdmin.quadro.queryOptions({ input: { codice } }),
    enabled: codice.trim().length > 0,
    retry: false,
  });
}

export function useDettaglioChannelAdmin(codice: string, slug: string | null) {
  return useQuery({
    ...orpc.channelAdmin.dettaglio.queryOptions({ input: { codice, slug: slug ?? "dm" } }),
    enabled: codice.trim().length > 0 && !!slug,
    retry: false,
  });
}

function useInvalida() {
  const qc = useQueryClient();
  return () => {
    void qc.invalidateQueries({ queryKey: orpc.channelAdmin.key() });
    void qc.invalidateQueries({ queryKey: orpc.channel.key() });
    /* 28/10/2026 (round 14): anche monitor delle card e player leggono il palinsesto della Regia. */
    void qc.invalidateQueries({ queryKey: orpc.channelRegistro.key() });
  };
}

function mutazione<A, R>(fn: (a: A) => Promise<R>) {
  return function useMutazione() {
    const invalida = useInvalida();
    return useMutation({ mutationFn: fn, onSuccess: invalida });
  };
}

export type ImpostazioniChannel = Parameters<typeof client.channelAdmin.impostazioni>[0]["valori"];
export type NuovoContenutoChannel = Parameters<typeof client.channelAdmin.aggiungi>[0];
export type NuovaFasciaChannel = Parameters<typeof client.channelAdmin.aggiungiFascia>[0];

export const useSincronizzaChannel = mutazione((v: Parameters<typeof client.channelAdmin.sincronizza>[0]) => client.channelAdmin.sincronizza(v));
export const useImpostazioniChannel = mutazione((v: Parameters<typeof client.channelAdmin.impostazioni>[0]) => client.channelAdmin.impostazioni(v));
export const useAggiornaContenuto = mutazione((v: Parameters<typeof client.channelAdmin.aggiorna>[0]) => client.channelAdmin.aggiorna(v));
export const useOrdinaContenuti = mutazione((v: Parameters<typeof client.channelAdmin.ordina>[0]) => client.channelAdmin.ordina(v));
export const useAggiungiContenuto = mutazione((v: NuovoContenutoChannel) => client.channelAdmin.aggiungi(v));
export const useEliminaContenuto = mutazione((v: Parameters<typeof client.channelAdmin.elimina>[0]) => client.channelAdmin.elimina(v));
export const useAggiungiFascia = mutazione((v: NuovaFasciaChannel) => client.channelAdmin.aggiungiFascia(v));
export const useAttivaFascia = mutazione((v: Parameters<typeof client.channelAdmin.attivaFascia>[0]) => client.channelAdmin.attivaFascia(v));
export const useEliminaFascia = mutazione((v: Parameters<typeof client.channelAdmin.eliminaFascia>[0]) => client.channelAdmin.eliminaFascia(v));

/** Quale home mostra `/` in questo ambito («classica» = home precedente). */
export function useHomeAttiva() {
  return useQuery({ ...orpc.channel.home.queryOptions(), staleTime: 60_000, retry: 1 });
}

export const useImpostaHome = mutazione((v: Parameters<typeof client.channelAdmin.impostaHome>[0]) => client.channelAdmin.impostaHome(v));
export const useImportaDaStaging = mutazione((v: Parameters<typeof client.channelAdmin.importaDaStaging>[0]) => client.channelAdmin.importaDaStaging(v));
