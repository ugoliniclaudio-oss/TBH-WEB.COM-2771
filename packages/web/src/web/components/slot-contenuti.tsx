import { useState } from "react";
import { Link } from "wouter";
import { ExternalLink, ImagePlus, Link2, Lock, Plus, Trash2, Upload } from "lucide-react";
import { useCodiceAllestimento } from "./media-slot";
import {
  useCaricaMedia,
  useEliminaMedia,
  useMediaSlot,
  useSalvaLinkMedia,
  useSalvaPulsante,
} from "../queries/media";

/**
 * SPAZIO DA RIEMPIRE AL VOLO — ordine di Claudio del 04/09/2026:
 * «come per i monitor mi fai la possibilità di aggiungere URL, per sorgente fonte
 *  contenute subito dopo visualizzabile: crea la stessa cosa per aggiungere foto,
 *  loghi, link, pulsanti e così via».
 *
 * Come funziona:
 * · si incolla il link (o si carica il file) e il contenuto si vede SUBITO nella pagina;
 * · a differenza dei monitor, qui il contenuto NON resta sul singolo dispositivo:
 *   viene salvato nel portale, quindi lo vedono tutti i visitatori;
 * · per aggiungere serve il codice di allestimento (una volta sola per dispositivo);
 * · niente contenuti finti: se lo spazio è vuoto, ai visitatori non compare nulla.
 *
 * Tre modi, stesso spazio:
 * · "pulsanti" → logo (facoltativo) + titolo per esteso + link di destinazione;
 * · "loghi"    → logo su fondo bianco, cliccabile se c'è il link;
 * · "foto"     → fotografie e immagini, cliccabili se c'è il link.
 */

export type ModoSlot = "pulsanti" | "loghi" | "foto";

type Item = {
  id: number;
  tipo: string;
  titolo: string | null;
  linkUrl: string | null;
  url: string;
};

/** Iniziali del titolo: si usano solo quando il logo non c'è ancora. */
function iniziali(t: string) {
  return t
    .replace(/[^A-Za-z0-9 ]/g, " ")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join("");
}

function interno(link: string) {
  return link.startsWith("/");
}

/** Il pulsante vero: funziona sia per le pagine del portale sia per i link esterni. */
function Apri({ link, testo, classe }: { link: string; testo: string; classe: string }) {
  if (interno(link)) {
    return (
      <Link href={link} className={classe}>
        {testo}
      </Link>
    );
  }
  return (
    <a href={link} target="_blank" rel="noreferrer" className={`${classe} inline-flex items-center gap-2`}>
      {testo} <ExternalLink size={14} />
    </a>
  );
}

function Cornice({
  item,
  modo,
  gestione,
  onElimina,
}: {
  item: Item;
  modo: ModoSlot;
  gestione: boolean;
  onElimina?: () => void;
}) {
  const titolo = item.titolo ?? "";
  const link = item.linkUrl ?? "";

  const cestino = gestione && onElimina && (
    <button
      type="button"
      onClick={onElimina}
      title="Rimuovi"
      aria-label={`Rimuovi ${titolo || "contenuto"}`}
      className="absolute top-3 right-3 z-10 rounded-full bg-black/70 border border-white/20 p-2 text-[var(--tbh-muted)] hover:text-red-400 hover:border-red-400"
    >
      <Trash2 size={14} />
    </button>
  );

  if (modo === "loghi") {
    return (
      <div className="tbh-card p-4 relative flex flex-col gap-3">
        {cestino}
        <div className="h-28 md:h-32 w-full rounded-2xl bg-white relative grid place-items-center overflow-hidden p-4">
          {item.url ? (
            <img src={item.url} alt={titolo} className="absolute inset-0 h-full w-full object-contain p-4" loading="eager" decoding="async" data-tessera-img />
          ) : (
            <span className="tbh-display text-4xl text-black/80">{iniziali(titolo) || "TBH"}</span>
          )}
        </div>
        <h3 className="tbh-display text-base leading-tight">{titolo || "Titolo da inserire"}</h3>
        {link ? (
          <Apri link={link} testo="Apri" classe="tbh-neon-btn px-4 py-2 text-xs self-start" />
        ) : (
          <span className="text-xs text-[var(--tbh-muted)]">Link da incollare</span>
        )}
      </div>
    );
  }

  if (modo === "foto") {
    return (
      <figure className="tbh-card p-3 relative flex flex-col gap-3">
        {cestino}
        <div className="w-full aspect-[4/3] rounded-2xl overflow-hidden bg-black/50 grid place-items-center">
          {item.url ? (
            <img src={item.url} alt={titolo} loading="lazy" className="h-full w-full object-cover" />
          ) : (
            <span className="text-xs text-[var(--tbh-muted)]">Immagine da incollare</span>
          )}
        </div>
        <figcaption className="px-1 pb-1 flex flex-wrap items-center justify-between gap-3">
          <span className="tbh-body text-sm">{titolo || "Didascalia da inserire"}</span>
          {link && (
            <Apri
              link={link}
              testo="Apri"
              classe="px-4 py-2 rounded-full border border-[var(--tbh-line)] text-xs font-semibold hover:border-[var(--tbh-neon)]"
            />
          )}
        </figcaption>
      </figure>
    );
  }

  // modo "pulsanti": logo grande + titolo per esteso + pulsante, come chiesto al punto 7.
  return (
    <article className="tbh-card p-4 relative flex items-center gap-4">
      {cestino}
      <div className="h-20 w-20 md:h-24 md:w-24 shrink-0 rounded-2xl bg-white relative grid place-items-center overflow-hidden p-2.5">
        {item.url ? (
          <img src={item.url} alt={titolo} className="absolute inset-0 h-full w-full object-contain p-2.5" loading="eager" decoding="async" data-tessera-img />
        ) : (
          <span className="tbh-display text-2xl md:text-3xl text-black/80">
            {iniziali(titolo) || "TBH"}
          </span>
        )}
      </div>
      <div className="grow min-w-0 pr-8">
        <h3 className="tbh-display text-base md:text-lg leading-tight break-words">
          {titolo || "Titolo da inserire"}
        </h3>
        <div className="mt-2.5">
          {link ? (
            <Apri link={link} testo="Apri" classe="tbh-neon-btn px-4 py-2 text-xs" />
          ) : (
            <span className="text-xs text-[var(--tbh-muted)]">Link da incollare</span>
          )}
        </div>
      </div>
    </article>
  );
}

const campo =
  "w-full rounded-xl bg-black/50 border border-white/15 px-4 py-3 text-sm outline-none focus:border-[var(--tbh-neon)]";
const etichetta = "block text-xs uppercase tracking-wide text-[var(--tbh-muted)] mb-1.5";

/** Modulo di inserimento con anteprima dal vivo: si vede prima di salvare. */
function Modulo({ slot, modo, onFatto }: { slot: string; modo: ModoSlot; onFatto: () => void }) {
  const { codice } = useCodiceAllestimento();
  const salvaPulsante = useSalvaPulsante();
  const salvaLink = useSalvaLinkMedia();
  const caricaFile = useCaricaMedia();
  const [via, setVia] = useState<"link" | "file">("link");
  const [titolo, setTitolo] = useState("");
  const [immagine, setImmagine] = useState("");
  const [link, setLink] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [errore, setErrore] = useState<string | null>(null);

  const anteprimaFile = file ? URL.createObjectURL(file) : "";
  const anteprima: Item = {
    id: -1,
    tipo: modo === "pulsanti" ? "pulsante" : "immagine",
    titolo: titolo || null,
    linkUrl: link || null,
    url: via === "file" ? anteprimaFile : immagine,
  };

  const inCorso = salvaPulsante.isPending || salvaLink.isPending || caricaFile.isPending;
  const messaggio =
    (salvaPulsante.error as Error | null)?.message ??
    (salvaLink.error as Error | null)?.message ??
    (caricaFile.error as Error | null)?.message ??
    errore;

  function pulisci() {
    setTitolo("");
    setImmagine("");
    setLink("");
    setFile(null);
    setErrore(null);
    onFatto();
  }

  function invia(e: React.FormEvent) {
    e.preventDefault();
    setErrore(null);
    if (!titolo.trim()) {
      setErrore("Serve il titolo per esteso.");
      return;
    }

    // Pulsante: logo facoltativo, link obbligatorio.
    if (modo === "pulsanti" && via === "link") {
      if (!link.trim()) {
        setErrore("Serve il link di destinazione (https://… oppure /pagina del portale).");
        return;
      }
      salvaPulsante.mutate(
        { codice, slot, titolo: titolo.trim(), linkUrl: link.trim(), logoUrl: immagine.trim() },
        { onSuccess: pulisci },
      );
      return;
    }

    // Foto e loghi: serve l'immagine, il link è facoltativo.
    if (via === "file") {
      if (!file) {
        setErrore("Scegli il file da caricare.");
        return;
      }
      caricaFile.mutate(
        {
          codice,
          slot,
          file,
          tipo: modo === "loghi" ? "logo" : "immagine",
          titolo: titolo.trim(),
          linkUrl: link.trim() || undefined,
        },
        { onSuccess: pulisci },
      );
      return;
    }

    if (!immagine.trim()) {
      setErrore("Incolla il link dell'immagine (https://…).");
      return;
    }
    salvaLink.mutate(
      {
        codice,
        slot,
        url: immagine.trim(),
        tipo: modo === "loghi" ? "logo" : "immagine",
        titolo: titolo.trim(),
        linkUrl: link.trim() || undefined,
      },
      { onSuccess: pulisci },
    );
  }

  return (
    <form onSubmit={invia} className="tbh-card p-5 mb-6 grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
      <div className="grid gap-4">
        <div className="flex flex-wrap gap-2">
          {(["link", "file"] as const).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setVia(v)}
              className={`px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-wide transition inline-flex items-center gap-2 ${
                via === v ? "bg-[var(--tbh-neon)] text-black" : "bg-white/10 hover:bg-white/20"
              }`}
            >
              {v === "link" ? <Link2 size={14} /> : <Upload size={14} />}
              {v === "link" ? "Incolla il link" : "Carica il file"}
            </button>
          ))}
        </div>

        <label>
          <span className={etichetta}>Titolo per esteso</span>
          <input
            aria-label="Titolo per esteso"
            className={campo}
            value={titolo}
            onChange={(e) => setTitolo(e.target.value)}
            placeholder="Es. Touch Communications Srl"
          />
        </label>

        {via === "link" ? (
          <label>
            <span className={etichetta}>
              {modo === "pulsanti" ? "Link del logo (facoltativo)" : "Link dell'immagine"}
            </span>
            <input
              aria-label={modo === "pulsanti" ? "Link del logo" : "Link dell'immagine"}
              className={campo}
              value={immagine}
              onChange={(e) => setImmagine(e.target.value)}
              placeholder="https://… oppure /companies/logo.png"
            />
          </label>
        ) : (
          <label>
            <span className={etichetta}>File da caricare (foto, logo, immagine)</span>
            <input
              aria-label="File da caricare"
              type="file"
              accept="image/*"
              className={campo}
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
          </label>
        )}

        <label>
          <span className={etichetta}>
            Link di destinazione {modo === "pulsanti" ? "(obbligatorio)" : "(facoltativo)"}
          </span>
          <input
            aria-label="Link di destinazione"
            className={campo}
            value={link}
            onChange={(e) => setLink(e.target.value)}
            placeholder="https://sito.it oppure /shop"
          />
        </label>

        <div className="flex flex-wrap items-center gap-3">
          <button type="submit" disabled={inCorso} className="tbh-neon-btn px-6 py-3 text-sm disabled:opacity-40">
            {inCorso ? "Salvo…" : "Salva e pubblica"}
          </button>
          <span className="text-xs text-[var(--tbh-muted)]">
            Salvato nel portale: lo vedono tutti i visitatori, non solo questo dispositivo.
          </span>
        </div>

        {messaggio && <p className="text-xs text-red-400">{messaggio}</p>}
      </div>

      <div>
        <p className={etichetta}>Anteprima dal vivo</p>
        <Cornice item={anteprima} modo={modo} gestione={false} />
        <p className="text-[11px] text-[var(--tbh-muted)] mt-3">
          Se l'immagine non compare, il link non è quello del file ma della pagina che lo contiene:
          va copiato l'indirizzo dell'immagine.
        </p>
      </div>
    </form>
  );
}

export function SlotContenuti({
  slot,
  modo = "pulsanti",
  titolo = "Pulsanti, loghi e immagini",
  descrizione,
  nascondiSeVuoto = true,
  colonne = 3,
}: {
  slot: string;
  modo?: ModoSlot;
  titolo?: string;
  descrizione?: string;
  /** Se vero, ai visitatori lo spazio vuoto non compare per niente. */
  nascondiSeVuoto?: boolean;
  colonne?: 2 | 3 | 4;
}) {
  const q = useMediaSlot(slot);
  const { codice } = useCodiceAllestimento();
  const elimina = useEliminaMedia();
  const [apri, setApri] = useState(false);
  const items = (q.data?.items ?? []) as Item[];
  const sbloccato = codice.length > 0;

  if (nascondiSeVuoto && items.length === 0 && !sbloccato) return null;

  const griglia =
    colonne === 2
      ? "sm:grid-cols-2"
      : colonne === 4
        ? "sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        : "sm:grid-cols-2 xl:grid-cols-3";

  return (
    <section className="mt-12" data-slot-contenuti={slot}>
      <div className="flex flex-wrap items-end justify-between gap-4 mb-5">
        <div>
          <p className="text-xs tracking-[0.25em] text-[var(--tbh-gold)] uppercase mb-1">
            Spazio da riempire
          </p>
          <h2 className="tbh-display tbh-h2">{titolo}</h2>
          {descrizione && <p className="tbh-body text-[var(--tbh-muted)] max-w-3xl mt-2">{descrizione}</p>}
        </div>
        {sbloccato ? (
          <button
            type="button"
            onClick={() => setApri((v) => !v)}
            className="tbh-neon-btn px-5 py-2.5 text-sm inline-flex items-center gap-2"
          >
            {apri ? "Chiudi" : <>
              <Plus size={15} /> Aggiungi qui
            </>}
          </button>
        ) : (
          <Link
            href="/allestimento"
            className="px-5 py-2.5 rounded-full border border-[var(--tbh-line)] text-sm font-semibold inline-flex items-center gap-2 hover:border-[var(--tbh-neon)]"
          >
            <Lock size={15} /> Sblocca per aggiungere
          </Link>
        )}
      </div>

      {apri && sbloccato && <Modulo slot={slot} modo={modo} onFatto={() => setApri(false)} />}

      {items.length === 0 ? (
        <div className="tbh-card p-6 flex items-start gap-3">
          <ImagePlus className="text-[var(--tbh-muted)] shrink-0" size={22} />
          <p className="text-sm text-[var(--tbh-muted)]">
            Spazio vuoto: qui vanno logo, titolo per esteso e link reali. Finché non ci sono, ai
            visitatori non mostriamo nulla al loro posto.
          </p>
        </div>
      ) : (
        <div className={`grid gap-5 ${griglia}`}>
          {items.map((i) => (
            <Cornice
              key={i.id}
              item={i}
              modo={modo}
              gestione={sbloccato}
              onElimina={() => {
                if (confirm(`Rimuovere "${i.titolo ?? "questo contenuto"}"?`)) {
                  elimina.mutate({ codice, id: i.id });
                }
              }}
            />
          ))}
        </div>
      )}
    </section>
  );
}
