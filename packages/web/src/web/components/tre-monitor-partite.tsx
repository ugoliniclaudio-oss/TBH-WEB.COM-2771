import { useEffect, useMemo, useRef, useState } from "react";
import { ExternalLink, Film } from "lucide-react";
import {
  TripleMonitor,
  SelettorePeriodo,
  useScorrimento,
  PERIODI,
  type Periodo,
  type RecordTriple,
  type ContenutoMonitor,
} from "./triple-monitor";

/* ────────────────────────────────────────────────────────────────────────────
   TRE MONITOR — PARTITE DELLA SOCIETÀ
   Monta il modulo «STRUTTURA UNIVERSALE A TRE MONITOR» (docs/modulo-tre-monitor.md)
   sui dati reali: un record per `match_id`, mai due pagine per la stessa partita.

     Monitor 1 = PARTITA INTEGRALE
     Monitor 2 = HIGHLIGHTS  (ruolo tecnico interno: `sintesi`)
     Monitor 3 = INTERVISTE FINE GARA

   Video mancante → «In pubblicazione», la pagina non si blocca.
   I titoli delle partite in alto sono pulsanti: si clicca e il record si apre.
   Frecce PREC./SUCC. per scorrere le partite senza cambiare pagina.
   Niente loghi inventati, niente riquadri grigi muti, nessuna data dedotta.
   ──────────────────────────────────────────────────────────────────────────── */

/** Video del canale così come arriva dal server. */
type Video = { titolo: string; url: string };

export type PartitaTriple = {
  matchId: string;
  casa: string;
  ospite: string;
  inCasa: boolean;
  avversario: string;
  risultato: string | null;
  competizione: string | null;
  periodo: Periodo;
  dataConfermata: boolean;
  integrale: Video | null;
  sintesi: Video | null;
  interviste: Video | null;
  altri: Video[];
};

export type ContenutoSocietaTriple = Video & { ruolo: string; motivo: string };

function monitorDa(v: Video | null, canale: string | null): ContenutoMonitor {
  if (!v) return { url: null, titolo: null };
  return {
    url: v.url,
    titolo: v.titolo,
    azioni: [
      { etichetta: "GUARDA SU YOUTUBE", href: v.url },
      ...(canale ? [{ etichetta: "CANALE", href: canale }] : []),
    ],
  };
}

function recordDa(p: PartitaTriple, colore: string, canale: string | null): RecordTriple {
  return {
    id: p.matchId,
    tipo: "sport",
    titolo: `${p.casa} – ${p.ospite}${p.risultato ? `  ${p.risultato}` : ""}`,
    categoria: p.competizione ?? "Calcio · partita del canale",
    dati: [
      p.inCasa ? "In casa" : "In trasferta",
      p.risultato ? `Risultato dichiarato nel titolo: ${p.risultato}` : "Risultato non dichiarato nel titolo",
      p.dataConfermata ? null : "Data ufficiale da confermare",
    ],
    colore,
    monitor: [
      monitorDa(p.integrale, canale),
      monitorDa(p.sintesi, canale),
      monitorDa(p.interviste, canale),
    ],
  };
}

function primoPeriodoPieno(conteggi: Record<Periodo, number> | undefined): Periodo {
  if (!conteggi) return "ARCHIVIO";
  return PERIODI.find((p) => conteggi[p] > 0) ?? "ARCHIVIO";
}

export function TreMonitorPartite({
  squadra,
  colore,
  partite,
  contenuti,
  conteggi,
  nota,
  canale,
  apri,
}: {
  squadra: string;
  colore: string;
  partite: PartitaTriple[];
  contenuti: ContenutoSocietaTriple[];
  conteggi?: Record<Periodo, number>;
  nota?: string | null;
  canale?: string | null;
  /**
   * `match_id` da aprire all'arrivo: è così che «PARTITE IN EVIDENZA» della home
   * porta alla pagina della società GIÀ APERTA sulla partita giusta, senza creare
   * una pagina nuova per la singola partita. Se il match_id non esiste su questa
   * società non succede nulla: la pagina si apre normale, nessun errore a video.
   */
  apri?: string | null;
}) {
  const [periodo, setPeriodo] = useState<Periodo>(() => {
    const p = apri ? partite.find((x) => x.matchId === apri) : null;
    return p ? p.periodo : primoPeriodoPieno(conteggi);
  });

  const elenco = useMemo(
    () => partite.filter((p) => p.periodo === periodo),
    [partite, periodo],
  );
  const scorri = useScorrimento(elenco);
  const rif = useRef<HTMLElement>(null);
  const [agganciata, setAgganciata] = useState(false);

  // Cambiando fascia si riparte dalla prima partita di quella fascia.
  useEffect(() => {
    scorri.vaiA(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [periodo]);

  /* ARRIVO DALLA VETRINA: si apre il record chiesto e si porta il blocco a vista.
     Una volta sola, così poi le frecce e i titoli restano liberi. */
  useEffect(() => {
    if (!apri || agganciata) return;
    const i = elenco.findIndex((p) => p.matchId === apri);
    if (i < 0) return;
    scorri.vaiA(i);
    setAgganciata(true);
    rif.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apri, elenco, agganciata]);

  if (partite.length === 0) return null;

  const corrente = scorri.corrente;
  const record = corrente ? recordDa(corrente, colore, canale ?? null) : null;
  const etichetta = (p: PartitaTriple) =>
    `${p.inCasa ? "vs" : "a"} ${p.avversario}${p.risultato ? ` ${p.risultato}` : ""}`;

  return (
    <section ref={rif} id="partite" data-sezione="tre-monitor-partite" className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="tbh-display tbh-h2 uppercase" style={{ color: colore }}>
            Partite di {squadra} · tre monitor
          </h2>
          <p className="text-sm text-[var(--tbh-muted)]">
            Un solo record per partita: integrale, highlights e interviste nello stesso posto.
          </p>
        </div>
        <span className="tbh-dato text-[11px] text-[var(--tbh-muted)]">
          {partite.length} partite ricostruite
        </span>
      </div>

      <SelettorePeriodo valore={periodo} cambia={setPeriodo} conteggi={conteggi} colore={colore} />

      {/* TITOLI CLICCABILI: ogni partita è un pulsante, si apre nei tre monitor */}
      {elenco.length > 0 ? (
        <div className="flex gap-2 overflow-x-auto pb-1" role="tablist" aria-label="Partite">
          {elenco.map((p, i) => {
            const attivo = i === scorri.indice;
            return (
              <button
                key={p.matchId}
                type="button"
                role="tab"
                aria-selected={attivo}
                onClick={() => scorri.vaiA(i)}
                className={`shrink-0 rounded-full border px-3.5 py-2 text-[11px] font-bold tracking-[0.06em] transition ${
                  attivo ? "text-black" : "hover:border-[var(--tbh-neon)]"
                }`}
                style={
                  attivo
                    ? { background: colore, borderColor: colore }
                    : { borderColor: "var(--tbh-line)" }
                }
              >
                {etichetta(p)}
              </button>
            );
          })}
        </div>
      ) : (
        <p className="rounded-2xl border border-[var(--tbh-line)] p-4 text-sm text-[var(--tbh-muted)]">
          In questa fascia non c'è ancora nessuna partita pubblicata. Le partite ricostruite dai
          titoli del canale sono in <strong>ARCHIVIO</strong> finché non arriva il calendario
          ufficiale con le date.
        </p>
      )}

      {record && corrente ? (
        <TripleMonitor
          record={record}
          posizione={scorri.indice + 1}
          totale={elenco.length}
          precedente={
            scorri.indietro
              ? {
                  etichetta: etichetta(elenco[scorri.indice - 1] as PartitaTriple),
                  vai: scorri.indietro,
                }
              : null
          }
          successivo={
            scorri.avanti
              ? {
                  etichetta: etichetta(elenco[scorri.indice + 1] as PartitaTriple),
                  vai: scorri.avanti,
                }
              : null
          }
          sotto={
            corrente.altri.length > 0 ? (
              <div className="flex flex-col gap-1.5 border-t pt-3" style={{ borderColor: `${colore}22` }}>
                <p className="text-[9px] uppercase tracking-[0.22em] text-[var(--tbh-muted)]">
                  Altri video della stessa partita
                </p>
                {corrente.altri.map((v) => (
                  <a
                    key={v.url}
                    href={v.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-start gap-1.5 text-[12px] text-[var(--tbh-platinum)] hover:text-[var(--tbh-neon)]"
                  >
                    <ExternalLink size={12} className="mt-1 shrink-0" /> {v.titolo}
                  </a>
                ))}
              </div>
            ) : null
          }
        />
      ) : null}

      {/* CONTENUTI DELLA SOCIETÀ: video reali che non dichiarano una partita.
          Dichiarati come tali, mai abbinati per somiglianza. */}
      {contenuti.length > 0 ? (
        <details className="rounded-2xl border border-[var(--tbh-line)] p-4">
          <summary className="tbh-display cursor-pointer text-[13px] uppercase tracking-[0.1em]">
            <Film size={14} className="mr-1.5 inline" />
            Contenuti della società ({contenuti.length})
          </summary>
          <p className="mt-2 text-xs text-[var(--tbh-muted)]">
            Video del canale che nel titolo non nominano una partita (presentazioni, speciali,
            interviste senza avversario): restano qui, non vengono abbinati a caso.
          </p>
          <ul className="mt-2 flex flex-col gap-1.5">
            {contenuti.map((v) => (
              <li key={v.url}>
                <a
                  href={v.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-start gap-1.5 text-[13px] text-[var(--tbh-platinum)] hover:text-[var(--tbh-neon)]"
                >
                  <ExternalLink size={13} className="mt-1 shrink-0" /> {v.titolo}
                </a>
              </li>
            ))}
          </ul>
        </details>
      ) : null}

      {nota ? <p className="text-xs text-[var(--tbh-muted)]">{nota}</p> : null}
    </section>
  );
}
