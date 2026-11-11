import { ArrowRight, MessageCircle } from "lucide-react";
import { Link } from "wouter";
import { useCircuito } from "../queries/tbh";
import { BolloProdottoUfficiale } from "../components/sigillo-prodotti";
import { waInfo } from "../lib/whatsapp";

export default function CircuitoPage() {
  const q = useCircuito();

  return (
    <div className="mx-auto max-w-[1500px] px-4 md:px-8 py-10">
      <header className="tbh-rise mb-8">
        <p className="text-xs tracking-[0.25em] text-[var(--tbh-gold)] uppercase mb-2">
          Punto 09 della Master List
        </p>
        <h1 className="tbh-display tbh-h1">Circuito TBH</h1>
        <p className="tbh-body text-[var(--tbh-muted)] max-w-3xl mt-3">
          I luoghi che espongono la vetrofania TBH.{" "}
          {q.data ? `Oggi ${q.data.totale} attività confermate.` : ""} Dove l'indirizzo non è
          confermato lo scriviamo: nessun dato inventato.
        </p>
        <p className="tbh-body text-[var(--tbh-muted)] max-w-3xl mt-2 text-[12px]">
          <strong className="text-[var(--tbh-gold)]">Due sigilli, non uno.</strong> Il sigillo
          «Prodotti Ufficiali TBH» sta solo sul negozio online, sui negozi fisici del gruppo e sugli
          articoli del marchio. Tutto il resto che vedi esposto nel Circuito è originale dei
          rispettivi titolari.
        </p>
      </header>

      {q.isLoading && (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="tbh-card h-48 animate-pulse" />
          ))}
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {q.data?.categorie.map((c) => (
          <section key={c.categoria} className="tbh-card p-5">
            <h2 className="tbh-display text-xl md:text-2xl mb-4">{c.categoria}</h2>
            <ul className="space-y-4">
              {c.luoghi.map((l) => (
                <li
                  key={l.nome}
                  className="border-t border-[var(--tbh-line)] pt-3 first:border-0 first:pt-0"
                >
                  {/* 05/09/2026 — il nome apre la scheda dell'attività. Se la scheda non
                      esiste resta testo semplice: nessun bottone morto. */}
                  {l.slug ? (
                    <Link
                      to={`/e/${l.slug}`}
                      className="font-semibold inline-flex items-center gap-1.5 hover:text-[var(--tbh-neon)]"
                    >
                      {l.nome} <ArrowRight size={14} className="opacity-60" />
                    </Link>
                  ) : (
                    <p className="font-semibold">{l.nome}</p>
                  )}
                  {/* 30/09/2026 — il sigillo «Prodotti Ufficiali TBH» compare solo
                      sui locali del gruppo. Gli altri espongono la vetrofania del
                      Circuito, ma la loro merce è originale e resta loro. */}
                  {l.delGruppo && (
                    <div className="mt-2">
                      <BolloProdottoUfficiale etichetta="Negozio del gruppo TBH" dimensione={28} />
                    </div>
                  )}
                  <p className="text-sm text-[var(--tbh-muted)] mt-1">{l.citta}</p>
                  <p className="text-xs text-[var(--tbh-muted)] mt-1">
                    {l.indirizzo ?? "Indirizzo da confermare"}
                  </p>
                  {l.note && <p className="text-xs text-[var(--tbh-muted)] mt-1">{l.note}</p>}
                  {l.sito && (
                    <a
                      href={l.sito}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm font-semibold text-[var(--tbh-neon)]"
                    >
                      Sito ufficiale
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      <div className="tbh-card p-6 mt-10 flex flex-col md:flex-row md:items-center gap-4">
        <p className="text-sm grow">
          <strong>Vuoi la vetrofania TBH nella tua attività?</strong> Entri nel circuito e finisci
          sulla mappa, nei banner e nel magazine.
        </p>
        <a
          href={waInfo("come entrare nel Circuito TBH con la vetrofania")}
          target="_blank"
          rel="noreferrer"
          className="tbh-neon-btn px-5 py-2.5 text-sm inline-flex items-center gap-2 whitespace-nowrap"
        >
          <MessageCircle size={16} /> Entra nel circuito
        </a>
      </div>
    </div>
  );
}
