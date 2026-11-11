import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { orpc } from "../lib/api";

/**
 * CAMPAGNE DEI MONITOR — collegamenti al server.
 * Il browser non decide quale campagna è in onda: chiede al server quelle ammesse
 * per tema, spazio e dispositivo, e registra viste e click reali.
 */

/*
 * Per le campagne di uno spazio si usa `useCampagneSpazio` di
 * `../components/spazio-pubblicitario`: tiene già conto del dispositivo,
 * della frequenza per visita e della riserva TBH. Qui non si duplica.
 */

export function useCampagneAdminStato(codice: string) {
  return useQuery(orpc.campagneAdmin.stato.queryOptions({ input: { codice } }));
}

export function useCampagneAdmin(codice: string) {
  return useQuery({
    ...orpc.campagneAdmin.elenco.queryOptions({ input: { codice } }),
    enabled: codice.length > 0,
  });
}

export function useEventiCampagne(codice: string) {
  return useQuery({
    ...orpc.campagneAdmin.eventi.queryOptions({ input: { codice } }),
    enabled: codice.length > 0,
  });
}

function useInvalida() {
  const qc = useQueryClient();
  return () => {
    qc.invalidateQueries({ queryKey: orpc.campagneAdmin.elenco.key() });
    qc.invalidateQueries({ queryKey: orpc.campagneAdmin.eventi.key() });
    qc.invalidateQueries({ queryKey: orpc.campagne.perSpazio.key() });
  };
}

export function useSalvaCampagna() {
  const invalida = useInvalida();
  return useMutation({ ...orpc.campagneAdmin.salva.mutationOptions(), onSuccess: invalida });
}

export function useEliminaCampagna() {
  const invalida = useInvalida();
  return useMutation({ ...orpc.campagneAdmin.elimina.mutationOptions(), onSuccess: invalida });
}

/** 28/10/2026 — accende/spegne a mano una promo di riserva (es. Offerta 122 €). */
export function useRiservaAttiva() {
  const invalida = useInvalida();
  return useMutation({ ...orpc.campagneAdmin.riservaAttiva.mutationOptions(), onSuccess: invalida });
}
