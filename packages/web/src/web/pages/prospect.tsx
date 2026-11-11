import { useState } from "react";
import { Link } from "wouter";
import { RiquadroLogo } from "../components/tessera-logo";
import { ExternalLink, Phone, Mail, Search } from "lucide-react";
import { useProspects } from "../queries/rete";
import { SezioneAmministrabile } from "../components/sezione-amministrabile";

const PRIO_COLOR: Record<string, string> = {
  A: "bg-[var(--tbh-neon)] text-black",
  "A/B": "bg-[var(--tbh-gold)] text-black",
  B: "bg-white/15 text-white",
  C: "bg-white/10 text-[var(--tbh-muted)]",
  D: "bg-white/10 text-[var(--tbh-muted)]",
};

function Cell({ value }: { value: string | null }) {
  return value ? (
    <span>{value}</span>
  ) : (
    <span className="text-[var(--tbh-muted)] italic">da verificare</span>
  );
}

export default function ProspectPage() {
  const [regione, setRegione] = useState("Tutte");
  const [settore, setSettore] = useState("Tutti");
  const [priorita, setPriorita] = useState("Tutte");
  const [q, setQ] = useState("");
  const query = useProspects({ regione, settore, priorita, q });
  const d = query.data;

  return (
    <div className="mx-auto max-w-[1500px] px-4 md:px-8 py-10">
      <header className="tbh-rise mb-8">
        <p className="text-xs tracking-[0.25em] text-[var(--tbh-gold)] uppercase mb-2">
          Anagrafica unica TBH + DM
        </p>
        <h1 className="tbh-display tbh-h1">Rete commerciale</h1>
        <p className="tbh-body text-[var(--tbh-muted)] max-w-3xl mt-3">
          Un solo elenco per tutto il gruppo: sponsor, prospect, sport e media. Struttura pronta a
          crescere fino a 500 aziende. Nessun contatto inventato — dove il dato non è confermato
          leggi «da verificare».
        </p>
        <div className="mt-5 flex flex-wrap gap-3 text-sm">
          <span className="px-4 py-2 rounded-full bg-white/10 font-semibold">
            Schede caricate: <b className="text-[var(--tbh-neon)]">{d?.totale ?? "…"}</b>
          </span>
          <span className="px-4 py-2 rounded-full bg-white/10 font-semibold">
            Obiettivo: <b className="text-[var(--tbh-gold)]">{d?.obiettivo ?? 500}</b>
          </span>
          <span className="px-4 py-2 rounded-full bg-white/10 font-semibold">
            Filtro attivo: <b>{query.data?.items.length ?? 0}</b>
          </span>
        </div>
      </header>

      <div className="tbh-card p-4 md:p-5 mb-7 grid gap-3 md:grid-cols-4">
        <label className="flex items-center gap-2 rounded-xl bg-black/60 border border-[var(--tbh-line)] px-3 py-2.5">
          <Search size={16} className="text-[var(--tbh-muted)]" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Cerca azienda, città, settore…"
            aria-label="Cerca azienda, città o settore"
            className="bg-transparent outline-none text-sm w-full"
          />
        </label>
        {[
          { value: regione, set: setRegione, options: d?.regioni ?? ["Tutte"], label: "Regione" },
          { value: settore, set: setSettore, options: d?.settori ?? ["Tutti"], label: "Settore" },
          { value: priorita, set: setPriorita, options: d?.priorita ?? ["Tutte"], label: "Priorità" },
        ].map((s) => (
          <select
            key={s.label}
            value={s.value}
            onChange={(e) => s.set(e.target.value)}
            className="rounded-xl bg-black/60 border border-[var(--tbh-line)] px-3 py-2.5 text-sm outline-none"
          >
            {s.options.map((o) => (
              <option key={o} value={o}>
                {s.label}: {o}
              </option>
            ))}
          </select>
        ))}
      </div>

      {/* Tabella completa desktop */}
      <div className="hidden xl:block tbh-card overflow-x-auto">
        <table className="w-full text-sm border-collapse min-w-[1800px]">
          <thead>
            <tr className="text-left text-[11px] tracking-wider uppercase text-[var(--tbh-gold)] border-b border-[var(--tbh-line)]">
              {(d?.colonne ?? []).map((c) => (
                <th key={c} className="px-3 py-3 whitespace-nowrap">
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {(d?.items ?? []).map((p) => (
              <tr key={p.azienda} className="border-b border-[var(--tbh-line)] align-top">
                <td className="px-3 py-3">
                  {/* Riquadro standard: una sola misura per tutti i marchi (punto 5). */}
                  <RiquadroLogo src={p.logo} alt={p.azienda} misura="sm" />
                </td>
                <td className="px-3 py-3 font-semibold max-w-[280px]">{p.azienda}</td>
                <td className="px-3 py-3">{p.settore}</td>
                <td className="px-3 py-3">{p.citta}</td>
                <td className="px-3 py-3">{p.provincia}</td>
                <td className="px-3 py-3">{p.regione}</td>
                <td className="px-3 py-3">
                  {p.sito ? (
                    <a href={p.sito} target="_blank" rel="noreferrer" className="text-[var(--tbh-neon)] inline-flex items-center gap-1">
                      Sito <ExternalLink size={13} />
                    </a>
                  ) : (
                    <Cell value={null} />
                  )}
                </td>
                <td className="px-3 py-3 whitespace-nowrap">
                  {p.telefono ? (
                    <a href={`tel:${p.telefono.replace(/\s/g, "")}`} className="hover:text-[var(--tbh-neon)]">
                      {p.telefono}
                    </a>
                  ) : (
                    <Cell value={null} />
                  )}
                </td>
                <td className="px-3 py-3">
                  {p.email ? (
                    <a href={`mailto:${p.email}`} className="hover:text-[var(--tbh-neon)]">
                      {p.email}
                    </a>
                  ) : (
                    <Cell value={null} />
                  )}
                </td>
                <td className="px-3 py-3"><Cell value={p.referente} /></td>
                <td className="px-3 py-3"><Cell value={p.social} /></td>
                <td className="px-3 py-3">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${PRIO_COLOR[p.priorita]}`}>
                    {p.priorita}
                  </span>
                </td>
                <td className="px-3 py-3">
                  {p.giaSponsorSport === null ? <Cell value={null} /> : p.giaSponsorSport ? "Sì" : "No"}
                </td>
                <td className="px-3 py-3"><Cell value={p.propostaDM} /></td>
                <td className="px-3 py-3"><Cell value={p.livelloTBH} /></td>
                <td className="px-3 py-3"><Cell value={p.budgetPotenziale} /></td>
                <td className="px-3 py-3 whitespace-nowrap">{p.statoContatto}</td>
                <td className="px-3 py-3 max-w-[260px] text-[var(--tbh-muted)]">
                  <Cell value={p.note} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Schede leggibili su mobile/tablet/TV */}
      <div className="xl:hidden grid gap-5 md:grid-cols-2">
        {(d?.items ?? []).map((p) => (
          <article key={p.azienda} className="tbh-card p-5">
            <div className="flex items-start gap-4">
              <RiquadroLogo src={p.logo} alt={p.azienda} misura="md" />
              <div className="min-w-0">
                <h3 className="tbh-display text-xl leading-tight">{p.azienda}</h3>
                <p className="text-xs text-[var(--tbh-gold)] uppercase tracking-wide mt-1">
                  {p.settore}
                </p>
                <p className="text-sm text-[var(--tbh-muted)]">
                  {p.citta} ({p.provincia}) · {p.regione}
                </p>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2 text-sm">
              <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${PRIO_COLOR[p.priorita]}`}>
                Priorità {p.priorita}
              </span>
              <span className="px-2.5 py-1 rounded-full bg-white/10 text-xs font-semibold">
                {p.statoContatto}
              </span>
            </div>
            <div className="mt-4 grid gap-2 text-sm">
              {p.telefono && (
                <a href={`tel:${p.telefono.replace(/\s/g, "")}`} className="flex items-center gap-2 hover:text-[var(--tbh-neon)]">
                  <Phone size={15} /> {p.telefono}
                </a>
              )}
              {p.email && (
                <a href={`mailto:${p.email}`} className="flex items-center gap-2 hover:text-[var(--tbh-neon)]">
                  <Mail size={15} /> {p.email}
                </a>
              )}
              {p.sito && (
                <a href={p.sito} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-[var(--tbh-neon)]">
                  <ExternalLink size={15} /> Sito ufficiale
                </a>
              )}
            </div>
            {p.note && <p className="mt-3 text-sm text-[var(--tbh-muted)]">{p.note}</p>}
          </article>
        ))}
      </div>

      <section className="mt-14">
        <h2 className="tbh-display tbh-h2 mb-4">Aree da completare</h2>
        <p className="text-sm text-[var(--tbh-muted)] mb-5 max-w-3xl">
          Zone già mappate per la raccolta: appena arrivano i dati verificati, le schede entrano
          nella tabella sopra con la stessa struttura a 18 colonne.
        </p>
        <div className="flex flex-wrap gap-2">
          {(d?.areeMaster ?? []).map((a) => (
            <span key={a} className="px-3.5 py-2 rounded-full bg-white/10 text-sm font-semibold">
              {a}
            </span>
          ))}
        </div>
        <Link to="/in-allestimento" className="tbh-neon-btn inline-block mt-8 px-6 py-3">
          Proponi un'azienda
        </Link>
      </section>
      <div className="mt-14 grid gap-12 border-t border-white/10 pt-10">
        <SezioneAmministrabile sezione="rete-commerciale" />
      </div>
    </div>
  );
}
