import { useState } from "react";
import { Link } from "wouter";
import { usePalinsestoChannel } from "../queries/channel";

/**
 * /channel/mondo-olistico — MONDO OLISTICO CHANNEL (28° Channel di Canale 0, 18/10/2026).
 *
 * Regole di Claudio, alla lettera:
 *  · solo il titolo testuale, nessun logo provvisorio, nessuna immagine;
 *  · nessun video, professionista o evento inventato: il palinsesto si riempie SOLO da
 *    fonti autorizzate e verificate (archivio autonomo del Channel, gestito dal pannello
 *    /allestimento/channel: playlist, rotazione sequenziale o casuale, repliche, intervalli
 *    spot, sincronizzazione ogni 30 minuti);
 *  · le pratiche di benessere sono distinte dalle prestazioni sanitarie, senza promesse
 *    terapeutiche.
 * L'elenco degli ambiti qui sotto è quello indicato da Claudio: descrive di cosa si
 * occuperà il Channel, non sono contenuti.
 */

const GIALLO = "#d7ff00";
const SLUG = "mondo-olistico";
const TITOLO = "MONDO OLISTICO CHANNEL";

const AMBITI = [
  "Discipline olistiche e benessere",
  "Yoga, meditazione e mindfulness",
  "Reiki e trattamenti energetici",
  "Massaggi e discipline del rilassamento",
  "Naturopatia e pratiche complementari",
  "Eventi, seminari, workshop e formazione",
  "Interviste a professionisti e operatori del settore",
  "Turismo del benessere e centri olistici",
];

const idYouTube = (s: string) => (/^[\w-]{11}$/.test(s) ? s : null);

export default function ChannelMondoOlisticoPage() {
  const q = usePalinsestoChannel(SLUG);
  const [scelto, setScelto] = useState(0);
  const lista = q.data?.sequenza ?? [];
  const contenuti = lista.filter((v) => !v.spot).length;
  const voce = lista[Math.min(scelto, Math.max(0, lista.length - 1))];
  const id = voce ? idYouTube(voce.sorgente) : null;

  return (
    <div className="mx-auto max-w-[1300px] px-4 py-10 md:px-8" data-testid={`channel-pagina-${SLUG}`}>
      <header className="mb-8">
        <p className="text-[11px] font-extrabold uppercase tracking-[0.3em] text-white/50">TBH · Canale 0</p>
        <h1 className="tbh-display tbh-h1 mt-2 text-white">{TITOLO}</h1>
        <p className="mt-3 text-xs font-extrabold tracking-[0.2em]" style={{ color: GIALLO }} data-testid="stato-channel">
          {q.isError
            ? "IN ALLESTIMENTO"
            : q.data
              ? contenuti > 0
                ? `${q.data.stato} · ${q.data.archivio} CONTENUTI IN ARCHIVIO`
                : "IN ALLESTIMENTO"
              : "LETTURA DEL PALINSESTO…"}
        </p>
      </header>

      {contenuti === 0 ? (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_420px]">
          <div
            className="flex aspect-video w-full flex-col items-center justify-center gap-4 rounded-xl border bg-black px-6 text-center"
            style={{ borderColor: "rgba(255,255,255,0.14)", boxShadow: "inset 0 0 0 5px #0d0d0f" }}
          >
            <span className="text-balance text-xl font-black tracking-[0.04em] text-white md:text-2xl">{TITOLO}</span>
            <span
              className="rounded-full border px-6 py-2 text-xs font-extrabold tracking-[0.2em]"
              style={{ borderColor: GIALLO, color: GIALLO }}
              data-testid="in-allestimento"
            >
              IN ALLESTIMENTO
            </span>
            <span className="max-w-md text-xs text-white/50">
              Il palinsesto partirà quando saranno collegate fonti autorizzate e verificate.
            </span>
          </div>
          <AmbitiChannel />
        </div>
      ) : (
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
              ) : voce?.link ? (
                <a href={voce.link} className="flex h-full items-center justify-center px-6 text-center text-sm text-white underline">
                  {voce.titolo}
                </a>
              ) : (
                <p className="flex h-full items-center justify-center text-sm text-white/50">Contenuto non disponibile</p>
              )}
            </div>
            {voce && (
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-base font-extrabold text-white">{voce.titolo}</h2>
                {voce.attribuzione && <span className="text-[11px] text-white/45">{voce.attribuzione}</span>}
              </div>
            )}
          </div>
          <ol className="flex max-h-[70vh] flex-col gap-1.5 overflow-y-auto pr-1" aria-label="Playlist Mondo Olistico" data-testid="playlist-channel">
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
                  {v.spot && <span className="shrink-0 text-[10px] font-bold tracking-[0.16em] text-white/45">SPOT</span>}
                </button>
              </li>
            ))}
          </ol>
          <div className="lg:col-span-2">
            <AmbitiChannel />
          </div>
        </div>
      )}

      <Link href="/" className="mt-10 inline-block text-sm text-[var(--tbh-muted)] underline-offset-4 hover:text-white hover:underline">
        Torna alla home
      </Link>
    </div>
  );
}

function AmbitiChannel() {
  return (
    <section className="flex flex-col gap-4 rounded-xl border border-white/10 p-5" aria-label="Di cosa si occuperà il Channel">
      <h2 className="text-[12px] font-black tracking-[0.2em]" style={{ color: GIALLO }}>
        DI COSA SI OCCUPERÀ IL CHANNEL
      </h2>
      <ul className="flex flex-col gap-1.5 text-sm text-white/80">
        {AMBITI.map((a) => (
          <li key={a} className="border-b border-white/[0.06] pb-1.5 last:border-0">
            {a}
          </li>
        ))}
      </ul>
      <p className="text-xs leading-relaxed text-white/55" data-testid="avvertenza-benessere">
        Le pratiche presentate in questo Channel riguardano il benessere e il rilassamento e non sostituiscono visite, diagnosi
        o terapie mediche. I contenuti distinguono sempre le discipline di benessere dalle prestazioni sanitarie e non contengono
        promesse di guarigione o effetti terapeutici non dimostrati.
      </p>
    </section>
  );
}
