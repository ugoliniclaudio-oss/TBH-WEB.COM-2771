/**
 * RICERCA IN EVIDENZA — «RICERCA VIDEOMAKER SPORTIVO / EVENTI · STAGIONE 2026/2027» (04/10/2026)
 *
 * Testo e 7 locandine dal pacchetto consegnato da Claudio (ricerca-videomaker-tbh.zip),
 * usati così come sono. L'ingaggio NON ha un importo nel testo: non lo inventiamo.
 *
 * Contatti del testo: lavoro@tibihacca.com (unica e-mail per questa ricerca),
 * tel. 327 123 7328 (solo informazioni). Dal 06/10/2026 niente WhatsApp per candidarsi.
 * Montato in bacheca lavoro (/lavoro-casting/bacheca#ricerca-videomaker-2026-2027).
 */
import { useEffect, useRef, useState, type ReactNode } from "react";
import { Link } from "wouter";
import { GalleriaSlide, type Slide } from "./galleria-slide";
import {
  Megaphone,
  Mail,
  Phone,
  MapPin,
  Camera,
  Plane,
  Compass,
  Handshake,
  Send,
  Share2,
  Check,
} from "lucide-react";

const ANCORA = "ricerca-videomaker-2026-2027";
const TEL = "tel:+393271237328";
const EMAIL = "lavoro@tibihacca.com";
const BASE = "/lavoro/videomaker";
const OGGETTO = "RICERCA VIDEOMAKER 2026/2027";

const LOCANDINE: Slide[] = [
  { src: `${BASE}/videomaker-eventi-sportivo.jpg`, titolo: "Videomaker Sportivo ed Eventi — posizione principale" },
  { src: `${BASE}/videomaker-calcio.jpg`, titolo: "Videomaker Calcio — partite, highlights, interviste" },
  { src: `${BASE}/videomaker-motorsport.jpg`, titolo: "Videomaker Motorsport — circuiti, gare, paddock ed eventi" },
  { src: `${BASE}/videomaker-eventi-musica.jpg`, titolo: "Videomaker Eventi e Musica — concerti, festival, Sanremo, backstage" },
  { src: `${BASE}/videomaker-turismo.jpg`, titolo: "Videomaker Turismo e Territorio — fiere, manifestazioni, produzioni" },
  { src: `${BASE}/videomaker-inviata.jpg`, titolo: "Videomaker + Inviata — lavoro in crew" },
  { src: `${BASE}/montatore.jpg`, titolo: "Montatore Video e Post Produzione" },
];

const AMBITI = [
  { t: "Calcio", d: "partite, highlights, interviste e contenuti" },
  { t: "Motorsport", d: "circuiti, gare, paddock, test ed eventi" },
  { t: "Sanremo e musica", d: "musica, spettacolo e backstage" },
  { t: "Eventi", d: "fiere, manifestazioni e produzioni audiovisive" },
  { t: "Turismo", d: "territorio e produzioni TBH" },
];

const TRASFERTE = [
  "Sanremo",
  "Misano",
  "Cremona",
  "Mugello",
  "Monza",
  "Milano",
  "Padova",
  "Roma",
  "San Marino",
  "Calella–Barcellona (Spagna)",
];

const CERCHIAMO = [
  "Capacità di effettuare riprese video",
  "Puntualità, affidabilità e autonomia",
  "Disponibilità nei weekend e agli spostamenti",
  "Capacità di lavorare sia individualmente sia con troupe/inviato/a",
  "Attrezzatura propria oppure disponibilità a utilizzare quella messa a disposizione",
];

const DA_INVIARE = [
  "nome e cognome;",
  "zona di residenza/domicilio;",
  "numero di telefono;",
  "esperienza;",
  "attrezzatura disponibile;",
  "link showreel / lavori precedenti;",
  "disponibilità weekend e trasferte.",
];

const CORPO =
  `${OGGETTO}\n\nNome e cognome:\nZona di residenza/domicilio:\nTelefono:\n\n` +
  "Esperienza:\n\nAttrezzatura disponibile:\n\nLink showreel / lavori precedenti:\n\n" +
  "Disponibilità weekend e trasferte:\n";

/** Modulo online (ordine del 04/10/2026: «Voglio il modulo online»). */
const MODULO = "/lavoro-casting/candidati/ricerca-videomaker-2026-2027";
const MAIL_CANDIDATURA = `mailto:${EMAIL}?subject=${encodeURIComponent(OGGETTO)}&body=${encodeURIComponent(CORPO)}`;

function Titoletto({ icona, children }: { icona: ReactNode; children: ReactNode }) {
  return (
    <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--tbh-neon)] flex items-center gap-2">
      {icona} {children}
    </h3>
  );
}

export function AnnuncioVideomaker() {
  const sezione = useRef<HTMLElement>(null);
  const [copiato, setCopiato] = useState(false);

  useEffect(() => {
    if (window.location.hash === `#${ANCORA}`) {
      sezione.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, []);

  const condividi = async () => {
    const url = `${window.location.origin}/lavoro-casting/bacheca#${ANCORA}`;
    const titolo = "Ricerca Videomaker Sportivo / Eventi — stagione 2026/2027";
    try {
      if (navigator.share) {
        await navigator.share({ title: titolo, text: titolo, url });
        return;
      }
      await navigator.clipboard.writeText(`${titolo} ${url}`);
      setCopiato(true);
      setTimeout(() => setCopiato(false), 2500);
    } catch {
      /* condivisione annullata dall'utente */
    }
  };

  return (
    <section
      ref={sezione}
      id={ANCORA}
      data-annuncio="ricerca-videomaker"
      className="tbh-card p-5 md:p-8 mb-12 border-2 border-[var(--tbh-gold)] shadow-[0_0_40px_rgba(212,175,55,0.14)] scroll-mt-28 min-w-0"
    >
      <div className="flex flex-wrap items-center gap-2 mb-6">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--tbh-neon)] px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-black">
          <Megaphone size={13} /> In evidenza
        </span>
        <span className="rounded-full bg-[var(--tbh-gold)] px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-black">
          Inserimento immediato
        </span>
        <span className="rounded-full border border-[var(--tbh-gold)]/60 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-[var(--tbh-gold)]">
          Stagione 2026/2027
        </span>
        <span className="text-[11px] uppercase tracking-widest text-[var(--tbh-muted)]">Pubblicato il 04/10/2026</span>
      </div>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,0.75fr)_minmax(0,1fr)] items-start">
        <div className="min-w-0">
          <GalleriaSlide slide={LOCANDINE} nome="Ricerca Videomaker 2026/2027" />
        </div>

        <div className="min-w-0">
          <p className="tbh-display text-base md:text-lg text-[var(--tbh-gold)] tracking-wide">
            TBH – Touch Business Holding · Produzione • Media • Sport • Eventi
          </p>
          <h2 className="tbh-display tbh-h1 leading-[0.95] mt-2 [overflow-wrap:anywhere]">
            Ricerca <span className="text-[var(--tbh-neon)]">videomaker</span> sportivo / eventi
          </h2>
          <p className="tbh-display text-xl md:text-2xl mt-4">
            Da inserire <span className="text-[var(--tbh-neon)]">immediatamente</span> nello staff per la stagione
            2026/2027.
          </p>

          <div className="mt-6 rounded-2xl border-2 border-[var(--tbh-neon)] bg-black/50 p-5">
            <Titoletto icona={<MapPin size={15} />}>Area di ricerca</Titoletto>
            <p className="tbh-body mt-2 font-semibold">Rimini · Valmarecchia · Pesaro e Urbino e zone limitrofe.</p>
          </div>

          <div className="mt-4 rounded-2xl border border-[var(--tbh-line)] bg-black/40 p-5">
            <Titoletto icona={<Camera size={15} />}>Ambiti di lavoro</Titoletto>
            <ul className="mt-3 grid gap-2">
              {AMBITI.map((a) => (
                <li key={a.t} className="tbh-body text-sm flex gap-2">
                  <Check size={18} className="shrink-0 text-[var(--tbh-neon)]" />
                  <span>
                    <b className="text-white">{a.t}:</b> {a.d}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-wrap gap-3 mt-6">
            <Link href={MODULO} className="tbh-neon-btn px-6 py-3 inline-flex items-center gap-2" data-modulo-online>
              <Send size={18} /> Candidati online
            </Link>
            <a href={MAIL_CANDIDATURA} className="rounded-full border border-[var(--tbh-line)] px-6 py-3 inline-flex items-center gap-2 font-semibold hover:border-[var(--tbh-neon)]">
              <Mail size={18} /> Via e-mail
            </a>
          </div>
        </div>
      </div>

      {/* ── Trasferte · Cosa cerchiamo ── */}
      <div className="mt-10 grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-[var(--tbh-line)] bg-black/40 p-5 min-w-0">
          <Titoletto icona={<Plane size={15} />}>Possibili trasferte</Titoletto>
          <p className="tbh-body text-sm mt-3">
            In Italia e all&apos;estero, comprese produzioni a:
          </p>
          <ul className="mt-3 flex flex-wrap gap-2">
            {TRASFERTE.map((t) => (
              <li
                key={t}
                className="rounded-full border border-[var(--tbh-gold)]/70 px-3 py-1.5 text-sm font-semibold text-[var(--tbh-gold)]"
              >
                {t}
              </li>
            ))}
          </ul>
          <p className="tbh-body text-sm mt-3 text-[var(--tbh-muted)]">
            Oltre ad altre destinazioni legate ai progetti TBH.
          </p>
        </div>

        <div className="rounded-2xl border border-[var(--tbh-line)] bg-black/40 p-5 min-w-0">
          <Titoletto icona={<Check size={15} />}>Cosa cerchiamo</Titoletto>
          <ul className="mt-3 grid gap-2">
            {CERCHIAMO.map((c) => (
              <li key={c} className="flex gap-2 tbh-body text-sm">
                <Check size={18} className="shrink-0 text-[var(--tbh-neon)]" /> {c}
              </li>
            ))}
          </ul>
          <p className="mt-3 rounded-xl border border-[var(--tbh-gold)]/60 bg-black/40 px-3 py-2 text-sm">
            <b className="text-[var(--tbh-gold)]">Montaggio preferibile, ma NON indispensabile.</b>
          </p>
        </div>
      </div>

      {/* ── Uscite in autonomia · Ingaggio ── */}
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-[var(--tbh-line)] bg-black/40 p-5 min-w-0">
          <Titoletto icona={<Compass size={15} />}>Uscite in autonomia</Titoletto>
          <p className="tbh-body text-sm mt-3">
            Quando il videomaker viene inviato da solo, deve essere in grado di contattare società, organizzatori e
            referenti, prendere autonomamente gli appuntamenti, concordare orari e punto di ritrovo, verificare
            accessi/accrediti, organizzare eventuali interviste e portare a termine il servizio.
          </p>
          <p className="tbh-body text-sm mt-3">
            Con un inviato/a o altro staff, queste attività vengono coordinate insieme.{" "}
            <a href="#casting-inviate-2026-2027" className="text-[var(--tbh-neon)] underline underline-offset-4">
              Vedi il Casting Inviate
            </a>
          </p>
        </div>
        <div className="rounded-2xl border border-[var(--tbh-line)] bg-black/40 p-5 min-w-0">
          <Titoletto icona={<Handshake size={15} />}>Ingaggio</Titoletto>
          <p className="tbh-body text-sm mt-3">
            Quota di ingaggio per l&apos;intera stagione / pacchetto di servizi, definita in funzione di
            disponibilità, esperienza, attrezzatura e numero/tipologia delle produzioni assegnate.
          </p>
        </div>
      </div>

      {/* ── Candidature ── */}
      <div className="mt-4 rounded-2xl border-2 border-[var(--tbh-gold)]/70 bg-black/40 p-5 md:p-6">
        <p className="tbh-display text-xl flex items-center gap-2">
          <Send size={20} className="text-[var(--tbh-neon)]" /> Candidature
        </p>
        <p className="tbh-body text-sm mt-2">Invia:</p>
        <ul className="mt-3 grid gap-2 sm:grid-cols-2">
          {DA_INVIARE.map((d) => (
            <li key={d} className="flex gap-2 tbh-body text-sm">
              <Check size={18} className="shrink-0 text-[var(--tbh-neon)]" /> {d}
            </li>
          ))}
        </ul>
        <p className="mt-4 rounded-xl bg-[var(--tbh-neon)] px-4 py-3 text-sm md:text-base font-bold text-black">
          Unica e-mail per questa ricerca: {EMAIL}
        </p>
        <p className="text-xs text-[var(--tbh-muted)] mt-2">
          I pulsanti aprono il messaggio con l&apos;oggetto “{OGGETTO}” e i campi già scritti.
        </p>
        <Link
          href={MODULO}
          className="mt-4 rounded-xl bg-[var(--tbh-neon)] px-4 py-3 text-sm md:text-base font-bold text-black flex items-center justify-center gap-3 min-w-0 uppercase tracking-wide"
        >
          <Send size={20} className="shrink-0" /> Compila il modulo online · allega CV e foto
        </Link>

        <div className="grid gap-3 mt-4 sm:grid-cols-2">
          <a
            href={MAIL_CANDIDATURA}
            className="rounded-xl border border-[var(--tbh-line)] px-4 py-3 hover:border-[var(--tbh-neon)] flex items-center gap-3 min-w-0"
          >
            <Mail size={20} className="shrink-0 text-[var(--tbh-neon)]" />
            <span className="min-w-0">
              <span className="block text-[11px] uppercase tracking-wider text-[var(--tbh-muted)]">E-mail</span>
              <span className="block font-semibold [overflow-wrap:anywhere]">{EMAIL}</span>
            </span>
          </a>
          <a
            href={TEL}
            className="rounded-xl border border-[var(--tbh-line)] px-4 py-3 hover:border-[var(--tbh-neon)] flex items-center gap-3 min-w-0"
          >
            <Phone size={20} className="shrink-0 text-[var(--tbh-neon)]" />
            <span className="min-w-0">
              <span className="block text-[11px] uppercase tracking-wider text-[var(--tbh-muted)]">Telefono · solo informazioni</span>
              <span className="block font-semibold">327 123 7328</span>
            </span>
          </a>
        </div>
      </div>

      <div className="mt-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <p className="text-sm text-[var(--tbh-muted)] min-w-0">
          Condividi la ricerca con videomaker, operatori e montatori della zona.
        </p>
        <button
          type="button"
          onClick={condividi}
          className="shrink-0 px-5 py-3 rounded-full border border-[var(--tbh-neon)]/60 font-semibold inline-flex items-center gap-2 hover:bg-[var(--tbh-neon)] hover:text-black"
        >
          {copiato ? <Check size={18} /> : <Share2 size={18} />} {copiato ? "Link copiato" : "Condividi l'annuncio"}
        </button>
      </div>
    </section>
  );
}
