import { z } from "zod";
import { and, desc, eq, inArray, lt, sql } from "drizzle-orm";
import { base } from "../__core/app";
import { db } from "../database";
import * as schema from "../database/schema";

/**
 * CAPITAN TOUCH — A CACCIA DEI NEURONI PERDUTI
 * Specifica consegnata da Claudio il 04/09/2026.
 *
 * Due limiti separati, come ha chiesto lui:
 * · 3 RITROVAMENTI al giorno PER UTENTE (non 3 apparizioni totali sul sito, altrimenti i
 *   primi tre visitatori consumavano la giornata di tutti);
 * · scorta GLOBALE dei premi: i 5 Neuroni d'Oro sono 5 per tutto il portale, quindi
 *   2.000 persone possono giocare e i Neuroni d'Oro restano comunque 5.
 *
 * Il conteggio sta sul server: il browser non può regalarsi premi.
 * Nessun premio inventato: i neuroni sono gettoni di gioco, il contenuto reale del premio
 * (sconto, omaggio, coupon) lo scrive Claudio dal pannello riservato.
 */

const CODICE = () => (process.env.TBH_CODICE_ALLESTIMENTO ?? "").trim();

function controlla(codice: string) {
  const atteso = CODICE();
  if (!atteso) throw new Error("Codice riservato non configurato sul server.");
  if (codice.trim() !== atteso) throw new Error("Codice riservato errato.");
}

const NEURONI = ["comune", "speciale", "premio", "oro"] as const;
type Neurone = (typeof NEURONI)[number];

const AZIONI = ["scheda", "sito", "offerta", "luogo", "coupon"] as const;

/** Quanto è raro ogni tipo di neurone nell'estrazione. */
const PESO_NEURONE: Record<Neurone, number> = {
  comune: 60,
  speciale: 25,
  premio: 12,
  oro: 3,
};

/** Le tre pose ufficiali 3D con sfondo trasparente. */
const POSE = ["saluta", "cerca", "scappa"] as const;

/** Durata della comparsa: 5–10 secondi, poi Capitan Touch scappa. */
const DURATA_MIN = 5000;
const DURATA_MAX = 10000;

/** Una comparsa si può raccogliere solo entro il minuto: dopo è scappato davvero. */
const FINESTRA_CATTURA_MS = 60_000;

function oggi() {
  return new Date().toISOString().slice(0, 10);
}

function caso<T>(v: readonly T[]) {
  return v[Math.floor(Math.random() * v.length)]!;
}

function interoTra(min: number, max: number) {
  return min + Math.floor(Math.random() * (max - min + 1));
}

/** Estrazione con pesi: più alto il peso, più spesso esce. */
function pesata<T>(voci: { voce: T; peso: number }[]): T | null {
  const buoni = voci.filter((v) => v.peso > 0);
  if (!buoni.length) return null;
  const totale = buoni.reduce((s, v) => s + v.peso, 0);
  let t = Math.random() * totale;
  for (const v of buoni) {
    t -= v.peso;
    if (t <= 0) return v.voce;
  }
  return buoni[buoni.length - 1]!.voce;
}

/**
 * Prima accensione: crea la caccia con le posizioni autorizzate chieste da Claudio e i
 * gettoni del gioco (5 Neuroni d'Oro compresi). Gira una volta sola.
 * I titoli dei premi reali restano da scrivere nel pannello: qui non si promette nulla.
 */
async function preparaSeManca() {
  const esistenti = await db.select({ id: schema.cacce.id }).from(schema.cacce).limit(1);
  if (esistenti.length) return;

  const [caccia] = await db
    .insert(schema.cacce)
    .values({
      nome: "A caccia dei neuroni perduti — prima caccia",
      attiva: 1,
      probabilita: 35,
      maxAlGiorno: 3,
    })
    .returning();

  /** Le pagine autorizzate dell'elenco consegnato da Claudio. */
  const pagine: { pagina: string; etichetta: string; peso: number }[] = [
    { pagina: "/", etichetta: "Home page", peso: 5 },
    { pagina: "/tbh/societa", etichetta: "Pagine TBH — società", peso: 3 },
    { pagina: "/tbh/attivita", etichetta: "Pagine TBH — attività", peso: 3 },
    { pagina: "/tbh/pagine", etichetta: "Pagine TBH — indice", peso: 2 },
    { pagina: "/media", etichetta: "Media", peso: 3 },
    { pagina: "/dm", etichetta: "Media — DM", peso: 2 },
    { pagina: "/media/giochi", etichetta: "Media — giochi", peso: 3 },
    { pagina: "/sport", etichetta: "Sport", peso: 3 },
    { pagina: "/sport/squadre", etichetta: "Sport — squadre", peso: 2 },
    { pagina: "/eventi/miss-cool", etichetta: "Eventi", peso: 2 },
    { pagina: "/shop", etichetta: "Shop — Touch Plaza", peso: 4 },
    { pagina: "/community", etichetta: "Community", peso: 3 },
    { pagina: "/e/*", etichetta: "Schede delle attività commerciali", peso: 4 },
    { pagina: "/master/*", etichetta: "Schede master delle attività", peso: 2 },
    { pagina: "/cerca", etichetta: "Cercami · Seguimi · Trovami", peso: 3 },
    { pagina: "/territorio/mappa", etichetta: "Mappa TBH", peso: 4 },
  ];

  await db
    .insert(schema.posizioni)
    .values(pagine.map((p) => ({ ...p, cacciaId: caccia.id, attiva: 1 })));

  await db.insert(schema.premi).values([
    {
      cacciaId: caccia.id,
      neurone: "comune",
      titolo: "Neurone Comune",
      descrizione: "Gettone di gioco. Si accumula nella tua area personale.",
      disponibili: 5000,
    },
    {
      cacciaId: caccia.id,
      neurone: "speciale",
      titolo: "Neurone Speciale",
      descrizione: "Gettone raro. Si accumula nella tua area personale.",
      disponibili: 800,
    },
    {
      cacciaId: caccia.id,
      neurone: "premio",
      titolo: "Neurone Premio",
      descrizione: "Vale un premio del circuito TBH. Premio da definire dal pannello.",
      disponibili: 200,
    },
    {
      cacciaId: caccia.id,
      neurone: "oro",
      titolo: "Neurone d'Oro",
      descrizione: "Pezzo unico: 5 in tutto il portale. Premio da definire dal pannello.",
      disponibili: 5,
    },
  ]);
}

/** La caccia attualmente in corso: rispetta periodo e fascia oraria. */
async function cacciaInCorso() {
  await preparaSeManca();
  const righe = await db.select().from(schema.cacce).where(eq(schema.cacce.attiva, 1));
  const g = oggi();
  const ora = new Date().getHours();
  return (
    righe.find((c) => {
      if (c.dal && g < c.dal) return false;
      if (c.al && g > c.al) return false;
      if (c.oraDa != null && ora < c.oraDa) return false;
      if (c.oraA != null && ora > c.oraA) return false;
      return true;
    }) ?? null
  );
}

/** Quanti ritrovamenti ha già fatto oggi questo giocatore. */
async function ritrovamentiDiOggi(giocatore: string) {
  const [r] = await db
    .select({ n: sql<number>`count(*)` })
    .from(schema.ritrovamenti)
    .where(and(eq(schema.ritrovamenti.giocatore, giocatore), eq(schema.ritrovamenti.giorno, oggi())));
  return Number(r?.n ?? 0);
}

/** Una posizione autorizzata copre la pagina aperta? ("*" e "/e/*" valgono come jolly) */
function copre(pagina: string, autorizzata: string) {
  if (autorizzata === "*") return true;
  if (autorizzata.endsWith("/*")) return pagina.startsWith(autorizzata.slice(0, -1));
  return pagina === autorizzata;
}

const premioPubblico = z.object({
  neurone: z.string(),
  titolo: z.string(),
  descrizione: z.string().nullable(),
  azione: z.string().nullable(),
  linkUrl: z.string().nullable(),
  attivita: z.string().nullable(),
});

export const capitan = {
  /**
   * Stato del giocatore: tentativi che gli restano oggi, neuroni raccolti e
   * contatore pubblico dei Neuroni d'Oro ancora in circolazione.
   */
  stato: base
    .input(z.object({ giocatore: z.string().min(6).max(64) }))
    .handler(async ({ input }) => {
      const caccia = await cacciaInCorso();
      const usati = await ritrovamentiDiOggi(input.giocatore);
      const max = caccia?.maxAlGiorno ?? 3;

      const miei = await db
        .select()
        .from(schema.ritrovamenti)
        .where(eq(schema.ritrovamenti.giocatore, input.giocatore));

      const conta = (n: Neurone) => miei.filter((r) => r.neurone === n).length;

      const oro = caccia
        ? await db
            .select()
            .from(schema.premi)
            .where(and(eq(schema.premi.cacciaId, caccia.id), eq(schema.premi.neurone, "oro")))
        : [];
      const oroTotali = oro.reduce((s, p) => s + p.disponibili, 0);
      const oroAssegnati = oro.reduce((s, p) => s + p.assegnati, 0);

      return {
        attiva: !!caccia,
        caccia: caccia ? { id: caccia.id, nome: caccia.nome, sponsor: caccia.sponsor } : null,
        max,
        usati,
        rimasti: Math.max(0, max - usati),
        neuroni: {
          comune: conta("comune"),
          speciale: conta("speciale"),
          premio: conta("premio"),
          oro: conta("oro"),
        },
        premiConquistati: miei.filter((r) => r.neurone === "premio" || r.neurone === "oro").length,
        premiUtilizzati: miei.filter((r) => r.usato === 1).length,
        oroTotali,
        oroDisponibili: Math.max(0, oroTotali - oroAssegnati),
        oroEsauriti: oroTotali > 0 && oroAssegnati >= oroTotali,
      };
    }),

  /** Contatore pubblico dei Neuroni d'Oro: 5 → 4 → 3 → 2 → 1 → ESAURITI, senza dire dove sono. */
  contatoreOro: base.handler(async () => {
    const caccia = await cacciaInCorso();
    if (!caccia) return { totali: 0, disponibili: 0, esauriti: false };
    const oro = await db
      .select()
      .from(schema.premi)
      .where(and(eq(schema.premi.cacciaId, caccia.id), eq(schema.premi.neurone, "oro")));
    const totali = oro.reduce((s, p) => s + p.disponibili, 0);
    const assegnati = oro.reduce((s, p) => s + p.assegnati, 0);
    return {
      totali,
      disponibili: Math.max(0, totali - assegnati),
      esauriti: totali > 0 && assegnati >= totali,
    };
  }),

  /**
   * Il sito chiede: "in questa pagina Capitan Touch si fa vedere?".
   * Decide il server, scegliendo a caso fra le posizioni autorizzate. Se l'utente ha già
   * fatto i suoi 3 ritrovamenti di giornata, non compare più.
   */
  apparizione: base
    .input(
      z.object({
        giocatore: z.string().min(6).max(64),
        pagina: z.string().max(300),
      }),
    )
    .handler(async ({ input }) => {
      const caccia = await cacciaInCorso();
      if (!caccia) return { mostra: false as const, motivo: "nessuna-caccia" };

      const usati = await ritrovamentiDiOggi(input.giocatore);
      if (usati >= caccia.maxAlGiorno) {
        return { mostra: false as const, motivo: "limite-giornaliero" };
      }

      const autorizzate = await db
        .select()
        .from(schema.posizioni)
        .where(and(eq(schema.posizioni.cacciaId, caccia.id), eq(schema.posizioni.attiva, 1)));

      const buone = autorizzate.filter((p) => copre(input.pagina, p.pagina));
      if (!buone.length) return { mostra: false as const, motivo: "pagina-non-autorizzata" };

      const scelta = pesata(buone.map((p) => ({ voce: p, peso: p.peso })));
      if (!scelta) return { mostra: false as const, motivo: "pagina-non-autorizzata" };

      if (interoTra(1, 100) > caccia.probabilita) {
        return { mostra: false as const, motivo: "questa-volta-no" };
      }

      const [app] = await db
        .insert(schema.apparizioni)
        .values({
          giocatore: input.giocatore,
          cacciaId: caccia.id,
          pagina: input.pagina,
          giorno: oggi(),
        })
        .returning();

      return {
        mostra: true as const,
        apparizioneId: app.id,
        posa: caso(POSE),
        /** Resta in pagina 5–10 secondi: bisogna essere svelti. */
        durataMs: interoTra(DURATA_MIN, DURATA_MAX),
        /** Da quale bordo entra e a che altezza, così non copre sempre la stessa cosa. */
        lato: caso(["sinistra", "destra"] as const),
        altezza: interoTra(8, 62),
        etichetta: scelta.etichetta,
        rimastiPrima: Math.max(0, caccia.maxAlGiorno - usati),
      };
    }),

  /**
   * L'utente è stato abbastanza veloce e ha cliccato: assegna il neurone.
   * La scorta viene scalata con un aggiornamento condizionato, così due utenti
   * simultanei non possono prendere lo stesso ultimo Neurone d'Oro.
   */
  cattura: base
    .input(
      z.object({
        giocatore: z.string().min(6).max(64),
        apparizioneId: z.number(),
      }),
    )
    .output(
      z.object({
        ok: z.boolean(),
        motivo: z.string().nullable(),
        premio: premioPubblico.nullable(),
        rimasti: z.number(),
      }),
    )
    .handler(async ({ input }) => {
      const [app] = await db
        .select()
        .from(schema.apparizioni)
        .where(eq(schema.apparizioni.id, input.apparizioneId));

      if (!app || app.giocatore !== input.giocatore) {
        return { ok: false, motivo: "apparizione-non-valida", premio: null, rimasti: 0 };
      }
      const [caccia] = await db.select().from(schema.cacce).where(eq(schema.cacce.id, app.cacciaId));
      const max = caccia?.maxAlGiorno ?? 3;
      const usati = await ritrovamentiDiOggi(input.giocatore);
      /* Tentativi che restano oggi: serve anche nelle risposte negative, così la
         pagina non mostra mai uno zero finto quando i tentativi ci sono ancora. */
      const restano = Math.max(0, max - usati);

      if (app.cliccata === 1) {
        return { ok: false, motivo: "gia-raccolta", premio: null, rimasti: restano };
      }
      if (Date.now() - app.createdAt.getTime() > FINESTRA_CATTURA_MS) {
        return { ok: false, motivo: "scappato", premio: null, rimasti: restano };
      }
      if (usati >= max) {
        return { ok: false, motivo: "limite-giornaliero", premio: null, rimasti: 0 };
      }

      /* Segna subito la comparsa come raccolta: un doppio click non vale due premi. */
      const segnata = await db
        .update(schema.apparizioni)
        .set({ cliccata: 1 })
        .where(and(eq(schema.apparizioni.id, app.id), eq(schema.apparizioni.cliccata, 0)))
        .returning({ id: schema.apparizioni.id });
      if (!segnata.length) {
        return { ok: false, motivo: "gia-raccolta", premio: null, rimasti: 0 };
      }

      /* Fra i premi ancora in scorta, estrazione pesata (l'oro è raro). */
      const disponibili = await db
        .select()
        .from(schema.premi)
        .where(
          and(
            eq(schema.premi.cacciaId, app.cacciaId),
            eq(schema.premi.attivo, 1),
            lt(schema.premi.assegnati, schema.premi.disponibili),
          ),
        );

      if (!disponibili.length) {
        return { ok: false, motivo: "premi-esauriti", premio: null, rimasti: max - usati };
      }

      /* Si prova a scalare la scorta; se qualcuno ci ha battuto sul tempo si passa al successivo. */
      const ordine = [...disponibili].sort(() => Math.random() - 0.5);
      let vinto: typeof disponibili[number] | null = null;

      for (let giro = 0; giro < ordine.length && !vinto; giro++) {
        const candidato =
          pesata(
            ordine
              .filter((p) => p.assegnati < p.disponibili)
              .map((p) => ({ voce: p, peso: PESO_NEURONE[p.neurone as Neurone] ?? 1 })),
          ) ?? ordine[giro]!;

        const preso = await db
          .update(schema.premi)
          .set({ assegnati: sql`${schema.premi.assegnati} + 1` })
          .where(
            and(
              eq(schema.premi.id, candidato.id),
              lt(schema.premi.assegnati, schema.premi.disponibili),
            ),
          )
          .returning();

        if (preso.length) vinto = preso[0]!;
      }

      if (!vinto) {
        return { ok: false, motivo: "premi-esauriti", premio: null, rimasti: max - usati };
      }

      await db.insert(schema.ritrovamenti).values({
        giocatore: input.giocatore,
        cacciaId: app.cacciaId,
        premioId: vinto.id,
        neurone: vinto.neurone,
        titolo: vinto.titolo,
        pagina: app.pagina,
        giorno: oggi(),
      });

      return {
        ok: true,
        motivo: null,
        premio: {
          neurone: vinto.neurone,
          titolo: vinto.titolo,
          descrizione: vinto.descrizione,
          azione: vinto.azione,
          linkUrl: vinto.linkUrl,
          attivita: vinto.attivita,
        },
        rimasti: Math.max(0, max - usati - 1),
      };
    }),

  /** Area personale: neuroni trovati, premi conquistati, premi utilizzati. */
  portafoglio: base
    .input(z.object({ giocatore: z.string().min(6).max(64) }))
    .handler(async ({ input }) => {
      const righe = await db
        .select()
        .from(schema.ritrovamenti)
        .where(eq(schema.ritrovamenti.giocatore, input.giocatore))
        .orderBy(desc(schema.ritrovamenti.id))
        .limit(300);
      return {
        items: righe.map((r) => ({
          id: r.id,
          neurone: r.neurone,
          titolo: r.titolo,
          pagina: r.pagina,
          giorno: r.giorno,
          usato: r.usato === 1,
        })),
      };
    }),

  /** L'utente segna un premio come utilizzato/riscattato. */
  segnaUsato: base
    .input(z.object({ giocatore: z.string().min(6).max(64), id: z.number() }))
    .handler(async ({ input }) => {
      await db
        .update(schema.ritrovamenti)
        .set({ usato: 1 })
        .where(
          and(
            eq(schema.ritrovamenti.id, input.id),
            eq(schema.ritrovamenti.giocatore, input.giocatore),
          ),
        );
      return { ok: true as const };
    }),

  /* ─────────────── PANNELLO AMMINISTRATORE — TBH → Capitan Touch ─────────────── */

  /** Tutto il gioco in una chiamata: cacce, posizioni, premi. */
  adminElenco: base.input(z.object({ codice: z.string() })).handler(async ({ input }) => {
    controlla(input.codice);
    await preparaSeManca();
    const cacce = await db.select().from(schema.cacce).orderBy(desc(schema.cacce.id));
    const ids = cacce.map((c) => c.id);
    const posiz = ids.length
      ? await db.select().from(schema.posizioni).where(inArray(schema.posizioni.cacciaId, ids))
      : [];
    const prem = ids.length
      ? await db.select().from(schema.premi).where(inArray(schema.premi.cacciaId, ids))
      : [];
    return {
      cacce: cacce.map((c) => ({ ...c, createdAt: c.createdAt.toISOString() })),
      posizioni: posiz,
      premi: prem,
    };
  }),

  /** Nuova caccia oppure modifica di una esistente. */
  adminSalvaCaccia: base
    .input(
      z.object({
        codice: z.string(),
        id: z.number().optional(),
        nome: z.string().min(3).max(160),
        attiva: z.boolean().default(true),
        dal: z.string().max(10).nullable().default(null),
        al: z.string().max(10).nullable().default(null),
        oraDa: z.number().min(0).max(23).nullable().default(null),
        oraA: z.number().min(0).max(23).nullable().default(null),
        probabilita: z.number().min(1).max(100).default(35),
        maxAlGiorno: z.number().min(1).max(20).default(3),
        sponsor: z.string().max(160).nullable().default(null),
      }),
    )
    .handler(async ({ input }) => {
      controlla(input.codice);
      const dati = {
        nome: input.nome.trim(),
        attiva: input.attiva ? 1 : 0,
        dal: input.dal?.trim() || null,
        al: input.al?.trim() || null,
        oraDa: input.oraDa,
        oraA: input.oraA,
        probabilita: input.probabilita,
        maxAlGiorno: input.maxAlGiorno,
        sponsor: input.sponsor?.trim() || null,
      };
      if (input.id) {
        await db.update(schema.cacce).set(dati).where(eq(schema.cacce.id, input.id));
        return { id: input.id };
      }
      const [row] = await db.insert(schema.cacce).values(dati).returning();
      return { id: row.id };
    }),

  /** Accende o spegne la caccia (Attiva/Disattiva del pannello). */
  adminAttiva: base
    .input(z.object({ codice: z.string(), id: z.number(), attiva: z.boolean() }))
    .handler(async ({ input }) => {
      controlla(input.codice);
      await db
        .update(schema.cacce)
        .set({ attiva: input.attiva ? 1 : 0 })
        .where(eq(schema.cacce.id, input.id));
      return { ok: true as const };
    }),

  /** Posizione autorizzata: la pagina in cui l'avatar può comparire. */
  adminSalvaPosizione: base
    .input(
      z.object({
        codice: z.string(),
        id: z.number().optional(),
        cacciaId: z.number(),
        pagina: z.string().min(1).max(300),
        etichetta: z.string().min(2).max(160),
        peso: z.number().min(1).max(100).default(1),
        attiva: z.boolean().default(true),
      }),
    )
    .handler(async ({ input }) => {
      controlla(input.codice);
      const dati = {
        cacciaId: input.cacciaId,
        pagina: input.pagina.trim(),
        etichetta: input.etichetta.trim(),
        peso: input.peso,
        attiva: input.attiva ? 1 : 0,
      };
      if (input.id) {
        await db.update(schema.posizioni).set(dati).where(eq(schema.posizioni.id, input.id));
        return { id: input.id };
      }
      const [row] = await db.insert(schema.posizioni).values(dati).returning();
      return { id: row.id };
    }),

  adminEliminaPosizione: base
    .input(z.object({ codice: z.string(), id: z.number() }))
    .handler(async ({ input }) => {
      controlla(input.codice);
      await db.delete(schema.posizioni).where(eq(schema.posizioni.id, input.id));
      return { ok: true as const };
    }),

  /**
   * Premio e sua scorta. Attenzione: `disponibili` è la scorta globale.
   * Mettendo 5 su un Neurone d'Oro, quel premio esce 5 volte in tutto il portale.
   */
  adminSalvaPremio: base
    .input(
      z.object({
        codice: z.string(),
        id: z.number().optional(),
        cacciaId: z.number(),
        neurone: z.enum(NEURONI),
        titolo: z.string().min(2).max(160),
        descrizione: z.string().max(600).nullable().default(null),
        disponibili: z.number().min(0).max(100000).default(0),
        azione: z.enum(AZIONI).nullable().default(null),
        linkUrl: z.string().max(600).nullable().default(null),
        attivita: z.string().max(160).nullable().default(null),
        attivo: z.boolean().default(true),
      }),
    )
    .handler(async ({ input }) => {
      controlla(input.codice);
      const dati = {
        cacciaId: input.cacciaId,
        neurone: input.neurone,
        titolo: input.titolo.trim(),
        descrizione: input.descrizione?.trim() || null,
        disponibili: input.disponibili,
        azione: input.azione,
        linkUrl: input.linkUrl?.trim() || null,
        attivita: input.attivita?.trim() || null,
        attivo: input.attivo ? 1 : 0,
      };
      if (input.id) {
        await db.update(schema.premi).set(dati).where(eq(schema.premi.id, input.id));
        return { id: input.id };
      }
      const [row] = await db.insert(schema.premi).values(dati).returning();
      return { id: row.id };
    }),

  adminEliminaPremio: base
    .input(z.object({ codice: z.string(), id: z.number() }))
    .handler(async ({ input }) => {
      controlla(input.codice);
      await db.delete(schema.premi).where(eq(schema.premi.id, input.id));
      return { ok: true as const };
    }),

  /**
   * Statistiche: apparizioni, click, utenti partecipanti, pagine visitate,
   * attività raggiunte, premi assegnati e conversioni (click su apparizione).
   */
  adminStatistiche: base.input(z.object({ codice: z.string() })).handler(async ({ input }) => {
    controlla(input.codice);
    const app = await db.select().from(schema.apparizioni);
    const rit = await db.select().from(schema.ritrovamenti);
    const prem = await db.select().from(schema.premi);

    const click = app.filter((a) => a.cliccata === 1).length;
    const perPagina = new Map<string, { apparizioni: number; ritrovamenti: number }>();
    for (const a of app) {
      const v = perPagina.get(a.pagina) ?? { apparizioni: 0, ritrovamenti: 0 };
      v.apparizioni += 1;
      perPagina.set(a.pagina, v);
    }
    for (const r of rit) {
      const v = perPagina.get(r.pagina) ?? { apparizioni: 0, ritrovamenti: 0 };
      v.ritrovamenti += 1;
      perPagina.set(r.pagina, v);
    }

    const attivitaRaggiunte = new Set(
      prem
        .filter((p) => p.attivita && p.assegnati > 0)
        .map((p) => p.attivita as string),
    );

    return {
      apparizioni: app.length,
      click,
      conversione: app.length ? Math.round((click / app.length) * 100) : 0,
      utenti: new Set(app.map((a) => a.giocatore)).size,
      utentiConPremio: new Set(rit.map((r) => r.giocatore)).size,
      pagine: [...perPagina.entries()]
        .map(([pagina, v]) => ({ pagina, ...v }))
        .sort((a, b) => b.apparizioni - a.apparizioni),
      premiAssegnati: rit.length,
      premiUtilizzati: rit.filter((r) => r.usato === 1).length,
      attivitaRaggiunte: [...attivitaRaggiunte],
      perNeurone: NEURONI.map((n) => ({
        neurone: n,
        assegnati: rit.filter((r) => r.neurone === n).length,
        scorta: prem.filter((p) => p.neurone === n).reduce((s, p) => s + p.disponibili, 0),
      })),
    };
  }),

  /** Vincitori: chi ha preso cosa, con la pagina in cui l'ha trovato. */
  adminVincitori: base.input(z.object({ codice: z.string() })).handler(async ({ input }) => {
    controlla(input.codice);
    const righe = await db
      .select()
      .from(schema.ritrovamenti)
      .orderBy(desc(schema.ritrovamenti.id))
      .limit(500);
    return {
      items: righe.map((r) => ({
        id: r.id,
        /** Il codice giocatore è anonimo: senza login non esiste un nome da mostrare. */
        giocatore: r.giocatore.slice(0, 12),
        neurone: r.neurone,
        titolo: r.titolo,
        pagina: r.pagina,
        giorno: r.giorno,
        usato: r.usato === 1,
      })),
    };
  }),
};
