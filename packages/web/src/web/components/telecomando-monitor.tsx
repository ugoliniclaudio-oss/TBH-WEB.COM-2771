import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Link } from "wouter";
import {
  ArrowRight,
  Briefcase,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Headphones,
  ImageOff,
  Music2,
  Pause,
  Play,
  Wrench,
} from "lucide-react";
import type { StatoCanale, VideoArchivio } from "../../api/data/telecomando";
import type { ElementoCanale } from "../../api/lib/touch-canali";
import { CanalePlayer } from "./canale-player";
import { eventoAccendi } from "../hooks/use-canale-adesso";
import { useCanaleTelecomando } from "../queries/telecomando";
import { usePalinsestoCanale } from "../queries/canali-touch";
import { ANNUNCI_TBH } from "../lib/bacheca-annunci";
import { WSBK_CAMPIONATO, WSBK_DATE, WSBK_INDIRIZZO, WSBK_ROUND } from "../lib/worldsbk-cremona-2026";
import { COLORE_TBH } from "../lib/identita-tbh";
import { PalinsestoPartite } from "./palinsesto-partite";

/**
 * MONITOR DEL TELECOMANDO — un monitor per tipo di canale, sempre con contenuti REALI:
 *   TV / RADIO   → CanalePlayer esistente (palinsesto 24/7 del motore canali);
 *                  TOUCH TV aggiunge le fasce DM 00:00 · 12:00 · 18:00 (replica) e le dirette;
 *   DM           → all'orario ufficiale SOLO diretta, in ogni altro orario replica 24/7
 *                  delle puntate pubblicate (dm-puntate.ts) + archivio puntate + settimana;
 *   SQUADRA      → l'archivio DM della società (dm-video.ts) + dal 17/10/2026 il palinsesto
 *                  partite (calendario e classifica letti su Romagna Sport, palinsesto-partite.tsx);
 *   LAVORO       → annunci TBH della bacheca;
 *   SHOP         → carosello automatico degli articoli con immagine originale + sottofondo;
 *   MISS COOL    → carosello casuale slide ufficiali + promozioni Touch Plaza + sottofondo;
 *   MOTORSPORT   → struttura dichiarata IN ALLESTIMENTO + contenuti reali collegati.
 */

export const GIALLO = COLORE_TBH;
export const ROSSO_DM = "#ff2b2b";

export function BadgeStato({ stato, dm = false }: { stato: StatoCanale; dm?: boolean }) {
  const base = "inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-extrabold tracking-[0.14em]";
  if (stato === "ON AIR")
    return (
      <span className={base} style={{ background: dm ? ROSSO_DM : GIALLO, color: dm ? "#fff" : "#000" }} data-stato="ON AIR">
        <span className="h-1.5 w-1.5 animate-pulse rounded-full" style={{ background: dm ? "#fff" : "#000" }} /> ON AIR
      </span>
    );
  if (stato === "REPLICA")
    return (
      <span className={`${base} border-2`} style={{ borderColor: GIALLO, color: GIALLO }} data-stato="REPLICA">
        REPLICA
      </span>
    );
  if (stato === "CONTENUTI DISPONIBILI")
    return (
      <span className={`${base} border border-white/40 text-[var(--tbh-platinum)]`} data-stato="CONTENUTI DISPONIBILI">
        CONTENUTI DISPONIBILI
      </span>
    );
  return (
    <span className={`${base} border border-dashed border-white/30 text-[var(--tbh-muted)]`} data-stato="IN ALLESTIMENTO">
      IN ALLESTIMENTO
    </span>
  );
}

/** Logo originale del canale, oppure lo slot dichiarato. Mai un logo generato. */
export function LogoCanaleTbh({
  logo,
  nome,
  classe = "h-14 w-20",
}: {
  logo: { src: string; stato: "ufficiale" | "candidato"; nota: string } | null;
  nome: string;
  classe?: string;
}) {
  if (!logo)
    return (
      <div
        className={`${classe} grid shrink-0 place-items-center rounded-xl border border-dashed border-white/25 px-1 text-center`}
        data-testid="logo-in-allestimento"
        title="Nessun logo originale negli asset"
      >
        <span className="flex flex-col items-center gap-0.5">
          <ImageOff className="h-3.5 w-3.5 text-[var(--tbh-muted)]" aria-hidden />
          <span className="text-[8px] font-bold uppercase leading-tight tracking-[0.1em] text-[var(--tbh-muted)]">Logo in allestimento</span>
        </span>
      </div>
    );
  return (
    <div className={`${classe} relative shrink-0`} title={logo.nota}>
      <img
        src={logo.src}
        alt={`Logo ${nome}`}
        loading="lazy"
        className="h-full w-full rounded-lg bg-black object-contain"
        data-testid="logo-canale"
        data-logo-stato={logo.stato}
      />
      {logo.stato === "candidato" && (
        <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-black px-1.5 py-px text-[7px] font-bold uppercase tracking-[0.1em] text-[var(--tbh-gold)] ring-1 ring-[var(--tbh-gold)]/60">
          da approvare
        </span>
      )}
    </div>
  );
}

/* ── video YouTube «leggero»: miniatura reale, il player si carica al clic ───────── */

function VideoLeggero({ id, titolo, inizioSec = 0, etichetta }: { id: string; titolo: string; inizioSec?: number; etichetta?: string }) {
  const [attivo, setAttivo] = useState(false);
  useEffect(() => setAttivo(false), [id]);
  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-black" data-testid="monitor-video">
      {attivo ? (
        <iframe
          src={`https://www.youtube.com/embed/${id}?autoplay=1&rel=0${inizioSec > 0 ? `&start=${Math.floor(inizioSec)}` : ""}`}
          title={titolo}
          allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
          allowFullScreen
          className="absolute inset-0 h-full w-full"
        />
      ) : (
        <button type="button" onClick={() => setAttivo(true)} className="group absolute inset-0 h-full w-full" aria-label={`Riproduci ${titolo}`}>
          <img src={`https://i.ytimg.com/vi/${id}/hqdefault.jpg`} alt="" className="h-full w-full object-cover opacity-80 group-hover:opacity-100" />
          <span className="absolute inset-0 grid place-items-center">
            <span className="grid h-14 w-14 place-items-center rounded-full text-black shadow-lg" style={{ background: GIALLO }}>
              <Play className="ml-0.5 h-6 w-6 fill-current" />
            </span>
          </span>
          {etichetta && (
            <span className="absolute left-3 top-3 rounded-full bg-black/80 px-2.5 py-1 text-[10px] font-extrabold tracking-[0.14em]" style={{ color: GIALLO }}>
              {etichetta}
            </span>
          )}
          <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black to-transparent px-3 pb-2.5 pt-8 text-left text-[13px] font-semibold text-white">
            {titolo}
          </span>
        </button>
      )}
    </div>
  );
}

/* ── sottofondo musicale autorizzato: i brani audio del catalogo TOUCH RADIO ───── */

function Sottofondo() {
  const pal = usePalinsestoCanale("radio");
  const brani = useMemo(() => {
    const visti = new Set<string>();
    const out: { id: string; titolo: string; src: string }[] = [];
    for (const e of (pal.data?.elementi ?? []) as ElementoCanale[]) {
      if (e.tipo !== "brano" || e.fonte.tipo !== "audio" || visti.has(e.branoId)) continue;
      visti.add(e.branoId);
      out.push({ id: e.branoId, titolo: e.titolo, src: e.fonte.src });
    }
    return out;
  }, [pal.data]);
  const [acceso, setAcceso] = useState(false);
  const [i, setI] = useState(0);
  const el = useRef<HTMLAudioElement | null>(null);
  const brano = brani.length ? brani[i % brani.length]! : null;

  useEffect(() => {
    const a = el.current;
    if (!a || !brano) return;
    if (!acceso) {
      a.pause();
      return;
    }
    if (a.getAttribute("src") !== brano.src) a.src = brano.src;
    a.volume = 0.6;
    a.play().catch(() => setAcceso(false));
  }, [acceso, brano]);

  return (
    <div className="flex min-w-0 flex-wrap items-center gap-3 rounded-2xl border border-white/10 px-3 py-2" data-testid="sottofondo">
      <audio ref={el} onEnded={() => setI((n) => n + 1)} preload="none" />
      <button
        type="button"
        disabled={!brano}
        onClick={() => setAcceso((v) => !v)}
        className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[11px] font-extrabold tracking-[0.12em] text-black disabled:opacity-40"
        style={{ background: GIALLO }}
      >
        {acceso ? <Pause className="h-3.5 w-3.5" /> : <Music2 className="h-3.5 w-3.5" />} SOTTOFONDO {acceso ? "ON" : "OFF"}
      </button>
      <span className="min-w-0 flex-1 truncate text-[11px] text-[var(--tbh-muted)]">
        {brano ? (
          <>
            {acceso ? "In riproduzione: " : "Pronto: "}
            <strong className="text-[var(--tbh-platinum)]">{brano.titolo}</strong> · catalogo audio TOUCH RADIO
          </>
        ) : pal.isLoading ? (
          "Caricamento brani…"
        ) : (
          "Nessun brano audio in rotazione oggi."
        )}
      </span>
    </div>
  );
}

/* ── carosello automatico ─────────────────────────────────────────────────────── */

type Diapositiva = { chiave: string; immagine: string; titolo: string; sopra: string; prezzo?: string | null; link: string; contiene?: boolean };

function euro(c: number) {
  return new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR" }).format(c / 100);
}

function Carosello({ voci, passoMs = 6000 }: { voci: Diapositiva[]; passoMs?: number }) {
  const [i, setI] = useState(0);
  const [pausa, setPausa] = useState(false);
  useEffect(() => {
    if (pausa || voci.length < 2) return;
    const t = setInterval(() => setI((n) => (n + 1) % voci.length), passoMs);
    return () => clearInterval(t);
  }, [pausa, voci.length, passoMs]);
  if (!voci.length) return <SchermoAllestimento testo="Nessun contenuto con immagine originale." />;
  const v = voci[i % voci.length]!;
  return (
    <div
      className="relative aspect-video w-full overflow-hidden rounded-2xl bg-black"
      onMouseEnter={() => setPausa(true)}
      onMouseLeave={() => setPausa(false)}
      data-testid="carosello"
      data-totale={voci.length}
    >
      <img
        key={v.chiave}
        src={v.immagine}
        alt={v.titolo}
        className={`absolute inset-0 h-full w-full ${v.contiene ? "object-contain" : "object-cover"} tbh-rise`}
        data-testid="carosello-immagine"
      />
      <div className="absolute inset-x-0 bottom-0 flex flex-wrap items-end justify-between gap-2 bg-gradient-to-t from-black via-black/80 to-transparent px-3 pb-3 pt-10">
        <div className="min-w-0">
          <p className="text-[9px] font-bold uppercase tracking-[0.2em]" style={{ color: GIALLO }}>
            {v.sopra}
          </p>
          <p className="line-clamp-2 text-sm font-bold text-white md:text-base">{v.titolo}</p>
          {v.prezzo && <p className="tbh-dato mt-0.5 text-sm font-extrabold" style={{ color: GIALLO }}>{v.prezzo}</p>}
        </div>
        <Link
          to={v.link}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-2 text-[11px] font-extrabold tracking-[0.12em] text-black"
          style={{ background: GIALLO }}
          data-testid="carosello-scheda"
        >
          VAI ALLA SCHEDA <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
      {voci.length > 1 && (
        <>
          <button type="button" aria-label="Precedente" onClick={() => setI((n) => (n - 1 + voci.length) % voci.length)} className="absolute left-2 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full bg-black/70 text-white hover:text-[var(--tbh-neon)]">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button type="button" aria-label="Successivo" onClick={() => setI((n) => (n + 1) % voci.length)} className="absolute right-2 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full bg-black/70 text-white hover:text-[var(--tbh-neon)]">
            <ChevronRight className="h-4 w-4" />
          </button>
          <span className="absolute right-3 top-3 rounded-full bg-black/80 px-2 py-0.5 text-[10px] font-bold text-white">
            {(i % voci.length) + 1} / {voci.length}
          </span>
        </>
      )}
    </div>
  );
}

function SchermoAllestimento({ testo }: { testo: string }) {
  return (
    <div className="grid aspect-video w-full place-items-center rounded-2xl border border-dashed border-white/20 bg-black p-4 text-center" data-testid="schermo-allestimento">
      <div className="flex flex-col items-center gap-2">
        <Wrench className="h-6 w-6 text-[var(--tbh-muted)]" />
        <BadgeStato stato="IN ALLESTIMENTO" />
        <p className="max-w-[44ch] text-xs text-[var(--tbh-muted)]">{testo}</p>
      </div>
    </div>
  );
}

function Riquadro({ titolo, children }: { titolo: string; children: ReactNode }) {
  return (
    <div className="min-w-0 rounded-2xl border border-white/10 p-3">
      <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: GIALLO }}>
        {titolo}
      </p>
      {children}
    </div>
  );
}

function ora(ms: number) {
  return new Intl.DateTimeFormat("it-IT", { timeZone: "Europe/Rome", hour: "2-digit", minute: "2-digit" }).format(ms);
}

/* ── i monitor per tipo ───────────────────────────────────────────────────────── */

type Dati = NonNullable<ReturnType<typeof useCanaleTelecomando>["data"]>;

function FasceDm({ d, fasce, titolo, nota }: { d: Dati; fasce: Dati["dm"]["fasceOggi"]; titolo: string; nota: string }) {
  const adesso = d.adesso;
  const lista = useRef<HTMLOListElement>(null);
  /* la fascia in onda resta visibile in cima all'elenco (scorre solo il riquadro, non la pagina) */
  useEffect(() => {
    const el = lista.current?.querySelector<HTMLElement>("[data-in-onda]");
    if (el && lista.current) lista.current.scrollTop = el.offsetTop; // <ol> è «relative»: offsetTop è già interno all'elenco
  }, [fasce, adesso]);
  return (
    <Riquadro titolo={titolo}>
      <ol ref={lista} className="relative flex max-h-72 flex-col divide-y divide-white/5 overflow-y-auto pr-1" data-testid="fasce-dm">
        {fasce.map((f) => {
          const ora_ = f.inizio <= adesso && adesso < f.fine;
          const finita = f.fine <= adesso;
          return (
            <li key={`${f.tipo}-${f.inizio}`} data-in-onda={ora_ || undefined} className={`flex min-w-0 items-center gap-3 py-1.5 text-sm ${finita ? "opacity-50" : ""}`}>
              <span className="tbh-dato w-24 shrink-0 font-semibold" style={{ color: f.tipo === "diretta" ? ROSSO_DM : GIALLO }}>
                {ora(f.inizio)}–{ora(f.fine)}
              </span>
              <span className="min-w-0 flex-1 truncate text-[var(--tbh-platinum)]">
                {f.tipo === "diretta" ? `DIRETTA DM — ${f.titolo}` : `REPLICA DM — ${f.titolo}`}
              </span>
              {ora_ && <BadgeStato stato={f.tipo === "diretta" ? "ON AIR" : "REPLICA"} dm={f.tipo === "diretta"} />}
            </li>
          );
        })}
      </ol>
      <p className="mt-2 text-[11px] text-[var(--tbh-muted)]">{nota}</p>
    </Riquadro>
  );
}

function MonitorTv({ d }: { d: Dati }) {
  const c = d.dm.tv.corrente;
  return (
    <div className="flex flex-col gap-3">
      {c?.tipo === "replica" && c.videoId ? (
        <>
          <VideoLeggero id={c.videoId} titolo={`REPLICA — ${c.titolo}`} inizioSec={(d.adesso - c.inizio) / 1000} etichetta="REPLICA DM" />
          <p className="text-[11px] text-[var(--tbh-muted)]">
            Fascia replica {ora(c.inizio)}–{ora(c.fine)}: il player parte dal minuto in onda. Al termine riprende il palinsesto TOUCH TV.
          </p>
        </>
      ) : (
        <>
          <CanalePlayer canale="tv" compatto />
          <button
            type="button"
            onClick={() => window.dispatchEvent(new Event(eventoAccendi("tv")))}
            className="inline-flex items-center justify-center gap-2 rounded-full px-4 py-2.5 text-sm font-extrabold tracking-[0.14em] text-black"
            style={{ background: GIALLO }}
          >
            <Play className="h-4 w-4 fill-current" /> GUARDA TV
          </button>
        </>
      )}
      <ScalettaOggi canale="tv" d={d} />
      <FasceDm
        d={d}
        fasce={d.dm.tv.fasceOggi}
        titolo="Fasce DM di oggi · le dirette prevalgono"
        nota={`Repliche alle ${d.dm.fasceReplica.join(" · ")} con le ultime puntate pubblicate da DM, a turno ogni giorno. Fuori dalle fasce: musica e pubblicità del palinsesto.`}
      />
    </div>
  );
}

function MonitorRadio({ d }: { d: Dati }) {
  return (
    <div className="flex flex-col gap-3">
      <CanalePlayer canale="radio" compatto />
      <button
        type="button"
        onClick={() => window.dispatchEvent(new Event(eventoAccendi("radio")))}
        className="inline-flex items-center justify-center gap-2 rounded-full px-4 py-2.5 text-sm font-extrabold tracking-[0.14em] text-black"
        style={{ background: GIALLO }}
      >
        <Headphones className="h-4 w-4" /> ASCOLTA RADIO
      </button>
      <ScalettaOggi canale="radio" d={d} />
      <Riquadro titolo="Highlights e interviste DM di oggi · selezione casuale">
        <ul className="flex flex-col divide-y divide-white/5" data-testid="selezione-radio">
          {(d.selezioneRadio ?? []).map((s) => (
            <li key={s.video.id} className="flex min-w-0 items-center gap-2 py-1.5 text-[13px]">
              <span className="w-20 shrink-0 text-[9px] font-bold uppercase tracking-[0.12em]" style={{ color: s.video.tipo === "highlights" ? GIALLO : "#fff" }}>
                {s.video.tipo === "highlights" ? "Highlights" : "Intervista"}
              </span>
              <Link to={`/check-web/canali/${s.slugCanale}`} className="min-w-0 flex-1 truncate text-[var(--tbh-platinum)] hover:text-[var(--tbh-neon)]">
                {s.video.titolo}
              </Link>
            </li>
          ))}
        </ul>
        <p className="mt-2 text-[11px] text-[var(--tbh-muted)]">
          Versione audio IN ALLESTIMENTO: servono gli estratti audio autorizzati. Intanto ogni video resta riproducibile nel monitor della sua squadra.
        </p>
      </Riquadro>
    </div>
  );
}

function MonitorDm({ d }: { d: Dati }) {
  const c = d.dm.corrente;
  const r = d.dm.replica;
  const inDiretta = c?.tipo === "diretta";
  /* una puntata scelta dall'archivio va nel monitor; durante la diretta la diretta prevale */
  const [scelta, setScelta] = useState<{ id: string; titolo: string } | null>(null);
  return (
    <div className="flex flex-col gap-3">
      {inDiretta ? (
        <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-black" data-testid="monitor-diretta-dm">
          <iframe src={c.embed} title={`Diretta DM — ${c.titolo}`} allow="autoplay; encrypted-media; fullscreen" allowFullScreen className="absolute inset-0 h-full w-full" />
        </div>
      ) : scelta ? (
        <VideoLeggero id={scelta.id} titolo={scelta.titolo} etichetta="ARCHIVIO DM" />
      ) : c?.tipo === "replica" && c.videoId ? (
        <VideoLeggero id={c.videoId} titolo={`REPLICA — ${c.titolo}`} inizioSec={(d.adesso - c.inizio) / 1000} etichetta="REPLICA" />
      ) : r ? (
        <VideoLeggero id={r.videoId} titolo={r.titolo} etichetta="ARCHIVIO · ULTIMA PUNTATA" />
      ) : (
        <SchermoAllestimento testo="Nessuna puntata DM pubblicata." />
      )}
      <p className="text-[11px] text-[var(--tbh-muted)]" data-testid="regola-dm">
        {inDiretta
          ? `IN DIRETTA fino alle ${ora(c.fine)}: all'orario ufficiale il programma va solo in diretta.`
          : c?.tipo === "replica"
            ? `REPLICA ${ora(c.inizio)}–${ora(c.fine)} · ${c.programma}: il player parte dal minuto in onda. Agli orari ufficiali va in onda solo la diretta.`
            : "Agli orari ufficiali va in onda solo la diretta; negli altri orari le repliche delle puntate pubblicate."}
        {scelta && !inDiretta && (
          <>
            {" "}
            <button type="button" onClick={() => setScelta(null)} className="font-bold text-[var(--tbh-neon)] underline">
              Torna alla programmazione in onda
            </button>
          </>
        )}
      </p>
      <div className="grid gap-3 md:grid-cols-2">
        <Riquadro titolo="Calendario ufficiale delle dirette">
          <ul className="flex flex-col gap-1 text-[13px]" data-testid="settimana-dm">
            {d.dm.settimana.map((p) => (
              <li key={p.slug} className="flex min-w-0 gap-2">
                <span className="tbh-dato w-28 shrink-0 capitalize" style={{ color: ROSSO_DM }}>
                  {p.giorno} {p.ora}
                </span>
                <span className="min-w-0 truncate text-[var(--tbh-platinum)]">{p.nome}</span>
              </li>
            ))}
          </ul>
          {d.dm.prossimaDiretta && (
            <p className="mt-2 text-[11px] text-[var(--tbh-muted)]">
              Prossima diretta: <strong className="text-[var(--tbh-platinum)]">{d.dm.prossimaDiretta.titolo}</strong> alle {ora(d.dm.prossimaDiretta.inizio)}
            </p>
          )}
        </Riquadro>
        <FasceDm
          d={d}
          fasce={d.dm.fasceOggi}
          titolo="DM Channel oggi · dirette e repliche"
          nota={`${d.dm.totalePuntate} puntate dell'edizione 2026-27 in rotazione, un programma per volta. La diretta prevale sempre sulla replica.`}
        />
      </div>
      <ArchivioPuntateDm d={d} disattivo={inDiretta} onScegli={setScelta} />
      <div className="flex flex-wrap gap-2">
        <Pulsante to="/dm">Pagina DM completa</Pulsante>
        <Pulsante to="/dm/programmi">Programmi e archivio</Pulsante>
        <Pulsante to="/sport/highlights-dm">Archivio highlights squadre</Pulsante>
      </div>
    </div>
  );
}

function dataBreve(iso: string) {
  return new Intl.DateTimeFormat("it-IT", { timeZone: "Europe/Rome", day: "2-digit", month: "2-digit" }).format(new Date(iso));
}

function ArchivioPuntateDm({ d, disattivo, onScegli }: { d: Dati; disattivo: boolean; onScegli: (v: { id: string; titolo: string }) => void }) {
  const gruppi = [...d.dm.archivio, { slug: "altre-dirette", nome: "Altre dirette", puntate: d.dm.altreDirette }];
  const [slug, setSlug] = useState(gruppi[0]?.slug ?? "");
  const attivo = gruppi.find((g) => g.slug === slug) ?? gruppi[0];
  return (
    <Riquadro titolo="Archivio puntate DM · edizione 2026-27">
      <div className="mb-2 flex flex-wrap gap-1.5" role="tablist">
        {gruppi.map((g) => (
          <button
            key={g.slug}
            type="button"
            role="tab"
            aria-selected={g.slug === attivo?.slug}
            onClick={() => setSlug(g.slug)}
            className="rounded-full border px-2.5 py-1 text-[10px] font-bold tracking-[0.1em]"
            style={g.slug === attivo?.slug ? { background: GIALLO, color: "#000", borderColor: GIALLO } : { borderColor: "rgba(255,255,255,.2)", color: "var(--tbh-platinum)" }}
          >
            {g.nome} · {g.puntate.length}
          </button>
        ))}
      </div>
      <ul className="flex flex-col divide-y divide-white/5" data-testid="archivio-puntate-dm">
        {(attivo?.puntate ?? []).map((p) => (
          <li key={p.videoId} className="flex min-w-0 items-center gap-2 py-1.5 text-[13px]">
            <span className="tbh-dato w-10 shrink-0 text-[11px] font-bold" style={{ color: GIALLO }}>
              {p.numero ? `${p.numero}ª` : "SPEC."}
            </span>
            <button
              type="button"
              disabled={disattivo}
              onClick={() => onScegli({ id: p.videoId, titolo: p.titolo })}
              className="min-w-0 flex-1 truncate text-left text-[var(--tbh-platinum)] hover:text-[var(--tbh-neon)] disabled:cursor-not-allowed disabled:opacity-60"
              title={p.titolo}
            >
              {p.titolo}
            </button>
            <span className="tbh-dato shrink-0 text-[11px] text-[var(--tbh-muted)]">
              {p.pubblicata ? `${dataBreve(p.pubblicata)} · ` : ""}
              {p.durata}
            </span>
          </li>
        ))}
      </ul>
      <p className="mt-2 text-[11px] text-[var(--tbh-muted)]">
        Dirette concluse del canale ufficiale «Daniele Manuelli -DM Comunicazione-», titoli come pubblicati.
        {disattivo ? " Durante la diretta il monitor resta sulla diretta." : " Tocca una puntata per vederla nel monitor."} Le date mancanti sono da confermare.
      </p>
    </Riquadro>
  );
}

function Pulsante({ to, children }: { to: string; children: string }) {
  return (
    <Link to={to} className="inline-flex items-center gap-1.5 rounded-full border border-white/20 px-3 py-2 text-[11px] font-bold tracking-[0.1em] text-[var(--tbh-platinum)] hover:border-[var(--tbh-neon)] hover:text-[var(--tbh-neon)]">
      {children} <ArrowRight className="h-3 w-3" />
    </Link>
  );
}

const TIPI_VIDEO: { id: VideoArchivio["tipo"]; nome: string }[] = [
  { id: "highlights", nome: "Partite · Highlights · Goal" },
  { id: "interviste", nome: "Interviste" },
  { id: "servizi", nome: "Servizi e notizie" },
];

function MonitorSquadra({ d, compatto }: { d: Dati; compatto: boolean }) {
  const s = d.squadra!;
  const [tipo, setTipo] = useState<VideoArchivio["tipo"]>("highlights");
  const disponibili = TIPI_VIDEO.filter((t) => s.video.some((v) => v.tipo === t.id));
  const attivo = disponibili.some((t) => t.id === tipo) ? tipo : (disponibili[0]?.id ?? "highlights");
  const lista = s.video.filter((v) => v.tipo === attivo);
  const [scelto, setScelto] = useState<string | null>(null);
  const video = lista.find((v) => v.id === scelto) ?? lista[0] ?? null;

  return (
    <div className="flex flex-col gap-3">
      {(s.daConfermare || s.territorio) && (
        <p className="rounded-xl border border-[var(--tbh-gold)]/50 px-3 py-2 text-[11px] text-[var(--tbh-gold)]" data-testid="avviso-da-confermare">
          {s.territorio
            ? "ANTEPRIMA DA CONFERMARE · dal 16/10/2026 il Rimini è in coda al nastro delle squadre seguite da DM, ma la pagina società resta com'è (17/10): questi video reali del canale DM sono solo in anteprima."
            : "ANTEPRIMA DA CONFERMARE · video reali del canale DM che nominano «Gambettola»: va confermato che siano della Junior Gambettola."}
        </p>
      )}
      {video ? (
        <VideoLeggero id={video.id} titolo={video.titolo} etichetta={TIPI_VIDEO.find((t) => t.id === video.tipo)?.nome.toUpperCase()} />
      ) : (
        <SchermoAllestimento testo="Nessun video DM per questa società: nessun contenuto inventato." />
      )}
      {disponibili.length > 0 && (
        <div className="flex flex-wrap gap-2" role="tablist">
          {disponibili.map((t) => (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={t.id === attivo}
              onClick={() => {
                setTipo(t.id);
                setScelto(null);
              }}
              className="rounded-full border px-3 py-1.5 text-[11px] font-bold tracking-[0.08em]"
              style={t.id === attivo ? { background: GIALLO, color: "#000", borderColor: GIALLO } : { borderColor: "rgba(255,255,255,.2)" }}
            >
              {t.nome} · {s.video.filter((v) => v.tipo === t.id).length}
            </button>
          ))}
        </div>
      )}
      <ol className={`flex flex-col divide-y divide-white/5 overflow-y-auto rounded-2xl border border-white/10 px-3 ${compatto ? "max-h-56" : "max-h-[420px]"}`} data-testid="archivio-squadra">
        {lista.map((v) => (
          <li key={v.id}>
            <button
              type="button"
              onClick={() => setScelto(v.id)}
              className="flex w-full min-w-0 items-center gap-2 py-2 text-left text-[13px] hover:text-[var(--tbh-neon)]"
              style={v.id === video?.id ? { color: GIALLO } : undefined}
            >
              <Play className="h-3 w-3 shrink-0" /> <span className="min-w-0 truncate">{v.titolo}</span>
            </button>
          </li>
        ))}
      </ol>
      <p className="text-[11px] text-[var(--tbh-muted)]">
        Solo contenuti dell'archivio DM abbinati a questa società: titoli come li ha pubblicati il canale. Nessuna partita o video inventato.
      </p>
      {/* 17/10/2026 «CREA I PALINSESTI CHANNEL»: calendario e classifica letti su Romagna Sport. */}
      {d.voce.squadra && <PalinsestoPartite squadra={d.voce.squadra} compatto={compatto} />}
      <ProgrammazioneProvvisoria d={d} />
    </div>
  );
}

function MonitorLavoro() {
  const voci: Diapositiva[] = ANNUNCI_TBH.filter((a) => a.immagine && a.scheda.tipo === "interna").map((a) => ({
    chiave: a.slug,
    immagine: a.immagine!,
    titolo: a.titolo,
    sopra: a.azienda,
    link: a.scheda.tipo === "interna" ? a.scheda.to : "/lavoro-casting/bacheca",
    contiene: true,
  }));
  return (
    <div className="flex flex-col gap-3">
      <Carosello voci={voci} passoMs={7000} />
      <div className="flex flex-wrap gap-2">
        <Pulsante to="/lavoro-casting/bacheca">Bacheca annunci</Pulsante>
        <Pulsante to="/casting">Casting aperti</Pulsante>
        <Pulsante to="/lavoro-casting/candidature">Candidature</Pulsante>
      </div>
      <p className="flex items-center gap-2 text-[11px] text-[var(--tbh-muted)]">
        <Briefcase className="h-3.5 w-3.5" /> Candidature solo a lavoro@tibihacca.com o dai moduli online della bacheca.
      </p>
    </div>
  );
}

/* Le tre rubriche del «carosello ON AIR» della specifica, ricavate dalla categoria reale dell'articolo. */
type Articolo = Dati["articoli"][number];
const RUBRICHE_PROMO = [
  { id: "prodotti", nome: "Prodotti Touch Plaza", nota: "Immagine, prezzo e scheda articolo", to: "/shop" },
  { id: "corsi", nome: "Corsi Touch Academy", nota: "I corsi disponibili", to: "/touch-academy" },
  { id: "servizi", nome: "Servizi ed eventi TBH", nota: "Servizi e proposte commerciali", to: "/shop" },
] as const;
function rubricaPromo(categoria: string) {
  if (/formazione|corso|academy/i.test(categoria)) return RUBRICHE_PROMO[1];
  if (/prodott|beauty|food|beverage/i.test(categoria)) return RUBRICHE_PROMO[0];
  return RUBRICHE_PROMO[2];
}

function diapositiveArticoli(lista: Articolo[], sopra?: string): Diapositiva[] {
  return lista.map((a) => ({
    chiave: a.slug,
    immagine: a.immagine,
    titolo: a.titolo,
    sopra: sopra ?? `${rubricaPromo(a.categoria).nome} · ${a.categoria}`,
    prezzo: a.prezzoCents ? euro(a.prezzoCents) : null,
    link: a.scheda,
    contiene: true,
  }));
}

/**
 * PROGRAMMAZIONE PROVVISORIA AUTOMATICA — per i canali senza trasmissioni proprie sufficienti:
 * carosello promozionale ON AIR con sottofondo musicale, contenuti presi a caso dal negozio reale.
 */
function ProgrammazioneProvvisoria({ d }: { d: Dati }) {
  const lista = d.promoProvvisoria;
  if (!lista.length) return null;
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-white/10 p-3" data-testid="programmazione-provvisoria">
      <div className="flex flex-wrap items-center gap-2">
        <BadgeStato stato="ON AIR" />
        <p className="text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: GIALLO }}>
          Programmazione provvisoria automatica · carosello promozionale
        </p>
      </div>
      <Carosello voci={diapositiveArticoli(lista)} />
      <Sottofondo />
      <RubrichePromo lista={lista} />
      <p className="text-[11px] text-[var(--tbh-muted)]">
        In onda finché il canale non ha trasmissioni proprie: {lista.length} contenuti reali del negozio con immagine originale, in ordine casuale del giorno.
      </p>
    </div>
  );
}

function RubrichePromo({ lista }: { lista: Articolo[] }) {
  return (
    <div className="grid gap-2 sm:grid-cols-3" data-testid="rubriche-promo">
      {RUBRICHE_PROMO.map((r) => {
        const n = lista.filter((a) => rubricaPromo(a.categoria).id === r.id).length;
        return (
          <Link key={r.id} to={r.to} className="min-w-0 rounded-xl border border-white/10 px-3 py-2 hover:border-[var(--tbh-neon)]">
            <p className="truncate text-[12px] font-bold text-[var(--tbh-platinum)]">{r.nome}</p>
            <p className="text-[11px] text-[var(--tbh-muted)]">
              {r.nota} · {n ? `${n} in rotazione` : "nessun contenuto con immagine"}
            </p>
          </Link>
        );
      })}
    </div>
  );
}

/* ── scaletta di oggi del palinsesto TV / Radio: musica · pubblicità · DM ─────────── */

type Passaggio = { chiave: string; inizio: number; fine: number; genere: "MUSICA" | "PUBBLICITÀ" | "DM DIRETTA" | "DM REPLICA"; titolo: string; sotto: string };

function ScalettaOggi({ canale, d }: { canale: "tv" | "radio"; d: Dati }) {
  const pal = usePalinsestoCanale(canale);
  const passaggi = useMemo(() => {
    const repliche = canale === "tv" ? d.dm.tv.fasceOggi.filter((f) => f.tipo === "replica") : [];
    const dentroReplica = (t: number) => repliche.some((f) => f.inizio <= t && t < f.fine);
    const out: Passaggio[] = [];
    for (const e of (pal.data?.elementi ?? []) as ElementoCanale[]) {
      if (dentroReplica(e.inizio)) continue;
      if (e.tipo === "brano") out.push({ chiave: `${e.inizio}`, inizio: e.inizio, fine: e.fine, genere: "MUSICA", titolo: e.titolo, sotto: e.artista });
      else if (e.tipo === "spot") out.push({ chiave: `${e.inizio}`, inizio: e.inizio, fine: e.fine, genere: "PUBBLICITÀ", titolo: e.titolo, sotto: e.inserzionista });
      else if (e.tipo === "dm") out.push({ chiave: `${e.inizio}`, inizio: e.inizio, fine: e.fine, genere: "DM DIRETTA", titolo: e.titolo, sotto: "Diretta ufficiale DM: prevale su tutto" });
    }
    for (const f of repliche) out.push({ chiave: `r${f.inizio}`, inizio: f.inizio, fine: f.fine, genere: "DM REPLICA", titolo: f.titolo, sotto: `Fascia DM · replica ${f.programma}` });
    return out.sort((a, b) => a.inizio - b.inizio);
  }, [pal.data, d.dm.tv.fasceOggi, canale]);

  const adesso = d.adesso;
  const i = Math.max(0, passaggi.findIndex((p) => p.fine > adesso));
  const finestra = passaggi.slice(i, i + 8);
  const conta = (g: Passaggio["genere"]) => passaggi.filter((p) => p.genere === g).length;
  const colore = (g: Passaggio["genere"]) => (g === "DM DIRETTA" ? ROSSO_DM : g === "DM REPLICA" ? GIALLO : g === "PUBBLICITÀ" ? "#fff" : "var(--tbh-muted)");

  return (
    <Riquadro titolo={`Palinsesto di oggi · ${canale === "tv" ? "Touch TV" : "Touch Radio"}`}>
      {pal.isLoading ? (
        <p className="text-[12px] text-[var(--tbh-muted)]">Caricamento palinsesto…</p>
      ) : (
        <>
          <p className="mb-2 text-[11px] text-[var(--tbh-muted)]" data-testid="conteggi-palinsesto">
            Oggi: {conta("MUSICA")} brani · {conta("PUBBLICITÀ")} passaggi pubblicitari · {conta("DM DIRETTA")} {conta("DM DIRETTA") === 1 ? "diretta" : "dirette"} DM
            {canale === "tv" ? ` · ${conta("DM REPLICA")} fasce replica DM` : ""}
          </p>
          <ol className="flex flex-col divide-y divide-white/5" data-testid="scaletta-oggi">
            {finestra.map((p) => {
              const ora_ = p.inizio <= adesso && adesso < p.fine;
              return (
                <li key={p.chiave} className="flex min-w-0 items-center gap-2 py-1.5 text-[13px]">
                  <span className="tbh-dato w-11 shrink-0 text-[var(--tbh-muted)]">{ora(p.inizio)}</span>
                  <span className="w-[86px] shrink-0 text-[9px] font-extrabold tracking-[0.12em]" style={{ color: colore(p.genere) }}>
                    {p.genere}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-[var(--tbh-platinum)]">
                    {p.titolo} <span className="text-[var(--tbh-muted)]">· {p.sotto}</span>
                  </span>
                  {ora_ && <BadgeStato stato={p.genere === "DM REPLICA" ? "REPLICA" : "ON AIR"} dm={p.genere === "DM DIRETTA"} />}
                </li>
              );
            })}
          </ol>
        </>
      )}
    </Riquadro>
  );
}

function diapositiveShop(d: Dati, sopra?: string): Diapositiva[] {
  return d.articoli.map((a) => ({
    chiave: a.slug,
    immagine: a.immagine,
    titolo: a.titolo,
    sopra: sopra ?? `${rubricaPromo(a.categoria).nome} · ${a.categoria}`,
    prezzo: a.prezzoCents ? euro(a.prezzoCents) : null,
    link: a.scheda,
    contiene: true,
  }));
}

function MonitorShop({ d }: { d: Dati }) {
  return (
    <div className="flex flex-col gap-3">
      <Carosello voci={diapositiveShop(d)} />
      <Sottofondo />
      <RubrichePromo lista={d.articoli} />
      <p className="text-[11px] text-[var(--tbh-muted)]">
        {d.articoli.length} articoli con immagine originale, in ordine casuale del giorno. {d.articoliSenzaImmagine} articoli del negozio senza immagine restano fuori dal carosello (IN ALLESTIMENTO).
      </p>
      <Pulsante to="/shop">Apri il negozio Touch Plaza</Pulsante>
    </div>
  );
}

function MonitorMissCool({ d }: { d: Dati }) {
  const slide: Diapositiva[] = d.slideMissCool.map((s) => ({
    chiave: `slide-${s.n}`,
    immagine: s.immagine,
    titolo: s.titolo,
    sopra: `Touch Miss Cool · ${s.sezione}`,
    link: "/eventi/miss-cool",
    contiene: true,
  }));
  const promo = diapositiveShop(d).map((p) => ({ ...p, sopra: `Promozione · ${p.sopra}` }));
  const voci: Diapositiva[] = [];
  let k = 0;
  slide.forEach((sl, i) => {
    voci.push(sl);
    if (i % 2 === 1 && promo[k]) voci.push(promo[k++]!);
  });
  while (promo[k]) voci.push(promo[k++]!);
  return (
    <div className="flex flex-col gap-3">
      <Carosello voci={voci} />
      <Sottofondo />
      <div className="grid gap-2 sm:grid-cols-2" data-testid="voci-miss-cool">
        {d.vociMissCool.map((v) => (
          <div key={v.nome} className="flex min-w-0 items-start justify-between gap-2 rounded-xl border border-white/10 px-3 py-2">
            <div className="min-w-0">
              <p className="text-[13px] font-bold text-[var(--tbh-platinum)]">{v.nome}</p>
              <p className="text-[11px] text-[var(--tbh-muted)]">{v.nota}</p>
            </div>
            {v.pagina ? (
              <Link to={v.pagina} className="shrink-0 text-[11px] font-bold hover:text-[var(--tbh-neon)]" style={{ color: GIALLO }}>
                APRI
              </Link>
            ) : (
              <BadgeStato stato="IN ALLESTIMENTO" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function MonitorMotorsport({ d }: { d: Dati }) {
  return (
    <div className="flex flex-col gap-3">
      <ProgrammazioneProvvisoria d={d} />
      <p className="rounded-xl border border-dashed border-white/20 px-3 py-2 text-[11px] text-[var(--tbh-muted)]" data-testid="motorsport-allestimento">
        Contenuti propri del canale: IN ALLESTIMENTO. Nessun video, gara, intervista o highlight motorsport riproducibile negli archivi del sito; il
        carosello qui sopra è la programmazione provvisoria.
      </p>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-5" data-testid="sezioni-motorsport">
        {d.sezioniMotorsport.map((s) => (
          <div key={s} className="flex flex-col items-start gap-1.5 rounded-xl border border-dashed border-white/20 p-2.5">
            <p className="text-[12px] font-bold text-[var(--tbh-platinum)]">{s}</p>
            <BadgeStato stato="IN ALLESTIMENTO" />
          </div>
        ))}
      </div>
      <Riquadro titolo="Già nel sito · collegato al canale">
        <p className="text-[13px] font-bold text-[var(--tbh-platinum)]">
          {WSBK_ROUND} — {WSBK_CAMPIONATO}
        </p>
        <p className="flex items-center gap-1.5 text-[11px] text-[var(--tbh-muted)]">
          <CalendarDays className="h-3 w-3" /> {WSBK_DATE} · {WSBK_INDIRIZZO}
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          <Pulsante to="/cremona-circuit-2026">Cremona Circuit 2026</Pulsante>
          <Pulsante to="/sport/motorsport">Pagina Motorsport</Pulsante>
        </div>
      </Riquadro>
      {d.articoli.length > 0 && (
        <Riquadro titolo="Corsi e servizi Touch Plaza per il motorsport">
          <Carosello voci={diapositiveShop(d, "Touch Plaza · Motorsport")} />
        </Riquadro>
      )}
    </div>
  );
}

/** Il monitor del canale scelto. `compatto` = dentro il telecomando; altrimenti pagina-canale. */
export function MonitorTelecomando({ slug, compatto = false }: { slug: string; compatto?: boolean }) {
  const q = useCanaleTelecomando(slug);
  if (q.isLoading) return <div className="grid aspect-video place-items-center rounded-2xl bg-black text-xs text-[var(--tbh-muted)]">Caricamento monitor…</div>;
  const d = q.data;
  if (!d) return <SchermoAllestimento testo="Canale non trovato." />;
  switch (d.voce.tipo) {
    case "tv":
      return <MonitorTv d={d} />;
    case "radio":
      return <MonitorRadio d={d} />;
    case "dm":
      return <MonitorDm d={d} />;
    case "squadra":
      return <MonitorSquadra key={slug} d={d} compatto={compatto} />;
    case "lavoro":
      return <MonitorLavoro />;
    case "shop":
      return <MonitorShop d={d} />;
    case "miss-cool":
      return <MonitorMissCool d={d} />;
    case "motorsport":
      return <MonitorMotorsport d={d} />;
  }
}
