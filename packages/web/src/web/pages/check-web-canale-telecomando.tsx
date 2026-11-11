import { Link } from "wouter";
import { AlertTriangle, ArrowLeft, ChevronLeft, ChevronRight, ExternalLink } from "lucide-react";
import { useCanaleTelecomando } from "../queries/telecomando";
import { BandaAnteprimaTelecomando } from "../components/telecomando-pannello";
import { BadgeStato, GIALLO, LogoCanaleTbh, MonitorTelecomando } from "../components/telecomando-monitor";

/** /check-web/canali/:slug — pagina di un canale del telecomando (anteprima). */
export default function CheckWebCanaleTelecomandoPage({ slug }: { slug: string }) {
  const q = useCanaleTelecomando(slug);
  const d = q.data;

  return (
    <div>
      <BandaAnteprimaTelecomando />
      <section className="mx-auto max-w-[1200px] px-4 py-6 md:px-8" data-testid="pagina-canale" data-slug={slug}>
        <Link
          to="/check-web/telecomando"
          className="inline-flex items-center gap-1.5 text-[12px] font-bold tracking-[0.14em] text-[var(--tbh-muted)] hover:text-[var(--tbh-neon)]"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> TELECOMANDO CANALI
        </Link>

        {q.isLoading && <p className="py-16 text-center text-sm text-[var(--tbh-muted)]">Caricamento canale…</p>}
        {!q.isLoading && !d && (
          <div className="py-16 text-center">
            <h1 className="text-2xl font-black text-white">Canale non trovato</h1>
            <p className="mt-2 text-sm text-[var(--tbh-muted)]">Nessun canale del telecomando con indirizzo «{slug}».</p>
          </div>
        )}

        {d && (
          <>
            <header className="mt-4 flex flex-wrap items-center gap-4">
              <LogoCanaleTbh logo={d.voce.logo} nome={d.voce.nome} classe="h-16 w-24" />
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-extrabold tracking-[0.3em] text-[var(--tbh-muted)]">TOUCH BUSINESS HOLDING · CANALE</p>
                <h1 className="text-2xl font-black uppercase tracking-[0.04em] md:text-4xl" style={{ color: GIALLO }}>
                  {d.voce.nome}
                </h1>
                <p className="mt-1 text-sm text-[var(--tbh-platinum)]">{d.voce.programmazione}</p>
              </div>
              <div className="flex flex-col items-start gap-1">
                <BadgeStato stato={d.voce.stato} dm={d.voce.tipo === "dm" && d.voce.stato === "ON AIR"} />
                <span className="text-[11px] text-[var(--tbh-muted)]">{d.voce.dettaglio}</span>
              </div>
            </header>

            <nav className="mt-4 flex items-center justify-between gap-2 text-[12px]" aria-label="Canali vicini">
              <Link
                to={`/check-web/canali/${d.vicini.prima.slug}`}
                className="inline-flex min-w-0 items-center gap-1 rounded-full border border-white/15 px-3 py-1.5 text-[var(--tbh-platinum)] hover:border-[var(--tbh-neon)]"
                data-testid="canale-prima"
              >
                <ChevronLeft className="h-4 w-4 shrink-0" /> <span className="truncate">{d.vicini.prima.nome}</span>
              </Link>
              <Link
                to={`/check-web/canali/${d.vicini.dopo.slug}`}
                className="inline-flex min-w-0 items-center gap-1 rounded-full border border-white/15 px-3 py-1.5 text-[var(--tbh-platinum)] hover:border-[var(--tbh-neon)]"
                data-testid="canale-dopo"
              >
                <span className="truncate">{d.vicini.dopo.nome}</span> <ChevronRight className="h-4 w-4 shrink-0" />
              </Link>
            </nav>

            <div className="mt-4 rounded-3xl border border-white/10 bg-black/60 p-3 md:p-5">
              <MonitorTelecomando key={slug} slug={slug} />
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <h2 className="text-[11px] font-extrabold tracking-[0.2em] text-[var(--tbh-muted)]">PAGINA ESISTENTE DEL SITO</h2>
                {d.voce.pagina ? (
                  <Link to={d.voce.pagina} className="mt-2 inline-flex items-center gap-1.5 text-sm font-semibold text-white hover:text-[var(--tbh-neon)]">
                    {d.voce.pagina} <ExternalLink className="h-3.5 w-3.5" />
                  </Link>
                ) : (
                  <p className="mt-2 text-sm text-[var(--tbh-muted)]">Nessuna pagina esistente: da creare.</p>
                )}
                {d.voce.logo && <p className="mt-3 text-[11px] text-[var(--tbh-muted)]">Logo: {d.voce.logo.nota}</p>}
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4" data-testid="problemi-canale">
                <h2 className="flex items-center gap-1.5 text-[11px] font-extrabold tracking-[0.2em] text-[var(--tbh-muted)]">
                  <AlertTriangle className="h-3.5 w-3.5" /> DA SISTEMARE / DA CONFERMARE
                </h2>
                {d.voce.problemi.length ? (
                  <ul className="mt-2 list-disc space-y-1 pl-4 text-[12px] text-[var(--tbh-platinum)]">
                    {d.voce.problemi.map((p) => (
                      <li key={p}>{p}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-2 text-[12px] text-[var(--tbh-muted)]">Nessun problema rilevato al collaudo.</p>
                )}
              </div>
            </div>
          </>
        )}
      </section>
    </div>
  );
}
