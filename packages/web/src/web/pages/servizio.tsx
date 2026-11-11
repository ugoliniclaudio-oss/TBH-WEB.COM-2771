import { Link } from "wouter";
import { ArrowLeft, MessageCircle } from "lucide-react";
import { useProduct } from "../queries/catalog";
import { LogoBox, euro } from "../components/tiles";
import { waOrdine, waInfo } from "../lib/whatsapp";

/**
 * FASE 3 — Pagina singola SERVIZIO (brief punto 08).
 * Cosa comprende, come si richiede, chi lo eroga: nessuna condizione inventata.
 */
export default function ServizioPage({ slug }: { slug: string }) {
  const q = useProduct(slug);
  const s = q.data;

  if (q.isLoading)
    return (
      <div className="mx-auto max-w-[1500px] px-4 md:px-8 py-16">
        <div className="tbh-card h-96 animate-pulse" />
      </div>
    );

  if (!s)
    return (
      <div className="mx-auto max-w-[1500px] px-4 md:px-8 py-16">
        <h1 className="tbh-display tbh-h1">Servizio non trovato</h1>
        <p className="text-[var(--tbh-muted)] mt-3">
          Questo servizio non è a listino. Nessuna scheda inventata.
        </p>
        <Link to="/tbh/servizi" className="tbh-neon-btn px-6 py-3 mt-6 inline-flex items-center gap-2">
          <ArrowLeft size={18} /> Torna ai servizi
        </Link>
      </div>
    );

  const codice = s.slug.toUpperCase();

  return (
    <div className="mx-auto max-w-[1500px] px-4 md:px-8 py-10">
      <Link to="/tbh/servizi" className="text-sm text-[var(--tbh-muted)] inline-flex items-center gap-2">
        <ArrowLeft size={16} /> Servizi del gruppo
      </Link>

      <div className="grid gap-8 lg:grid-cols-[1fr_1.2fr] mt-5">
        <div className="tbh-card p-5">
          <LogoBox name={s.title} logo={s.image} size="lg" />
          <p className="text-[11px] text-[var(--tbh-muted)] mt-3">
            Materiale grafico ufficiale del servizio da ricevere.
          </p>
        </div>

        <div className="tbh-card p-6 md:p-8">
          <span className="text-[11px] tracking-[0.2em] uppercase text-[var(--tbh-gold)]">
            Servizio · {s.category}
          </span>
          <h1 className="tbh-display tbh-h1 mt-2">{s.title}</h1>
          <p className="tbh-body text-[var(--tbh-muted)] mt-4">{s.blurb}</p>

          <div className="tbh-display text-4xl text-[var(--tbh-neon)] mt-6">{euro(s.priceCents)}</div>
          <div className="text-xs text-[var(--tbh-muted)] mt-1">
            Codice {codice}
            {s.installments && " · rateizzabile su richiesta"}
          </div>

          <div className="grid gap-4 sm:grid-cols-2 mt-7">
            <div className="rounded-2xl border border-[var(--tbh-line)] p-4">
              <h2 className="tbh-display text-lg">Come si richiede</h2>
              <p className="text-sm text-[var(--tbh-muted)] mt-2">
                Su WhatsApp al numero commerciale TBH, indicando il codice del servizio. L'assistenza
                segue la richiesta fino all'attivazione.
              </p>
            </div>
            <div className="rounded-2xl border border-[var(--tbh-line)] p-4">
              <h2 className="tbh-display text-lg">Chi lo eroga</h2>
              <p className="text-sm text-[var(--tbh-muted)] mt-2">
                Società o attività del gruppo Touch Business Holding. L'ente erogatore preciso viene
                indicato in fase di attivazione: non lo attribuiamo a caso.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 mt-7">
            <a
              href={waOrdine(s.title, codice, s.priceCents)}
              target="_blank"
              rel="noreferrer"
              className="tbh-neon-btn px-5 py-3 inline-flex items-center gap-2"
            >
              <MessageCircle size={18} /> Richiedi il servizio
            </a>
            <a
              href={waInfo(s.title)}
              target="_blank"
              rel="noreferrer"
              className="px-5 py-3 rounded-full border border-[var(--tbh-line)] font-semibold hover:border-[var(--tbh-neon)]"
            >
              Chiedi informazioni
            </a>
            <Link
              to="/tbh-assist"
              className="px-5 py-3 rounded-full border border-[var(--tbh-line)] font-semibold hover:border-[var(--tbh-neon)]"
            >
              Assistenza TBH Assist
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
