/**
 * Pezzi condivisi di TBH Lavoro (06/10/2026): navigazione della sezione, riga annuncio
 * compatta, evidenza «Cerco Lavoro in Hotel», richiamo per le aziende turistiche.
 */
import { Link, useLocation } from "wouter";
import { ArrowRight, ExternalLink, Mail, MessageCircle, Phone, Hotel, Archive, FileText } from "lucide-react";
import {
  type AnnuncioBacheca,
  mailCandidatura,
  zoneAnnuncio,
  ZONE_ADRIATICHE,
} from "../lib/bacheca-annunci";
import { CERCO_LAVORO_HOTEL, dataIt } from "../lib/fonti-lavoro";
import { WHATSAPP_AZIENDE } from "../lib/profili-claudio";

export const VOCI_LAVORO = [
  { to: "/lavoro-casting/bacheca", label: "Bacheca" },
  { to: "/lavoro-casting/candidature", label: "Candidature" },
  { to: "/casting", label: "Casting" },
  { to: "/lavoro-casting/formazione", label: "Formazione" },
  { to: "/lavoro-casting/fonti-esterne", label: "Fonti esterne" },
  { to: "/lavoro-casting/aziende", label: "Per le aziende" },
];

export function NavLavoro() {
  const [loc] = useLocation();
  return (
    <nav aria-label="Sezioni TBH Lavoro" className="tbh-scroll-x flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 max-w-full">
      {VOCI_LAVORO.map((v) => {
        const attiva = v.to === "/lavoro-casting/bacheca" ? loc.startsWith(v.to) : loc === v.to;
        return (
          <Link
            key={v.to}
            to={v.to}
            aria-current={attiva ? "page" : undefined}
            className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold border transition-colors ${
              attiva
                ? "bg-[var(--tbh-neon)] text-black border-[var(--tbh-neon)]"
                : "border-[var(--tbh-line)] hover:border-[var(--tbh-neon)]"
            }`}
          >
            {v.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function TestataLavoro({ occhiello, titolo, testo }: { occhiello: string; titolo: string; testo?: string }) {
  return (
    <header className="tbh-rise mb-6">
      <p className="text-xs tracking-[0.25em] text-[var(--tbh-gold)] uppercase mb-2">{occhiello}</p>
      <h1 className="tbh-display text-4xl md:text-5xl leading-[0.95]">{titolo}</h1>
      {testo && <p className="tbh-body text-sm md:text-base text-[var(--tbh-muted)] max-w-3xl mt-3">{testo}</p>}
      <div className="mt-5">
        <NavLavoro />
      </div>
    </header>
  );
}

function Meta({ children }: { children: React.ReactNode }) {
  return <span className="min-w-0 [overflow-wrap:anywhere]">{children}</span>;
}

const ORARIO: Record<string, string> = { "full-time": "Full time", "part-time": "Part time" };

export function RigaAnnuncio({ a, archivio = false }: { a: AnnuncioBacheca; archivio?: boolean }) {
  const tbh = a.provenienza === "tbh";
  const zone = zoneAnnuncio(a)
    .map((id) => ZONE_ADRIATICHE.find((z) => z.id === id)?.nome)
    .filter(Boolean);
  const meta: string[] = [];
  if (a.localita) meta.push(a.localita);
  if (a.contratto) meta.push(a.contratto);
  if (a.orario.length) meta.push(a.orario.map((o) => ORARIO[o]).join(" / "));
  if (a.tipoPeriodo) meta.push(a.tipoPeriodo === "stagionale" ? "Stagionale" : "Continuativo");
  if (a.periodo) meta.push(a.periodo);
  if (a.alloggio === true) meta.push("Offre alloggio");
  if (a.alloggio === false) meta.push("Senza alloggio");

  const titolo =
    a.scheda.tipo === "interna" ? (
      <Link to={a.scheda.to} className="hover:text-[var(--tbh-neon)]">
        {a.titolo}
      </Link>
    ) : (
      <a href={a.scheda.url} target="_blank" rel="noreferrer" className="hover:text-[var(--tbh-neon)]">
        {a.titolo}
      </a>
    );

  return (
    <article
      data-annuncio={a.slug}
      data-provenienza={a.provenienza}
      className={`relative flex flex-col sm:flex-row gap-3 md:gap-4 rounded-2xl border bg-[var(--tbh-surface)] p-3 md:p-4 min-w-0 border-l-4 ${
        archivio ? "opacity-70 border-[var(--tbh-line)]" : tbh ? "border-[var(--tbh-line)] border-l-[var(--tbh-neon)]" : "border-[var(--tbh-line)] border-l-[#5b5b66]"
      }`}
    >
      {a.immagine ? (
        <img src={a.immagine} alt="" loading="lazy" className="hidden sm:block w-16 h-16 md:w-20 md:h-20 rounded-xl object-cover shrink-0 bg-black" />
      ) : (
        <div className="hidden sm:flex w-16 h-16 md:w-20 md:h-20 rounded-xl shrink-0 bg-black items-center justify-center text-[var(--tbh-muted)]">
          {tbh ? <span className="tbh-display text-[var(--tbh-neon)] text-xl">TBH</span> : <Hotel size={26} />}
        </div>
      )}
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-1.5 mb-1">
          {archivio ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest">
              <Archive size={11} /> In archivio · candidature chiuse
            </span>
          ) : tbh ? (
            <span className="rounded-full bg-[var(--tbh-neon)] px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-black">
              Opportunità TBH
            </span>
          ) : (
            <span className="rounded-full border border-[var(--tbh-line)] px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-[var(--tbh-muted)]">
              Fonte esterna · {a.fonte.nome}
            </span>
          )}
          <span className="text-[10px] uppercase tracking-widest text-[var(--tbh-muted)]">{a.settore}</span>
        </div>
        <h2 className="tbh-display text-lg md:text-xl leading-tight [overflow-wrap:anywhere]">{titolo}</h2>
        <p className="text-xs md:text-[13px] text-white/85 mt-0.5 [overflow-wrap:anywhere]">{a.azienda}</p>
        {meta.length > 0 && (
          <p className="text-xs text-[var(--tbh-muted)] mt-1 flex flex-wrap gap-x-3 gap-y-0.5 [overflow-wrap:anywhere]">
            {meta.map((m) => (
              <Meta key={m}>{m}</Meta>
            ))}
          </p>
        )}
        {a.condizioni && <p className="text-xs text-[var(--tbh-gold)] mt-1 [overflow-wrap:anywhere]">{a.condizioni}</p>}
        <p className="text-[11px] text-[var(--tbh-muted)] mt-1 flex flex-wrap gap-x-3">
          {a.pubblicato && <span>Pubblicato {dataIt(a.pubblicato)}</span>}
          {a.scadenza && <span>Scadenza {dataIt(a.scadenza)}</span>}
          {a.rilevato && <span>Rilevato su fonte originale il {dataIt(a.rilevato)}</span>}
          {zone.length > 0 && zone.length <= 3 && <span>Zona: {zone.join(", ")}</span>}
        </p>
      </div>
      <div className="shrink-0 flex flex-row-reverse flex-wrap items-center justify-between gap-2 sm:flex-col sm:items-end sm:justify-center">
        {a.scheda.tipo === "interna" ? (
          <Link
            to={a.scheda.to}
            className={`${archivio ? "border border-[var(--tbh-line)] rounded-full" : "tbh-neon-btn"} px-3 md:px-4 py-2 text-xs md:text-sm inline-flex items-center gap-1.5 whitespace-nowrap`}
          >
            {archivio ? "Vedi scheda" : "Vedi annuncio"} <ArrowRight size={14} />
          </Link>
        ) : (
          <a
            href={a.scheda.url}
            target="_blank"
            rel="noreferrer"
            className="rounded-full border border-[var(--tbh-neon)] text-[var(--tbh-neon)] px-3 md:px-4 py-2 text-xs md:text-sm font-semibold inline-flex items-center gap-1.5 whitespace-nowrap hover:bg-[var(--tbh-neon)] hover:text-black"
          >
            Annuncio originale <ExternalLink size={13} />
          </a>
        )}
        {!archivio && tbh && (
          <a href={mailCandidatura(a)} className="text-[11px] text-[var(--tbh-muted)] hover:text-[var(--tbh-neon)] inline-flex items-center gap-1">
            <Mail size={12} /> Candidati via e-mail
          </a>
        )}
        {!archivio && !tbh && (
          <span className="flex gap-3 text-[11px] text-[var(--tbh-muted)]">
            {a.contatti.email && (
              <a href={`mailto:${a.contatti.email}`} className="hover:text-[var(--tbh-neon)] inline-flex items-center gap-1" title={a.contatti.email}>
                <Mail size={12} /> E-mail
              </a>
            )}
            {a.contatti.telefoni[0] && (
              <a href={`tel:${a.contatti.telefoni[0].replace(/\s/g, "")}`} className="hover:text-[var(--tbh-neon)] inline-flex items-center gap-1">
                <Phone size={12} /> {a.contatti.telefoni[0]}
              </a>
            )}
          </span>
        )}
      </div>
    </article>
  );
}

/** «Cerco Lavoro in Hotel — Riviera Romagnola»: portale degli albergatori, sempre in evidenza. */
export function EvidenzaCercoLavoroHotel({ compatta = false }: { compatta?: boolean }) {
  return (
    <section
      data-evidenza="cerco-lavoro-hotel"
      className="rounded-2xl border-2 border-[var(--tbh-gold)]/70 bg-[linear-gradient(120deg,rgba(212,175,55,0.14),rgba(10,10,11,0.9)_60%)] p-4 md:p-5 flex flex-col md:flex-row md:items-center gap-4"
    >
      <Hotel className="text-[var(--tbh-gold)] shrink-0" size={34} />
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--tbh-gold)]">In evidenza · portale esterno ufficiale</p>
        <h2 className="tbh-display text-2xl md:text-3xl leading-tight">{CERCO_LAVORO_HOTEL.nome}</h2>
        {!compatta && (
          <p className="text-sm text-[var(--tbh-muted)] mt-1">
            Il portale degli albergatori Federalberghi della Riviera: offerte di hotel a Rimini, Riccione, Cesenatico,
            Misano Adriatico e Cattolica. Ci si candida direttamente sul sito originale.
          </p>
        )}
      </div>
      <div className="flex flex-wrap gap-2 shrink-0">
        <a href={CERCO_LAVORO_HOTEL.bacheca} target="_blank" rel="noreferrer" className="tbh-neon-btn px-5 py-2.5 text-sm inline-flex items-center gap-2">
          Consulta annunci hotel <ExternalLink size={14} />
        </a>
        <a
          href={CERCO_LAVORO_HOTEL.sito}
          target="_blank"
          rel="noreferrer"
          className="rounded-full border border-[var(--tbh-gold)] text-[var(--tbh-gold)] px-4 py-2.5 text-sm font-semibold inline-flex items-center gap-2 hover:border-[var(--tbh-neon)] hover:text-[var(--tbh-neon)]"
        >
          cercolavoroinhotel.it <ExternalLink size={13} />
        </a>
        {!compatta && (
          <a
            href={CERCO_LAVORO_HOTEL.federalberghi}
            target="_blank"
            rel="noreferrer"
            className="rounded-full border border-[var(--tbh-line)] px-4 py-2.5 text-sm font-semibold inline-flex items-center gap-2 hover:border-[var(--tbh-neon)]"
          >
            Federalberghi <ExternalLink size={13} />
          </a>
        )}
      </div>
    </section>
  );
}

export const POSTER_AZIENDE = [
  { src: "/lavoro/aziende/circuito-tbh.jpg", titolo: "Circuito TBH — imprese del turismo, lavoro, opportunità" },
  { src: "/lavoro/aziende/riviera-romagnola.jpg", titolo: "Riviera Romagnola — dai Lidi Ferraresi a Numana" },
  { src: "/lavoro/aziende/area-adriatica.jpg", titolo: "Area Adriatica — da Jesolo a Vieste" },
  { src: "/lavoro/aziende/riviera-ligure.jpg", titolo: "Riviera Ligure — Ponente e Levante" },
  { src: "/lavoro/aziende/tirrenica-ionica.jpg", titolo: "Tirrenica e Ionica — da Sanremo a Isola di Capo Rizzuto" },
  { src: "/lavoro/aziende/sicilia.jpg", titolo: "Sicilia — un'area dedicata" },
  { src: "/lavoro/aziende/sardegna.jpg", titolo: "Sardegna — un'area dedicata" },
  { src: "/lavoro/aziende/aree-montane.jpg", titolo: "Aree di montagna — turismo in quota" },
];

/** Richiamo compatto per le imprese turistiche che cercano personale. */
export function BannerAziende() {
  return (
    <section className="rounded-2xl border border-[var(--tbh-line)] bg-black p-4 md:p-5 flex flex-col md:flex-row md:items-center gap-4">
      <div className="flex -space-x-6 shrink-0">
        {POSTER_AZIENDE.slice(1, 4).map((p) => (
          <img key={p.src} src={p.src} alt="" className="w-16 h-20 object-cover rounded-lg border-2 border-black" loading="lazy" />
        ))}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--tbh-neon)]">Per hotel, stabilimenti, ristoranti e imprese turistiche</p>
        <h2 className="tbh-display text-xl md:text-2xl leading-tight">Hai un'attività nel settore turistico e cerchi personale?</h2>
      </div>
      <div className="flex flex-wrap gap-2 shrink-0">
        <Link to="/lavoro-casting/aziende" className="tbh-neon-btn px-5 py-2.5 text-sm inline-flex items-center gap-2">
          Pubblica il tuo annuncio <ArrowRight size={14} />
        </Link>
        <a
          href={WHATSAPP_AZIENDE.url}
          target="_blank"
          rel="noreferrer"
          className="rounded-full border border-[var(--tbh-line)] px-4 py-2.5 text-sm font-semibold inline-flex items-center gap-2 hover:border-[var(--tbh-neon)]"
        >
          <MessageCircle size={15} /> WhatsApp aziende
        </a>
      </div>
    </section>
  );
}

export function NotaCandidature() {
  return (
    <p className="text-xs text-[var(--tbh-muted)] flex items-start gap-2">
      <FileText size={14} className="mt-0.5 shrink-0" />
      Opportunità TBH: candidature solo a <a className="text-[var(--tbh-neon)]" href="mailto:lavoro@tibihacca.com">lavoro@tibihacca.com</a> o
      con il modulo online dell'annuncio. Annunci esterni: ci si candida sul sito originale o ai recapiti dell'azienda.
    </p>
  );
}
