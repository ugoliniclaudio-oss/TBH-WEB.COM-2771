import { useMemo, useRef, useState } from "react";
import { Link } from "wouter";
import {
  ChevronLeft,
  ChevronRight,
  PlayCircle,
  Film,
  Mic,
  Music2,
  Video,
  Camera,
  CalendarCheck,
  FileText,
  ListChecks,
  UserPlus,
  Images,
  ShoppingCart,
  Info,
  Sparkles,
  Send,
  Ticket,
  Radio,
  ExternalLink,
  MessageCircle,
} from "lucide-react";
import { waInfo } from "../lib/whatsapp";
import { embedVideo } from "../../api/data/campagne-monitor";
import {
  SpazioPubblicitario,
  StrisciaCampagna,
  useCampagneSpazio,
  type CampagnaSpazio,
} from "./spazio-pubblicitario";
import { urlVariante } from "./logo-box";

/* ────────────────────────────────────────────────────────────────────────────
   TRIPLE MONITOR — modulo «STRUTTURA UNIVERSALE A TRE MONITOR»
   approvato da Claudio il 15/09/2026 (docs/modulo-tre-monitor.md).

   UN SOLO componente per sette tipi di pagina. I tre monitor cambiano funzione,
   non struttura: stesso record, stesso ID, nessuna pagina doppia.

     sport    → integrale / highlights / interviste       (match_id)
     musica   → brano / videoclip / backstage             (release_id)
     azienda  → fotogallery / video promo / prenotazione   (entity_id)
     corso    → presentazione / programma / iscriviti
     prodotto → gallery / video dimostrativo / acquista
     servizio → descrizione / esempio / richiedi
     evento   → anteprima / diretta o replay / biglietti

   REGOLE FERREE APPLICATE:
   · video mancante → anteprima + «IN PUBBLICAZIONE», la pagina NON si blocca;
   · nessun player finto, nessun logo inventato, nessun riquadro grigio muto;
   · ON AIR compare SOLO se `diretta` è dichiarata vera dal dato;
   · desktop: tre monitor affiancati. Mobile: verticali, in quest'ordine.
   ──────────────────────────────────────────────────────────────────────────── */

export type TipoTriple =
  | "sport"
  | "musica"
  | "azienda"
  | "corso"
  | "prodotto"
  | "servizio"
  | "evento";

export type AzioneTriple = {
  etichetta: string;
  /** Rotta interna. */
  to?: string | null;
  /** Link esterno verificato. */
  href?: string | null;
  primaria?: boolean;
};

export type ContenutoMonitor = {
  /** Video o pagina che si apre: null = in pubblicazione, mai un player finto. */
  url?: string | null;
  /** Titolo reale del contenuto (per lo sport: il titolo pubblicato dal media partner). */
  titolo?: string | null;
  /** Riga di dati: durata, data, etichetta, orario. Solo dati confermati. */
  dati?: string | null;
  /** Immagine/copertina reale. */
  immagine?: string | null;
  /** Diretta in corso: accende ON AIR. */
  diretta?: boolean;
  /**
   * Monitor di AZIONE (prenota, iscriviti, acquista, richiedi): non è un video
   * che manca, quindi non si dichiara «in pubblicazione» — porta i pulsanti.
   */
  azione?: boolean;
  azioni?: AzioneTriple[];
};

export type RecordTriple = {
  /** match_id / release_id / entity_id: la chiave che tiene insieme i tre monitor. */
  id: string;
  tipo: TipoTriple;
  /** Titolo del record (partita, uscita, attività, corso, prodotto…). */
  titolo: string;
  categoria: string;
  /**
   * Numero del canale su cui va questa scheda. Resta vuoto finché non arriva la
   * tabella ufficiale dei numeri: nessun numero indovinato sul vetro.
   */
  canale?: number | null;
  /** Riga dati confermati: data, competizione, giornata, risultato, prezzo, indirizzo… */
  dati?: (string | null)[];
  colore?: string | null;
  /** Sponsor dichiarati di QUESTO record. */
  sponsor?: { nome: string; logo?: string | null; url?: string | null }[];
  monitor: [ContenutoMonitor, ContenutoMonitor, ContenutoMonitor];
};

const ETICHETTE: Record<TipoTriple, [string, string, string]> = {
  /* HIGHLIGHTS (era «SINTESI»): etichetta a schermo cambiata su ordine di Claudio
     del 29/09/2026. Il ruolo tecnico interno resta `sintesi` — è agganciato al
     riconoscimento dei titoli del canale, dove la parola è proprio «Highlights». */
  sport: ["PARTITA INTEGRALE", "HIGHLIGHTS", "INTERVISTE FINE GARA"],
  musica: ["BRANO INTEGRALE", "VIDEOCLIP MUSICALE", "BACKSTAGE"],
  azienda: ["FOTOGALLERY", "VIDEO PROMO", "PRENOTA ORA"],
  corso: ["PRESENTAZIONE", "PROGRAMMA", "ISCRIVITI"],
  prodotto: ["GALLERY", "VIDEO DIMOSTRATIVO", "ACQUISTA"],
  servizio: ["DESCRIZIONE", "ESEMPIO", "RICHIEDI"],
  evento: ["ANTEPRIMA", "DIRETTA O REPLAY", "BIGLIETTI"],
};

const ICONE: Record<TipoTriple, [typeof Film, typeof Film, typeof Film]> = {
  sport: [Film, PlayCircle, Mic],
  musica: [Music2, Video, Camera],
  azienda: [Images, Video, CalendarCheck],
  corso: [FileText, ListChecks, UserPlus],
  prodotto: [Images, Video, ShoppingCart],
  servizio: [Info, Sparkles, Send],
  evento: [Film, Radio, Ticket],
};

/**
 * Da URL a embed: una sola funzione per tutto il sito (YouTube e Vimeo ufficiali,
 * nessun player di terze parti). Ri-esportata qui per le pagine che la usavano.
 */
export { embedVideo };

function Pulsante({ a, colore }: { a: AzioneTriple; colore: string }) {
  const classe = a.primaria
    ? "tbh-neon-btn inline-flex items-center gap-1.5 px-3.5 py-2 text-[11px] font-extrabold tracking-[0.08em]"
    : "inline-flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-[11px] font-bold tracking-[0.08em] hover:text-black hover:bg-[var(--tbh-neon)]";
  const stile = a.primaria ? undefined : ({ borderColor: `${colore}77`, color: colore } as const);

  if (a.to) {
    return (
      <Link to={a.to} className={classe} style={stile}>
        {a.etichetta}
        <ChevronRight size={13} />
      </Link>
    );
  }
  if (a.href) {
    return (
      <a href={a.href} target="_blank" rel="noreferrer" className={classe} style={stile}>
        {a.etichetta}
        <ExternalLink size={13} />
      </a>
    );
  }
  return null;
}

function Monitor({
  indice,
  tipo,
  contenuto,
  colore,
  campagne = [],
  nota,
  spazio,
  canale,
}: {
  indice: 0 | 1 | 2;
  tipo: TipoTriple;
  contenuto: ContenutoMonitor;
  colore: string;
  /** Numero del canale della scheda: si stampa solo se c'è davvero. */
  canale?: number | null;
  /** Campagne ammesse: riempiono il monitor finché il contenuto ufficiale non arriva. */
  campagne?: CampagnaSpazio[];
  nota?: string | null;
  spazio?: string;
}) {
  const [acceso, setAcceso] = useState(false);
  const etichetta = ETICHETTE[tipo][indice];
  const Icona = ICONE[tipo][indice];
  const embed = contenuto.url ? embedVideo(contenuto.url) : null;
  const azioni = (contenuto.azioni ?? []).filter((a) => a.to || a.href);

  /**
   * Monitor libero (nessun contenuto ufficiale, nessun pulsante d'azione):
   * al posto del riquadro spento gira lo spazio temporaneo. Ogni monitor parte
   * da una campagna diversa, così i tre vetri non ripetono la stessa.
   */
  const daRiempire = !contenuto.url && !contenuto.azione && campagne.length > 0;
  const rotazione = daRiempire
    ? [...campagne.slice(indice % campagne.length), ...campagne.slice(0, indice % campagne.length)]
    : [];

  return (
    <article
      data-monitor={etichetta}
      className="flex min-w-0 flex-col overflow-hidden rounded-2xl border bg-black/45"
      style={{ borderColor: `${colore}55`, boxShadow: `0 0 50px -34px ${colore}` }}
    >
      {/* Targhetta del monitor */}
      <div
        className="flex items-center justify-between gap-2 border-b px-3 py-2"
        style={{ borderColor: `${colore}33` }}
      >
        <p
          className="tbh-display flex items-center gap-2 text-[11px] tracking-[0.12em]"
          style={{ color: colore }}
        >
          <Icona size={14} /> {etichetta}
        </p>
        <span className="flex items-center gap-1.5">
          {/* Numero del canale: compare solo quando è stato consegnato. */}
          {canale ? (
            <span className="tbh-dato rounded border border-white/25 bg-black/70 px-1.5 py-0.5 text-[9px] font-bold tracking-[0.12em] text-white">
              CANALE {canale}
            </span>
          ) : null}
          {contenuto.diretta ? (
            <span className="tbh-dato rounded-full bg-[#ff2b2b] px-2 py-0.5 text-[9px] font-bold text-black">
              ON AIR
            </span>
          ) : null}
        </span>
      </div>

      {/* Vetro 16:9 */}
      <div className="relative w-full overflow-hidden" style={{ aspectRatio: "16/9" }}>
        {embed && acceso ? (
          <iframe
            src={`${embed}?autoplay=1&rel=0`}
            title={contenuto.titolo ?? etichetta}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; picture-in-picture"
            allowFullScreen
            className="absolute inset-0 h-full w-full"
          />
        ) : daRiempire ? (
          /* Spazio temporaneo: pubblicità o promo TBH, mai un monitor morto. */
          <SpazioPubblicitario
            campagne={rotazione}
            spazio={spazio ?? etichetta}
            colore={colore}
          />
        ) : (
          <>
            {contenuto.immagine ? (
              <img
                src={contenuto.immagine}
                alt={contenuto.titolo ?? etichetta}
                loading="lazy"
                className="absolute inset-0 h-full w-full object-cover"
              />
            ) : (
              <div
                className="absolute inset-0 grid place-items-center gap-2 text-center"
                style={{ background: `linear-gradient(140deg, ${colore}1f, transparent 66%)` }}
              >
                <div className="flex flex-col items-center gap-2 px-4">
                  <Icona size={30} style={{ color: colore, opacity: 0.45 }} />
                  {/* Monitor senza contenuto: si dichiara, non si finge un pulsante. */}
                  {!contenuto.url && !contenuto.azione ? (
                    /* Nessun vetro morto: il monitor senza contenuto ufficiale
                       porta comunque a una pagina reale del portale. */
                    <Link
                      to="/tv-streaming-adv"
                      className="tbh-dato inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-[9.5px] font-bold uppercase tracking-[0.14em] hover:text-black hover:bg-[var(--tbh-neon)]"
                      style={{ borderColor: `${colore}77`, color: colore }}
                    >
                      Spazio disponibile · scopri <ChevronRight size={12} />
                    </Link>
                  ) : null}
                </div>
              </div>
            )}

            {contenuto.url ? (
              embed ? (
                <button
                  type="button"
                  onClick={() => setAcceso(true)}
                  aria-label={`Riproduci: ${contenuto.titolo ?? etichetta}`}
                  className="absolute inset-0 grid place-items-center bg-black/35 transition hover:bg-black/15"
                >
                  <PlayCircle size={52} className="text-white drop-shadow" />
                </button>
              ) : (
                <a
                  href={contenuto.url}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={`Apri: ${contenuto.titolo ?? etichetta}`}
                  className="absolute inset-0 grid place-items-center bg-black/35 transition hover:bg-black/15"
                >
                  <PlayCircle size={52} className="text-white drop-shadow" />
                </a>
              )
            ) : contenuto.azione ? null : (
              /* Contenuto non ancora pubblicato: si dichiara, non si finge. */
              <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-2 bg-black/70 px-3 py-2">
                <span className="text-[10px] uppercase tracking-[0.2em] text-[var(--tbh-muted)]">
                  In pubblicazione
                </span>
                <a
                  href={waInfo(`Contenuto «${etichetta}» — ${contenuto.titolo ?? ""}`)}
                  target="_blank"
                  rel="noreferrer"
                  className="tbh-dato inline-flex items-center gap-1 text-[10px] text-[var(--tbh-neon)]"
                >
                  <MessageCircle size={12} /> SEGNALA
                </a>
              </div>
            )}
          </>
        )}
      </div>

      {/* Didascalia sotto il vetro: mai sopra, mai sovrapposta */}
      <div className="flex flex-1 flex-col gap-2 p-3">
        <p className="text-[12px] font-bold leading-snug line-clamp-2">
          {contenuto.titolo ??
            (contenuto.azione ? "" : daRiempire ? etichetta : "Contenuto in allestimento")}
        </p>
        {daRiempire ? (
          /* Nota discreta SOTTO la pubblicità: nessuna scritta sopra la creatività. */
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-[9.5px] uppercase tracking-[0.14em] text-[var(--tbh-muted)]">
              {nota ?? "Contenuto ufficiale del canale in preparazione."}
            </span>
            <a
              href={waInfo(`Contenuto «${etichetta}» — ${contenuto.titolo ?? ""}`)}
              target="_blank"
              rel="noreferrer"
              className="tbh-dato inline-flex items-center gap-1 text-[9.5px] text-[var(--tbh-neon)]"
            >
              <MessageCircle size={11} /> SEGNALA
            </a>
          </div>
        ) : null}
        {contenuto.dati ? (
          <p className="tbh-dato text-[10px] text-[var(--tbh-muted)]">{contenuto.dati}</p>
        ) : null}
        {azioni.length > 0 ? (
          <div className="mt-auto flex flex-wrap gap-1.5 pt-1">
            {azioni.map((a) => (
              <Pulsante key={a.etichetta} a={a} colore={colore} />
            ))}
          </div>
        ) : null}
      </div>
    </article>
  );
}

/** Le tre fasce di periodo del modulo: uguali su ogni pagina che le usa. */
export type Periodo = "ATTUALI" | "RECENTI 2026" | "ARCHIVIO";
export const PERIODI: Periodo[] = ["ATTUALI", "RECENTI 2026", "ARCHIVIO"];

export function SelettorePeriodo({
  valore,
  cambia,
  conteggi,
  colore = "var(--tbh-neon)",
  etichette = {
    ATTUALI: "Stagione 2026/2027 · dal 30/08/2026",
    "RECENTI 2026": "Prima del 30/08/2026",
    ARCHIVIO: "2025/2026 e precedenti",
  },
}: {
  valore: Periodo;
  cambia: (p: Periodo) => void;
  conteggi?: Record<Periodo, number>;
  colore?: string;
  etichette?: Record<Periodo, string>;
}) {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-[10px] uppercase tracking-[0.22em] text-[var(--tbh-muted)]">
        Periodo · stagione · raccolta
      </p>
      <div className="flex flex-wrap gap-2">
        {PERIODI.map((p) => {
          const attivo = p === valore;
          return (
            <button
              key={p}
              type="button"
              onClick={() => cambia(p)}
              aria-pressed={attivo}
              className={`rounded-full border px-4 py-2 text-left text-[11px] font-bold tracking-[0.08em] transition ${
                attivo ? "text-black" : "hover:border-[var(--tbh-neon)]"
              }`}
              style={
                attivo
                  ? { background: colore, borderColor: colore }
                  : { borderColor: "var(--tbh-line)" }
              }
            >
              <span className="tbh-display block text-[12px]">
                {p}
                {conteggi ? ` · ${conteggi[p]}` : ""}
              </span>
              <span
                className={`block text-[9px] font-medium tracking-normal ${
                  attivo ? "text-black/70" : "text-[var(--tbh-muted)]"
                }`}
              >
                {etichette[p]}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/**
 * TRIPLE MONITOR — un record, tre monitor coordinati, frecce avanti/indietro.
 * `precedente`/`successivo` sono funzioni: se mancano, le frecce non compaiono
 * (nessun pulsante morto).
 */
export function TripleMonitor({
  record,
  precedente,
  successivo,
  posizione,
  totale,
  sotto,
}: {
  record: RecordTriple;
  precedente?: { etichetta: string; vai: () => void } | null;
  successivo?: { etichetta: string; vai: () => void } | null;
  posizione?: number;
  totale?: number;
  /** Riga libera sotto i monitor: correlati, archivio, note. */
  sotto?: React.ReactNode;
}) {
  const colore = record.colore ?? "var(--tbh-neon)";
  const dati = (record.dati ?? []).filter(Boolean) as string[];

  /**
   * COMANDI TOUCH + MOUSE + TASTIERA (punto 1 della specifica).
   * Telefono e tablet: trascinamento orizzontale sul blocco dei monitor.
   * Computer: frecce del blocco, tasti ← → quando il blocco ha il fuoco.
   * Se `precedente`/`successivo` mancano, il gesto non fa nulla: niente comandi finti.
   */
  const partenza = useRef<{ x: number; y: number } | null>(null);
  const inizioTocco = (e: React.TouchEvent) => {
    const t = e.touches[0];
    partenza.current = t ? { x: t.clientX, y: t.clientY } : null;
  };
  const fineTocco = (e: React.TouchEvent) => {
    const p = partenza.current;
    const t = e.changedTouches[0];
    partenza.current = null;
    if (!p || !t) return;
    const dx = t.clientX - p.x;
    const dy = t.clientY - p.y;
    // Solo un gesto orizzontale deciso: lo scorrimento verticale della pagina resta libero.
    if (Math.abs(dx) < 60 || Math.abs(dx) < Math.abs(dy) * 1.6) return;
    if (dx < 0) successivo?.vai();
    else precedente?.vai();
  };
  const tasti = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowRight" && successivo) {
      e.preventDefault();
      successivo.vai();
    }
    if (e.key === "ArrowLeft" && precedente) {
      e.preventDefault();
      precedente.vai();
    }
  };

  /**
   * Monitor liberi di questo record. Le campagne si chiedono una volta per record
   * (non una per vetro) e si chiedono solo se c'è davvero uno spazio da riempire.
   */
  const liberi = record.monitor.filter((m) => !m.url && !m.azione).length;
  const ufficiali = record.monitor.filter((m) => m.url).length;
  const { campagne, nota } = useCampagneSpazio({
    tema: record.tipo,
    spazio: record.id,
    attivo: liberi > 0 || ufficiali > 0,
    massimo: 4,
  });

  return (
    <section
      data-triple={record.id}
      tabIndex={precedente || successivo ? 0 : undefined}
      onKeyDown={precedente || successivo ? tasti : undefined}
      aria-label={`Scheda ${record.titolo}${
        precedente || successivo ? " · frecce ← → per cambiare scheda" : ""
      }`}
      className="flex flex-col gap-4 rounded-3xl border p-4 md:p-6 outline-none focus-visible:border-[var(--tbh-neon)]"
      style={{
        borderColor: `${colore}44`,
        background: `radial-gradient(120% 140% at 0% 0%, ${colore}14 0%, transparent 62%)`,
      }}
    >
      {/* Testata del record + frecce */}
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[10px] uppercase tracking-[0.22em]" style={{ color: colore }}>
            {record.categoria}
          </p>
          <h3 className="tbh-display text-[18px] leading-tight md:text-[24px]">{record.titolo}</h3>
          {dati.length > 0 ? (
            <p className="tbh-dato mt-1 text-[11px] text-[var(--tbh-muted)]">{dati.join("  ·  ")}</p>
          ) : null}
        </div>

        <div className="flex items-center gap-2">
          {typeof posizione === "number" && typeof totale === "number" ? (
            <span className="tbh-dato text-[11px] text-[var(--tbh-muted)]">
              {posizione}/{totale}
            </span>
          ) : null}
          {precedente ? (
            <button
              type="button"
              onClick={precedente.vai}
              title={precedente.etichetta}
              aria-label={`Precedente: ${precedente.etichetta}`}
              className="inline-flex items-center gap-1 rounded-full border border-[var(--tbh-line)] bg-black/60 px-3 py-2 text-[10px] font-bold hover:border-[var(--tbh-neon)] hover:text-[var(--tbh-neon)]"
            >
              <ChevronLeft size={14} /> PREC.
            </button>
          ) : null}
          {successivo ? (
            <button
              type="button"
              onClick={successivo.vai}
              title={successivo.etichetta}
              aria-label={`Successivo: ${successivo.etichetta}`}
              className="inline-flex items-center gap-1 rounded-full border border-[var(--tbh-line)] bg-black/60 px-3 py-2 text-[10px] font-bold hover:border-[var(--tbh-neon)] hover:text-[var(--tbh-neon)]"
            >
              SUCC. <ChevronRight size={14} />
            </button>
          ) : null}
        </div>
      </header>

      {/* I TRE MONITOR: affiancati da desktop, verticali da telefono.
          Trascinamento orizzontale = scheda precedente / successiva. */}
      <div
        className="grid gap-4 md:grid-cols-3"
        onTouchStart={inizioTocco}
        onTouchEnd={fineTocco}
        style={{ touchAction: "pan-y" }}
      >
        {record.monitor.map((m, i) => (
          <Monitor
            key={`${record.id}-${i}`}
            indice={i as 0 | 1 | 2}
            tipo={record.tipo}
            contenuto={m}
            colore={colore}
            campagne={campagne}
            nota={nota}
            spazio={`${record.id}:${i + 1}`}
            canale={record.canale ?? null}
          />
        ))}
      </div>

      {/*
        Gerarchia del contenuto: se almeno un monitor ha già il contenuto ufficiale,
        la campagna non si cancella — scende qui sotto, in rotazione, con i suoi
        collegamenti e le sue statistiche. Pagina e indirizzo restano gli stessi.
      */}
      {ufficiali > 0 && campagne.length > 0 ? (
        <StrisciaCampagna campagne={campagne} spazio={`${record.id}:sotto`} colore={colore} />
      ) : null}

      {/* Sponsor del record */}
      {record.sponsor && record.sponsor.length > 0 ? (
        <div className="flex flex-wrap items-center gap-2 border-t pt-3" style={{ borderColor: `${colore}22` }}>
          <span className="text-[9px] uppercase tracking-[0.22em] text-[var(--tbh-muted)]">
            Sponsor
          </span>
          {record.sponsor.map((s) =>
            s.url ? (
              <a
                key={s.nome}
                href={s.url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full border border-[var(--tbh-line)] px-3 py-1 text-[10px] font-bold hover:border-[var(--tbh-neon)] hover:text-[var(--tbh-neon)]"
              >
                {s.logo ? (
                  <img
                    src={urlVariante(s.logo, "icona-piccola")}
                    alt=""
                    className="h-4 w-4 object-contain"
                  />
                ) : null}
                {s.nome}
              </a>
            ) : (
              <span
                key={s.nome}
                className="rounded-full border border-[var(--tbh-line)] px-3 py-1 text-[10px] text-[var(--tbh-muted)]"
              >
                {s.nome}
              </span>
            ),
          )}
        </div>
      ) : null}

      {sotto}
    </section>
  );
}

/** Scorre un elenco di record con le frecce: ritorna il record corrente e i comandi. */
export function useScorrimento<T>(elenco: T[]) {
  const [i, setI] = useState(0);
  const indice = Math.min(i, Math.max(elenco.length - 1, 0));
  const corrente = elenco[indice] ?? null;
  return useMemo(
    () => ({
      corrente,
      indice,
      vaiA: setI,
      indietro: indice > 0 ? () => setI(indice - 1) : null,
      avanti: indice < elenco.length - 1 ? () => setI(indice + 1) : null,
    }),
    [corrente, indice, elenco.length],
  );
}
