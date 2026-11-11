import { z } from "zod";
import { ORPCError } from "@orpc/server";
import { eq } from "drizzle-orm";
import { base } from "../__core/app";
import { db } from "../database";
import * as schema from "../database/schema";
import { catalogoCompleto, type BranoCatalogo } from "../lib/catalogo-musicale";
import { chiaveTitolo, nuovoIdBrano, titoloPulito } from "../data/sorgenti-musicali";
import {
  AMBITI_LINK,
  INFO_PIATTAFORME,
  MESSAGGIO_ATTESA,
  ORDINE_PIATTAFORME,
  PERCORSI_MUSICA,
  PIATTAFORME_USCITA,
  RICORRENZE,
  STATI_USCITA,
  TIPI_USCITA,
  embedSpotify,
  erroreIsrc,
  erroreUpc,
  erroreUrl,
  statoEffettivo,
  type LinkUscita,
  type Uscita,
} from "../data/uscite-musicali";

/**
 * USCITE MUSICALI — schede di pubblicazione (singoli e album) con i collegamenti alle piattaforme.
 * 04/11/2026 (round 16). Dati in `cms_v1:uscite` (chiave condivisa anteprima/www, nessuna tabella nuova).
 * Vedi src/api/data/uscite-musicali.ts per le regole.
 */

const CHIAVE = "cms_v1:uscite";
const CODICE = () => (process.env.TBH_CODICE_ALLESTIMENTO ?? "").trim();

function controlla(codice: string) {
  const atteso = CODICE();
  if (!atteso) throw new ORPCError("SERVICE_UNAVAILABLE", { message: "Codice di allestimento non configurato sul server." });
  if (codice.trim() !== atteso) throw new ORPCError("UNAUTHORIZED", { message: "Codice di allestimento errato." });
}

async function leggiUscite(): Promise<Uscita[]> {
  const [r] = await db.select().from(schema.settings).where(eq(schema.settings.key, CHIAVE));
  if (!r) return [];
  try {
    const v = JSON.parse(r.value) as unknown;
    return Array.isArray(v) ? (v as Uscita[]) : [];
  } catch {
    return [];
  }
}

async function salvaUscite(v: Uscita[]) {
  const value = JSON.stringify(v);
  await db.insert(schema.settings).values({ key: CHIAVE, value }).onConflictDoUpdate({ target: schema.settings.key, set: { value } });
}

const idLink = () => `lnk-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
const DATA = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Data nel formato AAAA-MM-GG")
  .nullable()
  .optional()
  .transform((v) => v ?? null);
const testo = (max: number) =>
  z
    .string()
    .max(max)
    .nullable()
    .optional()
    .transform((v) => (v ?? "").trim() || null);

const LINK_INPUT = z.object({
  id: z.string().max(40).optional(),
  piattaforma: z.enum(PIATTAFORME_USCITA),
  ambito: z.enum(AMBITI_LINK).default("brano"),
  etichetta: testo(60),
  url: z.string().min(1, "Indirizzo mancante").max(600),
  dataProgrammata: DATA,
  disponibilitaConfermata: z.boolean(),
  ultimaVerifica: DATA,
  notaVerifica: testo(300),
});

/* 04/11/2026 (round 17) — codici di pubblicazione: spazi e trattini tolti, maiuscole. */
const codiceInput = z
  .string()
  .max(20)
  .nullable()
  .optional()
  .transform((v) => (v ?? "").replace(/[\s-]/g, "").toUpperCase() || null);

/** Dati del BRANO modificabili dalla scheda di pubblicazione (tabella brani_master, colonne esistenti). */
const BRANO_INPUT = z.object({
  titolo: z.string().min(1).max(200),
  artista: testo(120),
  cover: testo(500),
  genere: testo(60),
});

const USCITA_INPUT = z.object({
  id: z.string().min(1).max(40),
  tipo: z.enum(TIPI_USCITA),
  artistaDistribuito: testo(120),
  distribuzione: testo(80),
  isrc: codiceInput,
  upc: codiceInput,
  stato: z.enum(STATI_USCITA).nullable().optional().transform((v) => v ?? null),
  ricorrenza: z.enum(RICORRENZE).nullable().optional().transform((v) => v ?? null),
  produzioneJcHugo: z.boolean().optional(),
  brano: BRANO_INPUT.optional(),
  dataUscita: DATA,
  etichettaDiscografica: testo(80),
  messaggioAttesa: testo(120),
  notaMateriali: testo(400),
  link: z.array(LINK_INPUT).max(40),
});

/** Il brano visto dalla scheda di pubblicazione: solo i dati che servono alle pagine. */
function riassuntoBrano(b: BranoCatalogo) {
  const ascolto = b.sorgenti.filter((s) => s.tipo !== "videoclip");
  const video = b.sorgenti.find((s) => s.tipo === "videoclip") ?? null;
  return {
    id: b.id,
    titolo: b.titolo,
    artista: b.artista,
    cover: b.cover,
    genere: b.genere,
    origine: b.origine,
    descrizione: b.descrizione,
    nascosto: b.nascosto,
    haAudio: ascolto.length > 0,
    haVideo: !!(video || (b.statoVideo === "pubblicato" && b.videoUrl)),
    audioUrl: ascolto[0]?.urlOriginale ?? ascolto[0]?.url ?? b.audioUrl ?? null,
    videoUrl: video?.urlOriginale ?? video?.url ?? b.videoUrl ?? null,
  };
}

function ordinaLink(l: LinkUscita[]) {
  return [...l].sort(
    (a, b) =>
      (ORDINE_PIATTAFORME.get(a.piattaforma) ?? 99) - (ORDINE_PIATTAFORME.get(b.piattaforma) ?? 99) ||
      a.ambito.localeCompare(b.ambito),
  );
}

async function usciteConBrano(includiNascosti: boolean) {
  const [uscite, catalogo] = await Promise.all([leggiUscite(), catalogoCompleto()]);
  const per = new Map(catalogo.map((b) => [b.id, b]));
  return uscite
    .map((u) => {
      const b = per.get(u.id);
      if (!b) return null;
      const link = ordinaLink(u.link);
      // Player Spotify ufficiale: solo da un link Spotify con disponibilità CONFERMATA.
      const spotify = link.find((l) => l.piattaforma === "spotify" && l.disponibilitaConfermata && embedSpotify(l.url));
      return {
        ...u,
        artistaDistribuito: u.artistaDistribuito ?? null,
        distribuzione: u.distribuzione ?? null,
        isrc: u.isrc ?? null,
        upc: u.upc ?? null,
        stato: u.stato ?? null,
        ricorrenza: u.ricorrenza ?? null,
        produzioneJcHugo: u.produzioneJcHugo ?? /hug[oò]/i.test(b.artista ?? ""),
        statoMostrato: statoEffettivo(u),
        link,
        spotifyEmbed: spotify ? embedSpotify(spotify.url) : null,
        brano: riassuntoBrano(b),
        scheda: PERCORSI_MUSICA.scheda(u.id),
      };
    })
    .filter((u): u is NonNullable<typeof u> => !!u && (includiNascosti || !u.brano.nascosto))
    .sort(
      (a, b) =>
        // Prima le uscite con data (in ordine di data), poi «Data da confermare» (ultime aggiornate prima).
        Number(!a.dataUscita) - Number(!b.dataUscita) ||
        (a.dataUscita ?? "").localeCompare(b.dataUscita ?? "") ||
        b.aggiornato.localeCompare(a.aggiornato),
    );
}

export const usciteMusicali = {
  /** Tutte le uscite pubblicate, con il brano del catalogo a cui appartengono. */
  elenco: base.handler(async () => ({
    uscite: await usciteConBrano(false),
    messaggioAttesa: MESSAGGIO_ATTESA,
    percorsi: PERCORSI_MUSICA,
    piattaforme: INFO_PIATTAFORME,
  })),
};

export const usciteMusicaliAdmin = {
  /** Le uscite (anche dei brani nascosti) + l'elenco dei brani per agganciarne una nuova. */
  elenco: base.input(z.object({ codice: z.string() })).handler(async ({ input }) => {
    controlla(input.codice);
    const catalogo = await catalogoCompleto();
    return {
      uscite: await usciteConBrano(true),
      brani: catalogo.map((b) => ({ id: b.id, titolo: b.titolo, artista: b.artista, origine: b.origine })),
      piattaforme: INFO_PIATTAFORME,
    };
  }),

  /** Salva (crea o sostituisce) la scheda di pubblicazione di un brano. */
  salva: base.input(z.object({ codice: z.string(), uscita: USCITA_INPUT })).handler(async ({ input }) => {
    controlla(input.codice);
    const u = input.uscita;
    let catalogo = await catalogoCompleto();
    const brano = catalogo.find((b) => b.id === u.id);
    if (!brano)
      throw new ORPCError("NOT_FOUND", { message: "Il brano non è nel catalogo: crea prima la scheda del brano." });
    if (u.isrc) {
      const e = erroreIsrc(u.isrc);
      if (e) throw new ORPCError("BAD_REQUEST", { message: e });
    }
    if (u.upc) {
      const e = erroreUpc(u.upc);
      if (e) throw new ORPCError("BAD_REQUEST", { message: e });
    }

    const visti = new Set<string>();
    const link: LinkUscita[] = [];
    for (const [i, l] of u.link.entries()) {
      const url = l.url.trim();
      const err = erroreUrl(l.piattaforma, url);
      if (err) throw new ORPCError("BAD_REQUEST", { message: `Link ${i + 1} (${INFO_PIATTAFORME[l.piattaforma].nome}): ${err}` });
      if (l.piattaforma === "altro-store" && !l.etichetta)
        throw new ORPCError("BAD_REQUEST", { message: `Link ${i + 1}: per «Altro store» scrivi il nome dello store.` });
      const ambito = INFO_PIATTAFORME[l.piattaforma].social ? l.ambito : "brano";
      const k = `${l.piattaforma}|${ambito}|${url}`;
      if (visti.has(k)) continue; // doppione nello stesso invio: si tiene uno solo
      visti.add(k);
      link.push({
        id: l.id || idLink(),
        piattaforma: l.piattaforma,
        ambito,
        etichetta: l.etichetta,
        url,
        dataProgrammata: l.dataProgrammata,
        disponibilitaConfermata: l.disponibilitaConfermata,
        ultimaVerifica: l.ultimaVerifica,
        notaVerifica: l.notaVerifica,
      });
    }

    const tutte = await leggiUscite();
    // ISRC e UPC identificano UNA pubblicazione: mai ripetuti su un'altra scheda.
    for (const [campo, valore] of [["ISRC", u.isrc], ["UPC", u.upc]] as const) {
      if (!valore) continue;
      const altra = tutte.find((x) => x.id !== u.id && (campo === "ISRC" ? x.isrc : x.upc) === valore);
      if (altra) {
        const t = catalogo.find((b) => b.id === altra.id)?.titolo ?? altra.id;
        throw new ORPCError("CONFLICT", { message: `L'${campo} ${valore} è già usato per «${t}».` });
      }
    }
    // Un link di BRANO (HyperFollow, store, post) appartiene a una sola pubblicazione: mai riusato su un'altra.
    for (const l of link) {
      if (l.ambito === "profilo") continue;
      const altra = tutte.find((x) => x.id !== u.id && x.link.some((y) => y.ambito !== "profilo" && y.url === l.url));
      if (altra) {
        const t = catalogo.find((b) => b.id === altra.id)?.titolo ?? altra.id;
        throw new ORPCError("CONFLICT", { message: `Il link ${INFO_PIATTAFORME[l.piattaforma].nome} è già usato per «${t}»: ogni pubblicazione ha i suoi link.` });
      }
    }

    // Titolo, artista, cover e genere sono del BRANO: si aggiornano nella sua scheda (brani_master).
    if (u.brano) {
      const [riga] = await db.select().from(schema.braniMaster).where(eq(schema.braniMaster.id, u.id)).limit(1);
      const titolo = titoloPulito(u.brano.titolo);
      const cambia =
        !riga ||
        riga.titolo !== titolo ||
        (riga.artista ?? null) !== u.brano.artista ||
        (riga.cover ?? null) !== u.brano.cover ||
        (riga.genere ?? null) !== u.brano.genere;
      if (!riga && (brano.titolo !== titolo || brano.artista !== u.brano.artista || brano.cover !== u.brano.cover || brano.genere !== u.brano.genere))
        throw new ORPCError("BAD_REQUEST", { message: "Questo brano fa parte delle uscite storiche del canale: titolo, artista, cover e genere non si modificano da qui." });
      if (riga && cambia) {
        const chiave = chiaveTitolo(titolo);
        const doppio = catalogo.find((b) => b.id !== u.id && b.chiaveTitolo === chiave);
        if (doppio) throw new ORPCError("CONFLICT", { message: `Esiste già nel catalogo: «${doppio.titolo}» (${doppio.id}).` });
        await db
          .update(schema.braniMaster)
          .set({ titolo, chiaveTitolo: chiave, artista: u.brano.artista, cover: u.brano.cover, genere: u.brano.genere, updatedAt: new Date() })
          .where(eq(schema.braniMaster.id, u.id));
        catalogo = await catalogoCompleto();
      }
    }
    const artistaFinale = catalogo.find((b) => b.id === u.id)?.artista ?? null;

    const nuova: Uscita = {
      id: u.id,
      tipo: u.tipo,
      artistaDistribuito: u.artistaDistribuito,
      distribuzione: u.distribuzione,
      isrc: u.isrc,
      upc: u.upc,
      stato: u.stato,
      ricorrenza: u.ricorrenza,
      produzioneJcHugo: u.produzioneJcHugo ?? /hug[oò]/i.test(artistaFinale ?? ""),
      dataUscita: u.dataUscita,
      etichettaDiscografica: u.etichettaDiscografica,
      messaggioAttesa: u.messaggioAttesa,
      notaMateriali: u.notaMateriali,
      link,
      aggiornato: new Date().toISOString(),
    };
    const i = tutte.findIndex((x) => x.id === u.id);
    if (i >= 0) tutte[i] = nuova;
    else tutte.push(nuova);
    await salvaUscite(tutte);
    return { ok: true as const, uscita: nuova };
  }),

  /** Toglie la scheda di pubblicazione (il brano resta nel catalogo). */
  rimuovi: base.input(z.object({ codice: z.string(), id: z.string().min(1) })).handler(async ({ input }) => {
    controlla(input.codice);
    const tutte = await leggiUscite();
    await salvaUscite(tutte.filter((x) => x.id !== input.id));
    return { ok: true as const };
  }),

  /**
   * Crea la scheda di un brano che non ha ancora un indirizzo d'ascolto (es. singolo in pre-save),
   * con controllo doppioni sul titolo, e la sua scheda di pubblicazione vuota.
   */
  creaBrano: base
    .input(
      z.object({
        codice: z.string(),
        titolo: z.string().min(1).max(200),
        artista: testo(120),
        cover: testo(500),
        descrizione: testo(2000),
        tipo: z.enum(TIPI_USCITA).default("singolo"),
        etichettaDiscografica: testo(80),
      }),
    )
    .handler(async ({ input }) => {
      controlla(input.codice);
      const titolo = titoloPulito(input.titolo);
      const chiave = chiaveTitolo(titolo);
      if (!chiave) throw new ORPCError("BAD_REQUEST", { message: "Titolo non valido." });
      const catalogo = await catalogoCompleto();
      const doppio = catalogo.find((b) => b.chiaveTitolo === chiave);
      if (doppio)
        throw new ORPCError("CONFLICT", { message: `Esiste già nel catalogo: «${doppio.titolo}» (${doppio.id}). Usa quella scheda.` });
      const id = nuovoIdBrano();
      const adesso = new Date();
      await db.insert(schema.braniMaster).values({
        id,
        titolo,
        chiaveTitolo: chiave,
        artista: input.artista,
        cover: input.cover,
        genere: null,
        anno: null,
        descrizione: input.descrizione,
        notaInterna: "Scheda creata dal pannello «Uscite e store» (nessun indirizzo d'ascolto al momento della creazione).",
        stato: "verificato",
        tornata: `USCITE E STORE · ${adesso.toLocaleDateString("it-IT", { timeZone: "Europe/Rome" })}`,
        nascosto: false,
        ordine: 0,
        createdAt: adesso,
        updatedAt: adesso,
      });
      const tutte = await leggiUscite();
      tutte.push({
        id,
        tipo: input.tipo,
        dataUscita: null,
        etichettaDiscografica: input.etichettaDiscografica,
        messaggioAttesa: null,
        notaMateriali: null,
        link: [],
        aggiornato: adesso.toISOString(),
      });
      await salvaUscite(tutte);
      return { ok: true as const, id };
    }),
};
