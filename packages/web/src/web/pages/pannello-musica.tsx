import { useMemo, useState } from "react";
import { Link } from "wouter";
import {
  AlertTriangle,
  Check,
  ChevronRight,
  Clapperboard,
  ClipboardPaste,
  Copy,
  Disc3,
  ExternalLink,
  Image as ImageIcon,
  Layers,
  Link2,
  Loader2,
  Music4,
  Plus,
  Save,
  Search,
  Trash2,
  X,
} from "lucide-react";

import { SbloccoAllestimento, useCodiceAllestimento } from "../components/media-slot";
import {
  useAggiornaBrano,
  useAggiungiSorgente,
  useAnalizzaIndirizzi,
  useEliminaBrano,
  useImportaIndirizzi,
  usePannelloMusicale,
  useRimuoviSorgente,
  useUnisciBrani,
} from "../queries/catalogo-musicale";
import type { TipoSorgente } from "../../api/data/sorgenti-musicali";
import { PannelloUscite } from "../components/pannello-uscite";

/* ────────────────────────────────────────────────────────────────────────────
   ALLESTIMENTO → MUSICA.

   Correzione chiesta dalla direzione il 29/09/2026: il catalogo era costruito
   intorno al videoclip, mentre la musica esiste e si pubblica prima del video.
   Qui dentro, quindi:

   1. Si importa un brano da un indirizzo — Suno, YouTube, YouTube Music, un file
      audio o video — e non serve nessun MP4 per pubblicarlo.
   2. Un indirizzo alla volta o un elenco incollato: il comando è lo stesso.
      ANALIZZA conta e segnala i già presenti, IMPORTA scrive solo il resto.
   3. Un brano, un record. Le versioni e le altre piattaforme diventano SORGENTI
      dello stesso brano, non schede nuove.
   4. Niente contenuti inventati: se la piattaforma non restituisce il titolo o la
      copertina, la scheda si crea comunque e si completa a mano da qui.
   ──────────────────────────────────────────────────────────────────────────── */

type Vista =
  | "catalogo"
  | "importa"
  | "da-verificare"
  | "duplicati"
  | "versioni"
  | "cover"
  | "link"
  | "videoclip"
  | "road"
  | "casting"
  | "uscite";

const INPUT =
  "w-full rounded-xl border border-[var(--tbh-line)] bg-black/30 px-3 py-2.5 text-[14px] outline-none focus:border-[var(--tbh-neon)]";

const BOTTONE_SCURO =
  "inline-flex items-center justify-center gap-2 rounded-xl border border-[var(--tbh-line)] px-3 py-2 text-[12px] font-extrabold uppercase tracking-[0.12em] text-[var(--tbh-muted)] transition hover:border-[var(--tbh-neon)] hover:text-white disabled:opacity-40";

const BOTTONE_NEON =
  "inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--tbh-neon)] px-4 py-2.5 text-[12px] font-extrabold uppercase tracking-[0.12em] text-black transition hover:brightness-110 disabled:opacity-40";

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
      {nota && (
        <span className="tbh-body mt-1 block text-[11px] text-[var(--tbh-muted)]">{nota}</span>
      )}
    </label>
  );
}

function Numero({ n, nome, colore }: { n: number; nome: string; colore?: string }) {
  return (
    <div className="tbh-card px-3 py-2.5">
      <div className="tbh-display text-[22px] leading-none" style={{ color: colore }}>
        {n}
      </div>
      <div className="tbh-body mt-1 text-[10px] font-extrabold uppercase tracking-[0.12em] text-[var(--tbh-muted)]">
        {nome}
      </div>
    </div>
  );
}

/** La copertina reale del brano. Se manca non si inventa: si dichiara. */
function Copertina({ src, titolo }: { src: string | null; titolo: string }) {
  if (!src)
    return (
      <div className="flex h-full w-full flex-col items-center justify-center gap-1 bg-black/40 text-center">
        <ImageIcon size={16} className="text-[var(--tbh-muted)]" />
        <span className="tbh-body px-1 text-[9px] font-extrabold uppercase tracking-[0.1em] text-[var(--tbh-muted)]">
          Cover da caricare
        </span>
      </div>
    );
  return <img src={src} alt={titolo} loading="lazy" className="h-full w-full object-cover" />;
}

type BranoPannello = NonNullable<ReturnType<typeof usePannelloMusicale>["data"]>["brani"][number];

export default function PannelloMusicaPage() {
  const { codice } = useCodiceAllestimento();
  const q = usePannelloMusicale(codice);
  const analizza = useAnalizzaIndirizzi();
  const importa = useImportaIndirizzi();
  const aggiorna = useAggiornaBrano();
  const aggiungiSorgente = useAggiungiSorgente();
  const rimuoviSorgente = useRimuoviSorgente();
  const unisci = useUnisciBrani();
  const elimina = useEliminaBrano();

  /* 04/11/2026: /allestimento/musica?vista=uscite apre direttamente «Uscite e store». */
  const [vista, setVista] = useState<Vista>(() =>
    typeof window !== "undefined" && new URLSearchParams(window.location.search).get("vista") === "uscite" ? "uscite" : "catalogo",
  );
  const [testo, setTesto] = useState("");
  const [tipoImport, setTipoImport] = useState<"" | TipoSorgente>("");
  const [cerca, setCerca] = useState("");
  const [apertoId, setApertoId] = useState<string | null>(null);
  const [daEliminare, setDaEliminare] = useState<string | null>(null);

  const d = q.data;
  const brani = useMemo(() => d?.brani ?? [], [d]);

  const viste = useMemo(() => {
    const importati = brani.filter((b) => b.origine === "importato");
    return {
      catalogo: brani,
      importa: [] as BranoPannello[],
      "da-verificare": importati.filter((b) => b.statoScheda === "da-verificare"),
      duplicati: [] as BranoPannello[],
      versioni: brani.filter((b) => b.sorgenti.length > 1 || b.versioni.length > 0),
      cover: brani.filter((b) => !b.cover),
      link: brani.filter((b) => b.sorgenti.length === 0),
      videoclip: brani.filter((b) => b.statoVideo !== "da-realizzare"),
      road: brani.filter((b) => b.classe === "solo-audio"),
      casting: brani.filter((b) => b.casting),
      uscite: [] as BranoPannello[],
    } satisfies Record<Vista, BranoPannello[]>;
  }, [brani]);

  const elenco = useMemo(() => {
    const base = viste[vista] ?? [];
    const t = cerca.trim().toLowerCase();
    if (!t) return base;
    return base.filter(
      (b) =>
        b.titolo.toLowerCase().includes(t) ||
        (b.artista ?? "").toLowerCase().includes(t) ||
        b.sorgenti.some((s) => s.url.toLowerCase().includes(t)),
    );
  }, [viste, vista, cerca]);

  if (!codice) {
    return (
      <div className="mx-auto max-w-[900px] px-4 py-16 md:px-8">
        <h1 className="tbh-display tbh-h1">MUSICA — CATALOGO</h1>
        <p className="tbh-body mt-3 text-[var(--tbh-muted)]">
          Area riservata: da qui si importano e si pubblicano i brani. Serve il codice di
          allestimento.
        </p>
        <div className="mt-6">
          <SbloccoAllestimento />
        </div>
      </div>
    );
  }

  const c = d?.conteggi;
  const esiti = importa.data?.esiti ?? [];
  const lettura = analizza.data;

  const TABS: { k: Vista; nome: string; n?: number }[] = [
    { k: "catalogo", nome: "Catalogo", n: c?.braniMaster },
    { k: "importa", nome: "Importa indirizzi" },
    { k: "da-verificare", nome: "Da verificare", n: c?.daVerificare },
    { k: "duplicati", nome: "Duplicati", n: d?.duplicati.length },
    { k: "versioni", nome: "Versioni", n: viste.versioni.length },
    { k: "cover", nome: "Cover mancanti", n: c?.coverMancanti },
    { k: "link", nome: "Link mancanti", n: c?.linkMancanti },
    { k: "videoclip", nome: "Videoclip", n: viste.videoclip.length },
    { k: "road", nome: "Road to 2030", n: viste.road.length },
    { k: "casting", nome: "Casting", n: c?.castingAperti },
    { k: "uscite", nome: "Uscite e store" },
  ];

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-10 md:px-8 md:py-16">
      <Link
        href="/allestimento"
        className="mb-4 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-[var(--tbh-muted)] hover:text-[var(--tbh-neon)]"
      >
        ← Tutti i pannelli di allestimento
      </Link>

      <nav className="tbh-body mb-4 flex flex-wrap items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-[0.14em] text-[var(--tbh-muted)]">
        <span>Produzioni</span>
        <ChevronRight size={13} />
        <span className="text-[var(--tbh-neon)]">Musica</span>
        <ChevronRight size={13} />
        <span>Catalogo, importazioni, sorgenti</span>
      </nav>

      <header>
        <p className="tbh-body text-[11px] font-extrabold uppercase tracking-[0.22em] text-[var(--tbh-neon)]">
          Area riservata · Catalogo musicale
        </p>
        <h1 className="tbh-display tbh-h1 mt-2 flex items-center gap-3">
          <Music4 size={30} className="text-[var(--tbh-neon)]" /> MUSICA
        </h1>
        <p className="tbh-body mt-3 max-w-[900px] text-[15px] text-[var(--tbh-muted)]">
          {d?.nota}
        </p>
        <p className="tbh-body mt-2 max-w-[900px] text-[13px] text-[var(--tbh-muted)]">
          Formati ammessi — audio: {d?.formati.audio} · video: {d?.formati.video} · link:{" "}
          {d?.formati.link}.
        </p>
      </header>

      {q.isLoading && (
        <p className="tbh-body mt-8 flex items-center gap-2 text-[var(--tbh-muted)]">
          <Loader2 size={16} className="animate-spin" /> Lettura del catalogo…
        </p>
      )}
      {q.error && (
        <p className="tbh-body mt-8 flex items-center gap-2 text-[#ff7a7a]">
          <AlertTriangle size={16} /> {(q.error as Error).message}
        </p>
      )}

      {c && (
        <div className="mt-8 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
          <Numero n={c.braniMaster} nome="Brani in catalogo" colore="var(--tbh-neon)" />
          <Numero n={c.audioPubblicati} nome="Audio pubblicati" />
          <Numero n={c.importati} nome="Importati" />
          <Numero n={c.daVerificare} nome="Da verificare" colore="#ffd166" />
          <Numero n={c.videoclipPubblicati} nome="Videoclip pubblicati" />
          <Numero n={c.videoclipDaRealizzare} nome="Videoclip da fare" />
        </div>
      )}

      {/* ── Le viste di servizio chieste dalla direzione ── */}
      <div className="mt-8 flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button
            key={t.k}
            type="button"
            onClick={() => setVista(t.k)}
            className={`rounded-xl border px-3 py-2 text-[11px] font-extrabold uppercase tracking-[0.12em] transition ${
              vista === t.k
                ? "border-[var(--tbh-neon)] bg-[var(--tbh-neon)]/10 text-white"
                : "border-[var(--tbh-line)] text-[var(--tbh-muted)] hover:text-white"
            }`}
          >
            {t.nome}
            {typeof t.n === "number" && (
              <span className="ml-2 text-[var(--tbh-neon)]">{t.n}</span>
            )}
          </button>
        ))}
      </div>

      {/* ── IMPORTA ── */}
      {vista === "importa" && (
        <section className="tbh-card mt-6 p-4 md:p-6">
          <h2 className="tbh-display text-[20px] flex items-center gap-2">
            <ClipboardPaste size={20} className="text-[var(--tbh-neon)]" /> IMPORTA DA INDIRIZZO
          </h2>
          <p className="tbh-body mt-2 text-[13px] text-[var(--tbh-muted)]">{d?.notaImportazione}</p>
          <p className="tbh-body mt-1 text-[12px] text-[var(--tbh-muted)]">
            Tornata aperta: <span className="text-white">{d?.tornata}</span>
          </p>

          <div className="mt-4 grid gap-3 lg:grid-cols-[1fr_260px]">
            <Campo
              etichetta="Indirizzi — uno per riga"
              nota="Un solo link o l'elenco intero: il comando è lo stesso. Righe vuote e testo che non è un indirizzo vengono scartati e te li elenco."
            >
              <textarea
                value={testo}
                onChange={(e) => setTesto(e.target.value)}
                rows={8}
                placeholder={"https://suno.com/s/XXXXXXXX\nhttps://www.youtube.com/watch?v=XXXXXXXXXXX"}
                className={`${INPUT} font-mono text-[12px]`}
              />
            </Campo>
            <div className="space-y-3">
              <Campo
                etichetta="Tipo da forzare"
                nota="Lascialo automatico: Suno è audio, un caricamento YouTube lo distinguo tra videoclip e audio con immagine fissa."
              >
                <select
                  value={tipoImport}
                  onChange={(e) => setTipoImport(e.target.value as "" | TipoSorgente)}
                  className={INPUT}
                >
                  <option value="">Automatico</option>
                  {(d?.tipi ?? []).map((t) => (
                    <option key={t} value={t}>
                      {d?.etichetteTipo[t]}
                    </option>
                  ))}
                </select>
              </Campo>
              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  disabled={!testo.trim() || analizza.isPending}
                  onClick={() => analizza.mutate({ codice, testo })}
                  className={BOTTONE_SCURO}
                >
                  {analizza.isPending ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Search size={14} />
                  )}
                  Analizza
                </button>
                <button
                  type="button"
                  disabled={!testo.trim() || importa.isPending}
                  onClick={() =>
                    importa.mutate(
                      { codice, testo, tipo: tipoImport || undefined },
                      { onSuccess: () => setTesto("") },
                    )
                  }
                  className={BOTTONE_NEON}
                >
                  {importa.isPending ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Plus size={14} />
                  )}
                  Importa
                </button>
              </div>
            </div>
          </div>

          {analizza.error && (
            <p className="tbh-body mt-3 text-[13px] text-[#ff7a7a]">
              {(analizza.error as Error).message}
            </p>
          )}
          {importa.error && (
            <p className="tbh-body mt-3 text-[13px] text-[#ff7a7a]">
              {(importa.error as Error).message}
            </p>
          )}

          {lettura && (
            <div className="mt-5 rounded-xl border border-[var(--tbh-line)] p-4">
              <p className="tbh-display text-[15px]">{lettura.riepilogo.testo}</p>
              <ul className="mt-3 space-y-1.5">
                {lettura.righe.map((r) => (
                  <li key={r.urlOriginale} className="tbh-body text-[12px]">
                    <span
                      className={
                        r.giaPresente ? "text-[#ffd166]" : "text-[var(--tbh-neon)]"
                      }
                    >
                      {r.giaPresente ? "GIÀ PRESENTE" : "NUOVO"}
                    </span>{" "}
                    <span className="text-[var(--tbh-muted)]">
                      {r.etichettaPiattaforma} · {r.etichettaTipo}
                    </span>{" "}
                    <span className="font-mono text-[11px] text-white/70">{r.urlOriginale}</span>
                    {r.branoTitolo && (
                      <span className="text-[var(--tbh-muted)]"> → «{r.branoTitolo}»</span>
                    )}
                    {r.avviso && <span className="text-[#ff7a7a]"> · {r.avviso}</span>}
                  </li>
                ))}
              </ul>
              {lettura.scartate.length > 0 && (
                <p className="tbh-body mt-3 text-[12px] text-[#ff7a7a]">
                  Righe scartate: {lettura.scartate.join(" · ")}
                </p>
              )}
            </div>
          )}

          {esiti.length > 0 && (
            <div className="mt-5 rounded-xl border border-[var(--tbh-neon)]/40 bg-[var(--tbh-neon)]/5 p-4">
              <p className="tbh-display text-[15px]">
                {importa.data?.riepilogo.creati} creati ·{" "}
                {importa.data?.riepilogo.sorgentiAggiunte} sorgenti aggiunte a brani già in
                catalogo · {importa.data?.riepilogo.giaPresenti} già presenti ·{" "}
                {importa.data?.riepilogo.errori} non letti
              </p>
              <ul className="mt-3 space-y-1.5">
                {esiti.map((e) => (
                  <li key={e.urlOriginale} className="tbh-body text-[12px]">
                    <span
                      className={
                        e.esito === "errore"
                          ? "text-[#ff7a7a]"
                          : e.esito === "gia-presente"
                            ? "text-[#ffd166]"
                            : "text-[var(--tbh-neon)]"
                      }
                    >
                      {e.esito.toUpperCase().replace("-", " ")}
                    </span>{" "}
                    <span className="text-white">{e.titolo ?? "(titolo da completare)"}</span>{" "}
                    <span className="text-[var(--tbh-muted)]">{e.messaggio}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>
      )}

      {/* ── DUPLICATI ── */}
      {vista === "duplicati" && (
        <section className="mt-6 space-y-3">
          <p className="tbh-body text-[13px] text-[var(--tbh-muted)]">
            Titoli che compaiono su più schede. Se sono lo stesso brano, tieni una scheda e unisci
            l'altra: le sorgenti passano alla scheda che resta e non si perde nulla. Le uscite
            storiche del canale non si uniscono da qui.
          </p>
          {(d?.duplicati ?? []).length === 0 && (
            <p className="tbh-body text-[13px] text-[var(--tbh-muted)]">
              Nessun titolo doppio nel catalogo.
            </p>
          )}
          {(d?.duplicati ?? []).map((g) => (
            <article key={g.chiave} className="tbh-card p-4">
              <p className="tbh-body text-[11px] font-extrabold uppercase tracking-[0.14em] text-[var(--tbh-muted)]">
                <Copy size={12} className="mr-1 inline" /> {g.brani.length} schede con lo stesso
                titolo
              </p>
              <ul className="mt-2 space-y-2">
                {g.brani.map((b) => (
                  <li key={b.id} className="flex flex-wrap items-center gap-2">
                    <span className="tbh-body text-[14px] text-white">{b.titolo}</span>
                    <span className="tbh-body text-[11px] text-[var(--tbh-muted)]">
                      {b.id} · {b.origine === "importato" ? "importato" : "canale"} ·{" "}
                      {b.sorgenti} sorgenti
                    </span>
                    {g.brani
                      .filter((x) => x.id !== b.id && x.origine === "importato")
                      .map((x) => (
                        <button
                          key={x.id}
                          type="button"
                          disabled={unisci.isPending}
                          onClick={() => unisci.mutate({ codice, tieni: b.id, unisci: x.id })}
                          className={BOTTONE_SCURO}
                        >
                          <Layers size={13} /> Tieni questa, unisci {x.id}
                        </button>
                      ))}
                  </li>
                ))}
              </ul>
            </article>
          ))}
          {unisci.error && (
            <p className="tbh-body text-[13px] text-[#ff7a7a]">{(unisci.error as Error).message}</p>
          )}
        </section>
      )}

      {/* ── USCITE E STORE (04/11/2026, round 16) ── */}
      {vista === "uscite" && <PannelloUscite codice={codice} />}

      {/* ── ELENCO BRANI (tutte le altre viste) ── */}
      {vista !== "duplicati" && vista !== "importa" && vista !== "uscite" && (
        <>
          <div className="mt-6 flex items-center gap-2">
            <Search size={16} className="text-[var(--tbh-muted)]" />
            <input
              value={cerca}
              onChange={(e) => setCerca(e.target.value)}
              placeholder="Cerca per titolo, artista o indirizzo"
              className={INPUT}
            />
          </div>

          <p className="tbh-body mt-3 text-[12px] font-extrabold uppercase tracking-[0.14em] text-[var(--tbh-muted)]">
            {elenco.length} brani
          </p>

          <div className="mt-3 space-y-2">
            {elenco.map((b) => (
              <RigaBrano
                key={b.id}
                b={b}
                codice={codice}
                aperto={apertoId === b.id}
                onApri={() => setApertoId(apertoId === b.id ? null : b.id)}
                onElimina={() => setDaEliminare(b.id)}
                aggiorna={aggiorna}
                aggiungiSorgente={aggiungiSorgente}
                rimuoviSorgente={rimuoviSorgente}
                etichetteTipo={d?.etichetteTipo}
              />
            ))}
            {elenco.length === 0 && !q.isLoading && (
              <p className="tbh-body text-[13px] text-[var(--tbh-muted)]">
                Nessun brano in questa vista.
              </p>
            )}
          </div>
        </>
      )}

      {/* ── Conferma di cancellazione ── */}
      {daEliminare && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="tbh-card w-full max-w-[460px] p-5">
            <h3 className="tbh-display text-[18px]">CANCELLO LA SCHEDA?</h3>
            <p className="tbh-body mt-2 text-[13px] text-[var(--tbh-muted)]">
              Sparisce la scheda {daEliminare} con le sue sorgenti. Il videoclip e il casting, se
              esistono, hanno un loro pannello e non vengono toccati.
            </p>
            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={() =>
                  elimina.mutate(
                    { codice, id: daEliminare },
                    { onSuccess: () => setDaEliminare(null) },
                  )
                }
                className="inline-flex items-center gap-2 rounded-xl bg-[#ff5a5a] px-4 py-2.5 text-[12px] font-extrabold uppercase tracking-[0.12em] text-black"
              >
                <Trash2 size={14} /> Cancella
              </button>
              <button
                type="button"
                onClick={() => setDaEliminare(null)}
                className={BOTTONE_SCURO}
              >
                <X size={14} /> Lascia stare
              </button>
            </div>
            {elimina.error && (
              <p className="tbh-body mt-3 text-[13px] text-[#ff7a7a]">
                {(elimina.error as Error).message}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────────────
   LA RIGA DI UN BRANO: stato, sorgenti, e la scheda da completare a mano.
   ──────────────────────────────────────────────────────────────────────────── */

function RigaBrano({
  b,
  codice,
  aperto,
  onApri,
  onElimina,
  aggiorna,
  aggiungiSorgente,
  rimuoviSorgente,
  etichetteTipo,
}: {
  b: BranoPannello;
  codice: string;
  aperto: boolean;
  onApri: () => void;
  onElimina: () => void;
  aggiorna: ReturnType<typeof useAggiornaBrano>;
  aggiungiSorgente: ReturnType<typeof useAggiungiSorgente>;
  rimuoviSorgente: ReturnType<typeof useRimuoviSorgente>;
  etichetteTipo?: Record<string, string>;
}) {
  const importato = b.origine === "importato";
  const [scheda, setScheda] = useState({
    titolo: b.titolo,
    artista: b.artista ?? "",
    cover: b.cover ?? "",
    genere: b.genere ?? "",
    anno: b.anno ?? "",
    descrizione: b.descrizione ?? "",
    notaInterna: b.notaInterna ?? "",
  });
  const [nuovaSorgente, setNuovaSorgente] = useState("");
  const [tipoNuova, setTipoNuova] = useState<"" | TipoSorgente>("");
  const [versioneNuova, setVersioneNuova] = useState("");

  return (
    <article className="tbh-card overflow-hidden">
      <div className="flex items-center gap-3 p-3">
        <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg">
          <Copertina src={b.cover} titolo={b.titolo} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="tbh-body truncate text-[15px] font-bold text-white">
              {b.titolo || "(scheda da completare)"}
            </span>
            <span className="tbh-body text-[11px] text-[var(--tbh-muted)]">
              {b.etichetta.pallino} {b.etichetta.testo}
            </span>
            {importato && b.statoScheda === "da-verificare" && (
              <span className="tbh-body rounded-md bg-[#ffd166]/15 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-[0.1em] text-[#ffd166]">
                🟡 Da verificare
              </span>
            )}
            {b.nascosto && (
              <span className="tbh-body rounded-md bg-white/10 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-[0.1em] text-[var(--tbh-muted)]">
                Non pubblicata
              </span>
            )}
          </div>
          <p className="tbh-body mt-0.5 truncate text-[12px] text-[var(--tbh-muted)]">
            {b.artista ?? "artista da completare"} · {b.sorgenti.length} sorgenti ·{" "}
            {b.etichettaVideo.testo}
            {b.casting && " · 🔴 casting aperto"}
            {b.inserito && ` · inserito ${b.inserito}`}
          </p>
        </div>
        <button type="button" onClick={onApri} className={BOTTONE_SCURO}>
          {aperto ? <X size={14} /> : <Disc3 size={14} />}
          {aperto ? "Chiudi" : "Apri"}
        </button>
      </div>

      {aperto && (
        <div className="border-t border-[var(--tbh-line)] p-4">
          {/* SORGENTI */}
          <h4 className="tbh-body text-[11px] font-extrabold uppercase tracking-[0.14em] text-[var(--tbh-muted)]">
            Sorgenti di questo brano
          </h4>
          <ul className="mt-2 space-y-1.5">
            {b.sorgenti.map((s) => (
              <li key={`${s.id ?? s.url}`} className="flex flex-wrap items-center gap-2">
                <span className="tbh-body text-[11px] font-extrabold uppercase tracking-[0.1em] text-[var(--tbh-neon)]">
                  {etichetteTipo?.[s.tipo] ?? s.tipo}
                </span>
                <span className="tbh-body text-[11px] text-[var(--tbh-muted)]">
                  {s.piattaforma}
                  {s.versione && ` · ${s.versione}`}
                  {s.principale && " · principale"}
                  {s.storica && " · uscita del canale"}
                </span>
                <a
                  href={s.url}
                  target="_blank"
                  rel="noreferrer"
                  className="tbh-body inline-flex items-center gap-1 font-mono text-[11px] text-white/70 hover:text-[var(--tbh-neon)]"
                >
                  {s.url} <ExternalLink size={11} />
                </a>
                {!s.storica && s.id && (
                  <button
                    type="button"
                    disabled={rimuoviSorgente.isPending}
                    onClick={() => rimuoviSorgente.mutate({ codice, id: s.id as number })}
                    className="text-[#ff7a7a] hover:text-white"
                    title="Stacca questa sorgente"
                  >
                    <Trash2 size={13} />
                  </button>
                )}
              </li>
            ))}
            {b.sorgenti.length === 0 && (
              <li className="tbh-body text-[12px] text-[#ff7a7a]">
                Nessun indirizzo: il brano non è ascoltabile finché non ne aggiungi uno.
              </li>
            )}
          </ul>

          <div className="mt-3 grid gap-2 md:grid-cols-[1fr_160px_140px_auto]">
            <input
              value={nuovaSorgente}
              onChange={(e) => setNuovaSorgente(e.target.value)}
              placeholder="Aggiungi un altro indirizzo per questo brano"
              className={`${INPUT} font-mono text-[12px]`}
            />
            <select
              value={tipoNuova}
              onChange={(e) => setTipoNuova(e.target.value as "" | TipoSorgente)}
              className={INPUT}
            >
              <option value="">Tipo automatico</option>
              <option value="audio">Audio</option>
              <option value="visual-audio">Audio con immagine</option>
              <option value="videoclip">Videoclip</option>
            </select>
            <input
              value={versioneNuova}
              onChange={(e) => setVersioneNuova(e.target.value)}
              placeholder="Versione"
              className={INPUT}
            />
            <button
              type="button"
              disabled={!nuovaSorgente.trim() || aggiungiSorgente.isPending}
              onClick={() =>
                aggiungiSorgente.mutate(
                  {
                    codice,
                    branoId: b.id,
                    url: nuovaSorgente.trim(),
                    tipo: tipoNuova || undefined,
                    versione: versioneNuova.trim() || null,
                  },
                  {
                    onSuccess: () => {
                      setNuovaSorgente("");
                      setVersioneNuova("");
                    },
                  },
                )
              }
              className={BOTTONE_SCURO}
            >
              <Link2 size={14} /> Aggiungi sorgente
            </button>
          </div>
          {aggiungiSorgente.error && (
            <p className="tbh-body mt-2 text-[12px] text-[#ff7a7a]">
              {(aggiungiSorgente.error as Error).message}
            </p>
          )}

          {/* SCHEDA A MANO — solo per le schede importate */}
          {importato ? (
            <>
              <h4 className="tbh-body mt-5 text-[11px] font-extrabold uppercase tracking-[0.14em] text-[var(--tbh-muted)]">
                Completa la scheda a mano
              </h4>
              <div className="mt-2 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                <Campo etichetta="Titolo">
                  <input
                    value={scheda.titolo}
                    onChange={(e) => setScheda({ ...scheda, titolo: e.target.value })}
                    className={INPUT}
                  />
                </Campo>
                <Campo etichetta="Artista">
                  <input
                    value={scheda.artista}
                    onChange={(e) => setScheda({ ...scheda, artista: e.target.value })}
                    className={INPUT}
                  />
                </Campo>
                <Campo etichetta="Copertina — indirizzo reale" nota="Vuoto: resta «cover da caricare».">
                  <input
                    value={scheda.cover}
                    onChange={(e) => setScheda({ ...scheda, cover: e.target.value })}
                    className={`${INPUT} font-mono text-[12px]`}
                  />
                </Campo>
                <Campo etichetta="Genere">
                  <input
                    value={scheda.genere}
                    onChange={(e) => setScheda({ ...scheda, genere: e.target.value })}
                    className={INPUT}
                  />
                </Campo>
                <Campo etichetta="Anno">
                  <input
                    value={scheda.anno}
                    onChange={(e) => setScheda({ ...scheda, anno: e.target.value })}
                    className={INPUT}
                  />
                </Campo>
                <Campo etichetta="Nota interna" nota="Non compare in pagina.">
                  <input
                    value={scheda.notaInterna}
                    onChange={(e) => setScheda({ ...scheda, notaInterna: e.target.value })}
                    className={INPUT}
                  />
                </Campo>
                <div className="md:col-span-2 lg:col-span-3">
                  <Campo etichetta="Descrizione">
                    <textarea
                      value={scheda.descrizione}
                      onChange={(e) => setScheda({ ...scheda, descrizione: e.target.value })}
                      rows={3}
                      className={INPUT}
                    />
                  </Campo>
                </div>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  disabled={aggiorna.isPending}
                  onClick={() =>
                    aggiorna.mutate({
                      codice,
                      id: b.id,
                      titolo: scheda.titolo,
                      artista: scheda.artista || null,
                      cover: scheda.cover || null,
                      genere: scheda.genere || null,
                      anno: scheda.anno || null,
                      descrizione: scheda.descrizione || null,
                      notaInterna: scheda.notaInterna || null,
                    })
                  }
                  className={BOTTONE_NEON}
                >
                  {aggiorna.isPending ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Save size={14} />
                  )}
                  Salva la scheda
                </button>
                <button
                  type="button"
                  disabled={aggiorna.isPending}
                  onClick={() =>
                    aggiorna.mutate({
                      codice,
                      id: b.id,
                      stato: b.statoScheda === "verificato" ? "da-verificare" : "verificato",
                    })
                  }
                  className={BOTTONE_SCURO}
                >
                  <Check size={14} />
                  {b.statoScheda === "verificato" ? "Rimetti da verificare" : "Segna verificato"}
                </button>
                <button
                  type="button"
                  disabled={aggiorna.isPending}
                  onClick={() => aggiorna.mutate({ codice, id: b.id, nascosto: !b.nascosto })}
                  className={BOTTONE_SCURO}
                >
                  {b.nascosto ? "Pubblica in pagina" : "Togli dalla pagina"}
                </button>
                <Link href="/allestimento/casting" className={BOTTONE_SCURO}>
                  <Clapperboard size={14} /> Casting del videoclip
                </Link>
                <button type="button" onClick={onElimina} className={BOTTONE_SCURO}>
                  <Trash2 size={14} /> Cancella scheda
                </button>
              </div>
              {aggiorna.error && (
                <p className="tbh-body mt-2 text-[12px] text-[#ff7a7a]">
                  {(aggiorna.error as Error).message}
                </p>
              )}
            </>
          ) : (
            <p className="tbh-body mt-5 text-[12px] text-[var(--tbh-muted)]">
              Questa è una delle uscite storiche del canale Touch Music Radio TV: titolo e
              copertina arrivano dal caricamento originale e non si riscrivono da qui. Le nuove
              sorgenti, invece, si agganciano normalmente.
            </p>
          )}
        </div>
      )}
    </article>
  );
}
