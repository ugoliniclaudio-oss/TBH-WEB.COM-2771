import { Link } from "wouter";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { ambientePerSlug, AMBIENTI_CARRELLATA } from "../lib/ambienti-tbh";
import { GrigliaPulsanti } from "../components/carrellata-ambienti";
import { HeroSezione } from "../components/hero-sezione";
import { waInfo } from "../lib/whatsapp";

/* ────────────────────────────────────────────────────────────────────────────
   MINI-HOMEPAGE DI AMBIENTE — istruzioni 03, 04 e 08 di Claudio (06/09/2026).

   Vive dentro la bozza, su /check-web/c/:slug, quindi la produzione non si
   tocca (regola 0 di docs/regole-ferree.md). Qui NON nasce nessun contenuto
   nuovo: ogni pulsante apre la pagina canonica che esiste già, con la
   categoria scritta sopra il nome.
   ──────────────────────────────────────────────────────────────────────────── */

export default function AmbientePage({ slug }: { slug: string }) {
  const ambiente = ambientePerSlug(slug);

  if (!ambiente) {
    return (
      <div className="mx-auto max-w-[1500px] px-4 md:px-8 py-16">
        <h1 className="tbh-display tbh-h1">Ambiente non trovato</h1>
        <p className="tbh-body text-[var(--tbh-muted)] mt-3">
          Questo indirizzo non corrisponde a nessuno dei dieci ambienti di TBH-WEB.
        </p>
        <Link to="/check-web" className="tbh-neon-btn px-5 py-2.5 mt-6 inline-flex text-sm">
          Torna alla Home 0
        </Link>
      </div>
    );
  }

  const altri = AMBIENTI_CARRELLATA.filter((a) => a.slug !== ambiente.slug);

  return (
    <div>
      {/* avviso bozza: la pagina vera resta quella canonica */}
      <div className="bg-[var(--tbh-neon)] text-black">
        <div className="mx-auto max-w-[1500px] px-4 md:px-8 py-2.5 flex flex-wrap items-center gap-x-4 gap-y-1">
          <span className="text-[11px] font-bold uppercase tracking-[0.2em]">
            Bozza · Ambiente {ambiente.numero}
          </span>
          <span className="text-[13px] font-medium">
            Anteprima della mini-homepage. Il sito attuale non è stato toccato.
          </span>
          <Link
            to="/check-web"
            className="text-[12px] font-bold underline underline-offset-2 ml-auto inline-flex items-center gap-1"
          >
            <ArrowLeft size={13} /> Home 0
          </Link>
        </div>
      </div>

      <HeroSezione
        occhiello={`Canale ${ambiente.numero} · ${ambiente.categoria}`}
        titolo={ambiente.nome}
        sottotitolo={ambiente.claim}
        testo="Tutti i pulsanti qui sotto aprono pagine che esistono già: stesso indirizzo, stesso contenuto, stesso logo. Questa pagina riordina, non duplica."
        colore={ambiente.colore}
        azioni={[
          { label: "Apri la pagina principale", to: ambiente.to, primaria: true },
          { label: "Scrivici su WhatsApp", href: waInfo(`ambiente ${ambiente.nome}`) },
        ]}
      />

      {/* i pulsanti dell'ambiente: categoria sopra, nome per esteso sotto */}
      <section className="mx-auto max-w-[1500px] px-4 md:px-8 py-10">
        <div className="mb-5">
          <p className="text-[10px] uppercase tracking-[0.25em] text-[var(--tbh-gold)]">
            {ambiente.pulsanti.length} destinazioni
          </p>
          <h2 className="tbh-display tbh-h2 leading-tight">TUTTO QUELLO CHE C&apos;È QUI</h2>
        </div>
        <GrigliaPulsanti pulsanti={ambiente.pulsanti} />
      </section>

      {/* passaggio agli altri ambienti: si fa zapping senza tornare indietro */}
      <section className="mx-auto max-w-[1500px] px-4 md:px-8 py-10">
        <div className="mb-4">
          <p className="text-[10px] uppercase tracking-[0.25em] text-[var(--tbh-gold)]">
            Cambia ambiente
          </p>
          <h2 className="tbh-display tbh-h2 leading-tight">GLI ALTRI CANALI</h2>
        </div>
        <div
          className="grid gap-3"
          style={{ gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 220px), 1fr))" }}
        >
          {altri.map((a) => (
            <Link
              key={a.slug}
              to={`/check-web/c/${a.slug}`}
              className="tbh-card px-4 py-3 flex flex-col gap-1 hover:-translate-y-0.5 transition-transform"
              style={{ borderColor: a.colore }}
            >
              <span className="text-[10px] uppercase tracking-[0.18em] text-[var(--tbh-muted)]">
                {a.categoria}
              </span>
              <span className="tbh-display text-[15px] leading-tight">
                {a.numero} · {a.nome}
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-[1500px] px-4 md:px-8 pb-12">
        <div className="tbh-card p-6 md:p-8 flex flex-wrap items-center gap-4 justify-between">
          <div className="min-w-0">
            <h3 className="tbh-display text-xl">Non trovi quello che cerchi?</h3>
            <p className="tbh-body text-sm text-[var(--tbh-muted)] mt-1">
              La mappa del sito elenca ogni pagina esistente, ambiente per ambiente.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 shrink-0">
            <Link to="/mappa-sito" className="tbh-neon-btn px-5 py-2.5 text-sm">
              Mappa del sito
            </Link>
            <a
              href={waInfo("informazioni TBH-WEB")}
              target="_blank"
              rel="noreferrer"
              className="px-5 py-2.5 rounded-full border border-[var(--tbh-line)] font-semibold text-sm hover:border-[var(--tbh-neon)] inline-flex items-center gap-2"
            >
              WhatsApp <ExternalLink size={14} />
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
