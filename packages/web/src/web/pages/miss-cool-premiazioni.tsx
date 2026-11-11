import { Link } from "wouter";
import { AlertTriangle, ArrowLeft, Award, Info } from "lucide-react";

import { useKitMissCool } from "../queries/miss-cool";
import { SezioneAmministrabile } from "../components/sezione-amministrabile";

/* ────────────────────────────────────────────────────────────────────────────
   TOUCH MISS COOL — LE 11 PREMIAZIONI.

   Claudio, 28/09/2026: «il KIT ha esattamente 11 premiazioni».
   1ª PLATINUM · 2ª DIAMOND · 3ª GOLD · dalla 4ª all'11ª le otto Team
   Ambassador DM. Dalla 12ª in poi: Official Candidate.

   REGOLA NON NEGOZIABILE DI QUESTA PAGINA: è la pagina dei premi, ed è proprio
   qui che sarebbe comodo scrivere una cifra. Non se ne scrive nessuna. Compensi,
   gettoni, premi ed esclusive restano «DA DEFINIRE» perché il cachet — parole di
   Claudio — si stabilisce in base all'evento e alla tipologia di evento. Quando
   la direzione delibererà gli importi, si cambia un solo file
   (api/data/miss-cool.ts) e questa pagina li mostra da sola.
   ──────────────────────────────────────────────────────────────────────────── */

const ORO = "#e2c37a";

function coloreFascia(fascia: string): string {
  if (fascia === "PLATINUM") return "#dfe4ea";
  if (fascia === "DIAMOND") return "#8fd4ff";
  if (fascia === "GOLD") return ORO;
  if (fascia.startsWith("SILVER")) return "#c2c8d0";
  return "#c98b5e";
}

function Voce({ etichetta, valore }: { etichetta: string; valore: string }) {
  const daDefinire = valore.trim().toUpperCase() === "DA DEFINIRE";
  return (
    <div className="flex items-start justify-between gap-3 border-t border-[var(--tbh-line)] py-2">
      <dt className="text-[12px] uppercase tracking-[0.1em] text-[var(--tbh-muted)]">
        {etichetta}
      </dt>
      <dd className="text-right text-[13px]">
        {daDefinire ? (
          <span className="rounded border border-dashed border-white/30 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-[0.12em] text-[var(--tbh-muted)]">
            da definire
          </span>
        ) : (
          <span className="font-bold text-white">{valore}</span>
        )}
      </dd>
    </div>
  );
}

export default function MissCoolPremiazioniPage() {
  const q = useKitMissCool();
  const d = q.data;

  if (q.isLoading) {
    return (
      <div className="mx-auto max-w-[1400px] px-4 py-16 md:px-8">
        <p className="tbh-body text-[var(--tbh-muted)]">Carico le premiazioni…</p>
      </div>
    );
  }

  if (q.isError || !d) {
    return (
      <div className="mx-auto max-w-[1400px] px-4 py-16 md:px-8">
        <h1 className="tbh-display tbh-h1">LE 11 PREMIAZIONI</h1>
        <p className="tbh-body mt-4 text-[var(--tbh-muted)]">
          Elenco non raggiungibile in questo momento. Nessun dato viene mostrato al suo posto.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1500px] px-4 py-8 md:px-8 md:py-12">
      <header className="tbh-rise flex flex-col gap-3">
        <Link
          to="/eventi/miss-cool"
          className="inline-flex w-fit items-center gap-2 text-[11px] font-extrabold uppercase tracking-[0.18em] text-[var(--tbh-muted)] transition hover:text-white"
        >
          <ArrowLeft size={14} aria-hidden /> Torna a Touch Miss Cool
        </Link>
        <h1 className="tbh-display tbh-h1">LE 11 PREMIAZIONI</h1>
        <p className="tbh-body max-w-4xl text-[var(--tbh-muted)]">
          Undici incarichi annuali assegnati alla finale dell'edizione {d.concorso.edizione}: una
          Platinum, una Diamond, una Gold e le otto Team Ambassador DM. Dalla dodicesima
          classificata in poi si entra fra le {d.officialCandidate.titolo}.
        </p>
      </header>

      {/* ── LA NOTA SUGLI IMPORTI, IN CIMA E NON IN FONDO ─────────────────── */}
      <section className="mt-6 rounded-2xl border border-dashed border-[var(--tbh-line)] bg-white/[0.03] p-5">
        <p
          className="flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-[0.18em]"
          style={{ color: ORO }}
        >
          <AlertTriangle size={15} aria-hidden /> Nessun importo è pubblicato
        </p>
        <p className="tbh-body mt-2 max-w-4xl text-[var(--tbh-muted)]">
          {d.concorso.notaCompensi}
        </p>
      </section>

      {/* ── LE FASCE ──────────────────────────────────────────────────────── */}
      <section className="mt-10">
        <h2 className="tbh-display tbh-h2">LE FASCE E I LIVELLI</h2>
        <div className="mt-4 overflow-x-auto rounded-2xl border border-[var(--tbh-line)]">
          <table className="w-full min-w-[620px] text-left text-sm">
            <thead className="bg-white/[0.04] text-[11px] uppercase tracking-[0.12em] text-[var(--tbh-muted)]">
              <tr>
                <th className="px-4 py-3">Fascia</th>
                <th className="px-4 py-3">Posizioni</th>
                <th className="px-4 py-3">Livello</th>
                <th className="px-4 py-3">Che cosa comporta</th>
              </tr>
            </thead>
            <tbody>
              {d.pianiLivelli.map((f) => (
                <tr key={f.fascia + f.posizioni} className="border-t border-[var(--tbh-line)]">
                  <td className="px-4 py-3">
                    <span
                      className="rounded-full px-2 py-0.5 text-[11px] font-extrabold uppercase tracking-[0.1em]"
                      style={{
                        background: `${coloreFascia(f.fascia)}22`,
                        color: coloreFascia(f.fascia),
                      }}
                    >
                      {f.fascia}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-bold">{f.posizioni}</td>
                  <td className="px-4 py-3">{f.livello}</td>
                  <td className="px-4 py-3 text-[var(--tbh-muted)]">{f.cosa}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── LE UNDICI SCHEDE ──────────────────────────────────────────────── */}
      <section className="mt-12">
        <h2 className="tbh-display tbh-h2">INCARICO PER INCARICO</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {d.classifica.map((p) => {
            const col = coloreFascia(p.fascia);
            return (
              <article
                key={p.posizione}
                className="rounded-2xl border border-[var(--tbh-line)] bg-white/[0.02] p-5"
                style={{ borderTop: `3px solid ${col}` }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="tbh-display text-3xl" style={{ color: col }}>
                      {p.posizione}ª
                    </p>
                    <p className="mt-1 text-[11px] uppercase tracking-[0.12em] text-[var(--tbh-muted)]">
                      Livello {p.livello}
                    </p>
                  </div>
                  <span
                    className="rounded-full px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.12em]"
                    style={{ background: `${col}22`, color: col }}
                  >
                    {p.fascia}
                  </span>
                </div>

                <h3 className="mt-3 text-base font-bold leading-snug">{p.incarico}</h3>
                <p className="mt-1 text-[13px] text-[var(--tbh-muted)]">{p.ruolo}</p>

                {p.squadraDm && (
                  <p className="mt-2 inline-block rounded border border-dashed border-white/25 px-2 py-0.5 text-[11px] text-[var(--tbh-muted)]">
                    Squadra DM: {p.squadraDm}
                  </p>
                )}

                {p.competenze.length > 0 && (
                  <ul className="mt-3 space-y-1.5">
                    {p.competenze.map((x) => (
                      <li key={x} className="flex items-start gap-2 text-[13px]">
                        <Award size={14} className="mt-0.5 shrink-0" style={{ color: col }} aria-hidden />
                        <span className="text-[var(--tbh-muted)]">{x}</span>
                      </li>
                    ))}
                  </ul>
                )}

                <dl className="mt-4">
                  <Voce etichetta="Compenso fisso" valore={p.compensoFisso} />
                  <Voce etichetta="Gettone di presenza" valore={p.gettonePresenza} />
                  <Voce etichetta="Premio" valore={p.premio} />
                  <Voce etichetta="Esclusiva" valore={p.esclusiva} />
                </dl>
              </article>
            );
          })}
        </div>
      </section>

      {/* ── DALLA 12ª IN POI ──────────────────────────────────────────────── */}
      <section className="mt-12 rounded-2xl border border-[var(--tbh-line)] bg-white/[0.02] p-5 md:p-6">
        <p className="text-[11px] font-extrabold uppercase tracking-[0.18em]" style={{ color: ORO }}>
          {d.officialCandidate.da}
        </p>
        <h2 className="tbh-display mt-1 text-2xl">{d.officialCandidate.titolo}</h2>
        <p className="tbh-body mt-2 max-w-4xl text-[var(--tbh-muted)]">
          {d.officialCandidate.spiegazione}
        </p>
        <ul className="mt-4 flex flex-wrap gap-2">
          {d.officialCandidate.cosaRicevono.map((x) => (
            <li key={x} className="rounded-full border border-[var(--tbh-line)] px-3 py-1.5 text-[13px]">
              {x}
            </li>
          ))}
        </ul>
        <p className="mt-4 flex items-start gap-2 text-[12px] text-[var(--tbh-muted)]">
          <Info size={15} className="mt-0.5 shrink-0" aria-hidden />
          {d.officialCandidate.notaPremio}
        </p>
      </section>

      <section className="mt-8 rounded-2xl border border-[var(--tbh-line)] bg-white/[0.02] p-5">
        <p className="tbh-body text-[var(--tbh-muted)]">{d.magazinePerTutte}</p>
      </section>

      <div className="mt-10 flex flex-wrap gap-2">
        <Link to="/eventi/miss-cool/adesione" className="tbh-neon-btn px-5 py-2.5 text-sm">
          Candidati al concorso
        </Link>
        <Link
          to="/eventi/miss-cool/regolamento"
          className="inline-flex items-center gap-2 rounded-full border border-[var(--tbh-line)] px-5 py-2.5 text-sm font-semibold transition hover:border-white/50"
        >
          Leggi il regolamento
        </Link>
      </div>
      <div className="mt-14 grid gap-12 border-t border-white/10 pt-10">
        <SezioneAmministrabile sezione="miss-cool-risultati" />
      </div>
    </div>
  );
}
