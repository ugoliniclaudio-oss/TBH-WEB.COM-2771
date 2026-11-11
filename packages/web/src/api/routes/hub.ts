import { z } from "zod";
import { and, desc, eq } from "drizzle-orm";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { base } from "../__core/app";
import { db } from "../database";
import * as schema from "../database/schema";
import { s3, BUCKET } from "../lib/s3";

/**
 * TBH CONTENT HUB — PRE-ALLESTIMENTO (ordine di Claudio del 06/09/2026).
 *
 * Flusso: SORGENTE → PRE-ALLESTIMENTO → CONTROLLO/ANTEPRIMA → RECORD CANONICO.
 * Un contenuto si carica una volta sola e da lì alimenta home, canale e vetrina.
 *
 * Regola non negoziabile: NIENTE PUBBLICAZIONE AUTOMATICA. Un record nasce sempre
 * in stato «bozza» e diventa visibile solo quando qualcuno lo porta a «attivo» a mano.
 *
 * Accesso: come il pannello di allestimento, con il codice TBH_CODICE_ALLESTIMENTO.
 * Qui però anche la LETTURA è protetta: sono materiali non ancora pubblicati.
 */

const CODICE = () => (process.env.TBH_CODICE_ALLESTIMENTO ?? "").trim();

function controlla(codice: string) {
  const atteso = CODICE();
  if (!atteso) throw new Error("Codice di allestimento non configurato sul server.");
  if (codice.trim() !== atteso) throw new Error("Codice di allestimento errato.");
}

const STATI = ["bozza", "allestimento", "attivo", "nascosto"] as const;
const TIPI = [
  "altro",
  "societa",
  "attivita",
  "servizio",
  "prodotto",
  "evento",
  "squadra",
  "luogo",
  "media",
  "documento",
] as const;

/**
 * Un indirizzo valido è esterno in https:// oppure una pagina interna (/shop).
 * http:// senza «s» viene rifiutato: i browser lo bloccano e diventerebbe un bottone morto.
 */
function indirizzoValido(v: string) {
  return /^https:\/\//i.test(v) || v.startsWith("/");
}

function pulisci(v: string | undefined | null, max: number) {
  const s = (v ?? "").trim();
  if (!s) return null;
  return s.slice(0, max);
}

function controllaIndirizzo(v: string | null, etichetta: string) {
  if (v && !indirizzoValido(v)) {
    throw new Error(`${etichetta}: l'indirizzo deve iniziare con https:// oppure con /`);
  }
  return v;
}

/** Chiave stabile del record canonico, ricavata dal titolo. */
function slugDa(titolo: string) {
  return (
    titolo
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 70) || "contenuto"
  );
}

const pulsante = z.object({ testo: z.string().min(1).max(80), url: z.string().min(1).max(600) });

const riga = z.object({
  id: z.number(),
  titolo: z.string(),
  slug: z.string(),
  tipo: z.string(),
  canale: z.string().nullable(),
  categoria: z.string().nullable(),
  urlPagina: z.string().nullable(),
  sitoUrl: z.string().nullable(),
  logoUrl: z.string().nullable(),
  immagineUrl: z.string().nullable(),
  videoUrl: z.string().nullable(),
  documentoUrl: z.string().nullable(),
  documentoNome: z.string().nullable(),
  pulsanti: z.array(pulsante),
  testoBreve: z.string().nullable(),
  note: z.string().nullable(),
  appartenenza: z.array(z.string()),
  stato: z.string(),
  sorgente: z.string(),
});

function leggiLista(v: string | null): string[] {
  if (!v) return [];
  try {
    const p = JSON.parse(v);
    return Array.isArray(p) ? p.filter((x) => typeof x === "string") : [];
  } catch {
    return [];
  }
}

function leggiPulsanti(v: string | null): { testo: string; url: string }[] {
  if (!v) return [];
  try {
    const p = JSON.parse(v);
    if (!Array.isArray(p)) return [];
    return p
      .filter((x) => x && typeof x.testo === "string" && typeof x.url === "string")
      .map((x) => ({ testo: String(x.testo), url: String(x.url) }));
  } catch {
    return [];
  }
}

function inRiga(r: typeof schema.contenuti.$inferSelect) {
  return {
    id: r.id,
    titolo: r.titolo,
    slug: r.slug,
    tipo: r.tipo,
    canale: r.canale,
    categoria: r.categoria,
    urlPagina: r.urlPagina,
    sitoUrl: r.sitoUrl,
    logoUrl: r.logoUrl,
    immagineUrl: r.immagineUrl,
    videoUrl: r.videoUrl,
    documentoUrl: r.documentoUrl,
    documentoNome: r.documentoNome,
    pulsanti: leggiPulsanti(r.pulsanti),
    testoBreve: r.testoBreve,
    note: r.note,
    appartenenza: leggiLista(r.appartenenza),
    stato: r.stato,
    sorgente: r.sorgente,
  };
}

const campi = {
  // .trim() dentro lo schema: un titolo di soli spazi non è un titolo.
  titolo: z.string().trim().min(1).max(160),
  tipo: z.enum(TIPI).optional(),
  canale: z.string().max(60).optional(),
  categoria: z.string().max(60).optional(),
  urlPagina: z.string().max(600).optional(),
  sitoUrl: z.string().max(600).optional(),
  logoUrl: z.string().max(1000).optional(),
  immagineUrl: z.string().max(1000).optional(),
  videoUrl: z.string().max(1000).optional(),
  documentoUrl: z.string().max(1000).optional(),
  documentoNome: z.string().max(160).optional(),
  pulsanti: z.array(pulsante).max(3).optional(),
  testoBreve: z.string().max(600).optional(),
  note: z.string().max(1000).optional(),
  appartenenza: z.array(z.string().max(30)).max(6).optional(),
  stato: z.enum(STATI).optional(),
  sorgente: z.string().max(30).optional(),
};

export const hub = {
  /** Il Content Hub è utilizzabile? (solo se il codice è configurato sul server) */
  stato: base.handler(async () => ({ attivo: CODICE().length > 0 })),

  /**
   * Elenco dei record. Protetto: sono contenuti non ancora pubblicati.
   * Filtri facoltativi per stato e per canale.
   */
  elenco: base
    .input(
      z.object({
        codice: z.string(),
        stato: z.enum(STATI).optional(),
        canale: z.string().max(60).optional(),
      }),
    )
    .output(z.object({ items: z.array(riga), totale: z.number() }))
    .handler(async ({ input }) => {
      controlla(input.codice);
      const filtri = [
        ...(input.stato ? [eq(schema.contenuti.stato, input.stato)] : []),
        ...(input.canale ? [eq(schema.contenuti.canale, input.canale)] : []),
      ];
      const q = db.select().from(schema.contenuti);
      const rows = await (filtri.length ? q.where(and(...filtri)) : q)
        .orderBy(desc(schema.contenuti.id))
        .limit(400);
      return { items: rows.map(inRiga), totale: rows.length };
    }),

  /** Un singolo record, per riaprirlo in modifica o per l'anteprima. */
  dettaglio: base
    .input(z.object({ codice: z.string(), id: z.number() }))
    .output(z.object({ item: riga.nullable() }))
    .handler(async ({ input }) => {
      controlla(input.codice);
      const [row] = await db
        .select()
        .from(schema.contenuti)
        .where(eq(schema.contenuti.id, input.id));
      return { item: row ? inRiga(row) : null };
    }),

  /**
   * Salvataggio del record canonico: se arriva `id` aggiorna, altrimenti crea.
   * Senza `stato` esplicito il record nasce in BOZZA — mai pubblicato da solo.
   */
  salva: base
    .input(z.object({ codice: z.string(), id: z.number().optional(), ...campi }))
    .output(z.object({ id: z.number(), slug: z.string(), stato: z.string() }))
    .handler(async ({ input }) => {
      controlla(input.codice);

      const urlPagina = controllaIndirizzo(pulisci(input.urlPagina, 600), "Pagina");
      const sitoUrl = controllaIndirizzo(pulisci(input.sitoUrl, 600), "Sito");
      const logoUrl = controllaIndirizzo(pulisci(input.logoUrl, 1000), "Logo");
      const immagineUrl = controllaIndirizzo(pulisci(input.immagineUrl, 1000), "Immagine");
      const videoUrl = controllaIndirizzo(pulisci(input.videoUrl, 1000), "Video");
      const documentoUrl = controllaIndirizzo(pulisci(input.documentoUrl, 1000), "Documento");

      const pulsanti = (input.pulsanti ?? [])
        .map((p) => ({ testo: p.testo.trim(), url: p.url.trim() }))
        .filter((p) => p.testo && p.url);
      for (const p of pulsanti) {
        if (!indirizzoValido(p.url)) {
          throw new Error(
            `Pulsante «${p.testo}»: l'indirizzo deve iniziare con https:// oppure con /`,
          );
        }
      }

      const valori = {
        titolo: input.titolo.trim(),
        tipo: input.tipo ?? "altro",
        canale: pulisci(input.canale, 60),
        categoria: pulisci(input.categoria, 60),
        urlPagina,
        sitoUrl,
        logoUrl,
        immagineUrl,
        videoUrl,
        documentoUrl,
        documentoNome: pulisci(input.documentoNome, 160),
        pulsanti: pulsanti.length ? JSON.stringify(pulsanti) : null,
        testoBreve: pulisci(input.testoBreve, 600),
        note: pulisci(input.note, 1000),
        appartenenza: input.appartenenza?.length ? JSON.stringify(input.appartenenza) : null,
        updatedAt: new Date(),
      };

      if (input.id) {
        const [row] = await db
          .update(schema.contenuti)
          .set({ ...valori, ...(input.stato ? { stato: input.stato } : {}) })
          .where(eq(schema.contenuti.id, input.id))
          .returning();
        if (!row) throw new Error("Contenuto non trovato.");
        return { id: row.id, slug: row.slug, stato: row.stato };
      }

      const [row] = await db
        .insert(schema.contenuti)
        .values({
          ...valori,
          slug: slugDa(input.titolo),
          // Niente pubblicazione automatica: si nasce in bozza.
          stato: input.stato ?? "bozza",
          sorgente: pulisci(input.sorgente, 30) ?? "pannello",
        })
        .returning();
      return { id: row.id, slug: row.slug, stato: row.stato };
    }),

  /** Passaggio di stato a mano: è il momento del CONTROLLO prima della pubblicazione. */
  cambiaStato: base
    .input(z.object({ codice: z.string(), id: z.number(), stato: z.enum(STATI) }))
    .output(z.object({ ok: z.literal(true), stato: z.string() }))
    .handler(async ({ input }) => {
      controlla(input.codice);
      await db
        .update(schema.contenuti)
        .set({ stato: input.stato, updatedAt: new Date() })
        .where(eq(schema.contenuti.id, input.id));
      return { ok: true as const, stato: input.stato };
    }),

  elimina: base
    .input(z.object({ codice: z.string(), id: z.number() }))
    .output(z.object({ ok: z.literal(true) }))
    .handler(async ({ input }) => {
      controlla(input.codice);
      await db.delete(schema.contenuti).where(eq(schema.contenuti.id, input.id));
      return { ok: true as const };
    }),

  /**
   * Passo 1 del caricamento: link firmato per mandare il file (logo, foto, PDF, video)
   * direttamente nell'archivio del portale. Il file finisce in hub/<cartella>/…
   */
  presign: base
    .input(
      z.object({
        codice: z.string(),
        filename: z.string().min(1).max(200),
        contentType: z.string().max(160),
        cartella: z.string().max(80).optional(),
      }),
    )
    .output(z.object({ url: z.string(), indirizzo: z.string() }))
    .handler(async ({ input }) => {
      controlla(input.codice);
      const pulito = input.filename.replace(/[^a-zA-Z0-9._-]+/g, "-").slice(-80);
      const cartella = (input.cartella ?? "nuovo").replace(/[^a-zA-Z0-9_-]+/g, "-").toLowerCase();
      const chiave = `hub/${cartella}/${Date.now()}-${pulito}`;
      const url = await getSignedUrl(
        s3,
        new PutObjectCommand({
          Bucket: BUCKET,
          Key: chiave,
          ContentType: input.contentType || "application/octet-stream",
        }),
        { expiresIn: 900 },
      );
      const endpoint = (process.env.S3_ENDPOINT ?? "").replace(/\/+$/, "");
      return { url, indirizzo: `${endpoint}/${BUCKET}/${chiave}` };
    }),

  /**
   * IMPORTA DA URL — funziona anche con i link di condivisione di Drive, OneDrive e
   * Dropbox: si incolla l'indirizzo e il Hub prepara la scheda. I selettori nativi dei
   * tre servizi restano «in allestimento» finché non arrivano le chiavi API.
   */
  importaUrl: base
    .input(z.object({ codice: z.string(), url: z.string().min(1).max(1000) }))
    .output(
      z.object({
        url: z.string(),
        dominio: z.string(),
        genere: z.string(),
        titoloProposto: z.string(),
      }),
    )
    .handler(async ({ input }) => {
      controlla(input.codice);
      const url = input.url.trim();
      if (!/^https:\/\//i.test(url)) {
        throw new Error("L'indirizzo deve iniziare con https://");
      }
      let dominio = "";
      let percorso = "";
      try {
        const u = new URL(url);
        dominio = u.hostname.replace(/^www\./, "");
        percorso = u.pathname;
      } catch {
        throw new Error("Indirizzo non valido.");
      }
      const genere = /youtube\.com|youtu\.be|vimeo\.com|\.mp4($|\?)/i.test(url)
        ? "video"
        : /\.(pdf|docx?|xlsx?|pptx?)($|\?)/i.test(url)
          ? "documento"
          : /\.(png|jpe?g|webp|gif|avif)($|\?)/i.test(url)
            ? "immagine"
            : "sito";
      const ultimo = percorso.split("/").filter(Boolean).pop() ?? "";
      const titoloProposto = ultimo
        ? ultimo.replace(/\.[a-z0-9]+$/i, "").replace(/[-_]+/g, " ")
        : dominio;
      return { url, dominio, genere, titoloProposto };
    }),
};
