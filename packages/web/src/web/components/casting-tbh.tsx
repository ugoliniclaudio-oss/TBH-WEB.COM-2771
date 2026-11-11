import { CLASSE_FRECCIA_FILA, useFilaScorrevole } from "./carosello-orizzontale";
import { Link } from "wouter";
import {
  CalendarClock,
  ChevronLeft,
  ChevronRight,
  Clapperboard,
  MapPin,
  Music4,
  Users,
} from "lucide-react";

/* ────────────────────────────────────────────────────────────────────────────
   CASTING VIDEOCLIP — pezzi visivi comuni (Priorità 2quater, 29/09/2026).

   «CASTING APERTI: non una lista testuale, ma un CAROSELLO VISUALE con locandina,
    titolo del videoclip, ruoli cercati, scadenza, stato e i pulsanti DETTAGLI e
    CANDIDATI.»

   Questi componenti servono la pagina Casting videoclip, la bacheca Lavoro &
   Casting e Road to 2030: leggono tutti lo stesso record master, cambiano solo
   il filtro. Niente etichette scritte a mano: lo stato arriva dal database e se
   il casting viene chiuso l'etichetta sparisce da sola.
   ──────────────────────────────────────────────────────────────────────────── */

export type RuoloCasting = {
  ruolo: string;
  categoria: string;
  quantita: string;
  nota: string;
};

export type CastingPubblico = {
  id: number;
  slug: string;
  ambito: string;
  stato: string;
  titolo: string;
  titoloProgetto: string | null;
  descrizione: string | null;
  requisiti: string | null;
  location: string | null;
  periodo: string | null;
  scadenza: string | null;
  produzione: string | null;
  compenso: string | null;
  locandina: string | null;
  ruoli: RuoloCasting[];
  brano: {
    id: string;
    titolo: string;
    artista: string | null;
    cover: string | null;
    audioUrl: string | null;
  } | null;
  aperto: boolean;
};

export const NOMI_STATO_CASTING: Record<string, string> = {
  aperto: "CASTING APERTO",
  "in-selezione": "IN SELEZIONE",
  chiuso: "CASTING CHIUSO",
  "cast-completato": "CAST COMPLETATO",
};

export const NOMI_AMBITO_CASTING: Record<string, string> = {
  videoclip: "Videoclip musicale",
  cinema: "Cinema",
  "tv-format": "TV / Format",
  reality: "Reality",
  altro: "Altra produzione",
};

/** Il colore dello stato: aperto e in selezione risaltano, chiuso si spegne. */
function coloreStato(stato: string) {
  if (stato === "aperto") return { bordo: "#b26bff", testo: "#d9b8ff", fondo: "rgba(178,107,255,0.12)" };
  if (stato === "in-selezione")
    return { bordo: "var(--tbh-gold)", testo: "var(--tbh-gold)", fondo: "rgba(212,175,55,0.10)" };
  return { bordo: "rgba(255,255,255,0.18)", testo: "var(--tbh-muted)", fondo: "rgba(255,255,255,0.04)" };
}

export function StatoCastingBadge({ stato }: { stato: string }) {
  const c = coloreStato(stato);
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-extrabold uppercase tracking-[0.12em]"
      style={{ border: `1px solid ${c.bordo}`, color: c.testo, background: c.fondo }}
    >
      <Users size={12} /> {NOMI_STATO_CASTING[stato] ?? stato}
    </span>
  );
}

/**
 * LA CARD DI UN CASTING — locandina, titolo del videoclip, ruoli, scadenza, stato
 * e i due pulsanti. Se la locandina non è stata caricata resta il riquadro del
 * progetto: nessuna immagine viene inventata.
 */
export function CardCasting({
  c,
  larghezzaFissa = false,
}: {
  c: CastingPubblico;
  larghezzaFissa?: boolean;
}) {
  const immagine = c.locandina ?? c.brano?.cover ?? null;
  const ruoli = c.ruoli.slice(0, 4);

  return (
    <article
      className={`tbh-card flex flex-col overflow-hidden ${
        larghezzaFissa ? "w-[300px] shrink-0 snap-start" : ""
      }`}
      style={c.aperto ? { borderColor: "rgba(178,107,255,0.45)" } : undefined}
    >
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-black/40">
        {immagine ? (
          <img src={immagine} alt={c.titolo} className="size-full object-cover" loading="lazy" />
        ) : (
          <div className="flex size-full flex-col items-center justify-center gap-2 px-4 text-center">
            <Clapperboard className="size-8 text-[var(--tbh-muted)]" />
            <p className="tbh-body text-[12px] text-[var(--tbh-muted)]">
              Locandina non ancora pubblicata
            </p>
          </div>
        )}
        <div className="absolute left-3 top-3">
          <StatoCastingBadge stato={c.stato} />
        </div>
      </div>

      <div className="flex grow flex-col gap-2 p-4">
        <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--tbh-gold)]">
          {NOMI_AMBITO_CASTING[c.ambito] ?? c.ambito}
        </span>
        <h3 className="tbh-display text-xl leading-tight">{c.titolo}</h3>

        {(c.titoloProgetto || c.brano) && (
          <p className="tbh-body flex items-center gap-1.5 text-[13px] text-[var(--tbh-muted)]">
            <Music4 size={14} className="shrink-0" />
            {c.titoloProgetto ?? c.brano?.titolo}
          </p>
        )}

        {ruoli.length > 0 && (
          <ul className="mt-1 flex flex-wrap gap-1.5">
            {ruoli.map((r, i) => (
              <li
                key={`${r.ruolo}-${i}`}
                className="tbh-body rounded-full border border-white/12 px-2.5 py-1 text-[11px] text-[var(--tbh-fg)]"
              >
                {r.ruolo}
                {r.quantita ? ` · ${r.quantita}` : ""}
              </li>
            ))}
            {c.ruoli.length > ruoli.length && (
              <li className="tbh-body px-1 py-1 text-[11px] text-[var(--tbh-muted)]">
                +{c.ruoli.length - ruoli.length}
              </li>
            )}
          </ul>
        )}

        {c.location && (
          <p className="tbh-body flex items-center gap-1.5 text-[12px] text-[var(--tbh-muted)]">
            <MapPin size={13} /> {c.location}
          </p>
        )}
        {c.scadenza && (
          <p className="tbh-body flex items-center gap-1.5 text-[12px] text-[var(--tbh-muted)]">
            <CalendarClock size={13} /> Scadenza: {c.scadenza}
          </p>
        )}

        <div className="mt-auto flex flex-wrap gap-2 pt-3">
          <Link
            href={`/casting/${c.slug}`}
            className="tbh-body rounded-xl border border-[var(--tbh-line)] px-4 py-2 text-[13px] font-bold hover:border-[var(--tbh-neon)]"
          >
            Dettagli
          </Link>
          {c.aperto && (
            <Link
              href={`/casting/${c.slug}#candidati`}
              className="tbh-body rounded-xl px-4 py-2 text-[13px] font-extrabold uppercase tracking-[0.06em]"
              style={{ background: "#b26bff", color: "#0b0b0f" }}
            >
              Candidati
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}

/**
 * IL CAROSELLO «CASTING APERTI» — scorrimento reale con frecce, non una lista.
 * Quando non c'è nessun casting aperto lo dichiara: non si riempie con altro.
 */
export function CaroselloCasting({
  casting,
  titolo = "CASTING APERTI",
  vuoto = "Nessun casting aperto in questo momento.",
}: {
  casting: CastingPubblico[];
  titolo?: string;
  vuoto?: string;
}) {
  /* 29/10/2026 (round 15) — frecce spente ai limiti + tastiera (useFilaScorrevole) */
  const { ref: pista, prima, dopo, scorri, tastiera } = useFilaScorrevole(320);

  return (
    <section>
      <div className="mb-4 flex items-end justify-between gap-4">
        <h2 className="tbh-display tbh-h2">{titolo}</h2>
        {casting.length > 1 && (
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => scorri(-1)}
              aria-label="Indietro"
              disabled={!prima}
              className={CLASSE_FRECCIA_FILA}
            >
              <ChevronLeft size={18} />
            </button>
            <button
              type="button"
              onClick={() => scorri(1)}
              aria-label="Avanti"
              disabled={!dopo}
              className={CLASSE_FRECCIA_FILA}
            >
              <ChevronRight size={18} />
            </button>
          </div>
        )}
      </div>

      {casting.length === 0 ? (
        <div className="tbh-card border-dashed p-6">
          <p className="tbh-body text-[14px] text-[var(--tbh-muted)]">{vuoto}</p>
        </div>
      ) : (
        <div
          ref={pista}
          role="group"
          aria-label={titolo}
          tabIndex={0}
          onKeyDown={tastiera}
          className="flex snap-x gap-5 overflow-x-auto pb-3 outline-none focus-visible:ring-1 focus-visible:ring-[var(--tbh-neon)]"
          style={{ scrollbarWidth: "thin" }}
        >
          {casting.map((c) => (
            <CardCasting key={c.id} c={c} larghezzaFissa />
          ))}
        </div>
      )}
    </section>
  );
}

/* ── FILTRI DELLA BACHECA LAVORO & CASTING ──────────────────────────────────
   «[TUTTI][VIDEOCLIP][CINEMA][TV/FORMAT][REALITY][MODELLI/E][BALLERINI/E]
    [ATTORI][FIGURANTI][CREW]» — gli stessi casting, filtrati. Nessun doppione:
   il filtro per ambito guarda l'ambito del casting, quello per ruolo guarda le
   categorie dei ruoli cercati.                                               */

export const FILTRI_CASTING = [
  { k: "tutti", nome: "TUTTI" },
  { k: "videoclip", nome: "VIDEOCLIP", ambito: "videoclip" },
  { k: "cinema", nome: "CINEMA", ambito: "cinema" },
  { k: "tv-format", nome: "TV/FORMAT", ambito: "tv-format" },
  { k: "reality", nome: "REALITY", ambito: "reality" },
  { k: "modelli", nome: "MODELLI/E", categoria: "modelli" },
  { k: "ballerini", nome: "BALLERINI/E", categoria: "ballerini" },
  { k: "attori", nome: "ATTORI", categoria: "attori" },
  { k: "figuranti", nome: "FIGURANTI", categoria: "figuranti" },
  { k: "crew", nome: "CREW", categoria: "crew" },
] as const;

export type FiltroCasting = (typeof FILTRI_CASTING)[number]["k"];

export function filtraCasting(elenco: CastingPubblico[], filtro: FiltroCasting) {
  const f = FILTRI_CASTING.find((x) => x.k === filtro);
  if (!f || f.k === "tutti") return elenco;
  const ambito = "ambito" in f ? f.ambito : null;
  const categoria = "categoria" in f ? f.categoria : null;
  return elenco.filter((c) => {
    if (ambito) return c.ambito === ambito;
    if (categoria) return c.ruoli.some((r) => r.categoria === categoria);
    return true;
  });
}

export function BarraFiltriCasting({
  attivo,
  onCambia,
}: {
  attivo: FiltroCasting;
  onCambia: (k: FiltroCasting) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {FILTRI_CASTING.map((f) => (
        <button
          key={f.k}
          type="button"
          onClick={() => onCambia(f.k)}
          className={`tbh-body rounded-full px-4 py-2 text-[12px] font-extrabold uppercase tracking-[0.1em] transition ${
            attivo === f.k
              ? "bg-[var(--tbh-neon)] text-black"
              : "border border-[var(--tbh-line)] text-[var(--tbh-muted)] hover:border-[var(--tbh-neon)] hover:text-[var(--tbh-fg)]"
          }`}
        >
          {f.nome}
        </button>
      ))}
    </div>
  );
}
