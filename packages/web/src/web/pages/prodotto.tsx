import { QrLink } from "../components/qr-link";
import { useState } from "react";
import { Link } from "wouter";
import { ArrowLeft, MessageCircle, CreditCard } from "lucide-react";
import { useProduct } from "../queries/catalog";
import { euro } from "../components/tiles";
import { SlotMedia } from "../components/media-slot";
import { CopertinaTBH } from "../components/immagine-tbh";
import { CheckoutSlots } from "../components/checkout-url";
import { BolloProdottoUfficiale } from "../components/sigillo-prodotti";
import { waOrdine, waFinanziamento, waInfo } from "../lib/whatsapp";
import {
  BannerPrezziPromo,
  BoxVantaggiCircuito,
  EtichetteShop,
  PrezzoDettaglio,
} from "../components/prezzi-promo-tbh";
import { prezzoPubblicoCents } from "../../api/data/prezzi-tbh";
import { AcquistoStripe, StatoArticoloStripe } from "../components/acquisto-stripe";

/**
 * FASE 3 — Pagina singola PRODOTTO (brief punto 07).
 * Nessun prezzo, sconto o dato tecnico inventato: si pubblica solo ciò che è a listino.
 * Il prezzo Circuito compare soltanto quando esiste realmente (oggi non è fornito).
 */
export default function ProdottoPage({ slug }: { slug: string }) {
  const q = useProduct(slug);
  const dati = q.data;
  // Variante scelta (articoli Stripe con più prezzi): la prima finché non se ne sceglie un'altra.
  const [priceId, setPriceId] = useState<string | null>(null);
  const esito = new URLSearchParams(window.location.search).get("pagamento");

  if (q.isLoading)
    return (
      <div className="mx-auto max-w-[1500px] px-4 md:px-8 py-16">
        <div className="tbh-card h-96 animate-pulse" />
      </div>
    );

  if (!dati)
    return (
      <div className="mx-auto max-w-[1500px] px-4 md:px-8 py-16">
        <h1 className="tbh-display tbh-h1">Prodotto non trovato</h1>
        <p className="text-[var(--tbh-muted)] mt-3">
          Questo prodotto non è a listino. Nessuna scheda inventata: torna al Touch Plaza.
        </p>
        <Link to="/shop" className="tbh-neon-btn px-6 py-3 mt-6 inline-flex items-center gap-2">
          <ArrowLeft size={18} /> Torna al Touch Plaza
        </Link>
      </div>
    );

  /* 03/10/2026 — SINCRONIZZAZIONE STRIPE: prezzo e pagamento della variante scelta. */
  const info = dati.stripe ?? null;
  const variante = info ? (info.varianti.find((v) => v.priceId === priceId) ?? info.varianti[0] ?? null) : null;
  const p =
    variante && variante.importoCents !== null ? { ...dati, priceCents: variante.importoCents } : dati;
  const inEuro = !variante || variante.valuta.toLowerCase() === "eur";
  // In allestimento o ritirato: nessun pulsante di acquisto, da nessuna parte.
  const acquistoSpento = !!info && info.stato !== "pubblicato";

  const codice = p.slug.toUpperCase();
  // Prezzo che paga chiunque oggi: promo pubblica attiva e configurata, altrimenti listino.
  const prezzoOggi = prezzoPubblicoCents(p);

  /* 30/09/2026 — un articolo a 0 € non si «acquista»: si PRENOTA. Il link del fornitore
     è lo stesso, ma tutte le scritte attorno cambiano, altrimenti il corso antincendio
     gratuito si presenta al cliente come se dovesse pagare qualcosa. */
  const gratuito = p.priceCents === 0;

  /* 30/09/2026 — i link di pagamento ufficiali che Claudio ci ha consegnato stanno in
     archivio (campo `checkout` del listino): quando ci sono, il pulsante di acquisto è
     PUBBLICO per tutti i visitatori e non serve più incollare niente. */
  const ufficiali = p.checkout ?? {};
  const pagamentiLive = (
    [
      ["stripe", "Stripe", "#a78bfa"],
      ["revolut", "Revolut", "#6a6aff"],
      ["paypal", "PayPal", "#00a4e0"],
      ["jatapay", "JataPay", "#33e0ff"],
      ["johix", "Johix", "#ff8a00"],
    ] as const
  )
    .map(([id, nome, colore]) => ({ id, nome, colore, url: ufficiali[id] }))
    .filter((x): x is typeof x & { url: string } =>
      typeof x.url === "string" && x.url.length > 0,
    )
    // Il pagamento Stripe di un articolo sincronizzato passa dal blocco «Acquista».
    .filter((x) => !(info && x.id === "stripe"))
    .filter(() => !acquistoSpento);

  /* La lista «da ricevere» non deve mentire al contrario: se un dato è arrivato, sparisce. */
  const mancanti = [
    !p.image && "Fotografie reali del prodotto",
    !p.vantaggi?.length && "Scheda tecnica completa",
    "Tempi di consegna / erogazione",
  ].filter((x): x is string => typeof x === "string");

  return (
    <div className="mx-auto max-w-[1500px] px-4 md:px-8 py-10">
      <Link to="/shop" className="text-sm text-[var(--tbh-muted)] inline-flex items-center gap-2">
        <ArrowLeft size={16} /> Touch Plaza
      </Link>

      <div className="grid gap-8 lg:grid-cols-[1fr_1fr] mt-5">
        <div className="tbh-card p-5">
          {/* Riquadro grande della scheda (Priorità 2bis): la stessa foto caricata una
              volta sola serve card, scheda e telefono. Se manca, il riquadro tiene la
              misura e dice che serve una foto — non un logo: un kit non ha un logo. */}
          <CopertinaTBH
            slot={`prodotto:${p.slug}`}
            tipo="prodotto"
            // Stessa misura standard delle anteprime del negozio (4:3): la slide ufficiale
            // dell'articolo ci sta dentro intera, senza bande nere come nel 16:9.
            uso="articolo"
            alt={p.title}
            nota={p.title}
            ripiego={p.image}
          />
          <p className="text-[11px] text-[var(--tbh-muted)] mt-3">
            {p.image
              ? info?.origine === "stripe"
                ? "Immagine dell'articolo, così come è su Stripe."
                : "Immagine ufficiale del listino."
              : "Fotografia reale del prodotto da ricevere."}
          </p>
          {p.galleria && p.galleria.length > 0 && (
            <ul className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-4">
              {p.galleria.map((src) => (
                <li key={src}>
                  <a href={src} target="_blank" rel="noreferrer" className="block">
                    <img
                      src={src}
                      alt={`${p.title} — immagine`}
                      loading="lazy"
                      className="aspect-square w-full rounded-xl border border-[var(--tbh-line)] object-cover"
                    />
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="tbh-card p-6 md:p-8">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-[11px] tracking-[0.2em] uppercase text-[var(--tbh-gold)]">
              {p.category}
            </span>
            {/* Sigillo del 30/09/2026: gli articoli del listino sono articoli TBH,
                quindi il bollo ci sta. Sui prodotti esterni esposti nel Circuito
                non compare: quelli restano originali dei loro titolari. */}
            <BolloProdottoUfficiale />
            {info && <StatoArticoloStripe stato={info.stato} />}
          </div>
          <h1 className="tbh-display tbh-h1 mt-2">{p.title}</h1>
          <p className="tbh-body text-[var(--tbh-muted)] mt-4">{p.blurb}</p>

          {/* Regole shop del 03/10/2026: listino, promo (solo se configurata), cashback a parte. */}
          {esito === "ok" && (
            <p className="mt-4 rounded-xl border border-[var(--tbh-neon)]/50 bg-[var(--tbh-neon)]/10 p-3 text-sm">
              Pagamento inviato a Stripe. L'ordine è confermato quando Stripe registra l'incasso:
              la ricevuta arriva all'indirizzo e-mail indicato nel pagamento.
            </p>
          )}
          {esito === "annullato" && (
            <p className="mt-4 rounded-xl border border-[var(--tbh-line)] p-3 text-sm text-[var(--tbh-muted)]">
              Pagamento annullato: nessun addebito.
            </p>
          )}
          {!(info && !info.varianti.length) && (
            <>
              <EtichetteShop p={p} className="mt-4" />
              {inEuro && <PrezzoDettaglio p={p} />}
            </>
          )}
          <div className="mt-2">
            <div className="text-xs text-[var(--tbh-muted)] mt-1">
              Codice {codice}
              {p.installments && " · rateizzabile su richiesta"}
            </div>
            {p.incluso && (
              <p className="mt-2 text-sm font-semibold text-[var(--tbh-gold)]">{p.incluso}</p>
            )}
          </div>

          {/* I vantaggi confermati sulla scheda ufficiale, come pulsanti leggibili. */}
          {p.vantaggi && p.vantaggi.length > 0 && (
            <ul className="mt-5 flex flex-wrap gap-2">
              {p.vantaggi.map((v) => (
                <li
                  key={v}
                  className="rounded-full border border-[var(--tbh-neon)]/40 bg-black/40 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wide text-[var(--tbh-neon)]"
                >
                  {v}
                </li>
              ))}
            </ul>
          )}

          {/* Condizioni dell'articolo: solo quelle confermate (slide ufficiale o pannello). */}
          {p.condizioniElenco && p.condizioniElenco.length > 0 && (
            <div className="mt-5 rounded-2xl border border-[var(--tbh-gold)]/40 p-4">
              <h2 className="text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--tbh-gold)]">
                Condizioni
              </h2>
              <ul className="mt-2 space-y-1 text-sm text-[var(--tbh-muted)]">
                {p.condizioniElenco.map((c) => (
                  <li key={c}>· {c}</li>
                ))}
              </ul>
            </div>
          )}

          {/* BOX FISSO «VANTAGGI CIRCUITO TBH» — PRIMA di «Acquista ora» (punto 7). */}
          <BoxVantaggiCircuito titolo={p.title} codice={codice} priceCents={prezzoOggi} />

          {/* ACQUISTA — articolo collegato a Stripe: variante → suo pagamento. */}
          {info && (
            <AcquistoStripe slug={p.slug} info={info} scelta={variante} onScelta={setPriceId} />
          )}

          {/* PAGAMENTO LIVE — pulsante pubblico, un fornitore per ogni link in archivio. */}
          {pagamentiLive.length > 0 && (
            <div className="mt-6 rounded-2xl border border-[var(--tbh-neon)]/45 bg-black/40 p-4">
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--tbh-gold)]">
                {gratuito ? "Prenotazione attiva" : "Pagamento attivo"}
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-3">
                {pagamentiLive.map((f) => (
                  <a
                    key={f.id}
                    href={f.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-bold uppercase tracking-wide text-black transition hover:brightness-110"
                    style={{ background: f.colore }}
                  >
                    <CreditCard size={17} /> {gratuito ? "Prenota ora" : "Acquista ora"} ·{" "}
                    {f.nome}
                  </a>
                ))}
              </div>
              <p className="mt-3 text-[11px] text-[var(--tbh-muted)]">
                {gratuito
                  ? "Link ufficiale di prenotazione, già in archivio: il pulsante è pubblico per tutti. Il corso è a 0 €, la pagina sicura del fornitore serve a registrare e confermare il posto."
                  : "Link di pagamento ufficiale, già in archivio: il pulsante è pubblico per tutti i clienti. Il pagamento si apre sulla pagina sicura del fornitore."}
              </p>
              {!p.qr && p.qrDalVivo && p.checkout?.stripe && (
                <div className="mt-4 flex items-center gap-4" data-testid="qr-dal-vivo">
                  <QrLink url={p.checkout.stripe} etichetta={`QR per pagare ${p.title}`} />
                  <div className="min-w-0">
                    <p className="tbh-display text-base leading-tight">Scansiona per pagare</p>
                    <p className="mt-1 text-[11px] text-[var(--tbh-muted)]">
                      QR dello stesso link di pagamento Stripe ufficiale: inquadralo col telefono, oppure usa il pulsante qui sopra.
                    </p>
                  </div>
                </div>
              )}
              {p.qr && (
                <div className="mt-4 flex items-center gap-4">
                  <img
                    src={p.qr}
                    alt={`QR ufficiale per ${gratuito ? "prenotare" : "pagare"} ${p.title}`}
                    width={132}
                    height={132}
                    loading="lazy"
                    className="h-[132px] w-[132px] shrink-0 rounded-2xl object-contain"
                  />
                  <div className="min-w-0">
                    <p className="tbh-display text-base leading-tight">
                      {gratuito ? "Scansiona per prenotare" : "Scansiona per pagare"}
                    </p>
                    <p className="mt-1 text-[11px] text-[var(--tbh-muted)]">
                      QR ufficiale dello stesso {gratuito ? "modulo" : "checkout"}: inquadralo col
                      telefono, oppure usa il pulsante qui sopra.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="flex flex-wrap gap-3 mt-6">
            {!acquistoSpento && (
            <a
              href={waOrdine(p.title, codice, prezzoOggi)}
              target="_blank"
              rel="noreferrer"
              className="tbh-neon-btn px-5 py-3 inline-flex items-center gap-2"
            >
              <MessageCircle size={18} />{" "}
              {p.priceCents === 0 ? "Prenota su WhatsApp" : "Ordina su WhatsApp"}
            </a>
            )}
            {p.installments && (
              <a
                href={waFinanziamento(p.title, codice, prezzoOggi)}
                target="_blank"
                rel="noreferrer"
                className="px-5 py-3 rounded-full border border-[var(--tbh-line)] font-semibold text-[var(--tbh-gold)] hover:border-[var(--tbh-gold)] inline-flex items-center gap-2"
              >
                <CreditCard size={18} /> Richiedi rateizzazione
              </a>
            )}
            {p.priceCents > 0 && (
              <Link
                to="/pagamenti"
                className="px-5 py-3 rounded-full border border-[var(--tbh-line)] font-semibold hover:border-[var(--tbh-neon)]"
              >
                Metodi di pagamento
              </Link>
            )}
            {p.scheda && (
              <Link
                to={p.scheda}
                className="px-5 py-3 rounded-full border border-[var(--tbh-line)] font-semibold hover:border-[var(--tbh-neon)]"
              >
                Scheda completa
              </Link>
            )}
          </div>

          <div className="rounded-2xl border border-[var(--tbh-line)] p-4 mt-7">
            <h2 className="tbh-display text-lg">Dati ancora da ricevere</h2>
            <ul className="text-sm text-[var(--tbh-muted)] mt-2 space-y-1">
              {mancanti.map((m) => (
                <li key={m}>· {m} — da ricevere</li>
              ))}
            </ul>
            <p className="text-[11px] text-[var(--tbh-muted)] mt-3">
              Non pubblichiamo caratteristiche, scadenze o sconti non confermati.
            </p>
          </div>

          <a
            href={waInfo(p.title)}
            target="_blank"
            rel="noreferrer"
            className="text-sm font-semibold text-[var(--tbh-neon)] mt-5 inline-block"
          >
            Chiedi informazioni su questo prodotto
          </a>
        </div>
      </div>

      {/* Promemoria del regolamento Touch Plaza: grafica ufficiale, apre la pagina. */}
      <div className="mt-8 mx-auto max-w-4xl">
        <BannerPrezziPromo />
      </div>

      {/* LA BARRA DEL CHECKOUT — 30/09/2026.
          Ordine di Claudio: «non solo un pulsante in più: voglio proprio una barra
          dove posso incollare il link checkout corrente, che sia Stripe, Revolut,
          PayPal, o ultimamente JataPay o Johix». Per questo il blocco è stato
          portato SUBITO SOTTO la scheda, prima degli slot media, e non è più
          riservato ai prodotti con prezzo: vale per ogni articolo, anche quelli
          da prenotare. */}
      <div className="mt-8">
        <CheckoutSlots
          chiave={p.slug}
          titolo={`Checkout di ${p.title}`}
          ufficiali={ufficiali}
          argomento={
            p.priceCents > 0
              ? `${p.title} — codice ${codice} — ${euro(p.priceCents)}`
              : `${p.title} — codice ${codice} — prezzo su richiesta`
          }
        />
      </div>

      <SlotMedia
        slot={`prodotto:${p.slug}`}
        titolo={`Immagini e listino di ${p.title}`}
        descrizione="Foto reali del prodotto, slide del listino, logo della società che lo eroga."
        tipoIniziale="immagine"
      />
    </div>
  );
}
