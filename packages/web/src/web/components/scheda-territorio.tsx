import { CalendarCheck, ExternalLink, Globe, MapPin, Phone } from "lucide-react";
import { LogoBox } from "./logo-box";
import { RigaInAllestimento } from "./in-allestimento";
import { wa } from "../lib/whatsapp";
import {
  urlMappa,
  urlTelefono,
  type AttivitaRimini,
  type CategoriaRimini,
} from "../../api/data/rimini-territorio";

/* ────────────────────────────────────────────────────────────────────────────
   SCHEDA TERRITORIO — il «pulsante-monitor» cliccabile delle schede di zona.

   Preset della card unica del sito (vale la regola di content-card.tsx: le
   pagine non ridisegnano una card, usano un preset). Rispetto alla ContentCard
   generica questa aggiunge i tre campi che una scheda di territorio ha e una
   card generica no: la RIGA LOCALITÀ E INDIRIZZO, i QUATTRO PULSANTI fissi
   (Sito, Mappa, Chiama, Prenota) e il NASTRO dell'etichetta commerciale
   (Partner TBH, Convenzionato, Promozione).

   Struttura, nell'ordine chiesto:
     1. marchio ufficiale oppure fotografia reale
     2. categoria colorata
     3. nome dell'attività
     4. breve descrizione
     5. località e indirizzo
     6. pulsanti Sito · Mappa · Chiama · Prenota
     7. eventuale etichetta Partner TBH / Convenzionato / Promozione

   Dove il dato reale non c'è: IN ALLESTIMENTO sulle righe di testo e
   «Immagine in aggiornamento» nel riquadro del marchio. Mai un pulsante morto:
   un pulsante senza indirizzo verificato NON viene disegnato.
   ──────────────────────────────────────────────────────────────────────────── */

export const TESTO_IMMAGINE_MANCANTE = "Immagine in aggiornamento";

function Pulsante({
  etichetta,
  url,
  icona,
  principale = false,
}: {
  etichetta: string;
  url: string | null;
  icona: React.ReactNode;
  principale?: boolean;
}) {
  if (!url) return null;
  const classe = principale
    ? "bg-[var(--tbh-neon)] text-black border-[var(--tbh-neon)]"
    : "border-[var(--tbh-line)] text-white hover:border-[var(--tbh-neon)] hover:text-[var(--tbh-neon)]";
  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.08em] transition ${classe}`}
    >
      {icona}
      {etichetta}
    </a>
  );
}

/** Riquadro 1: marchio ufficiale, fotografia reale oppure immagine in aggiornamento. */
function Riquadro({ a }: { a: AttivitaRimini }) {
  if (!a.immagine) {
    return (
      <div
        data-immagine-mancante={a.slug}
        className="flex h-28 w-full flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-white/20 bg-black/55 px-3 text-center md:h-32"
      >
        <span className="tbh-dato text-[10px] font-extrabold tracking-[0.16em] text-[var(--tbh-neon)]">
          {TESTO_IMMAGINE_MANCANTE}
        </span>
        <span className="text-[11px] leading-tight text-[var(--tbh-muted)]">{a.nome}</span>
      </div>
    );
  }

  /* Fotografia: riempie il riquadro. Marchio: LogoBox globale, intero e centrato. */
  if (a.tipoImmagine === "foto") {
    return (
      <div className="h-28 w-full overflow-hidden rounded-xl border border-white/10 bg-black md:h-32">
        <img
          src={a.immagine}
          alt={`${a.nome} — fotografia`}
          loading="lazy"
          width={320}
          height={200}
          className="h-full w-full object-cover"
        />
      </div>
    );
  }

  return (
    <LogoBox
      nome={a.nome}
      logo={a.immagine}
      formato="scheda-attivita"
      altezzaClasse="h-28 md:h-32"
      fondo={a.fondoLogo ?? "chiaro"}
      url={a.sito}
    />
  );
}

export function SchedaTerritorio({
  attivita: a,
  categoria,
  className = "",
}: {
  attivita: AttivitaRimini;
  categoria: CategoriaRimini;
  className?: string;
}) {
  const mappa = urlMappa(a);
  const telefono = urlTelefono(a);
  const prenota = a.prenotabile
    ? wa(
        `Buongiorno, vorrei prenotare presso ${a.nome}${
          a.indirizzo ? ` (${a.indirizzo})` : ""
        } a Rimini.`,
      )
    : null;

  return (
    <article
      data-scheda-territorio={a.slug}
      className={`tbh-card flex h-full flex-col gap-3 p-4 transition hover:border-[var(--tbh-neon)] ${className}`}
    >
      <Riquadro a={a} />

      {/* 2 · categoria colorata */}
      <span
        className="tbh-dato inline-flex w-fit items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.14em]"
        style={{ color: categoria.colore, borderColor: `${categoria.colore}66` }}
      >
        <span aria-hidden>{categoria.emoji}</span>
        {categoria.titolo}
      </span>

      {/* 3 · nome */}
      <h3 className="tbh-display text-lg leading-tight">{a.nome}</h3>

      {/* 4 · breve descrizione */}
      {a.descrizione ? (
        <p className="text-sm leading-snug text-[var(--tbh-muted)]">{a.descrizione}</p>
      ) : (
        <p className="flex items-center gap-2 text-[11px] text-[var(--tbh-muted)]">
          Descrizione <RigaInAllestimento cosa={`Descrizione ${a.nome}`} />
        </p>
      )}

      {/* 5 · località e indirizzo */}
      <div className="mt-auto flex items-start gap-2 text-[12px] leading-snug text-white/80">
        <MapPin size={14} className="mt-0.5 shrink-0 text-[var(--tbh-gold)]" />
        <span>
          {a.localita ? <span className="block text-white">{a.localita}</span> : null}
          {a.indirizzo ? (
            <span className="block text-[var(--tbh-muted)]">{a.indirizzo}</span>
          ) : (
            <span className="mt-1 inline-flex">
              <RigaInAllestimento cosa={`Indirizzo ${a.nome}`} />
            </span>
          )}
        </span>
      </div>

      {/* 6 · pulsanti */}
      <div className="flex flex-wrap gap-2 pt-1">
        <Pulsante
          etichetta="Sito"
          url={a.sito}
          icona={<Globe size={12} />}
          principale={Boolean(a.sito)}
        />
        <Pulsante etichetta="Mappa" url={mappa} icona={<MapPin size={12} />} />
        <Pulsante etichetta="Chiama" url={telefono} icona={<Phone size={12} />} />
        <Pulsante etichetta="Prenota" url={prenota} icona={<CalendarCheck size={12} />} />
      </div>

      {/* 7 · etichetta commerciale, solo se l'accordo è confermato */}
      {a.etichetta ? (
        <span className="tbh-dato w-fit rounded-full bg-[var(--tbh-neon)] px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.14em] text-black">
          {a.etichetta}
        </span>
      ) : null}

      {a.nota ? (
        <p className="flex items-start gap-1.5 text-[11px] leading-snug text-[var(--tbh-muted)]">
          <ExternalLink size={11} className="mt-0.5 shrink-0 opacity-60" />
          {a.nota}
        </p>
      ) : null}
    </article>
  );
}
