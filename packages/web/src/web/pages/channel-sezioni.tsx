import { Link } from "wouter";
import { CAROSELLI_VISIBILI, MONITOR_REGIA } from "../../api/data/channel-home";
import { SEZIONI_CHANNEL, type SezioneChannel } from "../../api/data/channel-registro";
import { useElencoChannel } from "../queries/channel";
import { useCaroselliHome } from "../queries/caroselli";
import { useRegistroChannel } from "../queries/channel-registro";
import { CaroselloFila, MonitorRegia, SchermoSpot } from "./check-web-home-ordine";
import { SpazioPubblicitario, useCampagneSpazio } from "../components/spazio-pubblicitario";
import { StrisciaCanaliTematici } from "./canale-tematico";
import { SezioneRegistro } from "../components/tessera-registro";
import { StrisciaTouchSocial } from "../components/touch-social";

/* ────────────────────────────────────────────────────────────────────────────
   /channel — HOME TBH A 5 SEZIONI (ampliamento del 28/10/2026).

   · 3 monitor di regia sotto il menu (gli stessi della home «Canale 0», palinsesto TV/Radio
     condiviso INVARIATO);
   · 5 sezioni: HOME TBH · DM · NOVA TV · BEST ENTERTAINMENT · ALTRI CHANNEL E SPAZI LIBERI;
   · in ogni sezione i Channel a PAGINE da massimo 15, in BLOCCHI da 6 (6 per riga su desktop),
     con frecce, numeri di pagina, tasti ← → e scorrimento col dito (round 14, GrigliaChannelPaginata);
   · ogni Channel = CardChannel (la stessa card della home «Canale 0»): banner intero, monitor con
     l'anteprima del palinsesto vero, APRI CHANNEL (pagina esistente, altrimenti il player
     /channel/play/<slug>), APRI SCHEDA, APRI IL SITO solo con un indirizzo vero inserito in Regia;
     per gli spazi vuoti l'URL inserito dal pannello;
   · appartenenza solo da dati confermati (TBH · DM · libero · da assegnare);
   · rosso #ff2b2b SOLO per DM, tutto il resto nero + #d7ff00.
   `inHome` = la stessa pagina mostrata su `/` con l'interruttore «tbh3».
   ──────────────────────────────────────────────────────────────────────────── */

const GIALLO = "#d7ff00";
const ROSSO_DM = "#ff2b2b";

/* Caroselli già approvati della home: uno dopo HOME TBH, DM, BEST ENTERTAINMENT e ALTRI. */
const CAROSELLO_DOPO: Partial<Record<SezioneChannel, number>> = { "home-tbh": 0, dm: 1, best: 2, altri: 3 };


/**
 * Monitor centrale SPOT PUBBLICITÀ INTERNA: qui è uno spazio pubblicitario VERO (rotazione
 * delle campagne del pannello + promo TBH, compresa l'Offerta 122 € a locandina intera).
 * Non tocca il palinsesto TV/Radio né la playlist degli spot YouTube di /spot.
 */
function MonitorSpot() {
  const { campagne } = useCampagneSpazio({ spazio: "channel-spot-interni", massimo: 6 });
  return (
    <article className="flex min-w-0 flex-col gap-3" data-testid="monitor-spot-interni">
      <div className="flex min-w-0 flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <h2 className="text-[clamp(18px,2vw,26px)] font-black leading-none tracking-[0.04em] text-white">SPOT PUBBLICITÀ INTERNA</h2>
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/55">Promozioni TBH</p>
      </div>
      {campagne.length > 0 ? (
        <div
          className="relative aspect-video w-full overflow-hidden rounded-xl border bg-black"
          style={{ borderColor: "rgba(255,255,255,0.14)", boxShadow: "inset 0 0 0 6px #0d0d0f" }}
        >
          <SpazioPubblicitario campagne={campagne} spazio="channel-spot-interni" colore={GIALLO} />
        </div>
      ) : (
        /* 28/10/2026 — senza campagne: gli spot interni del Touch Spot Channel in rotazione. */
        <SchermoSpot titolo="SPOT PUBBLICITÀ INTERNA" />
      )}
      <div className="flex items-center justify-between gap-3">
        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/45">Spot pubblicità interna · rotazione</span>
        <Link
          href="/spot"
          className="shrink-0 rounded-full px-4 py-2 text-[11px] font-extrabold tracking-[0.14em] text-black transition hover:brightness-110"
          style={{ background: GIALLO }}
        >
          APRI CHANNEL
        </Link>
      </div>
    </article>
  );
}

export default function ChannelSezioniPage({ inHome = false }: { inHome?: boolean }) {
  const reg = useRegistroChannel();
  const elenco = useElencoChannel();
  const vivi = useCaroselliHome();
  const tutti = reg.data?.channel ?? [];

  return (
    <div className="bg-black pb-16 text-white" data-testid="channel-sezioni">
      <h1 className="sr-only">{inHome ? "TBH-WEB" : "TBH-WEB · Channel"}</h1>

      <section className="mx-auto mt-6 grid max-w-[1500px] grid-cols-1 gap-5 px-4 md:grid-cols-3 md:px-8" aria-label="Monitor di regia">
        {MONITOR_REGIA.map((m) =>
          m.slug === "spot-interni" ? (
            <MonitorSpot key={m.slug} />
          ) : (
            <MonitorRegia key={m.slug} m={m} spotInterni={elenco.data?.spotInterni ?? null} />
          ),
        )}
      </section>

      <nav className="mx-auto mt-8 flex max-w-[1500px] flex-wrap gap-2 px-4 md:px-8" aria-label="Sezioni Channel">
        {SEZIONI_CHANNEL.map((s) => {
          const n = tutti.filter((c) => c.sezione === s.id).length;
          const dm = s.id === "dm";
          return (
            <a
              key={s.id}
              href={`#sezione-${s.id}`}
              className="rounded-full border px-4 py-1.5 text-[11px] font-extrabold tracking-[0.14em] hover:bg-white/10"
              style={{ borderColor: dm ? ROSSO_DM : `${GIALLO}99`, color: dm ? ROSSO_DM : GIALLO }}
            >
              {s.titolo} · {n}
            </a>
          );
        })}
      </nav>

      {/* 28/10/2026 — canali tematici a playlist casuale (TOUCH MUSIC, INFLUENCITY, ARM WRESTLING). */}
      <section className="mx-auto mt-6 max-w-[1500px] px-4 md:px-8" aria-label="Canali tematici">
        <p className="mb-2 text-[11px] font-extrabold tracking-[0.18em]" style={{ color: GIALLO }}>
          CANALI TEMATICI ·{" "}
          <Link href="/canali" className="underline hover:text-white">
            tutti
          </Link>
        </p>
        <StrisciaCanaliTematici />
      </section>

      {/* 09/11/2026 (round 19) — TOUCH SOCIAL: un collegamento, nessun Channel spostato. */}
      <StrisciaTouchSocial />

      {reg.isLoading && <p className="mx-auto mt-10 max-w-[1500px] px-4 text-sm text-white/50 md:px-8">Caricamento dei Channel…</p>}
      {reg.isError && (
        <p className="mx-auto mt-10 max-w-[1500px] px-4 text-sm text-white/60 md:px-8">
          Elenco dei Channel momentaneamente non disponibile. Riprova tra poco.
        </p>
      )}

      <div className="mx-auto mt-8 flex max-w-[1500px] flex-col gap-12 px-4 md:px-8">
        {reg.data &&
          SEZIONI_CHANNEL.map((s) => {
            const lista = tutti.filter((c) => c.sezione === s.id);
            const ik = CAROSELLO_DOPO[s.id];
            const k = ik === undefined ? undefined : CAROSELLI_VISIBILI[ik];
            return (
              <SezioneRegistro
                key={s.id}
                id={s.id}
                titolo={s.titolo}
                sotto={s.sotto}
                lista={lista}
                testid={`griglia-${s.id}`}
                extra={k && <CaroselloFila k={k} vivo={vivi.data?.caroselli.find((x) => x.slug === k.slug)} />}
              />
            );
          })}
      </div>
    </div>
  );
}
