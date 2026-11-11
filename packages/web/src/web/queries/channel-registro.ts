import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { client, orpc } from "../lib/api";

/**
 * REGISTRO DEI CHANNEL (28/10/2026) — pagina /channel a 5 sezioni e schede /channel/scheda/<slug>.
 * Stato dei palinsesti calcolato dal server; gli spazi vuoti si compilano col codice di allestimento.
 */
export function useRegistroChannel() {
  return useQuery({ ...orpc.channelRegistro.elenco.queryOptions(), staleTime: 30_000, refetchInterval: 60_000 });
}

export type ChannelDelRegistro = NonNullable<ReturnType<typeof useRegistroChannel>["data"]>["channel"][number];

export function useImpostaSpazio() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (v: Parameters<typeof client.channelRegistroAdmin.impostaSpazio>[0]) => client.channelRegistroAdmin.impostaSpazio(v),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: orpc.channelRegistro.key() });
    },
  });
}

/**
 * 28/10/2026 (round 14) — anteprima del palinsesto di un Channel (card, monitor e player /channel/play/<slug>).
 * `attiva` = la card è sullo schermo: le card fuori vista non chiedono nulla.
 */
export function useAnteprimaChannel(slug: string | null, attiva = true) {
  return useQuery({
    ...orpc.channelRegistro.anteprima.queryOptions({ input: { slug: slug ?? "" } }),
    enabled: !!slug && attiva,
    staleTime: 60_000,
    refetchInterval: attiva ? 120_000 : false,
  });
}

export type VoceAnteprimaChannel = NonNullable<ReturnType<typeof useAnteprimaChannel>["data"]>["voci"][number];

/** Regia: logo, sito e collegamenti di un Channel (chiave condivisa cms_v1:canali). */
export function useImpostaExtraChannel() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (v: Parameters<typeof client.channelRegistroAdmin.impostaExtra>[0]) => client.channelRegistroAdmin.impostaExtra(v),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: orpc.channelRegistro.key() });
    },
  });
}

/** 29/10/2026 (round 15) — Regia: scheda informativa di un Channel (separata dal palinsesto). */
export function useImpostaSchedaChannel() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (v: Parameters<typeof client.channelRegistroAdmin.impostaScheda>[0]) => client.channelRegistroAdmin.impostaScheda(v),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: orpc.channelRegistro.key() });
    },
  });
}
