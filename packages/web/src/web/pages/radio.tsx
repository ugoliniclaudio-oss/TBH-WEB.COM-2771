import { useEffect } from "react";
import { Link } from "wouter";
import { ArrowRight } from "lucide-react";
import { RadioSezione } from "../components/radio-sezione";

/**
 * /radio — pagina principale del format TOUCH MUSIC RADIO TV (14/10/2026).
 * Il PALINSESTO 24/7 è protagonista: pulsante giallo fisso e, subito sotto,
 * ORA IN ONDA → A SEGUIRE → PALINSESTO DI OGGI → PROGRAMMI DELLA SETTIMANA.
 * /radio/palinsesto apre la stessa pagina già sul palinsesto (link diretto per
 * homepage, menu e app). La sezione è la stessa di /musica/jc-hugo: nessun doppione.
 */
export default function RadioPage({ ancora }: { ancora?: string }) {
  useEffect(() => {
    const id = ancora ?? (window.location.hash ? window.location.hash.slice(1) : null);
    if (!id) return;
    const t = setTimeout(() => document.getElementById(id)?.scrollIntoView({ block: "start" }), 400);
    return () => clearTimeout(t);
  }, [ancora]);

  return (
    <div className="mx-auto flex max-w-[1500px] flex-col gap-10 px-4 py-8 md:px-8 md:py-10">
      <RadioSezione linkBrani="/musica/jc-hugo#brani" />
      <Link
        href="/musica/jc-hugo"
        className="tbh-card flex items-center justify-between gap-4 p-5 hover:border-[#d7ff00]/60"
      >
        <span>
          <span className="block text-xs font-bold uppercase tracking-[0.2em] text-[var(--tbh-muted)]">
            Il canale dell'artista
          </span>
          <span className="tbh-display tbh-h3 text-[var(--tbh-platinum)]">Catalogo completo J.C. Hugò</span>
        </span>
        <ArrowRight className="shrink-0 text-[#d7ff00]" />
      </Link>
    </div>
  );
}
