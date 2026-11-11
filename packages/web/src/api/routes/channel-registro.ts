import { z } from "zod";
import { ORPCError } from "@orpc/server";
import { eq } from "drizzle-orm";
import { base } from "../__core/app";
import { db } from "../database";
import * as schema from "../database/schema";
import { CAROSELLI_HOME } from "../data/channel-home";
import { CHANNEL_REGISTRO, SEZIONI_CHANNEL, SLUG_REGISTRO, registroPerSlug, type ChannelRegistro } from "../data/channel-registro";
import { mapsDa, schedaBaseChannel, type InfoSchedaChannel } from "../data/channel-schede";
import {
  calcolaStato,
  fasceDi,
  idYouTube,
  quadroChannel,
  sequenzaDi,
  sincronizzaSeServe,
  tutteLeImpostazioni,
  type StatoEffettivo,
  type VoceSequenza,
} from "../lib/channel-palinsesti";
import { FISSI_HOME0, leggiCanali, risolviCanali, salvaCanali, vociPubbliche, type ModificaRegistro, type SchedaRegia, type VocePubblica } from "../lib/cms";
import { dataRoma } from "../lib/radio-palinsesto";
import { AMBIENTE, chiaveAmbito } from "../lib/ambiente";

/**
 * REGISTRO DEI CHANNEL (28/10/2026) — pagina unica a 5 sezioni (/channel) e schede
 * /channel/scheda/<slug>. Pubblico: elenco con lo stato VERO del palinsesto di ognuno.
 * Riservato (codice di allestimento): nome e URL degli SPAZI vuoti (NOVA TV, BEST
 * ENTERTAINMENT, spazi liberi). Nessun dato inventato: uno spazio senza dati resta vuoto.
 * I valori vivono in `settings` con la chiave del proprio ambito (staging ≠ produzione).
 */

const CHIAVE_SPAZI = chiaveAmbito("channel_spazi");

type DatiSpazio = { nome: string; url: string; quando: number };

async function leggiSpazi(): Promise<Record<string, DatiSpazio>> {
  const [r] = await db.select().from(schema.settings).where(eq(schema.settings.key, CHIAVE_SPAZI));
  if (!r) return {};
  try {
    return JSON.parse(r.value) as Record<string, DatiSpazio>;
  } catch {
    return {};
  }
}

function controlla(codice: string) {
  const atteso = (process.env.TBH_CODICE_ALLESTIMENTO ?? "").trim();
  if (!atteso) throw new ORPCError("SERVICE_UNAVAILABLE", { message: "Codice di allestimento non configurato sul server." });
  if (codice.trim() !== atteso) throw new ORPCError("UNAUTHORIZED", { message: "Codice di allestimento errato." });
}

/** https://… oppure una pagina interna /… ; niente altro. */
const URL_SPAZIO = z
  .string()
  .trim()
  .max(1000)
  .refine((u) => u === "" || /^https:\/\/[^\s]+$/.test(u) || /^\/[^\s/][^\s]*$/.test(u), "Serve un indirizzo https://… o una pagina interna /…");

/* ── 28/10/2026 (round 14) — anteprima del palinsesto per le card e il player dei Channel ──────────────
   Unisce, senza inventare nulla: le schede di «Gestione contenuti» collocate sul Channel (chiavi cms_v1
   CONDIVISE: le stesse su anteprima e www) e la playlist del Channel salvata in Regia (/allestimento/channel,
   righe dell'ambito). Nessun contenuto = voci vuote → «Palinsesto in preparazione». */

export type VoceAnteprima = {
  id: string;
  tipo: string;
  titolo: string;
  immagine: string | null;
  youtube: string | null;
  media: string | null;
  link: string | null;
  durataSec: number | null;
  origine: "contenuti" | "regia";
};

const FILE_MEDIA = /\.(mp4|webm|mov|m4v|mp3|m4a|ogg|wav)(\?|#|$)/i;
const FILE_IMMAGINE = /\.(jpe?g|png|webp|gif|avif|apng|jpe)(\?|#|$)/i;
const miniatura = (id: string) => `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;

function daCms(v: VocePubblica): VoceAnteprima {
  const yt = v.video?.piattaforma === "youtube" ? v.video.embedId : null;
  const file = v.video?.piattaforma === "video" ? v.video.url : null;
  return {
    id: `cms-${v.collocazione}`,
    tipo: v.video ? "video" : "immagine",
    titolo: v.titolo,
    immagine: v.immagine,
    youtube: yt,
    media: file,
    link: v.destinazione ?? (v.video && !yt && !file ? v.video.url : null),
    durataSec: v.durataSec,
    origine: "contenuti",
  };
}

function daSequenza(v: VoceSequenza, k: number): VoceAnteprima {
  const src = v.sorgente.trim();
  const yt = v.tipo === "immagine" ? null : idYouTube(src);
  const immagine = v.tipo === "immagine" || FILE_IMMAGINE.test(src) ? src : yt ? miniatura(yt) : null;
  const media = !yt && v.tipo !== "immagine" && FILE_MEDIA.test(src) ? src : null;
  const pagina = !yt && !media && v.tipo !== "immagine" && /^(https:\/\/|\/)/.test(src) ? src : null;
  return {
    id: `reg-${v.id}-${k}`,
    tipo: v.spot ? "spot" : v.tipo,
    titolo: v.titolo,
    immagine,
    youtube: yt,
    media,
    link: v.link ?? pagina,
    durataSec: v.durataSec,
    origine: "regia",
  };
}

/**
 * 29/10/2026 (round 15) — SCHEDA informativa: dati di base verificati (channel-schede.ts) + quanto inserito
 * in Regia (cms_v1:canali → modifiche[slug].scheda), che prevale campo per campo. Il sito per «Apri il Sito»:
 * Regia, altrimenti quello ufficiale di base; mai inventato.
 */
function schedaDi(slug: string, appartenenza: string, m: ModificaRegistro | undefined): InfoSchedaChannel & { daRegia: boolean } {
  const b = schedaBaseChannel(slug, appartenenza);
  const r = m?.scheda;
  if (!r) return { ...b, daRegia: false };
  const indirizzo = r.indirizzo || b.indirizzo;
  return {
    ...b,
    descrizione: r.descrizione || b.descrizione,
    servizi: r.servizi?.length ? r.servizi : b.servizi,
    telefono: r.telefono || b.telefono,
    whatsapp: r.whatsapp || b.whatsapp,
    email: r.email || b.email,
    social: r.social?.length ? r.social : b.social,
    indirizzo,
    maps: r.maps || (r.indirizzo ? mapsDa(r.indirizzo) : b.maps) || (indirizzo ? mapsDa(indirizzo) : null),
    indicazioni: r.indicazioni || b.indicazioni,
    fonte: `${b.fonte} Campi aggiornati in Regia.`,
    daRegia: true,
  };
}

const extraDi = (slug: string, appartenenza: string, m: ModificaRegistro | undefined) => {
  const scheda = schedaDi(slug, appartenenza, m);
  return {
    logoRegia: m?.logo?.trim() || null,
    sito: m?.sito?.trim() || scheda.sito || null,
    /** Solo il sito inserito in Regia (il modulo non deve ricopiare quello di base). */
    sitoRegia: m?.sito?.trim() || null,
    collegamentiRegia: m?.collegamenti ?? [],
    info: scheda,
    schedaRegia: m?.scheda ?? null,
  };
};

export const channelRegistro = {
  elenco: base.handler(async () => {
    try {
      await sincronizzaSeServe();
    } catch {
      /* si mostra l'ultimo archivio salvato */
    }
    const adesso = Date.now();
    const [quadro, spazi, cms] = await Promise.all([quadroChannel(adesso, CHANNEL_REGISTRO), leggiSpazi(), leggiCanali()]);
    /* 28/10/2026 — Gestione contenuti: nomi, ordine e attivazione dal pannello + Channel e pagine aggiunti.
       I 28 ufficiali e Touch Talent restano invariati (mai spenti, mai rinominati, mai spostati). */
    const risolti = new Map(risolviCanali(cms).map((r) => [r.slug, r]));
    const vociCms = await vociPubbliche((k) => !!k.channel).catch(() => []);
    const registro = quadro
      .filter((c) => FISSI_HOME0.has(c.slug) || risolti.get(c.slug)?.attivo !== false)
      .map((c) => {
        const s = c.slotVuoto ? spazi[c.slug] : undefined;
        return {
          slug: c.slug,
          nome: s?.nome || c.nome,
          sezione: c.sezione,
          appartenenza: c.appartenenza,
          pagina: s?.url || c.pagina,
          esterno: !!s?.url && s.url.startsWith("https://"),
          scheda: c.scheda,
          logo: c.logo,
          fonte: c.fonte,
          slotVuoto: !!c.slotVuoto,
          compilato: !!s?.nome || !!s?.url,
          ordineDaIndicare: !!c.ordineDaIndicare,
          mediaPartnerEsterno: !!c.mediaPartnerEsterno,
          /* `nota` del quadro = riga dello stato; la nota del registro si rilegge dal registro. */
          nota: registroPerSlug(c.slug)?.nota ?? null,
          stato: c.stato,
          notaStato: c.nota,
          modalita: c.impostazioni.modalita,
          contenutiAttivi: c.contenutiAttivi,
          ordineCms: FISSI_HOME0.has(c.slug) ? null : (risolti.get(c.slug)?.ordine ?? null),
          nomeCms: FISSI_HOME0.has(c.slug) ? null : (cms.modifiche[c.slug]?.nome?.trim() || null),
          collegamenti: registroPerSlug(c.slug)?.collegamenti ?? [],
          ...extraDi(c.slug, c.appartenenza, cms.modifiche[c.slug]),
        };
      });
    const aggiunti = [...risolti.values()]
      .filter((r) => r.aggiunto && r.attivo)
      .map((r) => {
        const n = vociCms.filter((v) => v.channel === r.slug).length;
        return {
          slug: r.slug,
          nome: r.nome,
          sezione: r.sezione,
          appartenenza: "da assegnare" as const,
          pagina: r.pagina ?? r.scheda,
          esterno: r.esterno,
          scheda: r.scheda,
          logo: r.logo,
          fonte: "slot" as const,
          /* 04/11/2026 (round 18) — spazio aggiunto in blocco dal pannello: tessera tratteggiata finché non si compila. */
          slotVuoto: r.spazio,
          compilato: !r.spazio,
          ordineDaIndicare: false,
          mediaPartnerEsterno: false,
          nota: r.descrizione,
          stato: (n ? "PLAYLIST AUTOMATICA" : "IN ALLESTIMENTO") as StatoEffettivo,
          notaStato: n ? `${n} contenut${n === 1 ? "o" : "i"} dal pannello` : null,
          modalita: "auto" as const,
          contenutiAttivi: n,
          ordineCms: r.ordine,
          nomeCms: null,
          collegamenti: [] as NonNullable<ChannelRegistro["collegamenti"]>,
          logoRegia: null as string | null,
          sito: r.esterno ? r.pagina : null,
          collegamentiRegia: [] as { nome: string; href: string }[],
          info: schedaDi(r.slug, "da assegnare", undefined),
          sitoRegia: null as string | null,
          schedaRegia: null as SchedaRegia | null,
        };
      });
    /* ordine: quello del registro, salvo gli spostamenti fatti dal pannello (i 28 tengono il loro posto). */
    const posizione = (c: { slug: string; ordineCms: number | null }, i: number) => c.ordineCms ?? (CHANNEL_REGISTRO.findIndex((r) => r.slug === c.slug) + 1 || i + 1) * 10;
    const channel = [...registro.map((c) => ({ ...c, nome: c.nomeCms ?? c.nome })), ...aggiunti]
      .map((c, i) => ({ c, o: posizione(c, i) }))
      .sort((a, b) => a.o - b.o)
      .map(({ c }) => c);
    return {
      adesso,
      ambiente: AMBIENTE,
      sezioni: SEZIONI_CHANNEL,
      caroselli: CAROSELLI_HOME,
      channel,
    };
  }),

  /** Anteprima del palinsesto di un Channel del registro (card, monitor, player /channel/play/<slug>). */
  anteprima: base.input(z.object({ slug: z.string().max(80) })).handler(async ({ input }) => {
    if (!SLUG_REGISTRO.has(input.slug)) return { slug: input.slug, stato: "IN ALLESTIMENTO" as StatoEffettivo, nota: null, voci: [] as VoceAnteprima[] };
    try {
      await sincronizzaSeServe();
    } catch {
      /* ultimo archivio salvato */
    }
    const adesso = Date.now();
    const imp = (await tutteLeImpostazioni())[input.slug]!;
    const [seq, fasce, cms] = await Promise.all([
      sequenzaDi(input.slug, dataRoma(adesso), imp),
      fasceDi(input.slug),
      vociPubbliche((c) => c.channel === input.slug, adesso).catch(() => [] as VocePubblica[]),
    ]);
    const st = calcolaStato(input.slug, imp, seq.filter((x) => !x.spot).length + cms.length, fasce, adesso, seq.filter((x) => x.spot).length);
    const voci = [...cms.map(daCms), ...seq.slice(0, 80).map(daSequenza)];
    return { slug: input.slug, stato: st.stato, nota: st.nota, voci };
  }),
};

/** Logo: https://… o un file del sito /…; sito: solo https://… (mai inventato: vuoto = nessun «Vai al sito»). */
const URL_LOGO = z
  .string()
  .trim()
  .max(1000)
  .refine((u) => u === "" || /^https:\/\/[^\s]+$/.test(u) || /^\/[^\s/][^\s]*$/.test(u), "Logo: serve un indirizzo https://… o un file del sito /…");
const URL_SITO = z
  .string()
  .trim()
  .max(1000)
  .refine((u) => u === "" || /^https:\/\/[^\s.]+\.[^\s]+$/.test(u), "Sito: serve un indirizzo completo https://…");
const COLLEGAMENTO = z.object({
  nome: z.string().trim().min(1, "Ogni collegamento ha bisogno di un nome.").max(120),
  href: z
    .string()
    .trim()
    .max(1000)
    .refine((u) => /^https:\/\/[^\s]+$/.test(u) || /^\/[^\s]*$/.test(u), "Collegamento: https://… o una pagina interna /…"),
});

export const channelRegistroAdmin = {
  /**
   * 28/10/2026 (round 14) — REGIA: logo, sito e collegamenti di un Channel del registro. Salvati in
   * `cms_v1:canali` (chiave CONDIVISA): restano dopo il salvataggio, il ricaricamento e il Publish e valgono
   * subito anche su www. Numero, slug e pagina dei 28 NON cambiano (qui non si toccano).
   */
  impostaExtra: base
    .input(z.object({ codice: z.string(), slug: z.string().max(80), logo: URL_LOGO, sito: URL_SITO, collegamenti: z.array(COLLEGAMENTO).max(12) }))
    .handler(async ({ input }) => {
      controlla(input.codice);
      if (!SLUG_REGISTRO.has(input.slug)) throw new ORPCError("BAD_REQUEST", { message: "Channel sconosciuto." });
      const c = await leggiCanali();
      const m: ModificaRegistro = { ...(c.modifiche[input.slug] ?? {}) };
      m.logo = input.logo || undefined;
      m.sito = input.sito || undefined;
      m.collegamenti = input.collegamenti.length ? input.collegamenti : undefined;
      // tutto vuoto = nessuna modifica rimasta: la voce sparisce (niente residui nel dato condiviso)
      if (Object.values(m).every((x) => x === undefined)) delete c.modifiche[input.slug];
      else c.modifiche[input.slug] = m;
      await salvaCanali(c);
      return { ok: true, esito: "Logo, sito e collegamenti salvati (validi anche su www.tbh-web.com)." };
    }),

  /**
   * 29/10/2026 (round 15) — REGIA: SCHEDA informativa di un Channel (descrizione, servizi, telefono, WhatsApp,
   * e-mail, social, indirizzo, Maps, indicazioni). Separata dal palinsesto. Chiave CONDIVISA cms_v1:canali:
   * vale su anteprima e www. Tutto vuoto = si torna ai dati di base verificati.
   */
  impostaScheda: base
    .input(
      z.object({
        codice: z.string(),
        slug: z.string().max(80),
        descrizione: z.string().trim().max(2000),
        servizi: z.array(z.string().trim().min(1).max(160)).max(20),
        telefono: z
          .string()
          .trim()
          .max(120)
          .refine((t) => t === "" || (/^[+0-9][0-9 ()./+·-]+$/.test(t) && (t.match(/[0-9]/g)?.length ?? 0) >= 6), "Telefono: solo cifre, spazi, + e ·"),
        whatsapp: z
          .string()
          .trim()
          .max(200)
          .refine((u) => u === "" || /^https:\/\/(wa\.me|api\.whatsapp\.com|chat\.whatsapp\.com)\/[^\s]*$/.test(u) || /^\+?[0-9][0-9 ]{6,}$/.test(u), "WhatsApp: numero (+39…) o link https://wa.me/…"),
        email: z
          .string()
          .trim()
          .max(200)
          .refine((e) => e === "" || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e), "E-mail non valida"),
        social: z.array(COLLEGAMENTO).max(10),
        indirizzo: z.string().trim().max(300),
        maps: z
          .string()
          .trim()
          .max(1000)
          .refine((u) => u === "" || /^https:\/\/(www\.)?(google\.[a-z.]+\/maps|maps\.google\.[a-z.]+|maps\.app\.goo\.gl|goo\.gl\/maps)[^\s]*$/.test(u), "Maps: serve un link https://www.google.com/maps/… o https://maps.app.goo.gl/…"),
        indicazioni: z.string().trim().max(1000),
      }),
    )
    .handler(async ({ input }) => {
      controlla(input.codice);
      if (!SLUG_REGISTRO.has(input.slug)) throw new ORPCError("BAD_REQUEST", { message: "Channel sconosciuto." });
      const c = await leggiCanali();
      const m: ModificaRegistro = { ...(c.modifiche[input.slug] ?? {}) };
      const sc: SchedaRegia = {
        descrizione: input.descrizione || undefined,
        servizi: input.servizi.length ? input.servizi : undefined,
        telefono: input.telefono || undefined,
        whatsapp: input.whatsapp
          ? input.whatsapp.startsWith("https://")
            ? input.whatsapp
            : `https://wa.me/${input.whatsapp.replace(/[^0-9]/g, "")}`
          : undefined,
        email: input.email || undefined,
        social: input.social.length ? input.social : undefined,
        indirizzo: input.indirizzo || undefined,
        maps: input.maps || undefined,
        indicazioni: input.indicazioni || undefined,
      };
      if (Object.values(sc).every((x) => x === undefined)) delete m.scheda;
      else m.scheda = JSON.parse(JSON.stringify(sc)) as SchedaRegia;
      if (Object.values(m).every((x) => x === undefined)) delete c.modifiche[input.slug];
      else c.modifiche[input.slug] = m;
      await salvaCanali(c);
      return { ok: true, esito: m.scheda ? "Scheda informativa salvata (valida anche su www.tbh-web.com)." : "Scheda svuotata: tornano i dati di base." };
    }),

  /** Nome e URL di uno SPAZIO vuoto (NOVA TV, BEST ENTERTAINMENT, spazio libero). Stringhe vuote = svuota. */
  impostaSpazio: base
    .input(z.object({ codice: z.string(), slug: z.string(), nome: z.string().trim().max(120), url: URL_SPAZIO }))
    .handler(async ({ input }) => {
      controlla(input.codice);
      const c = registroPerSlug(input.slug);
      if (!c?.slotVuoto) throw new ORPCError("BAD_REQUEST", { message: "Si compilano solo gli spazi vuoti: gli altri Channel hanno già nome e pagina." });
      const spazi = await leggiSpazi();
      if (!input.nome && !input.url) delete spazi[input.slug];
      else spazi[input.slug] = { nome: input.nome, url: input.url, quando: Date.now() };
      const value = JSON.stringify(spazi);
      await db.insert(schema.settings).values({ key: CHIAVE_SPAZI, value }).onConflictDoUpdate({ target: schema.settings.key, set: { value } });
      return { ok: true, ambiente: AMBIENTE };
    }),
};
