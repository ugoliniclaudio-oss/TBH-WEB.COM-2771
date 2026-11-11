import { z } from "zod";
import { asc, desc, eq, like } from "drizzle-orm";
import { ORPCError } from "@orpc/server";
import { base } from "../__core/app";
import { db } from "../database";
import * as schema from "../database/schema";
import { chiudiPratica } from "./pratiche";
import { indirizzoMedia } from "../lib/media-url";
import { avvisaPerEmail as inviaAvviso, emailConfigurata } from "../services/email";
import {
  ANNUNCI_LAVORO,
  CONSENSI_LAVORO,
  CONSENSI_LAVORO_NOTA,
  DESTINATARIO_CANDIDATURE,
  STATI_CANDIDATURA_LAVORO,
  trovaAnnuncioLavoro,
} from "../data/annunci-lavoro";

/* ────────────────────────────────────────────────────────────────────────────
   CANDIDATURA ONLINE AGLI ANNUNCI DELLA BACHECCA LAVORO (04/10/2026).

   Claudio: «Voglio il modulo online» — al posto della sola e-mail precompilata.

   · La candidatura si salva SEMPRE nel portale (tabella lavoro_candidature) e si
     legge dal pannello /allestimento/candidature-lavoro con il codice di allestimento.
   · I file passano dalle pratiche di caricamento (ambito `lavoro`): CV e allegati
     restano riservati, nessuna pagina pubblica li mostra.
   · L'avviso e-mail a lavoro@tibihacca.com parte solo se sul server è configurato
     un servizio di posta (RESEND_API_KEY + EMAIL_MITTENTE su dominio verificato).
     Finché manca, il sito NON finge l'invio: la risposta dice `notificata: false`
     e la candidatura resta comunque registrata nel pannello.
   ──────────────────────────────────────────────────────────────────────────── */

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

function slotCandidatura(id: number) {
  return `lavoro:candidatura:${id}`;
}

function pulito(v: string | null | undefined) {
  const t = (v ?? "").trim();
  return t ? t : null;
}

const avvisaPerEmail = (o: string, r: [string, string | null][], to: string | null) =>
  inviaAvviso(o, r, to, "I file allegati sono nel pannello di allestimento → Candidature lavoro.");

async function allegatiDi(id: number) {
  const righe = await db
    .select()
    .from(schema.media)
    .where(like(schema.media.slot, `${slotCandidatura(id)}:%`))
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

const slugAnnuncio = z.string().min(1).max(80);

export const candidatureLavoro = {
  /** Configurazione pubblica del modulo per un annuncio. */
  modulo: base.input(z.object({ annuncio: slugAnnuncio })).handler(async ({ input }) => {
    const a = trovaAnnuncioLavoro(input.annuncio);
    if (!a) throw new ORPCError("NOT_FOUND", { message: "Annuncio non trovato." });
    return {
      annuncio: a,
      consensi: CONSENSI_LAVORO.map((c) => ({ ...c })),
      consensiNota: CONSENSI_LAVORO_NOTA,
      destinatario: DESTINATARIO_CANDIDATURE,
    };
  }),

  /** Invio pubblico della candidatura. */
  invia: base
    .input(
      z.object({
        annuncio: slugAnnuncio,
        ruolo: z.string().max(160).default(""),
        nome: z.string().min(1).max(80),
        cognome: z.string().min(1).max(80),
        dataNascita: z.string().max(20).optional(),
        citta: z.string().max(120).optional(),
        zona: z.string().max(200).optional(),
        telefono: z.string().max(40).optional(),
        email: z.string().max(160).optional(),
        esperienze: z.string().max(4000).optional(),
        presentazione: z.string().max(4000).optional(),
        attrezzatura: z.string().max(2000).optional(),
        disponibilita: z.string().max(1000).optional(),
        social: z.string().max(400).optional(),
        linkLavori: z.string().max(600).optional(),
        consensi: z.array(z.string().max(40)).max(10),
        tokenCaricamento: z.string().max(64).optional(),
      }),
    )
    .handler(async ({ input }) => {
      const a = trovaAnnuncioLavoro(input.annuncio);
      if (!a) throw new ORPCError("NOT_FOUND", { message: "Annuncio non trovato." });

      const ruolo = a.ruoli.length > 0 ? input.ruolo.trim() : a.titolo;
      if (a.ruoli.length > 0 && !a.ruoli.includes(ruolo))
        throw new ORPCError("BAD_REQUEST", { message: "Scegli il ruolo per cui ti candidi." });

      const dati = new Set(input.consensi);
      const mancanti = CONSENSI_LAVORO.filter((x) => x.obbligatorio && !dati.has(x.k));
      if (mancanti.length > 0)
        throw new ORPCError("BAD_REQUEST", {
          message: `Per inviare servono i consensi: ${mancanti.map((m) => m.etichetta).join(", ")}.`,
        });

      const email = pulito(input.email);
      if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
        throw new ORPCError("BAD_REQUEST", { message: "L'indirizzo email non è valido." });
      if (!pulito(input.telefono) && !email)
        throw new ORPCError("BAD_REQUEST", { message: "Lascia almeno un contatto: telefono o email." });

      const quando = new Date().toISOString();
      const consensi: Record<string, string> = {};
      for (const c of CONSENSI_LAVORO) if (dati.has(c.k)) consensi[c.k] = quando;

      const [riga] = await db
        .insert(schema.lavoroCandidature)
        .values({
          annuncio: a.slug,
          ruolo,
          nome: input.nome.trim(),
          cognome: input.cognome.trim(),
          dataNascita: pulito(input.dataNascita),
          citta: pulito(input.citta),
          zona: pulito(input.zona),
          telefono: pulito(input.telefono),
          email,
          esperienze: pulito(input.esperienze),
          presentazione: pulito(input.presentazione),
          attrezzatura: pulito(input.attrezzatura),
          disponibilita: pulito(input.disponibilita),
          social: pulito(input.social),
          linkLavori: pulito(input.linkLavori),
          consensi: JSON.stringify(consensi),
          stato: "ricevuta",
        })
        .returning();

      const materiale = await chiudiPratica({
        token: input.tokenCaricamento,
        ambito: "lavoro",
        slotBase: slotCandidatura(riga.id),
        riferimento: `lavoro:${a.slug}:candidatura:${riga.id}`,
      });
      if (materiale.collegata) {
        await db
          .update(schema.lavoroCandidature)
          .set({ allegati: JSON.stringify({ nFile: materiale.nFile, perCampo: materiale.perCampo ?? {} }) })
          .where(eq(schema.lavoroCandidature.id, riga.id));
      }

      const notificata = await avvisaPerEmail(
        `${a.oggetto}${a.oggettoConRuolo && ruolo ? ` — ${ruolo.toUpperCase()}` : ""} — candidatura online #${riga.id}`,
        [
          ["Annuncio", a.titolo],
          ["Ruolo", ruolo],
          ["Nome", `${riga.nome} ${riga.cognome}`],
          ["Data di nascita", riga.dataNascita],
          ["Città", riga.citta],
          ["Zona di disponibilità", riga.zona],
          ["Telefono", riga.telefono],
          ["Email", riga.email],
          ["Esperienze", riga.esperienze],
          ["Presentazione", riga.presentazione],
          ["Attrezzatura", riga.attrezzatura],
          ["Disponibilità", riga.disponibilita],
          ["Social", riga.social],
          ["Link lavori / showreel", riga.linkLavori],
          ["File allegati", String(materiale.nFile)],
        ],
        email,
      );
      if (notificata) {
        await db
          .update(schema.lavoroCandidature)
          .set({ notificata: 1 })
          .where(eq(schema.lavoroCandidature.id, riga.id));
      }

      return {
        ok: true as const,
        numero: riga.id,
        annuncio: a.titolo,
        ruolo,
        nFile: materiale.nFile,
        notificata,
      };
    }),

  /* ─── PANNELLO (serve il codice di allestimento) ─── */

  elenco: base
    .input(z.object({ codice: z.string(), annuncio: z.string().max(80).optional() }))
    .handler(async ({ input }) => {
      controlla(input.codice);
      const righe = await db
        .select()
        .from(schema.lavoroCandidature)
        .where(input.annuncio ? eq(schema.lavoroCandidature.annuncio, input.annuncio) : undefined)
        .orderBy(desc(schema.lavoroCandidature.id));
      const candidature = await Promise.all(
        righe.map(async (r) => ({
          ...r,
          consensi: Object.keys(JSON.parse(r.consensi || "{}") as Record<string, string>),
          titoloAnnuncio: trovaAnnuncioLavoro(r.annuncio)?.titolo ?? r.annuncio,
          files: await allegatiDi(r.id),
        })),
      );
      return {
        candidature,
        annunci: ANNUNCI_LAVORO.map((a) => ({ slug: a.slug, titolo: a.titolo })),
        stati: [...STATI_CANDIDATURA_LAVORO],
        emailConfigurata: emailConfigurata(),
      };
    }),

  stato: base
    .input(
      z.object({
        codice: z.string(),
        id: z.number().int(),
        stato: z.enum(STATI_CANDIDATURA_LAVORO).optional(),
        noteInterne: z.string().max(2000).nullable().optional(),
      }),
    )
    .handler(async ({ input }) => {
      controlla(input.codice);
      const set: Record<string, unknown> = { updatedAt: new Date() };
      if (input.stato) set.stato = input.stato;
      if (input.noteInterne !== undefined) set.noteInterne = pulito(input.noteInterne);
      await db.update(schema.lavoroCandidature).set(set).where(eq(schema.lavoroCandidature.id, input.id));
      return { ok: true as const };
    }),
};
