import { useState } from "react";
import { AlertTriangle, CheckCircle2, MessageCircle, Tag } from "lucide-react";
import { Link } from "wouter";
import { ELENA_DI_CUORI_PRODOTTI, VERIFICATO_IL } from "../lib/esterni";
import { useProducts, useCheckoutStatus, useCreateCheckout } from "../queries/catalog";
import { ProductCard } from "../components/tiles";
import { useCopertine } from "../components/immagine-tbh";
import { PagamentiBlock } from "../components/pagamenti";
import { CheckoutSlots } from "../components/checkout-url";
import { SigilloProdottiUfficiali } from "../components/sigillo-prodotti";
import { LOGHI_CHANNEL } from "../../api/data/loghi-channel";
import { BannerPrezziPromo, IngressoPrezziPromo } from "../components/prezzi-promo-tbh";
import { etichetteAttive, type EtichettaShop } from "../../api/data/prezzi-tbh";
import { SlotContenuti } from "../components/slot-contenuti";
import { SezioneAmministrabile } from "../components/sezione-amministrabile";
import {
  AcquistoEsterno,
  FotoProdottoEsterno,
  etichettaAcquisto,
} from "../components/acquisto-esterno";

const WA = "https://wa.me/393792088524";

export default function ShopPage() {
  // ?categoria=… arriva dalla pagina «Prezzi, promo e vantaggi TBH» (scorciatoie categorie).
  const [category, setCategory] = useState(
    () => new URLSearchParams(window.location.search).get("categoria") || "Tutti",
  );
  // Filtro per etichetta (punto 9): compare solo se tra gli articoli ce n'è più d'una attiva.
  const [etichetta, setEtichetta] = useState<EtichettaShop | null>(null);
  const products = useProducts(category);
  // Le foto di TUTTI i prodotti con una sola chiamata (Priorità 2bis): la card non
  // interroga l'archivio da sé, riceve la sua immagine già pronta.
  const copertine = useCopertine("prodotto:");
  const copertineEsterne = useCopertine("prodotto-esterno:");
  const status = useCheckoutStatus();
  const checkout = useCreateCheckout();
  const [error, setError] = useState<string | null>(null);
  const [pendingSlug, setPendingSlug] = useState<string | null>(null);

  const params = new URLSearchParams(window.location.search);
  const paid = params.get("pagamento") === "ok";

  function buy(slug: string) {
    setError(null);
    setPendingSlug(slug);
    checkout.mutate(
      { slug, quantity: 1, origin: window.location.origin },
      {
        onSuccess: (res) => {
          window.location.href = res.url;
        },
        onError: (e: unknown) => {
          setPendingSlug(null);
          setError(e instanceof Error ? e.message : "Pagamento non disponibile.");
        },
      },
    );
  }

  const articoli = products.data?.items ?? [];
  const etichettePresenti = Array.from(new Set(articoli.flatMap((p) => etichetteAttive(p))));
  const visibili = etichetta ? articoli.filter((p) => etichetteAttive(p).includes(etichetta)) : articoli;

  return (
    <div className="mx-auto max-w-[1500px] px-4 md:px-8 py-10">
      <header className="tbh-rise mb-8">
        {/* Logo ORIGINALE del Channel Touch Plaza, approvato da Claudio il 19/10/2026:
            file intero, nessun ritaglio (loghi-channel.ts). */}
        <img
          src={LOGHI_CHANNEL["touch-plaza-shop"]!.src}
          alt="Logo Touch Plaza"
          className="mb-4 h-auto w-full max-w-[180px] md:max-w-[220px]"
          data-testid="logo-channel-touch-plaza-shop"
        />
        <p className="text-xs tracking-[0.25em] text-[var(--tbh-gold)] uppercase mb-2">
          Il centro commerciale digitale
        </p>
        <h1 className="tbh-display tbh-h1">Touch Plaza Shop</h1>
        <p className="tbh-body text-[var(--tbh-muted)] max-w-2xl mt-3">
          Prodotti, servizi, kit e corsi del gruppo Touch Business Holding. Prezzi reali,
          pagamento con carta tramite Stripe. Rateizzabile su richiesta.
        </p>
        <Link
          to="/gadget"
          data-link-gadget="1"
          className="mt-4 inline-flex w-fit items-center gap-2 rounded-xl border border-white/15 px-4 py-2 text-xs font-bold text-white transition hover:border-[var(--tbh-neon)]/60"
        >
          <Tag size={14} /> Prodotti e gadget personalizzabili — vetrina TBH
        </Link>
      </header>

      {/* 03/10/2026 — banner principale del Touch Plaza «PREZZI, PROMO E VANTAGGI TBH»:
          grafica ufficiale intera, cliccabile verso il regolamento. Sotto, l'ingresso
          «PREZZO PIENO, PROMO O VANTAGGIO TBH?» con i testi di Claudio. */}
      <div className="mb-6">
        <BannerPrezziPromo />
      </div>
      <IngressoPrezziPromo className="mb-8" />

      {/* Sigillo del negozio online (ordine di Claudio del 30/09/2026): qui è a
          casa sua, perché questo è il negozio ufficiale del marchio. */}
      <div className="mb-8">
        <SigilloProdottiUfficiali to={null} />
      </div>

      {paid && (
        <div className="mb-6 tbh-card p-4 flex items-center gap-3 border-[var(--tbh-neon)]">
          <CheckCircle2 className="text-[var(--tbh-neon)]" />
          <span>Pagamento completato. Ti contattiamo su WhatsApp per l'attivazione.</span>
        </div>
      )}

      {status.data && !status.data.configured && (
        <div className="mb-6 tbh-card p-4 md:p-5 flex flex-col md:flex-row md:items-center gap-3">
          <AlertTriangle className="text-[var(--tbh-gold)] shrink-0" />
          <p className="text-sm grow">
            <strong>Stripe non è ancora collegato.</strong> Il checkout con carta si attiva appena
            inserisci la chiave <code>STRIPE_SECRET_KEY</code>. Nel frattempo gli ordini si chiudono
            su WhatsApp.
          </p>
          <a href={WA} target="_blank" rel="noreferrer" className="tbh-neon-btn px-5 py-2.5 text-sm whitespace-nowrap">
            Ordina su WhatsApp
          </a>
        </div>
      )}

      {status.data?.configured && status.data.mode === "test" && (
        <div className="mb-6 text-xs text-[var(--tbh-gold)]">
          Stripe attivo in modalità TEST — i pagamenti non sono reali.
        </div>
      )}

      {error && (
        <div className="mb-6 tbh-card p-4 flex flex-col md:flex-row md:items-center gap-3 border-[var(--tbh-gold)]">
          <AlertTriangle className="text-[var(--tbh-gold)] shrink-0" />
          <p className="text-sm grow">{error}</p>
          <a href={WA} target="_blank" rel="noreferrer" className="tbh-neon-btn px-5 py-2.5 text-sm flex items-center gap-2 whitespace-nowrap">
            <MessageCircle size={16} /> Ordina su WhatsApp
          </a>
        </div>
      )}

      <div className="flex gap-2 overflow-x-auto pb-4 mb-6">
        {(products.data?.categories ?? ["Tutti"]).map((c) => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-semibold transition ${
              category === c ? "bg-[var(--tbh-neon)] text-black" : "bg-white/10 hover:bg-white/20"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {etichettePresenti.length > 1 && (
        <div className="flex flex-wrap gap-2 mb-6" data-filtri-etichette>
          <button
            onClick={() => setEtichetta(null)}
            className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase ${etichetta === null ? "bg-[var(--tbh-gold)] text-black" : "bg-white/10"}`}
          >
            Tutte
          </button>
          {etichettePresenti.map((e) => (
            <button
              key={e}
              onClick={() => setEtichetta(e)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase ${etichetta === e ? "bg-[var(--tbh-gold)] text-black" : "bg-white/10"}`}
            >
              {e}
            </button>
          ))}
        </div>
      )}

      {/* 30/09/2026 — ordine di Claudio: «le anteprime articoli ben visibili, se sono piccole
          aumenta». Tre colonne al massimo (non quattro) e una sola sul telefono: le slide del
          listino hanno dentro prezzo e vantaggi, con quattro colonne diventavano illeggibili
          e bisognava ingrandire la pagina — cosa che Claudio ha già chiesto di non dover fare. */}
      {products.isLoading ? (
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="tbh-card h-80 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {visibili.map((p) => (
            <ProductCard
              key={p.slug}
              {...p}
              copertina={copertine.trova(`prodotto:${p.slug}`, "prodotto")}
              /* 30/09/2026 — il primo link di pagamento ufficiale in archivio accende
                 «Acquista ora» già sulla card, senza aprire la scheda. */
              checkoutUfficiale={
                p.checkout?.stripe ??
                p.checkout?.revolut ??
                p.checkout?.paypal ??
                p.checkout?.jatapay ??
                p.checkout?.johix ??
                null
              }
              cardActive={status.data?.configured === true}
              onBuy={() => buy(p.slug)}
              pending={checkout.isPending && pendingSlug === p.slug}
            />
          ))}
        </div>
      )}

      {/* Fashion · Elena Di Cuori — marchio esterno, vendita sul suo sito (05/09/2026) */}
      <section className="mt-14">
        <h2 className="tbh-display tbh-h2 mb-2">Fashion · Elena Di Cuori</h2>
        <p className="text-sm text-[var(--tbh-muted)] max-w-3xl mb-6">
          Lingerie, costumi e borse di lusso Made in Italy. Non è un marchio del gruppo e non
          aderisce al Circuito TBH: l&apos;ordine e l&apos;incasso restano al venditore. Prezzi letti
          sul suo listino ufficiale il {VERIFICATO_IL}, li aggiorna lui sul suo sito.
        </p>
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {ELENA_DI_CUORI_PRODOTTI.map((p) => (
            <article key={p.url} className="tbh-card p-5 flex flex-col gap-2">
              {/* Foto del prodotto: si carica dal pannello o si incolla il link ufficiale
                  del venditore. Finché manca, la card lo dice invece di restare muta. */}
              <FotoProdottoEsterno prodotto={p} copertine={copertineEsterne} className="mb-1" />
              <p className="text-xs uppercase tracking-wide text-[var(--tbh-gold)]">{p.categoria}</p>
              <h3 className="tbh-display text-lg leading-tight grow">{p.nome}</h3>
              <p className="tbh-display text-xl text-[var(--tbh-neon)]">{p.prezzo}</p>
              {/* Chi vende e come si compra: lo dice il dato del prodotto (Priorità 2bis, l). */}
              <p className="text-[11px] text-[var(--tbh-muted)]">
                {p.venditore} · {etichettaAcquisto(p.tipoAcquisto)}
              </p>
              <AcquistoEsterno prodotto={p} className="mt-1" />
            </article>
          ))}
        </div>
        <Link
          href="/fashion"
          className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[var(--tbh-neon)]"
        >
          Apri l&apos;area Fashion &amp; Riviste
        </Link>
      </section>

      <div className="mt-10">
        <CheckoutSlots
          chiave="shop"
          titolo="Checkout del negozio"
          argomento="Touch Plaza Shop — link di pagamento del negozio"
        />
      </div>

      <PagamentiBlock stripeAttivo={status.data?.configured === true} />

      <SlotContenuti
        slot="shop:pulsanti"
        modo="pulsanti"
        titolo="Vetrine e link aggiunti al negozio"
        descrizione="Si incolla titolo per esteso, logo e link (anche una pagina interna tipo /shop): il pulsante compare subito per tutti i visitatori."
      />
      <div className="mt-14 grid gap-12 border-t border-white/10 pt-10">
        <SezioneAmministrabile sezione="touch-plaza" />
      </div>
    </div>
  );
}
