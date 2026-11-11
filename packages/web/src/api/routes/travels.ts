import { os } from "@orpc/server";
import {
  TAPPE_ESTERO,
  CRONOLOGIA_CONFERMATA,
  TRAVELS_NOTA,
  TRAVELS_MANCANTI,
  TRAVELS_VIDEO,
} from "../data/travels";
import { TBH_CONTACTS } from "../data/catalog";

const base = os;

/** TOUCH TRAVELS — tappe estere e fiere internazionali.
 *  Le tappe sono raggruppate per paese mantenendo l'ordine dichiarato da Claudio. */
export const travels = {
  estero: base.handler(() => {
    const paesi: { paese: string; iso: string; tappe: typeof TAPPE_ESTERO }[] = [];
    for (const t of TAPPE_ESTERO) {
      const g = paesi.find((p) => p.paese === t.paese);
      if (g) g.tappe.push(t);
      else paesi.push({ paese: t.paese, iso: t.iso, tappe: [t] });
    }
    return {
      paesi,
      tappe: TAPPE_ESTERO,
      totale: TAPPE_ESTERO.length,
      conSito: TAPPE_ESTERO.filter((t) => t.sito).length,
      cronologia: CRONOLOGIA_CONFERMATA,
      video: TRAVELS_VIDEO,
      mancanti: TRAVELS_MANCANTI,
      nota: TRAVELS_NOTA,
      contatti: TBH_CONTACTS,
    };
  }),
};
