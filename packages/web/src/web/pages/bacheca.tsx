/**
 * TBH Lavoro — Bacheca annunci (06/10/2026).
 * Elenco compatto subito visibile: prima le «Opportunità TBH» attive (solo se passano i
 * filtri), poi gli annunci esterni dal più recente. Gli scaduti stanno solo in archivio.
 */
import { useEffect, useMemo, useState } from "react";
import { useLocation, useSearch } from "wouter";
import { Archive, RotateCcw, Search, SlidersHorizontal } from "lucide-react";
import { SezioneAmministrabile } from "../components/sezione-amministrabile";
import {
  BannerAziende,
  EvidenzaCercoLavoroHotel,
  NotaCandidature,
  RigaAnnuncio,
  TestataLavoro,
} from "../components/tbh-lavoro";
import {
  ANNUNCI_TBH,
  contaFiltriAttivi,
  FILTRI_VUOTI,
  filtraBacheca,
  oggiIso,
  opzioniFiltri,
  TUTTI_ANNUNCI,
  ZONE_ADRIATICHE,
  type Filtri,
} from "../lib/bacheca-annunci";

/** Vecchie ancore della bacheca (#slug) → nuova scheda dedicata. */
const ANCORE_LEGACY = new Set(
  ANNUNCI_TBH.filter((a) => a.scheda.tipo === "interna" && a.scheda.to.startsWith("/lavoro-casting/bacheca/")).map(
    (a) => a.slug,
  ),
);

const sel =
  "w-full min-w-0 rounded-xl border border-[var(--tbh-line)] bg-black px-3 py-2 text-sm focus:border-[var(--tbh-neon)] outline-none";

function Campo({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1 min-w-0">
      <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--tbh-muted)]">{label}</span>
      {children}
    </label>
  );
}

function Opzioni({ valori, tutte }: { valori: string[]; tutte: string }) {
  return (
    <>
      <option value="">{tutte}</option>
      {valori.map((v) => (
        <option key={v} value={v}>
          {v}
        </option>
      ))}
    </>
  );
}

export default function BachecaPage() {
  const search = useSearch();
  const [, naviga] = useLocation();
  const params = new URLSearchParams(search);
  const mostraArchivio = params.get("archivio") === "1";

  const [f, setF] = useState<Filtri>(FILTRI_VUOTI);
  const [aperti, setAperti] = useState(false);
  const oggi = oggiIso();

  // Link vecchi del tipo /lavoro-casting/bacheca#cerchiamo-3-collaboratori
  useEffect(() => {
    const h = window.location.hash.replace(/^#/, "");
    if (h && ANCORE_LEGACY.has(h)) naviga(`/lavoro-casting/bacheca/${h}`, { replace: true });
    if (h === "tabella-fisso-premi") naviga("/lavoro-casting/bacheca/tabella-fisso-premi-commerciali", { replace: true });
  }, [naviga]);

  useEffect(() => {
    if (mostraArchivio) document.getElementById("archivio")?.scrollIntoView({ behavior: "smooth" });
  }, [mostraArchivio]);

  const opz = useMemo(() => opzioniFiltri(TUTTI_ANNUNCI), []);
  const { attivi, archivio } = useMemo(() => filtraBacheca(TUTTI_ANNUNCI, f, oggi), [f, oggi]);
  const nFiltri = contaFiltriAttivi(f);
  const nTbh = attivi.filter((a) => a.provenienza === "tbh").length;
  const set = <K extends keyof Filtri>(k: K, v: Filtri[K]) => setF((p) => ({ ...p, [k]: v }));

  return (
    <div className="mx-auto max-w-[1300px] px-4 md:px-8 py-8 md:py-10">
      <TestataLavoro
        occhiello="TBH Lavoro · offerte di lavoro"
        titolo="TBH Lavoro — Bacheca annunci"
        testo="Opportunità TBH in cima, poi annunci di fonti esterne con link e recapiti originali. Gli annunci scaduti vanno in archivio."
      />

      {/* Filtri */}
      <section aria-label="Filtri bacheca" className="rounded-2xl border border-[var(--tbh-line)] bg-[var(--tbh-surface)] p-3 md:p-4 mb-4">
        <div className="flex flex-col sm:flex-row gap-2">
          <label className="relative flex-1 min-w-0">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--tbh-muted)]" />
            <input
              type="search"
              value={f.q}
              onChange={(e) => set("q", e.target.value)}
              placeholder="Cerca ruolo, azienda, località…"
              aria-label="Parola chiave"
              className="w-full rounded-xl border border-[var(--tbh-line)] bg-black pl-9 pr-3 py-2.5 text-sm outline-none focus:border-[var(--tbh-neon)]"
            />
          </label>
          <div className="flex gap-2">
            <select aria-label="Provenienza" value={f.provenienza} onChange={(e) => set("provenienza", e.target.value as Filtri["provenienza"])} className={`${sel} sm:w-44`}>
              <option value="tutte">Tutte le provenienze</option>
              <option value="tbh">Solo Opportunità TBH</option>
              <option value="esterna">Solo fonti esterne</option>
            </select>
            <select aria-label="Zona" value={f.zona} onChange={(e) => set("zona", e.target.value)} className={`${sel} sm:w-56`}>
              <option value="">Tutta Italia</option>
              <option value="costa">Tutta la costa adriatica</option>
              {ZONE_ADRIATICHE.map((z) => (
                <option key={z.id} value={z.id}>
                  {z.nome}
                </option>
              ))}
            </select>
          </div>
          <button
            type="button"
            onClick={() => setAperti((x) => !x)}
            aria-expanded={aperti}
            className="shrink-0 rounded-xl border border-[var(--tbh-line)] px-4 py-2 text-sm font-semibold inline-flex items-center justify-center gap-2 hover:border-[var(--tbh-neon)]"
          >
            <SlidersHorizontal size={15} /> Altri filtri
          </button>
        </div>

        {aperti && (
          <div className="grid gap-3 grid-cols-2 md:grid-cols-4 lg:grid-cols-6 mt-3 pt-3 border-t border-[var(--tbh-line)]">
            <Campo label="Settore">
              <select value={f.settore} onChange={(e) => set("settore", e.target.value)} className={sel}>
                <Opzioni valori={opz.settori} tutte="Tutti" />
              </select>
            </Campo>
            <Campo label="Ruolo">
              <select value={f.ruolo} onChange={(e) => set("ruolo", e.target.value)} className={sel}>
                <Opzioni valori={opz.ruoli} tutte="Tutti" />
              </select>
            </Campo>
            <Campo label="Regione">
              <select value={f.regione} onChange={(e) => set("regione", e.target.value)} className={sel}>
                <Opzioni valori={opz.regioni} tutte="Tutte" />
              </select>
            </Campo>
            <Campo label="Provincia">
              <select value={f.provincia} onChange={(e) => set("provincia", e.target.value)} className={sel}>
                <Opzioni valori={opz.province} tutte="Tutte" />
              </select>
            </Campo>
            <Campo label="Comune">
              <select value={f.comune} onChange={(e) => set("comune", e.target.value)} className={sel}>
                <Opzioni valori={opz.comuni} tutte="Tutti" />
              </select>
            </Campo>
            <Campo label="Tipo">
              <select value={f.tipoPeriodo} onChange={(e) => set("tipoPeriodo", e.target.value as Filtri["tipoPeriodo"])} className={sel}>
                <option value="">Tutti</option>
                <option value="stagionale">Stagionale</option>
                <option value="continuativo">Continuativo</option>
              </select>
            </Campo>
            <Campo label="Orario">
              <select value={f.orario} onChange={(e) => set("orario", e.target.value as Filtri["orario"])} className={sel}>
                <option value="">Tutti</option>
                <option value="full-time">Full time</option>
                <option value="part-time">Part time</option>
              </select>
            </Campo>
            <Campo label="Periodo">
              <select value={f.periodo} onChange={(e) => set("periodo", e.target.value)} className={sel}>
                <Opzioni valori={opz.periodi} tutte="Tutti" />
              </select>
            </Campo>
            <Campo label="Alloggio">
              <select value={f.alloggio} onChange={(e) => set("alloggio", e.target.value as Filtri["alloggio"])} className={sel}>
                <option value="">Indifferente</option>
                <option value="si">Con alloggio</option>
                <option value="no">Senza alloggio</option>
              </select>
            </Campo>
            <Campo label="Pubblicazione">
              <select value={f.pubblicazione} onChange={(e) => set("pubblicazione", e.target.value as Filtri["pubblicazione"])} className={sel}>
                <option value="">Qualsiasi data</option>
                <option value="7">Ultimi 7 giorni</option>
                <option value="30">Ultimi 30 giorni</option>
              </select>
            </Campo>
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-2 mt-3 text-xs">
          <p aria-live="polite" data-conteggio={attivi.length} className="text-[var(--tbh-muted)]">
            <b className="text-white">{attivi.length}</b> annunci attivi
            {nTbh > 0 && <> · di cui <b className="text-[var(--tbh-neon)]">{nTbh}</b> Opportunità TBH</>}
            {archivio.length > 0 && <> · {archivio.length} in archivio</>}
          </p>
          {nFiltri > 0 && (
            <button type="button" onClick={() => setF(FILTRI_VUOTI)} className="inline-flex items-center gap-1.5 text-[var(--tbh-neon)] font-semibold">
              <RotateCcw size={13} /> Azzera filtri ({nFiltri})
            </button>
          )}
        </div>
      </section>

      {/* Elenco */}
      <div className="grid gap-2.5" data-elenco="attivi">
        {attivi.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[var(--tbh-line)] p-8 text-center">
            <p className="tbh-display text-xl">Nessun annuncio con questi filtri</p>
            <p className="text-sm text-[var(--tbh-muted)] mt-1">Allarga la zona o azzera i filtri per vedere tutte le offerte.</p>
            <button type="button" onClick={() => setF(FILTRI_VUOTI)} className="tbh-neon-btn px-5 py-2 text-sm mt-4 inline-flex items-center gap-2">
              <RotateCcw size={14} /> Azzera filtri
            </button>
          </div>
        ) : (
          attivi.map((a) => <RigaAnnuncio key={a.slug} a={a} />)
        )}
      </div>

      <div className="mt-4">
        <NotaCandidature />
      </div>

      <div className="mt-8 grid gap-4">
        <EvidenzaCercoLavoroHotel />
        <BannerAziende />
      </div>

      {/* Archivio */}
      <section id="archivio" className="mt-10">
        <details open={mostraArchivio} className="group">
          <summary className="cursor-pointer list-none flex items-center gap-2 text-sm font-semibold text-[var(--tbh-muted)] hover:text-white">
            <Archive size={16} /> Archivio annunci scaduti ({archivio.length})
            <span className="text-xs font-normal">— candidature chiuse</span>
          </summary>
          <div className="grid gap-2.5 mt-3">
            {archivio.length === 0 ? (
              <p className="text-sm text-[var(--tbh-muted)]">Nessun annuncio scaduto con questi filtri.</p>
            ) : (
              archivio.map((a) => <RigaAnnuncio key={a.slug} a={a} archivio />)
            )}
          </div>
        </details>
      </section>

      <div className="mt-14 grid gap-12 border-t border-white/10 pt-10">
        <SezioneAmministrabile sezione="lavoro-annunci" />
      </div>
    </div>
  );
}
