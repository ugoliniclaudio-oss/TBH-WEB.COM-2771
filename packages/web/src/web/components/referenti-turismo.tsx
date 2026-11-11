/** «Turismo ed eventi — Referenti istituzionali»: directory con ricerca e filtri. */
import { useMemo, useState } from "react";
import { CalendarDays, ExternalLink, Landmark, Mail, Phone, Search } from "lucide-react";
import { REFERENTI_TURISMO } from "../lib/referenti-turismo";
import { corrisponde, dataIt } from "../lib/fonti-lavoro";

const sel =
  "w-full min-w-0 rounded-xl border border-[var(--tbh-line)] bg-black px-3 py-2 text-sm focus:border-[var(--tbh-neon)] outline-none";
const uniq = (v: string[]) => [...new Set(v)].sort((a, b) => a.localeCompare(b, "it"));

export function ReferentiTurismo() {
  const [q, setQ] = useState("");
  const [regione, setRegione] = useState("");
  const [provincia, setProvincia] = useState("");
  const [comune, setComune] = useState("");

  const regioni = uniq(REFERENTI_TURISMO.map((r) => r.regione));
  const province = uniq(REFERENTI_TURISMO.filter((r) => !regione || r.regione === regione).map((r) => r.provincia));
  const comuni = uniq(
    REFERENTI_TURISMO.filter((r) => (!regione || r.regione === regione) && (!provincia || r.provincia === provincia)).map((r) => r.comune),
  );

  const lista = useMemo(
    () =>
      REFERENTI_TURISMO.filter(
        (r) =>
          (!regione || r.regione === regione) &&
          (!provincia || r.provincia === provincia) &&
          (!comune || r.comune === comune) &&
          corrisponde(`${r.ente} ${r.comune} ${r.referente} ${r.ruolo} ${r.delega}`, q),
      ),
    [q, regione, provincia, comune],
  );

  return (
    <section id="referenti-turismo" className="mb-14" aria-labelledby="titolo-referenti">
      <p className="text-xs tracking-[0.25em] uppercase mb-2 text-[var(--tbh-gold)]">Fiere e Sagre · enti pubblici</p>
      <h2 id="titolo-referenti" className="tbh-display tbh-h2 flex items-center gap-3">
        <Landmark size={26} className="text-[var(--tbh-gold)]" /> Turismo ed eventi — Referenti istituzionali
      </h2>
      <p className="text-sm text-[var(--tbh-muted)] max-w-4xl mt-2">
        Assessori e uffici con deleghe a turismo, eventi, cultura, fiere e manifestazioni, presi dalle pagine ufficiali dei
        Comuni. Censimento progressivo: si parte da Rimini, Riccione e Cattolica, poi il resto della costa adriatica.
      </p>

      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-[1fr_180px_140px_180px] mt-5 mb-3">
        <label className="relative min-w-0 sm:col-span-2 lg:col-span-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--tbh-muted)]" />
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Cerca comune, referente, delega (es. eventi)…"
            aria-label="Cerca referenti"
            className="w-full rounded-xl border border-[var(--tbh-line)] bg-black pl-9 pr-3 py-2.5 text-sm outline-none focus:border-[var(--tbh-neon)]"
          />
        </label>
        <select aria-label="Regione" value={regione} onChange={(e) => { setRegione(e.target.value); setProvincia(""); setComune(""); }} className={sel}>
          <option value="">Tutte le regioni</option>
          {regioni.map((r) => <option key={r}>{r}</option>)}
        </select>
        <select aria-label="Provincia" value={provincia} onChange={(e) => { setProvincia(e.target.value); setComune(""); }} className={sel}>
          <option value="">Province</option>
          {province.map((p) => <option key={p}>{p}</option>)}
        </select>
        <select aria-label="Comune" value={comune} onChange={(e) => setComune(e.target.value)} className={sel}>
          <option value="">Tutti i comuni</option>
          {comuni.map((c) => <option key={c}>{c}</option>)}
        </select>
      </div>
      <p className="text-xs text-[var(--tbh-muted)] mb-4" aria-live="polite">
        <b className="text-white">{lista.length}</b> schede
      </p>

      {lista.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[var(--tbh-line)] p-8 text-center text-sm text-[var(--tbh-muted)]">
          Nessun referente censito per questa ricerca.
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {lista.map((r) => (
            <article key={r.id} className="rounded-2xl border border-[var(--tbh-line)] bg-[var(--tbh-surface)] p-5 flex flex-col min-w-0">
              <p className="text-[10px] uppercase tracking-widest text-[var(--tbh-gold)]">
                {r.ente} · {r.provincia}
              </p>
              <h3 className="tbh-display text-2xl leading-tight mt-1">{r.referente}</h3>
              <p className="text-xs text-white/80">{r.ruolo}</p>
              <p className="text-sm mt-2"><span className="text-[var(--tbh-muted)]">Deleghe:</span> {r.delega}</p>
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs mt-3">
                {r.email && (
                  <a href={`mailto:${r.email}`} className="inline-flex items-center gap-1 hover:text-[var(--tbh-neon)] [overflow-wrap:anywhere]"><Mail size={12} /> {r.email}</a>
                )}
                {r.telefono && <span className="inline-flex items-center gap-1"><Phone size={12} /> {r.telefono}</span>}
              </div>
              {r.ufficio && (
                <p className="text-xs text-[var(--tbh-muted)] mt-2">
                  Ufficio: <span className="text-white/85">{r.ufficio.nome}</span>
                  {r.ufficio.telefono && <> · {r.ufficio.telefono}</>}
                  {r.ufficio.email && <> · {r.ufficio.email}</>}
                </p>
              )}
              <div className="mt-auto pt-4 flex flex-wrap gap-2">
                <a href={r.pagina} target="_blank" rel="noreferrer" className="tbh-neon-btn px-4 py-2 text-xs inline-flex items-center gap-1.5">
                  Apri pagina ufficiale <ExternalLink size={12} />
                </a>
                {(r.ufficio?.email ?? r.email) && (
                  <a
                    href={`mailto:${r.ufficio?.email ?? r.email}`}
                    className="rounded-full border border-[var(--tbh-line)] px-4 py-2 text-xs font-semibold inline-flex items-center gap-1.5 hover:border-[var(--tbh-neon)]"
                  >
                    <Mail size={12} /> Contatta ufficio
                  </a>
                )}
                {r.calendario && (
                  <a
                    href={r.calendario}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-full border border-[var(--tbh-gold)] text-[var(--tbh-gold)] px-4 py-2 text-xs font-semibold inline-flex items-center gap-1.5 hover:border-[var(--tbh-neon)] hover:text-[var(--tbh-neon)]"
                  >
                    <CalendarDays size={12} /> Calendario eventi
                  </a>
                )}
              </div>
              <p className="text-[10px] text-[var(--tbh-muted)] mt-3">Verificato il {dataIt(r.verificato)} sulla pagina ufficiale</p>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
