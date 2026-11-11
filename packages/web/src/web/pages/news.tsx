import { Link } from "wouter";
import { ArrowRight, MessageCircle, Newspaper } from "lucide-react";
import { useNews } from "../queries/editoria";
import { waInfo } from "../lib/whatsapp";

/**
 * FASE 7 — Sezione News: struttura pronta, categorie collegate alle pagine reali del portale.
 * Nessun articolo, titolo, virgolettato o rilancio inventato: se non c'è testo ufficiale, lo diciamo.
 */
export default function NewsPage({ categoria }: { categoria?: string }) {
  const q = useNews(categoria);
  const categorie = q.data?.categorie ?? [];
  const attiva = q.data?.categoria ?? null;

  return (
    <div className="mx-auto max-w-[1500px] px-4 md:px-8 py-10">
      {/* BLOCCO 1 · punto 5 — ruoli chiari: qui ci sono gli ARTICOLI. La rivista sta
          in Influencity, l'hub che tiene insieme tutto è l'Edicola. */}
      <p className="text-[11px] font-extrabold uppercase tracking-[0.22em] text-[var(--tbh-muted)]">
        <Link to="/edicola" className="transition hover:text-[var(--tbh-neon)]">
          Edicola TBH
        </Link>{" "}
        · Articoli e notizie
      </p>
      <h1 className="tbh-display tbh-h1 mt-2">{attiva ? `News · ${attiva.nome}` : "News TBH"}</h1>
      <p className="tbh-body text-[var(--tbh-muted)] mt-3 max-w-3xl">
        {attiva
          ? attiva.descrizione
          : "Le notizie ufficiali del gruppo, del Circuito e dei partner, divise per area."}
      </p>

      <div className="flex flex-wrap gap-2 mt-6">
        <Link
          to="/news"
          className={`px-4 py-2 rounded-full text-sm font-semibold border ${
            attiva
              ? "border-[var(--tbh-line)] text-[var(--tbh-muted)]"
              : "border-[var(--tbh-neon)] text-[var(--tbh-neon)]"
          }`}
        >
          Tutte le aree
        </Link>
        {categorie.map((c) => (
          <Link
            key={c.slug}
            to={`/news/${c.slug}`}
            className={`px-4 py-2 rounded-full text-sm font-semibold border ${
              attiva?.slug === c.slug
                ? "border-[var(--tbh-neon)] text-[var(--tbh-neon)]"
                : "border-[var(--tbh-line)] text-[var(--tbh-muted)]"
            }`}
          >
            {c.nome}
          </Link>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mt-8">
        {(attiva ? [attiva] : categorie).map((c) => (
          <div key={c.slug} className="tbh-card p-5 flex flex-col gap-3">
            <Newspaper size={20} className="text-[var(--tbh-neon)]" />
            <span className="tbh-display text-xl">{c.nome}</span>
            <span className="text-sm text-[var(--tbh-muted)] grow">{c.descrizione}</span>
            <span className="text-[11px] text-[var(--tbh-muted)]">
              Nessun articolo pubblicato: attendiamo i testi ufficiali della redazione.
            </span>
            {c.collegata && (
              <Link
                to={c.collegata}
                className="text-sm font-semibold text-[var(--tbh-neon)] inline-flex items-center gap-2"
              >
                Vai alla sezione <ArrowRight size={15} />
              </Link>
            )}
          </div>
        ))}
      </div>

      <section className="tbh-card p-5 md:p-6 mt-10 flex flex-col gap-3">
        <h2 className="tbh-display tbh-h3">Il magazine ufficiale</h2>
        <p className="text-sm text-[var(--tbh-muted)]">
          L'informazione del gruppo passa da Touch Influencity Magazine: numerazione dal N°0 di
          Giugno/Luglio 2022, mensile, con lo speciale di fine anno.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link to="/influencity" className="tbh-neon-btn px-5 py-3 inline-flex items-center gap-2">
            Apri l'edicola <ArrowRight size={16} />
          </Link>
          <Link
            to="/media"
            className="px-5 py-3 rounded-full border border-[var(--tbh-line)] text-sm font-semibold"
          >
            Fonti e canali in chiaro
          </Link>
        </div>
      </section>

      <div className="tbh-card p-5 md:p-6 mt-6 flex flex-col gap-3">
        <p className="text-sm text-[var(--tbh-muted)]">{q.data?.nota}</p>
        <a
          href={waInfo("invio notizie ufficiali per la sezione News")}
          target="_blank"
          rel="noreferrer"
          className="tbh-neon-btn px-5 py-3 inline-flex items-center gap-2 self-start"
        >
          <MessageCircle size={17} /> Invia una notizia ufficiale
        </a>
      </div>
    </div>
  );
}
