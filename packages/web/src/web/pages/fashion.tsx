import { ExternalLink, BookOpen, Info } from "lucide-react";
import { Link } from "wouter";
import {
  ELENA_DI_CUORI,
  ELENA_DI_CUORI_PRODOTTI,
  FASHION_LIFE,
  VERIFICATO_IL,
} from "../lib/esterni";
import {
  AcquistoEsterno,
  FotoProdottoEsterno,
  etichettaAcquisto,
} from "../components/acquisto-esterno";
import { useCopertine } from "../components/immagine-tbh";

const CHIP =
  "px-4 py-2 rounded-full border border-[var(--tbh-line)] text-sm font-semibold inline-flex items-center gap-2 hover:border-[var(--tbh-gold)]";

export default function FashionPage() {
  const e = ELENA_DI_CUORI;
  const f = FASHION_LIFE;
  /**
   * Le foto dei prodotti esterni con UNA chiamata sola (Priorità 2bis, punto d).
   * Sono gli stessi articoli del negozio e usano lo stesso spazio: la foto caricata
   * una volta dal pannello si vede in entrambe le pagine, senza ricaricarla.
   */
  const copertineEsterne = useCopertine("prodotto-esterno:");

  return (
    <div className="mx-auto max-w-[1500px] px-4 md:px-8 py-10">
      <header className="tbh-rise mb-10">
        <p className="text-xs tracking-[0.25em] text-[var(--tbh-gold)] uppercase mb-2">
          Area Fashion · marchi e testate
        </p>
        <h1 className="tbh-display tbh-h1">Fashion &amp; Riviste</h1>
        <p className="tbh-body text-[var(--tbh-muted)] max-w-3xl mt-3">
          Marchi di moda e testate con cui abbiamo lavorato. Ogni pulsante apre il sito ufficiale
          del titolare: prezzi, disponibilità e ordini restano sul suo sito. Link e anteprime
          verificati il {VERIFICATO_IL}.
        </p>
      </header>

      {/* ─────────────  ELENA DI CUORI  ───────────── */}
      <section className="mb-16">
        <h2 className="tbh-display tbh-h2 mb-6">{e.nome}</h2>

        <div className="grid gap-8 lg:grid-cols-[1.1fr_1fr] items-start">
          <a
            href={e.sito}
            target="_blank"
            rel="noreferrer"
            className="tbh-card block overflow-hidden hover:border-[var(--tbh-gold)] transition"
          >
            <img
              src={e.anteprima}
              alt={`Anteprima del sito ufficiale ${e.nome}`}
              loading="lazy"
              className="w-full h-auto block"
            />
            <span className="flex items-center justify-between gap-3 px-5 py-4 text-sm font-semibold">
              Apri elenadicuori.com
              <ExternalLink size={16} className="text-[var(--tbh-gold)]" />
            </span>
          </a>

          <div className="tbh-card p-6">
            <p className="tbh-body text-[var(--tbh-muted)]">{e.descrizione}</p>

            <p className="mt-4 text-sm rounded-2xl border border-[var(--tbh-line)] p-4 flex gap-3">
              <Info size={18} className="text-[var(--tbh-gold)] shrink-0 mt-0.5" />
              <span>{e.posizione}</span>
            </p>

            <h3 className="tbh-display text-lg mt-6 mb-3">Categorie</h3>
            <div className="flex flex-wrap gap-2">
              {e.categorie.map((c) => (
                <a key={c.url} href={c.url} target="_blank" rel="noreferrer" className={CHIP}>
                  {c.label} <ExternalLink size={13} />
                </a>
              ))}
            </div>

            <h3 className="tbh-display text-lg mt-6 mb-3">Servizi al cliente</h3>
            <div className="flex flex-wrap gap-2">
              {e.servizi.map((s) => (
                <a key={s.url} href={s.url} target="_blank" rel="noreferrer" className={CHIP}>
                  {s.label} <ExternalLink size={13} />
                </a>
              ))}
            </div>

            <div className="flex flex-wrap gap-2 mt-6 pt-5 border-t border-[var(--tbh-line)]">
              {e.social.map((s) => (
                <a key={s.url} href={s.url} target="_blank" rel="noreferrer" className={CHIP}>
                  {s.label} <ExternalLink size={13} />
                </a>
              ))}
            </div>

            <p className="text-xs text-[var(--tbh-muted)] mt-4">
              {e.ragioneSociale} · P.IVA {e.piva}
            </p>
          </div>
        </div>

        <h3 className="tbh-display tbh-h3 mt-10 mb-2">Prodotti</h3>
        <p className="text-sm text-[var(--tbh-muted)] mb-6 max-w-3xl">
          Prezzi letti sul listino ufficiale del venditore il {VERIFICATO_IL}: li aggiorna lui sul
          suo sito. Il pulsante apre la scheda del prodotto su elenadicuori.com, dove si completa
          l&apos;ordine.
        </p>
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {ELENA_DI_CUORI_PRODOTTI.map((p) => (
            <article key={p.url} className="tbh-card p-5 flex flex-col gap-2">
              {/* Stessa foto del negozio: un articolo non può essere allestito in una
                  pagina e muto nell'altra. */}
              <FotoProdottoEsterno prodotto={p} copertine={copertineEsterne} className="mb-1" />
              <p className="text-xs uppercase tracking-wide text-[var(--tbh-gold)]">{p.categoria}</p>
              <h4 className="tbh-display text-xl leading-tight grow">{p.nome}</h4>
              <p className="tbh-display text-2xl text-[var(--tbh-neon)]">{p.prezzo}</p>
              <p className="text-[11px] text-[var(--tbh-muted)]">
                {p.venditore} · {etichettaAcquisto(p.tipoAcquisto)}
              </p>
              {/* Stesso pulsante del negozio: un prodotto non può dire due cose diverse. */}
              <AcquistoEsterno prodotto={p} className="mt-2" />
            </article>
          ))}
        </div>

        <Link
          href="/shop"
          className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-[var(--tbh-neon)]"
        >
          Vai a Touch Plaza · il nostro negozio
        </Link>
      </section>

      {/* ─────────────  FASHION LIFE MAGAZINE  ───────────── */}
      <section>
        <h2 className="tbh-display tbh-h2 mb-6 flex items-center gap-3">
          <BookOpen className="text-[#9dff3c]" /> {f.nome}
        </h2>

        <div className="grid gap-8 lg:grid-cols-[1.1fr_1fr] items-start">
          <a
            href={f.sito}
            target="_blank"
            rel="noreferrer"
            className="tbh-card block overflow-hidden hover:border-[#9dff3c] transition"
          >
            <img
              src={f.anteprima}
              alt={`Anteprima del sito ufficiale ${f.nome}`}
              loading="lazy"
              className="w-full h-auto block"
            />
            <span className="flex items-center justify-between gap-3 px-5 py-4 text-sm font-semibold">
              Apri fashionlifemagazine.com
              <ExternalLink size={16} className="text-[#9dff3c]" />
            </span>
          </a>

          <div className="tbh-card p-6">
            <p className="text-xs uppercase tracking-wide text-[var(--tbh-gold)]">{f.rapporto}</p>
            <p className="tbh-body text-[var(--tbh-muted)] mt-3">{f.descrizione}</p>

            <h3 className="tbh-display text-lg mt-6 mb-3">Sezioni</h3>
            <div className="flex flex-wrap gap-2">
              {f.sezioni.map((s) => (
                <a key={s.url} href={s.url} target="_blank" rel="noreferrer" className={CHIP}>
                  {s.label} <ExternalLink size={13} />
                </a>
              ))}
            </div>

            <h3 className="tbh-display text-lg mt-6 mb-3">Edizioni</h3>
            <div className="flex flex-wrap gap-2">
              {f.edizioni.map((s) => (
                <a key={s.url} href={s.url} target="_blank" rel="noreferrer" className={CHIP}>
                  {s.label} <ExternalLink size={13} />
                </a>
              ))}
            </div>

            <div className="flex flex-wrap gap-2 mt-6 pt-5 border-t border-[var(--tbh-line)]">
              {f.extra.map((s) => (
                <a key={s.url} href={s.url} target="_blank" rel="noreferrer" className={CHIP}>
                  {s.label} <ExternalLink size={13} />
                </a>
              ))}
            </div>
          </div>
        </div>

        <Link
          href="/influencity"
          className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-[var(--tbh-neon)]"
        >
          Vai all&apos;edicola Touch Influencity Magazine
        </Link>
      </section>

      {/* ─────────────  TOUCH MISS COOL (layout ufficiale 18/10/2026: fa parte di Touch Fashion)  ─────────────
          Solo testo e link alla pagina GIÀ esistente del concorso: nessuna immagine, nessun URL nuovo. */}
      <section className="mt-16" data-testid="fashion-miss-cool">
        <h2 className="tbh-display tbh-h2 mb-4">Touch Miss Cool · Touch Miss Cool Web</h2>
        <p className="tbh-body text-[var(--tbh-muted)] max-w-3xl">
          Il concorso Touch Miss Cool e il suo percorso online Touch Miss Cool Web fanno parte del
          Channel Touch Fashion. Regolamento, adesione e schede delle candidate sono sulla pagina
          ufficiale del concorso.
        </p>
        <Link
          href="/eventi/miss-cool"
          className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[var(--tbh-neon)]"
        >
          Vai a Touch Miss Cool e Touch Miss Cool Web
        </Link>
      </section>
    </div>
  );
}
