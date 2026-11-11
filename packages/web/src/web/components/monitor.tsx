import { ExternalLink, MessageCircle, Play, Info } from "lucide-react";
import { Link } from "wouter";
import { LogoBox } from "./tiles";
import { waInfo } from "../lib/whatsapp";
import { FasciaAppartenenza } from "./anteprima-pulsante";
import { testoAppartenenza, type Appartenenza } from "../lib/appartenenza";

/**
 * PORTALE A MONITOR — blocco standard del brief:
 *
 *   IMMAGINE / LOGO
 *   [ APRI PAGINA ]                            ← 1 solo pulsante principale, INTERNO
 *   NOME ESTESO ATTIVITÀ / SOCIETÀ
 *   [SITO] [FACEBOOK] [INSTAGRAM] [ALTRA APP]  ← N pulsanti secondari, ESTERNI
 *   [ACQUISTA] | [PRENOTA] | [RICHIEDI INFORMAZIONI]  ← UNA sola CTA commerciale
 *
 * Regole: nessun logo inventato (senza file → nome per esteso), nessun social senza URL reale
 * (il pulsante non compare: niente bottoni morti), una sola CTA commerciale per blocco.
 */

export type LinkEsterno = { etichetta: string; url: string };

const RETE_LABEL: Record<string, string> = {
  facebook: "Facebook",
  instagram: "Instagram",
  youtube: "YouTube",
  tiktok: "TikTok",
  linkedin: "LinkedIn",
};

export function etichettaRete(rete: string) {
  return RETE_LABEL[rete] ?? rete;
}

export function PulsantiEsterni({ links }: { links: LinkEsterno[] }) {
  if (!links.length) {
    return (
      <p className="text-[11px] text-[var(--tbh-muted)]">
        Sito e canali ufficiali da ricevere: nessun link inventato.
      </p>
    );
  }
  return (
    <div className="flex flex-wrap gap-2">
      {links.map((l) => (
        <a
          key={l.url + l.etichetta}
          href={l.url}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 rounded-full border border-[var(--tbh-line)] px-3 py-1.5 text-[11px] font-bold uppercase tracking-wide hover:border-[var(--tbh-neon)] hover:text-[var(--tbh-neon)] transition"
        >
          {l.etichetta} <ExternalLink size={12} />
        </a>
      ))}
    </div>
  );
}

/** UNA sola CTA commerciale, come impone la regola dei 3 livelli di pulsanti. */
export function CtaCommerciale({
  tipo,
  argomento,
  colore,
}: {
  tipo: "acquista" | "prenota" | "informazioni";
  argomento: string;
  colore?: string;
}) {
  const label =
    tipo === "acquista" ? "Acquista" : tipo === "prenota" ? "Prenota" : "Richiedi informazioni";
  return (
    <a
      href={waInfo(argomento)}
      target="_blank"
      rel="noreferrer"
      className="inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-bold uppercase tracking-wide text-black"
      style={{ background: colore ?? "var(--tbh-neon)" }}
    >
      <MessageCircle size={16} /> {label}
    </a>
  );
}

/**
 * SIGILLO UFFICIALE DM — «Squadra seguita da DM». Usa SOLO il logo ufficiale
 * ricevuto (dal 18/10/2026 l'originale approvato /channel/loghi/dm.jpeg): niente varianti ricreate.
 * DM Comunicazioni è media partner autonomo, non una società del gruppo TBH.
 */
export function SigilloDm({
  testo,
  logo,
  to,
}: {
  testo: string;
  logo: string | null;
  to: string;
}) {
  return (
    <Link
      href={to}
      className="flex items-center gap-2 self-start rounded-full border border-[#ff2b2b66] bg-black/40 pl-1.5 pr-3 py-1 hover:border-[#ff2b2b] transition"
    >
      {logo ? (
        <img
          src={logo}
          alt="DM Comunicazioni"
          className="h-7 w-7 rounded-full object-contain bg-white p-0.5"
        />
      ) : (
        <span className="tbh-display text-xs text-[#ff2b2b] px-1">DM</span>
      )}
      <span className="text-[10px] font-bold uppercase tracking-wider text-[#ff2b2b]">{testo}</span>
    </Link>
  );
}

/** Blocco monitor standard riusabile su tutto il portale. */
export function MonitorCard({
  nome,
  logo,
  apriPagina,
  colore,
  sottotitolo,
  esterni = [],
  azione = "informazioni",
  badge,
  nota,
  sigillo,
  appartenenza,
  anteprima,
}: {
  nome: string;
  logo: string | null;
  /** Pagina INTERNA del portale: obbligatoria, mai un link esterno. */
  apriPagina: string;
  /** Regola «ANTEPRIMA → PULSANTE → SCHEDA»: con l'appartenenza reale logo + fascia
   *  diventano il pulsante visivo; senza, il logo resta allestimento (non cliccabile). */
  appartenenza?: Appartenenza | null;
  /** Grafica ufficiale «logo + appartenenza» già pronta. */
  anteprima?: string | null;
  colore?: string;
  sottotitolo?: string | null;
  esterni?: LinkEsterno[];
  azione?: "acquista" | "prenota" | "informazioni";
  badge?: string | null;
  nota?: string | null;
  /** Sigillo ufficiale DM: compare solo dove il rapporto è verificato. */
  sigillo?: { testo: string; logo: string | null; to: string } | null;
}) {
  return (
    <article
      className="tbh-card overflow-hidden flex flex-col p-4 gap-3"
      style={colore ? { borderColor: `${colore}66` } : undefined}
    >
      {appartenenza ? (
        <Link
          href={apriPagina}
          data-anteprima-pulsante
          aria-label={`${nome} — ${testoAppartenenza(appartenenza).sigla}: apri la pagina`}
          className="group block overflow-hidden rounded-2xl ring-1 ring-[var(--tbh-line)] transition hover:ring-2 hover:ring-[var(--tbh-neon)]"
        >
          {anteprima ? (
            <div className="h-40 md:h-48 w-full grid place-items-center bg-black">
              <img
                src={anteprima}
                alt={`${nome} — ${testoAppartenenza(appartenenza).sigla}`}
                loading="lazy"
                className="h-full w-full object-contain transition duration-300 group-hover:scale-[1.03]"
              />
            </div>
          ) : (
            <LogoBox name={nome} logo={logo} size="lg" dentroLink ctaLabel="Apri la pagina" />
          )}
          <FasciaAppartenenza a={appartenenza} />
        </Link>
      ) : (
        <LogoBox name={nome} logo={logo} size="lg" />
      )}
      <Link
        href={apriPagina}
        className="w-full text-center rounded-full px-4 py-2.5 text-sm font-bold uppercase tracking-wide text-black"
        style={{ background: colore ?? "var(--tbh-neon)" }}
      >
        Apri pagina
      </Link>
      <div className="flex flex-col gap-1">
        {badge && (
          <span
            className="self-start rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider"
            style={{ borderColor: colore ?? "var(--tbh-gold)", color: colore ?? "var(--tbh-gold)" }}
          >
            {badge}
          </span>
        )}
        <h3 className="tbh-display text-lg leading-tight">{nome}</h3>
        {sottotitolo && <p className="text-xs uppercase tracking-wide text-[var(--tbh-gold)]">{sottotitolo}</p>}
      </div>
      <PulsantiEsterni links={esterni} />
      {sigillo && <SigilloDm testo={sigillo.testo} logo={sigillo.logo} to={sigillo.to} />}
      {nota && <p className="text-xs text-[var(--tbh-muted)]">{nota}</p>}
      <div className="pt-1">
        <CtaCommerciale tipo={azione} argomento={nome} colore={colore} />
      </div>
    </article>
  );
}

/**
 * Riquadro monitor video. Senza URL reale NON si finge un player: compare lo stato
 * "in allestimento" e il pulsante WhatsApp.
 */
export function MonitorVideo({
  titolo,
  url,
  cta,
  archivio,
  colore,
  argomento,
}: {
  titolo: string;
  url: string | null;
  cta: string;
  archivio: string | null;
  colore: string;
  argomento: string;
}) {
  return (
    <div className="tbh-card overflow-hidden" style={{ borderColor: `${colore}66` }}>
      <div
        className="px-4 py-2 text-center text-xs font-bold uppercase tracking-[0.18em] text-black"
        style={{ background: colore }}
      >
        {titolo}
      </div>
      <div className="relative aspect-video bg-black/60 grid place-items-center">
        {url ? (
          <iframe
            src={url}
            title={titolo}
            className="absolute inset-0 h-full w-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; picture-in-picture; compute-pressure"
            allowFullScreen
          />
        ) : (
          <div className="flex flex-col items-center gap-2 p-6 text-center">
            <span
              className="grid h-14 w-14 place-items-center rounded-full border-2"
              style={{ borderColor: colore, color: colore }}
            >
              <Play size={22} />
            </span>
            <span className="text-sm font-bold uppercase tracking-wide">Monitor in allestimento</span>
            <span className="text-xs text-[var(--tbh-muted)]">
              Il video si accende quando riceviamo il link ufficiale delle riprese.
            </span>
          </div>
        )}
      </div>
      <div className="flex flex-wrap items-center gap-2 p-3">
        {url ? (
          <a
            href={url}
            target="_blank"
            rel="noreferrer"
            className="rounded-full px-4 py-2 text-xs font-bold uppercase tracking-wide text-black"
            style={{ background: colore }}
          >
            {cta}
          </a>
        ) : (
          <a
            href={waInfo(`${titolo} — ${argomento}`)}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold uppercase tracking-wide text-black"
            style={{ background: colore }}
          >
            <MessageCircle size={14} /> {cta}
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
  );
}

/** Blocco dati dichiarato vuoto: struttura visibile, contenuto onesto. */
export function BloccoAttesa({
  titolo,
  attesa,
  cta,
  colore,
}: {
  titolo: string;
  attesa: string;
  cta: string;
  colore: string;
}) {
  return (
    <div className="tbh-card p-0 overflow-hidden" style={{ borderColor: `${colore}55` }}>
      <div
        className="px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-black"
        style={{ background: colore }}
      >
        {titolo}
      </div>
      <div className="p-4 flex flex-col gap-3">
        <p className="flex items-start gap-2 text-sm text-[var(--tbh-muted)]">
          <Info size={16} className="mt-0.5 shrink-0" /> {attesa}
        </p>
        <a
          href={waInfo(`${titolo} — ${cta}`)}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 self-start rounded-full border border-[var(--tbh-line)] px-3 py-1.5 text-[11px] font-bold uppercase tracking-wide hover:border-[var(--tbh-neon)] hover:text-[var(--tbh-neon)]"
        >
          <MessageCircle size={13} /> {cta}
        </a>
      </div>
    </div>
  );
}

const STATO_LABEL: Record<string, { label: string; colore: string }> = {
  "disponibile-da-confermare": { label: "Disponibile — da confermare", colore: "#d7ff00" },
  "in-trattativa": { label: "In trattativa", colore: "#ff8a00" },
  assegnato: { label: "Assegnato", colore: "#33e0ff" },
};

/** Spazio commerciale con stato reale. Nessuno stato viene inventato. */
export function SpazioCommerciale({
  titolo,
  descrizione,
  stato,
}: {
  titolo: string;
  descrizione: string;
  stato: string;
}) {
  const s = STATO_LABEL[stato] ?? STATO_LABEL["disponibile-da-confermare"];
  return (
    <div className="tbh-card p-4 flex flex-col gap-2" style={{ borderColor: `${s.colore}55` }}>
      <span
        className="self-start rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider"
        style={{ borderColor: s.colore, color: s.colore }}
      >
        {s.label}
      </span>
      <h4 className="tbh-display text-base leading-tight">{titolo}</h4>
      <p className="text-sm text-[var(--tbh-muted)]">{descrizione}</p>
      <a
        href={waInfo(`Spazio commerciale: ${titolo}`)}
        target="_blank"
        rel="noreferrer"
        className="mt-1 inline-flex items-center gap-2 self-start rounded-full px-3 py-1.5 text-[11px] font-bold uppercase tracking-wide text-black"
        style={{ background: s.colore }}
      >
        <MessageCircle size={13} /> Richiedi informazioni
      </a>
    </div>
  );
}

/** Titolo di sezione monitor per la home e le pagine interne. */
export function TitoloMonitor({
  titolo,
  claim,
  colore,
  to,
}: {
  titolo: string;
  claim?: string | null;
  colore: string;
  to?: string;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3 border-b pb-3" style={{ borderColor: `${colore}55` }}>
      <div>
        <h2 className="tbh-display tbh-h2" style={{ color: colore }}>
          {titolo}
        </h2>
        {claim && <p className="text-sm text-[var(--tbh-muted)]">{claim}</p>}
      </div>
      {to && (
        <Link
          href={to}
          className="rounded-full border px-4 py-2 text-[11px] font-bold uppercase tracking-wide"
          style={{ borderColor: colore, color: colore }}
        >
          Apri la sezione
        </Link>
      )}
    </div>
  );
}
