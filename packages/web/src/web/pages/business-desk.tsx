import { Link } from "wouter";
import { ExternalLink, Info, MessageCircle } from "lucide-react";
import { useIstituzioni } from "../queries/tbh";
import { waInfo } from "../lib/whatsapp";

/**
 * ORDINE 24 · BUSINESS DESK — Centro per l'Impiego, SIUL, INPS, INAIL, Agenzia delle
 * Entrate, Agenzia Entrate-Riscossione, Camera di Commercio e altri servizi.
 * Ogni voce apre il portale ufficiale: nessun servizio simulato.
 */
export default function BusinessDeskPage() {
  const q = useIstituzioni();

  return (
    <div className="mx-auto max-w-[1400px] px-4 md:px-8 py-10">
      <header className="tbh-rise mb-8">
        <p className="text-xs tracking-[0.25em] text-[var(--tbh-gold)] uppercase mb-2">
          Servizi &amp; gestionali
        </p>
        <h1 className="tbh-display tbh-h1">Business Desk</h1>
        <p className="tbh-body text-[var(--tbh-muted)] max-w-3xl mt-3">
          La scrivania per imprese, professionisti e lavoratori: collegamenti diretti ai portali
          ufficiali di lavoro, previdenza, fisco e impresa.
        </p>
      </header>

      {q.isLoading && <div className="tbh-card h-48 animate-pulse" />}

      <div className="grid gap-6 lg:grid-cols-2">
        {(q.data?.gruppi ?? []).map((g) => (
          <section key={g.gruppo} className="tbh-card p-6">
            <h2 className="tbh-display tbh-h2 mb-4">{g.gruppo}</h2>
            <ul className="space-y-4">
              {g.voci.map((v) => (
                <li key={v.url} className="border-t border-[var(--tbh-line)] pt-4 first:border-0 first:pt-0">
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

      {q.data?.disclaimer && (
        <p className="mt-8 text-sm text-[var(--tbh-muted)] flex items-start gap-2">
          <Info size={16} className="mt-0.5 shrink-0 text-[var(--tbh-gold)]" />
          {q.data.disclaimer}
        </p>
      )}

      <section className="mt-10 grid gap-4 md:grid-cols-3">
        <Link to="/lavoro-casting" className="tbh-card p-5 hover:border-[var(--tbh-neon)]">
          <h3 className="tbh-display tbh-h3">Job &amp; Casting</h3>
          <p className="text-sm text-[var(--tbh-muted)] mt-2">Annunci e candidature TBH.</p>
        </Link>
        <Link to="/tbh/servizi" className="tbh-card p-5 hover:border-[var(--tbh-neon)]">
          <h3 className="tbh-display tbh-h3">Servizi TBH</h3>
          <p className="text-sm text-[var(--tbh-muted)] mt-2">Chi eroga cosa nel gruppo.</p>
        </Link>
        <Link to="/tbh/livelli" className="tbh-card p-5 hover:border-[var(--tbh-neon)]">
          <h3 className="tbh-display tbh-h3">25 Livelli TBH</h3>
          <p className="text-sm text-[var(--tbh-muted)] mt-2">Percorso di adesione al gruppo.</p>
        </Link>
      </section>

      <div className="tbh-card p-6 mt-8 flex flex-wrap items-center justify-between gap-4">
        <p className="tbh-body max-w-2xl">
          Serve assistenza su una pratica, un corso o un servizio del gruppo?
        </p>
        <a
          href={waInfo("Business Desk TBH")}
          target="_blank"
          rel="noreferrer"
          className="tbh-neon-btn px-5 py-3 text-sm inline-flex items-center gap-2"
        >
          <MessageCircle size={16} /> Scrivici su WhatsApp
        </a>
      </div>
    </div>
  );
}
