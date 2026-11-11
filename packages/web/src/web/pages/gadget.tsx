import { Link } from "wouter";
import { PackageOpen, Settings2, ShoppingBag, Tag } from "lucide-react";
import { useVetrinaProdotti } from "../queries/prodotti";
import { InAllestimento } from "../components/in-allestimento";
import { SpazioPubblicitario, useCampagneSpazio } from "../components/spazio-pubblicitario";
import {
  euro,
  nomeDisponibilita,
  normalizzaDisponibilita,
  prezziProdotto,
} from "../../api/data/prodotti-tbh";
import { useCodiceAllestimento } from "../components/media-slot";

/**
 * VETRINA PRODOTTI E GADGET (specifica del 16/09/2026, punti 4-6).
 * Mostra solo le schede pubblicate dal pannello: nessun prodotto d'esempio,
 * nessun prezzo inventato. Vetrina vuota = IN ALLESTIMENTO, con il collegamento
 * al pannello visibile solo a chi ha il codice di allestimento.
 */
export default function GadgetPage() {
  const q = useVetrinaProdotti();
  const banner = useCampagneSpazio({ spazio: "gadget" });
  const { codice } = useCodiceAllestimento();
  const admin = Boolean(codice);
  const d = q.data;

  return (
    <div className="mx-auto max-w-[1500px] px-4 md:px-8 py-10 grid gap-8">
      <header className="grid gap-3">
        <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[var(--tbh-neon)]">
          Touch Plaza · Prodotti &amp; Gadget
        </p>
        <h1 className="tbh-display tbh-h1">PRODOTTI E GADGET TBH</h1>
        <p className="max-w-3xl text-sm text-[var(--tbh-muted)]">
          Capi, gadget e articoli personalizzabili del gruppo. Ogni scheda mostra i prezzi
          realmente a listino — pieno, promozione e Fidelity TBH — e si ordina con carta
          oppure su WhatsApp.
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <Link
            to="/shop"
            data-link-shop="1"
            className="inline-flex w-fit items-center gap-2 rounded-xl border border-white/15 px-4 py-2 text-xs font-bold text-white transition hover:border-[var(--tbh-neon)]/60"
          >
            <ShoppingBag className="h-3.5 w-3.5" /> Vai al Touch Plaza Shop — servizi, kit e corsi
          </Link>
          {admin ? (
            <Link
              to="/allestimento/prodotti"
              className="inline-flex w-fit items-center gap-2 rounded-xl border border-[var(--tbh-neon)]/50 px-4 py-2 text-xs font-bold text-[var(--tbh-neon)]"
            >
              <Settings2 className="h-3.5 w-3.5" /> Pannello prodotti
            </Link>
          ) : null}
        </div>
      </header>

      {/* Il banner è un riquadro con cornice propria: SpazioPubblicitario si stende
          su tutto il genitore posizionato, quindi va sempre dentro un contenitore
          `relative` con la sua altezza, altrimenti copre la pagina e blocca i click. */}
      {banner.campagne.length > 0 ? (
        <div
          className="relative w-full overflow-hidden rounded-2xl border border-white/10"
          style={{ aspectRatio: "16/5" }}
        >
          <SpazioPubblicitario campagne={banner.campagne} spazio="gadget" nota={banner.nota} />
        </div>
      ) : null}

      {q.isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="tbh-card h-64 animate-pulse" />
          ))}
        </div>
      ) : !d || d.prodotti.length === 0 ? (
        <InAllestimento
          cosa="La vetrina dei prodotti e dei gadget"
          admin={admin}
          pannello="/allestimento/prodotti"
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {d.prodotti.map((p) => {
            const prezzi = prezziProdotto(p);
            const disp = normalizzaDisponibilita(p.disponibilita);
            return (
              <Link
                key={p.id}
                to={`/gadget/${p.slug}`}
                className="tbh-card grid gap-3 p-4 transition hover:border-[var(--tbh-neon)]/60"
              >
                <div className="relative aspect-video overflow-hidden rounded-xl border border-white/10 bg-black">
                  {p.logoUrl ? (
                    <img
                      src={p.logoUrl}
                      alt={p.nome}
                      className="absolute inset-0 h-full w-full object-contain p-3"
                    />
                  ) : (
                    <div className="absolute inset-0 grid place-items-center">
                      <PackageOpen className="h-8 w-8 text-white/25" />
                    </div>
                  )}
                </div>

                <div className="grid gap-1">
                  <p className="text-sm font-semibold text-white">{p.nome}</p>
                  <p className="text-[11px] text-[var(--tbh-muted)]">
                    {p.categoria ? p.categoria : "Categoria da assegnare"} ·{" "}
                    {nomeDisponibilita(disp)}
                  </p>
                </div>

                <div className="flex flex-wrap items-baseline gap-2">
                  {prezzi.attivo !== null ? (
                    <>
                      <span className="tbh-dato text-base font-bold text-[var(--tbh-neon)]">
                        {euro(prezzi.attivo)}
                      </span>
                      {prezzi.promo !== null && prezzi.pieno !== null ? (
                        <span className="tbh-dato text-xs text-[var(--tbh-muted)] line-through">
                          {euro(prezzi.pieno)}
                        </span>
                      ) : null}
                    </>
                  ) : (
                    <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-amber-300">
                      Prezzo in allestimento
                    </span>
                  )}
                  {prezzi.fidelity !== null ? (
                    <span className="tbh-dato inline-flex items-center gap-1 rounded-full border border-[var(--tbh-gold)]/50 px-2 py-0.5 text-[10px] font-bold text-[var(--tbh-gold)]">
                      <Tag className="h-3 w-3" /> Fidelity {euro(prezzi.fidelity)}
                    </span>
                  ) : null}
                </div>

                {p.varianti.length > 0 ? (
                  <p className="text-[10px] text-[var(--tbh-muted)]">
                    {p.varianti.length} varianti fra colori, taglie e versioni
                  </p>
                ) : null}
              </Link>
            );
          })}
        </div>
      )}

      {d && d.prodotti.length === 0 && d.totaleArchivio > 0 ? (
        <p className="text-[11px] text-[var(--tbh-muted)]">
          In archivio ci sono {d.totaleArchivio} schede, ma nessuna è pubblicata o dentro la
          finestra di date di oggi.
        </p>
      ) : null}
    </div>
  );
}
