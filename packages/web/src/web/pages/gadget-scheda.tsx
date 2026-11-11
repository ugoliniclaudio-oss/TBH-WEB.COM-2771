import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useSearchParams } from "wouter";
import {
  ArrowLeft,
  CreditCard,
  Loader2,
  MessageCircle,
  PackageOpen,
  Upload,
} from "lucide-react";
import {
  useAcquistaProdotto,
  useSchedaProdotto,
  useTracciaProdotto,
} from "../queries/prodotti";
import { useCaricaMedia } from "../queries/media";
import { useCodiceAllestimento } from "../components/media-slot";
import { InAllestimento } from "../components/in-allestimento";
import { CaroselloMedia } from "../components/carosello-media";
import { elencoMedia } from "../../api/data/campagne-monitor";
import {
  euro,
  linkWhatsApp,
  modalitaAcquisto,
  nomeDisponibilita,
  normalizzaDisponibilita,
  prezziProdotto,
  totaleCents,
  type Prodotto,
  type VarianteProdotto,
} from "../../api/data/prodotti-tbh";

/**
 * SCHEDA PRODOTTO / GADGET (specifica del 16/09/2026, punti 4-6).
 * Varianti, prezzi reali, personalizzazione e logo del cliente. Due strade
 * d'acquisto: carta (Stripe, se configurato per quella scheda) e WhatsApp con
 * il messaggio già compilato. Niente pulsanti finti: dove manca la
 * configurazione la pagina lo dichiara.
 */
export default function GadgetSchedaPage({ slug }: { slug: string }) {
  const q = useSchedaProdotto(slug);
  const [parametri] = useSearchParams();
  // Stripe rimanda qui con ?pagamento=annullato quando il cliente esce dalla cassa:
  // lo si dice e basta, senza inventare stati dell'ordine.
  const pagamentoAnnullato = parametri.get("pagamento") === "annullato";
  const traccia = useTracciaProdotto();
  const acquista = useAcquistaProdotto();
  const { codice } = useCodiceAllestimento();
  const admin = Boolean(codice);

  const p = (q.data?.prodotto ?? null) as Prodotto | null;

  const [varianteId, setVarianteId] = useState<number | null>(null);
  const [quantita, setQuantita] = useState(1);
  const [testo, setTesto] = useState("");
  const [logoCliente, setLogoCliente] = useState("");

  const carica = useCaricaMedia();
  const campoLogo = useRef<HTMLInputElement | null>(null);

  // Vista registrata una volta sola per scheda aperta.
  const vistaFatta = useRef(0);
  useEffect(() => {
    if (p && vistaFatta.current !== p.id) {
      vistaFatta.current = p.id;
      traccia.mutate({ prodottoId: p.id, tipo: "vista" });
    }
  }, [p, traccia]);

  useEffect(() => {
    if (p) setQuantita(Math.max(1, p.quantitaMin));
  }, [p]);

  const variante: VarianteProdotto | null = useMemo(() => {
    if (!p) return null;
    if (varianteId) return p.varianti.find((v) => v.id === varianteId) ?? null;
    return p.varianti.length > 0 ? (p.varianti[0] ?? null) : null;
  }, [p, varianteId]);

  if (q.isLoading) {
    return (
      <div className="mx-auto max-w-[1500px] px-4 md:px-8 py-16">
        <div className="tbh-card h-96 animate-pulse" />
      </div>
    );
  }

  if (!p) {
    return (
      <div className="mx-auto max-w-[1500px] px-4 md:px-8 py-16 grid gap-6">
        <Link to="/gadget" className="inline-flex items-center gap-2 text-sm text-[var(--tbh-muted)]">
          <ArrowLeft size={16} /> Prodotti e gadget
        </Link>
        <InAllestimento
          cosa="Questa scheda prodotto"
          admin={admin}
          pannello="/allestimento/prodotti"
        />
      </div>
    );
  }

  const prezzi = prezziProdotto(p, variante);
  const disp = normalizzaDisponibilita(variante?.disponibilita ?? p.disponibilita);
  const modo = modalitaAcquisto(p, variante, prezzi.attivo);
  const totale = totaleCents(prezzi.attivo, quantita);
  const personalizzazione = [
    testo.trim() ? `${p.etichettaPersonalizzazione ?? "Testo"}: ${testo.trim()}` : "",
    logoCliente.trim() ? `Logo del cliente: ${logoCliente.trim()}` : "",
  ]
    .filter(Boolean)
    .join(" · ");

  const linkPagina =
    typeof window === "undefined" ? `/gadget/${p.slug}` : `${window.location.origin}/gadget/${p.slug}`;

  const wa = linkWhatsApp(p.whatsappNumero, {
    nome: p.nome,
    codice: variante?.codice ?? p.codice,
    colore: variante?.colore ?? null,
    taglia: variante?.taglia ?? null,
    quantita,
    personalizzazione: personalizzazione || null,
    prezzo: prezzi.attivo !== null ? euro(prezzi.attivo) : null,
    linkProdotto: linkPagina,
  });

  const galleria = elencoMedia(
    [variante?.immagineUrl ?? "", p.galleriaUrl ?? ""].filter(Boolean).join("\n") || null,
  );

  // `scheda` è la stessa scheda di `p`, già verificata non nulla: le funzioni
  // dichiarate qui sotto sono sollevate, quindi il controllo va rifatto a mano.
  const scheda = p;

  const caricaLogo = async (f: File) => {
    // Il file del cliente finisce nell'archivio del portale: l'indirizzo va nel
    // messaggio WhatsApp, così la produzione lavora sul file originale.
    const esito = await carica.mutateAsync({
      codice: codice || "cliente",
      slot: `prodotto:${scheda.slug}:logo-cliente`,
      file: f,
      tipo: f.type === "application/pdf" ? "documento" : "logo",
      titolo: `Logo cliente — ${scheda.nome}`,
    });
    setLogoCliente(esito.url);
  };

  const pagaConCarta = () => {
    traccia.mutate({ prodottoId: scheda.id, tipo: "stripe", varianteId: variante?.id ?? null });
    acquista.mutate(
      {
        prodottoId: scheda.id,
        varianteId: variante?.id ?? null,
        quantita,
        personalizzazione: personalizzazione || null,
        origin: window.location.origin,
      },
      {
        onSuccess: (r) => {
          if (r?.url) window.location.href = r.url;
        },
      },
    );
  };

  return (
    <div className="mx-auto max-w-[1500px] px-4 md:px-8 py-10 grid gap-8">
      <Link to="/gadget" className="inline-flex items-center gap-2 text-sm text-[var(--tbh-muted)]">
        <ArrowLeft size={16} /> Prodotti e gadget
      </Link>

      {pagamentoAnnullato ? (
        <div className="rounded-xl border border-amber-300/40 bg-amber-300/10 p-4 text-sm text-amber-200">
          Pagamento con carta interrotto: nessun importo è stato incassato. Si può riprovare
          da questa pagina oppure chiudere l'ordine su WhatsApp.
        </div>
      ) : null}

      <div className="grid gap-8 lg:grid-cols-[1.05fr_1fr]">
        {/* ── Immagini: solo materiali caricati davvero ── */}
        <div className="grid gap-3">
          {galleria.length > 1 ? (
            <CaroselloMedia elementi={galleria} titolo={p.nome} visibile durataSec={8} loop />
          ) : (
            <div className="relative aspect-video overflow-hidden rounded-2xl border border-white/10 bg-black">
              {variante?.immagineUrl || p.logoUrl ? (
                <img
                  src={variante?.immagineUrl ?? p.logoUrl ?? ""}
                  alt={p.nome}
                  className="absolute inset-0 h-full w-full object-contain p-4"
                />
              ) : (
                <div className="absolute inset-0 grid place-items-center gap-2 text-center">
                  <PackageOpen className="h-8 w-8 text-white/25" />
                  <p className="px-6 text-[11px] text-[var(--tbh-muted)]">
                    Fotografie ufficiali del prodotto in allestimento.
                  </p>
                </div>
              )}
            </div>
          )}
          {p.descrizione ? (
            <div className="tbh-card p-5">
              <p className="whitespace-pre-line text-sm text-[var(--tbh-muted)]">{p.descrizione}</p>
            </div>
          ) : null}
        </div>

        {/* ── Configuratore e acquisto ── */}
        <div className="tbh-card grid gap-5 p-6">
          <div className="grid gap-2">
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--tbh-neon)]">
              {p.categoria ?? "Prodotti & Gadget TBH"}
            </p>
            <h1 className="tbh-display tbh-h2">{p.nome}</h1>
            <p className="text-[11px] text-[var(--tbh-muted)]">
              {p.codice ? `Codice ${p.codice} · ` : ""}
              {nomeDisponibilita(disp)}
              {p.tempiConsegna ? ` · ${p.tempiConsegna}` : ""}
            </p>
          </div>

          {/* Prezzi */}
          <div className="flex flex-wrap items-baseline gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-4">
            {prezzi.attivo !== null ? (
              <>
                <span className="tbh-dato text-2xl font-bold text-[var(--tbh-neon)]">
                  {euro(prezzi.attivo)}
                </span>
                {prezzi.promo !== null && prezzi.pieno !== null ? (
                  <span className="tbh-dato text-sm text-[var(--tbh-muted)] line-through">
                    {euro(prezzi.pieno)}
                  </span>
                ) : null}
                {prezzi.fidelity !== null ? (
                  <span className="tbh-dato rounded-full border border-[var(--tbh-gold)]/50 px-2.5 py-1 text-[11px] font-bold text-[var(--tbh-gold)]">
                    Fidelity TBH {euro(prezzi.fidelity)}
                  </span>
                ) : null}
              </>
            ) : (
              <span className="text-xs font-bold uppercase tracking-[0.14em] text-amber-300">
                Prezzo in allestimento — si concorda su WhatsApp
              </span>
            )}
          </div>

          {/* Varianti */}
          {p.varianti.length > 0 ? (
            <div className="grid gap-2">
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-white">
                Scegli la variante
              </p>
              <div className="flex flex-wrap gap-2">
                {p.varianti.map((v) => {
                  const scelta = (variante?.id ?? 0) === v.id;
                  const nome = [v.colore, v.taglia, v.codice].filter(Boolean).join(" · ") || `Variante ${v.id}`;
                  return (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => setVarianteId(v.id)}
                      className={`rounded-xl border px-3 py-2 text-xs font-semibold ${
                        scelta
                          ? "border-[var(--tbh-neon)] bg-[var(--tbh-neon)]/10 text-[var(--tbh-neon)]"
                          : "border-white/15 text-white"
                      }`}
                    >
                      {nome}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : null}

          {/* Quantità */}
          <div className="grid gap-2">
            <label className="text-[11px] font-bold uppercase tracking-[0.16em] text-white">
              Quantità ({p.quantitaMin}–{p.quantitaMax})
            </label>
            <input
              type="number"
              min={p.quantitaMin}
              max={p.quantitaMax}
              value={quantita}
              onChange={(e) =>
                setQuantita(
                  Math.min(p.quantitaMax, Math.max(p.quantitaMin, Number(e.target.value) || p.quantitaMin)),
                )
              }
              className="w-28 rounded-xl border border-white/15 bg-black/40 px-3 py-2 text-sm text-white"
            />
            {totale !== null ? (
              <p className="tbh-dato text-xs text-[var(--tbh-muted)]">
                Totale: <span className="text-white">{euro(totale)}</span>
              </p>
            ) : null}
          </div>

          {/* Personalizzazione */}
          {p.personalizzabile ? (
            <div className="grid gap-2">
              <label className="text-[11px] font-bold uppercase tracking-[0.16em] text-white">
                {p.etichettaPersonalizzazione ?? "Personalizzazione"}
              </label>
              <input
                value={testo}
                onChange={(e) => setTesto(e.target.value)}
                placeholder="Nome, numero o testo da stampare"
                className="rounded-xl border border-white/15 bg-black/40 px-3 py-2 text-sm text-white"
              />
            </div>
          ) : null}

          {p.caricaLogoCliente ? (
            <div className="grid gap-2">
              <label className="text-[11px] font-bold uppercase tracking-[0.16em] text-white">
                Il tuo logo o la tua immagine
              </label>
              <input
                ref={campoLogo}
                type="file"
                accept="image/*,application/pdf"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  e.target.value = "";
                  if (f) void caricaLogo(f);
                }}
              />
              <button
                type="button"
                onClick={() => campoLogo.current?.click()}
                disabled={carica.isPending}
                className="inline-flex w-fit items-center gap-2 rounded-xl border border-white/25 px-4 py-2 text-xs font-bold text-white disabled:opacity-40"
              >
                {carica.isPending ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Upload className="h-3.5 w-3.5" />
                )}
                {carica.isPending ? "Carico il file…" : "Carica il tuo logo"}
              </button>
              {logoCliente ? (
                <p className="text-[11px] text-[var(--tbh-neon)]">
                  File caricato: l'indirizzo viaggia con l'ordine.
                </p>
              ) : null}
              {carica.isError ? (
                <p className="text-[11px] text-amber-300">
                  {carica.error instanceof Error
                    ? carica.error.message
                    : "Caricamento non riuscito."}
                </p>
              ) : null}
            </div>
          ) : null}

          {/* ── Punto 6: i pulsanti seguono la configurazione reale ── */}
          <div className="grid gap-2">
            {modo.stripe && q.data?.stripeConfigurato !== false ? (
              <button
                type="button"
                onClick={pagaConCarta}
                disabled={acquista.isPending}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--tbh-neon)] px-5 py-3 text-xs font-bold text-black disabled:opacity-50"
              >
                {acquista.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <CreditCard className="h-4 w-4" />
                )}
                {modo.testoStripe}
              </button>
            ) : null}

            {modo.whatsapp ? (
              <a
                href={wa}
                target="_blank"
                rel="noreferrer"
                onClick={() =>
                  traccia.mutate({
                    prodottoId: p.id,
                    tipo: "whatsapp",
                    varianteId: variante?.id ?? null,
                  })
                }
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-[var(--tbh-neon)]/60 px-5 py-3 text-xs font-bold text-[var(--tbh-neon)]"
              >
                <MessageCircle className="h-4 w-4" />
                {modo.testoWhatsapp}
              </a>
            ) : null}

            {modo.inAllestimento ? (
              <InAllestimento
                cosa="L'acquisto di questa scheda"
                admin={admin}
                pannello="/allestimento/prodotti"
                compatto
              />
            ) : null}

            {acquista.isError ? (
              <p className="text-[11px] text-amber-300">
                {acquista.error instanceof Error
                  ? acquista.error.message
                  : "Pagamento con carta non disponibile: ordina su WhatsApp."}
              </p>
            ) : null}

            {modo.stripe && q.data?.stripeConfigurato === false ? (
              <p className="text-[11px] text-[var(--tbh-muted)]">
                Pagamento con carta in attivazione: per ora l'ordine si chiude su WhatsApp.
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
