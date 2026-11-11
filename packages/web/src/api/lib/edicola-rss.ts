/* ────────────────────────────────────────────────────────────────────────────
   EDICOLA — LETTURA DEI FEED REALI.

   Regola dell'Edicola: NIENTE viene inventato. Qui si legge SOLO quello che la
   fonte ufficiale pubblica nel suo feed (titolo, collegamento, data, immagine,
   abstract breve) e si scrive nel registro. L'articolo integrale non viene mai
   copiato: della fonte si tiene l'abstract che la fonte stessa espone e il
   collegamento originale, perché chi legge finisca sul sito che l'ha scritto.

   Se un feed non risponde, non si inventa un contenuto di riserva: la fonte
   resta segnata come «non raggiungibile» e la sua riga in Edicola dice
   «IN VERIFICA». Meglio una fascia vuota che una notizia finta.
   ──────────────────────────────────────────────────────────────────────────── */

export type ItemFeed = {
  titolo: string;
  link: string;
  abstract: string;
  immagine: string | null;
  dataPubblicazione: Date | null;
};

const TAG = /<[^>]+>/g;

const ENTITA: Record<string, string> = {
  "&amp;": "&",
  "&lt;": "<",
  "&gt;": ">",
  "&quot;": '"',
  "&apos;": "'",
  "&#39;": "'",
  "&nbsp;": " ",
  "&laquo;": "«",
  "&raquo;": "»",
  "&egrave;": "è",
  "&eacute;": "é",
  "&agrave;": "à",
  "&ograve;": "ò",
  "&igrave;": "ì",
  "&ugrave;": "ù",
  "&rsquo;": "'",
  "&lsquo;": "'",
  "&ldquo;": "“",
  "&rdquo;": "”",
  "&hellip;": "…",
  "&mdash;": "—",
  "&ndash;": "–",
  "&euro;": "€",
};

/** Ripulisce un testo di feed: via i tag, via le entità, spazi normali. */
export function testoPulito(grezzo: string | null | undefined): string {
  if (!grezzo) return "";
  let t = String(grezzo);
  t = t.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1");
  t = t.replace(/<br\s*\/?>/gi, " ");
  t = t.replace(TAG, " ");
  for (const [k, v] of Object.entries(ENTITA)) t = t.split(k).join(v);
  t = t.replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)));
  t = t.replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCharCode(parseInt(n, 16)));
  return t.replace(/\s+/g, " ").trim();
}

/** Taglia l'abstract a un massimo di caratteri senza spezzare le parole. */
export function abstractCorto(testo: string, massimo = 220): string {
  const t = testoPulito(testo);
  if (t.length <= massimo) return t;
  const tagliato = t.slice(0, massimo);
  const spazio = tagliato.lastIndexOf(" ");
  return `${(spazio > 60 ? tagliato.slice(0, spazio) : tagliato).trim()}…`;
}

function primoTag(blocco: string, nomi: string[]): string | null {
  for (const nome of nomi) {
    const re = new RegExp(`<${nome}(?:\\s[^>]*)?>([\\s\\S]*?)</${nome}>`, "i");
    const m = blocco.match(re);
    if (m) return m[1] ?? null;
  }
  return null;
}

function attributo(blocco: string, tag: string, attr: string): string | null {
  const re = new RegExp(`<${tag}\\b[^>]*\\b${attr}=["']([^"']+)["'][^>]*>`, "i");
  const m = blocco.match(re);
  return m?.[1] ?? null;
}

/** Cerca l'immagine dell'item nei punti dove i feed italiani la mettono davvero. */
function immagineDi(blocco: string): string | null {
  const candidati = [
    attributo(blocco, "media:content", "url"),
    attributo(blocco, "media:thumbnail", "url"),
    attributo(blocco, "enclosure", "url"),
    attributo(blocco, "itunes:image", "href"),
    testoPulito(primoTag(blocco, ["image", "img"])) || null,
  ];
  for (const c of candidati) {
    if (c && /^https?:\/\//i.test(c) && /\.(jpe?g|png|webp|avif|gif)(\?|$)/i.test(c)) return c;
  }
  /* Ultima spiaggia: la prima <img> dentro la descrizione. */
  const dentro = blocco.match(/<img[^>]+src=["']([^"']+)["']/i);
  if (dentro?.[1] && /^https?:\/\//i.test(dentro[1])) return dentro[1];
  return null;
}

function dataDi(blocco: string): Date | null {
  const grezza = testoPulito(
    primoTag(blocco, ["pubDate", "published", "updated", "dc:date", "lastBuildDate"]),
  );
  if (!grezza) return null;
  const d = new Date(grezza);
  return Number.isNaN(d.getTime()) ? null : d;
}

function linkDi(blocco: string): string {
  const diretto = testoPulito(primoTag(blocco, ["link"]));
  if (diretto && /^https?:\/\//i.test(diretto)) return diretto;
  const href = attributo(blocco, "link", "href");
  if (href && /^https?:\/\//i.test(href)) return href;
  const guid = testoPulito(primoTag(blocco, ["guid", "id"]));
  return guid && /^https?:\/\//i.test(guid) ? guid : "";
}

/** Spezza un feed RSS o Atom nei suoi item. */
export function leggiFeed(xml: string, massimo = 20): ItemFeed[] {
  const blocchi = [
    ...xml.matchAll(/<item(?:\s[^>]*)?>([\s\S]*?)<\/item>/gi),
    ...xml.matchAll(/<entry(?:\s[^>]*)?>([\s\S]*?)<\/entry>/gi),
  ].map((m) => m[1] ?? "");

  const fuori: ItemFeed[] = [];
  for (const blocco of blocchi) {
    const titolo = testoPulito(primoTag(blocco, ["title"]));
    const link = linkDi(blocco);
    if (!titolo || !link) continue;
    fuori.push({
      titolo,
      link,
      abstract: abstractCorto(
        primoTag(blocco, ["description", "summary", "content:encoded", "content"]) ?? "",
      ),
      immagine: immagineDi(blocco),
      dataPubblicazione: dataDi(blocco),
    });
    if (fuori.length >= massimo) break;
  }
  return fuori;
}

export type EsitoFeed =
  | { ok: true; items: ItemFeed[]; messaggio: string }
  | { ok: false; items: []; messaggio: string };

/** Scarica e legge un feed. Nessuna eccezione verso l'alto: l'esito è un dato. */
export async function scaricaFeed(feedUrl: string, timeoutMs = 15_000): Promise<EsitoFeed> {
  const stop = AbortSignal.timeout(timeoutMs);
  try {
    const risposta = await fetch(feedUrl, {
      signal: stop,
      redirect: "follow",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36",
        Accept: "application/rss+xml, application/atom+xml, application/xml, text/xml, */*",
      },
    });
    if (!risposta.ok) {
      return { ok: false, items: [], messaggio: `HTTP ${risposta.status}` };
    }
    const xml = await risposta.text();
    const items = leggiFeed(xml);
    if (items.length === 0) {
      return { ok: false, items: [], messaggio: "feed raggiunto ma senza item leggibili" };
    }
    return { ok: true, items, messaggio: `${items.length} item letti` };
  } catch (errore) {
    const messaggio = errore instanceof Error ? errore.message : "errore di rete";
    return { ok: false, items: [], messaggio };
  }
}

/* ── Identità di un contenuto: serve a non pubblicare due volte la stessa cosa ── */

/** Normalizza un indirizzo: via i parametri di tracciamento, via lo slash finale. */
export function urlNormalizzato(url: string): string {
  try {
    const u = new URL(url);
    u.hash = "";
    const sporchi = [...u.searchParams.keys()].filter(
      (k) => /^utm_/i.test(k) || ["fbclid", "gclid", "ref", "refresh_ce"].includes(k.toLowerCase()),
    );
    for (const k of sporchi) u.searchParams.delete(k);
    const percorso = u.pathname.replace(/\/+$/, "");
    return `${u.hostname.replace(/^www\./, "")}${percorso}${u.search}`.toLowerCase();
  } catch {
    return url.trim().toLowerCase();
  }
}

/** Impronta del titolo: minuscolo, senza punteggiatura, senza parole vuote corte. */
export function titoloNormalizzato(titolo: string): string {
  return testoPulito(titolo)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9 ]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Chiave di deduplica: prima l'indirizzo, in mancanza il titolo. */
export function chiaveDedup(originalUrl: string | null | undefined, titolo: string): string {
  if (originalUrl && /^https?:\/\//i.test(originalUrl)) return `u:${urlNormalizzato(originalUrl)}`;
  return `t:${titoloNormalizzato(titolo)}`;
}

/** Indirizzo interno leggibile, unico: un contenuto, una pagina canonica. */
export function slugContenuto(titolo: string, chiave: string): string {
  const base = titoloNormalizzato(titolo).split(" ").slice(0, 10).join("-").slice(0, 80);
  let somma = 0;
  for (let i = 0; i < chiave.length; i += 1) somma = (somma * 31 + chiave.charCodeAt(i)) % 1_000_000;
  const coda = somma.toString(36);
  return `${base || "contenuto"}-${coda}`;
}
