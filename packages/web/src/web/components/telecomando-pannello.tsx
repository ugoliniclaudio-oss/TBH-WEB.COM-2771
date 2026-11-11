import { useState } from "react";
import { Link } from "wouter";
import { ArrowRight, ExternalLink, Eye, Radio as RadioIcon, Tv } from "lucide-react";
import { useTelecomando } from "../queries/telecomando";
import { BadgeStato, GIALLO, LogoCanaleTbh, MonitorTelecomando, ROSSO_DM } from "./telecomando-monitor";

/**
 * TELECOMANDO CANALI — il pannello unico (solo anteprima, /check-web/telecomando e in cima
 * a /check-web/home-canali). 8 accessi principali → monitor del canale scelto; sotto, i 17
 * canali con logo, programmazione, stato reale e APRI CANALE (/check-web/canali/:slug).
 */

type Dati = NonNullable<ReturnType<typeof useTelecomando>["data"]>;
type Canale = Dati["canali"][number];

function oraRoma(ms: number) {
  return new Intl.DateTimeFormat("it-IT", { timeZone: "Europe/Rome", hour: "2-digit", minute: "2-digit" }).format(ms);
}

function ApriCanale({ slug, nome }: { slug: string; nome: string }) {
  return (
    <Link
      to={`/check-web/canali/${slug}`}
      className="inline-flex items-center justify-center gap-1.5 rounded-full px-3.5 py-2 text-[11px] font-extrabold tracking-[0.14em] text-black transition hover:brightness-110"
      style={{ background: GIALLO }}
      data-testid="apri-canale"
      aria-label={`Apri canale ${nome}`}
    >
      APRI CANALE <ArrowRight className="h-3.5 w-3.5" />
    </Link>
  );
}

function SchedaCanale({ c }: { c: Canale }) {
  return (
    <article
      className="flex min-w-0 flex-col gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-3.5 transition hover:border-[var(--tbh-neon)]/50"
      data-testid="scheda-canale"
      data-slug={c.slug}
    >
      <div className="flex min-w-0 items-start gap-3">
        <LogoCanaleTbh logo={c.logo} nome={c.nome} classe="h-12 w-16" />
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-sm font-extrabold uppercase tracking-[0.06em] text-white">{c.nome}</h3>
          <div className="mt-1">
            <BadgeStato stato={c.stato} dm={c.tipo === "dm" && c.stato === "ON AIR"} />
          </div>
        </div>
      </div>
      {c.anteprima ? (
        <div className="aspect-video overflow-hidden rounded-xl bg-black">
          <img src={c.anteprima} alt="" loading="lazy" className="h-full w-full object-cover" />
        </div>
      ) : null}
      <p className="text-[12px] leading-snug text-[var(--tbh-platinum)]">{c.programmazione}</p>
      <p className="text-[11px] text-[var(--tbh-muted)]">{c.dettaglio}</p>
      <div className="mt-auto flex flex-wrap items-center gap-2">
        <ApriCanale slug={c.slug} nome={c.nome} />
        {c.pagina ? (
          <Link to={c.pagina} className="inline-flex items-center gap-1 text-[11px] text-[var(--tbh-muted)] underline-offset-2 hover:text-[var(--tbh-neon)] hover:underline">
            Pagina esistente <ExternalLink className="h-3 w-3" />
          </Link>
        ) : (
          <span className="text-[11px] text-[var(--tbh-muted)]">Pagina: da creare</span>
        )}
      </div>
    </article>
  );
}

export function TelecomandoCanali() {
  const q = useTelecomando();
  const [scelto, setScelto] = useState("touch-tv");
  const d = q.data;
  const voceScelta = d?.canali.find((c) => c.slug === scelto);

  const squadre = d?.canali.filter((c) => c.tipo === "squadra") ?? [];
  const altri = d?.canali.filter((c) => c.tipo !== "squadra") ?? [];

  return (
    <section className="mx-auto max-w-[1500px] px-4 py-6 md:px-8" data-testid="telecomando-canali">
      {/* intestazione */}
      <header className="relative overflow-hidden rounded-3xl border border-white/10 bg-black px-5 py-6 md:px-8 md:py-8">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{ backgroundImage: "repeating-linear-gradient(0deg, #fff 0 1px, transparent 1px 4px)" }}
          aria-hidden
        />
        <p className="relative text-[11px] font-extrabold tracking-[0.3em] text-[var(--tbh-muted)]">TOUCH BUSINESS HOLDING</p>
        <h1 className="relative mt-1 text-3xl font-black tracking-[0.04em] md:text-5xl" style={{ color: GIALLO }}>
          TELECOMANDO CANALI
        </h1>
        <p className="relative mt-2 text-sm text-[var(--tbh-platinum)] md:text-base">Un unico pannello · Canali distinti · Contenuti automatici</p>
        {d && (
          <p className="relative mt-3 text-[11px] text-[var(--tbh-muted)]">
            Ora di Roma {oraRoma(d.adesso)} ·{" "}
            {d.dm.corrente ? (
              <span style={{ color: d.dm.corrente.tipo === "diretta" ? ROSSO_DM : GIALLO }} className="font-bold">
                DM {d.dm.corrente.tipo === "diretta" ? "IN DIRETTA" : "IN REPLICA"} — {d.dm.corrente.titolo}
              </span>
            ) : d.dm.prossimaDiretta ? (
              <>Prossima diretta DM: {oraRoma(d.dm.prossimaDiretta.inizio)} — {d.dm.prossimaDiretta.titolo}</>
            ) : (
              <>Nessuna diretta DM in corso oggi</>
            )}
          </p>
        )}
      </header>

      {q.isLoading && <p className="py-10 text-center text-sm text-[var(--tbh-muted)]">Caricamento telecomando…</p>}
      {q.isError && <p className="py-10 text-center text-sm text-[var(--tbh-muted)]">Telecomando non disponibile, riprova tra poco.</p>}

      {d && (
        <>
          {/* 8 accessi principali */}
          <nav className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4" aria-label="Accessi principali" data-testid="accessi-principali">
            {d.accessi.map((a) => {
              const attivo = a.canale === scelto;
              const stato = a.canale ? d.canali.find((c) => c.slug === a.canale)?.stato : undefined;
              const contenuto = (
                <>
                  <span className="flex items-center justify-between gap-2">
                    <span className="text-[13px] font-black tracking-[0.08em] md:text-sm">{a.nome}</span>
                    {stato === "ON AIR" && (
                      <span className="h-2 w-2 shrink-0 animate-pulse rounded-full" style={{ background: a.canale === "dm-channel" ? ROSSO_DM : GIALLO }} />
                    )}
                  </span>
                  <span className={`mt-0.5 text-[11px] ${attivo ? "text-black/70" : "text-[var(--tbh-muted)]"}`}>{a.sotto}</span>
                </>
              );
              const classe = `flex min-h-[64px] flex-col justify-center rounded-2xl border px-3.5 py-2.5 text-left transition ${
                attivo ? "border-transparent text-black" : "border-white/12 bg-white/[0.03] text-white hover:border-[var(--tbh-neon)]/60"
              }`;
              if (a.ancora)
                return (
                  <a key={a.nome} href={`#${a.ancora}`} className={classe} data-testid="accesso">
                    {contenuto}
                  </a>
                );
              return (
                <button
                  key={a.nome}
                  type="button"
                  onClick={() => a.canale && setScelto(a.canale)}
                  className={classe}
                  style={attivo ? { background: GIALLO } : undefined}
                  aria-pressed={attivo}
                  data-testid="accesso"
                >
                  {contenuto}
                </button>
              );
            })}
          </nav>

          {/* monitor del canale scelto */}
          {voceScelta && (
            <div className="mt-4 rounded-3xl border border-white/10 bg-black/60 p-3 md:p-5" data-testid="monitor-scelto">
              <div className="mb-3 flex flex-wrap items-center gap-3">
                <LogoCanaleTbh logo={voceScelta.logo} nome={voceScelta.nome} classe="h-11 w-14" />
                <div className="min-w-0 flex-1">
                  <p className="flex items-center gap-1.5 text-[10px] font-bold tracking-[0.2em] text-[var(--tbh-muted)]">
                    {voceScelta.tipo === "radio" ? <RadioIcon className="h-3 w-3" /> : <Tv className="h-3 w-3" />} MONITOR
                  </p>
                  <h2 className="truncate text-lg font-black uppercase tracking-[0.05em] text-white">{voceScelta.nome}</h2>
                </div>
                <BadgeStato stato={voceScelta.stato} dm={voceScelta.tipo === "dm" && voceScelta.stato === "ON AIR"} />
                <ApriCanale slug={voceScelta.slug} nome={voceScelta.nome} />
              </div>
              <MonitorTelecomando key={voceScelta.slug} slug={voceScelta.slug} compatto />
            </div>
          )}

          {/* legenda stati */}
          <div className="mt-6 flex flex-wrap items-center gap-2 text-[11px] text-[var(--tbh-muted)]">
            <span className="mr-1 font-bold tracking-[0.16em]">STATI:</span>
            <BadgeStato stato="ON AIR" /> <span>in onda ora</span>
            <BadgeStato stato="REPLICA" /> <span>replica in fascia</span>
            <BadgeStato stato="CONTENUTI DISPONIBILI" /> <span>archivio consultabile</span>
            <BadgeStato stato="IN ALLESTIMENTO" /> <span>contenuti non ancora disponibili</span>
          </div>

          {/* canali */}
          <h2 className="mt-6 text-xs font-extrabold tracking-[0.24em] text-[var(--tbh-muted)]">CANALI · {d.canali.length}</h2>
          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4" data-testid="griglia-canali">
            {altri.map((c) => (
              <SchedaCanale key={c.slug} c={c} />
            ))}
          </div>

          <h2 id="squadre-dm" className="mt-8 scroll-mt-24 text-xs font-extrabold tracking-[0.24em]" style={{ color: GIALLO }}>
            SQUADRE DM · {squadre.length} CANALI CALCISTICI
          </h2>
          <p className="mt-1 text-[11px] text-[var(--tbh-muted)]">Ogni canale mostra solo l'archivio DM della propria società.</p>
          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5" data-testid="griglia-squadre">
            {squadre.map((c) => (
              <SchedaCanale key={c.slug} c={c} />
            ))}
          </div>
        </>
      )}
    </section>
  );
}

/** Banda «anteprima, non pubblicato» comune alle pagine del telecomando. */
export function BandaAnteprimaTelecomando() {
  return (
    <div className="mx-auto max-w-[1500px] px-4 pt-4 md:px-8">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 rounded-2xl border border-[var(--tbh-gold)]/50 bg-black/70 px-4 py-3 text-[12px]">
        <span className="inline-flex items-center gap-2 font-extrabold tracking-[0.16em] text-[var(--tbh-gold)]">
          <Eye className="h-4 w-4" /> ANTEPRIMA · NON PUBBLICATA
        </span>
        <span className="min-w-0 text-[var(--tbh-muted)]">
          Loghi con «da approvare» = file originali proposti, non ancora assegnati. Home, menu e AREE invariati.
        </span>
      </div>
    </div>
  );
}
