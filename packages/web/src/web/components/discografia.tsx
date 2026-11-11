import { Link } from "wouter";
import { CalendarDays, Disc3, Headphones, Library, ListMusic } from "lucide-react";

import { PERCORSI_MUSICA, RICORRENZA_LEGGIBILE, STATO_LEGGIBILE, type Ricorrenza, type StatoUscita } from "../../api/data/uscite-musicali";
import { useUsciteMusicali, type UscitaPubblica } from "../queries/uscite-musicali";
import { CaroselloOrizzontale } from "./carosello-orizzontale";
import { PulsanteCondividi } from "./pulsante-condividi";
import { CopertinaUscita, TIPO_LEGGIBILE, dataUscitaTesto } from "./uscite-musicali";

/* ══════════════════════════════════════════════════════════════════════════════
   DISCOGRAFIA — Touch Music Records Channel (04/11/2026, round 17).

   Claudio: «NUOVE USCITE DISCOGRAFICHE», sezione permanente sotto il player del Channel, con un
   carosello di copertine quadrate dalla più recente; ogni pubblicazione ha la sua pagina
   (APRI SINGOLO / APRI ALBUM = /musica/brano/<id>, la scheda già esistente).
   Pulsanti: ASCOLTA · APRI SINGOLO · TUTTE LE PIATTAFORME · CONDIVIDI.
   Legge la stessa scheda di pubblicazione di tutto il sito (cms_v1:uscite): una nuova uscita
   salvata dal pannello «Uscite e store» entra da sola nel carosello e nella discografia.
   ══════════════════════════════════════════════════════════════════════════════ */

const GIALLO = "#d7ff00";
const ORO = "#d4af37";

/** Dalla più recente: per data di uscita decrescente; senza data in fondo (ultime aggiornate prima). */
export function ordinaDallaPiuRecente(uscite: UscitaPubblica[]) {
  return [...uscite].sort(
    (a, b) =>
      Number(!a.dataUscita) - Number(!b.dataUscita) ||
      (b.dataUscita ?? "").localeCompare(a.dataUscita ?? "") ||
      b.aggiornato.localeCompare(a.aggiornato),
  );
}

/** Si può ascoltare: player Spotify ufficiale o almeno un servizio verificato (non social). */
export function ascoltabile(u: UscitaPubblica) {
  return !!u.spotifyEmbed || u.link.some((l) => l.disponibilitaConfermata && l.piattaforma !== "facebook" && l.piattaforma !== "instagram" && l.piattaforma !== "tiktok");
}

export const testoApri = (u: Pick<UscitaPubblica, "tipo">) => (u.tipo === "album" ? "APRI ALBUM" : "APRI SINGOLO");

function BadgeStato({ stato }: { stato: StatoUscita }) {
  if (stato === "pubblicata") return null;
  return (
    <span className="rounded-full px-2 py-0.5 text-[9px] font-black uppercase tracking-[0.12em] text-black" style={{ background: GIALLO }}>
      {STATO_LEGGIBILE[stato]}
    </span>
  );
}

export function BadgeRicorrenza({ r }: { r: Ricorrenza | null }) {
  if (!r || r === "nessuna") return null;
  return (
    <span className="rounded-full border px-2 py-0.5 text-[9px] font-black uppercase tracking-[0.12em]" style={{ borderColor: ORO, color: ORO }} data-testid="badge-ricorrenza">
      {RICORRENZA_LEGGIBILE[r]}
    </span>
  );
}

const BOTTONE = "inline-flex min-h-9 items-center justify-center gap-1.5 whitespace-nowrap rounded-full px-3 text-[10px] font-extrabold tracking-[0.08em] transition";

/** Card quadrata di una pubblicazione: copertina 1:1, dati essenziali, i quattro pulsanti. */
export function CardUscita({ u, larghezza = "w-[250px] sm:w-[270px]" }: { u: UscitaPubblica; larghezza?: string }) {
  return (
    <article
      className={`flex shrink-0 flex-col overflow-hidden rounded-2xl border border-white/10 bg-black/70 ${larghezza}`}
      data-testid={`card-uscita-${u.id}`}
    >
      <Link href={u.scheda} className="relative block aspect-square w-full bg-black" aria-label={`${testoApri(u)}: ${u.brano.titolo}`}>
        <CopertinaUscita src={u.brano.cover} titolo={u.brano.titolo} className="absolute inset-0 h-full w-full" />
      </Link>
      <div className="flex flex-1 flex-col gap-2 p-3">
        <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[10px] font-extrabold uppercase tracking-[0.14em]" style={{ color: ORO }}>
          <span>{TIPO_LEGGIBILE[u.tipo]}</span>
          <span className="inline-flex items-center gap-1">
            <CalendarDays size={11} /> {dataUscitaTesto(u)}
          </span>
        </p>
        <h3 className="line-clamp-2 text-[14px] font-black leading-tight text-white">{u.brano.titolo}</h3>
        {u.brano.artista && <p className="truncate text-[12px] text-white/60">{u.brano.artista}</p>}
        <div className="flex flex-wrap gap-1">
          <BadgeStato stato={u.statoMostrato} />
          <BadgeRicorrenza r={u.ricorrenza} />
        </div>
        {/* Copertina intera, nessun badge sopra: i pulsanti in griglia 2 colonne, TUTTE LE PIATTAFORME su tutta la riga. */}
        <div className="mt-auto grid grid-cols-2 gap-1.5 pt-1 [&>*]:w-full [&>*]:px-2">
          {ascoltabile(u) && (
            <Link href={`${u.scheda}#ascolta`} className={`${BOTTONE} text-black hover:brightness-110`} style={{ background: GIALLO }} data-testid={`ascolta-${u.id}`}>
              <Headphones size={12} /> ASCOLTA
            </Link>
          )}
          <Link href={u.scheda} className={`${BOTTONE} border hover:bg-[#d4af37] hover:text-black`} style={{ borderColor: ORO, color: ORO }} data-testid={`apri-uscita-${u.id}`}>
            <Disc3 size={12} /> {testoApri(u)}
          </Link>
          {u.link.some((l) => l.disponibilitaConfermata) && (
            <Link href={`${u.scheda}#piattaforme`} className={`${BOTTONE} col-span-2 border border-white/25 text-white/85 hover:border-white`} data-testid={`piattaforme-${u.id}`}>
              <ListMusic size={12} /> TUTTE LE PIATTAFORME
            </Link>
          )}
          <PulsanteCondividi percorso={u.scheda} titolo={u.brano.titolo} compatto testid={`condividi-${u.id}`} />
        </div>
      </div>
    </article>
  );
}

/**
 * NUOVE USCITE DISCOGRAFICHE — carosello permanente (Channel Touch Music Records, discografia).
 * Con nessuna uscita registrata lo dice, senza riempitivi inventati.
 */
export function NuoveUsciteDiscografiche({ className = "", conLinkDiscografia = true }: { className?: string; conLinkDiscografia?: boolean }) {
  const q = useUsciteMusicali();
  const uscite = ordinaDallaPiuRecente(q.data?.uscite ?? []);
  return (
    <section className={`flex flex-col gap-4 rounded-2xl border border-white/10 bg-black/60 p-4 md:p-6 ${className}`} aria-label="Nuove uscite discografiche" data-testid="nuove-uscite">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[10px] font-extrabold uppercase tracking-[0.22em]" style={{ color: ORO }}>
            Touch Music Records Channel
          </p>
          <h2 className="tbh-display tbh-h3 text-balance" style={{ color: GIALLO }}>
            NUOVE USCITE DISCOGRAFICHE
          </h2>
        </div>
        {conLinkDiscografia && (
          <Link
            href={PERCORSI_MUSICA.discografia}
            className="inline-flex min-h-10 items-center gap-1.5 rounded-full border px-4 text-[11px] font-extrabold uppercase tracking-[0.14em] transition hover:bg-[#d7ff00] hover:text-black"
            style={{ borderColor: GIALLO, color: GIALLO }}
            data-testid="link-discografia"
          >
            <Library size={13} /> Discografia completa
          </Link>
        )}
      </div>
      {q.isLoading ? (
        <p className="text-sm text-[var(--tbh-muted)]">Caricamento delle uscite…</p>
      ) : uscite.length === 0 ? (
        <p className="text-sm text-[var(--tbh-muted)]">Nessuna pubblicazione ancora registrata.</p>
      ) : (
        <CaroselloOrizzontale etichetta="Nuove uscite discografiche" ariaPrecedente="Uscite precedenti" ariaSuccessivo="Uscite successive">
          {uscite.map((u) => (
            <CardUscita key={u.id} u={u} />
          ))}
        </CaroselloOrizzontale>
      )}
    </section>
  );
}
