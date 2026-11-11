import type { ElementoCanale } from "../../api/lib/touch-canali";
import type { VoceMonitor } from "../components/monitor-rotante";
import { oraRoma } from "../hooks/use-radio-adesso";

/**
 * VOCI DEI MONITOR (28/10/2026) — dai palinsesti veri alle voci del MonitorRotante.
 * Immagini: copertina del brano, miniatura YouTube del video (i.ytimg.com), mai generate.
 */

const ID_YT = /^[\w-]{11}$/;
export const miniaturaYouTube = (id: string) => `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
export const idYouTube = (s: string | null | undefined) => (s && ID_YT.test(s) ? s : null);

/** Il passaggio in onda e i successivi (massimo `quante`), con «IN ONDA ORA» / «A SEGUIRE». */
export function vociDaPalinsesto(elementi: ElementoCanale[], indice: number, quante = 8): VoceMonitor[] {
  if (!elementi.length) return [];
  const da = Math.max(0, indice);
  return elementi.slice(da, da + quante).map((e, k) => {
    const quando = `${k === 0 && indice >= 0 ? "IN ONDA ORA" : "A SEGUIRE"} · ${oraRoma(e.inizio)}`;
    const base = { id: `${e.inizio}-${k}`, sotto: quando, link: e.link ?? null };
    if (e.tipo === "brano") {
      const yt = e.fonte.tipo === "youtube" ? e.fonte.videoId : null;
      return {
        ...base,
        titolo: e.artista ? `${e.titolo} · ${e.artista}` : e.titolo,
        immagine: e.cover ?? (yt ? miniaturaYouTube(yt) : null),
        youtube: yt,
        media: e.fonte.tipo === "audio" ? e.fonte.src : null,
      };
    }
    if (e.tipo === "spot") {
      const yt = idYouTube(e.videoId);
      return { ...base, titolo: e.titolo, immagine: yt ? miniaturaYouTube(yt) : null, youtube: yt };
    }
    if (e.tipo === "dm") {
      return { ...base, titolo: e.titolo, immagine: null, youtube: null };
    }
    const yt = idYouTube(e.sorgente);
    return { ...base, titolo: e.titolo, immagine: yt ? miniaturaYouTube(yt) : null, youtube: yt };
  });
}

/** Playlist dello Spot Channel (archivio «touch-spot»). */
export function vociDaSpot(sequenza: { id: number; titolo: string; sorgente: string; link: string | null }[]): VoceMonitor[] {
  return sequenza.map((s) => {
    const yt = idYouTube(s.sorgente);
    return {
      id: `spot-${s.id}`,
      titolo: s.titolo,
      sotto: "SPOT INTERNO TBH",
      immagine: yt ? miniaturaYouTube(yt) : null,
      youtube: yt,
      link: s.link,
    };
  });
}
