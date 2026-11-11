import { useEffect } from "react";
import { Link, useParams } from "wouter";
import { CalendarDays, Clapperboard, Disc3, ExternalLink, Headphones, Library, ListMusic, Music4 } from "lucide-react";

import { useBranoMusicale } from "../queries/catalogo-musicale";
import { useUscitaDelBrano } from "../queries/uscite-musicali";
import { Briciole } from "../components/struttura";
import {
  CollegamentiMusica,
  CopertinaUscita,
  PulsantiUscita,
  TabellaLinkUscita,
  TIPO_LEGGIBILE,
  dataUscitaTesto,
} from "../components/uscite-musicali";
import { BadgeRicorrenza, ascoltabile } from "../components/discografia";
import { PulsanteCondividi } from "../components/pulsante-condividi";
import { PERCORSI_MUSICA, STATO_LEGGIBILE } from "../../api/data/uscite-musicali";
import { useAnteprimaPagina } from "../lib/anteprima-pagina";

/**
 * SCHEDA DEL BRANO — /musica/brano/:id (04/11/2026, round 16).
 *
 * Una pagina per ogni brano del catalogo musicale (anche senza scheda di pubblicazione).
 * Legge due dati, entrambi già usati dal resto del sito:
 *   · il brano (catalogoMusicale.brano): titolo, artista, copertina, audio e videoclip;
 *   · la sua uscita (usciteMusicali.elenco): data, pulsanti alle piattaforme, verifiche.
 * Audio e video compaiono solo se esistono davvero; altrimenti lo si dice.
 * La data compare solo se inserita a mano: mai ricavata dalla presenza di un link.
 */

const GIALLO = "#d7ff00";
const ORO = "#d4af37";

export default function SchedaBranoMusicaPage() {
  const { id = "" } = useParams<{ id: string }>();
  const q = useBranoMusicale(id);
  const { uscita, isLoading: caricaUscita } = useUscitaDelBrano(id);

  const b = q.data?.brano ?? null;
  const pronta = !q.isLoading && !caricaUscita && !!b;

  // Arrivando da ASCOLTA / TUTTE LE PIATTAFORME (#ascolta, #piattaforme): scorre alla sezione quando c'è.
  useEffect(() => {
    if (!pronta) return;
    const h = window.location.hash.slice(1);
    if (!h) return;
    const t = window.setTimeout(() => document.getElementById(h)?.scrollIntoView({ behavior: "smooth", block: "start" }), 120);
    return () => window.clearTimeout(t);
  }, [pronta, id]);
  useAnteprimaPagina(
    b
      ? {
          titolo: `${b.titolo}${b.artista ? ` — ${b.artista}` : ""} · TBH-WEB`,
          descrizione: uscita
            ? `${TIPO_LEGGIBILE[uscita.tipo]} · ${dataUscitaTesto(uscita)} · Scheda ufficiale nel catalogo musicale.`
            : "Scheda ufficiale nel catalogo musicale di DJ J.C. Hugò.",
          immagine: b.cover,
        }
      : null,
  );

  if (q.isLoading || caricaUscita)
    return <div className="mx-auto max-w-6xl px-4 py-16 text-[var(--tbh-muted)]">Caricamento…</div>;

  if (!b)
    return (
      <div className="mx-auto flex max-w-3xl flex-col gap-4 px-4 py-16" data-testid="brano-non-trovato">
        <h1 className="tbh-display tbh-h2" style={{ color: GIALLO }}>
          Brano non trovato
        </h1>
        <p className="text-[var(--tbh-muted)]">Questa scheda non è nel catalogo musicale.</p>
        <Link href={PERCORSI_MUSICA.catalogo} className="text-sm font-extrabold uppercase tracking-[0.14em] text-[#d7ff00]">
          ← Torna al catalogo musicale
        </Link>
        <CollegamentiMusica />
      </div>
    );

  const ascolto = q.data?.sorgentiAscolto ?? [];
  const video = q.data?.sorgentiVideo ?? [];
  const audioPrincipale = ascolto.find((s) => s.principale) ?? ascolto[0] ?? null;
  const embedAudio = audioPrincipale?.embed ?? b.audioEmbed ?? null;
  const urlAudio = audioPrincipale?.urlOriginale ?? audioPrincipale?.url ?? b.audioUrl ?? null;
  const videoPubblicato = b.statoVideo === "pubblicato" && !!b.videoUrl;
  const urlVideo = video[0]?.urlOriginale ?? video[0]?.url ?? (videoPubblicato ? b.videoUrl : null);
  const embedVideo = video[0]?.embed ?? null;
  const spotifyEmbed = uscita?.spotifyEmbed ?? null;
  const puoAscoltare = !!embedAudio || !!urlAudio || (uscita ? ascoltabile(uscita) : false);
  const scheda = PERCORSI_MUSICA.scheda(b.id);
  const dati: [string, string, string][] = uscita
    ? (
        [
          ["Artista distribuito", uscita.artistaDistribuito, "dato-artista-distribuito"],
          ["Distribuzione", uscita.distribuzione, "dato-distribuzione"],
          ["Genere", uscita.brano.genere, "dato-genere"],
          ["ISRC", uscita.isrc, "dato-isrc"],
          ["UPC", uscita.upc, "dato-upc"],
        ] as [string, string | null, string][]
      ).filter((x): x is [string, string, string] => !!x[1])
    : [];
  const BOTTONE = "inline-flex min-h-11 items-center justify-center gap-1.5 rounded-full px-5 text-[12px] font-extrabold tracking-[0.12em] transition";

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-8 md:py-12" data-testid="scheda-brano">
      <Briciole
        voci={[
          { label: "Home", href: "/" },
          { label: "Musica", href: "/musica" },
          { label: "J.C. Hugò", href: PERCORSI_MUSICA.artista },
          { label: b.titolo },
        ]}
      />

      <header className="grid gap-6 md:grid-cols-[minmax(0,360px)_1fr] md:items-start">
        <CopertinaUscita
          src={b.cover}
          titolo={b.titolo}
          className={`aspect-square w-full rounded-2xl border border-white/10 ${b.cover ? "max-w-[360px]" : "max-w-[200px] md:max-w-[360px]"}`}
        />
        <div className="flex min-w-0 flex-col gap-4">
          <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] font-extrabold uppercase tracking-[0.18em]" style={{ color: ORO }}>
            <span className="inline-flex items-center gap-1.5">
              <Disc3 size={13} /> {uscita ? TIPO_LEGGIBILE[uscita.tipo] : "Brano del catalogo"}
            </span>
            {uscita && (
              <span className="inline-flex items-center gap-1.5" data-testid="data-uscita">
                <CalendarDays size={13} /> {dataUscitaTesto(uscita)}
              </span>
            )}
          </p>
          <h1 className={`tbh-display ${b.titolo.length > 32 ? "tbh-h2" : "tbh-h1"} break-words leading-[0.95]`} style={{ color: GIALLO }} data-testid="titolo-brano">
            {b.titolo}
          </h1>
          {b.artista && <p className="tbh-h3 text-[var(--tbh-platinum)]">{b.artista}</p>}
          {uscita?.etichettaDiscografica && (
            <p className="flex flex-wrap items-center gap-3 text-sm text-white/70">
              <span>
                Etichetta: <span className="font-bold text-white">{uscita.etichettaDiscografica}</span>
              </span>
              {/touch music records/i.test(uscita.etichettaDiscografica) && (
                <Link href={PERCORSI_MUSICA.touchMusicRecords} aria-label="Touch Music Records Channel" data-testid="logo-records">
                  <img src="/musica/records/touch-music-records-channel.jpe" alt="Touch Music Records Channel" className="h-10 w-auto rounded-md" />
                </Link>
              )}
            </p>
          )}
          {uscita && (uscita.statoMostrato !== "pubblicata" || (uscita.ricorrenza && uscita.ricorrenza !== "nessuna")) && (
            <p className="flex flex-wrap gap-1.5">
              {uscita.statoMostrato !== "pubblicata" && (
                <span className="rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-black" style={{ background: GIALLO }} data-testid="badge-stato">
                  {STATO_LEGGIBILE[uscita.statoMostrato]}
                </span>
              )}
              <BadgeRicorrenza r={uscita.ricorrenza} />
            </p>
          )}
          {dati.length > 0 && (
            <dl className="grid max-w-2xl grid-cols-1 gap-x-6 gap-y-1.5 text-sm sm:grid-cols-2" data-testid="dati-pubblicazione">
              {dati.map(([k, v, t]) => (
                <div key={k} className="flex min-w-0 flex-wrap gap-x-2">
                  <dt className="text-white/55">{k}:</dt>
                  <dd className={`min-w-0 break-words font-bold text-white ${k === "ISRC" || k === "UPC" ? "font-mono tracking-wide" : ""}`} data-testid={t}>
                    {v}
                  </dd>
                </div>
              ))}
            </dl>
          )}
          {b.descrizione && <p className="max-w-2xl whitespace-pre-line text-sm leading-relaxed text-white/80">{b.descrizione}</p>}

          <div className="flex flex-wrap gap-2" data-testid="azioni-uscita">
            {puoAscoltare && (
              <a href="#ascolta" className={`${BOTTONE} text-black hover:brightness-110`} style={{ background: GIALLO }} data-testid="pulsante-ascolta">
                <Headphones size={14} /> ASCOLTA
              </a>
            )}
            {uscita && uscita.link.some((l) => l.disponibilitaConfermata) && (
              <a href="#piattaforme" className={`${BOTTONE} border hover:bg-[#d4af37] hover:text-black`} style={{ borderColor: ORO, color: ORO }} data-testid="pulsante-piattaforme">
                <ListMusic size={14} /> TUTTE LE PIATTAFORME
              </a>
            )}
            <PulsanteCondividi percorso={scheda} titolo={b.titolo} />
            <Link href={PERCORSI_MUSICA.discografia} className={`${BOTTONE} border border-white/25 text-white/85 hover:border-white`} data-testid="pulsante-discografia">
              <Library size={14} /> DISCOGRAFIA
            </Link>
          </div>

          {uscita ? (
            <PulsantiUscita link={uscita.link} messaggioAttesa={uscita.messaggioAttesa} />
          ) : !urlAudio ? (
            <PulsantiUscita link={[]} messaggioAttesa={null} />
          ) : null}
          {uscita?.notaMateriali && <p className="text-[12px] text-white/55">{uscita.notaMateriali}</p>}
        </div>
      </header>

      {/* PLAYER SPOTIFY UFFICIALE (round 17): solo da un link Spotify con disponibilità confermata. */}
      {spotifyEmbed && (
        <section id="ascolta" className="tbh-card flex scroll-mt-24 flex-col gap-3 p-4" aria-label="Ascolta su Spotify" data-testid="blocco-spotify">
          <h2 className="flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-[0.18em]" style={{ color: ORO }}>
            <Headphones size={14} /> Ascolta
          </h2>
          <iframe
            style={{ borderRadius: 12 }}
            src={spotifyEmbed}
            width="100%"
            height="352"
            frameBorder="0"
            allowFullScreen
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            loading="lazy"
            title={`${b.titolo} su Spotify`}
            data-testid="spotify-embed"
          />
        </section>
      )}

      {/* AUDIO E VIDEO: solo se esistono davvero. */}
      <section className="grid gap-4 md:grid-cols-2" aria-label="Audio e video">
        <div id={spotifyEmbed ? undefined : "ascolta"} className="tbh-card flex scroll-mt-24 flex-col gap-3 p-4" data-testid="blocco-audio">
          <h2 className="flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-[0.18em]" style={{ color: ORO }}>
            <Headphones size={14} /> Audio
          </h2>
          {embedAudio ? (
            <iframe
              src={embedAudio}
              title={`Ascolta ${b.titolo}`}
              loading="lazy"
              allow="autoplay; encrypted-media; clipboard-write"
              className="aspect-video w-full rounded-xl border-0 bg-black"
            />
          ) : null}
          {urlAudio ? (
            <a
              href={urlAudio}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-1.5 self-start rounded-full border border-white/20 px-4 py-2 text-[11px] font-extrabold uppercase tracking-[0.1em] hover:border-[#d7ff00] hover:text-[#d7ff00]"
            >
              <ExternalLink size={12} /> Apri l'audio
            </a>
          ) : (
            <p className="text-sm text-[var(--tbh-muted)]">
              {spotifyEmbed ? "Ascolto ufficiale nel player Spotify qui sopra; nessun file audio caricato sul sito." : "Audio: non ancora disponibile."}
            </p>
          )}
        </div>
        <div className="tbh-card flex flex-col gap-3 p-4" data-testid="blocco-video">
          <h2 className="flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-[0.18em]" style={{ color: ORO }}>
            <Clapperboard size={14} /> Videoclip
          </h2>
          {embedVideo ? (
            <iframe
              src={embedVideo}
              title={`Videoclip ${b.titolo}`}
              loading="lazy"
              allow="autoplay; encrypted-media; picture-in-picture"
              allowFullScreen
              className="aspect-video w-full rounded-xl border-0 bg-black"
            />
          ) : null}
          {urlVideo ? (
            <a
              href={urlVideo}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-1.5 self-start rounded-full border px-4 py-2 text-[11px] font-extrabold uppercase tracking-[0.1em]"
              style={{ borderColor: ORO, color: ORO }}
            >
              <Clapperboard size={12} /> Guarda il videoclip
            </a>
          ) : (
            <p className="text-sm text-[var(--tbh-muted)]">Video: non ancora disponibile.</p>
          )}
        </div>
      </section>

      {uscita && (
        <section id="piattaforme" className="tbh-card flex scroll-mt-24 flex-col gap-3 p-4" aria-label="Piattaforme" data-testid="blocco-piattaforme">
          <h2 className="flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-[0.18em]" style={{ color: ORO }}>
            <Music4 size={14} /> Piattaforme · disponibilità
          </h2>
          <TabellaLinkUscita link={uscita.link} />
        </section>
      )}

      <CollegamentiMusica titolo="Area musica · collegamenti" />
    </div>
  );
}
