import { useMemo, useState } from "react";
import { Link } from "wouter";
import {
  AlertTriangle,
  CheckCircle2,
  Inbox,
  Loader2,
  Save,
  ShieldCheck,
} from "lucide-react";

import MaterialeCandidatura from "../components/materiale-candidatura";
import { SbloccoAllestimento, useCodiceAllestimento } from "../components/media-slot";
import { useAggiornaCandidatura, useCandidatureMissCool } from "../queries/miss-cool";

/* ────────────────────────────────────────────────────────────────────────────
   ADMIN → CANDIDATURE TOUCH MISS COOL.

   Il back office del Kit (slide 14) è un flusso di otto passaggi tracciabili:
   INVIO → VERIFICA 18+ → DOCUMENTI → CONSENSI → APPROVAZIONE → PUBBLICAZIONE
   → VOTO → FINALE. Questo pannello fa esattamente quello e niente di più.

   Due cose che il pannello NON fa, per costruzione:
   1. Non crea candidature. Le candidature nascono solo dal modulo pubblico,
      compilato da una persona reale: qui si lavorano, non si inventano.
   2. Non pubblica una scheda senza consenso B. Il pulsante di pubblicazione è
      spento e dichiara il motivo quando il consenso manca — il filtro è anche
      lato servizio, ma qui si vede prima di sbagliare.

   Dati personali: questa pagina mostra telefono, e-mail e data di nascita
   delle candidate. È riservata e passa dal codice di allestimento.
   ──────────────────────────────────────────────────────────────────────────── */

const STATI = [
  "inviata",
  "verifica-18",
  "documenti",
  "consensi",
  "approvata",
  "pubblicata",
  "esclusa",
  "ritirata",
] as const;

type Stato = (typeof STATI)[number];

/** Slug pubblico suggerito dal nome: minuscole, numeri e trattini. */
function slugDa(nome: string): string {
  return nome
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

function Spia({ attivo, testo }: { attivo: boolean; testo: string }) {
  return (
    <span
      className={`tbh-body rounded-full px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-[0.1em] ${
        attivo
          ? "bg-[var(--tbh-neon)]/15 text-[var(--tbh-neon)]"
          : "bg-white/8 text-[var(--tbh-muted)] line-through"
      }`}
    >
      {testo}
    </span>
  );
}

export default function PannelloMissCoolPage() {
  const { codice } = useCodiceAllestimento();
  const q = useCandidatureMissCool(codice);
  const aggiorna = useAggiornaCandidatura();

  const [apertaId, setApertaId] = useState<number | null>(null);
  const [bozza, setBozza] = useState<{
    stato?: Stato;
    numeroGara: string;
    slug: string;
    fotoUfficiale: string;
    posizioneFinale: string;
    squadraDm: string;
    operatore: string;
    notaInterna: string;
  }>({
    numeroGara: "",
    slug: "",
    fotoUfficiale: "",
    posizioneFinale: "",
    squadraDm: "",
    operatore: "",
    notaInterna: "",
  });
  const [filtro, setFiltro] = useState<"tutte" | Stato>("tutte");

  /* Gli hook stanno tutti prima di qualunque uscita anticipata: quando il
     codice passa da assente a presente il componente non si rimonta, e un
     useMemo dichiarato dopo un `return` cambierebbe l'ordine degli hook. */
  const d = q.data;
  const tutte = useMemo(() => d?.candidature ?? [], [d]);
  const conteggi = useMemo(() => {
    const m: Record<string, number> = {};
    for (const c of tutte) m[c.stato] = (m[c.stato] ?? 0) + 1;
    return m;
  }, [tutte]);

  if (!codice) {
    return (
      <div className="mx-auto max-w-[900px] px-4 py-16 md:px-8">
        <h1 className="tbh-display tbh-h1">CANDIDATURE TOUCH MISS COOL</h1>
        <p className="tbh-body mt-3 text-[var(--tbh-muted)]">
          Area riservata: mostra dati personali delle candidate. Serve il codice di
          allestimento.
        </p>
        <div className="mt-6">
          <SbloccoAllestimento />
        </div>
      </div>
    );
  }

  const elenco = filtro === "tutte" ? tutte : tutte.filter((c) => c.stato === filtro);

  function apri(c: (typeof tutte)[number]) {
    setApertaId(c.id);
    setBozza({
      stato: c.stato as Stato,
      numeroGara: c.numeroGara !== null ? String(c.numeroGara) : "",
      slug: c.slug ?? slugDa(c.nomeArtistico?.trim() || c.nome),
      fotoUfficiale: c.fotoUfficiale ?? "",
      posizioneFinale: c.posizioneFinale !== null ? String(c.posizioneFinale) : "",
      squadraDm: c.squadraDm ?? "",
      operatore: c.operatore ?? "",
      notaInterna: c.notaInterna ?? "",
    });
  }

  function salva(id: number, consensoB: number) {
    const numero = bozza.numeroGara.trim() ? Number(bozza.numeroGara.trim()) : undefined;
    const posizione = bozza.posizioneFinale.trim()
      ? Number(bozza.posizioneFinale.trim())
      : undefined;
    // Sbarramento locale: pubblicare senza consenso B non si fa.
    if (bozza.stato === "pubblicata" && consensoB !== 1) return;
    aggiorna.mutate({
      codice,
      id,
      stato: bozza.stato,
      numeroGara: Number.isFinite(numero as number) ? (numero as number) : undefined,
      slug: bozza.slug.trim() || undefined,
      fotoUfficiale: bozza.fotoUfficiale.trim() || undefined,
      posizioneFinale: Number.isFinite(posizione as number) ? (posizione as number) : undefined,
      squadraDm: bozza.squadraDm.trim() || undefined,
      operatore: bozza.operatore.trim() || undefined,
      notaInterna: bozza.notaInterna.trim() || undefined,
    });
  }

  return (
    <div className="mx-auto max-w-[1200px] px-4 py-10 md:px-8 md:py-16">
      {/* 28/09/2026 - ritorno al pannello unico di allestimento (audit BLOCCO 1):
          prima questo pannello era un'isola, si apriva solo scrivendo l'indirizzo. */}
      <Link
        href="/allestimento"
        className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-[var(--tbh-muted)] hover:text-[var(--tbh-neon)] mb-4"
      >
        ← Tutti i pannelli di allestimento
      </Link>
      <header>
        <p className="tbh-body text-[11px] font-extrabold uppercase tracking-[0.22em] text-[var(--tbh-neon)]">
          Area riservata · Back office del Kit 2027
        </p>
        <h1 className="tbh-display tbh-h1 mt-2">CANDIDATURE TOUCH MISS COOL</h1>
        <p className="tbh-body mt-3 max-w-[75ch] text-[var(--tbh-muted)]">
          Le candidature arrivano solo dal modulo pubblico. Qui si avanzano lungo gli otto
          passaggi del flusso: ogni modifica registra stato, data e operatore.
        </p>
      </header>

      {/* Il flusso, come promemoria dell'ordine dei passaggi. */}
      {d?.flusso && (
        <ol className="mt-8 flex flex-wrap gap-2">
          {d.flusso.map((p) => (
            <li
              key={p.n}
              className="tbh-body inline-flex items-center gap-2 rounded-full border border-white/12 px-3 py-1.5 text-[11px] uppercase tracking-[0.12em] text-[var(--tbh-muted)]"
            >
              <span className="tbh-display text-[12px] text-[var(--tbh-neon)]">
                {String(p.n).padStart(2, "0")}
              </span>
              {p.titolo}
            </li>
          ))}
        </ol>
      )}

      {q.isLoading && (
        <p className="tbh-body mt-8 inline-flex items-center gap-2 text-[var(--tbh-muted)]">
          <Loader2 className="size-4 animate-spin" /> Carico le candidature…
        </p>
      )}

      {d && !d.configurato && (
        <div className="mt-8 flex items-start gap-3 rounded-2xl border border-[#ffcf7a]/40 bg-[#ffcf7a]/[0.08] p-5">
          <AlertTriangle className="mt-0.5 size-5 shrink-0 text-[#ffcf7a]" />
          <p className="tbh-body text-[13px] text-[var(--tbh-fg)]">
            Il codice di allestimento non è configurato sul server: il pannello non può
            leggere le candidature finché non viene impostato nelle variabili d'ambiente.
          </p>
        </div>
      )}

      {d && d.configurato && !d.valido && (
        <div className="mt-8 flex items-start gap-3 rounded-2xl border border-[#ff8a8a]/40 bg-[#ff8a8a]/[0.08] p-5">
          <AlertTriangle className="mt-0.5 size-5 shrink-0 text-[#ff8a8a]" />
          <div>
            <p className="tbh-body text-[13px] text-[var(--tbh-fg)]">
              Codice di allestimento errato su questo dispositivo: nessuna candidatura
              viene mostrata.
            </p>
            <div className="mt-4">
              <SbloccoAllestimento />
            </div>
          </div>
        </div>
      )}

      {d?.valido && (
        <>
          {/* Filtri per stato, con i numeri veri. */}
          <div className="mt-10 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setFiltro("tutte")}
              className={`tbh-body rounded-full border px-3 py-1.5 text-[12px] transition ${
                filtro === "tutte"
                  ? "border-[var(--tbh-neon)] text-[var(--tbh-neon)]"
                  : "border-white/12 text-[var(--tbh-muted)] hover:border-white/30"
              }`}
            >
              Tutte · {tutte.length}
            </button>
            {STATI.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setFiltro(s)}
                className={`tbh-body rounded-full border px-3 py-1.5 text-[12px] transition ${
                  filtro === s
                    ? "border-[var(--tbh-neon)] text-[var(--tbh-neon)]"
                    : "border-white/12 text-[var(--tbh-muted)] hover:border-white/30"
                }`}
              >
                {s} · {conteggi[s] ?? 0}
              </button>
            ))}
          </div>

          {tutte.length === 0 ? (
            <div className="mt-10 rounded-3xl border border-dashed border-white/20 bg-white/[0.02] p-10 text-center">
              <Inbox className="mx-auto size-10 text-[var(--tbh-muted)]" />
              <p className="tbh-body mt-4 text-[15px] font-extrabold uppercase tracking-[0.1em] text-[var(--tbh-fg)]">
                Nessuna candidatura ricevuta
              </p>
              <p className="tbh-body mx-auto mt-3 max-w-[60ch] text-[var(--tbh-muted)]">
                Il registro è vuoto perché nessuno ha ancora inviato il modulo. Secondo la
                roadmap del Kit le candidature si aprono a ottobre 2026. Il pannello non
                crea righe di prova.
              </p>
              <Link
                href="/eventi/miss-cool/adesione"
                className="tbh-body mt-6 inline-block text-[13px] text-[var(--tbh-neon)]"
              >
                Apri il modulo pubblico
              </Link>
            </div>
          ) : (
            <section className="mt-8 space-y-3">
              {elenco.map((c) => {
                const aperta = apertaId === c.id;
                const bloccoPubblicazione = bozza.stato === "pubblicata" && c.consensoB !== 1;
                return (
                  <article
                    key={c.id}
                    className={`rounded-2xl border bg-white/[0.02] transition ${
                      aperta ? "border-[var(--tbh-neon)]/40" : "border-white/10"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => (aperta ? setApertaId(null) : apri(c))}
                      className="flex w-full flex-wrap items-center gap-3 px-5 py-4 text-left"
                    >
                      <span className="tbh-display text-[16px] text-[var(--tbh-neon)]">
                        #{c.id}
                      </span>
                      <span className="tbh-body flex-1 text-[15px] font-extrabold text-[var(--tbh-fg)]">
                        {c.nomeArtistico?.trim() || c.nome}
                      </span>
                      <span className="tbh-body text-[12px] text-[var(--tbh-muted)]">
                        {c.comune}
                      </span>
                      <span className="tbh-body rounded-full border border-white/12 px-2.5 py-1 text-[11px] uppercase tracking-[0.1em] text-[var(--tbh-fg)]">
                        {c.stato}
                      </span>
                      <span className="tbh-body text-[11px] uppercase tracking-[0.12em] text-[var(--tbh-muted)]">
                        {aperta ? "chiudi" : "apri"}
                      </span>
                    </button>

                    {aperta && (
                      <div className="space-y-6 border-t border-white/10 px-5 py-5">
                        {/* Dati della domanda: si leggono, non si riscrivono da qui. */}
                        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                          {[
                            ["Nome e cognome", c.nome],
                            ["Nome artistico", c.nomeArtistico ?? "—"],
                            ["Data di nascita", c.dataNascita],
                            ["Comune / Provincia", c.comune],
                            ["Telefono", c.telefono],
                            ["E-mail", c.email],
                            ["Percorso", c.percorso],
                            ["Professione / Studi", c.professione ?? "—"],
                            ["Trasferte", c.trasferte ?? "—"],
                          ].map(([k, v]) => (
                            <div key={k} className="rounded-xl border border-white/8 p-3">
                              <p className="tbh-body text-[10px] font-extrabold uppercase tracking-[0.12em] text-[var(--tbh-muted)]">
                                {k}
                              </p>
                              <p className="tbh-body mt-1 text-[13px] text-[var(--tbh-fg)]">{v}</p>
                            </div>
                          ))}
                        </div>

                        {(c.esperienze || c.ruoli || c.presentazione) && (
                          <div className="space-y-3">
                            {c.esperienze && (
                              <p className="tbh-body text-[13px] text-[var(--tbh-muted)]">
                                <span className="font-extrabold text-[var(--tbh-fg)]">
                                  Esperienze:{" "}
                                </span>
                                {c.esperienze}
                              </p>
                            )}
                            {c.ruoli && (
                              <p className="tbh-body text-[13px] text-[var(--tbh-muted)]">
                                <span className="font-extrabold text-[var(--tbh-fg)]">
                                  Ruoli di interesse:{" "}
                                </span>
                                {c.ruoli}
                              </p>
                            )}
                            {c.presentazione && (
                              <p className="tbh-body text-[13px] text-[var(--tbh-muted)]">
                                <span className="font-extrabold text-[var(--tbh-fg)]">
                                  Presentazione:{" "}
                                </span>
                                {c.presentazione}
                              </p>
                            )}
                          </div>
                        )}

                        {/* Dichiarazioni e consensi: spie, non caselle modificabili. */}
                        <div>
                          <p className="tbh-body text-[11px] font-extrabold uppercase tracking-[0.14em] text-[var(--tbh-fg)]">
                            Dichiarazioni e consensi ricevuti
                          </p>
                          <div className="mt-2 flex flex-wrap gap-2">
                            <Spia attivo={c.dichiaraMaggiorenne === 1} testo="18+ dichiarato" />
                            <Spia attivo={c.accettaRegolamento === 1} testo="regolamento" />
                            <Spia attivo={c.lettaPrivacy === 1} testo="privacy letta" />
                            <Spia attivo={c.consensoA === 1} testo="A candidatura" />
                            <Spia attivo={c.consensoB === 1} testo="B pubblicazione" />
                            <Spia attivo={c.consensoC === 1} testo="C foto/video" />
                            <Spia attivo={c.consensoD === 1} testo="D social" />
                            <Spia attivo={c.consensoE === 1} testo="E portfolio" />
                            <Spia attivo={c.consensoF === 1} testo="F comunicazioni" />
                          </div>
                          <p className="tbh-body mt-2 text-[12px] text-[var(--tbh-muted)]">
                            I consensi si modificano solo su richiesta della candidata, con
                            traccia scritta: non si cambiano da questo pannello.
                          </p>
                        </div>

                        {/* Avanzamento del flusso. */}
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                          <div>
                            <label
                              htmlFor={`stato-${c.id}`}
                              className="tbh-body block text-[11px] font-extrabold uppercase tracking-[0.12em] text-[var(--tbh-fg)]"
                            >
                              Stato
                            </label>
                            <select
                              id={`stato-${c.id}`}
                              value={bozza.stato ?? c.stato}
                              onChange={(e) =>
                                setBozza((p) => ({ ...p, stato: e.target.value as Stato }))
                              }
                              className="tbh-body mt-2 w-full rounded-xl border border-white/15 bg-black/40 px-3 py-2 text-[13px] text-[var(--tbh-fg)]"
                            >
                              {STATI.map((s) => (
                                <option key={s} value={s}>
                                  {s}
                                </option>
                              ))}
                            </select>
                          </div>
                          {[
                            ["numeroGara", "Numero di gara"],
                            ["slug", "Slug pubblico"],
                            ["fotoUfficiale", "Foto ufficiale (URL)"],
                            ["posizioneFinale", "Posizione finale (1–11)"],
                            ["squadraDm", "Squadra DM"],
                            ["operatore", "Operatore"],
                          ].map(([k, etichetta]) => (
                            <div key={k}>
                              <label
                                htmlFor={`${k}-${c.id}`}
                                className="tbh-body block text-[11px] font-extrabold uppercase tracking-[0.12em] text-[var(--tbh-fg)]"
                              >
                                {etichetta}
                              </label>
                              <input
                                id={`${k}-${c.id}`}
                                value={(bozza as Record<string, string>)[k] ?? ""}
                                onChange={(e) =>
                                  setBozza((p) => ({ ...p, [k]: e.target.value }))
                                }
                                className="tbh-body mt-2 w-full rounded-xl border border-white/15 bg-black/40 px-3 py-2 text-[13px] text-[var(--tbh-fg)] outline-none focus:border-[var(--tbh-neon)]"
                              />
                            </div>
                          ))}
                          <div className="sm:col-span-2 lg:col-span-3">
                            <label
                              htmlFor={`nota-${c.id}`}
                              className="tbh-body block text-[11px] font-extrabold uppercase tracking-[0.12em] text-[var(--tbh-fg)]"
                            >
                              Nota interna
                            </label>
                            <textarea
                              id={`nota-${c.id}`}
                              rows={2}
                              value={bozza.notaInterna}
                              onChange={(e) =>
                                setBozza((p) => ({ ...p, notaInterna: e.target.value }))
                              }
                              className="tbh-body mt-2 w-full rounded-xl border border-white/15 bg-black/40 px-3 py-2 text-[13px] text-[var(--tbh-fg)] outline-none focus:border-[var(--tbh-neon)]"
                            />
                          </div>
                        </div>

                        {/* Foto, portfolio e allegati arrivati dal modulo di candidatura. */}
                        <MaterialeCandidatura candidaturaId={c.id} codice={codice} />

                        {bloccoPubblicazione && (
                          <div className="flex items-start gap-3 rounded-xl border border-[#ff8a8a]/40 bg-[#ff8a8a]/[0.08] p-4">
                            <AlertTriangle className="mt-0.5 size-5 shrink-0 text-[#ff8a8a]" />
                            <p className="tbh-body text-[13px] text-[var(--tbh-fg)]">
                              Questa candidata non ha dato il consenso B: la scheda non può
                              essere pubblicata sul sito. Scegliere un altro stato.
                            </p>
                          </div>
                        )}

                        <div className="flex flex-wrap items-center gap-4">
                          <button
                            type="button"
                            onClick={() => salva(c.id, c.consensoB)}
                            disabled={aggiorna.isPending || bloccoPubblicazione}
                            className={`tbh-body inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-[13px] font-extrabold uppercase tracking-[0.08em] transition ${
                              aggiorna.isPending || bloccoPubblicazione
                                ? "cursor-not-allowed bg-white/10 text-[var(--tbh-muted)]"
                                : "bg-[var(--tbh-neon)] text-black hover:brightness-110"
                            }`}
                          >
                            {aggiorna.isPending ? (
                              <Loader2 className="size-4 animate-spin" />
                            ) : (
                              <Save className="size-4" />
                            )}
                            Salva avanzamento
                          </button>
                          {aggiorna.isSuccess && aggiorna.data?.candidatura?.id === c.id && (
                            <span className="tbh-body inline-flex items-center gap-2 text-[13px] text-[var(--tbh-neon)]">
                              <CheckCircle2 className="size-4" /> Salvato.
                            </span>
                          )}
                          {aggiorna.isError && (
                            <span className="tbh-body text-[13px] text-[#ff8a8a]">
                              {(aggiorna.error as Error).message}
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </article>
                );
              })}
            </section>
          )}

          <p className="tbh-body mt-10 inline-flex items-start gap-2 text-[12px] text-[var(--tbh-muted)]">
            <ShieldCheck className="mt-0.5 size-4 shrink-0" />
            Pagina riservata: contiene dati personali. Non condividere schermate fuori
            dall'organizzazione.
          </p>
        </>
      )}
    </div>
  );
}
