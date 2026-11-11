import { z } from "zod";
import { and, desc, eq, gte, inArray, isNotNull, ne, or, sql } from "drizzle-orm";
import { ORPCError } from "@orpc/server";
import { base } from "../__core/app";
import { db } from "../database";
import * as schema from "../database/schema";
import {
  CATEGORIE_EDICOLA,
  EDICOLA_NOTA,
  EDICOLA_NOTA_ESTERNI,
  EDICOLA_SOTTOTITOLO,
  EDICOLA_TITOLO,
  GIOCHI_EDICOLA,
  GIOCHI_NOTA,
  OROSCOPO_AREE,
  OROSCOPO_NOTA,
  SEGNI_ZODIACALI,
  TERRITORI_EDICOLA,
  categoriaEdicola,
  percorsoContenuto,
  pesoTerritorio,
  segno as segnoDi,
  segnoDelGiorno,
  segnoDiOggi,
} from "../data/edicola";
import { FONTI_EDICOLA, FONTI_SCARTATE, type FonteEdicola } from "../data/edicola-fonti";
import {
  abstractCorto,
  chiaveDedup,
  scaricaFeed,
  slugContenuto,
  testoPulito,
} from "../lib/edicola-rss";
import { TBH_CONTACTS } from "../data/catalog";

/**
 * EDICOLA TBH — SERVIZIO UNICO DELL'HUB EDITORIALE (specifica del 20/09/2026).
 *
 * Tre regole che governano tutto il file:
 *
 *   1. NIENTE INVENTATO. Ogni riga che arriva qui dentro viene da un feed
 *      ufficiale verificato (`FONTI_EDICOLA`) oppure dalla mano della redazione
 *      dal pannello. Dove il dato non c'è, la risposta lo dichiara mancante:
 *      non esiste un valore «di riserva» costruito dal sito.
 *
 *   2. UN CONTENUTO, UNA PAGINA. Lo stesso articolo può comparire in più
 *      fasce, ma il suo indirizzo canonico è uno solo (`percorsoContenuto`), e
 *      la deduplica su `dedup_key` impedisce due righe per la stessa notizia.
 *
 *   3. NIENTE TESTO COPIATO. Degli articoli esterni si conservano solo titolo,
 *      sintesi breve dichiarata dal feed, immagine dichiarata, testata e data.
 *      Il pulsante «LEGGI SULLA FONTE» porta all'originale.
 */

/* ── ACCESSO AL PANNELLO (stesso codice degli altri admin TBH) ───────────── */

const CODICE = () => (process.env.TBH_CODICE_ALLESTIMENTO ?? "").trim();

function controlla(codice: string) {
  const atteso = CODICE();
  if (!atteso) {
    throw new ORPCError("SERVICE_UNAVAILABLE", {
      message: "Codice di allestimento non configurato sul server (TBH_CODICE_ALLESTIMENTO).",
    });
  }
  if (codice.trim() !== atteso) {
    throw new ORPCError("UNAUTHORIZED", { message: "Codice di allestimento errato." });
  }
}

const auth = z.object({ codice: z.string().min(1).max(120) });

/* ── FORMA PUBBLICA DI UN CONTENUTO ─────────────────────────────────────── */

type RigaContenuto = typeof schema.edicolaContenuti.$inferSelect;

export type ContenutoEdicola = {
  id: number;
  titolo: string;
  slug: string;
  categoria: string;
  categoriaTitolo: string;
  categoriaEmoji: string;
  categoriaColore: string;
  sottocategoria: string | null;
  territorio: string | null;
  territorioNome: string | null;
  fonte: string | null;
  fonteSito: string | null;
  urlOriginale: string | null;
  immagine: string | null;
  abstract: string | null;
  sintesiTbh: string | null;
  dataPubblicazione: string | null;
  evento: boolean;
  dataEvento: string | null;
  oraEvento: string | null;
  luogoEvento: string | null;
  organizzatoreEvento: string | null;
  tags: string[];
  priorita: number;
  origine: string;
  /** L'unico indirizzo interno del contenuto. */
  href: string;
};

function tagsDi(grezzo: string | null): string[] {
  if (!grezzo) return [];
  return grezzo
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
}

function pubblico(r: RigaContenuto): ContenutoEdicola {
  const cat = categoriaEdicola(r.category);
  const terr = TERRITORI_EDICOLA.find((t) => t.slug === r.territory);
  return {
    id: r.id,
    titolo: r.title,
    slug: r.slug,
    categoria: r.category,
    categoriaTitolo: cat?.titolo ?? r.category,
    categoriaEmoji: cat?.emoji ?? "📰",
    categoriaColore: cat?.colore ?? "#FFD400",
    sottocategoria: r.subcategory ?? null,
    territorio: r.territory ?? null,
    territorioNome: terr?.nome ?? null,
    fonte: r.source ?? null,
    fonteSito: r.sourceUrl ?? null,
    urlOriginale: r.originalUrl ?? null,
    immagine: r.image ?? null,
    abstract: r.excerpt ?? null,
    sintesiTbh: r.sintesiTbh ?? null,
    dataPubblicazione: r.publishedAt ? r.publishedAt.toISOString() : null,
    evento: Boolean(r.eventDate) || r.category === "eventi",
    dataEvento: r.eventDate ?? null,
    oraEvento: r.eventTime ?? null,
    luogoEvento: r.eventPlace ?? null,
    organizzatoreEvento: r.eventOrganizer ?? null,
    tags: tagsDi(r.tags),
    priorita: r.priority,
    origine: r.origine,
    href: percorsoContenuto({ slug: r.slug, category: r.category, eventDate: r.eventDate }),
  };
}

/* ── ORDINAMENTO (punto 5): RECENZA + TERRITORIO + INTERESSE + EVENTO + PRIORITÀ ── */

/** Interesse per categoria: quanto la direzione vuole vedere quella fascia in alto. */
const INTERESSE: Record<string, number> = {
  "in-evidenza": 14,
  "ultima-ora": 12,
  territorio: 11,
  eventi: 10,
  sport: 8,
  motorsport: 7,
  musica: 6,
  cinema: 6,
  animali: 6,
  "uomo-animale": 5,
  "guida-tv": 4,
  "miss-cool": 9,
  dm: 7,
  opportunita: 9,
};

function punteggio(r: RigaContenuto, adesso = Date.now()): number {
  /* RECENZA: piena nelle prime 24 ore, poi scende e a 30 giorni è quasi zero. */
  const quando = r.publishedAt?.getTime() ?? r.createdAt.getTime();
  const ore = Math.max(0, (adesso - quando) / 3_600_000);
  const recenza = 40 / (1 + ore / 18);

  const territorio = pesoTerritorio(r.territory);
  const interesse = INTERESSE[r.category] ?? 3;

  /* EVENTO IMMINENTE: un evento che sta per accadere sale; uno passato scende. */
  let evento = 0;
  if (r.eventDate) {
    const giorni = Math.round(
      (new Date(`${r.eventDate}T00:00:00`).getTime() - adesso) / 86_400_000,
    );
    if (giorni < 0) evento = -25;
    else if (giorni <= 2) evento = 30;
    else if (giorni <= 7) evento = 20;
    else if (giorni <= 30) evento = 10;
    else evento = 4;
  }

  return recenza + territorio + interesse + evento + r.priority * 6;
}

/**
 * Il caso entra SOLO a pari merito: due contenuti con lo stesso punteggio si
 * alternano, così la fascia non è sempre identica, ma nessun contenuto salta la
 * fila di uno più importante.
 */
function ordina(righe: RigaContenuto[], adesso = Date.now()): RigaContenuto[] {
  const conPunti = righe.map((r) => ({ r, p: punteggio(r, adesso) }));
  return conPunti
    .sort((a, b) => {
      const d = b.p - a.p;
      if (Math.abs(d) > 0.5) return d;
      return Math.random() - 0.5;
    })
    .map((x) => x.r);
}

/* ── LETTURA DAL REGISTRO ────────────────────────────────────────────────── */

/** Le righe più recenti, per il monitor e per la fascia «OGGI SU TBH». */
async function pubblicati(limite = 200): Promise<RigaContenuto[]> {
  return db
    .select()
    .from(schema.edicolaContenuti)
    .where(eq(schema.edicolaContenuti.status, "pubblicato"))
    .orderBy(desc(schema.edicolaContenuti.publishedAt))
    .limit(limite);
}

/**
 * Le righe di UNA fascia. Ogni fascia si legge per conto suo: così una sezione
 * piccola (Eventi, Animali) non resta vuota soltanto perché le testate
 * nazionali pubblicano più spesso. Le fasce composte — In Evidenza, Territorio,
 * Eventi, Opportunità — hanno il loro filtro, non una categoria sola.
 */
async function righeFascia(slug: string, limite = 60): Promise<RigaContenuto[]> {
  const tabella = schema.edicolaContenuti;
  const pubblicato = eq(tabella.status, "pubblicato");

  let filtro;
  switch (slug) {
    case "in-evidenza":
      filtro = and(pubblicato, gte(tabella.priority, 5));
      break;
    case "territorio":
      filtro = and(
        pubblicato,
        or(
          eq(tabella.category, "territorio"),
          and(isNotNull(tabella.territory), ne(tabella.territory, "italia")),
        ),
      );
      break;
    case "eventi":
      filtro = and(pubblicato, or(eq(tabella.category, "eventi"), isNotNull(tabella.eventDate)));
      break;
    case "opportunita":
      filtro = and(pubblicato, or(eq(tabella.category, "opportunita"), isNotNull(tabella.tags)));
      break;
    default:
      filtro = and(pubblicato, eq(tabella.category, slug));
  }

  return db.select().from(tabella).where(filtro).orderBy(desc(tabella.publishedAt)).limit(limite);
}

/** Le fonti in vigore: il registro verificato, corretto dalle righe del pannello. */
async function fontiInVigore(): Promise<
  (FonteEdicola & { attiva: boolean; daPannello: boolean; ultimoEsito: string | null; ultimoMessaggio: string | null; ultimoControllo: string | null; ultimiItem: number | null })[]
> {
  const righe = await db.select().from(schema.edicolaFonti);
  const perSlug = new Map(righe.map((r) => [r.slug, r]));

  const dal_registro = FONTI_EDICOLA.map((f) => {
    const r = perSlug.get(f.slug);
    return {
      ...f,
      feedUrl: r?.feedUrl ?? f.feedUrl,
      nome: r?.nome ?? f.nome,
      categoria: r?.categoria ?? f.categoria,
      sottocategoria: r?.sottocategoria ?? f.sottocategoria,
      territorio: r?.territorio ?? f.territorio,
      priorita: r?.priorita ?? f.priorita ?? 0,
      attiva: r ? r.attiva === 1 : true,
      daPannello: Boolean(r),
      ultimoEsito: r?.ultimoEsito ?? null,
      ultimoMessaggio: r?.ultimoMessaggio ?? null,
      ultimoControllo: r?.ultimoControllo ? r.ultimoControllo.toISOString() : null,
      ultimiItem: r?.ultimiItem ?? null,
    };
  });

  /* Fonti aggiunte da zero dal pannello: non sono nel registro di codice. */
  const nuove = righe
    .filter((r) => !FONTI_EDICOLA.some((f) => f.slug === r.slug))
    .map((r) => ({
      slug: r.slug,
      nome: r.nome,
      feedUrl: r.feedUrl,
      sitoUrl: r.sitoUrl ?? "",
      categoria: r.categoria,
      sottocategoria: r.sottocategoria ?? undefined,
      territorio: r.territorio ?? "italia",
      immagini: false,
      itemVerificati: r.ultimiItem ?? 0,
      verificatoIl: r.ultimoControllo ? r.ultimoControllo.toISOString().slice(0, 10) : "",
      priorita: r.priorita,
      nota: r.nota ?? undefined,
      attiva: r.attiva === 1,
      daPannello: true,
      ultimoEsito: r.ultimoEsito ?? null,
      ultimoMessaggio: r.ultimoMessaggio ?? null,
      ultimoControllo: r.ultimoControllo ? r.ultimoControllo.toISOString() : null,
      ultimiItem: r.ultimiItem ?? null,
    }));

  return [...dal_registro, ...nuove];
}

/* ── AGGIORNAMENTO DEI FEED (il solo modo in cui nasce un contenuto esterno) ── */

export type EsitoAggiornamento = {
  fonte: string;
  nome: string;
  ok: boolean;
  messaggio: string;
  letti: number;
  nuovi: number;
};

async function aggiornaFonti(soloSlug?: string): Promise<EsitoAggiornamento[]> {
  const fonti = (await fontiInVigore()).filter(
    (f) => f.attiva && (!soloSlug || f.slug === soloSlug),
  );
  if (fonti.length === 0) return [];

  const esistenti = new Set(
    (await db.select({ k: schema.edicolaContenuti.dedupKey }).from(schema.edicolaContenuti)).map(
      (r) => r.k,
    ),
  );
  const slugUsati = new Set(
    (await db.select({ s: schema.edicolaContenuti.slug }).from(schema.edicolaContenuti)).map(
      (r) => r.s,
    ),
  );

  const esiti: EsitoAggiornamento[] = [];
  const adesso = new Date();

  for (const f of fonti) {
    const esito = await scaricaFeed(f.feedUrl);
    let nuovi = 0;

    if (esito.ok) {
      const daInserire: (typeof schema.edicolaContenuti.$inferInsert)[] = [];
      for (const item of esito.items) {
        const chiave = chiaveDedup(item.link, item.titolo);
        if (esistenti.has(chiave)) continue;
        esistenti.add(chiave);

        let slug = slugContenuto(item.titolo, chiave);
        while (slugUsati.has(slug)) slug = `${slug}-b`;
        slugUsati.add(slug);

        daInserire.push({
          title: testoPulito(item.titolo).slice(0, 300),
          slug,
          category: f.categoria,
          subcategory: f.sottocategoria ?? null,
          territory: f.territorio,
          source: f.nome,
          sourceUrl: f.sitoUrl || null,
          originalUrl: item.link,
          image: item.immagine,
          excerpt: item.abstract ? abstractCorto(item.abstract, 240) : null,
          publishedAt: item.dataPubblicazione ?? adesso,
          tags: null,
          priority: f.priorita ?? 0,
          status: "pubblicato",
          origine: "rss",
          fonteSlug: f.slug,
          dedupKey: chiave,
        });
      }
      if (daInserire.length > 0) {
        await db.insert(schema.edicolaContenuti).values(daInserire);
        nuovi = daInserire.length;
      }
    }

    /* Lo stato della fonte si scrive sempre: anche «non raggiungibile» è un dato. */
    const statoFonte = {
      slug: f.slug,
      nome: f.nome,
      feedUrl: f.feedUrl,
      sitoUrl: f.sitoUrl || null,
      categoria: f.categoria,
      sottocategoria: f.sottocategoria ?? null,
      territorio: f.territorio,
      attiva: 1,
      priorita: f.priorita ?? 0,
      nota: f.nota ?? null,
      ultimoEsito: esito.ok ? "ok" : "errore",
      ultimoMessaggio: esito.messaggio,
      ultimiItem: esito.items.length,
      ultimoControllo: adesso,
      updatedAt: adesso,
    };
    await db
      .insert(schema.edicolaFonti)
      .values(statoFonte)
      .onConflictDoUpdate({
        target: schema.edicolaFonti.slug,
        set: {
          ultimoEsito: statoFonte.ultimoEsito,
          ultimoMessaggio: statoFonte.ultimoMessaggio,
          ultimiItem: statoFonte.ultimiItem,
          ultimoControllo: adesso,
          updatedAt: adesso,
        },
      });

    esiti.push({
      fonte: f.slug,
      nome: f.nome,
      ok: esito.ok,
      messaggio: esito.messaggio,
      letti: esito.items.length,
      nuovi,
    });
  }

  return esiti;
}

/* ── FASCE DELLA HOME EDICOLA ───────────────────────────────────────────── */

async function fasciaDi(slug: string, massimo = 12): Promise<ContenutoEdicola[]> {
  if (!categoriaEdicola(slug)) return [];
  const righe = await righeFascia(slug, Math.max(massimo * 4, 60));
  return ordina(righe).slice(0, massimo).map(pubblico);
}

const CAROSELLI = CATEGORIE_EDICOLA.map((c) => c.slug);

/* ── OROSCOPO ────────────────────────────────────────────────────────────── */

function giornoOggi(d = new Date()) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

async function oroscopoDelGiorno(giorno: string) {
  const righe = await db
    .select()
    .from(schema.edicolaOroscopo)
    .where(eq(schema.edicolaOroscopo.giorno, giorno));
  const perSegno = new Map(righe.map((r) => [r.segno, r]));
  return SEGNI_ZODIACALI.map((s) => {
    const t = perSegno.get(s.slug);
    return {
      ...s,
      scritto: Boolean(t),
      amore: t?.amore ?? null,
      lavoro: t?.lavoro ?? null,
      fortuna: t?.fortuna ?? null,
      benessere: t?.benessere ?? null,
      testo: t?.testo ?? null,
      autore: t?.autore ?? null,
      href: `/edicola/oroscopo/${s.slug}`,
    };
  });
}

/* ════════════════════════ SERVIZIO PUBBLICO ═════════════════════════════ */

export const edicola = {
  /** Intestazione, categorie e territori: la struttura dell'Edicola. */
  struttura: base.handler(() => ({
    titolo: EDICOLA_TITOLO,
    sottotitolo: EDICOLA_SOTTOTITOLO,
    nota: EDICOLA_NOTA,
    notaEsterni: EDICOLA_NOTA_ESTERNI,
    categorie: CATEGORIE_EDICOLA,
    territori: TERRITORI_EDICOLA,
    contatti: TBH_CONTACTS,
  })),

  /** Home Edicola: monitor Ultima Ora + tutte le fasce tematiche. */
  home: base.handler(async () => {
    const righe = await pubblicati();
    const adesso = Date.now();

    const monitor = ordina(
      righe.filter((r) => Boolean(r.image) && r.status === "pubblicato"),
      adesso,
    )
      .slice(0, 8)
      .map(pubblico);

    const fasce = await Promise.all(
      CAROSELLI.map(async (slug) => {
        const cat = categoriaEdicola(slug)!;
        return {
          slug,
          emoji: cat.emoji,
          titolo: cat.titolo,
          descrizione: cat.descrizione,
          tipo: cat.tipo,
          colore: cat.colore,
          rimando: cat.rimando ?? null,
          href: `/edicola/${slug}`,
          items: await fasciaDi(slug),
        };
      }),
    );

    return {
      titolo: EDICOLA_TITOLO,
      sottotitolo: EDICOLA_SOTTOTITOLO,
      nota: EDICOLA_NOTA,
      notaEsterni: EDICOLA_NOTA_ESTERNI,
      monitor,
      fasce,
      territori: TERRITORI_EDICOLA,
      totale: Number(
        (
          await db
            .select({ n: sql<number>`count(*)` })
            .from(schema.edicolaContenuti)
            .where(eq(schema.edicolaContenuti.status, "pubblicato"))
        )[0]?.n ?? 0,
      ),
      giochi: GIOCHI_EDICOLA,
      segnoDelGiorno: segnoDelGiorno(),
      segnoDiOggi: segnoDiOggi(),
    };
  }),

  /** Fascia compatta «📰 OGGI SU TBH» per la home del portale. */
  oggi: base.handler(async () => {
    const righe = await pubblicati();
    return {
      titolo: "OGGI SU TBH",
      emoji: "📰",
      href: "/edicola",
      nota: EDICOLA_NOTA,
      items: ordina(righe).slice(0, 10).map(pubblico),
    };
  }),

  /** Pagina di una categoria, con filtri reali su territorio e sottocategoria. */
  categoria: base
    .input(
      z.object({
        slug: z.string().min(1),
        territorio: z.string().optional(),
        sottocategoria: z.string().optional(),
      }),
    )
    .handler(async ({ input }) => {
      const cat = categoriaEdicola(input.slug);
      if (!cat) throw new ORPCError("NOT_FOUND", { message: "Categoria non presente in Edicola." });

      let items = await fasciaDi(input.slug, 200);

      if (input.territorio) items = items.filter((i) => i.territorio === input.territorio);
      if (input.sottocategoria)
        items = items.filter(
          (i) => (i.sottocategoria ?? "").toLowerCase() === input.sottocategoria!.toLowerCase(),
        );

      const fonti = (await fontiInVigore()).filter((f) => f.categoria === input.slug);

      return {
        categoria: cat,
        items,
        territori: TERRITORI_EDICOLA,
        sottocategorie: cat.sottocategorie ?? [],
        filtri: { territorio: input.territorio ?? null, sottocategoria: input.sottocategoria ?? null },
        fonti: fonti.map((f) => ({
          nome: f.nome,
          sitoUrl: f.sitoUrl,
          attiva: f.attiva,
          esito: f.ultimoEsito,
        })),
        nota: cat.tipo === "esterna" ? EDICOLA_NOTA_ESTERNI : EDICOLA_NOTA,
        altre: CATEGORIE_EDICOLA.filter((c) => c.slug !== input.slug).map((c) => ({
          slug: c.slug,
          emoji: c.emoji,
          titolo: c.titolo,
          href: `/edicola/${c.slug}`,
        })),
      };
    }),

  /** Scheda di un contenuto: articolo o evento, sempre allo stesso indirizzo. */
  contenuto: base.input(z.object({ slug: z.string().min(1) })).handler(async ({ input }) => {
    const riga = (
      await db
        .select()
        .from(schema.edicolaContenuti)
        .where(eq(schema.edicolaContenuti.slug, input.slug))
        .limit(1)
    )[0];
    if (!riga || riga.status === "nascosto") {
      throw new ORPCError("NOT_FOUND", { message: "Contenuto non presente in Edicola." });
    }

    const item = pubblico(riga);
    const cat = categoriaEdicola(riga.category);

    const stessaCategoria = await db
      .select()
      .from(schema.edicolaContenuti)
      .where(
        and(
          eq(schema.edicolaContenuti.category, riga.category),
          eq(schema.edicolaContenuti.status, "pubblicato"),
          ne(schema.edicolaContenuti.id, riga.id),
        ),
      )
      .limit(60);

    const correlati = ordina(stessaCategoria).slice(0, 8).map(pubblico);
    const inFila = ordina(stessaCategoria).map(pubblico);

    return {
      item,
      categoria: cat,
      /* Evento: solo i campi davvero verificati arrivano al browser. */
      evento: item.evento
        ? {
            data: riga.eventDate ?? null,
            ora: riga.eventTime ?? null,
            luogo: riga.eventPlace ?? null,
            organizzatore: riga.eventOrganizer ?? null,
            programma: riga.eventProgram ?? null,
            sito: riga.eventSiteUrl ?? null,
            maps: riga.eventMapsUrl ?? null,
            ticket: riga.eventTicketUrl ?? null,
          }
        : null,
      correlati,
      precedente: inFila[0] ?? null,
      successivo: inFila[1] ?? null,
      nota: riga.origine === "rss" ? EDICOLA_NOTA_ESTERNI : EDICOLA_NOTA,
      contatti: TBH_CONTACTS,
    };
  }),

  /** Oroscopo: 12 segni, Segno del Giorno, testi della redazione. */
  oroscopo: base
    .input(z.object({ segno: z.string().optional(), giorno: z.string().optional() }))
    .handler(async ({ input }) => {
      const giorno = input.giorno && /^\d{4}-\d{2}-\d{2}$/.test(input.giorno) ? input.giorno : giornoOggi();
      const segni = await oroscopoDelGiorno(giorno);
      const richiesto = input.segno ? segnoDi(input.segno) : null;
      if (input.segno && !richiesto) {
        throw new ORPCError("NOT_FOUND", { message: "Segno non riconosciuto." });
      }
      const delGiorno = segnoDelGiorno();
      return {
        giorno,
        segni,
        aree: OROSCOPO_AREE,
        nota: OROSCOPO_NOTA,
        segnoDelGiorno: segni.find((s) => s.slug === delGiorno.slug) ?? null,
        segnoDiOggi: segnoDiOggi(),
        segno: richiesto ? (segni.find((s) => s.slug === richiesto.slug) ?? null) : null,
        scrittiOggi: segni.filter((s) => s.scritto).length,
      };
    }),

  /** Giochi: solo quelli che si giocano davvero, gli altri dichiarati. */
  giochi: base.handler(() => ({
    giochi: GIOCHI_EDICOLA,
    nota: GIOCHI_NOTA,
    attivi: GIOCHI_EDICOLA.filter((g) => g.stato === "attivo").length,
  })),

  /** Trasparenza pubblica sulle fonti: chi sono, se rispondono, cosa è escluso. */
  fonti: base.handler(async () => {
    const fonti = await fontiInVigore();
    return {
      fonti: fonti.map((f) => ({
        slug: f.slug,
        nome: f.nome,
        sitoUrl: f.sitoUrl,
        categoria: f.categoria,
        territorio: f.territorio,
        attiva: f.attiva,
        esito: f.ultimoEsito,
        ultimoControllo: f.ultimoControllo,
        verificatoIl: f.verificatoIl,
      })),
      scartate: FONTI_SCARTATE,
      nota: EDICOLA_NOTA_ESTERNI,
    };
  }),
};

/* ════════════════════════ PANNELLO ADMIN ════════════════════════════════ */

const testoOpz = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .nullable()
    .transform((v) => (v && v.length > 0 ? v : null));

export const edicolaAdmin = {
  stato: base.input(auth.partial()).handler(async ({ input }) => {
    const configurato = CODICE().length > 0;
    const valido = configurato && (input.codice ?? "").trim() === CODICE();
    if (!valido) return { configurato, valido, fonti: [], contenuti: 0, oroscopoOggi: 0 };
    const fonti = await fontiInVigore();
    const conteggio = await db
      .select({ n: sql<number>`count(*)` })
      .from(schema.edicolaContenuti);
    const oroscopo = await db
      .select({ n: sql<number>`count(*)` })
      .from(schema.edicolaOroscopo)
      .where(eq(schema.edicolaOroscopo.giorno, giornoOggi()));
    return {
      configurato,
      valido,
      fonti,
      scartate: FONTI_SCARTATE,
      contenuti: Number(conteggio[0]?.n ?? 0),
      oroscopoOggi: Number(oroscopo[0]?.n ?? 0),
      categorie: CATEGORIE_EDICOLA,
      territori: TERRITORI_EDICOLA,
      segni: SEGNI_ZODIACALI,
    };
  }),

  /** Legge i feed adesso. Nessun contenuto nasce in altro modo. */
  aggiorna: base
    .input(auth.extend({ fonte: z.string().optional() }))
    .handler(async ({ input }) => {
      controlla(input.codice);
      const esiti = await aggiornaFonti(input.fonte);
      return {
        esiti,
        nuovi: esiti.reduce((s, e) => s + e.nuovi, 0),
        falliti: esiti.filter((e) => !e.ok).map((e) => ({ fonte: e.nome, messaggio: e.messaggio })),
      };
    }),

  /** Accende, spegne, corregge o aggiunge una fonte senza toccare il codice. */
  salvaFonte: base
    .input(
      auth.extend({
        slug: z
          .string()
          .trim()
          .min(2)
          .max(60)
          .regex(/^[a-z0-9-]+$/, "Solo minuscole, numeri e trattini."),
        nome: z.string().trim().min(2).max(120),
        feedUrl: z.string().trim().url(),
        sitoUrl: testoOpz(300),
        categoria: z.string().trim().min(2).max(40),
        sottocategoria: testoOpz(60),
        territorio: z.string().trim().min(2).max(40),
        attiva: z.boolean(),
        priorita: z.number().int().min(0).max(10),
        nota: testoOpz(400),
      }),
    )
    .handler(async ({ input }) => {
      controlla(input.codice);
      if (!categoriaEdicola(input.categoria)) {
        throw new ORPCError("BAD_REQUEST", { message: "Categoria Edicola non riconosciuta." });
      }
      const adesso = new Date();
      const valori = {
        slug: input.slug,
        nome: input.nome,
        feedUrl: input.feedUrl,
        sitoUrl: input.sitoUrl,
        categoria: input.categoria,
        sottocategoria: input.sottocategoria,
        territorio: input.territorio,
        attiva: input.attiva ? 1 : 0,
        priorita: input.priorita,
        nota: input.nota,
        updatedAt: adesso,
      };
      await db
        .insert(schema.edicolaFonti)
        .values(valori)
        .onConflictDoUpdate({ target: schema.edicolaFonti.slug, set: valori });
      return { ok: true, fonte: input.slug };
    }),

  /** Scheda scritta dalla redazione: notizia TBH o evento con dati verificati. */
  salvaContenuto: base
    .input(
      auth.extend({
        id: z.number().int().positive().optional(),
        titolo: z.string().trim().min(3).max(300),
        categoria: z.string().trim().min(2).max(40),
        sottocategoria: testoOpz(60),
        territorio: testoOpz(40),
        fonte: testoOpz(120),
        fonteSito: testoOpz(300),
        urlOriginale: testoOpz(500),
        immagine: testoOpz(500),
        abstract: testoOpz(600),
        sintesiTbh: testoOpz(4000),
        dataEvento: testoOpz(10),
        oraEvento: testoOpz(40),
        luogoEvento: testoOpz(200),
        organizzatoreEvento: testoOpz(200),
        programmaEvento: testoOpz(4000),
        sitoEvento: testoOpz(500),
        mapsEvento: testoOpz(500),
        ticketEvento: testoOpz(500),
        tags: testoOpz(300),
        priorita: z.number().int().min(0).max(10),
        stato: z.enum(["pubblicato", "bozza", "nascosto"]),
      }),
    )
    .handler(async ({ input }) => {
      controlla(input.codice);
      if (!categoriaEdicola(input.categoria)) {
        throw new ORPCError("BAD_REQUEST", { message: "Categoria Edicola non riconosciuta." });
      }
      const adesso = new Date();
      const chiave = chiaveDedup(input.urlOriginale, input.titolo);

      const valori = {
        title: input.titolo,
        category: input.categoria,
        subcategory: input.sottocategoria,
        territory: input.territorio,
        source: input.fonte ?? "Redazione TBH",
        sourceUrl: input.fonteSito,
        originalUrl: input.urlOriginale,
        image: input.immagine,
        excerpt: input.abstract,
        sintesiTbh: input.sintesiTbh,
        eventDate: input.dataEvento,
        eventTime: input.oraEvento,
        eventPlace: input.luogoEvento,
        eventOrganizer: input.organizzatoreEvento,
        eventProgram: input.programmaEvento,
        eventSiteUrl: input.sitoEvento,
        eventMapsUrl: input.mapsEvento,
        eventTicketUrl: input.ticketEvento,
        tags: input.tags,
        priority: input.priorita,
        status: input.stato,
        origine: "redazione",
        updatedAt: adesso,
      };

      if (input.id) {
        await db
          .update(schema.edicolaContenuti)
          .set(valori)
          .where(eq(schema.edicolaContenuti.id, input.id));
        const riga = (
          await db
            .select()
            .from(schema.edicolaContenuti)
            .where(eq(schema.edicolaContenuti.id, input.id))
            .limit(1)
        )[0];
        return { ok: true, id: input.id, slug: riga?.slug ?? null };
      }

      const gemello = (
        await db
          .select({ id: schema.edicolaContenuti.id, slug: schema.edicolaContenuti.slug })
          .from(schema.edicolaContenuti)
          .where(eq(schema.edicolaContenuti.dedupKey, chiave))
          .limit(1)
      )[0];
      if (gemello) {
        await db
          .update(schema.edicolaContenuti)
          .set(valori)
          .where(eq(schema.edicolaContenuti.id, gemello.id));
        return { ok: true, id: gemello.id, slug: gemello.slug, giaPresente: true };
      }

      const slug = slugContenuto(input.titolo, chiave);
      const inserito = await db
        .insert(schema.edicolaContenuti)
        .values({ ...valori, slug, dedupKey: chiave, publishedAt: adesso })
        .returning({ id: schema.edicolaContenuti.id });
      return { ok: true, id: inserito[0]?.id ?? null, slug };
    }),

  /** Cambia stato o priorità di righe già presenti (anche in blocco). */
  aggiornaContenuti: base
    .input(
      auth.extend({
        id: z.array(z.number().int().positive()).min(1).max(200),
        stato: z.enum(["pubblicato", "bozza", "nascosto"]).optional(),
        priorita: z.number().int().min(0).max(10).optional(),
      }),
    )
    .handler(async ({ input }) => {
      controlla(input.codice);
      const set: Record<string, unknown> = { updatedAt: new Date() };
      if (input.stato) set.status = input.stato;
      if (typeof input.priorita === "number") set.priority = input.priorita;
      await db
        .update(schema.edicolaContenuti)
        .set(set)
        .where(inArray(schema.edicolaContenuti.id, input.id));
      return { ok: true, aggiornati: input.id.length };
    }),

  /** Elenco per il pannello, con i filtri del lavoro quotidiano. */
  contenuti: base
    .input(
      auth.extend({
        categoria: z.string().optional(),
        stato: z.string().optional(),
        cerca: z.string().optional(),
      }),
    )
    .handler(async ({ input }) => {
      controlla(input.codice);
      let righe = await db
        .select()
        .from(schema.edicolaContenuti)
        .orderBy(desc(schema.edicolaContenuti.createdAt))
        .limit(400);
      if (input.categoria) righe = righe.filter((r) => r.category === input.categoria);
      if (input.stato) righe = righe.filter((r) => r.status === input.stato);
      if (input.cerca) {
        const q = input.cerca.toLowerCase();
        righe = righe.filter((r) => r.title.toLowerCase().includes(q));
      }
      return { items: righe.map(pubblico), totale: righe.length };
    }),

  /** Oroscopo del giorno scritto a mano: quattro aree più il testo libero. */
  salvaOroscopo: base
    .input(
      auth.extend({
        segno: z.string().trim().min(3).max(30),
        giorno: z
          .string()
          .trim()
          .regex(/^\d{4}-\d{2}-\d{2}$/, "Usa il formato AAAA-MM-GG."),
        amore: testoOpz(600),
        lavoro: testoOpz(600),
        fortuna: testoOpz(600),
        benessere: testoOpz(600),
        testo: testoOpz(2000),
        autore: testoOpz(120),
      }),
    )
    .handler(async ({ input }) => {
      controlla(input.codice);
      if (!segnoDi(input.segno)) {
        throw new ORPCError("BAD_REQUEST", { message: "Segno non riconosciuto." });
      }
      const adesso = new Date();
      const gia = (
        await db
          .select({ id: schema.edicolaOroscopo.id })
          .from(schema.edicolaOroscopo)
          .where(
            and(
              eq(schema.edicolaOroscopo.segno, input.segno),
              eq(schema.edicolaOroscopo.giorno, input.giorno),
            ),
          )
          .limit(1)
      )[0];
      const valori = {
        segno: input.segno,
        giorno: input.giorno,
        amore: input.amore,
        lavoro: input.lavoro,
        fortuna: input.fortuna,
        benessere: input.benessere,
        testo: input.testo,
        autore: input.autore,
        updatedAt: adesso,
      };
      if (gia) {
        await db
          .update(schema.edicolaOroscopo)
          .set(valori)
          .where(eq(schema.edicolaOroscopo.id, gia.id));
        return { ok: true, id: gia.id };
      }
      const inserito = await db
        .insert(schema.edicolaOroscopo)
        .values(valori)
        .returning({ id: schema.edicolaOroscopo.id });
      return { ok: true, id: inserito[0]?.id ?? null };
    }),
};
