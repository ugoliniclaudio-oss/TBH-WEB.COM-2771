import { get } from "node:https";
import { ANNO_STAGIONE, ROMAGNA_SPORT } from "../data/fonti-calcio-squadre";

/**
 * LETTURA ROMAGNA SPORT — calendario e classifica di un girone (17/10/2026).
 *
 * Due pagine pubbliche per girone, lette lato server e tenute in memoria 30 minuti:
 *   calendario.php?gir=G&anno=2026&id_sport=1      → tutte le giornate, risultati, «N.G.»
 *   tuttocalcio/classifica.php?gir=G&anno=2026     → giornata in corso con data e ORA
 *                                                    di ogni partita + classifica ufficiale
 * Le pagine sono in ISO-8859-1. Nessun numero viene stimato: quello che la pagina
 * non scrive resta null («dato da confermare» nella pagina-canale).
 * Se Romagna Sport non risponde si tiene l'ultima lettura buona, marcata come tale.
 */

export type PartitaCalendario = {
  giornata: number;
  /** Data della giornata come la scrive il calendario (gg/mm/aaaa). */
  dataGiornata: string;
  casaId: number;
  casa: string;
  ospiteId: number;
  ospite: string;
  /** «2 - 1» se giocata, null se «N.G.» (non giocata). */
  risultato: string | null;
};

export type PartitaTurno = {
  casaId: number;
  casa: string;
  ospiteId: number;
  ospite: string;
  /** «18/10/2026 15:30» se ancora da giocare, altrimenti il testo del risultato. */
  quando: string;
  data: string | null;
  ora: string | null;
};

export type RigaClassifica = {
  posizione: number;
  id: number;
  squadra: string;
  punti: number;
  gare: number;
  v: number;
  n: number;
  p: number;
  f: number;
  s: number;
};

export type GironeRomagnaSport = {
  gir: number;
  campionato: string | null;
  giornate: PartitaCalendario[];
  turno: { nome: string | null; partite: PartitaTurno[] };
  classifica: RigaClassifica[];
  aggiornataAlla: string | null;
  lettoIl: string;
  /** true = Romagna Sport non ha risposto, è l'ultima lettura buona. */
  copiaPrecedente: boolean;
  url: { calendario: string; classifica: string };
};

const DURATA_CACHE_MS = 30 * 60 * 1000;
const cache = new Map<number, { at: number; dati: GironeRomagnaSport }>();
const inCorso = new Map<number, Promise<GironeRomagnaSport | null>>();
/* Dopo una lettura fallita si riprova solo dopo 2 minuti: la fonte non va tempestata. */
const ATTESA_DOPO_ERRORE_MS = 2 * 60 * 1000;
const fallito = new Map<number, number>();

export function urlGirone(gir: number) {
  return {
    calendario: `${ROMAGNA_SPORT}/calendario.php?gir=${gir}&anno=${ANNO_STAGIONE}&id_sport=1`,
    classifica: `${ROMAGNA_SPORT}/tuttocalcio/classifica.php?gir=${gir}&anno=${ANNO_STAGIONE}`,
  };
}

export function urlSquadra(idSquadra: number) {
  return `${ROMAGNA_SPORT}/tuttocalcio/squadra.php?id_squadra=${idSquadra}&anno=${ANNO_STAGIONE}`;
}

const ENTITA: Record<string, string> = { amp: "&", quot: '"', apos: "'", lt: "<", gt: ">", nbsp: " " };

function testo(html: string) {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/&(#\d+|#x[0-9a-f]+|\w+);/gi, (m, e: string) => {
      if (e[0] === "#") {
        const n = e[1]?.toLowerCase() === "x" ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10);
        return Number.isFinite(n) ? String.fromCodePoint(n) : m;
      }
      return ENTITA[e.toLowerCase()] ?? m;
    })
    .replace(/\s+/g, " ")
    .trim();
}

/* Si usa node:https e non fetch(): Cloudflare di romagnasport.com risponde 403 al
   fetch di Node (undici, usato dal server di sviluppo Vite), mentre accetta una
   richiesta HTTPS normale. node:https funziona sia in Node sia in Bun. */
function leggi(url: string, salti = 0): Promise<string> {
  return new Promise((ok, ko) => {
    const req = get(
      url,
      { headers: { "User-Agent": "Mozilla/5.0 (TBH-WEB palinsesto canali)", Accept: "text/html" }, timeout: 12_000 },
      (r) => {
        const stato = r.statusCode ?? 0;
        if (stato >= 300 && stato < 400 && r.headers.location && salti < 3) {
          r.resume();
          ok(leggi(new URL(r.headers.location, url).toString(), salti + 1));
          return;
        }
        if (stato !== 200) {
          r.resume();
          ko(new Error(`HTTP ${stato} su ${url}`));
          return;
        }
        const pezzi: Buffer[] = [];
        r.on("data", (c: Buffer) => pezzi.push(c));
        r.on("end", () => ok(Buffer.concat(pezzi).toString("latin1")));
        r.on("error", ko);
      },
    );
    req.on("timeout", () => req.destroy(new Error(`Tempo scaduto su ${url}`)));
    req.on("error", ko);
  });
}

export function analizzaCalendario(html: string): PartitaCalendario[] {
  const out: PartitaCalendario[] = [];
  const re =
    /<b>(\d+)a giornata<\/b>\s*<\/div>\s*<div class="col-7">\s*<b>Data ([\d/]+)<\/b>|id_squadra=(\d+)[^"]*">([^<]*)<\/a>\s*<\/div>\s*<div class="col-5">\s*<a href="[^"]*id_squadra=(\d+)[^"]*">([^<]*)<\/a>\s*<\/div>\s*<div class="col-2">\s*<b>([^<]*)<\/b>/g;
  let giornata = 0;
  let data = "";
  for (const m of html.matchAll(re)) {
    if (m[1]) {
      giornata = Number(m[1]);
      data = m[2]!;
      continue;
    }
    if (!giornata) continue;
    const ris = testo(m[7]!);
    out.push({
      giornata,
      dataGiornata: data,
      casaId: Number(m[3]),
      casa: testo(m[4]!),
      ospiteId: Number(m[5]),
      ospite: testo(m[6]!),
      risultato: /^\d+\s*-\s*\d+$/.test(ris) ? ris.replace(/\s*-\s*/, " - ") : null,
    });
  }
  return out;
}

export function analizzaClassifica(html: string) {
  const nome = html.match(/data-giornate-name>\s*([^<]+?)\s*<\/span>/);
  const partite: PartitaTurno[] = [];
  const s = html.indexOf('id="risultati-giornata"');
  if (s >= 0) {
    const blocco = html.slice(s, html.indexOf("</table>", s));
    for (const m of blocco.matchAll(/<tr class="[^"]*" id="tr_ris_\d+">([\s\S]*?)<\/tr>/g)) {
      const sq = [...m[1]!.matchAll(/id_squadra=(\d+)[^"]*">([^<]*)<\/a>/g)];
      const celle = [...m[1]!.matchAll(/<td[^>]*>([\s\S]*?)<\/td>/g)].map((c) => testo(c[1]!));
      if (sq.length < 2 || celle.length < 3) continue;
      const quando = celle[2]!;
      const dt = quando.match(/^(\d{2}\/\d{2}\/\d{4})(?:\s+(\d{2}:\d{2}))?/);
      partite.push({
        casaId: Number(sq[0]![1]),
        casa: testo(sq[0]![2]!),
        ospiteId: Number(sq[1]![1]),
        ospite: testo(sq[1]![2]!),
        quando,
        data: dt ? dt[1]! : null,
        ora: dt?.[2] ?? null,
      });
    }
  }

  const classifica: RigaClassifica[] = [];
  const reRiga =
    /<span class="pos-squadra">(\d+)<\/span>[\s\S]*?id_squadra=(\d+)[^"]*">([^<]*)<\/a>[\s\S]*?col-punti[^>]*>(-?\d+)<\/td>\s*<td class="col-gare">(\d+)<\/td>\s*<td[^>]*>(\d+)<\/td>\s*<td[^>]*>(\d+)<\/td>\s*<td[^>]*>(\d+)<\/td>\s*<td[^>]*>(\d+)<\/td>\s*<td[^>]*>(\d+)<\/td>/g;
  for (const m of html.matchAll(reRiga)) {
    classifica.push({
      posizione: Number(m[1]),
      id: Number(m[2]),
      squadra: testo(m[3]!),
      punti: Number(m[4]),
      gare: Number(m[5]),
      v: Number(m[6]),
      n: Number(m[7]),
      p: Number(m[8]),
      f: Number(m[9]),
      s: Number(m[10]),
    });
  }

  const agg = html.match(/Aggiornata alla\s+([^<]+?)\s*</);
  const campionato = html.match(/<li class="breadcrumb-item"><a href="[^"]*classifica\.php\?gir=\d+[^"]*"><span>([^<]+)<\/span>/);
  return {
    turno: { nome: nome ? testo(nome[1]!) : null, partite },
    classifica,
    aggiornataAlla: agg ? `Aggiornata alla ${testo(agg[1]!)}` : null,
    campionato: campionato ? testo(campionato[1]!) : null,
  };
}

async function scarica(gir: number): Promise<GironeRomagnaSport> {
  const url = urlGirone(gir);
  const [cal, cla] = await Promise.all([leggi(url.calendario), leggi(url.classifica)]);
  const giornate = analizzaCalendario(cal);
  const c = analizzaClassifica(cla);
  if (!giornate.length && !c.classifica.length) throw new Error("Pagine lette ma senza calendario né classifica.");
  const titoloCal = cal.match(/<li class="breadcrumb-item"><a href="[^"]*classifica\.php\?gir=\d+[^"]*"><span>([^<]+)<\/span>/);
  return {
    gir,
    campionato: c.campionato ?? (titoloCal ? testo(titoloCal[1]!) : null),
    giornate,
    turno: c.turno,
    classifica: c.classifica,
    aggiornataAlla: c.aggiornataAlla,
    lettoIl: new Date().toISOString(),
    copiaPrecedente: false,
    url,
  };
}

/** Girone letto da Romagna Sport (cache 30 min). null = mai letto con successo. */
export async function gironeRomagnaSport(gir: number): Promise<GironeRomagnaSport | null> {
  const c = cache.get(gir);
  if (c && Date.now() - c.at < DURATA_CACHE_MS) return c.dati;
  const gia = inCorso.get(gir);
  if (gia) return gia;
  const errore = fallito.get(gir);
  if (errore && Date.now() - errore < ATTESA_DOPO_ERRORE_MS) return c ? { ...c.dati, copiaPrecedente: true } : null;
  const p = scarica(gir)
    .then((dati) => {
      cache.set(gir, { at: Date.now(), dati });
      fallito.delete(gir);
      return dati;
    })
    .catch((e) => {
      fallito.set(gir, Date.now());
      console.warn(`[romagnasport] girone ${gir}:`, e instanceof Error ? e.message : e);
      return c ? { ...c.dati, copiaPrecedente: true } : null;
    })
    .finally(() => inCorso.delete(gir));
  inCorso.set(gir, p);
  return p;
}
