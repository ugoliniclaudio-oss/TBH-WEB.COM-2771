import { useMemo, useState } from "react";
import { Link } from "wouter";
import { useProgrammazioneTouchCinema } from "../queries/touch-cinema";
import { Briciole } from "../components/struttura";
import { ProiezioniTouchCinema } from "../components/proiezioni-touch-cinema";
import { PulsanteCondividi } from "../components/pulsante-condividi";
import { useAnteprimaPagina } from "../lib/anteprima-pagina";
import { FILM_TOUCH_CINEMA } from "../../api/data/touch-cinema-film";

/**
 * /channel/touch-cinema — TOUCH CINEMA (27° Channel di Canale 0).
 *
 * Ordine di Claudio del 18/10/2026: «provvisoriamente su Touch Cinema la programmazione dei
 * film sono tutti i film che trovi su heddy.video».
 *  · elenco = archivio del Channel «touch-cinema» (ordine e rotazione giornaliera dal pannello
 *    /allestimento/channel), schede copiate da HEDDY.video (locandina, regia, anno, paese, durata);
 *  · i film NON vanno in onda su TBH-WEB: «GUARDA SU HEDDY.VIDEO» apre la scheda originale;
 *  · nessun orario, nessun prezzo: il modello di visione di HEDDY.video non è verificato.
 *  · durata/anno assenti sulla scheda HEDDY = non mostrati (mai stimati).
 */

const GIALLO = "#d7ff00";
const idYouTube = (s: string) => (/^[\w-]{11}$/.test(s) ? s : null);

export default function ChannelTouchCinemaPage() {
  const q = useProgrammazioneTouchCinema();
  const [categoria, setCategoria] = useState<string | null>(null);
  const [cerca, setCerca] = useState("");
  const [servizio, setServizio] = useState(0);
  useAnteprimaPagina({
    titolo: "Touch Cinema · Proiezioni · TBH-WEB",
    descrizione: `Contenuti disponibili: ${FILM_TOUCH_CINEMA.map((f) => `«${f.titolo}»`).join(", ")}.`,
    immagine: FILM_TOUCH_CINEMA[0]!.miniatura,
  });

  const film = q.data?.film ?? [];
  const filtrati = useMemo(() => {
    const t = cerca.trim().toLowerCase();
    return film.filter(
      (f) =>
        (!categoria || f.categorie.includes(categoria)) &&
        (!t || f.titolo.toLowerCase().includes(t) || (f.regia ?? "").toLowerCase().includes(t)),
    );
  }, [film, categoria, cerca]);
  const servizi = q.data?.servizi ?? [];
  const sv = servizi[Math.min(servizio, Math.max(0, servizi.length - 1))];
  const svId = sv ? idYouTube(sv.sorgente) : null;

  return (
    <div className="mx-auto max-w-[1300px] px-4 py-10 md:px-8" data-testid="channel-pagina-touch-cinema">
      <Briciole
        className="mb-6"
        voci={[
          { label: "Touch Production", href: "/tbh/produzioni" },
          { label: "Cinema", href: "/tbh/produzioni?ambito=cinema" },
          { label: "Proiezioni" },
        ]}
        destra={<PulsanteCondividi percorso="/channel/touch-cinema" titolo="Touch Cinema · Proiezioni" />}
      />
      <header className="mb-8">
        <p className="text-[11px] font-extrabold uppercase tracking-[0.3em] text-white/50">TBH · Canale 0</p>
        <h1 className="tbh-display tbh-h1 mt-2 text-white">Touch Cinema</h1>
        <p className="mt-3 text-xs font-extrabold tracking-[0.2em]" style={{ color: GIALLO }} data-testid="stato-cinema">
          CONTENUTI DISPONIBILI · {FILM_TOUCH_CINEMA.length} FILM IN PROIEZIONE
          {q.data && film.length > 0 ? ` · ${film.length} FILM SU HEDDY.VIDEO` : ""}
        </p>
        <p className="tbh-body mt-2 max-w-3xl text-sm text-[var(--tbh-muted)]">
          Proiezioni: scegli un film dalla scaletta e premi «Guarda il film»; ogni film ha la sua scheda con trama, cast e fonti. Più sotto, la
          programmazione provvisoria con i film pubblicati sulla piattaforma{" "}
          <a href="https://heddy.video" target="_blank" rel="noopener noreferrer" className="text-white underline underline-offset-4">
            HEDDY.video
          </a>
          , dove si guarda il film sulla sua pagina originale.
        </p>
      </header>

      <ProiezioniTouchCinema />

      {q.data && film.length > 0 && (
        <h2 className="mb-4 text-[12px] font-black tracking-[0.2em]" style={{ color: GIALLO }}>
          CATALOGO HEDDY.VIDEO
        </h2>
      )}
      {q.data && film.length > 0 && (
        <div className="mb-6 flex flex-col gap-3" data-testid="filtri-cinema">
          <div className="flex flex-wrap gap-2">
            <Filtro attivo={!categoria} onClick={() => setCategoria(null)}>
              TUTTI · {film.length}
            </Filtro>
            {q.data.categorie
              .filter((c) => c.film > 0)
              .map((c) => (
                <Filtro key={c.slug} attivo={categoria === c.nome} onClick={() => setCategoria(c.nome)}>
                  {c.nome} · {c.film}
                </Filtro>
              ))}
          </div>
          <input
            type="search"
            value={cerca}
            onChange={(e) => setCerca(e.target.value)}
            placeholder="Cerca titolo o regista"
            aria-label="Cerca titolo o regista"
            className="w-full max-w-sm rounded-lg border border-white/15 bg-black px-3 py-2 text-sm text-white placeholder:text-white/35 focus:border-[#d7ff00] focus:outline-none"
          />
        </div>
      )}

      {q.isLoading ? (
        <p className="py-16 text-center text-sm text-white/50">Lettura della programmazione…</p>
      ) : film.length === 0 ? (
        <p className="text-[11px] font-extrabold tracking-[0.18em] text-white/45" data-testid="heddy-in-allestimento">
          CATALOGO HEDDY.VIDEO · {q.isError ? "IN ALLESTIMENTO" : "IN AGGIORNAMENTO"}
        </p>
      ) : (
        <>
          <p className="mb-3 text-xs text-white/45" data-testid="conteggio-cinema">
            {filtrati.length} di {film.length} film
          </p>
          <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6" data-testid="griglia-cinema">
            {filtrati.map((f) => (
              <li key={f.id} className="flex min-w-0 flex-col overflow-hidden rounded-lg border border-white/10 bg-black">
                <div className="aspect-[2/3] w-full bg-white/[0.04]">
                  {f.poster ? (
                    <img
                      src={f.poster}
                      alt={`Locandina di ${f.titolo}`}
                      loading="lazy"
                      decoding="async"
                      referrerPolicy="no-referrer"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="flex h-full items-center justify-center px-3 text-center text-sm font-bold text-white/70">{f.titolo}</span>
                  )}
                </div>
                <div className="flex flex-1 flex-col gap-1 p-3">
                  <h2 className="text-sm font-extrabold leading-snug text-white">{f.titolo}</h2>
                  <p className="text-[11px] leading-snug text-white/55">
                    {[f.regia, f.anno, f.paese, f.durataMin ? `${f.durataMin} min` : null, f.stagioni ? `${f.stagioni} stagioni` : null]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                  {f.link && (
                    <a
                      href={f.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-auto pt-2 text-[11px] font-extrabold tracking-[0.14em]"
                      style={{ color: GIALLO }}
                    >
                      GUARDA SU HEDDY.VIDEO →
                    </a>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </>
      )}

      {servizi.length > 0 && (
        <section className="mt-12" aria-label="Servizi Touch Cinema" data-testid="servizi-cinema">
          <h2 className="mb-4 text-[12px] font-black tracking-[0.2em]" style={{ color: GIALLO }}>
            SERVIZI TOUCH CINEMA
          </h2>
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
            <div className="aspect-video w-full overflow-hidden rounded-xl border border-white/15 bg-black">
              {svId ? (
                <iframe
                  key={svId}
                  className="h-full w-full"
                  src={`https://www.youtube-nocookie.com/embed/${svId}?rel=0`}
                  title={sv!.titolo}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : sv?.link ? (
                <a href={sv.link} className="flex h-full items-center justify-center px-6 text-center text-sm text-white underline">
                  {sv.titolo}
                </a>
              ) : null}
            </div>
            <ol className="flex flex-col gap-1.5">
              {servizi.map((s, i) => (
                <li key={s.id}>
                  <button
                    type="button"
                    onClick={() => setServizio(i)}
                    className={`w-full truncate rounded-lg border px-3 py-2 text-left text-sm transition ${
                      i === servizio ? "border-[#d7ff00] bg-white/[0.06] text-white" : "border-white/10 text-white/75 hover:border-white/30"
                    }`}
                  >
                    {s.titolo}
                  </button>
                </li>
              ))}
            </ol>
          </div>
        </section>
      )}

      <footer className="mt-12 border-t border-white/10 pt-5 text-[11px] leading-relaxed text-white/45" data-testid="fonte-cinema">
        Fonte dei film: HEDDY.video (HEDDY VIDEO SRL, Milano). Titoli, locandine e dati dei film sono quelli pubblicati sulle schede di
        HEDDY.video{q.data ? ` · catalogo letto il ${q.data.fonte.fotografia.split("-").reverse().join("/")}, aggiornato dal server ogni 6 ore` : ""}.
        Visione e condizioni di accesso sono quelle di HEDDY.video.
      </footer>

      <Link href="/" className="mt-8 inline-block text-sm text-[var(--tbh-muted)] underline-offset-4 hover:text-white hover:underline">
        Torna alla home
      </Link>
    </div>
  );
}

function Filtro({ attivo, onClick, children }: { attivo: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={attivo}
      className={`rounded-full border px-3 py-1.5 text-[11px] font-extrabold tracking-[0.12em] transition ${
        attivo ? "border-[#d7ff00] text-[#d7ff00]" : "border-white/15 text-white/70 hover:border-white/40"
      }`}
    >
      {children}
    </button>
  );
}
