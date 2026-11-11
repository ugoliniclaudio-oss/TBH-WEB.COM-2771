import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, LayoutGrid, Tv, X } from "lucide-react";
import { Link, useLocation } from "wouter";
import {
  canaleDiPercorso,
  canaleLogo,
  canalePrecedente,
  canaleSuccessivo,
  canaliOrdinati,
  percorsoCanale,
  prioritaCanale,
  type Canale,
  type ContenutoCanale,
} from "../lib/palinsesto";
import { CaroselloOrizzontale } from "./carosello-orizzontale";
import { VociZappingCms } from "./catalogo-cms";
import { VociZappingRegistro } from "./guida-registro";

/**
 * ZAPPING — barra fissa «← Precedente · Tutti i canali · Successivo →».
 *
 * Ordine di Claudio del 28/09/2026: i canali NON hanno numerazione televisiva visibile;
 * l'ordine con cui si scorre è quello della guida (/guida, `canaliOrdinati` di lib/palinsesto.ts).
 * 28/10/2026: visibile anche su smartphone (barra a tutta larghezza in basso, pulsanti ≥ 44 px),
 * sollevata sopra il badge «Made with Runable» fisso in basso a destra (168×37 px, 20 px dal fondo),
 * che altrimenti copriva «Successivo»;
 * «Tutti i canali» apre un PANNELLO con marchi e nomi, canale corrente evidenziato.
 * Su computer resta compatta in basso a sinistra.
 */
export function BarraZapping() {
  const [percorso] = useLocation();
  const [aperto, setAperto] = useState(false);
  const corrente = canaleDiPercorso(percorso) ?? canaliOrdinati({ conHome: true })[0]!;
  const giu = canalePrecedente(corrente.numero);
  const su = canaleSuccessivo(corrente.numero);

  /* Il pannello si chiude cambiando pagina. */
  useEffect(() => setAperto(false), [percorso]);

  const pulsante =
    "flex min-h-11 min-w-11 items-center justify-center gap-1 rounded-lg px-1.5 text-[10.5px] font-extrabold uppercase tracking-[0.05em] transition hover:bg-white/10 sm:gap-1.5 sm:px-2.5 sm:text-[11px] sm:tracking-[0.12em]";

  return (
    <>
      <nav
        aria-label="Cambia canale"
        className="fixed inset-x-2 bottom-[calc(66px+env(safe-area-inset-bottom))] z-40 grid grid-cols-[1fr_auto_1fr] items-stretch gap-1 rounded-xl border border-[var(--tbh-line)] bg-black/95 p-1.5 shadow-lg backdrop-blur sm:inset-x-auto sm:bottom-3 sm:left-3 sm:flex"
        data-testid="barra-zapping"
      >
        <Link
          to={percorsoCanale(giu.numero)}
          className={`${pulsante} justify-start text-[var(--tbh-neon)] sm:justify-center`}
          aria-label={`Canale precedente: ${giu.nome}`}
          title={`Precedente — ${giu.nome}`}
          data-zap-barra="prec"
        >
          <ChevronLeft size={17} aria-hidden className="shrink-0" />
          <span className="flex min-w-0 flex-col items-start leading-tight">
            <span>Precedente</span>
            <span className="hidden max-w-[120px] truncate text-[9px] font-bold tracking-[0.1em] text-white/50 lg:block">{giu.nome}</span>
          </span>
        </Link>

        <button
          type="button"
          onClick={() => setAperto(true)}
          className={`${pulsante} border border-[var(--tbh-line)] text-white`}
          aria-haspopup="dialog"
          aria-expanded={aperto}
          aria-label={`Sei su ${corrente.nome}. Tutti i canali`}
          data-zap-barra="corrente"
          data-zap-canale={corrente.nome}
        >
          <LayoutGrid size={15} style={{ color: corrente.colore }} aria-hidden className="shrink-0" />
          <span className="flex min-w-0 flex-col items-start leading-tight">
            <span>Tutti i canali</span>
            <span className="max-w-[110px] truncate text-[9px] font-bold tracking-[0.1em] text-white/50 sm:max-w-[150px]">{corrente.nome}</span>
          </span>
        </button>

        <Link
          to={percorsoCanale(su.numero)}
          className={`${pulsante} justify-end text-[var(--tbh-neon)] sm:justify-center`}
          aria-label={`Canale successivo: ${su.nome}`}
          title={`Successivo — ${su.nome}`}
          data-zap-barra="succ"
        >
          <span className="flex min-w-0 flex-col items-end leading-tight">
            <span>Successivo</span>
            <span className="hidden max-w-[120px] truncate text-[9px] font-bold tracking-[0.1em] text-white/50 lg:block">{su.nome}</span>
          </span>
          <ChevronRight size={17} aria-hidden className="shrink-0" />
        </Link>
      </nav>
      {aperto && <PannelloCanali corrente={corrente} percorso={percorso} onChiudi={() => setAperto(false)} />}
    </>
  );
}

/** Pannello «Tutti i canali»: marchi e nomi, nell'ordine della guida; Esc o fondo per chiudere. */
function PannelloCanali({ corrente, percorso, onChiudi }: { corrente: Canale; percorso: string; onChiudi: () => void }) {
  const canali = canaliOrdinati({ conHome: true });
  const chiudi = useRef<HTMLButtonElement>(null);
  const attivo = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    const tasto = (e: KeyboardEvent) => {
      if (e.key === "Escape") onChiudi();
    };
    document.addEventListener("keydown", tasto);
    const prima = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    chiudi.current?.focus();
    attivo.current?.scrollIntoView({ block: "center" });
    return () => {
      document.removeEventListener("keydown", tasto);
      document.body.style.overflow = prima;
    };
  }, [onChiudi]);

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center" role="presentation">
      <button type="button" aria-label="Chiudi" tabIndex={-1} className="absolute inset-0 bg-black/75 backdrop-blur-sm" onClick={onChiudi} />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Tutti i canali"
        className="relative flex max-h-[85vh] w-full flex-col rounded-t-2xl border border-[var(--tbh-line)] bg-[#0b0b0d] shadow-2xl sm:max-w-[760px] sm:rounded-2xl"
        data-testid="pannello-canali"
      >
        <div className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-3">
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-white/45">Zapping</p>
            <h2 className="text-base font-black uppercase tracking-[0.12em] text-white">Tutti i canali</h2>
          </div>
          {/* 04/11/2026 (round 17): discografia del Touch Music Records Channel, in alto (sempre visibile). */}
          <Link
            to="/musica/discografia"
            onClick={onChiudi}
            className="ml-auto inline-flex min-h-11 items-center rounded-full border border-[#d4af37] px-4 text-[11px] font-extrabold uppercase tracking-[0.14em] text-[#d4af37] transition hover:bg-[#d4af37] hover:text-black"
            data-testid="zapping-discografia"
          >
            Discografia
          </Link>
          <button
            ref={chiudi}
            type="button"
            onClick={onChiudi}
            className="grid h-11 w-11 place-items-center rounded-full border border-white/20 text-white hover:border-white"
            aria-label="Chiudi il pannello dei canali"
            data-testid="pannello-canali-chiudi"
          >
            <X size={18} aria-hidden />
          </button>
        </div>
        <ul className="grid grid-cols-1 gap-2 overflow-y-auto p-3 sm:grid-cols-2">
          {canali.map((c) => {
            const qui = c.numero === corrente.numero;
            const logo = canaleLogo(c);
            return (
              <li key={c.numero}>
                <Link
                  ref={qui ? attivo : undefined}
                  to={percorsoCanale(c.numero)}
                  onClick={onChiudi}
                  className={`flex min-h-14 items-center gap-3 rounded-xl border px-3 py-2 transition ${qui ? "bg-white/[0.07]" : "border-white/10 hover:border-white/30"}`}
                  style={qui ? { borderColor: "#d7ff00" } : undefined}
                  aria-current={qui ? "page" : undefined}
                  data-canale={c.numero}
                  data-corrente={qui ? "1" : "0"}
                >
                  <span className="grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-lg bg-black">
                    {logo ? (
                      <img src={logo} alt="" width={40} height={40} loading="lazy" className="h-10 w-10 object-contain" />
                    ) : (
                      <Tv size={16} style={{ color: c.colore }} aria-hidden />
                    )}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[13px] font-extrabold uppercase tracking-[0.08em] text-white">{c.nome}</span>
                    <span className="block truncate text-[11px] text-white/50">{c.categoria}</span>
                  </span>
                  {qui && (
                    <span className="shrink-0 rounded-full px-2 py-0.5 text-[9px] font-black tracking-[0.14em] text-black" style={{ background: "#d7ff00" }}>
                      SEI QUI
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
          {/* 04/11/2026 (round 18) — tutti i Channel del registro, senza doppioni. */}
          <VociZappingRegistro onChiudi={onChiudi} percorso={percorso} />
          {/* Home e Channel/pagine aggiunti dal pannello Gestione contenuti (28/10/2026). */}
          <VociZappingCms onChiudi={onChiudi} percorso={percorso} />
        </ul>
        <div className="border-t border-white/10 px-4 py-3">
          <Link to="/guida" onClick={onChiudi} className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-[var(--tbh-neon)] hover:underline">
            Guida completa →
          </Link>
        </div>
      </div>
    </div>
  );
}

/**
 * Il pulsante-canale: marchio reale quando esiste, settore, nome e funzione.
 * Nessun numero: il codice interno resta nel data-attribute per i test, non a schermo.
 */
export function PulsanteCanale({ canale }: { canale: Canale }) {
  const logo = canaleLogo(canale);
  const priorita = prioritaCanale(canale);
  return (
    <Link
      to={percorsoCanale(canale.numero)}
      className="tbh-card shrink-0 w-[240px] sm:w-[260px] p-4 flex flex-col justify-between hover:-translate-y-0.5 transition-transform"
      style={{ borderColor: canale.colore }}
      data-canale={canale.numero}
      data-priorita={priorita}
    >
      <div>
        <div className="flex items-center justify-between gap-2">
          <span className="text-[10px] uppercase tracking-[0.18em] text-[var(--tbh-muted)]">
            {canale.categoria}
          </span>
          {logo ? (
            <img
              src={logo}
              alt={`Marchio ufficiale ${canale.nome}`}
              width={40}
              height={40}
              loading="lazy"
              className="h-9 w-9 shrink-0 rounded-md object-contain"
            />
          ) : (
            <Tv size={16} style={{ color: canale.colore }} aria-hidden />
          )}
        </div>
        <h3 className="tbh-display text-lg mt-2 leading-tight">{canale.nome}</h3>
        <p className="tbh-body text-[13px] text-[var(--tbh-muted)] mt-2 line-clamp-3">
          {canale.funzione}
        </p>
      </div>
      <span
        className="mt-4 inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.14em]"
        style={{ color: canale.colore }}
      >
        <Tv size={13} aria-hidden /> Entra
        {priorita === "in-allestimento" ? " · in allestimento" : ""}
      </span>
    </Link>
  );
}

/**
 * Carrellata orizzontale dei canali: dito su telefono, frecce su computer
 * (CaroselloOrizzontale è l'unico componente di scorrimento del sito).
 * L'ordine è editoriale — priorità calcolata, poi campo `ordine` — e i canali
 * in allestimento restano in coda, mai davanti a quelli già allestiti.
 */
export function CarrellataCanali({
  titolo = "I CANALI TBH",
  sottotitolo = "Scorri, scegli il canale che ti interessa, entra.",
}: {
  titolo?: string;
  sottotitolo?: string;
}) {
  const canali = canaliOrdinati();
  return (
    <section className="mx-auto max-w-[1500px] px-4 md:px-8 py-10" data-blocco="carrellata-canali">
      <div className="flex flex-wrap items-end justify-between gap-3 mb-4">
        <div>
          <span className="text-[10px] uppercase tracking-[0.2em] text-[var(--tbh-muted)]">
            Regia TBH-WEB
          </span>
          <h2 className="tbh-h2 tbh-display">{titolo}</h2>
          <p className="tbh-body text-[var(--tbh-muted)] mt-1">{sottotitolo}</p>
        </div>
        <Link
          to="/guida"
          className="tbh-neon-btn text-[11px] uppercase tracking-[0.14em] px-4 py-2"
        >
          Tutti i canali
        </Link>
      </div>

      <CaroselloOrizzontale
        etichetta="I canali TBH"
        ariaPrecedente="Canale precedente"
        ariaSuccessivo="Canale successivo"
      >
        {canali.map((c) => (
          <PulsanteCanale key={c.numero} canale={c} />
        ))}
      </CaroselloOrizzontale>
    </section>
  );
}

/** Scheda di un contenuto della programmazione: etichetta sopra, titolo grande, badge. */
export function SchedaContenuto({
  contenuto,
  colore,
}: {
  contenuto: ContenutoCanale;
  colore: string;
}) {
  return (
    <Link
      to={contenuto.url}
      className="tbh-card p-4 flex flex-col hover:-translate-y-0.5 transition-transform"
      style={{ borderColor: colore }}
      data-contenuto={contenuto.url}
    >
      <span className="text-[10px] uppercase tracking-[0.18em] text-[var(--tbh-muted)]">
        {contenuto.etichetta}
      </span>
      <h3 className="tbh-display text-xl mt-1.5 leading-tight">{contenuto.titolo}</h3>
      <p className="tbh-body text-[13px] text-[var(--tbh-muted)] mt-2 flex-1">
        {contenuto.descrizione}
      </p>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {contenuto.badge.map((b) => (
          <span
            key={b}
            className="text-[9px] font-bold uppercase tracking-[0.16em] rounded-full px-2 py-0.5 border"
            style={{ color: colore, borderColor: colore }}
          >
            {b}
          </span>
        ))}
        {contenuto.stato !== "attivo" ? (
          <span className="text-[9px] font-bold uppercase tracking-[0.16em] rounded-full px-2 py-0.5 border border-[var(--tbh-line)] text-[var(--tbh-muted)]">
            {contenuto.stato.replace(/-/g, " ")}
          </span>
        ) : null}
      </div>
    </Link>
  );
}
