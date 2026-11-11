import { testoAppartenenza, type Appartenenza } from "../lib/appartenenza";

/** Riga «Appartiene a»: il circuito reale, col suo marchio originale. */
export function Appartiene({ a }: { a: Appartenenza }) {
  const t = testoAppartenenza(a);
  return (
    <p className="flex w-fit max-w-full items-center gap-2.5 rounded-2xl border px-3 py-1.5" style={{ borderColor: t.colore }}>
      {t.logo ? <img src={t.logo} alt="" aria-hidden className="h-8 w-8 shrink-0 rounded-full bg-black object-contain" /> : null}
      <span className="min-w-0 leading-tight">
        <span className="block whitespace-nowrap text-[10px] uppercase tracking-[0.18em] text-[var(--tbh-muted)]">Appartiene a</span>
        <span className="block text-sm font-bold uppercase tracking-wider" style={{ color: t.colore }}>
          {t.sigla}
          {t.nome ? <span className="font-normal text-white/80"> · {t.nome}</span> : null}
        </span>
      </span>
    </p>
  );
}
