/**
 * TBH Lavoro — Fonti esterne (06/10/2026): Centri per l'impiego e associazioni
 * territoriali Federalberghi, con ricerca. Censimento progressivo da fonti ufficiali.
 */
import { useMemo, useState } from "react";
import { AlertTriangle, ExternalLink, Mail, MapPin, Phone, Search } from "lucide-react";
import { EvidenzaCercoLavoroHotel, TestataLavoro } from "../components/tbh-lavoro";
import { ASSOCIAZIONI_FEDERALBERGHI, CENTRI_IMPIEGO } from "../lib/fonti-lavoro-dati";
import { corrisponde, dataIt, FONTE_FEDERALBERGHI } from "../lib/fonti-lavoro";

type Vista = "cpi" | "alberghi";
const PASSO = 24;
const sel =
  "w-full min-w-0 rounded-xl border border-[var(--tbh-line)] bg-black px-3 py-2 text-sm focus:border-[var(--tbh-neon)] outline-none";
const uniq = (v: string[]) => [...new Set(v)].sort((a, b) => a.localeCompare(b, "it"));

function Contatti({ telefono, email }: { telefono: string | null; email: string | null }) {
  return (
    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs mt-2">
      {telefono && (
        <a href={`tel:${telefono.replace(/[^\d+]/g, "")}`} className="inline-flex items-center gap-1 hover:text-[var(--tbh-neon)]">
          <Phone size={12} /> {telefono}
        </a>
      )}
      {email && (
        <a href={`mailto:${email}`} className="inline-flex items-center gap-1 hover:text-[var(--tbh-neon)] [overflow-wrap:anywhere]">
          <Mail size={12} /> {email}
        </a>
      )}
    </div>
  );
}

export default function LavoroFontiPage() {
  const [vista, setVista] = useState<Vista>("cpi");
  const [q, setQ] = useState("");
  const [regione, setRegione] = useState("");
  const [provincia, setProvincia] = useState("");
  const [quanti, setQuanti] = useState(PASSO);

  const reset = (v?: Vista) => {
    if (v) setVista(v);
    setQ("");
    setRegione("");
    setProvincia("");
    setQuanti(PASSO);
  };

  const elenco = vista === "cpi" ? CENTRI_IMPIEGO : ASSOCIAZIONI_FEDERALBERGHI;
  const regioni = useMemo(() => uniq(elenco.map((x) => x.regione)), [elenco]);
  const province = useMemo(
    () => uniq(elenco.filter((x) => !regione || x.regione === regione).map((x) => x.provincia)),
    [elenco, regione],
  );

  const cpi = useMemo(
    () =>
      CENTRI_IMPIEGO.filter(
        (c) =>
          (!regione || c.regione === regione) &&
          (!provincia || c.provincia === provincia) &&
          corrisponde(`${c.nome} ${c.provincia} ${c.regione} ${c.territorio ?? ""} ${c.indirizzo ?? ""}`, q),
      ),
    [q, regione, provincia],
  );
  const alb = useMemo(
    () =>
      ASSOCIAZIONI_FEDERALBERGHI.filter(
        (a) =>
          (!regione || a.regione === regione) &&
          (!provincia || a.provincia === provincia) &&
          corrisponde(`${a.nome} ${a.territorio} ${a.provincia} ${a.regione} ${a.indirizzo ?? ""}`, q),
      ),
    [q, regione, provincia],
  );
  const totale = vista === "cpi" ? cpi.length : alb.length;

  return (
    <div className="mx-auto max-w-[1300px] px-4 md:px-8 py-8 md:py-10">
      <TestataLavoro
        occhiello="TBH Lavoro · fonti esterne ufficiali"
        titolo="Centri per l'impiego e associazioni alberghiere"
        testo="Recapiti presi dalle pagine ufficiali di Regioni, agenzie per il lavoro e Federalberghi, con la data di verifica. Per offerte e candidature fanno fede i siti originali."
      />

      <div role="note" className="rounded-2xl border border-[var(--tbh-gold)]/60 bg-[rgba(212,175,55,0.08)] p-4 mb-5 flex gap-3 text-sm">
        <AlertTriangle size={18} className="text-[var(--tbh-gold)] shrink-0 mt-0.5" />
        <div>
          <b>Censimento progressivo, non è un elenco nazionale completo.</b> Centri per l'impiego oggi presenti: Emilia-Romagna,
          Marche, Abruzzo, Molise (recapiti da riconfermare) e provincia di Foggia. Associazioni Federalberghi: tutte le
          127 sedi dell'elenco nazionale ufficiale. Marche: le schede delle singole sedi non sono consultabili
          automaticamente, il link porta all'elenco regionale ufficiale.
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-3" role="tablist">
        {(
          [
            ["cpi", `Centri per l'impiego (${CENTRI_IMPIEGO.length})`],
            ["alberghi", `Federalberghi territoriali (${ASSOCIAZIONI_FEDERALBERGHI.length})`],
          ] as const
        ).map(([v, label]) => (
          <button
            key={v}
            type="button"
            role="tab"
            aria-selected={vista === v}
            onClick={() => reset(v)}
            className={`rounded-full px-4 py-2 text-sm font-semibold border ${
              vista === v ? "bg-[var(--tbh-neon)] text-black border-[var(--tbh-neon)]" : "border-[var(--tbh-line)] hover:border-[var(--tbh-neon)]"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="grid gap-2 sm:grid-cols-[1fr_200px_200px] mb-3">
        <label className="relative min-w-0">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--tbh-muted)]" />
          <input
            type="search"
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setQuanti(PASSO);
            }}
            placeholder={vista === "cpi" ? "Cerca comune, sede, territorio servito…" : "Cerca città, territorio, associazione…"}
            aria-label="Cerca"
            className="w-full rounded-xl border border-[var(--tbh-line)] bg-black pl-9 pr-3 py-2.5 text-sm outline-none focus:border-[var(--tbh-neon)]"
          />
        </label>
        <select aria-label="Regione" value={regione} onChange={(e) => { setRegione(e.target.value); setProvincia(""); setQuanti(PASSO); }} className={sel}>
          <option value="">Tutte le regioni</option>
          {regioni.map((r) => <option key={r}>{r}</option>)}
        </select>
        <select aria-label="Provincia" value={provincia} onChange={(e) => { setProvincia(e.target.value); setQuanti(PASSO); }} className={sel}>
          <option value="">Tutte le province</option>
          {province.map((p) => <option key={p}>{p}</option>)}
        </select>
      </div>
      <p className="text-xs text-[var(--tbh-muted)] mb-4" aria-live="polite">
        <b className="text-white">{totale}</b> risultati
        {(q || regione || provincia) && (
          <button type="button" className="ml-3 text-[var(--tbh-neon)] font-semibold" onClick={() => reset()}>
            Azzera
          </button>
        )}
      </p>

      {totale === 0 && (
        <div className="rounded-2xl border border-dashed border-[var(--tbh-line)] p-8 text-center text-sm text-[var(--tbh-muted)]">
          Nessun risultato. Il territorio potrebbe non essere ancora censito: consulta il portale della tua Regione.
        </div>
      )}

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {vista === "cpi"
          ? cpi.slice(0, quanti).map((c) => (
              <article key={c.id} className="rounded-2xl border border-[var(--tbh-line)] bg-[var(--tbh-surface)] p-4 min-w-0 flex flex-col">
                <p className="text-[10px] uppercase tracking-widest text-[var(--tbh-gold)]">
                  {c.regione} · {c.provincia}
                </p>
                <h2 className="font-semibold leading-snug mt-1 [overflow-wrap:anywhere]">{c.nome}</h2>
                {c.indirizzo && (
                  <p className="text-xs text-[var(--tbh-muted)] mt-1 flex gap-1.5"><MapPin size={12} className="mt-0.5 shrink-0" />{c.indirizzo}</p>
                )}
                {c.territorio && <p className="text-xs text-white/80 mt-1 line-clamp-3">Territorio: {c.territorio}</p>}
                <Contatti telefono={c.telefono} email={c.email} />
                {c.nota && <p className={`text-[11px] mt-2 ${c.stato === "da-riconfermare" ? "text-[var(--tbh-gold)]" : "text-[var(--tbh-muted)]"}`}>{c.nota}</p>}
                <div className="mt-auto pt-3 flex flex-wrap items-center justify-between gap-2 text-[11px] text-[var(--tbh-muted)]">
                  <span>{c.fonte} · verificato {dataIt(c.verificato)}</span>
                  <a href={c.pagina} target="_blank" rel="noreferrer" className="text-[var(--tbh-neon)] font-semibold inline-flex items-center gap-1">
                    Pagina ufficiale <ExternalLink size={11} />
                  </a>
                </div>
              </article>
            ))
          : alb.slice(0, quanti).map((a) => (
              <article key={a.id} className="rounded-2xl border border-[var(--tbh-line)] bg-[var(--tbh-surface)] p-4 min-w-0 flex flex-col">
                <p className="text-[10px] uppercase tracking-widest text-[var(--tbh-gold)]">
                  {a.regione} · {a.provincia}
                </p>
                <h2 className="font-semibold leading-snug mt-1 [overflow-wrap:anywhere]">{a.territorio}</h2>
                <p className="text-xs text-white/80 [overflow-wrap:anywhere]">{a.nome}</p>
                {a.indirizzo && (
                  <p className="text-xs text-[var(--tbh-muted)] mt-1 flex gap-1.5"><MapPin size={12} className="mt-0.5 shrink-0" />{a.indirizzo}</p>
                )}
                <Contatti telefono={a.telefono} email={a.email} />
                <div className="mt-auto pt-3 flex flex-wrap items-center justify-between gap-2 text-[11px] text-[var(--tbh-muted)]">
                  <span>Federalberghi · verificato {dataIt(a.verificato)}</span>
                  {a.sito && (
                    <a href={a.sito} target="_blank" rel="noreferrer" className="text-[var(--tbh-neon)] font-semibold inline-flex items-center gap-1">
                      Sito <ExternalLink size={11} />
                    </a>
                  )}
                </div>
              </article>
            ))}
      </div>

      {totale > quanti && (
        <div className="text-center mt-5">
          <button type="button" onClick={() => setQuanti((n) => n + PASSO)} className="rounded-full border border-[var(--tbh-line)] px-6 py-2.5 text-sm font-semibold hover:border-[var(--tbh-neon)]">
            Mostra altri ({totale - quanti})
          </button>
        </div>
      )}

      {vista === "alberghi" && (
        <p className="text-xs text-[var(--tbh-muted)] mt-4">
          Fonte:{" "}
          <a href={FONTE_FEDERALBERGHI.url} target="_blank" rel="noreferrer" className="text-[var(--tbh-neon)]">
            {FONTE_FEDERALBERGHI.nome}
          </a>
        </p>
      )}

      <div className="mt-10">
        <EvidenzaCercoLavoroHotel />
      </div>
    </div>
  );
}
