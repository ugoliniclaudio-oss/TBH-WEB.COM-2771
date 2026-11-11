import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ExternalLink, Play, Radio, Repeat, SkipForward } from "lucide-react";
import { caricaYouTube, ERRORI_YT } from "./canale-tematico-player";
import { segnalaErroreCms, useHomeCms, type PlaylistCms, type VoceCms } from "../queries/contenuti-palinsesto";

/**
 * PLAYER DELLE PLAYLIST DEL PANNELLO «GESTIONE CONTENUTI E PALINSESTO» (28/10/2026).
 *
 * Due modalità, sempre dichiarate a schermo:
 *   · PLAY — la playlist parte DA CAPO quando lo spettatore preme Play (ognuno ha la sua visione);
 *   · DIRETTA SINCRONIZZATA — la posizione si calcola dall'orologio e dall'«ancora» della playlist:
 *     tutti gli spettatori vedono lo stesso video allo stesso punto. Serve la durata di ogni video;
 *     quelli senza durata restano fuori dalla diretta (segnalati).
 * Ciclo continuo: a fine sequenza si riparte dal primo. Video in errore: si salta al successivo,
 * l'errore si registra nel pannello (sezione Errori) e il video non si ripropone nel giro.
 */

const GIALLO = "#d7ff00";
const ORO = "#d4af37";

type Fine = () => void;
type Errore = (codice: string, messaggio: string) => void;
type YTLike = {
  loadVideoById: (o: { videoId: string; startSeconds?: number }) => void;
  playVideo: () => void;
  destroy: () => void;
};

function YouTubeDa({ id, da, passo, onFine, onErrore }: { id: string; da: number; passo: number; onFine: Fine; onErrore: Errore }) {
  const box = useRef<HTMLDivElement>(null);
  const player = useRef<YTLike | null>(null);
  const pronto = useRef(false);
  const cb = useRef({ onFine, onErrore });
  cb.current = { onFine, onErrore };
  const iniziale = useRef({ id, da });

  useEffect(() => {
    let vivo = true;
    caricaYouTube()
      .then((YT) => {
        if (!vivo || !box.current) return;
        const el = document.createElement("div");
        box.current.appendChild(el);
        player.current = new YT.Player(el, {
          videoId: iniziale.current.id,
          width: "100%",
          height: "100%",
          playerVars: { autoplay: 1, playsinline: 1, rel: 0, modestbranding: 1, start: Math.floor(iniziale.current.da) },
          events: {
            onReady: (e) => {
              pronto.current = true;
              e.target.playVideo();
            },
            onStateChange: (e) => e.data === 0 && cb.current.onFine(),
            onError: (e) => cb.current.onErrore(`yt-${e.data}`, ERRORI_YT[e.data] ?? `errore YouTube ${e.data}`),
          },
        }) as unknown as YTLike;
      })
      .catch((e: Error) => cb.current.onErrore("yt-api", e.message));
    return () => {
      vivo = false;
      try {
        player.current?.destroy();
      } catch {
        /* già chiuso */
      }
      player.current = null;
      pronto.current = false;
    };
  }, []);

  useEffect(() => {
    if (!pronto.current || !player.current) return;
    player.current.loadVideoById({ videoId: id, startSeconds: Math.floor(da) });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, passo]);

  return <div ref={box} className="absolute inset-0 [&>div]:h-full [&>div]:w-full [&_iframe]:h-full [&_iframe]:w-full" />;
}

function VimeoDa({ id, da, onFine, onErrore }: { id: string; da: number; onFine: Fine; onErrore: Errore }) {
  const frame = useRef<HTMLIFrameElement>(null);
  const cb = useRef({ onFine, onErrore });
  cb.current = { onFine, onErrore };
  useEffect(() => {
    const invia = (method: string, value?: string) =>
      frame.current?.contentWindow?.postMessage(JSON.stringify(value ? { method, value } : { method }), "https://player.vimeo.com");
    const ascolta = (e: MessageEvent) => {
      if (e.origin !== "https://player.vimeo.com" || e.source !== frame.current?.contentWindow) return;
      let d: { event?: string; data?: { message?: string } } = {};
      try {
        d = typeof e.data === "string" ? JSON.parse(e.data) : e.data;
      } catch {
        return;
      }
      if (d.event === "ready") for (const ev of ["finish", "error"]) invia("addEventListener", ev);
      if (d.event === "finish") cb.current.onFine();
      if (d.event === "error") cb.current.onErrore("vimeo", d.data?.message ?? "errore del player Vimeo");
    };
    window.addEventListener("message", ascolta);
    return () => window.removeEventListener("message", ascolta);
  }, [id]);
  return (
    <iframe
      ref={frame}
      src={`https://player.vimeo.com/video/${id}?autoplay=1&playsinline=1&title=0&byline=0#t=${Math.floor(da)}s`}
      className="absolute inset-0 h-full w-full"
      allow="autoplay; fullscreen; picture-in-picture"
      allowFullScreen
      title="Player Vimeo"
    />
  );
}

function DailymotionDa({ id, da, durataSec, onFine }: { id: string; da: number; durataSec: number | null; onFine: Fine }) {
  useEffect(() => {
    if (!durataSec) return;
    const t = window.setTimeout(onFine, Math.max(3, durataSec - da + 3) * 1000);
    return () => window.clearTimeout(t);
  }, [id, da, durataSec, onFine]);
  return (
    <iframe
      src={`https://www.dailymotion.com/embed/video/${id}?autoplay=1&start=${Math.floor(da)}`}
      className="absolute inset-0 h-full w-full"
      allow="autoplay; fullscreen; picture-in-picture"
      allowFullScreen
      title="Player Dailymotion"
    />
  );
}

function FileDa({ src, da, onFine, onErrore }: { src: string; da: number; onFine: Fine; onErrore: Errore }) {
  const v = useRef<HTMLVideoElement>(null);
  return (
    <video
      ref={v}
      src={src}
      className="absolute inset-0 h-full w-full bg-black"
      controls
      playsInline
      autoPlay
      preload="metadata"
      onLoadedMetadata={() => {
        if (v.current && da > 0) v.current.currentTime = Math.min(da, Math.max(0, (v.current.duration || da) - 1));
      }}
      onEnded={onFine}
      onError={() => onErrore("file", "il file video non si riproduce")}
    />
  );
}

/** Posizione nella diretta: indice NELLA SEQUENZA data e secondo di partenza, dato l'istante. */
export function posizioneDiretta(seq: VoceCms[], ancora: number, ciclo: boolean, adesso: number) {
  const totale = seq.reduce((t, v) => t + (v.durataSec ?? 0), 0);
  if (!totale) return { stato: "senza-durata" as const };
  let t = (adesso - ancora) / 1000;
  if (t < 0) return { stato: "non-iniziata" as const, traSec: -t };
  if (!ciclo && t >= totale) return { stato: "terminata" as const };
  t = t % totale;
  for (let i = 0; i < seq.length; i++) {
    const d = seq[i]!.durataSec ?? 0;
    if (!d) continue;
    if (t < d) return { stato: "in-onda" as const, indice: i, da: t, resto: d - t };
    t -= d;
  }
  return { stato: "in-onda" as const, indice: 0, da: 0, resto: seq[0]?.durataSec ?? 0 };
}

const durataTesto = (s: number) => {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const ss = Math.floor(s % 60);
  return h ? `${h}:${String(m).padStart(2, "0")}:${String(ss).padStart(2, "0")}` : `${m}:${String(ss).padStart(2, "0")}`;
};

export function PlayerPlaylistCms({ playlist, dove }: { playlist: PlaylistCms; dove: string }) {
  const diretta = playlist.modalita === "diretta";
  const falliti = useRef(new Set<string>());
  const [avviato, setAvviato] = useState(false);
  const [indice, setIndice] = useState(0);
  const [da, setDa] = useState(0);
  const [passo, setPasso] = useState(0);
  const [giro, setGiro] = useState(1);
  const [finita, setFinita] = useState(false);
  const [avviso, setAvviso] = useState<string | null>(null);

  /* In diretta contano solo i video con durata; in Play tutti quelli riproducibili. */
  const voci = useMemo(
    () => playlist.sequenza.filter((v) => !falliti.current.has(v.collocazione) && (!diretta || (v.durataSec ?? 0) > 0)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [playlist.sequenza, diretta, passo],
  );
  const corrente = avviato ? (voci[indice] ?? null) : null;
  const correnteRef = useRef(corrente);
  correnteRef.current = corrente;

  const entraInDiretta = useCallback(
    (dopo?: number) => {
      const p = posizioneDiretta(voci, playlist.ancora, playlist.ciclo, Date.now());
      if (p.stato !== "in-onda") {
        setAvviso(
          p.stato === "non-iniziata"
            ? `La diretta inizia fra ${durataTesto(p.traSec)}.`
            : p.stato === "terminata"
              ? "La diretta di questa playlist è terminata (ciclo continuo spento)."
              : "Diretta non disponibile: nessun video con durata nota.",
        );
        setAvviato(false);
        return;
      }
      let i = p.indice;
      let da = p.da;
      /* fine naturale con la durata dichiarata un po' più lunga del video: si passa al successivo */
      if (dopo !== undefined && i === dopo && p.resto < 20) {
        i = (i + 1) % voci.length;
        da = 0;
      }
      setIndice(i);
      setDa(da);
      setAvviato(true);
      setFinita(false);
      setPasso((n) => n + 1);
    },
    [voci, playlist.ancora, playlist.ciclo],
  );

  const avanti = useCallback(() => {
    setAvviso(null);
    if (diretta) {
      entraInDiretta(indice);
      return;
    }
    setDa(0);
    setPasso((n) => n + 1);
    setIndice((i) => {
      if (i + 1 < voci.length) return i + 1;
      if (playlist.ciclo) {
        setGiro((g) => g + 1);
        return 0;
      }
      setFinita(true);
      setAvviato(false);
      return 0;
    });
  }, [voci.length, playlist.ciclo, diretta, entraInDiretta, indice]);

  const errore = useCallback(
    (codice: string, messaggio: string) => {
      const c = correnteRef.current;
      if (!c || falliti.current.has(c.collocazione)) return;
      falliti.current.add(c.collocazione);
      setAvviso(`«${c.titolo}» non è riproducibile (${messaggio}): passo al successivo.`);
      void segnalaErroreCms({ schedaId: c.scheda, codice, messaggio, dove });
      window.setTimeout(() => {
        if (correnteRef.current?.collocazione !== c.collocazione) return;
        setDa(0);
        setPasso((n) => n + 1);
        /* la lista si accorcia: lo stesso indice punta già al successivo */
        setIndice((i) => (i < voci.length - 1 ? i : 0));
      }, 1200);
    },
    [dove, voci.length],
  );

  /* Diretta: se la scaletta cambia mentre si guarda, ci si riallinea all'orologio al video successivo. */
  useEffect(() => {
    if (indice >= voci.length && voci.length) setIndice(0);
  }, [indice, voci.length]);

  const copertina = voci[0]?.immagine ?? null;
  const nVideo = voci.length;

  return (
    <section className="flex flex-col gap-3" data-testid={`playlist-${playlist.id}`} data-modalita={playlist.modalita}>
      <div className="flex flex-wrap items-center gap-2">
        <h3 className="text-[13px] font-black tracking-[0.2em] text-white md:text-sm">{playlist.nome}</h3>
        <span
          className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-extrabold tracking-[0.14em] text-black"
          style={{ background: diretta ? GIALLO : ORO }}
          data-testid="modalita-playlist"
        >
          {diretta ? <Radio className="h-3 w-3" /> : <Play className="h-3 w-3" />}
          {diretta ? "DIRETTA SINCRONIZZATA" : "PLAYLIST · PARTE DA CAPO CON PLAY"}
        </span>
        {playlist.ciclo && (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold tracking-[0.12em] text-white/60">
            <Repeat className="h-3 w-3" /> CICLO CONTINUO
          </span>
        )}
      </div>

      <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-white/10 bg-black">
        {corrente?.video?.piattaforma === "youtube" && corrente.video.embedId && (
          <YouTubeDa id={corrente.video.embedId} da={da} passo={passo} onFine={avanti} onErrore={errore} />
        )}
        {corrente?.video?.piattaforma === "vimeo" && corrente.video.embedId && <VimeoDa key={passo} id={corrente.video.embedId} da={da} onFine={avanti} onErrore={errore} />}
        {corrente?.video?.piattaforma === "dailymotion" && corrente.video.embedId && (
          <DailymotionDa key={passo} id={corrente.video.embedId} da={da} durataSec={corrente.durataSec} onFine={avanti} />
        )}
        {corrente?.video?.piattaforma === "video" && <FileDa key={passo} src={corrente.video.url} da={da} onFine={avanti} onErrore={errore} />}
        {!corrente && (
          <div className="absolute inset-0">
            {copertina && <img src={copertina} alt="" className="absolute inset-0 h-full w-full object-cover opacity-40" referrerPolicy="no-referrer" />}
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-4 text-center">
              {nVideo ? (
                <button
                  type="button"
                  onClick={() => {
                    if (diretta) entraInDiretta();
                    else {
                      setIndice(0);
                      setDa(0);
                      setGiro(1);
                      setFinita(false);
                      setAvviato(true);
                      setPasso((n) => n + 1);
                    }
                  }}
                  className="flex flex-col items-center gap-3 text-white"
                  data-testid="avvia-playlist"
                >
                  <span className="flex h-16 w-16 items-center justify-center rounded-full text-black" style={{ background: GIALLO }}>
                    <Play className="h-7 w-7" fill="currentColor" />
                  </span>
                  <span className="text-sm font-extrabold tracking-[0.2em]">{diretta ? "ENTRA IN DIRETTA" : finita ? "RIGUARDA DA CAPO" : "PLAY"}</span>
                </button>
              ) : (
                <p className="max-w-md text-sm text-white/70" data-testid="playlist-vuota">
                  {diretta && playlist.sequenza.length ? "Diretta non disponibile: ai video manca la durata." : "Nessun video in programma in questo momento."}
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {corrente && (
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[10px] font-extrabold tracking-[0.22em] text-white/50">{diretta ? "IN DIRETTA ORA" : "ORA IN RIPRODUZIONE"}</p>
            <h4 className="mt-1 text-base font-extrabold leading-tight text-white md:text-lg" data-testid="playlist-titolo">
              {corrente.titolo}
            </h4>
            <p className="mt-1 text-[11px] text-white/45">
              {corrente.fonte ? `Fonte: ${corrente.fonte} · ` : ""}
              {corrente.video && (
                <a href={corrente.video.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 underline hover:text-white">
                  URL originale <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </p>
          </div>
          {!diretta && (
            <button
              type="button"
              onClick={avanti}
              className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-extrabold tracking-[0.14em] text-black"
              style={{ background: GIALLO }}
              data-testid="playlist-successivo"
            >
              <SkipForward className="h-4 w-4" /> SUCCESSIVO
            </button>
          )}
          {diretta && (
            <button type="button" onClick={() => entraInDiretta()} className="rounded-full border border-white/20 px-4 py-2 text-[11px] font-extrabold tracking-[0.12em] text-white/80 hover:text-white">
              RIALLINEA ALLA DIRETTA
            </button>
          )}
        </div>
      )}

      {avviso && <p className="rounded-lg border border-white/15 bg-white/[0.04] px-3 py-2 text-xs text-white/80" data-testid="playlist-avviso">{avviso}</p>}

      <p className="text-[11px] text-white/50">
        {nVideo} video · {durataTesto(playlist.durataTotaleSec)}
        {avviato ? `${diretta ? "" : ` · giro ${giro}`} · ${indice + 1}/${nVideo}` : ""}
        {diretta
          ? " · Tutti gli spettatori vedono lo stesso punto, calcolato sull'orologio."
          : " · Ogni spettatore parte dal primo video quando preme Play."}
        {diretta && playlist.senzaDurata ? ` · ${playlist.senzaDurata} video senza durata fuori dalla diretta.` : ""}
      </p>
      {playlist.esclusi.length > 0 && (
        <ul className="text-[11px] text-white/50" data-testid="playlist-esclusi">
          {playlist.esclusi.map((e) => (
            <li key={e.url}>
              Non nel player: «{e.titolo}» — {e.motivo}{" "}
              <a href={e.url} target="_blank" rel="noreferrer" className="underline hover:text-white">
                Apri alla fonte
              </a>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

/** Palinsesti (playlist) assegnati a Home 0 dal pannello: nulla a schermo finché non ce ne sono. */
export function PalinsestiHome0() {
  const q = useHomeCms("0");
  const d = q.data;
  const lista = d && d.pubblicata ? d.palinsesti.filter((p) => p.sequenza.length > 0) : [];
  if (!lista.length) return null;
  return (
    <section className="mx-auto mt-8 grid max-w-[1500px] grid-cols-1 gap-6 px-4 md:px-8 lg:grid-cols-2" aria-label="Palinsesti" data-testid="palinsesti-home0">
      {lista.map((p) => (
        <PlayerPlaylistCms key={p.id} playlist={p} dove="/" />
      ))}
    </section>
  );
}
