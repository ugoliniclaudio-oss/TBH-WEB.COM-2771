import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "wouter";
import { ExternalLink, Loader2, Play, Radio, Sparkles, X } from "lucide-react";
import { useTouchTalent, segnalaDurataTalent, segnalaErroreTalent, type DatiTalent, type MonitorTalent } from "../queries/touch-talent";
import { AnteprimaMonitor, PlayerMonitor, type ComandiMonitor } from "../components/talent-monitor";
import { CaroselloOrizzontale, CellaCarosello, FilaConFrecce } from "../components/carosello-orizzontale";

/**
 * /channel/touch-talent-professionals — TOUCH TALENT & PROFESSIONALS CHANNEL (Claudio, 28/10/2026).
 *  · logo abbinato TBH + Touch Talent (file consegnato, mai ridisegnato) e pulsante «Avvia canale»;
 *  · monitor verticali 9:16: SOLO quello in onda suona (bordo luminoso, «IN ONDA»), gli altri in anteprima;
 *  · palinsesto H24 casuale memorizzato sul server: monitor in onda e punto di partenza calcolati
 *    sull'ora del server, uguali per tutti (dove la fonte permette di partire dal punto giusto);
 *  · «A seguire», carosello «ULTIMI TALENTI E CONTENUTI», filtri Artisti / Staff / Crew / Indipendenti;
 *  · catalogo vuoto → «Channel in allestimento» a tutto schermo. Nessun contenuto inventato.
 */

const ORO = "#d4af37";
const FLUO = "#d7ff00";
const CATEGORIE = [
  ["artisti", "Artisti"],
  ["staff", "Staff"],
  ["crew", "Crew"],
  ["indipendenti", "Indipendenti"],
] as const;
const NOME_CAT: Record<string, string> = Object.fromEntries(CATEGORIE);

const orario = (ms: number) => new Date(ms).toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" });
const mmss = (s: number) => {
  const t = Math.max(0, Math.round(s));
  const h = Math.floor(t / 3600);
  const m = Math.floor((t % 3600) / 60);
  const ss = String(t % 60).padStart(2, "0");
  return h ? `${h}:${String(m).padStart(2, "0")}:${ss}` : `${m}:${ss}`;
};

type Voce = { monitor: MonitorTalent; inizio: number; fine: number | null; stimata: boolean };

/** Ora del server (ms), aggiornata ogni secondo: lo scarto si misura a ogni risposta. */
function useOraServer(dati: DatiTalent | undefined, ricevuto: number) {
  const scarto = dati ? dati.ora - ricevuto : 0;
  const [ora, setOra] = useState(() => Date.now() + scarto);
  useEffect(() => {
    setOra(Date.now() + scarto);
    const t = window.setInterval(() => setOra(Date.now() + scarto), 1000);
    return () => window.clearInterval(t);
  }, [scarto]);
  return { ora, scarto };
}

function Protagonista({ m, classe = "" }: { m: MonitorTalent; classe?: string }) {
  if (!m.protagonista) return null;
  const l = m.linkProtagonista;
  if (l?.startsWith("/"))
    return (
      <Link href={l} className={`underline decoration-white/30 underline-offset-2 hover:text-white ${classe}`} data-testid="link-protagonista">
        {m.protagonista}
      </Link>
    );
  if (l?.startsWith("https://"))
    return (
      <a href={l} target="_blank" rel="noreferrer" className={`inline-flex items-center gap-1 underline decoration-white/30 underline-offset-2 hover:text-white ${classe}`} data-testid="link-protagonista">
        {m.protagonista} <ExternalLink className="h-3 w-3" />
      </a>
    );
  return <span className={classe}>{m.protagonista}</span>;
}

function Categorie({ m }: { m: MonitorTalent }) {
  if (!m.categorie.length && !m.emergente) return null;
  return (
    <div className="flex flex-wrap gap-1.5">
      {m.emergente && (
        <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-extrabold tracking-[0.16em] text-black" style={{ background: FLUO }}>
          <Sparkles className="h-3 w-3" /> EMERGENTE
        </span>
      )}
      {m.categorie.map((c) => (
        <span key={c} className="rounded-full border px-2 py-0.5 text-[9px] font-extrabold tracking-[0.16em]" style={{ borderColor: `${ORO}99`, color: ORO }}>
          {NOME_CAT[c]?.toUpperCase() ?? c}
        </span>
      ))}
    </div>
  );
}

function Logo({ src, classe }: { src: string | null; classe: string }) {
  if (!src) return null;
  return <img src={src} alt="Touch Business Holding · Touch Talent & Professionals Channel" className={`${classe} w-auto max-w-full object-contain`} loading="eager" decoding="async" />;
}

function InAllestimento({ logo }: { logo: string | null }) {
  return (
    <div
      className="relative flex min-h-[calc(100svh-80px)] w-full flex-col items-center justify-center gap-6 overflow-hidden px-6 py-16 text-center"
      style={{ background: `radial-gradient(90% 70% at 50% 30%, ${ORO}22, transparent 60%), radial-gradient(60% 50% at 50% 100%, ${FLUO}14, transparent 70%), #000` }}
      data-testid="talent-allestimento"
    >
      <div className="pointer-events-none absolute inset-0 opacity-[0.05]" style={{ backgroundImage: "repeating-linear-gradient(0deg,#fff 0 1px,transparent 1px 4px)" }} />
      <Logo src={logo} classe="relative max-h-44 md:max-h-64" />
      <p className="tbh-display relative text-3xl text-white md:text-5xl">Channel in allestimento</p>
      <p className="relative max-w-xl text-sm font-semibold md:text-base" style={{ color: FLUO }}>
        I monitor di artisti, staff, crew e indipendenti arriveranno a breve.
      </p>
      <Link href="/channel" className="relative text-xs font-extrabold tracking-[0.18em] text-white/60 underline hover:text-white">
        TORNA AI CHANNEL
      </Link>
    </div>
  );
}

/** Visione su richiesta («Guarda»): la diretta si ferma, un solo audio alla volta. */
function Visione({ m, onChiudi }: { m: MonitorTalent; onChiudi: () => void }) {
  const comandi = useRef<ComandiMonitor>({ avvia: () => undefined });
  const [nota, setNota] = useState<string | null>(null);
  useEffect(() => {
    const esc = (e: KeyboardEvent) => e.key === "Escape" && onChiudi();
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, [onChiudi]);
  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/90 p-4" role="dialog" aria-modal aria-label={m.titolo} data-testid="talent-visione">
      <div className="flex max-h-full w-full max-w-[900px] flex-col items-center gap-4 overflow-y-auto md:flex-row md:items-start">
        <div className="relative aspect-[9/16] w-full max-w-[min(380px,calc((100svh-160px)*9/16))] shrink-0 overflow-hidden rounded-2xl border bg-black" style={{ borderColor: `${ORO}88` }}>
          <PlayerMonitor
            m={m}
            posizione={() => 0}
            comandi={comandi}
            onParte={() => setNota(null)}
            onBloccato={() => setNota("Premi play sul monitor per avviare.")}
            onErrore={(c, msg) => {
              setNota(`Non riproducibile: ${msg}`);
              void segnalaErroreTalent({ id: m.id, codice: c, messaggio: msg });
            }}
            onFine={() => undefined}
            onDurata={() => undefined}
          />
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-3 text-white">
          <p className="text-[10px] font-extrabold tracking-[0.22em] text-white/50">FUORI ONDA · VISIONE SU RICHIESTA</p>
          <h2 className="text-xl font-extrabold leading-tight">{m.titolo}</h2>
          <p className="text-sm text-white/70">
            <Protagonista m={m} />
          </p>
          <Categorie m={m} />
          {nota && <p className="rounded-lg border border-white/15 bg-white/[0.04] px-3 py-2 text-xs text-white/80">{nota}</p>}
          <a href={m.url} target="_blank" rel="noreferrer" className="inline-flex w-fit items-center gap-1 text-[11px] text-white/50 underline hover:text-white">
            URL originale · {m.fonte ?? "fonte"} <ExternalLink className="h-3 w-3" />
          </a>
          <button
            type="button"
            onClick={onChiudi}
            className="mt-2 inline-flex w-fit items-center gap-2 rounded-full px-5 py-2.5 text-xs font-extrabold tracking-[0.14em] text-black"
            style={{ background: FLUO }}
            data-testid="torna-diretta"
          >
            <X className="h-4 w-4" /> TORNA ALLA DIRETTA
          </button>
        </div>
      </div>
    </div>
  );
}

function SchedaTalent({ m, onGuarda }: { m: MonitorTalent; onGuarda: () => void }) {
  return (
    <article className={`flex h-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]`} data-testid="scheda-talent">
      <button type="button" onClick={onGuarda} className="relative aspect-[9/16] w-full overflow-hidden bg-black" aria-label={`Guarda ${m.titolo}`}>
        <AnteprimaMonitor m={m} />
      </button>
      <div className="flex flex-1 flex-col gap-1.5 p-3">
        <h3 className="line-clamp-2 text-sm font-bold leading-snug text-white">{m.titolo}</h3>
        {m.protagonista && (
          <p className="text-[11px] text-white/65">
            <Protagonista m={m} />
          </p>
        )}
        <p className="text-[10px] font-extrabold tracking-[0.14em]" style={{ color: ORO }}>
          {m.categorie.map((c) => NOME_CAT[c]?.toUpperCase()).join(" · ") || " "}
        </p>
        <button
          type="button"
          onClick={onGuarda}
          className="mt-auto inline-flex w-fit items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[11px] font-extrabold tracking-[0.12em] text-black"
          style={{ background: FLUO }}
        >
          <Play className="h-3.5 w-3.5" fill="currentColor" /> GUARDA
        </button>
      </div>
    </article>
  );
}

export default function ChannelTouchTalentPage() {
  const q = useTouchTalent();
  const d = q.data;
  const { ora } = useOraServer(d, q.dataUpdatedAt || Date.now());
  const [filtro, setFiltro] = useState<string>("tutti");
  const [tutti, setTutti] = useState(false);
  const [visione, setVisione] = useState<MonitorTalent | null>(null);
  const [bloccato, setBloccato] = useState(false);
  const [inRiproduzione, setInRiproduzione] = useState(false);
  const [guasto, setGuasto] = useState<number | null>(null);
  const [finito, setFinito] = useState<number | null>(null);
  const comandi = useRef<ComandiMonitor>({ avvia: () => undefined });
  const durateInviate = useRef(new Set<number>());

  const linea: Voce[] = useMemo(() => {
    if (!d?.inOnda) return [];
    const v: Voce[] = [{ monitor: d.inOnda.monitor, inizio: d.inOnda.inizio, fine: d.inOnda.fine, stimata: d.inOnda.durataStimata }];
    d.seguenti.forEach((s) => v.push({ monitor: s.monitor, inizio: s.inizio, fine: s.fine, stimata: s.stimata }));
    return v;
  }, [d]);
  const corrente = linea.find((v) => v.inizio <= ora && (v.fine === null || ora < v.fine)) ?? null;
  const chiave = corrente ? `${corrente.monitor.id}:${corrente.inizio}` : "";
  const oraRef = useRef(ora);
  oraRef.current = ora;
  const inizioRef = useRef(0);
  inizioRef.current = corrente?.inizio ?? 0;

  // cambio di monitor (o fine della parte nota del palinsesto): si rilegge il palinsesto dal server
  const ultimaChiave = useRef("");
  const ultimaRilettura = useRef(0);
  const { refetch, isFetching } = q;
  const rileggi = useCallback(() => {
    // al massimo una rilettura ogni 5 s: niente giri a vuoto se l'orologio del server è un soffio indietro
    if (Date.now() - ultimaRilettura.current < 5000) return;
    ultimaRilettura.current = Date.now();
    void refetch();
  }, [refetch]);
  const senzaCorrente = !corrente && !!d?.inOnda;
  useEffect(() => {
    if (!d) return;
    if (chiave !== ultimaChiave.current) {
      if (ultimaChiave.current) rileggi();
      ultimaChiave.current = chiave;
      setBloccato(false);
      setGuasto(null);
      setFinito(null);
      setInRiproduzione(false);
    }
  }, [chiave, d, rileggi]);
  useEffect(() => {
    if (senzaCorrente && !isFetching) rileggi();
  }, [senzaCorrente, isFetching, ora, rileggi]);

  const posizione = useCallback(() => Math.max(0, (oraRef.current - inizioRef.current) / 1000), []);
  const errore = useCallback(
    (codice: string, messaggio: string) => {
      const m = corrente?.monitor;
      if (!m) return;
      setGuasto(m.id);
      void segnalaErroreTalent({ id: m.id, codice, messaggio }).then((r) => {
        if (r?.tolto) void refetch();
      });
    },
    [corrente, refetch],
  );
  const durata = useCallback(
    (sec: number) => {
      const m = corrente?.monitor;
      if (!m || m.durataSec || durateInviate.current.has(m.id)) return;
      durateInviate.current.add(m.id);
      void segnalaDurataTalent({ id: m.id, durataSec: Math.round(sec) });
    },
    [corrente],
  );

  if (q.isLoading)
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-black text-white/60">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  if (q.isError || !d)
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 bg-black px-4 text-center text-white">
        <p className="tbh-display tbh-h3">Il Channel non risponde</p>
        <button type="button" onClick={() => void q.refetch()} className="text-sm underline" style={{ color: FLUO }}>
          Riprova
        </button>
      </div>
    );
  if (!d.monitor.length) return <InAllestimento logo={d.logo} />;

  const m = corrente?.monitor ?? null;
  const filtra = (x: MonitorTalent) => filtro === "tutti" || x.categorie.includes(filtro as (typeof CATEGORIE)[number][0]);
  const prossimoDi = new Map(linea.slice(1).map((v) => [v.monitor.id, v.inizio]));
  const parete = d.monitor.filter((x) => x.id !== m?.id && filtra(x));
  const carosello = d.ultimi.filter(filtra);
  const restante = corrente?.fine ? (corrente.fine - ora) / 1000 : null;
  const trascorso = corrente ? (ora - corrente.inizio) / 1000 : 0;
  const totaleSlot = corrente?.fine ? (corrente.fine - corrente.inizio) / 1000 : null;
  const prossimo = linea[linea.indexOf(corrente!) + 1] ?? null;
  const conteggio = (c: string) => d.monitor.filter((x) => x.categorie.includes(c as (typeof CATEGORIE)[number][0])).length;
  const senzaComandi = m && ["dailymotion", "tiktok", "facebook", "instagram"].includes(m.piattaforma);

  const avvia = () => {
    setBloccato(false);
    comandi.current.avvia();
  };

  return (
    <div className="bg-black pb-20 text-white" data-testid="channel-touch-talent">
      {/* testata: logo abbinato + Avvia canale */}
      <header className="relative overflow-hidden border-b border-white/10" style={{ background: `radial-gradient(70% 120% at 20% 0%, ${ORO}1f, transparent 60%), radial-gradient(50% 100% at 90% 100%, ${FLUO}12, transparent 70%), #000` }}>
        <div className="mx-auto flex max-w-[1400px] flex-col gap-5 px-4 py-6 md:flex-row md:items-center md:justify-between md:px-8 md:py-8">
          <div className="flex flex-col gap-3">
            <nav className="flex flex-wrap items-center gap-2 text-[11px] font-extrabold tracking-[0.16em] text-white/50">
              <Link href="/channel" className="hover:text-white">
                CHANNEL
              </Link>
              <span>/</span>
              <span style={{ color: ORO }}>TOUCH TALENT &amp; PROFESSIONALS</span>
            </nav>
            <Logo src={d.logo} classe="max-h-24 sm:max-h-28 md:max-h-36" />
          </div>
          <div className="flex flex-col items-start gap-2 md:items-end">
            <button
              type="button"
              onClick={avvia}
              className="inline-flex items-center gap-3 rounded-full px-6 py-3 text-sm font-extrabold tracking-[0.18em] text-black shadow-[0_0_30px_rgba(215,255,0,.35)] transition hover:scale-[1.02]"
              style={{ background: `linear-gradient(90deg, ${FLUO}, #f3ff8a)` }}
              data-testid="avvia-canale-testata"
            >
              <Play className="h-5 w-5" fill="currentColor" /> {inRiproduzione ? "CANALE AVVIATO" : "AVVIA CANALE"}
            </button>
            <p className="max-w-xs text-[11px] text-white/50 md:text-right">
              Palinsesto H24 uguale per tutti: il monitor in onda e il punto di partenza seguono l'ora del server. Giro {d.giro} · {d.monitor.length} monitor.
            </p>
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-[1400px] flex-col gap-10 px-4 pt-8 md:px-8">
        {/* filtri */}
        <div className="flex flex-wrap gap-2" data-testid="filtri-talent">
          {[["tutti", "Tutti", d.monitor.length] as const, ...CATEGORIE.map(([k, n]) => [k, n, conteggio(k)] as const)].map(([k, n, c]) => (
            <button
              key={k}
              type="button"
              onClick={() => setFiltro(k)}
              className="rounded-full border px-4 py-1.5 text-[11px] font-extrabold tracking-[0.14em] transition"
              style={filtro === k ? { background: ORO, borderColor: ORO, color: "#000" } : { borderColor: "rgba(255,255,255,.18)", color: "rgba(255,255,255,.8)" }}
              aria-pressed={filtro === k}
            >
              {n.toUpperCase()} · {c}
            </button>
          ))}
        </div>

        {/* monitor in onda + parete dei monitor */}
        <section className="grid gap-6 lg:grid-cols-[minmax(300px,400px)_1fr] lg:items-start" data-testid="monitor-talent">
          <div className="mx-auto w-full max-w-[400px] lg:mx-0">
            <div
              className="relative aspect-[9/16] w-full overflow-hidden rounded-[22px] border-2 bg-black"
              style={{ borderColor: FLUO, boxShadow: `0 0 0 1px ${ORO}, 0 0 28px ${FLUO}66, 0 0 70px ${ORO}40` }}
              data-testid="monitor-in-onda"
              data-monitor={m?.id ?? ""}
            >
              {m && !visione ? (
                <PlayerMonitor
                  key={chiave}
                  m={m}
                  posizione={posizione}
                  comandi={comandi}
                  onParte={() => {
                    setBloccato(false);
                    setInRiproduzione(true);
                  }}
                  onBloccato={() => setBloccato(true)}
                  onErrore={errore}
                  onFine={() => setFinito(m.id)}
                  onDurata={durata}
                />
              ) : m ? (
                <AnteprimaMonitor m={m} />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Loader2 className="h-6 w-6 animate-spin text-white/50" />
                </div>
              )}
              <span className="pointer-events-none absolute left-3 top-3 z-20 inline-flex items-center gap-1.5 rounded-full bg-black/70 px-2.5 py-1 text-[10px] font-extrabold tracking-[0.2em]" style={{ color: FLUO }}>
                <span className="h-2 w-2 animate-pulse rounded-full" style={{ background: FLUO, boxShadow: `0 0 8px ${FLUO}` }} /> IN ONDA
              </span>
              {visione && m && (
                <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/70 p-4 text-center text-xs font-bold text-white/80">Diretta in pausa durante la visione su richiesta.</div>
              )}
              {bloccato && !visione && (
                <button type="button" onClick={avvia} className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-black/75 text-white" data-testid="avvia-canale">
                  <span className="flex h-16 w-16 items-center justify-center rounded-full text-black" style={{ background: FLUO }}>
                    <Play className="h-7 w-7" fill="currentColor" />
                  </span>
                  <span className="text-sm font-extrabold tracking-[0.2em]">AVVIA CANALE</span>
                  <span className="max-w-[80%] text-[11px] font-normal text-white/60">Il browser ha bloccato l'avvio automatico con audio.</span>
                </button>
              )}
              {guasto === m?.id && !visione && (
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 bg-black/85 p-5 text-center" data-testid="monitor-guasto">
                  <p className="text-sm font-bold">Questo monitor non si riproduce su questo dispositivo.</p>
                  <p className="text-xs text-white/60">Segnalato alla redazione. {prossimo ? `Il prossimo parte alle ${orario(prossimo.inizio)}.` : ""}</p>
                </div>
              )}
              {finito === m?.id && !visione && restante !== null && restante > 3 && (
                <div className="absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-black via-black/80 to-transparent p-4 pt-10 text-center text-xs font-bold">
                  A seguire tra {mmss(restante)}
                  {prossimo ? ` · ${prossimo.monitor.titolo}` : ""}
                </div>
              )}
            </div>
          </div>

          <div className="flex min-w-0 flex-col gap-6">
            {m && corrente && (
              <div className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-5" data-testid="talent-info">
                <p className="inline-flex items-center gap-2 text-[10px] font-extrabold tracking-[0.24em]" style={{ color: FLUO }}>
                  <Radio className="h-3.5 w-3.5" /> ORA IN ONDA
                </p>
                <h1 className="text-2xl font-extrabold leading-tight md:text-3xl" data-testid="talent-titolo">
                  {m.titolo}
                </h1>
                {m.protagonista && (
                  <p className="text-base text-white/80">
                    <Protagonista m={m} />
                  </p>
                )}
                <Categorie m={m} />
                {totaleSlot !== null && (
                  <div className="flex flex-col gap-1">
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                      <div className="h-full rounded-full" style={{ width: `${Math.min(100, (trascorso / totaleSlot) * 100)}%`, background: `linear-gradient(90deg, ${ORO}, ${FLUO})` }} />
                    </div>
                    <p className="flex justify-between text-[11px] text-white/50">
                      <span>{mmss(trascorso)}</span>
                      <span>
                        fino alle {orario(corrente.fine!)}
                        {corrente.stimata ? " · durata stimata" : ""}
                      </span>
                    </p>
                  </div>
                )}
                <p className="text-[11px] text-white/45">
                  Fonte: {m.fonte ?? "—"} ·{" "}
                  <a href={m.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 underline hover:text-white">
                    URL originale <ExternalLink className="h-3 w-3" />
                  </a>
                </p>
                {!m.capacita.seek && (
                  <p className="text-[11px] text-white/45">
                    Questa piattaforma non permette di partire dal punto della diretta: chi entra ora vede il video dall'inizio.{senzaComandi ? " Se non parte, premi play sul monitor." : ""}
                  </p>
                )}
              </div>
            )}

            <div className="flex flex-col gap-3">
              <h2 className="text-[11px] font-extrabold tracking-[0.24em] text-white/60">MONITOR DEL CHANNEL · ANTEPRIME</h2>
              {parete.length ? (
                <FilaConFrecce etichetta="Monitor del channel" classePista="tbh-scroll-x gap-3 pb-2" testid="parete-monitor">
                  {parete.map((x) => (
                    <button
                      key={x.id}
                      type="button"
                      onClick={() => setVisione(x)}
                      className="group flex w-[118px] shrink-0 snap-start flex-col gap-1.5 text-left sm:w-[136px]"
                      aria-label={`Guarda ${x.titolo}`}
                    >
                      <span className="relative block aspect-[9/16] w-full overflow-hidden rounded-xl border border-white/15 bg-black transition group-hover:border-[#d4af37]">
                        <AnteprimaMonitor m={x} />
                        {prossimoDi.has(x.id) && (
                          <span className="absolute inset-x-1 bottom-1 rounded bg-black/75 px-1 py-0.5 text-center text-[9px] font-extrabold tracking-[0.12em]" style={{ color: ORO }}>
                            ALLE {orario(prossimoDi.get(x.id)!)}
                          </span>
                        )}
                      </span>
                      <span className="line-clamp-2 text-[11px] font-bold leading-tight text-white/85">{x.titolo}</span>
                      {x.protagonista && <span className="truncate text-[10px] text-white/50">{x.protagonista}</span>}
                    </button>
                  ))}
                </FilaConFrecce>
              ) : (
                <p className="text-xs text-white/45">{filtro === "tutti" ? "Per ora c'è solo il monitor in onda." : "Nessun altro monitor in questa categoria."}</p>
              )}
            </div>
          </div>
        </section>

        {/* a seguire */}
        {linea.length > 1 && (
          <section className="flex flex-col gap-3" data-testid="a-seguire">
            <h2 className="tbh-display tbh-h3" style={{ color: ORO }}>
              A seguire
            </h2>
            <ol className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {linea
                .filter((v) => v !== corrente && v.inizio > ora)
                .slice(0, 6)
                .map((v) => (
                  <li key={`${v.monitor.id}:${v.inizio}`} className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-2.5">
                    <span className="relative block aspect-[9/16] w-11 shrink-0 overflow-hidden rounded-md bg-black">
                      <AnteprimaMonitor m={v.monitor} />
                    </span>
                    <span className="flex min-w-0 flex-col">
                      <span className="text-[11px] font-extrabold tracking-[0.12em]" style={{ color: FLUO }}>
                        {orario(v.inizio)}
                      </span>
                      <span className="truncate text-sm font-bold">{v.monitor.titolo}</span>
                      {v.monitor.protagonista && <span className="truncate text-[11px] text-white/55">{v.monitor.protagonista}</span>}
                    </span>
                  </li>
                ))}
            </ol>
            {d.inOnda && d.inOnda.restantiNelGiro < 6 && <p className="text-[11px] text-white/45">Poi riparte un nuovo giro casuale di tutti i monitor attivi.</p>}
          </section>
        )}

        {/* carosello ultimi talenti */}
        <section className="flex flex-col gap-4" data-testid="ultimi-talenti">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <h2 className="tbh-display tbh-h3">
              ULTIMI TALENTI <span style={{ color: ORO }}>E CONTENUTI</span>
            </h2>
            <button type="button" onClick={() => setTutti((t) => !t)} className="text-xs font-extrabold tracking-[0.16em] underline underline-offset-4" style={{ color: FLUO }} data-testid="vedi-tutti">
              {tutti ? "CHIUDI L'ELENCO" : `VEDI TUTTI (${d.monitor.filter(filtra).length})`}
            </button>
          </div>
          {carosello.length ? (
            <CaroselloOrizzontale etichetta="Ultimi talenti e contenuti">
              {carosello.map((x) => (
                <CellaCarosello key={x.id} className="!w-[190px] md:!w-[210px]">
                  <SchedaTalent m={x} onGuarda={() => setVisione(x)} />
                </CellaCarosello>
              ))}
            </CaroselloOrizzontale>
          ) : (
            <p className="text-xs text-white/45">Nessun contenuto in questa categoria.</p>
          )}
          {tutti && (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6" data-testid="tutti-talenti">
              {d.monitor.filter(filtra).map((x) => (
                <SchedaTalent key={x.id} m={x} onGuarda={() => setVisione(x)} />
              ))}
            </div>
          )}
        </section>
      </div>

      {visione && <Visione m={visione} onChiudi={() => setVisione(null)} />}
    </div>
  );
}

/** Riquadro per le pagine che portano al Channel (Touch Hugoland). */
export function RiquadroTouchTalent() {
  const q = useTouchTalent();
  const n = q.data?.monitor.length ?? 0;
  return (
    <Link
      href="/channel/touch-talent-professionals"
      className="group flex flex-col items-center gap-4 rounded-2xl border border-white/10 bg-black p-5 transition hover:border-[#d4af37] md:flex-row md:gap-6"
      data-testid="riquadro-touch-talent"
    >
      <img src="/channel/loghi/tbh/touch-talent-professionals.jpe" alt="Touch Talent & Professionals Channel" className="max-h-24 w-auto max-w-full object-contain md:max-h-28" loading="lazy" decoding="async" />
      <span className="flex flex-col items-center gap-1 text-center md:items-start md:text-left">
        <span className="text-sm font-extrabold text-white">TOUCH TALENT &amp; PROFESSIONALS CHANNEL</span>
        <span className="text-[11px] tracking-[0.12em] text-white/55">ARTISTI · STAFF · CREW · INDIPENDENTI</span>
        <span className="mt-1 text-[11px] font-extrabold tracking-[0.16em]" style={{ color: n ? FLUO : ORO }}>
          {q.isLoading ? "…" : n ? `IN ONDA · ${n} MONITOR` : "IN ALLESTIMENTO"}
        </span>
      </span>
    </Link>
  );
}
