/**
 * ANNUNCIO — «TOUCH BUSINESS HOLDING · LAVORA CON NOI» (15/10/2026)
 * VIDEOMAKER • ASSISTENTE ALLE RIPRESE • COMMERCIALE AUDIOVISIVO — Selezioni 2026–2027.
 *
 * Testo e locandina consegnati da Claudio, usati così come sono. Nessun dato aggiunto:
 * i compensi non hanno cifre perché l'annuncio non le indica.
 * Candidature: solo lavoro@tibihacca.com (oggetto «CANDIDATURA AUDIOVISIVO TBH — [RUOLO SCELTO]»)
 * oppure modulo online. WhatsApp resta solo per informazioni.
 */
import type { ReactNode } from "react";
import { Link } from "wouter";
import {
  ArrowRight,
  BadgeEuro,
  CalendarDays,
  Camera,
  Check,
  Clapperboard,
  ClipboardCheck,
  Handshake,
  Layers,
  Mail,
  MapPin,
  Send,
} from "lucide-react";
import { GalleriaSlide } from "./galleria-slide";

const EMAIL = "lavoro@tibihacca.com";
const OGGETTO = "CANDIDATURA AUDIOVISIVO TBH";
const MODULO = "/lavoro-casting/candidati/selezioni-audiovisivo-2026-2027";
const CORPO =
  "Nome e cognome:\n\nLocalità di residenza e disponibilità agli spostamenti:\n\nRuolo o ruoli di interesse:\n\n" +
  "Esperienze, attrezzature e competenze:\n\nPortfolio, showreel o collegamenti a lavori precedenti:\n\n" +
  "Disponibilità settimanale:\n";
const mail = (ruolo: string) =>
  `mailto:${EMAIL}?subject=${encodeURIComponent(`${OGGETTO} — ${ruolo}`)}&body=${encodeURIComponent(CORPO)}`;

type Profilo = {
  n: string;
  titolo: string;
  sotto: string;
  icona: ReactNode;
  intro: string;
  voci: string[];
  vociTitolo: string;
  extra: { t: string; d: string }[];
  ruoloMail: string;
};

const PROFILI: Profilo[] = [
  {
    n: "01",
    titolo: "Videomaker",
    sotto: "Operatore audiovisivo",
    icona: <Camera size={18} />,
    intro: "Cerchiamo videomaker per riprese, produzione e postproduzione di:",
    vociTitolo: "Ambiti",
    voci: [
      "Motorsport: MotoGP, Superbike, CIV, Formula 1 e manifestazioni motoristiche.",
      "Calcio: partite, highlights, interviste e servizi sportivi.",
      "Musica: videoclip, backstage, DJ set e spettacoli.",
      "Cinema e TV: cortometraggi, format, reality, documentari e produzioni radiotelevisive.",
      "Eventi: fiere, festival, manifestazioni e attività promozionali.",
      "Comunicazione: spot pubblicitari, video aziendali e contenuti social.",
    ],
    extra: [
      {
        t: "Requisiti",
        d: "Conoscenza delle tecniche di ripresa, utilizzo di videocamere o attrezzature professionali, autonomia operativa e preferibilmente competenze di montaggio video.",
      },
      { t: "Compenso", d: "Da concordare in funzione delle competenze, della durata e della tipologia di produzione." },
    ],
    ruoloMail: "VIDEOMAKER",
  },
  {
    n: "02",
    titolo: "Assistente alle riprese",
    sotto: "Supporto produzione",
    icona: <Clapperboard size={18} />,
    intro:
      "Cerchiamo collaboratori anche senza esperienza avanzata, disponibili ad affiancare videomaker e operatori durante le produzioni.",
    vociTitolo: "Attività previste",
    voci: [
      "Supporto alla preparazione delle attrezzature.",
      "Assistenza durante le riprese.",
      "Gestione di microfoni, accessori e materiali.",
      "Supporto logistico sul set.",
      "Assistenza a interviste, backstage ed eventi.",
      "Collaborazione con il responsabile di produzione.",
    ],
    extra: [
      {
        t: "Durata indicativa",
        d: "Interventi fino a 2 ore per singola uscita, con eventuali incarichi più lunghi da concordare separatamente.",
      },
      { t: "Compenso", d: "Da definire per singola uscita o incarico." },
    ],
    ruoloMail: "ASSISTENTE ALLE RIPRESE",
  },
  {
    n: "03",
    titolo: "Commerciale",
    sotto: "Procacciatore produzioni audiovisive",
    icona: <Handshake size={18} />,
    intro: "Cerchiamo persone capaci di individuare potenziali clienti e sviluppare opportunità commerciali per i servizi TBH.",
    vociTitolo: "Attività previste",
    voci: [
      "Ricerca di aziende, sponsor, associazioni sportive e organizzatori di eventi.",
      "Presentazione dei servizi di produzione video e comunicazione.",
      "Presa appuntamenti commerciali qualificati.",
      "Ricerca di collaborazioni e partnership.",
      "Segnalazione di nuove produzioni, eventi e commesse.",
    ],
    extra: [
      {
        t: "Compenso",
        d: "Sistema provvigionale da definire in base agli accordi e ai contratti effettivamente conclusi. Eventuali componenti fisse saranno specificate nell'offerta individuale.",
      },
    ],
    ruoloMail: "COMMERCIALE AUDIOVISIVO",
  },
];

const TERRITORI = [
  "Rimini e Riviera Romagnola",
  "Valmarecchia",
  "Misano Adriatico",
  "Pesaro-Urbino",
  "San Marino",
  "Padova",
  "Milano",
  "Cremona",
  "Sanremo",
  "Roma",
  "Calella (Spagna)",
];

const DA_INDICARE = [
  "Nome e cognome.",
  "Località di residenza e disponibilità agli spostamenti.",
  "Ruolo o ruoli di interesse.",
  "Esperienze, attrezzature e competenze.",
  "Portfolio, showreel o collegamenti a lavori precedenti, se disponibili.",
  "Disponibilità settimanale.",
];

function Titoletto({ icona, children }: { icona: ReactNode; children: ReactNode }) {
  return (
    <h3 className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--tbh-neon)]">
      {icona} {children}
    </h3>
  );
}

export function AnnuncioSelezioniAudiovisivo() {
  return (
    <section
      id="selezioni-audiovisivo-2026-2027"
      data-annuncio="selezioni-audiovisivo"
      className="tbh-card mb-12 min-w-0 scroll-mt-28 border-2 border-[var(--tbh-neon)] p-5 md:p-8"
    >
      <div className="mb-6 flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-[var(--tbh-neon)] px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-black">
          Opportunità TBH
        </span>
        <span className="rounded-full border border-[var(--tbh-neon)]/50 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-[var(--tbh-neon)]">
          Selezioni 2026–2027
        </span>
        <span className="text-[11px] uppercase tracking-widest text-[var(--tbh-muted)]">Pubblicato il 15/10/2026</span>
      </div>

      {/* ── Locandina + testata ── */}
      <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
        <div className="min-w-0">
          <GalleriaSlide
            slide={[
              {
                src: "/lavoro/selezioni-audiovisivo/locandina.jpg",
                titolo: "Touch Business Holding — Lavora con noi · Selezioni 2026–2027",
              },
            ]}
            nome="Lavora con noi — Selezioni 2026–2027"
          />
        </div>
        <div className="min-w-0">
          <p className="tbh-display text-base tracking-wide text-[var(--tbh-gold)] md:text-lg">
            Touch Business Holding · Lavora con noi
          </p>
          <h2 className="tbh-display mt-2 text-3xl leading-[1] break-words md:text-4xl xl:text-5xl">
            <span className="text-[var(--tbh-neon)]">Videomaker</span> • Assistente alle riprese • Commerciale audiovisivo
          </h2>
          <p className="tbh-display mt-4 text-lg md:text-xl">
            Selezioni 2026–2027 · Produzioni TV, Cinema, Sport, Musica ed Eventi
          </p>
          <p className="tbh-body mt-4">
            Touch Business Holding amplia la propria rete di collaboratori per realizzare produzioni audiovisive,
            contenuti digitali, format televisivi, videoclip musicali, servizi sportivi e progetti di comunicazione.
          </p>
          <p className="tbh-body mt-3 font-semibold text-white">Tre opportunità professionali, un unico mondo di produzione.</p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link href={MODULO} className="tbh-neon-btn inline-flex items-center gap-2 px-6 py-3" data-modulo-online>
              <Send size={18} /> Candidati online
            </Link>
            <a
              href={mail("[RUOLO SCELTO]")}
              className="inline-flex items-center gap-2 rounded-full border border-[var(--tbh-line)] px-6 py-3 font-semibold hover:border-[var(--tbh-neon)]"
            >
              <Mail size={18} /> Via e-mail
            </a>
          </div>
          <p className="mt-3 text-xs text-[var(--tbh-muted)]">
            E-mail a <b className="text-[var(--tbh-platinum)]">{EMAIL}</b> con oggetto{" "}
            <b className="text-[var(--tbh-platinum)]">{OGGETTO} — [RUOLO SCELTO]</b>.
          </p>
        </div>
      </div>

      {/* ── I tre profili ── */}
      <div className="mt-10 grid grid-cols-1 gap-4 lg:grid-cols-3">
        {PROFILI.map((p) => (
          <article key={p.n} className="flex min-w-0 flex-col gap-4 rounded-2xl border border-[var(--tbh-line)] bg-black/40 p-5">
            <header className="flex items-start gap-3">
              <span className="tbh-display grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-[var(--tbh-neon)] text-xl text-black">
                {p.n}
              </span>
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--tbh-muted)]">Profilo {Number(p.n)}</p>
                <h3 className="tbh-display text-2xl leading-none text-[var(--tbh-neon)] [overflow-wrap:anywhere]">{p.titolo}</h3>
                <p className="mt-1 flex items-center gap-1.5 text-sm font-semibold uppercase tracking-wide">
                  {p.icona} {p.sotto}
                </p>
              </div>
            </header>
            <p className="tbh-body text-sm">{p.intro}</p>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--tbh-gold)]">{p.vociTitolo}</p>
              <ul className="mt-2 grid gap-1.5">
                {p.voci.map((v) => (
                  <li key={v} className="flex gap-2 text-sm text-[var(--tbh-platinum)]">
                    <Check size={16} className="mt-0.5 shrink-0 text-[var(--tbh-neon)]" />
                    <span>{v}</span>
                  </li>
                ))}
              </ul>
            </div>
            {p.extra.map((e) => (
              <div key={e.t} className="rounded-xl border border-[var(--tbh-line)] p-3">
                <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--tbh-gold)]">
                  {e.t === "Compenso" ? <BadgeEuro size={13} /> : e.t === "Requisiti" ? <ClipboardCheck size={13} /> : <CalendarDays size={13} />} {e.t}
                </p>
                <p className="mt-1 text-sm">{e.d}</p>
              </div>
            ))}
            <a
              href={mail(p.ruoloMail)}
              className="mt-auto inline-flex items-center justify-center gap-2 rounded-full border border-[var(--tbh-neon)]/60 px-4 py-2.5 text-sm font-semibold hover:bg-[var(--tbh-neon)] hover:text-black"
            >
              <Mail size={15} /> Candidati come {p.titolo.toLowerCase()}
            </a>
          </article>
        ))}
      </div>

      {/* ── Ruolo combinato ── */}
      <div className="mt-4 flex flex-col gap-3 rounded-2xl border-2 border-[var(--tbh-gold)] bg-black/50 p-5 md:flex-row md:items-center">
        <div className="min-w-0 flex-1">
          <Titoletto icona={<Layers size={15} />}>Possibilità di ruolo combinato</Titoletto>
          <p className="tbh-display mt-2 text-xl md:text-2xl [overflow-wrap:anywhere]">VIDEOMAKER + ASSISTENTE + COMMERCIALE</p>
          <p className="tbh-body mt-2 text-sm">
            Chi possiede più competenze potrà candidarsi per un profilo misto: una figura versatile, capace di contribuire
            alla produzione audiovisiva e allo sviluppo di nuovi progetti e clienti, con incarichi e compensi definiti
            separatamente.
          </p>
        </div>
        <a
          href={mail("RUOLO COMBINATO")}
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full border border-[var(--tbh-gold)] px-5 py-2.5 text-sm font-semibold text-[var(--tbh-gold)] hover:bg-[var(--tbh-gold)] hover:text-black"
        >
          <Mail size={15} /> Candidati per il ruolo combinato
        </a>
      </div>

      {/* ── Territori · Periodo ── */}
      <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="min-w-0 rounded-2xl border border-[var(--tbh-line)] bg-black/40 p-5">
          <Titoletto icona={<MapPin size={15} />}>Territori di interesse</Titoletto>
          <ul className="mt-3 flex flex-wrap gap-2">
            {TERRITORI.map((t) => (
              <li key={t} className="rounded-full border border-[var(--tbh-line)] px-3 py-1 text-sm font-semibold">
                {t}
              </li>
            ))}
          </ul>
          <p className="mt-3 text-sm text-[var(--tbh-muted)]">
            Possibili trasferte in altre località italiane ed europee in base alle produzioni.
          </p>
        </div>
        <div className="min-w-0 rounded-2xl border border-[var(--tbh-line)] bg-black/40 p-5">
          <Titoletto icona={<CalendarDays size={15} />}>Periodo di collaborazione</Titoletto>
          <p className="tbh-body mt-3 text-sm">
            Selezioni per attività 2026–2027, con inserimenti progressivi in base al calendario delle produzioni.
          </p>
          <p className="tbh-body mt-2 text-sm">
            Collaborazioni occasionali, a progetto o continuative, secondo le necessità operative e l&apos;inquadramento
            concordato.
          </p>
        </div>
      </div>

      {/* ── Come candidarsi ── */}
      <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
        <div className="min-w-0 rounded-2xl border-2 border-[var(--tbh-neon)] bg-black/50 p-5">
          <Titoletto icona={<Mail size={15} />}>Come candidarsi</Titoletto>
          <p className="tbh-body mt-3 text-sm">Inviare la candidatura a:</p>
          <a href={mail("[RUOLO SCELTO]")} className="tbh-display mt-1 block text-2xl text-[var(--tbh-neon)] [overflow-wrap:anywhere] hover:underline">
            {EMAIL}
          </a>
          <p className="mt-2 text-sm">
            Oggetto: <b className="[overflow-wrap:anywhere]">{OGGETTO} — [RUOLO SCELTO]</b>
          </p>
          <p className="mt-4 text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--tbh-gold)]">Indicare</p>
          <ul className="mt-2 grid gap-1.5">
            {DA_INDICARE.map((v) => (
              <li key={v} className="flex gap-2 text-sm">
                <Check size={16} className="mt-0.5 shrink-0 text-[var(--tbh-neon)]" />
                <span>{v}</span>
              </li>
            ))}
          </ul>
          <Link href={MODULO} className="tbh-neon-btn mt-5 inline-flex items-center gap-2 px-6 py-3">
            <Send size={18} /> Oppure candidati online
          </Link>
        </div>
        <div className="min-w-0 rounded-2xl border border-[var(--tbh-line)] bg-black/40 p-5">
          <Titoletto icona={<ArrowRight size={15} />}>Annunci e approfondimenti</Titoletto>
          <ul className="mt-3 grid gap-2">
            <li>
              <Link
                href="/lavoro-casting/bacheca/cerchiamo-videomaker"
                className="flex items-center gap-2 rounded-xl border border-[var(--tbh-line)] px-3 py-2.5 text-sm font-semibold hover:border-[var(--tbh-neon)]"
              >
                Annuncio Videomaker <ArrowRight size={14} className="ml-auto shrink-0" />
              </Link>
            </li>
            <li>
              <Link
                href="/lavoro-casting/bacheca/ricerca-videomaker-2026-2027"
                className="flex items-center gap-2 rounded-xl border border-[var(--tbh-line)] px-3 py-2.5 text-sm font-semibold hover:border-[var(--tbh-neon)]"
              >
                Ricerca Videomaker 2026–2027 <ArrowRight size={14} className="ml-auto shrink-0" />
              </Link>
            </li>
          </ul>
          <p className="tbh-display mt-6 text-lg">TOUCH BUSINESS HOLDING</p>
          <p className="text-sm italic text-[var(--tbh-muted)]">Produzione • Comunicazione • Intrattenimento • Media • Sport</p>
        </div>
      </div>
    </section>
  );
}
