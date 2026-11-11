import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "wouter";
import { ArrowRight, ChevronLeft, ChevronRight, LayoutGrid, X } from "lucide-react";
import { CANALI as CANALI_LIVE, type Canale, type ContenutoCanale } from "../lib/palinsesto";
import { FilaTessere, RiquadroLogo, TesseraLogo } from "../components/tessera-logo";
import { ANTEPRIME_BRAND, ANTEPRIME_STEMMI, LOGO_CANALE } from "../lib/anteprime-reali";

/* ────────────────────────────────────────────────────────────────────────────
   BOZZA «CHECK WEB» — SECONDA STESURA, 06/09/2026.

   La prima stesura è stata bocciata da Claudio: era una pagina VERTICALE con le
   sezioni sviluppate nel footer. Non era quello che aveva chiesto.

   Quello che ha chiesto, alla lettera:
     · UNA PAGINA SOLA A RULLO;
     · si passa da un canale all'altro DIRETTO;
     · oppure si sceglie fra le 24 IMMAGINI dei canali quale aprire.

   Quindi qui non c'è nessun elenco verticale e nessun footer: c'è un rullo di
   24 schermate intere, una per canale, che scorre in orizzontale col dito, con
   le frecce o con la tastiera, più il MOSAICO delle 24 caselle per saltare
   diretto a quella che serve.

   Vive su /check-web: la home vera non viene toccata (regola 0 di
   docs/regole-ferree.md). Le immagini dei canali non ci sono ancora: al loro
   posto c'è lo SLOT numerato, non una foto finta (regola sui contenuti).
   ──────────────────────────────────────────────────────────────────────────── */

/* PROPOSTA TELECOMANDO + «TBH Lavoro» (06/10/2026) — SOLO IN BOZZA SU /check-web.
   La home vera e il menu non cambiano finché Claudio non approva:
   · la vetrina dei canali si chiama TELECOMANDO;
   · il canale del lavoro diventa «TBH Lavoro» e apre DIRETTO la bacheca
     (https://www.tbh-web.com/lavoro-casting/bacheca); tutta la scheda è cliccabile:
     immagine, titolo e pulsante;
   · il canale casting porta a /casting (prima puntava per errore alla bacheca). */
/* PROPOSTA PALINSESTO 24/7 (14/10/2026) — SOLO IN BOZZA SU /check-web.
   TOUCH MUSIC RADIO TV vuole il palinsesto raggiungibile con UN clic dalla home e dal menu:
   · pulsante giallo fisso «PALINSESTO 24/7» nella barra del Telecomando → /radio/palinsesto;
   · nel canale DJ J.C. HUGÒ e nel canale con «TV, radio e streaming» la prima voce diventa
     «TOUCH MUSIC RADIO TV — Palinsesto 24/7» → /radio.
   La home vera e il menu restano invariati finché Claudio non approva. */
/* AGGIORNAMENTO 15/10/2026 — TBH è il gruppo, TOUCH RADIO e TOUCH TV sono due canali distinti,
   TOUCH MUSIC è una RUBRICA. La voce unica «TOUCH MUSIC RADIO TV» diventa due voci, una per canale,
   più le rubriche. Anteprima dei loghi dei canali e bozza del carosello «SEGUI LA DIRETTA ORA»
   su /check-web/loghi-canali. */
const VOCI_RADIO: ContenutoCanale[] = [
  {
    etichetta: "TOUCH RADIO",
    titolo: "TOUCH RADIO — Ascolta la diretta · Palinsesto 24/7",
    url: "/radio",
    descrizione: "Canale audio del gruppo TBH: ora in onda, a seguire, palinsesto di oggi e della settimana.",
    badge: ["TBH"],
    esposizione: "prioritario",
    stato: "attivo",
    inHome: true,
  },
  {
    etichetta: "TOUCH TV",
    titolo: "TOUCH TV — Guarda la diretta · Palinsesto 24/7",
    url: "/tv",
    descrizione: "Canale video del gruppo TBH: spot, visual ufficiali e dirette DM a schermo.",
    badge: ["TBH"],
    esposizione: "prioritario",
    stato: "attivo",
    inHome: true,
  },
  {
    etichetta: "Rubriche",
    titolo: "RUBRICHE — TOUCH MUSIC · DM ON AIR · DM HIGHLIGHTS",
    url: "/rubriche",
    descrizione: "Le rubriche in onda sui due canali: orari, contenuti, anteprima e archivio.",
    badge: ["TBH"],
    esposizione: "prioritario",
    stato: "attivo",
    inHome: true,
  },
];

/* PROPOSTA TBH SPORT · LE 4 ESPERIENZE (15/10/2026) — SOLO IN BOZZA SU /check-web.
   Nel canale TOUCH SPORTS la prima voce diventa «TBH SPORT — Le 4 esperienze» → /sport/esperienze.
   /sport (i quattro grandi accessi) e il menu restano invariati finché Claudio non approva. */
const VOCE_ESPERIENZE_SPORT: ContenutoCanale = {
  etichetta: "TBH Sport",
  titolo: "TBH SPORT — Le 4 esperienze per il tuo club",
  url: "/sport/esperienze",
  descrizione: "Essential, Connect, Media Pro, Arena: piani, servizi e prezzi per società sportive.",
  badge: ["TBH"],
  esposizione: "prioritario",
  stato: "attivo",
  inHome: true,
};

const CANALI: Canale[] = CANALI_LIVE.map((c) => {
  if (c.numero === 11) return { ...c, programmazione: [VOCE_ESPERIENZE_SPORT, ...c.programmazione] };
  if (c.numero === 23 || c.programmazione.some((p) => p.url === "/media/streaming"))
    return { ...c, programmazione: [...VOCI_RADIO, ...c.programmazione] };
  if (c.numero === 15)
    return {
      ...c,
      nome: "TBH Lavoro",
      funzione: "TBH Lavoro — Bacheca annunci: Opportunità TBH in cima, poi offerte di fonti esterne, filtri per zona e settore.",
      url: "/lavoro-casting/bacheca",
      programmazione: [
        { ...c.programmazione[0], titolo: "TBH Lavoro — Bacheca annunci", url: "/lavoro-casting/bacheca" },
        ...c.programmazione.filter((p) => p.url !== "/cremona-circuit-2026" && p.url !== "/lavoro-casting"),
      ],
    };
  if (c.numero === 16)
    return {
      ...c,
      funzione: "Casting videoclip, cinema, TV e reality: selezioni aperte e candidature.",
      url: "/casting",
      programmazione: c.programmazione.map((p) =>
        p.url === "/lavoro-casting/bacheca" ? { ...p, titolo: "Casting aperti", url: "/casting", descrizione: "Selezioni aperte delle produzioni TBH." } : p,
      ),
    };
  return c;
});

export default function CheckWebPage() {
  const rullo = useRef<HTMLDivElement>(null);
  const [indice, setIndice] = useState(0);
  const [mosaico, setMosaico] = useState(false);
  const [altezza, setAltezza] = useState<number>(0);

  const totale = CANALI.length;

  // Il rullo occupa lo schermo meno la testata: nessuna pagina da scorrere sotto.
  useEffect(() => {
    const misura = () => {
      const h = document.querySelector("header")?.getBoundingClientRect().height ?? 0;
      setAltezza(Math.max(320, window.innerHeight - h));
    };
    misura();
    window.addEventListener("resize", misura);
    return () => window.removeEventListener("resize", misura);
  }, []);

  const vai = useCallback((i: number, morbido = true) => {
    const el = rullo.current;
    if (!el) return;
    const n = Math.max(0, Math.min(CANALI.length - 1, i));
    el.scrollTo({ left: n * el.clientWidth, behavior: morbido ? "smooth" : "instant" });
    setIndice(n);
  }, []);

  // Frecce della tastiera: da computer si cambia canale senza toccare il mouse.
  useEffect(() => {
    const tasto = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") vai(indice + 1);
      if (e.key === "ArrowLeft") vai(indice - 1);
      if (e.key === "Escape") setMosaico(false);
    };
    window.addEventListener("keydown", tasto);
    return () => window.removeEventListener("keydown", tasto);
  }, [indice, vai]);

  const canale = CANALI[indice];

  return (
    <div className="bg-[var(--tbh-black)] overflow-hidden" style={altezza ? { height: altezza } : undefined}>
      {/* ── BARRA DI CANALE: numero, nome, mosaico, frecce ─────────────────── */}
      <div className="border-b border-[var(--tbh-line)] bg-black/80 backdrop-blur">
        <div className="mx-auto max-w-[1500px] px-3 md:px-6 h-[52px] flex items-center gap-2 md:gap-4">
          <button
            type="button"
            onClick={() => setMosaico(true)}
            aria-label="Apri il Telecomando: tutti i canali"
            className="inline-flex items-center gap-2 rounded-xl border border-[var(--tbh-line)] px-3 py-2 text-[11px] font-bold tracking-[0.14em] hover:border-[var(--tbh-neon)] hover:text-[var(--tbh-neon)] shrink-0"
          >
            <LayoutGrid size={15} />
            <span className="hidden sm:inline">TELECOMANDO</span>
          </button>

          <div className="min-w-0 grow text-center">
            <p className="text-[10px] uppercase tracking-[0.22em] text-[var(--tbh-muted)] truncate">
              {canale?.categoria}
            </p>
            <p className="text-xs md:text-sm font-bold truncate" style={{ color: canale?.colore }}>
              CANALE {canale?.numero} · {canale?.nome}
            </p>
          </div>

          <Link
            to="/radio/palinsesto"
            className="inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-[11px] font-extrabold tracking-[0.1em] text-black shrink-0"
            style={{ background: "#d7ff00" }}
            data-testid="check-web-palinsesto"
          >
            <LayoutGrid size={14} />
            <span>PALINSESTO 24/7</span>
          </Link>

          <div className="flex items-center gap-1.5 shrink-0">
            <span className="hidden md:inline text-[11px] text-[var(--tbh-muted)] tabular-nums mr-1">
              {indice + 1}/{totale}
            </span>
            <button
              type="button"
              onClick={() => vai(indice - 1)}
              disabled={indice === 0}
              aria-label="Canale precedente"
              className="rounded-xl border border-[var(--tbh-line)] p-2 hover:border-[var(--tbh-neon)] hover:text-[var(--tbh-neon)] disabled:opacity-30"
            >
              <ChevronLeft size={17} />
            </button>
            <button
              type="button"
              onClick={() => vai(indice + 1)}
              disabled={indice === totale - 1}
              aria-label="Canale successivo"
              className="rounded-xl border border-[var(--tbh-line)] p-2 hover:border-[var(--tbh-neon)] hover:text-[var(--tbh-neon)] disabled:opacity-30"
            >
              <ChevronRight size={17} />
            </button>
          </div>
        </div>
      </div>

      {/* ── IL RULLO: 24 schermate intere, una per canale ───────────────────── */}
      <div
        ref={rullo}
        onScroll={(e) => {
          const el = e.currentTarget;
          const n = Math.round(el.scrollLeft / Math.max(1, el.clientWidth));
          if (n !== indice) setIndice(n);
        }}
        className="flex overflow-x-auto overflow-y-hidden snap-x snap-mandatory scroll-smooth"
        style={{ height: `calc(100% - 52px)`, scrollbarWidth: "none" }}
      >
        {CANALI.map((c, i) => (
          <section
            key={c.numero}
            className="snap-center shrink-0 w-full h-full overflow-y-auto"
            aria-label={`Canale ${c.numero} ${c.nome}`}
          >
            <div className="mx-auto max-w-[1500px] h-full px-4 md:px-8 py-5 md:py-8 grid gap-5 md:gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] items-center">
              {/* SLOT DEL CANALE.
                  · canale 0: la VETRINA di ciò che abbiamo davvero — ogni link
                    porta la sua anteprima (marchio del gruppo o stemma), tutte
                    nello stesso riquadro standard e sulla stessa linea;
                  · gli altri: il marchio vero del canale quando esiste, altrimenti
                    lo slot numerato. Nessun logo prestato da un'altra società,
                    nessuna foto finta. */}
              {i === 0 ? (
                <div
                  className="relative rounded-3xl border overflow-y-auto p-3 md:p-4 min-h-[200px] md:min-h-[300px] lg:h-[78%]"
                  style={{
                    borderColor: c.colore,
                    background: `linear-gradient(140deg, ${c.colore}1f, transparent 60%)`,
                    boxShadow: `0 0 60px -30px ${c.colore}`,
                  }}
                >
                  <p className="text-[10px] uppercase tracking-[0.22em] text-[var(--tbh-muted)]">
                    Anteprime reali · marchi del gruppo e stemmi delle squadre
                  </p>
                  <div className="mt-3">
                    <FilaTessere>
                      {[...ANTEPRIME_BRAND, ...ANTEPRIME_STEMMI].map((a) => (
                        <TesseraLogo
                          key={a.src + a.to}
                          src={a.src}
                          titolo={a.titolo}
                          sottotitolo={a.sottotitolo}
                          to={a.to}
                          colore={a.colore}
                          misura="sm"
                        />
                      ))}
                    </FilaTessere>
                  </div>
                </div>
              ) : (
                <Link
                  to={c.url}
                  aria-label={`Apri ${c.nome}`}
                  className="relative rounded-3xl border overflow-hidden flex flex-col items-center justify-center min-h-[180px] md:min-h-[300px] lg:h-[62%] transition hover:brightness-125"
                  style={{
                    borderColor: c.colore,
                    background: `linear-gradient(140deg, ${c.colore}1f, transparent 60%)`,
                    boxShadow: `0 0 60px -30px ${c.colore}`,
                  }}
                >
                  {LOGO_CANALE[c.numero] ? (
                    <>
                      <RiquadroLogo
                        src={LOGO_CANALE[c.numero]}
                        alt={c.nome}
                        misura="lg"
                        colore={c.colore}
                      />
                      <span className="mt-3 text-[10px] uppercase tracking-[0.24em] text-[var(--tbh-muted)] text-center px-4">
                        Marchio ufficiale · canale {c.numero}
                      </span>
                    </>
                  ) : (
                    <>
                      <span
                        className="tbh-display leading-none text-[64px] md:text-[110px]"
                        style={{ color: c.colore }}
                      >
                        {c.numero}
                      </span>
                      <span className="mt-2 text-[10px] uppercase tracking-[0.24em] text-[var(--tbh-muted)] text-center px-4">
                        Immagine del canale — in allestimento
                      </span>
                    </>
                  )}
                </Link>
              )}

              {/* TESTO DEL CANALE: categoria sopra il nome, poi cosa contiene. */}
              <div className="min-w-0">
                <p className="text-[10px] md:text-xs uppercase tracking-[0.24em] text-[var(--tbh-muted)]">
                  {c.categoria}
                </p>
                <h2
                  className="tbh-h1 mt-1 leading-[1.05] break-words"
                  style={{ color: c.colore }}
                >
                  <Link to={c.url} className="hover:brightness-125">
                    {c.nome}
                  </Link>
                </h2>
                <p className="tbh-body mt-3 text-[var(--tbh-muted)] max-w-[62ch]">{c.funzione}</p>

                <div className="mt-4 flex flex-wrap gap-2">
                  {c.programmazione.slice(0, 6).map((p) => (
                    <Link
                      key={p.url + p.titolo}
                      to={p.url}
                      className="rounded-full border border-[var(--tbh-line)] px-3 py-1.5 text-[11px] hover:border-[var(--tbh-neon)] hover:text-[var(--tbh-neon)] max-w-full truncate"
                    >
                      {p.titolo}
                    </Link>
                  ))}
                  {c.programmazione.length === 0 && (
                    <span className="text-[11px] text-[var(--tbh-muted)]">In allestimento</span>
                  )}
                </div>

                <div className="mt-5 flex flex-wrap items-center gap-2.5">
                  <Link to={c.url} className="tbh-neon-btn px-5 py-3 text-sm inline-flex items-center gap-2">
                    ENTRA NEL CANALE <ArrowRight size={16} />
                  </Link>
                  {i < totale - 1 && (
                    <button
                      type="button"
                      onClick={() => vai(i + 1)}
                      className="rounded-xl border border-[var(--tbh-line)] px-4 py-3 text-xs hover:border-[var(--tbh-neon)] hover:text-[var(--tbh-neon)]"
                    >
                      CANALE {CANALI[i + 1]?.numero} →
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setMosaico(true)}
                    className="rounded-xl border border-[var(--tbh-line)] px-4 py-3 text-xs hover:border-[var(--tbh-neon)] hover:text-[var(--tbh-neon)]"
                  >
                    TUTTI I 24
                  </button>
                </div>
              </div>
            </div>
          </section>
        ))}
      </div>

      {/* ── MOSAICO: le 24 caselle, si sceglie e si va diretti ──────────────── */}
      {mosaico && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur overflow-y-auto">
          <div className="mx-auto max-w-[1500px] px-4 md:px-8 py-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-[10px] uppercase tracking-[0.24em] text-[var(--tbh-muted)]">
                  I {totale} canali di TBH-WEB
                </p>
                <h2 className="tbh-h2">TELECOMANDO</h2>
              </div>
              <button
                type="button"
                onClick={() => setMosaico(false)}
                aria-label="Chiudi il mosaico"
                className="rounded-xl border border-[var(--tbh-line)] p-2.5 hover:border-[var(--tbh-neon)] hover:text-[var(--tbh-neon)]"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mt-5 grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
              {CANALI.map((c, i) => (
                <button
                  key={c.numero}
                  type="button"
                  onClick={() => {
                    setMosaico(false);
                    vai(i, false);
                  }}
                  className={`text-left rounded-2xl border p-3 transition hover:-translate-y-0.5 ${
                    i === indice ? "bg-white/5" : "bg-black/40"
                  }`}
                  style={{ borderColor: i === indice ? c.colore : "var(--tbh-line)" }}
                >
                  <div
                    className="rounded-xl h-16 md:h-20 flex items-center justify-center gap-2"
                    style={{ background: `linear-gradient(140deg, ${c.colore}26, transparent 70%)` }}
                  >
                    {LOGO_CANALE[c.numero] ? (
                      <RiquadroLogo
                        src={LOGO_CANALE[c.numero]}
                        alt={c.nome}
                        misura="sm"
                        colore={c.colore}
                      />
                    ) : (
                      <span className="tbh-display text-[26px] md:text-[32px] leading-none" style={{ color: c.colore }}>
                        {c.numero}
                      </span>
                    )}
                  </div>
                  <p className="mt-2 text-[9px] uppercase tracking-[0.2em] text-[var(--tbh-muted)] truncate">
                    {c.categoria}
                  </p>
                  <p className="text-[11px] font-bold leading-tight break-words">{c.nome}</p>
                </button>
              ))}
            </div>

            <p className="mt-5 text-[11px] text-[var(--tbh-muted)]">
              Sei canali su {totale} hanno già il loro marchio ufficiale e lo mostrano. Gli altri
              tengono lo slot numerato: non ci mettiamo il logo di un'altra società. Appena arrivano
              i visual ufficiali prendono il posto dello slot, senza toccare la struttura.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
