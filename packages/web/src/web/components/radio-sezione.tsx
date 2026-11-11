import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "wouter";
import {
  CalendarDays,
  Disc3,
  ExternalLink,
  LayoutGrid,
  Megaphone,
  Music4,
  Play,
  Radio,
  Smartphone,
  Tv,
} from "lucide-react";
import type { ElementoRadio } from "../../api/lib/radio-palinsesto";
import { RadioPlayer } from "./radio-player";
import { usePalinsestoRadio, useSettimanaRadio } from "../queries/radio";
import { EVENTO_ACCENDI_RADIO, oraRoma, useRadioAdesso } from "../hooks/use-radio-adesso";
import { COLORE_TBH } from "../lib/identita-tbh";
import { LOGHI_TBH } from "../lib/loghi-tbh";

/**
 * TOUCH MUSIC RADIO TV — pagina del format (istruzione PRIORITARIA del 14/10/2026).
 *
 * Gerarchia obbligatoria, nell'ordine:
 *   TOUCH MUSIC RADIO TV
 *   ▶ ASCOLTA LA RADIO | ▦ PALINSESTO 24/7 (giallo fluo, sempre visibile) | ▶ GUARDA LA TV
 *   ORA IN ONDA → A SEGUIRE → PALINSESTO DI OGGI → PROGRAMMI DELLA SETTIMANA
 * Nero/giallo TBH, solo loghi originali. Rosso solo per DM. Tutto dall'API `radio`:
 * la stessa che userà l'app.
 */

const GIALLO = COLORE_TBH;
const ROSSO_DM = "#ff2b2b";

const FASCE = [
  { id: "notte", nome: "Notte", da: 0, a: 6 },
  { id: "mattina", nome: "Mattina", da: 6, a: 12 },
  { id: "pomeriggio", nome: "Pomeriggio", da: 12, a: 18 },
  { id: "sera", nome: "Sera", da: 18, a: 24 },
] as const;

type Riquadro = { href: string; titolo: string; sotto: string; icona: typeof Radio; stato?: string };

function logo(slug: string) {
  return LOGHI_TBH.find((l) => l.slug === slug) ?? null;
}

function Etichetta({ testo }: { testo: string }) {
  return (
    <span className="inline-flex w-fit rounded-full border border-[var(--tbh-gold)]/60 px-2.5 py-0.5 text-[10px] font-bold tracking-[0.16em] text-[var(--tbh-gold)]">
      {testo}
    </span>
  );
}

function TitoloSezione({ id, children, icona: Icona }: { id?: string; children: string; icona: typeof Radio }) {
  return (
    <h2 id={id} className="tbh-display tbh-h2 flex items-center gap-3 leading-none" style={{ color: GIALLO }}>
      <Icona className="h-6 w-6 shrink-0" /> {children}
    </h2>
  );
}

function tipoBreve(e: ElementoRadio) {
  return e.tipo === "brano" ? "Brano" : e.tipo === "spot" ? (e.sigla ? "Sigla" : "Spot") : "DM ON AIR";
}

function dataBreve(d: string) {
  return `${d.slice(8)}/${d.slice(5, 7)}`;
}

/** Altezza della testata del sito: la barra dei comandi si ferma subito sotto. */
function useAltezzaTestata() {
  const [h, setH] = useState(0);
  useEffect(() => {
    const misura = () => setH(document.querySelector("header")?.getBoundingClientRect().height ?? 0);
    misura();
    window.addEventListener("resize", misura);
    return () => window.removeEventListener("resize", misura);
  }, []);
  return h;
}

export function RadioSezione({ linkBrani = "#brani" }: { linkBrani?: string }) {
  const settimana = useSettimanaRadio();
  const s = settimana.data;
  const testata = useAltezzaTestata();
  const [giorno, setGiorno] = useState<string | null>(null);
  const [tv, setTv] = useState(false);

  const vai = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });

  const ascolta = () => {
    window.dispatchEvent(new Event(EVENTO_ACCENDI_RADIO));
    vai("radio-in-onda");
  };
  const guardaTv = () => {
    setTv(true);
    vai("radio-tv");
  };

  const radioLogo = logo("touch-music-radio");
  const tvLogo = logo("touch-music-tv");

  const riquadri: Riquadro[] = [
    { href: "#radio-in-onda", titolo: "Musica originale J.C. Hugò", sotto: "Ora in onda", icona: Music4 },
    { href: "#radio-palinsesto", titolo: "Palinsesto 24/7", sotto: "Oggi e settimana", icona: CalendarDays },
    { href: linkBrani, titolo: "Brani", sotto: "Catalogo e playlist", icona: Disc3 },
    { href: "#radio-pubblicita", titolo: "Pubblicità", sotto: "Spot ogni 12–15 min", icona: Megaphone },
    { href: "#radio-dm", titolo: "DM ON AIR", sotto: "Info e dirette", icona: Tv },
    { href: "#radio-dj-set", titolo: "DJ Set", sotto: "Mix e speciali", icona: Radio, stato: "IN ALLESTIMENTO" },
    { href: "#radio-app", titolo: "App", sotto: "Prossimo lancio", icona: Smartphone, stato: "PROSSIMO LANCIO" },
  ];

  return (
    <section className="relative z-10 flex flex-col gap-8" aria-labelledby="radio-titolo" data-testid="touch-music-radio-tv">
      {/* ── TESTATA DEL FORMAT ─────────────────────────────────────────────── */}
      <header className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-4">
          {radioLogo && (
            <img src={radioLogo.file} alt={radioLogo.nome} width={269} height={238} className="h-16 w-auto object-contain md:h-20" />
          )}
          {tvLogo && (
            <img src={tvLogo.file} alt={tvLogo.nome} width={276} height={238} className="h-16 w-auto object-contain md:h-20" />
          )}
        </div>
        <h1 id="radio-titolo" className="tbh-display tbh-h1 leading-[0.95] break-words" style={{ color: GIALLO }}>
          TOUCH MUSIC
        </h1>
        <p className="text-sm uppercase tracking-[0.12em] text-[var(--tbh-muted)]">
          Rubrica di musica e DJ J.C. Hugò in onda su TOUCH RADIO e TOUCH TV, canali del gruppo TBH ·{" "}
          <Link href="/radio" className="text-[var(--tbh-platinum)] underline">ASCOLTA RADIO</Link> ·{" "}
          <Link href="/tv" className="text-[var(--tbh-platinum)] underline">GUARDA TV</Link>
        </p>
        <p className="tbh-h3 text-[var(--tbh-platinum)] tracking-[0.08em]">
          J.C. HUGÒ RADIO <span className="text-[var(--tbh-muted)]">·</span> MUSIC • RADIO • DJ SET • STREAMING
        </p>
      </header>

      {/* ── I TRE COMANDI: sempre visibili, il palinsesto al centro in giallo ── */}
      <nav
        aria-label="Comandi principali della radio"
        className="sticky z-30 -mx-4 border-y border-[var(--tbh-line)] bg-black/90 px-4 py-3 backdrop-blur md:-mx-0 md:rounded-2xl md:border"
        style={{ top: testata }}
        data-testid="radio-comandi"
      >
        <div className="grid grid-cols-3 gap-2 md:gap-3">
          <button
            type="button"
            onClick={ascolta}
            className="flex min-h-12 items-center justify-center gap-2 rounded-xl border-2 px-2 text-center text-[11px] font-extrabold uppercase tracking-[0.08em] text-[var(--tbh-platinum)] transition hover:bg-white/5 sm:text-sm"
            style={{ borderColor: GIALLO }}
          >
            <Play className="h-4 w-4 shrink-0 fill-current" style={{ color: GIALLO }} /> Ascolta la radio
          </button>
          <a
            href="#radio-palinsesto"
            className="flex min-h-12 items-center justify-center gap-2 rounded-xl px-2 text-center text-[11px] font-extrabold uppercase tracking-[0.08em] text-black shadow-[0_0_30px_-8px_#d7ff00] transition hover:brightness-110 sm:text-base"
            style={{ background: GIALLO }}
            data-testid="radio-btn-palinsesto"
          >
            <LayoutGrid className="h-4 w-4 shrink-0 sm:h-5 sm:w-5" /> Palinsesto 24/7
          </a>
          <button
            type="button"
            onClick={guardaTv}
            className="flex min-h-12 items-center justify-center gap-2 rounded-xl border-2 px-2 text-center text-[11px] font-extrabold uppercase tracking-[0.08em] text-[var(--tbh-platinum)] transition hover:bg-white/5 sm:text-sm"
            style={{ borderColor: GIALLO }}
          >
            <Play className="h-4 w-4 shrink-0 fill-current" style={{ color: GIALLO }} /> Guarda la TV
          </button>
        </div>
      </nav>

      {/* ── 1 · ORA IN ONDA ───────────────────────────────────────────────── */}
      <div id="radio-in-onda" className="flex flex-col gap-3 scroll-mt-40">
        <TitoloSezione icona={Radio}>ORA IN ONDA</TitoloSezione>
        <RadioPlayer colore={GIALLO} />
        {s && (
          <p className="text-xs text-[var(--tbh-muted)]">
            {s.braniInRotazione} brani originali J.C. Hugò in rotazione automatica 24/7 dai profili Suno e dal
            canale YouTube Touch Music Radio TV. Stessa scaletta per tutti gli ascoltatori, ora di Roma.
          </p>
        )}
      </div>

      {/* ── 2 · A SEGUIRE ─────────────────────────────────────────────────── */}
      <ASeguire />

      {/* ── 3 · PALINSESTO DI OGGI (per fasce orarie) ─────────────────────── */}
      <PalinsestoGiorno giorno={giorno} setGiorno={setGiorno} />

      {/* ── 4 · PROGRAMMI DELLA SETTIMANA ─────────────────────────────────── */}
      <div id="radio-settimana" className="flex flex-col gap-3 scroll-mt-40">
        <TitoloSezione icona={CalendarDays}>PROGRAMMI DELLA SETTIMANA</TitoloSezione>
        <p className="text-sm text-[var(--tbh-muted)]">
          Fasce orarie dei prossimi 7 giorni. Gli appuntamenti DM hanno la precedenza sulla musica; nelle fasce
          musicali brani in ordine diverso ogni giorno e pausa pubblicitaria ogni 12–15 minuti. Tocca un giorno per
          aprirne la scaletta completa.
        </p>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
          {s?.giorni.map((g, i) => (
            <button
              key={g.data}
              type="button"
              onClick={() => {
                setGiorno(g.data);
                vai("radio-palinsesto");
              }}
              className="tbh-card flex flex-col gap-2 p-3 text-left transition hover:border-[#d7ff00]/70"
            >
              <p className="text-sm font-bold capitalize text-[var(--tbh-platinum)]">
                {i === 0 ? "Oggi" : g.giorno}{" "}
                <span className="tbh-dato font-normal text-[var(--tbh-muted)]">{dataBreve(g.data)}</span>
              </p>
              <ul className="flex flex-col gap-1.5 text-xs">
                {g.blocchi.map((b) => (
                  <li key={b.da} className="flex flex-col">
                    <span className="tbh-dato text-[var(--tbh-muted)]">
                      {b.da}–{b.a}
                    </span>
                    <span
                      className={b.tipo === "dm" ? "font-semibold" : "text-[var(--tbh-platinum)]"}
                      style={{ color: b.tipo === "dm" ? ROSSO_DM : undefined }}
                    >
                      {b.titolo}
                    </span>
                  </li>
                ))}
              </ul>
            </button>
          ))}
        </div>
      </div>

      {/* ── TUTTA LA RADIO ────────────────────────────────────────────────── */}
      <nav aria-label="Sezioni della radio" className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
        {riquadri.map((r) => {
          const Icona = r.icona;
          return (
            <a
              key={r.href}
              href={r.href}
              className="tbh-card flex flex-col gap-2 p-4 transition-colors hover:border-[#d7ff00]/60"
            >
              <Icona className="h-6 w-6" style={{ color: GIALLO }} />
              <span className="text-sm font-bold leading-tight text-[var(--tbh-platinum)]">{r.titolo}</span>
              <span className="text-xs text-[var(--tbh-muted)]">{r.sotto}</span>
              {r.stato && <Etichetta testo={r.stato} />}
            </a>
          );
        })}
      </nav>

      {/* ── GUARDA LA TV ──────────────────────────────────────────────────── */}
      <div id="radio-tv" className="tbh-card flex flex-col gap-4 p-5 scroll-mt-40" style={{ borderColor: `${GIALLO}55` }}>
        <div className="flex flex-wrap items-center gap-4">
          {tvLogo && <img src={tvLogo.file} alt={tvLogo.nome} width={276} height={238} className="h-12 w-auto object-contain" />}
          <h2 className="tbh-display tbh-h3" style={{ color: GIALLO }}>
            {s?.tv.nome ?? "TOUCH TV"}
          </h2>
          <Etichetta testo={`DIRETTA TV ${s?.tv.diretta ?? "IN ALLESTIMENTO"}`} />
        </div>
        <p className="text-sm text-[var(--tbh-muted)]">{s?.tv.testo}</p>
        <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-black">
          {tv && s ? (
            <iframe
              src={s.tv.embed}
              title="Touch Music Radio TV — video ufficiali"
              allow="autoplay; encrypted-media; picture-in-picture"
              allowFullScreen
              className="absolute inset-0 h-full w-full"
            />
          ) : (
            <button
              type="button"
              onClick={() => setTv(true)}
              className="absolute inset-0 grid place-items-center hover:bg-white/5"
              aria-label="Guarda i video di Touch Music Radio TV"
            >
              <span className="flex items-center gap-3 rounded-full px-6 py-3 font-bold text-black" style={{ background: GIALLO }}>
                <Play className="h-5 w-5 fill-current" /> GUARDA LA TV
              </span>
            </button>
          )}
        </div>
        {s && (
          <a
            href={s.tv.canale}
            target="_blank"
            rel="noreferrer"
            className="inline-flex w-fit items-center gap-1.5 rounded-full border border-white/20 px-4 py-2 text-sm text-[var(--tbh-platinum)] hover:border-white/50"
          >
            Canale YouTube Touch Music Radio TV <ExternalLink className="h-3.5 w-3.5" />
          </a>
        )}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* PUBBLICITÀ */}
        <div id="radio-pubblicita" className="tbh-card flex flex-col gap-3 p-5 scroll-mt-40">
          <h2 className="tbh-display tbh-h3 flex items-center gap-2" style={{ color: GIALLO }}>
            <Megaphone className="h-5 w-5" /> Pubblicità
          </h2>
          <p className="text-sm text-[var(--tbh-muted)]">{s?.spot.nota}</p>
          <ul className="grid gap-1.5 text-sm sm:grid-cols-2">
            {s?.spot.gruppo.map((g) => (
              <li key={g.id}>
                <a
                  href={g.youtube}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 text-[var(--tbh-platinum)] hover:underline"
                >
                  <span className="truncate">{g.titolo}</span>
                  <span className="tbh-dato shrink-0 text-xs text-[var(--tbh-muted)]">
                    {Math.floor(g.durataSec / 60)}:{String(g.durataSec % 60).padStart(2, "0")}
                  </span>
                </a>
              </li>
            ))}
          </ul>
          <div className="flex flex-col gap-1 border-t border-white/10 pt-3">
            <span className="text-sm font-semibold text-[var(--tbh-platinum)]">Spot degli inserzionisti</span>
            <Etichetta testo="IN ALLESTIMENTO" />
          </div>
        </div>

        {/* DM LIVE — unico punto in rosso, riservato a DM */}
        <div id="radio-dm" className="tbh-card flex flex-col gap-3 p-5 scroll-mt-40" style={{ borderColor: `${ROSSO_DM}55` }}>
          <h2 className="tbh-display tbh-h3 flex items-center gap-2" style={{ color: ROSSO_DM }}>
            <Tv className="h-5 w-5" /> DM ON AIR
          </h2>
          <p className="text-sm text-[var(--tbh-muted)]">
            Negli orari dei programmi DM la radio passa alla diretta dal canale YouTube ufficiale di{" "}
            {s?.dm.canale ?? "DM"}. Finita la puntata riprende la musica.
          </p>
          <ul className="flex flex-col divide-y divide-white/5 text-sm">
            {s?.dm.programmi.map((p) => (
              <li key={p.slug} className="flex flex-wrap gap-x-3 py-1.5">
                <span className="w-24 shrink-0 capitalize text-[var(--tbh-muted)]">{p.giorno ?? "da confermare"}</span>
                <span className="tbh-dato w-12 shrink-0 text-[var(--tbh-platinum)]">{p.ora ?? "—"}</span>
                <span className="font-semibold text-[var(--tbh-platinum)]">{p.nome}</span>
                <span className="text-[var(--tbh-muted)]">{p.durataMin} min</span>
              </li>
            ))}
          </ul>
          <p className="text-xs text-[var(--tbh-gold)]">{s?.dm.repliche}</p>
          {s && (
            <a
              href={s.dm.youtube}
              target="_blank"
              rel="noreferrer"
              className="inline-flex w-fit items-center gap-1.5 rounded-full border border-white/20 px-4 py-2 text-sm text-[var(--tbh-platinum)] hover:border-white/50"
            >
              Canale YouTube DM <ExternalLink className="h-3.5 w-3.5" />
            </a>
          )}
        </div>

        {/* DJ SET */}
        <div id="radio-dj-set" className="tbh-card flex flex-col gap-3 p-5 scroll-mt-40">
          <h2 className="tbh-display tbh-h3 flex items-center gap-2" style={{ color: GIALLO }}>
            <Radio className="h-5 w-5" /> DJ Set
          </h2>
          <Etichetta testo="IN ALLESTIMENTO" />
          <p className="text-sm text-[var(--tbh-muted)]">Mix e speciali di J.C. Hugò: contenuto disponibile prossimamente.</p>
        </div>

        {/* APP */}
        <div id="radio-app" className="tbh-card flex flex-col gap-3 p-5 scroll-mt-40">
          <h2 className="tbh-display tbh-h3 flex items-center gap-2" style={{ color: GIALLO }}>
            <Smartphone className="h-5 w-5" /> App
          </h2>
          <Etichetta testo={s?.app.stato ?? "PROSSIMO LANCIO"} />
          <p className="text-sm text-[var(--tbh-muted)]">{s?.app.testo}</p>
          <p className="text-xs text-[var(--tbh-muted)]">
            Nell'app il pulsante «PALINSESTO 24/7» aprirà la stessa scaletta di questa pagina.
          </p>
        </div>
      </div>
    </section>
  );
}

/** A SEGUIRE — prossimi brani, spot e appuntamenti DM. */
function ASeguire() {
  const { elementi, indice, adesso } = useRadioAdesso(5000);
  const settimana = useSettimanaRadio();
  const prossimi = indice >= 0 ? elementi.slice(indice + 1, indice + 9) : [];
  /* L'elenco degli appuntamenti cambia al massimo una volta al minuto. */
  const minuto = Math.floor(adesso / 60_000);

  const appuntamenti = useMemo(() => {
    const giorni = settimana.data?.giorni ?? [];
    const oggi = giorni[0]?.data;
    const adessoHHMM = oraRoma(minuto * 60_000);
    return giorni
      .flatMap((g) =>
        g.blocchi
          .filter((b) => b.tipo === "dm" && (g.data !== oggi || b.da > adessoHHMM))
          .map((b) => ({ ...b, data: g.data, giorno: g.data === oggi ? "oggi" : g.giorno })),
      )
      .slice(0, 3);
  }, [settimana.data, minuto]);

  return (
    <div id="radio-a-seguire" className="flex flex-col gap-3 scroll-mt-40" data-testid="radio-a-seguire">
      <TitoloSezione icona={Play}>A SEGUIRE</TitoloSezione>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <ol className="tbh-card flex min-w-0 flex-col divide-y divide-white/5 p-2 text-sm">
          {prossimi.length === 0 && <li className="p-3 text-[var(--tbh-muted)]">Caricamento…</li>}
          {prossimi.map((e) => {
            const dm = e.tipo === "dm";
            return (
              <li key={`${e.tipo}-${e.inizio}`} className="flex items-center gap-3 px-2 py-2">
                <span className="tbh-dato w-12 shrink-0 font-semibold" style={{ color: dm ? ROSSO_DM : GIALLO }}>
                  {e.ora}
                </span>
                {e.tipo === "brano" && e.cover ? (
                  <img src={e.cover} alt="" loading="lazy" className="h-10 w-10 shrink-0 rounded-md object-cover" />
                ) : (
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-white/5">
                    {e.tipo === "spot" ? (
                      <Megaphone className="h-4 w-4 text-[var(--tbh-muted)]" />
                    ) : dm ? (
                      <Tv className="h-4 w-4" style={{ color: ROSSO_DM }} />
                    ) : (
                      <Music4 className="h-4 w-4 text-[var(--tbh-muted)]" />
                    )}
                  </span>
                )}
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-semibold text-[var(--tbh-platinum)]">{e.titolo}</span>
                  <span className="block truncate text-xs text-[var(--tbh-muted)]">
                    {tipoBreve(e)}
                    {e.tipo === "brano" ? ` · ${e.artista ?? "J.C. Hugò"}` : e.tipo === "spot" ? ` · ${e.inserzionista}` : ""}
                  </span>
                </span>
              </li>
            );
          })}
        </ol>
        <div className="tbh-card flex flex-col gap-3 p-4" style={{ borderColor: `${ROSSO_DM}44` }}>
          <p className="text-xs font-bold uppercase tracking-[0.16em]" style={{ color: ROSSO_DM }}>
            Prossimi appuntamenti DM ON AIR
          </p>
          {appuntamenti.length === 0 ? (
            <p className="text-sm text-[var(--tbh-muted)]">Nessun appuntamento DM nei prossimi 7 giorni.</p>
          ) : (
            <ul className="flex flex-col gap-2 text-sm">
              {appuntamenti.map((a) => (
                <li key={`${a.data}-${a.da}`} className="flex flex-col">
                  <span className="tbh-dato text-xs capitalize text-[var(--tbh-muted)]">
                    {a.giorno} {dataBreve(a.data)} · {a.da}–{a.a}
                  </span>
                  <span className="font-semibold text-[var(--tbh-platinum)]">{a.titolo}</span>
                </li>
              ))}
            </ul>
          )}
          <p className="text-xs text-[var(--tbh-muted)]">Pausa pubblicitaria ogni 12–15 minuti di musica.</p>
        </div>
      </div>
    </div>
  );
}

/** PALINSESTO DI OGGI (o del giorno scelto), consultabile per fasce orarie. */
function PalinsestoGiorno({ giorno, setGiorno }: { giorno: string | null; setGiorno: (g: string | null) => void }) {
  const settimana = useSettimanaRadio();
  const giorni = settimana.data?.giorni ?? [];
  const oggiData = giorni[0]?.data ?? null;
  const scelto = giorno ?? oggiData;
  const palinsesto = usePalinsestoRadio(scelto && scelto !== oggiData ? scelto : undefined);
  const { adesso } = useRadioAdesso(15_000);
  const eOggi = !giorno || giorno === oggiData;
  const oraAdesso = Number(oraRoma(adesso).slice(0, 2)) % 24;

  const [fascia, setFascia] = useState<string | null>(null);
  const fasciaAttiva =
    fascia ?? (eOggi ? (FASCE.find((f) => oraAdesso >= f.da && oraAdesso < f.a)?.id ?? "notte") : "notte");
  const f = FASCE.find((x) => x.id === fasciaAttiva) ?? FASCE[0];

  const elementi = palinsesto.data?.elementi ?? [];
  const inFascia = elementi.filter((e) => {
    const h = Number(e.ora.slice(0, 2));
    return h >= f.da && h < f.a;
  });
  const conteggio = (x: (typeof FASCE)[number]) =>
    elementi.filter((e) => {
      const h = Number(e.ora.slice(0, 2));
      return h >= x.da && h < x.a;
    }).length;

  /* Lista scorrevole: si apre già sul brano in onda. */
  const lista = useRef<HTMLOListElement>(null);
  const corrente = useRef<HTMLLIElement>(null);
  const chiaveVista = `${scelto}-${fasciaAttiva}-${elementi.length}`;
  useEffect(() => {
    const l = lista.current;
    const c = corrente.current;
    if (l) l.scrollTop = c ? Math.max(0, c.offsetTop - 60) : 0;
  }, [chiaveVista]);

  const nomeScelto = giorni.find((g) => g.data === scelto);

  return (
    <div id="radio-palinsesto" className="flex flex-col gap-3 scroll-mt-40" data-testid="radio-palinsesto">
      <TitoloSezione icona={LayoutGrid}>{eOggi ? "PALINSESTO DI OGGI" : "PALINSESTO DEL GIORNO"}</TitoloSezione>
      <p className="text-sm text-[var(--tbh-muted)]">
        {nomeScelto ? (
          <span className="capitalize">
            {eOggi ? "Oggi, " : ""}
            {nomeScelto.giorno} {dataBreve(nomeScelto.data)}
          </span>
        ) : null}{" "}
        · ora di Roma · {elementi.length} passaggi in scaletta
      </p>

      {/* Giorni */}
      <div className="flex gap-2 overflow-x-auto pb-1" role="tablist" aria-label="Giorno del palinsesto">
        {giorni.map((g, i) => {
          const attivo = g.data === scelto;
          return (
            <button
              key={g.data}
              type="button"
              role="tab"
              aria-selected={attivo}
              onClick={() => {
                setGiorno(i === 0 ? null : g.data);
                setFascia(null);
              }}
              className={`shrink-0 rounded-full border px-4 py-1.5 text-sm font-semibold capitalize ${
                attivo ? "border-transparent text-black" : "border-white/15 text-[var(--tbh-platinum)] hover:border-white/40"
              }`}
              style={attivo ? { background: GIALLO } : undefined}
            >
              {i === 0 ? "Oggi" : `${g.giorno.slice(0, 3)} ${g.data.slice(8)}`}
            </button>
          );
        })}
      </div>

      {/* Fasce orarie */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4" role="tablist" aria-label="Fascia oraria">
        {FASCE.map((x) => {
          const attiva = x.id === fasciaAttiva;
          const ora = eOggi && oraAdesso >= x.da && oraAdesso < x.a;
          return (
            <button
              key={x.id}
              type="button"
              role="tab"
              aria-selected={attiva}
              onClick={() => setFascia(x.id)}
              className={`flex flex-col items-start rounded-xl border px-3 py-2 text-left transition ${
                attiva ? "border-[#d7ff00] bg-[#d7ff00]/10" : "border-white/10 hover:border-white/30"
              }`}
            >
              <span className="text-sm font-bold text-[var(--tbh-platinum)]">
                {x.nome}
                {ora && (
                  <span className="ml-2 text-[10px] tracking-[0.14em]" style={{ color: GIALLO }}>
                    ● ADESSO
                  </span>
                )}
              </span>
              <span className="tbh-dato text-xs text-[var(--tbh-muted)]">
                {String(x.da).padStart(2, "0")}:00–{String(x.a).padStart(2, "0")}:00 · {conteggio(x)} passaggi
              </span>
            </button>
          );
        })}
      </div>

      <ol
        ref={lista}
        className="tbh-card relative flex max-h-[560px] flex-col overflow-y-auto p-2 text-sm"
        data-testid="radio-palinsesto-lista"
      >
        {palinsesto.isLoading && <li className="p-3 text-[var(--tbh-muted)]">Caricamento del palinsesto…</li>}
        {inFascia.map((e, i) => {
          const inOnda = eOggi && e.inizio <= adesso && adesso < e.fine;
          const passato = eOggi && e.fine <= adesso;
          const nuovaOra = i === 0 || inFascia[i - 1]!.ora.slice(0, 2) !== e.ora.slice(0, 2);
          const dm = e.tipo === "dm";
          return (
            <li key={`${e.tipo}-${e.inizio}`} ref={inOnda ? corrente : undefined}>
              {nuovaOra && (
                <p className="sticky top-0 z-10 bg-[var(--tbh-surface)] px-2 pb-1 pt-3 text-[11px] font-bold tracking-[0.18em] text-[var(--tbh-muted)]">
                  ORE {e.ora.slice(0, 2)}
                </p>
              )}
              <div
                className={`flex items-center gap-3 rounded-lg px-2 py-1.5 ${inOnda ? "bg-[#d7ff00]/10" : ""} ${
                  passato ? "opacity-50" : ""
                }`}
              >
                <span className="tbh-dato w-12 shrink-0 text-[var(--tbh-muted)]">{e.ora}</span>
                <span
                  className="w-16 shrink-0 text-[10px] font-bold uppercase tracking-wider"
                  style={{ color: dm ? ROSSO_DM : e.tipo === "spot" ? "var(--tbh-gold)" : "var(--tbh-muted)" }}
                >
                  {tipoBreve(e)}
                </span>
                <span className="min-w-0 flex-1 truncate text-[var(--tbh-platinum)]">
                  <span className={inOnda ? "font-bold" : ""}>{e.titolo}</span>
                  {e.tipo === "brano" && <span className="text-[var(--tbh-muted)]"> · {e.artista ?? "J.C. Hugò"}</span>}
                </span>
                {inOnda && (
                  <span className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-extrabold text-black" style={{ background: GIALLO }}>
                    IN ONDA
                  </span>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
