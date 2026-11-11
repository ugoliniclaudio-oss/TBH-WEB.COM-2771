import { base } from "../__core/app";
import { HEDDY_CATEGORIE, HEDDY_FOTOGRAFIA, HEDDY_URL } from "../data/heddy-video";
import { sequenzaDi, sincronizzaSeServe, tutteLeImpostazioni } from "../lib/channel-palinsesti";
import { catalogoHeddyRapido, schedaHeddy } from "../lib/heddy-video";
import { dataRoma } from "../lib/radio-palinsesto";

/**
 * TOUCH CINEMA — programmazione provvisoria = tutti i film pubblicati su HEDDY.video
 * (ordine di Claudio del 18/10/2026).
 *
 * La lista arriva dall'archivio del Channel «touch-cinema» (stesso sistema dei 28 Channel:
 * ordine, rotazione giornaliera, film spenti dal pannello /allestimento/channel) e ogni voce
 * viene completata con la scheda HEDDY (locandina, regia, anno, paese, categorie).
 * Nessun orario: i film non vanno in onda su TBH-WEB, si guardano su HEDDY.video.
 */
export const touchCinema = {
  programmazione: base.handler(async () => {
    try {
      await sincronizzaSeServe();
    } catch {
      /* si mostra l'ultimo archivio salvato */
    }
    const imp = (await tutteLeImpostazioni())["touch-cinema"]!;
    const giorno = dataRoma(Date.now());
    const sequenza = await sequenzaDi("touch-cinema", giorno, imp);
    const visti = new Set<string>();
    const film = sequenza
      .filter((v) => v.tipo === "film")
      .filter((v) => (visti.has(v.sorgente) ? false : (visti.add(v.sorgente), true)))
      .map((v) => {
        // Film HEDDY (sorgente «heddy:<slug>») oppure film aggiunto a mano dal pannello (nessuna scheda HEDDY).
        const slug = v.sorgente.startsWith("heddy:") ? v.sorgente.slice("heddy:".length) : null;
        const s = slug ? schedaHeddy(slug) : null;
        return {
          id: v.id,
          slug,
          titolo: v.titolo,
          link: v.link ?? (slug ? `${HEDDY_URL}/${slug}` : null),
          durataMin: v.durataSec ? Math.round(v.durataSec / 60) : null,
          regia: s?.regia ?? null,
          anno: s?.anno ?? null,
          paese: s?.paese ?? null,
          stagioni: s?.stagioni ?? null,
          categorie: s?.categorie ?? [],
          poster: s?.poster ?? null,
        };
      });
    const servizi = sequenza
      .filter((v) => v.tipo === "video" && !v.spot)
      .map((v) => ({ id: v.id, titolo: v.titolo, sorgente: v.sorgente, link: v.link }));
    const cat = catalogoHeddyRapido();
    return {
      giorno,
      rotazioneGiornaliera: imp.casuale,
      modalita: imp.modalita,
      film,
      servizi,
      categorie: HEDDY_CATEGORIE.map(([slug, nome]) => ({ slug, nome, film: film.filter((f) => f.categorie.includes(nome)).length })),
      fonte: { url: HEDDY_URL, fotografia: HEDDY_FOTOGRAFIA, ultimaLettura: cat.origine, titoliSulSito: cat.film.length },
    };
  }),
};
