import { useState, type ReactNode } from "react";
import { ArrowDown, ArrowUp, Check, Loader2, Pencil, Plus, Trash2, X } from "lucide-react";
import {
  useEliminaCollocazioneCms,
  useOrdinaCollocazioniCms,
  useSalvaCollocazioneCms,
  type CollocazioneCms,
  type QuadroCms,
} from "../queries/contenuti-palinsesto";

/**
 * Pezzi comuni del pannello «Gestione contenuti e palinsesto» (28/10/2026):
 * stili, esito delle azioni, badge di stato/programmazione, modulo di una POSIZIONE
 * (dove compare una scheda: Home, Channel, carosello, playlist; date, ripetizione, passaggi)
 * ed elenco ordinabile ↑/↓ di un contenitore.
 */

export const FLUO = "#d7ff00";
export const ORO = "#d4af37";
export const ERRORE = "#ff8a8a";
export const inp =
  "w-full rounded-lg border border-white/15 bg-black px-3 py-2 text-sm text-white placeholder:text-white/30 focus:border-[#d7ff00] focus:outline-none disabled:opacity-50";
export const btn =
  "inline-flex items-center gap-1.5 rounded-full border border-white/15 px-3 py-1.5 text-[11px] font-bold text-white/80 hover:border-[#d7ff00] hover:text-white disabled:opacity-40";
export const btnPieno = "inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-extrabold tracking-[0.1em] text-black disabled:opacity-50";
export const etichetta = "flex flex-col gap-1 text-[11px] text-white/60";

export const msg = (e: unknown) => (e instanceof Error ? e.message : "Operazione non riuscita.");
export const quando = (t: number | null | undefined) => (t ? new Date(t).toLocaleString("it-IT", { dateStyle: "short", timeStyle: "short" }) : "—");

/** Esito chiaro di ogni azione: riuscita (con il testo del server) o errore (con il motivo). */
export type EsitoAzione = { ok: boolean; testo: string } | null;
export function Esito({ e, testid }: { e: EsitoAzione; testid?: string }) {
  if (!e) return null;
  return (
    <p
      className="flex items-start gap-2 rounded-lg border px-3 py-2 text-xs"
      style={{ borderColor: e.ok ? `${FLUO}66` : `${ERRORE}88`, color: e.ok ? FLUO : ERRORE, background: e.ok ? `${FLUO}0d` : `${ERRORE}10` }}
      data-testid={testid ?? "esito"}
      role="status"
    >
      {e.ok ? <Check className="mt-0.5 h-3.5 w-3.5 shrink-0" /> : <X className="mt-0.5 h-3.5 w-3.5 shrink-0" />}
      <span>{e.testo}</span>
    </p>
  );
}
/** Esegue una mutazione e ne restituisce l'esito leggibile. */
export async function conEsito<R>(p: Promise<R>, set: (e: EsitoAzione) => void, testo?: (r: R) => string) {
  try {
    const r = await p;
    const t = testo ? testo(r) : ((r as { esito?: string })?.esito ?? "Fatto.");
    set({ ok: true, testo: t });
    return r;
  } catch (e) {
    set({ ok: false, testo: msg(e) });
    return null;
  }
}

const COLORI_STATO: Record<string, string> = { bozza: "#9ca3af", attivo: FLUO, sospeso: "#ffb36b" };
const NOMI_STATO: Record<string, string> = { bozza: "BOZZA", attivo: "ATTIVO", sospeso: "SOSPESO" };
export function BadgeStato({ s }: { s: string }) {
  return (
    <span className="rounded-full border px-2 py-0.5 text-[10px] font-extrabold tracking-[0.12em]" style={{ borderColor: COLORI_STATO[s] ?? "#666", color: COLORI_STATO[s] ?? "#aaa" }}>
      {NOMI_STATO[s] ?? s.toUpperCase()}
    </span>
  );
}
const PROGRAMMA: Record<string, [string, string]> = {
  "in-onda": ["IN ONDA", FLUO],
  programmato: ["PROGRAMMATO", ORO],
  scaduto: ["SCADUTO", "#9ca3af"],
  "fuori-orario": ["FUORI FASCIA ORARIA", "#9ca3af"],
  sospeso: ["SOSPESO", "#ffb36b"],
};
export function BadgeProgramma({ p }: { p: string }) {
  const [t, c] = PROGRAMMA[p] ?? [p, "#aaa"];
  return (
    <span className="rounded-full px-2 py-0.5 text-[10px] font-extrabold tracking-[0.12em] text-black" style={{ background: c }} data-testid="badge-programma">
      {t}
    </span>
  );
}

export function Sezione({ titolo, children, testid, destra }: { titolo: string; children: ReactNode; testid?: string; destra?: ReactNode }) {
  return (
    <section className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/[0.02] p-4" data-testid={testid}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-extrabold tracking-[0.08em]">{titolo}</h3>
        {destra}
      </div>
      {children}
    </section>
  );
}

/* ── descrizione di una posizione ─────────────────────────────────────────── */

export function nomeContenitore(c: Pick<CollocazioneCms, "home" | "channel" | "carosello" | "playlist">, d: QuadroCms) {
  const parti: string[] = [];
  if (c.carosello) parti.push(`Carosello «${d.caroselli.find((k) => k.id === c.carosello)?.nome ?? c.carosello}»`);
  if (c.playlist) parti.push(`Playlist «${d.playlist.find((p) => p.id === c.playlist)?.nome ?? c.playlist}»`);
  if (c.channel) parti.push(`Channel «${d.canali.find((x) => x.slug === c.channel)?.nome ?? c.channel}»`);
  if (c.carosello) parti.push(c.home ? `solo in ${d.homes.find((h) => h.slug === c.home)?.nome ?? c.home}` : "in tutte le Home");
  return parti.join(" · ");
}
const GIORNI = ["Lun", "Mar", "Mer", "Gio", "Ven", "Sab", "Dom"];
export function descriviProgrammazione(c: CollocazioneCms) {
  const t: string[] = [];
  if (c.inizio) t.push(`dal ${c.inizio.replace("T", " ")}`);
  if (c.fine) t.push(`al ${c.fine.replace("T", " ")}`);
  const r = c.ripetizione;
  if (r.tipo === "giornaliera") t.push("ogni giorno");
  if (r.tipo === "settimanale") t.push(r.giorni.map((g) => GIORNI[g - 1]).join(", "));
  if (r.tipo !== "sempre" && r.dalle && r.alle) t.push(`${r.dalle}–${r.alle}`);
  if (c.passaggi > 1) t.push(`${c.passaggi} passaggi per giro`);
  return t.length ? t.join(" · ") : "sempre, senza scadenza";
}

/* ── modulo di una posizione ──────────────────────────────────────────────── */

type TipoContenitore = "carosello" | "playlist" | "channel";
export type Destinazione = { tipo: TipoContenitore; id: string; home?: string | null };

export function FormCollocazione({
  codice,
  d,
  schedaId,
  iniziale,
  fisso,
  onFatto,
  onAnnulla,
}: {
  codice: string;
  d: QuadroCms;
  /** Scheda già scelta (dal pannello Contenuti); altrimenti la si sceglie qui. */
  schedaId?: string;
  iniziale?: CollocazioneCms | null;
  /** Contenitore già deciso (dal pannello Palinsesto o Caroselli). */
  fisso?: Destinazione;
  onFatto?: () => void;
  onAnnulla?: () => void;
}) {
  const tipo0: TipoContenitore = iniziale ? (iniziale.playlist ? "playlist" : iniziale.carosello ? "carosello" : "channel") : (fisso?.tipo ?? "carosello");
  const [scheda, setScheda] = useState(iniziale?.schedaId ?? schedaId ?? "");
  const [tipo, setTipo] = useState<TipoContenitore>(tipo0);
  const [dove, setDove] = useState(iniziale ? (iniziale.playlist ?? iniziale.carosello ?? iniziale.channel ?? "") : (fisso?.id ?? ""));
  const [home, setHome] = useState<string>(iniziale?.home ?? fisso?.home ?? "");
  const [passaggi, setPassaggi] = useState(iniziale?.passaggi ?? 1);
  const [inizio, setInizio] = useState(iniziale?.inizio ?? "");
  const [fine, setFine] = useState(iniziale?.fine ?? "");
  const [rip, setRip] = useState<CollocazioneCms["ripetizione"]>(iniziale?.ripetizione ?? { tipo: "sempre", giorni: [], dalle: null, alle: null });
  const [stato, setStato] = useState<"attivo" | "sospeso">(iniziale?.stato ?? "attivo");
  const [esito, setEsito] = useState<EsitoAzione>(null);
  const salva = useSalvaCollocazioneCms();
  const scelte =
    tipo === "carosello"
      ? d.caroselli.map((k) => ({ id: k.id, nome: `${k.nome}${k.stato !== "attivo" ? ` (${k.stato})` : ""}` }))
      : tipo === "playlist"
        ? d.playlist.map((p) => ({ id: p.id, nome: `${p.nome}${p.stato !== "attivo" ? ` (${p.stato})` : ""}` }))
        : d.canali.map((c) => ({ id: c.slug, nome: `${c.nome} · ${c.slug}` }));

  const invia = () =>
    conEsito(
      salva.mutateAsync({
        codice,
        collocazione: {
          id: iniziale?.id,
          schedaId: scheda,
          home: tipo === "carosello" && home ? home : null,
          carosello: tipo === "carosello" ? dove || null : null,
          playlist: tipo === "playlist" ? dove || null : null,
          channel: tipo === "channel" ? dove || null : null,
          passaggi,
          inizio: inizio || null,
          fine: fine || null,
          ripetizione: rip,
          stato,
        },
      }),
      setEsito,
    ).then((r) => r && onFatto?.());

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-white/15 bg-black p-3" data-testid="form-collocazione">
      {!schedaId && (
        <label className={etichetta}>
          Scheda (contenuto già salvato: nessun doppione)
          <select className={inp} value={scheda} onChange={(e) => setScheda(e.target.value)} data-testid="coll-scheda">
            <option value="">— scegli —</option>
            {d.schede.map((s) => (
              <option key={s.id} value={s.id}>
                {s.titolo} ({s.stato})
              </option>
            ))}
          </select>
        </label>
      )}
      <div className="grid gap-2 sm:grid-cols-3">
        <label className={etichetta}>
          Dove compare
          <select
            className={inp}
            value={tipo}
            disabled={!!fisso && !iniziale}
            onChange={(e) => {
              setTipo(e.target.value as TipoContenitore);
              setDove("");
            }}
            data-testid="coll-tipo"
          >
            <option value="carosello">Carosello</option>
            <option value="playlist">Playlist (palinsesto)</option>
            <option value="channel">Pagina di un Channel</option>
          </select>
        </label>
        <label className={etichetta}>
          {tipo === "carosello" ? "Carosello" : tipo === "playlist" ? "Playlist" : "Channel"}
          <select className={inp} value={dove} disabled={!!fisso && !iniziale} onChange={(e) => setDove(e.target.value)} data-testid="coll-dove">
            <option value="">— scegli —</option>
            {scelte.map((s) => (
              <option key={s.id} value={s.id}>
                {s.nome}
              </option>
            ))}
          </select>
        </label>
        {tipo === "carosello" ? (
          <label className={etichetta}>
            In quale Home
            <select className={inp} value={home} onChange={(e) => setHome(e.target.value)} data-testid="coll-home">
              <option value="">Tutte le Home che mostrano il carosello</option>
              {d.homes.map((h) => (
                <option key={h.slug} value={h.slug}>
                  Solo {h.nome}
                </option>
              ))}
            </select>
          </label>
        ) : (
          <label className={etichetta}>
            Passaggi per giro (ripetizioni nella playlist)
            <input className={inp} type="number" min={1} max={20} value={passaggi} onChange={(e) => setPassaggi(Math.max(1, Math.min(20, Number(e.target.value) || 1)))} data-testid="coll-passaggi" />
          </label>
        )}
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        <label className={etichetta}>
          Inizio (vuoto = da subito) · ora di Roma
          <input className={inp} type="datetime-local" value={inizio} onChange={(e) => setInizio(e.target.value.slice(0, 16))} data-testid="coll-inizio" />
        </label>
        <label className={etichetta}>
          Fine / scadenza (vuoto = senza scadenza)
          <input className={inp} type="datetime-local" value={fine} onChange={(e) => setFine(e.target.value.slice(0, 16))} data-testid="coll-fine" />
        </label>
      </div>
      <div className="flex flex-wrap items-end gap-2">
        <label className={etichetta}>
          Ripetizione
          <select className={inp} value={rip.tipo} onChange={(e) => setRip({ ...rip, tipo: e.target.value as typeof rip.tipo })} data-testid="coll-ripetizione">
            <option value="sempre">Sempre (24 ore su 24)</option>
            <option value="giornaliera">Ogni giorno in una fascia oraria</option>
            <option value="settimanale">Giorni della settimana</option>
          </select>
        </label>
        {rip.tipo === "settimanale" && (
          <div className="flex flex-wrap gap-1">
            {GIORNI.map((g, i) => {
              const on = rip.giorni.includes(i + 1);
              return (
                <button
                  key={g}
                  type="button"
                  className={btn}
                  style={on ? { borderColor: FLUO, color: FLUO } : undefined}
                  onClick={() => setRip({ ...rip, giorni: on ? rip.giorni.filter((x) => x !== i + 1) : [...rip.giorni, i + 1] })}
                >
                  {g}
                </button>
              );
            })}
          </div>
        )}
        {rip.tipo !== "sempre" && (
          <>
            <label className={etichetta}>
              Dalle
              <input className={inp} type="time" value={rip.dalle ?? ""} onChange={(e) => setRip({ ...rip, dalle: e.target.value || null })} />
            </label>
            <label className={etichetta}>
              Alle
              <input className={inp} type="time" value={rip.alle ?? ""} onChange={(e) => setRip({ ...rip, alle: e.target.value || null })} />
            </label>
          </>
        )}
        <label className={etichetta}>
          Stato della posizione
          <select className={inp} value={stato} onChange={(e) => setStato(e.target.value as "attivo" | "sospeso")} data-testid="coll-stato">
            <option value="attivo">Attiva</option>
            <option value="sospeso">Sospesa</option>
          </select>
        </label>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <button type="button" className={btnPieno} style={{ background: FLUO }} disabled={!scheda || !dove || salva.isPending} onClick={invia} data-testid="coll-salva">
          {salva.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />} {iniziale ? "Salva la posizione" : "Aggiungi la posizione"}
        </button>
        {onAnnulla && (
          <button type="button" className={btn} onClick={onAnnulla}>
            Annulla
          </button>
        )}
      </div>
      <Esito e={esito} testid="esito-collocazione" />
    </div>
  );
}

/* ── elenco ordinabile di un contenitore ──────────────────────────────────── */

export function ElencoPosizioni({
  codice,
  d,
  filtro,
  vuoto,
  mostraContenitore = false,
  testid,
}: {
  codice: string;
  d: QuadroCms;
  filtro: (c: CollocazioneCms) => boolean;
  vuoto: string;
  mostraContenitore?: boolean;
  testid?: string;
}) {
  const [modifica, setModifica] = useState<string | null>(null);
  const [esito, setEsito] = useState<EsitoAzione>(null);
  const ordina = useOrdinaCollocazioniCms();
  const elimina = useEliminaCollocazioneCms();
  const voci = d.collocazioni.filter(filtro).sort((a, b) => a.posizione - b.posizione || a.aggiornato - b.aggiornato);
  const chiave = (c: CollocazioneCms) => `${c.home ?? "*"}|${c.channel ?? ""}|${c.carosello ?? ""}|${c.playlist ?? ""}`;
  /** ↑/↓ dentro lo STESSO contenitore (carosello, playlist o Channel). */
  const sposta = (c: CollocazioneCms, verso: -1 | 1) => {
    const stessi = d.collocazioni.filter((x) => chiave(x) === chiave(c)).sort((a, b) => a.posizione - b.posizione || a.aggiornato - b.aggiornato);
    const ids = stessi.map((x) => x.id);
    const k = ids.indexOf(c.id);
    const j = k + verso;
    if (k < 0 || j < 0 || j >= ids.length) return;
    [ids[k], ids[j]] = [ids[j]!, ids[k]!];
    void conEsito(ordina.mutateAsync({ codice, ids }), setEsito);
  };
  if (!voci.length) return <p className="text-xs text-white/50">{vuoto}</p>;
  return (
    <div className="flex flex-col gap-2" data-testid={testid}>
      <ol className="flex flex-col gap-2">
        {voci.map((c, n) => {
          const s = d.schede.find((x) => x.id === c.schedaId);
          const img = s?.immagine?.url ?? (s?.video?.piattaforma === "youtube" && s.video.embedId ? `https://i.ytimg.com/vi/${s.video.embedId}/mqdefault.jpg` : null);
          return (
            <li key={c.id} className="flex flex-col gap-2 rounded-xl border border-white/10 p-2" data-testid="riga-posizione">
              <div className="flex flex-wrap items-center gap-2">
                <span className="w-6 text-center text-xs font-black text-white/50">{n + 1}</span>
                {img ? <img src={img} alt="" className="h-10 w-16 rounded object-cover" loading="lazy" /> : <span className="h-10 w-16 rounded bg-white/5" />}
                <div className="min-w-[160px] flex-1">
                  <p className="truncate text-sm font-bold">{s?.titolo ?? "(scheda rimossa)"}</p>
                  <p className="truncate text-[11px] text-white/55">
                    {mostraContenitore ? `${nomeContenitore(c, d)} · ` : ""}
                    {descriviProgrammazione(c)}
                  </p>
                </div>
                {s && <BadgeStato s={s.stato} />}
                <BadgeProgramma p={c.programma} />
                <button type="button" className={btn} aria-label="Su" disabled={ordina.isPending} onClick={() => sposta(c, -1)}>
                  <ArrowUp className="h-3.5 w-3.5" />
                </button>
                <button type="button" className={btn} aria-label="Giù" disabled={ordina.isPending} onClick={() => sposta(c, 1)}>
                  <ArrowDown className="h-3.5 w-3.5" />
                </button>
                <button type="button" className={btn} onClick={() => setModifica(modifica === c.id ? null : c.id)}>
                  <Pencil className="h-3.5 w-3.5" /> Modifica
                </button>
                <button
                  type="button"
                  className={btn}
                  disabled={elimina.isPending}
                  onClick={() => window.confirm("Togliere il contenuto da questa posizione? La scheda resta salvata.") && void conEsito(elimina.mutateAsync({ codice, id: c.id }), setEsito)}
                >
                  <Trash2 className="h-3.5 w-3.5" /> Togli
                </button>
              </div>
              {modifica === c.id && <FormCollocazione codice={codice} d={d} schedaId={c.schedaId} iniziale={c} onFatto={() => setModifica(null)} onAnnulla={() => setModifica(null)} />}
            </li>
          );
        })}
      </ol>
      <Esito e={esito} />
    </div>
  );
}

export function AggiungiPosizione({ codice, d, schedaId, fisso, testo = "Aggiungi una posizione" }: { codice: string; d: QuadroCms; schedaId?: string; fisso?: Destinazione; testo?: string }) {
  const [aperto, setAperto] = useState(false);
  return aperto ? (
    <FormCollocazione codice={codice} d={d} schedaId={schedaId} fisso={fisso} onFatto={() => setAperto(false)} onAnnulla={() => setAperto(false)} />
  ) : (
    <button type="button" className={`${btn} w-fit`} onClick={() => setAperto(true)} data-testid="aggiungi-posizione">
      <Plus className="h-3.5 w-3.5" /> {testo}
    </button>
  );
}
