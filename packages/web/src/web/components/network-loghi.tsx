/* ============================================================================
   NON MONTATO — 28/09/2026, audit doppioni (BLOCCO 1).

   Questo componente NON è usato da nessuna pagina del sito: nessun file lo
   importa. Era un vecchio hero della home (logo master al centro, marchi
   intorno) sostituito dalla home attuale. Non viene cancellato: non si buttano
   via contenuti senza una decisione di Claudio.

   Da decidere: se riportarlo in vita (per esempio dentro /network/partner o
   /network/sponsor) oppure archiviarlo. Finché resta così, non si vede in rete.
   ============================================================================ */
import { Link } from "wouter";
import { LOGHI_TBH, LOGO_TBH, NOTA_LOGHI } from "../lib/loghi-tbh";
import { urlVariante } from "./logo-box";

/** NETWORK DEI LOGHI — hero della home.
 *  Il logo MASTER TBH al centro, i marchi ufficiali del gruppo intorno, collegati da linee.
 *  Regole: si usano SOLO i file loghi realmente consegnati da Claudio (nessun logo ridisegnato),
 *  e ogni logo apre una pagina INTERNA del portale (mai un bottone morto, mai un sito esterno). */

const RAGGIO_X = 42; // % — ellisse orizzontale
const RAGGIO_Y = 36; // % — ellisse verticale

export default function NetworkLoghi() {
  const loghi = LOGHI_TBH.filter((l) => l.slug !== "touch-business-holding");
  const n = loghi.length;

  const punti = loghi.map((l, i) => {
    const a = (i / n) * Math.PI * 2 - Math.PI / 2;
    return {
      ...l,
      x: 50 + Math.cos(a) * RAGGIO_X,
      y: 50 + Math.sin(a) * RAGGIO_Y,
    };
  });

  return (
    <section className="relative mx-auto max-w-[1500px] px-4 md:px-8 pt-8">
      <div className="tbh-card relative overflow-hidden p-5 md:p-8">
        <p className="text-xs tracking-[0.28em] uppercase text-[var(--tbh-gold)] mb-1">
          Visibilità senza confini.
        </p>
        <h2 className="tbh-display text-xl md:text-2xl mb-1">Il network Touch Business Holding</h2>
        <p className="tbh-body text-sm text-[var(--tbh-muted)] mb-4 max-w-3xl">
          Tocca un marchio: si apre la sua sezione dentro il portale. Loghi ufficiali del gruppo,
          nessun logo ridisegnato.
        </p>

        {/* Rete: visibile da smartphone a TV. Su mobile diventa griglia, senza linee. */}
        <div className="relative hidden md:block h-[420px] lg:h-[520px]">
          <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            {punti.map((p) => (
              <line
                key={p.slug}
                x1="50"
                y1="50"
                x2={p.x}
                y2={p.y}
                stroke={p.colore}
                strokeWidth="0.18"
                opacity="0.5"
              />
            ))}
          </svg>

          {/* Centro: logo MASTER */}
          <Link
            to="/tbh/societa"
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 group"
            aria-label="Touch Business Holding"
          >
            <span
              className="block rounded-full p-3 border"
              style={{
                borderColor: "#d7ff00",
                boxShadow: "0 0 40px rgba(215,255,0,0.35)",
                background: "rgba(0,0,0,0.75)",
              }}
            >
              <img
                src={LOGO_TBH}
                alt="Touch Business Holding"
                className="h-24 w-24 lg:h-32 lg:w-32 object-contain"
                loading="eager"
              />
            </span>
          </Link>

          {punti.map((p) => (
            <Link
              key={p.slug}
              to={p.to}
              className="absolute z-10 -translate-x-1/2 -translate-y-1/2 text-center"
              style={{ left: `${p.x}%`, top: `${p.y}%` }}
              title={p.nome}
            >
              <span
                className="mx-auto flex h-16 w-16 lg:h-20 lg:w-20 items-center justify-center rounded-2xl border bg-black/80"
                style={{ borderColor: p.colore, boxShadow: `0 0 18px ${p.colore}44` }}
              >
                <img src={urlVariante(p.file, "icona-standard")} alt={p.nome} className="h-12 w-12 lg:h-16 lg:w-16 object-contain" />
              </span>
              <span
                className="mt-1 block max-w-[150px] text-[11px] lg:text-xs font-semibold leading-tight"
                style={{ color: p.colore }}
              >
                {p.nome}
              </span>
            </Link>
          ))}
        </div>

        {/* Versione smartphone: griglia grande, leggibile senza zoom */}
        <div className="md:hidden">
          <Link
            to="/tbh/societa"
            className="mb-4 flex items-center gap-3 rounded-2xl border p-3"
            style={{ borderColor: "#d7ff00" }}
          >
            <img src={urlVariante(LOGO_TBH, "icona-standard")} alt="Touch Business Holding" className="h-16 w-16 object-contain" />
            <span className="tbh-display text-sm">Touch Business Holding</span>
          </Link>
          <div className="grid grid-cols-2 gap-3">
            {punti.map((p) => (
              <Link
                key={p.slug}
                to={p.to}
                className="flex flex-col items-center gap-2 rounded-2xl border bg-black/60 p-3 text-center"
                style={{ borderColor: p.colore }}
              >
                <img src={urlVariante(p.file, "icona-standard")} alt={p.nome} className="h-14 w-14 object-contain" />
                <span className="text-[11px] font-semibold leading-tight" style={{ color: p.colore }}>
                  {p.nome}
                </span>
              </Link>
            ))}
          </div>
        </div>

        <p className="mt-4 text-[11px] leading-relaxed text-[var(--tbh-muted)]">{NOTA_LOGHI}</p>
      </div>
    </section>
  );
}
