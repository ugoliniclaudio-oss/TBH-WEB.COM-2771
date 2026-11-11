import { useEffect, useMemo, useState } from "react";
import { Link } from "wouter";
import { AlertTriangle, ArrowDown, ArrowLeft, ArrowUp, Check, Eye, Loader2, Lock, Plus, RefreshCw, Repeat, Trash2, Upload } from "lucide-react";
import { testoDurata } from "../components/canale-tematico-scaletta";
import { SbloccoAllestimento, useCodiceAllestimento } from "../components/media-slot";
import {
  analizzaUrlTematico,
  useAggiornaVoceTematica,
  useAggiungiVoceTematica,
  useEliminaCanaleTematico,
  useEliminaVoceTematica,
  useImportaTematici,
  useOrdinaTematici,
  useQuadroTematici,
  useSalvaCanaleTematico,
  useStatoVoceTematica,
  useSvuotaErroriTematici,
  useVerificaVoceTematica,
  type CanaleTematicoDati,
  type QuadroTematici,
  type VoceAdmin,
} from "../queries/canali-tematici";

/**
 * /allestimento/canali-tematici — PANNELLO COMUNE DEI CANALI TEMATICI (28/10/2026).
 * Canali: crea, modifica, spegni, elimina (solo se vuoti). Contenuti: URL singolo con anteprima,
 * import di un elenco, titolo/miniatura recuperati dalla fonte ufficiale e modificabili, verifica di
 * riproducibilità, stati bozza → approvato → pubblicato / non disponibile, doppioni segnalati,
 * registro degli errori del player. Ogni nuovo URL entra in BOZZA: nulla va in onda senza approvazione.
 * 28/10/2026 — limite di 90 minuti per singolo video (avviso PRIMA dell'inserimento, conferma
 * esplicita, mai tagli), durata letta dalla fonte o scritta a mano, ordine della scaletta (↑/↓),
 * riproduzione casuale o in sequenza, «Ciclo continuo H24», secondi per anteprima/immagine.
 */

const GIALLO = "#d7ff00";
const TIPI = ["video", "articolo", "immagine", "numero"] as const;
const NOME_TIPO: Record<string, string> = { video: "Video", articolo: "Articolo", immagine: "Immagine", numero: "Numero del magazine" };
const STATI_CANALE = [
  ["allestimento", "In allestimento"],
  ["attivo", "Attivo"],
  ["non-disponibile", "Temporaneamente non disponibile"],
] as const;
const COLORE_STATO: Record<string, string> = { bozza: "#9ca3af", approvato: GIALLO, pubblicato: "#7CFFB2", "non-disponibile": "#ff8a8a" };

const msg = (e: unknown) => (e instanceof Error ? e.message : "Operazione non riuscita.");
const LIMITE_VIDEO = 5400;
/** «1:29:29», «16:31», «5369» → secondi (null se vuoto o non valido). */
export function leggiDurata(t: string): number | null {
  const x = t.trim();
  if (!x) return null;
  if (/^\d+$/.test(x)) return Number(x) > 0 ? Number(x) : null;
  if (!/^\d{1,2}(:\d{1,2}){1,2}$/.test(x)) return null;
  const s = x.split(":").reduce((tot, n) => tot * 60 + Number(n), 0);
  return s > 0 ? s : null;
}
const durataInCampo = (sec: number | null | undefined) => (sec ? testoDurata(sec) : "");
const inp = "w-full rounded-lg border border-white/15 bg-black px-3 py-2 text-sm text-white placeholder:text-white/30 focus:border-[#d7ff00] focus:outline-none";
const btn = "inline-flex items-center gap-1.5 rounded-full border border-white/15 px-3 py-1.5 text-[11px] font-bold text-white/80 hover:border-[#d7ff00] hover:text-white disabled:opacity-40";
const btnPieno = "inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-extrabold tracking-[0.1em] text-black disabled:opacity-50";

export function AnteprimaEmbed({ piattaforma, embedId, url }: { piattaforma: string; embedId: string | null; url: string }) {
  const src =
    piattaforma === "youtube" && embedId
      ? `https://www.youtube.com/embed/${embedId}?rel=0&playsinline=1`
      : piattaforma === "vimeo" && embedId
        ? `https://player.vimeo.com/video/${embedId}`
        : piattaforma === "dailymotion" && embedId
          ? `https://www.dailymotion.com/embed/video/${embedId}`
          : null;
  return (
    <div className="relative aspect-video w-full max-w-[560px] overflow-hidden rounded-xl border border-white/10 bg-black" data-testid="anteprima-embed">
      {src ? (
        <iframe src={src} className="absolute inset-0 h-full w-full" allow="autoplay; fullscreen; picture-in-picture" allowFullScreen title="Anteprima" />
      ) : piattaforma === "video" ? (
        <video src={url} controls playsInline preload="metadata" className="absolute inset-0 h-full w-full" />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center p-4 text-center text-xs text-white/60">Pagina web: nessun player. Si usa come scheda o se ne ricava l'URL del video.</div>
      )}
    </div>
  );
}

function CampiVoce({ canale, valori, onChange }: { canale: CanaleTematicoDati; valori: Record<string, string>; onChange: (v: Record<string, string>) => void }) {
  if (!canale.campi.length) return null;
  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {canale.campi.map((f) => (
        <label key={f.chiave} className="flex flex-col gap-1 text-[11px] text-white/60">
          {f.etichetta}
          <input className={inp} value={valori[f.chiave] ?? ""} onChange={(e) => onChange({ ...valori, [f.chiave]: e.target.value })} />
        </label>
      ))}
    </div>
  );
}

/* ── canale: editor ───────────────────────────────────────────────────────── */

const VUOTO: CanaleTematicoDati = {
  slug: "",
  nome: "",
  descrizione: "",
  stato: "allestimento",
  abilitato: true,
  slugRegistro: null,
  logo: null,
  pagina: null,
  tipiAmmessi: ["video"],
  campi: [],
  ordine: 10,
  riproduzione: "casuale",
  cicloH24: false,
  secondiImmagine: 7,
};

function EditorCanale({ codice, d, iniziale, nuovo, onFatto }: { codice: string; d: QuadroTematici; iniziale: CanaleTematicoDati; nuovo: boolean; onFatto: (slug: string) => void }) {
  const [c, setC] = useState(iniziale);
  const [campiTesto, setCampiTesto] = useState(iniziale.campi.map((f) => `${f.chiave}: ${f.etichetta}`).join("\n"));
  const salva = useSalvaCanaleTematico();
  const elimina = useEliminaCanaleTematico();
  useEffect(() => {
    setC(iniziale);
    setCampiTesto(iniziale.campi.map((f) => `${f.chiave}: ${f.etichetta}`).join("\n"));
  }, [iniziale]);
  const campi = campiTesto
    .split("\n")
    .map((r) => r.split(":"))
    .filter((p) => p[0]?.trim() && p[1]?.trim())
    .map((p) => ({ chiave: p[0]!.trim(), etichetta: p.slice(1).join(":").trim() }));
  const n = d.voci.filter((v) => v.canale === c.slug).length;
  return (
    <div className="grid gap-3 rounded-xl border border-white/10 bg-white/[0.02] p-4 md:grid-cols-2" data-testid="editor-canale">
      <label className="flex flex-col gap-1 text-[11px] text-white/60">
        Slug (indirizzo /canali/…, non si cambia dopo la creazione)
        <input className={inp} value={c.slug} disabled={!nuovo} onChange={(e) => setC({ ...c, slug: e.target.value.toLowerCase() })} placeholder="es. touch-fitness" />
      </label>
      <label className="flex flex-col gap-1 text-[11px] text-white/60">
        Nome
        <input className={inp} value={c.nome} onChange={(e) => setC({ ...c, nome: e.target.value })} />
      </label>
      <label className="flex flex-col gap-1 text-[11px] text-white/60 md:col-span-2">
        Descrizione
        <input className={inp} value={c.descrizione} onChange={(e) => setC({ ...c, descrizione: e.target.value })} />
      </label>
      <label className="flex flex-col gap-1 text-[11px] text-white/60">
        Stato del canale
        <select className={inp} value={c.stato} onChange={(e) => setC({ ...c, stato: e.target.value as CanaleTematicoDati["stato"] })}>
          {STATI_CANALE.map(([k, t]) => (
            <option key={k} value={k}>
              {t}
            </option>
          ))}
        </select>
      </label>
      <label className="flex flex-col gap-1 text-[11px] text-white/60">
        Channel del registro collegato (logo / scheda)
        <select className={inp} value={c.slugRegistro ?? ""} onChange={(e) => setC({ ...c, slugRegistro: e.target.value || null })}>
          <option value="">— nessuno —</option>
          {d.registro.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </label>
      <label className="flex flex-col gap-1 text-[11px] text-white/60">
        Logo ufficiale (percorso /channel/loghi/… o https)
        <input className={inp} value={c.logo ?? ""} onChange={(e) => setC({ ...c, logo: e.target.value || null })} />
      </label>
      <label className="flex flex-col gap-1 text-[11px] text-white/60">
        Pagina esistente del sito (facoltativa)
        <input className={inp} value={c.pagina ?? ""} onChange={(e) => setC({ ...c, pagina: e.target.value || null })} placeholder="/arm-wrestling" />
      </label>
      <div className="flex flex-col gap-1 text-[11px] text-white/60">
        Tipi di contenuto ammessi
        <div className="flex flex-wrap gap-3 pt-1 text-xs text-white">
          {TIPI.map((t) => (
            <label key={t} className="inline-flex items-center gap-1.5">
              <input
                type="checkbox"
                checked={c.tipiAmmessi.includes(t)}
                onChange={(e) => setC({ ...c, tipiAmmessi: e.target.checked ? [...c.tipiAmmessi, t] : c.tipiAmmessi.filter((x) => x !== t) })}
              />
              {NOME_TIPO[t]}
            </label>
          ))}
        </div>
      </div>
      <label className="flex flex-col gap-1 text-[11px] text-white/60">
        Campi propri (uno per riga, «chiave: Etichetta»)
        <textarea className={`${inp} min-h-[84px] font-mono text-xs`} value={campiTesto} onChange={(e) => setCampiTesto(e.target.value)} placeholder={"artista: Artista\ngenere: Genere"} />
      </label>
      <div className="grid gap-3 rounded-lg border border-white/10 p-3 md:col-span-2 md:grid-cols-3" data-testid="impostazioni-palinsesto">
        <label className="flex flex-col gap-1 text-[11px] text-white/60">
          Riproduzione
          <select className={inp} value={c.riproduzione} onChange={(e) => setC({ ...c, riproduzione: e.target.value as CanaleTematicoDati["riproduzione"] })} data-testid="riproduzione-canale">
            <option value="casuale">Casuale per ogni spettatore</option>
            <option value="sequenza">In sequenza (ordine della scaletta)</option>
          </select>
        </label>
        <label className="inline-flex items-center gap-2 self-end pb-2 text-xs text-white">
          <input type="checkbox" checked={c.cicloH24} disabled={c.riproduzione !== "sequenza"} onChange={(e) => setC({ ...c, cicloH24: e.target.checked })} data-testid="ciclo-h24" />
          <Repeat className="h-3.5 w-3.5" style={{ color: GIALLO }} /> Ciclo continuo H24 (dopo l'ultimo video si riparte dal primo)
        </label>
        <label className="flex flex-col gap-1 text-[11px] text-white/60">
          Secondi per anteprima / immagine statica (3–120)
          <input
            type="number"
            min={3}
            max={120}
            className={inp}
            value={c.secondiImmagine}
            onChange={(e) => setC({ ...c, secondiImmagine: Math.min(120, Math.max(3, Number(e.target.value) || 7)) })}
            data-testid="secondi-immagine"
          />
        </label>
        <p className="text-[11px] text-white/45 md:col-span-3">
          Limite di 90 minuti per <b>singolo video</b> (sotto, qualunque durata: 16, 22, 30, 45 minuti…). La scaletta può arrivare a 24 ore in totale; se è più corta, il Ciclo continuo
          H24 la ripete. Oltre i 90 minuti il video non viene tagliato: si avvisa prima dell'inserimento e serve la conferma.
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-3 md:col-span-2">
        <label className="inline-flex items-center gap-2 text-xs text-white">
          <input type="checkbox" checked={c.abilitato} onChange={(e) => setC({ ...c, abilitato: e.target.checked })} /> Canale acceso (visibile sul sito)
        </label>
        <label className="inline-flex items-center gap-2 text-xs text-white/70">
          Ordine
          <input type="number" className={`${inp} w-20`} value={c.ordine} onChange={(e) => setC({ ...c, ordine: Number(e.target.value) || 0 })} />
        </label>
        <button
          type="button"
          className={btnPieno}
          style={{ background: GIALLO }}
          disabled={salva.isPending || !c.slug || !c.nome || !c.tipiAmmessi.length}
          onClick={() => salva.mutate({ codice, nuovo, canale: { ...c, campi } }, { onSuccess: () => onFatto(c.slug) })}
          data-testid="salva-canale"
        >
          <Check className="h-4 w-4" /> {nuovo ? "CREA CANALE" : "SALVA CANALE"}
        </button>
        {!nuovo && (
          <button
            type="button"
            className={btn}
            disabled={elimina.isPending || n > 0}
            title={n > 0 ? "Il canale ha contenuti: spostarli o eliminarli prima, oppure spegnere il canale." : ""}
            onClick={() => window.confirm(`Eliminare il canale ${c.nome}?`) && elimina.mutate({ codice, slug: c.slug }, { onSuccess: () => onFatto("") })}
          >
            <Trash2 className="h-3.5 w-3.5" /> Elimina canale {n > 0 ? `(ha ${n} contenuti)` : ""}
          </button>
        )}
        {(salva.error || elimina.error) && <span className="text-xs text-[#ff8a8a]">{msg(salva.error ?? elimina.error)}</span>}
      </div>
    </div>
  );
}

/* ── inserimento singolo con anteprima ────────────────────────────────────── */

type Analisi = Awaited<ReturnType<typeof analizzaUrlTematico>>;

function InserisciUrl({ codice, canale }: { codice: string; canale: CanaleTematicoDati }) {
  const [url, setUrl] = useState("");
  const [tipo, setTipo] = useState<(typeof TIPI)[number]>(canale.tipiAmmessi[0] ?? "video");
  const [an, setAn] = useState<Analisi | null>(null);
  const [errore, setErrore] = useState<string | null>(null);
  const [carica, setCarica] = useState(false);
  const [titolo, setTitolo] = useState("");
  const [miniatura, setMiniatura] = useState("");
  const [fonte, setFonte] = useState("");
  const [campi, setCampi] = useState<Record<string, string>>({});
  const [durata, setDurata] = useState("");
  const [conferma, setConferma] = useState(false);
  const aggiungi = useAggiungiVoceTematica();
  const [esito, setEsito] = useState<string | null>(null);
  const durataSec = leggiDurata(durata);
  const oltre = tipo === "video" && !!durataSec && durataSec > LIMITE_VIDEO;

  useEffect(() => setTipo(canale.tipiAmmessi[0] ?? "video"), [canale]);

  const analizza = async (u = url) => {
    setErrore(null);
    setEsito(null);
    setCarica(true);
    try {
      const a = await analizzaUrlTematico({ codice, url: u });
      setAn(a);
      setUrl(a.url);
      setTitolo(a.titolo ?? "");
      setMiniatura(a.miniatura ?? "");
      setFonte(a.autore ?? "");
      setDurata(durataInCampo(a.durataSec));
      setConferma(false);
      if (a.piattaforma === "pagina" && canale.tipiAmmessi.includes("articolo")) setTipo("articolo");
      else if (a.piattaforma !== "pagina" && canale.tipiAmmessi.includes("video")) setTipo("video");
    } catch (e) {
      setAn(null);
      setErrore(msg(e));
    } finally {
      setCarica(false);
    }
  };

  return (
    <section className="flex flex-col gap-3 rounded-xl border border-white/10 p-4" data-testid="inserisci-url">
      <h3 className="text-sm font-extrabold">Inserisci un URL</h3>
      <div className="flex flex-col gap-2 sm:flex-row">
        <input className={inp} value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://www.youtube.com/watch?v=… · vimeo.com/… · dailymotion.com/video/… · file .mp4 · pagina editoriale" data-testid="url-singolo" />
        <button type="button" className={btnPieno} style={{ background: GIALLO }} disabled={carica || url.trim().length < 4} onClick={() => void analizza()} data-testid="analizza-url">
          {carica ? <Loader2 className="h-4 w-4 animate-spin" /> : <Eye className="h-4 w-4" />} ANALIZZA
        </button>
      </div>
      {errore && <p className="text-xs text-[#ff8a8a]">{errore}</p>}
      {an && (
        <div className="grid gap-4 lg:grid-cols-[minmax(0,560px)_1fr]" data-testid="esito-analisi">
          <AnteprimaEmbed piattaforma={an.piattaforma} embedId={an.embedId} url={an.url} />
          <div className="flex flex-col gap-2">
            <p className="text-xs">
              <b className="uppercase">{an.piattaforma}</b> ·{" "}
              <span style={{ color: an.esito === "ok" ? "#7CFFB2" : an.esito === "errore" ? "#ff8a8a" : GIALLO }} data-testid="esito-verifica">
                {an.messaggio}
              </span>
            </p>
            {tipo === "video" && (
              <p
                className="inline-flex items-start gap-1.5 text-xs font-bold"
                style={{ color: oltre ? "#ffb36b" : durataSec ? "#7CFFB2" : GIALLO }}
                data-testid="avviso-durata"
                data-esito={oltre ? "oltre" : durataSec ? "ok" : "mancante"}
              >
                {(oltre || !durataSec) && <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />}
                {oltre
                  ? `Durata ${testoDurata(durataSec)}: supera il limite di 90 minuti per singolo video (${testoDurata(durataSec! - LIMITE_VIDEO)} oltre). Non viene tagliato: per inserirlo serve la conferma.`
                  : durataSec
                    ? `Durata ${testoDurata(durataSec)}${an.durataSec && durataSec === an.durataSec ? ` (${an.durataDa === "ricerca" ? "letta dai risultati di ricerca pubblici di YouTube" : an.durataDa === "pagina" ? "letta dalla pagina pubblica" : "dalla fonte"})` : " (scritta a mano)"}: entro il limite di 90 minuti.`
                    : "Durata non leggibile dalla fonte: scriverla a mano (h:mm:ss o secondi) prima di approvare il video."}
              </p>
            )}
            {an.giaIn.length > 0 && (
              <p className="inline-flex items-center gap-1.5 text-xs text-[#ffb36b]" data-testid="avviso-duplicato">
                <AlertTriangle className="h-3.5 w-3.5" /> URL già presente in: {an.giaIn.join(", ")}
                {an.giaIn.includes(canale.slug) ? " (in questo canale non verrà reinserito)" : ""}
              </p>
            )}
            {an.videoIncorporati.length > 0 && (
              <div className="text-xs text-white/70">
                Video incorporati trovati nella pagina:
                <ul className="mt-1 flex flex-col gap-1">
                  {an.videoIncorporati.map((v) => (
                    <li key={v} className="flex items-center gap-2">
                      <span className="truncate">{v}</span>
                      <button type="button" className={btn} onClick={() => void analizza(v)}>
                        usa questo
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <label className="flex flex-col gap-1 text-[11px] text-white/60">
              Tipo
              <select className={inp} value={tipo} onChange={(e) => setTipo(e.target.value as (typeof TIPI)[number])}>
                {canale.tipiAmmessi.map((t) => (
                  <option key={t} value={t}>
                    {NOME_TIPO[t]}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1 text-[11px] text-white/60">
              Titolo (recuperato dalla fonte, modificabile)
              <input className={inp} value={titolo} onChange={(e) => setTitolo(e.target.value)} data-testid="titolo-singolo" />
            </label>
            <label className="flex flex-col gap-1 text-[11px] text-white/60">
              Miniatura / copertina (URL)
              <input className={inp} value={miniatura} onChange={(e) => setMiniatura(e.target.value)} />
            </label>
            <label className="flex flex-col gap-1 text-[11px] text-white/60">
              Fonte
              <input className={inp} value={fonte} onChange={(e) => setFonte(e.target.value)} />
            </label>
            {tipo === "video" && (
              <label className="flex flex-col gap-1 text-[11px] text-white/60">
                Durata (h:mm:ss o secondi — letta dalla fonte, modificabile)
                <input className={inp} value={durata} onChange={(e) => setDurata(e.target.value)} placeholder="es. 16:31 oppure 1:29:29" data-testid="durata-singolo" />
              </label>
            )}
            {oltre && (
              <label className="inline-flex items-start gap-2 rounded-lg border border-[#ffb36b]/50 bg-[#ffb36b]/[0.08] p-2 text-xs text-white" data-testid="conferma-oltre">
                <input type="checkbox" checked={conferma} onChange={(e) => setConferma(e.target.checked)} className="mt-0.5" />
                Confermo l'inserimento di un video oltre i 90 minuti, senza tagli (resterà segnalato nel catalogo).
              </label>
            )}
            <CampiVoce canale={canale} valori={campi} onChange={setCampi} />
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                className={btnPieno}
                style={{ background: GIALLO }}
                disabled={aggiungi.isPending || (oltre && !conferma) || (!!durata.trim() && !durataSec)}
                title={oltre && !conferma ? "Oltre i 90 minuti: spuntare la conferma" : !!durata.trim() && !durataSec ? "Durata non valida" : ""}
                onClick={() =>
                  aggiungi.mutate(
                    {
                      codice,
                      slug: canale.slug,
                      url: an.url,
                      tipo,
                      titolo: titolo || null,
                      miniatura: miniatura || null,
                      fonte: fonte || null,
                      campi,
                      durataSec: tipo === "video" ? durataSec : null,
                      confermaOltre: oltre && conferma,
                    },
                    {
                      onSuccess: (r) => {
                        setEsito(r.messaggio);
                        if (r.esito === "inserito") {
                          setAn(null);
                          setUrl("");
                          setCampi({});
                          setDurata("");
                          setConferma(false);
                        }
                      },
                    },
                  )
                }
                data-testid="inserisci-bozza"
              >
                <Plus className="h-4 w-4" /> INSERISCI IN BOZZA
              </button>
              {aggiungi.error && <span className="text-xs text-[#ff8a8a]">{msg(aggiungi.error)}</span>}
            </div>
          </div>
        </div>
      )}
      {esito && (
        <p className="text-xs text-white/80" data-testid="esito-inserimento">
          {esito}
        </p>
      )}
    </section>
  );
}

function ImportaElenco({ codice, canale }: { codice: string; canale: CanaleTematicoDati }) {
  const [testo, setTesto] = useState("");
  const [tipo, setTipo] = useState<(typeof TIPI)[number]>(canale.tipiAmmessi[0] ?? "video");
  const [fonte, setFonte] = useState("");
  const [conferma, setConferma] = useState(false);
  const imp = useImportaTematici();
  useEffect(() => setTipo(canale.tipiAmmessi[0] ?? "video"), [canale]);
  return (
    <section className="flex flex-col gap-3 rounded-xl border border-white/10 p-4" data-testid="importa-elenco">
      <h3 className="text-sm font-extrabold">Importa un elenco di URL (max 100, uno per riga) — entrano tutti in bozza</h3>
      <textarea className={`${inp} min-h-[110px] font-mono text-xs`} value={testo} onChange={(e) => setTesto(e.target.value)} placeholder={"https://youtu.be/…\nhttps://vimeo.com/…"} data-testid="testo-import" />
      <div className="flex flex-wrap items-center gap-2">
        <select className={`${inp} w-auto`} value={tipo} onChange={(e) => setTipo(e.target.value as (typeof TIPI)[number])}>
          {canale.tipiAmmessi.map((t) => (
            <option key={t} value={t}>
              {NOME_TIPO[t]}
            </option>
          ))}
        </select>
        <input className={`${inp} w-auto flex-1`} value={fonte} onChange={(e) => setFonte(e.target.value)} placeholder="Fonte (facoltativa, altrimenti l'autore indicato dalla piattaforma)" />
        <button type="button" className={btnPieno} style={{ background: GIALLO }} disabled={imp.isPending || !testo.trim()} onClick={() => imp.mutate({ codice, slug: canale.slug, testo, tipo, fonte: fonte || null, confermaOltre: conferma })} data-testid="avvia-import">
          {imp.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />} IMPORTA
        </button>
      </div>
      <label className="inline-flex items-start gap-2 text-[11px] text-white/70">
        <input type="checkbox" checked={conferma} onChange={(e) => setConferma(e.target.checked)} className="mt-0.5" />
        Inserire anche i video oltre i 90 minuti (senza tagli, segnalati). Senza spunta vengono elencati come «OLTRE-LIMITE» e NON inseriti.
      </label>
      {imp.error && <p className="text-xs text-[#ff8a8a]">{msg(imp.error)}</p>}
      {imp.data && (
        <div className="text-xs" data-testid="esiti-import">
          <p className="font-bold">
            Inseriti {imp.data.inseriti} · duplicati {imp.data.duplicati} · non validi {imp.data.nonValidi} · oltre 90 minuti non inseriti {imp.data.oltreLimite}
          </p>
          <ul className="mt-1 flex max-h-56 flex-col gap-1 overflow-auto">
            {imp.data.esiti.map((e, i) => (
              <li key={i} className="flex gap-2">
                <span className="w-24 shrink-0 font-bold" style={{ color: e.esito === "inserito" ? "#7CFFB2" : e.esito === "duplicato" || e.esito === "oltre-limite" ? "#ffb36b" : "#ff8a8a" }}>
                  {e.esito.toUpperCase()}
                </span>
                <span className="min-w-0 truncate text-white/60">{e.url}</span>
                <span className="min-w-0 flex-1 text-white/80">
                  {e.durataSec ? `[${testoDurata(e.durataSec)}] ` : ""}
                  {e.messaggio}
                  {e.ancheIn ? ` · già anche in: ${e.ancheIn.join(", ")}` : ""}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}

/* ── catalogo ─────────────────────────────────────────────────────────────── */

function RigaVoce({
  codice,
  v,
  d,
  canale,
  posizione,
  sposta,
}: {
  codice: string;
  v: VoceAdmin;
  d: QuadroTematici;
  canale: CanaleTematicoDati;
  posizione: { n: number; di: number };
  sposta: ((verso: -1 | 1) => void) | null;
}) {
  const [aperta, setAperta] = useState(false);
  const [modifica, setModifica] = useState(false);
  const [f, setF] = useState({
    titolo: v.titolo,
    url: v.url,
    miniatura: v.miniatura ?? "",
    fonte: v.fonte ?? "",
    tipo: v.tipo,
    canale: v.canale,
    campi: v.campi,
    durata: durataInCampo(v.durataSec),
  });
  const stato = useStatoVoceTematica();
  const verifica = useVerificaVoceTematica();
  const agg = useAggiornaVoceTematica();
  const del = useEliminaVoceTematica();
  const [nota, setNota] = useState<string | null>(null);
  const err = stato.error ?? verifica.error ?? agg.error ?? del.error;

  const cambia = (s: string, forza = false, confermaOltre = false) =>
    stato.mutate(
      { codice, id: v.id, stato: s, forza, confermaOltre },
      {
        onError: (e) => {
          if ((e as { code?: string }).code !== "PRECONDITION_FAILED") return;
          if (/90 minuti/.test(msg(e))) {
            if (window.confirm(`${msg(e)}\n\nConfermi la messa in onda senza tagli?`)) cambia(s, forza, true);
          } else if (window.confirm(`${msg(e)}\n\nHai controllato l'anteprima e il video si riproduce?`)) cambia(s, true, confermaOltre);
        },
      },
    );
  const durataNuova = leggiDurata(f.durata);
  const salvaModifica = (confermaOltre = false) =>
    agg.mutate(
      {
        codice,
        id: v.id,
        titolo: f.titolo,
        url: f.url !== v.url ? f.url : undefined,
        miniatura: f.miniatura || null,
        fonte: f.fonte || null,
        tipo: f.tipo,
        canale: f.canale,
        campi: f.campi,
        durataSec: durataNuova,
        confermaOltre,
      },
      {
        onSuccess: () => setModifica(false),
        onError: (e) => {
          if ((e as { code?: string }).code === "PRECONDITION_FAILED" && window.confirm(`${msg(e)}\n\nConfermi senza tagli?`)) salvaModifica(true);
        },
      },
    );

  return (
    <li className="flex flex-col gap-2 rounded-xl border border-white/10 bg-white/[0.02] p-3" data-testid="voce-catalogo" data-stato={v.stato}>
      <div className="flex flex-wrap items-start gap-3">
        <div className="flex w-8 shrink-0 flex-col items-center gap-1 pt-0.5">
          <span className="text-xs font-extrabold" style={{ color: GIALLO }} data-testid="posizione-voce">
            {posizione.n}
          </span>
          {sposta && (
            <>
              <button type="button" className="grid h-7 w-7 place-items-center rounded-full border border-white/15 text-white/80 hover:border-[#d7ff00] disabled:opacity-30" disabled={posizione.n === 1} onClick={() => sposta(-1)} aria-label="Sposta su" data-testid="sposta-su">
                <ArrowUp className="h-3.5 w-3.5" />
              </button>
              <button type="button" className="grid h-7 w-7 place-items-center rounded-full border border-white/15 text-white/80 hover:border-[#d7ff00] disabled:opacity-30" disabled={posizione.n === posizione.di} onClick={() => sposta(1)} aria-label="Sposta giù" data-testid="sposta-giu">
                <ArrowDown className="h-3.5 w-3.5" />
              </button>
            </>
          )}
        </div>
        {v.miniatura ? (
          <img src={v.miniatura} alt="" className="h-14 w-24 shrink-0 rounded-md bg-black object-cover" loading="lazy" referrerPolicy="no-referrer" />
        ) : (
          <div className="h-14 w-24 shrink-0 rounded-md bg-white/[0.05]" />
        )}
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold leading-snug">{v.titolo}</p>
          <p className="mt-0.5 text-[11px] text-white/50">
            {NOME_TIPO[v.tipo]} · {v.piattaforma}
            {v.tipo === "video" ? <> · <b className="text-white/80" data-testid="durata-voce">{v.durataSec ? testoDurata(v.durataSec) : "durata da inserire"}</b></> : null} · {v.fonte ?? "—"} ·{" "}
            <a href={v.url} target="_blank" rel="noreferrer" className="underline">
              URL
            </a>
          </p>
          <p className="mt-1 flex flex-wrap gap-2 text-[10px] font-extrabold tracking-[0.12em]">
            <span style={{ color: COLORE_STATO[v.stato] }}>{v.stato.toUpperCase()}</span>
            {!v.abilitato && <span className="text-white/50">SPENTO</span>}
            {v.duplicato && <span className="text-[#ffb36b]">URL DUPLICATO IN ALTRO CANALE</span>}
            {v.tipo === "video" && v.piattaforma === "pagina" && <span className="text-[#ff8a8a]">NON RIPRODUCIBILE: È UNA PAGINA</span>}
            {v.errori > 0 && <span className="text-[#ff8a8a]">{v.errori} ERRORI PLAYER</span>}
            {v.oltreLimite && (
              <span className="text-[#ffb36b]" data-testid="oltre-limite">
                OLTRE 90 MINUTI ({testoDurata(v.durataSec)}){v.confermaOltre ? " · CONFERMATO, NON TAGLIATO" : ""}
              </span>
            )}
            {v.tipo === "video" && !v.durataSec && <span className="text-[#ffb36b]">DURATA MANCANTE</span>}
          </p>
          {v.verifica && (
            <p className="mt-1 text-[11px]" style={{ color: v.verifica.esito === "ok" ? "#7CFFB2" : v.verifica.esito === "errore" ? "#ff8a8a" : GIALLO }}>
              Verifica {new Date(v.verifica.quando).toLocaleString("it-IT")}: {v.verifica.messaggio}
            </p>
          )}
          {v.ultimoErrore && <p className="text-[11px] text-[#ff8a8a]">Ultimo errore: {v.ultimoErrore.messaggio}</p>}
        </div>
      </div>
      <div className="flex flex-wrap gap-1.5">
        <button type="button" className={btn} onClick={() => setAperta(!aperta)} data-testid="anteprima-voce">
          <Eye className="h-3.5 w-3.5" /> Anteprima
        </button>
        <button type="button" className={btn} disabled={verifica.isPending} onClick={() => verifica.mutate({ codice, id: v.id }, { onSuccess: (r) => setNota(r.messaggio) })}>
          <RefreshCw className={`h-3.5 w-3.5 ${verifica.isPending ? "animate-spin" : ""}`} /> Verifica
        </button>
        {v.stato !== "approvato" && (
          <button type="button" className={btn} disabled={stato.isPending} onClick={() => cambia("approvato")} data-testid="approva-voce">
            Approva
          </button>
        )}
        {v.stato !== "pubblicato" && (
          <button type="button" className={btn} disabled={stato.isPending} onClick={() => cambia("pubblicato")}>
            Pubblica
          </button>
        )}
        {v.stato !== "bozza" && (
          <button type="button" className={btn} disabled={stato.isPending} onClick={() => cambia("bozza")}>
            Torna in bozza
          </button>
        )}
        {v.stato !== "non-disponibile" && (
          <button type="button" className={btn} disabled={stato.isPending} onClick={() => cambia("non-disponibile")}>
            Non disponibile
          </button>
        )}
        <button type="button" className={btn} disabled={agg.isPending} onClick={() => agg.mutate({ codice, id: v.id, abilitato: !v.abilitato })}>
          {v.abilitato ? "Spegni" : "Accendi"}
        </button>
        <button type="button" className={btn} onClick={() => setModifica(!modifica)}>
          Modifica
        </button>
        <button type="button" className={btn} disabled={del.isPending} onClick={() => window.confirm(`Eliminare «${v.titolo}» dal catalogo?`) && del.mutate({ codice, id: v.id })}>
          <Trash2 className="h-3.5 w-3.5" /> Elimina
        </button>
        {stato.isPending && <Loader2 className="h-4 w-4 animate-spin text-white/50" />}
      </div>
      {nota && <p className="text-[11px] text-white/70">{nota}</p>}
      {err && <p className="text-[11px] text-[#ff8a8a]">{msg(err)}</p>}
      {aperta && <AnteprimaEmbed piattaforma={v.piattaforma} embedId={v.embedId} url={v.url} />}
      {modifica && (
        <div className="grid gap-2 rounded-lg border border-white/10 p-3 sm:grid-cols-2">
          <label className="flex flex-col gap-1 text-[11px] text-white/60">
            Titolo
            <input className={inp} value={f.titolo} onChange={(e) => setF({ ...f, titolo: e.target.value })} />
          </label>
          <label className="flex flex-col gap-1 text-[11px] text-white/60">
            URL (cambiandolo il contenuto torna in bozza)
            <input className={inp} value={f.url} onChange={(e) => setF({ ...f, url: e.target.value })} />
          </label>
          <label className="flex flex-col gap-1 text-[11px] text-white/60">
            Miniatura
            <input className={inp} value={f.miniatura} onChange={(e) => setF({ ...f, miniatura: e.target.value })} />
          </label>
          <label className="flex flex-col gap-1 text-[11px] text-white/60">
            Fonte
            <input className={inp} value={f.fonte} onChange={(e) => setF({ ...f, fonte: e.target.value })} />
          </label>
          <label className="flex flex-col gap-1 text-[11px] text-white/60">
            Tipo
            <select className={inp} value={f.tipo} onChange={(e) => setF({ ...f, tipo: e.target.value as VoceAdmin["tipo"] })}>
              {TIPI.map((t) => (
                <option key={t} value={t}>
                  {NOME_TIPO[t]}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-[11px] text-white/60">
            Canale
            <select className={inp} value={f.canale} onChange={(e) => setF({ ...f, canale: e.target.value })}>
              {d.canali.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {c.nome}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-[11px] text-white/60">
            Durata (h:mm:ss o secondi)
            <input className={inp} value={f.durata} onChange={(e) => setF({ ...f, durata: e.target.value })} placeholder="es. 17:38" data-testid="durata-modifica" />
            {f.durata.trim() && !durataNuova && <span className="text-[#ff8a8a]">Durata non valida.</span>}
            {durataNuova && durataNuova > LIMITE_VIDEO && <span className="text-[#ffb36b]">Oltre i 90 minuti: al salvataggio verrà chiesta la conferma (nessun taglio).</span>}
          </label>
          <div className="sm:col-span-2">
            <CampiVoce canale={d.canali.find((c) => c.slug === f.canale) ?? canale} valori={f.campi} onChange={(campi) => setF({ ...f, campi })} />
          </div>
          <button
            type="button"
            className={`${btnPieno} w-fit`}
            style={{ background: GIALLO }}
            disabled={agg.isPending || (!!f.durata.trim() && !durataNuova)}
            onClick={() => salvaModifica()}
          >
            <Check className="h-4 w-4" /> SALVA
          </button>
        </div>
      )}
    </li>
  );
}

/* ── pagina ───────────────────────────────────────────────────────────────── */

export default function PannelloCanaliTematiciPage() {
  const { codice } = useCodiceAllestimento();
  const q = useQuadroTematici(codice);
  const [scelto, setScelto] = useState<string>("");
  const [nuovo, setNuovo] = useState(false);
  const [filtro, setFiltro] = useState("tutti");
  const svuota = useSvuotaErroriTematici();
  const ordina = useOrdinaTematici();
  const d = q.data;
  const canale = d?.canali.find((c) => c.slug === scelto) ?? d?.canali[0] ?? null;
  const delCanale = useMemo(() => (d && canale ? d.voci.filter((v) => v.canale === canale.slug) : []), [d, canale]);
  const voci = useMemo(() => delCanale.filter((v) => filtro === "tutti" || v.stato === filtro), [delCanale, filtro]);
  const inOnda = delCanale.filter((v) => v.tipo === "video" && v.abilitato && (v.stato === "approvato" || v.stato === "pubblicato") && v.piattaforma !== "pagina");
  const totale = inOnda.reduce((t, v) => t + (v.durataSec ?? 0), 0);
  const sposta = (id: number, verso: -1 | 1) => {
    if (!canale) return;
    const ids = delCanale.map((v) => v.id);
    const k = ids.indexOf(id);
    const j = k + verso;
    if (k < 0 || j < 0 || j >= ids.length) return;
    [ids[k], ids[j]] = [ids[j]!, ids[k]!];
    ordina.mutate({ codice, slug: canale.slug, ids });
  };

  if (!codice)
    return (
      <div className="mx-auto flex max-w-[900px] flex-col gap-5 px-4 py-10">
        <h1 className="tbh-display tbh-h2 flex items-center gap-3" style={{ color: GIALLO }}>
          <Lock className="h-6 w-6" /> Canali tematici
        </h1>
        <p className="text-sm text-[var(--tbh-muted)]">Area riservata: serve il codice di allestimento.</p>
        <SbloccoAllestimento />
      </div>
    );

  return (
    <div className="mx-auto flex max-w-[1400px] flex-col gap-6 px-4 py-8 md:px-8" data-testid="pannello-tematici">
      <Link href="/allestimento/channel" className="inline-flex w-fit items-center gap-1.5 text-sm text-[var(--tbh-muted)] hover:text-white">
        <ArrowLeft className="h-4 w-4" /> Palinsesti Channel
      </Link>
      <header className="flex flex-col gap-2">
        <h1 className="tbh-display tbh-h1 leading-[0.95]" style={{ color: GIALLO }}>
          CANALI TEMATICI
        </h1>
        <p className="max-w-3xl text-sm text-[var(--tbh-muted)]">
          Ogni nuovo URL entra in <b>bozza</b>. Un video va in onda solo da <b>approvato</b> o <b>pubblicato</b>, dopo una verifica riuscita con il servizio ufficiale e con la
          durata nota (massimo 90 minuti per singolo video, oltre serve la conferma: nessun taglio). La riproduzione è casuale per ogni spettatore oppure in sequenza nell'ordine
          della scaletta, con il Ciclo continuo H24 (non una diretta). Solo player ufficiali: niente download né copie.
          {d ? ` Ambito: ${d.ambiente}.` : ""}
        </p>
        <div className="flex max-w-3xl items-start gap-3 rounded-xl border border-[#ffb36b]/40 bg-[#ffb36b]/[0.06] p-3 text-xs text-white/80">
          <img src="/channel/loghi/partner/best-entertainment.jpe" alt="Best Entertainment" className="h-10 w-auto rounded bg-white p-0.5" loading="lazy" />
          <p>
            <b>bestentertainment.it</b> (fonte iniziale di Touch Influencity Magazine) protegge le pagine con una verifica anti-robot: il server non può leggerle né ricavare i video
            incorporati. Inserimento manuale: aprire l'articolo, copiare l'URL del video YouTube/Vimeo e incollarlo qui. La categoria «Videoclip» mescola video musicali (→ TOUCH
            MUSIC) e presentazioni di modelle (→ TOUCH INFLUENCITY MAGAZINE): il canale si sceglie a mano per ciascun contenuto.
          </p>
        </div>
      </header>

      {q.isError && <p className="text-sm text-[#ff8a8a]">{msg(q.error)}</p>}
      {q.isLoading && <Loader2 className="h-5 w-5 animate-spin text-white/50" />}

      {d && (
        <>
          <div className="flex flex-wrap gap-2" data-testid="schede-canali">
            {d.canali.map((c) => (
              <button
                key={c.slug}
                type="button"
                onClick={() => {
                  setScelto(c.slug);
                  setNuovo(false);
                }}
                className="rounded-full border px-4 py-1.5 text-[11px] font-extrabold tracking-[0.12em]"
                style={{
                  borderColor: canale?.slug === c.slug && !nuovo ? GIALLO : "rgba(255,255,255,.15)",
                  color: c.abilitato ? (canale?.slug === c.slug && !nuovo ? GIALLO : "#fff") : "rgba(255,255,255,.4)",
                }}
              >
                {c.nome} · {d.voci.filter((v) => v.canale === c.slug).length}
                {!c.abilitato ? " · SPENTO" : ""}
              </button>
            ))}
            <button type="button" className={btn} onClick={() => setNuovo(true)} data-testid="nuovo-canale">
              <Plus className="h-3.5 w-3.5" /> Nuovo canale
            </button>
          </div>

          {nuovo ? (
            <EditorCanale
              codice={codice}
              d={d}
              iniziale={VUOTO}
              nuovo
              onFatto={(s) => {
                setNuovo(false);
                setScelto(s);
              }}
            />
          ) : (
            canale && (
              <>
                <div className="flex flex-wrap items-center gap-3">
                  {canale.logo && <img src={canale.logo} alt="" className="h-12 w-auto max-w-[200px] object-contain" />}
                  <h2 className="tbh-display tbh-h3">{canale.nome}</h2>
                  <Link href={canale.pagina === "/arm-wrestling" ? "/arm-wrestling" : `/canali/${canale.slug}`} className="text-xs underline" style={{ color: GIALLO }}>
                    Apri il canale sul sito
                  </Link>
                </div>
                <EditorCanale codice={codice} d={d} iniziale={canale} nuovo={false} onFatto={(s) => setScelto(s)} />
                <InserisciUrl codice={codice} canale={canale} />
                <ImportaElenco codice={codice} canale={canale} />
                <section className="flex flex-col gap-3" data-testid="catalogo-admin">
                  <div className="flex flex-wrap items-center gap-2 rounded-xl border border-white/10 bg-white/[0.02] p-3 text-xs" data-testid="riepilogo-scaletta">
                    <b className="tracking-[0.12em]">SCALETTA IN ONDA</b>
                    <span className="text-white/70">
                      {inOnda.length} video · durata totale <b className="text-white" data-testid="totale-scaletta">{testoDurata(totale)}</b>
                      {inOnda.some((v) => !v.durataSec) ? ` · ${inOnda.filter((v) => !v.durataSec).length} senza durata` : ""}
                    </span>
                    <span className="text-white/60">· {canale.riproduzione === "sequenza" ? "in sequenza" : "casuale"}</span>
                    {canale.riproduzione === "sequenza" && canale.cicloH24 && (
                      <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-extrabold tracking-[0.14em] text-black" style={{ background: GIALLO }}>
                        <Repeat className="h-3 w-3" /> CICLO CONTINUO H24
                      </span>
                    )}
                    {totale > 24 * 3600 && <span className="font-bold text-[#ffb36b]">Supera le 24 ore: spegnere o togliere qualche video.</span>}
                    {inOnda.some((v) => v.oltreLimite) && <span className="font-bold text-[#ffb36b]">{inOnda.filter((v) => v.oltreLimite).length} oltre 90 minuti (segnalati, non tagliati)</span>}
                    {ordina.isPending && <Loader2 className="h-3.5 w-3.5 animate-spin text-white/50" />}
                    {ordina.error && <span className="text-[#ff8a8a]">{msg(ordina.error)}</span>}
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-sm font-extrabold">Catalogo (ordine della scaletta: ↑/↓)</h3>
                    {["tutti", "bozza", "approvato", "pubblicato", "non-disponibile"].map((s) => (
                      <button key={s} type="button" onClick={() => setFiltro(s)} className={btn} style={filtro === s ? { borderColor: GIALLO, color: GIALLO } : undefined}>
                        {s} ({s === "tutti" ? d.voci.filter((v) => v.canale === canale.slug).length : d.voci.filter((v) => v.canale === canale.slug && v.stato === s).length})
                      </button>
                    ))}
                  </div>
                  {voci.length === 0 ? (
                    <p className="text-xs text-white/50">Nessun contenuto{filtro !== "tutti" ? ` in «${filtro}»` : ""}. Il canale mostra «Canale in allestimento — nuovi contenuti in arrivo».</p>
                  ) : (
                    <ul className="flex flex-col gap-2">
                      {voci.map((v) => (
                        <RigaVoce
                          key={`${v.id}-${v.aggiornato}`}
                          codice={codice}
                          v={v}
                          d={d}
                          canale={canale}
                          posizione={{ n: delCanale.indexOf(v) + 1, di: delCanale.length }}
                          sposta={filtro === "tutti" && !ordina.isPending ? (verso) => sposta(v.id, verso) : null}
                        />
                      ))}
                    </ul>
                  )}
                </section>
              </>
            )
          )}

          <section className="flex flex-col gap-2 rounded-xl border border-white/10 p-4" data-testid="registro-errori">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-sm font-extrabold">Registro degli errori del player ({d.errori.length})</h3>
              {d.errori.length > 0 && (
                <button type="button" className={btn} onClick={() => window.confirm("Svuotare il registro degli errori e azzerare i contatori «errori player» dei contenuti?") && svuota.mutate({ codice })}>
                  Svuota
                </button>
              )}
            </div>
            {d.errori.length === 0 ? (
              <p className="text-xs text-white/50">Nessun errore registrato.</p>
            ) : (
              <ul className="flex max-h-72 flex-col gap-1 overflow-auto text-[11px]">
                {d.errori.map((e, i) => (
                  <li key={i} className="text-white/75">
                    <span className="text-white/45">{new Date(e.quando).toLocaleString("it-IT")}</span> · {e.canale} · «{e.titolo}» · {e.codice}: {e.messaggio} · <i>{e.esito}</i>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      )}
    </div>
  );
}
