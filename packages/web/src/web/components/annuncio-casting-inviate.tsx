/**
 * CASTING IN EVIDENZA — «CASTING INVIATE 2026–2027 · FINO A 14 POSIZIONI DA COPRIRE» (04/10/2026)
 *
 * Testo trascritto come lo ha consegnato Claudio, con le sue 9 locandine ufficiali
 * (principale, ruoli e mansioni, 7 ruoli) usate così come sono, solo convertite in jpg.
 * Nessun dato aggiunto: niente date, niente compenso, niente location — il testo non li indica.
 *
 * Candidature: modulo online + lavoro@tibihacca.com (dal 06/10/2026 niente WhatsApp).
 * Montato in bacheca lavoro (/lavoro-casting/bacheca#casting-inviate-2026-2027).
 */
import { useEffect, useRef, useState, type ReactNode } from "react";
import { Link } from "wouter";
import { GalleriaSlide, type Slide } from "./galleria-slide";
import {
  Megaphone,
  Mail,
  CalendarDays,
  Mic,
  Video,
  Lightbulb,
  Send,
  Share2,
  Check,
  ArrowRight,
  Gift,
  Users,
} from "lucide-react";

const ANCORA = "casting-inviate-2026-2027";
const EMAIL = "lavoro@tibihacca.com";
const BASE = "/lavoro/casting-inviate";
const OGGETTO = "CASTING INVIATE 2026-2027";
const ROSA = "#ff2d95";

/* Locandine ufficiali consegnate da Claudio (04/10/2026). */
const LOCANDINE: Slide[] = [
  { src: `${BASE}/locandina-principale.jpg`, titolo: "Casting Inviate — Nuovi volti 2026-2027" },
  { src: `${BASE}/ruoli-e-mansioni.jpg`, titolo: "Nuovi volti — Ruoli e mansioni" },
  { src: `${BASE}/ruolo-1-presentatrice-collegamenti.jpg`, titolo: "1 · Presentatrice e collegamenti" },
  { src: `${BASE}/ruolo-2-interviste-contenuti.jpg`, titolo: "2 · Interviste e contenuti" },
  { src: `${BASE}/ruolo-3-supporto-produzione.jpg`, titolo: "3 · Supporto alla produzione" },
  { src: `${BASE}/ruolo-4-contenuti-web-social.jpg`, titolo: "4 · Contenuti web e social" },
  { src: `${BASE}/ruolo-5-organizzazione-sul-posto.jpg`, titolo: "5 · Organizzazione sul posto" },
  { src: `${BASE}/ruolo-6-relazioni-presenza.jpg`, titolo: "6 · Relazione e presenza" },
  { src: `${BASE}/ruolo-7-produzioni-musicali.jpg`, titolo: "7 · Produzioni musicali" },
];

const DISPONIBILITA: { t: string; d?: string }[] = [
  { t: "Una data" },
  { t: "Più date" },
  {
    t: "Un settore",
    d: "sport, motorsport, eventi, territorio, spettacolo, produzioni musicali o audiovisive",
  },
  { t: "Una zona" },
  { t: "Tutto il calendario" },
];

const QUANDO_CHIAMATA = [
  "arrivare in anticipo e presentarsi all'operatore o alla produzione;",
  "informarsi sul servizio da realizzare;",
  "individuare persone interessanti da coinvolgere;",
  "presentare il luogo e raccontare cosa sta succedendo davanti alla telecamera;",
  "realizzare brevi interviste e raccogliere dichiarazioni;",
  "aiutare l'operatore a individuare momenti e immagini da riprendere;",
  "raccogliere informazioni, curiosità e contenuti utili al racconto;",
  "contribuire alla realizzazione di brevi contenuti per web e social;",
  "nel post-evento, cercare protagonisti per interviste e reazioni.",
];

const VERBI = ["Osserva", "Proponi", "Chiedi", "Intervista", "Racconta", "Aiuta"];
const DOMANDE = [
  "Cosa sta succedendo?",
  "Chi possiamo intervistare?",
  "Qual è la cosa interessante da raccontare?",
  "Cosa dovrebbe riprendere l'operatore?",
  "Cosa possiamo portare a casa da questa giornata?",
];

/* I 7 ruoli come scritti sulla locandina «Ruoli e mansioni». */
const RUOLI = [
  "Presentatrice e collegamenti",
  "Interviste e contenuti",
  "Supporto alla produzione",
  "Contenuti web e social",
  "Organizzazione sul posto",
  "Relazione e presenza",
  "Partecipazione a produzioni musicali",
];

/* «Come partecipare» e «Cosa offriamo»: testo delle locandine ufficiali. */
const PASSI = [
  { t: "Candidati", d: "Invia una breve presentazione, foto recenti e disponibilità." },
  { t: "Indica la tua disponibilità", d: "Una data, più date, una zona, un settore o l'intero calendario." },
  { t: "Colloquio", d: "Conosciamo il tuo profilo e valutiamo le opportunità più adatte a te." },
  { t: "Entra nella crew", d: "Ricevi le date e i servizi ed inizia a vivere l'esperienza sul campo." },
];
const OFFRIAMO = [
  "Esperienze reali sul campo",
  "Visibilità nei contenuti audiovisivi",
  "Formazione e supporto della produzione",
  "Collaborazione continuativa o su singole date",
  "Ambiente dinamico e professionale",
  "Possibilità di partecipare a diverse attività",
];

const CORPO =
  `${OGGETTO}\n\nNome e cognome:\nCittà / zona:\nRecapito:\n\n` +
  "Breve presentazione:\n\nFoto recenti (link o allegato):\n\n" +
  "Disponibilità (una data · più date · un settore · una zona · tutto il calendario):\n\n" +
  "Ruoli che mi interessano (1-7):\n\nEsperienza (se presente):\n";

/** Modulo online (ordine del 04/10/2026: «Voglio il modulo online»). */
const MODULO = "/lavoro-casting/candidati/casting-inviate-2026-2027";
const MAIL_CANDIDATURA = `mailto:${EMAIL}?subject=${encodeURIComponent(OGGETTO)}&body=${encodeURIComponent(CORPO)}`;

function Titoletto({ icona, children }: { icona: ReactNode; children: ReactNode }) {
  return (
    <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--tbh-neon)] flex items-center gap-2">
      {icona} {children}
    </h3>
  );
}

export function AnnuncioCastingInviate() {
  const sezione = useRef<HTMLElement>(null);
  const [copiato, setCopiato] = useState(false);

  /* Arrivando dal ticker con l'ancora la sezione è montata dopo il caricamento: scorriamo noi. */
  useEffect(() => {
    if (window.location.hash === `#${ANCORA}`) {
      sezione.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, []);

  const condividi = async () => {
    const url = `${window.location.origin}/lavoro-casting/bacheca#${ANCORA}`;
    const titolo = "Casting Inviate 2026–2027 — fino a 14 posizioni da coprire";
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
      data-annuncio="casting-inviate"
      className="tbh-card p-5 md:p-8 mb-12 border-2 scroll-mt-28 min-w-0"
      style={{ borderColor: ROSA, boxShadow: "0 0 40px rgba(255,45,149,0.14)" }}
    >
      <div className="flex flex-wrap items-center gap-2 mb-6">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--tbh-neon)] px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-black">
          <Megaphone size={13} /> In evidenza
        </span>
        <span
          className="rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-white"
          style={{ background: ROSA }}
        >
          Casting aperto
        </span>
        <span className="rounded-full border border-[var(--tbh-gold)]/60 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-[var(--tbh-gold)]">
          Inviate · Nuovi volti
        </span>
        <span className="text-[11px] uppercase tracking-widest text-[var(--tbh-muted)]">Pubblicato il 04/10/2026</span>
      </div>

      {/* ── Testa: locandine ufficiali + titolo ── */}
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] items-start">
        <div className="min-w-0">
          <GalleriaSlide slide={LOCANDINE} nome="Casting Inviate 2026-2027" />
        </div>

        <div className="min-w-0">
          <p className="tbh-display text-base md:text-lg text-[var(--tbh-gold)] tracking-wide">
            Nuovi volti 2026–2027
          </p>
          <h2 className="tbh-display tbh-h1 leading-[0.95] mt-2 [overflow-wrap:anywhere]">
            Casting <span style={{ color: ROSA }}>inviate</span>
          </h2>
          <p className="tbh-display text-xl md:text-2xl mt-4">
            Fino a <span className="text-[var(--tbh-neon)]">14 posizioni</span> da coprire
          </p>
          <p className="tbh-body mt-3">
            Non si tratta necessariamente di 14 ragazze diverse: è una <b>crew flessibile</b> di inviate e
            collaboratrici audiovisive, assegnate in base a calendario, località, disponibilità e servizi in
            contemporanea.
          </p>

          {/* DISPONIBILITÀ */}
          <div className="mt-6 rounded-2xl border-2 border-[var(--tbh-neon)] bg-black/50 p-5">
            <Titoletto icona={<CalendarDays size={15} />}>Puoi dare disponibilità per</Titoletto>
            <ul className="mt-3 flex flex-wrap gap-2">
              {DISPONIBILITA.map((x) => (
                <li key={x.t} className="rounded-full bg-[var(--tbh-neon)] px-3 py-1.5 text-sm font-bold text-black">
                  {x.t}
                </li>
              ))}
            </ul>
            <p className="tbh-body text-sm mt-3 text-[var(--tbh-muted)]">
              <b className="text-white">Un settore:</b> {DISPONIBILITA[2].d}.
            </p>
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

      {/* ── Perché 14 · Quando vieni chiamata ── */}
      <div className="mt-10 grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-[var(--tbh-line)] bg-black/40 p-5 min-w-0">
          <Titoletto icona={<Users size={15} />}>Perché fino a 14 posizioni</Titoletto>
          <p className="tbh-body text-sm mt-3">
            Il calendario comprende <b>almeno 14 attività o incarichi diversi</b>. In giornate differenti una
            stessa ragazza può seguirne più di uno; quando più produzioni si svolgono in contemporanea, servono
            più inviate nello stesso giorno.
          </p>
          <div className="mt-5">
            <Titoletto icona={<Video size={15} />}>Operatore e inviata</Titoletto>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              <div className="rounded-xl border border-[var(--tbh-line)] px-4 py-3">
                <p className="font-bold text-[var(--tbh-neon)]">Operatore</p>
                <p className="tbh-body text-sm">immagini e riprese</p>
              </div>
              <div className="rounded-xl border px-4 py-3" style={{ borderColor: `${ROSA}99` }}>
                <p className="font-bold" style={{ color: ROSA }}>
                  Inviata
                </p>
                <p className="tbh-body text-sm">racconto, interviste, contatti, protagonisti e informazioni</p>
              </div>
            </div>
            <p className="tbh-body text-sm mt-3">Insieme costruiscono il servizio sul posto.</p>
          </div>
        </div>

        <div className="rounded-2xl border border-[var(--tbh-line)] bg-black/40 p-5 min-w-0">
          <Titoletto icona={<Mic size={15} />}>Quando vieni chiamata</Titoletto>
          <ul className="mt-3 grid gap-2">
            {QUANDO_CHIAMATA.map((q) => (
              <li key={q} className="flex gap-2 tbh-body text-sm">
                <Check size={18} className="shrink-0 text-[var(--tbh-neon)]" /> {q}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* ── Atteggiamento ── */}
      <div className="mt-4 rounded-2xl border border-[var(--tbh-line)] bg-black/40 p-5 min-w-0">
        <Titoletto icona={<Lightbulb size={15} />}>L&apos;atteggiamento giusto</Titoletto>
        <ol className="mt-3 flex flex-wrap items-center gap-2">
          {VERBI.map((v, i) => (
            <li key={v} className="flex items-center gap-2">
              <span className="tbh-display text-lg md:text-xl">{v}.</span>
              {i < VERBI.length - 1 && <ArrowRight size={15} className="text-[var(--tbh-muted)] shrink-0" />}
            </li>
          ))}
        </ol>
        <ul className="mt-4 flex flex-wrap gap-2">
          {DOMANDE.map((d) => (
            <li key={d} className="rounded-full border px-3 py-1.5 text-sm font-semibold" style={{ borderColor: `${ROSA}aa` }}>
              “{d}”
            </li>
          ))}
        </ul>
      </div>

      {/* ── I 7 ruoli · Cosa offriamo ── */}
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-[var(--tbh-line)] bg-black/40 p-5 min-w-0">
          <Titoletto icona={<Mic size={15} />}>I principali ruoli e mansioni</Titoletto>
          <ol className="mt-3 grid gap-2">
            {RUOLI.map((r, i) => (
              <li key={r} className="flex items-center gap-3 tbh-body text-sm">
                <span
                  className="grid h-7 w-7 shrink-0 place-items-center rounded-full text-sm font-bold text-white"
                  style={{ background: ROSA }}
                >
                  {i + 1}
                </span>
                {r}
              </li>
            ))}
          </ol>
          <p className="text-xs text-[var(--tbh-muted)] mt-3">
            Il dettaglio di ogni ruolo è nella sua locandina, nella galleria qui sopra.
          </p>
        </div>
        <div className="rounded-2xl border border-[var(--tbh-line)] bg-black/40 p-5 min-w-0">
          <Titoletto icona={<Gift size={15} />}>Cosa offriamo</Titoletto>
          <ul className="mt-3 grid gap-2">
            {OFFRIAMO.map((o) => (
              <li key={o} className="flex gap-2 tbh-body text-sm">
                <Check size={18} className="shrink-0 text-[var(--tbh-neon)]" /> {o}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* ── Come partecipare ── */}
      <div className="mt-4 rounded-2xl border-2 border-[var(--tbh-gold)]/70 bg-black/40 p-5 md:p-6">
        <p className="tbh-display text-xl flex items-center gap-2">
          <Send size={20} className="text-[var(--tbh-neon)]" /> Come partecipare
        </p>
        <ol className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {PASSI.map((p, i) => (
            <li key={p.t} className="rounded-xl border border-[var(--tbh-line)] px-4 py-3 min-w-0">
              <p className="font-bold">
                <span className="mr-2" style={{ color: ROSA }}>
                  {i + 1}
                </span>
                {p.t}
              </p>
              <p className="tbh-body text-sm mt-1">{p.d}</p>
            </li>
          ))}
        </ol>
        <p className="mt-4 rounded-xl bg-[var(--tbh-neon)] px-4 py-3 text-sm md:text-base font-bold text-black">
          Scrivi nell&apos;oggetto o all&apos;inizio del messaggio: “{OGGETTO}”.
        </p>
        <p className="text-xs text-[var(--tbh-muted)] mt-2">I pulsanti aprono il messaggio con la dicitura già scritta.</p>
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
              <span className="block text-[11px] uppercase tracking-wider text-[var(--tbh-muted)]">E-mail candidature</span>
              <span className="block font-semibold [overflow-wrap:anywhere]">{EMAIL}</span>
            </span>
          </a>
        </div>
      </div>

      {/* ── Chiusura e condivisione ── */}
      <div className="mt-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <p className="tbh-display text-xl md:text-2xl min-w-0">
          Una data o tutta la stagione.{" "}
          <span className="text-[var(--tbh-neon)]">La tua disponibilità decide quanto puoi essere coinvolta.</span>
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
