import { Link } from "wouter";
import { MessageCircle, Phone, Mail, Globe, MapPin, Users } from "lucide-react";
import { LOGO_TBH_ICONA } from "../lib/loghi-tbh";
import { MiTroviQui } from "../components/mi-trovi-qui";
import { SocialCollegati } from "../components/touch-social";
import { DOMINIO_SITO, URL_SITO } from "../lib/identita-tbh";

/**
 * CONTATTI — mondo n.10 del menu voluto da Claudio (29/08/2026).
 * SOLO contatti reali e confermati: WhatsApp, telefono Italia, telefono estero, email,
 * portale. Nessun indirizzo, P.IVA o social inventato: dove il dato non è confermato
 * si scrive «da confermare».
 */
const WA = "https://wa.me/393792088524";

export default function ContattiPage() {
  return (
    <div className="mx-auto max-w-[1100px] px-4 md:px-8 py-14">
      <div className="flex items-center gap-4">
        <img
          src={LOGO_TBH_ICONA}
          alt="Touch Business Holding"
          width={88}
          height={88}
          className="w-20 h-20 md:w-24 md:h-24 rounded-2xl object-contain shrink-0"
        />
        <div>
          <h1 className="tbh-display tbh-h1">Contatti</h1>
          <p className="text-[var(--tbh-gold)] text-xs md:text-sm tracking-[0.2em] uppercase">
            Touch Business Holding
          </p>
        </div>
      </div>

      <p className="tbh-body text-[var(--tbh-muted)] mt-5 max-w-2xl">
        Ti risponde una persona, non un bot. Il canale più rapido è WhatsApp.
      </p>

      {/* Editore · CEO · Artista · Imprenditore — richiesta Claudio 05/09/2026 */}
      <Link
        to="/ceo"
        className="tbh-card mt-8 p-5 md:p-7 flex flex-col sm:flex-row items-center gap-5 hover:border-[var(--tbh-neon)]"
      >
        <img
          src="/ceo/01-claudio-ugolini.jpg"
          alt="Claudio Ugolini — Editore, CEO, Artista, Imprenditore"
          width={220}
          height={124}
          loading="lazy"
          className="w-full sm:w-[220px] rounded-xl object-cover border border-[var(--tbh-line)]"
        />
        <span className="flex-1">
          <span className="block text-[11px] uppercase tracking-widest text-[var(--tbh-gold)]">
            Editore · CEO · Artista · Imprenditore
          </span>
          <span className="block tbh-display tbh-h3 mt-1">Claudio Ugolini</span>
          <span className="block tbh-body text-[var(--tbh-muted)] mt-2">
            Chi c'è dietro Touch Business Holding: il percorso, le società, il cinema e i
            servizi, raccontati nelle slide ufficiali della presentazione.
          </span>
          <span className="tbh-neon-btn inline-flex items-center gap-2 mt-4">
            <Users size={16} /> APRI LA PAGINA
          </span>
        </span>
      </Link>

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        <a href={WA} target="_blank" rel="noreferrer" className="tbh-card p-6 flex items-center gap-4 hover:border-[var(--tbh-neon)]">
          <MessageCircle size={26} className="text-[var(--tbh-neon)] shrink-0" />
          <span>
            <span className="block text-[11px] uppercase tracking-widest text-[var(--tbh-muted)]">WhatsApp</span>
            <span className="block tbh-display text-xl">+39 379 208 8524</span>
          </span>
        </a>
        <a href="tel:+393271237328" className="tbh-card p-6 flex items-center gap-4 hover:border-[var(--tbh-neon)]">
          <Phone size={26} className="text-[var(--tbh-neon)] shrink-0" />
          <span>
            <span className="block text-[11px] uppercase tracking-widest text-[var(--tbh-muted)]">Telefono Italia</span>
            <span className="block tbh-display text-xl">+39 327 123 7328</span>
          </span>
        </a>
        <a href="tel:+4915222123816" className="tbh-card p-6 flex items-center gap-4 hover:border-[var(--tbh-neon)]">
          <Phone size={26} className="text-[var(--tbh-neon)] shrink-0" />
          <span>
            <span className="block text-[11px] uppercase tracking-widest text-[var(--tbh-muted)]">Telefono estero</span>
            <span className="block tbh-display text-xl">+49 152 2212 3816</span>
          </span>
        </a>
        <a
          href="mailto:supporto@touch-business.com"
          className="tbh-card p-6 flex items-center gap-4 hover:border-[var(--tbh-neon)]"
        >
          <Mail size={26} className="text-[var(--tbh-neon)] shrink-0" />
          <span>
            <span className="block text-[11px] uppercase tracking-widest text-[var(--tbh-muted)]">Email</span>
            <span className="block tbh-display text-lg break-all">supporto@touch-business.com</span>
          </span>
        </a>
        <a
          href={URL_SITO}
          target="_blank"
          rel="noreferrer"
          className="tbh-card p-6 flex items-center gap-4 hover:border-[var(--tbh-neon)] md:col-span-2"
        >
          <Globe size={26} className="text-[var(--tbh-neon)] shrink-0" />
          <span>
            <span className="block text-[11px] uppercase tracking-widest text-[var(--tbh-muted)]">Portale</span>
            <span className="block tbh-display text-xl">{DOMINIO_SITO}</span>
          </span>
        </a>
      </div>

      <div className="tbh-card p-6 mt-6">
        <h2 className="tbh-display text-xl flex items-center gap-2">
          <MapPin size={20} className="text-[var(--tbh-neon)]" /> Dove siamo
        </h2>
        <p className="text-sm text-[var(--tbh-muted)] mt-2">
          Riviera di Rimini · Italia ed Europa. L'indirizzo della sede legale viene pubblicato solo
          quando confermato da Touch Business Holding: non inventiamo nulla.
        </p>
        <MiTroviQui nome="Rimini" citta="Rimini, Italia" className="mt-4" />
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <a
          href={`${WA}?text=${encodeURIComponent("Buongiorno, vi scrivo dal portale TBH-WEB.")}`}
          target="_blank"
          rel="noreferrer"
          className="tbh-neon-btn px-6 py-3 inline-flex items-center gap-2"
        >
          <MessageCircle size={18} /> Scrivi ora su WhatsApp
        </a>
        <Link
          to="/contatti-social"
          className="px-6 py-3 rounded-xl font-semibold border border-[var(--tbh-line)] hover:border-[var(--tbh-neon)] inline-flex items-center gap-2"
        >
          <Users size={18} /> TOUCH SOCIAL · seguici ovunque
        </Link>
      </div>
      <div className="mt-8">
        <SocialCollegati pagina="/contatti" titolo="TOUCH SOCIAL · seguici ovunque" />
      </div>
    </div>
  );
}
