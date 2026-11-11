import { useCallback, useEffect, useRef, useState } from "react";
import { ExternalLink, Play, Shuffle, SkipForward } from "lucide-react";
import { segnalaErroreTematico, type VideoTematico } from "../queries/canali-tematici";

/**
 * PLAYER DEI CANALI TEMATICI — playlist casuale PER SPETTATORE (non è una diretta sincronizzata).
 *  · coda mescolata dei video in onda; si esaurisce tutto il catalogo prima di ricominciare;
 *  · mai lo stesso video due volte di fila (anche a cavallo fra due giri);
 *  · fine video → successivo (YouTube IFrame API, Vimeo postMessage, <video>); Dailymotion: durata
 *    nota o pulsante «Successivo»;
 *  · errore del player → si salta al successivo e si registra l'errore sul server;
 *  · autoplay bloccato → pulsante «Avvia canale»;
 *  · catalogo aggiornato → nuovi video inseriti nella coda, tolti quelli spenti: il video in corso NON si ferma.
 */

const GIALLO = "#d7ff00";

export type YTPlayer = {
  loadVideoById: (id: string) => void;
  playVideo: () => void;
  getPlayerState: () => number;
  destroy: () => void;
};
type YTNamespace = {
  Player: new (
    el: HTMLElement,
    o: {
      videoId: string;
      width?: string;
      height?: string;
      playerVars: Record<string, number | string>;
      events: Record<string, (e: { data: number; target: YTPlayer }) => void>;
    },
  ) => YTPlayer;
};

let apiYouTube: Promise<YTNamespace> | null = null;
/** Esportato anche per il Touch Talent & Professionals Channel (stesso caricatore, una sola API YouTube nella pagina). */
export function caricaYouTube(): Promise<YTNamespace> {
  const w = window as unknown as { YT?: YTNamespace & { loaded?: number }; onYouTubeIframeAPIReady?: () => void };
  if (w.YT?.Player) return Promise.resolve(w.YT);
  if (!apiYouTube)
    apiYouTube = new Promise((ok, ko) => {
      const prima = w.onYouTubeIframeAPIReady;
      w.onYouTubeIframeAPIReady = () => {
        prima?.();
        ok(w.YT!);
      };
      const s = document.createElement("script");
      s.src = "https://www.youtube.com/iframe_api";
      s.async = true;
      s.onerror = () => {
        apiYouTube = null;
        ko(new Error("API YouTube non raggiungibile"));
      };
      document.head.appendChild(s);
    });
  return apiYouTube;
}

export const ERRORI_YT: Record<number, string> = {
  2: "parametro del video non valido",
  5: "il player HTML5 non riesce a riprodurre il video",
  100: "video rimosso o privato",
  101: "YouTube non lo consente in questo player: incorporamento disattivato, limite di area o verifica di YouTube",
  150: "YouTube non lo consente in questo player: incorporamento disattivato, limite di area o verifica di YouTube",
};

function mescola<T>(a: T[]): T[] {
  const b = [...a];
  for (let i = b.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [b[i], b[j]] = [b[j]!, b[i]!];
  }
  return b;
}

type Comandi = { avvia: () => void };

/* ── player per piattaforma ───────────────────────────────────────────────── */

function PlayerYouTube({ id, passo, onFine, onErrore, onBloccato, onParte, comandi }: Base & { id: string }) {
  const box = useRef<HTMLDivElement>(null);
  const player = useRef<YTPlayer | null>(null);
  const pronto = useRef(false);
  const cb = useRef({ onFine, onErrore, onBloccato, onParte });
  cb.current = { onFine, onErrore, onBloccato, onParte };
  const primo = useRef(id);

  const controllaAvvio = useCallback(() => {
    window.setTimeout(() => {
      const s = player.current?.getPlayerState?.();
      // -1 non avviato, 5 in coda: il browser ha bloccato la riproduzione automatica
      if (s === -1 || s === 5) cb.current.onBloccato();
    }, 3500);
  }, []);

  useEffect(() => {
    let vivo = true;
    caricaYouTube()
      .then((YT) => {
        if (!vivo || !box.current) return;
        const el = document.createElement("div");
        box.current.appendChild(el);
        player.current = new YT.Player(el, {
          videoId: primo.current,
          width: "100%",
          height: "100%",
          playerVars: { autoplay: 1, playsinline: 1, rel: 0, modestbranding: 1 },
          events: {
            onReady: (e) => {
              pronto.current = true;
              e.target.playVideo();
              controllaAvvio();
            },
            onStateChange: (e) => {
              if (e.data === 0) cb.current.onFine();
              if (e.data === 1) cb.current.onParte();
            },
            onError: (e) => cb.current.onErrore(`yt-${e.data}`, ERRORI_YT[e.data] ?? `errore YouTube ${e.data}`),
          },
        });
      })
      .catch((e: Error) => cb.current.onErrore("yt-api", e.message));
    return () => {
      vivo = false;
      try {
        player.current?.destroy();
      } catch {
        /* già distrutto */
      }
      player.current = null;
      pronto.current = false;
    };
  }, [controllaAvvio]);

  useEffect(() => {
    if (id === primo.current && !pronto.current) return;
    if (pronto.current && player.current) {
      player.current.loadVideoById(id);
      controllaAvvio();
    }
    primo.current = id;
  }, [id, passo, controllaAvvio]);

  comandi.current = { avvia: () => player.current?.playVideo() };
  return <div ref={box} className="absolute inset-0 [&>div]:h-full [&>div]:w-full [&_iframe]:h-full [&_iframe]:w-full" />;
}

function PlayerVimeo({ id, onFine, onErrore, onBloccato, onParte, comandi }: Base & { id: string }) {
  const frame = useRef<HTMLIFrameElement>(null);
  const partito = useRef(false);
  const cb = useRef({ onFine, onErrore, onBloccato, onParte });
  cb.current = { onFine, onErrore, onBloccato, onParte };
  const invia = (method: string, value?: string) =>
    frame.current?.contentWindow?.postMessage(JSON.stringify(value ? { method, value } : { method }), "https://player.vimeo.com");

  useEffect(() => {
    partito.current = false;
    const ascolta = (e: MessageEvent) => {
      if (e.origin !== "https://player.vimeo.com" || e.source !== frame.current?.contentWindow) return;
      let d: { event?: string; data?: { message?: string } } = {};
      try {
        d = typeof e.data === "string" ? JSON.parse(e.data) : e.data;
      } catch {
        return;
      }
      if (d.event === "ready") for (const ev of ["finish", "play", "error"]) invia("addEventListener", ev);
      if (d.event === "finish") cb.current.onFine();
      if (d.event === "play") {
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
  }, [id]);

  comandi.current = { avvia: () => invia("play") };
  return (
    <iframe
      ref={frame}
      key={id}
      src={`https://player.vimeo.com/video/${id}?autoplay=1&playsinline=1&title=0&byline=0&portrait=0`}
      className="absolute inset-0 h-full w-full"
      allow="autoplay; fullscreen; picture-in-picture"
      allowFullScreen
      title="Player Vimeo"
    />
  );
}

function PlayerDailymotion({ id, durataSec, onFine, comandi }: Base & { id: string; durataSec: number | null }) {
  useEffect(() => {
    if (!durataSec) return;
    const t = window.setTimeout(onFine, (durataSec + 3) * 1000);
    return () => window.clearTimeout(t);
  }, [id, durataSec, onFine]);
  comandi.current = { avvia: () => undefined };
  return (
    <iframe
      key={id}
      src={`https://www.dailymotion.com/embed/video/${id}?autoplay=1&mute=0`}
      className="absolute inset-0 h-full w-full"
      allow="autoplay; fullscreen; picture-in-picture"
      allowFullScreen
      title="Player Dailymotion"
    />
  );
}

function PlayerFile({ src, onFine, onErrore, onBloccato, onParte, comandi }: Base & { src: string }) {
  const v = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    v.current?.play().catch((e: Error) => (e.name === "NotAllowedError" ? onBloccato() : undefined));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src]);
  comandi.current = { avvia: () => void v.current?.play() };
  return (
    <video
      ref={v}
      key={src}
      src={src}
      className="absolute inset-0 h-full w-full bg-black"
      controls
      playsInline
      preload="metadata"
      onEnded={onFine}
      onPlay={onParte}
      onError={() => onErrore("file", "il file video non si riproduce")}
    />
  );
}

type Base = {
  onFine: () => void;
  onErrore: (codice: string, messaggio: string) => void;
  onBloccato: () => void;
  onParte: () => void;
  comandi: React.MutableRefObject<Comandi>;
  /** Cresce a ogni passaggio: lo stesso video può ripartire (catalogo di un solo video). */
  passo: number;
};

/* ── coda casuale ─────────────────────────────────────────────────────────── */

export function PlayerCanaleTematico({ slug, video, campi }: { slug: string; video: VideoTematico[]; campi: { chiave: string; etichetta: string }[] }) {
  const catalogo = useRef(new Map<number, VideoTematico>());
  const coda = useRef<number[]>([]);
  const giro = useRef(new Set<number>());
  const falliti = useRef(new Set<number>());
  const [corrente, setCorrente] = useState<VideoTematico | null>(null);
  const [bloccato, setBloccato] = useState(false);
  const [avviso, setAvviso] = useState<string | null>(null);
  const [nGiro, setNGiro] = useState(1);
  const [passo, setPasso] = useState(0);
  const comandi = useRef<Comandi>({ avvia: () => undefined });
  const correnteRef = useRef<VideoTematico | null>(null);
  correnteRef.current = corrente;

  const prossimo = useCallback(() => {
    const disponibili = [...catalogo.current.keys()].filter((id) => !falliti.current.has(id));
    if (!disponibili.length) {
      setCorrente(null);
      return;
    }
    coda.current = coda.current.filter((id) => catalogo.current.has(id) && !falliti.current.has(id));
    if (!coda.current.length) {
      // giro completato: nuovo ordine casuale, senza ripartire dal video appena visto
      const ultimo = correnteRef.current?.id;
      const nuovo = mescola(disponibili);
      if (nuovo.length > 1 && nuovo[0] === ultimo) [nuovo[0], nuovo[1]] = [nuovo[1]!, nuovo[0]!];
      coda.current = nuovo;
      if (giro.current.size) setNGiro((n) => n + 1);
      giro.current = new Set();
    }
    const id = coda.current.shift()!;
    giro.current.add(id);
    setCorrente(catalogo.current.get(id) ?? null);
    setPasso((n) => n + 1);
  }, []);

  // catalogo aggiornato: la coda cambia, il video in corso no
  useEffect(() => {
    const prima = catalogo.current;
    catalogo.current = new Map(video.map((v) => [v.id, v]));
    const nuovi = video.map((v) => v.id).filter((id) => !prima.has(id) && !giro.current.has(id) && !coda.current.includes(id));
    for (const id of nuovi) coda.current.splice(Math.floor(Math.random() * (coda.current.length + 1)), 0, id);
    coda.current = coda.current.filter((id) => catalogo.current.has(id));
    if (!correnteRef.current && video.length) prossimo();
    else if (correnteRef.current) {
      const agg = catalogo.current.get(correnteRef.current.id);
      // titolo/miniatura aggiornati dal pannello: si aggiornano le scritte, non il player
      if (agg && agg.titolo !== correnteRef.current.titolo) setCorrente((c) => (c && c.id === agg.id ? { ...c, titolo: agg.titolo, campi: agg.campi, fonte: agg.fonte } : c));
    }
  }, [video, prossimo]);

  const errore = useCallback(
    (codice: string, messaggio: string) => {
      const c = correnteRef.current;
      if (!c || falliti.current.has(c.id)) return;
      falliti.current.add(c.id);
      setAvviso(`«${c.titolo}» non è riproducibile (${messaggio}): passo al successivo.`);
      void segnalaErroreTematico({ slug, id: c.id, codice, messaggio });
      window.setTimeout(() => correnteRef.current?.id === c.id && prossimo(), 1200);
    },
    [slug, prossimo],
  );

  const fine = useCallback(() => {
    setAvviso(null);
    prossimo();
  }, [prossimo]);
  const parte = useCallback(() => setBloccato(false), []);
  const blocco = useCallback(() => setBloccato(true), []);

  const totale = video.filter((v) => !falliti.current.has(v.id)).length;

  if (!corrente)
    return (
      <div className="flex aspect-video w-full items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03] p-6 text-center text-sm text-white/70" data-testid="tematico-nessuno">
        Nessun video riproducibile in questo momento. I contenuti non disponibili sono stati segnalati alla redazione.
      </div>
    );

  const base: Base = { onFine: fine, onErrore: errore, onBloccato: blocco, onParte: parte, comandi, passo };
  const etichetta = (k: string) => campi.find((c) => c.chiave === k)?.etichetta ?? k;
  const dettagli = Object.entries(corrente.campi).filter(([k, v]) => v && k !== "linkNumero");

  return (
    <div className="flex flex-col gap-3" data-testid="tematico-player" data-video={corrente.id}>
      <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-white/10 bg-black">
        {corrente.piattaforma === "youtube" && corrente.embedId && <PlayerYouTube {...base} id={corrente.embedId} />}
        {corrente.piattaforma === "vimeo" && corrente.embedId && <PlayerVimeo key={passo} {...base} id={corrente.embedId} />}
        {corrente.piattaforma === "dailymotion" && corrente.embedId && <PlayerDailymotion key={passo} {...base} id={corrente.embedId} durataSec={corrente.durataSec} />}
        {corrente.piattaforma === "video" && <PlayerFile key={passo} {...base} src={corrente.url} />}
        {bloccato && (
          <button
            type="button"
            onClick={() => {
              setBloccato(false);
              comandi.current.avvia();
            }}
            className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-black/75 text-white"
            data-testid="avvia-canale"
          >
            <span className="flex h-16 w-16 items-center justify-center rounded-full text-black" style={{ background: GIALLO }}>
              <Play className="h-7 w-7" fill="currentColor" />
            </span>
            <span className="text-sm font-extrabold tracking-[0.2em]">AVVIA CANALE</span>
          </button>
        )}
      </div>

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[10px] font-extrabold tracking-[0.22em] text-white/50">ORA IN RIPRODUZIONE</p>
          <h2 className="mt-1 text-lg font-extrabold leading-tight text-white md:text-xl" data-testid="tematico-titolo">
            {corrente.titolo}
          </h2>
          {dettagli.length > 0 && (
            <p className="mt-1 text-xs text-white/70">
              {dettagli.map(([k, v]) => (
                <span key={k} className="mr-3">
                  <span className="text-white/45">{etichetta(k)}:</span> {v}
                </span>
              ))}
            </p>
          )}
          <p className="mt-1 text-[11px] text-white/45">
            Fonte: {corrente.fonte ?? "—"} ·{" "}
            <a href={corrente.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 underline hover:text-white">
              URL originale <ExternalLink className="h-3 w-3" />
            </a>
          </p>
        </div>
        <button
          type="button"
          onClick={fine}
          className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-extrabold tracking-[0.14em] text-black"
          style={{ background: GIALLO }}
          data-testid="tematico-successivo"
        >
          <SkipForward className="h-4 w-4" /> SUCCESSIVO
        </button>
      </div>
      {avviso && (
        <p className="rounded-lg border border-white/15 bg-white/[0.04] px-3 py-2 text-xs text-white/80" data-testid="tematico-avviso">
          {avviso}
        </p>
      )}
      <p className="inline-flex items-center gap-2 text-[11px] text-white/50">
        <Shuffle className="h-3.5 w-3.5" /> Ordine casuale creato per te · giro {nGiro} · {giro.current.size}/{Math.max(totale, giro.current.size)} video. Non è una diretta: ogni spettatore ha la sua sequenza.
        {corrente.piattaforma === "dailymotion" && !corrente.durataSec ? " Dailymotion: a fine video premi «Successivo»." : ""}
      </p>
    </div>
  );
}
