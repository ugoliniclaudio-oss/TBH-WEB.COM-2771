import { useEffect, useState } from "react";
import { Link } from "wouter";
import {
  ArrowRight,
  CalendarDays,
  Clock,
  ExternalLink,
  FolderOpen,
  ImageOff,
  MapPin,
} from "lucide-react";
import { CaroselloOrizzontale, CellaCarosello } from "./carosello-orizzontale";
import type { ContenutoEdicola } from "../../api/routes/edicola";

/* ────────────────────────────────────────────────────────────────────────────
   CARD EDICOLA — LO STANDARD UNICO DI OGNI NOTIZIA, ARTICOLO ED EVENTO.

   Sorella della CardLuogo (components/card-luogo.tsx): stesso impianto visivo
   — monitor dominante in alto, dati sotto, pulsanti grandi in fondo — ma qui
   il contenuto è editoriale, non un indirizzo fisico.

   La card risponde sempre alle stesse domande, nello stesso ordine:
     COS'È?     → MONITOR di anteprima (16:9) e TITOLO
     CHI LO DICE? → TESTATA e data
     DOVE PORTA? → 📂 APRI SCHEDA (pagina interna TBH) e FONTE ↗ (originale)

   Due regole che non si toccano:
     · dove l'immagine ufficiale non esiste, il monitor lo DICHIARA: nessuna
       immagine inventata, nessun riempitivo generato;
     · di un articolo esterno si mostrano solo titolo, sintesi breve, testata e
       data. Il testo integrale resta sul sito che l'ha scritto: «FONTE ↗».
   ──────────────────────────────────────────────────────────────────────────── */

export const TESTO_IMMAGINE_MANCANTE = "Immagine non fornita dalla fonte";

function dataBreve(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("it-IT", { day: "2-digit", month: "short" });
}

function oraBreve(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" });
}

/** «3 ore fa», «ieri»: quanto è fresca la notizia, senza inventare nulla. */
export function quandoUmano(iso: string | null): string {
  if (!iso) return "data non dichiarata";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "data non dichiarata";
  const minuti = Math.round((Date.now() - d.getTime()) / 60_000);
  if (minuti < 2) return "adesso";
  if (minuti < 60) return `${minuti} min fa`;
  const ore = Math.round(minuti / 60);
  if (ore < 24) return `${ore} ${ore === 1 ? "ora" : "ore"} fa`;
  const giorni = Math.round(ore / 24);
  if (giorni === 1) return "ieri";
  if (giorni < 8) return `${giorni} giorni fa`;
  return `${dataBreve(iso)} · ${oraBreve(iso)}`;
}

export function dataEventoUmana(giorno: string | null): string {
  if (!giorno) return "";
  const d = new Date(`${giorno}T00:00:00`);
  if (Number.isNaN(d.getTime())) return giorno;
  return d.toLocaleDateString("it-IT", { weekday: "short", day: "2-digit", month: "long" });
}

/* ── 1 · MONITOR DI ANTEPRIMA 16:9 ──────────────────────────────────────── */

export function MonitorContenuto({
  item,
  altezza = "aspect-[16/9]",
}: {
  item: ContenutoEdicola;
  altezza?: string;
}) {
  const [caduta, setCaduta] = useState(false);

  if (item.immagine && !caduta) {
    return (
      <div className={`w-full overflow-hidden rounded-xl border border-white/10 bg-black ${altezza}`}>
        <img
          src={item.immagine}
          alt={item.titolo}
          loading="lazy"
          referrerPolicy="no-referrer"
          onError={() => setCaduta(true)}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
        />
      </div>
    );
  }

  /* Nessuna immagine dichiarata dalla fonte: si dichiara, non si inventa. */
  return (
    <div
      className={`flex w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-white/20 bg-black/55 px-3 text-center ${altezza}`}
    >
      <span className="text-2xl" aria-hidden>
        {item.categoriaEmoji}
      </span>
      <span className="tbh-dato inline-flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-[0.16em] text-[var(--tbh-muted)]">
        <ImageOff size={12} aria-hidden /> {TESTO_IMMAGINE_MANCANTE}
      </span>
    </div>
  );
}

/* ── 2 · LA CARD ────────────────────────────────────────────────────────── */

export function CardEdicola({ item }: { item: ContenutoEdicola }) {
  const luogo = item.luogoEvento ?? item.territorioNome;

  return (
    <article className="tbh-card group flex h-full flex-col gap-3 p-3">
      <Link to={item.href} className="block" aria-label={`Apri la scheda: ${item.titolo}`}>
        <MonitorContenuto item={item} />
      </Link>

      {/* fonte · categoria · località */}
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[10px] font-extrabold uppercase tracking-[0.14em]">
        <span
          className="rounded-full px-2 py-1"
          style={{ backgroundColor: `${item.categoriaColore}22`, color: item.categoriaColore }}
        >
          {item.categoriaEmoji} {item.categoriaTitolo}
        </span>
        <span className="text-[var(--tbh-muted)]">{item.fonte ?? "fonte in verifica"}</span>
        {luogo && (
          <span className="inline-flex items-center gap-1 text-[var(--tbh-muted)]">
            <MapPin size={11} aria-hidden /> {luogo}
          </span>
        )}
      </div>

      <Link to={item.href} className="block">
        <h3 className="tbh-display text-[15px] leading-snug md:text-base">{item.titolo}</h3>
      </Link>

      {/* abstract: mai più di tre righe */}
      {item.abstract ? (
        <p className="line-clamp-3 text-[13px] leading-relaxed text-[var(--tbh-muted)]">
          {item.abstract}
        </p>
      ) : (
        <p className="text-[12px] italic text-[var(--tbh-muted)]">
          Sintesi non fornita dalla fonte.
        </p>
      )}

      {/* data e ora, oppure data evento */}
      <div className="mt-auto flex flex-wrap items-center gap-3 text-[11px] text-[var(--tbh-muted)]">
        {item.evento && item.dataEvento ? (
          <span className="inline-flex items-center gap-1 font-bold text-[var(--tbh-neon)]">
            <CalendarDays size={12} aria-hidden /> {dataEventoUmana(item.dataEvento)}
            {item.oraEvento ? ` · ${item.oraEvento}` : ""}
          </span>
        ) : (
          <span className="inline-flex items-center gap-1">
            <Clock size={12} aria-hidden /> {quandoUmano(item.dataPubblicazione)}
          </span>
        )}
      </div>

      {/* due pulsanti, sempre gli stessi */}
      <div className="grid grid-cols-2 gap-2">
        <Link
          to={item.href}
          className="inline-flex items-center justify-center gap-1 rounded-lg border border-[var(--tbh-neon)] px-2 py-2 text-[11px] font-extrabold uppercase tracking-[0.1em] text-[var(--tbh-neon)] transition hover:bg-[var(--tbh-neon)] hover:text-black"
        >
          <FolderOpen size={13} aria-hidden /> Apri scheda
        </Link>
        {item.urlOriginale ? (
          <a
            href={item.urlOriginale}
            target="_blank"
            rel="noopener noreferrer nofollow"
            className="inline-flex items-center justify-center gap-1 rounded-lg border border-[var(--tbh-line)] px-2 py-2 text-[11px] font-extrabold uppercase tracking-[0.1em] text-[var(--tbh-muted)] transition hover:border-white/40 hover:text-white"
          >
            Fonte <ExternalLink size={13} aria-hidden />
          </a>
        ) : (
          <span
            aria-disabled
            title="Questo contenuto è della redazione TBH: non ha una fonte esterna."
            className="inline-flex cursor-default items-center justify-center gap-1 rounded-lg border border-dashed border-[var(--tbh-line)] px-2 py-2 text-[11px] font-extrabold uppercase tracking-[0.1em] text-[var(--tbh-muted)] opacity-60"
          >
            Redazione TBH
          </span>
        )}
      </div>
    </article>
  );
}

/* ── 3 · MONITOR GRANDE «ULTIMA ORA» A ROTAZIONE ────────────────────────── */

export function MonitorUltimaOra({
  items,
  secondi = 7,
}: {
  items: ContenutoEdicola[];
  secondi?: number;
}) {
  const [i, setI] = useState(0);
  const [fermo, setFermo] = useState(false);

  useEffect(() => {
    if (items.length < 2 || fermo) return;
    const t = setInterval(() => setI((p) => (p + 1) % items.length), secondi * 1000);
    return () => clearInterval(t);
  }, [items.length, fermo, secondi]);

  useEffect(() => {
    if (i >= items.length) setI(0);
  }, [items.length, i]);

  if (items.length === 0) {
    return (
      <div className="tbh-card flex aspect-[16/9] w-full flex-col items-center justify-center gap-3 border-dashed p-6 text-center">
        <span className="tbh-dato text-[11px] font-extrabold uppercase tracking-[0.2em] text-[var(--tbh-neon)]">
          🔴 Ultima ora — in allestimento
        </span>
        <p className="max-w-xl text-sm text-[var(--tbh-muted)]">
          Nessuna notizia letta dalle fonti ufficiali in questo momento. Il monitor resta vuoto:
          non mostriamo titoli di riserva.
        </p>
      </div>
    );
  }

  const item = items[Math.min(i, items.length - 1)]!;

  return (
    <section
      className="relative w-full overflow-hidden rounded-2xl border border-[var(--tbh-line)] bg-black"
      onMouseEnter={() => setFermo(true)}
      onMouseLeave={() => setFermo(false)}
      aria-label="Ultima ora"
    >
      <Link to={item.href} className="group block">
        <div className="relative aspect-[16/9] w-full">
          <MonitorContenuto item={item} altezza="absolute inset-0 h-full rounded-none border-0" />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black via-black/65 to-transparent" />

          <div className="absolute left-0 right-0 top-0 flex items-center justify-between p-3 md:p-5">
            <span className="inline-flex items-center gap-2 rounded-full bg-[#FF3B30] px-3 py-1 text-[11px] font-extrabold uppercase tracking-[0.18em] text-white">
              <span className="h-2 w-2 animate-pulse rounded-full bg-white" aria-hidden />
              Ultima ora
            </span>
            <span className="rounded-full bg-black/70 px-3 py-1 text-[10px] font-extrabold uppercase tracking-[0.14em] text-[var(--tbh-muted)]">
              {item.fonte ?? "fonte in verifica"}
            </span>
          </div>

          <div className="absolute bottom-0 left-0 right-0 flex flex-col gap-2 p-4 md:p-7">
            <span
              className="tbh-dato text-[10px] font-extrabold uppercase tracking-[0.18em]"
              style={{ color: item.categoriaColore }}
            >
              {item.categoriaEmoji} {item.categoriaTitolo}
              {item.territorioNome ? ` · ${item.territorioNome}` : ""}
            </span>
            <h2 className="tbh-display text-lg leading-tight md:text-3xl lg:text-4xl">
              {item.titolo}
            </h2>
            {item.abstract && (
              <p className="line-clamp-2 max-w-3xl text-[13px] text-white/75 md:text-sm">
                {item.abstract}
              </p>
            )}
            <span className="text-[11px] text-[var(--tbh-muted)]">
              {quandoUmano(item.dataPubblicazione)}
            </span>
            <span className="tbh-neon-btn mt-1 inline-flex w-fit items-center gap-2 px-4 py-2 text-[12px]">
              Apri scheda <ArrowRight size={14} aria-hidden />
            </span>
          </div>
        </div>
      </Link>

      {/* i segnaposto: si tocca per saltare alla notizia, niente rotazione cieca */}
      {items.length > 1 && (
        <div className="flex flex-wrap items-center justify-center gap-2 border-t border-[var(--tbh-line)] bg-black/80 px-3 py-3">
          {items.map((x, n) => (
            <button
              key={x.id}
              type="button"
              aria-label={`Vai alla notizia ${n + 1}: ${x.titolo}`}
              aria-current={n === i}
              onClick={() => setI(n)}
              className={`h-2 rounded-full transition-all ${
                n === i ? "w-8 bg-[var(--tbh-neon)]" : "w-2 bg-white/25 hover:bg-white/50"
              }`}
            />
          ))}
        </div>
      )}
    </section>
  );
}

/* ── 4 · FASCIA TEMATICA (3-5 card per schermata, frecce + dito) ─────────── */

export function FasciaEdicola({
  emoji,
  titolo,
  descrizione,
  href,
  items,
  rimando,
  vuotoTesto,
  colore = "var(--tbh-neon)",
}: {
  emoji: string;
  titolo: string;
  descrizione?: string;
  href: string;
  items: ContenutoEdicola[];
  rimando?: { testo: string; href: string } | null;
  vuotoTesto?: string;
  colore?: string;
}) {
  return (
    <section className="flex flex-col gap-3" aria-label={titolo}>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="min-w-0">
          <h2 className="tbh-display flex items-center gap-2 text-xl md:text-2xl">
            <span aria-hidden>{emoji}</span>
            <span style={{ color: colore }}>{titolo}</span>
          </h2>
          {descrizione && (
            <p className="mt-1 max-w-3xl text-[13px] text-[var(--tbh-muted)]">{descrizione}</p>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {rimando && (
            <Link
              to={rimando.href}
              className="inline-flex items-center gap-1 rounded-full border border-[var(--tbh-line)] px-3 py-2 text-[11px] font-extrabold uppercase tracking-[0.1em] text-[var(--tbh-muted)] transition hover:border-white/40 hover:text-white"
            >
              {rimando.testo} <ArrowRight size={13} aria-hidden />
            </Link>
          )}
          <Link
            to={href}
            className="inline-flex items-center gap-1 rounded-full border border-[var(--tbh-neon)] px-3 py-2 text-[11px] font-extrabold uppercase tracking-[0.1em] text-[var(--tbh-neon)] transition hover:bg-[var(--tbh-neon)] hover:text-black"
          >
            Vedi tutto <ArrowRight size={13} aria-hidden />
          </Link>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="tbh-card border-dashed p-5 text-[13px] text-[var(--tbh-muted)]">
          {vuotoTesto ??
            "IN ALLESTIMENTO — nessun contenuto verificato in questa fascia per ora. Niente riempitivi: quando arriva il materiale ufficiale, compare qui."}
        </div>
      ) : (
        <CaroselloOrizzontale etichetta={titolo}>
          {items.map((item) => (
            <CellaCarosello key={`${titolo}-${item.id}`}>
              <CardEdicola item={item} />
            </CellaCarosello>
          ))}
        </CaroselloOrizzontale>
      )}
    </section>
  );
}

/* ── 5 · GRIGLIA (pagina di categoria) ──────────────────────────────────── */

export function GrigliaEdicola({ items }: { items: ContenutoEdicola[] }) {
  if (items.length === 0) {
    return (
      <div className="tbh-card border-dashed p-6 text-sm text-[var(--tbh-muted)]">
        IN ALLESTIMENTO — nessun contenuto verificato con questi filtri.
      </div>
    );
  }
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {items.map((item) => (
        <CardEdicola key={item.id} item={item} />
      ))}
    </div>
  );
}
