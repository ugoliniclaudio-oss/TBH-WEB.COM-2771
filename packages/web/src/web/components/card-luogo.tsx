import { Link } from "wouter";
import { FolderOpen, ImageOff, MapPin, PlayCircle } from "lucide-react";
import { LogoBox } from "./logo-box";
import { CaroselloOrizzontale, CellaCarosello } from "./carosello-orizzontale";
import {
  categoria as categoriaTbh,
  etichettaLuogo,
  percorsoScheda,
  urlMappa,
  type AttivitaTBH,
} from "../../api/data/territorio";

/* ────────────────────────────────────────────────────────────────────────────
   CARD LUOGO — LO STANDARD UNICO DI OGNI POSIZIONE CENSITA TBH

   Specifica della direzione del 18/09/2026. Vale per QUALUNQUE luogo fisico
   del database: hotel, ristoranti, bar e locali, beach club, camping, negozi,
   centri commerciali, aziende, uffici, sedi TBH, circuiti, impianti sportivi,
   squadre e stadi, teatri, cinema, fiere, location per eventi, attrazioni,
   punti turistici, partner e attività del Circuito TBH.

   VIETATO, dove esiste questa card: pubblicare un indirizzo internet nudo o
   un elenco di righe di testo. Un luogo si presenta a monitor, non come link.

   LA CARD RISPONDE A TRE DOMANDE, SEMPRE NELLO STESSO ORDINE:
     COS'È?      → il MONITOR di anteprima (dominante) e il NOME
     DOV'È?      → il pulsante 📍 GOOGLE MAP
     COSA OFFRE? → il pulsante 📂 APRI SCHEDA (scheda interna, non si esce)

   Struttura fissa, non modificabile da sezione a sezione:
     1. MONITOR ANTEPRIMA dominante — fotografia reale, marchio ufficiale o
        anteprima video. Mai immagini generate e mai marchi ricostruiti: dove
        il materiale ufficiale non c'è, il monitor lo DICHIARA.
     2. NOME dell'attività
     3. CATEGORIA • CITTÀ
     4. due PULSANTI GRANDI sempre presenti: GOOGLE MAP e APRI SCHEDA.

   Il monitor è cliccabile e apre la scheda, come il pulsante APRI SCHEDA.
   GOOGLE MAP, se il luogo non ha un punto verificato, resta visibile ma
   disattivato e dichiarato («posizione in verifica»): nessun pulsante morto
   che finge di funzionare, nessuna posizione inventata.

   Lo scorrimento sta in FasciaLuoghi: frecce su computer, dito su telefono e
   tablet, mai una colonna verticale infinita.
   ──────────────────────────────────────────────────────────────────────────── */

export const TESTO_MONITOR_MANCANTE = "Immagine ufficiale in arrivo";
export const TESTO_MAPPA_MANCANTE = "Posizione in verifica";

/* ── 1 · MONITOR DI ANTEPRIMA ───────────────────────────────────────────── */

export function MonitorLuogo({
  luogo: a,
  altezza = "h-40 sm:h-44 md:h-48",
}: {
  luogo: AttivitaTBH;
  altezza?: string;
}) {
  /* Anteprima video: il video ufficiale del luogo, quando c'è. */
  if (a.video && !a.immagine) {
    return (
      <div
        className={`relative w-full overflow-hidden rounded-xl border border-white/10 bg-black ${altezza}`}
      >
        <video
          src={a.video}
          muted
          loop
          playsInline
          preload="metadata"
          className="h-full w-full object-cover"
        />
        <span className="absolute bottom-2 right-2 inline-flex items-center gap-1 rounded-full bg-black/70 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--tbh-neon)]">
          <PlayCircle size={12} /> Video ufficiale
        </span>
      </div>
    );
  }

  /* Fotografia reale: riempie il monitor. */
  if (a.immagine && a.tipoImmagine === "foto") {
    return (
      <div
        className={`w-full overflow-hidden rounded-xl border border-white/10 bg-black ${altezza}`}
      >
        <img
          src={a.immagine}
          alt={`${a.nome} — fotografia ufficiale`}
          loading="lazy"
          width={640}
          height={400}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
        />
      </div>
    );
  }

  /* Marchio ufficiale: LogoBox globale, intero e centrato sulla sua piastra. */
  if (a.immagine) {
    return (
      <LogoBox
        nome={a.nome}
        logo={a.immagine}
        formato="scheda-attivita"
        altezzaClasse={altezza}
        fondo={a.fondoLogo ?? "chiaro"}
      />
    );
  }

  /* Niente materiale ufficiale: il monitor lo dichiara, non lo inventa. */
  return (
    <div
      data-monitor-mancante={a.slug}
      className={`flex w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-white/20 bg-black/55 px-3 text-center ${altezza}`}
    >
      <ImageOff size={20} className="text-[var(--tbh-muted)]" aria-hidden />
      <span className="tbh-dato text-[10px] font-extrabold tracking-[0.16em] text-[var(--tbh-neon)]">
        {TESTO_MONITOR_MANCANTE}
      </span>
      <span className="text-[12px] leading-tight text-white/80">{a.nome}</span>
    </div>
  );
}

/* ── 4 · I DUE PULSANTI ─────────────────────────────────────────────────── */

const PULSANTE =
  "inline-flex min-h-11 flex-1 items-center justify-center gap-1.5 rounded-xl border px-2.5 py-2.5 text-center text-[11px] font-extrabold uppercase leading-tight tracking-[0.06em] transition";

function PulsanteMappa({ luogo: a }: { luogo: AttivitaTBH }) {
  const mappa = urlMappa(a);

  if (!mappa) {
    return (
      <span
        data-mappa-mancante={a.slug}
        title={TESTO_MAPPA_MANCANTE}
        aria-disabled="true"
        className={`${PULSANTE} cursor-not-allowed border-dashed border-white/15 text-[10px] text-[var(--tbh-muted)]`}
      >
        <MapPin size={14} className="shrink-0" aria-hidden /> {TESTO_MAPPA_MANCANTE}
      </span>
    );
  }

  return (
    <a
      href={mappa}
      target="_blank"
      rel="noreferrer"
      data-google-map={a.slug}
      aria-label={`Apri ${a.nome} su Google Maps`}
      className={`${PULSANTE} whitespace-nowrap border-[var(--tbh-line)] bg-black/40 text-white hover:border-[var(--tbh-neon)] hover:text-[var(--tbh-neon)]`}
    >
      <MapPin size={14} className="shrink-0" aria-hidden /> Google Map
    </a>
  );
}

/* ── LA CARD ────────────────────────────────────────────────────────────── */

export function CardLuogo({
  luogo: a,
  className = "",
}: {
  luogo: AttivitaTBH;
  className?: string;
}) {
  const cat = categoriaTbh(a.categorie[0] ?? "");
  const scheda = percorsoScheda(a);

  return (
    <article
      data-card-luogo={a.slug}
      data-id-tbh={a.id}
      className={`tbh-card group flex h-full flex-col gap-3 p-3 transition hover:border-[var(--tbh-neon)] ${className}`}
    >
      {/* 1 · monitor dominante: cliccabile, apre la scheda interna */}
      <Link
        href={scheda}
        aria-label={`Apri la scheda di ${a.nome}`}
        className="block overflow-hidden rounded-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--tbh-neon)]"
      >
        <MonitorLuogo luogo={a} />
      </Link>

      {/* 2 · nome */}
      <h3 className="tbh-display text-base leading-tight sm:text-lg">
        <Link href={scheda} className="hover:text-[var(--tbh-neon)]">
          {a.nome}
        </Link>
      </h3>

      {/* 3 · categoria • città */}
      <p className="tbh-dato flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] font-bold uppercase tracking-[0.1em]">
        <span style={{ color: cat.colore }}>
          <span aria-hidden>{cat.emoji}</span> {cat.titolo}
        </span>
        <span className="text-[var(--tbh-muted)]">• {etichettaLuogo(a)}</span>
      </p>

      {/* 4 · i due pulsanti, sempre in vista */}
      <div className="mt-auto flex items-stretch gap-2 pt-1">
        <PulsanteMappa luogo={a} />
        <Link
          href={scheda}
          data-apri-scheda={a.slug}
          className={`${PULSANTE} whitespace-nowrap border-[var(--tbh-neon)] bg-[var(--tbh-neon)] text-black hover:brightness-110`}
        >
          <FolderOpen size={14} className="shrink-0" aria-hidden /> Apri scheda
        </Link>
      </div>

      {/* Nastro commerciale: solo un accordo confermato può comparire. */}
      {a.etichetta ? (
        <span className="tbh-dato w-fit rounded-full border border-[var(--tbh-gold)] px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.14em] text-[var(--tbh-gold)]">
          {a.etichetta}
        </span>
      ) : null}
    </article>
  );
}

/* ── LA FASCIA ──────────────────────────────────────────────────────────── */

/** Una fila di luoghi che scorre in orizzontale: ← [MONITOR] [MONITOR] →.
    Su computer con le frecce, su telefono e tablet col dito. */
export function FasciaLuoghi({
  etichetta,
  luoghi,
  className = "",
}: {
  etichetta: string;
  luoghi: AttivitaTBH[];
  className?: string;
}) {
  if (luoghi.length === 0) return null;
  return (
    <CaroselloOrizzontale etichetta={etichetta} className={className}>
      {luoghi.map((a) => (
        <CellaCarosello key={a.id}>
          <CardLuogo luogo={a} />
        </CellaCarosello>
      ))}
    </CaroselloOrizzontale>
  );
}

/** Griglia per le pagine che mostrano tutto un elenco (ricerca, indice città):
    stessa card, nessuna colonna infinita su schermo grande. */
export function GrigliaLuoghi({
  luoghi,
  className = "",
}: {
  luoghi: AttivitaTBH[];
  className?: string;
}) {
  if (luoghi.length === 0) return null;
  return (
    <div
      className={`grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 ${className}`}
    >
      {luoghi.map((a) => (
        <CardLuogo key={a.id} luogo={a} />
      ))}
    </div>
  );
}
