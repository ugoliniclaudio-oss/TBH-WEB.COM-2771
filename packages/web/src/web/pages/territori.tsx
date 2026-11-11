import { Link } from "wouter";
import { MapPin, Check, Hammer } from "lucide-react";
import { useTerritori } from "../queries/rete";
import { SezioneAmministrabile } from "../components/sezione-amministrabile";

export default function TerritoriPage() {
  const q = useTerritori();

  return (
    <div className="mx-auto max-w-[1500px] px-4 md:px-8 py-10">
      <header className="tbh-rise mb-10">
        <p className="text-xs tracking-[0.25em] text-[var(--tbh-gold)] uppercase mb-2">
          Spazi territoriali dedicati
        </p>
        <h1 className="tbh-display tbh-h1">Territori</h1>
        <p className="tbh-body text-[var(--tbh-muted)] max-w-3xl mt-3">
          Ogni piazza dove il gruppo lavora ha il suo spazio: Italia, Spagna, Francia. Dove il
          presidio è ancora da aprire leggi «in allestimento», ma il posto c'è già.
        </p>
      </header>

      <div className="grid gap-7 md:grid-cols-2 xl:grid-cols-3">
        {(q.data?.items ?? []).map((t) => (
          <article key={t.slug} className="tbh-card p-6 flex flex-col">
            <div className="flex items-start justify-between gap-3">
              <h2 className="tbh-display text-2xl leading-tight">{t.nome}</h2>
              <span
                className={`shrink-0 inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full ${
                  t.stato === "attivo"
                    ? "bg-[var(--tbh-neon)] text-black"
                    : "bg-white/10 text-[var(--tbh-muted)]"
                }`}
              >
                {t.stato === "attivo" ? <Check size={13} /> : <Hammer size={13} />} {t.stato}
              </span>
            </div>
            <p className="text-xs uppercase tracking-wide text-[var(--tbh-gold)] mt-2 flex items-center gap-1.5">
              <MapPin size={13} /> {t.area}
            </p>
            <p className="text-sm text-[var(--tbh-muted)] mt-3">{t.perche}</p>
            <ul className="mt-4 space-y-1.5 text-sm grow">
              {t.highlights.map((h) => (
                <li key={h} className="flex gap-2">
                  <span className="text-[var(--tbh-neon)]">›</span> {h}
                </li>
              ))}
            </ul>
            <div className="mt-5 flex flex-wrap gap-2">
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(t.nome)}`}
                target="_blank"
                rel="noreferrer"
                className="tbh-neon-btn px-4 py-2 text-sm"
              >
                Apri mappa
              </a>
              <Link
                to={t.stato === "attivo" ? "/mappa" : "/in-allestimento"}
                className="px-4 py-2 rounded-full border border-[var(--tbh-line)] text-sm font-semibold hover:border-[var(--tbh-neon)]"
              >
                {t.stato === "attivo" ? "Luoghi del circuito" : "Stiamo lavorando"}
              </Link>
            </div>
          </article>
        ))}
      </div>
      <div className="mt-14 grid gap-12 border-t border-white/10 pt-10">
        <SezioneAmministrabile sezione="territorio" />
      </div>
    </div>
  );
}
