import { useMemo, useState } from "react";
import { Link } from "wouter";
import { ExternalLink, Filter, ListChecks } from "lucide-react";
import { Copertina, type MaterialeVisuale, type TipoVisuale } from "./immagine-tbh";
import { linkCheckoutSalvati } from "./checkout-url";
import { eImmagine } from "./media-slot";
import { etichettaAcquisto } from "./acquisto-esterno";
import type { TipoAcquisto } from "../lib/esterni";

/* ══════════════════════════════════════════════════════════════════════════════
   LISTA DI LAVORO DELL'ALLESTIMENTO — ordine di Claudio del 29/09/2026
   (REGOLE-MASTER, Priorità 2bis).

   «Nel pannello /allestimento aggiungi i filtri: SENZA IMMAGINE · SENZA LOGO ·
    SENZA LINK · SENZA CHECKOUT · SENZA DESCRIZIONE · INCOMPLETI.
    ANTEPRIMA | TITOLO | CATEGORIA | STATO | MODIFICA  →  [ALLESTISCI]»

   Non è un pannello nuovo e non è un secondo archivio: legge la stessa lista di spazi
   che il pannello già costruisce e gli stessi materiali già caricati. Il pulsante
   ALLESTISCI non apre un'altra pagina, sceglie la voce nel pannello che c'è già —
   così resta un solo posto dove si carica (regola anti-doppioni, Priorità 1bis punto g).

   Ogni riga dice la verità e SOLO quello che si può sapere: un criterio che per quella
   voce non ha senso non viene contato. Un corso non ha un logo, quindi non finisce mai
   fra i «senza logo»; un prodotto esterno non ha il nostro checkout, quindi non finisce
   fra i «senza checkout». Niente falsi difetti.
   ══════════════════════════════════════════════════════════════════════════════ */

/** Una voce da allestire, con i dati veri che servono a capire che cosa manca. */
export type VoceAllestimento = {
  slot: string;
  nome: string;
  gruppo: string;
  /** Il tipo di immagine che questa voce vuole: decide anche la scritta di attesa. */
  tipo: TipoVisuale;
  categoria?: string | null;
  pagina?: string | null;
  /** Descrizione già scritta nei dati. `undefined` = questa voce non ha quel campo. */
  descrizione?: string | null;
  /** Sito ufficiale o scheda interna già nei dati. `undefined` = campo non previsto. */
  link?: string | null;
  /** true solo per chi ha davvero un marchio: società, attività, sponsor, partner. */
  haMarchio?: boolean;
  /** Chiave dei link di pagamento incollati a mano. `undefined` = voce senza checkout. */
  checkoutChiave?: string | null;
  /**
   * Link di pagamento GIÀ ufficiale nei dati del sito (per esempio il Payment Link Stripe
   * della TBH Fidelity Consumer): è pubblico per tutti, non solo su questo browser. Se c'è,
   * la voce non è «senza checkout» — si paga già. Senza questo campo la lista accuserebbe
   * come scoperte anche le schede che il pagamento attivo ce l'hanno.
   */
  checkoutUfficiale?: string | null;
  /**
   * Immagine GIÀ presente nei dati del sito (logo di una società, foto di un prodotto del
   * catalogo). Se c'è, la voce non è «senza immagine»: si vede già in pagina. Senza questo
   * campo la lista accuserebbe come vuote anche le voci che un'immagine vera l'hanno —
   * per esempio i corsi Antincendio del negozio, che la loro foto ce l'hanno da sempre.
   */
  immagineEsistente?: string | null;
  /**
   * Prodotti di venditori terzi (Priorità 2bis punto l): chi vende e come si compra.
   * Restano `undefined` per tutto il resto del portale, che non ha un venditore esterno.
   */
  venditore?: string | null;
  tipoAcquisto?: TipoAcquisto | null;
};

/** Il materiale caricato, come arriva dall'archivio. */
type Materiale = MaterialeVisuale & {
  id: number;
  slot: string;
  linkUrl?: string | null;
  stato?: string | null;
};

const FILTRI = [
  { id: "senza-immagine", nome: "Senza immagine" },
  { id: "senza-logo", nome: "Senza logo" },
  { id: "senza-link", nome: "Senza link" },
  { id: "senza-checkout", nome: "Senza checkout" },
  { id: "senza-descrizione", nome: "Senza descrizione" },
  { id: "incompleti", nome: "Incompleti" },
] as const;

type IdFiltro = (typeof FILTRI)[number]["id"];

/**
 * Se un checkout esiste lo dicono due posti, e servono entrambi:
 * 1) il link ufficiale già nei dati del sito, che la voce porta con sé (`checkoutUfficiale`)
 *    ed è pubblico per tutti i visitatori;
 * 2) i link incollati dal pannello, che li scrive e li rilegge un solo file
 *    (components/checkout-url.tsx): qui non si riscrive né il prefisso dell'archivio né
 *    l'elenco dei fornitori, altrimenti fra un mese sarebbero due liste da allineare a mano.
 * Guardare solo il secondo diceva «senza checkout» anche a chi il pagamento ce l'ha già
 * attivo sul sito — era il caso della TBH Fidelity Consumer.
 */
function haCheckout(v: VoceAllestimento) {
  if (v.checkoutUfficiale && v.checkoutUfficiale.trim()) return true;
  if (!v.checkoutChiave) return false;
  try {
    return linkCheckoutSalvati(v.checkoutChiave).length > 0;
  } catch {
    // Navigazione privata o archivio del browser bloccato: non si può sapere, non si accusa.
    return true;
  }
}

/** Che cosa manca a una voce. `null` = criterio non applicabile a questa voce. */
export type Mancanze = {
  immagine: boolean;
  logo: boolean | null;
  link: boolean | null;
  checkout: boolean | null;
  descrizione: boolean | null;
};

export function mancanzeDi(v: VoceAllestimento, materiali: Materiale[]): Mancanze {
  const dello = materiali.filter((m) => m.slot === v.slot);
  const foto = dello.filter((m) => eImmagine(m));
  const gia = !!(v.immagineEsistente && v.immagineEsistente.trim());

  return {
    immagine: foto.length === 0 && !gia,
    // Il logo si chiede SOLO a chi ha un marchio. È la correzione chiesta da Claudio:
    // «non tutto deve avere un logo». Se il logo è già nei dati del sito, non manca.
    logo: v.haMarchio
      ? !gia && !dello.some((m) => m.tipo === "logo" && eImmagine(m))
      : null,
    link:
      v.link === undefined
        ? null
        : !(v.link && v.link.trim()) && !dello.some((m) => (m.linkUrl ?? "").trim()),
    checkout: v.checkoutChiave ? !haCheckout(v) : null,
    descrizione:
      v.descrizione === undefined ? null : !(v.descrizione && v.descrizione.trim()),
  };
}

/** Quante cose mancano davvero (i criteri non applicabili non si contano). */
function quanteMancano(m: Mancanze) {
  return [m.immagine, m.logo, m.link, m.checkout, m.descrizione].filter((x) => x === true)
    .length;
}

export function ListaAllestimento({
  voci,
  materiali,
  onAllestisci,
}: {
  voci: VoceAllestimento[];
  materiali: Materiale[];
  /** Sceglie la voce nel pannello che c'è già: nessuna seconda schermata di caricamento. */
  onAllestisci: (v: VoceAllestimento) => void;
}) {
  const [filtri, setFiltri] = useState<IdFiltro[]>([]);
  const [cerca, setCerca] = useState("");
  const [quante, setQuante] = useState(40);

  const righe = useMemo(() => {
    const q = cerca.trim().toLowerCase();
    return voci
      .map((v) => ({ v, m: mancanzeDi(v, materiali) }))
      .filter(({ v, m }) => {
        if (q && !v.nome.toLowerCase().includes(q) && !v.slot.toLowerCase().includes(q))
          return false;
        if (filtri.length === 0) return true;
        // Più filtri insieme = «mostrami le voci che hanno almeno uno di questi buchi».
        return filtri.some((f) => {
          if (f === "senza-immagine") return m.immagine;
          if (f === "senza-logo") return m.logo === true;
          if (f === "senza-link") return m.link === true;
          if (f === "senza-checkout") return m.checkout === true;
          if (f === "senza-descrizione") return m.descrizione === true;
          return quanteMancano(m) > 0;
        });
      });
  }, [voci, materiali, filtri, cerca]);

  const conti = useMemo(() => {
    const tutte = voci.map((v) => mancanzeDi(v, materiali));
    return {
      "senza-immagine": tutte.filter((m) => m.immagine).length,
      "senza-logo": tutte.filter((m) => m.logo === true).length,
      "senza-link": tutte.filter((m) => m.link === true).length,
      "senza-checkout": tutte.filter((m) => m.checkout === true).length,
      "senza-descrizione": tutte.filter((m) => m.descrizione === true).length,
      incompleti: tutte.filter((m) => quanteMancano(m) > 0).length,
    } as Record<IdFiltro, number>;
  }, [voci, materiali]);

  function inverti(f: IdFiltro) {
    setQuante(40);
    setFiltri((p) => (p.includes(f) ? p.filter((x) => x !== f) : [...p, f]));
  }

  const mostrate = righe.slice(0, quante);

  return (
    <section className="tbh-card p-5 md:p-6 mb-8">
      <div className="flex flex-wrap items-end justify-between gap-3 mb-4">
        <div>
          <p className="text-[11px] uppercase tracking-[0.18em] text-[var(--tbh-gold)] inline-flex items-center gap-2">
            <ListChecks size={14} /> Lista di lavoro
          </p>
          <h2 className="tbh-display tbh-h2 mt-1">Che cosa resta da allestire</h2>
          <p className="text-sm text-[var(--tbh-muted)] mt-2 max-w-3xl">
            Tutte le voci del portale con quello che manca davvero. Un criterio che per una voce
            non esiste non viene chiesto: un corso non ha un logo, un prodotto del venditore non ha
            il nostro checkout. Premi ALLESTISCI e la voce si apre qui sotto, pronta da caricare.
          </p>
        </div>
        <p className="text-sm text-[var(--tbh-muted)]">
          <strong className="text-white">{righe.length}</strong> voci in elenco · {voci.length} in
          tutto
        </p>
      </div>

      <div className="flex flex-wrap gap-2 mb-3">
        {FILTRI.map((f) => {
          const on = filtri.includes(f.id);
          return (
            <button
              key={f.id}
              type="button"
              onClick={() => inverti(f.id)}
              className={`px-3.5 py-2 rounded-full text-xs font-bold uppercase tracking-wide border inline-flex items-center gap-2 transition ${
                on
                  ? "bg-[var(--tbh-neon)] text-black border-[var(--tbh-neon)]"
                  : "border-white/15 text-white hover:border-white/40"
              }`}
            >
              {f.nome}
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                  on ? "bg-black/20" : "bg-white/10 text-[var(--tbh-muted)]"
                }`}
              >
                {conti[f.id]}
              </span>
            </button>
          );
        })}
        {filtri.length > 0 && (
          <button
            type="button"
            onClick={() => setFiltri([])}
            className="px-3.5 py-2 rounded-full text-xs font-bold uppercase tracking-wide border border-white/15 text-[var(--tbh-muted)] hover:border-white/40"
          >
            Togli i filtri
          </button>
        )}
      </div>

      <label className="block mb-4">
        <span className="sr-only">Cerca una voce</span>
        <input
          value={cerca}
          onChange={(e) => {
            setCerca(e.target.value);
            setQuante(40);
          }}
          placeholder="Cerca per nome o per spazio (es. kit beauty, bikini, TBH-001)"
          className="w-full rounded-xl bg-black/40 border border-white/15 px-4 py-2.5 text-sm focus:border-[var(--tbh-neon)] outline-none"
        />
      </label>

      <div className="overflow-x-auto -mx-5 md:-mx-6 px-5 md:px-6">
        <table className="w-full text-sm border-collapse min-w-[840px]">
          <thead>
            <tr className="text-left text-[11px] uppercase tracking-[0.16em] text-[var(--tbh-muted)]">
              <th className="py-2 pr-3 font-semibold w-[130px]">Anteprima</th>
              <th className="py-2 pr-3 font-semibold">Titolo</th>
              <th className="py-2 pr-3 font-semibold w-[150px]">Categoria</th>
              <th className="py-2 pr-3 font-semibold w-[230px]">Stato</th>
              <th className="py-2 font-semibold w-[190px]">Modifica</th>
            </tr>
          </thead>
          <tbody>
            {mostrate.map(({ v, m }) => {
              const buchi = quanteMancano(m);
              const etichette: string[] = [];
              // Quando l'immagine che manca È il logo (società, attività, schede marchio),
              // il file mancante è uno solo: si scrive una volta, non due. I due filtri
              // restano distinti perché servono a Claudio per cercare, ma la riga non
              // deve accusare due volte la stessa mancanza.
              const logoEImmagine = v.tipo === "logo" && m.immagine && m.logo === true;
              if (m.immagine && !logoEImmagine) etichette.push("immagine");
              if (m.logo === true) etichette.push("logo");
              if (m.link === true) etichette.push("link");
              if (m.checkout === true) etichette.push("checkout");
              if (m.descrizione === true) etichette.push("descrizione");
              // Prima il materiale caricato nel pannello; se non c'è ancora, l'immagine
              // che la voce ha già nei dati del sito. Così l'anteprima mostra quello che
              // il visitatore vede davvero in pagina.
              const foto =
                materiali.find((x) => x.slot === v.slot && eImmagine(x)) ??
                (v.immagineEsistente
                  ? { url: v.immagineEsistente, tipo: v.tipo, titolo: v.nome }
                  : undefined);
              return (
                <tr key={v.slot} className="border-t border-white/10 align-middle">
                  <td className="py-3 pr-3">
                    <Copertina
                      item={foto}
                      tipo={v.tipo}
                      uso="card"
                      alt={v.nome}
                      className="w-[112px]"
                      arrotonda="rounded-lg"
                    />
                  </td>
                  <td className="py-3 pr-3">
                    <span className="font-semibold block">{v.nome}</span>
                    <span className="text-[11px] text-[var(--tbh-muted)] block mt-0.5">
                      {v.slot}
                    </span>
                  </td>
                  <td className="py-3 pr-3 text-[var(--tbh-muted)]">
                    {v.categoria?.trim() || v.gruppo}
                    {/* Prodotto di un venditore terzo: si legge subito chi incassa. */}
                    {v.venditore && (
                      <span className="block text-[11px] mt-0.5">
                        {v.venditore}
                        {v.tipoAcquisto ? ` · ${etichettaAcquisto(v.tipoAcquisto)}` : ""}
                      </span>
                    )}
                  </td>
                  <td className="py-3 pr-3">
                    {buchi === 0 ? (
                      <span className="text-[11px] font-bold uppercase tracking-wide text-[var(--tbh-neon)]">
                        Completo
                      </span>
                    ) : (
                      <span className="text-[11px] text-[var(--tbh-gold)]">
                        Manca: {etichette.join(", ")}
                      </span>
                    )}
                  </td>
                  <td className="py-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => onAllestisci(v)}
                        className="px-3.5 py-2 rounded-full text-[11px] font-bold uppercase tracking-wide bg-[var(--tbh-neon)] text-black"
                      >
                        Allestisci
                      </button>
                      {v.pagina && (
                        <Link
                          to={v.pagina}
                          className="text-[11px] text-[var(--tbh-muted)] inline-flex items-center gap-1 hover:text-white"
                        >
                          <ExternalLink size={12} /> Vedi
                        </Link>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
            {mostrate.length === 0 && (
              <tr className="border-t border-white/10">
                <td colSpan={5} className="py-6 text-[var(--tbh-muted)] text-center">
                  <Filter size={16} className="inline mb-1" /> Nessuna voce con questi filtri.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {righe.length > mostrate.length && (
        <button
          type="button"
          onClick={() => setQuante((n) => n + 60)}
          className="mt-4 px-4 py-2.5 rounded-full text-xs font-bold uppercase tracking-wide border border-white/15 hover:border-[var(--tbh-neon)]"
        >
          Mostra altre ({righe.length - mostrate.length} rimaste)
        </button>
      )}
    </section>
  );
}
