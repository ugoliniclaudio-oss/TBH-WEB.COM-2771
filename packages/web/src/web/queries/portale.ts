import { useQuery } from "@tanstack/react-query";
import { orpc } from "../lib/api";

export function useSquadre() {
  return useQuery(orpc.portale.squadre.queryOptions());
}

export function useSquadra(slug: string) {
  return useQuery(orpc.portale.squadra.queryOptions({ input: { slug } }));
}

/**
 * PARTITE IN EVIDENZA — vetrina della home: partite con almeno un monitor acceso,
 * aggregate su tutte le società seguite (stessi `match_id` della pagina società).
 */
export function usePartiteInEvidenza(massimo?: number) {
  return useQuery(
    orpc.portale.partiteInEvidenza.queryOptions({
      input: massimo ? { massimo } : {},
    }),
  );
}

export function useSanremo() {
  return useQuery(orpc.portale.sanremo.queryOptions());
}

export function useLuogoSanremo(slug: string) {
  return useQuery(orpc.portale.luogoSanremo.queryOptions({ input: { slug } }));
}

export function useMusica() {
  return useQuery(orpc.portale.musica.queryOptions());
}

export function useDmCrew() {
  return useQuery(orpc.portale.dmCrew.queryOptions());
}

export function useDmVideo() {
  return useQuery(orpc.portale.dmVideo.queryOptions());
}

export function useTouchMusic() {
  return useQuery(orpc.portale.touchMusic.queryOptions());
}
