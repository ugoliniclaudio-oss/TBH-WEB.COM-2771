import { useState } from "react";
import { Link, useLocation } from "wouter";
import { ArrowLeft, ArrowRight, CalendarDays, Clock3, ExternalLink, Film, Play, Radio, Tv } from "lucide-react";
import { RUBRICHE_ID, type CanaleTouchId, type RubricaId } from "../../api/data/touch-canali";
import { useInfoCanali, useRubrica } from "../queries/canali-touch";
import { CHIAVE_AVVIO } from "../hooks/use-canale-adesso";
import { LogoRubrica, RubricaCard } from "../components/rubrica-card";
import { Appartiene } from "../components/appartiene";
import { SeguiDiretta } from "../components/segui-diretta";
import { DM, TBH } from "../lib/appartenenza";
import { COLORE_TBH } from "../lib/identita-tbh";
import { etichettaElemento } from "../lib/canali-touch";

/**
 * /rubriche e /rubriche/:slug — le rubriche del palinsesto TBH.
 * TOUCH MUSIC (musica e DJ J.C. Hugò) · DM ON AIR (informazione e dirette) ·
 * DM HIGHLIGHTS (sport e interviste). Altre rubriche si aggiungono in `data/touch-canali.ts`.
 * Ogni scheda: nome, logo originale, descrizione, orari, contenuti, anteprima, archivio,
 * collegamento ai player dei due canali.
 */

const GIALLO = COLORE_TBH;

export function RubricheIndice() {
  const info = useInfoCanali();
  return (
    <div className="mx-auto flex max-w-[1200px] flex-col gap-8 px-4 py-8 md:px-8 md:py-10">
      <header className="flex flex-col gap-3">
        <span className="text-xs uppercase tracking-[0.25em] text-[var(--tbh-gold)]">Palinsesto TBH</span>
        <h1 className="tbh-display tbh-h1 leading-[0.95]" style={{ color: GIALLO }}>
          RUBRICHE
        </h1>
        <p className="max-w-3xl text-[var(--tbh-muted)]">
          Le rubriche del palinsesto generale TBH, in onda su TOUCH RADIO e TOUCH TV. TOUCH MUSIC è una rubrica: non è il
          nome dei canali.
        </p>
      </header>
      <div className="grid gap-3 md:grid-cols-2">
        {(info.data?.rubriche ?? []).map((r) => (
          <RubricaCard key={r.id} r={r} />
        ))}
      </div>
      <SeguiDiretta compatto />
    </div>
  );
}

function Anteprima({ videoId, titolo }: { videoId: string; titolo: string }) {
  const [aperta, setAperta] = useState(false);
  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-black">
      {aperta ? (
        <iframe
          src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&playsinline=1`}
          title={titolo}
          allow="autoplay; encrypted-media; picture-in-picture"
          allowFullScreen
          className="absolute inset-0 h-full w-full"
        />
      ) : (
        <button type="button" onClick={() => setAperta(true)} className="absolute inset-0" aria-label={`Guarda l'anteprima: ${titolo}`}>
          <img src={`https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`} alt="" className="absolute inset-0 h-full w-full object-cover" />
          <span className="absolute inset-0 grid place-items-center bg-black/40">
            <span className="flex items-center gap-2 rounded-full px-5 py-2.5 font-bold text-black" style={{ background: GIALLO }}>
              <Play className="h-4 w-4 fill-current" /> ANTEPRIMA
            </span>
          </span>
        </button>
      )}
    </div>
  );
}

export function RubricaScheda({ slug }: { slug: string }) {
  const id = (RUBRICHE_ID as readonly string[]).includes(slug) ? (slug as RubricaId) : null;
  const q = useRubrica(id);
  const info = useInfoCanali();
  const [, naviga] = useLocation();
  const [tutti, setTutti] = useState(false);

  if (!id)
    return (
      <div className="mx-auto max-w-[900px] px-4 py-16 text-center">
        <p className="text-[var(--tbh-muted)]">Rubrica non trovata.</p>
        <Link href="/rubriche" className="mt-4 inline-flex text-[var(--tbh-neon)] underline">
          Tutte le rubriche
        </Link>
      </div>
    );

  const d = q.data;
  const r = d?.rubrica;
  const apri = (canale: CanaleTouchId, percorso: string) => {
    try {
      sessionStorage.setItem(CHIAVE_AVVIO, canale);
    } catch {
      /* resta il pulsante sulla pagina del canale */
    }
    naviga(`${percorso}#in-onda`);
  };
  const conVideo = d?.contenuti.find((c) => c.videoId);
  const conCover = d?.contenuti.find((c) => c.cover);
  const elenco = d ? (tutti ? d.contenuti : d.contenuti.slice(0, 12)) : [];
  const giorniConOrari = d?.settimana.filter((g) => g.blocchi.length) ?? [];

  return (
    <div className="mx-auto flex max-w-[1200px] flex-col gap-10 px-4 py-8 md:px-8 md:py-10" data-testid={`scheda-rubrica-${id}`}>
      <Link href="/rubriche" className="inline-flex w-fit items-center gap-1.5 text-sm text-[var(--tbh-muted)] hover:text-white">
        <ArrowLeft className="h-4 w-4" /> Tutte le rubriche
      </Link>
      {!r ? (
        <p className="text-[var(--tbh-muted)]">{q.isError ? "Scheda non raggiungibile in questo momento." : "Caricamento…"}</p>
      ) : (
        <>
          <header className="grid items-center gap-6 md:grid-cols-[auto_1fr]">
            <div className="mx-auto">
              <LogoRubrica r={r} grande />
            </div>
            <div className="flex min-w-0 flex-col gap-3">
              <span className="text-xs uppercase tracking-[0.25em] text-[var(--tbh-gold)]">Rubrica del palinsesto TBH</span>
              <h1 className="tbh-display tbh-h1 break-words leading-[0.95]" style={{ color: r.colore }}>
                {r.nome}
              </h1>
              <p className="tbh-h3 text-[var(--tbh-platinum)]">{r.sottotitolo}</p>
              <Appartiene a={r.appartenenza === "dm" ? DM : TBH} />
              <p className="max-w-3xl text-[var(--tbh-muted)]">{r.descrizione}</p>
              <div className="flex flex-wrap gap-3 pt-1">
                {(info.data?.canali ?? []).map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => apri(c.id, c.percorso)}
                    className="inline-flex min-h-11 items-center gap-2 rounded-full px-5 text-sm font-extrabold uppercase tracking-[0.06em] text-black"
                    style={{ background: GIALLO }}
                  >
                    {c.id === "tv" ? <Tv className="h-4 w-4" /> : <Radio className="h-4 w-4" />} {c.comando}
                  </button>
                ))}
              </div>
            </div>
          </header>

          {/* ORARI */}
          <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="tbh-card flex min-w-0 flex-col gap-3 p-5">
              <h2 className="tbh-display tbh-h3 flex items-center gap-2" style={{ color: GIALLO }}>
                <CalendarDays className="h-5 w-5" /> Orari
              </h2>
              {r.notaOrari && <p className="text-sm text-[var(--tbh-gold)]">{r.notaOrari}</p>}
              {giorniConOrari.length > 0 ? (
                <ul className="flex flex-col divide-y divide-white/5 text-sm">
                  {giorniConOrari.map((g, i) => (
                    <li key={g.data} className="flex flex-wrap gap-x-3 py-1.5">
                      <span className="w-28 shrink-0 capitalize text-[var(--tbh-muted)]">
                        {i === 0 && g.data === d.settimana[0]?.data ? "oggi" : g.giorno} {g.data.slice(8)}/{g.data.slice(5, 7)}
                      </span>
                      <span className="flex flex-col">
                        {g.blocchi.map((b) => (
                          <span key={b.da} className="text-[var(--tbh-platinum)]">
                            <span className="tbh-dato">{b.da}–{b.a}</span>
                            {r.id === "dm-on-air" ? <span className="text-[var(--tbh-muted)]"> · {b.titolo.replace("DM ON AIR — ", "")}</span> : null}
                          </span>
                        ))}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                !r.notaOrari && <p className="text-sm text-[var(--tbh-muted)]">Orari da confermare.</p>
              )}
              <p className="text-xs text-[var(--tbh-muted)]">Ora di Roma · palinsesto generale TBH, oggi condiviso dai due canali.</p>
            </div>

            <div className="tbh-card flex min-w-0 flex-col gap-3 p-5">
              <h2 className="tbh-display tbh-h3 flex items-center gap-2" style={{ color: GIALLO }}>
                <Clock3 className="h-5 w-5" /> Prossimi passaggi
              </h2>
              {d.prossimi.map((p) => (
                <div key={p.canale} className="flex flex-col gap-1">
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--tbh-muted)]">{p.nome}</p>
                  {p.elementi.length === 0 ? (
                    <p className="text-sm text-[var(--tbh-muted)]">Nessun passaggio in programma oggi e domani.</p>
                  ) : (
                    <ul className="flex flex-col text-sm">
                      {p.elementi.map((e) => (
                        <li key={`${e.tipo}-${e.inizio}`} className="flex gap-3 py-0.5">
                          <span className="tbh-dato w-12 shrink-0" style={{ color: r.colore }}>
                            {e.ora}
                          </span>
                          <span className="min-w-0 flex-1 truncate text-[var(--tbh-platinum)]">{e.titolo}</span>
                          <span className="hidden shrink-0 text-xs text-[var(--tbh-muted)] sm:inline">{etichettaElemento(e)}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* ANTEPRIMA */}
          {(conVideo?.videoId || conCover?.cover) && (
            <section className="flex flex-col gap-3">
              <h2 className="tbh-display tbh-h2 flex items-center gap-3 leading-none" style={{ color: GIALLO }}>
                <Film className="h-6 w-6" /> ANTEPRIMA
              </h2>
              <div className="grid gap-4 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
                {conVideo?.videoId ? (
                  <Anteprima videoId={conVideo.videoId} titolo={conVideo.titolo} />
                ) : (
                  <div className="relative aspect-video overflow-hidden rounded-xl bg-black">
                    <img src={conCover!.cover!} alt={`Copertina ufficiale — ${conCover!.titolo}`} className="absolute inset-0 m-auto h-full w-auto object-contain" />
                  </div>
                )}
                <div className="flex flex-col justify-center gap-1">
                  <p className="font-semibold text-[var(--tbh-platinum)]">{(conVideo ?? conCover)!.titolo}</p>
                  <p className="text-sm text-[var(--tbh-muted)]">{(conVideo ?? conCover)!.sotto}</p>
                </div>
              </div>
            </section>
          )}

          {/* CONTENUTI */}
          <section className="flex flex-col gap-3">
            <h2 className="tbh-display tbh-h2 leading-none" style={{ color: GIALLO }}>
              CONTENUTI
            </h2>
            <p className="text-sm text-[var(--tbh-muted)]">
              {r.id === "touch-music"
                ? "I prossimi brani della rubrica in palinsesto. Il catalogo completo è in archivio."
                : r.id === "dm-on-air"
                  ? "I programmi DM in palinsesto, in diretta dal canale YouTube ufficiale DM."
                  : `${d.totaleContenuti} video pubblicati da Daniele Manuelli sul canale ufficiale, con i titoli originali.`}
            </p>
            {elenco.length === 0 ? (
              <p className="text-sm text-[var(--tbh-muted)]">IN ALLESTIMENTO</p>
            ) : (
              <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {elenco.map((c, i) => (
                  <li key={`${c.titolo}-${i}`}>
                    <a
                      href={c.url ?? undefined}
                      target="_blank"
                      rel="noreferrer"
                      className="tbh-card flex items-center gap-3 p-2.5 hover:border-[#d7ff00]/60"
                    >
                      {c.cover || c.videoId ? (
                        <img
                          src={c.cover ?? `https://i.ytimg.com/vi/${c.videoId}/mqdefault.jpg`}
                          alt=""
                          loading="lazy"
                          className="h-12 w-20 shrink-0 rounded-md object-cover"
                        />
                      ) : (
                        <span className="grid h-12 w-20 shrink-0 place-items-center rounded-md bg-white/5">
                          <Tv className="h-4 w-4" style={{ color: r.colore }} />
                        </span>
                      )}
                      <span className="min-w-0 flex-1">
                        <span className="line-clamp-2 text-sm font-semibold text-[var(--tbh-platinum)]">{c.titolo}</span>
                        {c.sotto && <span className="block truncate text-xs text-[var(--tbh-muted)]">{c.sotto}</span>}
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            )}
            {d.contenuti.length > 12 && (
              <button
                type="button"
                onClick={() => setTutti((t) => !t)}
                className="w-fit rounded-full border border-white/20 px-4 py-2 text-sm text-[var(--tbh-platinum)] hover:border-white/50"
              >
                {tutti ? "Mostra meno" : `Mostra tutti (${d.contenuti.length})`}
              </button>
            )}
          </section>

          {/* ARCHIVIO */}
          <section className="tbh-card flex flex-col gap-3 p-5">
            <h2 className="tbh-display tbh-h3" style={{ color: GIALLO }}>
              Archivio
            </h2>
            <ul className="flex flex-col divide-y divide-[var(--tbh-line)]">
              {r.archivio.map((l) => (
                <li key={l.href}>
                  {l.esterno ? (
                    <a href={l.href} target="_blank" rel="noreferrer" className="flex items-center justify-between gap-3 py-2.5 hover:text-[var(--tbh-neon)]">
                      {l.label} <ExternalLink className="h-4 w-4 shrink-0" />
                    </a>
                  ) : (
                    <Link href={l.href} className="flex items-center justify-between gap-3 py-2.5 hover:text-[var(--tbh-neon)]">
                      {l.label} <ArrowRight className="h-4 w-4 shrink-0" style={{ color: GIALLO }} />
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </section>
        </>
      )}
    </div>
  );
}
