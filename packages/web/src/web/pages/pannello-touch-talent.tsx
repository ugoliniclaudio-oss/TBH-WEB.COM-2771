import { useMemo, useState } from "react";
import { Link } from "wouter";
import { AlertTriangle, ArrowLeft, Check, Eye, Loader2, Lock, Plus, RefreshCw, Trash2 } from "lucide-react";
import { SbloccoAllestimento, useCodiceAllestimento } from "../components/media-slot";
import {
  analizzaUrlTalent,
  useAggiornaMonitorTalent,
  useCreaMonitorTalent,
  useEliminaMonitorTalent,
  useImpostazioniTalent,
  useQuadroTalent,
  useRigeneraTalent,
  useStatoMonitorTalent,
  useSvuotaErroriTalent,
  useVerificaMonitorTalent,
  type AnalisiTalentUrl,
  type MonitorAdmin,
  type QuadroTalent,
} from "../queries/touch-talent";

/**
 * /allestimento/touch-talent — PANNELLO DEL TOUCH TALENT & PROFESSIONALS CHANNEL (28/10/2026).
 * Aggiungi monitor → Incolla URL (anche più URL, uno per riga) → Verifica → Attiva.
 * Titolo, miniatura e durata arrivano dalla fonte ufficiale e restano modificabili; protagonista,
 * categorie (scelta multipla) e «Emergente» si impostano a mano. Doppioni e URL non riproducibili
 * sono segnalati. Ogni monitor = un URL salvato nel database. Palinsesto H24 memorizzato sul server.
 */

const ORO = "#d4af37";
const FLUO = "#d7ff00";
const CATEGORIE = [
  ["artisti", "Artisti"],
  ["staff", "Staff"],
  ["crew", "Crew"],
  ["indipendenti", "Indipendenti"],
] as const;
type Categoria = (typeof CATEGORIE)[number][0];
const COLORE_STATO: Record<string, string> = { bozza: "#9ca3af", attivo: FLUO, disattivato: "#ffb36b", "non-disponibile": "#ff8a8a" };
const NOME_STATO: Record<string, string> = { bozza: "Bozza", attivo: "Attivo", disattivato: "Disattivato", "non-disponibile": "Non disponibile" };

const msg = (e: unknown) => (e instanceof Error ? e.message : "Operazione non riuscita.");
const codiceErrore = (e: unknown) => (e && typeof e === "object" && "code" in e ? String((e as { code: unknown }).code) : "");
const inp = "w-full rounded-lg border border-white/15 bg-black px-3 py-2 text-sm text-white placeholder:text-white/30 focus:border-[#d7ff00] focus:outline-none";
const btn = "inline-flex items-center gap-1.5 rounded-full border border-white/15 px-3 py-1.5 text-[11px] font-bold text-white/80 hover:border-[#d7ff00] hover:text-white disabled:opacity-40";
const btnPieno = "inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-extrabold tracking-[0.1em] text-black disabled:opacity-50";
const dataOra = (ms: number) => new Date(ms).toLocaleString("it-IT", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit" });
const mmss = (s: number | null | undefined) => (s ? `${Math.floor(s / 60)}:${String(Math.round(s) % 60).padStart(2, "0")}` : "—");

/** Player ufficiale per il controllo a vista (nessun autoplay, nessun audio finché non si preme play). */
function srcAnteprima(piattaforma: string, embedId: string | null, url: string) {
  if (piattaforma === "youtube" && embedId) return `https://www.youtube.com/embed/${embedId}?rel=0&playsinline=1`;
  if (piattaforma === "vimeo" && embedId) return `https://player.vimeo.com/video/${embedId}`;
  if (piattaforma === "dailymotion" && embedId) return `https://www.dailymotion.com/embed/video/${embedId}?autoplay=0`;
  if (piattaforma === "tiktok" && embedId) return `https://www.tiktok.com/player/v1/${embedId}?autoplay=0`;
  if (piattaforma === "instagram" && embedId) return `https://www.instagram.com/${embedId}/embed/`;
  if (piattaforma === "facebook") return `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(url)}&show_text=false`;
  return null;
}

function Anteprima916({ piattaforma, embedId, url, miniatura }: { piattaforma: string; embedId: string | null; url: string; miniatura: string | null }) {
  const [aperta, setAperta] = useState(false);
  const src = srcAnteprima(piattaforma, embedId, url);
  return (
    <div className="relative aspect-[9/16] w-[120px] shrink-0 overflow-hidden rounded-lg border border-white/10 bg-black" data-testid="anteprima-916">
      {aperta ? (
        piattaforma === "video" ? (
          <video src={url} controls playsInline preload="metadata" className="absolute inset-0 h-full w-full object-contain" />
        ) : src ? (
          <iframe src={src} className="absolute inset-0 h-full w-full" allow="autoplay; fullscreen; picture-in-picture; encrypted-media" allowFullScreen title="Anteprima" />
        ) : null
      ) : (
        <>
          {miniatura ? (
            <>
              <img src={miniatura} alt="" aria-hidden className="absolute inset-0 h-full w-full scale-110 object-cover opacity-30 blur-lg" referrerPolicy="no-referrer" />
              <img src={miniatura} alt="" className="absolute inset-0 h-full w-full object-contain" referrerPolicy="no-referrer" />
            </>
          ) : (
            <span className="absolute inset-0 flex items-center justify-center p-2 text-center text-[10px] text-white/40">Nessuna miniatura</span>
          )}
          <button type="button" onClick={() => setAperta(true)} className="absolute inset-x-2 bottom-2 rounded-full bg-black/75 py-1 text-[10px] font-bold text-white hover:text-[#d7ff00]">
            <Eye className="mr-1 inline h-3 w-3" /> Anteprima
          </button>
        </>
      )}
    </div>
  );
}

function SceltaCategorie({ valore, onChange }: { valore: Categoria[]; onChange: (v: Categoria[]) => void }) {
  return (
    <div className="flex flex-wrap gap-1.5" role="group" aria-label="Categorie">
      {CATEGORIE.map(([k, t]) => {
        const on = valore.includes(k);
        return (
          <button
            key={k}
            type="button"
            aria-pressed={on}
            onClick={() => onChange(on ? valore.filter((x) => x !== k) : [...valore, k])}
            className="rounded-full border px-2.5 py-1 text-[11px] font-bold"
            style={{ borderColor: on ? FLUO : "rgba(255,255,255,.15)", color: on ? FLUO : "rgba(255,255,255,.65)", background: on ? "rgba(215,255,0,.08)" : "transparent" }}
          >
            {on ? "✓ " : ""}
            {t}
          </button>
        );
      })}
    </div>
  );
}

/** Avvisi sulle capacità della fonte: senza durata / senza partenza dal punto giusto / senza avviso di fine. */
function LimitiFonte({ c, durata }: { c: { durata: boolean; seek: boolean; fine: boolean; autoplay: boolean }; durata: number | null | undefined }) {
  const v: string[] = [];
  if (!c.durata && !durata) v.push("durata non fornita: inserirla a mano (altrimenti slot predefinito)");
  if (!c.seek) v.push("niente partenza dal punto giusto: chi entra a metà lo vede dall'inizio");
  if (!c.fine) v.push("niente avviso di fine: il cambio segue l'orologio del palinsesto");
  if (!c.autoplay) v.push("niente riproduzione automatica: lo spettatore preme play");
  if (!v.length) return null;
  return (
    <ul className="flex flex-col gap-0.5 text-[10px] text-[#ffb36b]" data-testid="limiti-fonte">
      {v.map((x) => (
        <li key={x}>⚠ {x}</li>
      ))}
    </ul>
  );
}

/* ── Aggiungi monitor: incolla → verifica → attiva ────────────────────────── */

type Bozza = {
  includi: boolean;
  controllata: boolean;
  titolo: string;
  miniatura: string;
  protagonista: string;
  linkProtagonista: string;
  categorie: Categoria[];
  emergente: boolean;
  durata: string;
};

function AggiungiMonitor({ codice }: { codice: string }) {
  const [aperto, setAperto] = useState(false);
  const [testo, setTesto] = useState("");
  const [esiti, setEsiti] = useState<AnalisiTalentUrl[] | null>(null);
  const [bozze, setBozze] = useState<Record<string, Bozza>>({});
  const [inVerifica, setInVerifica] = useState(false);
  const [errore, setErrore] = useState("");
  const crea = useCreaMonitorTalent();
  const [risultato, setRisultato] = useState<Awaited<ReturnType<typeof crea.mutateAsync>> | null>(null);

  const verifica = async () => {
    setErrore("");
    setRisultato(null);
    setInVerifica(true);
    try {
      const r = await analizzaUrlTalent({ codice, testo });
      setEsiti(r.esiti);
      const b: Record<string, Bozza> = {};
      for (const e of r.esiti) {
        if (!e.valido) continue;
        b[e.grezzo] = {
          includi: !e.duplicato && !e.ripetuto && e.esito !== "errore" && !e.diretta,
          controllata: e.esito === "ok",
          titolo: e.titolo ?? "",
          miniatura: e.miniatura ?? "",
          protagonista: "",
          linkProtagonista: "",
          categorie: [],
          emergente: false,
          durata: e.durataSec ? String(e.durataSec) : "",
        };
      }
      setBozze(b);
    } catch (e) {
      setErrore(msg(e));
    } finally {
      setInVerifica(false);
    }
  };

  const valide = (esiti ?? []).filter((e): e is Extract<AnalisiTalentUrl, { valido: true }> => e.valido);
  const scelte = valide.filter((e) => bozze[e.grezzo]?.includi);
  const daControllare = scelte.filter((e) => e.esito === "non-verificabile" && !bozze[e.grezzo]?.controllata);

  const salva = async (attiva: boolean) => {
    setErrore("");
    if (attiva && daControllare.length) {
      setErrore(`${daControllare.length} URL non verificabili dal server: aprire l'anteprima e spuntare «Anteprima controllata» prima di attivare.`);
      return;
    }
    try {
      const r = await crea.mutateAsync({
        codice,
        attiva,
        voci: scelte.map((e) => {
          const b = bozze[e.grezzo]!;
          const d = Number(b.durata.replace(",", "."));
          return {
            url: e.url,
            titolo: b.titolo.trim() || null,
            miniatura: b.miniatura.trim() || null,
            protagonista: b.protagonista.trim() || null,
            linkProtagonista: b.linkProtagonista.trim() || null,
            categorie: b.categorie,
            emergente: b.emergente,
            durataSec: Number.isFinite(d) && d >= 1 ? Math.round(d) : null,
          };
        }),
      });
      setRisultato(r);
      const inseriti = new Set(r.esiti.filter((x) => x.esito === "inserito").map((x) => x.url));
      setEsiti((v) => (v ?? []).filter((e) => !(e.valido && inseriti.has(e.url))));
      if (inseriti.size && !r.esiti.some((x) => x.esito !== "inserito")) setTesto("");
    } catch (e) {
      setErrore(msg(e));
    }
  };

  const agg = (k: string, p: Partial<Bozza>) => setBozze((b) => ({ ...b, [k]: { ...b[k]!, ...p } }));

  if (!aperto)
    return (
      <button type="button" className={`${btnPieno} self-start`} style={{ background: FLUO }} onClick={() => setAperto(true)} data-testid="aggiungi-monitor">
        <Plus className="h-4 w-4" /> AGGIUNGI MONITOR
      </button>
    );

  return (
    <section className="flex flex-col gap-4 rounded-2xl border p-4 md:p-5" style={{ borderColor: `${FLUO}55` }} data-testid="aggiungi-monitor-box">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-sm font-extrabold tracking-[0.12em]" style={{ color: FLUO }}>
          AGGIUNGI MONITOR · 1 monitor = 1 URL
        </h2>
        <button type="button" className={btn} onClick={() => setAperto(false)}>
          Chiudi
        </button>
      </div>
      <label className="flex flex-col gap-1 text-[11px] text-white/60">
        Incolla URL (uno per riga, massimo 40): YouTube (anche Shorts), Vimeo, Dailymotion, TikTok, Instagram, Facebook, file video .mp4/.webm
        <textarea className={`${inp} min-h-[110px] font-mono text-xs`} value={testo} onChange={(e) => setTesto(e.target.value)} placeholder={"https://www.youtube.com/shorts/…\nhttps://vimeo.com/…"} data-testid="url-talent" />
      </label>
      <div className="flex flex-wrap gap-2">
        <button type="button" className={btnPieno} style={{ background: ORO }} disabled={!testo.trim() || inVerifica} onClick={() => void verifica()} data-testid="verifica-url">
          {inVerifica ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />} VERIFICA
        </button>
      </div>
      {errore && <p className="text-xs text-[#ff8a8a]">{errore}</p>}

      {esiti && (
        <div className="flex flex-col gap-3" data-testid="esiti-verifica">
          {esiti.length === 0 && <p className="text-xs text-white/50">Nessun URL da verificare.</p>}
          {esiti.map((e) =>
            !e.valido ? (
              <div key={e.grezzo} className="flex items-start gap-2 rounded-xl border border-[#ff8a8a]/40 bg-[#ff8a8a]/[0.05] p-3 text-xs" data-testid="esito-non-valido">
                <AlertTriangle className="h-4 w-4 shrink-0 text-[#ff8a8a]" />
                <div className="min-w-0">
                  <p className="break-all font-mono text-white/70">{e.grezzo}</p>
                  <p className="text-[#ff8a8a]">Non utilizzabile: {e.messaggio}</p>
                </div>
              </div>
            ) : (
              (() => {
                const b = bozze[e.grezzo];
                if (!b) return null;
                const bloccante = e.duplicato || e.ripetuto || e.esito === "errore" || e.diretta;
                return (
                  <div key={e.grezzo} className="flex flex-col gap-3 rounded-xl border p-3 md:flex-row" style={{ borderColor: bloccante ? "rgba(255,138,138,.4)" : "rgba(255,255,255,.12)" }} data-testid="esito-valido">
                    <Anteprima916 piattaforma={e.piattaforma} embedId={e.embedId} url={e.url} miniatura={b.miniatura || null} />
                    <div className="flex min-w-0 flex-1 flex-col gap-2">
                      <div className="flex flex-wrap items-center gap-2 text-[11px]">
                        <label className="flex items-center gap-1.5 font-bold">
                          <input type="checkbox" checked={b.includi} disabled={!!e.duplicato || !!e.ripetuto} onChange={(x) => agg(e.grezzo, { includi: x.target.checked })} /> Includi
                        </label>
                        <span className="rounded-full border border-white/15 px-2 py-0.5">{e.nomePiattaforma}</span>
                        <span style={{ color: e.esito === "ok" ? FLUO : e.esito === "errore" ? "#ff8a8a" : "#ffb36b" }}>
                          {e.esito === "ok" ? "✓ Riproducibile" : e.esito === "errore" ? "✕ Non riproducibile" : "? Non verificabile dal server"} — {e.messaggio}
                        </span>
                      </div>
                      <p className="break-all font-mono text-[10px] text-white/45">{e.url}</p>
                      {e.duplicato && <p className="text-[11px] text-[#ff8a8a]">DOPPIONE: già presente come monitor #{e.duplicato.id} «{e.duplicato.titolo}».</p>}
                      {e.ripetuto && <p className="text-[11px] text-[#ff8a8a]">Ripetuto nell'elenco incollato (stesso video di {e.ripetuto}).</p>}
                      {e.diretta && <p className="text-[11px] text-[#ff8a8a]">È una diretta (durata indefinita): non adatta al palinsesto a rotazione.</p>}
                      <LimitiFonte c={e.capacita} durata={Number(b.durata) || null} />
                      <div className="grid gap-2 sm:grid-cols-2">
                        <label className="flex flex-col gap-1 text-[11px] text-white/60 sm:col-span-2">
                          Titolo {e.titolo ? "(dalla fonte, modificabile)" : "(la fonte non lo fornisce)"}
                          <input className={inp} value={b.titolo} onChange={(x) => agg(e.grezzo, { titolo: x.target.value })} />
                        </label>
                        <label className="flex flex-col gap-1 text-[11px] text-white/60 sm:col-span-2">
                          Miniatura (URL immagine)
                          <input className={inp} value={b.miniatura} onChange={(x) => agg(e.grezzo, { miniatura: x.target.value })} />
                        </label>
                        <label className="flex flex-col gap-1 text-[11px] text-white/60">
                          Protagonista
                          <input className={inp} value={b.protagonista} onChange={(x) => agg(e.grezzo, { protagonista: x.target.value })} placeholder={e.autore ? `es. ${e.autore} (autore sulla fonte)` : ""} />
                        </label>
                        <label className="flex flex-col gap-1 text-[11px] text-white/60">
                          Pagina profilo ESISTENTE (/… o https://…, facoltativa)
                          <input className={inp} value={b.linkProtagonista} onChange={(x) => agg(e.grezzo, { linkProtagonista: x.target.value })} />
                        </label>
                        <label className="flex flex-col gap-1 text-[11px] text-white/60">
                          Durata in secondi {e.durataSec ? "(dalla fonte)" : "(da inserire)"}
                          <input className={inp} inputMode="numeric" value={b.durata} onChange={(x) => agg(e.grezzo, { durata: x.target.value.replace(/[^\d]/g, "") })} />
                        </label>
                        <div className="flex flex-col gap-1 text-[11px] text-white/60">
                          Categorie (scelta multipla)
                          <SceltaCategorie valore={b.categorie} onChange={(v) => agg(e.grezzo, { categorie: v })} />
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-4 text-[11px]">
                        <label className="flex items-center gap-1.5 font-bold" style={{ color: ORO }}>
                          <input type="checkbox" checked={b.emergente} onChange={(x) => agg(e.grezzo, { emergente: x.target.checked })} /> Emergente
                        </label>
                        {e.esito === "non-verificabile" && (
                          <label className="flex items-center gap-1.5 font-bold text-[#ffb36b]">
                            <input type="checkbox" checked={b.controllata} onChange={(x) => agg(e.grezzo, { controllata: x.target.checked })} /> Anteprima controllata: il video si vede
                          </label>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })()
            ),
          )}
          {valide.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              <button type="button" className={btnPieno} style={{ background: FLUO }} disabled={!scelte.length || crea.isPending} onClick={() => void salva(true)} data-testid="attiva-monitor">
                {crea.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />} ATTIVA ({scelte.length})
              </button>
              <button type="button" className={btn} disabled={!scelte.length || crea.isPending} onClick={() => void salva(false)} data-testid="salva-bozza">
                Salva in bozza ({scelte.length})
              </button>
              <span className="text-[11px] text-white/45">Gli URL non riproducibili restano in bozza anche se si preme «Attiva».</span>
            </div>
          )}
        </div>
      )}

      {risultato && (
        <div className="rounded-xl border border-white/10 p-3 text-xs" data-testid="risultato-crea">
          <p className="font-bold">
            Attivati {risultato.attivati} · In bozza {risultato.bozze} · Doppioni {risultato.duplicati} · Non validi {risultato.nonValidi}
          </p>
          <ul className="mt-1 flex flex-col gap-0.5 text-white/70">
            {risultato.esiti.map((x, i) => (
              <li key={i} style={{ color: x.esito === "inserito" ? undefined : "#ffb36b" }}>
                {x.titolo ?? x.url} — {x.messaggio}
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}

/* ── monitor salvati ──────────────────────────────────────────────────────── */

function RigaMonitor({ codice, m, inOnda }: { codice: string; m: MonitorAdmin; inOnda: boolean }) {
  const [modifica, setModifica] = useState(false);
  const [f, setF] = useState({
    url: m.url,
    titolo: m.titolo,
    miniatura: m.miniatura ?? "",
    protagonista: m.protagonista ?? "",
    linkProtagonista: m.linkProtagonista ?? "",
    categorie: m.categorie as Categoria[],
    emergente: m.emergente,
    durata: m.durataSec ? String(m.durataSec) : "",
  });
  const [avviso, setAvviso] = useState("");
  const aggiorna = useAggiornaMonitorTalent();
  const verifica = useVerificaMonitorTalent();
  const stato = useStatoMonitorTalent();
  const elimina = useEliminaMonitorTalent();
  const occupato = aggiorna.isPending || verifica.isPending || stato.isPending || elimina.isPending;

  const cambiaStato = async (s: "attivo" | "disattivato" | "bozza", forza = false) => {
    setAvviso("");
    try {
      await stato.mutateAsync({ codice, id: m.id, stato: s, forza });
    } catch (e) {
      if (codiceErrore(e) === "PRECONDITION_FAILED" && window.confirm(`${msg(e)}\n\nAttivare comunque?`)) return cambiaStato(s, true);
      setAvviso(msg(e));
    }
  };
  const salva = async () => {
    setAvviso("");
    const d = Number(f.durata);
    try {
      await aggiorna.mutateAsync({
        codice,
        id: m.id,
        url: f.url.trim() !== m.url ? f.url.trim() : undefined,
        titolo: f.titolo,
        miniatura: f.miniatura,
        protagonista: f.protagonista,
        linkProtagonista: f.linkProtagonista,
        categorie: f.categorie,
        emergente: f.emergente,
        durataSec: Number.isFinite(d) && d >= 1 ? Math.round(d) : null,
      });
      setModifica(false);
      if (f.url.trim() !== m.url) setAvviso("URL cambiato: il monitor è tornato in bozza. Verificare e riattivare.");
    } catch (e) {
      setAvviso(msg(e));
    }
  };

  return (
    <li className="flex flex-col gap-3 rounded-xl border p-3 md:flex-row" style={{ borderColor: inOnda ? FLUO : "rgba(255,255,255,.1)", boxShadow: inOnda ? `0 0 18px ${FLUO}33` : undefined }} data-testid="riga-monitor">
      <Anteprima916 piattaforma={m.piattaforma} embedId={m.embedId} url={m.url} miniatura={m.miniatura} />
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="flex flex-wrap items-center gap-2 text-[11px]">
          <span className="font-mono text-white/40">#{m.id}</span>
          <span className="rounded-full px-2 py-0.5 font-extrabold text-black" style={{ background: COLORE_STATO[m.stato] }}>
            {NOME_STATO[m.stato] ?? m.stato}
          </span>
          {inOnda && (
            <span className="rounded-full border px-2 py-0.5 font-extrabold" style={{ borderColor: FLUO, color: FLUO }}>
              IN ONDA
            </span>
          )}
          {m.emergente && (
            <span className="rounded-full border px-2 py-0.5 font-bold" style={{ borderColor: ORO, color: ORO }}>
              Emergente
            </span>
          )}
          <span className="text-white/55">
            {m.piattaforma} · {mmss(m.durataSec)}
            {m.durataDa ? ` (${m.durataDa})` : ""}
          </span>
          {m.categorie.map((c) => (
            <span key={c} className="rounded-full border border-white/15 px-2 py-0.5 text-white/70">
              {CATEGORIE.find((x) => x[0] === c)?.[1] ?? c}
            </span>
          ))}
        </div>
        <p className="text-sm font-bold">{m.titolo}</p>
        <p className="text-[11px] text-white/55">
          Protagonista: {m.protagonista ?? "—"}
          {m.linkProtagonista ? ` · profilo ${m.linkProtagonista}` : ""}
        </p>
        <p className="break-all font-mono text-[10px] text-white/40">{m.url}</p>
        {m.verifica && (
          <p className="text-[11px]" style={{ color: m.verifica.esito === "ok" ? FLUO : m.verifica.esito === "errore" ? "#ff8a8a" : "#ffb36b" }}>
            Ultima verifica {dataOra(m.verifica.quando)}: {m.verifica.messaggio}
          </p>
        )}
        {m.ultimoErrore && (
          <p className="text-[11px] text-[#ff8a8a]">
            Errori del player: {m.errori} · ultimo {dataOra(m.ultimoErrore.quando)} — {m.ultimoErrore.messaggio}
          </p>
        )}
        <LimitiFonte c={m.capacita} durata={m.durataSec} />

        {modifica && (
          <div className="grid gap-2 rounded-lg border border-white/10 p-3 sm:grid-cols-2" data-testid="modifica-monitor">
            <label className="flex flex-col gap-1 text-[11px] text-white/60 sm:col-span-2">
              URL (cambiandolo il monitor torna in bozza)
              <input className={inp} value={f.url} onChange={(e) => setF({ ...f, url: e.target.value })} />
            </label>
            <label className="flex flex-col gap-1 text-[11px] text-white/60 sm:col-span-2">
              Titolo
              <input className={inp} value={f.titolo} onChange={(e) => setF({ ...f, titolo: e.target.value })} />
            </label>
            <label className="flex flex-col gap-1 text-[11px] text-white/60 sm:col-span-2">
              Miniatura (URL immagine)
              <input className={inp} value={f.miniatura} onChange={(e) => setF({ ...f, miniatura: e.target.value })} />
            </label>
            <label className="flex flex-col gap-1 text-[11px] text-white/60">
              Protagonista
              <input className={inp} value={f.protagonista} onChange={(e) => setF({ ...f, protagonista: e.target.value })} />
            </label>
            <label className="flex flex-col gap-1 text-[11px] text-white/60">
              Pagina profilo ESISTENTE (/… o https://…)
              <input className={inp} value={f.linkProtagonista} onChange={(e) => setF({ ...f, linkProtagonista: e.target.value })} />
            </label>
            <label className="flex flex-col gap-1 text-[11px] text-white/60">
              Durata in secondi
              <input className={inp} inputMode="numeric" value={f.durata} onChange={(e) => setF({ ...f, durata: e.target.value.replace(/[^\d]/g, "") })} />
            </label>
            <div className="flex flex-col gap-1 text-[11px] text-white/60">
              Categorie
              <SceltaCategorie valore={f.categorie} onChange={(v) => setF({ ...f, categorie: v })} />
            </div>
            <label className="flex items-center gap-1.5 text-[11px] font-bold" style={{ color: ORO }}>
              <input type="checkbox" checked={f.emergente} onChange={(e) => setF({ ...f, emergente: e.target.checked })} /> Emergente
            </label>
            <div className="flex gap-2 sm:col-span-2">
              <button type="button" className={btnPieno} style={{ background: FLUO }} disabled={occupato} onClick={() => void salva()}>
                Salva modifiche
              </button>
              <button type="button" className={btn} onClick={() => setModifica(false)}>
                Annulla
              </button>
            </div>
          </div>
        )}

        <div className="flex flex-wrap gap-1.5">
          <button type="button" className={btn} onClick={() => setModifica((v) => !v)} data-testid="modifica">
            Modifica
          </button>
          <button type="button" className={btn} disabled={occupato} onClick={() => verifica.mutate({ codice, id: m.id }, { onError: (e) => setAvviso(msg(e)) })}>
            <RefreshCw className={`h-3.5 w-3.5 ${verifica.isPending ? "animate-spin" : ""}`} /> Verifica
          </button>
          {m.stato !== "attivo" && (
            <button type="button" className={btn} disabled={occupato} onClick={() => void cambiaStato("attivo")} style={{ borderColor: `${FLUO}88`, color: FLUO }} data-testid="attiva">
              <Check className="h-3.5 w-3.5" /> Attiva
            </button>
          )}
          {m.stato === "attivo" && (
            <button type="button" className={btn} disabled={occupato} onClick={() => void cambiaStato("disattivato")} data-testid="disattiva">
              Disattiva
            </button>
          )}
          {m.stato !== "bozza" && m.stato !== "attivo" && (
            <button type="button" className={btn} disabled={occupato} onClick={() => void cambiaStato("bozza")}>
              Riporta in bozza
            </button>
          )}
          <button
            type="button"
            className={btn}
            disabled={occupato}
            onClick={() => window.confirm(`Eliminare definitivamente il monitor «${m.titolo}»?`) && elimina.mutate({ codice, id: m.id }, { onError: (e) => setAvviso(msg(e)) })}
            style={{ color: "#ff8a8a" }}
            data-testid="elimina"
          >
            <Trash2 className="h-3.5 w-3.5" /> Elimina
          </button>
        </div>
        {avviso && <p className="text-[11px] text-[#ffb36b]">{avviso}</p>}
      </div>
    </li>
  );
}

/* ── priorità e palinsesto ────────────────────────────────────────────────── */

function Impostazioni({ codice, d }: { codice: string; d: QuadroTalent }) {
  const [f, setF] = useState(d.impostazioni);
  const salva = useImpostazioniTalent();
  const campi: [keyof typeof f, string, number, number][] = [
    ["pesoEmergenti", "Priorità emergenti (0–5)", 0, 5],
    ["pesoNuovi", "Priorità nuovi caricamenti (0–5)", 0, 5],
    ["giorniNuovo", "«Nuovo» per giorni (1–90)", 1, 90],
    ["durataPredefinita", "Slot senza durata, secondi (15–1800)", 15, 1800],
    ["stacco", "Pausa fra monitor, secondi (0–10)", 0, 10],
  ];
  return (
    <section className="flex flex-col gap-3 rounded-xl border border-white/10 p-4" data-testid="impostazioni-talent">
      <h3 className="text-sm font-extrabold">Priorità del palinsesto</h3>
      <div className="grid gap-2 sm:grid-cols-3 lg:grid-cols-5">
        {campi.map(([k, t, min, max]) => (
          <label key={k} className="flex flex-col gap-1 text-[11px] text-white/60">
            {t}
            <input className={inp} type="number" min={min} max={max} value={f[k]} onChange={(e) => setF({ ...f, [k]: Math.max(min, Math.min(max, Math.round(Number(e.target.value) || 0))) })} />
          </label>
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <button type="button" className={btnPieno} style={{ background: ORO }} disabled={salva.isPending} onClick={() => salva.mutate({ codice, ...f })}>
          Salva priorità
        </button>
        <button type="button" className={btn} onClick={() => setF(d.predefinite)}>
          Valori predefiniti
        </button>
        {salva.isSuccess && <span className="text-[11px]" style={{ color: FLUO }}>Salvate: valgono dal prossimo giro (il monitor in onda non si interrompe).</span>}
        {salva.isError && <span className="text-[11px] text-[#ff8a8a]">{msg(salva.error)}</span>}
      </div>
    </section>
  );
}

function VistaPalinsesto({ codice, d }: { codice: string; d: QuadroTalent }) {
  const rigenera = useRigeneraTalent();
  const p = d.palinsesto;
  return (
    <section className="flex flex-col gap-3 rounded-xl border border-white/10 p-4" data-testid="palinsesto-talent">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-extrabold">Palinsesto H24 memorizzato (ora del server)</h3>
        <button
          type="button"
          className={btn}
          disabled={rigenera.isPending || !p}
          onClick={() => window.confirm("Nuovo ordine casuale da adesso? Il monitor in onda viene interrotto per tutti gli spettatori.") && rigenera.mutate({ codice })}
        >
          <RefreshCw className="h-3.5 w-3.5" /> Rimescola da adesso
        </button>
      </div>
      {!p || !p.inOnda ? (
        <p className="text-xs text-white/50">Nessun monitor attivo: il Channel mostra «Channel in allestimento».</p>
      ) : (
        <>
          <p className="text-[11px] text-white/55">
            Giro n. {p.giro} · {p.visti}/{p.slotNelGiro} già andati in onda in questo giro · fine giro {p.fineGiro ? dataOra(p.fineGiro) : "—"} · poi rimescolamento automatico
          </p>
          <ol className="flex max-h-80 flex-col gap-1 overflow-auto text-[11px]">
            <li className="font-bold" style={{ color: FLUO }}>
              IN ONDA · {dataOra(p.inOnda.inizio)} → {p.inOnda.fine ? dataOra(p.inOnda.fine) : "—"} · #{p.inOnda.id} {p.inOnda.titolo}
              {p.inOnda.stimata ? " (durata stimata)" : ""}
            </li>
            {p.seguenti.map((s, i) => (
              <li key={`${s.id}-${s.inizio}-${i}`} className="text-white/70">
                {dataOra(s.inizio)} · #{s.id} {s.titolo} · {mmss(s.durata)}
                {s.stimata ? " (stimata)" : ""}
              </li>
            ))}
          </ol>
        </>
      )}
    </section>
  );
}

/* ── pagina ───────────────────────────────────────────────────────────────── */

export default function PannelloTouchTalentPage() {
  const { codice } = useCodiceAllestimento();
  const q = useQuadroTalent(codice);
  const svuota = useSvuotaErroriTalent();
  const [filtro, setFiltro] = useState("tutti");
  const d = q.data;
  const elenco = useMemo(() => (d ? d.monitor.filter((m) => filtro === "tutti" || m.stato === filtro) : []), [d, filtro]);

  if (!codice)
    return (
      <div className="mx-auto flex max-w-[900px] flex-col gap-5 px-4 py-10">
        <h1 className="tbh-display tbh-h2 flex items-center gap-3" style={{ color: ORO }}>
          <Lock className="h-6 w-6" /> Touch Talent &amp; Professionals
        </h1>
        <p className="text-sm text-[var(--tbh-muted)]">Area riservata: serve il codice di allestimento.</p>
        <SbloccoAllestimento />
      </div>
    );

  return (
    <div className="mx-auto flex max-w-[1400px] flex-col gap-6 px-4 py-8 md:px-8" data-testid="pannello-talent">
      <Link href="/allestimento" className="inline-flex w-fit items-center gap-1.5 text-sm text-[var(--tbh-muted)] hover:text-white">
        <ArrowLeft className="h-4 w-4" /> Allestimento
      </Link>
      <header className="flex flex-col gap-3">
        <img src="/channel/loghi/tbh/touch-talent-professionals.jpe" alt="TBH Channel · Touch Talent & Professionals" className="h-auto w-full max-w-[420px]" />
        <h1 className="tbh-display tbh-h2 leading-[0.95]" style={{ color: ORO }}>
          TOUCH TALENT &amp; PROFESSIONALS · MONITOR
        </h1>
        <p className="max-w-3xl text-sm text-[var(--tbh-muted)]">
          Ogni monitor è un URL salvato nel database e si vede in verticale 9:16 senza tagli né deformazioni. Un URL va in onda solo dopo una verifica riuscita (o, per Facebook e
          Instagram che il server non può verificare, dopo il controllo dell'anteprima). Palinsesto H24 casuale uguale per tutti: ogni giro completo prima di rimescolare, niente
          ripetizioni ravvicinate né lo stesso protagonista due volte di fila; i nuovi entrano senza interrompere il monitor in onda.
          {d ? ` Ambito: ${d.ambiente}.` : ""}
        </p>
        <div className="flex flex-wrap gap-3 text-xs">
          <Link href="/channel/touch-talent-professionals" className="underline" style={{ color: FLUO }}>
            Apri il Channel sul sito
          </Link>
        </div>
      </header>

      {q.isError && <p className="text-sm text-[#ff8a8a]">{msg(q.error)}</p>}
      {q.isLoading && <Loader2 className="h-5 w-5 animate-spin text-white/50" />}

      {d && (
        <>
          <AggiungiMonitor codice={codice} />
          <VistaPalinsesto codice={codice} d={d} />
          <Impostazioni key={JSON.stringify(d.impostazioni)} codice={codice} d={d} />

          <section className="flex flex-col gap-3" data-testid="elenco-monitor">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-sm font-extrabold">Monitor salvati</h3>
              {["tutti", "attivo", "bozza", "disattivato", "non-disponibile"].map((s) => (
                <button key={s} type="button" onClick={() => setFiltro(s)} className={btn} style={filtro === s ? { borderColor: FLUO, color: FLUO } : undefined}>
                  {s === "tutti" ? "Tutti" : NOME_STATO[s]} ({s === "tutti" ? d.monitor.length : d.monitor.filter((m) => m.stato === s).length})
                </button>
              ))}
            </div>
            {elenco.length === 0 ? (
              <p className="text-xs text-white/50">Nessun monitor{filtro !== "tutti" ? ` «${NOME_STATO[filtro]}»` : ""}. Senza monitor attivi il Channel mostra «Channel in allestimento».</p>
            ) : (
              <ul className="flex flex-col gap-2">
                {elenco.map((m) => (
                  <RigaMonitor key={`${m.id}-${m.aggiornato}`} codice={codice} m={m} inOnda={d.palinsesto?.inOnda?.id === m.id} />
                ))}
              </ul>
            )}
          </section>

          <section className="flex flex-col gap-2 rounded-xl border border-white/10 p-4" data-testid="registro-errori-talent">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-sm font-extrabold">Registro degli errori del player ({d.errori.length})</h3>
              {d.errori.length > 0 && (
                <button type="button" className={btn} onClick={() => window.confirm("Svuotare il registro degli errori?") && svuota.mutate({ codice })}>
                  Svuota
                </button>
              )}
            </div>
            <p className="text-[11px] text-white/45">Un monitor che non parte viene saltato subito; il server ricontrolla la fonte e, se non è più riproducibile, lo toglie dal palinsesto.</p>
            {d.errori.length === 0 ? (
              <p className="text-xs text-white/50">Nessun errore registrato.</p>
            ) : (
              <ul className="flex max-h-72 flex-col gap-1 overflow-auto text-[11px]">
                {d.errori.map((e, i) => (
                  <li key={i} className="text-white/75">
                    <span className="text-white/45">{dataOra(e.quando)}</span> · #{e.id} «{e.titolo}» · {e.codice}: {e.messaggio} · <i>{e.esito}</i>
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
