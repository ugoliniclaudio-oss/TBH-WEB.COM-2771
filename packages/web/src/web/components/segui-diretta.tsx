import { useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";
import { ChevronLeft, ChevronRight, Headphones, Play, Radio, Tv } from "lucide-react";
import type { CanaleTouchId } from "../../api/data/touch-canali";
import { useDirettaCanali, useInfoCanali } from "../queries/canali-touch";
import { CHIAVE_AVVIO, eventoAccendi } from "../hooks/use-canale-adesso";
import { eDm, etichettaElemento, nomeRubrica } from "../lib/canali-touch";
import { oraRoma } from "../hooks/use-radio-adesso";
import { COLORE_TBH } from "../lib/identita-tbh";

/**
 * CAROSELLO «SEGUI LA DIRETTA ORA» — i due canali del gruppo TBH affiancati.
 * Per ogni canale: cosa va in onda adesso (rubrica + titolo reali dal palinsesto)
 * e il comando ASCOLTA RADIO / GUARDA TV, che apre il canale e fa partire il player.
 * Nessun logo di canale finché Claudio non approva: solo il nome scritto.
 */

const ROSSO_DM = "#ff2b2b";

export function SeguiDiretta({ titolo = "SEGUI LA DIRETTA ORA", compatto = false }: { titolo?: string; compatto?: boolean }) {
  const diretta = useDirettaCanali();
  const info = useInfoCanali();
  const [, naviga] = useLocation();
  const binario = useRef<HTMLDivElement>(null);
  const [attivo, setAttivo] = useState(0);

  const vai = (canale: CanaleTouchId, percorso: string) => {
    if (window.location.pathname.startsWith(percorso)) {
      window.dispatchEvent(new Event(eventoAccendi(canale)));
      document.getElementById("in-onda")?.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }
    try {
      sessionStorage.setItem(CHIAVE_AVVIO, canale);
    } catch {
      /* niente sessionStorage: sulla pagina resta il pulsante */
    }
    naviga(`${percorso}#in-onda`);
  };

  /* 29/10/2026 (round 15) — frecce Indietro/Avanti (solo telefono, dove le due schede scorrono), spente ai limiti. */
  const vaiA = (k: number) => {
    const el = binario.current;
    if (!el) return;
    const j = Math.max(0, Math.min(1, k));
    el.scrollTo({ left: j * el.clientWidth, behavior: "smooth" });
  };

  /* Su schermo stretto le due schede scorrono da sole ogni 7 secondi. */
  useEffect(() => {
    const el = binario.current;
    if (!el) return;
    const t = setInterval(() => {
      if (el.scrollWidth <= el.clientWidth + 4) return;
      const prossimo = (attivo + 1) % 2;
      el.scrollTo({ left: prossimo * el.clientWidth, behavior: "smooth" });
    }, 7000);
    return () => clearInterval(t);
  }, [attivo]);

  const canali = info.data?.canali ?? [];
  const rubriche = info.data?.rubriche ?? [];

  return (
    <section aria-label={titolo} className="flex flex-col gap-3" data-testid="segui-diretta">
      <div className="flex flex-wrap items-center gap-3">
        <span className="relative flex h-3 w-3">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-75" style={{ background: COLORE_TBH }} />
          <span className="relative inline-flex h-3 w-3 rounded-full" style={{ background: COLORE_TBH }} />
        </span>
        <h2 className={`tbh-display ${compatto ? "tbh-h3" : "tbh-h2"} leading-none`} style={{ color: COLORE_TBH }}>
          {titolo}
        </h2>
      </div>
      <div
        ref={binario}
        role="group"
        aria-label={titolo}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
          const el = e.currentTarget;
          if (el.scrollWidth <= el.clientWidth + 4) return;
          e.preventDefault();
          vaiA(attivo + (e.key === "ArrowRight" ? 1 : -1));
        }}
        onScroll={(e) => {
          const el = e.currentTarget;
          setAttivo(Math.round(el.scrollLeft / Math.max(1, el.clientWidth)));
        }}
        className="flex snap-x snap-mandatory gap-3 overflow-x-auto pb-1 [scrollbar-width:none] md:grid md:grid-cols-2 md:overflow-visible"
      >
        {canali.map((c) => {
          const d = diretta.data?.canali.find((x) => x.canale === c.id);
          const e = d?.corrente ?? null;
          const r = e ? rubriche.find((x) => x.id === e.rubrica) : null;
          const dm = e ? eDm(e) : false;
          const cover =
            e?.tipo === "brano"
              ? e.cover
              : e?.tipo === "spot"
                ? `https://i.ytimg.com/vi/${e.videoId}/hqdefault.jpg`
                : null;
          const Icona = c.id === "tv" ? Tv : Radio;
          return (
            <article
              key={c.id}
              className="tbh-card flex w-full min-w-full shrink-0 snap-start flex-col gap-3 p-4 md:min-w-0 md:p-5"
              style={{ borderColor: `${COLORE_TBH}55` }}
              data-testid={`diretta-${c.id}`}
            >
              <div className="flex items-center justify-between gap-3">
                <span className="flex min-w-0 items-center gap-2">
                  <Icona className="h-5 w-5 shrink-0" style={{ color: COLORE_TBH }} />
                  <span className="tbh-display truncate text-xl text-[var(--tbh-platinum)] md:text-2xl">{c.nome}</span>
                </span>
                <span className="shrink-0 text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--tbh-muted)]">{c.tipo}</span>
              </div>
              <div className="flex min-w-0 items-center gap-3">
                <span className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-white/5">
                  {cover ? (
                    <img src={cover} alt="" loading="lazy" className="h-full w-full object-cover" />
                  ) : r?.logo ? (
                    <img src={r.logo} alt="" loading="lazy" className="h-full w-full object-contain" />
                  ) : (
                    <span className="grid h-full w-full place-items-center">
                      <Icona className="h-6 w-6" style={{ color: dm ? ROSSO_DM : COLORE_TBH }} />
                    </span>
                  )}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[10px] font-bold uppercase tracking-[0.16em]" style={{ color: dm ? ROSSO_DM : COLORE_TBH }}>
                    {e ? `${nomeRubrica(e)} · ${etichettaElemento(e)}` : diretta.isLoading ? "Caricamento…" : "Palinsesto in allestimento"}
                  </span>
                  <span className="block truncate font-semibold text-[var(--tbh-platinum)]">{e?.titolo ?? "—"}</span>
                  {e && (
                    <span className="tbh-dato block text-xs text-[var(--tbh-muted)]">
                      {e.ora}–{oraRoma(e.fine)} · ora di Roma
                    </span>
                  )}
                </span>
              </div>
              {c.id === "tv" && e?.tipo === "brano" && e.fonte.tipo === "audio" && (
                <p className="flex items-center gap-1.5 text-[11px] text-[var(--tbh-muted)]">
                  <Headphones className="h-3.5 w-3.5" /> Brano solo audio: in TV con la copertina ufficiale.
                </p>
              )}
              <button
                type="button"
                onClick={() => vai(c.id, c.percorso)}
                className="mt-auto flex min-h-12 items-center justify-center gap-2 rounded-xl px-4 text-sm font-extrabold uppercase tracking-[0.08em] text-black transition hover:brightness-110"
                style={{ background: COLORE_TBH }}
                data-testid={`comando-${c.id}`}
              >
                <Play className="h-4 w-4 fill-current" /> {c.comando}
              </button>
            </article>
          );
        })}
      </div>
      <div className="flex items-center justify-center gap-3 md:hidden" data-testid="frecce-diretta">
        <button
          type="button"
          aria-label="Indietro"
          disabled={attivo <= 0}
          onClick={() => vaiA(attivo - 1)}
          className="grid h-10 w-10 place-items-center rounded-full border border-[var(--tbh-line)] bg-black text-white disabled:opacity-25"
        >
          <ChevronLeft size={16} aria-hidden />
        </button>
        {[0, 1].map((i) => (
          <span key={i} aria-hidden className="h-1.5 w-6 rounded-full" style={{ background: i === attivo ? COLORE_TBH : "rgba(255,255,255,0.2)" }} />
        ))}
        <button
          type="button"
          aria-label="Avanti"
          disabled={attivo >= 1}
          onClick={() => vaiA(attivo + 1)}
          className="grid h-10 w-10 place-items-center rounded-full border border-[var(--tbh-line)] bg-black text-white disabled:opacity-25"
        >
          <ChevronRight size={16} aria-hidden />
        </button>
      </div>
    </section>
  );
}
