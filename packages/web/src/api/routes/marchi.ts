import { z } from "zod";
import { eq } from "drizzle-orm";
import { ORPCError } from "@orpc/server";
import { base } from "../__core/app";
import { db } from "../database";
import * as schema from "../database/schema";
import { mediaServito } from "../lib/media-url";
import {
  CATEGORIE_MARCHIO,
  IN_ALLESTIMENTO_NOTA,
  IN_ALLESTIMENTO_TITOLO,
  STATI_MARCHIO,
  STATO_MARCHIO_LABEL,
  TIPI_MEDIA,
  categoriaLabel,
  categoriaValida,
  coloriPuliti,
  mancanzeMarchio,
  marchioPubblico,
  normalizzaStatoMarchio,
  righe,
  ruoloValido,
  slugMarchio,
  tipoMediaValido,
  type Marchio,
  type MediaMarchio,
} from "../data/marchi-tbh";
import {
  FORMATI_LOGO,
  LOGHI_VIETATI,
  RUOLI_KIT,
  RUOLO_KIT_LABEL,
  type RuoloKit,
} from "../data/formati-logo";
import { chiave as chiaveEntita } from "../data/registro";

/**
 * MARCHI — SERVIZIO DEL RECORD MASTER (specifica 17/09/2026, punti 1, 2, 4, 6 e 9).
 *
 * «UN CONTENUTO, UN RECORD, UN LOGO ORIGINALE, PIÙ ADATTAMENTI AUTOMATICI.»
 *
 * Una scheda si scrive UNA volta qui. Le pagine, le card, i monitor e i menu la
 * leggono da questo servizio: quando Claudio aggiorna il record, cambia in tutto
 * il sito nello stesso momento, perché non esistono copie.
 *
 * Il caricamento (punto 6) aggiorna SEMPRE il record master, non la pagina aperta:
 * `salvaMedia` scrive su `marchio_media` e, se il ruolo è «master», aggiorna anche
 * il logo originale della scheda. L'originale precedente non si cancella: resta in
 * archivio come riga del kit, quindi si può tornare indietro.
 *
 * Nessun marchio, colore, prezzo o contatto è scritto nel codice: la tabella parte
 * vuota e finché non c'è una scheda vera si scrive
 * "IN ALLESTIMENTO / Contenuto disponibile prossimamente".
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

function testo(v: string | null | undefined, max: number) {
  const s = (v ?? "").trim();
  return s ? s.slice(0, max) : null;
}

type RigaMarchio = typeof schema.marchi.$inferSelect;
type RigaMedia = typeof schema.marchioMedia.$inferSelect;

function daMedia(r: RigaMedia): MediaMarchio {
  return {
    id: r.id,
    ruolo: (ruoloValido(r.ruolo) ?? "master") as RuoloKit,
    url: mediaServito(r.chiave) ?? r.chiave,
    tipo: tipoMediaValido(r.tipo),
    titolo: r.titolo ?? null,
    larghezza: r.larghezza ?? null,
    altezza: r.altezza ?? null,
    fonte: r.fonte ?? null,
    nota: r.nota ?? null,
    ordine: r.ordine,
  };
}

function daMarchio(r: RigaMarchio, media: RigaMedia[]): Marchio {
  const stato = normalizzaStatoMarchio(r.stato);
  const logoMaster = mediaServito(r.logoMaster);
  const copertinaUrl = mediaServito(r.copertinaUrl);
  const kit = media
    .filter((m) => m.marchioId === r.id)
    .sort((a, b) => a.ordine - b.ordine || a.id - b.id)
    .map(daMedia);

  const mancanze = mancanzeMarchio({
    logoMaster,
    descrizione: r.descrizione ?? null,
    copertinaUrl,
    sito: r.sito ?? null,
    telefono: r.telefono ?? null,
    whatsapp: r.whatsapp ?? null,
    mapsUrl: r.mapsUrl ?? null,
    stato,
  });

  return {
    id: r.id,
    slug: r.slug,
    nome: r.nome,
    nomeBreve: r.nomeBreve ?? null,
    chiaveEntita: r.chiaveEntita ?? null,
    categoria: r.categoria ?? null,
    categoriaLabel: categoriaLabel(r.categoria),
    stato,
    statoLabel: STATO_MARCHIO_LABEL[stato],
    descrizione: r.descrizione ?? null,
    logoMaster,
    logoMasterTipo: r.logoMasterTipo ?? null,
    logoMasterLarghezza: r.logoMasterLarghezza ?? null,
    logoMasterAltezza: r.logoMasterAltezza ?? null,
    coloriUfficiali: coloriPuliti(r.coloriUfficiali),
    copertinaUrl,
    videoUrl: mediaServito(r.videoUrl),
    caroselloUrl: righe(r.caroselloUrl).map((u) => mediaServito(u) ?? u),
    sito: r.sito ?? null,
    mapsUrl: r.mapsUrl ?? null,
    telefono: r.telefono ?? null,
    whatsapp: r.whatsapp ?? null,
    email: r.email ?? null,
    social: righe(r.social),
    /* Al clic si apre SEMPRE la scheda interna: regola del 30/08/2026. */
    paginaTbh: testo(r.paginaTbh, 300) ?? `/marchio/${r.slug}`,
    fonte: r.fonte ?? null,
    nota: r.nota ?? null,
    ordine: r.ordine,
    kit,
    mancanze,
    completa: mancanze.length === 0,
  };
}

async function leggiTutto(): Promise<Marchio[]> {
  const [righeMarchi, righeMedia] = await Promise.all([
    db.select().from(schema.marchi),
    db.select().from(schema.marchioMedia),
  ]);
  return righeMarchi
    .sort((a, b) => b.ordine - a.ordine || a.nome.localeCompare(b.nome, "it"))
    .map((r) => daMarchio(r, righeMedia));
}

/** Quello che serve ai pannelli e alle pagine per non inventarsi misure e testi. */
const OPZIONI = {
  categorie: CATEGORIE_MARCHIO.map((c) => ({ slug: c.slug, label: c.label })),
  stati: STATI_MARCHIO,
  statiLabel: STATO_MARCHIO_LABEL,
  ruoliKit: RUOLI_KIT.map((r) => ({ ruolo: r, label: RUOLO_KIT_LABEL[r] })),
  tipiMedia: TIPI_MEDIA,
  formati: FORMATI_LOGO,
  loghiVietati: LOGHI_VIETATI,
  inAllestimento: { titolo: IN_ALLESTIMENTO_TITOLO, nota: IN_ALLESTIMENTO_NOTA },
};

/* ════════════════════════ SERVIZIO PUBBLICO ════════════════════════ */

export const marchi = {
  /**
   * L'elenco che alimenta card, monitor e menu. Filtro per categoria facoltativo.
   * Le bozze restano fuori; le schede IN ALLESTIMENTO ci sono, con il loro testo.
   */
  elenco: base
    .input(z.object({ categoria: z.string().trim().max(60).nullish() }).default({}))
    .handler(async ({ input }) => {
      const tutti = await leggiTutto();
      const cat = testo(input.categoria, 60);
      const visibili = tutti.filter(
        (m) => marchioPubblico(m.stato) && (!cat || m.categoria === cat),
      );
      return {
        marchi: visibili,
        totaleArchivio: tutti.length,
        ...OPZIONI,
      };
    }),

  /**
   * Una scheda sola, per slug oppure per nome dell'entità del registro unico
   * (così una pagina che ha in mano solo il nome trova comunque il master e non
   * si ritrova vuota: è il caso «Verucchio Calcio» del punto 9).
   */
  scheda: base
    .input(
      z.object({
        slug: z.string().trim().max(120).nullish(),
        nome: z.string().trim().max(200).nullish(),
      }),
    )
    .handler(async ({ input }) => {
      const tutti = await leggiTutto();
      const slug = testo(input.slug, 120);
      const nome = testo(input.nome, 200);
      const k = nome ? chiaveEntita(nome) : null;

      const trovato =
        (slug ? tutti.find((m) => m.slug === slug) : undefined) ??
        (k
          ? tutti.find((m) => m.chiaveEntita === k || chiaveEntita(m.nome) === k)
          : undefined) ??
        null;

      const visibile = trovato && marchioPubblico(trovato.stato) ? trovato : null;
      return { marchio: visibile, ...OPZIONI };
    }),

  /**
   * Più schede in una chiamata, per nome: serve alle pagine che hanno un elenco di
   * nomi (squadre di un girone, sponsor di un evento) e devono mostrare la scheda
   * completa senza ricopiarne i dati.
   */
  perNomi: base
    .input(z.object({ nomi: z.array(z.string().trim().min(1).max(200)).max(200) }))
    .handler(async ({ input }) => {
      const tutti = await leggiTutto().then((t) => t.filter((m) => marchioPubblico(m.stato)));
      const trovati: { nome: string; marchio: Marchio | null }[] = input.nomi.map((nome) => {
        const k = chiaveEntita(nome);
        const m =
          tutti.find((x) => x.chiaveEntita === k || chiaveEntita(x.nome) === k) ?? null;
        return { nome, marchio: m };
      });
      return {
        risultati: trovati,
        /** Nomi senza record master: da creare, non da riempire a mano nella pagina. */
        senzaRecord: trovati.filter((t) => !t.marchio).map((t) => t.nome),
        ...OPZIONI,
      };
    }),
};

/* ════════════════════════ PANNELLO AMMINISTRATORE ════════════════════════ */

const scheda = z.object({
  id: z.number().int().positive().nullish(),
  slug: z.string().trim().max(120).nullish(),
  nome: z.string().trim().min(2).max(200),
  nomeBreve: z.string().trim().max(80).nullish(),
  categoria: z.string().trim().max(60).nullish(),
  stato: z.enum(["attiva", "bozza", "in_allestimento"]).default("in_allestimento"),
  descrizione: z.string().trim().max(4000).nullish(),
  /** Solo loghi originali: l'indirizzo arriva da un caricamento vero. */
  logoMaster: z.string().trim().max(600).nullish(),
  logoMasterTipo: z.string().trim().max(40).nullish(),
  logoMasterLarghezza: z.number().int().min(0).max(40000).nullish(),
  logoMasterAltezza: z.number().int().min(0).max(40000).nullish(),
  coloriUfficiali: z.string().trim().max(300).nullish(),
  copertinaUrl: z.string().trim().max(600).nullish(),
  videoUrl: z.string().trim().max(600).nullish(),
  caroselloUrl: z.string().trim().max(4000).nullish(),
  sito: z.string().trim().max(500).nullish(),
  mapsUrl: z.string().trim().max(800).nullish(),
  telefono: z.string().trim().max(40).nullish(),
  whatsapp: z.string().trim().max(40).nullish(),
  email: z.string().trim().max(160).nullish(),
  social: z.string().trim().max(2000).nullish(),
  paginaTbh: z.string().trim().max(300).nullish(),
  fonte: z.string().trim().max(300).nullish(),
  nota: z.string().trim().max(1000).nullish(),
  ordine: z.number().int().min(0).max(9999).default(0),
});

export const marchiAdmin = {
  stato: base.input(auth.partial()).handler(({ input }) => {
    const configurato = CODICE().length > 0;
    return {
      configurato,
      valido: configurato && (input.codice ?? "").trim() === CODICE(),
    };
  }),

  /** Tutto l'archivio, bozze comprese, con l'elenco di cosa manca a ogni scheda. */
  elenco: base.input(auth).handler(async ({ input }) => {
    controlla(input.codice);
    const tutti = await leggiTutto();
    return {
      marchi: tutti,
      ...OPZIONI,
      riepilogo: {
        totale: tutti.length,
        attive: tutti.filter((m) => m.stato === "attiva").length,
        bozze: tutti.filter((m) => m.stato === "bozza").length,
        inAllestimento: tutti.filter((m) => m.stato === "in_allestimento").length,
        senzaLogo: tutti.filter((m) => !m.logoMaster).length,
        complete: tutti.filter((m) => m.completa).length,
      },
    };
  }),

  /**
   * Salva il RECORD MASTER. Lo slug si calcola al primo salvataggio e non cambia
   * più: i collegamenti già in giro per il sito continuano a funzionare anche
   * quando la scheda passa da IN ALLESTIMENTO ad ATTIVA (punto 7).
   */
  salva: base.input(auth.extend({ marchio: scheda })).handler(async ({ input }) => {
    controlla(input.codice);
    const m = input.marchio;

    const valori = {
      nome: m.nome,
      nomeBreve: testo(m.nomeBreve, 80),
      /* Il ponte col registro unico si calcola dal nome: nessun doppione. */
      chiaveEntita: chiaveEntita(m.nome) || null,
      categoria: categoriaValida(m.categoria),
      stato: m.stato,
      descrizione: testo(m.descrizione, 4000),
      logoMaster: testo(m.logoMaster, 600),
      logoMasterTipo: testo(m.logoMasterTipo, 40),
      logoMasterLarghezza: m.logoMasterLarghezza ?? null,
      logoMasterAltezza: m.logoMasterAltezza ?? null,
      coloriUfficiali: coloriPuliti(m.coloriUfficiali).join("\n") || null,
      copertinaUrl: testo(m.copertinaUrl, 600),
      videoUrl: testo(m.videoUrl, 600),
      caroselloUrl: righe(m.caroselloUrl).join("\n") || null,
      sito: testo(m.sito, 500),
      mapsUrl: testo(m.mapsUrl, 800),
      telefono: testo(m.telefono, 40),
      whatsapp: testo(m.whatsapp, 40),
      email: testo(m.email, 160),
      social: righe(m.social).join("\n") || null,
      paginaTbh: testo(m.paginaTbh, 300),
      fonte: testo(m.fonte, 300),
      nota: testo(m.nota, 1000),
      ordine: m.ordine,
      updatedAt: new Date(),
    };

    let id = m.id ?? 0;
    if (id) {
      await db.update(schema.marchi).set(valori).where(eq(schema.marchi.id, id));
    } else {
      /* Slug unico, senza sovrascrivere una scheda che esiste già. */
      const presi = new Set(
        (await db.select({ slug: schema.marchi.slug }).from(schema.marchi)).map((r) => r.slug),
      );
      const radice = slugMarchio(testo(m.slug, 120) ?? m.nome);
      let slug = radice;
      let n = 2;
      while (presi.has(slug)) slug = `${radice}-${n++}`;
      const [riga] = await db
        .insert(schema.marchi)
        .values({ ...valori, slug })
        .returning();
      id = riga!.id;
    }

    const tutti = await leggiTutto();
    return { marchio: tutti.find((x) => x.id === id) ?? null };
  }),

  /**
   * CARICA LOGO | IMMAGINE | VIDEO | CAROSELLO | URL (punto 6).
   *
   * Il file arriva già nell'archivio (o è un indirizzo incollato): qui si appende
   * al RECORD MASTER, non alla pagina aperta. Con ruolo «master» diventa il logo
   * originale della scheda; la riga precedente resta in archivio, non si cancella.
   */
  salvaMedia: base
    .input(
      auth.extend({
        marchioId: z.number().int().positive(),
        ruolo: z.enum([
          "master",
          "orizzontale",
          "icona",
          "positivo",
          "negativo",
          "monocromatico",
          "copertina",
          "video",
          "carosello",
        ]),
        /** Chiave dell'archivio (allestimento/…), percorso interno (/brand/…) o https://… */
        chiave: z.string().trim().min(1).max(600),
        tipo: z.enum(TIPI_MEDIA).default("immagine"),
        titolo: z.string().trim().max(200).nullish(),
        larghezza: z.number().int().min(0).max(40000).nullish(),
        altezza: z.number().int().min(0).max(40000).nullish(),
        fonte: z.string().trim().max(300).nullish(),
        nota: z.string().trim().max(600).nullish(),
        ordine: z.number().int().min(0).max(9999).default(0),
      }),
    )
    .handler(async ({ input }) => {
      controlla(input.codice);

      const [esiste] = await db
        .select({ id: schema.marchi.id })
        .from(schema.marchi)
        .where(eq(schema.marchi.id, input.marchioId));
      if (!esiste) {
        throw new ORPCError("NOT_FOUND", {
          message: "Scheda non trovata: salva prima il record master, poi carica i file.",
        });
      }

      const [riga] = await db
        .insert(schema.marchioMedia)
        .values({
          marchioId: input.marchioId,
          ruolo: input.ruolo,
          chiave: input.chiave,
          tipo: input.tipo,
          titolo: testo(input.titolo, 200),
          larghezza: input.larghezza ?? null,
          altezza: input.altezza ?? null,
          fonte: testo(input.fonte, 300),
          nota: testo(input.nota, 600),
          ordine: input.ordine,
        })
        .returning();

      /* Il record master si aggiorna da sé: è questo il punto della specifica. */
      const aggiorna: Partial<typeof schema.marchi.$inferInsert> = { updatedAt: new Date() };
      if (input.ruolo === "master") {
        aggiorna.logoMaster = input.chiave;
        aggiorna.logoMasterTipo = input.tipo;
        aggiorna.logoMasterLarghezza = input.larghezza ?? null;
        aggiorna.logoMasterAltezza = input.altezza ?? null;
      }
      if (input.ruolo === "copertina") aggiorna.copertinaUrl = input.chiave;
      if (input.ruolo === "video") aggiorna.videoUrl = input.chiave;
      if (input.ruolo === "carosello") {
        const [attuale] = await db
          .select({ carosello: schema.marchi.caroselloUrl })
          .from(schema.marchi)
          .where(eq(schema.marchi.id, input.marchioId));
        const elenco = righe(attuale?.carosello ?? null);
        if (!elenco.includes(input.chiave)) elenco.push(input.chiave);
        aggiorna.caroselloUrl = elenco.join("\n");
      }
      await db.update(schema.marchi).set(aggiorna).where(eq(schema.marchi.id, input.marchioId));

      const tutti = await leggiTutto();
      return {
        mediaId: riga!.id,
        marchio: tutti.find((x) => x.id === input.marchioId) ?? null,
      };
    }),

  /**
   * Toglie una riga del kit. Non tocca il file nell'archivio e non cancella la
   * scheda: se era il master, la scheda torna senza logo e lo dice nell'elenco
   * dei difetti, invece di mostrare un segnaposto.
   */
  eliminaMedia: base
    .input(auth.extend({ mediaId: z.number().int().positive() }))
    .handler(async ({ input }) => {
      controlla(input.codice);
      const [riga] = await db
        .select()
        .from(schema.marchioMedia)
        .where(eq(schema.marchioMedia.id, input.mediaId));
      if (!riga) throw new ORPCError("NOT_FOUND", { message: "Materiale non trovato." });

      await db.delete(schema.marchioMedia).where(eq(schema.marchioMedia.id, input.mediaId));

      const [master] = await db
        .select()
        .from(schema.marchi)
        .where(eq(schema.marchi.id, riga.marchioId));
      if (master) {
        const aggiorna: Partial<typeof schema.marchi.$inferInsert> = { updatedAt: new Date() };
        if (master.logoMaster === riga.chiave) {
          /* Si torna all'originale precedente, se ce n'è uno in archivio. */
          const storia = await db
            .select()
            .from(schema.marchioMedia)
            .where(eq(schema.marchioMedia.marchioId, riga.marchioId));
          const precedente = storia
            .filter((m) => m.ruolo === "master")
            .sort((a, b) => b.id - a.id)[0];
          aggiorna.logoMaster = precedente ? precedente.chiave : null;
          aggiorna.logoMasterTipo = precedente ? precedente.tipo : null;
          aggiorna.logoMasterLarghezza = precedente ? (precedente.larghezza ?? null) : null;
          aggiorna.logoMasterAltezza = precedente ? (precedente.altezza ?? null) : null;
        }
        if (master.copertinaUrl === riga.chiave) aggiorna.copertinaUrl = null;
        if (master.videoUrl === riga.chiave) aggiorna.videoUrl = null;
        const carosello = righe(master.caroselloUrl);
        if (carosello.includes(riga.chiave)) {
          aggiorna.caroselloUrl = carosello.filter((c) => c !== riga.chiave).join("\n") || null;
        }
        await db.update(schema.marchi).set(aggiorna).where(eq(schema.marchi.id, riga.marchioId));
      }

      const tutti = await leggiTutto();
      return { marchio: tutti.find((x) => x.id === riga.marchioId) ?? null };
    }),

  /**
   * Cambio di stato senza riscrivere la scheda: è il "SALVA E PUBBLICA" del punto 7.
   * L'indirizzo, la posizione e i collegamenti restano quelli di prima.
   */
  cambiaStato: base
    .input(
      auth.extend({
        id: z.number().int().positive(),
        stato: z.enum(["attiva", "bozza", "in_allestimento"]),
      }),
    )
    .handler(async ({ input }) => {
      controlla(input.codice);
      await db
        .update(schema.marchi)
        .set({ stato: input.stato, updatedAt: new Date() })
        .where(eq(schema.marchi.id, input.id));
      const tutti = await leggiTutto();
      return { marchio: tutti.find((x) => x.id === input.id) ?? null };
    }),
};
