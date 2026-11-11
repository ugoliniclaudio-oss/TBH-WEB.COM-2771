import { ExternalLink, Info } from "lucide-react";
import { useIstituzioni } from "../queries/tbh";

export default function IstituzioniPage() {
  const q = useIstituzioni();

  return (
    <div className="mx-auto max-w-[1400px] px-4 md:px-8 py-10">
      <header className="tbh-rise mb-6">
        <p className="text-xs tracking-[0.25em] text-[var(--tbh-gold)] uppercase mb-2">
          Servizio informativo
        </p>
        <h1 className="tbh-display tbh-h1">Istituzioni &amp; portali ufficiali</h1>
      </header>

      {q.data && (
        <div className="tbh-card p-5 mb-8 flex gap-3 items-start">
          <Info className="text-[var(--tbh-gold)] shrink-0" size={20} />
          <p className="text-sm text-[var(--tbh-muted)]">{q.data.disclaimer}</p>
        </div>
      )}

      {q.isLoading && (
        <div className="grid gap-5 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="tbh-card h-56 animate-pulse" />
          ))}
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {q.data?.gruppi.map((g) => (
          <section key={g.gruppo} className="tbh-card p-5">
            <h2 className="tbh-display text-2xl mb-4">{g.gruppo}</h2>
            <ul className="space-y-4">
              {g.voci.map((v) => (
                <li key={v.url}>
                  <a
                    href={v.url}
                    target="_blank"
                    rel="noreferrer"
                    className="font-semibold text-[var(--tbh-neon)] inline-flex items-start gap-2"
                  >
                    {v.name} <ExternalLink size={14} className="mt-1 shrink-0" />
                  </a>
                  <p className="text-sm text-[var(--tbh-muted)] mt-1">{v.note}</p>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
