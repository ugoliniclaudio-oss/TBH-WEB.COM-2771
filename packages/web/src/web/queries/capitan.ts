import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { orpc } from "../lib/api";

/* ─────────────── LATO GIOCATORE ─────────────── */

/** Tentativi che restano oggi, neuroni raccolti, contatore dei Neuroni d'Oro. */
export function useStatoCapitan(giocatore: string) {
  return useQuery({
    ...orpc.capitan.stato.queryOptions({ input: { giocatore } }),
    enabled: giocatore.length >= 6,
  });
}

/** Contatore pubblico: 5 → 4 → 3 → 2 → 1 → ESAURITI, senza dire in quale pagina sono. */
export function useContatoreOro() {
  return useQuery(orpc.capitan.contatoreOro.queryOptions());
}

/** Elenco dei neuroni trovati dal giocatore. */
export function usePortafoglioCapitan(giocatore: string) {
  return useQuery({
    ...orpc.capitan.portafoglio.queryOptions({ input: { giocatore } }),
    enabled: giocatore.length >= 6,
  });
}

function useInvalidaGioco() {
  const qc = useQueryClient();
  return () => {
    qc.invalidateQueries({ queryKey: orpc.capitan.stato.key() });
    qc.invalidateQueries({ queryKey: orpc.capitan.portafoglio.key() });
    qc.invalidateQueries({ queryKey: orpc.capitan.contatoreOro.key() });
  };
}

/**
 * Chiede al server se in questa pagina Capitan Touch si fa vedere.
 * Decide il server: pagina autorizzata, probabilità e limite giornaliero.
 */
export function useApparizione() {
  return useMutation(orpc.capitan.apparizione.mutationOptions());
}

/** L'utente è stato svelto e ha cliccato prima che scappasse. */
export function useCattura() {
  const invalida = useInvalidaGioco();
  return useMutation({ ...orpc.capitan.cattura.mutationOptions(), onSuccess: invalida });
}

/** L'utente segna un premio come utilizzato/riscattato. */
export function useSegnaUsato() {
  const invalida = useInvalidaGioco();
  return useMutation({ ...orpc.capitan.segnaUsato.mutationOptions(), onSuccess: invalida });
}

/* ─────────────── PANNELLO AMMINISTRATORE ─────────────── */

export function useCapitanElenco(codice: string) {
  return useQuery({
    ...orpc.capitan.adminElenco.queryOptions({ input: { codice } }),
    enabled: codice.length > 0,
  });
}

export function useCapitanStatistiche(codice: string) {
  return useQuery({
    ...orpc.capitan.adminStatistiche.queryOptions({ input: { codice } }),
    enabled: codice.length > 0,
  });
}

export function useCapitanVincitori(codice: string) {
  return useQuery({
    ...orpc.capitan.adminVincitori.queryOptions({ input: { codice } }),
    enabled: codice.length > 0,
  });
}

function useInvalidaPannello() {
  const qc = useQueryClient();
  return () => {
    qc.invalidateQueries({ queryKey: orpc.capitan.adminElenco.key() });
    qc.invalidateQueries({ queryKey: orpc.capitan.adminStatistiche.key() });
    qc.invalidateQueries({ queryKey: orpc.capitan.adminVincitori.key() });
    qc.invalidateQueries({ queryKey: orpc.capitan.contatoreOro.key() });
  };
}

export function useSalvaCaccia() {
  const invalida = useInvalidaPannello();
  return useMutation({ ...orpc.capitan.adminSalvaCaccia.mutationOptions(), onSuccess: invalida });
}

export function useAttivaCaccia() {
  const invalida = useInvalidaPannello();
  return useMutation({ ...orpc.capitan.adminAttiva.mutationOptions(), onSuccess: invalida });
}

export function useSalvaPosizione() {
  const invalida = useInvalidaPannello();
  return useMutation({ ...orpc.capitan.adminSalvaPosizione.mutationOptions(), onSuccess: invalida });
}

export function useEliminaPosizione() {
  const invalida = useInvalidaPannello();
  return useMutation({
    ...orpc.capitan.adminEliminaPosizione.mutationOptions(),
    onSuccess: invalida,
  });
}

export function useSalvaPremio() {
  const invalida = useInvalidaPannello();
  return useMutation({ ...orpc.capitan.adminSalvaPremio.mutationOptions(), onSuccess: invalida });
}

export function useEliminaPremio() {
  const invalida = useInvalidaPannello();
  return useMutation({ ...orpc.capitan.adminEliminaPremio.mutationOptions(), onSuccess: invalida });
}
