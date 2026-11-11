import { useMemo, useState, type ReactNode } from "react";
import { Link } from "wouter";
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, Check, ExternalLink, Eye, Loader2, Lock, Pause, Play, Plus, Repeat, RotateCcw, Save, Trash2, Upload, X } from "lucide-react";
import { testoDurata } from "../components/canale-tematico-scaletta";
import { PlayerPlaylistCms } from "../components/playlist-cms-player";
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
import {
  caricaFileCms,
  useConfrontoTematici,
  useCopieSicurezza,
  useCreaCopia,
  useAggiungiSpaziCms,
  useEliminaCanaleCms,
  useEliminaHomeCms,
  useEliminaPlaylistCms,
  useModificaRegistroCms,
  useOrdinaHomesCms,
  usePlaylistCms,
  usePromuoviTematici,
  usePubblicaHomeCms,
  useRimuoviSpaziVuotiCms,
  useRipristinaCopia,
  useSalvaCanaleCms,
  useSalvaCaroselloCms,
  useSalvaHomeCms,
  useSalvaPlaylistCms,
  useSpostaCanaleCms,
  useStatoHomeCms,
  useSvuotaErroriCms,
  type QuadroCms,
} from "../queries/contenuti-palinsesto";

/**
 * Sezioni del pannello «Gestione contenuti e palinsesto» (28/10/2026):
 * Palinsesto (playlist), Home (0, 2.0, 3.0 e successive), Channel e pagine, Caroselli,
 * Copie e pubblicazione, Errori. Vedi pannello-contenuti-palinsesto.tsx.
 */

type Props = { codice: string; d: QuadroCms };
type Playlist = QuadroCms["playlist"][number];
type HomeQ = QuadroCms["homes"][number];
type LayoutQ = HomeQ["bozza"];
type CanaleQ = QuadroCms["canali"][number];
type Carosello = QuadroCms["caroselli"][number];

/** Istante → «AAAA-MM-GGThh:mm» nell'ora di Roma (per i campi data/ora). */
const dataOraRoma = (t: number) =>
  new Intl.DateTimeFormat("sv-SE", { timeZone: "Europe/Rome", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hour12: false })
    .format(new Date(t))
    .replace(" ", "T")
    .slice(0, 16);

function Elenco<T>({ voci, scelto, chiave, nome, extra, onScegli }: { voci: T[]; scelto: string | null; chiave: (v: T) => string; nome: (v: T) => string; extra?: (v: T) => ReactNode; onScegli: (k: string) => void }) {
  return (
    <ul className="flex flex-col gap-1">
      {voci.map((v) => (
        <li key={chiave(v)}>
          <button
            type="button"
            onClick={() => onScegli(chiave(v))}
            className="flex w-full items-center gap-2 rounded-lg border px-2 py-1.5 text-left text-xs"
            style={{ borderColor: scelto === chiave(v) ? FLUO : "rgba(255,255,255,.1)" }}
          >
            <span className="min-w-0 flex-1 truncate font-bold">{nome(v)}</span>
            {extra?.(v)}
          </button>
        </li>
      ))}
    </ul>
  );
}

/* ══ PALINSESTO ═══════════════════════════════════════════════════════════ */

function EditorPlaylist({ codice, d, p, onFatto }: Props & { p: Playlist | null; onFatto: (id: string | null) => void }) {
  const [nome, setNome] = useState(p?.nome ?? "");
  const [modalita, setModalita] = useState<Playlist["modalita"]>(p?.modalita ?? "play");
  const [ciclo, setCiclo] = useState(p?.ciclo ?? true);
  const [ancora, setAncora] = useState(p ? dataOraRoma(p.ancora) : "");
  const [stato, setStato] = useState<Playlist["stato"]>(p?.stato ?? "bozza");
  const [esito, setEsito] = useState<EsitoAzione>(null);
  const salva = useSalvaPlaylistCms();
  const elimina = useEliminaPlaylistCms();
  const pub = usePlaylistCms(p?.id ?? "");
  const usataIn = p ? d.homes.filter((h) => h.bozza.palinsesti.includes(p.id) || h.pubblicata?.palinsesti.includes(p.id)) : [];
  const voci = p ? d.collocazioni.filter((c) => c.playlist === p.id) : [];
  const schede = new Map(d.schede.map((s) => [s.id, s]));
  const inOnda = voci.filter((c) => c.programma === "in-onda" && schede.get(c.schedaId)?.stato === "attivo" && schede.get(c.schedaId)?.video);
  const totale = inOnda.reduce((t, c) => t + (schede.get(c.schedaId)?.durataSec ?? 0) * c.passaggi, 0);
  const senzaDurata = inOnda.filter((c) => !schede.get(c.schedaId)?.durataSec).length;

  return (
    <div className="flex flex-col gap-4" data-testid="editor-playlist">
      <Sezione titolo={p ? `Playlist · ${p.nome}` : "Nuova playlist"} destra={p && <BadgeStato s={p.stato} />}>
        <div className="grid gap-3 md:grid-cols-2">
          <label className={etichetta}>
            Nome
            <input className={inp} value={nome} onChange={(e) => setNome(e.target.value)} data-testid="playlist-nome" />
          </label>
          <label className={etichetta}>
            Stato
            <select className={inp} value={stato} onChange={(e) => setStato(e.target.value as Playlist["stato"])} data-testid="playlist-stato">
              <option value="bozza">Bozza (non visibile)</option>
              <option value="attivo">Attiva</option>
              <option value="sospeso">Sospesa</option>
            </select>
          </label>
        </div>
        <div className="grid gap-2 md:grid-cols-2">
          {(
            [
              ["play", "PLAY · parte da capo", "Ogni spettatore preme Play e la playlist parte dal primo video."],
              ["diretta", "DIRETTA SINCRONIZZATA", "Tutti vedono lo stesso video allo stesso punto, calcolato dall'orologio e dall'ora di partenza. Serve la durata di ogni video."],
            ] as const
          ).map(([v, t, s]) => (
            <button
              key={v}
              type="button"
              onClick={() => setModalita(v)}
              className="flex flex-col gap-1 rounded-xl border p-3 text-left"
              style={{ borderColor: modalita === v ? FLUO : "rgba(255,255,255,.15)" }}
              data-testid={`modalita-${v}`}
            >
              <span className="text-[11px] font-extrabold tracking-[0.14em]" style={{ color: modalita === v ? FLUO : "#fff" }}>
                {t}
              </span>
              <span className="text-[11px] text-white/55">{s}</span>
            </button>
          ))}
        </div>
        <div className="flex flex-wrap items-end gap-4">
          <label className="flex items-center gap-2 text-xs">
            <input type="checkbox" checked={ciclo} onChange={(e) => setCiclo(e.target.checked)} data-testid="playlist-ciclo" />
            <Repeat className="h-3.5 w-3.5" /> Ciclo continuo (a fine sequenza riparte dal primo)
          </label>
          {modalita === "diretta" && (
            <label className={etichetta}>
              Ora di partenza della diretta (ora di Roma)
              <input className={inp} type="datetime-local" value={ancora} onChange={(e) => setAncora(e.target.value.slice(0, 16))} data-testid="playlist-ancora" />
            </label>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2 border-t border-white/10 pt-3">
          <button
            type="button"
            className={btnPieno}
            style={{ background: FLUO }}
            disabled={nome.trim().length < 2 || salva.isPending}
            onClick={async () => {
              const r = await conEsito(salva.mutateAsync({ codice, id: p?.id, nome, modalita, ciclo, ancora: ancora || null, stato }), setEsito);
              if (r && !p) onFatto(r.playlist.id);
            }}
            data-testid="playlist-salva"
          >
            {salva.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />} Salva playlist
          </button>
          {p && (
            <button
              type="button"
              className={btn}
              disabled={elimina.isPending}
              onClick={async () => {
                if (!window.confirm(`Rimuovere la playlist «${p.nome}»? (Solo se è vuota e non è usata in una Home.)`)) return;
                const r = await conEsito(elimina.mutateAsync({ codice, id: p.id }), setEsito);
                if (r) onFatto(null);
              }}
            >
              <Trash2 className="h-3.5 w-3.5" /> Rimuovi
            </button>
          )}
        </div>
        <Esito e={esito} testid="esito-playlist" />
        {p && (
          <p className="text-[11px] text-white/55">
            In uso in: {usataIn.length ? usataIn.map((h) => h.nome).join(", ") : "nessuna Home (aggiungerla dalla sezione HOME → Palinsesti)"}.
          </p>
        )}
      </Sezione>

      {p && (
        <Sezione
          titolo="Sequenza (ordine ↑/↓, date, orari, ripetizioni, scadenza)"
          testid="sequenza-playlist"
          destra={
            <span className="text-[11px] text-white/60" data-testid="totale-playlist">
              {inOnda.length} in onda · {testoDurata(totale)}
              {senzaDurata ? ` · ${senzaDurata} senza durata${p.modalita === "diretta" ? " (fuori dalla diretta)" : ""}` : ""}
            </span>
          }
        >
          <ElencoPosizioni codice={codice} d={d} filtro={(c) => c.playlist === p.id} vuoto="Playlist vuota: aggiungere i contenuti (schede già salvate)." />
          <AggiungiPosizione codice={codice} d={d} fisso={{ tipo: "playlist", id: p.id }} testo="Aggiungi un contenuto alla playlist" />
        </Sezione>
      )}

      {p && (
        <Sezione titolo="Anteprima del player (dati pubblici)" testid="anteprima-playlist">
          {p.stato !== "attivo" ? (
            <p className="text-xs text-white/50">La playlist non è attiva: il pubblico non la vede. Impostarla su «Attiva» e salvare per provarla qui.</p>
          ) : pub.data?.playlist ? (
            pub.data.playlist.sequenza.length ? (
              <div className="max-w-[760px]">
                <PlayerPlaylistCms playlist={pub.data.playlist} dove="/allestimento/contenuti-palinsesto" />
              </div>
            ) : (
              <p className="text-xs text-white/50">Nessun video in onda adesso (schede in bozza, posizioni fuori orario o video non incorporabili).</p>
            )
          ) : (
            <Loader2 className="h-4 w-4 animate-spin text-white/50" />
          )}
        </Sezione>
      )}
    </div>
  );
}

export function TabPalinsesto({ codice, d }: Props) {
  const [scelto, setScelto] = useState<string | null>(d.playlist[0]?.id ?? null);
  const [nuova, setNuova] = useState(!d.playlist.length);
  const p = nuova ? null : (d.playlist.find((x) => x.id === scelto) ?? null);
  return (
    <div className="grid gap-5 lg:grid-cols-[280px_1fr]" data-testid="tab-palinsesto">
      <aside className="flex flex-col gap-2">
        <button type="button" className={btnPieno} style={{ background: FLUO }} onClick={() => setNuova(true)} data-testid="nuova-playlist">
          <Plus className="h-3.5 w-3.5" /> Nuova playlist
        </button>
        <Elenco
          voci={d.playlist}
          scelto={nuova ? null : scelto}
          chiave={(x) => x.id}
          nome={(x) => x.nome}
          extra={(x) => (
            <span className="flex items-center gap-1 text-[10px] text-white/45">
              {x.modalita === "diretta" ? "DIRETTA" : "PLAY"}
              <BadgeStato s={x.stato} />
            </span>
          )}
          onScegli={(k) => {
            setScelto(k);
            setNuova(false);
          }}
        />
      </aside>
      <EditorPlaylist
        key={p ? p.id : "nuova"}
        codice={codice}
        d={d}
        p={p}
        onFatto={(id) => {
          setNuova(false);
          setScelto(id ?? d.playlist.find((x) => x.id !== scelto)?.id ?? null);
          if (!id && d.playlist.length <= 1) setNuova(true);
        }}
      />
    </div>
  );
}

/* ══ HOME ═════════════════════════════════════════════════════════════════ */

const FISSE = ["0", "2-0", "3-0"];

function SceltaChannel({ d, esclusi, onScegli }: { d: QuadroCms; esclusi: string[]; onScegli: (slug: string) => void }) {
  return (
    <select className={`${inp} max-w-xs`} value="" onChange={(e) => e.target.value && onScegli(e.target.value)} data-testid="aggiungi-channel">
      <option value="">+ aggiungi Channel o pagina…</option>
      {d.sezioni.map((s) => (
        <optgroup key={s.id} label={s.titolo}>
          {d.canali
            .filter((c) => c.sezione === s.id && !esclusi.includes(c.slug))
            .map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.nome}
                {c.attivo ? "" : " (spento)"}
              </option>
            ))}
        </optgroup>
      ))}
    </select>
  );
}

function EditorHome({ codice, d, h }: Props & { h: HomeQ }) {
  const zero = h.slug === "0";
  const [nome, setNome] = useState(h.nome);
  const [l, setL] = useState<LayoutQ>(structuredClone(h.bozza));
  const [esito, setEsito] = useState<EsitoAzione>(null);
  const salva = useSalvaHomeCms();
  const pubblica = usePubblicaHomeCms();
  const statoM = useStatoHomeCms();
  const elimina = useEliminaHomeCms();
  const occupato = salva.isPending || pubblica.isPending || statoM.isPending || elimina.isPending;
  const nomi = new Map(d.canali.map((c) => [c.slug, c]));
  const modificata = JSON.stringify(l) !== JSON.stringify(h.bozza) || nome !== h.nome;
  const diversaDaPubblica = !!h.pubblicata && JSON.stringify(h.bozza) !== JSON.stringify(h.pubblicata);
  const setB = (i: number, b: Partial<LayoutQ["blocchi"][number]>) => setL({ ...l, blocchi: l.blocchi.map((x, j) => (j === i ? { ...x, ...b } : x)) });
  const scambia = <T,>(a: T[], i: number, v: -1 | 1) => {
    const j = i + v;
    if (j < 0 || j >= a.length) return a;
    const c = [...a];
    [c[i], c[j]] = [c[j]!, c[i]!];
    return c;
  };
  const salvaBozza = () => salva.mutateAsync({ codice, slug: h.slug, nome, bozza: zero ? { blocchi: [], palinsesti: l.palinsesti } : l });

  return (
    <div className="flex flex-col gap-4" data-testid={`editor-home-${h.slug}`}>
      <Sezione
        titolo={h.nome}
        destra={
          <span className="flex flex-wrap items-center gap-2 text-[11px] text-white/50">
            <BadgeStato s={h.stato} />
            {h.pubblicataIl ? `pubblicata ${quando(h.pubblicataIl)}` : "mai pubblicata"}
            {diversaDaPubblica && <span style={{ color: ORO }}>· bozza diversa dalla versione pubblica</span>}
          </span>
        }
      >
        <div className="flex flex-wrap items-end gap-3">
          <label className={`${etichetta} min-w-[240px]`}>
            Nome della Home
            <input className={inp} value={nome} disabled={zero} onChange={(e) => setNome(e.target.value)} data-testid="home-nome" />
          </label>
          <span className="text-[11px] text-white/55">
            URL: <b className="text-white/80">{h.percorso}</b>
          </span>
          {(h.stato === "attivo" || zero) && (
            <a href={h.percorso} target="_blank" rel="noopener noreferrer" className={btn}>
              <ExternalLink className="h-3.5 w-3.5" /> Apri la versione pubblica
            </a>
          )}
          {!zero && (
            <a href={`${h.percorso}?anteprima=1`} target="_blank" rel="noopener noreferrer" className={btn} data-testid="home-anteprima">
              <Eye className="h-3.5 w-3.5" /> Anteprima della bozza (salvata)
            </a>
          )}
        </div>

        {zero ? (
          <p className="rounded-xl border border-white/10 p-3 text-xs text-white/65">
            <Lock className="mr-1 inline h-3.5 w-3.5" /> Home 0 resta quella di sempre: i 28 Channel ufficiali + Touch Talent nei blocchi A–E e i caroselli della home non si
            modificano da qui ({h.bozza.blocchi.reduce((t, b) => t + b.channel.length, 0)} Channel). I contenuti dei caroselli si gestiscono in CONTENUTI / CAROSELLI; qui si possono
            aggiungere i <b>palinsesti</b> (playlist) da mostrare in Home 0.
          </p>
        ) : (
          <div className="flex flex-col gap-3" data-testid="blocchi-home">
            {l.blocchi.length === 0 && <p className="text-xs text-white/50">Nessun blocco: aggiungere un blocco con i suoi Channel e/o un carosello.</p>}
            {l.blocchi.map((b, i) => (
              <div key={b.id} className="flex flex-col gap-2 rounded-xl border border-white/10 p-3" data-testid="blocco-home">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-black text-white/50">{i + 1}</span>
                  <input className={`${inp} max-w-sm`} value={b.titolo} placeholder="Titolo del blocco" onChange={(e) => setB(i, { titolo: e.target.value })} />
                  <button type="button" className={btn} aria-label="Blocco su" onClick={() => setL({ ...l, blocchi: scambia(l.blocchi, i, -1) })}>
                    <ArrowUp className="h-3.5 w-3.5" />
                  </button>
                  <button type="button" className={btn} aria-label="Blocco giù" onClick={() => setL({ ...l, blocchi: scambia(l.blocchi, i, 1) })}>
                    <ArrowDown className="h-3.5 w-3.5" />
                  </button>
                  <button type="button" className={btn} onClick={() => setL({ ...l, blocchi: l.blocchi.filter((_, j) => j !== i) })}>
                    <Trash2 className="h-3.5 w-3.5" /> Togli blocco
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {b.channel.map((s, k) => (
                    <span key={s} className="inline-flex items-center gap-1 rounded-full border border-white/15 px-2 py-1 text-[11px]">
                      <button type="button" aria-label="Prima" onClick={() => setB(i, { channel: scambia(b.channel, k, -1) })}>
                        <ArrowLeft className="h-3 w-3" />
                      </button>
                      {nomi.get(s)?.nome ?? s}
                      <button type="button" aria-label="Dopo" onClick={() => setB(i, { channel: scambia(b.channel, k, 1) })}>
                        <ArrowRight className="h-3 w-3" />
                      </button>
                      <button type="button" aria-label="Togli" onClick={() => setB(i, { channel: b.channel.filter((x) => x !== s) })}>
                        <X className="h-3 w-3" style={{ color: ERRORE }} />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <SceltaChannel d={d} esclusi={b.channel} onScegli={(s) => setB(i, { channel: [...b.channel, s] })} />
                  <select className={`${inp} max-w-xs`} value={b.carosello ?? ""} onChange={(e) => setB(i, { carosello: e.target.value || null })} data-testid="blocco-carosello">
                    <option value="">Nessun carosello sotto il blocco</option>
                    {d.caroselli.map((k) => (
                      <option key={k.id} value={k.id}>
                        Carosello: {k.nome}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            ))}
            <button
              type="button"
              className={`${btn} w-fit`}
              onClick={() => setL({ ...l, blocchi: [...l.blocchi, { id: `b${Date.now().toString(36)}`, titolo: `Blocco ${l.blocchi.length + 1}`, channel: [], carosello: null }] })}
              data-testid="aggiungi-blocco"
            >
              <Plus className="h-3.5 w-3.5" /> Aggiungi blocco
            </button>
          </div>
        )}

        <div className="flex flex-col gap-2">
          <p className="text-[11px] font-extrabold tracking-[0.12em] text-white/70">PALINSESTI (playlist mostrate in questa Home)</p>
          <div className="flex flex-wrap gap-1.5">
            {l.palinsesti.map((id) => (
              <span key={id} className="inline-flex items-center gap-1 rounded-full border border-white/15 px-2 py-1 text-[11px]">
                {d.playlist.find((p) => p.id === id)?.nome ?? id}
                <button type="button" aria-label="Togli" onClick={() => setL({ ...l, palinsesti: l.palinsesti.filter((x) => x !== id) })}>
                  <X className="h-3 w-3" style={{ color: ERRORE }} />
                </button>
              </span>
            ))}
            <select className={`${inp} max-w-xs`} value="" onChange={(e) => e.target.value && setL({ ...l, palinsesti: [...l.palinsesti, e.target.value] })} data-testid="aggiungi-palinsesto">
              <option value="">+ aggiungi playlist…</option>
              {d.playlist
                .filter((p) => !l.palinsesti.includes(p.id))
                .map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nome} ({p.stato})
                  </option>
                ))}
            </select>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 border-t border-white/10 pt-3">
          <button type="button" className={btnPieno} style={{ background: ORO }} disabled={occupato} onClick={() => void conEsito(salvaBozza(), setEsito)} data-testid="home-salva">
            <Save className="h-3.5 w-3.5" /> Salva bozza
          </button>
          <button
            type="button"
            className={btnPieno}
            style={{ background: FLUO }}
            disabled={occupato}
            onClick={async () => {
              const s = await conEsito(salvaBozza(), setEsito);
              if (s) await conEsito(pubblica.mutateAsync({ codice, slug: h.slug }), setEsito);
            }}
            data-testid="home-pubblica"
          >
            <Check className="h-3.5 w-3.5" /> Pubblica
          </button>
          {!zero && h.stato === "attivo" && (
            <button type="button" className={btn} disabled={occupato} onClick={() => void conEsito(statoM.mutateAsync({ codice, slug: h.slug, stato: "sospeso" }), setEsito)}>
              <Pause className="h-3.5 w-3.5" /> Sospendi
            </button>
          )}
          {!zero && h.stato === "sospeso" && h.pubblicata && (
            <button type="button" className={btn} disabled={occupato} onClick={() => void conEsito(statoM.mutateAsync({ codice, slug: h.slug, stato: "attivo" }), setEsito)}>
              <Play className="h-3.5 w-3.5" /> Riattiva
            </button>
          )}
          {!FISSE.includes(h.slug) && (
            <button
              type="button"
              className={btn}
              disabled={occupato}
              onClick={() => window.confirm(`Rimuovere «${h.nome}»? Prima si crea una copia di sicurezza ripristinabile.`) && void conEsito(elimina.mutateAsync({ codice, slug: h.slug }), setEsito)}
            >
              <Trash2 className="h-3.5 w-3.5" /> Rimuovi
            </button>
          )}
          {modificata && <span className="text-[11px]" style={{ color: ORO }}>Modifiche non salvate</span>}
          {occupato && <Loader2 className="h-4 w-4 animate-spin text-white/50" />}
        </div>
        <Esito e={esito} testid="esito-home" />
      </Sezione>
    </div>
  );
}

export function TabHome({ codice, d }: Props) {
  const [scelta, setScelta] = useState(d.homes[0]?.slug ?? "0");
  const [nuovoNome, setNuovoNome] = useState("");
  const [daZero, setDaZero] = useState(false);
  const [esito, setEsito] = useState<EsitoAzione>(null);
  const salva = useSalvaHomeCms();
  const ordina = useOrdinaHomesCms();
  const h = d.homes.find((x) => x.slug === scelta) ?? d.homes[0];
  const altre = d.homes.filter((x) => x.slug !== "0");
  const sposta = (slug: string, v: -1 | 1) => {
    const s = altre.map((x) => x.slug);
    const i = s.indexOf(slug);
    const j = i + v;
    if (i < 0 || j < 0 || j >= s.length) return;
    [s[i], s[j]] = [s[j]!, s[i]!];
    void conEsito(ordina.mutateAsync({ codice, slugs: s }), setEsito);
  };
  const home0 = d.homes.find((x) => x.slug === "0");
  return (
    <div className="grid gap-5 lg:grid-cols-[300px_1fr]" data-testid="tab-home">
      <aside className="flex flex-col gap-3">
        <ul className="flex flex-col gap-1">
          {d.homes.map((x) => (
            <li key={x.slug} className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setScelta(x.slug)}
                className="flex min-w-0 flex-1 items-center gap-2 rounded-lg border px-2 py-1.5 text-left text-xs"
                style={{ borderColor: h?.slug === x.slug ? FLUO : "rgba(255,255,255,.1)" }}
              >
                <span className="min-w-0 flex-1 truncate font-bold">{x.nome}</span>
                <BadgeStato s={x.stato} />
              </button>
              {x.slug !== "0" && (
                <>
                  <button type="button" className={btn} aria-label="Su" disabled={ordina.isPending} onClick={() => sposta(x.slug, -1)}>
                    <ArrowUp className="h-3 w-3" />
                  </button>
                  <button type="button" className={btn} aria-label="Giù" disabled={ordina.isPending} onClick={() => sposta(x.slug, 1)}>
                    <ArrowDown className="h-3 w-3" />
                  </button>
                </>
              )}
            </li>
          ))}
        </ul>
        <div className="flex flex-col gap-2 rounded-xl border border-white/10 p-3">
          <p className="text-[11px] font-extrabold tracking-[0.12em]">NUOVA HOME (senza limite)</p>
          <input className={inp} placeholder="es. Home 4.0" value={nuovoNome} onChange={(e) => setNuovoNome(e.target.value)} data-testid="nuova-home-nome" />
          <label className="flex items-center gap-2 text-[11px] text-white/65">
            <input type="checkbox" checked={daZero} onChange={(e) => setDaZero(e.target.checked)} /> Parti dai blocchi di Home 0
          </label>
          <button
            type="button"
            className={btnPieno}
            style={{ background: FLUO }}
            disabled={nuovoNome.trim().length < 2 || salva.isPending}
            onClick={async () => {
              const r = await conEsito(salva.mutateAsync({ codice, nome: nuovoNome.trim(), bozza: daZero && home0 ? structuredClone(home0.bozza) : { blocchi: [], palinsesti: [] } }), setEsito);
              if (r) {
                setScelta(r.slug);
                setNuovoNome("");
              }
            }}
            data-testid="crea-home"
          >
            <Plus className="h-3.5 w-3.5" /> Crea Home (in bozza)
          </button>
        </div>
        <Esito e={esito} />
      </aside>
      {h && <EditorHome key={h.slug} codice={codice} d={d} h={h} />}
    </div>
  );
}

/* ══ CHANNEL E PAGINE ═════════════════════════════════════════════════════ */

const SEZIONI_AMMESSE = ["home-tbh", "dm", "nova", "best", "altri"] as const;
type SezioneId = (typeof SEZIONI_AMMESSE)[number];
const slugDa = (t: string) =>
  t
    .toLowerCase()
    .normalize("NFD")
    .replace(/[^\x20-\x7e]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);

function FormCanale({ codice, d, c, onFatto }: Props & { c: CanaleQ | null; onFatto: () => void }) {
  const [nome, setNome] = useState(c?.nome ?? "");
  const [slug, setSlug] = useState(c?.slug ?? "");
  const [slugToccato, setSlugToccato] = useState(!!c);
  const [tipo, setTipo] = useState<"channel" | "pagina">(c?.tipo ?? "channel");
  const [sezione, setSezione] = useState<SezioneId>((SEZIONI_AMMESSE as readonly string[]).includes(c?.sezione ?? "") ? (c!.sezione as SezioneId) : "altri");
  const [url, setUrl] = useState(c?.pagina ?? "");
  const [logo, setLogo] = useState(c?.logo ?? "");
  const [descrizione, setDescrizione] = useState(c?.descrizione ?? "");
  const [stato, setStato] = useState<"bozza" | "attivo" | "sospeso">(c?.stato ?? "bozza");
  const [esito, setEsito] = useState<EsitoAzione>(null);
  const [perc, setPerc] = useState<number | null>(null);
  const salva = useSalvaCanaleCms();
  const L = d.limiti.immagine;
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-white/15 bg-black p-3" data-testid="form-canale">
      <div className="grid gap-2 md:grid-cols-3">
        <label className={etichetta}>
          Nome
          <input
            className={inp}
            value={nome}
            onChange={(e) => {
              setNome(e.target.value);
              if (!slugToccato) setSlug(slugDa(e.target.value));
            }}
            data-testid="canale-nome"
          />
        </label>
        <label className={etichetta}>
          Slug (URL /pagina/…){c ? " — non modificabile" : ""}
          <input
            className={inp}
            value={slug}
            disabled={!!c}
            onChange={(e) => {
              setSlug(slugDa(e.target.value));
              setSlugToccato(true);
            }}
            data-testid="canale-slug"
          />
        </label>
        <label className={etichetta}>
          Tipo
          <select className={inp} value={tipo} onChange={(e) => setTipo(e.target.value as "channel" | "pagina")}>
            <option value="channel">Channel</option>
            <option value="pagina">Pagina / attività</option>
          </select>
        </label>
        <label className={etichetta}>
          Sezione (guida e zapping)
          <select className={inp} value={sezione} onChange={(e) => setSezione(e.target.value as SezioneId)}>
            {d.sezioni
              .filter((s) => (SEZIONI_AMMESSE as readonly string[]).includes(s.id))
              .map((s) => (
                <option key={s.id} value={s.id}>
                  {s.titolo}
                </option>
              ))}
          </select>
        </label>
        <label className={etichetta}>
          URL del sito/Channel (facoltativo: https://… o /…)
          <input className={inp} value={url} onChange={(e) => setUrl(e.target.value)} data-testid="canale-url" />
        </label>
        <label className={etichetta}>
          Stato
          <select className={inp} value={stato} onChange={(e) => setStato(e.target.value as typeof stato)} data-testid="canale-stato">
            <option value="bozza">Bozza (non visibile)</option>
            <option value="attivo">Attivo</option>
            <option value="sospeso">Sospeso</option>
          </select>
        </label>
      </div>
      <div className="flex flex-wrap items-end gap-2">
        <label className={`${etichetta} min-w-[260px] flex-1`}>
          Logo (URL https:// o caricamento)
          <input className={inp} value={logo} onChange={(e) => setLogo(e.target.value)} />
        </label>
        <label className={btn}>
          {perc !== null ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />} Carica logo
          <input
            type="file"
            className="hidden"
            accept={L.formati.map((f) => `.${f}`).join(",")}
            onChange={async (e) => {
              const f = e.target.files?.[0];
              e.target.value = "";
              if (!f) return;
              if (f.size > L.maxMb * 1048576) return setEsito({ ok: false, testo: `File di ${(f.size / 1048576).toFixed(1)} MB: il limite è ${L.maxMb} MB.` });
              setPerc(0);
              try {
                const r = await caricaFileCms(codice, "immagine", f, setPerc);
                setLogo(r.url);
                setEsito({ ok: true, testo: `Logo caricato e verificato: ${f.name}.` });
              } catch (err) {
                setEsito({ ok: false, testo: msg(err) });
              } finally {
                setPerc(null);
              }
            }}
          />
        </label>
        <span className="text-[10px] text-white/45">
          {L.formati.join(", ").toUpperCase()} · max {L.maxMb} MB
        </span>
        {logo && <img src={logo} alt="" className="h-12 w-auto max-w-[140px] rounded bg-black object-contain" />}
      </div>
      <label className={etichetta}>
        Descrizione (scheda e ricerca)
        <textarea className={`${inp} min-h-[60px]`} value={descrizione} onChange={(e) => setDescrizione(e.target.value)} />
      </label>
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          className={btnPieno}
          style={{ background: FLUO }}
          disabled={salva.isPending || nome.trim().length < 2 || !slug}
          onClick={async () => {
            const r = await conEsito(
              salva.mutateAsync({ codice, slug, nuovo: !c, nome, tipo, sezione, url: url.trim() || null, logo: logo.trim() || null, descrizione, stato }),
              setEsito,
            );
            if (r) onFatto();
          }}
          data-testid="canale-salva"
        >
          <Save className="h-3.5 w-3.5" /> {c ? "Salva" : "Crea"}
        </button>
        <span className="text-[11px] text-white/50">Una sola scheda e un solo URL: /pagina/{slug || "…"}</span>
      </div>
      <Esito e={esito} testid="esito-canale" />
    </div>
  );
}

function RigaCanale({ codice, d, c }: Props & { c: CanaleQ }) {
  const [modifica, setModifica] = useState(false);
  const [esito, setEsito] = useState<EsitoAzione>(null);
  const sposta = useSpostaCanaleCms();
  const registro = useModificaRegistroCms();
  const elimina = useEliminaCanaleCms();
  const occupato = sposta.isPending || registro.isPending || elimina.isPending;
  return (
    <li className="flex flex-col gap-2 rounded-xl border border-white/10 p-2" data-testid={`riga-canale-${c.slug}`}>
      <div className="flex flex-wrap items-center gap-2">
        {c.logo ? <img src={c.logo} alt="" className="h-8 w-14 rounded bg-black object-contain" loading="lazy" /> : <span className="h-8 w-14 rounded bg-white/5" />}
        <div className="min-w-[150px] flex-1">
          <p className="truncate text-xs font-bold" style={{ color: c.attivo ? "#fff" : "rgba(255,255,255,.45)" }}>
            {c.nome}
            {c.fisso && <Lock className="ml-1 inline h-3 w-3 text-white/40" />}
          </p>
          <p className="truncate text-[10px] text-white/45">
            {c.tipo === "pagina" ? "pagina" : "channel"} · {c.slug} · scheda{" "}
            <Link href={c.scheda} className="underline">
              {c.scheda}
            </Link>
            {c.pagina && c.pagina !== c.scheda ? ` · ${c.pagina}` : ""}
            {c.aggiunto ? (c.spazio ? " · SPAZIO VUOTO: compilare con «Modifica»" : " · aggiunto dal pannello") : ""}
          </p>
        </div>
        {c.aggiunto ? <BadgeStato s={c.stato ?? "bozza"} /> : <BadgeStato s={c.attivo ? "attivo" : "sospeso"} />}
        {!c.fisso && (
          <>
            <button type="button" className={btn} aria-label="Su" disabled={occupato} onClick={() => void conEsito(sposta.mutateAsync({ codice, slug: c.slug, verso: -1 }), setEsito)}>
              <ArrowUp className="h-3 w-3" />
            </button>
            <button type="button" className={btn} aria-label="Giù" disabled={occupato} onClick={() => void conEsito(sposta.mutateAsync({ codice, slug: c.slug, verso: 1 }), setEsito)}>
              <ArrowDown className="h-3 w-3" />
            </button>
          </>
        )}
        {c.aggiunto ? (
          <>
            <button type="button" className={btn} onClick={() => setModifica(!modifica)}>
              Modifica
            </button>
            <button
              type="button"
              className={btn}
              disabled={occupato}
              onClick={() => window.confirm(`Rimuovere «${c.nome}»? Prima si crea una copia di sicurezza ripristinabile.`) && void conEsito(elimina.mutateAsync({ codice, slug: c.slug }), setEsito)}
            >
              <Trash2 className="h-3 w-3" />
            </button>
          </>
        ) : (
          !c.fisso && (
            <>
              <button type="button" className={btn} disabled={occupato} onClick={() => void conEsito(registro.mutateAsync({ codice, slug: c.slug, attivo: !c.attivo }), setEsito)}>
                {c.attivo ? "Spegni" : "Accendi"}
              </button>
              <button
                type="button"
                className={btn}
                disabled={occupato}
                onClick={() => {
                  const n = window.prompt("Nome mostrato (vuoto = nome originale):", c.nome);
                  if (n !== null) void conEsito(registro.mutateAsync({ codice, slug: c.slug, nome: n.trim() }), setEsito);
                }}
              >
                Rinomina
              </button>
            </>
          )
        )}
      </div>
      {modifica && <FormCanale codice={codice} d={d} c={c} onFatto={() => setModifica(false)} />}
      <Esito e={esito} />
    </li>
  );
}

export function TabCanali({ codice, d }: Props) {
  const [nuovo, setNuovo] = useState(false);
  const [cerca, setCerca] = useState("");
  const filtrati = useMemo(() => d.canali.filter((c) => !cerca.trim() || `${c.nome} ${c.slug}`.toLowerCase().includes(cerca.trim().toLowerCase())), [d.canali, cerca]);
  return (
    <div className="flex flex-col gap-4" data-testid="tab-canali">
      <p className="max-w-4xl text-xs text-white/60">
        Nessun limite di numero: si aggiungono Channel e pagine senza fine. Ogni attività ha <b>una scheda e un URL</b>; le nuove compaiono in guida, ricerca e zapping appena
        sono <b>attive</b>. I 28 Channel ufficiali di Home 0 + Touch Talent (<Lock className="inline h-3 w-3" />) restano invariati; gli altri del registro si possono spegnere,
        rinominare e riordinare (gli URL non cambiano).
      </p>
      <div className="flex flex-wrap items-center gap-2">
        <button type="button" className={btnPieno} style={{ background: FLUO }} onClick={() => setNuovo(!nuovo)} data-testid="nuovo-canale">
          <Plus className="h-3.5 w-3.5" /> Nuovo Channel o pagina
        </button>
        <input className={`${inp} max-w-xs`} placeholder="Cerca…" value={cerca} onChange={(e) => setCerca(e.target.value)} />
        <span className="text-[11px] text-white/50">{d.canali.length} in totale</span>
      </div>
      {nuovo && <FormCanale codice={codice} d={d} c={null} onFatto={() => setNuovo(false)} />}
      <SpaziInBlocco codice={codice} d={d} />
      {d.sezioni.map((s) => {
        const voci = filtrati.filter((c) => c.sezione === s.id);
        if (!voci.length) return null;
        return (
          <Sezione key={s.id} titolo={`${s.titolo} · ${voci.length}`}>
            <ul className="flex flex-col gap-1.5">
              {voci.map((c) => (
                <RigaCanale key={c.slug} codice={codice} d={d} c={c} />
              ))}
            </ul>
          </Sezione>
        );
      })}
    </div>
  );
}

/**
 * 04/11/2026 (round 18) — POSIZIONI IN BLOCCO: N spazi vuoti in una sezione con un clic (fino a 200 per volta,
 * ripetibile: nessun limite totale). Compaiono subito in home (/), /channel a pagine da 15; si compilano con
 * «Modifica» (nome, URL, logo). «Togli gli spazi vuoti» rimuove solo quelli ancora vuoti, dopo una copia.
 */
function SpaziInBlocco({ codice, d }: Props) {
  const [sezione, setSezione] = useState(d.sezioni[0]?.id ?? "home-tbh");
  const [quanti, setQuanti] = useState(15);
  const [esito, setEsito] = useState<EsitoAzione>(null);
  const aggiungi = useAggiungiSpaziCms();
  const togli = useRimuoviSpaziVuotiCms();
  const nSez = d.canali.filter((c) => c.sezione === sezione).length;
  const titolo = d.sezioni.find((x) => x.id === sezione)?.titolo ?? sezione;
  return (
    <Sezione titolo="Posizioni in blocco · nessun limite" testid="spazi-in-blocco">
      <p className="text-[11px] text-white/60">
        Aggiunge in un colpo solo fino a 200 posizioni vuote in una sezione (si può ripetere: 100, 300, 1000…). Ogni pagina della home e di /channel mostra 15 Channel in
        blocchi da 6; le pagine in più si creano da sole. Gli spazi si compilano con «Modifica»; quelli ancora vuoti non vanno in guida, zapping e ricerca.
      </p>
      <div className="flex flex-wrap items-end gap-2">
        <label className="flex flex-col gap-1 text-[11px] text-white/60">
          Sezione
          <select className={`${inp} min-w-[220px]`} value={sezione} onChange={(e) => setSezione(e.target.value as typeof sezione)} data-testid="spazi-sezione">
            {d.sezioni.map((x) => (
              <option key={x.id} value={x.id}>
                {x.titolo}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-[11px] text-white/60">
          Quanti spazi
          <input
            className={`${inp} w-28`}
            type="number"
            min={1}
            max={200}
            value={quanti}
            onChange={(e) => setQuanti(Math.max(1, Math.min(200, Math.round(Number(e.target.value) || 1))))}
            data-testid="spazi-quanti"
          />
        </label>
        <button
          type="button"
          className={btnPieno}
          style={{ background: FLUO }}
          disabled={aggiungi.isPending}
          onClick={() => void conEsito(aggiungi.mutateAsync({ codice, sezione, quanti }), setEsito)}
          data-testid="spazi-aggiungi"
        >
          {aggiungi.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />} Aggiungi {quanti} spazi
        </button>
        <button
          type="button"
          className={btn}
          disabled={togli.isPending}
          onClick={() => window.confirm(`Togliere gli spazi ANCORA VUOTI di ${titolo}? Quelli compilati restano. Prima si crea una copia di sicurezza.`) && void conEsito(togli.mutateAsync({ codice, sezione }), setEsito)}
          data-testid="spazi-togli"
        >
          <Trash2 className="h-3.5 w-3.5" /> Togli gli spazi vuoti
        </button>
        <span className="text-[11px] text-white/50">
          {titolo}: {nSez} posizioni · {Math.max(1, Math.ceil(nSez / 15))} pagin{Math.ceil(nSez / 15) === 1 ? "a" : "e"}
        </span>
      </div>
      <Esito e={esito} testid="esito-spazi" />
    </Sezione>
  );
}

/* ══ CAROSELLI ════════════════════════════════════════════════════════════ */

function EditorCarosello({ codice, d, k, onFatto }: Props & { k: Carosello | null; onFatto: (id: string) => void }) {
  const [nome, setNome] = useState(k?.nome ?? "");
  const [accento, setAccento] = useState<Carosello["accento"]>(k?.accento ?? "giallo");
  const [stato, setStato] = useState<Carosello["stato"]>(k?.stato ?? "attivo");
  const [esito, setEsito] = useState<EsitoAzione>(null);
  const salva = useSalvaCaroselloCms();
  const homes = k ? d.homes.filter((h) => (h.pubblicata ?? h.bozza).blocchi.some((b) => b.carosello === k.id)) : [];
  return (
    <div className="flex flex-col gap-4" data-testid="editor-carosello">
      <Sezione titolo={k ? k.nome : "Nuovo carosello"} destra={k && <BadgeStato s={k.stato} />}>
        {k?.nota && <p className="text-[11px] text-white/50">{k.nota}</p>}
        <div className="grid gap-2 md:grid-cols-3">
          <label className={etichetta}>
            Nome
            <input className={inp} value={nome} onChange={(e) => setNome(e.target.value)} data-testid="carosello-nome" />
          </label>
          <label className={etichetta}>
            Colore
            <select className={inp} value={accento} onChange={(e) => setAccento(e.target.value as Carosello["accento"])}>
              <option value="giallo">Giallo fluo / oro</option>
              <option value="rosso-dm">Rosso (solo DM)</option>
            </select>
          </label>
          <label className={etichetta}>
            Stato
            <select className={inp} value={stato} onChange={(e) => setStato(e.target.value as Carosello["stato"])}>
              <option value="bozza">Bozza</option>
              <option value="attivo">Attivo</option>
              <option value="sospeso">Sospeso</option>
            </select>
          </label>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            className={btnPieno}
            style={{ background: FLUO }}
            disabled={salva.isPending || nome.trim().length < 2}
            onClick={async () => {
              const r = await conEsito(salva.mutateAsync({ codice, id: k?.id, nome, accento, stato }), setEsito);
              if (r) onFatto(r.id);
            }}
            data-testid="carosello-salva"
          >
            <Save className="h-3.5 w-3.5" /> Salva carosello
          </button>
          {k && <span className="text-[11px] text-white/50">Nelle Home: {homes.length ? homes.map((h) => h.nome).join(", ") : "nessuna (aggiungerlo a un blocco dalla sezione HOME)"}</span>}
        </div>
        <Esito e={esito} testid="esito-carosello" />
      </Sezione>
      {k && (
        <Sezione titolo="Contenuti del carosello (ordine ↑/↓)" testid="contenuti-carosello">
          <ElencoPosizioni codice={codice} d={d} filtro={(c) => c.carosello === k.id} mostraContenitore vuoto="Nessun contenuto del pannello in questo carosello (le schede storiche della Home restano)." />
          <AggiungiPosizione codice={codice} d={d} fisso={{ tipo: "carosello", id: k.id }} testo="Aggiungi un contenuto al carosello" />
        </Sezione>
      )}
    </div>
  );
}

export function TabCaroselli({ codice, d }: Props) {
  const [scelto, setScelto] = useState<string | null>(d.caroselli[0]?.id ?? null);
  const [nuovo, setNuovo] = useState(false);
  const k = nuovo ? null : (d.caroselli.find((x) => x.id === scelto) ?? null);
  return (
    <div className="grid gap-5 lg:grid-cols-[300px_1fr]" data-testid="tab-caroselli">
      <aside className="flex flex-col gap-2">
        <button type="button" className={btnPieno} style={{ background: FLUO }} onClick={() => setNuovo(true)}>
          <Plus className="h-3.5 w-3.5" /> Nuovo carosello
        </button>
        <Elenco
          voci={d.caroselli}
          scelto={nuovo ? null : scelto}
          chiave={(x) => x.id}
          nome={(x) => x.nome}
          extra={(x) => <span className="text-[10px] text-white/45">{d.collocazioni.filter((c) => c.carosello === x.id).length}</span>}
          onScegli={(id) => {
            setScelto(id);
            setNuovo(false);
          }}
        />
      </aside>
      <EditorCarosello
        key={k ? k.id : "nuovo"}
        codice={codice}
        d={d}
        k={k}
        onFatto={(id) => {
          setScelto(id);
          setNuovo(false);
        }}
      />
    </div>
  );
}

/* ══ COPIE E PUBBLICAZIONE ════════════════════════════════════════════════ */

export function TabCopie({ codice }: { codice: string }) {
  const copie = useCopieSicurezza(codice);
  const confronto = useConfrontoTematici(codice);
  const crea = useCreaCopia();
  const ripristina = useRipristinaCopia();
  const promuovi = usePromuoviTematici();
  const [motivo, setMotivo] = useState("");
  const [esito, setEsito] = useState<EsitoAzione>(null);
  const [esitoP, setEsitoP] = useState<EsitoAzione>(null);
  const nonAllineati = confronto.data?.canali.filter((c) => !c.allineato) ?? [];
  return (
    <div className="flex flex-col gap-4" data-testid="tab-copie">
      <Sezione titolo="Canali tematici: anteprima → www.tbh-web.com" testid="confronto-tematici">
        <p className="text-[11px] text-white/60">
          I canali tematici (es. ARM WRESTLING) hanno dati separati fra anteprima e www: il pulsante Publish pubblica solo il codice. Qui si portano su www, canale per canale,
          dopo una copia di sicurezza automatica. Nulla si cancella: ciò che esiste solo su www resta.
          {confronto.data ? ` Questa pagina gira in: ${confronto.data.ambiente}.` : ""}
        </p>
        {confronto.isError && <p className="text-xs" style={{ color: ERRORE }}>{msg(confronto.error)}</p>}
        {confronto.data && (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-left text-[11px]">
              <thead className="text-white/50">
                <tr>
                  <th className="py-1">Canale</th>
                  <th>Anteprima (voci / in onda)</th>
                  <th>www (voci / in onda)</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {confronto.data.canali.map((c) => (
                  <tr key={c.slug} className="border-t border-white/10">
                    <td className="py-1.5 font-bold">{c.nome}</td>
                    <td>
                      {c.anteprima.voci} / {c.anteprima.pubblicate} · {c.anteprima.stato}
                    </td>
                    <td>
                      {c.www.voci} / {c.www.pubblicate} · {c.www.stato}
                    </td>
                    <td className="text-right">
                      {c.allineato ? (
                        <span style={{ color: FLUO }}>allineato</span>
                      ) : (
                        <button
                          type="button"
                          className={btn}
                          disabled={promuovi.isPending}
                          onClick={() =>
                            window.confirm(`Portare «${c.nome}» dall'anteprima su www.tbh-web.com? Prima si crea una copia di sicurezza.`) &&
                            void conEsito(promuovi.mutateAsync({ codice, slug: c.slug }), setEsitoP, (r) => `Portato su www: ${r.aggiunti} aggiunti, ${r.aggiornati} aggiornati, ${r.conservatiSoloWww} conservati. Copia ${r.copia}.`)
                          }
                        >
                          Porta su www
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {nonAllineati.length > 1 && (
          <button
            type="button"
            className={`${btn} w-fit`}
            disabled={promuovi.isPending}
            onClick={() =>
              window.confirm(`Portare su www tutti i ${nonAllineati.length} canali non allineati? Prima si crea una copia di sicurezza.`) &&
              void conEsito(promuovi.mutateAsync({ codice }), setEsitoP, (r) => `Portati su www: ${r.canali.length} canali (${r.aggiunti} aggiunti, ${r.aggiornati} aggiornati). Copia ${r.copia}.`)
            }
          >
            Porta tutti su www
          </button>
        )}
        <Esito e={esitoP} testid="esito-promozione" />
      </Sezione>

      <Sezione titolo="Copie di sicurezza" testid="copie-sicurezza">
        <p className="text-[11px] text-white/60">
          Fotografia di tutto ciò che si imposta a mano (contenuti, palinsesti, Home, Channel). Il ripristino <b>non cancella</b>: fa prima una nuova copia dello stato attuale, poi
          rimette i dati della copia (gli elementi aggiunti dopo restano).
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <input className={`${inp} max-w-sm`} placeholder="Motivo (facoltativo)" value={motivo} onChange={(e) => setMotivo(e.target.value)} />
          <button
            type="button"
            className={btnPieno}
            style={{ background: FLUO }}
            disabled={crea.isPending}
            onClick={() => void conEsito(crea.mutateAsync({ codice, motivo }), setEsito, (r) => `Copia creata: ${r.id} (${r.kb} KB).`).then(() => setMotivo(""))}
            data-testid="crea-copia"
          >
            {crea.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />} Crea copia ora
          </button>
        </div>
        <Esito e={esito} testid="esito-copie" />
        {copie.isError && <p className="text-xs" style={{ color: ERRORE }}>{msg(copie.error)}</p>}
        {copie.isLoading && <Loader2 className="h-4 w-4 animate-spin text-white/50" />}
        <ul className="flex max-h-[420px] flex-col gap-1 overflow-auto">
          {copie.data?.copie.map((c) => (
            <li key={c.id} className="flex flex-wrap items-center gap-2 rounded-lg border border-white/10 px-2 py-1.5 text-[11px]">
              <span className="text-white/50">{quando(c.quando)}</span>
              <span className="min-w-0 flex-1 truncate">{c.motivo}</span>
              <span className="text-white/45">
                {c.daAmbiente} · {c.voci.settings} impostazioni · {c.voci.contenuti} contenuti · {c.kb} KB
              </span>
              <button
                type="button"
                className={btn}
                disabled={ripristina.isPending}
                onClick={() =>
                  window.confirm(`Ripristinare la copia del ${quando(c.quando)}? Prima si crea una copia dello stato attuale; nulla viene cancellato.`) &&
                  void conEsito(ripristina.mutateAsync({ codice, id: c.id }), setEsito, (r) => `Ripristinata la copia ${r.ripristinata}. Stato precedente salvato nella copia ${r.copiaPrimaDelRipristino}.`)
                }
              >
                <RotateCcw className="h-3 w-3" /> Ripristina
              </button>
            </li>
          ))}
        </ul>
      </Sezione>
    </div>
  );
}

/* ══ ERRORI ═══════════════════════════════════════════════════════════════ */

export function TabErrori({ codice, d }: Props) {
  const svuota = useSvuotaErroriCms();
  const [esito, setEsito] = useState<EsitoAzione>(null);
  const nonIncorporabili = d.schede.filter((s) => s.verifica?.esito === "errore");
  return (
    <div className="flex flex-col gap-4" data-testid="tab-errori">
      <Sezione
        titolo={`Errori del player segnalati dal sito (${d.errori.length})`}
        destra={
          d.errori.length > 0 && (
            <button type="button" className={btn} onClick={() => window.confirm("Svuotare il registro degli errori?") && void conEsito(svuota.mutateAsync({ codice }), setEsito)}>
              Svuota
            </button>
          )
        }
      >
        <p className="text-[11px] text-white/55">Quando un video non parte, il player lo salta, passa al successivo e lo registra qui (una segnalazione al minuto per video).</p>
        {d.errori.length === 0 ? (
          <p className="text-xs text-white/50">Nessun errore registrato.</p>
        ) : (
          <ul className="flex max-h-80 flex-col gap-1 overflow-auto text-[11px]">
            {d.errori.map((e, i) => (
              <li key={i} className="text-white/75">
                <span className="text-white/45">{quando(e.quando)}</span> · «{e.titolo}» · {e.codice}: {e.messaggio} · <i>{e.dove}</i>
              </li>
            ))}
          </ul>
        )}
        <Esito e={esito} />
      </Sezione>
      <Sezione titolo={`Video che la fonte non permette di incorporare (${nonIncorporabili.length})`}>
        {nonIncorporabili.length === 0 ? (
          <p className="text-xs text-white/50">Nessuno.</p>
        ) : (
          <ul className="flex flex-col gap-1 text-[11px]">
            {nonIncorporabili.map((s) => (
              <li key={s.id} className="text-white/75">
                «{s.titolo}» — {s.verifica?.messaggio}{" "}
                {s.video && (
                  <a href={s.video.url} target="_blank" rel="noopener noreferrer" className="underline" style={{ color: ORO }}>
                    fonte
                  </a>
                )}{" "}
                · sul sito compare come link alla fonte.
              </li>
            ))}
          </ul>
        )}
      </Sezione>
    </div>
  );
}
