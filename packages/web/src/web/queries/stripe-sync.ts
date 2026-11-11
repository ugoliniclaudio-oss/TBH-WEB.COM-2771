import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { orpc } from "../lib/api";

/**
 * SINCRONIZZAZIONE STRIPE → TOUCH PLAZA — collegamenti al server (03/10/2026).
 * Le chiavi Stripe non passano mai di qui: il pannello vede solo le parti finali.
 */

/** Acquisto di una variante: Payment Link di quel prezzo o Checkout Session del server. */
export function useAcquistaStripe() {
  return useMutation(orpc.stripeSync.acquista.mutationOptions());
}

export function useStatoStripeSync(codice: string) {
  return useQuery({
    ...orpc.stripeSync.stato.queryOptions({ input: { codice } }),
    enabled: codice.length > 0,
    retry: false,
  });
}

/** Dopo ogni modifica: si rileggono pannello e negozio. */
function useAggiorna() {
  const qc = useQueryClient();
  return () => {
    qc.invalidateQueries({ queryKey: orpc.stripeSync.key() });
    qc.invalidateQueries({ queryKey: orpc.catalog.key() });
  };
}

export function useSincronizzaOra() {
  const aggiorna = useAggiorna();
  return useMutation(orpc.stripeSync.sincronizzaOra.mutationOptions({ onSuccess: aggiorna }));
}

export function useCollegaAccount() {
  const aggiorna = useAggiorna();
  return useMutation(orpc.stripeSync.collegaAccount.mutationOptions({ onSuccess: aggiorna }));
}

export function useScollegaAccount() {
  const aggiorna = useAggiorna();
  return useMutation(orpc.stripeSync.scollegaAccount.mutationOptions({ onSuccess: aggiorna }));
}

export function useAssociaStripe() {
  const aggiorna = useAggiorna();
  return useMutation(orpc.stripeSync.associa.mutationOptions({ onSuccess: aggiorna }));
}

export function useSalvaEditorialeStripe() {
  const aggiorna = useAggiorna();
  return useMutation(orpc.stripeSync.salvaEditoriale.mutationOptions({ onSuccess: aggiorna }));
}
