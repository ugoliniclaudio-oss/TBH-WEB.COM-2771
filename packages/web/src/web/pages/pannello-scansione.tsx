import { useMemo, useState } from "react";
import { Link } from "wouter";
import {
  AlertTriangle,
  CheckCircle2,
  ClipboardList,
  Copy,
  ExternalLink,
  Image as ImageIcon,
  Loader2,
  RefreshCw,
  ScanSearch,
} from "lucide-react";
import { SbloccoAllestimento, useCodiceAllestimento } from "../components/media-slot";
import { useScansione, useStatoScansione } from "../queries/scansione";

/**
 * ADMIN → SCANSIONE DEL SITO (specifica 17/09/2026, punto 8).
 *
 * «Fai una scansione di tutto il sito e dammi l'elenco amministrativo dei difetti.»
 *
 * Questa pagina NON corregge da sola e non inventa niente: mostra, riga per riga,
 * che cosa manca e dove, con il nome per esteso dell'entità, l'anagrafica in cui
 * sta il problema, la pagina dove si vede e che cosa fare per chiuderlo.
 *
 * Il conto è fatto dal server leggendo le anagrafiche reali e i file veri nella
 * cartella del sito: nessun numero è stimato.
 */

const COLORE_GRAVITA: Record<string, string> = {
  bloccante: "text-[#ff6b6b] border-[#ff6b6b]",
  "da-sistemare": "text-[var(--tbh-gold)] border-[var(--tbh-gold)]",
  "da-completare": "text-[var(--tbh-muted)] border-[var(--tbh-line)]",
};

type Difetto = {
  tipo: string;
  gravita: string;
  entita: string;
  anagrafica: string;
  problema: string;
  cosaFare: string;
  pagina: string | null;
  riferimento: string | null;
};

export default function PannelloScansionePage() {
  const { codice } = useCodiceAllestimento();
  const stato = useStatoScansione();
  const q = useScansione(codice);
  const [tipo, setTipo] = useState<string>("");
  const [cerca, setCerca] = useState("");
  const [copiato, setCopiato] = useState(false);

  const difetti = (q.data?.difetti ?? []) as Difetto[];

  const mostrati = useMemo(() => {
    const t = cerca.trim().toLowerCase();
    return difetti.filter((d) => {
      if (tipo && d.tipo !== tipo) return false;
      if (!t) return true;
      return (
        d.entita.toLowerCase().includes(t) ||
        d.anagrafica.toLowerCase().includes(t) ||
        (d.pagina ?? "").toLowerCase().includes(t) ||
        (d.riferimento ?? "").toLowerCase().includes(t)
      );
    });
  }, [difetti, tipo, cerca]);

  async function copiaElenco() {
    const righe = mostrati.map(
      (d, i) =>
        `${i + 1}. [${d.gravita.toUpperCase()}] ${d.entita} — ${d.anagrafica}\n   Problema: ${d.problema}\n   Da fare: ${d.cosaFare}${d.pagina ? `\n   Pagina: ${d.pagina}` : ""}${d.riferimento ? `\n   File: ${d.riferimento}` : ""}`,
    );
    try {
      await navigator.clipboard.writeText(
        `SCANSIONE DEL SITO — ${mostrati.length} voci\n\n${righe.join("\n\n")}`,
      );
      setCopiato(true);
      setTimeout(() => setCopiato(false), 2500);
    } catch {
      /* se il browser non lo permette, l'elenco resta comunque leggibile a schermo */
    }
  }

  return (
    <div className="mx-auto max-w-[1500px] px-4 md:px-8 py-10">
      <header className="tbh-rise mb-6">
        <p className="text-xs tracking-[0.25em] text-[var(--tbh-gold)] uppercase mb-2">
          Pannello riservato · controllo del sito
        </p>
        <h1 className="tbh-display tbh-h1 flex items-center gap-3">
          <ScanSearch className="text-[var(--tbh-neon)] shrink-0" size={32} /> Scansione del sito
        </h1>
        <p className="tbh-body text-[var(--tbh-muted)] max-w-3xl mt-3">
          Elenco di lavoro di chi allestisce: loghi mancanti, loghi presenti in una pagina e non in
          un'altra, stesso file su marchi diversi, file non trovati, loghi troppo piccoli per i
          riquadri grandi, monitor senza video, entità scritte in più modi. Niente viene corretto da
          solo e niente viene inventato: dove manca il contenuto la pagina scrive IN ALLESTIMENTO.
        </p>
        <p className="text-sm mt-3">
          Il caricamento dei file originali si fa dal{" "}
          <Link href="/allestimento" className="text-[var(--tbh-neon)] underline">
            pannello di allestimento
          </Link>
          : il file entra nel record master e cambia in tutte le pagine nello stesso momento.
        </p>
      </header>

      {stato.data && !stato.data.configurato ? (
        <div className="tbh-card p-5 flex items-start gap-3">
          <AlertTriangle className="text-[var(--tbh-gold)] shrink-0" size={22} />
          <p className="text-sm text-[var(--tbh-muted)]">
            Il pannello è spento sul server: manca il codice di allestimento nelle impostazioni.
          </p>
        </div>
      ) : !codice ? (
        <SbloccoAllestimento />
      ) : (
        <>
          {q.isLoading ? (
            <div className="tbh-card p-8 flex items-center gap-3 text-[var(--tbh-muted)]">
              <Loader2 className="animate-spin" size={20} /> Scansione in corso: si stanno leggendo
              le anagrafiche e i file del sito.
            </div>
          ) : q.isError ? (
            <div className="tbh-card p-5 flex items-start gap-3">
              <AlertTriangle className="text-[#ff6b6b] shrink-0" size={22} />
              <div className="text-sm">
                <p className="font-bold">La scansione non è andata a buon fine.</p>
                <p className="text-[var(--tbh-muted)] mt-1">
                  {(q.error as Error | null)?.message ?? "Errore non descritto dal server."}
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* ── Riepilogo per gravità ─────────────────────────────────── */}
              <div className="grid gap-3 sm:grid-cols-3 mb-5">
                {(q.data?.riepilogoGravita ?? []).map((g) => (
                  <div key={g.gravita} className={`tbh-card p-5 border-l-4 ${COLORE_GRAVITA[g.gravita] ?? ""}`}>
                    <p className="text-3xl font-black">{g.quanti}</p>
                    <p className="text-xs uppercase tracking-wide text-[var(--tbh-muted)] mt-1">
                      {g.etichetta}
                    </p>
                  </div>
                ))}
              </div>

              {/* ── Filtri per tipo ──────────────────────────────────────── */}
              <div className="tbh-card p-4 mb-5">
                <div className="flex flex-wrap gap-2 items-center">
                  <button
                    type="button"
                    onClick={() => setTipo("")}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${
                      tipo === ""
                        ? "bg-[var(--tbh-neon)] text-black border-transparent"
                        : "border-[var(--tbh-line)] hover:border-[var(--tbh-neon)]"
                    }`}
                  >
                    Tutti ({difetti.length})
                  </button>
                  {(q.data?.riepilogoTipi ?? []).map((t) => (
                    <button
                      key={t.tipo}
                      type="button"
                      onClick={() => setTipo(t.tipo)}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${
                        tipo === t.tipo
                          ? "bg-[var(--tbh-neon)] text-black border-transparent"
                          : "border-[var(--tbh-line)] hover:border-[var(--tbh-neon)]"
                      }`}
                    >
                      {t.etichetta} ({t.quanti})
                    </button>
                  ))}
                </div>

                <div className="flex flex-wrap gap-3 items-center mt-4">
                  <input
                    value={cerca}
                    onChange={(e) => setCerca(e.target.value)}
                    placeholder="Cerca per nome, anagrafica, pagina o file…"
                    className="flex-1 min-w-[240px] bg-black/30 border border-[var(--tbh-line)] rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[var(--tbh-neon)]"
                  />
                  <button
                    type="button"
                    onClick={() => q.refetch()}
                    className="px-4 py-2.5 rounded-xl border border-[var(--tbh-line)] text-sm font-semibold inline-flex items-center gap-2 hover:border-[var(--tbh-neon)]"
                  >
                    {q.isFetching ? (
                      <Loader2 className="animate-spin" size={16} />
                    ) : (
                      <RefreshCw size={16} />
                    )}
                    Rifai la scansione
                  </button>
                  <button
                    type="button"
                    onClick={copiaElenco}
                    className="px-4 py-2.5 rounded-xl border border-[var(--tbh-line)] text-sm font-semibold inline-flex items-center gap-2 hover:border-[var(--tbh-neon)]"
                  >
                    {copiato ? <CheckCircle2 size={16} className="text-[var(--tbh-neon)]" /> : <Copy size={16} />}
                    {copiato ? "Elenco copiato" : "Copia l'elenco"}
                  </button>
                </div>
              </div>

              {/* ── Elenco ───────────────────────────────────────────────── */}
              {mostrati.length === 0 ? (
                <div className="tbh-card p-8 flex items-center gap-3">
                  <CheckCircle2 className="text-[var(--tbh-neon)]" size={22} />
                  <p className="text-sm">
                    Nessun difetto in questo filtro.
                  </p>
                </div>
              ) : (
                <div className="grid gap-3">
                  {mostrati.map((d, i) => (
                    <article
                      key={`${d.tipo}-${d.entita}-${d.anagrafica}-${i}`}
                      className={`tbh-card p-5 border-l-4 ${COLORE_GRAVITA[d.gravita] ?? ""}`}
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="min-w-[240px]">
                          <p className="font-bold text-lg">{d.entita}</p>
                          <p className="text-xs uppercase tracking-wide text-[var(--tbh-muted)] mt-1">
                            {d.anagrafica}
                          </p>
                        </div>
                        <span
                          className={`shrink-0 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wide border ${
                            COLORE_GRAVITA[d.gravita] ?? ""
                          }`}
                        >
                          {(q.data?.riepilogoTipi ?? []).find((t) => t.tipo === d.tipo)?.etichetta ??
                            d.tipo}
                        </span>
                      </div>

                      <p className="text-sm mt-3">{d.problema}</p>
                      <p className="text-sm text-[var(--tbh-muted)] mt-2">
                        <span className="font-semibold text-white">Da fare: </span>
                        {d.cosaFare}
                      </p>

                      <div className="flex flex-wrap gap-2 mt-4 text-xs">
                        {d.pagina ? (
                          <Link
                            href={d.pagina}
                            className="px-3 py-1.5 rounded-full border border-[var(--tbh-line)] inline-flex items-center gap-1.5 hover:border-[var(--tbh-neon)]"
                          >
                            <ExternalLink size={13} /> Vai alla pagina {d.pagina}
                          </Link>
                        ) : null}
                        {d.riferimento ? (
                          <span className="px-3 py-1.5 rounded-full bg-black/30 border border-[var(--tbh-line)] inline-flex items-center gap-1.5 font-mono">
                            <ImageIcon size={13} /> {d.riferimento}
                          </span>
                        ) : null}
                      </div>
                    </article>
                  ))}
                </div>
              )}

              <div className="tbh-card p-5 mt-6 flex items-start gap-3">
                <ClipboardList className="text-[var(--tbh-muted)] shrink-0" size={20} />
                <div className="text-sm text-[var(--tbh-muted)]">
                  <p>{q.data?.nota}</p>
                  {q.data?.eseguitaIl ? (
                    <p className="mt-2">
                      Scansione eseguita il{" "}
                      {new Date(q.data.eseguitaIl).toLocaleString("it-IT", {
                        dateStyle: "short",
                        timeStyle: "short",
                      })}
                      . Voci controllate: {difetti.length} difetti trovati.
                    </p>
                  ) : null}
                </div>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
