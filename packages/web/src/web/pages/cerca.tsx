import { useState } from "react";
import { Link, useSearchParams } from "wouter";
import { ExternalLink, Search } from "lucide-react";
import { useRicerca } from "../queries/ricerca";
import { wa } from "../lib/whatsapp";

/** ORDINE 4 · Ricerca globale del portale. */
export default function CercaPage() {
  const [params, setParams] = useSearchParams();
  const q = params.get("q") ?? "";
  const [testo, setTesto] = useState(q);
  const ric = useRicerca(q);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setParams(testo.trim() ? { q: testo.trim() } : {});
  }

  const items = ric.data?.items ?? [];

  return (
    <div className="mx-auto max-w-[1400px] px-4 md:px-8 py-10">
      <header className="tbh-rise mb-6">
        <p className="text-xs tracking-[0.25em] text-[var(--tbh-gold)] uppercase mb-2">
          Ricerca globale
        </p>
        <h1 className="tbh-display tbh-h1">Cerca nel mondo TBH</h1>
        <p className="tbh-body text-[var(--tbh-muted)] max-w-3xl mt-3">
          Attività, società, servizi, prodotti, programmi, squadre, partner, città, media e sezioni
          del portale. La ricerca legge solo le anagrafiche reali: niente risultati inventati.
        </p>
      </header>

      <form onSubmit={submit} className="flex gap-2 mb-8">
        <div className="relative grow">
          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--tbh-muted)]"
          />
          <input
            value={testo}
            onChange={(e) => setTesto(e.target.value)}
            placeholder="Cerca attività, servizi, aziende, notizie…"
            aria-label="Cerca attività, servizi, aziende o notizie"
            className="w-full rounded-full bg-black/60 border border-[var(--tbh-line)] pl-11 pr-4 py-3 text-sm outline-none focus:border-[var(--tbh-neon)]"
          />
        </div>
        <button className="tbh-neon-btn px-6 py-3 text-sm">Cerca</button>
      </form>

      {q.trim().length < 2 && (
        <p className="text-[var(--tbh-muted)]">
          Scrivi almeno due lettere. Sono indicizzate {ric.data?.indicizzati ?? "tutte le"} voci
          reali del portale.
        </p>
      )}

      {ric.isLoading && <div className="tbh-card h-40 animate-pulse" />}

      {q.trim().length >= 2 && !ric.isLoading && (
        <>
          <p className="text-sm text-[var(--tbh-muted)] mb-4">
            {ric.data?.trovati ?? 0} risultati per «{q}»
          </p>

          {items.length === 0 ? (
            <div className="tbh-card p-6">
              <p className="font-semibold mb-2">Nessun risultato tra i dati verificati.</p>
              <p className="text-sm text-[var(--tbh-muted)] mb-4">
                Non pubblichiamo risultati inventati. Se cerchi qualcosa che non è ancora online,
                chiedilo direttamente su WhatsApp.
              </p>
              <a
                href={wa(`Buongiorno, cerco informazioni su: ${q}.`)}
                target="_blank"
                rel="noreferrer"
                className="tbh-neon-btn px-5 py-2.5 text-sm inline-flex"
              >
                Chiedi su WhatsApp
              </a>
            </div>
          ) : (
            <div className="grid gap-3">
              {items.map((r) => (
                <div
                  key={r.id}
                  className="tbh-card p-4 flex flex-wrap items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <p className="text-[11px] tracking-[0.18em] uppercase text-[var(--tbh-gold)]">
                      {r.tipo}
                    </p>
                    <h3 className="tbh-display text-xl">{r.titolo}</h3>
                    {r.dettaglio && (
                      <p className="text-sm text-[var(--tbh-muted)]">{r.dettaglio}</p>
                    )}
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <Link
                      to={r.to}
                      className="px-4 py-2 rounded-full text-sm font-semibold border border-[var(--tbh-line)] hover:border-[var(--tbh-neon)]"
                    >
                      Apri scheda
                    </Link>
                    {r.esterno && (
                      <a
                        href={r.esterno}
                        target="_blank"
                        rel="noreferrer"
                        className="px-4 py-2 rounded-full text-sm font-semibold text-[var(--tbh-neon)] inline-flex items-center gap-2"
                      >
                        Sito <ExternalLink size={14} />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
