import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { client, orpc } from "../lib/api";

/** TOUCH SOCIAL — directory pubblica, voci collegate a Channel/pagine, conteggi dei clic e pannello. */

export function useTouchSocial() {
  return useQuery({ ...orpc.touchSocial.elenco.queryOptions(), staleTime: 60_000 });
}

export function useSocialCollegati(sel: { channel?: string; pagina?: string }) {
  return useQuery({
    ...orpc.touchSocial.collegati.queryOptions({ input: sel }),
    staleTime: 60_000,
    enabled: !!(sel.channel || sel.pagina),
  });
}

export type ElencoTouchSocial = Awaited<ReturnType<typeof client.touchSocial.elenco>>;
export type VoceTouchSocial = ElencoTouchSocial["voci"][number];
export type AzioneSocial = Parameters<typeof client.touchSocial.registraClic>[0]["azione"];

/** Solo un conteggio aggregato per voce e azione: nessun dato del visitatore. */
export const registraClicSocial = (id: string, azione: AzioneSocial) => {
  void client.touchSocial.registraClic({ id, azione }).catch(() => null);
};

export function useQuadroSocial(codice: string) {
  return useQuery({
    ...orpc.touchSocialAdmin.quadro.queryOptions({ input: { codice } }),
    enabled: codice.trim().length > 0,
    retry: false,
  });
}
export type QuadroSocial = Awaited<ReturnType<typeof client.touchSocialAdmin.quadro>>;
export type VoceSocialAdmin = QuadroSocial["voci"][number];

function mutazione<A, R>(fn: (a: A) => Promise<R>) {
  return function useMutazione() {
    const qc = useQueryClient();
    return useMutation({
      mutationFn: fn,
      onSuccess: () => {
        void qc.invalidateQueries({ queryKey: orpc.touchSocialAdmin.key() });
        void qc.invalidateQueries({ queryKey: orpc.touchSocial.key() });
      },
    });
  };
}
type P<K extends keyof typeof client.touchSocialAdmin> = Parameters<(typeof client.touchSocialAdmin)[K]>[0];

export const useSalvaSocial = mutazione((v: P<"salva">) => client.touchSocialAdmin.salva(v));
export const useRimuoviSocial = mutazione((v: P<"rimuovi">) => client.touchSocialAdmin.rimuovi(v));
export const useRipristinaSocial = mutazione((v: P<"ripristina">) => client.touchSocialAdmin.ripristina(v));
export const useImportaSocial = mutazione((v: P<"importaUrl">) => client.touchSocialAdmin.importaUrl(v));
export const useMetadatiSocial = mutazione((v: P<"metadati">) => client.touchSocialAdmin.metadati(v));
export const useVerificaSocial = mutazione((v: P<"verificaLink">) => client.touchSocialAdmin.verificaLink(v));
export const useOrdinaSocial = mutazione((v: P<"ordina">) => client.touchSocialAdmin.ordina(v));
