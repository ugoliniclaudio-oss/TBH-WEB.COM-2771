import { Info, MessageCircle } from "lucide-react";
import { useNetwork } from "../queries/tbh";
import { LinkTile } from "../components/tiles";
import { waInfo } from "../lib/whatsapp";

const TESTI: Record<
  "clienti" | "sponsor" | "partner",
  { titolo: string; kicker: string; intro: string; cta: string }
> = {
  clienti: {
    titolo: "Clienti del network",
    kicker: "Punto 08 della Master List",
    intro:
      "Pubblichiamo un cliente solo con la sua autorizzazione e con il logo ufficiale. Nessun nome messo in vetrina senza consenso.",
    cta: "diventare cliente TBH",
  },
  sponsor: {
    titolo: "Sponsor",
    kicker: "Punto 08 della Master List",
    intro:
      "Spazi sponsor su programmi, squadre, eventi e magazine. In pagina finiscono solo contratti firmati.",
    cta: "gli spazi sponsor TBH",
  },
  partner: {
    titolo: "Partner",
    kicker: "Punto 08 della Master List",
    intro:
      "Media partner, squadre sportive e partner tecnici con cui il gruppo lavora. Link ufficiali verificati.",
    cta: "una partnership con TBH",
  },
};

export default function NetworkPage({ tipo }: { tipo: "clienti" | "sponsor" | "partner" }) {
  const q = useNetwork(tipo);
  const t = TESTI[tipo];

  return (
    <div className="mx-auto max-w-[1500px] px-4 md:px-8 py-10">
      <header className="tbh-rise mb-8">
        <p className="text-xs tracking-[0.25em] text-[var(--tbh-gold)] uppercase mb-2">
          {t.kicker}
        </p>
        <h1 className="tbh-display tbh-h1">{t.titolo}</h1>
        <p className="tbh-body text-[var(--tbh-muted)] max-w-3xl mt-3">{t.intro}</p>
      </header>

      {q.isLoading && (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="tbh-card h-72 animate-pulse" />
          ))}
        </div>
      )}

      {q.data?.nota && (
        <div className="tbh-card p-5 mb-8 flex gap-3 items-start">
          <Info className="text-[var(--tbh-gold)] shrink-0" size={20} />
          <p className="text-sm text-[var(--tbh-muted)]">{q.data.nota}</p>
        </div>
      )}

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {q.data?.items.map((i) => (
          <LinkTile
            key={i.nome}
            name={i.nome}
            subtitle={t.titolo}
            logo={i.logo}
            site={i.sito}
            note={i.dettaglio}
          />
        ))}
      </div>

      <div className="tbh-card p-6 mt-10 flex flex-col md:flex-row md:items-center gap-4">
        <p className="text-sm grow">
          <strong>Vuoi entrare nel network?</strong> Scrivici: ti mandiamo condizioni, spazi
          disponibili e i livelli TBH.
        </p>
        <a
          href={waInfo(t.cta)}
          target="_blank"
          rel="noreferrer"
          className="tbh-neon-btn px-5 py-2.5 text-sm inline-flex items-center gap-2 whitespace-nowrap"
        >
          <MessageCircle size={16} /> Scrivi su WhatsApp
        </a>
      </div>
    </div>
  );
}
