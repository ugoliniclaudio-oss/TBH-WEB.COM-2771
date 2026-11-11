import { z } from "zod";
import { base } from "../__core/app";
import {
  ACCESSI_PRINCIPALI,
  CANALI_TELECOMANDO,
  FASCE_REPLICA_DM,
  SEZIONI_MOTORSPORT,
  VIDEO_DM_CONFERMATI,
  VIDEO_DM_DA_CONFERMARE,
  VOCI_MISS_COOL,
  type StatoCanale,
  type VideoArchivio,
  type VoceCanale,
} from "../data/telecomando";
import { DM_CANALE_VIDEO, DM_VIDEO_SQUADRE } from "../data/dm-video";
import { SQUADRE } from "../data/sport";
import { PALINSESTO_DM } from "../data/tbh";
import { ALTRE_DIRETTE_DM, PUNTATE_DM, durataTesto, type PuntataArchivioDm } from "../data/dm-puntate";
import { DM_RADIO } from "../data/radio";
import { GIORNI } from "../data/palinsesto";
import { SLIDE_KIT } from "../data/miss-cool";
import { risolviLogo } from "../data/identita";
import { vetrinaTouchPlaza } from "../lib/catalogo-touch-plaza";
import { dataRoma, giornoDopo, giornoSettimana, istanteRoma, oraRoma } from "../lib/radio-palinsesto";

/**
 * TELECOMANDO CANALI — API dell'anteprima /check-web/home-canali e /check-web/canali/:slug.
 * Tutto quello che il telecomando mostra arriva da archivi già presenti nel sito:
 * dm-video.ts, dm-puntate.ts, PALINSESTO_DM, vetrina Touch Plaza, kit Touch Miss Cool. Nulla di nuovo
 * viene inventato qui: questo file sceglie, ordina e calcola lo stato.
 */

/* ── archivio DM per società ─────────────────────────────────────────────────── */

function idYouTube(url: string): string | null {
  const m = url.match(/(?:v=|youtu\.be\/|embed\/|shorts\/|live\/)([\w-]{11})/);
  return m ? m[1]! : null;
}

function archivioSquadra(slug: string): { video: VideoArchivio[]; daConfermare: boolean } {
  const v = DM_VIDEO_SQUADRE.find((x) => x.slug === slug);
  if (v) {
    const lista: VideoArchivio[] = [];
    for (const tipo of ["highlights", "interviste", "servizi"] as const)
      for (const x of v[tipo]) {
        const id = idYouTube(x.url);
        if (id) lista.push({ id, titolo: x.titolo, tipo });
      }
    return { video: lista, daConfermare: false };
  }
  const extra = VIDEO_DM_DA_CONFERMARE[slug];
  return { video: extra ?? [], daConfermare: !!extra && !VIDEO_DM_CONFERMATI.includes(slug) };
}

const miniatura = (id: string) => `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;

/* ── caso fisso per data (stessa selezione per tutti nello stesso giorno) ─────── */

function seme(t: string) {
  let h = 2166136261;
  for (let i = 0; i < t.length; i++) {
    h ^= t.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}
function mescola<T>(lista: T[], chiave: string): T[] {
  let a = seme(chiave);
  const caso = () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const out = [...lista];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(caso() * (i + 1));
    [out[i], out[j]] = [out[j]!, out[i]!];
  }
  return out;
}

/* ── fasce DM: all'orario ufficiale solo DIRETTA, in ogni altro orario REPLICA ─────
 * Regola del 16/10/2026: un programma all'orario del palinsesto ufficiale è SOLO in
 * diretta; fuori da quegli orari DM Channel trasmette 24/7 le repliche delle puntate
 * pubblicate (dm-puntate.ts). TOUCH TV tiene le sue tre fasce replica 00:00 · 12:00 · 18:00
 * con le ultime puntate di ciascun programma. La diretta prevale sempre. */

type EpisodioReplica = { programma: string; slug: string; titolo: string; videoId: string; durataSec: number; link: string };

function episodio(slug: string, nome: string, p: PuntataArchivioDm): EpisodioReplica {
  return { programma: nome, slug, titolo: p.titolo, videoId: p.videoId, durataSec: p.durataSec, link: `https://www.youtube.com/watch?v=${p.videoId}` };
}

/** Rotazione repliche DM Channel: a turno un programma per volta, dalla puntata più recente. */
function rotazioneRepliche(): EpisodioReplica[] {
  const liste = PALINSESTO_DM.map((p) => (PUNTATE_DM[p.slug] ?? []).map((x) => episodio(p.slug, p.name, x)));
  const out: EpisodioReplica[] = [];
  const max = Math.max(0, ...liste.map((l) => l.length));
  for (let i = 0; i < max; i++) for (const l of liste) if (l[i]) out.push(l[i]!);
  return out;
}

/** Le ultime puntate di ogni programma (per TOUCH TV e per l'anteprima). */
function ultimePuntate(): EpisodioReplica[] {
  return PALINSESTO_DM.flatMap((p) => {
    const x = PUNTATE_DM[p.slug]?.[0];
    return x ? [episodio(p.slug, p.name, x)] : [];
  });
}

/** La puntata più recente pubblicata: anteprima del canale DM. */
function puntataReplica(): EpisodioReplica | null {
  const ultime = ultimePuntate();
  const datate = ultime.filter((u) => PUNTATE_DM[u.slug]?.[0]?.pubblicata);
  datate.sort((x, y) => PUNTATE_DM[y.slug]![0]!.pubblicata!.localeCompare(PUNTATE_DM[x.slug]![0]!.pubblicata!));
  return datate[0] ?? ultime[0] ?? null;
}

export type FasciaDm = {
  tipo: "diretta" | "replica";
  titolo: string;
  programma: string;
  inizio: number;
  fine: number;
  ora: string;
  videoId: string | null;
  embed: string;
};

const GIORNO_ZERO = "2026-08-01";
const numeroGiorno = (data: string) => Math.round((istanteRoma(data) - istanteRoma(GIORNO_ZERO)) / 86_400_000);

function diretteGiorno(data: string): FasciaDm[] {
  const g = giornoSettimana(data);
  return PALINSESTO_DM.filter((p) => p.giorno === g && p.ora).map((p) => {
    const inizio = istanteRoma(data, p.ora!);
    return {
      tipo: "diretta",
      titolo: p.name,
      programma: p.name,
      inizio,
      fine: inizio + p.durataMin * 60_000,
      ora: p.ora!,
      videoId: null,
      embed: DM_RADIO.live,
    };
  });
}

function fasciaReplica(e: EpisodioReplica, inizio: number, fine: number): FasciaDm {
  return {
    tipo: "replica",
    titolo: e.titolo,
    programma: e.programma,
    inizio,
    fine,
    ora: oraRoma(inizio),
    videoId: e.videoId,
    embed: `https://www.youtube.com/embed/${e.videoId}`,
  };
}

/** DM Channel: 24 ore, dirette agli orari ufficiali e repliche a rotazione in tutto il resto. */
function fasceDmGiorno(data: string): FasciaDm[] {
  const dirette = diretteGiorno(data);
  const rot = rotazioneRepliche();
  const fasce: FasciaDm[] = [...dirette];
  if (rot.length) {
    const fineGiorno = istanteRoma(giornoDopo(data));
    let t = istanteRoma(data);
    // ogni giorno la rotazione riparte da un punto diverso, uguale per tutti
    let i = (numeroGiorno(data) * 13) % rot.length;
    if (i < 0) i += rot.length;
    while (t < fineGiorno) {
      const inCorso = dirette.find((d) => d.inizio <= t && t < d.fine);
      if (inCorso) {
        t = inCorso.fine;
        continue;
      }
      const e = rot[i % rot.length]!;
      let fine = Math.min(t + e.durataSec * 1000, fineGiorno);
      for (const d of dirette) if (d.inizio > t && d.inizio < fine) fine = d.inizio;
      fasce.push(fasciaReplica(e, t, fine));
      t = fine;
      i++;
    }
  }
  return fasce.sort((a, b) => a.inizio - b.inizio);
}

/** TOUCH TV: dirette DM + tre fasce replica con le ultime puntate, a turno ogni giorno. */
function fasceTvGiorno(data: string): FasciaDm[] {
  const dirette = diretteGiorno(data);
  const ultime = ultimePuntate();
  const repliche: FasciaDm[] = [];
  if (ultime.length)
    FASCE_REPLICA_DM.forEach((ora, k) => {
      const e = ultime[(numeroGiorno(data) + k) % ultime.length]!;
      const inizio = istanteRoma(data, ora);
      let fine = inizio + e.durataSec * 1000;
      // La diretta prevale: la replica si ferma dove comincia la diretta, o salta.
      let salta = false;
      for (const d of dirette) {
        if (d.inizio <= inizio && d.fine > inizio) salta = true;
        else if (d.inizio > inizio && d.inizio < fine) fine = d.inizio;
      }
      if (!salta) repliche.push(fasciaReplica(e, inizio, fine));
    });
  return [...dirette, ...repliche].sort((a, b) => a.inizio - b.inizio);
}

function quadroDm(adesso: number) {
  const oggi = dataRoma(adesso);
  const fasce = [...fasceDmGiorno(oggi), ...fasceDmGiorno(giornoDopo(oggi))];
  const corrente = fasce.find((f) => f.inizio <= adesso && adesso < f.fine) ?? null;
  const prossime = fasce.filter((f) => f.inizio > adesso).slice(0, 4);
  const prossimaDiretta = fasce.find((f) => f.tipo === "diretta" && f.inizio > adesso) ?? null;
  const tvOggi = fasceTvGiorno(oggi);
  const tvFasce = [...tvOggi, ...fasceTvGiorno(giornoDopo(oggi))];
  return {
    oggi,
    corrente,
    prossime,
    prossimaDiretta,
    fasceOggi: fasceDmGiorno(oggi),
    tv: {
      corrente: tvFasce.find((f) => f.inizio <= adesso && adesso < f.fine) ?? null,
      fasceOggi: tvOggi,
    },
    replica: puntataReplica(),
    archivio: PALINSESTO_DM.map((p) => ({
      slug: p.slug,
      nome: p.name,
      puntate: (PUNTATE_DM[p.slug] ?? []).map((x) => ({ ...x, durata: durataTesto(x.durataSec) })),
    })),
    altreDirette: ALTRE_DIRETTE_DM.map((x) => ({ ...x, durata: durataTesto(x.durataSec) })),
    totalePuntate: rotazioneRepliche().length,
    live: DM_RADIO.live,
    canale: DM_CANALE_VIDEO,
    settimana: PALINSESTO_DM.map((p) => ({
      slug: p.slug,
      nome: p.name,
      giorno: p.giorno ? GIORNI[p.giorno]! : null,
      ora: p.ora,
      durataMin: p.durataMin,
    })),
    fasceReplica: [...FASCE_REPLICA_DM],
    notaRepliche: DM_RADIO.repliche,
  };
}

/* ── vetrina Touch Plaza: solo articoli con immagine originale ────────────────── */

async function articoliConImmagine() {
  const tutti = await vetrinaTouchPlaza();
  const conImmagine = tutti
    .filter((p) => !!p.image)
    .map((p) => ({
      slug: p.slug,
      titolo: p.title,
      categoria: p.category,
      prezzoCents: p.priceCents > 0 ? p.priceCents : null,
      immagine: p.image!,
      scheda: `/shop/p/${p.slug}`,
    }));
  return { articoli: conImmagine, totale: tutti.length, senzaImmagine: tutti.length - conImmagine.length };
}

/* ── stato e anteprima di ogni canale ────────────────────────────────────────── */

type Riepilogo = VoceCanale & {
  stato: StatoCanale;
  contenuti: number;
  dettaglio: string;
  anteprima: string | null;
};

async function riepiloghi(adesso: number): Promise<{ canali: Riepilogo[]; dm: ReturnType<typeof quadroDm> }> {
  const dm = quadroDm(adesso);
  const shop = await articoliConImmagine();
  const statoDm: StatoCanale = dm.corrente ? (dm.corrente.tipo === "diretta" ? "ON AIR" : "REPLICA") : "CONTENUTI DISPONIBILI";
  const canali = CANALI_TELECOMANDO.map((c): Riepilogo => {
    switch (c.tipo) {
      case "tv":
        return {
          ...c,
          stato: dm.tv.corrente?.tipo === "replica" ? "REPLICA" : "ON AIR",
          contenuti: dm.tv.fasceOggi.length,
          dettaglio: "Palinsesto 24/7: musica, pubblicità e fasce DM",
          anteprima: null,
        };
      case "radio":
        return { ...c, stato: "ON AIR", contenuti: 0, dettaglio: "Palinsesto audio 24/7", anteprima: null };
      case "dm":
        return {
          ...c,
          stato: statoDm,
          contenuti: dm.settimana.length,
          dettaglio: `${dm.settimana.length} programmi · dirette agli orari ufficiali · ${dm.totalePuntate} puntate in replica`,
          anteprima: dm.replica ? miniatura(dm.replica.videoId) : null,
        };
      case "squadra": {
        const a = archivioSquadra(c.squadra!);
        const primo = a.video.find((v) => v.tipo === "highlights") ?? a.video[0];
        return {
          ...c,
          stato: a.video.length && !a.daConfermare ? "CONTENUTI DISPONIBILI" : "IN ALLESTIMENTO",
          contenuti: a.video.length,
          /* senza contenuti confermati va in onda la programmazione provvisoria del negozio */
          dettaglio:
            a.video.length && !a.daConfermare
              ? `${a.video.length} video DM`
              : `${a.video.length ? `${a.video.length} video DM da confermare` : "Nessun video DM"} · carosello provvisorio in onda`,
          anteprima: primo ? miniatura(primo.id) : null,
        };
      }
      case "lavoro":
        return { ...c, stato: "CONTENUTI DISPONIBILI", contenuti: 0, dettaglio: "Annunci TBH e fonti esterne", anteprima: null };
      case "shop":
        return {
          ...c,
          stato: shop.articoli.length ? "ON AIR" : "IN ALLESTIMENTO",
          contenuti: shop.articoli.length,
          dettaglio: `Carosello automatico · ${shop.articoli.length} articoli con immagine originale`,
          anteprima: shop.articoli[0]?.immagine ?? null,
        };
      case "motorsport":
        return { ...c, stato: "IN ALLESTIMENTO", contenuti: 0, dettaglio: "Contenuti propri in allestimento · carosello promozionale provvisorio in onda", anteprima: shop.articoli[0]?.immagine ?? null };
      case "miss-cool":
        return {
          ...c,
          stato: "ON AIR",
          contenuti: SLIDE_KIT.length,
          dettaglio: `Carosello casuale · ${SLIDE_KIT.length} slide ufficiali + promozioni Touch Plaza`,
          anteprima: SLIDE_KIT[0]?.immagine ?? null,
        };
    }
  });
  return { canali, dm };
}

export const telecomando = {
  /** Il pannello: 8 accessi principali + i 17 canali con stato e anteprima reali. */
  canali: base.handler(async () => {
    const adesso = Date.now();
    const { canali, dm } = await riepiloghi(adesso);
    return { adesso, accessi: ACCESSI_PRINCIPALI, canali, dm };
  }),

  /** Un canale: i dati del suo monitor. */
  canale: base.input(z.object({ slug: z.string() })).handler(async ({ input }) => {
    const adesso = Date.now();
    const { canali, dm } = await riepiloghi(adesso);
    const indice = canali.findIndex((c) => c.slug === input.slug);
    const voce = indice >= 0 ? canali[indice]! : null;
    if (!voce) return null;
    const prima = canali[(indice - 1 + canali.length) % canali.length]!;
    const dopo = canali[(indice + 1) % canali.length]!;
    const vicini = { prima: { slug: prima.slug, nome: prima.nome }, dopo: { slug: dopo.slug, nome: dopo.nome } };
    const oggi = dataRoma(adesso);

    let squadra: null | {
      nome: string;
      colore: string;
      logo: string | null;
      video: VideoArchivio[];
      daConfermare: boolean;
      territorio: boolean;
    } = null;
    if (voce.tipo === "squadra") {
      const s = SQUADRE.find((x) => x.slug === voce.squadra);
      const a = archivioSquadra(voce.squadra!);
      squadra = {
        nome: s?.nome ?? voce.nome.replace(/ Channel$/, ""),
        colore: s?.colore ?? "#d7ff00",
        logo: s ? risolviLogo(s.nome, s.logo).logo : null,
        video: a.video,
        daConfermare: a.daConfermare,
        territorio: s?.territorio === true,
      };
    }

    /* TOUCH RADIO: highlights e interviste delle squadre seguite, scelti a caso ogni giorno. */
    let selezioneRadio: null | { squadra: string; slugCanale: string; video: VideoArchivio }[] = null;
    if (voce.tipo === "radio") {
      const pool = CANALI_TELECOMANDO.filter((c) => c.tipo === "squadra").flatMap((c) => {
        const a = archivioSquadra(c.squadra!);
        if (a.daConfermare) return [];
        return a.video
          .filter((v) => v.tipo !== "servizi")
          .map((v) => ({ squadra: c.nome.replace(/ Channel$/, ""), slugCanale: c.slug, video: v }));
      });
      const hl = mescola(pool.filter((p) => p.video.tipo === "highlights"), `radio-hl-${oggi}`).slice(0, 6);
      const iv = mescola(pool.filter((p) => p.video.tipo === "interviste"), `radio-iv-${oggi}`).slice(0, 6);
      selezioneRadio = hl.flatMap((h, i) => (iv[i] ? [h, iv[i]!] : [h]));
    }

    /* Programmazione provvisoria automatica (specifica): un canale senza trasmissioni proprie
       sufficienti manda in onda un carosello promozionale con i contenuti REALI del negozio. */
    const provvisoria = voce.stato === "IN ALLESTIMENTO";
    const servonoArticoli = provvisoria || voce.tipo === "shop" || voce.tipo === "miss-cool" || voce.tipo === "motorsport";
    const shop = servonoArticoli ? await articoliConImmagine() : null;
    let articoli = shop?.articoli ?? [];
    if (voce.tipo === "miss-cool") articoli = mescola(articoli, `miss-cool-${oggi}`).slice(0, 8);
    if (voce.tipo === "motorsport") articoli = articoli.filter((a) => /marshall|motorsport/i.test(a.slug));
    if (voce.tipo === "shop") articoli = mescola(articoli, `shop-${oggi}`);
    const promoProvvisoria = provvisoria && shop ? mescola(shop.articoli, `provvisoria-${voce.slug}-${oggi}`) : [];

    return {
      adesso,
      voce,
      vicini,
      dm,
      squadra,
      selezioneRadio,
      articoli,
      articoliSenzaImmagine: shop?.senzaImmagine ?? 0,
      promoProvvisoria,
      slideMissCool: voce.tipo === "miss-cool" ? mescola(SLIDE_KIT, `slide-${oggi}`) : [],
      vociMissCool: voce.tipo === "miss-cool" ? VOCI_MISS_COOL : [],
      sezioniMotorsport: voce.tipo === "motorsport" ? [...SEZIONI_MOTORSPORT] : [],
      oraRoma: oraRoma(adesso),
    };
  }),
};
