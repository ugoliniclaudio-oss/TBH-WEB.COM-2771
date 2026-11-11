/**
 * CAPITAN TOUCH — A CACCIA DEI NEURONI PERDUTI
 *
 * Avatar che compare a caso nelle pagine autorizzate, fa la sua gag e dopo
 * 5–10 secondi scappa fuori dallo schermo: bisogna essere svelti a cliccarlo.
 *
 * Regole applicate (specifica in docs/capitan-touch-specifica.md):
 * - decide il SERVER se comparire: pagina autorizzata, probabilità, limite giornaliero;
 * - mai due avatar contemporaneamente: questo componente è montato una volta sola nel Layout;
 * - se scappa senza essere preso, l'occasione è persa ma NON consuma un ritrovamento;
 * - le sagome sono le pose ufficiali con sfondo trasparente, non ritagliate.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";
import { Brain, Sparkles, Trophy, X, ExternalLink, MapPin } from "lucide-react";
import { codiceGiocatore } from "../lib/giocatore";
import { useApparizione, useCattura } from "../queries/capitan";

type Posa = "saluta" | "cerca" | "scappa";
type Lato = "sinistra" | "destra";

const POSE: Record<Posa, string> = {
  saluta: "/capitan-touch/capitan-saluta.png",
  cerca: "/capitan-touch/capitan-cerca.png",
  scappa: "/capitan-touch/capitan-scappa.png",
};

/** Attesa prima della comparsa: non deve arrivare addosso all'utente appena apre la pagina. */
const ATTESA_MIN = 2500;
const ATTESA_MAX = 9000;
/** Durata dell'animazione di fuga: dopo si smonta. */
const FUGA_MS = 600;

const ETICHETTA_NEURONE: Record<string, string> = {
  comune: "Neurone Comune",
  speciale: "Neurone Speciale",
  premio: "Neurone Premio",
  oro: "Neurone d'Oro",
};

const AZIONE_TESTO: Record<string, string> = {
  scheda: "Apri la scheda dell'attività",
  sito: "Apri il sito dell'attività",
  offerta: "Guarda l'offerta",
  luogo: "Vedi dove si trova",
  coupon: "Riscatta il coupon",
};

/** Pagine in cui il titolo cambia: scheda attività e mappa hanno un testo loro. */
function titoloFinestra(pagina: string) {
  if (pagina.startsWith("/e/") || pagina.startsWith("/master/")) {
    return "CAPITAN TOUCH È PASSATO DA QUI";
  }
  if (pagina.startsWith("/territorio/mappa") || pagina === "/mappa") {
    return "MI HAI TROVATO! Guarda dove sono finito questa volta…";
  }
  return "HAI TROVATO CAPITAN TOUCH!";
}

type Comparsa = {
  apparizioneId: number;
  posa: Posa;
  durataMs: number;
  lato: Lato;
  altezza: number;
  etichetta: string;
  pagina: string;
};

type Esito = {
  ok: boolean;
  motivo: string | null;
  premio: {
    neurone: string;
    titolo: string;
    descrizione: string | null;
    azione: string | null;
    linkUrl: string | null;
    attivita: string | null;
  } | null;
  rimasti: number;
  pagina: string;
};

export function CapitanTouch() {
  const [pagina] = useLocation();
  const [giocatore, setGiocatore] = useState("");
  const [comparsa, setComparsa] = useState<Comparsa | null>(null);
  const [inFuga, setInFuga] = useState(false);
  const [esito, setEsito] = useState<Esito | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout>[]>([]);

  const apparizione = useApparizione();
  const cattura = useCattura();

  useEffect(() => {
    setGiocatore(codiceGiocatore());
  }, []);

  const pulisci = useCallback(() => {
    for (const t of timer.current) clearTimeout(t);
    timer.current = [];
  }, []);

  /* Chiede al server, con un ritardo casuale, se in questa pagina si fa vedere. */
  useEffect(() => {
    if (!giocatore) return;
    /* Il pannello di allestimento e la pagina del gioco restano fuori dal gioco. */
    if (pagina.startsWith("/allestimento") || pagina.startsWith("/capitan-touch")) return;

    let vivo = true;
    setComparsa(null);
    setInFuga(false);
    pulisci();

    const attesa = ATTESA_MIN + Math.floor(Math.random() * (ATTESA_MAX - ATTESA_MIN));
    const avvio = setTimeout(async () => {
      try {
        const r = await apparizione.mutateAsync({ giocatore, pagina });
        if (!vivo || !r.mostra) return;
        setComparsa({
          apparizioneId: r.apparizioneId,
          posa: r.posa as Posa,
          durataMs: r.durataMs,
          lato: r.lato as Lato,
          altezza: r.altezza,
          etichetta: r.etichetta,
          pagina,
        });
        /* Dopo 5–10 secondi scappa: chi non è stato svelto ha perso l'occasione,
           ma non ha consumato nessuno dei suoi tre ritrovamenti di giornata. */
        const fuga = setTimeout(() => {
          if (!vivo) return;
          setInFuga(true);
          const via = setTimeout(() => vivo && setComparsa(null), FUGA_MS);
          timer.current.push(via);
        }, r.durataMs);
        timer.current.push(fuga);
      } catch {
        /* se il server non risponde, il gioco semplicemente non compare */
      }
    }, attesa);
    timer.current.push(avvio);

    return () => {
      vivo = false;
      clearTimeout(avvio);
      pulisci();
    };
    /* apparizione è una mutation stabile: si rilancia solo al cambio pagina/giocatore. */
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [giocatore, pagina, pulisci]);

  async function prendi() {
    if (!comparsa || inFuga) return;
    const c = comparsa;
    pulisci();
    setComparsa(null);
    try {
      const r = await cattura.mutateAsync({ giocatore, apparizioneId: c.apparizioneId });
      setEsito({ ...r, pagina: c.pagina });
    } catch {
      setEsito({
        ok: false,
        motivo: "errore",
        premio: null,
        rimasti: 0,
        pagina: c.pagina,
      });
    }
  }

  return (
    <>
      {comparsa && (
        <div
          className="fixed inset-0 z-[70] pointer-events-none"
          aria-hidden={false}
          data-capitan="comparsa"
        >
          <button
            type="button"
            onClick={prendi}
            aria-label="Prendi Capitan Touch"
            title="Prendilo prima che scappi!"
            className={[
              "absolute pointer-events-auto bg-transparent border-0 p-0 cursor-pointer",
              comparsa.lato === "sinistra" ? "left-1 md:left-6" : "right-1 md:right-6",
              inFuga
                ? `tbh-capitan-fugge-${comparsa.lato}`
                : `tbh-capitan-entra-${comparsa.lato}`,
            ].join(" ")}
            style={{ top: `${comparsa.altezza}%` }}
          >
            <img
              src={POSE[comparsa.posa]}
              alt="Capitan Touch"
              className="tbh-capitan-alone tbh-capitan-gag h-[26vh] md:h-[34vh] lg:h-[38vh] w-auto select-none"
              draggable={false}
            />
          </button>
        </div>
      )}

      {esito && <FinestraEsito esito={esito} chiudi={() => setEsito(null)} />}
    </>
  );
}

function FinestraEsito({ esito, chiudi }: { esito: Esito; chiudi: () => void }) {
  const premio = esito.premio;
  const oro = premio?.neurone === "oro";

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/80 px-4 py-8 overflow-y-auto">
      <div
        className="tbh-card w-full max-w-[560px] p-6 md:p-8 relative"
        style={{ borderColor: oro ? "var(--tbh-gold)" : "var(--tbh-neon)" }}
      >
        <button
          type="button"
          onClick={chiudi}
          aria-label="Chiudi"
          className="absolute right-4 top-4 text-[var(--tbh-muted)] hover:text-white"
        >
          <X size={22} />
        </button>

        {esito.ok && premio ? (
          <>
            <p
              className="text-xs uppercase tracking-[0.2em]"
              style={{ color: oro ? "var(--tbh-gold)" : "var(--tbh-neon)" }}
            >
              A caccia dei neuroni perduti
            </p>
            <h2 className="tbh-h2 mt-2">{titoloFinestra(esito.pagina)}</h2>

            <div className="mt-5 flex items-start gap-4">
              <img
                src={POSE.saluta}
                alt="Capitan Touch"
                className="h-24 w-auto shrink-0"
                loading="lazy"
              />
              <div>
                <p
                  className="inline-flex items-center gap-2 text-lg font-bold"
                  style={{ color: oro ? "var(--tbh-gold)" : "var(--tbh-neon)" }}
                >
                  {oro ? <Trophy size={20} /> : <Brain size={20} />}
                  {ETICHETTA_NEURONE[premio.neurone] ?? premio.titolo}
                </p>
                <p className="tbh-body mt-1">{premio.titolo}</p>
                {premio.descrizione && (
                  <p className="text-sm text-[var(--tbh-muted)] mt-2">{premio.descrizione}</p>
                )}
                {premio.attivita && (
                  <p className="text-sm text-[var(--tbh-muted)] mt-2 inline-flex items-center gap-2">
                    <MapPin size={15} /> {premio.attivita}
                  </p>
                )}
              </div>
            </div>

            {premio.linkUrl && (
              <a
                href={premio.linkUrl}
                target={premio.linkUrl.startsWith("http") ? "_blank" : undefined}
                rel={premio.linkUrl.startsWith("http") ? "noopener noreferrer" : undefined}
                className="tbh-neon-btn mt-6 inline-flex items-center gap-2"
              >
                {AZIONE_TESTO[premio.azione ?? ""] ?? "Apri"} <ExternalLink size={16} />
              </a>
            )}

            <div className="mt-6 flex flex-wrap items-center gap-3 text-sm">
              <a href="/capitan-touch" className="tbh-neon-btn inline-flex items-center gap-2">
                <Sparkles size={16} /> Vai ai tuoi neuroni
              </a>
              <span className="text-[var(--tbh-muted)]">
                Ritrovamenti che ti restano oggi: <strong className="text-white">{esito.rimasti}</strong>
              </span>
            </div>
          </>
        ) : (
          <>
            <p className="text-xs uppercase tracking-[0.2em] text-[var(--tbh-gold)]">
              A caccia dei neuroni perduti
            </p>
            <h2 className="tbh-h2 mt-2">{messaggioMancato(esito.motivo)}</h2>
            <p className="tbh-body mt-3 text-[var(--tbh-muted)]">
              {spiegazioneMancato(esito.motivo)}
            </p>
            <a href="/capitan-touch" className="tbh-neon-btn mt-6 inline-flex items-center gap-2">
              <Sparkles size={16} /> Come funziona il gioco
            </a>
          </>
        )}
      </div>
    </div>
  );
}

function messaggioMancato(motivo: string | null) {
  switch (motivo) {
    case "scappato":
      return "TI È SCAPPATO!";
    case "limite-giornaliero":
      return "PER OGGI BASTA";
    case "premi-esauriti":
      return "NEURONI ESAURITI";
    case "gia-raccolta":
      return "QUESTO L'HAI GIÀ PRESO";
    default:
      return "NON SI È FATTO PRENDERE";
  }
}

function spiegazioneMancato(motivo: string | null) {
  switch (motivo) {
    case "scappato":
      return "Capitan Touch resta in pagina solo pochi secondi. Nessun problema: questa occasione non ti ha consumato nessuno dei tuoi ritrovamenti di oggi.";
    case "limite-giornaliero":
      return "Hai già fatto i tuoi ritrovamenti di giornata. Torna domani: la caccia riparte da zero.";
    case "premi-esauriti":
      return "Per questa caccia i neuroni in scorta sono finiti. Restano validi quelli che hai già in tasca.";
    case "gia-raccolta":
      return "Quella comparsa era già stata raccolta: un solo premio per apparizione.";
    default:
      return "Riprova alla prossima comparsa: gira per il portale e tieni gli occhi aperti.";
  }
}
