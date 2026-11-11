import { BadgeCheck, RefreshCw } from "lucide-react";
import { useCircuitoRandom } from "../queries/rete";
import { LogoBox } from "./logo-box";

/** Banner random con le attività che espongono la vetrofania del circuito TBH. */
export function CircuitoBanner({ n = 4 }: { n?: number }) {
  const q = useCircuitoRandom(n);

  return (
    <section className="tbh-card p-5 md:p-7">
      <div className="flex items-center justify-between gap-4 mb-5 flex-wrap">
        <div>
          <p className="text-[11px] tracking-[0.25em] text-[var(--tbh-gold)] uppercase">
            Vetrofania esposta
          </p>
          <h2 className="tbh-display tbh-h2">Circuito TBH · attività a rotazione</h2>
        </div>
        <button
          onClick={() => q.refetch()}
          className="tbh-neon-btn px-4 py-2 text-sm flex items-center gap-2"
        >
          <RefreshCw size={16} className={q.isFetching ? "animate-spin" : ""} /> Cambia
        </button>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {(q.data?.items ?? []).map((l) => (
          <article key={l.nome} className="rounded-2xl border border-[var(--tbh-line)] bg-black/50 p-4">
            {/* Riquadro del marchio: componente globale unico (punto 5 del 17/09/2026).
                Era un box scritto a mano dentro questo banner; ora è lo stesso
                LogoBox di tutto il sito e scarica la variante generata dal master. */}
            <LogoBox
              nome={l.nome}
              logo={l.logo}
              formato="scheda-attivita"
              /* h-24 tagliava il ripiego quando il nome va su due righe (verificato a
                 video su «Ristorante Locanda Rosa dei Venti»): il riquadro resta uguale
                 per tutte le card, solo più alto. */
              altezzaClasse="h-32 md:h-36"
              fondo="chiaro"
              className="mb-3"
            />
            <h3 className="tbh-display text-lg leading-tight">{l.nome}</h3>
            <p className="text-xs text-[var(--tbh-muted)] mt-1">{l.citta}</p>
            <span className="mt-3 inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-black bg-[var(--tbh-neon)] px-2.5 py-1 rounded-full">
              <BadgeCheck size={13} /> Circuito TBH
            </span>
          </article>
        ))}
        {q.isLoading &&
          Array.from({ length: n }).map((_, i) => (
            <div key={i} className="rounded-2xl h-56 bg-white/5 animate-pulse" />
          ))}
      </div>
    </section>
  );
}
