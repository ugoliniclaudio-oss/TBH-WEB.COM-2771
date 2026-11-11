import { z } from "zod";
import { and, asc, eq, like } from "drizzle-orm";
import { DeleteObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { ORPCError } from "@orpc/server";
import { base } from "../__core/app";
import { db } from "../database";
import * as schema from "../database/schema";
import { BUCKET, s3 } from "../lib/s3";
import { indirizzoMedia } from "../lib/media-url";

/* ────────────────────────────────────────────────────────────────────────────
   PRATICHE DI CARICAMENTO — il caricamento file per chi NON è amministratore.

   Ordine di Claudio del 28/09/2026 (punti 3–9): «il modulo di candidatura deve
   permettere di caricare davvero i file: FOTO PRINCIPALE, ALTRE FOTO,
   PORTFOLIO/DOCUMENTI, ALLEGATI. Formati JPG, JPEG, PNG, WEBP, PDF. Anteprima,
   SOSTITUISCI, ELIMINA, AGGIUNGI. Niente upload finti: il file deve essere
   trasferito davvero e risultare visibile e scaricabile dal pannello. […] Non
   rendere pubblici automaticamente documenti o allegati personali. […] Estendere
   lo stesso sistema alle altre sezioni, non uno diverso per pagina.»

   Come è risolto, e perché così:

   · Il Media Manager (routes/media.ts) chiede TBH_CODICE_ALLESTIMENTO a ogni
     scrittura. Chi compila una candidatura non ha quel codice e non deve averlo:
     con quel codice si potrebbe scrivere su QUALUNQUE slot del sito.
   · Non si duplica il sistema: i file finiscono nella stessa tabella `media`,
     con gli stessi slot, gli stessi comandi e la stessa Libreria. Cambia solo
     il permesso con cui si scrive.
   · Il permesso è una PRATICA: un token casuale, valido 24 ore, per un solo
     ambito, per i soli campi previsti da quell'ambito, con un tetto al numero
     di file e al peso. Lo slot su cui si scrive lo decide il server a partire
     dal token: il browser non può indicarlo.
   · I documenti personali nascono `riservato = 1`: non escono mai dalle letture
     pubbliche, nemmeno se qualcuno li "pubblica" per sbaglio dal pannello.
   · All'invio del modulo la pratica si chiude e i file passano sullo slot
     definitivo della riga (es. `missCool:candidatura:12:foto-principale`).

   Niente contenuto inventato: qui non si crea nessun dato: si trasferiscono solo
   i file che la persona ha scelto dal suo dispositivo.
   ──────────────────────────────────────────────────────────────────────────── */

/** Formati ammessi dall'ordine ricevuto, per i due tipi di campo. */
const FORMATI_FOTO = ["jpg", "jpeg", "png", "webp"] as const;
const FORMATI_DOCUMENTO = ["pdf", "jpg", "jpeg", "png", "webp"] as const;

/** Tetto di peso per file: 15 MB, più che sufficiente per una foto o un PDF. */
const PESO_MASSIMO = 15 * 1024 * 1024;

/** Durata del permesso: il tempo di compilare il modulo, non un accesso permanente. */
const DURATA_ORE = 24;

export interface CampoPratica {
  /** Chiave tecnica: diventa la coda dello slot. */
  campo: string;
  etichetta: string;
  aiuto: string;
  /** immagine = si vede in anteprima · documento = si scarica. */
  tipo: "immagine" | "documento";
  /** Quanti file al massimo su questo campo. */
  max: number;
  /** 1 = non esce mai dalle pagine pubbliche (documenti personali). */
  riservato: boolean;
  obbligatorio: boolean;
  formati: readonly string[];
}

/**
 * AMBITI PREVISTI. Un ambito che non è qui dentro non apre nessuna pratica:
 * è l'elenco chiuso dei moduli che possono ricevere file dal pubblico.
 */
export const AMBITI: Record<string, { etichetta: string; campi: CampoPratica[] }> = {
  "miss-cool": {
    etichetta: "Candidatura Touch Miss Cool",
    campi: [
      {
        campo: "foto-principale",
        etichetta: "Foto principale",
        aiuto: "Un primo piano recente, viso ben visibile. JPG, JPEG, PNG o WEBP.",
        tipo: "immagine",
        max: 1,
        riservato: false,
        obbligatorio: false,
        formati: FORMATI_FOTO,
      },
      {
        campo: "altre-foto",
        etichetta: "Altre foto",
        aiuto: "Figura intera e altri scatti: fino a 8 immagini.",
        tipo: "immagine",
        max: 8,
        riservato: false,
        obbligatorio: false,
        formati: FORMATI_FOTO,
      },
      {
        campo: "portfolio",
        etichetta: "Portfolio / documenti",
        aiuto: "Book, CV artistico, curriculum: PDF o immagini, fino a 5 file.",
        tipo: "documento",
        max: 5,
        riservato: true,
        obbligatorio: false,
        formati: FORMATI_DOCUMENTO,
      },
      {
        campo: "allegati",
        etichetta: "Allegati riservati",
        aiuto:
          "Documento d'identità, liberatoria firmata e altri allegati personali: restano privati, li vede solo la segreteria.",
        tipo: "documento",
        max: 5,
        riservato: true,
        obbligatorio: false,
        formati: FORMATI_DOCUMENTO,
      },
    ],
  },
  lavoro: {
    etichetta: "Candidatura Lavoro & Casting",
    campi: [
      {
        campo: "foto-principale",
        etichetta: "Foto",
        aiuto: "Una foto recente. JPG, JPEG, PNG o WEBP.",
        tipo: "immagine",
        max: 1,
        riservato: false,
        obbligatorio: false,
        formati: FORMATI_FOTO,
      },
      {
        campo: "altre-foto",
        etichetta: "Altre foto",
        aiuto: "Scatti di lavoro o di scena: fino a 6 immagini.",
        tipo: "immagine",
        max: 6,
        riservato: false,
        obbligatorio: false,
        formati: FORMATI_FOTO,
      },
      {
        campo: "portfolio",
        etichetta: "Curriculum / portfolio",
        aiuto: "CV in PDF, book, referenze: fino a 5 file.",
        tipo: "documento",
        max: 5,
        riservato: true,
        obbligatorio: false,
        formati: FORMATI_DOCUMENTO,
      },
      {
        campo: "allegati",
        etichetta: "Allegati riservati",
        aiuto: "Documenti personali: restano privati, li vede solo la segreteria.",
        tipo: "documento",
        max: 5,
        riservato: true,
        obbligatorio: false,
        formati: FORMATI_DOCUMENTO,
      },
    ],
  },
  /**
   * CANDIDATURA A UN CASTING VIDEOCLIP — Priorità 2quater (ordine del 29/09/2026):
   * «upload obbligatorio di FOTO, CV, PORTFOLIO, SHOWREEL/video (o link), documenti
   *  richiesti». Non nasce un secondo sistema di caricamento: è lo stesso di Miss Cool
   * e di Lavoro, con i campi di un casting. Lo showreel, che è un video e non si carica
   * dentro un modulo, si consegna come link nel campo apposito della candidatura.
   */
  casting: {
    etichetta: "Candidatura casting videoclip",
    campi: [
      {
        campo: "foto-principale",
        etichetta: "Foto principale",
        aiuto: "Un primo piano recente, viso ben visibile. JPG, JPEG, PNG o WEBP.",
        tipo: "immagine",
        max: 1,
        riservato: false,
        obbligatorio: true,
        formati: FORMATI_FOTO,
      },
      {
        campo: "altre-foto",
        etichetta: "Altre foto",
        aiuto: "Figura intera, foto di scena o di palco: fino a 6 immagini.",
        tipo: "immagine",
        max: 6,
        riservato: false,
        obbligatorio: false,
        formati: FORMATI_FOTO,
      },
      {
        campo: "cv",
        etichetta: "CV",
        aiuto: "Curriculum artistico o professionale in PDF (o immagine leggibile).",
        tipo: "documento",
        max: 2,
        riservato: true,
        obbligatorio: false,
        formati: FORMATI_DOCUMENTO,
      },
      {
        campo: "portfolio",
        etichetta: "Portfolio / book",
        aiuto: "Book fotografico, referenze, lavori precedenti: fino a 5 file.",
        tipo: "documento",
        max: 5,
        riservato: true,
        obbligatorio: false,
        formati: FORMATI_DOCUMENTO,
      },
      {
        campo: "documenti",
        etichetta: "Documenti richiesti",
        aiuto:
          "Documenti chiesti dalla produzione: restano privati, li vede solo la segreteria del casting.",
        tipo: "documento",
        max: 5,
        riservato: true,
        obbligatorio: false,
        formati: FORMATI_DOCUMENTO,
      },
    ],
  },
};

const ambiti = z.enum(["miss-cool", "lavoro", "casting"]);

function estensione(nome: string) {
  const m = /\.([a-z0-9]+)$/i.exec(nome.trim());
  return m ? m[1]!.toLowerCase() : "";
}

function token() {
  // 32 caratteri casuali: non indovinabile, e non è il codice di allestimento.
  const b = new Uint8Array(24);
  crypto.getRandomValues(b);
  return [...b].map((n) => n.toString(36).padStart(2, "0")).join("").slice(0, 32);
}

/** Slot di lavoro di una pratica, prima dell'invio del modulo. */
export function slotPratica(t: string, campo: string) {
  return `pratica:${t}:${campo}`;
}

async function apertaOppureErrore(t: string) {
  const [p] = await db
    .select()
    .from(schema.praticheCaricamento)
    .where(eq(schema.praticheCaricamento.token, t));
  if (!p) {
    throw new ORPCError("NOT_FOUND", {
      message: "Caricamento non riconosciuto: ricarica la pagina e riprova.",
    });
  }
  if (p.chiusa === 1) {
    throw new ORPCError("BAD_REQUEST", {
      message: "Il modulo è già stato inviato: per cambiare i file scrivi alla segreteria.",
    });
  }
  if (p.scadenza.getTime() < Date.now()) {
    throw new ORPCError("BAD_REQUEST", {
      message: "Tempo scaduto: ricarica la pagina e carica di nuovo i file.",
    });
  }
  return p;
}

function campoOppureErrore(ambito: string, campo: string): CampoPratica {
  const c = AMBITI[ambito]?.campi.find((x) => x.campo === campo);
  if (!c) {
    throw new ORPCError("BAD_REQUEST", { message: `Campo «${campo}» non previsto dal modulo.` });
  }
  return c;
}

function validaFile(c: CampoPratica, filename: string, contentType: string, peso: number) {
  const ext = estensione(filename);
  if (!ext || !c.formati.includes(ext)) {
    throw new ORPCError("BAD_REQUEST", {
      message: `«${filename}»: formato non ammesso. Su ${c.etichetta} si accettano ${c.formati
        .join(", ")
        .toUpperCase()}.`,
    });
  }
  const mime = (contentType || "").toLowerCase();
  const mimeOk =
    c.tipo === "documento"
      ? mime.startsWith("image/") || mime === "application/pdf" || mime === ""
      : mime.startsWith("image/") || mime === "";
  if (!mimeOk) {
    throw new ORPCError("BAD_REQUEST", {
      message: `«${filename}»: il tipo di file non corrisponde a quello richiesto.`,
    });
  }
  if (peso > PESO_MASSIMO) {
    throw new ORPCError("BAD_REQUEST", {
      message: `«${filename}» pesa troppo: il limite per file è 15 MB.`,
    });
  }
}

async function quantiFile(t: string, campo: string) {
  const rows = await db
    .select({ id: schema.media.id })
    .from(schema.media)
    .where(eq(schema.media.slot, slotPratica(t, campo)));
  return rows.length;
}

const rigaFile = z.object({
  id: z.number(),
  campo: z.string(),
  nome: z.string(),
  url: z.string(),
  tipo: z.string(),
  mime: z.string().nullable(),
  peso: z.number().nullable(),
  riservato: z.number(),
  ordine: z.number(),
});

async function elencoPratica(t: string) {
  const rows = await db
    .select()
    .from(schema.media)
    .where(like(schema.media.slot, `${slotPratica(t, "")}%`))
    .orderBy(asc(schema.media.ordine), asc(schema.media.id));
  return rows.map((r) => ({
    id: r.id,
    campo: r.slot.split(":").slice(2).join(":"),
    nome: r.titolo ?? r.chiave.split("/").pop() ?? "file",
    url: indirizzoMedia(r.chiave),
    tipo: r.tipo,
    mime: r.mime,
    peso: r.peso,
    riservato: r.riservato,
    ordine: r.ordine,
  }));
}

export const pratiche = {
  /**
   * Quali campi accetta un modulo e con quali limiti. Il modulo si disegna da qui:
   * formati ed etichette non si riscrivono nella pagina.
   */
  configurazione: base.input(z.object({ ambito: ambiti })).handler(async ({ input }) => {
    const a = AMBITI[input.ambito]!;
    return {
      ambito: input.ambito,
      etichetta: a.etichetta,
      pesoMassimo: PESO_MASSIMO,
      campi: a.campi.map((c) => ({ ...c, formati: [...c.formati] })),
    };
  }),

  /** Apre il permesso di caricamento. Si chiama alla prima scelta di un file. */
  apri: base.input(z.object({ ambito: ambiti })).handler(async ({ input }) => {
    const t = token();
    const scadenza = new Date(Date.now() + DURATA_ORE * 3600 * 1000);
    await db
      .insert(schema.praticheCaricamento)
      .values({ ambito: input.ambito, token: t, scadenza });
    return { token: t, ambito: input.ambito, scadenza: scadenza.toISOString() };
  }),

  /** I file già caricati su questa pratica (per anteprima, sostituzione, rimozione). */
  elenco: base
    .input(z.object({ token: z.string().min(8).max(64) }))
    .output(z.object({ items: z.array(rigaFile) }))
    .handler(async ({ input }) => {
      const [p] = await db
        .select()
        .from(schema.praticheCaricamento)
        .where(eq(schema.praticheCaricamento.token, input.token));
      if (!p) return { items: [] };
      return { items: await elencoPratica(input.token) };
    }),

  /**
   * Passo 1 — link firmato per mandare il file nell'archivio.
   * Lo slot NON arriva dal browser: si costruisce dal token e dal campo previsto.
   */
  presign: base
    .input(
      z.object({
        token: z.string().min(8).max(64),
        campo: z.string().min(1).max(60),
        filename: z.string().min(1).max(200),
        contentType: z.string().max(160).default(""),
        peso: z.number().int().min(0).default(0),
        /** true = si sta sostituendo un file già presente: non consuma un posto in più. */
        sostituisce: z.number().int().optional(),
      }),
    )
    .handler(async ({ input }) => {
      const p = await apertaOppureErrore(input.token);
      const c = campoOppureErrore(p.ambito, input.campo);
      validaFile(c, input.filename, input.contentType, input.peso);
      if (!input.sostituisce) {
        const n = await quantiFile(input.token, input.campo);
        if (n >= c.max) {
          throw new ORPCError("BAD_REQUEST", {
            message:
              c.max === 1
                ? `Su ${c.etichetta} si carica un solo file: usa SOSTITUISCI.`
                : `Su ${c.etichetta} si caricano al massimo ${c.max} file.`,
          });
        }
      }
      const pulito = input.filename.replace(/[^a-zA-Z0-9._-]+/g, "-").slice(-80);
      // La chiave contiene il token casuale: l'indirizzo del file non è indovinabile.
      const chiave = `candidature/${p.ambito}/${input.token}/${input.campo}/${Date.now()}-${pulito}`;
      const url = await getSignedUrl(
        s3,
        new PutObjectCommand({
          Bucket: BUCKET,
          Key: chiave,
          ContentType: input.contentType || "application/octet-stream",
        }),
        { expiresIn: 900 },
      );
      return { url, chiave };
    }),

  /** Passo 2 — registra nel portale il file appena trasferito. */
  salva: base
    .input(
      z.object({
        token: z.string().min(8).max(64),
        campo: z.string().min(1).max(60),
        chiave: z.string().min(1).max(400),
        nome: z.string().max(200).default(""),
        mime: z.string().max(160).optional(),
        peso: z.number().int().min(0).optional(),
        larghezza: z.number().int().min(0).optional(),
        altezza: z.number().int().min(0).optional(),
        /** id del file che questo sostituisce: la vecchia riga viene rimossa. */
        sostituisce: z.number().int().optional(),
      }),
    )
    .handler(async ({ input }) => {
      const p = await apertaOppureErrore(input.token);
      const c = campoOppureErrore(p.ambito, input.campo);
      const slot = slotPratica(input.token, input.campo);
      // Sicurezza: si registra solo una chiave scritta da questa pratica.
      if (!input.chiave.startsWith(`candidature/${p.ambito}/${input.token}/`)) {
        throw new ORPCError("BAD_REQUEST", { message: "File non riconosciuto per questa pratica." });
      }
      if (input.sostituisce) {
        const [vecchia] = await db
          .select()
          .from(schema.media)
          .where(and(eq(schema.media.id, input.sostituisce), eq(schema.media.slot, slot)));
        if (vecchia) {
          await db.delete(schema.media).where(eq(schema.media.id, vecchia.id));
          try {
            await s3.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: vecchia.chiave }));
          } catch {
            /* se il file non c'è più va bene comunque: lo slot è libero */
          }
        }
      }
      const n = await quantiFile(input.token, input.campo);
      if (n >= c.max) {
        throw new ORPCError("BAD_REQUEST", {
          message: `Su ${c.etichetta} si caricano al massimo ${c.max} file.`,
        });
      }
      const [row] = await db
        .insert(schema.media)
        .values({
          slot,
          chiave: input.chiave,
          tipo: c.tipo,
          titolo: input.nome.trim() || input.chiave.split("/").pop() || null,
          // I file di una candidatura restano in bozza: nessuna pagina li mostra
          // finché la redazione non decide. I documenti, inoltre, sono riservati.
          stato: "bozza",
          riservato: c.riservato ? 1 : 0,
          ordine: n + 1,
          mime: input.mime?.trim() || null,
          peso: input.peso ?? null,
          larghezza: input.larghezza ?? null,
          altezza: input.altezza ?? null,
        })
        .returning();
      return {
        id: row.id,
        campo: input.campo,
        nome: row.titolo ?? "file",
        url: indirizzoMedia(row.chiave),
        tipo: row.tipo,
        riservato: row.riservato,
      };
    }),

  /** Rimuove un file caricato per errore, prima dell'invio del modulo. */
  elimina: base
    .input(z.object({ token: z.string().min(8).max(64), id: z.number().int() }))
    .handler(async ({ input }) => {
      await apertaOppureErrore(input.token);
      const [row] = await db.select().from(schema.media).where(eq(schema.media.id, input.id));
      if (!row) return { ok: true as const };
      if (!row.slot.startsWith(`pratica:${input.token}:`)) {
        throw new ORPCError("FORBIDDEN", { message: "Questo file non appartiene al tuo modulo." });
      }
      await db.delete(schema.media).where(eq(schema.media.id, row.id));
      try {
        await s3.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: row.chiave }));
      } catch {
        /* già cancellato: va bene */
      }
      return { ok: true as const };
    }),
};

/**
 * CHIUSURA — si chiama dal modulo che riceve l'invio (es. missCool.candidati).
 * Sposta i file dagli slot di lavoro a quelli definitivi della riga creata e
 * chiude il permesso: da quel momento il browser non può più caricare niente.
 *
 * Torna il riepilogo che serve alla scheda: quanti file, e l'indirizzo della
 * foto principale quando c'è. Se il token non è valido non blocca l'invio del
 * modulo: la candidatura resta buona e il materiale si consegna dopo.
 */
export async function chiudiPratica(opzioni: {
  token: string | null | undefined;
  ambito: keyof typeof AMBITI;
  slotBase: string;
  riferimento: string;
}) {
  const t = (opzioni.token ?? "").trim();
  if (!t) return { collegata: false as const, nFile: 0, fotoPrincipale: null as string | null };
  const [p] = await db
    .select()
    .from(schema.praticheCaricamento)
    .where(eq(schema.praticheCaricamento.token, t));
  if (!p || p.ambito !== opzioni.ambito || p.chiusa === 1) {
    return { collegata: false as const, nFile: 0, fotoPrincipale: null as string | null };
  }

  const rows = await db
    .select()
    .from(schema.media)
    .where(like(schema.media.slot, `${slotPratica(t, "")}%`));

  let fotoPrincipale: string | null = null;
  const perCampo: Record<string, number> = {};
  for (const r of rows) {
    const campo = r.slot.split(":").slice(2).join(":");
    perCampo[campo] = (perCampo[campo] ?? 0) + 1;
    await db
      .update(schema.media)
      .set({ slot: `${opzioni.slotBase}:${campo}` })
      .where(eq(schema.media.id, r.id));
    if (campo === "foto-principale") fotoPrincipale = indirizzoMedia(r.chiave);
  }

  await db
    .update(schema.praticheCaricamento)
    .set({ chiusa: 1, riferimento: opzioni.riferimento, slotFinale: opzioni.slotBase })
    .where(eq(schema.praticheCaricamento.id, p.id));

  return {
    collegata: true as const,
    nFile: rows.length,
    fotoPrincipale,
    perCampo,
  };
}
