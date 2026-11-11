import { z } from "zod";
import { ORPCError } from "@orpc/server";
import { and, desc, eq, gte, lte, sql } from "drizzle-orm";
import { base } from "../__core/app";
import { db } from "../database";
import * as schema from "../database/schema";
import { dataRoma, giornoDopo, nomeGiorno, settimanaDa } from "../lib/radio-palinsesto";
import {
  impostaModalita,
  inOndaDa,
  modalitaPalinsesto,
  scalettaCanale,
  spaziCanale,
  svuotaCacheCanali,
  type ElementoCanale,
} from "../lib/touch-canali";
import {
  CANALI_ID,
  CANALI_TOUCH,
  LOGHI_CANDIDATI,
  LOGO_RUBRICA_TOUCH_MUSIC,
  RUBRICHE,
  RUBRICHE_ID,
  rubricaDa,
  type CanaleTouchId,
} from "../data/touch-canali";
import { DM_RADIO, RADIO } from "../data/radio";
import { PALINSESTO_DM } from "../data/tbh";
import { GIORNI } from "../data/palinsesto";
import { DM_VIDEO_SQUADRE } from "../data/dm-video";

/**
 * TOUCH RADIO / TOUCH TV — l'API dei due canali del gruppo TBH.
 *
 * Pubblico: informazioni dei canali e delle rubriche, «in onda adesso» per canale,
 * palinsesto per canale, scheda rubrica, registrazione degli eventi reali dei player.
 * Riservato (codice di allestimento): modalità «Palinsesto condiviso / Palinsesti
 * separati», calendario proprio di ogni canale, rendiconti separati.
 *
 * Le procedure `radio.*` restano invariate: il palinsesto generale è sempre quello.
 */

const CANALE = z.enum(CANALI_ID);
const DATA = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
const ORA = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/);

const CODICE = () => (process.env.TBH_CODICE_ALLESTIMENTO ?? "").trim();
function controlla(codice: string) {
  const atteso = CODICE();
  if (!atteso)
    throw new ORPCError("SERVICE_UNAVAILABLE", { message: "Codice di allestimento non configurato sul server." });
  if (codice.trim() !== atteso) throw new ORPCError("UNAUTHORIZED", { message: "Codice di allestimento errato." });
}

/** Scaletta di oggi + domani di un canale (per il passaggio di mezzanotte). */
async function dueGiorni(canale: CanaleTouchId, adesso: number) {
  const oggi = dataRoma(adesso);
  const a = await scalettaCanale(canale, oggi);
  const b = await scalettaCanale(canale, giornoDopo(oggi));
  return { oggi, a, lista: [...a.elementi, ...b.elementi] };
}

async function inOndaCanale(canale: CanaleTouchId, adesso: number) {
  const { a, lista } = await dueGiorni(canale, adesso);
  const r = inOndaDa(lista, adesso);
  return {
    canale,
    nome: CANALI_TOUCH[canale].nome,
    modalita: a.modalita,
    fonte: a.fonte,
    ...r,
  };
}

function idYouTube(url: string): string | null {
  const m = url.match(/(?:v=|youtu\.be\/|embed\/|shorts\/|live\/)([\w-]{11})/);
  return m ? m[1]! : null;
}

/** Prossimi passaggi di una rubrica su un canale, a partire da adesso. */
function prossimiDi(lista: ElementoCanale[], rubrica: string, adesso: number, n = 6) {
  return lista.filter((e) => e.rubrica === rubrica && e.fine > adesso).slice(0, n);
}

export const canaliTouch = {
  /** Canali, rubriche, modalità del palinsesto. */
  info: base.handler(async () => ({
    canali: CANALI_ID.map((id) => CANALI_TOUCH[id]),
    rubriche: RUBRICHE,
    modalita: await modalitaPalinsesto(),
    loghiCandidati: LOGHI_CANDIDATI,
    logoRubricaTouchMusic: LOGO_RUBRICA_TOUCH_MUSIC,
  })),

  /** Cosa va in onda adesso su UN canale. */
  inOnda: base.input(z.object({ canale: CANALE })).handler(async ({ input }) => {
    const adesso = Date.now();
    return { adesso, ...(await inOndaCanale(input.canale, adesso)) };
  }),

  /** Cosa va in onda adesso su ENTRAMBI i canali: serve al carosello «SEGUI LA DIRETTA ORA». */
  diretta: base.handler(async () => {
    const adesso = Date.now();
    const canali = await Promise.all(CANALI_ID.map((c) => inOndaCanale(c, adesso)));
    return { adesso, canali };
  }),

  /** Palinsesto di un giorno per un canale (oggi se manca la data), ora di Roma. */
  palinsesto: base
    .input(z.object({ canale: CANALE, giorno: DATA.optional() }))
    .handler(async ({ input }) => {
      const adesso = Date.now();
      const giorno = input.giorno ?? dataRoma(adesso);
      const s = await scalettaCanale(input.canale, giorno);
      return {
        adesso,
        canale: input.canale,
        giorno,
        nomeGiorno: nomeGiorno(giorno),
        fuso: RADIO.fuso,
        braniInRotazione: s.brani,
        modalita: s.modalita,
        fonte: s.fonte,
        spazi: s.spazi,
        elementi: s.elementi,
      };
    }),

  /** Scheda di una rubrica: identità, orari, contenuti, anteprima, archivio. */
  rubrica: base.input(z.object({ id: z.enum(RUBRICHE_ID) })).handler(async ({ input }) => {
    const r = rubricaDa(input.id)!;
    const adesso = Date.now();
    const oggi = dataRoma(adesso);
    const settimana = settimanaDa(oggi).map((g) => ({
      data: g.data,
      giorno: g.giorno,
      blocchi: g.blocchi.filter((b) => b.rubrica === r.id),
    }));
    const prossimi = await Promise.all(
      CANALI_ID.map(async (c) => {
        const { lista } = await dueGiorni(c, adesso);
        return { canale: c, nome: CANALI_TOUCH[c].nome, elementi: prossimiDi(lista, r.id, adesso) };
      }),
    );

    let contenuti: { titolo: string; sotto: string | null; url: string | null; videoId: string | null; cover: string | null }[] = [];
    if (r.id === "dm-on-air") {
      contenuti = PALINSESTO_DM.map((p) => ({
        titolo: p.name,
        sotto: `${p.giorno ? (GIORNI[p.giorno] ?? "giorno da confermare") : "giorno da confermare"} · ${p.ora ?? "ora da confermare"} · ${p.durataMin} min`,
        url: DM_RADIO.youtube,
        videoId: null,
        cover: null,
      }));
    } else if (r.id === "dm-highlights") {
      contenuti = DM_VIDEO_SQUADRE.flatMap((s) => [
        ...s.highlights.map((v) => ({ v, tipo: "Highlights", s })),
        ...s.interviste.map((v) => ({ v, tipo: "Interviste", s })),
      ]).map(({ v, tipo, s }) => ({
        titolo: v.titolo,
        sotto: `${tipo} · ${s.nome}`,
        url: v.url,
        videoId: idYouTube(v.url),
        cover: null,
      }));
    } else {
      const radio = prossimi[0]?.elementi ?? [];
      contenuti = radio
        .filter((e) => e.tipo === "brano")
        .map((e) => ({
          titolo: e.titolo,
          sotto: `${e.ora} · ${e.tipo === "brano" ? (e.artista ?? "J.C. Hugò") : ""}`,
          url: e.link,
          videoId: e.tipo === "brano" && e.fonte.tipo === "youtube" ? e.fonte.videoId : null,
          cover: e.tipo === "brano" ? e.cover : null,
        }));
    }

    return { adesso, rubrica: r, settimana, prossimi, contenuti, totaleContenuti: contenuti.length };
  }),

  /** Evento reale di un player (avvio o passaggio): base delle statistiche separate per canale. */
  registra: base
    .input(
      z.object({
        canale: CANALE,
        evento: z.enum(["avvio", "passaggio"]),
        sessione: z.string().min(8).max(64),
        tipo: z.enum(["brano", "spot", "dm", "programma"]).optional(),
        rubrica: z.string().max(40).nullish(),
        titolo: z.string().max(200).nullish(),
        inserzionista: z.string().max(120).nullish(),
        inizio: z.number().int().nonnegative().default(0),
      }),
    )
    .handler(async ({ input }) => {
      const inizio = input.evento === "avvio" ? Math.floor(Date.now() / 60_000) * 60_000 : input.inizio;
      try {
        await db
          .insert(schema.touchEventi)
          .values({
            canale: input.canale,
            evento: input.evento,
            sessione: input.sessione,
            giorno: dataRoma(Date.now()),
            tipo: input.tipo ?? null,
            rubrica: input.rubrica ?? null,
            titolo: input.titolo ?? null,
            inserzionista: input.inserzionista ?? null,
            inizio,
          })
          .onConflictDoNothing();
      } catch {
        /* le statistiche non devono mai fermare il player */
      }
      return { ok: true };
    }),
};

const SPAZIO = z.object({
  canale: CANALE,
  giorno: z.number().int().min(1).max(7).nullable(),
  data: DATA.nullable(),
  ora: ORA,
  durataMin: z.number().int().min(1).max(24 * 60),
  rubrica: z.enum([...RUBRICHE_ID, "pubblicita"]),
  tipo: z.enum(["diretta", "video", "audio", "spot"]),
  titolo: z.string().trim().min(2).max(160),
  descrizione: z.string().trim().max(600).nullable(),
  sorgente: z.string().trim().min(3).max(500),
  link: z.string().trim().max(500).nullable(),
  inserzionista: z.string().trim().max(120).nullable(),
});

export const canaliTouchAdmin = {
  /** Stato: modalità e calendario proprio di ogni canale. */
  stato: base.input(z.object({ codice: z.string() })).handler(async ({ input }) => {
    controlla(input.codice);
    const [radio, tv] = await Promise.all([spaziCanale("radio"), spaziCanale("tv")]);
    return { modalita: await modalitaPalinsesto(), spazi: { radio, tv }, giorni: GIORNI };
  }),

  /** Interruttore «Palinsesto condiviso / Palinsesti separati». */
  impostaModalita: base
    .input(z.object({ codice: z.string(), modalita: z.enum(["condiviso", "separati"]) }))
    .handler(async ({ input }) => {
      controlla(input.codice);
      await impostaModalita(input.modalita);
      return { modalita: input.modalita };
    }),

  aggiungiSpazio: base
    .input(z.object({ codice: z.string(), spazio: SPAZIO }))
    .handler(async ({ input }) => {
      controlla(input.codice);
      const s = input.spazio;
      if (!s.giorno && !s.data)
        throw new ORPCError("BAD_REQUEST", { message: "Indica il giorno della settimana oppure una data precisa." });
      if (s.tipo === "spot" && !s.inserzionista)
        throw new ORPCError("BAD_REQUEST", { message: "Per uno spot serve l'inserzionista (va nel rendiconto)." });
      const [r] = await db
        .insert(schema.touchPalinsesto)
        .values({ ...s, giorno: s.data ? null : s.giorno })
        .returning();
      svuotaCacheCanali();
      return r;
    }),

  attivaSpazio: base
    .input(z.object({ codice: z.string(), id: z.number().int(), attivo: z.boolean() }))
    .handler(async ({ input }) => {
      controlla(input.codice);
      await db
        .update(schema.touchPalinsesto)
        .set({ attivo: input.attivo ? 1 : 0 })
        .where(eq(schema.touchPalinsesto.id, input.id));
      svuotaCacheCanali();
      return { ok: true };
    }),

  /** Toglie dal calendario del canale uno spazio aggiunto dal pannello (mai il palinsesto generale). */
  eliminaSpazio: base
    .input(z.object({ codice: z.string(), id: z.number().int() }))
    .handler(async ({ input }) => {
      controlla(input.codice);
      await db.delete(schema.touchPalinsesto).where(eq(schema.touchPalinsesto.id, input.id));
      svuotaCacheCanali();
      return { ok: true };
    }),

  /** Rendiconto SEPARATO per canale: avvii, passaggi per rubrica, spot per inserzionista, per giorno. */
  rendiconto: base
    .input(z.object({ codice: z.string(), da: DATA.optional(), a: DATA.optional() }))
    .handler(async ({ input }) => {
      controlla(input.codice);
      const oggi = dataRoma(Date.now());
      const a = input.a ?? oggi;
      const da = input.da ?? giornoDopo(a, -29);
      const t = schema.touchEventi;
      const periodo = (canale: CanaleTouchId) => and(eq(t.canale, canale), gte(t.giorno, da), lte(t.giorno, a));
      const n = sql<number>`count(*)`.mapWith(Number);
      const sessioni = sql<number>`count(distinct ${t.sessione})`.mapWith(Number);

      const canali = await Promise.all(
        CANALI_ID.map(async (canale) => {
          const [avvii] = await db
            .select({ n, sessioni })
            .from(t)
            .where(and(periodo(canale), eq(t.evento, "avvio")));
          const [passaggi] = await db
            .select({ n })
            .from(t)
            .where(and(periodo(canale), eq(t.evento, "passaggio")));
          const perRubrica = await db
            .select({ rubrica: t.rubrica, n })
            .from(t)
            .where(and(periodo(canale), eq(t.evento, "passaggio"), sql`${t.rubrica} is not null`))
            .groupBy(t.rubrica)
            .orderBy(desc(n));
          const spot = await db
            .select({ inserzionista: t.inserzionista, titolo: t.titolo, n, sessioni })
            .from(t)
            .where(and(periodo(canale), eq(t.evento, "passaggio"), eq(t.tipo, "spot")))
            .groupBy(t.inserzionista, t.titolo)
            .orderBy(desc(n));
          const perGiorno = await db
            .select({
              giorno: t.giorno,
              avvii: sql<number>`sum(case when ${t.evento} = 'avvio' then 1 else 0 end)`.mapWith(Number),
              passaggi: sql<number>`sum(case when ${t.evento} = 'passaggio' then 1 else 0 end)`.mapWith(Number),
              spot: sql<number>`sum(case when ${t.tipo} = 'spot' then 1 else 0 end)`.mapWith(Number),
            })
            .from(t)
            .where(periodo(canale))
            .groupBy(t.giorno)
            .orderBy(desc(t.giorno));
          return {
            canale,
            nome: CANALI_TOUCH[canale].nome,
            avvii: avvii?.n ?? 0,
            sessioni: avvii?.sessioni ?? 0,
            passaggi: passaggi?.n ?? 0,
            spotTotali: spot.reduce((s, x) => s + x.n, 0),
            perRubrica: perRubrica.map((r) => ({ ...r, nome: rubricaDa(r.rubrica)?.nome ?? r.rubrica })),
            spot,
            perGiorno,
          };
        }),
      );
      return { da, a, canali };
    }),
};
