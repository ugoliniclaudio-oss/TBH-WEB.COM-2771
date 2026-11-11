import { useQuery } from "@tanstack/react-query";
import { orpc } from "../lib/api";

/**
 * TELECOMANDO CANALI — letture del pannello e delle pagine-canale (solo anteprima).
 * Lo stato (ON AIR / REPLICA / CONTENUTI DISPONIBILI / IN ALLESTIMENTO) lo calcola il
 * server sull'ora di Roma: si rilegge ogni minuto per seguire dirette e repliche DM.
 */
export function useTelecomando() {
  return useQuery({ ...orpc.telecomando.canali.queryOptions(), refetchInterval: 60_000 });
}

export function useCanaleTelecomando(slug: string) {
  return useQuery({ ...orpc.telecomando.canale.queryOptions({ input: { slug } }), refetchInterval: 60_000 });
}
