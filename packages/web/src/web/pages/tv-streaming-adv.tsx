import { useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  CheckCircle2,
  Loader2,
  Lock,
  MessageCircle,
  ShieldCheck,
  Tv,
} from "lucide-react";
import { Link } from "wouter";
import { euro } from "../components/tiles";
import {
  useAdvAcquista,
  useAdvListino,
  useAdvPreventivo,
  useAdvStato,
  useVerificaFidelity,
} from "../queries/adv";

const WA = "https://wa.me/393792088524";

type Listino = NonNullable<ReturnType<typeof useAdvListino>["data"]>;
type Pacchetto = Listino["pacchetti"][number];

/**
 * TBH TV & STREAMING ADV — vetrina dello Shop + configuratore in 6 passaggi.
 *
 * Regole rispettate (specifica di Claudio del 15/09/2026):
 * · il browser non calcola prezzi e non può regalarsi la fascia Fidelity: manda i dati,
 *   il server risponde con la fascia già decisa (`adv.preventivo`, `adv.acquista`);
 * · niente auto-dichiarazione: la Fidelity si verifica sul registro TBH;
 * · il pagamento risulta confermato solo dal webhook Stripe, non da questa pagina.
 */
export default function TvStreamingAdvPage() {
  const stato = useAdvStato();
  const listino = useAdvListino();
  const [slugScelto, setSlugScelto] = useState<string | null>(null);

  const params = new URLSearchParams(window.location.search);
  const annullato = params.get("pagamento") === "annullato";

  const pacchetti = listino.data?.pacchetti ?? [];
  const scelto = pacchetti.find((p) => p.slug === slugScelto) ?? null;

  return (
    <div className="mx-auto max-w-[1500px] px-4 md:px-8 py-10">
      <header className="tbh-rise mb-8">
        <p className="text-xs tracking-[0.25em] text-[var(--tbh-gold)] uppercase mb-2">
          Touch Plaza Shop · Pubblicità in onda
        </p>
        <h1 className="tbh-display tbh-h1 flex items-center gap-3">
          <Tv className="text-[var(--tbh-neon)] shrink-0" size={34} /> TV &amp; Streaming ADV
        </h1>
        <p className="tbh-body text-[var(--tbh-muted)] max-w-3xl mt-3">
          Campagne pubblicitarie su TV connesse, CTV e piattaforme di streaming. Prezzi di listino
          ufficiale TBH, IVA inclusa. Tre fasce gestite dal sistema: prezzo pieno, prezzo promo nel
          periodo indicato, prezzo riservato ai clienti fidelizzati TBH.
        </p>
        {listino.data && (
          <p className="text-xs text-[var(--tbh-muted)] mt-2">
            Listino verificato sulla slide ufficiale del {listino.data.verificatoIl}.
          </p>
        )}
      </header>

      {annullato && (
        <div className="mb-6 tbh-card p-4 flex items-start gap-3 border-[var(--tbh-gold)]">
          <AlertTriangle className="text-[var(--tbh-gold)] shrink-0" />
          <p className="text-sm">
            Pagamento annullato: la configurazione non è andata persa, puoi rifarla qui sotto oppure
            completarla con noi su WhatsApp.
          </p>
        </div>
      )}

      {stato.data && !stato.data.stripeConfigurato && (
        <div className="mb-6 tbh-card p-4 md:p-5 flex flex-col md:flex-row md:items-center gap-3">
          <AlertTriangle className="text-[var(--tbh-gold)] shrink-0" />
          <p className="text-sm grow">
            <strong>Pagamento con carta non ancora attivo.</strong> Manca la chiave{" "}
            <code>STRIPE_SECRET_KEY</code> sul server: il configuratore funziona e calcola il
            preventivo, la chiusura avviene su WhatsApp finché la chiave non viene inserita.
          </p>
          <a
            href={WA}
            target="_blank"
            rel="noreferrer"
            className="tbh-neon-btn px-5 py-2.5 text-sm whitespace-nowrap"
          >
            Parlane su WhatsApp
          </a>
        </div>
      )}
      {stato.data?.stripeConfigurato && stato.data.modalita === "test" && (
        <div className="mb-6 text-xs text-[var(--tbh-gold)]">
          Stripe attivo in modalità TEST — i pagamenti non sono reali.
        </div>
      )}
      {stato.data?.stripeConfigurato && !stato.data.webhookConfigurato && (
        <div className="mb-6 text-xs text-[var(--tbh-gold)]">
          Attenzione: manca <code>STRIPE_WEBHOOK_SECRET</code>. Senza webhook firmato il sistema non
          può confermare da solo i pagamenti.
        </div>
      )}

      {/* ————— LE QUATTRO SOLUZIONI ————— */}
      {listino.isLoading ? (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="tbh-card h-96 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {pacchetti.map((p) => (
            <SchedaPacchetto
              key={p.slug}
              p={p}
              onScegli={() => {
                setSlugScelto(p.slug);
                document.getElementById("configuratore")?.scrollIntoView({ behavior: "smooth" });
              }}
              attivo={p.slug === slugScelto}
            />
          ))}
        </div>
      )}

      {listino.data?.durateNota && (
        <p className="mt-5 text-xs text-[var(--tbh-muted)] max-w-4xl border-l-2 border-[var(--tbh-gold)] pl-4">
          <strong className="text-[var(--tbh-gold)]">Nota tecnica sulle durate.</strong>{" "}
          {listino.data.durateNota}
        </p>
      )}

      {/* ————— CONFIGURATORE ————— */}
      <section id="configuratore" className="mt-14 scroll-mt-24">
        <h2 className="tbh-display tbh-h2 mb-2">Configura la tua campagna</h2>
        <p className="text-sm text-[var(--tbh-muted)] max-w-3xl mb-6">
          Sei passaggi: soluzione, campagna, contenuto, servizi extra, verifica Fidelity, riepilogo.
          Il prezzo definitivo viene calcolato dal server prima del pagamento.
        </p>
        {listino.data && (
          <Configuratore
            listino={listino.data}
            pacchetto={scelto}
            onScegliPacchetto={setSlugScelto}
            stripeAttivo={stato.data?.stripeConfigurato === true}
          />
        )}
      </section>

      {/* ————— GARANZIE, POSIZIONI, DURATE, CASHBACK ————— */}
      {listino.data && <Dettagli listino={listino.data} />}

      <div className="mt-12 tbh-card p-5 flex flex-col md:flex-row md:items-center gap-4">
        <ShieldCheck className="text-[var(--tbh-neon)] shrink-0" />
        <p className="text-sm grow">
          Hai già una campagna acquistata? Segui la pratica, i materiali, il report e il Cashback TBH
          nella tua area riservata.
        </p>
        <Link
          href="/le-mie-campagne"
          className="tbh-neon-btn px-5 py-2.5 text-sm whitespace-nowrap"
        >
          Le mie campagne
        </Link>
      </div>
    </div>
  );
}

/* ——————————————————————— SCHEDA PACCHETTO ——————————————————————— */

function SchedaPacchetto({
  p,
  onScegli,
  attivo,
}: {
  p: Pacchetto;
  onScegli: () => void;
  attivo: boolean;
}) {
  const inVigore = p.promoAttiva && p.prezzi.promo ? p.prezzi.promo : p.prezzi.pieno;
  return (
    <article
      className={`tbh-card overflow-hidden flex flex-col ${attivo ? "border-[var(--tbh-neon)]" : ""}`}
      style={{ borderTopColor: p.colore, borderTopWidth: 3 }}
    >
      <div className="p-5 flex flex-col gap-3 grow">
        <span
          className="text-[11px] tracking-[0.18em] uppercase font-bold"
          style={{ color: p.colore }}
        >
          {p.sku}
        </span>
        <h3 className="tbh-display tbh-h3">{p.titolo}</h3>
        <p className="text-sm text-[var(--tbh-gold)]">{p.claim}</p>
        <p className="text-sm text-[var(--tbh-muted)]">{p.descrizione}</p>

        <ul className="text-sm flex flex-col gap-1.5 mt-1">
          {p.incluso.map((v) => (
            <li key={v} className="flex items-start gap-2">
              <CheckCircle2 size={15} className="text-[var(--tbh-neon)] shrink-0 mt-0.5" />
              <span>{v}</span>
            </li>
          ))}
        </ul>

        {p.piattaforme && (
          <div className="mt-1">
            <p className="text-[11px] uppercase tracking-wide text-[var(--tbh-muted)] mb-1.5">
              Piattaforme
            </p>
            <div className="flex flex-wrap gap-1.5">
              {p.piattaforme.map((n) => (
                <span
                  key={n}
                  className="text-[11px] font-semibold rounded-full bg-white/10 px-2.5 py-1"
                >
                  {n}
                </span>
              ))}
              <span className="text-[11px] text-[var(--tbh-muted)] px-1 py-1">e molto altro</span>
            </div>
          </div>
        )}

        <div className="mt-auto pt-4 border-t border-[var(--tbh-line)]">
          <div className="flex items-end gap-2 flex-wrap">
            <span className="tbh-display text-3xl text-[var(--tbh-neon)]">
              {euro(inVigore.lordo)}
            </span>
            {p.promoAttiva && p.prezzi.promo && (
              <span className="text-sm line-through text-[var(--tbh-muted)]">
                {euro(p.prezzi.pieno.lordo)}
              </span>
            )}
          </div>
          <p className="text-[11px] text-[var(--tbh-muted)] mt-1">
            IVA {p.prezzi.pieno.ivaAliquota}% inclusa · netto {euro(inVigore.netto)} + IVA{" "}
            {euro(inVigore.iva)}
          </p>

          <div className="mt-3 grid gap-1 text-[12px]">
            <Riga etichetta="Prezzo pieno" valore={euro(p.prezzi.pieno.lordo)} />
            {p.prezzi.promo && (
              <Riga
                etichetta={`Promo ${p.scontoPromo}${p.promoAttiva ? " · attiva" : " · non attiva"}`}
                valore={euro(p.prezzi.promo.lordo)}
                tono={p.promoAttiva ? "neon" : "muto"}
              />
            )}
            {p.prezzi.fidelity && (
              <Riga
                etichetta={`Fidelity TBH ${p.scontoFidelity} · su verifica`}
                valore={euro(p.prezzi.fidelity.lordo)}
                tono="oro"
              />
            )}
          </div>

          {p.promoDal && p.promoAl && (
            <p className="text-[11px] text-[var(--tbh-muted)] mt-2">
              Finestra promozionale dal {p.promoDal} al {p.promoAl}: a scadenza torna
              automaticamente al prezzo pieno.
            </p>
          )}

          {p.disponibile ? (
            <button
              type="button"
              onClick={onScegli}
              className="tbh-neon-btn w-full mt-4 px-4 py-3 text-sm font-bold uppercase tracking-wide"
            >
              {p.cta}
            </button>
          ) : (
            <a
              href={WA}
              target="_blank"
              rel="noreferrer"
              className="mt-4 w-full inline-flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold rounded-full border border-[var(--tbh-gold)] text-[var(--tbh-gold)]"
            >
              <MessageCircle size={16} /> Non disponibile · chiedi la pianificazione
            </a>
          )}
        </div>
      </div>
    </article>
  );
}

function Riga({
  etichetta,
  valore,
  tono = "normale",
}: {
  etichetta: string;
  valore: string;
  tono?: "normale" | "neon" | "oro" | "muto";
}) {
  const colore =
    tono === "neon"
      ? "text-[var(--tbh-neon)]"
      : tono === "oro"
        ? "text-[var(--tbh-gold)]"
        : tono === "muto"
          ? "text-[var(--tbh-muted)]"
          : "";
  return (
    <div className={`flex items-center justify-between gap-3 ${colore}`}>
      <span className="text-[var(--tbh-muted)]">{etichetta}</span>
      <span className={`font-semibold ${colore}`}>{valore}</span>
    </div>
  );
}

/* ——————————————————————— CONFIGURATORE 6 STEP ——————————————————————— */

const PASSI = [
  "Soluzione",
  "Campagna",
  "Contenuto",
  "Servizi extra",
  "Fidelity",
  "Riepilogo",
] as const;

function Configuratore({
  listino,
  pacchetto,
  onScegliPacchetto,
  stripeAttivo,
}: {
  listino: Listino;
  pacchetto: Pacchetto | null;
  onScegliPacchetto: (slug: string) => void;
  stripeAttivo: boolean;
}) {
  const [passo, setPasso] = useState(0);
  const [campagna, setCampagna] = useState({
    territorio: listino.territori[0] ?? "",
    pubblico: listino.pubblico[0] ?? "",
    durataCampagna: listino.durateCampagna[0] ?? "",
    dataInizio: "",
    citta: "",
    eta: "",
    genere: "",
    interessi: "",
    note: "",
  });
  const [materiali, setMateriali] = useState<"cliente" | "tbh">("cliente");
  const [durataSpot, setDurataSpot] = useState<number>(30);
  const [addon, setAddon] = useState<string[]>([]);
  const [vuoleFidelity, setVuoleFidelity] = useState<boolean | null>(null);
  const [datiFid, setDatiFid] = useState({ email: "", codiceFiscale: "", codiceTbh: "" });
  const [cliente, setCliente] = useState({
    nome: "",
    email: "",
    telefono: "",
    riferimentoFiscale: "",
  });
  const [errore, setErrore] = useState<string | null>(null);

  const verifica = useVerificaFidelity();
  const preventivo = useAdvPreventivo();
  const acquista = useAdvAcquista();

  const fidelityOk = verifica.data?.fidelizzato === true;
  const datiFidelity = useMemo(
    () => ({
      dichiarato: vuoleFidelity === true && fidelityOk,
      email: datiFid.email || undefined,
      codiceFiscale: datiFid.codiceFiscale || undefined,
      codiceTbh: datiFid.codiceTbh || undefined,
    }),
    [vuoleFidelity, fidelityOk, datiFid],
  );

  function avanti() {
    setErrore(null);
    if (passo === 0 && !pacchetto) return setErrore("Scegli prima una soluzione.");
    if (passo === 1 && (!campagna.territorio || !campagna.pubblico || !campagna.durataCampagna))
      return setErrore("Territorio, pubblico e durata della campagna sono obbligatori.");
    if (passo === 2 && pacchetto?.chiedeDurata && !durataSpot)
      return setErrore("Scegli la durata dello spot.");
    if (passo === 4 && vuoleFidelity === null)
      return setErrore("Indica se sei un cliente fidelizzato TBH.");

    if (passo === 4 && pacchetto) {
      // Il riepilogo lo calcola il server: la fascia non si decide nel browser.
      preventivo.mutate({ slug: pacchetto.slug, addon, fidelity: datiFidelity });
    }
    setPasso((p) => Math.min(p + 1, PASSI.length - 1));
  }

  function paga() {
    if (!pacchetto) return;
    setErrore(null);
    if (!cliente.nome.trim() || !cliente.email.trim())
      return setErrore("Nome e email sono obbligatori per aprire la pratica.");
    acquista.mutate(
      {
        slug: pacchetto.slug,
        addon,
        cliente: {
          nome: cliente.nome.trim(),
          email: cliente.email.trim(),
          telefono: cliente.telefono.trim() || undefined,
          riferimentoFiscale: cliente.riferimentoFiscale.trim() || undefined,
        },
        campagna: {
          territorio: campagna.territorio,
          pubblico: campagna.pubblico,
          durataCampagna: campagna.durataCampagna,
          dataInizio: campagna.dataInizio || undefined,
          citta: campagna.citta || undefined,
          eta: campagna.eta || undefined,
          genere: campagna.genere || undefined,
          interessi: campagna.interessi || undefined,
          note: campagna.note || undefined,
        },
        contenuto: {
          materiali,
          durataSpot: pacchetto.chiedeDurata ? durataSpot : undefined,
        },
        fidelity: datiFidelity,
        origin: window.location.origin,
      },
      {
        onSuccess: (r) => {
          window.location.href = r.url;
        },
        onError: (e: unknown) =>
          setErrore(e instanceof Error ? e.message : "Pagamento non disponibile."),
      },
    );
  }

  return (
    <div className="tbh-card p-5 md:p-7">
      {/* Barra dei passi */}
      <ol className="flex flex-wrap gap-2 mb-6">
        {PASSI.map((nome, i) => (
          <li key={nome}>
            <button
              type="button"
              onClick={() => i <= passo && setPasso(i)}
              className={`text-[11px] md:text-xs font-bold uppercase tracking-wide rounded-full px-3 py-1.5 transition ${
                i === passo
                  ? "bg-[var(--tbh-neon)] text-black"
                  : i < passo
                    ? "bg-white/15 text-white"
                    : "bg-white/5 text-[var(--tbh-muted)]"
              }`}
            >
              {i + 1}. {nome}
            </button>
          </li>
        ))}
      </ol>

      {/* STEP 1 — soluzione */}
      {passo === 0 && (
        <div className="grid gap-3 md:grid-cols-2">
          {listino.pacchetti.map((p) => (
            <button
              key={p.slug}
              type="button"
              onClick={() => onScegliPacchetto(p.slug)}
              className={`text-left tbh-card p-4 transition ${
                pacchetto?.slug === p.slug
                  ? "border-[var(--tbh-neon)]"
                  : "hover:border-[var(--tbh-gold)]"
              }`}
            >
              <p className="text-[11px] uppercase tracking-wide" style={{ color: p.colore }}>
                {p.sku}
              </p>
              <p className="tbh-display text-lg">{p.titolo}</p>
              <p className="text-xs text-[var(--tbh-muted)] mt-1">{p.claim}</p>
              <p className="text-sm text-[var(--tbh-neon)] font-semibold mt-2">
                da{" "}
                {euro(
                  p.promoAttiva && p.prezzi.promo ? p.prezzi.promo.lordo : p.prezzi.pieno.lordo,
                )}
              </p>
            </button>
          ))}
        </div>
      )}

      {/* STEP 2 — campagna */}
      {passo === 1 && (
        <div className="grid gap-4 md:grid-cols-2">
          <Select
            label="Territorio"
            value={campagna.territorio}
            onChange={(v) => setCampagna({ ...campagna, territorio: v })}
            options={listino.territori}
          />
          <Select
            label="Pubblico"
            value={campagna.pubblico}
            onChange={(v) => setCampagna({ ...campagna, pubblico: v })}
            options={listino.pubblico}
          />
          <Select
            label="Durata della campagna"
            value={campagna.durataCampagna}
            onChange={(v) => setCampagna({ ...campagna, durataCampagna: v })}
            options={listino.durateCampagna}
          />
          <Campo
            label="Data di partenza desiderata"
            type="date"
            value={campagna.dataInizio}
            onChange={(v) => setCampagna({ ...campagna, dataInizio: v })}
          />
          <Campo
            label="Città e province"
            value={campagna.citta}
            onChange={(v) => setCampagna({ ...campagna, citta: v })}
            placeholder="Rimini, Cesena, Forlì…"
          />
          <Campo
            label="Fasce d'età"
            value={campagna.eta}
            onChange={(v) => setCampagna({ ...campagna, eta: v })}
            placeholder="25-54"
          />
          <Campo
            label="Genere"
            value={campagna.genere}
            onChange={(v) => setCampagna({ ...campagna, genere: v })}
            placeholder="Indifferente / uomini / donne"
          />
          <Campo
            label="Interessi e stili di vita"
            value={campagna.interessi}
            onChange={(v) => setCampagna({ ...campagna, interessi: v })}
            placeholder="Sport, motori, food…"
          />
          <div className="md:col-span-2">
            <Campo
              label="Note per la pianificazione"
              value={campagna.note}
              onChange={(v) => setCampagna({ ...campagna, note: v })}
              placeholder="Obiettivi, periodi da evitare, riferimenti…"
              area
            />
          </div>
        </div>
      )}

      {/* STEP 3 — contenuto */}
      {passo === 2 && (
        <div className="grid gap-5">
          <div className="grid gap-3 md:grid-cols-2">
            {(
              [
                ["cliente", "Ho già il materiale", "Consegno io spot, grafiche e loghi pronti."],
                [
                  "tbh",
                  "Deve realizzarlo TBH",
                  "Se ne occupa la produzione TBH: riprese, montaggio, grafica.",
                ],
              ] as const
            ).map(([k, titolo, testo]) => (
              <button
                key={k}
                type="button"
                onClick={() => setMateriali(k)}
                className={`text-left tbh-card p-4 transition ${
                  materiali === k ? "border-[var(--tbh-neon)]" : "hover:border-[var(--tbh-gold)]"
                }`}
              >
                <p className="tbh-display text-lg">{titolo}</p>
                <p className="text-xs text-[var(--tbh-muted)] mt-1">{testo}</p>
              </button>
            ))}
          </div>

          {pacchetto?.chiedeDurata && (
            <div>
              <p className="text-xs uppercase tracking-wide text-[var(--tbh-muted)] mb-2">
                Durata dello spot
              </p>
              <div className="flex flex-wrap gap-2">
                {listino.durate.map((d) => (
                  <button
                    key={d.secondi}
                    type="button"
                    onClick={() => setDurataSpot(d.secondi)}
                    className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                      durataSpot === d.secondi
                        ? "bg-[var(--tbh-neon)] text-black"
                        : "bg-white/10 hover:bg-white/20"
                    }`}
                  >
                    {d.secondi}s · {d.nome}
                  </button>
                ))}
              </div>
              <p className="text-xs text-[var(--tbh-muted)] mt-3 border-l-2 border-[var(--tbh-gold)] pl-3">
                {listino.durateNota}
              </p>
            </div>
          )}
        </div>
      )}

      {/* STEP 4 — servizi extra */}
      {passo === 3 && (
        <div className="grid gap-3 md:grid-cols-2">
          {listino.addon.length === 0 && (
            <p className="text-sm text-[var(--tbh-muted)]">
              Nessun servizio extra attivo in questo momento.
            </p>
          )}
          {listino.addon.map((a) => {
            const on = addon.includes(a.codice);
            return (
              <button
                key={a.codice}
                type="button"
                onClick={() =>
                  setAddon(on ? addon.filter((c) => c !== a.codice) : [...addon, a.codice])
                }
                className={`text-left tbh-card p-4 transition ${
                  on ? "border-[var(--tbh-neon)]" : "hover:border-[var(--tbh-gold)]"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <p className="tbh-display text-base">{a.nome}</p>
                  <span className="text-sm font-bold text-[var(--tbh-neon)] whitespace-nowrap">
                    {euro(a.prezzoCents)}
                  </span>
                </div>
                <p className="text-xs text-[var(--tbh-muted)] mt-1">{a.descrizione}</p>
                <p className="text-[11px] mt-2 uppercase tracking-wide">
                  {on ? (
                    <span className="text-[var(--tbh-neon)]">Aggiunto</span>
                  ) : (
                    <span className="text-[var(--tbh-muted)]">Tocca per aggiungere</span>
                  )}
                </p>
              </button>
            );
          })}
        </div>
      )}

      {/* STEP 5 — fidelity */}
      {passo === 4 && (
        <div className="grid gap-5">
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => setVuoleFidelity(true)}
              className={`rounded-full px-5 py-2.5 text-sm font-bold transition ${
                vuoleFidelity === true
                  ? "bg-[var(--tbh-neon)] text-black"
                  : "bg-white/10 hover:bg-white/20"
              }`}
            >
              Sono cliente fidelizzato TBH
            </button>
            <button
              type="button"
              onClick={() => {
                setVuoleFidelity(false);
                verifica.reset();
              }}
              className={`rounded-full px-5 py-2.5 text-sm font-bold transition ${
                vuoleFidelity === false
                  ? "bg-[var(--tbh-neon)] text-black"
                  : "bg-white/10 hover:bg-white/20"
              }`}
            >
              No, non ancora
            </button>
          </div>

          {vuoleFidelity === true && (
            <div className="tbh-card p-4">
              <p className="text-sm inline-flex items-center gap-2 font-bold mb-1">
                <Lock size={16} className="text-[var(--tbh-gold)]" /> Verifica sul registro TBH
              </p>
              <p className="text-xs text-[var(--tbh-muted)] mb-4 max-w-2xl">
                Il prezzo riservato non si ottiene dichiarandolo: viene concesso solo se la
                posizione risulta attiva nel registro dei clienti fidelizzati. La verifica avviene
                sul server.
              </p>
              <div className="grid gap-3 md:grid-cols-3">
                <Campo
                  label="Email della posizione"
                  value={datiFid.email}
                  onChange={(v) => setDatiFid({ ...datiFid, email: v })}
                />
                <Campo
                  label="Codice fiscale o partita IVA"
                  value={datiFid.codiceFiscale}
                  onChange={(v) => setDatiFid({ ...datiFid, codiceFiscale: v })}
                />
                <Campo
                  label="Codice TBH"
                  value={datiFid.codiceTbh}
                  onChange={(v) => setDatiFid({ ...datiFid, codiceTbh: v })}
                />
              </div>
              <button
                type="button"
                onClick={() =>
                  verifica.mutate({
                    email: datiFid.email || undefined,
                    codiceFiscale: datiFid.codiceFiscale || undefined,
                    codiceTbh: datiFid.codiceTbh || undefined,
                  })
                }
                disabled={verifica.isPending}
                className="tbh-neon-btn px-5 py-2.5 text-sm mt-4 inline-flex items-center gap-2 disabled:opacity-60"
              >
                {verifica.isPending && <Loader2 size={16} className="animate-spin" />}
                Verifica la posizione
              </button>

              {verifica.data && (
                <p
                  className={`text-sm mt-3 inline-flex items-start gap-2 ${
                    verifica.data.fidelizzato
                      ? "text-[var(--tbh-neon)]"
                      : "text-[var(--tbh-gold)]"
                  }`}
                >
                  {verifica.data.fidelizzato ? (
                    <BadgeCheck size={17} className="shrink-0 mt-0.5" />
                  ) : (
                    <AlertTriangle size={17} className="shrink-0 mt-0.5" />
                  )}
                  <span>
                    {verifica.data.messaggio}
                    {verifica.data.intestatario && ` — ${verifica.data.intestatario}`}
                    {verifica.data.livello && ` · ${verifica.data.livello}`}
                  </span>
                </p>
              )}
              {verifica.isError && (
                <p className="text-sm text-[var(--tbh-gold)] mt-3">
                  Verifica non riuscita. Riprova o scrivici su WhatsApp.
                </p>
              )}
            </div>
          )}

          {vuoleFidelity === false && (
            <div className="tbh-card p-4">
              <p className="text-sm">
                Si applica il <strong>prezzo pieno</strong> o la <strong>promo</strong> in corso.
                Vuoi i prezzi riservati e il Cashback TBH 100%? Puoi fidelizzarti al Circuito.
              </p>
              <div className="flex flex-wrap gap-3 mt-3">
                <Link href="/club" className="tbh-neon-btn px-5 py-2.5 text-sm">
                  Come fidelizzarsi
                </Link>
                <a
                  href={WA}
                  target="_blank"
                  rel="noreferrer"
                  className="px-5 py-2.5 text-sm font-semibold rounded-full border border-[var(--tbh-line)] hover:border-[var(--tbh-gold)] inline-flex items-center gap-2"
                >
                  <MessageCircle size={16} /> Parlane con noi
                </a>
              </div>
              <ul className="grid gap-1.5 mt-4 text-sm">
                {listino.beneficiFidelity.map((b) => (
                  <li key={b} className="flex items-start gap-2">
                    <CheckCircle2 size={15} className="text-[var(--tbh-gold)] shrink-0 mt-0.5" />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* STEP 6 — riepilogo e pagamento */}
      {passo === 5 && (
        <div className="grid gap-5 lg:grid-cols-[1.2fr_1fr]">
          <div className="tbh-card p-5">
            <h3 className="tbh-display text-xl mb-4">Riepilogo</h3>
            {preventivo.isPending && (
              <p className="text-sm text-[var(--tbh-muted)] inline-flex items-center gap-2">
                <Loader2 size={16} className="animate-spin" /> Calcolo in corso sul server…
              </p>
            )}
            {preventivo.isError && (
              <p className="text-sm text-[var(--tbh-gold)]">
                Preventivo non disponibile. Torna indietro e riprova.
              </p>
            )}
            {preventivo.data && (
              <div className="grid gap-2 text-sm">
                <Riga etichetta="Soluzione" valore={`${preventivo.data.titolo}`} />
                <Riga etichetta="SKU" valore={preventivo.data.sku} />
                <Riga
                  etichetta="Fascia applicata"
                  valore={
                    preventivo.data.fascia === "fidelity"
                      ? "Prezzo Fidelity TBH"
                      : preventivo.data.fascia === "promo"
                        ? "Prezzo promo"
                        : "Prezzo pieno"
                  }
                  tono={preventivo.data.fascia === "fidelity" ? "oro" : "neon"}
                />
                <p className="text-xs text-[var(--tbh-muted)]">{preventivo.data.motivo}</p>
                <div className="h-px bg-[var(--tbh-line)] my-2" />
                <Riga etichetta="Pacchetto" valore={euro(preventivo.data.pacchettoCents)} />
                {preventivo.data.addon.map((a) => (
                  <Riga key={a.codice} etichetta={a.nome} valore={euro(a.prezzoCents)} />
                ))}
                <div className="h-px bg-[var(--tbh-line)] my-2" />
                <Riga etichetta="Totale netto" valore={euro(preventivo.data.nettoCents)} />
                <Riga
                  etichetta={`IVA ${preventivo.data.ivaAliquota}%`}
                  valore={euro(preventivo.data.ivaCents)}
                />
                <div className="flex items-center justify-between gap-3 pt-2">
                  <span className="font-bold uppercase tracking-wide text-xs">Totale da pagare</span>
                  <span className="tbh-display text-2xl text-[var(--tbh-neon)]">
                    {euro(preventivo.data.lordoCents)}
                  </span>
                </div>
                {preventivo.data.risparmioCents > 0 && (
                  <p className="text-xs text-[var(--tbh-gold)]">
                    Risparmio rispetto al prezzo pieno: {euro(preventivo.data.risparmioCents)}.
                  </p>
                )}
                {preventivo.data.cashbackEleggibile ? (
                  <p className="text-xs text-[var(--tbh-neon)] mt-2">
                    Cashback TBH eleggibile: {euro(preventivo.data.cashbackCents)}.{" "}
                    {preventivo.data.cashbackNota}
                  </p>
                ) : (
                  <p className="text-xs text-[var(--tbh-muted)] mt-2">
                    Cashback TBH non applicabile: è riservato ai clienti fidelizzati verificati.
                  </p>
                )}
                <div className="h-px bg-[var(--tbh-line)] my-2" />
                <Riga etichetta="Territorio" valore={campagna.territorio} />
                <Riga etichetta="Pubblico" valore={campagna.pubblico} />
                <Riga etichetta="Durata campagna" valore={campagna.durataCampagna} />
                <Riga
                  etichetta="Materiali"
                  valore={materiali === "tbh" ? "Realizzati da TBH" : "Forniti dal cliente"}
                />
                {pacchetto?.chiedeDurata && (
                  <Riga etichetta="Durata spot" valore={`${durataSpot} secondi`} />
                )}
              </div>
            )}
          </div>

          <div className="tbh-card p-5">
            <h3 className="tbh-display text-xl mb-1">I tuoi dati</h3>
            <p className="text-xs text-[var(--tbh-muted)] mb-4">
              Servono per aprire la pratica e assegnare numero d'ordine e protocollo.
            </p>
            <div className="grid gap-3">
              <Campo
                label="Nome e cognome o ragione sociale"
                value={cliente.nome}
                onChange={(v) => setCliente({ ...cliente, nome: v })}
              />
              <Campo
                label="Email"
                type="email"
                value={cliente.email}
                onChange={(v) => setCliente({ ...cliente, email: v })}
              />
              <Campo
                label="Telefono o WhatsApp"
                value={cliente.telefono}
                onChange={(v) => setCliente({ ...cliente, telefono: v })}
              />
              <Campo
                label="Codice fiscale o partita IVA"
                value={cliente.riferimentoFiscale}
                onChange={(v) => setCliente({ ...cliente, riferimentoFiscale: v })}
              />
            </div>

            {stripeAttivo ? (
              <button
                type="button"
                onClick={paga}
                disabled={acquista.isPending || !preventivo.data}
                className="tbh-neon-btn w-full mt-5 px-5 py-3 text-sm font-bold uppercase tracking-wide inline-flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {acquista.isPending && <Loader2 size={16} className="animate-spin" />}
                Vai al pagamento sicuro
              </button>
            ) : (
              <a
                href={WA}
                target="_blank"
                rel="noreferrer"
                className="tbh-neon-btn w-full mt-5 px-5 py-3 text-sm font-bold uppercase tracking-wide inline-flex items-center justify-center gap-2"
              >
                <MessageCircle size={16} /> Chiudi la campagna su WhatsApp
              </a>
            )}
            <p className="text-[11px] text-[var(--tbh-muted)] mt-3">
              Il pagamento viene considerato riuscito solo quando Stripe lo conferma al nostro
              sistema. Subito dopo ricevi numero d'ordine e protocollo della pratica. Il materiale
              pubblicitario può essere soggetto a validazione creativa e legale prima della messa in
              onda.
            </p>
          </div>
        </div>
      )}

      {errore && (
        <p className="text-sm text-[var(--tbh-gold)] mt-5 inline-flex items-start gap-2">
          <AlertTriangle size={16} className="shrink-0 mt-0.5" /> {errore}
        </p>
      )}

      {/* Navigazione */}
      <div className="flex items-center justify-between gap-3 mt-7 pt-5 border-t border-[var(--tbh-line)]">
        <button
          type="button"
          onClick={() => {
            setErrore(null);
            setPasso((p) => Math.max(0, p - 1));
          }}
          disabled={passo === 0}
          className="px-5 py-2.5 text-sm font-semibold rounded-full border border-[var(--tbh-line)] hover:border-white disabled:opacity-40 inline-flex items-center gap-2"
        >
          <ArrowLeft size={16} /> Indietro
        </button>
        {passo < PASSI.length - 1 && (
          <button
            type="button"
            onClick={avanti}
            className="tbh-neon-btn px-6 py-2.5 text-sm inline-flex items-center gap-2"
          >
            Avanti <ArrowRight size={16} />
          </button>
        )}
      </div>
    </div>
  );
}

/* ——————————————————————— DETTAGLI DI LISTINO ——————————————————————— */

function Dettagli({ listino }: { listino: Listino }) {
  return (
    <>
      <section className="mt-14">
        <h2 className="tbh-display tbh-h2 mb-5">Le cinque posizioni pubblicitarie</h2>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {listino.posizioni.map((p) => (
            <div key={p.n} className="tbh-card p-5">
              <span className="tbh-display text-3xl text-[var(--tbh-neon)]">
                {String(p.n).padStart(2, "0")}
              </span>
              <p className="tbh-display text-lg mt-2">{p.nome}</p>
              <p className="text-sm text-[var(--tbh-muted)] mt-1">{p.cosa}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-14">
        <h2 className="tbh-display tbh-h2 mb-5">Durate disponibili</h2>
        <div className="flex flex-wrap gap-3">
          {listino.durate.map((d) => (
            <div key={d.secondi} className="tbh-card px-5 py-4">
              <span className="tbh-display text-2xl text-[var(--tbh-neon)]">{d.secondi}s</span>
              <p className="text-xs text-[var(--tbh-muted)] mt-1">{d.nome}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-14">
        <h2 className="tbh-display tbh-h2 mb-5">Cosa garantiamo</h2>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {listino.garanzie.map((g) => (
            <div key={g.titolo} className="tbh-card p-5">
              <p className="tbh-display text-lg mb-3">{g.titolo}</p>
              <ul className="grid gap-1.5 text-sm">
                {g.voci.map((v) => (
                  <li key={v} className="flex items-start gap-2">
                    <CheckCircle2 size={15} className="text-[var(--tbh-neon)] shrink-0 mt-0.5" />
                    <span>{v}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-14 grid gap-6 lg:grid-cols-2">
        <div className="tbh-card p-6 border-[var(--tbh-gold)]">
          <h2 className="tbh-display tbh-h3 text-[var(--tbh-gold)] mb-3">
            {listino.cashback.titolo}
          </h2>
          <ul className="grid gap-1.5 text-sm">
            {listino.cashback.righe.map((r) => (
              <li key={r} className="flex items-start gap-2">
                <CheckCircle2 size={15} className="text-[var(--tbh-gold)] shrink-0 mt-0.5" />
                <span>{r}</span>
              </li>
            ))}
          </ul>
          <p className="text-xs text-[var(--tbh-muted)] mt-4">{listino.cashback.nota}</p>
        </div>
        <div className="tbh-card p-6">
          <h2 className="tbh-display tbh-h3 mb-3">Cliente fidelizzato TBH</h2>
          <ul className="grid gap-1.5 text-sm">
            {listino.beneficiFidelity.map((b) => (
              <li key={b} className="flex items-start gap-2">
                <CheckCircle2 size={15} className="text-[var(--tbh-neon)] shrink-0 mt-0.5" />
                <span>{b}</span>
              </li>
            ))}
          </ul>
          <Link href="/club" className="tbh-neon-btn px-5 py-2.5 text-sm mt-5 inline-block">
            Entra nel Circuito
          </Link>
        </div>
      </section>

      <section className="mt-14">
        <h2 className="tbh-display tbh-h2 mb-5">Il listino ufficiale</h2>
        <div className="tbh-card p-4 overflow-hidden">
          <img
            src={listino.slide}
            alt="Listino ufficiale TBH TV & Streaming ADV"
            className="w-full h-auto rounded-xl"
            loading="lazy"
            decoding="async"
          />
        </div>
        <p className="text-xs text-[var(--tbh-muted)] mt-2">
          Slide ufficiale Touch Business Holding, verificata il {listino.verificatoIl}. I prezzi sono
          IVA {listino.ivaAliquota}% inclusa.
        </p>
      </section>
    </>
  );
}

/* ——————————————————————— CAMPI ——————————————————————— */

function Campo({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  area = false,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  area?: boolean;
}) {
  const classi =
    "w-full rounded-xl bg-black/50 border border-white/15 px-4 py-3 text-sm outline-none focus:border-[var(--tbh-neon)]";
  return (
    <label className="block">
      <span className="block text-[11px] uppercase tracking-wide text-[var(--tbh-muted)] mb-1.5">
        {label}
      </span>
      {area ? (
        <textarea
          aria-label={label}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={3}
          className={classi}
        />
      ) : (
        <input
          aria-label={label}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={classi}
        />
      )}
    </label>
  );
}

function Select({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: readonly string[];
}) {
  return (
    <label className="block">
      <span className="block text-[11px] uppercase tracking-wide text-[var(--tbh-muted)] mb-1.5">
        {label}
      </span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl bg-black/50 border border-white/15 px-4 py-3 text-sm outline-none focus:border-[var(--tbh-neon)]"
      >
        {options.map((o) => (
          <option key={o} value={o} className="bg-black">
            {o}
          </option>
        ))}
      </select>
    </label>
  );
}
