import { Link } from "wouter";
import { ArrowRight, Tag, Ticket } from "lucide-react";
import { usePromo } from "../queries/ecosistema";
import { BannerSlot } from "../components/vetrina";
import { euro } from "../components/tiles";

/**
 * FASE 6 — OFFERTE PERIODICHE, BANNER PROGRAMMABILI E CODICI PROMOZIONALI
 * (brief punti 19-22). Il motore è completo e in funzione, ma NON contiene sconti:
 * nessuna percentuale, scadenza o codice è stato inventato.
 */
export default function OffertePage() {
  const q = usePromo();
  const d = q.data;
  const offerte = d?.offerte ?? [];
  const codici = d?.codici ?? [];

  return (
    <div className="mx-auto max-w-[1500px] px-4 md:px-8 py-10">
      <h1 className="tbh-display tbh-h1">Offerte, promozioni e codici</h1>
      <p className="tbh-body text-[var(--tbh-muted)] mt-3 max-w-3xl">
        Qui compaiono le offerte del periodo, i prezzi riservati al Circuito e i codici
        promozionali. Il sistema è pronto: finché una promozione non è confermata, questa pagina
        dice che non ce ne sono, invece di mostrarne di finte.
      </p>

      {/* OFFERTE */}
      <section className="mt-9">
        <div className="flex items-center gap-3">
          <Tag size={22} className="text-[var(--tbh-neon)]" />
          <h2 className="tbh-display tbh-h2">Offerte del periodo</h2>
        </div>
        {offerte.length === 0 ? (
          <div className="tbh-card p-6 mt-4">
            <p className="tbh-display text-xl">Nessuna offerta attiva</p>
            <p className="text-sm text-[var(--tbh-muted)] mt-2">{d?.nota}</p>
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-3 mt-4">
            {offerte.map((o) => (
              <Link key={o.id} to={o.to} className="tbh-card p-6 block hover:border-[var(--tbh-neon)]">
                <span className="text-[11px] uppercase tracking-wider text-[var(--tbh-gold)]">
                  {o.periodo}
                </span>
                <h3 className="tbh-display text-xl mt-2">{o.titolo}</h3>
                <p className="text-sm text-[var(--tbh-muted)] mt-2">{o.descrizione}</p>
                {o.prezzoPromoCents != null && (
                  <div className="tbh-display text-2xl text-[var(--tbh-neon)] mt-3">
                    {euro(o.prezzoPromoCents)}
                  </div>
                )}
                <span className="text-sm font-bold text-[var(--tbh-neon)] inline-flex items-center gap-2 mt-3">
                  {o.cta} <ArrowRight size={16} />
                </span>
              </Link>
            ))}
          </div>
        )}
        <div className="tbh-card p-5 mt-5">
          <h3 className="tbh-display text-lg">Periodi già previsti dal sistema</h3>
          <div className="flex flex-wrap gap-2 mt-3">
            {(d?.tipiPeriodo ?? []).map((t) => (
              <span
                key={t}
                className="text-[11px] font-semibold rounded-full border border-[var(--tbh-line)] px-3 py-1.5 text-[var(--tbh-muted)]"
              >
                {t}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* CODICI */}
      <section className="mt-12">
        <div className="flex items-center gap-3">
          <Ticket size={22} className="text-[var(--tbh-neon)]" />
          <h2 className="tbh-display tbh-h2">Codici promozionali</h2>
        </div>
        {codici.length === 0 ? (
          <div className="tbh-card p-6 mt-4">
            <p className="tbh-display text-xl">Nessun codice attivo</p>
            <p className="text-sm text-[var(--tbh-muted)] mt-2">
              I codici entrano in funzione con ambito, validità, limiti d'uso e riserva Circuito.
              Nessun codice viene pubblicato prima della conferma.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-3 mt-4">
            {codici.map((c) => (
              <div key={c.codice} className="tbh-card p-6">
                <div className="tbh-display text-2xl text-[var(--tbh-neon)]">{c.codice}</div>
                <p className="text-sm text-[var(--tbh-muted)] mt-2">{c.descrizione}</p>
                <p className="text-xs text-[var(--tbh-gold)] uppercase tracking-wide mt-2">
                  {c.ambito}
                  {c.soloCircuito && " · solo Circuito"}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* BANNER PROGRAMMABILI */}
      <section className="mt-12">
        <h2 className="tbh-display tbh-h2">Spazi banner programmabili</h2>
        <p className="text-[var(--tbh-muted)] mt-1">
          Gli spazi sono già attivi in Home e nelle sezioni: si programmano per categoria, periodo,
          priorità e destinazione.
        </p>
        <div className="grid gap-5 md:grid-cols-3 mt-5">
          {(d?.banner ?? []).map((b) => (
            <BannerSlot key={b.id} banner={b} />
          ))}
        </div>
        <div className="tbh-card p-5 mt-5">
          <h3 className="tbh-display text-lg">Categorie di banner gestite</h3>
          <div className="flex flex-wrap gap-2 mt-3">
            {(d?.categorieBanner ?? []).map((c) => (
              <span
                key={c.id}
                className="text-[11px] font-semibold rounded-full border border-[var(--tbh-line)] px-3 py-1.5 text-[var(--tbh-muted)]"
              >
                {c.label}
              </span>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
