import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { orpc } from "../lib/api";

/**
 * PRODOTTI E GADGET — collegamenti al server.
 * Le schede arrivano dal pannello: il browser non inventa prezzi, disponibilità
 * né pulsanti. Dove manca il contenuto, il server risponde vuoto e la pagina
 * scrive IN ALLESTIMENTO.
 */

/* ──────────────── lato pubblico ──────────────── */

export function useVetrinaProdotti() {
  return useQuery(orpc.prodotti.vetrina.queryOptions({ input: {} }));
}

export function useSchedaProdotto(slug: string) {
  return useQuery({
    ...orpc.prodotti.scheda.queryOptions({ input: { slug } }),
    enabled: slug.trim().length > 0,
  });
}

/** Vista, click, apertura WhatsApp, avvio Stripe: righe vere, nessuna stima. */
export function useTracciaProdotto() {
  return useMutation(orpc.prodotti.traccia.mutationOptions());
}

/** Avvia il pagamento con carta della scheda scelta (Payment Link o Price ID). */
export function useAcquistaProdotto() {
  return useMutation(orpc.checkout.creaProdotto.mutationOptions());
}

export function useOrdine(id: number) {
  return useQuery({
    ...orpc.checkout.ordine.queryOptions({ input: { id } }),
    enabled: Number.isFinite(id) && id > 0,
  });
}

/* ──────────────── pannello amministratore ──────────────── */

export function useProdottiAdminStato(codice: string) {
  return useQuery(orpc.prodottiAdmin.stato.queryOptions({ input: { codice } }));
}

export function useProdottiAdmin(codice: string) {
  return useQuery({
    ...orpc.prodottiAdmin.elenco.queryOptions({ input: { codice } }),
    enabled: codice.length > 0,
  });
}

export function useEventiProdotti(codice: string) {
  return useQuery({
    ...orpc.prodottiAdmin.eventi.queryOptions({ input: { codice } }),
    enabled: codice.length > 0,
  });
}

function useInvalida() {
  const qc = useQueryClient();
  return () => {
    qc.invalidateQueries({ queryKey: orpc.prodottiAdmin.elenco.key() });
    qc.invalidateQueries({ queryKey: orpc.prodottiAdmin.eventi.key() });
    qc.invalidateQueries({ queryKey: orpc.prodotti.vetrina.key() });
    qc.invalidateQueries({ queryKey: orpc.prodotti.scheda.key() });
  };
}

export function useSalvaProdotto() {
  const invalida = useInvalida();
  return useMutation({ ...orpc.prodottiAdmin.salva.mutationOptions(), onSuccess: invalida });
}

export function useDuplicaProdotto() {
  const invalida = useInvalida();
  return useMutation({ ...orpc.prodottiAdmin.duplica.mutationOptions(), onSuccess: invalida });
}

export function useEliminaProdotto() {
  const invalida = useInvalida();
  return useMutation({ ...orpc.prodottiAdmin.elimina.mutationOptions(), onSuccess: invalida });
}
