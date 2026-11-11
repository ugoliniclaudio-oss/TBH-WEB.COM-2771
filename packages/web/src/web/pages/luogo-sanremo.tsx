import { Link } from "wouter";
import { MapPin, ExternalLink, Navigation } from "lucide-react";
import { useLuogoSanremo } from "../queries/portale";
import { BloccoAttesa, SpazioCommerciale, CtaCommerciale } from "../components/monitor";
import { MonitorUrl, FrecceNav } from "../components/monitor-url";
import { osmEmbed, osmLink, indicazioni } from "../lib/geo";
import { MiTroviQui } from "../components/mi-trovi-qui";

/**
 * PAGINA INTERNA DI UN LUOGO DI SANREMO — brief punto 2.
 * MONITOR → PAGINA INTERNA → AZIONE COMMERCIALE. Nessun contenuto inventato.
 *
 * AGGIORNAMENTO 29/08/2026: monitor con SPAZIO URL, mappa OpenStreetMap sulla posizione
 * reale (solo se l'indirizzo è confermato) e frecce avanti/indietro tra i luoghi.
 */
export default function LuogoSanremoPage({ slug }: { slug: string }) {
  const { data, isLoading } = useLuogoSanremo(slug);

  if (isLoading) {
    return <div className="mx-auto max-w-6xl px-4 py-16 text-[var(--tbh-muted)]">Caricamento…</div>;
  }

  const l = data?.luogo;
  if (!l) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-16 flex flex-col gap-4">
        <h1 className="tbh-display tbh-h1">Luogo non trovato</h1>
        <Link href="/sanremo" className="tbh-neon-btn self-start px-5 py-2.5">
          Torna alla mappa di Sanremo
        </Link>
      </div>
    );
  }

  const colore = l.colore;
  const posizionato = typeof l.lat === "number" && typeof l.lon === "number";
  const punto = posizionato ? { lat: l.lat as number, lon: l.lon as number } : null;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 md:py-12 flex flex-col gap-8">
      <FrecceNav
        prima={data?.prima ? { href: `/sanremo/${data.prima.slug}`, nome: data.prima.nome } : null}
        dopo={data?.dopo ? { href: `/sanremo/${data.dopo.slug}`, nome: data.dopo.nome } : null}
        colore={colore}
        etichetta="Scorri i luoghi di Sanremo"
        indice={data?.indice}
        totale={data?.totale}
      />

      <header className="flex flex-col gap-3">
        <Link href="/sanremo" className="text-xs uppercase tracking-[0.2em] text-[var(--tbh-gold)]">
          ← Area Sanremo · Mappa dei luoghi
        </Link>
        <h1 className="tbh-display tbh-h1 leading-none" style={{ color: colore }}>
          {l.nome}
        </h1>
        <p className="text-sm uppercase tracking-wide text-[var(--tbh-platinum)]">{l.tipo}</p>
        <p className="tbh-body max-w-3xl text-[var(--tbh-muted)]">{l.descrizione}</p>
        {l.indirizzo && (
          <p className="inline-flex items-center gap-1.5 text-sm text-[var(--tbh-muted)]">
            <MapPin size={15} /> {l.indirizzo}
          </p>
        )}
      </header>

      <section className="grid gap-4 md:grid-cols-2">
        {/* FOTO reale o riquadro dichiarato */}
        <div className="tbh-card overflow-hidden p-0" style={{ borderColor: `${colore}66` }}>
          <div
            className="px-4 py-2 text-center text-xs font-bold uppercase tracking-[0.18em] text-black"
            style={{ background: colore }}
          >
            FOTO DEL LUOGO
          </div>
          {l.foto ? (
            <img src={l.foto} alt={l.nome} className="aspect-video w-full object-cover" />
          ) : (
            <div className="aspect-video grid place-items-center p-6 text-center text-sm text-[var(--tbh-muted)]">
              Foto ufficiale da ricevere: in questo portale non vengono pubblicate immagini ricostruite.
            </div>
          )}
        </div>
        {/* MINI MONITOR con spazio URL */}
        <MonitorUrl
          titolo="MONITOR DEL LUOGO"
          url={l.video}
          chiave={`sanremo-${l.slug}`}
          cta="Guarda il video"
          archivio={null}
          colore={colore}
          argomento={`${l.nome} — Sanremo`}
        />
      </section>

      {/* POSIZIONE PRECISA SULLA MAPPA */}
      <section className="flex flex-col gap-3">
        <h2 className="tbh-display tbh-h2" style={{ color: colore }}>
          Dove si trova
        </h2>
        {punto ? (
          <div className="tbh-card overflow-hidden p-0" style={{ borderColor: `${colore}66` }}>
            <iframe
              title={`Mappa di ${l.nome}`}
              src={osmEmbed(punto)}
              className="aspect-[16/9] w-full border-0"
              loading="lazy"
            />
            <div className="flex flex-wrap items-center gap-3 p-4">
              <a
                href={indicazioni(punto)}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold uppercase tracking-wide text-black"
                style={{ background: colore }}
              >
                <Navigation size={14} /> Indicazioni stradali
              </a>
              <a
                href={osmLink(punto)}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-[var(--tbh-muted)] hover:text-[var(--tbh-neon)]"
              >
                Apri su OpenStreetMap <ExternalLink size={12} />
              </a>
              <span className="text-[11px] text-[var(--tbh-muted)]">
                Coordinate {punto.lat.toFixed(5)}, {punto.lon.toFixed(5)}
                {l.fonteCoordinate ? ` · Fonte: ${l.fonteCoordinate}` : ""}
              </span>
            </div>
          </div>
        ) : (
          <div className="tbh-card p-4 flex flex-col gap-2" style={{ borderColor: `${colore}55` }}>
            <p className="text-sm font-bold">Luogo non ancora posizionato sulla mappa</p>
            <p className="text-sm text-[var(--tbh-muted)]">
              {l.motivoNonPosizionato ??
                "L'indirizzo esatto non è confermato: nessuna coordinata viene messa a caso."}
            </p>
            {/* «MI TROVI QUI» (ordine del 29/08/2026): anche senza coordinate la navigazione
                non si ferma — Google Maps cerca nome + città. */}
            <MiTroviQui nome={l.nome} citta="Sanremo (IM)" indirizzo={l.indirizzo} />
            <CtaCommerciale
              tipo="informazioni"
              argomento={`Indirizzo esatto — ${l.nome} (Sanremo)`}
              colore={colore}
            />
          </div>
        )}
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <BloccoAttesa
          titolo="News dal luogo"
          attesa="Contenuti e servizi realizzati sul posto da pubblicare quando disponibili."
          cta="Proponi un contenuto"
          colore={colore}
        />
        <BloccoAttesa
          titolo="Eventi"
          attesa="Date e appuntamenti confermati da ricevere: nessuna data viene inventata."
          cta="Segnala un evento"
          colore={colore}
        />
        <BloccoAttesa
          titolo="Contenuti media partner"
          attesa="Interviste e riprese di DM Comunicazioni (media partner autonomo) collegate al luogo."
          cta="Richiedi una copertura"
          colore={colore}
        />
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="tbh-display tbh-h2" style={{ color: colore }}>
          Spazi commerciali
        </h2>
        <div className="grid gap-4 md:grid-cols-3">
          {l.spazi.map((s) => (
            <SpazioCommerciale key={s.titolo} titolo={s.titolo} descrizione={s.descrizione} stato={s.stato} />
          ))}
        </div>
        <p className="text-xs text-[var(--tbh-muted)]">{data?.nota}</p>
        <CtaCommerciale tipo="informazioni" argomento={`Spazi commerciali — ${l.nome} (Sanremo)`} colore={colore} />
      </section>

      {l.note.length > 0 && (
        <section className="tbh-card p-5 flex flex-col gap-2">
          <h2 className="tbh-display tbh-h3">Note</h2>
          <ul className="list-disc pl-5 text-sm text-[var(--tbh-muted)] flex flex-col gap-1">
            {l.note.map((n) => (
              <li key={n}>{n}</li>
            ))}
          </ul>
        </section>
      )}

      <section className="flex flex-col gap-3">
        <h2 className="tbh-display tbh-h3">Altri luoghi</h2>
        <div className="flex flex-wrap gap-2">
          {(data?.altri ?? []).map((a) => (
            <Link
              key={a.slug}
              href={`/sanremo/${a.slug}`}
              className="rounded-full border px-3 py-1.5 text-xs font-bold uppercase tracking-wide transition hover:bg-white/5"
              style={{ borderColor: `${a.colore}88`, color: a.colore }}
            >
              {a.nome}
            </Link>
          ))}
        </div>
      </section>

      <FrecceNav
        prima={data?.prima ? { href: `/sanremo/${data.prima.slug}`, nome: data.prima.nome } : null}
        dopo={data?.dopo ? { href: `/sanremo/${data.dopo.slug}`, nome: data.dopo.nome } : null}
        colore={colore}
        etichetta="Scorri i luoghi di Sanremo"
      />
    </div>
  );
}
