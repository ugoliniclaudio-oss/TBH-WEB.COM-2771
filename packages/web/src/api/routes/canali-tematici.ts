import { z } from "zod";
import { ORPCError } from "@orpc/server";
import { and, eq } from "drizzle-orm";
import { base } from "../__core/app";
import { db } from "../database";
import * as schema from "../database/schema";
import { AMBIENTE } from "../lib/ambiente";
import { SLUG_REGISTRO } from "../data/channel-registro";
import {
  CANALI_PREDEFINITI,
  PREFISSO,
  RIPRODUZIONI,
  STATI_CANALE,
  STATI_VOCE,
  TIPI_VOCE,
  aggiornaRiga,
  aggiungiErrore,
  analizzaUrl,
  elencoCanali,
  inOnda,
  inserisci,
  leggiMeta,
  recuperaInfo,
  registroErrori,
  rigaPerId,
  righeTematiche,
  salvaCanali,
  schedaVisibile,
  scriviMeta,
  svuotaErrori,
  voce,
  type CanaleTematico,
  type EsitoInserimento,
  type StatoVoce,
} from "../lib/canali-tematici";
import { DURATA_MAX_PALINSESTO_SEC, DURATA_MAX_VIDEO_SEC, controllaDurata, testoDurata } from "../lib/durata-video";

/** Se in questo controllo YouTube non ha restituito la durata ma è già registrata, lo si dice (niente «inserirla a mano» fuorviante). */
function messaggioVerifica(info: { messaggio: string; durataSec: number | null }, salvata: number | null) {
  if (info.durataSec || !salvata) return info.messaggio;
  return info.messaggio.replace("durata non leggibile: inserirla a mano", `durata non riletta in questo controllo, resta quella registrata (${testoDurata(salvata)})`);
}

/**
 * CANALI TEMATICI — TOUCH MUSIC · TOUCH INFLUENCITY MAGAZINE · ARM WRESTLING (28/10/2026) e quelli
 * che il pannello aggiungerà. Pubblico: canali accesi, video in onda, schede. Riservato (codice di
 * allestimento): canali, contenuti, import di URL, verifiche, stati, registro degli errori.
 * Palinsesto = playlist casuale PER SPETTATORE costruita nel browser, oppure (28/10/2026) la scaletta
 * in SEQUENZA nell'ordine del pannello, con «Ciclo continuo H24». Mai presentata come diretta.
 * Limite di 90 minuti per singolo video (lib/durata-video): oltre si avvisa e serve conferma, mai tagli.
 */

const CODICE = () => (process.env.TBH_CODICE_ALLESTIMENTO ?? "").trim();
function controlla(codice: string) {
  const atteso = CODICE();
  if (!atteso) throw new ORPCError("SERVICE_UNAVAILABLE", { message: "Codice di allestimento non configurato sul server." });
  if (codice.trim() !== atteso) throw new ORPCError("UNAUTHORIZED", { message: "Codice di allestimento errato." });
}

const SLUG = z.string().regex(/^[a-z0-9][a-z0-9-]{1,48}$/, "Slug: solo lettere minuscole, numeri e trattini.");
const TIPO = z.enum(TIPI_VOCE as [string, ...string[]]).transform((t) => t as (typeof TIPI_VOCE)[number]);
const CAMPI_VALORI = z.record(z.string().max(40), z.string().max(500)).refine((o) => Object.keys(o).length <= 20);
const TESTO_O_NULL = z.string().max(1000).nullable().optional();

const CANALE = z.object({
  slug: SLUG,
  nome: z.string().trim().min(1).max(80),
  descrizione: z.string().max(400),
  stato: z.enum(STATI_CANALE as [string, ...string[]]),
  abilitato: z.boolean(),
  slugRegistro: z.string().max(60).nullable(),
  logo: z.string().max(500).nullable(),
  pagina: z.string().max(200).nullable(),
  tipiAmmessi: z.array(TIPO).min(1),
  campi: z
    .array(z.object({ chiave: z.string().regex(/^[a-z][a-zA-Z0-9]{0,30}$/), etichetta: z.string().trim().min(1).max(60) }))
    .max(12),
  ordine: z.number().int().min(0).max(999),
  riproduzione: z.enum(RIPRODUZIONI as [string, ...string[]]).default("casuale"),
  cicloH24: z.boolean().default(false),
  secondiImmagine: z.number().int().min(3).max(120).default(7),
});
/** Durata del singolo contenuto in secondi (fino a 6 h: oltre i 90 minuti serve la conferma). */
const DURATA = z.number().int().min(1).max(6 * 3600).nullable().optional();

async function canaleOErrore(slug: string): Promise<CanaleTematico> {
  const c = (await elencoCanali()).find((x) => x.slug === slug);
  if (!c) throw new ORPCError("NOT_FOUND", { message: "Canale tematico inesistente." });
  return c;
}

/** Vista pubblica di un video o di una scheda: niente dati di gestione. */
function pubblica(v: ReturnType<typeof voce>) {
  return {
    id: v.id,
    tipo: v.tipo,
    titolo: v.titolo,
    url: v.url,
    piattaforma: v.piattaforma,
    embedId: v.embedId,
    miniatura: v.miniatura,
    fonte: v.fonte,
    campi: v.campi,
    durataSec: v.durataSec,
    oltreLimite: v.oltreLimite,
  };
}

const ultimeSegnalazioni = new Map<string, number>();

export const canaliTematici = {
  elenco: base.handler(async () => {
    const [canali, righe] = await Promise.all([elencoCanali(), righeTematiche()]);
    const voci = righe.map(voce);
    return {
      canali: canali
        .filter((c) => c.abilitato)
        .map((c) => ({
          ...c,
          video: c.stato === "non-disponibile" ? 0 : voci.filter((v) => v.canale === c.slug && inOnda(v)).length,
          schede: voci.filter((v) => v.canale === c.slug && schedaVisibile(v)).length,
        })),
    };
  }),

  canale: base.input(z.object({ slug: z.string().max(60) })).handler(async ({ input }) => {
    const c = (await elencoCanali()).find((x) => x.slug === input.slug && x.abilitato);
    if (!c) return { canale: null, video: [], schede: [], aggiornato: Date.now() };
    const voci = (await righeTematiche(c.slug)).map(voce);
    const video = c.stato === "non-disponibile" ? [] : voci.filter(inOnda).map(pubblica);
    const conDurata = video.filter((v) => v.durataSec);
    return {
      canale: c,
      video,
      schede: voci.filter(schedaVisibile).map(pubblica),
      /** Somma delle durate note della scaletta (il limite di 90 minuti vale per il singolo video). */
      durataTotaleSec: conDurata.reduce((t, v) => t + (v.durataSec ?? 0), 0),
      senzaDurata: video.length - conDurata.length,
      aggiornato: Date.now(),
    };
  }),

  /** Il player non è riuscito a riprodurre un video: si registra, si ricontrolla la fonte (al massimo ogni 10 minuti). */
  segnalaErrore: base
    .input(z.object({ slug: z.string().max(60), id: z.number().int(), codice: z.string().max(40), messaggio: z.string().max(300) }))
    .handler(async ({ input }) => {
      const k = `${input.id}:${input.codice}`;
      const ora = Date.now();
      if (ora - (ultimeSegnalazioni.get(k) ?? 0) < 60_000) return { ok: true, registrato: false };
      ultimeSegnalazioni.set(k, ora);
      const r = await rigaPerId(input.id);
      if (!r || r.channel !== PREFISSO + input.slug) return { ok: false, registrato: false };
      const m = leggiMeta(r);
      let esito = "segnalato dal player";
      m.errori += 1;
      m.ultimoErrore = { quando: ora, messaggio: `${input.codice}: ${input.messaggio}` };
      if (!m.verifica || ora - m.verifica.quando > 10 * 60_000) {
        const a = analizzaUrl(r.link ?? r.sorgente);
        if (a) {
          const info = await recuperaInfo(a);
          m.verifica = { quando: info.quando, esito: info.esito, messaggio: messaggioVerifica(info, r.durataSec) };
          if (info.esito === "errore" && m.stato !== "non-disponibile") {
            m.statoPrecedente = m.stato;
            m.stato = "non-disponibile";
            esito = `ricontrollato: ${info.messaggio} → NON DISPONIBILE`;
          } else esito = `ricontrollato: ${info.messaggio}`;
        }
      }
      await aggiornaRiga(r.id, { descrizione: scriviMeta(m) });
      await aggiungiErrore({ quando: ora, canale: input.slug, id: r.id, titolo: r.titolo, codice: input.codice, messaggio: input.messaggio, esito });
      return { ok: true, registrato: true };
    }),
};

export const canaliTematiciAdmin = {
  quadro: base.input(z.object({ codice: z.string() })).handler(async ({ input }) => {
    controlla(input.codice);
    const [canali, righe, errori] = await Promise.all([elencoCanali(), righeTematiche(), registroErrori()]);
    const voci = righe.map(voce);
    const conteggio = new Map<string, number>();
    for (const v of voci) conteggio.set(v.sorgente, (conteggio.get(v.sorgente) ?? 0) + 1);
    return {
      ambiente: AMBIENTE,
      limiteVideoSec: DURATA_MAX_VIDEO_SEC,
      limitePalinsestoSec: DURATA_MAX_PALINSESTO_SEC,
      canali,
      voci: voci.map((v) => ({ ...v, duplicato: (conteggio.get(v.sorgente) ?? 0) > 1 })),
      errori: errori.slice(0, 100),
      registro: [...SLUG_REGISTRO].sort(),
      predefiniti: CANALI_PREDEFINITI.map((c) => c.slug),
    };
  }),

  salvaCanale: base.input(z.object({ codice: z.string(), canale: CANALE, nuovo: z.boolean() })).handler(async ({ input }) => {
    controlla(input.codice);
    const lista = await elencoCanali();
    const i = lista.findIndex((c) => c.slug === input.canale.slug);
    if (input.nuovo && i >= 0) throw new ORPCError("CONFLICT", { message: "Esiste già un canale con questo slug." });
    if (!input.nuovo && i < 0) throw new ORPCError("NOT_FOUND", { message: "Canale inesistente (lo slug non si cambia)." });
    if (input.canale.slugRegistro && !SLUG_REGISTRO.has(input.canale.slugRegistro))
      throw new ORPCError("BAD_REQUEST", { message: "Channel del registro sconosciuto." });
    const c = input.canale as CanaleTematico;
    if (i >= 0) lista[i] = c;
    else lista.push(c);
    await salvaCanali(lista);
    return { ok: true };
  }),

  /** Si elimina solo un canale con catalogo vuoto: altrimenti si spegne (nessun contenuto perso). */
  eliminaCanale: base.input(z.object({ codice: z.string(), slug: z.string() })).handler(async ({ input }) => {
    controlla(input.codice);
    if ((await righeTematiche(input.slug)).length)
      throw new ORPCError("BAD_REQUEST", { message: "Il canale ha contenuti: spostarli o eliminarli prima, oppure spegnere il canale." });
    await salvaCanali((await elencoCanali()).filter((c) => c.slug !== input.slug));
    return { ok: true };
  }),

  /** Anteprima di un URL senza inserirlo: piattaforma, titolo, miniatura, riproducibilità, doppioni. */
  analizza: base.input(z.object({ codice: z.string(), url: z.string().min(3).max(1000) })).handler(async ({ input }) => {
    controlla(input.codice);
    const a = analizzaUrl(input.url);
    if (!a) throw new ORPCError("BAD_REQUEST", { message: "Indirizzo non valido." });
    const [info, righe] = await Promise.all([recuperaInfo(a), righeTematiche()]);
    return {
      ...a,
      ...info,
      durata: controllaDurata(info.durataSec),
      giaIn: [...new Set(righe.filter((r) => r.sorgente === a.sorgente).map((r) => r.channel.slice(PREFISSO.length)))],
    };
  }),

  aggiungi: base
    .input(
      z.object({
        codice: z.string(),
        slug: SLUG,
        url: z.string().min(3).max(1000),
        tipo: TIPO,
        titolo: TESTO_O_NULL,
        miniatura: TESTO_O_NULL,
        fonte: TESTO_O_NULL,
        campi: CAMPI_VALORI.optional(),
        durataSec: DURATA,
        confermaOltre: z.boolean().optional(),
      }),
    )
    .handler(async ({ input }) => {
      controlla(input.codice);
      const c = await canaleOErrore(input.slug);
      if (!c.tipiAmmessi.includes(input.tipo)) throw new ORPCError("BAD_REQUEST", { message: `Il canale ${c.nome} non accetta il tipo «${input.tipo}».` });
      return inserisci(c.slug, input.url, input);
    }),

  /** Elenco di URL (uno per riga, max 100): ognuno entra in BOZZA; doppioni e indirizzi non validi sono segnalati. */
  importa: base
    .input(z.object({ codice: z.string(), slug: SLUG, testo: z.string().max(60_000), tipo: TIPO, fonte: TESTO_O_NULL, confermaOltre: z.boolean().optional() }))
    .handler(async ({ input }) => {
    controlla(input.codice);
    const c = await canaleOErrore(input.slug);
    if (!c.tipiAmmessi.includes(input.tipo)) throw new ORPCError("BAD_REQUEST", { message: `Il canale ${c.nome} non accetta il tipo «${input.tipo}».` });
    const righe = input.testo
      .split(/[\n\r,;\s]+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 3);
    if (righe.length > 100) throw new ORPCError("BAD_REQUEST", { message: "Massimo 100 URL per importazione." });
    const tutte = await righeTematiche();
    const esiti: EsitoInserimento[] = [];
    // in sequenza a gruppi di 4: le fonti ufficiali non vanno martellate
    for (let i = 0; i < righe.length; i += 4) {
      const gruppo = righe.slice(i, i + 4);
      const vicini = new Set<string>();
      const fatti = await Promise.all(
        gruppo.map((u) => {
          const a = analizzaUrl(u);
          if (a && vicini.has(a.sorgente)) return Promise.resolve<EsitoInserimento>({ url: a.url, esito: "duplicato", messaggio: "Ripetuto nell'elenco incollato." });
          if (a) vicini.add(a.sorgente);
          return inserisci(c.slug, u, { tipo: input.tipo, fonte: input.fonte, confermaOltre: input.confermaOltre }, tutte);
        }),
      );
      esiti.push(...fatti);
    }
    return {
      esiti,
      inseriti: esiti.filter((e) => e.esito === "inserito").length,
      duplicati: esiti.filter((e) => e.esito === "duplicato").length,
      nonValidi: esiti.filter((e) => e.esito === "non-valido").length,
      oltreLimite: esiti.filter((e) => e.esito === "oltre-limite").length,
    };
  }),

  aggiorna: base
    .input(
      z.object({
        codice: z.string(),
        id: z.number().int(),
        titolo: z.string().trim().min(1).max(300).optional(),
        miniatura: TESTO_O_NULL,
        fonte: TESTO_O_NULL,
        campi: CAMPI_VALORI.optional(),
        tipo: TIPO.optional(),
        abilitato: z.boolean().optional(),
        canale: SLUG.optional(),
        url: z.string().min(3).max(1000).optional(),
        durataSec: DURATA,
        confermaOltre: z.boolean().optional(),
      }),
    )
    .handler(async ({ input }) => {
      controlla(input.codice);
      const r = await rigaPerId(input.id);
      if (!r) throw new ORPCError("NOT_FOUND", { message: "Contenuto non trovato." });
      const m = leggiMeta(r);
      const set: Partial<typeof schema.channelContenuti.$inferInsert> = {};
      let canale = r.channel.slice(PREFISSO.length);
      if (input.canale && input.canale !== canale) {
        const dest = await canaleOErrore(input.canale);
        canale = dest.slug;
        set.channel = PREFISSO + dest.slug;
      }
      let sorgente = r.sorgente;
      if (input.url) {
        const a = analizzaUrl(input.url);
        if (!a) throw new ORPCError("BAD_REQUEST", { message: "Indirizzo non valido." });
        if (a.sorgente !== r.sorgente) {
          Object.assign(set, { sorgente: a.sorgente, link: a.url });
          Object.assign(m, { piattaforma: a.piattaforma, embedId: a.embedId, verifica: null });
          if (m.stato !== "bozza") m.stato = "bozza"; // nuova sorgente = nuova verifica prima di tornare in onda
        }
        sorgente = a.sorgente;
      }
      if ((set.channel || set.sorgente) && (await righeTematiche(canale)).some((x) => x.id !== r.id && x.sorgente === sorgente))
        throw new ORPCError("CONFLICT", { message: "URL già presente nel canale di destinazione." });
      const tipo = input.tipo ?? r.tipo;
      const dest = await canaleOErrore(canale);
      if (!dest.tipiAmmessi.includes(tipo as (typeof TIPI_VOCE)[number])) throw new ORPCError("BAD_REQUEST", { message: `Il canale ${dest.nome} non accetta il tipo «${tipo}».` });
      if (input.tipo) set.tipo = input.tipo;
      if (input.titolo) set.titolo = input.titolo;
      if (input.fonte !== undefined) set.attribuzione = input.fonte?.trim() || null;
      if (input.abilitato !== undefined) set.attivo = input.abilitato ? 1 : 0;
      if (input.miniatura !== undefined) m.miniatura = input.miniatura?.trim() || null;
      if (input.campi) m.campi = Object.fromEntries(Object.entries(input.campi).filter(([, v]) => v.trim()).map(([k, v]) => [k, v.trim()]));
      if (input.durataSec !== undefined && input.durataSec !== r.durataSec) {
        const d = controllaDurata(input.durataSec);
        if (tipo === "video" && d.esito === "oltre" && !input.confermaOltre) throw new ORPCError("PRECONDITION_FAILED", { message: d.messaggio });
        set.durataSec = input.durataSec ?? null;
        m.durataDa = input.durataSec ? "manuale" : null;
        if (d.esito === "oltre") m.confermaOltre = true;
        else delete m.confermaOltre;
      }
      await aggiornaRiga(r.id, { ...set, descrizione: scriviMeta(m) });
      return { ok: true };
    }),

  /** Ricontrolla la fonte con il servizio ufficiale (oEmbed) e aggiorna titolo/miniatura solo se mancanti. */
  verifica: base.input(z.object({ codice: z.string(), id: z.number().int() })).handler(async ({ input }) => {
    controlla(input.codice);
    const r = await rigaPerId(input.id);
    if (!r) throw new ORPCError("NOT_FOUND", { message: "Contenuto non trovato." });
    const a = analizzaUrl(r.link ?? r.sorgente);
    if (!a) throw new ORPCError("BAD_REQUEST", { message: "Indirizzo non valido." });
    const info = await recuperaInfo(a);
    const m = leggiMeta(r);
    m.verifica = { quando: info.quando, esito: info.esito, messaggio: messaggioVerifica(info, r.durataSec) };
    if (!m.miniatura && info.miniatura) m.miniatura = info.miniatura;
    if (info.durataSec && !r.durataSec) m.durataDa = info.durataDa;
    await aggiornaRiga(r.id, { descrizione: scriviMeta(m), ...(info.durataSec && !r.durataSec ? { durataSec: info.durataSec } : {}) });
    return { ...m.verifica, videoIncorporati: info.videoIncorporati, durata: controllaDurata(r.durataSec ?? info.durataSec) };
  }),

  /**
   * Stato editoriale. Un VIDEO va in «approvato»/«pubblicato» solo dopo una verifica riuscita fatta adesso;
   * se il servizio non è verificabile serve la conferma esplicita dell'anteprima (`forza`).
   */
  stato: base
    .input(
      z.object({
        codice: z.string(),
        id: z.number().int(),
        stato: z.enum(STATI_VOCE as [string, ...string[]]),
        forza: z.boolean().optional(),
        confermaOltre: z.boolean().optional(),
      }),
    )
    .handler(async ({ input }) => {
      controlla(input.codice);
      const r = await rigaPerId(input.id);
      if (!r) throw new ORPCError("NOT_FOUND", { message: "Contenuto non trovato." });
      const m = leggiMeta(r);
      const nuovo = input.stato as StatoVoce;
      let durataNuova: number | null = null;
      if (r.tipo === "video" && (nuovo === "approvato" || nuovo === "pubblicato")) {
        if (m.piattaforma === "pagina")
          throw new ORPCError("BAD_REQUEST", { message: "È una pagina web, non un video: indicare l'URL del video (YouTube, Vimeo, Dailymotion o file video) oppure cambiarne il tipo." });
        const a = analizzaUrl(r.link ?? r.sorgente);
        const info = a ? await recuperaInfo(a) : null;
        if (info) m.verifica = { quando: info.quando, esito: info.esito, messaggio: messaggioVerifica(info, r.durataSec) };
        if (!info || info.esito === "errore") {
          await aggiornaRiga(r.id, { descrizione: scriviMeta(m) });
          throw new ORPCError("BAD_REQUEST", { message: `Non riproducibile: ${info?.messaggio ?? "indirizzo non valido"}` });
        }
        if (info.esito === "non-verificabile" && !input.forza)
          throw new ORPCError("PRECONDITION_FAILED", { message: `${info.messaggio} Controllare l'anteprima e confermare.` });
        // limite di 90 minuti: la durata deve essere nota (letta o scritta a mano); oltre il limite serve la conferma
        durataNuova = r.durataSec ? null : info.durataSec;
        if (durataNuova) m.durataDa = info.durataDa;
        const d = controllaDurata(r.durataSec ?? durataNuova);
        if (d.esito === "mancante") {
          await aggiornaRiga(r.id, { descrizione: scriviMeta(m) });
          throw new ORPCError("BAD_REQUEST", { message: `${d.messaggio} Poi approvare di nuovo.` });
        }
        if (d.esito === "oltre" && !m.confermaOltre && !input.confermaOltre) {
          await aggiornaRiga(r.id, { descrizione: scriviMeta(m), ...(durataNuova ? { durataSec: durataNuova } : {}) });
          throw new ORPCError("PRECONDITION_FAILED", { message: d.messaggio });
        }
        if (d.esito === "oltre") m.confermaOltre = true;
      }
      m.stato = nuovo;
      delete m.statoPrecedente;
      await aggiornaRiga(r.id, { descrizione: scriviMeta(m), ...(durataNuova ? { durataSec: durataNuova } : {}) });
      return { ok: true, verifica: m.verifica };
    }),

  /** Nuovo ordine della scaletta di un canale: gli id nell'ordine voluto (gli altri restano in coda). */
  ordina: base.input(z.object({ codice: z.string(), slug: SLUG, ids: z.array(z.number().int()).max(2000) })).handler(async ({ input }) => {
    controlla(input.codice);
    const righe = await righeTematiche(input.slug);
    const propri = new Set(righe.map((r) => r.id));
    const ids = [...new Set(input.ids.filter((id) => propri.has(id)))];
    const resto = righe.filter((r) => !ids.includes(r.id)).map((r) => r.id);
    for (const [i, id] of [...ids, ...resto].entries())
      if (righe.find((r) => r.id === id)?.ordine !== i) await aggiornaRiga(id, { ordine: i });
    return { ok: true };
  }),

  elimina: base.input(z.object({ codice: z.string(), id: z.number().int() })).handler(async ({ input }) => {
    controlla(input.codice);
    const r = await rigaPerId(input.id);
    if (!r) throw new ORPCError("NOT_FOUND", { message: "Contenuto non trovato." });
    await db.delete(schema.channelContenuti).where(and(eq(schema.channelContenuti.id, r.id), eq(schema.channelContenuti.ambiente, AMBIENTE)));
    return { ok: true };
  }),

  svuotaErrori: base.input(z.object({ codice: z.string() })).handler(async ({ input }) => {
    controlla(input.codice);
    await svuotaErrori();
    // azzera anche i contatori «errori player» dei singoli contenuti (il registro e i badge restano coerenti)
    for (const r of await righeTematiche()) {
      const m = leggiMeta(r);
      if (!m.errori && !m.ultimoErrore) continue;
      m.errori = 0;
      m.ultimoErrore = null;
      await aggiornaRiga(r.id, { descrizione: scriviMeta(m) });
    }
    return { ok: true };
  }),
};
