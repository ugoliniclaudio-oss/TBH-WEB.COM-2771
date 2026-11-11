import { z } from "zod";
import { ORPCError } from "@orpc/server";
import { eq, inArray } from "drizzle-orm";
import { base } from "../__core/app";
import { db } from "../database";
import * as schema from "../database/schema";
import {
  CATALOGO_BRANI,
  CATALOGO_NOTA,
  FASI_PRODUZIONE,
  FLUSSO_ROAD_2030,
  ROAD_2030_NOTA,
  SERVIZI_CINEMA,
  SIGLE_SPOT_TBH,
  STATI_VIDEO,
  VIDEO_SPORT,
  CANALE_TOUCH_MUSIC,
  classeBrano,
  type BranoMaster,
  type FaseProduzione,
  type StatoVideo,
} from "../data/musica";

/**
 * ────────────────────────────────────────────────────────────────────────────────
 * CATALOGO BRANI · PRODUZIONE VIDEOCLIP — Priorità 2ter (ordine del 29/09/2026).
 *
 * «DATABASE MASTER: un solo record per brano. Le pagine devono solo interrogare lo
 *  stesso database in modo diverso.»
 *
 * Questa è quell'unica interrogazione. Il record del brano nasce dal catalogo audio
 * reale (`CATALOGO_BRANI`, i 40 titoli del canale Touch Music Radio TV) e viene unito
 * alla riga di produzione video (`brani_video`) se la direzione l'ha registrata.
 * Nessuna copia, nessun secondo elenco, nessuno spostamento fisico dei dati:
 *
 *   Musica TBH      → tutti i brani
 *   J.C. Hugò       → tutti i brani (catalogo artistico)
 *   Produzioni      → solo `in-produzione` e `pubblicato`
 *   Road to 2030    → tutti, con il conteggio di quelli ancora da trasformare
 *   Videoclip       → solo quelli con un video reale
 *
 * COSA NON FA: non dichiara nessun videoclip che la direzione non abbia registrato.
 * Un brano senza riga in `brani_video` è SOLO AUDIO, perché l'unica cosa verificata
 * sul canale è che l'audio è pubblicato.
 * ────────────────────────────────────────────────────────────────────────────────
 */

const CODICE = () => (process.env.TBH_CODICE_ALLESTIMENTO ?? "").trim();

function controlla(codice: string) {
  const atteso = CODICE();
  if (!atteso)
    throw new ORPCError("SERVICE_UNAVAILABLE", {
      message: "Codice di allestimento non configurato sul server.",
    });
  if (codice.trim() !== atteso)
    throw new ORPCError("UNAUTHORIZED", { message: "Codice di allestimento errato." });
}

/** Le righe di produzione video, una volta sola per richiesta. */
async function statiVideo() {
  try {
    const righe = await db.select().from(schema.braniVideo);
    return new Map(righe.map((r) => [r.branoId, r]));
  } catch {
    // Database non raggiungibile: il catalogo audio resta leggibile e tutto è SOLO AUDIO.
    return new Map<string, typeof schema.braniVideo.$inferSelect>();
  }
}

/**
 * I CASTING APERTI, per brano. Regola: «finché non è stato aperto un casting NON mostrare
 * CASTING APERTO». Quindi qui entrano solo i casting realmente `aperto` o `in-selezione`.
 */
async function castingPerBrano() {
  const vuota = new Map<string, {
    slug: string;
    titolo: string;
    stato: string;
    scadenza: string | null;
    ruoli: unknown;
  }>();
  try {
    const righe = await db
      .select()
      .from(schema.castings)
      .where(inArray(schema.castings.stato, ["aperto", "in-selezione"]));
    for (const r of righe) {
      if (!r.branoId) continue;
      vuota.set(r.branoId, {
        slug: r.slug,
        titolo: r.titolo,
        stato: r.stato,
        scadenza: r.scadenza,
        ruoli: leggiRuoli(r.ruoli),
      });
    }
    return vuota;
  } catch {
    return vuota;
  }
}

/** I ruoli del casting sono salvati in JSON: se il testo è rotto si torna a elenco vuoto. */
export function leggiRuoli(testo: string | null): unknown[] {
  if (!testo) return [];
  try {
    const v = JSON.parse(testo);
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
}

/** Il record unico del brano: catalogo audio + stato del videoclip. */
function unisci(
  b: BranoMaster,
  r?: typeof schema.braniVideo.$inferSelect,
): BranoMaster & { nota: string | null } {
  const stato = (r?.statoVideo ?? "da-realizzare") as StatoVideo;
  // Un video «pubblicato» senza indirizzo non è pubblicato: si resta un passo indietro.
  const statoVero: StatoVideo = stato === "pubblicato" && !r?.videoUrl ? "in-produzione" : stato;
  return {
    ...b,
    videoUrl: r?.videoUrl ?? null,
    statoVideo: statoVero,
    statoProduzione:
      statoVero === "in-produzione" ? ((r?.statoProduzione as FaseProduzione | null) ?? null) : null,
    thumbnailVideo: r?.thumbnailVideo ?? null,
    annoVideoPrevisto: r?.annoVideoPrevisto ?? null,
    genere: r?.genere ?? null,
    anno: r?.anno ?? null,
    classe: classeBrano(statoVero),
    nota: r?.nota ?? null,
  };
}

export const musica = {
  /**
   * IL CATALOGO COMPLETO con i conteggi. Una sola lettura per tutte le pagine: il
   * filtro (solo audio, in produzione, audio+video) lo fa la pagina sullo stesso elenco.
   */
  catalogo: base.handler(async () => {
    const [righe, aperti] = await Promise.all([statiVideo(), castingPerBrano()]);
    const brani = CATALOGO_BRANI.map((b) => {
      const rec = unisci(b, righe.get(b.id));
      return { ...rec, casting: aperti.get(b.id) ?? null };
    });
    const conta = (s: StatoVideo) => brani.filter((b) => b.statoVideo === s).length;
    const generi = [...new Set(brani.map((b) => b.genere).filter((g): g is string => !!g))].sort();
    return {
      brani,
      conteggi: {
        audioPubblicati: brani.filter((b) => b.statoAudio === "pubblicato").length,
        videoclipPubblicati: conta("pubblicato"),
        videoclipInProduzione: conta("in-produzione"),
        videoclipDaRealizzare: conta("da-realizzare"),
        totale: brani.length,
        /**
         * AVANZAMENTO — percentuale di catalogo già diventato videoclip.
         * Calcolata, mai scritta a mano: videoclip pubblicati / brani pubblicati.
         */
        avanzamento:
          brani.length === 0 ? 0 : Math.round((conta("pubblicato") / brani.length) * 100),
        castingAperti: [...aperti.values()].length,
      },
      generi,
      canale: CANALE_TOUCH_MUSIC,
      nota: CATALOGO_NOTA,
      roadNota: ROAD_2030_NOTA,
      flusso: FLUSSO_ROAD_2030,
      /** Materiale audiovisivo reale già sul canale, elencato per quello che è. */
      altreProduzioni: {
        cinema: SERVIZI_CINEMA,
        sigleSpot: SIGLE_SPOT_TBH,
        sport: VIDEO_SPORT,
      },
    };
  }),

  /**
   * REGISTRA LA PRODUZIONE DI UN VIDEOCLIP — il solo modo in cui un brano cambia stato.
   * Serve il codice di allestimento, come per il Media Manager e le schede.
   */
  salvaVideo: base
    .input(
      z.object({
        codice: z.string(),
        branoId: z.string().min(1),
        statoVideo: z.enum(STATI_VIDEO),
        statoProduzione: z.enum(FASI_PRODUZIONE).nullable().optional(),
        videoUrl: z.string().max(400).nullable().optional(),
        thumbnailVideo: z.string().max(400).nullable().optional(),
        annoVideoPrevisto: z.string().max(40).nullable().optional(),
        genere: z.string().max(60).nullable().optional(),
        anno: z.string().max(40).nullable().optional(),
        nota: z.string().max(500).nullable().optional(),
      }),
    )
    .handler(async ({ input }) => {
      controlla(input.codice);
      const brano = CATALOGO_BRANI.find((b) => b.id === input.branoId);
      if (!brano) throw new ORPCError("NOT_FOUND", { message: "Brano non in catalogo." });

      const url = (input.videoUrl ?? "").trim();
      if (input.statoVideo === "pubblicato" && !url)
        throw new ORPCError("BAD_REQUEST", {
          message:
            "Per dichiarare il videoclip pubblicato serve l'indirizzo del video: senza link non si pubblica.",
        });

      const valori = {
        branoId: input.branoId,
        statoVideo: input.statoVideo,
        statoProduzione:
          input.statoVideo === "in-produzione" ? (input.statoProduzione ?? null) : null,
        videoUrl: url || null,
        thumbnailVideo: (input.thumbnailVideo ?? "").trim() || null,
        annoVideoPrevisto: (input.annoVideoPrevisto ?? "").trim() || null,
        genere: (input.genere ?? "").trim() || null,
        anno: (input.anno ?? "").trim() || null,
        nota: (input.nota ?? "").trim() || null,
        updatedAt: new Date(),
      };

      await db
        .insert(schema.braniVideo)
        .values(valori)
        .onConflictDoUpdate({ target: schema.braniVideo.branoId, set: valori });

      const [r] = await db
        .select()
        .from(schema.braniVideo)
        .where(eq(schema.braniVideo.branoId, input.branoId))
        .limit(1);
      return { brano: unisci(brano, r) };
    }),

  /** Riporta un brano allo stato di partenza: SOLO AUDIO, riga cancellata. */
  azzeraVideo: base
    .input(z.object({ codice: z.string(), branoId: z.string().min(1) }))
    .handler(async ({ input }) => {
      controlla(input.codice);
      await db.delete(schema.braniVideo).where(eq(schema.braniVideo.branoId, input.branoId));
      return { ok: true as const, branoId: input.branoId };
    }),
};
