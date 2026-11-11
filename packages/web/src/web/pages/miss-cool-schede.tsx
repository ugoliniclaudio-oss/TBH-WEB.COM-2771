import { Link } from "wouter";
import {
  ArrowLeft,
  ArrowRight,
  ExternalLink,
  ImageOff,
  Info,
  MapPin,
  UserPlus,
} from "lucide-react";

import { useSchedeMissCool } from "../queries/miss-cool";
import { SezioneAmministrabile } from "../components/sezione-amministrabile";

/* ────────────────────────────────────────────────────────────────────────────
   TOUCH MISS COOL — SCHEDE DELLE CANDIDATE.

   LA REGOLA DI QUESTA PAGINA: qui non esiste nessuna candidata di esempio.

   L'elenco esce solo dal database, e solo per chi ha superato tre filtri:
   approvazione dell'organizzazione, stato «pubblicata», consenso B alla
   pubblicazione del profilo. Finché quei tre filtri non passano, la pagina
   resta vuota e SCRIVE che è vuota, spiegando quando si apre.

   Se qualcuno vedrà mai un volto qui, sarà una persona vera che ha firmato.
   ──────────────────────────────────────────────────────────────────────────── */

const BASE = "/eventi/miss-cool";

export default function MissCoolSchedePage() {
  const q = useSchedeMissCool();
  const d = q.data;

  if (q.isLoading) {
    return (
      <div className="mx-auto max-w-[1200px] px-4 py-16 md:px-8">
        <p className="tbh-body text-[var(--tbh-muted)]">Carico le schede…</p>
      </div>
    );
  }

  if (q.isError || !d) {
    return (
      <div className="mx-auto max-w-[1200px] px-4 py-16 md:px-8">
        <h1 className="tbh-display tbh-h1">CANDIDATE</h1>
        <p className="tbh-body mt-4 text-[var(--tbh-muted)]">
          L'elenco delle candidate non è raggiungibile in questo momento. Nessun profilo
          viene mostrato al suo posto.
        </p>
        <Link href={BASE} className="tbh-body mt-6 inline-flex items-center gap-2 text-[var(--tbh-neon)]">
          <ArrowLeft className="size-4" /> Torna a Touch Miss Cool
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1200px] px-4 py-10 md:px-8 md:py-16">
      <Link
        href={BASE}
        className="tbh-body inline-flex items-center gap-2 text-[var(--tbh-muted)] transition hover:text-[var(--tbh-fg)]"
      >
        <ArrowLeft className="size-4" /> Touch Miss Cool
      </Link>

      <header className="mt-6">
        <p className="tbh-body text-[11px] font-extrabold uppercase tracking-[0.22em] text-[var(--tbh-neon)]">
          Edizione {d.edizione} · {d.formato.titolo}
        </p>
        <h1 className="tbh-display tbh-h1 mt-2">CANDIDATE</h1>
        <p className="tbh-body mt-3 max-w-[70ch] text-[var(--tbh-muted)]">
          {d.formato.sottotitolo} Una scheda compare qui solo dopo l'approvazione
          dell'organizzazione e solo con il consenso della candidata alla pubblicazione.
        </p>
      </header>

      {/* ELENCO VUOTO: dichiarato, non camuffato con segnaposto. */}
      {d.schede.length === 0 ? (
        <>
          <div className="mt-10 rounded-3xl border border-dashed border-white/20 bg-white/[0.02] p-8 text-center">
            <ImageOff className="mx-auto size-10 text-[var(--tbh-muted)]" />
            <p className="tbh-body mt-4 text-[15px] font-extrabold uppercase tracking-[0.1em] text-[var(--tbh-fg)]">
              Nessuna scheda pubblicata
            </p>
            <p className="tbh-body mx-auto mt-3 max-w-[60ch] text-[var(--tbh-muted)]">
              {d.nota}
            </p>
            <Link
              href={`${BASE}/adesione`}
              className="tbh-body mt-6 inline-flex items-center gap-2 rounded-xl bg-[var(--tbh-neon)] px-5 py-3 text-[13px] font-extrabold uppercase tracking-[0.08em] text-black transition hover:brightness-110"
            >
              <UserPlus className="size-4" /> Candidati per l'edizione {d.edizione}
            </Link>
          </div>

          {/* Come sarà fatta una scheda: il formato del Kit, non un finto profilo. */}
          <section className="mt-14">
            <div className="flex items-center gap-2">
              <Info className="size-4 text-[var(--tbh-neon)]" />
              <h2 className="tbh-body text-[12px] font-extrabold uppercase tracking-[0.18em] text-[var(--tbh-fg)]">
                Com'è fatta una scheda candidata
              </h2>
            </div>
            <p className="tbh-body mt-2 max-w-[70ch] text-[13px] text-[var(--tbh-muted)]">
              Il formato è quello del Kit {d.edizione}: sotto ci sono i blocchi che
              comporranno ogni profilo, non un profilo di esempio.
            </p>
            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {d.formato.blocchi.map((b, i) => (
                <div
                  key={b.titolo}
                  className="rounded-2xl border border-white/10 bg-white/[0.02] p-5"
                >
                  <span className="tbh-display text-[15px] text-[var(--tbh-neon)]">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <p className="tbh-body mt-2 text-[14px] font-extrabold uppercase tracking-[0.06em] text-[var(--tbh-fg)]">
                    {b.titolo}
                  </p>
                  <p className="tbh-body mt-1.5 text-[13px] text-[var(--tbh-muted)]">{b.cosa}</p>
                </div>
              ))}
            </div>
          </section>
        </>
      ) : (
        <section className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {d.schede.map((s) => (
            <article
              key={s.slug}
              className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] transition hover:border-[var(--tbh-neon)]/50"
            >
              {/* Foto: solo se caricata davvero. Nessun placeholder di persona. */}
              {s.fotoUfficiale ? (
                <img
                  src={s.fotoUfficiale}
                  alt={`Foto ufficiale di ${s.nome}`}
                  className="aspect-[3/4] w-full object-cover"
                  loading="lazy"
                />
              ) : (
                <div className="flex aspect-[3/4] w-full items-center justify-center border-b border-dashed border-white/15 bg-black/30">
                  <span className="tbh-body text-[11px] uppercase tracking-[0.16em] text-[var(--tbh-muted)]">
                    foto in allestimento
                  </span>
                </div>
              )}
              <div className="p-5">
                <p className="tbh-body text-[11px] font-extrabold uppercase tracking-[0.16em] text-[var(--tbh-neon)]">
                  {s.numeroGara !== null
                    ? `MISS #${String(s.numeroGara).padStart(3, "0")}`
                    : "NUMERO DA ASSEGNARE"}
                </p>
                <h2 className="tbh-display mt-1.5 text-[20px] text-[var(--tbh-fg)]">{s.nome}</h2>
                <p className="tbh-body mt-1.5 flex items-center gap-1.5 text-[12px] text-[var(--tbh-muted)]">
                  <MapPin className="size-3.5" /> {s.comune}
                </p>
                {s.presentazione && (
                  <p className="tbh-body mt-3 line-clamp-4 text-[13px] text-[var(--tbh-muted)]">
                    {s.presentazione}
                  </p>
                )}
                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <span className="tbh-body rounded-full border border-white/12 px-2.5 py-1 text-[11px] uppercase tracking-[0.1em] text-[var(--tbh-muted)]">
                    percorso {s.percorso}
                  </span>
                  <span className="tbh-body text-[12px] text-[var(--tbh-muted)]">
                    <span className="font-extrabold text-[var(--tbh-fg)]">{s.votiValidi}</span>{" "}
                    voti validi
                  </span>
                </div>
                {(s.portfolioUrl || s.videoUrl) && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {s.portfolioUrl && (
                      <a
                        href={s.portfolioUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="tbh-body inline-flex items-center gap-1.5 text-[12px] text-[var(--tbh-neon)]"
                      >
                        Portfolio <ExternalLink className="size-3.5" />
                      </a>
                    )}
                    {s.videoUrl && (
                      <a
                        href={s.videoUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="tbh-body inline-flex items-center gap-1.5 text-[12px] text-[var(--tbh-neon)]"
                      >
                        Video <ExternalLink className="size-3.5" />
                      </a>
                    )}
                  </div>
                )}
              </div>
            </article>
          ))}
        </section>
      )}

      <section className="mt-14 grid gap-4 sm:grid-cols-2">
        <Link
          href={`${BASE}/premiazioni`}
          className="group rounded-2xl border border-white/10 bg-white/[0.02] p-5 transition hover:border-[var(--tbh-neon)]/50"
        >
          <p className="tbh-body text-[15px] font-extrabold text-[var(--tbh-fg)]">
            Le 11 premiazioni
          </p>
          <p className="tbh-body mt-1 text-[13px] text-[var(--tbh-muted)]">
            Cosa si vince: incarichi annuali, non solo una fascia.
          </p>
          <span className="tbh-body mt-3 inline-flex items-center gap-2 text-[13px] text-[var(--tbh-neon)] transition group-hover:gap-3">
            Apri <ArrowRight className="size-4" />
          </span>
        </Link>
        <Link
          href={`${BASE}/regolamento`}
          className="group rounded-2xl border border-white/10 bg-white/[0.02] p-5 transition hover:border-[var(--tbh-neon)]/50"
        >
          <p className="tbh-body text-[15px] font-extrabold text-[var(--tbh-fg)]">
            Regolamento
          </p>
          <p className="tbh-body mt-1 text-[13px] text-[var(--tbh-muted)]">
            I 18 articoli, compresi voto valido e cause di esclusione.
          </p>
          <span className="tbh-body mt-3 inline-flex items-center gap-2 text-[13px] text-[var(--tbh-neon)] transition group-hover:gap-3">
            Apri <ArrowRight className="size-4" />
          </span>
        </Link>
      </section>
      <div className="mt-14 grid gap-12 border-t border-white/10 pt-10">
        <SezioneAmministrabile sezione="miss-cool-candidate" />
      </div>
    </div>
  );
}
