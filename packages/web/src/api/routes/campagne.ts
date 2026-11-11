import { z } from "zod";
import { and, eq, inArray, sql } from "drizzle-orm";
import { ORPCError } from "@orpc/server";
import { base } from "../__core/app";
import { chiaveAmbito } from "../lib/ambiente";
import { db } from "../database";
import * as schema from "../database/schema";
import { mediaServito, mediaServitoElenco } from "../lib/media-url";
import {
  CAMPAGNE_TBH,
  CATEGORIE_MONITOR,
  DISPOSITIVI_CAMPAGNA,
  ETICHETTE_CAMPAGNA,
  NOTA_CONTENUTO_UFFICIALE,
  STATI_CAMPAGNA,
  STATI_CAMPAGNA_INFO,
  TEMI_CAMPAGNA,
  TESTI_PULSANTE,
  TIPI_CONTENUTO,
  ROTAZIONI_CAMPAGNA,
  IN_ALLESTIMENTO_TITOLO,
  IN_ALLESTIMENTO_NOTA,
  indirizzi,
  normalizzaPulsante,
  normalizzaRotazione,
  normalizzaStato,
  rilevaTipoContenuto,
  statoPubblico,
  type CampagnaMonitor,
  type DispositivoCampagna,
  type EtichettaCampagna,
  type StatoCampagna,
  type TipoContenuto,
} from "../data/campagne-monitor";

/**
 * SPAZI DEI MONITOR — servizio delle campagne temporanee (specifica 16/09/2026).
 *
 * Il browser chiede «che cosa metto in questo monitor mentre aspetto il contenuto
 * ufficiale?» e riceve le campagne ammesse per quel tema, quello spazio e quel
 * dispositivo. La rotazione la fa il componente; la selezione, le date e la
 * priorità le decide il server.
 *
 * Visualizzazioni e click sono righe vere in `monitor_eventi`: nessun numero
 * stimato, nessun conteggio finto.
 */

const CODICE = () => (process.env.TBH_CODICE_ALLESTIMENTO ?? "").trim();

function controlla(codice: string) {
  const atteso = CODICE();
  if (!atteso) {
    throw new ORPCError("SERVICE_UNAVAILABLE", {
      message: "Codice di allestimento non configurato sul server (TBH_CODICE_ALLESTIMENTO).",
    });
  }
  if (codice.trim() !== atteso) {
    throw new ORPCError("UNAUTHORIZED", { message: "Codice di allestimento errato." });
  }
}

const auth = z.object({ codice: z.string().min(1).max(120) });

/**
 * 28/10/2026 — PROMO DI RISERVA SPENTE A MANO (id negativi di CAMPAGNE_TBH), per ambito.
 * Serve allo spot «Offerta da Urlo 122 €»: attivo finché qualcuno non lo spegne dal pannello.
 */
const CHIAVE_RISERVA_SPENTE = chiaveAmbito("promo_riserva_spente");

async function riserveSpente(): Promise<Set<number>> {
  try {
    const [r] = await db.select().from(schema.settings).where(eq(schema.settings.key, CHIAVE_RISERVA_SPENTE));
    const v = r ? (JSON.parse(r.value) as unknown) : [];
    return new Set(Array.isArray(v) ? v.filter((x): x is number => typeof x === "number") : []);
  } catch {
    return new Set();
  }
}

async function riserveAttive(): Promise<CampagnaMonitor[]> {
  const spente = await riserveSpente();
  return CAMPAGNE_TBH.filter((c) => !spente.has(c.id));
}

const dataIso = z
  .string()
  .trim()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Usa il formato AAAA-MM-GG.")
  .nullish();

function oggiIso() {
  return new Date().toISOString().slice(0, 10);
}

function lista(v: string | null | undefined): string[] {
  return (v ?? "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}

function testo(v: string | null | undefined, max: number) {
  const s = (v ?? "").trim();
  return s ? s.slice(0, max) : null;
}

type RigaDb = typeof schema.monitorCampagne.$inferSelect;

function daRiga(r: RigaDb): CampagnaMonitor {
  const tipoSalvato = (r.tipoContenuto ?? "nessuno") as TipoContenuto;
  const tipo =
    tipoSalvato !== "nessuno" && (TIPI_CONTENUTO.map((t) => t.codice) as string[]).includes(tipoSalvato)
      ? tipoSalvato
      : rilevaTipoContenuto(r.contenutoUrl ?? r.videoUrl ?? r.immagineUrl);

  return {
    id: r.id,
    stato: normalizzaStato(r.stato),
    etichetta: (ETICHETTE_CAMPAGNA as string[]).includes(r.etichetta)
      ? (r.etichetta as EtichettaCampagna)
      : "SPAZIO PUBBLICITARIO",
    titolo: r.titolo,
    descrizione: r.descrizione ?? null,
    sponsor: r.sponsor ?? null,
    categoria: r.categoria ?? null,
    canale: r.canale ?? null,
    logoUrl: mediaServito(r.logoUrl),
    contenutoUrl: mediaServitoElenco(r.contenutoUrl),
    tipoContenuto: tipo,
    immagineUrl: mediaServito(r.immagineUrl),
    videoUrl: r.videoUrl ?? null,
    pulsanteUrl: r.pulsanteUrl ?? null,
    linkInterno: r.linkInterno ?? null,
    linkEsterno: r.linkEsterno ?? null,
    pulsante: normalizzaPulsante(r.pulsante),
    temi: lista(r.temi),
    spazi: lista(r.spazi),
    dispositivo: (DISPOSITIVI_CAMPAGNA as string[]).includes(r.dispositivo)
      ? (r.dispositivo as DispositivoCampagna)
      : "tutti",
    priorita: r.priorita,
    // Durata libera in secondi (specifica 16/09/2026): 3 s minimo per non
    // rendere illeggibile la creatività, 600 s massimo (dieci minuti).
    durataSec: Math.min(600, Math.max(3, r.durataSec)),
    loop: r.loop !== 0,
    rotazione: normalizzaRotazione(r.rotazione),
    frequenzaMax: Math.max(0, r.frequenzaMax),
    dal: r.dal ?? null,
    al: r.al ?? null,
    colore: r.colore ?? null,
    interna: false,
  };
}

/** Una campagna è in onda solo dentro la sua finestra di pubblicazione. */
function inFinestra(c: CampagnaMonitor, oggi: string) {
  if (c.dal && oggi < c.dal) return false;
  if (c.al && oggi > c.al) return false;
  return true;
}

/**
 * Stato reale al giorno di oggi: la finestra di date comanda sullo stato scritto.
 * Una scheda con scadenza passata è SCADUTO anche se il pannello dice IN ONDA;
 * una con partenza futura è PROGRAMMATO. Così il pannello non racconta bugie.
 */
function statoEffettivo(c: CampagnaMonitor, oggi: string): StatoCampagna {
  if (c.stato === "bozza" || c.stato === "in_attesa" || c.stato === "disattivato") return c.stato;
  if (c.al && oggi > c.al) return "scaduto";
  if (c.dal && oggi < c.dal) return "programmato";
  return c.stato;
}

function ammessa(
  c: CampagnaMonitor,
  tema: string | null,
  spazio: string | null,
  dispositivo: DispositivoCampagna,
  oggi: string,
) {
  // Conta lo stato reale di oggi, non quello scritto: una scheda scaduta non entra.
  if (!statoPubblico(statoEffettivo(c, oggi))) return false;
  if (c.dispositivo !== "tutti" && dispositivo !== "tutti" && c.dispositivo !== dispositivo) {
    return false;
  }
  if (c.spazi.length > 0) {
    const s = (spazio ?? "").toLowerCase();
    if (!s || !c.spazi.some((x) => s === x || s.includes(x))) return false;
  }
  if (c.temi.length > 0) {
    const t = (tema ?? "").toLowerCase();
    if (!t || !c.temi.includes(t)) return false;
  }
  return true;
}

const dispositivoInput = z.enum(["tutti", "mobile", "tablet", "desktop"]).default("tutti");

export const campagne = {
  /**
   * Campagne ammesse in uno spazio. Prima le righe del pannello (campagne vere,
   * anche degli sponsor); le promo TBH di riserva si aggiungono solo se il pannello
   * non copre quello spazio, così un monitor libero non resta mai muto.
   */
  perSpazio: base
    .input(
      z.object({
        tema: z.string().trim().max(40).nullish(),
        spazio: z.string().trim().max(200).nullish(),
        dispositivo: dispositivoInput,
        /** Quante campagne al massimo mandare in rotazione. */
        massimo: z.number().int().min(1).max(12).default(4),
      }),
    )
    .handler(async ({ input }) => {
      const oggi = oggiIso();
      const tema = input.tema ?? null;
      const spazio = input.spazio ?? null;

      let righe: RigaDb[] = [];
      try {
        righe = await db.select().from(schema.monitorCampagne);
      } catch {
        // Tabella non ancora creata sul database: valgono le promo di riserva.
        righe = [];
      }

      const dalPannello = righe
        .map(daRiga)
        .filter((c) => inFinestra(c, oggi) && ammessa(c, tema, spazio, input.dispositivo, oggi));

      const tbh = await riserveAttive();
      const riserva = tbh.filter(
        (c) => inFinestra(c, oggi) && ammessa(c, tema, spazio, input.dispositivo, oggi),
      );

      // Il contenuto ufficiale ha la precedenza su ogni pubblicità (punto 7 della specifica).
      const peso = (c: CampagnaMonitor) => (c.stato === "contenuto_ufficiale" ? 1 : 0);

      /**
       * Nessun monitor morto (punto 1 della specifica): se filtri per tema, spazio
       * o dispositivo non lasciano passare nulla, valgono comunque le promo TBH
       * universali — sono pagine reali del portale, non contenuti inventati.
       */
      const universali = tbh.filter(
        (c) => inFinestra(c, oggi) && c.temi.length === 0 && c.spazi.length === 0,
      );
      const base0 =
        dalPannello.length > 0
          ? dalPannello
          : riserva.length > 0
            ? riserva
            : universali.length > 0
              ? universali
              : tbh.length > 0
                ? tbh
                : CAMPAGNE_TBH;

      const ordinate = base0
        .slice()
        .sort(
          (a, b) =>
            peso(b) - peso(a) || b.priorita - a.priorita || a.titolo.localeCompare(b.titolo),
        )
        .slice(0, input.massimo);
      /* Promo «sempre in rotazione» (Offerta 122 €): si ALTERNA agli altri spot anche dove il
         pannello ha campagne proprie, senza duplicarsi; se lo spazio è pieno prende l'ultimo posto. */
      const fisse = riserva.filter((c) => c.sempreInRotazione && !ordinate.some((x) => x.id === c.id));
      const scelte =
        fisse.length === 0
          ? ordinate
          : [...ordinate.slice(0, Math.max(0, input.massimo - fisse.length)), ...fisse].slice(0, input.massimo);

      return {
        nota: NOTA_CONTENUTO_UFFICIALE,
        /** true = sono promo TBH di riserva, non campagne vendute. */
        riserva: dalPannello.length === 0,
        campagne: scelte,
      };
    }),

  /** Visualizzazione o click reale su uno spazio. */
  traccia: base
    .input(
      z.object({
        campagnaId: z.number().int(),
        tipo: z.enum(["vista", "click"]),
        spazio: z.string().trim().max(200).nullish(),
        dispositivo: z.enum(["mobile", "tablet", "desktop"]).nullish(),
      }),
    )
    .handler(async ({ input }) => {
      try {
        await db.insert(schema.monitorEventi).values({
          campagnaId: input.campagnaId,
          tipo: input.tipo,
          spazio: testo(input.spazio, 200),
          dispositivo: input.dispositivo ?? null,
        });
        return { registrato: true };
      } catch {
        return { registrato: false };
      }
    }),
};

/**
 * EVENTO VIA BEACON — un click apre subito la pagina di destinazione e la chiamata
 * normale verrebbe annullata dalla navigazione. `navigator.sendBeacon` parte comunque,
 * quindi il click non si perde. Stessa tabella, stesso conteggio reale.
 */
const eventoBeacon = z.object({
  campagnaId: z.number().int(),
  tipo: z.enum(["vista", "click"]),
  spazio: z.string().trim().max(200).nullish(),
  dispositivo: z.enum(["mobile", "tablet", "desktop"]).nullish(),
});

export async function registraEventoMonitor(corpo: string) {
  let dati: unknown;
  try {
    dati = JSON.parse(corpo);
  } catch {
    return { stato: 400 as const, corpo: { registrato: false, errore: "corpo non leggibile" } };
  }
  const letto = eventoBeacon.safeParse(dati);
  if (!letto.success) {
    return { stato: 400 as const, corpo: { registrato: false, errore: "campi non validi" } };
  }
  try {
    await db.insert(schema.monitorEventi).values({
      campagnaId: letto.data.campagnaId,
      tipo: letto.data.tipo,
      spazio: testo(letto.data.spazio, 200),
      dispositivo: letto.data.dispositivo ?? null,
    });
    return { stato: 200 as const, corpo: { registrato: true } };
  } catch {
    return { stato: 200 as const, corpo: { registrato: false } };
  }
}

const campo = z.object({
  id: z.number().int().positive().nullish(),
  /** Gli otto stati della specifica 16/09/2026. */
  stato: z
    .enum([
      "bozza",
      "in_attesa",
      "pubblicita_temporanea",
      "programmato",
      "in_onda",
      "contenuto_ufficiale",
      "scaduto",
      "disattivato",
    ])
    .default("bozza"),
  etichetta: z
    .enum(["SPAZIO PUBBLICITARIO", "PROMO TBH", "PARTNER DEL CANALE"])
    .default("SPAZIO PUBBLICITARIO"),
  titolo: z.string().trim().min(2).max(200),
  descrizione: z.string().trim().max(600).nullish(),
  sponsor: z.string().trim().max(160).nullish(),
  /** Categoria della scheda: uno dei codici di CATEGORIE_MONITOR. */
  categoria: z.string().trim().max(60).nullish(),
  /**
   * Numero del canale. Resta vuoto finché non arriva la tabella ufficiale dei
   * numeri: nessun numero va indovinato qui.
   */
  canale: z.number().int().min(1).max(999).nullish(),
  logoUrl: z.string().trim().max(500).nullish(),
  /** BARRA 1 — URL contenuto del monitor. Più indirizzi = carosello. */
  contenutoUrl: z.string().trim().max(3000).nullish(),
  tipoContenuto: z
    .enum([
      "youtube",
      "vimeo",
      "video",
      "immagine",
      "pdf",
      "carosello",
      "pagina",
      "diretta",
      "fotogallery",
      "pubblicita",
      "nessuno",
    ])
    .default("nessuno"),
  immagineUrl: z.string().trim().max(500).nullish(),
  videoUrl: z.string().trim().max(500).nullish(),
  /** BARRA 2 — URL o link del pulsante, indipendente dal contenuto. */
  pulsanteUrl: z.string().trim().max(500).nullish(),
  linkInterno: z.string().trim().max(300).nullish(),
  linkEsterno: z.string().trim().max(500).nullish(),
  /** Solo i dodici testi fissi. */
  pulsante: z.enum(TESTI_PULSANTE).nullish(),
  temi: z.string().trim().max(200).nullish(),
  spazi: z.string().trim().max(400).nullish(),
  dispositivo: z.enum(["tutti", "mobile", "tablet", "desktop"]).default("tutti"),
  priorita: z.number().int().min(0).max(100).default(50),
  /** Durata di visualizzazione in secondi, decisa dall'amministratore. */
  durataSec: z.number().int().min(3).max(600).default(14),
  /** Riproduzione video in loop SÌ/NO. */
  loop: z.boolean().default(true),
  /** Ordine manuale oppure rotazione casuale. */
  rotazione: z.enum(["ordine", "casuale"]).default("ordine"),
  frequenzaMax: z.number().int().min(0).max(50).default(0),
  dal: dataIso,
  al: dataIso,
  colore: z.string().trim().max(40).nullish(),
  ordine: z.number().int().min(0).max(9999).default(0),
});

export const campagneAdmin = {
  /** 28/10/2026 — accende/spegne a mano una promo di riserva (es. Offerta 122 €), solo in questo ambito. */
  riservaAttiva: base
    .input(auth.extend({ id: z.number().int().max(-1), attiva: z.boolean() }))
    .handler(async ({ input }) => {
      controlla(input.codice);
      if (!CAMPAGNE_TBH.some((c) => c.id === input.id)) throw new ORPCError("NOT_FOUND", { message: "Promo di riserva inesistente." });
      const spente = await riserveSpente();
      if (input.attiva) spente.delete(input.id);
      else spente.add(input.id);
      const value = JSON.stringify([...spente]);
      await db
        .insert(schema.settings)
        .values({ key: CHIAVE_RISERVA_SPENTE, value })
        .onConflictDoUpdate({ target: schema.settings.key, set: { value } });
      return { ok: true, id: input.id, attiva: input.attiva };
    }),

  stato: base.input(auth.partial()).handler(({ input }) => {
    const configurato = CODICE().length > 0;
    return {
      configurato,
      valido: configurato && (input.codice ?? "").trim() === CODICE(),
    };
  }),

  /** Elenco completo con visualizzazioni e click reali per campagna. */
  elenco: base.input(auth).handler(async ({ input }) => {
    controlla(input.codice);
    const righe = await db.select().from(schema.monitorCampagne);
    const conteggi = await db
      .select({
        campagnaId: schema.monitorEventi.campagnaId,
        tipo: schema.monitorEventi.tipo,
        quanti: sql<number>`count(*)`,
      })
      .from(schema.monitorEventi)
      .groupBy(schema.monitorEventi.campagnaId, schema.monitorEventi.tipo);

    const per = (id: number, tipo: string) =>
      Number(conteggi.find((c) => c.campagnaId === id && c.tipo === tipo)?.quanti ?? 0);

    const oggi = oggiIso();
    const spente = await riserveSpente();

    return {
      oggi,
      temi: [...TEMI_CAMPAGNA],
      stati: STATI_CAMPAGNA,
      /** Gli otto stati con nome leggibile e spiegazione, per il pannello. */
      statiInfo: STATI_CAMPAGNA_INFO,
      etichette: ETICHETTE_CAMPAGNA,
      dispositivi: DISPOSITIVI_CAMPAGNA,
      categorie: [...CATEGORIE_MONITOR],
      testiPulsante: [...TESTI_PULSANTE],
      tipiContenuto: TIPI_CONTENUTO,
      rotazioni: ROTAZIONI_CAMPAGNA,
      /** Testo obbligatorio degli spazi senza contenuto (punto 1). */
      inAllestimento: { titolo: IN_ALLESTIMENTO_TITOLO, nota: IN_ALLESTIMENTO_NOTA },
      riserva: CAMPAGNE_TBH.map((c) => ({
        id: c.id,
        attiva: !spente.has(c.id),
        sempreInRotazione: !!c.sempreInRotazione,
        durataSec: c.durataSec,
        titolo: c.titolo,
        etichetta: c.etichetta,
        temi: c.temi,
        viste: per(c.id, "vista"),
        click: per(c.id, "click"),
      })),
      campagne: righe
        .slice()
        .sort((a, b) => b.priorita - a.priorita || a.ordine - b.ordine || b.id - a.id)
        .map((r) => {
          const c = daRiga(r);
          const reale = statoEffettivo(c, oggi);
          return {
            ...c,
            ordine: r.ordine,
            /** Stato ricalcolato sulle date: è quello che il pubblico vede davvero. */
            statoEffettivo: reale,
            inOndaOra: statoPubblico(reale) && inFinestra(c, oggi),
            viste: per(r.id, "vista"),
            click: per(r.id, "click"),
          };
        }),
    };
  }),

  salva: base.input(auth.extend({ campagna: campo })).handler(async ({ input }) => {
    controlla(input.codice);
    const c = input.campagna;
    const contenutoUrl = testo(c.contenutoUrl, 3000);
    // Se chi compila lascia «nessuno» ma incolla un URL, il tipo lo deduce il server.
    const tipoContenuto: TipoContenuto =
      c.tipoContenuto !== "nessuno" ? c.tipoContenuto : rilevaTipoContenuto(contenutoUrl);
    // La categoria vale solo se è una di quelle previste: niente etichette inventate.
    const categoriaScritta = testo(c.categoria, 60);
    const categoria =
      categoriaScritta && (CATEGORIE_MONITOR as readonly string[]).includes(categoriaScritta)
        ? categoriaScritta
        : null;

    const valori = {
      stato: c.stato,
      etichetta: c.etichetta,
      titolo: c.titolo,
      descrizione: testo(c.descrizione, 600),
      sponsor: testo(c.sponsor, 160),
      categoria,
      canale: c.canale ?? null,
      logoUrl: testo(c.logoUrl, 500),
      contenutoUrl,
      tipoContenuto: indirizzi(contenutoUrl).length > 1 ? "carosello" : tipoContenuto,
      immagineUrl: testo(c.immagineUrl, 500),
      videoUrl: testo(c.videoUrl, 500),
      pulsanteUrl: testo(c.pulsanteUrl, 500),
      linkInterno: testo(c.linkInterno, 300),
      linkEsterno: testo(c.linkEsterno, 500),
      pulsante: normalizzaPulsante(c.pulsante),
      temi: testo(c.temi, 200),
      spazi: testo(c.spazi, 400),
      dispositivo: c.dispositivo,
      priorita: c.priorita,
      durataSec: c.durataSec,
      loop: c.loop ? 1 : 0,
      rotazione: c.rotazione,
      frequenzaMax: c.frequenzaMax,
      dal: testo(c.dal, 10),
      al: testo(c.al, 10),
      colore: testo(c.colore, 40),
      ordine: c.ordine,
      updatedAt: new Date(),
    };

    if (c.id) {
      await db
        .update(schema.monitorCampagne)
        .set(valori)
        .where(eq(schema.monitorCampagne.id, c.id));
      return { id: c.id, creata: false };
    }
    const [riga] = await db.insert(schema.monitorCampagne).values(valori).returning();
    return { id: riga.id, creata: true };
  }),

  elimina: base
    .input(auth.extend({ id: z.number().int().positive() }))
    .handler(async ({ input }) => {
      controlla(input.codice);
      await db.delete(schema.monitorCampagne).where(eq(schema.monitorCampagne.id, input.id));
      await db.delete(schema.monitorEventi).where(eq(schema.monitorEventi.campagnaId, input.id));
      return { eliminata: true };
    }),

  /** Ultimi eventi reali, per controllare che il conteggio stia girando. */
  eventi: base
    .input(auth.extend({ ids: z.array(z.number().int()).max(50).optional() }))
    .handler(async ({ input }) => {
      controlla(input.codice);
      const where =
        input.ids && input.ids.length > 0
          ? and(inArray(schema.monitorEventi.campagnaId, input.ids))
          : undefined;
      const righe = await db
        .select()
        .from(schema.monitorEventi)
        .where(where)
        .orderBy(sql`${schema.monitorEventi.id} desc`)
        .limit(60);
      return {
        eventi: righe.map((r) => ({
          id: r.id,
          campagnaId: r.campagnaId,
          tipo: r.tipo,
          spazio: r.spazio,
          dispositivo: r.dispositivo,
          quando: r.createdAt?.toISOString() ?? null,
        })),
      };
    }),
};
