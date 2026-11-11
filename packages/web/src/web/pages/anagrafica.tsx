import { Link } from "wouter";
import { ImageOff, Hourglass, Radio as RadioIcon, ExternalLink } from "lucide-react";
import { useAnagrafica, useRadioPartner } from "../queries/anagrafica";

/**
 * ANAGRAFICA MASTER TBH — motore anti-doppione (ordine di Claudio del 30/08/2026).
 * Ogni attività, luogo, società o emittente esiste UNA VOLTA SOLA, con il suo ID MASTER:
 * le sezioni del portale la richiamano, non la ricopiano. Le card aprono sempre la scheda
 * interna, mai un sito esterno.
 */
export default function AnagraficaPage() {
  const { data } = useAnagrafica();
  const { data: radio } = useRadioPartner();
  const schede = data?.schede ?? [];

  return (
    <div className="mx-auto max-w-[1400px] px-4 md:px-8 py-14">
      <p className="text-[11px] tracking-[0.25em] uppercase text-[var(--tbh-muted)]">
        Motore anti-doppione
      </p>
      <h1 className="tbh-display tbh-h1">Anagrafica master TBH</h1>
      <p className="tbh-body text-[var(--tbh-muted)] mt-4 max-w-3xl">
        {data?.nota ??
          "Ogni elemento del portale ha un ID MASTER ed esiste una volta sola: le sezioni lo richiamano."}
      </p>

      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {schede.map((s) => (
          <Link
            key={s.id}
            to={`/master/${s.slug}`}
            className="tbh-card p-5 flex items-center gap-4 hover:border-[var(--tbh-neon)]"
          >
            {s.logo ? (
              <img
                src={s.logo}
                alt={s.nome}
                width={72}
                height={72}
                className="w-16 h-16 rounded-xl object-contain bg-black border border-[var(--tbh-line)] shrink-0"
              />
            ) : (
              <span className="w-16 h-16 grid place-items-center rounded-xl border border-dashed border-[var(--tbh-line)] text-[var(--tbh-muted)] shrink-0">
                <ImageOff size={20} />
              </span>
            )}
            <span className="min-w-0">
              <span className="block text-[10px] uppercase tracking-widest text-[var(--tbh-muted)]">
                {s.id}
              </span>
              <span className="block tbh-display text-lg leading-tight">{s.nome}</span>
              <span className="block text-xs text-[var(--tbh-gold)] uppercase tracking-wide">
                {s.categoria}
              </span>
              {s.citta ? (
                <span className="block text-xs text-[var(--tbh-muted)] mt-0.5">
                  {s.citta}
                  {s.provincia ? ` (${s.provincia})` : ""}
                </span>
              ) : null}
              {s.mancanti > 0 ? (
                <span className="inline-flex items-center gap-1 mt-2 text-[10px] uppercase tracking-wider text-[var(--tbh-muted)]">
                  <Hourglass size={11} /> {s.mancanti} dati da ricevere
                </span>
              ) : null}
            </span>
          </Link>
        ))}
      </div>

      <h2 className="tbh-display text-2xl mt-16 text-[var(--tbh-gold)]">Radio e TV partner</h2>
      <p className="tbh-body text-[var(--tbh-muted)] mt-2 max-w-3xl">
        {radio?.nota ??
          "Link ufficiali comunicati da Claudio. Loghi, frequenze e streaming non ancora forniti."}
      </p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {(radio?.radio ?? []).map((r) => (
          <div key={r.id} className="tbh-card p-5">
            <span className="block text-[10px] uppercase tracking-widest text-[var(--tbh-muted)]">
              {r.id} · {r.tipo}
            </span>
            <span className="flex items-center gap-2 tbh-display text-lg mt-1">
              <RadioIcon size={17} className="text-[var(--tbh-neon)] shrink-0" /> {r.nome}
            </span>
            <a
              href={r.sito}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-full border border-[var(--tbh-neon)] text-[var(--tbh-neon)] text-[11px] font-bold uppercase tracking-wide hover:bg-[var(--tbh-neon)] hover:text-black"
            >
              <ExternalLink size={14} /> Sito ufficiale
            </a>
            <ul className="mt-4 space-y-1 text-[11px] text-[var(--tbh-muted)]">
              {r.daRicevere.map((d) => (
                <li key={d}>· {d}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
