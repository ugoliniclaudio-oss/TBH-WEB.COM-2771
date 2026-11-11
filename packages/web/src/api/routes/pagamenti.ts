import { base } from "../__core/app";
import {
  METODI,
  TIPI_ORDINE,
  FLUSSO_ACQUISTO,
  PAGAMENTI_NOTA,
  STATO_LABEL,
} from "../data/pagamenti";

/**
 * Area "Modalità di pagamento e finanziamento".
 * Unica fonte per la pagina /pagamenti e per il blocco PagamentiBlock riusato
 * nelle schede prodotto: se si aggiorna l'anagrafica, si aggiornano entrambi.
 */
export const pagamenti = {
  lista: base.handler(() => {
    const stripeAttivo = Boolean(process.env.STRIPE_SECRET_KEY);

    /** Gruppi nell'ordine in cui vanno mostrati, senza gruppi vuoti. */
    const gruppi = TIPI_ORDINE.map((tipo) => ({
      tipo,
      metodi: METODI.filter((m) => m.tipo === tipo),
    })).filter((g) => g.metodi.length > 0);

    return {
      stripeAttivo,
      metodi: METODI,
      gruppi,
      flusso: FLUSSO_ACQUISTO,
      nota: PAGAMENTI_NOTA,
      statoLabel: STATO_LABEL,
      conteggi: {
        totale: METODI.length,
        rateizzazione: METODI.filter((m) => m.tipo === "Rateizzazione e finanziamento").length,
        daConfermare: METODI.filter((m) => m.stato === "link-da-confermare").length,
      },
    };
  }),
};
