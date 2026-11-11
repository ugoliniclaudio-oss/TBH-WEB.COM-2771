import { useMemo } from "react";
import { Link } from "wouter";
import { ExternalLink } from "lucide-react";
import { Briciole } from "../components/struttura";
import { MonitorRotante, type VoceMonitor } from "../components/monitor-rotante";
import { useAnteprimaPagina } from "../lib/anteprima-pagina";
import { PulsanteCondividi } from "../components/pulsante-condividi";
import { FILM_TOUCH_CINEMA, durataLeggibile, filmPerSlug, schedaFilm, yt } from "../../api/data/touch-cinema-film";

/**
 * /channel/touch-cinema/film/:slug — SCHEDA FILM (28/10/2026).
 * Trama, cast e crediti appartengono SOLO al titolo della scheda (data/touch-cinema-film.ts).
 * Nessun orario: «CONTENUTI DISPONIBILI».
 */

const GIALLO = "#d7ff00";

export default function TouchCinemaFilmPage({ slug }: { slug: string }) {
  const f = filmPerSlug(slug);
  const voci = useMemo<VoceMonitor[]>(
    () =>
      f
        ? [
            {
              id: f.slug,
              titolo: f.titolo,
              sotto: `CONTENUTI DISPONIBILI · ${durataLeggibile(f.durataSec)}`,
              immagine: f.miniatura,
              youtube: f.videoId,
              link: yt(f.videoId),
              linkEtichetta: "Guarda su YouTube",
    notaBlocco: f.videoId === "U-XejC20eEw" ? "Su YouTube questo film è visibile solo da Italia, San Marino e Città del Vaticano." : "Su YouTube questo film è visibile solo dall'Italia.",
            },
          ]
        : [],
    [f],
  );
  useAnteprimaPagina(
    f
      ? {
          titolo: `${f.titolo} (${f.anno}) · Touch Cinema · TBH-WEB`,
          descrizione: `Regia di ${f.regia}. ${f.trama.slice(0, 150).replace(/\s+\S*$/, "")}…`,
          immagine: f.miniatura,
        }
      : null,
  );

  if (!f) {
    return (
      <div className="mx-auto max-w-[900px] px-4 py-16 text-center md:px-8" data-testid="film-non-trovato">
        <p className="text-lg font-bold text-white">Film non presente nelle proiezioni di Touch Cinema.</p>
        <Link href="/channel/touch-cinema" className="mt-6 inline-block text-sm text-[var(--tbh-muted)] underline underline-offset-4 hover:text-white">
          Torna a Touch Cinema
        </Link>
      </div>
    );
  }

  const pos = FILM_TOUCH_CINEMA.findIndex((x) => x.slug === f.slug);
  const altri = FILM_TOUCH_CINEMA.filter((x) => x.slug !== f.slug);
  const dati: [string, string][] = [
    ["Regia", f.regia],
    ...(f.sceneggiatura ? ([["Sceneggiatura", f.sceneggiatura]] as [string, string][]) : []),
    ["Anno", String(f.anno)],
    ["Genere", f.genere],
    ["Paese", f.paese],
    ["Durata", durataLeggibile(f.durataSec)],
    ["Video", `«${f.titoloYouTube}» · canale YouTube ${f.canaleYouTube}`],
  ];

  return (
    <div className="mx-auto max-w-[1200px] px-4 py-10 md:px-8" data-testid="scheda-film" data-film={f.slug}>
      <Briciole
        className="mb-6"
        voci={[
          { label: "Touch Production", href: "/tbh/produzioni" },
          { label: "Cinema", href: "/tbh/produzioni?ambito=cinema" },
          { label: "Proiezioni", href: "/channel/touch-cinema" },
          { label: f.titolo },
        ]}
      />
      <header className="mb-6">
        <p className="text-[11px] font-extrabold uppercase tracking-[0.3em] text-white/50">
          Touch Cinema · Film {pos + 1} di {FILM_TOUCH_CINEMA.length}
        </p>
        <h1 className="tbh-display mt-2 text-balance text-[clamp(26px,4vw,44px)] font-black leading-tight text-white">{f.titolo}</h1>
        <p className="mt-3 text-xs font-extrabold tracking-[0.2em]" style={{ color: GIALLO }}>
          CONTENUTI DISPONIBILI · {f.anno} · {durataLeggibile(f.durataSec)}
        </p>
      </header>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="min-w-0">
          <MonitorRotante voci={voci} etichetta="TOUCH CINEMA" testid="monitor-film" playLabel="GUARDA IL FILM" />
          <div className="mt-3 flex flex-wrap gap-2">
            <a
              href={yt(f.videoId)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 items-center gap-1.5 rounded-full px-5 text-[12px] font-extrabold tracking-[0.12em] text-black"
              style={{ background: GIALLO }}
              data-testid="film-guarda-youtube"
            >
              GUARDA SU YOUTUBE <ExternalLink size={14} aria-hidden />
            </a>
            <PulsanteCondividi percorso={schedaFilm(f.slug)} titolo={f.titolo} />
          </div>
          <p className="mt-2 text-[11px] text-white/45">
            Video visibile solo dall'Italia{f.videoId === "U-XejC20eEw" ? " (anche da San Marino e Città del Vaticano)" : ""}.
          </p>

          <section className="mt-8" aria-label="Trama">
            <h2 className="mb-2 text-[12px] font-black tracking-[0.2em]" style={{ color: GIALLO }}>
              TRAMA
            </h2>
            <p className="tbh-body text-[15px] leading-relaxed text-white/85" data-testid="film-trama">
              {f.trama}
            </p>
            <p className="mt-2 text-[11px] text-white/45">Fonte: {f.fonteTrama}</p>
            {f.legame && <p className="mt-4 text-sm text-white/70">{f.legame}</p>}
          </section>

          <section className="mt-8" aria-label="Cast">
            <h2 className="mb-3 text-[12px] font-black tracking-[0.2em]" style={{ color: GIALLO }}>
              CAST
            </h2>
            {f.ruoli ? (
              <ul className="grid gap-x-6 gap-y-1.5 sm:grid-cols-2" data-testid="film-cast">
                {f.ruoli.map((r) => (
                  <li key={r.attore} className="text-sm text-white">
                    <span className="font-bold">{r.attore}</span> <span className="text-white/55">· {r.personaggio}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <ul className="flex flex-wrap gap-2" data-testid="film-cast">
                {f.cast.map((a) => (
                  <li key={a} className="rounded-full border border-white/15 px-3 py-1 text-[13px] text-white">
                    {a}
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        <aside className="flex min-w-0 flex-col gap-6">
          <dl className="rounded-xl border border-white/10 p-4" data-testid="film-dati">
            {dati.map(([k, v]) => (
              <div key={k} className="border-b border-white/5 py-2 last:border-0">
                <dt className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-white/45">{k}</dt>
                <dd className="mt-0.5 break-words text-sm text-white">{v}</dd>
              </div>
            ))}
            {f.notaAnno && <p className="pt-2 text-[11px] leading-relaxed text-white/50">{f.notaAnno}</p>}
          </dl>

          <div>
            <h2 className="mb-2 text-[11px] font-black tracking-[0.2em] text-white/60">FONTI</h2>
            <ul className="flex flex-col gap-1">
              {f.fonti.map((x) => (
                <li key={x.url}>
                  <a href={x.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-sm text-white/80 underline-offset-4 hover:text-white hover:underline">
                    {x.nome} <ExternalLink size={12} aria-hidden />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="mb-2 text-[11px] font-black tracking-[0.2em] text-white/60">ALTRE PROIEZIONI</h2>
            <ul className="flex flex-col gap-2">
              {altri.map((x) => (
                <li key={x.slug}>
                  <Link href={schedaFilm(x.slug)} className="flex gap-3 rounded-lg border border-white/10 p-2 transition hover:border-white/30">
                    <img src={x.miniatura} alt="" className="aspect-video w-[96px] shrink-0 rounded object-cover" loading="lazy" />
                    <span className="min-w-0 text-[13px] font-bold leading-snug text-white">{x.titolo}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>

      <Link href="/channel/touch-cinema" className="mt-10 inline-block text-sm text-[var(--tbh-muted)] underline-offset-4 hover:text-white hover:underline">
        ← Tutte le proiezioni di Touch Cinema
      </Link>
    </div>
  );
}
