import { Link } from "wouter";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Clock,
  ExternalLink,
  Info,
  MapPin,
  RefreshCw,
  Ticket,
  User,
} from "lucide-react";

import { useContenutoEdicola } from "../queries/edicola";
import {
  CardEdicola,
  MonitorContenuto,
  dataEventoUmana,
  quandoUmano,
} from "../components/card-edicola";

/* ────────────────────────────────────────────────────────────────────────────
   EDICOLA TBH — SCHEDA DI UN CONTENUTO.

   Un contenuto ha un solo indirizzo, sia che sia un articolo sia che sia un
   evento: cambia solo quello che si mostra. Se il servizio dichiara un evento,
   compare il riquadro DOVE E QUANDO con i soli campi verificati.

   Regola che non si tocca: di un articolo esterno si pubblicano titolo, sintesi
   breve, testata e data. Il testo integrale resta sul sito che l'ha scritto, e
   si apre col pulsante «LEGGI SULLA FONTE ↗».
   ──────────────────────────────────────────────────────────────────────────── */

function RigaEvento({
  icona,
  etichetta,
  valore,
}: {
  icona: React.ReactNode;
  etichetta: string;
  valore: string;
}) {
  return (
    <div className="flex items-start gap-2">
      <span className="mt-0.5 text-[var(--tbh-neon)]" aria-hidden>
        {icona}
      </span>
      <span className="text-sm text-[var(--tbh-muted)]">
        <strong className="mr-1 text-[10px] font-extrabold uppercase tracking-[0.16em] text-white">
          {etichetta}
        </strong>
        {valore}
      </span>
    </div>
  );
}

export default function EdicolaContenutoPage({ slug }: { slug?: string }) {
  const q = useContenutoEdicola((slug ?? "").trim());
  const d = q.data;
  const item = d?.item;
  const evento = d?.evento;
  const colore = item?.categoriaColore ?? "var(--tbh-neon)";

  if (q.isLoading) {
    return (
      <div className="mx-auto max-w-[1100px] px-4 py-16 md:px-8">
        <div className="tbh-card flex min-h-[260px] items-center justify-center border-dashed">
          <span className="inline-flex items-center gap-2 text-[12px] font-extrabold uppercase tracking-[0.18em] text-[var(--tbh-muted)]">
            <RefreshCw size={14} className="animate-spin" aria-hidden /> Apertura della scheda…
          </span>
        </div>
      </div>
    );
  }

  if (q.isError || !item) {
    return (
      <div className="mx-auto max-w-[1100px] px-4 py-16 md:px-8">
        <h1 className="tbh-display tbh-h2">Scheda non disponibile</h1>
        <p className="mt-3 max-w-[80ch] text-sm text-[var(--tbh-muted)]">
          Questo contenuto non è presente nell'Edicola, oppure è stato ritirato dalla redazione.
          Nessun contenuto di riserva viene mostrato al suo posto.
        </p>
        <Link to="/edicola" className="tbh-neon-btn mt-6 inline-flex px-4 py-2 text-[12px]">
          Torna all'Edicola
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1100px] px-4 py-8 md:px-8 md:py-10">
      {/* ── DA DOVE ARRIVO ──────────────────────────────────────────────── */}
      <nav className="flex flex-wrap items-center gap-3 text-[11px] font-extrabold uppercase tracking-[0.16em] text-[var(--tbh-muted)]">
        <Link to="/edicola" className="inline-flex items-center gap-2 transition hover:text-white">
          <ArrowLeft size={14} aria-hidden /> Edicola
        </Link>
        <span aria-hidden>·</span>
        <Link to={`/edicola/${item.categoria}`} className="transition hover:text-white" style={{ color: colore }}>
          {item.categoriaEmoji} {item.categoriaTitolo}
        </Link>
        {item.sottocategoria && (
          <>
            <span aria-hidden>·</span>
            <span>{item.sottocategoria}</span>
          </>
        )}
      </nav>

      {/* ── TITOLO E FIRMA ─────────────────────────────────────────────── */}
      <header className="tbh-rise mt-4 flex flex-col gap-3">
        {item.evento && (
          <p
            className="inline-flex w-fit items-center gap-2 rounded-full border px-3 py-1 text-[10px] font-extrabold uppercase tracking-[0.2em]"
            style={{ borderColor: `${colore}66`, color: colore }}
          >
            <CalendarDays size={12} aria-hidden /> Evento
          </p>
        )}
        <h1 className="tbh-display tbh-h1">{item.titolo}</h1>
        <p className="flex flex-wrap items-center gap-2 text-[12px] text-[var(--tbh-muted)]">
          <strong className="text-white">{item.fonte}</strong>
          <span aria-hidden>·</span>
          <span>{quandoUmano(item.dataPubblicazione)}</span>
          {item.territorioNome && (
            <>
              <span aria-hidden>·</span>
              <span className="inline-flex items-center gap-1">
                <MapPin size={12} aria-hidden /> {item.territorioNome}
              </span>
            </>
          )}
        </p>
      </header>

      {/* ── MONITOR ─────────────────────────────────────────────────────── */}
      <div className="mt-6">
        <MonitorContenuto item={item} altezza="aspect-[16/9]" />
      </div>

      {/* ── DOVE E QUANDO (solo se è un evento verificato) ──────────────── */}
      {item.evento && evento && (
        <section
          className="tbh-card mt-6 flex flex-col gap-3 p-5 md:p-6"
          aria-label="Dove e quando"
        >
          <h2 className="tbh-display tbh-h3">Dove e quando</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {evento.data && (
              <RigaEvento
                icona={<CalendarDays size={15} />}
                etichetta="Data"
                valore={dataEventoUmana(evento.data)}
              />
            )}
            {evento.ora && (
              <RigaEvento icona={<Clock size={15} />} etichetta="Ora" valore={evento.ora} />
            )}
            {evento.luogo && (
              <RigaEvento icona={<MapPin size={15} />} etichetta="Luogo" valore={evento.luogo} />
            )}
            {evento.organizzatore && (
              <RigaEvento
                icona={<User size={15} />}
                etichetta="Organizza"
                valore={evento.organizzatore}
              />
            )}
          </div>

          {evento.programma && (
            <p className="whitespace-pre-line border-t border-[var(--tbh-line)] pt-3 text-sm text-[var(--tbh-muted)]">
              {evento.programma}
            </p>
          )}

          <div className="flex flex-wrap gap-2">
            {evento.maps && (
              <a
                href={evento.maps}
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex items-center gap-2 rounded-full border border-[var(--tbh-line)] px-4 py-2 text-[12px] font-extrabold uppercase tracking-[0.1em] text-[var(--tbh-muted)] transition hover:border-white/40 hover:text-white"
              >
                <MapPin size={14} aria-hidden /> Google Map
              </a>
            )}
            {evento.ticket && (
              <a
                href={evento.ticket}
                target="_blank"
                rel="noreferrer noopener"
                className="tbh-neon-btn inline-flex items-center gap-2 px-4 py-2 text-[12px]"
              >
                <Ticket size={14} aria-hidden /> Biglietti ↗
              </a>
            )}
            {evento.sito && (
              <a
                href={evento.sito}
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex items-center gap-2 rounded-full border border-[var(--tbh-line)] px-4 py-2 text-[12px] font-extrabold uppercase tracking-[0.1em] text-[var(--tbh-muted)] transition hover:border-white/40 hover:text-white"
              >
                <ExternalLink size={14} aria-hidden /> Sito dell'evento ↗
              </a>
            )}
          </div>

          {!evento.data && !evento.ora && !evento.luogo && (
            <p className="text-[12px] text-[var(--tbh-muted)]">
              DA DEFINIRE — data, ora e luogo non sono ancora stati dichiarati dalla fonte.
            </p>
          )}
        </section>
      )}

      {/* ── SINTESI ─────────────────────────────────────────────────────── */}
      <section className="mt-7 flex flex-col gap-5">
        {item.sintesiTbh && (
          <div className="tbh-card flex flex-col gap-2 p-5 md:p-6">
            <h2 className="tbh-display flex items-center gap-2 tbh-h4">
              <Info size={17} className="text-[var(--tbh-gold)]" aria-hidden /> La sintesi della
              redazione TBH
            </h2>
            <p className="whitespace-pre-line text-[15px] leading-relaxed text-[var(--tbh-muted)]">
              {item.sintesiTbh}
            </p>
          </div>
        )}

        {item.abstract ? (
          <p className="whitespace-pre-line text-[16px] leading-relaxed text-white/90">
            {item.abstract}
          </p>
        ) : (
          !item.sintesiTbh && (
            <p className="text-sm text-[var(--tbh-muted)]">
              La fonte non ha fornito un sommario. Il contenuto si legge sul sito originale.
            </p>
          )
        )}

        {/* Il testo integrale resta sempre alla fonte. */}
        {item.urlOriginale && (
          <div className="flex flex-wrap items-center gap-2">
            <a
              href={item.urlOriginale}
              target="_blank"
              rel="noreferrer noopener"
              className="tbh-neon-btn inline-flex items-center gap-2 px-5 py-2.5 text-[12px]"
            >
              <ExternalLink size={14} aria-hidden /> Leggi sulla fonte · {item.fonte} ↗
            </a>
            {item.fonteSito && (
              <a
                href={item.fonteSito}
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex items-center gap-2 rounded-full border border-[var(--tbh-line)] px-4 py-2 text-[12px] font-extrabold uppercase tracking-[0.1em] text-[var(--tbh-muted)] transition hover:border-white/40 hover:text-white"
              >
                Home della testata ↗
              </a>
            )}
          </div>
        )}

        {item.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {item.tags.map((t) => (
              <span
                key={t}
                className="rounded-full border border-[var(--tbh-line)] px-3 py-1 text-[10px] font-extrabold uppercase tracking-[0.14em] text-[var(--tbh-muted)]"
              >
                #{t}
              </span>
            ))}
          </div>
        )}

        {d?.nota && (
          <p className="max-w-[95ch] border-t border-[var(--tbh-line)] pt-4 text-[12px] text-[var(--tbh-muted)]">
            {d.nota}
          </p>
        )}
      </section>

      {/* ── PRECEDENTE / SUCCESSIVO ─────────────────────────────────────── */}
      {(d?.precedente || d?.successivo) && (
        <nav className="mt-10 grid gap-3 sm:grid-cols-2" aria-label="Continua a leggere">
          {d?.precedente && (
            <Link
              to={d.precedente.href}
              className="tbh-card flex flex-col gap-1 p-4 transition hover:-translate-y-0.5"
            >
              <span className="inline-flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-[0.18em] text-[var(--tbh-muted)]">
                <ArrowLeft size={12} aria-hidden /> Nella stessa sezione
              </span>
              <span className="text-sm font-extrabold text-white">{d.precedente.titolo}</span>
            </Link>
          )}
          {d?.successivo && (
            <Link
              to={d.successivo.href}
              className="tbh-card flex flex-col gap-1 p-4 text-right transition hover:-translate-y-0.5"
            >
              <span className="inline-flex items-center justify-end gap-2 text-[10px] font-extrabold uppercase tracking-[0.18em] text-[var(--tbh-muted)]">
                Nella stessa sezione <ArrowRight size={12} aria-hidden />
              </span>
              <span className="text-sm font-extrabold text-white">{d.successivo.titolo}</span>
            </Link>
          )}
        </nav>
      )}

      {/* ── CORRELATI ───────────────────────────────────────────────────── */}
      {d && d.correlati.length > 0 && (
        <section className="mt-12" aria-label="Dalla stessa sezione">
          <h2 className="tbh-display mb-4 tbh-h3">
            Ancora da {item.categoriaEmoji} {item.categoriaTitolo}
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {d.correlati.map((c) => (
              <CardEdicola key={c.id} item={c} />
            ))}
          </div>
          <Link
            to={`/edicola/${item.categoria}`}
            className="mt-5 inline-flex items-center gap-2 rounded-full border border-[var(--tbh-line)] px-4 py-2 text-[12px] font-extrabold uppercase tracking-[0.1em] text-[var(--tbh-muted)] transition hover:border-white/40 hover:text-white"
          >
            Tutta la sezione <ArrowRight size={14} aria-hidden />
          </Link>
        </section>
      )}
    </div>
  );
}
