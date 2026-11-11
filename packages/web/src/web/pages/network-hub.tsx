import { Link } from "wouter";
import { ArrowRight, Network } from "lucide-react";
import { useHomeFeed } from "../queries/home";
import { waInfo } from "../lib/whatsapp";

/** Ordine 11-12 — TBH NETWORK è il circuito esterno: clienti, sponsor, partner,
 *  media partner, partner tecnici, rete commerciale. NON è il mondo proprietario
 *  del gruppo (quello sta in /tbh/*): le due cose restano separate. */
const VOCI: { to: string; titolo: string; testo: string }[] = [
  {
    to: "/network/circuito",
    titolo: "Circuito TBH",
    testo: "Le attività del territorio con la vetrofania del circuito: dove il gruppo è di casa.",
  },
  {
    to: "/network/clienti",
    titolo: "Clienti TBH",
    testo: "Aziende che hanno acquistato servizi. Pubblicati solo con autorizzazione scritta.",
  },
  {
    to: "/network/sponsor",
    titolo: "Sponsor TBH",
    testo: "Sponsor con contratto firmato e logo ufficiale. Nessun nome anticipato.",
  },
  {
    to: "/network/partner",
    titolo: "Partner TBH",
    testo: "Partner commerciali e partner tecnici del gruppo.",
  },
  {
    to: "/network/media-partner",
    titolo: "Media Partner TBH",
    testo: "Testate, canali e produzioni autonome che collaborano con il gruppo — DM Comunicazioni in testa.",
  },
  {
    to: "/network/rete-commerciale",
    titolo: "Rete commerciale",
    testo: "L'anagrafica delle aziende contattabili, con filtri per regione, settore e priorità.",
  },
  {
    to: "/territorio/mappa",
    titolo: "Mappa del territorio",
    testo: "I luoghi in cui il gruppo ha lavorato almeno una volta.",
  },
  {
    to: "/territorio/spazi",
    titolo: "Spazi territoriali",
    testo: "Città e aree operative in Italia ed Europa.",
  },
];

export default function NetworkHubPage() {
  const feed = useHomeFeed();
  const c = feed.data?.conteggi;

  return (
    <div className="mx-auto max-w-[1500px] px-4 md:px-8 py-10">
      <p className="text-xs tracking-[0.3em] text-[var(--tbh-gold)] uppercase mb-3">TBH Network</p>
      <h1 className="tbh-display tbh-h1">Il circuito attorno al gruppo</h1>
      <p className="tbh-body text-[var(--tbh-muted)] max-w-3xl mt-4">
        Qui stanno clienti, sponsor, partner, media partner, partner tecnici e la rete commerciale:
        realtà <strong>esterne</strong> al gruppo. Le società e le attività proprietarie di Touch
        Business Holding hanno un mondo separato, nella sezione TBH — un'attività non diventa mai
        automaticamente una società, e un partner non diventa mai una società del gruppo.
      </p>

      <div className="flex flex-wrap gap-3 mt-6">
        <Link to="/tbh/societa" className="px-5 py-3 rounded-full border border-[var(--tbh-line)] font-semibold hover:border-[var(--tbh-neon)]">
          Vai al mondo TBH (società e attività)
        </Link>
        <Link to="/network/media-partner" className="tbh-neon-btn px-5 py-3 flex items-center gap-2">
          <Network size={18} /> Media Partner
        </Link>
      </div>

      {c && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
          {[
            { n: c.luoghi, l: "Luoghi sul territorio" },
            { n: c.circuiti, l: "Circuiti motorsport" },
            { n: c.squadre, l: "Società sportive seguite" },
            { n: c.brand, l: "Pagine TBH collegate" },
          ].map((s) => (
            <div key={s.l} className="tbh-card p-5 text-center">
              <div className="tbh-display text-3xl md:text-4xl text-[var(--tbh-neon)]">{s.n}</div>
              <div className="text-[11px] md:text-xs uppercase tracking-wider text-[var(--tbh-muted)]">
                {s.l}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3 mt-10">
        {VOCI.map((v) => (
          <Link key={v.to} to={v.to} className="tbh-card p-6 hover:border-[var(--tbh-neon)] transition block">
            <h2 className="tbh-display text-2xl">{v.titolo}</h2>
            <p className="text-sm text-[var(--tbh-muted)] mt-2">{v.testo}</p>
            <span className="text-sm font-semibold text-[var(--tbh-neon)] inline-flex items-center gap-2 mt-4">
              Apri <ArrowRight size={16} />
            </span>
          </Link>
        ))}
      </div>

      <div className="tbh-card p-6 md:p-8 mt-12">
        <h2 className="tbh-display tbh-h3">Entrare nel network</h2>
        <p className="text-sm text-[var(--tbh-muted)] mt-2 max-w-2xl">
          Clienti, sponsor, partner tecnici e media partner: si parte da una chiamata e da un
          accordo scritto. Nessun logo viene pubblicato prima della firma.
        </p>
        <a
          href={waInfo("TBH Network — clienti, sponsor e partner")}
          target="_blank"
          rel="noreferrer"
          className="tbh-neon-btn px-6 py-3 inline-flex mt-4"
        >
          Parliamone su WhatsApp
        </a>
      </div>
    </div>
  );
}
