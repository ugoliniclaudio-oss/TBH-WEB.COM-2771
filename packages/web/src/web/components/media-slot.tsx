import { useEffect, useMemo, useState } from "react";
import {
  Image as ImageIcon,
  MapPin,
  Trash2,
  Upload,
  ExternalLink,
  Lock,
  Check,
  AlertTriangle,
} from "lucide-react";
import {
  useMediaSlot,
  useCaricaMedia,
  useSalvaLinkMedia,
  useEliminaMedia,
  useStatoAllestimento,
  useVerificaCodice,
} from "../queries/media";
import { useCodiceAllestimento } from "../lib/codice-allestimento";

/**
 * SPAZI DA ALLESTIRE — ordine di Claudio (03/09/2026):
 * «dove ci sono gli spazi per immagini e loghi dai a me la possibilità di caricare,
 *  così faccio prima ad allestire il sito con immagini loghi indirizzi link di Google Map».
 *
 * Come funziona davvero:
 * · il file viene caricato NELL'ARCHIVIO DEL PORTALE (non sul singolo dispositivo):
 *   quello che carica lui lo vedono tutti i visitatori, subito;
 * · ogni materiale sta su uno "slot" (es. `societa:touch-hello`, `sponsor:hotel-zurigo`)
 *   e porta con sé titolo, indirizzo, link Google Maps e link al sito;
 * · per caricare serve il CODICE DI ALLESTIMENTO: il portale non ha ancora l'area
 *   riservata con login, quindi il codice è l'unica barriera contro caricamenti di estranei.
 *
 * Nessun contenuto inventato: se lo slot è vuoto la pagina resta com'è.
 */

export type TipoMedia = "logo" | "immagine" | "slide" | "documento";

const TIPI: { id: TipoMedia; nome: string }[] = [
  { id: "logo", nome: "Logo / stemma" },
  { id: "immagine", nome: "Immagine / foto" },
  { id: "slide", nome: "Slide servizi o listino" },
  { id: "documento", nome: "Documento" },
];

/**
 * Il codice di allestimento vive in `lib/codice-allestimento`: lo usano sia questi riquadri
 * sia il Media Manager unico. Qui viene solo ri-esportato, così le pagine che lo importavano
 * da questo file continuano a funzionare.
 */
export { useCodiceAllestimento };

/** Riquadro di sblocco: chiede il codice una volta sola per dispositivo. */
export function SbloccoAllestimento() {
  const { codice, salva } = useCodiceAllestimento();
  const [bozza, setBozza] = useState("");
  const verifica = useVerificaCodice();
  const stato = useStatoAllestimento();

  if (stato.data && !stato.data.attivo) {
    return (
      <div className="tbh-card p-5 flex items-start gap-3">
        <AlertTriangle className="text-[var(--tbh-gold)] shrink-0" size={22} />
        <p className="text-sm text-[var(--tbh-muted)]">
          Il caricamento è spento sul server: manca il codice di allestimento nelle impostazioni.
          Va acceso prima di poter caricare immagini e loghi.
        </p>
      </div>
    );
  }

  if (codice) {
    return (
      <div className="tbh-card p-5 flex items-center justify-between gap-4 flex-wrap">
        <p className="text-sm inline-flex items-center gap-2 text-[var(--tbh-neon)]">
          <Check size={18} /> Caricamento sbloccato su questo dispositivo.
        </p>
        <button
          type="button"
          onClick={() => salva("")}
          className="text-xs uppercase tracking-wide text-[var(--tbh-muted)] hover:text-white underline"
        >
          Blocca di nuovo
        </button>
      </div>
    );
  }

  return (
    <div className="tbh-card p-5">
      <p className="text-sm inline-flex items-center gap-2 font-bold mb-1">
        <Lock size={18} className="text-[var(--tbh-gold)]" /> Codice di allestimento
      </p>
      <p className="text-xs text-[var(--tbh-muted)] mb-4 max-w-2xl">
        Serve una volta sola per dispositivo. Sblocca il caricamento di immagini, loghi, indirizzi
        e link su tutti gli spazi del portale.
      </p>
      <form
        className="flex flex-wrap gap-3"
        onSubmit={(e) => {
          e.preventDefault();
          verifica.mutate(
            { codice: bozza.trim() },
            { onSuccess: () => salva(bozza.trim()) },
          );
        }}
      >
        <input
          aria-label="Codice di allestimento"
          type="password"
          value={bozza}
          onChange={(e) => setBozza(e.target.value)}
          placeholder="Incolla qui il codice"
          className="min-w-[240px] grow rounded-xl bg-black/50 border border-white/15 px-4 py-3 text-sm outline-none focus:border-[var(--tbh-neon)]"
        />
        <button
          type="submit"
          disabled={!bozza.trim() || verifica.isPending}
          className="tbh-neon-btn px-6 py-3 text-sm disabled:opacity-40"
        >
          {verifica.isPending ? "Verifico…" : "Sblocca"}
        </button>
      </form>
      {verifica.isError && (
        <p className="text-xs text-red-400 mt-3">
          Codice non valido: il caricamento resta bloccato.
        </p>
      )}
    </div>
  );
}

type ModuloProps = {
  slot: string;
  tipoIniziale?: TipoMedia;
  onFatto?: () => void;
};

/** Modulo di caricamento: file + titolo + indirizzo + link Google Maps + link sito. */
export function ModuloCaricamento({ slot, tipoIniziale = "immagine", onFatto }: ModuloProps) {
  const { codice } = useCodiceAllestimento();
  const carica = useCaricaMedia();
  const salvaLink = useSalvaLinkMedia();
  /** Due strade: carico il file dall'archivio, oppure incollo il link di un'immagine già online. */
  const [modo, setModo] = useState<"file" | "link">("file");
  const [urlEsterno, setUrlEsterno] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [tipo, setTipo] = useState<TipoMedia>(tipoIniziale);
  const [titolo, setTitolo] = useState("");
  const [indirizzo, setIndirizzo] = useState("");
  const [mapsUrl, setMapsUrl] = useState("");
  const [linkUrl, setLinkUrl] = useState("");

  const anteprima = useMemo(
    () => (file && file.type.startsWith("image/") ? URL.createObjectURL(file) : null),
    [file],
  );
  useEffect(() => () => { if (anteprima) URL.revokeObjectURL(anteprima); }, [anteprima]);

  if (!codice) return <SbloccoAllestimento />;

  const mapsDaIndirizzo = indirizzo.trim()
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(indirizzo.trim())}`
    : "";

  const linkPronto = /^https:\/\/\S+$/i.test(urlEsterno.trim());
  const pronto = modo === "file" ? !!file : linkPronto;
  const inCorso = carica.isPending || salvaLink.isPending;
  const errore = (carica.error ?? salvaLink.error) as Error | null;
  const fatto = (carica.isSuccess || salvaLink.isSuccess) && !inCorso;

  function pulisci() {
    setFile(null);
    setUrlEsterno("");
    setTitolo("");
    setIndirizzo("");
    setMapsUrl("");
    setLinkUrl("");
    onFatto?.();
  }

  return (
    <form
      className="tbh-card p-5 grid gap-4"
      onSubmit={(e) => {
        e.preventDefault();
        const comuni = {
          codice,
          slot,
          tipo,
          titolo: titolo.trim() || undefined,
          indirizzo: indirizzo.trim() || undefined,
          mapsUrl: (mapsUrl.trim() || mapsDaIndirizzo) || undefined,
          linkUrl: linkUrl.trim() || undefined,
        };
        if (modo === "link") {
          if (!linkPronto) return;
          salvaLink.mutate({ ...comuni, url: urlEsterno.trim() }, { onSuccess: pulisci });
          return;
        }
        if (!file) return;
        carica.mutate({ ...comuni, file }, { onSuccess: pulisci });
      }}
    >
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setModo("file")}
          className={`px-4 py-2 rounded-full text-[11px] font-bold uppercase tracking-wide border inline-flex items-center gap-2 ${
            modo === "file"
              ? "border-[var(--tbh-neon)] text-[var(--tbh-neon)]"
              : "border-white/15 text-[var(--tbh-muted)]"
          }`}
        >
          <Upload size={14} /> Carica un file
        </button>
        <button
          type="button"
          onClick={() => setModo("link")}
          className={`px-4 py-2 rounded-full text-[11px] font-bold uppercase tracking-wide border inline-flex items-center gap-2 ${
            modo === "link"
              ? "border-[var(--tbh-neon)] text-[var(--tbh-neon)]"
              : "border-white/15 text-[var(--tbh-muted)]"
          }`}
        >
          <ExternalLink size={14} /> Incolla un link
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-[220px_1fr]">
        {modo === "file" ? (
          <label className="block">
            <span className="text-[11px] uppercase tracking-wide text-[var(--tbh-muted)]">
              File (immagine, logo, PDF)
            </span>
            <div className="mt-2 rounded-2xl border border-dashed border-white/20 bg-black/40 grid place-items-center h-[140px] overflow-hidden">
              {anteprima ? (
                <img src={anteprima} alt="" className="max-h-[136px] w-auto object-contain" />
              ) : (
                <span className="text-xs text-[var(--tbh-muted)] inline-flex items-center gap-2">
                  <Upload size={16} /> Scegli o trascina
                </span>
              )}
            </div>
            <input
              aria-label="File da caricare: immagine, logo o PDF"
              type="file"
              accept="image/*,application/pdf"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              className="mt-2 w-full text-xs text-[var(--tbh-muted)]"
            />
          </label>
        ) : (
          <div className="block">
            <span className="text-[11px] uppercase tracking-wide text-[var(--tbh-muted)]">
              Link dell'immagine già online
            </span>
            <div className="mt-2 rounded-2xl border border-dashed border-white/20 bg-black/40 grid place-items-center h-[140px] overflow-hidden">
              {linkPronto ? (
                <img
                  src={urlEsterno.trim()}
                  alt=""
                  className="max-h-[136px] w-auto object-contain"
                />
              ) : (
                <span className="text-xs text-[var(--tbh-muted)] px-3 text-center">
                  Incolla l'indirizzo che finisce in .jpg .png .webp
                </span>
              )}
            </div>
            <input
              aria-label="Link dell'immagine da mostrare"
              value={urlEsterno}
              onChange={(e) => setUrlEsterno(e.target.value)}
              placeholder="https://…"
              className="mt-2 w-full rounded-xl bg-black/50 border border-white/15 px-3 py-2 text-xs outline-none focus:border-[var(--tbh-neon)]"
            />
          </div>
        )}

        <div className="grid gap-3">
          <div className="flex flex-wrap gap-2">
            {TIPI.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTipo(t.id)}
                className={`px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wide border ${
                  tipo === t.id
                    ? "border-[var(--tbh-neon)] text-[var(--tbh-neon)]"
                    : "border-white/15 text-[var(--tbh-muted)]"
                }`}
              >
                {t.nome}
              </button>
            ))}
          </div>
          <input
            aria-label="Titolo per esteso"
            value={titolo}
            onChange={(e) => setTitolo(e.target.value)}
            placeholder="Titolo per esteso (come va scritto sul sito)"
            className="rounded-xl bg-black/50 border border-white/15 px-4 py-3 text-sm outline-none focus:border-[var(--tbh-neon)]"
          />
          <input
            aria-label="Indirizzo completo"
            value={indirizzo}
            onChange={(e) => setIndirizzo(e.target.value)}
            placeholder="Indirizzo completo (via, numero, città) — facoltativo"
            className="rounded-xl bg-black/50 border border-white/15 px-4 py-3 text-sm outline-none focus:border-[var(--tbh-neon)]"
          />
          <input
            aria-label="Link Google Maps"
            value={mapsUrl}
            onChange={(e) => setMapsUrl(e.target.value)}
            placeholder="Link Google Maps — se lo lasci vuoto lo creo dall'indirizzo"
            className="rounded-xl bg-black/50 border border-white/15 px-4 py-3 text-sm outline-none focus:border-[var(--tbh-neon)]"
          />
          <input
            aria-label="Link sito o social"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            placeholder="Link sito, social o pagina da aprire — facoltativo"
            className="rounded-xl bg-black/50 border border-white/15 px-4 py-3 text-sm outline-none focus:border-[var(--tbh-neon)]"
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <button
          type="submit"
          disabled={!pronto || inCorso}
          className="tbh-neon-btn px-6 py-3 text-sm disabled:opacity-40"
        >
          {inCorso ? "Carico…" : modo === "link" ? "Metti sul sito" : "Carica sul sito"}
        </button>
        <span className="text-xs text-[var(--tbh-muted)]">
          Spazio: <b className="text-white">{slot}</b> — appena caricato si vede a tutti.
        </span>
      </div>
      {modo === "link" && (
        <p className="text-xs text-[var(--tbh-muted)]">
          Col link non copiamo il file: la pagina mostra l'immagine dalla fonte. Se la fonte la
          toglie, l'immagine sparisce. Per i materiali definitivi conviene caricare il file.
        </p>
      )}
      {errore && (
        <p className="text-xs text-red-400">Caricamento non riuscito: {errore.message}</p>
      )}
      {fatto && <p className="text-xs text-[var(--tbh-neon)]">Caricato e pubblicato.</p>}
    </form>
  );
}

/* ────────────────────────────────────────────────────────────────────────────
   ANTEPRIMA DI UN MATERIALE — un posto solo per tutta la piattaforma.

   CORREZIONE del 29/09/2026 (controllo dei collegamenti, Priorità 1):
   nel pannello /allestimento un PDF caricato dentro uno spazio immagine veniva
   messo dentro un <img>. Il browser non sa disegnare un PDF: il riquadro
   restava bianco e sembrava «un'immagine che non arriva».

   La regola «cosa è un'immagine e cosa è un documento» era già scritta dentro
   CardMedia: qui viene tirata fuori una volta per tutte, così nessuna pagina
   deve riscriverla (regola dei doppioni).
   ──────────────────────────────────────────────────────────────────────────── */

/** true solo se il materiale è davvero un'immagine che il browser può disegnare. */
export function eImmagine(item: {
  url: string;
  tipo?: string | null;
  mime?: string | null;
}): boolean {
  if (item.tipo === "documento" || item.tipo === "video" || item.tipo === "audio") return false;
  if (item.mime && !item.mime.startsWith("image/")) return false;
  return !/\.(pdf|docx?|xlsx?|pptx?|csv|txt|odt|mp4|mov|m4v|webm|mp3|wav|ogg)($|\?)/i.test(
    item.url,
  );
}

/** Che tipo di materiale è, detto in italiano: serve come etichetta al posto dell'immagine. */
function etichettaMateriale(item: { url: string; tipo?: string | null; mime?: string | null }) {
  if (/\.pdf($|\?)/i.test(item.url) || item.mime === "application/pdf") return "Documento PDF";
  if (/\.(mp4|mov|m4v|webm)($|\?)/i.test(item.url) || item.mime?.startsWith("video/"))
    return "Video";
  if (/\.(mp3|wav|ogg)($|\?)/i.test(item.url) || item.mime?.startsWith("audio/")) return "Audio";
  return "Documento";
}

/**
 * Il riquadro di anteprima di un materiale caricato.
 * Immagine → si vede l'immagine. Documento, video o audio → si vede scritto che
 * cos'è, con il nome del file: niente riquadri bianchi senza spiegazione.
 */
export function AnteprimaMedia({
  item,
  altezzaClasse = "h-[170px]",
  immagineClasse = "max-h-[162px]",
}: {
  item: { url: string; titolo?: string | null; tipo?: string | null; mime?: string | null };
  altezzaClasse?: string;
  immagineClasse?: string;
}) {
  const immagine = eImmagine(item);
  return (
    <div
      className={`rounded-2xl bg-white grid place-items-center overflow-hidden ${altezzaClasse}`}
    >
      {immagine ? (
        <img
          src={item.url}
          alt={item.titolo ?? ""}
          loading="lazy"
          className={`${immagineClasse} w-auto object-contain`}
        />
      ) : (
        <span className="text-black/70 text-[11px] font-bold uppercase tracking-wide px-3 text-center leading-snug">
          {etichettaMateriale(item)}
          {item.titolo ? (
            <span className="block font-semibold normal-case tracking-normal text-black/50 mt-1 truncate max-w-[180px]">
              {item.titolo}
            </span>
          ) : null}
        </span>
      )}
    </div>
  );
}

/** Una card di materiale caricato: immagine + titolo + indirizzo + mappa + link. */
function CardMedia({
  item,
  gestione,
}: {
  item: {
    id: number;
    tipo: string;
    url: string;
    titolo: string | null;
    indirizzo: string | null;
    mapsUrl: string | null;
    linkUrl: string | null;
  };
  gestione: boolean;
}) {
  const { codice } = useCodiceAllestimento();
  const elimina = useEliminaMedia();

  return (
    <article className="tbh-card p-4 flex flex-col">
      {/* La regola «immagine o documento» sta in AnteprimaMedia, in un posto solo. */}
      <AnteprimaMedia item={item} />

      {item.titolo && (
        <h3 className="tbh-display text-xl leading-tight mt-4">{item.titolo}</h3>
      )}
      {item.indirizzo && (
        <p className="text-sm text-[var(--tbh-muted)] mt-2 inline-flex items-start gap-2">
          <MapPin size={15} className="text-[var(--tbh-gold)] shrink-0 mt-0.5" /> {item.indirizzo}
        </p>
      )}

      <div className="flex flex-wrap gap-2 mt-4">
        {item.mapsUrl && (
          <a
            href={item.mapsUrl}
            target="_blank"
            rel="noreferrer"
            className="tbh-neon-btn px-4 py-2 text-xs inline-flex items-center gap-2"
          >
            <MapPin size={14} /> Apri la mappa
          </a>
        )}
        {item.linkUrl && (
          <a
            href={item.linkUrl}
            target="_blank"
            rel="noreferrer"
            className="px-4 py-2 text-xs rounded-full border border-white/20 text-white inline-flex items-center gap-2 hover:border-[var(--tbh-neon)]"
          >
            <ExternalLink size={14} /> Apri il link
          </a>
        )}
        <a
          href={item.url}
          target="_blank"
          rel="noreferrer"
          className="px-4 py-2 text-xs rounded-full border border-white/20 text-[var(--tbh-muted)] inline-flex items-center gap-2 hover:border-white/40"
        >
          Vedi a schermo pieno
        </a>
      </div>

      {gestione && codice && (
        <button
          type="button"
          onClick={() => elimina.mutate({ codice, id: item.id })}
          disabled={elimina.isPending}
          className="mt-4 self-start text-xs text-red-400 inline-flex items-center gap-1.5 hover:underline disabled:opacity-40"
        >
          <Trash2 size={14} /> Togli dal sito
        </button>
      )}
    </article>
  );
}

type SlotProps = {
  slot: string;
  titolo?: string;
  descrizione?: string;
  tipoIniziale?: TipoMedia;
  /** Se falso, il modulo di caricamento non compare (solo visualizzazione). */
  caricamento?: boolean;
  /** Se vero e non c'è niente caricato, lo spazio non viene mostrato ai visitatori. */
  nascondiSeVuoto?: boolean;
};

/**
 * SPAZIO DA ALLESTIRE, pronto da mettere in qualunque pagina.
 * Mostra i materiali caricati e, per chi ha il codice, il modulo per caricarne altri.
 */
export function SlotMedia({
  slot,
  titolo = "Immagini, loghi e indirizzi",
  descrizione,
  tipoIniziale = "immagine",
  caricamento = true,
  nascondiSeVuoto = false,
}: SlotProps) {
  const q = useMediaSlot(slot);
  const { codice } = useCodiceAllestimento();
  const [apri, setApri] = useState(false);
  const items = q.data?.items ?? [];

  // Spazio vuoto: chi ha il codice lo vede per caricare, i visitatori no.
  if (nascondiSeVuoto && items.length === 0 && !codice) return null;

  return (
    <section className="mt-12">
      <div className="flex flex-wrap items-end justify-between gap-4 mb-5">
        <div>
          <p className="text-xs tracking-[0.25em] text-[var(--tbh-gold)] uppercase mb-1">
            Spazio da allestire
          </p>
          <h2 className="tbh-display tbh-h2">{titolo}</h2>
          {descrizione && (
            <p className="tbh-body text-[var(--tbh-muted)] max-w-3xl mt-2">{descrizione}</p>
          )}
        </div>
        {caricamento && (
          <button
            type="button"
            onClick={() => setApri((v) => !v)}
            className="tbh-neon-btn px-5 py-2.5 text-sm inline-flex items-center gap-2"
          >
            <Upload size={15} /> {apri ? "Chiudi" : codice ? "Carica qui" : "Carica (serve il codice)"}
          </button>
        )}
      </div>

      {apri && caricamento && (
        <div className="mb-6">
          <ModuloCaricamento slot={slot} tipoIniziale={tipoIniziale} />
        </div>
      )}

      {items.length === 0 ? (
        <div className="tbh-card p-6 flex items-start gap-3">
          <ImageIcon className="text-[var(--tbh-muted)] shrink-0" size={22} />
          <p className="text-sm text-[var(--tbh-muted)]">
            Spazio vuoto: qui vanno logo, immagini, indirizzo e link Google Maps reali. Finché non
            sono caricati non mettiamo niente al loro posto.
          </p>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {items.map((i) => (
            <CardMedia key={i.id} item={i} gestione={caricamento} />
          ))}
        </div>
      )}
    </section>
  );
}
