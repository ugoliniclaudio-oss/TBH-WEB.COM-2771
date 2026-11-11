import { Link } from "wouter";
import { ArrowLeft, Gamepad2, Info, Wrench } from "lucide-react";

import { useGiochiEdicola } from "../queries/edicola";
import { GiochiGiocabili } from "../components/giochi-play";

/* ────────────────────────────────────────────────────────────────────────────
   EDICOLA TBH — GIOCHI.

   Due blocchi separati, e la differenza è dichiarata:
     · QUELLI CHE SI GIOCANO ORA — gli stessi giochi reali del portale, con i
       gettoni veri, incorporati qui senza duplicare il codice;
     · QUELLI IN ALLESTIMENTO — annunciati col motivo per cui non sono ancora
       accesi. Nessun gioco finto, nessun punteggio inventato.
   ──────────────────────────────────────────────────────────────────────────── */

export default function EdicolaGiochiPage() {
  const q = useGiochiEdicola();
  const d = q.data;

  const attivi = (d?.giochi ?? []).filter((g) => g.stato === "attivo");
  const inArrivo = (d?.giochi ?? []).filter((g) => g.stato !== "attivo");

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-8 md:px-8 md:py-10">
      {/* ── INTESTAZIONE ────────────────────────────────────────────────── */}
      <header className="tbh-rise flex flex-col gap-3">
        <Link
          to="/edicola"
          className="inline-flex w-fit items-center gap-2 text-[11px] font-extrabold uppercase tracking-[0.18em] text-[var(--tbh-muted)] transition hover:text-white"
        >
          <ArrowLeft size={14} aria-hidden /> Torna all'Edicola
        </Link>
        <h1 className="tbh-display tbh-h1">🎮 GIOCHI DELL'EDICOLA</h1>
        <p className="tbh-body max-w-4xl text-[var(--tbh-muted)]">
          {typeof d?.attivi === "number"
            ? `${d.attivi} giochi già attivi, con gettoni veri. Gli altri sono annunciati con il motivo per cui non sono ancora accesi.`
            : "Giochi reali del portale, con gettoni veri."}
        </p>
      </header>

      {/* ── SI GIOCANO ORA ──────────────────────────────────────────────── */}
      <section className="mt-9" aria-label="Giochi attivi">
        <h2 className="tbh-display mb-2 flex items-center gap-2 tbh-h3">
          <Gamepad2 size={20} className="text-[var(--tbh-neon)]" aria-hidden /> Si giocano ora
        </h2>

        {attivi.length > 0 && (
          <ul className="mb-6 flex flex-wrap gap-2">
            {attivi.map((g) => (
              <li
                key={g.slug}
                className="rounded-full border border-[var(--tbh-line)] px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-[0.1em] text-[var(--tbh-muted)]"
              >
                {g.emoji} {g.titolo}
              </li>
            ))}
          </ul>
        )}

        {/* Gli stessi giochi del portale, non una copia. */}
        <GiochiGiocabili />
      </section>

      {/* ── IN ALLESTIMENTO ─────────────────────────────────────────────── */}
      {inArrivo.length > 0 && (
        <section className="mt-12" aria-label="Giochi in allestimento">
          <h2 className="tbh-display mb-4 flex items-center gap-2 tbh-h3">
            <Wrench size={19} className="text-[var(--tbh-gold)]" aria-hidden /> In allestimento
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {inArrivo.map((g) => (
              <article
                key={g.slug}
                className="tbh-card flex flex-col gap-2 border-dashed p-4"
              >
                <h3 className="flex items-center gap-2 text-[15px] font-extrabold text-white">
                  <span aria-hidden>{g.emoji}</span> {g.titolo}
                </h3>
                <p className="text-sm text-[var(--tbh-muted)]">{g.descrizione}</p>
                <p className="mt-1 text-[10px] font-extrabold uppercase tracking-[0.16em] text-[var(--tbh-gold)]">
                  In allestimento
                </p>
                {g.nota && <p className="text-[12px] text-[var(--tbh-muted)]">{g.nota}</p>}
              </article>
            ))}
          </div>
        </section>
      )}

      {/* ── NOTA ───────────────────────────────────────────────────────── */}
      {d?.nota && (
        <section className="tbh-card mt-12 flex flex-col gap-2 p-5 md:p-7">
          <h2 className="tbh-display flex items-center gap-2 tbh-h4">
            <Info size={17} className="text-[var(--tbh-neon)]" aria-hidden /> Come funzionano i
            giochi TBH
          </h2>
          <p className="max-w-[95ch] text-sm text-[var(--tbh-muted)]">{d.nota}</p>
          <Link
            to="/media/giochi"
            className="inline-flex w-fit items-center gap-2 rounded-full border border-[var(--tbh-line)] px-4 py-2 text-[12px] font-extrabold uppercase tracking-[0.1em] text-[var(--tbh-muted)] transition hover:border-white/40 hover:text-white"
          >
            Sala giochi del portale
          </Link>
        </section>
      )}

      {q.isError && (
        <p className="mt-6 text-sm text-[#FF6B6B]">
          L'elenco dei giochi non è disponibile in questo momento.
        </p>
      )}
    </div>
  );
}
