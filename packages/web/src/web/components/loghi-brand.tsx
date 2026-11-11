/* ============================================================================
   NON MONTATO — 28/09/2026, audit doppioni (BLOCCO 1).

   Nessuna pagina importa `LoghiBrand` o `LoghiBrandNastro`: la fascia dei loghi
   ufficiali oggi si vede altrove. Il file resta perché contiene la regola dei
   ritagli ufficiali (nessun logo ridisegnato) e può servire di nuovo.

   Da decidere con Claudio: rimontarlo in una pagina o archiviarlo.
   ============================================================================ */
import { Link } from "wouter";
import { LOGHI_TBH, NOTA_LOGHI, type LogoTbh } from "../lib/loghi-tbh";
import { urlVariante } from "./logo-box";

/**
 * FASCIA LOGHI UFFICIALI TBH — ordine di Claudio del 29/08/2026.
 *
 * I marchi sono RITAGLI dal layout ufficiale su fondo nero consegnato da Claudio:
 * nessun logo è stato ridisegnato o inventato. Ogni logo è un pulsante vivo che porta
 * dentro il portale (mai un bottone morto).
 */

function Cella({ l }: { l: LogoTbh }) {
  return (
    <Link
      to={l.to}
      className="tbh-card group flex flex-col items-center gap-3 p-4 text-center transition hover:bg-white/5"
      style={{ borderColor: `${l.colore}55` }}
      aria-label={l.nome}
    >
      {/* Il riquadro decide la misura, mai l'immagine (regola del 06/09/2026): con
          `max-h/max-w` i marchi grandi e piccoli rendevano altezze diverse. Il file
          arriva dal motore delle varianti, quindi dal master. */}
      <div className="h-20 w-full relative">
        <img
          src={urlVariante(l.file, "icona-standard")}
          alt={l.nome}
          className="absolute inset-0 h-full w-full object-contain transition group-hover:scale-105"
        />
      </div>
      <span className="tbh-display text-base leading-tight" style={{ color: l.colore }}>
        {l.nome}
      </span>
      {l.claim && (
        <span className="text-[11px] uppercase tracking-wide text-[var(--tbh-muted)]">{l.claim}</span>
      )}
    </Link>
  );
}

/**
 * @param solo elenco di slug da mostrare (in ordine). Se vuoto: tutti i marchi.
 */
export function LoghiBrand({
  titolo = "I marchi del gruppo",
  occhiello = "Loghi ufficiali Touch Business Holding",
  solo,
  nota = true,
}: {
  titolo?: string;
  occhiello?: string;
  solo?: string[];
  nota?: boolean;
}) {
  const lista = solo?.length
    ? (solo.map((s) => LOGHI_TBH.find((l) => l.slug === s)).filter(Boolean) as LogoTbh[])
    : LOGHI_TBH;

  if (!lista.length) return null;

  return (
    <section className="mx-auto max-w-[1500px] px-4 md:px-8 py-10">
      <p className="text-xs tracking-[0.25em] uppercase text-[var(--tbh-gold)] mb-2">{occhiello}</p>
      <h2 className="tbh-display tbh-h2 mb-6">{titolo}</h2>
      <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
        {lista.map((l) => (
          <Cella key={l.slug} l={l} />
        ))}
      </div>
      {nota && <p className="text-xs text-[var(--tbh-muted)] mt-5 max-w-4xl">{NOTA_LOGHI}</p>}
    </section>
  );
}

/** Nastro compatto: stessi loghi, usato dove non serve tutta la griglia. */
export function LoghiBrandNastro({ solo }: { solo?: string[] }) {
  const lista = solo?.length
    ? (solo.map((s) => LOGHI_TBH.find((l) => l.slug === s)).filter(Boolean) as LogoTbh[])
    : LOGHI_TBH;

  return (
    <div className="tbh-scroll-x flex gap-4 py-3">
      {lista.map((l) => (
        <Link
          key={l.slug}
          to={l.to}
          className="shrink-0 rounded-xl border px-4 py-3 grid place-items-center bg-black/40"
          style={{ borderColor: `${l.colore}55` }}
          aria-label={l.nome}
          title={l.nome}
        >
          <img src={urlVariante(l.file, "icona-standard")} alt={l.nome} loading="lazy" className="h-12 w-12 object-contain" />
        </Link>
      ))}
    </div>
  );
}
