import { useEffect, useState } from "react";
import {
  AlertTriangle,
  BadgeCheck,
  BarChart3,
  CheckCircle2,
  FileText,
  Loader2,
  MessageCircle,
  Search,
  Wallet,
} from "lucide-react";
import { Link } from "wouter";
import { euro } from "../components/tiles";
import { useMieCampagne } from "../queries/adv";
import { ETICHETTE_FASCIA, ETICHETTE_STATO, STATI_PRATICA } from "../../api/data/adv-tv";
import type { Fasce, StatoPratica } from "../../api/data/adv-tv";

const WA = "https://wa.me/393792088524";

type Risposta = NonNullable<ReturnType<typeof useMieCampagne>["data"]>;
type Pratica = Risposta["pratiche"][number];

/**
 * LE MIE CAMPAGNE — area cliente delle campagne TV & Streaming ADV.
 *
 * Non c'è registrazione: si entra con l'email usata nell'ordine più un riferimento
 * reale (numero d'ordine o protocollo), come previsto dalla specifica del 15/09/2026.
 * Il controllo è tutto lato server: qui non si decide nulla, si mostra.
 */
export default function LeMieCampagnePage() {
  const cerca = useMieCampagne();
  const [email, setEmail] = useState("");
  const [riferimento, setRiferimento] = useState("");
  const [errore, setErrore] = useState<string | null>(null);

  const params = new URLSearchParams(window.location.search);
  const ordineDallUrl = params.get("ordine") ?? "";
  const appenaPagato = params.get("pagamento") === "ok";

  // Se si arriva dal ritorno di Stripe, il numero d'ordine è già nell'indirizzo:
  // si precompila il campo, ma l'email la mette il cliente (il dato non è pubblico).
  useEffect(() => {
    if (ordineDallUrl) setRiferimento(ordineDallUrl);
  }, [ordineDallUrl]);

  function invia(e: React.FormEvent) {
    e.preventDefault();
    setErrore(null);
    if (!email.includes("@")) {
      setErrore("Serve l'email indicata al momento dell'ordine.");
      return;
    }
    if (riferimento.trim().length < 6) {
      setErrore("Serve il numero d'ordine (TBH-TV-...) o il protocollo (ADV/.../...).");
      return;
    }
    cerca.mutate(
      { email: email.trim(), riferimento: riferimento.trim() },
      {
        onError: (err) =>
          setErrore(
            err instanceof Error
              ? err.message
              : "Non è stato possibile aprire l'area campagne. Riprova.",
          ),
      },
    );
  }

  const dati = cerca.data ?? null;

  return (
    <div className="mx-auto max-w-[1500px] px-4 md:px-8 py-10">
      <header className="tbh-rise mb-8">
        <p className="text-xs tracking-[0.25em] text-[var(--tbh-gold)] uppercase mb-2">
          Touch Business Holding · Area cliente
        </p>
        <h1 className="tbh-display tbh-h1 flex items-center gap-3">
          <BarChart3 className="text-[var(--tbh-neon)] shrink-0" size={34} /> Le mie campagne
        </h1>
        <p className="tbh-body text-[var(--tbh-muted)] max-w-3xl mt-3">
          Stato della pratica, materiali, pianificazione, report e Cashback TBH delle campagne
          TV &amp; Streaming ADV acquistate sul Touch Plaza Shop.
        </p>
      </header>

      {appenaPagato && (
        <div className="mb-6 rounded-2xl border border-[var(--tbh-neon)]/40 bg-[var(--tbh-neon)]/10 p-5">
          <p className="flex items-center gap-2 font-semibold text-[var(--tbh-neon)]">
            <CheckCircle2 size={18} /> Pagamento inviato
          </p>
          <p className="tbh-body text-sm text-[var(--tbh-muted)] mt-2">
            La conferma definitiva arriva dal circuito bancario: appena Stripe comunica l'incasso, la
            pratica passa automaticamente allo stato successivo. Se qui vedi ancora «In attesa di
            pagamento», aggiorna la pagina tra qualche minuto.
            {ordineDallUrl && (
              <>
                {" "}
                Il tuo numero d'ordine è <strong className="text-white">{ordineDallUrl}</strong>.
              </>
            )}
          </p>
        </div>
      )}

      {/* ————— ACCESSO ————— */}
      <form
        onSubmit={invia}
        className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 md:p-6 max-w-3xl"
      >
        <p className="text-sm font-semibold text-white mb-1">Apri la tua area campagne</p>
        <p className="text-xs text-[var(--tbh-muted)] mb-4">
          Email dell'ordine + numero d'ordine o protocollo, come li hai ricevuti nell'email di
          conferma. Con la sola email non si vede nulla: i dati di campagna non sono pubblici.
        </p>
        <div className="grid gap-3 md:grid-cols-2">
          <label className="block">
            <span className="text-xs text-[var(--tbh-muted)]">Email dell'ordine</span>
            <input
              aria-label="Email dell'ordine"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nome@azienda.it"
              className="mt-1 w-full rounded-xl border border-white/15 bg-black/40 px-3 py-2 text-sm text-white outline-none focus:border-[var(--tbh-neon)]"
            />
          </label>
          <label className="block">
            <span className="text-xs text-[var(--tbh-muted)]">Numero d'ordine o protocollo</span>
            <input
              aria-label="Numero d'ordine o protocollo"
              value={riferimento}
              onChange={(e) => setRiferimento(e.target.value)}
              placeholder="TBH-TV-2026-000001"
              className="mt-1 w-full rounded-xl border border-white/15 bg-black/40 px-3 py-2 text-sm text-white outline-none focus:border-[var(--tbh-neon)]"
            />
          </label>
        </div>
        {errore && (
          <p className="mt-3 flex items-start gap-2 text-sm text-amber-300">
            <AlertTriangle size={16} className="mt-0.5 shrink-0" /> {errore}
          </p>
        )}
        <button
          type="submit"
          disabled={cerca.isPending}
          className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[var(--tbh-neon)] px-5 py-2.5 text-sm font-bold text-black disabled:opacity-60"
        >
          {cerca.isPending ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
          {cerca.isPending ? "Sto cercando…" : "Apri le mie campagne"}
        </button>
      </form>

      {/* ————— ELENCO PRATICHE ————— */}
      {dati && (
        <section className="mt-10">
          <p className="text-sm text-[var(--tbh-muted)] mb-4">
            Benvenuto <strong className="text-white">{dati.cliente.nome}</strong> ·{" "}
            {dati.pratiche.length}{" "}
            {dati.pratiche.length === 1 ? "campagna" : "campagne"} collegate a{" "}
            {dati.cliente.email}
          </p>

          {/* Tabella per schermi larghi */}
          <div className="hidden lg:block overflow-x-auto rounded-2xl border border-white/10">
            <table className="w-full text-sm">
              <thead className="bg-white/[0.04] text-left text-xs uppercase tracking-wider text-[var(--tbh-muted)]">
                <tr>
                  <th className="px-3 py-3">Ordine #</th>
                  <th className="px-3 py-3">Protocollo</th>
                  <th className="px-3 py-3">Prodotto</th>
                  <th className="px-3 py-3">Importo</th>
                  <th className="px-3 py-3">Stato</th>
                  <th className="px-3 py-3">Materiali</th>
                  <th className="px-3 py-3">Campagna</th>
                  <th className="px-3 py-3">Report</th>
                  <th className="px-3 py-3">Cashback TBH</th>
                </tr>
              </thead>
              <tbody>
                {dati.pratiche.map((p) => (
                  <tr key={p.numeroOrdine} className="border-t border-white/10 align-top">
                    <td className="px-3 py-3 font-mono text-xs text-white">{p.numeroOrdine}</td>
                    <td className="px-3 py-3 font-mono text-xs text-[var(--tbh-muted)]">
                      {p.protocollo}
                    </td>
                    <td className="px-3 py-3">
                      <span className="block text-white">{p.pacchettoTitolo}</span>
                      <span className="text-xs text-[var(--tbh-muted)]">{p.sku}</span>
                    </td>
                    <td className="px-3 py-3">
                      <span className="block text-white">{euro(p.lordoCents)}</span>
                      <span className="text-xs text-[var(--tbh-muted)]">
                        IVA incl. · {ETICHETTE_FASCIA[p.fascia as Fasce] ?? p.fascia}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <Stato stato={p.stato} />
                    </td>
                    <td className="px-3 py-3 text-xs text-[var(--tbh-muted)]">
                      {materiali(p)}
                    </td>
                    <td className="px-3 py-3 text-xs text-[var(--tbh-muted)]">
                      {campagna(p)}
                    </td>
                    <td className="px-3 py-3 text-xs">{report(p)}</td>
                    <td className="px-3 py-3 text-xs">{cashback(p)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Schede per telefono e tablet */}
          <div className="grid gap-4 lg:hidden">
            {dati.pratiche.map((p) => (
              <article
                key={p.numeroOrdine}
                className="rounded-2xl border border-white/10 bg-white/[0.03] p-4"
              >
                <p className="font-mono text-xs text-white">{p.numeroOrdine}</p>
                <p className="font-mono text-[11px] text-[var(--tbh-muted)]">{p.protocollo}</p>
                <h3 className="tbh-display text-lg mt-2">{p.pacchettoTitolo}</h3>
                <p className="text-xs text-[var(--tbh-muted)]">{p.sku}</p>
                <p className="mt-2 text-white">
                  {euro(p.lordoCents)}{" "}
                  <span className="text-xs text-[var(--tbh-muted)]">
                    IVA incl. · {ETICHETTE_FASCIA[p.fascia as Fasce] ?? p.fascia}
                  </span>
                </p>
                <div className="mt-3">
                  <Stato stato={p.stato} />
                </div>
                <dl className="mt-3 grid gap-2 text-xs text-[var(--tbh-muted)]">
                  <div>
                    <dt className="uppercase tracking-wider text-[10px]">Materiali</dt>
                    <dd>{materiali(p)}</dd>
                  </div>
                  <div>
                    <dt className="uppercase tracking-wider text-[10px]">Campagna</dt>
                    <dd>{campagna(p)}</dd>
                  </div>
                  <div>
                    <dt className="uppercase tracking-wider text-[10px]">Report</dt>
                    <dd>{report(p)}</dd>
                  </div>
                  <div>
                    <dt className="uppercase tracking-wider text-[10px]">Cashback TBH</dt>
                    <dd>{cashback(p)}</dd>
                  </div>
                </dl>
              </article>
            ))}
          </div>

          {/* Report esteso, quando il pannello TBH lo ha caricato */}
          {dati.pratiche.some((p) => p.report) && (
            <div className="mt-8 grid gap-4 md:grid-cols-2">
              {dati.pratiche
                .filter((p) => p.report)
                .map((p) => (
                  <article
                    key={`rep-${p.numeroOrdine}`}
                    className="rounded-2xl border border-[var(--tbh-gold)]/30 bg-[var(--tbh-gold)]/5 p-5"
                  >
                    <p className="flex items-center gap-2 text-sm font-semibold text-[var(--tbh-gold)]">
                      <FileText size={16} /> Report di campagna · {p.numeroOrdine}
                    </p>
                    <dl className="mt-3 grid grid-cols-2 gap-3 text-sm">
                      {KPI.map(([chiave, etichetta, suffisso]) => {
                        const v = p.report?.[chiave];
                        if (v === undefined || v === null || v === "") return null;
                        return (
                          <div key={chiave}>
                            <dt className="text-[11px] uppercase tracking-wider text-[var(--tbh-muted)]">
                              {etichetta}
                            </dt>
                            <dd className="text-white">
                              {typeof v === "number" ? v.toLocaleString("it-IT") : String(v)}
                              {suffisso}
                            </dd>
                          </div>
                        );
                      })}
                    </dl>
                    {p.reportUrl && (
                      <a
                        href={p.reportUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-4 inline-flex items-center gap-2 rounded-xl border border-[var(--tbh-gold)]/50 px-4 py-2 text-xs font-semibold text-[var(--tbh-gold)]"
                      >
                        <FileText size={14} /> Apri il report completo
                      </a>
                    )}
                  </article>
                ))}
            </div>
          )}

        </section>
      )}

      {/* Avanzamento pratica: gli stati sono quelli del regolamento TBH.
          Sta fuori dall'area riservata: serve anche a chi non ha ancora i codici. */}
      <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.02] p-5">
        <p className="text-sm font-semibold text-white mb-3">
          Come avanza una pratica di campagna
        </p>
        <ol className="flex flex-wrap gap-2 text-xs">
          {STATI_PRATICA.filter((s) => s !== "annullata" && s !== "in-attesa-pagamento").map(
            (s, i) => (
              <li
                key={s}
                className="rounded-full border border-white/15 px-3 py-1 text-[var(--tbh-muted)]"
              >
                {i + 1}. {ETICHETTE_STATO[s]}
              </li>
            ),
          )}
        </ol>
        <p className="text-xs text-[var(--tbh-muted)] mt-3">
          Il pagamento non significa «in onda»: il materiale pubblicitario passa da istruttoria e
          validazione prima della pianificazione.
        </p>
      </div>

      {/* ————— AIUTO ————— */}
      <div className="mt-10 grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
          <p className="text-sm font-semibold text-white mb-2">Non trovi la pratica?</p>
          <p className="text-xs text-[var(--tbh-muted)] mb-4">
            Numero d'ordine e protocollo arrivano nell'email di conferma subito dopo il pagamento.
            Se non li hai ricevuti, scrivici: li recuperiamo noi.
          </p>
          <a
            href={WA}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-xl border border-white/20 px-4 py-2 text-xs font-semibold text-white"
          >
            <MessageCircle size={14} /> Assistenza su WhatsApp
          </a>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
          <p className="text-sm font-semibold text-white mb-2">Vuoi una nuova campagna?</p>
          <p className="text-xs text-[var(--tbh-muted)] mb-4">
            I quattro pacchetti TV &amp; Streaming ADV, con prezzo pieno, promo del periodo e prezzo
            riservato ai fidelizzati TBH.
          </p>
          <Link
            href="/tv-streaming-adv"
            className="inline-flex items-center gap-2 rounded-xl bg-[var(--tbh-neon)] px-4 py-2 text-xs font-bold text-black"
          >
            Vai a TV &amp; Streaming ADV
          </Link>
        </div>
      </div>
    </div>
  );
}

/* ————— pezzi di lettura ————— */

const KPI: [string, string, string][] = [
  ["impression", "Impression", ""],
  ["deviceUnici", "Device unici", ""],
  ["ctr", "CTR", " %"],
  ["vtr", "VTR", " %"],
  ["frequency", "Frequency", ""],
  ["geografia", "Geografia", ""],
  ["fasciaOraria", "Fascia oraria", ""],
  ["note", "Note", ""],
];

function Stato({ stato }: { stato: string }) {
  const etichetta = ETICHETTE_STATO[stato as StatoPratica] ?? stato;
  const tono =
    stato === "annullata"
      ? "border-red-400/40 text-red-300"
      : stato === "in-attesa-pagamento"
        ? "border-amber-400/40 text-amber-300"
        : stato === "attiva" || stato === "completata" || stato === "report"
          ? "border-[var(--tbh-neon)]/50 text-[var(--tbh-neon)]"
          : stato === "cashback"
            ? "border-[var(--tbh-gold)]/50 text-[var(--tbh-gold)]"
            : "border-white/20 text-white";
  return (
    <span
      className={`inline-block rounded-full border px-3 py-1 text-[11px] font-semibold ${tono}`}
    >
      {etichetta}
    </span>
  );
}

function materiali(p: Pratica) {
  const base = p.materiali === "tbh" ? "Realizzati da TBH" : "Forniti dal cliente";
  return p.durataSpot ? `${base} · ${p.durataSpot}s` : base;
}

function campagna(p: Pratica) {
  const c = (p.configurazione?.campagna ?? {}) as Record<string, unknown>;
  const pezzi = [c.territorio, c.pubblico, c.durata, c.dataInizio]
    .filter((v) => typeof v === "string" && v.trim().length > 0)
    .map(String);
  return pezzi.length ? pezzi.join(" · ") : "In definizione con TBH";
}

function report(p: Pratica) {
  if (p.reportUrl)
    return (
      <a
        href={p.reportUrl}
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-center gap-1 text-[var(--tbh-gold)] underline"
      >
        <FileText size={12} /> Apri
      </a>
    );
  if (p.report) return <span className="text-[var(--tbh-gold)]">Dati disponibili sotto</span>;
  return <span className="text-[var(--tbh-muted)]">Alla chiusura della campagna</span>;
}

const ETICHETTE_CASHBACK: Record<string, string> = {
  "non-eleggibile": "Non previsto su questo ordine",
  eleggibile: "Eleggibile",
  "in-maturazione": "In maturazione",
  maturato: "Maturato",
  utilizzato: "Utilizzato",
};

function cashback(p: Pratica) {
  const etichetta = ETICHETTE_CASHBACK[p.cashbackStato] ?? p.cashbackStato;
  if (p.cashbackStato === "non-eleggibile")
    return <span className="text-[var(--tbh-muted)]">{etichetta}</span>;
  return (
    <span className="inline-flex items-center gap-1 text-[var(--tbh-gold)]">
      {p.cashbackStato === "maturato" ? <BadgeCheck size={12} /> : <Wallet size={12} />}
      {euro(p.cashbackCents)} · {etichetta}
    </span>
  );
}
