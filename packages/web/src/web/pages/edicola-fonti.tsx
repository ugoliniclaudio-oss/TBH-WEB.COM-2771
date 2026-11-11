import { useMemo, useState } from "react";
import { Link } from "wouter";
import { AlertTriangle, ArrowLeft, CheckCircle2, Info, RefreshCw, Rss, XCircle } from "lucide-react";

import { useFontiEdicola } from "../queries/edicola";

/* ────────────────────────────────────────────────────────────────────────────
   EDICOLA TBH — LE FONTI, IN CHIARO.

   Questa pagina esiste per una ragione sola: chi legge deve poter verificare da
   dove arriva ogni notizia. Quindi si pubblicano tutte le fonti con il loro
   stato reale dell'ultimo controllo — compreso «non risponde» — e l'elenco delle
   fonti ESCLUSE con il motivo per cui sono state escluse, così nessuno le
   ricarica per sbaglio pensando che siano state dimenticate.
   ──────────────────────────────────────────────────────────────────────────── */

function quandoBreve(iso: string | null): string {
  if (!iso) return "mai controllata";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "mai controllata";
  return d.toLocaleString("it-IT", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function EdicolaFontiPage() {
  const q = useFontiEdicola();
  const d = q.data;
  const [soloProblemi, setSoloProblemi] = useState(false);

  const fonti = useMemo(() => {
    const tutte = d?.fonti ?? [];
    return soloProblemi ? tutte.filter((f) => f.esito !== "ok") : tutte;
  }, [d?.fonti, soloProblemi]);

  const rispondono = (d?.fonti ?? []).filter((f) => f.esito === "ok").length;
  const totale = d?.fonti.length ?? 0;

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
        <h1 className="tbh-display tbh-h1">📡 LE NOSTRE FONTI</h1>
        <p className="tbh-body max-w-4xl text-[var(--tbh-muted)]">
          Tutte le testate che l'Edicola legge, con l'esito reale dell'ultimo controllo. In fondo,
          le fonti escluse e il motivo dell'esclusione.
        </p>
        {totale > 0 && (
          <p className="text-[12px] text-[var(--tbh-muted)]">
            <strong className="text-[var(--tbh-neon)]">{rispondono}</strong> fonti su{" "}
            <strong className="text-white">{totale}</strong> hanno risposto all'ultimo controllo.
          </p>
        )}
      </header>

      {/* ── FILTRO ──────────────────────────────────────────────────────── */}
      {totale > 0 && (
        <div className="mt-6 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setSoloProblemi(false)}
            className={`rounded-full border px-4 py-2 text-[11px] font-extrabold uppercase tracking-[0.1em] transition ${
              soloProblemi
                ? "border-[var(--tbh-line)] text-[var(--tbh-muted)] hover:border-white/40 hover:text-white"
                : "border-white/60 bg-white/10 text-white"
            }`}
          >
            Tutte le fonti
          </button>
          <button
            type="button"
            onClick={() => setSoloProblemi(true)}
            className={`rounded-full border px-4 py-2 text-[11px] font-extrabold uppercase tracking-[0.1em] transition ${
              soloProblemi
                ? "border-white/60 bg-white/10 text-white"
                : "border-[var(--tbh-line)] text-[var(--tbh-muted)] hover:border-white/40 hover:text-white"
            }`}
          >
            Solo quelle che non rispondono
          </button>
        </div>
      )}

      {/* ── ELENCO FONTI IN VIGORE ──────────────────────────────────────── */}
      <section className="mt-7" aria-label="Fonti lette dall'Edicola">
        {q.isLoading ? (
          <div className="tbh-card flex min-h-[200px] items-center justify-center border-dashed">
            <span className="inline-flex items-center gap-2 text-[12px] font-extrabold uppercase tracking-[0.18em] text-[var(--tbh-muted)]">
              <RefreshCw size={14} className="animate-spin" aria-hidden /> Lettura del registro…
            </span>
          </div>
        ) : q.isError ? (
          <p className="tbh-card border-dashed p-6 text-sm text-[#FF6B6B]">
            Il registro delle fonti non è disponibile in questo momento.
          </p>
        ) : fonti.length === 0 ? (
          <p className="tbh-card border-dashed p-6 text-sm text-[var(--tbh-muted)]">
            {soloProblemi
              ? "Nessuna fonte in errore all'ultimo controllo."
              : "IN ALLESTIMENTO — il registro delle fonti non è ancora stato popolato."}
          </p>
        ) : (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {fonti.map((f) => {
              const ok = f.esito === "ok";
              return (
                <article key={f.slug} className="tbh-card flex flex-col gap-2 p-4">
                  <header className="flex items-start justify-between gap-2">
                    <div className="flex flex-col">
                      {f.sitoUrl ? (
                        <a
                          href={f.sitoUrl}
                          target="_blank"
                          rel="noreferrer noopener"
                          className="text-[15px] font-extrabold text-white transition hover:text-[var(--tbh-neon)]"
                        >
                          {f.nome} ↗
                        </a>
                      ) : (
                        <span className="text-[15px] font-extrabold text-white">{f.nome}</span>
                      )}
                      <span className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-[var(--tbh-muted)]">
                        {f.categoria}
                        {f.territorio ? ` · ${f.territorio}` : ""}
                      </span>
                    </div>
                    <span
                      className="inline-flex shrink-0 items-center gap-1 rounded-full border px-2 py-1 text-[10px] font-extrabold uppercase tracking-[0.12em]"
                      style={{
                        borderColor: ok ? "#2ECC7155" : "#FF3B3055",
                        color: ok ? "#2ECC71" : "#FF6B6B",
                      }}
                    >
                      {ok ? (
                        <CheckCircle2 size={11} aria-hidden />
                      ) : (
                        <AlertTriangle size={11} aria-hidden />
                      )}
                      {ok ? "risponde" : (f.esito ?? "mai letta")}
                    </span>
                  </header>

                  <p className="text-[11px] text-[var(--tbh-muted)]">
                    Ultimo controllo: {quandoBreve(f.ultimoControllo)}
                  </p>
                  {f.verificatoIl && (
                    <p className="text-[11px] text-[var(--tbh-muted)]">
                      Verificata a mano il {f.verificatoIl}
                    </p>
                  )}
                  {!f.attiva && (
                    <p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-[var(--tbh-gold)]">
                      Spenta dal pannello
                    </p>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </section>

      {/* ── FONTI ESCLUSE ───────────────────────────────────────────────── */}
      {d && d.scartate.length > 0 && (
        <section className="mt-12" aria-label="Fonti escluse">
          <h2 className="tbh-display mb-2 flex items-center gap-2 tbh-h3">
            <XCircle size={19} className="text-[#FF6B6B]" aria-hidden /> Fonti escluse (
            {d.scartate.length})
          </h2>
          <p className="mb-4 max-w-[95ch] text-sm text-[var(--tbh-muted)]">
            Non sono state dimenticate: sono state provate e scartate. Il motivo è scritto qui
            accanto a ciascuna, così nessuno le rimette dentro per sbaglio.
          </p>
          <ul className="flex flex-col gap-2">
            {d.scartate.map((s) => (
              <li
                key={s.feedUrl}
                className="tbh-card flex flex-col gap-1 border-dashed p-3 text-sm"
              >
                <span className="font-extrabold text-white">{s.nome}</span>
                <span className="break-all text-[11px] text-[var(--tbh-muted)]">{s.feedUrl}</span>
                <span className="text-[12px] text-[#FFB4B4]">{s.motivo}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* ── NOTA ───────────────────────────────────────────────────────── */}
      {d?.nota && (
        <section className="tbh-card mt-12 flex flex-col gap-2 p-5 md:p-7">
          <h2 className="tbh-display flex items-center gap-2 tbh-h4">
            <Info size={17} className="text-[var(--tbh-neon)]" aria-hidden /> Cosa pubblichiamo di
            una fonte esterna
          </h2>
          <p className="max-w-[95ch] text-sm text-[var(--tbh-muted)]">{d.nota}</p>
          <Link to="/edicola" className="tbh-neon-btn mt-1 inline-flex w-fit px-4 py-2 text-[12px]">
            <Rss size={14} className="mr-2" aria-hidden /> Vai all'Edicola
          </Link>
        </section>
      )}
    </div>
  );
}
