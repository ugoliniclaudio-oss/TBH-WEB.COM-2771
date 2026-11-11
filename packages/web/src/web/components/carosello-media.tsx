import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, ExternalLink, FileText } from "lucide-react";
import type { ElementoMedia } from "../../api/data/campagne-monitor";
import { InAllestimento } from "./in-allestimento";

/* ────────────────────────────────────────────────────────────────────────────
   CAROSELLO MULTI-MEDIA — specifica di Claudio del 16/09/2026, punto 2:

     «Se il contenuto è un carosello di più immagini o video, mostra il
      carosello con frecce, indicatori e passaggio automatico. Tutto deve
      essere cliccabile.»

   Un solo componente per due posti: il vetro dei monitor e la galleria della
   scheda prodotto. Regole:
   · immagine proporzionata, mai stirata;
   · video MP4/WebM in loop, muto, senza controlli invadenti;
   · YouTube e Vimeo dentro il loro player incorporato;
   · PDF: copertina (se caricata) e pulsante APRI DOCUMENTO — mai una finta
     anteprima;
   · pagina web non incorporabile: si apre in una scheda nuova;
   · frecce, pallini, autoplay, tastiera (← →) e trascinamento col dito;
   · se non c'è nessun elemento reale, si scrive IN ALLESTIMENTO.
   ──────────────────────────────────────────────────────────────────────────── */

export function CaroselloMedia({
  elementi,
  titolo,
  /** Secondi per ogni passo. 0 = nessun passaggio automatico. */
  durataSec = 0,
  /** false = si ferma sull'ultimo elemento invece di ricominciare. */
  loop = true,
  /** Il carosello lavora solo quando è davvero sullo schermo. */
  visibile = true,
  /** Rotazione casuale invece dell'ordine scritto nel pannello. */
  casuale = false,
  /** Cosa fare quando si clicca sull'elemento: se manca, apre l'indirizzo. */
  onApri,
  compatto = false,
  colore = "var(--tbh-neon)",
  /** Riempie il riquadro del genitore (vetro del monitor) invece del flusso. */
  sovrapposto = true,
  className = "",
}: {
  elementi: ElementoMedia[];
  titolo: string;
  durataSec?: number;
  loop?: boolean;
  visibile?: boolean;
  casuale?: boolean;
  onApri?: (el: ElementoMedia) => void;
  compatto?: boolean;
  colore?: string;
  sovrapposto?: boolean;
  className?: string;
}) {
  const [i, setI] = useState(0);
  const [finito, setFinito] = useState(false);
  const box = useRef<HTMLDivElement | null>(null);
  const tocco = useRef<{ x: number; y: number } | null>(null);
  const totale = elementi.length;

  const vai = useCallback(
    (passo: number) => {
      if (totale < 2) return;
      setI((x) => {
        const prossimo = x + passo;
        if (prossimo >= totale) {
          if (!loop) {
            setFinito(true);
            return totale - 1;
          }
          return 0;
        }
        if (prossimo < 0) return loop ? totale - 1 : 0;
        return prossimo;
      });
    },
    [totale, loop],
  );

  const salta = useCallback(() => {
    if (totale < 2) return;
    setI((x) => {
      let n = x;
      // Estrazione senza ripetere lo stesso elemento due volte di fila.
      for (let tentativi = 0; tentativi < 8 && n === x; tentativi++)
        n = Math.floor(Math.random() * totale);
      return n;
    });
  }, [totale]);

  /* Passaggio automatico: solo quando il carosello si vede. */
  useEffect(() => {
    if (!visibile || totale < 2 || durataSec <= 0 || finito) return;
    const t = setTimeout(
      () => (casuale ? salta() : vai(1)),
      Math.max(3, Math.min(600, durataSec)) * 1000,
    );
    return () => clearTimeout(t);
  }, [visibile, totale, durataSec, finito, casuale, vai, salta, i]);

  /* Tastiera: frecce destra e sinistra, come chiesto per touch/mouse/tastiera. */
  useEffect(() => {
    const el = box.current;
    if (!el || totale < 2) return;
    const tasto = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") {
        e.preventDefault();
        vai(1);
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        vai(-1);
      }
    };
    el.addEventListener("keydown", tasto);
    return () => el.removeEventListener("keydown", tasto);
  }, [totale, vai]);

  if (totale === 0) {
    return <InAllestimento cosa={titolo} sovrapposto={sovrapposto} compatto={compatto} />;
  }

  const el = elementi[i % totale]!;
  const posizione = sovrapposto ? "absolute inset-0" : "relative w-full";

  return (
    <div
      ref={box}
      tabIndex={0}
      role="group"
      aria-label={`${titolo} — elemento ${i + 1} di ${totale}`}
      data-carosello={String(totale)}
      data-carosello-indice={String(i)}
      className={`${posizione} overflow-hidden outline-none ${className}`}
      onTouchStart={(e) => {
        const t = e.touches[0];
        tocco.current = t ? { x: t.clientX, y: t.clientY } : null;
      }}
      onTouchEnd={(e) => {
        const p = tocco.current;
        const t = e.changedTouches[0];
        tocco.current = null;
        if (!p || !t) return;
        const dx = t.clientX - p.x;
        // Solo trascinamenti orizzontali: verticale resta lo scorrimento pagina.
        if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(t.clientY - p.y)) vai(dx < 0 ? 1 : -1);
      }}
    >
      <PezzoMedia el={el} titolo={titolo} visibile={visibile} loop={loop} onApri={onApri} />

      {totale > 1 ? (
        <>
          <button
            type="button"
            aria-label="Elemento precedente"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              vai(-1);
            }}
            className="absolute left-1 top-1/2 z-20 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full border border-white/25 bg-black/65 text-white transition hover:border-[var(--tbh-neon)] hover:text-[var(--tbh-neon)]"
          >
            <ChevronLeft size={15} />
          </button>
          <button
            type="button"
            aria-label="Elemento successivo"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              vai(1);
            }}
            className="absolute right-1 top-1/2 z-20 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full border border-white/25 bg-black/65 text-white transition hover:border-[var(--tbh-neon)] hover:text-[var(--tbh-neon)]"
          >
            <ChevronRight size={15} />
          </button>
          <div className="absolute inset-x-0 bottom-1.5 z-20 flex justify-center gap-1.5">
            {elementi.map((x, k) => (
              <button
                key={`${x.url}-${k}`}
                type="button"
                aria-label={`Vai all'elemento ${k + 1}`}
                aria-current={k === i % totale}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setI(k);
                  setFinito(false);
                }}
                className="h-1.5 rounded-full transition-all"
                style={{
                  width: k === i % totale ? 16 : 6,
                  background: k === i % totale ? colore : "rgba(255,255,255,0.34)",
                }}
              />
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}

/** Un solo pezzo del carosello, reso secondo il suo tipo reale. */
function PezzoMedia({
  el,
  titolo,
  visibile,
  loop,
  onApri,
}: {
  el: ElementoMedia;
  titolo: string;
  visibile: boolean;
  loop: boolean;
  onApri?: (el: ElementoMedia) => void;
}) {
  const apri = () => {
    if (onApri) return onApri(el);
    if (typeof window !== "undefined") window.open(el.url, "_blank", "noopener");
  };

  if (el.tipo === "video") {
    return (
      <video
        src={el.url}
        muted
        loop={loop}
        playsInline
        autoPlay={visibile}
        preload="metadata"
        onClick={apri}
        className="absolute inset-0 h-full w-full cursor-pointer object-contain"
      />
    );
  }

  if (el.embed) {
    return visibile ? (
      <iframe
        src={el.embed}
        title={titolo}
        allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
        className="absolute inset-0 h-full w-full"
      />
    ) : null;
  }

  if (el.tipo === "pdf") {
    return (
      <button
        type="button"
        onClick={apri}
        className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/60"
      >
        <FileText size={22} style={{ color: "var(--tbh-neon)" }} />
        <span className="tbh-dato rounded-full bg-[var(--tbh-neon)] px-3 py-1 text-[10px] font-extrabold tracking-[0.1em] text-black">
          APRI DOCUMENTO
        </span>
      </button>
    );
  }

  if (el.tipo === "immagine") {
    return (
      <img
        src={el.url}
        alt={titolo}
        loading="lazy"
        decoding="async"
        onClick={apri}
        className="absolute inset-0 h-full w-full cursor-pointer object-contain"
      />
    );
  }

  // Pagina web: molti siti rifiutano di farsi incorporare. Si apre, non si finge.
  return (
    <button
      type="button"
      onClick={apri}
      className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/60 px-3 text-center"
    >
      <ExternalLink size={20} style={{ color: "var(--tbh-neon)" }} />
      <span className="tbh-dato rounded-full bg-[var(--tbh-neon)] px-3 py-1 text-[10px] font-extrabold tracking-[0.1em] text-black">
        APRI LINK
      </span>
      <span className="max-w-full truncate text-[9px] text-[var(--tbh-muted)]">{el.url}</span>
    </button>
  );
}
