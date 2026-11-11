import { House, LayoutGrid, Tv } from "lucide-react";
import { Link } from "wouter";
import { useCatalogoCms } from "../queries/contenuti-palinsesto";

/**
 * Home e Channel/pagine aggiunti dal pannello «Gestione contenuti e palinsesto» (28/10/2026),
 * nella guida (/guida) e nel pannello «Tutti i canali» dello zapping. Compaiono solo quando
 * sono attivi/pubblicati; senza voci non si mostra nulla. Ogni attività: una scheda, un URL.
 */

const FLUO = "#d7ff00";
const ROSSO_DM = "#ff2b2b";

export function SezioneCatalogoCms() {
  const q = useCatalogoCms();
  const homes = (q.data?.homes ?? []).filter((h) => h.slug !== "0");
  const extra = q.data?.extra ?? [];
  if (!homes.length && !extra.length) return null;
  return (
    <section className="mx-auto max-w-[1500px] px-4 py-8 md:px-8" data-testid="guida-cms">
      {homes.length > 0 && (
        <>
          <div className="mb-4 flex items-center gap-2">
            <House size={16} className="text-[var(--tbh-neon)]" />
            <h2 className="tbh-h2 tbh-display">ALTRE HOME</h2>
          </div>
          <div className="mb-8 flex flex-wrap gap-3">
            {homes.map((h) => (
              <Link key={h.slug} to={h.percorso} className="tbh-card px-5 py-4 text-sm font-extrabold uppercase tracking-[0.12em]" style={{ borderColor: FLUO }} data-guida-home={h.slug}>
                {h.nome}
              </Link>
            ))}
          </div>
        </>
      )}
      {extra.length > 0 && (
        <>
          <div className="mb-4 flex items-center gap-2">
            <LayoutGrid size={16} className="text-[var(--tbh-neon)]" />
            <h2 className="tbh-h2 tbh-display">NUOVI CHANNEL E PAGINE</h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {extra.map((c) => {
              const colore = c.sezione === "dm" ? ROSSO_DM : FLUO;
              return (
                <Link key={c.slug} to={c.percorso} className="tbh-card flex flex-col gap-2 p-4" style={{ borderColor: colore }} data-guida-extra={c.slug}>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] uppercase tracking-[0.18em] text-[var(--tbh-muted)]">{c.tipo === "pagina" ? "Pagina" : "Channel"}</span>
                    {c.logo ? <img src={c.logo} alt="" className="h-9 w-9 rounded-md object-contain" loading="lazy" /> : <Tv size={16} style={{ color: colore }} aria-hidden />}
                  </div>
                  <h3 className="tbh-display text-lg leading-tight">{c.nome}</h3>
                  {c.descrizione && <p className="tbh-body line-clamp-3 text-[13px] text-[var(--tbh-muted)]">{c.descrizione}</p>}
                  <span className="mt-auto text-[11px] uppercase tracking-[0.14em]" style={{ color: colore }}>
                    Entra
                  </span>
                </Link>
              );
            })}
          </div>
        </>
      )}
    </section>
  );
}

/** Voci aggiuntive del pannello «Tutti i canali» dello zapping. */
export function VociZappingCms({ onChiudi, percorso }: { onChiudi: () => void; percorso: string }) {
  const q = useCatalogoCms();
  const voci = [
    ...(q.data?.homes ?? []).filter((h) => h.slug !== "0").map((h) => ({ k: `h-${h.slug}`, to: h.percorso, nome: h.nome, sotto: "Home", logo: null as string | null, dm: false })),
    ...(q.data?.extra ?? []).map((c) => ({ k: `e-${c.slug}`, to: c.percorso, nome: c.nome, sotto: c.tipo === "pagina" ? "Pagina" : "Channel", logo: c.logo, dm: c.sezione === "dm" })),
  ];
  return (
    <>
      {voci.map((v) => {
        const qui = percorso === v.to;
        return (
          <li key={v.k}>
            <Link
              to={v.to}
              onClick={onChiudi}
              className={`flex min-h-14 items-center gap-3 rounded-xl border px-3 py-2 transition ${qui ? "bg-white/[0.07]" : "border-white/10 hover:border-white/30"}`}
              style={qui ? { borderColor: FLUO } : undefined}
              data-zap-cms={v.k}
            >
              <span className="grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-lg bg-black">
                {v.logo ? <img src={v.logo} alt="" width={40} height={40} loading="lazy" className="h-10 w-10 object-contain" /> : v.sotto === "Home" ? <House size={16} style={{ color: FLUO }} /> : <Tv size={16} style={{ color: v.dm ? ROSSO_DM : FLUO }} />}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[13px] font-extrabold uppercase tracking-[0.08em] text-white">{v.nome}</span>
                <span className="block truncate text-[11px] text-white/50">{v.sotto}</span>
              </span>
            </Link>
          </li>
        );
      })}
    </>
  );
}
