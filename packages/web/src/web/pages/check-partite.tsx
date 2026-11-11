import { Link } from "wouter";
import { ArrowRight } from "lucide-react";
import { PartiteInEvidenza } from "../components/partite-in-evidenza";
import { usePartiteInEvidenza } from "../queries/portale";

/* ────────────────────────────────────────────────────────────────────────────
   BOZZA «PARTITE IN EVIDENZA» — 29/09/2026.

   È il primo passo del piano approvato: la vetrina delle partite in home si fa
   prima di tutto il resto. Sta qui, dentro l'area bozza, perché la regola 0 di
   docs/regole-ferree.md vale sempre: la home vera non si tocca finché Claudio
   non guarda e dice sì.

   Quello che c'è sotto è ESATTAMENTE il componente che andrà in home, montato
   sui dati reali del canale del media partner: nessun mock, nessuna partita
   inventata, nessuna data dedotta.
   ──────────────────────────────────────────────────────────────────────────── */

export default function CheckPartitePage() {
  const { data, isLoading } = usePartiteInEvidenza(12);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 md:py-12 flex flex-col gap-8">
      <header className="flex flex-col gap-3">
        <p className="text-[10px] uppercase tracking-[0.24em] text-[var(--tbh-muted)]">
          Bozza · non è la home pubblica
        </p>
        {/* Titolo diverso da quello della sezione: sotto c'è il componente vero,
            che porta già il suo titolo «PARTITE IN EVIDENZA». Così non si legge due volte. */}
        <h1 className="tbh-display tbh-h1 leading-none">PROVA DELLA VETRINA PARTITE</h1>
        <p className="tbh-body text-[var(--tbh-muted)] max-w-[80ch]">
          Proposta della sezione che andrà in home, sopra il resto, come vetrina. Sotto c'è il
          componente vero sui dati veri. Se va bene si aggancia alla home pubblica; finché non
          dici sì, la home resta com'è.
        </p>
      </header>

      {/* CONTO ONESTO: prima la sezione, poi i numeri con cui è fatta. */}
      <section className="rounded-3xl border border-[var(--tbh-line)] p-4 md:p-5">
        <p className="text-[10px] uppercase tracking-[0.22em] text-[var(--tbh-muted)]">
          Conto vero dei dati che alimentano la vetrina
        </p>
        {isLoading ? (
          <p className="mt-2 text-sm text-[var(--tbh-muted)]">Caricamento…</p>
        ) : (
          <ul className="mt-2 grid gap-1.5 text-sm text-[var(--tbh-platinum)] sm:grid-cols-2">
            <li>
              Partite con <strong>almeno un monitor acceso</strong>: {data?.totale ?? 0}
            </li>
            <li>
              Partite <strong>complete</strong> (tre monitor accesi): {data?.treMonitor ?? 0}
            </li>
            <li>
              Società coinvolte: <strong>{data?.societa ?? 0}</strong>
            </li>
            <li>
              In vetrina ora: <strong>{data?.mostrate ?? 0}</strong> (le altre restano nelle
              pagine delle società)
            </li>
          </ul>
        )}
        <p className="mt-3 text-xs text-[var(--tbh-muted)]">
          Cosa fa il pulsante: <strong>[ APRI SCHEDA ]</strong> apre{" "}
          <code className="text-[var(--tbh-platinum)]">/sport/squadre/&lt;società&gt;?partita=&lt;match_id&gt;</code>{" "}
          — la pagina della società che esiste già, aperta e portata a vista sulla partita
          giusta. Nessuna pagina nuova per la singola partita.
        </p>
      </section>

      {/* LA SEZIONE, COM'È DAVVERO */}
      <PartiteInEvidenza massimo={12} />

      <div className="flex flex-wrap items-center gap-2.5">
        <Link to="/" className="rounded-xl border border-[var(--tbh-line)] px-4 py-3 text-xs hover:border-[var(--tbh-neon)] hover:text-[var(--tbh-neon)]">
          HOME PUBBLICA (non toccata)
        </Link>
        <Link to="/check-web" className="rounded-xl border border-[var(--tbh-line)] px-4 py-3 text-xs hover:border-[var(--tbh-neon)] hover:text-[var(--tbh-neon)]">
          ALTRE BOZZE · CHECK WEB
        </Link>
        <Link to="/sport/squadre" className="tbh-neon-btn inline-flex items-center gap-2 px-5 py-3 text-sm">
          PAGINE DELLE SOCIETÀ <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  );
}
