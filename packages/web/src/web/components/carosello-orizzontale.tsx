import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

/* ────────────────────────────────────────────────────────────────────────────
   CAROSELLO ORIZZONTALE — la fascia scorrevole unica delle fasce di schede.

   Diverso da CaroselloMedia (components/carosello-media.tsx), che mostra UNA
   alla volta le immagini o i video di UN solo contenuto: qui scorre una FILA di
   schede diverse, come sul telecomando si scorre la fila dei canali.

     · su telefono e tablet si scorre col dito (scorrimento nativo + scatto);
     · su computer compaiono le due frecce ai lati, e si scorre anche con le
       frecce della tastiera quando la fascia ha il fuoco;
     · le frecce restano sempre a vista da computer: quando non c'è più niente da
       scorrere la freccia si SPEGNE e non è più cliccabile (regola «nessun
       pulsante morto», senza far ballare il contenuto);
     · la barra di scorrimento resta nascosta ma il movimento resta accessibile.
   ──────────────────────────────────────────────────────────────────────────── */

/**
 * 29/10/2026 (round 15) — logica comune di TUTTE le fasce scorrevoli (Claudio: «tutti i caroselli: frecce
 * Indietro/Avanti visibili, mouse, touch, tastiera e swipe, frecce spente ai limiti»). Restituisce il ref
 * della pista, lo stato delle due frecce, lo scorrimento di un passo e il gestore della tastiera.
 */
export function useFilaScorrevole<T extends HTMLElement = HTMLDivElement>(passo?: number) {
  const ref = useRef<T | null>(null);
  const [prima, setPrima] = useState(false);
  const [dopo, setDopo] = useState(false);
  const misura = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    const massimo = el.scrollWidth - el.clientWidth;
    setPrima(el.scrollLeft > 8);
    setDopo(massimo > 8 && el.scrollLeft < massimo - 8);
  }, []);
  useEffect(() => {
    misura();
    const el = ref.current;
    if (!el) return;
    el.addEventListener("scroll", misura, { passive: true });
    window.addEventListener("resize", misura);
    /* contenuti che arrivano dopo (immagini, query): si rimisura quando cambia la pista */
    const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(misura) : null;
    ro?.observe(el);
    const t = window.setTimeout(misura, 600);
    return () => {
      el.removeEventListener("scroll", misura);
      window.removeEventListener("resize", misura);
      ro?.disconnect();
      window.clearTimeout(t);
    };
  });
  const scorri = useCallback(
    (verso: -1 | 1) => {
      const el = ref.current;
      if (!el) return;
      el.scrollBy({ left: verso * (passo ?? Math.max(240, el.clientWidth * 0.8)), behavior: "smooth" });
    },
    [passo],
  );
  const tastiera = (e: { key: string; preventDefault: () => void }) => {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      scorri(1);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      scorri(-1);
    }
  };
  return { ref, prima, dopo, scorri, tastiera, scorrevole: prima || dopo };
}

/** Classe comune delle frecce piccole delle fasce (spente ai limiti, mai nascoste). */
export const CLASSE_FRECCIA_FILA =
  "grid h-10 w-10 shrink-0 place-items-center rounded-full border border-[var(--tbh-line)] bg-black/80 text-white transition hover:border-[var(--tbh-neon)] hover:text-[var(--tbh-neon)] disabled:pointer-events-none disabled:opacity-25 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#d7ff00]";

export function CaroselloOrizzontale({
  /** Titolo accessibile della fascia: serve al lettore di schermo. */
  etichetta,
  /** Voce del lettore di schermo per la freccia sinistra (ordine di Claudio del
   *  28/09/2026: «Canale precedente» sui canali, «Contenuti precedenti» altrove). */
  ariaPrecedente,
  ariaSuccessivo,
  children,
  className = "",
  /** Frecce dentro la fascia invece che sporgenti ai lati: serve quando la fascia
   *  arriva al bordo della pagina (telecomando) e fuori non c'è spazio libero. */
  frecceDentro = false,
  /** Avanzamento automatico in ms (es. 5000). Rotazione continua: a fine fila riparte
   *  dall'inizio. Si ferma quando l'utente interagisce (mouse sopra, tocco, fuoco) e
   *  riprende quando smette. Assente = nessun autoplay (comportamento di sempre). */
  autoplay,
}: {
  etichetta: string;
  ariaPrecedente?: string;
  ariaSuccessivo?: string;
  children: ReactNode;
  className?: string;
  frecceDentro?: boolean;
  autoplay?: number;
}) {
  const { ref: pista, prima, dopo, scorri, tastiera, scorrevole } = useFilaScorrevole();
  const pausa = useRef(false);

  useEffect(() => {
    if (!autoplay) return;
    const id = window.setInterval(() => {
      const el = pista.current;
      if (!el || pausa.current || document.hidden) return;
      const massimo = el.scrollWidth - el.clientWidth;
      if (massimo <= 8) return;
      if (el.scrollLeft >= massimo - 8) el.scrollTo({ left: 0, behavior: "smooth" });
      else scorri(1);
    }, autoplay);
    return () => window.clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoplay]);

  /* Area cliccabile grande (48px) e frecce sempre a vista da computer: richiesta
     esplicita di Claudio del 28/09/2026. A fine lista la freccia non sparisce, si
     SPEGNE (opacità bassa e nessun click): resta visibile che quella è la fine. */
  const freccia =
    "hidden md:flex h-12 w-12 items-center justify-center rounded-full border border-[var(--tbh-line)] bg-black/80 text-white transition hover:border-[var(--tbh-neon)] hover:text-[var(--tbh-neon)] disabled:opacity-25 disabled:pointer-events-none";

  return (
    <div
      className={`relative ${className}`}
      data-autoplay={autoplay ?? undefined}
      onPointerEnter={() => (pausa.current = true)}
      onPointerLeave={() => (pausa.current = false)}
      onTouchStart={() => (pausa.current = true)}
      onTouchEnd={() => window.setTimeout(() => (pausa.current = false), 5000)}
      onFocus={() => (pausa.current = true)}
      onBlur={() => (pausa.current = false)}
    >
      {/* 29/10/2026 (round 15) — «nessuna sovrapposizione»: da computer le frecce stanno AFFIANCATE alla fascia
          (colonne proprie), non più sopra le schede. `frecceDentro` resta accettato per compatibilità. */}
      <div className="md:flex md:items-center md:gap-2" data-frecce-dentro={frecceDentro ? "" : undefined}>
      <div className="hidden shrink-0 md:block">
        <button
          type="button"
          aria-label={ariaPrecedente ?? `Contenuti precedenti — ${etichetta}`}
          title={ariaPrecedente ?? "Precedente"}
          className={freccia}
          disabled={!prima}
          onClick={() => scorri(-1)}
        >
          <ChevronLeft size={20} />
        </button>
      </div>

      <div
        ref={pista}
        role="group"
        aria-label={etichetta}
        tabIndex={0}
        onKeyDown={tastiera}
        data-carosello={etichetta}
        /* tbh-scroll-x è la regola globale già in styles.css: barra nascosta,
           aggancio morbido, inerzia su touch, nessuna propagazione alla pagina. */
        className="tbh-scroll-x min-w-0 gap-4 pb-2 outline-none focus-visible:ring-1 focus-visible:ring-[var(--tbh-neon)] md:flex-1"
      >
        {children}
      </div>

      <div className="hidden shrink-0 md:block">
        <button
          type="button"
          aria-label={ariaSuccessivo ?? `Contenuti successivi — ${etichetta}`}
          title={ariaSuccessivo ?? "Successivo"}
          className={freccia}
          disabled={!dopo}
          onClick={() => scorri(1)}
        >
          <ChevronRight size={20} />
        </button>
      </div>
      </div>

      {/* 29/10/2026 (round 15) — su telefono e tablet piccolo le frecce stanno SOTTO la fascia (Indietro / Avanti). */}
      <FrecceFila
        fila={{ prima, dopo, scorri, scorrevole }}
        etichetta={etichetta}
        ariaPrecedente={ariaPrecedente}
        ariaSuccessivo={ariaSuccessivo}
        className="md:hidden"
        testid="frecce-fila-mobile"
      />
    </div>
  );
}

/**
 * Barra INDIETRO / AVANTI sotto una fascia (29/10/2026, round 15): visibile, mai sopra le schede, spenta ai
 * limiti, mostrata solo se c'è qualcosa da scorrere. `className` decide su quali schermi compare.
 */
export function FrecceFila({
  fila,
  etichetta,
  ariaPrecedente,
  ariaSuccessivo,
  className = "",
  testid = "frecce-fila",
}: {
  fila: { prima: boolean; dopo: boolean; scorri: (verso: -1 | 1) => void; scorrevole: boolean };
  etichetta: string;
  ariaPrecedente?: string;
  ariaSuccessivo?: string;
  className?: string;
  testid?: string;
}) {
  if (!fila.scorrevole) return null;
  const classe =
    "inline-flex h-10 min-w-[7.5rem] items-center justify-center gap-1 rounded-full border border-[var(--tbh-line)] bg-black px-3 text-[11px] font-extrabold tracking-[0.12em] text-white transition hover:border-[var(--tbh-neon)] hover:text-[var(--tbh-neon)] disabled:pointer-events-none disabled:opacity-25";
  return (
    <div className={`mt-2 flex items-center justify-center gap-3 ${className}`} data-testid={testid}>
      <button
        type="button"
        aria-label={ariaPrecedente ?? `Contenuti precedenti — ${etichetta}`}
        className={classe}
        disabled={!fila.prima}
        onClick={() => fila.scorri(-1)}
      >
        <ChevronLeft size={16} aria-hidden /> INDIETRO
      </button>
      <button
        type="button"
        aria-label={ariaSuccessivo ?? `Contenuti successivi — ${etichetta}`}
        className={classe}
        disabled={!fila.dopo}
        onClick={() => fila.scorri(1)}
      >
        AVANTI <ChevronRight size={16} aria-hidden />
      </button>
    </div>
  );
}

/**
 * Fila scorrevole semplice con la barra INDIETRO / AVANTI sotto (29/10/2026, round 15): per le file che hanno
 * già il loro aspetto e devono solo avere frecce, tastiera e limiti. `classePista` = classi della pista.
 */
export function FilaConFrecce({
  etichetta,
  classePista,
  classeFrecce = "",
  testid,
  children,
}: {
  etichetta: string;
  classePista: string;
  classeFrecce?: string;
  testid?: string;
  children: ReactNode;
}) {
  const fila = useFilaScorrevole();
  return (
    <>
      <div
        ref={fila.ref}
        role="group"
        aria-label={etichetta}
        tabIndex={0}
        onKeyDown={fila.tastiera}
        data-testid={testid}
        className={`${classePista} outline-none focus-visible:ring-1 focus-visible:ring-[var(--tbh-neon)]`}
      >
        {children}
      </div>
      <FrecceFila fila={fila} etichetta={etichetta} className={classeFrecce} testid={testid ? `frecce-${testid}` : undefined} />
    </>
  );
}

/** Cella della fascia: misura fissa e scatto di allineamento. */
export function CellaCarosello({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`w-[270px] shrink-0 snap-start md:w-[300px] ${className}`}>{children}</div>
  );
}
