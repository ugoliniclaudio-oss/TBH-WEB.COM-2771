import { useMemo, useState } from "react";
import { Link } from "wouter";
import {
  AlertTriangle,
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  BadgeCheck,
  EyeOff,
  Globe,
  Loader2,
  Lock,
  Pencil,
  Plus,
  RefreshCw,
  RotateCcw,
  Search,
  Star,
  Trash2,
  Upload,
  Wand2,
} from "lucide-react";
import { SbloccoAllestimento, useCodiceAllestimento } from "../components/media-slot";
import { COLORI_SOCIAL, ICONE_SOCIAL, NOMI_TIPO } from "../components/touch-social";
import {
  useImportaSocial,
  useMetadatiSocial,
  useOrdinaSocial,
  useQuadroSocial,
  useRimuoviSocial,
  useRipristinaSocial,
  useSalvaSocial,
  useVerificaSocial,
  type QuadroSocial,
  type VoceSocialAdmin,
} from "../queries/touch-social";

/**
 * PANNELLO TOUCH SOCIAL (09/11/2026) — /allestimento/touch-social.
 * Aggiungi, modifica, nascondi, importa elenchi di URL, leggi i dati pubblici (Open Graph), controlla
 * i link (si segnalano, non si cancellano), ordina, evidenze e campagne, collegamenti a Channel e
 * pagine (una voce, più pagine), statistiche aggregate dei clic. Le voci della base consegnata non si
 * cancellano: si nascondono e si ripristinano.
 */

const NEON = "#d7ff00";
const msg = (e: unknown) => (e instanceof Error ? e.message : "Operazione non riuscita.");
const data = (t: number | null | undefined) => (t ? new Date(t).toLocaleString("it-IT", { dateStyle: "short", timeStyle: "short" }) : "mai");

const NOMI_STATO: Record<string, { nome: string; colore: string }> = {
  pubblico: { nome: "Pubblico", colore: NEON },
  "da-verificare": { nome: "Da verificare", colore: "#ff8a00" },
  "da-completare": { nome: "Da completare", colore: "#d4af37" },
  nascosto: { nome: "Nascosto", colore: "#8a8a8a" },
};
const NOMI_ESITO: Record<string, { nome: string; colore: string }> = {
  ok: { nome: "Link OK", colore: NEON },
  "non-trovato": { nome: "Link rotto", colore: "#ff8a00" },
  "non-verificabile": { nome: "Non verificabile dal server", colore: "#33e0ff" },
  errore: { nome: "Non raggiungibile", colore: "#d4af37" },
};
const AZIONI: Record<string, string> = { segui: "Segui/Iscriviti", apri: "Apri", anteprima: "Anteprima", condividi: "Condividi", copia: "Copia link", qr: "QR", preferito: "Preferiti" };

type Bozza = {
  piattaforma: string;
  tipo: string;
  categoria: string;
  nome: string;
  handle: string;
  url: string;
  descrizione: string;
  logo: string;
  immagine: string;
  persona: boolean;
  channel: string;
  pagine: string;
  stato: string;
  evidenza: boolean;
  campagna: string;
  nota: string;
};
const VUOTA: Bozza = {
  piattaforma: "instagram",
  tipo: "profilo",
  categoria: "tbh",
  nome: "",
  handle: "",
  url: "",
  descrizione: "",
  logo: "",
  immagine: "",
  persona: false,
  channel: "",
  pagine: "",
  stato: "da-verificare",
  evidenza: false,
  campagna: "",
  nota: "",
};
const daVoce = (v: VoceSocialAdmin): Bozza => ({
  piattaforma: v.piattaforma,
  tipo: v.tipo,
  categoria: v.categoria,
  nome: v.nome,
  handle: v.handle ?? "",
  url: v.url ?? "",
  descrizione: v.descrizione ?? "",
  logo: v.logo ?? "",
  immagine: v.immagine ?? "",
  persona: v.persona,
  channel: v.channel.join(", "),
  pagine: v.pagine.join(", "),
  stato: v.stato,
  evidenza: v.evidenza,
  campagna: v.campagna ?? "",
  nota: v.nota ?? "",
});
const nulla = (s: string) => (s.trim() ? s.trim() : null);
const elenco = (s: string) =>
  s
    .split(/[,\n]/)
    .map((x) => x.trim())
    .filter(Boolean);

const campo = "w-full rounded-xl border border-[var(--tbh-line)] bg-black/70 px-3 py-2 text-sm outline-none focus:border-[var(--tbh-neon)]";
const etichetta = "mb-1 block text-[11px] uppercase tracking-wide text-[var(--tbh-muted)]";

function Modulo({ codice, d, voce, onChiudi }: { codice: string; d: QuadroSocial; voce: VoceSocialAdmin | null; onChiudi: () => void }) {
  const [b, setB] = useState<Bozza>(voce ? daVoce(voce) : VUOTA);
  const [info, setInfo] = useState<string | null>(null);
  const salva = useSalvaSocial();
  const meta = useMetadatiSocial();
  const set = <K extends keyof Bozza>(k: K, val: Bozza[K]) => setB((x) => ({ ...x, [k]: val }));

  const leggi = async () => {
    setInfo(null);
    try {
      const m = await meta.mutateAsync({ codice, url: b.url.trim(), id: voce?.id ?? null });
      setB((x) => ({
        ...x,
        piattaforma: voce ? x.piattaforma : m.riconosciuto.piattaforma,
        tipo: voce ? x.tipo : m.riconosciuto.tipo,
        handle: x.handle || m.riconosciuto.handle || "",
        nome: x.nome || m.titolo || "",
        descrizione: x.descrizione || m.descrizione || "",
        immagine: x.immagine || m.immagine || "",
      }));
      setInfo(
        `${m.verifica.messaggio}${m.titolo ? ` Titolo pubblico: «${m.titolo}».` : " Nessun dato pubblico leggibile."}${m.immagine ? " Immagine trovata." : ""} I campi già scritti non sono stati toccati.`,
      );
    } catch (e) {
      setInfo(msg(e));
    }
  };

  const invia = async () => {
    setInfo(null);
    try {
      await salva.mutateAsync({
        codice,
        id: voce?.id ?? null,
        voce: {
          piattaforma: b.piattaforma as never,
          tipo: b.tipo as never,
          categoria: b.categoria as never,
          nome: b.nome.trim(),
          handle: nulla(b.handle),
          url: nulla(b.url),
          descrizione: nulla(b.descrizione),
          logo: nulla(b.logo),
          immagine: nulla(b.immagine),
          persona: b.persona,
          channel: elenco(b.channel),
          pagine: elenco(b.pagine),
          stato: b.stato as never,
          evidenza: b.evidenza,
          campagna: nulla(b.campagna),
          nota: nulla(b.nota),
        },
      });
      onChiudi();
    } catch (e) {
      setInfo(msg(e));
    }
  };

  return (
    <section className="tbh-card flex flex-col gap-4 p-4 md:p-5" style={{ borderColor: NEON }} data-testid="modulo-social">
      <div className="flex items-center justify-between gap-3">
        <h2 className="tbh-display text-lg uppercase">{voce ? `Modifica · ${voce.nome}` : "Nuovo profilo"}</h2>
        <button type="button" onClick={onChiudi} className="text-xs text-[var(--tbh-muted)] underline">
          Chiudi
        </button>
      </div>
      <div className="grid gap-3 md:grid-cols-[1fr_auto]">
        <label className="block">
          <span className={etichetta}>Indirizzo ufficiale (https://…)</span>
          <input value={b.url} onChange={(e) => set("url", e.target.value)} className={campo} placeholder="https://www.instagram.com/…" data-testid="campo-url" />
        </label>
        <button
          type="button"
          onClick={leggi}
          disabled={!/^https:\/\//.test(b.url.trim()) || meta.isPending}
          className="mt-auto inline-flex items-center justify-center gap-1.5 rounded-xl border border-[var(--tbh-line)] px-4 py-2 text-sm font-semibold hover:border-[var(--tbh-neon)] disabled:opacity-40"
          data-testid="leggi-metadati"
        >
          {meta.isPending ? <Loader2 size={15} className="animate-spin" /> : <Wand2 size={15} />} Leggi dati pubblici
        </button>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <label className="block">
          <span className={etichetta}>Piattaforma</span>
          <select value={b.piattaforma} onChange={(e) => set("piattaforma", e.target.value)} className={campo}>
            {d.piattaforme.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nome}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className={etichetta}>Tipo</span>
          <select value={b.tipo} onChange={(e) => set("tipo", e.target.value)} className={campo}>
            {d.tipi.map((t) => (
              <option key={t} value={t}>
                {NOMI_TIPO[t] ?? t}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className={etichetta}>Marchio / categoria</span>
          <select value={b.categoria} onChange={(e) => set("categoria", e.target.value)} className={campo}>
            {d.categorie.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nome}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className={etichetta}>Stato</span>
          <select value={b.stato} onChange={(e) => set("stato", e.target.value)} className={campo} data-testid="campo-stato">
            {d.stati.map((s) => (
              <option key={s} value={s}>
                {NOMI_STATO[s]?.nome ?? s}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <label className="block">
          <span className={etichetta}>Nome per esteso</span>
          <input value={b.nome} onChange={(e) => set("nome", e.target.value)} className={campo} data-testid="campo-nome" />
        </label>
        <label className="block">
          <span className={etichetta}>Handle (facoltativo)</span>
          <input value={b.handle} onChange={(e) => set("handle", e.target.value)} className={campo} placeholder="@…" />
        </label>
      </div>
      <label className="block">
        <span className={etichetta}>Descrizione</span>
        <textarea value={b.descrizione} onChange={(e) => set("descrizione", e.target.value)} rows={2} className={campo} />
      </label>
      <div className="grid gap-3 md:grid-cols-2">
        <label className="block">
          <span className={etichetta}>Logo in archivio (percorso, es. /brand/loghi/…)</span>
          <input value={b.logo} onChange={(e) => set("logo", e.target.value)} className={campo} />
        </label>
        <label className="block">
          <span className={etichetta}>Immagine del profilo (pubblica, https://…)</span>
          <input value={b.immagine} onChange={(e) => set("immagine", e.target.value)} className={campo} />
        </label>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <label className="block">
          <span className={etichetta}>Channel collegati (slug, separati da virgola)</span>
          <input value={b.channel} onChange={(e) => set("channel", e.target.value)} className={campo} placeholder="touch-tv, touch-radio" />
        </label>
        <label className="block">
          <span className={etichetta}>Altre pagine del sito (percorsi, separati da virgola)</span>
          <input value={b.pagine} onChange={(e) => set("pagine", e.target.value)} className={campo} placeholder="/contatti, /" />
        </label>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <label className="block">
          <span className={etichetta}>Campagna in corso (facoltativa)</span>
          <input value={b.campagna} onChange={(e) => set("campagna", e.target.value)} className={campo} placeholder="es. Nuovo videoclip in uscita" />
        </label>
        <label className="block">
          <span className={etichetta}>Nota interna</span>
          <input value={b.nota} onChange={(e) => set("nota", e.target.value)} className={campo} />
        </label>
      </div>
      <div className="flex flex-wrap items-center gap-4 text-sm">
        <label className="inline-flex items-center gap-2">
          <input type="checkbox" checked={b.evidenza} onChange={(e) => set("evidenza", e.target.checked)} /> In evidenza
        </label>
        <label className="inline-flex items-center gap-2">
          <input type="checkbox" checked={b.persona} onChange={(e) => set("persona", e.target.checked)} /> Profilo di una persona
        </label>
      </div>
      {info && <p className="rounded-xl border border-[var(--tbh-line)] bg-white/[0.03] p-3 text-xs text-white/85" data-testid="info-modulo">{info}</p>}
      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={invia} disabled={salva.isPending || b.nome.trim().length < 2} className="tbh-neon-btn inline-flex items-center gap-1.5 px-5 py-2.5 text-sm disabled:opacity-40" data-testid="salva-social">
          {salva.isPending && <Loader2 size={15} className="animate-spin" />} Salva
        </button>
        <p className="self-center text-xs text-[var(--tbh-muted)]">Sulla pagina pubblica compare solo con stato «Pubblico», un indirizzo e il link non rotto.</p>
      </div>
    </section>
  );
}

function Riga({ codice, v, su, giu, onModifica }: { codice: string; v: VoceSocialAdmin; su?: () => void; giu?: () => void; onModifica: () => void }) {
  const verifica = useVerificaSocial();
  const rimuovi = useRimuoviSocial();
  const ripristina = useRipristinaSocial();
  const Icona = ICONE_SOCIAL[v.piattaforma] ?? Globe;
  const st = NOMI_STATO[v.stato] ?? { nome: v.stato, colore: "#888" };
  const es = v.verifica && v.verifica.url === v.url ? NOMI_ESITO[v.verifica.esito] : null;
  const clic = Object.values(v.clic).reduce((t, n) => t + n, 0);
  const err = verifica.error ?? rimuovi.error ?? ripristina.error;
  return (
    <li className="flex flex-col gap-2 rounded-xl border border-[var(--tbh-line)] p-3 md:flex-row md:items-center" data-testid="riga-social" data-id={v.id}>
      <div className="flex min-w-0 grow items-start gap-3">
        <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-black/60" style={{ color: COLORI_SOCIAL[v.piattaforma] }}>
          <Icona size={17} />
        </span>
        <div className="min-w-0">
          <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm font-semibold">
            <span className="break-words">{v.nome}</span>
            {v.evidenza && <Star size={13} className="text-[var(--tbh-gold)]" fill="currentColor" />}
            <span className="rounded-full border px-2 py-0.5 text-[10px] uppercase" style={{ borderColor: st.colore, color: st.colore }}>
              {st.nome}
            </span>
            {es && (
              <span className="rounded-full border px-2 py-0.5 text-[10px] uppercase" style={{ borderColor: es.colore, color: es.colore }} title={v.verifica?.messaggio}>
                {es.nome}
              </span>
            )}
            {v.stato === "pubblico" && !v.inPagina && v.url && <span className="text-[10px] uppercase text-[#ff8a00]">fuori pagina finché il link non si corregge</span>}
            {v.campagna && <span className="rounded-full bg-[#ff8a00] px-2 py-0.5 text-[10px] font-bold uppercase text-black">{v.campagna}</span>}
          </p>
          <p className="mt-0.5 break-all text-[11px] text-[var(--tbh-muted)]">
            {NOMI_TIPO[v.tipo] ?? v.tipo} · {v.url ?? "indirizzo da incollare"}
          </p>
          <p className="mt-0.5 text-[11px] text-[var(--tbh-muted)]">
            {v.verifica ? `Controllo ${data(v.verifica.quando)}: ${v.verifica.messaggio}` : "Non ancora controllato."}
            {v.channel.length > 0 && ` · Channel: ${v.channel.join(", ")}`}
            {v.pagine.length > 0 && ` · Pagine: ${v.pagine.join(", ")}`}
            {` · ${clic} clic`}
          </p>
          {v.nota && <p className="mt-0.5 text-[11px] text-white/70">Nota: {v.nota}</p>}
          {err && <p className="mt-1 text-[11px] text-[#ff8a00]">{msg(err)}</p>}
        </div>
      </div>
      <div className="flex shrink-0 flex-wrap items-center gap-1.5">
        <button type="button" onClick={su} disabled={!su} className="rounded-lg border border-[var(--tbh-line)] p-1.5 disabled:opacity-30" aria-label="Sposta su">
          <ArrowUp size={14} />
        </button>
        <button type="button" onClick={giu} disabled={!giu} className="rounded-lg border border-[var(--tbh-line)] p-1.5 disabled:opacity-30" aria-label="Sposta giù">
          <ArrowDown size={14} />
        </button>
        <button type="button" onClick={onModifica} className="inline-flex items-center gap-1 rounded-lg border border-[var(--tbh-line)] px-2 py-1.5 text-xs hover:border-[var(--tbh-neon)]" data-testid="modifica-social">
          <Pencil size={13} /> Modifica
        </button>
        {v.url && (
          <button
            type="button"
            onClick={() => verifica.mutate({ codice, ids: [v.id] })}
            disabled={verifica.isPending}
            className="inline-flex items-center gap-1 rounded-lg border border-[var(--tbh-line)] px-2 py-1.5 text-xs hover:border-[var(--tbh-neon)]"
          >
            {verifica.isPending ? <Loader2 size={13} className="animate-spin" /> : <BadgeCheck size={13} />} Verifica
          </button>
        )}
        {v.base && v.modificata && (
          <button
            type="button"
            onClick={() => window.confirm("Riportare la voce ai dati consegnati? Le modifiche fatte dal pannello si annullano.") && ripristina.mutate({ codice, id: v.id })}
            className="inline-flex items-center gap-1 rounded-lg border border-[var(--tbh-line)] px-2 py-1.5 text-xs hover:border-white"
          >
            <RotateCcw size={13} /> Ripristina
          </button>
        )}
        {(!v.base || v.stato !== "nascosto") && (
          <button
            type="button"
            onClick={() =>
              window.confirm(v.base ? "Nascondere la voce? Resta in archivio e si può ripristinare." : "Togliere la voce aggiunta dal pannello? Prima si crea una copia di sicurezza.") &&
              rimuovi.mutate({ codice, id: v.id })
            }
            className="inline-flex items-center gap-1 rounded-lg border border-[var(--tbh-line)] px-2 py-1.5 text-xs hover:border-[#ff8a00]"
          >
            {v.base ? <EyeOff size={13} /> : <Trash2 size={13} />} {v.base ? "Nascondi" : "Togli"}
          </button>
        )}
      </div>
    </li>
  );
}

export default function PannelloTouchSocialPage() {
  const { codice } = useCodiceAllestimento();
  const q = useQuadroSocial(codice);
  const d = q.data;
  const verificaTutti = useVerificaSocial();
  const importa = useImportaSocial();
  const ordina = useOrdinaSocial();
  const [modulo, setModulo] = useState<{ voce: VoceSocialAdmin | null } | null>(null);
  const [testo, setTesto] = useState("");
  const [catImport, setCatImport] = useState("tbh");
  const [cerca, setCerca] = useState("");
  const [fStato, setFStato] = useState("tutti");
  const [fCat, setFCat] = useState("tutte");

  const voci = useMemo(() => {
    const t = cerca.trim().toLowerCase();
    return (d?.voci ?? []).filter(
      (v) =>
        (fStato === "tutti" || (fStato === "rotti" ? v.verifica?.esito === "non-trovato" && v.verifica.url === v.url : v.stato === fStato)) &&
        (fCat === "tutte" || v.categoria === fCat) &&
        (!t || `${v.nome} ${v.handle ?? ""} ${v.url ?? ""} ${v.piattaforma}`.toLowerCase().includes(t)),
    );
  }, [d, cerca, fStato, fCat]);

  const totali = useMemo(() => {
    const t: Record<string, number> = {};
    for (const v of d?.voci ?? []) for (const [k, n] of Object.entries(v.clic)) t[k] = (t[k] ?? 0) + n;
    return t;
  }, [d]);
  const migliori = useMemo(
    () =>
      [...(d?.voci ?? [])]
        .map((v) => ({ v, n: Object.values(v.clic).reduce((a, b) => a + b, 0) }))
        .filter((x) => x.n > 0)
        .sort((a, b) => b.n - a.n)
        .slice(0, 10),
    [d],
  );
  const conteggi = useMemo(() => {
    const c: Record<string, number> = {};
    for (const v of d?.voci ?? []) c[v.stato] = (c[v.stato] ?? 0) + 1;
    c.rotti = (d?.voci ?? []).filter((v) => v.verifica?.esito === "non-trovato" && v.verifica.url === v.url).length;
    c.inPagina = (d?.voci ?? []).filter((v) => v.inPagina).length;
    return c;
  }, [d]);

  const sposta = (v: VoceSocialAdmin, verso: -1 | 1) => {
    const stessa = (d?.voci ?? []).filter((x) => x.categoria === v.categoria);
    const ids = stessa.map((x) => x.id);
    const k = ids.indexOf(v.id);
    const j = k + verso;
    if (k < 0 || j < 0 || j >= ids.length) return;
    [ids[k], ids[j]] = [ids[j]!, ids[k]!];
    ordina.mutate({ codice, ids });
  };

  if (!codice)
    return (
      <div className="mx-auto flex max-w-[900px] flex-col gap-5 px-4 py-10">
        <h1 className="tbh-display tbh-h2 flex items-center gap-3" style={{ color: NEON }}>
          <Lock className="h-6 w-6" /> Touch Social
        </h1>
        <p className="text-sm text-[var(--tbh-muted)]">Area riservata: serve il codice di allestimento.</p>
        <SbloccoAllestimento />
      </div>
    );

  const maxGiorno = Math.max(1, ...(d?.giorni ?? []).map((g) => g.n));
  const filtroLibero = cerca.trim() !== "" || fStato !== "tutti" || fCat !== "tutte";

  return (
    <div className="mx-auto flex max-w-[1400px] flex-col gap-6 overflow-x-clip px-4 py-8 md:px-8" data-testid="pannello-social">
      <Link href="/allestimento" className="inline-flex w-fit items-center gap-1.5 text-sm text-[var(--tbh-muted)] hover:text-white">
        <ArrowLeft className="h-4 w-4" /> Pannello di allestimento
      </Link>
      <header className="flex flex-col gap-2">
        <h1 className="tbh-display tbh-h1 leading-[0.95]" style={{ color: "#ff3df0" }}>
          TOUCH SOCIAL
        </h1>
        <p className="max-w-3xl text-sm text-[var(--tbh-muted)]">
          I profili della pagina <Link href="/contatti-social" className="underline">/contatti-social</Link>. Un nuovo indirizzo entra <b>da verificare</b> e va in pagina
          solo quando lo metti <b>Pubblico</b>. I link si controllano da soli una volta al giorno: quelli rotti si segnalano e restano in archivio, mai cancellati. Instagram e
          Facebook bloccano i controlli automatici: risultano «non verificabili dal server» e restano visibili. Una voce si collega a più Channel e pagine senza copiarla.
        </p>
      </header>

      {q.isError && <p className="text-sm text-[#ff8a00]">{msg(q.error)}</p>}
      {q.isLoading && <Loader2 className="h-5 w-5 animate-spin text-white/50" />}

      {d && (
        <>
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="rounded-full border border-[var(--tbh-line)] px-3 py-1.5">{d.voci.length} voci in archivio</span>
            <span className="rounded-full border px-3 py-1.5" style={{ borderColor: NEON, color: NEON }}>
              {conteggi.inPagina ?? 0} in pagina
            </span>
            {(["da-verificare", "da-completare", "nascosto"] as const).map((s) => (
              <span key={s} className="rounded-full border px-3 py-1.5" style={{ borderColor: NOMI_STATO[s]!.colore, color: NOMI_STATO[s]!.colore }}>
                {conteggi[s] ?? 0} {NOMI_STATO[s]!.nome.toLowerCase()}
              </span>
            ))}
            <span className="rounded-full border border-[#ff8a00] px-3 py-1.5 text-[#ff8a00]" data-testid="conteggio-rotti">
              {conteggi.rotti ?? 0} link rotti
            </span>
            <span className="text-[var(--tbh-muted)]">Ultimo controllo completo: {data(d.ultimoGiro)}</span>
            <button
              type="button"
              onClick={() => verificaTutti.mutate({ codice })}
              disabled={verificaTutti.isPending}
              className="inline-flex items-center gap-1.5 rounded-full border border-[var(--tbh-line)] px-3 py-1.5 font-semibold hover:border-[var(--tbh-neon)]"
              data-testid="verifica-tutti"
            >
              {verificaTutti.isPending ? <Loader2 size={13} className="animate-spin" /> : <RefreshCw size={13} />} Verifica tutti i link
            </button>
            {verificaTutti.data && <span className="text-[var(--tbh-neon)]">{verificaTutti.data.controllati} link controllati</span>}
            {verificaTutti.error && <span className="text-[#ff8a00]">{msg(verificaTutti.error)}</span>}
          </div>

          {modulo ? (
            <Modulo key={modulo.voce?.id ?? "nuovo"} codice={codice} d={d} voce={modulo.voce} onChiudi={() => setModulo(null)} />
          ) : (
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={() => setModulo({ voce: null })} className="tbh-neon-btn inline-flex items-center gap-1.5 px-5 py-2.5 text-sm" data-testid="nuovo-social">
                <Plus size={16} /> Aggiungi profilo
              </button>
            </div>
          )}

          <section className="tbh-card flex flex-col gap-3 p-4 md:p-5">
            <h2 className="tbh-display flex items-center gap-2 text-lg uppercase">
              <Upload size={18} /> Importa un elenco di URL
            </h2>
            <p className="text-xs text-[var(--tbh-muted)]">
              Uno per riga. La piattaforma si riconosce dall'indirizzo, il nome si legge dai dati pubblici della pagina (se la piattaforma li fornisce). Ogni voce entra «da
              verificare»; i doppioni si scartano.
            </p>
            <textarea value={testo} onChange={(e) => setTesto(e.target.value)} rows={4} className={campo} placeholder={"https://www.youtube.com/@…\nhttps://www.tiktok.com/@…"} data-testid="import-testo" />
            <div className="flex flex-wrap items-center gap-2">
              <select value={catImport} onChange={(e) => setCatImport(e.target.value)} className={`${campo} w-auto`}>
                {d.categorie.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nome}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => importa.mutate({ codice, testo, categoria: catImport as never }, { onSuccess: () => setTesto("") })}
                disabled={!testo.trim() || importa.isPending}
                className="tbh-neon-btn inline-flex items-center gap-1.5 px-5 py-2.5 text-sm disabled:opacity-40"
                data-testid="importa-social"
              >
                {importa.isPending && <Loader2 size={15} className="animate-spin" />} Importa
              </button>
            </div>
            {importa.error && <p className="text-xs text-[#ff8a00]">{msg(importa.error)}</p>}
            {importa.data && (
              <ul className="flex flex-col gap-1 text-xs" data-testid="esito-import">
                {importa.data.risultati.map((r) => (
                  <li key={r.url} className="break-all">
                    <b style={{ color: r.esito === "aggiunto" ? NEON : "#ff8a00" }}>{r.esito}</b> · {r.url} — {r.messaggio}
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="tbh-card flex flex-col gap-3 p-4 md:p-5" data-testid="statistiche-social">
            <h2 className="tbh-display text-lg uppercase">Statistiche dei clic</h2>
            <p className="text-xs text-[var(--tbh-muted)]">Solo conteggi aggregati per profilo e pulsante: nessun dato dei visitatori. I follower reali si leggono sulle piattaforme.</p>
            <div className="flex flex-wrap gap-2 text-xs">
              {Object.entries(AZIONI).map(([k, nome]) => (
                <span key={k} className="rounded-full border border-[var(--tbh-line)] px-3 py-1.5">
                  {nome}: <b>{totali[k] ?? 0}</b>
                </span>
              ))}
            </div>
            {d.giorni.length > 0 && (
              <div className="flex h-20 items-end gap-1" aria-label="Clic per giorno, ultimi 30 giorni">
                {d.giorni.map((g) => (
                  <span key={g.giorno} title={`${g.giorno}: ${g.n}`} className="min-w-[6px] flex-1 rounded-t bg-[#ff3df0]" style={{ height: `${Math.max(6, (g.n / maxGiorno) * 100)}%` }} />
                ))}
              </div>
            )}
            {migliori.length > 0 ? (
              <ol className="grid gap-1 text-xs sm:grid-cols-2">
                {migliori.map(({ v, n }, i) => (
                  <li key={v.id} className="truncate">
                    {i + 1}. {v.nome} <span className="text-[var(--tbh-muted)]">· {n} clic</span>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="text-xs text-[var(--tbh-muted)]">Ancora nessun clic registrato.</p>
            )}
          </section>

          <section className="flex flex-col gap-3">
            <div className="grid gap-2 md:grid-cols-[1.5fr_1fr_1fr]">
              <label className="relative block">
                <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--tbh-muted)]" />
                <input value={cerca} onChange={(e) => setCerca(e.target.value)} placeholder="Cerca nome, handle, indirizzo…" className={`${campo} pl-9`} />
              </label>
              <select value={fStato} onChange={(e) => setFStato(e.target.value)} className={campo} data-testid="filtro-stato">
                <option value="tutti">Tutti gli stati</option>
                {d.stati.map((s) => (
                  <option key={s} value={s}>
                    {NOMI_STATO[s]?.nome ?? s}
                  </option>
                ))}
                <option value="rotti">Solo link rotti</option>
              </select>
              <select value={fCat} onChange={(e) => setFCat(e.target.value)} className={campo}>
                <option value="tutte">Tutte le categorie</option>
                {d.categorie.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nome}
                  </option>
                ))}
              </select>
            </div>
            {ordina.error && <p className="text-xs text-[#ff8a00]">{msg(ordina.error)}</p>}
            {d.categorie.map((c) => {
              const righe = voci.filter((v) => v.categoria === c.id);
              if (!righe.length) return null;
              return (
                <div key={c.id}>
                  <h3 className="mb-2 mt-2 text-sm font-bold uppercase tracking-wide text-[var(--tbh-gold)]">
                    {c.nome} <span className="font-normal text-[var(--tbh-muted)]">· {righe.length}</span>
                  </h3>
                  <ul className="flex flex-col gap-2">
                    {righe.map((v, i) => (
                      <Riga
                        key={v.id}
                        codice={codice}
                        v={v}
                        su={!filtroLibero && i > 0 ? () => sposta(v, -1) : undefined}
                        giu={!filtroLibero && i < righe.length - 1 ? () => sposta(v, 1) : undefined}
                        onModifica={() => {
                          setModulo({ voce: v });
                          window.scrollTo({ top: 0, behavior: "smooth" });
                        }}
                      />
                    ))}
                  </ul>
                </div>
              );
            })}
            {voci.length === 0 && (
              <p className="flex items-center gap-2 text-sm text-[var(--tbh-muted)]">
                <AlertTriangle size={15} /> Nessuna voce con questi filtri.
              </p>
            )}
          </section>
        </>
      )}
    </div>
  );
}
