import { eq, and } from "drizzle-orm";
import { db } from "./src/api/database";
import * as schema from "./src/api/database/schema";
import { importaIndirizzo } from "./src/api/lib/catalogo-musicale";
const voci: [string, string, number | null][] = [
  ["dacw1nYwJ8w", "visual-audio", 203],
  ["SZuhdCuVoRw", "visual-audio", null], ["BkaJT0Mx2Ss", "visual-audio", null], ["T7i9zAGjM00", "visual-audio", null],
  ["Mdg2JO06YMw", "visual-audio", null], ["uqPYfoFiCUI", "visual-audio", null], ["7Z2VvEkep_E", "visual-audio", null],
  ["duG_de_R_9o", "visual-audio", null], ["CaYR_o7_bX8", "visual-audio", null], ["ITvL83iTcSs", "visual-audio", null],
  ["kkylS59Jqpg", "visual-audio", null], ["yOrMtN7-WdI", "visual-audio", null], ["2Xgr5P7ZQA8", "visual-audio", null],
  ["tNuZdiiRUoU", "visual-audio", null], ["R-YO7GTOLok", "visual-audio", null],
];
for (const [id, tipo, durata] of voci) {
  const url = `https://www.youtube.com/watch?v=${id}`;
  const e = await importaIndirizzo(url, { tornata: "IMPORTAZIONE YOUTUBE TOUCH MUSIC 14/10/2026", tipo: tipo as any });
  console.log(e.esito, e.branoId, e.titolo, "|", e.messaggio);
  if (durata) await db.update(schema.braniSorgenti).set({ durataSec: durata }).where(and(eq(schema.braniSorgenti.idEsterno, id)));
}
process.exit(0);
