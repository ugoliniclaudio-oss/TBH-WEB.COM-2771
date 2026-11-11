import { Fragment, useEffect, useRef, useState, type ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { inGruppi, inPagine } from "../../api/data/channel-registro";
import { GIALLO } from "./struttura";

/* ────────────────────────────────────────────────────────────────────────────
   GRIGLIA CHANNEL PAGINATA — 28/10/2026 (round 14).

   Pagine da MASSIMO 15 Channel, divise in blocchi da 6 (6 per riga su desktop).
   Navigazione: frecce ◀ ▶ e pallini di pagina (mouse/tocco), tasti ← → / Home / Fine quando
   la griglia ha il focus (tastiera), scorrimento orizzontale col dito (touch, pointer events).
   Con una sola pagina la barra di navigazione non compare.
   ──────────────────────────────────────────────────────────────────────────── */

export const CLASSE_GRIGLIA_CHANNEL = "grid grid-cols-1 gap-4 min-[420px]:grid-cols-2 md:grid-cols-3 xl:grid-cols-6";

export function GrigliaChannelPaginata<T>({
  lista,
  chiave,
  render,
  etichetta,
  testid,
  colore = GIALLO,
}: {
  lista: T[];
  chiave: (x: T) => string;
  /** `n` = posizione (da 1) nell'intera lista, non nella pagina. */
  render: (x: T, n: number) => ReactNode;
  etichetta: string;
  testid: string;
  colore?: string;
}) {
  const pagine = inPagine(lista);
  const tot = pagine.length;
  const [p, setP] = useState(0);
  const pagina = Math.min(p, Math.max(0, tot - 1));
  const radice = useRef<HTMLDivElement>(null);
  const tocco = useRef<{ x: number; y: number; id: number } | null>(null);

  useEffect(() => {
    if (p > tot - 1) setP(Math.max(0, tot - 1));
  }, [p, tot]);

  const vai = (n: number, scorri = false) => {
    const q = Math.max(0, Math.min(tot - 1, n));
    setP(q);
    if (scorri) radice.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  };

  const tasti = (e: React.KeyboardEvent) => {
    if (tot < 2) return;
    /* Solo quando il focus è sulla griglia o sulla barra, non dentro un campo. */
    const t = e.target as HTMLElement;
    if (t.closest("input,textarea,select,[contenteditable=true]")) return;
    if (e.key === "ArrowRight") vai(pagina + 1);
    else if (e.key === "ArrowLeft") vai(pagina - 1);
    else if (e.key === "Home") vai(0);
    else if (e.key === "End") vai(tot - 1);
    else return;
    e.preventDefault();
  };

  const giu = (e: React.PointerEvent) => {
    if (tot < 2 || e.pointerType === "mouse") return;
    tocco.current = { x: e.clientX, y: e.clientY, id: e.pointerId };
  };
  const su = (e: React.PointerEvent) => {
    const t = tocco.current;
    tocco.current = null;
    if (!t || t.id !== e.pointerId) return;
    const dx = e.clientX - t.x;
    const dy = e.clientY - t.y;
    if (Math.abs(dx) < 50 || Math.abs(dx) < Math.abs(dy) * 1.4) return;
    vai(dx < 0 ? pagina + 1 : pagina - 1, true);
  };

  const base = pagina * 15;
  let progressivo = base;
  const pulsante =
    "grid h-10 w-10 shrink-0 place-items-center rounded-full border transition enabled:hover:bg-white/10 disabled:opacity-30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2";

  return (
    <div
      ref={radice}
      className="flex flex-col gap-4 scroll-mt-24"
      role="region"
      aria-roledescription="elenco a pagine"
      aria-label={`${etichetta}${tot > 1 ? ` · pagina ${pagina + 1} di ${tot}` : ""}`}
      data-testid={testid}
      data-pagina={pagina + 1}
      data-pagine={tot}
      onKeyDown={tasti}
    >
      <div
        className="flex touch-pan-y flex-col gap-6 rounded-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4"
        style={{ outlineColor: colore }}
        tabIndex={tot > 1 ? 0 : undefined}
        aria-label={tot > 1 ? `${etichetta}: usa le frecce ← → per cambiare pagina` : undefined}
        onPointerDown={giu}
        onPointerUp={su}
        onPointerCancel={() => (tocco.current = null)}
        data-testid={`${testid}-pagina`}
      >
        {(pagine[pagina] ?? []).length > 0 &&
          inGruppi(pagine[pagina]!).map((g, i) => (
            <section key={`${pagina}-${i}`} className={CLASSE_GRIGLIA_CHANNEL} aria-label={`${etichetta} · blocco ${i + 1}`} data-testid={`${testid}-blocco-${i + 1}`} data-misura={g.length}>
              {g.map((x) => (
                <Fragment key={chiave(x)}>{render(x, ++progressivo)}</Fragment>
              ))}
            </section>
          ))}
      </div>

      {tot > 1 && (
        <nav className="flex flex-wrap items-center justify-center gap-3" aria-label={`Pagine · ${etichetta}`} data-testid={`${testid}-nav`}>
          <button
            type="button"
            className={pulsante}
            style={{ borderColor: `${colore}99`, color: colore, outlineColor: colore }}
            onClick={() => vai(pagina - 1, true)}
            disabled={pagina === 0}
            aria-label="Pagina precedente"
            data-testid={`${testid}-prec`}
          >
            <ChevronLeft className="h-5 w-5" aria-hidden />
          </button>
          <div className="flex items-center gap-1.5">
            {pagine.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => vai(i, true)}
                aria-label={`Pagina ${i + 1} di ${tot}`}
                aria-current={i === pagina ? "page" : undefined}
                className="grid h-10 min-w-10 place-items-center rounded-full px-2 text-[11px] font-extrabold tracking-[0.1em] transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                style={i === pagina ? { background: colore, color: "#000", outlineColor: colore } : { color: "rgba(255,255,255,0.6)", outlineColor: colore }}
                data-testid={`${testid}-p${i + 1}`}
              >
                {i + 1}
              </button>
            ))}
          </div>
          <button
            type="button"
            className={pulsante}
            style={{ borderColor: `${colore}99`, color: colore, outlineColor: colore }}
            onClick={() => vai(pagina + 1, true)}
            disabled={pagina >= tot - 1}
            aria-label="Pagina successiva"
            data-testid={`${testid}-succ`}
          >
            <ChevronRight className="h-5 w-5" aria-hidden />
          </button>
          <span className="w-full text-center text-[10px] font-bold tracking-[0.16em] text-white/45" aria-live="polite">
            PAGINA {pagina + 1} / {tot} · CHANNEL {base + 1}–{Math.min(base + 15, lista.length)} DI {lista.length}
          </span>
        </nav>
      )}
    </div>
  );
}
