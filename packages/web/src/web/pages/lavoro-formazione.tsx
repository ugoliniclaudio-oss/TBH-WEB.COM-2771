/** TBH Lavoro — Formazione (06/10/2026): rimanda solo ai corsi già pubblicati sul sito. */
import { Link } from "wouter";
import { ArrowRight, Flame, GraduationCap, Radar } from "lucide-react";
import { TestataLavoro } from "../components/tbh-lavoro";

const CORSI = [
  {
    to: "/corsi/antincendio-livello-3",
    icona: Flame,
    titolo: "Corso Addetto Antincendio — Livello 3",
    testo: "16 ore (12 teoria + 4 pratica) con preparazione all'esame di idoneità tecnica presso i Vigili del Fuoco.",
  },
  {
    to: "/hvs#corso",
    icona: Radar,
    titolo: "Corso TBH High Visibility Scout",
    testo: "4 settimane per lavorare come scout commerciale on field, in smart working o da remoto.",
  },
  {
    to: "/touch-academy",
    icona: GraduationCap,
    titolo: "Touch Academy — Crew & Academy",
    testo: "Percorsi per crew, produzioni ed eventi del gruppo TBH.",
  },
];

export default function LavoroFormazionePage() {
  return (
    <div className="mx-auto max-w-[1100px] px-4 md:px-8 py-8 md:py-10">
      <TestataLavoro
        occhiello="TBH Lavoro · formazione"
        titolo="Formazione per lavorare"
        testo="Corsi già attivi sul sito TBH: prezzi, date e iscrizioni sono nella pagina di ciascun corso."
      />
      <div className="grid gap-4 md:grid-cols-3">
        {CORSI.map(({ to, icona: Icona, titolo, testo }) => (
          <Link key={to} to={to} className="group rounded-2xl border border-[var(--tbh-line)] bg-[var(--tbh-surface)] p-5 flex flex-col hover:border-[var(--tbh-neon)]">
            <Icona className="text-[var(--tbh-neon)]" />
            <h2 className="tbh-display text-2xl leading-tight mt-3">{titolo}</h2>
            <p className="text-sm text-[var(--tbh-muted)] mt-2 grow">{testo}</p>
            <span className="mt-4 text-sm font-semibold text-[var(--tbh-neon)] inline-flex items-center gap-1.5">
              Vai al corso <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
