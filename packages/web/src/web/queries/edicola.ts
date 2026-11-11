import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { orpc } from "../lib/api";

/* ────────────────────────────────────────────────────────────────────────────
   EDICOLA TBH — i ganci di lettura delle pagine.

   Le pagine non parlano mai col database: chiedono qui, e qui si chiede al
   servizio `edicola`. Un contenuto ha un solo indirizzo canonico, quindi un
   solo gancio per aprirlo (`useContenutoEdicola`), sia che sia un articolo sia
   che sia un evento.
   ──────────────────────────────────────────────────────────────────────────── */

export function useStrutturaEdicola() {
  return useQuery(orpc.edicola.struttura.queryOptions());
}

export function useHomeEdicola() {
  return useQuery({
    ...orpc.edicola.home.queryOptions(),
    /* Le notizie invecchiano: si rilegge dopo cinque minuti. */
    staleTime: 5 * 60 * 1000,
  });
}

/** Fascia compatta «OGGI SU TBH» per la home del portale. */
export function useOggiSuTbh() {
  return useQuery({
    ...orpc.edicola.oggi.queryOptions(),
    staleTime: 5 * 60 * 1000,
  });
}

export function useCategoriaEdicola(
  slug: string,
  filtri?: { territorio?: string; sottocategoria?: string },
) {
  return useQuery(
    orpc.edicola.categoria.queryOptions({
      input: {
        slug,
        territorio: filtri?.territorio,
        sottocategoria: filtri?.sottocategoria,
      },
    }),
  );
}

export function useContenutoEdicola(slug: string) {
  return useQuery(orpc.edicola.contenuto.queryOptions({ input: { slug } }));
}

export function useOroscopoEdicola(segno?: string) {
  return useQuery(orpc.edicola.oroscopo.queryOptions({ input: { segno } }));
}

export function useGiochiEdicola() {
  return useQuery(orpc.edicola.giochi.queryOptions());
}

/** Elenco pubblico delle fonti: chi sono, se rispondono, cosa è escluso e perché. */
export function useFontiEdicola() {
  return useQuery(orpc.edicola.fonti.queryOptions());
}

/* ── PANNELLO ───────────────────────────────────────────────────────────── */

export function useStatoEdicolaAdmin(codice: string) {
  return useQuery({
    ...orpc.edicolaAdmin.stato.queryOptions({ input: { codice } }),
    enabled: codice.trim().length > 0,
  });
}

export function useContenutiAdmin(
  codice: string,
  filtri?: { categoria?: string; stato?: string; cerca?: string },
) {
  return useQuery({
    ...orpc.edicolaAdmin.contenuti.queryOptions({
      input: { codice, ...filtri },
    }),
    enabled: codice.trim().length > 0,
  });
}

export function useAggiornaFeed() {
  const qc = useQueryClient();
  return useMutation({
    ...orpc.edicolaAdmin.aggiorna.mutationOptions(),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: orpc.edicola.key() });
      void qc.invalidateQueries({ queryKey: orpc.edicolaAdmin.key() });
    },
  });
}

export function useSalvaFonte() {
  const qc = useQueryClient();
  return useMutation({
    ...orpc.edicolaAdmin.salvaFonte.mutationOptions(),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: orpc.edicolaAdmin.key() });
    },
  });
}

export function useSalvaContenutoEdicola() {
  const qc = useQueryClient();
  return useMutation({
    ...orpc.edicolaAdmin.salvaContenuto.mutationOptions(),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: orpc.edicola.key() });
      void qc.invalidateQueries({ queryKey: orpc.edicolaAdmin.key() });
    },
  });
}

export function useAggiornaContenuti() {
  const qc = useQueryClient();
  return useMutation({
    ...orpc.edicolaAdmin.aggiornaContenuti.mutationOptions(),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: orpc.edicola.key() });
      void qc.invalidateQueries({ queryKey: orpc.edicolaAdmin.key() });
    },
  });
}

export function useSalvaOroscopo() {
  const qc = useQueryClient();
  return useMutation({
    ...orpc.edicolaAdmin.salvaOroscopo.mutationOptions(),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: orpc.edicola.key() });
      void qc.invalidateQueries({ queryKey: orpc.edicolaAdmin.key() });
    },
  });
}
