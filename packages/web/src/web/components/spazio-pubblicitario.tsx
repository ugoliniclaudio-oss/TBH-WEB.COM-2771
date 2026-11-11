import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { ChevronRight, ExternalLink, Volume2, VolumeX } from "lucide-react";
import { client, orpc } from "../lib/api";
import {
  CAMPAGNE_TBH,
  destinazioneCampagna,
  mediaCampagna,
  type TestoPulsante,
  type TipoContenuto,
} from "../../api/data/campagne-monitor";
import { CaroselloMedia } from "./carosello-media";
import { urlVariante } from "./logo-box";
import { FileText } from "lucide-react";

/* ────────────────────────────────────────────────────────────────────────────
   SPAZIO PUBBLICITARIO — contenuto TEMPORANEO di un monitor ancora libero.
   Specifica di Claudio del 16/09/2026.

   · Ogni monitor ha due livelli: CONTENUTO PRINCIPALE (ufficiale) e CONTENUTO
     TEMPORANEO. Finché il principale non arriva, qui gira il temporaneo.
   · Quando il contenuto ufficiale arriva, la pubblicità NON si cancella: scende
     sotto il monitor (`StrisciaCampagna`) e resta in rotazione. Pagina e
     indirizzo non cambiano.
   · Etichetta sempre visibile: SPAZIO PUBBLICITARIO / PROMO TBH / PARTNER DEL
     CANALE. Sopra la pubblicità non si scrive «in allestimento»: la nota resta
     discreta sotto il vetro.
   · Video: autoplay muted loop playsinline, senza controlli (solo l'audio),
     in pausa quando esce dall'area visibile, copertina se non parte.
   · Rotazione: 10–20 secondi per le immagini, riproduzione completa per i video.
   · Visualizzazioni e click sono eventi reali registrati sul server.
   ──────────────────────────────────────────────────────────────────────────── */

export type CampagnaSpazio = {
  id: number;
  stato: string;
  etichetta: string;
  titolo: string;
  descrizione: string | null;
  sponsor: string | null;
  /** Categoria della scheda: serve solo a raggruppare, non si stampa sul vetro. */
  categoria?: string | null;
  /** Numero del canale: vuoto finché non arriva la tabella ufficiale dei numeri. */
  canale?: number | null;
  logoUrl: string | null;
  /** BARRA 1 — contenuto del monitor. */
  contenutoUrl?: string | null;
  tipoContenuto?: TipoContenuto | null;
  immagineUrl: string | null;
  videoUrl: string | null;
  /** BARRA 2 — destinazione del pulsante, indipendente dal contenuto. */
  pulsanteUrl?: string | null;
  linkInterno: string | null;
  linkEsterno: string | null;
  pulsante: TestoPulsante | string | null;
  temi: string[];
  spazi: string[];
  dispositivo: string;
  priorita: number;
  durataSec: number;
  /** false = il video si fermerà alla fine invece di ripartire. */
  loop?: boolean;
  /** "ordine" oppure "casuale": come gira la rotazione dello spazio. */
  rotazione?: string | null;
  frequenzaMax: number;
  dal: string | null;
  al: string | null;
  colore: string | null;
  interna: boolean;
  /** 28/10/2026 — «contain» = locandina intera, senza velo né testi sopra (QR leggibile). */
  adatta?: "contain" | null;
  sempreInRotazione?: boolean;
};

type Dispositivo = "mobile" | "tablet" | "desktop";

function dispositivo(): Dispositivo {
  if (typeof window === "undefined") return "desktop";
  const w = window.innerWidth;
  if (w < 700) return "mobile";
  if (w < 1100) return "tablet";
  return "desktop";
}

/* ───────────────────── BUDGET DEI VIDEO APERTI ─────────────────────
   Il sito arriva a 81 monitor: se ogni monitor apre il suo video la pagina si
   inchioda. Qui c'è un numero chiuso di posti: li prende solo chi è davvero in
   vista, gli altri restano sulla copertina e aspettano che un posto si liberi.
   Nessun video viene caricato fuori dallo schermo. */
function postiVideo() {
  if (typeof window === "undefined") return 1;
  return window.innerWidth < 700 ? 1 : window.innerWidth < 1100 ? 2 : 3;
}

const postiOccupati = new Set<number>();
const inCoda = new Set<() => void>();
let contatoreVetri = 0;

function chiediPosto(id: number): boolean {
  if (postiOccupati.has(id)) return true;
  if (postiOccupati.size >= postiVideo()) return false;
  postiOccupati.add(id);
  return true;
}

function lasciaPosto(id: number) {
  if (!postiOccupati.delete(id)) return;
  for (const avvisa of [...inCoda]) avvisa();
}

/** Frequenza massima per visita: conteggio tenuto nella sessione del browser. */
function frequenzaSuperata(c: CampagnaSpazio) {
  if (!c.frequenzaMax || typeof sessionStorage === "undefined") return false;
  const n = Number(sessionStorage.getItem(`tbh-adv-${c.id}`) ?? "0");
  return n >= c.frequenzaMax;
}

function segnaPassaggio(c: CampagnaSpazio) {
  if (!c.frequenzaMax || typeof sessionStorage === "undefined") return;
  const chiave = `tbh-adv-${c.id}`;
  sessionStorage.setItem(chiave, String(Number(sessionStorage.getItem(chiave) ?? "0") + 1));
}

/** Campagne ammesse in questo spazio: selezione, date e priorità le decide il server. */
export function useCampagneSpazio(opzioni: {
  tema?: string | null;
  spazio?: string | null;
  attivo?: boolean;
  massimo?: number;
}) {
  const dev = useMemo(dispositivo, []);
  const q = useQuery({
    ...orpc.campagne.perSpazio.queryOptions({
      input: {
        tema: opzioni.tema ?? null,
        spazio: opzioni.spazio ?? null,
        dispositivo: dev,
        massimo: opzioni.massimo ?? 4,
      },
    }),
    enabled: opzioni.attivo ?? true,
    staleTime: 5 * 60 * 1000,
  });
  const ammesse = ((q.data?.campagne ?? []) as CampagnaSpazio[]).filter(
    (c) => !frequenzaSuperata(c),
  );
  /**
   * Ultima rete: se il server ha risposto e il conteggio per visita ha spento
   * tutto, il vetro non resta nero — girano le promo TBH universali, che sono
   * pagine reali del portale.
   */
  const scorta =
    !q.isLoading && ammesse.length === 0
      ? (CAMPAGNE_TBH.filter((c) => c.temi.length === 0) as unknown as CampagnaSpazio[])
      : [];
  const campagne = ammesse.length > 0 ? ammesse : scorta;
  return { campagne, nota: q.data?.nota ?? null, riserva: q.data?.riserva ?? false };
}

/** Registrazione reale di viste e click. */
function useTraccia(spazio: string | null) {
  const dev = useMemo(dispositivo, []);
  const fatte = useRef<Set<string>>(new Set());
  return useCallback(
    (campagnaId: number, tipo: "vista" | "click") => {
      const chiave = `${campagnaId}-${tipo}-${spazio ?? ""}`;
      if (tipo === "vista") {
        if (fatte.current.has(chiave)) return;
        fatte.current.add(chiave);
      }
      const dati = { campagnaId, tipo, spazio, dispositivo: dev };
      // Un click porta via dalla pagina e annullerebbe la chiamata normale:
      // sendBeacon parte comunque, così nessun click reale va perso.
      if (tipo === "click" && typeof navigator !== "undefined" && navigator.sendBeacon) {
        try {
          const inviato = navigator.sendBeacon(
            "/api/monitor/evento",
            new Blob([JSON.stringify(dati)], { type: "application/json" }),
          );
          if (inviato) return;
        } catch {
          /* si prova con la chiamata normale */
        }
      }
      void client.campagne.traccia(dati).catch(() => undefined);
    },
    [spazio, dev],
  );
}

/** Il vetro del video in loop: muto, ripetuto, in pausa quando non si vede. */
function VideoLoop({
  url,
  poster,
  titolo,
  visibile,
}: {
  url: string;
  poster: string | null;
  titolo: string;
  visibile: boolean;
}) {
  const ref = useRef<HTMLVideoElement | null>(null);
  const [audio, setAudio] = useState(false);
  const [fallito, setFallito] = useState(false);
  // Numero del vetro: serve solo a tenere il conto dei posti video aperti.
  const idVetro = useRef<number>(0);
  if (idVetro.current === 0) idVetro.current = ++contatoreVetri;
  const [haPosto, setHaPosto] = useState(false);

  /* Posto nel budget: lo chiede solo quando il monitor è in vista, lo restituisce
     appena esce. Se i posti sono tutti presi, si mette in coda. */
  useEffect(() => {
    const mio = idVetro.current;
    if (!visibile) {
      lasciaPosto(mio);
      setHaPosto(false);
      return;
    }
    const prova = () => {
      if (chiediPosto(mio)) {
        setHaPosto(true);
        inCoda.delete(prova);
      }
    };
    prova();
    if (!postiOccupati.has(mio)) inCoda.add(prova);
    return () => {
      inCoda.delete(prova);
      lasciaPosto(mio);
    };
  }, [visibile]);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    if (visibile && haPosto) {
      const p = v.play();
      if (p && typeof p.catch === "function") p.catch(() => setFallito(true));
    } else {
      v.pause();
    }
  }, [visibile, haPosto]);

  // Niente posto (o video rotto): resta la copertina, nessun file scaricato.
  if (fallito || !haPosto) {
    return poster ? (
      <img src={poster} alt={titolo} loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
    ) : null;
  }

  return (
    <>
      <video
        ref={ref}
        src={url}
        poster={poster ?? undefined}
        muted={!audio}
        loop
        playsInline
        preload="metadata"
        onError={() => setFallito(true)}
        className="absolute inset-0 h-full w-full object-cover"
      />
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          const v = ref.current;
          setAudio((a) => !a);
          if (v) v.muted = audio;
        }}
        aria-label={audio ? "Disattiva l'audio dello spazio" : "Attiva l'audio dello spazio"}
        className="absolute bottom-2 right-2 z-20 grid h-8 w-8 place-items-center rounded-full border border-white/25 bg-black/65 text-white"
      >
        {audio ? <Volume2 size={14} /> : <VolumeX size={14} />}
      </button>
    </>
  );
}

function Creativita({
  c,
  visibile,
}: {
  c: CampagnaSpazio;
  visibile: boolean;
}) {
  // Che cosa mostra il vetro lo decide una funzione sola, condivisa col server:
  // barra 1 (URL contenuto) se compilata, altrimenti i campi storici.
  const media = mediaCampagna(c);

  // Carosello di più indirizzi: frecce, pallini e passaggio automatico dentro il vetro.
  if (media.elenco.length > 1) {
    return (
      <CaroselloMedia
        elementi={media.elenco}
        titolo={c.titolo}
        durataSec={c.durataSec || 0}
        loop={c.loop ?? true}
        casuale={c.rotazione === "casuale"}
        visibile={visibile}
      />
    );
  }

  // PDF: copertina reale se caricata, mai una finta anteprima. Il pulsante apre.
  if (media.documento) {
    return (
      <>
        {media.immagine ? (
          <img
            src={media.immagine}
            alt={c.titolo}
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : null}
        <span className="absolute left-1/2 top-1/2 z-10 flex -translate-x-1/2 -translate-y-1/2 items-center gap-1.5 rounded-full bg-black/70 px-3 py-1.5 text-[10px] font-extrabold tracking-[0.1em] text-[var(--tbh-neon)]">
          <FileText size={12} /> APRI DOCUMENTO
        </span>
      </>
    );
  }

  if (media.video) {
    return (
      <VideoLoop url={media.video} poster={media.immagine} titolo={c.titolo} visibile={visibile} />
    );
  }
  if (media.embed) {
    return visibile ? (
      <iframe
        src={media.embed}
        title={c.titolo}
        allow="autoplay; encrypted-media; picture-in-picture"
        className="pointer-events-none absolute inset-0 h-full w-full"
      />
    ) : media.immagine ? (
      <img
        src={media.immagine}
        alt={c.titolo}
        loading="lazy"
        className="absolute inset-0 h-full w-full object-cover"
      />
    ) : null;
  }
  if (media.immagine) {
    return (
      <img
        src={media.immagine}
        alt={c.titolo}
        loading="lazy"
        decoding="async"
        className={`absolute inset-0 h-full w-full ${c.adatta === "contain" ? "bg-black object-contain" : "object-cover"}`}
        data-adatta={c.adatta ?? undefined}
      />
    );
  }
  return null;
}

function Involucro({
  c,
  onClick,
  className,
  children,
}: {
  c: CampagnaSpazio;
  onClick: () => void;
  className: string;
  children: React.ReactNode;
}) {
  // BARRA 2 prima di tutto: il pulsante può puntare altrove rispetto al contenuto.
  const dove = destinazioneCampagna(c);
  if (dove.interno) {
    return (
      <Link to={dove.interno} onClick={onClick} className={className}>
        {children}
      </Link>
    );
  }
  if (dove.esterno) {
    return (
      <a href={dove.esterno} target="_blank" rel="noreferrer" onClick={onClick} className={className}>
        {children}
      </a>
    );
  }
  return <div className={className}>{children}</div>;
}

/**
 * SPAZIO PUBBLICITARIO dentro un monitor libero: occupa il vetro 16:9 al posto
 * del riquadro spento. Tutto il monitor è cliccabile.
 */
export function SpazioPubblicitario({
  campagne,
  spazio,
  nota,
  colore = "var(--tbh-neon)",
  compatto = false,
}: {
  campagne: CampagnaSpazio[];
  spazio: string;
  /** Nota discreta sotto il vetro: «Contenuto ufficiale del canale in preparazione.» */
  nota?: string | null;
  colore?: string;
  compatto?: boolean;
}) {
  const box = useRef<HTMLDivElement | null>(null);
  const [visibile, setVisibile] = useState(false);
  /* 28/10/2026 — partenza casuale: ogni visitatore entra nella rotazione da un punto diverso
     (distribuzione equilibrata), poi si prosegue senza ripetere due volte di fila. */
  const [i, setI] = useState(() => Math.floor(Math.random() * 1000));
  const traccia = useTraccia(spazio);

  const elenco = campagne.length > 0 ? campagne : [];
  const c = elenco[i % Math.max(elenco.length, 1)] ?? null;

  /* Pausa e ripresa: lo spazio lavora solo quando è davvero sullo schermo. */
  useEffect(() => {
    const el = box.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      setVisibile(true);
      return;
    }
    const o = new IntersectionObserver(
      (voci) => setVisibile(voci.some((v) => v.isIntersecting && v.intersectionRatio > 0.25)),
      { threshold: [0, 0.25, 0.6] },
    );
    o.observe(el);
    return () => o.disconnect();
  }, []);

  /* Rotazione: solo per le creatività statiche. Un video va lasciato finire. */
  const media = c ? mediaCampagna(c) : null;
  const statica = !media?.video && !media?.embed;
  useEffect(() => {
    if (!c || !visibile || elenco.length < 2 || !statica) return;
    // Durata scritta nel pannello, da 3 a 600 secondi. Un carosello tiene il vetro
    // per tutti i suoi pezzi prima di passare alla campagna successiva.
    const passo = Math.min(600, Math.max(3, c.durataSec || 14));
    const pezzi = Math.max(1, media?.elenco.length ?? 1);
    const t = setTimeout(
      () =>
        setI((x) =>
          c.rotazione === "casuale" && elenco.length > 2
            ? /* casuale ma MAI la stessa due volte di fila */
              ((x % elenco.length) + 1 + Math.floor(Math.random() * (elenco.length - 1))) % elenco.length
            : x + 1,
        ),
      passo * pezzi * 1000,
    );
    return () => clearTimeout(t);
  }, [c, visibile, elenco.length, statica, media]);

  /* Visualizzazione reale + frequenza per visita. */
  useEffect(() => {
    if (!c || !visibile) return;
    traccia(c.id, "vista");
    segnaPassaggio(c);
  }, [c, visibile, traccia]);

  if (!c) return null;

  const tinta = c.colore ?? colore;
  const dove = destinazioneCampagna(c);
  const intera = c.adatta === "contain" && !!media?.immagine && !media?.video && !media?.embed;

  return (
    <div
      ref={box}
      className="absolute inset-0"
      data-spazio-pubblicitario={c.etichetta}
      data-campagna={String(c.id)}
      data-campagna-titolo={c.titolo}
    >
      <Involucro
        c={c}
        onClick={() => traccia(c.id, "click")}
        className="group absolute inset-0 block overflow-hidden"
      >
        {/* Creatività: video in loop, embed o immagine reale */}
        <Creativita c={c} visibile={visibile} />

        {/* Fondo neutro quando lo sponsor non ha ancora consegnato la creatività */}
        {!media?.video && !media?.embed && !media?.immagine ? (
          <div
            className="absolute inset-0"
            style={{ background: `linear-gradient(140deg, ${tinta}26, transparent 70%)` }}
          />
        ) : null}

        {/* Velo di lettura: il titolo deve restare leggibile anche su una creatività chiara.
            Locandina «contain»: niente velo, deve restare intatta e col QR scansionabile. */}
        {!intera ? (
          <>
            <div className="absolute inset-0 bg-black/25" />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent" />
          </>
        ) : null}

        {/* Etichetta sempre visibile: si capisce che è pubblicità (sulla locandina intera la
            dichiara il pulsante, per non coprire il logo stampato nell'angolo) */}
        {!intera ? (
        <span
          className="tbh-dato absolute left-2 top-2 z-10 rounded-full px-2 py-0.5 text-[9px] font-bold tracking-[0.14em] text-black"
          style={{ background: tinta }}
        >
          {c.etichetta}
        </span>
        ) : null}

        {/* Numero del canale: compare solo quando c'è davvero. Finché la tabella
            ufficiale dei numeri non arriva, questo posto resta vuoto. */}
        {c.canale ? (
          <span className="tbh-dato absolute left-2 top-7 z-10 rounded border border-white/25 bg-black/70 px-1.5 py-0.5 text-[9px] font-bold tracking-[0.12em] text-white">
            CANALE {c.canale}
          </span>
        ) : null}

        {c.logoUrl ? (
          <img
            src={c.logoUrl}
            alt={c.sponsor ?? ""}
            loading="lazy"
            className="absolute right-2 top-2 z-10 h-7 max-w-[42%] rounded bg-black/55 object-contain px-1.5 py-1"
          />
        ) : null}

        {/* Locandina intera: solo il pulsante, piccolo, nell'angolo basso a destra (fuori dal QR). */}
        {intera && c.pulsante && (dove.interno || dove.esterno) ? (
          <span
            className="absolute bottom-1.5 right-1.5 z-10 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[9px] font-extrabold tracking-[0.06em] text-black shadow-[0_0_0_2px_#000]"
            style={{ background: tinta }}
            data-testid="pulsante-locandina"
          >
            <span className="sr-only">{c.etichetta} · </span>
            {c.pulsante}
            {dove.esterno && !dove.interno ? <ExternalLink size={10} /> : <ChevronRight size={11} />}
          </span>
        ) : null}

        {/* Titolo, sponsor e pulsante */}
        {!intera ? (
        <div className="absolute inset-x-0 bottom-0 z-10 flex flex-col gap-1 p-3">
          {c.sponsor ? (
            <span className="text-[9px] uppercase tracking-[0.2em]" style={{ color: tinta }}>
              {c.sponsor}
            </span>
          ) : null}
          <p className={`font-bold leading-snug ${compatto ? "text-[11px]" : "text-[13px]"} line-clamp-2`}>
            {c.titolo}
          </p>
          {!compatto && c.descrizione ? (
            <p className="line-clamp-2 text-[10px] text-[var(--tbh-muted)]">{c.descrizione}</p>
          ) : null}
          {c.pulsante && (dove.interno || dove.esterno) ? (
            <span
              className="mt-1 inline-flex w-fit items-center gap-1 rounded-full px-3 py-1 text-[10px] font-extrabold tracking-[0.08em] text-black"
              style={{ background: tinta }}
            >
              {c.pulsante}
              {dove.esterno && !dove.interno ? <ExternalLink size={11} /> : <ChevronRight size={12} />}
            </span>
          ) : null}
        </div>
        ) : null}

        {/* Pallini della rotazione */}
        {elenco.length > 1 && !intera ? (
          <div className="absolute right-2 top-11 z-10 flex flex-col gap-1">
            {elenco.map((x, k) => (
              <span
                key={x.id}
                className="h-1.5 w-1.5 rounded-full"
                style={{
                  background: k === i % elenco.length ? tinta : "rgba(255,255,255,0.32)",
                }}
              />
            ))}
          </div>
        ) : null}
      </Involucro>

      {/* La nota discreta: non copre la pubblicità, non dice «in allestimento» sopra */}
      {nota ? (
        <span className="pointer-events-none absolute inset-x-0 top-[calc(100%+2px)] hidden" aria-hidden>
          {nota}
        </span>
      ) : null}
    </div>
  );
}

/**
 * STRISCIA CAMPAGNE — dove va la pubblicità quando il contenuto ufficiale è
 * arrivato: sotto il monitor, in rotazione, con i collegamenti e le statistiche
 * ancora attivi. Non si cancella nulla.
 */
export function StrisciaCampagna({
  campagne,
  spazio,
  colore = "var(--tbh-neon)",
}: {
  campagne: CampagnaSpazio[];
  spazio: string;
  colore?: string;
}) {
  const [i, setI] = useState(0);
  const box = useRef<HTMLDivElement | null>(null);
  const [visibile, setVisibile] = useState(false);
  const traccia = useTraccia(spazio);
  const c = campagne[i % Math.max(campagne.length, 1)] ?? null;

  useEffect(() => {
    const el = box.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      setVisibile(true);
      return;
    }
    const o = new IntersectionObserver((v) => setVisibile(v.some((x) => x.isIntersecting)), {
      threshold: 0.2,
    });
    o.observe(el);
    return () => o.disconnect();
  }, []);

  useEffect(() => {
    if (!c || !visibile || campagne.length < 2) return;
    const t = setTimeout(
      () => setI((x) => x + 1),
      Math.min(600, Math.max(3, c.durataSec || 14)) * 1000,
    );
    return () => clearTimeout(t);
  }, [c, visibile, campagne.length]);

  useEffect(() => {
    if (!c || !visibile) return;
    traccia(c.id, "vista");
  }, [c, visibile, traccia]);

  if (!c) return null;
  const tinta = c.colore ?? colore;

  return (
    <div
      ref={box}
      data-striscia-campagna={c.etichetta}
      data-campagna={String(c.id)}
      data-campagna-titolo={c.titolo}
    >
      <Involucro
        c={c}
        onClick={() => traccia(c.id, "click")}
        className="flex items-center gap-3 rounded-xl border bg-black/40 p-2 transition hover:border-[var(--tbh-neon)]"
      >
        <span
          className="tbh-dato shrink-0 rounded-full px-2 py-0.5 text-[8px] font-bold tracking-[0.14em] text-black"
          style={{ background: tinta }}
        >
          {c.etichetta}
        </span>
        {c.logoUrl ? (
          /* Punto 5: anche la striscia piccola scarica la variante dal master,
             mai il file grezzo — il marchio resta intero, cambia il contenitore. */
          <img
            src={urlVariante(c.logoUrl, "icona-piccola")}
            alt=""
            loading="lazy"
            className="h-6 w-14 object-contain"
          />
        ) : c.immagineUrl ? (
          <img src={c.immagineUrl} alt="" loading="lazy" className="h-8 w-14 rounded object-cover" />
        ) : null}
        <span className="min-w-0 flex-1 truncate text-[11px] font-bold">
          {c.canale ? <span className="tbh-dato mr-1 text-[9px] opacity-70">CH {c.canale}</span> : null}
          {c.titolo}
        </span>
        {c.pulsante && (destinazioneCampagna(c).interno || destinazioneCampagna(c).esterno) ? (
          <span className="tbh-dato shrink-0 text-[10px]" style={{ color: tinta }}>
            {c.pulsante} →
          </span>
        ) : null}
      </Involucro>
    </div>
  );
}
