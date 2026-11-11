import { useEffect, useMemo, useRef, useState } from "react";
import { ExternalLink, Pause, Play, Radio, Volume2, VolumeX } from "lucide-react";
import type { ElementoRadio } from "../../api/lib/radio-palinsesto";
import { EVENTO_ACCENDI_RADIO, oraRoma, programmaDi, useRadioAdesso } from "../hooks/use-radio-adesso";

/** Rosso riservato a DM (regola colori TBH). */
const ROSSO_DM = "#ff2b2b";

/**
 * PLAYER «IN ONDA — RADIO 24/7» della J.C. HUGÒ RADIO.
 *
 * Il palinsesto arriva dal server (stessa scaletta per tutti, ora di Roma). Qui si
 * corregge solo l'orologio del dispositivo con l'ora del server e si parte dal secondo
 * giusto: chi apre la radio sente quello che stanno sentendo tutti.
 * · Brani Suno → lettore audio del browser (file pubblico del brano su Suno).
 * · Brani YouTube, spot del gruppo e DM Live → player ufficiale YouTube.
 * Il browser chiede un tocco prima di far partire l'audio: per questo c'è «Ascolta».
 */

function mmss(sec: number): string {
  const s = Math.max(0, Math.floor(sec));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

function etichettaTipo(e: ElementoRadio): string {
  if (e.tipo === "spot") return e.sigla ? "PAUSA PUBBLICITARIA · SIGLA" : "PAUSA PUBBLICITARIA";
  if (e.tipo === "dm") return "DM LIVE";
  return "MUSICA ORIGINALE J.C. HUGÒ";
}

function linkEtichetta(e: ElementoRadio): string {
  if (e.tipo === "brano") return e.fonte.piattaforma === "suno" ? "Ascolta su Suno" : "Guarda su YouTube";
  if (e.tipo === "dm") return "Canale YouTube DM";
  return "Guarda lo spot su YouTube";
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

export function RadioPlayer({ colore = "var(--tbh-neon)" }: { colore?: string }) {
  const { oggi, scarto, adesso, corrente } = useRadioAdesso(500);

  const [acceso, setAcceso] = useState(false);
  const [muto, setMuto] = useState(false);
  const audio = useRef<HTMLAudioElement | null>(null);

  const chiave = corrente ? `${corrente.tipo}-${corrente.inizio}` : "nessuno";
  /** Secondo di partenza fissato al cambio elemento: l'iframe non deve ricaricarsi a ogni tick. */
  const partenza = useMemo(
    () => (corrente ? Math.max(0, (Date.now() + scarto - corrente.inizio) / 1000) : 0),
    [chiave, acceso],
  );

  const audioSrc = corrente?.tipo === "brano" && corrente.fonte.tipo === "audio" ? corrente.fonte.src : null;

  /* Lettore audio: si aggancia al secondo giusto a ogni cambio brano. */
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
      // Solo il rifiuto del browser spegne la radio; un cambio brano interrompe e basta.
      if (err instanceof DOMException && err.name === "NotAllowedError") setAcceso(false);
    });
    return () => el.removeEventListener("loadedmetadata", allinea);
  }, [acceso, audioSrc, chiave]);

  useEffect(() => {
    if (audio.current) audio.current.muted = muto;
  }, [muto]);

  const accendi = () => {
    /* Il primo play parte dentro il tocco dell'utente: così il browser lo consente. */
    const el = audio.current;
    if (el && audioSrc) {
      el.src = audioSrc;
      void el.play().catch(() => undefined);
    }
    setAcceso(true);
  };

  /* «ASCOLTA LA RADIO» in testata: l'evento arriva dentro lo stesso tocco, quindi il
     browser consente il play anche se il pulsante sta fuori dal player. */
  const accendiRef = useRef(accendi);
  accendiRef.current = accendi;
  useEffect(() => {
    const ascolta = () => accendiRef.current();
    window.addEventListener(EVENTO_ACCENDI_RADIO, ascolta);
    return () => window.removeEventListener(EVENTO_ACCENDI_RADIO, ascolta);
  }, []);

  if (oggi.isLoading) {
    return (
      <div className="tbh-card p-6 text-sm text-[var(--tbh-muted)]">Caricamento del palinsesto…</div>
    );
  }
  if (oggi.isError || !oggi.data) {
    return (
      <div className="tbh-card p-6 text-sm text-[var(--tbh-muted)]">
        Il palinsesto della radio non è raggiungibile in questo momento. Riprova fra poco.
      </div>
    );
  }
  if (!corrente) {
    return (
      <div className="tbh-card p-6 text-sm text-[var(--tbh-muted)]">
        Nessun brano in rotazione: la radio è IN ALLESTIMENTO.
      </div>
    );
  }

  const trascorso = Math.max(0, (adesso - corrente.inizio) / 1000);
  const totale = (corrente.fine - corrente.inizio) / 1000;
  const percento = Math.min(100, (trascorso / Math.max(1, totale)) * 100);
  const videoId =
    corrente.tipo === "spot"
      ? corrente.videoId
      : corrente.tipo === "brano" && corrente.fonte.tipo === "youtube"
        ? corrente.fonte.videoId
        : null;
  const cover = corrente.tipo === "brano" ? corrente.cover : null;
  const accento = corrente.tipo === "dm" ? ROSSO_DM : colore;

  return (
    <div
      className="tbh-card overflow-hidden"
      style={{ borderColor: `color-mix(in srgb, ${colore} 45%, transparent)` }}
      data-testid="radio-player"
    >
      <audio ref={audio} preload="none" />
      <div className="grid grid-cols-1 gap-0 md:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)]">
        {/* SCHERMO: copertina, oppure il player YouTube quando la radio è accesa */}
        <div className="relative min-w-0 aspect-video md:aspect-auto md:min-h-[340px] bg-black">
          {acceso && corrente.tipo === "dm" ? (
            <iframe
              key={chiave}
              src={`${corrente.embed}&autoplay=1`}
              title={`DM Live — ${corrente.titolo}`}
              allow="autoplay; encrypted-media; picture-in-picture"
              allowFullScreen
              className="absolute inset-0 h-full w-full"
            />
          ) : acceso && videoId ? (
            <iframe
              key={chiave}
              src={embedYouTube(videoId, partenza)}
              title={corrente.titolo}
              allow="autoplay; encrypted-media; picture-in-picture"
              allowFullScreen
              className="absolute inset-0 h-full w-full"
            />
          ) : cover ? (
            <img src={cover} alt={corrente.titolo} className="absolute inset-0 h-full w-full object-cover" />
          ) : videoId ? (
            <img
              src={`https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`}
              alt={corrente.titolo}
              className="absolute inset-0 h-full w-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 grid place-items-center">
              <Radio className="h-16 w-16" style={{ color: colore }} />
            </div>
          )}
          {!acceso && (
            <button
              type="button"
              onClick={accendi}
              className="absolute inset-0 grid place-items-center bg-black/45 hover:bg-black/30 transition-colors"
              aria-label="Ascolta la radio in diretta"
            >
              <span
                className="flex items-center gap-3 rounded-full px-6 py-3 text-base font-bold text-black shadow-xl"
                style={{ background: colore }}
              >
                <Play className="h-5 w-5 fill-current" /> ASCOLTA LA DIRETTA
              </span>
            </button>
          )}
        </div>

        {/* INFORMAZIONI */}
        <div className="flex min-w-0 flex-col gap-4 p-5 md:p-7">
          <div className="flex items-center gap-2 text-xs font-bold tracking-[0.18em]">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-75" style={{ background: accento }} />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full" style={{ background: accento }} />
            </span>
            <span className="whitespace-nowrap text-[var(--tbh-platinum)]">ORA IN ONDA</span>
            <span className="text-[var(--tbh-muted)]">· {etichettaTipo(corrente)}</span>
          </div>

          <dl className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-3 gap-y-1 text-sm" data-testid="radio-ora-in-onda">
            <dt className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--tbh-muted)]">Programma</dt>
            <dd className="font-semibold break-words" style={{ color: accento }}>{programmaDi(corrente)}</dd>
            <dt className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--tbh-muted)]">Orario</dt>
            <dd className="tbh-dato text-[var(--tbh-platinum)]">
              {corrente.ora}–{oraRoma(corrente.fine)} <span className="text-[var(--tbh-muted)]">· ora di Roma</span>
            </dd>
          </dl>

          <div className="flex flex-col gap-1">
            {corrente.tipo === "brano" && (
              <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--tbh-muted)]">Brano</span>
            )}
            <h3 className="tbh-h3 text-[var(--tbh-platinum)] break-words" data-testid="radio-titolo">
              {corrente.titolo}
            </h3>
            {corrente.tipo === "brano" && (
              <p className="text-sm text-[var(--tbh-muted)]">
                <span className="text-[11px] font-bold uppercase tracking-[0.14em]">Artista</span>{" "}
                <span className="text-[var(--tbh-platinum)]">{corrente.artista ?? "J.C. Hugò"}</span>
                {corrente.versione ? ` · ${corrente.versione}` : ""}
              </p>
            )}
            {corrente.tipo === "spot" && (
              <p className="text-sm text-[var(--tbh-muted)]">{corrente.inserzionista}</p>
            )}
            {corrente.tipo === "dm" && (
              <>
                <p className="text-sm text-[var(--tbh-muted)]">{corrente.descrizione}</p>
                <p className="text-xs text-[var(--tbh-gold)]">
                  Diretta dal canale YouTube ufficiale DM. Se la diretta non è ancora partita,
                  il player lo indica: apri il canale DM qui sotto. {corrente.repliche}
                </p>
              </>
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
                <Play className="h-4 w-4 fill-current" /> Ascolta
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
            <a
              href={corrente.link}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 rounded-full border border-white/20 px-4 py-2 text-sm text-[var(--tbh-platinum)] hover:border-white/50"
            >
              {linkEtichetta(corrente)} <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>

        </div>
      </div>
    </div>
  );
}
