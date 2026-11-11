import { Component, type ReactNode } from "react";
import { Link } from "wouter";
import { MessageCircle, RotateCcw, Home } from "lucide-react";
import { waInfo } from "../lib/whatsapp";

/**
 * Rete di sicurezza contro lo schermo nero.
 * Se una pagina va in errore, l'utente vede un messaggio leggibile in italiano
 * con i link per tornare alla Home o scrivere su WhatsApp: mai una pagina nera.
 */
export class ErrorBoundary extends Component<
  { children: ReactNode },
  { errore: Error | null }
> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { errore: null };
  }

  static getDerivedStateFromError(errore: Error) {
    return { errore };
  }

  componentDidCatch(errore: Error) {
    console.error("[TBH] errore di pagina:", errore);
  }

  render() {
    if (!this.state.errore) return this.props.children;

    return (
      <div className="mx-auto max-w-[900px] px-4 md:px-8 py-16">
        <div className="tbh-card p-8">
          <span className="text-[11px] uppercase tracking-[0.25em] text-[var(--tbh-gold)]">
            Touch Business Holding
          </span>
          <h1 className="tbh-display tbh-h1 mt-3">Stiamo sistemando questa sezione</h1>
          <p className="text-[var(--tbh-muted)] mt-4 text-base md:text-lg">
            Il resto del sito funziona normalmente: usa i pulsanti qui sotto per continuare a
            navigare. Se ti serve una risposta subito, scrivici su WhatsApp e ti seguiamo noi.
          </p>

          <div className="flex flex-wrap gap-3 mt-7">
            <Link to="/" className="tbh-neon-btn px-5 py-3 inline-flex items-center gap-2">
              <Home size={18} /> Torna alla Home
            </Link>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="rounded-xl border border-[var(--tbh-line)] px-5 py-3 inline-flex items-center gap-2 hover:border-[var(--tbh-neon)] transition"
            >
              <RotateCcw size={18} /> Ricarica la pagina
            </button>
            <a
              href={waInfo()}
              target="_blank"
              rel="noreferrer"
              className="rounded-xl border border-[var(--tbh-line)] px-5 py-3 inline-flex items-center gap-2 hover:border-[var(--tbh-neon)] transition"
            >
              <MessageCircle size={18} /> Scrivici su WhatsApp
            </a>
          </div>

          <p className="text-xs text-[var(--tbh-muted)] mt-7 break-words">
            Dettaglio tecnico (utile per la segnalazione): {this.state.errore.message}
          </p>
        </div>
      </div>
    );
  }
}
