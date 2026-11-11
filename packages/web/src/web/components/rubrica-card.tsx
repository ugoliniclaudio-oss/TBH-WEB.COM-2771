import { Link } from "wouter";
import { ArrowRight } from "lucide-react";
import type { Rubrica } from "../../api/data/touch-canali";
import { COLORE_TBH } from "../lib/identita-tbh";

/** Logo ORIGINALE della rubrica, oppure lo slot dichiarato «IN ALLESTIMENTO». Mai un logo generato. */
export function LogoRubrica({ r, grande = false }: { r: Rubrica; grande?: boolean }) {
  const misura = grande ? "h-40 w-40 md:h-48 md:w-48" : "h-20 w-20";
  if (r.logo)
    return (
      <img
        src={r.logo}
        alt={`Logo originale della rubrica ${r.nome}`}
        className={`${misura} shrink-0 rounded-xl bg-black object-contain`}
      />
    );
  return (
    <span
      className={`${misura} grid shrink-0 place-items-center rounded-xl border border-dashed p-2 text-center`}
      style={{ borderColor: `${r.colore}88` }}
    >
      <span className="flex flex-col gap-1">
        <span className="tbh-display text-sm leading-tight" style={{ color: r.colore }}>
          {r.nome}
        </span>
        <span className="text-[9px] font-bold uppercase tracking-[0.14em] text-[var(--tbh-gold)]">Logo in allestimento</span>
      </span>
    </span>
  );
}

export function RubricaCard({ r, inOnda = false }: { r: Rubrica; inOnda?: boolean }) {
  return (
    <Link
      href={`/rubriche/${r.id}`}
      className="tbh-card flex items-center gap-4 p-4 transition-colors hover:border-[#d7ff00]/60"
      style={inOnda ? { borderColor: COLORE_TBH } : undefined}
      data-testid={`rubrica-${r.id}`}
    >
      <LogoRubrica r={r} />
      <span className="flex min-w-0 flex-1 flex-col gap-1">
        <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--tbh-muted)]">
          Rubrica del palinsesto
          {inOnda && (
            <span className="ml-2" style={{ color: COLORE_TBH }}>
              ● IN ONDA
            </span>
          )}
        </span>
        <span className="tbh-display text-xl leading-tight" style={{ color: r.colore }}>
          {r.nome}
        </span>
        <span className="text-sm text-[var(--tbh-platinum)]">{r.sottotitolo}</span>
      </span>
      <ArrowRight className="h-5 w-5 shrink-0" style={{ color: COLORE_TBH }} />
    </Link>
  );
}
