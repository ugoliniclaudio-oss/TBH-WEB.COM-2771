import { useFilaScorrevole } from "./carosello-orizzontale";
import { Link } from "wouter";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { SchermoTbh, type Schermo } from "./schermo-tbh";

/* ────────────────────────────────────────────────────────────────────────────
   RULLO TBH — la fila orizzontale di schermi (specifica di Claudio, 08/09/2026).

   Punto 3, alla lettera:
     «Gli schermi non devono essere rimpiccioliti per farli entrare tutti. Devono
      formare rulli orizzontali scorrevoli. Desktop: 4 schermi + parte del successivo.
      Tablet: 2-3 + parte. Smartphone: 1 + parte. Il rapporto 16:9/4:3 deve rimanere
      invariato. Mai zoom. Mai overflow orizzontale dell'intera pagina.
      Scorre soltanto il rullo.»

   Come è ottenuto, senza calcoli a mano e senza javascript di misura:
     · la larghezza dello schermo è `flex: 0 0 clamp(260px, 23vw, 430px)` (styles.css).
       A 1440 px fa ~331 px: quattro schermi più l'inizio del quinto. A 768 fa 260 px:
       due e mezzo. Sotto 600 px `flex-basis: 84vw`: uno più un pezzo del successivo.
       Il numero si adatta da solo alla larghezza, senza mai stringere lo schermo;
     · `overscroll-behavior-x: contain` impedisce allo scorrimento di passare alla
       pagina: si muove il rullo, non il sito.

   ── AGGIORNAMENTO 28/09/2026 · FRECCE DA COMPUTER ─────────────────────────
   Ordine di Claudio sulle liste orizzontali, alla lettera: su computer le frecce
   stanno sempre a vista, con un'area di click grande (48px), si scorre anche con
   le frecce ← → della tastiera quando il rullo ha il fuoco, e la freccia si
   DISABILITA quando si è arrivati a fine lista (non resta un pulsante che non
   fa niente: da disabilitata non è cliccabile). Su telefono resta lo scorrimento
   col dito con l'aggancio morbido, senza frecce.
   Le voci del lettore di schermo seguono il contenuto del rullo: «Canale
   precedente / successivo» dove si scorrono canali, «Contenuti precedenti /
   successivi» in tutti gli altri rulli.
   ──────────────────────────────────────────────────────────────────────────── */

/* Area di click grande (48px) e frecce solo da computer, come le fasce di schede:
   stessa regola di components/carosello-orizzontale.tsx, così il sito si comporta
   allo stesso modo in tutte le liste orizzontali. */
const FRECCIA_RULLO =
  "inline-flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-full border border-[var(--tbh-line)] bg-black/60 text-white transition hover:border-[var(--tbh-neon)] hover:text-[var(--tbh-neon)] disabled:opacity-25 disabled:pointer-events-none";

export function RulloTbh({
  titolo,
  occhiello,
  schermi,
  tutti,
  vuoto = "In allestimento",
  ariaPrecedente,
  ariaSuccessivo,
  grande = false,
  classeSezione = "mt-7 md:mt-9",
}: {
  titolo: string;
  occhiello?: string | null;
  schermi: Schermo[];
  /** Pagina che contiene tutta la categoria: il rullo è una vetrina, non l'archivio. */
  tutti?: { etichetta: string; to: string } | null;
  vuoto?: string;
  /** Voci del lettore di schermo per le due frecce (ordine di Claudio, 28/09/2026). */
  ariaPrecedente?: string;
  ariaSuccessivo?: string;
  /** Schermi grandi (vetrina IN EVIDENZA). */
  grande?: boolean;
  /** Margine della sezione (la vetrina IN EVIDENZA ha il suo). */
  classeSezione?: string;
}) {
  /* 29/10/2026 (round 15) — stessa logica di tutte le fasce (frecce spente ai limiti, tastiera, swipe). */
  const { ref: pista, prima: sinistra, dopo: destra, scorri, tastiera } = useFilaScorrevole();

  return (
    <section data-rullo={titolo} className={classeSezione}>
      <div className="flex items-end justify-between gap-3 px-1">
        <div className="min-w-0">
          {occhiello ? (
            <p className="text-[10px] uppercase tracking-[0.22em] text-[var(--tbh-muted)]">
              {occhiello}
            </p>
          ) : null}
          {/* TITOLO-PULSANTE (ordine del 15/09/2026): il titolo del rullo è cliccabile e
              porta alla pagina che contiene tutta la categoria. Se quella pagina non
              esiste resta testo, perché un pulsante che non apre niente è vietato. */}
          {tutti ? (
            <Link
              to={tutti.to}
              className="tbh-display tbh-h3 group inline-flex items-center gap-2 leading-tight break-words hover:text-[var(--tbh-neon)]"
            >
              {titolo}
              <ChevronRight
                size={18}
                className="shrink-0 opacity-60 transition group-hover:translate-x-0.5 group-hover:opacity-100"
              />
            </Link>
          ) : (
            <h2 className="tbh-display tbh-h3 leading-tight break-words">{titolo}</h2>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {tutti ? (
            <Link
              to={tutti.to}
              className="rounded-full border border-[var(--tbh-line)] px-3 py-1.5 text-[10px] font-bold tracking-[0.12em] hover:border-[var(--tbh-neon)] hover:text-[var(--tbh-neon)]"
            >
              {tutti.etichetta}
            </Link>
          ) : null}
          {/* Frecce sempre a vista (29/10/2026: anche da telefono e tablet), disabilitate a fine lista. */}
          <button
            type="button"
            onClick={() => scorri(-1)}
            disabled={!sinistra}
            aria-label={ariaPrecedente ?? `Contenuti precedenti — ${titolo}`}
            title={ariaPrecedente ?? "Precedente"}
            className={FRECCIA_RULLO}
          >
            <ChevronLeft size={20} />
          </button>
          <button
            type="button"
            onClick={() => scorri(1)}
            disabled={!destra}
            aria-label={ariaSuccessivo ?? `Contenuti successivi — ${titolo}`}
            title={ariaSuccessivo ?? "Successivo"}
            className={FRECCIA_RULLO}
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {schermi.length === 0 ? (
        <p className="mt-3 px-1 text-[11px] text-[var(--tbh-muted)]">{vuoto}</p>
      ) : (
        <div
          ref={pista}
          role="group"
          aria-label={titolo}
          tabIndex={0}
          onKeyDown={tastiera}
          className="tbh-reel mt-3 px-1 outline-none focus-visible:ring-1 focus-visible:ring-[var(--tbh-neon)]"
        >
          {schermi.map((s) => (
            <SchermoTbh key={s.id} schermo={s} grande={grande} />
          ))}
        </div>
      )}
    </section>
  );
}
