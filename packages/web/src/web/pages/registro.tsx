import { useState } from "react";
import { Link } from "wouter";
import { Search, MessageCircle, ExternalLink, Link2 } from "lucide-react";
import { useRegistro } from "../queries/registro";
import { LogoBox } from "../components/tiles";
import { waInfo } from "../lib/whatsapp";

export default function RegistroPage() {
  const [q, setQ] = useState("");
  const [qualifica, setQualifica] = useState("tutte");
  const [soloDoppioni, setSoloDoppioni] = useState(false);
  const query = useRegistro({ q, qualifica, soloDoppioni });
  const d = query.data;

  return (
    <div className="mx-auto max-w-[1500px] px-4 md:px-8 py-10">
      <header className="tbh-rise mb-8">
        <p className="text-xs tracking-[0.25em] text-[var(--tbh-gold)] uppercase mb-2">
          Punto 02 della Master List
        </p>
        <h1 className="tbh-display tbh-h1">Registro unico delle entità</h1>
        <p className="tbh-body text-[var(--tbh-muted)] max-w-3xl mt-3">
          Crea una volta, collega ovunque. Ogni società, attività, prodotto, squadra, luogo,
          prospect, partner e programma ha un solo record: se compariva in più elenchi, qui è
          una sola scheda con più qualifiche e tutte le pagine dove è pubblicata.
        </p>
        {d && (
          <div className="flex flex-wrap gap-3 mt-5">
            <span className="tbh-card px-4 py-2 text-sm">
              <b className="text-[var(--tbh-neon)]">{d.totale}</b> entità nel registro
            </span>
            <span className="tbh-card px-4 py-2 text-sm">
              <b className="text-[var(--tbh-gold)]">{d.collegate}</b> doppioni risolti (stessa
              entità in più anagrafiche)
            </span>
            <span className="tbh-card px-4 py-2 text-sm">
              <b>{d.trovati}</b> risultati con i filtri attuali
            </span>
          </div>
        )}
      </header>

      <div className="tbh-card p-4 md:p-5 mb-8 flex flex-col gap-4">
        <div className="flex items-center gap-3 rounded-full border border-[var(--tbh-line)] px-4 py-2.5">
          <Search size={18} className="text-[var(--tbh-muted)]" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Cerca per nome, settore, città, codice TBH o P.IVA…"
            aria-label="Cerca nel registro per nome, settore, città, codice TBH o P.IVA"
            className="bg-transparent outline-none w-full text-base"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setQualifica("tutte")}
            className={`px-4 py-2 rounded-full text-sm border transition ${
              qualifica === "tutte"
                ? "border-[var(--tbh-neon)] text-[var(--tbh-neon)]"
                : "border-[var(--tbh-line)] text-[var(--tbh-muted)] hover:border-[var(--tbh-gold)]"
            }`}
          >
            Tutte
          </button>
          {d?.qualifiche.map((qf) => (
            <button
              key={qf.id}
              onClick={() => setQualifica(qf.id)}
              className={`px-4 py-2 rounded-full text-sm border transition ${
                qualifica === qf.id
                  ? "border-[var(--tbh-neon)] text-[var(--tbh-neon)]"
                  : "border-[var(--tbh-line)] text-[var(--tbh-muted)] hover:border-[var(--tbh-gold)]"
              }`}
            >
              {qf.label} <span className="opacity-60">({qf.n})</span>
            </button>
          ))}
        </div>

        <label className="flex items-center gap-3 text-sm text-[var(--tbh-muted)] cursor-pointer">
          <input
            type="checkbox"
            checked={soloDoppioni}
            onChange={(e) => setSoloDoppioni(e.target.checked)}
            aria-label="Mostra solo le entità collegate a più anagrafiche"
            className="size-4 accent-[var(--tbh-neon)]"
          />
          Mostra solo le entità collegate a più anagrafiche (doppioni risolti)
        </label>
      </div>

      {query.isLoading && (
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="tbh-card h-72 animate-pulse" />
          ))}
        </div>
      )}

      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {d?.items.map((e) => (
          <article key={e.id} className="tbh-card overflow-hidden p-4 flex flex-col">
            <LogoBox name={e.nome} logo={e.logo} size="lg" url={e.sito} />

            <div className="pt-4 flex flex-col gap-2 grow">
              <span className="text-[11px] tracking-[0.18em] text-[var(--tbh-gold)] uppercase">
                {e.codiceTBH ? `${e.codiceTBH} · ` : ""}ID {e.id}
              </span>
              {/* 05/09/2026 — il nome apre la scheda completa dell'entità: il registro è
                  l'indice unico da cui ogni scheda /e/<id> è raggiungibile. */}
              <h2 className="tbh-display tbh-h3">
                <Link to={`/e/${e.id}`} className="hover:text-[var(--tbh-neon)]">
                  {e.nome}
                </Link>
              </h2>

              <div className="flex flex-wrap gap-1.5">
                {e.qualifiche.map((qf) => (
                  <span
                    key={qf}
                    className="text-[11px] px-2.5 py-1 rounded-full border border-[var(--tbh-line)] text-[var(--tbh-muted)]"
                  >
                    {d.labels[qf] ?? qf}
                  </span>
                ))}
              </div>

              {e.settore && <p className="text-sm text-[var(--tbh-muted)]">{e.settore}</p>}
              {e.citta && <p className="text-sm text-[var(--tbh-muted)]">{e.citta}</p>}
              <p className="text-xs text-[var(--tbh-muted)]">
                {e.piva ? `P.IVA ${e.piva}` : "P.IVA non applicabile o da verificare"}
              </p>

              {e.note.slice(0, 2).map((n) => (
                <p key={n} className="text-xs text-[var(--tbh-muted)] leading-relaxed">
                  {n}
                </p>
              ))}

              {e.fonti.length > 1 && (
                <p className="text-xs text-[var(--tbh-neon)] flex items-start gap-1.5">
                  <Link2 size={14} className="mt-0.5 shrink-0" />
                  Collegata a {e.fonti.length} anagrafiche: {e.fonti.join(" · ")}
                </p>
              )}
            </div>

            <div className="pt-4 flex flex-wrap gap-2">
              {e.pagine.map((p) => (
                <Link
                  key={p.href}
                  to={p.href}
                  className="text-xs px-3 py-1.5 rounded-full border border-[var(--tbh-line)] hover:border-[var(--tbh-neon)] text-[var(--tbh-neon)]"
                >
                  {p.label} →
                </Link>
              ))}
              {e.sito && (
                <a
                  href={e.sito}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs px-3 py-1.5 rounded-full border border-[var(--tbh-line)] hover:border-[var(--tbh-gold)] text-[var(--tbh-gold)] inline-flex items-center gap-1.5"
                >
                  <ExternalLink size={12} /> Sito ufficiale
                </a>
              )}
              <a
                href={waInfo(e.nome)}
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

      {d && d.trovati === 0 && (
        <div className="tbh-card p-8 text-center text-[var(--tbh-muted)]">
          Nessuna entità con questi filtri. Prova a cambiare qualifica o a svuotare la ricerca.
        </div>
      )}

      {d && (
        <p className="text-xs text-[var(--tbh-muted)] mt-10 max-w-4xl leading-relaxed">{d.nota}</p>
      )}
    </div>
  );
}
