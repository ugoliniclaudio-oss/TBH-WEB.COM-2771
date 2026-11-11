import { ExternalLink, Mail, Rainbow, CalendarDays, Ticket } from "lucide-react";
import { Link } from "wouter";
import { PRIDE_VILLAGE, VERIFICATO_IL } from "../lib/esterni";

export default function PrideVillagePage() {
  const p = PRIDE_VILLAGE;

  return (
    <div className="mx-auto max-w-[1500px] px-4 md:px-8 py-10">
      <header className="tbh-rise mb-10">
        <p className="text-xs tracking-[0.25em] text-[var(--tbh-gold)] uppercase mb-2">
          Partner · Eventi
        </p>
        <h1 className="tbh-display tbh-h1 flex items-center gap-3">
          <Rainbow className="text-[#ff5bb0]" /> {p.nome}
        </h1>
        <p className="tbh-body text-[var(--tbh-muted)] max-w-3xl mt-3">{p.descrizione}</p>
      </header>

      <section className="mb-14 grid gap-8 lg:grid-cols-[1.1fr_1fr] items-start">
        <a
          href={p.sito}
          target="_blank"
          rel="noreferrer"
          className="tbh-card block overflow-hidden hover:border-[#ff5bb0] transition"
        >
          <img
            src={p.anteprima}
            alt={`Anteprima del sito ufficiale ${p.nome}`}
            loading="lazy"
            className="w-full h-auto block"
          />
          <span className="flex items-center justify-between gap-3 px-5 py-4 text-sm font-semibold">
            Apri il sito ufficiale pridevillage.it
            <ExternalLink size={16} className="text-[#ff5bb0]" />
          </span>
        </a>

        <div className="tbh-card p-6">
          <h2 className="tbh-display tbh-h3 mb-4 flex items-center gap-2">
            <CalendarDays size={20} className="text-[#ff5bb0]" /> Le pagine ufficiali
          </h2>
          <div className="flex flex-wrap gap-2">
            {p.sezioni.map((s) => (
              <a
                key={s.url}
                href={s.url}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 rounded-full border border-[var(--tbh-line)] text-sm font-semibold inline-flex items-center gap-2 hover:border-[#ff5bb0]"
              >
                {s.label} <ExternalLink size={13} />
              </a>
            ))}
          </div>

          <p className="text-sm text-[var(--tbh-muted)] mt-5">{p.nota}</p>

          <div className="flex flex-wrap gap-2 mt-5 pt-5 border-t border-[var(--tbh-line)]">
            {p.social.map((s) => (
              <a
                key={s.url}
                href={s.url}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 rounded-full border border-[var(--tbh-line)] text-sm font-semibold inline-flex items-center gap-2 hover:border-[#ff5bb0]"
              >
                {s.label} <ExternalLink size={13} />
              </a>
            ))}
            <a
              href={`mailto:${p.email}`}
              className="px-4 py-2 rounded-full border border-[var(--tbh-line)] text-sm font-semibold inline-flex items-center gap-2 hover:border-[#ff5bb0]"
            >
              <Mail size={14} /> {p.email}
            </a>
          </div>
          <p className="text-xs text-[var(--tbh-muted)] mt-4">
            Link e anteprima verificati il {VERIFICATO_IL}.
          </p>
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-2">
        <article className="tbh-card p-6">
          <h2 className="tbh-display tbh-h3 mb-2">Touch Be Proud</h2>
          <p className="text-sm text-[var(--tbh-muted)]">
            La società del gruppo che segue eventi e community LGBTQ+. Da qui passano le nostre
            attività al Village.
          </p>
          <Link
            href="/tbh/societa"
            className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[var(--tbh-neon)]"
          >
            Vai alle società del gruppo
          </Link>
        </article>

        <article className="tbh-card p-6">
          <h2 className="tbh-display tbh-h3 mb-2 flex items-center gap-2">
            <Ticket size={18} className="text-[#ff5bb0]" /> Cerchiamo PR
          </h2>
          <p className="text-sm text-[var(--tbh-muted)]">
            L&apos;annuncio per la ricerca PR dedicata al Village è pubblicato sulla nostra bacheca
            lavoro e casting.
          </p>
          <Link
            href="/lavoro-casting/bacheca"
            className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[var(--tbh-neon)]"
          >
            Apri la bacheca annunci
          </Link>
        </article>
      </section>
    </div>
  );
}
