import { useState } from "react";
import { TripleMonitor, type RecordTriple } from "./triple-monitor";

/* ────────────────────────────────────────────────────────────────────────────
   TRE MONITOR — SERIE DI RECORD
   Lo stesso modulo del calcio, usato dove non servono le tre fasce di periodo:
   musica (release_id), aziende (entity_id), corsi, prodotti, servizi, eventi.

   Un solo record alla volta nei tre monitor, titoli cliccabili in alto,
   frecce PREC./SUCC. Nessun contenuto inventato: i monitor senza video
   restano dichiarati «in pubblicazione».
   ──────────────────────────────────────────────────────────────────────────── */

export function TreMonitorSerie({
  titolo,
  sottotitolo,
  colore,
  record,
  etichette,
  nota,
  conteggio,
}: {
  titolo: string;
  sottotitolo?: string | null;
  colore: string;
  record: RecordTriple[];
  /** Testo del pulsante-titolo di ogni record, nello stesso ordine. */
  etichette: string[];
  nota?: string | null;
  /** Riga di destra: es. «40 brani pubblicati». */
  conteggio?: string | null;
}) {
  const [i, setI] = useState(0);
  if (record.length === 0) return null;
  const indice = Math.min(i, record.length - 1);
  const corrente = record[indice] as RecordTriple;

  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="tbh-display tbh-h2 uppercase" style={{ color: colore }}>
            {titolo}
          </h2>
          {sottotitolo ? <p className="text-sm text-[var(--tbh-muted)]">{sottotitolo}</p> : null}
        </div>
        {conteggio ? (
          <span className="tbh-dato text-[11px] text-[var(--tbh-muted)]">{conteggio}</span>
        ) : null}
      </div>

      {/* TITOLI CLICCABILI */}
      <div className="flex gap-2 overflow-x-auto pb-1" role="tablist" aria-label={titolo}>
        {record.map((r, k) => {
          const attivo = k === indice;
          return (
            <button
              key={r.id}
              type="button"
              role="tab"
              aria-selected={attivo}
              onClick={() => setI(k)}
              className={`shrink-0 rounded-full border px-3.5 py-2 text-[11px] font-bold tracking-[0.06em] transition ${
                attivo ? "text-black" : "hover:border-[var(--tbh-neon)]"
              }`}
              style={
                attivo
                  ? { background: colore, borderColor: colore }
                  : { borderColor: "var(--tbh-line)" }
              }
            >
              {etichette[k] ?? r.titolo}
            </button>
          );
        })}
      </div>

      <TripleMonitor
        record={corrente}
        posizione={indice + 1}
        totale={record.length}
        precedente={
          indice > 0
            ? {
                etichetta: etichette[indice - 1] ?? "Precedente",
                vai: () => setI(indice - 1),
              }
            : null
        }
        successivo={
          indice < record.length - 1
            ? {
                etichetta: etichette[indice + 1] ?? "Successivo",
                vai: () => setI(indice + 1),
              }
            : null
        }
      />

      {nota ? <p className="text-xs text-[var(--tbh-muted)]">{nota}</p> : null}
    </section>
  );
}
