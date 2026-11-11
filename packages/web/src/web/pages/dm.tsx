import { Link } from "wouter";
import { Radio, Youtube, Clock, AlertTriangle, ExternalLink, Newspaper, Tv, Trophy } from "lucide-react";
import { useDm } from "../queries/tbh";
import { LogoBox } from "../components/tiles";
import { MonitorUrl } from "../components/monitor-url";
import { SezioneAmministrabile } from "../components/sezione-amministrabile";

const STATO_STILE: Record<string, string> = {
  "ORA IN DIRETTA": "bg-red-600 text-white animate-pulse",
  "QUESTA SERA": "bg-[var(--tbh-neon)] text-black",
  "RIVEDI LA PUNTATA": "bg-white/15 text-[var(--tbh-platinum)]",
  PROSSIMAMENTE: "bg-white/10 text-[var(--tbh-muted)]",
};

export default function DmPage() {
  const q = useDm();

  return (
    <div className="mx-auto max-w-[1500px] px-4 md:px-8 py-10">
      <header className="tbh-rise mb-8">
        <p className="text-xs tracking-[0.25em] text-[var(--tbh-gold)] uppercase mb-2">
          Media partner
        </p>
        <h1 className="tbh-display tbh-h1">DM Comunicazioni</h1>
        <p className="tbh-body text-[var(--tbh-muted)] max-w-3xl mt-3">
          DM Comunicazioni è un <strong>media partner</strong> di Touch Business Holding: soggetto
          autonomo, non una società del gruppo TBH. Qui trovi i suoi programmi e gli orari di messa
          in onda.
        </p>
      </header>

      {q.isLoading && <div className="tbh-card h-64 animate-pulse" />}

      {q.data && (
        <>
          <section className="tbh-card p-5 md:p-6 grid gap-6 md:grid-cols-[280px_1fr] items-center mb-10">
            <div>
              <LogoBox
                name="DM Comunicazioni"
                logo={q.data.canale.logo}
                size="lg"
                url={q.data.canale.youtube}
                ctaLabel="Apri il canale"
              />
              {!q.data.canale.logo && (
                <p className="text-[11px] text-[var(--tbh-gold)] mt-2 flex items-start gap-1.5">
                  <AlertTriangle size={13} className="mt-0.5 shrink-0" />
                  Logo ufficiale DM (diavolo rosso/nero) non ancora fornito: non ne creiamo versioni
                  alternative.
                </p>
              )}
            </div>
            <div className="flex flex-col gap-3">
              <h2 className="tbh-display tbh-h2">{q.data.canale.ruolo}</h2>
              <p className="text-sm text-[var(--tbh-muted)]">{q.data.canale.note}</p>
              <p className="text-sm">
                Referente: <strong>{q.data.canale.referente}</strong>
              </p>
              <a
                href={q.data.canale.youtube}
                target="_blank"
                rel="noreferrer"
                className="tbh-neon-btn px-5 py-2.5 text-sm w-fit flex items-center gap-2"
              >
                <Youtube size={18} /> Canale YouTube ufficiale ·{" "}
                {q.data.canale.canaleNome}
              </a>

              {/* SOCIAL UFFICIALI — solo link verificati forniti da Claudio */}
              <div className="flex flex-wrap gap-2">
                {q.data.canale.social.map((s) => (
                  <a
                    key={s.url}
                    href={s.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-full border border-[#ff2b2b66] px-3 py-1.5 text-[11px] font-bold uppercase tracking-wide text-[#ff2b2b] hover:border-[#ff2b2b] transition"
                  >
                    {s.etichetta} <ExternalLink size={12} />
                  </a>
                ))}
              </div>

              {/* Dati di canale comunicati: nessun numero stimato */}
              <div className="flex flex-wrap gap-x-5 gap-y-1 text-xs text-[var(--tbh-muted)]">
                <span>{q.data.canale.canaleDati.descrizione}</span>
                <span>{q.data.canale.canaleDati.iscritti}</span>
                <span>{q.data.canale.canaleDati.video}</span>
                <span>{q.data.canale.canaleDati.visualizzazioni}</span>
                <span>{q.data.canale.canaleDati.dalGiorno}</span>
                <span>{q.data.canale.canaleDati.paese}</span>
              </div>

              {/* SITO EDITORIALE UFFICIALE DM — non è una fonte esterna: è il sito di DM.
                  Resta un link esterno, nessuna copia del sito dentro TBH-WEB. */}
              {q.data.canale.sitoEditoriale && (
                <a
                  href={q.data.canale.sitoEditoriale.url}
                  target="_blank"
                  rel="noreferrer"
                  className="px-5 py-2.5 rounded-full border border-[#ff2b2b] text-sm font-bold uppercase tracking-wide text-[#ff2b2b] inline-flex items-center gap-2 w-fit hover:bg-[#ff2b2b18]"
                >
                  <Newspaper size={16} /> Visita DM Sport Live <ExternalLink size={13} />
                </a>
              )}

              <Link
                href="/media/dm/crew"
                className="text-xs font-bold uppercase tracking-wide text-[var(--tbh-neon)] w-fit"
              >
                Vai a DM Crew →
              </Link>
            </div>
          </section>

          {/* MONITOR PRINCIPALE — solo puntate con link ufficiale verificato */}
          {(() => {
            const conVideo = q.data.programmi.filter((p) => p.ultimaPuntata?.video);
            const principale = conVideo[0];
            return (
              <>
                {principale?.ultimaPuntata?.video && (
                  <section className="mb-10 grid gap-5 lg:grid-cols-[1.4fr_1fr] items-start">
                    <MonitorUrl
                      titolo={`${principale.name} — ${principale.ultimaPuntata.titolo}`}
                      url={principale.ultimaPuntata.video}
                      chiave={`dm-home:${principale.slug}`}
                      cta="Guarda la puntata"
                      archivio={principale.youtube}
                      colore="#ff2b2b"
                      argomento={`${principale.name} — ${principale.ultimaPuntata.titolo}`}
                    />
                    <div className="tbh-card p-5">
                      <h2 className="tbh-display tbh-h3 mb-2">Ultime puntate</h2>
                      <ul className="flex flex-col gap-3">
                        {conVideo.map((p) => (
                          <li key={p.slug} className="flex flex-col gap-1">
                            <span className="text-sm font-semibold">{p.name}</span>
                            <span className="text-xs text-[var(--tbh-muted)]">
                              {p.ultimaPuntata?.titolo}
                              {p.ultimaPuntata?.durata ? ` · ${p.ultimaPuntata.durata}` : ""}
                            </span>
                            <Link
                              to={`/dm/programmi?p=${p.slug}`}
                              className="text-xs font-bold uppercase tracking-wide text-[var(--tbh-neon)] w-fit"
                            >
                              Apri il programma →
                            </Link>
                          </li>
                        ))}
                      </ul>
                      <p className="text-[11px] text-[var(--tbh-muted)] mt-4">
                        Gli altri programmi non hanno ancora un link puntata ufficiale: nessun
                        video provvisorio pubblicato.
                      </p>
                    </div>
                  </section>
                )}
              </>
            );
          })()}

          {/* PALINSESTO SETTIMANALE — giorni e orari confermati da DM Sport Live */}
          <section className="tbh-card p-5 md:p-6 mb-10">
            <div className="flex flex-wrap items-end justify-between gap-3 mb-4">
              <div>
                <h2 className="tbh-display tbh-h2 flex items-center gap-3">
                  <Clock className="text-[#ff2b2b]" /> Palinsesto settimanale
                </h2>
                <p className="text-sm text-[var(--tbh-muted)] mt-1">
                  Giorni e orari confermati dal sito ufficiale DM Sport Live.
                </p>
              </div>
              <Link
                to="/sport/calendario"
                className="px-4 py-2 rounded-full border border-[var(--tbh-line)] text-xs font-bold uppercase tracking-wide hover:border-[var(--tbh-neon)]"
              >
                Palinsesto completo
              </Link>
            </div>
            <ul className="divide-y divide-[var(--tbh-line)]">
              {q.data.palinsesto.map((p) => (
                <li
                  key={p.slug}
                  data-palinsesto={p.slug}
                  className="py-3 flex flex-wrap items-center gap-x-4 gap-y-1"
                >
                  <span className="text-xs font-bold uppercase tracking-wider text-[var(--tbh-gold)] w-28">
                    {p.giornoLabel}
                  </span>
                  <span className="tbh-display text-lg w-16">{p.ora}</span>
                  <span className="text-sm font-semibold grow">{p.name}</span>
                  <span
                    className={`text-[11px] font-bold tracking-wider px-3 py-1 rounded-full ${
                      STATO_STILE[p.stato] ?? STATO_STILE.PROSSIMAMENTE
                    }`}
                  >
                    {p.stato}
                  </span>
                  <Link
                    to={`/dm/programmi?p=${p.slug}`}
                    className="text-xs font-bold uppercase tracking-wide text-[var(--tbh-neon)]"
                  >
                    Apri →
                  </Link>
                </li>
              ))}
            </ul>
          </section>

          {/* PROGRAMMI IN EVIDENZA — le quattro schede, senza archivio ripetuto */}
          <div className="flex flex-wrap items-end justify-between gap-3 mb-4">
            <h2 className="tbh-display tbh-h2 flex items-center gap-3">
              <Radio className="text-[#ff2b2b]" /> I programmi
            </h2>
            <Link
              to="/dm/programmi"
              className="text-xs font-bold uppercase tracking-wide text-[var(--tbh-neon)]"
            >
              Tutti i programmi →
            </Link>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {q.data.programmi
              .filter((p) => p.inPalinsesto)
              .map((p) => (
                <Link
                  key={p.slug}
                  data-programma={p.slug}
                  to={`/dm/programmi?p=${p.slug}`}
                  className="tbh-card p-5 flex flex-col gap-3 hover:border-[var(--tbh-neon)] transition"
                >
                  <span
                    className={`text-[11px] font-bold tracking-wider px-3 py-1.5 rounded-full w-fit ${
                      STATO_STILE[p.stato] ?? STATO_STILE.PROSSIMAMENTE
                    }`}
                  >
                    {p.stato}
                  </span>
                  <h3 className="tbh-display text-2xl leading-tight">{p.name}</h3>
                  <p className="text-sm text-[var(--tbh-muted)] grow">{p.descrizione}</p>
                  <p className="text-sm flex items-center gap-2 text-[var(--tbh-gold)]">
                    <Clock size={15} />
                    {p.giornoLabel && p.ora
                      ? `Ogni ${p.giornoLabel} ore ${p.ora}`
                      : "Orario da confermare"}
                  </p>
                  <span className="text-sm font-semibold text-[var(--tbh-neon)]">
                    Apri il programma
                  </span>
                </Link>
              ))}
          </div>

          {/* DIRETTE E REPLICHE + COLLEGAMENTI */}
          <section className="grid gap-5 md:grid-cols-3 mt-10">
            <div className="tbh-card p-5">
              <h2 className="tbh-display tbh-h3 flex items-center gap-2 mb-2">
                <Tv size={18} className="text-[#ff2b2b]" /> Dirette e repliche
              </h2>
              <p className="text-sm text-[var(--tbh-muted)]">{q.data.canale.note}</p>
              <a
                href={q.data.canale.youtube}
                target="_blank"
                rel="noreferrer"
                className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-[#ff2b2b]"
              >
                <Youtube size={14} /> Dirette su YouTube <ExternalLink size={12} />
              </a>
            </div>

            <div className="tbh-card p-5">
              <h2 className="tbh-display tbh-h3 flex items-center gap-2 mb-2">
                <Newspaper size={18} className="text-[#ff2b2b]" /> DM Sport Live
              </h2>
              <p className="text-sm text-[var(--tbh-muted)]">
                {q.data.canale.sitoEditoriale?.cosa}
              </p>
              {q.data.canale.sitoEditoriale && (
                <a
                  href={q.data.canale.sitoEditoriale.url}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-[#ff2b2b]"
                >
                  Visita il sito ufficiale <ExternalLink size={12} />
                </a>
              )}
            </div>

            <div className="tbh-card p-5">
              <h2 className="tbh-display tbh-h3 flex items-center gap-2 mb-2">
                <Trophy size={18} className="text-[var(--tbh-neon)]" /> Area Sport TBH
              </h2>
              <p className="text-sm text-[var(--tbh-muted)]">
                Calcio, video, calendario e motorsport del gruppo: i programmi DM sono richiamati
                nel calendario unico.
              </p>
              <Link
                to="/sport"
                className="mt-3 inline-flex text-xs font-bold uppercase tracking-wide text-[var(--tbh-neon)]"
              >
                Vai all'area Sport →
              </Link>
            </div>
          </section>

          <p className="text-xs text-[var(--tbh-muted)] mt-6">
            Gli stati PROSSIMAMENTE · QUESTA SERA · ORA IN DIRETTA · RIVEDI LA PUNTATA si aggiornano
            da soli sull'ora italiana. DM Sport Live è il sito editoriale ufficiale di DM: si apre
            in una scheda nuova, non ne facciamo una copia interna.
          </p>

        </>
      )}
      <div className="mt-14 grid gap-12 border-t border-white/10 pt-10">
        <SezioneAmministrabile sezione="dm-comunicazioni" />
      </div>
    </div>
  );
}
