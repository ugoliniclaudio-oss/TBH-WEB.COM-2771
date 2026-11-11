import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { orpc, client } from "../lib/api";
import type {
  AmbitoCasting,
  StatoCandidatura,
  StatoCasting,
} from "../../api/data/musica";

/**
 * CASTING VIDEOCLIP — lato pagine (Priorità 2quater).
 *
 * Un solo record master per ogni casting: la pagina Casting videoclip, il carosello
 * «CASTING APERTI», la scheda del brano e la bacheca Lavoro & Casting leggono tutte
 * da qui e cambiano solo il filtro. Nessun annuncio viene copiato due volte.
 */

export type RuoloCercato = {
  ruolo: string;
  categoria: string;
  quantita: string;
  nota: string;
};

/** L'elenco pubblico. `soloAperti` serve al carosello; `ambito` ai filtri della bacheca. */
export function useCastingAperti(v?: { ambito?: AmbitoCasting; soloAperti?: boolean }) {
  return useQuery(orpc.casting.elenco.queryOptions({ input: v ?? {} }));
}

/** La scheda di un singolo casting, per indirizzo pubblico /casting/<slug>. */
export function useSchedaCasting(slug: string) {
  return useQuery({
    ...orpc.casting.scheda.queryOptions({ input: { slug } }),
    enabled: slug.length > 0,
    retry: false,
  });
}

/** L'invio della candidatura: i file sono già stati caricati con la pratica. */
export function useCandidatura() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (v: {
      slug: string;
      ruolo: string;
      categoria?: string;
      nome: string;
      cognome: string;
      dataNascita?: string;
      citta?: string;
      telefono?: string;
      email?: string;
      esperienze?: string;
      presentazione?: string;
      social?: string;
      linkShowreel?: string;
      consensi: string[];
      tokenCaricamento?: string;
    }) => client.casting.candidati(v),
    onSuccess: () => qc.invalidateQueries({ queryKey: orpc.casting.key() }),
  });
}

/* ── BACKOFFICE (serve il codice di allestimento) ────────────────────────── */

/** Il quadro d'insieme del pannello: casting + candidature ricevute. */
export function useQuadroCasting(codice: string) {
  return useQuery({
    ...orpc.casting.quadro.queryOptions({ input: { codice } }),
    enabled: codice.trim().length > 0,
    retry: false,
  });
}

/** Le candidature di un casting, con i file davvero caricati. Mai pubbliche. */
export function useCandidatureCasting(codice: string, castingId: number | null) {
  return useQuery({
    ...orpc.casting.candidature.queryOptions({ input: { codice, castingId: castingId ?? 0 } }),
    enabled: codice.trim().length > 0 && castingId !== null,
    retry: false,
  });
}

export function useSalvaCasting() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (v: {
      codice: string;
      id?: number;
      branoId?: string | null;
      ambito?: AmbitoCasting;
      titolo: string;
      titoloProgetto?: string | null;
      descrizione?: string | null;
      requisiti?: string | null;
      location?: string | null;
      periodo?: string | null;
      scadenza?: string | null;
      produzione?: string | null;
      compenso?: string | null;
      stato?: StatoCasting;
      locandina?: string | null;
      ruoli?: RuoloCercato[];
      nota?: string | null;
    }) => client.casting.salva(v),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: orpc.casting.key() });
      qc.invalidateQueries({ queryKey: orpc.musica.key() });
    },
  });
}

/** Chiuso il casting, l'etichetta CASTING APERTO sparisce da sola dalle schede. */
export function useStatoCasting() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (v: { codice: string; id: number; stato: StatoCasting }) =>
      client.casting.stato(v),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: orpc.casting.key() });
      qc.invalidateQueries({ queryKey: orpc.musica.key() });
    },
  });
}

export function useEliminaCasting() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (v: { codice: string; id: number }) => client.casting.elimina(v),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: orpc.casting.key() });
      qc.invalidateQueries({ queryKey: orpc.musica.key() });
    },
  });
}

/** Sposta una candidatura nella pipeline RICEVUTE → … → SELEZIONATE. */
export function useStatoCandidatura() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (v: {
      codice: string;
      id: number;
      stato?: StatoCandidatura;
      noteInterne?: string | null;
    }) => client.casting.statoCandidatura(v),
    onSuccess: () => qc.invalidateQueries({ queryKey: orpc.casting.key() }),
  });
}
