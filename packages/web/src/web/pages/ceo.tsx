import {
  Building2,
  Clapperboard,
  Globe2,
  Headphones,
  Mail,
  MapPin,
  MessageCircle,
  Music4,
  PartyPopper,
  Phone,
  Radio,
  Sparkles,
  Target,
  Maximize2,
} from "lucide-react";
import { Link } from "wouter";
import { HeroSezione } from "../components/hero-sezione";
import { SlotContenuti } from "../components/slot-contenuti";
import { QrSito } from "../components/qr-sito";
import {
  CEO_BIGLIETTO,
  CEO_CARD_EMAIL,
  CEO_CARD_PAYOFF,
  CEO_CARD_RUOLI,
  CEO_CARD_SEDI,
  CEO_CARD_SITO,
  CEO_CARD_SOCIAL,
  CEO_CARD_TELEFONO,
  CEO_CARD_TELEFONO_HREF,
  CEO_CARD_WHATSAPP,
  CEO_CARD_WHATSAPP_HREF,
  CEO_EVENTI,
  CEO_EVENTI_CHIP,
  CEO_EVENTI_CLAIM,
  CEO_EVENTI_OCCHIELLO,
  CEO_EVENTI_TESTO,
  CEO_HOLDING,
  CEO_HOLDING_CHIP,
  CEO_HOLDING_OCCHIELLO,
  CEO_HOLDING_TESTO,
  CEO_HUGO,
  CEO_HUGO_CHIP,
  CEO_HUGO_OCCHIELLO,
  CEO_HUGO_RIGA,
  CEO_HUGO_TESTO,
  CEO_MEDIA,
  CEO_MEDIA_CHIP,
  CEO_MEDIA_OCCHIELLO,
  CEO_MEDIA_TESTO,
  CEO_OBIETTIVI,
  CEO_OBIETTIVI_CHIUSURA,
  CEO_OBIETTIVI_OCCHIELLO,
  CEO_OBIETTIVI_PAYOFF,
  CEO_OBIETTIVI_TESTO,
  CEO_SLIDE_PRESENTAZIONE,
  CEO_TERRITORI,
  CEO_TERRITORI_CHIP,
  CEO_TERRITORI_OCCHIELLO,
  CEO_TERRITORI_TESTO,
} from "../lib/ceo-slide";
import {
  CEO_ALTRE_SOCIETA,
  CEO_AMBITI,
  CEO_ARTISTA,
  CEO_CARICA,
  CEO_CHI_SONO,
  CEO_CHI_SONO_TESTO,
  CEO_CINEMA,
  CEO_CINEMA_AMBITI,
  CEO_CINEMA_RUOLI,
  CEO_CINEMA_TESTO,
  CEO_CLAIM,
  CEO_COLONNE,
  CEO_FIRMA,
  CEO_NOME,
  CEO_PERCORSO,
  CEO_PERCORSO_TESTO,
  CEO_PILASTRI,
  CEO_RUOLI,
  CEO_SERVIZI,
  CEO_SERVIZI_TESTO,
  CEO_SLIDE_AGGIORNATO,
  CEO_SLIDE_TOTALI,
  CEO_SOCIETA,
  CEO_SVILUPPO,
} from "../lib/ceo-slide";
import { LOGO_TBH_ORIZZONTALE } from "../lib/loghi-tbh";

const WA = "https://wa.me/393792088524";

const CHIP =
  "px-3 py-1.5 rounded-full border border-[var(--tbh-line)] text-xs md:text-sm font-semibold";

function Titolo({ occhiello, testo }: { occhiello: string; testo: string }) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-2 mb-6">
      <h2 className="tbh-display tbh-h2">{testo}</h2>
      <p className="text-[11px] md:text-xs tracking-[0.25em] uppercase text-[var(--tbh-gold)]">
        {occhiello}
      </p>
    </div>
  );
}

/** Griglia riusabile per i blocchi «titolo + voci + pulsante» delle slide 7-12. */
function GrigliaVoci({
  blocchi,
  icona,
}: {
  blocchi: { titolo: string; voci: string[]; to: string | null }[];
  icona?: React.ReactNode;
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
      {blocchi.map((b) => (
        <div key={b.titolo} className="tbh-card p-6 flex flex-col">
          {icona}
          <h3 className="tbh-display tbh-h3 uppercase">{b.titolo}</h3>
          <ul className="mt-3 space-y-1 grow">
            {b.voci.map((v) => (
              <li key={v} className="tbh-body text-sm text-[var(--tbh-muted)]">
                · {v}
              </li>
            ))}
          </ul>
          {b.to && (
            <Link to={b.to} className="tbh-neon-btn mt-4 text-center text-xs">
              SCOPRI DI PIÙ
            </Link>
          )}
        </div>
      ))}
    </div>
  );
}

export default function CeoPage() {
  return (
    <div>
      <HeroSezione
        occhiello="TBH · Editore · CEO · Artista · Imprenditore"
        titolo="CLAUDIO"
        evidenza="UGOLINI"
        sottotitolo={CEO_RUOLI}
        testo={`${CEO_CARICA}. ${CEO_ARTISTA}. Un percorso professionale che unisce business, media, eventi, cinema, comunicazione e creatività in un unico ecosistema di relazioni, progetti e opportunità.`}
        logo={LOGO_TBH_ORIZZONTALE}
        slotImmagine="hero:ceo"
        azioni={[
          { label: "Le società", to: "/tbh/societa", primaria: true },
          { label: "Cinema & produzioni", to: "/tbh/produzioni" },
          { label: "J.C. Hugò", to: "/musica/jc-hugo" },
          { label: "Contatti", to: "/contatti" },
        ]}
      />

      <div className="mx-auto max-w-[1500px] px-4 md:px-8 py-10">
        {/* ─────────  Le quattro colonne della slide 1  ───────── */}
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-16">
          {CEO_COLONNE.map((c) => (
            <div key={c.titolo} className="tbh-card p-6">
              <Sparkles size={20} className="text-[var(--tbh-neon)] mb-3" />
              <h3 className="tbh-display tbh-h3 uppercase">{c.titolo}</h3>
              <p className="tbh-body text-sm text-[var(--tbh-muted)] mt-2">{c.testo}</p>
            </div>
          ))}
        </section>

        {/* ─────────  LE 12 SLIDE UFFICIALI  ───────── */}
        <section className="mb-16">
          <Titolo occhiello="Presentazione ufficiale" testo="Le 12 slide della presentazione" />
          <p className="tbh-body text-[var(--tbh-muted)] max-w-3xl mb-6">
            Presentazione ufficiale di Claudio Ugolini: tutte e {CEO_SLIDE_TOTALI} le slide sono
            online, nella sequenza confermata il {CEO_SLIDE_AGGIORNATO}. Ogni slide si apre a
            schermo pieno. In fondo alla pagina c'è la tredicesima: il biglietto da visita digitale.
          </p>

          <div className="grid gap-6 lg:grid-cols-2">
            {CEO_SLIDE_PRESENTAZIONE.map((s) =>
              s.file ? (
                <a
                  key={s.n}
                  href={s.file}
                  target="_blank"
                  rel="noreferrer"
                  className="tbh-card group block overflow-hidden hover:border-[var(--tbh-gold)] transition"
                >
                  <img
                    src={s.file}
                    alt={`Slide ${s.n} di ${CEO_SLIDE_TOTALI} — ${s.titolo}`}
                    loading="lazy"
                    className="w-full h-auto block"
                  />
                  <div className="p-4 flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[11px] tracking-[0.25em] uppercase text-[var(--tbh-gold)]">
                        Slide {s.n} di {CEO_SLIDE_TOTALI}
                        {s.stampato && s.stampato !== `${s.n}/${CEO_SLIDE_TOTALI}` && (
                          <span className="text-[var(--tbh-muted)]">
                            {" "}
                            · sulla slide: {s.stampato}
                          </span>
                        )}
                      </p>
                      <h3 className="tbh-display tbh-h3 uppercase mt-1">{s.titolo}</h3>
                      {s.sottotitolo && (
                        <p className="tbh-body text-sm text-[var(--tbh-muted)]">{s.sottotitolo}</p>
                      )}
                    </div>
                    <span className="shrink-0 inline-flex items-center gap-2 text-xs font-semibold text-[var(--tbh-neon)] group-hover:underline">
                      <Maximize2 size={14} /> APRI
                    </span>
                  </div>
                </a>
              ) : null,
            )}
          </div>
        </section>

        {/* ─────────  CHI SONO  ───────── */}
        <section className="mb-16">
          <Titolo occhiello="Visione, esperienza, relazioni" testo="Chi sono" />
          <p className="tbh-body text-[var(--tbh-muted)] max-w-3xl mb-6">{CEO_CHI_SONO_TESTO}</p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {CEO_CHI_SONO.map((c) => (
              <div key={c.titolo} className="tbh-card p-6">
                <h3 className="tbh-display tbh-h3 uppercase text-[var(--tbh-neon)]">{c.titolo}</h3>
                <p className="tbh-body text-sm text-[var(--tbh-muted)] mt-2">{c.testo}</p>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap gap-2 mt-6">
            {CEO_AMBITI.map((a) => (
              <span key={a} className={CHIP}>
                {a}
              </span>
            ))}
          </div>
        </section>

        {/* ─────────  IL MIO PERCORSO  ───────── */}
        <section className="mb-16">
          <Titolo
            occhiello="Business · Media · Cinema · Eventi · Territorio"
            testo="Il mio percorso"
          />
          <p className="tbh-body text-[var(--tbh-muted)] max-w-3xl mb-6">{CEO_PERCORSO_TESTO}</p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {CEO_PERCORSO.map((g) => (
              <div key={g.titolo} className="tbh-card p-6">
                <h3 className="tbh-display tbh-h3 uppercase">{g.titolo}</h3>
                <ul className="mt-3 space-y-1.5">
                  {g.voci.map((v) => (
                    <li key={v} className="tbh-body text-sm text-[var(--tbh-muted)]">
                      · {v}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* ─────────  LE MIE SOCIETÀ  ───────── */}
        <section className="mb-16">
          <Titolo
            occhiello="Un ecosistema di impresa, creatività e territorio"
            testo="Le mie società"
          />
          <p className="tbh-body text-[var(--tbh-muted)] max-w-3xl mb-6">
            Società, progetti e partecipazioni in diversi settori, per creare valore, generare
            opportunità e connettere persone, territori e idee.
          </p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {CEO_SOCIETA.map((s) => (
              <div key={s.nome} className="tbh-card p-6 flex flex-col">
                <Building2 size={20} className="text-[var(--tbh-gold)] mb-3" />
                <h3 className="tbh-display tbh-h3 uppercase">{s.nome}</h3>
                <ul className="mt-3 space-y-1 grow">
                  {s.voci.map((v) => (
                    <li key={v} className="tbh-body text-sm text-[var(--tbh-muted)]">
                      · {v}
                    </li>
                  ))}
                </ul>
                {s.to ? (
                  <Link to={s.to} className="tbh-neon-btn mt-4 text-center text-xs">
                    SCOPRI DI PIÙ
                  </Link>
                ) : (
                  <Link
                    to="/tbh/societa"
                    className="mt-4 text-center text-xs font-semibold text-[var(--tbh-muted)] border border-[var(--tbh-line)] rounded-full py-2"
                  >
                    ANAGRAFICA DEL GRUPPO
                  </Link>
                )}
              </div>
            ))}
          </div>

          <p className="text-[11px] tracking-[0.25em] uppercase text-[var(--tbh-gold)] mt-8 mb-3">
            Alcune altre esperienze societarie
          </p>
          <div className="flex flex-wrap gap-2">
            {CEO_ALTRE_SOCIETA.map((a) => (
              <span key={a} className={CHIP}>
                {a}
              </span>
            ))}
            <Link to="/tbh/societa" className={`${CHIP} text-[var(--tbh-neon)]`}>
              e altre… →
            </Link>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5 mt-8">
            {CEO_SVILUPPO.map((s) => (
              <div
                key={s}
                className="border border-[var(--tbh-line)] rounded-xl p-4 text-sm font-semibold"
              >
                {s}
              </div>
            ))}
          </div>
        </section>

        {/* ─────────  CINEMA & PRODUZIONE  ───────── */}
        <section className="mb-16">
          <Titolo occhiello="Dalla location al set" testo="Cinema & Produzione" />
          <p className="text-sm font-semibold text-[var(--tbh-gold)] mb-3">{CEO_CINEMA_RUOLI}</p>
          <p className="tbh-body text-[var(--tbh-muted)] max-w-3xl mb-6">{CEO_CINEMA_TESTO}</p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {CEO_CINEMA.map((c) => (
              <div key={c.titolo} className="tbh-card p-6">
                <Clapperboard size={20} className="text-[var(--tbh-neon)] mb-3" />
                <h3 className="tbh-display tbh-h3 uppercase">{c.titolo}</h3>
                <p className="tbh-body text-sm text-[var(--tbh-muted)] mt-2">{c.testo}</p>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap gap-2 mt-6">
            {CEO_CINEMA_AMBITI.map((a) => (
              <span key={a} className={CHIP}>
                {a}
              </span>
            ))}
          </div>
          <Link to="/tbh/produzioni" className="tbh-neon-btn inline-block mt-6">
            APRI LE PRODUZIONI
          </Link>
        </section>

        {/* ─────────  I NOSTRI SERVIZI  ───────── */}
        <section className="mb-16">
          <Titolo occhiello="Soluzioni su misura" testo="I nostri servizi" />
          <p className="tbh-body text-[var(--tbh-muted)] max-w-3xl mb-6">{CEO_SERVIZI_TESTO}</p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {CEO_SERVIZI.map((s) => (
              <div key={s.titolo} className="tbh-card p-6 flex flex-col">
                <h3 className="tbh-display tbh-h3 uppercase text-[var(--tbh-neon)]">{s.titolo}</h3>
                <ul className="mt-3 space-y-1 grow">
                  {s.voci.map((v) => (
                    <li key={v} className="tbh-body text-sm text-[var(--tbh-muted)]">
                      · {v}
                    </li>
                  ))}
                </ul>
                {s.to && (
                  <Link to={s.to} className="tbh-neon-btn mt-4 text-center text-xs">
                    SCOPRI DI PIÙ
                  </Link>
                )}
              </div>
            ))}
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 mt-8">
            {CEO_PILASTRI.map((p) => (
              <div
                key={p}
                className="border border-[var(--tbh-line)] rounded-xl p-4 text-sm font-semibold"
              >
                {p}
              </div>
            ))}
          </div>
        </section>

        {/* ─────────  MEDIA & COMUNICAZIONE (slide 7)  ───────── */}
        <section className="mb-16">
          <Titolo occhiello={CEO_MEDIA_OCCHIELLO} testo="Media & Comunicazione" />
          <p className="tbh-body text-[var(--tbh-muted)] max-w-3xl mb-6">{CEO_MEDIA_TESTO}</p>
          <GrigliaVoci blocchi={CEO_MEDIA} icona={<Radio size={20} className="text-[var(--tbh-neon)] mb-3" />} />
          <div className="flex flex-wrap gap-2 mt-6">
            {CEO_MEDIA_CHIP.map((c) => (
              <span key={c} className={CHIP}>
                {c}
              </span>
            ))}
          </div>
        </section>

        {/* ─────────  EVENTI & ENTERTAINMENT (slide 8)  ───────── */}
        <section className="mb-16">
          <Titolo occhiello={CEO_EVENTI_OCCHIELLO} testo="Eventi & Entertainment" />
          <p className="tbh-body text-[var(--tbh-muted)] max-w-3xl mb-2">{CEO_EVENTI_TESTO}</p>
          <p className="text-sm font-semibold text-[var(--tbh-gold)] uppercase mb-6">
            {CEO_EVENTI_CLAIM}
          </p>
          <GrigliaVoci
            blocchi={CEO_EVENTI}
            icona={<PartyPopper size={20} className="text-[var(--tbh-neon)] mb-3" />}
          />
          <div className="flex flex-wrap gap-2 mt-6">
            {CEO_EVENTI_CHIP.map((c) => (
              <span key={c} className={CHIP}>
                {c}
              </span>
            ))}
          </div>
        </section>

        {/* ─────────  TOUCH BUSINESS HOLDING (slide 9)  ───────── */}
        <section className="mb-16">
          <Titolo occhiello={CEO_HOLDING_OCCHIELLO} testo="Touch Business Holding" />
          <p className="tbh-body text-[var(--tbh-muted)] max-w-3xl mb-6">{CEO_HOLDING_TESTO}</p>
          <GrigliaVoci
            blocchi={CEO_HOLDING}
            icona={<Building2 size={20} className="text-[var(--tbh-gold)] mb-3" />}
          />
          <div className="flex flex-wrap gap-2 mt-6">
            {CEO_HOLDING_CHIP.map((c) => (
              <span key={c} className={CHIP}>
                {c}
              </span>
            ))}
          </div>
        </section>

        {/* ─────────  TERRITORI & NETWORK (slide 10)  ───────── */}
        <section className="mb-16">
          <Titolo occhiello={CEO_TERRITORI_OCCHIELLO} testo="Territori & Network" />
          <p className="tbh-body text-[var(--tbh-muted)] max-w-3xl mb-6">{CEO_TERRITORI_TESTO}</p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            {CEO_TERRITORI.map((t) => (
              <div key={t.citta} className="tbh-card p-6 flex flex-col">
                <Globe2 size={20} className="text-[var(--tbh-neon)] mb-3" />
                <h3 className="tbh-display tbh-h3 uppercase">{t.citta}</h3>
                <ul className="mt-3 space-y-1 grow">
                  {t.voci.map((v) => (
                    <li key={v} className="tbh-body text-sm text-[var(--tbh-muted)]">
                      · {v}
                    </li>
                  ))}
                </ul>
                {t.to ? (
                  <Link to={t.to} className="tbh-neon-btn mt-4 text-center text-xs">
                    APRI
                  </Link>
                ) : (
                  <Link
                    to="/territorio/mappa"
                    className="mt-4 text-center text-xs font-semibold text-[var(--tbh-muted)] border border-[var(--tbh-line)] rounded-full py-2"
                  >
                    SULLA MAPPA
                  </Link>
                )}
              </div>
            ))}
          </div>
          <div className="flex flex-wrap gap-2 mt-6">
            {CEO_TERRITORI_CHIP.map((c) => (
              <span key={c} className={CHIP}>
                {c}
              </span>
            ))}
          </div>
        </section>

        {/* ─────────  J.C. HUGÒ & EDITORIA (slide 11)  ───────── */}
        <section className="mb-16">
          <Titolo occhiello={CEO_HUGO_OCCHIELLO} testo="J.C. Hugò & Editoria" />
          <p className="text-sm font-semibold text-[var(--tbh-gold)] mb-3">{CEO_HUGO_RIGA}</p>
          <p className="tbh-body text-[var(--tbh-muted)] max-w-3xl mb-6">{CEO_HUGO_TESTO}</p>
          <GrigliaVoci
            blocchi={CEO_HUGO}
            icona={<Music4 size={20} className="text-[var(--tbh-neon)] mb-3" />}
          />
          <div className="flex flex-wrap gap-2 mt-6">
            {CEO_HUGO_CHIP.map((c) => (
              <span key={c} className={CHIP}>
                {c}
              </span>
            ))}
          </div>
        </section>

        {/* ─────────  OBIETTIVI & CONTATTI (slide 12)  ───────── */}
        <section className="mb-16">
          <Titolo occhiello={CEO_OBIETTIVI_OCCHIELLO} testo="Obiettivi & Contatti" />
          <p className="tbh-body text-[var(--tbh-muted)] max-w-3xl mb-6">{CEO_OBIETTIVI_TESTO}</p>
          <GrigliaVoci
            blocchi={CEO_OBIETTIVI}
            icona={<Target size={20} className="text-[var(--tbh-gold)] mb-3" />}
          />
          <p className="tbh-display tbh-h3 mt-8">{CEO_OBIETTIVI_CHIUSURA}</p>
          <p className="text-[11px] tracking-[0.25em] uppercase text-[var(--tbh-gold)] mt-2">
            {CEO_OBIETTIVI_PAYOFF}
          </p>
        </section>

        {/* ─────────  CONTATTI DIRETTI  ───────── */}
        <section className="mb-16">
          <Titolo occhiello="Direzione TBH" testo="Parliamone" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <a
              href={WA}
              target="_blank"
              rel="noreferrer"
              className="tbh-card p-6 hover:border-[var(--tbh-neon)]"
            >
              <MessageCircle size={20} className="text-[var(--tbh-neon)] mb-3" />
              <span className="block text-xs uppercase tracking-[0.2em] text-[var(--tbh-muted)]">
                WhatsApp · Telegram
              </span>
              <span className="block tbh-display text-lg">+39 379 208 8524</span>
            </a>
            <a href="tel:+393271237328" className="tbh-card p-6 hover:border-[var(--tbh-neon)]">
              <Phone size={20} className="text-[var(--tbh-neon)] mb-3" />
              <span className="block text-xs uppercase tracking-[0.2em] text-[var(--tbh-muted)]">
                Italia
              </span>
              <span className="block tbh-display text-lg">+39 327 123 7328</span>
            </a>
            <a
              href="mailto:supporto@touch-business.com"
              className="tbh-card p-6 hover:border-[var(--tbh-neon)]"
            >
              <Mail size={20} className="text-[var(--tbh-neon)] mb-3" />
              <span className="block text-xs uppercase tracking-[0.2em] text-[var(--tbh-muted)]">
                Email
              </span>
              <span className="block tbh-display text-base break-all">
                supporto@touch-business.com
              </span>
            </a>
            <Link to="/contatti" className="tbh-card p-6 hover:border-[var(--tbh-neon)]">
              <MapPin size={20} className="text-[var(--tbh-neon)] mb-3" />
              <span className="block text-xs uppercase tracking-[0.2em] text-[var(--tbh-muted)]">
                Tutti i contatti
              </span>
              <span className="block tbh-display text-lg">Sedi e recapiti</span>
            </Link>
          </div>

          <div className="flex flex-wrap gap-3 mt-6">
            <Link to="/musica/jc-hugo" className="tbh-neon-btn inline-flex items-center gap-2">
              <Headphones size={16} /> J.C. HUGÒ — L'ARTISTA
            </Link>
            <Link
              to="/contatti-social"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-[var(--tbh-line)] text-sm font-semibold"
            >
              CONTATTI SOCIAL DEL GRUPPO
            </Link>
          </div>
        </section>

        {/* ─────────  SLIDE 13 · BIGLIETTO DA VISITA DIGITALE  ───────── */}
        <section className="mb-16">
          <Titolo occhiello="Slide 13 · Fronte e retro" testo="Biglietto da visita digitale" />
          <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
            {CEO_BIGLIETTO?.file && (
              <a
                href={CEO_BIGLIETTO.file}
                target="_blank"
                rel="noreferrer"
                className="tbh-card group block overflow-hidden hover:border-[var(--tbh-gold)] transition"
              >
                <img
                  src={CEO_BIGLIETTO.file}
                  alt="Biglietto da visita digitale di Claudio Ugolini, fronte e retro"
                  loading="lazy"
                  className="w-full h-auto block"
                />
                <div className="p-4 flex items-center justify-between gap-3">
                  <span className="text-[11px] tracking-[0.25em] uppercase text-[var(--tbh-gold)]">
                    Biglietto ufficiale · fronte e retro
                  </span>
                  <span className="shrink-0 inline-flex items-center gap-2 text-xs font-semibold text-[var(--tbh-neon)] group-hover:underline">
                    <Maximize2 size={14} /> APRI
                  </span>
                </div>
              </a>
            )}

            <div className="grid gap-4">
              <QrSito
                percorso="/ceo"
                etichetta="Il QR punta da solo all'indirizzo del sito: in anteprima all'anteprima, una volta pubblicato al dominio definitivo."
              />
              <div className="tbh-card p-6">
                <h3 className="tbh-display tbh-h3 uppercase mb-3">I recapiti stampati</h3>
                <div className="grid gap-2">
                  <a
                    href={CEO_CARD_TELEFONO_HREF}
                    className="flex items-center gap-3 text-sm font-semibold hover:text-[var(--tbh-neon)]"
                  >
                    <Phone size={16} className="text-[var(--tbh-neon)]" /> {CEO_CARD_TELEFONO}
                  </a>
                  <a
                    href={CEO_CARD_WHATSAPP_HREF}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-3 text-sm font-semibold hover:text-[var(--tbh-neon)]"
                  >
                    <MessageCircle size={16} className="text-[var(--tbh-neon)]" />{" "}
                    {CEO_CARD_WHATSAPP} · WhatsApp Business
                  </a>
                  <a
                    href={`mailto:${CEO_CARD_EMAIL}`}
                    className="flex items-center gap-3 text-sm font-semibold break-all hover:text-[var(--tbh-neon)]"
                  >
                    <Mail size={16} className="text-[var(--tbh-neon)]" /> {CEO_CARD_EMAIL}
                  </a>
                  <Link
                    to="/"
                    className="flex items-center gap-3 text-sm font-semibold hover:text-[var(--tbh-neon)]"
                  >
                    <Globe2 size={16} className="text-[var(--tbh-neon)]" /> {CEO_CARD_SITO}
                  </Link>
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-3 mt-6">
            <div className="tbh-card p-6">
              <p className="text-[11px] tracking-[0.25em] uppercase text-[var(--tbh-gold)] mb-3">
                Ruoli
              </p>
              <div className="flex flex-wrap gap-2">
                {CEO_CARD_RUOLI.map((r) => (
                  <span key={r} className={CHIP}>
                    {r}
                  </span>
                ))}
              </div>
            </div>
            <div className="tbh-card p-6">
              <p className="text-[11px] tracking-[0.25em] uppercase text-[var(--tbh-gold)] mb-3">
                Sedi e presenze
              </p>
              <div className="flex flex-wrap gap-2">
                {CEO_CARD_SEDI.map((s) => (
                  <Link key={s} to="/territorio/mappa" className={CHIP}>
                    {s}
                  </Link>
                ))}
              </div>
            </div>
            <div className="tbh-card p-6">
              <p className="text-[11px] tracking-[0.25em] uppercase text-[var(--tbh-gold)] mb-3">
                Seguimi su
              </p>
              <div className="flex flex-wrap gap-2">
                {CEO_CARD_SOCIAL.map((s) =>
                  s.url ? (
                    <a
                      key={s.nome}
                      href={s.url}
                      target="_blank"
                      rel="noreferrer"
                      className={`${CHIP} text-[var(--tbh-neon)]`}
                    >
                      {s.nome} →
                    </a>
                  ) : (
                    <span key={s.nome} className={`${CHIP} text-[var(--tbh-muted)]`}>
                      {s.nome} · link da incollare
                    </span>
                  ),
                )}
              </div>
              <Link
                to="/contatti-social"
                className="inline-block mt-4 text-xs font-semibold text-[var(--tbh-neon)]"
              >
                TUTTI I SOCIAL DEL GRUPPO →
              </Link>
            </div>
          </div>

          <p className="text-center text-[11px] tracking-[0.25em] uppercase text-[var(--tbh-gold)] mt-6">
            {CEO_CARD_PAYOFF}
          </p>
        </section>

        {/* Materiali successivi: Claudio li carica dal pannello e compaiono da soli. */}
        <SlotContenuti
          slot="ceo:slide"
          modo="foto"
          titolo="Altri materiali della presentazione"
          descrizione="Spazio libero per le slide e i materiali che arriveranno dopo le 13 ufficiali."
          colonne={2}
        />

        <p className="text-center text-xs tracking-[0.25em] uppercase text-[var(--tbh-muted)] mt-16">
          {CEO_NOME} · {CEO_CLAIM} · {CEO_FIRMA}
        </p>
      </div>
    </div>
  );
}
