import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { client, orpc } from "../lib/api";
import type { CanaleTouchId, RubricaId } from "../../api/data/touch-canali";

/**
 * TOUCH RADIO / TOUCH TV — letture e comandi dei due canali.
 * Il palinsesto arriva sempre dal server: il browser non calcola nulla.
 */

export function useInfoCanali() {
  return useQuery({ ...orpc.canaliTouch.info.queryOptions(), staleTime: 60_000 });
}

/** Scaletta di un giorno per un canale. Senza data: oggi. */
export function usePalinsestoCanale(canale: CanaleTouchId, giorno?: string) {
  return useQuery({
    ...orpc.canaliTouch.palinsesto.queryOptions({ input: giorno ? { canale, giorno } : { canale } }),
    staleTime: 60_000,
  });
}

/** In onda adesso su entrambi i canali (carosello SEGUI LA DIRETTA ORA). */
export function useDirettaCanali() {
  return useQuery({ ...orpc.canaliTouch.diretta.queryOptions(), refetchInterval: 30_000 });
}

export function useRubrica(id: RubricaId | null) {
  return useQuery({
    ...orpc.canaliTouch.rubrica.queryOptions({ input: { id: id ?? "touch-music" } }),
    enabled: !!id,
    staleTime: 60_000,
  });
}

export type EventoCanale = Parameters<typeof client.canaliTouch.registra>[0];

/** Evento reale del player: nessun errore deve mai fermare la riproduzione. */
export function registraEventoCanale(v: EventoCanale) {
  void client.canaliTouch.registra(v).catch(() => undefined);
}

/* ── pannello riservato ─────────────────────────────────────────────────────── */

export function useStatoCanaliAdmin(codice: string) {
  return useQuery({
    ...orpc.canaliTouchAdmin.stato.queryOptions({ input: { codice } }),
    enabled: codice.trim().length > 0,
    retry: false,
  });
}

export function useRendicontoCanali(codice: string, da?: string, a?: string) {
  return useQuery({
    ...orpc.canaliTouchAdmin.rendiconto.queryOptions({ input: { codice, da, a } }),
    enabled: codice.trim().length > 0,
    retry: false,
  });
}

function useInvalida() {
  const qc = useQueryClient();
  return () => {
    void qc.invalidateQueries({ queryKey: orpc.canaliTouchAdmin.key() });
    void qc.invalidateQueries({ queryKey: orpc.canaliTouch.key() });
  };
}

export function useImpostaModalita() {
  const invalida = useInvalida();
  return useMutation({
    mutationFn: (v: Parameters<typeof client.canaliTouchAdmin.impostaModalita>[0]) =>
      client.canaliTouchAdmin.impostaModalita(v),
    onSuccess: invalida,
  });
}

export type NuovoSpazio = Parameters<typeof client.canaliTouchAdmin.aggiungiSpazio>[0]["spazio"];

export function useAggiungiSpazio() {
  const invalida = useInvalida();
  return useMutation({
    mutationFn: (v: Parameters<typeof client.canaliTouchAdmin.aggiungiSpazio>[0]) =>
      client.canaliTouchAdmin.aggiungiSpazio(v),
    onSuccess: invalida,
  });
}

export function useAttivaSpazio() {
  const invalida = useInvalida();
  return useMutation({
    mutationFn: (v: Parameters<typeof client.canaliTouchAdmin.attivaSpazio>[0]) =>
      client.canaliTouchAdmin.attivaSpazio(v),
    onSuccess: invalida,
  });
}

export function useEliminaSpazio() {
  const invalida = useInvalida();
  return useMutation({
    mutationFn: (v: Parameters<typeof client.canaliTouchAdmin.eliminaSpazio>[0]) =>
      client.canaliTouchAdmin.eliminaSpazio(v),
    onSuccess: invalida,
  });
}
