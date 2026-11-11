/**
 * ANNUNCIO IN EVIDENZA — «ADDETTE/I COMMERCIALI B2B – PRESA APPUNTAMENTI» (03/10/2026)
 *
 * Testo, contratto, orario, stipendio e provvigioni sono trascritti come li ha
 * consegnati Claudio, con la sua locandina ufficiale (usata così com'è). Nessun dato
 * aggiunto: niente sede, niente scadenza, niente cifre diverse da quelle del testo.
 *
 * È un'offerta DIVERSA dal «Commerciale Fissaggio Appuntamenti» (zone 5→1, solo
 * provvigioni): qui c'è un contratto di lavoro subordinato con fisso garantito.
 * Le due restano entrambe in bacheca.
 */
import { useEffect, useRef, type ReactNode } from "react";
import {
  Megaphone,
  Mail,
  Globe,
  Phone,
  Building2,
  FileSignature,
  Clock,
  Wallet,
  Percent,
  Send,
} from "lucide-react";

const ANCORA = "addette-commerciali-b2b";
const EMAIL = "lavoro@tibihacca.com";
const SITO = "https://tbh-web.com";
const BASE = "/lavoro/addette-b2b";

const CONTRATTO = [
  "Lavoro subordinato part-time, 30 ore settimanali.",
  "Tempo indeterminato.",
  "CCNL Terziario, Distribuzione e Servizi Confcommercio.",
  "Inquadramento proposto: impiegata/o commerciale, IV livello, da confermare sulle mansioni effettive.",
  "Eventuale periodo di prova nei limiti previsti dalla legge e dal CCNL.",
];

const FASCE = ["10:00–12:00", "15:00–17:00", "18:00–20:00"];


const MAIL_CANDIDATURA = `mailto:${EMAIL}?subject=${encodeURIComponent(
  "Candidatura — Addetta/o Commerciale B2B – Presa Appuntamenti",
)}&body=${encodeURIComponent(
  "Ruolo: ADDETTA/O COMMERCIALE B2B – PRESA APPUNTAMENTI\nCittà:\nDisponibilità:\n\n\n(Allego il mio CV)",
)}`;

function Blocco({
  icona,
  titolo,
  children,
  className = "",
}: {
  icona: ReactNode;
  titolo: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`rounded-2xl border border-[var(--tbh-line)] bg-black/40 p-5 min-w-0 ${className}`}>
      <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--tbh-neon)] flex items-center gap-2">
        {icona} {titolo}
      </h3>
      <div className="tbh-body text-sm mt-3 space-y-2">{children}</div>
    </div>
  );
}

export function AnnuncioAddetteB2B() {
  const sezione = useRef<HTMLElement>(null);
  /* Arrivando dal ticker con l'ancora la pagina è montata dopo il caricamento:
     il browser non trova l'ancora da solo, quindi scorriamo noi. */
  useEffect(() => {
    if (window.location.hash === `#${ANCORA}`) {
      sezione.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, []);

  return (
    <section
      ref={sezione}
      id={ANCORA}
      data-annuncio="addette-b2b"
      className="tbh-card p-5 md:p-8 mb-12 border-2 border-[var(--tbh-neon)] shadow-[0_0_40px_rgba(230,255,0,0.12)] scroll-mt-28"
    >
      <div className="flex flex-wrap items-center gap-2 mb-6">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--tbh-neon)] px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-black">
          <Megaphone size={13} /> In evidenza
        </span>
        <span className="rounded-full border border-[var(--tbh-neon)]/50 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-[var(--tbh-neon)]">
          Candidature aperte
        </span>
        <span className="rounded-full border border-[var(--tbh-gold)]/60 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-[var(--tbh-gold)]">
          Contratto di lavoro
        </span>
        <span className="text-[11px] uppercase tracking-widest text-[var(--tbh-muted)]">
          Pubblicato il 03/10/2026
        </span>
      </div>

      {/* ── Testa: locandina ufficiale + titolo, fisso e provvigioni ── */}
      <div className="grid gap-8 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1fr)] items-start">
        <a href={`${BASE}/locandina.png`} target="_blank" rel="noreferrer" className="block min-w-0">
          <img
            src={`${BASE}/locandina.jpg`}
            alt="Lavora con noi — Addetta/o teleselling B2B, presa appuntamenti commerciali — TBH"
            width={1082}
            height={1454}
            className="w-full h-auto rounded-2xl border border-[var(--tbh-line)]"
          />
        </a>

        <div className="min-w-0">
          <h2 className="tbh-display tbh-h1 leading-[0.95] [overflow-wrap:anywhere]">
            Addette Commerciali <span className="text-[var(--tbh-neon)]">B2B</span>
          </h2>
          <p className="tbh-display text-base md:text-lg text-[var(--tbh-gold)] mt-3 tracking-wide">
            Presa Appuntamenti
          </p>

          <p className="tbh-body mt-5">
            Touch Business Holding – TBH ricerca una persona comunicativa e organizzata per contattare
            aziende e fissare appuntamenti con i nostri referenti commerciali.
          </p>

          {/* Fisso + provvigioni in evidenza — cifre esattamente come nel testo. */}
          <div className="grid gap-4 mt-6 sm:grid-cols-2">
            <div className="rounded-2xl border-2 border-[var(--tbh-neon)] bg-black/50 p-5 min-w-0">
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--tbh-neon)] flex items-center gap-2">
                <Wallet size={15} /> Fisso garantito
              </p>
              <p className="tbh-display text-3xl md:text-4xl mt-2">€1.500</p>
              <p className="text-sm text-[var(--tbh-muted)]">lordi mensili per 14 mensilità</p>
              <p className="mt-3 rounded-full bg-[var(--tbh-neon)] px-3 py-1.5 text-sm font-bold text-black inline-block">
                €21.000 lordi annui
              </p>
              <p className="text-xs text-[var(--tbh-muted)] mt-2">oltre alle provvigioni</p>
            </div>
            <div className="rounded-2xl border-2 border-[var(--tbh-gold)] bg-black/50 p-5 min-w-0">
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--tbh-gold)] flex items-center gap-2">
                <Percent size={15} /> Provvigioni
              </p>
              <p className="tbh-display text-3xl md:text-4xl mt-2">20%</p>
              <p className="text-sm text-[var(--tbh-muted)]">
                sul valore imponibile dei contratti attribuiti agli appuntamenti dell&apos;incaricato e
                incassati da TBH
              </p>
              <p className="mt-3 rounded-full border border-[var(--tbh-gold)]/70 px-3 py-1.5 text-sm font-semibold text-[var(--tbh-gold)] inline-block">
                Possibile crescita al 30%
              </p>
              <p className="text-xs text-[var(--tbh-muted)] mt-2">secondo accordo scritto</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 mt-6">
            <a
              href={MAIL_CANDIDATURA}
              className="tbh-neon-btn px-6 py-3 inline-flex items-center gap-2"
            >
              <Mail size={18} /> Candidati · invia CV
            </a>
          </div>
        </div>
      </div>

      {/* ── Mansioni, clienti, contratto, orario ── */}
      <div className="mt-10 grid gap-4 md:grid-cols-2">
        <Blocco icona={<Phone size={15} />} titolo="Mansioni">
          <p>
            Contatto telefonico con titolari e responsabili, raccolta delle esigenze, presentazione dei
            servizi TBH, presa appuntamenti, aggiornamento del gestionale e gestione dei richiami.
          </p>
          <p className="text-[var(--tbh-muted)]">
            Preventivi, trattative e chiusure saranno seguiti dal referente commerciale TBH.
          </p>
        </Blocco>

        <Blocco icona={<Building2 size={15} />} titolo="Clienti">
          <p>
            Hotel, strutture ricettive, ristoranti, bar, locali, negozi, imprese e organizzatori di
            eventi.
          </p>
          <p className="text-[var(--tbh-muted)]">
            <b className="text-white">Servizi proposti:</b> personale, logistica, formazione, eventi,
            intrattenimento, foto/video, grafica, noleggi e pubblicità.
          </p>
        </Blocco>

        <Blocco icona={<FileSignature size={15} />} titolo="Contratto proposto">
          <ul className="space-y-2">
            {CONTRATTO.map((c) => (
              <li key={c} className="flex gap-2">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--tbh-neon)]" />
                <span>{c}</span>
              </li>
            ))}
          </ul>
        </Blocco>

        <Blocco icona={<Clock size={15} />} titolo="Orario">
          <p>Dal lunedì al venerdì:</p>
          <ul className="flex flex-wrap gap-2">
            {FASCE.map((f) => (
              <li key={f} className="rounded-full bg-[var(--tbh-neon)] px-3 py-1.5 text-sm font-bold text-black">
                {f}
              </li>
            ))}
          </ul>
          <p>Sabato e domenica liberi.</p>
          <p className="text-[var(--tbh-muted)]">Possibilità di lavoro da remoto mediante accordo scritto.</p>
        </Blocco>
      </div>

      {/* ── Stipendio e provvigioni: testo completo ── */}
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <Blocco icona={<Wallet size={15} />} titolo="Stipendio" className="border-[var(--tbh-neon)]/60">
          <p>
            Fisso garantito di <b>€1.500 lordi mensili per 14 mensilità</b>: <b>€21.000 lordi annui</b>,
            oltre alle provvigioni.
          </p>
          <p>Il fisso non dipende dal numero di appuntamenti o dalle vendite.</p>
          <p className="text-[var(--tbh-muted)]">
            Saranno rispettati i minimi contrattuali vigenti e i successivi adeguamenti.
          </p>
        </Blocco>

        <Blocco icona={<Percent size={15} />} titolo="Provvigioni" className="border-[var(--tbh-gold)]/60">
          <p>
            <b>20%</b> sul valore imponibile dei contratti attribuiti agli appuntamenti dell&apos;incaricato
            e incassati da TBH. Possibile crescita al <b>30%</b> secondo accordo scritto.
          </p>
          <p className="rounded-xl border border-[var(--tbh-gold)]/50 bg-black/40 px-3 py-2">
            <b className="text-[var(--tbh-gold)]">Esempio:</b> €1.000 + IVA incassati generano €200 lordi di
            provvigione, oltre al fisso.
          </p>
          <p>Liquidazione mensile in busta paga. Nessun premio o bonus separato.</p>
          <p className="text-[var(--tbh-muted)]">
            Ferie, permessi, mensilità aggiuntive, TFR e coperture previdenziali e assicurative secondo
            legge e CCNL.
          </p>
        </Blocco>
      </div>

      {/* ── Candidature ── */}
      <div className="mt-10 rounded-2xl border border-[var(--tbh-gold)]/60 bg-black/40 p-5 md:p-6">
        <p className="tbh-display text-xl flex items-center gap-2">
          <Send size={20} className="text-[var(--tbh-neon)]" /> Candidature
        </p>
        <p className="tbh-body text-sm text-[var(--tbh-muted)] mt-1">Invia CV, città e disponibilità.</p>
        <div className="grid gap-3 mt-4 sm:grid-cols-2">
          <a
            href={MAIL_CANDIDATURA}
            className="rounded-xl border border-[var(--tbh-line)] px-4 py-3 hover:border-[var(--tbh-neon)] flex items-center gap-3 min-w-0"
          >
            <Mail size={20} className="shrink-0 text-[var(--tbh-neon)]" />
            <span className="min-w-0">
              <span className="block text-[11px] uppercase tracking-wider text-[var(--tbh-muted)]">E-mail candidature</span>
              <span className="block font-semibold [overflow-wrap:anywhere]">{EMAIL}</span>
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
      </div>
    </section>
  );
}
