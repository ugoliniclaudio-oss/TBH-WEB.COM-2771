import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { client, orpc } from "../lib/api";

/**
 * TOUCH TALENT & PROFESSIONALS CHANNEL — il palinsesto è calcolato dal server (ora del server):
 * la pagina lo rilegge ogni 60 s e a ogni cambio di monitor, senza interrompere quello in onda.
 */

export function useTouchTalent() {
  return useQuery({
    ...orpc.touchTalent.canale.queryOptions(),
    staleTime: 20_000,
    refetchInterval: 60_000,
    refetchOnWindowFocus: true,
  });
}

export type DatiTalent = Awaited<ReturnType<typeof client.touchTalent.canale>>;
export type MonitorTalent = DatiTalent["monitor"][number];

export const segnalaErroreTalent = (v: Parameters<typeof client.touchTalent.segnalaErrore>[0]) => client.touchTalent.segnalaErrore(v).catch(() => null);
export const segnalaDurataTalent = (v: Parameters<typeof client.touchTalent.segnalaDurata>[0]) => client.touchTalent.segnalaDurata(v).catch(() => null);

export function useQuadroTalent(codice: string) {
  return useQuery({
    ...orpc.touchTalentAdmin.quadro.queryOptions({ input: { codice } }),
    enabled: codice.trim().length > 0,
    retry: false,
    refetchInterval: 30_000,
  });
}
export type QuadroTalent = Awaited<ReturnType<typeof client.touchTalentAdmin.quadro>>;
export type MonitorAdmin = QuadroTalent["monitor"][number];
export type AnalisiTalentUrl = Awaited<ReturnType<typeof client.touchTalentAdmin.analizza>>["esiti"][number];

function mutazione<A, R>(fn: (a: A) => Promise<R>) {
  return function useMutazione() {
    const qc = useQueryClient();
    return useMutation({
      mutationFn: fn,
      onSuccess: () => {
        void qc.invalidateQueries({ queryKey: orpc.touchTalentAdmin.key() });
        void qc.invalidateQueries({ queryKey: orpc.touchTalent.key() });
      },
    });
  };
}
type P<K extends keyof typeof client.touchTalentAdmin> = Parameters<(typeof client.touchTalentAdmin)[K]>[0];

export const useCreaMonitorTalent = mutazione((v: P<"crea">) => client.touchTalentAdmin.crea(v));
export const useAggiornaMonitorTalent = mutazione((v: P<"aggiorna">) => client.touchTalentAdmin.aggiorna(v));
export const useVerificaMonitorTalent = mutazione((v: P<"verifica">) => client.touchTalentAdmin.verifica(v));
export const useStatoMonitorTalent = mutazione((v: P<"stato">) => client.touchTalentAdmin.stato(v));
export const useEliminaMonitorTalent = mutazione((v: P<"elimina">) => client.touchTalentAdmin.elimina(v));
export const useImpostazioniTalent = mutazione((v: P<"impostazioni">) => client.touchTalentAdmin.impostazioni(v));
export const useRigeneraTalent = mutazione((v: P<"rigenera">) => client.touchTalentAdmin.rigenera(v));
export const useSvuotaErroriTalent = mutazione((v: P<"svuotaErrori">) => client.touchTalentAdmin.svuotaErrori(v));
/** Verifica degli URL incollati (non salva nulla). */
export const analizzaUrlTalent = (v: P<"analizza">) => client.touchTalentAdmin.analizza(v);
