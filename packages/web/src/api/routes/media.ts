import { z } from "zod";
import { and, asc, desc, eq, inArray, like, ne, or, sql } from "drizzle-orm";
import { PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { base } from "../__core/app";
import { db } from "../database";
import * as schema from "../database/schema";
import { s3, BUCKET } from "../lib/s3";
import { indirizzoMedia, mediaServito } from "../lib/media-url";
import { CATEGORIE_LIBRERIA, categoriaDaSlot } from "../data/media-categorie";

/**
 * MEDIA MANAGER TBH — caricamento reale di immagini, loghi, documenti, indirizzi e link.
 *
 * Ordine di Claudio del 28/09/2026: «Implementare un Media Manager centralizzato utilizzabile
 * in tutte le aree amministrabili del sito. CARICA IMMAGINE | TRASCINA FILE | SOSTITUISCI |
 * RIMUOVI | ANTEPRIMA. Il sistema deve salvare fisicamente il file nello storage previsto dal
 * progetto e memorizzare nel database il riferimento corretto. […] Creare una Libreria Media TBH
 * centralizzata […] Evitare di obbligare l'amministratore a ricaricare più volte la stessa
 * immagine. […] Prima di eliminare un'immagine utilizzata in altre pagine, mostrare un avviso.»
 *
 * Come funziona, in concreto:
 * · il file va nell'archivio del progetto (Tigris/S3) e nel database resta il riferimento:
 *   niente immagini "incollate nella sessione", niente dipendenza dalla cache del browser;
 * · ogni materiale sta su uno SLOT (es. `influencity:copertina:2025-31`, `missCool:tappa:rimini`)
 *   e porta con sé titolo, descrizione, tag, indirizzo, mappa e link;
 * · un'immagine già in archivio si RIUSA su un altro slot senza ricaricarla (`riusa`);
 * · si SOSTITUISCE il file di un materiale senza perdere lo slot e i suoi dati (`sostituisci`);
 * · si ELIMINA solo dopo avviso: se lo stesso file è usato altrove la cancellazione va confermata;
 * · un materiale può stare in BOZZA: salvato, visibile solo in amministrazione, così una scheda
 *   si salva anche quando l'immagine definitiva non è ancora arrivata;
 * · i LOGHI ufficiali non vengono mai ottimizzati né ridimensionati: restano il file originale.
 *
 * Regola di accesso: chi carica deve avere il codice di allestimento (TBH_CODICE_ALLESTIMENTO).
 * La lettura dei materiali PUBBLICATI è pubblica (si vedono nelle pagine); bozze e archiviati
 * si vedono solo con il codice.
 */

const CODICE = () => (process.env.TBH_CODICE_ALLESTIMENTO ?? "").trim();

function controlla(codice: string) {
  const atteso = CODICE();
  if (!atteso) throw new Error("Codice di allestimento non configurato sul server.");
  if (codice.trim() !== atteso) throw new Error("Codice di allestimento errato.");
}

/** true = il codice è quello giusto (senza far fallire la chiamata: serve alle letture). */
function codiceValido(codice?: string | null) {
  const atteso = CODICE();
  return atteso.length > 0 && (codice ?? "").trim() === atteso;
}

/**
 * `pulsante` è stato aggiunto il 04/09/2026 su richiesta di Claudio: come per i monitor,
 * si incolla il contenuto e si vede subito. Un pulsante è logo (facoltativo) +
 * titolo per esteso + link di destinazione.
 */
const TIPI = [
  "logo",
  "immagine",
  "slide",
  "documento",
  "pulsante",
  /**
   * TIPO MEDIA più preciso — ordine di Claudio del 29/09/2026 (Priorità 2bis):
   * «non tutto deve avere un logo. Un corso, un kit beauty, uno stand o un DJ set hanno
   * bisogno soprattutto di una foto/immagine di copertina; il logo serve quando esiste
   * davvero un marchio».
   *
   * Servono a due cose concrete, non sono etichette decorative:
   * · il sito sa come inquadrare (un logo non si taglia mai, una foto sì);
   * · la scritta di attesa dice la verità su quel contenuto — «Foto del prodotto da
   *   caricare» invece di «Logo ufficiale da ricevere» su un kit beauty.
   * Per l'archivio restano immagini a tutti gli effetti: stessi formati, stessi controlli.
   */
  "prodotto",
  "locandina",
  "copertina",
  "thumbnail",
  "servizio",
] as const;

/** bozza = salvata ma non pubblica · pubblicato = visibile · archiviato = fuori dalle pagine. */
const STATI = ["bozza", "pubblicato", "archiviato"] as const;

/**
 * FORMATI AMMESSI — richiesta di Claudio: «Formati ammessi almeno: JPG, JPEG, PNG, WEBP».
 * Sono ammessi anche SVG e GIF perché molti loghi ufficiali arrivano in quei formati e non
 * vanno convertiti. I documenti (liberatorie, CV, PDF della rivista) hanno un elenco a parte.
 */
export const FORMATI_IMMAGINE = ["jpg", "jpeg", "png", "webp", "svg", "gif", "avif"] as const;
export const FORMATI_DOCUMENTO = ["pdf", "doc", "docx", "odt", "xls", "xlsx", "csv", "txt"] as const;

function estensione(nome: string) {
  const m = /\.([a-z0-9]+)$/i.exec(nome.trim());
  return m ? m[1]!.toLowerCase() : "";
}

/**
 * Controllo del formato: vale sia per il nome del file sia per il tipo MIME dichiarato.
 * Un formato non ammesso viene rifiutato subito, prima di occupare l'archivio.
 */
function validaFormato(filename: string, contentType: string, tipo: (typeof TIPI)[number]) {
  const ext = estensione(filename);
  const mime = (contentType || "").toLowerCase();
  const ammessi: readonly string[] =
    tipo === "documento" ? FORMATI_DOCUMENTO : FORMATI_IMMAGINE;
  const okExt = ext.length > 0 && ammessi.includes(ext);
  const okMime =
    tipo === "documento"
      ? mime.startsWith("application/") || mime.startsWith("text/")
      : mime.startsWith("image/");
  if (!okExt && !okMime) {
    throw new Error(
      tipo === "documento"
        ? `Formato non ammesso: sono accettati ${FORMATI_DOCUMENTO.join(", ").toUpperCase()}.`
        : `Formato non ammesso: sono accettati ${FORMATI_IMMAGINE.join(", ").toUpperCase()}.`,
    );
  }
}

/**
 * Indirizzo stabile del file: lo serve il sito su /api/media/<chiave>.
 * Verificato col browser il 16/09/2026: l'indirizzo diretto dell'archivio
 * risponde 403 (bucket non pubblico) e quello firmato scade dopo 7 giorni,
 * quindi le immagini caricate sparirebbero. Vedi lib/media-url.ts.
 */
function pubblico(chiave: string) {
  return indirizzoMedia(chiave);
}

const riga = z.object({
  id: z.number(),
  slot: z.string(),
  tipo: z.string(),
  titolo: z.string().nullable(),
  indirizzo: z.string().nullable(),
  mapsUrl: z.string().nullable(),
  linkUrl: z.string().nullable(),
  url: z.string(),
  /** Indirizzo del file originale, quando esiste una versione ottimizzata per il web. */
  urlOriginale: z.string().nullable(),
  descrizione: z.string().nullable(),
  tag: z.string().nullable(),
  stato: z.string(),
  ordine: z.number(),
  mime: z.string().nullable(),
  peso: z.number().nullable(),
  larghezza: z.number().nullable(),
  altezza: z.number().nullable(),
  /** Categoria della Libreria Media, ricavata dallo slot: non serve digitarla a mano. */
  categoria: z.string(),
  /** Chiave del file in archivio: serve alla libreria per riusare lo stesso file. */
  chiave: z.string(),
  /**
   * 1 = documento personale: non esce MAI dalle letture pubbliche, qualunque sia
   * lo stato (ordine del 28/09/2026: «non rendere pubblici automaticamente
   * documenti o allegati personali»). Si vede solo col codice di allestimento.
   */
  riservato: z.number(),
  /**
   * INQUADRATURA (29/09/2026, Priorità 2bis). Viaggia con l'immagine: la pagina non
   * decide più da sé come tagliare. `auto` = logo intero (contain), foto piena (cover).
   */
  adattamento: z.string(),
  focusX: z.number(),
  focusY: z.number(),
  zoom: z.number(),
});

/**
 * Un materiale può arrivare in due modi:
 * · file caricato nell'archivio del portale → in `chiave` c'è la chiave del file;
 * · immagine già online altrove → in `chiave` c'è direttamente l'indirizzo https://…
 *   (così Claudio può allestire incollando il link della foto, senza scaricarla prima);
 * · immagine già presente nel sito → in `chiave` c'è il percorso interno /brand/logo.png
 *   (le chiavi dell'archivio sono sempre `allestimento/…`, mai con lo slash iniziale,
 *    quindi non c'è modo di confonderle).
 *
 * In tutti e tre i casi «esterno» vuol dire: indirizzo già pronto, non è un file
 * del nostro archivio, quindi non va firmato né cancellato dal bucket.
 */
function esterno(chiave: string) {
  return /^https?:\/\//i.test(chiave) || chiave.startsWith("/");
}

function indirizzoDi(chiave: string | null | undefined) {
  const v = (chiave ?? "").trim();
  if (!v) return "";
  return esterno(v) ? (mediaServito(v) ?? v) : pubblico(v);
}

async function conUrl(rows: (typeof schema.media.$inferSelect)[]) {
  return rows.map((r) => ({
    id: r.id,
    slot: r.slot,
    tipo: r.tipo,
    titolo: r.titolo,
    indirizzo: r.indirizzo,
    mapsUrl: r.mapsUrl,
    linkUrl: r.linkUrl,
    // Un pulsante può non avere logo: in quel caso `chiave` è vuota e non
    // inventiamo nessun indirizzo (la pagina mostra le iniziali del titolo).
    url: indirizzoDi(r.chiave),
    urlOriginale: r.chiaveOriginale ? indirizzoDi(r.chiaveOriginale) : null,
    descrizione: r.descrizione,
    tag: r.tag,
    stato: r.stato,
    ordine: r.ordine,
    mime: r.mime,
    peso: r.peso,
    larghezza: r.larghezza,
    altezza: r.altezza,
    categoria: categoriaDaSlot(r.slot),
    chiave: r.chiave,
    riservato: r.riservato,
    adattamento: r.adattamento ?? "auto",
    focusX: r.focusX ?? 50,
    focusY: r.focusY ?? 50,
    zoom: r.zoom ?? 100,
  }));
}

/**
 * Cosa entra nelle pagine pubbliche: solo materiale PUBBLICATO e NON riservato.
 * Bozze e archiviati restano in amministrazione; i documenti personali di una
 * candidatura (riservato = 1) non escono mai, nemmeno se vengono "pubblicati"
 * per sbaglio: il filtro è sulla riga, non sul componente che la mostra.
 */
const soloPubblicati = and(
  eq(schema.media.stato, "pubblicato"),
  eq(schema.media.riservato, 0),
)!;

/** Ordine di comparsa: prima l'ordine deciso a mano, poi l'ordine di caricamento. */
const ordineSlot = [asc(schema.media.ordine), asc(schema.media.id)] as const;

/** Quante altre righe usano lo stesso file (serve per l'avviso prima di eliminare). */
async function altriUsi(chiave: string, id: number) {
  if (!chiave.trim()) return [];
  const rows = await db
    .select({ id: schema.media.id, slot: schema.media.slot, titolo: schema.media.titolo })
    .from(schema.media)
    .where(and(eq(schema.media.chiave, chiave), ne(schema.media.id, id)));
  return rows;
}

/** Il file può essere cancellato dall'archivio solo se nessun'altra riga lo usa. */
async function cancellaFileSeOrfano(chiave: string | null | undefined, idRiga: number) {
  const v = (chiave ?? "").trim();
  if (!v || esterno(v)) return;
  const usi = await altriUsi(v, idRiga);
  if (usi.length > 0) return;
  try {
    await s3.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: v }));
  } catch {
    /* il file può già non esserci: lo slot è comunque liberato */
  }
}

const datiComuni = {
  titolo: z.string().max(160).optional(),
  descrizione: z.string().max(600).optional(),
  tag: z.string().max(240).optional(),
  indirizzo: z.string().max(240).optional(),
  mapsUrl: z.string().max(600).optional(),
  linkUrl: z.string().max(600).optional(),
  stato: z.enum(STATI).default("pubblicato"),
  ordine: z.number().int().min(0).max(9999).optional(),
};

const datiFile = {
  mime: z.string().max(120).optional(),
  peso: z.number().int().min(0).optional(),
  larghezza: z.number().int().min(0).optional(),
  altezza: z.number().int().min(0).optional(),
  /** Originale conservato quando il browser ha caricato anche una versione ottimizzata. */
  chiaveOriginale: z.string().max(400).optional(),
};

export const media = {
  /** Il pannello è utilizzabile? (solo se il codice è configurato sul server) */
  stato: base.handler(async () => ({
    attivo: CODICE().length > 0,
    formatiImmagine: [...FORMATI_IMMAGINE],
    formatiDocumento: [...FORMATI_DOCUMENTO],
    categorie: CATEGORIE_LIBRERIA,
  })),

  /** Verifica del codice, per accendere il pannello di caricamento. */
  verifica: base.input(z.object({ codice: z.string() })).handler(async ({ input }) => {
    controlla(input.codice);
    return { ok: true as const };
  }),

  /**
   * Materiali di uno slot. Lettura pubblica: mostra solo il materiale PUBBLICATO.
   * Con il codice di allestimento arrivano anche le bozze, così il pannello le vede.
   */
  perSlot: base
    .input(z.object({ slot: z.string(), codice: z.string().optional() }))
    .output(z.object({ items: z.array(riga) }))
    .handler(async ({ input }) => {
      const admin = codiceValido(input.codice);
      const rows = await db
        .select()
        .from(schema.media)
        .where(
          admin
            ? eq(schema.media.slot, input.slot)
            : and(eq(schema.media.slot, input.slot), soloPubblicati),
        )
        .orderBy(...ordineSlot);
      return { items: await conUrl(rows) };
    }),

  /**
   * Tutti i materiali caricati (per il pannello di allestimento). I documenti
   * riservati delle candidature restano fuori: si leggono solo dagli elenchi
   * che chiedono il codice (perSlot, perPrefisso, libreria).
   */
  elenco: base.output(z.object({ items: z.array(riga) })).handler(async () => {
    const rows = await db
      .select()
      .from(schema.media)
      .where(eq(schema.media.riservato, 0))
      .orderBy(desc(schema.media.id))
      .limit(500);
    return { items: await conUrl(rows) };
  }),

  /**
   * Materiali di TUTTI gli slot che iniziano per un certo prefisso (pubblico).
   * Serve per l'edicola del magazine: con una sola chiamata si prendono le copertine
   * di tutti i numeri (`influencity:copertina:`), senza scaricare anche le pagine.
   */
  perPrefisso: base
    .input(z.object({ prefisso: z.string().min(1), codice: z.string().optional() }))
    .output(z.object({ items: z.array(riga) }))
    .handler(async ({ input }) => {
      const admin = codiceValido(input.codice);
      const filtro = like(schema.media.slot, `${input.prefisso}%`);
      const rows = await db
        .select()
        .from(schema.media)
        .where(admin ? filtro : and(filtro, soloPubblicati))
        .orderBy(...ordineSlot)
        .limit(1000);
      return { items: await conUrl(rows) };
    }),

  /**
   * Quanti materiali ci sono su ogni slot con un certo prefisso (pubblico).
   * Serve per scrivere «12 pagine caricate» sulla scheda del numero senza
   * scaricare le immagini: si conta e basta.
   */
  conteggi: base
    .input(z.object({ prefisso: z.string().min(1), codice: z.string().optional() }))
    .output(z.object({ items: z.array(z.object({ slot: z.string(), n: z.number() })) }))
    .handler(async ({ input }) => {
      const admin = codiceValido(input.codice);
      const filtro = like(schema.media.slot, `${input.prefisso}%`);
      const rows = await db
        .select({ slot: schema.media.slot, n: sql<number>`count(*)` })
        .from(schema.media)
        .where(admin ? filtro : and(filtro, soloPubblicati))
        .groupBy(schema.media.slot);
      return { items: rows.map((r) => ({ slot: r.slot, n: Number(r.n) })) };
    }),

  /**
   * LIBRERIA MEDIA TBH — l'archivio unico di tutto il sito, ricercabile.
   * Ogni riga dice anche su quanti altri slot è usato lo stesso file: da lì nasce
   * l'avviso prima di eliminare e la possibilità di riusare invece di ricaricare.
   */
  libreria: base
    .input(
      z.object({
        codice: z.string().optional(),
        /** Ricerca libera su titolo, descrizione, tag, slot e nome del file. */
        q: z.string().max(120).optional(),
        categoria: z.string().max(60).optional(),
        tipo: z.enum(TIPI).optional(),
        stato: z.enum(STATI).optional(),
        limite: z.number().int().min(1).max(500).default(120),
        offset: z.number().int().min(0).default(0),
      }),
    )
    .handler(async ({ input }) => {
      const admin = codiceValido(input.codice);
      const condizioni = [];
      if (!admin) condizioni.push(soloPubblicati);
      if (input.stato) condizioni.push(eq(schema.media.stato, input.stato));
      if (input.tipo) condizioni.push(eq(schema.media.tipo, input.tipo));
      const q = (input.q ?? "").trim();
      if (q) {
        const p = `%${q}%`;
        condizioni.push(
          or(
            like(schema.media.titolo, p),
            like(schema.media.descrizione, p),
            like(schema.media.tag, p),
            like(schema.media.slot, p),
            like(schema.media.chiave, p),
          )!,
        );
      }
      const where = condizioni.length > 0 ? and(...condizioni) : undefined;

      const rows = await db
        .select()
        .from(schema.media)
        .where(where)
        .orderBy(desc(schema.media.id))
        .limit(500);

      // La categoria si ricava dallo slot: si filtra qui, dopo la lettura.
      const conCategoria = await conUrl(rows);
      const filtrate = input.categoria
        ? conCategoria.filter((r) => r.categoria === input.categoria)
        : conCategoria;

      // Quante righe usano lo stesso file: serve per «usata in 3 punti del sito».
      const chiavi = [...new Set(filtrate.map((r) => r.chiave).filter(Boolean))];
      const usi = new Map<string, number>();
      if (chiavi.length > 0) {
        const conta = await db
          .select({ chiave: schema.media.chiave, n: sql<number>`count(*)` })
          .from(schema.media)
          .where(inArray(schema.media.chiave, chiavi))
          .groupBy(schema.media.chiave);
        for (const r of conta) usi.set(r.chiave, Number(r.n));
      }

      const conteggioCategorie = CATEGORIE_LIBRERIA.map((c) => ({
        ...c,
        n: conCategoria.filter((r) => r.categoria === c.slug).length,
      }));

      return {
        items: filtrate.slice(input.offset, input.offset + input.limite).map((r) => ({
          ...r,
          usi: usi.get(r.chiave) ?? 1,
        })),
        totale: filtrate.length,
        categorie: conteggioCategorie,
        bozze: conCategoria.filter((r) => r.stato === "bozza").length,
        amministrazione: admin,
      };
    }),

  /** Dove è usato un file: l'elenco degli slot, per l'avviso prima di eliminare. */
  usi: base
    .input(z.object({ chiave: z.string().min(1) }))
    .handler(async ({ input }) => {
      const rows = await db
        .select({ id: schema.media.id, slot: schema.media.slot, titolo: schema.media.titolo })
        .from(schema.media)
        .where(eq(schema.media.chiave, input.chiave));
      return { items: rows, totale: rows.length };
    }),

  /** Passo 1: link firmato per caricare il file direttamente su Tigris. */
  presign: base
    .input(
      z.object({
        codice: z.string(),
        filename: z.string(),
        contentType: z.string(),
        slot: z.string(),
        tipo: z.enum(TIPI).default("immagine"),
        /** true = è la copia originale di un'immagine ottimizzata per il web. */
        originale: z.boolean().default(false),
      }),
    )
    .handler(async ({ input }) => {
      controlla(input.codice);
      validaFormato(input.filename, input.contentType, input.tipo);
      const pulito = input.filename.replace(/[^a-zA-Z0-9._-]+/g, "-").slice(-80);
      const cartella = input.slot.replace(/[^a-zA-Z0-9:_-]+/g, "-").replace(/:/g, "/");
      const chiave = `allestimento/${cartella}/${input.originale ? "originale-" : ""}${Date.now()}-${pulito}`;
      const url = await getSignedUrl(
        s3,
        new PutObjectCommand({ Bucket: BUCKET, Key: chiave, ContentType: input.contentType }),
        { expiresIn: 900 },
      );
      return { url, chiave };
    }),

  /** Passo 2: registra il file caricato sullo slot, con titolo/indirizzo/mappa/link. */
  salva: base
    .input(
      z.object({
        codice: z.string(),
        slot: z.string(),
        chiave: z.string(),
        tipo: z.enum(TIPI).default("immagine"),
        ...datiComuni,
        ...datiFile,
      }),
    )
    .handler(async ({ input }) => {
      controlla(input.codice);
      const [row] = await db
        .insert(schema.media)
        .values({
          slot: input.slot,
          chiave: input.chiave,
          chiaveOriginale: input.chiaveOriginale?.trim() || null,
          tipo: input.tipo,
          titolo: input.titolo?.trim() || null,
          descrizione: input.descrizione?.trim() || null,
          tag: input.tag?.trim() || null,
          indirizzo: input.indirizzo?.trim() || null,
          mapsUrl: input.mapsUrl?.trim() || null,
          linkUrl: input.linkUrl?.trim() || null,
          stato: input.stato,
          ordine: input.ordine ?? 0,
          mime: input.mime?.trim() || null,
          peso: input.peso ?? null,
          larghezza: input.larghezza ?? null,
          altezza: input.altezza ?? null,
        })
        .returning();
      // Indirizzo definitivo, così i pannelli (monitor, prodotti) lo incollano subito.
      return { id: row.id, url: indirizzoDi(input.chiave), stato: row.stato };
    }),

  /**
   * SOSTITUISCI — cambia il file di un materiale già presente, senza toccare lo slot,
   * il titolo, i link e la posizione. Il vecchio file viene cancellato dall'archivio solo
   * se non è usato da nessun'altra parte del sito.
   */
  sostituisci: base
    .input(
      z.object({
        codice: z.string(),
        id: z.number(),
        chiave: z.string().min(1),
        ...datiFile,
      }),
    )
    .handler(async ({ input }) => {
      controlla(input.codice);
      const [row] = await db.select().from(schema.media).where(eq(schema.media.id, input.id));
      if (!row) throw new Error("Materiale non trovato: forse è già stato rimosso.");
      const vecchia = row.chiave;
      const vecchiaOriginale = row.chiaveOriginale;
      await db
        .update(schema.media)
        .set({
          chiave: input.chiave,
          chiaveOriginale: input.chiaveOriginale?.trim() || null,
          mime: input.mime?.trim() || null,
          peso: input.peso ?? null,
          larghezza: input.larghezza ?? null,
          altezza: input.altezza ?? null,
        })
        .where(eq(schema.media.id, input.id));
      if (vecchia !== input.chiave) await cancellaFileSeOrfano(vecchia, input.id);
      if (vecchiaOriginale && vecchiaOriginale !== (input.chiaveOriginale ?? null)) {
        await cancellaFileSeOrfano(vecchiaOriginale, input.id);
      }
      return { ok: true as const, id: input.id, url: indirizzoDi(input.chiave) };
    }),

  /**
   * RIUSA — mette un'immagine già in archivio su un altro slot senza ricaricarla.
   * È la risposta all'ordine «Evitare di obbligare l'amministratore a ricaricare più volte
   * la stessa immagine»: il file resta uno, i punti del sito che lo mostrano sono tanti.
   */
  riusa: base
    .input(
      z.object({
        codice: z.string(),
        /** Materiale di partenza, preso dalla Libreria Media. */
        id: z.number(),
        slot: z.string().min(1),
        titolo: z.string().max(160).optional(),
        linkUrl: z.string().max(600).optional(),
        stato: z.enum(STATI).default("pubblicato"),
        ordine: z.number().int().min(0).max(9999).optional(),
      }),
    )
    .handler(async ({ input }) => {
      controlla(input.codice);
      const [origine] = await db.select().from(schema.media).where(eq(schema.media.id, input.id));
      if (!origine) throw new Error("Immagine non trovata in libreria.");
      // Un documento personale non si riusa su uno slot del sito: resta dov'è.
      if (origine.riservato === 1) {
        throw new Error(
          "Questo è un documento riservato di una candidatura: non può essere messo in una pagina.",
        );
      }
      const [row] = await db
        .insert(schema.media)
        .values({
          slot: input.slot,
          chiave: origine.chiave,
          chiaveOriginale: origine.chiaveOriginale,
          tipo: origine.tipo,
          titolo: input.titolo?.trim() || origine.titolo,
          descrizione: origine.descrizione,
          tag: origine.tag,
          indirizzo: origine.indirizzo,
          mapsUrl: origine.mapsUrl,
          linkUrl: input.linkUrl?.trim() || origine.linkUrl,
          stato: input.stato,
          ordine: input.ordine ?? 0,
          mime: origine.mime,
          peso: origine.peso,
          larghezza: origine.larghezza,
          altezza: origine.altezza,
        })
        .returning();
      return { id: row.id, url: indirizzoDi(row.chiave) };
    }),

  /**
   * Alternativa al caricamento: l'immagine è già online e se ne incolla il link.
   * Non scarichiamo nulla: la pagina mostra direttamente quell'indirizzo, quindi se
   * la fonte toglie il file l'immagine sparisce. Per i materiali definitivi meglio caricare.
   */
  salvaLink: base
    .input(
      z.object({
        codice: z.string(),
        slot: z.string(),
        url: z.string().max(1000),
        tipo: z.enum(TIPI).default("immagine"),
        ...datiComuni,
      }),
    )
    .handler(async ({ input }) => {
      controlla(input.codice);
      const url = input.url.trim();
      if (!/^https:\/\//i.test(url)) {
        throw new Error("Il link deve iniziare con https:// — incolla l'indirizzo dell'immagine.");
      }
      const [row] = await db
        .insert(schema.media)
        .values({
          slot: input.slot,
          chiave: url,
          tipo: input.tipo,
          titolo: input.titolo?.trim() || null,
          descrizione: input.descrizione?.trim() || null,
          tag: input.tag?.trim() || null,
          indirizzo: input.indirizzo?.trim() || null,
          mapsUrl: input.mapsUrl?.trim() || null,
          linkUrl: input.linkUrl?.trim() || null,
          stato: input.stato,
          ordine: input.ordine ?? 0,
        })
        .returning();
      // Indirizzo definitivo, così i pannelli (monitor, prodotti) lo incollano subito.
      return { id: row.id, url: indirizzoDi(input.url) };
    }),

  /**
   * PULSANTE — richiesta di Claudio del 04/09/2026: «come per i monitor mi fai la
   * possibilità di aggiungere URL … crea la stessa cosa per aggiungere foto, loghi,
   * link, pulsanti». Un pulsante è: logo (facoltativo) + titolo per esteso + link.
   * Si salva nel portale e si vede subito nella pagina, per tutti.
   */
  salvaPulsante: base
    .input(
      z.object({
        codice: z.string(),
        slot: z.string(),
        titolo: z.string().min(1).max(160),
        linkUrl: z.string().min(1).max(600),
        logoUrl: z.string().max(1000).optional(),
        stato: z.enum(STATI).default("pubblicato"),
      }),
    )
    .handler(async ({ input }) => {
      controlla(input.codice);
      const link = input.linkUrl.trim();
      // Ammessi sia i link esterni (https://…) sia le pagine interne del portale (/shop).
      if (!/^https?:\/\//i.test(link) && !link.startsWith("/")) {
        throw new Error(
          "Il link deve iniziare con https:// oppure con / se è una pagina del portale.",
        );
      }
      const logo = (input.logoUrl ?? "").trim();
      if (logo && !/^https?:\/\//i.test(logo) && !logo.startsWith("/")) {
        throw new Error("Il link del logo deve iniziare con https:// oppure con /");
      }
      const [row] = await db
        .insert(schema.media)
        .values({
          slot: input.slot,
          chiave: logo,
          tipo: "pulsante",
          titolo: input.titolo.trim(),
          indirizzo: null,
          mapsUrl: null,
          linkUrl: link,
          stato: input.stato,
        })
        .returning();
      return { id: row.id };
    }),

  /** Aggiorna i dati di un materiale già caricato (senza ricaricare il file). */
  aggiorna: base
    .input(
      z.object({
        codice: z.string(),
        id: z.number(),
        titolo: z.string().max(160).optional(),
        descrizione: z.string().max(600).optional(),
        tag: z.string().max(240).optional(),
        indirizzo: z.string().max(240).optional(),
        mapsUrl: z.string().max(600).optional(),
        linkUrl: z.string().max(600).optional(),
        tipo: z.enum(TIPI).optional(),
        slot: z.string().max(200).optional(),
      }),
    )
    .handler(async ({ input }) => {
      controlla(input.codice);
      await db
        .update(schema.media)
        .set({
          ...(input.tipo ? { tipo: input.tipo } : {}),
          ...(input.slot ? { slot: input.slot } : {}),
          titolo: input.titolo?.trim() || null,
          descrizione: input.descrizione?.trim() || null,
          tag: input.tag?.trim() || null,
          indirizzo: input.indirizzo?.trim() || null,
          mapsUrl: input.mapsUrl?.trim() || null,
          linkUrl: input.linkUrl?.trim() || null,
        })
        .where(eq(schema.media.id, input.id));
      return { ok: true as const };
    }),

  /**
   * INQUADRATURA — ordine di Claudio del 29/09/2026 (Priorità 2bis):
   * «Permettere: RITAGLIA · CENTRA · ZOOM · FOCAL POINT · SOSTITUISCI · RIMUOVI».
   *
   * È un comando a parte e non `aggiorna` per un motivo pratico: qui si salva solo come
   * l'immagine va inquadrata, senza toccare titolo, descrizione, tag, indirizzo o link.
   * Vale la regola di Claudio: «NON modificare titolo, prezzo, descrizione, URL o
   * checkout esistenti durante l'aggiunta delle immagini».
   */
  inquadratura: base
    .input(
      z.object({
        codice: z.string(),
        id: z.number(),
        /** auto = logo intero, foto piena. Mai `fill`: deformare è vietato. */
        adattamento: z.enum(["auto", "cover", "contain"]).optional(),
        focusX: z.number().int().min(0).max(100).optional(),
        focusY: z.number().int().min(0).max(100).optional(),
        zoom: z.number().int().min(100).max(300).optional(),
      }),
    )
    .handler(async ({ input }) => {
      controlla(input.codice);
      await db
        .update(schema.media)
        .set({
          ...(input.adattamento ? { adattamento: input.adattamento } : {}),
          ...(input.focusX !== undefined ? { focusX: input.focusX } : {}),
          ...(input.focusY !== undefined ? { focusY: input.focusY } : {}),
          ...(input.zoom !== undefined ? { zoom: input.zoom } : {}),
        })
        .where(eq(schema.media.id, input.id));
      return { ok: true as const };
    }),

  /**
   * BOZZA → PUBBLICATO → ARCHIVIATO. Un materiale nasce dove decide chi carica:
   * in bozza resta salvato nel portale ma non compare nelle pagine pubbliche.
   */
  pubblica: base
    .input(z.object({ codice: z.string(), id: z.number(), stato: z.enum(STATI) }))
    .handler(async ({ input }) => {
      controlla(input.codice);
      await db
        .update(schema.media)
        .set({ stato: input.stato })
        .where(eq(schema.media.id, input.id));
      return { ok: true as const, stato: input.stato };
    }),

  /** Riordino di una gallery: si passano gli id nell'ordine in cui devono comparire. */
  riordina: base
    .input(z.object({ codice: z.string(), ids: z.array(z.number()).min(1).max(500) }))
    .handler(async ({ input }) => {
      controlla(input.codice);
      let i = 0;
      for (const id of input.ids) {
        i += 1;
        await db.update(schema.media).set({ ordine: i }).where(eq(schema.media.id, id));
      }
      return { ok: true as const, n: input.ids.length };
    }),

  /**
   * Rimuove il materiale dallo slot. Se lo stesso file è usato anche altrove la
   * cancellazione non parte: torna l'elenco dei punti del sito che lo usano, così il
   * pannello mostra l'avviso e chiede conferma (`forza: true`).
   */
  elimina: base
    .input(z.object({ codice: z.string(), id: z.number(), forza: z.boolean().default(false) }))
    .handler(async ({ input }) => {
      controlla(input.codice);
      const [row] = await db.select().from(schema.media).where(eq(schema.media.id, input.id));
      if (!row) return { ok: true as const, usato: [] as { id: number; slot: string }[] };

      const usi = await altriUsi(row.chiave, row.id);
      if (usi.length > 0 && !input.forza) {
        return {
          ok: false as const,
          usato: usi.map((u) => ({ id: u.id, slot: u.slot })),
        };
      }

      await db.delete(schema.media).where(eq(schema.media.id, input.id));
      await cancellaFileSeOrfano(row.chiave, row.id);
      if (row.chiaveOriginale) await cancellaFileSeOrfano(row.chiaveOriginale, row.id);
      return { ok: true as const, usato: [] as { id: number; slot: string }[] };
    }),

  /**
   * Sposta su uno slot definitivo i materiali caricati su uno slot di bozza.
   * Serve alle schede nuove: si carica la copertina PRIMA che il numero esista
   * (slot `bozza:<chiave temporanea>`), poi al salvataggio i file seguono la scheda.
   */
  spostaSlot: base
    .input(
      z.object({
        codice: z.string(),
        da: z.string().min(1),
        a: z.string().min(1),
        pubblica: z.boolean().default(false),
      }),
    )
    .handler(async ({ input }) => {
      controlla(input.codice);
      const rows = await db.select().from(schema.media).where(eq(schema.media.slot, input.da));
      for (const r of rows) {
        await db
          .update(schema.media)
          .set({ slot: input.a, ...(input.pubblica ? { stato: "pubblicato" } : {}) })
          .where(eq(schema.media.id, r.id));
      }
      return { ok: true as const, n: rows.length };
    }),
};
