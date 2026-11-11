/**
 * ════════════════════════════════════════════════════════════════════════════════
 * CATALOGO MUSICALE — MOTORE SERVER (ordine del 29/09/2026).
 *
 * «Il BRANO è l'elemento principale. Audio, video, copertina, link, versioni,
 *  playlist, videoclip e casting sono contenuti associati allo stesso brano.»
 *
 * Qui dentro c'è l'unico posto in cui il catalogo viene composto:
 *
 *   catalogo storico (40 uscite del canale Touch Music Radio TV)
 *   + brani importati (`brani_master`)
 *   + sorgenti multiple per brano (`brani_sorgenti`)
 *   + produzione videoclip (`brani_video`)
 *   + casting aperti (`castings`)
 *   ────────────────────────────────────────────────────────────────
 *   = un solo elenco di BRANI MASTER, interrogato in modo diverso da ogni pagina.
 *
 * DUE REGOLE CHE NON SI TOCCANO:
 *  · nessun contenuto deve essere un MP4 per poter essere pubblicato: un brano con
 *    una sorgente audio reale è pubblicato, anche se il videoclip non esiste;
 *  · nessun dato inventato. Titoli, artisti, copertine, anni arrivano dalla
 *    piattaforma o dalla direzione. Quando mancano restano vuoti.
 * ════════════════════════════════════════════════════════════════════════════════
 */

import { eq, inArray } from "drizzle-orm";
import { db } from "../database";
import * as schema from "../database/schema";
import {
  ARTISTA_BRANI,
  CATALOGO_BRANI,
  classeBrano,
  type ClasseBrano,
  type FaseProduzione,
  type StatoVideo,
} from "../data/musica";
import {
  chiaveTitolo,
  coverSuno,
  coverYouTube,
  etichettaStato,
  etichettaVideoclip,
  idVideoYouTube,
  indirizzoPlayer,
  nuovoIdBrano,
  riconosci,
  titoloPulito,
  uuidSuno,
  versioneDalTitolo,
  type EtichettaStato,
  type Piattaforma,
  type SorgenteRiconosciuta,
  type TipoSorgente,
} from "../data/sorgenti-musicali";

/* ════════════════════════════════════════════════════════════════════════════════
   1 · LETTURA DEI METADATI DALLA PIATTAFORMA
   ════════════════════════════════════════════════════════════════════════════════ */

const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 " +
  "(KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36";

export type MetadatiSorgente = {
  /** L'indirizzo definitivo dopo i redirect: per Suno diventa `song/<uuid>`. */
  url: string;
  idEsterno: string | null;
  titolo: string | null;
  artista: string | null;
  cover: string | null;
  /** Vero quando la piattaforma ha risposto e i dati sono suoi, non nostri. */
  letti: boolean;
  /** Che cosa è andato storto, da mostrare alla direzione senza nasconderlo. */
  avviso: string | null;
};

function contenuto(html: string, proprieta: string): string | null {
  const re = new RegExp(
    `<meta[^>]+(?:property|name)=["']${proprieta}["'][^>]*content=["']([^"']*)["']`,
    "i",
  );
  const alt = new RegExp(
    `<meta[^>]+content=["']([^"']*)["'][^>]*(?:property|name)=["']${proprieta}["']`,
    "i",
  );
  const m = html.match(re) ?? html.match(alt);
  if (!m) return null;
  const v = sciogliEntita(m[1]).trim();
  return v || null;
}

/**
 * Scioglie le entita HTML di un metadato: le pagine scrivono l'apostrofo come
 * `&#x27;` e la e commerciale come `&amp;`, e un titolo reale non deve arrivare
 * in catalogo con i codici al posto dei caratteri.
 */
export function sciogliEntita(testo: string): string {
  return testo
    .replace(/&#x([0-9a-f]+);/gi, (_, c: string) => String.fromCodePoint(Number.parseInt(c, 16)))
    .replace(/&#(\d+);/g, (_, c: string) => String.fromCodePoint(Number.parseInt(c, 10)))
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");
}

/** Legge i metadati pubblici di una pagina Suno: titolo e copertina reale della cdn. */
async function metadatiSuno(url: string): Promise<MetadatiSorgente> {
  const vuoto: MetadatiSorgente = {
    url,
    idEsterno: uuidSuno(url),
    titolo: null,
    artista: null,
    cover: null,
    letti: false,
    avviso: null,
  };
  try {
    const r = await fetch(url, {
      redirect: "follow",
      headers: { "user-agent": UA, accept: "text/html" },
      signal: AbortSignal.timeout(12_000),
    });
    // L'indirizzo finale è quello che contiene l'UUID del brano: è la chiave del duplicato.
    const finale = r.url || url;
    const uuid = uuidSuno(finale) ?? uuidSuno(url);
    if (!r.ok)
      return {
        ...vuoto,
        url: uuid ? `https://suno.com/song/${uuid}` : finale,
        idEsterno: uuid,
        avviso: `Suno ha risposto ${r.status}: la scheda va completata a mano.`,
      };
    const html = await r.text();
    const titolo = contenuto(html, "og:title");
    return {
      url: uuid ? `https://suno.com/song/${uuid}` : finale,
      idEsterno: uuid,
      titolo: titolo ? titoloPulito(titolo) : null,
      // Su Suno l'autore non è nei metadati della pagina: non si deduce, si compila a mano.
      artista: null,
      cover: uuid ? coverSuno(uuid) : contenuto(html, "og:image"),
      letti: !!titolo,
      avviso: titolo ? null : "Suno non ha restituito il titolo: da completare a mano.",
    };
  } catch {
    return {
      ...vuoto,
      avviso: "Suno non raggiungibile in questo momento: la scheda va completata a mano.",
    };
  }
}

/** Legge i metadati pubblici di un caricamento YouTube dal servizio oEmbed ufficiale. */
async function metadatiYouTube(url: string, id: string | null): Promise<MetadatiSorgente> {
  const base: MetadatiSorgente = {
    url,
    idEsterno: id,
    titolo: null,
    artista: null,
    cover: id ? coverYouTube(id) : null,
    letti: false,
    avviso: null,
  };
  if (!id) return { ...base, avviso: "Indirizzo YouTube senza codice video." };
  try {
    const r = await fetch(
      `https://www.youtube.com/oembed?url=${encodeURIComponent(
        `https://www.youtube.com/watch?v=${id}`,
      )}&format=json`,
      { headers: { "user-agent": UA }, signal: AbortSignal.timeout(12_000) },
    );
    if (!r.ok)
      return { ...base, avviso: `YouTube ha risposto ${r.status}: scheda da completare a mano.` };
    const j = (await r.json()) as { title?: string; author_name?: string; thumbnail_url?: string };
    return {
      ...base,
      titolo: j.title ? titoloPulito(sciogliEntita(j.title)) : null,
      artista: j.author_name ? sciogliEntita(j.author_name) : null,
      cover: j.thumbnail_url ?? coverYouTube(id),
      letti: !!j.title,
      avviso: j.title ? null : "YouTube non ha restituito il titolo.",
    };
  } catch {
    return { ...base, avviso: "YouTube non raggiungibile in questo momento." };
  }
}

/**
 * I METADATI DI UNA SORGENTE, qualunque sia la piattaforma. Non lancia mai: quando la
 * lettura non riesce torna `letti: false` e la scheda si crea comunque, da completare.
 */
export async function metadati(s: SorgenteRiconosciuta): Promise<MetadatiSorgente> {
  if (s.piattaforma === "suno") return metadatiSuno(s.url);
  if (s.piattaforma === "youtube" || s.piattaforma === "youtube-music")
    return metadatiYouTube(s.url, s.idEsterno ?? idVideoYouTube(s.url));
  return {
    url: s.url,
    idEsterno: s.idEsterno,
    titolo: null,
    artista: null,
    cover: null,
    letti: false,
    avviso:
      s.avviso ??
      "Questa piattaforma non pubblica metadati leggibili: titolo e copertina vanno inseriti a mano.",
  };
}

/* ════════════════════════════════════════════════════════════════════════════════
   2 · IL BRANO MASTER COMPOSTO
   ════════════════════════════════════════════════════════════════════════════════ */

export type SorgenteBrano = {
  id: number | null;
  tipo: TipoSorgente;
  piattaforma: Piattaforma;
  url: string;
  urlOriginale: string | null;
  idEsterno: string | null;
  versione: string | null;
  cover: string | null;
  principale: boolean;
  nota: string | null;
  /** Indirizzo del player incorporabile, null quando la piattaforma non lo consente. */
  embed: string | null;
  /** Vero per le sorgenti del catalogo storico: non si cancellano dal pannello. */
  storica: boolean;
  /** Durata reale in secondi letta dalla piattaforma, null quando non nota. */
  durataSec: number | null;
};

export type BranoCatalogo = {
  id: string;
  /** `catalogo` = una delle 40 uscite storiche; `importato` = scheda in `brani_master`. */
  origine: "catalogo" | "importato";
  numero: number | null;
  titolo: string;
  chiaveTitolo: string;
  artista: string | null;
  cover: string | null;
  genere: string | null;
  anno: string | null;
  descrizione: string | null;
  notaInterna: string | null;
  /** da-verificare | verificato — stato della scheda, non del contenuto. */
  statoScheda: string;
  tornata: string | null;
  nascosto: boolean;
  /** pubblicato quando esiste almeno una sorgente d'ascolto reale. */
  statoAudio: "pubblicato" | "da-completare";
  audioUrl: string | null;
  audioEmbed: string | null;
  audioPiattaforma: Piattaforma | null;
  sorgenti: SorgenteBrano[];
  versioni: string[];
  statoVideo: StatoVideo;
  statoProduzione: FaseProduzione | null;
  videoUrl: string | null;
  thumbnailVideo: string | null;
  annoVideoPrevisto: string | null;
  classe: ClasseBrano;
  casting: {
    slug: string;
    titolo: string;
    stato: string;
    scadenza: string | null;
  } | null;
  etichetta: EtichettaStato;
  etichettaVideo: EtichettaStato;
  nota: string | null;
  inserito: string | null;
  ultimoControllo: string | null;
};

function sorgenteDaRiga(r: typeof schema.braniSorgenti.$inferSelect): SorgenteBrano {
  return {
    id: r.id,
    tipo: r.tipo as TipoSorgente,
    piattaforma: r.piattaforma as Piattaforma,
    url: r.url,
    urlOriginale: r.urlOriginale,
    idEsterno: r.idEsterno,
    versione: r.versione,
    cover: r.cover,
    principale: r.principale,
    nota: r.nota,
    embed: indirizzoPlayer({ piattaforma: r.piattaforma, idEsterno: r.idEsterno, url: r.url }),
    storica: false,
    durataSec: r.durataSec ?? null,
  };
}

/** La sorgente storica di una delle 40 uscite: è un caricamento reale del canale. */
function sorgenteStorica(audioUrl: string, cover: string | null): SorgenteBrano {
  const id = idVideoYouTube(audioUrl);
  return {
    id: null,
    // È un'uscita audio del canale: si chiama VISUAL AUDIO, non videoclip.
    tipo: "visual-audio",
    piattaforma: "youtube",
    url: audioUrl,
    urlOriginale: audioUrl,
    idEsterno: id,
    versione: null,
    cover,
    principale: true,
    nota: null,
    embed: id ? `https://www.youtube.com/embed/${id}` : null,
    storica: true,
    durataSec: null,
  };
}

function iso(d: Date | null | undefined): string | null {
  return d ? d.toISOString().slice(0, 10) : null;
}

/** L'ordine di preferenza per l'ascolto: la sorgente segnata principale, poi le altre. */
function scegliAscolto(sorgenti: SorgenteBrano[]): SorgenteBrano | null {
  const ascoltabili = sorgenti.filter((s) => s.tipo !== "videoclip" && !!s.url);
  const lista = ascoltabili.length ? ascoltabili : sorgenti.filter((s) => !!s.url);
  return lista.find((s) => s.principale) ?? lista[0] ?? null;
}

type Ingredienti = {
  video: Map<string, typeof schema.braniVideo.$inferSelect>;
  casting: Map<string, { slug: string; titolo: string; stato: string; scadenza: string | null }>;
  sorgenti: Map<string, SorgenteBrano[]>;
};

function componi(
  base: {
    id: string;
    origine: "catalogo" | "importato";
    numero: number | null;
    titolo: string;
    artista: string | null;
    cover: string | null;
    genere: string | null;
    anno: string | null;
    descrizione: string | null;
    notaInterna: string | null;
    statoScheda: string;
    tornata: string | null;
    nascosto: boolean;
    sorgentiBase: SorgenteBrano[];
    inserito: string | null;
    ultimoControllo: string | null;
  },
  ing: Ingredienti,
): BranoCatalogo {
  const r = ing.video.get(base.id);
  const casting = ing.casting.get(base.id) ?? null;
  const sorgenti = [...base.sorgentiBase, ...(ing.sorgenti.get(base.id) ?? [])];

  const stato = (r?.statoVideo ?? "da-realizzare") as StatoVideo;
  // Un videoclip «pubblicato» senza indirizzo non è pubblicato: si resta un passo indietro.
  const statoVideo: StatoVideo = stato === "pubblicato" && !r?.videoUrl ? "in-produzione" : stato;
  const ascolto = scegliAscolto(sorgenti);
  const statoAudio = ascolto ? ("pubblicato" as const) : ("da-completare" as const);

  const etichetta = etichettaStato({
    statoAudio,
    statoVideo,
    statoProduzione: (r?.statoProduzione as string | null) ?? null,
    castingAperto: !!casting,
    videoUrl: r?.videoUrl ?? null,
  });

  return {
    id: base.id,
    origine: base.origine,
    numero: base.numero,
    titolo: base.titolo,
    chiaveTitolo: chiaveTitolo(base.titolo),
    artista: base.artista,
    // La copertina della scheda, oppure quella della sorgente d'ascolto. Mai generata.
    cover: base.cover ?? ascolto?.cover ?? null,
    genere: base.genere ?? r?.genere ?? null,
    anno: base.anno ?? r?.anno ?? null,
    descrizione: base.descrizione,
    notaInterna: base.notaInterna,
    statoScheda: base.statoScheda,
    tornata: base.tornata,
    nascosto: base.nascosto,
    statoAudio,
    audioUrl: ascolto?.url ?? null,
    audioEmbed: ascolto?.embed ?? null,
    audioPiattaforma: ascolto?.piattaforma ?? null,
    sorgenti,
    versioni: [...new Set(sorgenti.map((s) => s.versione).filter((v): v is string => !!v))],
    statoVideo,
    statoProduzione:
      statoVideo === "in-produzione" ? ((r?.statoProduzione as FaseProduzione | null) ?? null) : null,
    videoUrl: r?.videoUrl ?? null,
    thumbnailVideo: r?.thumbnailVideo ?? null,
    annoVideoPrevisto: r?.annoVideoPrevisto ?? null,
    classe: classeBrano(statoVideo),
    casting,
    etichetta,
    etichettaVideo: etichettaVideoclip({ statoVideo, videoUrl: r?.videoUrl ?? null }),
    nota: r?.nota ?? null,
    inserito: base.inserito,
    ultimoControllo: base.ultimoControllo,
  };
}

async function ingredienti(): Promise<Ingredienti> {
  const video = new Map<string, typeof schema.braniVideo.$inferSelect>();
  const casting = new Map<
    string,
    { slug: string; titolo: string; stato: string; scadenza: string | null }
  >();
  const sorgenti = new Map<string, SorgenteBrano[]>();

  const [righeVideo, righeCasting, righeSorgenti] = await Promise.all([
    db
      .select()
      .from(schema.braniVideo)
      .catch(() => [] as (typeof schema.braniVideo.$inferSelect)[]),
    db
      .select()
      .from(schema.castings)
      .where(inArray(schema.castings.stato, ["aperto", "in-selezione"]))
      .catch(() => [] as (typeof schema.castings.$inferSelect)[]),
    db
      .select()
      .from(schema.braniSorgenti)
      .catch(() => [] as (typeof schema.braniSorgenti.$inferSelect)[]),
  ]);

  for (const r of righeVideo) video.set(r.branoId, r);
  for (const c of righeCasting)
    if (c.branoId)
      casting.set(c.branoId, {
        slug: c.slug,
        titolo: c.titolo,
        stato: c.stato,
        scadenza: c.scadenza,
      });
  for (const s of righeSorgenti) {
    const lista = sorgenti.get(s.branoId) ?? [];
    lista.push(sorgenteDaRiga(s));
    sorgenti.set(s.branoId, lista);
  }
  for (const [, lista] of sorgenti)
    lista.sort((a, b) => Number(b.principale) - Number(a.principale) || (a.id ?? 0) - (b.id ?? 0));
  return { video, casting, sorgenti };
}

/**
 * IL CATALOGO COMPLETO, catalogo storico e brani importati in un solo elenco.
 * Ogni pagina filtra questo: non esiste un secondo elenco da nessuna parte.
 */
export async function catalogoCompleto(): Promise<BranoCatalogo[]> {
  const ing = await ingredienti();
  const master = await db
    .select()
    .from(schema.braniMaster)
    .catch(() => [] as (typeof schema.braniMaster.$inferSelect)[]);

  const storici = CATALOGO_BRANI.map((b) =>
    componi(
      {
        id: b.id,
        origine: "catalogo",
        numero: b.numero,
        titolo: b.titolo,
        artista: b.artista,
        cover: b.cover,
        genere: null,
        anno: null,
        descrizione: null,
        notaInterna: null,
        statoScheda: "verificato",
        tornata: "CANALE TOUCH MUSIC RADIO TV · 29/08/2026",
        nascosto: false,
        sorgentiBase: [sorgenteStorica(b.audioUrl, b.cover)],
        inserito: null,
        ultimoControllo: null,
      },
      ing,
    ),
  );

  const importati = master.map((m) =>
    componi(
      {
        id: m.id,
        origine: "importato",
        numero: null,
        titolo: m.titolo,
        artista: m.artista,
        cover: m.cover,
        genere: m.genere,
        anno: m.anno,
        descrizione: m.descrizione,
        notaInterna: m.notaInterna,
        statoScheda: m.stato,
        tornata: m.tornata,
        nascosto: m.nascosto,
        sorgentiBase: [],
        inserito: iso(m.createdAt),
        ultimoControllo: iso(m.updatedAt),
      },
      ing,
    ),
  );

  // I brani appena importati stanno in cima: è la coda di lavoro della direzione.
  importati.sort(
    (a, b) => (b.inserito ?? "").localeCompare(a.inserito ?? "") || a.titolo.localeCompare(b.titolo),
  );
  return [...importati, ...storici];
}

/* ════════════════════════════════════════════════════════════════════════════════
   3 · CONTROLLO DUPLICATI
   ════════════════════════════════════════════════════════════════════════════════ */

export type EsitoDuplicato = {
  /** null = nessun duplicato: la scheda si può creare. */
  branoId: string | null;
  titolo: string | null;
  /** url | id-piattaforma | titolo | titolo-versione */
  motivo: "url" | "id-piattaforma" | "titolo" | "titolo-versione" | null;
  /** Vero quando è lo stesso titolo ma un'altra versione: la sorgente si aggiunge. */
  altraVersione: boolean;
  /** Vero quando quella precisa sorgente è già agganciata a quel brano. */
  sorgenteGiaPresente: boolean;
};

const NESSUN_DUPLICATO: EsitoDuplicato = {
  branoId: null,
  titolo: null,
  motivo: null,
  altraVersione: false,
  sorgenteGiaPresente: false,
};

/**
 * CERCA IL DUPLICATO PRIMA DI CREARE. Ordine dei controlli, dal più certo al più debole:
 * indirizzo → codice della piattaforma → titolo (+ versione).
 *
 * Quando il titolo coincide ma la versione è diversa NON nasce un secondo brano: la
 * sorgente si aggancia allo stesso brano master, che è esattamente la regola chiesta.
 */
export function cercaDuplicato(
  catalogo: BranoCatalogo[],
  s: { url: string; idEsterno: string | null; titolo?: string | null; versione?: string | null },
): EsitoDuplicato {
  const url = s.url.trim().toLowerCase();
  for (const b of catalogo) {
    for (const src of b.sorgenti) {
      if (src.url.trim().toLowerCase() === url)
        return {
          branoId: b.id,
          titolo: b.titolo,
          motivo: "url",
          altraVersione: false,
          sorgenteGiaPresente: true,
        };
      if (s.idEsterno && src.idEsterno && src.idEsterno === s.idEsterno)
        return {
          branoId: b.id,
          titolo: b.titolo,
          motivo: "id-piattaforma",
          altraVersione: false,
          sorgenteGiaPresente: true,
        };
    }
  }
  const titolo = (s.titolo ?? "").trim();
  if (!titolo) return NESSUN_DUPLICATO;
  const chiave = chiaveTitolo(titolo);
  if (!chiave) return NESSUN_DUPLICATO;
  const versione = s.versione ?? versioneDalTitolo(titolo);
  for (const b of catalogo) {
    if (b.chiaveTitolo !== chiave) continue;
    const versioniPresenti = b.versioni;
    const altra = !!versione && !versioniPresenti.includes(versione);
    return {
      branoId: b.id,
      titolo: b.titolo,
      motivo: altra ? "titolo-versione" : "titolo",
      altraVersione: altra,
      sorgenteGiaPresente: false,
    };
  }
  return NESSUN_DUPLICATO;
}

/* ════════════════════════════════════════════════════════════════════════════════
   4 · IMPORTAZIONE
   ════════════════════════════════════════════════════════════════════════════════ */

export type EsitoImportazione = {
  urlOriginale: string;
  url: string;
  piattaforma: Piattaforma;
  tipo: TipoSorgente;
  /** creato | sorgente-aggiunta | gia-presente | da-completare | errore */
  esito: "creato" | "sorgente-aggiunta" | "gia-presente" | "errore";
  branoId: string | null;
  titolo: string | null;
  versione: string | null;
  /** Vero quando la piattaforma non ha dato i metadati: scheda da completare a mano. */
  daCompletare: boolean;
  messaggio: string;
};

/**
 * IMPORTA UN SOLO INDIRIZZO. È il cuore del comando «IMPORTA BRANO DA URL» e anche
 * di quello multiplo: la differenza è solo quante volte viene chiamato.
 *
 * Passaggi: riconosci → leggi i metadati → controlla i duplicati → crea o aggancia.
 * Se i metadati non arrivano la scheda nasce comunque, con lo stato `da-verificare`:
 * «se non riesci a leggere i dati, crea comunque la scheda e fammela completare».
 */
export async function importaIndirizzo(
  raw: string,
  opzioni: { tornata: string; tipo?: TipoSorgente; versione?: string | null },
): Promise<EsitoImportazione> {
  const s = riconosci(raw);
  if (!s)
    return {
      urlOriginale: raw,
      url: raw,
      piattaforma: "altro",
      tipo: "audio",
      esito: "errore",
      branoId: null,
      titolo: null,
      versione: null,
      daCompletare: true,
      messaggio: "Indirizzo vuoto o non leggibile.",
    };

  const meta = await metadati(s);
  const tipo = opzioni.tipo ?? s.tipo;
  const titolo = meta.titolo ?? "";
  const versione = opzioni.versione ?? (titolo ? versioneDalTitolo(titolo) : null);
  const catalogo = await catalogoCompleto();
  const dup = cercaDuplicato(catalogo, {
    url: meta.url,
    idEsterno: meta.idEsterno,
    titolo,
    versione,
  });

  const comune = {
    urlOriginale: s.urlOriginale,
    url: meta.url,
    piattaforma: s.piattaforma,
    tipo,
    titolo: titolo || dup.titolo,
    versione,
    daCompletare: !meta.letti,
  };

  // ── Duplicato esatto: non si crea niente e non si duplica niente. ──────────────
  if (dup.branoId && dup.sorgenteGiaPresente)
    return {
      ...comune,
      esito: "gia-presente",
      branoId: dup.branoId,
      messaggio:
        dup.motivo === "url"
          ? "GIÀ PRESENTE NEL CATALOGO — stesso indirizzo."
          : "GIÀ PRESENTE NEL CATALOGO — stesso codice sulla piattaforma.",
    };

  // ── Stesso titolo: la sorgente si aggancia al brano master che esiste già. ─────
  if (dup.branoId) {
    await db.insert(schema.braniSorgenti).values({
      branoId: dup.branoId,
      tipo,
      piattaforma: s.piattaforma,
      url: meta.url,
      urlOriginale: s.urlOriginale,
      idEsterno: meta.idEsterno,
      versione,
      cover: meta.cover,
      principale: false,
      nota: meta.avviso,
      ordine: 0,
    });
    if (dup.branoId.startsWith("mus-"))
      await db
        .update(schema.braniMaster)
        .set({ updatedAt: new Date() })
        .where(eq(schema.braniMaster.id, dup.branoId));
    return {
      ...comune,
      esito: "sorgente-aggiunta",
      branoId: dup.branoId,
      messaggio: dup.altraVersione
        ? `Stesso titolo, versione ${versione}: sorgente aggiunta al brano «${dup.titolo}», nessun brano duplicato.`
        : `Titolo già in catalogo: sorgente aggiunta al brano «${dup.titolo}».`,
    };
  }

  // ── Brano nuovo. ──────────────────────────────────────────────────────────────
  const id = nuovoIdBrano();
  const adesso = new Date();
  await db.insert(schema.braniMaster).values({
    id,
    titolo,
    chiaveTitolo: chiaveTitolo(titolo),
    // L'artista non si deduce dal titolo: lo scrive la direzione. Per i caricamenti
    // YouTube il nome del canale è un dato reale, quindi quello si può usare.
    artista: s.piattaforma === "youtube" ? meta.artista : null,
    cover: meta.cover,
    genere: null,
    anno: null,
    descrizione: null,
    notaInterna: meta.avviso,
    stato: "da-verificare",
    tornata: opzioni.tornata,
    nascosto: false,
    ordine: 0,
    createdAt: adesso,
    updatedAt: adesso,
  });
  await db.insert(schema.braniSorgenti).values({
    branoId: id,
    tipo,
    piattaforma: s.piattaforma,
    url: meta.url,
    urlOriginale: s.urlOriginale,
    idEsterno: meta.idEsterno,
    versione,
    cover: meta.cover,
    principale: true,
    nota: meta.avviso,
    ordine: 0,
  });
  return {
    ...comune,
    esito: "creato",
    branoId: id,
    titolo: titolo || null,
    messaggio: meta.letti
      ? `Scheda creata: «${titolo}». Da verificare prima della pubblicazione.`
      : `Scheda creata senza metadati (${meta.avviso ?? "piattaforma muta"}): da completare a mano.`,
  };
}

/** Vero se quell'ID è un brano del catalogo storico o una scheda importata. */
export async function branoEsiste(id: string): Promise<boolean> {
  if (CATALOGO_BRANI.some((b) => b.id === id)) return true;
  const [r] = await db
    .select({ id: schema.braniMaster.id })
    .from(schema.braniMaster)
    .where(eq(schema.braniMaster.id, id))
    .limit(1);
  return !!r;
}

/** L'artista di riferimento, quando la direzione non ne indica un altro. */
export const ARTISTA_PREDEFINITO = ARTISTA_BRANI;
