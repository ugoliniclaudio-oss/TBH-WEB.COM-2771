import { Link } from "wouter";
import { ExternalLink, Eye } from "lucide-react";
import { CHANNEL_IN_PREPARAZIONE, schedaChannelInPreparazione } from "../../api/data/channel-in-preparazione";
import { LOGHI_CHANNEL, immaginiDelChannel, logoDelChannel } from "../../api/data/loghi-channel";
import { CHANNEL_HOME, titoloChannel } from "../../api/data/channel-home";
import { registroPerSlug, SEZIONI_CHANNEL } from "../../api/data/channel-registro";
import { SlotMedia } from "../components/media-slot";
import { useAnteprimaChannel, useRegistroChannel } from "../queries/channel-registro";
import { MonitorRotante } from "../components/monitor-rotante";
import { percorsoPlayer, testoSenzaContenuti, vociMonitorDaAnteprima } from "../components/card-channel";
import { ModuloSpazio } from "../components/modulo-spazio-channel";
import { SpazioPubblicitario, useCampagneSpazio } from "../components/spazio-pubblicitario";
import { StrisciaCanaliTematici } from "./canale-tematico";
import { Briciole, GrigliaAttivita, useRicordaChannel } from "../components/struttura";
import { useStruttura } from "../queries/struttura";
import { NuoveUsciteDiscografiche } from "../components/discografia";
import { SocialCollegati } from "../components/touch-social";

/**
 * /check-web/channel/:slug — SCHEDA di un Channel IN PREPARAZIONE (19/10/2026, Direzione TBH).
 * Stesso schema di /channel/mondo-olistico (monitor nero + IN ALLESTIMENTO + riquadro laterale),
 * con in più il logo approvato. Solo anteprima: nessun numero, nessun posto in home.
 * Nessun video, nessuna diretta: palinsesto e archivio restano vuoti finché TBH non fornisce
 * fonti disponibili e autorizzate.
 */

const GIALLO = "#d7ff00";
const PULSANTE =
  "inline-flex min-h-10 items-center gap-1 rounded-full px-5 py-2 text-[11px] font-extrabold tracking-[0.14em] transition hover:brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#d7ff00]";

export default function ChannelSchedaPage({ slug, pubblica = false }: { slug: string; pubblica?: boolean }) {
  /* 23/10/2026 — la stessa scheda serve anche ai Channel dell'elenco ufficiale (pulsante
     APRI SCHEDA del template paginato): dati letti da CHANNEL_HOME, nulla di inventato.
     28/10/2026 — e a tutti i Channel del REGISTRO unico (/channel/scheda/<slug>): R.F.A.,
     Miss Cool, spazi NOVA TV / BEST ENTERTAINMENT / liberi. Il logo non è più obbligatorio:
     chi non l'ha mostra il nome e lo spazio «Logo da caricare» (solo col codice). */
  const reg = registroPerSlug(slug);
  const vivo = useRegistroChannel().data?.channel.find((x) => x.slug === slug);
  const prep = CHANNEL_IN_PREPARAZIONE.find((x) => x.slug === slug);
  const uff = prep ? undefined : CHANNEL_HOME.find((x) => x.slug === slug);
  const logo = prep
    ? logoDelChannel(slug)
    : uff
      ? !LOGHI_CHANNEL[slug]?.fuoriElenco
        ? logoDelChannel(slug)
        : undefined
      : reg?.logo
        ? logoDelChannel(slug)
        : undefined;
  const paginaReg = vivo?.pagina ?? reg?.pagina ?? null;
  const esternoReg = !!vivo?.esterno;
  const c = prep
    ? prep
    : uff
      ? {
          slug,
          nome: titoloChannel(uff),
          categoria: `Categoria: ${uff.categoria}${uff.mediaPartnerEsterno ? " · media partner esterno" : ""}.`,
          collegamenti: uff.pagina ? [{ nome: "Pagina del Channel (monitor e palinsesto)", href: uff.pagina, esterno: false, nota: "Pagina esistente del sito." }] : [],
          daChiarire: uff.daDecidere,
        }
      : reg
        ? {
            slug,
            nome: vivo?.nome ?? reg.nome,
            categoria: reg.slotVuoto ? "Spazio disponibile: nome e indirizzo da compilare." : `Categoria: ${reg.categoria}.`,
            collegamenti: [
              ...(paginaReg
                ? [{ nome: esternoReg ? "Sito del Channel" : "Pagina del Channel", href: paginaReg, esterno: esternoReg, nota: esternoReg ? "Indirizzo inserito dal pannello." : "Pagina esistente del sito." }]
                : []),
              ...(reg.collegamenti ?? []),
            ],
            daChiarire: reg.nota,
          }
        : undefined;
  /* 28/10/2026 (round 14) — collegamenti e sito inseriti in Regia (cms_v1:canali, condivisi con www);
     per i 28 anche quelli del registro (es. Touch Lavoro → scheda società Touch Human Resources). */
  const extraCollegamenti = [
    ...(uff ? (reg?.collegamenti ?? []) : []),
    ...(vivo?.collegamentiRegia ?? []).map((l) => ({ nome: l.nome, href: l.href, esterno: /^https?:\/\//.test(l.href), nota: "Collegamento inserito in Regia." })),
  ];
  const sito = vivo?.sito ?? null;
  const logoRegia = vivo?.logoRegia ?? null;
  /* Pagina del Channel: per i 28 quella ufficiale; per gli altri quella del registro (o dello spazio). */
  const pagina = prep ? null : uff ? uff.pagina : paginaReg;
  /* Senza pagina APRI CHANNEL porta al player /channel/play/<slug> (solo Channel del registro, non gli spazi vuoti). */
  const player = !pagina && reg && !reg.slotVuoto ? percorsoPlayer(slug) : null;
  const anteprima = useAnteprimaChannel(reg && !reg.slotVuoto ? slug : null);
  const vociPal = anteprima.data?.voci ?? [];
  const sezione = reg ? SEZIONI_CHANNEL.find((x) => x.id === reg.sezione) : undefined;
  const dm = reg?.appartenenza === "DM";
  const accento = dm ? "#ff2b2b" : GIALLO;
  const info = vivo?.info;
  /* 28/10/2026 — struttura comune: attività del Channel e scheda completa dell'ente. */
  const strutt = useStruttura().data?.channel.find((x) => x.slug === slug);
  useRicordaChannel(pubblica ? slug : null);

  if (!c) {
    return (
      <div className="mx-auto max-w-[900px] px-4 py-16 text-center">
        <p className="text-sm text-white/60">Scheda non trovata.</p>
        <Link href="/channel" className="mt-4 inline-block text-sm text-white underline">
          Torna a tutti i Channel
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1300px] px-4 py-8 md:px-8" data-testid={`channel-scheda-${slug}`}>
      {pubblica && (
        <Briciole
          className="mb-4"
          voci={[{ label: "Home", href: "/" }, { label: "Channel", href: "/channel" }, { label: c.nome }]}
        />
      )}
      {pubblica ? (
        <div className="mb-6 flex flex-wrap items-center gap-x-4 gap-y-1 rounded-2xl border border-white/10 bg-black/70 px-4 py-3 text-[12px]" data-testid="appartenenza-channel">
          <Link href={sezione ? `/channel#sezione-${sezione.id}` : "/channel"} className="font-extrabold tracking-[0.16em] hover:underline" style={{ color: dm ? "#ff2b2b" : GIALLO }}>
            {sezione?.titolo ?? "CHANNEL"}
          </Link>
          <span className="text-white/60">
            Appartenenza: <b className="text-white">{reg?.appartenenza ?? "da assegnare"}</b>
            {reg?.ordineDaIndicare ? " · ordine da indicare" : ""}
            {reg?.mediaPartnerEsterno ? " · media partner esterno" : ""}
          </span>
        </div>
      ) : (
      <div className="mb-6 flex flex-wrap items-center gap-x-4 gap-y-1 rounded-2xl border border-[var(--tbh-gold)]/50 bg-black/70 px-4 py-3 text-[12px]">
        <span className="inline-flex items-center gap-2 font-extrabold tracking-[0.16em] text-[var(--tbh-gold)]">
          <Eye className="h-4 w-4" /> ANTEPRIMA · NON PUBBLICATA
        </span>
        <span className="min-w-0 text-[var(--tbh-muted)]">
          {prep
            ? "Channel nuovo · nessun numero · nessuna posizione · non in home né nei caroselli"
            : "Channel dell'elenco ufficiale · ordine e numerazione invariati"}
        </span>
      </div>
      )}

      {/* 28/10/2026 — se questo Channel ha un canale tematico collegato, il link porta al player. */}
      <div className="mb-6">
        <StrisciaCanaliTematici solo={[slug]} />
      </div>

      <header className="mb-8 grid items-center gap-6 md:grid-cols-[minmax(0,380px)_1fr]">
{logoRegia ? (
        <div className="block rounded-xl bg-black p-2">
          <img src={logoRegia} alt={`Logo ${c.nome}`} className="mx-auto max-h-[300px] w-auto max-w-full object-contain" data-testid="logo-channel" />
        </div>
        ) : logo ? (
                <a href={logo.originale ?? logo.src} target="_blank" rel="noreferrer" className="block rounded-xl bg-black p-2" title="Apri il file originale">
          <img
            src={logo.src}
            alt={`Logo ${c.nome}`}
            width={logo.larghezza}
            height={logo.altezza}
            className="mx-auto max-h-[300px] w-auto max-w-full object-contain"
            data-testid="logo-channel"
          />
        </a>
        ) : (
          <div className="grid aspect-video place-items-center rounded-xl border border-white/10 bg-black px-4 text-center">
            <span className="text-balance text-lg font-black text-white">{c.nome}</span>
          </div>
        )}
        <div className="min-w-0">
          <p className="text-[11px] font-extrabold uppercase tracking-[0.3em] text-white/50">
            {prep ? "TBH · Channel in preparazione" : reg?.slotVuoto ? "Spazio Channel" : "TBH · Scheda Channel"}
          </p>
          <h1 className="tbh-display tbh-h1 mt-2 text-balance text-white">{c.nome}</h1>
          <p className="mt-3 text-base text-white/80" data-testid="categoria-channel">{c.categoria}</p>
          {!pagina && (
            <p className="mt-3 text-xs font-extrabold tracking-[0.2em]" style={{ color: GIALLO }} data-testid="stato-channel">
              {vociPal.length ? `${vociPal.length} CONTENUTI IN PALINSESTO` : testoSenzaContenuti(anteprima.data?.stato, anteprima.isLoading)}
            </p>
          )}
          {/* 29/10/2026 (round 15) — tre pulsanti distinti, come card e player: APRI CHANNEL (pagina o player) ·
              APRI SCHEDA (informazioni e contatti, qui sotto) · APRI IL SITO (solo con un sito vero). */}
          <div className="mt-4 flex flex-wrap gap-2" data-testid="pulsanti-scheda">
            {pagina ? (
              esternoReg && !uff ? (
                <a href={pagina} target="_blank" rel="noreferrer" className={PULSANTE} style={{ background: accento, color: "#000" }} data-testid="apri-channel-scheda">
                  APRI CHANNEL <ExternalLink className="h-3 w-3" />
                </a>
              ) : (
                <Link href={pagina} className={PULSANTE} style={{ background: accento, color: "#000" }} data-testid="apri-channel-scheda">
                  APRI CHANNEL
                </Link>
              )
            ) : player ? (
              <Link href={player} className={PULSANTE} style={{ background: accento, color: "#000" }} data-testid="apri-channel-scheda">
                APRI CHANNEL
              </Link>
            ) : null}
            {vivo && (
              <a
                href="#informazioni-channel"
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById("informazioni-channel")?.scrollIntoView({ behavior: "smooth", block: "start" });
                }}
                className={`${PULSANTE} border bg-black`}
                style={{ borderColor: accento, color: accento }}
                data-testid="apri-scheda-scheda"
              >
                APRI SCHEDA
              </a>
            )}
            {sito && (
              <a href={sito} target="_blank" rel="noopener noreferrer" className={`${PULSANTE} border bg-black`} style={{ borderColor: accento, color: accento }} data-testid="vai-al-sito-scheda">
                APRI IL SITO <ExternalLink className="h-3 w-3" />
              </a>
            )}
          </div>
        </div>
      </header>

      {/* 04/11/2026 (round 18) — TUTTE le immagini consegnate per questo Channel, intere (object-contain). */}
      <GalleriaImmaginiChannel slug={slug} nome={c.nome} logoRegia={logoRegia} accento={accento} />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_420px]">
        {/* MONITOR — 28/10/2026 (round 14): con contenuti in Regia il palinsesto vero, altrimenti il riquadro di sempre. */}
        {vociPal.length > 0 ? (
          <MonitorRotante voci={vociMonitorDaAnteprima(vociPal)} etichetta={c.nome} colore={dm ? "#ff2b2b" : GIALLO} testid="monitor-channel" sequenza ciclo />
        ) : (
        <div
          className="relative flex aspect-video overflow-hidden w-full flex-col items-center justify-center gap-4 rounded-xl border bg-black px-6 text-center"
          style={{ borderColor: "rgba(255,255,255,0.14)", boxShadow: "inset 0 0 0 5px #0d0d0f" }}
          data-testid="monitor-channel"
        >
          <span className="text-balance text-xl font-black tracking-[0.04em] text-white md:text-2xl">{c.nome.toUpperCase()}</span>
          {!pagina && pubblica ? (
            <RiempitivoPromo slug={slug} />
          ) : !pagina ? (
            <>
              <span className="rounded-full border px-6 py-2 text-xs font-extrabold tracking-[0.2em]" style={{ borderColor: GIALLO, color: GIALLO }}>
                PALINSESTO IN PREPARAZIONE
              </span>
              <span className="max-w-md text-xs text-white/50">
                Il monitor si accenderà solo con materiali disponibili e autorizzati.
              </span>
            </>
          ) : (
            <span className="max-w-md text-xs text-white/60">
              Monitor e palinsesto in onda sono sulla pagina del Channel: pulsante APRI CHANNEL.
            </span>
          )}
        </div>
        )}

        {/* ANTEPRIMA TESSERA */}
        <section className="flex flex-col gap-3 rounded-xl border border-white/10 p-5" aria-label="Anteprima">
          <h2 className="text-[12px] font-black tracking-[0.2em]" style={{ color: GIALLO }}>ANTEPRIMA</h2>
          <div className="relative aspect-video rounded-lg bg-black">
            {logo ? (
              <img src={logo.src} alt="" className="absolute inset-2 h-[calc(100%-1rem)] w-[calc(100%-1rem)] object-contain" data-testid="anteprima-tessera" />
            ) : (
              <span className="absolute inset-0 grid place-items-center px-4 text-center text-sm font-black text-white">{c.nome}</span>
            )}
          </div>
          <p className="text-xs text-white/55">
            {prep
              ? "Come apparirebbe la tessera (logo intero, senza ritagli). Posizione: da assegnare dalla Direzione TBH."
              : logo
                ? "Tessera con il logo originale approvato, intero e senza ritagli."
                : "Nessun logo approvato: la tessera resta solo testo."}
          </p>
        </section>
      </div>

      {/* 04/11/2026 (round 17): NUOVE USCITE DISCOGRAFICHE, sezione permanente subito sotto il player del Records Channel. */}
      {slug === "touch-music-records" && <NuoveUsciteDiscografiche className="mt-6" />}

      {/* 09/11/2026 (round 19): profili TOUCH SOCIAL collegati a questo Channel (gestiti da /allestimento/touch-social). */}
      <SocialCollegati channel={slug} titolo="Social ufficiali del Channel" className="mt-6" />

      {info && (
        <InformazioniChannel
          info={info}
          appartenenza={reg?.appartenenza ?? "da assegnare"}
          mediaPartner={!!reg?.mediaPartnerEsterno}
          slotVuoto={!!reg?.slotVuoto}
          accento={accento}
          ente={pubblica && strutt?.ente ? `/e/${strutt.ente.id}` : null}
        />
      )}

      <div className="mt-6 grid gap-6 md:grid-cols-2">
{prep ? (
          <>
        <Riquadro titolo="PALINSESTO" testid="palinsesto-channel">
          <p>Nessun contenuto in programmazione.</p>
          <p className="text-white/50">
            Predisposto: si compilerà solo con fonti fornite e autorizzate da TBH (URL, playlist, dirette, archivi). Nessuna
            diretta ufficiale senza i relativi diritti.
          </p>
        </Riquadro>
        <Riquadro titolo="ARCHIVIO VIDEO" testid="archivio-channel">
          <p>0 video in archivio.</p>
        </Riquadro>
          </>
        ) : (
          <Riquadro titolo="PALINSESTO E ARCHIVIO VIDEO" testid="palinsesto-channel">
            <p>
              {pagina
                ? "Il palinsesto e l'archivio video di questo Channel sono quelli della sua pagina (APRI CHANNEL): questa scheda non li duplica."
                : vociPal.length
                  ? `${vociPal.length} contenuti in palinsesto (Regia): APRI CHANNEL per il player.`
                  : "Palinsesto in preparazione: nessun programma in onda."}
            </p>
            {!pagina && reg && !reg.slotVuoto && (
              <>
                <p data-testid="stato-palinsesto">
                  Stato: <b className="text-white">{vivo?.stato ?? "IN ALLESTIMENTO"}</b>
                  {vivo ? ` · ${vivo.contenutiAttivi} contenuti attivi` : ""}
                </p>
                <p className="text-white/50">
                  Palinsesto predisposto: A editoriale (programmi e pause pubblicitarie) oppure B commerciale H24 (solo spot e
                  promozioni autorizzate). Contenuti e URL si inseriscono dal pannello riservato; in attesa il monitor manda le
                  promo TBH. Nessun video o diretta inventati.
                </p>
              </>
            )}
          </Riquadro>
        )}
        <Riquadro titolo="COLLEGAMENTI" testid="collegamenti-channel">
          {c.collegamenti.length + extraCollegamenti.length === 0 ? (
            <p>Nessun collegamento verificato: da fornire (siti, e-mail, social).</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {[...c.collegamenti, ...extraCollegamenti].map((l, i) => (
                <li key={`${l.href}-${i}`}>
                  {l.esterno ? (
                    <a href={l.href} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-white underline-offset-2 hover:underline">
                      {l.nome} <ExternalLink className="h-3 w-3" />
                    </a>
                  ) : (
                    <Link href={l.href} className="text-white underline-offset-2 hover:underline">
                      {l.nome}
                    </Link>
                  )}
                  <span className="block text-[11px] text-white/45">{l.nota}</span>
                </li>
              ))}
            </ul>
          )}
          <p className="text-[11px] text-white/45">Siti di riferimento, non partner né licenze.</p>
        </Riquadro>
        <Riquadro titolo="DA FORNIRE (TBH)" testid="da-fornire-channel">
          <ul className="list-disc pl-4">
            <li>Fonti del palinsesto</li>
            {(!info || !info.telefono || !info.email || !info.social.length) && <li>Contatti e social verificati del Channel</li>}
            {(!info || !info.indirizzo) && <li>Indirizzo e indicazioni (se il Channel ha una sede)</li>}
            <li>Stato operativo e posizione definitiva</li>
          </ul>
          {c.daChiarire && <p className="text-[var(--tbh-gold)]">{c.daChiarire}</p>}
        </Riquadro>
      </div>

      {pubblica && strutt && (
        <div className="mt-8">
          <GrigliaAttivita channel={strutt} mostraVuoto conCollegamenti={false} />
        </div>
      )}

      {logo && (
      <p className="mt-6 break-all text-[10px] text-white/40">
        Originale: {logo.originale ?? logo.src} · {logo.fileOriginale} · md5 {logo.md5} {logo.originale ? ` — copia sito: ${logo.src} · ` : " · "}
        {logo.byteCopia ? `${(logo.byteCopia / 1048576).toFixed(2)} MB` : ""} · {logo.larghezza}×{logo.altezza}
      </p>
      )}

      {!logo && (
        <SlotMedia
          slot={`channel-logo:${slug}`}
          tipoIniziale="logo"
          titolo="Logo da caricare"
          descrizione="Spazio per il logo originale del Channel: si carica col codice di allestimento. Nessun logo viene creato o modificato."
          nascondiSeVuoto
        />
      )}
      {reg?.slotVuoto && <ModuloSpazio slug={slug} nome={vivo?.compilato ? vivo.nome : ""} url={vivo?.compilato ? (vivo.pagina ?? "") : ""} />}

      {pubblica ? (
        <nav className="mt-6 flex flex-wrap gap-2" aria-label="Tutti i Channel">
          <Link href="/" className="rounded-full border border-white/15 px-3 py-1.5 text-[11px] text-white/70 hover:border-[#d7ff00] hover:text-white">
            Home
          </Link>
          <Link href="/channel" className="rounded-full border border-white/15 px-3 py-1.5 text-[11px] text-white/70 hover:border-[#d7ff00] hover:text-white">
            Tutti i Channel
          </Link>
        </nav>
      ) : (
      <nav className="mt-6 flex flex-wrap gap-2" aria-label="Altre schede in preparazione">
        {CHANNEL_IN_PREPARAZIONE.filter((x) => x.slug !== slug).map((x) => (
          <Link
            key={x.slug}
            href={schedaChannelInPreparazione(x.slug)}
            className="rounded-full border border-white/15 px-3 py-1.5 text-[11px] text-white/70 hover:border-[#d7ff00] hover:text-white"
          >
            {x.nome}
          </Link>
        ))}
        <Link href="/check-web/loghi-canali" className="rounded-full border border-white/15 px-3 py-1.5 text-[11px] text-white/70 hover:text-white">
          Anteprima loghi
        </Link>
      </nav>
      )}
    </div>
  );
}

/**
 * 28/10/2026 — Channel LIBERO / in allestimento: in attesa del palinsesto il monitor manda a
 * rotazione casuale le promo TBH (Offerta 122 € compresa). Nessun contenuto del Channel inventato.
 */
function RiempitivoPromo({ slug }: { slug: string }) {
  const { campagne } = useCampagneSpazio({ spazio: `channel-libero:${slug}`, massimo: 6 });
  if (campagne.length === 0) {
    return (
      <span className="rounded-full border px-6 py-2 text-xs font-extrabold tracking-[0.2em]" style={{ borderColor: GIALLO, color: GIALLO }}>
        PALINSESTO IN PREPARAZIONE
      </span>
    );
  }
  return (
    <div className="absolute inset-[6px] overflow-hidden rounded-lg" data-testid="riempitivo-promo">
      <SpazioPubblicitario campagne={campagne} spazio={`channel-libero:${slug}`} colore={GIALLO} />
      <span className="pointer-events-none absolute bottom-1.5 left-1.5 z-20 rounded-full bg-black/80 px-2 py-0.5 text-[8.5px] font-extrabold tracking-[0.14em]" style={{ color: GIALLO }}>
        PALINSESTO IN PREPARAZIONE · PROMO TBH IN ATTESA
      </span>
    </div>
  );
}

function Riquadro({ titolo, testid, children }: { titolo: string; testid: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-2 rounded-xl border border-white/10 p-5 text-sm text-white/75" data-testid={testid}>
      <h2 className="text-[12px] font-black tracking-[0.2em]" style={{ color: GIALLO }}>
        {titolo}
      </h2>
      {children}
    </section>
  );
}

/* ── 29/10/2026 (round 15) — INFORMAZIONI E CONTATTI (APRI SCHEDA) ─────────────────────────────────────────
   Dati di base verificati (channel-schede.ts) + quanto inserito in Regia. Campo senza dato = «da fornire». */
type InfoScheda = NonNullable<NonNullable<ReturnType<typeof useRegistroChannel>["data"]>["channel"][number]["info"]>;

const ETICHETTA_APPARTENENZA: Record<string, { t: string; sotto: string }> = {
  TBH: { t: "TBH · Touch Business Holding", sotto: "Channel del gruppo (elenco ufficiale o banner co-firmato TBH)." },
  DM: { t: "DM TV · media partner esterno", sotto: "DM Comunicazioni e squadre: non è un Channel TBH." },
  "da assegnare": { t: "Da verificare", sotto: "Appartenenza non ancora confermata (TBH, DM TV o indipendente): la indica la Direzione TBH." },
  libero: { t: "Spazio libero", sotto: "Nessun Channel assegnato." },
};

const esterno = (h: string) => /^https?:\/\//.test(h);

function Voce({ etichetta, children, testid }: { etichetta: string; children: React.ReactNode; testid?: string }) {
  return (
    <div className="flex min-w-0 flex-col gap-0.5" data-testid={testid}>
      <dt className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-white/45">{etichetta}</dt>
      <dd className="min-w-0 break-words text-sm text-white/85">{children}</dd>
    </div>
  );
}
const DaFornire = () => <span className="text-white/40">da fornire</span>;

function Collegamento({ href, children }: { href: string; children: React.ReactNode }) {
  return esterno(href) ? (
    <a href={href} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-white underline-offset-2 hover:underline">
      {children} <ExternalLink className="h-3 w-3 shrink-0" />
    </a>
  ) : (
    <Link href={href} className="text-white underline-offset-2 hover:underline">
      {children}
    </Link>
  );
}

function InformazioniChannel({
  info,
  appartenenza,
  mediaPartner,
  slotVuoto,
  accento,
  ente,
}: {
  info: InfoScheda;
  appartenenza: string;
  mediaPartner: boolean;
  slotVuoto: boolean;
  accento: string;
  ente: string | null;
}) {
  const app = ETICHETTA_APPARTENENZA[appartenenza] ?? ETICHETTA_APPARTENENZA["da assegnare"]!;
  const numeroWa = info.whatsapp?.match(/wa\.me\/(\d+)/)?.[1];
  return (
    <section id="informazioni-channel" className="mt-6 scroll-mt-24 rounded-xl border p-5" style={{ borderColor: `${accento}55` }} aria-label="Informazioni e contatti" data-testid="informazioni-channel">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-[12px] font-black tracking-[0.2em]" style={{ color: accento }}>
          INFORMAZIONI E CONTATTI
        </h2>
        <span className="text-[11px] text-white/45">Scheda separata dal palinsesto{info.daRegia ? " · aggiornata in Regia" : ""}</span>
      </div>
      <dl className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <Voce etichetta="Appartenenza verificata" testid="info-appartenenza">
          <b className="text-white">{app.t}</b>
          {mediaPartner && appartenenza !== "DM" ? " · media partner esterno" : ""}
          <span className="block text-[11px] text-white/45">{app.sotto}</span>
        </Voce>
        <Voce etichetta="Descrizione" testid="info-descrizione">
          {info.descrizione ?? <DaFornire />}
        </Voce>
        <Voce etichetta="Servizi" testid="info-servizi">
          {info.servizi.length ? (
            <ul className="list-disc pl-4">
              {info.servizi.map((x) => (
                <li key={x}>{x}</li>
              ))}
            </ul>
          ) : (
            <DaFornire />
          )}
        </Voce>
        <Voce etichetta="Telefono" testid="info-telefono">
          {info.telefono ? (
            info.telefono.split(" · ").map((t) => {
              const num = t.replace(/[^+0-9]/g, "");
              return (
                <a key={t} href={`tel:${num}`} className="mr-3 inline-block text-white underline-offset-2 hover:underline">
                  {t}
                </a>
              );
            })
          ) : (
            <DaFornire />
          )}
        </Voce>
        <Voce etichetta="WhatsApp" testid="info-whatsapp">
          {info.whatsapp ? (
            <a href={info.whatsapp} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-white underline-offset-2 hover:underline">
              {numeroWa ? `+${numeroWa}` : "Scrivi su WhatsApp"} <ExternalLink className="h-3 w-3" />
            </a>
          ) : (
            <DaFornire />
          )}
        </Voce>
        <Voce etichetta="E-mail" testid="info-email">
          {info.email ? (
            info.email.split(" · ").map((m) => (
              <a key={m} href={`mailto:${m}`} className="mr-3 inline-block text-white underline-offset-2 hover:underline">
                {m}
              </a>
            ))
          ) : (
            <DaFornire />
          )}
        </Voce>
        <Voce etichetta="Social" testid="info-social">
          {info.social.length ? (
            <ul className="flex flex-col gap-1">
              {info.social.map((x) => (
                <li key={x.href}>
                  <Collegamento href={x.href}>{x.nome}</Collegamento>
                </li>
              ))}
            </ul>
          ) : (
            <DaFornire />
          )}
        </Voce>
        <Voce etichetta="Indirizzo e Maps" testid="info-maps">
          {info.indirizzo ?? <DaFornire />}
          {info.maps && (
            <a href={info.maps} target="_blank" rel="noopener noreferrer" className="mt-1 flex w-fit items-center gap-1 text-[12px] font-bold underline-offset-2 hover:underline" style={{ color: accento }}>
              Apri in Google Maps <ExternalLink className="h-3 w-3" />
            </a>
          )}
        </Voce>
        <Voce etichetta="Indicazioni" testid="info-indicazioni">
          {info.indicazioni ?? <DaFornire />}
        </Voce>
      </dl>
      {ente && (
        <p className="mt-4 text-[12px]">
          <Link href={ente} className="font-bold underline-offset-2 hover:underline" style={{ color: accento }} data-testid="scheda-completa">
            Scheda completa dell'ente →
          </Link>
        </p>
      )}
      {info.gruppi.length > 0 && (
        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3" data-testid="info-gruppi">
          {info.gruppi.map((g) => (
            <div key={g.titolo} className="rounded-lg border border-white/10 p-4">
              <h3 className="text-[11px] font-black tracking-[0.2em]" style={{ color: accento }}>
                {g.titolo}
              </h3>
              {g.voci.length ? (
                <ul className="mt-2 flex flex-col gap-2 text-sm">
                  {g.voci.map((x, i) => (
                    <li key={`${x.href}-${i}`} className="min-w-0">
                      <Collegamento href={x.href}>{x.nome}</Collegamento>
                      {x.nota && <span className="block text-[11px] text-white/45">{x.nota}</span>}
                      {x.maps && (
                        <a href={x.maps} target="_blank" rel="noopener noreferrer" className="text-[11px] font-bold underline-offset-2 hover:underline" style={{ color: accento }}>
                          Maps
                        </a>
                      )}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-2 text-sm text-white/40">da fornire</p>
              )}
            </div>
          ))}
        </div>
      )}
      <p className="mt-4 text-[10px] text-white/40">
        {slotVuoto ? "Spazio vuoto: i dati si compilano in Regia." : `Fonte: ${info.fonte}`} Nessun dato inventato: dove manca, «da fornire».
      </p>
    </section>
  );
}

/** 04/11/2026 (round 18) — galleria «Immagini ufficiali»: ogni file consegnato e registrato, mai ritagliato. */
function GalleriaImmaginiChannel({ slug, nome, logoRegia, accento }: { slug: string; nome: string; logoRegia: string | null; accento: string }) {
  const immagini = [
    ...(logoRegia ? [{ src: logoRegia, originale: null as string | null, titolo: "Logo inserito in Regia", larghezza: null as number | null, altezza: null as number | null, approvato: null as string | null }] : []),
    ...immaginiDelChannel(slug).filter((x) => x.src !== logoRegia),
  ];
  if (!immagini.length) return null;
  return (
    <section className="mb-8 rounded-xl border border-white/10 p-4 md:p-5" aria-label={`Immagini ufficiali · ${nome}`} data-testid="galleria-immagini-channel" data-immagini={immagini.length}>
      <h2 className="text-[12px] font-black tracking-[0.2em]" style={{ color: accento }}>
        IMMAGINI UFFICIALI · {immagini.length}
      </h2>
      <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {immagini.map((im) => (
          <figure key={im.src} className="flex min-w-0 flex-col gap-2">
            <a href={im.originale ?? im.src} target="_blank" rel="noreferrer" className="block rounded-lg border border-white/10 bg-black p-2 transition hover:border-white/35" title="Apri il file intero">
              <img
                src={im.src}
                alt={`${nome} · ${im.titolo}`}
                width={im.larghezza ?? undefined}
                height={im.altezza ?? undefined}
                loading="lazy"
                decoding="async"
                className="mx-auto aspect-video w-full object-contain"
                data-testid="immagine-ufficiale"
              />
            </a>
            <figcaption className="text-[11px] leading-snug text-white/60">
              {im.titolo}
              {im.approvato ? ` · approvata il ${im.approvato}` : ""}
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
