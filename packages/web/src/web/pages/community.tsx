import { Link } from "wouter";
import { ExternalLink, MessageCircle, Users } from "lucide-react";
import { useHomeFeed } from "../queries/home";
import { wa, waInfo } from "../lib/whatsapp";

/** ORDINE 18 · Community TBH: canali reali, iniziative, gallery. Nessun social inventato. */
const CANALI: { nome: string; nota: string; url: string | null }[] = [
  {
    nome: "WhatsApp TBH",
    nota: "Canale diretto con la sede: informazioni, ordini, candidature.",
    url: wa("Buongiorno, vorrei entrare nella Community TBH."),
  },
  {
    nome: "DM Comunicazioni — YouTube",
    nota: "Dirette e programmi del media partner.",
    url: "https://youtube.com/@danielemanuelli1981",
  },
  {
    nome: "Social ufficiali TBH",
    nota: "Profili in verifica: pubblichiamo solo account ufficiali confermati.",
    url: null,
  },
];

const INIZIATIVE = [
  { titolo: "Circuito TBH", nota: "I luoghi con vetrofania: dove la community trova vantaggi.", to: "/network/circuito" },
  { titolo: "25 Livelli TBH", nota: "Il percorso di adesione al gruppo.", to: "/tbh/livelli" },
  { titolo: "Giochi di mente", nota: "Rebus, cruciverba, sudoku con punti bonus.", to: "/media/giochi" },
  { titolo: "Job & Casting", nota: "Annunci, candidature, provini.", to: "/lavoro-casting" },
  { titolo: "Touch Plaza Shop", nota: "Prodotti e servizi del gruppo.", to: "/shop" },
  { titolo: "Mappa del territorio", nota: "Città, locali e attività collegate.", to: "/territorio/mappa" },
];

export default function CommunityPage() {
  const feed = useHomeFeed();
  const c = feed.data?.conteggi;

  return (
    <div className="mx-auto max-w-[1400px] px-4 md:px-8 py-10">
      <header className="tbh-rise mb-8">
        <p className="text-xs tracking-[0.25em] text-[var(--tbh-gold)] uppercase mb-2">
          United by passion, driven by values
        </p>
        <h1 className="tbh-display tbh-h1">Community TBH</h1>
        <p className="tbh-body text-[var(--tbh-muted)] max-w-3xl mt-3">
          Persone, attività e squadre collegate al gruppo. Qui trovi i canali reali per entrare in
          contatto: nessun gruppo finto, nessun profilo inventato.
        </p>
      </header>

      {c && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-10">
          {[
            { n: c.societa, l: "Società" },
            { n: c.attivita, l: "Attività" },
            { n: c.squadre, l: "Società sportive" },
            { n: c.luoghi, l: "Luoghi sul territorio" },
            { n: c.brand, l: "Pagine TBH" },
          ].map((s) => (
            <div key={s.l} className="tbh-card p-4 text-center">
              <div className="tbh-display text-3xl text-[var(--tbh-neon)]">{s.n}</div>
              <div className="text-[11px] uppercase tracking-wider text-[var(--tbh-muted)]">
                {s.l}
              </div>
            </div>
          ))}
        </div>
      )}

      <section className="mb-12">
        <h2 className="tbh-display tbh-h2 mb-4">Canali</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {CANALI.map((k) => (
            <div key={k.nome} className="tbh-card p-5">
              <h3 className="tbh-display tbh-h3 flex items-center gap-2">
                <Users size={18} className="text-[var(--tbh-gold)]" /> {k.nome}
              </h3>
              <p className="text-sm text-[var(--tbh-muted)] mt-2">{k.nota}</p>
              {k.url ? (
                <a
                  href={k.url}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[var(--tbh-neon)]"
                >
                  Apri <ExternalLink size={14} />
                </a>
              ) : (
                <Link
                  to="/in-allestimento"
                  className="mt-4 inline-flex text-sm font-semibold text-[var(--tbh-muted)]"
                >
                  In allestimento
                </Link>
              )}
            </div>
          ))}
        </div>
      </section>

      <section className="mb-12">
        <h2 className="tbh-display tbh-h2 mb-4">Iniziative aperte</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {INIZIATIVE.map((i) => (
            <Link key={i.to} to={i.to} className="tbh-card p-5 hover:border-[var(--tbh-neon)] transition">
              <h3 className="tbh-display tbh-h3">{i.titolo}</h3>
              <p className="text-sm text-[var(--tbh-muted)] mt-2">{i.nota}</p>
              <span className="mt-3 inline-block text-sm font-semibold text-[var(--tbh-neon)]">
                Entra
              </span>
            </Link>
          ))}
        </div>
      </section>

      <div className="tbh-card p-6 flex flex-wrap items-center justify-between gap-4">
        <p className="tbh-body max-w-2xl">
          Vuoi entrare nella community, proporre la tua attività o organizzare un'iniziativa?
        </p>
        <a
          href={waInfo("la Community TBH")}
          target="_blank"
          rel="noreferrer"
          className="tbh-neon-btn px-5 py-3 text-sm inline-flex items-center gap-2"
        >
          <MessageCircle size={16} /> Scrivici su WhatsApp
        </a>
      </div>
    </div>
  );
}
