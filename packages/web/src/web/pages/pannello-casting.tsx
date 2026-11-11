import { useMemo, useState } from "react";
import { Link } from "wouter";
import {
  AlertTriangle,
  ArrowRight,
  ChevronRight,
  Clapperboard,
  Download,
  Inbox,
  Loader2,
  Plus,
  Save,
  Trash2,
  Users,
  X,
} from "lucide-react";

import { SbloccoAllestimento, useCodiceAllestimento } from "../components/media-slot";
import {
  useCandidatureCasting,
  useEliminaCasting,
  useQuadroCasting,
  useSalvaCasting,
  useStatoCandidatura,
  useStatoCasting,
  type RuoloCercato,
} from "../queries/casting";
import { NOMI_AMBITO_CASTING, NOMI_STATO_CASTING } from "../components/casting-tbh";
import type { AmbitoCasting, StatoCandidatura, StatoCasting } from "../../api/data/musica";

/* ────────────────────────────────────────────────────────────────────────────
   ADMIN → PRODUZIONI → MUSICA → ROAD TO 2030 → CASTING.

   Qui nasce e si chiude un casting, e qui si lavorano le candidature lungo la
   pipeline richiesta:

     RICEVUTE → DA VALUTARE → PRESELEZIONATE → CONTATTATE → CONVOCATE
              → SELEZIONATE → NON SELEZIONATE

   Tre regole che il pannello rispetta per costruzione:
   1. Un casting è agganciato all'ID del brano: la card del brano mostra da sola
      l'etichetta CASTING APERTO, e appena lo stato passa a chiuso l'etichetta
      sparisce. Non c'è un secondo interruttore da ricordarsi.
   2. Il compenso si scrive solo se esiste davvero. Lasciato vuoto, in pagina non
      compare nessuna riga sul compenso: meglio il silenzio di un numero inventato.
   3. I testi legali di privacy e liberatorie non li scrive il sito. Arrivano
      dall'editore: in candidatura restano spunte di consenso, non documenti.

   La pagina mostra dati personali delle persone candidate: passa dal codice di
   allestimento e non è indicizzabile.
   ──────────────────────────────────────────────────────────────────────────── */

const PIPELINE: { k: StatoCandidatura; nome: string }[] = [
  { k: "ricevuta", nome: "RICEVUTE" },
  { k: "da-valutare", nome: "DA VALUTARE" },
  { k: "preselezionata", nome: "PRESELEZIONATE" },
  { k: "contattata", nome: "CONTATTATE" },
  { k: "convocata", nome: "CONVOCATE" },
  { k: "selezionata", nome: "SELEZIONATE" },
  { k: "non-selezionata", nome: "NON SELEZIONATE" },
];

type Bozza = {
  id?: number;
  titolo: string;
  ambito: AmbitoCasting;
  branoId: string;
  stato: StatoCasting;
  titoloProgetto: string;
  descrizione: string;
  requisiti: string;
  location: string;
  periodo: string;
  scadenza: string;
  produzione: string;
  compenso: string;
  locandina: string;
  nota: string;
  ruoli: RuoloCercato[];
};

const BOZZA_VUOTA: Bozza = {
  titolo: "",
  ambito: "videoclip",
  branoId: "",
  stato: "aperto",
  titoloProgetto: "",
  descrizione: "",
  requisiti: "",
  location: "",
  periodo: "",
  scadenza: "",
  produzione: "",
  compenso: "",
  locandina: "",
  nota: "",
  ruoli: [],
};

function Campo({
  etichetta,
  children,
  nota,
}: {
  etichetta: string;
  children: React.ReactNode;
  nota?: string;
}) {
  return (
    <label className="block">
      <span className="tbh-body block text-[11px] font-extrabold uppercase tracking-[0.14em] text-[var(--tbh-muted)]">
        {etichetta}
      </span>
      <div className="mt-1.5">{children}</div>
      {nota && <span className="tbh-body mt-1 block text-[11px] text-[var(--tbh-muted)]">{nota}</span>}
    </label>
  );
}

const INPUT =
  "w-full rounded-xl border border-[var(--tbh-line)] bg-black/30 px-3 py-2.5 text-[14px] outline-none focus:border-[var(--tbh-neon)]";

export default function PannelloCastingPage() {
  const { codice } = useCodiceAllestimento();
  const q = useQuadroCasting(codice);
  const salva = useSalvaCasting();
  const cambiaStato = useStatoCasting();
  const elimina = useEliminaCasting();

  const [apertoId, setApertoId] = useState<number | null>(null);
  const [bozza, setBozza] = useState<Bozza | null>(null);
  const [daEliminare, setDaEliminare] = useState<number | null>(null);

  const d = q.data;
  const casting = useMemo(() => d?.casting ?? [], [d]);

  if (!codice) {
    return (
      <div className="mx-auto max-w-[900px] px-4 py-16 md:px-8">
        <h1 className="tbh-display tbh-h1">CASTING — ROAD TO 2030</h1>
        <p className="tbh-body mt-3 text-[var(--tbh-muted)]">
          Area riservata: mostra i dati personali di chi si candida. Serve il codice di
          allestimento.
        </p>
        <div className="mt-6">
          <SbloccoAllestimento />
        </div>
      </div>
    );
  }

  function nuovo() {
    setBozza({ ...BOZZA_VUOTA });
  }

  function modifica(c: (typeof casting)[number]) {
    setBozza({
      id: c.id,
      titolo: c.titolo,
      ambito: c.ambito as AmbitoCasting,
      branoId: c.brano?.id ?? "",
      stato: c.stato as StatoCasting,
      titoloProgetto: c.titoloProgetto ?? "",
      descrizione: c.descrizione ?? "",
      requisiti: c.requisiti ?? "",
      location: c.location ?? "",
      periodo: c.periodo ?? "",
      scadenza: c.scadenza ?? "",
      produzione: c.produzione ?? "",
      compenso: c.compenso ?? "",
      locandina: c.locandina ?? "",
      nota: c.nota ?? "",
      ruoli: c.ruoli.map((r) => ({ ...r })),
    });
  }

  function invia() {
    if (!bozza || !bozza.titolo.trim()) return;
    const vuoto = (s: string) => (s.trim() ? s.trim() : null);
    salva.mutate(
      {
        codice,
        id: bozza.id,
        titolo: bozza.titolo.trim(),
        ambito: bozza.ambito,
        branoId: vuoto(bozza.branoId),
        stato: bozza.stato,
        titoloProgetto: vuoto(bozza.titoloProgetto),
        descrizione: vuoto(bozza.descrizione),
        requisiti: vuoto(bozza.requisiti),
        location: vuoto(bozza.location),
        periodo: vuoto(bozza.periodo),
        scadenza: vuoto(bozza.scadenza),
        produzione: vuoto(bozza.produzione),
        compenso: vuoto(bozza.compenso),
        locandina: vuoto(bozza.locandina),
        nota: vuoto(bozza.nota),
        ruoli: bozza.ruoli.filter((r) => r.ruolo.trim().length > 0),
      },
      { onSuccess: () => setBozza(null) },
    );
  }

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-10 md:px-8 md:py-16">
      <Link
        href="/allestimento"
        className="mb-4 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-[var(--tbh-muted)] hover:text-[var(--tbh-neon)]"
      >
        ← Tutti i pannelli di allestimento
      </Link>

      {/* Il percorso richiesto, scritto come si legge nel pannello. */}
      <nav className="tbh-body mb-4 flex flex-wrap items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-[0.14em] text-[var(--tbh-muted)]">
        <span>Produzioni</span>
        <ChevronRight size={13} />
        <span>Musica</span>
        <ChevronRight size={13} />
        <span>Road to 2030</span>
        <ChevronRight size={13} />
        <span className="text-[#d9b8ff]">Casting</span>
      </nav>

      <header>
        <p className="tbh-body text-[11px] font-extrabold uppercase tracking-[0.22em] text-[#d9b8ff]">
          Area riservata · Back office dei casting
        </p>
        <h1 className="tbh-display tbh-h1 mt-2 flex items-center gap-3">
          <Clapperboard size={30} className="text-[#b26bff]" /> CASTING
        </h1>
        <p className="tbh-body mt-3 max-w-[78ch] text-[var(--tbh-muted)]">
          Ogni videoclip in preparazione può aprire il suo casting, agganciato all&apos;ID del
          brano. Da aperto, la card del brano mostra da sola l&apos;etichetta CASTING APERTO; da
          chiuso, l&apos;etichetta sparisce senza toccare nient&apos;altro. Le candidature arrivano
          solo dal modulo pubblico: qui si lavorano.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <button type="button" onClick={nuovo} className="tbh-neon-btn inline-flex items-center gap-2 px-5 py-2.5 text-sm">
            <Plus size={16} /> Nuovo casting
          </button>
          <Link
            to="/casting"
            className="inline-flex items-center gap-2 rounded-full border border-[var(--tbh-line)] px-5 py-2.5 text-sm font-semibold hover:border-[var(--tbh-neon)]"
          >
            Vedi la pagina pubblica <ArrowRight size={15} />
          </Link>
          <Link
            to="/tbh/produzioni/road-to-2030"
            className="inline-flex items-center gap-2 rounded-full border border-[var(--tbh-line)] px-5 py-2.5 text-sm font-semibold hover:border-[var(--tbh-neon)]"
          >
            Road to 2030 <ArrowRight size={15} />
          </Link>
        </div>
      </header>

      {q.isLoading && (
        <p className="tbh-body mt-8 inline-flex items-center gap-2 text-[var(--tbh-muted)]">
          <Loader2 className="size-4 animate-spin" /> Carico i casting…
        </p>
      )}

      {q.isError && (
        <p className="tbh-body mt-8 inline-flex items-center gap-2 text-[#ff8f8f]">
          <AlertTriangle size={16} /> Codice non valido o servizio non raggiungibile.
        </p>
      )}

      {/* ── IL MODULO DEL CASTING ───────────────────────────────────────── */}
      {bozza && d && (
        <section className="tbh-card mt-8 p-6 md:p-8">
          <div className="mb-5 flex items-start justify-between gap-4">
            <h2 className="tbh-display tbh-h2">
              {bozza.id ? `Modifica casting #${bozza.id}` : "Nuovo casting"}
            </h2>
            <button
              type="button"
              onClick={() => setBozza(null)}
              aria-label="Chiudi il modulo"
              className="rounded-full border border-[var(--tbh-line)] p-2 hover:border-[var(--tbh-neon)]"
            >
              <X size={16} />
            </button>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <Campo etichetta="Titolo del casting *">
              <input
                className={INPUT}
                value={bozza.titolo}
                onChange={(e) => setBozza({ ...bozza, titolo: e.target.value })}
                placeholder="Es. Casting videoclip — ballerine e figuranti"
              />
            </Campo>

            <Campo etichetta="Ambito">
              <select
                className={INPUT}
                value={bozza.ambito}
                onChange={(e) => setBozza({ ...bozza, ambito: e.target.value as AmbitoCasting })}
              >
                {d.ambiti.map((a) => (
                  <option key={a} value={a}>
                    {NOMI_AMBITO_CASTING[a] ?? a}
                  </option>
                ))}
              </select>
            </Campo>

            <Campo
              etichetta="Brano collegato"
              nota="L'aggancio all'ID del brano è ciò che fa comparire l'etichetta sulla sua card."
            >
              <select
                className={INPUT}
                value={bozza.branoId}
                onChange={(e) => setBozza({ ...bozza, branoId: e.target.value })}
              >
                <option value="">— nessun brano —</option>
                {d.brani.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.titolo}
                  </option>
                ))}
              </select>
            </Campo>

            <Campo etichetta="Stato">
              <select
                className={INPUT}
                value={bozza.stato}
                onChange={(e) => setBozza({ ...bozza, stato: e.target.value as StatoCasting })}
              >
                {d.stati.map((s) => (
                  <option key={s} value={s}>
                    {NOMI_STATO_CASTING[s] ?? s}
                  </option>
                ))}
              </select>
            </Campo>

            <Campo etichetta="Titolo del progetto">
              <input
                className={INPUT}
                value={bozza.titoloProgetto}
                onChange={(e) => setBozza({ ...bozza, titoloProgetto: e.target.value })}
              />
            </Campo>

            <Campo etichetta="Produzione">
              <input
                className={INPUT}
                value={bozza.produzione}
                onChange={(e) => setBozza({ ...bozza, produzione: e.target.value })}
              />
            </Campo>

            <Campo etichetta="Location">
              <input
                className={INPUT}
                value={bozza.location}
                onChange={(e) => setBozza({ ...bozza, location: e.target.value })}
              />
            </Campo>

            <Campo etichetta="Periodo delle riprese">
              <input
                className={INPUT}
                value={bozza.periodo}
                onChange={(e) => setBozza({ ...bozza, periodo: e.target.value })}
              />
            </Campo>

            <Campo etichetta="Scadenza candidature">
              <input
                className={INPUT}
                value={bozza.scadenza}
                onChange={(e) => setBozza({ ...bozza, scadenza: e.target.value })}
                placeholder="Es. 31/10/2026"
              />
            </Campo>

            <Campo
              etichetta="Compenso"
              nota="Lascia vuoto se non è definito: in pagina non comparirà nessuna riga sul compenso."
            >
              <input
                className={INPUT}
                value={bozza.compenso}
                onChange={(e) => setBozza({ ...bozza, compenso: e.target.value })}
              />
            </Campo>

            <Campo etichetta="Locandina (indirizzo immagine)" nota="Vuota, la card usa la cover del brano.">
              <input
                className={INPUT}
                value={bozza.locandina}
                onChange={(e) => setBozza({ ...bozza, locandina: e.target.value })}
              />
            </Campo>
          </div>

          <div className="mt-5 grid gap-5">
            <Campo etichetta="Descrizione">
              <textarea
                className={`${INPUT} min-h-[100px]`}
                value={bozza.descrizione}
                onChange={(e) => setBozza({ ...bozza, descrizione: e.target.value })}
              />
            </Campo>
            <Campo etichetta="Requisiti">
              <textarea
                className={`${INPUT} min-h-[90px]`}
                value={bozza.requisiti}
                onChange={(e) => setBozza({ ...bozza, requisiti: e.target.value })}
              />
            </Campo>
            <Campo etichetta="Nota interna" nota="Non compare in pagina.">
              <textarea
                className={`${INPUT} min-h-[70px]`}
                value={bozza.nota}
                onChange={(e) => setBozza({ ...bozza, nota: e.target.value })}
              />
            </Campo>
          </div>

          {/* I RUOLI CERCATI */}
          <div className="mt-7 border-t border-white/10 pt-6">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
              <h3 className="tbh-display tbh-h3">Ruoli cercati</h3>
              <button
                type="button"
                onClick={() =>
                  setBozza({
                    ...bozza,
                    ruoli: [...bozza.ruoli, { ruolo: "", categoria: "ballerini", quantita: "", nota: "" }],
                  })
                }
                className="inline-flex items-center gap-2 rounded-full border border-[var(--tbh-line)] px-4 py-2 text-[12px] font-extrabold uppercase tracking-[0.1em] hover:border-[var(--tbh-neon)]"
              >
                <Plus size={14} /> Aggiungi ruolo
              </button>
            </div>

            {bozza.ruoli.length === 0 ? (
              <p className="tbh-body text-sm text-[var(--tbh-muted)]">
                Nessun ruolo indicato. Senza ruoli il casting resta valido, ma la scheda pubblica
                chiederà solo il ruolo a testo libero.
              </p>
            ) : (
              <div className="grid gap-3">
                {bozza.ruoli.map((r, i) => (
                  <div
                    key={i}
                    className="grid items-end gap-3 rounded-xl border border-[var(--tbh-line)] p-3 md:grid-cols-[2fr_1.4fr_0.7fr_2fr_auto]"
                  >
                    <Campo etichetta="Ruolo">
                      <input
                        className={INPUT}
                        value={r.ruolo}
                        onChange={(e) => {
                          const ruoli = [...bozza.ruoli];
                          ruoli[i] = { ...r, ruolo: e.target.value };
                          setBozza({ ...bozza, ruoli });
                        }}
                      />
                    </Campo>
                    <Campo etichetta="Categoria">
                      <select
                        className={INPUT}
                        value={r.categoria}
                        onChange={(e) => {
                          const ruoli = [...bozza.ruoli];
                          ruoli[i] = { ...r, categoria: e.target.value };
                          setBozza({ ...bozza, ruoli });
                        }}
                      >
                        {d.categorie.map((c) => (
                          <option key={c.k} value={c.k}>
                            {c.nome}
                          </option>
                        ))}
                      </select>
                    </Campo>
                    <Campo etichetta="Quanti">
                      <input
                        className={INPUT}
                        value={r.quantita}
                        onChange={(e) => {
                          const ruoli = [...bozza.ruoli];
                          ruoli[i] = { ...r, quantita: e.target.value };
                          setBozza({ ...bozza, ruoli });
                        }}
                      />
                    </Campo>
                    <Campo etichetta="Nota">
                      <input
                        className={INPUT}
                        value={r.nota}
                        onChange={(e) => {
                          const ruoli = [...bozza.ruoli];
                          ruoli[i] = { ...r, nota: e.target.value };
                          setBozza({ ...bozza, ruoli });
                        }}
                      />
                    </Campo>
                    <button
                      type="button"
                      onClick={() =>
                        setBozza({ ...bozza, ruoli: bozza.ruoli.filter((_, j) => j !== i) })
                      }
                      aria-label="Togli il ruolo"
                      className="mb-0.5 rounded-xl border border-[var(--tbh-line)] p-2.5 hover:border-[#ff8f8f] hover:text-[#ff8f8f]"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-7 flex flex-wrap items-center gap-3 border-t border-white/10 pt-6">
            <button
              type="button"
              onClick={invia}
              disabled={!bozza.titolo.trim() || salva.isPending}
              className="tbh-neon-btn inline-flex items-center gap-2 px-6 py-3 text-sm disabled:opacity-40"
            >
              {salva.isPending ? <Loader2 className="size-4 animate-spin" /> : <Save size={16} />}
              {bozza.id ? "Salva le modifiche" : "Crea il casting"}
            </button>
            {!bozza.titolo.trim() && (
              <span className="tbh-body text-[12px] text-[var(--tbh-muted)]">
                Il titolo è l&apos;unico campo obbligatorio.
              </span>
            )}
            {salva.isError && (
              <span className="tbh-body inline-flex items-center gap-2 text-[12px] text-[#ff8f8f]">
                <AlertTriangle size={14} /> {(salva.error as Error).message}
              </span>
            )}
          </div>
        </section>
      )}

      {/* ── L'ELENCO DEI CASTING ────────────────────────────────────────── */}
      {d && (
        <section className="mt-10">
          <h2 className="tbh-display tbh-h2 mb-4">
            I casting registrati{" "}
            <span className="tbh-body text-[14px] text-[var(--tbh-muted)]">({casting.length})</span>
          </h2>

          {casting.length === 0 ? (
            <div className="tbh-card border-dashed p-6">
              <p className="tbh-body text-sm text-[var(--tbh-muted)]">
                Nessun casting registrato. Il primo lo apri con <b>Nuovo casting</b>: finché non
                esiste, la sezione pubblica dichiara che non ci sono selezioni aperte e non mostra
                nulla di inventato.
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              {casting.map((c) => (
                <article key={c.id} className="tbh-card p-5">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="min-w-[260px] grow">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="tbh-body rounded-full border border-white/15 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.12em] text-[var(--tbh-muted)]">
                          #{c.id}
                        </span>
                        <span className="tbh-body rounded-full border border-[#b26bff] bg-[rgba(178,107,255,0.12)] px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.12em] text-[#d9b8ff]">
                          {NOMI_STATO_CASTING[c.stato] ?? c.stato}
                        </span>
                        <span className="tbh-body text-[11px] uppercase tracking-[0.12em] text-[var(--tbh-gold)]">
                          {NOMI_AMBITO_CASTING[c.ambito] ?? c.ambito}
                        </span>
                      </div>
                      <h3 className="tbh-display tbh-h3 mt-2">{c.titolo}</h3>
                      {c.brano && (
                        <p className="tbh-body mt-1 text-[13px] text-[var(--tbh-muted)]">
                          Brano: <b>{c.brano.titolo}</b> · {c.brano.artista}
                        </p>
                      )}
                      <p className="tbh-body mt-1 text-[12px] text-[var(--tbh-muted)]">
                        /casting/{c.slug}
                        {c.scadenza ? ` · scadenza ${c.scadenza}` : ""}
                      </p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <span className="tbh-body rounded-xl border border-[var(--tbh-line)] px-3 py-1.5 text-[12px]">
                          <Inbox size={13} className="mr-1 inline" /> {c.candidature} candidature
                        </span>
                        <span className="tbh-body rounded-xl border border-[var(--tbh-line)] px-3 py-1.5 text-[12px]">
                          da valutare: <b>{c.daValutare}</b>
                        </span>
                        <span className="tbh-body rounded-xl border border-[var(--tbh-line)] px-3 py-1.5 text-[12px]">
                          selezionate: <b>{c.selezionate}</b>
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col items-stretch gap-2">
                      <select
                        className={INPUT}
                        value={c.stato}
                        onChange={(e) =>
                          cambiaStato.mutate({
                            codice,
                            id: c.id,
                            stato: e.target.value as StatoCasting,
                          })
                        }
                      >
                        {d.stati.map((s) => (
                          <option key={s} value={s}>
                            {NOMI_STATO_CASTING[s] ?? s}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={() => setApertoId(apertoId === c.id ? null : c.id)}
                        className="inline-flex items-center justify-center gap-2 rounded-full border border-[#b26bff] px-4 py-2 text-[12px] font-extrabold uppercase tracking-[0.1em] text-[#d9b8ff] hover:bg-[rgba(178,107,255,0.12)]"
                      >
                        <Users size={14} /> {apertoId === c.id ? "Chiudi" : "Candidature"}
                      </button>
                      <button
                        type="button"
                        onClick={() => modifica(c)}
                        className="rounded-full border border-[var(--tbh-line)] px-4 py-2 text-[12px] font-extrabold uppercase tracking-[0.1em] hover:border-[var(--tbh-neon)]"
                      >
                        Modifica
                      </button>
                      {daEliminare === c.id ? (
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              elimina.mutate(
                                { codice, id: c.id },
                                { onSuccess: () => setDaEliminare(null) },
                              )
                            }
                            className="grow rounded-full border border-[#ff8f8f] px-3 py-2 text-[11px] font-extrabold uppercase tracking-[0.1em] text-[#ff8f8f]"
                          >
                            Confermo
                          </button>
                          <button
                            type="button"
                            onClick={() => setDaEliminare(null)}
                            className="rounded-full border border-[var(--tbh-line)] px-3 py-2 text-[11px] font-extrabold uppercase tracking-[0.1em]"
                          >
                            No
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setDaEliminare(c.id)}
                          className="inline-flex items-center justify-center gap-2 rounded-full border border-[var(--tbh-line)] px-4 py-2 text-[12px] font-extrabold uppercase tracking-[0.1em] text-[var(--tbh-muted)] hover:border-[#ff8f8f] hover:text-[#ff8f8f]"
                        >
                          <Trash2 size={14} /> Elimina
                        </button>
                      )}
                    </div>
                  </div>

                  {apertoId === c.id && (
                    <PipelineCandidature codice={codice} castingId={c.id} titolo={c.titolo} />
                  )}
                </article>
              ))}
            </div>
          )}
        </section>
      )}

      <p className="tbh-body mt-12 max-w-[78ch] border-t border-white/10 pt-6 text-[12px] text-[var(--tbh-muted)]">
        I testi integrali di informativa privacy e liberatorie non li scrive questo sito: arrivano
        dall&apos;editore. Nel modulo pubblico la persona spunta il consenso, e la spunta viene
        registrata con data e ora — ma finché i documenti ufficiali non sono consegnati non c&apos;è
        nessun testo legale pubblicato.
      </p>
    </div>
  );
}

/* ── LA PIPELINE DELLE CANDIDATURE ────────────────────────────────────────
   RICEVUTE → DA VALUTARE → PRESELEZIONATE → CONTATTATE → CONVOCATE
            → SELEZIONATE → NON SELEZIONATE                                */

function PipelineCandidature({
  codice,
  castingId,
  titolo,
}: {
  codice: string;
  castingId: number;
  titolo: string;
}) {
  const q = useCandidatureCasting(codice, castingId);
  const sposta = useStatoCandidatura();
  const [colonna, setColonna] = useState<StatoCandidatura | "tutte">("tutte");
  const [note, setNote] = useState<Record<number, string>>({});

  const tutte = q.data?.candidature ?? [];
  const perStato = q.data?.perStato ?? {};
  const elenco = colonna === "tutte" ? tutte : tutte.filter((c) => c.stato === colonna);

  return (
    <div className="mt-6 border-t border-white/10 pt-6">
      <h4 className="tbh-display tbh-h3 mb-1">Candidature · {titolo}</h4>
      <p className="tbh-body mb-4 text-[12px] text-[var(--tbh-muted)]">
        Le candidature nascono solo dal modulo pubblico. Qui si spostano lungo la pipeline.
      </p>

      <div className="mb-5 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setColonna("tutte")}
          className={`tbh-body rounded-full px-3.5 py-1.5 text-[11px] font-extrabold uppercase tracking-[0.1em] ${
            colonna === "tutte"
              ? "bg-[var(--tbh-neon)] text-black"
              : "border border-[var(--tbh-line)] text-[var(--tbh-muted)] hover:border-[var(--tbh-neon)]"
          }`}
        >
          Tutte ({tutte.length})
        </button>
        {PIPELINE.map((p) => (
          <button
            key={p.k}
            type="button"
            onClick={() => setColonna(p.k)}
            className={`tbh-body rounded-full px-3.5 py-1.5 text-[11px] font-extrabold uppercase tracking-[0.1em] ${
              colonna === p.k
                ? "bg-[var(--tbh-neon)] text-black"
                : "border border-[var(--tbh-line)] text-[var(--tbh-muted)] hover:border-[var(--tbh-neon)]"
            }`}
          >
            {p.nome} ({perStato[p.k] ?? 0})
          </button>
        ))}
      </div>

      {q.isLoading ? (
        <p className="tbh-body inline-flex items-center gap-2 text-sm text-[var(--tbh-muted)]">
          <Loader2 className="size-4 animate-spin" /> Carico le candidature…
        </p>
      ) : tutte.length === 0 ? (
        <p className="tbh-body text-sm text-[var(--tbh-muted)]">
          Nessuna candidatura ricevuta per questo casting.
        </p>
      ) : elenco.length === 0 ? (
        <p className="tbh-body text-sm text-[var(--tbh-muted)]">
          Nessuna candidatura in questo passaggio.
        </p>
      ) : (
        <div className="grid gap-4">
          {elenco.map((c) => (
            <div key={c.id} className="rounded-2xl border border-[var(--tbh-line)] p-4">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-[240px] grow">
                  <p className="tbh-display text-[18px]">
                    #{c.id} · {c.nome} {c.cognome}
                  </p>
                  <p className="tbh-body mt-1 text-[13px] text-[var(--tbh-muted)]">
                    {c.ruolo}
                    {c.categoria ? ` · ${c.categoria}` : ""}
                    {c.citta ? ` · ${c.citta}` : ""}
                    {c.dataNascita ? ` · nata/o il ${c.dataNascita}` : ""}
                  </p>
                  <p className="tbh-body mt-1 text-[13px]">
                    {c.telefono && <span className="mr-3">{c.telefono}</span>}
                    {c.email && <span>{c.email}</span>}
                  </p>
                  {c.presentazione && (
                    <p className="tbh-body mt-2 max-w-[70ch] text-[13px] text-[var(--tbh-muted)]">
                      {c.presentazione}
                    </p>
                  )}
                  {c.esperienze && (
                    <p className="tbh-body mt-2 max-w-[70ch] text-[13px] text-[var(--tbh-muted)]">
                      <b>Esperienze:</b> {c.esperienze}
                    </p>
                  )}
                  <div className="mt-2 flex flex-wrap gap-3 text-[12px]">
                    {c.social && <span className="text-[var(--tbh-muted)]">{c.social}</span>}
                    {c.linkShowreel && (
                      <a
                        href={c.linkShowreel}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[var(--tbh-neon)] font-semibold"
                      >
                        Showreel →
                      </a>
                    )}
                  </div>
                </div>

                <div className="flex min-w-[220px] flex-col gap-2">
                  <select
                    className={INPUT}
                    value={c.stato}
                    onChange={(e) =>
                      sposta.mutate({
                        codice,
                        id: c.id,
                        stato: e.target.value as StatoCandidatura,
                      })
                    }
                  >
                    {PIPELINE.map((p) => (
                      <option key={p.k} value={p.k}>
                        {p.nome}
                      </option>
                    ))}
                  </select>
                  <textarea
                    className={`${INPUT} min-h-[64px]`}
                    placeholder="Note interne"
                    value={note[c.id] ?? c.noteInterne ?? ""}
                    onChange={(e) => setNote({ ...note, [c.id]: e.target.value })}
                  />
                  <button
                    type="button"
                    onClick={() =>
                      sposta.mutate({ codice, id: c.id, noteInterne: note[c.id] ?? "" })
                    }
                    disabled={note[c.id] === undefined}
                    className="inline-flex items-center justify-center gap-2 rounded-full border border-[var(--tbh-line)] px-4 py-2 text-[11px] font-extrabold uppercase tracking-[0.1em] hover:border-[var(--tbh-neon)] disabled:opacity-40"
                  >
                    <Save size={13} /> Salva la nota
                  </button>
                </div>
              </div>

              {/* I file davvero caricati con la candidatura. */}
              <div className="mt-4 border-t border-white/10 pt-3">
                <p className="tbh-body mb-2 text-[11px] font-extrabold uppercase tracking-[0.12em] text-[var(--tbh-muted)]">
                  Materiale allegato ({c.allegati.length})
                </p>
                {c.allegati.length === 0 ? (
                  <p className="tbh-body text-[12px] text-[var(--tbh-muted)]">
                    Nessun file allegato: la candidatura è arrivata comunque.
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {c.allegati.map((a) => (
                      <a
                        key={a.id}
                        href={a.url ?? "#"}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 rounded-xl border border-[var(--tbh-line)] px-3 py-2 text-[12px] hover:border-[var(--tbh-neon)]"
                      >
                        <Download size={13} /> {a.campo}: {a.nome}
                      </a>
                    ))}
                  </div>
                )}
              </div>

              {/* Le spunte di consenso, con data e ora. Nessun testo legale: quelli arrivano dall'editore. */}
              <div className="mt-3 flex flex-wrap gap-2">
                {Object.keys(c.consensi).length === 0 ? (
                  <span className="tbh-body text-[12px] text-[#ff8f8f]">
                    Nessun consenso registrato.
                  </span>
                ) : (
                  Object.keys(c.consensi).map((k) => (
                    <span
                      key={String(k)}
                      className="tbh-body rounded-full bg-[var(--tbh-neon)]/12 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.1em] text-[var(--tbh-neon)]"
                    >
                      {String(k)}
                    </span>
                  ))
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
