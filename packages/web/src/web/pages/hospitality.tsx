import { Link } from "wouter";
import { ArrowRight, ExternalLink, MessageCircle } from "lucide-react";
import { useHospitality } from "../queries/ecosistema";
import { EntitaTile } from "../components/vetrina";
import { waInfo } from "../lib/whatsapp";

/**
 * FASE 5 — TBH HOSPITALITY (brief punto 09).
 * Strutture reali dal registro unico: nessuna disponibilità, tariffa o foto inventata.
 * Prenotazione assistita aperta anche a chi non è nel Circuito.
 */
export default function HospitalityPage({ categoria }: { categoria?: string }) {
  const q = useHospitality(categoria);
  const d = q.data;

  return (
    <div className="mx-auto max-w-[1500px] px-4 md:px-8 py-10">
      <h1 className="tbh-display tbh-h1" style={{ color: "#33e0ff" }}>
        TBH Hospitality
      </h1>
      <p className="tbh-body text-[var(--tbh-muted)] mt-3 max-w-3xl">
        Hotel, ristoranti, locali, esperienze, eventi e transfer presenti nel portale, con
        prenotazione assistita seguita dall'assistenza TBH.
      </p>

      <div className="flex flex-wrap gap-2 mt-6">
        <Link
          to="/hospitality"
          className={`px-4 py-2 rounded-full border text-sm font-semibold ${
            categoria ? "border-[var(--tbh-line)]" : "border-[var(--tbh-neon)] text-[var(--tbh-neon)]"
          }`}
        >
          Tutte le categorie
        </Link>
        {(d?.categorie ?? []).map((c) => (
          <Link
            key={c.slug}
            to={`/hospitality/${c.slug}`}
            className={`px-4 py-2 rounded-full border text-sm font-semibold ${
              categoria === c.slug
                ? "border-[var(--tbh-neon)] text-[var(--tbh-neon)]"
                : "border-[var(--tbh-line)] hover:border-[var(--tbh-neon)]"
            }`}
          >
            {c.label} <span className="text-[var(--tbh-muted)]">({c.n})</span>
          </Link>
        ))}
      </div>

      {d?.categoria && (
        <div className="tbh-card p-5 mt-6">
          <h2 className="tbh-display text-2xl">{d.categoria.label}</h2>
          <p className="text-sm text-[var(--tbh-muted)] mt-1">{d.categoria.descrizione}</p>
        </div>
      )}

      <div className="grid gap-4 grid-cols-2 md:grid-cols-4 xl:grid-cols-6 mt-7">
        {(d?.items ?? []).map((e) => (
          <EntitaTile
            key={e.id}
            e={{ id: e.id, nome: e.nome, logo: e.logo, settore: e.settore, citta: e.citta }}
          />
        ))}
      </div>

      {(d?.items ?? []).length === 0 && !q.isLoading && (
        <p className="text-sm text-[var(--tbh-muted)] mt-6">
          Nessuna struttura confermata in questa categoria: sezione in allestimento.
        </p>
      )}

      {/* Struttura in evidenza con pagina propria (materiale ufficiale ricevuto). */}
      <section className="tbh-card p-6 md:p-8 mt-10 grid gap-6 lg:grid-cols-[1fr_1.2fr] items-center">
        <div>
          <p className="text-[11px] uppercase tracking-[0.25em] text-[var(--tbh-gold)] mb-2">
            Struttura in evidenza
          </p>
          <h2 className="tbh-display tbh-h2" style={{ color: "#33e0ff" }}>
            Hotel Aurora
          </h2>
          <p className="tbh-body text-[var(--tbh-muted)] mt-2">
            Family Hotel a Misano Adriatico (RN), con l&apos;AgriBus Experience: servizio navetta
            verso la Tenuta Due Tigli, tra natura, tradizioni e prodotti del territorio.
          </p>
          <Link
            to="/hotel-aurora"
            className="px-5 py-3 rounded-full border border-[var(--tbh-line)] font-semibold hover:border-[#33e0ff] inline-flex items-center gap-2 mt-5"
          >
            Apri la pagina Hotel Aurora <ArrowRight size={16} />
          </Link>
        </div>
        <Link to="/hotel-aurora" className="block overflow-hidden rounded-xl border border-[var(--tbh-line)] hover:border-[#33e0ff] transition">
          <img
            src="/hotel-aurora/01-agribus-experience.jpg"
            alt="Hotel Aurora — AgriBus Experience, dal mare alla campagna"
            loading="lazy"
            className="w-full h-auto block"
          />
        </Link>
      </section>

      <section className="tbh-card p-6 md:p-8 mt-10">
        <h2 className="tbh-display tbh-h2">Come si prenota</h2>
        <ul className="text-sm text-[var(--tbh-muted)] mt-3 space-y-2">
          {(d?.azioni ?? []).map((a) => (
            <li key={a} className="flex gap-2">
              <ArrowRight size={16} className="text-[var(--tbh-neon)] shrink-0 mt-0.5" />
              <span>{a}</span>
            </li>
          ))}
        </ul>
        <div className="flex flex-wrap gap-3 mt-5">
          <a
            href={waInfo("prenotazione assistita TBH Hospitality")}
            target="_blank"
            rel="noreferrer"
            className="tbh-neon-btn px-5 py-3 inline-flex items-center gap-2"
          >
            <MessageCircle size={18} /> Richiedi prenotazione assistita
          </a>
          <Link
            to="/tbh-assist"
            className="px-5 py-3 rounded-full border border-[var(--tbh-line)] font-semibold hover:border-[var(--tbh-neon)] inline-flex items-center gap-2"
          >
            TBH Assist <ExternalLink size={16} />
          </Link>
        </div>
        <p className="text-[12px] text-[var(--tbh-muted)] mt-5">{d?.nota}</p>
      </section>
    </div>
  );
}
