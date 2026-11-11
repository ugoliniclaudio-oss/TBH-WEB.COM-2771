import { z } from "zod";
import { base } from "../__core/app";
import {
  dataRoma,
  giornoDopo,
  nomeGiorno,
  scaletta,
  settimanaDa,
} from "../lib/radio-palinsesto";
import { APP_RADIO, DM_RADIO, RADIO, REGOLE_RADIO, SPOT_GRUPPO, SPOT_NOTA, TV_RADIO } from "../data/radio";
import { PALINSESTO_DM } from "../data/tbh";
import { GIORNI } from "../data/palinsesto";

/**
 * J.C. HUGÒ RADIO — l'unica API della radio. Sito, app futura e TV leggono queste
 * tre procedure: stesso catalogo, stesso palinsesto, stesso «streaming» sincronizzato.
 */
const DATA = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/)
  .optional();

export const radio = {
  /** In onda adesso: elemento corrente, secondi già trascorsi e i prossimi. */
  inOnda: base.handler(async () => {
    const adesso = Date.now();
    const oggi = dataRoma(adesso);
    const { elementi } = await scaletta(oggi);
    let i = elementi.findIndex((e) => e.inizio <= adesso && adesso < e.fine);
    let lista = elementi;
    if (i < 0) {
      lista = [...elementi, ...(await scaletta(giornoDopo(oggi))).elementi];
      i = Math.max(0, lista.findIndex((e) => e.fine > adesso));
    }
    const corrente = lista[i] ?? null;
    let prossimi = lista.slice(i + 1, i + 6);
    if (prossimi.length < 5) {
      const domani = (await scaletta(giornoDopo(oggi))).elementi;
      prossimi = [...prossimi, ...domani].slice(0, 5);
    }
    return {
      adesso,
      corrente,
      trascorsoSec: corrente ? Math.max(0, (adesso - corrente.inizio) / 1000) : 0,
      prossimi,
    };
  }),

  /** La scaletta completa di un giorno (oggi se manca la data), ora di Roma. */
  palinsesto: base.input(z.object({ giorno: DATA }).optional()).handler(async ({ input }) => {
    const adesso = Date.now();
    const giorno = input?.giorno ?? dataRoma(adesso);
    const { elementi, brani } = await scaletta(giorno);
    return {
      adesso,
      giorno,
      nomeGiorno: nomeGiorno(giorno),
      fuso: RADIO.fuso,
      braniInRotazione: brani,
      elementi,
    };
  }),

  /** La settimana a partire da oggi, e le informazioni fisse della radio. */
  settimana: base.handler(async () => {
    const adesso = Date.now();
    const oggi = dataRoma(adesso);
    const { brani } = await scaletta(oggi);
    return {
      adesso,
      radio: RADIO,
      regole: REGOLE_RADIO,
      braniInRotazione: brani,
      giorni: settimanaDa(oggi),
      dm: {
        ...DM_RADIO,
        programmi: PALINSESTO_DM.map((p) => ({
          slug: p.slug,
          nome: p.name,
          giorno: p.giorno ? (GIORNI[p.giorno] ?? null) : null,
          ora: p.ora,
          durataMin: p.durataMin,
        })),
      },
      spot: { nota: SPOT_NOTA, gruppo: SPOT_GRUPPO },
      app: APP_RADIO,
      tv: TV_RADIO,
    };
  }),
};

