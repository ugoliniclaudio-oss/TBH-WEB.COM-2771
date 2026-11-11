import { Link } from "wouter";
import { AlertTriangle, ArrowRight, ExternalLink, Lock, Tv } from "lucide-react";
import { COLORE_TBH } from "../lib/identita-tbh";
import { ESITO_MONITOR, MONITOR_61_73, assetPerCodice, type MonitorImport } from "../lib/archivio-73";

/* ────────────────────────────────────────────────────────────────────────────
   BOZZA «13 CANALI · TBH-061…073» — 15/10/2026.
   Anteprima di come apparirebbe ogni voce nel palinsesto: monitor con
   l'immagine originale, titolo, descrizione e «Scopri di più» con la
   destinazione scritta in chiaro. NIENTE è nel palinsesto vero: i canali,
   la home e il menu restano invariati finché Claudio non approva.
   ──────────────────────────────────────────────────────────────────────────── */

const GIALLO = COLORE_TBH;

function Monitor({ m }: { m: MonitorImport }) {
  const asset = assetPerCodice(m.codice);
  const esito = ESITO_MONITOR[m.esito];
  const spento = m.esito === "bloccato";

  return (
    <article
      className="flex min-w-0 flex-col gap-4 rounded-3xl border border-[var(--tbh-line)] bg-[var(--tbh-panel,#0b0b0b)] p-4 md:p-5"
      data-testid={`monitor-${m.codice}`}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--tbh-muted)]">ASSET {m.codice}</span>
        <span
          className="rounded-full border px-2.5 py-1 text-[10px] font-bold tracking-[0.12em]"
          style={{ borderColor: esito.colore, color: esito.colore }}
        >
          {esito.etichetta}
        </span>
      </div>

      {/* Il monitor: cornice nera, schermo 16:9 con l'immagine originale intera. */}
      <div className="rounded-2xl border-[6px] border-[#1a1a1a] bg-black shadow-[0_0_0_1px_#2a2a2a] md:border-[8px]">
        <div className="relative grid aspect-video place-items-center overflow-hidden rounded-md bg-black">
          {asset && (
            <img
              src={asset.file}
              alt={`${m.titolo} — immagine originale ${m.codice}`}
              loading="lazy"
              decoding="async"
              width={asset.larghezza}
              height={asset.altezza}
              className={`h-full w-full object-contain ${spento ? "opacity-60" : ""}`}
            />
          )}
          {spento && (
            <span className="absolute left-2 top-2 flex items-center gap-1 rounded-full bg-black/80 px-2 py-1 text-[10px] font-bold tracking-[0.14em] text-[#ff8a3d]">
              <Lock className="h-3 w-3" /> NON PUBBLICATO
            </span>
          )}
        </div>
        <div className="mx-auto h-1.5 w-1/4 rounded-b bg-[#1a1a1a]" aria-hidden />
      </div>

      <div className="flex min-w-0 flex-col gap-2">
        <h2 className="tbh-display text-2xl leading-none md:text-3xl" style={{ color: GIALLO }}>
          {m.titolo}
        </h2>
        <p className="text-sm leading-relaxed text-[var(--tbh-platinum)]">{m.descrizione}</p>
        {m.noteJson && <p className="text-xs italic text-[var(--tbh-muted)]">{m.noteJson}</p>}
      </div>

      {/* CTA: si mostra com'è, ma la destinazione è scritta in chiaro. */}
      <div className="flex flex-col gap-2 rounded-2xl border border-dashed border-[var(--tbh-line)] p-3">
        {m.destinazione && !spento ? (
          <Link
            to={m.destinazione.href}
            className="inline-flex w-fit items-center gap-2 rounded-full px-4 py-2 text-sm font-bold text-black"
            style={{ background: GIALLO }}
          >
            {m.cta} <ArrowRight className="h-4 w-4" />
          </Link>
        ) : (
          <span className="inline-flex w-fit cursor-not-allowed items-center gap-2 rounded-full border border-[var(--tbh-line)] px-4 py-2 text-sm font-bold text-[var(--tbh-muted)]">
            {m.cta} · senza link
          </span>
        )}
        <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-xs">
          <dt className="text-[var(--tbh-muted)]">Porta a</dt>
          <dd className="min-w-0 break-words text-[var(--tbh-platinum)]">
            {m.destinazione && !spento ? (
              <>
                {m.destinazione.label} · <code>{m.destinazione.href}</code>
              </>
            ) : (
              "nessuna pagina (bozza non pubblicata)"
            )}
          </dd>
          <dt className="text-[var(--tbh-muted)]">Link nel JSON</dt>
          <dd className="min-w-0 break-all text-[var(--tbh-platinum)]">
            {m.hrefJson ? (
              <span className="inline-flex items-center gap-1">
                <ExternalLink className="h-3 w-3 shrink-0" /> {m.hrefJson}
              </span>
            ) : (
              "nessuno (null)"
            )}
          </dd>
          <dt className="text-[var(--tbh-muted)]">Canale</dt>
          <dd className="min-w-0 text-[var(--tbh-platinum)]">
            {m.canaleProposto ? `dentro ${m.canaleProposto.nome} (canale esistente)` : "da decidere"}
          </dd>
          {m.canonico && (
            <>
              <dt className="text-[var(--tbh-muted)]">Marchio</dt>
              <dd className="text-[var(--tbh-platinum)]">variante di ASSET {m.canonico}</dd>
            </>
          )}
        </dl>
      </div>

      {m.avviso && (
        <p className="flex items-start gap-2 text-xs leading-relaxed text-[var(--tbh-gold)]">
          <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" /> {m.avviso}
        </p>
      )}
    </article>
  );
}

export default function CheckWebCanali6173Page() {
  const conteggio = MONITOR_61_73.reduce<Record<string, number>>((acc, m) => {
    acc[m.esito] = (acc[m.esito] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-8 md:py-12" data-testid="check-canali-61-73">
      <header className="flex flex-col gap-3">
        <p className="text-[10px] uppercase tracking-[0.24em] text-[var(--tbh-muted)]">
          Bozza · proposta in attesa di approvazione
        </p>
        <h1 className="tbh-display tbh-h1 flex items-center gap-3 leading-none">
          <Tv className="h-8 w-8 shrink-0" style={{ color: GIALLO }} /> 13 VOCI · TBH-061…073
        </h1>
        <p className="tbh-body max-w-[80ch] text-[var(--tbh-muted)]">
          Ogni monitor usa l'immagine originale del pacchetto, con titolo e descrizione presi dal file{" "}
          <code>canali_61_73.json</code> senza riscritture. Sotto ogni «Scopri di più» c'è scritto dove porterebbe: solo
          pagine che esistono già nel sito. Il palinsesto vero, la home e il menu non sono stati toccati.
        </p>
        <div className="flex flex-wrap gap-2 text-[11px] font-bold tracking-[0.1em]">
          {(Object.keys(ESITO_MONITOR) as (keyof typeof ESITO_MONITOR)[]).map((k) => (
            <span
              key={k}
              className="rounded-full border px-3 py-1"
              style={{ borderColor: ESITO_MONITOR[k].colore, color: ESITO_MONITOR[k].colore }}
            >
              {conteggio[k] ?? 0} · {ESITO_MONITOR[k].etichetta}
            </span>
          ))}
        </div>
        <p className="flex items-start gap-2 rounded-2xl border border-[var(--tbh-gold)]/50 p-3 text-sm text-[var(--tbh-gold)]">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          Non sono 13 canali nuovi: ogni voce diventerebbe un pulsante dentro un canale che c'è già. Le varianti (063, 072
          → Touch Security; 064 → Touch Project) non creano marchi doppi.
        </p>
        <Link to="/check-web/archivio-73" className="inline-flex w-fit items-center gap-2 text-sm text-[var(--tbh-platinum)] underline">
          Vai all'archivio completo dei 73 asset <ArrowRight className="h-4 w-4" />
        </Link>
      </header>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        {MONITOR_61_73.map((m) => (
          <Monitor key={m.codice} m={m} />
        ))}
      </div>
    </div>
  );
}
