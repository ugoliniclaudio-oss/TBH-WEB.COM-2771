import { useMemo, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  Eye,
  Loader2,
  Lock,
  Pencil,
  Plus,
  Save,
  Trash2,
  X,
} from "lucide-react";
import {
  CampoAllegati,
  CampoGallery,
  CampoImmagine,
  SbloccoSeServe,
} from "./media-manager";
import { InAllestimento } from "./in-allestimento";
import { useCodiceAllestimento } from "../lib/codice-allestimento";
import { useMediaSlot, useStatoAllestimento } from "../queries/media";
import {
  useCambiaStatoScheda,
  useEliminaScheda,
  useRiordinaSchede,
  useSalvaScheda,
  useSchede,
  type DatiScheda,
} from "../queries/schede";
import {
  ETICHETTE_STATO,
  STATI_SCHEDA,
  sezione as trovaSezione,
  slotScheda,
  type CampoComune,
  type SezioneAmministrabile as Registro,
  type StatoScheda,
} from "../../api/data/sezioni-amministrabili";

/**
 * ────────────────────────────────────────────────────────────────────────────────
 * SEZIONE AMMINISTRABILE — il modulo unico richiesto da Claudio il 28/09/2026.
 *
 * «Entri → scegli la sezione → Modifica → carichi foto → inserisci informazioni →
 *  anteprima → pubblichi.»
 *
 * Questo componente è quel flusso, ed è lo stesso per ogni sezione del sito. Una
 * pagina che vuole diventare amministrabile scrive una riga:
 *
 *     <SezioneAmministrabile sezione="miss-cool-tappe" />
 *
 * e ottiene: elenco dei contenuti pubblicati per i visitatori, e per l'amministratore
 * riconosciuto i comandi ＋ AGGIUNGI CONTENUTO · ✏️ MODIFICA · 🖼️ CARICA IMMAGINE ·
 * 👁 ANTEPRIMA · 💾 SALVA · PUBBLICA, più gallery, allegati, riordino e il ciclo
 * bozza → anteprima → pubblicato → archiviato.
 *
 * Quello che NON fa, per regola TBH:
 * · non mostra mai un contenuto finto: se non c'è niente di pubblicato il visitatore
 *   legge IN ALLESTIMENTO, non un esempio inventato;
 * · non mostra un solo comando amministrativo a chi non ha il codice;
 * · non pubblica niente da sé: la pubblicazione è sempre un gesto di chi amministra.
 * ────────────────────────────────────────────────────────────────────────────────
 */

/* ── Etichette dei campi comuni, in italiano ────────────────────────────────── */
const ETICHETTE: Record<CampoComune, { nome: string; tipo: "testo" | "lungo" | "url" }> = {
  sottotitolo: { nome: "Sottotitolo", tipo: "testo" },
  descrizione: { nome: "Descrizione breve", tipo: "lungo" },
  testo: { nome: "Testo completo", tipo: "lungo" },
  data: { nome: "Data", tipo: "testo" },
  categoria: { nome: "Categoria", tipo: "testo" },
  contatti: { nome: "Contatti", tipo: "testo" },
  telefono: { nome: "Telefono", tipo: "testo" },
  email: { nome: "E-mail", tipo: "testo" },
  luogo: { nome: "Luogo", tipo: "testo" },
  indirizzo: { nome: "Indirizzo", tipo: "testo" },
  mapsUrl: { nome: "Link mappa", tipo: "url" },
  linkUrl: { nome: "Link", tipo: "url" },
  pulsanti: { nome: "Pulsanti", tipo: "testo" },
};

type Scheda = {
  id: number;
  chiave: string;
  sezione: string;
  slug: string;
  titolo: string;
  sottotitolo: string | null;
  descrizione: string | null;
  testo: string | null;
  data: string | null;
  categoria: string | null;
  contatti: string | null;
  telefono: string | null;
  email: string | null;
  luogo: string | null;
  indirizzo: string | null;
  mapsUrl: string | null;
  linkUrl: string | null;
  pulsanti: { testo: string; url: string }[];
  campi: Record<string, string>;
  stato: string;
  riservato: boolean;
  notaInterna: string | null;
  ordine: number;
  slot: { copertina: string; gallery: string; allegati: string };
};

/* ── Pezzi di interfaccia comuni ────────────────────────────────────────────── */

function Pastiglia({ stato }: { stato: string }) {
  const colori: Record<string, string> = {
    bozza: "border-white/25 text-white/70",
    anteprima: "border-[var(--tbh-gold)]/60 text-[var(--tbh-gold)]",
    pubblicato: "border-[var(--tbh-neon)]/60 text-[var(--tbh-neon)]",
    archiviato: "border-white/15 text-white/40",
  };
  return (
    <span
      className={`tbh-dato inline-flex rounded-full border px-2 py-0.5 text-[9px] font-bold tracking-[0.14em] ${
        colori[stato] ?? "border-white/20 text-white/60"
      }`}
    >
      {ETICHETTE_STATO[stato as StatoScheda] ?? stato.toUpperCase()}
    </span>
  );
}

/** La copertina di una scheda, così come la vede il pubblico (niente se manca). */
export function CopertinaScheda({
  chiave,
  proporzione = "16 / 10",
  className = "",
}: {
  chiave: string;
  proporzione?: string;
  className?: string;
}) {
  const { codice } = useCodiceAllestimento();
  const q = useMediaSlot(slotScheda(chiave).copertina, codice || undefined);
  const items = q.data?.items ?? [];
  const pubblicata = items.find((i) => i.stato === "pubblicato") ?? items[0];
  if (!pubblicata) return null;
  return (
    <div
      className={`overflow-hidden rounded-2xl bg-white ${className}`}
      style={{ aspectRatio: proporzione }}
    >
      <img
        src={pubblicata.url}
        alt={pubblicata.descrizione ?? pubblicata.titolo ?? ""}
        loading="lazy"
        className="h-full w-full object-cover"
      />
    </div>
  );
}

function campoTesto(
  etichetta: string,
  valore: string,
  onCambia: (v: string) => void,
  tipo: "testo" | "lungo" | "url" | "numero" | "data" | "si-no" | "scelta" = "testo",
  extra?: { opzioni?: string[]; aiuto?: string },
) {
  const stile =
    "w-full rounded-xl border border-white/15 bg-black/50 px-3 py-2 text-xs outline-none focus:border-[var(--tbh-neon)]";
  return (
    <label className="grid gap-1.5">
      <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--tbh-muted)]">
        {etichetta}
      </span>
      {tipo === "lungo" ? (
        <textarea rows={4} value={valore} onChange={(e) => onCambia(e.target.value)} className={stile} />
      ) : tipo === "scelta" ? (
        <select value={valore} onChange={(e) => onCambia(e.target.value)} className={stile}>
          <option value="">— non indicato —</option>
          {(extra?.opzioni ?? []).map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
      ) : tipo === "si-no" ? (
        <select value={valore} onChange={(e) => onCambia(e.target.value)} className={stile}>
          <option value="">— non indicato —</option>
          <option value="si">Sì</option>
          <option value="no">No</option>
        </select>
      ) : (
        <input
          type={tipo === "numero" ? "number" : tipo === "data" ? "date" : "text"}
          value={valore}
          onChange={(e) => onCambia(e.target.value)}
          className={stile}
        />
      )}
      {extra?.aiuto && <span className="text-[10px] text-[var(--tbh-muted)]">{extra.aiuto}</span>}
    </label>
  );
}

/* ── La scheda come la vede il visitatore ───────────────────────────────────── */

export function CardScheda({
  scheda,
  registro,
  admin = false,
  onModifica,
}: {
  scheda: Scheda;
  registro: Registro;
  admin?: boolean;
  onModifica?: () => void;
}) {
  const extra = registro.extra ?? [];
  const valoriExtra = extra
    .map((c) => ({ nome: c.nome, valore: scheda.campi[c.chiave] }))
    .filter((v) => v.valore);

  return (
    <article className="tbh-card grid gap-3 p-4">
      {registro.copertina && <CopertinaScheda chiave={scheda.chiave} />}
      <div className="grid gap-1">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="tbh-display text-lg leading-tight">{scheda.titolo}</h3>
          {admin && <Pastiglia stato={scheda.stato} />}
        </div>
        {scheda.sottotitolo && (
          <p className="text-[12px] text-[var(--tbh-gold)]">{scheda.sottotitolo}</p>
        )}
        {(scheda.data || scheda.luogo || scheda.categoria) && (
          <p className="tbh-dato text-[10px] uppercase tracking-[0.14em] text-[var(--tbh-muted)]">
            {[scheda.data, scheda.luogo, scheda.categoria].filter(Boolean).join(" · ")}
          </p>
        )}
      </div>
      {scheda.descrizione && (
        <p className="text-[13px] leading-relaxed text-white/80">{scheda.descrizione}</p>
      )}
      {scheda.testo && (
        <p className="whitespace-pre-line text-[12px] leading-relaxed text-[var(--tbh-muted)]">
          {scheda.testo}
        </p>
      )}
      {valoriExtra.length > 0 && (
        <dl className="grid gap-1 text-[11px]">
          {valoriExtra.map((v) => (
            <div key={v.nome} className="flex gap-2">
              <dt className="text-[var(--tbh-muted)]">{v.nome}</dt>
              <dd className="text-white/85">{v.valore}</dd>
            </div>
          ))}
        </dl>
      )}
      {(scheda.telefono || scheda.email || scheda.contatti || scheda.indirizzo) && (
        <div className="grid gap-0.5 text-[11px] text-white/75">
          {scheda.contatti && <span>{scheda.contatti}</span>}
          {scheda.telefono && <a href={`tel:${scheda.telefono}`}>{scheda.telefono}</a>}
          {scheda.email && <a href={`mailto:${scheda.email}`}>{scheda.email}</a>}
          {scheda.indirizzo && <span className="text-[var(--tbh-muted)]">{scheda.indirizzo}</span>}
        </div>
      )}
      {(scheda.pulsanti.length > 0 || scheda.linkUrl || scheda.mapsUrl) && (
        <div className="flex flex-wrap gap-2 pt-1">
          {scheda.pulsanti.map((p) => (
            <a
              key={`${p.testo}${p.url}`}
              href={p.url}
              target={p.url.startsWith("http") ? "_blank" : undefined}
              rel="noreferrer"
              className="tbh-neon-btn px-4 py-1.5 text-[11px]"
            >
              {p.testo || "Apri"}
            </a>
          ))}
          {scheda.linkUrl && !scheda.pulsanti.length && (
            <a
              href={scheda.linkUrl}
              target="_blank"
              rel="noreferrer"
              className="rounded-full border border-white/20 px-4 py-1.5 text-[11px] font-bold uppercase tracking-wide text-[var(--tbh-muted)] hover:text-white"
            >
              Apri
            </a>
          )}
          {scheda.mapsUrl && (
            <a
              href={scheda.mapsUrl}
              target="_blank"
              rel="noreferrer"
              className="rounded-full border border-white/20 px-4 py-1.5 text-[11px] font-bold uppercase tracking-wide text-[var(--tbh-muted)] hover:text-white"
            >
              Mappa
            </a>
          )}
        </div>
      )}
      {registro.gallery && <GalleryPubblica chiave={scheda.chiave} />}
      {admin && onModifica && (
        <button
          type="button"
          onClick={onModifica}
          className="mt-1 inline-flex items-center justify-center gap-1.5 rounded-full border border-[var(--tbh-neon)]/50 px-4 py-1.5 text-[11px] font-bold uppercase tracking-wide text-[var(--tbh-neon)]"
        >
          <Pencil size={13} /> Modifica
        </button>
      )}
    </article>
  );
}

/** Le foto pubblicate della gallery di una scheda: nessun riquadro se non ce ne sono. */
function GalleryPubblica({ chiave }: { chiave: string }) {
  const q = useMediaSlot(slotScheda(chiave).gallery, undefined);
  const foto = (q.data?.items ?? []).filter((i) => i.stato === "pubblicato");
  if (foto.length === 0) return null;
  return (
    <div className="grid grid-cols-3 gap-2">
      {foto.slice(0, 9).map((f) => (
        <img
          key={f.id}
          src={f.url}
          alt={f.descrizione ?? ""}
          loading="lazy"
          className="aspect-square w-full rounded-lg object-cover"
        />
      ))}
    </div>
  );
}

/* ── L'editor: informazioni, immagini, anteprima, pubblicazione ─────────────── */

export function EditorScheda({
  registro,
  scheda,
  onChiudi,
}: {
  registro: Registro;
  scheda: Scheda | null;
  onChiudi: () => void;
}) {
  const { codice } = useCodiceAllestimento();
  const salva = useSalvaScheda();
  const cambiaStato = useCambiaStatoScheda();
  const elimina = useEliminaScheda();
  const [scheda_, setScheda] = useState<Scheda | null>(scheda);
  const corrente = scheda_ ?? scheda;

  const [pannello, setPannello] = useState<"informazioni" | "immagini" | "anteprima">(
    "informazioni",
  );
  const [avvisoElimina, setAvvisoElimina] = useState<string | null>(null);

  const [titolo, setTitolo] = useState(corrente?.titolo ?? "");
  const [comuni, setComuni] = useState<Record<string, string>>(() => {
    const v: Record<string, string> = {};
    for (const c of registro.campi) {
      if (c === "pulsanti") continue;
      v[c] = ((corrente?.[c as keyof Scheda] as string | null) ?? "") || "";
    }
    return v;
  });
  const [extra, setExtra] = useState<Record<string, string>>(() => ({ ...(corrente?.campi ?? {}) }));
  const [pulsanti, setPulsanti] = useState<{ testo: string; url: string }[]>(
    corrente?.pulsanti ?? [],
  );
  const [nota, setNota] = useState(corrente?.notaInterna ?? "");
  const [riservato, setRiservato] = useState(corrente?.riservato ?? Boolean(registro.riservata));

  const salvabile = titolo.trim().length > 0 && codice.length > 0;

  function dati(): DatiScheda {
    const d: DatiScheda = { titolo: titolo.trim(), notaInterna: nota.trim() || null, riservato };
    for (const [k, v] of Object.entries(comuni)) {
      (d as Record<string, unknown>)[k] = v.trim() || null;
    }
    d.campi = extra;
    d.pulsanti = pulsanti.filter((p) => p.testo.trim() || p.url.trim());
    return d;
  }

  async function esegui(dopo?: (chiave: string) => void) {
    const res = await salva.mutateAsync({
      codice,
      sezione: registro.chiave,
      chiave: corrente?.chiave,
      dati: dati(),
    });
    setScheda(res.scheda as unknown as Scheda);
    dopo?.(res.scheda.chiave);
  }

  const chiave = corrente?.chiave;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 p-3 md:p-6">
      <div className="mx-auto grid max-w-3xl gap-5 rounded-3xl border border-[var(--tbh-neon)]/30 bg-[#08090c] p-4 md:p-6">
        {/* Intestazione */}
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-[10px] uppercase tracking-[0.25em] text-[var(--tbh-neon)]">
              {registro.nome}
            </p>
            <h2 className="tbh-display text-xl leading-tight">
              {corrente ? `Modifica ${registro.elemento}` : `Nuovo ${registro.elemento}`}
            </h2>
            {corrente && (
              <p className="mt-1 flex items-center gap-2 text-[11px] text-[var(--tbh-muted)]">
                <Pastiglia stato={corrente.stato} /> {corrente.chiave}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onChiudi}
            aria-label="Chiudi"
            className="rounded-full border border-white/20 p-2 text-white/70 hover:text-white"
          >
            <X size={16} />
          </button>
        </div>

        {registro.nota && (
          <p className="rounded-xl border border-[var(--tbh-gold)]/30 bg-[var(--tbh-gold)]/5 p-3 text-[11px] text-[var(--tbh-gold)]">
            {registro.nota}
          </p>
        )}

        {/* Schede del pannello */}
        <div className="flex flex-wrap gap-2 border-b border-white/10 pb-3">
          {(["informazioni", "immagini", "anteprima"] as const).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPannello(p)}
              disabled={p !== "informazioni" && !chiave}
              className={`rounded-full px-4 py-1.5 text-[11px] font-bold uppercase tracking-wide disabled:opacity-30 ${
                pannello === p
                  ? "bg-[var(--tbh-neon)] text-black"
                  : "border border-white/20 text-[var(--tbh-muted)]"
              }`}
            >
              {p === "informazioni" ? "Informazioni" : p === "immagini" ? "Immagini" : "Anteprima"}
            </button>
          ))}
          {!chiave && (
            <span className="self-center text-[10px] text-[var(--tbh-muted)]">
              Salva il titolo: poi si caricano le immagini.
            </span>
          )}
        </div>

        {/* INFORMAZIONI */}
        {pannello === "informazioni" && (
          <div className="grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              {campoTesto("Titolo (obbligatorio)", titolo, setTitolo)}
            </div>
            {registro.campi
              .filter((c) => c !== "pulsanti")
              .map((c) => {
                const meta = ETICHETTE[c];
                const largo = meta.tipo === "lungo";
                return (
                  <div key={c} className={largo ? "md:col-span-2" : ""}>
                    {campoTesto(
                      meta.nome,
                      comuni[c] ?? "",
                      (v) => setComuni((s) => ({ ...s, [c]: v })),
                      meta.tipo,
                    )}
                  </div>
                );
              })}
            {(registro.extra ?? []).map((c) => (
              <div key={c.chiave} className={c.tipo === "lungo" ? "md:col-span-2" : ""}>
                {campoTesto(
                  c.nome,
                  extra[c.chiave] ?? "",
                  (v) => setExtra((s) => ({ ...s, [c.chiave]: v })),
                  c.tipo,
                  { opzioni: c.opzioni, aiuto: c.aiuto },
                )}
              </div>
            ))}

            {/* Pulsanti / CTA */}
            {registro.campi.includes("pulsanti") && (
              <div className="grid gap-2 md:col-span-2">
                <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--tbh-muted)]">
                  Pulsanti — testo e destinazione
                </span>
                {pulsanti.map((p, i) => (
                  <div key={i} className="flex flex-wrap gap-2">
                    <input
                      value={p.testo}
                      onChange={(e) =>
                        setPulsanti((s) =>
                          s.map((x, j) => (j === i ? { ...x, testo: e.target.value } : x)),
                        )
                      }
                      placeholder="Testo del pulsante"
                      className="w-40 rounded-xl border border-white/15 bg-black/50 px-3 py-2 text-xs outline-none focus:border-[var(--tbh-neon)]"
                    />
                    <input
                      value={p.url}
                      onChange={(e) =>
                        setPulsanti((s) =>
                          s.map((x, j) => (j === i ? { ...x, url: e.target.value } : x)),
                        )
                      }
                      placeholder="https://… oppure /pagina-interna"
                      className="min-w-[200px] grow rounded-xl border border-white/15 bg-black/50 px-3 py-2 text-xs outline-none focus:border-[var(--tbh-neon)]"
                    />
                    <button
                      type="button"
                      onClick={() => setPulsanti((s) => s.filter((_, j) => j !== i))}
                      className="rounded-full border border-red-400/40 px-3 py-1.5 text-[11px] text-red-300"
                    >
                      Togli
                    </button>
                  </div>
                ))}
                {pulsanti.length < 4 && (
                  <button
                    type="button"
                    onClick={() => setPulsanti((s) => [...s, { testo: "", url: "" }])}
                    className="justify-self-start rounded-full border border-white/20 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wide text-[var(--tbh-muted)] hover:text-white"
                  >
                    + Aggiungi pulsante
                  </button>
                )}
                <p className="text-[10px] text-[var(--tbh-muted)]">
                  Un pulsante senza destinazione non viene mostrato: non mandiamo nessuno nel vuoto.
                </p>
              </div>
            )}

            {/* Riservatezza e note interne */}
            <div className="grid gap-2 md:col-span-2">
              <label className="flex items-start gap-2 text-[11px] text-white/80">
                <input
                  type="checkbox"
                  checked={riservato}
                  disabled={Boolean(registro.riservata)}
                  onChange={(e) => setRiservato(e.target.checked)}
                  className="mt-0.5"
                />
                <span>
                  <strong>Contenuto riservato</strong> — dati personali o amministrativi: non esce
                  mai in pubblico, in nessuno stato.
                  {registro.riservata && " Per questa sezione è obbligatorio."}
                </span>
              </label>
              {campoTesto("Note amministrative (non pubbliche)", nota, setNota, "lungo")}
            </div>
          </div>
        )}

        {/* IMMAGINI — è qui che vive il Media Manager */}
        {pannello === "immagini" && chiave && (
          <div className="grid gap-6">
            {registro.copertina && (
              <CampoImmagine
                slot={slotScheda(chiave).copertina}
                etichetta="Immagine principale"
                aiuto="Carica dal dispositivo, trascina il file oppure scegli dalla Libreria Media TBH. JPG, PNG, WEBP."
                titolo={titolo}
                proporzione="16 / 10"
              />
            )}
            {registro.gallery && (
              <CampoGallery
                slot={slotScheda(chiave).gallery}
                etichetta="Gallery fotografica"
                aiuto="Aggiungi più foto in una volta, riordinale con le frecce, scegli la principale con la stella."
              />
            )}
            {registro.allegati && (
              <CampoAllegati
                slot={slotScheda(chiave).allegati}
                etichetta="Allegati"
                aiuto="PDF e documenti. Gli allegati di una sezione riservata non sono mai pubblici."
                riservato={Boolean(registro.riservata) || riservato}
              />
            )}
          </div>
        )}

        {/* ANTEPRIMA — come si vedrà, prima di pubblicare */}
        {pannello === "anteprima" && corrente && (
          <div className="grid gap-3">
            <p className="text-[11px] text-[var(--tbh-muted)]">
              Così comparirà nella pagina. Salva le modifiche per vederle qui aggiornate.
            </p>
            <div className="max-w-md">
              <CardScheda scheda={corrente} registro={registro} />
            </div>
          </div>
        )}

        {/* Comandi: salva, ciclo di stato, elimina */}
        <div className="grid gap-3 border-t border-white/10 pt-4">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={!salvabile || salva.isPending}
              onClick={() => esegui()}
              className="tbh-neon-btn inline-flex items-center gap-1.5 px-5 py-2 text-[11px] disabled:opacity-40"
            >
              {salva.isPending ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
              Salva
            </button>
            <button
              type="button"
              disabled={!chiave}
              onClick={() => setPannello("anteprima")}
              className="inline-flex items-center gap-1.5 rounded-full border border-white/20 px-4 py-2 text-[11px] font-bold uppercase tracking-wide text-[var(--tbh-muted)] hover:text-white disabled:opacity-30"
            >
              <Eye size={13} /> Anteprima
            </button>
            {chiave &&
              STATI_SCHEDA.filter((s) => s !== corrente?.stato).map((s) => {
                const bloccato =
                  s === "pubblicato" && (riservato || Boolean(registro.riservata));
                return (
                  <button
                    key={s}
                    type="button"
                    disabled={cambiaStato.isPending || bloccato}
                    title={
                      bloccato
                        ? "Contenuto riservato: non si pubblica. Togli il segno di riservato per poterlo fare."
                        : undefined
                    }
                    onClick={async () => {
                      await esegui();
                      await cambiaStato.mutateAsync({ codice, chiave, stato: s });
                      setScheda((v) => (v ? { ...v, stato: s } : v));
                    }}
                    className={`rounded-full border px-4 py-2 text-[11px] font-bold uppercase tracking-wide disabled:opacity-30 ${
                      s === "pubblicato"
                        ? "border-[var(--tbh-neon)] text-[var(--tbh-neon)]"
                        : "border-white/20 text-[var(--tbh-muted)]"
                    }`}
                  >
                    {bloccato ? <Lock size={11} className="mr-1 inline" /> : null}
                    {s === "pubblicato" ? "Pubblica" : `Metti in ${ETICHETTE_STATO[s].toLowerCase()}`}
                  </button>
                );
              })}
            {chiave && (
              <button
                type="button"
                disabled={elimina.isPending}
                onClick={async () => {
                  const res = await elimina.mutateAsync({ codice, chiave });
                  if (res.ok) onChiudi();
                  else setAvvisoElimina(res.avviso ?? "Materiali agganciati a questo contenuto.");
                }}
                className="ml-auto inline-flex items-center gap-1.5 rounded-full border border-red-400/40 px-4 py-2 text-[11px] font-bold uppercase tracking-wide text-red-300 hover:bg-red-400/10"
              >
                <Trash2 size={13} /> Elimina
              </button>
            )}
          </div>

          {avvisoElimina && (
            <div className="grid gap-2 rounded-xl border border-red-400/40 bg-red-400/5 p-3">
              <p className="text-[11px] text-red-200">{avvisoElimina}</p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={async () => {
                    if (!chiave) return;
                    await elimina.mutateAsync({ codice, chiave, forza: true });
                    onChiudi();
                  }}
                  className="rounded-full border border-red-400/60 px-4 py-1.5 text-[11px] font-bold uppercase tracking-wide text-red-200"
                >
                  Elimina comunque
                </button>
                <button
                  type="button"
                  onClick={() => setAvvisoElimina(null)}
                  className="rounded-full border border-white/20 px-4 py-1.5 text-[11px] font-bold uppercase tracking-wide text-[var(--tbh-muted)]"
                >
                  Annulla
                </button>
              </div>
            </div>
          )}

          {salva.error && (
            <p className="text-[11px] text-red-400">Non salvato: {(salva.error as Error).message}</p>
          )}
          {cambiaStato.error && (
            <p className="text-[11px] text-red-400">
              Stato non cambiato: {(cambiaStato.error as Error).message}
            </p>
          )}
          <p className="text-[10px] text-[var(--tbh-muted)]">
            Ciclo: BOZZA → ANTEPRIMA → PUBBLICATO → ARCHIVIATO. Si può cominciare oggi e finire
            quando arriva il materiale: nulla diventa pubblico da solo.
          </p>
        </div>
      </div>
    </div>
  );
}

/* ── Il modulo completo da mettere nelle pagine ─────────────────────────────── */

export function SezioneAmministrabile({
  sezione,
  titolo,
  intro,
  colonne = "md:grid-cols-2 xl:grid-cols-3",
  limite,
  render,
  vuotoNascosto = false,
  sblocco = true,
}: {
  /** Chiave della sezione nel registro (api/data/sezioni-amministrabili.ts). */
  sezione: string;
  /** Titolo mostrato sopra l'elenco: se manca si usa il nome del registro. */
  titolo?: string;
  intro?: string;
  colonne?: string;
  /** Mostra al massimo N contenuti (per le anteprime in home). */
  limite?: number;
  /** Disegno personalizzato di una scheda, per le pagine che hanno già un loro stile. */
  render?: (scheda: Scheda, registro: Registro) => React.ReactNode;
  /** true = se non c'è niente di pubblicato la sezione non compare affatto. */
  vuotoNascosto?: boolean;
  /** false = non mostrare il collegamento discreto «sono l'amministratore» (pagine con più sezioni). */
  sblocco?: boolean;
}) {
  const registro = useMemo(() => trovaSezione(sezione), [sezione]);
  const { codice } = useCodiceAllestimento();
  const statoServer = useStatoAllestimento();
  const q = useSchede(sezione, { codice: codice || undefined });
  const riordina = useRiordinaSchede();
  const [editor, setEditor] = useState<{ scheda: Scheda | null } | null>(null);

  const admin = codice.length > 0 && (statoServer.data?.attivo ?? true) && (q.data?.admin ?? false);
  const tutte = (q.data?.items ?? []) as unknown as Scheda[];
  const visibili = limite ? tutte.slice(0, limite) : tutte;

  if (!registro) {
    return (
      <p className="text-[11px] text-red-400">
        Sezione «{sezione}» non presente nel registro delle sezioni amministrabili.
      </p>
    );
  }
  if (tutte.length === 0 && !admin && vuotoNascosto) return null;

  async function muovi(i: number, verso: -1 | 1) {
    const ordinate = [...tutte];
    const j = i + verso;
    if (j < 0 || j >= ordinate.length) return;
    const a = ordinate[i]!;
    ordinate[i] = ordinate[j]!;
    ordinate[j] = a;
    await riordina.mutateAsync({ codice, chiavi: ordinate.map((s) => s.chiave) });
  }

  return (
    <section className="grid gap-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="tbh-display text-2xl leading-tight">{titolo ?? registro.nome}</h2>
          {(intro ?? registro.descrizione) && (
            <p className="mt-1 max-w-2xl text-[12px] text-[var(--tbh-muted)]">
              {intro ?? registro.descrizione}
            </p>
          )}
        </div>
        {admin && (
          <button
            type="button"
            onClick={() => setEditor({ scheda: null })}
            className="tbh-neon-btn inline-flex items-center gap-1.5 px-4 py-2 text-[11px]"
          >
            <Plus size={14} /> Aggiungi {registro.elemento}
          </button>
        )}
      </div>

      {admin && registro.riservata && (
        <p className="inline-flex items-center gap-2 rounded-xl border border-[var(--tbh-gold)]/40 bg-[var(--tbh-gold)]/5 p-3 text-[11px] text-[var(--tbh-gold)]">
          <Lock size={13} /> Sezione riservata: questi contenuti non compaiono mai sul sito
          pubblico.
        </p>
      )}

      {q.isLoading ? (
        <p className="text-[11px] text-[var(--tbh-muted)]">Carico…</p>
      ) : visibili.length === 0 ? (
        admin ? (
          <p className="rounded-2xl border border-dashed border-white/20 p-5 text-[12px] text-[var(--tbh-muted)]">
            Ancora nessun {registro.elemento}. Usa «Aggiungi {registro.elemento}»: basta il titolo
            per cominciare, le foto e il resto si caricano anche dopo.
          </p>
        ) : (
          <InAllestimento cosa={registro.nome} />
        )
      ) : (
        <div className={`grid gap-4 ${colonne}`}>
          {visibili.map((s, i) => (
            <div key={s.chiave} className="grid gap-2">
              {render ? render(s, registro) : (
                <CardScheda
                  scheda={s}
                  registro={registro}
                  admin={admin}
                  onModifica={() => setEditor({ scheda: s })}
                />
              )}
              {admin && !limite && (
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => muovi(i, -1)}
                    disabled={i === 0 || riordina.isPending}
                    aria-label="Sposta su"
                    className="rounded-full border border-white/20 p-1.5 text-white/60 disabled:opacity-25"
                  >
                    <ArrowUp size={12} />
                  </button>
                  <button
                    type="button"
                    onClick={() => muovi(i, 1)}
                    disabled={i === visibili.length - 1 || riordina.isPending}
                    aria-label="Sposta giù"
                    className="rounded-full border border-white/20 p-1.5 text-white/60 disabled:opacity-25"
                  >
                    <ArrowDown size={12} />
                  </button>
                  {render && (
                    <button
                      type="button"
                      onClick={() => setEditor({ scheda: s })}
                      className="inline-flex items-center gap-1.5 rounded-full border border-[var(--tbh-neon)]/50 px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-[var(--tbh-neon)]"
                    >
                      <Pencil size={11} /> Modifica
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {!admin && sblocco && <SbloccoSeServe />}

      {editor && (
        <EditorScheda
          registro={registro}
          scheda={editor.scheda}
          onChiudi={() => setEditor(null)}
        />
      )}
    </section>
  );
}
