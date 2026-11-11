import { Link } from "wouter";
import { ImmagineMarchio, urlOriginale, urlVariante } from "./logo-box";
import type { FormatoLogo } from "../../api/data/formati-logo";

/* ────────────────────────────────────────────────────────────────────────────
   MISURA STANDARD DEI LOGHI E DEGLI STEMMI — 06/09/2026.

   Nasce da un difetto misurato, non da un gusto grafico. Ordine di Claudio:
     «possibilmente proporzionate al pulsante o viceversa creare misure standard
      e soprattutto nella stessa linea, vedo il Verucchio nascosto, altri ben in
      vista, queste cose non te le dovrei dire io sono automatiche».

   COSA SUCCEDEVA (misurato a video sulla home, 1440 px):
     · victoria-1968.png  nativo  151x165   → renderizzato 151x165  dentro un box da 192 px
     · verucchio-1957.png nativo 1024x1536  → renderizzato 260x390  dentro un box da 192 px
     · rimini.png                           → renderizzato     0x0  (file non ancora caricato)
   Il contenitore era `h-48 … overflow-hidden` con l'immagine `max-h-full max-w-full`:
   con quel `max-*` l'immagine non riceve un box proprio, quindi
     a) se il file è enorme sfonda il contenitore e `overflow-hidden` ne RITAGLIA la fascia
        centrale — ed è questo il «Verucchio nascosto»: tagliato, non piccolo;
     b) finché il file non è caricato l'immagine misura 0x0 e la pagina balla.
   Sulla home si contavano 17 altezze renderizzate diverse.

   LA REGOLA, UNA SOLA PER TUTTI:
     · il RIQUADRO decide la misura, mai l'immagine;
     · riquadro a proporzione fissa (quadrato), stessa altezza e stesso padding per tutti;
     · immagine `h-full w-full object-contain`: entra sempre intera, non si taglia mai
       e occupa il suo box anche prima di essere caricata (nessun salto di layout);
     · mai `object-cover` su un logo o uno stemma: taglierebbe lo stemma;
     · piastra chiara sotto il logo, così i marchi scuri e quelli chiari si leggono uguale;
     · testo su righe troncate ad altezza fissa, così le tessere restano TUTTE SULLA STESSA LINEA
       anche quando i nomi hanno lunghezze diverse.

   `data-tessera` e `data-tessera-img` servono a scripts/verifica-anteprime.py per
   misurare che la regola sia rispettata davvero, su tutte le larghezze.
   ──────────────────────────────────────────────────────────────────────────── */

/** Le tre misure ammesse del riquadro. Non se ne inventano altre nelle pagine. */
export type MisuraTessera = "sm" | "md" | "lg";

const RIQUADRO: Record<MisuraTessera, string> = {
  sm: "h-16 w-16 rounded-xl",
  md: "h-24 w-24 rounded-2xl",
  lg: "h-32 w-32 md:h-36 md:w-36 rounded-2xl",
};

/* Il margine interno sta SULL'IMMAGINE, non sul riquadro: l'immagine e' in
   `position:absolute inset-0` e con `box-sizing:border-box` il suo padding
   diventa l'aria attorno al marchio, mantenendo il riquadro della misura esatta. */
const ARIA: Record<MisuraTessera, string> = {
  sm: "p-1.5",
  md: "p-2.5",
  lg: "p-3",
};

/* UN LOGO ORIGINALE, PIÙ ADATTAMENTI AUTOMATICI (17/09/2026, punto 3).
   Il riquadro non scarica più il file originale così com'è: chiede al motore delle
   varianti il formato QUADRATO dichiarato in api/data/formati-logo.ts più vicino al
   riquadro, al doppio della misura a video per gli schermi a densità alta. Gli stemmi
   piccoli (san-marino-calcio.png è 136×186) arrivavano sgranati o minuscoli; ora
   arrivano centrati e della stessa misura per tutti, senza toccare il master. */
const FORMATO_DEL_RIQUADRO: Record<MisuraTessera, FormatoLogo> = {
  sm: "icona-standard",
  md: "scheda-squadra",
  lg: "scheda-squadra",
};

/**
 * RIQUADRO STANDARD — il mattone di base. Quadrato, misura fissa, padding uniforme.
 * Va usato ogni volta che si mostra un logo o uno stemma: è quello che tiene tutto
 * sulla stessa linea. Se il logo manca NON si inventa nulla: compare la sigla del
 * nome sulla piastra, che tiene lo spazio esatto senza fingere un marchio.
 */
export function RiquadroLogo({
  src,
  alt,
  misura = "md",
  colore,
  className = "",
}: {
  src: string | null | undefined;
  alt: string;
  misura?: MisuraTessera;
  /** Colore del canale/area: solo alone e bordo, mai sfondo pieno. */
  colore?: string | null;
  className?: string;
}) {
  const sigla = alt
    .replace(/[^\p{L}\p{N} ]/gu, " ")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");

  return (
    <div
      data-tessera-riquadro
      className={`${RIQUADRO[misura]} relative shrink-0 grid place-items-center overflow-hidden bg-white border ${className}`}
      style={{
        borderColor: colore ? `${colore}55` : "var(--tbh-line)",
        boxShadow: colore ? `0 0 24px -14px ${colore}` : undefined,
      }}
    >
      {src ? (
        <ImmagineMarchio
          data-tessera-img
          src={
            src.startsWith("/api/logo/") || /^(https?:)?\/\//.test(src)
              ? src
              : urlVariante(src, FORMATO_DEL_RIQUADRO[misura])
          }
          riserva={urlOriginale(src)}
          alt={alt}
          /* Loghi e stemmi sono file piccoli: si caricano subito, cosi' non capita
             piu' di misurarne uno a 0x0 (era il caso di rimini.png) ne' di vedere
             la pagina ballare mentre arrivano. */
          loading="eager"
          decoding="async"
          /* MISURATO A VIDEO: dentro un contenitore `grid place-items-center` le
             percentuali di altezza dell'immagine NON si risolvono — ne' `max-h-full`,
             ne' `h-full`, ne' `self-stretch`, e nemmeno forzando `height:100%` inline:
             l'altezza torna a quella naturale (1024x1536 del Verucchio diventava
             50x75 in un box da 52 px) e `overflow-hidden` la tagliava.
             L'unica ricetta che tiene: riquadro `relative` + immagine `absolute
             inset-0 h-full w-full object-contain`, con l'aria data dal padding
             dell'immagine stessa. Cosi' il box e' esattamente quello del riquadro
             e il marchio entra intero, mai tagliato. */
          className={`absolute inset-0 h-full w-full object-contain ${ARIA[misura]}`}
        />
      ) : (
        <span
          data-tessera-sigla
          className="tbh-display text-black/70 text-base md:text-lg leading-none"
          title={alt}
        >
          {sigla || "TBH"}
        </span>
      )}
    </div>
  );
}

/**
 * TESSERA COMPLETA — riquadro standard + titolo per esteso + sottotitolo, ad altezza
 * fissa. È l'anteprima da usare dove c'è un link: si vede subito COSA si apre.
 * Con `to` apre una pagina interna, con `href` un indirizzo esterno; senza nessuno dei
 * due resta una tessera non cliccabile (regola: nessun bottone morto).
 */
export function TesseraLogo({
  src,
  titolo,
  sottotitolo,
  misura = "md",
  colore,
  to,
  href,
}: {
  src: string | null | undefined;
  titolo: string;
  sottotitolo?: string | null;
  misura?: MisuraTessera;
  colore?: string | null;
  to?: string | null;
  href?: string | null;
}) {
  const dentro = (
    <>
      <RiquadroLogo src={src} alt={titolo} misura={misura} colore={colore} />
      <div className="mt-2 w-full min-w-0 text-center">
        {/* Due righe fisse: le tessere restano allineate anche con nomi lunghi. */}
        <p className="text-[11px] md:text-xs font-bold leading-tight line-clamp-2 min-h-[2.2em]">
          {titolo}
        </p>
        <p className="text-[10px] uppercase tracking-[0.16em] text-[var(--tbh-muted)] truncate">
          {sottotitolo ?? ""}
        </p>
      </div>
    </>
  );

  const base =
    "tbh-card p-3 flex flex-col items-center justify-start transition hover:-translate-y-0.5";

  if (to) {
    return (
      <Link data-tessera to={to} className={`${base} hover:border-[var(--tbh-neon)]`}>
        {dentro}
      </Link>
    );
  }
  if (href) {
    return (
      <a
        data-tessera
        href={href}
        target="_blank"
        rel="noreferrer"
        className={`${base} hover:border-[var(--tbh-neon)]`}
      >
        {dentro}
      </a>
    );
  }
  return (
    <div data-tessera className={base}>
      {dentro}
    </div>
  );
}

/**
 * FILA DI TESSERE — griglia con colonne fisse e passo uguale, così i riquadri
 * cadono tutti sulla stessa linea. Da usare al posto delle griglie improvvisate.
 */
export function FilaTessere({ children }: { children: React.ReactNode }) {
  return (
    <div
      data-fila-tessere
      className="grid gap-3 grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 items-start"
    >
      {children}
    </div>
  );
}
