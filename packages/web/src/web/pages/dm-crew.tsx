import { Link } from "wouter";
import { ExternalLink, AlertTriangle, Camera, UserPlus } from "lucide-react";
import { useDmCrew } from "../queries/portale";
import { waInfo } from "../lib/whatsapp";
import { SezioneAmministrabile } from "../components/sezione-amministrabile";

const DM = "#ff2b2b";

/**
 * DM CREW — album «figurine» degli operatori e dei giornalisti.
 *
 * Regole: nessuna foto generata (senza scatto reale → riquadro «Foto ufficiale da ricevere»),
 * nessun nome inventato, nessun monogramma. I posti liberi restano dichiarati.
 */
export default function DmCrewPage() {
  const q = useDmCrew();

  return (
    <div className="mx-auto max-w-[1500px] px-4 md:px-8 py-10">
      <header className="tbh-rise mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs tracking-[0.25em] uppercase mb-2" style={{ color: DM }}>
            Album figurine
          </p>
          <h1 className="tbh-display tbh-h1">DM Crew</h1>
          <p className="tbh-body text-[var(--tbh-muted)] max-w-3xl mt-3">
            Operatori, giornalisti e collaboratori che seguono le squadre e i programmi.{" "}
            <strong>DM Comunicazioni è media partner autonomo</strong>, non una società del gruppo
            Touch Business Holding.
          </p>
        </div>
        {q.data?.canale.logo && (
          <img
            src={q.data.canale.logo}
            alt="DM Comunicazioni — logo ufficiale"
            className="h-24 w-24 md:h-32 md:w-32 rounded-2xl bg-white object-contain p-2 self-start"
            style={{ border: `1px solid ${DM}66` }}
          />
        )}
      </header>

      {q.isLoading && <div className="tbh-card h-64 animate-pulse" />}

      {q.data && (
        <>
          <div className="flex flex-wrap gap-3 mb-8">
            <Link
              href="/dm"
              className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-bold uppercase tracking-wide"
              style={{ borderColor: `${DM}66`, color: DM }}
            >
              Pagina DM Comunicazioni
            </Link>
            <a
              href={q.data.canale.youtube}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-[var(--tbh-line)] px-4 py-2 text-xs font-bold uppercase tracking-wide hover:border-[var(--tbh-neon)]"
            >
              Canale YouTube <ExternalLink size={12} />
            </a>
            <Link
              href="/sport/squadre"
              className="inline-flex items-center gap-2 rounded-full border border-[var(--tbh-line)] px-4 py-2 text-xs font-bold uppercase tracking-wide hover:border-[var(--tbh-neon)]"
            >
              Squadre seguite
            </Link>
          </div>

          <section className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {q.data.crew.map((f) => (
              <article
                key={f.slug}
                className="tbh-card p-5 flex flex-col gap-3"
                style={{ borderColor: `${DM}44` }}
              >
                <div className="flex items-center justify-between">
                  <span
                    className="tbh-display text-lg leading-none"
                    style={{ color: DM }}
                  >
                    N° {f.numero}
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--tbh-muted)]">
                    DM Crew
                  </span>
                </div>

                {f.foto ? (
                  <img
                    src={f.foto}
                    alt={f.nome}
                    className="aspect-[4/5] w-full rounded-xl object-cover"
                  />
                ) : (
                  <div className="aspect-[4/5] w-full rounded-xl border border-dashed border-[var(--tbh-line)] bg-black/40 flex flex-col items-center justify-center gap-2 px-4 text-center">
                    <Camera size={22} className="text-[var(--tbh-muted)]" />
                    <p className="tbh-display text-base md:text-lg">{f.nome}</p>
                    <p className="text-[11px] text-[var(--tbh-gold)]">
                      Foto ufficiale da ricevere: nessuna immagine generata.
                    </p>
                  </div>
                )}

                <div>
                  <h2 className="tbh-display tbh-h3">{f.nome}</h2>
                  <p className="text-sm text-[var(--tbh-muted)]">{f.ruolo}</p>
                </div>

                {f.segue.length > 0 && (
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--tbh-muted)] mb-1">
                      Segue
                    </p>
                    <ul className="text-xs space-y-1">
                      {f.segue.map((s) => (
                        <li key={s} className="text-[var(--tbh-platinum)]">
                          · {s}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {f.esterni.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {f.esterni.map((l) => (
                      <a
                        key={l.url}
                        href={l.url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-full border border-[var(--tbh-line)] px-3 py-1.5 text-[11px] font-bold uppercase tracking-wide hover:border-[var(--tbh-neon)] hover:text-[var(--tbh-neon)] transition"
                      >
                        {l.etichetta} <ExternalLink size={12} />
                      </a>
                    ))}
                  </div>
                )}

                {f.note && <p className="text-xs text-[var(--tbh-muted)]">{f.note}</p>}

                <div className="mt-auto pt-1">
                  <a
                    href={waInfo(`DM Crew — ${f.nome}`)}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold uppercase tracking-wide text-black"
                    style={{ background: DM, color: "#fff" }}
                  >
                    Richiedi informazioni
                  </a>
                </div>
              </article>
            ))}

            {Array.from({ length: q.data.daConfermare }).map((_, i) => (
              <article
                key={`slot-${i}`}
                className="tbh-card p-5 flex flex-col items-center justify-center gap-3 text-center border-dashed"
              >
                <UserPlus size={24} className="text-[var(--tbh-muted)]" />
                <p className="tbh-display text-base">Figurina da assegnare</p>
                <p className="text-xs text-[var(--tbh-muted)]">
                  Il posto resta libero fino alla conferma di nome, ruolo e foto reale.
                </p>
                <a
                  href={waInfo("DM Crew — proposta operatore/giornalista")}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border border-[var(--tbh-line)] px-4 py-2 text-[11px] font-bold uppercase tracking-wide hover:border-[var(--tbh-neon)]"
                >
                  Segnala un nome
                </a>
              </article>
            ))}
          </section>

          <p className="text-xs text-[var(--tbh-gold)] flex items-start gap-2 mt-8 max-w-4xl">
            <AlertTriangle size={14} className="mt-0.5 shrink-0" />
            {q.data.nota}
          </p>

          <p className="text-xs text-[var(--tbh-muted)] mt-4">
            Contatti: WhatsApp {q.data.contatti.whatsapp} · {q.data.contatti.email}
          </p>
        </>
      )}
      <div className="mt-14 grid gap-12 border-t border-white/10 pt-10">
        <SezioneAmministrabile sezione="touch-crew" />
      </div>
    </div>
  );
}
