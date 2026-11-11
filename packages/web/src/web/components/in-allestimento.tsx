import { Link } from "wouter";
import { Settings2 } from "lucide-react";
import {
  IN_ALLESTIMENTO_NOTA,
  IN_ALLESTIMENTO_TITOLO,
} from "../../api/data/allestimento-vuoto";

/* ────────────────────────────────────────────────────────────────────────────
   IN ALLESTIMENTO — il blocco unico per ogni posto ancora senza contenuto
   reale. Specifica di Claudio del 16/09/2026, punto 1:

     «Dove non c'è ancora un contenuto reale, mostra il testo IN ALLESTIMENTO
      con la nota "Contenuto disponibile prossimamente". Mai un contenuto finto,
      mai un pulsante che non porta a niente.»

   Regole rispettate qui:
   · il testo è sempre lo stesso, preso dalle costanti del server;
   · nessun pulsante verso il nulla: il collegamento al pannello compare SOLO
     all'amministratore riconosciuto;
   · il riquadro non finge un contenuto: nessuna immagine, nessun player.
   ──────────────────────────────────────────────────────────────────────────── */

export { IN_ALLESTIMENTO_NOTA, IN_ALLESTIMENTO_TITOLO };

export function InAllestimento({
  /** Che cosa manca, in una riga: «Scheda prodotto», «Monitor 3». Facoltativo. */
  cosa,
  /** true = l'amministratore è riconosciuto: si mostra la via per configurarlo. */
  admin = false,
  /** Pagina del pannello dove si carica il contenuto (solo per l'admin). */
  pannello,
  /** Riempie tutto il riquadro del genitore invece di stare nel flusso. */
  sovrapposto = false,
  compatto = false,
  colore = "var(--tbh-neon)",
  className = "",
}: {
  cosa?: string | null;
  admin?: boolean;
  pannello?: string | null;
  sovrapposto?: boolean;
  compatto?: boolean;
  colore?: string;
  className?: string;
}) {
  const posizione = sovrapposto ? "absolute inset-0" : "relative w-full";
  return (
    <div
      data-in-allestimento={cosa ?? "true"}
      className={`${posizione} flex flex-col items-center justify-center gap-1 overflow-hidden rounded-xl border border-dashed border-white/20 bg-black/55 p-3 text-center ${className}`}
    >
      <span
        className="tbh-dato text-[10px] font-extrabold tracking-[0.18em]"
        style={{ color: colore }}
      >
        {IN_ALLESTIMENTO_TITOLO}
      </span>
      <span className={`text-[var(--tbh-muted)] ${compatto ? "text-[9px]" : "text-[11px]"}`}>
        {IN_ALLESTIMENTO_NOTA}
      </span>
      {cosa && !compatto ? (
        <span className="tbh-dato text-[9px] uppercase tracking-[0.14em] text-white/45">
          {cosa}
        </span>
      ) : null}
      {admin && pannello ? (
        <Link
          to={pannello}
          className="mt-1 inline-flex items-center gap-1 rounded-full border border-white/25 px-2.5 py-1 text-[9px] font-bold tracking-[0.12em] text-white transition hover:border-[var(--tbh-neon)] hover:text-[var(--tbh-neon)]"
        >
          <Settings2 size={11} /> CONFIGURA ORA
        </Link>
      ) : null}
    </div>
  );
}

/** Riga sottile: per le celle di una tabella o le voci di un elenco. */
export function RigaInAllestimento({ cosa }: { cosa?: string | null }) {
  return (
    <span
      data-in-allestimento={cosa ?? "true"}
      className="tbh-dato inline-flex items-center gap-1.5 rounded-full border border-dashed border-white/20 px-2 py-0.5 text-[9px] font-bold tracking-[0.12em] text-white/70"
      title={IN_ALLESTIMENTO_NOTA}
    >
      {IN_ALLESTIMENTO_TITOLO}
    </span>
  );
}
