import { useState } from "react";
import { Link } from "wouter";
import { AlertTriangle, CheckCircle2, Link2, Loader2, RefreshCw, Save, Unplug } from "lucide-react";
import { SbloccoAllestimento, useCodiceAllestimento } from "../components/media-slot";
import {
  useAssociaStripe,
  useCollegaAccount,
  useScollegaAccount,
  useSalvaEditorialeStripe,
  useSincronizzaOra,
  useStatoStripeSync,
} from "../queries/stripe-sync";
import { etichettaVariante } from "../../api/data/stripe-catalogo";
import { euro } from "../lib/euro";

/**
 * ADMIN → STRIPE → TOUCH PLAZA (03/10/2026).
 *
 * Account collegati, prima importazione, «Sincronizza ora», prodotti con origine,
 * account, ultima sync ed errori, schede «Da completare», associazione per ID e campi
 * editoriali del sito. Le chiavi segrete non arrivano mai qui: solo le ultime cifre.
 */

type Stato = NonNullable<ReturnType<typeof useStatoStripeSync>["data"]>;
type RigaProdotto = Stato["prodotti"][number];

function data(iso: string | null) {
  if (!iso) return "mai";
  return new Date(iso).toLocaleString("it-IT", { dateStyle: "short", timeStyle: "short" });
}

const campo =
  "w-full min-w-0 rounded-xl border border-[var(--tbh-line)] bg-black/40 px-3 py-2 text-sm outline-none focus:border-[var(--tbh-neon)]";

function Errore({ e }: { e: unknown }) {
  if (!e) return null;
  return <p className="text-sm text-red-400 break-words">{(e as Error).message}</p>;
}

function BadgeStato({ stato }: { stato: string }) {
  const [testo, colore] =
    stato === "pubblicato"
      ? ["Pubblicato", "var(--tbh-neon)"]
      : stato === "archiviato"
        ? ["Archiviato su Stripe", "var(--tbh-muted)"]
        : ["Da completare", "var(--tbh-gold)"];
  return (
    <span
      className="inline-flex rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.14em]"
      style={{ color: colore, borderColor: colore }}
    >
      {testo}
    </span>
  );
}

export default function PannelloStripePage() {
  const { codice } = useCodiceAllestimento();
  return (
    <div className="mx-auto max-w-[1500px] px-4 md:px-8 py-10">
      <Link
        href="/allestimento"
        className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-[var(--tbh-muted)] hover:text-[var(--tbh-neon)] mb-4"
      >
        ← Tutti i pannelli di allestimento
      </Link>
      <header className="tbh-rise mb-6">
        <p className="text-xs tracking-[0.25em] text-[var(--tbh-gold)] uppercase mb-2">
          Pannello riservato · Stripe
        </p>
        <h1 className="tbh-display tbh-h1">Stripe → Touch Plaza</h1>
        <p className="tbh-body text-[var(--tbh-muted)] max-w-3xl mt-3">
          Ogni Product attivo degli account collegati diventa una scheda del Touch Plaza, una sola
          per Product. Prezzi, immagini e stato arrivano da Stripe; testi, categoria, immagini
          aggiuntive e condizioni restano del sito. Una scheda incompleta resta{" "}
          <strong className="text-white">da completare</strong> e in vetrina si legge «In allestimento»,
          senza acquisto.
        </p>
      </header>
      {!codice ? <SbloccoAllestimento /> : <Contenuto codice={codice} />}
    </div>
  );
}

function Contenuto({ codice }: { codice: string }) {
  const q = useStatoStripeSync(codice);
  const sync = useSincronizzaOra();

  if (q.isLoading) return <div className="tbh-card h-64 animate-pulse" />;
  if (q.error) return <Errore e={q.error} />;
  const s = q.data!;
  const origine = window.location.origin;

  return (
    <div className="grid gap-8">
      {/* ── ACCOUNT ─────────────────────────────────────────────── */}
      <section className="tbh-card p-5 md:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="tbh-display tbh-h3">Account Stripe collegati</h2>
          <button
            type="button"
            onClick={() => sync.mutate({ codice })}
            disabled={sync.isPending || s.account.length === 0}
            className="tbh-neon-btn inline-flex items-center gap-2 px-5 py-2.5 text-sm disabled:opacity-50"
          >
            {sync.isPending ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
            Sincronizza ora
          </button>
        </div>
        <Errore e={sync.error} />
        {sync.data && (
          <ul className="mt-3 text-sm space-y-1">
            {sync.data.risultati.map((r) => (
              <li key={r.account} className={r.ok ? "text-[var(--tbh-neon)]" : "text-red-400"}>
                {r.account}: {r.ok
                  ? `${r.creati} nuovi, ${r.aggiornati} aggiornati, ${r.archiviati} archiviati`
                  : `errore — ${r.errore}`}
              </li>
            ))}
          </ul>
        )}

        {s.account.length === 0 ? (
          <div className="mt-4 flex items-start gap-3 rounded-2xl border border-[var(--tbh-gold)]/50 p-4">
            <AlertTriangle className="shrink-0 text-[var(--tbh-gold)]" size={20} />
            <p className="text-sm text-[var(--tbh-muted)]">
              Nessun account collegato: la sincronizzazione è spenta. Si accende con la chiave
              segreta dell'account principale sul server (STRIPE_SECRET_KEY e STRIPE_WEBHOOK_SECRET)
              oppure collegando qui sotto un account. I Payment Link già in archivio continuano a
              funzionare anche senza chiave.
            </p>
          </div>
        ) : (
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {s.account.map((a) => (
              <CardAccount key={a.nome} a={a} codice={codice} origine={origine} />
            ))}
          </div>
        )}

        <div className="mt-5 rounded-2xl border border-[var(--tbh-line)] p-4 text-sm">
          <p className="font-semibold">Webhook da creare su Stripe → Developers → Webhooks</p>
          <p className="mt-1 text-[var(--tbh-muted)]">
            Un endpoint per account:{" "}
            <code className="break-all text-[var(--tbh-neon)]">
              {origine}/api/webhooks/stripe-catalogo/&lt;nome-account&gt;
            </code>
            . Per l'account principale vanno bene anche su{" "}
            <code className="break-all">{origine}/api/webhooks/stripe</code>. Eventi:
          </p>
          <p className="mt-2 break-words font-mono text-[12px] text-[var(--tbh-gold)]">
            {s.eventiDaAttivare.join(" · ")}
          </p>
          <p className="mt-2 text-[11px] text-[var(--tbh-muted)]">
            La firma di ogni evento viene verificata; un evento ripetuto non crea doppioni. Ogni 6
            ore, alla prima apertura del negozio, parte anche una riconciliazione completa.
          </p>
        </div>

        <CollegaAccount codice={codice} principaleDaEnv={s.principaleDaEnv} />
      </section>

      {/* ── SCHEDE MANUALI CON LINK STRIPE ─────────────────────── */}
      <section className="tbh-card p-5 md:p-6">
        <h2 className="tbh-display tbh-h3">Schede del sito con Payment Link Stripe</h2>
        <p className="mt-1 text-sm text-[var(--tbh-muted)]">
          Alla prima sincronizzazione si agganciano da sole al Product che contiene il loro link
          (niente schede doppie). Altrimenti si associano per ID qui sotto.
        </p>
        <ul className="mt-4 grid gap-2">
          {s.manuali.map((m) => (
            <li
              key={m.slug}
              className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-[var(--tbh-line)] px-3 py-2.5 text-sm"
            >
              <Link href={`/shop/p/${m.slug}`} className="min-w-0 font-semibold hover:text-[var(--tbh-neon)]">
                {m.titolo}
              </Link>
              <span className="text-[var(--tbh-muted)]">{euro(m.priceCents)} sul sito</span>
              <span className={m.associata ? "text-[var(--tbh-neon)]" : "text-[var(--tbh-gold)]"}>
                {m.associata ? "Associata a Stripe" : "Prezzo da confermare con la sync"}
              </span>
            </li>
          ))}
        </ul>
        <AssociaPerId codice={codice} s={s} />
      </section>

      {/* ── PRODOTTI SINCRONIZZATI ─────────────────────────────── */}
      <section>
        <h2 className="tbh-display tbh-h3 mb-3">
          Prodotti da Stripe <span className="text-[var(--tbh-muted)] text-base">({s.prodotti.length})</span>
        </h2>
        {s.prodotti.length === 0 ? (
          <p className="tbh-card p-5 text-sm text-[var(--tbh-muted)]">
            Nessun prodotto importato: la prima importazione parte appena un account è collegato.
          </p>
        ) : (
          <div className="grid gap-4">
            {s.prodotti.map((p) => (
              <CardProdotto key={p.id} p={p} codice={codice} />
            ))}
          </div>
        )}
      </section>

      {/* ── ULTIMI EVENTI ──────────────────────────────────────── */}
      <section className="tbh-card p-5 md:p-6">
        <h2 className="tbh-display tbh-h3">Ultimi eventi webhook</h2>
        {s.ultimiEventi.length === 0 ? (
          <p className="mt-2 text-sm text-[var(--tbh-muted)]">Nessun evento ricevuto.</p>
        ) : (
          <ul className="mt-3 grid gap-1 text-[12px]">
            {s.ultimiEventi.map((e) => (
              <li key={e.id} className="flex flex-wrap gap-x-3 break-all">
                <span className="text-[var(--tbh-muted)]">{data(e.quando)}</span>
                <span>{e.account}</span>
                <span className="text-[var(--tbh-gold)]">{e.tipo}</span>
                <span>{e.esito}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function CardAccount({ a, codice, origine }: { a: Stato["account"][number]; codice: string; origine: string }) {
  const sync = useSincronizzaOra();
  const scollega = useScollegaAccount();
  return (
    <div className="rounded-2xl border border-[var(--tbh-line)] p-4 text-sm">
      <div className="flex flex-wrap items-center gap-2">
        <span className="tbh-display text-lg">{a.nome}</span>
        <span className="rounded-full border border-[var(--tbh-line)] px-2 py-0.5 text-[10px] uppercase">
          {a.modalita}
        </span>
        <span className="text-[11px] text-[var(--tbh-muted)]">
          {a.origine === "env" ? "chiave sul server (.env)" : "collegato dal pannello"}
        </span>
      </div>
      {a.nomeStripe && <p className="mt-1">{a.nomeStripe}</p>}
      <p className="mt-1 font-mono text-[12px] text-[var(--tbh-muted)]">{a.chiave}</p>
      <p className="mt-1">
        Webhook:{" "}
        {a.webhookConfigurato ? (
          <span className="text-[var(--tbh-neon)]">segreto presente</span>
        ) : (
          <span className="text-[var(--tbh-gold)]">segreto mancante — solo sync manuale e periodica</span>
        )}
      </p>
      <p className="mt-1 break-all text-[12px]">
        <span className="text-[var(--tbh-muted)]">Indirizzo: </span>
        {origine}
        {a.percorsoWebhook}
      </p>
      <p className="mt-1">Ultima sincronizzazione: {data(a.ultimaSync)}</p>
      {a.ultimoErrore && <p className="mt-1 text-red-400 break-words">Errore: {a.ultimoErrore}</p>}
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => sync.mutate({ codice, account: a.nome })}
          disabled={sync.isPending}
          className="inline-flex items-center gap-2 rounded-full border border-[var(--tbh-line)] px-4 py-2 text-xs font-semibold hover:border-[var(--tbh-neon)]"
        >
          {sync.isPending ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
          Sincronizza questo account
        </button>
        {a.origine === "pannello" && (
          <button
            type="button"
            onClick={() => {
              if (window.confirm(`Scollegare «${a.nome}»? Le sue schede escono dalla vendita.`))
                scollega.mutate({ codice, nome: a.nome });
            }}
            className="inline-flex items-center gap-2 rounded-full border border-red-400/50 px-4 py-2 text-xs font-semibold text-red-300"
          >
            <Unplug size={14} /> Scollega
          </button>
        )}
      </div>
      <Errore e={sync.error ?? scollega.error} />
    </div>
  );
}

function CollegaAccount({ codice, principaleDaEnv }: { codice: string; principaleDaEnv: boolean }) {
  const collega = useCollegaAccount();
  const [nome, setNome] = useState(principaleDaEnv ? "" : "principale");
  const [chiave, setChiave] = useState("");
  const [whsec, setWhsec] = useState("");
  return (
    <form
      className="mt-5 grid gap-3 rounded-2xl border border-[var(--tbh-line)] p-4"
      onSubmit={(e) => {
        e.preventDefault();
        collega.mutate(
          { codice, nome, chiave, segretoWebhook: whsec || null },
          {
            onSuccess: () => {
              setChiave("");
              setWhsec("");
            },
          },
        );
      }}
    >
      <p className="font-semibold">Collega un account Stripe autorizzato</p>
      <p className="text-[11px] text-[var(--tbh-muted)]">
        La chiave viene verificata su Stripe e resta sul server: questa pagina non la mostra più.
        Subito dopo parte la prima importazione dei prodotti attivi.
      </p>
      <div className="grid gap-3 md:grid-cols-3">
        <label className="grid gap-1 text-xs">
          Nome dell'account
          <input className={campo} value={nome} onChange={(e) => setNome(e.target.value)} placeholder="es. formazione" />
        </label>
        <label className="grid gap-1 text-xs">
          Chiave segreta (sk_… o rk_…)
          <input
            className={campo}
            type="password"
            autoComplete="off"
            value={chiave}
            onChange={(e) => setChiave(e.target.value)}
          />
        </label>
        <label className="grid gap-1 text-xs">
          Segreto webhook (whsec_…, facoltativo)
          <input
            className={campo}
            type="password"
            autoComplete="off"
            value={whsec}
            onChange={(e) => setWhsec(e.target.value)}
          />
        </label>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={collega.isPending || !nome || chiave.length < 20}
          className="tbh-neon-btn inline-flex items-center gap-2 px-5 py-2.5 text-sm disabled:opacity-50"
        >
          {collega.isPending ? <Loader2 size={16} className="animate-spin" /> : <Link2 size={16} />}
          Collega e importa
        </button>
        {collega.isSuccess && (
          <span className="inline-flex items-center gap-1 text-sm text-[var(--tbh-neon)]">
            <CheckCircle2 size={16} /> Account collegato.
          </span>
        )}
      </div>
      <Errore e={collega.error} />
    </form>
  );
}

function AssociaPerId({ codice, s }: { codice: string; s: Stato }) {
  const associa = useAssociaStripe();
  const [account, setAccount] = useState(s.account[0]?.nome ?? "");
  const [productId, setProductId] = useState("");
  const [slugSito, setSlugSito] = useState("");
  const spento = s.account.length === 0;
  return (
    <form
      className="mt-5 grid gap-3 rounded-2xl border border-[var(--tbh-line)] p-4"
      onSubmit={(e) => {
        e.preventDefault();
        associa.mutate({ codice, account, stripeProductId: productId.trim(), slugSito: slugSito || null });
      }}
    >
      <p className="font-semibold">Associa una scheda del sito a un Product Stripe (per ID)</p>
      <div className="grid gap-3 md:grid-cols-3">
        <label className="grid gap-1 text-xs">
          Account
          <select className={campo} value={account} onChange={(e) => setAccount(e.target.value)} disabled={spento}>
            {s.account.map((a) => (
              <option key={a.nome} value={a.nome}>
                {a.nome}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-1 text-xs">
          ID del Product
          <input
            className={campo}
            value={productId}
            onChange={(e) => setProductId(e.target.value)}
            placeholder="prod_…"
            disabled={spento}
          />
        </label>
        <label className="grid gap-1 text-xs">
          Scheda del sito
          <select className={campo} value={slugSito} onChange={(e) => setSlugSito(e.target.value)} disabled={spento}>
            <option value="">— nessuna: scheda generata da Stripe —</option>
            {s.schedeSito.map((x) => (
              <option key={x.slug} value={x.slug}>
                {x.titolo}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={spento || associa.isPending || !/^prod_/.test(productId.trim())}
          className="tbh-neon-btn inline-flex items-center gap-2 px-5 py-2.5 text-sm disabled:opacity-50"
        >
          {associa.isPending ? <Loader2 size={16} className="animate-spin" /> : <Link2 size={16} />}
          Associa
        </button>
        {spento && <span className="text-[11px] text-[var(--tbh-muted)]">Serve un account collegato.</span>}
        {associa.isSuccess && <span className="text-sm text-[var(--tbh-neon)]">Associazione salvata.</span>}
      </div>
      <Errore e={associa.error} />
    </form>
  );
}

function CardProdotto({ p, codice }: { p: RigaProdotto; codice: string }) {
  const salva = useSalvaEditorialeStripe();
  const [aperto, setAperto] = useState(false);
  const [categoria, setCategoria] = useState(p.categoria ?? "");
  const [testo, setTesto] = useState(p.testoEditoriale ?? "");
  const [extra, setExtra] = useState(p.immaginiExtra.join("\n"));
  const [condizioni, setCondizioni] = useState(p.condizioni ?? "");
  const [iva, setIva] = useState(p.ivaPercentuale === null ? "" : String(p.ivaPercentuale));
  const [ivaInclusa, setIvaInclusa] = useState(p.ivaInclusa ?? true);

  return (
    <article data-prodotto-stripe className="tbh-card p-4 md:p-5">
      <div className="grid gap-4 sm:grid-cols-[120px_1fr]">
        <div className="aspect-[4/3] w-full overflow-hidden rounded-xl border border-[var(--tbh-line)] bg-black/40 sm:w-[120px]">
          {p.immagine ? (
            <img src={p.immagine} alt={p.nomeStripe} loading="lazy" className="h-full w-full object-contain" />
          ) : (
            <span className="flex h-full items-center justify-center p-2 text-center text-[10px] text-[var(--tbh-muted)]">
              Immagine mancante
            </span>
          )}
        </div>
        <div className="min-w-0 text-sm">
          <div className="flex flex-wrap items-center gap-2">
            <Link href={`/shop/p/${p.slug}`} className="tbh-display text-lg hover:text-[var(--tbh-neon)] break-words">
              {p.nomeStripe}
            </Link>
            <BadgeStato stato={p.stato} />
          </div>
          <p className="mt-1 text-[12px] text-[var(--tbh-muted)] break-all">
            Origine: {p.origine} · account {p.account} · {p.stripeProductId} · {p.livemode ? "live" : "test"}
          </p>
          <p className="mt-1 text-[12px] text-[var(--tbh-muted)]">Ultima sincronizzazione: {data(p.ultimaSync)}</p>
          {p.errore && <p className="mt-1 text-red-400 break-words">Errore: {p.errore}</p>}
          {p.mancanti.length > 0 && p.stato !== "archiviato" && (
            <p className="mt-1 text-[var(--tbh-gold)]">Da completare: {p.mancanti.join(", ")}</p>
          )}
          {p.prezzoSitoCents !== null && p.varianti[0] && p.varianti[0].importoCents !== p.prezzoSitoCents && (
            <p className="mt-1 text-[var(--tbh-gold)]">
              Prezzo sul sito {euro(p.prezzoSitoCents)} diverso da Stripe: vale quello di Stripe.
            </p>
          )}
          <ul className="mt-2 grid gap-1">
            {p.varianti.map((v) => (
              <li key={v.priceId} className="break-words">
                {etichettaVariante(v)}{" "}
                <span className="text-[11px] text-[var(--tbh-muted)]">
                  · {v.priceId} · {v.paymentLink ? "Payment Link" : "Checkout Session dal server"}
                </span>
              </li>
            ))}
          </ul>
          <button
            type="button"
            onClick={() => setAperto((x) => !x)}
            className="mt-3 text-xs font-semibold uppercase tracking-wide text-[var(--tbh-neon)]"
          >
            {aperto ? "Chiudi" : "Testi e dati del sito"}
          </button>
        </div>
      </div>

      {aperto && (
        <form
          className="mt-4 grid gap-3 border-t border-[var(--tbh-line)] pt-4"
          onSubmit={(e) => {
            e.preventDefault();
            const n = iva.trim() === "" ? null : Number(iva);
            salva.mutate({
              codice,
              id: p.id,
              categoria: categoria || null,
              testoEditoriale: testo || null,
              immaginiExtra: extra
                .split("\n")
                .map((x) => x.trim())
                .filter(Boolean),
              condizioni: condizioni || null,
              ivaPercentuale: n !== null && Number.isFinite(n) ? n : null,
              ivaInclusa: n === null ? null : ivaInclusa,
            });
          }}
        >
          <div className="grid gap-3 md:grid-cols-2">
            <label className="grid gap-1 text-xs">
              Categoria del negozio
              <input className={campo} value={categoria} onChange={(e) => setCategoria(e.target.value)} placeholder="es. Formazione" />
            </label>
            <label className="grid gap-1 text-xs">
              IVA confermata (%) — vuoto = non mostrata
              <div className="flex flex-wrap items-center gap-3">
                <input className={`${campo} max-w-[120px]`} inputMode="numeric" value={iva} onChange={(e) => setIva(e.target.value)} />
                <label className="inline-flex items-center gap-2">
                  <input type="checkbox" checked={ivaInclusa} onChange={(e) => setIvaInclusa(e.target.checked)} />
                  prezzo IVA inclusa
                </label>
              </div>
            </label>
          </div>
          <label className="grid gap-1 text-xs">
            Testo della scheda (vuoto = descrizione di Stripe)
            <textarea className={campo} rows={4} value={testo} onChange={(e) => setTesto(e.target.value)} />
          </label>
          <label className="grid gap-1 text-xs">
            Immagini aggiuntive (un indirizzo https per riga)
            <textarea className={campo} rows={2} value={extra} onChange={(e) => setExtra(e.target.value)} />
          </label>
          <label className="grid gap-1 text-xs">
            Condizioni (una per riga)
            <textarea className={campo} rows={3} value={condizioni} onChange={(e) => setCondizioni(e.target.value)} />
          </label>
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="submit"
              disabled={salva.isPending}
              className="tbh-neon-btn inline-flex items-center gap-2 px-5 py-2.5 text-sm disabled:opacity-50"
            >
              {salva.isPending ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              Salva
            </button>
            {salva.isSuccess && <span className="text-sm text-[var(--tbh-neon)]">Salvato.</span>}
          </div>
          <Errore e={salva.error} />
        </form>
      )}
    </article>
  );
}
