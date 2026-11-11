import { MessageCircle } from "lucide-react";
import { useLivelli } from "../queries/tbh";
import { euro } from "../components/tiles";
import { waLivello, waInfo } from "../lib/whatsapp";

const COLORI: Record<string, string> = {
  ESSENZIALE: "var(--tbh-platinum)",
  "START UP": "var(--tbh-neon)",
  PROFESSIONALE: "#7ad0ff",
  LUXURY: "var(--tbh-gold)",
  "ALL INCLUSIVE": "#ff7ad0",
};

export default function LivelliPage() {
  const q = useLivelli();

  return (
    <div className="mx-auto max-w-[1500px] px-4 md:px-8 py-10">
      <header className="tbh-rise mb-8">
        <p className="text-xs tracking-[0.25em] text-[var(--tbh-gold)] uppercase mb-2">
          Area master unica
        </p>
        <h1 className="tbh-display tbh-h1">I 25 Livelli TBH</h1>
        <p className="tbh-body text-[var(--tbh-muted)] max-w-3xl mt-3">
          Cinque fasce, venticinque livelli: dall'ingresso gratuito nel Circuito fino ai pacchetti
          All Inclusive. Ogni livello ha un pubblico, dei vantaggi e una visibilità dedicata.
        </p>
        <p className="text-sm text-[var(--tbh-gold)] mt-3">
          Prezzi, bonus e cashback vengono pubblicati solo quando confermati: dove leggi «da
          definire» il dato non è ancora ufficiale e non lo inventiamo.
        </p>
      </header>

      {q.isLoading && (
        <div className="grid gap-4 md:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="tbh-card h-40 animate-pulse" />
          ))}
        </div>
      )}

      {q.data?.fasce.map((f) => (
        <section key={f.nome} className="mb-12">
          <div className="flex flex-wrap items-baseline gap-3 mb-4">
            <h2 className="tbh-display tbh-h2" style={{ color: COLORI[f.nome] }}>
              {f.nome}
            </h2>
            <span className="text-sm text-[var(--tbh-muted)]">{f.descrizione}</span>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {f.livelli.map((l) => (
              <article key={l.numero} className="tbh-card p-5 flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <span
                    className="grid place-items-center w-12 h-12 rounded-xl tbh-display text-xl text-black shrink-0"
                    style={{ background: COLORI[f.nome] }}
                  >
                    {String(l.numero).padStart(2, "0")}
                  </span>
                  <h3 className="tbh-display text-2xl leading-tight">{l.nome}</h3>
                </div>

                <div className="text-sm">
                  <div className="flex justify-between gap-2 py-1 border-b border-[var(--tbh-line)]">
                    <span className="text-[var(--tbh-muted)]">Prezzo pubblico</span>
                    <span className="font-semibold">
                      {l.prezzoPubblicoCents !== null ? euro(l.prezzoPubblicoCents) : "da definire"}
                    </span>
                  </div>
                  <div className="flex justify-between gap-2 py-1">
                    <span className="text-[var(--tbh-muted)]">Prezzo Circuito</span>
                    <span className="font-semibold">
                      {l.prezzoCircuitoCents !== null ? euro(l.prezzoCircuitoCents) : "da definire"}
                    </span>
                  </div>
                </div>

                {l.benefit.length > 0 ? (
                  <ul className="text-sm text-[var(--tbh-muted)] space-y-1">
                    {l.benefit.map((b) => (
                      <li key={b}>· {b}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-[var(--tbh-muted)]">
                    Vantaggi e bonus in allestimento: chiedili su WhatsApp, ti rispondiamo con il
                    dettaglio aggiornato.
                  </p>
                )}

                <a
                  href={waLivello(l.numero, l.nome)}
                  target="_blank"
                  rel="noreferrer"
                  className="tbh-neon-btn px-4 py-2.5 text-sm mt-auto flex items-center justify-center gap-2"
                >
                  <MessageCircle size={16} /> Richiedi il livello
                </a>
              </article>
            ))}
          </div>
        </section>
      ))}

      <div className="tbh-card p-6 flex flex-col md:flex-row md:items-center gap-4">
        <p className="grow text-sm">
          Non sai quale livello fa per te? Ti guidiamo noi: raccontaci attività, obiettivi e budget.
        </p>
        <a
          href={waInfo("i 25 Livelli TBH")}
          target="_blank"
          rel="noreferrer"
          className="tbh-neon-btn px-5 py-2.5 text-sm flex items-center gap-2 whitespace-nowrap"
        >
          <MessageCircle size={16} /> Parla con noi
        </a>
      </div>
    </div>
  );
}
