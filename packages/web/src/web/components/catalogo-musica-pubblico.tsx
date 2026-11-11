import { useMemo, useState } from "react";
import { Link } from "wouter";
import {
  ChevronLeft,
  ChevronRight,
  Clapperboard,
  ExternalLink,
  Film,
  Image as ImageIcon,
  ListMusic,
  Play,
  Search,
  Users,
  X,
} from "lucide-react";

import { useCatalogoMusicale } from "../queries/catalogo-musicale";
import { CLASSE_FRECCIA_FILA, useFilaScorrevole } from "./carosello-orizzontale";
import { useUscitaDelBrano } from "../queries/uscite-musicali";
import { PulsantiUscita } from "./uscite-musicali";
import { PERCORSI_MUSICA } from "../../api/data/uscite-musicali";

/* ══════════════════════════════════════════════════════════════════════════════
   IL CATALOGO MUSICALE PUBBLICO — correzione della direzione del 29/09/2026.

   «Il sistema è troppo legato al video. La musica deve poter esistere ed essere
    pubblicata anche senza videoclip.»

   Regole rispettate qui, alla lettera:
   · si legge un solo catalogo (catalogoMusicale.catalogo): le schede non si copiano,
     si filtrano — un brano, una scheda, anche quando ha più sorgenti e più versioni;
   · un brano si ascolta con la SUA sorgente reale: se la piattaforma consente il
     player si incorpora il player, altrimenti si mostra la copertina e il pulsante
     d'ascolto esterno. Mai un player video su un brano che ha solo audio;
   · la copertina è quella vera della piattaforma. Se manca si dichiara
     «Cover da caricare»: nessuna immagine generata, nessun ripiego di fantasia;
   · il pulsante del videoclip compare solo se il videoclip esiste per davvero;
   · i numeri e le etichette arrivano dal server, non sono scritti a mano qui;
   · «ULTIME USCITE» si aggiorna da sé: è l'ordine di inserimento delle schede.
   ══════════════════════════════════════════════════════════════════════════════ */

/** I sotto-menu chiesti dalla direzione, in quest'ordine. */
const TAB = [
  { k: "tutti", nome: "Tutti" },
  { k: "ultime", nome: "Ultime uscite" },
  { k: "audio", nome: "Audio" },
  { k: "videoclip", nome: "Videoclip" },
  { k: "playlist", nome: "Playlist" },
  { k: "road", nome: "Road to 2030" },
] as const;
type Tab = (typeof TAB)[number]["k"];

const ORDINI = [
  { k: "recenti", nome: "Ultimi inseriti" },
  { k: "titolo", nome: "Titolo A→Z" },
  { k: "stato", nome: "Stato di lavorazione" },
] as const;
type Ordine = (typeof ORDINI)[number]["k"];

export type Catalogo = NonNullable<ReturnType<typeof useCatalogoMusicale>["data"]>;
export type Brano = Catalogo["brani"][number];
type Sorgente = Brano["sorgenti"][number];

/** La copertina reale del brano. Se non c'è, si dichiara: non si inventa. */
function Copertina({ src, titolo }: { src: string | null; titolo: string }) {
  if (!src)
    return (
      <div className="flex h-full w-full flex-col items-center justify-center gap-1.5 bg-black/50 text-center">
        <ImageIcon size={18} className="text-[var(--tbh-muted)]" />
        <span className="px-2 text-[9px] font-extrabold uppercase tracking-[0.12em] text-[var(--tbh-muted)]">
          Cover da caricare
        </span>
      </div>
    );
  return (
    <img src={src} alt={titolo} loading="lazy" className="h-full w-full object-cover" />
  );
}

/** La sorgente con cui si ascolta il brano: mai una sorgente videoclip. */
function sorgenteAscolto(b: Brano): Sorgente | null {
  const ascoltabili = b.sorgenti.filter((s) => s.tipo !== "videoclip");
  return ascoltabili.find((s) => s.principale) ?? ascoltabili[0] ?? null;
}

/** La sorgente del videoclip, solo se pubblicata per davvero. */
function sorgenteVideo(b: Brano): Sorgente | null {
  return b.sorgenti.find((s) => s.tipo === "videoclip") ?? null;
}

/** «▶ ASCOLTA SU SUNO», «▶ ASCOLTA SU YOUTUBE MUSIC»… il nome vero della piattaforma. */
function etichettaAscolto(d: Catalogo, s: Sorgente | null): string {
  if (!s) return "Ascolto non ancora disponibile";
  const p = d.etichettePiattaforma[s.piattaforma] ?? "";
  if (s.piattaforma === "file-audio") return "Ascolta il file audio";
  return p ? `Ascolta su ${p}` : "Ascolta il brano";
}

/* ──────────────────────────────────────────────────────────────────────────────
   LA SCHEDA DEL BRANO — una sola, usata in tutte le viste.
   ────────────────────────────────────────────────────────────────────────────── */
export function SchedaBrano({ b, d, colore }: { b: Brano; d: Catalogo; colore: string }) {
  const [player, setPlayer] = useState(false);
  const audio = sorgenteAscolto(b);
  const video = sorgenteVideo(b);
  const videoPubblicato = b.statoVideo === "pubblicato" && !!b.videoUrl;
  const embed = audio?.embed ?? b.audioEmbed ?? null;
  const url = audio?.urlOriginale ?? audio?.url ?? b.audioUrl ?? null;
  /* 04/11/2026 (round 16): la scheda di pubblicazione del brano, se c'è (stesso dato della scheda). */
  const { uscita } = useUscitaDelBrano(b.id);

  return (
    <article className="tbh-card flex flex-col overflow-hidden" style={{ borderColor: `${colore}44` }} data-testid={`scheda-catalogo-${b.id}`}>
      {/* IL PLAYER: si apre solo su richiesta e solo se la piattaforma lo consente.
          Un brano audio non mostra mai un riquadro video. */}
      {player && embed ? (
        <div className="relative">
          <iframe
            src={embed}
            title={`Ascolta ${b.titolo}`}
            loading="lazy"
            allow="autoplay; encrypted-media; clipboard-write"
            className="aspect-video w-full border-0 bg-black"
          />
          <button
            type="button"
            onClick={() => setPlayer(false)}
            aria-label="Chiudi il player"
            className="absolute right-2 top-2 grid h-7 w-7 place-items-center rounded-full bg-black/70 text-white hover:bg-black"
          >
            <X size={14} />
          </button>
        </div>
      ) : (
        <div className="relative aspect-square w-full overflow-hidden">
          <Copertina src={b.cover} titolo={b.titolo} />
          {embed && (
            <button
              type="button"
              onClick={() => setPlayer(true)}
              className="absolute inset-0 grid place-items-center bg-black/25 opacity-0 transition hover:opacity-100"
              aria-label={`Ascolta ${b.titolo}`}
            >
              <span
                className="grid h-14 w-14 place-items-center rounded-full text-black"
                style={{ background: colore }}
              >
                <Play size={22} />
              </span>
            </button>
          )}
        </div>
      )}

      <div className="flex flex-1 flex-col gap-2 p-3">
        <h3 className="tbh-display text-base leading-tight">
          {b.titolo || "Scheda da completare"}
        </h3>
        <p className="text-[11px] text-[var(--tbh-muted)]">
          {[b.artista, b.genere, b.anno].filter(Boolean).join(" · ") || "Dati in completamento"}
        </p>

        {/* LE ETICHETTE DI STATO: audio e videoclip stanno accanto, non si sostituiscono. */}
        <div className="flex flex-wrap gap-1.5">
          <span className="rounded-full border border-[var(--tbh-line)] bg-white/5 px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-[0.1em]">
            {b.etichetta.pallino} {b.etichetta.testo}
          </span>
          <span className="rounded-full border border-[var(--tbh-line)] px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-[0.1em] text-[var(--tbh-muted)]">
            {b.etichettaVideo.pallino} {b.etichettaVideo.testo}
          </span>
        </div>

        {/* LE SORGENTI REALI del brano: piattaforma e tipo, come sono in archivio. */}
        {b.sorgenti.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {b.sorgenti.map((s, i) => (
              <span
                key={s.id ?? `${s.url}-${i}`}
                className="rounded-md bg-white/5 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.08em] text-[var(--tbh-muted)]"
              >
                {d.etichettePiattaforma[s.piattaforma]} · {d.etichetteTipo[s.tipo]}
                {s.versione ? ` · ${s.versione}` : ""}
              </span>
            ))}
          </div>
        )}

        {b.versioni.length > 0 && (
          <p className="text-[10px] text-[var(--tbh-muted)]">
            Versioni sulla stessa scheda: {b.versioni.join(" · ")}
          </p>
        )}

        <div className="mt-auto flex flex-col gap-1.5 pt-1">
          {/* ASCOLTO: il player quando c'è, altrimenti il pulsante esterno. Se non
              esiste nessuna sorgente lo si dichiara, senza pulsanti che non portano
              da nessuna parte. */}
          {embed && !player ? (
            <button
              type="button"
              onClick={() => setPlayer(true)}
              className="inline-flex items-center justify-center gap-1.5 rounded-full px-3 py-2 text-[10px] font-extrabold uppercase tracking-[0.1em] text-black"
              style={{ background: colore }}
            >
              <Play size={12} /> Ascolta qui
            </button>
          ) : null}
          {url ? (
            <a
              href={url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-1.5 rounded-full border border-[var(--tbh-line)] px-3 py-2 text-[10px] font-extrabold uppercase tracking-[0.1em] hover:border-[var(--tbh-neon)] hover:text-[var(--tbh-neon)]"
            >
              <ExternalLink size={12} /> ▶ {etichettaAscolto(d, audio)}
            </a>
          ) : uscita ? (
            /* Nessun audio ancora: i pulsanti della pubblicazione (es. Pre-save) o «in arrivo». */
            <PulsantiUscita link={uscita.link} messaggioAttesa={uscita.messaggioAttesa} compatto />
          ) : (
            <span className="rounded-full border border-dashed border-[var(--tbh-line)] px-3 py-2 text-center text-[10px] font-bold uppercase tracking-[0.1em] text-[var(--tbh-muted)]">
              Indirizzo d'ascolto da caricare
            </span>
          )}

          {/* IL VIDEOCLIP: solo se pubblicato davvero. */}
          {videoPubblicato && (
            <a
              href={video?.urlOriginale ?? video?.url ?? b.videoUrl!}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-1.5 rounded-full border px-3 py-2 text-[10px] font-extrabold uppercase tracking-[0.1em]"
              style={{ borderColor: "var(--tbh-gold)", color: "var(--tbh-gold)" }}
            >
              <Clapperboard size={12} /> Guarda il videoclip
            </a>
          )}

          {/* IL CASTING: compare solo se è stato aperto. */}
          {b.casting && (
            <Link
              href={`/tbh/casting/${b.casting.slug}`}
              className="inline-flex items-center justify-center gap-1.5 rounded-full border border-[#ff6b6b]/70 px-3 py-2 text-[10px] font-extrabold uppercase tracking-[0.1em] text-[#ff6b6b]"
            >
              <Users size={12} /> Casting aperto
            </Link>
          )}

          {/* LA SCHEDA DEL BRANO (04/11/2026): pagina propria, raggiungibile da catalogo, calendario e artista. */}
          <Link
            href={PERCORSI_MUSICA.scheda(b.id)}
            data-testid={`apri-scheda-${b.id}`}
            className="inline-flex items-center justify-center gap-1.5 rounded-full px-3 py-2 text-[10px] font-extrabold uppercase tracking-[0.1em] text-white/75 hover:text-[var(--tbh-neon)]"
          >
            Apri scheda →
          </Link>
        </div>
      </div>
    </article>
  );
}

/* ──────────────────────────────────────────────────────────────────────────────
   ULTIME USCITE — il carosello che si aggiorna da sé: è l'ordine di inserimento
   delle schede, nessun elenco scritto a mano.
   ────────────────────────────────────────────────────────────────────────────── */
function CaroselloUltimeUscite({
  uscite,
  colore,
}: {
  uscite: Catalogo["ultimeUscite"];
  colore: string;
}) {
  /* 29/10/2026 (round 15) — frecce spente ai limiti + tastiera (useFilaScorrevole) */
  const { ref: pista, prima, dopo, scorri, tastiera } = useFilaScorrevole(320);

  if (uscite.length === 0)
    return (
      <p className="tbh-card p-4 text-sm text-[var(--tbh-muted)]">
        Nessuna uscita ancora registrata in questa tornata: il carosello si riempie da sé
        appena una scheda viene inserita in catalogo.
      </p>
    );

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-3">
        <span className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-[var(--tbh-muted)]">
          {uscite.length} uscite in ordine di inserimento
        </span>
        <div className="flex gap-1.5">
          <button
            type="button"
            onClick={() => scorri(-1)}
            aria-label="Indietro"
            disabled={!prima}
            className={CLASSE_FRECCIA_FILA}
          >
            <ChevronLeft size={16} />
          </button>
          <button
            type="button"
            onClick={() => scorri(1)}
            aria-label="Avanti"
            disabled={!dopo}
            className={CLASSE_FRECCIA_FILA}
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
      <div
        ref={pista}
        role="group"
        aria-label="Ultime uscite"
        tabIndex={0}
        onKeyDown={tastiera}
        className="flex snap-x gap-3 overflow-x-auto pb-2 outline-none [scrollbar-width:thin] focus-visible:ring-1 focus-visible:ring-[var(--tbh-neon)]"
      >
        {uscite.map((u) => (
          <article
            key={u.id}
            className="tbh-card flex w-[150px] shrink-0 snap-start flex-col overflow-hidden"
            style={{ borderColor: `${colore}44` }}
          >
            <div className="aspect-square w-full overflow-hidden">
              <Copertina src={u.cover} titolo={u.titolo} />
            </div>
            <div className="flex flex-col gap-1 p-2">
              <span className="truncate text-[12px] font-bold">{u.titolo}</span>
              <span className="truncate text-[10px] text-[var(--tbh-muted)]">
                {u.artista ?? "—"}
              </span>
              <span className="text-[9px] font-extrabold uppercase tracking-[0.08em] text-[var(--tbh-muted)]">
                {u.etichetta.pallino} {u.etichetta.testo}
              </span>
              {u.audioUrl && (
                <a
                  href={u.audioUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-1 inline-flex items-center justify-center gap-1 rounded-full px-2 py-1.5 text-[9px] font-extrabold uppercase tracking-[0.1em] text-black"
                  style={{ background: colore }}
                >
                  <Play size={10} /> Ascolta
                </a>
              )}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

/**
 * LA GRIGLIA DELLE SCHEDE — la stessa a Musica, a Produzioni e a Road to 2030.
 * Quando una vista è vuota lo dice: non si riempie con brani di un'altra vista.
 */
export function GrigliaBraniCatalogo({
  brani,
  d,
  colore = "#b46bff",
  vuoto = "Nessun brano in questa vista.",
}: {
  brani: Brano[];
  d: Catalogo;
  colore?: string;
  vuoto?: string;
}) {
  if (brani.length === 0)
    return <p className="tbh-card p-4 text-sm text-[var(--tbh-muted)]">{vuoto}</p>;
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {brani.map((b) => (
        <SchedaBrano key={b.id} b={b} d={d} colore={colore} />
      ))}
    </div>
  );
}

/** I contatori del catalogo: calcolati dal server, mai scritti a mano in pagina. */
export function ContatoriMusicali({
  conteggi,
  colore = "#b46bff",
  voci,
}: {
  conteggi: Catalogo["conteggi"];
  colore?: string;
  /** Le voci da mostrare; se non si passa niente valgono le quattro principali. */
  voci?: { k: string; v: number }[];
}) {
  const elenco =
    voci ??
    [
      { k: "Brani in catalogo", v: conteggi.braniMaster },
      { k: "Audio pubblicati", v: conteggi.audioPubblicati },
      { k: "Videoclip pubblicati", v: conteggi.videoclipPubblicati },
      { k: "Videoclip in lavorazione", v: conteggi.videoclipInLavorazione },
    ];
  return (
    <dl className="grid grid-cols-2 gap-3 md:grid-cols-4">
      {elenco.map((n) => (
        <div key={n.k} className="rounded-xl border border-[var(--tbh-line)] px-3 py-3 text-center">
          <dd className="tbh-display text-2xl leading-none" style={{ color: colore }}>
            {n.v}
          </dd>
          <dt className="mt-1 text-[10px] uppercase tracking-wider text-[var(--tbh-muted)]">
            {n.k}
          </dt>
        </div>
      ))}
    </dl>
  );
}

/* ══════════════════════════════════════════════════════════════════════════════
   LA SEZIONE COMPLETA, come la vede il pubblico.
   ══════════════════════════════════════════════════════════════════════════════ */
export function CatalogoMusicaPubblico({
  colore,
  playlist,
}: {
  colore: string;
  /** La playlist ufficiale del canale, quando la scheda del canale la dichiara. */
  playlist?: string | null;
}) {
  const q = useCatalogoMusicale();
  const [tab, setTab] = useState<Tab>("tutti");
  const [cerca, setCerca] = useState("");
  const [ordine, setOrdine] = useState<Ordine>("recenti");

  const d = q.data;

  const elenco = useMemo(() => {
    if (!d) return [];
    const perTab = d.brani.filter((b) => {
      if (tab === "audio") return b.statoAudio === "pubblicato";
      if (tab === "videoclip") return b.statoVideo === "pubblicato" && !!b.videoUrl;
      if (tab === "road") return b.classe === "solo-audio";
      if (tab === "ultime") return b.origine === "importato";
      return true;
    });
    const t = cerca.trim().toLowerCase();
    const filtrati = t
      ? perTab.filter((b) =>
          [b.titolo, b.artista, b.genere, b.anno, ...b.versioni]
            .filter(Boolean)
            .join(" ")
            .toLowerCase()
            .includes(t),
        )
      : perTab;
    const peso = (b: Brano) =>
      b.statoVideo === "pubblicato" && b.videoUrl ? 0 : b.statoVideo === "in-produzione" ? 1 : 2;
    return [...filtrati].sort((a, b) => {
      if (ordine === "titolo") return a.titolo.localeCompare(b.titolo, "it");
      if (ordine === "stato") return peso(a) - peso(b) || a.titolo.localeCompare(b.titolo, "it");
      return (b.inserito ?? "").localeCompare(a.inserito ?? "");
    });
  }, [d, tab, cerca, ordine]);

  if (q.isLoading || !d) {
    return (
      <section className="relative z-10 flex flex-col gap-3">
        <h2 className="tbh-display tbh-h2" style={{ color: colore }}>
          Touch Music · il catalogo ufficiale di J.C. Hugò
        </h2>
        <p className="tbh-card p-4 text-sm text-[var(--tbh-muted)]">
          {q.isError
            ? "Catalogo non raggiungibile in questo momento."
            : "Caricamento del catalogo…"}
        </p>
      </section>
    );
  }

  const c = d.conteggi;
  const contaTab: Record<Tab, number | null> = {
    tutti: c.braniMaster,
    ultime: d.ultimeUscite.length,
    audio: c.audioPubblicati,
    videoclip: c.videoclipPubblicati,
    playlist: null,
    road: c.videoclipDaRealizzare,
  };

  const vuoto =
    tab === "videoclip"
      ? "Nessun videoclip è ancora pubblicato: i videoclip compaiono qui solo quando esistono davvero."
      : tab === "road"
        ? "Nessun brano in attesa di videoclip."
        : cerca.trim()
          ? "Nessun brano corrisponde alla ricerca."
          : "Catalogo in aggiornamento.";

  return (
    <section className="relative z-10 flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <h2 className="tbh-display tbh-h2 flex items-center gap-2" style={{ color: colore }}>
          <ListMusic size={22} /> Touch Music · il catalogo ufficiale di J.C. Hugò
        </h2>
        <p className="text-sm text-[var(--tbh-muted)]">{d.nota}</p>
        <p className="text-[11px] text-[var(--tbh-muted)]">
          Formati pubblicabili — audio: {d.formati.audio} · video: {d.formati.video} · link:{" "}
          {d.formati.link}
        </p>
      </div>

      {/* I NUMERI: calcolati dal catalogo, mai scritti a mano. */}
      <ContatoriMusicali conteggi={c} colore={colore} />

      {/* I SOTTO-MENU */}
      <div className="flex flex-wrap gap-2">
        {TAB.map((v) => (
          <button
            key={v.k}
            type="button"
            onClick={() => setTab(v.k)}
            aria-current={tab === v.k}
            className="inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-[11px] font-bold uppercase tracking-wide transition"
            style={
              tab === v.k
                ? { background: colore, borderColor: colore, color: "#000" }
                : { borderColor: "var(--tbh-line)" }
            }
          >
            {v.nome}
            {contaTab[v.k] !== null && (
              <span className="rounded-full bg-black/25 px-1.5 text-[10px]">{contaTab[v.k]}</span>
            )}
          </button>
        ))}
      </div>

      {/* RICERCA E ORDINAMENTO: valgono su tutte le viste con l'elenco. */}
      {tab !== "playlist" && (
        <div className="flex flex-wrap items-center gap-2">
          <label className="flex min-w-[220px] flex-1 items-center gap-2 rounded-full border border-[var(--tbh-line)] px-3 py-2">
            <Search size={14} className="text-[var(--tbh-muted)]" />
            <input
              value={cerca}
              onChange={(e) => setCerca(e.target.value)}
              placeholder="Cerca per titolo, artista, genere, versione"
              className="w-full bg-transparent text-sm outline-none placeholder:text-[var(--tbh-muted)]"
            />
          </label>
          <select
            value={ordine}
            onChange={(e) => setOrdine(e.target.value as Ordine)}
            className="rounded-full border border-[var(--tbh-line)] bg-transparent px-3 py-2 text-[11px] font-bold uppercase tracking-wide"
          >
            {ORDINI.map((o) => (
              <option key={o.k} value={o.k} className="bg-black">
                {o.nome}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* ULTIME USCITE — carosello sopra l'elenco della stessa vista. */}
      {tab === "ultime" && <CaroselloUltimeUscite uscite={d.ultimeUscite} colore={colore} />}

      {/* PLAYLIST — il canale ufficiale, non un elenco parallelo. */}
      {tab === "playlist" && (
        <div className="tbh-card flex flex-col gap-3 p-4">
          <h3 className="tbh-display tbh-h3">Playlist ufficiali</h3>
          <p className="text-sm text-[var(--tbh-muted)]">
            Il catalogo è pubblicato sui canali ufficiali: le playlist restano quelle dei canali,
            nessun elenco parallelo costruito qui.
          </p>
          <div className="flex flex-wrap gap-2">
            <a
              href={playlist ?? d.canale}
              target="_blank"
              rel="noreferrer"
              className="rounded-full px-4 py-2 text-xs font-bold uppercase tracking-wide text-black"
              style={{ background: colore }}
            >
              Apri il canale Touch Music Radio TV
            </a>
            {d.artista.esterni.map((e) => (
              <a
                key={e.url}
                href={e.url}
                target="_blank"
                rel="noreferrer"
                className="rounded-full border border-[var(--tbh-line)] px-4 py-2 text-xs font-bold uppercase tracking-wide hover:border-[var(--tbh-neon)]"
              >
                {e.rete}
              </a>
            ))}
          </div>
        </div>
      )}

      {/* ROAD TO 2030 — la coda di lavorazione: audio pubblicato in attesa di videoclip. */}
      {tab === "road" && (
        <div className="tbh-card flex flex-col gap-3 p-4">
          <h3 className="tbh-display tbh-h3" style={{ color: "var(--tbh-gold)" }}>
            Road to 2030
          </h3>
          <p className="text-sm text-[var(--tbh-muted)]">{d.roadObiettivo}</p>
          <p className="text-xs text-[var(--tbh-muted)]">{d.roadNota}</p>
          <ol className="flex flex-wrap gap-1.5">
            {d.flusso.map((f, i) => (
              <li
                key={f}
                className="rounded-full border border-[var(--tbh-line)] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.08em] text-[var(--tbh-muted)]"
              >
                {i + 1}. {f}
              </li>
            ))}
          </ol>
          <Link
            href="/tbh/produzioni/road-to-2030"
            className="inline-flex w-fit items-center gap-2 rounded-full border px-4 py-2 text-xs font-bold uppercase tracking-wide"
            style={{ borderColor: "var(--tbh-gold)", color: "var(--tbh-gold)" }}
          >
            <Film size={14} /> Apri il piano completo
          </Link>
        </div>
      )}

      {tab !== "playlist" && (
        <>
          <p className="text-[11px] uppercase tracking-wide text-[var(--tbh-muted)]">
            {elenco.length} brani in questa vista · {c.braniMaster} nel catalogo ·{" "}
            {c.sorgentiTotali} sorgenti collegate
          </p>
          <GrigliaBraniCatalogo brani={elenco} d={d} colore={colore} vuoto={vuoto} />
        </>
      )}
    </section>
  );
}
