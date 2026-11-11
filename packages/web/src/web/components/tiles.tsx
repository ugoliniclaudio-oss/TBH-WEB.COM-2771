import { CreditCard, Loader2, MessageCircle } from "lucide-react";
import { Link } from "wouter";
import { waFinanziamento, waOrdine } from "../lib/whatsapp";
import { LogoBox as LogoBoxGlobale } from "./logo-box";
import { ContentCard } from "./content-card";
import { Copertina, materialeDaListino, type MaterialeVisuale } from "./immagine-tbh";
import { FasciaAppartenenza } from "./anteprima-pulsante";
import { TOUCH_PLAZA, type Appartenenza } from "../lib/appartenenza";
import { euro } from "../lib/euro";
import { EtichetteShop, RichiediVantaggiTbh } from "./prezzi-promo-tbh";
import { promoAttiva, type CampiCommerciali } from "../../api/data/prezzi-tbh";
import { importoVariante, type InfoStripe } from "../../api/data/stripe-catalogo";

export { euro };

/**
 * LogoBox — ADATTATORE sul componente globale `components/logo-box.tsx`.
 *
 * Aggiornamento del 17/09/2026, punto 5: «componenti globali unici, vietato creare
 * card diverse manualmente per singole pagine». L'implementazione vera (contain,
 * centratura, area di rispetto del 10%, varianti automatiche dal master, ripiego col
 * nome per esteso) sta in UN SOLO file. Questa firma resta in piedi perché è quella
 * che usano le pagine già scritte: cambiando il file globale cambiano tutte insieme.
 *
 * `size` non è più un'altezza scritta a mano: sceglie il FORMATO dichiarato in
 * api/data/formati-logo.ts, e l'altezza della griglia resta quella di prima.
 */
export function LogoBox({
  name,
  logo,
  size = "md",
  url,
  ctaLabel,
  dentroLink = false,
}: {
  name: string | null | undefined;
  logo: string | null | undefined;
  size?: "md" | "lg";
  /** Sito ufficiale o URL della realtà, se conosciuto. */
  url?: string | null;
  ctaLabel?: string;
  dentroLink?: boolean;
}) {
  return (
    <LogoBoxGlobale
      nome={typeof name === "string" && name.trim() ? name.trim() : "Touch Business Holding"}
      logo={logo ?? null}
      formato={size === "lg" ? "hero" : "scheda-attivita"}
      altezzaClasse={size === "lg" ? "h-40 md:h-48" : "h-28 md:h-32"}
      fondo="chiaro"
      url={url ?? null}
      etichettaCta={ctaLabel}
      dentroLink={dentroLink}
    />
  );
}

/**
 * ProductCard — la card di un PRODOTTO. Unica implementazione, come ContentCard:
 * usa la stessa LogoBox globale e aggiunge i campi che una card generica non ha
 * (prezzo, rate, pulsante di acquisto). Eccezione dichiarata al punto 5 e annotata
 * nell'elenco dei componenti globali in components/content-card.tsx: le pagine la
 * usano così com'è, non ne riscrivono una propria.
 */
export function ProductCard({
  title,
  category,
  priceCents,
  blurb,
  image,
  installments,
  slug,
  copertina,
  cardActive = false,
  checkoutUfficiale = null,
  onBuy,
  pending,
  stripe = null,
  ...commerciali
}: CampiCommerciali & {
  title: string;
  category: string;
  priceCents: number;
  blurb: string;
  image: string | null;
  installments: boolean;
  /** Slug del prodotto: quando c'è, logo e titolo aprono la scheda interna /shop/p/:slug. */
  slug?: string;
  /**
   * FOTO DEL PRODOTTO (29/09/2026, Priorità 2bis). La passa la pagina, che le prende tutte
   * con una sola chiamata (`useCopertine("prodotto:")`). Quando manca compare la scritta
   * giusta — «Foto del prodotto da caricare» — e non più «Logo ufficiale da ricevere»:
   * ordine di Claudio, «un kit beauty o un corso non hanno un logo, hanno una foto».
   */
  copertina?: MaterialeVisuale | null;
  /** true quando Stripe è collegato: mostra anche "Acquista" con carta. */
  cardActive?: boolean;
  /**
   * 30/09/2026 — link di pagamento UFFICIALE già in archivio per questo articolo.
   * Quando c'è, la card mostra «Acquista ora» pubblico per tutti, senza passare dalla scheda.
   */
  checkoutUfficiale?: string | null;
  onBuy: () => void;
  pending: boolean;
  /**
   * 03/10/2026 — articolo collegato a Stripe. In allestimento = niente pulsanti di acquisto;
   * più prezzi = «da …» e si sceglie la variante nella scheda.
   */
  stripe?: InfoStripe | null;
}) {
  const codice = (slug ?? "").toUpperCase();
  const inAllestimento = !!stripe && stripe.stato !== "pubblicato";
  const piuVarianti = (stripe?.varianti.length ?? 0) > 1;
  // Un articolo Stripe senza link diretto paga dalla scheda (Checkout Session del server).
  const acquistoInScheda = !!stripe && !inAllestimento && !checkoutUfficiale && !!slug;
  const promo = promoAttiva({ ...commerciali, priceCents });
  const prezzoOggi = promo?.prezzoPromoCents ?? priceCents;
  // L'immagine del listino, se c'è, vale come foto del prodotto: stessa resa, un posto solo.
  // Passa da `materialeDaListino` perché quelle slide hanno dentro prezzo e vantaggi e non
  // vanno tagliate (30/09/2026): si vedono intere dentro la misura standard dell'anteprima.
  const foto: MaterialeVisuale | undefined =
    copertina ?? (image ? materialeDaListino(image, title) : undefined);
  // `uso="articolo"` = la misura unica delle anteprime del negozio (4:3), un terzo più alta
  // del 16:9 delle card generiche: più grande e uguale per tutti gli articoli.
  // A filo di card, arrotondata solo in alto: così l'anteprima guadagna tutta la larghezza
  // della card invece di perderne un pezzo nel margine (30/09/2026, «se sono piccoli aumenta»).
  const riquadro = (
    <Copertina
      item={foto}
      tipo="prodotto"
      uso="articolo"
      alt={title}
      nota={title}
      arrotonda="rounded-t-2xl"
    />
  );
  return (
    <article className="tbh-card overflow-hidden flex flex-col">
      {/* ANTEPRIMA → PULSANTE → SCHEDA: foto dell'articolo + appartenenza reale
          (circuito TBH Touch Plaza), tutta cliccabile verso la scheda /shop/p/:slug. */}
      {slug ? (
        <Link
          href={`/shop/p/${slug}`}
          data-anteprima-pulsante
          aria-label={`${title} — TBH Touch Plaza: apri la scheda`}
          className="group block transition hover:brightness-110"
        >
          {riquadro}
          <FasciaAppartenenza a={TOUCH_PLAZA} />
        </Link>
      ) : (
        <div>{riquadro}</div>
      )}
      <div className="p-5 flex flex-col gap-3 grow">
        <span className="text-[11px] tracking-[0.18em] text-[var(--tbh-gold)] uppercase">
          {category}
        </span>
        {slug ? (
          <Link href={`/shop/p/${slug}`} className="tbh-display tbh-h3 hover:text-[var(--tbh-neon)]">
            {title}
          </Link>
        ) : (
          <h3 className="tbh-display tbh-h3">{title}</h3>
        )}
        <p className="text-sm text-[var(--tbh-muted)] grow">{blurb}</p>
        {/* Etichette del negozio: solo quelle davvero attive (regole shop 03/10/2026). */}
        {!inAllestimento && <EtichetteShop p={{ ...commerciali, priceCents }} />}
        <div className="pt-2">
          {inAllestimento ? (
            <span className="inline-flex rounded-full border border-[var(--tbh-gold)]/60 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--tbh-gold)]">
              In allestimento
            </span>
          ) : promo ? (
            <>
              <div className="text-xs text-[var(--tbh-muted)]">
                Prezzo di listino: <span className="line-through">{euro(priceCents)}</span>
              </div>
              <div className="tbh-display text-3xl text-[var(--tbh-neon)]">
                {euro(promo.prezzoPromoCents)}
                {commerciali.notaPrezzo && (
                  <span className="ml-2 font-sans text-sm font-bold text-white">{commerciali.notaPrezzo}</span>
                )}
              </div>
            </>
          ) : (
            <div className="tbh-display text-3xl text-[var(--tbh-neon)]">
              {piuVarianti && <span className="mr-1 text-base text-[var(--tbh-muted)]">da</span>}
              {stripe?.varianti[0] ? importoVariante(stripe.varianti[0]) : euro(priceCents)}
              {commerciali.notaPrezzo && (
                <span data-nota-prezzo className="ml-2 font-sans text-sm font-bold text-white">
                  {commerciali.notaPrezzo}
                </span>
              )}
            </div>
          )}
          <div className="text-[11px] text-[var(--tbh-muted)]">
            {codice ? `Codice ${codice}` : "Codice da assegnare"}
            {installments && " · rateizzabile fino a 72 rate"}
          </div>
        </div>
        {/* Vicino al prezzo di OGNI articolo (punto 4): la richiesta dei vantaggi TBH. */}
        {!inAllestimento && (
          <RichiediVantaggiTbh titolo={title} codice={codice || title} priceCents={prezzoOggi} compatto />
        )}
        <div className="flex flex-wrap gap-2 pt-1">
          {inAllestimento && slug && (
            <Link
              href={`/shop/p/${slug}`}
              className="px-4 py-2.5 text-sm font-semibold rounded-full border border-[var(--tbh-line)] hover:border-[var(--tbh-neon)]"
            >
              Apri la scheda
            </Link>
          )}
          {acquistoInScheda && (
            <Link
              href={`/shop/p/${slug}`}
              className="flex items-center gap-2 rounded-full bg-[#a78bfa] px-4 py-2.5 text-sm font-bold uppercase tracking-wide text-black transition hover:brightness-110"
            >
              <CreditCard size={16} /> {piuVarianti ? "Scegli e acquista" : "Acquista ora"}
            </Link>
          )}
          {/* Pagamento ufficiale in archivio: primo pulsante, pubblico per tutti. */}
          {checkoutUfficiale && !inAllestimento && (
            <a
              href={checkoutUfficiale}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 rounded-full bg-[#a78bfa] px-4 py-2.5 text-sm font-bold uppercase tracking-wide text-black transition hover:brightness-110"
            >
              {/* Un articolo a 0 € non si acquista: si prenota (corso antincendio gratuito). */}
              <CreditCard size={16} /> {priceCents === 0 ? "Prenota ora" : "Acquista ora"}
            </a>
          )}
          {!inAllestimento && (
          <a
            href={waOrdine(title, codice, prezzoOggi)}
            target="_blank"
            rel="noreferrer"
            className="tbh-neon-btn px-4 py-2.5 text-sm flex items-center gap-2"
          >
            <MessageCircle size={16} />{" "}
            {priceCents === 0 ? "Prenota su WhatsApp" : "Ordina su WhatsApp"}
          </a>
          )}
          {cardActive && !stripe && (
            <button
              onClick={onBuy}
              disabled={pending}
              className="px-4 py-2.5 text-sm font-semibold rounded-full border border-[var(--tbh-line)] hover:border-[var(--tbh-neon)] disabled:opacity-60 flex items-center gap-2"
            >
              {pending && <Loader2 size={16} className="animate-spin" />}
              Acquista con carta
            </button>
          )}
          {installments && !inAllestimento && (
            <a
              href={waFinanziamento(title, codice, prezzoOggi)}
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2.5 text-sm font-semibold rounded-full border border-[var(--tbh-line)] hover:border-[var(--tbh-gold)] text-[var(--tbh-gold)]"
            >
              Richiedi finanziamento
            </a>
          )}
        </div>
      </div>
    </article>
  );
}

/**
 * LinkTile — ADATTATORE sulla card globale `components/content-card.tsx`.
 *
 * Aggiornamento del 17/09/2026, punto 5: una sola card per tutto il sito. La
 * firma resta questa perché è quella che usano le pagine già scritte (società,
 * attività, società seguite, rete): l'aspetto e le regole stanno in un solo
 * posto, quindi una correzione vale per tutte le pagine insieme.
 */
export function LinkTile({
  name,
  subtitle,
  logo,
  site,
  note,
  pagina,
  appartenenza,
  anteprima,
}: {
  name: string;
  subtitle: string;
  logo: string | null;
  site: string | null;
  note?: string;
  /** Pagina dedicata interna (la scheda specifica). */
  pagina?: string;
  /** Appartenenza reale: con `pagina` trasforma logo + fascia nell'anteprima-pulsante. */
  appartenenza?: Appartenenza | null;
  /** Grafica ufficiale «logo + appartenenza» già pronta. */
  anteprima?: string | null;
}) {
  return (
    <ContentCard
      nome={name}
      logo={logo}
      etichetta={subtitle}
      testo={note ?? null}
      pagina={pagina}
      appartenenza={appartenenza ?? null}
      anteprima={anteprima ?? null}
      sito={site}
      nota={site ? null : "Sito ufficiale non ancora comunicato."}
      pannello="/allestimento"
    />
  );
}
