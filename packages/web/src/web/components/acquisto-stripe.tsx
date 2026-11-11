import { CreditCard, Loader2, Lock } from "lucide-react";
import {
  etichettaVariante,
  importoVariante,
  testoRicorrenza,
  type InfoStripe,
  type VarianteStripe,
} from "../../api/data/stripe-catalogo";
import { useAcquistaStripe } from "../queries/stripe-sync";

/**
 * ACQUISTA — articoli del Touch Plaza collegati a Stripe (03/10/2026).
 *
 *  · Più prezzi: si sceglie PRIMA la variante, poi si paga quella.
 *  · Ogni variante paga col suo pagamento: Payment Link di quel prezzo oppure Checkout
 *    Session creata dal server. Il browser non manda importi: solo slug e Price ID.
 *  · In allestimento: il pulsante resta spento finché la scheda non è completa.
 */

export function StatoArticoloStripe({ stato }: { stato: InfoStripe["stato"] }) {
  if (stato === "pubblicato") return null;
  return (
    <span className="inline-flex items-center rounded-full border border-[var(--tbh-gold)]/60 bg-black/50 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--tbh-gold)]">
      {stato === "archiviato" ? "Non più in vendita" : "In allestimento"}
    </span>
  );
}

export function AcquistoStripe({
  slug,
  info,
  scelta,
  onScelta,
}: {
  slug: string;
  info: InfoStripe;
  scelta: VarianteStripe | null;
  onScelta: (priceId: string) => void;
}) {
  const acquista = useAcquistaStripe();
  const attivo = info.stato === "pubblicato" && !!scelta;
  const errore = acquista.error as Error | null;

  function paga() {
    if (!scelta) return;
    acquista.mutate(
      { slug, priceId: scelta.priceId, origin: window.location.origin },
      { onSuccess: (r) => window.location.assign(r.url) },
    );
  }

  return (
    <div
      data-acquisto-stripe
      className="mt-6 rounded-2xl border border-[var(--tbh-neon)]/45 bg-black/40 p-4"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--tbh-gold)]">
          {info.stato === "pubblicato" ? "Pagamento attivo" : "Acquisto non ancora attivo"}
        </p>
        <StatoArticoloStripe stato={info.stato} />
      </div>

      {info.varianti.length > 1 && (
        <fieldset className="mt-3 grid gap-2">
          <legend className="text-sm font-semibold mb-1">Scegli la variante</legend>
          {info.varianti.map((v) => (
            <label
              key={v.priceId}
              className={`flex cursor-pointer items-center gap-3 rounded-xl border px-3 py-2.5 text-sm transition ${
                scelta?.priceId === v.priceId
                  ? "border-[var(--tbh-neon)] bg-[var(--tbh-neon)]/10"
                  : "border-[var(--tbh-line)] hover:border-[var(--tbh-neon)]/60"
              }`}
            >
              <input
                type="radio"
                name={`variante-${slug}`}
                value={v.priceId}
                checked={scelta?.priceId === v.priceId}
                onChange={() => onScelta(v.priceId)}
                className="accent-[var(--tbh-neon)]"
              />
              <span className="min-w-0 break-words">{etichettaVariante(v)}</span>
            </label>
          ))}
        </fieldset>
      )}

      {scelta && (
        <p className="mt-3 text-sm">
          <span className="tbh-display text-2xl text-[var(--tbh-neon)]">{importoVariante(scelta)}</span>
          {testoRicorrenza(scelta) && (
            <span className="ml-2 text-[var(--tbh-muted)]">· pagamento ricorrente {testoRicorrenza(scelta)}</span>
          )}
        </p>
      )}

      <button
        type="button"
        onClick={paga}
        disabled={!attivo || acquista.isPending}
        className="mt-3 inline-flex items-center gap-2 rounded-full bg-[#a78bfa] px-6 py-3 text-sm font-bold uppercase tracking-wide text-black transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {acquista.isPending ? (
          <Loader2 size={17} className="animate-spin" />
        ) : attivo ? (
          <CreditCard size={17} />
        ) : (
          <Lock size={17} />
        )}
        {attivo ? "Acquista" : info.stato === "archiviato" ? "Non più in vendita" : "In allestimento"}
      </button>

      {errore && <p className="mt-2 text-sm text-red-400">{errore.message}</p>}
      <p className="mt-3 text-[11px] text-[var(--tbh-muted)]">
        {info.stato === "pubblicato"
          ? "Il pagamento si apre sulla pagina sicura di Stripe, legata a questo articolo e a questa variante."
          : info.stato === "archiviato"
            ? "L'articolo è stato ritirato dalla vendita."
            : "La scheda è in allestimento: l'acquisto si attiva appena i dati sono completi."}
      </p>
    </div>
  );
}
