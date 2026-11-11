import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, ExternalLink, Link2, MessageCircle, Play, Trash2 } from "lucide-react";
import { Link } from "wouter";
import { waInfo } from "../lib/whatsapp";

/**
 * MONITOR CON SPAZIO PER URL — ordine di Claudio (29/08/2026):
 * «SPAZIO PER URL PARTITA INTEGRALE, URL HIGHLIGHTS ... STESSA COSA CON DJ HUGÒ,
 *  MONITOR SOPRA CON CUI INSERIRE URL DEL BRANO STESSO».
 *
 * Come funziona, senza inventare niente:
 * · se il portale ha già l'URL UFFICIALE (campo dati), il player parte da quello;
 * · se non c'è, il monitor mostra il CAMPO dove incollare l'URL: il player si accende subito;
 * · l'URL incollato resta salvato SOLO su quel dispositivo (localStorage) e la pagina lo dichiara:
 *   è una prova, non una pubblicazione. Per fissarlo nel sito serve mandarlo a noi.
 * Nessun player finto quando lo slot è vuoto.
 */

export type Incorporato = { tipo: "iframe" | "video"; src: string } | null;

/** Riconosce YouTube, Vimeo, Suno, Facebook e file video diretti. Nessun URL inventato. */
export function incorpora(raw: string | null): Incorporato {
  if (!raw) return null;
  const url = raw.trim();
  if (!/^https?:\/\//i.test(url)) return null;

  try {
    const u = new URL(url);
    const host = u.hostname.replace(/^www\./, "").toLowerCase();

    // File video diretto
    if (/\.(mp4|webm|ogg|m4v|mov)$/i.test(u.pathname)) return { tipo: "video", src: url };

    // YouTube
    if (host === "youtu.be") {
      const id = u.pathname.slice(1);
      return id ? { tipo: "iframe", src: `https://www.youtube.com/embed/${id}` } : null;
    }
    if (host.endsWith("youtube.com") || host.endsWith("youtube-nocookie.com")) {
      if (u.pathname.startsWith("/embed/")) return { tipo: "iframe", src: url };
      const list = u.searchParams.get("list");
      const v = u.searchParams.get("v");
      if (u.pathname.startsWith("/playlist") && list)
        return { tipo: "iframe", src: `https://www.youtube.com/embed/videoseries?list=${list}` };
      if (u.pathname.startsWith("/shorts/"))
        return { tipo: "iframe", src: `https://www.youtube.com/embed/${u.pathname.split("/")[2]}` };
      if (u.pathname.startsWith("/live/"))
        return { tipo: "iframe", src: `https://www.youtube.com/embed/${u.pathname.split("/")[2]}` };
      if (v) return { tipo: "iframe", src: `https://www.youtube.com/embed/${v}${list ? `?list=${list}` : ""}` };
      return null;
    }

    // Vimeo
    if (host.endsWith("vimeo.com")) {
      const id = u.pathname.split("/").filter(Boolean)[0];
      return id && /^\d+$/.test(id) ? { tipo: "iframe", src: `https://player.vimeo.com/video/${id}` } : null;
    }

    // Suno (brani)
    if (host.endsWith("suno.com") || host.endsWith("suno.ai")) {
      const parti = u.pathname.split("/").filter(Boolean);
      if (parti[0] === "song" && parti[1]) return { tipo: "iframe", src: `https://suno.com/embed/${parti[1]}` };
      return null;
    }

    // Facebook video
    if (host.endsWith("facebook.com") || host.endsWith("fb.watch")) {
      return {
        tipo: "iframe",
        src: `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(url)}&show_text=false`,
      };
    }

    return null;
  } catch {
    return null;
  }
}

const PREFISSO = "tbh-monitor-url:";

/**
 * Monitor con spazio URL. `url` = URL ufficiale già in archivio (null se non ricevuto).
 * `chiave` = identificativo dello slot, usato per ricordare l'URL di prova su questo dispositivo.
 */
export function MonitorUrl({
  titolo,
  url,
  chiave,
  colore,
  cta,
  archivio,
  argomento,
  altezza = "video",
}: {
  titolo: string;
  url: string | null;
  chiave: string;
  colore: string;
  cta: string;
  archivio: string | null;
  argomento: string;
  altezza?: "video" | "basso";
}) {
  const [provvisorio, setProvvisorio] = useState<string | null>(null);
  const [testo, setTesto] = useState("");
  const [errore, setErrore] = useState<string | null>(null);

  useEffect(() => {
    try {
      const salvato = localStorage.getItem(PREFISSO + chiave);
      if (salvato) {
        setProvvisorio(salvato);
        setTesto(salvato);
      } else {
        setProvvisorio(null);
        setTesto("");
      }
    } catch {
      /* localStorage non disponibile: il monitor resta dichiarato vuoto */
    }
  }, [chiave]);

  const attivo = url ?? provvisorio;
  const player = useMemo(() => incorpora(attivo), [attivo]);

  function salva() {
    const pulito = testo.trim();
    if (!pulito) {
      setErrore("Incolla l'URL del video o del brano.");
      return;
    }
    if (!incorpora(pulito)) {
      setErrore(
        "Link non riconosciuto: servono YouTube, Vimeo, Suno, Facebook video o un file video diretto (.mp4).",
      );
      return;
    }
    setErrore(null);
    setProvvisorio(pulito);
    try {
      localStorage.setItem(PREFISSO + chiave, pulito);
    } catch {
      /* niente: resta valido per la sessione corrente */
    }
  }

  function svuota() {
    setProvvisorio(null);
    setTesto("");
    setErrore(null);
    try {
      localStorage.removeItem(PREFISSO + chiave);
    } catch {
      /* nessuna azione */
    }
  }

  return (
    <div className="tbh-card overflow-hidden flex flex-col" style={{ borderColor: `${colore}66` }}>
      <div
        className="px-4 py-2 text-center text-xs font-bold uppercase tracking-[0.18em] text-black"
        style={{ background: colore }}
      >
        {titolo}
      </div>

      <div
        className={`relative bg-black/70 grid place-items-center ${
          altezza === "basso" ? "aspect-[16/6]" : "aspect-video"
        }`}
      >
        {player ? (
          player.tipo === "iframe" ? (
            <iframe
              src={player.src}
              title={titolo}
              className="absolute inset-0 h-full w-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; picture-in-picture; compute-pressure"
              allowFullScreen
            />
          ) : (
            // eslint-disable-next-line jsx-a11y/media-has-caption
            <video
              src={player.src}
              controls
              aria-label="Riproduttore video"
              className="absolute inset-0 h-full w-full bg-black"
            />
          )
        ) : (
          <div className="flex flex-col items-center gap-2 p-6 text-center">
            <span
              className="grid h-14 w-14 place-items-center rounded-full border-2"
              style={{ borderColor: colore, color: colore }}
            >
              <Play size={22} />
            </span>
            <span className="text-sm font-bold uppercase tracking-wide">Monitor libero</span>
            <span className="text-xs text-[var(--tbh-muted)]">
              Incolla qui sotto l'URL e il monitor si accende. Nessun video finto.
            </span>
          </div>
        )}
      </div>

      {/* SPAZIO PER URL */}
      <div className="flex flex-col gap-2 p-3">
        {!url && (
          <>
            <label className="flex flex-col gap-1.5">
              <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-[var(--tbh-gold)]">
                <Link2 size={13} /> Spazio URL — {titolo}
              </span>
              <span className="flex flex-wrap gap-2">
                <input
                  value={testo}
                  onChange={(e) => setTesto(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") salva();
                  }}
                  placeholder="https://… (YouTube, Vimeo, Suno, Facebook, .mp4)"
                  aria-label="Indirizzo del contenuto da mostrare"
                  className="min-w-0 flex-1 rounded-full border border-[var(--tbh-line)] bg-black/50 px-3 py-2 text-sm outline-none focus:border-[var(--tbh-neon)]"
                />
                <button
                  type="button"
                  onClick={salva}
                  className="rounded-full px-4 py-2 text-xs font-bold uppercase tracking-wide text-black"
                  style={{ background: colore }}
                >
                  Accendi monitor
                </button>
                {provvisorio && (
                  <button
                    type="button"
                    onClick={svuota}
                    className="inline-flex items-center gap-1.5 rounded-full border border-[var(--tbh-line)] px-3 py-2 text-[11px] font-bold uppercase tracking-wide hover:border-[#ff2b2b] hover:text-[#ff2b2b]"
                  >
                    <Trash2 size={13} /> Svuota
                  </button>
                )}
              </span>
            </label>
            {errore && <p className="text-[11px] font-semibold text-[#ff5b5b]">{errore}</p>}
            {provvisorio && (
              <p className="text-[11px] text-[var(--tbh-muted)]">
                URL provvisorio salvato solo su questo dispositivo: mandalo su WhatsApp e lo fissiamo
                nel sito per tutti.
              </p>
            )}
            {!provvisorio && (
              <p className="text-[11px] text-[var(--tbh-muted)]">
                URL ufficiale non ancora ricevuto: questo campo serve per la prova immediata, non
                pubblica nulla per gli altri utenti.
              </p>
            )}
          </>
        )}

        <div className="flex flex-wrap items-center gap-2 pt-1">
          {attivo ? (
            <a
              href={attivo}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold uppercase tracking-wide text-black"
              style={{ background: colore }}
            >
              {cta} <ExternalLink size={13} />
            </a>
          ) : (
            <a
              href={waInfo(`${titolo} — ${argomento}`)}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold uppercase tracking-wide text-black"
              style={{ background: colore }}
            >
              <MessageCircle size={14} /> Invia il link ufficiale
            </a>
          )}
          {archivio && (
            <a
              href={archivio}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-[var(--tbh-muted)] hover:text-[var(--tbh-neon)]"
            >
              Archivio <ExternalLink size={12} />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * FRECCE AVANTI / INDIETRO — ordine di Claudio: «UNA FRECCIA PER ANDARE AVANTI
 * O TORNARE INDIETRO PER COMODITÀ DELL'UTENTE». Nessun bottone morto: se manca
 * il precedente o il successivo la freccia non compare.
 */
export function FrecceNav({
  prima,
  dopo,
  colore,
  etichetta,
  indice,
  totale,
  onPrima,
  onDopo,
}: {
  prima: { href: string; nome: string } | null;
  dopo: { href: string; nome: string } | null;
  colore: string;
  etichetta: string;
  indice?: number;
  totale?: number;
  /** Se passati, le frecce scorrono dentro la pagina (schede) invece di cambiare rotta. */
  onPrima?: () => void;
  onDopo?: () => void;
}) {
  const stile = "inline-flex min-w-0 items-center gap-2 rounded-full border px-4 py-2 text-xs font-bold uppercase tracking-wide transition hover:bg-white/5";
  const bordo = { borderColor: `${colore}88`, color: colore };

  return (
    <nav className="flex flex-wrap items-center justify-between gap-3" aria-label={etichetta}>
      {prima ? (
        onPrima ? (
          <button type="button" onClick={onPrima} className={stile} style={bordo}>
            <ChevronLeft size={16} className="shrink-0" />
            <span className="truncate max-w-[42vw] md:max-w-[280px]">{prima.nome}</span>
          </button>
        ) : (
          <Link href={prima.href} className={stile} style={bordo}>
            <ChevronLeft size={16} className="shrink-0" />
            <span className="truncate max-w-[42vw] md:max-w-[280px]">{prima.nome}</span>
          </Link>
        )
      ) : (
        <span />
      )}

      {typeof indice === "number" && typeof totale === "number" && (
        <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--tbh-muted)]">
          {indice + 1} / {totale}
        </span>
      )}

      {dopo ? (
        /* Come la freccia indietro: se la pagina passa onDopo si scorre dentro la
           pagina, altrimenti si cambia indirizzo. Senza questo la freccia avanti
           restava un collegamento fermo su «#». */
        onDopo ? (
          <button type="button" onClick={onDopo} className={stile} style={bordo}>
            <span className="truncate max-w-[42vw] md:max-w-[280px]">{dopo.nome}</span>
            <ChevronRight size={16} className="shrink-0" />
          </button>
        ) : (
          <Link href={dopo.href} className={stile} style={bordo}>
            <span className="truncate max-w-[42vw] md:max-w-[280px]">{dopo.nome}</span>
            <ChevronRight size={16} className="shrink-0" />
          </Link>
        )
      ) : (
        <span />
      )}
    </nav>
  );
}
