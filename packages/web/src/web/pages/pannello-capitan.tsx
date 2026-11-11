/**
 * PANNELLO AMMINISTRATORE — TBH → CAPITAN TOUCH
 * Rotta: /allestimento/capitan-touch  (protetta dal codice di allestimento)
 *
 * Da qui la direzione TBH decide tutto: dove compare l'avatar, quando, con quale
 * probabilità, quanti ritrovamenti al giorno per utente, quali premi e con quale
 * scorta globale (i 5 Neuroni d'Oro sono una scorta, non una probabilità).
 */
import { useMemo, useState } from "react";
import { Link } from "wouter";
import {
  Brain,
  Trophy,
  MapPin,
  Plus,
  Trash2,
  Power,
  BarChart3,
  Users,
  Save,
} from "lucide-react";
import { SbloccoAllestimento, useCodiceAllestimento } from "../components/media-slot";
import {
  useAttivaCaccia,
  useCapitanElenco,
  useCapitanStatistiche,
  useCapitanVincitori,
  useEliminaPosizione,
  useEliminaPremio,
  useSalvaCaccia,
  useSalvaPosizione,
  useSalvaPremio,
} from "../queries/capitan";

const SCHEDE = [
  { id: "caccia", nome: "Caccia" },
  { id: "posizioni", nome: "Posizioni" },
  { id: "premi", nome: "Premi e neuroni" },
  { id: "vincitori", nome: "Vincitori" },
  { id: "statistiche", nome: "Statistiche" },
] as const;

type Scheda = (typeof SCHEDE)[number]["id"];

const NEURONI = ["comune", "speciale", "premio", "oro"] as const;
const AZIONI = ["scheda", "sito", "offerta", "luogo", "coupon"] as const;

const campo =
  "w-full bg-black/60 border border-[var(--tbh-line)] rounded-lg px-3 py-2 text-sm text-white";
const etichetta = "text-xs uppercase tracking-wide text-[var(--tbh-muted)]";

export default function PannelloCapitanPage() {
  const { codice } = useCodiceAllestimento();
  const [scheda, setScheda] = useState<Scheda>("caccia");

  const elenco = useCapitanElenco(codice);
  const statistiche = useCapitanStatistiche(codice);
  const vincitori = useCapitanVincitori(codice);

  const caccia = elenco.data?.cacce[0] ?? null;
  const posizioni = useMemo(
    () => (elenco.data?.posizioni ?? []).filter((p) => p.cacciaId === caccia?.id),
    [elenco.data, caccia],
  );
  const premi = useMemo(
    () => (elenco.data?.premi ?? []).filter((p) => p.cacciaId === caccia?.id),
    [elenco.data, caccia],
  );

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
      <p className="text-xs uppercase tracking-[0.25em] text-[var(--tbh-neon)]">
        TBH · Pannello riservato
      </p>
      <h1 className="tbh-display mt-3">CAPITAN TOUCH</h1>
      <p className="tbh-body mt-4 max-w-[75ch]">
        Regia del gioco «A caccia dei neuroni perduti». La pagina pubblica del gioco è{" "}
        <Link href="/capitan-touch" className="text-[var(--tbh-neon)] underline">
          /capitan-touch
        </Link>
        .
      </p>

      <div className="mt-8">
        <SbloccoAllestimento />
      </div>

      {!codice ? null : (
        <>
          <nav className="mt-8 flex flex-wrap gap-2">
            {SCHEDE.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setScheda(s.id)}
                className={[
                  "px-4 py-2 rounded-full text-sm border",
                  scheda === s.id
                    ? "border-[var(--tbh-neon)] text-[var(--tbh-neon)]"
                    : "border-[var(--tbh-line)] text-[var(--tbh-muted)] hover:text-white",
                ].join(" ")}
              >
                {s.nome}
              </button>
            ))}
          </nav>

          {elenco.isLoading && <p className="tbh-body mt-8">Carico il gioco…</p>}
          {elenco.isError && (
            <p className="tbh-body mt-8 text-[var(--tbh-gold)]">
              Codice non valido oppure server non raggiungibile.
            </p>
          )}

          {caccia && scheda === "caccia" && (
            <FormCaccia codice={codice} caccia={caccia} />
          )}
          {caccia && scheda === "posizioni" && (
            <Posizioni codice={codice} cacciaId={caccia.id} posizioni={posizioni} />
          )}
          {caccia && scheda === "premi" && (
            <Premi codice={codice} cacciaId={caccia.id} premi={premi} />
          )}
          {scheda === "vincitori" && <Vincitori dati={vincitori.data?.items ?? []} />}
          {scheda === "statistiche" && <Statistiche dati={statistiche.data ?? null} />}
        </>
      )}
    </div>
  );
}

/* ─────────────── CACCIA ─────────────── */

type CacciaRiga = NonNullable<ReturnType<typeof useCapitanElenco>["data"]>["cacce"][number];

function FormCaccia({ codice, caccia }: { codice: string; caccia: CacciaRiga }) {
  const salva = useSalvaCaccia();
  const attiva = useAttivaCaccia();
  const [f, setF] = useState({
    nome: caccia.nome,
    probabilita: caccia.probabilita,
    maxAlGiorno: caccia.maxAlGiorno,
    dal: caccia.dal ?? "",
    al: caccia.al ?? "",
    oraDa: caccia.oraDa ?? "",
    oraA: caccia.oraA ?? "",
    sponsor: caccia.sponsor ?? "",
  });

  return (
    <section className="mt-8 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
      <div className="tbh-card p-6">
        <h2 className="tbh-h3">IMPOSTAZIONI DELLA CACCIA</h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <label className="sm:col-span-2">
            <span className={etichetta}>Nome della caccia</span>
            <input
              aria-label="Nome della caccia"
              className={campo}
              value={f.nome}
              onChange={(e) => setF({ ...f, nome: e.target.value })}
            />
          </label>
          <label>
            <span className={etichetta}>Probabilità di comparsa (%)</span>
            <input
              aria-label="Probabilità di comparsa (%)"
              type="number"
              min={1}
              max={100}
              className={campo}
              value={f.probabilita}
              onChange={(e) => setF({ ...f, probabilita: Number(e.target.value) })}
            />
          </label>
          <label>
            <span className={etichetta}>Ritrovamenti al giorno per utente</span>
            <input
              aria-label="Ritrovamenti al giorno per utente"
              type="number"
              min={1}
              max={20}
              className={campo}
              value={f.maxAlGiorno}
              onChange={(e) => setF({ ...f, maxAlGiorno: Number(e.target.value) })}
            />
          </label>
          <label>
            <span className={etichetta}>Dal (AAAA-MM-GG, vuoto = sempre)</span>
            <input
              aria-label="Dal (AAAA-MM-GG, vuoto = sempre)"
              className={campo}
              value={f.dal}
              onChange={(e) => setF({ ...f, dal: e.target.value })}
            />
          </label>
          <label>
            <span className={etichetta}>Al (AAAA-MM-GG, vuoto = sempre)</span>
            <input
              aria-label="Al (AAAA-MM-GG, vuoto = sempre)"
              className={campo}
              value={f.al}
              onChange={(e) => setF({ ...f, al: e.target.value })}
            />
          </label>
          <label>
            <span className={etichetta}>Dall'ora (0-23, vuoto = tutto il giorno)</span>
            <input
              aria-label="Dall'ora (0-23, vuoto = tutto il giorno)"
              className={campo}
              value={f.oraDa}
              onChange={(e) => setF({ ...f, oraDa: e.target.value })}
            />
          </label>
          <label>
            <span className={etichetta}>All'ora (0-23, vuoto = tutto il giorno)</span>
            <input
              aria-label="All'ora (0-23, vuoto = tutto il giorno)"
              className={campo}
              value={f.oraA}
              onChange={(e) => setF({ ...f, oraA: e.target.value })}
            />
          </label>
          <label className="sm:col-span-2">
            <span className={etichetta}>Sponsor della caccia (facoltativo)</span>
            <input
              aria-label="Sponsor della caccia (facoltativo)"
              className={campo}
              value={f.sponsor}
              onChange={(e) => setF({ ...f, sponsor: e.target.value })}
            />
          </label>
        </div>

        <button
          type="button"
          disabled={salva.isPending}
          onClick={() =>
            salva.mutate({
              codice,
              id: caccia.id,
              nome: f.nome,
              attiva: caccia.attiva === 1,
              probabilita: f.probabilita,
              maxAlGiorno: f.maxAlGiorno,
              dal: f.dal || null,
              al: f.al || null,
              oraDa: f.oraDa === "" ? null : Number(f.oraDa),
              oraA: f.oraA === "" ? null : Number(f.oraA),
              sponsor: f.sponsor || null,
            })
          }
          className="tbh-neon-btn mt-6 inline-flex items-center gap-2"
        >
          <Save size={16} /> {salva.isPending ? "Salvo…" : "Salva impostazioni"}
        </button>
        {salva.isSuccess && (
          <p className="text-sm text-[var(--tbh-neon)] mt-3">Impostazioni salvate.</p>
        )}
      </div>

      <div className="tbh-card p-6">
        <h2 className="tbh-h3">ACCESO / SPENTO</h2>
        <p className="text-sm text-[var(--tbh-muted)] mt-3">
          Con la caccia spenta l'avatar non compare in nessuna pagina del portale.
        </p>
        <p className="mt-5 text-2xl font-bold" style={{ color: caccia.attiva === 1 ? "var(--tbh-neon)" : "var(--tbh-gold)" }}>
          {caccia.attiva === 1 ? "IN CORSO" : "SPENTA"}
        </p>
        <button
          type="button"
          disabled={attiva.isPending}
          onClick={() => attiva.mutate({ codice, id: caccia.id, attiva: caccia.attiva !== 1 })}
          className="tbh-neon-btn mt-5 inline-flex items-center gap-2"
        >
          <Power size={16} /> {caccia.attiva === 1 ? "Disattiva" : "Attiva"}
        </button>
      </div>
    </section>
  );
}

/* ─────────────── POSIZIONI ─────────────── */

type PosizioneRiga = NonNullable<
  ReturnType<typeof useCapitanElenco>["data"]
>["posizioni"][number];

function Posizioni({
  codice,
  cacciaId,
  posizioni,
}: {
  codice: string;
  cacciaId: number;
  posizioni: PosizioneRiga[];
}) {
  const salva = useSalvaPosizione();
  const elimina = useEliminaPosizione();
  const [f, setF] = useState({ pagina: "", etichetta: "", peso: 1 });

  return (
    <section className="mt-8 grid gap-6 lg:grid-cols-[1fr_1fr]">
      <div className="tbh-card p-6">
        <h2 className="tbh-h3 inline-flex items-center gap-2">
          <MapPin size={20} className="text-[var(--tbh-neon)]" /> POSIZIONI AUTORIZZATE (
          {posizioni.length})
        </h2>
        <p className="text-sm text-[var(--tbh-muted)] mt-2">
          L'avatar compare solo in queste pagine. Si può usare il jolly: <code>/e/*</code> vale per
          tutte le schede attività, <code>*</code> vale per tutto il portale. Il peso alza la
          frequenza di quella pagina.
        </p>
        <ul className="mt-5 divide-y divide-[var(--tbh-line)]">
          {posizioni.map((p) => (
            <li key={p.id} className="py-3 flex items-center justify-between gap-3">
              <span>
                <strong className="text-white">{p.etichetta}</strong>
                <span className="block text-xs text-[var(--tbh-muted)]">
                  {p.pagina} · peso {p.peso} · {p.attiva === 1 ? "attiva" : "spenta"}
                </span>
              </span>
              <button
                type="button"
                onClick={() => elimina.mutate({ codice, id: p.id })}
                className="text-[var(--tbh-muted)] hover:text-white"
                aria-label={`Elimina ${p.etichetta}`}
              >
                <Trash2 size={18} />
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="tbh-card p-6">
        <h2 className="tbh-h3">NUOVA POSIZIONE</h2>
        <div className="mt-5 grid gap-4">
          <label>
            <span className={etichetta}>Percorso della pagina</span>
            <input
              aria-label="Percorso della pagina"
              className={campo}
              placeholder="/shop"
              value={f.pagina}
              onChange={(e) => setF({ ...f, pagina: e.target.value })}
            />
          </label>
          <label>
            <span className={etichetta}>Etichetta (come la chiami tu)</span>
            <input
              aria-label="Etichetta (come la chiami tu)"
              className={campo}
              placeholder="Touch Plaza — shop"
              value={f.etichetta}
              onChange={(e) => setF({ ...f, etichetta: e.target.value })}
            />
          </label>
          <label>
            <span className={etichetta}>Peso (1 = normale)</span>
            <input
              aria-label="Peso (1 = normale)"
              type="number"
              min={1}
              max={100}
              className={campo}
              value={f.peso}
              onChange={(e) => setF({ ...f, peso: Number(e.target.value) })}
            />
          </label>
        </div>
        <button
          type="button"
          disabled={salva.isPending || f.pagina.length < 1 || f.etichetta.length < 2}
          onClick={() =>
            salva.mutate(
              { codice, cacciaId, pagina: f.pagina, etichetta: f.etichetta, peso: f.peso, attiva: true },
              { onSuccess: () => setF({ pagina: "", etichetta: "", peso: 1 }) },
            )
          }
          className="tbh-neon-btn mt-6 inline-flex items-center gap-2 disabled:opacity-50"
        >
          <Plus size={16} /> Aggiungi posizione
        </button>
      </div>
    </section>
  );
}

/* ─────────────── PREMI ─────────────── */

type PremioRiga = NonNullable<ReturnType<typeof useCapitanElenco>["data"]>["premi"][number];

function Premi({
  codice,
  cacciaId,
  premi,
}: {
  codice: string;
  cacciaId: number;
  premi: PremioRiga[];
}) {
  const salva = useSalvaPremio();
  const elimina = useEliminaPremio();
  const [f, setF] = useState({
    neurone: "premio" as (typeof NEURONI)[number],
    titolo: "",
    descrizione: "",
    disponibili: 1,
    azione: "" as "" | (typeof AZIONI)[number],
    linkUrl: "",
    attivita: "",
  });

  return (
    <section className="mt-8 grid gap-6 lg:grid-cols-[1fr_1fr]">
      <div className="tbh-card p-6">
        <h2 className="tbh-h3 inline-flex items-center gap-2">
          <Trophy size={20} className="text-[var(--tbh-gold)]" /> PREMI IN GIOCO ({premi.length})
        </h2>
        <p className="text-sm text-[var(--tbh-muted)] mt-2">
          «Disponibili» è la scorta globale: mettendo 5 su un Neurone d'Oro, quel premio esce
          cinque volte in tutto il portale e poi sparisce dal gioco.
        </p>
        <ul className="mt-5 divide-y divide-[var(--tbh-line)]">
          {premi.map((p) => (
            <li key={p.id} className="py-3 flex items-start justify-between gap-3">
              <span>
                <strong className="text-white">{p.titolo}</strong>
                <span className="block text-xs text-[var(--tbh-muted)]">
                  {p.neurone} · assegnati {p.assegnati}/{p.disponibili}
                  {p.attivita ? ` · ${p.attivita}` : ""}
                  {p.azione ? ` · azione: ${p.azione}` : ""}
                </span>
              </span>
              <button
                type="button"
                onClick={() => elimina.mutate({ codice, id: p.id })}
                className="text-[var(--tbh-muted)] hover:text-white"
                aria-label={`Elimina ${p.titolo}`}
              >
                <Trash2 size={18} />
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="tbh-card p-6">
        <h2 className="tbh-h3">NUOVO PREMIO</h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <label>
            <span className={etichetta}>Categoria di neurone</span>
            <select
              aria-label="Categoria di neurone"
              className={campo}
              value={f.neurone}
              onChange={(e) => setF({ ...f, neurone: e.target.value as (typeof NEURONI)[number] })}
            >
              {NEURONI.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span className={etichetta}>Scorta globale</span>
            <input
              aria-label="Scorta globale"
              type="number"
              min={0}
              className={campo}
              value={f.disponibili}
              onChange={(e) => setF({ ...f, disponibili: Number(e.target.value) })}
            />
          </label>
          <label className="sm:col-span-2">
            <span className={etichetta}>Titolo del premio</span>
            <input
              aria-label="Titolo del premio"
              className={campo}
              value={f.titolo}
              onChange={(e) => setF({ ...f, titolo: e.target.value })}
            />
          </label>
          <label className="sm:col-span-2">
            <span className={etichetta}>Descrizione (come si riscatta)</span>
            <textarea
              aria-label="Descrizione (come si riscatta)"
              rows={3}
              className={campo}
              value={f.descrizione}
              onChange={(e) => setF({ ...f, descrizione: e.target.value })}
            />
          </label>
          <label>
            <span className={etichetta}>Azione richiesta</span>
            <select
              aria-label="Azione richiesta"
              className={campo}
              value={f.azione}
              onChange={(e) => setF({ ...f, azione: e.target.value as typeof f.azione })}
            >
              <option value="">nessuna</option>
              {AZIONI.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span className={etichetta}>Attività aderente (facoltativa)</span>
            <input
              aria-label="Attività aderente (facoltativa)"
              className={campo}
              value={f.attivita}
              onChange={(e) => setF({ ...f, attivita: e.target.value })}
            />
          </label>
          <label className="sm:col-span-2">
            <span className={etichetta}>Link della scheda, del sito o dell'offerta</span>
            <input
              aria-label="Link della scheda, del sito o dell'offerta"
              className={campo}
              placeholder="/e/nome-attivita oppure https://…"
              value={f.linkUrl}
              onChange={(e) => setF({ ...f, linkUrl: e.target.value })}
            />
          </label>
        </div>
        <button
          type="button"
          disabled={salva.isPending || f.titolo.trim().length < 2}
          onClick={() =>
            salva.mutate(
              {
                codice,
                cacciaId,
                neurone: f.neurone,
                titolo: f.titolo,
                descrizione: f.descrizione || null,
                disponibili: f.disponibili,
                azione: f.azione || null,
                linkUrl: f.linkUrl || null,
                attivita: f.attivita || null,
                attivo: true,
              },
              {
                onSuccess: () =>
                  setF({
                    neurone: "premio",
                    titolo: "",
                    descrizione: "",
                    disponibili: 1,
                    azione: "",
                    linkUrl: "",
                    attivita: "",
                  }),
              },
            )
          }
          className="tbh-neon-btn mt-6 inline-flex items-center gap-2 disabled:opacity-50"
        >
          <Plus size={16} /> Aggiungi premio
        </button>
      </div>
    </section>
  );
}

/* ─────────────── VINCITORI ─────────────── */

type VincitoreRiga = NonNullable<ReturnType<typeof useCapitanVincitori>["data"]>["items"][number];

function Vincitori({ dati }: { dati: VincitoreRiga[] }) {
  return (
    <section className="tbh-card mt-8 p-6">
      <h2 className="tbh-h3 inline-flex items-center gap-2">
        <Users size={20} className="text-[var(--tbh-neon)]" /> VINCITORI ({dati.length})
      </h2>
      <p className="text-sm text-[var(--tbh-muted)] mt-2">
        Senza registrazione non esiste un nome: il giocatore è un codice anonimo del dispositivo.
      </p>
      {!dati.length ? (
        <p className="tbh-body mt-5 text-[var(--tbh-muted)]">Nessun ritrovamento registrato.</p>
      ) : (
        <div className="mt-5 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-[var(--tbh-muted)] text-xs uppercase tracking-wide">
              <tr>
                <th className="text-left py-2 pr-4">Giorno</th>
                <th className="text-left py-2 pr-4">Giocatore</th>
                <th className="text-left py-2 pr-4">Neurone</th>
                <th className="text-left py-2 pr-4">Premio</th>
                <th className="text-left py-2 pr-4">Pagina</th>
                <th className="text-left py-2">Usato</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--tbh-line)]">
              {dati.map((r) => (
                <tr key={r.id}>
                  <td className="py-2 pr-4">{r.giorno}</td>
                  <td className="py-2 pr-4 font-mono text-xs">{r.giocatore}</td>
                  <td className="py-2 pr-4">{r.neurone}</td>
                  <td className="py-2 pr-4">{r.titolo}</td>
                  <td className="py-2 pr-4">{r.pagina}</td>
                  <td className="py-2">{r.usato ? "sì" : "no"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

/* ─────────────── STATISTICHE ─────────────── */

type StatDati = NonNullable<ReturnType<typeof useCapitanStatistiche>["data"]>;

function Statistiche({ dati }: { dati: StatDati | null }) {
  if (!dati) return <p className="tbh-body mt-8">Carico le statistiche…</p>;

  const numeri = [
    { e: "Apparizioni", v: dati.apparizioni },
    { e: "Click (prese)", v: dati.click },
    { e: "Conversione", v: `${dati.conversione}%` },
    { e: "Utenti partecipanti", v: dati.utenti },
    { e: "Utenti con premio", v: dati.utentiConPremio },
    { e: "Premi assegnati", v: dati.premiAssegnati },
    { e: "Premi utilizzati", v: dati.premiUtilizzati },
    { e: "Attività raggiunte", v: dati.attivitaRaggiunte.length },
  ];

  return (
    <section className="mt-8 space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {numeri.map((n) => (
          <div key={n.e} className="tbh-card p-5">
            <p className={etichetta}>{n.e}</p>
            <p className="text-3xl font-bold text-[var(--tbh-neon)] mt-2">{n.v}</p>
          </div>
        ))}
      </div>

      <div className="tbh-card p-6">
        <h2 className="tbh-h3 inline-flex items-center gap-2">
          <BarChart3 size={20} className="text-[var(--tbh-neon)]" /> PAGINE VISITATE DALL'AVATAR
        </h2>
        {!dati.pagine.length ? (
          <p className="tbh-body mt-4 text-[var(--tbh-muted)]">Nessuna apparizione registrata.</p>
        ) : (
          <ul className="mt-4 divide-y divide-[var(--tbh-line)] text-sm">
            {dati.pagine.map((p) => (
              <li key={p.pagina} className="py-2 flex items-center justify-between gap-4">
                <span className="text-white">{p.pagina}</span>
                <span className="text-[var(--tbh-muted)]">
                  {p.apparizioni} apparizioni · {p.ritrovamenti} prese
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="tbh-card p-6">
        <h2 className="tbh-h3 inline-flex items-center gap-2">
          <Brain size={20} className="text-[var(--tbh-neon)]" /> SCORTA PER CATEGORIA
        </h2>
        <ul className="mt-4 divide-y divide-[var(--tbh-line)] text-sm">
          {dati.perNeurone.map((n) => (
            <li key={n.neurone} className="py-2 flex items-center justify-between gap-4">
              <span className="text-white">{n.neurone}</span>
              <span className="text-[var(--tbh-muted)]">
                assegnati {n.assegnati} · scorta {n.scorta}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
