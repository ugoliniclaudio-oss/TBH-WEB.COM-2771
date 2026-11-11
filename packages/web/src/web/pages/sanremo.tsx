import { useMemo } from "react";
import { Link } from "wouter";
import { MapPin, ExternalLink } from "lucide-react";
import { useSanremo } from "../queries/portale";
import { MonitorCard, TitoloMonitor, CtaCommerciale } from "../components/monitor";
import { riquadro, posizione, osmEmbedRiquadro, osmLink } from "../lib/geo";
import { MiTroviQui } from "../components/mi-trovi-qui";
import { esterno } from "../lib/appartenenza";

const COLORE = "#ff2b2b";

/**
 * AREA SANREMO — brief punto 2: mappa editoriale + commerciale, pagina diversa dalle altre.
 * I pin aprono la pagina interna del luogo (MONITOR → PAGINA INTERNA → AZIONE COMMERCIALE).
 *
 * AGGIORNAMENTO 29/08/2026 — «METTERE IN MANIERA PRECISA SULLA MAPPA I CONTENUTI INSERITI»:
 * i pin non sono più stimati a occhio. Ogni luogo con indirizzo confermato ha coordinate reali
 * geocodificate su OpenStreetMap; la posizione sulla pianta è calcolata in proiezione Mercator.
 * I luoghi senza indirizzo confermato NON vengono posizionati e sono elencati a parte.
 */
export default function SanremoPage() {
  const { data, isLoading } = useSanremo();
  const luoghi = useMemo(() => data?.luoghi ?? [], [data]);

  const posizionati = useMemo(
    () => luoghi.filter((l) => typeof l.lat === "number" && typeof l.lon === "number"),
    [luoghi],
  );
  const nonPosizionati = useMemo(
    () => luoghi.filter((l) => typeof l.lat !== "number" || typeof l.lon !== "number"),
    [luoghi],
  );
  const box = useMemo(
    () => riquadro(posizionati.map((l) => ({ lat: l.lat as number, lon: l.lon as number }))),
    [posizionati],
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 md:py-12 flex flex-col gap-10">
      <header className="flex flex-col gap-3">
        <span className="text-xs uppercase tracking-[0.2em] text-[var(--tbh-gold)]">
          Area Sanremo · Mappa editoriale e commerciale
        </span>
        <h1 className="tbh-display tbh-h1 leading-none" style={{ color: COLORE }}>
          SANREMO
        </h1>
        <p className="tbh-body max-w-3xl text-[var(--tbh-platinum)]">
          I luoghi della città e della settimana del Festival: ogni punto della mappa apre una pagina
          interna con monitor video, foto, news, eventi, contenuti dei media partner e gli spazi
          commerciali disponibili.
        </p>
      </header>

      {/* MAPPA UFFICIALE OPENSTREETMAP: posizione reale, non schematica */}
      <section className="flex flex-col gap-4">
        <TitoloMonitor
          titolo="MAPPA UFFICIALE — POSIZIONE REALE"
          claim={`${posizionati.length} luoghi geolocalizzati su ${luoghi.length}`}
          colore={COLORE}
        />
        <div className="tbh-card overflow-hidden p-0">
          {box ? (
            <iframe
              title="Mappa OpenStreetMap dei luoghi di Sanremo"
              src={osmEmbedRiquadro(box)}
              className="aspect-[16/10] w-full border-0"
              loading="lazy"
            />
          ) : (
            <div className="aspect-[16/10] grid place-items-center p-6 text-center text-sm text-[var(--tbh-muted)]">
              Nessun luogo geolocalizzato: servono gli indirizzi confermati.
            </div>
          )}
          <p className="p-4 text-xs text-[var(--tbh-muted)]">
            Mappa OpenStreetMap. Le coordinate sono ricavate dagli indirizzi reali già in scheda: nessuna
            posizione inventata. I luoghi senza indirizzo confermato non compaiono sulla mappa.
          </p>
        </div>
      </section>

      {/* PIANTA CON I PIN CLICCABILI, calcolati dalle coordinate reali */}
      <section className="flex flex-col gap-4">
        <TitoloMonitor
          titolo="LA MAPPA DEI LUOGHI"
          claim="Clicca un punto per aprire la pagina interna"
          colore={COLORE}
        />
        <div className="tbh-card overflow-hidden p-0">
          <div className="relative aspect-[4/3] w-full bg-[#07080a]">
            <div
              className="absolute inset-0 opacity-30"
              style={{
                backgroundImage:
                  "linear-gradient(rgba(255,255,255,.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.08) 1px, transparent 1px)",
                backgroundSize: "40px 40px",
              }}
            />
            {box &&
              posizionati.map((l) => {
                const p = posizione({ lat: l.lat as number, lon: l.lon as number }, box);
                return (
                  <Link
                    key={l.slug}
                    href={`/sanremo/${l.slug}`}
                    className="absolute -translate-x-1/2 -translate-y-1/2 group transition-transform duration-300 hover:scale-110"
                    style={{ left: `${p.x}%`, top: `${p.y}%` }}
                  >
                    <span
                      className="grid h-8 w-8 place-items-center rounded-full border-2 bg-black/85 text-white shadow-lg"
                      style={{ borderColor: l.colore, color: l.colore }}
                    >
                      <MapPin size={16} />
                    </span>
                    <span
                      className="mt-1 block whitespace-nowrap rounded-full bg-black/85 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide"
                      style={{ color: l.colore }}
                    >
                      {l.nome}
                    </span>
                  </Link>
                );
              })}
          </div>
          <p className="p-4 text-xs text-[var(--tbh-muted)]">
            Pianta in scala calcolata dalle coordinate reali (proiezione Mercator, la stessa delle mappe):
            le distanze tra i punti sono corrette. Fonte coordinate: OpenStreetMap sugli indirizzi in scheda.
          </p>
        </div>

        {nonPosizionati.length > 0 && (
          <div className="tbh-card p-4 flex flex-col gap-2" style={{ borderColor: "#ff2b2b55" }}>
            <h3 className="tbh-display text-base">Luoghi non ancora posizionati</h3>
            <ul className="flex flex-col gap-1.5 text-sm text-[var(--tbh-muted)]">
              {nonPosizionati.map((l) => (
                <li key={l.slug}>
                  <Link href={`/sanremo/${l.slug}`} className="font-bold text-[var(--tbh-platinum)] hover:text-[var(--tbh-neon)]">
                    {l.nome}
                  </Link>{" "}
                  — {l.motivoNonPosizionato ?? "Indirizzo esatto da confermare."}
                </li>
              ))}
            </ul>
            <p className="text-[11px] text-[var(--tbh-muted)]">
              Appena arriva l'indirizzo esatto il pin compare al punto giusto. Nessuna coordinata viene
              messa a caso.
            </p>
          </div>
        )}

        {/* Piantina fornita dalla direzione: resta come riferimento visivo */}
        {data?.mappa && (
          <div className="tbh-card overflow-hidden p-0">
            <div className="px-4 py-2 text-center text-xs font-bold uppercase tracking-[0.18em] text-black" style={{ background: COLORE }}>
              PIANTINA DI RIFERIMENTO FORNITA DALLA DIREZIONE
            </div>
            <img
              src={data.mappa}
              alt="Piantina di riferimento dei luoghi di Sanremo"
              className="w-full object-cover"
            />
          </div>
        )}
      </section>

      {/* GRIGLIA MONITOR dei luoghi */}
      <section className="flex flex-col gap-4">
        <TitoloMonitor titolo="I LUOGHI" claim={`${luoghi.length} luoghi pubblicati`} colore={COLORE} />
        {isLoading ? (
          <p className="text-[var(--tbh-muted)]">Caricamento…</p>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {luoghi.map((l) => (
              <div key={l.slug} className="flex flex-col gap-2">
                <MonitorCard
                  nome={l.nome}
                  logo={l.foto}
                  apriPagina={`/sanremo/${l.slug}`}
                  appartenenza={esterno(l.tipo || "Luogo · Sanremo")}
                  colore={l.colore}
                  sottotitolo={l.tipo}
                  esterni={[]}
                  azione="informazioni"
                  nota={l.indirizzo}
                />
                {/* «MI TROVI QUI» sempre presente (ordine del 29/08/2026): se il luogo non è
                    posizionato, Google Maps cerca nome + indirizzo + città. Nessuna coordinata
                    inventata. */}
                <div className="flex flex-wrap items-center gap-2">
                  <MiTroviQui
                    nome={l.nome}
                    citta="Sanremo (IM)"
                    indirizzo={l.indirizzo}
                    punto={
                      typeof l.lat === "number" && typeof l.lon === "number"
                        ? { lat: l.lat, lon: l.lon }
                        : null
                    }
                  />
                  {typeof l.lat === "number" && typeof l.lon === "number" && (
                    <a
                      href={osmLink({ lat: l.lat, lon: l.lon })}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 self-start text-[11px] font-bold uppercase tracking-wide text-[var(--tbh-muted)] hover:text-[var(--tbh-neon)]"
                    >
                      Apri sulla mappa <ExternalLink size={12} />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="tbh-card p-5 flex flex-col gap-3">
        <h2 className="tbh-display tbh-h3">Come funziona questa area</h2>
        <p className="text-sm text-[var(--tbh-muted)]">{data?.nota}</p>
        <CtaCommerciale tipo="informazioni" argomento="Spazi commerciali Area Sanremo" colore={COLORE} />
      </section>
    </div>
  );
}
