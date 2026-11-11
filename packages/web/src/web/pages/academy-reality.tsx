import { AlertTriangle, ExternalLink, Users, ClipboardList, BedDouble, Bus } from "lucide-react";
import { Link } from "wouter";
import { waInfo } from "../lib/whatsapp";

const MODULO_ACADEMY = "/lavoro-casting/candidati/academy-reality-show-rimini";
const EMAIL_ACADEMY = "lavoro@tibihacca.com";

/** REALITY SHOW RIMINI — ACADEMY & RECLUTAMENTO GIOCATORI.
 *  Pagina additiva: non sostituisce /media/reality-show, la completa.
 *
 *  REGOLE RISPETTATE: nessun compenso, nessun ingaggio e nessun guadagno promesso ai
 *  giocatori; nessun profilo social inventato (Instagram e TikTok restano dichiarati
 *  «da collegare»); solo i due link ufficiali verificati il 29/08/2026. */

const COLORE = "#ff5bb0";

const CANALI_VERIFICATI = [
  {
    nome: "Giovanili Rimini — sito ufficiale",
    url: "https://www.giovanilerimini.org/",
    nota: "Link verificato il 29/08/2026.",
  },
  {
    nome: "YouTube — ASD Giovanile Rimini Football",
    url: "https://www.youtube.com/@asdgovanileriminifootball7338",
    nota: "Canale verificato il 29/08/2026.",
  },
  {
    nome: "YouTube — Touch Music Radio TV",
    url: "https://www.youtube.com/@touchmusicradiotv",
    nota: "Canale del gruppo con sigle, spot e materiale sportivo.",
  },
];

const CANALI_DA_COLLEGARE = [
  "Instagram del format: profilo ufficiale da comunicare, nessun handle viene indicato al posto tuo.",
  "TikTok del format: profilo ufficiale da comunicare.",
  "Terzo canale (e successivi) dichiarato dalla produzione: non ancora comunicato.",
];

const COPERTURE = [
  { icona: Users, titolo: "Staff", testo: "Copertura economica dello staff di produzione a carico della produzione." },
  { icona: ClipboardList, titolo: "Squadra", testo: "Copertura economica della squadra a carico della produzione." },
  { icona: BedDouble, titolo: "Alloggi in hotel", testo: "Alloggi in hotel sia in location sia in trasferta, a carico della produzione." },
  { icona: Bus, titolo: "Strutture e viaggi", testo: "Strutture e viaggi a carico della produzione." },
];

export default function AcademyRealityPage() {
  return (
    <div className="mx-auto max-w-[1300px] px-4 md:px-8 py-10">
      <header className="tbh-rise mb-10">
        <p className="text-xs tracking-[0.25em] uppercase mb-2" style={{ color: COLORE }}>
          Reality Show Rimini · Produzione TBH
        </p>
        <h1 className="tbh-display tbh-h1">Academy &amp; reclutamento giocatori</h1>
        <p className="tbh-body text-[var(--tbh-muted)] max-w-4xl mt-3">
          Sezione dedicata al reclutamento dei giocatori attraverso colloqui. Le candidature si
          inviano con il modulo online TBH Lavoro oppure via e-mail a {EMAIL_ACADEMY}: la
          produzione fissa il colloquio e comunica direttamente i dettagli. WhatsApp resta solo
          per informazioni. Nessun compenso, ingaggio o guadagno viene promesso in questa pagina.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link
            href={MODULO_ACADEMY}
            className="rounded-full px-5 py-2.5 text-sm font-bold uppercase tracking-wide text-black"
            style={{ background: COLORE }}
            data-testid="academy-candidati"
          >
            Candidati per il colloquio
          </Link>
          <a
            href={`mailto:${EMAIL_ACADEMY}?subject=${encodeURIComponent("ACADEMY REALITY SHOW RIMINI")}`}
            className="rounded-full border border-[var(--tbh-line)] px-5 py-2.5 text-sm font-semibold hover:border-[var(--tbh-neon)]"
          >
            {EMAIL_ACADEMY}
          </a>
          <Link
            href="/media/reality-show"
            className="rounded-full border border-[var(--tbh-line)] px-5 py-2.5 text-sm font-semibold hover:border-[var(--tbh-neon)]"
          >
            Torna al Reality Show
          </Link>
        </div>
      </header>

      <section className="mb-12">
        <h2 className="tbh-display tbh-h2 mb-4">Cosa copre la produzione</h2>
        <p className="text-sm text-[var(--tbh-muted)] max-w-4xl mb-5">
          Dichiarazione della produzione: le coperture economiche di staff, squadra, strutture,
          viaggi e soprattutto alloggi in hotel — sia in location sia in trasferta — sono a carico
          della produzione. Non è previsto né promesso alcun compenso ai giocatori: ogni condizione
          personale viene definita solo in sede di colloquio.
        </p>
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {COPERTURE.map((c) => (
            <article
              key={c.titolo}
              className="tbh-card p-5 flex flex-col gap-2"
              style={{ borderColor: `${COLORE}44` }}
            >
              <c.icona size={20} style={{ color: COLORE }} />
              <h3 className="tbh-display text-lg leading-tight">{c.titolo}</h3>
              <p className="text-sm text-[var(--tbh-muted)]">{c.testo}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mb-12">
        <h2 className="tbh-display tbh-h2 mb-4">Come funziona il reclutamento</h2>
        <ol className="grid gap-3 md:grid-cols-2">
          {[
            "Invii la candidatura con il modulo online TBH Lavoro (o via e-mail a lavoro@tibihacca.com) con nome, età, ruolo e squadre precedenti.",
            "La produzione ti richiama e fissa il colloquio conoscitivo.",
            "Colloquio con lo staff: valutazione sportiva e disponibilità alle riprese.",
            "Esito e inserimento nel percorso Academy: condizioni definite in sede di colloquio, non pubblicate qui.",
          ].map((p, i) => (
            <li key={p} className="tbh-card p-5 flex gap-3">
              <span className="tbh-display text-2xl" style={{ color: COLORE }}>
                {i + 1}
              </span>
              <span className="text-sm text-[var(--tbh-muted)]">{p}</span>
            </li>
          ))}
        </ol>
      </section>

      <section className="mb-12">
        <h2 className="tbh-display tbh-h2 mb-4">Canali ufficiali collegati</h2>
        <div className="grid gap-5 md:grid-cols-3">
          {CANALI_VERIFICATI.map((c) => (
            <a
              key={c.url}
              href={c.url}
              target="_blank"
              rel="noreferrer"
              className="tbh-card p-5 flex flex-col gap-2 hover:border-[var(--tbh-neon)]"
            >
              <span className="tbh-display text-lg leading-tight">{c.nome}</span>
              <span className="text-xs text-[var(--tbh-muted)]">{c.nota}</span>
              <span
                className="mt-auto inline-flex items-center gap-2 text-sm font-semibold"
                style={{ color: COLORE }}
              >
                Apri <ExternalLink size={14} />
              </span>
            </a>
          ))}
        </div>

        <div className="tbh-card p-6 mt-5">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle size={18} className="text-[var(--tbh-gold)]" />
            <h3 className="tbh-display text-xl">Canali dichiarati ma non ancora comunicati</h3>
          </div>
          <ul className="grid gap-3 md:grid-cols-3">
            {CANALI_DA_COLLEGARE.map((c) => (
              <li
                key={c}
                className="rounded-xl border border-[var(--tbh-line)] p-4 text-sm text-[var(--tbh-muted)]"
              >
                {c}
              </li>
            ))}
          </ul>
          <a
            href={waInfo("i canali social del Reality Show Rimini (Instagram, TikTok, terzo canale)")}
            target="_blank"
            rel="noreferrer"
            className="mt-5 inline-flex rounded-full border border-[var(--tbh-line)] px-5 py-2.5 text-sm font-semibold hover:border-[var(--tbh-neon)]"
          >
            Manda i profili ufficiali
          </a>
        </div>
      </section>

      <p className="text-xs text-[var(--tbh-muted)] max-w-4xl">
        Nota di trasparenza: in questa pagina non compaiono compensi, rimborsi personali, promesse di
        ingaggio o di guadagno. Le coperture indicate riguardano i costi di produzione dichiarati
        dalla produzione stessa. Instagram, TikTok e gli eventuali altri canali restano vuoti finché
        non arrivano i profili reali: nessun handle viene inventato.
      </p>
    </div>
  );
}
