import { useMemo, useState } from "react";
import { Music4, Radio } from "lucide-react";
import { Link } from "wouter";
import { useMusica, useTouchMusic } from "../queries/portale";
import { CatalogoMusicaPubblico } from "../components/catalogo-musica-pubblico";
import { LogoBox } from "../components/tiles";
import {
  BloccoAttesa,
  SpazioCommerciale,
  PulsantiEsterni,
  CtaCommerciale,
  etichettaRete,
} from "../components/monitor";
import { MonitorUrl, FrecceNav } from "../components/monitor-url";
import { SfondoSkyline } from "../components/skyline";
import { LOGHI_TBH, MATERIALE_TBH, NOTA_LOGHI } from "../lib/loghi-tbh";
import { waInfo } from "../lib/whatsapp";
import { SezioneAmministrabile } from "../components/sezione-amministrabile";
import { AnnuncioBallerineJcHugo } from "../components/annuncio-ballerine-jc-hugo";
import { RadioSezione } from "../components/radio-sezione";
import { CollegamentiMusica, ElencoUscite } from "../components/uscite-musicali";

/**
 * AREA MUSICA / J.C. HUGÒ — brief "PORTALE A MONITOR" punto 3 + ordine del 29/08/2026:
 * «VOGLIO CHE SI VEDANO TUTTI I BRANI PER ASCOLTARLI E SOPRA IL MONITOR CON CUI
 *  INSERIRE URL DEL BRANO STESSO».
 *
 * Come è fatto, senza inventare nulla:
 * · monitor grande in cima = brano selezionato, con il SUO spazio URL;
 * · sotto, l'elenco di TUTTI gli slot brano: si clicca e il monitor sopra cambia;
 * · i titoli reali non sono ancora arrivati → slot numerati e dichiarati, nessun titolo inventato;
 * · frecce avanti/indietro per scorrere i brani.
 * Le sezioni già acquisite (monitor videoclip/audio, blocchi, spazi, booking) restano tutte.
 *
 * AGGIORNAMENTO 29/09/2026 — Priorità 2ter, ordine di Claudio:
 * «I brani sono AUDIO PUBBLICATO, non produzioni audiovisive già realizzate.»
 * Per questo è stato TOLTO da questa pagina il modulo "tre monitor per uscita", che
 * apriva per ogni brano un monitor "videoclip ufficiale" e uno "backstage": erano
 * spazi vuoti che facevano sembrare ogni brano una produzione audiovisiva completa.
 * Al suo posto c'è il CATALOGO AUDIO con i sotto-menu richiesti, dove ogni brano
 * dichiara il suo stato reale: 🎵 SOLO AUDIO · 🎵+🎬 VIDEO IN PRODUZIONE · 🎵+🎬 AUDIO & VIDEO.
 * Il monitor con lo spazio URL del brano selezionato (ordine del 29/08/2026) resta.
 */

/**
 * AGGIORNAMENTO 29/09/2026 — correzione del catalogo musicale.
 * I sotto-menu, i contatori e le schede del catalogo non stanno più in questa pagina:
 * stanno in un componente solo (`CatalogoMusicaPubblico`) che legge il catalogo unico
 * `catalogoMusicale.catalogo`. Così la stessa scheda vale a Musica, a Produzioni e a
 * Road to 2030, e un brano si pubblica con la sua sorgente d'ascolto reale — Suno,
 * YouTube, YouTube Music o un file audio — senza aspettare il videoclip.
 */

export default function MusicaPage() {
  const { data, isLoading } = useMusica();
  const tm = useTouchMusic();
  const [attivo, setAttivo] = useState(0);

  const brani = data?.brani ?? [];
  const brano = brani[attivo] ?? null;

  const etichetta = useMemo(
    () => (brano ? (brano.titolo ?? `Brano n° ${brano.numero} — titolo da ricevere`) : "—"),
    [brano],
  );

  if (isLoading || !data) {
    return <div className="mx-auto max-w-6xl px-4 py-16 text-[var(--tbh-muted)]">Caricamento…</div>;
  }

  const h = data.hugo;
  const colore = h.colore;

  const playlist = h.esterni.find((e) => e.rete === "YouTube")?.url ?? null;

  return (
    <div className="relative overflow-hidden mx-auto max-w-6xl px-4 py-8 md:py-12 flex flex-col gap-8">
      <SfondoSkyline colore={colore} altezza={300} />
      {/* J.C. HUGÒ RADIO (14/10/2026): web radio 24/7 in cima alla sezione esistente.
          Tutto quello che c'era sotto resta com'era. */}
      <RadioSezione />
      <header className="relative z-10 grid gap-6 md:grid-cols-[240px_1fr] items-center">
        <div className="md:col-span-2 flex flex-wrap items-center gap-6">
          <img
            src={LOGHI_TBH.find((l) => l.slug === "deejay-hugo")!.file}
            alt="Deejay Hugò"
            className="h-16 md:h-20 w-auto object-contain"
          />
          <img
            src={LOGHI_TBH.find((l) => l.slug === "jc-hugo")!.file}
            alt="J.C. Hugò"
            className="h-16 md:h-20 w-auto object-contain"
          />
          <img
            src={LOGHI_TBH.find((l) => l.slug === "tbh-records")!.file}
            alt="TBH Records"
            className="h-14 md:h-16 w-auto object-contain"
          />
        </div>
        <LogoBox name={h.nome} logo={h.foto} size="lg" url={h.esterni[0]?.url ?? null} />
        <div className="flex flex-col gap-3">
          <span className="text-xs uppercase tracking-[0.2em] text-[var(--tbh-gold)]">
            Area Musica · Progetto artistico del gruppo
          </span>
          <h2 className="tbh-display tbh-h1 leading-none" style={{ color: colore }}>
            {h.nome}
          </h2>
          <p className="tbh-h3 text-[var(--tbh-platinum)]">{h.payoff}</p>
          <p className="text-sm text-[var(--tbh-muted)]">{h.nomeEsteso}</p>
          <PulsantiEsterni links={h.esterni.map((e) => ({ etichetta: e.rete, url: e.url }))} />
        </div>
      </header>

      {/* LOCANDINA UFFICIALE «Deejay Hugò · CEO & Founder» — file consegnato da Claudio,
          pubblicato a pagina intera e cliccabile. Nessun fotomontaggio. */}
      <section className="relative z-10 flex flex-col gap-3">
        <h2 className="tbh-display tbh-h2" style={{ color: colore }}>
          Locandina ufficiale
        </h2>
        <a
          href={MATERIALE_TBH.locandinaDeejayHugo}
          target="_blank"
          rel="noreferrer"
          className="tbh-card overflow-hidden block"
          style={{ borderColor: `${colore}66` }}
        >
          <img
            src={MATERIALE_TBH.locandinaDeejayHugo}
            alt="Deejay Hugò — CEO & Founder Touch Business Holding"
            className="w-full h-auto object-contain"
          />
        </a>
        <p className="text-xs text-[var(--tbh-muted)]">{NOTA_LOGHI}</p>
      </section>

      {/* CASTING IN CORSO (03/10/2026) — 4 ballerine per la crew videoclip di J.C. Hugò. */}
      <div className="relative z-10">
        <AnnuncioBallerineJcHugo linkPaginaArtista={false} />
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          TOUCH MUSIC · IL CATALOGO UFFICIALE DI J.C. HUGÒ — Priorità 2ter.
          Un solo database master (musica.catalogo): qui si filtra, non si copia.
          Ogni brano dichiara il suo stato reale e nessun pulsante GUARDA compare
          su un brano che non ha un videoclip pubblicato.
          ══════════════════════════════════════════════════════════════════════ */}
      {/* USCITE E COLLEGAMENTI (04/11/2026, round 16): le schede di pubblicazione e i collegamenti
          reciproci fra Records Channel, Radio, Touch Music Channel, catalogo e calendario. */}
      <div className="relative z-10 flex flex-col gap-4">
        <ElencoUscite />
        <CollegamentiMusica titolo="Area musica · collegamenti" />
      </div>

      <div id="brani" className="scroll-mt-24">
        <CatalogoMusicaPubblico colore={colore} playlist={playlist} />
      </div>

      {/* MONITOR DEL BRANO SELEZIONATO — sopra l'elenco, con spazio URL */}
      <section className="flex flex-col gap-4">
        <h2 className="tbh-display tbh-h2 flex items-center gap-2" style={{ color: colore }}>
          <Music4 size={22} /> Ascolta i brani
        </h2>

        <FrecceNav
          prima={
            brani.length > 1
              ? {
                  href: "#",
                  nome:
                    brani[(attivo - 1 + brani.length) % brani.length].titolo ??
                    `Brano n° ${brani[(attivo - 1 + brani.length) % brani.length].numero}`,
                }
              : null
          }
          dopo={
            brani.length > 1
              ? {
                  href: "#",
                  nome:
                    brani[(attivo + 1) % brani.length].titolo ??
                    `Brano n° ${brani[(attivo + 1) % brani.length].numero}`,
                }
              : null
          }
          colore={colore}
          etichetta="Scorri i brani"
          indice={attivo}
          totale={brani.length}
          onPrima={() => setAttivo((i) => (i - 1 + brani.length) % brani.length)}
          onDopo={() => setAttivo((i) => (i + 1) % brani.length)}
        />

        {brano && (
          <MonitorUrl
            key={brano.numero}
            titolo={`Monitor brano — ${etichetta}`}
            url={brano.url}
            chiave={`hugo-brano-${brano.numero}`}
            colore={colore}
            cta="Apri il brano"
            archivio={h.esterni[0]?.url ?? null}
            argomento={`${h.nome} — brano n° ${brano.numero}`}
          />
        )}

        {/* ELENCO COMPLETO DEI BRANI: si vedono tutti, si clicca e il monitor cambia */}
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {brani.map((b, i) => (
            <button
              key={b.numero}
              type="button"
              onClick={() => setAttivo(i)}
              aria-current={i === attivo}
              className="tbh-card flex items-center gap-3 p-3 text-left transition hover:bg-white/5"
              style={{ borderColor: i === attivo ? colore : "var(--tbh-line)" }}
            >
              <span
                className="grid h-9 w-9 shrink-0 place-items-center rounded-full border text-xs font-bold"
                style={{ borderColor: `${colore}88`, color: colore }}
              >
                {b.numero}
              </span>
              <span className="min-w-0 flex flex-col">
                <span className="truncate text-sm font-bold">
                  {b.titolo ?? "Titolo da ricevere"}
                </span>
                <span className="truncate text-[11px] text-[var(--tbh-muted)]">
                  {b.url ? "Link ufficiale in archivio" : "Slot libero: incolla l'URL nel monitor sopra"}
                </span>
              </span>
            </button>
          ))}
        </div>
        <p className="text-xs text-[var(--tbh-muted)]">{data.braniNota}</p>
      </section>

      {/* MONITOR STORICI: videoclip e audio, ora con spazio URL */}
      <section className="grid gap-4 md:grid-cols-2">
        {h.monitor.map((m, i) => (
          <MonitorUrl
            key={m.titolo}
            titolo={m.titolo}
            url={m.url}
            chiave={`hugo-monitor-${i}`}
            colore={colore}
            cta={m.cta}
            archivio={m.archivio}
            argomento={h.nome}
          />
        ))}
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="tbh-display tbh-h2" style={{ color: colore }}>
          Discografia, video, news, eventi e gallery
        </h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {h.blocchi.map((b) => (
            <BloccoAttesa
              key={b.titolo}
              titolo={b.titolo}
              attesa={b.attesa}
              cta="Invia i materiali ufficiali"
              colore={colore}
            />
          ))}
        </div>
        <p className="text-xs text-[var(--tbh-muted)]">{data.nota}</p>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="tbh-display tbh-h2 flex items-center gap-2" style={{ color: colore }}>
          <Radio size={20} /> Booking e spazi commerciali
        </h2>
        <div className="grid gap-4 md:grid-cols-3">
          {h.spazi.map((s) => (
            <SpazioCommerciale key={s.titolo} titolo={s.titolo} descrizione={s.descrizione} stato={s.stato} />
          ))}
          <div className="tbh-card p-4 flex flex-col gap-2" style={{ borderColor: `${colore}55` }}>
            <h4 className="tbh-display text-base leading-tight">Booking serate e set</h4>
            <p className="text-sm text-[var(--tbh-muted)]">
              Richiesta di disponibilità per serate, eventi e produzioni. Nessun compenso pubblicato:
              il preventivo si concorda direttamente.
            </p>
            <a
              href={waInfo(`Booking ${h.nome}`)}
              target="_blank"
              rel="noreferrer"
              className="mt-1 inline-flex self-start rounded-full px-3 py-1.5 text-[11px] font-bold uppercase tracking-wide text-black"
              style={{ background: colore }}
            >
              Richiedi booking
            </a>
          </div>
        </div>
        <p className="text-[11px] uppercase tracking-wide text-[var(--tbh-muted)]">
          Stato spazi: {h.spazi.map((s) => etichettaRete(s.stato)).join(" · ")}
        </p>
        <CtaCommerciale tipo="informazioni" argomento={`Spazi e partnership — ${h.nome}`} colore={colore} />
      </section>

      {/* TOUCH MUSIC RADIO TV · TOUCH PRODUCTION LTD — scheda ufficiale del canale inviata
          dalla direzione il 29/08/2026: dati, siti e social riportati senza modifiche. */}
      {tm.data && (
        <section className="flex flex-col gap-5">
          <h2 className="tbh-display tbh-h2 flex items-center gap-2" style={{ color: colore }}>
            <Radio size={20} /> Touch Music Radio TV · Touch Production Ltd
          </h2>

          <div className="grid gap-4 md:grid-cols-2">
            <article className="tbh-card p-5 flex flex-col gap-3" style={{ borderColor: `${colore}55` }}>
              <h3 className="tbh-display tbh-h3">{tm.data.canale.titolare}</h3>
              <dl className="grid grid-cols-3 gap-3 text-center">
                {[
                  { k: "Iscritti", v: tm.data.canale.iscritti.toLocaleString("it-IT") },
                  { k: "Video", v: tm.data.canale.video.toLocaleString("it-IT") },
                  { k: "Visualizzazioni", v: tm.data.canale.visualizzazioni.toLocaleString("it-IT") },
                ].map((n) => (
                  <div key={n.k} className="rounded-xl border border-[var(--tbh-line)] px-2 py-3">
                    <dd className="tbh-display text-2xl leading-none" style={{ color: colore }}>
                      {n.v}
                    </dd>
                    <dt className="text-[10px] uppercase tracking-wider text-[var(--tbh-muted)] mt-1">
                      {n.k}
                    </dt>
                  </div>
                ))}
              </dl>
              <p className="text-sm text-[var(--tbh-muted)]">
                {tm.data.canale.paese} · canale aperto il {tm.data.canale.dataIscrizione}
              </p>
              <div className="flex flex-wrap gap-2">
                <a
                  href={tm.data.canale.url}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-full px-4 py-2 text-xs font-bold uppercase tracking-wide text-black"
                  style={{ background: colore }}
                >
                  Apri il canale YouTube
                </a>
                <a
                  href={tm.data.suno.url}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-full border border-[var(--tbh-line)] px-4 py-2 text-xs font-bold uppercase tracking-wide hover:border-[var(--tbh-neon)]"
                >
                  Suno {tm.data.suno.handle}
                </a>
              </div>
              <p className="text-[11px] text-[var(--tbh-muted)] leading-relaxed">{tm.data.canale.nota}</p>
            </article>

            <article className="tbh-card p-5 flex flex-col gap-3" style={{ borderColor: `${colore}55` }}>
              <h3 className="tbh-display tbh-h3">©Touch Production Ltd® — produzioni e servizi</h3>
              <ul className="grid gap-1.5 sm:grid-cols-2 text-sm">
                {tm.data.produzioni.map((v) => (
                  <li key={v} className="flex gap-2">
                    <span style={{ color: colore }}>·</span>
                    <span>{v.replace("Produzioni e Servizi ", "")}</span>
                  </li>
                ))}
              </ul>
              <div className="rounded-xl border p-3 flex flex-col gap-2" style={{ borderColor: `${colore}66` }}>
                <p className="text-sm font-bold" style={{ color: colore }}>
                  {tm.data.selezioni.titolo}
                </p>
                <p className="text-sm text-[var(--tbh-muted)]">{tm.data.selezioni.testo}</p>
                <div className="flex flex-wrap gap-2">
                  <Link
                    href="/lavoro-casting/candidature"
                    className="rounded-full px-4 py-2 text-xs font-bold uppercase tracking-wide text-black"
                    style={{ background: colore }}
                  >
                    Candidati online
                  </Link>
                  <a
                    href={tm.data.selezioni.whatsapp}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-full border border-[var(--tbh-line)] px-4 py-2 text-xs font-bold uppercase tracking-wide hover:border-[var(--tbh-neon)]"
                  >
                    Info su WhatsApp
                  </a>
                  <a
                    href={`tel:${tm.data.selezioni.telefono.replace(/\s/g, "")}`}
                    className="rounded-full border border-[var(--tbh-line)] px-4 py-2 text-xs font-bold uppercase tracking-wide hover:border-[var(--tbh-neon)]"
                  >
                    {tm.data.selezioni.telefono}
                  </a>
                </div>
              </div>
            </article>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <article className="tbh-card p-5 flex flex-col gap-3">
              <h3 className="tbh-display tbh-h3">Siti ufficiali</h3>
              <div className="flex flex-col gap-2">
                {tm.data.siti.map((l) => (
                  <a
                    key={l.url}
                    href={l.url}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-xl border border-[var(--tbh-line)] px-4 py-3 hover:border-[var(--tbh-neon)] transition"
                  >
                    <span className="block text-sm font-bold">{l.etichetta}</span>
                    <span className="block text-xs text-[var(--tbh-muted)]">{l.dettaglio}</span>
                  </a>
                ))}
              </div>
            </article>

            <article className="tbh-card p-5 flex flex-col gap-3">
              <h3 className="tbh-display tbh-h3">Canali social ufficiali</h3>
              <div className="flex flex-wrap gap-2">
                {tm.data.social.map((l) => (
                  <a
                    key={l.url}
                    href={l.url}
                    target="_blank"
                    rel="noreferrer"
                    title={l.dettaglio}
                    className="rounded-full border border-[var(--tbh-line)] px-4 py-2 text-xs font-bold uppercase tracking-wide hover:border-[var(--tbh-neon)] hover:text-[var(--tbh-neon)] transition"
                  >
                    {l.etichetta}
                  </a>
                ))}
              </div>
              <p className="text-[11px] text-[var(--tbh-muted)] leading-relaxed">{tm.data.nota}</p>
            </article>
          </div>
        </section>
      )}
      <div className="relative z-10 mt-14 grid gap-12 rounded-3xl border border-white/10 bg-black/70 p-6 md:p-8 backdrop-blur-sm">
        <SezioneAmministrabile sezione="jc-hugo-brani" />
        <SezioneAmministrabile sezione="jc-hugo-produzioni" sblocco={false} />
      </div>
    </div>
  );
}
