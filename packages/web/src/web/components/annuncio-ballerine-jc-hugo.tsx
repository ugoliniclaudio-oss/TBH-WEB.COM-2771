/**
 * CASTING IN EVIDENZA — «CERCASI 4 BALLERINE — ENTRA NELLA CREW DI J.C. HUGÒ» (03/10/2026)
 *
 * Testo trascritto come lo ha consegnato Claudio, con la sua locandina ufficiale
 * (usata così com'è). Nessun dato aggiunto: niente date, niente compenso, niente
 * location precise — il testo dice che si concordano prima dell'adesione.
 *
 * «Messaggio privato»: il testo non indica un recapito specifico, quindi usiamo i
 * contatti centrali TBH (dal 06/10/2026 candidature solo a lavoro@tibihacca.com), con la
 * dicitura obbligatoria «CREW VIDEOCLIP J.C. HUGÒ» già scritta in testa al messaggio.
 *
 * Montato in bacheca lavoro e sulla pagina di J.C. Hugò (/musica/jc-hugo).
 */
import { useEffect, useRef, useState, type ReactNode } from "react";
import { Link } from "wouter";
import { GalleriaSlide, type Slide } from "./galleria-slide";
import {
  Megaphone,
  Mail,
  Music4,
  Search,
  MapPin,
  Clapperboard,
  Send,
  Share2,
  Check,
  ArrowRight,
  Users,
} from "lucide-react";

const ANCORA = "casting-ballerine-jc-hugo";
const EMAIL = "lavoro@tibihacca.com";
const BASE = "/lavoro/ballerine-jc-hugo";
const OGGETTO = "CREW VIDEOCLIP J.C. HUGÒ";

const FASI = ["Ascolto dei brani", "Creazione delle coreografie", "Prove", "Riprese"];
const STILI = ["Commercial", "Hip hop", "Modern", "Proposte creative"];
const LOCALITA = [
  "Rimini e Riviera Romagnola",
  "Valmarecchia",
  "San Marino",
  "Padova",
  "Milano",
  "Roma",
  "Sanremo",
];
const DA_INVIARE = [
  "nome, città e recapito;",
  "esperienza e stili di danza;",
  "un breve video di una tua performance;",
  "disponibilità per prove, riprese ed eventuali trasferte.",
];
/* Locandine ufficiali consegnate da Claudio (03/10/2026): la principale + 4 varianti social. */
const LOCANDINE: Slide[] = [
  { src: `${BASE}/locandina.jpg`, titolo: "Locandina completa — entra nella mia crew" },
  { src: `${BASE}/variante-1.jpg`, titolo: "Variante piazza" },
  { src: `${BASE}/variante-2.jpg`, titolo: "Variante studio" },
  { src: `${BASE}/variante-3.jpg`, titolo: "Variante sala prove" },
  { src: `${BASE}/variante-4.jpg`, titolo: "Variante palco" },
];

const HASHTAG = [
  "#JCHugò",
  "#CastingBallerine",
  "#DanceCrew",
  "#Videoclip",
  "#Coreografie",
  "#Danza",
  "#CastingItalia",
  "#TouchProduction",
];

const CORPO =
  `${OGGETTO}\n\nNome:\nCittà:\nRecapito:\n\nEsperienza e stili di danza:\n\n` +
  "Breve video di una mia performance (link o allegato):\n\n" +
  "Disponibilità per prove, riprese ed eventuali trasferte:\n";

const MAIL_CANDIDATURA = `mailto:${EMAIL}?subject=${encodeURIComponent(OGGETTO)}&body=${encodeURIComponent(CORPO)}`;

function Titoletto({ icona, children }: { icona: ReactNode; children: ReactNode }) {
  return (
    <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--tbh-neon)] flex items-center gap-2">
      {icona} {children}
    </h3>
  );
}

export function AnnuncioBallerineJcHugo({ linkPaginaArtista = true }: { linkPaginaArtista?: boolean }) {
  const sezione = useRef<HTMLElement>(null);
  const [copiato, setCopiato] = useState(false);

  /* Arrivando dal ticker con l'ancora la sezione è montata dopo il caricamento:
     il browser non trova l'ancora da solo, quindi scorriamo noi. */
  useEffect(() => {
    if (window.location.hash === `#${ANCORA}`) {
      sezione.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, []);

  /* «Condividi l'annuncio»: condivisione nativa dove c'è, altrimenti copia il link. */
  const condividi = async () => {
    const url = `${window.location.origin}/lavoro-casting/bacheca#${ANCORA}`;
    const titolo = "Cercasi 4 ballerine — entra nella crew di J.C. Hugò";
    try {
      if (navigator.share) {
        await navigator.share({ title: titolo, text: titolo, url });
        return;
      }
      await navigator.clipboard.writeText(`${titolo} ${url}`);
      setCopiato(true);
      setTimeout(() => setCopiato(false), 2500);
    } catch {
      /* condivisione annullata dall'utente: niente da fare */
    }
  };

  return (
    <section
      ref={sezione}
      id={ANCORA}
      data-annuncio="ballerine-jc-hugo"
      className="tbh-card p-5 md:p-8 mb-12 border-2 border-[var(--tbh-neon)] shadow-[0_0_40px_rgba(230,255,0,0.12)] scroll-mt-28 min-w-0"
    >
      <div className="flex flex-wrap items-center gap-2 mb-6">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--tbh-neon)] px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-black">
          <Megaphone size={13} /> In evidenza
        </span>
        <span className="rounded-full border border-[var(--tbh-neon)]/50 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-[var(--tbh-neon)]">
          Casting aperto
        </span>
        <span className="rounded-full border border-[var(--tbh-gold)]/60 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-[var(--tbh-gold)]">
          Danza · Videoclip
        </span>
        <span className="text-[11px] uppercase tracking-widest text-[var(--tbh-muted)]">
          Pubblicato il 03/10/2026
        </span>
      </div>

      {/* ── Testa: locandina ufficiale + titolo ── */}
      <div className="grid gap-8 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1fr)] items-start">
        <div className="min-w-0">
          <GalleriaSlide slide={LOCANDINE} nome="Cercasi 4 ballerine — J.C. Hugò" />
        </div>

        <div className="min-w-0">
          <p className="tbh-display text-base md:text-lg text-[var(--tbh-gold)] tracking-wide">
            🎬💃 Entra nella crew di J.C. Hugò
          </p>
          <h2 className="tbh-display tbh-h1 leading-[0.95] mt-2 [overflow-wrap:anywhere]">
            Cercasi <span className="text-[var(--tbh-neon)]">4 ballerine</span>
          </h2>

          <p className="tbh-display text-xl md:text-2xl mt-5">La mia musica cerca la vostra energia!</p>
          <p className="tbh-body mt-3">
            Sto formando una <b>crew di quattro ballerine</b> per creare coreografie originali e
            realizzare i videoclip dei miei brani: ritmo, personalità e lavoro di squadra saranno al
            centro del progetto.
          </p>

          {/* 🎶 IL PROGETTO */}
          <div className="mt-6 rounded-2xl border-2 border-[var(--tbh-neon)] bg-black/50 p-5">
            <Titoletto icona={<Music4 size={15} />}>🎶 Il progetto</Titoletto>
            <ol className="mt-3 flex flex-wrap items-center gap-2">
              {FASI.map((f, i) => (
                <li key={f} className="flex items-center gap-2">
                  <span className="rounded-full border border-[var(--tbh-neon)]/60 bg-black/40 px-3 py-1.5 text-sm font-semibold">
                    <span className="text-[var(--tbh-neon)] mr-1.5">{i + 1}</span>
                    {f}
                  </span>
                  {i < FASI.length - 1 && <ArrowRight size={15} className="text-[var(--tbh-muted)] shrink-0" />}
                </li>
              ))}
            </ol>
            <p className="tbh-body text-sm mt-3">
              Dall&apos;ascolto dei brani alla creazione delle coreografie, dalle prove alle riprese:
              realizzeremo videoclip per YouTube e contenuti per social e promozione delle uscite musicali
              sui digital store.
            </p>
          </div>

          <div className="flex flex-wrap gap-3 mt-6">
            <a
              href={MAIL_CANDIDATURA}
              className="tbh-neon-btn px-6 py-3 inline-flex items-center gap-2"
            >
              <Mail size={18} /> Candidati via e-mail
            </a>
          </div>
        </div>
      </div>

      {/* ── Chi cerco · località ── */}
      <div className="mt-10 grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-[var(--tbh-line)] bg-black/40 p-5 min-w-0">
          <Titoletto icona={<Search size={15} />}>🔎 Chi cerco</Titoletto>
          <p className="tbh-body text-sm mt-3">
            Ragazze con preparazione nella danza, senso del ritmo, espressività e presenza davanti alla
            telecamera. Sono benvenuti stili commercial, hip hop, modern e proposte creative.
          </p>
          <ul className="mt-3 flex flex-wrap gap-2">
            {STILI.map((s) => (
              <li key={s} className="rounded-full bg-[var(--tbh-neon)] px-3 py-1.5 text-sm font-bold text-black">
                {s}
              </li>
            ))}
          </ul>
          <p className="tbh-body text-sm mt-3">
            Puoi candidarti anche singolarmente: la crew verrà composta attraverso la selezione.
          </p>
          <p className="tbh-body text-sm mt-3 rounded-xl border border-[var(--tbh-gold)]/60 bg-black/40 px-3 py-2 flex gap-2">
            <Users size={18} className="mt-0.5 shrink-0 text-[var(--tbh-gold)]" />
            <span>
              <b className="text-[var(--tbh-gold)]">Cerco anche competenze coreografiche:</b> una delle quattro
              ballerine potrà coordinare le coreografie e le prove del gruppo.
            </span>
          </p>
        </div>

        <div className="rounded-2xl border border-[var(--tbh-line)] bg-black/40 p-5 min-w-0">
          <Titoletto icona={<MapPin size={15} />}>📍 Possibili località delle riprese</Titoletto>
          <ul className="mt-3 flex flex-wrap gap-2">
            {LOCALITA.map((l) => (
              <li
                key={l}
                className="rounded-full border border-[var(--tbh-gold)]/70 px-3 py-1.5 text-sm font-semibold text-[var(--tbh-gold)]"
              >
                {l}
              </li>
            ))}
          </ul>
          <p className="tbh-body text-sm mt-3">
            Presso sedi e filiali TBH o location selezionate. Non è richiesta la presenza in tutte le città:
            disponibilità e trasferte saranno concordate per ogni produzione.
          </p>
          <p className="tbh-body text-sm mt-3 flex gap-2 text-[var(--tbh-muted)]">
            <Clapperboard size={18} className="mt-0.5 shrink-0 text-[var(--tbh-neon)]" />
            <span>
              🎥 La crew lavorerà con la produzione per preparazione artistica, regia, riprese e montaggio
              dei videoclip.
            </span>
          </p>
        </div>
      </div>

      {/* ── Come candidarti ── */}
      <div className="mt-4 rounded-2xl border-2 border-[var(--tbh-gold)]/70 bg-black/40 p-5 md:p-6">
        <p className="tbh-display text-xl flex items-center gap-2">
          <Send size={20} className="text-[var(--tbh-neon)]" /> 📩 Come candidarti
        </p>
        <p className="tbh-body text-sm mt-2">Invia un messaggio privato con:</p>
        <ul className="mt-3 grid gap-2 sm:grid-cols-2">
          {DA_INVIARE.map((d) => (
            <li key={d} className="flex gap-2 tbh-body text-sm">
              <Check size={18} className="shrink-0 text-[var(--tbh-neon)]" /> {d}
            </li>
          ))}
        </ul>
        <p className="mt-4 rounded-xl bg-[var(--tbh-neon)] px-4 py-3 text-sm md:text-base font-bold text-black">
          Scrivi nell&apos;oggetto o all&apos;inizio del messaggio: “{OGGETTO}”.
        </p>
        <p className="text-xs text-[var(--tbh-muted)] mt-2">
          I pulsanti qui sotto aprono il messaggio con la dicitura già scritta.
        </p>

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

        <p className="tbh-body text-sm text-[var(--tbh-muted)] mt-5">
          Calendario, compenso, eventuali rimborsi e condizioni di collaborazione e utilizzo delle immagini
          saranno concordati prima dell&apos;adesione.
        </p>
      </div>

      {/* ── Chiusura, firma, condivisione ── */}
      <div className="mt-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="min-w-0">
          <p className="tbh-display text-xl md:text-2xl">
            🔥 Hai ritmo e voglia di costruire un progetto musicale insieme?{" "}
            <span className="text-[var(--tbh-neon)]">Fatti avanti!</span>
          </p>
          <p className="tbh-display text-base text-[var(--tbh-gold)] mt-3 tracking-wide">
            J.C. Hugò — DJ • VJ • Producer • Editore
          </p>
          <p className="text-sm text-[var(--tbh-muted)] mt-2">
            Condividi l&apos;annuncio con ballerine, coreografe e scuole di danza.
          </p>
          <p className="text-xs text-[var(--tbh-gold)]/80 mt-2 [overflow-wrap:anywhere]">{HASHTAG.join(" ")}</p>
        </div>
        <div className="flex flex-wrap gap-3 shrink-0">
          <button
            type="button"
            onClick={condividi}
            className="px-5 py-3 rounded-full border border-[var(--tbh-neon)]/60 font-semibold inline-flex items-center gap-2 hover:bg-[var(--tbh-neon)] hover:text-black"
          >
            {copiato ? <Check size={18} /> : <Share2 size={18} />} {copiato ? "Link copiato" : "Condividi l'annuncio"}
          </button>
          {linkPaginaArtista && (
            <Link
              href="/musica/jc-hugo"
              className="px-5 py-3 rounded-full border border-[var(--tbh-line)] font-semibold inline-flex items-center gap-2 hover:border-[var(--tbh-neon)]"
            >
              <Music4 size={18} /> Scopri J.C. Hugò
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
