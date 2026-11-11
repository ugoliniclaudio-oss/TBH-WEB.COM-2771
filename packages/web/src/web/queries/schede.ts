import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { orpc, client } from "../lib/api";
import type { StatoScheda } from "../../api/data/sezioni-amministrabili";

/**
 * SCHEDE AMMINISTRABILI — lato pannello.
 *
 * Gli stessi hook per tutte le sezioni del sito: leggi i contenuti di una sezione,
 * creane uno nuovo, modifica i campi, cambia stato (bozza → anteprima → pubblicato →
 * archiviato), riordina, elimina con avviso. Le immagini non passano da qui: restano
 * al Media Manager (`queries/media.ts`), agganciate agli slot della scheda.
 */

/** L'elenco delle sezioni amministrabili con quanti contenuti hanno. */
export function useSezioniAmministrabili(codice?: string) {
  return useQuery(orpc.schede.sezioni.queryOptions({ input: { codice: codice || undefined } }));
}

/**
 * I contenuti di una sezione. Senza codice arrivano solo i PUBBLICATI: bozze e
 * anteprime restano invisibili al pubblico, il filtro è sul server.
 */
export function useSchede(
  sezione: string,
  opzioni?: { codice?: string; stato?: StatoScheda; q?: string },
) {
  return useQuery(
    orpc.schede.elenco.queryOptions({
      input: {
        sezione,
        codice: opzioni?.codice || undefined,
        stato: opzioni?.stato,
        q: opzioni?.q?.trim() || undefined,
      },
    }),
  );
}

/** Una scheda singola, per chiave oppure per sezione + slug (indirizzi delle pagine). */
export function useScheda(
  riferimento: { chiave?: string; sezione?: string; slug?: string },
  codice?: string,
) {
  const abilitata = Boolean(riferimento.chiave || (riferimento.sezione && riferimento.slug));
  return useQuery({
    ...orpc.schede.dettaglio.queryOptions({
      input: { ...riferimento, codice: codice || undefined },
    }),
    enabled: abilitata,
  });
}

/** Quanti materiali (copertina, gallery, allegati) sono agganciati a una scheda. */
export function useMaterialiScheda(chiave: string, codice?: string) {
  return useQuery({
    ...orpc.schede.materiali.queryOptions({ input: { chiave, codice: codice || undefined } }),
    enabled: chiave.length > 0,
  });
}

function invalida(qc: ReturnType<typeof useQueryClient>) {
  qc.invalidateQueries({ queryKey: orpc.schede.key() });
}

export type DatiScheda = {
  titolo?: string;
  sottotitolo?: string | null;
  descrizione?: string | null;
  testo?: string | null;
  data?: string | null;
  categoria?: string | null;
  contatti?: string | null;
  telefono?: string | null;
  email?: string | null;
  luogo?: string | null;
  indirizzo?: string | null;
  mapsUrl?: string | null;
  linkUrl?: string | null;
  pulsanti?: { testo: string; url: string }[];
  campi?: Record<string, string>;
  notaInterna?: string | null;
  riservato?: boolean;
  ordine?: number;
};

/**
 * SALVA: crea (senza `chiave`) o aggiorna (con `chiave`). Alla creazione serve solo
 * il titolo — il resto si riempie anche in un altro momento.
 */
export function useSalvaScheda() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (v: { codice: string; sezione: string; chiave?: string; slug?: string; dati: DatiScheda }) =>
      client.schede.salva(v),
    onSuccess: () => invalida(qc),
  });
}

/** Ciclo di stato: bozza → anteprima → pubblicato → archiviato. */
export function useCambiaStatoScheda() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (v: { codice: string; chiave: string; stato: StatoScheda }) =>
      client.schede.cambiaStato(v),
    onSuccess: () => invalida(qc),
  });
}

/** Ordine di comparsa dei contenuti dentro la sezione. */
export function useRiordinaSchede() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (v: { codice: string; chiavi: string[] }) => client.schede.riordina(v),
    onSuccess: () => invalida(qc),
  });
}

/**
 * ELIMINA con avviso: la prima chiamata senza `forza` risponde quanti materiali
 * resterebbero senza scheda, così l'avviso mostrato è un dato vero.
 */
export function useEliminaScheda() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (v: { codice: string; chiave: string; forza?: boolean }) =>
      client.schede.elimina(v),
    onSuccess: () => invalida(qc),
  });
}
