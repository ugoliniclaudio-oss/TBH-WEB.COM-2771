/**
 * ANNUNCIO IN EVIDENZA — «COMMERCIALE FISSAGGIO APPUNTAMENTI» (02/10/2026)
 *
 * Testo, zone, importi e metodo sono quelli consegnati da Claudio, con le sue due
 * locandine ufficiali (1/5 e 3/5). Nessun dato aggiunto: niente sede fissa, niente
 * scadenza, niente nomi di clienti o marchi che non stiano già nel testo o sulle slide.
 *
 * Aree: lo ha chiesto Claudio in evidenza.
 *   · IN PRESENZA (attività media e sport in corso): Romagna, Valmarecchia, Pesaro Urbino.
 *   · SMART WORKING: Italia e Spagna, principalmente le città sotto.
 *
 * Zona 3 e Zona 2: Claudio ha chiarito (03/10/2026) che la Zona 3 arriva FINO A 100
 * appuntamenti, la Zona 2 parte da OLTRE 100 (100+).
 *
 * Candidature (06/10/2026): solo lavoro@tibihacca.com — WhatsApp non è più un canale di candidatura.
 */
import { useEffect, useRef } from "react";
import {
  Megaphone,
  Mail,
  Globe,
  MapPin,
  Laptop,
  Phone,
  ArrowRight,
  CheckCircle2,
  XCircle,
  Clock,
  Clapperboard,
  TrendingUp,
} from "lucide-react";

const ANCORA = "commerciale-fissaggio-appuntamenti";
const EMAIL = "lavoro@tibihacca.com";
const SITO = "https://tbh-web.com";
const BASE = "/lavoro/fissaggio-appuntamenti";

const IN_PRESENZA = ["Romagna", "Valmarecchia", "Pesaro Urbino"];
const SMART_CITTA = ["Calella (Barcellona)", "Rimini", "Sanremo", "Milano", "Cremona", "Padova", "Roma"];

/** Le cinque zone, dalla 5 (ingresso) alla 1. Colori come sulla slide 3/5. */
const ZONE = [
  { n: 5, fisso: "€300", app: 20, perc: "20%", colore: "#f5d90a" },
  { n: 4, fisso: "€450", app: 50, perc: "20%", colore: "#3ccf4e" },
  { n: 3, fisso: "€650", app: "fino a 100", perc: "20%", colore: "#ff8a00" },
  { n: 2, fisso: "€900", app: "oltre 100", perc: "20%", colore: "#2f8bff" },
  { n: 1, fisso: "€1.200", app: 200, perc: "30%", colore: "#e3262f" },
];

const METODO = [
  "Saluto",
  "Presentazione",
  "Breve storia",
  "Presentazione piani/servizi/articoli/prodotti",
  "Fissaggio appuntamento",
  "Chiusura",
  "Saluti finali",
];

const MAIL_CANDIDATURA = `mailto:${EMAIL}?subject=${encodeURIComponent(
  "Candidatura — Commerciale Fissaggio Appuntamenti",
)}&body=${encodeURIComponent(
  "Ruolo: COMMERCIALE FISSAGGIO APPUNTAMENTI\nModalità preferita: in presenza / smart working\nCittà:\n\nBreve presentazione:\n\n\n(Allego il mio CV)",
)}`;

export function AnnuncioFissaggioAppuntamenti() {
  const sezione = useRef<HTMLElement>(null);
  /* Arrivando dal ticker con l'ancora, la pagina è montata dopo il caricamento:
     il browser non trova l'ancora da solo, quindi scorriamo noi. */
  useEffect(() => {
    if (window.location.hash === `#${ANCORA}`) {
      sezione.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, []);

  return (
    <section
      ref={sezione}
      id={ANCORA}
      data-annuncio="fissaggio-appuntamenti"
      className="tbh-card p-5 md:p-8 mb-12 border-2 border-[var(--tbh-neon)] shadow-[0_0_40px_rgba(230,255,0,0.12)] scroll-mt-28"
    >
      <div className="flex flex-wrap items-center gap-2 mb-6">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--tbh-neon)] px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-black">
          <Megaphone size={13} /> In evidenza
        </span>
        <span className="rounded-full border border-[var(--tbh-neon)]/50 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-[var(--tbh-neon)]">
          Candidature aperte
        </span>
        <span className="text-[11px] uppercase tracking-widest text-[var(--tbh-muted)]">
          Pubblicato il 02/10/2026
        </span>
      </div>

      {/* ── Testa: locandina 1/5 + titolo e descrizione ── */}
      <div className="grid gap-8 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1fr)] items-start">
        <a href={`${BASE}/cerchiamo-commerciali.jpg`} target="_blank" rel="noreferrer" className="block min-w-0">
          <img
            src={`${BASE}/cerchiamo-commerciali.jpg`}
            alt="Cerchiamo commerciali — fissaggio appuntamenti, tutto il territorio, smart working"
            width={1144}
            height={1375}
            className="w-full h-auto rounded-2xl border border-[var(--tbh-line)]"
          />
        </a>

        <div className="min-w-0">
          <h2 className="tbh-display tbh-h1 leading-[0.95] [overflow-wrap:anywhere]">
            Commerciale <span className="text-[var(--tbh-neon)]">Fissaggio Appuntamenti</span>
          </h2>
          <p className="tbh-display text-base md:text-lg text-[var(--tbh-gold)] mt-3 tracking-wide">
            Smart Working / Tutto il Territorio
          </p>

          <p className="tbh-body mt-5">
            Cerchiamo collaboratori commerciali per attività di contatto e fissaggio appuntamenti, su
            tutto il territorio, con possibilità di Smart Working.
          </p>
          <p className="tbh-body text-[var(--tbh-muted)] mt-3">
            L&apos;attività consiste nel contattare potenziali clienti, presentare brevemente piani,
            servizi, articoli e prodotti, individuare l&apos;interesse e fissare l&apos;appuntamento
            commerciale.
          </p>

          {/* AREE — messe in evidenza su richiesta di Claudio. */}
          <div className="grid gap-4 mt-6 sm:grid-cols-2">
            <div className="rounded-2xl border-2 border-[var(--tbh-neon)] bg-black/50 p-5">
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--tbh-neon)] flex items-center gap-2">
                <MapPin size={15} /> In presenza
              </p>
              <p className="text-xs text-[var(--tbh-muted)] mt-1">Attività media e sport in corso</p>
              <ul className="mt-3 flex flex-wrap gap-2">
                {IN_PRESENZA.map((z) => (
                  <li key={z} className="rounded-full bg-[var(--tbh-neon)] px-3 py-1.5 text-sm font-bold text-black">
                    {z}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl border-2 border-[var(--tbh-gold)] bg-black/50 p-5">
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--tbh-gold)] flex items-center gap-2">
                <Laptop size={15} /> Smart working
              </p>
              <p className="text-xs text-[var(--tbh-muted)] mt-1">
                Il territorio è e resta <b className="text-white">Italia e Spagna</b>, principalmente:
              </p>
              <ul className="mt-3 flex flex-wrap gap-2">
                {SMART_CITTA.map((c) => (
                  <li
                    key={c}
                    className="rounded-full border border-[var(--tbh-gold)]/70 px-3 py-1.5 text-sm font-semibold text-[var(--tbh-gold)]"
                  >
                    {c}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 mt-6">
            <a href={MAIL_CANDIDATURA} className="tbh-neon-btn px-6 py-3 inline-flex items-center gap-2">
              <Mail size={18} /> Candidati · invia CV a {EMAIL}
            </a>
          </div>
        </div>
      </div>

      {/* ── Le cinque zone ── */}
      <div className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.85fr)] items-start">
        <div className="min-w-0">
          <p className="text-xs uppercase tracking-[0.25em] text-[var(--tbh-gold)] mb-2">5 livelli di crescita</p>
          <h3 className="tbh-display tbh-h2">Tutti partono dalla Zona 5</h3>
          <p className="tbh-body text-[var(--tbh-muted)] mt-2">
            Si avanza di livello in base agli appuntamenti raggiunti.
          </p>

          <ol className="mt-5 grid gap-3">
            {ZONE.map((z) => (
              <li
                key={z.n}
                className="grid grid-cols-[auto_minmax(0,1fr)] sm:grid-cols-[auto_minmax(0,1fr)_auto_auto] items-center gap-x-4 gap-y-1 rounded-2xl border bg-black/40 px-4 py-3"
                style={{ borderColor: `${z.colore}aa` }}
              >
                <span
                  className="row-span-2 sm:row-span-1 flex h-12 w-12 items-center justify-center rounded-xl tbh-display text-xl text-black"
                  style={{ background: z.colore }}
                >
                  {z.n}
                </span>
                <span className="tbh-display text-lg">
                  Zona {z.n}
                  {z.n === 5 && (
                    <span className="ml-2 align-middle rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[var(--tbh-muted)]">
                      Ingresso
                    </span>
                  )}
                </span>
                <span className="text-sm text-[var(--tbh-muted)] sm:text-right">
                  <b className="tbh-display text-xl text-white">{z.fisso}</b> + {z.app} appuntamenti
                </span>
                <span
                  className="justify-self-start sm:justify-self-end rounded-full px-3 py-1 text-sm font-bold text-black"
                  style={{ background: z.colore }}
                >
                  + {z.perc}
                </span>
              </li>
            ))}
          </ol>

          <p className="tbh-display text-lg text-[var(--tbh-neon)] mt-5 flex items-center gap-2">
            <TrendingUp size={20} /> Parti dalla Zona 5. Gli appuntamenti determinano lo scatto di livello.
          </p>
        </div>

        <a href={`${BASE}/5-livelli-crescita.jpg`} target="_blank" rel="noreferrer" className="block min-w-0">
          <img
            src={`${BASE}/5-livelli-crescita.jpg`}
            alt="5 livelli di crescita — tutti partono dalla Zona 5"
            width={1144}
            height={1375}
            loading="lazy"
            className="w-full h-auto rounded-2xl border border-[var(--tbh-line)]"
          />
        </a>
      </div>

      {/* ── Dopo l'appuntamento ── */}
      <div className="mt-10">
        <h3 className="tbh-display tbh-h2">Dopo l&apos;appuntamento</h3>
        <div className="grid gap-4 mt-4 md:grid-cols-3">
          <div className="rounded-2xl border border-[var(--tbh-line)] bg-black/40 p-5">
            <Clock size={22} className="text-[var(--tbh-gold)]" />
            <p className="tbh-body text-sm mt-2">
              Una volta fissato l&apos;appuntamento, il cliente viene ricontattato{" "}
              <b>entro circa 48 ore</b> per preventivo/proposta e prosecuzione della trattativa.
            </p>
          </div>
          <div className="rounded-2xl border border-[#3ccf4e]/70 bg-black/40 p-5">
            <CheckCircle2 size={22} className="text-[#3ccf4e]" />
            <p className="tbh-body text-sm mt-2">
              <b>Se il cliente firma:</b> l&apos;appuntamento viene conteggiato e si aggiunge la
              percentuale prevista dal livello.
            </p>
          </div>
          <div className="rounded-2xl border border-[#ff8a00]/70 bg-black/40 p-5">
            <XCircle size={22} className="text-[#ff8a00]" />
            <p className="tbh-body text-sm mt-2">
              <b>Se il cliente diventa KO:</b> l&apos;appuntamento valido viene comunque conteggiato
              come preso.
            </p>
          </div>
        </div>
      </div>

      {/* ── Metodo di contatto ── */}
      <div className="mt-10">
        <h3 className="tbh-display tbh-h2 flex items-center gap-3">
          <Phone size={24} className="text-[var(--tbh-neon)]" /> Metodo di contatto
        </h3>
        <ol className="mt-4 flex flex-wrap items-center gap-2">
          {METODO.map((m, i) => (
            <li key={m} className="flex items-center gap-2">
              <span className="rounded-full border border-[var(--tbh-neon)]/60 bg-black/40 px-3 py-2 text-sm font-semibold">
                <span className="text-[var(--tbh-neon)] mr-1.5">{i + 1}</span>
                {m}
              </span>
              {i < METODO.length - 1 && <ArrowRight size={16} className="text-[var(--tbh-muted)] shrink-0" />}
            </li>
          ))}
        </ol>
        <p className="tbh-body text-[var(--tbh-muted)] mt-5 flex gap-2">
          <Clapperboard size={20} className="mt-0.5 shrink-0 text-[var(--tbh-gold)]" />
          Possibilità, in base a disponibilità e caratteristiche del collaboratore, di inserimento anche
          nelle attività di produzione media.
        </p>
      </div>

      {/* ── Contatti ── */}
      <div className="mt-10 rounded-2xl border border-[var(--tbh-gold)]/60 bg-black/40 p-5 md:p-6">
        <p className="tbh-display text-xl">Candidati</p>
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
          <a
            href={SITO}
            target="_blank"
            rel="noreferrer"
            className="rounded-xl border border-[var(--tbh-line)] px-4 py-3 hover:border-[var(--tbh-neon)] flex items-center gap-3 min-w-0"
          >
            <Globe size={20} className="shrink-0 text-[var(--tbh-neon)]" />
            <span className="min-w-0">
              <span className="block text-[11px] uppercase tracking-wider text-[var(--tbh-muted)]">Sito</span>
              <span className="block font-semibold">TBH-WEB.com</span>
            </span>
          </a>
        </div>
      </div>
    </section>
  );
}
