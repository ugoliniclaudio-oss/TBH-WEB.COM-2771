/**
 * «HAI UN'ATTIVITÀ? DICCI COSA TI SERVE.» — servizi TBH per le imprese (03/10/2026)
 *
 * Testi trascritti come li ha consegnati Claudio, con la sua locandina ufficiale
 * (usata così com'è). Nessun prezzo, tempo o nome di cliente aggiunto.
 *
 * Regola «anteprima → pulsante → scheda»: ogni servizio è un'anteprima con
 * appartenenza TBH e apre la sua scheda di richiesta (#servizio-<id>), dove
 * WhatsApp ed e-mail partono già compilati con il nome del servizio. Nessun
 * pulsante senza destinazione.
 */
import { useEffect, useMemo, useState } from "react";
import { MessageCircle, Mail, Globe, Check, Send, ArrowDown } from "lucide-react";
import { FasciaAppartenenza } from "../components/anteprima-pulsante";
import { TBH } from "../lib/appartenenza";

const WA_NUM = "393792088524";
const EMAIL = "marketing@tibihacca.com";
const SITO = "https://tbh-web.com";
const BASE = "/servizi-imprese";

const SERVIZI = [
  {
    id: "personale",
    emoji: "👥",
    titolo: "Personale e collaboratori",
    testo: "Supporto nella ricerca di figure per la stagione, sostituzioni e picchi di lavoro.",
  },
  {
    id: "urgenze",
    emoji: "⚡",
    titolo: "Urgenze e supporto operativo",
    testo:
      "Valutazione delle necessità e delle disponibilità per affrontare imprevisti e periodi di maggiore attività.",
  },
  {
    id: "logistica",
    emoji: "🚚",
    titolo: "Logistica",
    testo: "Organizzazione, movimentazione, allestimenti e supporto per attività, fiere ed eventi.",
  },
  {
    id: "formazione",
    emoji: "🎓",
    titolo: "Formazione",
    testo: "Percorsi per sviluppare le competenze tue e del tuo team.",
  },
  {
    id: "eventi",
    emoji: "🎪",
    titolo: "Eventi e intrattenimento",
    testo: "DJ, artisti, animazione e iniziative per coinvolgere clienti e ospiti.",
  },
  {
    id: "audiovisivi",
    emoji: "🎥",
    titolo: "Foto, video e audiovisivi",
    testo:
      "Contenuti per presentare strutture, prodotti e servizi; produzioni per eventi e comunicazione.",
  },
  {
    id: "grafica",
    emoji: "🎨",
    titolo: "Grafica",
    testo: "Locandine, menu, cataloghi e materiali promozionali digitali e stampati.",
  },
  {
    id: "noleggi",
    emoji: "📦",
    titolo: "Noleggi",
    testo: "Ricerca di attrezzature e soluzioni adatte alle esigenze della tua attività.",
  },
  {
    id: "pubblicita",
    emoji: "📣",
    titolo: "Comunicazione e pubblicità",
    testo: "Campagne, contenuti e spazi promozionali per far conoscere ciò che offri.",
  },
] as const;

type IdServizio = (typeof SERVIZI)[number]["id"];

const DA_DOVE = [
  { k: "cosa", label: "Che cosa ti serve", ph: "Es. 2 camerieri per il weekend" },
  { k: "citta", label: "In quale città", ph: "Città" },
  { k: "periodo", label: "Per quale periodo o data", ph: "Periodo o data" },
  { k: "recapito", label: "Un recapito", ph: "Telefono o e-mail" },
  { k: "referente", label: "Il nome del referente", ph: "Nome e cognome" },
] as const;

type Campi = Record<(typeof DA_DOVE)[number]["k"], string>;

function messaggio(servizi: string[], c?: Partial<Campi>) {
  const righe = [
    "Ciao TBH, ho un'attività e vorrei una proposta TBH.",
    servizi.length ? `Servizi: ${servizi.join(", ")}` : "Servizi:",
    `Che cosa mi serve: ${c?.cosa ?? ""}`,
    `Città: ${c?.citta ?? ""}`,
    `Periodo o data: ${c?.periodo ?? ""}`,
    `Recapito: ${c?.recapito ?? ""}`,
    `Referente: ${c?.referente ?? ""}`,
  ];
  return righe.join("\n");
}

const waLink = (testo: string) => `https://wa.me/${WA_NUM}?text=${encodeURIComponent(testo)}`;
const mailLink = (oggetto: string, testo: string) =>
  `mailto:${EMAIL}?subject=${encodeURIComponent(oggetto)}&body=${encodeURIComponent(testo)}`;

export default function ServiziImpresePage() {
  const [scelti, setScelti] = useState<IdServizio[]>([]);
  const [campi, setCampi] = useState<Campi>({ cosa: "", citta: "", periodo: "", recapito: "", referente: "" });

  /* Arrivando con un'ancora (#servizio-… o #richiedi-proposta) scorriamo noi:
     la pagina è montata dopo il caricamento. */
  useEffect(() => {
    const h = window.location.hash.slice(1);
    if (h) document.getElementById(h)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const nomiScelti = useMemo(
    () => SERVIZI.filter((s) => scelti.includes(s.id)).map((s) => s.titolo),
    [scelti],
  );
  const testo = messaggio(nomiScelti, campi);
  const oggetto = `Richiesta proposta TBH${nomiScelti.length ? ` — ${nomiScelti.join(", ")}` : ""}`;

  const toggle = (id: IdServizio) =>
    setScelti((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));

  return (
    <div className="mx-auto max-w-[1500px] px-4 md:px-8 py-10" data-pagina="servizi-imprese">
      {/* ── Testa: locandina ufficiale + titolo e intro ── */}
      <header className="tbh-rise grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.7fr)] items-center mb-12">
        <div className="min-w-0">
          <p className="text-xs tracking-[0.25em] text-[var(--tbh-gold)] uppercase mb-3">
            TBH-WEB.com · Servizi per le imprese
          </p>
          <h1 className="tbh-display tbh-h1 leading-[0.95] [overflow-wrap:anywhere]">
            Hai un&apos;attività? <span className="text-[var(--tbh-neon)]">Dicci cosa ti serve.</span>
          </h1>
          <p className="tbh-display text-base md:text-lg text-[var(--tbh-gold)] mt-4 tracking-wide">
            Persone, servizi e supporto per la tua impresa.
          </p>
          <p className="tbh-body mt-5 max-w-2xl">
            Gestisci un hotel, un ristorante, un negozio, un locale, una struttura ricettiva o
            un&apos;azienda? Touch Business Holding – TBH raccoglie le tue esigenze e coordina una
            proposta attraverso la propria rete di collaboratori e servizi, per attività programmate,
            progetti e richieste urgenti.
          </p>
          <div className="flex flex-wrap gap-3 mt-7">
            <a href="#richiedi-proposta" className="tbh-neon-btn px-6 py-3 inline-flex items-center gap-2">
              <Send size={18} /> Richiedi una proposta TBH
            </a>
            <a
              href={waLink(messaggio([]))}
              target="_blank"
              rel="noreferrer"
              className="px-6 py-3 rounded-full border border-[var(--tbh-line)] font-semibold inline-flex items-center gap-2 hover:border-[var(--tbh-neon)]"
            >
              <MessageCircle size={18} /> WhatsApp Business
            </a>
          </div>
        </div>
        <a
          href={`${BASE}/hai-unattivita.png`}
          target="_blank"
          rel="noreferrer"
          className="block min-w-0 max-w-[520px] w-full justify-self-center"
        >
          <img
            src={`${BASE}/hai-unattivita.jpg`}
            alt="Hai un'attività? Dicci cosa ti serve. — Touch Business Holding · Persone • Servizi • Soluzioni"
            width={738}
            height={991}
            className="w-full h-auto rounded-2xl border border-[var(--tbh-line)]"
          />
        </a>
      </header>

      {/* ── Come possiamo aiutarti: 9 anteprime → scheda richiesta ── */}
      <section className="mb-14">
        <h2 className="tbh-display tbh-h2">Come possiamo aiutarti</h2>
        <p className="tbh-body text-[var(--tbh-muted)] mt-2">Soluzioni per esigenze programmate e urgenti.</p>

        <div className="grid gap-4 mt-6 sm:grid-cols-2 xl:grid-cols-3">
          {SERVIZI.map((s) => {
            const t = messaggio([s.titolo]);
            return (
              <article
                key={s.id}
                id={`servizio-${s.id}`}
                data-servizio={s.id}
                className="tbh-card overflow-hidden flex flex-col scroll-mt-28 min-w-0"
              >
                <a
                  href={waLink(t)}
                  target="_blank"
                  rel="noreferrer"
                  data-anteprima-pulsante
                  className="group block p-5 flex-1 hover:bg-white/[0.03]"
                >
                  <div className="flex items-start gap-4">
                    <span
                      aria-hidden
                      className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-[var(--tbh-neon)]/50 bg-black/50 text-3xl"
                    >
                      {s.emoji}
                    </span>
                    <div className="min-w-0">
                      <h3 className="tbh-display text-lg md:text-xl uppercase leading-tight [overflow-wrap:anywhere] group-hover:text-[var(--tbh-neon)]">
                        {s.titolo}
                      </h3>
                      <p className="tbh-body text-sm text-[var(--tbh-muted)] mt-2">{s.testo}</p>
                    </div>
                  </div>
                </a>
                <FasciaAppartenenza a={TBH} />
                <div className="grid grid-cols-2 border-t border-[var(--tbh-line)]">
                  <a
                    href={waLink(t)}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-center gap-2 px-3 py-3 text-sm font-semibold hover:text-[var(--tbh-neon)]"
                  >
                    <MessageCircle size={16} /> Richiedi
                  </a>
                  <a
                    href={mailLink(`Richiesta proposta TBH — ${s.titolo}`, t)}
                    className="flex items-center justify-center gap-2 px-3 py-3 text-sm font-semibold border-l border-[var(--tbh-line)] hover:text-[var(--tbh-neon)]"
                  >
                    <Mail size={16} /> E-mail
                  </a>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* ── Da dove partiamo? → Richiedi una proposta TBH ── */}
      <section
        id="richiedi-proposta"
        className="tbh-card p-5 md:p-8 border-2 border-[var(--tbh-neon)] shadow-[0_0_40px_rgba(230,255,0,0.12)] scroll-mt-28 mb-12"
      >
        <div className="grid gap-8 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1fr)]">
          <div className="min-w-0">
            <h2 className="tbh-display tbh-h2">Da dove partiamo?</h2>
            <p className="tbh-body mt-3">Scrivici:</p>
            <ul className="mt-3 space-y-2">
              {DA_DOVE.map((d) => (
                <li key={d.k} className="flex items-center gap-2 tbh-body">
                  <Check size={18} className="shrink-0 text-[var(--tbh-neon)]" /> {d.label.toLowerCase()};
                </li>
              ))}
            </ul>
            <p className="tbh-body text-[var(--tbh-muted)] mt-5">
              Verifichiamo fattibilità e disponibilità e prepariamo una proposta con servizi, tempi e costi
              chiari.
            </p>
          </div>

          <div className="min-w-0">
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--tbh-neon)] flex items-center gap-2">
              <ArrowDown size={14} /> Componi la richiesta
            </p>
            <div className="flex flex-wrap gap-2 mt-3" role="group" aria-label="Servizi richiesti">
              {SERVIZI.map((s) => {
                const on = scelti.includes(s.id);
                return (
                  <button
                    key={s.id}
                    type="button"
                    aria-pressed={on}
                    onClick={() => toggle(s.id)}
                    className={`rounded-full px-3 py-1.5 text-sm font-semibold border ${
                      on
                        ? "bg-[var(--tbh-neon)] text-black border-[var(--tbh-neon)]"
                        : "border-[var(--tbh-line)] hover:border-[var(--tbh-neon)]"
                    }`}
                  >
                    <span aria-hidden className="mr-1">{s.emoji}</span>
                    {s.titolo}
                  </button>
                );
              })}
            </div>
            <div className="grid gap-3 mt-5 sm:grid-cols-2">
              {DA_DOVE.map((d) => (
                <label key={d.k} className={`block min-w-0 ${d.k === "cosa" ? "sm:col-span-2" : ""}`}>
                  <span className="block text-[11px] uppercase tracking-wider text-[var(--tbh-muted)] mb-1">
                    {d.label}
                  </span>
                  <input
                    value={campi[d.k]}
                    onChange={(e) => setCampi((p) => ({ ...p, [d.k]: e.target.value }))}
                    placeholder={d.ph}
                    className="w-full rounded-xl bg-black/60 border border-[var(--tbh-line)] px-3 py-2.5 text-sm outline-none focus:border-[var(--tbh-neon)]"
                  />
                </label>
              ))}
            </div>
            <div className="flex flex-wrap gap-3 mt-5">
              <a
                href={waLink(testo)}
                target="_blank"
                rel="noreferrer"
                data-cta="richiesta-wa"
                className="tbh-neon-btn px-6 py-3 inline-flex items-center gap-2"
              >
                <MessageCircle size={18} /> Invia su WhatsApp
              </a>
              <a
                href={mailLink(oggetto, testo)}
                data-cta="richiesta-mail"
                className="px-6 py-3 rounded-full border border-[var(--tbh-line)] font-semibold inline-flex items-center gap-2 hover:border-[var(--tbh-neon)]"
              >
                <Mail size={18} /> Invia per e-mail
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── Richiedi una proposta TBH: contatti ── */}
      <section className="rounded-2xl border border-[var(--tbh-gold)]/60 bg-black/40 p-5 md:p-6">
        <p className="tbh-display text-xl">Richiedi una proposta TBH</p>
        <div className="grid gap-3 mt-4 sm:grid-cols-3">
          <a
            href={mailLink("Richiesta proposta TBH", messaggio([]))}
            className="rounded-xl border border-[var(--tbh-line)] px-4 py-3 hover:border-[var(--tbh-neon)] flex items-center gap-3 min-w-0"
          >
            <Mail size={20} className="shrink-0 text-[var(--tbh-neon)]" />
            <span className="min-w-0">
              <span className="block text-[11px] uppercase tracking-wider text-[var(--tbh-muted)]">E-mail</span>
              <span className="block font-semibold [overflow-wrap:anywhere]">{EMAIL}</span>
            </span>
          </a>
          <a
            href={waLink(messaggio([]))}
            target="_blank"
            rel="noreferrer"
            className="rounded-xl border border-[var(--tbh-line)] px-4 py-3 hover:border-[var(--tbh-neon)] flex items-center gap-3 min-w-0"
          >
            <MessageCircle size={20} className="shrink-0 text-[var(--tbh-neon)]" />
            <span className="min-w-0">
              <span className="block text-[11px] uppercase tracking-wider text-[var(--tbh-muted)]">WhatsApp Business</span>
              <span className="block font-semibold">+39 379 208 8524</span>
            </span>
          </a>
          <a
            href={SITO}
            target="_blank"
            rel="noreferrer"
            className="rounded-xl border border-[var(--tbh-line)] px-4 py-3 hover:border-[var(--tbh-neon)] flex items-center gap-3 min-w-0"
          >
            <Globe size={20} className="shrink-0 text-[var(--tbh-neon)]" />
            <span className="min-w-0">
              <span className="block text-[11px] uppercase tracking-wider text-[var(--tbh-muted)]">Sito</span>
              <span className="block font-semibold">TBH-WEB.com</span>
            </span>
          </a>
        </div>
        <p className="tbh-display text-center text-sm md:text-base tracking-[0.2em] mt-6">
          TOUCH BUSINESS HOLDING · <span className="text-[var(--tbh-neon)]">Persone • Servizi • Soluzioni</span>
        </p>
      </section>
    </div>
  );
}
