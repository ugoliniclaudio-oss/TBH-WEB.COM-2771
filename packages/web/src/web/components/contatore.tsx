import { useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";
import {
  Activity,
  ExternalLink,
  Eye,
  MousePointerClick,
  Radar,
  ShoppingBag,
  Store,
  ThumbsDown,
  ThumbsUp,
  Users,
} from "lucide-react";
import { useRegistraStatistiche, useStatistiche } from "../queries/statistiche";

/**
 * CONTATORE REALE DI PRESENZE E INTERAZIONI.
 *
 * Regola di Claudio: nessun numero inventato, niente cifre gonfiate «sparate a caso».
 * Ogni valore è un contatore vero del portale e parte da zero il giorno della messa online.
 *
 * · Visitatori reali    → una sola volta per sessione del browser, non a ogni ricarica;
 * · Navigazioni attive  → una sola volta per sessione, e solo se la visita è reale:
 *                         almeno 2 pagine viste, oppure oltre 30 secondi sul portale,
 *                         oppure un clic vero su una sezione;
 * · Interazioni         → solo su clic reale (WhatsApp, vai al sito, Maps, prenota,
 *                         acquista, scarica, apri scheda, social…);
 * · Schede consultate   → solo quando una scheda/vetrina viene davvero aperta;
 * · Feedback utili      → solo se l'utente vota «Sì» sul micro-feedback della scheda.
 *
 * I numeri storici del network (visualizzazioni complessive, contatti in database, ecc.)
 * sono DICHIARAZIONI del gruppo: stanno in un blocco separato e non vengono mai
 * mescolati con i dati rilevati dal sito.
 */

const CHIAVE_VISITA = "tbh_visita_registrata";
const CHIAVE_NAVIGAZIONE = "tbh_navigazione_registrata";
const CHIAVE_FEEDBACK = "tbh_feedback_dato_";

/** Indirizzi che corrispondono all'apertura di una scheda o di una vetrina. */
const SCHEDE: RegExp[] = [
  /^\/master\/[^/]+$/, // anagrafica master: società, attività, sponsor, sedi
  /^\/e\/[^/]+$/, // entità del gruppo
  /^\/tbh\/p\/[^/]+$/, // pagine brand
  /^\/tbh\/livelli\/[^/]+$/, // livelli del circuito
  /^\/shop\/p\/[^/]+$/, // prodotti del Touch Plaza Shop
  /^\/shop\/s\/[^/]+$/, // servizi e corsi
  /^\/influencity\/[^/]+$/, // numeri del magazine
  /^\/sport\/squadre\/[^/]+$/, // squadre
  /^\/sanremo\/[^/]+$/, // luoghi Sanremo
  /^\/media\/dm\/[^/]+$/, // programmi DM
];

function eScheda(path: string) {
  return SCHEDE.some((r) => r.test(path));
}

type Coda = {
  visita: boolean;
  navigazione: boolean;
  pagine: number;
  schede: number;
  interazioni: number;
  uscite: number;
};

const CODA_VUOTA: Coda = {
  visita: false,
  navigazione: false,
  pagine: 0,
  schede: 0,
  interazioni: 0,
  uscite: 0,
};

/** Raccoglie gli eventi reali e li invia a blocchi, per non tempestare il server. */
export function useContatore() {
  const [path] = useLocation();
  const registra = useRegistraStatistiche();
  const coda = useRef<Coda>({ ...CODA_VUOTA });
  const invio = useRef<ReturnType<typeof setTimeout> | null>(null);
  const invia = useRef<() => void>(() => {});
  const pagineViste = useRef(0);
  const navigazioneContata = useRef(false);
  const ultimoPath = useRef<string | null>(null);

  invia.current = () => {
    const c = coda.current;
    const qualcosa =
      c.visita || c.navigazione || c.pagine || c.schede || c.interazioni || c.uscite;
    if (!qualcosa) return;
    coda.current = { ...CODA_VUOTA };
    registra.mutate(c);
  };

  const accoda = (campo: keyof Coda) => {
    if (campo === "visita" || campo === "navigazione") coda.current[campo] = true;
    else coda.current[campo] += 1;
    if (invio.current) clearTimeout(invio.current);
    invio.current = setTimeout(() => invia.current(), 1200);
  };

  /**
   * Navigazione attiva: conta una sola volta per sessione, e solo quando la visita
   * si dimostra reale (2 pagine, 30 secondi oppure un clic su una sezione).
   */
  const segnalaNavigazione = () => {
    if (navigazioneContata.current) return;
    try {
      if (sessionStorage.getItem(CHIAVE_NAVIGAZIONE)) {
        navigazioneContata.current = true;
        return;
      }
      sessionStorage.setItem(CHIAVE_NAVIGAZIONE, "1");
    } catch {
      /* storage bloccato: si conta comunque una volta per questa pagina aperta */
    }
    navigazioneContata.current = true;
    accoda("navigazione");
  };

  // Visitatore: una sola volta per sessione del browser.
  useEffect(() => {
    try {
      if (!sessionStorage.getItem(CHIAVE_VISITA)) {
        sessionStorage.setItem(CHIAVE_VISITA, "1");
        accoda("visita");
      }
      if (sessionStorage.getItem(CHIAVE_NAVIGAZIONE)) navigazioneContata.current = true;
    } catch {
      /* browser con storage bloccato: si conta solo la pagina */
    }
    // Permanenza oltre 30 secondi = navigazione reale.
    const t = setTimeout(() => segnalaNavigazione(), 30_000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Pagine viste e schede aperte: a ogni cambio di indirizzo, mai due volte lo stesso.
  useEffect(() => {
    if (ultimoPath.current === path) return; // niente doppioni (in sviluppo React ripete gli effetti)
    ultimoPath.current = path;
    accoda("pagine");
    if (eScheda(path)) accoda("schede");
    pagineViste.current += 1;
    if (pagineViste.current >= 2) segnalaNavigazione();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [path]);

  // Interazioni: clic reali su link e pulsanti; i canali esterni sono contati a parte.
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const el = (e.target as HTMLElement | null)?.closest("a,button");
      if (!el) return;
      const href = el.getAttribute("href") ?? "";
      const esterno = /^https?:\/\//i.test(href) && !href.includes(window.location.host);
      accoda(esterno ? "uscite" : "interazioni");
      segnalaNavigazione();
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}

function formatta(n: number) {
  return new Intl.NumberFormat("it-IT").format(n);
}

/** Le cinque voci reali mostrate in Home, nell'ordine indicato da Claudio. */
const VOCI = [
  {
    chiave: "visite",
    label: "Visitatori reali",
    nota: "Una volta per sessione",
    icona: Users,
    colore: "var(--tbh-neon)",
  },
  {
    chiave: "navigazioni",
    label: "Navigazioni attive",
    nota: "2 pagine, 30 secondi o un clic",
    icona: Radar,
    colore: "#33e0ff",
  },
  {
    chiave: "interazioni",
    label: "Interazioni generate",
    nota: "Solo su clic reale",
    icona: MousePointerClick,
    colore: "#ff2b2b",
  },
  {
    chiave: "schede",
    label: "Schede consultate",
    nota: "Vetrine davvero aperte",
    icona: Store,
    colore: "#9dff3c",
  },
  {
    chiave: "feedback_utili",
    label: "Feedback utili",
    nota: "Solo se l'utente vota",
    icona: ThumbsUp,
    colore: "var(--tbh-gold)",
  },
] as const;

/** Voci secondarie: dato vero ma di servizio. */
const SECONDARIE = [
  { chiave: "pagine", label: "Pagine viste", icona: Eye },
  { chiave: "uscite", label: "Canali ufficiali aperti", icona: ExternalLink },
  { chiave: "ordini", label: "Ordini registrati", icona: ShoppingBag },
] as const;

/** Riquadro completo: usato in Home. */
export function ContatorePresenze() {
  const { data, isLoading } = useStatistiche();
  const avvio = Number(data?.visite ?? 0) < 50;

  return (
    <section className="tbh-card p-6 md:p-8">
      <div className="flex flex-wrap items-end justify-between gap-3 mb-2">
        <div>
          <p className="text-[11px] uppercase tracking-[0.25em] text-[var(--tbh-gold)] mb-1">
            Il portale in tempo reale
          </p>
          <h2 className="tbh-display tbh-h2 flex items-center gap-2">
            <Activity size={22} className="text-[var(--tbh-neon)]" /> TBH in tempo reale
          </h2>
        </div>
        <span className="text-[11px] uppercase tracking-wide text-[var(--tbh-muted)]">
          {data?.dal
            ? `Rilevazione attiva dal ${new Date(data.dal).toLocaleDateString("it-IT")}`
            : "Rilevazione appena avviata"}
        </span>
      </div>

      <p className="tbh-body text-sm text-[var(--tbh-muted)] max-w-3xl mb-6">
        Il portale misura le presenze reali, la navigazione, le interazioni e le schede
        consultate. Ogni clic utile contribuisce a migliorare la rete TBH: società, partner,
        sponsor, squadre, prodotti, eventi e servizi.
      </p>

      <div className="grid gap-4 grid-cols-2 lg:grid-cols-5">
        {VOCI.map((v) => {
          const Icona = v.icona;
          const valore = data ? (data as Record<string, unknown>)[v.chiave] : null;
          return (
            <div
              key={v.chiave}
              className="rounded-2xl border border-[var(--tbh-line)] p-4 flex flex-col gap-2"
              style={{ boxShadow: `inset 0 0 0 1px transparent, 0 0 22px -18px ${v.colore}` }}
            >
              <Icona size={18} style={{ color: v.colore }} />
              <div
                className="tbh-display text-2xl md:text-3xl leading-none"
                style={{ color: v.colore }}
              >
                {isLoading ? "…" : formatta(Number(valore ?? 0))}
              </div>
              <div className="text-[11px] uppercase tracking-wide text-[var(--tbh-muted)] leading-tight">
                {v.label}
              </div>
              <div className="text-[10px] text-[var(--tbh-muted)] opacity-70 leading-tight">
                {v.nota}
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex flex-wrap gap-x-6 gap-y-2 mt-5 text-[11px] uppercase tracking-wide text-[var(--tbh-muted)]">
        {SECONDARIE.map((s) => {
          const Icona = s.icona;
          return (
            <span key={s.chiave} className="inline-flex items-center gap-2">
              <Icona size={13} className="opacity-70" />
              <strong className="tbh-display text-sm text-[var(--tbh-text)]">
                {formatta(Number((data as Record<string, unknown> | undefined)?.[s.chiave] ?? 0))}
              </strong>
              {s.label}
            </span>
          );
        })}
      </div>

      <p className="text-[11px] text-[var(--tbh-muted)] mt-4">
        {avvio
          ? "Statistiche in crescita dal lancio ufficiale. "
          : "Dati aggiornati automaticamente dalle visite reali del portale. "}
        {data?.nota ??
          "Nessun numero inventato: il valore cresce con l'utilizzo del portale."}
      </p>
    </section>
  );
}

/**
 * NUMERI DICHIARATI DEL NETWORK — separati di proposito dai dati del portale.
 * Sono dichiarazioni del gruppo TBH sull'attività media/eventi, non rilevazioni del sito:
 * l'etichetta lo dice in chiaro, così non si confondono con il contatore reale.
 */
const NETWORK_DICHIARATO = [
  { valore: "+2M", label: "Visualizzazioni complessive dichiarate" },
  { valore: "+60k", label: "Interazioni network" },
  { valore: "+18k", label: "Contatti database e community" },
] as const;

export function NetworkDichiarato() {
  return (
    <section className="tbh-card p-6 md:p-8">
      <p className="text-[11px] uppercase tracking-[0.25em] text-[var(--tbh-gold)] mb-1">
        Dati dichiarati dal gruppo — non rilevati dal sito
      </p>
      <h2 className="tbh-display tbh-h2 mb-4">Network TBH</h2>
      <div className="grid gap-4 sm:grid-cols-3">
        {NETWORK_DICHIARATO.map((n) => (
          <div key={n.label} className="rounded-2xl border border-[var(--tbh-line)] p-4">
            <div className="tbh-display text-2xl md:text-3xl text-[var(--tbh-gold)] leading-none">
              {n.valore}
            </div>
            <div className="text-[11px] uppercase tracking-wide text-[var(--tbh-muted)] mt-2 leading-tight">
              {n.label}
            </div>
          </div>
        ))}
      </div>
      <p className="text-[11px] text-[var(--tbh-muted)] mt-4">
        Valori dichiarati dal network TBH sull'attività media, eventi e community. Sono tenuti
        separati dal contatore del portale, che misura invece soltanto visite e clic reali del
        sito.
      </p>
    </section>
  );
}

/**
 * MICRO-FEEDBACK DI SCHEDA. Un solo voto per scheda e per dispositivo:
 * il numero «Feedback utili» in Home cresce solo se qualcuno vota davvero.
 */
export function FeedbackScheda({ chiave }: { chiave: string }) {
  const registra = useRegistraStatistiche();
  const [stato, setStato] = useState<"da-votare" | "votato">("da-votare");

  useEffect(() => {
    try {
      if (localStorage.getItem(CHIAVE_FEEDBACK + chiave)) setStato("votato");
      else setStato("da-votare");
    } catch {
      setStato("da-votare");
    }
  }, [chiave]);

  const vota = (feedback: "utile" | "migliorare") => {
    try {
      localStorage.setItem(CHIAVE_FEEDBACK + chiave, feedback);
    } catch {
      /* storage bloccato: il voto viene comunque inviato una volta */
    }
    setStato("votato");
    registra.mutate({ feedback });
  };

  if (stato === "votato") {
    return (
      <div className="tbh-card p-4 text-[12px] text-[var(--tbh-muted)]">
        Grazie: il tuo riscontro è stato registrato e conta nel dato pubblico «Feedback utili».
      </div>
    );
  }

  return (
    <div className="tbh-card p-4 flex flex-wrap items-center gap-3">
      <span className="tbh-body text-sm">Ti è stata utile questa scheda?</span>
      <button
        type="button"
        onClick={() => vota("utile")}
        className="tbh-neon-btn inline-flex items-center gap-2 px-4 py-2 text-[12px] uppercase tracking-wide"
      >
        <ThumbsUp size={14} /> Sì
      </button>
      <button
        type="button"
        onClick={() => vota("migliorare")}
        className="inline-flex items-center gap-2 rounded-full border border-[var(--tbh-line)] px-4 py-2 text-[12px] uppercase tracking-wide text-[var(--tbh-muted)] hover:text-[var(--tbh-text)]"
      >
        <ThumbsDown size={14} /> Da migliorare
      </button>
    </div>
  );
}

/** Striscia compatta: usata nel piè di pagina. */
export function ContatoreStriscia() {
  const { data } = useStatistiche();
  if (!data) return null;
  return (
    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-[11px] uppercase tracking-wide text-[var(--tbh-muted)]">
      <span className="text-[var(--tbh-gold)]">Contatore reale del portale</span>
      {VOCI.map((v) => (
        <span key={v.chiave}>
          <strong className="tbh-display text-sm" style={{ color: v.colore }}>
            {formatta(Number((data as Record<string, unknown>)[v.chiave] ?? 0))}
          </strong>{" "}
          {v.label}
        </span>
      ))}
    </div>
  );
}
