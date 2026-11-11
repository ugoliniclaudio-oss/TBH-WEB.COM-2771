import { Link } from "wouter";
import { ExternalLink, Flag, CalendarDays, MapPin, Ticket } from "lucide-react";
import { useMotorsport } from "../queries/rete";
import { LinkTile } from "../components/tiles";
import { SezioneAmministrabile } from "../components/sezione-amministrabile";
import {
  WSBK_ROUND,
  WSBK_CAMPIONATO,
  WSBK_ROUND_NUMERO,
  WSBK_DATE,
  WSBK_INDIRIZZO,
  WSBK_LINK,
} from "../lib/worldsbk-cremona-2026";

export default function MotorsportPage() {
  const q = useMotorsport();
  const d = q.data;

  return (
    <div className="mx-auto max-w-[1500px] px-4 md:px-8 py-10">
      <header className="tbh-rise mb-10">
        <p className="text-xs tracking-[0.25em] text-[var(--tbh-gold)] uppercase mb-2">
          Touch Moto & Sport
        </p>
        <h1 className="tbh-display tbh-h1">Motorsport</h1>
        <p className="tbh-body text-[var(--tbh-muted)] max-w-3xl mt-3">
          Circuiti, campionati e partner tecnici. Ogni voce apre il sito ufficiale: calendari,
          biglietti e risultati arrivano dalla fonte, non da copie.
        </p>
      </header>

      {/*
        APPUNTAMENTO IN PRIMO PIANO — rimando alla pagina Cremona, non una seconda copia
        dell'evento: qui stanno solo i dati essenziali e i pulsanti verso la scheda completa,
        i biglietti ufficiali e la mappa.
      */}
      <section className="mb-16">
        <div className="tbh-card p-5 md:p-7 border-[var(--tbh-neon)]">
          <p className="text-xs tracking-[0.25em] text-[var(--tbh-gold)] uppercase">
            In primo piano · {WSBK_CAMPIONATO}
          </p>
          <h2 className="tbh-display tbh-h2 mt-2">{WSBK_ROUND} — Cremona Circuit</h2>
          <div className="flex flex-wrap gap-x-6 gap-y-2 mt-4 text-sm">
            <span className="inline-flex items-center gap-2 font-semibold">
              <CalendarDays size={16} className="text-[var(--tbh-neon)]" /> {WSBK_DATE}
            </span>
            <span className="inline-flex items-center gap-2 text-[var(--tbh-muted)]">
              <MapPin size={16} /> {WSBK_INDIRIZZO}
            </span>
            <span className="inline-flex items-center gap-2 text-[var(--tbh-muted)]">
              <Flag size={16} /> {WSBK_ROUND_NUMERO}
            </span>
          </div>
          <div className="flex flex-wrap gap-3 mt-5">
            <Link
              to="/cremona-circuit-2026"
              className="tbh-neon-btn px-5 py-3 inline-flex items-center gap-2"
            >
              Mappa, aree e accredito lavoro
            </Link>
            <a
              href={WSBK_LINK.biglietti}
              target="_blank"
              rel="noreferrer"
              className="px-5 py-3 rounded-full border border-[var(--tbh-line)] text-sm font-semibold inline-flex items-center gap-2 hover:border-[var(--tbh-gold)]"
            >
              <Ticket size={16} /> Biglietti ufficiali
            </a>
            <a
              href={WSBK_LINK.circuito}
              target="_blank"
              rel="noreferrer"
              className="px-5 py-3 rounded-full border border-[var(--tbh-line)] text-sm font-semibold inline-flex items-center gap-2 hover:border-[var(--tbh-neon)]"
            >
              Sito del circuito <ExternalLink size={14} />
            </a>
          </div>
        </div>
      </section>

      <section className="mb-16">
        <h2 className="tbh-display tbh-h2 mb-6 flex items-center gap-3">
          <Flag className="text-[var(--tbh-neon)]" /> Campionati
        </h2>
        <div className="grid gap-7 md:grid-cols-2 xl:grid-cols-4">
          {(d?.campionati ?? []).map((c) => (
            <LinkTile key={c.nome} name={c.nome} subtitle="Campionato" logo={null} site={c.sito} note={c.nota} />
          ))}
        </div>
      </section>

      <section className="mb-16">
        <h2 className="tbh-display tbh-h2 mb-6">Circuiti</h2>
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {(d?.circuiti ?? []).map((c) => (
            <article key={c.nome} className="tbh-card p-5 flex flex-col gap-2">
              <h3 className="tbh-display text-xl leading-tight">{c.nome}</h3>
              <p className="text-sm text-[var(--tbh-muted)]">{c.citta}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(c.nome)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2 rounded-full border border-[var(--tbh-line)] text-sm font-semibold hover:border-[var(--tbh-neon)]"
                >
                  Mappa
                </a>
                {c.sito ? (
                  <a href={c.sito} target="_blank" rel="noreferrer" className="tbh-neon-btn px-4 py-2 text-sm inline-flex items-center gap-2">
                    Sito ufficiale <ExternalLink size={14} />
                  </a>
                ) : (
                  <Link to="/in-allestimento" className="px-4 py-2 rounded-full bg-white/10 text-sm font-semibold">
                    Sito in allestimento
                  </Link>
                )}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section>
        <h2 className="tbh-display tbh-h2 mb-6">Partner tecnici e organizzatori</h2>
        <div className="grid gap-7 md:grid-cols-2 xl:grid-cols-4">
          {(d?.partner ?? []).map((p) => (
            <LinkTile key={p.nome} name={p.nome} subtitle="Partner tecnico" logo={null} site={p.sito} note={p.nota} />
          ))}
        </div>
        <p className="mt-8 text-sm text-[var(--tbh-muted)]">
          Nota: i loghi dei marchi vanno caricati solo dai brand ufficiali — finché non arrivano,
          ogni riquadro mostra il monogramma.
        </p>
      </section>
      <div className="mt-14 grid gap-12 border-t border-white/10 pt-10">
        <SezioneAmministrabile sezione="motorsport" />
      </div>
    </div>
  );
}
