import { Link, useSearchParams } from "wouter";
import { ExternalLink, MapPin, Trophy, Smartphone, Store, Newspaper } from "lucide-react";
import { useSquadra } from "../queries/portale";
import { LogoBox } from "../components/tiles";
import {
  BloccoAttesa,
  SpazioCommerciale,
  PulsantiEsterni,
  etichettaRete,
  CtaCommerciale,
  SigilloDm,
} from "../components/monitor";
import { MonitorUrl, FrecceNav } from "../components/monitor-url";
import { waInfo } from "../lib/whatsapp";
import { trovaKit, hrefSocieta } from "../lib/kit-societa";
import { MiTroviQui } from "../components/mi-trovi-qui";
import { LOGHI_CHANNEL } from "../../api/data/loghi-channel";
import {
  TreMonitorPartite,
  type PartitaTriple,
  type ContenutoSocietaTriple,
} from "../components/tre-monitor-partite";

/** Path dei loghi originali approvati (loghi-channel.ts): servono solo per la didascalia. */
const LOGHI_APPROVATI = new Set(Object.values(LOGHI_CHANNEL).map((l) => l.src));

/**
 * TEMPLATE SPORTIVO UNICO — brief "PORTALE A MONITOR" punti 1 e 5,
 * aggiornato con gli ordini di Claudio del 29/08/2026:
 * · stemma grande in testata (file estratto dai mockup, confermati ufficiali);
 * · monitor PARTITA INTEGRALE + HIGHLIGHTS con SPAZIO URL: si accendono subito incollando il link;
 * · colonna ULTIME NEWS;
 * · blocchi DA ALLESTIRE: risultati, classifica, prossimo turno, marcatori, diffidati,
 *   giocatore della settimana (estrazione random solo quando arriva la rosa reale);
 * · spazi commerciali con rete di appartenenza: TBH / DM / TBH + DM;
 * · barra imprese e professionisti;
 * · blocco app ufficiale DICHIARATO (nessun badge store finto);
 * · fascia finale DM media partner autonomo + social ufficiali;
 * · frecce avanti/indietro tra le società.
 * Nessun risultato, classifica, data o nome inventato: i blocchi restano dichiarati.
 */
export default function SquadraPage({ slug }: { slug: string }) {
  const { data, isLoading } = useSquadra(slug);
  /* ARRIVO DA «PARTITE IN EVIDENZA» (home): ?partita=<match_id> apre questa pagina
     già sulla partita giusta. Nessuna pagina nuova per la singola partita: la
     scheda della società resta l'unico indirizzo. */
  const [parametri] = useSearchParams();
  const partitaDaAprire = parametri.get("partita");

  if (isLoading) {
    return <div className="mx-auto max-w-6xl px-4 py-16 text-[var(--tbh-muted)]">Caricamento…</div>;
  }

  const s = data?.squadra;
  if (!s) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-16 flex flex-col gap-4">
        <h1 className="tbh-display tbh-h1">Società non trovata</h1>
        <p className="text-[var(--tbh-muted)]">
          La pagina richiesta non è tra le società seguite pubblicate.
        </p>
        <Link href="/sport/squadre" className="tbh-neon-btn self-start px-5 py-2.5">
          Tutte le società seguite
        </Link>
      </div>
    );
  }

  const colore = s.colore;
  /* Kit ufficiale della società (scheda, timbro e firma, annunci, negozio): se c'è,
     la testata porta alla pagina dedicata invece di duplicarne i contenuti. */
  const kit = trovaKit(s.slug);
  const esterni = [
    ...(s.sito ? [{ etichetta: "Sito ufficiale", url: s.sito }] : []),
    ...s.social.map((x) => ({ etichetta: etichettaRete(x.rete), url: x.url })),
  ];
  const frecce = (
    <FrecceNav
      colore={colore}
      etichetta="Società seguite"
      indice={data?.indice}
      totale={data?.totale}
      prima={data?.prima ? { href: `/sport/squadre/${data.prima.slug}`, nome: data.prima.nome } : null}
      dopo={data?.dopo ? { href: `/sport/squadre/${data.dopo.slug}`, nome: data.dopo.nome } : null}
    />
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 md:py-12 flex flex-col gap-8">
      {frecce}

      {/* TESTATA: stemma grande + nome per esteso + pulsanti esterni */}
      <header
        className="tbh-rise grid gap-6 md:grid-cols-[280px_1fr] items-center rounded-3xl border p-5 md:p-7"
        style={{
          borderColor: `${colore}55`,
          background: `radial-gradient(120% 140% at 0% 0%, ${colore}22 0%, transparent 60%)`,
        }}
      >
        <div className="grid place-items-center">
          {s.logo ? (
            <img
              src={s.logo}
              alt={`Stemma ${s.nome}`}
              className="h-44 w-44 md:h-56 md:w-56 object-contain drop-shadow-[0_0_28px_rgba(0,0,0,0.6)]"
              style={{ filter: `drop-shadow(0 0 24px ${colore}66)` }}
            />
          ) : (
            <LogoBox name={s.nome} logo={null} size="lg" url={s.sito} />
          )}
        </div>
        <div className="flex flex-col gap-3">
          {s.gruppo && (
            <span
              className="self-start rounded-full border px-3 py-1 text-[11px] font-bold uppercase tracking-wider"
              style={{ borderColor: colore, color: colore }}
            >
              TBH Official · Società del gruppo
            </span>
          )}
          <h1 className="tbh-display tbh-h1 leading-none" style={{ color: colore }}>
            {s.nome}
          </h1>
          {s.payoff && <p className="tbh-h3 text-[var(--tbh-platinum)]">{s.payoff}</p>}
          <div className="flex flex-wrap gap-4 text-sm text-[var(--tbh-muted)]">
            {s.categoria && (
              <span className="inline-flex items-center gap-1.5">
                <Trophy size={15} /> {s.categoria}
              </span>
            )}
            {s.campo && (
              <span className="inline-flex items-center gap-1.5">
                <MapPin size={15} /> {s.campo}
              </span>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <PulsantiEsterni links={esterni} />
            {/* «MI TROVI QUI»: se la società non ha sito o canale, la posizione del campo
                resta comunque raggiungibile. Nessun indirizzo inventato: nome + campo + città. */}
            <MiTroviQui nome={s.nome} citta={s.citta} indirizzo={s.campo} />
          </div>
          {data?.seguitaDaDm && (
            <SigilloDm testo="Squadra seguita da DM" logo={data.dmLogo} to="/media/dm/crew" />
          )}
          {kit && (
            <Link
              href={hrefSocieta(kit.codice)}
              className="tbh-neon-btn self-start px-5 py-2.5 inline-flex items-center gap-2"
            >
              Pagina ufficiale della società · scheda, timbro e firma
            </Link>
          )}
          {s.logo && !kit && (
            <p className="text-[11px] text-[var(--tbh-muted)]">
              {LOGHI_APPROVATI.has(s.logo)
                ? "Logo originale consegnato dall'editore e approvato il 19/10/2026: file intero, senza modifiche."
                : "Stemma preso dai mockup inviati dalla direzione. Se il file non corrisponde all'originale della società, mandaci il vettoriale e lo sostituiamo."}
            </p>
          )}
        </div>
      </header>

      {/* MODULO TRE MONITOR — un record per match_id: integrale, highlights, interviste.
          Ricostruito dai titoli reali del canale: vedi docs/modulo-tre-monitor.md. */}
      {(data?.partite?.length ?? 0) > 0 && (
        <TreMonitorPartite
          squadra={s.nomeBreve}
          colore={colore}
          partite={(data?.partite ?? []) as PartitaTriple[]}
          contenuti={(data?.contenutiSocieta ?? []) as ContenutoSocietaTriple[]}
          conteggi={data?.conteggiPartite}
          nota={data?.partiteNota}
          canale={data?.canaleDm}
          apri={partitaDaAprire}
        />
      )}

      {/* MONITOR: partita integrale + highlights, con SPAZIO URL */}
      <section className="flex flex-col gap-3">
        <div className="grid gap-4 md:grid-cols-2">
          {s.monitor.map((m) => (
            <MonitorUrl
              key={m.titolo}
              titolo={m.titolo}
              url={m.url}
              chiave={`squadra:${s.slug}:${m.titolo}`}
              cta={m.cta}
              archivio={m.archivio}
              colore={colore}
              argomento={s.nome}
            />
          ))}
        </div>
        <p className="text-xs text-[var(--tbh-muted)]">
          I due monitor hanno il campo URL: incolla il link della partita integrale o degli
          highlights e il player parte subito. Finché non ci mandi il link ufficiale, l'URL resta
          salvato solo sul tuo dispositivo — non viene pubblicato per gli altri utenti.
        </p>
      </section>

      {/* HIGHLIGHTS E VIDEO DM — abbinati automaticamente dal canale ufficiale di Daniele Manuelli */}
      {data?.video && (
        <section className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="tbh-display tbh-h2 uppercase inline-flex items-center gap-2" style={{ color: "#ff2b2b" }}>
              {data.dmLogo && (
                <img
                  src={data.dmLogo}
                  alt="DM Comunicazioni"
                  className="h-9 w-9 rounded-lg bg-white object-contain p-0.5"
                />
              )}
              Highlights scorse stagioni · DM Comunicazioni
            </h2>
            <a
              href={data.canaleDm}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 rounded-full border border-[#ff2b2b66] px-3 py-1.5 text-[11px] font-bold uppercase tracking-wide text-[#ff2b2b]"
            >
              Tutti i {data.video.totale} video di {s.nomeBreve} <ExternalLink size={12} />
            </a>
          </div>

          {data.video.highlights.length > 0 && (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {data.video.highlights.map((v) => (
                <MonitorUrl
                  key={v.url}
                  titolo={v.titolo}
                  url={v.url}
                  chiave={`dm:${s.slug}:${v.url}`}
                  cta="Guarda su YouTube"
                  archivio={data.canaleDm}
                  colore="#ff2b2b"
                  argomento={`${s.nome} — ${v.titolo}`}
                />
              ))}
            </div>
          )}

          <div className="grid gap-4 md:grid-cols-2">
            {[
              { titolo: "Interviste", lista: data.video.interviste },
              { titolo: "Servizi e partite", lista: data.video.servizi },
            ].map((g) =>
              g.lista.length ? (
                <div key={g.titolo} className="tbh-card p-4 flex flex-col gap-2">
                  <h3 className="tbh-display text-base uppercase text-[#ff2b2b]">{g.titolo}</h3>
                  <ul className="flex flex-col gap-1.5">
                    {g.lista.map((v) => (
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
                </div>
              ) : null,
            )}
          </div>

          <p className="text-xs text-[var(--tbh-muted)]">{data.videoNota}</p>
        </section>
      )}

      {/* SOCIETÀ DI INTERESSE DEL TERRITORIO — nessun video DM abbinato */}
      {data?.territorio && (
        <section className="rounded-2xl border p-5 flex flex-col gap-2" style={{ borderColor: `${colore}55` }}>
          <h2 className="tbh-display tbh-h3 uppercase" style={{ color: colore }}>
            Società di calcio di interesse del territorio
          </h2>
          <p className="text-sm text-[var(--tbh-muted)]">
            {s.nomeBreve} è pubblicato come società di calcio di interesse del territorio, per il
            territorio. Non è fra le squadre seguite da DM Comunicazioni e su questa pagina non
            vengono abbinati video del canale di Daniele Manuelli.
          </p>
        </section>
      )}

      {/* DATI DA ALLESTIRE + COLONNA ULTIME NEWS */}
      <section className="grid gap-6 lg:grid-cols-[1fr_340px] items-start">
        <div className="flex flex-col gap-4">
          <h2 className="tbh-display tbh-h2" style={{ color: colore }}>
            Risultati, classifica, marcatori e diffidati
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            {(data?.blocchi ?? []).map((b) => (
              <BloccoAttesa
                key={b.chiave}
                titolo={b.titolo}
                attesa={b.attesa}
                cta={b.cta}
                colore={colore}
              />
            ))}
          </div>
          <p className="text-xs text-[var(--tbh-muted)]">{data?.nota}</p>
        </div>

        <aside className="flex flex-col gap-4">
          <h2
            className="tbh-display text-lg uppercase tracking-wide inline-flex items-center gap-2"
            style={{ color: colore }}
          >
            <Newspaper size={18} /> Ultime news
          </h2>
          <BloccoAttesa
            titolo="Ultime news della società"
            attesa="Comunicati e contenuti ufficiali da pubblicare: nessuna notizia viene inventata."
            cta="Invia una news ufficiale"
            colore={colore}
          />
          <div className="tbh-card p-4 flex flex-col gap-3">
            <h3 className="tbh-display text-base">Programmi che seguono la squadra</h3>
            {s.media.length ? (
              s.media.map((m) => (
                <a
                  key={m.nome + m.url}
                  href={m.url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex flex-col gap-1 rounded-xl border border-[var(--tbh-line)] p-3 hover:border-[var(--tbh-neon)]"
                >
                  <span className="inline-flex items-center gap-1.5 text-sm font-bold">
                    {m.nome} <ExternalLink size={13} />
                  </span>
                  <span className="text-xs text-[var(--tbh-muted)]">{m.nota}</span>
                </a>
              ))
            ) : (
              <p className="text-sm text-[var(--tbh-muted)]">
                Nessun programma collegato pubblicato: canali ufficiali da confermare.
              </p>
            )}
          </div>
        </aside>
      </section>

      {/* SPAZI COMMERCIALI DISPONIBILI — con rete di appartenenza TBH / DM / TBH + DM */}
      <section className="flex flex-col gap-4">
        <h2 className="tbh-display tbh-h2 uppercase inline-flex items-center gap-2" style={{ color: colore }}>
          <Store size={20} /> Spazi commerciali disponibili
        </h2>
        <p className="text-sm text-[var(--tbh-muted)]">
          Ogni spazio indica la rete di appartenenza: <strong>TBH</strong> (rete commerciale Touch
          Business Holding), <strong>DM</strong> (contenuti di DM Comunicazioni, media partner
          autonomo) oppure <strong>TBH + DM</strong> quando la presenza è su entrambe. Lo stato
          pubblicato resta «da confermare» finché la direzione commerciale non manda quello reale.
        </p>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {(data?.spazi ?? []).map((sp) => (
            <div key={sp.titolo} className="flex flex-col gap-2">
              <span
                className="self-start rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider"
                style={{
                  borderColor:
                    sp.rete === "DM" ? "#ff2b2b" : sp.rete === "TBH" ? "#d7ff00" : "#33e0ff",
                  color: sp.rete === "DM" ? "#ff2b2b" : sp.rete === "TBH" ? "#d7ff00" : "#33e0ff",
                }}
              >
                Rete {sp.rete}
              </span>
              <SpazioCommerciale titolo={sp.titolo} descrizione={sp.descrizione} stato={sp.stato} />
            </div>
          ))}
        </div>
      </section>

      {/* BARRA IMPRESE E PROFESSIONISTI */}
      <section
        className="rounded-2xl border p-5 flex flex-col gap-3"
        style={{ borderColor: `${colore}55` }}
      >
        <h2 className="tbh-display tbh-h3 uppercase" style={{ color: colore }}>
          Imprese e professionisti insieme per {s.nomeBreve}
        </h2>
        <p className="text-sm text-[var(--tbh-muted)]">
          La fascia partner pubblica solo attività realmente aderenti, con logo ufficiale e nome per
          esteso. Nessun marchio viene ricostruito e nessuna attività diventa partner o cliente in
          automatico.
        </p>
        <div className="flex flex-wrap gap-3">
          <CtaCommerciale
            tipo="informazioni"
            argomento={`Fascia imprese e professionisti — ${s.nome}`}
            colore={colore}
          />
          <Link
            href="/tbh/attivita"
            className="rounded-full border px-4 py-2.5 text-sm font-bold uppercase tracking-wide"
            style={{ borderColor: colore, color: colore }}
          >
            Attività della rete
          </Link>
        </div>
      </section>

      {/* APP UFFICIALE — dichiarata, nessun badge store finto */}
      {data?.app && (
        <section className="tbh-card p-5 flex flex-col gap-3">
          <h2 className="tbh-display tbh-h3 inline-flex items-center gap-2">
            <Smartphone size={18} /> {data.app.titolo}
          </h2>
          <span
            className="self-start rounded-full border px-3 py-1 text-[11px] font-bold uppercase tracking-wider"
            style={{ borderColor: "var(--tbh-gold)", color: "var(--tbh-gold)" }}
          >
            {data.app.stato}
          </span>
          <p className="text-sm text-[var(--tbh-muted)]">{data.app.testo}</p>
          <a
            href={waInfo(`${data.app.titolo} — ${s.nome}`)}
            target="_blank"
            rel="noreferrer"
            className="self-start rounded-full px-4 py-2 text-xs font-bold uppercase tracking-wide text-black"
            style={{ background: colore }}
          >
            {data.app.cta}
          </a>
        </section>
      )}

      {/* NOTE + CTA UNICA */}
      <section className="tbh-card p-5 flex flex-col gap-3">
        <h2 className="tbh-display tbh-h3">Note ufficiali</h2>
        {s.note.length ? (
          <ul className="list-disc pl-5 text-sm text-[var(--tbh-muted)] flex flex-col gap-1">
            {s.note.map((n) => (
              <li key={n}>{n}</li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-[var(--tbh-muted)]">Nessuna nota da segnalare.</p>
        )}
        <div className="flex flex-wrap items-center gap-3 pt-1">
          <CtaCommerciale tipo="informazioni" argomento={`Spazi e partnership — ${s.nome}`} colore={colore} />
          <Link href="/sport/squadre" className="text-sm font-semibold text-[var(--tbh-muted)] hover:text-[var(--tbh-neon)]">
            Tutte le società seguite
          </Link>
          <a
            href={waInfo(`Logo ufficiale e materiali — ${s.nome}`)}
            target="_blank"
            rel="noreferrer"
            className="text-sm font-semibold text-[var(--tbh-gold)]"
          >
            Invia logo e materiali ufficiali
          </a>
        </div>
      </section>

      {/* FASCIA FINALE DM — media partner autonomo */}
      <section className="rounded-2xl border border-[#ff2b2b55] p-5 flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-3">
          {data?.dmLogo && (
            <img
              src={data.dmLogo}
              alt="DM Comunicazioni"
              className="h-12 w-12 rounded-lg bg-white object-contain p-1"
            />
          )}
          <div>
            <h2 className="tbh-display tbh-h3 text-[#ff2b2b]">DM Comunicazioni — media partner</h2>
            <p className="text-xs text-[var(--tbh-muted)]">
              Media partner autonomo: non è una società del gruppo TBH.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <a
            href="https://www.youtube.com/@DanieleManuelli1981"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 rounded-full border border-[#ff2b2b66] px-3 py-1.5 text-[11px] font-bold uppercase tracking-wide text-[#ff2b2b]"
          >
            YouTube <ExternalLink size={12} />
          </a>
          <a
            href="https://www.facebook.com/share/17pCJoQvh4"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 rounded-full border border-[#ff2b2b66] px-3 py-1.5 text-[11px] font-bold uppercase tracking-wide text-[#ff2b2b]"
          >
            Facebook <ExternalLink size={12} />
          </a>
          <a
            href="https://www.facebook.com/sportuprimini"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 rounded-full border border-[#ff2b2b66] px-3 py-1.5 text-[11px] font-bold uppercase tracking-wide text-[#ff2b2b]"
          >
            Sport Up Rimini <ExternalLink size={12} />
          </a>
          <Link
            href="/media/dm/crew"
            className="rounded-full bg-[#ff2b2b] px-3 py-1.5 text-[11px] font-bold uppercase tracking-wide text-black"
          >
            DM Crew
          </Link>
        </div>
      </section>

      {frecce}
    </div>
  );
}
