import { ExternalLink, MessageCircle } from "lucide-react";
import { useServizi } from "../queries/tbh";
import { waInfo } from "../lib/whatsapp";

export default function ServiziPage() {
  const q = useServizi();

  return (
    <div className="mx-auto max-w-[1500px] px-4 md:px-8 py-10">
      <header className="tbh-rise mb-8">
        <p className="text-xs tracking-[0.25em] text-[var(--tbh-gold)] uppercase mb-2">
          Punto 06 della Master List
        </p>
        <h1 className="tbh-display tbh-h1">Servizi &amp; chi li eroga</h1>
        <p className="tbh-body text-[var(--tbh-muted)] max-w-3xl mt-3">
          Ogni servizio è collegato all'entità che lo eroga: società con P.IVA o attività del
          gruppo. Nessuna attività viene promossa a società.
        </p>
      </header>

      {q.isLoading && (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="tbh-card h-44 animate-pulse" />
          ))}
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {q.data?.gruppi.map((g) => (
          <section key={g.settore} className="tbh-card p-5">
            <h2 className="tbh-display text-xl md:text-2xl mb-4">{g.settore}</h2>
            <ul className="space-y-4">
              {g.erogato.map((e) => (
                <li key={e.code} className="border-t border-[var(--tbh-line)] pt-3 first:border-0 first:pt-0">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold">{e.name}</p>
                      <p className="text-xs text-[var(--tbh-muted)]">
                        {e.code} ·{" "}
                        {e.kind === "societa"
                          ? `Società · P.IVA ${e.vat ?? "da verificare"}`
                          : "Attività del gruppo · senza P.IVA propria"}
                      </p>
                    </div>
                    {e.site && (
                      <a
                        href={e.site}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[var(--tbh-neon)] shrink-0"
                        aria-label={`Sito di ${e.name}`}
                      >
                        <ExternalLink size={16} />
                      </a>
                    )}
                  </div>
                  <a
                    href={waInfo(`i servizi di ${e.name} (${e.code})`)}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-2 inline-flex items-center gap-2 text-sm font-semibold text-[var(--tbh-neon)]"
                  >
                    <MessageCircle size={15} /> Richiedi il servizio
                  </a>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
