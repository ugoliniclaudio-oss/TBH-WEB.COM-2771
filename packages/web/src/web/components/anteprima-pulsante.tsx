import { Link } from "wouter";
import { ChevronRight } from "lucide-react";
import { testoAppartenenza, type Appartenenza } from "../lib/appartenenza";

/* ────────────────────────────────────────────────────────────────────────────
   ANTEPRIMA → PULSANTE → SCHEDA — REGOLA GLOBALE TBH-WEB del 02/10/2026.

     «Il SOLO LOGO viene utilizzato per allestimento. LOGO/IMMAGINE + APPARTENENZA
      = PULSANTE. L'intera immagine diventa il pulsante. Il click deve APRIRE LA
      SCHEDA SPECIFICA.»

   Questo è l'unico componente che trasforma un soggetto in un pulsante visivo:
     · `anteprima` = grafica ufficiale che ha GIÀ dentro logo + appartenenza
       (es. «R.F.A. + Touch Business Holding»): si mostra intera, così com'è;
     · altrimenti si compone dal logo/immagine del soggetto + fascia di appartenenza
       col marchio originale del circuito (TBH / DM / TBH Touch Plaza) o la sola
       etichetta pertinente per i soggetti esterni;
     · niente logo né immagine → nome per esteso nel monitor, mai un segnaposto
       disegnato.
   `href` è obbligatorio e interno: un'anteprima senza scheda non esiste (punto 5).
   ──────────────────────────────────────────────────────────────────────────── */

export type AnteprimaProps = {
  /** Scheda specifica del soggetto (`/tbh/societa/tbh-008`, `/shop/p/…`). */
  href: string;
  nome: string;
  /** Logo o immagine principale del soggetto (asset originale). */
  logo?: string | null;
  /** Grafica ufficiale «logo + appartenenza» già pronta: ha la precedenza. */
  anteprima?: string | null;
  appartenenza: Appartenenza;
  /** Riga sotto il nome: settore, categoria, città. */
  categoria?: string | null;
  /** Codice TBH o di listino. */
  codice?: string | null;
  /** Testo del pulsante: «Apri la scheda», «Scopri», «Guarda»… */
  cta?: string;
  className?: string;
};

function Fascia({ a }: { a: Appartenenza }) {
  const t = testoAppartenenza(a);
  return (
    <div
      className="flex items-center gap-2 border-t px-3 py-2 bg-black/85"
      style={{ borderColor: t.colore }}
    >
      {t.logo ? (
        <img src={t.logo} alt="" aria-hidden className="h-7 w-7 shrink-0 rounded-full object-contain bg-black" />
      ) : null}
      <span className="min-w-0 leading-tight">
        <span className="block text-[11px] font-bold uppercase tracking-[0.18em]" style={{ color: t.colore }}>
          {t.sigla}
        </span>
        {t.nome ? (
          <span className="block truncate text-[10px] uppercase tracking-widest text-white/70">{t.nome}</span>
        ) : null}
      </span>
    </div>
  );
}

export function AnteprimaPulsante({
  href,
  nome,
  logo,
  anteprima,
  appartenenza,
  categoria,
  codice,
  cta = "Apri la scheda",
  className = "",
}: AnteprimaProps) {
  const t = testoAppartenenza(appartenenza);
  return (
    <Link
      href={href}
      aria-label={`${nome} — ${t.sigla}${t.nome ? ` ${t.nome}` : ""}: ${cta}`}
      data-anteprima-pulsante
      className={`group tbh-card flex h-full flex-col overflow-hidden transition hover:border-[var(--tbh-neon)] hover:shadow-[0_0_32px_rgba(215,255,0,0.18)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--tbh-neon)] ${className}`}
    >
      {/* MONITOR: l'intera immagine è il pulsante */}
      <div className="relative overflow-hidden bg-black">
        {anteprima ? (
          <div className="aspect-[16/9] grid place-items-center">
            <img
              src={anteprima}
              alt={`${nome} — ${t.sigla}`}
              loading="lazy"
              className="h-full w-full object-contain transition duration-300 group-hover:scale-[1.03]"
            />
          </div>
        ) : (
          <>
            <div className="aspect-[16/9] grid place-items-center p-4 bg-[radial-gradient(120%_120%_at_50%_0%,#1b1b1b_0%,#000_70%)]">
              {logo ? (
                <img
                  src={logo}
                  alt={nome}
                  loading="lazy"
                  className="max-h-full max-w-full object-contain transition duration-300 group-hover:scale-[1.04]"
                />
              ) : (
                <span className="tbh-display text-center text-xl md:text-2xl leading-tight px-2 break-words">
                  {nome}
                </span>
              )}
            </div>
            <Fascia a={appartenenza} />
          </>
        )}
      </div>

      {/* Nome per esteso + categoria + CTA */}
      <div className="flex grow flex-col gap-1.5 p-4">
        {codice || categoria ? (
          <span className="text-[11px] uppercase tracking-[0.16em] text-[var(--tbh-gold)]">
            {[codice, categoria].filter(Boolean).join(" · ")}
          </span>
        ) : null}
        <span className="tbh-display text-lg md:text-xl leading-tight break-words group-hover:text-[var(--tbh-neon)]">
          {nome}
        </span>
        <span className="mt-auto pt-3 inline-flex items-center justify-between gap-2 rounded-full bg-[var(--tbh-neon)] px-4 py-2 text-sm font-bold uppercase tracking-wide text-black">
          {cta} <ChevronRight size={16} />
        </span>
      </div>
    </Link>
  );
}

/** La fascia di appartenenza da sola, per le card globali che hanno già il loro monitor. */
export { Fascia as FasciaAppartenenza };
