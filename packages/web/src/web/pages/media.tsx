import { Link } from "wouter";
import { Radio, Tv, Newspaper, Rss, ExternalLink } from "lucide-react";
import { useMedia } from "../queries/rete";

type Voce = { nome: string; sito: string | null; nota: string | null };

function Blocco({
  titolo,
  icona,
  items,
}: {
  titolo: string;
  icona: React.ReactNode;
  items: Voce[];
}) {
  return (
    <section className="mb-14">
      <h2 className="tbh-display tbh-h2 mb-6 flex items-center gap-3">
        <span className="text-[var(--tbh-neon)]">{icona}</span> {titolo}
      </h2>
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {items.map((v) => {
          const body = (
            <>
              <div className="h-24 w-full rounded-xl bg-white grid place-items-center overflow-hidden p-3 mb-4">
                <span className="tbh-display text-3xl text-black/80 text-center px-2">{v.nome}</span>
              </div>
              <h3 className="tbh-display text-xl leading-tight">{v.nome}</h3>
              {v.nota && <p className="text-sm text-[var(--tbh-muted)] mt-2">{v.nota}</p>}
              <span
                className={`mt-3 inline-flex items-center gap-2 text-sm font-semibold ${
                  v.sito ? "text-[var(--tbh-neon)]" : "text-[var(--tbh-muted)]"
                }`}
              >
                {v.sito ? (
                  <>
                    Apri <ExternalLink size={14} />
                  </>
                ) : (
                  "In allestimento"
                )}
              </span>
            </>
          );
          return v.sito ? (
            <a
              key={v.nome}
              href={v.sito}
              target="_blank"
              rel="noreferrer"
              className="tbh-card p-5 hover:border-[var(--tbh-neon)] transition"
            >
              {body}
            </a>
          ) : (
            <Link key={v.nome} to="/in-allestimento" className="tbh-card p-5 hover:border-[var(--tbh-neon)] transition block">
              {body}
            </Link>
          );
        })}
      </div>
    </section>
  );
}

export default function MediaPage() {
  const q = useMedia();
  const d = q.data;

  return (
    <div className="mx-auto max-w-[1500px] px-4 md:px-8 py-10">
      <header className="tbh-rise mb-10">
        <p className="text-xs tracking-[0.25em] text-[var(--tbh-gold)] uppercase mb-2">
          Radio · TV · TG · Riviste
        </p>
        <h1 className="tbh-display tbh-h1">Spazi media</h1>
        <p className="tbh-body text-[var(--tbh-muted)] max-w-3xl mt-3">
          Solo fonti in chiaro e link ufficiali. I canali del gruppo — Touch TV, Touch Music TV,
          Touch Music Radio — sono in allestimento: quando aprono, li trovi qui.
        </p>
      </header>

      <Blocco titolo="Radio" icona={<Radio />} items={d?.radio ?? []} />
      <Blocco titolo="TV e streaming in chiaro" icona={<Tv />} items={d?.tv ?? []} />
      <Blocco titolo="Telegiornali e agenzie" icona={<Rss />} items={d?.tg ?? []} />
      <Blocco titolo="Riviste ed edicola" icona={<Newspaper />} items={d?.riviste ?? []} />
    </div>
  );
}
