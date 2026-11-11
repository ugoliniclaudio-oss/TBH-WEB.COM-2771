/**
 * ANNUNCIO — «CERCHIAMO VIDEOMAKER · RIPRESE • MONTAGGIO • LAVORO SUL SET» (06/10/2026)
 *
 * Testo e locandina consegnati da Claudio, usati così come sono. Nessun dato aggiunto:
 * niente compenso, contratto, orario o scadenza — l'annuncio non li indica.
 * È un annuncio DIVERSO dalla «Ricerca videomaker sportivo / eventi 2026/2027» (04/10/2026).
 * Candidature: solo lavoro@tibihacca.com. WhatsApp di Claudio = contatto, non candidatura.
 */
import { Mail, MapPin, MessageCircle, Clapperboard, ExternalLink } from "lucide-react";
import { GalleriaSlide } from "./galleria-slide";
import { PROFILI_CLAUDIO, WHATSAPP_CLAUDIO } from "../lib/profili-claudio";

const EMAIL = "lavoro@tibihacca.com";
const OGGETTO = "CERCHIAMO VIDEOMAKER — candidatura";
const CORPO =
  "Nome e cognome:\nCittà:\nDisponibilità:\nPortfolio (link):\n\nBreve presentazione:\n\n\n(Allego il mio CV)";
const MAIL = `mailto:${EMAIL}?subject=${encodeURIComponent(OGGETTO)}&body=${encodeURIComponent(CORPO)}`;

const AMBITI = ["Motorsport", "Calcio", "Montaggio", "Videoclip musicali", "Cinema", "Format TV • Radiovisione"];
const CITTA = ["Rimini", "Calella (Spagna)", "Padova", "Sanremo"];

export function AnnuncioCerchiamoVideomaker() {
  return (
    <section
      id="cerchiamo-videomaker"
      className="tbh-card p-5 md:p-8 mb-12 border-2 border-[var(--tbh-neon)] scroll-mt-28 min-w-0"
    >
      <div className="flex flex-wrap items-center gap-2 mb-6">
        <span className="rounded-full bg-[var(--tbh-neon)] px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-black">
          Opportunità TBH
        </span>
        <span className="rounded-full border border-[var(--tbh-neon)]/50 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-[var(--tbh-neon)]">
          Candidature aperte
        </span>
        <span className="text-[11px] uppercase tracking-widest text-[var(--tbh-muted)]">Pubblicato il 06/10/2026</span>
      </div>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1fr)] items-start">
        <div className="min-w-0">
          <GalleriaSlide
            slide={[{ src: "/lavoro/cerchiamo-videomaker/locandina.jpg", titolo: "Cerchiamo videomaker — riprese, montaggio, lavoro sul set" }]}
            nome="Cerchiamo videomaker"
          />
        </div>
        <div className="min-w-0">
          <h2 className="tbh-display tbh-h1 leading-[0.95] [overflow-wrap:anywhere]">
            Cerchiamo <span className="text-[var(--tbh-neon)]">videomaker</span>
          </h2>
          <p className="tbh-display text-xl md:text-2xl mt-3">Riprese • Montaggio • Lavoro sul set</p>
          <p className="tbh-body mt-4">
            Cerchiamo videomaker per riprese di motorsport e calcio, videoclip musicali, set
            cinematografici, format TV e radiovisione.
          </p>
          <ul className="mt-4 flex flex-wrap gap-2">
            {AMBITI.map((a) => (
              <li key={a} className="rounded-full border border-[var(--tbh-line)] px-3 py-1.5 text-sm font-semibold">
                <Clapperboard size={13} className="inline mr-1.5 text-[var(--tbh-neon)]" />
                {a}
              </li>
            ))}
          </ul>
          <div className="mt-5 rounded-2xl border-2 border-[var(--tbh-neon)] bg-black/50 p-5">
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--tbh-neon)] flex items-center gap-2">
              <MapPin size={15} /> Sedi
            </p>
            <p className="tbh-body mt-2 font-semibold">{CITTA.join(" • ")}</p>
          </div>
          <p className="tbh-body mt-5">
            Invia <b>CV, portfolio, città e disponibilità</b> a{" "}
            <a href={MAIL} className="text-[var(--tbh-neon)] font-semibold underline-offset-4 hover:underline">
              {EMAIL}
            </a>
            .
          </p>
          <a href={MAIL} className="tbh-neon-btn mt-5 px-6 py-3 inline-flex items-center gap-2">
            <Mail size={18} /> Candidati via e-mail
          </a>

          <div className="mt-8 border-t border-[var(--tbh-line)] pt-5">
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--tbh-gold)]">
              Contatti e profili di Claudio Ugolini
            </p>
            <a
              href={WHATSAPP_CLAUDIO.url}
              target="_blank"
              rel="noreferrer"
              className="mt-3 inline-flex items-center gap-2 rounded-full border border-[var(--tbh-line)] px-4 py-2 text-sm font-semibold hover:border-[var(--tbh-neon)]"
            >
              <MessageCircle size={16} /> WhatsApp {WHATSAPP_CLAUDIO.numero} · contatto e informazioni
            </a>
            <p className="text-xs text-[var(--tbh-muted)] mt-2">
              Le candidature si inviano solo per e-mail a {EMAIL}.
            </p>
            <ul className="mt-4 grid gap-2 sm:grid-cols-2">
              {PROFILI_CLAUDIO.map((p) => (
                <li key={p.url} className="min-w-0">
                  <a
                    href={p.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 rounded-xl border border-[var(--tbh-line)] px-3 py-2 text-sm hover:border-[var(--tbh-neon)] min-w-0"
                  >
                    <span className="shrink-0 text-[10px] font-bold uppercase tracking-widest text-[var(--tbh-gold)] w-16">
                      {p.rete}
                    </span>
                    <span className="truncate">{p.nome}</span>
                    <ExternalLink size={13} className="ml-auto shrink-0 text-[var(--tbh-muted)]" />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
