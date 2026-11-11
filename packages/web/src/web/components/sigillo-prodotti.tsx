/**
 * SIGILLO «PRODOTTI UFFICIALI TBH» — vetrofania digitale, 30/09/2026.
 *
 * Ordine di Claudio: «NUOVO SIGILLO VETROFANIA SOLO PER NEGOZIO ONLINE, NEGOZI
 * FISICI LEGATI AL GRUPPO, E TUTTI GLI ARTICOLI TBH, TUTTO IL RESTO CHE SARÀ
 * ESPOSTO SARÀ ORIGINALE».
 *
 * Quindi due sigilli diversi, che non si mescolano mai:
 *
 *   · questo (`SigilloProdottiUfficiali`) → shop online, negozi fisici del
 *     gruppo, articoli del catalogo TBH. Dice: «questo lo produciamo noi».
 *   · il sigillo rosso DM (`SigilloDm` in components/monitor.tsx) → resta a
 *     DM Comunicazioni, che è media partner e non società del gruppo.
 *   · tutto il resto del Circuito TBH resta com'è, senza sigillo prodotti: è
 *     esposizione di roba originale di altri, non merce nostra.
 *
 * L'immagine è il file ufficiale consegnato da Claudio, non una ricostruzione:
 *   /brand/tbh-sigillo-prodotti-ufficiali.png      (640×640, per la pagina)
 *   /brand/tbh-sigillo-prodotti-ufficiali-full.png (1254×1254, originale)
 */

import { Link } from "wouter";

const FILE_SIGILLO = "/brand/tbh-sigillo-prodotti-ufficiali.png";
const FILE_SIGILLO_ORIGINALE = "/brand/tbh-sigillo-prodotti-ufficiali-full.png";

const ALT =
  "Sigillo Prodotti Ufficiali del nostro marchio — Touch Plaza, il centro commerciale digitale TBH";

/**
 * Il sigillo grande, con la spiegazione accanto: va in testa allo shop e alla
 * scheda prodotto, dove serve dire perché quel bollo è lì.
 */
export function SigilloProdottiUfficiali({
  titolo = "PRODOTTI UFFICIALI TBH",
  testo = "Questo sigillo sta solo sul negozio online, sui negozi fisici del gruppo e sugli articoli del marchio TBH. Tutto il resto che vedi esposto nel Circuito è originale dei rispettivi titolari.",
  to = "/shop",
}: {
  titolo?: string;
  testo?: string;
  /** Pagina di destinazione del sigillo. `null` per un sigillo non cliccabile. */
  to?: string | null;
}) {
  const corpo = (
    <>
      <img
        src={FILE_SIGILLO}
        alt={ALT}
        width={128}
        height={128}
        loading="lazy"
        className="h-24 w-24 shrink-0 object-contain md:h-32 md:w-32"
      />
      <div className="min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-[var(--tbh-gold)]">
          Vetrofania digitale
        </p>
        <p className="tbh-display mt-1 text-lg leading-tight md:text-xl">{titolo}</p>
        <p className="tbh-body mt-1.5 max-w-[62ch] text-[12px] text-[var(--tbh-muted)]">{testo}</p>
      </div>
    </>
  );

  const stile =
    "flex items-center gap-4 rounded-3xl border border-[var(--tbh-gold)]/45 bg-black/45 px-4 py-4 md:px-5";

  if (!to) return <div className={stile}>{corpo}</div>;

  return (
    <Link
      href={to}
      className={`${stile} transition hover:border-[var(--tbh-gold)]`}
      aria-label={`${titolo} — apri il negozio ufficiale`}
    >
      {corpo}
    </Link>
  );
}

/**
 * Il bollo piccolo, da appoggiare su una card prodotto o sulla riga di un
 * negozio fisico del gruppo: stessa immagine, nessun testo lungo.
 */
export function BolloProdottoUfficiale({
  etichetta = "Prodotto ufficiale TBH",
  dimensione = 34,
}: {
  etichetta?: string;
  dimensione?: number;
}) {
  return (
    <span
      className="inline-flex items-center gap-2 rounded-full border border-[var(--tbh-gold)]/45 bg-black/60 pl-1 pr-2.5 py-1"
      title={etichetta}
    >
      <img
        src={FILE_SIGILLO}
        alt={ALT}
        width={dimensione}
        height={dimensione}
        loading="lazy"
        className="rounded-full object-contain"
        style={{ height: dimensione, width: dimensione }}
      />
      <span className="text-[9px] font-bold uppercase tracking-[0.14em] text-[var(--tbh-gold)]">
        {etichetta}
      </span>
    </span>
  );
}

/** Il file originale a piena risoluzione, per chi deve stamparlo davvero. */
export const SIGILLO_PRODOTTI_ORIGINALE = FILE_SIGILLO_ORIGINALE;
