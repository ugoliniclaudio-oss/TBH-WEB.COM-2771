import { ExternalLink, Info } from "lucide-react";
import { useStreaming } from "../queries/tbh";

function Riga({ nome, sito, nota }: { nome: string; sito: string | null; nota: string | null }) {
  return (
    <li className="border-t border-[var(--tbh-line)] pt-3 first:border-0 first:pt-0">
      {sito ? (
        <a
          href={sito}
          target="_blank"
          rel="noreferrer"
          className="font-semibold text-[var(--tbh-neon)] inline-flex items-start gap-2"
        >
          {nome} <ExternalLink size={14} className="mt-1 shrink-0" />
        </a>
      ) : (
        <p className="font-semibold">{nome}</p>
      )}
      {nota && <p className="text-sm text-[var(--tbh-muted)] mt-1">{nota}</p>}
    </li>
  );
}

export default function StreamingPage() {
  const q = useStreaming();

  return (
    <div className="mx-auto max-w-[1400px] px-4 md:px-8 py-10">
      <header className="tbh-rise mb-6">
        <p className="text-xs tracking-[0.25em] text-[var(--tbh-gold)] uppercase mb-2">
          Solo piattaforme e canali ufficiali
        </p>
        <h1 className="tbh-display tbh-h1">Streaming TV &amp; Radio</h1>
        <p className="tbh-body text-[var(--tbh-muted)] max-w-3xl mt-3">
          Link ufficiali e legali. I canali del gruppo (Touch TV, Touch Music TV, Touch Music
          Radio) restano «in allestimento» finché non sono online davvero.
        </p>
      </header>

      {q.isLoading && (
        <div className="grid gap-5 md:grid-cols-2">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="tbh-card h-64 animate-pulse" />
          ))}
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {q.data && (
          <>
            <section className="tbh-card p-5">
              <h2 className="tbh-display text-2xl mb-4">TV &amp; piattaforme</h2>
              <ul className="space-y-4">
                {q.data.tv.map((t) => (
                  <Riga key={t.nome} nome={t.nome} sito={t.sito} nota={t.nota} />
                ))}
              </ul>
            </section>
            <section className="tbh-card p-5">
              <h2 className="tbh-display text-2xl mb-4">Radio partner</h2>
              <ul className="space-y-4">
                {q.data.radio.map((r) => (
                  <Riga key={r.nome} nome={r.nome} sito={r.sito} nota={r.nota} />
                ))}
              </ul>
            </section>
          </>
        )}
      </div>

      {q.data && (
        <div className="tbh-card p-5 mt-8 flex gap-3 items-start">
          <Info className="text-[var(--tbh-gold)] shrink-0" size={20} />
          <p className="text-sm text-[var(--tbh-muted)]">
            <strong>{q.data.spotAVista.nome}</strong> — {q.data.spotAVista.descrizione}{" "}
            {q.data.spotAVista.url ? (
              <a
                href={q.data.spotAVista.url}
                target="_blank"
                rel="noreferrer"
                className="text-[var(--tbh-neon)] font-semibold"
              >
                Apri la playlist
              </a>
            ) : (
              "URL della playlist YouTube da fornire: senza quello non pubblichiamo un link."
            )}
          </p>
        </div>
      )}
    </div>
  );
}
