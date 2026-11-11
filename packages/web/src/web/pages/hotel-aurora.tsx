import { useState } from "react";
import { Link } from "wouter";
import {
  Globe,
  Phone,
  Mail,
  Instagram,
  MapPin,
  MessageCircle,
  Facebook,
  Bus,
  Leaf,
  Wine,
  Users,
  Star,
  X,
} from "lucide-react";
import { HeroSezione } from "../components/hero-sezione";
import { SlotContenuti } from "../components/slot-contenuti";
import {
  AURORA_AGRIBUS,
  AURORA_CARD,
  AURORA_CITTA,
  AURORA_CLAIM,
  AURORA_DA_CONFERMARE,
  AURORA_EMAIL,
  AURORA_FACEBOOK_NOME,
  AURORA_FACEBOOK_URL,
  AURORA_INDIRIZZO,
  AURORA_INDIRIZZO_COMPLETO,
  AURORA_INSTAGRAM_HANDLE,
  AURORA_INSTAGRAM_URL,
  AURORA_MAPPA,
  AURORA_NOME,
  AURORA_PAYOFF,
  AURORA_PEC,
  AURORA_PILASTRI,
  AURORA_PIVA,
  AURORA_SITO,
  AURORA_SITO_LABEL,
  AURORA_STELLE,
  AURORA_TEL,
  AURORA_TEL_HREF,
  AURORA_TIPO,
  AURORA_WHATSAPP_URL,
} from "../lib/hotel-aurora";
import { wa } from "../lib/whatsapp";

const COLORE = "#33e0ff";

const ICONE_PILASTRI = [Leaf, Wine, Users, Bus];

function Chip({
  href,
  to,
  children,
  attivo = true,
}: {
  href?: string;
  to?: string;
  children: React.ReactNode;
  attivo?: boolean;
}) {
  const classi =
    "px-4 py-2 rounded-full border text-sm font-semibold inline-flex items-center gap-2 transition";
  if (!attivo) {
    return (
      <span
        className={`${classi} border-[var(--tbh-line)] text-[var(--tbh-muted)] cursor-default`}
      >
        {children}
      </span>
    );
  }
  if (href) {
    return (
      <a
        href={href}
        target={href.startsWith("http") ? "_blank" : undefined}
        rel="noreferrer"
        className={`${classi} border-[var(--tbh-line)] hover:border-[#33e0ff]`}
      >
        {children}
      </a>
    );
  }
  return (
    <Link to={to ?? "/in-allestimento"} className={`${classi} border-[var(--tbh-line)] hover:border-[#33e0ff]`}>
      {children}
    </Link>
  );
}

export default function HotelAuroraPage() {
  const [zoom, setZoom] = useState(false);

  const messaggioWa = wa(
    `Buongiorno, vorrei informazioni su ${AURORA_NOME} di ${AURORA_CITTA} e sull'AgriBus Experience.`,
  );

  return (
    <div>
      <HeroSezione
        occhiello="TBH Hospitality · Struttura del circuito"
        titolo={AURORA_NOME}
        evidenza={AURORA_TIPO.toUpperCase()}
        sottotitolo={`${AURORA_CITTA} · ${AURORA_INDIRIZZO}`}
        testo={`${AURORA_PAYOFF}. ${AURORA_CLAIM}.`}
        colore={COLORE}
        slotImmagine="hero:hotel-aurora"
        azioni={[
          { label: "Sito ufficiale", href: AURORA_SITO, primaria: true },
          { label: "Chiama", href: AURORA_TEL_HREF },
          { label: "Email", href: `mailto:${AURORA_EMAIL}` },
          { label: "Mappa", href: AURORA_MAPPA },
          { label: "Richiedi info a TBH", href: messaggioWa },
        ]}
      />

      <div className="mx-auto max-w-[1500px] px-4 md:px-8 py-10">
        {/* Barra contatti: ogni pulsante apre davvero qualcosa. */}
        <div className="flex flex-wrap gap-2">
          <Chip href={AURORA_SITO}>
            <Globe size={15} className="text-[#33e0ff]" /> {AURORA_SITO_LABEL}
          </Chip>
          <Chip href={AURORA_TEL_HREF}>
            <Phone size={15} className="text-[#33e0ff]" /> {AURORA_TEL}
          </Chip>
          <Chip href={AURORA_WHATSAPP_URL ?? undefined} attivo={Boolean(AURORA_WHATSAPP_URL)}>
            <MessageCircle size={15} /> WhatsApp — numero da confermare
          </Chip>
          <Chip href={`mailto:${AURORA_EMAIL}`}>
            <Mail size={15} className="text-[#33e0ff]" /> {AURORA_EMAIL}
          </Chip>
          <Chip href={AURORA_INSTAGRAM_URL}>
            <Instagram size={15} className="text-[#33e0ff]" /> {AURORA_INSTAGRAM_HANDLE}
          </Chip>
          <Chip href={AURORA_FACEBOOK_URL ?? undefined} attivo={Boolean(AURORA_FACEBOOK_URL)}>
            <Facebook size={15} /> {AURORA_FACEBOOK_NOME} — link da incollare
          </Chip>
          <Chip href={AURORA_MAPPA}>
            <MapPin size={15} className="text-[#33e0ff]" /> Mappa e indirizzo
          </Chip>
        </div>

        {/* Card ufficiale */}
        <section className="mt-10 grid gap-8 lg:grid-cols-[1.35fr_1fr] items-start">
          <div>
            <p className="text-[11px] uppercase tracking-[0.25em] text-[var(--tbh-gold)] mb-3">
              Materiale ufficiale della struttura
            </p>
            <button
              type="button"
              onClick={() => setZoom(true)}
              className="tbh-card block w-full overflow-hidden p-0 text-left hover:border-[#33e0ff] transition"
              aria-label="Apri a schermo intero la card AgriBus Experience"
            >
              <img
                src={AURORA_CARD.file}
                alt={AURORA_CARD.titolo}
                className="w-full h-auto block"
              />
            </button>
            <p className="text-sm text-[var(--tbh-muted)] mt-3">{AURORA_CARD.descrizione}</p>
          </div>

          <div className="tbh-card p-6">
            <h2 className="tbh-display tbh-h3 flex items-center gap-2">
              <Bus size={20} style={{ color: COLORE }} /> {AURORA_AGRIBUS.titolo}
            </h2>
            <p className="tbh-display text-sm tracking-wide text-[var(--tbh-platinum)] uppercase mt-1">
              {AURORA_AGRIBUS.sottotitolo}
            </p>
            <p className="tbh-body text-[var(--tbh-muted)] mt-3">{AURORA_AGRIBUS.testo}</p>
            <ul className="text-sm mt-4 space-y-2">
              <li>
                <span className="text-[var(--tbh-muted)]">Destinazione:</span>{" "}
                <strong>{AURORA_AGRIBUS.destinazione}</strong>
              </li>
              <li>
                <span className="text-[var(--tbh-muted)]">Capienza:</span>{" "}
                <strong>{AURORA_AGRIBUS.capienza}</strong>
              </li>
            </ul>
            <div className="flex flex-wrap gap-2 mt-4">
              {AURORA_AGRIBUS.valori.map((v) => (
                <span
                  key={v}
                  className="px-3 py-1 rounded-full border border-[var(--tbh-line)] text-xs font-semibold"
                >
                  {v}
                </span>
              ))}
            </div>
            <p className="text-sm text-[var(--tbh-muted)] mt-4 italic">
              {AURORA_AGRIBUS.frasi.join(" · ")}
            </p>
            <a
              href={messaggioWa}
              target="_blank"
              rel="noreferrer"
              className="tbh-neon-btn px-5 py-3 inline-flex items-center gap-2 text-sm mt-5"
              style={{ background: COLORE, borderColor: COLORE }}
            >
              <MessageCircle size={16} /> Chiedi disponibilità AgriBus
            </a>
          </div>
        </section>

        {/* I quattro pilastri della card */}
        <section className="mt-12">
          <h2 className="tbh-display tbh-h2">Cosa trovi</h2>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4 mt-5">
            {AURORA_PILASTRI.map((p, i) => {
              const Icona = ICONE_PILASTRI[i] ?? Leaf;
              return (
                <article key={p.titolo} className="tbh-card p-5">
                  <Icona size={22} style={{ color: COLORE }} />
                  <h3 className="tbh-display text-lg mt-3">{p.titolo}</h3>
                  <p className="text-sm text-[var(--tbh-muted)] mt-2">{p.testo}</p>
                </article>
              );
            })}
          </div>
        </section>

        {/* Recapiti reali */}
        <section className="mt-12 grid gap-6 lg:grid-cols-2">
          <div className="tbh-card p-6">
            <h2 className="tbh-display tbh-h3">Recapiti della struttura</h2>
            <dl className="text-sm mt-4 space-y-3">
              <div>
                <dt className="text-[var(--tbh-muted)]">Struttura</dt>
                <dd className="font-semibold flex items-center gap-2">
                  {AURORA_NOME} · {AURORA_TIPO}
                  <span className="inline-flex items-center gap-0.5" aria-label={`${AURORA_STELLE} stelle`}>
                    {Array.from({ length: AURORA_STELLE }).map((_, i) => (
                      <Star key={i} size={13} style={{ color: COLORE }} fill={COLORE} />
                    ))}
                  </span>
                </dd>
              </div>
              <div>
                <dt className="text-[var(--tbh-muted)]">Indirizzo</dt>
                <dd className="font-semibold">
                  <a href={AURORA_MAPPA} target="_blank" rel="noreferrer" className="hover:text-[#33e0ff]">
                    {AURORA_INDIRIZZO_COMPLETO}
                  </a>
                </dd>
              </div>
              <div>
                <dt className="text-[var(--tbh-muted)]">Telefono</dt>
                <dd className="font-semibold">
                  <a href={AURORA_TEL_HREF} className="hover:text-[#33e0ff]">
                    {AURORA_TEL}
                  </a>
                </dd>
              </div>
              <div>
                <dt className="text-[var(--tbh-muted)]">Email</dt>
                <dd className="font-semibold">
                  <a href={`mailto:${AURORA_EMAIL}`} className="hover:text-[#33e0ff]">
                    {AURORA_EMAIL}
                  </a>
                </dd>
              </div>
              <div>
                <dt className="text-[var(--tbh-muted)]">Posta PEC</dt>
                <dd className="font-semibold">
                  <a href={`mailto:${AURORA_PEC}`} className="hover:text-[#33e0ff]">
                    {AURORA_PEC}
                  </a>
                </dd>
              </div>
              <div>
                <dt className="text-[var(--tbh-muted)]">Partita IVA</dt>
                <dd className="font-semibold">{AURORA_PIVA}</dd>
              </div>
            </dl>
          </div>

          <div className="tbh-card p-6">
            <h2 className="tbh-display tbh-h3">In attesa dalla struttura</h2>
            <p className="text-sm text-[var(--tbh-muted)] mt-2">
              Quello che non è scritto sulla card ufficiale non viene pubblicato: appena arriva, la
              pagina si completa.
            </p>
            <ul className="text-sm mt-4 space-y-2">
              {AURORA_DA_CONFERMARE.map((v) => (
                <li key={v} className="flex gap-2">
                  <span style={{ color: COLORE }}>•</span>
                  <span className="text-[var(--tbh-muted)]">{v}</span>
                </li>
              ))}
            </ul>
            <Link
              to="/hospitality"
              className="px-5 py-3 rounded-full border border-[var(--tbh-line)] text-sm font-semibold inline-flex items-center gap-2 mt-5 hover:border-[#33e0ff]"
            >
              Torna a TBH Hospitality
            </Link>
          </div>
        </section>

        <div className="mt-12">
          <SlotContenuti
            slot="hotel-aurora:foto"
            modo="foto"
            titolo="Foto reali della struttura"
            descrizione="Spazio riservato alle immagini ufficiali dell'Hotel Aurora."
          />
        </div>
      </div>

      {zoom && (
        <div className="fixed inset-0 z-[999] bg-black/90 flex items-center justify-center p-4">
          <button
            type="button"
            onClick={() => setZoom(false)}
            aria-label="Chiudi l'immagine"
            className="absolute top-5 right-5 p-3 rounded-full border border-[var(--tbh-line)] bg-black/70"
          >
            <X size={20} />
          </button>
          <img
            src={AURORA_CARD.file}
            alt={AURORA_CARD.titolo}
            className="max-h-full max-w-full object-contain"
          />
        </div>
      )}
    </div>
  );
}
