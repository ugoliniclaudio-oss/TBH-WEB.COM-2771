import { useEffect, useState } from "react";
import { CreditCard, ExternalLink, Link2, MessageCircle, ShieldAlert, Trash2 } from "lucide-react";
import { waInfo } from "../lib/whatsapp";

/**
 * SPAZI URL PER I CHECKOUT DEL NEGOZIO — ordine di Claudio (03/09/2026):
 * «Sul negozio come nei monitor che mi dai la possibilità di inserire il link o URL,
 *  fai stessa cosa con il negozio in cui io posso mettere i vari check out:
 *  Revolut, PayPal, Stripe, Jatapay, Johix, più il prezzo su Catalogo di WhatsApp».
 *
 * Funziona come i MONITOR CON SPAZIO URL:
 * · se il link ufficiale è già in archivio (campo dati) il pulsante di pagamento è pubblico;
 * · se non c'è, compare il CAMPO dove incollare il link: il pulsante si accende subito;
 * · il link incollato resta salvato SOLO su questo dispositivo (localStorage) e la pagina lo dichiara.
 *
 * Perché non pubblica per tutti: il sito non ha ancora un'area riservata con login. Un campo
 * pubblico che scrive nel database lascerebbe a chiunque la possibilità di mettere il PROPRIO
 * link di pagamento sul negozio. Per fissare i link per tutti i visitatori: si mandano su
 * WhatsApp e li mettiamo in archivio, oppure si accende l'area riservata staff.
 */

export type FornitoreId = "revolut" | "paypal" | "stripe" | "jatapay" | "johix" | "whatsapp";

export type Fornitore = {
  id: FornitoreId;
  nome: string;
  colore: string;
  /** Host attesi: se il link ha un altro host lo diciamo, ma non lo blocchiamo. */
  host: string[];
  esempio: string;
  cta: string;
  nota: string;
};

export const FORNITORI: Fornitore[] = [
  {
    id: "revolut",
    nome: "Revolut",
    colore: "#6a6aff",
    host: ["revolut.me", "revolut.com", "checkout.revolut.com", "pay.revolut.com"],
    esempio: "https://revolut.me/…  ·  https://checkout.revolut.com/…",
    cta: "Paga con Revolut",
    nota: "Link di pagamento o richiesta Revolut.",
  },
  {
    id: "paypal",
    nome: "PayPal",
    colore: "#00a4e0",
    host: ["paypal.me", "paypal.com", "www.paypal.com"],
    esempio: "https://paypal.me/…  ·  https://www.paypal.com/ncp/payment/…",
    cta: "Paga con PayPal",
    nota: "PayPal.Me o link pagamento PayPal.",
  },
  {
    id: "stripe",
    nome: "Stripe",
    colore: "#a78bfa",
    host: ["buy.stripe.com", "checkout.stripe.com", "pay.stripe.com", "stripe.com"],
    esempio: "https://buy.stripe.com/…",
    cta: "Paga con Stripe",
    nota: "Payment Link Stripe. Con la chiave Stripe nel sito il checkout diventa automatico.",
  },
  {
    id: "jatapay",
    nome: "JataPay",
    colore: "#33e0ff",
    host: [],
    esempio: "https://… (link JataPay)",
    cta: "Paga con JataPay",
    nota: "Host ufficiale JataPay non ancora verificato: incolla il link che ti dà il pannello.",
  },
  {
    id: "johix",
    nome: "Johix",
    colore: "#ff8a00",
    host: [],
    esempio: "https://… (link Johix)",
    cta: "Paga con Johix",
    nota:
      "Host ufficiale Johix non ancora verificato: incolla il link che ti dà il pannello. " +
      "Ordine di Claudio (30/09/2026): Johix va proposto SOLO a chi è in possesso di carta di credito.",
  },
  {
    id: "whatsapp",
    nome: "Catalogo WhatsApp",
    colore: "#25d366",
    host: ["wa.me", "api.whatsapp.com", "whatsapp.com"],
    esempio: "https://wa.me/c/393792088524  ·  link diretto all'articolo del catalogo",
    cta: "Vedi sul catalogo WhatsApp",
    nota: "Link al catalogo o all'articolo, con il prezzo esposto sul catalogo.",
  },
];

const PREFISSO = "tbh-checkout-url:";
const PREFISSO_PREZZO = "tbh-checkout-prezzo:";

/**
 * I link di pagamento GIÀ salvati per una chiave, letti dall'unico posto che li scrive.
 *
 * Serve a chi deve soltanto saperlo o mostrarlo: la lista di lavoro dell'allestimento (per dire
 * se manca il checkout) e i prodotti con TIPO ACQUISTO = «Checkout TBH». Così il prefisso
 * dell'archivio e l'elenco dei fornitori restano scritti qui una volta sola.
 *
 * Torna solo gli indirizzi validi (http/https): il pulsante di pagamento non deve mai comparire
 * sopra un link rotto o un campo mezzo compilato.
 */
export function linkCheckoutSalvati(chiave: string): { fornitore: Fornitore; url: string }[] {
  return FORNITORI.map((f) => ({
    fornitore: f,
    url: (leggi(`${PREFISSO}${chiave}:${f.id}`) ?? "").trim(),
  })).filter((r) => /^https?:\/\/\S+$/i.test(r.url));
}

function leggi(chiave: string) {
  try {
    return localStorage.getItem(chiave);
  } catch {
    return null;
  }
}

function scrivi(chiave: string, valore: string | null) {
  try {
    if (valore === null) localStorage.removeItem(chiave);
    else localStorage.setItem(chiave, valore);
  } catch {
    /* localStorage non disponibile: il valore vale per la sessione corrente */
  }
}

function hostDi(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, "").toLowerCase();
  } catch {
    return null;
  }
}

function RigaFornitore({
  f,
  chiave,
  urlUfficiale,
  argomento,
}: {
  f: Fornitore;
  chiave: string;
  urlUfficiale: string | null;
  argomento: string;
}) {
  const kUrl = `${PREFISSO}${chiave}:${f.id}`;
  const kPrezzo = `${PREFISSO_PREZZO}${chiave}`;
  const [salvato, setSalvato] = useState<string | null>(null);
  const [testo, setTesto] = useState("");
  const [prezzo, setPrezzo] = useState("");
  const [errore, setErrore] = useState<string | null>(null);
  const [avviso, setAvviso] = useState<string | null>(null);

  useEffect(() => {
    const v = leggi(kUrl);
    setSalvato(v);
    setTesto(v ?? "");
    setErrore(null);
    setAvviso(null);
    if (f.id === "whatsapp") setPrezzo(leggi(kPrezzo) ?? "");
  }, [kUrl, kPrezzo, f.id]);

  const attivo = urlUfficiale ?? salvato;

  function salva() {
    const pulito = testo.trim();
    if (!pulito) {
      setErrore("Incolla il link di pagamento.");
      return;
    }
    if (!/^https:\/\//i.test(pulito)) {
      setErrore("Serve un indirizzo che inizia con https:// — per i pagamenti non accettiamo http.");
      return;
    }
    const h = hostDi(pulito);
    if (!h) {
      setErrore("Indirizzo non valido.");
      return;
    }
    setErrore(null);
    setAvviso(
      f.host.length > 0 && !f.host.some((x) => h === x || h.endsWith(`.${x}`))
        ? `Attenzione: ${h} non è tra gli indirizzi ufficiali ${f.nome} che conosciamo. Controlla prima di usarlo.`
        : null,
    );
    setSalvato(pulito);
    scrivi(kUrl, pulito);
  }

  function svuota() {
    setSalvato(null);
    setTesto("");
    setErrore(null);
    setAvviso(null);
    scrivi(kUrl, null);
  }

  return (
    <div className="rounded-2xl border p-4" style={{ borderColor: `${f.colore}55` }}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span
          className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-black"
          style={{ background: f.colore }}
        >
          <CreditCard size={13} /> {f.nome}
        </span>
        {attivo ? (
          <a
            href={attivo}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold uppercase tracking-wide text-black"
            style={{ background: f.colore }}
          >
            {f.cta} <ExternalLink size={13} />
          </a>
        ) : (
          <span className="text-[11px] font-bold uppercase tracking-wide text-[var(--tbh-muted)]">
            Slot libero
          </span>
        )}
      </div>

      <p className="mt-2 text-[11px] text-[var(--tbh-muted)]">{f.nota}</p>

      {!urlUfficiale && (
        <>
          <label className="mt-3 flex flex-col gap-1.5">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-[var(--tbh-gold)]">
              <Link2 size={13} /> Spazio URL — {f.nome}
            </span>
            <span className="flex flex-wrap gap-2">
              <input
                value={testo}
                onChange={(e) => setTesto(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") salva();
                }}
                placeholder={f.esempio}
                aria-label={`Link di pagamento ${f.nome}`}
                className="min-w-0 flex-1 rounded-full border border-[var(--tbh-line)] bg-black/50 px-3 py-2 text-sm outline-none focus:border-[var(--tbh-neon)]"
              />
              <button
                type="button"
                onClick={salva}
                className="rounded-full px-4 py-2 text-xs font-bold uppercase tracking-wide text-black"
                style={{ background: f.colore }}
              >
                Attiva pulsante
              </button>
              {salvato && (
                <button
                  type="button"
                  onClick={svuota}
                  className="inline-flex items-center gap-1.5 rounded-full border border-[var(--tbh-line)] px-3 py-2 text-[11px] font-bold uppercase tracking-wide hover:border-[#ff2b2b] hover:text-[#ff2b2b]"
                >
                  <Trash2 size={13} /> Svuota
                </button>
              )}
            </span>
          </label>

          {f.id === "whatsapp" && (
            <label className="mt-3 flex flex-col gap-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wide text-[var(--tbh-gold)]">
                Prezzo esposto sul catalogo WhatsApp
              </span>
              <input
                value={prezzo}
                onChange={(e) => {
                  setPrezzo(e.target.value);
                  scrivi(kPrezzo, e.target.value.trim() || null);
                }}
                placeholder="es. 610,00 €"
                aria-label="Prezzo sul catalogo WhatsApp"
                className="w-full max-w-[240px] rounded-full border border-[var(--tbh-line)] bg-black/50 px-3 py-2 text-sm outline-none focus:border-[var(--tbh-neon)]"
              />
              {prezzo.trim() && (
                <span className="text-[11px] text-[var(--tbh-muted)]">
                  Sul catalogo WhatsApp questo articolo è esposto a{" "}
                  <strong className="text-[var(--tbh-neon)]">{prezzo.trim()}</strong>. Se è diverso dal
                  prezzo di listino del sito, va allineato: non pubblichiamo due prezzi diversi.
                </span>
              )}
            </label>
          )}

          {errore && <p className="mt-2 text-[11px] font-semibold text-[#ff5b5b]">{errore}</p>}
          {avviso && (
            <p className="mt-2 inline-flex items-start gap-1.5 text-[11px] font-semibold text-[var(--tbh-gold)]">
              <ShieldAlert size={13} className="mt-0.5 shrink-0" /> {avviso}
            </p>
          )}
          {salvato && !errore && (
            <p className="mt-2 text-[11px] text-[var(--tbh-muted)]">
              Link salvato solo su questo dispositivo: mandalo su WhatsApp e lo fissiamo nel sito per
              tutti i clienti.
            </p>
          )}
        </>
      )}

      {urlUfficiale && (
        <p className="mt-2 text-[11px] text-[var(--tbh-muted)]">
          Link ufficiale già in archivio: il pulsante è pubblico per tutti i clienti.
        </p>
      )}

      {!attivo && (
        <a
          href={waInfo(`${f.nome} — ${argomento}`)}
          target="_blank"
          rel="noreferrer"
          className="mt-3 inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-wide text-[var(--tbh-muted)] hover:text-[var(--tbh-neon)]"
        >
          <MessageCircle size={13} /> Invia il link ufficiale {f.nome}
        </a>
      )}
    </div>
  );
}

/**
 * Blocco checkout. `chiave` = identificativo dello slot (slug prodotto o "shop" per il negozio).
 * `ufficiali` = link già in archivio, quando esistono: quelli sono pubblici per tutti.
 */
export function CheckoutSlots({
  chiave,
  titolo,
  argomento,
  ufficiali,
  compatto = false,
}: {
  chiave: string;
  titolo?: string;
  argomento: string;
  ufficiali?: Partial<Record<FornitoreId, string>>;
  compatto?: boolean;
}) {
  return (
    <section className="tbh-card p-5 md:p-6">
      <header className="mb-4">
        <p className="text-[11px] uppercase tracking-[0.25em] text-[var(--tbh-gold)]">
          Checkout · spazi URL
        </p>
        <h2 className="tbh-display tbh-h2 mt-1">{titolo ?? "Metti qui i tuoi checkout"}</h2>
        <p className="tbh-body mt-2 max-w-3xl text-sm text-[var(--tbh-muted)]">
          Sei slot: Revolut, PayPal, Stripe, JataPay, Johix e Catalogo WhatsApp con il prezzo esposto.
          Incolli il link e il pulsante di pagamento si accende. Nessun pulsante finto: se lo slot è
          vuoto non compare nessun pagamento.
        </p>
      </header>

      <div className={`grid gap-4 ${compatto ? "md:grid-cols-2" : "md:grid-cols-2 xl:grid-cols-3"}`}>
        {FORNITORI.map((f) => (
          <RigaFornitore
            key={f.id}
            f={f}
            chiave={chiave}
            urlUfficiale={ufficiali?.[f.id] ?? null}
            argomento={argomento}
          />
        ))}
      </div>

      <p className="mt-4 text-[11px] text-[var(--tbh-muted)]">
        I link incollati qui restano su questo dispositivo. Per renderli pubblici a tutti i visitatori
        servono i link ufficiali in archivio (li mandi su WhatsApp) oppure l'area riservata staff con
        login: senza login un campo pubblico permetterebbe a chiunque di mettere il proprio link di
        pagamento sul negozio.
      </p>
    </section>
  );
}
