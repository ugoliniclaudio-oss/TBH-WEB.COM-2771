/* ============================================================================
   NON MONTATO — 28/09/2026, audit doppioni (BLOCCO 1).

   Nessuna pagina importa `CarrellataAmbienti`. Attenzione se si rimonta: questa
   carrellata stampa il NUMERO di canale sulle card, e l'ordine di Claudio del
   28/09/2026 dice che i numeri non si vedono a schermo. Prima di riattivarla va
   tolto il numero.

   Da decidere con Claudio: aggiornarla e rimontarla, oppure archiviarla.
   ============================================================================ */
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useFilaScorrevole } from "./carosello-orizzontale";
import { Link } from "wouter";
import { AMBIENTI_CARRELLATA, type Ambiente, type PulsanteAmbiente } from "../lib/ambienti-tbh";

/**
 * CARRELLATA AMBIENTI — istruzione 03 e 04 di Claudio (06/09/2026).
 *
 * La Home non duplica i contenuti: li mette in vetrina. La banda scorre in
 * orizzontale DENTRO il proprio modulo (nessuno scroll orizzontale di pagina)
 * e la card successiva resta sempre parzialmente visibile:
 * smartphone 1-2 card + parte, tablet 3-4 + parte, PC 5-7 + parte.
 *
 * Su ogni pulsante la CATEGORIA sta SOPRA il nome, come da istruzione 04.
 */

/** Card di un ambiente: numero di canale, categoria sopra, nome grande. */
function CardAmbiente({ ambiente, to }: { ambiente: Ambiente; to: string }) {
  return (
    <Link
      to={to}
      className="tbh-card shrink-0 w-[230px] sm:w-[180px] lg:w-[190px] p-4 flex flex-col justify-between hover:-translate-y-0.5 transition-transform"
      style={{ borderColor: ambiente.colore, scrollSnapAlign: "start" }}
      data-ambiente={ambiente.slug}
      data-ambiente-numero={ambiente.numero}
    >
      <div>
        <div className="flex items-baseline justify-between gap-2">
          <span
            className="text-[10px] uppercase tracking-[0.18em] text-[var(--tbh-muted)]"
            data-ambiente-categoria={ambiente.slug}
          >
            {ambiente.categoria}
          </span>
          <span
            className="tbh-display text-2xl leading-none"
            style={{ color: ambiente.colore }}
          >
            {ambiente.numero}
          </span>
        </div>
        <h3 className="tbh-display text-lg mt-2 leading-tight" data-ambiente-nome={ambiente.slug}>
          {ambiente.nome}
        </h3>
        <p className="tbh-body text-[13px] text-[var(--tbh-muted)] mt-2">{ambiente.claim}</p>
      </div>
      <span
        className="mt-4 inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.14em]"
        style={{ color: ambiente.colore }}
      >
        Entra <ChevronRight size={13} />
      </span>
    </Link>
  );
}

export function CarrellataAmbienti({
  titolo = "I DIECI AMBIENTI DI TBH-WEB",
  sottotitolo = "Scorri la banda: ogni ambiente apre la sua pagina, con i suoi pulsanti.",
  linkA = (a: Ambiente) => a.to,
}: {
  titolo?: string;
  sottotitolo?: string;
  /** Dove porta la card. In bozza si passa la mini-homepage /check-web/c/:slug. */
  linkA?: (a: Ambiente) => string;
}) {
  /* 29/10/2026 (round 15) — logica comune delle fasce: frecce spente ai limiti, tastiera, swipe. */
  const { ref: banda, prima, dopo, scorri, tastiera } = useFilaScorrevole();

  return (
    <section
      className="mx-auto max-w-[1500px] px-4 md:px-8 py-10"
      data-blocco="carrellata-ambienti"
    >
      <div className="flex flex-wrap items-end justify-between gap-3 mb-4">
        <div className="min-w-0">
          <span className="text-[10px] uppercase tracking-[0.2em] text-[var(--tbh-muted)]">
            Home 0 · Palinsesto
          </span>
          <h2 className="tbh-h2 tbh-display">{titolo}</h2>
          <p className="tbh-body text-[var(--tbh-muted)] mt-1">{sottotitolo}</p>
        </div>
        <div className="flex gap-2 shrink-0">
          <button
            type="button"
            onClick={() => scorri(-1)}
            disabled={!prima}
            aria-label="Scorri gli ambienti verso sinistra"
            className="h-10 w-10 rounded-xl border border-[var(--tbh-line)] flex items-center justify-center text-[var(--tbh-neon)] hover:bg-white/10 disabled:pointer-events-none disabled:opacity-25"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            type="button"
            onClick={() => scorri(1)}
            disabled={!dopo}
            aria-label="Scorri gli ambienti verso destra"
            className="h-10 w-10 rounded-xl border border-[var(--tbh-line)] flex items-center justify-center text-[var(--tbh-neon)] hover:bg-white/10 disabled:pointer-events-none disabled:opacity-25"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      <div
        ref={banda}
        role="group"
        aria-label={titolo}
        tabIndex={0}
        onKeyDown={tastiera}
        className="tbh-scroll-x gap-3 pb-2 outline-none focus-visible:ring-1 focus-visible:ring-[var(--tbh-neon)]"
      >
        {AMBIENTI_CARRELLATA.map((a) => (
          <CardAmbiente key={a.slug} ambiente={a} to={linkA(a)} />
        ))}
      </div>
    </section>
  );
}

/** Un pulsante della mini-homepage: categoria sopra, nome per esteso sotto. */
export function PulsanteAmbienteTile({ pulsante }: { pulsante: PulsanteAmbiente }) {
  return (
    <Link
      to={pulsante.to}
      className="tbh-card px-3 py-3 flex flex-col gap-1 min-h-[76px] justify-center hover:-translate-y-0.5 transition-transform"
      data-pulsante-ambiente={pulsante.to}
    >
      <span className="text-[10px] uppercase tracking-[0.18em] text-[var(--tbh-muted)]">
        {pulsante.categoria}
      </span>
      <span className="tbh-display text-[15px] leading-tight">{pulsante.label}</span>
    </Link>
  );
}

/** Griglia dei pulsanti di un ambiente: fino a 24, fluida, senza larghezze fisse. */
export function GrigliaPulsanti({ pulsanti }: { pulsanti: PulsanteAmbiente[] }) {
  if (pulsanti.length === 0) {
    return (
      <p className="tbh-body text-[var(--tbh-muted)]">In allestimento.</p>
    );
  }
  return (
    <div
      className="grid gap-3"
      style={{ gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 220px), 1fr))" }}
      data-blocco="griglia-pulsanti"
    >
      {pulsanti.map((p) => (
        <PulsanteAmbienteTile key={`${p.to}-${p.label}`} pulsante={p} />
      ))}
    </div>
  );
}
