import { Link } from "wouter";
import { ArrowRight, CalendarDays, Flag, PlayCircle, Trophy } from "lucide-react";
import { useCalendarioSport } from "../queries/tbh";
import { prossimiAppuntamenti } from "../components/evento-sport";

/**
 * /sport — HOME SPORT riorganizzata il 15/09/2026 su ordine di Claudio.
 *
 * Solo quattro grandi accessi — CALCIO · VIDEO · CALENDARIO · MOTORSPORT — e sotto una
 * sola fascia «PROSSIMI APPUNTAMENTI» con massimo tre eventi che richiamano le schede
 * già presenti nel calendario: nessun contenuto duplicato, nessuna pagina nuova.
 * Squadre → dentro CALCIO. Partite, highlights e interviste → dentro VIDEO.
 * Tornei, tappe e appuntamenti → dentro CALENDARIO.
 */

const ACCESSI = [
  {
    to: "/sport/calcio",
    label: "Calcio",
    icona: Trophy,
    cosa: "Squadre, risultati e notizie, tornei e progetti del territorio.",
  },
  {
    to: "/sport/highlights-dm",
    label: "Video",
    icona: PlayCircle,
    cosa: "Partite integrali, highlights e interviste dal canale ufficiale.",
  },
  {
    to: "/sport/calendario",
    label: "Calendario",
    icona: CalendarDays,
    cosa: "Il calendario unico: partite, tornei, dirette, programmi DM, tappe, motorsport.",
  },
  {
    to: "/sport/motorsport",
    label: "Motorsport",
    icona: Flag,
    cosa: "Circuiti, campionati e partner tecnici, sempre dalla fonte ufficiale.",
  },
];

export default function SportHubPage() {
  const cal = useCalendarioSport();
  const prossimi = prossimiAppuntamenti(cal.data?.eventi ?? []);

  return (
    <div className="mx-auto max-w-[1500px] px-4 md:px-8 py-10">
      <header className="tbh-rise mb-10">
        <p className="text-xs tracking-[0.3em] text-[var(--tbh-gold)] uppercase mb-3">Sport</p>
        <h1 className="tbh-display tbh-h1">Area Sport TBH</h1>
        <p className="tbh-body text-[var(--tbh-muted)] max-w-3xl mt-4">
          Quattro accessi, nient'altro: il calcio con le squadre, i video, il calendario unico di
          tutti gli appuntamenti e il motorsport. Classifiche e risultati arrivano sempre dalla
          fonte ufficiale, non da copie.
        </p>
      </header>

      {/* ───── I QUATTRO GRANDI ACCESSI ───── */}
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {ACCESSI.map((a) => {
          const Icona = a.icona;
          return (
            <Link
              key={a.to}
              to={a.to}
              className="tbh-card p-6 md:p-7 flex flex-col gap-3 hover:border-[var(--tbh-neon)] transition min-h-[220px]"
            >
              <Icona size={30} className="text-[var(--tbh-neon)]" />
              <h2 className="tbh-display text-3xl leading-none uppercase">{a.label}</h2>
              <p className="text-sm text-[var(--tbh-muted)] grow">{a.cosa}</p>
              <span className="text-xs font-bold uppercase tracking-wide text-[var(--tbh-neon)] inline-flex items-center gap-1.5">
                Entra <ArrowRight size={14} />
              </span>
            </Link>
          );
        })}
      </div>

      {/* ───── UNA SOLA FASCIA: PROSSIMI APPUNTAMENTI (massimo 3) ───── */}
      <section className="tbh-card p-5 md:p-7 mt-12">
        <div className="flex flex-wrap items-end justify-between gap-3 mb-5">
          <h2 className="tbh-display tbh-h2">Prossimi appuntamenti</h2>
          <Link
            to="/sport/calendario"
            className="text-xs font-bold uppercase tracking-wide text-[var(--tbh-neon)] inline-flex items-center gap-1.5"
          >
            Vedi il calendario sport <ArrowRight size={14} />
          </Link>
        </div>

        {cal.isLoading && <div className="h-24 animate-pulse rounded-2xl bg-white/5" />}

        {prossimi.length > 0 ? (
          <ol className="grid gap-4 md:grid-cols-3">
            {prossimi.map((e, i) => (
              <li key={e.id} data-appuntamento={e.id} className="flex gap-3 items-start">
                <span className="tbh-display text-3xl text-[var(--tbh-neon)] leading-none">
                  {i + 1}
                </span>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-[var(--tbh-gold)]">
                    {e.periodo}
                  </p>
                  <p className="text-sm font-semibold leading-snug mt-0.5">{e.titolo}</p>
                  <p className="text-[11px] uppercase tracking-wider text-[var(--tbh-muted)] mt-1">
                    {e.stato}
                    {e.localita ? ` · ${e.localita}` : ""}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        ) : (
          !cal.isLoading && (
            <p className="text-sm text-[var(--tbh-muted)]">
              Nessun appuntamento in programma: appena c'è una conferma compare nel calendario.
            </p>
          )
        )}
      </section>
    </div>
  );
}
