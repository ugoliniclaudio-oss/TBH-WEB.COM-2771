import { z } from "zod";
import { ORPCError } from "@orpc/server";
import { and, asc, desc, eq, like } from "drizzle-orm";
import { base } from "../__core/app";
import { db } from "../database";
import * as schema from "../database/schema";
import { catalogoCompleto } from "../lib/catalogo-musicale";
import { indirizzoMedia } from "../lib/media-url";
import { chiudiPratica } from "./pratiche";
import { avvisaPerEmail } from "../services/email";
import {
  AMBITI_CASTING,
  CASTING_SOTTOTITOLO,
  CATEGORIE_CASTING,
  CATALOGO_BRANI,
  CONSENSI_CASTING,
  CONSENSI_NOTA,
  STATI_CANDIDATURA,
  STATI_CASTING,
} from "../data/musica";

/**
 * ────────────────────────────────────────────────────────────────────────────────
 * CASTING VIDEOCLIP — Priorità 2quater (ordine di Claudio del 29/09/2026).
 *
 * «Ogni videoclip in preparazione deve poter generare il proprio casting, collegato
 *  all'ID del brano. Gli stessi casting devono comparire anche nella bacheca Lavoro &
 *  Casting SENZA DUPLICAZIONE: stesso record master.»
 *
 * Qui c'è quel record master, uno solo: la tabella `castings`. La pagina Casting
 * videoclip, la scheda del brano, Road to 2030 e la bacheca Lavoro & Casting leggono
 * tutte da qui e cambiano solo il filtro. Nessun annuncio viene copiato da una parte
 * all'altra e nessuna etichetta è scritta a mano.
 *
 * COSA NON FA:
 * · non apre casting da sé: se la direzione non ne registra uno, la sezione è vuota
 *   e lo dichiara («nessun casting aperto in questo momento»);
 * · non pubblica compensi non definiti, né date, location o cast inventati;
 * · non scrive testi legali: i consensi sono solo etichette di spunta, i testi
 *   integrali arrivano dall'editore (CONSENSI_NOTA).
 *
 * I FILE delle candidature non hanno un archivio proprio: usano le PRATICHE DI
 * CARICAMENTO (routes/pratiche.ts, ambito `casting`), lo stesso sistema di Miss Cool
 * e di Lavoro. All'invio la pratica si chiude e i file restano allegati alla riga
 * della candidatura, riservati.
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

/** Gli stati in cui un casting è ancora aperto al pubblico. */
const APERTI = ["aperto", "in-selezione"] as const;

type RigaCasting = typeof schema.castings.$inferSelect;

const ruoloSchema = z.object({
  ruolo: z.string().min(1).max(120),
  categoria: z.string().max(60).default(""),
  quantita: z.string().max(40).default(""),
  nota: z.string().max(300).default(""),
});
export type RuoloCasting = z.infer<typeof ruoloSchema>;

function ruoli(testo: string | null): RuoloCasting[] {
  if (!testo) return [];
  try {
    const v = JSON.parse(testo);
    if (!Array.isArray(v)) return [];
    return v
      .map((x) => ruoloSchema.safeParse(x))
      .filter((r): r is { success: true; data: RuoloCasting } => r.success)
      .map((r) => r.data);
  } catch {
    return [];
  }
}

function consensiDi(testo: string | null): Record<string, boolean | string> {
  if (!testo) return {};
  try {
    const v = JSON.parse(testo);
    return v && typeof v === "object" ? (v as Record<string, boolean | string>) : {};
  } catch {
    return {};
  }
}

function slugifica(testo: string) {
  return testo
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 70);
}

/** Lo slot dei file di una candidatura: `casting:candidatura:<id>`. */
function slotCandidatura(id: number) {
  return `casting:candidatura:${id}`;
}

/**
 * I BRANI IMPORTATI, tenuti da parte per la durata della richiesta.
 *
 * Dal 29/09/2026 un casting può essere agganciato anche a un brano importato da Suno
 * o da un altro indirizzo, non solo alle 40 uscite storiche del canale: la musica
 * esiste prima del videoclip, quindi il casting deve poterla trovare.
 */
type BranoAgganciabile = {
  id: string;
  titolo: string;
  artista: string | null;
  cover: string | null;
  audioUrl: string | null;
};

let braniImportati: BranoAgganciabile[] = [];

async function leggiBraniImportati(): Promise<BranoAgganciabile[]> {
  try {
    const catalogo = await catalogoCompleto();
    braniImportati = catalogo
      .filter((b) => b.origine === "importato")
      .map((b) => ({
        id: b.id,
        titolo: b.titolo,
        artista: b.artista,
        cover: b.cover,
        audioUrl: b.audioUrl,
      }));
  } catch {
    braniImportati = [];
  }
  return braniImportati;
}

/** Il brano del catalogo master a cui il casting è agganciato, se c'è. */
function branoDi(branoId: string | null) {
  if (!branoId) return null;
  const b = CATALOGO_BRANI.find((x) => x.id === branoId);
  if (b)
    return { id: b.id, titolo: b.titolo, artista: b.artista, cover: b.cover, audioUrl: b.audioUrl };
  const i = braniImportati.find((x) => x.id === branoId);
  return i ? { ...i } : null;
}

/** La forma pubblica di un casting: nessun campo vuoto viene riempito d'ufficio. */
function pubblico(r: RigaCasting) {
  return {
    id: r.id,
    slug: r.slug,
    ambito: r.ambito,
    stato: r.stato,
    titolo: r.titolo,
    titoloProgetto: r.titoloProgetto,
    descrizione: r.descrizione,
    requisiti: r.requisiti,
    location: r.location,
    periodo: r.periodo,
    scadenza: r.scadenza,
    produzione: r.produzione,
    /** Pubblicato solo se la produzione l'ha definito. */
    compenso: r.compenso,
    locandina: r.locandina,
    ruoli: ruoli(r.ruoli),
    brano: branoDi(r.branoId),
    aperto: (APERTI as readonly string[]).includes(r.stato),
  };
}

/** I file allegati a una candidatura, letti dall'archivio unico dei media. */
async function allegatiDi(id: number) {
  const righe = await db
    .select()
    .from(schema.media)
    .where(like(schema.media.slot, `${slotCandidatura(id)}%`))
    .orderBy(asc(schema.media.ordine), asc(schema.media.id));
  return righe.map((r) => ({
    id: r.id,
    campo: r.slot.split(":").slice(3).join(":"),
    nome: r.titolo ?? r.chiave.split("/").pop() ?? "file",
    url: indirizzoMedia(r.chiave),
    tipo: r.tipo,
    riservato: r.riservato,
  }));
}

export const casting = {
  /**
   * L'ELENCO — una sola lettura per la pagina Casting videoclip, per il carosello
   * «CASTING APERTI» e per la bacheca Lavoro & Casting. I filtri li applica la
   * pagina su questo stesso elenco: nessun secondo endpoint, nessun doppione.
   */
  elenco: base
    .input(
      z
        .object({
          ambito: z.enum(AMBITI_CASTING).optional(),
          soloAperti: z.boolean().optional(),
        })
        .optional(),
    )
    .handler(async ({ input }) => {
      let righe: RigaCasting[] = [];
      await leggiBraniImportati();
      try {
        righe = await db.select().from(schema.castings).orderBy(desc(schema.castings.id));
      } catch {
        righe = [];
      }
      let elenco = righe.map(pubblico);
      if (input?.ambito) elenco = elenco.filter((c) => c.ambito === input.ambito);
      if (input?.soloAperti) elenco = elenco.filter((c) => c.aperto);
      return {
        casting: elenco,
        conteggi: {
          totale: elenco.length,
          aperti: elenco.filter((c) => c.stato === "aperto").length,
          inSelezione: elenco.filter((c) => c.stato === "in-selezione").length,
          chiusi: elenco.filter((c) => c.stato === "chiuso" || c.stato === "cast-completato").length,
        },
        categorie: CATEGORIE_CASTING.map((c) => ({ ...c })),
        sottotitolo: CASTING_SOTTOTITOLO,
        consensi: CONSENSI_CASTING.map((c) => ({ ...c })),
        consensiNota: CONSENSI_NOTA,
      };
    }),

  /** LA SCHEDA di un casting, per indirizzo pubblico. */
  scheda: base
    .input(z.object({ slug: z.string().min(1).max(80) }))
    .handler(async ({ input }) => {
      const [r] = await db.select().from(schema.castings).where(eq(schema.castings.slug, input.slug));
      if (!r) throw new ORPCError("NOT_FOUND", { message: "Casting non trovato." });
      return {
        casting: pubblico(r),
        categorie: CATEGORIE_CASTING.map((c) => ({ ...c })),
        consensi: CONSENSI_CASTING.map((c) => ({ ...c })),
        consensiNota: CONSENSI_NOTA,
      };
    }),

  /**
   * LA CANDIDATURA — pubblica, senza codice. I file sono già stati trasferiti
   * davvero dalla pratica di caricamento: qui la pratica si chiude e i file
   * restano legati a questa riga.
   */
  candidati: base
    .input(
      z.object({
        slug: z.string().min(1).max(80),
        ruolo: z.string().min(1).max(120),
        categoria: z.string().max(60).optional(),
        nome: z.string().min(1).max(80),
        cognome: z.string().min(1).max(80),
        dataNascita: z.string().max(40).optional(),
        citta: z.string().max(80).optional(),
        telefono: z.string().max(40).optional(),
        email: z.string().max(140).optional(),
        esperienze: z.string().max(3000).optional(),
        presentazione: z.string().max(3000).optional(),
        social: z.string().max(500).optional(),
        linkShowreel: z.string().max(500).optional(),
        /** Le spunte accettate: solo le chiavi previste da CONSENSI_CASTING. */
        consensi: z.array(z.string().max(40)).default([]),
        /** Token della pratica di caricamento (foto, CV, portfolio, documenti). */
        tokenCaricamento: z.string().max(64).optional(),
      }),
    )
    .handler(async ({ input }) => {
      const [c] = await db.select().from(schema.castings).where(eq(schema.castings.slug, input.slug));
      if (!c) throw new ORPCError("NOT_FOUND", { message: "Casting non trovato." });
      if (!(APERTI as readonly string[]).includes(c.stato))
        throw new ORPCError("BAD_REQUEST", {
          message: "Le candidature per questo casting sono chiuse.",
        });

      // Consensi obbligatori: senza quelli la candidatura non parte.
      const dati = new Set(input.consensi);
      const mancanti = CONSENSI_CASTING.filter((x) => x.obbligatorio && !dati.has(x.k));
      if (mancanti.length > 0)
        throw new ORPCError("BAD_REQUEST", {
          message: `Per inviare servono i consensi: ${mancanti.map((m) => m.etichetta).join(", ")}.`,
        });

      if (!input.telefono?.trim() && !input.email?.trim())
        throw new ORPCError("BAD_REQUEST", {
          message: "Lascia almeno un contatto: telefono o email.",
        });

      const ammessi = new Set(CONSENSI_CASTING.map((x) => x.k));
      const consensi: Record<string, string> = {};
      const quando = new Date().toISOString();
      for (const k of input.consensi) if (ammessi.has(k as never)) consensi[k] = quando;

      const [riga] = await db
        .insert(schema.castingCandidature)
        .values({
          castingId: c.id,
          ruolo: input.ruolo.trim(),
          categoria: (input.categoria ?? "").trim() || null,
          nome: input.nome.trim(),
          cognome: input.cognome.trim(),
          dataNascita: (input.dataNascita ?? "").trim() || null,
          citta: (input.citta ?? "").trim() || null,
          telefono: (input.telefono ?? "").trim() || null,
          email: (input.email ?? "").trim() || null,
          esperienze: (input.esperienze ?? "").trim() || null,
          presentazione: (input.presentazione ?? "").trim() || null,
          social: (input.social ?? "").trim() || null,
          linkShowreel: (input.linkShowreel ?? "").trim() || null,
          consensi: JSON.stringify(consensi),
          allegati: "[]",
          stato: "ricevuta",
        })
        .returning();

      // I file trasferiti passano dallo slot di lavoro allo slot definitivo della riga.
      const materiale = await chiudiPratica({
        token: input.tokenCaricamento,
        ambito: "casting",
        slotBase: slotCandidatura(riga.id),
        riferimento: `casting:${c.slug}:candidatura:${riga.id}`,
      });

      if (materiale.collegata) {
        await db
          .update(schema.castingCandidature)
          .set({
            allegati: JSON.stringify({
              slotBase: slotCandidatura(riga.id),
              nFile: materiale.nFile,
              fotoPrincipale: materiale.fotoPrincipale,
              perCampo: materiale.perCampo ?? {},
            }),
            updatedAt: new Date(),
          })
          .where(eq(schema.castingCandidature.id, riga.id));
      }

      // Avviso a lavoro@tibihacca.com (solo se Resend è configurato sul server).
      const notificata = await avvisaPerEmail(
        `CASTING ${c.titolo} — candidatura online #${riga.id}`,
        [
          ["Casting", c.titolo],
          ["Ruolo", riga.ruolo],
          ["Categoria", riga.categoria],
          ["Nome", `${riga.nome} ${riga.cognome}`],
          ["Data di nascita", riga.dataNascita],
          ["Città", riga.citta],
          ["Telefono", riga.telefono],
          ["Email", riga.email],
          ["Esperienze", riga.esperienze],
          ["Presentazione", riga.presentazione],
          ["Social", riga.social],
          ["Showreel", riga.linkShowreel],
          ["File caricati", materiale.collegata ? String(materiale.nFile) : null],
        ],
        riga.email,
        "Foto e allegati sono nel pannello di allestimento → Casting.",
      );

      return {
        ok: true as const,
        numero: riga.id,
        notificata,
        casting: c.titolo,
        materiale: { collegato: materiale.collegata, nFile: materiale.nFile },
      };
    }),

  /* ══════════════════════════════════════════════════════════════════════════
     BACKOFFICE — dal pannello di allestimento. Serve il codice, come per il
     Media Manager e per la regia dei videoclip.
     ══════════════════════════════════════════════════════════════════════════ */

  /** Crea o aggiorna un casting. Lo slug nasce dal titolo e non cambia più. */
  salva: base
    .input(
      z.object({
        codice: z.string(),
        /** Vuoto = nuovo casting. */
        id: z.number().int().optional(),
        branoId: z.string().max(40).nullable().optional(),
        ambito: z.enum(AMBITI_CASTING).default("videoclip"),
        titolo: z.string().min(3).max(160),
        titoloProgetto: z.string().max(160).nullable().optional(),
        descrizione: z.string().max(4000).nullable().optional(),
        requisiti: z.string().max(4000).nullable().optional(),
        location: z.string().max(200).nullable().optional(),
        periodo: z.string().max(200).nullable().optional(),
        scadenza: z.string().max(40).nullable().optional(),
        produzione: z.string().max(200).nullable().optional(),
        compenso: z.string().max(300).nullable().optional(),
        stato: z.enum(STATI_CASTING).default("aperto"),
        locandina: z.string().max(500).nullable().optional(),
        ruoli: z.array(ruoloSchema).default([]),
        nota: z.string().max(1000).nullable().optional(),
      }),
    )
    .handler(async ({ input }) => {
      controlla(input.codice);
      if (input.branoId) {
        const storico = CATALOGO_BRANI.some((b) => b.id === input.branoId);
        const importato = (await leggiBraniImportati()).some((b) => b.id === input.branoId);
        if (!storico && !importato)
          throw new ORPCError("BAD_REQUEST", { message: "Brano non presente nel catalogo master." });
      }

      const valori = {
        branoId: (input.branoId ?? "").trim() || null,
        ambito: input.ambito,
        titolo: input.titolo.trim(),
        titoloProgetto: (input.titoloProgetto ?? "").trim() || null,
        descrizione: (input.descrizione ?? "").trim() || null,
        requisiti: (input.requisiti ?? "").trim() || null,
        location: (input.location ?? "").trim() || null,
        periodo: (input.periodo ?? "").trim() || null,
        scadenza: (input.scadenza ?? "").trim() || null,
        produzione: (input.produzione ?? "").trim() || null,
        compenso: (input.compenso ?? "").trim() || null,
        stato: input.stato,
        locandina: (input.locandina ?? "").trim() || null,
        ruoli: JSON.stringify(input.ruoli),
        nota: (input.nota ?? "").trim() || null,
        updatedAt: new Date(),
      };

      if (input.id) {
        await db.update(schema.castings).set(valori).where(eq(schema.castings.id, input.id));
        const [r] = await db.select().from(schema.castings).where(eq(schema.castings.id, input.id));
        if (!r) throw new ORPCError("NOT_FOUND", { message: "Casting non trovato." });
        return { casting: pubblico(r) };
      }

      // Slug unico: se il titolo è già usato si aggiunge un numero, non si sovrascrive.
      const radice = slugifica(input.titolo) || "casting";
      let slug = radice;
      for (let n = 2; n < 60; n++) {
        const [esiste] = await db.select().from(schema.castings).where(eq(schema.castings.slug, slug));
        if (!esiste) break;
        slug = `${radice}-${n}`;
      }
      const [r] = await db
        .insert(schema.castings)
        .values({ ...valori, slug })
        .returning();
      return { casting: pubblico(r) };
    }),

  /** Cambia solo lo stato: chiuso il casting, l'etichetta CASTING APERTO sparisce da sola. */
  stato: base
    .input(z.object({ codice: z.string(), id: z.number().int(), stato: z.enum(STATI_CASTING) }))
    .handler(async ({ input }) => {
      controlla(input.codice);
      await db
        .update(schema.castings)
        .set({ stato: input.stato, updatedAt: new Date() })
        .where(eq(schema.castings.id, input.id));
      const [r] = await db.select().from(schema.castings).where(eq(schema.castings.id, input.id));
      if (!r) throw new ORPCError("NOT_FOUND", { message: "Casting non trovato." });
      return { casting: pubblico(r) };
    }),

  /** Cancella un casting che non doveva esistere. Le candidature ricevute restano leggibili. */
  elimina: base
    .input(z.object({ codice: z.string(), id: z.number().int() }))
    .handler(async ({ input }) => {
      controlla(input.codice);
      await db.delete(schema.castings).where(eq(schema.castings.id, input.id));
      return { ok: true as const, id: input.id };
    }),

  /** LE CANDIDATURE di un casting, con i file davvero caricati. Mai pubbliche. */
  candidature: base
    .input(z.object({ codice: z.string(), castingId: z.number().int() }))
    .handler(async ({ input }) => {
      controlla(input.codice);
      const righe = await db
        .select()
        .from(schema.castingCandidature)
        .where(eq(schema.castingCandidature.castingId, input.castingId))
        .orderBy(desc(schema.castingCandidature.id));

      const elenco = await Promise.all(
        righe.map(async (r) => ({
          id: r.id,
          ruolo: r.ruolo,
          categoria: r.categoria,
          nome: r.nome,
          cognome: r.cognome,
          dataNascita: r.dataNascita,
          citta: r.citta,
          telefono: r.telefono,
          email: r.email,
          esperienze: r.esperienze,
          presentazione: r.presentazione,
          social: r.social,
          linkShowreel: r.linkShowreel,
          consensi: consensiDi(r.consensi),
          stato: r.stato,
          noteInterne: r.noteInterne,
          ricevuta: r.createdAt,
          allegati: await allegatiDi(r.id),
        })),
      );

      const perStato = Object.fromEntries(
        STATI_CANDIDATURA.map((s) => [s, elenco.filter((c) => c.stato === s).length]),
      );
      return { candidature: elenco, perStato, stati: [...STATI_CANDIDATURA] };
    }),

  /** Sposta una candidatura nella pipeline e aggiorna le note interne. */
  statoCandidatura: base
    .input(
      z.object({
        codice: z.string(),
        id: z.number().int(),
        stato: z.enum(STATI_CANDIDATURA).optional(),
        noteInterne: z.string().max(2000).nullable().optional(),
      }),
    )
    .handler(async ({ input }) => {
      controlla(input.codice);
      const dati: Record<string, unknown> = { updatedAt: new Date() };
      if (input.stato) dati.stato = input.stato;
      if (input.noteInterne !== undefined) dati.noteInterne = (input.noteInterne ?? "").trim() || null;
      await db
        .update(schema.castingCandidature)
        .set(dati)
        .where(eq(schema.castingCandidature.id, input.id));
      const [r] = await db
        .select()
        .from(schema.castingCandidature)
        .where(eq(schema.castingCandidature.id, input.id));
      if (!r) throw new ORPCError("NOT_FOUND", { message: "Candidatura non trovata." });
      return { id: r.id, stato: r.stato, noteInterne: r.noteInterne };
    }),

  /**
   * IL QUADRO DEL BACKOFFICE: casting con il numero di candidature ricevute, così il
   * pannello non deve interrogare una candidatura alla volta.
   */
  quadro: base.input(z.object({ codice: z.string() })).handler(async ({ input }) => {
    controlla(input.codice);
    const righe = await db.select().from(schema.castings).orderBy(desc(schema.castings.id));
    const cand = await db.select().from(schema.castingCandidature);
    return {
      casting: righe.map((r) => {
        const mie = cand.filter((c) => c.castingId === r.id);
        return {
          ...pubblico(r),
          nota: r.nota,
          candidature: mie.length,
          daValutare: mie.filter((c) => c.stato === "ricevuta" || c.stato === "da-valutare").length,
          selezionate: mie.filter((c) => c.stato === "selezionata").length,
        };
      }),
      stati: [...STATI_CASTING],
      ambiti: [...AMBITI_CASTING],
      categorie: CATEGORIE_CASTING.map((c) => ({ ...c })),
      brani: [
        ...(await leggiBraniImportati()).map((b) => ({
          id: b.id,
          titolo: b.titolo || "(scheda da completare)",
        })),
        ...CATALOGO_BRANI.map((b) => ({ id: b.id, titolo: b.titolo })),
      ],
    };
  }),
};

/** Usata dalle pagine di servizio: casting aperto di un dato brano, se esiste. */
export async function castingApertoDiBrano(branoId: string) {
  const righe = await db
    .select()
    .from(schema.castings)
    .where(and(eq(schema.castings.branoId, branoId), eq(schema.castings.stato, "aperto")));
  return righe[0] ? pubblico(righe[0]) : null;
}
