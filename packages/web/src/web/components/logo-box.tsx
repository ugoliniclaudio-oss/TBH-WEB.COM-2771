/* ────────────────────────────────────────────────────────────────────────────
   LOGOBOX — il contenitore unico dei marchi di tutta la piattaforma.
   Aggiornamento globale del 17/09/2026, punti 3 e 5.

   REGOLA: «UN CONTENUTO, UN RECORD, UN LOGO ORIGINALE, PIÙ ADATTAMENTI AUTOMATICI».

   Qui dentro sta l'unico posto in cui si decide come si vede un marchio:
     · il RIQUADRO decide la misura, mai l'immagine;
     · `object-contain` sempre: il marchio entra intero, non si taglia e non si stira;
     · centratura nei due assi, fondo trasparente sotto l'immagine;
     · area di rispetto del 10% del lato minore (padding calcolato, non a occhio);
     · un logo verticale resta verticale, un quadrato quadrato, un orizzontale
       orizzontale: cambia il contenitore, non il marchio;
     · `width`/`height` sempre dichiarati: l'immagine occupa il suo spazio anche
       prima di essere caricata, quindi la pagina non balla (nessun salto di layout).

   Se il logo ORIGINALE non c'è non si inventa nulla e non si usa un segnaposto:
   compare il NOME PER ESTESO leggibile, come deciso da Claudio.

   `data-logobox` e `data-logobox-img` servono agli script di verifica per misurare
   che la regola sia rispettata davvero, su tutte le larghezze.
   ──────────────────────────────────────────────────────────────────────────── */

import { useEffect, useState } from "react";
import { ExternalLink, MessageCircle } from "lucide-react";
import {
  AREA_DI_RISPETTO,
  formatoLogo,
  type FormatoLogo,
} from "../../api/data/formati-logo";
import { waInfo } from "../lib/whatsapp";

/* VERSIONE DEGLI INDIRIZZI DELLE VARIANTI — 17/10/2026.
   Sul sito pubblico Cloudflare aveva memorizzato per 4 ore le risposte 404 dei loghi.
   Cambiando la versione cambia l'indirizzo, quindi nessuno riceve più la risposta
   rotta rimasta in memoria. Da aumentare solo se cambia il modo di servire i loghi. */
const VERSIONE_VARIANTI = "2";

/** Indirizzo della variante automatica di un logo, generata dal master. */
export function urlVariante(sorgente: string, formato: FormatoLogo) {
  const pulita = sorgente.replace(/^\/+/, "");
  return `/api/logo/${formato}/${pulita.split("/").map(encodeURIComponent).join("/")}?v=${VERSIONE_VARIANTI}`;
}

/**
 * Indirizzo del file ORIGINALE da cui nasce una variante: è la riserva quando la
 * variante non arriva. File del sito → `/percorso`; file dell'archivio → `/api/media/…`.
 * Un indirizzo esterno o una variante già pronta non hanno riserva: `null`.
 */
export function urlOriginale(logo: string): string | null {
  if (/^(https?:)?\/\//i.test(logo) || logo.startsWith("/api/logo/")) return null;
  if (logo.startsWith("/api/media/")) return logo;
  const pulita = logo.replace(/^\/+/, "");
  if (pulita.startsWith("allestimento/") || pulita.startsWith("candidature/")) {
    return `/api/media/${pulita}`;
  }
  return `/${pulita}`;
}

/**
 * Immagine di un marchio con RISERVA: se la variante non si carica, una sola volta
 * si passa all'originale. Mai un riquadro vuoto quando il marchio vero esiste.
 */
export function ImmagineMarchio({
  src,
  riserva,
  ...resto
}: React.ImgHTMLAttributes<HTMLImageElement> & { src: string; riserva: string | null }) {
  const [usaRiserva, setUsaRiserva] = useState(false);
  useEffect(() => setUsaRiserva(false), [src]);
  return (
    <img
      {...resto}
      src={usaRiserva && riserva ? riserva : src}
      onError={() => {
        if (riserva && !usaRiserva && riserva !== src) setUsaRiserva(true);
      }}
    />
  );
}

/**
 * Un logo si può passare in tre modi, tutti e tre reali:
 *   · percorso di un file del sito           → /brand/tbh-logo.png
 *   · chiave di un file caricato dal pannello → /api/media/allestimento/…
 *   · indirizzo esterno già pubblico          → https://…
 * In tutti i casi qui NON si modifica il file: si limita il contenitore.
 */
function sorgentePerVariante(logo: string): string | null {
  if (/^https?:\/\//i.test(logo)) return null; // esterno: si serve com'è
  if (logo.startsWith("/api/logo/")) return null; // già una variante
  if (logo.startsWith("/api/media/")) return logo.replace(/^\/api\/media\//, "");
  if (logo.startsWith("/")) return logo.slice(1);
  return logo;
}

export type LogoBoxProps = {
  /** Nome per esteso del marchio: obbligatorio, è il ripiego quando il logo manca. */
  nome: string;
  /** Percorso o indirizzo del logo ORIGINALE. `null` → nome per esteso. */
  logo?: string | null;
  /** Formato dichiarato in api/data/formati-logo.ts. */
  formato?: FormatoLogo;
  /** Piastra chiara sotto il marchio: i loghi scuri e quelli chiari si leggono uguale. */
  fondo?: "chiaro" | "scuro" | "trasparente";
  /** Sito ufficiale: usato solo dal ripiego, per non lasciare un pulsante morto. */
  url?: string | null;
  /** `true` quando il LogoBox è già dentro un link: niente link annidati. */
  dentroLink?: boolean;
  /** Etichetta del pulsante di ripiego. */
  etichettaCta?: string;
  /** Classi aggiuntive del contenitore. */
  className?: string;
  /**
   * Adatta la misura alla colonna invece di restare alla misura nominale del
   * formato. Il RAPPORTO del contenitore resta quello del formato: è la regola
   * «il riquadro decide», non un ritorno alle misure libere per pagina.
   */
  fluido?: boolean;
  /**
   * Altezza imposta dalla griglia della pagina (classi Tailwind, es. `h-28 md:h-32`).
   * Serve dove il riquadro deve allinearsi ad altre card: la misura del contenitore
   * cambia, il marchio NO — resta `object-contain`, intero, centrato, con la sua
   * area di rispetto. Il formato continua a decidere QUALE variante si scarica.
   */
  altezzaClasse?: string;
};

const FONDO: Record<NonNullable<LogoBoxProps["fondo"]>, string> = {
  chiaro: "bg-white",
  scuro: "bg-black border border-white/10",
  trasparente: "bg-transparent",
};

export function LogoBox({
  nome,
  logo,
  formato = "icona-standard",
  fondo = "chiaro",
  url: urlGrezzo,
  dentroLink = false,
  etichettaCta,
  className = "",
  fluido = true,
  altezzaClasse,
}: LogoBoxProps) {
  const f = formatoLogo(formato);
  /* Formato sconosciuto: si ripiega sulla misura standard invece di inventarne una. */
  const def = f ?? formatoLogo("icona-standard")!;
  const titolo = nome.trim() || "Touch Business Holding";
  /* Un indirizzo vuoto («») non è un indirizzo: senza questo controllo il
     pulsante «Apri il sito» usciva con href="" e non portava da nessuna parte.
     Si controlla anche che sia DAVVERO un testo: se una pagina passa per errore
     un elenco di indirizzi invece di uno solo, qui non si rompe nulla. */
  const url =
    typeof urlGrezzo === "string" && urlGrezzo.trim() ? urlGrezzo.trim() : null;

  /* L'area di rispetto è una percentuale del lato minore: calcolata, non a occhio. */
  const padding = `${(AREA_DI_RISPETTO * 100).toFixed(1)}%`;

  /* Tre modi di dare la misura al RIQUADRO (mai all'immagine):
     · altezzaClasse → l'altezza la decide la griglia della pagina;
     · fluido        → larghezza piena, rapporto del formato;
     · né l'uno né l'altro → misura nominale esatta del formato. */
  const stile: React.CSSProperties = altezzaClasse
    ? { width: "100%" }
    : fluido
      ? { aspectRatio: `${def.larghezza} / ${def.altezza}`, width: "100%" }
      : { width: def.larghezza, height: def.altezza };
  const misura = altezzaClasse ? `${altezzaClasse} w-full` : "";

  if (logo) {
    const sorgente = sorgentePerVariante(logo);
    /* Un file del sito o dell'archivio passa dal motore delle varianti: arriva già
       alla misura giusta, non un file da 3 MB rimpicciolito dal browser.
       Un indirizzo esterno si serve com'è: non è nostro, non si riscrive. */
    const src = sorgente ? urlVariante(sorgente, def.formato) : logo;
    return (
      <div
        className={`relative grid place-items-center overflow-hidden rounded-2xl ${misura} ${FONDO[fondo]} ${className}`}
        style={stile}
        data-logobox={def.formato}
        data-logobox-misura={`${def.larghezza}x${def.altezza}`}
      >
        <ImmagineMarchio
          src={src}
          riserva={sorgente ? urlOriginale(logo) : null}
          alt={titolo}
          width={def.larghezza}
          height={def.altezza}
          loading="lazy"
          decoding="async"
          /* contain + centratura: mai object-cover su un marchio, taglierebbe lo stemma. */
          className="absolute inset-0 h-full w-full object-contain object-center"
          style={{ padding }}
          data-logobox-img={def.formato}
        />
      </div>
    );
  }

  /* ── Ripiego: nessun segnaposto, il NOME PER ESTESO ───────────────────────── */
  const testo =
    titolo.length > 34
      ? "text-sm md:text-base"
      : titolo.length > 20
        ? "text-base md:text-xl"
        : "text-xl md:text-2xl";
  const scuro = fondo === "scuro";
  const etichetta = etichettaCta ?? (url ? "Apri il sito" : "Scrivici su WhatsApp");

  return (
    <div
      className={`relative flex flex-col items-center justify-center gap-2 overflow-hidden rounded-2xl p-3 text-center ${misura} ${FONDO[fondo]} ${className}`}
      style={stile}
      data-logobox={def.formato}
      data-logobox-senza-logo="1"
    >
      <span className={`tbh-display leading-tight ${scuro ? "text-white" : "text-black"} ${testo}`}>
        {titolo}
      </span>
      {dentroLink ? (
        <span
          className={`text-[11px] font-semibold uppercase tracking-wide ${scuro ? "text-white/55" : "text-black/55"}`}
        >
          {url ? "Sito ufficiale disponibile" : "Apri la scheda"}
        </span>
      ) : (
        <a
          href={url ?? waInfo(titolo)}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 rounded-full bg-black px-3 py-1.5 text-[11px] font-bold uppercase tracking-wide text-[var(--tbh-neon)] md:text-xs"
        >
          {etichetta} {url ? <ExternalLink size={13} /> : <MessageCircle size={13} />}
        </a>
      )}
      <span className={`text-[10px] ${scuro ? "text-white/40" : "text-black/40"}`}>
        Logo ufficiale da ricevere
      </span>
    </div>
  );
}

/**
 * Elenco dei collegamenti alle varianti di un logo: serve al pannello per far
 * scaricare a chi allestisce il file già alla misura giusta (favicon, OG, stampa).
 */
export function varianti(sorgente: string) {
  const s = sorgentePerVariante(sorgente);
  if (!s) return [];
  return (
    [
      "app-512",
      "app-192",
      "app-180",
      "app-32",
      "icona-standard",
      "orizzontale",
      "social-og",
      "banner-desktop",
    ] as FormatoLogo[]
  ).map((formato) => {
    const d = formatoLogo(formato)!;
    return { formato, misura: `${d.larghezza}×${d.altezza}`, uso: d.uso, url: urlVariante(s, formato) };
  });
}
