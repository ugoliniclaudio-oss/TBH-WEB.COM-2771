import { z } from "zod";
import { base } from "../__core/app";
import {
  SQUADRE,
  BLOCCHI_DATI,
  SPAZI_SQUADRA,
  SPORT_NOTA,
  APP_SQUADRA,
  squadra,
} from "../data/sport";
import { LUOGHI_SANREMO, SANREMO_NOTA, MAPPA_RIFERIMENTO, luogoSanremo } from "../data/sanremo";
import { HUGO, MUSICA_NOTA, SLOT_BRANI, BRANI_NOTA, NUMERO_SLOT_BRANI } from "../data/musica";
import { DM_CREW, CREW_DA_CONFERMARE, CREW_NOTA } from "../data/dmcrew";
import { DM_CANALE } from "../data/tbh";
import {
  DM_VIDEO_SQUADRE,
  DM_VIDEO_NOTA,
  DM_VIDEO_TOTALE,
  DM_CANALE_VIDEO,
  videoDm,
} from "../data/dm-video";
import { TBH_CONTACTS } from "../data/catalog";
import { risolviLogo } from "../data/identita";
import {
  partiteDm,
  conteggiPeriodo,
  PARTITE_DM,
  PARTITE_DM_NOTA,
  type PartitaDm,
  type ContenutoSocieta,
} from "../data/partite-dm";
import {
  CANALE_TOUCH_MUSIC_TV,
  SUNO_HUGO,
  PRODUZIONI_TOUCH,
  SELEZIONI_TOUCH,
  SITI_TOUCH,
  SOCIAL_TOUCH,
  TOUCH_MUSIC_NOTA,
} from "../data/touchmusic";

/**
 * PORTALE A MONITOR — brief punti 1, 2, 3, 7, 8.
 * Espone solo dati reali; i blocchi senza fonte ufficiale restano dichiarati vuoti.
 */
export const portale = {
  /** Elenco squadre per la sezione monitor della home e per l'hub sport. */
  squadre: base.handler(() => ({
    squadre: SQUADRE.map((s) => ({
      slug: s.slug,
      nome: s.nome,
      nomeBreve: s.nomeBreve,
      colore: s.colore,
      /* UN LOGO ORIGINALE PER IDENTITÀ: lo stemma non può esserci in una pagina
         e mancare in un'altra solo perché il nome è scritto in forma diversa. */
      logo: risolviLogo(s.nome, s.logo).logo,
      categoria: s.categoria,
      citta: s.citta,
      sito: s.sito,
      social: s.social,
      gruppo: s.gruppo,
      /** Sigillo: vero solo se DM Comunicazioni risulta già tra i media che seguono la squadra. */
      seguitaDaDm: s.media.some((m) => m.nome.toLowerCase().includes("dm comunicazioni")),
      /** Società di calcio di interesse del territorio (Rimini): fuori dalle squadre seguite. */
      territorio: s.territorio === true,
      dmLogo: DM_CANALE.logo,
      /** Quanti video del canale ufficiale di Daniele Manuelli sono abbinati alla società. */
      videoDm: videoDm(s.slug)?.totale ?? 0,
    })),
    nota: SPORT_NOTA,
  })),

  /**
   * HIGHLIGHTS SCORSE STAGIONI — vetrina unica dei video del canale ufficiale
   * Daniele Manuelli Official abbinati automaticamente alle società seguite.
   * Il Rimini Calcio non compare: resta società di interesse del territorio.
   */
  dmVideo: base.handler(() => ({
    squadre: DM_VIDEO_SQUADRE.map((v) => ({
      slug: v.slug,
      nome: v.nome,
      totale: v.totale,
      highlights: v.highlights,
      interviste: v.interviste,
      servizi: v.servizi,
      /* Gli highlights scrivono «Verucchio», l'area sport «A.S.D. Verucchio Calcio
         1957»: il risolutore riconosce la stessa società e riusa il suo stemma. */
      logo: risolviLogo(v.nome, SQUADRE.find((s) => s.slug === v.slug)?.logo ?? null).logo,
      colore: SQUADRE.find((s) => s.slug === v.slug)?.colore ?? "#ff2b2b",
    })),
    canale: DM_CANALE_VIDEO,
    dmLogo: DM_CANALE.logo,
    totale: DM_VIDEO_TOTALE,
    nota: DM_VIDEO_NOTA,
  })),

  squadra: base
    .input(z.object({ slug: z.string() }))
    .handler(({ input }) => {
      const s = squadra(input.slug);
      if (!s)
        return {
          squadra: null,
          blocchi: [],
          spazi: [],
          nota: SPORT_NOTA,
          contatti: TBH_CONTACTS,
          seguitaDaDm: false,
          territorio: false,
          video: null as ReturnType<typeof videoDm>,
          /** Modulo TRE MONITOR: nessuna partita per una società non pubblicata. */
          partite: [] as PartitaDm[],
          contenutiSocieta: [] as ContenutoSocieta[],
          conteggiPartite: conteggiPeriodo([]),
          partiteNota: PARTITE_DM_NOTA,
          videoNota: DM_VIDEO_NOTA,
          canaleDm: DM_CANALE_VIDEO,
          dmLogo: DM_CANALE.logo,
          app: APP_SQUADRA,
          indice: 0,
          totale: SQUADRE.length,
          prima: null as { slug: string; nome: string } | null,
          dopo: null as { slug: string; nome: string } | null,
        };
      /** Frecce avanti/indietro: scorrimento circolare sull'elenco reale delle società. */
      const i = SQUADRE.findIndex((x) => x.slug === s.slug);
      const p = SQUADRE[(i - 1 + SQUADRE.length) % SQUADRE.length];
      const n = SQUADRE[(i + 1) % SQUADRE.length];
      return {
        /* Anche la scheda singola passa dal risolutore: stesso stemma dell'elenco. */
        squadra: { ...s, logo: risolviLogo(s.nome, s.logo).logo },
        app: APP_SQUADRA,
        indice: i,
        totale: SQUADRE.length,
        prima:
          SQUADRE.length > 1 ? { slug: p.slug, nome: p.nomeBreve } : null,
        dopo: SQUADRE.length > 1 ? { slug: n.slug, nome: n.nomeBreve } : null,
        seguitaDaDm: s.media.some((m) => m.nome.toLowerCase().includes("dm comunicazioni")),
        dmLogo: DM_CANALE.logo,
        /** Video reali del canale ufficiale DM abbinati a questa società (null per il Rimini). */
        video: videoDm(s.slug),
        /**
         * MODULO TRE MONITOR — un record per match_id, ricostruito dai titoli
         * pubblicati dal canale: PARTITA INTEGRALE · HIGHLIGHTS · INTERVISTE.
         * `contenutiSocieta` sono i video reali che NON dichiarano una partita:
         * restano dichiarati come tali, non vengono abbinati a caso.
         */
        partite: (partiteDm(s.slug)?.partite ?? []) as PartitaDm[],
        contenutiSocieta: (partiteDm(s.slug)?.contenuti ?? []) as ContenutoSocieta[],
        conteggiPartite: conteggiPeriodo(partiteDm(s.slug)?.partite ?? []),
        partiteNota: PARTITE_DM_NOTA,
        videoNota: DM_VIDEO_NOTA,
        canaleDm: DM_CANALE_VIDEO,
        territorio: s.territorio === true,
        blocchi: BLOCCHI_DATI,
        spazi: SPAZI_SQUADRA,
        nota: SPORT_NOTA,
        contatti: TBH_CONTACTS,
      };
    }),

  sanremo: base.handler(() => ({
    luoghi: LUOGHI_SANREMO,
    nota: SANREMO_NOTA,
    mappa: MAPPA_RIFERIMENTO,
  })),

  luogoSanremo: base
    .input(z.object({ slug: z.string() }))
    .handler(({ input }) => {
      /** Frecce avanti/indietro: scorrimento circolare sull'elenco reale dei luoghi. */
      const i = LUOGHI_SANREMO.findIndex((l) => l.slug === input.slug);
      const p = i >= 0 ? LUOGHI_SANREMO[(i - 1 + LUOGHI_SANREMO.length) % LUOGHI_SANREMO.length] : null;
      const n = i >= 0 ? LUOGHI_SANREMO[(i + 1) % LUOGHI_SANREMO.length] : null;
      return {
        luogo: luogoSanremo(input.slug),
        nota: SANREMO_NOTA,
        indice: i < 0 ? 0 : i,
        totale: LUOGHI_SANREMO.length,
        prima: p && LUOGHI_SANREMO.length > 1 ? { slug: p.slug, nome: p.nome } : null,
        dopo: n && LUOGHI_SANREMO.length > 1 ? { slug: n.slug, nome: n.nome } : null,
        altri: LUOGHI_SANREMO.filter((l) => l.slug !== input.slug).map((l) => ({
          slug: l.slug,
          nome: l.nome,
          colore: l.colore,
        })),
      };
    }),

  musica: base.handler(() => ({
    hugo: HUGO,
    nota: MUSICA_NOTA,
    /** Slot brani con spazio URL: titoli reali non ancora ricevuti, nessuno inventato. */
    brani: SLOT_BRANI,
    braniNota: BRANI_NOTA,
    braniTotale: NUMERO_SLOT_BRANI,
    contatti: TBH_CONTACTS,
  })),

  /**
   * TOUCH MUSIC RADIO TV · TOUCH PRODUCTION LTD — scheda canale ufficiale inviata dalla
   * direzione il 29/08/2026: dati del canale, siti, social e aree di produzione reali.
   */
  touchMusic: base.handler(() => ({
    canale: CANALE_TOUCH_MUSIC_TV,
    suno: SUNO_HUGO,
    produzioni: PRODUZIONI_TOUCH,
    selezioni: SELEZIONI_TOUCH,
    siti: SITI_TOUCH,
    social: SOCIAL_TOUCH,
    nota: TOUCH_MUSIC_NOTA,
    contatti: TBH_CONTACTS,
  })),

  /**
   * PARTITE IN EVIDENZA — vetrina unica per la home (ordine di Claudio: si fa per
   * prima). Una sola sorgente aggregata su TUTTE le società seguite, così la home
   * non duplica la logica della pagina società: gli stessi `match_id` del modulo
   * TRE MONITOR, filtrati su quelli che hanno almeno UN monitor acceso.
   *
   * ORDINE, senza inventare date. I titoli del canale non dichiarano la data
   * (regola del 15/09/2026: nessuna data dedotta), quindi «in evidenza» non può
   * voler dire «le più recenti»: si ordina per monitor accesi (prima le partite
   * complete: integrale + highlights + interviste), poi per società e avversario.
   * Il conteggio vero viaggia col dato, così in pagina si scrive quanto c'è.
   *
   * `[ APRI SCHEDA ]` porta alla pagina della società che esiste già
   * (`/sport/squadre/:slug?partita=<match_id>`): nessuna pagina nuova per la
   * singola partita.
   */
  partiteInEvidenza: base
    .input(z.object({ massimo: z.number().int().min(1).max(60).optional() }).optional())
    .handler(({ input }) => {
      const massimo = input?.massimo ?? 12;

      const voci = PARTITE_DM.flatMap((s) => {
        const sq = SQUADRE.find((x) => x.slug === s.slug);
        /* Stemma della società della pagina: quello ufficiale già in repo, passato
           dal risolutore così è lo stesso file di tutte le altre pagine.
           Stemma dell'avversario: si cerca nel registro per nome; se non c'è,
           resta null e in pagina si mostra il nome, non un logo prestato. */
        const stemmaSquadra = risolviLogo(sq?.nome ?? s.nome, sq?.logo ?? null).logo;
        return s.partite
          .filter((p) => p.integrale || p.sintesi || p.interviste)
          .map((p) => ({
            matchId: p.matchId,
            slug: s.slug,
            squadra: sq?.nomeBreve ?? s.nome,
            squadraNome: sq?.nome ?? s.nome,
            colore: sq?.colore ?? "#ff2b2b",
            casa: p.casa,
            ospite: p.ospite,
            inCasa: p.inCasa,
            avversario: p.avversario,
            risultato: p.risultato,
            competizione: p.competizione,
            periodo: p.periodo,
            dataConfermata: p.dataConfermata,
            stemmaCasa: p.inCasa ? stemmaSquadra : risolviLogo(p.casa, null).logo,
            stemmaOspite: p.inCasa ? risolviLogo(p.ospite, null).logo : stemmaSquadra,
            integrale: p.integrale,
            sintesi: p.sintesi,
            interviste: p.interviste,
            accesi:
              (p.integrale ? 1 : 0) + (p.sintesi ? 1 : 0) + (p.interviste ? 1 : 0),
          }));
      });

      voci.sort(
        (a, b) =>
          b.accesi - a.accesi ||
          a.squadra.localeCompare(b.squadra, "it") ||
          a.avversario.localeCompare(b.avversario, "it"),
      );

      return {
        partite: voci.slice(0, massimo),
        mostrate: Math.min(voci.length, massimo),
        /** Partite con almeno un monitor acceso, su tutte le società. */
        totale: voci.length,
        /** Partite complete: tutti e tre i monitor accesi. */
        treMonitor: voci.filter((v) => v.accesi === 3).length,
        societa: [...new Set(voci.map((v) => v.slug))].length,
        canaleDm: DM_CANALE_VIDEO,
        dmLogo: DM_CANALE.logo,
        nota: PARTITE_DM_NOTA,
      };
    }),

  /** DM CREW — album figurine: solo persone e ruoli verificati, foto reali o slot dichiarati. */
  dmCrew: base.handler(() => ({
    crew: DM_CREW,
    daConfermare: CREW_DA_CONFERMARE,
    nota: CREW_NOTA,
    canale: DM_CANALE,
    contatti: TBH_CONTACTS,
  })),
};
