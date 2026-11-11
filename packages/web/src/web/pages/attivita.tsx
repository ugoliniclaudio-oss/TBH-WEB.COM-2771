import { Link } from "wouter";
import { MessageCircle, AlertTriangle } from "lucide-react";
import { useEntita } from "../queries/tbh";
import { LogoBox } from "../components/tiles";
import { waInfo } from "../lib/whatsapp";

const BRAND_PATH: Record<string, string> = {
  "touch-fashion": "/tbh/touch-fashion",
  "miss-cool": "/eventi/miss-cool",
  "reality-show": "/media/reality-show",
  "heddy-video": "/media/heddy-video",
};

export default function AttivitaPage() {
  const q = useEntita();
  const d = q.data;

  return (
    <div className="mx-auto max-w-[1500px] px-4 md:px-8 py-10">
      <header className="tbh-rise mb-8">
        <p className="text-xs tracking-[0.25em] text-[var(--tbh-gold)] uppercase mb-2">
          Punti 03 e 04 della Master List
        </p>
        <h1 className="tbh-display tbh-h1">Attività del gruppo (senza P.IVA propria)</h1>
        <p className="tbh-body text-[var(--tbh-muted)] max-w-3xl mt-3">
          Area separata dalle società: qui stanno le attività e i progetti del gruppo. Le società
          con partita IVA restano nella loro pagina e non vengono mischiate.
        </p>
        <div className="flex flex-wrap gap-3 mt-5">
          <Link
            to="/tbh/societa"
            className="tbh-neon-btn px-5 py-2.5 text-sm inline-flex items-center gap-2"
          >
            Vai alle società con P.IVA →
          </Link>
          <Link
            to="/tbh/registro"
            className="px-5 py-2.5 text-sm rounded-full border border-[var(--tbh-line)] hover:border-[var(--tbh-gold)] text-[var(--tbh-gold)]"
          >
            Registro unico entità
          </Link>
        </div>
      </header>

      {d && (
        <div className="tbh-card p-5 mb-10 flex gap-3 items-start">
          <AlertTriangle size={18} className="text-[var(--tbh-gold)] mt-0.5 shrink-0" />
          <p className="text-sm text-[var(--tbh-muted)] leading-relaxed">{d.disclaimer}</p>
        </div>
      )}

      {q.isLoading && (
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="tbh-card h-72 animate-pulse" />
          ))}
        </div>
      )}

      {d && (
        <>
          <section className="mb-14">
            <h2 className="tbh-display tbh-h2 mb-2">
              Attività con codice TBH ({d.attivitaConCodice.length})
            </h2>
            <p className="text-sm text-[var(--tbh-muted)] mb-6">
              Già censite in anagrafica di gruppo: codice assegnato, nessuna partita IVA propria.
            </p>
            <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {d.attivitaConCodice.map((a) => (
                <article key={a.code} className="tbh-card overflow-hidden p-4 flex flex-col">
                  <LogoBox name={a.name} logo={a.logo} size="lg" url={a.site} />
                  <div className="pt-4 flex flex-col gap-2 grow">
                    <span className="text-[11px] tracking-[0.18em] text-[var(--tbh-gold)] uppercase">
                      {a.code} · Attività del gruppo
                    </span>
                    <h3 className="tbh-display tbh-h3">{a.name}</h3>
                    <p className="text-sm text-[var(--tbh-muted)]">{a.sector}</p>
                    <p className="text-xs text-[var(--tbh-muted)]">Senza P.IVA propria</p>
                  </div>
                  <div className="pt-4 flex flex-wrap gap-2">
                    {a.site && (
                      <a
                        href={a.site}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs px-3 py-1.5 rounded-full border border-[var(--tbh-line)] hover:border-[var(--tbh-gold)] text-[var(--tbh-gold)]"
                      >
                        Sito ufficiale
                      </a>
                    )}
                    <a
                      href={waInfo(a.name)}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs px-3 py-1.5 rounded-full border border-[var(--tbh-line)] hover:border-[var(--tbh-neon)] inline-flex items-center gap-1.5"
                    >
                      <MessageCircle size={12} /> Informazioni
                    </a>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="mb-14">
            <h2 className="tbh-display tbh-h2 mb-2">
              Attività e progetti citati nel Master ({d.attivitaExtra.length})
            </h2>
            <p className="text-sm text-[var(--tbh-muted)] mb-6">
              Presenti nel documento madre ma senza codice TBH comunicato: il codice resta vuoto
              finché non lo assegna Claudio. Nessun dato fiscale inventato.
            </p>
            <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {d.attivitaExtra.map((a) => (
                <article key={a.slug} className="tbh-card p-5 flex flex-col gap-2">
                  <span className="text-[11px] tracking-[0.18em] text-[var(--tbh-gold)] uppercase">
                    {a.codiceTBH ?? "Codice TBH da assegnare"} ·{" "}
                    {a.stato === "verificato"
                      ? "Verificato"
                      : a.stato === "da-verificare"
                        ? "Da verificare"
                        : "In allestimento"}
                  </span>
                  <h3 className="tbh-display tbh-h3">{a.nome}</h3>
                  <p className="text-xs tracking-wide text-[var(--tbh-neon)] uppercase">
                    {a.ambito}
                  </p>
                  <p className="text-sm text-[var(--tbh-muted)] leading-relaxed">{a.descrizione}</p>
                  <div className="pt-2 flex flex-wrap gap-2">
                    {a.pagina && (
                      <Link
                        to={a.pagina}
                        className="text-xs px-3 py-1.5 rounded-full border border-[var(--tbh-line)] hover:border-[var(--tbh-neon)] text-[var(--tbh-neon)]"
                      >
                        Dove compare →
                      </Link>
                    )}
                    <a
                      href={waInfo(a.nome)}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs px-3 py-1.5 rounded-full border border-[var(--tbh-line)] hover:border-[var(--tbh-neon)] inline-flex items-center gap-1.5"
                    >
                      <MessageCircle size={12} /> Informazioni
                    </a>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section>
            <h2 className="tbh-display tbh-h2 mb-2">Attività con pagina dedicata</h2>
            <p className="text-sm text-[var(--tbh-muted)] mb-6">
              Ogni attività che ha già uno spazio proprio nel portale.
            </p>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {d.brand.map((b) => (
                <Link
                  key={b.slug}
                  to={BRAND_PATH[b.slug] ?? "/in-allestimento"}
                  className="tbh-card p-5 block hover:border-[var(--tbh-neon)] transition"
                >
                  <h3 className="tbh-display tbh-h3">{b.name}</h3>
                  <p className="text-xs tracking-wide text-[var(--tbh-gold)] uppercase mt-1">
                    {b.claim}
                  </p>
                  <p className="text-sm text-[var(--tbh-muted)] mt-3">{b.descrizione}</p>
                  <span className="mt-4 inline-block text-sm font-semibold text-[var(--tbh-neon)]">
                    Apri la pagina →
                  </span>
                </Link>
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
