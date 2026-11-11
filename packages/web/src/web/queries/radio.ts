import { useQuery } from "@tanstack/react-query";
import { orpc } from "../lib/api";

/**
 * J.C. HUGÒ RADIO — lato pagine. Le stesse tre letture servono al sito, all'app
 * futura e alla TV: nessun palinsesto calcolato nel browser.
 */

/** La scaletta di un giorno (ora di Roma). Senza data: oggi. */
export function usePalinsestoRadio(giorno?: string) {
  return useQuery({
    ...orpc.radio.palinsesto.queryOptions({ input: giorno ? { giorno } : {} }),
    staleTime: 10 * 60_000,
  });
}

/** In onda adesso: elemento corrente e prossimi. Si aggiorna ogni 30 secondi. */
export function useInOndaRadio() {
  return useQuery({
    ...orpc.radio.inOnda.queryOptions(),
    refetchInterval: 30_000,
  });
}

/** La settimana, le regole, i programmi DM, gli spot e lo stato dell'app. */
export function useSettimanaRadio() {
  return useQuery({ ...orpc.radio.settimana.queryOptions(), staleTime: 10 * 60_000 });
}
