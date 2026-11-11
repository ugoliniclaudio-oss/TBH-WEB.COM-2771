import { MessageCircle, ExternalLink, AlertTriangle } from "lucide-react";
import { useBrand } from "../queries/tbh";
import { LogoBox } from "../components/tiles";
import { waInfo } from "../lib/whatsapp";

const KIND_LABEL: Record<string, string> = {
  attivita: "Attività del gruppo · senza P.IVA propria",
  produzione: "Produzione TBH",
  concorso: "Concorso",
  piattaforma: "Piattaforma",
};

const STATO_LABEL: Record<string, string> = {
  verificato: "Dati verificati",
  "da-verificare": "Alcuni dati sono da verificare",
  "in-allestimento": "Sezione in allestimento",
};

export default function BrandPage({ slug }: { slug: string }) {
  const q = useBrand(slug);

  if (q.isLoading) {
    return (
      <div className="mx-auto max-w-[1200px] px-4 md:px-8 py-10">
        <div className="tbh-card h-72 animate-pulse" />
      </div>
    );
  }

  if (!q.data) {
    return (
      <div className="mx-auto max-w-[1200px] px-4 md:px-8 py-16 text-center">
        <h1 className="tbh-display tbh-h1">Pagina non trovata</h1>
      </div>
    );
  }

  const b = q.data;

  return (
    <div className="mx-auto max-w-[1200px] px-4 md:px-8 py-10">
      <header className="tbh-rise mb-8">
        <p className="text-xs tracking-[0.25em] text-[var(--tbh-gold)] uppercase mb-2">
          {KIND_LABEL[b.kind] ?? "Mondo TBH"}
        </p>
        <h1 className="tbh-display tbh-h1">{b.name}</h1>
        <p className="tbh-body text-[var(--tbh-neon)] mt-2">{b.claim}</p>
      </header>

      <section className="tbh-card p-5 md:p-6 grid gap-6 md:grid-cols-[300px_1fr] items-start mb-8">
        <div>
          {/* CORREZIONE 29/09/2026: `b.link` è un ELENCO di indirizzi, non un
              indirizzo. Passandolo così com'era, il pulsante «Apri il sito»
              usciva senza destinazione valida. Qui si passa il PRIMO indirizzo
              reale dell'elenco; l'elenco completo resta più sotto, invariato. */}
          <LogoBox name={b.name} logo={b.logo} size="lg" url={b.link[0]?.url ?? null} />
          {!b.logo && (
            <p className="text-[11px] text-[var(--tbh-gold)] mt-2 flex items-start gap-1.5">
              <AlertTriangle size={13} className="mt-0.5 shrink-0" />
              Logo ufficiale non ancora fornito: mostriamo il nome per esteso con il link, non
              creiamo loghi alternativi.
            </p>
          )}
        </div>

        <div className="flex flex-col gap-4">
          <p className="tbh-body text-[var(--tbh-muted)]">{b.descrizione}</p>
          <ul className="space-y-2 text-sm">
            {b.punti.map((p) => (
              <li key={p} className="flex gap-2">
                <span className="text-[var(--tbh-neon)]">·</span>
                <span>{p}</span>
              </li>
            ))}
          </ul>
          <p className="text-xs text-[var(--tbh-gold)]">{STATO_LABEL[b.stato]}</p>

          <div className="flex flex-wrap gap-3 pt-1">
            <a
              href={waInfo(b.name)}
              target="_blank"
              rel="noreferrer"
              className="tbh-neon-btn px-5 py-2.5 text-sm flex items-center gap-2"
            >
              <MessageCircle size={16} /> Informazioni su WhatsApp
            </a>
            {b.link.map((l) => (
              <a
                key={l.url}
                href={l.url}
                target="_blank"
                rel="noreferrer"
                className="px-5 py-2.5 text-sm rounded-full border border-[var(--tbh-line)] hover:border-[var(--tbh-neon)] flex items-center gap-2"
              >
                {l.label} <ExternalLink size={15} />
              </a>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
