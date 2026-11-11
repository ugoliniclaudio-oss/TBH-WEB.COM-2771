import { Link } from "wouter";
import { MessageCircle, Globe, Mail, MapPin, Search, Handshake, Wallet } from "lucide-react";
import { waInfo } from "../lib/whatsapp";
import { SlotMedia } from "../components/media-slot";

/**
 * TBH HIGH VISIBILITY SCOUT — annuncio consegnato da Claudio il 04/09/2026.
 *
 * Regole rispettate:
 * · il testo dell'annuncio è SUO e viene pubblicato alla lettera: nessuna frase riscritta,
 *   nessun compenso, percentuale o territorio aggiunto o modificato;
 * · l'immagine (locandina ufficiale HVS) sta PRIMA del testo, come richiesto;
 * · il logo HVS è quello ufficiale inviato da lui: non ridisegnato;
 * · sito indicato nell'annuncio: TBH-WEB.com (confermato da Claudio il 04/09/2026);
 * · il corso mostra i numeri che ha dato lui. Le CONDIZIONI (quando rientra la caparra,
 *   cosa vale come contatto qualificato, che tipo di inserimento per i primi 3) non sono
 *   scritte dall'agente: restano "regolamento in consegna" finché non le fornisce lui.
 */

const WEB = "TBH-WEB.com";

const COMPENSI = [
  { contatti: "20", compenso: "€250" },
  { contatti: "50", compenso: "€500" },
  { contatti: "100", compenso: "€1.000" },
];

const SETTORI = [
  "🏢 Servizi per le imprese",
  "🏨 Servizi per il turismo",
  "🎥 Servizi audiovisivi e media",
  "🎬 Produzioni audiovisive",
  "🎵 Eventi musicali e spettacolo",
  "⚽ Sport ed eventi sportivi",
  "📣 Pubblicità • Comunicazione • Promozione • Visibilità",
];

const PASSI = [
  { n: "1", t: "CERCA", d: "individua aziende e attività interessanti.", icona: Search },
  { n: "2", t: "QUALIFICA", d: "verifica che esista un interesse reale.", icona: Handshake },
  { n: "3", t: "CONSEGNA", d: "invia a TBH il report con i contatti.", icona: MapPin },
  { n: "4", t: "GUADAGNA", d: "ricevi il compenso previsto e gli eventuali bonus.", icona: Wallet },
];

/** Caparre indicate da Claudio. Il rientro della caparra è soggetto al regolamento (non ancora consegnato). */
const CAPARRE = ["250 €", "500 €", "1.000 €"];

export default function HvsPage() {
  /* 06/10/2026: le candidature TBH vanno solo a lavoro@tibihacca.com (niente WhatsApp). */
  const mailCandidatura = `mailto:lavoro@tibihacca.com?subject=${encodeURIComponent(
    "Candidatura — TBH High Visibility Scout",
  )}&body=${encodeURIComponent(
    "Nome e cognome:\nCittà:\nProvincia/Regione:\nZona nella quale vuoi operare:\nDisponibilità:\nEsperienza o rete di contatti:\n",
  )}`;
  const waCorso = waInfo("Corso TBH High Visibility Scout — 4 settimane");

  return (
    <div className="mx-auto max-w-[1400px] px-4 md:px-8 py-10">
      {/* LOGO UFFICIALE + LOCANDINA: immagine prima del testo, come richiesto */}
      <header className="tbh-rise mb-8">
        <img
          src="/brand/hvs-logo.png"
          alt="TBH High Visibility Scout — Find, Connect, Earn"
          className="w-full max-w-[520px] h-auto mb-6"
        />
        <p className="text-xs tracking-[0.25em] text-[var(--tbh-gold)] uppercase mb-2">
          Touch Business Holding · Ricerca collaboratori
        </p>
        <h1 className="tbh-display tbh-h1">🚀 Diventa TBH High Visibility Scout</h1>
        <p className="tbh-body text-[var(--tbh-muted)] max-w-3xl mt-3">
          Ricerca collaboratori e collaboratrici – On field • Smart working • Da remoto
        </p>
      </header>

      <img
        src="/brand/hvs-annuncio.png"
        alt="Locandina ufficiale TBH High Visibility Scout: ricerca collaboratori e collaboratrici"
        className="w-full h-auto rounded-2xl border border-[var(--tbh-line)] mb-10"
      />

      <section className="tbh-card p-6 md:p-8 mb-10 grid gap-4">
        <p className="tbh-body">
          Touch Business Holding amplia il proprio network e seleziona nuovi TBH High Visibility
          Scout per la ricerca e segnalazione di aziende, attività, professionisti e organizzazioni
          realmente interessati ai nostri servizi.
        </p>
        <p className="tbh-body">
          Il ruolo è semplice: tu individui l'opportunità e qualifichi il contatto. TBH si occupa
          della presentazione, della trattativa e della chiusura commerciale.
        </p>
      </section>

      <section className="mb-10 grid gap-5 md:grid-cols-2">
        <div className="tbh-card p-6">
          <h2 className="tbh-display tbh-h2 mb-3">🔎 Cosa farai</h2>
          <p className="tbh-body">
            Dovrai individuare potenziali clienti, effettuare un primo contatto, verificare
            l'interesse e trasmettere a TBH i riferimenti corretti attraverso un report periodico.
          </p>
          <p className="tbh-body mt-3">
            Non dovrai occuparti di preventivi, contratti, fatturazione o incassi.
          </p>
          <p className="tbh-body mt-3 text-[var(--tbh-muted)]">
            TBH gestirà direttamente presentazione dei servizi, documentazione, preventivi,
            trattativa, contratto, fatturazione, chiusura commerciale e pagamento del cliente.
          </p>
        </div>

        <div className="tbh-card p-6">
          <h2 className="tbh-display tbh-h2 mb-3">💼 Settori di riferimento</h2>
          <ul className="grid gap-2">
            {SETTORI.map((s) => (
              <li key={s} className="tbh-body text-sm border-b border-[var(--tbh-line)] pb-2">
                {s}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mb-10">
        <h2 className="tbh-display tbh-h2 mb-4">💰 Compenso per contatti qualificati</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {COMPENSI.map((c) => (
            <div key={c.contatti} className="tbh-card p-6 text-center">
              <p className="tbh-display text-4xl">{c.contatti}</p>
              <p className="text-xs uppercase tracking-wide text-[var(--tbh-muted)] mt-1">
                contatti validi
              </p>
              <p className="tbh-display text-3xl text-[var(--tbh-gold)] mt-3">{c.compenso}</p>
            </div>
          ))}
        </div>
        <p className="tbh-body text-sm text-[var(--tbh-muted)] mt-4 max-w-4xl">
          Il compenso viene riconosciuto per i contatti effettivamente qualificati, verificabili e
          interessati, anche se successivamente TBH non conclude il contratto con il potenziale
          cliente.
        </p>
      </section>

      <section className="tbh-card p-6 md:p-8 mb-10 border-[var(--tbh-neon)]">
        <h2 className="tbh-display tbh-h2 mb-3">🔥 +25% bonus su ogni cliente acquisito</h2>
        <p className="tbh-body">
          Se il contatto segnalato firma il contratto ed effettua il pagamento, allo Scout viene
          riconosciuto anche un bonus aggiuntivo del 25%.
        </p>
        <p className="tbh-body mt-3 text-[var(--tbh-gold)]">
          Esempio: fidelizzazione cliente da €915 → €228,75 di bonus.
        </p>
        <p className="tbh-body mt-3 text-sm text-[var(--tbh-muted)]">
          Il bonus si aggiunge al compenso maturato per i contatti.
        </p>
      </section>

      <section className="mb-10 grid gap-5 md:grid-cols-2">
        <div className="tbh-card p-6">
          <h2 className="tbh-display tbh-h2 mb-3">📊 Potenziale economico</h2>
          <p className="tbh-body">
            Con continuità settimanale, il compenso lordo potenziale equivalente può svilupparsi
            indicativamente da:
          </p>
          <p className="tbh-display text-2xl text-[var(--tbh-neon)] mt-3">
            €13.000 fino a €52.000 annui
          </p>
          <p className="tbh-body mt-2 text-sm">
            + bonus sulle acquisizioni, in funzione del numero di contatti validi effettivamente
            prodotti e approvati.
          </p>
          <p className="tbh-body mt-3 text-sm text-[var(--tbh-muted)]">
            Il valore intermedio di riferimento, corrispondente a 50 contatti validi a settimana,
            equivale a circa €26.000 annui + bonus.
          </p>
        </div>

        <div className="tbh-card p-6">
          <h2 className="tbh-display tbh-h2 mb-3">📅 Come funziona</h2>
          <ol className="grid gap-3">
            {PASSI.map((p) => (
              <li key={p.n} className="flex items-start gap-3">
                <p.icona size={18} className="text-[var(--tbh-neon)] mt-0.5 shrink-0" />
                <span className="tbh-body text-sm">
                  <b>
                    {p.n}. {p.t}
                  </b>{" "}
                  → {p.d}
                </span>
              </li>
            ))}
          </ol>
          <p className="tbh-body mt-4 text-sm text-[var(--tbh-muted)]">
            I report possono essere consegnati normalmente il venerdì o il sabato. Dopo la verifica,
            il compenso relativo ai contatti viene liquidato secondo il ciclo concordato.
          </p>
          <p className="tbh-body mt-2 text-sm text-[var(--tbh-muted)]">
            I bonus derivanti dai clienti effettivamente acquisiti vengono invece conteggiati
            mensilmente e liquidati nel ciclo del mese successivo, dopo la verifica della firma e
            dell'avvenuto pagamento.
          </p>
        </div>
      </section>

      <section className="mb-10">
        <h2 className="tbh-display tbh-h2 mb-4">📍 Aree strategiche</h2>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="tbh-card p-5">
            <p className="text-xs uppercase tracking-wide text-[var(--tbh-gold)] mb-2">Priorità</p>
            <p className="tbh-body text-sm">Rimini • Valmarecchia • Riviera di Rimini</p>
          </div>
          <div className="tbh-card p-5">
            <p className="text-xs uppercase tracking-wide text-[var(--tbh-gold)] mb-2">
              Ulteriori città e territori
            </p>
            <p className="tbh-body text-sm">Padova • Milano • Roma • Sanremo • Sommatino</p>
          </div>
          <div className="tbh-card p-5">
            <p className="text-xs uppercase tracking-wide text-[var(--tbh-gold)] mb-2">Regioni</p>
            <p className="tbh-body text-sm">
              Emilia • Romagna • Lombardia • Veneto • Liguria • Lazio • Sicilia • Calabria • Puglia
            </p>
          </div>
        </div>
        <div className="tbh-card p-5 mt-4">
          <p className="tbh-body text-sm">🇮🇹 Candidature aperte in tutta Italia</p>
          <p className="tbh-body text-sm mt-1">🇪🇸 Calella • Catalunya</p>
          <p className="tbh-body text-sm mt-3 text-[var(--tbh-muted)]">
            L'attività può essere svolta sul territorio oppure da remoto, utilizzando telefono, web,
            social, email e la propria rete di contatti.
          </p>
        </div>
      </section>

      <section className="tbh-card p-6 md:p-8 mb-10">
        <h2 className="tbh-display tbh-h2 mb-3">🎯 Chi cerchiamo</h2>
        <p className="tbh-body">
          Persone dinamiche, affidabili, organizzate e con buone capacità relazionali. Non è
          indispensabile essere venditori professionisti: è importante saper individuare
          opportunità, creare il primo contatto e riconoscere un interesse concreto.
        </p>
        <div className="mt-6 border-t border-[var(--tbh-line)] pt-6">
          <p className="tbh-display text-2xl">TBH HIGH VISIBILITY SCOUT</p>
          <p className="tbh-display text-lg text-[var(--tbh-gold)] mt-1">FIND • CONNECT • EARN</p>
          <p className="tbh-body mt-3 text-sm">Tu trovi le opportunità.</p>
          <p className="tbh-body text-sm">TBH presenta, tratta e chiude.</p>
          <p className="tbh-body text-sm">
            Tu guadagni sui contatti qualificati e anche sui clienti acquisiti.
          </p>
        </div>
      </section>

      {/* CORSO — numeri dati da Claudio. Condizioni non scritte dall'agente. */}
      <section id="corso" className="tbh-card p-6 md:p-8 mb-10 border-[var(--tbh-gold)]">
        <p className="text-xs tracking-[0.25em] text-[var(--tbh-gold)] uppercase mb-2">
          Touch Academy · percorso HVS
        </p>
        <h2 className="tbh-display tbh-h2">Corso TBH High Visibility Scout — 4 settimane</h2>
        <div className="grid gap-4 sm:grid-cols-3 mt-5">
          <div className="rounded-2xl border border-[var(--tbh-line)] p-5">
            <p className="text-xs uppercase tracking-wide text-[var(--tbh-muted)]">Durata</p>
            <p className="tbh-display text-3xl mt-1">4 settimane</p>
          </div>
          <div className="rounded-2xl border border-[var(--tbh-line)] p-5">
            <p className="text-xs uppercase tracking-wide text-[var(--tbh-muted)]">Corso</p>
            <p className="tbh-display text-3xl text-[var(--tbh-neon)] mt-1">72 €</p>
          </div>
          <div className="rounded-2xl border border-[var(--tbh-line)] p-5">
            <p className="text-xs uppercase tracking-wide text-[var(--tbh-muted)]">
              Caparra, a scelta
            </p>
            <p className="tbh-display text-2xl text-[var(--tbh-gold)] mt-1">
              {CAPARRE.join(" · ")}
            </p>
          </div>
        </div>

        <ul className="grid gap-2 mt-5">
          <li className="tbh-body text-sm">
            • Al termine: possibilità di guadagnare il <b>+25%</b> sui clienti acquisiti.
          </li>
          <li className="tbh-body text-sm">
            • <b>Cashback della caparra</b> previsto dal percorso.
          </li>
          <li className="tbh-body text-sm">
            • I <b>primi 3</b> saranno assunti e potranno iniziare a guadagnare da subito.
          </li>
        </ul>

        <p className="tbh-body text-sm text-[var(--tbh-muted)] mt-5">
          Regolamento del percorso (modalità e tempi di rientro della caparra, criteri di
          qualificazione dei contatti, forma di inserimento dei primi 3): <b>in consegna</b>. Viene
          pubblicato qui appena approvato dalla direzione: nessuna condizione viene scritta o
          interpretata dal sito.
        </p>

        <div className="flex flex-wrap gap-3 mt-6">
          <a
            href={waCorso}
            target="_blank"
            rel="noreferrer"
            className="tbh-neon-btn px-6 py-3 text-sm inline-flex items-center gap-2"
          >
            <MessageCircle size={16} /> Iscriviti al corso
          </a>
          <Link
            to="/touch-academy"
            className="px-6 py-3 rounded-xl text-sm font-semibold border border-[var(--tbh-line)] hover:border-[var(--tbh-neon)] inline-flex items-center"
          >
            Touch Academy
          </Link>
        </div>
      </section>

      <section className="tbh-card p-6 md:p-8 mb-10">
        <h2 className="tbh-display tbh-h2 mb-4">📲 Candidati ora</h2>
        <div className="grid gap-3 md:grid-cols-2">
          <a
            href={mailCandidatura}
            className="rounded-2xl border border-[var(--tbh-line)] p-5 hover:border-[var(--tbh-neon)] flex items-center gap-3 min-w-0"
          >
            <Mail size={20} className="text-[var(--tbh-neon)] shrink-0" />
            <span className="min-w-0">
              <span className="block text-xs uppercase tracking-wide text-[var(--tbh-muted)]">
                E-mail candidature
              </span>
              <b className="tbh-display text-xl [overflow-wrap:anywhere]">lavoro@tibihacca.com</b>
            </span>
          </a>
          <a
            href="https://tbh-web.com"
            target="_blank"
            rel="noreferrer"
            className="rounded-2xl border border-[var(--tbh-line)] p-5 hover:border-[var(--tbh-neon)] flex items-center gap-3"
          >
            <Globe size={20} className="text-[var(--tbh-neon)]" />
            <span>
              <span className="block text-xs uppercase tracking-wide text-[var(--tbh-muted)]">
                Web
              </span>
              <b className="tbh-display text-xl">{WEB}</b>
            </span>
          </a>
        </div>
        <p className="tbh-body text-sm text-[var(--tbh-muted)] mt-4">
          Invia una breve presentazione con nome e cognome, città, provincia/regione, zona nella
          quale vuoi operare, disponibilità ed eventuale esperienza o rete di contatti.
        </p>
        <a
          href={mailCandidatura}
          className="tbh-neon-btn px-6 py-3 text-sm inline-flex items-center gap-2 mt-5"
        >
          <Mail size={16} /> Invia la candidatura
        </a>
      </section>

      {/* Spazio materiali: Claudio può aggiungere altre locandine o slide dal pannello */}
      <SlotMedia
        slot="hvs:annuncio"
        titolo="Altri materiali HVS"
        tipoIniziale="slide"
        nascondiSeVuoto
      />
    </div>
  );
}
