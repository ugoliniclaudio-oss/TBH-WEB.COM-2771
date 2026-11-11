import { useState } from "react";
import { Link } from "wouter";
import { ArrowLeft, ArrowRight, FileText, Info, ListOrdered } from "lucide-react";

import { useRegolamentoMissCool } from "../queries/miss-cool";

/* ────────────────────────────────────────────────────────────────────────────
   TOUCH MISS COOL — REGOLAMENTO, I 18 ARTICOLI.

   La pagina non scrive il regolamento: lo legge dal servizio, che lo legge dal
   Kit Digitale 2027. Due conseguenze dichiarate a schermo:

   1. Dove il Kit non fissa un numero — quote, importi, date delle tappe — qui
      si legge «DA DEFINIRE». La pagina non colma il buco con una stima.
   2. Il testo è la stesura operativa del Kit e va validata dalla direzione TBH
      e dal consulente privacy prima della raccolta delle candidature. Lo dice
      la nota in testa, non una riga in fondo che nessuno legge.
   ──────────────────────────────────────────────────────────────────────────── */

const BASE = "/eventi/miss-cool";

/** Evidenzia i «DA DEFINIRE» dentro il corpo di un articolo, senza riscriverlo. */
function Paragrafo({ testo }: { testo: string }) {
  const pezzi = testo.split(/(DA DEFINIRE)/g);
  return (
    <p className="tbh-body text-[var(--tbh-muted)]">
      {pezzi.map((p, i) =>
        p === "DA DEFINIRE" ? (
          <span
            key={i}
            className="mx-0.5 rounded border border-dashed border-white/30 px-1.5 py-0.5 text-[10px] font-extrabold uppercase tracking-[0.12em] text-[var(--tbh-fg)]"
          >
            DA DEFINIRE
          </span>
        ) : (
          <span key={i}>{p}</span>
        ),
      )}
    </p>
  );
}

export default function MissCoolRegolamentoPage() {
  const q = useRegolamentoMissCool();
  const d = q.data;
  const [aperto, setAperto] = useState<number | null>(1);

  if (q.isLoading) {
    return (
      <div className="mx-auto max-w-[1100px] px-4 py-16 md:px-8">
        <p className="tbh-body text-[var(--tbh-muted)]">Carico il regolamento…</p>
      </div>
    );
  }

  if (q.isError || !d) {
    return (
      <div className="mx-auto max-w-[1100px] px-4 py-16 md:px-8">
        <h1 className="tbh-display tbh-h1">REGOLAMENTO</h1>
        <p className="tbh-body mt-4 text-[var(--tbh-muted)]">
          Il regolamento non è raggiungibile in questo momento. Non viene mostrata nessuna
          versione approssimativa al suo posto.
        </p>
        <Link href={BASE} className="tbh-body mt-6 inline-flex items-center gap-2 text-[var(--tbh-neon)]">
          <ArrowLeft className="size-4" /> Torna a Touch Miss Cool
        </Link>
      </div>
    );
  }

  const daDefinire = d.articoli.filter((a) =>
    a.testo.some((t) => t.includes("DA DEFINIRE")),
  );

  return (
    <div className="mx-auto max-w-[1100px] px-4 py-10 md:px-8 md:py-16">
      <Link
        href={BASE}
        className="tbh-body inline-flex items-center gap-2 text-[var(--tbh-muted)] transition hover:text-[var(--tbh-fg)]"
      >
        <ArrowLeft className="size-4" /> Touch Miss Cool
      </Link>

      <header className="mt-6">
        <p className="tbh-body text-[11px] font-extrabold uppercase tracking-[0.22em] text-[var(--tbh-neon)]">
          {d.concorso.titolo} · Edizione {d.concorso.edizione}
        </p>
        <h1 className="tbh-display tbh-h1 mt-2">REGOLAMENTO</h1>
        <p className="tbh-body mt-3 max-w-[70ch] text-[var(--tbh-muted)]">
          {d.articoli.length} articoli, nell'ordine del Kit Digitale {d.concorso.edizione}.
        </p>
      </header>

      {/* La nota di validità sta in testa: è la prima cosa che conta. */}
      <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
        <div className="flex items-start gap-3">
          <Info className="mt-0.5 size-5 shrink-0 text-[var(--tbh-neon)]" />
          <div>
            <p className="tbh-body text-[13px] font-extrabold uppercase tracking-[0.1em] text-[var(--tbh-fg)]">
              Come va letto questo testo
            </p>
            <p className="tbh-body mt-2 text-[var(--tbh-muted)]">{d.nota}</p>
            {daDefinire.length > 0 && (
              <p className="tbh-body mt-3 text-[13px] text-[var(--tbh-muted)]">
                Articoli che contengono almeno un punto ancora da deliberare:{" "}
                <span className="font-extrabold text-[var(--tbh-fg)]">
                  {daDefinire.map((a) => a.n).join(", ")}
                </span>
                .
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Indice: 18 numeri cliccabili, nessuna ricerca da fare a mano. */}
      <section className="mt-10">
        <div className="flex items-center gap-2">
          <ListOrdered className="size-4 text-[var(--tbh-neon)]" />
          <h2 className="tbh-body text-[12px] font-extrabold uppercase tracking-[0.18em] text-[var(--tbh-fg)]">
            Indice degli articoli
          </h2>
        </div>
        <ol className="mt-4 grid gap-2 sm:grid-cols-2">
          {d.articoli.map((a) => (
            <li key={a.n}>
              <button
                type="button"
                onClick={() => {
                  setAperto(a.n);
                  document
                    .getElementById(`art-${a.n}`)
                    ?.scrollIntoView({ behavior: "smooth", block: "start" });
                }}
                className="flex w-full items-center gap-3 rounded-xl border border-white/10 bg-white/[0.02] px-3 py-2 text-left transition hover:border-[var(--tbh-neon)]/50 hover:bg-white/[0.05]"
              >
                <span className="tbh-display w-8 shrink-0 text-[15px] text-[var(--tbh-neon)]">
                  {String(a.n).padStart(2, "0")}
                </span>
                <span className="tbh-body text-[13px] text-[var(--tbh-fg)]">{a.titolo}</span>
              </button>
            </li>
          ))}
        </ol>
      </section>

      {/* Il testo. Aperto quello selezionato, gli altri richiudibili. */}
      <section className="mt-12 space-y-3">
        {d.articoli.map((a) => {
          const attivo = aperto === a.n;
          return (
            <article
              key={a.n}
              id={`art-${a.n}`}
              className={`scroll-mt-24 rounded-2xl border bg-white/[0.02] transition ${
                attivo ? "border-[var(--tbh-neon)]/40" : "border-white/10"
              }`}
            >
              <button
                type="button"
                onClick={() => setAperto(attivo ? null : a.n)}
                className="flex w-full items-start gap-4 px-5 py-4 text-left"
                aria-expanded={attivo}
              >
                <span className="tbh-display shrink-0 text-[20px] leading-none text-[var(--tbh-neon)]">
                  {String(a.n).padStart(2, "0")}
                </span>
                <span className="flex-1">
                  <span className="tbh-body block text-[15px] font-extrabold uppercase tracking-[0.06em] text-[var(--tbh-fg)]">
                    {a.titolo}
                  </span>
                  {!attivo && (
                    <span className="tbh-body mt-1 line-clamp-1 block text-[13px] text-[var(--tbh-muted)]">
                      {a.testo[0]}
                    </span>
                  )}
                </span>
                <span className="tbh-body shrink-0 text-[11px] uppercase tracking-[0.14em] text-[var(--tbh-muted)]">
                  {attivo ? "chiudi" : "apri"}
                </span>
              </button>
              {attivo && (
                <div className="space-y-3 border-t border-white/10 px-5 py-5 pl-[4.25rem]">
                  {a.testo.map((t, i) => (
                    <Paragrafo key={i} testo={t} />
                  ))}
                </div>
              )}
            </article>
          );
        })}
      </section>

      {/* Rimandi: la classifica vive in una pagina sua, non riassunta qui. */}
      <section className="mt-14 grid gap-4 sm:grid-cols-2">
        <Link
          href={`${BASE}/premiazioni`}
          className="group rounded-2xl border border-white/10 bg-white/[0.02] p-5 transition hover:border-[var(--tbh-neon)]/50"
        >
          <p className="tbh-body text-[11px] font-extrabold uppercase tracking-[0.16em] text-[var(--tbh-neon)]">
            Articoli 11–13
          </p>
          <p className="tbh-body mt-2 text-[15px] font-extrabold text-[var(--tbh-fg)]">
            Le {d.classifica.length} premiazioni nel dettaglio
          </p>
          <p className="tbh-body mt-1 text-[13px] text-[var(--tbh-muted)]">
            Incarichi, fasce, competenze. Compensi, gettoni e premi: DA DEFINIRE.
          </p>
          <span className="tbh-body mt-3 inline-flex items-center gap-2 text-[13px] text-[var(--tbh-fg)] transition group-hover:gap-3">
            Apri <ArrowRight className="size-4" />
          </span>
        </Link>
        <Link
          href={`${BASE}/adesione`}
          className="group rounded-2xl border border-white/10 bg-white/[0.02] p-5 transition hover:border-[var(--tbh-neon)]/50"
        >
          <p className="tbh-body text-[11px] font-extrabold uppercase tracking-[0.16em] text-[var(--tbh-neon)]">
            Articolo 5
          </p>
          <p className="tbh-body mt-2 text-[15px] font-extrabold text-[var(--tbh-fg)]">
            Domanda di partecipazione
          </p>
          <p className="tbh-body mt-1 text-[13px] text-[var(--tbh-muted)]">
            Modulo 01 con le tre dichiarazioni e i sei consensi separati.
          </p>
          <span className="tbh-body mt-3 inline-flex items-center gap-2 text-[13px] text-[var(--tbh-fg)] transition group-hover:gap-3">
            Compila <ArrowRight className="size-4" />
          </span>
        </Link>
      </section>

      <div className="mt-10 flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.02] p-5">
        <FileText className="size-5 shrink-0 text-[var(--tbh-muted)]" />
        <p className="tbh-body text-[13px] text-[var(--tbh-muted)]">
          {d.officialCandidate.da}:{" "}
          <span className="font-extrabold text-[var(--tbh-fg)]">
            {d.officialCandidate.titolo}
          </span>
          . {d.officialCandidate.spiegazione} {d.officialCandidate.notaPremio}
        </p>
      </div>
    </div>
  );
}
