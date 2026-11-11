import type { ReactNode } from "react";
import { ExternalLink } from "lucide-react";
import { Link } from "wouter";
import { LogoBox } from "./logo-box";
import { InAllestimento } from "./in-allestimento";
import type { FormatoLogo } from "../../api/data/formati-logo";
import { FasciaAppartenenza } from "./anteprima-pulsante";
import { testoAppartenenza, type Appartenenza } from "../lib/appartenenza";

/* ────────────────────────────────────────────────────────────────────────────
   CONTENT CARD — la card unica del sito. Specifica 17/09/2026, punti 5, 7 e 9:

     «Componenti globali unici. È vietato creare card diverse manualmente per
      singole pagine.»
     «UN CONTENUTO, UN RECORD, UN LOGO ORIGINALE, PIÙ ADATTAMENTI AUTOMATICI.»

   Una sola implementazione: il marchio passa dal LogoBox globale (intero,
   centrato, area di rispetto del 10%, variante scaricata alla misura giusta),
   il titolo è sempre il nome per esteso, e dove non c'è contenuto reale compare
   il blocco IN ALLESTIMENTO con il testo fisso — mai un riquadro vuoto e mai un
   pulsante che non porta in nessun posto.

   Le pagine NON ridisegnano la card: scelgono un preset (CompanyCard, TeamCard,
   EntitaCard) oppure passano i campi a ContentCard. Correggendo questo file
   cambiano tutte le pagine nello stesso momento.

   ELENCO DEI COMPONENTI GLOBALI UNICI — dove sta l'unica implementazione di
   ciascun blocco. Se serve una variante, si aggiunge un PRESET qui dentro: non si
   riscrive il blocco dentro una pagina.

     · card di un contenuto        → ContentCard, questo file
       (CompanyCard, TeamCard, EntitaCard sono preset; LinkTile in tiles.tsx è un
        adattatore che tiene in piedi la firma usata dalle pagine già scritte)
     · card di un prodotto        → ProductCard, components/tiles.tsx — stessa
       LogoBox, campi in più che una card generica non ha (prezzo, rate, acquisto)
     · riquadro di un marchio     → LogoBox, components/logo-box.tsx
     · riquadro/tessera quadrata  → RiquadroLogo e TesseraLogo, components/tessera-logo.tsx
     · monitor e video (MediaMonitor) → MonitorCard e MonitorVideo, components/monitor.tsx
     · barra dei canali (ChannelBar)  → BarraZapping, components/zapping.tsx
     · spazio pubblicitario (AdBanner) → SpazioPubblicitario e StrisciaCampagna,
       components/spazio-pubblicitario.tsx
     · testata e piede del sito (SiteFooter) → Layout, components/layout.tsx
     · stato senza contenuto      → InAllestimento, components/in-allestimento.tsx
   ──────────────────────────────────────────────────────────────────────────── */

export type AzioneCard = {
  etichetta: string;
  /** Pagina interna (`/…`) o indirizzo esterno (`https://…`). */
  url: string | null | undefined;
  /** In evidenza: pulsante pieno. Gli altri restano contornati. */
  principale?: boolean;
};

export type ContentCardProps = {
  /** Nome per esteso: è anche il ripiego quando il logo manca. */
  nome: string;
  /** Logo ORIGINALE del record master. `null` → nome per esteso, nessun segnaposto. */
  logo?: string | null;
  /** Riga sopra il titolo: codice, categoria, ruolo. */
  etichetta?: string | null;
  /** Riga sotto il titolo. */
  sottotitolo?: string | null;
  /** Descrizione pubblicata. */
  testo?: string | null;
  /** Precisazione in fondo (es. perché un dato manca). */
  nota?: string | null;
  /** Pagina interna della scheda specifica. */
  pagina?: string | null;
  /**
   * REGOLA GLOBALE «ANTEPRIMA → PULSANTE → SCHEDA» (02/10/2026): il solo logo è
   * allestimento, NON un pulsante. Con `pagina` + `appartenenza` il riquadro diventa
   * l'anteprima-pulsante: logo (o `anteprima` già pronta) + fascia di appartenenza
   * reale, tutta cliccabile verso la scheda. Senza appartenenza il logo resta fermo
   * e alla scheda si arriva dal pulsante «Apri la scheda».
   */
  appartenenza?: Appartenenza | null;
  /** Grafica ufficiale «logo + appartenenza» già pronta (es. R.F.A. + TBH). */
  anteprima?: string | null;
  /** Sito ufficiale verificato. */
  sito?: string | null;
  /** Altri pulsanti (social, canali, listini). */
  azioni?: AzioneCard[];
  /** Formato del logo fra quelli dichiarati in api/data/formati-logo.ts. */
  formato?: FormatoLogo;
  /** Altezza del riquadro logo imposta dalla griglia (classi Tailwind). */
  altezzaLogo?: string;
  /** Pagina del pannello dove si carica il contenuto mancante (solo admin). */
  pannello?: string | null;
  /** true quando chi guarda è riconosciuto come amministratore. */
  admin?: boolean;
  /** Contenuto aggiuntivo (prezzo, monitor, dati) in fondo alla card. */
  children?: ReactNode;
  className?: string;
};

function esterno(url: string) {
  return /^(https?:)?\/\//i.test(url) || /^(mailto:|tel:)/i.test(url);
}

function Pulsante({ a }: { a: AzioneCard }) {
  const url = (a.url ?? "").trim();
  if (!url) return null;
  const classe = a.principale
    ? "rounded-full px-4 py-2 text-sm font-bold uppercase tracking-wide text-black bg-[var(--tbh-neon)]"
    : "rounded-full border border-[var(--tbh-line)] px-4 py-2 text-sm font-semibold inline-flex items-center gap-2 hover:border-[var(--tbh-neon)]";

  if (esterno(url)) {
    return (
      <a href={url} target="_blank" rel="noreferrer" className={classe}>
        {a.etichetta} <ExternalLink size={14} />
      </a>
    );
  }
  return (
    <Link href={url} className={classe}>
      {a.etichetta}
    </Link>
  );
}

export function ContentCard({
  nome,
  logo,
  etichetta,
  sottotitolo,
  testo,
  nota,
  pagina,
  appartenenza,
  anteprima,
  sito,
  azioni,
  formato = "hero",
  altezzaLogo = "h-40 md:h-48",
  pannello,
  admin = false,
  children,
  className = "",
}: ContentCardProps) {
  const titolo = nome.trim() || "Touch Business Holding";

  const pulsanti: AzioneCard[] = [
    ...(pagina ? [{ etichetta: "Apri la scheda", url: pagina, principale: true }] : []),
    ...(sito ? [{ etichetta: "Sito ufficiale", url: sito }] : []),
    ...(azioni ?? []).filter((a) => (a.url ?? "").trim()),
  ];

  /* Niente logo, niente testo, niente link: la card non finge un contenuto.
     Resta il nome per esteso e il blocco IN ALLESTIMENTO col testo fisso. */
  const vuota = !logo && !testo && pulsanti.length === 0;

  const pulsanteVisivo = Boolean(pagina && appartenenza);

  const riquadroLogo = (
    <LogoBox
      nome={titolo}
      logo={logo ?? null}
      formato={formato}
      altezzaClasse={altezzaLogo}
      fondo="chiaro"
      url={sito ?? null}
      dentroLink={pulsanteVisivo}
      className={pulsanteVisivo ? "rounded-b-none" : ""}
    />
  );

  return (
    <article className={`tbh-card overflow-hidden p-4 flex flex-col ${className}`}>
      {pagina && appartenenza ? (
        <Link
          href={pagina}
          data-anteprima-pulsante
          aria-label={`${titolo} — ${testoAppartenenza(appartenenza).sigla}: apri la scheda`}
          className="group block overflow-hidden rounded-2xl ring-1 ring-[var(--tbh-line)] transition hover:ring-2 hover:ring-[var(--tbh-neon)] hover:shadow-[0_0_32px_rgba(215,255,0,0.18)]"
        >
          {anteprima ? (
            /* Contenitore flex ad altezza fissa + immagine max-h/max-w: la grafica (anche verticale,
               come le colonne «logo + PARTE DEL GRUPPO») entra intera, senza tagli né deformazioni. */
            <div className={`${altezzaLogo} w-full flex items-center justify-center overflow-hidden bg-black`}>
              <img
                src={anteprima}
                alt={`${titolo} — ${testoAppartenenza(appartenenza).sigla}`}
                loading="lazy"
                className="max-h-full max-w-full object-contain transition duration-300 group-hover:scale-[1.03]"
              />
            </div>
          ) : (
            riquadroLogo
          )}
          <FasciaAppartenenza a={appartenenza} />
        </Link>
      ) : (
        riquadroLogo
      )}

      <div className="p-2 pt-5 flex flex-col gap-2 grow">
        {etichetta ? (
          <span className="text-[11px] tracking-[0.18em] text-[var(--tbh-gold)] uppercase">
            {etichetta}
          </span>
        ) : null}

        {pagina ? (
          <Link href={pagina} className="tbh-display tbh-h3 leading-tight hover:text-[var(--tbh-neon)]">
            {titolo}
          </Link>
        ) : (
          <h3 className="tbh-display tbh-h3 leading-tight">{titolo}</h3>
        )}

        {sottotitolo ? (
          <p className="text-xs tracking-wide text-[var(--tbh-gold)] uppercase">{sottotitolo}</p>
        ) : null}

        {testo ? <p className="text-sm text-[var(--tbh-muted)] grow">{testo}</p> : null}

        {children}

        {vuota ? (
          <div className="mt-2">
            <InAllestimento cosa={`Scheda ${titolo}`} admin={admin} pannello={pannello} />
          </div>
        ) : pulsanti.length > 0 ? (
          <div className="flex flex-wrap gap-2 pt-2">
            {pulsanti.map((a, i) => (
              <Pulsante key={`${a.etichetta}-${i}`} a={a} />
            ))}
          </div>
        ) : null}

        {nota ? <p className="text-xs text-[var(--tbh-muted)] pt-1">{nota}</p> : null}
      </div>
    </article>
  );
}

/* ── Preset: stessa card, campi già al posto giusto ───────────────────────── */

/** Società o attività del gruppo: codice e settore sopra, P.IVA come nota. */
export function CompanyCard(p: {
  nome: string;
  logo?: string | null;
  codice?: string | null;
  settore?: string | null;
  piva?: string | null;
  sito?: string | null;
  pagina?: string | null;
  testo?: string | null;
  admin?: boolean;
  appartenenza?: Appartenenza | null;
  anteprima?: string | null;
}) {
  const etichetta = [p.codice, p.settore].filter(Boolean).join(" · ") || null;
  return (
    <ContentCard
      nome={p.nome}
      logo={p.logo ?? null}
      etichetta={etichetta}
      testo={p.testo ?? null}
      nota={p.piva ? `P.IVA ${p.piva}` : null}
      pagina={p.pagina ?? null}
      appartenenza={p.appartenenza ?? null}
      anteprima={p.anteprima ?? null}
      sito={p.sito ?? null}
      admin={p.admin}
      pannello="/allestimento"
    />
  );
}

/** Società sportiva seguita: stemma, ruolo del gruppo, pagina squadra. */
export function TeamCard(p: {
  nome: string;
  logo?: string | null;
  ruolo?: string | null;
  categoria?: string | null;
  nota?: string | null;
  sito?: string | null;
  pagina?: string | null;
  admin?: boolean;
}) {
  return (
    <ContentCard
      nome={p.nome}
      logo={p.logo ?? null}
      etichetta={p.ruolo ?? null}
      sottotitolo={p.categoria ?? null}
      testo={p.nota ?? null}
      nota={
        p.logo
          ? null
          : "Stemma ufficiale non ancora ricevuto: nessuna ricostruzione grafica."
      }
      pagina={p.pagina ?? null}
      sito={p.sito ?? null}
      formato="scheda-squadra"
      altezzaLogo="h-36 md:h-44"
      admin={p.admin}
      pannello="/allestimento"
    />
  );
}

/** Voce del registro unico: qualifica sopra, scheda interna /e/:slug. */
export function EntitaCard(p: {
  nome: string;
  logo?: string | null;
  qualifica?: string | null;
  testo?: string | null;
  slug?: string | null;
  sito?: string | null;
  admin?: boolean;
}) {
  return (
    <ContentCard
      nome={p.nome}
      logo={p.logo ?? null}
      etichetta={p.qualifica ?? null}
      testo={p.testo ?? null}
      pagina={p.slug ? `/e/${p.slug}` : null}
      sito={p.sito ?? null}
      formato="scheda-attivita"
      altezzaLogo="h-28 md:h-32"
      admin={p.admin}
      pannello="/allestimento"
    />
  );
}
