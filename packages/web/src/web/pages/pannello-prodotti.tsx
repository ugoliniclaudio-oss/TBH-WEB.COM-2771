import { useMemo, useRef, useState } from "react";
import { Link } from "wouter";
import {
  AlertTriangle,
  BarChart3,
  CheckCircle2,
  Copy,
  CreditCard,
  Loader2,
  MessageCircle,
  PackageOpen,
  Plus,
  Save,
  Trash2,
  Upload,
} from "lucide-react";
import { SbloccoAllestimento, useCodiceAllestimento } from "../components/media-slot";
import {
  useDuplicaProdotto,
  useEliminaProdotto,
  useEventiProdotti,
  useProdottiAdmin,
  useProdottiAdminStato,
  useSalvaProdotto,
} from "../queries/prodotti";
import { useCaricaMedia } from "../queries/media";
import { InAllestimento } from "../components/in-allestimento";
import {
  euro,
  modalitaAcquisto,
  nomeDisponibilita,
  prezziProdotto,
  type Disponibilita,
  type Prodotto,
  type StatoProdotto,
  type VarianteProdotto,
} from "../../api/data/prodotti-tbh";

/**
 * ADMIN → PRODOTTI E GADGET (specifica del 16/09/2026, punti 4-7).
 *
 * Da qui si scrivono le schede vere: nome, codice, categoria, foto e logo
 * caricati davvero, prezzi (pieno, promozione, Fidelity TBH), disponibilità,
 * varianti di colore e taglia, personalizzazione, logo del cliente, Stripe e
 * WhatsApp, date di pubblicazione e scadenza.
 *
 * Regola del portale: niente prezzi, loghi o date inventati. Una scheda senza
 * pagamento configurato non mostra pulsanti finti: sulla pagina pubblica si
 * legge IN ALLESTIMENTO.
 */

type Scheda = "schede" | "conteggi";

const SCHEDE: [Scheda, string][] = [
  ["schede", "Schede prodotto"],
  ["conteggi", "Viste, click e ordini"],
];

/* ─────────────────────────── utilità di scrittura ─────────────────────────── */

/** Da «15,00» o «15.00» a centesimi. Campo vuoto = prezzo non ancora deciso. */
function aCents(v: string): number | null {
  const s = v.trim().replace(/\s|€/g, "").replace(",", ".");
  if (!s) return null;
  const n = Number(s);
  if (!Number.isFinite(n) || n < 0) return null;
  return Math.round(n * 100);
}

/** Da centesimi al testo del campo: «1525» → «15,25». */
function daCents(c: number | null | undefined): string {
  if (c === null || c === undefined) return "";
  return (c / 100).toFixed(2).replace(".", ",");
}

type FormVariante = {
  id: number | null;
  colore: string;
  taglia: string;
  codice: string;
  prezzo: string;
  prezzoPromo: string;
  prezzoFidelity: string;
  stripeLink: string;
  stripePriceId: string;
  immagineUrl: string;
  disponibilita: Disponibilita;
  ordine: number;
};

type FormScheda = {
  id: number | null;
  slug: string;
  nome: string;
  codice: string;
  categoria: string;
  stato: StatoProdotto;
  logoUrl: string;
  descrizione: string;
  galleriaUrl: string;
  prezzo: string;
  prezzoPromo: string;
  prezzoFidelity: string;
  disponibilita: Disponibilita;
  tempiConsegna: string;
  personalizzabile: boolean;
  etichettaPersonalizzazione: string;
  caricaLogoCliente: boolean;
  stripeLink: string;
  stripePriceId: string;
  whatsappNumero: string;
  quantitaMin: number;
  quantitaMax: number;
  dal: string;
  al: string;
  ordine: number;
  varianti: FormVariante[];
};

function varianteVuota(ordine: number): FormVariante {
  return {
    id: null,
    colore: "",
    taglia: "",
    codice: "",
    prezzo: "",
    prezzoPromo: "",
    prezzoFidelity: "",
    stripeLink: "",
    stripePriceId: "",
    immagineUrl: "",
    disponibilita: "in_allestimento",
    ordine,
  };
}

function schedaVuota(whatsapp: string): FormScheda {
  return {
    id: null,
    slug: "",
    nome: "",
    codice: "",
    categoria: "",
    stato: "bozza",
    logoUrl: "",
    descrizione: "",
    galleriaUrl: "",
    prezzo: "",
    prezzoPromo: "",
    prezzoFidelity: "",
    disponibilita: "in_allestimento",
    tempiConsegna: "",
    personalizzabile: false,
    etichettaPersonalizzazione: "",
    caricaLogoCliente: false,
    stripeLink: "",
    stripePriceId: "",
    whatsappNumero: whatsapp,
    quantitaMin: 1,
    quantitaMax: 20,
    dal: "",
    al: "",
    ordine: 0,
    varianti: [],
  };
}

function daProdotto(p: Prodotto): FormScheda {
  return {
    id: p.id,
    slug: p.slug,
    nome: p.nome,
    codice: p.codice ?? "",
    categoria: p.categoria ?? "",
    stato: p.stato,
    logoUrl: p.logoUrl ?? "",
    descrizione: p.descrizione ?? "",
    galleriaUrl: p.galleriaUrl ?? "",
    prezzo: daCents(p.prezzoCents),
    prezzoPromo: daCents(p.prezzoPromoCents),
    prezzoFidelity: daCents(p.prezzoFidelityCents),
    disponibilita: p.disponibilita,
    tempiConsegna: p.tempiConsegna ?? "",
    personalizzabile: p.personalizzabile,
    etichettaPersonalizzazione: p.etichettaPersonalizzazione ?? "",
    caricaLogoCliente: p.caricaLogoCliente,
    stripeLink: p.stripeLink ?? "",
    stripePriceId: p.stripePriceId ?? "",
    whatsappNumero: p.whatsappNumero ?? "",
    quantitaMin: p.quantitaMin,
    quantitaMax: p.quantitaMax,
    dal: p.dal ?? "",
    al: p.al ?? "",
    ordine: p.ordine,
    varianti: p.varianti.map((v: VarianteProdotto, i: number) => ({
      id: v.id,
      colore: v.colore ?? "",
      taglia: v.taglia ?? "",
      codice: v.codice ?? "",
      prezzo: daCents(v.prezzoCents),
      prezzoPromo: daCents(v.prezzoPromoCents),
      prezzoFidelity: daCents(v.prezzoFidelityCents),
      stripeLink: v.stripeLink ?? "",
      stripePriceId: v.stripePriceId ?? "",
      immagineUrl: v.immagineUrl ?? "",
      disponibilita: v.disponibilita,
      ordine: v.ordine || i,
    })),
  };
}

/** Il pacchetto che va al server: testo vuoto = null, mai stringhe finte. */
function perServer(f: FormScheda) {
  const t = (v: string) => (v.trim() ? v.trim() : null);
  return {
    id: f.id ?? null,
    slug: t(f.slug),
    nome: f.nome.trim(),
    codice: t(f.codice),
    categoria: t(f.categoria),
    stato: f.stato,
    logoUrl: t(f.logoUrl),
    descrizione: t(f.descrizione),
    galleriaUrl: t(f.galleriaUrl),
    prezzoCents: aCents(f.prezzo),
    prezzoPromoCents: aCents(f.prezzoPromo),
    prezzoFidelityCents: aCents(f.prezzoFidelity),
    disponibilita: f.disponibilita,
    tempiConsegna: t(f.tempiConsegna),
    personalizzabile: f.personalizzabile,
    etichettaPersonalizzazione: t(f.etichettaPersonalizzazione),
    caricaLogoCliente: f.caricaLogoCliente,
    stripeLink: t(f.stripeLink),
    stripePriceId: t(f.stripePriceId),
    whatsappNumero: t(f.whatsappNumero),
    quantitaMin: Math.max(1, f.quantitaMin || 1),
    quantitaMax: Math.max(1, f.quantitaMax || 1),
    dal: t(f.dal),
    al: t(f.al),
    ordine: f.ordine || 0,
    varianti: f.varianti.map((v, i) => ({
      id: v.id ?? null,
      colore: t(v.colore),
      taglia: t(v.taglia),
      codice: t(v.codice),
      prezzoCents: aCents(v.prezzo),
      prezzoPromoCents: aCents(v.prezzoPromo),
      prezzoFidelityCents: aCents(v.prezzoFidelity),
      stripeLink: t(v.stripeLink),
      stripePriceId: t(v.stripePriceId),
      immagineUrl: t(v.immagineUrl),
      disponibilita: v.disponibilita,
      ordine: v.ordine || i,
    })),
  };
}

/* ───────────────────────────── pezzi di interfaccia ───────────────────────────── */

const ETICHETTA = "text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--tbh-muted)]";
const CAMPO =
  "w-full rounded-xl border border-white/15 bg-black/30 px-3 py-2 text-sm text-white outline-none focus:border-[var(--tbh-neon)]/60";

function Campo({
  etichetta,
  valore,
  onCambia,
  segnaposto,
  tipo = "text",
  aiuto,
}: {
  etichetta: string;
  valore: string;
  onCambia: (v: string) => void;
  segnaposto?: string;
  tipo?: string;
  aiuto?: string;
}) {
  return (
    <label className="grid gap-1.5">
      <span className={ETICHETTA}>{etichetta}</span>
      <input
        type={tipo}
        value={valore}
        placeholder={segnaposto}
        onChange={(e) => onCambia(e.target.value)}
        className={CAMPO}
      />
      {aiuto ? <span className="text-[11px] text-[var(--tbh-muted)]">{aiuto}</span> : null}
    </label>
  );
}

function Scelta<T extends string>({
  etichetta,
  valore,
  onCambia,
  opzioni,
}: {
  etichetta: string;
  valore: T;
  onCambia: (v: T) => void;
  opzioni: { codice: T; nome: string }[];
}) {
  return (
    <label className="grid gap-1.5">
      <span className={ETICHETTA}>{etichetta}</span>
      <select
        value={valore}
        onChange={(e) => onCambia(e.target.value as T)}
        className={CAMPO}
      >
        {opzioni.map((o) => (
          <option key={o.codice} value={o.codice}>
            {o.nome}
          </option>
        ))}
      </select>
    </label>
  );
}

function Interruttore({
  etichetta,
  valore,
  onCambia,
}: {
  etichetta: string;
  valore: boolean;
  onCambia: (v: boolean) => void;
}) {
  return (
    <label className="flex items-center gap-3 rounded-xl border border-white/12 bg-black/20 px-3 py-2">
      <input
        type="checkbox"
        checked={valore}
        onChange={(e) => onCambia(e.target.checked)}
        className="h-4 w-4 accent-[var(--tbh-neon)]"
      />
      <span className="text-sm text-white">{etichetta}</span>
    </label>
  );
}

function Cartellino({ ok, titolo, buono, cattivo }: { ok: boolean; titolo: string; buono: string; cattivo: string }) {
  return (
    <div className="tbh-card p-4 grid gap-1">
      <div className="flex items-center gap-2">
        {ok ? (
          <CheckCircle2 className="text-[var(--tbh-neon)]" size={16} />
        ) : (
          <AlertTriangle className="text-[var(--tbh-gold)]" size={16} />
        )}
        <span className="text-xs font-bold uppercase tracking-[0.16em] text-white">{titolo}</span>
      </div>
      <p className="text-xs text-[var(--tbh-muted)]">{ok ? buono : cattivo}</p>
    </div>
  );
}

/* ───────────────────────────────── pagina ───────────────────────────────── */

export default function PannelloProdottiPage() {
  const { codice } = useCodiceAllestimento();
  const [scheda, setScheda] = useState<Scheda>("schede");

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
          Pannello riservato · prodotti
        </p>
        <h1 className="tbh-display tbh-h1 flex items-center gap-3">
          <PackageOpen className="text-[var(--tbh-neon)] shrink-0" size={32} /> Prodotti e gadget
        </h1>
        <p className="tbh-body text-[var(--tbh-muted)] max-w-3xl mt-3">
          Schede vere del gruppo: varianti, prezzi (pieno, promozione, Fidelity TBH),
          personalizzazione e logo del cliente. Una scheda si vede sul sito solo quando è{" "}
          <strong className="text-white">pubblicata</strong> e dentro le sue date. La vetrina
          pubblica è su{" "}
          <Link href="/gadget" className="text-[var(--tbh-neon)] underline">
            /gadget
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
                className={`rounded-xl px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] ${
                  scheda === k
                    ? "bg-[var(--tbh-neon)] text-black"
                    : "border border-white/20 text-white"
                }`}
              >
                {etichetta}
              </button>
            ))}
          </nav>
          {scheda === "schede" ? <Archivio codice={codice} /> : <Conteggi codice={codice} />}
        </>
      )}
    </div>
  );
}

function StatoServizio({ codice }: { codice: string }) {
  const stato = useProdottiAdminStato(codice);
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      <Cartellino
        ok={Boolean(stato.data?.configurato)}
        titolo="Codice sul server"
        buono="TBH_CODICE_ALLESTIMENTO presente: le scritture sono verificate."
        cattivo="Manca TBH_CODICE_ALLESTIMENTO: il pannello è in sola lettura."
      />
      <Cartellino
        ok={Boolean(stato.data?.valido)}
        titolo="Codice di questo dispositivo"
        buono="Codice riconosciuto."
        cattivo="Codice non riconosciuto dal server."
      />
      <Cartellino
        ok={Boolean(stato.data?.stripeConfigurato)}
        titolo="Pagamento con carta"
        buono="STRIPE_SECRET_KEY presente: la carta funziona anche col solo prezzo in scheda."
        cattivo="Manca STRIPE_SECRET_KEY: servono i Payment Link, altrimenti resta WhatsApp."
      />
    </div>
  );
}

/* ───────────────────────────────── archivio ───────────────────────────────── */

function Archivio({ codice }: { codice: string }) {
  const q = useProdottiAdmin(codice);
  const duplica = useDuplicaProdotto();
  const elimina = useEliminaProdotto();
  const [apertaId, setApertaId] = useState<number | "nuova" | null>(null);

  const d = q.data;
  const whatsappPredefinito = d?.whatsappPredefinito ?? "";

  if (q.isLoading) return <div className="tbh-card h-64 animate-pulse" />;
  if (q.isError)
    return (
      <p className="tbh-card p-4 text-sm text-[var(--tbh-gold)]">
        {q.error instanceof Error ? q.error.message : "Archivio non leggibile."}
      </p>
    );

  const prodotti = d?.prodotti ?? [];

  return (
    <div className="grid gap-5">
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => setApertaId(apertaId === "nuova" ? null : "nuova")}
          className="inline-flex items-center gap-2 rounded-xl bg-[var(--tbh-neon)] px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] text-black"
        >
          <Plus size={15} /> Nuova scheda
        </button>
        <span className="text-xs text-[var(--tbh-muted)]">
          {prodotti.length === 0
            ? "Archivio vuoto."
            : `${prodotti.length} schede in archivio · ${prodotti.filter((p) => p.inVetrina).length} in vetrina adesso.`}
        </span>
      </div>

      {apertaId === "nuova" ? (
        <Modulo
          codice={codice}
          iniziale={schedaVuota(whatsappPredefinito)}
          opzioni={d}
          onChiudi={() => setApertaId(null)}
        />
      ) : null}

      {prodotti.length === 0 ? (
        <InAllestimento cosa="L'archivio dei prodotti e dei gadget" compatto />
      ) : (
        <div className="grid gap-3">
          {prodotti.map((p) => {
            const prezzi = prezziProdotto(p, null);
            const modo = modalitaAcquisto(p, null, prezzi.attivo);
            return (
              <div key={p.id} className="tbh-card p-4 grid gap-3">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="grid gap-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-bold text-white">{p.nome}</span>
                      <span
                        className={`rounded-lg px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em] ${
                          p.inVetrina
                            ? "bg-[var(--tbh-neon)]/20 text-[var(--tbh-neon)]"
                            : "bg-white/10 text-[var(--tbh-muted)]"
                        }`}
                      >
                        {p.inVetrina ? "In vetrina" : p.stato === "pubblicato" ? "Fuori finestra" : p.stato}
                      </span>
                      {p.scaduta ? (
                        <span className="rounded-lg bg-[var(--tbh-gold)]/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--tbh-gold)]">
                          Scaduta · sospesa da sola
                        </span>
                      ) : null}
                    </div>
                    <p className="text-xs text-[var(--tbh-muted)]">
                      /gadget/{p.slug} · {p.categoria ?? "senza categoria"} ·{" "}
                      {nomeDisponibilita(p.disponibilita)} · {p.varianti.length} varianti ·{" "}
                      {prezzi.attivo !== null ? euro(prezzi.attivo) : "prezzo in allestimento"}
                    </p>
                    <p className="text-xs text-[var(--tbh-muted)]">
                      Viste {p.viste} · click {p.click} · aperture acquisto {p.aperture} · ordini{" "}
                      {p.ordini} ·{" "}
                      {modo.stripe && modo.whatsapp
                        ? "carta + WhatsApp"
                        : modo.stripe
                          ? "solo carta"
                          : modo.whatsapp
                            ? "solo WhatsApp"
                            : "nessun acquisto: IN ALLESTIMENTO"}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Link
                      href={`/gadget/${p.slug}`}
                      className="rounded-xl border border-white/20 px-3 py-1.5 text-xs font-bold text-white"
                    >
                      Apri pagina
                    </Link>
                    <button
                      type="button"
                      onClick={() => setApertaId(apertaId === p.id ? null : p.id)}
                      className="rounded-xl border border-[var(--tbh-neon)]/60 px-3 py-1.5 text-xs font-bold text-[var(--tbh-neon)]"
                    >
                      {apertaId === p.id ? "Chiudi" : "Modifica"}
                    </button>
                    <button
                      type="button"
                      onClick={() => duplica.mutate({ codice, id: p.id })}
                      disabled={duplica.isPending}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-white/20 px-3 py-1.5 text-xs font-bold text-white disabled:opacity-40"
                    >
                      <Copy size={13} /> Duplica
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (window.confirm(`Eliminare definitivamente «${p.nome}»?`))
                          elimina.mutate({ codice, id: p.id });
                      }}
                      disabled={elimina.isPending}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--tbh-gold)]/50 px-3 py-1.5 text-xs font-bold text-[var(--tbh-gold)] disabled:opacity-40"
                    >
                      <Trash2 size={13} /> Elimina
                    </button>
                  </div>
                </div>

                {apertaId === p.id ? (
                  <Modulo
                    codice={codice}
                    iniziale={daProdotto(p)}
                    opzioni={d}
                    onChiudi={() => setApertaId(null)}
                  />
                ) : null}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ───────────────────────────────── modulo ───────────────────────────────── */

type Opzioni = ReturnType<typeof useProdottiAdmin>["data"];

function Modulo({
  codice,
  iniziale,
  opzioni,
  onChiudi,
}: {
  codice: string;
  iniziale: FormScheda;
  opzioni: Opzioni;
  onChiudi: () => void;
}) {
  const [f, setF] = useState<FormScheda>(iniziale);
  const salva = useSalvaProdotto();
  const carica = useCaricaMedia();
  const campoLogo = useRef<HTMLInputElement | null>(null);
  const campoGalleria = useRef<HTMLInputElement | null>(null);

  const categorie = useMemo(
    () => [
      { codice: "", nome: "— senza categoria —" },
      ...(opzioni?.categorie ?? []).map((c) => ({ codice: c, nome: c })),
    ],
    [opzioni],
  );
  const stati = (opzioni?.stati ?? []).map((s) => ({ codice: s.codice, nome: s.nome }));
  const disponibilita = opzioni?.disponibilita ?? [];

  const prezzi = prezziProdotto(
    {
      prezzoCents: aCents(f.prezzo),
      prezzoPromoCents: aCents(f.prezzoPromo),
      prezzoFidelityCents: aCents(f.prezzoFidelity),
    },
    null,
  );
  const modo = modalitaAcquisto(
    {
      stripeLink: f.stripeLink || null,
      stripePriceId: f.stripePriceId || null,
      whatsappNumero: f.whatsappNumero || null,
      disponibilita: f.disponibilita,
    },
    null,
    prezzi.attivo,
  );

  function cambia<K extends keyof FormScheda>(k: K, v: FormScheda[K]) {
    setF((p) => ({ ...p, [k]: v }));
  }

  async function caricaFile(file: File, dove: "logo" | "galleria") {
    const esito = await carica.mutateAsync({
      codice,
      slot: `prodotto:${f.slug || f.nome || "nuova"}:${dove}`,
      file,
      tipo: file.type.startsWith("video/") ? "slide" : dove === "logo" ? "logo" : "immagine",
      titolo: f.nome ? `${f.nome} — ${dove}` : `Prodotto — ${dove}`,
    });
    if (dove === "logo") cambia("logoUrl", esito.url);
    else cambia("galleriaUrl", [f.galleriaUrl.trim(), esito.url].filter(Boolean).join("\n"));
  }

  function scrivi(stato?: StatoProdotto) {
    const prodotto = perServer(stato ? { ...f, stato } : f);
    salva.mutate(
      { codice, prodotto },
      {
        onSuccess: (r) => {
          setF((p) => ({ ...p, id: r.id, slug: r.slug ?? p.slug, ...(stato ? { stato } : {}) }));
        },
      },
    );
  }

  return (
    <div className="grid gap-5 rounded-2xl border border-white/12 bg-black/25 p-4 md:p-5">
      {/* ── identità ── */}
      <div className="grid gap-3 md:grid-cols-3">
        <Campo etichetta="Nome della scheda" valore={f.nome} onCambia={(v) => cambia("nome", v)} segnaposto="Felpa TBH Crew" />
        <Campo etichetta="Codice articolo" valore={f.codice} onCambia={(v) => cambia("codice", v)} segnaposto="TBH-FLP-001" />
        <Campo
          etichetta="Indirizzo della pagina"
          valore={f.slug}
          onCambia={(v) => cambia("slug", v)}
          segnaposto="lo scrive il server"
          aiuto="Vuoto = lo genera il server dal nome."
        />
        <Scelta etichetta="Categoria" valore={f.categoria} onCambia={(v) => cambia("categoria", v)} opzioni={categorie} />
        <Scelta etichetta="Stato" valore={f.stato} onCambia={(v) => cambia("stato", v)} opzioni={stati} />
        <Scelta
          etichetta="Disponibilità"
          valore={f.disponibilita}
          onCambia={(v) => cambia("disponibilita", v)}
          opzioni={disponibilita}
        />
      </div>

      {/* ── immagini reali ── */}
      <div className="grid gap-3 md:grid-cols-2">
        <div className="grid gap-2">
          <Campo
            etichetta="Logo o foto principale (indirizzo)"
            valore={f.logoUrl}
            onCambia={(v) => cambia("logoUrl", v)}
            segnaposto="https://…"
            aiuto="Solo materiale originale: nessuna immagine generata."
          />
          <input
            ref={campoLogo}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void caricaFile(file, "logo");
              e.target.value = "";
            }}
          />
          <button
            type="button"
            onClick={() => campoLogo.current?.click()}
            disabled={carica.isPending}
            className="inline-flex w-fit items-center gap-2 rounded-xl border border-[var(--tbh-neon)]/60 px-3 py-1.5 text-xs font-bold text-[var(--tbh-neon)] disabled:opacity-40"
          >
            {carica.isPending ? <Loader2 className="animate-spin" size={13} /> : <Upload size={13} />}{" "}
            Carica file
          </button>
        </div>
        <div className="grid gap-2">
          <label className="grid gap-1.5">
            <span className={ETICHETTA}>Galleria — un indirizzo per riga</span>
            <textarea
              value={f.galleriaUrl}
              onChange={(e) => cambia("galleriaUrl", e.target.value)}
              rows={4}
              placeholder={"https://…/foto-1.jpg\nhttps://…/video.mp4"}
              className={CAMPO}
            />
          </label>
          <input
            ref={campoGalleria}
            type="file"
            accept="image/*,video/mp4,video/webm,application/pdf"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void caricaFile(file, "galleria");
              e.target.value = "";
            }}
          />
          <button
            type="button"
            onClick={() => campoGalleria.current?.click()}
            disabled={carica.isPending}
            className="inline-flex w-fit items-center gap-2 rounded-xl border border-white/25 px-3 py-1.5 text-xs font-bold text-white disabled:opacity-40"
          >
            {carica.isPending ? <Loader2 className="animate-spin" size={13} /> : <Upload size={13} />}{" "}
            Aggiungi file alla galleria
          </button>
        </div>
      </div>
      {carica.isError ? (
        <p className="text-xs text-[var(--tbh-gold)]">
          {carica.error instanceof Error ? carica.error.message : "Caricamento non riuscito."}
        </p>
      ) : null}

      <label className="grid gap-1.5">
        <span className={ETICHETTA}>Descrizione</span>
        <textarea
          value={f.descrizione}
          onChange={(e) => cambia("descrizione", e.target.value)}
          rows={3}
          placeholder="Che cos'è, com'è fatto, come si personalizza."
          className={CAMPO}
        />
      </label>

      {/* ── prezzi ── */}
      <div className="grid gap-3 md:grid-cols-4">
        <Campo etichetta="Prezzo pieno €" valore={f.prezzo} onCambia={(v) => cambia("prezzo", v)} segnaposto="15,00" />
        <Campo etichetta="Promozione €" valore={f.prezzoPromo} onCambia={(v) => cambia("prezzoPromo", v)} segnaposto="12,00" />
        <Campo
          etichetta="Fidelity TBH €"
          valore={f.prezzoFidelity}
          onCambia={(v) => cambia("prezzoFidelity", v)}
          segnaposto="10,00"
        />
        <Campo
          etichetta="Tempi di consegna"
          valore={f.tempiConsegna}
          onCambia={(v) => cambia("tempiConsegna", v)}
          segnaposto="10 giorni lavorativi"
        />
      </div>
      <p className="text-xs text-[var(--tbh-muted)]">
        Prezzo che il cliente vede adesso:{" "}
        <strong className="text-white">
          {prezzi.attivo !== null ? euro(prezzi.attivo) : "IN ALLESTIMENTO (nessun prezzo scritto)"}
        </strong>
        . Campo vuoto = prezzo non deciso: non si inventa.
      </p>

      {/* ── personalizzazione ── */}
      <div className="grid gap-3 md:grid-cols-3">
        <Interruttore
          etichetta="Personalizzabile (testo del cliente)"
          valore={f.personalizzabile}
          onCambia={(v) => cambia("personalizzabile", v)}
        />
        <Campo
          etichetta="Etichetta della personalizzazione"
          valore={f.etichettaPersonalizzazione}
          onCambia={(v) => cambia("etichettaPersonalizzazione", v)}
          segnaposto="Nome sulla schiena"
        />
        <Interruttore
          etichetta="Il cliente può caricare il suo logo"
          valore={f.caricaLogoCliente}
          onCambia={(v) => cambia("caricaLogoCliente", v)}
        />
      </div>

      {/* ── acquisto ── */}
      <div className="grid gap-3 md:grid-cols-3">
        <Campo
          etichetta="Stripe · Payment Link"
          valore={f.stripeLink}
          onCambia={(v) => cambia("stripeLink", v)}
          segnaposto="https://buy.stripe.com/…"
        />
        <Campo
          etichetta="Stripe · Price ID"
          valore={f.stripePriceId}
          onCambia={(v) => cambia("stripePriceId", v)}
          segnaposto="price_…"
        />
        <Campo
          etichetta="WhatsApp per gli ordini"
          valore={f.whatsappNumero}
          onCambia={(v) => cambia("whatsappNumero", v)}
          segnaposto={opzioni?.whatsappPredefinito ?? "+39 379 208 8524"}
        />
      </div>
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className={ETICHETTA}>Pulsanti che vedrà il cliente:</span>
        {modo.testoStripe ? (
          <span className="inline-flex items-center gap-1.5 rounded-xl bg-[var(--tbh-neon)]/20 px-3 py-1.5 font-bold text-[var(--tbh-neon)]">
            <CreditCard size={13} /> {modo.testoStripe}
          </span>
        ) : null}
        {modo.testoWhatsapp ? (
          <span className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-500/15 px-3 py-1.5 font-bold text-emerald-300">
            <MessageCircle size={13} /> {modo.testoWhatsapp}
          </span>
        ) : null}
        {modo.inAllestimento ? (
          <span className="rounded-xl bg-white/10 px-3 py-1.5 font-bold text-[var(--tbh-muted)]">
            IN ALLESTIMENTO — nessun pulsante d'acquisto
          </span>
        ) : null}
      </div>

      {/* ── quantità, date, ordine ── */}
      <div className="grid gap-3 md:grid-cols-5">
        <Campo
          etichetta="Quantità minima"
          valore={String(f.quantitaMin)}
          onCambia={(v) => cambia("quantitaMin", Math.max(1, Number(v) || 1))}
          tipo="number"
        />
        <Campo
          etichetta="Quantità massima"
          valore={String(f.quantitaMax)}
          onCambia={(v) => cambia("quantitaMax", Math.max(1, Number(v) || 1))}
          tipo="number"
        />
        <Campo etichetta="In vendita dal" valore={f.dal} onCambia={(v) => cambia("dal", v)} tipo="date" />
        <Campo
          etichetta="Fino al"
          valore={f.al}
          onCambia={(v) => cambia("al", v)}
          tipo="date"
          aiuto="Passata la data la scheda si sospende da sola, senza cancellarsi."
        />
        <Campo
          etichetta="Ordine in vetrina"
          valore={String(f.ordine)}
          onCambia={(v) => cambia("ordine", Number(v) || 0)}
          tipo="number"
        />
      </div>

      {/* ── varianti ── */}
      <Varianti f={f} setF={setF} opzioni={opzioni} />

      {/* ── comandi ── */}
      <div className="flex flex-wrap items-center gap-2 border-t border-white/10 pt-4">
        <button
          type="button"
          onClick={() => scrivi()}
          disabled={salva.isPending || f.nome.trim().length < 2}
          className="inline-flex items-center gap-2 rounded-xl border border-white/20 px-4 py-2 text-xs font-bold text-white disabled:opacity-40"
        >
          {salva.isPending ? <Loader2 className="animate-spin" size={14} /> : <Save size={14} />} Salva
        </button>
        <button
          type="button"
          onClick={() => scrivi("pubblicato")}
          disabled={salva.isPending || f.nome.trim().length < 2}
          className="rounded-xl bg-[var(--tbh-neon)] px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] text-black disabled:opacity-40"
        >
          Pubblica in vetrina
        </button>
        <button
          type="button"
          onClick={() => scrivi("sospeso")}
          disabled={salva.isPending || f.nome.trim().length < 2}
          className="rounded-xl border border-white/20 px-4 py-2 text-xs font-bold text-white disabled:opacity-40"
        >
          Sospendi
        </button>
        {f.slug ? (
          <Link
            href={`/gadget/${f.slug}`}
            className="rounded-xl border border-white/20 px-4 py-2 text-xs font-bold text-white"
          >
            Apri pagina
          </Link>
        ) : null}
        <button type="button" onClick={onChiudi} className="px-3 py-2 text-xs font-bold text-[var(--tbh-muted)]">
          Chiudi
        </button>
        {salva.isSuccess ? (
          <span className="text-xs text-[var(--tbh-neon)]">Scritto sul server.</span>
        ) : null}
        {salva.isError ? (
          <span className="text-xs text-[var(--tbh-gold)]">
            {salva.error instanceof Error ? salva.error.message : "Salvataggio non riuscito."}
          </span>
        ) : null}
      </div>
    </div>
  );
}

function Varianti({
  f,
  setF,
  opzioni,
}: {
  f: FormScheda;
  setF: (fn: (p: FormScheda) => FormScheda) => void;
  opzioni: Opzioni;
}) {
  const disponibilita = opzioni?.disponibilita ?? [];
  const taglie = opzioni?.taglie ?? [];

  function cambiaV(i: number, k: keyof FormVariante, v: string | number) {
    setF((p) => ({
      ...p,
      varianti: p.varianti.map((x, j) => (j === i ? { ...x, [k]: v } : x)),
    }));
  }

  return (
    <div className="grid gap-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className={ETICHETTA}>Varianti (colore, taglia, prezzo, Stripe)</span>
        <button
          type="button"
          onClick={() => setF((p) => ({ ...p, varianti: [...p.varianti, varianteVuota(p.varianti.length)] }))}
          className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--tbh-neon)]/60 px-3 py-1.5 text-xs font-bold text-[var(--tbh-neon)]"
        >
          <Plus size={13} /> Aggiungi variante
        </button>
      </div>

      {f.varianti.length === 0 ? (
        <p className="text-xs text-[var(--tbh-muted)]">
          Nessuna variante: la scheda si vende con i prezzi e la disponibilità scritti sopra.
        </p>
      ) : (
        f.varianti.map((v, i) => (
          <div key={v.id ?? `nuova-${i}`} className="grid gap-3 rounded-xl border border-white/10 p-3">
            <div className="grid gap-3 md:grid-cols-4">
              <Campo etichetta="Colore" valore={v.colore} onCambia={(x) => cambiaV(i, "colore", x)} segnaposto="Nero" />
              <Campo
                etichetta="Taglia"
                valore={v.taglia}
                onCambia={(x) => cambiaV(i, "taglia", x)}
                segnaposto={taglie.join(" · ")}
              />
              <Campo etichetta="Codice variante" valore={v.codice} onCambia={(x) => cambiaV(i, "codice", x)} />
              <Scelta
                etichetta="Disponibilità"
                valore={v.disponibilita}
                onCambia={(x) => cambiaV(i, "disponibilita", x)}
                opzioni={disponibilita}
              />
            </div>
            <div className="grid gap-3 md:grid-cols-4">
              <Campo etichetta="Prezzo pieno €" valore={v.prezzo} onCambia={(x) => cambiaV(i, "prezzo", x)} />
              <Campo etichetta="Promozione €" valore={v.prezzoPromo} onCambia={(x) => cambiaV(i, "prezzoPromo", x)} />
              <Campo
                etichetta="Fidelity TBH €"
                valore={v.prezzoFidelity}
                onCambia={(x) => cambiaV(i, "prezzoFidelity", x)}
              />
              <Campo
                etichetta="Ordine"
                valore={String(v.ordine)}
                onCambia={(x) => cambiaV(i, "ordine", Number(x) || 0)}
                tipo="number"
              />
            </div>
            <div className="grid gap-3 md:grid-cols-3">
              <Campo etichetta="Stripe · Payment Link" valore={v.stripeLink} onCambia={(x) => cambiaV(i, "stripeLink", x)} />
              <Campo etichetta="Stripe · Price ID" valore={v.stripePriceId} onCambia={(x) => cambiaV(i, "stripePriceId", x)} />
              <Campo etichetta="Foto della variante" valore={v.immagineUrl} onCambia={(x) => cambiaV(i, "immagineUrl", x)} />
            </div>
            <button
              type="button"
              onClick={() => setF((p) => ({ ...p, varianti: p.varianti.filter((_, j) => j !== i) }))}
              className="inline-flex w-fit items-center gap-1.5 rounded-xl border border-[var(--tbh-gold)]/50 px-3 py-1.5 text-xs font-bold text-[var(--tbh-gold)]"
            >
              <Trash2 size={13} /> Togli variante
            </button>
          </div>
        ))
      )}
    </div>
  );
}

/* ───────────────────────────── viste, click, ordini ───────────────────────────── */

function Conteggi({ codice }: { codice: string }) {
  const q = useEventiProdotti(codice);
  if (q.isLoading) return <div className="tbh-card h-48 animate-pulse" />;
  const eventi = q.data?.eventi ?? [];
  const ordini = q.data?.ordini ?? [];

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <div className="tbh-card p-4 grid gap-3">
        <div className="flex items-center gap-2">
          <BarChart3 size={16} className="text-[var(--tbh-neon)]" />
          <span className="text-xs font-bold uppercase tracking-[0.16em] text-white">
            Ultimi eventi reali
          </span>
        </div>
        {eventi.length === 0 ? (
          <p className="text-xs text-[var(--tbh-muted)]">
            Nessun evento registrato: i conteggi partono dalla prima visita vera.
          </p>
        ) : (
          <ul className="grid gap-1.5 text-xs text-[var(--tbh-muted)]">
            {eventi.slice(0, 40).map((e) => (
              <li key={e.id}>
                #{e.prodottoId} · {e.tipo}
                {e.varianteId ? ` · variante ${e.varianteId}` : ""} ·{" "}
                {String(e.createdAt ?? "").slice(0, 19).replace("T", " ")}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="tbh-card p-4 grid gap-3">
        <div className="flex items-center gap-2">
          <CreditCard size={16} className="text-[var(--tbh-neon)]" />
          <span className="text-xs font-bold uppercase tracking-[0.16em] text-white">
            Ordini collegati alle schede
          </span>
        </div>
        {ordini.length === 0 ? (
          <p className="text-xs text-[var(--tbh-muted)]">
            Nessun ordine: qui compaiono solo righe vere, mai numeri di esempio.
          </p>
        ) : (
          <ul className="grid gap-1.5 text-xs text-[var(--tbh-muted)]">
            {ordini.slice(0, 40).map((o) => (
              <li key={o.id}>
                Ordine #{o.id} · scheda #{o.prodottoId} · {euro(o.amountCents ?? null)} ·{" "}
                {o.status ?? "in attesa"} ·{" "}
                {String(o.createdAt ?? "").slice(0, 19).replace("T", " ")}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
