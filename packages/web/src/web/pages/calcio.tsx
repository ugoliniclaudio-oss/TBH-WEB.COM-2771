import { useState } from "react";
import { ExternalLink, Trophy, Calendar, ListOrdered, ArrowRight, Newspaper } from "lucide-react";
import { Link } from "wouter";
import { useCalcio } from "../queries/rete";
import { useTeams } from "../queries/catalog";
import { useCalendarioSport } from "../queries/tbh";
import { STAMPA_SPORTIVA, VERIFICATO_IL } from "../lib/esterni";
import { StatoEventoBadge, prossimiAppuntamenti } from "../components/evento-sport";

/**
 * /sport/calcio — riorganizzata il 15/09/2026 su ordine di Claudio.
 *
 * Tre sole selezioni: SQUADRE · RISULTATI E NOTIZIE · TORNEI E PROGETTI.
 * Una sola sezione aperta alla volta: non si mostra tutto uno sopra l'altro.
 * «Tornei e progetti» dà solo una breve anteprima e UN link al calendario: le
 * descrizioni complete stanno nel calendario, non le ripetiamo qui.
 */

const SEZIONI = ["SQUADRE", "RISULTATI E NOTIZIE", "TORNEI E PROGETTI"] as const;
type Sezione = (typeof SEZIONI)[number];

const DM_SPORT_LIVE = "https://www.dmsportlive.it/";
const DM_YOUTUBE = "https://www.youtube.com/@DanieleManuelli1981";

/** I quattro programmi DM: aprono la pagina canonica, mai una copia del video. */
const PROGRAMMI_DM_LINK = [
  { slug: "calcio-di-rigore", nome: "Calcio di Rigore", quando: "Lunedì 19:45" },
  { slug: "tg-sport", nome: "TG Sport", quando: "Martedì 18:45" },
  { slug: "il-calcio-di-tutti", nome: "Il Calcio D Tutti", quando: "Martedì 19:45" },
  { slug: "anteprima-sport", nome: "AnteprimaSport", quando: "Venerdì 19:45" },
];

export default function CalcioPage() {
  const q = useCalcio();
  const teams = useTeams();
  const cal = useCalendarioSport();
  const [aperta, setAperta] = useState<Sezione>("SQUADRE");
  const d = q.data;

  const anteprima = prossimiAppuntamenti(cal.data?.eventi ?? []);

  return (
    <div className="mx-auto max-w-[1500px] px-4 md:px-8 py-10">
      <header className="tbh-rise mb-8">
        <p className="text-xs tracking-[0.25em] text-[var(--tbh-gold)] uppercase mb-2">Sport</p>
        <h1 className="tbh-display tbh-h1">Calcio</h1>
        <p className="tbh-body text-[var(--tbh-muted)] max-w-3xl mt-3">
          Le squadre seguite dal gruppo, i risultati e le notizie dalle fonti ufficiali, i tornei e
          i progetti. Scegli una sezione: si apre una alla volta.
        </p>
      </header>

      {/* TRE SELEZIONI — una sola aperta */}
      <div className="flex flex-wrap gap-2 mb-8" role="tablist" aria-label="Sezioni calcio">
        {SEZIONI.map((s) => (
          <button
            key={s}
            type="button"
            role="tab"
            aria-selected={aperta === s}
            onClick={() => setAperta(s)}
            className={`px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wide transition ${
              aperta === s
                ? "bg-[var(--tbh-neon)] text-black"
                : "border border-[var(--tbh-line)] text-[var(--tbh-platinum)] hover:border-[var(--tbh-neon)]"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {/* ───────── SQUADRE ───────── */}
      {aperta === "SQUADRE" && (
        <section data-sezione="SQUADRE" data-aperta="true">
          <h2 className="tbh-display tbh-h2 mb-6 flex items-center gap-3">
            <Trophy className="text-[var(--tbh-neon)]" /> Le nostre squadre
          </h2>
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {(teams.data?.teams ?? []).map((t) => (
              <article key={t.slug} className="tbh-card p-5">
                <div className="h-36 w-full rounded-2xl bg-white relative grid place-items-center overflow-hidden p-4">
                  {t.logo ? (
                    <img
                      src={t.logo}
                      alt={t.name}
                      className="absolute inset-0 h-full w-full object-contain p-4"
                      loading="eager"
                      decoding="async"
                      data-tessera-img
                    />
                  ) : (
                    <span className="tbh-display text-4xl text-black/80">
                      {t.name
                        .split(/\s+/)
                        .slice(0, 2)
                        .map((w) => w[0]?.toUpperCase())
                        .join("")}
                    </span>
                  )}
                </div>
                <h3 className="tbh-display text-xl mt-4">{t.name}</h3>
                <p className="text-xs uppercase tracking-wide text-[var(--tbh-gold)] mt-1">
                  {t.role}
                </p>
                <p className="text-sm text-[var(--tbh-muted)] mt-2">{t.note}</p>
                <div className="flex flex-wrap gap-2 mt-4">
                  <Link
                    to={`/sport/squadre/${t.slug}`}
                    className="tbh-neon-btn px-4 py-2 text-xs font-bold uppercase tracking-wide"
                  >
                    Scheda società
                  </Link>
                  {t.site && (
                    <a
                      href={t.site}
                      target="_blank"
                      rel="noreferrer"
                      className="px-4 py-2 rounded-full border border-[var(--tbh-line)] text-xs font-bold uppercase tracking-wide inline-flex items-center gap-1.5 hover:border-[var(--tbh-neon)]"
                    >
                      Sito ufficiale <ExternalLink size={12} />
                    </a>
                  )}
                </div>
              </article>
            ))}
          </div>

          <Link
            to="/sport/squadre"
            className="mt-8 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-[var(--tbh-neon)]"
          >
            Tutte le società di calcio <ArrowRight size={14} />
          </Link>
        </section>
      )}

      {/* ───────── RISULTATI E NOTIZIE ───────── */}
      {aperta === "RISULTATI E NOTIZIE" && (
        <section data-sezione="RISULTATI E NOTIZIE" data-aperta="true" className="flex flex-col gap-12">
          <div>
            <h2 className="tbh-display tbh-h2 mb-2">Campionati · classifiche e risultati</h2>
            <p className="text-sm text-[var(--tbh-muted)] mb-6 max-w-3xl">
              I dati non li scriviamo noi: ogni pulsante apre la fonte ufficiale aggiornata.
            </p>
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {(d?.campionati ?? []).map((c) => (
                <article key={c.nome} className="tbh-card p-6 flex flex-col gap-3">
                  <span className="text-[11px] uppercase tracking-wider text-[var(--tbh-gold)]">
                    {c.sezione}
                  </span>
                  <h3 className="tbh-display text-2xl leading-tight">{c.nome}</h3>
                  <p className="text-sm text-[var(--tbh-muted)] grow">{c.nota}</p>
                  <div className="flex flex-wrap gap-2 pt-2">
                    <a
                      href={c.fonte}
                      target="_blank"
                      rel="noreferrer"
                      className="tbh-neon-btn px-4 py-2 text-sm inline-flex items-center gap-2"
                    >
                      <ListOrdered size={15} /> Classifica
                    </a>
                    <a
                      href={c.fonte}
                      target="_blank"
                      rel="noreferrer"
                      className="px-4 py-2 rounded-full border border-[var(--tbh-line)] text-sm font-semibold inline-flex items-center gap-2 hover:border-[var(--tbh-neon)]"
                    >
                      <Calendar size={15} /> Risultati e prossimo turno
                    </a>
                  </div>
                </article>
              ))}
            </div>
          </div>

          {/* PROGRAMMI SPORTIVI DM — quattro schede + sito editoriale ufficiale, distinto */}
          <div>
            <h2 className="tbh-display tbh-h2 mb-2">Programmi sportivi DM</h2>
            <p className="text-sm text-[var(--tbh-muted)] mb-6 max-w-3xl">
              DM Comunicazioni è un media partner autonomo, non una società del gruppo TBH. Ogni
              scheda apre la pagina del programma: il video sta lì, una volta sola.
            </p>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {PROGRAMMI_DM_LINK.map((p) => (
                <Link
                  key={p.slug}
                  to={`/dm/programmi?p=${p.slug}`}
                  className="tbh-card p-5 flex flex-col gap-2 hover:border-[#ff2b2b] transition"
                >
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#ff2b2b]">
                    Programma DM
                  </span>
                  <h3 className="tbh-display text-xl leading-tight">{p.nome}</h3>
                  <p className="text-sm text-[var(--tbh-gold)]">{p.quando}</p>
                  <span className="text-xs font-bold uppercase tracking-wide text-[var(--tbh-neon)] mt-1">
                    Apri il programma →
                  </span>
                </Link>
              ))}
            </div>

            <div className="tbh-card p-5 md:p-6 mt-5 flex flex-col md:flex-row md:items-center gap-4">
              <div className="grow">
                <h3 className="tbh-display text-xl flex items-center gap-2">
                  <Newspaper size={18} className="text-[#ff2b2b]" /> Notizie e produzioni DM Sport
                  Live
                </h3>
                <p className="text-sm text-[var(--tbh-muted)] mt-1">
                  Il sito editoriale ufficiale di DM: notizie, produzioni, servizi e Web TV. Si apre
                  in una scheda nuova, non ne facciamo una copia.
                </p>
              </div>
              <div className="flex flex-wrap gap-2 shrink-0">
                <a
                  href={DM_SPORT_LIVE}
                  target="_blank"
                  rel="noreferrer"
                  className="px-5 py-2.5 rounded-full border border-[#ff2b2b] text-xs font-bold uppercase tracking-wide text-[#ff2b2b] inline-flex items-center gap-2 hover:bg-[#ff2b2b18]"
                >
                  Visita il sito ufficiale <ExternalLink size={13} />
                </a>
                <Link
                  to="/dm"
                  className="px-5 py-2.5 rounded-full border border-[var(--tbh-line)] text-xs font-bold uppercase tracking-wide inline-flex items-center gap-2 hover:border-[var(--tbh-neon)]"
                >
                  Area DM <ArrowRight size={13} />
                </Link>
                <a
                  href={DM_YOUTUBE}
                  target="_blank"
                  rel="noreferrer"
                  className="px-5 py-2.5 rounded-full border border-[var(--tbh-line)] text-xs font-bold uppercase tracking-wide inline-flex items-center gap-2 hover:border-[#ff2b2b]"
                >
                  Canale YouTube <ExternalLink size={13} />
                </a>
              </div>
            </div>
          </div>

          {/* Giornali e riviste sportive — fonti ESTERNE, categoria distinta da DM Sport Live */}
          <div>
            <h2 className="tbh-display tbh-h2 mb-2">Giornali e riviste sportive</h2>
            <p className="text-sm text-[var(--tbh-muted)] mb-6 max-w-3xl">
              Fonti sportive esterne che raccontano i campionati delle nostre squadre. Link e
              anteprime verificati il {VERIFICATO_IL}.
            </p>
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {STAMPA_SPORTIVA.map((t) => (
                <article key={t.sito} className="tbh-card overflow-hidden flex flex-col">
                  {t.anteprima ? (
                    <a href={t.sito} target="_blank" rel="noreferrer" className="block">
                      <img
                        src={t.anteprima}
                        alt={`Anteprima del sito ufficiale ${t.nome}`}
                        loading="lazy"
                        className="w-full h-auto block"
                      />
                    </a>
                  ) : (
                    <div className="h-40 grid place-items-center border-b border-[var(--tbh-line)] px-4 text-center">
                      <span className="text-xs uppercase tracking-wide text-[var(--tbh-muted)]">
                        Anteprima non disponibile
                      </span>
                    </div>
                  )}
                  <div className="p-5 flex flex-col gap-2 grow">
                    <h3 className="tbh-display text-xl leading-tight">{t.nome}</h3>
                    <p className="text-xs uppercase tracking-wide text-[var(--tbh-gold)]">
                      {t.ruolo}
                    </p>
                    <p className="text-sm text-[var(--tbh-muted)] grow">{t.cosa}</p>
                    <div className="flex flex-wrap gap-2 pt-2">
                      <a
                        href={t.sito}
                        target="_blank"
                        rel="noreferrer"
                        className="tbh-neon-btn px-4 py-2 text-sm inline-flex items-center gap-2"
                      >
                        Apri il sito <ExternalLink size={14} />
                      </a>
                      {t.sezioni.map((s) => (
                        <a
                          key={s.url}
                          href={s.url}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-2 rounded-full border border-[var(--tbh-line)] text-xs font-semibold inline-flex items-center gap-1.5 hover:border-[var(--tbh-neon)]"
                        >
                          {s.label} <ExternalLink size={12} />
                        </a>
                      ))}
                    </div>
                    {t.nota && <p className="text-xs text-[var(--tbh-muted)] pt-2">{t.nota}</p>}
                  </div>
                </article>
              ))}
            </div>
          </div>

          <div>
            <h2 className="tbh-display tbh-h2 mb-6">Altre fonti ufficiali</h2>
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
              {(d?.fonti ?? []).map((f) => (
                <a
                  key={f.nome}
                  href={f.sito}
                  target="_blank"
                  rel="noreferrer"
                  className="tbh-card p-5 hover:border-[var(--tbh-neon)] transition"
                >
                  <h3 className="tbh-display text-xl">{f.nome}</h3>
                  <p className="text-sm text-[var(--tbh-muted)] mt-2">{f.nota}</p>
                  <span className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-[var(--tbh-neon)]">
                    Apri <ExternalLink size={14} />
                  </span>
                </a>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ───────── TORNEI E PROGETTI ───────── */}
      {aperta === "TORNEI E PROGETTI" && (
        <section data-sezione="TORNEI E PROGETTI" data-aperta="true">
          <h2 className="tbh-display tbh-h2 mb-2">Tornei e progetti</h2>
          <p className="text-sm text-[var(--tbh-muted)] mb-6 max-w-3xl">
            Breve anteprima degli appuntamenti: date, categorie, iscrizioni e programmi stanno nel
            calendario sport, che è l'unico posto dove li aggiorniamo.
          </p>

          {cal.isLoading && <div className="tbh-card h-32 animate-pulse" />}

          <ul className="grid gap-4 md:grid-cols-3">
            {anteprima.map((e) => (
              <li key={e.id} className="tbh-card p-5 flex flex-col gap-2">
                <StatoEventoBadge stato={e.stato} />
                <p className="text-xs font-bold uppercase tracking-wider text-[var(--tbh-gold)]">
                  {e.periodo}
                </p>
                <h3 className="tbh-display text-xl leading-tight">{e.titolo}</h3>
                {e.localita && (
                  <p className="text-sm text-[var(--tbh-muted)]">{e.localita}</p>
                )}
              </li>
            ))}
          </ul>

          {!cal.isLoading && anteprima.length === 0 && (
            <p className="text-sm text-[var(--tbh-muted)]">
              Nessun torneo in programma al momento.
            </p>
          )}

          <Link
            to="/sport/calendario"
            className="tbh-neon-btn px-6 py-3 text-xs font-bold uppercase tracking-wide inline-flex items-center gap-2 mt-8"
          >
            Vedi il calendario sport <ArrowRight size={14} />
          </Link>
        </section>
      )}
    </div>
  );
}
