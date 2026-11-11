import { useState } from "react";
import { Link } from "wouter";
import { usePalinsestoChannel } from "../queries/channel";

/**
 * /spot — TOUCH SPOT CHANNEL (decisione 3 di Claudio, fase 2 del 18/10/2026).
 * La playlist è quella REALE del Channel «touch-spot»: gli spot interni del gruppo già
 * pubblicati su YouTube (fonte verificata «sigle-spot-tbh»), letti dal server con ordine,
 * rotazione e frequenze impostati nel pannello /allestimento/channel.
 * Nessuna copertina, nessun logo: solo titoli e il lettore del video scelto.
 */

const GIALLO = "#d7ff00";

function durata(sec: number | null) {
  if (!sec) return null;
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

const idYouTube = (s: string) => (/^[\w-]{11}$/.test(s) ? s : null);

export default function SpotChannelPage() {
  const q = usePalinsestoChannel("touch-spot");
  const [scelto, setScelto] = useState(0);
  const lista = q.data?.sequenza ?? [];
  const voce = lista[Math.min(scelto, Math.max(0, lista.length - 1))];
  const id = voce ? idYouTube(voce.sorgente) : null;

  return (
    <div className="mx-auto max-w-[1300px] px-4 py-10 md:px-8" data-testid="channel-pagina-touch-spot">
      <header className="mb-8">
        <p className="text-[11px] font-extrabold uppercase tracking-[0.3em] text-white/50">TBH · Canale 0</p>
        <h1 className="tbh-display tbh-h1 mt-2 text-white">{q.data?.titolo ?? "Touch Spot Channel"}</h1>
        <p className="mt-3 text-xs font-extrabold tracking-[0.2em]" style={{ color: GIALLO }} data-testid="stato-spot">
          {q.data ? `${q.data.stato} · ${q.data.archivio} SPOT INTERNI IN ARCHIVIO` : "LETTURA DEL PALINSESTO…"}
        </p>
        <p className="tbh-body mt-2 max-w-3xl text-sm text-[var(--tbh-muted)]">
          Promozioni e comunicazioni interne del gruppo TBH, già pubblicate. Scegli uno spot dalla playlist.
        </p>
      </header>

      {q.isError && <p className="text-sm text-[#ff8a8a]">Il palinsesto non risponde in questo momento. Riprova tra poco.</p>}

      {q.data && lista.length === 0 && (
        <span className="inline-block rounded-full border px-6 py-2.5 text-xs font-extrabold tracking-[0.2em]" style={{ borderColor: GIALLO, color: GIALLO }}>
          IN ALLESTIMENTO
        </span>
      )}

      {lista.length > 0 && (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
          <div className="flex min-w-0 flex-col gap-3">
            <div className="aspect-video w-full overflow-hidden rounded-xl border border-white/15 bg-black">
              {id ? (
                <iframe
                  key={id}
                  className="h-full w-full"
                  src={`https://www.youtube-nocookie.com/embed/${id}?rel=0`}
                  title={voce!.titolo}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <p className="flex h-full items-center justify-center text-sm text-white/50">Video non disponibile</p>
              )}
            </div>
            {voce && (
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-base font-extrabold text-white">{voce.titolo}</h2>
                {voce.link && (
                  <a href={voce.link} target="_blank" rel="noreferrer" className="text-xs text-[var(--tbh-muted)] underline hover:text-white">
                    Apri su YouTube
                  </a>
                )}
              </div>
            )}
          </div>

          <ol className="flex max-h-[70vh] flex-col gap-1.5 overflow-y-auto pr-1" aria-label="Playlist spot interni" data-testid="playlist-spot">
            {lista.map((v, i) => (
              <li key={`${v.id}-${i}`}>
                <button
                  type="button"
                  onClick={() => setScelto(i)}
                  className={`flex w-full items-center justify-between gap-3 rounded-lg border px-3 py-2 text-left text-sm transition ${
                    i === scelto ? "border-[#d7ff00] bg-white/[0.06] text-white" : "border-white/10 text-white/75 hover:border-white/30"
                  }`}
                >
                  <span className="min-w-0 truncate">{v.titolo}</span>
                  {durata(v.durataSec) && <span className="shrink-0 text-[11px] text-white/45">{durata(v.durataSec)}</span>}
                </button>
              </li>
            ))}
          </ol>
        </div>
      )}

      <Link href="/" className="mt-10 inline-block text-sm text-[var(--tbh-muted)] underline-offset-4 hover:text-white hover:underline">
        Torna alla home
      </Link>
    </div>
  );
}
