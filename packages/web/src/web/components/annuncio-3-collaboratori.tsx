/**
 * ANNUNCIO IN EVIDENZA — «CERCHIAMO 3 NUOVI COLLABORATORI» (02/10/2026)
 *
 * Testo e locandine consegnati da Claudio: niente riscritto, niente aggiunto.
 * Non ci sono sede, compenso o scadenza perché nell'annuncio non ci sono: non li inventiamo.
 * Candidature (06/10/2026): solo lavoro@tibihacca.com — WhatsApp non è più un canale di candidatura.
 * La candidatura parte già con il ruolo scritto, come chiede l'annuncio
 * («indicando COMMERCIALE oppure VIDEOMAKER»).
 */
import { useEffect, useRef } from "react";
import {
  Briefcase,
  Video,
  Mail,
  ChevronLeft,
  ChevronRight,
  Target,
  Check,
  Megaphone,
} from "lucide-react";
import { CLASSE_FRECCIA_FILA, useFilaScorrevole } from "./carosello-orizzontale";

const EMAIL = "lavoro@tibihacca.com";
const BASE = "/lavoro/3-collaboratori";

const LOCANDINA = { src: `${BASE}/entra-nel-team.jpg`, w: 1145, h: 1374 };

/** Le altre quattro locandine ufficiali, scorrevoli in orizzontale. */
const GALLERIA = [
  { src: `${BASE}/3-nuovi-collaboratori.jpg`, alt: "Cerchiamo 3 nuovi collaboratori" },
  { src: `${BASE}/2-ragazze-commerciale.jpg`, alt: "Cerchiamo 2 ragazze area commerciale" },
  { src: `${BASE}/1-videomaker.jpg`, alt: "Cerchiamo 1 videomaker" },
  { src: `${BASE}/crew.jpg`, alt: "Diventa parte della crew" },
];

type Ruolo = "COMMERCIALE" | "VIDEOMAKER";

const POSIZIONI: {
  ruolo: Ruolo;
  quanti: string;
  titolo: string;
  testo: string;
  extra?: string[];
  icona: typeof Briefcase;
  colore: string;
}[] = [
  {
    ruolo: "COMMERCIALE",
    quanti: "2",
    titolo: "Ragazze – Area Commerciale",
    testo:
      "Contatto clienti, sviluppo commerciale, appuntamenti, sponsorizzazioni e nuove collaborazioni.",
    icona: Briefcase,
    colore: "#ff2f8e",
  },
  {
    ruolo: "VIDEOMAKER",
    quanti: "1",
    titolo: "Operatore/Operatrice Videomaker",
    testo: "Riprese di partite, interviste, eventi, backstage e produzioni video.",
    extra: ["con o senza esperienza di montaggio", "con o senza attrezzatura propria"],
    icona: Video,
    colore: "#2f8bff",
  },
];

function mailRuolo(ruolo: Ruolo) {
  const oggetto = `Candidatura ${ruolo} — Cerchiamo 3 nuovi collaboratori`;
  const corpo =
    `Ruolo: ${ruolo}\n\nBreve presentazione:\n\n\n` +
    "(Allego il mio CV)";
  return `mailto:${EMAIL}?subject=${encodeURIComponent(oggetto)}&body=${encodeURIComponent(corpo)}`;
}

export function AnnuncioTreCollaboratori() {
  /* 29/10/2026 (round 15) — frecce sempre visibili (anche da telefono), spente ai limiti, tastiera */
  const { ref: striscia, prima, dopo, scorri, tastiera } = useFilaScorrevole();
  const sezione = useRef<HTMLElement>(null);
  /* Arrivando dal ticker (…/bacheca#cerchiamo-3-collaboratori) la pagina è montata dopo il
     caricamento, quindi il browser non trova l'ancora da solo: scorriamo noi. */
  useEffect(() => {
    if (window.location.hash === "#cerchiamo-3-collaboratori") {
      sezione.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, []);

  return (
    <section
      ref={sezione}
      id="cerchiamo-3-collaboratori"
      data-annuncio="3-collaboratori"
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

      <div className="grid gap-8 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1fr)] items-start">
        {/* Locandina principale, intera: mai ritagliata. */}
        <a href={LOCANDINA.src} target="_blank" rel="noreferrer" className="block min-w-0">
          <img
            src={LOCANDINA.src}
            alt="Entra nel nostro team — Touch Business Holding cerca commerciali e videomaker"
            width={LOCANDINA.w}
            height={LOCANDINA.h}
            className="w-full h-auto rounded-2xl border border-[var(--tbh-line)]"
          />
        </a>

        <div className="min-w-0">
          <h2 className="tbh-display tbh-h1 leading-[0.95] [overflow-wrap:anywhere]">
            Cerchiamo <span className="text-[var(--tbh-neon)]">3 nuovi</span> collaboratori
          </h2>
          <p className="tbh-display text-base md:text-lg text-[var(--tbh-gold)] mt-3 tracking-wide">
            Commerciale • Video • Media • Sport • Eventi
          </p>

          <p className="tbh-display text-xl mt-6 flex items-center gap-2">
            <Target size={22} className="text-[var(--tbh-neon)]" /> Entra nel nostro team
          </p>
          <p className="tbh-body text-[var(--tbh-muted)] mt-2">
            Per nuove attività nel settore media, comunicazione, sport, eventi e produzioni
            audiovisive cerchiamo:
          </p>

          <div className="grid gap-4 mt-5">
            {POSIZIONI.map((p) => (
              <article
                key={p.ruolo}
                className="min-w-0 rounded-2xl border bg-black/40 p-4 sm:p-5"
                style={{ borderColor: `${p.colore}88` }}
              >
                <div className="flex items-center gap-3">
                  <span
                    className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-white"
                    style={{ background: p.colore }}
                  >
                    <p.icona size={24} />
                  </span>
                  {/* «Operatore/Operatrice» è una parola sola per il browser: sul telefono
                      sfondava la card. Il punto di a capo dopo la barra lo evita. */}
                  <h3 className="min-w-0 tbh-display text-lg sm:text-xl md:text-2xl leading-tight [overflow-wrap:anywhere]">
                    <span className="text-[var(--tbh-neon)]">{p.quanti}</span>{" "}
                    {p.titolo.replace("/", "/" + String.fromCharCode(8203))}
                  </h3>
                </div>
                <p className="tbh-body text-[var(--tbh-muted)] mt-3">{p.testo}</p>
                {p.extra && (
                  <>
                    <p className="text-sm font-semibold mt-3">Per il ruolo video valutiamo candidati:</p>
                    <ul className="mt-1 space-y-1">
                      {p.extra.map((x) => (
                        <li key={x} className="flex gap-2 text-sm text-[var(--tbh-muted)]">
                          <Check size={16} className="mt-0.5 shrink-0 text-[var(--tbh-neon)]" /> {x}
                        </li>
                      ))}
                    </ul>
                  </>
                )}
                <div className="flex flex-wrap gap-2 mt-4">
                  <a
                    href={mailRuolo(p.ruolo)}
                    className="tbh-neon-btn px-4 py-2.5 text-sm inline-flex items-center gap-2"
                  >
                    <Mail size={16} /> Candidati · {p.ruolo}
                  </a>
                </div>
              </article>
            ))}
          </div>

          <p className="tbh-body mt-6">
            Cerchiamo soprattutto <b>serietà, disponibilità, capacità di lavorare con le persone</b>{" "}
            e <b>voglia di crescere sul campo</b>.
          </p>

          <div className="mt-6 rounded-2xl border border-[var(--tbh-gold)]/60 bg-black/40 p-5">
            <p className="tbh-display text-lg flex items-center gap-2">
              <Mail size={20} className="text-[var(--tbh-gold)]" /> Invia CV e breve presentazione
            </p>
            <p className="tbh-body text-sm text-[var(--tbh-muted)] mt-1">
              indicando <b className="text-white">COMMERCIALE</b> oppure{" "}
              <b className="text-white">VIDEOMAKER</b>.
            </p>
            <p className="text-sm mt-3">
              <a href={`mailto:${EMAIL}`} className="text-[var(--tbh-neon)] underline">
                {EMAIL}
              </a>
            </p>
          </div>
        </div>
      </div>

      {/* Le altre locandine ufficiali: striscia orizzontale (frecce desktop, swipe mobile). */}
      <div className="mt-8">
        <div className="flex items-center justify-between gap-3 mb-3">
          <p className="text-xs uppercase tracking-[0.25em] text-[var(--tbh-gold)]">
            Le locandine dell'annuncio
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => scorri(-1)}
              aria-label="Locandina precedente"
              disabled={!prima}
              className={CLASSE_FRECCIA_FILA}
            >
              <ChevronLeft size={18} />
            </button>
            <button
              type="button"
              onClick={() => scorri(1)}
              aria-label="Locandina successiva"
              disabled={!dopo}
              className={CLASSE_FRECCIA_FILA}
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
        <div
          ref={striscia}
          role="group"
          aria-label="Locandine dell'annuncio"
          tabIndex={0}
          onKeyDown={tastiera}
          className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-2 outline-none [scrollbar-width:thin] focus-visible:ring-1 focus-visible:ring-[var(--tbh-neon)]"
        >
          {GALLERIA.map((g) => (
            <a
              key={g.src}
              href={g.src}
              target="_blank"
              rel="noreferrer"
              className="snap-start shrink-0 w-[78%] sm:w-[46%] lg:w-[calc(25%-12px)]"
            >
              <img
                src={g.src}
                alt={g.alt}
                width={1254}
                height={1254}
                loading="lazy"
                className="w-full aspect-square object-contain rounded-2xl border border-[var(--tbh-line)] bg-black"
              />
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
