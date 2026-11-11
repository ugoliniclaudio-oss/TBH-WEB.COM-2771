import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "wouter";
import { ArrowLeft, Check, Eye, FileText, Link2, Loader2, Lock, Pause, Play, Plus, Search, Trash2, Upload } from "lucide-react";
import { SbloccoAllestimento, useCodiceAllestimento } from "../components/media-slot";
import { testoDurata } from "../components/canale-tematico-scaletta";
import { SchedaCms as AnteprimaScheda } from "../components/cms-pubblico";
import { AnteprimaEmbed, leggiDurata } from "./pannello-canali-tematici";
import {
  AggiungiPosizione,
  BadgeStato,
  ElencoPosizioni,
  ERRORE,
  Esito,
  FLUO,
  ORO,
  Sezione,
  btn,
  btnPieno,
  conEsito,
  etichetta,
  inp,
  msg,
  quando,
  type EsitoAzione,
} from "../components/cms-pannello-ui";
import { TabCanali, TabCaroselli, TabCopie, TabErrori, TabHome, TabPalinsesto } from "./pannello-cms-sezioni";
import {
  analizzaUrlCms,
  anteprimaSchedaCms,
  caricaFileCms,
  useEliminaSchedaCms,
  useQuadroCms,
  useSalvaSchedaCms,
  useStatoSchedaCms,
  type AnalisiCms,
  type QuadroCms,
  type SchedaCms,
  type SchedaInCms,
} from "../queries/contenuti-palinsesto";

/**
 * /allestimento/contenuti-palinsesto — GESTIONE CONTENUTI E PALINSESTO (28/10/2026).
 * Il Super Admin inserisce, modifica, ordina, programma e pubblica senza scrivere codice:
 *   · Contenuti — una SCHEDA per contenuto (URL video, URL immagine, URL destinazione, titolo,
 *     descrizione, fonte, testo del pulsante, caricamento file con limiti visibili), anteprima
 *     dell'URL (titolo e copertina dalla fonte, modificabili), Anteprima / Salva bozza / Pubblica,
 *     e le POSIZIONI (Home, Channel, carosello, playlist; ordine, inizio/fine, ripetizione).
 *   · Palinsesto — playlist con Play da capo o Diretta sincronizzata, ciclo continuo.
 *   · Home — Home 0 (i 28 Channel restano) + Home 2.0, 3.0 e successive, senza limite.
 *   · Channel e pagine — aggiunta, modifica, ordine e attivazione (una scheda, un URL).
 *   · Caroselli, Copie e pubblicazione, Errori.
 * I dati sono CONDIVISI fra anteprima e www.tbh-web.com: Publish e riavvii non li toccano.
 */

const TABS = [
  ["contenuti", "CONTENUTI"],
  ["palinsesto", "PALINSESTO"],
  ["home", "HOME"],
  ["canali", "CHANNEL E PAGINE"],
  ["caroselli", "CAROSELLI"],
  ["copie", "COPIE E PUBBLICAZIONE"],
  ["errori", "ERRORI"],
] as const;
type Tab = (typeof TABS)[number][0];

/* ── modulo di una scheda ─────────────────────────────────────────────────── */

type Modulo = {
  id?: string;
  titolo: string;
  descrizione: string;
  fonte: string;
  pulsante: string;
  videoUrl: string;
  videoCaricato: boolean;
  videoNome: string | null;
  immagineUrl: string;
  immagineCaricata: boolean;
  immagineNome: string | null;
  destinazione: string;
  durata: string;
  durataDa: SchedaInCms["durataDa"];
};
const VUOTO: Modulo = {
  titolo: "",
  descrizione: "",
  fonte: "",
  pulsante: "",
  videoUrl: "",
  videoCaricato: false,
  videoNome: null,
  immagineUrl: "",
  immagineCaricata: false,
  immagineNome: null,
  destinazione: "",
  durata: "",
  durataDa: null,
};
const daScheda = (s: SchedaCms): Modulo => ({
  id: s.id,
  titolo: s.titolo,
  descrizione: s.descrizione,
  fonte: s.fonte,
  pulsante: s.pulsante,
  videoUrl: s.video?.url ?? "",
  videoCaricato: !!s.video?.caricato,
  videoNome: s.video?.nomeFile ?? null,
  immagineUrl: s.immagine?.url ?? "",
  immagineCaricata: !!s.immagine?.caricato,
  immagineNome: s.immagine?.nomeFile ?? null,
  destinazione: s.destinazione ?? "",
  durata: s.durataSec ? testoDurata(s.durataSec) : "",
  durataDa: s.durataDa,
});
const perServer = (m: Modulo): SchedaInCms => {
  const durataSec = leggiDurata(m.durata);
  return {
    id: m.id,
    titolo: m.titolo.trim(),
    descrizione: m.descrizione,
    fonte: m.fonte,
    pulsante: m.pulsante,
    video: m.videoUrl.trim() ? { url: m.videoUrl.trim(), caricato: m.videoCaricato, nomeFile: m.videoNome } : null,
    immagine: m.immagineUrl.trim() ? { url: m.immagineUrl.trim(), caricato: m.immagineCaricata, nomeFile: m.immagineNome } : null,
    destinazione: m.destinazione.trim() || null,
    durataSec,
    durataDa: durataSec ? (m.durataDa ?? "manuale") : null,
  };
};

function Caricamento({
  codice,
  tipo,
  limiti,
  onCaricato,
}: {
  codice: string;
  tipo: "immagine" | "video";
  limiti: { formati: readonly string[]; maxMb: number };
  onCaricato: (url: string, nome: string, peso: number) => void;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const [perc, setPerc] = useState<number | null>(null);
  const [esito, setEsito] = useState<EsitoAzione>(null);
  const accetta = limiti.formati.map((f) => `.${f}`).join(",");
  const scegli = async (f: File | undefined) => {
    if (!f) return;
    const ext = (/\.([a-z0-9]+)$/i.exec(f.name)?.[1] ?? "").toLowerCase();
    if (!limiti.formati.includes(ext)) return setEsito({ ok: false, testo: `Formato non ammesso: ${tipo} solo ${limiti.formati.join(", ").toUpperCase()}.` });
    if (f.size > limiti.maxMb * 1048576) return setEsito({ ok: false, testo: `File di ${(f.size / 1048576).toFixed(1)} MB: il limite è ${limiti.maxMb} MB.` });
    setEsito(null);
    setPerc(0);
    try {
      const r = await caricaFileCms(codice, tipo, f, setPerc);
      onCaricato(r.url, f.name, r.peso);
      setEsito({ ok: true, testo: `Caricato e verificato nell'archivio TBH: ${f.name} (${(r.peso / 1048576).toFixed(1)} MB).` });
    } catch (e) {
      setEsito({ ok: false, testo: msg(e) });
    } finally {
      setPerc(null);
      if (ref.current) ref.current.value = "";
    }
  };
  return (
    <div className="flex flex-col gap-1">
      <div className="flex flex-wrap items-center gap-2">
        <button type="button" className={btn} disabled={perc !== null} onClick={() => ref.current?.click()} data-testid={`carica-${tipo}`}>
          {perc !== null ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />} Carica {tipo === "video" ? "un video" : "un'immagine"}
        </button>
        <span className="text-[10px] text-white/45" data-testid={`limiti-${tipo}`}>
          {limiti.formati.join(", ").toUpperCase()} · max {limiti.maxMb} MB
        </span>
        <input ref={ref} type="file" accept={accetta} className="hidden" onChange={(e) => void scegli(e.target.files?.[0])} />
      </div>
      {perc !== null && (
        <div className="h-1.5 w-full max-w-xs overflow-hidden rounded-full bg-white/10">
          <div className="h-full" style={{ width: `${perc}%`, background: FLUO }} />
        </div>
      )}
      <Esito e={esito} testid={`esito-carica-${tipo}`} />
    </div>
  );
}

function RisultatoAnalisi({ a, m, set }: { a: AnalisiCms; m: Modulo; set: (m: Modulo) => void }) {
  if (!a.valido) return <Esito e={{ ok: false, testo: a.messaggio }} testid="esito-analisi" />;
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-white/15 bg-black p-3 md:flex-row" data-testid="risultato-analisi">
      {a.copertina ? <img src={a.copertina} alt="" className="h-28 w-48 shrink-0 rounded-lg object-cover" /> : <div className="flex h-28 w-48 shrink-0 items-center justify-center rounded-lg bg-white/5 text-[10px] text-white/40">nessuna copertina</div>}
      <div className="flex min-w-0 flex-1 flex-col gap-1.5 text-xs">
        <p className="text-[10px] font-extrabold tracking-[0.14em] text-white/50">
          {a.piattaforma.toUpperCase()}
          {a.autore ? ` · ${a.autore}` : ""}
          {a.durataSec ? ` · ${testoDurata(a.durataSec)}` : ""}
        </p>
        <p className="text-sm font-bold" data-testid="analisi-titolo">
          {a.titolo ?? "Titolo non disponibile dalla fonte"}
        </p>
        <p style={{ color: a.esito === "errore" ? ERRORE : a.esito === "ok" ? FLUO : ORO }} data-testid="analisi-esito">
          {a.messaggio}
        </p>
        {a.video && !a.incorporabile && (
          <a href={a.linkFonte} target="_blank" rel="noopener noreferrer" className="w-fit underline" style={{ color: ORO }}>
            Sul sito comparirà come link alla fonte: {a.linkFonte}
          </a>
        )}
        <div className="flex flex-wrap gap-1.5 pt-1">
          {a.titolo && (
            <button type="button" className={btn} onClick={() => set({ ...m, titolo: a.titolo! })}>
              Usa questo titolo
            </button>
          )}
          {a.copertina && (
            <button type="button" className={btn} onClick={() => set({ ...m, immagineUrl: a.copertina!, immagineCaricata: false, immagineNome: null })}>
              Usa la copertina
            </button>
          )}
          {a.durataSec && (
            <button type="button" className={btn} onClick={() => set({ ...m, durata: testoDurata(a.durataSec), durataDa: a.durataDa ?? "fonte" })}>
              Usa la durata
            </button>
          )}
          {a.autore && !m.fonte && (
            <button type="button" className={btn} onClick={() => set({ ...m, fonte: a.autore! })}>
              Fonte: {a.autore}
            </button>
          )}
          {!a.video && m.videoUrl === a.url && (
            <button type="button" className={btn} onClick={() => set({ ...m, videoUrl: "", destinazione: a.url })}>
              Non è un video: usalo come URL destinazione
            </button>
          )}
        </div>
        {!!a.videoIncorporati?.length && (
          <div className="flex flex-col gap-1 pt-1">
            <p className="text-white/60">Video trovati nella pagina:</p>
            {a.videoIncorporati.map((u) => (
              <button key={u} type="button" className={`${btn} w-fit`} onClick={() => set({ ...m, videoUrl: u, videoCaricato: false, videoNome: null, destinazione: m.destinazione || a.url })}>
                Usa come URL video: {u}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function EditorScheda({ codice, d, scheda, onSalvata, onRimossa }: { codice: string; d: QuadroCms; scheda: SchedaCms | null; onSalvata: (id: string) => void; onRimossa: () => void }) {
  const [m, setM] = useState<Modulo>(scheda ? daScheda(scheda) : VUOTO);
  const [analisi, setAnalisi] = useState<AnalisiCms | null>(null);
  const [analizzando, setAnalizzando] = useState(false);
  const [anteprima, setAnteprima] = useState<Awaited<ReturnType<typeof anteprimaSchedaCms>> | null>(null);
  const [inAnteprima, setInAnteprima] = useState(false);
  const [esito, setEsito] = useState<EsitoAzione>(null);
  const salva = useSalvaSchedaCms();
  const stato = useStatoSchedaCms();
  const elimina = useEliminaSchedaCms();
  const s = scheda;
  const occupato = salva.isPending || stato.isPending || elimina.isPending;

  const analizza = async (url: string) => {
    if (!url.trim()) return;
    setAnalizzando(true);
    setAnalisi(null);
    try {
      const a = await analizzaUrlCms(codice, url.trim());
      setAnalisi(a);
      if (a.valido)
        setM((x) => ({
          ...x,
          titolo: x.titolo || a.titolo || "",
          immagineUrl: x.immagineUrl || a.copertina || "",
          durata: x.durata || (a.durataSec ? testoDurata(a.durataSec) : ""),
          durataDa: x.durata ? x.durataDa : a.durataSec ? (a.durataDa ?? "fonte") : x.durataDa,
          fonte: x.fonte || a.autore || "",
        }));
    } catch (e) {
      setAnalisi({ valido: false, messaggio: msg(e) });
    } finally {
      setAnalizzando(false);
    }
  };
  const vediAnteprima = async () => {
    setInAnteprima(true);
    setEsito(null);
    try {
      setAnteprima(await anteprimaSchedaCms(codice, perServer(m)));
    } catch (e) {
      setAnteprima(null);
      setEsito({ ok: false, testo: msg(e) });
    } finally {
      setInAnteprima(false);
    }
  };
  const registra = async (azione: "bozza" | "pubblica") => {
    const r = await conEsito(salva.mutateAsync({ codice, scheda: perServer(m), azione }), setEsito);
    if (r) {
      setM((x) => ({ ...x, id: r.scheda.id }));
      onSalvata(r.scheda.id);
    }
  };
  const anteVideo = anteprima?.voce.video;

  return (
    <div className="flex flex-col gap-4" data-testid="editor-scheda">
      <Sezione
        titolo={s ? `Scheda · ${s.titolo}` : "Nuova scheda"}
        destra={
          s && (
            <span className="flex items-center gap-2 text-[11px] text-white/50">
              <BadgeStato s={s.stato} /> aggiornata {quando(s.aggiornato)}
              {s.pubblicato ? ` · pubblicata ${quando(s.pubblicato)}` : ""}
            </span>
          )
        }
      >
        <div className="grid gap-3 lg:grid-cols-2">
          <label className={etichetta}>
            URL video (YouTube, Vimeo, Dailymotion o file .mp4/.webm)
            <div className="flex gap-2">
              <input
                className={inp}
                value={m.videoUrl}
                placeholder="https://www.youtube.com/watch?v=…"
                onChange={(e) => setM({ ...m, videoUrl: e.target.value, videoCaricato: false, videoNome: null })}
                data-testid="campo-video"
              />
              <button type="button" className={btn} disabled={!m.videoUrl.trim() || analizzando} onClick={() => void analizza(m.videoUrl)} data-testid="analizza-video">
                {analizzando ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Search className="h-3.5 w-3.5" />} Analizza
              </button>
            </div>
            {m.videoCaricato && <span className="text-[10px]" style={{ color: FLUO }}>File nell'archivio TBH: {m.videoNome ?? m.videoUrl}</span>}
          </label>
          <div className="flex flex-col gap-1">
            <span className="text-[11px] text-white/60">oppure carica il file video</span>
            <Caricamento codice={codice} tipo="video" limiti={d.limiti.video} onCaricato={(url, nome) => setM((x) => ({ ...x, videoUrl: url, videoCaricato: true, videoNome: nome }))} />
          </div>
          <label className={etichetta}>
            URL immagine (copertina)
            <input
              className={inp}
              value={m.immagineUrl}
              placeholder="https://…/immagine.jpg"
              onChange={(e) => setM({ ...m, immagineUrl: e.target.value, immagineCaricata: false, immagineNome: null })}
              data-testid="campo-immagine"
            />
            {m.immagineUrl && <img src={m.immagineUrl} alt="" className="mt-1 h-20 w-36 rounded object-cover" />}
          </label>
          <div className="flex flex-col gap-1">
            <span className="text-[11px] text-white/60">oppure carica l'immagine</span>
            <Caricamento codice={codice} tipo="immagine" limiti={d.limiti.immagine} onCaricato={(url, nome) => setM((x) => ({ ...x, immagineUrl: url, immagineCaricata: true, immagineNome: nome }))} />
          </div>
          <label className={etichetta}>
            URL destinazione (dove porta il pulsante: https://… o percorso interno /…)
            <div className="flex gap-2">
              <input className={inp} value={m.destinazione} placeholder="https://… oppure /pagina/…" onChange={(e) => setM({ ...m, destinazione: e.target.value })} data-testid="campo-destinazione" />
              <button type="button" className={btn} disabled={!/^https:\/\//.test(m.destinazione) || analizzando} onClick={() => void analizza(m.destinazione)}>
                <Search className="h-3.5 w-3.5" /> Analizza
              </button>
            </div>
          </label>
          <label className={etichetta}>
            Durata (h:mm:ss, mm:ss o secondi) — serve alla diretta sincronizzata
            <input className={inp} value={m.durata} placeholder="es. 4:12" onChange={(e) => setM({ ...m, durata: e.target.value, durataDa: "manuale" })} data-testid="campo-durata" />
            {m.durata && !leggiDurata(m.durata) && <span style={{ color: ERRORE }}>Durata non leggibile.</span>}
          </label>
        </div>

        {analisi && <RisultatoAnalisi a={analisi} m={m} set={setM} />}
        {analisi?.valido && analisi.incorporabile && analisi.embedId && <AnteprimaEmbed piattaforma={analisi.piattaforma} embedId={analisi.embedId} url={analisi.url} />}

        <div className="grid gap-3 lg:grid-cols-2">
          <label className={etichetta}>
            Titolo *
            <input className={inp} value={m.titolo} onChange={(e) => setM({ ...m, titolo: e.target.value })} data-testid="campo-titolo" />
          </label>
          <label className={etichetta}>
            Fonte (es. canale YouTube, testata, autore)
            <input className={inp} value={m.fonte} onChange={(e) => setM({ ...m, fonte: e.target.value })} data-testid="campo-fonte" />
          </label>
          <label className={`${etichetta} lg:col-span-2`}>
            Descrizione
            <textarea className={`${inp} min-h-[80px]`} value={m.descrizione} onChange={(e) => setM({ ...m, descrizione: e.target.value })} data-testid="campo-descrizione" />
          </label>
          <label className={etichetta}>
            Testo del pulsante (vuoto = automatico)
            <input className={inp} value={m.pulsante} maxLength={40} placeholder="GUARDA · APRI · CANDIDATI" onChange={(e) => setM({ ...m, pulsante: e.target.value })} data-testid="campo-pulsante" />
          </label>
        </div>

        <div className="flex flex-wrap items-center gap-2 border-t border-white/10 pt-3">
          <button type="button" className={btn} disabled={inAnteprima || occupato} onClick={() => void vediAnteprima()} data-testid="btn-anteprima">
            {inAnteprima ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Eye className="h-3.5 w-3.5" />} Anteprima
          </button>
          <button type="button" className={btnPieno} style={{ background: ORO }} disabled={occupato || !m.titolo.trim()} onClick={() => void registra("bozza")} data-testid="btn-bozza">
            <FileText className="h-3.5 w-3.5" /> Salva bozza
          </button>
          <button type="button" className={btnPieno} style={{ background: FLUO }} disabled={occupato || !m.titolo.trim()} onClick={() => void registra("pubblica")} data-testid="btn-pubblica">
            <Check className="h-3.5 w-3.5" /> Pubblica
          </button>
          {s && s.stato === "attivo" && (
            <button type="button" className={btn} disabled={occupato} onClick={() => void conEsito(stato.mutateAsync({ codice, id: s.id, stato: "sospeso" }), setEsito)} data-testid="btn-sospendi">
              <Pause className="h-3.5 w-3.5" /> Sospendi
            </button>
          )}
          {s && s.stato === "sospeso" && (
            <button type="button" className={btn} disabled={occupato} onClick={() => void conEsito(stato.mutateAsync({ codice, id: s.id, stato: "attivo" }), setEsito)}>
              <Play className="h-3.5 w-3.5" /> Riattiva
            </button>
          )}
          {s && s.stato !== "bozza" && (
            <button type="button" className={btn} disabled={occupato} onClick={() => void conEsito(stato.mutateAsync({ codice, id: s.id, stato: "bozza" }), setEsito)}>
              Riporta in bozza
            </button>
          )}
          {s && (
            <button
              type="button"
              className={btn}
              disabled={occupato}
              onClick={async () => {
                if (!window.confirm(`Rimuovere «${s.titolo}» e tutte le sue posizioni? Prima si crea una copia di sicurezza ripristinabile.`)) return;
                const r = await conEsito(elimina.mutateAsync({ codice, id: s.id }), setEsito);
                if (r) onRimossa();
              }}
              data-testid="btn-elimina-scheda"
            >
              <Trash2 className="h-3.5 w-3.5" /> Rimuovi
            </button>
          )}
          {(salva.isPending || stato.isPending) && <Loader2 className="h-4 w-4 animate-spin text-white/50" />}
        </div>
        <Esito
          e={
            /* l'avviso «non ancora collocata» decade appena la scheda ha una posizione */
            esito && s && esito.testo.includes("non è ancora collocata") && d.collocazioni.some((c) => c.schedaId === s.id)
              ? { ok: true, testo: "Pubblicata e collocata: le posizioni sono qui sotto." }
              : esito
          }
          testid="esito-scheda"
        />

        {anteprima && (
          <div className="flex flex-col gap-3 rounded-xl border border-dashed border-white/20 p-3" data-testid="anteprima-scheda">
            <p className="text-[10px] font-extrabold tracking-[0.16em] text-white/50">ANTEPRIMA · COSÌ LA VEDRÀ IL PUBBLICO (non salvata)</p>
            <div className="flex flex-col gap-4 md:flex-row md:items-start">
              <div className="w-full max-w-[300px]">
                <AnteprimaScheda v={anteprima.voce} />
              </div>
              {anteVideo && anteprima.verifica?.esito !== "errore" && (
                <div className="min-w-0 flex-1">
                  <AnteprimaEmbed piattaforma={anteVideo.piattaforma} embedId={anteVideo.embedId} url={anteVideo.url} />
                </div>
              )}
            </div>
            {anteprima.verifica && (
              <p className="text-xs" style={{ color: anteprima.verifica.esito === "errore" ? ERRORE : anteprima.verifica.esito === "ok" ? FLUO : ORO }}>
                Verifica del video: {anteprima.verifica.messaggio}
              </p>
            )}
          </div>
        )}
      </Sezione>

      {s ? (
        <Sezione titolo="Dove compare (posizioni)" testid="posizioni-scheda">
          <p className="text-[11px] text-white/55">
            Una scheda si salva una volta e si colloca dove serve (Home, Channel, carosello, playlist): nessun doppione. Ogni posizione ha ordine, inizio, fine/scadenza, ripetizione e
            stato. Visibile al pubblico solo se la scheda è <b>pubblicata</b> e la posizione è <b>in onda</b>.
          </p>
          <ElencoPosizioni codice={codice} d={d} filtro={(c) => c.schedaId === s.id} mostraContenitore vuoto="Nessuna posizione: la scheda non compare ancora da nessuna parte." />
          <AggiungiPosizione codice={codice} d={d} schedaId={s.id} />
        </Sezione>
      ) : (
        <p className="text-[11px] text-white/50">Dopo «Salva bozza» o «Pubblica» si scelgono le posizioni (Home, Channel, carosello, playlist).</p>
      )}
    </div>
  );
}

function TabContenuti({ codice, d }: { codice: string; d: QuadroCms }) {
  const [scelta, setScelta] = useState<string | "nuova">("nuova");
  const [cerca, setCerca] = useState("");
  const [filtro, setFiltro] = useState("tutti");
  /** Chiave dell'editor: cambia solo quando si sceglie un'altra scheda o «Nuova» (dopo il primo salvataggio l'esito resta a schermo). */
  const [chiave, setChiave] = useState("nuova-0");
  const scheda = scelta === "nuova" ? null : (d.schede.find((s) => s.id === scelta) ?? null);
  const elenco = useMemo(
    () => d.schede.filter((s) => (filtro === "tutti" || s.stato === filtro) && (!cerca.trim() || `${s.titolo} ${s.fonte}`.toLowerCase().includes(cerca.trim().toLowerCase()))),
    [d.schede, filtro, cerca],
  );
  return (
    <div className="grid gap-5 lg:grid-cols-[320px_1fr]" data-testid="tab-contenuti">
      <aside className="flex flex-col gap-2">
        <button
          type="button"
          className={btnPieno}
          style={{ background: FLUO }}
          onClick={() => {
            setScelta("nuova");
            setChiave(`nuova-${Date.now()}`);
          }}
          data-testid="nuova-scheda"
        >
          <Plus className="h-3.5 w-3.5" /> Nuova scheda
        </button>
        <input className={inp} placeholder="Cerca fra le schede…" value={cerca} onChange={(e) => setCerca(e.target.value)} />
        <div className="flex flex-wrap gap-1">
          {["tutti", "bozza", "attivo", "sospeso"].map((f) => (
            <button key={f} type="button" className={btn} style={filtro === f ? { borderColor: FLUO, color: FLUO } : undefined} onClick={() => setFiltro(f)}>
              {f} ({f === "tutti" ? d.schede.length : d.schede.filter((s) => s.stato === f).length})
            </button>
          ))}
        </div>
        <ul className="flex max-h-[70vh] flex-col gap-1 overflow-auto" data-testid="elenco-schede">
          {elenco.length === 0 && <li className="text-xs text-white/45">Nessuna scheda.</li>}
          {elenco.map((s) => {
            const n = d.collocazioni.filter((c) => c.schedaId === s.id).length;
            return (
              <li key={s.id}>
                <button
                  type="button"
                  onClick={() => {
                    setScelta(s.id);
                    setChiave(s.id);
                  }}
                  className="flex w-full items-center gap-2 rounded-lg border px-2 py-1.5 text-left"
                  style={{ borderColor: scelta === s.id ? FLUO : "rgba(255,255,255,.1)" }}
                >
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-xs font-bold">{s.titolo}</span>
                    <span className="block text-[10px] text-white/45">
                      {n} posizion{n === 1 ? "e" : "i"} · {s.video ? (s.video.caricato ? "video caricato" : s.video.piattaforma) : s.immagine ? "immagine" : "link"}
                      {s.verifica?.esito === "errore" ? " · video non incorporabile" : ""}
                    </span>
                  </span>
                  <BadgeStato s={s.stato} />
                </button>
              </li>
            );
          })}
        </ul>
      </aside>
      <EditorScheda
        key={chiave}
        codice={codice}
        d={d}
        scheda={scheda}
        onSalvata={(id) => setScelta(id)}
        onRimossa={() => {
          setScelta("nuova");
          setChiave(`nuova-${Date.now()}`);
        }}
      />
    </div>
  );
}

/* ── pagina ───────────────────────────────────────────────────────────────── */

export default function PannelloContenutiPalinsestoPage() {
  const { codice } = useCodiceAllestimento();
  const q = useQuadroCms(codice);
  const [tab, setTab] = useState<Tab>(() => {
    const h = typeof window !== "undefined" ? window.location.hash.slice(1) : "";
    return (TABS.find((t) => t[0] === h)?.[0] ?? "contenuti") as Tab;
  });
  useEffect(() => {
    document.title = "Gestione contenuti e palinsesto · TBH-WEB";
    /* link diretti a una sezione (#home, #palinsesto…) e tasto indietro del browser */
    const daHash = () => {
      const t = TABS.find((x) => x[0] === window.location.hash.slice(1))?.[0];
      if (t) setTab(t as Tab);
    };
    window.addEventListener("hashchange", daHash);
    return () => window.removeEventListener("hashchange", daHash);
  }, []);
  const vai = (t: Tab) => {
    setTab(t);
    history.replaceState(null, "", `#${t}`);
  };
  const d = q.data;

  if (!codice)
    return (
      <div className="mx-auto flex max-w-[900px] flex-col gap-5 px-4 py-10">
        <h1 className="tbh-display tbh-h2 flex items-center gap-3" style={{ color: FLUO }}>
          <Lock className="h-6 w-6" /> Gestione contenuti e palinsesto
        </h1>
        <p className="text-sm text-[var(--tbh-muted)]">Area riservata al Super Admin: serve il codice di allestimento.</p>
        <SbloccoAllestimento />
      </div>
    );

  return (
    <div className="mx-auto flex max-w-[1400px] flex-col gap-6 px-4 py-8 md:px-8" data-testid="pannello-contenuti-palinsesto">
      <Link href="/allestimento" className="inline-flex w-fit items-center gap-1.5 text-sm text-[var(--tbh-muted)] hover:text-white">
        <ArrowLeft className="h-4 w-4" /> Allestimento
      </Link>
      <header className="flex flex-col gap-2">
        <h1 className="tbh-display tbh-h1 leading-[0.95]" style={{ color: FLUO }}>
          GESTIONE CONTENUTI E PALINSESTO
        </h1>
        <p className="max-w-4xl text-sm text-[var(--tbh-muted)]">
          Inserire, modificare, ordinare, programmare e pubblicare senza codice. <b>Salva bozza</b> = non visibile; <b>Pubblica</b> = visibile dove la scheda è collocata e in onda.
          Questi dati sono <b>condivisi fra anteprima e www.tbh-web.com</b>: il pulsante Publish e i riavvii non li riportano ai dati iniziali. Ogni rimozione crea prima una copia di
          sicurezza ripristinabile.
        </p>
        <p className="flex flex-wrap items-center gap-2 text-[11px] text-white/45">
          <Link2 className="h-3.5 w-3.5" /> Ambiente di questa pagina: <b className="text-white/70">{d?.ambiente ?? "…"}</b>
          {d ? ` · ${d.schede.length} schede · ${d.collocazioni.length} posizioni · ${d.playlist.length} playlist · ${d.homes.length} Home · ${d.canali.length} Channel e pagine` : ""}
        </p>
      </header>

      <nav className="flex flex-wrap gap-2" data-testid="schede-pannello">
        {TABS.map(([id, nome]) => (
          <button
            key={id}
            type="button"
            onClick={() => vai(id)}
            className="rounded-full border px-4 py-1.5 text-[11px] font-extrabold tracking-[0.12em]"
            style={{ borderColor: tab === id ? FLUO : "rgba(255,255,255,.15)", color: tab === id ? FLUO : "#fff" }}
            data-testid={`apri-${id}`}
          >
            {nome}
            {id === "errori" && d?.errori.length ? ` · ${d.errori.length}` : ""}
          </button>
        ))}
      </nav>

      {q.isError && <p className="text-sm" style={{ color: ERRORE }}>{msg(q.error)}</p>}
      {q.isLoading && <Loader2 className="h-5 w-5 animate-spin text-white/50" />}

      {d && (
        <>
          {tab === "contenuti" && <TabContenuti codice={codice} d={d} />}
          {tab === "palinsesto" && <TabPalinsesto codice={codice} d={d} />}
          {tab === "home" && <TabHome codice={codice} d={d} />}
          {tab === "canali" && <TabCanali codice={codice} d={d} />}
          {tab === "caroselli" && <TabCaroselli codice={codice} d={d} />}
          {tab === "copie" && <TabCopie codice={codice} />}
          {tab === "errori" && <TabErrori codice={codice} d={d} />}
        </>
      )}
    </div>
  );
}
