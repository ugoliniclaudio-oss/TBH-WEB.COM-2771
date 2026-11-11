import { useEffect, useMemo, useState } from "react";
import { Link } from "wouter";
import { ExternalLink } from "lucide-react";
import { RiquadroLogo } from "./tessera-logo";
import { usePartiteInEvidenza } from "../queries/portale";
import {
  TripleMonitor,
  useScorrimento,
  type ContenutoMonitor,
  type RecordTriple,
} from "./triple-monitor";

/* ────────────────────────────────────────────────────────────────────────────
   PARTITE IN EVIDENZA — vetrina della home (ordine di Claudio: si fa per prima).

   Cosa è, in una riga: una sola sezione che mostra le partite che hanno già un
   monitor acceso, prese dagli stessi `match_id` del modulo TRE MONITOR — quindi
   la home non racconta una storia diversa dalla pagina della società.

   REGOLE APPLICATE (docs/regole-ferree.md):
   · UN SOLO componente per i tre monitor: qui si monta `TripleMonitor`, non un
     clone «da home». Etichette, monitor spenti, spazi temporanei: quelli del
     modulo, senza una riga di grafica copiata;
   · un monitor = un ruolo della STESSA partita: i tre vetri nascono da un solo
     `matchId` e c'è un controllo che scarta il record se così non fosse;
   · `[ APRI SCHEDA ]` porta alla pagina della società CHE ESISTE GIÀ, aperta
     sulla partita giusta (`/sport/squadre/:slug?partita=<match_id>`): nessuna
     pagina nuova per la singola partita;
   · stemmi veri di `public/teams/` nel riquadro standard; se lo stemma di un
     avversario non è in repo compare la sigla del nome, non un logo prestato;
   · nessuna data dedotta: l'ordine è per monitor accesi, non per «più recenti»,
     perché i titoli del canale non dichiarano la data. Sta scritto in chiaro;
   · se non c'è nessuna partita con monitor accesi la sezione NON compare: mai
     un riquadro vuoto in home.
   ──────────────────────────────────────────────────────────────────────────── */

type Video = { titolo: string; url: string };

export type PartitaEvidenza = {
  matchId: string;
  slug: string;
  squadra: string;
  squadraNome: string;
  colore: string;
  casa: string;
  ospite: string;
  inCasa: boolean;
  avversario: string;
  risultato: string | null;
  competizione: string | null;
  dataConfermata: boolean;
  stemmaCasa: string | null;
  stemmaOspite: string | null;
  integrale: Video | null;
  sintesi: Video | null;
  interviste: Video | null;
  accesi: number;
};

/** Indirizzo canonico della partita: pagina della società, aperta su quel match_id. */
export function schedaPartita(p: PartitaEvidenza) {
  return `/sport/squadre/${p.slug}?partita=${encodeURIComponent(p.matchId)}`;
}

function monitorDa(
  v: Video | null,
  scheda: string,
  canale: string | null,
): ContenutoMonitor {
  if (!v) return { url: null, titolo: null };
  return {
    url: v.url,
    titolo: v.titolo,
    azioni: [
      { etichetta: "APRI SCHEDA", to: scheda, primaria: true },
      { etichetta: "GUARDA SU YOUTUBE", href: v.url },
      ...(canale ? [{ etichetta: "CANALE", href: canale }] : []),
    ],
  };
}

function recordDa(p: PartitaEvidenza, canale: string | null): RecordTriple {
  const scheda = schedaPartita(p);
  return {
    id: p.matchId,
    tipo: "sport",
    titolo: `${p.casa} – ${p.ospite}${p.risultato ? `  ${p.risultato}` : ""}`,
    categoria: p.competizione ?? `${p.squadra} · partita del canale`,
    dati: [
      p.inCasa ? "In casa" : "In trasferta",
      p.risultato
        ? `Risultato dichiarato nel titolo: ${p.risultato}`
        : "Risultato non dichiarato nel titolo",
      p.dataConfermata ? null : "Data ufficiale da confermare",
    ],
    colore: p.colore,
    monitor: [
      monitorDa(p.integrale, scheda, canale),
      monitorDa(p.sintesi, scheda, canale),
      monitorDa(p.interviste, scheda, canale),
    ],
  };
}

/** Coppia di stemmi della stessa partita: casa a sinistra, ospite a destra. */
function Stemmi({ p, misura = "sm" }: { p: PartitaEvidenza; misura?: "sm" | "md" }) {
  return (
    <span className="inline-flex shrink-0 items-center gap-1.5">
      <RiquadroLogo src={p.stemmaCasa} alt={`Stemma ${p.casa}`} misura={misura} colore={p.colore} />
      <span className="text-[10px] font-bold text-[var(--tbh-muted)]">VS</span>
      <RiquadroLogo
        src={p.stemmaOspite}
        alt={`Stemma ${p.ospite}`}
        misura={misura}
        colore={p.colore}
      />
    </span>
  );
}

export function PartiteInEvidenza({
  massimo = 12,
  titolo = "PARTITE IN EVIDENZA",
}: {
  massimo?: number;
  titolo?: string;
}) {
  const { data } = usePartiteInEvidenza(massimo);

  /* Un monitor = un ruolo della stessa partita: si tengono solo i record in cui
     i tre vetri arrivano dallo stesso match_id e almeno uno è acceso. */
  const elenco = useMemo(() => {
    const voci = (data?.partite ?? []) as PartitaEvidenza[];
    return voci.filter((p) => p.matchId && (p.integrale || p.sintesi || p.interviste));
  }, [data]);

  const scorri = useScorrimento(elenco);
  const [scelta, setScelta] = useState(0);

  // L'elenco arriva dal server: quando cambia si riparte dalla prima partita.
  useEffect(() => {
    scorri.vaiA(0);
    setScelta(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [elenco.length]);

  // Niente partite con monitor accesi → la sezione non compare (nessun riquadro vuoto).
  if (elenco.length === 0) return null;

  const corrente = scorri.corrente as PartitaEvidenza | null;
  if (!corrente) return null;
  const record = recordDa(corrente, data?.canaleDm ?? null);
  const etichetta = (p: PartitaEvidenza) =>
    `${p.casa} – ${p.ospite}${p.risultato ? ` ${p.risultato}` : ""}`;

  return (
    <section
      id="partite-in-evidenza"
      data-sezione="partite-in-evidenza"
      className="flex flex-col gap-4"
      aria-label="Partite in evidenza"
    >
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[10px] uppercase tracking-[0.24em] text-[var(--tbh-muted)]">
            Sport · tre monitor della stessa partita
          </p>
          <h2 className="tbh-display tbh-h2 uppercase leading-none">{titolo}</h2>
          <p className="tbh-body mt-1 text-sm text-[var(--tbh-muted)]">
            Partita integrale, highlights e interviste fine gara nello stesso posto.
            <strong className="text-[var(--tbh-platinum)]"> [ APRI SCHEDA ]</strong> porta alla
            pagina della società, aperta su questa partita.
          </p>
        </div>
        <p className="tbh-dato text-[11px] text-[var(--tbh-muted)] text-right">
          {data?.totale ?? elenco.length} partite con monitor accesi
          <br />
          {data?.treMonitor ?? 0} complete · {data?.societa ?? 0} società · in vetrina{" "}
          {elenco.length}
        </p>
      </div>

      {/* SCELTA DELLA PARTITA: stemmi veri, un pulsante per partita.
          Lo scorrimento orizzontale qui è la scelta; sul blocco dei monitor lo
          swipe cambia partita: due gesti distinti, come chiesto. */}
      <div
        className="flex gap-2 overflow-x-auto pb-1"
        role="tablist"
        aria-label="Partite in evidenza"
      >
        {elenco.map((p, i) => {
          const attivo = i === scelta;
          return (
            <button
              key={p.matchId}
              type="button"
              role="tab"
              aria-selected={attivo}
              onClick={() => {
                scorri.vaiA(i);
                setScelta(i);
              }}
              className={`flex shrink-0 items-center gap-2.5 rounded-2xl border px-3 py-2 text-left transition hover:-translate-y-0.5 ${
                attivo ? "bg-white/5" : "bg-black/40"
              }`}
              style={{ borderColor: attivo ? p.colore : "var(--tbh-line)" }}
            >
              <Stemmi p={p} />
              <span className="min-w-0">
                <span className="block text-[11px] font-bold leading-tight">
                  {p.casa} – {p.ospite}
                </span>
                <span className="block text-[9px] uppercase tracking-[0.16em] text-[var(--tbh-muted)]">
                  {p.risultato ?? "risultato non dichiarato"} ·{" "}
                  {p.accesi === 3 ? "3 monitor accesi" : `${p.accesi}/3 monitor`}
                </span>
              </span>
            </button>
          );
        })}
      </div>

      {/* I TRE MONITOR: il modulo unico, nessun clone. */}
      <TripleMonitor
        record={record}
        posizione={scorri.indice + 1}
        totale={elenco.length}
        precedente={
          scorri.indietro
            ? {
                etichetta: etichetta(elenco[scorri.indice - 1] as PartitaEvidenza),
                vai: () => {
                  scorri.indietro?.();
                  setScelta(scorri.indice - 1);
                },
              }
            : null
        }
        successivo={
          scorri.avanti
            ? {
                etichetta: etichetta(elenco[scorri.indice + 1] as PartitaEvidenza),
                vai: () => {
                  scorri.avanti?.();
                  setScelta(scorri.indice + 1);
                },
              }
            : null
        }
        sotto={
          <div
            className="flex flex-wrap items-center gap-2.5 border-t pt-3"
            style={{ borderColor: `${corrente.colore}22` }}
          >
            <Link
              to={schedaPartita(corrente)}
              className="tbh-neon-btn inline-flex items-center gap-2 px-5 py-2.5 text-[12px] font-extrabold tracking-[0.08em]"
            >
              APRI SCHEDA · {corrente.squadra}
            </Link>
            <Link
              to="/sport/squadre"
              className="inline-flex items-center gap-1.5 rounded-full border border-[var(--tbh-line)] px-4 py-2.5 text-[11px] font-bold hover:border-[var(--tbh-neon)] hover:text-[var(--tbh-neon)]"
            >
              TUTTE LE SOCIETÀ SEGUITE
            </Link>
            {data?.canaleDm ? (
              <a
                href={data.canaleDm}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-[11px] text-[var(--tbh-muted)] hover:text-[var(--tbh-neon)]"
              >
                <ExternalLink size={12} /> Canale del media partner
              </a>
            ) : null}
          </div>
        }
      />

      {/* Perché l'ordine non è «le più recenti»: sta scritto, non si deduce una data. */}
      <p className="text-xs text-[var(--tbh-muted)]">
        In vetrina prima le partite con più monitor accesi: la data della gara non è nei titoli
        del canale, quindi nessuna partita viene dichiarata «recente» senza il calendario
        ufficiale. {data?.nota}
      </p>
    </section>
  );
}
