/**
 * RICERCA IN EVIDENZA — «RICERCA ASSISTENTE DI PRODUZIONE» (04/10/2026)
 *
 * Testo trascritto come lo ha consegnato Claudio, con la sua locandina ufficiale
 * (usata così com'è, solo convertita in jpg). Nessun dato aggiunto: niente compenso,
 * niente livello CCNL, niente sede — il testo dice che si definiscono prima dell'assunzione.
 *
 * Candidature: lavoro@tibihacca.com (unico recapito del testo, il CV va per e-mail).
 * WhatsApp centrale TBH solo per informazioni.
 * Montato in bacheca lavoro (/lavoro-casting/bacheca#assistente-di-produzione).
 */
import { useEffect, useRef, useState, type ReactNode } from "react";
import { Link } from "wouter";
import { GalleriaSlide, type Slide } from "./galleria-slide";
import {
  Megaphone,
  MessageCircle,
  Mail,
  CalendarCheck,
  Clapperboard,
  ClipboardList,
  UserCheck,
  TrendingUp,
  FileSignature,
  Send,
  Share2,
  Check,
} from "lucide-react";

const ANCORA = "assistente-di-produzione";
const WA = "https://wa.me/393792088524";
const EMAIL = "lavoro@tibihacca.com";
const OGGETTO = "ASSISTENTE DI PRODUZIONE";

const LOCANDINE: Slide[] = [
  { src: "/lavoro/assistente-produzione/locandina.jpg", titolo: "Assistente di produzione — una carriera stabile nel nostro team" },
];

const AMBITI = ["Sport", "Motorsport", "Eventi", "Spettacolo", "Territorio", "Produzioni audiovisive", "Produzioni musicali"];

const FASI: { titolo: string; icona: ReactNode; voci: string[] }[] = [
  {
    titolo: "Prima del servizio",
    icona: <CalendarCheck size={15} />,
    voci: [
      "consultazione calendario e attività;",
      "contatto e convocazione della crew;",
      "conferma di luoghi, orari e disponibilità;",
      "preparazione di informazioni, documenti e accrediti;",
      "supporto a trasferte, materiali e logistica.",
    ],
  },
  {
    titolo: "Sul posto",
    icona: <Clapperboard size={15} />,
    voci: [
      "coordinamento di operatori e collaboratori;",
      "contatto con organizzatori, ospiti e referenti;",
      "controllo di orari e attività;",
      "supporto durante riprese e interviste;",
      "gestione delle necessità operative e degli imprevisti;",
      "quando necessario, possibilità di partecipare anche come inviata/presentatrice.",
    ],
  },
  {
    titolo: "Dopo il servizio",
    icona: <ClipboardList size={15} />,
    voci: [
      "raccolta di materiali e informazioni;",
      "report della giornata;",
      "passaggio dei contenuti alla produzione/post-produzione;",
      "follow-up e preparazione delle attività successive.",
    ],
  },
];

const QUALITA = [
  "Precisione",
  "Puntualità",
  "Capacità organizzativa e relazionale",
  "Autonomia",
  "Problem solving",
  "Smartphone, e-mail e strumenti digitali",
];

const CONTRATTI = [
  "Tempo determinato",
  "Successivo tempo indeterminato",
  "Part-time o full-time",
  "Apprendistato, quando applicabile",
];

const DA_INVIARE = ["CV;", "breve presentazione;", "zona di disponibilità;", "eventuali esperienze."];

const CORPO =
  `${OGGETTO}\n\nNome e cognome:\nZona di disponibilità:\nRecapito:\n\n` +
  "Breve presentazione:\n\nEventuali esperienze:\n\n(Allego il CV)\n";

/** Modulo online (ordine del 04/10/2026: «Voglio il modulo online»). */
const MODULO = "/lavoro-casting/candidati/assistente-di-produzione";
const MAIL_CANDIDATURA = `mailto:${EMAIL}?subject=${encodeURIComponent(OGGETTO)}&body=${encodeURIComponent(CORPO)}`;
const WA_INFO = `${WA}?text=${encodeURIComponent(`${OGGETTO} — vorrei informazioni sulla posizione.`)}`;

function Titoletto({ icona, children }: { icona: ReactNode; children: ReactNode }) {
  return (
    <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--tbh-neon)] flex items-center gap-2">
      {icona} {children}
    </h3>
  );
}

export function AnnuncioAssistenteProduzione() {
  const sezione = useRef<HTMLElement>(null);
  const [copiato, setCopiato] = useState(false);

  useEffect(() => {
    if (window.location.hash === `#${ANCORA}`) {
      sezione.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, []);

  const condividi = async () => {
    const url = `${window.location.origin}/lavoro-casting/bacheca#${ANCORA}`;
    const titolo = "Ricerca Assistente di Produzione — TBH";
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
      data-annuncio="assistente-produzione"
      className="tbh-card p-5 md:p-8 mb-12 border-2 border-[var(--tbh-neon)] shadow-[0_0_40px_rgba(230,255,0,0.12)] scroll-mt-28 min-w-0"
    >
      <div className="flex flex-wrap items-center gap-2 mb-6">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--tbh-neon)] px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-black">
          <Megaphone size={13} /> In evidenza
        </span>
        <span className="rounded-full border border-[var(--tbh-neon)]/50 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-[var(--tbh-neon)]">
          Candidature aperte
        </span>
        <span className="rounded-full border border-[var(--tbh-gold)]/60 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-[var(--tbh-gold)]">
          Produzione · Figura stabile
        </span>
        <span className="text-[11px] uppercase tracking-widest text-[var(--tbh-muted)]">Pubblicato il 04/10/2026</span>
      </div>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] items-start">
        <div className="min-w-0">
          <GalleriaSlide slide={LOCANDINE} nome="Assistente di produzione" />
        </div>

        <div className="min-w-0">
          <p className="tbh-display text-base md:text-lg text-[var(--tbh-gold)] tracking-wide">
            Lavora nella produzione con noi
          </p>
          <h2 className="tbh-display tbh-h1 leading-[0.95] mt-2 [overflow-wrap:anywhere]">
            Ricerca <span className="text-[var(--tbh-neon)]">assistente</span> di produzione
          </h2>
          <p className="tbh-body mt-4">
            TBH seleziona una figura da inserire nella propria produzione per attività legate a:
          </p>
          <ul className="mt-3 flex flex-wrap gap-2">
            {AMBITI.map((a) => (
              <li key={a} className="rounded-full bg-[var(--tbh-neon)] px-3 py-1.5 text-sm font-bold text-black">
                {a}
              </li>
            ))}
          </ul>
          <p className="tbh-body mt-4">
            Cerchiamo una persona <b>organizzata, dinamica e affidabile</b> che possa diventare un riferimento
            operativo della produzione, lavorando sia nell&apos;organizzazione sia direttamente sul campo.
          </p>

          <div className="flex flex-wrap gap-3 mt-6">
            <Link href={MODULO} className="tbh-neon-btn px-6 py-3 inline-flex items-center gap-2" data-modulo-online>
              <Send size={18} /> Candidati online
            </Link>
            <a href={MAIL_CANDIDATURA} className="rounded-full border border-[var(--tbh-line)] px-6 py-3 inline-flex items-center gap-2 font-semibold hover:border-[var(--tbh-neon)]">
              <Mail size={18} /> Via e-mail
            </a>
            <a
              href={WA_INFO}
              target="_blank"
              rel="noreferrer"
              className="px-6 py-3 rounded-full border border-[var(--tbh-line)] font-semibold inline-flex items-center gap-2 hover:border-[var(--tbh-neon)]"
            >
              <MessageCircle size={18} /> Informazioni su WhatsApp
            </a>
          </div>
        </div>
      </div>

      {/* ── Cosa farai: prima, sul posto, dopo ── */}
      <p className="tbh-display text-xl mt-10">Cosa farai</p>
      <div className="mt-3 grid gap-4 lg:grid-cols-3">
        {FASI.map((f) => (
          <div key={f.titolo} className="rounded-2xl border border-[var(--tbh-line)] bg-black/40 p-5 min-w-0">
            <Titoletto icona={f.icona}>{f.titolo}</Titoletto>
            <ul className="mt-3 grid gap-2">
              {f.voci.map((v) => (
                <li key={v} className="flex gap-2 tbh-body text-sm">
                  <Check size={18} className="shrink-0 text-[var(--tbh-neon)]" /> {v}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* ── Chi cerchiamo · Percorso ── */}
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-[var(--tbh-line)] bg-black/40 p-5 min-w-0">
          <Titoletto icona={<UserCheck size={15} />}>Chi cerchiamo</Titoletto>
          <ul className="mt-3 flex flex-wrap gap-2">
            {QUALITA.map((q) => (
              <li
                key={q}
                className="rounded-full border border-[var(--tbh-gold)]/70 px-3 py-1.5 text-sm font-semibold text-[var(--tbh-gold)]"
              >
                {q}
              </li>
            ))}
          </ul>
          <p className="tbh-body text-sm mt-3">
            È richiesta disponibilità agli spostamenti e, secondo calendario, anche a weekend, festivi o attività
            serali.
          </p>
          <p className="tbh-body text-sm mt-3">
            L&apos;esperienza è gradita, ma valutiamo anche <b>nuovi profili da formare sul campo</b>.
          </p>
        </div>
        <div className="rounded-2xl border border-[var(--tbh-line)] bg-black/40 p-5 min-w-0">
          <Titoletto icona={<TrendingUp size={15} />}>Da collaboratrice a figura stabile</Titoletto>
          <p className="tbh-body text-sm mt-3">
            È possibile iniziare partecipando a singole produzioni o giornate operative.
          </p>
          <p className="tbh-body text-sm mt-3">
            Per i profili più adatti l&apos;obiettivo è costruire un percorso continuativo fino al ruolo di{" "}
            <b>Assistente di Produzione stabile</b>, con responsabilità crescenti nell&apos;organizzazione delle
            attività.
          </p>
        </div>
      </div>

      {/* ── Contratto ── */}
      <div className="mt-4 rounded-2xl border border-[var(--tbh-line)] bg-black/40 p-5 min-w-0">
        <Titoletto icona={<FileSignature size={15} />}>Contratto</Titoletto>
        <p className="tbh-body text-sm mt-3">
          In base a esperienza, disponibilità, mansioni e organizzazione del lavoro potranno essere valutati:
        </p>
        <ul className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {CONTRATTI.map((c) => (
            <li key={c} className="rounded-xl border border-[var(--tbh-line)] px-4 py-3 text-sm font-semibold">
              {c}
            </li>
          ))}
        </ul>
        <p className="tbh-body text-sm mt-3 text-[var(--tbh-muted)]">
          Per l&apos;inserimento come dipendente saranno applicati CCNL e livello coerenti con le mansioni
          effettivamente svolte, con condizioni economiche definite prima dell&apos;assunzione.
        </p>
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
        <Link
          href={MODULO}
          className="mt-4 rounded-xl bg-[var(--tbh-neon)] px-4 py-3 text-sm md:text-base font-bold text-black flex items-center justify-center gap-3 min-w-0 uppercase tracking-wide"
        >
          <Send size={20} className="shrink-0" /> Compila il modulo online · allega CV e foto
        </Link>
        <a
          href={MAIL_CANDIDATURA}
          className="mt-3 rounded-xl border border-[var(--tbh-line)] px-4 py-3 text-sm md:text-base font-bold flex items-center gap-3 min-w-0 hover:border-[var(--tbh-neon)]"
        >
          <Mail size={20} className="shrink-0" />
          <span className="[overflow-wrap:anywhere]">{EMAIL}</span>
        </a>
        <p className="text-xs text-[var(--tbh-muted)] mt-2">
          Il pulsante apre l&apos;e-mail con l&apos;oggetto “{OGGETTO}” e i campi già scritti: ricordati di allegare il CV.
        </p>
      </div>

      <div className="mt-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <p className="tbh-display text-xl md:text-2xl min-w-0">
          Una giornata può essere l&apos;inizio.{" "}
          <span className="text-[var(--tbh-neon)]">
            L&apos;obiettivo è trovare una persona che possa crescere e diventare parte stabile della produzione.
          </span>
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
