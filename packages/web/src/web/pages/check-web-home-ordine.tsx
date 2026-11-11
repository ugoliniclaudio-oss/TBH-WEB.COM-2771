import { useMemo } from "react";
import { Link } from "wouter";
import {
  CAROSELLI_VISIBILI,
  CHANNEL_HOME,
  CHANNEL_HOME_AGGIUNTI,
  FILE_HOME,
  MONITOR_REGIA,
  titoloChannel,
  type CaroselloHome,
  type ChannelHome,
  type FilaChannel,
} from "../../api/data/channel-home";
import { datiLogoChannel, logoDelChannel, type LogoChannel } from "../../api/data/loghi-channel";
import { schedaPubblica } from "../../api/data/channel-registro";
import { CardChannel, percorsoPlayer } from "../components/card-channel";
import { useRegistroChannel } from "../queries/channel-registro";
import { ETICHETTA_STATO, SezioneRegistro } from "../components/tessera-registro";
import type { CanaleTouchId } from "../../api/data/touch-canali";
import { CaroselloOrizzontale } from "../components/carosello-orizzontale";
import { BarraLavoro } from "../components/cms-pubblico";
import { PalinsestiHome0 } from "../components/playlist-cms-player";
import { useCanaleAdesso } from "../hooks/use-canale-adesso";
import { useElencoChannel, usePalinsestoChannel } from "../queries/channel";
import { MonitorRotante } from "../components/monitor-rotante";
import { vociDaPalinsesto, vociDaSpot } from "../lib/voci-monitor";
import { useCaroselliHome } from "../queries/caroselli";
import { inviaEventoCarosello, useVistaCarosello } from "../hooks/use-evento-carosello";
import { StrisciaTouchSocial } from "../components/touch-social";

/* ────────────────────────────────────────────────────────────────────────────
   /check-web/home-ordine — HOME «CANALE 0», FASE 1 (ordine di Claudio del 18/10/2026).

   SOLO STRUTTURA, SOLO TESTO:
     · il menu resta quello di sempre (Layout);
     · sotto il menu tre monitor affiancati: TOUCH TV · SPOT PUBBLICITÀ INTERNA · TOUCH RADIO
       (TV e Radio leggono lo STESSO palinsesto sincronizzato);
     · 5 blocchi (A–E) nell'ordine ufficiale del 18/10/2026, massimo 6 Channel per riga su
       desktop; 4 caroselli dopo i blocchi A, C, D, E (nessuno dopo B) — vedi CAROSELLI_HOME;
     · ogni Channel: monitor uniforme con il titolo leggibile e APRI CHANNEL verso la pagina
       interna già esistente, altrimenti IN ALLESTIMENTO. Nessun numero. LOGHI: dal 18-19/10/2026 solo
       gli originali approvati (loghi-channel.ts); gli altri Channel restano solo testo. Nessuno
       stemma, nessuna immagine, nessuna icona sostitutiva;
     · caroselli (18/10/2026): titoli della configurazione ufficiale, schede vive dal server
       (api/lib/caroselli-home.ts) in ordine casuale del giorno, contatori vista/clic per
       scheda (api/lib/caroselli-eventi.ts). Niente schede finte: senza fonte = IN ALLESTIMENTO.
   La home vera (/) non cambia finché Claudio non approva.
   ──────────────────────────────────────────────────────────────────────────── */

const GIALLO = "#d7ff00";
const ROSSO_DM = "#ff2b2b";

type StatoServer = NonNullable<ReturnType<typeof useElencoChannel>["data"]>["channel"][number];

/* 04/11/2026 (round 18) — spostata in components/tessera-registro.tsx (usata anche dal registro). */
export { ETICHETTA_STATO };

/* ── monitor di regia ───────────────────────────────────────────────────── */

export function MonitorRegia({ m, spotInterni }: { m: (typeof MONITOR_REGIA)[number]; spotInterni: number | null }) {
  const canale: CanaleTouchId | null = m.slug === "touch-tv" ? "tv" : m.slug === "touch-radio" ? "radio" : null;
  return (
    <article className="flex min-w-0 flex-col gap-3" data-testid={`monitor-${m.slug}`}>
      <div className="flex min-w-0 flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <h2 className="text-[clamp(18px,2vw,26px)] font-black leading-none tracking-[0.04em] text-white">{m.titolo}</h2>
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/55">{m.sotto}</p>
      </div>
      {/* 28/10/2026 — monitor a rotazione: immagini subito, 8 s ciascuna, Play al clic. */}
      {canale ? <SchermoPalinsesto canale={canale} titolo={m.titolo} /> : <SchermoSpot titolo={m.titolo} />}
      <div className="flex items-center justify-between gap-3">
        <span className="min-w-0 text-[10px] font-bold uppercase tracking-[0.2em] text-white/45" data-testid={canale ? undefined : "spot-conteggio"}>
          {canale
            ? "Palinsesto condiviso TV · Radio"
            : `Playlist spot interni${spotInterni === null ? "" : ` · ${spotInterni} in archivio`}`}
        </span>
        {m.pagina ? (
          <Link
            href={m.pagina}
            className="shrink-0 rounded-full px-4 py-2 text-[11px] font-extrabold tracking-[0.14em] text-black transition hover:brightness-110"
            style={{ background: GIALLO }}
          >
            APRI CHANNEL
          </Link>
        ) : (
          <span className="shrink-0 rounded-full border border-white/20 px-4 py-2 text-[11px] font-extrabold tracking-[0.14em] text-white/50">
            IN ALLESTIMENTO
          </span>
        )}
      </div>
    </article>
  );
}

function SchermoPalinsesto({ canale, titolo }: { canale: CanaleTouchId; titolo: string }) {
  const { oggi, elementi, indice } = useCanaleAdesso(canale, 5000);
  /* Le voci cambiano solo quando cambia il passaggio in onda, non a ogni battito dell'orologio. */
  const voci = useMemo(() => vociDaPalinsesto(elementi, indice, 8), [elementi, indice]);
  return (
    <MonitorRotante
      voci={voci}
      etichetta={titolo}
      testid={`schermo-${canale}`}
      vuoto={
        <span className="text-[12px] text-white/55">
          {oggi.isLoading ? "Lettura del palinsesto…" : "Nessun passaggio in scaletta in questo momento"}
        </span>
      }
    />
  );
}

export function SchermoSpot({ titolo }: { titolo: string }) {
  const q = usePalinsestoChannel("touch-spot");
  const voci = useMemo(() => vociDaSpot(q.data?.sequenza ?? []), [q.data]);
  return (
    <MonitorRotante
      voci={voci}
      etichetta={titolo}
      testid="schermo-spot"
      vuoto={
        <span className="text-[clamp(18px,2.2vw,28px)] font-black leading-none tracking-[0.04em] text-white">
          {q.isLoading ? "Lettura della playlist…" : "SPOT PUBBLICITÀ INTERNA"}
        </span>
      }
    />
  );
}

/* ── tessera di un Channel ──────────────────────────────────────────────── */

export function TesseraChannel({
  c,
  stato,
  scheda,
  logoAggiunto,
}: {
  c: ChannelHome;
  stato?: StatoServer;
  scheda?: string;
  /** Channel aggiunti dopo i 28 (CHANNEL_HOME_AGGIUNTI): logo approvato registrato «fuori elenco». */
  logoAggiunto?: LogoChannel | null;
}) {
  const dm = !!c.mediaPartnerEsterno;
  const colore = dm ? ROSSO_DM : GIALLO;
  const titolo = titoloChannel(c);
  /* Logo ORIGINALE approvato (loghi-channel.ts): file intero, object-contain, mai ritagliato.
     Chi non ha un logo approvato (es. Junior Gambettola) resta solo testo, come prima. */
  const logo = logoAggiunto !== undefined ? logoAggiunto : datiLogoChannel(c.slug);
  const testoStato = stato
    ? `${ETICHETTA_STATO[stato.stato] ?? stato.stato}${stato.stato === "DIRETTA" && stato.nota ? ` · ${stato.nota}` : ""}`
    : null;
  /* 28/10/2026 (round 14) — CardChannel, la STESSA card di /channel: banner intero, monitor con
     l'anteprima del palinsesto, APRI CHANNEL (pagina esistente, invariata; senza pagina il player
     /channel/play/<slug>), APRI SCHEDA, APRI IL SITO solo con indirizzo vero inserito in Regia.
     Logo inserito in Regia (cms_v1:canali) al posto di quello approvato, se presente. */
  const reg = useRegistroChannel();
  const r = reg.data?.channel.find((x) => x.slug === c.slug);
  const immagine = r?.logoRegia
    ? { src: r.logoRegia }
    : logo
      ? { src: logo.src, larghezza: logo.larghezza, altezza: logo.altezza }
      : null;
  const apri = c.pagina ? { href: c.pagina } : { href: percorsoPlayer(c.slug) };
  return (
    <CardChannel
      slug={c.slug}
      apri={apri}
      scheda={scheda ?? schedaPubblica(c.slug)}
      sito={r?.sito ?? null}
      titolo={titolo}
      sotto={testoStato}
      immagine={immagine}
      colore={colore}
      bordo={dm ? ROSSO_DM : undefined}
      angoloSx={dm ? <span style={{ color: ROSSO_DM }}>MEDIA PARTNER ESTERNO</span> : undefined}
      testid={`channel-${c.slug}`}
      testidBox={`box-channel-${c.slug}`}
      testidLogo={`logo-${c.slug}`}
      dati={{ logo: immagine?.src }}
    />
  );
}

/* ── carosello: schede vive dal server (ordine casuale del giorno) + contatori ── */

type CaroselloVivo = NonNullable<ReturnType<typeof useCaroselliHome>["data"]>["caroselli"][number];
type SchedaViva = CaroselloVivo["schede"][number];

function SchedaCaroselloHome({ carosello, s, accento }: { carosello: string; s: SchedaViva; accento: string }) {
  const ref = useVistaCarosello<HTMLDivElement>(carosello, s.id);
  const clic = () => inviaEventoCarosello(carosello, s.id, "clic");
  const corpo = (
    <div
      ref={ref}
      className="flex h-full w-[260px] shrink-0 snap-start flex-col overflow-hidden rounded-xl border border-white/12 bg-black transition hover:border-white/35"
      data-testid={`scheda-${s.id}`}
    >
      {s.immagine && (
        <img src={s.immagine} alt="" loading="lazy" decoding="async" referrerPolicy="no-referrer" className="aspect-video w-full bg-white/[0.04] object-cover" />
      )}
      <div className="flex flex-1 flex-col gap-1.5 p-3">
        {s.etichetta && (
          <span className="text-[10px] font-extrabold tracking-[0.14em]" style={{ color: accento }}>
            {s.etichetta}
          </span>
        )}
        <h4 className="line-clamp-2 text-sm font-extrabold text-white">{s.titolo}</h4>
        {s.sottotitolo && <p className="line-clamp-2 text-[12px] text-white/60">{s.sottotitolo}</p>}
        <span className="mt-auto w-fit rounded-full px-3 py-1.5 text-[10px] font-extrabold tracking-[0.14em] text-black" style={{ background: accento }}>
          {s.pulsante}
        </span>
      </div>
    </div>
  );
  return s.esterno ? (
    <a href={s.link} target="_blank" rel="noopener noreferrer" onClick={clic} aria-label={`${s.pulsante}: ${s.titolo}`}>
      {corpo}
    </a>
  ) : (
    <Link href={s.link} onClick={clic} aria-label={`${s.pulsante}: ${s.titolo}`}>
      {corpo}
    </Link>
  );
}

export function CaroselloFila({ k, vivo, autoplay }: { k: CaroselloHome; vivo: CaroselloVivo | undefined; autoplay?: number }) {
  /* 28/10/2026 — il carosello dopo il blocco E diventa la barra CERCO / OFFRO LAVORO a quattro schede
     (Subito · Bakeca · Indeed · Cerco Lavoro in Hotel); le schede già esistenti restano nella scheda Hotel. */
  if (k.slug === "casting-concorsi") return <BarraLavoro esistentiHotel={vivo?.schede ?? []} />;
  const accento = vivo?.accento === "rosso-dm" ? ROSSO_DM : GIALLO;
  const schede = vivo?.schede ?? [];
  return (
    <section className="mt-6 flex flex-col gap-3" aria-label={k.titolo} data-testid={`carosello-${k.slug}`}>
      <h2 className="text-[13px] font-black tracking-[0.2em] md:text-sm" style={{ color: accento }}>
        {k.titolo}
      </h2>
      <CaroselloOrizzontale etichetta={k.titolo} ariaPrecedente="Contenuti precedenti" ariaSuccessivo="Contenuti successivi" frecceDentro autoplay={autoplay}>
        {schede.length ? (
          schede.map((s) => <SchedaCaroselloHome key={s.id} carosello={k.slug} s={s} accento={accento} />)
        ) : (
          <div className="flex min-h-[64px] w-full shrink-0 flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-white/15 px-4 py-3 text-center md:px-16">
            <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/40">
              {vivo ? "IN ALLESTIMENTO" : "Contenuti del carosello in arrivo"}
            </span>
            {vivo?.nota && <span className="text-[11px] text-white/35">{vivo.nota}</span>}
          </div>
        )}
      </CaroselloOrizzontale>
    </section>
  );
}

/* ── pagina ─────────────────────────────────────────────────────────────── */

/**
 * `inHome` = la stessa pagina mostrata su `/` quando l'interruttore della home è su
 * «canale0»: spariscono solo la fascia ANTEPRIMA e l'elenco dei punti aperti.
 */
export default function CheckWebHomeOrdinePage({ inHome = false }: { inHome?: boolean }) {
  const elenco = useElencoChannel();
  const vivi = useCaroselliHome();
  const statoDi = new Map((elenco.data?.channel ?? []).map((c) => [c.slug, c]));
  const perFila = (f: FilaChannel) => CHANNEL_HOME.filter((c) => c.fila === f);
  const daDecidere = CHANNEL_HOME.filter((c) => c.daDecidere);

  return (
    <div className="bg-black pb-16 text-white" data-testid="home-ordine">
      {/* Titolo della pagina per lettori di schermo e motori (come la home precedente): nessun elemento visivo in più. */}
      <h1 className="sr-only">{inHome ? "TBH-WEB" : "TBH-WEB · anteprima Canale 0"}</h1>
      {!inHome && (
      <div className="mx-auto max-w-[1500px] px-4 pt-4 md:px-8">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 rounded-2xl border px-4 py-3 text-[12px]" style={{ borderColor: `${GIALLO}80` }}>
          <span className="font-extrabold tracking-[0.16em]" style={{ color: GIALLO }}>
            ANTEPRIMA HOME «CANALE 0» · LAYOUT UFFICIALE 28 CHANNEL · COLLAUDO · NON PUBBLICATA
          </span>
          <span className="text-white/60">
            28 Channel in 5 blocchi senza logo, numero, immagine o icona; 4 caroselli con schede reali e contatori. La home vera (/) resta invariata
            finché non viene approvata. Palinsesti e interruttore della home:{" "}
            <Link href="/allestimento/channel" className="underline hover:text-white">/allestimento/channel</Link>.
          </span>
        </div>
      </div>
      )}

      {/* TRE MONITOR SOTTO IL MENU */}
      <section className="mx-auto mt-6 grid max-w-[1500px] grid-cols-1 gap-5 px-4 md:grid-cols-3 md:px-8" aria-label="Monitor di regia">
        {MONITOR_REGIA.map((m) => (
          <MonitorRegia key={m.slug} m={m} spotInterni={elenco.data?.spotInterni ?? null} />
        ))}
      </section>

      {/* PALINSESTI assegnati a Home 0 dal pannello Gestione contenuti (28/10/2026): nulla finché non ce ne sono. */}
      <PalinsestiHome0 />

      {/* FILE DI CHANNEL + CAROSELLI */}
      <div className="mx-auto mt-10 flex max-w-[1500px] flex-col gap-10 px-4 md:px-8">
        {FILE_HOME.map((f) => {
          const k = CAROSELLI_VISIBILI.find((x) => x.dopoFila === f);
          return (
            <div key={f} data-testid={`fila-${f}`}>
              <section
                aria-label={`Channel blocco ${f}`}
                className="grid grid-cols-1 gap-4 min-[420px]:grid-cols-2 md:grid-cols-3 xl:grid-cols-6"
              >
                {perFila(f).map((c) => (
                  <TesseraChannel key={c.slug} c={c} stato={statoDi.get(c.slug)} />
                ))}
                {/* 28/10/2026: Channel aggiunti dopo i 28, in coda alla loro fila (i 28 non si spostano). */}
                {CHANNEL_HOME_AGGIUNTI.filter((c) => c.fila === f).map((c) => (
                  <TesseraChannel key={c.slug} c={c} logoAggiunto={logoDelChannel(c.slug) ?? null} />
                ))}
              </section>
              {k && <CaroselloFila k={k} vivo={vivi.data?.caroselli.find((x) => x.slug === k.slug)} />}
            </div>
          );
        })}
      </div>

      {/* 04/11/2026 (round 18) — TUTTI GLI ALTRI CHANNEL, dopo i 28 ufficiali (invariati). */}
      {/* 09/11/2026 (round 19) — TOUCH SOCIAL: un collegamento, nessun Channel spostato. */}
      <StrisciaTouchSocial />

      <AltriChannelHome />

      {/* PUNTI ANCORA APERTI — solo in anteprima */}
      {!inHome && daDecidere.length > 0 && (
      <section className="mx-auto mt-14 max-w-[1500px] px-4 md:px-8" aria-label="Punti da decidere">
        <div className="rounded-2xl border border-dashed border-white/20 p-4 md:p-6">
          <h2 className="text-[12px] font-black tracking-[0.2em]" style={{ color: GIALLO }}>
            PUNTI ANCORA APERTI (NON BLOCCANTI) · {daDecidere.length}
          </h2>
          <ul className="mt-3 grid gap-2 text-[12px] text-white/70 md:grid-cols-2">
            {daDecidere.map((c) => (
              <li key={c.slug} className="rounded-lg bg-white/[0.03] px-3 py-2">
                <b className="text-white">{titoloChannel(c)}</b> — {c.daDecidere}
              </li>
            ))}
          </ul>
        </div>
      </section>
      )}
    </div>
  );
}

/* ── 04/11/2026 (round 18) — tutti gli altri Channel del registro e del pannello ─────────────────────
   Prima la home si fermava ai 28 Channel ufficiali + Touch Talent (blocchi A–E): Touch Music Records Channel,
   le società TBH, NOVA TV, BEST ENTERTAINMENT e i Channel aggiunti dal pannello comparivano solo su /channel.
   Ora seguono qui, sezione per sezione, a pagine da 15 (blocchi da 6) SENZA limite di numero: ogni Channel o
   pagina creato in /allestimento/contenuti-palinsesto («CHANNEL E PAGINE») entra da solo nella sua sezione.
   I 28 non si ripetono (nessun doppione). Ordine: quello del registro (Touch Music Channel, poi Touch Music
   Records Channel, poi le società), spostabile dal pannello. */
/** Gli slug già nei blocchi A–E (= FISSI_HOME0 del server): non si ripetono sotto. */
const FISSI_HOME0_SLUG = new Set([...CHANNEL_HOME, ...CHANNEL_HOME_AGGIUNTI].map((c) => c.slug));

function AltriChannelHome() {
  const reg = useRegistroChannel();
  const tutti = (reg.data?.channel ?? []).filter((c) => !FISSI_HOME0_SLUG.has(c.slug));
  const sezioni = (reg.data?.sezioni ?? []).map((s) => ({ ...s, lista: tutti.filter((c) => c.sezione === s.id) })).filter((s) => s.lista.length > 0);
  if (reg.isLoading) return <p className="mx-auto mt-12 max-w-[1500px] px-4 text-sm text-white/50 md:px-8">Caricamento degli altri Channel…</p>;
  if (!sezioni.length) return null;
  return (
    <section className="mx-auto mt-14 flex max-w-[1500px] flex-col gap-10 px-4 md:px-8" aria-label="Tutti gli altri Channel" data-testid="home-altri-channel" data-totale={tutti.length}>
      <div className="flex flex-col gap-3 border-t pt-8" style={{ borderColor: `${GIALLO}55` }}>
        <h2 className="tbh-display text-[clamp(22px,3vw,36px)] font-black tracking-[0.04em]" style={{ color: GIALLO }}>
          TUTTI GLI ALTRI CHANNEL · {tutti.length}
        </h2>
        <nav className="flex flex-wrap gap-2" aria-label="Sezioni degli altri Channel">
          {sezioni.map((s) => {
            const dm = s.id === "dm";
            return (
              <a
                key={s.id}
                href={`#sezione-${s.id}`}
                className="rounded-full border px-4 py-1.5 text-[11px] font-extrabold tracking-[0.14em] hover:bg-white/10"
                style={{ borderColor: dm ? ROSSO_DM : `${GIALLO}99`, color: dm ? ROSSO_DM : GIALLO }}
              >
                {s.titolo} · {s.lista.length}
              </a>
            );
          })}
          <Link href="/guida" className="rounded-full border border-white/25 px-4 py-1.5 text-[11px] font-extrabold tracking-[0.14em] text-white/80 hover:bg-white/10">
            GUIDA CANALI
          </Link>
        </nav>
      </div>
      {sezioni.map((s) => (
        <SezioneRegistro key={s.id} id={s.id} titolo={s.titolo} sotto={s.sotto} lista={s.lista} testid={`home-griglia-${s.id}`} />
      ))}
    </section>
  );
}
