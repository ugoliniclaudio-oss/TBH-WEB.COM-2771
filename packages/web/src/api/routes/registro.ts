import { z } from "zod";
import { base } from "../__core/app";
import { REGISTRO_NOTA, QUALIFICA_LABEL } from "../data/registro";
/* Il registro servito è quello con i loghi risolti: un logo originale per identità. */
import { REGISTRO_RISOLTO as REGISTRO } from "../data/identita";
import { TBH_CONTACTS } from "../data/catalog";

const QUALIFICHE = Object.keys(QUALIFICA_LABEL) as (keyof typeof QUALIFICA_LABEL)[];

export const registro = {
  /** 02 · Registro unico entità: una scheda per entità reale, con tutte le qualifiche. */
  lista: base
    .input(
      z.object({
        q: z.string().optional(),
        qualifica: z.string().optional(),
        soloDoppioni: z.boolean().optional(),
      }),
    )
    .handler(({ input }) => {
      const term = (input.q ?? "").trim().toLowerCase();

      let items = REGISTRO;
      if (input.qualifica && input.qualifica !== "tutte")
        items = items.filter((e) => (e.qualifiche as string[]).includes(input.qualifica!));
      if (input.soloDoppioni) items = items.filter((e) => e.fonti.length > 1);
      if (term)
        items = items.filter(
          (e) =>
            e.nome.toLowerCase().includes(term) ||
            (e.settore ?? "").toLowerCase().includes(term) ||
            (e.citta ?? "").toLowerCase().includes(term) ||
            (e.codiceTBH ?? "").toLowerCase().includes(term) ||
            (e.piva ?? "").includes(term),
        );

      const conteggi = QUALIFICHE.map((q) => ({
        id: q,
        label: QUALIFICA_LABEL[q],
        n: REGISTRO.filter((e) => (e.qualifiche as string[]).includes(q)).length,
      })).filter((c) => c.n > 0);

      return {
        items: items.slice(0, 400),
        totale: REGISTRO.length,
        trovati: items.length,
        collegate: REGISTRO.filter((e) => e.fonti.length > 1).length,
        qualifiche: conteggi,
        labels: QUALIFICA_LABEL,
        nota: REGISTRO_NOTA,
        contatti: TBH_CONTACTS,
      };
    }),

  /** Scheda singola per ID stabile. */
  entita: base.input(z.object({ id: z.string() })).handler(({ input }) => {
    const item = REGISTRO.find((e) => e.id === input.id) ?? null;
    return { item, labels: QUALIFICA_LABEL, contatti: TBH_CONTACTS };
  }),
};
