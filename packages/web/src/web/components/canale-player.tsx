import { useEffect, useMemo, useRef, useState } from "react";
import { ExternalLink, Headphones, Pause, Play, Radio, Tv, Volume2, VolumeX } from "lucide-react";
import type { ElementoCanale } from "../../api/lib/touch-canali";
import type { CanaleTouchId } from "../../api/data/touch-canali";
import { oraRoma } from "../hooks/use-radio-adesso";
import { CHIAVE_AVVIO, eventoAccendi, sessioneCanale, useCanaleAdesso } from "../hooks/use-canale-adesso";
import { registraEventoCanale } from "../queries/canali-touch";
import { COLORE_TBH } from "../lib/identita-tbh";
import { eDm, etichettaElemento, nomeRubrica } from "../lib/canali-touch";

/**
 * PLAYER DI UN CANALE TBH.
 *
 *   TOUCH RADIO → player AUDIO: si ascolta. I brani Suno passano dal lettore audio;
 *                 i contenuti che esistono solo su YouTube (spot, visual, dirette DM)
 *                 passano dal player ufficiale YouTube, perché non c'è un flusso audio.
 *   TOUCH TV    → player VIDEO: si guarda. Spot, visual YouTube e dirette DM a schermo;
 *                 i brani SOLO AUDIO mostrano la COPERTINA UFFICIALE del brano (con
 *                 l'audio originale): nessun videoclip inventato.
 *
 * Stesso palinsesto (oggi condiviso), due player, due rendiconti: ogni player registra
 * i propri avvii e passaggi sul proprio canale.
 */

const ROSSO_DM = "#ff2b2b";

function idYouTube(s: string): string | null {
  if (/^[\w-]{11}$/.test(s)) return s;
  const m = s.match(/(?:v=|youtu\.be\/|embed\/|shorts\/|live\/)([\w-]{11})/);
  return m ? m[1]! : null;
}

type Media =
  | { kind: "audio"; src: string }
  | { kind: "youtube"; id: string }
  | { kind: "embed"; src: string }
  | { kind: "nessuno" };

function mediaDi(e: ElementoCanale): Media {
  if (e.tipo === "brano") return e.fonte.tipo === "audio" ? { kind: "audio", src: e.fonte.src } : { kind: "youtube", id: e.fonte.videoId };
  if (e.tipo === "spot") return { kind: "youtube", id: e.videoId };
  if (e.tipo === "dm") return { kind: "embed", src: e.embed };
  if (e.formato === "audio") return { kind: "audio", src: e.sorgente };
  const id = idYouTube(e.sorgente);
  if (id) return { kind: "youtube", id };
  if (/^https:\/\//.test(e.sorgente)) return { kind: "embed", src: e.sorgente };
  return { kind: "nessuno" };
}

function copertina(e: ElementoCanale, m: Media): string | null {
  if (e.tipo === "brano" && e.cover) return e.cover;
  if (m.kind === "youtube") return `https://i.ytimg.com/vi/${m.id}/hqdefault.jpg`;
  return null;
}

function inserzionistaDi(e: ElementoCanale): string | null {
  if (e.tipo === "spot") return e.inserzionista;
  if (e.tipo === "programma") return e.inserzionista;
  return null;
}

function mmss(sec: number): string {
  const s = Math.max(0, Math.floor(sec));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

function embedYouTube(id: string, startSec: number): string {
  const p = new URLSearchParams({
    autoplay: "1",
    start: String(Math.floor(startSec)),
    playsinline: "1",
    rel: "0",
    modestbranding: "1",
  });
  return `https://www.youtube.com/embed/${id}?${p}`;
}

function conAutoplay(src: string) {
  return src.includes("?") ? `${src}&autoplay=1` : `${src}?autoplay=1`;
}

/** `compatto`: schermo sopra e dati sotto a ogni larghezza (due player affiancati in home). */
export function CanalePlayer({ canale, compatto = false }: { canale: CanaleTouchId; compatto?: boolean }) {
  const tv = canale === "tv";
  const { oggi, scarto, adesso, corrente } = useCanaleAdesso(canale, 500);
  const colore = COLORE_TBH;

  const [acceso, setAcceso] = useState(false);
  const [muto, setMuto] = useState(false);
  const audio = useRef<HTMLAudioElement | null>(null);

  const chiave = corrente ? `${corrente.tipo}-${corrente.inizio}` : "nessuno";
  const media: Media = corrente ? mediaDi(corrente) : { kind: "nessuno" };
  const audioSrc = media.kind === "audio" ? media.src : null;

  const partenza = useMemo(
    () => (corrente ? Math.max(0, (Date.now() + scarto - corrente.inizio) / 1000) : 0),
    [chiave, acceso],
  );

  /* Lettore audio agganciato al secondo giusto a ogni cambio passaggio. */
  useEffect(() => {
    const el = audio.current;
    if (!el) return;
    if (!acceso || !audioSrc || !corrente) {
      el.pause();
      return;
    }
    const inizio = corrente.inizio;
    const allinea = () => {
      el.currentTime = Math.max(0, (Date.now() + scarto - inizio) / 1000);
    };
    if (el.getAttribute("src") !== audioSrc) el.src = audioSrc;
    if (el.readyState >= 1) allinea();
    else el.addEventListener("loadedmetadata", allinea, { once: true });
    el.play().catch((err: unknown) => {
      if (err instanceof DOMException && err.name === "NotAllowedError") setAcceso(false);
    });
    return () => el.removeEventListener("loadedmetadata", allinea);
  }, [acceso, audioSrc, chiave]);

  useEffect(() => {
    if (audio.current) audio.current.muted = muto;
  }, [muto]);

  /* STATISTICHE DEL CANALE: un passaggio conta solo se il player è acceso. */
  useEffect(() => {
    if (!acceso || !corrente) return;
    registraEventoCanale({
      canale,
      evento: "passaggio",
      sessione: sessioneCanale(),
      tipo: corrente.tipo,
      rubrica: corrente.rubrica,
      titolo: corrente.titolo,
      inserzionista: inserzionistaDi(corrente),
      inizio: corrente.inizio,
    });
  }, [acceso, chiave, canale]);

  const accendi = () => {
    const el = audio.current;
    if (el && audioSrc) {
      el.src = audioSrc;
      void el.play().catch(() => undefined);
    }
    setAcceso(true);
    registraEventoCanale({ canale, evento: "avvio", sessione: sessioneCanale(), inizio: 0 });
  };

  const accendiRef = useRef(accendi);
  accendiRef.current = accendi;
  useEffect(() => {
    const ascolta = () => accendiRef.current();
    const nome = eventoAccendi(canale);
    window.addEventListener(nome, ascolta);
    return () => window.removeEventListener(nome, ascolta);
  }, [canale]);

  /* Arrivo dal carosello «SEGUI LA DIRETTA ORA»: si prova a partire subito. */
  const pronto = !!corrente;
  useEffect(() => {
    if (!pronto) return;
    try {
      if (sessionStorage.getItem(CHIAVE_AVVIO) === canale) {
        sessionStorage.removeItem(CHIAVE_AVVIO);
        accendiRef.current();
      }
    } catch {
      /* niente sessionStorage: resta il pulsante */
    }
  }, [pronto, canale]);

  if (oggi.isLoading) {
    return <div className="tbh-card p-6 text-sm text-[var(--tbh-muted)]">Caricamento del palinsesto…</div>;
  }
  if (oggi.isError || !oggi.data) {
    return (
      <div className="tbh-card p-6 text-sm text-[var(--tbh-muted)]">
        Il palinsesto non è raggiungibile in questo momento. Riprova fra poco.
      </div>
    );
  }
  if (!corrente) {
    return (
      <div className="tbh-card p-6 text-sm text-[var(--tbh-muted)]">
        Nessun contenuto in onda in questo momento: palinsesto IN ALLESTIMENTO.
      </div>
    );
  }

  const trascorso = Math.max(0, (adesso - corrente.inizio) / 1000);
  const totale = (corrente.fine - corrente.inizio) / 1000;
  const percento = Math.min(100, (trascorso / Math.max(1, totale)) * 100);
  const cover = copertina(corrente, media);
  const accento = eDm(corrente) ? ROSSO_DM : colore;
  const soloAudio = media.kind === "audio";
  const comando = tv ? "GUARDA LA DIRETTA" : "ASCOLTA LA DIRETTA";

  const schermo = (
    <div className={`relative min-w-0 bg-black ${tv || compatto ? "aspect-video" : "aspect-video md:aspect-auto md:min-h-[340px]"}`}>
      {acceso && media.kind === "embed" ? (
        <iframe
          key={chiave}
          src={conAutoplay(media.src)}
          title={corrente.titolo}
          allow="autoplay; encrypted-media; picture-in-picture"
          allowFullScreen
          className="absolute inset-0 h-full w-full"
        />
      ) : acceso && media.kind === "youtube" ? (
        <iframe
          key={chiave}
          src={embedYouTube(media.id, partenza)}
          title={corrente.titolo}
          allow="autoplay; encrypted-media; picture-in-picture"
          allowFullScreen
          className="absolute inset-0 h-full w-full"
        />
      ) : cover ? (
        tv && soloAudio ? (
          /* TV, brano solo audio: copertina ufficiale su fondo nero, mai stirata né inventata */
          <div className="absolute inset-0 grid place-items-center overflow-hidden">
            <img src={cover} alt="" aria-hidden className="absolute inset-0 h-full w-full scale-110 object-cover opacity-25 blur-2xl" />
            <img src={cover} alt={`Copertina ufficiale — ${corrente.titolo}`} className="relative h-[82%] w-auto rounded-lg object-contain shadow-2xl" />
          </div>
        ) : (
          <img src={cover} alt={corrente.titolo} className="absolute inset-0 h-full w-full object-cover" />
        )
      ) : (
        <div className="absolute inset-0 grid place-items-center">
          {tv ? <Tv className="h-16 w-16" style={{ color: colore }} /> : <Radio className="h-16 w-16" style={{ color: colore }} />}
        </div>
      )}
      {tv && soloAudio && (
        <span className="absolute left-3 top-3 rounded-full bg-black/80 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--tbh-platinum)]">
          Solo audio · copertina ufficiale
        </span>
      )}
      {!acceso && (
        <button
          type="button"
          onClick={accendi}
          className="absolute inset-0 grid place-items-center bg-black/45 transition-colors hover:bg-black/30"
          aria-label={tv ? "Guarda TOUCH TV in diretta" : "Ascolta TOUCH RADIO in diretta"}
        >
          <span className="flex items-center gap-3 rounded-full px-6 py-3 text-base font-bold text-black shadow-xl" style={{ background: colore }}>
            <Play className="h-5 w-5 fill-current" /> {comando}
          </span>
        </button>
      )}
    </div>
  );

  return (
    <div
      className="tbh-card overflow-hidden"
      style={{ borderColor: `color-mix(in srgb, ${colore} 45%, transparent)` }}
      data-testid={`player-${canale}`}
    >
      <audio ref={audio} preload="none" />
      <div className={`grid grid-cols-1 ${compatto ? "" : tv ? "lg:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)]" : "md:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)]"}`}>
        {schermo}
        <div className={`flex min-w-0 flex-col ${compatto ? "gap-3 p-4 md:p-5" : "gap-4 p-5 md:p-7"}`}>
          <div className="flex flex-wrap items-center gap-2 text-xs font-bold tracking-[0.18em]">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-75" style={{ background: accento }} />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full" style={{ background: accento }} />
            </span>
            <span className="whitespace-nowrap text-[var(--tbh-platinum)]">{tv ? "TOUCH TV" : "TOUCH RADIO"} · ORA IN ONDA</span>
            <span className="text-[var(--tbh-muted)]">· {etichettaElemento(corrente).toUpperCase()}</span>
          </div>

          <dl className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-3 gap-y-1 text-sm" data-testid={`in-onda-${canale}`}>
            <dt className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--tbh-muted)]">Rubrica</dt>
            <dd className="break-words font-semibold" style={{ color: accento }}>
              {nomeRubrica(corrente)}
              {corrente.tipo === "dm" ? ` — ${corrente.titolo}` : ""}
            </dd>
            <dt className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--tbh-muted)]">Orario</dt>
            <dd className="tbh-dato text-[var(--tbh-platinum)]">
              {corrente.ora}–{oraRoma(corrente.fine)} <span className="text-[var(--tbh-muted)]">· ora di Roma</span>
            </dd>
          </dl>

          <div className="flex flex-col gap-1">
            <h3 className="tbh-h3 break-words text-[var(--tbh-platinum)]" data-testid={`titolo-${canale}`}>
              {corrente.titolo}
            </h3>
            {corrente.tipo === "brano" && (
              <p className="text-sm text-[var(--tbh-muted)]">
                <span className="text-[11px] font-bold uppercase tracking-[0.14em]">Artista</span>{" "}
                <span className="text-[var(--tbh-platinum)]">{corrente.artista ?? "J.C. Hugò"}</span>
                {corrente.versione ? ` · ${corrente.versione}` : ""}
              </p>
            )}
            {inserzionistaDi(corrente) && <p className="text-sm text-[var(--tbh-muted)]">{inserzionistaDi(corrente)}</p>}
            {corrente.tipo === "dm" && (
              <>
                <p className="text-sm text-[var(--tbh-muted)]">{corrente.descrizione}</p>
                <p className="text-xs text-[var(--tbh-gold)]">
                  Diretta dal canale YouTube ufficiale DM. Se la diretta non è ancora partita, il player lo indica.{" "}
                  {corrente.repliche}
                </p>
              </>
            )}
            {corrente.tipo === "programma" && corrente.descrizione && (
              <p className="text-sm text-[var(--tbh-muted)]">{corrente.descrizione}</p>
            )}
            {tv && soloAudio && (
              <p className="flex items-center gap-1.5 text-xs text-[var(--tbh-muted)]">
                <Headphones className="h-3.5 w-3.5" /> Brano solo audio: in TV va in onda con la copertina ufficiale.
              </p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
              <div className="h-full rounded-full" style={{ width: `${percento}%`, background: colore }} />
            </div>
            <div className="tbh-dato flex justify-between text-xs text-[var(--tbh-muted)]">
              <span>{mmss(trascorso)}</span>
              <span>{mmss(totale)}</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {acceso ? (
              <button
                type="button"
                onClick={() => setAcceso(false)}
                className="inline-flex items-center gap-2 rounded-full border border-white/20 px-4 py-2 text-sm font-semibold text-[var(--tbh-platinum)] hover:border-white/50"
              >
                <Pause className="h-4 w-4" /> Ferma
              </button>
            ) : (
              <button
                type="button"
                onClick={accendi}
                className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold text-black"
                style={{ background: colore }}
              >
                <Play className="h-4 w-4 fill-current" /> {tv ? "Guarda" : "Ascolta"}
              </button>
            )}
            {audioSrc && (
              <button
                type="button"
                onClick={() => setMuto((m) => !m)}
                className="inline-flex items-center gap-2 rounded-full border border-white/20 px-3 py-2 text-sm text-[var(--tbh-platinum)] hover:border-white/50"
                aria-label={muto ? "Riattiva l'audio" : "Togli l'audio"}
              >
                {muto ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
              </button>
            )}
            {corrente.link && (
              <a
                href={corrente.link}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full border border-white/20 px-4 py-2 text-sm text-[var(--tbh-platinum)] hover:border-white/50"
              >
                Contenuto originale <ExternalLink className="h-3.5 w-3.5" />
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
