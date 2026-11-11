import { useEffect, useRef, useState, type ReactNode } from "react";
import { Link } from "wouter";
import { ExternalLink, Play } from "lucide-react";
import { useAnteprimaChannel, type VoceAnteprimaChannel } from "../queries/channel-registro";
import type { VoceMonitor } from "./monitor-rotante";
import { GIALLO, type ImmagineCard } from "./struttura";

/* ────────────────────────────────────────────────────────────────────────────
   CARD CHANNEL — 28/10/2026 (round 14, i 10 banner TBH).

   UNA sola card per tutti i Channel: Home «Canale 0», /channel (Tutti i Channel e sezioni).
     · BANNER/LOGO intero, grande (riquadro 2:1, object-contain: mai ritagliato né ridisegnato);
     · MONITOR con l'anteprima del palinsesto vero (Gestione contenuti + Regia); nessun contenuto =
       «PALINSESTO IN PREPARAZIONE», niente di inventato;
     · APRI CHANNEL (pagina del Channel o player /channel/play/<slug>) · APRI SCHEDA ·
       APRI IL SITO solo con un indirizzo vero (Regia o sito ufficiale verificato; 29/10/2026: era «Vai al sito»).
   Niente link annidati: banner e monitor sono scorciatoie per mouse e tocco (fuori dal Tab),
   da tastiera si usano i pulsanti.
   ──────────────────────────────────────────────────────────────────────────── */

export const percorsoPlayer = (slug: string) => `/channel/play/${slug}`;

export const ETICHETTA_TIPO: Record<string, string> = {
  video: "VIDEO",
  film: "FILM",
  spot: "SPOT",
  immagine: "IMMAGINE",
  audio: "AUDIO",
  scheda: "SCHEDA",
  annuncio: "ANNUNCIO",
  diretta: "DIRETTA",
};

/** Tipi che girano a tempo (la durata scelta in Regia); i video durano quanto il video. */
const A_TEMPO = new Set(["immagine", "scheda", "annuncio"]);

export function vociMonitorDaAnteprima(voci: VoceAnteprimaChannel[]): VoceMonitor[] {
  return voci.map((v) => ({
    id: v.id,
    titolo: v.titolo,
    sotto: ETICHETTA_TIPO[v.tipo] ?? v.tipo.toUpperCase(),
    immagine: v.immagine,
    youtube: v.youtube,
    media: v.media,
    link: v.link,
    durataSec: A_TEMPO.has(v.tipo) ? v.durataSec : null,
  }));
}

/** Testo del monitor senza contenuti: solo ciò che è vero. */
export function testoSenzaContenuti(stato: string | undefined, caricamento: boolean) {
  if (caricamento) return "LETTURA DEL PALINSESTO…";
  if (stato === "PALINSESTO CONDIVISO") return "PALINSESTO CONDIVISO TV · RADIO";
  return "PALINSESTO IN PREPARAZIONE";
}

function useInVista<T extends Element>() {
  const ref = useRef<T>(null);
  const [vista, setVista] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || vista) return;
    if (typeof IntersectionObserver === "undefined") {
      setVista(true);
      return;
    }
    const io = new IntersectionObserver(
      (e) => {
        if (e.some((x) => x.isIntersecting)) {
          setVista(true);
          io.disconnect();
        }
      },
      { rootMargin: "240px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [vista]);
  return [ref, vista] as const;
}

function Destinazione({
  href,
  esterno,
  className,
  children,
  label,
  scorciatoia = false,
  style,
  testid,
}: {
  href: string;
  esterno?: boolean;
  className: string;
  children: ReactNode;
  label: string;
  /** Doppione di un pulsante: cliccabile col mouse/tocco ma fuori dall'ordine di tabulazione. */
  scorciatoia?: boolean;
  style?: React.CSSProperties;
  testid?: string;
}) {
  const extra = scorciatoia ? { tabIndex: -1, "aria-hidden": true as const } : { "aria-label": label };
  return esterno ? (
    <a href={href} target="_blank" rel="noopener noreferrer" className={className} style={style} data-testid={testid} {...extra}>
      {children}
    </a>
  ) : (
    <Link href={href} className={className} style={style} data-testid={testid} {...extra}>
      {children}
    </Link>
  );
}

/** Monitor piccolo della card: le immagini/miniature del palinsesto vero a rotazione; clic = APRI CHANNEL. */
export function MonitorAnteprima({
  slug,
  href,
  esterno,
  titolo,
  colore = GIALLO,
}: {
  slug: string;
  href: string;
  esterno?: boolean;
  titolo: string;
  colore?: string;
}) {
  const [ref, vista] = useInVista<HTMLDivElement>();
  const q = useAnteprimaChannel(slug, vista);
  const voci = q.data?.voci ?? [];
  const n = voci.length;
  const [i, setI] = useState(0);
  const v = n ? voci[i % n]! : null;
  useEffect(() => {
    if (n < 2 || !v) return;
    const d = A_TEMPO.has(v.tipo) && v.durataSec ? Math.max(4, Math.min(30, v.durataSec)) : 7;
    const t = window.setTimeout(() => setI((x) => (x + 1) % n), d * 1000);
    return () => window.clearTimeout(t);
  }, [i, n, v]);

  return (
    <div ref={ref} className="relative" data-testid={`monitor-card-${slug}`} data-voci={n} data-stato={q.data?.stato ?? ""}>
      <Destinazione
        href={href}
        esterno={esterno}
        label={`Apri Channel · ${titolo}`}
        scorciatoia
        className="relative block aspect-video w-full overflow-hidden rounded-lg border bg-[#0b0b0d] transition hover:brightness-110"
        style={{ borderColor: "rgba(255,255,255,0.12)", boxShadow: "inset 0 0 0 4px #0d0d0f" }}
      >
        {v ? (
          <>
            {v.immagine ? (
              <img
                key={v.id}
                src={v.immagine}
                alt=""
                loading="lazy"
                decoding="async"
                referrerPolicy="no-referrer"
                className="tbh-monitor-entra absolute inset-0 h-full w-full object-contain"
              />
            ) : (
              <span
                key={v.id}
                className="tbh-monitor-entra absolute inset-0 grid place-items-center px-3 text-center text-[12px] font-black leading-tight text-white"
                style={{ background: `radial-gradient(120% 90% at 50% 0%, ${colore}22, #0b0b0d 70%)` }}
              >
                {v.titolo}
              </span>
            )}
            <span className="pointer-events-none absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/90 to-transparent" />
            <span className="absolute left-1.5 top-1.5 rounded-full bg-black/75 px-2 py-0.5 text-[8.5px] font-extrabold tracking-[0.16em]" style={{ color: colore }}>
              IN ONDA · {i % n + 1}/{n}
            </span>
            <span className="absolute inset-x-2 bottom-1.5 flex items-center gap-1.5">
              {(v.youtube || v.media) && (
                <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full text-black" style={{ background: colore }}>
                  <Play size={11} fill="currentColor" aria-hidden />
                </span>
              )}
              <span className="min-w-0 truncate text-[10.5px] font-bold text-white">{v.titolo}</span>
            </span>
          </>
        ) : (
          <span className="absolute inset-0 grid place-items-center px-3 text-center">
            <span className="rounded-full border px-3 py-1 text-[9px] font-extrabold tracking-[0.18em]" style={{ borderColor: `${colore}80`, color: colore }} data-testid={`vuoto-card-${slug}`}>
              {testoSenzaContenuti(q.data?.stato, vista && q.isLoading)}
            </span>
          </span>
        )}
      </Destinazione>
    </div>
  );
}

export function CardChannel({
  slug,
  titolo,
  sotto,
  immagine,
  colore = GIALLO,
  bordo,
  tratteggiato = false,
  angoloSx,
  angoloDx,
  apri,
  scheda,
  sito,
  testid,
  testidBox,
  testidLogo,
  dati,
  livelloTitolo = 3,
}: {
  /** Slug per il monitor del palinsesto; null = nessun monitor (spazi vuoti). */
  slug: string | null;
  titolo: string;
  sotto?: string | null;
  immagine: ImmagineCard;
  colore?: string;
  bordo?: string;
  tratteggiato?: boolean;
  angoloSx?: ReactNode;
  angoloDx?: ReactNode;
  /** APRI CHANNEL: pagina del Channel o player; null = nessun Channel da aprire (spazio vuoto). */
  apri: { href: string; esterno?: boolean } | null;
  scheda: string | null;
  /** Solo un indirizzo VERO (Regia o sito ufficiale verificato); null = nessun «Apri il Sito». */
  sito: string | null;
  testid?: string;
  testidBox?: string;
  testidLogo?: string;
  dati?: Record<string, string | undefined>;
  livelloTitolo?: 2 | 3;
}) {
  const H = livelloTitolo === 2 ? "h2" : "h3";
  const dataAttr = Object.fromEntries(Object.entries(dati ?? {}).map(([k, v]) => [`data-${k}`, v]));
  const principale = apri ?? (scheda ? { href: scheda, esterno: false } : null);
  const faccia = (
    <>
      <span
        className="pointer-events-none absolute inset-0 rounded-xl border-2 opacity-0 transition-opacity duration-200 group-hover:opacity-100"
        style={{ borderColor: colore }}
        aria-hidden
      />
      {immagine ? (
        <img
          src={immagine.src}
          alt={`Logo ${titolo}`}
          width={immagine.larghezza ?? undefined}
          height={immagine.altezza ?? undefined}
          loading="lazy"
          decoding="async"
          className="absolute inset-0 h-full w-full object-contain p-1"
          data-testid={testidLogo}
        />
      ) : (
        <span className="text-balance px-2 text-[15px] font-black leading-tight tracking-[0.02em] text-white sm:text-base xl:text-[15px]">{titolo}</span>
      )}
    </>
  );
  const classeFaccia = `relative flex aspect-[2/1] w-full items-center justify-center overflow-hidden rounded-xl border bg-black text-center transition duration-200 group-hover:-translate-y-0.5 group-hover:shadow-[0_10px_30px_-12px_rgba(215,255,0,0.35)] ${
    tratteggiato ? "border-dashed" : ""
  }`;
  const stileFaccia = { borderColor: bordo ?? "rgba(255,255,255,0.14)" };
  const pulsante =
    "inline-flex min-h-10 items-center justify-center gap-1 rounded-full px-2 text-center text-[10.5px] font-extrabold tracking-[0.1em] transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#d7ff00]";
  return (
    <article className="group relative flex min-w-0 flex-col gap-2" data-testid={testid} data-card-channel={slug ?? ""} data-card-modello={principale?.href} {...dataAttr}>
      {(angoloSx || angoloDx) && (
        <div className="flex min-h-[14px] items-center justify-between gap-2 text-[9px] font-extrabold tracking-[0.16em]">
          <span className="min-w-0 truncate">{angoloSx}</span>
          {angoloDx && <span className="min-w-0 truncate text-right">{angoloDx}</span>}
        </div>
      )}
      {principale ? (
        <Destinazione href={principale.href} esterno={principale.esterno} label={titolo} scorciatoia className={classeFaccia} style={stileFaccia} testid={testidBox}>
          {faccia}
        </Destinazione>
      ) : (
        <div className={classeFaccia} style={stileFaccia} data-testid={testidBox}>
          {faccia}
        </div>
      )}
      <div className="flex min-w-0 flex-col items-center gap-0.5 text-center">
        <H className={immagine ? "text-balance break-words text-[14px] font-black leading-tight tracking-[0.02em] text-white sm:text-[15px]" : "sr-only"}>{titolo}</H>
        {sotto && <p className="line-clamp-2 text-[9.5px] font-bold uppercase leading-tight tracking-[0.16em] text-white/45">{sotto}</p>}
      </div>
      {slug && apri && <MonitorAnteprima slug={slug} href={apri.href} esterno={apri.esterno} titolo={titolo} colore={colore} />}
      <div className="mt-auto flex flex-col gap-1.5" data-testid="pulsanti-card">
        {apri && (
          <Destinazione
            href={apri.href}
            esterno={apri.esterno}
            label={`Apri Channel · ${titolo}`}
            className={`${pulsante} w-full text-black hover:brightness-110`}
            style={{ background: colore }}
            testid="apri-channel"
          >
            APRI CHANNEL {apri.esterno ? <ExternalLink className="h-3 w-3" aria-hidden /> : null}
          </Destinazione>
        )}
        {(scheda || sito) && (
          <div className={`grid gap-1.5 ${scheda && sito ? "grid-cols-2" : "grid-cols-1"}`}>
            {scheda && (
              <Destinazione
                href={scheda}
                label={`Apri scheda · ${titolo}`}
                className={`${pulsante} border bg-black hover:bg-white/10`}
                style={{ borderColor: colore, color: colore }}
                testid="apri-scheda"
              >
                APRI SCHEDA
              </Destinazione>
            )}
            {sito && (
              <Destinazione
                href={sito}
                esterno={/^https?:\/\//.test(sito)}
                label={`Apri il Sito · ${titolo}`}
                className={`${pulsante} border bg-black hover:bg-white/10`}
                style={{ borderColor: colore, color: colore }}
                testid="vai-al-sito"
              >
                APRI IL SITO <ExternalLink className="h-3 w-3" aria-hidden />
              </Destinazione>
            )}
          </div>
        )}
      </div>
    </article>
  );
}
