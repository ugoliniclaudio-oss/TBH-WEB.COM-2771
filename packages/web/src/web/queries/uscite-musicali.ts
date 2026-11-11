import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { orpc, client } from "../lib/api";

/**
 * USCITE MUSICALI (04/11/2026, round 16) — una sola scheda di pubblicazione per brano:
 * catalogo, pagina dell'artista, calendario uscite, Channel Touch Music e Radio leggono questa.
 */
export function useUsciteMusicali() {
  return useQuery({ ...orpc.usciteMusicali.elenco.queryOptions(), staleTime: 30_000 });
}

export type UscitaPubblica = NonNullable<ReturnType<typeof useUsciteMusicali>["data"]>["uscite"][number];

/** L'uscita di un brano, se esiste. */
export function useUscitaDelBrano(id: string | null | undefined) {
  const q = useUsciteMusicali();
  return { ...q, uscita: id ? (q.data?.uscite.find((u) => u.id === id) ?? null) : null };
}

export function useUsciteAdmin(codice: string) {
  return useQuery({ ...orpc.usciteMusicaliAdmin.elenco.queryOptions({ input: { codice } }), enabled: !!codice });
}

function useAggiorna() {
  const qc = useQueryClient();
  return () => {
    qc.invalidateQueries({ queryKey: orpc.usciteMusicaliAdmin.key() });
    qc.invalidateQueries({ queryKey: orpc.usciteMusicali.key() });
    qc.invalidateQueries({ queryKey: orpc.catalogoMusicale.key() });
  };
}

export function useSalvaUscita() {
  const aggiorna = useAggiorna();
  return useMutation({
    mutationFn: (v: Parameters<typeof client.usciteMusicaliAdmin.salva>[0]) => client.usciteMusicaliAdmin.salva(v),
    onSuccess: aggiorna,
  });
}

export function useRimuoviUscita() {
  const aggiorna = useAggiorna();
  return useMutation({
    mutationFn: (v: { codice: string; id: string }) => client.usciteMusicaliAdmin.rimuovi(v),
    onSuccess: aggiorna,
  });
}

export function useCreaBranoUscita() {
  const aggiorna = useAggiorna();
  return useMutation({
    mutationFn: (v: Parameters<typeof client.usciteMusicaliAdmin.creaBrano>[0]) => client.usciteMusicaliAdmin.creaBrano(v),
    onSuccess: aggiorna,
  });
}
