import { MessageCircle, CreditCard, ArrowRight, AlertCircle } from "lucide-react";
import { Link } from "wouter";
import { wa } from "../lib/whatsapp";
import { usePagamenti } from "../queries/pagamenti";

/** Ordini 14-16 — dopo la richiesta d'ordine si mostra SOLO "Scegli modalità di pagamento".
 *  Nessun bottone vuoto: dove il link diretto non è ancora attivo, si passa da WhatsApp.
 *  Fonte unica: pagamenti.lista (la stessa della pagina /pagamenti). */
export function PagamentiBlock({ stripeAttivo = false }: { stripeAttivo?: boolean }) {
  const q = usePagamenti();
  const metodi = q.data?.metodi ?? [];
  const acceso = stripeAttivo || Boolean(q.data?.stripeAttivo);

  return (
    <section className="tbh-card p-6 md:p-8 mt-12">
      <div className="flex items-center gap-2 mb-2">
        <CreditCard size={18} className="text-[var(--tbh-neon)]" />
        <span className="text-xs tracking-[0.2em] uppercase text-[var(--tbh-gold)]">Touch Pay</span>
      </div>
      <h2 className="tbh-display tbh-h2">Scegli modalità di pagamento</h2>
      <p className="text-sm text-[var(--tbh-muted)] mt-2 max-w-3xl">
        Queste sono le modalità previste dal gruppo: pagamento unico, wallet, bonifico, servizi
        postali e soluzioni a rate. Dove il link diretto non è ancora attivo, la richiesta si chiude
        su WhatsApp con un nostro operatore.
      </p>

      <Link
        to="/pagamenti"
        className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--tbh-neon)] mt-4"
      >
        Vedi tutte le modalità, con le istruzioni <ArrowRight size={15} />
      </Link>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 mt-6">
        {q.isLoading &&
          Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="tbh-card h-32 animate-pulse" />
          ))}

        {metodi.map((m) => {
          const attivo = m.slug === "stripe" ? acceso : m.stato === "attivo-su-richiesta";
          return (
            <a
              key={m.slug}
              href={wa(`Buongiorno, vorrei pagare con ${m.nome}. Attendo istruzioni.`)}
              target="_blank"
              rel="noreferrer"
              className="tbh-card p-4 hover:border-[var(--tbh-neon)] transition flex flex-col gap-1"
            >
              <span className="tbh-display text-xl">{m.nome}</span>
              <span className="text-[11px] text-[var(--tbh-gold)] uppercase tracking-wide">
                {m.tipo}
              </span>
              <span
                className={`mt-2 text-sm font-semibold inline-flex items-center gap-2 ${
                  attivo ? "text-[var(--tbh-neon)]" : "text-[var(--tbh-muted)]"
                }`}
              >
                {attivo ? (
                  <>
                    <MessageCircle size={14} /> Richiedi su WhatsApp
                  </>
                ) : (
                  <>
                    <AlertCircle size={14} /> Link da confermare
                  </>
                )}
              </span>
            </a>
          );
        })}
      </div>
    </section>
  );
}
