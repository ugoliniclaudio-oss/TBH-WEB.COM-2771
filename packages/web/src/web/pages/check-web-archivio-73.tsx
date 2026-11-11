import { useMemo, useState } from "react";
import { Link } from "wouter";
import { AlertTriangle, ArrowRight, Archive } from "lucide-react";
import { COLORE_TBH } from "../lib/identita-tbh";
import { ARCHIVIO_73, STATO_ASSET, type AssetArchivio, type StatoAsset } from "../lib/archivio-73";

/* ────────────────────────────────────────────────────────────────────────────
   BOZZA «ARCHIVIO 73 ASSET» — 15/10/2026.
   Catalogo con l'immagine vera di ogni file, il nome verificato a vista e la
   proposta di collocazione. 73 asset NON sono 73 canali. Nessun file è stato
   assegnato a pagine, canali o loghi: è solo l'anteprima per l'approvazione.
   ──────────────────────────────────────────────────────────────────────────── */

const GIALLO = COLORE_TBH;
const ORDINE_STATI = Object.keys(STATO_ASSET) as StatoAsset[];

function kb(bytes: number) {
  return bytes >= 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(2)} MB` : `${Math.round(bytes / 1024)} KB`;
}

function Scheda({ a }: { a: AssetArchivio }) {
  const s = STATO_ASSET[a.stato];
  const nome = a.nomeVerificato ?? a.nomeCsv;
  return (
    <article
      className="flex min-w-0 flex-col overflow-hidden rounded-2xl border border-[var(--tbh-line)]"
      data-testid={`asset-${a.codice}`}
    >
      <div
        className="grid aspect-square place-items-center p-3"
        style={{
          backgroundColor: "#1c1c1c",
          backgroundImage:
            "linear-gradient(45deg,#232323 25%,transparent 25%),linear-gradient(-45deg,#232323 25%,transparent 25%),linear-gradient(45deg,transparent 75%,#232323 75%),linear-gradient(-45deg,transparent 75%,#232323 75%)",
          backgroundSize: "16px 16px",
          backgroundPosition: "0 0,0 8px,8px -8px,-8px 0",
        }}
      >
        <img
          src={a.file}
          alt={`${nome} — asset ${a.codice}`}
          loading="lazy"
          decoding="async"
          width={a.larghezza}
          height={a.altezza}
          className="max-h-full max-w-full object-contain"
        />
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-2 p-3">
        <div className="flex flex-wrap items-center justify-between gap-1">
          <span className="text-[10px] font-bold tracking-[0.18em] text-[var(--tbh-muted)]">ASSET {a.codice}</span>
          <span className="text-[10px] text-[var(--tbh-muted)]">
            {a.larghezza}×{a.altezza} · {kb(a.bytes)}
          </span>
        </div>
        <h3 className="text-base font-bold leading-tight text-[var(--tbh-platinum)]">{nome}</h3>
        {a.nomeVerificato && (
          <p className="flex items-start gap-1 text-[11px] leading-snug text-[#ff8a3d]">
            <AlertTriangle className="mt-0.5 h-3 w-3 shrink-0" /> Nel CSV è «{a.nomeCsv}», ma l'immagine è {a.nomeVerificato}.
          </p>
        )}
        <span
          className="w-fit rounded-full border px-2 py-0.5 text-[9px] font-bold tracking-[0.1em]"
          style={{ borderColor: s.colore, color: s.colore }}
        >
          {s.etichetta}
        </span>
        {a.canonico && <p className="text-[11px] text-[var(--tbh-muted)]">Marchio di riferimento: ASSET {a.canonico}</p>}
        <p className="text-xs leading-snug text-[var(--tbh-muted)]">{a.nota}</p>
        <code className="break-all text-[10px] text-[var(--tbh-muted)]/80">{a.originale}</code>
        <div className="mt-auto pt-1 text-xs">
          {a.destinazione ? (
            <Link to={a.destinazione.href} className="inline-flex items-center gap-1 font-semibold underline" style={{ color: GIALLO }}>
              {a.destinazione.label} <ArrowRight className="h-3 w-3 shrink-0" />
            </Link>
          ) : (
            <span className="text-[var(--tbh-muted)]">Nessuna pagina collegata</span>
          )}
        </div>
      </div>
    </article>
  );
}

export default function CheckWebArchivio73Page() {
  const [filtro, setFiltro] = useState<StatoAsset | "tutti">("tutti");

  const conteggi = useMemo(() => {
    const c: Partial<Record<StatoAsset, number>> = {};
    for (const a of ARCHIVIO_73) c[a.stato] = (c[a.stato] ?? 0) + 1;
    return c;
  }, []);

  const visibili = filtro === "tutti" ? ARCHIVIO_73 : ARCHIVIO_73.filter((a) => a.stato === filtro);
  const nomiSbagliati = ARCHIVIO_73.filter((a) => a.nomeVerificato);

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-8 md:py-12" data-testid="check-archivio-73">
      <header className="flex flex-col gap-3">
        <p className="text-[10px] uppercase tracking-[0.24em] text-[var(--tbh-muted)]">
          Bozza · proposta in attesa di approvazione
        </p>
        <h1 className="tbh-display tbh-h1 flex items-center gap-3 leading-none">
          <Archive className="h-8 w-8 shrink-0" style={{ color: GIALLO }} /> ARCHIVIO 73 ASSET
        </h1>
        <p className="tbh-body max-w-[80ch] text-[var(--tbh-muted)]">
          Tutti i file dell'archivio, con l'immagine vera. Ogni nome l'ho controllato guardando l'immagine, non il nome del
          file. 73 asset non sono 73 canali: ci sono marchi esterni, foto personali, varianti e duplicati. Nessun file è
          stato assegnato a pagine, canali o loghi.
        </p>
        <p className="flex items-start gap-2 rounded-2xl border border-[var(--tbh-gold)]/50 p-3 text-sm text-[var(--tbh-gold)]">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          I codici «TBH-0xx» di questo archivio sono codici di file e non coincidono con i codici del registro società
          (lì TBH-001 è Touch Communications). Per evitare confusione qui si scrive sempre «ASSET TBH-0xx».
        </p>
        <Link to="/check-web/canali-61-73" className="inline-flex w-fit items-center gap-2 text-sm text-[var(--tbh-platinum)] underline">
          Vai ai 13 monitor TBH-061…073 <ArrowRight className="h-4 w-4" />
        </Link>
      </header>

      {nomiSbagliati.length > 0 && (
        <section className="flex flex-col gap-3 rounded-3xl border border-[#ff8a3d]/60 p-4 md:p-5">
          <h2 className="tbh-display text-2xl leading-none text-[#ff8a3d]">
            {nomiSbagliati.length} NOMI DEL CSV NON CORRISPONDONO ALL'IMMAGINE
          </h2>
          <p className="text-sm text-[var(--tbh-muted)]">
            Da TBH-013 a TBH-020 i nomi del catalogo sono sfalsati rispetto ai file. Qui sotto vale il nome verificato a vista.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[420px] text-left text-sm">
              <thead className="text-[10px] uppercase tracking-[0.16em] text-[var(--tbh-muted)]">
                <tr>
                  <th className="py-1 pr-3">Asset</th>
                  <th className="py-1 pr-3">Nome nel CSV</th>
                  <th className="py-1">Cosa c'è davvero</th>
                </tr>
              </thead>
              <tbody>
                {nomiSbagliati.map((a) => (
                  <tr key={a.codice} className="border-t border-[var(--tbh-line)]">
                    <td className="py-1.5 pr-3 font-mono text-xs">{a.codice}</td>
                    <td className="py-1.5 pr-3 text-[var(--tbh-muted)] line-through">{a.nomeCsv}</td>
                    <td className="py-1.5 font-semibold text-[var(--tbh-platinum)]">{a.nomeVerificato}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <section className="flex flex-col gap-4">
        <div className="flex flex-wrap gap-2" role="group" aria-label="Filtra per stato">
          <button
            type="button"
            onClick={() => setFiltro("tutti")}
            className="rounded-full border px-3 py-1.5 text-[11px] font-bold tracking-[0.08em]"
            style={filtro === "tutti" ? { background: GIALLO, color: "#000", borderColor: GIALLO } : { borderColor: "var(--tbh-line)" }}
          >
            TUTTI · {ARCHIVIO_73.length}
          </button>
          {ORDINE_STATI.filter((k) => conteggi[k]).map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => setFiltro(k)}
              title={STATO_ASSET[k].spiega}
              className="rounded-full border px-3 py-1.5 text-[11px] font-bold tracking-[0.08em]"
              style={
                filtro === k
                  ? { background: STATO_ASSET[k].colore, color: "#000", borderColor: STATO_ASSET[k].colore }
                  : { borderColor: STATO_ASSET[k].colore, color: STATO_ASSET[k].colore }
              }
            >
              {STATO_ASSET[k].etichetta} · {conteggi[k]}
            </button>
          ))}
        </div>
        {filtro !== "tutti" && <p className="text-sm text-[var(--tbh-muted)]">{STATO_ASSET[filtro].spiega}</p>}

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {visibili.map((a) => (
            <Scheda key={a.codice} a={a} />
          ))}
        </div>
      </section>
    </div>
  );
}
