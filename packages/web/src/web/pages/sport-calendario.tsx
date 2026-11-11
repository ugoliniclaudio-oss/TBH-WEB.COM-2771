import { useState } from "react";
import { Link } from "wouter";
import { CalendarDays, ExternalLink } from "lucide-react";
import { useCalendarioSport } from "../queries/tbh";
import { SchedaEvento, prossimiAppuntamenti, type Evento } from "../components/evento-sport";
import { SezioneAmministrabile } from "../components/sezione-amministrabile";

/**
 * /sport/calendario — CALENDARIO UNICO ufficiale TBH (ordine di Claudio del 15/09/2026).
 * Qui stanno partite, tornei, dirette, riprese, interviste, programmi DM, eventi, tappe e
 * motorsport: nessun calendario separato, nessuna pagina nuova per singola tappa o torneo.
 * Quattro filtri e quattro stati, esattamente quelli chiesti.
 */
export default function SportCalendarioPage() {
  const q = useCalendarioSport();
  const [filtro, setFiltro] = useState<string>("TUTTO");

  const eventi: Evento[] = [...(q.data?.eventi ?? []), ...(q.data?.programmi ?? [])];
  const titoli = new Map(eventi.map((e) => [e.id, e.titolo]));

  const visibili = eventi
    .filter((e) => filtro === "TUTTO" || e.categoria === filtro)
    .slice()
    .sort((a, b) => a.ordine.localeCompare(b.ordine));

  const prossimi = prossimiAppuntamenti(q.data?.eventi ?? []);

  return (
    <div className="mx-auto max-w-[1500px] px-4 md:px-8 py-10">
      <header className="tbh-rise mb-8">
        <p className="text-xs tracking-[0.25em] text-[var(--tbh-gold)] uppercase mb-2">Sport</p>
        <h1 className="tbh-display tbh-h1 flex items-center gap-3">
          <CalendarDays className="text-[var(--tbh-neon)]" /> Calendario Sport
        </h1>
        <p className="tbh-body text-[var(--tbh-muted)] max-w-4xl mt-3">{q.data?.nota}</p>
      </header>

      {/* PROSSIMI APPUNTAMENTI — richiamo cronologico, massimo tre, senza ripetere i testi */}
      {prossimi.length > 0 && (
        <section className="tbh-card p-5 md:p-6 mb-10">
          <h2 className="tbh-display tbh-h3 mb-4">Prossimi appuntamenti</h2>
          <ol className="grid gap-3 md:grid-cols-3">
            {prossimi.map((e, i) => (
              <li key={e.id} data-appuntamento={e.id} className="flex gap-3 items-start">
                <span className="tbh-display text-2xl text-[var(--tbh-neon)] leading-none">
                  {i + 1}
                </span>
                <div>
                  <p className="text-xs font-semibold text-[var(--tbh-gold)]">{e.periodo}</p>
                  <p className="text-sm font-semibold leading-snug">{e.titolo}</p>
                  <p className="text-[11px] uppercase tracking-wider text-[var(--tbh-muted)] mt-1">
                    {e.stato}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </section>
      )}

      {/* I QUATTRO FILTRI: TUTTO · CALCIO · PROGRAMMI · MOTORSPORT */}
      <div className="flex flex-wrap gap-2 mb-8" role="tablist" aria-label="Filtri calendario">
        {(q.data?.filtri ?? ["TUTTO", "CALCIO", "PROGRAMMI", "MOTORSPORT"]).map((f) => (
          <button
            key={f}
            type="button"
            role="tab"
            aria-selected={filtro === f}
            onClick={() => setFiltro(f)}
            className={`px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wide transition ${
              filtro === f
                ? "bg-[var(--tbh-neon)] text-black"
                : "border border-[var(--tbh-line)] text-[var(--tbh-platinum)] hover:border-[var(--tbh-neon)]"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {q.isLoading && <div className="tbh-card h-64 animate-pulse" />}

      {q.data && (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {visibili.map((e) => (
            <SchedaEvento
              key={e.id}
              e={e}
              collegato={e.collegatoA ? (titoli.get(e.collegatoA) ?? null) : null}
            />
          ))}
        </div>
      )}

      {q.data && visibili.length === 0 && (
        <p className="text-sm text-[var(--tbh-muted)]">
          Nessun appuntamento in questa categoria: appena arriva la conferma lo pubblichiamo qui,
          in questo stesso calendario.
        </p>
      )}

      <section className="tbh-card p-5 md:p-6 mt-10 flex flex-col md:flex-row md:items-center gap-4">
        <div className="grow">
          <h2 className="tbh-display tbh-h3">Programmi sportivi DM</h2>
          <p className="text-sm text-[var(--tbh-muted)] mt-1">
            Gli appuntamenti con il badge «Collaborazione DM» aprono la pagina del programma: il
            video sta lì, una volta sola.
          </p>
        </div>
        <div className="flex flex-wrap gap-2 shrink-0">
          <Link
            to="/dm/programmi"
            className="tbh-neon-btn px-5 py-2.5 text-xs font-bold uppercase tracking-wide"
          >
            Programmi DM
          </Link>
          {q.data?.dmSportLive && (
            <a
              href={q.data.dmSportLive.url}
              target="_blank"
              rel="noreferrer"
              className="px-5 py-2.5 rounded-full border border-[#ff2b2b66] text-xs font-bold uppercase tracking-wide text-[#ff2b2b] inline-flex items-center gap-1.5 hover:border-[#ff2b2b]"
            >
              Visita DM Sport Live <ExternalLink size={12} />
            </a>
          )}
        </div>
      </section>
      <div className="mt-14 grid gap-12 border-t border-white/10 pt-10">
        <SezioneAmministrabile sezione="dm-sport-partite" />
      </div>
    </div>
  );
}
