import { z } from "zod";
import { ORPCError } from "@orpc/server";
import { eq } from "drizzle-orm";
import { base } from "../__core/app";
import { db } from "../database";
import * as schema from "../database/schema";
import {
  CATALOGO_MUSICALE_NOTA,
  ETICHETTE_PIATTAFORMA,
  ETICHETTE_TIPO,
  FORMATI_AMMESSI,
  IMPORTAZIONE_NOTA,
  PIATTAFORME,
  STATI_SCHEDA,
  TIPI_SORGENTE,
  TORNATA_CORRENTE,
  chiaveTitolo,
  indirizzoPlayer,
  riconosciElenco,
  riepilogoElenco,
  titoloPulito,
  versioneDalTitolo,
} from "../data/sorgenti-musicali";
import {
  ROAD_2030_NOTA,
  ROAD_2030_OBIETTIVO,
  FLUSSO_ROAD_2030,
  CANALE_TOUCH_MUSIC,
  HUGO,
} from "../data/musica";
import {
  branoEsiste,
  catalogoCompleto,
  cercaDuplicato,
  importaIndirizzo,
  type BranoCatalogo,
  type EsitoImportazione,
} from "../lib/catalogo-musicale";

/**
 * ────────────────────────────────────────────────────────────────────────────────
 * CATALOGO MUSICALE — le richieste del pannello e delle pagine pubbliche.
 *
 * Correzione del 29/09/2026: «il sistema è troppo legato al video. La musica deve
 * poter esistere ed essere pubblicata anche senza videoclip.»
 *
 * Quindi qui NON esiste nessuna richiesta che pretenda un file video per pubblicare
 * un brano. Si pubblica con la sorgente d'ascolto reale — Suno, YouTube, YouTube
 * Music, un file audio — e il videoclip resta una lavorazione a parte, che arriva
 * dopo e non blocca niente.
 *
 * Il conteggio del catalogo è il numero di BRANI MASTER distinti: due versioni dello
 * stesso titolo sono due sorgenti dello stesso brano, non due brani.
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

/** Il brano visto da fuori: senza le annotazioni di redazione. */
function pubblico(b: BranoCatalogo) {
  const { notaInterna: _nota, ...resto } = b;
  return resto;
}

/** I conteggi del catalogo. Il totale è per BRANI, non per sorgenti. */
function conteggi(brani: BranoCatalogo[]) {
  const conta = (f: (b: BranoCatalogo) => boolean) => brani.filter(f).length;
  return {
    /** IL NUMERO DEL CATALOGO: brani master distinti, versioni escluse. */
    braniMaster: brani.length,
    audioPubblicati: conta((b) => b.statoAudio === "pubblicato"),
    daCompletare: conta((b) => b.statoAudio !== "pubblicato"),
    daVerificare: conta((b) => b.statoScheda === "da-verificare"),
    videoclipPubblicati: conta((b) => b.statoVideo === "pubblicato" && !!b.videoUrl),
    videoclipInLavorazione: conta((b) => b.statoVideo === "in-produzione"),
    videoclipDaRealizzare: conta((b) => b.statoVideo === "da-realizzare"),
    castingAperti: conta((b) => !!b.casting),
    coverMancanti: conta((b) => !b.cover),
    linkMancanti: conta((b) => b.sorgenti.length === 0),
    conVersioni: conta((b) => b.versioni.length > 0),
    sorgentiTotali: brani.reduce((n, b) => n + b.sorgenti.length, 0),
    importati: conta((b) => b.origine === "importato"),
    storici: conta((b) => b.origine === "catalogo"),
    avanzamento:
      brani.length === 0
        ? 0
        : Math.round(
            (conta((b) => b.statoVideo === "pubblicato" && !!b.videoUrl) / brani.length) * 100,
          ),
  };
}

/** I titoli che compaiono più di una volta: la vista «DUPLICATI» del pannello. */
function gruppiDuplicati(brani: BranoCatalogo[]) {
  const per = new Map<string, BranoCatalogo[]>();
  for (const b of brani) {
    if (!b.chiaveTitolo) continue;
    const l = per.get(b.chiaveTitolo) ?? [];
    l.push(b);
    per.set(b.chiaveTitolo, l);
  }
  return [...per.entries()]
    .filter(([, l]) => l.length > 1)
    .map(([chiave, l]) => ({
      chiave,
      brani: l.map((b) => ({
        id: b.id,
        titolo: b.titolo,
        origine: b.origine,
        sorgenti: b.sorgenti.length,
        versioni: b.versioni,
      })),
    }));
}

export const catalogoMusicale = {
  /**
   * IL CATALOGO. Una sola lettura per tutte le pagine: pubblico, pannello,
   * «Road to 2030» e discografia filtrano questo stesso elenco.
   */
  catalogo: base
    .input(z.object({ includiNascosti: z.boolean().optional() }).optional())
    .handler(async ({ input }) => {
      const tutti = await catalogoCompleto();
      const brani = input?.includiNascosti ? tutti : tutti.filter((b) => !b.nascosto);
      return {
        brani: brani.map(pubblico),
        conteggi: conteggi(brani),
        /** LE ULTIME USCITE: si aggiorna da sé a ogni inserimento, in ordine di inserimento. */
        ultimeUscite: brani
          .filter((b) => b.origine === "importato" && b.statoAudio === "pubblicato")
          .slice(0, 12)
          .map((b) => ({
            id: b.id,
            titolo: b.titolo,
            artista: b.artista,
            cover: b.cover,
            audioUrl: b.audioUrl,
            etichetta: b.etichetta,
          })),
        generi: [...new Set(brani.map((b) => b.genere).filter((g): g is string => !!g))].sort(),
        artista: HUGO,
        canale: CANALE_TOUCH_MUSIC,
        nota: CATALOGO_MUSICALE_NOTA,
        roadNota: ROAD_2030_NOTA,
        roadObiettivo: ROAD_2030_OBIETTIVO,
        flusso: FLUSSO_ROAD_2030,
        formati: FORMATI_AMMESSI,
        tornata: TORNATA_CORRENTE,
        etichettePiattaforma: ETICHETTE_PIATTAFORMA,
        etichetteTipo: ETICHETTE_TIPO,
      };
    }),

  /**
   * IL CATALOGO PER IL PANNELLO: include i nascosti, le annotazioni interne, le
   * viste di servizio (da verificare, duplicati, cover mancanti, link mancanti).
   */
  pannello: base.input(z.object({ codice: z.string() })).handler(async ({ input }) => {
    controlla(input.codice);
    const brani = await catalogoCompleto();
    return {
      brani,
      conteggi: conteggi(brani),
      duplicati: gruppiDuplicati(brani),
      tornata: TORNATA_CORRENTE,
      nota: CATALOGO_MUSICALE_NOTA,
      notaImportazione: IMPORTAZIONE_NOTA,
      formati: FORMATI_AMMESSI,
      piattaforme: PIATTAFORME,
      tipi: TIPI_SORGENTE,
      etichettePiattaforma: ETICHETTE_PIATTAFORMA,
      etichetteTipo: ETICHETTE_TIPO,
    };
  }),

  /**
   * ANALIZZA GLI INDIRIZZI INCOLLATI — il passo che risponde subito, prima di scrivere
   * qualunque cosa: quanti indirizzi sono, di che piattaforma, e quali sono già in
   * catalogo. Non crea e non modifica nulla.
   */
  analizza: base
    .input(z.object({ codice: z.string(), testo: z.string().max(40_000) }))
    .handler(async ({ input }) => {
      controlla(input.codice);
      const { sorgenti, scartate, ripetuteNelTesto } = riconosciElenco(input.testo);
      const catalogo = await catalogoCompleto();
      const righe = sorgenti.map((s) => {
        const dup = cercaDuplicato(catalogo, { url: s.url, idEsterno: s.idEsterno });
        return {
          urlOriginale: s.urlOriginale,
          url: s.url,
          piattaforma: s.piattaforma,
          etichettaPiattaforma: ETICHETTE_PIATTAFORMA[s.piattaforma],
          tipo: s.tipo,
          etichettaTipo: ETICHETTE_TIPO[s.tipo],
          idEsterno: s.idEsterno,
          daRisolvere: s.daRisolvere,
          avviso: s.avviso,
          /** Il controllo sul titolo si può fare solo dopo la lettura dei metadati. */
          giaPresente: !!dup.branoId,
          branoId: dup.branoId,
          branoTitolo: dup.titolo,
        };
      });
      return {
        riepilogo: riepilogoElenco(sorgenti),
        righe,
        scartate,
        ripetuteNelTesto,
        giaPresenti: righe.filter((r) => r.giaPresente).length,
        daImportare: righe.filter((r) => !r.giaPresente).length,
        nota: IMPORTAZIONE_NOTA,
      };
    }),

  /**
   * IMPORTA — un indirizzo o un elenco incollato, stesso comando.
   *
   * Per ogni indirizzo: metadati dalla piattaforma → controllo duplicati → scheda
   * creata, oppure sorgente agganciata al brano che esiste già. Quando i metadati
   * non arrivano la scheda nasce comunque vuota, «da-verificare», da completare a
   * mano: non viene mai inventato un titolo o una copertina.
   */
  importa: base
    .input(
      z.object({
        codice: z.string(),
        testo: z.string().min(1).max(40_000),
        tornata: z.string().max(120).optional(),
        tipo: z.enum(TIPI_SORGENTE).optional(),
        versione: z.string().max(60).nullable().optional(),
      }),
    )
    .handler(async ({ input }) => {
      controlla(input.codice);
      const { sorgenti, scartate } = riconosciElenco(input.testo);
      if (sorgenti.length === 0)
        throw new ORPCError("BAD_REQUEST", {
          message: "Nessun indirizzo riconosciuto nel testo incollato.",
        });
      if (sorgenti.length > 60)
        throw new ORPCError("BAD_REQUEST", {
          message: `Troppi indirizzi in una volta (${sorgenti.length}): importane al massimo 60 per tornata.`,
        });

      const tornata = (input.tornata ?? "").trim() || TORNATA_CORRENTE;
      const esiti: EsitoImportazione[] = [];
      // Uno per volta, non in parallelo: il controllo duplicati deve vedere anche i
      // brani creati un istante prima, altrimenti due link gemelli passano entrambi.
      for (const s of sorgenti)
        esiti.push(
          await importaIndirizzo(s.urlOriginale, {
            tornata,
            tipo: input.tipo,
            versione: input.versione ?? null,
          }),
        );

      const conta = (e: EsitoImportazione["esito"]) => esiti.filter((x) => x.esito === e).length;
      return {
        esiti,
        scartate,
        riepilogo: {
          totale: esiti.length,
          creati: conta("creato"),
          sorgentiAggiunte: conta("sorgente-aggiunta"),
          giaPresenti: conta("gia-presente"),
          errori: conta("errore"),
          daCompletare: esiti.filter((e) => e.daCompletare).length,
        },
        tornata,
      };
    }),

  /**
   * COMPLETA LA SCHEDA A MANO — il rimedio previsto quando la piattaforma non
   * restituisce i dati: titolo, artista, copertina, genere, anno, descrizione.
   * Vale solo per le schede importate: le 40 uscite storiche non si riscrivono.
   */
  aggiornaBrano: base
    .input(
      z.object({
        codice: z.string(),
        id: z.string().min(1),
        titolo: z.string().max(200).optional(),
        artista: z.string().max(120).nullable().optional(),
        cover: z.string().max(500).nullable().optional(),
        genere: z.string().max(60).nullable().optional(),
        anno: z.string().max(40).nullable().optional(),
        descrizione: z.string().max(2000).nullable().optional(),
        notaInterna: z.string().max(1000).nullable().optional(),
        stato: z.enum(STATI_SCHEDA).optional(),
        nascosto: z.boolean().optional(),
      }),
    )
    .handler(async ({ input }) => {
      controlla(input.codice);
      const [riga] = await db
        .select()
        .from(schema.braniMaster)
        .where(eq(schema.braniMaster.id, input.id))
        .limit(1);
      if (!riga)
        throw new ORPCError("NOT_FOUND", {
          message:
            "Scheda non trovata. Le 40 uscite storiche del canale non si modificano da qui.",
        });

      const titolo = input.titolo === undefined ? riga.titolo : titoloPulito(input.titolo);
      const pulisci = (v: string | null | undefined, vecchio: string | null) =>
        v === undefined ? vecchio : (v ?? "").trim() || null;

      await db
        .update(schema.braniMaster)
        .set({
          titolo,
          chiaveTitolo: chiaveTitolo(titolo),
          artista: pulisci(input.artista, riga.artista),
          cover: pulisci(input.cover, riga.cover),
          genere: pulisci(input.genere, riga.genere),
          anno: pulisci(input.anno, riga.anno),
          descrizione: pulisci(input.descrizione, riga.descrizione),
          notaInterna: pulisci(input.notaInterna, riga.notaInterna),
          stato: input.stato ?? riga.stato,
          nascosto: input.nascosto ?? riga.nascosto,
          updatedAt: new Date(),
        })
        .where(eq(schema.braniMaster.id, input.id));

      const catalogo = await catalogoCompleto();
      return { brano: catalogo.find((b) => b.id === input.id) ?? null };
    }),

  /**
   * + AGGIUNGI SORGENTE — un altro indirizzo per lo STESSO brano, senza creare un
   * secondo record: è così che convivono l'audio su Suno e il videoclip su YouTube.
   */
  aggiungiSorgente: base
    .input(
      z.object({
        codice: z.string(),
        branoId: z.string().min(1),
        url: z.string().min(4).max(500),
        tipo: z.enum(TIPI_SORGENTE).optional(),
        piattaforma: z.enum(PIATTAFORME).optional(),
        versione: z.string().max(60).nullable().optional(),
        cover: z.string().max(500).nullable().optional(),
        nota: z.string().max(500).nullable().optional(),
        principale: z.boolean().optional(),
      }),
    )
    .handler(async ({ input }) => {
      controlla(input.codice);
      if (!(await branoEsiste(input.branoId)))
        throw new ORPCError("NOT_FOUND", { message: "Brano non in catalogo." });

      const { sorgenti } = riconosciElenco(input.url);
      const letta = sorgenti[0];
      if (!letta)
        throw new ORPCError("BAD_REQUEST", { message: "Indirizzo non riconosciuto." });

      const catalogo = await catalogoCompleto();
      const dup = cercaDuplicato(catalogo, { url: letta.url, idEsterno: letta.idEsterno });
      if (dup.branoId && dup.sorgenteGiaPresente)
        throw new ORPCError("CONFLICT", {
          message:
            dup.branoId === input.branoId
              ? "Questa sorgente è già agganciata a questo brano."
              : `Indirizzo già presente nel catalogo, sul brano «${dup.titolo}».`,
        });

      if (input.principale)
        await db
          .update(schema.braniSorgenti)
          .set({ principale: false })
          .where(eq(schema.braniSorgenti.branoId, input.branoId));

      await db.insert(schema.braniSorgenti).values({
        branoId: input.branoId,
        tipo: input.tipo ?? letta.tipo,
        piattaforma: input.piattaforma ?? letta.piattaforma,
        url: letta.url,
        urlOriginale: letta.urlOriginale,
        idEsterno: letta.idEsterno,
        versione: (input.versione ?? "").trim() || null,
        cover: (input.cover ?? "").trim() || null,
        principale: input.principale ?? false,
        nota: (input.nota ?? "").trim() || letta.avviso,
        ordine: 0,
      });
      if (input.branoId.startsWith("mus-"))
        await db
          .update(schema.braniMaster)
          .set({ updatedAt: new Date() })
          .where(eq(schema.braniMaster.id, input.branoId));

      const dopo = await catalogoCompleto();
      return { brano: dopo.find((b) => b.id === input.branoId) ?? null };
    }),

  /** Cambia tipo, versione o nota di una sorgente già agganciata. */
  aggiornaSorgente: base
    .input(
      z.object({
        codice: z.string(),
        id: z.number().int().positive(),
        tipo: z.enum(TIPI_SORGENTE).optional(),
        piattaforma: z.enum(PIATTAFORME).optional(),
        versione: z.string().max(60).nullable().optional(),
        cover: z.string().max(500).nullable().optional(),
        nota: z.string().max(500).nullable().optional(),
        principale: z.boolean().optional(),
      }),
    )
    .handler(async ({ input }) => {
      controlla(input.codice);
      const [riga] = await db
        .select()
        .from(schema.braniSorgenti)
        .where(eq(schema.braniSorgenti.id, input.id))
        .limit(1);
      if (!riga) throw new ORPCError("NOT_FOUND", { message: "Sorgente non trovata." });

      if (input.principale)
        await db
          .update(schema.braniSorgenti)
          .set({ principale: false })
          .where(eq(schema.braniSorgenti.branoId, riga.branoId));

      await db
        .update(schema.braniSorgenti)
        .set({
          tipo: input.tipo ?? riga.tipo,
          piattaforma: input.piattaforma ?? riga.piattaforma,
          versione: input.versione === undefined ? riga.versione : (input.versione ?? "").trim() || null,
          cover: input.cover === undefined ? riga.cover : (input.cover ?? "").trim() || null,
          nota: input.nota === undefined ? riga.nota : (input.nota ?? "").trim() || null,
          principale: input.principale ?? riga.principale,
        })
        .where(eq(schema.braniSorgenti.id, input.id));

      const dopo = await catalogoCompleto();
      return { brano: dopo.find((b) => b.id === riga.branoId) ?? null };
    }),

  /** Stacca una sorgente dal brano. Il brano resta, con le altre sorgenti. */
  rimuoviSorgente: base
    .input(z.object({ codice: z.string(), id: z.number().int().positive() }))
    .handler(async ({ input }) => {
      controlla(input.codice);
      const [riga] = await db
        .select()
        .from(schema.braniSorgenti)
        .where(eq(schema.braniSorgenti.id, input.id))
        .limit(1);
      if (!riga) throw new ORPCError("NOT_FOUND", { message: "Sorgente non trovata." });
      await db.delete(schema.braniSorgenti).where(eq(schema.braniSorgenti.id, input.id));
      const dopo = await catalogoCompleto();
      return { brano: dopo.find((b) => b.id === riga.branoId) ?? null };
    }),

  /**
   * UNISCI DUE SCHEDE — quando il controllo duplicati non ha potuto vedere che erano
   * lo stesso brano (titoli scritti in modo diverso). Le sorgenti passano al brano
   * che resta, la scheda in più viene cancellata: nessun contenuto va perso.
   */
  unisciBrani: base
    .input(z.object({ codice: z.string(), tieni: z.string().min(1), unisci: z.string().min(1) }))
    .handler(async ({ input }) => {
      controlla(input.codice);
      if (input.tieni === input.unisci)
        throw new ORPCError("BAD_REQUEST", { message: "Sono la stessa scheda." });
      if (!(await branoEsiste(input.tieni)))
        throw new ORPCError("NOT_FOUND", { message: "Brano da tenere non trovato." });
      const [daUnire] = await db
        .select()
        .from(schema.braniMaster)
        .where(eq(schema.braniMaster.id, input.unisci))
        .limit(1);
      if (!daUnire)
        throw new ORPCError("NOT_FOUND", {
          message: "Si possono unire solo le schede importate, non le uscite storiche del canale.",
        });

      await db
        .update(schema.braniSorgenti)
        .set({ branoId: input.tieni, principale: false })
        .where(eq(schema.braniSorgenti.branoId, input.unisci));
      await db.delete(schema.braniMaster).where(eq(schema.braniMaster.id, input.unisci));
      if (input.tieni.startsWith("mus-"))
        await db
          .update(schema.braniMaster)
          .set({ updatedAt: new Date() })
          .where(eq(schema.braniMaster.id, input.tieni));

      const dopo = await catalogoCompleto();
      return { brano: dopo.find((b) => b.id === input.tieni) ?? null, uniti: input.unisci };
    }),

  /**
   * CANCELLA UNA SCHEDA IMPORTATA e le sue sorgenti. Non tocca la produzione video
   * né i casting, che hanno un loro pannello: qui si cancella solo la scheda musicale.
   */
  eliminaBrano: base
    .input(z.object({ codice: z.string(), id: z.string().min(1) }))
    .handler(async ({ input }) => {
      controlla(input.codice);
      const [riga] = await db
        .select()
        .from(schema.braniMaster)
        .where(eq(schema.braniMaster.id, input.id))
        .limit(1);
      if (!riga)
        throw new ORPCError("NOT_FOUND", {
          message: "Scheda non trovata: le uscite storiche del canale non si cancellano.",
        });
      await db.delete(schema.braniSorgenti).where(eq(schema.braniSorgenti.branoId, input.id));
      await db.delete(schema.braniMaster).where(eq(schema.braniMaster.id, input.id));
      return { ok: true as const, id: input.id };
    }),

  /**
   * LA SCHEDA DI UN SINGOLO BRANO, per la pagina pubblica e per il pannello.
   * Porta con sé l'indirizzo del player quando la piattaforma lo consente: se non lo
   * consente, la pagina mostra copertina e pulsante d'ascolto e nient'altro.
   */
  brano: base.input(z.object({ id: z.string().min(1) })).handler(async ({ input }) => {
    const catalogo = await catalogoCompleto();
    const b = catalogo.find((x) => x.id === input.id);
    if (!b) throw new ORPCError("NOT_FOUND", { message: "Brano non in catalogo." });
    return {
      brano: pubblico(b),
      /** Le altre versioni dello stesso titolo, se la direzione ne ha registrate. */
      sorgentiAscolto: b.sorgenti
        .filter((s) => s.tipo !== "videoclip")
        .map((s) => ({ ...s, embed: indirizzoPlayer(s) })),
      sorgentiVideo: b.sorgenti.filter((s) => s.tipo === "videoclip"),
      versioneDalTitolo: versioneDalTitolo(b.titolo),
    };
  }),
};
