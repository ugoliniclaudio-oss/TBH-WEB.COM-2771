import { useEffect, useRef, useState, type ReactNode } from "react";
import { Link } from "wouter";
import { ChevronLeft, ChevronRight, ExternalLink, Play, X } from "lucide-react";
import { CaroselloOrizzontale } from "./carosello-orizzontale";
import { useLavoroCms, type SchedaLavoro } from "../queries/contenuti-palinsesto";

/**
 * Parte pubblica di «GESTIONE CONTENUTI E PALINSESTO» (28/10/2026): la scheda di un contenuto
 * pubblicato dal pannello, il video in finestra e la barra CERCO / OFFRO LAVORO a schede.
 * Nessun dato inventato: senza contenuti verificati una scheda mostra il motivo dell'attesa.
 */

const GIALLO = "#d7ff00";
const ROSSO_DM = "#ff2b2b";

export type VoceCmsPubblica = SchedaLavoro["voci"][number];

/* ── video in finestra (player ufficiale della piattaforma, mai una copia) ── */

function srcEmbed(v: NonNullable<VoceCmsPubblica["video"]>) {
  if (v.piattaforma === "youtube" && v.embedId) return `https://www.youtube.com/embed/${v.embedId}?autoplay=1&rel=0&playsinline=1`;
  if (v.piattaforma === "vimeo" && v.embedId) return `https://player.vimeo.com/video/${v.embedId}?autoplay=1`;
  if (v.piattaforma === "dailymotion" && v.embedId) return `https://www.dailymotion.com/embed/video/${v.embedId}?autoplay=1`;
  return null;
}

function FinestraVideo({ voce, onChiudi }: { voce: VoceCmsPubblica; onChiudi: () => void }) {
  const v = voce.video!;
  const src = srcEmbed(v);
  useEffect(() => {
    const esc = (e: KeyboardEvent) => e.key === "Escape" && onChiudi();
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, [onChiudi]);
  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/85 p-3" role="dialog" aria-modal="true" aria-label={voce.titolo} onClick={onChiudi} data-testid="finestra-video">
      <div className="w-full max-w-4xl" onClick={(e) => e.stopPropagation()}>
        <div className="mb-2 flex items-center justify-between gap-3">
          <h3 className="line-clamp-1 text-sm font-extrabold text-white">{voce.titolo}</h3>
          <button type="button" onClick={onChiudi} className="rounded-full border border-white/20 p-1.5 text-white/80 hover:text-white" aria-label="Chiudi">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-white/10 bg-black">
          {src ? (
            <iframe src={src} className="absolute inset-0 h-full w-full" allow="autoplay; fullscreen; picture-in-picture" allowFullScreen title={voce.titolo} />
          ) : (
            <video src={v.url} controls autoPlay playsInline className="absolute inset-0 h-full w-full" />
          )}
        </div>
        <p className="mt-2 text-[11px] text-white/50">
          {voce.fonte ? `Fonte: ${voce.fonte} · ` : ""}
          <a href={v.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 underline hover:text-white">
            URL originale <ExternalLink className="h-3 w-3" />
          </a>
        </p>
      </div>
    </div>
  );
}

/* ── scheda ─────────────────────────────────────────────────────────────── */

export function CartaSemplice({
  titolo,
  sotto,
  immagine,
  pulsante,
  href,
  esterno,
  onApri,
  accento = GIALLO,
  nota,
  testid,
}: {
  titolo: string;
  sotto?: string | null;
  immagine?: string | null;
  pulsante: string;
  href?: string | null;
  esterno?: boolean;
  onApri?: () => void;
  accento?: string;
  nota?: string | null;
  testid?: string;
}) {
  const corpo = (
    <div className="flex h-full w-[260px] shrink-0 snap-start flex-col overflow-hidden rounded-xl border border-white/12 bg-black text-left transition hover:border-white/35" data-testid={testid}>
      {immagine ? (
        <img src={immagine} alt="" loading="lazy" decoding="async" referrerPolicy="no-referrer" className="aspect-video w-full bg-white/[0.04] object-cover" />
      ) : (
        <div className="aspect-video w-full bg-white/[0.03]" />
      )}
      <div className="flex flex-1 flex-col gap-1.5 p-3">
        <h4 className="line-clamp-2 text-sm font-extrabold text-white">{titolo}</h4>
        {sotto && <p className="line-clamp-2 text-[12px] text-white/60">{sotto}</p>}
        {nota && <p className="text-[11px] text-white/45">{nota}</p>}
        <span className="mt-auto inline-flex w-fit items-center gap-1 rounded-full px-3 py-1.5 text-[10px] font-extrabold tracking-[0.14em] text-black" style={{ background: accento }}>
          {onApri && <Play className="h-3 w-3" fill="currentColor" />}
          {pulsante.toUpperCase()}
          {esterno && <ExternalLink className="h-3 w-3" />}
        </span>
      </div>
    </div>
  );
  if (onApri)
    return (
      <button type="button" onClick={onApri} aria-label={`${pulsante}: ${titolo}`}>
        {corpo}
      </button>
    );
  if (!href) return corpo;
  return esterno ? (
    <a href={href} target="_blank" rel="noopener noreferrer" aria-label={`${pulsante}: ${titolo}`}>
      {corpo}
    </a>
  ) : (
    <Link href={href} aria-label={`${pulsante}: ${titolo}`}>
      {corpo}
    </Link>
  );
}

/** Scheda di un contenuto del pannello: destinazione → link; video incorporabile → finestra; rifiutato → link alla fonte con il motivo. */
export function SchedaCms({ v, accento = GIALLO }: { v: VoceCmsPubblica; accento?: string }) {
  const [aperta, setAperta] = useState(false);
  const sotto = v.descrizione || v.fonte || null;
  const testid = `cms-${v.scheda}`;
  if (v.destinazione)
    return <CartaSemplice titolo={v.titolo} sotto={sotto} immagine={v.immagine} pulsante={v.pulsante || "Apri"} href={v.destinazione} esterno={v.esterno} accento={accento} testid={testid} />;
  if (v.video) {
    const rifiutato = v.verifica?.esito === "errore" || v.video.piattaforma === "pagina";
    if (rifiutato)
      return (
        <CartaSemplice
          titolo={v.titolo}
          sotto={sotto}
          immagine={v.immagine}
          pulsante={v.pulsante || "Guarda alla fonte"}
          href={v.video.url}
          esterno
          accento={accento}
          nota={v.verifica?.esito === "errore" ? `Non riproducibile qui: ${v.verifica.messaggio}` : null}
          testid={testid}
        />
      );
    return (
      <>
        <CartaSemplice titolo={v.titolo} sotto={sotto} immagine={v.immagine} pulsante={v.pulsante || "Guarda"} onApri={() => setAperta(true)} accento={accento} testid={testid} />
        {aperta && <FinestraVideo voce={v} onChiudi={() => setAperta(false)} />}
      </>
    );
  }
  return <CartaSemplice titolo={v.titolo} sotto={sotto} immagine={v.immagine} pulsante={v.pulsante || "Scheda"} accento={accento} testid={testid} />;
}

export function FilaCms({ titolo, voci, accento = GIALLO, vuoto, testid }: { titolo: string; voci: VoceCmsPubblica[]; accento?: string; vuoto?: ReactNode; testid?: string }) {
  return (
    <section className="flex flex-col gap-3" aria-label={titolo} data-testid={testid}>
      <h2 className="text-[13px] font-black tracking-[0.2em] md:text-sm" style={{ color: accento }}>
        {titolo}
      </h2>
      <CaroselloOrizzontale etichetta={titolo} ariaPrecedente="Contenuti precedenti" ariaSuccessivo="Contenuti successivi" frecceDentro autoplay={voci.length > 1 ? 6000 : undefined}>
        {voci.length ? (
          voci.map((v) => <SchedaCms key={v.collocazione} v={v} accento={accento} />)
        ) : (
          <div className="flex min-h-[64px] w-full shrink-0 items-center justify-center rounded-xl border border-dashed border-white/15 px-4 py-3 text-center text-[11px] font-bold uppercase tracking-[0.2em] text-white/40">
            {vuoto ?? "IN ALLESTIMENTO"}
          </div>
        )}
      </CaroselloOrizzontale>
    </section>
  );
}
export const accentoCms = (a: string) => (a === "rosso-dm" ? ROSSO_DM : GIALLO);

/* ── barra CERCO / OFFRO LAVORO ──────────────────────────────────────────── */

export type SchedaHomeEsistente = { id: string; titolo: string; sottotitolo?: string | null; immagine?: string | null; pulsante: string; link: string; esterno: boolean };

/**
 * Una sola barra, quattro schede: Subito · Bakeca · Indeed · Cerco Lavoro in Hotel. Frecce,
 * rotazione automatica delle schede (si ferma appena si tocca), scorrimento col dito. Ogni scheda
 * ha il suo carosello: una fonte in attesa NON blocca le altre.
 */
export function BarraLavoro({ esistentiHotel = [] }: { esistentiHotel?: SchedaHomeEsistente[] }) {
  const q = useLavoroCms("0");
  const schede = q.data?.schede ?? [];
  const [attiva, setAttiva] = useState(0);
  const [ferma, setFerma] = useState(false);
  const tocco = useRef<number | null>(null);
  const n = schede.length;

  useEffect(() => {
    if (ferma || n < 2) return;
    const t = window.setInterval(() => setAttiva((i) => (i + 1) % n), 8000);
    return () => window.clearInterval(t);
  }, [ferma, n]);

  /* la linguetta attiva resta sempre in vista (su mobile la fila scorre in orizzontale) */
  const fila = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const el = fila.current;
    const b = el?.children[attiva] as HTMLElement | undefined;
    if (!el || !b) return;
    el.scrollTo({ left: Math.max(0, b.offsetLeft - (el.clientWidth - b.offsetWidth) / 2), behavior: "smooth" });
  }, [attiva]);

  const vai = (verso: -1 | 1) => {
    setFerma(true);
    setAttiva((i) => (i + verso + n) % n);
  };
  const s = schede[attiva];
  const hotel = s?.id === "casting-concorsi";
  const voci = s?.voci ?? [];
  const altre = hotel ? esistentiHotel.filter((e) => !e.id.startsWith("cms:")) : [];

  return (
    <section
      className="mt-6 flex flex-col gap-3"
      aria-label="Cerco / Offro lavoro"
      data-testid="barra-lavoro"
      onMouseEnter={() => setFerma(true)}
      onFocus={() => setFerma(true)}
      /* scorrimento col dito su tutta la barra (linguette e annunci): sinistra = scheda successiva */
      onTouchStart={(e) => {
        setFerma(true);
        /* se il dito parte su una fila che scorre davvero (annunci o linguette), scorre quella e non cambia scheda */
        let el = e.target as HTMLElement | null;
        while (el && el !== e.currentTarget) {
          if (el.scrollWidth > el.clientWidth + 2 && getComputedStyle(el).overflowX !== "visible") {
            tocco.current = null;
            return;
          }
          el = el.parentElement;
        }
        tocco.current = e.touches[0]?.clientX ?? null;
      }}
      onTouchEnd={(e) => {
        const x = e.changedTouches[0]?.clientX;
        if (tocco.current !== null && x !== undefined && Math.abs(x - tocco.current) > 40) vai(x < tocco.current ? 1 : -1);
        tocco.current = null;
      }}
    >
      <h2 className="text-[13px] font-black tracking-[0.2em] md:text-sm" style={{ color: GIALLO }}>
        CERCO / OFFRO LAVORO
      </h2>
      <div className="flex items-center gap-2">
        <button type="button" onClick={() => vai(-1)} className="shrink-0 rounded-full border border-white/20 p-1.5 text-white/80 hover:border-[#d7ff00] hover:text-white" aria-label="Scheda precedente" data-testid="lavoro-prec">
          <ChevronLeft className="h-4 w-4" />
        </button>
        <div ref={fila} className="relative flex min-w-0 flex-1 gap-2 overflow-x-auto [scrollbar-width:none]" role="tablist" aria-label="Fonti degli annunci">
          {schede.map((x, i) => (
            <button
              key={x.id}
              type="button"
              role="tab"
              aria-selected={i === attiva}
              onClick={() => {
                setFerma(true);
                setAttiva(i);
              }}
              className="shrink-0 rounded-full border px-3 py-1.5 text-[11px] font-extrabold tracking-[0.12em]"
              style={{ borderColor: i === attiva ? GIALLO : "rgba(255,255,255,.15)", color: i === attiva ? "#000" : "#fff", background: i === attiva ? GIALLO : "transparent" }}
              data-testid={`lavoro-tab-${x.id}`}
            >
              {x.nome.toUpperCase()} · {x.voci.length + (x.id === "casting-concorsi" ? esistentiHotel.filter((e) => !e.id.startsWith("cms:")).length : 0)}
            </button>
          ))}
          {!n && <span className="py-1.5 text-[11px] text-white/40">{q.isError ? "Annunci non raggiungibili in questo momento." : "Carico le fonti…"}</span>}
        </div>
        <button type="button" onClick={() => vai(1)} className="shrink-0 rounded-full border border-white/20 p-1.5 text-white/80 hover:border-[#d7ff00] hover:text-white" aria-label="Scheda successiva" data-testid="lavoro-succ">
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
      {s && (
        <div role="tabpanel" data-testid={`lavoro-pannello-${s.id}`}>
          <CaroselloOrizzontale etichetta={s.nome} ariaPrecedente="Annunci precedenti" ariaSuccessivo="Annunci successivi" frecceDentro autoplay={voci.length + altre.length > 1 ? 6000 : undefined}>
            {voci.map((v) => (
              <SchedaCms key={v.collocazione} v={v} />
            ))}
            {altre.map((e) => (
              <CartaSemplice key={e.id} titolo={e.titolo} sotto={e.sottotitolo} immagine={e.immagine} pulsante={e.pulsante} href={e.link} esterno={e.esterno} />
            ))}
            {!voci.length && !altre.length && (
              <div className="flex min-h-[64px] w-full shrink-0 flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-white/15 px-4 py-3 text-center md:px-16" data-testid="lavoro-attesa">
                <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/40">IN ALLESTIMENTO</span>
                <span className="text-[12px] text-white/60">{s.attesa}</span>
                {s.fonte && (
                  <a href={s.fonte} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-[10px] font-extrabold tracking-[0.14em] text-black" style={{ background: GIALLO }}>
                    APRI {s.nome.toUpperCase()} <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>
            )}
          </CaroselloOrizzontale>
        </div>
      )}
    </section>
  );
}
