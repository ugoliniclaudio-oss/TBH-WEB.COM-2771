import { useCallback, useEffect, useState } from "react";
import { Brain, Check, Coins, MessageCircle, RotateCcw, Trophy, X } from "lucide-react";
import { waInfo } from "../lib/whatsapp";

/**
 * GIOCHI GIOCABILI — ordine di Claudio (03/09/2026): «Devi inserire tu i giochi».
 *
 * Tre giochi che funzionano davvero, senza login e senza server:
 * · MEMORY dei 10 mondi TBH;
 * · SUDOKU 4x4 con griglia generata e verifica reale;
 * · QUIZ TBH, con domande costruite SOLO su dati già pubblicati e verificati del gruppo
 *   (nessuna domanda inventata su fatti non confermati).
 *
 * I gettoni si accumulano su questo dispositivo (localStorage). Nessun premio è annunciato:
 * al superamento della soglia si apre la richiesta di verifica su WhatsApp, che va confermata
 * dall'operatore. Nessuno sconto, omaggio o percentuale inventati.
 */

const CHIAVE_GETTONI = "tbh-gettoni";
export const SOGLIA_VERIFICA = 100;

function leggiGettoni() {
  try {
    const v = Number(localStorage.getItem(CHIAVE_GETTONI));
    return Number.isFinite(v) && v > 0 ? Math.floor(v) : 0;
  } catch {
    return 0;
  }
}

export function useGettoni() {
  const [gettoni, setGettoni] = useState(0);

  useEffect(() => {
    setGettoni(leggiGettoni());
  }, []);

  const aggiungi = useCallback((n: number) => {
    setGettoni((g) => {
      const nuovo = g + n;
      try {
        localStorage.setItem(CHIAVE_GETTONI, String(nuovo));
      } catch {
        /* niente: i gettoni valgono per la sessione corrente */
      }
      return nuovo;
    });
  }, []);

  const azzera = useCallback(() => {
    setGettoni(0);
    try {
      localStorage.removeItem(CHIAVE_GETTONI);
    } catch {
      /* nessuna azione */
    }
  }, []);

  return { gettoni, aggiungi, azzera };
}

/** Portafoglio gettoni + richiesta di verifica premio oltre la soglia. */
export function PortafoglioGettoni({ gettoni, azzera }: { gettoni: number; azzera: () => void }) {
  const raggiunta = gettoni >= SOGLIA_VERIFICA;
  return (
    <section className="tbh-card p-5 md:p-6">
      <div className="flex flex-wrap items-center gap-4">
        <span className="grid h-14 w-14 place-items-center rounded-full border-2 border-[var(--tbh-neon)] text-[var(--tbh-neon)]">
          <Coins size={26} />
        </span>
        <div className="grow">
          <p className="text-[11px] uppercase tracking-[0.25em] text-[var(--tbh-gold)]">
            I tuoi gettoni su questo dispositivo
          </p>
          <p className="tbh-display text-4xl text-[var(--tbh-neon)]">{gettoni}</p>
          <p className="mt-1 text-xs text-[var(--tbh-muted)]">
            Soglia per chiedere la verifica: {SOGLIA_VERIFICA} gettoni. Il valore del bonus lo conferma
            l'operatore: qui non annunciamo sconti o omaggi non ancora approvati.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {raggiunta ? (
            <a
              href={waInfo(`Verifica bonus giochi TBH — ${gettoni} gettoni accumulati`)}
              target="_blank"
              rel="noreferrer"
              className="tbh-neon-btn inline-flex items-center gap-2 px-5 py-3"
            >
              <Trophy size={17} /> Chiedi la verifica del bonus
            </a>
          ) : (
            <span className="rounded-full border border-[var(--tbh-line)] px-4 py-2 text-xs font-bold uppercase tracking-wide text-[var(--tbh-muted)]">
              Mancano {SOGLIA_VERIFICA - gettoni} gettoni
            </span>
          )}
          {gettoni > 0 && (
            <button
              type="button"
              onClick={azzera}
              className="inline-flex items-center gap-1.5 rounded-full border border-[var(--tbh-line)] px-4 py-2 text-[11px] font-bold uppercase tracking-wide hover:border-[#ff2b2b] hover:text-[#ff2b2b]"
            >
              <RotateCcw size={13} /> Azzera
            </button>
          )}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────── MEMORY DEI MONDI TBH ─────────────────────────── */

const MONDI = [
  { nome: "TBH", colore: "#d7ff00" },
  { nome: "DM", colore: "#ff2b2b" },
  { nome: "SHOP", colore: "#ff8a00" },
  { nome: "SPORT", colore: "#2f7bff" },
  { nome: "MUSICA", colore: "#b46bff" },
  { nome: "EVENTI", colore: "#ff5bb0" },
];

type Carta = { id: number; nome: string; colore: string };

function mescola<T>(v: T[]): T[] {
  const a = [...v];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}

function nuovoMazzo(): Carta[] {
  return mescola([...MONDI, ...MONDI].map((m, i) => ({ id: i, nome: m.nome, colore: m.colore })));
}

export function Memory({ onVinto }: { onVinto: (gettoni: number) => void }) {
  const [mazzo, setMazzo] = useState<Carta[]>(nuovoMazzo);
  const [aperte, setAperte] = useState<number[]>([]);
  const [trovate, setTrovate] = useState<string[]>([]);
  const [mosse, setMosse] = useState(0);
  const [chiuso, setChiuso] = useState(false);

  const finito = trovate.length === MONDI.length;

  useEffect(() => {
    if (finito && !chiuso) {
      setChiuso(true);
      onVinto(20);
    }
  }, [finito, chiuso, onVinto]);

  useEffect(() => {
    if (aperte.length !== 2) return;
    const [a, b] = aperte as [number, number];
    const ca = mazzo[a]!;
    const cb = mazzo[b]!;
    const t = setTimeout(() => {
      if (ca.nome === cb.nome) setTrovate((v) => [...v, ca.nome]);
      setAperte([]);
    }, 650);
    return () => clearTimeout(t);
  }, [aperte, mazzo]);

  function gira(i: number) {
    const c = mazzo[i]!;
    if (aperte.length === 2 || aperte.includes(i) || trovate.includes(c.nome)) return;
    setAperte((v) => [...v, i]);
    if (aperte.length === 1) setMosse((m) => m + 1);
  }

  function ricomincia() {
    setMazzo(nuovoMazzo());
    setAperte([]);
    setTrovate([]);
    setMosse(0);
    setChiuso(false);
  }

  return (
    <article className="tbh-card flex flex-col p-5 md:p-6">
      <header className="mb-4">
        <h3 className="tbh-display text-2xl">Memory dei mondi TBH</h3>
        <p className="mt-1 text-xs text-[var(--tbh-muted)]">
          Sei coppie da abbinare. Completandolo prendi 20 gettoni. Tentativi: {mosse}
        </p>
      </header>

      <div className="grid grid-cols-4 gap-2 sm:gap-3">
        {mazzo.map((c, i) => {
          const scoperta = aperte.includes(i) || trovate.includes(c.nome);
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => gira(i)}
              aria-label={scoperta ? `Carta ${c.nome}` : "Carta coperta"}
              className="aspect-square rounded-xl border text-[10px] font-bold uppercase leading-tight tracking-wide transition sm:text-xs"
              style={
                scoperta
                  ? { background: c.colore, color: "#0a0a0a", borderColor: c.colore }
                  : { background: "rgba(255,255,255,0.05)", borderColor: "var(--tbh-line)", color: "var(--tbh-muted)" }
              }
            >
              {scoperta ? c.nome : "TBH"}
            </button>
          );
        })}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        {finito && (
          <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-[var(--tbh-neon)]">
            <Check size={14} /> Completato in {mosse} tentativi · +20 gettoni
          </span>
        )}
        <button
          type="button"
          onClick={ricomincia}
          className="inline-flex items-center gap-1.5 rounded-full border border-[var(--tbh-line)] px-4 py-2 text-[11px] font-bold uppercase tracking-wide hover:border-[var(--tbh-neon)]"
        >
          <RotateCcw size={13} /> Nuova partita
        </button>
      </div>
    </article>
  );
}

/* ─────────────────────────────── SUDOKU 4x4 ─────────────────────────────── */

/** Griglia 4x4 valida generata a partire da uno schema base, con righe/colonne permutate. */
function generaSudoku(): number[] {
  const base = [
    [1, 2, 3, 4],
    [3, 4, 1, 2],
    [2, 1, 4, 3],
    [4, 3, 2, 1],
  ];
  const cifre = mescola([1, 2, 3, 4]);
  const righe = [...mescola([0, 1]), ...mescola([2, 3])];
  const colonne = [...mescola([0, 1]), ...mescola([2, 3])];
  const out: number[] = [];
  for (const r of righe) for (const c of colonne) out.push(cifre[base[r]![c]! - 1]!);
  return out;
}

export function Sudoku({ onVinto }: { onVinto: (gettoni: number) => void }) {
  const [soluzione, setSoluzione] = useState<number[]>(generaSudoku);
  const [vuote, setVuote] = useState<number[]>(() => mescola([...Array(16).keys()]).slice(0, 7));
  const [valori, setValori] = useState<Record<number, number>>({});
  const [esito, setEsito] = useState<"ok" | "no" | null>(null);
  const [preso, setPreso] = useState(false);

  function cicla(i: number) {
    setEsito(null);
    setValori((v) => {
      const attuale = v[i] ?? 0;
      const nuovo = attuale >= 4 ? 0 : attuale + 1;
      const copia = { ...v };
      if (nuovo === 0) delete copia[i];
      else copia[i] = nuovo;
      return copia;
    });
  }

  function verifica() {
    const completo = vuote.every((i) => valori[i]);
    if (!completo) {
      setEsito("no");
      return;
    }
    const giusto = vuote.every((i) => valori[i] === soluzione[i]);
    setEsito(giusto ? "ok" : "no");
    if (giusto && !preso) {
      setPreso(true);
      onVinto(15);
    }
  }

  function ricomincia() {
    setSoluzione(generaSudoku());
    setVuote(mescola([...Array(16).keys()]).slice(0, 7));
    setValori({});
    setEsito(null);
    setPreso(false);
  }

  return (
    <article className="tbh-card flex flex-col p-5 md:p-6">
      <header className="mb-4">
        <h3 className="tbh-display text-2xl">Sudoku 4x4</h3>
        <p className="mt-1 text-xs text-[var(--tbh-muted)]">
          Numeri da 1 a 4: uno per riga, per colonna e per quadrato. Tocca la casella per cambiare
          numero. Risolto: 15 gettoni.
        </p>
      </header>

      <div className="mx-auto grid w-full max-w-[320px] grid-cols-4 gap-1.5">
        {Array.from({ length: 16 }).map((_, i) => {
          const libera = vuote.includes(i);
          const valore = libera ? (valori[i] ?? 0) : soluzione[i]!;
          const bordoBlocco =
            (i % 4 === 1 ? "border-r-2 " : "") + (Math.floor(i / 4) === 1 ? "border-b-2 " : "");
          return libera ? (
            <button
              key={i}
              type="button"
              onClick={() => cicla(i)}
              aria-label={`Casella ${i + 1}`}
              className={`${bordoBlocco}aspect-square rounded-lg border border-[var(--tbh-neon)] bg-black/60 text-lg font-bold text-[var(--tbh-neon)] tbh-display`}
            >
              {valore || "·"}
            </button>
          ) : (
            <span
              key={i}
              className={`${bordoBlocco}tbh-display grid aspect-square place-items-center rounded-lg border border-[var(--tbh-line)] bg-white/5 text-lg font-bold`}
            >
              {valore}
            </span>
          );
        })}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button type="button" onClick={verifica} className="tbh-neon-btn px-5 py-2.5 text-sm">
          Verifica
        </button>
        <button
          type="button"
          onClick={ricomincia}
          className="inline-flex items-center gap-1.5 rounded-full border border-[var(--tbh-line)] px-4 py-2 text-[11px] font-bold uppercase tracking-wide hover:border-[var(--tbh-neon)]"
        >
          <RotateCcw size={13} /> Nuova griglia
        </button>
        {esito === "ok" && (
          <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-[var(--tbh-neon)]">
            <Check size={14} /> Risolto · +15 gettoni
          </span>
        )}
        {esito === "no" && (
          <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-[#ff5b5b]">
            <X size={14} /> Non torna: controlla righe, colonne e quadrati
          </span>
        )}
      </div>
    </article>
  );
}

/* ──────────────────────────────── QUIZ TBH ──────────────────────────────── */

/**
 * Domande costruite SOLO su dati già pubblicati e verificati del gruppo.
 * Nessuna domanda su fatti non confermati (numeri di iscritti, risultati sportivi, premi).
 */
const DOMANDE = [
  {
    d: "Come si chiama il centro commerciale digitale del gruppo?",
    r: ["Touch Plaza Shop", "Touch Market", "Touch Mall", "Touch Store Italia"],
    giusta: 0,
  },
  {
    d: "Qual è il claim ufficiale di Touch Business Holding?",
    r: [
      "United by passion, driven by values",
      "Always on, always Touch",
      "Il gruppo che ti tocca",
      "Passion first, business later",
    ],
    giusta: 0,
  },
  {
    d: "Quanto costa un corso professionale completo TBH, esame escluso?",
    r: ["610 €", "915 €", "72 €", "1.525 €"],
    giusta: 0,
  },
  {
    d: "Quanto costa a parte l'esame del corso?",
    r: ["72 €", "30 €", "122 €", "610 €"],
    giusta: 0,
  },
  {
    d: "Come si chiama il magazine ufficiale del gruppo?",
    r: [
      "Touch Influencity Magazine",
      "Touch Spotlight Magazine",
      "TBH Weekly",
      "Touch Plaza Magazine",
    ],
    giusta: 0,
  },
  {
    d: "Touch Spotlight che cos'è?",
    r: [
      "Una rubrica dentro Touch Influencity Magazine",
      "Una rivista separata del gruppo",
      "Un canale TV",
      "Un negozio del Touch Plaza",
    ],
    giusta: 0,
  },
  {
    d: "Quanto costa il KIT AGGREGAZIONE BUSINESS a listino?",
    r: ["1.525,00 €", "915,00 €", "610,00 €", "2.500,00 €"],
    giusta: 0,
  },
  {
    d: "DM Comunicazioni che rapporto ha con TBH?",
    r: [
      "È un media partner autonomo",
      "È una società del gruppo TBH",
      "È il negozio online del gruppo",
      "È una squadra di calcio partner",
    ],
    giusta: 0,
  },
  {
    d: "Come si chiama il deejay e producer del gruppo?",
    r: ["J.C. Hugò", "DJ Touch", "Hugo Plaza", "DJ Metropolitan"],
    giusta: 0,
  },
  {
    d: "Come si chiama il sistema di pagamento del gruppo?",
    r: ["Touch Pay", "Touch Cash", "Plaza Pay", "TBH Wallet"],
    giusta: 0,
  },
];

/** Estrae 5 domande a caso e mescola le risposte di ognuna. */
function nuovoGiroQuiz() {
  const lista = mescola([...DOMANDE.keys()]).slice(0, 5);
  return { lista, mischiate: lista.map((i) => mescola([...DOMANDE[i]!.r.keys()])) };
}

export function Quiz({ onVinto }: { onVinto: (gettoni: number) => void }) {
  const [giro, setGiro] = useState(() => nuovoGiroQuiz());
  const [indice, setIndice] = useState(0);
  const [punti, setPunti] = useState(0);
  const [scelta, setScelta] = useState<number | null>(null);

  const { lista, mischiate } = giro;

  function ricomincia() {
    setGiro(nuovoGiroQuiz());
    setIndice(0);
    setPunti(0);
    setScelta(null);
  }

  const finito = indice >= lista.length;
  const corrente = finito ? null : DOMANDE[lista[indice]!]!;
  const permutazione = mischiate[indice] ?? [];

  function rispondi(posizione: number) {
    if (scelta !== null || !corrente) return;
    setScelta(posizione);
    const rispostaOriginale = permutazione[posizione]!;
    const esatta = rispostaOriginale === corrente.giusta;
    if (esatta) setPunti((p) => p + 1);
    setTimeout(() => {
      setScelta(null);
      setIndice((i) => {
        const prossimo = i + 1;
        if (prossimo >= lista.length) {
          const totale = punti + (esatta ? 1 : 0);
          if (totale >= 4) onVinto(25);
          else if (totale >= 3) onVinto(10);
        }
        return prossimo;
      });
    }, 900);
  }

  return (
    <article className="tbh-card flex flex-col p-5 md:p-6">
      <header className="mb-4">
        <h3 className="tbh-display flex items-center gap-2 text-2xl">
          <Brain size={22} className="text-[var(--tbh-neon)]" /> Quiz TBH
        </h3>
        <p className="mt-1 text-xs text-[var(--tbh-muted)]">
          Cinque domande sul gruppo, solo su dati pubblicati sul sito. 4 risposte giuste su 5: 25
          gettoni; 3 su 5: 10 gettoni.
        </p>
      </header>

      {finito ? (
        <div className="flex flex-col items-start gap-3">
          <p className="tbh-display text-3xl text-[var(--tbh-neon)]">
            {punti} / {lista.length}
          </p>
          <p className="text-sm text-[var(--tbh-muted)]">
            {punti >= 4
              ? "Conosci il gruppo: 25 gettoni accreditati."
              : punti >= 3
                ? "Ci siamo quasi: 10 gettoni accreditati."
                : "Nessun gettone questa volta: riprova, le domande cambiano."}
          </p>
          <button
            type="button"
            onClick={ricomincia}
            className="tbh-neon-btn px-5 py-2.5 text-sm"
          >
            Nuove domande
          </button>
        </div>
      ) : (
        <>
          <p className="text-xs font-bold uppercase tracking-wide text-[var(--tbh-gold)]">
            Domanda {indice + 1} di {lista.length}
          </p>
          <p className="tbh-body mt-2 text-base font-semibold">{corrente!.d}</p>
          <div className="mt-4 grid gap-2">
            {permutazione.map((originale, posizione) => {
              const scelto = scelta === posizione;
              const esatta = originale === corrente!.giusta;
              const mostra = scelta !== null && (scelto || esatta);
              return (
                <button
                  key={originale}
                  type="button"
                  onClick={() => rispondi(posizione)}
                  className={`rounded-xl border px-4 py-3 text-left text-sm font-semibold transition ${
                    mostra
                      ? esatta
                        ? "border-[var(--tbh-neon)] bg-[var(--tbh-neon)]/15 text-[var(--tbh-neon)]"
                        : "border-[#ff5b5b] bg-[#ff5b5b]/10 text-[#ff5b5b]"
                      : "border-[var(--tbh-line)] hover:border-[var(--tbh-neon)]"
                  }`}
                >
                  {corrente!.r[originale]}
                </button>
              );
            })}
          </div>
        </>
      )}
    </article>
  );
}

/** Blocco pronto: i tre giochi + portafoglio gettoni. */
export function GiochiGiocabili() {
  const { gettoni, aggiungi, azzera } = useGettoni();
  return (
    <div className="flex flex-col gap-6">
      <PortafoglioGettoni gettoni={gettoni} azzera={azzera} />
      <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
        <Memory onVinto={aggiungi} />
        <Sudoku onVinto={aggiungi} />
        <Quiz onVinto={aggiungi} />
      </div>
      <p className="text-[11px] text-[var(--tbh-muted)]">
        I gettoni sono contati su questo dispositivo. Non sono ancora un credito ufficiale: il valore
        del bonus, le soglie definitive e il regolamento vanno approvati prima della pubblicazione.
        Al superamento della soglia si apre la richiesta di verifica su WhatsApp.
        <a
          href={waInfo("Regolamento e bonus dei giochi TBH")}
          target="_blank"
          rel="noreferrer"
          className="ml-1 inline-flex items-center gap-1 font-bold text-[var(--tbh-neon)]"
        >
          <MessageCircle size={12} /> Chiedi il regolamento
        </a>
      </p>
    </div>
  );
}
