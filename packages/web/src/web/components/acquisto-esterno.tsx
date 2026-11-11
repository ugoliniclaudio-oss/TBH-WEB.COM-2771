import { ExternalLink, MessageCircle, ShieldAlert, ShoppingBag } from "lucide-react";
import { linkCheckoutSalvati } from "./checkout-url";
import { wa } from "../lib/whatsapp";
import type { ProdottoEsterno, TipoAcquisto } from "../lib/esterni";
import { slotProdottoEsterno } from "../lib/esterni";
import { Copertina, type UsoImmagine, type useCopertine } from "./immagine-tbh";

/* ══════════════════════════════════════════════════════════════════════════════
   TIPO ACQUISTO DEI PRODOTTI ESTERNI — Priorità 2bis, punto l).

   «Per un prodotto di un venditore terzo servono: URL IMMAGINE UFFICIALE · URL PRODOTTO ·
    VENDITORE · TIPO ACQUISTO (Checkout TBH / Sito del venditore / WhatsApp).
    I pulsanti di pagamento appaiono solo quando hanno un URL valido.»

   Questo è l'unico posto dove si decide quale pulsante compare: lo dice il dato del prodotto,
   non la grafica della pagina. Negozio e area Fashion mostrano gli stessi articoli e ora usano
   lo stesso pulsante, così non possono più raccontare due cose diverse sullo stesso prodotto.

   Che cosa NON fa: non inventa un pagamento che non esiste. Se il tipo è «Checkout TBH» ma
   nessun link di pagamento valido è stato inserito nel pannello, non compare nessun pulsante
   di pagamento: compare la riga che dice che manca, e resta il link alla scheda del venditore.
   ══════════════════════════════════════════════════════════════════════════════ */

/** Come si chiama, in italiano, ognuno dei tre modi. Usato anche nel pannello. */
export const ETICHETTE_ACQUISTO: Record<TipoAcquisto, string> = {
  "checkout-tbh": "Checkout TBH",
  "sito-venditore": "Sito del venditore",
  whatsapp: "WhatsApp",
};

/** Una riga di spiegazione per ogni modo: chi incassa e dove si conclude l'ordine. */
export const SPIEGA_ACQUISTO: Record<TipoAcquisto, string> = {
  "checkout-tbh": "Si paga da noi: l'ordine si chiude sul nostro link di pagamento.",
  "sito-venditore": "L'ordine e l'incasso restano al venditore: il pulsante apre la sua scheda.",
  whatsapp: "Si ordina su WhatsApp: il messaggio è già scritto con nome e prezzo.",
};

export function etichettaAcquisto(t: TipoAcquisto) {
  return ETICHETTE_ACQUISTO[t];
}

/**
 * LA FOTO DI UN PRODOTTO ESTERNO — un posto solo, per tutte le pagine che lo mostrano.
 *
 * Prima il negozio mostrava la foto e l'area Fashion no: lo stesso articolo appariva
 * allestito in una pagina e muto nell'altra. Ora la foto la decide il prodotto:
 *  1. l'immagine caricata dal pannello sul suo spazio (`prodotto-esterno:<slug>`);
 *  2. altrimenti l'`URL IMMAGINE UFFICIALE` del venditore, se è stato salvato nel dato
 *     (punto l: «per un negozio esterno si usano sempre immagini e link ufficiali del
 *     venditore»);
 *  3. altrimenti la scritta che dice che la foto del prodotto va ancora caricata.
 * Nessuna immagine inventata, nessuna copia della stessa foto per misure diverse.
 *
 * `copertine` arriva da `useCopertine("prodotto-esterno:")`: la griglia fa UNA chiamata
 * sola e poi ogni card pesca la sua, invece di una chiamata per articolo.
 */
export function FotoProdottoEsterno({
  prodotto,
  copertine,
  uso = "card",
  className = "",
}: {
  prodotto: ProdottoEsterno;
  copertine: ReturnType<typeof useCopertine>;
  uso?: UsoImmagine;
  className?: string;
}) {
  const caricata = copertine.trova(slotProdottoEsterno(prodotto.url), "prodotto");
  const ufficiale = prodotto.urlImmagine?.trim();
  const item =
    caricata ??
    (ufficiale ? { url: ufficiale, tipo: "prodotto", titolo: prodotto.nome } : undefined);

  return (
    <Copertina
      item={item}
      tipo="prodotto"
      uso={uso}
      alt={prodotto.nome}
      nota={prodotto.nome}
      className={className}
    />
  );
}

/**
 * Il pulsante (o i pulsanti) con cui si compra davvero un prodotto di un venditore terzo.
 *
 * `prodotto` porta con sé tutto quello che serve: URL PRODOTTO, VENDITORE e TIPO ACQUISTO.
 * La chiave dei link di pagamento è la stessa che identifica la sua foto — così un articolo
 * ha un solo spazio in tutto il portale, per l'immagine e per il pagamento.
 */
export function AcquistoEsterno({
  prodotto,
  className = "",
}: {
  prodotto: ProdottoEsterno;
  className?: string;
}) {
  const { nome, prezzo, url, venditore, tipoAcquisto } = prodotto;

  if (tipoAcquisto === "whatsapp") {
    return (
      <div className={`flex flex-col gap-2 ${className}`}>
        <a
          href={wa(`Buongiorno, vorrei ordinare ${nome} (${venditore}) — prezzo ${prezzo}.`)}
          target="_blank"
          rel="noreferrer"
          className="px-4 py-2 rounded-full text-sm font-semibold inline-flex items-center justify-center gap-2 bg-[#25d366] text-black"
        >
          <MessageCircle size={15} /> Ordina su WhatsApp
        </a>
        <a
          href={url}
          target="_blank"
          rel="noreferrer"
          className="text-[11px] text-[var(--tbh-muted)] inline-flex items-center gap-1 hover:text-white"
        >
          <ExternalLink size={12} /> Scheda del prodotto su {venditore}
        </a>
      </div>
    );
  }

  if (tipoAcquisto === "checkout-tbh") {
    const pagamenti = linkCheckoutSalvati(slotProdottoEsterno(url));
    return (
      <div className={`flex flex-col gap-2 ${className}`}>
        {pagamenti.length > 0 ? (
          pagamenti.map(({ fornitore, url: pay }) => (
            <a
              key={fornitore.id}
              href={pay}
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2 rounded-full text-sm font-semibold inline-flex items-center justify-center gap-2 text-black"
              style={{ background: fornitore.colore }}
            >
              <ShoppingBag size={15} /> {fornitore.cta}
            </a>
          ))
        ) : (
          /* Nessun link valido: si dice, non si finge un pulsante che porta nel vuoto. */
          <p className="text-[11px] text-[var(--tbh-gold)] inline-flex items-start gap-1.5">
            <ShieldAlert size={13} className="mt-0.5 shrink-0" />
            Link di pagamento da inserire nel pannello: fino ad allora si compra dal venditore.
          </p>
        )}
        <a
          href={url}
          target="_blank"
          rel="noreferrer"
          className="text-[11px] text-[var(--tbh-muted)] inline-flex items-center gap-1 hover:text-white"
        >
          <ExternalLink size={12} /> Scheda del prodotto su {venditore}
        </a>
      </div>
    );
  }

  /* Sito del venditore — il caso dei marchi che presentiamo senza venderli. */
  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      className={`tbh-neon-btn px-4 py-2 text-sm inline-flex items-center justify-center gap-2 ${className}`}
    >
      <ShoppingBag size={15} /> Acquista sul sito di {venditore}
    </a>
  );
}
