import { Link } from "wouter";
import {
  AppWindow,
  Archive,
  Download,
  FileText,
  Info,
  Smartphone,
  ExternalLink,
} from "lucide-react";
import { MATERIALE_TBH, LOGO_TBH_VERSIONI, NOTA_LOGHI } from "../lib/loghi-tbh";
import { waInfo } from "../lib/whatsapp";
import { SezioneAmministrabile } from "../components/sezione-amministrabile";

/** TBH APP — «come un app store»: un solo punto per download, app, archivio e documentazione.
 *  Regola di Claudio: niente badge App Store / Google Play finché non esiste un'app pubblicata
 *  davvero. Qui i download sono SOLO file realmente presenti nel portale; tutto il resto è
 *  dichiarato «in allestimento» con il pulsante per richiederlo. */

const COLORE = "#d7ff00";

/** File ufficiali realmente presenti nel portale: si scaricano davvero. */
const DOWNLOAD_REALI: { file: string; nome: string; tipo: string }[] = [
  ...LOGO_TBH_VERSIONI.map((v) => ({
    file: v.file,
    nome: `Logo TBH · ${v.label}`,
    tipo: "Immagine",
  })),
  { file: MATERIALE_TBH.layoutLoghiNero, nome: "Layout loghi gruppo · fondo nero", tipo: "Immagine" },
  {
    file: MATERIALE_TBH.layoutLoghiBianco,
    nome: "Layout loghi gruppo · fondo bianco",
    tipo: "Immagine",
  },
  { file: MATERIALE_TBH.locandinaDeejayHugo, nome: "Locandina Deejay Hugò", tipo: "Locandina" },
  { file: MATERIALE_TBH.layoutJcHugo, nome: "Layout brand J.C. Hugò", tipo: "Immagine" },
  { file: MATERIALE_TBH.serviziDeejayHugo, nome: "Servizi Deejay Hugò", tipo: "Scheda servizi" },
  {
    file: MATERIALE_TBH.copertinaInfluencity31,
    nome: "Touch Influencity Magazine N°31 · copertina",
    tipo: "Copertina",
  },
  { file: "/og-tbh.png", nome: "Card social TBH 1200x630 · nero", tipo: "Immagine" },
  { file: "/og-tbh-bianco.png", nome: "Card social TBH 1200x630 · bianco", tipo: "Immagine" },
];

/** Le app: nessuna è pubblicata sugli store, quindi nessun badge finto. */
const APP_TBH: { nome: string; cosa: string; stato: string }[] = [
  {
    nome: "TBH Web App",
    cosa: "Il portale TBH-WEB.COM: funziona già da smartphone, tablet, desktop e TV. Si aggiunge alla schermata Home dal menù del browser («Aggiungi alla schermata Home»).",
    stato: "Attiva ora",
  },
  {
    nome: "TBH App · iOS e Android",
    cosa: "App nativa con notifiche, tessera Club, ordini Touch Plaza e archivio offline.",
    stato: "In allestimento",
  },
  {
    nome: "TBH Club Card",
    cosa: "Tessera digitale del Club con QR personale per eventi, sconti e accessi.",
    stato: "In allestimento",
  },
];

/** Documentazione: cosa c'è già come pagina e cosa manca ancora come file. */
const DOCUMENTAZIONE: { nome: string; to: string | null; nota: string }[] = [
  { nome: "Anagrafica master TBH · ID e schede", to: "/anagrafica", nota: "Pagina attiva" },
  { nome: "Registro entità TBH", to: "/tbh/registro", nota: "Pagina attiva" },
  { nome: "Società con P.IVA del gruppo", to: "/tbh/societa", nota: "Pagina attiva" },
  { nome: "25 Piani · 25 Livelli TBH", to: "/tbh/livelli", nota: "Prezzi e benefit da definire" },
  { nome: "Management · contratti e liberatorie", to: "/management", nota: "Pagina attiva" },
  { nome: "Brand book TBH (PDF)", to: null, nota: "File da ricevere" },
  { nome: "Listini ufficiali (PDF)", to: null, nota: "File da ricevere" },
  { nome: "Presentazione gruppo (PDF)", to: null, nota: "File da ricevere" },
];

export default function TbhAppPage() {
  return (
    <div className="mx-auto max-w-[1500px] px-4 md:px-8 py-10">
      <header className="tbh-rise mb-10">
        <p className="text-xs tracking-[0.25em] uppercase mb-2" style={{ color: COLORE }}>
          Download · App · Archivio · Documentazione
        </p>
        <h1 className="tbh-display tbh-h1">TBH App</h1>
        <p className="tbh-body text-[var(--tbh-muted)] max-w-4xl mt-3">
          Un solo punto, come uno store: da qui si scaricano i materiali ufficiali, si vede quali app
          TBH esistono e in che stato sono, si entra nell'archivio e si trova la documentazione. Non
          pubblichiamo badge di App Store o Google Play finché un'app non è davvero sullo store.
        </p>
      </header>

      {/* APP */}
      <section className="mb-12">
        <h2 className="tbh-display tbh-h2 mb-4 flex items-center gap-2">
          <Smartphone size={22} style={{ color: COLORE }} /> App del gruppo
        </h2>
        <div className="grid gap-4 md:grid-cols-3">
          {APP_TBH.map((a) => {
            const attiva = a.stato === "Attiva ora";
            return (
              <div
                key={a.nome}
                className="tbh-card p-5 flex flex-col gap-3 border-l-4"
                style={{ borderLeftColor: attiva ? COLORE : "var(--tbh-line)" }}
              >
                <div className="flex items-start justify-between gap-3">
                  <h3 className="tbh-display text-lg leading-tight">{a.nome}</h3>
                  <span
                    className="text-[10px] uppercase tracking-wide rounded-full border px-2 py-1 whitespace-nowrap"
                    style={{
                      color: attiva ? COLORE : "var(--tbh-muted)",
                      borderColor: attiva ? COLORE : "var(--tbh-line)",
                    }}
                  >
                    {a.stato}
                  </span>
                </div>
                <p className="tbh-body text-sm text-[var(--tbh-muted)] flex-1">{a.cosa}</p>
                {attiva ? (
                  <Link to="/" className="tbh-neon-btn px-4 py-2 text-sm text-center font-semibold">
                    Usa il portale ora
                  </Link>
                ) : (
                  <a
                    href={waInfo(`Informazioni su ${a.nome}`)}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center gap-2 rounded-full border border-[var(--tbh-line)] px-4 py-2 text-sm font-semibold hover:border-[var(--tbh-neon)]"
                  >
                    Avvisami all'uscita <ExternalLink size={14} />
                  </a>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* DOWNLOAD */}
      <section className="mb-12">
        <h2 className="tbh-display tbh-h2 mb-2 flex items-center gap-2">
          <Download size={22} style={{ color: COLORE }} /> Download ufficiali
        </h2>
        <p className="tbh-body text-sm text-[var(--tbh-muted)] mb-4 max-w-4xl">
          File realmente presenti nel portale: si aprono e si salvano subito. {NOTA_LOGHI}
        </p>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {DOWNLOAD_REALI.map((d) => (
            <a
              key={d.file}
              href={d.file}
              download
              className="rounded-2xl border border-[var(--tbh-line)] p-4 flex items-center gap-4 hover:border-[var(--tbh-neon)] transition"
            >
              <img
                src={d.file}
                alt={d.nome}
                className="h-14 w-14 rounded-xl object-contain bg-black/60 shrink-0"
              />
              <span className="min-w-0">
                <span className="block text-sm font-semibold leading-tight">{d.nome}</span>
                <span className="block text-[11px] uppercase tracking-wide text-[var(--tbh-muted)] mt-1">
                  {d.tipo} · scarica
                </span>
              </span>
            </a>
          ))}
        </div>
      </section>

      {/* ARCHIVIO */}
      <section className="mb-12">
        <h2 className="tbh-display tbh-h2 mb-4 flex items-center gap-2">
          <Archive size={22} style={{ color: COLORE }} /> Archivio
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { to: "/media/libreria", label: "Media Library TBH", nota: "Video, foto, documenti" },
            { to: "/sport/highlights-dm", label: "Archivio video e highlights", nota: "DM Comunicazioni" },
            { to: "/influencity", label: "Touch Influencity Magazine", nota: "Numeri e speciali" },
            { to: "/news", label: "TBH News", nota: "Edicola digitale" },
          ].map((a) => (
            <Link
              key={a.to}
              to={a.to}
              className="tbh-card p-5 hover:border-[var(--tbh-neon)] transition flex flex-col gap-1"
            >
              <AppWindow size={18} style={{ color: COLORE }} />
              <span className="tbh-display text-base mt-1">{a.label}</span>
              <span className="text-[11px] uppercase tracking-wide text-[var(--tbh-muted)]">
                {a.nota}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* DOCUMENTAZIONE */}
      <section className="mb-12">
        <h2 className="tbh-display tbh-h2 mb-4 flex items-center gap-2">
          <FileText size={22} style={{ color: COLORE }} /> Documentazione
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {DOCUMENTAZIONE.map((d) => (
            <div key={d.nome} className="rounded-2xl border border-[var(--tbh-line)] p-4">
              <p className="text-sm font-semibold leading-tight">{d.nome}</p>
              <p className="text-[11px] uppercase tracking-wide text-[var(--tbh-muted)] mt-1">
                {d.nota}
              </p>
              {d.to ? (
                <Link
                  to={d.to}
                  className="mt-3 inline-flex text-xs font-bold uppercase"
                  style={{ color: COLORE }}
                >
                  Apri
                </Link>
              ) : (
                <a
                  href={waInfo(`Invio il file: ${d.nome}`)}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 inline-flex text-xs font-bold uppercase text-[var(--tbh-muted)] hover:text-[var(--tbh-neon)]"
                >
                  Invia il file
                </a>
              )}
            </div>
          ))}
        </div>
      </section>

      <section className="tbh-card p-6 border-l-4" style={{ borderLeftColor: COLORE }}>
        <h2 className="tbh-display text-lg mb-2 flex items-center gap-2">
          <Info size={18} style={{ color: COLORE }} /> Cosa serve per completare questa pagina
        </h2>
        <ul className="tbh-body text-sm text-[var(--tbh-muted)] list-disc pl-5 space-y-1">
          <li>Conferma se esistono già app TBH pubblicate su App Store e Google Play (con i link).</li>
          <li>Brand book, listini e presentazione del gruppo in PDF.</li>
          <li>Eventuali manuali operativi da mettere a disposizione di partner e collaboratori.</li>
        </ul>
      </section>
      <div className="mt-14 grid gap-12 border-t border-white/10 pt-10">
        <SezioneAmministrabile sezione="download" />
      </div>
    </div>
  );
}
