import { Link, useSearchParams } from "wouter";
import { CheckCircle2, Clock3, MessageCircle, PackageOpen } from "lucide-react";
import { useOrdine } from "../queries/prodotti";
import { WHATSAPP_PREDEFINITO } from "../../api/data/prodotti-tbh";

/* ────────────────────────────────────────────────────────────────────────────
   ORDINE CONFERMATO — dove torna il cliente dopo il pagamento con carta
   (specifica del 16/09/2026, punto 5A: Stripe rimanda qui con ?ordine=<numero>).

   Regole rispettate:
   · nessun dato inventato: numero, prodotto, variante, quantità e totale sono
     quelli scritti sul server quando l'ordine è nato;
   · nessuna promessa non verificabile: non si scrivono tempi di spedizione né
     stati che il server non conosce;
   · nessun pulsante verso il nulla: il collegamento al prodotto compare solo
     se l'ordine porta uno slug, e WhatsApp è il numero reale del gruppo.
   ──────────────────────────────────────────────────────────────────────────── */

/** Stato scritto dal server, detto in italiano senza inventare passaggi. */
function statoInItaliano(stato: string | null | undefined): {
  titolo: string;
  nota: string;
  incassato: boolean;
} {
  const s = (stato ?? "").trim().toLowerCase();
  if (s === "paid" || s === "pagato" || s === "complete" || s === "completed")
    return {
      titolo: "Pagamento ricevuto",
      nota: "Il pagamento risulta incassato. L'ordine è in lavorazione: per qualsiasi cosa scrivi su WhatsApp citando il numero d'ordine.",
      incassato: true,
    };
  if (s === "cancelled" || s === "canceled" || s === "annullato" || s === "failed")
    return {
      titolo: "Pagamento non concluso",
      nota: "Questo ordine risulta non concluso. Nessun importo risulta incassato: si può riprovare col pagamento con carta oppure chiudere l'ordine su WhatsApp.",
      incassato: false,
    };
  return {
    titolo: "Ordine registrato",
    nota: "L'ordine è registrato col suo numero. La conferma dell'incasso arriva da Stripe: se hai completato il pagamento ora, può comparire con qualche istante di ritardo.",
    incassato: false,
  };
}

function Riga({ voce, valore }: { voce: string; valore: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-white/8 py-2 last:border-0">
      <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--tbh-muted)]">
        {voce}
      </span>
      <span className="text-right text-sm font-semibold text-white">{valore}</span>
    </div>
  );
}

export default function OrdineConfermatoPage() {
  const [params] = useSearchParams();
  const grezzo = params.get("ordine") ?? "";
  const id = Number.parseInt(grezzo, 10);
  const valido = Number.isFinite(id) && id > 0;
  const q = useOrdine(valido ? id : 0);
  const d = q.data;
  const ordine = d?.ordine ?? null;
  const numero = d?.whatsapp ?? WHATSAPP_PREDEFINITO;

  const messaggio = ordine
    ? `Buongiorno TBH, scrivo per l'ordine numero ${ordine.id}${
        ordine.prodotto ? ` (${ordine.prodotto})` : ""
      }.`
    : "Buongiorno TBH, scrivo per un ordine appena effettuato sul sito.";
  const wa = `https://wa.me/${numero.replace(/[^\d]/g, "")}?text=${encodeURIComponent(messaggio)}`;

  const stato = statoInItaliano(ordine?.stato);

  return (
    <div className="mx-auto grid max-w-[900px] gap-6 px-4 py-12 md:px-8">
      <header className="grid gap-3">
        <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[var(--tbh-neon)]">
          Touch Plaza · Prodotti &amp; Gadget
        </p>
        <h1 className="tbh-display tbh-h1">
          {valido ? stato.titolo : "Numero d'ordine mancante"}
        </h1>
      </header>

      {!valido ? (
        <div className="tbh-card grid gap-4 p-6">
          <p className="text-sm text-[var(--tbh-muted)]">
            Questo indirizzo va aperto col numero d'ordine che il pagamento aggiunge da sé
            (per esempio <span className="tbh-dato text-white">/ordine-confermato?ordine=12</span>).
            Senza quel numero non c'è niente da mostrare: nessun ordine viene indovinato.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              to="/gadget"
              className="inline-flex items-center gap-2 rounded-xl border border-white/15 px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] text-white"
            >
              <PackageOpen className="h-4 w-4" /> Torna ai prodotti
            </Link>
            <a
              href={wa}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-xl bg-[#25D366] px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] text-black"
            >
              <MessageCircle className="h-4 w-4" /> Scrivi su WhatsApp
            </a>
          </div>
        </div>
      ) : q.isLoading ? (
        <div className="tbh-card h-56 animate-pulse p-6" />
      ) : !ordine ? (
        <div className="tbh-card grid gap-4 p-6">
          <p className="text-sm text-amber-300">
            L'ordine numero <span className="tbh-dato">{id}</span> non risulta sul server.
          </p>
          <p className="text-sm text-[var(--tbh-muted)]">
            Se il pagamento è andato a buon fine, il numero è comunque nella ricevuta della
            carta: scrivi su WhatsApp con quella ricevuta e l'ordine viene ripreso a mano.
          </p>
          <a
            href={wa}
            target="_blank"
            rel="noreferrer"
            className="inline-flex w-fit items-center gap-2 rounded-xl bg-[#25D366] px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] text-black"
          >
            <MessageCircle className="h-4 w-4" /> Scrivi su WhatsApp
          </a>
        </div>
      ) : (
        <>
          <div className="tbh-card grid gap-4 p-6">
            <div className="flex items-start gap-3">
              {stato.incassato ? (
                <CheckCircle2 className="mt-0.5 h-6 w-6 shrink-0 text-[var(--tbh-neon)]" />
              ) : (
                <Clock3 className="mt-0.5 h-6 w-6 shrink-0 text-amber-300" />
              )}
              <div className="grid gap-1">
                <p className="text-sm font-bold text-white">
                  Ordine numero <span className="tbh-dato">{ordine.id}</span>
                </p>
                <p className="text-sm text-[var(--tbh-muted)]">{stato.nota}</p>
              </div>
            </div>

            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
              <Riga voce="Prodotto" valore={ordine.prodotto} />
              {ordine.codice ? <Riga voce="Codice" valore={ordine.codice} /> : null}
              {ordine.variante ? <Riga voce="Variante" valore={ordine.variante} /> : null}
              {ordine.personalizzazione ? (
                <Riga voce="Personalizzazione" valore={ordine.personalizzazione} />
              ) : null}
              <Riga voce="Quantità" valore={String(ordine.quantita ?? 1)} />
              {ordine.totale ? (
                <Riga voce="Totale" valore={ordine.totale} />
              ) : (
                <Riga voce="Totale" valore="Da concordare su WhatsApp" />
              )}
            </div>

            <div className="flex flex-wrap gap-3">
              <a
                href={wa}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-xl bg-[#25D366] px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] text-black"
              >
                <MessageCircle className="h-4 w-4" /> Scrivi su WhatsApp per questo ordine
              </a>
              {ordine.slug ? (
                <Link
                  to={`/gadget/${ordine.slug}`}
                  className="inline-flex items-center gap-2 rounded-xl border border-white/15 px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] text-white"
                >
                  <PackageOpen className="h-4 w-4" /> Rivedi il prodotto
                </Link>
              ) : null}
              <Link
                to="/gadget"
                className="inline-flex items-center gap-2 rounded-xl border border-white/15 px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] text-white"
              >
                Torna alla vetrina
              </Link>
            </div>
          </div>

          <p className="text-[11px] text-[var(--tbh-muted)]">
            Conserva il numero d'ordine: è il riferimento che il gruppo usa per la consegna e
            per l'assistenza. Il numero WhatsApp del gruppo è {numero}.
          </p>
        </>
      )}
    </div>
  );
}
