import { z } from "zod";
import { ORPCError } from "@orpc/server";
import { DeleteObjectCommand, HeadObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { base } from "../__core/app";
import { AMBIENTE } from "../lib/ambiente";
import { s3, BUCKET } from "../lib/s3";
import { indirizzoMedia } from "../lib/media-url";
import { creaCopia } from "../lib/copie-sicurezza";
import { analizzaUrl, recuperaInfo } from "../lib/canali-tematici";
import { SEZIONI_CHANNEL } from "../data/channel-registro";
import {
  FISSI_HOME0,
  RIPETIZIONI,
  SCHEDE_LAVORO,
  STATI,
  catalogoPubblico,
  esisteSlug,
  istante,
  leggiCanali,
  leggiCaroselli,
  leggiCollocazioni,
  leggiErrori,
  leggiHomes,
  leggiPlaylist,
  leggiSchede,
  layoutHome0,
  nuovoId,
  percorsoHome,
  playlistPubblica,
  registraErrore,
  risolviCanali,
  salvaCanali,
  salvaCarosello,
  salvaCollocazioni,
  salvaHomes,
  salvaPlaylist,
  salvaSchede,
  statoProgramma,
  svuotaErrori,
  vocePerAnteprima,
  vociPubbliche,
  type Collocazione,
  type Home,
  type LayoutHome,
  type Playlist,
  type Scheda,
} from "../lib/cms";

/**
 * GESTIONE CONTENUTI E PALINSESTO (28/10/2026) — il pannello Super Admin senza codice da scrivere.
 *   · `contenuti`       letture pubbliche: Home pubblicate, caroselli, playlist, pagine, barra lavoro;
 *   · `contenutiAdmin`  tutto il resto, solo con il codice di allestimento.
 * I dati stanno in `settings` con chiavi CONDIVISE (vedi lib/cms.ts): anteprima e www vedono gli
 * stessi dati, riavvii e Publish non li toccano. Prima di ogni rimozione si fa una copia di sicurezza.
 */

function controlla(codice: string) {
  const atteso = (process.env.TBH_CODICE_ALLESTIMENTO ?? "").trim();
  if (!atteso) throw new ORPCError("SERVICE_UNAVAILABLE", { message: "Codice di allestimento non configurato sul server." });
  if (codice.trim() !== atteso) throw new ORPCError("UNAUTHORIZED", { message: "Codice di allestimento errato." });
}
const codiceValido = (c?: string | null) => {
  const atteso = (process.env.TBH_CODICE_ALLESTIMENTO ?? "").trim();
  return !!atteso && (c ?? "").trim() === atteso;
};
const no = (message: string) => new ORPCError("BAD_REQUEST", { message });
const CODICE = z.object({ codice: z.string() });
const SLUG = z.string().regex(/^[a-z0-9][a-z0-9-]{0,48}$/, "Slug: solo minuscole, numeri e trattini.");
const DATA_ORA = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/, "Data e ora nel formato AAAA-MM-GGThh:mm.")
  .nullable();
const ORA = z
  .string()
  .regex(/^\d{2}:\d{2}$/)
  .nullable();

const slugDa = (t: string) =>
  t
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48) || "voce";

/* ── caricamento file: limiti VISIBILI nel pannello ───────────────────────── */

export const LIMITI_FILE = {
  immagine: { formati: ["jpg", "jpeg", "png", "webp", "gif", "avif"], mime: /^image\/(jpeg|png|webp|gif|avif)$/, maxMb: 10 },
  video: { formati: ["mp4", "webm"], mime: /^video\/(mp4|webm)$/, maxMb: 200 },
} as const;
const CARTELLA = "allestimento/cms/";
const PREFISSO_FILE = indirizzoMedia(CARTELLA);
const chiaveDaUrl = (url: string) => (url.startsWith(PREFISSO_FILE) ? decodeURIComponent(url.slice("/api/media/".length)) : null);

async function fileReale(url: string, tipo: keyof typeof LIMITI_FILE) {
  const chiave = chiaveDaUrl(url);
  if (!chiave) throw no("Il file non risulta caricato nell'archivio TBH: incollarlo come URL esterno oppure ricaricarlo.");
  try {
    const h = await s3.send(new HeadObjectCommand({ Bucket: BUCKET, Key: chiave }));
    const peso = h.ContentLength ?? 0;
    if (peso > LIMITI_FILE[tipo].maxMb * 1024 * 1024) throw no(`File oltre il limite di ${LIMITI_FILE[tipo].maxMb} MB.`);
    return { peso, tipoMime: h.ContentType ?? "" };
  } catch (e) {
    if (e instanceof ORPCError) throw e;
    throw no("Il file non è nell'archivio: il caricamento non è andato a buon fine, ricaricarlo.");
  }
}

/* ── analisi di un URL incollato: piattaforma, titolo, copertina, durata, incorporamento ── */

async function analizza(url: string) {
  const a = analizzaUrl(url);
  if (!a) return { valido: false as const, messaggio: "Indirizzo non valido: deve iniziare con https:// ed essere completo." };
  const info = await recuperaInfo(a);
  const video = a.piattaforma !== "pagina";
  return {
    valido: true as const,
    piattaforma: a.piattaforma,
    embedId: a.embedId,
    url: a.url,
    video,
    titolo: info.titolo,
    autore: info.autore,
    copertina: info.miniatura ?? (a.piattaforma === "youtube" && a.embedId ? `https://i.ytimg.com/vi/${a.embedId}/hqdefault.jpg` : null),
    durataSec: info.durataSec,
    durataDa: info.durataDa,
    esito: info.esito,
    messaggio: info.messaggio,
    incorporabile: video && info.esito !== "errore",
    /** Se il video non si può incorporare: link alla fonte, mai un «caricato». */
    linkFonte: a.url,
    videoIncorporati: info.videoIncorporati,
  };
}

/* ── schede ───────────────────────────────────────────────────────────────── */

const SchedaIn = z.object({
  id: z.string().max(60).optional(),
  titolo: z.string().trim().max(200),
  descrizione: z.string().trim().max(3000).default(""),
  fonte: z.string().trim().max(200).default(""),
  pulsante: z.string().trim().max(40).default(""),
  video: z.object({ url: z.string().trim().max(1000), caricato: z.boolean(), nomeFile: z.string().max(200).nullish() }).nullable(),
  immagine: z.object({ url: z.string().trim().max(1000), caricato: z.boolean(), nomeFile: z.string().max(200).nullish() }).nullable(),
  destinazione: z.string().trim().max(1000).nullable(),
  durataSec: z.number().int().min(1).max(24 * 3600).nullable(),
  durataDa: z.enum(["fonte", "pagina", "ricerca", "manuale"]).nullable(),
});

async function preparaScheda(input: z.infer<typeof SchedaIn>, prima: Scheda | undefined): Promise<Scheda> {
  if (!input.titolo) throw no("Il titolo è obbligatorio: senza titolo la scheda non si salva.");
  const ora = Date.now();
  let video: Scheda["video"] = null;
  let verifica: Scheda["verifica"] = prima?.verifica ?? null;
  if (input.video?.url) {
    if (input.video.caricato) {
      const f = await fileReale(input.video.url, "video");
      if (!/^video\//.test(f.tipoMime)) throw no("Il file caricato non è un video MP4/WEBM.");
      video = { url: input.video.url, piattaforma: "video", embedId: null, caricato: true, nomeFile: input.video.nomeFile ?? null, peso: f.peso };
      verifica = { quando: ora, esito: "ok", messaggio: "File caricato nell'archivio TBH: si riproduce con il player del sito." };
    } else {
      const a = analizzaUrl(input.video.url);
      if (!a) throw no("URL video non valido.");
      if (a.piattaforma === "pagina") throw no("L'URL video non è un video (YouTube, Vimeo, Dailymotion o file .mp4/.webm): usarlo come «URL destinazione».");
      video = { url: a.url, piattaforma: a.piattaforma, embedId: a.embedId, caricato: false, nomeFile: null, peso: null };
      if (!prima?.video || prima.video.url !== a.url || !verifica) {
        const info = await recuperaInfo(a);
        verifica = { quando: info.quando, esito: info.esito, messaggio: info.messaggio };
      }
    }
  } else verifica = null;
  let immagine: Scheda["immagine"] = null;
  if (input.immagine?.url) {
    if (input.immagine.caricato) {
      const f = await fileReale(input.immagine.url, "immagine");
      immagine = { url: input.immagine.url, caricato: true, nomeFile: input.immagine.nomeFile ?? null, peso: f.peso };
    } else {
      if (!/^https:\/\//.test(input.immagine.url)) throw no("URL immagine: serve un indirizzo https:// completo.");
      immagine = { url: input.immagine.url, caricato: false, nomeFile: null, peso: null };
    }
  }
  const dest = input.destinazione?.trim() || null;
  if (dest && !/^https?:\/\//.test(dest) && !dest.startsWith("/")) throw no("URL destinazione: indirizzo https:// oppure percorso interno che inizia con «/».");
  return {
    id: prima?.id ?? nuovoId("scheda"),
    titolo: input.titolo,
    descrizione: input.descrizione,
    fonte: input.fonte,
    pulsante: input.pulsante,
    video,
    immagine,
    destinazione: dest,
    durataSec: input.durataSec,
    durataDa: input.durataSec ? (input.durataDa ?? "manuale") : null,
    verifica,
    stato: prima?.stato ?? "bozza",
    creato: prima?.creato ?? ora,
    aggiornato: ora,
    pubblicato: prima?.pubblicato ?? null,
  };
}

function controllaPubblicabile(s: Scheda) {
  if (!s.video && !s.immagine && !s.destinazione) throw no("Per pubblicare serve almeno un video, un'immagine o un URL di destinazione.");
}

/* ── collocazioni ─────────────────────────────────────────────────────────── */

const CollocazioneIn = z.object({
  id: z.string().max(60).optional(),
  schedaId: z.string().max(60),
  home: z.string().max(50).nullable(),
  channel: z.string().max(60).nullable(),
  carosello: z.string().max(60).nullable(),
  playlist: z.string().max(60).nullable(),
  passaggi: z.number().int().min(1).max(20).default(1),
  inizio: DATA_ORA,
  fine: DATA_ORA,
  ripetizione: z.object({ tipo: z.enum(RIPETIZIONI), giorni: z.array(z.number().int().min(1).max(7)).max(7), dalle: ORA, alle: ORA }),
  stato: z.enum(["attivo", "sospeso"]),
});

const contenitore = (c: Pick<Collocazione, "home" | "channel" | "carosello" | "playlist">) => `${c.home ?? "*"}|${c.channel ?? ""}|${c.carosello ?? ""}|${c.playlist ?? ""}`;

/* ── Home ─────────────────────────────────────────────────────────────────── */

const LayoutIn = z.object({
  blocchi: z
    .array(z.object({ id: z.string().max(40), titolo: z.string().trim().max(120), channel: z.array(z.string().max(60)).max(200), carosello: z.string().max(60).nullable() }))
    .max(60),
  palinsesti: z.array(z.string().max(60)).max(30),
});

async function validaLayout(l: LayoutHome) {
  const [canali, caroselli, playlist] = await Promise.all([leggiCanali(), leggiCaroselli(), leggiPlaylist()]);
  const slugs = new Set(risolviCanali(canali).map((c) => c.slug));
  for (const b of l.blocchi) {
    for (const s of b.channel) if (!slugs.has(s)) throw no(`Channel «${s}» inesistente.`);
    if (b.carosello && !caroselli.some((k) => k.id === b.carosello)) throw no(`Carosello «${b.carosello}» inesistente.`);
  }
  for (const p of l.palinsesti) if (!playlist.some((x) => x.id === p)) throw no(`Playlist «${p}» inesistente.`);
}

/* ── letture pubbliche ────────────────────────────────────────────────────── */

const ultimeSegnalazioni = new Map<string, number>();

async function vociCarosello(id: string, home: string | null) {
  return vociPubbliche((c) => c.carosello === id && (c.home === null || c.home === home));
}

async function homeRisolta(slug: string, anteprima: boolean) {
  const homes = await leggiHomes();
  const h = homes.find((x) => x.slug === slug);
  if (!h) return null;
  const layout = slug === "0" ? { ...layoutHome0(), palinsesti: (anteprima ? h.bozza : (h.pubblicata ?? h.bozza)).palinsesti } : anteprima ? h.bozza : h.pubblicata;
  if (!anteprima && (h.stato !== "attivo" || !layout)) return { home: { slug: h.slug, nome: h.nome, stato: h.stato }, pubblicata: false as const };
  const l = layout!;
  const [canali, caroselli] = await Promise.all([leggiCanali(), leggiCaroselli()]);
  const perSlug = new Map(risolviCanali(canali).map((c) => [c.slug, c]));
  const blocchi = await Promise.all(
    l.blocchi.map(async (b) => {
      const k = b.carosello ? caroselli.find((x) => x.id === b.carosello && (anteprima || x.stato === "attivo")) : null;
      return {
        id: b.id,
        titolo: b.titolo,
        channel: b.channel.map((s) => perSlug.get(s)).filter((c): c is NonNullable<typeof c> => !!c && (anteprima || c.attivo)),
        carosello: k ? { id: k.id, nome: k.nome, accento: k.accento, voci: await vociCarosello(k.id, slug) } : null,
      };
    }),
  );
  const palinsesti = (await Promise.all(l.palinsesti.map((p) => playlistPubblica(p)))).filter((p): p is NonNullable<typeof p> => !!p);
  return { home: { slug: h.slug, nome: h.nome, stato: h.stato, percorso: percorsoHome(h.slug), pubblicataIl: h.pubblicataIl }, pubblicata: true as const, anteprima, blocchi, palinsesti };
}

export const contenuti = {
  catalogo: base.handler(async () => catalogoPubblico()),

  home: base.input(z.object({ slug: z.string().max(50), codice: z.string().optional(), anteprima: z.boolean().default(false) })).handler(async ({ input }) => {
    const anteprima = input.anteprima && codiceValido(input.codice);
    return (await homeRisolta(input.slug, anteprima)) ?? { home: null, pubblicata: false as const };
  }),

  carosello: base.input(z.object({ id: z.string().max(60), home: z.string().max(50).nullable().default(null) })).handler(async ({ input }) => ({
    id: input.id,
    voci: await vociCarosello(input.id, input.home),
  })),

  /** Barra CERCO / OFFRO LAVORO: una scheda per fonte, ciascuna con le sue voci attive o il motivo dell'attesa. */
  lavoro: base.input(z.object({ home: z.string().max(50).default("0") })).handler(async ({ input }) => ({
    schede: await Promise.all(
      SCHEDE_LAVORO.map(async (s) => ({ id: s.id, nome: s.nome, fonte: s.fonte, attesa: s.attesa, voci: await vociCarosello(s.id, input.home) })),
    ),
  })),

  playlist: base.input(z.object({ id: z.string().max(60) })).handler(async ({ input }) => ({ playlist: await playlistPubblica(input.id) })),

  /** Channel o pagina aggiunti dal pannello (URL /pagina/<slug> o /channel/scheda/<slug>) + contenuti collocati sul Channel. */
  pagina: base.input(z.object({ slug: z.string().max(60), codice: z.string().optional() })).handler(async ({ input }) => {
    const canali = await leggiCanali();
    const r = risolviCanali(canali).find((c) => c.slug === input.slug);
    const voci = await vociPubbliche((c) => c.channel === input.slug);
    if (!r) return { pagina: null, voci: [] };
    const visibile = r.attivo || codiceValido(input.codice);
    return { pagina: visibile ? r : null, sospesa: !visibile, voci: visibile ? voci : [] };
  }),

  segnalaErrore: base
    .input(z.object({ schedaId: z.string().max(60), codice: z.string().max(40), messaggio: z.string().max(300), dove: z.string().max(120) }))
    .handler(async ({ input }) => {
      const k = `${input.schedaId}:${input.codice}`;
      const ora = Date.now();
      if (ora - (ultimeSegnalazioni.get(k) ?? 0) < 60_000) return { ok: true, registrato: false };
      ultimeSegnalazioni.set(k, ora);
      const s = (await leggiSchede()).find((x) => x.id === input.schedaId);
      if (!s) return { ok: false, registrato: false };
      await registraErrore({ quando: ora, schedaId: s.id, titolo: s.titolo, codice: input.codice, messaggio: input.messaggio, dove: input.dove });
      return { ok: true, registrato: true };
    }),
};

/* ── amministrazione ──────────────────────────────────────────────────────── */

async function quadro() {
  const adesso = Date.now();
  const [schede, coll, playlist, caroselli, homes, canali, errori] = await Promise.all([
    leggiSchede(),
    leggiCollocazioni(),
    leggiPlaylist(),
    leggiCaroselli(),
    leggiHomes(),
    leggiCanali(),
    leggiErrori(),
  ]);
  return {
    ambiente: AMBIENTE,
    adesso,
    limiti: { immagine: { formati: LIMITI_FILE.immagine.formati, maxMb: LIMITI_FILE.immagine.maxMb }, video: { formati: LIMITI_FILE.video.formati, maxMb: LIMITI_FILE.video.maxMb } },
    schede: [...schede].sort((a, b) => b.aggiornato - a.aggiornato),
    collocazioni: coll.map((c) => ({ ...c, programma: statoProgramma(c, adesso) })),
    playlist,
    caroselli,
    homes: homes.map((h) => ({ ...h, percorso: percorsoHome(h.slug) })),
    canali: risolviCanali(canali).map((c) => ({ ...c, fisso: FISSI_HOME0.has(c.slug) })),
    sezioni: SEZIONI_CHANNEL.map((s) => ({ id: s.id, titolo: s.titolo })),
    errori: errori.slice(0, 50),
  };
}

export const contenutiAdmin = {
  quadro: base.input(CODICE).handler(async ({ input }) => {
    controlla(input.codice);
    return quadro();
  }),

  analizza: base.input(CODICE.extend({ url: z.string().trim().min(4).max(1000) })).handler(async ({ input }) => {
    controlla(input.codice);
    return analizza(input.url);
  }),

  /** Anteprima: la scheda come la vedrà il pubblico, SENZA salvarla. */
  anteprima: base.input(CODICE.extend({ scheda: SchedaIn })).handler(async ({ input }) => {
    controlla(input.codice);
    const prima = input.scheda.id ? (await leggiSchede()).find((s) => s.id === input.scheda.id) : undefined;
    const s = await preparaScheda(input.scheda, prima);
    return { voce: vocePerAnteprima(s), verifica: s.verifica };
  }),

  /** Passo 1 del caricamento: indirizzo firmato (15 minuti) per mandare il file all'archivio TBH. */
  presign: base
    .input(CODICE.extend({ tipo: z.enum(["immagine", "video"]), filename: z.string().max(200), contentType: z.string().max(100), peso: z.number().int().min(1) }))
    .handler(async ({ input }) => {
      controlla(input.codice);
      const L = LIMITI_FILE[input.tipo];
      const ext = (/\.([a-z0-9]+)$/i.exec(input.filename)?.[1] ?? "").toLowerCase();
      if (!(L.formati as readonly string[]).includes(ext) || !L.mime.test(input.contentType.toLowerCase()))
        throw no(`Formato non ammesso: ${input.tipo} solo ${L.formati.join(", ").toUpperCase()}.`);
      if (input.peso > L.maxMb * 1024 * 1024) throw no(`File di ${(input.peso / 1048576).toFixed(1)} MB: il limite è ${L.maxMb} MB.`);
      const chiave = `${CARTELLA}${input.tipo}/${Date.now()}-${input.filename.replace(/[^a-zA-Z0-9._-]+/g, "-").slice(-80)}`;
      const url = await getSignedUrl(s3, new PutObjectCommand({ Bucket: BUCKET, Key: chiave, ContentType: input.contentType }), { expiresIn: 900 });
      return { url, chiave };
    }),

  /** Passo 2: il server controlla che il file sia DAVVERO nell'archivio (e nei limiti) prima di dirlo «caricato». */
  conferma: base.input(CODICE.extend({ tipo: z.enum(["immagine", "video"]), chiave: z.string().max(300) })).handler(async ({ input }) => {
    controlla(input.codice);
    if (!input.chiave.startsWith(`${CARTELLA}${input.tipo}/`) || input.chiave.includes("..")) throw no("Chiave del file non valida.");
    const url = indirizzoMedia(input.chiave);
    try {
      const f = await fileReale(url, input.tipo);
      return { url, peso: f.peso, tipoMime: f.tipoMime, caricato: true as const };
    } catch (e) {
      await s3.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: input.chiave })).catch(() => null);
      throw e;
    }
  }),

  /** Salva bozza · Pubblica · Sospendi. Una scheda si salva UNA volta e si colloca dove serve. */
  salvaScheda: base.input(CODICE.extend({ scheda: SchedaIn, azione: z.enum(["bozza", "pubblica"]) })).handler(async ({ input }) => {
    controlla(input.codice);
    const schede = await leggiSchede();
    const i = input.scheda.id ? schede.findIndex((s) => s.id === input.scheda.id) : -1;
    if (input.scheda.id && i < 0) throw no("Scheda non trovata: ricaricare il pannello.");
    const s = await preparaScheda(input.scheda, schede[i]);
    if (input.azione === "pubblica") {
      controllaPubblicabile(s);
      s.stato = "attivo";
      s.pubblicato = Date.now();
    }
    if (i >= 0) schede[i] = s;
    else schede.unshift(s);
    await salvaSchede(schede);
    const coll = (await leggiCollocazioni()).filter((c) => c.schedaId === s.id && c.stato === "attivo");
    const avviso =
      s.video && s.verifica?.esito === "errore"
        ? ` Attenzione: ${s.verifica.messaggio} Sul sito comparirà come link alla fonte, non nel player.`
        : "";
    return {
      scheda: s,
      esito:
        input.azione === "pubblica"
          ? coll.length
            ? `Pubblicata: visibile ora in ${coll.length} posizion${coll.length === 1 ? "e" : "i"} (dove la programmazione è in onda).${avviso}`
            : `Pubblicata, ma non è ancora collocata: aggiungere una posizione (Home, Channel, carosello o playlist).${avviso}`
          : s.stato === "attivo"
            ? `Modifiche salvate sulla scheda già pubblica: sono subito online.${avviso}`
            : `Bozza salvata: non è visibile al pubblico.${avviso}`,
    };
  }),

  statoScheda: base.input(CODICE.extend({ id: z.string().max(60), stato: z.enum(STATI) })).handler(async ({ input }) => {
    controlla(input.codice);
    const schede = await leggiSchede();
    const s = schede.find((x) => x.id === input.id);
    if (!s) throw no("Scheda non trovata.");
    if (input.stato === "attivo") {
      controllaPubblicabile(s);
      s.pubblicato = Date.now();
    }
    s.stato = input.stato;
    s.aggiornato = Date.now();
    await salvaSchede(schede);
    return { esito: input.stato === "attivo" ? "Pubblicata." : input.stato === "sospeso" ? "Sospesa: non più visibile al pubblico, dati conservati." : "Riportata in bozza: non visibile al pubblico." };
  }),

  /** Rimuove la scheda e le sue posizioni, DOPO una copia di sicurezza ripristinabile. */
  eliminaScheda: base.input(CODICE.extend({ id: z.string().max(60) })).handler(async ({ input }) => {
    controlla(input.codice);
    const schede = await leggiSchede();
    const s = schede.find((x) => x.id === input.id);
    if (!s) throw no("Scheda non trovata.");
    const copia = await creaCopia(`Prima di rimuovere la scheda «${s.titolo}»`);
    await salvaSchede(schede.filter((x) => x.id !== input.id));
    const coll = await leggiCollocazioni();
    await salvaCollocazioni(coll.filter((c) => c.schedaId !== input.id));
    return { esito: `Scheda rimossa con ${coll.filter((c) => c.schedaId === input.id).length} posizioni. Ripristinabile dalla copia ${copia.id}.`, copia: copia.id };
  }),

  salvaCollocazione: base.input(CODICE.extend({ collocazione: CollocazioneIn })).handler(async ({ input }) => {
    controlla(input.codice);
    const c = input.collocazione;
    if (!c.channel && !c.carosello && !c.playlist) throw no("Scegliere almeno un Channel, un carosello o una playlist.");
    const [schede, coll, playlist, caroselli, canali, homes] = await Promise.all([leggiSchede(), leggiCollocazioni(), leggiPlaylist(), leggiCaroselli(), leggiCanali(), leggiHomes()]);
    if (!schede.some((s) => s.id === c.schedaId)) throw no("Scheda inesistente.");
    if (c.home && !homes.some((h) => h.slug === c.home)) throw no("Home inesistente.");
    if (c.playlist && !playlist.some((p) => p.id === c.playlist)) throw no("Playlist inesistente.");
    if (c.carosello && !caroselli.some((k) => k.id === c.carosello)) throw no("Carosello inesistente.");
    if (c.channel && !esisteSlug(c.channel, canali)) throw no("Channel inesistente.");
    const da = istante(c.inizio);
    const a = istante(c.fine);
    if (da !== null && a !== null && a <= da) throw no("La fine deve essere dopo l'inizio.");
    if (c.ripetizione.tipo !== "sempre" && (!c.ripetizione.dalle) !== (!c.ripetizione.alle)) throw no("Fascia oraria: indicare sia «dalle» sia «alle».");
    if (c.ripetizione.tipo === "settimanale" && !c.ripetizione.giorni.length) throw no("Ripetizione settimanale: scegliere almeno un giorno.");
    const chiave = contenitore(c);
    const doppio = coll.find((x) => x.id !== c.id && x.schedaId === c.schedaId && contenitore(x) === chiave);
    if (doppio) throw no("La scheda è già in questa posizione: modificare quella esistente (nessun doppione).");
    const i = c.id ? coll.findIndex((x) => x.id === c.id) : -1;
    const stessi = coll.filter((x) => contenitore(x) === chiave);
    const nuova: Collocazione = {
      ...c,
      id: i >= 0 ? coll[i]!.id : nuovoId("pos"),
      ripetizione: { ...c.ripetizione, giorni: [...new Set(c.ripetizione.giorni)].sort() },
      posizione: i >= 0 && contenitore(coll[i]!) === chiave ? coll[i]!.posizione : Math.max(0, ...stessi.map((x) => x.posizione)) + 10,
      aggiornato: Date.now(),
    };
    if (i >= 0) coll[i] = nuova;
    else coll.push(nuova);
    await salvaCollocazioni(coll);
    const s = schede.find((x) => x.id === c.schedaId)!;
    const p = statoProgramma(nuova, Date.now());
    return {
      collocazione: nuova,
      esito:
        s.stato !== "attivo"
          ? "Posizione salvata. La scheda è in bozza/sospesa: comparirà solo dopo «Pubblica»."
          : p === "in-onda"
            ? "Posizione salvata: in onda ora."
            : `Posizione salvata: ${p === "programmato" ? "partirà alla data di inizio" : p === "scaduto" ? "già scaduta" : p === "sospeso" ? "sospesa" : "fuori dalla fascia oraria in questo momento"}.`,
    };
  }),

  eliminaCollocazione: base.input(CODICE.extend({ id: z.string().max(60) })).handler(async ({ input }) => {
    controlla(input.codice);
    const coll = await leggiCollocazioni();
    if (!coll.some((c) => c.id === input.id)) throw no("Posizione non trovata.");
    await salvaCollocazioni(coll.filter((c) => c.id !== input.id));
    return { esito: "Posizione rimossa: la scheda resta salvata." };
  }),

  /** Riordino di un contenitore (carosello, playlist, Channel): l'ordine degli id è il nuovo ordine. */
  ordinaCollocazioni: base.input(CODICE.extend({ ids: z.array(z.string().max(60)).min(1).max(500) })).handler(async ({ input }) => {
    controlla(input.codice);
    const coll = await leggiCollocazioni();
    input.ids.forEach((id, n) => {
      const c = coll.find((x) => x.id === id);
      if (c) c.posizione = (n + 1) * 10;
    });
    await salvaCollocazioni(coll);
    return { esito: "Ordine salvato." };
  }),

  salvaPlaylist: base
    .input(
      CODICE.extend({
        id: z.string().max(60).optional(),
        nome: z.string().trim().min(2).max(120),
        modalita: z.enum(["play", "diretta"]),
        ciclo: z.boolean(),
        ancora: DATA_ORA,
        stato: z.enum(STATI),
      }),
    )
    .handler(async ({ input }) => {
      controlla(input.codice);
      const l = await leggiPlaylist();
      const i = input.id ? l.findIndex((p) => p.id === input.id) : -1;
      const p: Playlist = {
        id: i >= 0 ? l[i]!.id : nuovoId("playlist"),
        nome: input.nome,
        modalita: input.modalita,
        ciclo: input.ciclo,
        ancora: istante(input.ancora) ?? (i >= 0 ? l[i]!.ancora : Date.now()),
        stato: input.stato,
        aggiornato: Date.now(),
      };
      if (i >= 0) l[i] = p;
      else l.push(p);
      await salvaPlaylist(l);
      return { playlist: p, esito: p.stato === "attivo" ? "Playlist salvata e attiva." : "Playlist salvata (non visibile finché non è attiva)." };
    }),

  eliminaPlaylist: base.input(CODICE.extend({ id: z.string().max(60) })).handler(async ({ input }) => {
    controlla(input.codice);
    const coll = await leggiCollocazioni();
    const n = coll.filter((c) => c.playlist === input.id).length;
    if (n) throw no(`La playlist ha ${n} contenuti: rimuoverli o sospendere la playlist.`);
    const homes = await leggiHomes();
    if (homes.some((h) => h.bozza.palinsesti.includes(input.id) || h.pubblicata?.palinsesti.includes(input.id))) throw no("La playlist è usata in una Home: toglierla prima dalla Home.");
    await salvaPlaylist((await leggiPlaylist()).filter((p) => p.id !== input.id));
    return { esito: "Playlist rimossa." };
  }),

  salvaCarosello: base
    .input(CODICE.extend({ id: z.string().max(60).optional(), nome: z.string().trim().min(2).max(120), accento: z.enum(["giallo", "rosso-dm"]), stato: z.enum(STATI) }))
    .handler(async ({ input }) => {
      controlla(input.codice);
      const tutti = await leggiCaroselli();
      const prima = input.id ? tutti.find((k) => k.id === input.id) : undefined;
      if (input.id && !prima) throw no("Carosello non trovato.");
      let id = prima?.id ?? `k-${slugDa(input.nome)}`;
      while (!prima && tutti.some((k) => k.id === id)) id = `${id}-2`;
      await salvaCarosello({ id, nome: input.nome, accento: input.accento, stato: input.stato, predefinito: prima?.predefinito ?? false, nota: prima?.nota ?? null });
      return { id, esito: "Carosello salvato." };
    }),

  salvaHome: base
    .input(CODICE.extend({ slug: z.string().max(50).optional(), nome: z.string().trim().min(2).max(80), bozza: LayoutIn.optional() }))
    .handler(async ({ input }) => {
      controlla(input.codice);
      const homes = await leggiHomes();
      const i = input.slug ? homes.findIndex((h) => h.slug === input.slug) : -1;
      if (input.slug && i < 0) throw no("Home non trovata.");
      let bozza = input.bozza ?? (i >= 0 ? homes[i]!.bozza : { blocchi: [], palinsesti: [] });
      if (i >= 0 && homes[i]!.slug === "0") bozza = { ...layoutHome0(), palinsesti: bozza.palinsesti };
      await validaLayout(bozza);
      if (i >= 0) homes[i] = { ...homes[i]!, nome: homes[i]!.slug === "0" ? homes[i]!.nome : input.nome, bozza, aggiornato: Date.now() };
      else {
        let slug = slugDa(input.nome.replace(/\./g, "-"));
        while (homes.some((h) => h.slug === slug)) slug = `${slug}-2`;
        const nuova: Home = { slug, nome: input.nome, ordine: Math.max(0, ...homes.map((h) => h.ordine)) + 10, stato: "bozza", bozza, pubblicata: null, aggiornato: Date.now(), pubblicataIl: null };
        homes.push(nuova);
      }
      await salvaHomes(homes);
      const h = i >= 0 ? homes[i]! : homes[homes.length - 1]!;
      return { slug: h.slug, percorso: percorsoHome(h.slug), esito: h.stato === "attivo" ? "Bozza della Home salvata: la versione pubblica resta quella di prima finché non premi «Pubblica»." : "Home salvata in bozza: non è visibile al pubblico." };
    }),

  pubblicaHome: base.input(CODICE.extend({ slug: z.string().max(50) })).handler(async ({ input }) => {
    controlla(input.codice);
    const homes = await leggiHomes();
    const h = homes.find((x) => x.slug === input.slug);
    if (!h) throw no("Home non trovata.");
    if (h.slug !== "0" && !h.bozza.blocchi.some((b) => b.channel.length || b.carosello) && !h.bozza.palinsesti.length) throw no("La Home è vuota: aggiungere almeno un blocco con Channel, un carosello o una playlist.");
    await validaLayout(h.bozza);
    h.pubblicata = structuredClone(h.bozza);
    h.stato = "attivo";
    h.pubblicataIl = Date.now();
    await salvaHomes(homes);
    /* palinsesti collegati ma non attivi: la Home è pubblica, quelle playlist no — lo si dice subito */
    const elencoPl = await leggiPlaylist();
    const ferme = h.pubblicata.palinsesti.map((id) => elencoPl.find((p) => p.id === id)).filter((p) => p && p.stato !== "attivo");
    const nota = ferme.length ? ` Attenzione: ${ferme.map((p) => `«${p!.nome}» (${p!.stato})`).join(", ")} non ${ferme.length === 1 ? "è attiva e non compare" : "sono attive e non compaiono"} finché non la si mette «Attiva» nel Palinsesto.` : "";
    return { percorso: percorsoHome(h.slug), esito: `Home pubblicata su ${percorsoHome(h.slug)}.${nota}` };
  }),

  statoHome: base.input(CODICE.extend({ slug: z.string().max(50), stato: z.enum(["sospeso", "attivo"]) })).handler(async ({ input }) => {
    controlla(input.codice);
    if (input.slug === "0") throw no("Home 0 resta sempre attiva.");
    const homes = await leggiHomes();
    const h = homes.find((x) => x.slug === input.slug);
    if (!h) throw no("Home non trovata.");
    if (input.stato === "attivo" && !h.pubblicata) throw no("La Home non è mai stata pubblicata: usare «Pubblica».");
    h.stato = input.stato;
    await salvaHomes(homes);
    return { esito: input.stato === "sospeso" ? "Home sospesa: non visibile al pubblico, dati conservati." : "Home riattivata." };
  }),

  /** Rimuove una Home aggiunta dal pannello, DOPO una copia di sicurezza. Home 0, 2.0 e 3.0 restano. */
  eliminaHome: base.input(CODICE.extend({ slug: z.string().max(50) })).handler(async ({ input }) => {
    controlla(input.codice);
    if (["0", "2-0", "3-0"].includes(input.slug)) throw no("Home 0, Home 2.0 e Home 3.0 non si rimuovono: si possono solo sospendere.");
    const homes = await leggiHomes();
    const h = homes.find((x) => x.slug === input.slug);
    if (!h) throw no("Home non trovata.");
    const copia = await creaCopia(`Prima di rimuovere la Home «${h.nome}»`);
    await salvaHomes(homes.filter((x) => x.slug !== input.slug));
    const coll = await leggiCollocazioni();
    const n = coll.filter((c) => c.home === input.slug).length;
    if (n) await salvaCollocazioni(coll.filter((c) => c.home !== input.slug));
    return { esito: `Home rimossa${n ? ` con ${n} posizioni` : ""}. Ripristinabile dalla copia ${copia.id}.`, copia: copia.id };
  }),

  ordinaHomes: base.input(CODICE.extend({ slugs: z.array(z.string().max(50)).min(1).max(200) })).handler(async ({ input }) => {
    controlla(input.codice);
    const homes = await leggiHomes();
    input.slugs.forEach((s, n) => {
      const h = homes.find((x) => x.slug === s);
      if (h && h.slug !== "0") h.ordine = (n + 1) * 10;
    });
    await salvaHomes(homes);
    return { esito: "Ordine delle Home salvato (Home 0 resta la prima)." };
  }),

  /** Nuovo Channel o pagina (o modifica di uno aggiunto). Gli slug del registro non si toccano. */
  salvaCanale: base
    .input(
      CODICE.extend({
        slug: SLUG,
        nuovo: z.boolean(),
        nome: z.string().trim().min(2).max(120),
        tipo: z.enum(["channel", "pagina"]),
        sezione: z.enum(["home-tbh", "dm", "nova", "best", "altri"]),
        url: z.string().trim().max(500).nullable(),
        logo: z.string().trim().max(500).nullable(),
        descrizione: z.string().trim().max(2000).default(""),
        stato: z.enum(STATI),
      }),
    )
    .handler(async ({ input }) => {
      controlla(input.codice);
      const c = await leggiCanali();
      const i = c.extra.findIndex((e) => e.slug === input.slug);
      if (input.nuovo && esisteSlug(input.slug, c)) throw no(`Lo slug «${input.slug}» esiste già: ogni attività ha una sola scheda e un solo URL.`);
      if (!input.nuovo && i < 0) throw no("Si modificano qui solo i Channel e le pagine aggiunti dal pannello.");
      if (input.url && !/^https:\/\//.test(input.url) && !input.url.startsWith("/")) throw no("URL: https:// oppure percorso interno «/…».");
      const ordine = i >= 0 ? c.extra[i]!.ordine : 10_000 + c.extra.length * 10;
      const e = { slug: input.slug, nome: input.nome, tipo: input.tipo, sezione: input.sezione, url: input.url || null, logo: input.logo || null, descrizione: input.descrizione, stato: input.stato, ordine, creato: i >= 0 ? c.extra[i]!.creato : Date.now() };
      if (i >= 0) c.extra[i] = e;
      else c.extra.push(e);
      await salvaCanali(c);
      const percorso = `/pagina/${input.slug}`;
      return { percorso, esito: `${input.tipo === "pagina" ? "Pagina" : "Channel"} salvat${input.tipo === "pagina" ? "a" : "o"}: ${percorso}${input.stato === "attivo" ? " (attivo)" : " (non visibile al pubblico)"}.` };
    }),

  /**
   * 04/11/2026 (round 18) — AGGIUNGE IN BLOCCO N SPAZI VUOTI in una sezione (1–200 per volta, ripetibile: nessun limite
   * totale). Ogni spazio è un Channel aggiunto «da compilare» (tessera tratteggiata in home, /channel; non in guida,
   * zapping e ricerca finché è vuoto). Con «Modifica» si inseriscono nome, URL, logo: da lì è un Channel normale.
   * Nessun nome o contenuto inventato.
   */
  aggiungiSpazi: base
    .input(CODICE.extend({ sezione: z.enum(["home-tbh", "dm", "nova", "best", "altri"]), quanti: z.number().int().min(1).max(200) }))
    .handler(async ({ input }) => {
      controlla(input.codice);
      const c = await leggiCanali();
      const titolo = SEZIONI_CHANNEL.find((x) => x.id === input.sezione)?.titolo ?? input.sezione;
      const adesso = Date.now();
      let n = 1;
      const nuovi: string[] = [];
      const ordineBase = Math.max(10_000, ...c.extra.map((e) => e.ordine)) + 10;
      while (nuovi.length < input.quanti) {
        const slug = `spazio-${input.sezione}-${n}`;
        n++;
        if (esisteSlug(slug, c)) continue;
        c.extra.push({
          slug,
          nome: `${titolo} · Spazio ${n - 1}`,
          tipo: "channel",
          sezione: input.sezione,
          url: null,
          logo: null,
          descrizione: "Spazio disponibile: nome, URL e logo si inseriscono con «Modifica» in Gestione contenuti › CHANNEL E PAGINE.",
          stato: "attivo",
          ordine: ordineBase + nuovi.length * 10,
          creato: adesso,
          spazio: true,
        });
        nuovi.push(slug);
      }
      await salvaCanali(c);
      const totale = risolviCanali(c).filter((x) => x.sezione === input.sezione).length;
      return { aggiunti: nuovi.length, totaleSezione: totale, esito: `${nuovi.length} spazi aggiunti in ${titolo}: ora la sezione ha ${totale} posizioni (pagine da 15).` };
    }),

  /** 04/11/2026 (round 18) — toglie gli spazi ANCORA VUOTI di una sezione (quelli compilati restano), dopo una copia. */
  rimuoviSpaziVuoti: base.input(CODICE.extend({ sezione: z.enum(["home-tbh", "dm", "nova", "best", "altri"]) })).handler(async ({ input }) => {
    controlla(input.codice);
    const c = await leggiCanali();
    const via = c.extra.filter((e) => e.spazio && e.sezione === input.sezione);
    if (!via.length) return { rimossi: 0, copia: null as string | null, esito: "Nessuno spazio vuoto da togliere in questa sezione." };
    const copia = await creaCopia(`Prima di togliere ${via.length} spazi vuoti (${input.sezione})`);
    c.extra = c.extra.filter((e) => !(e.spazio && e.sezione === input.sezione));
    await salvaCanali(c);
    return { rimossi: via.length, copia: copia.id as string | null, esito: `${via.length} spazi vuoti tolti. Ripristinabili dalla copia ${copia.id}.` };
  }),

  /** Rimuove un Channel o una pagina AGGIUNTI dal pannello (mai quelli del registro), dopo una copia. */
  eliminaCanale: base.input(CODICE.extend({ slug: z.string().max(60) })).handler(async ({ input }) => {
    controlla(input.codice);
    const c = await leggiCanali();
    const e = c.extra.find((x) => x.slug === input.slug);
    if (!e) throw no("Si rimuovono solo i Channel e le pagine aggiunti dal pannello; quelli del registro si possono solo spegnere.");
    const copia = await creaCopia(`Prima di rimuovere «${e.nome}»`);
    c.extra = c.extra.filter((x) => x.slug !== input.slug);
    await salvaCanali(c);
    return { esito: `«${e.nome}» rimosso. Ripristinabile dalla copia ${copia.id}.`, copia: copia.id };
  }),

  /** Channel già nel registro: nome mostrato e attivazione. I 28 ufficiali restano invariati. */
  modificaRegistro: base.input(CODICE.extend({ slug: z.string().max(60), nome: z.string().trim().max(120).optional(), attivo: z.boolean().optional() })).handler(async ({ input }) => {
    controlla(input.codice);
    if (FISSI_HOME0.has(input.slug)) throw no("I 28 Channel ufficiali e Touch Talent di Home 0 restano invariati.");
    const c = await leggiCanali();
    if (c.extra.some((e) => e.slug === input.slug)) throw no("Channel aggiunto dal pannello: usare «Modifica».");
    const m = { ...(c.modifiche[input.slug] ?? {}) };
    if (input.nome !== undefined) m.nome = input.nome || undefined;
    if (input.attivo !== undefined) m.attivo = input.attivo;
    c.modifiche[input.slug] = m;
    await salvaCanali(c);
    return { esito: "Channel aggiornato." };
  }),

  /** Sposta un Channel/pagina di un posto nella sua sezione (scambio con il vicino; i 28 non si spostano). */
  spostaCanale: base.input(CODICE.extend({ slug: z.string().max(60), verso: z.union([z.literal(-1), z.literal(1)]) })).handler(async ({ input }) => {
    controlla(input.codice);
    const c = await leggiCanali();
    const tutti = risolviCanali(c);
    const me = tutti.find((x) => x.slug === input.slug);
    if (!me) throw no("Channel non trovato.");
    if (FISSI_HOME0.has(me.slug)) throw no("I 28 Channel ufficiali non si spostano.");
    const sez = tutti.filter((x) => x.sezione === me.sezione);
    const j = sez.findIndex((x) => x.slug === me.slug) + input.verso;
    const altro = sez[j];
    if (!altro) throw no("È già al limite della sezione.");
    if (FISSI_HOME0.has(altro.slug)) throw no("Il vicino è uno dei 28 Channel ufficiali: non si scavalca.");
    const imposta = (slug: string, ordine: number) => {
      const e = c.extra.find((x) => x.slug === slug);
      if (e) e.ordine = ordine;
      else c.modifiche[slug] = { ...(c.modifiche[slug] ?? {}), ordine };
    };
    const [o1, o2] = me.ordine === altro.ordine ? [altro.ordine + input.verso, me.ordine] : [altro.ordine, me.ordine];
    imposta(me.slug, o1);
    imposta(altro.slug, o2);
    await salvaCanali(c);
    return { esito: "Ordine aggiornato." };
  }),

  svuotaErrori: base.input(CODICE).handler(async ({ input }) => {
    controlla(input.codice);
    await svuotaErrori();
    return { esito: "Registro errori svuotato." };
  }),
};

/** Export con il nome della feature (convenzione dei file di route); il router usa le chiavi sopra. */
export const contenutiPalinsesto = { contenuti, contenutiAdmin };
