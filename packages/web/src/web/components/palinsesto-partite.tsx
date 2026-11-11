import { useMemo } from "react";
import { Link } from "wouter";
import { CalendarDays, ExternalLink, Trophy } from "lucide-react";
import { usePalinsestoCanaliSquadra, usePalinsestoSquadra } from "../queries/calendari";
import { COLORE_TBH } from "../lib/identita-tbh";

/**
 * PALINSESTO PARTITE — canali squadra del telecomando (anteprima, 17/10/2026).
 *
 * Dati letti dal server su Romagna Sport (calendario + classifica del girone).
 * Regole: nessuna partita, ora o punteggio inventato; dove la fonte non scrive
 * il dato compare «da confermare». Fonti sempre citate con il loro logo
 * ORIGINALE (public/brand/fonti/, in anteprima: da approvare) e il momento della lettura.
 */

const GIALLO = COLORE_TBH;

function quandoLetto(iso: string | null) {
  if (!iso) return "lettura non riuscita";
  return new Intl.DateTimeFormat("it-IT", {
    timeZone: "Europe/Rome",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

function giornoTesto(data: string) {
  const [g, m, a] = data.split("/").map(Number);
  if (!g || !m || !a) return data;
  return new Intl.DateTimeFormat("it-IT", { timeZone: "UTC", weekday: "short", day: "2-digit", month: "short" }).format(Date.UTC(a, m - 1, g));
}

function chiave(data: string, ora: string | null) {
  const [g, m, a] = data.split("/");
  return `${a}${m}${g}${(ora ?? "99:99").replace(":", "")}`;
}

function Esito({ e }: { e: "V" | "N" | "P" | null }) {
  if (!e) return null;
  const stile = e === "V" ? { background: GIALLO, color: "#000" } : e === "N" ? { background: "rgba(255,255,255,.18)", color: "#fff" } : { background: "transparent", color: "#fff", border: "1px solid rgba(255,255,255,.35)" };
  return (
    <span className="grid h-5 w-5 shrink-0 place-items-center rounded text-[10px] font-black" style={stile} title={e === "V" ? "Vittoria" : e === "N" ? "Pareggio" : "Sconfitta"}>
      {e}
    </span>
  );
}

/** Logo originale della fonte su fondo bianco (i file hanno fondo bianco o trasparente con testo nero). */
function LogoFonte({ src, nome, href }: { src: string; nome: string; href: string }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className="inline-flex h-8 items-center rounded-md bg-white px-2 py-1 hover:opacity-90" title={`${nome} — apri il sito`}>
      <img src={src} alt={nome} className="h-full w-auto max-w-[140px] object-contain" />
    </a>
  );
}

function FontiPartite({
  fonte,
  tuttoCampo,
}: {
  fonte: { nome: string; logo: string; sito: string; calendario: string | null; classifica: string | null; squadra: string; lettoIl: string | null; copiaPrecedente: boolean };
  tuttoCampo: { nome: string; logo: string; girone: string };
}) {
  return (
    <div className="flex flex-col gap-2 rounded-xl border border-white/10 p-3" data-testid="fonti-partite">
      <div className="flex flex-wrap items-center gap-2">
        <LogoFonte src={fonte.logo} nome={fonte.nome} href={fonte.sito} />
        <p className="min-w-0 flex-1 text-[11px] text-[var(--tbh-muted)]">
          Fonte: <strong className="text-[var(--tbh-platinum)]">{fonte.nome}</strong> · letto il {quandoLetto(fonte.lettoIl)}
          {fonte.copiaPrecedente && " · ultima lettura buona, la fonte ora non risponde"}
        </p>
      </div>
      <div className="flex flex-wrap gap-x-3 gap-y-1 text-[11px]">
        {fonte.calendario && (
          <a href={fonte.calendario} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-[var(--tbh-platinum)] hover:text-[var(--tbh-neon)]">
            Calendario <ExternalLink className="h-3 w-3" />
          </a>
        )}
        {fonte.classifica && (
          <a href={fonte.classifica} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-[var(--tbh-platinum)] hover:text-[var(--tbh-neon)]">
            Classifica e risultati <ExternalLink className="h-3 w-3" />
          </a>
        )}
        <a href={fonte.squadra} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-[var(--tbh-platinum)] hover:text-[var(--tbh-neon)]">
          Scheda società <ExternalLink className="h-3 w-3" />
        </a>
      </div>
      <div className="flex flex-wrap items-center gap-2 border-t border-white/5 pt-2">
        <LogoFonte src={tuttoCampo.logo} nome={tuttoCampo.nome} href={tuttoCampo.girone} />
        <a href={tuttoCampo.girone} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-[11px] text-[var(--tbh-platinum)] hover:text-[var(--tbh-neon)]">
          Il girone su Tutto Campo <ExternalLink className="h-3 w-3" />
        </a>
        <span className="text-[10px] text-[var(--tbh-muted)]">solo collegamento: il sito non consente la lettura automatica</span>
      </div>
      <p className="text-[10px] text-[var(--tbh-muted)]">Loghi delle fonti: file originali inviati il 17/10/2026, in anteprima · da approvare.</p>
    </div>
  );
}

/** Palinsesto partite di UN canale squadra. `compatto` = dentro il telecomando. */
export function PalinsestoPartite({ squadra, compatto = false }: { squadra: string; compatto?: boolean }) {
  const q = usePalinsestoSquadra(squadra);
  const p = q.data;

  if (q.isLoading) {
    return <div className="rounded-2xl border border-white/10 p-3 text-xs text-[var(--tbh-muted)]">Lettura calendario e classifica su Romagna Sport…</div>;
  }
  if (!p) return null;

  return (
    <section className="flex flex-col gap-3 rounded-2xl border border-white/10 p-3" data-testid="palinsesto-partite" data-letto={p.letto ? "si" : "no"}>
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: GIALLO }}>
          Palinsesto partite · {p.campionato}
        </p>
        {p.letto && p.aggiornataAlla && <span className="text-[10px] text-[var(--tbh-muted)]">Classifica {p.aggiornataAlla.toLowerCase()}</span>}
      </div>

      {!p.letto ? (
        <p className="rounded-xl border border-dashed border-white/20 p-3 text-[12px] text-[var(--tbh-muted)]" data-testid="partite-da-confermare">
          Calendario e classifica: <strong className="text-[var(--tbh-platinum)]">dato da confermare</strong> — Romagna Sport non ha risposto alla lettura. Nessuna partita inserita a mano.
        </p>
      ) : (
        <>
          {/* PROSSIMA PARTITA */}
          {p.prossime[0] ? (
            <div className="rounded-xl p-3" style={{ background: "rgba(215,255,0,.08)", border: `1px solid ${GIALLO}55` }} data-testid="prossima-partita">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--tbh-muted)]">
                Prossima partita · {p.prossime[0].giornata}a giornata · {p.prossime[0].inCasa ? "in casa" : "in trasferta"}
              </p>
              <p className="mt-1 text-lg font-black leading-tight text-white md:text-xl">
                <span style={p.prossime[0].inCasa ? { color: GIALLO } : undefined}>{p.prossime[0].casa}</span>
                <span className="mx-2 text-[var(--tbh-muted)]">–</span>
                <span style={!p.prossime[0].inCasa ? { color: GIALLO } : undefined}>{p.prossime[0].ospite}</span>
              </p>
              <p className="mt-1 flex items-center gap-1.5 text-[12px] text-[var(--tbh-platinum)]">
                <CalendarDays className="h-3.5 w-3.5" />
                {giornoTesto(p.prossime[0].data)} {p.prossime[0].data}
                {p.prossime[0].ora ? ` · ore ${p.prossime[0].ora}` : " · orario da confermare"}
                {!p.prossime[0].dataEsatta && " (data della giornata)"}
              </p>
            </div>
          ) : (
            <p className="text-[12px] text-[var(--tbh-muted)]">Nessuna partita in programma nel calendario letto: da confermare.</p>
          )}

          {p.posizione && (
            <p className="flex items-center gap-1.5 text-[12px] text-[var(--tbh-platinum)]" data-testid="posizione-classifica">
              <Trophy className="h-3.5 w-3.5" style={{ color: GIALLO }} />
              {p.posizione.posizione}° posto · {p.posizione.punti} punti in {p.posizione.gare} gare ({p.posizione.v}V {p.posizione.n}N {p.posizione.p}P · {p.posizione.f}-{p.posizione.s})
            </p>
          )}

          <div className={`grid gap-3 ${compatto ? "" : "md:grid-cols-2"}`}>
            {/* IN PROGRAMMA */}
            {p.prossime.length > 1 && (
              <div className="min-w-0">
                <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--tbh-muted)]">Poi in programma</p>
                <ul className="divide-y divide-white/5 text-[12px]">
                  {p.prossime.slice(1, compatto ? 3 : 4).map((x) => (
                    <li key={`${x.giornata}-${x.casa}`} className="flex items-center gap-2 py-1.5">
                      <span className="w-14 shrink-0 text-[var(--tbh-muted)]">{x.data.slice(0, 5)}</span>
                      <span className="min-w-0 flex-1 truncate">
                        {x.inCasa ? "vs" : "@"} {x.avversario}
                      </span>
                      <span className="shrink-0 text-[10px] text-[var(--tbh-muted)]">{x.giornata}a g.</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* ULTIMI RISULTATI */}
            {p.ultimi.length > 0 && (
              <div className="min-w-0" data-testid="ultimi-risultati">
                <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--tbh-muted)]">Ultimi risultati</p>
                <ul className="divide-y divide-white/5 text-[12px]">
                  {p.ultimi.slice(0, compatto ? 3 : 5).map((x) => (
                    <li key={`${x.giornata}-${x.casa}`} className="flex items-center gap-2 py-1.5">
                      <Esito e={x.esito} />
                      <span className="min-w-0 flex-1 truncate">
                        {x.casa} – {x.ospite}
                      </span>
                      <strong className="shrink-0 tabular-nums">{x.risultato}</strong>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {p.sospese.length > 0 && (
            <p className="text-[11px] text-[var(--tbh-gold)]">
              {p.sospese.map((x) => `${x.giornata}a giornata ${x.casa} – ${x.ospite} (${x.data})`).join(" · ")}: Romagna Sport scrive «N.G.» — rinvio o risultato non ancora inserito, da confermare.
            </p>
          )}

          {!compatto && (
            <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
              {/* GIORNATA IN CORSO DEL GIRONE */}
              {p.turno.partite.length > 0 && (
                <div className="min-w-0 rounded-xl border border-white/10 p-3" data-testid="turno-girone">
                  <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--tbh-muted)]">Il girone · {p.turno.nome ?? "giornata in corso"}</p>
                  <ul className="divide-y divide-white/5 text-[12px]">
                    {p.turno.partite.map((x) => {
                      const mia = x.casaId === p.idSquadra || x.ospiteId === p.idSquadra;
                      return (
                        <li key={`${x.casaId}-${x.ospiteId}`} className="flex items-center gap-2 py-1.5" style={mia ? { color: GIALLO } : undefined}>
                          <span className="min-w-0 flex-1 truncate">
                            {x.casa} – {x.ospite}
                          </span>
                          <span className="shrink-0 tabular-nums text-[11px] text-[var(--tbh-platinum)]">{x.quando}</span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}

              {/* CLASSIFICA */}
              {p.classifica.length > 0 && (
                <div className="min-w-0 overflow-x-auto rounded-xl border border-white/10 p-3" data-testid="classifica-girone">
                  <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--tbh-muted)]">Classifica · {p.aggiornataAlla ?? "aggiornamento da confermare"}</p>
                  <table className="w-full text-[12px] tabular-nums">
                    <thead>
                      <tr className="text-[10px] text-[var(--tbh-muted)]">
                        <th className="py-1 text-left font-semibold">#</th>
                        <th className="py-1 text-left font-semibold">Squadra</th>
                        <th className="py-1 text-right font-semibold">Pt</th>
                        <th className="py-1 text-right font-semibold">G</th>
                        <th className="py-1 text-right font-semibold">V</th>
                        <th className="py-1 text-right font-semibold">N</th>
                        <th className="py-1 text-right font-semibold">P</th>
                        <th className="py-1 text-right font-semibold">GF-GS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {p.classifica.map((r) => {
                        const mia = r.id === p.idSquadra;
                        return (
                          <tr key={r.id} className="border-t border-white/5" style={mia ? { color: "#000", background: GIALLO } : undefined}>
                            <td className="py-1 pl-1">{r.posizione}</td>
                            <td className="max-w-[160px] truncate py-1 font-semibold">{r.squadra}</td>
                            <td className="py-1 text-right font-black">{r.punti}</td>
                            <td className="py-1 text-right">{r.gare}</td>
                            <td className="py-1 text-right">{r.v}</td>
                            <td className="py-1 text-right">{r.n}</td>
                            <td className="py-1 text-right">{r.p}</td>
                            <td className="py-1 pr-1 text-right">
                              {r.f}-{r.s}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {!compatto && <FontiPartite fonte={p.fonte} tuttoCampo={p.tuttoCampo} />}
      {compatto && (
        <p className="text-[10px] text-[var(--tbh-muted)]">
          Fonte: Romagna Sport · letto il {quandoLetto(p.fonte.lettoIl)} · classifica completa nella pagina del canale.
        </p>
      )}
    </section>
  );
}

/** PALINSESTO CANALI SQUADRA — prossima partita di ogni canale, in ordine di calcio d'inizio. */
export function PalinsestoCanaliSquadra() {
  const q = usePalinsestoCanaliSquadra();
  const righe = useMemo(() => {
    const r = q.data?.righe ?? [];
    return [...r].sort((a, b) => {
      if (!a.prossima) return 1;
      if (!b.prossima) return -1;
      return chiave(a.prossima.data, a.prossima.ora).localeCompare(chiave(b.prossima.data, b.prossima.ora));
    });
  }, [q.data]);

  return (
    <section className="mx-auto max-w-[1200px] px-4 pb-10 md:px-8" data-testid="palinsesto-canali-squadra">
      <div className="rounded-3xl border border-white/10 bg-black/60 p-4 md:p-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-[10px] font-extrabold tracking-[0.3em] text-[var(--tbh-muted)]">ANTEPRIMA · DATI LETTI DAL VIVO</p>
            <h2 className="text-xl font-black uppercase tracking-[0.04em] md:text-2xl" style={{ color: GIALLO }}>
              Palinsesto partite dei canali squadra
            </h2>
          </div>
          {q.data && (
            <span className="inline-flex items-center gap-2 text-[11px] text-[var(--tbh-muted)]">
              Fonte
              <span className="inline-flex h-7 items-center rounded-md bg-white px-2">
                <img src={q.data.fonte.logo} alt={q.data.fonte.nome} className="h-full w-auto object-contain" />
              </span>
            </span>
          )}
        </div>
        {q.isLoading && <p className="mt-4 text-xs text-[var(--tbh-muted)]">Lettura dei calendari su Romagna Sport…</p>}
        {q.data && (
          <ul className="mt-4 divide-y divide-white/5">
            {righe.map((r) => (
              <li key={r.slug}>
                <Link to={`/check-web/canali/${r.slug}`} className="flex flex-wrap items-center gap-x-3 gap-y-1 py-2.5 hover:text-[var(--tbh-neon)]" data-testid="riga-palinsesto">
                  <span className="grid h-9 w-9 shrink-0 place-items-center overflow-hidden rounded-lg bg-white/5">
                    {r.logo ? <img src={r.logo.src} alt="" className="h-full w-full object-contain p-0.5" /> : <span className="text-[8px] text-[var(--tbh-muted)]">LOGO</span>}
                  </span>
                  <span className="w-44 shrink-0 text-[13px] font-bold">{r.nome.replace(/ Channel$/, "")}</span>
                  {r.prossima ? (
                    <>
                      <span className="w-36 shrink-0 text-[12px] tabular-nums" style={{ color: GIALLO }}>
                        {giornoTesto(r.prossima.data)} {r.prossima.ora ? `· ${r.prossima.ora}` : "· ora da conf."}
                      </span>
                      <span className="min-w-0 flex-1 truncate text-[13px]">
                        {r.prossima.casa} – {r.prossima.ospite}
                      </span>
                    </>
                  ) : (
                    <span className="min-w-0 flex-1 text-[12px] text-[var(--tbh-muted)]">{r.letto ? "Nessuna partita in programma: da confermare" : "Dato da confermare (fonte non raggiungibile)"}</span>
                  )}
                  <span className="shrink-0 text-[11px] text-[var(--tbh-muted)]">
                    {r.campionato}
                    {r.posizione ? ` · ${r.posizione}° (${r.punti} pt)` : ""}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
        <p className="mt-3 text-[10px] text-[var(--tbh-muted)]">
          Calendari e classifiche letti su Romagna Sport (aggiornati ogni 30 minuti). Orario presente solo per la giornata in corso; per le altre vale la data della giornata. Nessuna partita inserita a mano.
        </p>
      </div>
    </section>
  );
}
