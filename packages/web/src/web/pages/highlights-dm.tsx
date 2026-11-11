import { ExternalLink, Radio, Tv } from "lucide-react";
import { Link } from "wouter";
import { useDmVideo, useSquadre } from "../queries/portale";
import { useDm } from "../queries/tbh";
import { MonitorUrl } from "../components/monitor-url";
import { StemmiMarquee } from "../components/stemmi-marquee";
import { urlVariante } from "../components/logo-box";

/**
 * HIGHLIGHTS SCORSE STAGIONI — ordine di Claudio del 29/08/2026:
 * «in automatico video e url di daniele manuelli con le società di calcio citate,
 *  le metti in esposizione le highlights scorse stagioni».
 *
 * I video sono REALI: presi dal canale ufficiale Daniele Manuelli Official e abbinati
 * alle società confrontando il nome della squadra con il titolo pubblicato da lui.
 * La stagione NON viene scritta dove YouTube non la espone: nessuna annata inventata.
 * Il Rimini Calcio non compare: è società di calcio di interesse del territorio.
 */
export default function HighlightsDmPage() {
  const { data, isLoading } = useDmVideo();
  const squadre = useSquadre();
  const dm = useDm();
  const gruppi = data?.squadre ?? [];
  /* Programmi completi: stanno in area DM, qui solo i pulsanti di accesso.
     Partite integrali, highlights e interviste restano in questa pagina. */
  const programmi = dm.data?.palinsesto ?? [];
  const dmSportLive = dm.data?.canale.sitoEditoriale ?? null;

  return (
    <div className="flex flex-col gap-10 py-8">
      <header className="mx-auto w-full max-w-[1500px] px-4 md:px-8 tbh-rise flex flex-col gap-3">
        <p className="text-xs tracking-[0.25em] text-[var(--tbh-gold)] uppercase">
          Sport · DM Comunicazioni, media partner autonomo
        </p>
        <div className="flex flex-wrap items-center gap-3">
          {data?.dmLogo && (
            <img
              src={urlVariante(data.dmLogo, "icona-standard")}
              alt="DM Comunicazioni"
              className="h-14 w-14 rounded-xl bg-white object-contain p-1"
            />
          )}
          <h1 className="tbh-display tbh-h1 text-[#ff2b2b]">Highlights scorse stagioni</h1>
        </div>
        <p className="tbh-body text-[var(--tbh-muted)] max-w-4xl">
          Video e link presi dal canale ufficiale di Daniele Manuelli e abbinati in automatico alle
          società di calcio seguite. {data ? `${data.totale} video abbinati.` : ""} Le attività dal
          10 agosto 2026 a oggi hanno la data di pubblicazione presa dai feed ufficiali di YouTube e
          si trovano nel filtro ATTUALI della pagina di ogni squadra. Per i video più vecchi la data
          non è esposta da YouTube in questo elenco: restano senza annata, perché le stagioni non le
          inventiamo.
        </p>
        <div className="flex flex-wrap gap-2">
          <a
            href={data?.canale ?? "https://www.youtube.com/@DanieleManuelli1981"}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 rounded-full border border-[#ff2b2b66] px-4 py-2 text-xs font-bold uppercase tracking-wide text-[#ff2b2b]"
          >
            Canale YouTube ufficiale <ExternalLink size={13} />
          </a>
          <Link
            to="/sport/squadre"
            className="rounded-full border border-[var(--tbh-line)] px-4 py-2 text-xs font-bold uppercase tracking-wide text-[var(--tbh-platinum)]"
          >
            Tutte le società di calcio
          </Link>
        </div>
      </header>

      <StemmiMarquee squadre={squadre.data?.squadre ?? []} />

      {/* GUARDA I PROGRAMMI SPORTIVI DM — ordine del 15/09/2026.
          Quattro pulsanti programma + un quinto pulsante, distinto, per il sito
          ufficiale DM Sport Live. I programmi non vengono copiati qui: si aprono
          nella loro sezione in area DM. */}
      {programmi.length > 0 && (
        <section className="mx-auto w-full max-w-[1500px] px-4 md:px-8 flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <h2 className="tbh-display tbh-h2 text-[var(--tbh-platinum)]">
              Guarda i programmi sportivi DM
            </h2>
            <p className="tbh-body text-sm text-[var(--tbh-muted)] max-w-4xl">
              Qui sopra ci sono partite integrali, highlights e interviste. I programmi
              completi di DM Comunicazioni sono un'altra cosa: si guardano nella loro
              sezione.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {programmi.map((p) => (
              <Link
                key={p.slug}
                to={`/dm/programmi?p=${p.slug}`}
                className="group flex flex-col gap-2 rounded-2xl border border-[#ff2b2b33] bg-[var(--tbh-surface)] p-4 transition hover:border-[#ff2b2b]"
              >
                <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-[#ff2b2b]">
                  <Tv size={12} /> Programma DM
                </span>
                <span className="tbh-display text-lg text-[var(--tbh-platinum)] group-hover:text-[#ff2b2b]">
                  {p.name}
                </span>
                <span className="text-xs text-[var(--tbh-muted)]">
                  {p.giornoLabel && p.ora ? `${p.giornoLabel} · ${p.ora}` : "Orario da verificare"}
                </span>
                <span className="mt-auto text-xs font-bold uppercase tracking-wide text-[var(--tbh-gold)]">
                  Apri il programma
                </span>
              </Link>
            ))}
          </div>

          {dmSportLive && (
            <a
              href={dmSportLive.url}
              target="_blank"
              rel="noreferrer"
              className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[var(--tbh-gold)] bg-[var(--tbh-surface)] p-4"
            >
              <span className="flex flex-col gap-1">
                <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--tbh-gold)]">
                  <Radio size={12} /> Sito ufficiale · si apre in una nuova scheda
                </span>
                <span className="tbh-display text-lg text-[var(--tbh-platinum)]">
                  DM Sport Live — notizie e web TV
                </span>
                <span className="text-xs text-[var(--tbh-muted)]">{dmSportLive.cosa}</span>
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--tbh-gold)] px-4 py-2 text-xs font-bold uppercase tracking-wide text-[var(--tbh-gold)]">
                DM Sport Live <ExternalLink size={13} />
              </span>
            </a>
          )}
        </section>
      )}

      {isLoading && (
        <div className="mx-auto w-full max-w-[1500px] px-4 md:px-8 text-[var(--tbh-muted)]">
          Caricamento…
        </div>
      )}

      {gruppi.map((g) => (
        <section key={g.slug} className="mx-auto w-full max-w-[1500px] px-4 md:px-8 flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              {g.logo && (
                <img
                  src={urlVariante(g.logo, "icona-standard")}
                  alt={`Stemma ${g.nome}`}
                  className="h-14 w-14 object-contain"
                  style={{ filter: `drop-shadow(0 0 14px ${g.colore}66)` }}
                />
              )}
              <h2 className="tbh-display tbh-h2" style={{ color: g.colore }}>
                {g.nome}
              </h2>
            </div>
            <Link
              to={`/sport/squadre/${g.slug}`}
              className="rounded-full border px-4 py-2 text-xs font-bold uppercase tracking-wide"
              style={{ borderColor: g.colore, color: g.colore }}
            >
              Pagina società · {g.totale} video DM
            </Link>
          </div>

          {g.highlights.length ? (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {g.highlights.slice(0, 3).map((v) => (
                <MonitorUrl
                  key={v.url}
                  titolo={v.titolo}
                  url={v.url}
                  chiave={`dm-hub:${g.slug}:${v.url}`}
                  cta="Guarda su YouTube"
                  archivio={data?.canale ?? null}
                  colore="#ff2b2b"
                  argomento={`${g.nome} — ${v.titolo}`}
                />
              ))}
            </div>
          ) : (
            <p className="text-sm text-[var(--tbh-muted)]">
              Nessun video titolato «Highlights» per questa società sul canale: sotto trovi gli
              altri servizi pubblicati da Daniele Manuelli.
            </p>
          )}

          {g.highlights.length > 3 && (
            <ul className="grid gap-1.5 md:grid-cols-2">
              {g.highlights.slice(3).map((v) => (
                <li key={v.url}>
                  <a
                    href={v.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-start gap-1.5 text-sm text-[var(--tbh-platinum)] hover:text-[var(--tbh-neon)]"
                  >
                    <ExternalLink size={13} className="mt-1 shrink-0" /> {v.titolo}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </section>
      ))}

      <p className="mx-auto w-full max-w-[1500px] px-4 md:px-8 text-xs text-[var(--tbh-muted)]">
        {data?.nota}
      </p>
    </div>
  );
}
