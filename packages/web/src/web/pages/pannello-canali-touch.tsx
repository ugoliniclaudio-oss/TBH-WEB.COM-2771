import { useState } from "react";
import { Link } from "wouter";
import { ArrowLeft, BarChart3, CalendarPlus, Loader2, Lock, Megaphone, Radio, Trash2, Tv } from "lucide-react";
import { SbloccoAllestimento, useCodiceAllestimento } from "../components/media-slot";
import {
  useAggiungiSpazio,
  useAttivaSpazio,
  useEliminaSpazio,
  useImpostaModalita,
  useRendicontoCanali,
  useStatoCanaliAdmin,
  type NuovoSpazio,
} from "../queries/canali-touch";
import type { CanaleTouchId } from "../../api/data/touch-canali";
import { COLORE_TBH } from "../lib/identita-tbh";

/**
 * /allestimento/canali-touch — pannello riservato dei due canali TBH.
 * · interruttore «Palinsesto condiviso / Palinsesti separati»;
 * · calendario PROPRIO di ogni canale (fase 2): gli spazi vincono sul palinsesto
 *   generale solo con i palinsesti separati; il palinsesto generale non si tocca;
 * · rendiconti SEPARATI: avvii, passaggi per rubrica, spot per inserzionista, per giorno.
 */

const GIALLO = COLORE_TBH;
const CAMPO = "w-full rounded-xl border border-white/15 bg-black/50 px-3 py-2 text-sm outline-none focus:border-[var(--tbh-neon)]";
const NOMI: Record<CanaleTouchId, string> = { radio: "TOUCH RADIO", tv: "TOUCH TV" };

const VUOTO: NuovoSpazio = {
  canale: "radio",
  giorno: 1,
  data: null,
  ora: "20:00",
  durataMin: 30,
  rubrica: "touch-music",
  tipo: "video",
  titolo: "",
  descrizione: null,
  sorgente: "",
  link: null,
  inserzionista: null,
};

function errore(e: unknown) {
  return e instanceof Error ? e.message : "Operazione non riuscita.";
}

export default function PannelloCanaliTouchPage() {
  const { codice } = useCodiceAllestimento();
  const stato = useStatoCanaliAdmin(codice);
  const [da, setDa] = useState("");
  const [a, setA] = useState("");
  const rendiconto = useRendicontoCanali(codice, da || undefined, a || undefined);
  const modalita = useImpostaModalita();
  const aggiungi = useAggiungiSpazio();
  const attiva = useAttivaSpazio();
  const elimina = useEliminaSpazio();
  const [nuovo, setNuovo] = useState<NuovoSpazio>(VUOTO);
  const [ricorrente, setRicorrente] = useState(true);

  const set = <K extends keyof NuovoSpazio>(k: K, v: NuovoSpazio[K]) => setNuovo((n) => ({ ...n, [k]: v }));

  if (!codice) {
    return (
      <div className="mx-auto flex max-w-[900px] flex-col gap-5 px-4 py-10">
        <h1 className="tbh-display tbh-h2 flex items-center gap-3" style={{ color: GIALLO }}>
          <Lock className="h-6 w-6" /> Canali TOUCH RADIO · TOUCH TV
        </h1>
        <p className="text-sm text-[var(--tbh-muted)]">Area riservata: serve il codice di allestimento.</p>
        <SbloccoAllestimento />
      </div>
    );
  }

  const d = stato.data;
  const giorni = d?.giorni ?? {};

  return (
    <div className="mx-auto flex max-w-[1300px] flex-col gap-8 px-4 py-8 md:px-8" data-testid="pannello-canali-touch">
      <Link href="/allestimento" className="inline-flex w-fit items-center gap-1.5 text-sm text-[var(--tbh-muted)] hover:text-white">
        <ArrowLeft className="h-4 w-4" /> Pannello di allestimento
      </Link>
      <header className="flex flex-col gap-2">
        <h1 className="tbh-display tbh-h1 leading-[0.95]" style={{ color: GIALLO }}>
          TOUCH RADIO · TOUCH TV
        </h1>
        <p className="max-w-3xl text-sm text-[var(--tbh-muted)]">
          Due canali, un palinsesto generale. Oggi il palinsesto è condiviso; quando servirà, ogni canale avrà il suo
          calendario: basta aggiungere qui gli spazi e passare a «Palinsesti separati». Il palinsesto generale (fasce
          TOUCH MUSIC, dirette DM ON AIR, pause pubblicitarie) non viene mai cancellato.
        </p>
      </header>

      {stato.isError && <p className="text-sm text-[#ff8a8a]">{errore(stato.error)}</p>}
      {stato.isLoading && (
        <p className="inline-flex items-center gap-2 text-sm text-[var(--tbh-muted)]">
          <Loader2 className="h-4 w-4 animate-spin" /> Carico…
        </p>
      )}

      {d && (
        <>
          {/* INTERRUTTORE */}
          <section className="tbh-card flex flex-col gap-4 p-5" data-testid="interruttore-modalita">
            <h2 className="tbh-display tbh-h3">Modalità del palinsesto</h2>
            <div className="grid gap-2 sm:grid-cols-2">
              {(["condiviso", "separati"] as const).map((m) => {
                const attivo = d.modalita === m;
                return (
                  <button
                    key={m}
                    type="button"
                    disabled={modalita.isPending}
                    onClick={() => modalita.mutate({ codice, modalita: m })}
                    className={`flex flex-col items-start gap-1 rounded-xl border-2 p-4 text-left transition ${
                      attivo ? "border-[#d7ff00] bg-[#d7ff00]/10" : "border-white/10 hover:border-white/30"
                    }`}
                    aria-pressed={attivo}
                  >
                    <span className="text-base font-extrabold uppercase tracking-[0.06em] text-[var(--tbh-platinum)]">
                      {m === "condiviso" ? "Palinsesto condiviso" : "Palinsesti separati"}
                      {attivo && <span className="ml-2 text-xs" style={{ color: GIALLO }}>● ATTIVO</span>}
                    </span>
                    <span className="text-xs text-[var(--tbh-muted)]">
                      {m === "condiviso"
                        ? "TOUCH RADIO e TOUCH TV trasmettono la stessa scaletta del palinsesto generale."
                        : "Ogni canale trasmette i suoi spazi in calendario; fuori dagli spazi resta il palinsesto generale."}
                    </span>
                  </button>
                );
              })}
            </div>
            {modalita.isError && <p className="text-sm text-[#ff8a8a]">{errore(modalita.error)}</p>}
          </section>

          {/* CALENDARI */}
          <section className="grid gap-6 lg:grid-cols-2">
            {(["radio", "tv"] as const).map((c) => (
              <div key={c} className="tbh-card flex flex-col gap-3 p-5" data-testid={`calendario-${c}`}>
                <h2 className="tbh-display tbh-h3 flex items-center gap-2" style={{ color: GIALLO }}>
                  {c === "tv" ? <Tv className="h-5 w-5" /> : <Radio className="h-5 w-5" />} Calendario {NOMI[c]}
                </h2>
                {d.spazi[c].length === 0 ? (
                  <p className="text-sm text-[var(--tbh-muted)]">
                    Nessuno spazio proprio: il canale trasmette il palinsesto generale.
                  </p>
                ) : (
                  <ul className="flex flex-col divide-y divide-white/5 text-sm">
                    {d.spazi[c].map((s) => (
                      <li key={s.id} className={`flex flex-wrap items-center gap-3 py-2 ${s.attivo ? "" : "opacity-50"}`}>
                        <span className="tbh-dato w-36 shrink-0 text-[var(--tbh-muted)]">
                          {s.data ?? giorni[s.giorno ?? 0] ?? "—"} · {s.ora} · {s.durataMin}′
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block font-semibold text-[var(--tbh-platinum)]">{s.titolo}</span>
                          <span className="block text-xs text-[var(--tbh-muted)]">
                            {s.rubrica} · {s.tipo}
                            {s.inserzionista ? ` · ${s.inserzionista}` : ""}
                          </span>
                        </span>
                        <button
                          type="button"
                          onClick={() => attiva.mutate({ codice, id: s.id, attivo: !s.attivo })}
                          className="rounded-full border border-white/20 px-3 py-1 text-xs hover:border-white/50"
                        >
                          {s.attivo ? "Sospendi" : "Riattiva"}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (window.confirm(`Togliere «${s.titolo}» dal calendario di ${NOMI[c]}?`))
                              elimina.mutate({ codice, id: s.id });
                          }}
                          className="rounded-full border border-white/20 p-1.5 text-[var(--tbh-muted)] hover:border-[#ff8a8a] hover:text-[#ff8a8a]"
                          aria-label="Togli dal calendario"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </section>

          {/* NUOVO SPAZIO */}
          <section className="tbh-card flex flex-col gap-4 p-5">
            <h2 className="tbh-display tbh-h3 flex items-center gap-2">
              <CalendarPlus className="h-5 w-5" style={{ color: GIALLO }} /> Aggiungi uno spazio al calendario di un canale
            </h2>
            <form
              className="grid gap-3 md:grid-cols-4"
              onSubmit={(e) => {
                e.preventDefault();
                aggiungi.mutate(
                  {
                    codice,
                    spazio: {
                      ...nuovo,
                      giorno: ricorrente ? nuovo.giorno : null,
                      data: ricorrente ? null : nuovo.data,
                      descrizione: nuovo.descrizione || null,
                      link: nuovo.link || null,
                      inserzionista: nuovo.inserzionista || null,
                    },
                  },
                  { onSuccess: () => setNuovo({ ...VUOTO, canale: nuovo.canale }) },
                );
              }}
            >
              <label className="flex flex-col gap-1 text-xs text-[var(--tbh-muted)]">
                Canale
                <select className={CAMPO} value={nuovo.canale} onChange={(e) => set("canale", e.target.value as CanaleTouchId)}>
                  <option value="radio">TOUCH RADIO</option>
                  <option value="tv">TOUCH TV</option>
                </select>
              </label>
              <label className="flex flex-col gap-1 text-xs text-[var(--tbh-muted)]">
                Ripetizione
                <select className={CAMPO} value={ricorrente ? "s" : "d"} onChange={(e) => setRicorrente(e.target.value === "s")}>
                  <option value="s">Ogni settimana</option>
                  <option value="d">Data singola</option>
                </select>
              </label>
              {ricorrente ? (
                <label className="flex flex-col gap-1 text-xs text-[var(--tbh-muted)]">
                  Giorno
                  <select className={CAMPO} value={nuovo.giorno ?? 1} onChange={(e) => set("giorno", Number(e.target.value))}>
                    {[1, 2, 3, 4, 5, 6, 7].map((g) => (
                      <option key={g} value={g}>
                        {giorni[g] ?? g}
                      </option>
                    ))}
                  </select>
                </label>
              ) : (
                <label className="flex flex-col gap-1 text-xs text-[var(--tbh-muted)]">
                  Data
                  <input type="date" className={CAMPO} value={nuovo.data ?? ""} onChange={(e) => set("data", e.target.value || null)} required />
                </label>
              )}
              <div className="grid grid-cols-2 gap-3">
                <label className="flex flex-col gap-1 text-xs text-[var(--tbh-muted)]">
                  Ora (Roma)
                  <input type="time" className={CAMPO} value={nuovo.ora} onChange={(e) => set("ora", e.target.value)} required />
                </label>
                <label className="flex flex-col gap-1 text-xs text-[var(--tbh-muted)]">
                  Durata (min)
                  <input
                    type="number"
                    min={1}
                    className={CAMPO}
                    value={nuovo.durataMin}
                    onChange={(e) => set("durataMin", Number(e.target.value))}
                    required
                  />
                </label>
              </div>
              <label className="flex flex-col gap-1 text-xs text-[var(--tbh-muted)]">
                Rubrica
                <select className={CAMPO} value={nuovo.rubrica} onChange={(e) => set("rubrica", e.target.value as NuovoSpazio["rubrica"])}>
                  <option value="touch-music">TOUCH MUSIC</option>
                  <option value="dm-on-air">DM ON AIR</option>
                  <option value="dm-highlights">DM HIGHLIGHTS</option>
                  <option value="pubblicita">Pubblicità</option>
                </select>
              </label>
              <label className="flex flex-col gap-1 text-xs text-[var(--tbh-muted)]">
                Formato
                <select className={CAMPO} value={nuovo.tipo} onChange={(e) => set("tipo", e.target.value as NuovoSpazio["tipo"])}>
                  <option value="video">Video YouTube</option>
                  <option value="diretta">Diretta (embed)</option>
                  <option value="audio">Audio (file pubblico)</option>
                  <option value="spot">Spot (YouTube)</option>
                </select>
              </label>
              <label className="flex flex-col gap-1 text-xs text-[var(--tbh-muted)] md:col-span-2">
                Titolo
                <input className={CAMPO} value={nuovo.titolo} onChange={(e) => set("titolo", e.target.value)} required minLength={2} />
              </label>
              <label className="flex flex-col gap-1 text-xs text-[var(--tbh-muted)] md:col-span-2">
                Sorgente (ID o link YouTube, indirizzo embed o file audio)
                <input className={CAMPO} value={nuovo.sorgente} onChange={(e) => set("sorgente", e.target.value)} required minLength={3} />
              </label>
              <label className="flex flex-col gap-1 text-xs text-[var(--tbh-muted)] md:col-span-2">
                Link pubblico (facoltativo)
                <input className={CAMPO} value={nuovo.link ?? ""} onChange={(e) => set("link", e.target.value)} />
              </label>
              <label className="flex flex-col gap-1 text-xs text-[var(--tbh-muted)] md:col-span-2">
                Inserzionista {nuovo.tipo === "spot" ? "(obbligatorio per gli spot)" : "(facoltativo)"}
                <input
                  className={CAMPO}
                  value={nuovo.inserzionista ?? ""}
                  onChange={(e) => set("inserzionista", e.target.value)}
                  required={nuovo.tipo === "spot"}
                />
              </label>
              <label className="flex flex-col gap-1 text-xs text-[var(--tbh-muted)] md:col-span-4">
                Descrizione (facoltativa)
                <input className={CAMPO} value={nuovo.descrizione ?? ""} onChange={(e) => set("descrizione", e.target.value)} />
              </label>
              <div className="flex flex-wrap items-center gap-3 md:col-span-4">
                <button type="submit" disabled={aggiungi.isPending} className="tbh-neon-btn px-6 py-2.5 text-sm disabled:opacity-40">
                  {aggiungi.isPending ? "Salvo…" : "Aggiungi al calendario"}
                </button>
                {aggiungi.isError && <span className="text-sm text-[#ff8a8a]">{errore(aggiungi.error)}</span>}
                {aggiungi.isSuccess && <span className="text-sm" style={{ color: GIALLO }}>Spazio aggiunto.</span>}
              </div>
            </form>
          </section>
        </>
      )}

      {/* RENDICONTI SEPARATI */}
      <section className="flex flex-col gap-4" data-testid="rendiconti">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h2 className="tbh-display tbh-h2 flex items-center gap-3 leading-none" style={{ color: GIALLO }}>
            <BarChart3 className="h-6 w-6" /> RENDICONTI PER CANALE
          </h2>
          <div className="flex flex-wrap gap-2">
            <label className="flex flex-col gap-1 text-xs text-[var(--tbh-muted)]">
              Dal
              <input type="date" className={CAMPO} value={da} onChange={(e) => setDa(e.target.value)} />
            </label>
            <label className="flex flex-col gap-1 text-xs text-[var(--tbh-muted)]">
              Al
              <input type="date" className={CAMPO} value={a} onChange={(e) => setA(e.target.value)} />
            </label>
          </div>
        </div>
        {rendiconto.data && (
          <p className="text-xs text-[var(--tbh-muted)]">
            Periodo {rendiconto.data.da} → {rendiconto.data.a}. Solo eventi reali dei player (avvio = qualcuno ha premuto
            ASCOLTA/GUARDA; passaggio = contenuto andato in onda su un player acceso). Nessuna stima.
          </p>
        )}
        {rendiconto.isError && <p className="text-sm text-[#ff8a8a]">{errore(rendiconto.error)}</p>}
        <div className="grid gap-6 lg:grid-cols-2">
          {rendiconto.data?.canali.map((c) => (
            <div key={c.canale} className="tbh-card flex flex-col gap-4 p-5" data-testid={`rendiconto-${c.canale}`}>
              <h3 className="tbh-display tbh-h3 flex items-center gap-2" style={{ color: GIALLO }}>
                {c.canale === "tv" ? <Tv className="h-5 w-5" /> : <Radio className="h-5 w-5" />} {c.nome}
              </h3>
              <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {[
                  ["Avvii", c.avvii],
                  ["Sessioni", c.sessioni],
                  ["Passaggi", c.passaggi],
                  ["Spot andati in onda", c.spotTotali],
                ].map(([k, v]) => (
                  <div key={k} className="rounded-xl border border-white/10 p-3">
                    <dt className="text-[10px] uppercase tracking-[0.14em] text-[var(--tbh-muted)]">{k}</dt>
                    <dd className="tbh-dato text-2xl font-bold text-[var(--tbh-platinum)]">{v}</dd>
                  </div>
                ))}
              </dl>
              <div>
                <p className="mb-1 text-xs font-bold uppercase tracking-[0.14em] text-[var(--tbh-muted)]">Passaggi per rubrica</p>
                {c.perRubrica.length === 0 ? (
                  <p className="text-sm text-[var(--tbh-muted)]">Nessun passaggio registrato.</p>
                ) : (
                  <ul className="text-sm">
                    {c.perRubrica.map((r) => (
                      <li key={r.rubrica} className="flex justify-between py-0.5">
                        <span>{r.nome}</span>
                        <span className="tbh-dato">{r.n}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div>
                <p className="mb-1 flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.14em] text-[var(--tbh-muted)]">
                  <Megaphone className="h-3.5 w-3.5" /> Spot per inserzionista
                </p>
                {c.spot.length === 0 ? (
                  <p className="text-sm text-[var(--tbh-muted)]">Nessuno spot registrato.</p>
                ) : (
                  <ul className="text-sm">
                    {c.spot.map((s) => (
                      <li key={`${s.inserzionista}-${s.titolo}`} className="flex justify-between gap-3 py-0.5">
                        <span className="min-w-0 truncate">
                          {s.inserzionista ?? "—"} <span className="text-[var(--tbh-muted)]">· {s.titolo}</span>
                        </span>
                        <span className="tbh-dato shrink-0">
                          {s.n} <span className="text-[var(--tbh-muted)]">({s.sessioni} sess.)</span>
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div>
                <p className="mb-1 text-xs font-bold uppercase tracking-[0.14em] text-[var(--tbh-muted)]">Per giorno</p>
                {c.perGiorno.length === 0 ? (
                  <p className="text-sm text-[var(--tbh-muted)]">—</p>
                ) : (
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-[10px] uppercase tracking-[0.14em] text-[var(--tbh-muted)]">
                        <th className="py-1 font-semibold">Giorno</th>
                        <th className="py-1 text-right font-semibold">Avvii</th>
                        <th className="py-1 text-right font-semibold">Passaggi</th>
                        <th className="py-1 text-right font-semibold">Spot</th>
                      </tr>
                    </thead>
                    <tbody className="tbh-dato">
                      {c.perGiorno.map((g) => (
                        <tr key={g.giorno} className="border-t border-white/5">
                          <td className="py-1">{g.giorno}</td>
                          <td className="py-1 text-right">{g.avvii}</td>
                          <td className="py-1 text-right">{g.passaggi}</td>
                          <td className="py-1 text-right">{g.spot}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
