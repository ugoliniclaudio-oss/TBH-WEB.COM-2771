import { useEffect, useRef, useState } from "react";
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
  Upload,
  X,
} from "lucide-react";
import {
  useCaricaFilePratica,
  useConfigurazionePratica,
  useEliminaFilePratica,
  usePratica,
  type AmbitoPratica,
  type FilePratica,
} from "../queries/pratiche";

/* ────────────────────────────────────────────────────────────────────────────
   CARICAMENTO MATERIALE NEI MODULI DI CANDIDATURA — componente unico.

   Ordine di Claudio del 28/09/2026 (punti 3–7 e 9):
   «FOTO PRINCIPALE, ALTRE FOTO, PORTFOLIO/DOCUMENTI, ALLEGATI. Formati JPG, JPEG,
   PNG, WEBP, PDF. Anteprima del file caricato. SOSTITUISCI, ELIMINA, AGGIUNGI.
   Niente upload finti. Stati visibili: CARICAMENTO… / ✓ CARICATO / ⚠ ERRORE.
   […] Lo stesso sistema in tutte le sezioni, non uno diverso per pagina.»

   Questo componente è quel sistema: si usa in Touch Miss Cool, in Lavoro & Casting
   e in qualunque altro modulo pubblico cambiando solo l'ambito. I campi, i formati
   ammessi e il numero massimo di file arrivano dal server (api/routes/pratiche.ts):
   qui non si riscrive nessuna regola.

   I file vanno davvero nell'archivio del portale e restano allegati alla riga della
   candidatura: dal pannello si vedono, si scaricano, si sostituiscono. Le foto
   nascono in bozza (le pubblica la redazione); portfolio e allegati nascono
   riservati e non escono mai dalle pagine pubbliche.
   ──────────────────────────────────────────────────────────────────────────── */

export type ManiglieCaricamento = {
  /** Token della pratica da mandare insieme al modulo (vuoto = nessun file caricato). */
  token: string;
  /** Quanti file sono stati trasferiti. */
  nFile: number;
  /** Dopo l'invio: svuota il pannello, la pratica è chiusa. */
  azzera: () => void;
};

function peso(n: number | null) {
  if (!n) return "";
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${Math.round(n / 1024)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

function immagine(f: FilePratica) {
  if (f.tipo === "immagine") return true;
  return /\.(jpg|jpeg|png|webp)$/i.test(f.nome) || (f.mime ?? "").startsWith("image/");
}

/** Anteprima a tutto schermo: un file caricato si deve poter guardare davvero. */
function Anteprima({ file, onChiudi }: { file: FilePratica; onChiudi: () => void }) {
  useEffect(() => {
    const esc = (e: KeyboardEvent) => e.key === "Escape" && onChiudi();
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, [onChiudi]);

  return (
    <div
      className="fixed inset-0 z-[120] bg-black/90 flex items-center justify-center p-4"
      onClick={onChiudi}
    >
      <button
        type="button"
        onClick={onChiudi}
        className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20"
        aria-label="Chiudi anteprima"
      >
        <X size={20} />
      </button>
      <div className="max-w-[92vw] max-h-[88vh]" onClick={(e) => e.stopPropagation()}>
        {immagine(file) ? (
          <img
            src={file.url}
            alt={file.nome}
            className="max-w-[92vw] max-h-[80vh] object-contain rounded-xl"
          />
        ) : (
          <iframe
            src={file.url}
            title={file.nome}
            className="w-[92vw] h-[80vh] rounded-xl bg-white"
          />
        )}
        <p className="mt-3 text-center text-sm text-white/80 break-all">{file.nome}</p>
      </div>
    </div>
  );
}

type StatoCampo = { fase: "attesa" | "carico" | "fatto" | "errore"; messaggio?: string };

function Campo({
  campo,
  etichetta,
  aiuto,
  tipo,
  max,
  riservato,
  formati,
  files,
  onCarica,
  onElimina,
  stato,
  onAnteprima,
}: {
  campo: string;
  etichetta: string;
  aiuto: string;
  tipo: "immagine" | "documento";
  max: number;
  riservato: boolean;
  formati: string[];
  files: FilePratica[];
  onCarica: (campo: string, elenco: File[], sostituisce?: number) => void;
  onElimina: (id: number) => void;
  stato: StatoCampo;
  onAnteprima: (f: FilePratica) => void;
}) {
  const input = useRef<HTMLInputElement | null>(null);
  const [sostituisce, setSostituisce] = useState<number | undefined>(undefined);
  const [trascina, setTrascina] = useState(false);
  const accetta = formati
    .map((f) => (f === "pdf" ? "application/pdf" : `image/${f === "jpg" ? "jpeg" : f}`))
    .concat(formati.map((f) => `.${f}`))
    .join(",");
  const pieno = files.length >= max;

  function scegli(sostituisceId?: number) {
    setSostituisce(sostituisceId);
    input.current?.click();
  }

  return (
    <div data-blocco-campo={campo} className="rounded-2xl border border-[var(--tbh-line)] p-4 md:p-5">
      <div className="flex flex-wrap items-start justify-between gap-2 mb-1">
        <div>
          <p className="text-sm font-semibold flex items-center gap-2">
            {tipo === "immagine" ? <ImageIcon size={15} /> : <FileText size={15} />}
            {etichetta}
            {riservato && (
              <span className="inline-flex items-center gap-1 text-[10px] tracking-[0.14em] uppercase px-2 py-0.5 rounded-full border border-[var(--tbh-line)] text-[var(--tbh-muted)]">
                <Lock size={10} /> privato
              </span>
            )}
          </p>
          <p className="text-xs text-[var(--tbh-muted)] mt-1">{aiuto}</p>
        </div>
        <span className="text-[11px] text-[var(--tbh-muted)] whitespace-nowrap">
          {files.length}/{max} file
        </span>
      </div>

      {/* Stato del trasferimento: è il file vero che si muove, non una finta barra. */}
      <div className="min-h-[22px] mb-2 text-xs" aria-live="polite">
        {stato.fase === "carico" && (
          <span className="inline-flex items-center gap-1.5 text-[var(--tbh-gold)]">
            <Loader2 size={13} className="animate-spin" /> CARICAMENTO…
          </span>
        )}
        {stato.fase === "fatto" && (
          <span className="inline-flex items-center gap-1.5 text-emerald-400">
            <CheckCircle2 size={13} /> ✓ CARICATO
          </span>
        )}
        {stato.fase === "errore" && (
          <span className="inline-flex items-start gap-1.5 text-red-400">
            <AlertTriangle size={13} className="mt-0.5 shrink-0" />
            <span>⚠ ERRORE — {stato.messaggio}</span>
          </span>
        )}
      </div>

      {files.length > 0 && (
        <ul
          className={
            tipo === "immagine"
              ? "grid grid-cols-2 sm:grid-cols-3 gap-3 mb-3"
              : "flex flex-col gap-2 mb-3"
          }
        >
          {files.map((f, i) => (
            <li
              key={f.id}
              className={
                tipo === "immagine"
                  ? "rounded-xl border border-[var(--tbh-line)] overflow-hidden"
                  : "rounded-xl border border-[var(--tbh-line)] p-3 flex flex-wrap items-center gap-2"
              }
            >
              {tipo === "immagine" ? (
                <>
                  <button
                    type="button"
                    onClick={() => onAnteprima(f)}
                    className="block w-full aspect-[3/4] bg-black/30"
                    title="Apri l'anteprima"
                  >
                    <img src={f.url} alt={f.nome} className="w-full h-full object-cover" />
                  </button>
                  <div className="p-2">
                    {max > 1 && i === 0 && (
                      <p className="text-[10px] tracking-[0.14em] uppercase text-[var(--tbh-gold)] mb-1">
                        Prima foto
                      </p>
                    )}
                    <p className="text-[11px] text-[var(--tbh-muted)] break-all leading-tight">
                      {f.nome}
                    </p>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      <button
                        type="button"
                        onClick={() => onAnteprima(f)}
                        className="text-[11px] px-2 py-1 rounded-lg border border-[var(--tbh-line)] inline-flex items-center gap-1"
                      >
                        <Eye size={11} /> Vedi
                      </button>
                      <button
                        type="button"
                        onClick={() => scegli(f.id)}
                        className="text-[11px] px-2 py-1 rounded-lg border border-[var(--tbh-line)] inline-flex items-center gap-1"
                      >
                        <RefreshCw size={11} /> Sostituisci
                      </button>
                      <button
                        type="button"
                        onClick={() => onElimina(f.id)}
                        className="text-[11px] px-2 py-1 rounded-lg border border-[var(--tbh-line)] text-red-300 inline-flex items-center gap-1"
                      >
                        <Trash2 size={11} /> Elimina
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <FileText size={16} className="text-[var(--tbh-gold)] shrink-0" />
                  <span className="text-xs grow break-all min-w-[8rem]">{f.nome}</span>
                  <span className="text-[11px] text-[var(--tbh-muted)]">{peso(f.peso)}</span>
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      type="button"
                      onClick={() => onAnteprima(f)}
                      className="text-[11px] px-2 py-1 rounded-lg border border-[var(--tbh-line)] inline-flex items-center gap-1"
                    >
                      <Eye size={11} /> Vedi
                    </button>
                    <a
                      href={f.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[11px] px-2 py-1 rounded-lg border border-[var(--tbh-line)] inline-flex items-center gap-1"
                    >
                      <Download size={11} /> Scarica
                    </a>
                    <button
                      type="button"
                      onClick={() => scegli(f.id)}
                      className="text-[11px] px-2 py-1 rounded-lg border border-[var(--tbh-line)] inline-flex items-center gap-1"
                    >
                      <RefreshCw size={11} /> Sostituisci
                    </button>
                    <button
                      type="button"
                      onClick={() => onElimina(f.id)}
                      className="text-[11px] px-2 py-1 rounded-lg border border-[var(--tbh-line)] text-red-300 inline-flex items-center gap-1"
                    >
                      <Trash2 size={11} /> Elimina
                    </button>
                  </div>
                </>
              )}
            </li>
          ))}
        </ul>
      )}

      {!pieno && (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setTrascina(true);
          }}
          onDragLeave={() => setTrascina(false)}
          onDrop={(e) => {
            e.preventDefault();
            setTrascina(false);
            const elenco = [...e.dataTransfer.files];
            if (elenco.length > 0) onCarica(campo, elenco);
          }}
          className={`rounded-xl border border-dashed p-4 text-center transition-colors ${
            trascina ? "border-[var(--tbh-neon)] bg-white/5" : "border-[var(--tbh-line)]"
          }`}
        >
          <button
            type="button"
            onClick={() => scegli(undefined)}
            className="inline-flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-xl border border-[var(--tbh-line)] hover:border-[var(--tbh-neon)]"
          >
            {files.length > 0 ? <Plus size={15} /> : <Upload size={15} />}
            {files.length > 0 ? "Aggiungi" : max > 1 ? "Carica i file" : "Carica il file"}
          </button>
          <p className="text-[11px] text-[var(--tbh-muted)] mt-2">
            Oppure trascina qui. Ammessi {formati.join(", ").toUpperCase()} — massimo 15 MB per
            file.
          </p>
        </div>
      )}
      {pieno && (
        <p className="text-[11px] text-[var(--tbh-muted)]">
          Hai raggiunto il numero massimo di file per questo campo: per cambiarne uno usa
          SOSTITUISCI.
        </p>
      )}

      <input
        ref={input}
        data-campo={campo}
        type="file"
        accept={accetta}
        multiple={max > 1 && sostituisce === undefined}
        className="hidden"
        onChange={(e) => {
          const elenco = [...(e.target.files ?? [])];
          e.target.value = "";
          if (elenco.length > 0) onCarica(campo, elenco, sostituisce);
          setSostituisce(undefined);
        }}
      />
    </div>
  );
}

/**
 * Pannello di caricamento di un modulo pubblico.
 * `onManiglie` consegna alla pagina il token da inviare col modulo e il conteggio dei file.
 */
export default function CaricamentoCandidatura({
  ambito,
  titolo = "Materiale da allegare",
  introduzione,
  onManiglie,
}: {
  ambito: AmbitoPratica;
  titolo?: string;
  introduzione?: string;
  onManiglie?: (m: ManiglieCaricamento) => void;
}) {
  const configurazione = useConfigurazionePratica(ambito);
  const pratica = usePratica(ambito);
  const carica = useCaricaFilePratica();
  const elimina = useEliminaFilePratica();
  const [stati, setStati] = useState<Record<string, StatoCampo>>({});
  const [anteprima, setAnteprima] = useState<FilePratica | null>(null);

  const token = pratica.token;
  const nFile = pratica.items.length;
  const azzera = pratica.dimentica;

  useEffect(() => {
    onManiglie?.({ token, nFile, azzera });
  }, [onManiglie, token, nFile, azzera]);

  function segna(campo: string, s: StatoCampo) {
    setStati((p) => ({ ...p, [campo]: s }));
  }

  async function onCarica(campo: string, elenco: File[], sostituisce?: number) {
    const conf = configurazione.data?.campi.find((c) => c.campo === campo);
    if (!conf) return;
    segna(campo, { fase: "carico" });
    try {
      const t = await pratica.assicura();
      // Uno alla volta: così il numero massimo di file per campo è controllato davvero.
      for (const file of elenco) {
        await carica.mutateAsync({
          token: t,
          campo,
          file,
          tipo: conf.tipo as "immagine" | "documento",
          sostituisce,
        });
        sostituisce = undefined;
      }
      pratica.ricarica(t);
      segna(campo, { fase: "fatto" });
    } catch (e) {
      segna(campo, {
        fase: "errore",
        messaggio: e instanceof Error ? e.message : "caricamento non riuscito, riprova.",
      });
      pratica.ricarica();
    }
  }

  async function onElimina(campo: string, id: number) {
    if (!token) return;
    try {
      await elimina.mutateAsync({ token, id });
      pratica.ricarica();
      segna(campo, { fase: "attesa" });
    } catch (e) {
      segna(campo, {
        fase: "errore",
        messaggio: e instanceof Error ? e.message : "non è stato possibile eliminare il file.",
      });
    }
  }

  if (!configurazione.data) {
    return (
      <div className="rounded-2xl border border-[var(--tbh-line)] p-5 text-sm text-[var(--tbh-muted)]">
        Caricamento del pannello materiale…
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h3 className="tbh-display text-xl">{titolo}</h3>
        {introduzione && (
          <p className="text-sm text-[var(--tbh-muted)] mt-1 max-w-3xl">{introduzione}</p>
        )}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {configurazione.data.campi.map((c) => (
          <Campo
            key={c.campo}
            campo={c.campo}
            etichetta={c.etichetta}
            aiuto={c.aiuto}
            tipo={c.tipo as "immagine" | "documento"}
            max={c.max}
            riservato={c.riservato}
            formati={c.formati}
            files={pratica.perCampo(c.campo)}
            onCarica={onCarica}
            onElimina={(id) => onElimina(c.campo, id)}
            stato={stati[c.campo] ?? { fase: "attesa" }}
            onAnteprima={setAnteprima}
          />
        ))}
      </div>

      <p className="text-xs text-[var(--tbh-muted)]">
        I file vengono trasferiti subito nell'archivio del portale e restano allegati alla tua
        candidatura. Le foto non compaiono in nessuna pagina finché la redazione non le approva.
        Portfolio e allegati sono contrassegnati come privati: non vengono pubblicati.
        {nFile > 0 && ` — ${nFile} file caricati finora.`}
      </p>

      {anteprima && <Anteprima file={anteprima} onChiudi={() => setAnteprima(null)} />}
    </div>
  );
}
