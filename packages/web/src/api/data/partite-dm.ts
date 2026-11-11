/**
 * PARTITE DM — i record `match_id` del modulo TRE MONITOR
 * (docs/modulo-tre-monitor.md, punto 2), costruiti dai SOLI dati reali di
 * `dm-video.ts`: canale ufficiale «Daniele Manuelli Official», elenco estratto
 * il 29/08/2026.
 *
 * COME NASCE UN `match_id`, e perché non è inventato.
 *   Il titolo pubblicato dal canale dichiara già squadra, avversario e risultato:
 *   «Highlights Promozione.  Verucchio vs Riccione 1-2». Da quella stringa si
 *   leggono tre dati DICHIARATI — le due squadre, chi gioca in casa, il
 *   risultato — e il match_id è la loro composizione:
 *
 *       verucchio__casa__riccione__1-2
 *
 *   Se il titolo non nomina l'avversario, il video NON viene abbinato a nessuna
 *   partita: finisce nei «contenuti della società», dichiarato come tale.
 *   Nessun accostamento a somiglianza.
 *
 * I TRE MONITOR di una partita si riempiono con i video dello stesso match_id:
 *   1. PARTITA INTEGRALE    ← titolo di gara, senza «highlights» né «intervista»
 *   2. HIGHLIGHTS           ← titolo che Daniele Manuelli ha titolato «Highlights»
 *      (a schermo si legge HIGHLIGHTS dal 29/09/2026; il ruolo tecnico interno
 *      resta `sintesi`, perché è quello agganciato alla lettura dei titoli)
 *   3. INTERVISTE FINE GARA ← titolo con «intervista/interviste/postgara»
 *   Monitor senza video → resta «IN PUBBLICAZIONE»: la pagina non si blocca.
 *
 * COME SI UNISCONO INTERVISTE E SINTESI DELLA STESSA PARTITA.
 *   I titoli delle interviste non riportano il risultato («Interviste post
 *   Verucchio vs Riccione»). Si raggruppa quindi per squadra + campo + avversario,
 *   e il risultato lo porta il video che lo dichiara. Quando per lo stesso
 *   accoppiamento esistono DUE risultati diversi (due gare distinte), i video
 *   senza risultato non vengono assegnati a caso: restano dichiarati come
 *   contenuti della società. È il punto in cui serve il calendario ufficiale.
 *
 * PERIODO (i tre filtri fissi del modulo).
 *   La data della gara NON è nei titoli del canale, e continua a non esserci:
 *   `dataConfermata` resta `false` e a schermo si legge «Data ufficiale da
 *   confermare» finché non arriva il calendario ufficiale delle società.
 *
 *   AGGIORNAMENTO DEL 30/09/2026. Con il caricamento delle attività recenti
 *   (dal 10/08/2026) in `dm-video.ts` è entrato un dato nuovo e dichiarato: la
 *   DATA DI PUBBLICAZIONE del video sul canale, presa dai feed ufficiali di
 *   YouTube (campo `pubblicato`) oppure, dove il feed non arriva, come forbice
 *   certa fra due giorni (`pubblicatoDa`/`pubblicatoA`).
 *
 *   La data di pubblicazione NON è la data della gara: Daniele Manuelli pubblica
 *   dopo aver girato, di solito nei giorni successivi. Però basta a dire in
 *   quale periodo sta il contenuto, e solo per quello viene usata qui:
 *
 *     · pubblicato dal 30/08/2026  → ATTUALI (stagione 2026/2027)
 *     · pubblicato nel 2026, prima → RECENTI 2026
 *     · nessuna data sui video     → ARCHIVIO, come prima
 *
 *   Con la forbice il periodo si assegna SOLO se entrambi gli estremi cadono
 *   nella stessa fascia: se la forbice sta a cavallo di una soglia, la partita
 *   resta in ARCHIVIO, perché non si tira a indovinare.
 *
 *   Le date restano leggibili sul record (`pubblicato`, `pubblicatoDa`,
 *   `pubblicatoA`, `fonteData`), così si vede sempre da dove arriva il periodo.
 */

import { DM_VIDEO_SQUADRE, type VideoDm } from "./dm-video";
import {
  leggiTitolo,
  profiloSquadra,
  ruoloDi,
  vocabolarioDa,
  type TitoloLetto,
} from "./partite-dm-lettura";

export type Periodo = "ATTUALI" | "RECENTI 2026" | "ARCHIVIO";

export type RuoloVideo = "integrale" | "sintesi" | "interviste";

export type PartitaDm = {
  /** match_id: un solo record per partita, in tutto il sito. */
  matchId: string;
  slug: string;
  /** Squadra di casa e ospite come dichiarate nel titolo del canale. */
  casa: string;
  ospite: string;
  /** true = la squadra della pagina gioca in casa (dall'ordine del titolo). */
  inCasa: boolean;
  avversario: string;
  /** Risultato così come scritto nel titolo, es. "1-2". null = non dichiarato. */
  risultato: string | null;
  /** Competizione, solo se il titolo la nomina. */
  competizione: string | null;
  periodo: Periodo;
  /** false = data ufficiale della GARA ancora da confermare (vedi nota in testa al file). */
  dataConfermata: boolean;
  /**
   * Data di pubblicazione sul canale del video più recente della partita: è il
   * dato da cui nasce `periodo`. Non è la data della gara. null = non nota.
   */
  pubblicato: string | null;
  /** Forbice certa di pubblicazione, quando il giorno esatto non è nei feed. */
  pubblicatoDa: string | null;
  pubblicatoA: string | null;
  /** Da dove arriva la data: feed ufficiale YouTube o forbice ricostruita. */
  fonteData: "feed-ufficiale" | "forbice-canale" | null;
  integrale: VideoDm | null;
  sintesi: VideoDm | null;
  interviste: VideoDm | null;
  /** Video in più dello stesso match_id (secondo tempo, altre interviste…). */
  altri: VideoDm[];
};

/** Video reale della società che non dichiara una partita: resta dichiarato così. */
export type ContenutoSocieta = VideoDm & {
  ruolo: RuoloVideo;
  /** Perché non è su una partita: serve a Claudio per capire cosa manca. */
  motivo: "nessuna-partita-nel-titolo" | "partita-non-determinabile";
};

export type SportSquadraDm = {
  slug: string;
  nome: string;
  totale: number;
  partite: PartitaDm[];
  contenuti: ContenutoSocieta[];
};

type Grezzo = { video: VideoDm; letto: TitoloLetto; ruolo: RuoloVideo };

/** Inizio della stagione 2026/2027 per i filtri del modulo. */
const INIZIO_ATTUALI = "2026-08-30";
/** Inizio dell'anno da cui parte la fascia RECENTI 2026. */
const INIZIO_RECENTI = "2026-01-01";

/** In quale fascia cade un singolo giorno. null = prima del 2026, cioè archivio. */
function fasciaDi(giorno: string): Periodo {
  if (giorno >= INIZIO_ATTUALI) return "ATTUALI";
  if (giorno >= INIZIO_RECENTI) return "RECENTI 2026";
  return "ARCHIVIO";
}

/**
 * Periodo della partita dalla pubblicazione dei suoi video.
 *
 * Si guarda il video pubblicato più di recente fra quelli della partita: è
 * quello che dice in quale periodo la gara è stata raccontata. Con la forbice
 * il periodo vale solo se i due estremi cadono nella stessa fascia; altrimenti
 * la partita resta dov'era, in ARCHIVIO.
 */
function periodoDaPubblicazione(video: VideoDm[]): Pick<
  PartitaDm,
  "periodo" | "pubblicato" | "pubblicatoDa" | "pubblicatoA" | "fonteData"
> {
  const fermo = {
    periodo: "ARCHIVIO" as Periodo,
    pubblicato: null,
    pubblicatoDa: null,
    pubblicatoA: null,
    fonteData: null,
  };

  /** Il più recente si ordina sulla fine della finestra: giorno esatto o fine forbice. */
  const conData = video.filter((v) => v.pubblicato || v.pubblicatoA);
  if (conData.length === 0) return fermo;

  const fine = (v: VideoDm) => v.pubblicato ?? v.pubblicatoA ?? "";
  const scelto = conData.reduce((a, b) => (fine(b) > fine(a) ? b : a));

  if (scelto.pubblicato) {
    return {
      periodo: fasciaDi(scelto.pubblicato),
      pubblicato: scelto.pubblicato,
      pubblicatoDa: null,
      pubblicatoA: null,
      fonteData: scelto.fonteData ?? "feed-ufficiale",
    };
  }

  const da = scelto.pubblicatoDa;
  const a = scelto.pubblicatoA;
  if (!da || !a) return fermo;

  // Forbice a cavallo di una soglia: il periodo non è certo, quindi non si assegna.
  const periodo = fasciaDi(da) === fasciaDi(a) ? fasciaDi(da) : "ARCHIVIO";
  return {
    periodo,
    pubblicato: null,
    pubblicatoDa: da,
    pubblicatoA: a,
    fonteData: scelto.fonteData ?? "forbice-canale",
  };
}

function nuovaPartita(slug: string, g: Grezzo, risultato: string | null): PartitaDm {
  return {
    matchId: [
      slug,
      g.letto.inCasa ? "casa" : "fuori",
      g.letto.avversarioChiave,
      risultato ?? "nd",
    ].join("__"),
    slug,
    casa: g.letto.casa,
    ospite: g.letto.ospite,
    inCasa: g.letto.inCasa,
    avversario: g.letto.avversario,
    risultato,
    competizione: g.letto.competizione,
    periodo: "ARCHIVIO",
    dataConfermata: false,
    pubblicato: null,
    pubblicatoDa: null,
    pubblicatoA: null,
    fonteData: null,
    integrale: null,
    sintesi: null,
    interviste: null,
    altri: [],
  };
}

function aggiungi(p: PartitaDm, g: Grezzo) {
  if (!p.competizione && g.letto.competizione) p.competizione = g.letto.competizione;
  if (g.ruolo === "sintesi" && !p.sintesi) p.sintesi = g.video;
  else if (g.ruolo === "interviste" && !p.interviste) p.interviste = g.video;
  else if (g.ruolo === "integrale" && !p.integrale) p.integrale = g.video;
  else p.altri.push(g.video);
}

function costruisci(slug: string, nome: string, video: VideoDm[], totale: number): SportSquadraDm {
  const profilo = profiloSquadra(slug, nome);
  const contenuti: ContenutoSocieta[] = [];
  /** Chiave di accoppiamento: squadra + campo + avversario, senza risultato. */
  const gruppi = new Map<string, Grezzo[]>();
  const visti = new Set<string>();

  // PRIMA LETTURA: solo i titoli che dichiarano il risultato, dove il nome
  // dell'avversario è scritto per intero. Da questi nasce il vocabolario con cui
  // si leggono poi i titoli storpiati delle interviste (vedi partite-dm-lettura).
  const nomiCompleti: string[] = [];
  for (const v of video) {
    const primo = leggiTitolo(v.titolo, profilo);
    if (primo?.risultato) nomiCompleti.push(primo.avversarioGrezzo);
  }
  const vocab = vocabolarioDa(nomiCompleti);

  for (const v of video) {
    const impronta = `${v.url}|${v.titolo}`;
    if (visti.has(impronta)) continue;
    visti.add(impronta);

    const letto = leggiTitolo(v.titolo, profilo, vocab);
    const ruolo = ruoloDi(v.titolo);
    if (!letto) {
      contenuti.push({ ...v, ruolo, motivo: "nessuna-partita-nel-titolo" });
      continue;
    }
    const k = `${letto.inCasa ? "casa" : "fuori"}__${letto.avversarioChiave}`;
    const elenco = gruppi.get(k);
    if (elenco) elenco.push({ video: v, letto, ruolo });
    else gruppi.set(k, [{ video: v, letto, ruolo }]);
  }

  const partite: PartitaDm[] = [];

  for (const gruppo of gruppi.values()) {
    const risultati = [...new Set(gruppo.map((g) => g.letto.risultato).filter(Boolean))] as string[];

    if (risultati.length <= 1) {
      // Un solo risultato dichiarato (o nessuno): è una partita sola.
      const risultato = risultati[0] ?? null;
      const p = nuovaPartita(slug, gruppo[0] as Grezzo, risultato);
      for (const g of gruppo) aggiungi(p, g);
      partite.push(p);
      continue;
    }

    // Più risultati diversi per lo stesso accoppiamento = più gare distinte.
    const perRisultato = new Map<string, PartitaDm>();
    for (const g of gruppo) {
      const r = g.letto.risultato;
      if (!r) {
        // Non si può sapere a quale delle gare appartiene: non si tira a indovinare.
        contenuti.push({ ...g.video, ruolo: g.ruolo, motivo: "partita-non-determinabile" });
        continue;
      }
      let p = perRisultato.get(r);
      if (!p) {
        p = nuovaPartita(slug, g, r);
        perRisultato.set(r, p);
        partite.push(p);
      }
      aggiungi(p, g);
    }
  }

  // PERIODO: dalle date di pubblicazione dei video della partita (vedi nota in
  // testa al file). Senza date resta ARCHIVIO, com'era prima del 30/09/2026.
  for (const p of partite) {
    const suoi = [p.integrale, p.sintesi, p.interviste, ...p.altri].filter(
      (v): v is VideoDm => v !== null,
    );
    Object.assign(p, periodoDaPubblicazione(suoi));
  }

  // Ordine: prima le partite con più monitor accesi, poi in ordine di avversario.
  partite.sort((a, b) => {
    const pieni = (p: PartitaDm) =>
      (p.integrale ? 1 : 0) + (p.sintesi ? 1 : 0) + (p.interviste ? 1 : 0);
    const d = pieni(b) - pieni(a);
    return d !== 0 ? d : a.avversario.localeCompare(b.avversario, "it");
  });

  return { slug, nome, totale, partite, contenuti };
}

export const PARTITE_DM: SportSquadraDm[] = DM_VIDEO_SQUADRE.map((s) =>
  costruisci(s.slug, s.nome, [...s.highlights, ...s.servizi, ...s.interviste], s.totale),
);

export function partiteDm(slug: string): SportSquadraDm | null {
  return PARTITE_DM.find((p) => p.slug === slug) ?? null;
}

/** Conteggio per i tre filtri fissi del modulo. */
export function conteggiPeriodo(partite: PartitaDm[]): Record<Periodo, number> {
  return {
    ATTUALI: partite.filter((p) => p.periodo === "ATTUALI").length,
    "RECENTI 2026": partite.filter((p) => p.periodo === "RECENTI 2026").length,
    ARCHIVIO: partite.filter((p) => p.periodo === "ARCHIVIO").length,
  };
}

export const PARTITE_DM_NOTA =
  "Partite ricostruite dai titoli originali del canale Daniele Manuelli Official: squadre, " +
  "campo e risultato sono quelli dichiarati nel titolo. La data della gara non è nei titoli, " +
  "quindi resta da confermare col calendario ufficiale. Il periodo arriva dalla data di " +
  "pubblicazione del video sul canale, presa dai feed ufficiali di YouTube: le partite senza " +
  "nessuna data pubblicata restano in ARCHIVIO.";

/** Dati di controllo per la verifica del modulo. */
export const PARTITE_DM_TOTALE = PARTITE_DM.reduce((n, s) => n + s.partite.length, 0);
export const PARTITE_DM_TRE_MONITOR = PARTITE_DM.reduce(
  (n, s) => n + s.partite.filter((p) => p.integrale && p.sintesi && p.interviste).length,
  0,
);
