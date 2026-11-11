/**
 * LIMITE DI DURATA DEL SINGOLO VIDEO (Claudio, 28/10/2026 — vale per TUTTI i canali).
 *
 *  · ogni video può durare al massimo 90 minuti (5400 s); sotto il limite qualunque durata è
 *    accettata, senza slot fissi (16, 22, 30, 45 minuti…);
 *  · la durata si legge dalla fonte quando possibile; se non è leggibile la scrive l'amministratore;
 *  · oltre i 90 minuti il video NON viene tagliato: si avvisa PRIMA che entri nella scaletta e
 *    serve una conferma esplicita; il contenuto resta segnalato «oltre il limite»;
 *  · il limite vale per il singolo video, non per il palinsesto (la somma può arrivare a 24 ore;
 *    se è più corta, il «Ciclo continuo H24» la ripete);
 *  · anteprime e immagini statiche hanno una propria durata in secondi, configurabile a parte.
 */

export const DURATA_MAX_VIDEO_SEC = 5400;
export const DURATA_MAX_PALINSESTO_SEC = 24 * 3600;

/** «1:29:29», «16:31», «2:01» → secondi. */
export function secondiDaTesto(t: string): number | null {
  const p = t.trim().split(":").map((x) => Number(x));
  if (!p.length || p.length > 3 || p.some((n) => !Number.isFinite(n) || n < 0)) return null;
  const s = p.reduce((tot, n) => tot * 60 + n, 0);
  return s > 0 ? Math.round(s) : null;
}

/** 5369 → «1:29:29», 991 → «16:31». */
export function testoDurata(sec: number | null | undefined): string {
  if (!sec || sec <= 0) return "—";
  const s = Math.round(sec);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const r = s % 60;
  return h ? `${h}:${String(m).padStart(2, "0")}:${String(r).padStart(2, "0")}` : `${m}:${String(r).padStart(2, "0")}`;
}

export type ControlloDurata = { esito: "ok" | "oltre" | "mancante"; messaggio: string };

export function controllaDurata(sec: number | null | undefined): ControlloDurata {
  if (!sec || sec <= 0) return { esito: "mancante", messaggio: "Durata non leggibile dalla fonte: inserirla a mano (in secondi o h:mm:ss)." };
  if (sec > DURATA_MAX_VIDEO_SEC)
    return {
      esito: "oltre",
      messaggio: `Durata ${testoDurata(sec)}: supera il limite di 90 minuti per singolo video (${testoDurata(sec - DURATA_MAX_VIDEO_SEC)} oltre). Il video non viene tagliato: serve una conferma esplicita per inserirlo.`,
    };
  return { esito: "ok", messaggio: `Durata ${testoDurata(sec)}: entro il limite di 90 minuti.` };
}

export const oltreLimite = (sec: number | null | undefined) => !!sec && sec > DURATA_MAX_VIDEO_SEC;

/* ── lettura della durata YouTube ─────────────────────────────────────────── */

const UA_BROWSER = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36";

async function testo(url: string, ms = 10000): Promise<{ status: number; html: string } | null> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), ms);
  try {
    const r = await fetch(url, {
      signal: ctrl.signal,
      redirect: "follow",
      headers: { "user-agent": UA_BROWSER, "accept-language": "it-IT,it;q=0.9", cookie: "CONSENT=YES+1; SOCS=CAI" },
    });
    return { status: r.status, html: await r.text() };
  } catch {
    return null;
  } finally {
    clearTimeout(t);
  }
}

export type DatiYouTube = {
  durata: number | null;
  /** «pagina» = pagina pubblica del video; «ricerca» = scheda del video nei risultati di ricerca pubblici. */
  durataDa: "pagina" | "ricerca" | null;
  incorporabile: boolean | null;
  stato: string | null;
  motivo: string | null;
  diretta: boolean;
  /** YouTube ha chiesto al server la verifica anti-robot: incorporabilità e restrizioni non lette. */
  antiRobot: boolean;
};

/** Durata del video dai risultati di ricerca pubblici (solo la scheda con QUEL videoId). */
async function durataDaRicerca(id: string): Promise<number | null> {
  const r = await testo(`https://www.youtube.com/results?search_query=${encodeURIComponent(`"${id}"`)}&hl=it`);
  if (!r || r.status !== 200) return null;
  const i = r.html.indexOf(`"videoRenderer":{"videoId":"${id}"`);
  if (i < 0) return null;
  const resto = r.html.slice(i + 20);
  const fine = resto.indexOf('"videoRenderer":{"videoId":"');
  const scheda = resto.slice(0, fine > 0 ? fine : 12000);
  const m = scheda.match(/"lengthText":\{(?:[^{}]|\{[^{}]*\{[^{}]*\}[^{}]*\})*?"simpleText":"([0-9:]+)"/);
  return m ? secondiDaTesto(m[1]!) : null;
}

/** Pagina pubblica del video (durata, incorporabilità, stato) con ripiego sui risultati di ricerca. */
export async function datiYouTube(id: string): Promise<DatiYouTube> {
  const vuoto: DatiYouTube = { durata: null, durataDa: null, incorporabile: null, stato: null, motivo: null, diretta: false, antiRobot: false };
  const r = await testo(`https://www.youtube.com/watch?v=${id}&hl=it`);
  let d = vuoto;
  if (r && r.status === 200) {
    const h = r.html;
    const durata = Number(h.match(/"lengthSeconds":"(\d+)"/)?.[1] ?? NaN);
    const emb = h.match(/"playableInEmbed":(true|false)/)?.[1];
    const stato = h.match(/"playabilityStatus":\{"status":"([A-Z_]+)"/)?.[1] ?? null;
    const motivo = h.match(/"playabilityStatus":\{"status":"[A-Z_]+","reason":"([^"]{1,200})"/)?.[1] ?? null;
    const antiRobot = stato === "LOGIN_REQUIRED" && /bot|robot|non essere un/i.test(motivo ?? "");
    d = {
      durata: !antiRobot && Number.isFinite(durata) && durata > 0 ? durata : null,
      durataDa: !antiRobot && Number.isFinite(durata) && durata > 0 ? "pagina" : null,
      incorporabile: antiRobot ? null : emb ? emb === "true" : null,
      stato: antiRobot ? null : stato,
      motivo: antiRobot ? null : motivo,
      diretta: !antiRobot && /"isLiveContent":true/.test(h) && /"isLive":true|"isLiveNow":true/.test(h),
      antiRobot,
    };
  }
  if (!d.durata && !d.diretta) {
    const s = await durataDaRicerca(id).catch(() => null);
    if (s) d = { ...d, durata: s, durataDa: "ricerca" };
  }
  return d;
}
