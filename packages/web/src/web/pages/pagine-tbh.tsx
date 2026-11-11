import { Link } from "wouter";
import { MessageCircle } from "lucide-react";
import { useBrandList } from "../queries/tbh";
import { LogoBox } from "../components/tiles";
import { waInfo } from "../lib/whatsapp";
import { SlotContenuti } from "../components/slot-contenuti";

/** Ordine 9 — indice delle pagine TBH: ogni attività/produzione/piattaforma del gruppo
 *  ha la sua pagina dedicata, raggiungibile da qui e dal menu TBH. */
const KIND_LABEL: Record<string, string> = {
  attivita: "Attività senza P.IVA",
  produzione: "Produzione TBH",
  concorso: "Concorso",
  piattaforma: "Piattaforma",
};

export function pathBrand(slug: string) {
  if (slug === "miss-cool") return "/eventi/miss-cool";
  if (slug === "reality-show" || slug === "heddy-video") return `/media/${slug}`;
  if (slug === "touch-fashion") return "/tbh/touch-fashion";
  return `/tbh/p/${slug}`;
}

export default function PagineTbhPage() {
  const q = useBrandList();
  const items = q.data?.items ?? [];

  return (
    <div className="mx-auto max-w-[1500px] px-4 md:px-8 py-10">
      <header className="tbh-rise mb-8">
        <p className="text-xs tracking-[0.25em] text-[var(--tbh-gold)] uppercase mb-2">
          Mondo TBH · pagine dedicate
        </p>
        <h1 className="tbh-display tbh-h1">Pagine TBH</h1>
        <p className="tbh-body text-[var(--tbh-muted)] max-w-3xl mt-3">
          Ogni attività, produzione e piattaforma del gruppo ha il suo spazio indipendente. Una sola
          scheda per ogni realtà: dove serve, viene richiamata dalle altre sezioni.
        </p>
      </header>

      {q.isLoading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="tbh-card h-72 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {items.map((b) => (
            <Link
              key={b.slug}
              to={pathBrand(b.slug)}
              className="tbh-card overflow-hidden p-4 block hover:border-[var(--tbh-neon)] transition"
            >
              {/* CORREZIONE 29/09/2026: `b.link` è un ELENCO di indirizzi.
                  Si passa il primo indirizzo reale, non l'elenco intero. */}
              <LogoBox
                name={b.name}
                logo={b.logo}
                size="lg"
                url={b.link[0]?.url ?? null}
                dentroLink
              />
              <div className="p-4 pb-1">
                <h3 className="tbh-display tbh-h3">{b.name}</h3>
                <p className="text-[11px] tracking-wide text-[var(--tbh-gold)] uppercase mt-1">
                  {KIND_LABEL[b.kind] ?? "Mondo TBH"}
                </p>
                <p className="text-sm text-[var(--tbh-muted)] mt-2">{b.claim}</p>
                <span className="mt-3 inline-block text-sm font-semibold text-[var(--tbh-neon)]">
                  Apri la pagina →
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}

      <div className="tbh-card p-6 mt-10 flex flex-col md:flex-row md:items-center gap-4">
        <p className="text-sm grow">
          <strong>Manca una pagina o un contenuto?</strong> Mandaci logo, testi e link ufficiali: la
          pubblichiamo così com'è, senza inventare nulla.
        </p>
        <a
          href={waInfo("le pagine del gruppo TBH")}
          target="_blank"
          rel="noreferrer"
          className="tbh-neon-btn px-5 py-2.5 text-sm inline-flex items-center gap-2 whitespace-nowrap"
        >
          <MessageCircle size={16} /> Scrivi su WhatsApp
        </a>
      </div>

      <SlotContenuti
        slot="pagine:pulsanti"
        modo="pulsanti"
        titolo="Pagine e link aggiunti a mano"
        descrizione="Titolo per esteso, logo e link: il pulsante compare subito e lo vedono tutti i visitatori."
      />
    </div>
  );
}
