import { Link } from "wouter";
import { ChevronRight, MessageCircle, Sparkles } from "lucide-react";
import { FasciaAppartenenza } from "./anteprima-pulsante";
import { TOUCH_PLAZA } from "../lib/appartenenza";
import { waVantaggiTbh } from "../lib/whatsapp";
import { euro } from "../lib/euro";
import {
  etichetteAttive,
  promoAttiva,
  type CampiCommerciali,
  type EtichettaShop,
} from "../../api/data/prezzi-tbh";

/* ────────────────────────────────────────────────────────────────────────────
   TOUCH PLAZA — PREZZI, PROMO E VANTAGGI TBH (regole di Claudio del 03/10/2026).

   Tutti i pezzi di interfaccia del regolamento stanno qui, una sola volta:
     · BannerPrezziPromo  → la grafica ufficiale, intera, cliccabile verso la pagina;
     · IngressoPrezziPromo → «PREZZO PIENO, PROMO O VANTAGGIO TBH? [SCOPRI COME FUNZIONA]»;
     · RichiediVantaggiTbh → la riga «SEI NEL CIRCUITO TBH?» vicino a OGNI prezzo;
     · BoxVantaggiCircuito → il box fisso della scheda, PRIMA di «Acquista ora»;
     · PrezzoDettaglio     → listino / promo / risparmio / scadenza / cashback, solo dati veri;
     · EtichetteShop       → le etichette del negozio, solo quando attive.
   Nessuno sconto TBH è automatico: il pulsante apre una RICHIESTA su WhatsApp.
   ──────────────────────────────────────────────────────────────────────────── */

export const PAGINA_PREZZI_PROMO = "/shop/prezzi-promo-vantaggi";
const BANNER = "/shop/prezzi-promo-vantaggi/banner-orizzontale.jpg";

type ConPrezzo = CampiCommerciali & { priceCents: number };

/**
 * Banner ufficiale «PREZZI, PROMO E VANTAGGI TBH». Si mostra INTERO (mai ritagliato né
 * ritoccato): la versione verticale per il telefono non è ancora arrivata, quindi anche
 * sul telefono si vede l'orizzontale in scala, intera.
 */
export function BannerPrezziPromo({
  cliccabile = true,
  className = "",
}: {
  cliccabile?: boolean;
  className?: string;
}) {
  const img = (
    <img
      src={BANNER}
      alt="Touch Plaza — Prezzi, promo e vantaggi TBH: tutto quello che devi sapere"
      width={1672}
      height={941}
      className="block h-auto w-full max-w-full object-contain"
    />
  );
  if (!cliccabile)
    return <div className={`overflow-hidden rounded-2xl border border-white/10 ${className}`}>{img}</div>;
  return (
    <Link
      href={PAGINA_PREZZI_PROMO}
      data-anteprima-pulsante
      data-banner-prezzi-promo
      aria-label="Prezzi, promo e vantaggi TBH — TBH Touch Plaza: apri il regolamento"
      className={`group block overflow-hidden rounded-2xl border border-white/10 transition hover:border-[var(--tbh-neon)]/60 ${className}`}
    >
      {img}
      <div className="flex flex-wrap items-center justify-between gap-2 bg-black/85">
        <div className="min-w-0 grow">
          <FasciaAppartenenza a={TOUCH_PLAZA} />
        </div>
        <span className="mr-3 inline-flex items-center gap-1 py-2 text-xs font-bold uppercase tracking-wide text-[var(--tbh-neon)]">
          Apri il regolamento <ChevronRight size={14} />
        </span>
      </div>
    </Link>
  );
}

/** Banner d'ingresso del negozio (punto 8 del regolamento). Testi come scritti da Claudio. */
export function IngressoPrezziPromo({ className = "" }: { className?: string }) {
  return (
    <section
      data-ingresso-prezzi-promo
      className={`tbh-card flex flex-col gap-4 p-5 md:flex-row md:items-center md:p-6 ${className}`}
    >
      <div className="min-w-0 grow">
        <h2 className="tbh-display text-xl leading-tight md:text-2xl">
          PREZZO PIENO, PROMO O VANTAGGIO TBH?
        </h2>
        <p className="mt-2 text-sm font-semibold">Tutti possono acquistare.</p>
        <p className="mt-1 text-sm text-[var(--tbh-muted)]">
          Gli aderenti al Circuito TBH possono richiedere <strong className="text-white">vantaggi personalizzati e cashback</strong>.
        </p>
      </div>
      <Link
        href={PAGINA_PREZZI_PROMO}
        className="tbh-neon-btn inline-flex w-fit shrink-0 items-center gap-2 px-5 py-3 text-sm font-bold uppercase tracking-wide"
      >
        Scopri come funziona <ChevronRight size={16} />
      </Link>
    </section>
  );
}

/** Riga vicino al prezzo di OGNI articolo (punto 4). */
export function RichiediVantaggiTbh({
  titolo,
  codice,
  priceCents,
  compatto = false,
}: {
  titolo: string;
  codice: string;
  priceCents: number;
  compatto?: boolean;
}) {
  return (
    <div
      data-richiedi-vantaggi-tbh
      className={`rounded-xl border border-[var(--tbh-gold)]/45 bg-black/40 ${compatto ? "p-3" : "p-4"}`}
    >
      <p className="text-[11px] font-bold uppercase leading-snug tracking-wide text-[var(--tbh-gold)]">
        SEI NEL CIRCUITO TBH?
        <br />
        RICHIEDI I TUOI VANTAGGI PRIMA DI PAGARE
      </p>
      <a
        href={waVantaggiTbh(titolo, codice, priceCents)}
        target="_blank"
        rel="noreferrer"
        className="mt-2 inline-flex items-center gap-2 rounded-full border border-[var(--tbh-gold)] px-4 py-2 text-xs font-bold uppercase tracking-wide text-[var(--tbh-gold)] transition hover:bg-[var(--tbh-gold)] hover:text-black"
      >
        <Sparkles size={14} /> Richiedi vantaggi TBH
      </a>
    </div>
  );
}

/** Box fisso della scheda articolo, PRIMA del pulsante «Acquista ora» (punto 7). */
export function BoxVantaggiCircuito({
  titolo,
  codice,
  priceCents,
}: {
  titolo: string;
  codice: string;
  priceCents: number;
}) {
  return (
    <section
      data-box-vantaggi-circuito
      className="mt-6 rounded-2xl border border-[var(--tbh-gold)]/60 bg-black/50 p-4 md:p-5"
    >
      <h2 className="tbh-display text-lg uppercase tracking-wide text-[var(--tbh-gold)]">
        VANTAGGI CIRCUITO TBH
      </h2>
      <p className="mt-2 text-sm text-[var(--tbh-muted)]">
        Se appartieni al Circuito TBH, prima di completare l&apos;acquisto verifica eventuali{" "}
        <strong className="text-white">
          sconti personalizzati, codici dedicati, condizioni riservate e cashback
        </strong>
        . Quando previsto, alcuni vantaggi possono essere cumulati con la promozione pubblica
        corrente.
      </p>
      <a
        href={waVantaggiTbh(titolo, codice, priceCents)}
        target="_blank"
        rel="noreferrer"
        className="mt-4 inline-flex items-center gap-2 rounded-full bg-[var(--tbh-gold)] px-5 py-3 text-sm font-bold uppercase tracking-wide text-black transition hover:brightness-110"
      >
        <MessageCircle size={17} /> Richiedi il tuo vantaggio TBH
      </a>
      <p className="mt-3 text-[11px] text-[var(--tbh-muted)]">
        Il vantaggio TBH non si applica in automatico: si richiede, TBH lo verifica e te lo
        conferma prima del pagamento.{" "}
        <Link href={PAGINA_PREZZI_PROMO} className="font-semibold text-[var(--tbh-neon)]">
          Come funziona
        </Link>
      </p>
    </section>
  );
}

function dataIt(iso: string) {
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

/**
 * Le righe di prezzo della scheda (punti 1, 2, 6). Promo e risparmio compaiono SOLO se una
 * promo è davvero configurata e in corso; il cashback è una riga a parte, mai uno sconto.
 */
export function PrezzoDettaglio({ p }: { p: ConPrezzo }) {
  const promo = promoAttiva(p);
  const risparmio = promo ? p.priceCents - promo.prezzoPromoCents : 0;
  const scontoTesto = promo
    ? [
        promo.scontoPercentuale != null ? `-${promo.scontoPercentuale}%` : null,
        promo.scontoCents != null ? `-${euro(promo.scontoCents)}` : null,
      ]
        .filter(Boolean)
        .join(" / ")
    : "";
  const iva =
    p.ivaPercentuale != null
      ? `IVA ${p.ivaPercentuale}%${p.prezzoIvaInclusa === true ? " inclusa" : p.prezzoIvaInclusa === false ? " esclusa" : ""}`
      : null;

  return (
    <dl data-prezzo-dettaglio className="mt-6 grid gap-1.5 text-sm">
      <div className="flex flex-wrap items-baseline gap-x-2">
        <dt className="text-[var(--tbh-muted)]">Prezzo di listino:</dt>
        <dd
          className={`tbh-display ${promo ? "text-xl text-white/60 line-through" : "text-4xl text-[var(--tbh-neon)]"}`}
        >
          {euro(p.priceCents)}
        </dd>
        {p.notaPrezzo && (
          <dd data-nota-prezzo className="text-sm font-bold text-white">
            {p.notaPrezzo}
          </dd>
        )}
        {iva && <dd className="text-[11px] text-[var(--tbh-muted)]">{iva}</dd>}
      </div>
      {promo && (
        <>
          <div className="flex flex-wrap items-baseline gap-x-2">
            <dt className="text-[var(--tbh-muted)]">Promo attiva:</dt>
            <dd className="font-bold text-[var(--tbh-gold)]">
              {promo.tipo}
              {scontoTesto && ` ${scontoTesto}`}
            </dd>
          </div>
          <div className="flex flex-wrap items-baseline gap-x-2">
            <dt className="text-[var(--tbh-muted)]">Prezzo promozionale:</dt>
            <dd className="tbh-display text-4xl text-[var(--tbh-neon)]">{euro(promo.prezzoPromoCents)}</dd>
            {p.notaPrezzo && <dd className="text-sm font-bold text-white">{p.notaPrezzo}</dd>}
          </div>
          <div className="flex flex-wrap items-baseline gap-x-2">
            <dt className="text-[var(--tbh-muted)]">Risparmio:</dt>
            <dd className="font-bold">{euro(risparmio)}</dd>
          </div>
          {promo.fine && (
            <div className="flex flex-wrap items-baseline gap-x-2">
              <dt className="text-[var(--tbh-muted)]">Scadenza promo:</dt>
              <dd>{dataIt(promo.fine)}</dd>
            </div>
          )}
          <div className="flex flex-wrap items-baseline gap-x-2">
            <dt className="text-[var(--tbh-muted)]">Cumulabile con vantaggi TBH:</dt>
            <dd className="font-bold">{promo.cumulabileTbh ? "SÌ" : "NO"}</dd>
          </div>
          {promo.codiceRichiesto && (
            <div className="flex flex-wrap items-baseline gap-x-2">
              <dt className="text-[var(--tbh-muted)]">Codice promo:</dt>
              <dd>richiesto</dd>
            </div>
          )}
          {promo.condizioni && <p className="text-[11px] text-[var(--tbh-muted)]">{promo.condizioni}</p>}
        </>
      )}
      <div className="flex flex-wrap items-baseline gap-x-2">
        <dt className="text-[var(--tbh-muted)]">Cashback disponibile:</dt>
        <dd className="font-bold">{p.cashbackTbh === true ? "SÌ" : "NO"}</dd>
      </div>
      {p.cashbackTbh === true && (
        <p className="text-[11px] font-semibold text-[var(--tbh-gold)]">
          Cashback riservato Circuito TBH – richiedilo dopo/secondo le modalità previste per
          l&apos;acquisto.
        </p>
      )}
      {p.condizioni && <p className="text-[11px] text-[var(--tbh-muted)]">{p.condizioni}</p>}
    </dl>
  );
}

const COLORE_ETICHETTA: Partial<Record<EtichettaShop, string>> = {
  "PREZZO PIENO": "var(--tbh-muted)",
  "VANTAGGI TBH": "var(--tbh-gold)",
  "CASHBACK TBH": "var(--tbh-gold)",
};

/** Etichette del negozio (punto 9): solo quelle la cui condizione è attiva adesso. */
export function EtichetteShop({ p, className = "" }: { p: ConPrezzo; className?: string }) {
  const tutte = etichetteAttive(p);
  if (!tutte.length) return null;
  return (
    <ul data-etichette-shop className={`flex flex-wrap gap-1.5 ${className}`}>
      {tutte.map((e) => (
        <li
          key={e}
          className="rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide"
          style={{
            borderColor: COLORE_ETICHETTA[e] ?? "var(--tbh-neon)",
            color: COLORE_ETICHETTA[e] ?? "var(--tbh-neon)",
          }}
        >
          {e}
        </li>
      ))}
    </ul>
  );
}
