import { Link } from "wouter";
import { MessageCircle, Info } from "lucide-react";
import { useTeams } from "../queries/catalog";
import { LinkTile } from "../components/tiles";
import { waInfo } from "../lib/whatsapp";
import { trovaKit } from "../lib/kit-societa";
import { esterno } from "../lib/appartenenza";

/** Appartenenza reale di una squadra: kit del gruppo (R.F.A. = TBH) oppure
 *  l'etichetta del suo ruolo, già scritta nei dati («Squadra partner», «Società seguita»). */
function appartenenzaSquadra(t: { slug: string; role: string }) {
  const kit = trovaKit(t.slug);
  return kit ? kit.appartenenza : esterno(t.role.split(" · ")[0] || "Società seguita");
}

/** Ordine 6 e 7 — SOCIETÀ SEGUITE, sezione separata da DM Comunicazioni.
 *  Ordine richiesto da Claudio; si pubblica ciò che è già verificato, il resto si omette. */
const ORDINE = [
  "vis-novafeltria",
  "pietracuta",
  "verucchio",
  "san-marino-calcio",
  "tropical-coriano",
  "gabicce-gradara",
  "rimini",
  "victoria-1968",
  "bellaria-igea-marina",
];

export default function SocietaSeguitePage() {
  const q = useTeams();
  const teams = q.data?.teams ?? [];
  const ordinate = ORDINE.map((s) => teams.find((t) => t.slug === s)).filter(
    (t): t is NonNullable<typeof t> => Boolean(t),
  );
  const altre = teams.filter((t) => !ORDINE.includes(t.slug));

  return (
    <div className="mx-auto max-w-[1500px] px-4 md:px-8 py-10">
      <header className="tbh-rise mb-8">
        <p className="text-xs tracking-[0.25em] text-[var(--tbh-gold)] uppercase mb-2">
          Sport · Riviera di Rimini e Marche-Romagna
        </p>
        <h1 className="tbh-display tbh-h1">Società seguite</h1>
        <p className="tbh-body text-[var(--tbh-muted)] max-w-3xl mt-3">
          Le società calcistiche seguite con riprese, produzione video e comunicazione. Sezione
          autonoma: DM Comunicazioni ha la sua pagina dedicata.
        </p>
        <div className="flex flex-wrap gap-3 mt-5">
          <Link to="/dm" className="tbh-neon-btn px-5 py-2.5 text-sm">
            DM Comunicazioni →
          </Link>
          <Link
            to="/sport/calcio"
            className="px-5 py-2.5 text-sm rounded-full border border-[var(--tbh-line)] hover:border-[var(--tbh-gold)] text-[var(--tbh-gold)]"
          >
            Campionati e risultati ufficiali
          </Link>
        </div>
      </header>

      {q.isLoading ? (
        <div className="grid gap-7 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="tbh-card h-80 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid gap-7 md:grid-cols-2 xl:grid-cols-3">
          {ordinate.map((t) => (
            <LinkTile
              key={t.slug}
              name={t.name}
              subtitle={t.role}
              logo={t.logo}
              site={t.site}
              note={t.note}
              pagina={`/sport/squadre/${t.slug}`}
              appartenenza={appartenenzaSquadra(t)}
              anteprima={trovaKit(t.slug)?.materiali.logoPulsante ?? null}
            />
          ))}
        </div>
      )}

      {altre.length > 0 && (
        <section className="mt-14">
          <h2 className="tbh-display tbh-h2 mb-5">Altre società del gruppo</h2>
          <div className="grid gap-7 md:grid-cols-2 xl:grid-cols-3">
            {altre.map((t) => (
              <LinkTile
                key={t.slug}
                name={t.name}
                subtitle={t.role}
                logo={t.logo}
                site={t.site}
                note={t.note}
                pagina={`/sport/squadre/${t.slug}`}
                appartenenza={appartenenzaSquadra(t)}
                anteprima={trovaKit(t.slug)?.materiali.logoPulsante ?? null}
              />
            ))}
          </div>
        </section>
      )}

      <div className="tbh-card p-5 flex gap-3 items-start mt-10">
        <Info className="text-[var(--tbh-gold)] shrink-0" size={20} />
        <p className="text-sm text-[var(--tbh-muted)]">
          Dove manca il logo ufficiale pubblichiamo il nome per esteso con monogramma: nessun logo
          ricostruito. Dove manca il sito ufficiale la scheda resta senza link esterno.
        </p>
      </div>

      <div className="tbh-card p-6 mt-6 flex flex-col md:flex-row md:items-center gap-4">
        <p className="text-sm grow">
          <strong>Sei una società sportiva?</strong> Riprese, dirette, spot e comunicazione: ti
          mandiamo pacchetti e disponibilità.
        </p>
        <a
          href={waInfo("i servizi TBH per le società sportive")}
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
