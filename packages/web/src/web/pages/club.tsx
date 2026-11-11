import { Link } from "wouter";
import { ArrowRight, MessageCircle, ShieldCheck } from "lucide-react";
import { useAdesioni } from "../queries/ecosistema";
import { useLivelli } from "../queries/tbh";
import { euro } from "../components/tiles";
import { waInfo } from "../lib/whatsapp";

/**
 * FASE 4 — TBH CLUB & CIRCUITO (brief punto 11).
 * Prezzi definitivi confermati da Claudio: € 72/anno · € 91,50 una tantum · € 915 una tantum.
 * Nessuna promessa di guadagno, rendimento o ritorno economico.
 */
export default function ClubPage() {
  const q = useAdesioni();
  const livelli = useLivelli();
  const items = q.data?.adesioni ?? [];

  return (
    <div className="mx-auto max-w-[1500px] px-4 md:px-8 py-10">
      <h1 className="tbh-display tbh-h1">TBH Club & Circuito</h1>
      <p className="tbh-body text-[var(--tbh-muted)] mt-3 max-w-3xl">
        Tre modi di entrare nell'ecosistema: il Club per le persone, l'ingresso per chi ha partita
        IVA o lavora come ambulante, il Circuito per attività, aziende e strutture.
      </p>

      <div className="grid gap-5 lg:grid-cols-3 mt-8">
        {items.map((a) => (
          <div key={a.slug} className="tbh-card p-6 md:p-7 flex flex-col">
            <span className="text-[11px] uppercase tracking-[0.2em] text-[var(--tbh-gold)]">
              {a.destinatario}
            </span>
            <h2 className="tbh-display text-3xl mt-2">{a.titolo}</h2>
            <div className="tbh-display text-4xl text-[var(--tbh-neon)] mt-4">{a.prezzoLabel}</div>
            <div className="text-xs text-[var(--tbh-muted)] mt-1">
              {a.cadenza} · {euro(a.prezzoCents)}
              {a.ricorrente ? " ogni anno" : " una sola volta"}
            </div>

            <ul className="text-sm text-[var(--tbh-muted)] mt-5 space-y-2 grow">
              {a.incluso.map((i) => (
                <li key={i} className="flex gap-2">
                  <ShieldCheck size={16} className="text-[var(--tbh-neon)] shrink-0 mt-0.5" />
                  <span>{i}</span>
                </li>
              ))}
            </ul>

            {a.nota && <p className="text-[11px] text-[var(--tbh-muted)] mt-4">{a.nota}</p>}

            <div className="flex flex-wrap gap-2 mt-5">
              <a
                href={waInfo(`adesione ${a.titolo} (${a.prezzoLabel})`)}
                target="_blank"
                rel="noreferrer"
                className="tbh-neon-btn px-5 py-3 inline-flex items-center gap-2"
              >
                <MessageCircle size={17} /> Aderisci
              </a>
              <Link
                to="/pagamenti"
                className="px-5 py-3 rounded-full border border-[var(--tbh-line)] font-semibold hover:border-[var(--tbh-neon)]"
              >
                Come si paga
              </Link>
            </div>
          </div>
        ))}
      </div>

      <p className="text-sm text-[var(--tbh-muted)] mt-6 max-w-4xl">{q.data?.nota}</p>

      {/* 25 Livelli: ogni livello ha la sua pagina, prezzi ancora da definire */}
      <section className="mt-14">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="tbh-display tbh-h2">I 25 Livelli TBH</h2>
            <p className="text-[var(--tbh-muted)] mt-1">
              Ogni livello ha la sua pagina. Prezzi, benefit, bonus e cashback restano «da definire»
              finché non vengono forniti: nessun importo inventato.
            </p>
          </div>
          <Link to="/tbh/livelli" className="text-[var(--tbh-neon)] font-semibold inline-flex items-center gap-2">
            Area livelli <ArrowRight size={18} />
          </Link>
        </div>

        <div className="grid gap-3 grid-cols-2 md:grid-cols-4 xl:grid-cols-5 mt-6">
          {(livelli.data?.livelli ?? []).map((l) => (
            <Link
              key={l.numero}
              to={`/tbh/livelli/${l.numero}-${l.nome
                .toLowerCase()
                .normalize("NFD")
                .replace(/[^a-z0-9]+/g, "-")
                .replace(/(^-|-$)/g, "")}`}
              className="rounded-2xl border border-[var(--tbh-line)] p-4 hover:border-[var(--tbh-neon)] transition"
            >
              <div className="text-[11px] text-[var(--tbh-gold)] uppercase tracking-wider">
                Livello {l.numero}
              </div>
              <div className="tbh-display text-xl leading-tight mt-1">{l.nome}</div>
              <div className="text-[11px] text-[var(--tbh-muted)] mt-1">{l.fascia}</div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
