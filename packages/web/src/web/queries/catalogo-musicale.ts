import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { orpc, client } from "../lib/api";
import type { StatoScheda, TipoSorgente, Piattaforma } from "../../api/data/sorgenti-musicali";

/**
 * CATALOGO MUSICALE — lato pagine (correzione del 29/09/2026).
 *
 * Un brano è il record principale: audio, videoclip, copertina, versioni e casting
 * sono sorgenti e contenuti agganciati allo stesso brano. Il catalogo pubblico e il
 * pannello leggono lo stesso elenco: cambia solo il filtro.
 */
export function useCatalogoMusicale() {
  return useQuery(orpc.catalogoMusicale.catalogo.queryOptions({ input: {} }));
}

/** Il catalogo con le viste di servizio: solo con il codice di allestimento. */
export function usePannelloMusicale(codice: string) {
  return useQuery({
    ...orpc.catalogoMusicale.pannello.queryOptions({ input: { codice } }),
    enabled: !!codice,
  });
}

/** La scheda pubblica di un singolo brano. */
export function useBranoMusicale(id: string) {
  return useQuery({
    ...orpc.catalogoMusicale.brano.queryOptions({ input: { id } }),
    enabled: !!id,
    // 04/11/2026: un brano che non c'è non si richiede tre volte (pagina «Brano non trovato» subito).
    retry: (n: number, e: unknown) => (e as { code?: string })?.code !== "NOT_FOUND" && n < 2,
  });
}

/** ANALIZZA — prova a vuoto: conta gli indirizzi e segnala i già presenti. */
export function useAnalizzaIndirizzi() {
  return useMutation({
    mutationFn: (v: { codice: string; testo: string }) => client.catalogoMusicale.analizza(v),
  });
}

/** IMPORTA — uno o molti indirizzi in una volta, con controllo duplicati. */
export function useImportaIndirizzi() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (v: {
      codice: string;
      testo: string;
      tornata?: string;
      tipo?: TipoSorgente;
      versione?: string | null;
    }) => client.catalogoMusicale.importa(v),
    onSuccess: () => qc.invalidateQueries({ queryKey: orpc.catalogoMusicale.key() }),
  });
}

/** Completa o corregge a mano la scheda di un brano importato. */
export function useAggiornaBrano() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (v: {
      codice: string;
      id: string;
      titolo?: string;
      artista?: string | null;
      cover?: string | null;
      genere?: string | null;
      anno?: string | null;
      descrizione?: string | null;
      notaInterna?: string | null;
      stato?: StatoScheda;
      nascosto?: boolean;
    }) => client.catalogoMusicale.aggiornaBrano(v),
    onSuccess: () => qc.invalidateQueries({ queryKey: orpc.catalogoMusicale.key() }),
  });
}

/** + AGGIUNGI SORGENTE — un altro indirizzo per lo stesso brano. */
export function useAggiungiSorgente() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (v: {
      codice: string;
      branoId: string;
      url: string;
      tipo?: TipoSorgente;
      piattaforma?: Piattaforma;
      versione?: string | null;
      cover?: string | null;
      nota?: string | null;
      principale?: boolean;
    }) => client.catalogoMusicale.aggiungiSorgente(v),
    onSuccess: () => qc.invalidateQueries({ queryKey: orpc.catalogoMusicale.key() }),
  });
}

/** Cambia tipo, versione, nota o copertina di una sorgente già agganciata. */
export function useAggiornaSorgente() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (v: {
      codice: string;
      id: number;
      tipo?: TipoSorgente;
      piattaforma?: Piattaforma;
      versione?: string | null;
      cover?: string | null;
      nota?: string | null;
      principale?: boolean;
    }) => client.catalogoMusicale.aggiornaSorgente(v),
    onSuccess: () => qc.invalidateQueries({ queryKey: orpc.catalogoMusicale.key() }),
  });
}

/** Stacca una sorgente dal brano: il brano resta, con le altre sorgenti. */
export function useRimuoviSorgente() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (v: { codice: string; id: number }) => client.catalogoMusicale.rimuoviSorgente(v),
    onSuccess: () => qc.invalidateQueries({ queryKey: orpc.catalogoMusicale.key() }),
  });
}

/** Unisce due schede dello stesso brano: le sorgenti passano a quella che si tiene. */
export function useUnisciBrani() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (v: { codice: string; tieni: string; unisci: string }) =>
      client.catalogoMusicale.unisciBrani(v),
    onSuccess: () => qc.invalidateQueries({ queryKey: orpc.catalogoMusicale.key() }),
  });
}

/** Elimina una scheda importata per errore, con le sue sorgenti. */
export function useEliminaBrano() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (v: { codice: string; id: string }) => client.catalogoMusicale.eliminaBrano(v),
    onSuccess: () => qc.invalidateQueries({ queryKey: orpc.catalogoMusicale.key() }),
  });
}
