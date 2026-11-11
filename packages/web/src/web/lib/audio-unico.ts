/**
 * UN SOLO AUDIO ALLA VOLTA (28/10/2026) — nessun audio sovrapposto.
 *
 *  · un monitor che parte «prende» l'audio: chi suonava prima viene fermato;
 *  · i player HTML del sito (<audio>/<video>) e gli iframe YouTube con API attiva vengono messi
 *    in pausa quando parte un monitor, e viceversa un <audio>/<video> che parte ferma i monitor;
 *  · al cambio di pagina/canale si ferma tutto (montato in Layout).
 */

type Sorgente = { id: string; ferma: () => void; elemento?: () => Element | null };

let attiva: Sorgente | null = null;

function pausaIframeYouTube(tranne: Element | null) {
  for (const f of Array.from(document.querySelectorAll<HTMLIFrameElement>("iframe"))) {
    if (tranne && tranne.contains(f)) continue;
    const src = f.getAttribute("src") ?? "";
    if (!/youtube(-nocookie)?\.com\/embed\//.test(src) || !src.includes("enablejsapi=1")) continue;
    try {
      f.contentWindow?.postMessage(JSON.stringify({ event: "command", func: "pauseVideo", args: [] }), "*");
    } catch {
      /* iframe non raggiungibile */
    }
  }
}

function pausaMedia(tranne: Element | null) {
  for (const m of Array.from(document.querySelectorAll<HTMLMediaElement>("audio, video"))) {
    if (tranne && tranne.contains(m)) continue;
    if (!m.paused && !m.muted) m.pause();
  }
}

/** Il monitor `s` inizia a suonare: si ferma tutto il resto. */
export function prendiAudio(s: Sorgente) {
  if (attiva && attiva.id !== s.id) {
    const prima = attiva;
    attiva = null;
    prima.ferma();
  }
  attiva = s;
  const mio = s.elemento?.() ?? null;
  pausaMedia(mio);
  pausaIframeYouTube(mio);
}

export function lasciaAudio(id: string) {
  if (attiva?.id === id) attiva = null;
}

/** Cambio di canale/pagina: si ferma il monitor che suona. */
export function fermaTuttoAudio() {
  const a = attiva;
  attiva = null;
  a?.ferma();
}

let ascolto = false;
/** Un <audio>/<video> del sito che parte (non di un monitor) ferma il monitor che suona. */
export function ascoltaAltriPlayer() {
  if (ascolto || typeof document === "undefined") return;
  ascolto = true;
  document.addEventListener(
    "play",
    (e) => {
      const t = e.target as HTMLMediaElement | null;
      if (!t || t.muted || !attiva) return;
      const mio = attiva.elemento?.() ?? null;
      if (mio && mio.contains(t)) return;
      fermaTuttoAudio();
    },
    true,
  );
}
