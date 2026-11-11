/* ────────────────────────────────────────────────────────────────────────────
   SCHERMI DEL PALINSESTO VISUALE — 08/09/2026.

   Questo file NON crea contenuti nuovi e non crea pagine nuove: prende quello che
   il sito ha già (i 24 canali di lib/palinsesto.ts e le anteprime reali di
   lib/anteprime-reali.ts) e lo traduce in SCHERMI 16:9 da mettere nei rulli.

   Punto 7 della specifica di Claudio, che qui è la regola portante:
     «L'anteprima può comparire in più rulli, ma il contenuto originale deve
      esistere una sola volta. Tutti gli APRI SCHEDA devono puntare alla stessa
      pagina canonica.»
   Per questo l'`id` dello schermo È l'URL canonico: lo stesso contenuto mostrato
   in tre rulli resta un solo indirizzo, non tre pagine.

   Le anteprime si abbinano per DESTINAZIONE: se esiste un marchio reale che punta
   a quella pagina, lo schermo lo mostra. Dove non c'è, lo schermo dichiara
   «Anteprima in allestimento» — non si inventa un'immagine (domanda 126 aperta).
   ──────────────────────────────────────────────────────────────────────────── */

import {
  CANALI,
  canaliInVetrina,
  canaliOrdinati,
  type Canale,
  type ContenutoCanale,
} from "./palinsesto";
import { ANTEPRIME_BRAND, ANTEPRIME_STEMMI, LOGO_CANALE } from "./anteprime-reali";
import type { AzioneSchermo, Schermo } from "../components/schermo-tbh";

/** Marchio reale disponibile per una destinazione interna. */
const LOGO_PER_DESTINAZIONE: Record<string, string> = (() => {
  const m: Record<string, string> = {};
  for (const a of [...ANTEPRIME_BRAND, ...ANTEPRIME_STEMMI]) {
    if (!m[a.to]) m[a.to] = a.src;
  }
  return m;
})();

/** Il logo del canale ha la precedenza sul marchio generico della destinazione. */
function logoDi(url: string, numeroCanale?: number): string | null {
  if (numeroCanale !== undefined && LOGO_CANALE[numeroCanale]) return LOGO_CANALE[numeroCanale];
  return LOGO_PER_DESTINAZIONE[url] ?? null;
}

/**
 * Le azioni di un contenuto. Oggi la programmazione dei canali ha solo pagine
 * interne, quindi l'azione è APRI SCHEDA: le altre (GUARDA, ASCOLTA, MAPPA...)
 * compaiono appena il contenuto porta con sé quel dato, non prima.
 */
function azioniDi(url: string): AzioneSchermo[] {
  return [{ tipo: "scheda", to: url }];
}

/** Un canale diventa uno schermo del rullo «PAGINE / CANALI». */
export function schermoDaCanale(c: Canale): Schermo {
  return {
    id: c.url,
    // Niente «Canale N»: il numero è un codice interno e non si stampa (28/09/2026).
    categoria: c.categoria,
    titolo: c.nome,
    sottotitolo: c.funzione,
    logo: logoDi(c.url, c.numero),
    numero: c.numero,
    colore: c.colore,
    azioni: azioniDi(c.url),
  };
}

/** Una voce di programmazione diventa uno schermo. */
export function schermoDaContenuto(
  p: ContenutoCanale,
  colore: string,
  numero?: number,
): Schermo {
  return {
    id: p.url,
    categoria: p.etichetta,
    titolo: p.titolo,
    sottotitolo: p.descrizione,
    logo: logoDi(p.url),
    numero: numero ?? null,
    colore,
    azioni: azioniDi(p.url),
  };
}

/** Toglie i doppioni tenendo la prima occorrenza: un contenuto, un solo schermo. */
function unici(schermi: Schermo[]): Schermo[] {
  const visti = new Set<string>();
  return schermi.filter((s) => (visti.has(s.id) ? false : (visti.add(s.id), true)));
}

/**
 * Tutti gli schermi della programmazione dei canali indicati.
 *
 * Ordine di Claudio del 30/09/2026 («bisogna eliminare i doppioni perché non
 * aprono pagine o schede se non un loop nella homepage»): la card del CANALE non
 * viene più ripetuta dentro il rullo tematico. Il canale sta nel rullo indice
 * «I CANALI TBH» e nel pulsante TUTTI del rullo: due volte bastano, non sette.
 */
function programmazioneDi(numeri: number[]): Schermo[] {
  const out: Schermo[] = [];
  for (const n of numeri) {
    const c = CANALI.find((x) => x.numero === n);
    if (!c) continue;
    for (const p of c.programmazione) out.push(schermoDaContenuto(p, c.colore, c.numero));
  }
  return unici(out);
}

export type RulloDefinito = {
  chiave: string;
  titolo: string;
  occhiello: string;
  schermi: Schermo[];
  tutti?: { etichetta: string; to: string } | null;
  /** Vero quando il rullo scorre canali e non contenuti: serve solo alle voci del
   *  lettore di schermo sulle frecce («Canale precedente» invece di «Contenuti
   *  precedenti»), come chiesto da Claudio il 28/09/2026. */
  diCanali?: boolean;
  /** Vero solo per il rullo INDICE dei canali: è l'elenco completo del sito e
   *  non viene sfoltito dall'anti-doppione (30/09/2026). */
  indiceCompleto?: boolean;
};

/**
 * ANTI-DOPPIONE DELLA HOME — 30/09/2026.
 *
 * Prima di oggi lo stesso contenuto poteva comparire in cinque, sette, tredici
 * rulli diversi: scorrendo la Home si rivedevano sempre le stesse card e il sito
 * sembrava girare a vuoto («un loop nella homepage», parole di Claudio).
 * Adesso ogni contenuto ha UN SOLO posto: il primo rullo che lo rivendica se lo
 * tiene, gli altri lo lasciano andare.
 *
 * Resta valido il punto 7 (un contenuto, un solo indirizzo canonico): qui non si
 * cancella nulla dal sito, si smette soltanto di ristamparlo nella stessa pagina.
 *
 * Eccezione: il rullo indice dei canali resta completo — è l'indice del sito, non
 * una vetrina, e deve elencare tutti i canali senza buchi.
 */
function senzaDoppioni(rulli: RulloDefinito[]): RulloDefinito[] {
  const visti = new Set<string>();
  const out: RulloDefinito[] = [];
  for (const r of rulli) {
    if (r.indiceCompleto) {
      for (const s of r.schermi) visti.add(s.id);
      out.push(r);
      continue;
    }
    const schermi = r.schermi.filter((s) =>
      visti.has(s.id) ? false : (visti.add(s.id), true),
    );
    // Un rullo rimasto senza contenuti propri non si stampa vuoto.
    if (schermi.length === 0) continue;
    out.push({ ...r, schermi });
  }
  return out;
}

/**
 * IN EVIDENZA — i monitor grandi della prima serata.
 * Ordine di Claudio del 28/09/2026: la vetrina principale della Home non si
 * decide più a mano con un elenco di codici (prima era `[1, 5, 8, 11]`) e non
 * ospita canali «in allestimento». Prende i primi quattro canali per priorità
 * calcolata, dalla stessa funzione che ordina tutto il resto.
 */
export const IN_EVIDENZA: Schermo[] = unici(
  canaliInVetrina().slice(0, 4).map(schermoDaCanale),
);

/** Gli stemmi delle squadre come schermi, per il rullo sport. */
const SCHERMI_STEMMI: Schermo[] = ANTEPRIME_STEMMI.map((a) => ({
  id: a.to,
  categoria: a.sottotitolo,
  titolo: a.titolo,
  logo: a.src,
  colore: a.colore,
  azioni: azioniDi(a.to),
}));

/**
 * I RULLI DELLA HOME, nell'ordine esatto della specifica (punto 4).
 * Ogni rullo pesca dai canali che lo riguardano: nessun contenuto nuovo.
 */
const RULLI_GREZZI: RulloDefinito[] = [
  {
    chiave: "pagine",
    titolo: "I CANALI TBH",
    occhiello: "L'indice visuale del sito",
    // Ordine editoriale (priorità calcolata + campo `ordine`), senza la regia.
    schermi: unici(canaliOrdinati().map(schermoDaCanale)),
    tutti: { etichetta: "TUTTI I CANALI", to: "/guida" },
    diCanali: true,
    indiceCompleto: true,
  },
  {
    chiave: "novita",
    titolo: "NOVITÀ",
    occhiello: "Quello che si muove adesso",
    schermi: unici(
      CANALI.flatMap((c) =>
        c.programmazione
          .filter(
            (p) =>
              p.stato === "attivo" &&
              (p.inHome ||
                p.esposizione === "evidenza" ||
                p.esposizione === "prioritario" ||
                p.esposizione === "alta-visibilita"),
          )
          .map((p) => schermoDaContenuto(p, c.colore, c.numero)),
      ),
    ),
  },
  {
    chiave: "circuito",
    titolo: "CIRCUITO TBH",
    occhiello: "Rete, territorio, vetrina",
    schermi: programmazioneDi([5, 6, 19]),
    tutti: { etichetta: "IL CIRCUITO", to: "/network/circuito" },
  },
  {
    chiave: "media",
    titolo: "MEDIA",
    occhiello: "TV, radio, magazine, produzioni",
    schermi: programmazioneDi([8, 7, 9]),
    tutti: { etichetta: "TOUCH MEDIA", to: "/media" },
  },
  {
    chiave: "sport",
    titolo: "SPORT / MOTORSPORT",
    occhiello: "Squadre, circuiti, eventi",
    schermi: unici([...programmazioneDi([11, 12]), ...SCHERMI_STEMMI]),
    tutti: { etichetta: "TOUCH SPORTS", to: "/sport" },
  },
  {
    chiave: "business",
    titolo: "BUSINESS / SERVIZI",
    occhiello: "Gruppo, società, servizi, finanza",
    schermi: programmazioneDi([1, 2, 3, 4, 13]),
    tutti: { etichetta: "LE SOCIETÀ", to: "/tbh/societa" },
  },
  {
    chiave: "hospitality",
    titolo: "HOSPITALITY / TURISMO",
    occhiello: "Ospitalità, viaggi, luoghi",
    schermi: programmazioneDi([14]),
    tutti: { etichetta: "TOUCH HOST", to: "/hospitality" },
  },
  {
    chiave: "lavoro",
    titolo: "LAVORO / CASTING",
    occhiello: "Annunci, selezioni, formazione",
    schermi: programmazioneDi([15, 16]),
    tutti: { etichetta: "LAVORO E CASTING", to: "/lavoro-casting" },
  },
  {
    chiave: "eventi",
    titolo: "EVENTI / HUGOLAND",
    occhiello: "Spettacolo, musica, intrattenimento",
    schermi: programmazioneDi([10, 20]),
    tutti: { etichetta: "HUGOLAND", to: "/hugoland" },
  },
  {
    chiave: "shop",
    titolo: "SHOP / OFFERTE / REFERRAL",
    occhiello: "Prodotti, servizi, guadagna con noi",
    schermi: programmazioneDi([18, 21]),
    tutti: { etichetta: "TOUCH SHOP", to: "/shop" },
  },
];

/** I rulli come li vede la Home: passati dall'anti-doppione (30/09/2026). */
export const RULLI_HOME: RulloDefinito[] = senzaDoppioni(RULLI_GREZZI);

/** Quante anteprime reali abbiamo davvero: serve a dirlo in chiaro, non a nasconderlo. */
export function contaAnteprime(rulli: RulloDefinito[]) {
  const tutti = unici(rulli.flatMap((r) => r.schermi));
  const conLogo = tutti.filter((s) => s.logo || s.immagine).length;
  return { totale: tutti.length, conLogo, senza: tutti.length - conLogo };
}
