import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Download, Maximize2 } from "lucide-react";

/* ────────────────────────────────────────────────────────────────────────────
   GALLERIA VISIVA DELLA SCHEDA — REGOLA GLOBALE TBH-WEB del 02/10/2026, punto 7.

     ‹ PRECEDENTE | ANTEPRIME SLIDE | SUCCESSIVA ›

   Riceve un ELENCO di slide: aggiungere una slide nei dati la fa comparire qui,
   senza ricostruire la pagina (punto 8). Solo file originali consegnati.
   Elenco vuoto → blocco «in arrivo», mai una galleria finta.
   ──────────────────────────────────────────────────────────────────────────── */

export type Slide = {
  src: string;
  titolo: string;
  /** Fondo dietro la slide: le grafiche su bianco (timbro e firma) restano su bianco. */
  fondo?: "nero" | "bianco";
};

export function GalleriaSlide({ slide, nome }: { slide: Slide[]; nome: string }) {
  const [i, setI] = useState(0);
  const striscia = useRef<HTMLDivElement>(null);
  const n = slide.length;
  const vai = (k: number) => setI(((k % n) + n) % n);

  /* Centra la miniatura attiva scorrendo SOLO la striscia: scrollIntoView farebbe
     saltare anche la pagina fino alla galleria all'apertura della scheda. */
  useEffect(() => {
    const box = striscia.current;
    const el = box?.querySelector<HTMLElement>(`[data-indice="${i}"]`);
    if (!box || !el) return;
    box.scrollTo({ left: el.offsetLeft - (box.clientWidth - el.clientWidth) / 2, behavior: "smooth" });
  }, [i]);

  if (!n)
    return (
      <div className="rounded-2xl border border-dashed border-[var(--tbh-gold)]/50 p-5 text-[var(--tbh-muted)]">
        <p className="text-xs uppercase tracking-widest text-[var(--tbh-gold)] mb-1">In arrivo</p>
        <p className="tbh-body">Le slide e le grafiche ufficiali di {nome} vengono pubblicate qui appena arrivano.</p>
      </div>
    );

  const s = slide[i];
  return (
    <div
      className="flex flex-col gap-3"
      onKeyDown={(e) => {
        if (e.key === "ArrowLeft") vai(i - 1);
        if (e.key === "ArrowRight") vai(i + 1);
      }}
    >
      {/* Vista principale */}
      <figure className="relative">
        <a
          href={s.src}
          target="_blank"
          rel="noreferrer"
          className={`group block overflow-hidden rounded-2xl border border-[var(--tbh-line)] ${s.fondo === "bianco" ? "bg-white" : "bg-black"}`}
          aria-label={`${s.titolo} — apri a piena risoluzione`}
        >
          <img
            key={s.src}
            src={s.src}
            alt={`${nome} — ${s.titolo}`}
            className="mx-auto max-h-[78vh] w-auto max-w-full object-contain"
          />
          <span className="pointer-events-none absolute right-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-black/70 px-3 py-1.5 text-[11px] uppercase tracking-widest text-white opacity-90">
            <Maximize2 size={13} /> Apri
          </span>
        </a>
        <figcaption className="mt-2 flex flex-wrap items-center justify-between gap-2 text-sm">
          <span>
            <span className="text-[var(--tbh-gold)] tabular-nums">
              {i + 1}/{n}
            </span>{" "}
            · {s.titolo}
          </span>
          <a href={s.src} download className="inline-flex items-center gap-1.5 text-[var(--tbh-neon)]">
            <Download size={14} /> Scarica
          </a>
        </figcaption>
      </figure>

      {/* ‹ PRECEDENTE | ANTEPRIME | SUCCESSIVA › */}
      {/* Sempre presente, anche con una sola slide: la struttura non cambia quando ne
          arrivano altre (regola globale, punto 8). */}
      {n > 0 ? (
        <div className="grid grid-cols-[auto_1fr_auto] items-center gap-2">
          <button
            type="button"
            onClick={() => vai(i - 1)}
            disabled={n < 2}
            className="disabled:opacity-35 disabled:pointer-events-none inline-flex items-center gap-1 rounded-full border border-[var(--tbh-line)] px-3 py-2 text-xs font-bold uppercase tracking-wide hover:border-[var(--tbh-neon)]"
            aria-label="Slide precedente"
          >
            <ChevronLeft size={16} /> <span className="hidden sm:inline">Precedente</span>
          </button>
          <div ref={striscia} className="relative flex gap-2 overflow-x-auto snap-x py-1 [scrollbar-width:thin]">
            {slide.map((x, k) => (
              <button
                key={x.src}
                type="button"
                data-indice={k}
                onClick={() => setI(k)}
                aria-label={`Slide ${k + 1}: ${x.titolo}`}
                aria-current={k === i}
                className={`snap-center shrink-0 overflow-hidden rounded-lg border-2 transition ${
                  k === i ? "border-[var(--tbh-neon)]" : "border-transparent opacity-60 hover:opacity-100"
                } ${x.fondo === "bianco" ? "bg-white" : "bg-black"}`}
              >
                <img src={x.src} alt="" loading="lazy" className="h-16 w-24 object-contain md:h-20 md:w-32" />
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => vai(i + 1)}
            disabled={n < 2}
            className="disabled:opacity-35 disabled:pointer-events-none inline-flex items-center gap-1 rounded-full border border-[var(--tbh-line)] px-3 py-2 text-xs font-bold uppercase tracking-wide hover:border-[var(--tbh-neon)]"
            aria-label="Slide successiva"
          >
            <span className="hidden sm:inline">Successiva</span> <ChevronRight size={16} />
          </button>
        </div>
      ) : null}
    </div>
  );
}
