import { useEffect, useState } from "react";
import { Link } from "wouter";
import { ArrowDown, ArrowLeft, ArrowUp, Loader2, Lock, RefreshCw, Trash2 } from "lucide-react";
import { SbloccoAllestimento, useCodiceAllestimento } from "../components/media-slot";
import { useImpostaRotazione, useImpostazioniMonitor } from "../queries/monitor";
import {
  useAggiornaContenuto,
  useAggiungiContenuto,
  useAggiungiFascia,
  useAttivaFascia,
  useDettaglioChannelAdmin,
  useEliminaContenuto,
  useEliminaFascia,
  useImpostaHome,
  useImportaDaStaging,
  useImpostazioniChannel,
  useOrdinaContenuti,
  useQuadroChannelAdmin,
  useSincronizzaChannel,
  type ImpostazioniChannel,
  type NuovaFasciaChannel,
  type NuovoContenutoChannel,
} from "../queries/channel";
import { useCaroselliHome, useConteggiCaroselli } from "../queries/caroselli";
import { useImpostaExtraChannel, useImpostaSchedaChannel, useRegistroChannel } from "../queries/channel-registro";
import { percorsoPlayer } from "../components/card-channel";

/**
 * /allestimento/channel — pannello riservato dei palinsesti dei 28 Channel.
 * Senza codice: contenuti, ordine, durata, frequenza, spot, modalità e fasce orarie.
 * Le righe automatiche arrivano solo dalle fonti verificate; si spengono, non si eliminano.
 * TOUCH TV e TOUCH RADIO restano sul palinsesto condiviso (/allestimento/canali-touch).
 */

const GIALLO = "#d7ff00";
const CAMPO = "w-full rounded-xl border border-white/15 bg-black/50 px-3 py-2 text-sm outline-none focus:border-[#d7ff00]";
/* 28/10/2026 (round 14) — tipi di contenuto della Regia: video, immagini e spot (più i tipi di sempre). */
const TIPI_CONTENUTO: { v: NuovoContenutoChannel["tipo"]; t: string }[] = [
  { v: "video", t: "Video" },
  { v: "immagine", t: "Immagine (a tempo)" },
  { v: "spot", t: "Spot" },
  { v: "audio", t: "Audio" },
  { v: "scheda", t: "Scheda (a tempo)" },
  { v: "annuncio", t: "Annuncio (a tempo)" },
  { v: "film", t: "Film" },
];
const GIORNI = ["Tutti i giorni", "Lunedì", "Martedì", "Mercoledì", "Giovedì", "Venerdì", "Sabato", "Domenica"];
const MODALITA: { v: ImpostazioniChannel["modalita"]; t: string }[] = [
  { v: "auto", t: "Automatica (stato vero calcolato)" },
  { v: "diretta", t: "Diretta (solo se una diretta è in corso)" },
  { v: "replica", t: "Replica" },
  { v: "playlist", t: "Playlist automatica" },
  { v: "commerciale", t: "Palinsesto B · commerciale H24 (spot e materiali disponibili)" },
  { v: "allestimento", t: "In allestimento (spento)" },
];

function errore(e: unknown) {
  if (!(e instanceof Error)) return "Operazione non riuscita.";
  /* 29/10/2026 (round 15): il messaggio tecnico della validazione diventa una frase comprensibile. */
  if (e.message === "Input validation failed")
    return "Dato non valido: controlla e-mail (nome@dominio.it), link (devono iniziare con https://) e numeri di telefono.";
  return e.message;
}

const NOME_AMBITO: Record<string, string> = {
  staging: "STAGING · ANTEPRIMA",
  produzione: "PRODUZIONE · WWW.TBH-WEB.COM",
  collaudo: "COLLAUDO LOCALE",
};

type QuadroAdmin = NonNullable<ReturnType<typeof useQuadroChannelAdmin>["data"]>;

/** Interruttore della home di QUESTO ambito + importazione dallo staging (solo produzione). */
function SezioneHome({ codice, d }: { codice: string; d: QuadroAdmin }) {
  const imposta = useImpostaHome();
  const importa = useImportaDaStaging();
  const canale0 = d.home === "canale0";
  const tbh3 = d.home === "tbh3";
  const NOMI_HOME: Record<string, string> = {
    classica: "HOME PRECEDENTE (invariata)",
    canale0: "HOME «CANALE 0»",
    tbh3: "HOME TBH · 5 SEZIONI CHANNEL",
  };
  const cambia = (attiva: "classica" | "canale0" | "tbh3") => {
    const testo =
      attiva === "classica"
        ? `Ripristinare SUBITO la home precedente su / nell'ambito ${NOME_AMBITO[d.ambiente]}?`
        : `Mostrare la ${NOMI_HOME[attiva]} su / nell'ambito ${NOME_AMBITO[d.ambiente]}?`;
    if (window.confirm(testo)) imposta.mutate({ codice, attiva });
  };
  return (
    <section className="tbh-card flex flex-col gap-3 p-5" data-testid="sezione-home">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="tbh-display tbh-h3">Home del sito ( / )</h2>
        <span className="rounded-full border px-3 py-1 text-[10px] font-extrabold tracking-[0.16em]" style={{ borderColor: GIALLO, color: GIALLO }}>
          AMBITO: {NOME_AMBITO[d.ambiente] ?? d.ambiente}
        </span>
      </div>
      <p className="text-sm text-[var(--tbh-muted)]">
        In questo ambito <b className="text-white">/</b> mostra:{" "}
        <b className="text-white" data-testid="home-attiva">{NOMI_HOME[d.home] ?? d.home}</b>. Il cambio vale
        solo per questo ambito: l'anteprima non tocca il sito pubblico. Il ripristino è immediato, senza nuova pubblicazione.
      </p>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={canale0 || imposta.isPending}
          onClick={() => cambia("canale0")}
          className="rounded-full px-4 py-2 text-xs font-extrabold tracking-[0.12em] text-black disabled:opacity-40"
          style={{ background: GIALLO }}
        >
          ATTIVA CANALE 0 SU /
        </button>
        <button
          type="button"
          disabled={tbh3 || imposta.isPending}
          onClick={() => cambia("tbh3")}
          className="rounded-full px-4 py-2 text-xs font-extrabold tracking-[0.12em] text-black disabled:opacity-40"
          style={{ background: GIALLO }}
          data-testid="attiva-tbh3"
        >
          ATTIVA HOME TBH (5 SEZIONI) SU /
        </button>
        <button
          type="button"
          disabled={(!canale0 && !tbh3) || imposta.isPending}
          onClick={() => cambia("classica")}
          className="rounded-full border border-white/30 px-4 py-2 text-xs font-extrabold tracking-[0.12em] text-white disabled:opacity-40"
        >
          RIPRISTINA HOME PRECEDENTE
        </button>
        <Link href="/check-web/home-ordine" className="rounded-full border border-white/15 px-4 py-2 text-xs font-bold text-[var(--tbh-muted)] hover:text-white">
          Anteprima /check-web/home-ordine
        </Link>
        <Link href="/channel" className="rounded-full border border-white/15 px-4 py-2 text-xs font-bold text-[var(--tbh-muted)] hover:text-white">
          Anteprima /channel (5 sezioni)
        </Link>
      </div>
      {imposta.isError && <p className="text-sm text-[#ff8a8a]">{errore(imposta.error)}</p>}
      {d.storicoHome.length > 0 && (
        <ul className="text-xs text-[var(--tbh-muted)]">
          {d.storicoHome.slice(0, 5).map((v) => (
            <li key={v.quando}>
              {new Date(v.quando).toLocaleString("it-IT", { timeZone: "Europe/Rome" })} · {v.da} → {v.a}
            </li>
          ))}
        </ul>
      )}
      {d.ambiente !== "staging" && (
        <div className="flex flex-wrap items-center gap-3 border-t border-white/10 pt-3">
          <button
            type="button"
            disabled={importa.isPending}
            onClick={() => window.confirm("Copiare qui le impostazioni collaudate nello staging? Lo staging resta intatto.") && importa.mutate({ codice })}
            className="rounded-full border border-white/30 px-4 py-2 text-xs font-extrabold tracking-[0.12em] text-white disabled:opacity-40"
          >
            IMPORTA IMPOSTAZIONI DALLO STAGING
          </button>
          {importa.data && (
            <span className="text-xs text-[var(--tbh-muted)]">
              Importate: {importa.data.impostazioni} impostazioni, {importa.data.fasce} fasce, {importa.data.aggiornati} contenuti aggiornati,{" "}
              {importa.data.aggiunti} aggiunti.
            </span>
          )}
          {importa.isError && <span className="text-sm text-[#ff8a8a]">{errore(importa.error)}</span>}
        </div>
      )}
    </section>
  );
}

/** Passaggi giornalieri dei 4 caroselli di CANALE 0: viste e clic per scheda, solo per QUESTO ambito. */
function SezioneCaroselli({ codice }: { codice: string }) {
  const [giorni, setGiorni] = useState(14);
  const conteggi = useConteggiCaroselli(codice, giorni);
  const vivi = useCaroselliHome();
  const [giorno, setGiorno] = useState<string | null>(null);
  const c = conteggi.data;
  const nomi = new Map<string, string>();
  for (const k of vivi.data?.caroselli ?? []) for (const s of k.schede) nomi.set(`${k.slug}|${s.id}`, s.titolo);
  const scelto = giorno ?? c?.giorni[0]?.giorno ?? null;
  const righe = (c?.righe ?? []).filter((r) => r.giorno === scelto);
  const fmt = (g: string) => new Date(`${g}T12:00:00`).toLocaleDateString("it-IT", { weekday: "short", day: "2-digit", month: "2-digit" });
  return (
    <section className="tbh-card flex flex-col gap-3 p-5" data-testid="sezione-caroselli">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="tbh-display tbh-h3">Caroselli di CANALE 0 · passaggi giornalieri</h2>
        <div className="flex items-center gap-2">
          {c && (
            <span className="rounded-full border px-3 py-1 text-[10px] font-extrabold tracking-[0.16em]" style={{ borderColor: GIALLO, color: GIALLO }}>
              AMBITO: {NOME_AMBITO[c.ambito] ?? c.ambito}
            </span>
          )}
          <select value={giorni} onChange={(e) => setGiorni(Number(e.target.value))} className="rounded-full border border-white/15 bg-black px-3 py-1 text-xs">
            {[7, 14, 30, 90].map((n) => (
              <option key={n} value={n}>
                ultimi {n} giorni
              </option>
            ))}
          </select>
        </div>
      </div>
      <p className="text-xs text-[var(--tbh-muted)]">
        Vista = scheda visibile almeno a metà per 1 secondo (una volta per pagina). Clic = pressione del pulsante. Una sola riga per sessione, scheda e
        giorno; i robot sono esclusi. Gli spot dei Channel restano nel rendiconto di{" "}
        <Link href="/allestimento/canali-touch" className="underline">
          /allestimento/canali-touch
        </Link>
        .
      </p>
      {conteggi.isLoading && (
        <p className="inline-flex items-center gap-2 text-sm text-[var(--tbh-muted)]">
          <Loader2 className="h-4 w-4 animate-spin" /> Carico…
        </p>
      )}
      {conteggi.isError && <p className="text-sm text-[#ff8a8a]">{errore(conteggi.error)}</p>}
      {c && c.giorni.length === 0 && <p className="text-sm text-[var(--tbh-muted)]">Nessun passaggio registrato dal {fmt(c.dal)} al {fmt(c.al)}.</p>}
      {c && c.giorni.length > 0 && (
        <>
          <div className="flex flex-wrap gap-2">
            {c.giorni.map((g) => (
              <button
                key={g.giorno}
                type="button"
                onClick={() => setGiorno(g.giorno)}
                className="rounded-xl border px-3 py-2 text-left text-xs"
                style={g.giorno === scelto ? { borderColor: GIALLO, color: GIALLO } : { borderColor: "rgba(255,255,255,0.15)" }}
              >
                <b className="block uppercase">{fmt(g.giorno)}</b>
                {g.viste} viste · {g.clic} clic
              </button>
            ))}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-white/10 text-[var(--tbh-muted)]">
                  <th className="py-2 pr-3">Carosello</th>
                  <th className="py-2 pr-3">Scheda</th>
                  <th className="py-2 pr-3 text-right">Viste</th>
                  <th className="py-2 pr-3 text-right">Clic</th>
                  <th className="py-2 text-right">Clic/viste</th>
                </tr>
              </thead>
              <tbody>
                {righe.map((r) => (
                  <tr key={`${r.carosello}|${r.scheda}`} className="border-b border-white/5">
                    <td className="py-1.5 pr-3 font-bold">{c.titoli[r.carosello] ?? r.carosello}</td>
                    <td className="py-1.5 pr-3">
                      {nomi.get(`${r.carosello}|${r.scheda}`) ?? r.scheda}
                      <span className="ml-2 text-[10px] text-[var(--tbh-muted)]">{r.scheda}</span>
                    </td>
                    <td className="py-1.5 pr-3 text-right">{r.viste}</td>
                    <td className="py-1.5 pr-3 text-right">{r.clic}</td>
                    <td className="py-1.5 text-right">{r.viste > 0 ? `${Math.round((r.clic / r.viste) * 100)}%` : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </section>
  );
}

function durata(sec: number | null) {
  if (!sec) return "—";
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  return h ? `${h}h ${String(m).padStart(2, "0")}'` : `${m}' ${String(s).padStart(2, "0")}"`;
}

/** 28/10/2026 — durata di ogni immagine nei monitor a rotazione (home, Channel, Touch Cinema). */
function SezioneRotazioneMonitor({ codice }: { codice: string }) {
  const q = useImpostazioniMonitor();
  const salva = useImpostaRotazione();
  const [valore, setValore] = useState<string>("");
  const attuale = q.data?.rotazioneSec ?? 8;
  const n = Number(valore || attuale);
  const valido = Number.isInteger(n) && n >= 3 && n <= 120;
  return (
    <section className="tbh-card flex flex-col gap-3 p-5" data-testid="pannello-rotazione-monitor">
      <h2 className="tbh-display tbh-h3">Rotazione dei monitor</h2>
      <p className="text-xs text-[var(--tbh-muted)]">
        Secondi per ogni immagine, locandina o miniatura nei monitor (predefinito {q.data?.predefinita ?? 8} s). Il video parte solo con Play e
        sospende la rotazione di quel monitor; alla fine riprende dal contenuto successivo.
      </p>
      <div className="flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-2 text-sm text-white">
          Secondi
          <input
            type="number"
            min={3}
            max={120}
            step={1}
            value={valore === "" ? String(attuale) : valore}
            onChange={(e) => setValore(e.target.value)}
            className="w-24 rounded-lg border border-white/15 bg-black px-3 py-2 text-sm text-white focus:border-[#d7ff00] focus:outline-none"
            data-testid="rotazione-secondi"
          />
        </label>
        <button
          type="button"
          disabled={!valido || salva.isPending || n === attuale}
          onClick={() => salva.mutate({ codice, rotazioneSec: n }, { onSuccess: () => setValore("") })}
          className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-extrabold tracking-[0.12em] text-black disabled:opacity-50"
          style={{ background: GIALLO }}
        >
          SALVA
        </button>
        <span className="text-xs text-[var(--tbh-muted)]">
          {salva.isError ? errore(salva.error) : salva.isSuccess ? "Salvato." : `Attuale: ${attuale} s${q.data ? ` · ambito ${q.data.ambiente}` : ""}`}
        </span>
      </div>
      {!valido && <p className="text-xs text-[#ff8a8a]">Valore ammesso: un numero intero da 3 a 120.</p>}
    </section>
  );
}

export default function PannelloChannelPage() {
  const { codice } = useCodiceAllestimento();
  const quadro = useQuadroChannelAdmin(codice);
  const sync = useSincronizzaChannel();
  const [scelto, setScelto] = useState<string | null>(null);

  if (!codice) {
    return (
      <div className="mx-auto flex max-w-[900px] flex-col gap-5 px-4 py-10">
        <h1 className="tbh-display tbh-h2 flex items-center gap-3" style={{ color: GIALLO }}>
          <Lock className="h-6 w-6" /> Palinsesti dei 28 Channel
        </h1>
        <p className="text-sm text-[var(--tbh-muted)]">Area riservata: serve il codice di allestimento.</p>
        <SbloccoAllestimento />
      </div>
    );
  }

  const d = quadro.data;
  const corrente = d?.channel.find((c) => c.slug === scelto) ?? null;

  return (
    <div className="mx-auto flex max-w-[1400px] flex-col gap-8 px-4 py-8 md:px-8" data-testid="pannello-channel">
      <Link href="/allestimento" className="inline-flex w-fit items-center gap-1.5 text-sm text-[var(--tbh-muted)] hover:text-white">
        <ArrowLeft className="h-4 w-4" /> Pannello di allestimento
      </Link>
      <header className="flex flex-col gap-2">
        <h1 className="tbh-display tbh-h1 leading-[0.95]" style={{ color: GIALLO }}>
          PALINSESTI CHANNEL
        </h1>
        <p className="max-w-3xl text-sm text-[var(--tbh-muted)]">
          Ogni Channel ha il suo archivio e la sua playlist. I contenuti automatici arrivano solo dalle fonti verificate
          qui sotto, senza doppioni; quelli che spariscono dalla fonte si spengono. Lo stato (Diretta, Replica, Playlist
          automatica, In allestimento) è quello vero del momento. TOUCH TV e TOUCH RADIO condividono il palinsesto: si
          gestiscono da{" "}
          <Link href="/allestimento/canali-touch" className="underline hover:text-white">
            /allestimento/canali-touch
          </Link>
          .
        </p>
      </header>

      {quadro.isError && <p className="text-sm text-[#ff8a8a]">{errore(quadro.error)}</p>}
      {quadro.isLoading && (
        <p className="inline-flex items-center gap-2 text-sm text-[var(--tbh-muted)]">
          <Loader2 className="h-4 w-4 animate-spin" /> Carico…
        </p>
      )}

      {d && (
        <>
          <SezioneHome codice={codice} d={d} />
          <SezioneCaroselli codice={codice} />
          <SezioneRotazioneMonitor codice={codice} />
          <section className="tbh-card flex flex-col gap-3 p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="tbh-display tbh-h3">Fonti verificate</h2>
              <button
                type="button"
                onClick={() => sync.mutate({ codice })}
                disabled={sync.isPending}
                className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-extrabold tracking-[0.12em] text-black disabled:opacity-50"
                style={{ background: GIALLO }}
              >
                <RefreshCw className={`h-4 w-4 ${sync.isPending ? "animate-spin" : ""}`} /> SINCRONIZZA ORA
              </button>
            </div>
            <ul className="grid gap-2 text-xs text-[var(--tbh-muted)] md:grid-cols-2">
              {Object.entries(d.fonti).map(([k, f]) => (
                <li key={k} className="rounded-lg bg-white/[0.03] px-3 py-2">
                  <b className="text-white">{f.nome}</b> — {f.perche}
                </li>
              ))}
            </ul>
            <p className="text-xs text-[var(--tbh-muted)]">
              Ultima sincronizzazione: {d.sync ? new Date(d.sync.quando).toLocaleString("it-IT", { timeZone: "Europe/Rome" }) : "mai"} · automatica ogni 30 minuti.
              {sync.data && ` Ora: ${sync.data.reduce((n, e) => n + e.nuovi, 0)} nuovi, ${sync.data.reduce((n, e) => n + e.spenti, 0)} spenti.`}
            </p>
            {sync.isError && <p className="text-sm text-[#ff8a8a]">{errore(sync.error)}</p>}
            {d.sync?.esiti.some((e) => e.errore) && (
              <p className="text-xs text-[#ff8a8a]">
                Fonti con errore: {d.sync.esiti.filter((e) => e.errore).map((e) => `${e.channel} (${e.errore})`).join(" · ")}
              </p>
            )}
          </section>

          <section className="tbh-card overflow-x-auto p-0">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="text-[10px] uppercase tracking-[0.16em] text-[var(--tbh-muted)]">
                <tr className="border-b border-white/10">
                  <th className="px-4 py-3">Fila</th>
                  <th className="px-4 py-3">Channel</th>
                  <th className="px-4 py-3">Stato ora</th>
                  <th className="px-4 py-3">Contenuti attivi / archivio</th>
                  <th className="px-4 py-3">Modalità</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {d.channel.map((c) => (
                  <tr key={c.slug} className={`border-b border-white/5 ${scelto === c.slug ? "bg-[#d7ff00]/[0.06]" : ""}`}>
                    <td className="px-4 py-2 text-[var(--tbh-muted)]">{c.fila ?? (c as { sezione?: string }).sezione ?? "—"}</td>
                    <td className="px-4 py-2 font-bold text-white">
                      {c.titolo}
                      {c.mediaPartnerEsterno && <span className="ml-2 text-[10px] font-extrabold text-[#ff2b2b]">MEDIA PARTNER ESTERNO</span>}
                    </td>
                    <td className="px-4 py-2 text-xs">{c.stato}</td>
                    <td className="px-4 py-2 text-xs">
                      {c.contenutiAttivi} / {c.totali}
                    </td>
                    <td className="px-4 py-2 text-xs text-[var(--tbh-muted)]">{c.impostazioni.modalita}</td>
                    <td className="px-4 py-2 text-right">
                      {c.slug === "touch-tv" || c.slug === "touch-radio" ? (
                        <Link href="/allestimento/canali-touch" className="text-xs underline">
                          condiviso
                        </Link>
                      ) : (
                        <button type="button" className="text-xs font-bold underline" onClick={() => setScelto(c.slug)}>
                          GESTISCI
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          {corrente && <DettaglioChannel key={corrente.slug} codice={codice} slug={corrente.slug} titolo={corrente.titolo} />}
        </>
      )}
    </div>
  );
}

function DettaglioChannel({ codice, slug, titolo }: { codice: string; slug: string; titolo: string }) {
  const det = useDettaglioChannelAdmin(codice, slug);
  const salva = useImpostazioniChannel();
  const aggiorna = useAggiornaContenuto();
  const ordina = useOrdinaContenuti();
  const aggiungi = useAggiungiContenuto();
  const elimina = useEliminaContenuto();
  const nuovaFascia = useAggiungiFascia();
  const attivaFascia = useAttivaFascia();
  const eliminaFascia = useEliminaFascia();

  const [imp, setImp] = useState<ImpostazioniChannel | null>(null);
  useEffect(() => {
    if (det.data && !imp) setImp(det.data.impostazioni);
  }, [det.data, imp]);

  const vuoto: NuovoContenutoChannel = { codice, slug, tipo: "video", titolo: "", sorgente: "", link: null, durataSec: null, attribuzione: null };
  const [nuovo, setNuovo] = useState<NuovoContenutoChannel>(vuoto);
  const fasciaVuota: NuovaFasciaChannel = { codice, slug, giorno: null, ora: "20:00", durataMin: 60, modalita: "playlist", titolo: "", sorgente: null };
  const [fascia, setFascia] = useState<NuovaFasciaChannel>(fasciaVuota);

  const contenuti = det.data?.contenuti ?? [];
  const sposta = (i: number, verso: -1 | 1) => {
    const ids = contenuti.map((c) => c.id);
    const j = i + verso;
    if (j < 0 || j >= ids.length) return;
    [ids[i], ids[j]] = [ids[j]!, ids[i]!];
    ordina.mutate({ codice, slug, ids });
  };

  const errori = [salva, aggiorna, ordina, aggiungi, elimina, nuovaFascia, attivaFascia, eliminaFascia].filter((m) => m.isError);

  return (
    <section className="flex flex-col gap-6" data-testid={`dettaglio-${slug}`}>
      <h2 className="tbh-display tbh-h2" style={{ color: GIALLO }}>
        {titolo}
      </h2>
      {det.isLoading && <Loader2 className="h-5 w-5 animate-spin" />}
      {errori.map((m, i) => (
        <p key={i} className="text-sm text-[#ff8a8a]">
          {errore(m.error)}
        </p>
      ))}

      {imp && (
        <div className="tbh-card grid gap-4 p-5 md:grid-cols-3">
          <label className="flex flex-col gap-1 text-xs">
            Modalità
            <select className={CAMPO} value={imp.modalita} onChange={(e) => setImp({ ...imp, modalita: e.target.value as ImpostazioniChannel["modalita"] })}>
              {MODALITA.map((m) => (
                <option key={m.v} value={m.v}>
                  {m.t}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-xs">
            Uno spot interno ogni N contenuti (0 = nessuno)
            <input type="number" min={0} max={50} className={CAMPO} value={imp.spotOgni} onChange={(e) => setImp({ ...imp, spotOgni: Number(e.target.value) || 0 })} />
          </label>
          <label className="flex flex-col gap-1 text-xs">
            Secondi a schermo per scheda / annuncio
            <input type="number" min={5} max={600} className={CAMPO} value={imp.durataScheda} onChange={(e) => setImp({ ...imp, durataScheda: Number(e.target.value) || 20 })} />
          </label>
          {(
            [
              ["casuale", "Rotazione casuale (diversa ogni giorno)"],
              ["repliche", "Repliche: a fine playlist si ricomincia"],
              ["aggiornamentoAuto", "Aggiornamento automatico dalle fonti verificate"],
            ] as const
          ).map(([k, t]) => (
            <label key={k} className="flex items-center gap-2 text-xs">
              <input type="checkbox" checked={imp[k]} onChange={(e) => setImp({ ...imp, [k]: e.target.checked })} /> {t}
            </label>
          ))}
          <button
            type="button"
            disabled={salva.isPending}
            onClick={() => salva.mutate({ codice, slug, valori: imp })}
            className="w-fit rounded-full px-4 py-2 text-xs font-extrabold tracking-[0.12em] text-black disabled:opacity-50"
            style={{ background: GIALLO }}
          >
            SALVA IMPOSTAZIONI
          </button>
        </div>
      )}

      {/* LOGO · SITO · COLLEGAMENTI (round 14, chiave condivisa cms_v1:canali) */}
      <ExtraChannel codice={codice} slug={slug} />

      {/* 29/10/2026 (round 15) — SCHEDA INFORMATIVA: separata dal palinsesto (sotto) */}
      <SchedaInformativaRegia codice={codice} slug={slug} />

      <h3 className="tbh-display tbh-h3 -mb-3 mt-2" style={{ color: GIALLO }} data-testid="titolo-palinsesto-regia">
        PALINSESTO · contenuti in onda (URL video / immagini / spot, durata, ordine)
      </h3>

      {/* PLAYLIST */}
      <div className="tbh-card flex flex-col gap-3 p-5">
        <h3 className="tbh-display tbh-h3">
          Archivio e playlist · {contenuti.length} contenuti · sequenza di oggi {det.data?.lunghezza ?? 0} passaggi
        </h3>
        {!contenuti.length && (
          <p className="text-sm text-[var(--tbh-muted)]">Nessun contenuto: sul sito il monitor e il player mostrano «PALINSESTO IN PREPARAZIONE».</p>
        )}
        <p className="text-[11px] text-[var(--tbh-muted)]">
          Ordine con ↑ ↓ · durata e frequenza si salvano uscendo dal campo · MODIFICA per tipo, titolo, URL e link (solo contenuti manuali: quelli
          automatici arrivano dalle fonti verificate). Player pubblico:{" "}
          <Link href={percorsoPlayer(slug)} className="underline hover:text-white">
            {percorsoPlayer(slug)}
          </Link>
        </p>
        <ol className="flex flex-col gap-1.5">
          {contenuti.map((c, i) => (
            <li key={c.id} className={`grid items-center gap-2 rounded-lg border border-white/8 px-3 py-2 text-xs md:grid-cols-[auto_1fr_auto_auto_auto_auto] ${c.attivo ? "" : "opacity-45"}`}>
              <span className="flex gap-1">
                <button type="button" aria-label="Su" onClick={() => sposta(i, -1)} className="rounded border border-white/15 p-1 hover:border-white/40">
                  <ArrowUp className="h-3 w-3" />
                </button>
                <button type="button" aria-label="Giù" onClick={() => sposta(i, 1)} className="rounded border border-white/15 p-1 hover:border-white/40">
                  <ArrowDown className="h-3 w-3" />
                </button>
              </span>
              <span className="min-w-0">
                <span className="block truncate font-bold text-white">{c.titolo}</span>
                <span className="block truncate text-[10px] text-[var(--tbh-muted)]">
                  {c.tipo} · {c.origine === "auto" ? `auto (${c.fonte})` : "manuale"} · {c.attribuzione ?? "—"} ·{" "}
                  {c.link ? (
                    <a href={c.link} target="_blank" rel="noreferrer" className="underline">
                      {c.sorgente}
                    </a>
                  ) : (
                    c.sorgente
                  )}
                </span>
              </span>
              <label className="flex items-center gap-1">
                durata (s)
                <input
                  type="number"
                  min={1}
                  defaultValue={c.durataSec ?? ""}
                  placeholder="?"
                  className="w-20 rounded border border-white/15 bg-black px-1.5 py-1"
                  onBlur={(e) => {
                    const v = e.target.value ? Number(e.target.value) : null;
                    const invia = (confermaOltre: boolean) =>
                      aggiorna.mutate(
                        { codice, id: c.id, durataSec: v, confermaOltre },
                        {
                          onError: (err) => {
                            // limite di 90 minuti per singolo video: avviso e conferma esplicita, nessun taglio
                            if ((err as { code?: string }).code === "PRECONDITION_FAILED" && window.confirm(`${err.message}\n\nConfermi senza tagli?`)) invia(true);
                          },
                        },
                      );
                    if (v !== c.durataSec) invia(false);
                  }}
                />
                <span className="text-[var(--tbh-muted)]">{durata(c.durataSec)}</span>
              </label>
              <label className="flex items-center gap-1">
                freq.
                <input
                  type="number"
                  min={1}
                  max={10}
                  defaultValue={c.frequenza}
                  className="w-14 rounded border border-white/15 bg-black px-1.5 py-1"
                  onBlur={(e) => {
                    const v = Math.max(1, Number(e.target.value) || 1);
                    if (v !== c.frequenza) aggiorna.mutate({ codice, id: c.id, frequenza: v });
                  }}
                />
              </label>
              <button type="button" onClick={() => aggiorna.mutate({ codice, id: c.id, attivo: !c.attivo })} className="rounded-full border border-white/20 px-2.5 py-1 font-bold">
                {c.attivo ? "SPEGNI" : "ACCENDI"}
              </button>
              {c.origine === "manuale" ? (
                <button type="button" aria-label="Elimina" onClick={() => elimina.mutate({ codice, id: c.id })} className="text-[#ff8a8a]">
                  <Trash2 className="h-4 w-4" />
                </button>
              ) : (
                <span />
              )}
              <ModificaContenuto codice={codice} c={c} />
            </li>
          ))}
        </ol>
      </div>

      {/* NUOVO CONTENUTO */}
      <form
        className="tbh-card grid gap-3 p-5 md:grid-cols-3"
        onSubmit={(e) => {
          e.preventDefault();
          const invia = (confermaOltre: boolean) =>
            aggiungi.mutate(
              { ...nuovo, confermaOltre },
              {
                onSuccess: () => setNuovo(vuoto),
                onError: (err) => {
                  // limite di 90 minuti per singolo video: avviso PRIMA dell'inserimento, conferma esplicita, nessun taglio
                  if ((err as { code?: string }).code === "PRECONDITION_FAILED" && window.confirm(`${err.message}\n\nInserire comunque, senza tagli?`)) invia(true);
                },
              },
            );
          invia(false);
        }}
      >
        <h3 className="tbh-display tbh-h3 md:col-span-3">Aggiungi un contenuto autorizzato</h3>
        <select className={CAMPO} aria-label="Tipo di contenuto" value={nuovo.tipo} onChange={(e) => setNuovo({ ...nuovo, tipo: e.target.value as NuovoContenutoChannel["tipo"] })} data-testid="nuovo-tipo">
          {TIPI_CONTENUTO.map((t) => (
            <option key={t.v} value={t.v}>
              {t.t}
            </option>
          ))}
        </select>
        <input required className={CAMPO} placeholder="Titolo esatto" value={nuovo.titolo} onChange={(e) => setNuovo({ ...nuovo, titolo: e.target.value })} />
        <input required className={CAMPO} placeholder={nuovo.tipo === "immagine" ? "URL dell'immagine (https://… .jpg/.png/.webp)" : "URL YouTube / file video o audio / pagina interna"} value={nuovo.sorgente} onChange={(e) => setNuovo({ ...nuovo, sorgente: e.target.value })} />
        <input className={CAMPO} placeholder="Link pubblico (facoltativo)" value={nuovo.link ?? ""} onChange={(e) => setNuovo({ ...nuovo, link: e.target.value || null })} />
        <input type="number" min={1} className={CAMPO} placeholder={nuovo.tipo === "immagine" ? "Secondi a schermo (vuoto = durata scheda del Channel)" : "Durata reale in secondi (max 5400 = 90 min per video)"} value={nuovo.durataSec ?? ""} onChange={(e) => setNuovo({ ...nuovo, durataSec: e.target.value ? Number(e.target.value) : null })} />
        <input className={CAMPO} placeholder="Attribuzione (es. Video DM)" value={nuovo.attribuzione ?? ""} onChange={(e) => setNuovo({ ...nuovo, attribuzione: e.target.value || null })} />
        <button type="submit" disabled={aggiungi.isPending} className="w-fit rounded-full px-4 py-2 text-xs font-extrabold tracking-[0.12em] text-black disabled:opacity-50" style={{ background: GIALLO }}>
          AGGIUNGI
        </button>
      </form>

      {/* FASCE ORARIE */}
      <div className="tbh-card flex flex-col gap-3 p-5">
        <h3 className="tbh-display tbh-h3">Programmazione a orario</h3>
        <p className="text-xs text-[var(--tbh-muted)]">
          Nessun orario predefinito. Una DIRETTA vale solo con l'indirizzo ufficiale della trasmissione e solo nella sua fascia.
          {slug === "dm" && " DM: le dirette agli orari ufficiali del palinsesto DM sono già lette in automatico."}
        </p>
        <ul className="flex flex-col gap-1.5">
          {(det.data?.fasce ?? []).map((f) => (
            <li key={f.id} className={`flex flex-wrap items-center gap-3 rounded-lg border border-white/8 px-3 py-2 text-xs ${f.attivo ? "" : "opacity-45"}`}>
              <b className="text-white">
                {GIORNI[f.giorno ?? 0]} · {f.ora} · {f.durataMin}'
              </b>
              <span className="uppercase">{f.modalita}</span>
              <span>{f.titolo}</span>
              {f.sorgente && <span className="truncate text-[var(--tbh-muted)]">{f.sorgente}</span>}
              <button type="button" className="ml-auto underline" onClick={() => attivaFascia.mutate({ codice, id: f.id, attivo: !f.attivo })}>
                {f.attivo ? "spegni" : "accendi"}
              </button>
              <button type="button" aria-label="Elimina fascia" className="text-[#ff8a8a]" onClick={() => eliminaFascia.mutate({ codice, id: f.id })}>
                <Trash2 className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
        <form
          className="grid gap-3 md:grid-cols-6"
          onSubmit={(e) => {
            e.preventDefault();
            nuovaFascia.mutate(fascia, { onSuccess: () => setFascia(fasciaVuota) });
          }}
        >
          <select className={CAMPO} value={fascia.giorno ?? 0} onChange={(e) => setFascia({ ...fascia, giorno: Number(e.target.value) || null })}>
            {GIORNI.map((g, i) => (
              <option key={g} value={i}>
                {g}
              </option>
            ))}
          </select>
          <input type="time" required className={CAMPO} value={fascia.ora} onChange={(e) => setFascia({ ...fascia, ora: e.target.value })} />
          <input type="number" min={1} max={1440} className={CAMPO} value={fascia.durataMin} onChange={(e) => setFascia({ ...fascia, durataMin: Number(e.target.value) || 1 })} />
          <select className={CAMPO} value={fascia.modalita} onChange={(e) => setFascia({ ...fascia, modalita: e.target.value as NuovaFasciaChannel["modalita"] })}>
            <option value="playlist">playlist</option>
            <option value="replica">replica</option>
            <option value="diretta">diretta</option>
          </select>
          <input required className={CAMPO} placeholder="Titolo" value={fascia.titolo} onChange={(e) => setFascia({ ...fascia, titolo: e.target.value })} />
          <input className={CAMPO} placeholder="URL diretta (solo diretta)" value={fascia.sorgente ?? ""} onChange={(e) => setFascia({ ...fascia, sorgente: e.target.value || null })} />
          <button type="submit" disabled={nuovaFascia.isPending} className="w-fit rounded-full px-4 py-2 text-xs font-extrabold tracking-[0.12em] text-black disabled:opacity-50" style={{ background: GIALLO }}>
            AGGIUNGI FASCIA
          </button>
        </form>
      </div>

      {/* ANTEPRIMA SEQUENZA */}
      <div className="tbh-card flex flex-col gap-2 p-5">
        <h3 className="tbh-display tbh-h3">Sequenza di oggi (prime 60 voci)</h3>
        <ol className="list-decimal pl-5 text-xs text-[var(--tbh-muted)]">
          {(det.data?.sequenza ?? []).map((s, i) => (
            <li key={`${s.id}-${i}`} className={s.spot ? "text-[#d7ff00]" : ""}>
              {s.spot ? "SPOT · " : ""}
              {s.titolo} <span className="opacity-60">· {durata(s.durataSec)}</span>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

type ContenutoAdmin = NonNullable<ReturnType<typeof useDettaglioChannelAdmin>["data"]>["contenuti"][number];

/** 28/10/2026 (round 14) — modifica di tipo, titolo, URL del contenuto e link di una riga manuale. */
function ModificaContenuto({ codice, c }: { codice: string; c: ContenutoAdmin }) {
  const aggiorna = useAggiornaContenuto();
  const [aperto, setAperto] = useState(false);
  const [v, setV] = useState({ tipo: c.tipo as NuovoContenutoChannel["tipo"], titolo: c.titolo, sorgente: c.sorgente, link: c.link ?? "" });
  const manuale = c.origine === "manuale";
  if (!manuale) return null;
  const invia = (confermaOltre: boolean) =>
    aggiorna.mutate(
      {
        codice,
        id: c.id,
        tipo: v.tipo,
        titolo: v.titolo.trim(),
        sorgente: v.sorgente.trim(),
        link: v.link.trim() || null,
        confermaOltre,
      },
      {
        onSuccess: () => setAperto(false),
        onError: (err) => {
          if ((err as { code?: string }).code === "PRECONDITION_FAILED" && window.confirm(`${err.message}\n\nConfermi senza tagli?`)) invia(true);
        },
      },
    );
  return (
    <div className="md:col-span-6" data-testid={`modifica-${c.id}`}>
      <button
        type="button"
        onClick={() => setAperto((x) => !x)}
        aria-expanded={aperto}
        className="text-[10px] font-extrabold tracking-[0.14em] text-[#d7ff00] underline-offset-2 hover:underline"
      >
        {aperto ? "CHIUDI MODIFICA" : "MODIFICA TIPO · TITOLO · URL · LINK"}
      </button>
      {aperto && (
        <form
          className="mt-2 grid gap-2 md:grid-cols-[160px_1fr_1fr_1fr_auto]"
          onSubmit={(e) => {
            e.preventDefault();
            invia(false);
          }}
        >
          <select aria-label="Tipo" className={CAMPO} value={v.tipo} onChange={(e) => setV({ ...v, tipo: e.target.value as NuovoContenutoChannel["tipo"] })}>
            {TIPI_CONTENUTO.map((t) => (
              <option key={t.v} value={t.v}>
                {t.t}
              </option>
            ))}
          </select>
          <input aria-label="Titolo" required className={CAMPO} value={v.titolo} onChange={(e) => setV({ ...v, titolo: e.target.value })} />
          <input aria-label="URL del contenuto" required className={CAMPO} value={v.sorgente} onChange={(e) => setV({ ...v, sorgente: e.target.value })} />
          <input aria-label="Link pubblico" className={CAMPO} placeholder="Link pubblico (facoltativo)" value={v.link} onChange={(e) => setV({ ...v, link: e.target.value })} />
          <button type="submit" disabled={aggiorna.isPending} className="rounded-full px-4 py-2 text-xs font-extrabold tracking-[0.12em] text-black disabled:opacity-50" style={{ background: GIALLO }}>
            SALVA
          </button>
          {aggiorna.isError && <p className="text-xs text-[#ff8a8a] md:col-span-5">{errore(aggiorna.error)}</p>}
        </form>
      )}
    </div>
  );
}

/**
 * 28/10/2026 (round 14) — REGIA: logo (banner), «Apri il Sito» (29/10: era «Vai al sito») e collegamenti del Channel.
 * Chiave condivisa cms_v1:canali: vale subito anche su www.tbh-web.com e resta dopo il Publish.
 * Campi vuoti = si torna al logo approvato e al sito ufficiale verificato (se c'è). Nessun indirizzo inventato.
 */
function ExtraChannel({ codice, slug }: { codice: string; slug: string }) {
  const reg = useRegistroChannel();
  const vivo = reg.data?.channel.find((x) => x.slug === slug);
  const salva = useImpostaExtraChannel();
  const [v, setV] = useState<{ logo: string; sito: string; collegamenti: { nome: string; href: string }[] } | null>(null);
  useEffect(() => {
    if (vivo && !v) setV({ logo: vivo.logoRegia ?? "", sito: vivo.sitoRegia ?? "", collegamenti: vivo.collegamentiRegia ?? [] });
  }, [vivo, v]);
  if (!vivo || !v) return null;
  const logoMostrato = v.logo.trim() || vivo.logo;
  return (
    <form
      className="tbh-card grid gap-3 p-5 md:grid-cols-2"
      data-testid={`extra-${slug}`}
      onSubmit={(e) => {
        e.preventDefault();
        salva.mutate({
          codice,
          slug,
          logo: v.logo.trim(),
          sito: v.sito.trim(),
          collegamenti: v.collegamenti.map((l) => ({ nome: l.nome.trim(), href: l.href.trim() })).filter((l) => l.nome || l.href),
        });
      }}
    >
      <h3 className="tbh-display tbh-h3 md:col-span-2">Logo · Sito · Collegamenti</h3>
      <p className="text-xs text-[var(--tbh-muted)] md:col-span-2">
        Valgono subito anche su www.tbh-web.com (dati condivisi) e restano dopo il Publish. Logo vuoto = logo approvato del Channel; sito vuoto =
        sito ufficiale verificato{vivo.sito && !vivo.sitoRegia ? ` (${vivo.sito})` : ""}, se manca nessun pulsante «Apri il Sito».
      </p>
      <div className="flex flex-col gap-2">
        <label className="flex flex-col gap-1 text-xs">
          Logo / banner (https://… oppure un file del sito /…)
          <input className={CAMPO} value={v.logo} placeholder={vivo.logo ?? "nessun logo approvato"} onChange={(e) => setV({ ...v, logo: e.target.value })} data-testid="extra-logo" />
        </label>
        <div className="relative aspect-[2/1] w-full max-w-[360px] overflow-hidden rounded-lg border border-white/10 bg-black">
          {logoMostrato ? (
            <img src={logoMostrato} alt="Anteprima logo" className="absolute inset-0 h-full w-full object-contain p-1" />
          ) : (
            <span className="absolute inset-0 grid place-items-center text-xs text-white/50">Nessun logo</span>
          )}
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <label className="flex flex-col gap-1 text-xs">
          Sito ufficiale per «Apri il Sito» (solo https://…)
          <input className={CAMPO} value={v.sito} placeholder={vivo.sito ?? "https://…"} onChange={(e) => setV({ ...v, sito: e.target.value })} data-testid="extra-sito" />
        </label>
        <span className="text-xs">Collegamenti (max 12)</span>
        {v.collegamenti.map((l, i) => (
          <div key={i} className="grid grid-cols-[1fr_1.4fr_auto] gap-2">
            <input aria-label={`Nome collegamento ${i + 1}`} className={CAMPO} placeholder="Nome" value={l.nome} onChange={(e) => setV({ ...v, collegamenti: v.collegamenti.map((x, j) => (j === i ? { ...x, nome: e.target.value } : x)) })} />
            <input aria-label={`Indirizzo collegamento ${i + 1}`} className={CAMPO} placeholder="https://… o /pagina" value={l.href} onChange={(e) => setV({ ...v, collegamenti: v.collegamenti.map((x, j) => (j === i ? { ...x, href: e.target.value } : x)) })} />
            <button type="button" aria-label={`Togli collegamento ${i + 1}`} className="text-[#ff8a8a]" onClick={() => setV({ ...v, collegamenti: v.collegamenti.filter((_, j) => j !== i) })}>
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
        {v.collegamenti.length < 12 && (
          <button type="button" className="w-fit text-xs font-bold underline" onClick={() => setV({ ...v, collegamenti: [...v.collegamenti, { nome: "", href: "" }] })} data-testid="extra-aggiungi-collegamento">
            + aggiungi collegamento
          </button>
        )}
        {(vivo.collegamenti ?? []).length > 0 && (
          <p className="text-[11px] text-[var(--tbh-muted)]">Già nel registro (restano): {(vivo.collegamenti ?? []).map((l) => l.nome).join(" · ")}</p>
        )}
      </div>
      <div className="flex flex-wrap items-center gap-3 md:col-span-2">
        <button type="submit" disabled={salva.isPending} className="w-fit rounded-full px-4 py-2 text-xs font-extrabold tracking-[0.12em] text-black disabled:opacity-50" style={{ background: GIALLO }} data-testid="extra-salva">
          SALVA LOGO · SITO · COLLEGAMENTI
        </button>
        {salva.isSuccess && <span className="text-xs text-[#d7ff00]">{salva.data.esito}</span>}
        {salva.isError && <span className="text-xs text-[#ff8a8a]">{errore(salva.error)}</span>}
      </div>
    </form>
  );
}

/**
 * 29/10/2026 (round 15) — REGIA: SCHEDA INFORMATIVA del Channel (descrizione, servizi, contatti, social, Maps,
 * indicazioni). SEPARATA dal palinsesto. Chiave condivisa cms_v1:canali → vale anche su www. Ogni campo vuoto
 * lascia il dato di base verificato (mostrato come segnaposto); tutto vuoto = solo dati di base.
 */
type ModuloScheda = {
  descrizione: string;
  servizi: string;
  telefono: string;
  whatsapp: string;
  email: string;
  social: { nome: string; href: string }[];
  indirizzo: string;
  maps: string;
  indicazioni: string;
};
function SchedaInformativaRegia({ codice, slug }: { codice: string; slug: string }) {
  const reg = useRegistroChannel();
  const vivo = reg.data?.channel.find((x) => x.slug === slug);
  const salva = useImpostaSchedaChannel();
  const [v, setV] = useState<ModuloScheda | null>(null);
  useEffect(() => {
    if (vivo && !v) {
      const r = vivo.schedaRegia;
      setV({
        descrizione: r?.descrizione ?? "",
        servizi: (r?.servizi ?? []).join("\n"),
        telefono: r?.telefono ?? "",
        whatsapp: r?.whatsapp ?? "",
        email: r?.email ?? "",
        social: r?.social ?? [],
        indirizzo: r?.indirizzo ?? "",
        maps: r?.maps ?? "",
        indicazioni: r?.indicazioni ?? "",
      });
    }
  }, [vivo, v]);
  if (!vivo || !v) return null;
  const b = vivo.info;
  const set = (k: keyof ModuloScheda) => (e: { target: { value: string } }) => setV({ ...v, [k]: e.target.value });
  return (
    <form
      className="tbh-card grid gap-3 p-5 md:grid-cols-2"
      data-testid={`scheda-regia-${slug}`}
      onSubmit={(e) => {
        e.preventDefault();
        salva.mutate({
          codice,
          slug,
          descrizione: v.descrizione.trim(),
          servizi: v.servizi
            .split("\n")
            .map((x) => x.trim())
            .filter(Boolean),
          telefono: v.telefono.trim(),
          whatsapp: v.whatsapp.trim(),
          email: v.email.trim(),
          social: v.social.map((l) => ({ nome: l.nome.trim(), href: l.href.trim() })).filter((l) => l.nome || l.href),
          indirizzo: v.indirizzo.trim(),
          maps: v.maps.trim(),
          indicazioni: v.indicazioni.trim(),
        });
      }}
    >
      <h3 className="tbh-display tbh-h3 md:col-span-2">Scheda informativa · separata dal palinsesto</h3>
      <p className="text-xs text-[var(--tbh-muted)] md:col-span-2">
        È quello che si apre con «APRI SCHEDA» (/channel/scheda/{slug}). Campo vuoto = resta il dato di base verificato (in grigio); se manca anche quello
        la scheda scrive «da fornire». Vale subito anche su www.tbh-web.com. Nessun dato inventato.
      </p>
      <label className="flex flex-col gap-1 text-xs md:col-span-2">
        Descrizione
        <textarea rows={3} className={CAMPO} value={v.descrizione} placeholder={b.descrizione ?? "da fornire"} onChange={set("descrizione")} data-testid="scheda-descrizione" />
      </label>
      <label className="flex flex-col gap-1 text-xs">
        Servizi (uno per riga)
        <textarea rows={4} className={CAMPO} value={v.servizi} placeholder={b.servizi.length ? b.servizi.join("\n") : "da fornire"} onChange={set("servizi")} data-testid="scheda-servizi" />
      </label>
      <div className="flex flex-col gap-2">
        <label className="flex flex-col gap-1 text-xs">
          Telefono
          <input className={CAMPO} value={v.telefono} placeholder={b.telefono ?? "+39 …"} onChange={set("telefono")} data-testid="scheda-telefono" />
        </label>
        <label className="flex flex-col gap-1 text-xs">
          WhatsApp (numero +39… o link https://wa.me/…)
          <input className={CAMPO} value={v.whatsapp} placeholder={b.whatsapp ?? "+39 …"} onChange={set("whatsapp")} data-testid="scheda-whatsapp" />
        </label>
        <label className="flex flex-col gap-1 text-xs">
          E-mail
          <input className={CAMPO} value={v.email} placeholder={b.email ?? "nome@dominio.it"} onChange={set("email")} data-testid="scheda-email" />
        </label>
      </div>
      <div className="flex flex-col gap-2">
        <label className="flex flex-col gap-1 text-xs">
          Indirizzo
          <input className={CAMPO} value={v.indirizzo} placeholder={b.indirizzo ?? "Via …, città"} onChange={set("indirizzo")} data-testid="scheda-indirizzo" />
        </label>
        <label className="flex flex-col gap-1 text-xs">
          Link Google Maps (vuoto = costruito dall'indirizzo)
          <input className={CAMPO} value={v.maps} placeholder={b.maps ?? "https://maps.app.goo.gl/…"} onChange={set("maps")} data-testid="scheda-maps" />
        </label>
        <label className="flex flex-col gap-1 text-xs">
          Indicazioni (come arrivare, accessi, orari)
          <textarea rows={2} className={CAMPO} value={v.indicazioni} placeholder={b.indicazioni ?? "da fornire"} onChange={set("indicazioni")} data-testid="scheda-indicazioni" />
        </label>
      </div>
      <div className="flex flex-col gap-2">
        <span className="text-xs">Social (max 10){!v.social.length && b.social.length ? ` · di base: ${b.social.map((x) => x.nome).join(" · ")}` : ""}</span>
        {v.social.map((l, i) => (
          <div key={i} className="grid grid-cols-[1fr_1.4fr_auto] gap-2">
            <input aria-label={`Nome social ${i + 1}`} className={CAMPO} placeholder="Instagram · @…" value={l.nome} onChange={(e) => setV({ ...v, social: v.social.map((x, j) => (j === i ? { ...x, nome: e.target.value } : x)) })} />
            <input aria-label={`Indirizzo social ${i + 1}`} className={CAMPO} placeholder="https://…" value={l.href} onChange={(e) => setV({ ...v, social: v.social.map((x, j) => (j === i ? { ...x, href: e.target.value } : x)) })} />
            <button type="button" aria-label={`Togli social ${i + 1}`} className="text-[#ff8a8a]" onClick={() => setV({ ...v, social: v.social.filter((_, j) => j !== i) })}>
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
        {v.social.length < 10 && (
          <button type="button" className="w-fit text-xs font-bold underline" onClick={() => setV({ ...v, social: [...v.social, { nome: "", href: "" }] })} data-testid="scheda-aggiungi-social">
            + aggiungi social
          </button>
        )}
      </div>
      <div className="flex flex-wrap items-center gap-3 md:col-span-2">
        <button type="submit" disabled={salva.isPending} className="w-fit rounded-full px-4 py-2 text-xs font-extrabold tracking-[0.12em] text-black disabled:opacity-50" style={{ background: GIALLO }} data-testid="scheda-salva">
          SALVA SCHEDA INFORMATIVA
        </button>
        <Link href={`/channel/scheda/${slug}`} className="text-xs underline">
          Apri la scheda pubblica
        </Link>
        {salva.isSuccess && <span className="text-xs text-[#d7ff00]" data-testid="scheda-esito">{salva.data.esito}</span>}
        {salva.isError && <span className="text-xs text-[#ff8a8a]" data-testid="scheda-errore">{errore(salva.error)}</span>}
      </div>
    </form>
  );
}
