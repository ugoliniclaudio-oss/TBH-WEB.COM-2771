import { useCallback, useEffect, useId, useImperativeHandle, useRef, useState, type ReactNode, type Ref } from "react";
import { ChevronLeft, ChevronRight, ExternalLink, Loader2, Play, RotateCcw, SkipForward, Square } from "lucide-react";
import { Link } from "wouter";
import { caricaYouTube, ERRORI_YT, type YTPlayer } from "./canale-tematico-player";
import { ascoltaAltriPlayer, lasciaAudio, prendiAudio } from "../lib/audio-unico";
import { useDurataRotazione } from "../queries/monitor";

/**
 * MONITOR A ROTAZIONE (ordine di Claudio del 28/10/2026) — palinsesti, spot e Touch Cinema.
 *
 *  · trasmette SUBITO immagini, locandine e miniature in rotazione automatica: 8 s ciascuna,
 *    durata modificabile dal pannello /allestimento/channel (oppure `durataSec`);
 *  · titolo + Play: il video parte solo al clic e sospende la rotazione di QUESTO monitor;
 *    alla fine del video la rotazione riprende dal contenuto successivo;
 *  · durante il caricamento resta l'immagine: mai uno schermo nero;
 *  · player bloccato (errore, incorporamento negato, Paese escluso, nessuna risposta) →
 *    «Guarda su YouTube» (o la fonte originale) e «Riprendi rotazione»;
 *  · ogni monitor ha la sua rotazione: gli spot continuano a girare mentre un film è in Play;
 *  · un solo audio alla volta (lib/audio-unico.ts); cambio pagina/canale = stop.
 *  · `sequenza` (28/10/2026, scalette dei canali tematici): dopo il Play i video si susseguono
 *    nell'ordine della scaletta nello STESSO player (loadVideoById: niente nuovo clic quando
 *    YouTube e il browser lo consentono); `ciclo` = Ciclo continuo H24, dopo l'ultimo si torna al primo.
 */

export type VoceMonitor = {
  id: string;
  titolo: string;
  /** Riga sotto il titolo (tipo, durata, «IN ONDA ORA», …). */
  sotto?: string | null;
  /** Immagine reale (miniatura, locandina, logo). null = pannello con il solo titolo. */
  immagine: string | null;
  /** Id del video YouTube da avviare con Play. */
  youtube?: string | null;
  /** File audio/video diretto (es. brano Suno) da avviare con Play. */
  media?: string | null;
  /** Pagina originale del contenuto (fallback quando il player è bloccato). */
  link?: string | null;
  linkEtichetta?: string;
  /** Scheda interna del contenuto. */
  scheda?: string | null;
  schedaEtichetta?: string;
  /** Nota mostrata quando il player è bloccato (es. «visibile solo dall'Italia»). */
  notaBlocco?: string;
  /** 28/10/2026 (round 14) — durata di QUESTA voce in rotazione (immagini/spot dalla Regia); assente = durata del monitor. */
  durataSec?: number | null;
};

export type ComandiMonitorRotante = {
  /** Mostra la voce `i` (ferma l'eventuale video) e riparte il conteggio della rotazione. */
  mostra: (i: number) => void;
  /** Mostra la voce `i` e avvia il suo video. */
  avvia: (i: number) => void;
  ferma: () => void;
};

type Fase = "rotazione" | "caricamento" | "tocca" | "riproduzione" | "bloccato";

const GIALLO = "#d7ff00";

export function MonitorRotante({
  voci,
  durataSec,
  etichetta,
  colore = GIALLO,
  testid,
  playLabel = "PLAY",
  vuoto,
  onIndice,
  comandi,
  className = "",
  bordo,
  sequenza = false,
  ciclo = false,
  onErroreVoce,
}: {
  voci: VoceMonitor[];
  durataSec?: number;
  etichetta?: string;
  colore?: string;
  testid?: string;
  playLabel?: string;
  vuoto?: ReactNode;
  onIndice?: (i: number) => void;
  comandi?: Ref<ComandiMonitorRotante>;
  className?: string;
  bordo?: string;
  /** Dopo il Play: a fine video parte il successivo della scaletta (solo voci YouTube). */
  sequenza?: boolean;
  /** Con `sequenza`: dopo l'ultimo video si riparte dal primo (Ciclo continuo H24). */
  ciclo?: boolean;
  onErroreVoce?: (v: VoceMonitor, motivo: string) => void;
}) {
  const durataServer = useDurataRotazione();
  const durata = Math.max(3, durataSec ?? durataServer);
  const [indice, setIndice] = useState(0);
  const [fase, setFase] = useState<Fase>("rotazione");
  const [errore, setErrore] = useState<string | null>(null);
  const [sessione, setSessione] = useState(0);
  /** Cresce a ogni passaggio automatico della sequenza (lo stesso video può ripartire in un ciclo di un solo video). */
  const [passo, setPasso] = useState(0);
  const id = useId();
  const box = useRef<HTMLDivElement>(null);
  const n = voci.length;
  const i = n ? ((indice % n) + n) % n : 0;
  const v = n ? voci[i]! : null;
  const avviabile = !!(v && (v.youtube || v.media));
  const suona = fase === "caricamento" || fase === "tocca" || fase === "riproduzione";

  useEffect(() => ascoltaAltriPlayer(), []);

  /* Rotazione automatica: solo quando questo monitor non sta riproducendo. */
  const durataVoce = Math.max(3, Math.min(600, v?.durataSec ?? durata));
  useEffect(() => {
    if (fase !== "rotazione" || n < 2) return;
    const t = window.setTimeout(() => setIndice((x) => (x + 1) % n), durataVoce * 1000);
    return () => window.clearTimeout(t);
  }, [fase, n, durataVoce, indice]);

  useEffect(() => {
    onIndice?.(i);
  }, [i, onIndice]);

  /* Precarica l'immagine successiva: il cambio è immediato, senza vuoti. */
  useEffect(() => {
    const prossima = n > 1 ? voci[(i + 1) % n]?.immagine : null;
    if (prossima) new Image().src = prossima;
  }, [i, n, voci]);

  const fermaRef = useRef<(avanti: boolean) => void>(() => {});
  const ferma = useCallback(
    (avanti: boolean) => {
      lasciaAudio(id);
      setFase("rotazione");
      setErrore(null);
      if (avanti && n > 0) setIndice((x) => (x + 1) % n);
    },
    [id, n],
  );
  fermaRef.current = ferma;

  /** Indice del prossimo video avviabile della scaletta dopo `da` (null = scaletta finita, senza ciclo). */
  const prossimoAvviabile = useCallback(
    (da: number) => {
      for (let k = 1; k <= n; k++) {
        const j = da + k;
        if (j >= n && !ciclo) return null;
        if (voci[j % n]?.youtube) return j % n;
      }
      return null;
    },
    [n, ciclo, voci],
  );

  const fineVoce = useCallback(() => {
    if (!sequenza) return ferma(true);
    const j = prossimoAvviabile(i);
    if (j === null) return ferma(true);
    setErrore(null);
    setIndice(j);
    setPasso((x) => x + 1);
    setFase("caricamento");
  }, [sequenza, prossimoAvviabile, i, ferma]);

  const avvia = useCallback(
    (k?: number) => {
      if (k !== undefined) setIndice(k);
      setErrore(null);
      setFase("caricamento");
      setSessione((s) => s + 1);
      prendiAudio({ id, ferma: () => fermaRef.current(false), elemento: () => box.current });
    },
    [id],
  );

  useImperativeHandle(
    comandi,
    () => ({
      mostra: (k: number) => {
        lasciaAudio(id);
        setErrore(null);
        setFase("rotazione");
        setIndice(k);
      },
      avvia: (k: number) => avvia(k),
      ferma: () => fermaRef.current(false),
    }),
    [avvia, id],
  );

  /* Smontaggio (cambio pagina/canale): il registro dimentica questo monitor. */
  useEffect(() => () => lasciaAudio(id), [id]);

  const segnala = useRef(onErroreVoce);
  segnala.current = onErroreVoce;
  const voceRef = useRef(v);
  voceRef.current = v;
  const bloccato = useCallback((motivo: string) => {
    lasciaAudio(id);
    setErrore(motivo);
    setFase("bloccato");
    if (voceRef.current) segnala.current?.(voceRef.current, motivo);
  }, [id]);

  if (!v) {
    return (
      <div
        className={`relative grid aspect-video w-full place-items-center overflow-hidden rounded-xl border bg-[#0b0b0d] px-4 text-center ${className}`}
        style={{ borderColor: bordo ?? "rgba(255,255,255,0.14)" }}
        data-testid={testid}
      >
        {vuoto ?? <span className="text-sm font-bold text-white/60">Contenuti in arrivo</span>}
      </div>
    );
  }

  const fonte = v.link ?? (v.youtube ? `https://www.youtube.com/watch?v=${v.youtube}` : null);
  const etichettaFonte = v.linkEtichetta ?? (v.youtube ? "Guarda su YouTube" : "Apri la fonte");
  const immagineVisibile = !(fase === "riproduzione" && v.youtube) && fase !== "tocca";

  return (
    <div
      ref={box}
      className={`relative aspect-video w-full overflow-hidden rounded-xl border bg-[#0b0b0d] ${className}`}
      style={{ borderColor: bordo ?? (suona ? colore : "rgba(255,255,255,0.14)") }}
      data-testid={testid}
      data-fase={fase}
      data-indice={i}
      data-voce={v.id}
      data-durata={durataVoce}
      aria-roledescription="monitor a rotazione"
      aria-label={etichetta ?? "Monitor"}
    >
      {/* PLAYER (sotto l'immagine finché il video non parte davvero) */}
      {suona && v.youtube && (
        <PlayerYouTube
          key={sequenza ? `seq-${sessione}` : `${v.id}-${sessione}`}
          videoId={v.youtube}
          passo={passo}
          onParte={() => setFase("riproduzione")}
          onTocca={() => setFase((f) => (f === "caricamento" ? "tocca" : f))}
          onFine={fineVoce}
          onErrore={bloccato}
        />
      )}
      {suona && !v.youtube && v.media && (
        <PlayerMedia key={`${v.id}-${sessione}`} src={v.media} onParte={() => setFase("riproduzione")} onFine={() => ferma(true)} onErrore={bloccato} />
      )}

      {/* IMMAGINE — resta durante caricamento, audio e blocco: mai schermo nero */}
      {immagineVisibile && (
        <div key={v.id} className="tbh-monitor-entra absolute inset-0" data-testid={testid ? `${testid}-immagine` : undefined}>
          {v.immagine ? (
            <>
              <img src={v.immagine} alt="" aria-hidden className="absolute inset-0 h-full w-full scale-110 object-cover opacity-45 blur-xl" referrerPolicy="no-referrer" />
              <img
                src={v.immagine}
                alt={v.titolo}
                className="absolute inset-0 h-full w-full object-contain"
                referrerPolicy="no-referrer"
                decoding="async"
              />
            </>
          ) : (
            <div
              className="absolute inset-0 grid place-items-center px-6 text-center"
              style={{ background: `radial-gradient(120% 90% at 50% 0%, ${colore}22, #0b0b0d 70%)` }}
            >
              <span className="text-balance text-[clamp(18px,2.4vw,30px)] font-black leading-tight text-white">{v.titolo}</span>
            </div>
          )}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/90 via-black/45 to-transparent" />
        </div>
      )}

      {/* TESTATA: etichetta, posizione, frecce */}
      {immagineVisibile && (
        <div className="absolute inset-x-0 top-0 flex items-start justify-between gap-2 p-2 sm:p-3">
          <span className="min-w-0 truncate rounded-full bg-black/70 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.18em] text-white/85 backdrop-blur">
            {etichetta ? `${etichetta} · ` : ""}
            {i + 1}/{n}
          </span>
          {n > 1 && fase === "rotazione" && (
            <span className="flex shrink-0 gap-1">
              <button
                type="button"
                onClick={() => setIndice((x) => (x - 1 + n) % n)}
                className="grid h-9 w-9 place-items-center rounded-full bg-black/70 text-white backdrop-blur transition hover:bg-black"
                aria-label="Contenuto precedente"
              >
                <ChevronLeft size={18} aria-hidden />
              </button>
              <button
                type="button"
                onClick={() => setIndice((x) => (x + 1) % n)}
                className="grid h-9 w-9 place-items-center rounded-full bg-black/70 text-white backdrop-blur transition hover:bg-black"
                aria-label="Contenuto successivo"
              >
                <ChevronRight size={18} aria-hidden />
              </button>
            </span>
          )}
        </div>
      )}

      {/* TITOLO + PLAY */}
      {immagineVisibile && fase !== "bloccato" && (
        <div className="absolute inset-x-0 bottom-0 flex flex-col gap-2 p-3 sm:p-4" aria-live="polite">
          {v.sotto && <p className="truncate text-[10px] font-extrabold uppercase tracking-[0.18em]" style={{ color: colore }}>{v.sotto}</p>}
          <h3 className="line-clamp-2 text-balance text-[clamp(14px,1.7vw,22px)] font-black leading-tight text-white" data-testid={testid ? `${testid}-titolo` : undefined}>
            {v.titolo}
          </h3>
          <div className="flex flex-wrap items-center gap-2">
            {avviabile && fase === "rotazione" && (
              <button
                type="button"
                onClick={() => avvia()}
                className="inline-flex min-h-10 items-center gap-1.5 rounded-full px-4 text-[11px] font-extrabold tracking-[0.14em] text-black transition hover:brightness-110"
                style={{ background: colore }}
                data-testid={testid ? `${testid}-play` : undefined}
              >
                <Play size={14} fill="currentColor" aria-hidden /> {playLabel}
              </button>
            )}
            {fase === "caricamento" && (
              <span className="inline-flex min-h-10 items-center gap-2 rounded-full bg-black/75 px-4 text-[11px] font-extrabold tracking-[0.14em] text-white" data-testid={testid ? `${testid}-carica` : undefined}>
                <Loader2 size={14} className="animate-spin" aria-hidden /> CARICAMENTO…
              </span>
            )}
            {suona && (
              <button
                type="button"
                onClick={() => ferma(false)}
                className="inline-flex min-h-10 items-center gap-1.5 rounded-full border border-white/30 bg-black/70 px-4 text-[11px] font-extrabold tracking-[0.14em] text-white"
              >
                <Square size={12} fill="currentColor" aria-hidden /> STOP
              </button>
            )}
            {v.scheda && fase === "rotazione" && (
              <Link
                href={v.scheda}
                className="inline-flex min-h-10 items-center rounded-full border border-white/30 bg-black/60 px-4 text-[11px] font-extrabold tracking-[0.14em] text-white transition hover:border-white"
              >
                {v.schedaEtichetta ?? "SCHEDA"}
              </Link>
            )}
          </div>
        </div>
      )}

      {/* PLAYER BLOCCATO */}
      {fase === "bloccato" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 overflow-y-auto bg-black/60 p-3 text-center backdrop-blur-[2px] sm:gap-3 sm:p-4" data-testid={testid ? `${testid}-bloccato` : undefined}>
          <p className="line-clamp-2 max-w-md text-balance text-[13px] font-bold leading-snug text-white sm:text-sm">{v.titolo}</p>
          <p className="hidden max-w-md text-[12px] text-white/70 sm:block">Il video non parte in questo player{errore ? ` (${errore})` : ""}.</p>
          {v.notaBlocco && <p className="max-w-md text-[11px] font-bold leading-snug text-white/85 sm:text-[12px]">{v.notaBlocco}</p>}
          <div className="flex flex-wrap justify-center gap-2">
            {fonte && (
              <a
                href={fonte}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-11 items-center gap-1.5 rounded-full px-4 text-[11px] font-extrabold tracking-[0.1em] text-black sm:px-5 sm:text-[12px] sm:tracking-[0.12em]"
                style={{ background: colore }}
                data-testid={testid ? `${testid}-guarda-youtube` : undefined}
              >
                {etichettaFonte.toUpperCase()} <ExternalLink size={14} aria-hidden />
              </a>
            )}
            {sequenza && prossimoAvviabile(i) !== null && (
              <button
                type="button"
                onClick={() => avvia(prossimoAvviabile(i)!)}
                className="inline-flex min-h-11 items-center gap-1.5 rounded-full border px-4 text-[11px] font-extrabold tracking-[0.1em] text-white sm:px-5 sm:text-[12px] sm:tracking-[0.12em]"
                style={{ borderColor: colore }}
                aria-label="Video successivo della scaletta"
                data-testid={testid ? `${testid}-successivo` : undefined}
              >
                <SkipForward size={13} aria-hidden /> SUCCESSIVO
              </button>
            )}
            <button
              type="button"
              onClick={() => ferma(true)}
              className="inline-flex min-h-11 items-center gap-1.5 rounded-full border border-white/30 bg-black/70 px-4 text-[11px] font-extrabold tracking-[0.1em] text-white sm:px-5 sm:text-[12px] sm:tracking-[0.12em]"
              aria-label="Riprendi rotazione"
            >
              <RotateCcw size={13} aria-hidden /> RIPRENDI<span className="hidden sm:inline"> ROTAZIONE</span>
            </button>
          </div>
        </div>
      )}

      {/* IN RIPRODUZIONE (video visibile): comandi piccoli in alto, i comandi YouTube restano liberi in basso */}
      {!immagineVisibile && (
        <div className="absolute left-2 top-2 z-10 flex gap-1.5">
          <button
            type="button"
            onClick={() => ferma(false)}
            className="inline-flex h-9 items-center gap-1.5 rounded-full bg-black/80 px-3 text-[10px] font-extrabold tracking-[0.14em] text-white"
            data-testid={testid ? `${testid}-stop` : undefined}
          >
            <Square size={11} fill="currentColor" aria-hidden /> STOP
          </button>
          {fonte && (
            <a
              href={fonte}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-9 items-center gap-1 rounded-full bg-black/80 px-3 text-[10px] font-extrabold tracking-[0.14em] text-white"
            >
              YOUTUBE <ExternalLink size={11} aria-hidden />
            </a>
          )}
        </div>
      )}

      {/* TEMPO DELLA ROTAZIONE */}
      {fase === "rotazione" && n > 1 && (
        <div className="absolute inset-x-0 bottom-0 h-[3px] bg-white/10">
          <div key={`${v.id}-${i}-${durataVoce}`} className="tbh-monitor-tempo h-full" style={{ background: colore, animationDuration: `${durataVoce}s` }} />
        </div>
      )}
    </div>
  );
}

/* ── PLAYER ───────────────────────────────────────────────────────────────── */

const ATTESA_MAX_MS = 15_000;

function PlayerYouTube({
  videoId,
  passo = 0,
  onParte,
  onTocca,
  onFine,
  onErrore,
}: {
  videoId: string;
  /** Con lo stesso player montato: un nuovo `videoId`/`passo` carica il video successivo (loadVideoById). */
  passo?: number;
  onParte: () => void;
  onTocca: () => void;
  onFine: () => void;
  onErrore: (motivo: string) => void;
}) {
  const box = useRef<HTMLDivElement>(null);
  const cb = useRef({ onParte, onTocca, onFine, onErrore });
  cb.current = { onParte, onTocca, onFine, onErrore };
  const player = useRef<YTPlayer | null>(null);
  const pronto = useRef(false);
  const caricato = useRef({ id: videoId, passo });
  const t = useRef({ partito: false, scadenza: 0, controllo: 0 });

  /** Per ogni video: tempo massimo di risposta e controllo della riproduzione automatica negata. */
  const arma = useCallback((conControllo: boolean) => {
    window.clearTimeout(t.current.scadenza);
    window.clearTimeout(t.current.controllo);
    t.current.partito = false;
    t.current.scadenza = window.setTimeout(() => {
      if (!t.current.partito) cb.current.onErrore("il player non risponde");
    }, ATTESA_MAX_MS);
    if (conControllo)
      /* Riproduzione automatica negata dal browser: si mostra il player YouTube (con la sua
         anteprima e il suo tasto Play), non uno schermo nero. */
      t.current.controllo = window.setTimeout(() => {
        const s = player.current?.getPlayerState?.();
        if (!t.current.partito && (s === -1 || s === 5)) cb.current.onTocca();
      }, 4000);
  }, []);

  useEffect(() => {
    let vivo = true;
    const tempi = t.current;
    arma(false);
    caricaYouTube()
      .then((YT) => {
        if (!vivo || !box.current) return;
        const el = document.createElement("div");
        box.current.appendChild(el);
        player.current = new YT.Player(el, {
          videoId: caricato.current.id,
          width: "100%",
          height: "100%",
          playerVars: { autoplay: 1, playsinline: 1, rel: 0, modestbranding: 1 },
          events: {
            onReady: (e) => {
              pronto.current = true;
              e.target.playVideo();
              arma(true);
            },
            onStateChange: (e) => {
              if (e.data === 1 && !t.current.partito) {
                t.current.partito = true;
                window.clearTimeout(t.current.scadenza);
                cb.current.onParte();
              }
              if (e.data === 0) cb.current.onFine();
            },
            onError: (e) => {
              window.clearTimeout(t.current.scadenza);
              cb.current.onErrore(ERRORI_YT[e.data] ?? `errore YouTube ${e.data}`);
            },
          },
        });
      })
      .catch(() => {
        window.clearTimeout(tempi.scadenza);
        if (vivo) cb.current.onErrore("YouTube non raggiungibile");
      });
    return () => {
      vivo = false;
      window.clearTimeout(tempi.scadenza);
      window.clearTimeout(tempi.controllo);
      try {
        player.current?.destroy();
      } catch {
        /* già distrutto */
      }
      player.current = null;
      pronto.current = false;
    };
  }, [arma]);

  /* Video successivo della scaletta nello stesso player: la riproduzione resta «sbloccata» dal primo clic. */
  useEffect(() => {
    if (caricato.current.id === videoId && caricato.current.passo === passo) return;
    caricato.current = { id: videoId, passo };
    if (!pronto.current || !player.current) return; // il player in arrivo parte già da questo video
    player.current.loadVideoById(videoId);
    arma(true);
  }, [videoId, passo, arma]);

  return <div ref={box} className="absolute inset-0 bg-black [&_iframe]:h-full [&_iframe]:w-full" data-player="youtube" />;
}

function PlayerMedia({ src, onParte, onFine, onErrore }: { src: string; onParte: () => void; onFine: () => void; onErrore: (m: string) => void }) {
  const el = useRef<HTMLAudioElement>(null);
  useEffect(() => {
    const a = el.current;
    if (!a) return;
    a.play().catch(() => onErrore("riproduzione non consentita dal browser"));
    return () => {
      a.pause();
      a.removeAttribute("src");
      a.load();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src]);
  return (
    <audio
      ref={el}
      src={src}
      preload="auto"
      onPlaying={onParte}
      onEnded={onFine}
      onError={() => onErrore("file non raggiungibile")}
      className="hidden"
      data-player="media"
    />
  );
}
