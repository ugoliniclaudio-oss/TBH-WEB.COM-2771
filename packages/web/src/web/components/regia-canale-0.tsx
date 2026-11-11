import { useState } from "react";
import { Link } from "wouter";
import {
  ArrowRight,
  Briefcase,
  ChevronDown,
  Compass,
  ExternalLink,
  ImageOff,
  MessageCircle,
  Phone,
  Play,
  ShoppingCart,
  Sparkles,
  Tv,
} from "lucide-react";

import { AREE } from "../lib/identita-tbh";
import { quandoUmano, TESTO_IMMAGINE_MANCANTE } from "./card-edicola";
import type { ContenutoEdicola } from "../../api/routes/edicola";

/* ────────────────────────────────────────────────────────────────────────────
   CANALE 0 — LA REGIA. Pezzi della nuova homepage, 28/09/2026.

   Ordine di Claudio (documento «FASE 1 — È DA QUI CHE INIZIEREI»): la home non
   deve chiedere al visitatore di capire tutto appena entra. Quindi, in ordine:
     TESTATA → SCHERMO PRINCIPALE → «COSA VUOI FARE?» → il resto.

   Tre regole che non si toccano:
     · lo SCHERMO PRINCIPALE mostra un contenuto REALE (la notizia o l'evento in
       cima all'Edicola). Dove l'immagine ufficiale non c'è, il monitor lo
       dichiara: nessuna immagine inventata;
     · le sei porte non sostituiscono il menu. Il menu resta in home come
       «ALTRE COSE DA FARE», con tutte le destinazioni di ogni area: ordine di
       Claudio del 28/09/2026, «rimetti il menù come altre scelte di attività da
       eseguire nel sito». Nessuna destinazione va persa;
     · una pagina esiste una volta sola: qui si linka sempre l'indirizzo
       canonico, mai una copia.
   ──────────────────────────────────────────────────────────────────────────── */

/* ── 1 · SCHERMO PRINCIPALE ─────────────────────────────────────────────── */

/**
 * Il grande monitor di apertura: un solo contenuto, quello del momento.
 * Prende il primo contenuto pubblicato in Edicola (notizia o evento reale).
 */
export function SchermoPrincipale({
  item,
  caricamento,
}: {
  item: ContenutoEdicola | null;
  caricamento: boolean;
}) {
  return (
    <section className="mx-auto max-w-[1500px] px-4 md:px-8 pt-5" aria-label="Schermo principale">
      <div className="overflow-hidden rounded-3xl border border-[var(--tbh-line)] bg-black/60">
        <div className="grid lg:grid-cols-[1.35fr_1fr]">
          {/* MONITOR: anteprima reale. Sul telefono tiene il 16:9; da tablet in su
             riempie l'altezza della colonna dei dati (l'aspect-ratio su una colonna
             di griglia si morde la coda e schiacciava il testo). */}
          <div className="relative aspect-video w-full bg-black lg:aspect-auto lg:min-h-[340px]">
            {item?.immagine ? (
              <img
                src={item.immagine}
                alt={item.titolo}
                loading="eager"
                className="absolute inset-0 size-full object-cover"
              />
            ) : (
              <div className="absolute inset-0 grid place-content-center gap-2 p-6 text-center">
                <ImageOff size={26} className="mx-auto text-[var(--tbh-muted)]" aria-hidden />
                <p className="text-[11px] uppercase tracking-[0.2em] text-[var(--tbh-muted)]">
                  {caricamento ? "Sintonizzazione…" : TESTO_IMMAGINE_MANCANTE}
                </p>
              </div>
            )}
            <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-black/80 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.16em] text-[var(--tbh-neon)] backdrop-blur">
              {/* Mai il codice del canale a schermo (28/09/2026): qui si è nella regia. */}
              <Tv size={12} aria-hidden /> In onda ora
            </span>
          </div>

          {/* DATI + PULSANTI */}
          <div className="flex flex-col justify-center gap-3 p-5 md:p-7">
            {item ? (
              <>
                <p
                  className="text-[10px] font-extrabold uppercase tracking-[0.2em]"
                  style={{ color: item.categoriaColore }}
                >
                  {item.categoriaEmoji} {item.categoriaTitolo}
                  {item.territorioNome ? ` · ${item.territorioNome}` : ""}
                </p>
                <h2 className="tbh-h2 line-clamp-4 leading-[1.08]">{item.titolo}</h2>
                {item.abstract && (
                  <p className="tbh-body line-clamp-3 max-w-[60ch] text-[13px] text-[var(--tbh-muted)]">
                    {item.abstract}
                  </p>
                )}
                <p className="text-[11px] text-[var(--tbh-muted)]">
                  {item.fonte ? `${item.fonte} · ` : ""}
                  {quandoUmano(item.dataPubblicazione)}
                </p>
                <div className="mt-1 flex flex-wrap gap-2">
                  <Link
                    to={item.href}
                    className="tbh-neon-btn inline-flex items-center gap-2 px-4 py-2.5 text-[11px] font-bold tracking-[0.14em]"
                  >
                    <Play size={14} aria-hidden /> APRI ADESSO
                  </Link>
                  {item.urlOriginale && (
                    <a
                      href={item.urlOriginale}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 rounded-xl border border-[var(--tbh-line)] px-4 py-2.5 text-[11px] font-bold tracking-[0.14em] hover:border-[var(--tbh-neon)] hover:text-[var(--tbh-neon)]"
                    >
                      <ExternalLink size={13} aria-hidden /> FONTE
                    </a>
                  )}
                  <Link
                    to="/edicola"
                    className="inline-flex items-center gap-2 rounded-xl border border-[var(--tbh-line)] px-4 py-2.5 text-[11px] font-bold tracking-[0.14em] hover:border-[var(--tbh-neon)] hover:text-[var(--tbh-neon)]"
                  >
                    TUTTA L'EDICOLA <ArrowRight size={13} aria-hidden />
                  </Link>
                </div>
              </>
            ) : (
              <>
                <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-[var(--tbh-neon)]">
                  Schermo principale
                </p>
                <h2 className="tbh-h2 leading-[1.08]">
                  {caricamento ? "SINTONIZZAZIONE IN CORSO" : "SCHERMO IN ALLESTIMENTO"}
                </h2>
                <p className="tbh-body max-w-[60ch] text-[13px] text-[var(--tbh-muted)]">
                  {caricamento
                    ? "Stiamo leggendo l'Edicola per mettere in onda il contenuto del momento."
                    : "Nessun contenuto verificato disponibile in questo momento: qui non mettiamo riempitivi. Intanto scegli cosa fare dai pulsanti qui sotto."}
                </p>
                <div className="mt-1 flex flex-wrap gap-2">
                  <Link
                    to="/edicola"
                    className="tbh-neon-btn inline-flex items-center gap-2 px-4 py-2.5 text-[11px] font-bold tracking-[0.14em]"
                  >
                    APRI L'EDICOLA <ArrowRight size={13} aria-hidden />
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── 2 · «COSA VUOI FARE?» — le sei porte ───────────────────────────────── */

type Porta = {
  label: string;
  to: string;
  icona: typeof Play;
  riga: string;
  colore: string;
};

/** Le sei porte del documento, nell'ordine indicato da Claudio. */
export const PORTE: Porta[] = [
  {
    label: "GUARDA",
    to: "/guida",
    icona: Tv,
    riga: "Canali, video, programmi e dirette",
    colore: "#d7ff00",
  },
  {
    label: "SCOPRI",
    to: "/tbh/societa",
    icona: Compass,
    riga: "Il gruppo, le società, i servizi",
    colore: "#2ED3B7",
  },
  {
    label: "LAVORA",
    to: "/lavoro-casting",
    icona: Briefcase,
    riga: "Annunci, casting, formazione",
    colore: "#ff8a00",
  },
  {
    label: "PARTECIPA",
    to: "/community",
    icona: Sparkles,
    riga: "Concorsi, eventi, community",
    colore: "#ff4fd8",
  },
  {
    label: "ACQUISTA",
    to: "/shop",
    icona: ShoppingCart,
    riga: "Touch Plaza: prodotti e servizi",
    colore: "#ffd400",
  },
  {
    label: "CONTATTACI",
    to: "/contatti",
    icona: Phone,
    riga: "Telefono, WhatsApp, email, sedi",
    colore: "#2f7bff",
  },
];

export function PorteAzione({ waHref }: { waHref: string }) {
  return (
    <section className="mx-auto max-w-[1500px] px-4 md:px-8 pt-6" aria-label="Cosa vuoi fare">
      <div className="flex flex-wrap items-end justify-between gap-3 px-1">
        <div>
          <p className="text-[10px] uppercase tracking-[0.22em] text-[var(--tbh-muted)]">
            Un clic e sei dentro
          </p>
          <h2 className="tbh-h3 leading-tight">COSA VUOI FARE?</h2>
        </div>
        <a
          href={waHref}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 rounded-full border border-[var(--tbh-neon)] px-3 py-2 text-[10px] font-extrabold tracking-[0.12em] text-[var(--tbh-neon)]"
        >
          <MessageCircle size={13} aria-hidden /> PARLA CON NOI
        </a>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {PORTE.map((p) => {
          const Icona = p.icona;
          return (
            <Link
              key={p.label}
              to={p.to}
              className="group rounded-2xl border bg-black/50 p-4 transition hover:-translate-y-0.5"
              style={{ borderColor: `${p.colore}66` }}
            >
              <span
                className="grid size-10 place-content-center rounded-xl"
                style={{ background: `${p.colore}1f`, color: p.colore }}
              >
                <Icona size={18} aria-hidden />
              </span>
              <p
                className="tbh-display mt-3 text-[17px] leading-none md:text-[19px]"
                style={{ color: p.colore }}
              >
                {p.label}
              </p>
              <p className="mt-1.5 text-[11px] leading-snug text-[var(--tbh-muted)]">{p.riga}</p>
              <span className="mt-2 inline-flex items-center gap-1 text-[10px] font-bold tracking-[0.12em] text-[var(--tbh-muted)] group-hover:text-white">
                ENTRA <ArrowRight size={11} aria-hidden />
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

/* ── 3 · IL MENU IN HOME: «ALTRE COSE DA FARE NEL SITO» ─────────────────── */

/**
 * Il menu completo, riportato in home come scelte di attività.
 * Ogni area è un titolo cliccabile; sotto, tutte le sue destinazioni.
 * Sul telefono le aree sono chiuse e si aprono a fisarmonica: nessuna colonna
 * infinita, nessuno zoom.
 */
export function MenuAttivita() {
  const [aperta, setAperta] = useState<string | null>(null);
  const totale = AREE.reduce((n, a) => n + a.items.length, 0);

  return (
    <section
      className="mx-auto max-w-[1500px] px-4 md:px-8 pt-10"
      aria-label="Altre cose da fare nel sito"
    >
      <div className="flex flex-wrap items-end justify-between gap-3 px-1">
        <div>
          <p className="text-[10px] uppercase tracking-[0.22em] text-[var(--tbh-muted)]">
            Il menu, per intero
          </p>
          <h2 className="tbh-h3 leading-tight">ALTRE COSE DA FARE NEL SITO</h2>
          <p className="tbh-body mt-1 max-w-[80ch] text-[12px] text-[var(--tbh-muted)]">
            {AREE.length} aree, {totale} destinazioni. Tocca il titolo dell'area per aprirla, oppure
            vai diretto alla pagina principale dell'area.
          </p>
        </div>
        <Link
          to="/mappa-sito"
          className="rounded-full border border-[var(--tbh-gold)] px-3 py-1.5 text-[10px] font-bold tracking-[0.12em] text-[var(--tbh-gold)]"
        >
          MAPPA DEL SITO
        </Link>
      </div>

      <div className="mt-3 grid items-start gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {AREE.map((a) => {
          const apertaQui = aperta === a.label;
          return (
            <div
              key={a.label}
              className="rounded-2xl border bg-black/40 p-3"
              style={{ borderColor: `${a.colore}55` }}
            >
              <div className="flex items-start justify-between gap-2">
                <Link to={a.to} className="min-w-0">
                  <p className="text-[9px] uppercase tracking-[0.2em] text-[var(--tbh-muted)]">
                    {a.occhiello}
                  </p>
                  <p
                    className="tbh-display truncate text-[16px] leading-none"
                    style={{ color: a.colore }}
                  >
                    {a.label}
                  </p>
                  <p className="mt-1 text-[11px] leading-snug text-[var(--tbh-muted)]">
                    {a.titolo}
                  </p>
                </Link>
                <button
                  type="button"
                  onClick={() => setAperta(apertaQui ? null : a.label)}
                  aria-expanded={apertaQui}
                  aria-label={`${apertaQui ? "Chiudi" : "Apri"} le voci di ${a.label}`}
                  className="shrink-0 rounded-lg border border-[var(--tbh-line)] p-1.5 text-[var(--tbh-muted)] transition hover:border-[var(--tbh-neon)] hover:text-[var(--tbh-neon)]"
                >
                  <ChevronDown
                    size={15}
                    aria-hidden
                    className={apertaQui ? "rotate-180 transition" : "transition"}
                  />
                </button>
              </div>

              {/* Le voci: sempre presenti nel documento, visibili all'apertura. */}
              <ul className={apertaQui ? "mt-2 space-y-1" : "sr-only"}>
                {a.items.map((v) => (
                  <li key={`${a.label}-${v.to}-${v.label}`}>
                    <Link
                      to={v.to}
                      className="block rounded-lg px-2 py-1.5 text-[12px] leading-snug text-[var(--tbh-muted)] transition hover:bg-white/5 hover:text-white"
                    >
                      {v.label}
                    </Link>
                  </li>
                ))}
              </ul>

              {!apertaQui && (
                <p className="mt-2 text-[10px] uppercase tracking-[0.14em] text-[var(--tbh-muted)]">
                  {a.items.length} {a.items.length === 1 ? "pagina" : "pagine"}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
