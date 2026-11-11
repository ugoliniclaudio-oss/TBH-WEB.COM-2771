import { Link } from "wouter";
import { CalendarDays, MapPin, Radio } from "lucide-react";

/**
 * SCHEDA EVENTO del calendario sport — campi esatti chiesti da Claudio il 15/09/2026:
 * data/periodo · titolo · località · categoria · stato · descrizione breve · UN SOLO
 * pulsante «DETTAGLI», mostrato soltanto se i dettagli esistono davvero.
 * Nessun altro pulsante, nessun doppione, nessuna informazione aggiunta.
 */

export type Evento = {
  id: string;
  ordine: string;
  periodo: string;
  titolo: string;
  localita: string | null;
  categoria: string;
  stato: string;
  descrizione: string;
  categorieCoinvolte: string | null;
  dettagli: string | null;
  collegatoA: string | null;
  dm: boolean;
  ricorrenza: string | null;
};

/** I quattro stati ammessi, ognuno con il suo colore. Nessuno stato inventato. */
const STATO_STILE: Record<string, string> = {
  CONFERMATO: "bg-[var(--tbh-neon)] text-black",
  "IN PROGRAMMAZIONE": "bg-[var(--tbh-gold)] text-black",
  "IN VALUTAZIONE": "bg-white/12 text-[var(--tbh-platinum)] border border-[var(--tbh-line)]",
  CONCLUSO: "bg-white/5 text-[var(--tbh-muted)] border border-[var(--tbh-line)]",
};

export function StatoEventoBadge({ stato }: { stato: string }) {
  return (
    <span
      data-stato={stato}
      className={`text-[11px] font-bold tracking-wider px-3 py-1 rounded-full w-fit ${
        STATO_STILE[stato] ?? STATO_STILE["IN VALUTAZIONE"]
      }`}
    >
      {stato}
    </span>
  );
}

export function SchedaEvento({
  e,
  collegato,
}: {
  e: Evento;
  /** Titolo dell'iniziativa collegata: la scheda la richiama invece di ripetere l'evento. */
  collegato?: string | null;
}) {
  return (
    <article className="tbh-card p-5 flex flex-col gap-3" data-evento={e.id}>
      <div className="flex flex-wrap items-center gap-2">
        <StatoEventoBadge stato={e.stato} />
        <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--tbh-muted)] border border-[var(--tbh-line)] rounded-full px-3 py-1">
          {e.categoria}
        </span>
        {e.dm && (
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#ff2b2b] border border-[#ff2b2b66] rounded-full px-3 py-1 inline-flex items-center gap-1.5">
            <Radio size={12} /> Collaborazione DM
          </span>
        )}
      </div>

      <p className="text-sm font-semibold text-[var(--tbh-gold)] inline-flex items-center gap-2">
        <CalendarDays size={15} /> {e.periodo}
      </p>

      <h3 className="tbh-display text-2xl leading-tight">{e.titolo}</h3>

      {e.localita && (
        <p className="text-sm text-[var(--tbh-platinum)] inline-flex items-center gap-2">
          <MapPin size={15} className="text-[var(--tbh-muted)]" /> {e.localita}
        </p>
      )}

      <p className="text-sm text-[var(--tbh-muted)] grow">{e.descrizione}</p>

      {e.categorieCoinvolte && (
        <p className="text-xs text-[var(--tbh-platinum)]">
          Categorie: <strong>{e.categorieCoinvolte}</strong>
        </p>
      )}

      {collegato && (
        <p className="text-xs text-[var(--tbh-muted)]">
          Iniziativa collegata a: <strong>{collegato}</strong>
        </p>
      )}

      {/* Un solo pulsante, e solo se i dettagli esistono: niente bottoni morti. */}
      {e.dettagli && (
        <Link
          to={e.dettagli}
          className="tbh-neon-btn px-4 py-2 text-xs font-bold uppercase tracking-wide w-fit"
        >
          Dettagli
        </Link>
      )}
    </article>
  );
}

/**
 * PROSSIMI APPUNTAMENTI in ordine cronologico, massimo tre.
 * Le iniziative collegate non contano come evento separato: si mostra la scheda madre.
 */
export function prossimiAppuntamenti(eventi: Evento[], quanti = 3): Evento[] {
  return eventi
    .filter((e) => e.stato !== "CONCLUSO" && !e.collegatoA)
    .slice()
    .sort((a, b) => a.ordine.localeCompare(b.ordine))
    .slice(0, quanti);
}
