import { ExternalLink, MapPin, Building2, Hotel, Landmark, CalendarClock, AlertTriangle } from "lucide-react";
import { Link } from "wouter";
import { useEstero } from "../queries/travels";
import { wa, waInfo } from "../lib/whatsapp";
import { MiTroviQui } from "../components/mi-trovi-qui";
import { SezioneAmministrabile } from "../components/sezione-amministrabile";
import { ReferentiTurismo } from "../components/referenti-turismo";
import { RiquadroTouchTalent } from "./channel-touch-talent";

/** TOUCH TRAVELS — FIERE INTERNAZIONALI.
 *  Pagina additiva: non sostituisce /eventi né le sedi del gruppo.
 *  Nessuna data, nessun indirizzo e nessun URL inventato: dove il dato non è
 *  verificato compare «da confermare» e il pulsante porta a WhatsApp o alla pagina
 *  in allestimento, mai a un link inventato. */

const ICONA = {
  fiera: Landmark,
  hotel: Hotel,
  citta: MapPin,
  eventi: CalendarClock,
  hospitality: Building2,
} as const;

const ETICHETTA = {
  fiera: "Fiera / polo fieristico",
  hotel: "Hotel",
  citta: "Città / tappa",
  eventi: "Eventi / attività",
  hospitality: "Hospitality",
} as const;

const COLORE = "#33e0ff";

function mapsLink(indirizzo: string | null, nome: string) {
  if (!indirizzo) return null;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${nome} ${indirizzo}`)}`;
}


export default function EsteroPage() {
  const q = useEstero();
  const d = q.data;

  return (
    <div className="mx-auto max-w-[1500px] px-4 md:px-8 py-10">
      <header className="tbh-rise mb-10">
        <p className="text-xs tracking-[0.25em] uppercase mb-2" style={{ color: COLORE }}>
          Hugoland · Touch Travels · Attività del gruppo TBH
        </p>
        <h1 className="tbh-display tbh-h1">Hugoland · Fiere internazionali</h1>
        <p className="tbh-body text-[var(--tbh-muted)] max-w-4xl mt-3">
          Germania, Polonia, Austria, Repubblica Ceca, Slovacchia e oltre. Le tappe recuperate dal
          materiale storico del gruppo, con sede, indirizzo e sito ufficiale verificati uno per uno.
        </p>
        <div className="mt-5 flex flex-wrap gap-3 text-sm">
          <span className="rounded-full border px-4 py-2" style={{ borderColor: `${COLORE}66` }}>
            {d ? `${d.totale} tappe recuperate` : "caricamento…"}
          </span>
          <span className="rounded-full border px-4 py-2 border-[var(--tbh-line)]">
            {d ? `${d.conSito} con sito ufficiale verificato` : ""}
          </span>
          {/* CORREZIONE 29/09/2026 — controllo dei collegamenti, Priorità 1.
              Questo pulsante puntava a «/eventi», un indirizzo che il sito NON
              ha: chi lo premeva finiva fuori strada. Finché Claudio non indica
              la pagina vera del «Tour Italia ed Europa», si applica la regola
              già scritta in testa a questo file: mai un link inventato, si
              porta alla pagina di cortesia in allestimento. */}
          <Link
            href="/in-allestimento"
            className="rounded-full border border-[var(--tbh-line)] px-4 py-2 font-semibold hover:border-[var(--tbh-neon)]"
          >
            Tour Italia ed Europa
          </Link>
          <Link
            href="/tbh/attivita"
            className="rounded-full border border-[var(--tbh-line)] px-4 py-2 font-semibold hover:border-[var(--tbh-neon)]"
          >
            Attività del gruppo
          </Link>
        </div>
      </header>

      {/* 28/10/2026 — area Touch Hugoland: TOUCH TALENT & PROFESSIONALS CHANNEL. */}
      <section className="mb-12" aria-label="Touch Talent & Professionals Channel">
        <RiquadroTouchTalent />
      </section>

      {q.isLoading ? (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="tbh-card h-64 animate-pulse" />
          ))}
        </div>
      ) : (
        (d?.paesi ?? []).map((p) => (
          <section key={p.paese} className="mb-14">
            <div className="flex flex-wrap items-end justify-between gap-3 mb-5">
              <h2 className="tbh-display tbh-h2">
                {p.paese} <span className="text-[var(--tbh-muted)] text-base">({p.iso})</span>
              </h2>
              <span className="text-xs uppercase tracking-wide text-[var(--tbh-gold)]">
                {p.tappe.length} tappe
              </span>
            </div>

            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {p.tappe.map((t) => {
                const Icona = ICONA[t.tipo];
                const maps = mapsLink(t.indirizzo, t.nome);
                return (
                  <article
                    key={t.slug}
                    className="tbh-card p-5 flex flex-col gap-3"
                    style={{ borderColor: `${COLORE}44` }}
                  >
                    <div className="flex items-center gap-2">
                      <Icona size={18} style={{ color: COLORE }} />
                      <span className="text-[11px] uppercase tracking-wider text-[var(--tbh-gold)]">
                        {ETICHETTA[t.tipo]}
                      </span>
                    </div>

                    <h3 className="tbh-display text-xl leading-tight">{t.nome}</h3>
                    <p className="text-sm text-[var(--tbh-muted)]">
                      {t.citta} · {t.paese}
                    </p>

                    <dl className="text-sm flex flex-col gap-1">
                      <div className="flex gap-2">
                        <dt className="text-[var(--tbh-muted)] min-w-24">Indirizzo</dt>
                        <dd>{t.indirizzo ?? <span className="text-[var(--tbh-muted)]">da confermare</span>}</dd>
                      </div>
                      {!t.indirizzo && t.puntoRiferimento ? (
                        <div className="flex gap-2">
                          <dt className="text-[var(--tbh-muted)] min-w-24">Riferimento</dt>
                          <dd className="text-[var(--tbh-muted)]">
                            centro storico — indirizzo esatto da confermare
                          </dd>
                        </div>
                      ) : null}
                      <div className="flex gap-2">
                        <dt className="text-[var(--tbh-muted)] min-w-24">Periodo</dt>
                        <dd>
                          {t.periodo ? (
                            <span style={{ color: COLORE }}>{t.periodo} · confermato</span>
                          ) : (
                            <span className="text-[var(--tbh-muted)]">da confermare</span>
                          )}
                        </dd>
                      </div>
                    </dl>

                    {t.note.map((n) => (
                      <p key={n} className="text-xs text-[var(--tbh-muted)] leading-relaxed">
                        {n}
                      </p>
                    ))}

                    <div className="mt-auto flex flex-wrap gap-2 pt-2">
                      {t.sito ? (
                        <a
                          href={t.sito}
                          target="_blank"
                          rel="noreferrer"
                          className="rounded-full px-4 py-2 text-sm font-bold uppercase tracking-wide text-black inline-flex items-center gap-2"
                          style={{ background: COLORE }}
                        >
                          Sito ufficiale <ExternalLink size={14} />
                        </a>
                      ) : (
                        <Link
                          href="/in-allestimento"
                          className="rounded-full border border-[var(--tbh-line)] px-4 py-2 text-sm font-semibold"
                        >
                          Sito da confermare
                        </Link>
                      )}
                      {/* «MI TROVI QUI» (ordine del 29/08/2026): il pulsante c'è SEMPRE, anche
                          senza indirizzo verificato — in quel caso Google Maps cerca nome + città. */}
                      <MiTroviQui nome={t.nome} citta={t.citta} indirizzo={t.indirizzo} />
                      {!maps ? (
                        <a
                          href={waInfo(`Touch Travels · ${t.nome} (${t.citta})`)}
                          target="_blank"
                          rel="noreferrer"
                          className="rounded-full border border-[var(--tbh-line)] px-4 py-2 text-sm font-semibold hover:border-[var(--tbh-neon)]"
                        >
                          Segnala i dati esatti
                        </a>
                      ) : null}
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        ))
      )}

      {/* 06/10/2026 — aggiunta al canale Fiere e Sagre: referenti istituzionali di turismo ed eventi. */}
      <ReferentiTurismo />

      <section className="mb-14">
        <div className="tbh-card p-6">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle size={18} className="text-[var(--tbh-gold)]" />
            <h2 className="tbh-display tbh-h2">Cronologia recuperata — NON confermata</h2>
          </div>
          <p className="text-sm text-[var(--tbh-muted)] max-w-4xl mb-4">
            Questi periodi provengono da una vecchia grafica CV: non sono un dato certificato e per
            questo non compaiono nelle schede qui sopra. Restano elencati solo per essere incrociati
            con il materiale originale. Appena Claudio conferma, entrano nelle schede.
          </p>
          <div className="grid gap-3 md:grid-cols-2">
            {(d?.cronologia ?? []).map((c) => (
              <div
                key={c.luogo}
                className="rounded-xl border border-[var(--tbh-line)] p-4 flex flex-col gap-1"
              >
                <span className="tbh-display text-lg leading-tight">{c.luogo}</span>
                <span className="text-sm" style={{ color: COLORE }}>
                  {c.periodoIndicato}
                </span>
                <span className="text-xs text-[var(--tbh-muted)]">
                  Fonte: {c.fonte} · da confermare
                </span>
              </div>
            ))}
          </div>
          <a
            href={wa("Confermo i periodi delle tappe Touch Travels all'estero:")}
            target="_blank"
            rel="noreferrer"
            className="mt-5 inline-flex rounded-full px-5 py-2.5 text-sm font-bold uppercase tracking-wide text-black"
            style={{ background: COLORE }}
          >
            Conferma le date su WhatsApp
          </a>
        </div>
      </section>

      <section className="mb-14">
        <h2 className="tbh-display tbh-h2 mb-3">Cosa manca per chiudere il database</h2>
        <p className="text-sm text-[var(--tbh-muted)] max-w-4xl mb-4">
          Struttura finale prevista: ANNO → PAESE → CITTÀ → FIERA/EVENTO → LOCATION → HOTEL →
          locale/ristorante → sito ufficiale → mappa → note ed esperienza TBH. Il motore è già
          questo: appena arrivano i dati mancanti le schede si completano da sole.
        </p>
        <ul className="grid gap-3 md:grid-cols-2">
          {(d?.mancanti ?? []).map((m) => (
            <li
              key={m}
              className="rounded-xl border border-[var(--tbh-line)] p-4 text-sm text-[var(--tbh-muted)]"
            >
              {m}
            </li>
          ))}
        </ul>
      </section>

      <p className="text-xs text-[var(--tbh-muted)] max-w-4xl">{d?.nota}</p>
      <div className="mt-14 grid gap-12 border-t border-white/10 pt-10">
        <SezioneAmministrabile sezione="fiere" />
        <SezioneAmministrabile sezione="turismo" sblocco={false} />
      </div>
    </div>
  );
}
