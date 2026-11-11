import { useState } from "react";
import { Clapperboard, Loader2, Music2, Play, Save, RotateCcw, Film, Users } from "lucide-react";
import { Link } from "wouter";
import { Copertina, useCopertine, type MaterialeVisuale } from "./immagine-tbh";
import { SbloccoSeServe } from "./media-manager";
import { useCodiceAllestimento } from "../lib/codice-allestimento";
import { useAzzeraVideoBrano, useSalvaVideoBrano } from "../queries/musica";
import {
  FASI_PRODUZIONE,
  type BranoMaster,
  type ClasseBrano,
  type FaseProduzione,
  type StatoVideo,
} from "../../api/data/musica";

/* ══════════════════════════════════════════════════════════════════════════════
   BRANO TBH — il modo unico in cui il sito mostra un brano. Priorità 2ter,
   ordine di Claudio del 29 settembre 2026:

   «I brani sono AUDIO PUBBLICATO, non produzioni audiovisive già realizzate.
    Ogni brano deve dichiarare: 🎵 SOLO AUDIO · 🎵+🎬 VIDEO IN PRODUZIONE ·
    🎵+🎬 AUDIO & VIDEO. Vietato mostrare il simbolo VIDEO su brani che hanno
    solo audio, vietato un player video falso, vietato usare la cover come se
    fosse un videoclip. Quando esce il videoclip NON si crea una seconda scheda:
    si aggiorna quella del brano.»

   Perché sta in un file solo (regola anti-doppioni): la scheda del brano è la
   stessa a Musica, a J.C. Hugò, a Produzioni e a Road to 2030. Cambia solo il
   filtro con cui la pagina la chiama, non il disegno e non le etichette.
   ══════════════════════════════════════════════════════════════════════════════ */

/** Le tre etichette, scritte in un posto solo. */
export const CLASSI: Record<ClasseBrano, { segno: string; nome: string; colore: string }> = {
  "solo-audio": { segno: "🎵", nome: "SOLO AUDIO", colore: "#8ab4ff" },
  "video-in-produzione": { segno: "🎵+🎬", nome: "VIDEO IN PRODUZIONE", colore: "#ffb347" },
  "audio-e-video": { segno: "🎵+🎬", nome: "AUDIO & VIDEO", colore: "#49d67e" },
};

/**
 * LE SETTE FASI interne del videoclip in produzione, nell'ordine dell'ordine del
 * 29/09/2026: CONCEPT → CASTING → PRE-PRODUZIONE → RIPRESE → MONTAGGIO →
 * POST-PRODUZIONE → COMPLETAMENTO. Nessuna fase si mostra se non è registrata.
 */
export const NOMI_FASE: Record<FaseProduzione, string> = {
  concept: "CONCEPT",
  casting: "CASTING",
  "pre-produzione": "PRE-PRODUZIONE",
  riprese: "RIPRESE",
  montaggio: "MONTAGGIO",
  "post-produzione": "POST-PRODUZIONE",
  completamento: "COMPLETAMENTO",
};

/** Il casting agganciato al brano, così come lo restituisce il catalogo. */
export type CastingDelBrano = {
  slug: string;
  titolo: string;
  stato: string;
  scadenza: string | null;
  ruoli: unknown;
};

/** L'etichetta di stato: un brano non compare mai senza. */
export function StatoBrano({ classe, piccola = false }: { classe: ClasseBrano; piccola?: boolean }) {
  const c = CLASSI[classe];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border font-bold uppercase tracking-wide ${
        piccola ? "px-2 py-0.5 text-[9px]" : "px-3 py-1 text-[10px]"
      }`}
      style={{ borderColor: `${c.colore}88`, color: c.colore, background: `${c.colore}14` }}
    >
      <span aria-hidden>{c.segno}</span> {c.nome}
    </span>
  );
}

/**
 * L'ETICHETTA DEL CASTING — «finché non è stato aperto un casting NON mostrare
 * CASTING APERTO, e appena si chiude l'etichetta deve sparire». Per questo non è
 * mai scritta a mano: compare solo se il catalogo restituisce un casting reale.
 */
export function EtichettaCasting({ casting }: { casting: CastingDelBrano }) {
  const inSelezione = casting.stato === "in-selezione";
  const colore = inSelezione ? "#c08cff" : "#b26bff";
  return (
    <Link
      href={`/casting/${casting.slug}`}
      className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-wide"
      style={{ borderColor: `${colore}88`, color: colore, background: `${colore}14` }}
    >
      <Users size={11} /> {inSelezione ? "Casting in selezione" : "Casting aperto"}
    </Link>
  );
}

type Brano = BranoMaster & { nota?: string | null; casting?: CastingDelBrano | null };

/**
 * LA SCHEDA DEL BRANO — una sola, che cresce.
 *
 * Solo audio:              cover · titolo · 🎵 AUDIO PUBBLICATO · [▶ ASCOLTA] ·
 *                          VIDEOCLIP DA REALIZZARE · [ROAD TO 2030]
 * Video in produzione:     come sopra + 🎬 VIDEOCLIP IN PRODUZIONE (fase reale)
 * Audio & video:           cover audio + anteprima video · [▶ ASCOLTA] + 🎬 [GUARDA]
 */
export function SchedaBrano({
  brano,
  copertina,
  regia = false,
}: {
  brano: Brano;
  /** Copertina d'artista caricata dal pannello: vince su quella della pubblicazione. */
  copertina?: MaterialeVisuale;
  /** Mostra i comandi di produzione a chi ha il codice di allestimento. */
  regia?: boolean;
}) {
  const c = CLASSI[brano.classe];
  const immagine =
    copertina ?? (brano.cover ? { url: brano.cover, tipo: "copertina", titolo: brano.titolo } : undefined);
  const anteprimaVideo =
    brano.classe === "audio-e-video" && brano.thumbnailVideo
      ? { url: brano.thumbnailVideo, tipo: "thumbnail", titolo: `${brano.titolo} — videoclip` }
      : undefined;

  return (
    <article
      className="tbh-card flex flex-col gap-3 p-3"
      style={{ borderColor: `${c.colore}55` }}
    >
      <div className={anteprimaVideo ? "grid grid-cols-2 gap-2" : ""}>
        <Copertina
          item={immagine}
          tipo="copertina"
          uso="card"
          alt={`${brano.titolo} — copertina dell'uscita audio`}
          nota="Copertina del brano da caricare"
        />
        {anteprimaVideo && (
          <Copertina
            item={anteprimaVideo}
            tipo="thumbnail"
            uso="card"
            alt={`${brano.titolo} — anteprima del videoclip`}
            nota="Anteprima del videoclip da caricare"
          />
        )}
      </div>

      <div className="flex flex-col gap-1">
        <h3 className="tbh-display text-base leading-tight">{brano.titolo}</h3>
        <p className="text-[11px] uppercase tracking-wide text-[var(--tbh-muted)]">
          {brano.artista}
          {/* Anno/data: si scrive solo se la direzione l'ha registrato. */}
          {brano.anno ? ` · ${brano.anno}` : ""}
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
        <StatoBrano classe={brano.classe} />
        {/* CASTING APERTO — compare solo se esiste davvero un casting aperto o in selezione. */}
        {brano.casting && <EtichettaCasting casting={brano.casting} />}
      </div>

      {/* BLOCCO AUDIO — l'unica cosa certa di ogni brano. */}
      <div className="flex flex-col gap-2 rounded-xl border border-[var(--tbh-line)] p-3">
        <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-[var(--tbh-platinum)]">
          <Music2 size={13} /> Audio pubblicato
        </span>
        <span className="text-[10px] text-[var(--tbh-muted)]">{brano.fonte}</span>
        <a
          href={brano.audioUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 self-start rounded-full px-3 py-1.5 text-[11px] font-bold uppercase tracking-wide text-black"
          style={{ background: CLASSI["solo-audio"].colore }}
        >
          <Play size={12} /> Ascolta
        </a>
      </div>

      {/* BLOCCO VIDEO — cambia con lo stato, e mai prima. */}
      {brano.classe === "solo-audio" && (
        <div className="flex flex-col gap-2 rounded-xl border border-dashed border-[var(--tbh-line)] p-3">
          <span className="text-[11px] font-bold uppercase tracking-wide text-[var(--tbh-muted)]">
            Videoclip da realizzare
          </span>
          <Link
            href="/tbh/produzioni/road-to-2030"
            className="inline-flex items-center gap-1.5 self-start rounded-full border px-3 py-1.5 text-[11px] font-bold uppercase tracking-wide"
            style={{ borderColor: "var(--tbh-gold)", color: "var(--tbh-gold)" }}
          >
            <Film size={12} /> Road to 2030
          </Link>
        </div>
      )}

      {brano.classe === "video-in-produzione" && (
        <div
          className="flex flex-col gap-1.5 rounded-xl border p-3"
          style={{ borderColor: `${CLASSI["video-in-produzione"].colore}66` }}
        >
          <span
            className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide"
            style={{ color: CLASSI["video-in-produzione"].colore }}
          >
            <Clapperboard size={13} /> Videoclip in produzione
          </span>
          <span className="text-[11px] text-[var(--tbh-muted)]">
            {brano.statoProduzione
              ? `Stato: ${NOMI_FASE[brano.statoProduzione]}`
              : "Fase di lavorazione da registrare"}
            {brano.annoVideoPrevisto ? ` · uscita prevista ${brano.annoVideoPrevisto}` : ""}
          </span>
        </div>
      )}

      {brano.classe === "audio-e-video" && brano.videoUrl && (
        <div
          className="flex flex-col gap-2 rounded-xl border p-3"
          style={{ borderColor: `${CLASSI["audio-e-video"].colore}66` }}
        >
          <span
            className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide"
            style={{ color: CLASSI["audio-e-video"].colore }}
          >
            <Clapperboard size={13} /> Videoclip ufficiale
          </span>
          <a
            href={brano.videoUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 self-start rounded-full px-3 py-1.5 text-[11px] font-bold uppercase tracking-wide text-black"
            style={{ background: CLASSI["audio-e-video"].colore }}
          >
            <Play size={12} /> Guarda
          </a>
        </div>
      )}

      {/* BLOCCO CASTING — solo se c'è un casting reale agganciato a questo brano. */}
      {brano.casting && (
        <div className="flex flex-col gap-2 rounded-xl border p-3" style={{ borderColor: "#b26bff66" }}>
          <span
            className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide"
            style={{ color: "#b26bff" }}
          >
            <Users size={13} /> {brano.casting.titolo}
          </span>
          {brano.casting.scadenza && (
            <span className="text-[11px] text-[var(--tbh-muted)]">
              Candidature entro il {brano.casting.scadenza}
            </span>
          )}
          <div className="flex flex-wrap gap-2">
            <Link
              href={`/casting/${brano.casting.slug}`}
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-bold uppercase tracking-wide text-black"
              style={{ background: "#b26bff" }}
            >
              <Users size={12} /> Casting
            </Link>
            <Link
              href={`/casting/${brano.casting.slug}`}
              className="inline-flex items-center gap-1.5 rounded-full border border-[var(--tbh-line)] px-3 py-1.5 text-[11px] font-bold uppercase tracking-wide hover:border-white"
            >
              Dettagli
            </Link>
          </div>
        </div>
      )}

      {brano.genere && (
        <span className="text-[10px] uppercase tracking-wide text-[var(--tbh-muted)]">
          Genere: {brano.genere}
        </span>
      )}

      {regia && <RegiaVideoBrano brano={brano} />}
    </article>
  );
}

/**
 * REGIA DELLA PRODUZIONE — dove la direzione dichiara lo stato del videoclip.
 *
 * È l'unico punto in cui un brano cambia stato: il sito non lo indovina. Senza il
 * codice di allestimento questi comandi non compaiono e il server li rifiuta.
 */
export function RegiaVideoBrano({ brano }: { brano: Brano }) {
  const { codice } = useCodiceAllestimento();
  const salva = useSalvaVideoBrano();
  const azzera = useAzzeraVideoBrano();
  const [apri, setApri] = useState(false);
  const [stato, setStato] = useState<StatoVideo>(brano.statoVideo);
  const [fase, setFase] = useState<FaseProduzione>(brano.statoProduzione ?? "concept");
  const [video, setVideo] = useState(brano.videoUrl ?? "");
  const [thumb, setThumb] = useState(brano.thumbnailVideo ?? "");
  const [anno, setAnno] = useState(brano.annoVideoPrevisto ?? "");
  const [genere, setGenere] = useState(brano.genere ?? "");
  const [errore, setErrore] = useState<string | null>(null);

  if (!codice) {
    return (
      <div className="border-t border-[var(--tbh-line)] pt-2">
        <SbloccoSeServe />
      </div>
    );
  }

  if (!apri) {
    return (
      <button
        type="button"
        onClick={() => setApri(true)}
        className="self-start border-t border-[var(--tbh-line)] pt-2 text-[10px] uppercase tracking-wide text-[var(--tbh-muted)] underline hover:text-white"
      >
        Stato videoclip
      </button>
    );
  }

  const invia = () => {
    setErrore(null);
    salva.mutate(
      {
        codice,
        branoId: brano.id,
        statoVideo: stato,
        statoProduzione: stato === "in-produzione" ? fase : null,
        videoUrl: video,
        thumbnailVideo: thumb,
        annoVideoPrevisto: anno,
        genere,
      },
      {
        onSuccess: () => setApri(false),
        onError: (e: unknown) => setErrore(e instanceof Error ? e.message : "Salvataggio rifiutato."),
      },
    );
  };

  return (
    <div className="flex flex-col gap-2 border-t border-[var(--tbh-line)] pt-3">
      <span className="text-[10px] font-bold uppercase tracking-wide text-[var(--tbh-gold)]">
        Produzione videoclip · {brano.id}
      </span>

      <label className="flex flex-col gap-1 text-[10px] uppercase tracking-wide text-[var(--tbh-muted)]">
        Stato
        <select
          value={stato}
          onChange={(e) => setStato(e.target.value as StatoVideo)}
          className="rounded-lg border border-[var(--tbh-line)] bg-black/40 px-2 py-1.5 text-xs text-white"
        >
          <option value="da-realizzare">Solo audio — videoclip da realizzare</option>
          <option value="in-produzione">Videoclip in produzione</option>
          <option value="pubblicato">Audio &amp; video — videoclip pubblicato</option>
        </select>
      </label>

      {stato === "in-produzione" && (
        <label className="flex flex-col gap-1 text-[10px] uppercase tracking-wide text-[var(--tbh-muted)]">
          Fase
          <select
            value={fase}
            onChange={(e) => setFase(e.target.value as FaseProduzione)}
            className="rounded-lg border border-[var(--tbh-line)] bg-black/40 px-2 py-1.5 text-xs text-white"
          >
            {FASI_PRODUZIONE.map((f) => (
              <option key={f} value={f}>
                {NOMI_FASE[f]}
              </option>
            ))}
          </select>
        </label>
      )}

      {stato !== "da-realizzare" && (
        <>
          <input
            value={video}
            onChange={(e) => setVideo(e.target.value)}
            placeholder="Indirizzo del videoclip (obbligatorio per pubblicarlo)"
            className="rounded-lg border border-[var(--tbh-line)] bg-black/40 px-2 py-1.5 text-xs text-white"
          />
          <input
            value={thumb}
            onChange={(e) => setThumb(e.target.value)}
            placeholder="Anteprima del videoclip (immagine reale)"
            className="rounded-lg border border-[var(--tbh-line)] bg-black/40 px-2 py-1.5 text-xs text-white"
          />
        </>
      )}

      <div className="grid grid-cols-2 gap-2">
        <input
          value={anno}
          onChange={(e) => setAnno(e.target.value)}
          placeholder="Anno previsto"
          className="rounded-lg border border-[var(--tbh-line)] bg-black/40 px-2 py-1.5 text-xs text-white"
        />
        <input
          value={genere}
          onChange={(e) => setGenere(e.target.value)}
          placeholder="Genere"
          className="rounded-lg border border-[var(--tbh-line)] bg-black/40 px-2 py-1.5 text-xs text-white"
        />
      </div>

      {errore && <p className="text-[11px] text-red-400">{errore}</p>}

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={invia}
          disabled={salva.isPending}
          className="inline-flex items-center gap-1.5 rounded-full bg-[var(--tbh-gold)] px-3 py-1.5 text-[10px] font-bold uppercase tracking-wide text-black disabled:opacity-50"
        >
          {salva.isPending ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />} Salva
        </button>
        <button
          type="button"
          onClick={() => azzera.mutate({ codice, branoId: brano.id }, { onSuccess: () => setApri(false) })}
          disabled={azzera.isPending}
          className="inline-flex items-center gap-1.5 rounded-full border border-[var(--tbh-line)] px-3 py-1.5 text-[10px] font-bold uppercase tracking-wide hover:border-white disabled:opacity-50"
        >
          <RotateCcw size={12} /> Torna a solo audio
        </button>
        <button
          type="button"
          onClick={() => setApri(false)}
          className="text-[10px] uppercase tracking-wide text-[var(--tbh-muted)] underline hover:text-white"
        >
          Chiudi
        </button>
      </div>
    </div>
  );
}

/**
 * UNA GRIGLIA DI BRANI, con una sola chiamata all'archivio immagini.
 * Se l'elenco filtrato è vuoto lo dice: nessun riempimento con brani che non
 * appartengono a quella sezione.
 */
export function GrigliaBrani({
  brani,
  vuoto,
  regia = false,
  colonne = "sm:grid-cols-2 lg:grid-cols-4",
}: {
  brani: Brano[];
  vuoto: string;
  regia?: boolean;
  colonne?: string;
}) {
  const { trova } = useCopertine("brano:");
  if (brani.length === 0) {
    return (
      <p className="tbh-card p-4 text-sm text-[var(--tbh-muted)]">{vuoto}</p>
    );
  }
  return (
    <div className={`grid gap-3 ${colonne}`}>
      {brani.map((b) => (
        <SchedaBrano key={b.id} brano={b} copertina={trova(b.slotCover, "copertina")} regia={regia} />
      ))}
    </div>
  );
}

/** I contatori del catalogo: gli stessi numeri a Musica, Produzioni e Road to 2030. */
export function ContatoriCatalogo({
  conteggi,
  colore = "var(--tbh-gold)",
}: {
  conteggi: {
    audioPubblicati: number;
    videoclipPubblicati: number;
    videoclipInProduzione: number;
    videoclipDaRealizzare: number;
    /** Percentuale di catalogo già diventata videoclip: calcolata dal server. */
    avanzamento?: number;
  };
  colore?: string;
}) {
  const voci = [
    { k: "Brani audio pubblicati", v: `${conteggi.audioPubblicati}` },
    { k: "Videoclip pubblicati", v: `${conteggi.videoclipPubblicati}` },
    { k: "Videoclip in produzione", v: `${conteggi.videoclipInProduzione}` },
    { k: "Videoclip da realizzare", v: `${conteggi.videoclipDaRealizzare}` },
    ...(conteggi.avanzamento === undefined
      ? []
      : [{ k: "Avanzamento verso il 2030", v: `${conteggi.avanzamento}%` }]),
  ];
  return (
    <dl className={`grid gap-3 sm:grid-cols-2 ${voci.length > 4 ? "lg:grid-cols-5" : "lg:grid-cols-4"}`}>
      {voci.map((n) => (
        <div key={n.k} className="tbh-card px-3 py-4 text-center">
          <dd className="tbh-display text-3xl leading-none" style={{ color: colore }}>
            {n.v}
          </dd>
          <dt className="mt-1 text-[10px] uppercase tracking-wider text-[var(--tbh-muted)]">{n.k}</dt>
        </div>
      ))}
    </dl>
  );
}
