/**
 * «PREZZI, PROMO E VANTAGGI TBH» — Regolamento Prezzi, Promo & Vantaggi Circuito TBH.
 * Touch Plaza, 03/10/2026. Si apre dal banner principale del negozio e dal pulsante
 * «SCOPRI COME FUNZIONA».
 *
 * Testi trascritti dalle «REGOLE SHOP: PREZZI, PROMO, CIRCUITO TBH E CASHBACK» di Claudio.
 * Nessuna promo, percentuale o cashback inventato: qui si spiegano le regole, i valori
 * stanno sui singoli articoli e compaiono solo quando sono davvero configurati.
 */
import { Link } from "wouter";
import { ArrowLeft, ChevronRight, MessageCircle, ShoppingCart } from "lucide-react";
import { BannerPrezziPromo } from "../components/prezzi-promo-tbh";
import { useProducts } from "../queries/catalog";
import { waVantaggiTbhGenerico } from "../lib/whatsapp";
import { TIPI_PROMO } from "../../api/data/prezzi-tbh";

const BLOCCHI: { n: number; titolo: string; righe: string[]; colore: string }[] = [
  {
    n: 1,
    titolo: "Prezzo di listino",
    colore: "#3b82f6",
    righe: [
      "Ogni prodotto, servizio, corso, piano o esperienza ha un PREZZO PIENO DI LISTINO.",
      "Il prezzo di listino rimane il riferimento ufficiale dell'articolo anche quando è presente una promozione.",
      "Se non esiste una promozione attiva, questo è il prezzo pagato dal cliente.",
    ],
  },
  {
    n: 2,
    titolo: "Promozioni pubbliche · offerte per tutti",
    colore: "#ef4444",
    righe: [
      `Durante l'anno il sito può applicare campagne pubbliche: ${TIPI_PROMO.join(", ").replace("ALTRA CAMPAGNA TBH", "altre campagne TBH")}.`,
      "Quando una promo è attiva la scheda mostra: prezzo di listino, promo attiva (-XX% / -€XX), prezzo promozionale, risparmio e, se prevista, la scadenza.",
      "Il prezzo promozionale deriva sempre da una promozione realmente configurata.",
    ],
  },
  {
    n: 3,
    titolo: "Vantaggi Circuito TBH",
    colore: "#22c55e",
    righe: [
      "Gli aderenti possono richiedere, quando disponibili: sconto personalizzato, codice promo dedicato, codice personale, condizioni riservate, eventuale cumulo con la promozione corrente, cashback.",
      "Lo sconto TBH non viene concesso automaticamente a tutti: si richiede prima di pagare.",
    ],
  },
  {
    n: 4,
    titolo: "Promo + vantaggio TBH",
    colore: "#f59e0b",
    righe: [
      "Ogni promozione indica: CUMULABILE CON VANTAGGI TBH: SÌ / NO.",
      "Se SÌ, l'aderente può richiedere il proprio vantaggio anche sul prezzo promozionale.",
      "Se NO, si applicano esclusivamente le condizioni previste dalla campagna.",
    ],
  },
  {
    n: 5,
    titolo: "Cashback solo TBH",
    colore: "#ec4899",
    righe: [
      "Il cashback è identificato separatamente dagli sconti.",
      "SOLO GLI ADERENTI AL CIRCUITO TBH POSSONO RICHIEDERE IL CASHBACK.",
      "Ogni articolo indica: Cashback disponibile: SÌ / NO. Se SÌ: «Cashback riservato Circuito TBH – richiedilo dopo/secondo le modalità previste per l'acquisto».",
      "Il cashback non è mai mostrato come già acquisito quando necessita di verifica o richiesta.",
    ],
  },
];

const DISTINZIONI = [
  ["PREZZO PIENO", "prezzo ufficiale di listino."],
  ["PROMO PUBBLICA", "accessibile a tutti nel periodo indicato."],
  ["VANTAGGIO TBH", "personale e richiedibile esclusivamente dagli aderenti al Circuito TBH."],
  ["CASHBACK TBH", "richiedibile esclusivamente dagli aderenti al Circuito TBH, quando previsto."],
] as const;

export default function PrezziPromoVantaggiPage() {
  // Scorciatoie: SOLO le categorie che esistono davvero nel catalogo, niente voci vuote.
  const products = useProducts("Tutti");
  const categorie = (products.data?.categories ?? []).filter((c) => c !== "Tutti");

  return (
    <div className="mx-auto max-w-[1500px] px-4 md:px-8 py-10">
      <Link to="/shop" className="text-sm text-[var(--tbh-muted)] inline-flex items-center gap-2">
        <ArrowLeft size={16} /> Touch Plaza
      </Link>

      <header className="tbh-rise mt-4 mb-6">
        <p className="text-xs tracking-[0.25em] text-[var(--tbh-gold)] uppercase mb-2">
          Touch Plaza · Regolamento Prezzi, Promo &amp; Vantaggi Circuito TBH
        </p>
        <h1 className="tbh-display tbh-h1">Prezzi, promo e vantaggi TBH</h1>
        <p className="tbh-body text-[var(--tbh-muted)] max-w-3xl mt-3">
          Tutto quello che devi sapere prima di acquistare. Tutti possono acquistare: far parte
          del Circuito TBH aggiunge soltanto possibilità in più.
        </p>
      </header>

      <div className="mx-auto max-w-5xl">
        <BannerPrezziPromo cliccabile={false} />
      </div>

      <section className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {BLOCCHI.map((b) => (
          <article
            key={b.n}
            className="tbh-card p-5 border-t-4"
            style={{ borderTopColor: b.colore }}
          >
            <div className="flex items-center gap-3">
              <span
                className="tbh-display grid h-9 w-9 shrink-0 place-items-center rounded-full text-lg text-black"
                style={{ background: b.colore }}
              >
                {b.n}
              </span>
              <h2 className="tbh-display text-lg uppercase leading-tight">{b.titolo}</h2>
            </div>
            <ul className="mt-3 space-y-2 text-sm text-[var(--tbh-muted)]">
              {b.righe.map((r) => (
                <li key={r}>{r}</li>
              ))}
            </ul>
          </article>
        ))}

        <article className="tbh-card p-5 border-t-4 border-t-[#a855f7]">
          <div className="flex items-center gap-3">
            <span className="tbh-display grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#a855f7] text-lg text-black">
              6
            </span>
            <h2 className="tbh-display text-lg uppercase leading-tight">NON SEI NEL CIRCUITO TBH?</h2>
          </div>
          <p className="mt-3 text-sm text-[var(--tbh-muted)]" data-messaggio-non-tbh>
            Puoi acquistare normalmente al <strong className="text-white">prezzo pieno</strong>{" "}
            oppure usufruire dell&apos;eventuale <strong className="text-white">promozione pubblica attiva</strong>.
          </p>
        </article>
      </section>

      <section
        className="mt-6 tbh-card p-5 md:p-6 border border-[var(--tbh-gold)]/60 flex flex-col gap-4 md:flex-row md:items-center"
        data-messaggio-tbh
      >
        <div className="min-w-0 grow">
          <p className="tbh-display text-xl leading-tight text-[var(--tbh-gold)]">
            7 · SEI NEL CIRCUITO TBH?
            <br />
            RICHIEDI I TUOI VANTAGGI PRIMA DI PAGARE
          </p>
          <p className="mt-2 text-sm text-[var(--tbh-muted)]">
            Prima di completare l&apos;acquisto richiedi la verifica dei vantaggi disponibili:
            sconti personalizzati, codici dedicati, condizioni riservate e cashback. Su ogni
            articolo trovi il pulsante <strong className="text-white">RICHIEDI VANTAGGI TBH</strong>, già
            compilato con nome e codice dell&apos;articolo.
          </p>
        </div>
        <a
          href={waVantaggiTbhGenerico()}
          target="_blank"
          rel="noreferrer"
          className="inline-flex w-fit shrink-0 items-center gap-2 rounded-full bg-[var(--tbh-gold)] px-5 py-3 text-sm font-bold uppercase tracking-wide text-black"
        >
          <MessageCircle size={17} /> Richiedi vantaggi TBH
        </a>
      </section>

      <section className="mt-10">
        <h2 className="tbh-display tbh-h2 mb-4">Il sito distingue sempre</h2>
        <dl className="grid gap-3 sm:grid-cols-2">
          {DISTINZIONI.map(([k, v]) => (
            <div key={k} className="rounded-2xl border border-white/10 bg-black/40 p-4">
              <dt className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--tbh-neon)]">{k}</dt>
              <dd className="mt-1 text-sm">= {v}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-4 text-sm text-[var(--tbh-muted)] max-w-3xl">
          Nessuno sconto TBH viene applicato automaticamente a utenti non verificati e non
          vengono mostrati sconti, cashback o promozioni inesistenti: sugli articoli compaiono
          soltanto le condizioni realmente attive.
        </p>
      </section>

      <section className="mt-10 tbh-card p-5 md:p-6">
        <Link
          href="/shop"
          data-cta-tutti-prodotti
          className="tbh-neon-btn inline-flex items-center gap-2 px-6 py-3.5 text-base font-bold uppercase tracking-wide"
        >
          <ShoppingCart size={18} /> Scopri tutti i prodotti <ChevronRight size={18} />
        </Link>
        {categorie.length > 0 && (
          <div className="mt-5">
            <p className="text-[11px] uppercase tracking-[0.2em] text-[var(--tbh-muted)] mb-2">
              Oppure vai dritto a una categoria
            </p>
            <div className="flex flex-wrap gap-2">
              {categorie.map((c) => (
                <Link
                  key={c}
                  href={`/shop?categoria=${encodeURIComponent(c)}`}
                  className="rounded-full bg-white/10 px-4 py-2 text-sm font-semibold transition hover:bg-white/20"
                >
                  {c}
                </Link>
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
