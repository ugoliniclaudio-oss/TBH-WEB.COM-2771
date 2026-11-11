import { Link } from "wouter";
import { ArrowLeft, Info, RefreshCw, Sparkles, Star } from "lucide-react";

import { useOroscopoEdicola } from "../queries/edicola";

/* ────────────────────────────────────────────────────────────────────────────
   EDICOLA TBH — OROSCOPO DEL GIORNO.

   Dodici segni, il Segno del Giorno in evidenza, e i testi scritti dalla
   redazione dal pannello. Niente oroscopi generati dal sito, niente servizi
   esterni interrogati di nascosto: finché il testo del giorno non è stato
   scritto, il segno mostra solo i suoi dati di fatto e la dicitura
   IN ALLESTIMENTO.
   ──────────────────────────────────────────────────────────────────────────── */

const AREE = [
  { chiave: "amore", titolo: "Amore", emoji: "❤️" },
  { chiave: "lavoro", titolo: "Lavoro", emoji: "💼" },
  { chiave: "fortuna", titolo: "Fortuna", emoji: "🍀" },
  { chiave: "benessere", titolo: "Benessere", emoji: "🌿" },
] as const;

type SegnoDelGiorno = {
  slug: string;
  nome: string;
  simbolo: string;
  dal: string;
  al: string;
  elemento: string;
  scritto: boolean;
  amore: string | null;
  lavoro: string | null;
  fortuna: string | null;
  benessere: string | null;
  testo: string | null;
  autore: string | null;
  href: string;
};

function giornoUmano(giorno: string): string {
  const d = new Date(`${giorno}T00:00:00`);
  if (Number.isNaN(d.getTime())) return giorno;
  return d.toLocaleDateString("it-IT", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

/** Scheda piena di un segno: aree, testo della redazione, firma. */
function SchedaSegno({ s, grande = false }: { s: SegnoDelGiorno; grande?: boolean }) {
  const aree = AREE.map((a) => ({ ...a, valore: s[a.chiave] })).filter((a) => a.valore);

  return (
    <article className={`tbh-card flex flex-col gap-3 ${grande ? "p-5 md:p-7" : "p-4"}`}>
      <header className="flex items-center gap-3">
        <span className={grande ? "text-4xl" : "text-2xl"} aria-hidden>
          {s.simbolo}
        </span>
        <div className="flex flex-col">
          <h3 className={`tbh-display ${grande ? "tbh-h3" : "text-[15px] font-extrabold"} text-white`}>
            {s.nome}
          </h3>
          <p className="text-[11px] text-[var(--tbh-muted)]">
            {s.dal} – {s.al} · {s.elemento}
          </p>
        </div>
      </header>

      {s.scritto ? (
        <>
          {s.testo && (
            <p className="whitespace-pre-line text-sm leading-relaxed text-white/90">{s.testo}</p>
          )}
          {aree.length > 0 && (
            <ul className="flex flex-col gap-2">
              {aree.map((a) => (
                <li key={a.chiave} className="text-sm text-[var(--tbh-muted)]">
                  <strong className="mr-1 text-white">
                    {a.emoji} {a.titolo}:
                  </strong>
                  {a.valore}
                </li>
              ))}
            </ul>
          )}
          {s.autore && (
            <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-[var(--tbh-muted)]">
              Firmato: {s.autore}
            </p>
          )}
        </>
      ) : (
        <p className="rounded-lg border border-dashed border-[var(--tbh-line)] p-3 text-[12px] text-[var(--tbh-muted)]">
          IN ALLESTIMENTO — il testo di oggi non è ancora stato scritto dalla redazione. Nessun
          oroscopo viene generato automaticamente al suo posto.
        </p>
      )}
    </article>
  );
}

export default function EdicolaOroscopoPage({ segno }: { segno?: string }) {
  const q = useOroscopoEdicola(segno?.trim() || undefined);
  const d = q.data;
  const richiesto = d?.segno ?? null;

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-8 md:px-8 md:py-10">
      {/* ── INTESTAZIONE ────────────────────────────────────────────────── */}
      <header className="tbh-rise flex flex-col gap-3">
        <Link
          to="/edicola"
          className="inline-flex w-fit items-center gap-2 text-[11px] font-extrabold uppercase tracking-[0.18em] text-[var(--tbh-muted)] transition hover:text-white"
        >
          <ArrowLeft size={14} aria-hidden /> Torna all'Edicola
        </Link>
        <h1 className="tbh-display tbh-h1">🔮 OROSCOPO TBH</h1>
        {d?.giorno && (
          <p className="tbh-body text-[var(--tbh-muted)]">
            Oroscopo di <strong className="text-white">{giornoUmano(d.giorno)}</strong>
            {typeof d.scrittiOggi === "number" && (
              <>
                {" · "}
                <span className="text-[var(--tbh-neon)]">{d.scrittiOggi}/12</span> segni già scritti
                dalla redazione
              </>
            )}
          </p>
        )}
      </header>

      {q.isLoading && (
        <div className="tbh-card mt-7 flex min-h-[200px] items-center justify-center border-dashed">
          <span className="inline-flex items-center gap-2 text-[12px] font-extrabold uppercase tracking-[0.18em] text-[var(--tbh-muted)]">
            <RefreshCw size={14} className="animate-spin" aria-hidden /> Lettura dell'oroscopo…
          </span>
        </div>
      )}

      {q.isError && (
        <p className="tbh-card mt-7 border-dashed p-6 text-sm text-[#FF6B6B]">
          {segno
            ? "Segno non riconosciuto, oppure oroscopo non disponibile in questo momento."
            : "L'oroscopo non è disponibile in questo momento."}
        </p>
      )}

      {/* ── SEGNO CHIESTO DALL'INDIRIZZO ────────────────────────────────── */}
      {richiesto && (
        <section className="mt-7" aria-label={`Oroscopo ${richiesto.nome}`}>
          <p className="mb-3 inline-flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-[0.2em] text-[var(--tbh-gold)]">
            <Star size={13} aria-hidden /> Il segno che hai chiesto
          </p>
          <SchedaSegno s={richiesto} grande />
        </section>
      )}

      {/* ── SEGNO DEL GIORNO ────────────────────────────────────────────── */}
      {!richiesto && d?.segnoDelGiorno && (
        <section className="mt-7" aria-label="Segno del giorno">
          <p className="mb-3 inline-flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-[0.2em] text-[var(--tbh-gold)]">
            <Sparkles size={13} aria-hidden /> Segno del giorno
          </p>
          <SchedaSegno s={d.segnoDelGiorno} grande />
        </section>
      )}

      {/* ── PERIODO IN CORSO ────────────────────────────────────────────── */}
      {d?.segnoDiOggi && (
        <p className="mt-5 text-[12px] text-[var(--tbh-muted)]">
          Periodo zodiacale in corso oggi:{" "}
          <strong className="text-white">
            {d.segnoDiOggi.simbolo} {d.segnoDiOggi.nome}
          </strong>{" "}
          ({d.segnoDiOggi.dal} – {d.segnoDiOggi.al})
        </p>
      )}

      {/* ── I DODICI SEGNI ──────────────────────────────────────────────── */}
      {d && d.segni.length > 0 && (
        <section className="mt-10" aria-label="I dodici segni">
          <h2 className="tbh-display mb-4 tbh-h3">Tutti i segni</h2>

          {/* Scorciatoie: un indirizzo per ogni segno. */}
          <nav className="tbh-scroll-x mb-5 flex gap-2 pb-1">
            {d.segni.map((s) => (
              <Link
                key={`link-${s.slug}`}
                to={s.href}
                className={`shrink-0 rounded-full border px-3 py-2 text-[11px] font-extrabold uppercase tracking-[0.1em] transition ${
                  richiesto?.slug === s.slug
                    ? "border-white/60 bg-white/10 text-white"
                    : "border-[var(--tbh-line)] text-[var(--tbh-muted)] hover:border-white/40 hover:text-white"
                }`}
              >
                {s.simbolo} {s.nome}
              </Link>
            ))}
          </nav>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {d.segni.map((s) => (
              <SchedaSegno key={s.slug} s={s} />
            ))}
          </div>
        </section>
      )}

      {/* ── NOTA ───────────────────────────────────────────────────────── */}
      {d?.nota && (
        <section className="tbh-card mt-12 flex flex-col gap-2 p-5 md:p-7">
          <h2 className="tbh-display flex items-center gap-2 tbh-h4">
            <Info size={17} className="text-[var(--tbh-neon)]" aria-hidden /> Come nasce questo
            oroscopo
          </h2>
          <p className="max-w-[95ch] text-sm text-[var(--tbh-muted)]">{d.nota}</p>
        </section>
      )}
    </div>
  );
}
