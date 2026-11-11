import { useState } from "react";
import { Link } from "wouter";
import { ArrowLeft, Filter, Info, RefreshCw, Rss } from "lucide-react";

import { useCategoriaEdicola } from "../queries/edicola";
import { GrigliaEdicola } from "../components/card-edicola";
import { SezioneAmministrabile } from "../components/sezione-amministrabile";

/* ────────────────────────────────────────────────────────────────────────────
   EDICOLA TBH — PAGINA DI UNA SEZIONE.

   Qui la fascia della home diventa griglia: tutti i contenuti verificati di
   quella categoria, con due filtri reali (territorio e sottocategoria) presi
   dal servizio, non inventati in pagina.

   Regole di questa pagina:
     · se il filtro non lascia nulla, lo si DICHIARA («IN ALLESTIMENTO»);
     · le fonti di quella sezione sono elencate in fondo col loro stato reale,
       compreso «errore»: anche una fonte che non risponde è un dato.
   ──────────────────────────────────────────────────────────────────────────── */

export default function EdicolaCategoriaPage({ categoria }: { categoria?: string }) {
  const slug = (categoria ?? "").trim();
  const [territorio, setTerritorio] = useState<string | undefined>(undefined);
  const [sottocategoria, setSottocategoria] = useState<string | undefined>(undefined);

  const q = useCategoriaEdicola(slug, { territorio, sottocategoria });
  const d = q.data;
  const cat = d?.categoria;
  const colore = cat?.colore ?? "var(--tbh-neon)";

  return (
    <div className="mx-auto max-w-[1500px] px-4 py-8 md:px-8 md:py-10">
      {/* ── INTESTAZIONE ────────────────────────────────────────────────── */}
      <header className="tbh-rise flex flex-col gap-3">
        <Link
          to="/edicola"
          className="inline-flex w-fit items-center gap-2 text-[11px] font-extrabold uppercase tracking-[0.18em] text-[var(--tbh-muted)] transition hover:text-white"
        >
          <ArrowLeft size={14} aria-hidden /> Torna all'Edicola
        </Link>

        <h1 className="tbh-display tbh-h1 flex flex-wrap items-center gap-3">
          <span aria-hidden>{cat?.emoji}</span>
          <span>{cat?.titolo ?? (slug ? slug.replace(/-/g, " ").toUpperCase() : "SEZIONE")}</span>
        </h1>
        {cat?.descrizione && (
          <p className="tbh-body max-w-4xl text-[var(--tbh-muted)]">{cat.descrizione}</p>
        )}

        {/* Quando la sezione ha già la sua pagina ufficiale nel portale. */}
        {cat?.rimando && (
          <Link to={cat.rimando.href} className="tbh-neon-btn w-fit px-4 py-2 text-[12px]">
            {cat.emoji} {cat.rimando.testo} →
          </Link>
        )}
      </header>

      {/* ── FILTRI ──────────────────────────────────────────────────────── */}
      {d && (
        <section className="mt-7 flex flex-col gap-4" aria-label="Filtri">
          <p className="inline-flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-[0.18em] text-[var(--tbh-muted)]">
            <Filter size={13} aria-hidden /> Filtra
          </p>

          {/* Territorio: i sei prioritari + Italia, come dichiarati dal servizio. */}
          <div className="tbh-scroll-x flex gap-2 pb-1">
            <button
              type="button"
              onClick={() => setTerritorio(undefined)}
              className={`shrink-0 rounded-full border px-3 py-2 text-[11px] font-extrabold uppercase tracking-[0.1em] transition ${
                territorio === undefined
                  ? "border-white/60 bg-white/10 text-white"
                  : "border-[var(--tbh-line)] text-[var(--tbh-muted)] hover:border-white/40 hover:text-white"
              }`}
            >
              Tutti i territori
            </button>
            {d.territori.map((t) => (
              <button
                key={t.slug}
                type="button"
                onClick={() => setTerritorio(territorio === t.slug ? undefined : t.slug)}
                className={`shrink-0 rounded-full border px-3 py-2 text-[11px] font-extrabold uppercase tracking-[0.1em] transition ${
                  territorio === t.slug
                    ? "border-white/60 bg-white/10 text-white"
                    : "border-[var(--tbh-line)] text-[var(--tbh-muted)] hover:border-white/40 hover:text-white"
                }`}
              >
                {t.nome}
              </button>
            ))}
          </div>

          {/* Sottocategorie: solo quelle davvero dichiarate dalla categoria. */}
          {d.sottocategorie.length > 0 && (
            <div className="tbh-scroll-x flex gap-2 pb-1">
              <button
                type="button"
                onClick={() => setSottocategoria(undefined)}
                className={`shrink-0 rounded-full border px-3 py-2 text-[11px] font-extrabold uppercase tracking-[0.1em] transition ${
                  sottocategoria === undefined
                    ? "border-white/60 bg-white/10 text-white"
                    : "border-[var(--tbh-line)] text-[var(--tbh-muted)] hover:border-white/40 hover:text-white"
                }`}
              >
                Tutto
              </button>
              {d.sottocategorie.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSottocategoria(sottocategoria === s ? undefined : s)}
                  className={`shrink-0 rounded-full border px-3 py-2 text-[11px] font-extrabold uppercase tracking-[0.1em] transition ${
                    sottocategoria === s
                      ? "border-white/60 bg-white/10 text-white"
                      : "border-[var(--tbh-line)] text-[var(--tbh-muted)] hover:border-white/40 hover:text-white"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          )}
        </section>
      )}

      {/* ── GRIGLIA ─────────────────────────────────────────────────────── */}
      <section className="mt-7" aria-label="Contenuti della sezione">
        {q.isLoading ? (
          <div className="tbh-card flex min-h-[220px] items-center justify-center border-dashed">
            <span className="inline-flex items-center gap-2 text-[12px] font-extrabold uppercase tracking-[0.18em] text-[var(--tbh-muted)]">
              <RefreshCw size={14} className="animate-spin" aria-hidden /> Lettura dell'archivio…
            </span>
          </div>
        ) : q.isError ? (
          <p className="tbh-card border-dashed p-6 text-sm text-[#FF6B6B]">
            Questa sezione non è disponibile in questo momento. Nessun contenuto di riserva viene
            mostrato al suo posto.
          </p>
        ) : (
          <>
            <p className="mb-4 text-[12px] font-extrabold uppercase tracking-[0.16em]" style={{ color: colore }}>
              {d?.items.length ?? 0} contenuti
            </p>
            <GrigliaEdicola items={d?.items ?? []} />
          </>
        )}
      </section>

      {/* ── LE FONTI DI QUESTA SEZIONE ──────────────────────────────────── */}
      {d && d.fonti.length > 0 && (
        <section className="tbh-card mt-12 flex flex-col gap-3 p-5 md:p-7">
          <h2 className="tbh-display flex items-center gap-2 tbh-h3">
            <Rss size={18} className="text-[var(--tbh-neon)]" aria-hidden /> Le fonti di questa
            sezione
          </h2>
          <ul className="flex flex-col gap-2">
            {d.fonti.map((f) => (
              <li
                key={f.nome}
                className="flex flex-wrap items-center gap-2 border-b border-[var(--tbh-line)] pb-2 text-sm text-[var(--tbh-muted)] last:border-0"
              >
                {f.sitoUrl ? (
                  <a
                    href={f.sitoUrl}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="font-extrabold text-white hover:text-[var(--tbh-neon)]"
                  >
                    {f.nome} ↗
                  </a>
                ) : (
                  <span className="font-extrabold text-white">{f.nome}</span>
                )}
                <span
                  className="rounded-full border px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-[0.14em]"
                  style={{
                    borderColor: f.esito === "ok" ? "#2ECC7155" : "#FF3B3055",
                    color: f.esito === "ok" ? "#2ECC71" : "#FF6B6B",
                  }}
                >
                  {f.esito === "ok" ? "risponde" : (f.esito ?? "mai letta")}
                </span>
                {!f.attiva && (
                  <span className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-[var(--tbh-muted)]">
                    spenta dal pannello
                  </span>
                )}
              </li>
            ))}
          </ul>
          <p className="max-w-[95ch] text-[12px] text-[var(--tbh-muted)]">{d.nota}</p>
          <Link
            to="/edicola/fonti"
            className="inline-flex w-fit items-center gap-2 rounded-full border border-[var(--tbh-line)] px-4 py-2 text-[12px] font-extrabold uppercase tracking-[0.1em] text-[var(--tbh-muted)] transition hover:border-white/40 hover:text-white"
          >
            <Info size={14} aria-hidden /> Elenco completo e fonti escluse
          </Link>
        </section>
      )}

      {/* ── LE ALTRE SEZIONI ────────────────────────────────────────────── */}
      {d && d.altre.length > 0 && (
        <nav aria-label="Altre sezioni dell'Edicola" className="mt-10 flex flex-wrap gap-2">
          {d.altre.map((c) => (
            <Link
              key={c.slug}
              to={c.href}
              className="rounded-full border border-[var(--tbh-line)] px-3 py-2 text-[11px] font-extrabold uppercase tracking-[0.1em] text-[var(--tbh-muted)] transition hover:-translate-y-0.5 hover:border-white/40 hover:text-white"
            >
              {c.emoji} {c.titolo}
            </Link>
          ))}
        </nav>
      )}

      {/* Eventi: schede amministrabili dal sito (registro «eventi»). */}
      {slug === "eventi" && (
        <div className="mt-14 grid gap-12 border-t border-white/10 pt-10">
          <SezioneAmministrabile sezione="eventi" />
        </div>
      )}
    </div>
  );
}
