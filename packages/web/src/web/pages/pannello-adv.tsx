import { useState } from "react";
import {
  AlertTriangle,
  BadgeCheck,
  CheckCircle2,
  CreditCard,
  Euro,
  Loader2,
  Plus,
  RefreshCw,
  Save,
  Trash2,
  Tv,
  Users,
} from "lucide-react";
import { Link } from "wouter";
import { SbloccoAllestimento, useCodiceAllestimento } from "../components/media-slot";
import { euro } from "../components/tiles";
import {
  useAdvAdminFidelity,
  useAdvAdminListino,
  useAdvAdminPratiche,
  useAdvAdminStato,
  useAggiornaPraticaAdv,
  useEliminaFidelityAdv,
  useSalvaAddonAdv,
  useSalvaFidelityAdv,
  useSalvaPacchettoAdv,
  useSincronizzaStripeAdv,
} from "../queries/adv";
import { ETICHETTE_STATO, STATI_PRATICA } from "../../api/data/adv-tv";
import type { StatoPratica } from "../../api/data/adv-tv";

type Scheda = "listino" | "addon" | "fidelity" | "pratiche" | "stripe";

const SCHEDE: [Scheda, string][] = [
  ["listino", "Listino e promo"],
  ["addon", "Servizi extra"],
  ["fidelity", "Registro Fidelity"],
  ["pratiche", "Pratiche e report"],
  ["stripe", "Stripe"],
];

/**
 * ADMIN → SHOP → TV & STREAMING ADV.
 *
 * Da qui Claudio cambia prezzi, promo, disponibilità, servizi extra, registro Fidelity,
 * stato delle pratiche e report senza toccare il codice. Ogni scrittura passa dal codice
 * di allestimento e viene verificata sul server (routes/adv-admin.ts).
 */
export default function PannelloAdvPage() {
  const { codice } = useCodiceAllestimento();
  const [scheda, setScheda] = useState<Scheda>("listino");

  return (
    <div className="mx-auto max-w-[1500px] px-4 md:px-8 py-10">
      {/* 28/09/2026 - ritorno al pannello unico di allestimento (audit BLOCCO 1):
          prima questo pannello era un'isola, si apriva solo scrivendo l'indirizzo. */}
      <Link
        href="/allestimento"
        className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-[var(--tbh-muted)] hover:text-[var(--tbh-neon)] mb-4"
      >
        ← Tutti i pannelli di allestimento
      </Link>
      <header className="tbh-rise mb-6">
        <p className="text-xs tracking-[0.25em] text-[var(--tbh-gold)] uppercase mb-2">
          Pannello riservato · Shop
        </p>
        <h1 className="tbh-display tbh-h1 flex items-center gap-3">
          <Tv className="text-[var(--tbh-neon)] shrink-0" size={32} /> TV &amp; Streaming ADV
        </h1>
        <p className="tbh-body text-[var(--tbh-muted)] max-w-3xl mt-3">
          Listino, promozioni, servizi extra, registro Fidelity, pratiche di campagna e
          collegamento Stripe. La pagina pubblica è{" "}
          <Link href="/tv-streaming-adv" className="text-[var(--tbh-neon)] underline">
            /tv-streaming-adv
          </Link>
          .
        </p>
      </header>

      {!codice ? (
        <SbloccoAllestimento />
      ) : (
        <>
          <StatoServizio codice={codice} />
          <nav className="flex flex-wrap gap-2 my-6">
            {SCHEDE.map(([k, etichetta]) => (
              <button
                key={k}
                type="button"
                onClick={() => setScheda(k)}
                className={`rounded-full border px-4 py-2 text-xs font-semibold ${
                  scheda === k
                    ? "border-[var(--tbh-neon)] bg-[var(--tbh-neon)]/15 text-[var(--tbh-neon)]"
                    : "border-white/15 text-[var(--tbh-muted)] hover:text-white"
                }`}
              >
                {etichetta}
              </button>
            ))}
          </nav>

          {scheda === "listino" && <SchedaListino codice={codice} />}
          {scheda === "addon" && <SchedaAddon codice={codice} />}
          {scheda === "fidelity" && <SchedaFidelity codice={codice} />}
          {scheda === "pratiche" && <SchedaPratiche codice={codice} />}
          {scheda === "stripe" && <SchedaStripe codice={codice} />}
        </>
      )}
    </div>
  );
}

/* ————— STATO DEL SERVIZIO ————— */

function StatoServizio({ codice }: { codice: string }) {
  const stato = useAdvAdminStato(codice);
  if (!stato.data) return null;
  const d = stato.data;
  return (
    <div className="grid gap-3 md:grid-cols-3">
      <Cartellino
        ok={d.stripeConfigurato}
        titolo="Chiave Stripe"
        buono={`Collegata · modalità ${d.modalita}`}
        cattivo="Manca STRIPE_SECRET_KEY: nessun pagamento con carta è possibile."
      />
      <Cartellino
        ok={d.webhookConfigurato}
        titolo="Webhook Stripe"
        buono="Segreto presente: gli incassi aggiornano le pratiche da soli."
        cattivo="Manca STRIPE_WEBHOOK_SECRET: /api/webhooks/stripe risponde 503."
      />
      <Cartellino
        ok={d.valido}
        titolo="Codice di allestimento"
        buono="Codice valido su questo dispositivo."
        cattivo="Codice non riconosciuto dal server."
      />
    </div>
  );
}

function Cartellino({
  ok,
  titolo,
  buono,
  cattivo,
}: {
  ok: boolean;
  titolo: string;
  buono: string;
  cattivo: string;
}) {
  return (
    <div
      className={`rounded-2xl border p-4 ${
        ok
          ? "border-[var(--tbh-neon)]/40 bg-[var(--tbh-neon)]/[0.07]"
          : "border-amber-400/40 bg-amber-400/[0.07]"
      }`}
    >
      <p className="flex items-center gap-2 text-sm font-semibold text-white">
        {ok ? (
          <CheckCircle2 size={16} className="text-[var(--tbh-neon)]" />
        ) : (
          <AlertTriangle size={16} className="text-amber-300" />
        )}
        {titolo}
      </p>
      <p className="mt-1 text-xs text-[var(--tbh-muted)]">{ok ? buono : cattivo}</p>
    </div>
  );
}

/* ————— LISTINO ————— */

function SchedaListino({ codice }: { codice: string }) {
  const listino = useAdvAdminListino(codice);
  if (listino.isPending) return <Attesa />;
  if (!listino.data) return <Errore e={listino.error} />;

  return (
    <div className="grid gap-5">
      <p className="text-xs text-[var(--tbh-muted)]">
        Prezzi in centesimi di euro, IVA inclusa (come sulla slide ufficiale). La promo vale solo
        dentro le sue date: scaduta, il sito torna da solo al prezzo pieno. Il prezzo Fidelity resta
        visibile solo ai clienti verificati sul registro.
      </p>
      {listino.data.pacchetti.map((p) => (
        <FormPacchetto key={p.slug} codice={codice} p={p} />
      ))}
    </div>
  );
}

type PacchettoAdmin = NonNullable<
  ReturnType<typeof useAdvAdminListino>["data"]
>["pacchetti"][number];

function FormPacchetto({ codice, p }: { codice: string; p: PacchettoAdmin }) {
  const salva = useSalvaPacchettoAdv();
  const [v, setV] = useState({
    titolo: p.titolo,
    descrizione: p.descrizione,
    pieno: String(p.pienoCents / 100),
    promo: p.promoCents ? String(p.promoCents / 100) : "",
    promoDal: p.promoDal ?? "",
    promoAl: p.promoAl ?? "",
    fidelity: p.fidelityCents ? String(p.fidelityCents / 100) : "",
    iva: String(p.ivaAliquota),
    cashback: String(p.cashbackPercento),
    disponibile: p.disponibile,
    immagineUrl: p.immagineUrl ?? "",
  });

  const cents = (s: string) => Math.round(Number(s.replace(",", ".")) * 100);

  function invia(e: React.FormEvent) {
    e.preventDefault();
    salva.mutate({
      codice,
      slug: p.slug,
      titolo: v.titolo.trim() || undefined,
      descrizione: v.descrizione.trim() || undefined,
      immagineUrl: v.immagineUrl.trim() || null,
      pienoCents: cents(v.pieno),
      promoCents: v.promo.trim() ? cents(v.promo) : null,
      promoDal: v.promoDal.trim() || undefined,
      promoAl: v.promoAl.trim() || undefined,
      fidelityCents: v.fidelity.trim() ? cents(v.fidelity) : null,
      ivaAliquota: Number(v.iva),
      disponibile: v.disponibile,
      cashbackPercento: Number(v.cashback),
    });
  }

  return (
    <form
      onSubmit={invia}
      className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 grid gap-4"
    >
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <div>
          <h3 className="tbh-display text-lg">{p.titolo}</h3>
          <p className="font-mono text-[11px] text-[var(--tbh-muted)]">
            {p.sku} · /{p.slug}
          </p>
        </div>
        <p className="text-xs text-[var(--tbh-muted)]">
          In vigore ora:{" "}
          <strong className="text-white">
            {euro(p.promoAttiva && p.promoCents ? p.promoCents : p.pienoCents)}
          </strong>{" "}
          {p.promoAttiva ? "(promo attiva)" : "(prezzo pieno)"}
          {p.daPannello ? " · modificato dal pannello" : " · valori della slide"}
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <Campo etichetta="Titolo">
          <input aria-label="Titolo"
            value={v.titolo}
            onChange={(e) => setV({ ...v, titolo: e.target.value })}
            className={INPUT}
          />
        </Campo>
        <Campo etichetta="Immagine (URL, facoltativa)">
          <input aria-label="Immagine (URL, facoltativa)"
            value={v.immagineUrl}
            onChange={(e) => setV({ ...v, immagineUrl: e.target.value })}
            placeholder="/listini/tv-streaming-adv.jpg"
            className={INPUT}
          />
        </Campo>
      </div>

      <Campo etichetta="Descrizione">
        <textarea aria-label="Descrizione"
          value={v.descrizione}
          onChange={(e) => setV({ ...v, descrizione: e.target.value })}
          rows={3}
          className={INPUT}
        />
      </Campo>

      <div className="grid gap-3 md:grid-cols-3">
        <Campo etichetta="Prezzo pieno (€, IVA incl.)">
          <input aria-label="Prezzo pieno (€, IVA incl.)"
            value={v.pieno}
            onChange={(e) => setV({ ...v, pieno: e.target.value })}
            inputMode="decimal"
            className={INPUT}
          />
        </Campo>
        <Campo etichetta="Prezzo promo (€) — vuoto = nessuna promo">
          <input aria-label="Prezzo promo (€) — vuoto = nessuna promo"
            value={v.promo}
            onChange={(e) => setV({ ...v, promo: e.target.value })}
            inputMode="decimal"
            className={INPUT}
          />
        </Campo>
        <Campo etichetta="Prezzo Fidelity (€)">
          <input aria-label="Prezzo Fidelity (€)"
            value={v.fidelity}
            onChange={(e) => setV({ ...v, fidelity: e.target.value })}
            inputMode="decimal"
            className={INPUT}
          />
        </Campo>
      </div>

      <div className="grid gap-3 md:grid-cols-4">
        <Campo etichetta="Promo dal">
          <input aria-label="Promo dal"
            type="date"
            value={v.promoDal}
            onChange={(e) => setV({ ...v, promoDal: e.target.value })}
            className={INPUT}
          />
        </Campo>
        <Campo etichetta="Promo al">
          <input aria-label="Promo al"
            type="date"
            value={v.promoAl}
            onChange={(e) => setV({ ...v, promoAl: e.target.value })}
            className={INPUT}
          />
        </Campo>
        <Campo etichetta="IVA %">
          <input aria-label="IVA %"
            value={v.iva}
            onChange={(e) => setV({ ...v, iva: e.target.value })}
            inputMode="numeric"
            className={INPUT}
          />
        </Campo>
        <Campo etichetta="Cashback TBH %">
          <input aria-label="Cashback TBH %"
            value={v.cashback}
            onChange={(e) => setV({ ...v, cashback: e.target.value })}
            inputMode="numeric"
            className={INPUT}
          />
        </Campo>
      </div>

      <label className="flex items-center gap-2 text-sm text-white">
        <input
          aria-label="Acquistabile online"
          type="checkbox"
          checked={v.disponibile}
          onChange={(e) => setV({ ...v, disponibile: e.target.checked })}
        />
        Acquistabile online (se spento, la scheda resta visibile ma rimanda a WhatsApp)
      </label>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={salva.isPending}
          className="inline-flex items-center gap-2 rounded-xl bg-[var(--tbh-neon)] px-5 py-2 text-sm font-bold text-black disabled:opacity-60"
        >
          {salva.isPending ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          Salva pacchetto
        </button>
        {salva.isSuccess && !salva.isPending && (
          <span className="text-xs text-[var(--tbh-neon)]">Salvato.</span>
        )}
        {salva.error && <MessaggioErrore e={salva.error} />}
        <span className="text-[11px] text-[var(--tbh-muted)]">
          Stripe: {p.stripeProductId ?? "non ancora sincronizzato"}
        </span>
      </div>
    </form>
  );
}

/* ————— SERVIZI EXTRA ————— */

function SchedaAddon({ codice }: { codice: string }) {
  const listino = useAdvAdminListino(codice);
  const salva = useSalvaAddonAdv();
  const [nuovo, setNuovo] = useState({ codiceAddon: "", nome: "", descrizione: "", prezzo: "" });

  if (listino.isPending) return <Attesa />;
  if (!listino.data) return <Errore e={listino.error} />;

  return (
    <div className="grid gap-5">
      <p className="text-xs text-[var(--tbh-muted)]">
        Sono le voci del passaggio «Servizi extra» del configuratore. Il prezzo è IVA inclusa e
        finisce nel carrello Stripe come riga separata.
      </p>

      {listino.data.addon.map((a) => (
        <FormAddon key={a.codice} codice={codice} a={a} />
      ))}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          salva.mutate(
            {
              codice,
              codiceAddon: nuovo.codiceAddon.trim(),
              nome: nuovo.nome.trim(),
              descrizione: nuovo.descrizione.trim() || undefined,
              prezzoCents: Math.round(Number(nuovo.prezzo.replace(",", ".")) * 100),
              attivo: true,
            },
            {
              onSuccess: () =>
                setNuovo({ codiceAddon: "", nome: "", descrizione: "", prezzo: "" }),
            },
          );
        }}
        className="rounded-2xl border border-dashed border-white/20 bg-white/[0.02] p-5 grid gap-3"
      >
        <p className="text-sm font-semibold text-white flex items-center gap-2">
          <Plus size={16} /> Nuovo servizio extra
        </p>
        <div className="grid gap-3 md:grid-cols-4">
          <Campo etichetta="Codice (es. SOCIAL)">
            <input aria-label="Codice (es. SOCIAL)"
              value={nuovo.codiceAddon}
              onChange={(e) => setNuovo({ ...nuovo, codiceAddon: e.target.value })}
              className={INPUT}
            />
          </Campo>
          <Campo etichetta="Nome">
            <input aria-label="Nome"
              value={nuovo.nome}
              onChange={(e) => setNuovo({ ...nuovo, nome: e.target.value })}
              className={INPUT}
            />
          </Campo>
          <Campo etichetta="Prezzo (€)">
            <input aria-label="Prezzo (€)"
              value={nuovo.prezzo}
              onChange={(e) => setNuovo({ ...nuovo, prezzo: e.target.value })}
              inputMode="decimal"
              className={INPUT}
            />
          </Campo>
          <Campo etichetta="Descrizione">
            <input aria-label="Descrizione"
              value={nuovo.descrizione}
              onChange={(e) => setNuovo({ ...nuovo, descrizione: e.target.value })}
              className={INPUT}
            />
          </Campo>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={salva.isPending}
            className="inline-flex items-center gap-2 rounded-xl border border-white/20 px-4 py-2 text-xs font-semibold text-white disabled:opacity-60"
          >
            <Plus size={14} /> Aggiungi
          </button>
          {salva.error && <MessaggioErrore e={salva.error} />}
        </div>
      </form>
    </div>
  );
}

type AddonAdmin = NonNullable<ReturnType<typeof useAdvAdminListino>["data"]>["addon"][number];

function FormAddon({ codice, a }: { codice: string; a: AddonAdmin }) {
  const salva = useSalvaAddonAdv();
  const [v, setV] = useState({
    nome: a.nome,
    descrizione: a.descrizione,
    prezzo: String(a.prezzoCents / 100),
    attivo: a.attivo,
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        salva.mutate({
          codice,
          codiceAddon: a.codice,
          nome: v.nome.trim(),
          descrizione: v.descrizione.trim() || undefined,
          prezzoCents: Math.round(Number(v.prezzo.replace(",", ".")) * 100),
          attivo: v.attivo,
        });
      }}
      className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 grid gap-3"
    >
      <p className="font-mono text-[11px] text-[var(--tbh-muted)]">{a.codice}</p>
      <div className="grid gap-3 md:grid-cols-3">
        <Campo etichetta="Nome">
          <input aria-label="Nome"
            value={v.nome}
            onChange={(e) => setV({ ...v, nome: e.target.value })}
            className={INPUT}
          />
        </Campo>
        <Campo etichetta="Prezzo (€, IVA incl.)">
          <input aria-label="Prezzo (€, IVA incl.)"
            value={v.prezzo}
            onChange={(e) => setV({ ...v, prezzo: e.target.value })}
            inputMode="decimal"
            className={INPUT}
          />
        </Campo>
        <Campo etichetta="Descrizione">
          <input aria-label="Descrizione"
            value={v.descrizione}
            onChange={(e) => setV({ ...v, descrizione: e.target.value })}
            className={INPUT}
          />
        </Campo>
      </div>
      <div className="flex flex-wrap items-center gap-4">
        <label className="flex items-center gap-2 text-sm text-white">
          <input
            aria-label="Attivo nel configuratore"
            type="checkbox"
            checked={v.attivo}
            onChange={(e) => setV({ ...v, attivo: e.target.checked })}
          />
          Attivo nel configuratore
        </label>
        <button
          type="submit"
          disabled={salva.isPending}
          className="inline-flex items-center gap-2 rounded-xl bg-[var(--tbh-neon)] px-4 py-2 text-xs font-bold text-black disabled:opacity-60"
        >
          <Save size={14} /> Salva
        </button>
        {salva.isSuccess && !salva.isPending && (
          <span className="text-xs text-[var(--tbh-neon)]">Salvato.</span>
        )}
        {salva.error && <MessaggioErrore e={salva.error} />}
      </div>
    </form>
  );
}

/* ————— REGISTRO FIDELITY ————— */

function SchedaFidelity({ codice }: { codice: string }) {
  const elenco = useAdvAdminFidelity(codice);
  const salva = useSalvaFidelityAdv();
  const elimina = useEliminaFidelityAdv();
  const [n, setN] = useState({
    intestatario: "",
    codiceTbh: "",
    email: "",
    codiceFiscale: "",
    partitaIva: "",
    livello: "",
    scadenza: "",
    note: "",
  });

  return (
    <div className="grid gap-5">
      <p className="text-xs text-[var(--tbh-muted)]">
        Il prezzo Fidelity si ottiene solo se il cliente è in questo registro: il sito non accetta
        auto-dichiarazioni e non legge nulla dall'indirizzo del browser. Serve almeno un dato
        verificabile fra email, codice fiscale, partita IVA e codice TBH.
      </p>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          salva.mutate(
            {
              codice,
              intestatario: n.intestatario.trim(),
              codiceTbh: n.codiceTbh.trim() || undefined,
              email: n.email.trim() || undefined,
              codiceFiscale: n.codiceFiscale.trim() || undefined,
              partitaIva: n.partitaIva.trim() || undefined,
              livello: n.livello.trim() || undefined,
              scadenza: n.scadenza.trim() || undefined,
              note: n.note.trim() || undefined,
              cashback: true,
              attivo: true,
            },
            {
              onSuccess: () =>
                setN({
                  intestatario: "",
                  codiceTbh: "",
                  email: "",
                  codiceFiscale: "",
                  partitaIva: "",
                  livello: "",
                  scadenza: "",
                  note: "",
                }),
            },
          );
        }}
        className="rounded-2xl border border-dashed border-white/20 bg-white/[0.02] p-5 grid gap-3"
      >
        <p className="text-sm font-semibold text-white flex items-center gap-2">
          <Users size={16} /> Nuovo cliente fidelizzato
        </p>
        <div className="grid gap-3 md:grid-cols-3">
          <Campo etichetta="Intestatario">
            <input aria-label="Intestatario"
              value={n.intestatario}
              onChange={(e) => setN({ ...n, intestatario: e.target.value })}
              className={INPUT}
            />
          </Campo>
          <Campo etichetta="Email">
            <input aria-label="Email"
              value={n.email}
              onChange={(e) => setN({ ...n, email: e.target.value })}
              className={INPUT}
            />
          </Campo>
          <Campo etichetta="Codice TBH">
            <input aria-label="Codice TBH"
              value={n.codiceTbh}
              onChange={(e) => setN({ ...n, codiceTbh: e.target.value })}
              className={INPUT}
            />
          </Campo>
          <Campo etichetta="Codice fiscale">
            <input aria-label="Codice fiscale"
              value={n.codiceFiscale}
              onChange={(e) => setN({ ...n, codiceFiscale: e.target.value })}
              className={INPUT}
            />
          </Campo>
          <Campo etichetta="Partita IVA">
            <input aria-label="Partita IVA"
              value={n.partitaIva}
              onChange={(e) => setN({ ...n, partitaIva: e.target.value })}
              className={INPUT}
            />
          </Campo>
          <Campo etichetta="Livello TBH">
            <input aria-label="Livello TBH"
              value={n.livello}
              onChange={(e) => setN({ ...n, livello: e.target.value })}
              className={INPUT}
            />
          </Campo>
          <Campo etichetta="Scadenza (facoltativa)">
            <input aria-label="Scadenza (facoltativa)"
              type="date"
              value={n.scadenza}
              onChange={(e) => setN({ ...n, scadenza: e.target.value })}
              className={INPUT}
            />
          </Campo>
          <Campo etichetta="Note">
            <input aria-label="Note"
              value={n.note}
              onChange={(e) => setN({ ...n, note: e.target.value })}
              className={INPUT}
            />
          </Campo>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={salva.isPending}
            className="inline-flex items-center gap-2 rounded-xl bg-[var(--tbh-neon)] px-4 py-2 text-xs font-bold text-black disabled:opacity-60"
          >
            <Plus size={14} /> Iscrivi al registro
          </button>
          {salva.error && <MessaggioErrore e={salva.error} />}
        </div>
      </form>

      {elenco.isPending && <Attesa />}
      {elenco.data && elenco.data.righe.length === 0 && (
        <p className="text-sm text-[var(--tbh-muted)]">
          Registro vuoto: per ora nessun cliente ha diritto al prezzo Fidelity.
        </p>
      )}
      {elenco.data && elenco.data.righe.length > 0 && (
        <div className="overflow-x-auto rounded-2xl border border-white/10">
          <table className="w-full text-sm">
            <thead className="bg-white/[0.04] text-left text-xs uppercase tracking-wider text-[var(--tbh-muted)]">
              <tr>
                <th className="px-3 py-3">Intestatario</th>
                <th className="px-3 py-3">Riferimenti</th>
                <th className="px-3 py-3">Livello</th>
                <th className="px-3 py-3">Cashback</th>
                <th className="px-3 py-3">Scadenza</th>
                <th className="px-3 py-3">Stato</th>
                <th className="px-3 py-3">
                  <span className="sr-only">Azioni</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {elenco.data.righe.map((r) => (
                <tr key={r.id} className="border-t border-white/10">
                  <td className="px-3 py-3 text-white">{r.intestatario}</td>
                  <td className="px-3 py-3 text-xs text-[var(--tbh-muted)]">
                    {[r.email, r.codiceTbh, r.codiceFiscale, r.partitaIva]
                      .filter(Boolean)
                      .join(" · ") || "—"}
                  </td>
                  <td className="px-3 py-3 text-xs">{r.livello ?? "—"}</td>
                  <td className="px-3 py-3 text-xs">{r.cashback === 1 ? "Sì" : "No"}</td>
                  <td className="px-3 py-3 text-xs">{r.scadenza ?? "senza scadenza"}</td>
                  <td className="px-3 py-3 text-xs">
                    {r.attivo === 1 ? (
                      <span className="text-[var(--tbh-neon)]">attivo</span>
                    ) : (
                      <span className="text-[var(--tbh-muted)]">sospeso</span>
                    )}
                  </td>
                  <td className="px-3 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => elimina.mutate({ codice, id: r.id })}
                      className="inline-flex items-center gap-1 text-xs text-red-300 hover:text-red-200"
                    >
                      <Trash2 size={13} /> Togli
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* ————— PRATICHE ————— */

function SchedaPratiche({ codice }: { codice: string }) {
  const pratiche = useAdvAdminPratiche(codice);
  if (pratiche.isPending) return <Attesa />;
  if (!pratiche.data) return <Errore e={pratiche.error} />;
  if (pratiche.data.righe.length === 0)
    return (
      <p className="text-sm text-[var(--tbh-muted)]">
        Nessuna pratica: non è ancora arrivato nessun ordine TV &amp; Streaming ADV.
      </p>
    );

  return (
    <div className="grid gap-5">
      <p className="text-xs text-[var(--tbh-muted)]">
        Il passaggio a «pagato» lo scrive il webhook Stripe, non il pannello e non la pagina di
        ritorno. Da qui si fa avanzare l'istruttoria, si carica il report e si gestisce il cashback.
      </p>
      {pratiche.data.righe.map((p) => (
        <FormPratica key={p.id} codice={codice} p={p} />
      ))}
    </div>
  );
}

type PraticaAdmin = NonNullable<ReturnType<typeof useAdvAdminPratiche>["data"]>["righe"][number];

function FormPratica({ codice, p }: { codice: string; p: PraticaAdmin }) {
  const aggiorna = useAggiornaPraticaAdv();
  const [v, setV] = useState({
    stato: p.stato as StatoPratica,
    nota: "",
    cashbackStato: p.cashbackStato,
    cashback: String(p.cashbackCents / 100),
    reportUrl: p.reportUrl ?? "",
    impression: "",
    deviceUnici: "",
    ctr: "",
    vtr: "",
    frequency: "",
    geografia: "",
    fasciaOraria: "",
  });

  const num = (s: string) => (s.trim() ? Number(s.replace(",", ".")) : undefined);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        aggiorna.mutate({
          codice,
          id: p.id,
          stato: v.stato,
          nota: v.nota.trim() || undefined,
          cashbackCents: Math.round(Number(v.cashback.replace(",", ".")) * 100),
          cashbackStato: v.cashbackStato as
            | "non-eleggibile"
            | "eleggibile"
            | "in-maturazione"
            | "maturato"
            | "utilizzato",
          reportUrl: v.reportUrl.trim() || null,
          report: {
            impression: num(v.impression),
            deviceUnici: num(v.deviceUnici),
            ctr: num(v.ctr),
            vtr: num(v.vtr),
            frequency: num(v.frequency),
            geografia: v.geografia.trim() || undefined,
            fasciaOraria: v.fasciaOraria.trim() || undefined,
          },
        });
      }}
      className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 grid gap-4"
    >
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <div>
          <p className="font-mono text-xs text-white">{p.numeroOrdine}</p>
          <p className="font-mono text-[11px] text-[var(--tbh-muted)]">{p.protocollo}</p>
        </div>
        <p className="text-xs text-[var(--tbh-muted)]">
          {p.pacchettoTitolo} · {euro(p.lordoCents)} IVA incl. · fascia {p.fascia}
          {p.fidelityVerificata === 1 && (
            <span className="ml-2 inline-flex items-center gap-1 text-[var(--tbh-gold)]">
              <BadgeCheck size={12} /> Fidelity verificata
            </span>
          )}
        </p>
      </div>

      <p className="text-xs text-[var(--tbh-muted)]">
        {p.clienteNome} · {p.clienteEmail}
        {p.clienteTelefono ? ` · ${p.clienteTelefono}` : ""} · materiali{" "}
        {p.materiali === "tbh" ? "da realizzare TBH" : "del cliente"}
        {p.durataSpot ? ` · ${p.durataSpot}s` : ""}
      </p>

      <div className="grid gap-3 md:grid-cols-3">
        <Campo etichetta="Stato pratica">
          <select aria-label="Stato pratica"
            value={v.stato}
            onChange={(e) => setV({ ...v, stato: e.target.value as StatoPratica })}
            className={INPUT}
          >
            {STATI_PRATICA.map((s) => (
              <option key={s} value={s} className="bg-black">
                {ETICHETTE_STATO[s]}
              </option>
            ))}
          </select>
        </Campo>
        <Campo etichetta="Cashback TBH (€)">
          <input aria-label="Cashback TBH (€)"
            value={v.cashback}
            onChange={(e) => setV({ ...v, cashback: e.target.value })}
            inputMode="decimal"
            className={INPUT}
          />
        </Campo>
        <Campo etichetta="Stato cashback">
          <select aria-label="Stato cashback"
            value={v.cashbackStato}
            onChange={(e) => setV({ ...v, cashbackStato: e.target.value })}
            className={INPUT}
          >
            {["non-eleggibile", "eleggibile", "in-maturazione", "maturato", "utilizzato"].map(
              (s) => (
                <option key={s} value={s} className="bg-black">
                  {s}
                </option>
              ),
            )}
          </select>
        </Campo>
      </div>

      <Campo etichetta="Nota per lo storico (facoltativa)">
        <input aria-label="Nota per lo storico (facoltativa)"
          value={v.nota}
          onChange={(e) => setV({ ...v, nota: e.target.value })}
          className={INPUT}
        />
      </Campo>

      <details className="rounded-xl border border-white/10 p-3">
        <summary className="cursor-pointer text-xs font-semibold text-[var(--tbh-gold)]">
          Report di campagna (KPI che il cliente vede in «Le mie campagne»)
        </summary>
        <div className="mt-3 grid gap-3 md:grid-cols-4">
          <Campo etichetta="Impression">
            <input aria-label="Impression"
              value={v.impression}
              onChange={(e) => setV({ ...v, impression: e.target.value })}
              inputMode="numeric"
              className={INPUT}
            />
          </Campo>
          <Campo etichetta="Device unici">
            <input aria-label="Device unici"
              value={v.deviceUnici}
              onChange={(e) => setV({ ...v, deviceUnici: e.target.value })}
              inputMode="numeric"
              className={INPUT}
            />
          </Campo>
          <Campo etichetta="CTR %">
            <input aria-label="CTR %"
              value={v.ctr}
              onChange={(e) => setV({ ...v, ctr: e.target.value })}
              inputMode="decimal"
              className={INPUT}
            />
          </Campo>
          <Campo etichetta="VTR %">
            <input aria-label="VTR %"
              value={v.vtr}
              onChange={(e) => setV({ ...v, vtr: e.target.value })}
              inputMode="decimal"
              className={INPUT}
            />
          </Campo>
          <Campo etichetta="Frequency">
            <input aria-label="Frequency"
              value={v.frequency}
              onChange={(e) => setV({ ...v, frequency: e.target.value })}
              inputMode="decimal"
              className={INPUT}
            />
          </Campo>
          <Campo etichetta="Geografia">
            <input aria-label="Geografia"
              value={v.geografia}
              onChange={(e) => setV({ ...v, geografia: e.target.value })}
              className={INPUT}
            />
          </Campo>
          <Campo etichetta="Fascia oraria">
            <input aria-label="Fascia oraria"
              value={v.fasciaOraria}
              onChange={(e) => setV({ ...v, fasciaOraria: e.target.value })}
              className={INPUT}
            />
          </Campo>
          <Campo etichetta="Link al report (PDF o pagina)">
            <input aria-label="Link al report (PDF o pagina)"
              value={v.reportUrl}
              onChange={(e) => setV({ ...v, reportUrl: e.target.value })}
              className={INPUT}
            />
          </Campo>
        </div>
      </details>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={aggiorna.isPending}
          className="inline-flex items-center gap-2 rounded-xl bg-[var(--tbh-neon)] px-5 py-2 text-sm font-bold text-black disabled:opacity-60"
        >
          {aggiorna.isPending ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Save size={16} />
          )}
          Aggiorna pratica
        </button>
        {aggiorna.isSuccess && !aggiorna.isPending && (
          <span className="text-xs text-[var(--tbh-neon)]">Aggiornata.</span>
        )}
        {aggiorna.error && <MessaggioErrore e={aggiorna.error} />}
      </div>
    </form>
  );
}

/* ————— STRIPE ————— */

function SchedaStripe({ codice }: { codice: string }) {
  const sincronizza = useSincronizzaStripeAdv();
  const listino = useAdvAdminListino(codice);

  return (
    <div className="grid gap-5">
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
        <p className="text-sm font-semibold text-white flex items-center gap-2 mb-2">
          <CreditCard size={16} /> Prodotti e prezzi su Stripe
        </p>
        <p className="text-xs text-[var(--tbh-muted)] mb-4">
          Ogni pacchetto ha un Product Stripe e tre Price veri (pieno, promo, Fidelity). Il browser
          non può inventare importi: la sessione di pagamento usa solo questi Price. Dopo ogni
          cambio di listino conviene risincronizzare — se un importo cambia, il vecchio Price viene
          archiviato e ricreato, perché su Stripe un Price non si modifica.
        </p>
        <button
          type="button"
          onClick={() => sincronizza.mutate({ codice })}
          disabled={sincronizza.isPending}
          className="inline-flex items-center gap-2 rounded-xl bg-[var(--tbh-neon)] px-5 py-2 text-sm font-bold text-black disabled:opacity-60"
        >
          {sincronizza.isPending ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <RefreshCw size={16} />
          )}
          Sincronizza ora
        </button>
        {sincronizza.error && (
          <div className="mt-3">
            <MessaggioErrore e={sincronizza.error} />
          </div>
        )}
        {sincronizza.data && (
          <ul className="mt-4 grid gap-1 text-xs">
            {sincronizza.data.esito.map((r, i) => (
              <li key={i} className={r.errore ? "text-amber-300" : "text-[var(--tbh-muted)]"}>
                {r.pacchetto} · {r.fascia} ·{" "}
                {r.errore ? r.errore : (r.priceId ?? "nessun prezzo")}
              </li>
            ))}
          </ul>
        )}
      </div>

      {listino.data && (
        <div className="overflow-x-auto rounded-2xl border border-white/10">
          <table className="w-full text-sm">
            <thead className="bg-white/[0.04] text-left text-xs uppercase tracking-wider text-[var(--tbh-muted)]">
              <tr>
                <th className="px-3 py-3">Pacchetto</th>
                <th className="px-3 py-3">Product</th>
                <th className="px-3 py-3">Price pieno</th>
                <th className="px-3 py-3">Price promo</th>
                <th className="px-3 py-3">Price Fidelity</th>
              </tr>
            </thead>
            <tbody>
              {listino.data.pacchetti.map((p) => (
                <tr key={p.slug} className="border-t border-white/10">
                  <td className="px-3 py-3 text-white">{p.titolo}</td>
                  <td className="px-3 py-3 font-mono text-[11px]">
                    {p.stripeProductId ?? "—"}
                  </td>
                  <td className="px-3 py-3 font-mono text-[11px]">
                    {p.stripePricePieno ?? "—"}
                  </td>
                  <td className="px-3 py-3 font-mono text-[11px]">
                    {p.stripePricePromo ?? "—"}
                  </td>
                  <td className="px-3 py-3 font-mono text-[11px]">
                    {p.stripePriceFidelity ?? "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="text-xs text-[var(--tbh-muted)] flex items-start gap-2">
        <Euro size={14} className="mt-0.5 shrink-0" />
        Sul pannello Stripe va registrato il webhook all'indirizzo{" "}
        <code className="text-white">/api/webhooks/stripe</code> con gli eventi
        checkout.session.completed, checkout.session.async_payment_succeeded,
        checkout.session.expired e charge.refunded.
      </p>
    </div>
  );
}

/* ————— pezzi comuni ————— */

const INPUT =
  "mt-1 w-full rounded-xl border border-white/15 bg-black/40 px-3 py-2 text-sm text-white outline-none focus:border-[var(--tbh-neon)]";

function Campo({ etichetta, children }: { etichetta: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-[11px] uppercase tracking-wider text-[var(--tbh-muted)]">
        {etichetta}
      </span>
      {children}
    </label>
  );
}

function Attesa() {
  return (
    <p className="flex items-center gap-2 text-sm text-[var(--tbh-muted)]">
      <Loader2 size={16} className="animate-spin" /> Sto leggendo i dati…
    </p>
  );
}

function Errore({ e }: { e: unknown }) {
  return (
    <p className="flex items-start gap-2 text-sm text-amber-300">
      <AlertTriangle size={16} className="mt-0.5 shrink-0" />
      {e instanceof Error ? e.message : "Il server non ha risposto. Controlla il codice."}
    </p>
  );
}

function MessaggioErrore({ e }: { e: unknown }) {
  return (
    <span className="text-xs text-amber-300">
      {e instanceof Error ? e.message : "Salvataggio non riuscito."}
    </span>
  );
}
