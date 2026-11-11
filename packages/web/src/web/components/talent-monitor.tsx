import { useEffect, useRef } from "react";
import { caricaYouTube, ERRORI_YT, type YTPlayer } from "./canale-tematico-player";
import type { MonitorTalent } from "../queries/touch-talent";

/**
 * MONITOR VERTICALE 9:16 DEL TOUCH TALENT & PROFESSIONALS CHANNEL.
 *  · un monitor = un URL salvato; il video resta nelle sue proporzioni (letterbox, mai ritagliato né deformato);
 *  · SOLO il monitor in onda ha il player (audio + video): gli altri mostrano l'anteprima;
 *  · parte dal punto calcolato sull'ora del server (stesso punto per tutti) quando la fonte lo permette;
 *  · il cambio di monitor lo decide l'orologio del palinsesto, non la fine del video.
 */

type YTPieno = YTPlayer & { seekTo: (s: number, a: boolean) => void; getCurrentTime: () => number; getDuration: () => number; pauseVideo: () => void };

export type ComandiMonitor = { avvia: () => void };

export type PropsPlayer = {
  m: MonitorTalent;
  /** Secondi da cui partire (ora del server − inizio dello slot), letti al momento del caricamento. */
  posizione: () => number;
  onParte: () => void;
  onBloccato: () => void;
  onErrore: (codice: string, messaggio: string) => void;
  onFine: () => void;
  onDurata: (sec: number) => void;
  comandi: React.MutableRefObject<ComandiMonitor>;
};

function YouTube({ m, posizione, onParte, onBloccato, onErrore, onFine, onDurata, comandi }: PropsPlayer) {
  const box = useRef<HTMLDivElement>(null);
  const player = useRef<YTPieno | null>(null);
  const cb = useRef({ onParte, onBloccato, onErrore, onFine, onDurata, posizione });
  cb.current = { onParte, onBloccato, onErrore, onFine, onDurata, posizione };

  useEffect(() => {
    let vivo = true;
    let controllo = 0;
    caricaYouTube()
      .then((YT) => {
        if (!vivo || !box.current) return;
        const el = document.createElement("div");
        box.current.appendChild(el);
        const inizio = Math.floor(cb.current.posizione());
        player.current = new YT.Player(el, {
          videoId: m.embedId!,
          width: "100%",
          height: "100%",
          playerVars: { autoplay: 1, playsinline: 1, rel: 0, modestbranding: 1, start: inizio },
          events: {
            onReady: (e) => {
              e.target.playVideo();
              controllo = window.setTimeout(() => {
                const s = player.current?.getPlayerState?.();
                if (s === -1 || s === 5 || s === 2) cb.current.onBloccato();
              }, 3500);
            },
            onStateChange: (e) => {
              const p = player.current;
              if (e.data === 1 && p) {
                cb.current.onParte();
                const atteso = cb.current.posizione();
                const durata = p.getDuration?.() ?? 0;
                if (durata > 0) cb.current.onDurata(durata);
                // riallineamento: lo spettatore che arriva (o riprende) torna al punto della diretta
                if (Math.abs((p.getCurrentTime?.() ?? 0) - atteso) > 4 && (!durata || atteso < durata - 2)) p.seekTo(atteso, true);
              }
              if (e.data === 0) cb.current.onFine();
            },
            onError: (e) => cb.current.onErrore(`yt-${e.data}`, ERRORI_YT[e.data] ?? `errore YouTube ${e.data}`),
          },
        }) as YTPieno;
      })
      .catch((e: Error) => cb.current.onErrore("yt-api", e.message));
    return () => {
      vivo = false;
      window.clearTimeout(controllo);
      try {
        player.current?.destroy();
      } catch {
        /* già distrutto */
      }
      player.current = null;
    };
  }, [m.embedId]);

  comandi.current = {
    avvia: () => {
      const p = player.current;
      if (!p) return;
      p.seekTo?.(cb.current.posizione(), true);
      p.playVideo();
    },
  };
  return <div ref={box} className="absolute inset-0 [&>div]:h-full [&>div]:w-full [&_iframe]:h-full [&_iframe]:w-full" />;
}

function Vimeo({ m, posizione, onParte, onBloccato, onErrore, onFine, onDurata, comandi }: PropsPlayer) {
  const frame = useRef<HTMLIFrameElement>(null);
  const partito = useRef(false);
  const cb = useRef({ onParte, onBloccato, onErrore, onFine, onDurata, posizione });
  cb.current = { onParte, onBloccato, onErrore, onFine, onDurata, posizione };
  const invia = (method: string, value?: string | number) =>
    frame.current?.contentWindow?.postMessage(JSON.stringify(value !== undefined ? { method, value } : { method }), "https://player.vimeo.com");
  const inizio = useRef(Math.floor(posizione()));

  useEffect(() => {
    const ascolta = (e: MessageEvent) => {
      if (e.origin !== "https://player.vimeo.com" || e.source !== frame.current?.contentWindow) return;
      let d: { event?: string; method?: string; value?: unknown; data?: { message?: string; seconds?: number; duration?: number } } = {};
      try {
        d = typeof e.data === "string" ? JSON.parse(e.data) : e.data;
      } catch {
        return;
      }
      if (d.event === "ready") {
        for (const ev of ["finish", "play", "error"]) invia("addEventListener", ev);
        invia("getDuration");
      }
      if (d.method === "getDuration" && typeof d.value === "number" && d.value > 0) cb.current.onDurata(d.value);
      if (d.event === "finish") cb.current.onFine();
      if (d.event === "play") {
        if (!partito.current) invia("setCurrentTime", cb.current.posizione());
        partito.current = true;
        cb.current.onParte();
      }
      if (d.event === "error") cb.current.onErrore("vimeo", d.data?.message ?? "errore del player Vimeo");
    };
    window.addEventListener("message", ascolta);
    const t = window.setTimeout(() => !partito.current && cb.current.onBloccato(), 5000);
    return () => {
      window.removeEventListener("message", ascolta);
      window.clearTimeout(t);
    };
  }, [m.embedId]);

  comandi.current = {
    avvia: () => {
      invia("setCurrentTime", cb.current.posizione());
      invia("play");
    },
  };
  return (
    <iframe
      ref={frame}
      src={`https://player.vimeo.com/video/${m.embedId}?autoplay=1&playsinline=1&title=0&byline=0&portrait=0#t=${inizio.current}s`}
      className="absolute inset-0 h-full w-full"
      allow="autoplay; fullscreen; picture-in-picture"
      allowFullScreen
      title={m.titolo}
    />
  );
}

/** File video diretto: player del browser, proporzioni originali (object-contain). */
function FileVideo({ m, posizione, onParte, onBloccato, onErrore, onFine, onDurata, comandi }: PropsPlayer) {
  const v = useRef<HTMLVideoElement>(null);
  comandi.current = {
    avvia: () => {
      const el = v.current;
      if (!el) return;
      el.currentTime = posizione();
      void el.play();
    },
  };
  return (
    <video
      ref={v}
      src={m.url}
      className="absolute inset-0 h-full w-full bg-black object-contain"
      controls
      playsInline
      autoPlay
      preload="metadata"
      onLoadedMetadata={(e) => {
        const el = e.currentTarget;
        if (Number.isFinite(el.duration) && el.duration > 0) onDurata(el.duration);
        const p = posizione();
        if (p > 0 && (!Number.isFinite(el.duration) || p < el.duration - 1)) el.currentTime = p;
        el.play().catch((err: Error) => (err.name === "NotAllowedError" ? onBloccato() : undefined));
      }}
      onPlay={onParte}
      onEnded={onFine}
      onError={() => onErrore("file", "il file video non si riproduce")}
    />
  );
}

/** Player senza comandi esterni (Dailymotion, TikTok, Facebook, Instagram): si avviano dal loro pulsante se il browser blocca. */
function Iframe({ src, titolo, comandi }: { src: string; titolo: string; comandi: React.MutableRefObject<ComandiMonitor> }) {
  comandi.current = { avvia: () => undefined };
  return <iframe src={src} className="absolute inset-0 h-full w-full" allow="autoplay; fullscreen; picture-in-picture; encrypted-media" allowFullScreen title={titolo} />;
}

export function PlayerMonitor(p: PropsPlayer) {
  const { m } = p;
  const inizio = useRef(Math.floor(p.posizione()));
  switch (m.piattaforma) {
    case "youtube":
      return m.embedId ? <YouTube {...p} /> : null;
    case "vimeo":
      return m.embedId ? <Vimeo {...p} /> : null;
    case "video":
      return <FileVideo {...p} />;
    case "dailymotion":
      return <Iframe comandi={p.comandi} titolo={m.titolo} src={`https://www.dailymotion.com/embed/video/${m.embedId}?autoplay=1&start=${inizio.current}&queue-enable=false&ui-start-screen-info=false`} />;
    case "tiktok":
      return <Iframe comandi={p.comandi} titolo={m.titolo} src={`https://www.tiktok.com/player/v1/${m.embedId}?autoplay=1&loop=0&rel=0&music_info=1&description=0`} />;
    case "facebook":
      return <Iframe comandi={p.comandi} titolo={m.titolo} src={`https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(m.url)}&show_text=false&autoplay=true&mute=0`} />;
    case "instagram":
      return <Iframe comandi={p.comandi} titolo={m.titolo} src={`https://www.instagram.com/${m.embedId}/embed/`} />;
    default:
      return null;
  }
}

/** Anteprima di un monitor non in onda: miniatura nelle proporzioni originali, nessun audio. */
export function AnteprimaMonitor({ m }: { m: MonitorTalent }) {
  return m.miniatura ? (
    <>
      <img src={m.miniatura} alt="" aria-hidden className="absolute inset-0 h-full w-full scale-110 object-cover opacity-30 blur-xl" loading="lazy" decoding="async" referrerPolicy="no-referrer" />
      <img src={m.miniatura} alt={m.titolo} className="absolute inset-0 h-full w-full object-contain" loading="lazy" decoding="async" referrerPolicy="no-referrer" />
    </>
  ) : (
    <div className="absolute inset-0 flex items-center justify-center p-3 text-center text-[11px] font-bold text-white/45">{m.titolo}</div>
  );
}
