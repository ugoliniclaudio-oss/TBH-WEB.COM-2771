import { z } from "zod";
import { ORPCError } from "@orpc/server";
import { and, asc, desc, eq, like, or, sql } from "drizzle-orm";
import { base } from "../__core/app";
import { db } from "../database";
import * as schema from "../database/schema";
import {
  SEZIONI_AMMINISTRABILI,
  STATI_SCHEDA,
  sezione as trovaSezione,
  slotScheda,
} from "../data/sezioni-amministrabili";

/**
 * ────────────────────────────────────────────────────────────────────────────────
 * SCHEDE AMMINISTRABILI — le route del motore dei moduli (ordine del 28/09/2026).
 *
 * Un solo insieme di funzioni per TUTTE le sezioni del sito:
 *   sezioni      → l'elenco delle sezioni amministrabili e quanti contenuti hanno;
 *   elenco       → i contenuti di una sezione (pubblici, o tutti con il codice);
 *   dettaglio    → un contenuto singolo;
 *   salva        → crea o aggiorna un contenuto, campo per campo;
 *   cambiaStato  → bozza → anteprima → pubblicato → archiviato;
 *   riordina     → l'ordine con cui i contenuti compaiono nella pagina;
 *   elimina      → con avviso su quante immagini restano agganciate alla scheda.
 *
 * COSA NON FA, per scelta: non pubblica niente da sola e non inventa niente. Una
 * scheda nuova nasce in BOZZA, con i campi che l'amministratore ha scritto e nulla
 * di più. Nessun testo di esempio, nessun valore precompilato.
 *
 * DATI RISERVATI (punti 10 e 15 dell'ordine): una sezione marcata `riservata` nel
 * registro — oggi Lavoro/Candidature — non esce MAI dalle letture pubbliche,
 * qualunque sia lo stato delle sue schede. Lo stesso vale per la singola scheda con
 * `riservato = 1`. Il filtro sta QUI sul server: non è una scelta della pagina.
 *
 * ACCESSO: scrivere richiede il codice di allestimento (TBH_CODICE_ALLESTIMENTO),
 * lo stesso del Media Manager. Limite noto e dichiarato: è un codice unico condiviso,
 * non ancora un sistema di utenti con ruoli distinti.
 * ────────────────────────────────────────────────────────────────────────────────
 */

const CODICE = () => (process.env.TBH_CODICE_ALLESTIMENTO ?? "").trim();

function controlla(codice: string) {
  const atteso = CODICE();
  if (!atteso) throw new ORPCError("SERVICE_UNAVAILABLE", {
      message: "Codice di allestimento non configurato sul server.",
    });
  if (codice.trim() !== atteso) throw new ORPCError("UNAUTHORIZED", { message: "Codice di allestimento errato." });
}

function codiceValido(codice?: string | null) {
  const atteso = CODICE();
  return atteso.length > 0 && (codice ?? "").trim() === atteso;
}

/** Lo slug si ricava dal titolo: minuscolo, senza accenti, parole unite da "-". */
function slugifica(testo: string) {
  return testo
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

const pulsante = z.object({ testo: z.string().max(60), url: z.string().max(400) });

const riga = z.object({
  id: z.number(),
  chiave: z.string(),
  sezione: z.string(),
  slug: z.string(),
  titolo: z.string(),
  sottotitolo: z.string().nullable(),
  descrizione: z.string().nullable(),
  testo: z.string().nullable(),
  data: z.string().nullable(),
  categoria: z.string().nullable(),
  contatti: z.string().nullable(),
  telefono: z.string().nullable(),
  email: z.string().nullable(),
  luogo: z.string().nullable(),
  indirizzo: z.string().nullable(),
  mapsUrl: z.string().nullable(),
  linkUrl: z.string().nullable(),
  pulsanti: z.array(pulsante),
  campi: z.record(z.string(), z.string()),
  stato: z.string(),
  riservato: z.boolean(),
  notaInterna: z.string().nullable(),
  ordine: z.number(),
  /** Slot del Media Manager dove stanno copertina, gallery e allegati della scheda. */
  slot: z.object({ copertina: z.string(), gallery: z.string(), allegati: z.string() }),
  createdAt: z.string(),
  updatedAt: z.string(),
});

type RigaScheda = z.infer<typeof riga>;

function leggiJson(valore: string | null): Record<string, string> {
  if (!valore) return {};
  try {
    const dato = JSON.parse(valore);
    if (!dato || typeof dato !== "object" || Array.isArray(dato)) return {};
    const out: Record<string, string> = {};
    for (const [k, v] of Object.entries(dato)) {
      if (v === null || v === undefined) continue;
      out[k] = String(v);
    }
    return out;
  } catch {
    return {};
  }
}

function leggiPulsanti(valore: string | null): { testo: string; url: string }[] {
  if (!valore) return [];
  try {
    const dato = JSON.parse(valore);
    if (!Array.isArray(dato)) return [];
    return dato
      .filter((p) => p && typeof p === "object")
      .map((p) => ({ testo: String(p.testo ?? ""), url: String(p.url ?? "") }))
      .filter((p) => p.testo.length > 0 || p.url.length > 0)
      .slice(0, 4);
  } catch {
    return [];
  }
}

function vestiRiga(r: typeof schema.schede.$inferSelect, admin: boolean): RigaScheda {
  return {
    id: r.id,
    chiave: r.chiave,
    sezione: r.sezione,
    slug: r.slug,
    titolo: r.titolo,
    sottotitolo: r.sottotitolo,
    descrizione: r.descrizione,
    testo: r.testo,
    data: r.data,
    categoria: r.categoria,
    contatti: r.contatti,
    telefono: r.telefono,
    email: r.email,
    luogo: r.luogo,
    indirizzo: r.indirizzo,
    mapsUrl: r.mapsUrl,
    linkUrl: r.linkUrl,
    pulsanti: leggiPulsanti(r.pulsanti),
    campi: leggiJson(r.campi),
    stato: r.stato,
    riservato: r.riservato === 1,
    // La nota di redazione non esce mai in pubblico.
    notaInterna: admin ? r.notaInterna : null,
    ordine: r.ordine,
    slot: slotScheda(r.chiave),
    createdAt: r.createdAt.toISOString(),
    updatedAt: r.updatedAt.toISOString(),
  };
}

/** I campi che `salva` accetta: tutti facoltativi tranne il titolo alla creazione. */
const datiScheda = z.object({
  titolo: z.string().max(200).optional(),
  sottotitolo: z.string().max(300).nullable().optional(),
  descrizione: z.string().max(1200).nullable().optional(),
  testo: z.string().max(20000).nullable().optional(),
  data: z.string().max(80).nullable().optional(),
  categoria: z.string().max(80).nullable().optional(),
  contatti: z.string().max(300).nullable().optional(),
  telefono: z.string().max(80).nullable().optional(),
  email: z.string().max(160).nullable().optional(),
  luogo: z.string().max(160).nullable().optional(),
  indirizzo: z.string().max(300).nullable().optional(),
  mapsUrl: z.string().max(600).nullable().optional(),
  linkUrl: z.string().max(600).nullable().optional(),
  pulsanti: z.array(pulsante).max(4).optional(),
  campi: z.record(z.string(), z.string()).optional(),
  notaInterna: z.string().max(4000).nullable().optional(),
  stato: z.enum(STATI_SCHEDA).optional(),
  riservato: z.boolean().optional(),
  ordine: z.number().int().min(0).max(9999).optional(),
});

function normalizza(valore: string | null | undefined) {
  if (valore === undefined) return undefined;
  if (valore === null) return null;
  const pulito = valore.trim();
  return pulito.length > 0 ? pulito : null;
}

export const schede = {
  /**
   * L'elenco delle sezioni amministrabili con quanti contenuti hanno e in che stato.
   * È quello che apre il pannello: «scegli la sezione».
   */
  sezioni: base
    .input(z.object({ codice: z.string().optional() }).optional())
    .handler(async ({ input }) => {
      const admin = codiceValido(input?.codice);
      const conta = await db
        .select({
          sezione: schema.schede.sezione,
          stato: schema.schede.stato,
          n: sql<number>`count(*)`,
        })
        .from(schema.schede)
        .groupBy(schema.schede.sezione, schema.schede.stato);

      const per = new Map<string, Record<string, number>>();
      for (const r of conta) {
        const attuale = per.get(r.sezione) ?? {};
        attuale[r.stato] = Number(r.n);
        per.set(r.sezione, attuale);
      }

      return {
        attivo: CODICE().length > 0,
        admin,
        sezioni: SEZIONI_AMMINISTRABILI.map((s) => {
          const c = per.get(s.chiave) ?? {};
          const totale = Object.values(c).reduce((a, b) => a + b, 0);
          return {
            ...s,
            conteggi: {
              totale,
              bozza: c.bozza ?? 0,
              anteprima: c.anteprima ?? 0,
              pubblicato: c.pubblicato ?? 0,
              archiviato: c.archiviato ?? 0,
            },
          };
        }),
      };
    }),

  /**
   * I contenuti di una sezione. Senza codice escono SOLO quelli pubblicati e non
   * riservati: bozze e anteprime restano invisibili al pubblico.
   */
  elenco: base
    .input(
      z.object({
        sezione: z.string().min(1),
        codice: z.string().optional(),
        stato: z.enum(STATI_SCHEDA).optional(),
        q: z.string().max(120).optional(),
        limite: z.number().int().min(1).max(500).default(200),
      }),
    )
    .output(z.object({ items: z.array(riga), admin: z.boolean() }))
    .handler(async ({ input }) => {
      const admin = codiceValido(input.codice);
      const s = trovaSezione(input.sezione);
      // Una sezione riservata non risponde mai senza codice: nemmeno a elenco vuoto.
      if (!admin && s?.riservata) return { items: [], admin: false };

      const condizioni = [eq(schema.schede.sezione, input.sezione)];
      if (!admin) {
        condizioni.push(eq(schema.schede.stato, "pubblicato"));
        condizioni.push(eq(schema.schede.riservato, 0));
      } else if (input.stato) {
        condizioni.push(eq(schema.schede.stato, input.stato));
      }
      const q = (input.q ?? "").trim();
      if (q) {
        const p = `%${q}%`;
        condizioni.push(
          or(
            like(schema.schede.titolo, p),
            like(schema.schede.sottotitolo, p),
            like(schema.schede.descrizione, p),
            like(schema.schede.slug, p),
          )!,
        );
      }

      const rows = await db
        .select()
        .from(schema.schede)
        .where(and(...condizioni))
        .orderBy(asc(schema.schede.ordine), desc(schema.schede.id))
        .limit(input.limite);

      return { items: rows.map((r) => vestiRiga(r, admin)), admin };
    }),

  /** Una scheda singola, per chiave o per sezione+slug. */
  dettaglio: base
    .input(
      z.object({
        chiave: z.string().min(1).optional(),
        sezione: z.string().min(1).optional(),
        slug: z.string().min(1).optional(),
        codice: z.string().optional(),
      }),
    )
    .output(z.object({ scheda: riga.nullable() }))
    .handler(async ({ input }) => {
      const admin = codiceValido(input.codice);
      const dove = input.chiave
        ? eq(schema.schede.chiave, input.chiave)
        : input.sezione && input.slug
          ? and(eq(schema.schede.sezione, input.sezione), eq(schema.schede.slug, input.slug))
          : undefined;
      if (!dove) return { scheda: null };

      const [r] = await db.select().from(schema.schede).where(dove).limit(1);
      if (!r) return { scheda: null };

      const s = trovaSezione(r.sezione);
      if (!admin && (r.stato !== "pubblicato" || r.riservato === 1 || s?.riservata)) {
        return { scheda: null };
      }
      return { scheda: vestiRiga(r, admin) };
    }),

  /**
   * CREA o AGGIORNA un contenuto. Alla creazione serve solo il titolo: tutto il resto
   * si può riempire dopo, anche in giorni diversi. Una scheda nuova nasce in BOZZA.
   */
  salva: base
    .input(
      z.object({
        codice: z.string(),
        sezione: z.string().min(1),
        /** Presente = aggiorna quella scheda. Assente = ne crea una nuova. */
        chiave: z.string().min(1).optional(),
        /** Slug desiderato alla creazione: se manca nasce dal titolo. */
        slug: z.string().max(60).optional(),
        dati: datiScheda,
      }),
    )
    .output(z.object({ scheda: riga }))
    .handler(async ({ input }) => {
      controlla(input.codice);
      const s = trovaSezione(input.sezione);
      if (!s) throw new ORPCError("NOT_FOUND", { message: `Sezione sconosciuta: ${input.sezione}` });

      const d = input.dati;
      const patch: Record<string, unknown> = { updatedAt: new Date() };
      for (const campo of [
        "sottotitolo",
        "descrizione",
        "testo",
        "data",
        "categoria",
        "contatti",
        "telefono",
        "email",
        "luogo",
        "indirizzo",
        "mapsUrl",
        "linkUrl",
        "notaInterna",
      ] as const) {
        const v = normalizza(d[campo]);
        if (v !== undefined) patch[campo] = v;
      }
      if (d.titolo !== undefined) {
        const t = d.titolo.trim();
        if (t.length === 0) throw new ORPCError("BAD_REQUEST", { message: "Il titolo non può restare vuoto." });
        patch.titolo = t;
      }
      if (d.pulsanti !== undefined) {
        const validi = d.pulsanti.filter((p) => p.testo.trim() || p.url.trim());
        patch.pulsanti = validi.length > 0 ? JSON.stringify(validi) : null;
      }
      if (d.campi !== undefined) {
        const puliti: Record<string, string> = {};
        for (const [k, v] of Object.entries(d.campi)) {
          const val = String(v ?? "").trim();
          if (val.length > 0) puliti[k] = val.slice(0, 4000);
        }
        patch.campi = Object.keys(puliti).length > 0 ? JSON.stringify(puliti) : null;
      }
      if (d.stato !== undefined) patch.stato = d.stato;
      if (d.ordine !== undefined) patch.ordine = d.ordine;
      if (d.riservato !== undefined) patch.riservato = d.riservato ? 1 : 0;
      // Una sezione riservata impone il riservato su ogni sua scheda: non si disattiva.
      if (s.riservata) patch.riservato = 1;

      if (input.chiave) {
        const [esistente] = await db
          .select()
          .from(schema.schede)
          .where(eq(schema.schede.chiave, input.chiave))
          .limit(1);
        if (!esistente) throw new ORPCError("NOT_FOUND", { message: "Contenuto non trovato." });
        await db.update(schema.schede).set(patch).where(eq(schema.schede.id, esistente.id));
        const [fresco] = await db
          .select()
          .from(schema.schede)
          .where(eq(schema.schede.id, esistente.id))
          .limit(1);
        return { scheda: vestiRiga(fresco!, true) };
      }

      const titolo = (d.titolo ?? "").trim();
      if (!titolo) throw new ORPCError("BAD_REQUEST", {
        message: "Per creare un contenuto serve almeno il titolo.",
      });
      const radice = slugifica(input.slug?.trim() || titolo) || "contenuto";

      // Lo slug deve essere unico dentro la sezione: si aggiunge un numero se serve.
      const simili = await db
        .select({ slug: schema.schede.slug })
        .from(schema.schede)
        .where(and(eq(schema.schede.sezione, input.sezione), like(schema.schede.slug, `${radice}%`)));
      const presi = new Set(simili.map((r) => r.slug));
      let slug = radice;
      let n = 2;
      while (presi.has(slug)) slug = `${radice}-${n++}`;

      const ultimo = await db
        .select({ max: sql<number>`coalesce(max(${schema.schede.ordine}), -1)` })
        .from(schema.schede)
        .where(eq(schema.schede.sezione, input.sezione));

      const [creata] = await db
        .insert(schema.schede)
        .values({
          chiave: `${input.sezione}:${slug}`,
          sezione: input.sezione,
          slug,
          titolo,
          sottotitolo: (patch.sottotitolo as string | null) ?? null,
          descrizione: (patch.descrizione as string | null) ?? null,
          testo: (patch.testo as string | null) ?? null,
          data: (patch.data as string | null) ?? null,
          categoria: (patch.categoria as string | null) ?? null,
          contatti: (patch.contatti as string | null) ?? null,
          telefono: (patch.telefono as string | null) ?? null,
          email: (patch.email as string | null) ?? null,
          luogo: (patch.luogo as string | null) ?? null,
          indirizzo: (patch.indirizzo as string | null) ?? null,
          mapsUrl: (patch.mapsUrl as string | null) ?? null,
          linkUrl: (patch.linkUrl as string | null) ?? null,
          pulsanti: (patch.pulsanti as string | null) ?? null,
          campi: (patch.campi as string | null) ?? null,
          notaInterna: (patch.notaInterna as string | null) ?? null,
          // Nasce sempre in bozza, anche se la chiamata chiedesse altro.
          stato: "bozza",
          riservato: s.riservata || d.riservato ? 1 : 0,
          ordine: d.ordine ?? Number(ultimo[0]?.max ?? -1) + 1,
        })
        .returning();

      return { scheda: vestiRiga(creata!, true) };
    }),

  /**
   * Ciclo di stato: bozza → anteprima → pubblicato → archiviato, e ritorno.
   * Niente diventa pubblico senza che qualcuno lo scelga qui.
   */
  cambiaStato: base
    .input(
      z.object({
        codice: z.string(),
        chiave: z.string().min(1),
        stato: z.enum(STATI_SCHEDA),
      }),
    )
    .output(z.object({ scheda: riga }))
    .handler(async ({ input }) => {
      controlla(input.codice);
      const [r] = await db
        .select()
        .from(schema.schede)
        .where(eq(schema.schede.chiave, input.chiave))
        .limit(1);
      if (!r) throw new ORPCError("NOT_FOUND", { message: "Contenuto non trovato." });

      const s = trovaSezione(r.sezione);
      if (s?.riservata && input.stato === "pubblicato") {
        throw new ORPCError("FORBIDDEN", {
          message: "Questa sezione contiene dati personali: i suoi contenuti non si pubblicano.",
        });
      }
      if (r.riservato === 1 && input.stato === "pubblicato") {
        throw new ORPCError("FORBIDDEN", {
          message:
            "Il contenuto è marcato come riservato: togli il segno di riservato prima di pubblicarlo.",
        });
      }

      await db
        .update(schema.schede)
        .set({ stato: input.stato, updatedAt: new Date() })
        .where(eq(schema.schede.id, r.id));
      const [fresco] = await db
        .select()
        .from(schema.schede)
        .where(eq(schema.schede.id, r.id))
        .limit(1);
      return { scheda: vestiRiga(fresco!, true) };
    }),

  /** Ordine di comparsa dentro la sezione: l'elenco arriva già nell'ordine voluto. */
  riordina: base
    .input(z.object({ codice: z.string(), chiavi: z.array(z.string().min(1)).max(500) }))
    .handler(async ({ input }) => {
      controlla(input.codice);
      let i = 0;
      for (const chiave of input.chiavi) {
        await db
          .update(schema.schede)
          .set({ ordine: i++, updatedAt: new Date() })
          .where(eq(schema.schede.chiave, chiave));
      }
      return { ok: true as const, n: input.chiavi.length };
    }),

  /**
   * Quanti materiali del Media Manager sono agganciati a una scheda: serve per
   * avvisare prima di eliminarla («resterebbero 12 foto senza scheda»).
   */
  materiali: base
    .input(z.object({ chiave: z.string().min(1), codice: z.string().optional() }))
    .handler(async ({ input }) => {
      const rows = await db
        .select({ slot: schema.media.slot, tipo: schema.media.tipo })
        .from(schema.media)
        .where(like(schema.media.slot, `${input.chiave}%`));
      return {
        totale: rows.length,
        copertina: rows.filter((r) => r.slot === `${input.chiave}:copertina`).length,
        gallery: rows.filter((r) => r.slot.startsWith(`${input.chiave}:gallery`)).length,
        allegati: rows.filter((r) => r.slot.startsWith(`${input.chiave}:allegati`)).length,
      };
    }),

  /**
   * ELIMINA una scheda. Senza `forza` non cancella: risponde con quanti materiali
   * sono agganciati, così l'avviso è reale e non una domanda generica.
   * Le immagini NON vengono cancellate dall'archivio: restano in Libreria Media e
   * si possono riusare o eliminare da lì, dove l'avviso sui doppi usi è già attivo.
   */
  elimina: base
    .input(z.object({ codice: z.string(), chiave: z.string().min(1), forza: z.boolean().optional() }))
    .handler(async ({ input }) => {
      controlla(input.codice);
      const [r] = await db
        .select()
        .from(schema.schede)
        .where(eq(schema.schede.chiave, input.chiave))
        .limit(1);
      if (!r) return { ok: true as const, gia: true };

      const agganciati = await db
        .select({ slot: schema.media.slot })
        .from(schema.media)
        .where(like(schema.media.slot, `${input.chiave}%`));

      if (agganciati.length > 0 && input.forza !== true) {
        return {
          ok: false as const,
          materiali: agganciati.length,
          avviso:
            "A questo contenuto sono agganciati dei materiali: eliminandolo restano in Libreria Media, senza scheda.",
        };
      }

      await db.delete(schema.schede).where(eq(schema.schede.id, r.id));
      return { ok: true as const, materiali: agganciati.length };
    }),
};
