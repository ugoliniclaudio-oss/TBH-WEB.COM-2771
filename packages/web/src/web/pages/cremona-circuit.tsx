import { Link } from "wouter";
import {
  Flame,
  Users,
  Moon,
  Sun,
  MapPin,
  CalendarDays,
  AlertTriangle,
  Shirt,
  Smartphone,
  FileText,
  CheckCircle2,
  Clock,
  Map,
  Car,
  Trophy,
  Bike,
  Utensils,
  Armchair,
  Ticket,
  ExternalLink,
  Globe,
} from "lucide-react";
import { SlotContenuti } from "../components/slot-contenuti";
import {
  SBK_EVENTO,
  SBK_CANDIDATURE_CERCATE,
  SBK_OPERATORI_MASSIMI,
  SBK_SQUADRE,
  SBK_DIVISA,
  SBK_APP,
  SBK_DOCUMENTI,
  SBK_CONTEGGIO,
  SBK_ITER,
  SBK_AVVISO,
  type SquadraSbk,
} from "../lib/sbk-cremona-2026";
import {
  WSBK_ROUND,
  WSBK_CAMPIONATO,
  WSBK_ROUND_NUMERO,
  WSBK_DATE,
  WSBK_INDIRIZZO,
  WSBK_VERIFICATO_IL,
  WSBK_LINK,
  WSBK_PARCHEGGI,
  WSBK_PARCHEGGI_NOTA,
  WSBK_AREE,
  WSBK_MAPPA_AVVISO,
} from "../lib/worldsbk-cremona-2026";

/**
 * CREMONA CIRCUIT 2026 — ricerca operatori per il presidio evento motorsport.
 *
 * Testo e numeri consegnati da Claudio il 04/09/2026, con il piano operatori ufficiale
 * (immagine inviata da lui). Regole rispettate:
 * · i numeri dei turni sono i SUOI, riportati alla lettera (55 = 20 antincendio + 35 ordinari,
 *   60 = 20 antincendio + 40 ordinari): nessun conteggio ricalcolato o corretto d'ufficio;
 * · l'immagine è quella ufficiale che ha inviato, pubblicata così com'è;
 * · compenso, inquadramento e condizioni NON sono nell'annuncio: non li scrive l'agente;
 * · unico contatto per candidarsi era l'infoline WhatsApp; dal 06/10/2026 l'evento è concluso,
 *   l'annuncio è in archivio e i pulsanti di candidatura sono sostituiti da «Selezione conclusa».
 */

const IMG = "/brand/cremona-circuit-2026-piano-operatori.jpg";
const MAPPA = "https://www.google.com/maps/search/?api=1&query=Cremona+Circuit";

type Turno = {
  giorno: string;
  data: string;
  tipo: "Diurno" | "Notturno";
  orario: string;
  antincendio: number;
  ordinari: number;
  totale: number;
};

/** Piano turni come da annuncio e dal piano operatori ufficiale. */
const TURNI: Turno[] = [
  {
    giorno: "Giovedì",
    data: "24 settembre 2026",
    tipo: "Notturno",
    orario: "18:00 – 07:00",
    antincendio: 0,
    ordinari: 6,
    totale: 6,
  },
  {
    giorno: "Venerdì",
    data: "25 settembre 2026",
    tipo: "Diurno",
    orario: "07:00 – 18:00",
    antincendio: 20,
    ordinari: 35,
    totale: 55,
  },
  {
    giorno: "Venerdì",
    data: "25 settembre 2026",
    tipo: "Notturno",
    orario: "18:00 – 07:00",
    antincendio: 0,
    ordinari: 6,
    totale: 6,
  },
  {
    giorno: "Sabato",
    data: "26 settembre 2026",
    tipo: "Diurno",
    orario: "07:00 – 18:00",
    antincendio: 20,
    ordinari: 35,
    totale: 55,
  },
  {
    giorno: "Sabato",
    data: "26 settembre 2026",
    tipo: "Notturno",
    orario: "18:00 – 07:00",
    antincendio: 0,
    ordinari: 6,
    totale: 6,
  },
  {
    giorno: "Domenica",
    data: "27 settembre 2026",
    tipo: "Diurno",
    orario: "07:00 – 18:00",
    antincendio: 20,
    ordinari: 40,
    totale: 60,
  },
];

/** Dati riportati sul piano operatori ufficiale. */
const RIEPILOGO = [
  { icona: Flame, n: "20", t: "Antincendio", d: "operatori con idoneità tecnica, per turno diurno" },
  { icona: Users, n: "40", t: "Ordinari diurni", d: "il massimo previsto, nella giornata di domenica" },
  { icona: Moon, n: "6", t: "Ordinari notturni", d: "per ogni presidio notturno" },
];

const TOTALI = [
  { t: "Totale organico consigliato", n: "66 persone" },
  { t: "Totale presenze/turno complessive", n: "188" },
];

/** Aree operative indicate nell'annuncio. */
const AREE = [
  "Ingressi e controllo accessi",
  "Gestione flussi pubblico",
  "Tribune e aree prato",
  "Paddock",
  "Parco chiuso",
  "VIP / Hospitality",
  "Presidio aree operative",
  "Supporto logistico",
  "Controllo perimetrale",
  "Supporto al coordinamento operativo",
];

/** Reparti suggeriti sul piano operatori ufficiale, divisi per presidio. */
const REPARTI = [
  {
    tipo: "Presidio diurno · 07:00 – 18:00",
    icona: Sun,
    nota: "20 operatori antincendio · 35 ordinari venerdì, 35 ordinari sabato, 40 ordinari domenica",
    voci: [
      "Ingressi e controllo accessi",
      "Flussi / tribune / prato",
      "Paddock / parco chiuso",
      "VIP / hospitality",
      "Jolly / coordinamento operativo",
    ],
  },
  {
    tipo: "Presidio notturno · 18:00 – 07:00",
    icona: Moon,
    nota: "6 operatori ordinari per notte",
    voci: [
      "Presidio accessi",
      "Controllo perimetro",
      "Aree tecniche / logistiche",
      "Supporto coordinamento",
    ],
  },
];

/** Icona per ciascuna area del weekend WorldSBK (solo grafica, i testi sono del comunicato). */
const WSBK_ICONE: Record<string, typeof Trophy> = {
  paddock: Trophy,
  village: Bike,
  food: Utensils,
  tribune: Armchair,
};

function Riga({ t }: { t: Turno }) {
  const notte = t.tipo === "Notturno";
  return (
    <tr className="border-t border-[var(--tbh-line)]">
      <td className="py-3 pr-3 whitespace-nowrap">
        <span className="block text-sm font-semibold">{t.giorno}</span>
        <span className="block text-[11px] text-[var(--tbh-muted)]">{t.data}</span>
      </td>
      <td className="py-3 pr-3 text-sm whitespace-nowrap">{t.orario}</td>
      <td className="py-3 pr-3 text-sm text-center">
        {t.antincendio > 0 ? (
          <span className="inline-flex items-center gap-1.5 font-bold text-[#ff8a00]">
            <Flame size={14} /> {t.antincendio}
          </span>
        ) : (
          <span className="text-[var(--tbh-muted)]">0</span>
        )}
      </td>
      <td className="py-3 pr-3 text-sm text-center font-semibold">{t.ordinari}</td>
      <td className="py-3 pr-3 text-center">
        <span className="tbh-display text-lg text-[var(--tbh-neon)]">{t.totale}</span>
      </td>
      <td className="py-3 text-sm whitespace-nowrap">
        <span
          className={`inline-flex items-center gap-1.5 font-semibold ${
            notte ? "text-[#33e0ff]" : "text-[var(--tbh-gold)]"
          }`}
        >
          {notte ? <Moon size={14} /> : <Sun size={14} />} {t.tipo}
        </span>
      </td>
    </tr>
  );
}

/** Colonna squadra della nuova ricerca SBK 2026: locandina ufficiale + dati alla lettera. */
function SquadraCard({ s }: { s: SquadraSbk }) {
  const notte = s.turno === "Notturno";
  return (
    <article
      className="tbh-card overflow-hidden flex flex-col"
      style={{ borderColor: s.colore }}
      data-squadra-sbk={s.id}
    >
      <img
        src={s.locandina}
        alt={`Locandina ufficiale ${SBK_EVENTO} — Squadra ${s.numero}: ${s.nome} ${s.turno}`}
        className="w-full h-auto"
      />

      <div className="p-5 flex flex-col gap-4 grow">
        <div>
          <span
            className="text-[11px] font-bold uppercase tracking-[0.2em]"
            style={{ color: s.colore }}
          >
            Squadra {s.numero}
          </span>
          <h3 className="tbh-display tbh-h3 mt-1">{s.nome}</h3>
          <span
            className="inline-flex items-center gap-1.5 text-sm font-semibold mt-1"
            style={{ color: s.colore }}
          >
            {notte ? <Moon size={15} /> : <Sun size={15} />} Servizio {s.turno.toLowerCase()}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-[var(--tbh-line)] px-3 py-2">
            <span className="tbh-display text-2xl leading-none">{s.cercati}</span>
            <span className="block text-[11px] uppercase tracking-wide text-[var(--tbh-muted)] mt-1">
              candidature cercate
            </span>
          </div>
          <div className="rounded-xl border border-[var(--tbh-line)] px-3 py-2">
            <span className="tbh-display text-2xl leading-none" style={{ color: s.colore }}>
              {s.massimi}
            </span>
            <span className="block text-[11px] uppercase tracking-wide text-[var(--tbh-muted)] mt-1">
              operatori massimi
            </span>
          </div>
        </div>

        <div className="text-sm">
          <span className="inline-flex items-center gap-2 font-semibold">
            <CalendarDays size={15} className="text-[var(--tbh-neon)]" /> {s.giorni}
          </span>
          <span className="flex items-start gap-2 text-[var(--tbh-muted)] mt-2">
            <Clock size={15} className="shrink-0 mt-0.5" /> {s.ritrovo}
          </span>
        </div>

        <ul className="flex flex-col gap-1.5">
          {s.orari.map((o) => (
            <li key={o} className="text-sm">
              · {o}
            </li>
          ))}
        </ul>

        <div>
          <span className="text-[11px] uppercase tracking-wide text-[var(--tbh-muted)]">
            Mansioni
          </span>
          <ul className="mt-2 flex flex-col gap-1.5">
            {s.mansioni.map((m) => (
              <li key={m} className="text-sm">
                · {m}
              </li>
            ))}
          </ul>
        </div>

        {s.requisito ? (
          <div className="rounded-xl border border-[#ff8a00]/60 bg-[#ff8a00]/10 p-3 flex items-start gap-2">
            <Flame size={17} className="text-[#ff8a00] shrink-0 mt-0.5" />
            <p className="text-sm">
              <strong className="text-[#ff8a00]">Requisito obbligatorio:</strong> {s.requisito}
            </p>
          </div>
        ) : null}

        <SelezioneConclusa />
      </div>
    </article>
  );
}

/** 06/10/2026 — l'evento (24-27 settembre 2026) è concluso: l'annuncio è in archivio e
 *  non raccoglie più candidature. Nessun invio su WhatsApp. */
function SelezioneConclusa() {
  return (
    <Link
      to="/lavoro-casting/bacheca?archivio=1"
      className="px-5 py-3 rounded-full border border-[var(--tbh-line)] text-sm font-semibold inline-flex items-center gap-2 text-[var(--tbh-muted)] hover:border-[var(--tbh-gold)]"
    >
      Selezione conclusa · annuncio in archivio
    </Link>
  );
}

export default function CremonaCircuitPage() {
  return (
    <div className="mx-auto max-w-[1400px] px-4 md:px-8 py-10">
      <Link to="/lavoro-casting/bacheca" className="text-sm text-[var(--tbh-muted)]">
        ← TBH Lavoro — Bacheca annunci
      </Link>

      <header className="tbh-rise mt-4 mb-8">
        <p className="text-xs tracking-[0.25em] text-[var(--tbh-gold)] uppercase mb-2">
          Lavoro · SBK Superbike · Presidio evento motorsport
        </p>
        <p className="inline-flex rounded-full border border-[var(--tbh-gold)]/60 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-[var(--tbh-gold)] mb-3">
          In archivio · evento concluso il 27 settembre 2026 · candidature chiuse
        </p>
        <h1 className="tbh-display tbh-h1">
          SBK Cremona Circuit 2026 — ricerca operatori
        </h1>
        <p className="tbh-body text-[var(--tbh-muted)] mt-3 max-w-3xl">
          Per attività operative presso Cremona Circuit raccogliamo candidature e disponibilità per
          i servizi previsti dal <strong className="text-white">24 al 27 settembre 2026</strong>.
          Sono richiesti operatori ordinari e operatori in possesso di idoneità tecnica antincendio,
          secondo i turni indicati.
        </p>

        <div className="flex flex-wrap gap-3 mt-6">
          <SelezioneConclusa />
          <a
            href={MAPPA}
            target="_blank"
            rel="noreferrer"
            className="tbh-card px-5 py-3 text-sm font-semibold inline-flex items-center gap-2 hover:border-[var(--tbh-neon)]"
          >
            <MapPin size={16} /> Sede del servizio: Cremona Circuit
          </a>
          <a
            href="#worldsbk"
            className="tbh-card px-5 py-3 text-sm font-semibold inline-flex items-center gap-2 hover:border-[var(--tbh-neon)]"
          >
            <Map size={16} /> Mappa e aree del weekend
          </a>
        </div>
      </header>

      {/*
        WORLDSBK · EICMA ITALIAN ROUND — informazioni dell'evento.
        Testi riportati alla lettera dal comunicato ufficiale del Cremona Circuit
        consegnato da Claudio il 15/09/2026. Nessuna mappa rifatta: si rimanda a quella
        ufficiale del circuito. Questa sezione si AGGIUNGE alla ricerca personale, che
        resta integra qui sotto.
      */}
      <section className="mb-12 scroll-mt-28 md:scroll-mt-40" id="worldsbk">
        <div className="tbh-card p-5 md:p-7">
          <p className="text-xs tracking-[0.25em] text-[var(--tbh-gold)] uppercase">
            {WSBK_CAMPIONATO}
          </p>
          <h2 className="tbh-display tbh-h2 mt-2">{WSBK_ROUND} — Cremona Circuit</h2>

          <div className="grid gap-3 sm:grid-cols-3 mt-5">
            <div className="rounded-xl border border-[var(--tbh-line)] px-4 py-3">
              <span className="text-[11px] uppercase tracking-wide text-[var(--tbh-muted)]">
                Gare
              </span>
              <span className="block tbh-display text-xl text-[var(--tbh-neon)] mt-1">
                {WSBK_DATE}
              </span>
            </div>
            <div className="rounded-xl border border-[var(--tbh-line)] px-4 py-3">
              <span className="text-[11px] uppercase tracking-wide text-[var(--tbh-muted)]">
                Round
              </span>
              <span className="block text-sm font-semibold mt-1">{WSBK_ROUND_NUMERO}</span>
            </div>
            <div className="rounded-xl border border-[var(--tbh-line)] px-4 py-3">
              <span className="text-[11px] uppercase tracking-wide text-[var(--tbh-muted)]">
                Dove
              </span>
              <span className="block text-sm font-semibold mt-1">{WSBK_INDIRIZZO}</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 mt-5">
            <a
              href={WSBK_LINK.circuito}
              target="_blank"
              rel="noreferrer"
              className="tbh-neon-btn px-5 py-3 inline-flex items-center gap-2"
            >
              <Map size={16} /> Mappa e info ufficiali del circuito
            </a>
            <a
              href={WSBK_LINK.biglietti}
              target="_blank"
              rel="noreferrer"
              className="tbh-card px-5 py-3 text-sm font-semibold inline-flex items-center gap-2 hover:border-[var(--tbh-gold)]"
            >
              <Ticket size={16} /> Biglietti
            </a>
            <a
              href={WSBK_LINK.mondiale}
              target="_blank"
              rel="noreferrer"
              className="tbh-card px-5 py-3 text-sm font-semibold inline-flex items-center gap-2 hover:border-[var(--tbh-neon)]"
            >
              <Globe size={16} /> Pagina del round su WorldSBK
            </a>
            <a
              href={WSBK_LINK.mappaGoogle}
              target="_blank"
              rel="noreferrer"
              className="tbh-card px-5 py-3 text-sm font-semibold inline-flex items-center gap-2 hover:border-[var(--tbh-neon)]"
            >
              <MapPin size={16} /> Come arrivare
            </a>
          </div>

          <div className="mt-5 rounded-xl border border-[var(--tbh-line)] bg-white/[0.03] p-4 flex items-start gap-3">
            <ExternalLink size={18} className="text-[var(--tbh-gold)] shrink-0 mt-0.5" />
            <p className="text-sm text-[var(--tbh-muted)]">{WSBK_MAPPA_AVVISO}</p>
          </div>
        </div>

        {/* AREE PARCHEGGIO — sigle e colori come sulla mappa ufficiale */}
        <div className="mt-6">
          <span className="inline-flex items-center gap-2 tbh-display text-lg">
            <Car size={18} className="text-[var(--tbh-neon)]" /> Aree parcheggio
          </span>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mt-4">
            {WSBK_PARCHEGGI.map((p) => (
              <div
                key={`${p.sigla}-${p.nome}`}
                className="tbh-card p-5"
                style={{ borderColor: p.colore }}
                data-parcheggio-wsbk={p.sigla}
              >
                <span
                  className="inline-flex h-9 min-w-9 items-center justify-center rounded-lg px-2 tbh-display text-lg text-black"
                  style={{ backgroundColor: p.colore }}
                >
                  {p.sigla}
                </span>
                <h3 className="text-sm font-bold uppercase tracking-wide mt-3">{p.nome}</h3>
                <p className="text-sm text-[var(--tbh-muted)] mt-2">{p.testo}</p>
                {p.riservato ? (
                  <span className="inline-block text-[11px] font-bold uppercase tracking-wide mt-3 text-[#ff8a00]">
                    Accesso riservato
                  </span>
                ) : null}
              </div>
            ))}
          </div>
          <p className="text-sm text-[var(--tbh-gold)] mt-4">{WSBK_PARCHEGGI_NOTA}</p>
        </div>

        {/* AREE DEL WEEKEND: paddock, village, food & drink, tribune */}
        <div className="grid gap-4 md:grid-cols-2 mt-6">
          {WSBK_AREE.map((a) => {
            const Icona = WSBK_ICONE[a.id] ?? Trophy;
            return (
              <div key={a.id} className="tbh-card p-5 md:p-6" data-area-wsbk={a.id}>
                <span className="inline-flex items-center gap-2 tbh-display text-lg text-[var(--tbh-neon)]">
                  <Icona size={18} /> {a.titolo}
                </span>
                <p className="text-xs uppercase tracking-wide text-[var(--tbh-muted)] mt-2">
                  {a.sottotitolo}
                </p>
                <ul className="mt-4 flex flex-col gap-2">
                  {a.voci.map((v) => (
                    <li key={v} className="text-sm">
                      · {v}
                    </li>
                  ))}
                </ul>
                {a.nota ? (
                  <p className="text-sm text-[var(--tbh-gold)] mt-4">{a.nota}</p>
                ) : null}
              </div>
            );
          })}
        </div>

        <p className="text-[11px] text-[var(--tbh-muted)] mt-5">
          Informazioni dell'evento riprese dal comunicato ufficiale del Cremona Circuit e
          verificate sulle fonti ufficiali del circuito e del Mondiale il {WSBK_VERIFICATO_IL}.
          Orari, aree e servizi restano quelli comunicati dall'organizzazione.
        </p>
      </section>

      {/* RICERCA PERSONALE SBK 2026: 3 squadre operative, locandine ufficiali di Claudio */}
      <section className="mb-12" id="ricerca-personale">
        <h2 className="tbh-display tbh-h2">{SBK_EVENTO} — ricerca personale</h2>
        <p className="tbh-body text-[var(--tbh-muted)] mt-3 max-w-3xl">
          Un'unica grande ricerca suddivisa in <strong className="text-white">tre squadre
          operative</strong>. Ogni squadra ha giornate, orari, mansioni e requisiti propri: si sceglie
          la squadra e ci si candida.
        </p>

        <div className="grid gap-3 sm:grid-cols-2 mt-6">
          <div className="tbh-card px-5 py-4 flex items-center justify-between gap-3">
            <span className="text-xs uppercase tracking-wide text-[var(--tbh-muted)]">
              Candidature cercate
            </span>
            <span className="tbh-display text-3xl text-[var(--tbh-neon)]">
              {SBK_CANDIDATURE_CERCATE}
            </span>
          </div>
          <div className="tbh-card px-5 py-4 flex items-center justify-between gap-3">
            <span className="text-xs uppercase tracking-wide text-[var(--tbh-muted)]">
              Operatori massimi selezionati e accreditati
            </span>
            <span className="tbh-display text-3xl text-[var(--tbh-gold)]">
              {SBK_OPERATORI_MASSIMI}
            </span>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3 mt-6">
          {SBK_SQUADRE.map((s) => (
            <SquadraCard key={s.id} s={s} />
          ))}
        </div>

        {/* BLOCCO UNICO: divisa, App SBK, documenti, iter — valido per tutte e tre le squadre */}
        <div className="grid gap-4 md:grid-cols-2 mt-6">
          <div className="tbh-card p-5">
            <span className="inline-flex items-center gap-2 tbh-display text-lg">
              <Shirt size={18} className="text-[var(--tbh-neon)]" /> {SBK_DIVISA.titolo}
            </span>
            <p className="tbh-display text-2xl text-[var(--tbh-gold)] mt-3">
              {SBK_DIVISA.evidenza}
            </p>
            <p className="text-sm text-[var(--tbh-muted)] mt-2">{SBK_DIVISA.testo}</p>
          </div>

          <div className="tbh-card p-5">
            <span className="inline-flex items-center gap-2 tbh-display text-lg">
              <Smartphone size={18} className="text-[var(--tbh-neon)]" /> {SBK_APP.titolo}
            </span>
            <ul className="mt-3 flex flex-col gap-1.5">
              {SBK_APP.voci.map((v) => (
                <li key={v} className="text-sm">
                  · {v}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="tbh-card p-5 md:p-6 mt-4">
          <span className="inline-flex items-center gap-2 tbh-display text-lg">
            <FileText size={18} className="text-[var(--tbh-neon)]" /> Documenti obbligatori
          </span>
          <div className="grid gap-4 md:grid-cols-3 mt-4">
            <div>
              <span className="text-[11px] uppercase tracking-wide text-[var(--tbh-muted)]">
                Per tutti
              </span>
              <ul className="mt-2 flex flex-col gap-1.5">
                {SBK_DOCUMENTI.base.map((d) => (
                  <li key={d} className="text-sm font-semibold">
                    · {d}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <span className="text-[11px] uppercase tracking-wide text-[#ff8a00]">
                Solo servizio antincendio
              </span>
              <ul className="mt-2 flex flex-col gap-1.5">
                {SBK_DOCUMENTI.antincendio.map((d) => (
                  <li key={d} className="text-sm font-semibold">
                    · {d}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <span className="text-[11px] uppercase tracking-wide text-[var(--tbh-muted)]">
                Cittadini stranieri
              </span>
              <ul className="mt-2 flex flex-col gap-1.5">
                {SBK_DOCUMENTI.stranieri.map((d) => (
                  <li key={d} className="text-sm font-semibold">
                    · {d}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <p className="text-sm text-[var(--tbh-gold)] mt-5">{SBK_CONTEGGIO}</p>
        </div>

        <div className="mt-4">
          <span className="inline-flex items-center gap-2 tbh-display text-lg">
            <CheckCircle2 size={18} className="text-[var(--tbh-neon)]" /> Iter di candidatura
          </span>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mt-4">
            {SBK_ITER.map((p) => (
              <div key={p.passo} className="tbh-card p-5">
                <span className="tbh-display text-3xl text-[var(--tbh-neon)]">{p.passo}</span>
                <span className="block text-sm font-bold uppercase tracking-wide mt-1">
                  {p.titolo}
                </span>
                <p className="text-sm text-[var(--tbh-muted)] mt-2">{p.testo}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-4 rounded-xl border border-[#ff8a00]/60 bg-[#ff8a00]/10 p-4 flex items-start gap-3">
          <AlertTriangle size={20} className="text-[#ff8a00] shrink-0 mt-0.5" />
          <p className="text-sm">{SBK_AVVISO}</p>
        </div>
      </section>

      {/* PIANO OPERATORI UFFICIALE: immagine inviata dalla direzione, pubblicata così com'è */}
      <figure className="tbh-card overflow-hidden mb-10">
        <img
          src={IMG}
          alt="Cremona Circuit — Piano Operatori 24-27 settembre 2026"
          className="w-full h-auto"
        />
        <figcaption className="p-4 text-xs text-[var(--tbh-muted)]">
          Piano operatori ufficiale · Cremona Circuit · 24–27 settembre 2026.
        </figcaption>
      </figure>

      <section className="grid gap-4 md:grid-cols-3 mb-6">
        {RIEPILOGO.map((r) => (
          <div key={r.t} className="tbh-card p-5 flex items-start gap-4">
            <r.icona size={26} className="text-[var(--tbh-neon)] shrink-0 mt-1" />
            <div>
              <span className="tbh-display text-3xl leading-none">{r.n}</span>
              <span className="block text-sm font-semibold uppercase tracking-wide mt-1">{r.t}</span>
              <span className="block text-xs text-[var(--tbh-muted)] mt-1">{r.d}</span>
            </div>
          </div>
        ))}
      </section>

      <section className="tbh-card p-5 md:p-6 mb-10">
        <h2 className="tbh-display tbh-h2 mb-4">Turni e organico richiesto</h2>
        <div className="tbh-scroll-x overflow-x-auto">
          <table className="w-full min-w-[620px] text-left">
            <thead>
              <tr className="text-[11px] uppercase tracking-wide text-[var(--tbh-muted)]">
                <th className="pb-2 pr-3 font-semibold">Data</th>
                <th className="pb-2 pr-3 font-semibold">Orario</th>
                <th className="pb-2 pr-3 font-semibold text-center">Antincendio</th>
                <th className="pb-2 pr-3 font-semibold text-center">Ordinari</th>
                <th className="pb-2 pr-3 font-semibold text-center">Totale</th>
                <th className="pb-2 font-semibold">Presidio</th>
              </tr>
            </thead>
            <tbody>
              {TURNI.map((t) => (
                <Riga key={`${t.data}-${t.tipo}`} t={t} />
              ))}
            </tbody>
          </table>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 mt-5">
          {TOTALI.map((x) => (
            <div
              key={x.t}
              className="rounded-xl border border-[var(--tbh-line)] px-4 py-3 flex items-center justify-between gap-3"
            >
              <span className="text-xs uppercase tracking-wide text-[var(--tbh-muted)]">{x.t}</span>
              <span className="tbh-display text-xl text-[var(--tbh-gold)]">{x.n}</span>
            </div>
          ))}
        </div>

        <div className="mt-5 rounded-xl border border-[#ff8a00]/60 bg-[#ff8a00]/10 p-4 flex items-start gap-3">
          <AlertTriangle size={20} className="text-[#ff8a00] shrink-0 mt-0.5" />
          <p className="text-sm">
            <strong className="text-[#ff8a00]">Attenzione:</strong> nei turni da 55 i 20 operatori
            antincendio sono <strong>già compresi</strong> nel totale. Quindi 55 = 20 antincendio +
            35 ordinari. Domenica 60 = 20 antincendio + 40 ordinari.
          </p>
        </div>
      </section>

      <section className="mb-10">
        <h2 className="tbh-display tbh-h2 mb-4">Ruoli e aree operative</h2>
        <p className="tbh-body text-[var(--tbh-muted)] mb-5 max-w-3xl">
          In base alle esigenze organizzative dell'evento, gli operatori potranno essere impiegati
          nelle seguenti aree. Gli operatori con idoneità tecnica antincendio saranno destinati agli
          specifici presidi previsti dall'organizzazione.
        </p>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {AREE.map((a) => (
            <div key={a} className="tbh-card p-4 text-sm font-semibold">
              {a}
            </div>
          ))}
        </div>

        <div className="grid gap-4 md:grid-cols-2 mt-6">
          {REPARTI.map((r) => (
            <div key={r.tipo} className="tbh-card p-5">
              <span className="inline-flex items-center gap-2 tbh-display text-lg text-[var(--tbh-neon)]">
                <r.icona size={18} /> {r.tipo}
              </span>
              <p className="text-xs text-[var(--tbh-muted)] mt-2">{r.nota}</p>
              <ul className="mt-3 flex flex-col gap-1.5">
                {r.voci.map((v) => (
                  <li key={v} className="text-sm">
                    · {v}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2 mb-10">
        <div className="tbh-card p-5 md:p-6">
          <h2 className="tbh-display tbh-h3 mb-3">Disponibilità richiesta</h2>
          <p className="text-sm text-[var(--tbh-muted)]">
            È possibile candidarsi per una o più giornate, indicando chiaramente i turni per i quali
            si è disponibili. Per gli operatori antincendio è necessario segnalare nella candidatura
            il possesso della relativa idoneità tecnica antincendio.
          </p>
          <p className="text-xs text-[var(--tbh-muted)] mt-4">
            Compenso, inquadramento e condizioni operative non sono indicati in questo annuncio: li
            comunica direttamente la direzione in fase di candidatura.
          </p>
        </div>

        <div className="tbh-card p-5 md:p-6">
          <h2 className="tbh-display tbh-h3 mb-3">Candidature chiuse</h2>
          <p className="text-sm text-[var(--tbh-muted)]">
            L&apos;evento del 24-27 settembre 2026 si è concluso: la ricerca operatori non raccoglie
            più candidature e resta consultabile nell&apos;archivio della bacheca TBH Lavoro.
          </p>
          <div className="flex flex-wrap gap-3 mt-5">
            <SelezioneConclusa />
            <Link
              to="/lavoro-casting/bacheca"
              className="tbh-neon-btn px-5 py-3 inline-flex items-center gap-2"
            >
              Vedi gli annunci aperti
            </Link>
          </div>
        </div>
      </section>

      <section className="tbh-card p-5 md:p-6 mb-10 flex flex-wrap items-center gap-4 justify-between">
        <span className="inline-flex items-center gap-3 tbh-display text-xl">
          <CalendarDays size={20} className="text-[var(--tbh-neon)]" /> 24 · 25 · 26 · 27 settembre
          2026 — Cremona Circuit
        </span>
        <div className="flex flex-wrap gap-3">
          <SelezioneConclusa />
        </div>
      </section>

      <SlotContenuti
        slot="cremona-2026:materiali"
        modo="foto"
        colonne={3}
        titolo="Materiali dell'evento"
        descrizione="Locandine, planimetrie e comunicazioni operative: si caricano una a una."
      />

      <p className="text-[11px] text-[var(--tbh-muted)] mt-8">
        Posti disponibili in base ai turni richiesti. I numeri e gli orari sono quelli del piano
        operatori ufficiale: non vengono modificati dal portale.
      </p>
    </div>
  );
}
