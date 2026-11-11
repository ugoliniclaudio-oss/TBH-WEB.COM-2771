import { Link } from "wouter";
import {
  MessageCircle,
  Flame,
  Clock,
  MapPin,
  Users,
  ShieldCheck,
  Network,
  TrendingUp,
  CalendarClock,
  CalendarCheck,
  BadgeCheck,
  Gift,
  Percent,
  UserPlus,
  Nfc,
  Building2,
  Ticket,
} from "lucide-react";
import { wa, waInfo } from "../lib/whatsapp";

/* ────────────────────────────────────────────────────────────────────────────
   CORSO ADDETTO ANTINCENDIO — LIVELLO 3 (ex Alto Rischio)
   Rotta: /corsi/antincendio-livello-3  (alias /antincendio)

   SORGENTE: testo e locandina ufficiale consegnati da Claudio il 15/09/2026.
   Qui non c'è nulla di inventato: ore, formule, importi, sedi, numero massimo
   di partecipanti e claim sono quelli del materiale ricevuto. La locandina vera
   è pubblicata in pagina come immagine (public/corsi/antincendio-livello-3.jpg),
   non ricostruita.

   NOTA PREZZI — da chiarire con Claudio: nel catalogo Touch Jobs esiste la voce
   generica «Corso di formazione completo» a 610 € + «Esame di certificazione»
   a 72 €. Questo corso ha invece un listino proprio (gratuito / 288 € / 244 €).
   Finché Claudio non conferma se il nuovo listino sostituisce quello generico,
   le due voci NON vengono toccate e questa pagina riporta solo i suoi importi.
   ──────────────────────────────────────────────────────────────────────────── */

const LOCANDINA = "/corsi/antincendio-livello-3.jpg";

/* 30/09/2026 — Claudio ha consegnato la slide shop del corso gratuito, il link ufficiale
   di prenotazione (Payment Link Stripe a 0 €) e il suo QR. Sono gli stessi dell'articolo
   `antincendio-livello-3-gratuito` nel listino: unico modulo, nessun doppione. */
const SLIDE_GRATUITO = "/shop/antincendio-livello-3-gratuito.png";
const PRENOTA_GRATUITO = "https://buy.stripe.com/dRm5kx7Yp7IBaFR0QgfQI02";
const QR_GRATUITO = "/shop/antincendio-livello-3-gratuito-qr.png";
/* Il testo ufficiale del gratuito, parola per parola come ce l'ha dato Claudio. */
const CONDIZIONI_GRATUITO =
  "Corso di formazione Antincendio Livello 3 proposto gratuitamente: €0 per il corso. " +
  "Restano esclusi eventuali oneri obbligatori, pratiche, esami, certificazioni o servizi " +
  "accessori, ove previsti. L'accesso è subordinato a disponibilità dei posti, requisiti " +
  "richiesti e completamento dell'istruttoria TBH. Prenotazione obbligatoria.";

const SEDI = ["Ravenna", "Modena", "Rimini"];

const DATI = [
  { icona: Clock, label: "Durata", valore: "16 ore", nota: "12 teoriche + 4 pratiche" },
  { icona: BadgeCheck, label: "Esame", valore: "Idoneità tecnica", nota: "presso i Vigili del Fuoco" },
  { icona: Users, label: "Posti", valore: "Max 15", nota: "per ogni corso" },
  { icona: MapPin, label: "Sedi", valore: SEDI.join(" · "), nota: "aule e campo pratica" },
];

type Formula = {
  n: string;
  titolo: string;
  prezzo: string;
  prezzoPrima?: string;
  sotto: string;
  consigliata?: boolean;
  voci: string[];
};

const FORMULE: Formula[] = [
  {
    n: "Formula 1",
    titolo: "Corso gratuito",
    prezzo: "Gratuito",
    sotto: "Si paga solo l'esame",
    voci: [
      "Formazione completa a costo zero: 12 ore di teoria + 4 ore di pratica.",
      "A carico del partecipante: quota d'esame presso i Vigili del Fuoco.",
      "A carico del partecipante: eventuali oneri e marche da bollo richiesti dal Comando.",
    ],
  },
  {
    n: "Formula 2",
    titolo: "Corso completo",
    prezzo: "288 €",
    prezzoPrima: "366 €",
    sotto: "Tutto incluso, esame compreso",
    voci: [
      "Formazione teorica e prova pratica con istruttori.",
      "Gestione e prenotazione dell'esame.",
      "Esame presso i Vigili del Fuoco e relativi oneri.",
      "Assistenza fino al rilascio dell'attestazione.",
    ],
  },
  {
    n: "Formula 3",
    titolo: "Corso + Fidelity Consumer",
    prezzo: "244 €",
    sotto: "Valore reale 360 € · risparmio 44 € sulla Formula 2",
    consigliata: true,
    voci: [
      "Tutto quello che c'è nella Formula 2: corso completo, esame e assistenza.",
      "Tessera TBH Fidelity Consumer (72 € una tantum) inclusa nel pacchetto.",
      "Prezzi e promozioni riservate su corsi, prodotti e servizi del gruppo.",
      "Braccialetto NFC in regalo.",
      "Sconti su antinfortunistica e linea Total Black.",
      "Gadget TBH e bonus «Porta un amico».",
    ],
  },
];

const VANTAGGI_FIDELITY = [
  { icona: Percent, testo: "Prezzi e promo riservate su corsi, prodotti e servizi TBH" },
  { icona: Nfc, testo: "Braccialetto NFC in regalo" },
  { icona: ShieldCheck, testo: "Sconti su antinfortunistica e Total Black" },
  { icona: Gift, testo: "Gadget TBH" },
  { icona: UserPlus, testo: "Bonus «Porta un amico»" },
];

const PERCHE = [
  { icona: ShieldCheck, testo: "Più sicurezza sul lavoro e nella vita" },
  { icona: Network, testo: "Un network di opportunità" },
  { icona: TrendingUp, testo: "Crescita personale e professionale" },
  { icona: CalendarClock, testo: "Un impegno di lungo periodo" },
];

/* SEDI E BLOCCHI DA 15 POSTI — ordine di Claudio del 15/09/2026:
   «apri sezioni di Rimini, Ravenna e Modena così da avere blocchi di massimo 15 posti
   ad ogni corso». Le date NON sono state comunicate: il calendario di ogni sede resta
   «in programmazione» e non si inventa nessun giorno. */
const SEZIONI_SEDI: { citta: string; area: string }[] = [
  { citta: "Rimini", area: "Romagna · costa e riviera" },
  { citta: "Ravenna", area: "Romagna · porto e industria" },
  { citta: "Modena", area: "Emilia · area produttiva" },
];

/** Le tre formule sono anche a listino nel Touch Plaza Shop, agli stessi importi. */
const VOCI_LISTINO: { slug: string; titolo: string; prezzo: string }[] = [
  { slug: "antincendio-livello-3-gratuito", titolo: "Corso gratuito", prezzo: "Gratuito" },
  { slug: "antincendio-livello-3-completo", titolo: "Corso completo", prezzo: "288 €" },
  {
    slug: "antincendio-livello-3-fidelity",
    titolo: "Corso + Fidelity Consumer",
    prezzo: "244 €",
  },
];

const PRENOTA = wa(
  "Buongiorno, vorrei prenotare il Corso Addetto Antincendio Livello 3 (16 ore). " +
    "Sede di interesse: Ravenna / Modena / Rimini. Formula: gratuita / completa 288 € / con Fidelity Consumer 244 €.",
);

export default function CorsoAntincendioPage() {
  return (
    <div data-pagina="corso-antincendio" className="mx-auto max-w-[1400px] px-4 md:px-8 py-10">
      <header className="tbh-rise mb-10">
        <p className="text-xs tracking-[0.25em] text-[var(--tbh-gold)] uppercase mb-2">
          Touch Academy · formazione certificata
        </p>
        <h1 className="tbh-display tbh-h1">
          Corso Addetto Antincendio
          <span className="block text-[var(--tbh-neon)]">Livello 3 · ex Alto Rischio</span>
        </h1>
        <p className="tbh-body text-[var(--tbh-muted)] max-w-3xl mt-4">
          16 ore di formazione — 12 teoriche e 4 pratiche — con preparazione all'esame di idoneità
          tecnica presso i Vigili del Fuoco e assistenza fino all'attestazione.
        </p>
        <p className="tbh-display text-xl md:text-2xl text-[var(--tbh-gold)] mt-4 max-w-3xl">
          Formazione oggi. Più sicurezza e più opportunità domani.
        </p>

        <div className="flex flex-wrap gap-3 mt-6">
          <a
            href={PRENOTA}
            target="_blank"
            rel="noreferrer"
            className="tbh-neon-btn px-6 py-3 text-sm inline-flex items-center gap-2"
          >
            <MessageCircle size={16} /> Prenota il tuo posto
          </a>
          {/* Modulo ufficiale del posto gratuito: link consegnato da Claudio, pubblico per tutti. */}
          <a
            href={PRENOTA_GRATUITO}
            target="_blank"
            rel="noreferrer"
            className="px-6 py-3 rounded-xl text-sm font-bold uppercase tracking-wide bg-[#a78bfa] text-black hover:brightness-110 inline-flex items-center gap-2"
          >
            <CalendarCheck size={16} /> Prenota il posto gratuito
          </a>
          <a
            href="#formule"
            className="px-6 py-3 rounded-xl text-sm font-semibold border border-[var(--tbh-line)] hover:border-[var(--tbh-neon)] inline-flex items-center"
          >
            Vedi le 3 formule
          </a>
          <a
            href="#sedi"
            className="px-6 py-3 rounded-xl text-sm font-semibold border border-[var(--tbh-line)] hover:border-[var(--tbh-neon)] inline-flex items-center"
          >
            Sezioni: Rimini · Ravenna · Modena
          </a>
        </div>
      </header>

      {/* Dati del corso */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4 mb-12">
        {DATI.map((d) => (
          <div key={d.label} className="tbh-card p-5">
            <div className="flex items-center gap-2 text-[var(--tbh-gold)]">
              <d.icona size={18} />
              <span className="text-xs uppercase tracking-widest">{d.label}</span>
            </div>
            <p className="tbh-display tbh-h3 mt-2 leading-tight">{d.valore}</p>
            <p className="text-sm text-[var(--tbh-muted)] mt-1">{d.nota}</p>
          </div>
        ))}
      </section>

      {/* CORSO GRATUITO — slide ufficiale, condizioni testuali di Claudio, modulo e QR.
          Sta in alto perché è l'offerta con cui il corso viene proposto oggi. */}
      <section className="tbh-card p-6 md:p-8 mb-12 border-[var(--tbh-neon)]">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)] items-start">
          <div className="min-w-0">
            <img
              src={SLIDE_GRATUITO}
              alt="Locandina ufficiale TBH del Corso Antincendio Livello 3 gratuito"
              width={1400}
              height={933}
              loading="lazy"
              className="w-full rounded-2xl border border-[var(--tbh-line)] object-contain"
            />
            <p className="text-[11px] text-[var(--tbh-muted)] mt-2">
              Locandina ufficiale del listino TBH.
            </p>
          </div>

          <div className="min-w-0">
            <p className="text-xs tracking-[0.25em] text-[var(--tbh-gold)] uppercase mb-2">
              Offerta in corso
            </p>
            <h2 className="tbh-display tbh-h2">
              Corso gratuito <span className="text-[var(--tbh-neon)]">€0</span>
            </h2>
            <p className="tbh-body text-[var(--tbh-muted)] mt-4">{CONDIZIONI_GRATUITO}</p>

            <div className="flex flex-wrap gap-3 mt-6">
              <a
                href={PRENOTA_GRATUITO}
                target="_blank"
                rel="noreferrer"
                className="px-6 py-3 rounded-xl text-sm font-bold uppercase tracking-wide bg-[#a78bfa] text-black hover:brightness-110 inline-flex items-center gap-2"
              >
                <CalendarCheck size={16} /> Prenota ora · modulo ufficiale
              </a>
              <Link
                href="/shop/p/antincendio-livello-3-gratuito"
                className="px-6 py-3 rounded-xl text-sm font-semibold border border-[var(--tbh-line)] hover:border-[var(--tbh-neon)] inline-flex items-center"
              >
                Apri la scheda a listino
              </Link>
            </div>

            <div className="flex items-center gap-4 mt-6">
              <img
                src={QR_GRATUITO}
                alt="QR ufficiale per prenotare il Corso Antincendio Livello 3 gratuito"
                width={132}
                height={132}
                loading="lazy"
                className="h-[132px] w-[132px] shrink-0 rounded-2xl object-contain"
              />
              <div className="min-w-0">
                <p className="tbh-display text-base leading-tight">Scansiona per prenotare</p>
                <p className="text-[11px] text-[var(--tbh-muted)] mt-1">
                  QR ufficiale dello stesso modulo: inquadralo col telefono, oppure usa il pulsante
                  qui sopra.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Che cos'è */}
      <section className="tbh-card p-6 md:p-8 mb-12">
        <div className="flex items-center gap-3 mb-4">
          <span className="w-12 h-12 rounded-2xl border border-[var(--tbh-gold)] text-[var(--tbh-gold)] flex items-center justify-center shrink-0">
            <Flame size={24} />
          </span>
          <h2 className="tbh-display tbh-h2">Che cos'è il Livello 3</h2>
        </div>
        <p className="tbh-body text-[var(--tbh-muted)] max-w-4xl">
          È il percorso per addetto antincendio nelle attività a rischio più elevato, quello che
          prima si chiamava «alto rischio». Il corso dura <b className="text-white">16 ore</b>:
          12 ore di teoria e 4 ore di pratica. Al termine si sostiene l'
          <b className="text-white">esame di idoneità tecnica presso il Comando dei Vigili del Fuoco</b>
          ; il gruppo segue il partecipante fino al rilascio dell'attestazione.
        </p>
        <p className="tbh-body text-[var(--tbh-muted)] max-w-4xl mt-4">
          Ogni corso accoglie al massimo <b className="text-white">15 partecipanti</b>: raggiunte le
          15 prenotazioni si programma il corso successivo. Sedi disponibili:{" "}
          <b className="text-white">{SEDI.join(", ")}</b>.
        </p>
      </section>

      {/* Le tre formule */}
      <section id="formule" className="mb-12">
        <h2 className="tbh-display tbh-h2 mb-2">Tre formule di partecipazione</h2>
        <p className="tbh-body text-[var(--tbh-muted)] max-w-3xl mb-6">
          Si scelgono al momento dell'iscrizione. Gli importi sono quelli comunicati dal gruppo;
          l'esame dei Vigili del Fuoco segue le tariffe del Comando competente.
        </p>

        <div className="grid gap-5 lg:grid-cols-3">
          {FORMULE.map((f) => (
            <div
              key={f.n}
              className={`tbh-card p-6 flex flex-col ${
                f.consigliata ? "border-[var(--tbh-neon)]" : ""
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs tracking-[0.2em] uppercase text-[var(--tbh-muted)]">
                  {f.n}
                </span>
                {f.consigliata && (
                  <span className="text-[11px] font-semibold uppercase tracking-widest px-3 py-1 rounded-full bg-[var(--tbh-neon)] text-black">
                    Consigliata
                  </span>
                )}
              </div>

              <h3 className="tbh-display tbh-h3 mt-3">{f.titolo}</h3>

              <div className="flex items-baseline gap-3 mt-3">
                <span className="tbh-display text-4xl text-[var(--tbh-gold)]">{f.prezzo}</span>
                {f.prezzoPrima && (
                  <span className="text-lg text-[var(--tbh-muted)] line-through">
                    {f.prezzoPrima}
                  </span>
                )}
              </div>
              <p className="text-sm text-[var(--tbh-muted)] mt-1">{f.sotto}</p>

              <ul className="mt-5 space-y-2 flex-1">
                {f.voci.map((v) => (
                  <li key={v} className="text-sm text-[var(--tbh-muted)] flex gap-2">
                    <span className="text-[var(--tbh-neon)] shrink-0">•</span>
                    <span>{v}</span>
                  </li>
                ))}
              </ul>

              <a
                href={wa(
                  `Buongiorno, vorrei iscrivermi al Corso Addetto Antincendio Livello 3 — ${f.titolo} (${f.prezzo}).`,
                )}
                target="_blank"
                rel="noreferrer"
                className={`mt-6 px-5 py-3 rounded-xl text-sm font-semibold inline-flex items-center justify-center gap-2 ${
                  f.consigliata
                    ? "tbh-neon-btn"
                    : "border border-[var(--tbh-line)] hover:border-[var(--tbh-neon)]"
                }`}
              >
                <MessageCircle size={16} /> Scegli questa formula
              </a>
            </div>
          ))}
        </div>

        <p className="text-xs text-[var(--tbh-muted)] mt-5 max-w-4xl">
          L'importo dell'esame e delle marche da bollo può variare secondo il Comando dei Vigili del
          Fuoco competente: eventuali variazioni vengono comunicate al momento dell'iscrizione.
        </p>
      </section>

      {/* Fidelity Consumer */}
      <section className="tbh-card p-6 md:p-8 mb-12 border-[var(--tbh-gold)]">
        <p className="text-xs tracking-[0.25em] text-[var(--tbh-gold)] uppercase mb-2">
          Formula consigliata
        </p>
        <h2 className="tbh-display tbh-h2">Cosa aggiunge la TBH Fidelity Consumer</h2>
        <p className="tbh-body text-[var(--tbh-muted)] max-w-3xl mt-2">
          La tessera vale 72 € una tantum ed è compresa nella Formula 3: il corso resta completo,
          l'esame resta incluso, e in più si entra nel circuito del gruppo.
        </p>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 mt-6">
          {VANTAGGI_FIDELITY.map((v) => (
            <div
              key={v.testo}
              className="rounded-2xl border border-[var(--tbh-line)] p-5 flex items-start gap-3"
            >
              <v.icona size={20} className="text-[var(--tbh-neon)] shrink-0 mt-0.5" />
              <p className="text-sm text-white/85">{v.testo}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Come si prenota */}
      <section className="mb-12">
        <h2 className="tbh-display tbh-h2 mb-4">Come si prenota</h2>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
            {
              n: "01",
              titolo: "Scrivi su WhatsApp",
              testo:
                "Indica la sede che preferisci (Ravenna, Modena o Rimini) e la formula scelta.",
            },
            {
              n: "02",
              titolo: "Conferma dei dati",
              testo:
                "Ti vengono confermati calendario, orari, luogo della pratica e importo dell'esame del Comando competente.",
            },
            {
              n: "03",
              titolo: "Iscrizione",
              testo:
                "Si chiude l'iscrizione e si tiene il posto: ogni corso si ferma a 15 partecipanti.",
            },
            {
              n: "04",
              titolo: "Corso ed esame",
              testo:
                "16 ore di formazione, esame presso i Vigili del Fuoco e assistenza fino all'attestazione.",
            },
          ].map((p) => (
            <div key={p.n} className="tbh-card p-5">
              <span className="text-xs tracking-[0.2em] text-[var(--tbh-neon)]">{p.n}</span>
              <h3 className="tbh-display tbh-h3 mt-2">{p.titolo}</h3>
              <p className="text-sm text-[var(--tbh-muted)] mt-2">{p.testo}</p>
            </div>
          ))}
        </div>
        <div className="flex flex-wrap gap-3 mt-6">
          <a
            href={PRENOTA}
            target="_blank"
            rel="noreferrer"
            className="tbh-neon-btn px-6 py-3 text-sm inline-flex items-center gap-2"
          >
            <MessageCircle size={16} /> Prenota il tuo posto
          </a>
          <a
            href={waInfo("Corso Addetto Antincendio Livello 3 — informazioni e calendario")}
            target="_blank"
            rel="noreferrer"
            className="px-6 py-3 rounded-xl text-sm font-semibold border border-[var(--tbh-line)] hover:border-[var(--tbh-neon)] inline-flex items-center gap-2"
          >
            <MessageCircle size={16} /> Chiedi informazioni
          </a>
        </div>
      </section>

      {/* Sezioni di sede: blocchi da 15 posti */}
      <section id="sedi" className="mb-12">
        <h2 className="tbh-display tbh-h2 mb-2">Le tre sezioni: Rimini, Ravenna, Modena</h2>
        <p className="tbh-body text-[var(--tbh-muted)] max-w-3xl mb-6">
          Ogni sede lavora a blocchi: si raccolgono le iscrizioni fino a{" "}
          <b className="text-white">15 posti</b>, si programma il corso e si apre il blocco
          successivo. Puoi prenotarti sulla sezione che ti è più comoda: il posto si tiene in
          ordine di iscrizione.
        </p>

        <div className="grid gap-5 lg:grid-cols-3">
          {SEZIONI_SEDI.map((s) => (
            <div key={s.citta} className="tbh-card p-6 flex flex-col">
              <div className="flex items-center gap-2 text-[var(--tbh-gold)]">
                <Building2 size={18} />
                <span className="text-xs uppercase tracking-widest">Sezione</span>
              </div>
              <h3 className="tbh-display text-3xl mt-2">{s.citta}</h3>
              <p className="text-sm text-[var(--tbh-muted)] mt-1">{s.area}</p>

              <dl className="mt-5 space-y-2 text-sm flex-1">
                <div className="flex items-center justify-between gap-3 border-b border-[var(--tbh-line)] pb-2">
                  <dt className="text-[var(--tbh-muted)]">Capienza del blocco</dt>
                  <dd className="font-semibold text-white">15 posti</dd>
                </div>
                <div className="flex items-center justify-between gap-3 border-b border-[var(--tbh-line)] pb-2">
                  <dt className="text-[var(--tbh-muted)]">Durata</dt>
                  <dd className="font-semibold text-white">16 ore</dd>
                </div>
                <div className="flex items-center justify-between gap-3 border-b border-[var(--tbh-line)] pb-2">
                  <dt className="text-[var(--tbh-muted)]">Esame</dt>
                  <dd className="font-semibold text-white">Comando VVF</dd>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-[var(--tbh-muted)]">Calendario</dt>
                  <dd className="font-semibold text-[var(--tbh-gold)]">In programmazione</dd>
                </div>
              </dl>

              <p className="text-xs text-[var(--tbh-muted)] mt-4">
                Giorni e orari del prossimo blocco: comunicati alla conferma dell'iscrizione.
              </p>

              <a
                href={wa(
                  `Buongiorno, vorrei iscrivermi al Corso Addetto Antincendio Livello 3 — sezione di ${s.citta}. Tenetemi un posto nel prossimo blocco da 15.`,
                )}
                target="_blank"
                rel="noreferrer"
                className="mt-5 tbh-neon-btn px-5 py-3 text-sm inline-flex items-center justify-center gap-2"
              >
                <MessageCircle size={16} /> Prenota a {s.citta}
              </a>
            </div>
          ))}
        </div>
      </section>

      {/* Le stesse formule a listino nel Touch Plaza Shop */}
      <section className="mb-12">
        <h2 className="tbh-display tbh-h2 mb-2">Le formule a listino nel Touch Plaza</h2>
        <p className="tbh-body text-[var(--tbh-muted)] max-w-3xl mb-6">
          Le tre formule sono anche voci del Touch Plaza Shop, agli stessi importi: da lì si
          ordina, si chiede la rateizzazione e si vedono i metodi di pagamento.
        </p>
        <div className="grid gap-4 md:grid-cols-3">
          {VOCI_LISTINO.map((v) => (
            <Link
              key={v.slug}
              to={`/shop/p/${v.slug}`}
              className="tbh-card p-5 hover:border-[var(--tbh-neon)] transition flex items-center gap-4"
            >
              <span className="w-11 h-11 rounded-xl border border-[var(--tbh-gold)] text-[var(--tbh-gold)] flex items-center justify-center shrink-0">
                <Ticket size={18} />
              </span>
              <span className="min-w-0">
                <span className="block tbh-display text-lg leading-tight">{v.titolo}</span>
                <span className="block text-sm text-[var(--tbh-neon)] font-semibold mt-1">
                  {v.prezzo}
                </span>
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Locandina ufficiale */}
      <section className="mb-12">
        <h2 className="tbh-display tbh-h2 mb-4">La locandina del corso</h2>
        <div className="tbh-card p-4 md:p-6">
          <div className="relative w-full aspect-[3/2] max-w-[1100px] mx-auto">
            <img
              src={LOCANDINA}
              alt="Locandina ufficiale del Corso Addetto Antincendio Livello 3 — 16 ore, tre formule di partecipazione, sedi Ravenna, Modena e Rimini"
              className="absolute inset-0 h-full w-full object-contain"
              loading="eager"
            />
          </div>
        </div>
      </section>

      {/* Perché farlo */}
      <section className="mb-12">
        <div className="tbh-card p-6 md:p-8">
          <p className="tbh-display text-xl md:text-2xl text-[var(--tbh-gold)] max-w-3xl">
            Più sicure le persone, più forti le aziende, più vivi i territori.
          </p>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4 mt-6">
            {PERCHE.map((p) => (
              <div key={p.testo} className="rounded-2xl border border-[var(--tbh-line)] p-5">
                <p.icona size={20} className="text-[var(--tbh-neon)]" />
                <p className="text-sm text-white/85 mt-3">{p.testo}</p>
              </div>
            ))}
          </div>
          <p className="tbh-body text-[var(--tbh-muted)] mt-6">
            Posti limitati: prenota il tuo percorso.
          </p>
        </div>
      </section>

      {/* Collegamenti */}
      <section className="mb-4">
        <h2 className="tbh-display tbh-h2 mb-4">Collegamenti utili</h2>
        <div className="grid gap-4 md:grid-cols-3">
          <Link to="/touch-academy" className="tbh-card p-5 hover:border-[var(--tbh-neon)]">
            <h3 className="tbh-display tbh-h3">Touch Academy</h3>
            <p className="text-sm text-[var(--tbh-muted)] mt-2">
              Formazione e reclutamento interno del gruppo.
            </p>
          </Link>
          <Link to="/shop" className="tbh-card p-5 hover:border-[var(--tbh-neon)]">
            <h3 className="tbh-display tbh-h3">Corsi &amp; servizi a listino</h3>
            <p className="text-sm text-[var(--tbh-muted)] mt-2">
              Touch Plaza Shop: formazione, kit e servizi.
            </p>
          </Link>
          <Link to="/lavoro-casting" className="tbh-card p-5 hover:border-[var(--tbh-neon)]">
            <h3 className="tbh-display tbh-h3">Lavoro &amp; Casting</h3>
            <p className="text-sm text-[var(--tbh-muted)] mt-2">
              Annunci aperti, anche per addetti antincendio.
            </p>
          </Link>
        </div>
      </section>
    </div>
  );
}
