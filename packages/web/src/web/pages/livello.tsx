import { Link } from "wouter";
import { ArrowLeft, MessageCircle } from "lucide-react";
import { useLivelli } from "../queries/tbh";
import { euro } from "../components/tiles";
import { waLivello } from "../lib/whatsapp";

/** Slug stabile del livello: "12-hospitality". */
export function slugLivello(numero: number, nome: string) {
  return `${numero}-${nome
    .toLowerCase()
    .normalize("NFD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")}`;
}

/**
 * FASE 4 — Pagina del singolo Livello TBH (uno per ciascuno dei 25).
 * Prezzi e benefit restano «da definire» finché Claudio non li fornisce: nessun importo inventato.
 */
export default function LivelloPage({ slug }: { slug: string }) {
  const q = useLivelli();
  const livelli = q.data?.livelli ?? [];
  const l = livelli.find((x) => slugLivello(x.numero, x.nome) === slug) ?? null;

  if (q.isLoading)
    return (
      <div className="mx-auto max-w-[1500px] px-4 md:px-8 py-16">
        <div className="tbh-card h-80 animate-pulse" />
      </div>
    );

  if (!l)
    return (
      <div className="mx-auto max-w-[1500px] px-4 md:px-8 py-16">
        <h1 className="tbh-display tbh-h1">Livello non trovato</h1>
        <Link to="/tbh/livelli" className="tbh-neon-btn px-6 py-3 mt-6 inline-flex items-center gap-2">
          <ArrowLeft size={18} /> Tutti i 25 Livelli
        </Link>
      </div>
    );

  const prezzo = (v: number | null) => (v == null ? "Da definire" : euro(v));
  const idx = livelli.findIndex((x) => x.numero === l.numero);
  const prec = idx > 0 ? livelli[idx - 1] : null;
  const succ = idx < livelli.length - 1 ? livelli[idx + 1] : null;

  return (
    <div className="mx-auto max-w-[1500px] px-4 md:px-8 py-10">
      <Link to="/tbh/livelli" className="text-sm text-[var(--tbh-muted)] inline-flex items-center gap-2">
        <ArrowLeft size={16} /> Area 25 Livelli
      </Link>

      <div className="tbh-card p-6 md:p-10 mt-5">
        <span className="text-[11px] uppercase tracking-[0.25em] text-[var(--tbh-gold)]">
          Fascia {l.fascia}
        </span>
        <h1 className="tbh-display tbh-h1 mt-2">
          Livello {l.numero} · {l.nome}
        </h1>

        <div className="grid gap-4 sm:grid-cols-2 mt-7">
          <div className="rounded-2xl border border-[var(--tbh-line)] p-5">
            <div className="text-xs uppercase tracking-wider text-[var(--tbh-muted)]">
              Quota pubblica
            </div>
            <div className="tbh-display text-3xl text-[var(--tbh-neon)] mt-1">
              {prezzo(l.prezzoPubblicoCents)}
            </div>
          </div>
          <div className="rounded-2xl border border-[var(--tbh-line)] p-5">
            <div className="text-xs uppercase tracking-wider text-[var(--tbh-muted)]">
              Quota riservata Circuito TBH
            </div>
            <div className="tbh-display text-3xl text-[var(--tbh-gold)] mt-1">
              {prezzo(l.prezzoCircuitoCents)}
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-[var(--tbh-line)] p-5 mt-5">
          <h2 className="tbh-display text-xl">Benefit del livello</h2>
          {l.benefit.length > 0 ? (
            <ul className="text-sm text-[var(--tbh-muted)] mt-2 space-y-1">
              {l.benefit.map((b) => (
                <li key={b}>· {b}</li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-[var(--tbh-muted)] mt-2">
              Benefit, bonus e cashback di questo livello: da definire. Non pubblichiamo vantaggi non
              confermati e non promettiamo alcun ritorno economico.
            </p>
          )}
        </div>

        <div className="flex flex-wrap gap-3 mt-7">
          <a
            href={waLivello(l.numero, l.nome)}
            target="_blank"
            rel="noreferrer"
            className="tbh-neon-btn px-5 py-3 inline-flex items-center gap-2"
          >
            <MessageCircle size={18} /> Chiedi informazioni sul livello
          </a>
          <Link
            to="/club"
            className="px-5 py-3 rounded-full border border-[var(--tbh-line)] font-semibold hover:border-[var(--tbh-neon)]"
          >
            Club e Circuito
          </Link>
        </div>
      </div>

      <div className="flex flex-wrap justify-between gap-3 mt-6">
        {prec ? (
          <Link
            to={`/tbh/livelli/${slugLivello(prec.numero, prec.nome)}`}
            className="px-5 py-3 rounded-full border border-[var(--tbh-line)] font-semibold hover:border-[var(--tbh-neon)]"
          >
            ← Livello {prec.numero} · {prec.nome}
          </Link>
        ) : (
          <span />
        )}
        {succ && (
          <Link
            to={`/tbh/livelli/${slugLivello(succ.numero, succ.nome)}`}
            className="px-5 py-3 rounded-full border border-[var(--tbh-line)] font-semibold hover:border-[var(--tbh-neon)]"
          >
            Livello {succ.numero} · {succ.nome} →
          </Link>
        )}
      </div>
    </div>
  );
}
