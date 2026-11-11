import { Link } from "wouter";
import {
  CreditCard,
  ExternalLink,
  MessageCircle,
  AlertCircle,
  CheckCircle2,
  Wallet,
} from "lucide-react";
import { usePagamenti } from "../queries/pagamenti";
import { LogoBox } from "../components/tiles";
import { wa, waInfo } from "../lib/whatsapp";

/**
 * Modalità di pagamento e finanziamento (area richiesta dalla proprietà).
 * Nessun dato inventato: dove il link ufficiale non è confermato, il metodo resta
 * elencato con la nota "link ufficiale da confermare" e la CTA passa da WhatsApp.
 */
export default function PagamentiPage() {
  const q = usePagamenti();
  const d = q.data;

  return (
    <div className="mx-auto max-w-[1500px] px-4 md:px-8 py-8">
      {/* ─── Intestazione ─── */}
      <header className="tbh-card p-6 md:p-10">
        <div className="flex items-center gap-2">
          <CreditCard size={18} className="text-[var(--tbh-neon)]" />
          <span className="text-[11px] tracking-[0.25em] uppercase text-[var(--tbh-gold)]">
            Touch Pay · Area pagamenti
          </span>
        </div>
        <h1 className="tbh-display tbh-h1 mt-3">Modalità di pagamento e finanziamento</h1>
        <p className="text-[var(--tbh-muted)] mt-4 max-w-4xl text-base md:text-lg">
          Qui trovi tutte le modalità con cui puoi pagare un prodotto, un servizio o un corso del
          gruppo: pagamento unico, wallet, bonifico, servizi postali e soluzioni di rateizzazione o
          finanziamento. Per ogni modalità è spiegato passo passo cosa devi fare.
        </p>

        <div className="grid gap-3 sm:grid-cols-3 mt-7">
          {[
            { l: "Modalità disponibili", v: d?.conteggi.totale ?? "—" },
            { l: "Soluzioni a rate", v: d?.conteggi.rateizzazione ?? "—" },
            { l: "In attesa di conferma", v: d?.conteggi.daConfermare ?? "—" },
          ].map((s) => (
            <div
              key={s.l}
              className="rounded-2xl border border-[var(--tbh-line)] p-4 text-center"
            >
              <div className="tbh-display text-3xl text-[var(--tbh-neon)]">{s.v}</div>
              <div className="text-[11px] uppercase tracking-wider text-[var(--tbh-muted)] mt-1">
                {s.l}
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-3 mt-7">
          <Link to="/shop" className="tbh-neon-btn px-5 py-3 inline-flex items-center gap-2">
            <Wallet size={18} /> Vai al Touch Plaza Shop
          </Link>
          <a
            href={waInfo()}
            target="_blank"
            rel="noreferrer"
            className="rounded-xl border border-[var(--tbh-line)] px-5 py-3 inline-flex items-center gap-2 hover:border-[var(--tbh-neon)] transition"
          >
            <MessageCircle size={18} /> Parla con un operatore
          </a>
        </div>
      </header>

      {/* ─── Come funziona l'acquisto ─── */}
      <section className="mt-10">
        <h2 className="tbh-display tbh-h2">Come si acquista, passo per passo</h2>
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4 mt-6">
          {(d?.flusso ?? []).map((f) => (
            <div key={f.titolo} className="tbh-card p-6">
              <h3 className="tbh-display text-xl text-[var(--tbh-neon)]">{f.titolo}</h3>
              <p className="text-sm text-[var(--tbh-muted)] mt-2">{f.testo}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Elenco per gruppo ─── */}
      {q.isLoading && (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3 mt-10">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="tbh-card h-64 animate-pulse" />
          ))}
        </div>
      )}

      {(d?.gruppi ?? []).map((g) => (
        <section key={g.tipo} className="mt-12">
          <h2 className="tbh-display tbh-h2">{g.tipo}</h2>
          <p className="text-[var(--tbh-muted)] mt-1 text-sm">
            {g.metodi.length} {g.metodi.length === 1 ? "modalità" : "modalità"} in questa categoria.
          </p>

          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3 mt-6">
            {g.metodi.map((m) => {
              const daConfermare = m.stato === "link-da-confermare";
              return (
                <article key={m.slug} className="tbh-card p-5 flex flex-col">
                  <LogoBox name={m.nome} logo={m.logo} url={m.sitoUfficiale} />

                  <h3 className="tbh-display text-2xl mt-4">{m.nome}</h3>
                  <span
                    className={`text-[11px] uppercase tracking-wider mt-1 inline-flex items-center gap-1 ${
                      daConfermare ? "text-[var(--tbh-gold)]" : "text-[var(--tbh-neon)]"
                    }`}
                  >
                    {daConfermare ? <AlertCircle size={12} /> : <CheckCircle2 size={12} />}
                    {d?.statoLabel[m.stato]}
                  </span>

                  <p className="text-sm text-[var(--tbh-muted)] mt-3">{m.descrizione}</p>

                  <div className="mt-4">
                    <span className="text-[11px] uppercase tracking-wider text-[var(--tbh-gold)]">
                      Come si fa
                    </span>
                    <ol className="mt-2 space-y-1.5">
                      {m.comeFunziona.map((passo, i) => (
                        <li key={i} className="text-sm flex gap-2">
                          <span className="tbh-display text-[var(--tbh-neon)] shrink-0">
                            {i + 1}.
                          </span>
                          <span>{passo}</span>
                        </li>
                      ))}
                    </ol>
                  </div>

                  {m.nota && (
                    <p className="text-xs text-[var(--tbh-muted)] mt-4 border-l-2 border-[var(--tbh-line)] pl-3">
                      {m.nota}
                    </p>
                  )}

                  <div className="flex flex-wrap gap-2 mt-5 pt-4 border-t border-[var(--tbh-line)]">
                    <a
                      href={wa(
                        `Buongiorno, vorrei pagare con ${m.nome}. Potete inviarmi le istruzioni?`,
                      )}
                      target="_blank"
                      rel="noreferrer"
                      className="tbh-neon-btn px-4 py-2 text-sm inline-flex items-center gap-2"
                    >
                      <MessageCircle size={15} /> Richiedi questa modalità
                    </a>
                    {m.sitoUfficiale && (
                      <a
                        href={m.sitoUfficiale}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-xl border border-[var(--tbh-line)] px-4 py-2 text-sm inline-flex items-center gap-2 hover:border-[var(--tbh-neon)] transition"
                      >
                        Sito ufficiale <ExternalLink size={14} />
                      </a>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      ))}

      {/* ─── Trasparenza ─── */}
      <section className="tbh-card p-6 md:p-8 mt-12">
        <h2 className="tbh-display tbh-h2">Trasparenza</h2>
        <p className="text-sm text-[var(--tbh-muted)] mt-3 max-w-4xl">{d?.nota}</p>
        <ul className="text-sm text-[var(--tbh-muted)] mt-4 space-y-2 max-w-4xl">
          <li>
            · I metodi segnalati come <strong>«link ufficiale da confermare»</strong> esistono e sono
            reali, ma il collegamento diretto del gruppo non è ancora attivo: fino a quel momento la
            richiesta passa da un operatore. Nessun link viene inventato.
          </li>
          <li>
            · IBAN, conti e riferimenti di incasso non vengono pubblicati online: li comunica
            l'operatore insieme alla fattura.
          </li>
          <li>
            · Il pagamento con carta sul sito si attiva quando la proprietà inserisce la chiave del
            servizio di incasso. Fino a quel momento il pulsante non simula nulla.
          </li>
        </ul>
        <div className="flex flex-wrap gap-3 mt-6">
          <Link
            to="/shop"
            className="rounded-xl border border-[var(--tbh-line)] px-5 py-3 inline-flex items-center gap-2 hover:border-[var(--tbh-neon)] transition"
          >
            Touch Plaza Shop
          </Link>
          <Link
            to="/tbh/livelli"
            className="rounded-xl border border-[var(--tbh-line)] px-5 py-3 inline-flex items-center gap-2 hover:border-[var(--tbh-neon)] transition"
          >
            25 Livelli TBH
          </Link>
        </div>
      </section>
    </div>
  );
}
