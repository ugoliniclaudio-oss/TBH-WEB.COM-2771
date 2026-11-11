import { useEffect, useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  Check,
  Eye,
  FolderOpen,
  Image as ImageIcon,
  Link2,
  Loader2,
  Plus,
  RefreshCw,
  Search,
  Star,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { useCodiceAllestimento } from "../lib/codice-allestimento";
import { pesoLeggibile } from "../lib/ottimizza-immagine";
import {
  useCaricaMedia,
  useEliminaMedia,
  useMediaLibreria,
  useMediaSlot,
  usePubblicaMedia,
  useRiordinaMedia,
  useRiusaMedia,
  useSalvaLinkMedia,
  useSostituisciMedia,
  useStatoAllestimento,
  type TipoMediaCaricamento,
} from "../queries/media";
import { SbloccoAllestimento } from "./media-slot";

/**
 * MEDIA MANAGER TBH — il componente unico di caricamento, valido in tutto il CMS.
 *
 * Ordine di Claudio del 28/09/2026:
 * «Implementare un sistema di caricamento immagini centralizzato e riutilizzabile in tutte le
 *  aree amministrabili: CARICA IMMAGINE | TRASCINA FILE | SOSTITUISCI | RIMUOVI | ANTEPRIMA.
 *  […] SCEGLI DALLA LIBRERIA MEDIA. […] Non creare campi che accettano soltanto URL.
 *  […] Il componente di upload deve essere unico e riutilizzabile, non duplicato pagina
 *  per pagina. […] L'assenza temporanea dell'immagine non deve impedire il salvataggio in bozza.»
 *
 * Qui dentro ci sono tre mattoni, da mettere in qualunque scheda del sito:
 * · <CampoImmagine>  — una sola immagine (copertina, foto principale, logo, locandina);
 * · <CampoGallery>   — più immagini, con riordino e scelta della principale;
 * · <CampoAllegati>  — documenti separati dalle foto (CV, liberatorie, PDF).
 *
 * Tutti e tre lavorano su uno SLOT (es. `influencity:copertina:2025-31`) e fanno le stesse cose:
 * caricano il file nell'archivio del portale, ne scrivono il riferimento nel database, permettono
 * di riusare un'immagine già presente senza ricaricarla, di sostituirla, di tenerla in BOZZA e
 * di eliminarla solo dopo avviso se è usata anche altrove.
 *
 * Chi non ha il codice di allestimento vede solo il risultato pubblicato: nessun comando,
 * nessuna bozza, nessun documento riservato.
 */

/** La riga che torna dall'archivio (stessa forma per slot, prefisso e libreria). */
export type Materiale = {
  id: number;
  slot: string;
  tipo: string;
  titolo: string | null;
  indirizzo: string | null;
  mapsUrl: string | null;
  linkUrl: string | null;
  url: string;
  urlOriginale: string | null;
  descrizione: string | null;
  tag: string | null;
  stato: string;
  ordine: number;
  mime: string | null;
  peso: number | null;
  larghezza: number | null;
  altezza: number | null;
  categoria: string;
  chiave: string;
};

const ESTENSIONI_IMMAGINE = "image/jpeg,image/jpg,image/png,image/webp,image/svg+xml,image/avif";
const ESTENSIONI_DOCUMENTO =
  "application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/csv,text/plain";

function documento(m: { tipo: string; url: string }) {
  return m.tipo === "documento" || /\.(pdf|docx?|odt|xlsx?|csv|txt)($|\?)/i.test(m.url);
}

/** Etichetta dello stato, per far vedere subito cosa è pubblico e cosa no. */
function Stato({ stato }: { stato: string }) {
  if (stato === "pubblicato") {
    return (
      <span className="text-[10px] font-bold uppercase tracking-wide text-[var(--tbh-neon)] inline-flex items-center gap-1">
        <Check size={12} /> Pubblicato
      </span>
    );
  }
  if (stato === "archiviato") {
    return (
      <span className="text-[10px] font-bold uppercase tracking-wide text-[var(--tbh-muted)]">
        Archiviato
      </span>
    );
  }
  return (
    <span className="text-[10px] font-bold uppercase tracking-wide text-[var(--tbh-gold)]">
      Bozza — non pubblica
    </span>
  );
}

/* ───────────────────────────── AVVISO PRIMA DI ELIMINARE ───────────────────────────── */

/**
 * «Prima di eliminare un'immagine utilizzata in altre pagine, mostrare un avviso».
 * L'eliminazione parte solo alla seconda conferma, e solo per lo slot in cui si sta lavorando.
 */
function useEliminaConAvviso() {
  const { codice } = useCodiceAllestimento();
  const elimina = useEliminaMedia();
  const [avviso, setAvviso] = useState<{ id: number; usato: { id: number; slot: string }[] } | null>(
    null,
  );

  const chiedi = (id: number) => {
    elimina.mutate(
      { codice, id },
      {
        onSuccess: (r) => {
          if (!r.ok) setAvviso({ id, usato: r.usato });
        },
      },
    );
  };

  const conferma = () => {
    if (!avviso) return;
    elimina.mutate({ codice, id: avviso.id, forza: true }, { onSuccess: () => setAvviso(null) });
  };

  const riquadro = avviso ? (
    <div className="rounded-2xl border border-[var(--tbh-gold)]/60 bg-black/60 p-4 grid gap-3">
      <p className="text-xs text-[var(--tbh-gold)] inline-flex items-start gap-2">
        <AlertTriangle size={16} className="shrink-0 mt-0.5" />
        <span>
          Attenzione: questo file è usato anche in{" "}
          <b className="text-white">{avviso.usato.length}</b> altro
          {avviso.usato.length === 1 ? " punto" : " punti"} del sito (
          {avviso.usato.map((u) => u.slot).join(", ")}). Se lo elimini sparisce anche lì.
        </span>
      </p>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={conferma}
          className="px-4 py-2 rounded-full text-[11px] font-bold uppercase tracking-wide border border-red-400/60 text-red-300 hover:bg-red-400/10"
        >
          Elimina comunque
        </button>
        <button
          type="button"
          onClick={() => setAvviso(null)}
          className="px-4 py-2 rounded-full text-[11px] font-bold uppercase tracking-wide border border-white/20 text-[var(--tbh-muted)]"
        >
          Annulla
        </button>
      </div>
    </div>
  ) : null;

  return { chiedi, riquadro, inCorso: elimina.isPending, errore: elimina.error as Error | null };
}

/* ───────────────────────────────── LIBRERIA MEDIA TBH ───────────────────────────────── */

type SelettoreProps = {
  /** Slot su cui mettere l'immagine scelta. */
  slot: string;
  soloTipo?: TipoMediaCaricamento;
  onChiudi: () => void;
  onScelta?: () => void;
};

/**
 * SCEGLI DALLA LIBRERIA MEDIA — l'immagine già in archivio si riusa senza ricaricarla.
 * «Evitare di obbligare l'amministratore a ricaricare più volte la stessa immagine.»
 */
export function SelettoreLibreria({ slot, soloTipo, onChiudi, onScelta }: SelettoreProps) {
  const { codice } = useCodiceAllestimento();
  const [q, setQ] = useState("");
  const [categoria, setCategoria] = useState("");
  const libreria = useMediaLibreria({ q, categoria, tipo: soloTipo, codice });
  const riusa = useRiusaMedia();
  const items = (libreria.data?.items ?? []) as Materiale[];
  const categorie = libreria.data?.categorie ?? [];

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm p-4 overflow-auto">
      <div className="mx-auto max-w-5xl tbh-card p-5 md:p-6">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <p className="text-[11px] tracking-[0.25em] text-[var(--tbh-gold)] uppercase mb-1">
              Libreria Media TBH
            </p>
            <h3 className="tbh-display text-2xl leading-tight">Scegli un'immagine già caricata</h3>
            <p className="text-xs text-[var(--tbh-muted)] mt-1">
              Il file non viene duplicato: la stessa immagine può stare in più punti del sito.
            </p>
          </div>
          <button
            type="button"
            onClick={onChiudi}
            aria-label="Chiudi la libreria"
            className="rounded-full border border-white/20 p-2 text-[var(--tbh-muted)] hover:text-white"
          >
            <X size={16} />
          </button>
        </div>

        <div className="flex flex-wrap gap-2 items-center mb-4">
          <label className="relative grow min-w-[220px]">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--tbh-muted)]"
            />
            <input
              aria-label="Cerca nella libreria media"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Cerca per titolo, descrizione, tag o nome del file"
              className="w-full rounded-xl bg-black/50 border border-white/15 pl-9 pr-3 py-2.5 text-sm outline-none focus:border-[var(--tbh-neon)]"
            />
          </label>
          <span className="text-xs text-[var(--tbh-muted)]">
            {libreria.data?.totale ?? 0} materiali
          </span>
        </div>

        <div className="flex flex-wrap gap-2 mb-5">
          <button
            type="button"
            onClick={() => setCategoria("")}
            className={`px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wide border ${
              categoria === ""
                ? "border-[var(--tbh-neon)] text-[var(--tbh-neon)]"
                : "border-white/15 text-[var(--tbh-muted)]"
            }`}
          >
            Tutte
          </button>
          {categorie.map((c) => (
            <button
              key={c.slug}
              type="button"
              onClick={() => setCategoria(c.slug)}
              className={`px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wide border ${
                categoria === c.slug
                  ? "border-[var(--tbh-neon)] text-[var(--tbh-neon)]"
                  : "border-white/15 text-[var(--tbh-muted)]"
              }`}
            >
              {c.nome} {c.n > 0 && <span className="opacity-60">({c.n})</span>}
            </button>
          ))}
        </div>

        {libreria.isLoading ? (
          <p className="text-sm text-[var(--tbh-muted)] inline-flex items-center gap-2">
            <Loader2 size={16} className="animate-spin" /> Apro la libreria…
          </p>
        ) : items.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/20 p-6">
            <p className="text-sm text-[var(--tbh-muted)]">
              In libreria non c'è ancora niente con questi filtri. Carica il primo file dal campo
              qui sotto: da quel momento resta disponibile per tutte le altre pagine.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {items.map((m) => (
              <button
                key={m.id}
                type="button"
                disabled={riusa.isPending}
                onClick={() =>
                  riusa.mutate(
                    { codice, id: m.id, slot, stato: "pubblicato" },
                    {
                      onSuccess: () => {
                        onScelta?.();
                        onChiudi();
                      },
                    },
                  )
                }
                className="text-left rounded-2xl border border-white/10 bg-black/40 overflow-hidden hover:border-[var(--tbh-neon)] disabled:opacity-40"
              >
                <div className="h-[110px] bg-white grid place-items-center overflow-hidden">
                  {documento(m) ? (
                    <span className="text-black/70 text-[10px] font-bold uppercase tracking-wide">
                      Documento
                    </span>
                  ) : (
                    <img
                      src={m.url}
                      alt={m.titolo ?? ""}
                      loading="lazy"
                      className="max-h-[106px] w-auto object-contain"
                    />
                  )}
                </div>
                <div className="p-3 grid gap-1">
                  <span className="text-xs font-bold leading-tight line-clamp-2">
                    {m.titolo ?? m.slot}
                  </span>
                  <span className="text-[10px] uppercase tracking-wide text-[var(--tbh-muted)]">
                    {m.categoria} · {m.tipo}
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}

        {riusa.isError && (
          <p className="text-xs text-red-400 mt-4">
            Non è stato possibile riusare l'immagine: {(riusa.error as Error).message}
          </p>
        )}
      </div>
    </div>
  );
}

/* ───────────────────────────── ZONA DI TRASCINAMENTO ───────────────────────────── */

type ZonaProps = {
  accetta: string;
  multiplo?: boolean;
  altezza?: string;
  onFile: (files: File[]) => void;
  children?: React.ReactNode;
  /** Come chiamare i file nel testo: «foto» per le immagini, «file» per i documenti. */
  nome?: string;
};

/** CARICA DAL DISPOSITIVO + TRASCINA E RILASCIA, nello stesso riquadro. */
function ZonaCaricamento({
  accetta,
  multiplo,
  altezza = "h-[180px]",
  onFile,
  children,
  nome = "foto",
}: ZonaProps) {
  const input = useRef<HTMLInputElement | null>(null);
  const [sopra, setSopra] = useState(false);

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setSopra(true);
      }}
      onDragLeave={() => setSopra(false)}
      onDrop={(e) => {
        e.preventDefault();
        setSopra(false);
        const files = Array.from(e.dataTransfer.files ?? []);
        if (files.length > 0) onFile(multiplo ? files : [files[0]]);
      }}
      className={`rounded-2xl border border-dashed ${altezza} grid place-items-center text-center px-4 transition-colors ${
        sopra
          ? "border-[var(--tbh-neon)] bg-[var(--tbh-neon)]/10"
          : "border-white/20 bg-black/40 hover:border-white/40"
      }`}
    >
      {children ?? (
        <div className="grid gap-2 justify-items-center">
          <Upload size={20} className="text-[var(--tbh-muted)]" />
          <button
            type="button"
            onClick={() => input.current?.click()}
            className="tbh-neon-btn px-4 py-2 text-xs"
          >
            Carica dal dispositivo
          </button>
          <span className="text-[11px] text-[var(--tbh-muted)]">
            oppure trascina e rilascia qui {multiplo ? `uno o più file (${nome})` : "il file"}
          </span>
        </div>
      )}
      <input
        ref={input}
        aria-label="Scegli il file da caricare"
        type="file"
        accept={accetta}
        multiple={multiplo}
        className="hidden"
        onChange={(e) => {
          const files = Array.from(e.target.files ?? []);
          if (files.length > 0) onFile(multiplo ? files : [files[0]]);
          e.target.value = "";
        }}
      />
    </div>
  );
}

/* ───────────────────────────────── CAMPO IMMAGINE ───────────────────────────────── */

type CampoImmagineProps = {
  slot: string;
  etichetta: string;
  aiuto?: string;
  /** `logo` = file ufficiale, mai ottimizzato né ridimensionato. */
  tipo?: TipoMediaCaricamento;
  /** Titolo con cui salvare il file (es. «Copertina N°31 — Gennaio 2025»). */
  titolo?: string;
  /** Se vero l'immagine nasce in BOZZA: salvata, visibile solo in amministrazione. */
  bozza?: boolean;
  /** Se vero, ai visitatori il campo vuoto non compare affatto. */
  nascondiSeVuoto?: boolean;
  /** Proporzione dell'anteprima pubblica, es. "3/4" per una copertina. */
  proporzione?: string;
};

/**
 * UNA SOLA IMMAGINE: copertina, foto principale, logo, locandina, artwork.
 * Comandi: CARICA | TRASCINA | LIBRERIA | SOSTITUISCI | RIMUOVI | ANTEPRIMA | BOZZA/PUBBLICA.
 * Il link esterno resta possibile, ma è una seconda strada: il caricamento c'è sempre.
 */
export function CampoImmagine({
  slot,
  etichetta,
  aiuto,
  tipo = "immagine",
  titolo,
  bozza = false,
  nascondiSeVuoto = false,
  proporzione,
}: CampoImmagineProps) {
  const { codice } = useCodiceAllestimento();
  const stato = useStatoAllestimento();
  const q = useMediaSlot(slot, codice || undefined);
  const carica = useCaricaMedia();
  const sostituisci = useSostituisciMedia();
  const salvaLink = useSalvaLinkMedia();
  const pubblica = usePubblicaMedia();
  const { chiedi, riquadro, inCorso: inEliminazione } = useEliminaConAvviso();
  const [apriLibreria, setApriLibreria] = useState(false);
  const [apriLink, setApriLink] = useState(false);
  const [link, setLink] = useState("");
  const [anteprimaPiena, setAnteprimaPiena] = useState(false);

  const items = (q.data?.items ?? []) as Materiale[];
  const attuale = items[0] ?? null;
  const admin = codice.length > 0 && (stato.data?.attivo ?? true);
  const lavori = carica.isPending || sostituisci.isPending || salvaLink.isPending;
  const errore = (carica.error ?? sostituisci.error ?? salvaLink.error) as Error | null;

  if (!attuale && !admin && nascondiSeVuoto) return null;

  function metti(files: File[]) {
    const file = files[0];
    if (!file) return;
    if (attuale) {
      sostituisci.mutate({ codice, id: attuale.id, slot, file, tipo });
      return;
    }
    carica.mutate({
      codice,
      slot,
      file,
      tipo,
      titolo,
      stato: bozza ? "bozza" : "pubblicato",
    });
  }

  return (
    <section className="grid gap-3">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--tbh-gold)]">
          {etichetta}
        </h3>
        {attuale && admin && <Stato stato={attuale.stato} />}
      </div>

      {attuale ? (
        <figure className="grid gap-3">
          <div
            className="rounded-2xl bg-white overflow-hidden grid place-items-center"
            style={proporzione ? { aspectRatio: proporzione } : { minHeight: 180 }}
          >
            {documento(attuale) ? (
              <span className="text-black/70 text-xs font-bold uppercase tracking-wide py-10">
                Documento caricato
              </span>
            ) : (
              <img
                src={attuale.url}
                alt={attuale.descrizione ?? attuale.titolo ?? etichetta}
                loading="lazy"
                className="h-full w-full object-contain"
              />
            )}
          </div>
          {(attuale.titolo || attuale.peso) && (
            <figcaption className="text-[11px] text-[var(--tbh-muted)]">
              {attuale.titolo}
              {attuale.larghezza ? ` · ${attuale.larghezza}×${attuale.altezza}px` : ""}
              {attuale.peso ? ` · ${pesoLeggibile(attuale.peso)}` : ""}
              {attuale.urlOriginale ? " · originale conservato" : ""}
            </figcaption>
          )}
        </figure>
      ) : (
        admin && (
          <ZonaCaricamento accetta={ESTENSIONI_IMMAGINE} onFile={metti}>
            {lavori ? (
              <span className="text-xs text-[var(--tbh-muted)] inline-flex items-center gap-2">
                <Loader2 size={15} className="animate-spin" /> Carico…
              </span>
            ) : undefined}
          </ZonaCaricamento>
        )
      )}

      {!attuale && !admin && (
        <div className="rounded-2xl border border-dashed border-white/20 p-5 flex items-start gap-3">
          <ImageIcon size={18} className="text-[var(--tbh-muted)] shrink-0" />
          <p className="text-xs text-[var(--tbh-muted)]">
            Immagine non ancora disponibile. Non mettiamo niente di finto al suo posto.
          </p>
        </div>
      )}

      {admin && (
        <div className="grid gap-3">
          {aiuto && <p className="text-[11px] text-[var(--tbh-muted)]">{aiuto}</p>}
          {tipo === "logo" && (
            <p className="text-[11px] text-[var(--tbh-gold)]">
              Logo ufficiale: il file resta esattamente come arriva, senza ritagli né ritocchi.
            </p>
          )}

          <div className="flex flex-wrap gap-2">
            {attuale && (
              <ComandoFile
                accetta={ESTENSIONI_IMMAGINE}
                onFile={metti}
                icona={<RefreshCw size={13} />}
                testo="Sostituisci"
              />
            )}
            <button
              type="button"
              onClick={() => setApriLibreria(true)}
              className="px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wide border border-white/20 text-[var(--tbh-muted)] hover:border-[var(--tbh-neon)] hover:text-white inline-flex items-center gap-1.5"
            >
              <FolderOpen size={13} /> Scegli dalla libreria
            </button>
            {attuale && (
              <button
                type="button"
                onClick={() => setAnteprimaPiena(true)}
                className="px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wide border border-white/20 text-[var(--tbh-muted)] hover:border-white/40 inline-flex items-center gap-1.5"
              >
                <Eye size={13} /> Anteprima
              </button>
            )}
            {attuale && attuale.stato !== "pubblicato" && (
              <button
                type="button"
                onClick={() => pubblica.mutate({ codice, id: attuale.id, stato: "pubblicato" })}
                disabled={pubblica.isPending}
                className="px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wide border border-[var(--tbh-neon)] text-[var(--tbh-neon)] disabled:opacity-40"
              >
                Pubblica
              </button>
            )}
            {attuale && attuale.stato === "pubblicato" && (
              <button
                type="button"
                onClick={() => pubblica.mutate({ codice, id: attuale.id, stato: "bozza" })}
                disabled={pubblica.isPending}
                className="px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wide border border-white/20 text-[var(--tbh-muted)] disabled:opacity-40"
              >
                Riporta in bozza
              </button>
            )}
            <button
              type="button"
              onClick={() => setApriLink((v) => !v)}
              className="px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wide border border-white/20 text-[var(--tbh-muted)] hover:border-white/40 inline-flex items-center gap-1.5"
            >
              <Link2 size={13} /> Link esterno
            </button>
            {attuale && (
              <button
                type="button"
                onClick={() => chiedi(attuale.id)}
                disabled={inEliminazione}
                className="px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wide border border-red-400/40 text-red-300 hover:bg-red-400/10 inline-flex items-center gap-1.5 disabled:opacity-40"
              >
                <Trash2 size={13} /> Rimuovi
              </button>
            )}
          </div>

          {apriLink && (
            <form
              className="flex flex-wrap gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                const u = link.trim();
                if (!/^https:\/\/\S+$/i.test(u)) return;
                salvaLink.mutate(
                  { codice, slot, url: u, tipo, titolo, stato: bozza ? "bozza" : "pubblicato" },
                  {
                    onSuccess: () => {
                      setLink("");
                      setApriLink(false);
                    },
                  },
                );
              }}
            >
              <input
                aria-label="Link dell'immagine già online"
                value={link}
                onChange={(e) => setLink(e.target.value)}
                placeholder="https://… (immagine già online)"
                className="grow min-w-[220px] rounded-xl bg-black/50 border border-white/15 px-3 py-2 text-xs outline-none focus:border-[var(--tbh-neon)]"
              />
              <button type="submit" className="tbh-neon-btn px-4 py-2 text-xs">
                Usa il link
              </button>
            </form>
          )}

          {riquadro}
          {errore && <p className="text-xs text-red-400">Non riuscito: {errore.message}</p>}
          {bozza && !attuale && (
            <p className="text-[11px] text-[var(--tbh-muted)]">
              L'immagine può arrivare dopo: la scheda si salva comunque in bozza.
            </p>
          )}
        </div>
      )}

      {!admin && !attuale && <SbloccoSeServe />}

      {apriLibreria && (
        <SelettoreLibreria
          slot={slot}
          soloTipo={tipo === "documento" ? "documento" : undefined}
          onChiudi={() => setApriLibreria(false)}
        />
      )}

      {anteprimaPiena && attuale && (
        <div
          className="fixed inset-0 z-50 bg-black/90 grid place-items-center p-6"
          onClick={() => setAnteprimaPiena(false)}
        >
          <img src={attuale.urlOriginale ?? attuale.url} alt="" className="max-h-full max-w-full" />
        </div>
      )}
    </section>
  );
}

/** Pulsante «carica un file» senza riquadro: per SOSTITUISCI e AGGIUNGI FOTO. */
function ComandoFile({
  accetta,
  onFile,
  icona,
  testo,
  multiplo,
}: {
  accetta: string;
  onFile: (f: File[]) => void;
  icona: React.ReactNode;
  testo: string;
  multiplo?: boolean;
}) {
  const input = useRef<HTMLInputElement | null>(null);
  return (
    <>
      <button
        type="button"
        onClick={() => input.current?.click()}
        className="px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wide border border-white/20 text-[var(--tbh-muted)] hover:border-[var(--tbh-neon)] hover:text-white inline-flex items-center gap-1.5"
      >
        {icona} {testo}
      </button>
      <input
        ref={input}
        aria-label={testo}
        type="file"
        accept={accetta}
        multiple={multiplo}
        className="hidden"
        onChange={(e) => {
          const files = Array.from(e.target.files ?? []);
          if (files.length > 0) onFile(multiplo ? files : [files[0]]);
          e.target.value = "";
        }}
      />
    </>
  );
}

/**
 * Invito discreto a sbloccare: compare solo dove il campo è vuoto, oppure in fondo
 * a una pagina pubblica per dare all'amministratore la via d'ingresso senza mostrare
 * ai visitatori un riquadro di password.
 */
export function SbloccoSeServe() {
  const stato = useStatoAllestimento();
  const [apri, setApri] = useState(false);
  if (stato.data && !stato.data.attivo) return null;
  if (!apri) {
    return (
      <button
        type="button"
        onClick={() => setApri(true)}
        className="justify-self-start text-[10px] uppercase tracking-wide text-[var(--tbh-muted)] hover:text-white underline"
      >
        Sono l'amministratore: sblocca il caricamento
      </button>
    );
  }
  return <SbloccoAllestimento />;
}

/* ───────────────────────────────── CAMPO GALLERY ───────────────────────────────── */

type CampoGalleryProps = {
  slot: string;
  etichetta: string;
  aiuto?: string;
  tipo?: TipoMediaCaricamento;
  nascondiSeVuoto?: boolean;
  /** Colonne della griglia pubblica. */
  colonne?: string;
};

/**
 * PIÙ IMMAGINI: gallery, pagine del magazine, book fotografico, foto di una partita.
 * «+ AGGIUNGI FOTO, riordinare, sostituire, eliminare, scegliere l'immagine principale.»
 * La principale è la prima della fila: il pulsante ⭐ la porta in testa.
 */
export function CampoGallery({
  slot,
  etichetta,
  aiuto,
  tipo = "immagine",
  nascondiSeVuoto = false,
  colonne = "sm:grid-cols-3 lg:grid-cols-4",
}: CampoGalleryProps) {
  const { codice } = useCodiceAllestimento();
  const stato = useStatoAllestimento();
  const q = useMediaSlot(slot, codice || undefined);
  const carica = useCaricaMedia();
  const sostituisci = useSostituisciMedia();
  const riordina = useRiordinaMedia();
  const pubblica = usePubblicaMedia();
  const { chiedi, riquadro } = useEliminaConAvviso();
  const [apriLibreria, setApriLibreria] = useState(false);
  const [incorso, setIncorso] = useState(0);

  const items = useMemo(() => {
    const v = [...((q.data?.items ?? []) as Materiale[])];
    v.sort((a, b) => a.ordine - b.ordine || a.id - b.id);
    return v;
  }, [q.data]);

  const admin = codice.length > 0 && (stato.data?.attivo ?? true);
  if (items.length === 0 && !admin && nascondiSeVuoto) return null;

  async function aggiungi(files: File[]) {
    setIncorso(files.length);
    let ordine = items.length;
    for (const file of files) {
      ordine += 1;
      try {
        await carica.mutateAsync({ codice, slot, file, tipo, ordine });
      } finally {
        setIncorso((n) => Math.max(0, n - 1));
      }
    }
  }

  function muovi(id: number, verso: -1 | 1) {
    const i = items.findIndex((m) => m.id === id);
    const j = i + verso;
    if (i < 0 || j < 0 || j >= items.length) return;
    const ordinati = [...items];
    const [preso] = ordinati.splice(i, 1);
    ordinati.splice(j, 0, preso);
    riordina.mutate({ codice, ids: ordinati.map((m) => m.id) });
  }

  function principale(id: number) {
    const resto = items.filter((m) => m.id !== id).map((m) => m.id);
    riordina.mutate({ codice, ids: [id, ...resto] });
  }

  return (
    <section className="grid gap-3">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--tbh-gold)]">
          {etichetta}
        </h3>
        <span className="text-[11px] text-[var(--tbh-muted)]">
          {items.length === 0
            ? "nessuna foto"
            : `${items.length} ${items.length === 1 ? "foto" : "foto"}`}
        </span>
      </div>

      {items.length > 0 && (
        <div className={`grid gap-4 ${colonne}`}>
          {items.map((m, i) => (
            <article
              key={m.id}
              className="rounded-2xl border border-white/10 bg-black/40 overflow-hidden"
            >
              <div className="h-[130px] bg-white grid place-items-center overflow-hidden relative">
                {documento(m) ? (
                  <span className="text-black/70 text-[10px] font-bold uppercase">Documento</span>
                ) : (
                  <img
                    src={m.url}
                    alt={m.descrizione ?? m.titolo ?? ""}
                    loading="lazy"
                    className="max-h-[126px] w-auto object-contain"
                  />
                )}
                {i === 0 && (
                  <span className="absolute top-2 left-2 rounded-full bg-black/80 text-[9px] font-bold uppercase tracking-wide px-2 py-1 text-[var(--tbh-gold)]">
                    Principale
                  </span>
                )}
              </div>
              {admin && (
                <div className="p-2 grid gap-2">
                  <Stato stato={m.stato} />
                  <div className="flex flex-wrap gap-1">
                    <button
                      type="button"
                      aria-label="Sposta indietro"
                      onClick={() => muovi(m.id, -1)}
                      disabled={i === 0 || riordina.isPending}
                      className="rounded-full border border-white/15 p-1.5 text-[var(--tbh-muted)] hover:text-white disabled:opacity-30"
                    >
                      <ArrowUp size={12} />
                    </button>
                    <button
                      type="button"
                      aria-label="Sposta avanti"
                      onClick={() => muovi(m.id, 1)}
                      disabled={i === items.length - 1 || riordina.isPending}
                      className="rounded-full border border-white/15 p-1.5 text-[var(--tbh-muted)] hover:text-white disabled:opacity-30"
                    >
                      <ArrowDown size={12} />
                    </button>
                    <button
                      type="button"
                      aria-label="Scegli come immagine principale"
                      onClick={() => principale(m.id)}
                      disabled={i === 0 || riordina.isPending}
                      className="rounded-full border border-white/15 p-1.5 text-[var(--tbh-gold)] hover:bg-white/5 disabled:opacity-30"
                    >
                      <Star size={12} />
                    </button>
                    <ComandoFile
                      accetta={ESTENSIONI_IMMAGINE}
                      icona={<RefreshCw size={12} />}
                      testo=""
                      onFile={(f) =>
                        sostituisci.mutate({ codice, id: m.id, slot, file: f[0], tipo })
                      }
                    />
                    {m.stato !== "pubblicato" ? (
                      <button
                        type="button"
                        onClick={() => pubblica.mutate({ codice, id: m.id, stato: "pubblicato" })}
                        className="rounded-full border border-[var(--tbh-neon)]/60 p-1.5 text-[var(--tbh-neon)]"
                        aria-label="Pubblica questa foto"
                      >
                        <Check size={12} />
                      </button>
                    ) : null}
                    <button
                      type="button"
                      aria-label="Elimina questa foto"
                      onClick={() => chiedi(m.id)}
                      className="rounded-full border border-red-400/40 p-1.5 text-red-300 hover:bg-red-400/10"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              )}
            </article>
          ))}
        </div>
      )}

      {admin ? (
        <div className="grid gap-3">
          <ZonaCaricamento
            accetta={ESTENSIONI_IMMAGINE}
            multiplo
            altezza={items.length > 0 ? "h-[110px]" : "h-[180px]"}
            onFile={aggiungi}
          >
            {incorso > 0 ? (
              <span className="text-xs text-[var(--tbh-muted)] inline-flex items-center gap-2">
                <Loader2 size={15} className="animate-spin" /> Carico {incorso} file…
              </span>
            ) : undefined}
          </ZonaCaricamento>
          <div className="flex flex-wrap gap-2">
            <ComandoFile
              accetta={ESTENSIONI_IMMAGINE}
              multiplo
              icona={<Plus size={13} />}
              testo="Aggiungi foto"
              onFile={aggiungi}
            />
            <button
              type="button"
              onClick={() => setApriLibreria(true)}
              className="px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wide border border-white/20 text-[var(--tbh-muted)] hover:border-[var(--tbh-neon)] hover:text-white inline-flex items-center gap-1.5"
            >
              <FolderOpen size={13} /> Scegli dalla libreria
            </button>
          </div>
          {aiuto && <p className="text-[11px] text-[var(--tbh-muted)]">{aiuto}</p>}
          {riquadro}
          {carica.isError && (
            <p className="text-xs text-red-400">
              Una foto non è stata caricata: {(carica.error as Error).message}
            </p>
          )}
        </div>
      ) : (
        items.length === 0 && (
          <div className="rounded-2xl border border-dashed border-white/20 p-5">
            <p className="text-xs text-[var(--tbh-muted)]">
              Gallery ancora vuota: le foto vanno caricate dal pannello, nessun riempitivo.
            </p>
          </div>
        )
      )}

      {apriLibreria && (
        <SelettoreLibreria slot={slot} onChiudi={() => setApriLibreria(false)} />
      )}
    </section>
  );
}

/* ───────────────────────────────── CAMPO ALLEGATI ───────────────────────────────── */

type CampoAllegatiProps = {
  slot: string;
  etichetta: string;
  aiuto?: string;
  /** Documenti riservati (CV, liberatorie): visibili solo in amministrazione. */
  riservato?: boolean;
  /** Se vero, ai visitatori il campo senza allegati non compare affatto. */
  nascondiSeVuoto?: boolean;
};

/**
 * DOCUMENTI, separati dalle foto: CV, portfolio in PDF, liberatorie, listini.
 * Con `riservato` i file NON compaiono ai visitatori: «non esporre pubblicamente
 * documenti privati, CV, candidature».
 */
export function CampoAllegati({
  slot,
  etichetta,
  aiuto,
  riservato = false,
  nascondiSeVuoto = false,
}: CampoAllegatiProps) {
  const { codice } = useCodiceAllestimento();
  const stato = useStatoAllestimento();
  const q = useMediaSlot(slot, codice || undefined);
  const carica = useCaricaMedia();
  const { chiedi, riquadro } = useEliminaConAvviso();
  const items = (q.data?.items ?? []) as Materiale[];
  const admin = codice.length > 0 && (stato.data?.attivo ?? true);

  if (riservato && !admin) return null;
  if (nascondiSeVuoto && !admin && items.length === 0) return null;

  return (
    <section className="grid gap-3">
      <h3 className="text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--tbh-gold)]">
        {etichetta}
      </h3>
      {items.length > 0 && (
        <ul className="grid gap-2">
          {items.map((m) => (
            <li
              key={m.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/10 bg-black/40 px-3 py-2"
            >
              <a
                href={m.url}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-white hover:text-[var(--tbh-neon)] truncate"
              >
                {m.titolo ?? m.chiave.split("/").pop()}
              </a>
              <span className="text-[10px] text-[var(--tbh-muted)]">
                {pesoLeggibile(m.peso)}
                {admin && (
                  <button
                    type="button"
                    onClick={() => chiedi(m.id)}
                    className="ml-3 text-red-300 hover:underline"
                  >
                    rimuovi
                  </button>
                )}
              </span>
            </li>
          ))}
        </ul>
      )}
      {admin && (
        <div className="grid gap-2">
          <ZonaCaricamento
            accetta={ESTENSIONI_DOCUMENTO}
            multiplo
            nome="documenti"
            altezza="h-[110px]"
            onFile={(files) => {
              for (const file of files) {
                carica.mutate({ codice, slot, file, tipo: "documento", titolo: file.name });
              }
            }}
          />
          {aiuto && <p className="text-[11px] text-[var(--tbh-muted)]">{aiuto}</p>}
          {riservato && (
            <p className="text-[11px] text-[var(--tbh-gold)]">
              Documenti riservati: restano visibili solo in amministrazione, mai al pubblico.
            </p>
          )}
          {riquadro}
        </div>
      )}
      {!admin && items.length === 0 && (
        <p className="text-xs text-[var(--tbh-muted)]">Nessun allegato disponibile.</p>
      )}
    </section>
  );
}

/* ───────────────────────── BARRA DEI COMANDI DI AMMINISTRAZIONE ───────────────────────── */

type BarraProps = {
  titolo: string;
  /** Cosa si sta amministrando, in chiaro (es. «Influencity Magazine — N°31»). */
  sezione?: string;
  children?: React.ReactNode;
};

/**
 * Barra visibile SOLO all'amministratore sbloccato: raccoglie i comandi della sezione
 * (modifica, carica, aggiungi, anteprima, salva, pubblica) sotto un'unica intestazione,
 * così Claudio sa sempre dove sta lavorando.
 */
export function BarraAmministrazione({ titolo, sezione, children }: BarraProps) {
  const { codice, salva } = useCodiceAllestimento();
  const stato = useStatoAllestimento();
  const [apri, setApri] = useState(true);

  if (stato.data && !stato.data.attivo) return null;
  if (!codice) return <SbloccoAllestimento />;

  return (
    <div className="tbh-card p-4 md:p-5 grid gap-4 border-[var(--tbh-neon)]/30">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[10px] tracking-[0.25em] text-[var(--tbh-neon)] uppercase">
            Amministrazione TBH
          </p>
          <h2 className="tbh-display text-xl leading-tight">{titolo}</h2>
          {sezione && <p className="text-[11px] text-[var(--tbh-muted)] mt-0.5">{sezione}</p>}
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setApri((v) => !v)}
            className="px-4 py-2 rounded-full text-[11px] font-bold uppercase tracking-wide border border-white/20 text-[var(--tbh-muted)] hover:text-white"
          >
            {apri ? "Chiudi pannello" : "Modifica"}
          </button>
          <button
            type="button"
            onClick={() => salva("")}
            className="px-4 py-2 rounded-full text-[11px] font-bold uppercase tracking-wide border border-white/20 text-[var(--tbh-muted)] hover:text-white"
          >
            Blocca
          </button>
        </div>
      </div>
      {apri && <div className="grid gap-6">{children}</div>}
    </div>
  );
}

/** Piccolo aiuto: `useEffect` serve solo a liberare le anteprime temporanee. */
export function useAnteprimaFile(file: File | null) {
  const url = useMemo(
    () => (file && file.type.startsWith("image/") ? URL.createObjectURL(file) : null),
    [file],
  );
  useEffect(
    () => () => {
      if (url) URL.revokeObjectURL(url);
    },
    [url],
  );
  return url;
}
