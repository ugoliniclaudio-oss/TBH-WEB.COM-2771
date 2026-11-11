import { useMemo, useState } from "react";
import { Link } from "wouter";
import { AlertTriangle, CalendarDays, Check, Disc3, ExternalLink, Loader2, Plus, Save, Trash2, X } from "lucide-react";

import {
  AMBITI_LINK,
  INFO_PIATTAFORME,
  MESSAGGIO_ATTESA,
  PERCORSI_MUSICA,
  PIATTAFORME_USCITA,
  RICORRENZE,
  RICORRENZA_LEGGIBILE,
  STATI_USCITA,
  STATO_LEGGIBILE,
  TIPI_USCITA,
  erroreIsrc,
  erroreUpc,
  erroreUrl,
  type AmbitoLink,
  type PiattaformaUscita,
  type Ricorrenza,
  type StatoUscita,
  type TipoUscita,
} from "../../api/data/uscite-musicali";
import { useCreaBranoUscita, useRimuoviUscita, useSalvaUscita, useUsciteAdmin } from "../queries/uscite-musicali";

/* ════════════════════════════════════════════════════════════════════════════
   ALLESTIMENTO → MUSICA → «USCITE E STORE» (04/11/2026, round 16).

   Una scheda di pubblicazione per ogni singolo o album: data di uscita, etichetta,
   e un collegamento per piattaforma (HyperFollow, Spotify, Apple Music, Amazon Music,
   YouTube Music, video ufficiale YouTube, Deezer, Tidal, altri store, social).
   Ogni collegamento ha: data programmata, disponibilità confermata, ultima verifica.
   Salvando qui si aggiornano insieme scheda del brano, catalogo, calendario uscite,
   pagina dell'artista e Channel musica.
   ════════════════════════════════════════════════════════════════════════════ */

const INPUT =
  "w-full rounded-xl border border-[var(--tbh-line)] bg-black/30 px-3 py-2.5 text-[14px] outline-none focus:border-[var(--tbh-neon)]";
const BOTTONE_SCURO =
  "inline-flex items-center justify-center gap-2 rounded-xl border border-[var(--tbh-line)] px-3 py-2 text-[12px] font-extrabold uppercase tracking-[0.12em] text-[var(--tbh-muted)] transition hover:border-[var(--tbh-neon)] hover:text-white disabled:opacity-40";
const BOTTONE_NEON =
  "inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--tbh-neon)] px-4 py-2.5 text-[12px] font-extrabold uppercase tracking-[0.12em] text-black transition hover:brightness-110 disabled:opacity-40";

function Campo({ etichetta, children, nota }: { etichetta: string; children: React.ReactNode; nota?: string }) {
  return (
    <label className="block min-w-0">
      <span className="tbh-body block text-[11px] font-extrabold uppercase tracking-[0.14em] text-[var(--tbh-muted)]">{etichetta}</span>
      <div className="mt-1.5">{children}</div>
      {nota && <span className="tbh-body mt-1 block text-[11px] text-[var(--tbh-muted)]">{nota}</span>}
    </label>
  );
}

const nullo = (v: string) => v.trim() || null;

type Dati = NonNullable<ReturnType<typeof useUsciteAdmin>["data"]>;
type UscitaAdmin = Dati["uscite"][number];

type BozzaLink = {
  chiave: string;
  id?: string;
  piattaforma: PiattaformaUscita;
  ambito: AmbitoLink;
  etichetta: string;
  url: string;
  dataProgrammata: string;
  disponibilitaConfermata: boolean;
  ultimaVerifica: string;
  notaVerifica: string;
};

let contatore = 0;
const nuovaChiave = () => `b${Date.now().toString(36)}${(contatore++).toString(36)}`;

function bozzaDa(u: UscitaAdmin) {
  return {
    tipo: u.tipo as TipoUscita,
    artistaDistribuito: u.artistaDistribuito ?? "",
    distribuzione: u.distribuzione ?? "",
    isrc: u.isrc ?? "",
    upc: u.upc ?? "",
    stato: (u.stato ?? "") as StatoUscita | "",
    ricorrenza: (u.ricorrenza ?? "") as Ricorrenza | "",
    produzioneJcHugo: !!u.produzioneJcHugo,
    brano: {
      titolo: u.brano.titolo,
      artista: u.brano.artista ?? "",
      cover: u.brano.cover ?? "",
      genere: u.brano.genere ?? "",
    },
    dataUscita: u.dataUscita ?? "",
    etichettaDiscografica: u.etichettaDiscografica ?? "",
    messaggioAttesa: u.messaggioAttesa ?? "",
    notaMateriali: u.notaMateriali ?? "",
    link: u.link.map(
      (l): BozzaLink => ({
        chiave: l.id,
        id: l.id,
        piattaforma: l.piattaforma,
        ambito: l.ambito,
        etichetta: l.etichetta ?? "",
        url: l.url,
        dataProgrammata: l.dataProgrammata ?? "",
        disponibilitaConfermata: l.disponibilitaConfermata,
        ultimaVerifica: l.ultimaVerifica ?? "",
        notaVerifica: l.notaVerifica ?? "",
      }),
    ),
  };
}

function RigaLink({
  l,
  n,
  cambia,
  togli,
}: {
  l: BozzaLink;
  n: number;
  cambia: (p: Partial<BozzaLink>) => void;
  togli: () => void;
}) {
  const info = INFO_PIATTAFORME[l.piattaforma];
  const errore = l.url.trim() ? erroreUrl(l.piattaforma, l.url) : "Indirizzo mancante.";
  return (
    <div className="rounded-xl border border-[var(--tbh-line)] bg-black/20 p-3" data-testid={`riga-link-${n}`}>
      <div className="flex items-center justify-between gap-2">
        <p className="tbh-body text-[11px] font-extrabold uppercase tracking-[0.14em] text-[var(--tbh-neon)]">
          Link {n} · {info.nome}
        </p>
        <button type="button" onClick={togli} className={BOTTONE_SCURO} aria-label={`Togli il link ${n}`}>
          <X size={13} /> Togli
        </button>
      </div>
      <div className="mt-3 grid gap-3 md:grid-cols-[220px_1fr]">
        <Campo etichetta="Piattaforma">
          <select
            value={l.piattaforma}
            onChange={(e) => {
              const p = e.target.value as PiattaformaUscita;
              cambia({ piattaforma: p, ambito: INFO_PIATTAFORME[p].social ? l.ambito : "brano" });
            }}
            className={INPUT}
            data-testid={`link-piattaforma-${n}`}
          >
            {PIATTAFORME_USCITA.map((p) => (
              <option key={p} value={p}>
                {INFO_PIATTAFORME[p].nome}
              </option>
            ))}
          </select>
        </Campo>
        <Campo etichetta="Indirizzo (URL completo)">
          <input
            value={l.url}
            onChange={(e) => cambia({ url: e.target.value })}
            placeholder="https://…"
            className={INPUT}
            data-testid={`link-url-${n}`}
          />
        </Campo>
      </div>
      {errore && (
        <p className="tbh-body mt-1.5 flex items-center gap-1.5 text-[12px] text-[#ff9a9a]" data-testid={`link-errore-${n}`}>
          <AlertTriangle size={13} /> {errore}
        </p>
      )}
      <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {info.social && (
          <Campo etichetta="Tipo di link">
            <select value={l.ambito} onChange={(e) => cambia({ ambito: e.target.value as AmbitoLink })} className={INPUT}>
              {AMBITI_LINK.map((a) => (
                <option key={a} value={a}>
                  {a === "profilo" ? "Profilo ufficiale" : "Link del brano"}
                </option>
              ))}
            </select>
          </Campo>
        )}
        <Campo
          etichetta={l.piattaforma === "altro-store" ? "Nome dello store (obbligatorio)" : "Testo del pulsante (facoltativo)"}
          nota={l.piattaforma === "altro-store" ? undefined : `Vuoto = «${info.social ? (l.ambito === "profilo" ? `Profilo ufficiale ${info.nome}` : `Il brano su ${info.nome}`) : info.pulsante}»`}
        >
          <input value={l.etichetta} onChange={(e) => cambia({ etichetta: e.target.value })} className={INPUT} maxLength={60} />
        </Campo>
        <Campo etichetta="Data programmata">
          <input type="date" value={l.dataProgrammata} onChange={(e) => cambia({ dataProgrammata: e.target.value })} className={INPUT} />
        </Campo>
        <Campo etichetta="Ultima verifica">
          <input type="date" value={l.ultimaVerifica} onChange={(e) => cambia({ ultimaVerifica: e.target.value })} className={INPUT} />
        </Campo>
        <label className="flex items-center gap-2 self-end pb-2.5 text-[13px]">
          <input
            type="checkbox"
            checked={l.disponibilitaConfermata}
            onChange={(e) => cambia({ disponibilitaConfermata: e.target.checked })}
            className="h-4 w-4 accent-[#d7ff00]"
            data-testid={`link-confermata-${n}`}
          />
          Disponibilità confermata
        </label>
      </div>
      <div className="mt-3">
        <Campo etichetta="Nota sulla verifica (pubblica, facoltativa)">
          <input value={l.notaVerifica} onChange={(e) => cambia({ notaVerifica: e.target.value })} className={INPUT} maxLength={300} />
        </Campo>
      </div>
    </div>
  );
}

function EditorUscita({ u, codice }: { u: UscitaAdmin; codice: string }) {
  const [b, setB] = useState(() => bozzaDa(u));
  const [ok, setOk] = useState(false);
  const [conferma, setConferma] = useState(false);
  const salva = useSalvaUscita();
  const rimuovi = useRimuoviUscita();

  // Titolo, artista, cover e genere si modificano solo per i brani della scheda master (non per le uscite storiche).
  const branoModificabile = u.brano.origine === "importato";
  const errIsrc = b.isrc.trim() ? erroreIsrc(b.isrc) : null;
  const errUpc = b.upc.trim() ? erroreUpc(b.upc) : null;
  const erroriLink = b.link.some((l) => !l.url.trim() || !!erroreUrl(l.piattaforma, l.url) || (l.piattaforma === "altro-store" && !l.etichetta.trim()));
  const errori = erroriLink || !!errIsrc || !!errUpc || (branoModificabile && !b.brano.titolo.trim());
  const cambiaBrano = (p: Partial<typeof b.brano>) => {
    setOk(false);
    setB((x) => ({ ...x, brano: { ...x.brano, ...p } }));
  };

  const cambiaLink = (i: number, p: Partial<BozzaLink>) => {
    setOk(false);
    setB((x) => ({ ...x, link: x.link.map((l, j) => (j === i ? { ...l, ...p } : l)) }));
  };

  const invia = () => {
    setOk(false);
    salva.mutate(
      {
        codice,
        uscita: {
          id: u.id,
          tipo: b.tipo,
          artistaDistribuito: nullo(b.artistaDistribuito),
          distribuzione: nullo(b.distribuzione),
          isrc: nullo(b.isrc),
          upc: nullo(b.upc),
          stato: b.stato || null,
          ricorrenza: b.ricorrenza || null,
          produzioneJcHugo: b.produzioneJcHugo,
          ...(branoModificabile
            ? {
                brano: {
                  titolo: b.brano.titolo.trim(),
                  artista: nullo(b.brano.artista),
                  cover: nullo(b.brano.cover),
                  genere: nullo(b.brano.genere),
                },
              }
            : {}),
          dataUscita: nullo(b.dataUscita),
          etichettaDiscografica: nullo(b.etichettaDiscografica),
          messaggioAttesa: nullo(b.messaggioAttesa),
          notaMateriali: nullo(b.notaMateriali),
          link: b.link.map((l) => ({
            id: l.id,
            piattaforma: l.piattaforma,
            ambito: l.ambito,
            etichetta: nullo(l.etichetta),
            url: l.url.trim(),
            dataProgrammata: nullo(l.dataProgrammata),
            disponibilitaConfermata: l.disponibilitaConfermata,
            ultimaVerifica: nullo(l.ultimaVerifica),
            notaVerifica: nullo(l.notaVerifica),
          })),
        },
      },
      {
        onSuccess: (r) => {
          // Il riquadro resta aperto con i dati salvati (id dei link assegnati dal server).
          setB((x) => ({ ...bozzaDa({ ...u, ...r.uscita, produzioneJcHugo: r.uscita.produzioneJcHugo ?? false }), brano: x.brano }));
          setOk(true);
        },
      },
    );
  };

  return (
    <article className="tbh-card p-4 md:p-5" data-testid={`editor-uscita-${u.id}`}>
      <div className="flex flex-wrap items-start gap-4">
        {u.brano.cover ? (
          <img src={u.brano.cover} alt={u.brano.titolo} className="h-20 w-20 rounded-xl object-cover" />
        ) : (
          <div className="grid h-20 w-20 place-items-center rounded-xl bg-black/40 text-center text-[9px] font-extrabold uppercase tracking-[0.1em] text-[var(--tbh-muted)]">
            Cover da caricare
          </div>
        )}
        <div className="min-w-0 flex-1">
          <h3 className="tbh-display text-[18px] leading-tight">{u.brano.titolo}</h3>
          <p className="tbh-body text-[12px] text-[var(--tbh-muted)]">
            {u.brano.artista ?? "Artista da indicare"} · id {u.id} · audio {u.brano.haAudio ? "presente" : "assente"} · video{" "}
            {u.brano.haVideo ? "presente" : "assente"}
            {u.brano.nascosto ? " · BRANO NASCOSTO" : ""}
          </p>
          <Link href={u.scheda} className="tbh-body mt-1 inline-flex items-center gap-1 text-[12px] font-bold text-[var(--tbh-neon)] hover:underline">
            Apri la scheda pubblica <ExternalLink size={12} />
          </Link>
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Campo etichetta="Tipo">
          <select value={b.tipo} onChange={(e) => setB({ ...b, tipo: e.target.value as TipoUscita })} className={INPUT}>
            {TIPI_USCITA.map((t) => (
              <option key={t} value={t}>
                {t === "album" ? "Album" : "Singolo"}
              </option>
            ))}
          </select>
        </Campo>
        <Campo etichetta="Data di uscita ufficiale" nota="Vuota = «Data da confermare». Non si ricava dai link.">
          <input type="date" value={b.dataUscita} onChange={(e) => setB({ ...b, dataUscita: e.target.value })} className={INPUT} data-testid="uscita-data" />
        </Campo>
        <Campo etichetta="Etichetta discografica">
          <input value={b.etichettaDiscografica} onChange={(e) => setB({ ...b, etichettaDiscografica: e.target.value })} className={INPUT} maxLength={80} />
        </Campo>
        <Campo etichetta="Messaggio senza link" nota={`Vuoto = «${MESSAGGIO_ATTESA}»`}>
          <input value={b.messaggioAttesa} onChange={(e) => setB({ ...b, messaggioAttesa: e.target.value })} className={INPUT} maxLength={120} />
        </Campo>
      </div>
      <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Campo etichetta="Artista distribuito (store)" nota="Come compare su Spotify / Apple Music, se diverso.">
          <input value={b.artistaDistribuito} onChange={(e) => setB({ ...b, artistaDistribuito: e.target.value })} className={INPUT} maxLength={120} data-testid="uscita-artista-distribuito" />
        </Campo>
        <Campo etichetta="Distribuzione">
          <input value={b.distribuzione} onChange={(e) => setB({ ...b, distribuzione: e.target.value })} className={INPUT} maxLength={80} placeholder="es. DistroKid" data-testid="uscita-distribuzione" />
        </Campo>
        <Campo etichetta="ISRC">
          <input value={b.isrc} onChange={(e) => setB({ ...b, isrc: e.target.value })} className={INPUT} maxLength={20} placeholder="QTAEV2679933" data-testid="uscita-isrc" />
          {errIsrc && <span className="tbh-body mt-1 block text-[11px] text-[#ff9a9a]" data-testid="uscita-isrc-errore">{errIsrc}</span>}
        </Campo>
        <Campo etichetta="UPC">
          <input value={b.upc} onChange={(e) => setB({ ...b, upc: e.target.value })} className={INPUT} maxLength={20} inputMode="numeric" data-testid="uscita-upc" />
          {errUpc && <span className="tbh-body mt-1 block text-[11px] text-[#ff9a9a]" data-testid="uscita-upc-errore">{errUpc}</span>}
        </Campo>
        <Campo etichetta="Stato" nota="Automatico = pubblicata dalla data di uscita in poi.">
          <select value={b.stato} onChange={(e) => setB({ ...b, stato: e.target.value as StatoUscita | "" })} className={INPUT} data-testid="uscita-stato">
            <option value="">Automatico (dalla data)</option>
            {STATI_USCITA.map((s) => (
              <option key={s} value={s}>
                {STATO_LEGGIBILE[s]}
              </option>
            ))}
          </select>
        </Campo>
        <Campo etichetta="Ricorrenza" nota="Solo classificazione: mai raggruppata in un album.">
          <select value={b.ricorrenza} onChange={(e) => setB({ ...b, ricorrenza: e.target.value as Ricorrenza | "" })} className={INPUT} data-testid="uscita-ricorrenza">
            <option value="">—</option>
            {RICORRENZE.map((r) => (
              <option key={r} value={r}>
                {RICORRENZA_LEGGIBILE[r]}
              </option>
            ))}
          </select>
        </Campo>
        <label className="flex items-center gap-2 self-end pb-2.5 text-[13px] sm:col-span-2">
          <input
            type="checkbox"
            checked={b.produzioneJcHugo}
            onChange={(e) => setB({ ...b, produzioneJcHugo: e.target.checked })}
            className="h-4 w-4 accent-[#d7ff00]"
            data-testid="uscita-produzione-jc"
          />
          Compare in «Produzioni DJ J.C. Hugò»
        </label>
      </div>

      <div className="mt-3 rounded-xl border border-[var(--tbh-line)] bg-black/20 p-3" data-testid="uscita-dati-brano">
        <p className="tbh-body text-[11px] font-extrabold uppercase tracking-[0.14em] text-[var(--tbh-neon)]">Dati del brano</p>
        {!branoModificabile && (
          <p className="tbh-body mt-1 text-[12px] text-[var(--tbh-muted)]">
            Brano delle uscite storiche del canale: titolo, artista, cover e genere si leggono dal catalogo e non si modificano da qui.
          </p>
        )}
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <Campo etichetta="Titolo">
            <input value={b.brano.titolo} onChange={(e) => cambiaBrano({ titolo: e.target.value })} className={INPUT} maxLength={200} disabled={!branoModificabile} data-testid="uscita-brano-titolo" />
          </Campo>
          <Campo etichetta="Artista (sul sito)">
            <input value={b.brano.artista} onChange={(e) => cambiaBrano({ artista: e.target.value })} className={INPUT} maxLength={120} disabled={!branoModificabile} data-testid="uscita-brano-artista" />
          </Campo>
          <Campo etichetta="Cover (indirizzo del file, 1:1)">
            <input value={b.brano.cover} onChange={(e) => cambiaBrano({ cover: e.target.value })} className={INPUT} maxLength={500} disabled={!branoModificabile} data-testid="uscita-brano-cover" />
          </Campo>
          <Campo etichetta="Genere">
            <input value={b.brano.genere} onChange={(e) => cambiaBrano({ genere: e.target.value })} className={INPUT} maxLength={60} disabled={!branoModificabile} data-testid="uscita-brano-genere" />
          </Campo>
        </div>
      </div>

      <div className="mt-3">
        <Campo etichetta="Nota sui materiali (pubblica)" nota="Es. audio o video non ancora pubblicati.">
          <input value={b.notaMateriali} onChange={(e) => setB({ ...b, notaMateriali: e.target.value })} className={INPUT} maxLength={400} />
        </Campo>
      </div>

      <div className="mt-4 flex flex-col gap-3">
        {b.link.length === 0 && (
          <p className="tbh-body text-[13px] text-[var(--tbh-muted)]">
            Nessun collegamento: sul sito compare «{nullo(b.messaggioAttesa) ?? MESSAGGIO_ATTESA}».
          </p>
        )}
        {b.link.map((l, i) => (
          <RigaLink
            key={l.chiave}
            l={l}
            n={i + 1}
            cambia={(p) => cambiaLink(i, p)}
            togli={() => {
              setOk(false);
              setB((x) => ({ ...x, link: x.link.filter((_, j) => j !== i) }));
            }}
          />
        ))}
        <button
          type="button"
          className={`${BOTTONE_SCURO} self-start`}
          data-testid="aggiungi-link"
          onClick={() => {
            setOk(false);
            setB((x) => ({
              ...x,
              link: [
                ...x.link,
                {
                  chiave: nuovaChiave(),
                  piattaforma: x.link.some((l) => l.piattaforma === "hyperfollow") ? "spotify" : "hyperfollow",
                  ambito: "brano",
                  etichetta: "",
                  url: "",
                  dataProgrammata: "",
                  disponibilitaConfermata: false,
                  ultimaVerifica: "",
                  notaVerifica: "",
                },
              ],
            }));
          }}
        >
          <Plus size={14} /> Aggiungi collegamento
        </button>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-[var(--tbh-line)] pt-4">
        <button type="button" className={BOTTONE_NEON} disabled={salva.isPending || errori} onClick={invia} data-testid="salva-uscita">
          {salva.isPending ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Salva scheda
        </button>
        {conferma ? (
          <>
            <span className="tbh-body text-[12px] text-[#ff9a9a]">Togliere la scheda di pubblicazione? Il brano resta nel catalogo.</span>
            <button type="button" className={BOTTONE_SCURO} onClick={() => rimuovi.mutate({ codice, id: u.id })} disabled={rimuovi.isPending}>
              <Trash2 size={13} /> Sì, togli
            </button>
            <button type="button" className={BOTTONE_SCURO} onClick={() => setConferma(false)}>
              Annulla
            </button>
          </>
        ) : (
          <button type="button" className={BOTTONE_SCURO} onClick={() => setConferma(true)}>
            <Trash2 size={13} /> Togli scheda
          </button>
        )}
        {errori && <span className="tbh-body text-[12px] text-[#ff9a9a]">Correggi i campi segnati prima di salvare.</span>}
        {ok && (
          <span className="tbh-body flex items-center gap-1 text-[12px] text-[var(--tbh-neon)]" data-testid="uscita-salvata">
            <Check size={13} /> Salvato: scheda, catalogo, calendario e pagina dell'artista aggiornati.
          </span>
        )}
        {salva.error && (
          <span className="tbh-body text-[12px] text-[#ff9a9a]" data-testid="uscita-errore">
            {(salva.error as Error).message}
          </span>
        )}
        {rimuovi.error && <span className="tbh-body text-[12px] text-[#ff9a9a]">{(rimuovi.error as Error).message}</span>}
      </div>
    </article>
  );
}

function NuovaScheda({ codice, dati }: { codice: string; dati: Dati }) {
  const crea = useCreaBranoUscita();
  const salva = useSalvaUscita();
  const [f, setF] = useState({ titolo: "", artista: "", cover: "", descrizione: "", tipo: "singolo" as TipoUscita, etichetta: "" });
  const [esistente, setEsistente] = useState("");
  const senzaScheda = useMemo(() => {
    const con = new Set(dati.uscite.map((u) => u.id));
    return dati.brani.filter((b) => !con.has(b.id));
  }, [dati]);

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <section className="tbh-card p-4 md:p-5" data-testid="crea-scheda-brano">
        <h3 className="tbh-display flex items-center gap-2 text-[18px]">
          <Plus size={18} className="text-[var(--tbh-neon)]" /> Nuovo brano + scheda
        </h3>
        <p className="tbh-body mt-1 text-[12px] text-[var(--tbh-muted)]">
          Per un singolo o un album che non è ancora nel catalogo (es. in pre-save). Il titolo viene controllato: niente doppioni.
        </p>
        <div className="mt-3 grid gap-3">
          <Campo etichetta="Titolo (obbligatorio)">
            <input value={f.titolo} onChange={(e) => setF({ ...f, titolo: e.target.value })} className={INPUT} maxLength={200} data-testid="nuovo-titolo" />
          </Campo>
          <div className="grid gap-3 sm:grid-cols-2">
            <Campo etichetta="Artista">
              <input value={f.artista} onChange={(e) => setF({ ...f, artista: e.target.value })} className={INPUT} maxLength={120} />
            </Campo>
            <Campo etichetta="Tipo">
              <select value={f.tipo} onChange={(e) => setF({ ...f, tipo: e.target.value as TipoUscita })} className={INPUT}>
                <option value="singolo">Singolo</option>
                <option value="album">Album</option>
              </select>
            </Campo>
          </div>
          <Campo etichetta="Copertina (indirizzo del file)" nota="Lascia vuoto se la copertina non è ancora arrivata: la scheda mostra «Cover da caricare».">
            <input value={f.cover} onChange={(e) => setF({ ...f, cover: e.target.value })} className={INPUT} maxLength={500} />
          </Campo>
          <Campo etichetta="Etichetta discografica">
            <input value={f.etichetta} onChange={(e) => setF({ ...f, etichetta: e.target.value })} className={INPUT} maxLength={80} />
          </Campo>
          <Campo etichetta="Descrizione">
            <textarea value={f.descrizione} onChange={(e) => setF({ ...f, descrizione: e.target.value })} className={`${INPUT} min-h-[80px]`} maxLength={2000} />
          </Campo>
          <button
            type="button"
            className={`${BOTTONE_NEON} self-start`}
            disabled={!f.titolo.trim() || crea.isPending}
            data-testid="crea-brano"
            onClick={() =>
              crea.mutate(
                {
                  codice,
                  titolo: f.titolo,
                  artista: nullo(f.artista),
                  cover: nullo(f.cover),
                  descrizione: nullo(f.descrizione),
                  tipo: f.tipo,
                  etichettaDiscografica: nullo(f.etichetta),
                },
                { onSuccess: () => setF({ titolo: "", artista: "", cover: "", descrizione: "", tipo: "singolo", etichetta: "" }) },
              )
            }
          >
            {crea.isPending ? <Loader2 size={14} className="animate-spin" /> : <Disc3 size={14} />} Crea brano e scheda
          </button>
          {crea.error && <p className="tbh-body text-[12px] text-[#ff9a9a]">{(crea.error as Error).message}</p>}
          {crea.data && <p className="tbh-body text-[12px] text-[var(--tbh-neon)]">Creato ({crea.data.id}): completalo qui sotto.</p>}
        </div>
      </section>

      <section className="tbh-card p-4 md:p-5">
        <h3 className="tbh-display flex items-center gap-2 text-[18px]">
          <CalendarDays size={18} className="text-[var(--tbh-neon)]" /> Scheda per un brano già in catalogo
        </h3>
        <p className="tbh-body mt-1 text-[12px] text-[var(--tbh-muted)]">
          Il brano c'è già (con il suo audio): aggiungi solo la scheda di pubblicazione con data e store.
        </p>
        <div className="mt-3 grid gap-3">
          <Campo etichetta="Brano">
            <select value={esistente} onChange={(e) => setEsistente(e.target.value)} className={INPUT}>
              <option value="">— scegli —</option>
              {senzaScheda.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.titolo}
                  {b.artista ? ` — ${b.artista}` : ""}
                </option>
              ))}
            </select>
          </Campo>
          <button
            type="button"
            className={`${BOTTONE_NEON} self-start`}
            disabled={!esistente || salva.isPending}
            onClick={() =>
              salva.mutate(
                {
                  codice,
                  uscita: { id: esistente, tipo: "singolo", dataUscita: null, etichettaDiscografica: null, messaggioAttesa: null, notaMateriali: null, link: [] },
                },
                { onSuccess: () => setEsistente("") },
              )
            }
          >
            <Plus size={14} /> Aggiungi scheda
          </button>
          {salva.error && <p className="tbh-body text-[12px] text-[#ff9a9a]">{(salva.error as Error).message}</p>}
        </div>
      </section>
    </div>
  );
}

export function PannelloUscite({ codice }: { codice: string }) {
  const q = useUsciteAdmin(codice);
  const d = q.data;
  return (
    <section className="mt-6 flex flex-col gap-4" data-testid="pannello-uscite">
      <div className="tbh-card p-4 md:p-5">
        <h2 className="tbh-display flex items-center gap-2 text-[20px]">
          <Disc3 size={20} className="text-[var(--tbh-neon)]" /> USCITE E STORE
        </h2>
        <ul className="tbh-body mt-2 flex list-disc flex-col gap-1 pl-5 text-[13px] text-[var(--tbh-muted)]">
          <li>
            <span className="text-white">HyperFollow (DistroKid) non è un'integrazione automatica</span>: i link diretti a Spotify, Apple Music, Amazon
            Music, YouTube Music, Deezer, Tidal e agli altri store si incollano qui a mano, uno per riga.
          </li>
          <li>Sul sito un pulsante compare solo se il suo indirizzo è inserito. Senza link: «{MESSAGGIO_ATTESA}».</li>
          <li>La data di uscita si scrive a mano: non viene mai dedotta dalla presenza di un link.</li>
          <li>
            Un servizio compare come disponibile solo con «Disponibilità confermata»: senza conferma resta «In verifica», senza link. Le uscite
            appaiono in «Nuove uscite discografiche» e nella <Link href={PERCORSI_MUSICA.discografia} className="text-[var(--tbh-neon)] hover:underline">Discografia</Link>, dalla più recente.
          </li>
          <li>Un link di brano appartiene a una sola pubblicazione: se è già usato altrove, il salvataggio viene rifiutato.</li>
          <li>
            Un salvataggio aggiorna insieme scheda del brano, catalogo, <Link href={PERCORSI_MUSICA.calendario} className="text-[var(--tbh-neon)] hover:underline">calendario uscite</Link>, pagina dell'artista e Channel musica.
          </li>
        </ul>
      </div>
      {q.isLoading && (
        <p className="tbh-body flex items-center gap-2 text-[var(--tbh-muted)]">
          <Loader2 size={16} className="animate-spin" /> Lettura delle uscite…
        </p>
      )}
      {q.error && (
        <p className="tbh-body flex items-center gap-2 text-[#ff7a7a]">
          <AlertTriangle size={16} /> {(q.error as Error).message}
        </p>
      )}
      {d && (
        <>
          <NuovaScheda codice={codice} dati={d} />
          <h3 className="tbh-display mt-2 text-[18px]">Schede di pubblicazione ({d.uscite.length})</h3>
          {d.uscite.length === 0 && <p className="tbh-body text-[13px] text-[var(--tbh-muted)]">Nessuna scheda ancora.</p>}
          {d.uscite.map((u) => (
            <EditorUscita key={u.id} u={u} codice={codice} />
          ))}
        </>
      )}
    </section>
  );
}
