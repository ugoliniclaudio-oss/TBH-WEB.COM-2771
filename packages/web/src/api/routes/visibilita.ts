import { base } from "../__core/app";
import { SCENE, MOMENTI, VISIBILITA_NOTA, MARCHIO_DEMO } from "../data/visibilita";

/**
 * "Brand in intervista · studio · diretta": sottosezione di Brand & Personalizzazioni.
 * Fonte unica delle scene dimostrative e delle posizioni pubblicitarie numerate.
 * Nessun prezzo: la trattativa resta commerciale (WhatsApp).
 */
export const visibilita = {
  scene: base.handler(() => {
    return {
      scene: SCENE,
      momenti: MOMENTI,
      nota: VISIBILITA_NOTA,
      marchioDemo: MARCHIO_DEMO,
      conteggi: {
        scene: SCENE.length,
        posizioni: SCENE.reduce((tot, s) => tot + s.posizioni.length, 0),
      },
    };
  }),
};
