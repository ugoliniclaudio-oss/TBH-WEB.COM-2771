import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { orpc } from "../lib/api";

/* ────────────────────────────────────────────────────────────────────────────
   TOUCH MISS COOL — i ganci di lettura e scrittura delle pagine.

   Le pagine del concorso non conoscono il database e non riscrivono a mano né
   il regolamento né la classifica: chiedono qui, e qui si chiede al servizio
   `missCool`, che legge il Kit Digitale 2027 da api/data/miss-cool.ts.

   Conseguenza pratica: se un importo è «DA DEFINIRE» nel Kit, è «DA DEFINIRE»
   in pagina. Nessuna pagina può inventarlo, perché nessuna pagina lo possiede.
   ──────────────────────────────────────────────────────────────────────────── */

/** Il Kit completo: concorso, percorsi, 11 premiazioni, piani, roadmap, slide. */
export function useKitMissCool() {
  return useQuery(orpc.missCool.kit.queryOptions());
}

/** I 18 articoli del regolamento. */
export function useRegolamentoMissCool() {
  return useQuery(orpc.missCool.regolamento.queryOptions());
}

/** Liberatoria e i sei consensi separati A–F. */
export function useLiberatoriaMissCool() {
  return useQuery(orpc.missCool.liberatoria.queryOptions());
}

/** I moduli del Kit: adesione, portfolio, accettazione dell'incarico. */
export function useModuliMissCool() {
  return useQuery(orpc.missCool.moduli.queryOptions());
}

/**
 * Le schede pubbliche delle candidate.
 * Parte vuota e lo dichiara: escono solo le candidature approvate, pubblicate
 * e con il consenso B alla pubblicazione. Nessun profilo di esempio.
 */
export function useSchedeMissCool(edizione?: string) {
  return useQuery(orpc.missCool.schede.queryOptions({ input: { edizione } }));
}

/** Una singola scheda candidata, se pubblicata. */
export function useSchedaMissCool(slug: string) {
  return useQuery({
    ...orpc.missCool.scheda.queryOptions({ input: { slug } }),
    enabled: slug.length > 0,
  });
}

/**
 * INVIO DELLA DOMANDA DI PARTECIPAZIONE.
 * A invio riuscito si rilegge il Kit (che porta il conteggio delle candidature)
 * e l'elenco delle schede, così i numeri in pagina sono quelli veri.
 */
export function useInviaCandidatura() {
  const qc = useQueryClient();
  return useMutation(
    orpc.missCool.candidati.mutationOptions({
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: orpc.missCool.kit.queryKey() });
        qc.invalidateQueries({ queryKey: orpc.missCool.schede.key() });
      },
    }),
  );
}

/* ─── PANNELLO RISERVATO ──────────────────────────────────────────────────── */

/**
 * Elenco completo delle candidature per la redazione.
 * Serve il codice di allestimento: senza codice non si interroga nemmeno.
 */
export function useCandidatureMissCool(codice: string) {
  return useQuery({
    ...orpc.missCoolAdmin.elenco.queryOptions({ input: { codice } }),
    enabled: codice.trim().length > 0,
    retry: false,
  });
}

/** Avanza una candidatura nel flusso di back office. */
export function useAggiornaCandidatura() {
  const qc = useQueryClient();
  return useMutation(
    orpc.missCoolAdmin.aggiorna.mutationOptions({
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: orpc.missCoolAdmin.elenco.key() });
        qc.invalidateQueries({ queryKey: orpc.missCool.schede.key() });
        qc.invalidateQueries({ queryKey: orpc.missCool.kit.queryKey() });
      },
    }),
  );
}
