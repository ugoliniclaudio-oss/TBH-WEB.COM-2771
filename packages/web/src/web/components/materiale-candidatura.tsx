import { useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Download,
  Eye,
  FileText,
  Image as ImageIcon,
  Loader2,
  Lock,
  Plus,
  RefreshCw,
  Trash2,
  X,
} from "lucide-react";

import {
  useCaricaMedia,
  useEliminaMedia,
  useMediaPrefisso,
  useSostituisciMedia,
} from "../queries/media";

/* ────────────────────────────────────────────────────────────────────────────
   MATERIALE DI UNA CANDIDATURA — lato pannello riservato.

   Ordine di Claudio del 28/09/2026 (punto 7): «nel pannello, per ogni
   candidatura, devono comparire i comandi VISUALIZZA, SCARICA, SOSTITUISCI,
   AGGIUNGI, ELIMINA sui file ricevuti».

   Da dove arrivano i file: la candidata li carica dal modulo pubblico con una
   pratica di caricamento; all'invio il server li sposta sugli slot definitivi
   `missCool:candidatura:<id>:<campo>`. Da quel momento sono normali materiali
   dell'archivio TBH, quindi qui si riusano gli stessi comandi del Media Manager
   (nessun secondo sistema di caricamento).

   Privacy (punto 8): portfolio e allegati nascono `riservato = 1` e non escono
   mai dalle letture pubbliche. Qui si vedono perché la chiamata passa il codice
   di allestimento. Sono segnati PRIVATO e non hanno il comando «pubblica»:
   restano documenti della segreteria, non materiale da sito.
   ──────────────────────────────────────────────────────────────────────────── */

/** I quattro campi previsti dal modulo, nell'ordine in cui la segreteria li guarda. */
const CAMPI: {
  campo: string;
  etichetta: string;
  tipo: "immagine" | "documento";
  max: number;
  riservato: boolean;
}[] = [
  { campo: "foto-principale", etichetta: "Foto principale", tipo: "immagine", max: 1, riservato: false },
  { campo: "altre-foto", etichetta: "Altre foto", tipo: "immagine", max: 8, riservato: false },
  { campo: "portfolio", etichetta: "Portfolio / documenti", tipo: "documento", max: 5, riservato: true },
  { campo: "allegati", etichetta: "Allegati riservati", tipo: "documento", max: 5, riservato: true },
];

/** Una riga dell'archivio così come la restituisce il Media Manager. */
type Riga = NonNullable<ReturnType<typeof useMediaPrefisso>["data"]>["items"][number];

/** Il nome del file: il Media Manager lo conserva nel titolo, altrimenti si legge dalla chiave. */
function nomeDi(r: Riga) {
  return r.titolo ?? r.chiave.split("/").pop() ?? "file";
}

function pesoLeggibile(n: number | null) {
  if (!n) return "";
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${Math.round(n / 1024)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1).replace(".", ",")} MB`;
}

function eImmagine(r: Riga) {
  return (r.mime ?? "").startsWith("image/") || /\.(jpg|jpeg|png|webp|gif)$/i.test(nomeDi(r));
}

/** Anteprima a tutto schermo: una foto si guarda, un PDF si sfoglia. */
function Anteprima({ file, onChiudi }: { file: Riga; onChiudi: () => void }) {
  const nome = nomeDi(file);
  return (
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center bg-black/90 p-4"
      onClick={onChiudi}
      role="presentation"
    >
      <button
        type="button"
        onClick={onChiudi}
        aria-label="Chiudi l'anteprima"
        className="absolute right-4 top-4 rounded-full border border-white/20 bg-black/60 p-2 text-white transition hover:border-white/60"
      >
        <X className="size-5" />
      </button>
      <div
        className="max-h-full w-full max-w-[1100px] overflow-hidden rounded-2xl border border-white/15 bg-black"
        onClick={(e) => e.stopPropagation()}
        role="presentation"
      >
        {eImmagine(file) ? (
          <img
            src={file.url ?? ""}
            alt={nome}
            className="max-h-[82vh] w-full object-contain"
          />
        ) : (
          <iframe src={file.url ?? ""} title={nome} className="h-[82vh] w-full bg-white" />
        )}
        <div className="flex items-center justify-between gap-3 border-t border-white/10 px-4 py-3">
          <p className="tbh-body truncate text-[13px] text-white/80">{nome}</p>
          <a
            href={file.url ?? ""}
            download={nome}
            target="_blank"
            rel="noreferrer"
            className="tbh-body inline-flex shrink-0 items-center gap-2 rounded-lg border border-white/20 px-3 py-1.5 text-[12px] font-extrabold text-white transition hover:border-[var(--tbh-neon)]"
          >
            <Download className="size-3.5" /> Scarica
          </a>
        </div>
      </div>
    </div>
  );
}

/**
 * Pannello del materiale di una candidatura.
 * `codice` è il codice di allestimento già sbloccato dalla pagina: senza, qui non
 * si vedrebbe nulla (ed è giusto: sono dati personali).
 */
export default function MaterialeCandidatura({
  candidaturaId,
  codice,
}: {
  candidaturaId: number;
  codice: string;
}) {
  const prefisso = `missCool:candidatura:${candidaturaId}`;
  const q = useMediaPrefisso(prefisso, codice);
  const carica = useCaricaMedia();
  const sostituisci = useSostituisciMedia();
  const elimina = useEliminaMedia();

  const [anteprima, setAnteprima] = useState<Riga | null>(null);
  const [errore, setErrore] = useState<string | null>(null);
  const [inCorso, setInCorso] = useState<string | null>(null);
  const [fatto, setFatto] = useState<string | null>(null);
  /** Quale riga si sta sostituendo: il selettore file è uno per campo. */
  const daSostituire = useRef<{ id: number; slot: string } | null>(null);
  const selettori = useRef<Record<string, HTMLInputElement | null>>({});

  const righe: Riga[] = q.data?.items ?? [];

  /** I file divisi per campo, così ogni riquadro mostra solo i suoi. */
  const perCampo = useMemo(() => {
    const m: Record<string, Riga[]> = {};
    for (const c of CAMPI) m[c.campo] = [];
    for (const r of righe) {
      const campo = r.slot.slice(prefisso.length + 1);
      if (m[campo]) m[campo].push(r);
    }
    return m;
  }, [righe, prefisso]);

  const totale = righe.length;

  async function scegli(campo: string, tipo: "immagine" | "documento", file: File | null) {
    if (!file) return;
    setErrore(null);
    setFatto(null);
    setInCorso(campo);
    const slot = `${prefisso}:${campo}`;
    const sostituzione = daSostituire.current;
    daSostituire.current = null;
    try {
      if (sostituzione) {
        await sostituisci.mutateAsync({
          codice,
          id: sostituzione.id,
          slot: sostituzione.slot,
          file,
          tipo,
        });
      } else {
        await carica.mutateAsync({ codice, slot, file, tipo, stato: "bozza" });
      }
      await q.refetch();
      setFatto(campo);
    } catch (e: unknown) {
      setErrore(
        e instanceof Error ? e.message : "Operazione non riuscita. Riprovare.",
      );
    } finally {
      setInCorso(null);
    }
  }

  async function rimuovi(r: Riga) {
    setErrore(null);
    setFatto(null);
    const campo = r.slot.slice(prefisso.length + 1);
    setInCorso(campo);
    try {
      const esito = await elimina.mutateAsync({ codice, id: r.id });
      // Il Media Manager avvisa se il file è usato anche altrove: qui si conferma
      // solo dopo aver mostrato dove.
      if (esito && esito.ok === false) {
        const dove = (esito.usato ?? []).map((u) => u.slot).join(", ");
        if (
          window.confirm(
            `Questo file è usato anche in: ${dove}.\nEliminarlo comunque? Sparirà anche da lì.`,
          )
        ) {
          await elimina.mutateAsync({ codice, id: r.id, forza: true });
        }
      }
      await q.refetch();
    } catch (e: unknown) {
      setErrore(e instanceof Error ? e.message : "Eliminazione non riuscita.");
    } finally {
      setInCorso(null);
    }
  }

  if (q.isLoading) {
    return (
      <p className="tbh-body inline-flex items-center gap-2 text-[13px] text-[var(--tbh-muted)]">
        <Loader2 className="size-4 animate-spin" /> Cerco il materiale ricevuto…
      </p>
    );
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4 md:p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h4 className="tbh-body text-[11px] font-extrabold uppercase tracking-[0.14em] text-[var(--tbh-fg)]">
          Materiale ricevuto
        </h4>
        <p className="tbh-body text-[12px] text-[var(--tbh-muted)]">
          {totale === 0
            ? "Nessun file: la candidata non ha caricato materiale dal modulo."
            : `${totale} file allegati alla candidatura.`}
        </p>
      </div>

      {errore && (
        <div className="mt-3 flex items-start gap-2 rounded-xl border border-[#ff8a8a]/40 bg-[#ff8a8a]/[0.08] p-3">
          <AlertTriangle className="mt-0.5 size-4 shrink-0 text-[#ff8a8a]" />
          <p className="tbh-body text-[12px] text-[var(--tbh-fg)]">⚠ ERRORE — {errore}</p>
        </div>
      )}

      <div className="mt-4 space-y-4">
        {CAMPI.map((c) => {
          const file = perCampo[c.campo] ?? [];
          const pieno = file.length >= c.max;
          const lavorando = inCorso === c.campo;
          const formati = c.tipo === "immagine" ? ".jpg,.jpeg,.png,.webp" : ".pdf,.jpg,.jpeg,.png,.webp";
          return (
            <section key={c.campo} className="rounded-xl border border-white/10 bg-black/20 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  {c.tipo === "immagine" ? (
                    <ImageIcon className="size-4 text-[var(--tbh-neon)]" />
                  ) : (
                    <FileText className="size-4 text-[var(--tbh-neon)]" />
                  )}
                  <p className="tbh-body text-[13px] font-extrabold text-[var(--tbh-fg)]">
                    {c.etichetta}
                  </p>
                  {c.riservato && (
                    <span className="tbh-body inline-flex items-center gap-1 rounded-full border border-white/20 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-[0.1em] text-[var(--tbh-muted)]">
                      <Lock className="size-3" /> privato
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <span className="tbh-body text-[11px] text-[var(--tbh-muted)]">
                    {file.length}/{c.max}
                  </span>
                  {lavorando ? (
                    <span className="tbh-body inline-flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-[0.08em] text-[var(--tbh-neon)]">
                      <Loader2 className="size-3.5 animate-spin" /> Caricamento…
                    </span>
                  ) : fatto === c.campo ? (
                    <span className="tbh-body inline-flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-[0.08em] text-[var(--tbh-neon)]">
                      <CheckCircle2 className="size-3.5" /> ✓ Caricato
                    </span>
                  ) : null}
                  <button
                    type="button"
                    disabled={pieno || lavorando}
                    onClick={() => {
                      daSostituire.current = null;
                      selettori.current[c.campo]?.click();
                    }}
                    className={`tbh-body inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-[0.08em] transition ${
                      pieno || lavorando
                        ? "cursor-not-allowed border-white/10 text-[var(--tbh-muted)]"
                        : "border-white/20 text-[var(--tbh-fg)] hover:border-[var(--tbh-neon)]"
                    }`}
                  >
                    <Plus className="size-3.5" /> Aggiungi
                  </button>
                </div>
              </div>

              <input
                ref={(el) => {
                  selettori.current[c.campo] = el;
                }}
                type="file"
                accept={formati}
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0] ?? null;
                  e.target.value = "";
                  void scegli(c.campo, c.tipo, f);
                }}
              />

              {file.length === 0 ? (
                <p className="tbh-body mt-3 text-[12px] text-[var(--tbh-muted)]">
                  Niente su questo campo.
                </p>
              ) : (
                <ul className="mt-3 space-y-2">
                  {file.map((r) => (
                    <li
                      key={r.id}
                      className="flex flex-wrap items-center gap-3 rounded-lg border border-white/10 bg-white/[0.03] p-2.5"
                    >
                      {eImmagine(r) && r.url ? (
                        <img
                          src={r.url}
                          alt={nomeDi(r)}
                          className="size-12 shrink-0 rounded-md object-cover"
                        />
                      ) : (
                        <span className="grid size-12 shrink-0 place-items-center rounded-md border border-white/10 bg-black/40">
                          <FileText className="size-5 text-[var(--tbh-muted)]" />
                        </span>
                      )}
                      <div className="min-w-[140px] flex-1">
                        <p className="tbh-body truncate text-[12px] font-extrabold text-[var(--tbh-fg)]">
                          {nomeDi(r)}
                        </p>
                        <p className="tbh-body text-[11px] text-[var(--tbh-muted)]">
                          {pesoLeggibile(r.peso)}
                          {r.riservato === 1 ? " · privato, fuori dalle pagine pubbliche" : ` · ${r.stato}`}
                        </p>
                      </div>
                      <div className="flex flex-wrap items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setAnteprima(r)}
                          className="tbh-body inline-flex items-center gap-1 rounded-lg border border-white/15 px-2.5 py-1.5 text-[11px] font-extrabold uppercase text-[var(--tbh-fg)] transition hover:border-[var(--tbh-neon)]"
                        >
                          <Eye className="size-3.5" /> Visualizza
                        </button>
                        <a
                          href={r.urlOriginale || r.url || ""}
                          download={nomeDi(r)}
                          target="_blank"
                          rel="noreferrer"
                          className="tbh-body inline-flex items-center gap-1 rounded-lg border border-white/15 px-2.5 py-1.5 text-[11px] font-extrabold uppercase text-[var(--tbh-fg)] transition hover:border-[var(--tbh-neon)]"
                        >
                          <Download className="size-3.5" /> Scarica
                        </a>
                        <button
                          type="button"
                          disabled={lavorando}
                          onClick={() => {
                            daSostituire.current = { id: r.id, slot: r.slot };
                            selettori.current[c.campo]?.click();
                          }}
                          className="tbh-body inline-flex items-center gap-1 rounded-lg border border-white/15 px-2.5 py-1.5 text-[11px] font-extrabold uppercase text-[var(--tbh-fg)] transition hover:border-[var(--tbh-neon)] disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <RefreshCw className="size-3.5" /> Sostituisci
                        </button>
                        <button
                          type="button"
                          disabled={lavorando}
                          onClick={() => {
                            if (
                              window.confirm(
                                `Eliminare «${nomeDi(r)}»? Il file viene rimosso dall'archivio.`,
                              )
                            )
                              void rimuovi(r);
                          }}
                          className="tbh-body inline-flex items-center gap-1 rounded-lg border border-[#ff8a8a]/40 px-2.5 py-1.5 text-[11px] font-extrabold uppercase text-[#ff8a8a] transition hover:border-[#ff8a8a] disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <Trash2 className="size-3.5" /> Elimina
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          );
        })}
      </div>

      <p className="tbh-body mt-4 inline-flex items-start gap-2 text-[11px] text-[var(--tbh-muted)]">
        <Lock className="mt-0.5 size-3.5 shrink-0" />
        Portfolio e allegati sono documenti personali: restano fuori dalle pagine
        pubbliche anche se qualcuno li pubblicasse per errore. Le foto, per finire sul
        sito, vanno pubblicate dal Media Manager con il consenso B della candidata.
      </p>

      {anteprima && <Anteprima file={anteprima} onChiudi={() => setAnteprima(null)} />}
    </div>
  );
}
