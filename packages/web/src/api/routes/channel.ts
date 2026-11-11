import { z } from "zod";
import { ORPCError } from "@orpc/server";
import { and, eq } from "drizzle-orm";
import { base } from "../__core/app";
import { db } from "../database";
import * as schema from "../database/schema";
import { CAROSELLI_HOME, MONITOR_REGIA, titoloChannel } from "../data/channel-home";
import { CHANNEL_REGISTRO, SLUG_REGISTRO, registroPerSlug } from "../data/channel-registro";
import {
  CHANNEL_CONDIVISI,
  FONTI_VERIFICATE,
  OGNI_MINUTI_SYNC,
  avviaSincronizzazionePeriodica,
  calcolaStato,
  contenutiDi,
  contenutoPerId,
  fasceDi,
  giaPresente,
  normalizzaSorgente,
  quadroChannel,
  salvaImpostazioni,
  sequenzaDi,
  sincronizza,
  sincronizzaSeServe,
  tutteLeImpostazioni,
  ultimoSync,
} from "../lib/channel-palinsesti";
import { dataRoma } from "../lib/radio-palinsesto";
import { AMBIENTE } from "../lib/ambiente";
import { controllaDurata } from "../lib/durata-video";

/** 28/10/2026 — limite di 90 minuti per singolo VIDEO (video, film, spot): oltre serve la conferma, mai tagli. */
const TIPI_VIDEO = new Set(["video", "film", "spot"]);
function limiteVideo(tipo: string, durataSec: number | null | undefined, conferma: boolean | undefined) {
  if (!TIPI_VIDEO.has(tipo)) return;
  const d = controllaDurata(durataSec);
  if (d.esito === "oltre" && !conferma) throw new ORPCError("PRECONDITION_FAILED", { message: d.messaggio });
}
import { homeAttiva, impostaHome, importaDaStaging, storicoHome } from "../lib/home-attiva";

/**
 * CHANNEL — i 28 Channel della home «Canale 0» e i loro palinsesti automatici.
 *
 * Pubblico: elenco con lo stato VERO di ogni Channel (Diretta / Replica / Playlist
 * automatica / In allestimento) e la sequenza di un Channel.
 * Riservato (codice di allestimento): impostazioni, contenuti, ordine, durata,
 * frequenza, spot, fasce orarie, sincronizzazione delle fonti verificate.
 */

/* 28/10/2026: vale per tutto il registro (i 28 invariati + Channel nuovi e spazi), slug invariati. */
const SLUG = z.string().refine((s) => SLUG_REGISTRO.has(s), "Channel sconosciuto.");
/* 28/10/2026 (round 14) — tipo «immagine» (locandina/foto in rotazione per la durata indicata). */
const TIPO = z.enum(["video", "audio", "spot", "scheda", "annuncio", "film", "immagine"]);
const ORA = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/);

const CODICE = () => (process.env.TBH_CODICE_ALLESTIMENTO ?? "").trim();
function controlla(codice: string) {
  const atteso = CODICE();
  if (!atteso) throw new ORPCError("SERVICE_UNAVAILABLE", { message: "Codice di allestimento non configurato sul server." });
  if (codice.trim() !== atteso) throw new ORPCError("UNAUTHORIZED", { message: "Codice di allestimento errato." });
}

function nonCondiviso(slug: string) {
  if (CHANNEL_CONDIVISI.has(slug))
    throw new ORPCError("BAD_REQUEST", { message: "TOUCH TV e TOUCH RADIO usano il palinsesto condiviso: si gestiscono da /allestimento/canali-touch." });
}

/** Ogni 30 minuti anche senza visite (un solo timer per processo). */
avviaSincronizzazionePeriodica();

const DELL_AMBITO = (id: number) => and(eq(schema.channelFasce.id, id), eq(schema.channelFasce.ambiente, AMBIENTE));

async function sincronizzaSilenzioso() {
  try {
    await sincronizzaSeServe();
  } catch {
    /* se la fonte non risponde si mostra l'ultimo archivio salvato */
  }
}

export const channel = {
  /** Home «Canale 0»: monitor di regia, 28 Channel in 5 blocchi, 4 caroselli (più i 3 conservati con dopoFila null). */
  elenco: base.handler(async () => {
    await sincronizzaSilenzioso();
    const adesso = Date.now();
    const quadro = await quadroChannel(adesso);
    const sync = await ultimoSync();
    return {
      adesso,
      ambiente: AMBIENTE,
      ultimoSync: sync?.quando ?? null,
      ogniMinuti: OGNI_MINUTI_SYNC,
      monitor: MONITOR_REGIA,
      /** Spot interni ATTIVI nell'archivio del Channel Touch Spot (dato reale del database). */
      spotInterni: quadro.find((c) => c.slug === "touch-spot")?.contenutiAttivi ?? 0,
      channel: quadro.map((c) => ({
        slug: c.slug,
        titolo: titoloChannel(c),
        fila: c.fila,
        categoria: c.categoria,
        pagina: c.pagina,
        mediaPartnerEsterno: !!c.mediaPartnerEsterno,
        daDecidere: c.daDecidere ?? null,
        stato: c.stato,
        nota: c.nota,
        contenutiAttivi: c.contenutiAttivi,
      })),
      caroselli: CAROSELLI_HOME,
    };
  }),

  /** Quale home mostra `/` in QUESTO ambito (classica = home precedente, invariata). */
  home: base.handler(async () => ({ attiva: await homeAttiva(), ambiente: AMBIENTE })),

  /** Sequenza di oggi di un Channel (per i monitor della fase 2). */
  palinsesto: base.input(z.object({ slug: SLUG })).handler(async ({ input }) => {
    await sincronizzaSilenzioso();
    const adesso = Date.now();
    const imp = (await tutteLeImpostazioni())[input.slug]!;
    const [righe, fasce] = await Promise.all([contenutiDi(input.slug), fasceDi(input.slug)]);
    const sequenza = await sequenzaDi(input.slug, dataRoma(adesso), imp);
    const c = registroPerSlug(input.slug)!;
    return {
      slug: c.slug,
      titolo: c.nome,
      ...calcolaStato(input.slug, imp, sequenza.filter((s) => !s.spot).length, fasce, adesso, sequenza.filter((s) => s.spot).length),
      repliche: imp.repliche,
      casuale: imp.casuale,
      sequenza,
      fasce: fasce.filter((f) => f.attivo).map((f) => ({ giorno: f.giorno, ora: f.ora, durataMin: f.durataMin, modalita: f.modalita, titolo: f.titolo })),
      archivio: righe.filter((r) => r.attivo).length,
    };
  }),
};

const IMPOSTAZIONI = z.object({
  modalita: z.enum(["auto", "diretta", "replica", "playlist", "allestimento", "commerciale"]),
  casuale: z.boolean(),
  repliche: z.boolean(),
  spotOgni: z.number().int().min(0).max(50),
  durataScheda: z.number().int().min(5).max(600),
  aggiornamentoAuto: z.boolean(),
});

export const channelAdmin = {
  quadro: base.input(z.object({ codice: z.string() })).handler(async ({ input }) => {
    controlla(input.codice);
    // 28/10/2026: il pannello gestisce tutto il registro (i 28 + Channel nuovi e spazi).
    const quadro = await quadroChannel(Date.now(), CHANNEL_REGISTRO);
    return {
      channel: quadro.map((c) => ({ ...c, titolo: c.nome })),
      fonti: FONTI_VERIFICATE,
      sync: await ultimoSync(),
      ambiente: AMBIENTE,
      home: await homeAttiva(),
      storicoHome: await storicoHome(),
    };
  }),

  /** Interruttore della home di QUESTO ambito: «classica» ripristina subito la home precedente. */
  impostaHome: base.input(z.object({ codice: z.string(), attiva: z.enum(["classica", "canale0", "tbh3"]) })).handler(async ({ input }) => {
    controlla(input.codice);
    return impostaHome(input.attiva);
  }),

  /** Solo sul sito pubblico: copia le scelte collaudate nello staging (che resta intatto). */
  importaDaStaging: base.input(z.object({ codice: z.string() })).handler(async ({ input }) => {
    controlla(input.codice);
    if (AMBIENTE === "staging") throw new ORPCError("BAD_REQUEST", { message: "L'importazione si esegue dal pannello del sito pubblico." });
    return importaDaStaging();
  }),

  dettaglio: base.input(z.object({ codice: z.string(), slug: SLUG })).handler(async ({ input }) => {
    controlla(input.codice);
    const imp = (await tutteLeImpostazioni())[input.slug]!;
    const [contenuti, fasce] = await Promise.all([contenutiDi(input.slug), fasceDi(input.slug)]);
    const sequenza = await sequenzaDi(input.slug, dataRoma(Date.now()), imp);
    return { impostazioni: imp, contenuti, fasce, sequenza: sequenza.slice(0, 60), lunghezza: sequenza.length };
  }),

  sincronizza: base.input(z.object({ codice: z.string() })).handler(async ({ input }) => {
    controlla(input.codice);
    return sincronizza();
  }),

  impostazioni: base.input(z.object({ codice: z.string(), slug: SLUG, valori: IMPOSTAZIONI })).handler(async ({ input }) => {
    controlla(input.codice);
    nonCondiviso(input.slug);
    await salvaImpostazioni(input.slug, input.valori);
    return { ok: true };
  }),

  aggiorna: base
    .input(
      z.object({
        codice: z.string(),
        id: z.number().int(),
        titolo: z.string().min(1).max(300).optional(),
        durataSec: z.number().int().min(1).max(86_400).nullable().optional(),
        frequenza: z.number().int().min(1).max(10).optional(),
        attivo: z.boolean().optional(),
        confermaOltre: z.boolean().optional(),
        /* 28/10/2026 (round 14) — dalla Regia si correggono anche tipo, URL del contenuto e link. */
        tipo: TIPO.optional(),
        sorgente: z.string().min(1).max(1000).optional(),
        link: z.string().max(1000).nullable().optional(),
      }),
    )
    .handler(async ({ input }) => {
      controlla(input.codice);
      const r = await contenutoPerId(input.id);
      if (!r) throw new ORPCError("NOT_FOUND", { message: "Contenuto non trovato." });
      const tipo = input.tipo ?? r.tipo;
      const durata = input.durataSec !== undefined ? input.durataSec : r.durataSec;
      if ((input.durataSec !== undefined && input.durataSec !== r.durataSec) || (input.tipo !== undefined && input.tipo !== r.tipo))
        limiteVideo(tipo, durata, input.confermaOltre);
      const sorgente = input.sorgente !== undefined ? normalizzaSorgente(input.sorgente) : undefined;
      if (sorgente !== undefined && sorgente !== r.sorgente && (await giaPresente(r.channel, sorgente)))
        throw new ORPCError("CONFLICT", { message: "Questo contenuto è già nella playlist del Channel." });
      await db
        .update(schema.channelContenuti)
        .set({
          ...(input.titolo !== undefined ? { titolo: input.titolo } : {}),
          ...(input.durataSec !== undefined ? { durataSec: input.durataSec } : {}),
          ...(input.frequenza !== undefined ? { frequenza: input.frequenza } : {}),
          ...(input.attivo !== undefined ? { attivo: input.attivo ? 1 : 0 } : {}),
          ...(input.tipo !== undefined ? { tipo: input.tipo } : {}),
          ...(sorgente !== undefined ? { sorgente } : {}),
          ...(input.link !== undefined ? { link: input.link?.trim() || null } : {}),
          updatedAt: new Date(),
        })
        .where(and(eq(schema.channelContenuti.id, input.id), eq(schema.channelContenuti.ambiente, AMBIENTE)));
      return { ok: true };
    }),

  /** Nuovo ordine della playlist: gli id nell'ordine voluto. */
  ordina: base.input(z.object({ codice: z.string(), slug: SLUG, ids: z.array(z.number().int()).max(2000) })).handler(async ({ input }) => {
    controlla(input.codice);
    const propri = new Set((await contenutiDi(input.slug)).map((r) => r.id));
    for (const [i, id] of input.ids.entries())
      if (propri.has(id))
        await db
          .update(schema.channelContenuti)
          .set({ ordine: i, updatedAt: new Date() })
          .where(and(eq(schema.channelContenuti.id, id), eq(schema.channelContenuti.ambiente, AMBIENTE)));
    return { ok: true };
  }),

  aggiungi: base
    .input(
      z.object({
        codice: z.string(),
        slug: SLUG,
        tipo: TIPO,
        titolo: z.string().min(1).max(300),
        sorgente: z.string().min(1).max(1000),
        link: z.string().max(1000).nullable(),
        durataSec: z.number().int().min(1).max(86_400).nullable(),
        attribuzione: z.string().max(200).nullable(),
        confermaOltre: z.boolean().optional(),
      }),
    )
    .handler(async ({ input }) => {
      controlla(input.codice);
      nonCondiviso(input.slug);
      limiteVideo(input.tipo, input.durataSec, input.confermaOltre);
      const sorgente = normalizzaSorgente(input.sorgente);
      if (await giaPresente(input.slug, sorgente)) throw new ORPCError("CONFLICT", { message: "Questo contenuto è già nella playlist del Channel." });
      const n = (await contenutiDi(input.slug)).length;
      await db.insert(schema.channelContenuti).values({
        ambiente: AMBIENTE,
        channel: input.slug,
        tipo: input.tipo,
        titolo: input.titolo.trim(),
        sorgente,
        link: input.link?.trim() || null,
        durataSec: input.durataSec,
        attribuzione: input.attribuzione?.trim() || null,
        origine: "manuale",
        ordine: n,
      });
      return { ok: true };
    }),

  /** Solo i contenuti aggiunti a mano si eliminano; quelli automatici si spengono. */
  elimina: base.input(z.object({ codice: z.string(), id: z.number().int() })).handler(async ({ input }) => {
    controlla(input.codice);
    const r = await contenutoPerId(input.id);
    if (!r) throw new ORPCError("NOT_FOUND", { message: "Contenuto non trovato." });
    if (r.origine !== "manuale") throw new ORPCError("BAD_REQUEST", { message: "I contenuti automatici non si eliminano: si spengono." });
    await db.delete(schema.channelContenuti).where(and(eq(schema.channelContenuti.id, input.id), eq(schema.channelContenuti.ambiente, AMBIENTE)));
    return { ok: true };
  }),

  aggiungiFascia: base
    .input(
      z.object({
        codice: z.string(),
        slug: SLUG,
        giorno: z.number().int().min(1).max(7).nullable(),
        ora: ORA,
        durataMin: z.number().int().min(1).max(1440),
        modalita: z.enum(["diretta", "replica", "playlist"]),
        titolo: z.string().min(1).max(200),
        sorgente: z.string().max(1000).nullable(),
      }),
    )
    .handler(async ({ input }) => {
      controlla(input.codice);
      nonCondiviso(input.slug);
      const sorgente = input.sorgente?.trim() || null;
      if (input.modalita === "diretta" && !(sorgente && /^https:\/\//.test(sorgente)))
        throw new ORPCError("BAD_REQUEST", { message: "Una diretta richiede l'indirizzo https ufficiale della trasmissione." });
      await db.insert(schema.channelFasce).values({
        ambiente: AMBIENTE,
        channel: input.slug,
        giorno: input.giorno,
        ora: input.ora,
        durataMin: input.durataMin,
        modalita: input.modalita,
        titolo: input.titolo.trim(),
        sorgente,
      });
      return { ok: true };
    }),

  attivaFascia: base.input(z.object({ codice: z.string(), id: z.number().int(), attivo: z.boolean() })).handler(async ({ input }) => {
    controlla(input.codice);
    await db.update(schema.channelFasce).set({ attivo: input.attivo ? 1 : 0 }).where(DELL_AMBITO(input.id));
    return { ok: true };
  }),

  eliminaFascia: base.input(z.object({ codice: z.string(), id: z.number().int() })).handler(async ({ input }) => {
    controlla(input.codice);
    await db.delete(schema.channelFasce).where(DELL_AMBITO(input.id));
    return { ok: true };
  }),
};
