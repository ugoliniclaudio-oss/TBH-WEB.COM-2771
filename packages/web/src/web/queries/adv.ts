import { useMutation, useQuery } from "@tanstack/react-query";
import { useQueryClient } from "@tanstack/react-query";
import { orpc } from "../lib/api";

/**
 * TBH TV & STREAMING ADV — collegamenti al server.
 *
 * Il browser non calcola mai un prezzo: chiede il listino, chiede il preventivo e riceve
 * la fascia già decisa dal server. Lo stesso vale per la Fidelity: qui si manda solo il
 * dato da verificare, l'esito arriva dal registro TBH.
 */

export function useAdvStato() {
  return useQuery(orpc.adv.stato.queryOptions());
}

export function useAdvListino() {
  return useQuery(orpc.adv.listino.queryOptions());
}

export function useVerificaFidelity() {
  return useMutation(orpc.adv.verificaFidelity.mutationOptions());
}

export function useAdvPreventivo() {
  return useMutation(orpc.adv.preventivo.mutationOptions());
}

export function useAdvAcquista() {
  return useMutation(orpc.adv.acquista.mutationOptions());
}

export function useMieCampagne() {
  return useMutation(orpc.adv.mieCampagne.mutationOptions());
}

/* ————— PANNELLO AMMINISTRATORE ————— */

export function useAdvAdminStato(codice: string) {
  return useQuery(orpc.advAdmin.stato.queryOptions({ input: { codice } }));
}

export function useAdvAdminListino(codice: string) {
  return useQuery({
    ...orpc.advAdmin.listino.queryOptions({ input: { codice } }),
    enabled: codice.length > 0,
  });
}

export function useAdvAdminFidelity(codice: string) {
  return useQuery({
    ...orpc.advAdmin.fidelityElenco.queryOptions({ input: { codice } }),
    enabled: codice.length > 0,
  });
}

export function useAdvAdminPratiche(codice: string) {
  return useQuery({
    ...orpc.advAdmin.pratiche.queryOptions({ input: { codice } }),
    enabled: codice.length > 0,
  });
}

function useInvalidaAdv() {
  const qc = useQueryClient();
  return () => {
    qc.invalidateQueries({ queryKey: orpc.advAdmin.listino.key() });
    qc.invalidateQueries({ queryKey: orpc.advAdmin.fidelityElenco.key() });
    qc.invalidateQueries({ queryKey: orpc.advAdmin.pratiche.key() });
    qc.invalidateQueries({ queryKey: orpc.adv.listino.key() });
  };
}

export function useSalvaPacchettoAdv() {
  const invalida = useInvalidaAdv();
  return useMutation({ ...orpc.advAdmin.salvaPacchetto.mutationOptions(), onSuccess: invalida });
}

export function useSalvaAddonAdv() {
  const invalida = useInvalidaAdv();
  return useMutation({ ...orpc.advAdmin.salvaAddon.mutationOptions(), onSuccess: invalida });
}

export function useSalvaFidelityAdv() {
  const invalida = useInvalidaAdv();
  return useMutation({ ...orpc.advAdmin.fidelitySalva.mutationOptions(), onSuccess: invalida });
}

export function useEliminaFidelityAdv() {
  const invalida = useInvalidaAdv();
  return useMutation({ ...orpc.advAdmin.fidelityElimina.mutationOptions(), onSuccess: invalida });
}

export function useAggiornaPraticaAdv() {
  const invalida = useInvalidaAdv();
  return useMutation({ ...orpc.advAdmin.aggiornaPratica.mutationOptions(), onSuccess: invalida });
}

export function useSincronizzaStripeAdv() {
  const invalida = useInvalidaAdv();
  return useMutation({ ...orpc.advAdmin.sincronizzaStripe.mutationOptions(), onSuccess: invalida });
}
