import { useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  BarChart3,
  CheckCircle2,
  FileText,
  Loader2,
  MonitorPlay,
  Plus,
  Save,
  Trash2,
} from "lucide-react";
import { Link } from "wouter";
import { CaroselloMedia } from "../components/carosello-media";
import { SbloccoAllestimento, useCodiceAllestimento } from "../components/media-slot";
import {
  useCampagneAdmin,
  useRiservaAttiva,
  useCampagneAdminStato,
  useEliminaCampagna,
  useEventiCampagne,
  useSalvaCampagna,
} from "../queries/campagne";
import { useCaricaMedia } from "../queries/media";
import {
  CATEGORIE_MONITOR,
  DISPOSITIVI_CAMPAGNA,
  ETICHETTE_CAMPAGNA,
  ROTAZIONI_CAMPAGNA,
  STATI_CAMPAGNA_INFO,
  TEMI_CAMPAGNA,
  TESTI_PULSANTE,
  TIPI_CONTENUTO,
  mediaCampagna,
  nomeStato,
  nomeTipoContenuto,
  rilevaTipoContenuto,
  type StatoCampagna,
  type TestoPulsante,
  type TipoContenuto,
} from "../../api/data/campagne-monitor";

/**
 * ADMIN → GESTIONE MONITOR (specifica del 16/09/2026, punto 10).
 *
 * Da qui Claudio decide che cosa va in onda nei monitor ancora liberi: stato,
 * etichetta, titolo, logo, copertina, video, link, sponsor, date di pubblicazione
 * e scadenza, colore del canale, priorità e dispositivo. Visualizzazioni e click
 * sono conteggi reali letti da `monitor_eventi`: nessun numero stimato.
 *
 * Finché una campagna non esiste qui, i monitor liberi mostrano le promo TBH di
 * riserva (elenco in fondo alla pagina), mai un riquadro spento.
 */

type Scheda = "campagne" | "conteggi" | "riserva";

const SCHEDE: [Scheda, string][] = [
  ["campagne", "Campagne"],
  ["conteggi", "Viste e click"],
  ["riserva", "Promo di riserva"],
];

export default function PannelloMonitorPage() {
  const { codice } = useCodiceAllestimento();
  const [scheda, setScheda] = useState<Scheda>("campagne");

  return (
    <div className="mx-auto max-w-[1500px] px-4 md:px-8 py-10">
      <header className="tbh-rise mb-6">
        <p className="text-xs tracking-[0.25em] text-[var(--tbh-gold)] uppercase mb-2">
          Pannello riservato · monitor
        </p>
        <h1 className="tbh-display tbh-h1 flex items-center gap-3">
          <MonitorPlay className="text-[var(--tbh-neon)] shrink-0" size={32} /> Gestione monitor
        </h1>
        <p className="tbh-body text-[var(--tbh-muted)] max-w-3xl mt-3">
          Contenuto temporaneo dei monitor ancora liberi: pubblicità, promo TBH e partner del
          canale. Quando arriva il contenuto ufficiale la campagna non si cancella, scende sotto i
          tre monitor e continua a girare. Il listino degli spazi resta su{" "}
          <Link href="/allestimento/tv-streaming-adv" className="text-[var(--tbh-neon)] underline">
            /allestimento/tv-streaming-adv
          </Link>
          .
        </p>
      </header>

      {!codice ? (
        <SbloccoAllestimento />
      ) : (
        <>
          <StatoServizio codice={codice} />
          <nav className="flex flex-wrap gap-2 my-6">
            {SCHEDE.map(([k, etichetta]) => (
              <button
                key={k}
                type="button"
                onClick={() => setScheda(k)}
                className={`rounded-full border px-4 py-2 text-xs font-semibold ${
                  scheda === k
                    ? "border-[var(--tbh-neon)] bg-[var(--tbh-neon)]/15 text-[var(--tbh-neon)]"
                    : "border-white/15 text-[var(--tbh-muted)] hover:text-white"
                }`}
              >
                {etichetta}
              </button>
            ))}
          </nav>

          {scheda === "campagne" && <SchedaCampagne codice={codice} />}
          {scheda === "conteggi" && <SchedaConteggi codice={codice} />}
          {scheda === "riserva" && <SchedaRiserva codice={codice} />}
        </>
      )}
    </div>
  );
}

/* ————— STATO ————— */

function StatoServizio({ codice }: { codice: string }) {
  const stato = useCampagneAdminStato(codice);
  const elenco = useCampagneAdmin(codice);
  // «In onda» lo dice il server incrociando stato e date, non lo stato scritto.
  const attive = elenco.data?.campagne.filter((c) => c.inOndaOra).length ?? 0;

  return (
    <div className="grid gap-3 md:grid-cols-3">
      <Cartellino
        ok={Boolean(stato.data?.configurato)}
        titolo="Codice sul server"
        buono="TBH_CODICE_ALLESTIMENTO presente: le scritture sono verificate."
        cattivo="Manca TBH_CODICE_ALLESTIMENTO: il pannello è in sola lettura."
      />
      <Cartellino
        ok={Boolean(stato.data?.valido)}
        titolo="Codice di questo dispositivo"
        buono="Codice riconosciuto."
        cattivo="Codice non riconosciuto dal server."
      />
      <Cartellino
        ok={attive > 0}
        titolo="Campagne in onda"
        buono={`${attive} campagne del pannello sono ammesse nei monitor.`}
        cattivo="Nessuna campagna nel pannello: i monitor liberi usano le promo TBH di riserva."
      />
    </div>
  );
}

function Cartellino({
  ok,
  titolo,
  buono,
  cattivo,
}: {
  ok: boolean;
  titolo: string;
  buono: string;
  cattivo: string;
}) {
  return (
    <div
      className={`rounded-2xl border p-4 ${
        ok
          ? "border-[var(--tbh-neon)]/40 bg-[var(--tbh-neon)]/[0.07]"
          : "border-amber-400/40 bg-amber-400/[0.07]"
      }`}
    >
      <p className="flex items-center gap-2 text-sm font-semibold text-white">
        {ok ? (
          <CheckCircle2 size={16} className="text-[var(--tbh-neon)]" />
        ) : (
          <AlertTriangle size={16} className="text-amber-300" />
        )}
        {titolo}
      </p>
      <p className="mt-1 text-xs text-[var(--tbh-muted)]">{ok ? buono : cattivo}</p>
    </div>
  );
}

/* ————— CAMPAGNE ————— */

type CampagnaAdmin = NonNullable<ReturnType<typeof useCampagneAdmin>["data"]>["campagne"][number];

function SchedaCampagne({ codice }: { codice: string }) {
  const elenco = useCampagneAdmin(codice);
  const [nuova, setNuova] = useState(false);

  if (elenco.isPending) return <Attesa />;
  if (!elenco.data) return <Errore e={elenco.error} />;

  return (
    <div className="grid gap-5">
      <p className="text-xs text-[var(--tbh-muted)]">
        Una campagna entra in un monitor solo dentro le sue date e solo se il tema combacia. Lascia
        «temi» e «spazi» vuoti per farla girare su tutti i monitor liberi. Un video MP4/WebM parte
        muto, in loop, e va lasciato finire: la rotazione a tempo vale solo per le immagini.
      </p>

      {nuova ? (
        <FormCampagna
          codice={codice}
          oggi={elenco.data.oggi}
          onFatto={() => setNuova(false)}
          onAnnulla={() => setNuova(false)}
        />
      ) : (
        <button
          type="button"
          onClick={() => setNuova(true)}
          className="inline-flex w-fit items-center gap-2 rounded-xl bg-[var(--tbh-neon)] px-5 py-2 text-sm font-bold text-black"
        >
          <Plus size={16} /> Nuova campagna
        </button>
      )}

      {elenco.data.campagne.length === 0 && !nuova && (
        <p className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-sm text-[var(--tbh-muted)]">
          Nessuna campagna registrata. I monitor liberi stanno mostrando le promo TBH di riserva
          (scheda «Promo di riserva»).
        </p>
      )}

      {elenco.data.campagne.map((c) => (
        <FormCampagna key={c.id} codice={codice} oggi={elenco.data.oggi} campagna={c} />
      ))}
    </div>
  );
}

const VUOTA = {
  stato: "bozza",
  etichetta: "SPAZIO PUBBLICITARIO",
  titolo: "",
  descrizione: "",
  sponsor: "",
  categoria: "",
  canale: "",
  logoUrl: "",
  contenutoUrl: "",
  tipoContenuto: "nessuno",
  immagineUrl: "",
  videoUrl: "",
  pulsanteUrl: "",
  linkInterno: "",
  linkEsterno: "",
  pulsante: "",
  temi: "",
  spazi: "",
  dispositivo: "tutti",
  priorita: "50",
  durataSec: "14",
  loop: "si",
  rotazione: "ordine",
  frequenzaMax: "0",
  dal: "",
  al: "",
  colore: "",
  ordine: "0",
};

function valoriDa(c?: CampagnaAdmin) {
  if (!c) return { ...VUOTA };
  return {
    stato: c.stato as string,
    etichetta: c.etichetta as string,
    titolo: c.titolo,
    descrizione: c.descrizione ?? "",
    sponsor: c.sponsor ?? "",
    categoria: c.categoria ?? "",
    canale: c.canale ? String(c.canale) : "",
    logoUrl: c.logoUrl ?? "",
    contenutoUrl: c.contenutoUrl ?? "",
    tipoContenuto: (c.tipoContenuto ?? "nessuno") as string,
    immagineUrl: c.immagineUrl ?? "",
    videoUrl: c.videoUrl ?? "",
    pulsanteUrl: c.pulsanteUrl ?? "",
    linkInterno: c.linkInterno ?? "",
    linkEsterno: c.linkEsterno ?? "",
    pulsante: c.pulsante ?? "",
    temi: c.temi.join(", "),
    spazi: c.spazi.join(", "),
    dispositivo: c.dispositivo as string,
    priorita: String(c.priorita),
    durataSec: String(c.durataSec),
    loop: c.loop === false ? "no" : "si",
    rotazione: (c.rotazione ?? "ordine") as string,
    frequenzaMax: String(c.frequenzaMax),
    dal: c.dal ?? "",
    al: c.al ?? "",
    colore: c.colore ?? "",
    ordine: String(c.ordine),
  };
}

function numero(v: string, predefinito: number, min: number, max: number) {
  const n = Number.parseInt(v, 10);
  if (!Number.isFinite(n)) return predefinito;
  return Math.min(max, Math.max(min, n));
}

type Valori = typeof VUOTA;

/* ═══════════ BARRA 1 — URL CONTENUTO DEL MONITOR ═══════════
   Una barra sola per qualunque contenuto: YouTube, Vimeo, MP4/WebM, JPG/PNG/WebP,
   pagina interna, diretta, fotogallery, pubblicità. Il tipo lo riconosce il
   programma, l'anteprima si vede subito, la pubblicazione è un gesto separato. */
function BarraContenuto({
  codice,
  v,
  setV,
  anteprima,
  setAnteprima,
  salvataggio,
  onStato,
}: {
  codice: string;
  v: Valori;
  setV: (x: Valori) => void;
  anteprima: boolean;
  setAnteprima: (x: boolean) => void;
  salvataggio: boolean;
  onStato: (s: StatoCampagna) => void;
}) {
  const url = v.contenutoUrl.trim();
  const riconosciuto = rilevaTipoContenuto(url);
  const tipoScelto = (v.tipoContenuto !== "nessuno" ? v.tipoContenuto : riconosciuto) as TipoContenuto;

  /* CARICA FILE — il file va davvero nell'archivio del portale (nessuna finta) e
     l'indirizzo definitivo finisce subito nella barra dell'URL. */
  const carica = useCaricaMedia();
  const campoFile = useRef<HTMLInputElement | null>(null);

  async function caricaFile(f: File) {
    const tipo =
      f.type === "application/pdf"
        ? "documento"
        : f.type.startsWith("video/")
          ? "slide" // l'archivio non ha una voce «video»: i filmati del monitor stanno fra le slide
          : "immagine";
    const esito = await carica.mutateAsync({
      codice,
      slot: "monitor:contenuto",
      file: f,
      tipo,
      titolo: v.titolo.trim() || f.name,
    });
    setV({ ...v, contenutoUrl: esito.url, tipoContenuto: "nessuno" });
    setAnteprima(true);
  }

  return (
    <fieldset className="rounded-2xl border border-[var(--tbh-neon)]/35 bg-[var(--tbh-neon)]/[0.04] p-4 grid gap-3">
      <legend className="px-2 text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--tbh-neon)]">
        URL contenuto del monitor
      </legend>

      <div className="grid gap-3 md:grid-cols-[1fr_260px]">
        <Campo etichetta="Incolla qui l'indirizzo del contenuto">
          <input
            aria-label="URL contenuto del monitor"
            value={v.contenutoUrl}
            onChange={(e) => {
              setV({ ...v, contenutoUrl: e.target.value });
              // L'anteprima si accende da sola appena l'indirizzo è riconoscibile.
              if (rilevaTipoContenuto(e.target.value) !== "nessuno") setAnteprima(true);
            }}
            placeholder="https://youtu.be/… · /brand/video.mp4 · /sport/squadre/verucchio"
            className={INPUT}
          />
          <span className="mt-1 block text-[10px] text-[var(--tbh-muted)]">
            {url
              ? `Riconosciuto come: ${nomeTipoContenuto(riconosciuto)}`
              : "YouTube, Vimeo, MP4/WebM, JPG/PNG/WebP, pagina interna, diretta, fotogallery o pubblicità."}
          </span>
        </Campo>
        <Campo etichetta="Tipo di contenuto">
          <select
            aria-label="Tipo di contenuto"
            value={v.tipoContenuto}
            onChange={(e) => setV({ ...v, tipoContenuto: e.target.value })}
            className={INPUT}
          >
            {TIPI_CONTENUTO.map((t) => (
              <option key={t.codice} value={t.codice}>
                {t.nome}
              </option>
            ))}
          </select>
          <span className="mt-1 block text-[10px] text-[var(--tbh-muted)]">
            Lascialo su «nessuno» e lo decide il programma dall'indirizzo.
          </span>
        </Campo>
      </div>

      {/* Anteprima immediata: si vede prima di pubblicare */}
      {anteprima && url ? (
        <AnteprimaVetro v={v} tipo={tipoScelto} />
      ) : (
        <p className="rounded-xl border border-dashed border-white/15 px-3 py-4 text-center text-[11px] text-[var(--tbh-muted)]">
          Incolla un indirizzo (o premi «Carica file») e poi «Mostra anteprima qui» per vedere il
          monitor prima di pubblicarlo.
        </p>
      )}

      {/* ── COMANDI RICHIESTI: CARICA FILE · MOSTRA ANTEPRIMA QUI · APRI LINK ·
             SALVA · ATTIVO/NON ATTIVO. Visibili solo qui, nel pannello admin. ── */}
      <div className="flex flex-wrap items-center gap-2">
        <input
          ref={campoFile}
          type="file"
          accept="image/*,video/mp4,video/webm,application/pdf"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            e.target.value = "";
            if (f) void caricaFile(f);
          }}
        />
        <button
          type="button"
          onClick={() => campoFile.current?.click()}
          disabled={carica.isPending}
          className="rounded-xl border border-white/25 px-4 py-2 text-xs font-bold text-white disabled:opacity-40"
        >
          {carica.isPending ? "Carico il file…" : "Carica file"}
        </button>
        <button
          type="button"
          onClick={() => setAnteprima(true)}
          disabled={!url}
          className="rounded-xl border border-[var(--tbh-neon)]/60 px-4 py-2 text-xs font-bold text-[var(--tbh-neon)] disabled:opacity-40"
        >
          Mostra anteprima qui
        </button>
        {url ? (
          <a
            href={url}
            target={/^https?:\/\//i.test(url) ? "_blank" : undefined}
            rel="noreferrer"
            className="rounded-xl border border-white/25 px-4 py-2 text-xs font-bold text-white"
          >
            Apri link
          </a>
        ) : (
          /* Nessun pulsante spento: finché l'indirizzo manca si legge solo la nota. */
          <span className="px-1 py-2 text-xs text-[var(--tbh-muted)]">
            «Apri link» compare appena c'è un indirizzo.
          </span>
        )}
        <button
          type="button"
          onClick={() => onStato("bozza")}
          disabled={salvataggio}
          className="rounded-xl border border-white/20 px-4 py-2 text-xs font-bold text-white disabled:opacity-40"
        >
          Salva
        </button>
        <button
          type="button"
          onClick={() => onStato("in_onda")}
          disabled={salvataggio}
          className="rounded-xl bg-[var(--tbh-neon)] px-4 py-2 text-xs font-bold text-black disabled:opacity-40"
        >
          Attivo (in onda)
        </button>
        <button
          type="button"
          onClick={() => onStato("disattivato")}
          disabled={salvataggio}
          className="rounded-xl border border-amber-400/50 px-4 py-2 text-xs font-bold text-amber-300 disabled:opacity-40"
        >
          Non attivo
        </button>
        <button
          type="button"
          onClick={() => {
            // Sostituisci: svuota la barra per incollare il contenuto nuovo.
            setV({ ...v, contenutoUrl: "", tipoContenuto: "nessuno" });
            setAnteprima(false);
          }}
          className="rounded-xl border border-white/20 px-4 py-2 text-xs font-bold text-white"
        >
          Sostituisci
        </button>
      </div>
      {carica.isError ? (
        <p className="text-[11px] text-amber-300">
          {carica.error instanceof Error
            ? carica.error.message
            : "Caricamento del file non riuscito."}
        </p>
      ) : null}
    </fieldset>
  );
}

/** Il vetro come lo vedrà il pubblico: stesso calcolo del sito, nessuna finta. */
function AnteprimaVetro({ v, tipo }: { v: Valori; tipo: TipoContenuto }) {
  const media = mediaCampagna({
    contenutoUrl: v.contenutoUrl.trim() || null,
    tipoContenuto: tipo,
    immagineUrl: v.immagineUrl.trim() || null,
    videoUrl: v.videoUrl.trim() || null,
  });

  /* Più indirizzi nella stessa barra = carosello: si prova qui, con le frecce,
     i pallini e il passaggio automatico esattamente come lo vedrà il pubblico. */
  if (media.elenco.length > 1) {
    return (
      <div className="grid gap-2">
        <div className="w-full max-w-xl">
          <CaroselloMedia
            elementi={media.elenco}
            titolo={v.titolo.trim() || "Contenuto del monitor"}
            durataSec={numero(v.durataSec, 14, 3, 600)}
            loop={v.loop !== "no"}
            casuale={v.rotazione === "casuale"}
            visibile
          />
        </div>
        <p className="text-[10px] text-[var(--tbh-muted)]">
          Anteprima locale: non è ancora pubblicata. Carosello di {media.elenco.length} contenuti ·
          {v.loop !== "no" ? " riparte in continuo" : " si ferma all'ultimo"} ·
          {v.rotazione === "casuale" ? " ordine casuale" : " ordine indicato"}.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-2">
      <div className="relative aspect-video w-full max-w-xl overflow-hidden rounded-xl border border-white/15 bg-black">
        {media.documento ? (
          <div className="absolute inset-0 grid place-items-center gap-3 p-4 text-center">
            {media.immagine ? (
              <img
                src={media.immagine}
                alt="Copertina del documento"
                className="absolute inset-0 h-full w-full object-contain opacity-70"
              />
            ) : null}
            <a
              href={media.documento}
              target="_blank"
              rel="noreferrer"
              className="relative z-10 inline-flex items-center gap-2 rounded-full bg-[var(--tbh-neon)] px-4 py-2 text-[11px] font-bold text-black"
            >
              <FileText className="h-3.5 w-3.5" />
              APRI DOCUMENTO
            </a>
          </div>
        ) : media.video ? (
          <video
            src={media.video}
            poster={media.immagine ?? undefined}
            muted
            loop
            playsInline
            autoPlay
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : media.embed ? (
          <iframe
            src={media.embed}
            title="Anteprima del contenuto"
            allow="autoplay; encrypted-media; picture-in-picture"
            className="absolute inset-0 h-full w-full"
          />
        ) : media.immagine ? (
          <img
            src={media.immagine}
            alt="Anteprima del contenuto"
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : media.pagina ? (
          <div className="absolute inset-0 grid place-items-center p-4 text-center">
            <p className="text-xs text-[var(--tbh-muted)]">
              Pagina interna del portale:
              <br />
              <span className="text-white">{media.pagina}</span>
              <br />
              Il monitor mostrerà la copertina e il pulsante porterà qui.
            </p>
          </div>
        ) : (
          <div className="absolute inset-0 grid place-items-center p-4 text-center">
            <p className="text-xs text-amber-300">
              Questo indirizzo non dà un'immagine né un video: servono anche una copertina e un
              logo, altrimenti il monitor resta senza contenuto visibile.
            </p>
          </div>
        )}
        {v.canale.trim() ? (
          <span className="tbh-dato absolute left-2 top-2 rounded border border-white/25 bg-black/70 px-1.5 py-0.5 text-[9px] font-bold text-white">
            CANALE {v.canale.trim()}
          </span>
        ) : null}
      </div>
      <p className="text-[10px] text-[var(--tbh-muted)]">
        Anteprima locale: non è ancora pubblicata. Tipo letto: {nomeTipoContenuto(media.tipo)}.
      </p>
    </div>
  );
}

/* ═══════════ BARRA 2 — URL O LINK DEL PULSANTE ═══════════
   Destinazione indipendente dal contenuto: il monitor può mostrare un video
   promo e il pulsante portare al prodotto, al checkout o a WhatsApp. */
function BarraPulsante({ v, setV }: { v: Valori; setV: (x: Valori) => void }) {
  const p = v.pulsanteUrl.trim();
  const dove = p.startsWith("/")
    ? "pagina interna del portale"
    : p.startsWith("http://") || p.startsWith("https://")
      ? "sito esterno (si apre in una scheda nuova)"
      : p
        ? "indirizzo non valido: deve iniziare con / oppure https://"
        : "vuoto: valgono i campi storici link interno / link esterno";

  return (
    <fieldset className="rounded-2xl border border-[var(--tbh-gold)]/35 bg-[var(--tbh-gold)]/[0.04] p-4 grid gap-3">
      <legend className="px-2 text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--tbh-gold)]">
        URL o link del pulsante
      </legend>

      <div className="grid gap-3 md:grid-cols-[1fr_260px]">
        <Campo etichetta="Dove porta il pulsante (indipendente dal contenuto)">
          <input
            aria-label="URL o link del pulsante"
            value={v.pulsanteUrl}
            onChange={(e) => setV({ ...v, pulsanteUrl: e.target.value })}
            placeholder="/shop/prodotto · https://wa.me/… · /contatti"
            className={INPUT}
          />
          <span className="mt-1 block text-[10px] text-[var(--tbh-muted)]">{dove}</span>
        </Campo>
        <Campo etichetta="Testo del pulsante (elenco chiuso)">
          <select
            aria-label="Testo del pulsante"
            value={v.pulsante}
            onChange={(e) => setV({ ...v, pulsante: e.target.value })}
            className={INPUT}
          >
            <option value="">— nessun pulsante</option>
            {TESTI_PULSANTE.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
          <span className="mt-1 block text-[10px] text-[var(--tbh-muted)]">
            Solo questi dodici testi: nessuna scritta libera.
          </span>
        </Campo>
      </div>
    </fieldset>
  );
}

function FormCampagna({
  codice,
  oggi,
  campagna,
  onFatto,
  onAnnulla,
}: {
  codice: string;
  oggi: string;
  campagna?: CampagnaAdmin;
  onFatto?: () => void;
  onAnnulla?: () => void;
}) {
  const salva = useSalvaCampagna();
  const elimina = useEliminaCampagna();
  const [v, setV] = useState(() => valoriDa(campagna));
  const [conferma, setConferma] = useState(false);
  /* Anteprima: si accende quando si chiede «CARICA ANTEPRIMA» oppure appena si
     incolla un URL riconoscibile. Non serve pubblicare per vedere il contenuto. */
  const [anteprima, setAnteprima] = useState(() => Boolean(campagna?.contenutoUrl));

  const scaduta = Boolean(v.al) && v.al < oggi;
  const futura = Boolean(v.dal) && v.dal > oggi;

  function invia(e: React.FormEvent, statoForzato?: StatoCampagna) {
    e.preventDefault();
    const stato = (statoForzato ?? v.stato) as StatoCampagna;
    if (statoForzato) setV({ ...v, stato: statoForzato });
    const contenutoUrl = v.contenutoUrl.trim() || null;
    // Se resta «nessuno» ma c'è un URL, il tipo lo riconosce il programma.
    const tipoContenuto = (
      v.tipoContenuto !== "nessuno" ? v.tipoContenuto : rilevaTipoContenuto(contenutoUrl)
    ) as TipoContenuto;

    salva.mutate(
      {
        codice,
        campagna: {
          id: campagna?.id ?? null,
          stato,
          etichetta: v.etichetta as
            | "SPAZIO PUBBLICITARIO"
            | "PROMO TBH"
            | "PARTNER DEL CANALE",
          titolo: v.titolo.trim(),
          descrizione: v.descrizione.trim() || null,
          sponsor: v.sponsor.trim() || null,
          categoria: v.categoria.trim() || null,
          canale: v.canale.trim() ? numero(v.canale, 1, 1, 999) : null,
          logoUrl: v.logoUrl.trim() || null,
          contenutoUrl,
          tipoContenuto,
          immagineUrl: v.immagineUrl.trim() || null,
          videoUrl: v.videoUrl.trim() || null,
          pulsanteUrl: v.pulsanteUrl.trim() || null,
          linkInterno: v.linkInterno.trim() || null,
          linkEsterno: v.linkEsterno.trim() || null,
          pulsante: (v.pulsante.trim() || null) as TestoPulsante | null,
          temi: v.temi.trim() || null,
          spazi: v.spazi.trim() || null,
          dispositivo: v.dispositivo as "tutti" | "mobile" | "tablet" | "desktop",
          priorita: numero(v.priorita, 50, 0, 100),
          durataSec: numero(v.durataSec, 14, 3, 600),
          loop: v.loop !== "no",
          rotazione: (v.rotazione === "casuale" ? "casuale" : "ordine") as
            | "ordine"
            | "casuale",
          frequenzaMax: numero(v.frequenzaMax, 0, 0, 50),
          dal: v.dal.trim() || null,
          al: v.al.trim() || null,
          colore: v.colore.trim() || null,
          ordine: numero(v.ordine, 0, 0, 9999),
        },
      },
      {
        onSuccess: () => {
          if (!campagna) setV({ ...VUOTA });
          onFatto?.();
        },
      },
    );
  }

  return (
    <form
      onSubmit={invia}
      className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 grid gap-4"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-white">
            {campagna ? campagna.titolo : "Nuova campagna"}
          </p>
          <p className="text-[11px] text-[var(--tbh-muted)] mt-1">
            {campagna ? (
              <>
                #{campagna.id} · {campagna.viste} viste · {campagna.click} click
                {scaduta && <span className="text-amber-300"> · scaduta il {v.al}</span>}
                {futura && <span className="text-amber-300"> · parte il {v.dal}</span>}
              </>
            ) : (
              "Compila titolo e almeno una creatività (immagine o video)."
            )}
          </p>
        </div>
        {campagna && (
          <div className="flex items-center gap-2">
            {conferma ? (
              <>
                <button
                  type="button"
                  onClick={() => elimina.mutate({ codice, id: campagna.id })}
                  disabled={elimina.isPending}
                  className="rounded-xl border border-amber-400/50 px-3 py-1.5 text-xs font-semibold text-amber-300 disabled:opacity-60"
                >
                  {elimina.isPending ? "Elimino…" : "Confermo, elimina"}
                </button>
                <button
                  type="button"
                  onClick={() => setConferma(false)}
                  className="text-xs text-[var(--tbh-muted)]"
                >
                  Annulla
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => setConferma(true)}
                className="inline-flex items-center gap-1.5 rounded-xl border border-white/15 px-3 py-1.5 text-xs text-[var(--tbh-muted)] hover:text-white"
              >
                <Trash2 size={14} /> Elimina
              </button>
            )}
          </div>
        )}
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <Campo etichetta="Stato">
          <select
            aria-label="Stato"
            value={v.stato}
            onChange={(e) => setV({ ...v, stato: e.target.value })}
            className={INPUT}
          >
            {STATI_CAMPAGNA_INFO.map((s) => (
              <option key={s.codice} value={s.codice}>
                {s.nome}
              </option>
            ))}
          </select>
          <span className="mt-1 block text-[10px] text-[var(--tbh-muted)]">
            {STATI_CAMPAGNA_INFO.find((s) => s.codice === v.stato)?.spiegazione ??
              "Stato non riconosciuto."}
          </span>
        </Campo>
        <Campo etichetta="Etichetta sempre visibile">
          <select
            aria-label="Etichetta sempre visibile"
            value={v.etichetta}
            onChange={(e) => setV({ ...v, etichetta: e.target.value })}
            className={INPUT}
          >
            {ETICHETTE_CAMPAGNA.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </Campo>
        <Campo etichetta="Dispositivo">
          <select
            aria-label="Dispositivo"
            value={v.dispositivo}
            onChange={(e) => setV({ ...v, dispositivo: e.target.value })}
            className={INPUT}
          >
            {DISPOSITIVI_CAMPAGNA.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </Campo>
      </div>

      <Campo etichetta="Titolo">
        <input
          aria-label="Titolo"
          value={v.titolo}
          onChange={(e) => setV({ ...v, titolo: e.target.value })}
          required
          minLength={2}
          maxLength={200}
          className={INPUT}
        />
      </Campo>

      <Campo etichetta="Descrizione (facoltativa)">
        <textarea
          aria-label="Descrizione"
          value={v.descrizione}
          onChange={(e) => setV({ ...v, descrizione: e.target.value })}
          maxLength={600}
          rows={2}
          className={INPUT}
        />
      </Campo>

      <div className="grid gap-3 md:grid-cols-3">
        <Campo etichetta="Categoria della scheda">
          <select
            aria-label="Categoria della scheda"
            value={v.categoria}
            onChange={(e) => setV({ ...v, categoria: e.target.value })}
            className={INPUT}
          >
            <option value="">— nessuna categoria</option>
            {CATEGORIE_MONITOR.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </Campo>
        <Campo etichetta="Numero del canale">
          <input
            aria-label="Numero del canale"
            value={v.canale}
            onChange={(e) => setV({ ...v, canale: e.target.value })}
            inputMode="numeric"
            placeholder="da ricevere"
            className={INPUT}
          />
          <span className="mt-1 block text-[10px] text-[var(--tbh-muted)]">
            Si compila solo con la tabella ufficiale dei numeri: lasciato vuoto, il monitor non
            mostra nessun numero. Nessun numero va indovinato.
          </span>
        </Campo>
        <Campo etichetta="Colore del canale (hex o var CSS)">
          <input
            aria-label="Colore del canale"
            value={v.colore}
            onChange={(e) => setV({ ...v, colore: e.target.value })}
            placeholder="#d9ff00"
            className={INPUT}
          />
        </Campo>
      </div>

      {/* ══════════ BARRA 1 — URL CONTENUTO DEL MONITOR ══════════ */}
      <BarraContenuto
        codice={codice}
        v={v}
        setV={setV}
        anteprima={anteprima}
        setAnteprima={setAnteprima}
        salvataggio={salva.isPending}
        onStato={(s) => invia({ preventDefault: () => undefined } as React.FormEvent, s)}
      />

      {/* ══════════ BARRA 2 — URL O LINK DEL PULSANTE ══════════ */}
      <BarraPulsante v={v} setV={setV} />

      <div className="grid gap-3 md:grid-cols-2">
        <Campo etichetta="Sponsor (nome esatto ricevuto)">
          <input
            aria-label="Sponsor"
            value={v.sponsor}
            onChange={(e) => setV({ ...v, sponsor: e.target.value })}
            className={INPUT}
          />
        </Campo>
        <Campo etichetta="Logo ufficiale / sigillo — URL (solo file ricevuti)">
          <input
            aria-label="Logo ufficiale URL"
            value={v.logoUrl}
            onChange={(e) => setV({ ...v, logoUrl: e.target.value })}
            placeholder="/brand/…"
            className={INPUT}
          />
        </Campo>
        <Campo etichetta="Copertina di riserva — URL (si vede se il video non parte)">
          <input
            aria-label="Copertina URL"
            value={v.immagineUrl}
            onChange={(e) => setV({ ...v, immagineUrl: e.target.value })}
            className={INPUT}
          />
        </Campo>
        <Campo etichetta="Video — campo storico, vale solo se la barra contenuto è vuota">
          <input
            aria-label="Video URL"
            value={v.videoUrl}
            onChange={(e) => setV({ ...v, videoUrl: e.target.value })}
            className={INPUT}
          />
        </Campo>
        <Campo etichetta="Link interno — campo storico, vale se la barra pulsante è vuota">
          <input
            aria-label="Link interno"
            value={v.linkInterno}
            onChange={(e) => setV({ ...v, linkInterno: e.target.value })}
            placeholder="/shop/tv-streaming-adv"
            className={INPUT}
          />
        </Campo>
        <Campo etichetta="Link esterno — campo storico, vale se la barra pulsante è vuota">
          <input
            aria-label="Link esterno"
            value={v.linkEsterno}
            onChange={(e) => setV({ ...v, linkEsterno: e.target.value })}
            placeholder="https://"
            className={INPUT}
          />
        </Campo>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <Campo etichetta={`Temi ammessi (${TEMI_CAMPAGNA.join(", ")}) — vuoto = tutti`}>
          <input
            aria-label="Temi ammessi"
            value={v.temi}
            onChange={(e) => setV({ ...v, temi: e.target.value })}
            placeholder="sport, musica"
            className={INPUT}
          />
        </Campo>
        <Campo etichetta="Spazi specifici (id record o slug) — vuoto = tutti">
          <input
            aria-label="Spazi specifici"
            value={v.spazi}
            onChange={(e) => setV({ ...v, spazi: e.target.value })}
            placeholder="verucchio, hugo-release-1"
            className={INPUT}
          />
        </Campo>
      </div>

      <div className="grid gap-3 md:grid-cols-3 lg:grid-cols-6">
        <Campo etichetta="Dal (AAAA-MM-GG)">
          <input
            aria-label="Dal"
            type="date"
            value={v.dal}
            onChange={(e) => setV({ ...v, dal: e.target.value })}
            className={INPUT}
          />
        </Campo>
        <Campo etichetta="Al (scadenza)">
          <input
            aria-label="Al"
            type="date"
            value={v.al}
            onChange={(e) => setV({ ...v, al: e.target.value })}
            className={INPUT}
          />
        </Campo>
        <Campo etichetta="Priorità 0–100">
          <input
            aria-label="Priorità"
            value={v.priorita}
            onChange={(e) => setV({ ...v, priorita: e.target.value })}
            inputMode="numeric"
            className={INPUT}
          />
        </Campo>
        <Campo etichetta="Durata in secondi 3–600">
          <input
            aria-label="Durata in secondi"
            value={v.durataSec}
            onChange={(e) => setV({ ...v, durataSec: e.target.value })}
            inputMode="numeric"
            className={INPUT}
          />
        </Campo>
        <Campo etichetta="Riproduzione continua (loop)">
          <select
            aria-label="Riproduzione continua"
            value={v.loop}
            onChange={(e) => setV({ ...v, loop: e.target.value })}
            className={INPUT}
          >
            <option value="si">SÌ — ricomincia da sola</option>
            <option value="no">NO — si ferma alla fine</option>
          </select>
        </Campo>
        <Campo etichetta="Rotazione fra i contenuti">
          <select
            aria-label="Rotazione"
            value={v.rotazione}
            onChange={(e) => setV({ ...v, rotazione: e.target.value })}
            className={INPUT}
          >
            {ROTAZIONI_CAMPAGNA.map((r) => (
              <option key={r.codice} value={r.codice}>
                {r.nome}
              </option>
            ))}
          </select>
        </Campo>
        <Campo etichetta="Frequenza max per sessione (0 = libera)">
          <input
            aria-label="Frequenza massima"
            value={v.frequenzaMax}
            onChange={(e) => setV({ ...v, frequenzaMax: e.target.value })}
            inputMode="numeric"
            className={INPUT}
          />
        </Campo>
        <Campo etichetta="Ordine">
          <input
            aria-label="Ordine"
            value={v.ordine}
            onChange={(e) => setV({ ...v, ordine: e.target.value })}
            inputMode="numeric"
            className={INPUT}
          />
        </Campo>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={salva.isPending}
          className="inline-flex items-center gap-2 rounded-xl bg-[var(--tbh-neon)] px-5 py-2 text-sm font-bold text-black disabled:opacity-60"
        >
          {salva.isPending ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          {campagna ? "Salva modifiche" : "Crea campagna"}
        </button>
        {onAnnulla && (
          <button type="button" onClick={onAnnulla} className="text-xs text-[var(--tbh-muted)]">
            Annulla
          </button>
        )}
        {salva.isSuccess && !salva.isPending && (
          <span className="text-xs text-[var(--tbh-neon)]">Salvata.</span>
        )}
        {salva.error && <MessaggioErrore e={salva.error} />}
        {elimina.error && <MessaggioErrore e={elimina.error} />}
      </div>
    </form>
  );
}

/* ————— VISTE E CLICK ————— */

function SchedaConteggi({ codice }: { codice: string }) {
  const elenco = useCampagneAdmin(codice);
  const eventi = useEventiCampagne(codice);

  const totali = useMemo(() => {
    const c = elenco.data?.campagne ?? [];
    const r = elenco.data?.riserva ?? [];
    return {
      viste: [...c, ...r].reduce((s, x) => s + x.viste, 0),
      click: [...c, ...r].reduce((s, x) => s + x.click, 0),
    };
  }, [elenco.data]);

  if (elenco.isPending) return <Attesa />;
  if (!elenco.data) return <Errore e={elenco.error} />;

  return (
    <div className="grid gap-5">
      <p className="text-xs text-[var(--tbh-muted)] flex items-start gap-2">
        <BarChart3 size={14} className="mt-0.5 shrink-0" />
        Righe vere della tabella <code className="text-white">monitor_eventi</code>: una vista si
        registra quando il monitor entra davvero nello schermo, un click quando qualcuno apre la
        destinazione. Totale sul portale: {totali.viste} viste · {totali.click} click.
      </p>

      <div className="overflow-x-auto rounded-2xl border border-white/10">
        <table className="w-full text-sm">
          <thead className="bg-white/[0.04] text-left text-xs uppercase tracking-wider text-[var(--tbh-muted)]">
            <tr>
              <th className="px-3 py-3">Campagna</th>
              <th className="px-3 py-3">Etichetta</th>
              <th className="px-3 py-3">Stato</th>
              <th className="px-3 py-3">Finestra</th>
              <th className="px-3 py-3">Viste</th>
              <th className="px-3 py-3">Click</th>
            </tr>
          </thead>
          <tbody>
            {elenco.data.campagne.length === 0 && (
              <tr>
                <td className="px-3 py-4 text-[var(--tbh-muted)]" colSpan={6}>
                  Nessuna campagna nel pannello.
                </td>
              </tr>
            )}
            {elenco.data.campagne.map((c) => (
              <tr key={c.id} className="border-t border-white/10">
                <td className="px-3 py-3 text-white">{c.titolo}</td>
                <td className="px-3 py-3 text-[11px]">{c.etichetta}</td>
                <td className="px-3 py-3 text-[11px]">
                  {nomeStato(c.statoEffettivo)}
                  {c.statoEffettivo !== c.stato ? (
                    <span className="block text-[10px] text-amber-300">
                      salvata come {nomeStato(c.stato)}
                    </span>
                  ) : null}
                </td>
                <td className="px-3 py-3 text-[11px]">
                  {c.dal ?? "—"} → {c.al ?? "—"}
                </td>
                <td className="px-3 py-3">{c.viste}</td>
                <td className="px-3 py-3">{c.click}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
        <p className="text-sm font-semibold text-white mb-3">Ultimi eventi registrati</p>
        {eventi.isPending && <Attesa />}
        {eventi.data && eventi.data.eventi.length === 0 && (
          <p className="text-xs text-[var(--tbh-muted)]">
            Nessun evento ancora: apri una pagina con un monitor libero e il conteggio parte.
          </p>
        )}
        {eventi.data && eventi.data.eventi.length > 0 && (
          <ul className="grid gap-1 text-[11px] text-[var(--tbh-muted)]">
            {eventi.data.eventi.map((e) => (
              <li key={e.id}>
                <span className={e.tipo === "click" ? "text-[var(--tbh-neon)]" : "text-white"}>
                  {e.tipo}
                </span>{" "}
                · campagna #{e.campagnaId} · {e.spazio ?? "spazio non indicato"} ·{" "}
                {e.dispositivo ?? "dispositivo non indicato"} ·{" "}
                {e.quando ? new Date(e.quando).toLocaleString("it-IT") : "—"}
              </li>
            ))}
          </ul>
        )}
        {eventi.error && <MessaggioErrore e={eventi.error} />}
      </div>
    </div>
  );
}

/* ————— PROMO DI RISERVA ————— */

function SchedaRiserva({ codice }: { codice: string }) {
  const elenco = useCampagneAdmin(codice);
  const interruttore = useRiservaAttiva();
  if (elenco.isPending) return <Attesa />;
  if (!elenco.data) return <Errore e={elenco.error} />;

  return (
    <div className="grid gap-5">
      <p className="text-xs text-[var(--tbh-muted)]">
        Promo interne TBH scritte nel codice: girano solo dove il pannello non ha ancora una
        campagna per quel monitor, così nessun riquadro resta spento. Nessuno sponsor esterno è
        inventato e nessun logo è ridisegnato: le immagini sono materiale reale già sul portale.
        Appena registri una campagna vera per quello spazio, la riserva si fa da parte — tranne le
        promo «sempre in rotazione» (Offerta 122 €), che si alternano anche alle campagne del
        pannello finché non le spegni qui.
      </p>
      {interruttore.isError && <MessaggioErrore e={interruttore.error} />}
      <div className="overflow-x-auto rounded-2xl border border-white/10">
        <table className="w-full text-sm">
          <thead className="bg-white/[0.04] text-left text-xs uppercase tracking-wider text-[var(--tbh-muted)]">
            <tr>
              <th className="px-3 py-3">Promo</th>
              <th className="px-3 py-3">Etichetta</th>
              <th className="px-3 py-3">Temi</th>
              <th className="px-3 py-3">Viste</th>
              <th className="px-3 py-3">Click</th>
              <th className="px-3 py-3">In onda</th>
            </tr>
          </thead>
          <tbody>
            {elenco.data.riserva.map((r, i) => (
              <tr key={i} className="border-t border-white/10">
                <td className="px-3 py-3 text-white">{r.titolo}</td>
                <td className="px-3 py-3 text-[11px]">{r.etichetta}</td>
                <td className="px-3 py-3 text-[11px]">
                  {r.temi.length > 0 ? r.temi.join(", ") : "tutti"}
                </td>
                <td className="px-3 py-3">{r.viste}</td>
                <td className="px-3 py-3">{r.click}</td>
                <td className="px-3 py-3">
                  <button
                    type="button"
                    disabled={interruttore.isPending}
                    onClick={() => interruttore.mutate({ codice, id: r.id, attiva: !r.attiva })}
                    className={`rounded-full px-3 py-1 text-[11px] font-extrabold tracking-wider disabled:opacity-40 ${
                      r.attiva ? "bg-[var(--tbh-neon)] text-black" : "border border-white/25 text-white/60"
                    }`}
                    title={r.sempreInRotazione ? "Si alterna anche alle campagne del pannello" : undefined}
                  >
                    {r.attiva ? "ATTIVA · SPEGNI" : "SPENTA · RIACCENDI"}
                  </button>
                  {r.sempreInRotazione && <span className="ml-2 text-[10px] text-[var(--tbh-muted)]">sempre in rotazione · {r.durataSec} s</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ————— pezzi comuni ————— */

const INPUT =
  "mt-1 w-full rounded-xl border border-white/15 bg-black/40 px-3 py-2 text-sm text-white outline-none focus:border-[var(--tbh-neon)]";

function Campo({ etichetta, children }: { etichetta: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-[11px] uppercase tracking-wider text-[var(--tbh-muted)]">
        {etichetta}
      </span>
      {children}
    </label>
  );
}

function Attesa() {
  return (
    <p className="flex items-center gap-2 text-sm text-[var(--tbh-muted)]">
      <Loader2 size={16} className="animate-spin" /> Sto leggendo i dati…
    </p>
  );
}

function Errore({ e }: { e: unknown }) {
  return (
    <p className="flex items-start gap-2 text-sm text-amber-300">
      <AlertTriangle size={16} className="mt-0.5 shrink-0" />
      {e instanceof Error ? e.message : "Il server non ha risposto. Controlla il codice."}
    </p>
  );
}

function MessaggioErrore({ e }: { e: unknown }) {
  return (
    <span className="text-xs text-amber-300">
      {e instanceof Error ? e.message : "Salvataggio non riuscito."}
    </span>
  );
}
