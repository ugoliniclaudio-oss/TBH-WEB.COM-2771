import { MapPin, ExternalLink, Navigation } from "lucide-react";
import { Link } from "wouter";
import { mapsRicerca, wazeLink, type Punto } from "../lib/geo";

/**
 * PULSANTE «MI TROVI QUI» — ordine di Claudio del 29/08/2026:
 * «SE NON HAI URL, LINK, USA LA POSIZIONE SU GOOGLE MAP OPPURE RICORDATI CHE CI DEVE ESSERE
 *  IL PULSANTE (MI TROVI QUI), COSÌ RENDI LA NAVIGAZIONE + VELOCE».
 *
 * Nessuna scheda resta senza una via d'uscita: se non c'è il sito ufficiale e non c'è una
 * pagina interna, si apre la posizione su Google Maps. Nessun indirizzo inventato: si passa
 * solo ciò che è già nei dati (nome, città, indirizzo, coordinate reali).
 */
export function MiTroviQui({
  nome,
  citta,
  indirizzo,
  punto,
  conWaze = false,
  className = "",
}: {
  nome?: string | null;
  citta?: string | null;
  indirizzo?: string | null;
  punto?: Punto | null;
  /** Aggiunge il pulsante Waze accanto a «Mi trovi qui» (ordine del 30/08/2026). */
  conWaze?: boolean;
  className?: string;
}) {
  const href = mapsRicerca([nome, indirizzo, citta], punto ?? null);
  const waze = conWaze ? wazeLink([nome, indirizzo, citta], punto ?? null) : null;
  if (!href) return null;
  if (waze) {
    return (
      <span className={`inline-flex flex-wrap items-center gap-2 ${className}`}>
        <a
          href={href}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[var(--tbh-neon)] text-[var(--tbh-neon)] text-xs font-bold uppercase tracking-wide hover:bg-[var(--tbh-neon)] hover:text-black transition duration-200"
        >
          <MapPin size={15} /> Mi trovi qui
        </a>
        <a
          href={waze}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#33ccff] text-[#33ccff] text-xs font-bold uppercase tracking-wide hover:bg-[#33ccff] hover:text-black transition duration-200"
        >
          <Navigation size={15} /> Waze
        </a>
      </span>
    );
  }
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[var(--tbh-neon)] text-[var(--tbh-neon)] text-xs font-bold uppercase tracking-wide hover:bg-[var(--tbh-neon)] hover:text-black transition duration-200 ${className}`}
    >
      <MapPin size={15} /> Mi trovi qui
    </a>
  );
}

/**
 * LINK A CASCATA — la regola di navigazione di Claudio, in un solo posto:
 * 1) sito ufficiale  →  2) pagina interna dedicata  →  3) posizione su Google Maps
 * («MI TROVI QUI»). L'ordine è sempre questo, così l'utente non deve cercare nulla.
 */
export function NavigaScheda({
  sito,
  pagina,
  etichettaPagina = "Scheda completa",
  nome,
  citta,
  indirizzo,
  punto,
  className = "",
}: {
  sito?: string | null;
  pagina?: string | null;
  etichettaPagina?: string;
  nome?: string | null;
  citta?: string | null;
  indirizzo?: string | null;
  punto?: Punto | null;
  className?: string;
}) {
  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      {sito ? (
        <a
          href={sito}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[var(--tbh-line)] text-xs font-bold uppercase tracking-wide hover:border-[var(--tbh-neon)] hover:text-[var(--tbh-neon)] transition duration-200"
        >
          <ExternalLink size={15} /> Sito ufficiale
        </a>
      ) : null}
      {pagina ? (
        <Link
          to={pagina}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[var(--tbh-gold)] text-[var(--tbh-gold)] text-xs font-bold uppercase tracking-wide hover:bg-[var(--tbh-gold)] hover:text-black transition duration-200"
        >
          {etichettaPagina}
        </Link>
      ) : null}
      <MiTroviQui nome={nome} citta={citta} indirizzo={indirizzo} punto={punto} />
    </div>
  );
}
