import { useCallback, useMemo, useRef, useState } from "react";
import { Link } from "wouter";
import { Play } from "lucide-react";
import { MonitorRotante, type ComandiMonitorRotante, type VoceMonitor } from "./monitor-rotante";
import { FILM_TOUCH_CINEMA, durataLeggibile, durataOrologio, schedaFilm, yt } from "../../api/data/touch-cinema-film";

/**
 * TOUCH CINEMA · PROIEZIONI (28/10/2026) — i tre film indicati da Claudio, nell'ordine dato.
 * Monitor a rotazione (miniature 8 s, Play = «GUARDA IL FILM») + scaletta selezionabile.
 * Nessun orario: «CONTENUTI DISPONIBILI».
 */

const GIALLO = "#d7ff00";

export function vociFilm(): VoceMonitor[] {
  return FILM_TOUCH_CINEMA.map((f) => ({
    id: f.slug,
    titolo: f.titolo,
    sotto: `CONTENUTI DISPONIBILI · ${f.anno} · ${durataLeggibile(f.durataSec)}`,
    immagine: f.miniatura,
    youtube: f.videoId,
    link: yt(f.videoId),
    linkEtichetta: "Guarda su YouTube",
    notaBlocco: f.videoId === "U-XejC20eEw" ? "Su YouTube questo film è visibile solo da Italia, San Marino e Città del Vaticano." : "Su YouTube questo film è visibile solo dall'Italia.",
    scheda: schedaFilm(f.slug),
    schedaEtichetta: "SCHEDA FILM",
  }));
}

export function ProiezioniTouchCinema() {
  const voci = useMemo(vociFilm, []);
  const comandi = useRef<ComandiMonitorRotante>(null);
  const [corrente, setCorrente] = useState(0);
  const onIndice = useCallback((i: number) => setCorrente(i), []);

  return (
    <section className="mb-12" aria-label="Proiezioni Touch Cinema" data-testid="proiezioni-cinema">
      <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-[12px] font-black tracking-[0.2em]" style={{ color: GIALLO }}>
          PROIEZIONI
        </h2>
        <p className="text-[11px] font-extrabold tracking-[0.18em] text-white/55" data-testid="proiezioni-stato">
          CONTENUTI DISPONIBILI · {voci.length} FILM
        </p>
      </div>
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
        <MonitorRotante
          voci={voci}
          etichetta="TOUCH CINEMA"
          testid="monitor-cinema"
          playLabel="GUARDA IL FILM"
          comandi={comandi}
          onIndice={onIndice}
        />
        <ol className="flex flex-col gap-2" data-testid="scaletta-cinema" aria-label="Scaletta dei film">
          {FILM_TOUCH_CINEMA.map((f, i) => {
            const attivo = i === corrente;
            return (
              <li
                key={f.slug}
                className={`flex gap-3 rounded-xl border p-2 transition ${attivo ? "bg-white/[0.06]" : "border-white/10 hover:border-white/30"}`}
                style={attivo ? { borderColor: GIALLO } : undefined}
                data-testid={`scaletta-film-${i}`}
                data-attivo={attivo ? "1" : "0"}
              >
                <button
                  type="button"
                  onClick={() => comandi.current?.mostra(i)}
                  className="relative aspect-video w-[120px] shrink-0 overflow-hidden rounded-lg bg-black"
                  aria-label={`Mostra nel monitor: ${f.titolo}`}
                  aria-pressed={attivo}
                >
                  <img src={f.miniatura} alt="" className="h-full w-full object-cover" loading="lazy" decoding="async" />
                  <span className="absolute bottom-1 right-1 rounded bg-black/80 px-1 text-[10px] font-bold text-white">{durataOrologio(f.durataSec)}</span>
                </button>
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  <button
                    type="button"
                    onClick={() => comandi.current?.mostra(i)}
                    className="line-clamp-2 text-left text-[13px] font-extrabold leading-snug text-white"
                  >
                    {f.titolo}
                  </button>
                  <p className="text-[11px] text-white/50">
                    {f.anno} · {f.regia}
                  </p>
                  <div className="mt-auto flex flex-wrap gap-1.5">
                    <button
                      type="button"
                      onClick={() => comandi.current?.avvia(i)}
                      className="inline-flex min-h-9 items-center gap-1 rounded-full px-3 text-[10px] font-extrabold tracking-[0.12em] text-black"
                      style={{ background: GIALLO }}
                      data-testid={`scaletta-guarda-${i}`}
                    >
                      <Play size={11} fill="currentColor" aria-hidden /> GUARDA IL FILM
                    </button>
                    <Link
                      href={schedaFilm(f.slug)}
                      className="inline-flex min-h-9 items-center rounded-full border border-white/25 px-3 text-[10px] font-extrabold tracking-[0.12em] text-white hover:border-white"
                    >
                      SCHEDA
                    </Link>
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      </div>
      <p className="mt-3 text-[11px] leading-relaxed text-white/45">
        I film sono pubblicati su YouTube dai rispettivi canali e sono visibili solo dall'Italia (il secondo anche da San Marino e Città del Vaticano): se il player non
        parte, «Guarda su YouTube» apre il video originale.
      </p>
    </section>
  );
}
