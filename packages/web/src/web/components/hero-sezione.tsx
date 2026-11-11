import { Link } from "wouter";
import { ArrowRight, ExternalLink, ImageOff } from "lucide-react";
import { SfondoSkyline } from "./skyline";
import { useMediaSlot } from "../queries/media";
import { LOGO_TBH_ICONA } from "../lib/loghi-tbh";

/**
 * IMPIANTO VISIVO DEL RESTYLING — ordine di Claudio del 05/09/2026.
 * «Ogni pagina deve essere la homepage di se stessa»: qui stanno i due mattoni
 * riusabili con cui si veste ogni sezione, senza toccarne i contenuti già pubblicati.
 *
 * 1. <HeroSezione> — occhiello, titolone, sottotitolo e pulsanti sempre attivi.
 * 2. <BloccoSchede> — schede grandi al posto dei muri di testo, che scorrono col dito.
 *
 * FOTO REALI: Claudio ha chiesto di partire con i loghi e i materiali già in archivio.
 * Perciò ogni hero legge da sola lo spazio di allestimento `hero:<slot>`: appena lui
 * carica l'immagine vera dal pannello /allestimento, compare qui senza toccare il codice.
 * Finché non c'è, si vede lo skyline TBH disegnato in codice con il logo ufficiale:
 * nessuna foto finta, nessuna immagine di repertorio.
 */

export type AzioneHero = {
  label: string;
  /** Destinazione interna al portale. */
  to?: string;
  /** Destinazione esterna (link ufficiale). */
  href?: string;
  primaria?: boolean;
};

function Azione({ a, colore }: { a: AzioneHero; colore: string }) {
  const testo = (
    <>
      {a.label} {a.href ? <ExternalLink size={16} /> : <ArrowRight size={16} />}
    </>
  );
  const classi = a.primaria
    ? "tbh-neon-btn px-6 py-3 inline-flex items-center gap-2 text-sm md:text-base"
    : "px-6 py-3 rounded-full border font-semibold inline-flex items-center gap-2 text-sm md:text-base hover:border-[var(--tbh-neon)]";
  const stile = a.primaria
    ? { background: colore, borderColor: colore }
    : { borderColor: "var(--tbh-line)" };

  if (a.href) {
    return (
      <a href={a.href} target="_blank" rel="noreferrer" className={classi} style={stile}>
        {testo}
      </a>
    );
  }
  // Nessun bottone morto: senza destinazione si atterra su «Stiamo lavorando per voi».
  return (
    <Link to={a.to ?? "/in-allestimento"} className={classi} style={stile}>
      {testo}
    </Link>
  );
}

/** Sfondo della hero: immagine vera se caricata, altrimenti skyline TBH + logo. */
function SfondoHero({ slot, colore, logo }: { slot?: string; colore: string; logo?: string }) {
  const q = useMediaSlot(slot ?? "");
  const immagine = slot
    ? (q.data?.items ?? []).find(
        (i) => i.tipo !== "documento" && !/\.pdf($|\?)/i.test(i.url),
      )
    : undefined;

  if (immagine) {
    return (
      <>
        <img
          src={immagine.url}
          alt={immagine.titolo ?? ""}
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/85 to-black/35" />
      </>
    );
  }

  return (
    <>
      <SfondoSkyline colore={colore} altezza={420} />
      <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-black/40" />
      <img
        src={logo ?? LOGO_TBH_ICONA}
        alt=""
        aria-hidden="true"
        className="hidden md:block absolute right-8 top-1/2 -translate-y-1/2 w-40 lg:w-56 opacity-25 object-contain"
      />
    </>
  );
}

type HeroProps = {
  /** Occhiello sopra il titolo, es. «TBH / SPORT & MEDIA». */
  occhiello: string;
  titolo: string;
  /** Seconda riga del titolo, stampata nel colore dell'area. */
  evidenza?: string;
  sottotitolo?: string;
  testo?: string;
  azioni?: AzioneHero[];
  colore?: string;
  /** Logo ufficiale dell'area, dall'archivio. */
  logo?: string;
  /**
   * Spazio di allestimento da cui prendere l'immagine vera, es. «hero:sport».
   * Quando Claudio la carica dal pannello, sostituisce da sola lo sfondo disegnato.
   */
  slotImmagine?: string;
};

export function HeroSezione({
  occhiello,
  titolo,
  evidenza,
  sottotitolo,
  testo,
  azioni = [],
  colore = "var(--tbh-neon)",
  logo,
  slotImmagine,
}: HeroProps) {
  return (
    <section className="relative overflow-hidden border-b border-[var(--tbh-line)]">
      <SfondoHero slot={slotImmagine} colore={colore} logo={logo} />
      <div className="relative z-10 mx-auto max-w-[1500px] px-4 md:px-8 py-12 md:py-20">
        <div className="flex items-center gap-3 mb-4">
          {logo && (
            <img
              src={logo}
              alt=""
              aria-hidden="true"
              className="w-10 h-10 md:w-12 md:h-12 object-contain shrink-0"
            />
          )}
          <p
            className="text-[11px] md:text-xs tracking-[0.3em] uppercase font-semibold"
            style={{ color: colore }}
          >
            {occhiello}
          </p>
        </div>

        <h1 className="tbh-display tbh-h1 leading-[0.95]">
          {titolo}
          {evidenza && (
            <>
              <br />
              <span style={{ color: colore }}>{evidenza}</span>
            </>
          )}
        </h1>

        {sottotitolo && (
          <p className="tbh-display text-base md:text-xl tracking-wide text-[var(--tbh-platinum)] mt-4 max-w-3xl uppercase">
            {sottotitolo}
          </p>
        )}
        {testo && (
          <p className="tbh-body text-[var(--tbh-muted)] mt-4 max-w-2xl">{testo}</p>
        )}

        {azioni.length > 0 && (
          <div className="flex flex-wrap gap-3 mt-8">
            {azioni.map((a) => (
              <Azione key={a.label} a={a} colore={colore} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export type SchedaBlocco = {
  /** Chiave stabile. */
  id: string;
  /** Etichetta in alto, es. «SPOTLIGHT». */
  etichetta?: string;
  titolo: string;
  testo?: string;
  /** Logo o immagine reale dall'archivio. Se manca, si vede il riquadro onesto. */
  immagine?: string | null;
  /** L'immagine è un logo: va contenuta, non ritagliata. */
  logo?: boolean;
  colore?: string;
  cta?: string;
  to?: string;
  href?: string;
  /** Riga sotto il pulsante, es. l'indirizzo del sito. */
  nota?: string;
};

function Scheda({ s, compatto }: { s: SchedaBlocco; compatto?: boolean }) {
  const colore = s.colore ?? "var(--tbh-neon)";
  const dentro = (
    <>
      {/* Modo compatto: nessun riquadro immagine. Serve dove l'immagine ufficiale non
          esiste ancora e ripetere l'avviso 16 volte sarebbe solo rumore. */}
      {compatto ? (
        s.etichetta && (
          <span
            className="self-start text-[10px] font-bold uppercase tracking-wider text-black px-2.5 py-1 rounded-full"
            style={{ background: colore }}
          >
            {s.etichetta}
          </span>
        )
      ) : (
      <div className="relative aspect-[16/10] overflow-hidden rounded-2xl bg-black/60 border border-[var(--tbh-line)]">
        {s.immagine ? (
          <img
            src={s.immagine}
            alt={s.titolo}
            loading="lazy"
            className={`w-full h-full ${s.logo ? "object-contain p-6" : "object-cover"}`}
          />
        ) : (
          <div className="w-full h-full grid place-items-center text-center px-4">
            <span className="text-[var(--tbh-muted)] text-xs flex flex-col items-center gap-2">
              <ImageOff size={20} />
              Immagine ufficiale non ancora caricata
            </span>
          </div>
        )}
        {s.etichetta && (
          <span
            className="absolute top-3 left-3 text-[10px] font-bold uppercase tracking-wider text-black px-2.5 py-1 rounded-full"
            style={{ background: colore }}
          >
            {s.etichetta}
          </span>
        )}
      </div>
      )}
      <h3 className="tbh-display text-xl md:text-2xl mt-4 leading-tight">{s.titolo}</h3>
      {s.testo && <p className="tbh-body text-sm text-[var(--tbh-muted)] mt-2">{s.testo}</p>}
      {s.nota && (
        <p className="text-[11px] text-[var(--tbh-muted)] mt-2 break-all">{s.nota}</p>
      )}
      <span
        className="mt-4 inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wide"
        style={{ color: colore }}
      >
        {s.cta ?? "Scopri"} {s.href ? <ExternalLink size={15} /> : <ArrowRight size={15} />}
      </span>
    </>
  );

  const classi =
    "tbh-card p-4 md:p-5 flex flex-col min-w-[78vw] sm:min-w-0 snap-start transition duration-200 hover:-translate-y-1";

  if (s.href) {
    return (
      <a href={s.href} target="_blank" rel="noreferrer" className={classi}>
        {dentro}
      </a>
    );
  }
  return (
    <Link to={s.to ?? "/in-allestimento"} className={classi}>
      {dentro}
    </Link>
  );
}

type BloccoProps = {
  titolo: string;
  /** Riga a destra del titolo, come nei mockup («STORIE, NEWS E TERRITORIO»). */
  occhiello?: string;
  testo?: string;
  schede: SchedaBlocco[];
  /** Colonne su desktop. Su smartphone scorrono sempre in orizzontale. */
  colonne?: 2 | 3 | 4;
  /** Pulsante che apre l'elenco completo. */
  azione?: AzioneHero;
  /** Schede senza riquadro immagine: per le aree che non hanno ancora una foto vera. */
  compatto?: boolean;
};

const GRIGLIE: Record<number, string> = {
  2: "sm:grid-cols-2",
  3: "sm:grid-cols-2 lg:grid-cols-3",
  4: "sm:grid-cols-2 lg:grid-cols-4",
};

export function BloccoSchede({
  titolo,
  occhiello,
  testo,
  schede,
  colonne = 3,
  azione,
  compatto,
}: BloccoProps) {
  if (schede.length === 0) return null;
  return (
    <section className="mx-auto max-w-[1500px] px-4 md:px-8 py-8 md:py-10">
      <div className="flex flex-wrap items-end justify-between gap-3 mb-5">
        <div>
          <h2 className="tbh-display tbh-h2 leading-tight">{titolo}</h2>
          {testo && <p className="tbh-body text-[var(--tbh-muted)] mt-1 max-w-3xl">{testo}</p>}
        </div>
        {occhiello && (
          <p className="text-[10px] md:text-[11px] uppercase tracking-[0.25em] text-[var(--tbh-gold)]">
            {occhiello}
          </p>
        )}
      </div>

      {/* Smartphone: schede grandi che scorrono col dito. Desktop: griglia. */}
      <div className={`flex gap-4 tbh-scroll-x pb-2 sm:grid sm:gap-5 ${GRIGLIE[colonne]}`}>
        {schede.map((s) => (
          <Scheda key={s.id} s={s} compatto={compatto} />
        ))}
      </div>

      {azione && (
        <div className="mt-6">
          <Azione a={azione} colore="var(--tbh-neon)" />
        </div>
      )}
    </section>
  );
}
