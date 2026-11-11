/**
 * CHANNEL IN PREPARAZIONE — i 9 Channel nuovi approvati dalla Direzione TBH il 19/10/2026
 * («INTEGRAZIONE DEI 10 CHANNEL APPROVATI»). Il 10° (Touch Reality Show) esisteva già fra i 28
 * di CHANNEL_HOME: lì è stata aggiornata solo la grafica, nessun doppione.
 *
 * Regole:
 *  · NON stanno in CHANNEL_HOME: nessun numero, nessuna fila, nessun posto in home né nei
 *    caroselli. La posizione definitiva la decide la Direzione TBH.
 *  · Scheda solo in anteprima: /check-web/channel/<slug>. Nessuna pubblicazione.
 *  · `categoria` = testo delle istruzioni TBH, alla lettera.
 *  · Palinsesto VUOTO («IN ALLESTIMENTO»): nessun video, nessuna diretta. Si riempie solo con
 *    materiali disponibili e autorizzati, quando TBH fornirà le fonti.
 *  · `collegamenti` = solo siti ufficiali GIÀ presenti e verificati in rete.ts
 *    (CAMPIONATI_MOTORI / PARTNER_TECNICI) o pagine già esistenti del sito. Sono fonti di
 *    riferimento, NON partner né licenze. Contatti, social e stato operativo: da fornire.
 *  · «Touch ACI TV» non esiste in nessun file né nel database: Touch ACI Sport è nuovo.
 */

export type CollegamentoChannel = { nome: string; href: string; esterno: boolean; nota: string };

export type ChannelInPreparazione = {
  slug: string;
  nome: string;
  categoria: string;
  collegamenti: CollegamentoChannel[];
  /** Punti aperti da chiarire con TBH (mostrati solo nell'anteprima). */
  daChiarire?: string;
};

export const schedaChannelInPreparazione = (slug: string) => `/check-web/channel/${slug}`;

export const CHANNEL_IN_PREPARAZIONE: ChannelInPreparazione[] = [
  {
    slug: "touch-backstage-experience",
    nome: "Touch Backstage Experience Channel",
    categoria: "Dietro le quinte ed esperienze esclusive.",
    collegamenti: [],
  },
  {
    slug: "touch-sbk",
    nome: "Touch SBK Channel",
    categoria: "Motociclismo Superbike.",
    collegamenti: [
      { nome: "WorldSBK — Superbike", href: "https://www.worldsbk.com", esterno: true, nota: "Sito ufficiale del campionato (Dorna)." },
      { nome: "Dorna Sports", href: "https://www.dorna.com", esterno: true, nota: "Promotore MotoGP e WorldSBK." },
      { nome: "Pagina Motorsport TBH", href: "/sport/motorsport", esterno: false, nota: "Pagina esistente (WorldSBK Cremona 2026)." },
    ],
  },
  {
    slug: "touch-motogp",
    nome: "Touch MotoGP Channel",
    categoria: "Motociclismo MotoGP.",
    collegamenti: [
      { nome: "MotoGP", href: "https://www.motogp.com", esterno: true, nota: "Sito ufficiale del campionato (Dorna)." },
      { nome: "Dorna Sports", href: "https://www.dorna.com", esterno: true, nota: "Promotore MotoGP e WorldSBK." },
    ],
  },
  {
    slug: "touch-events",
    nome: "Touch Events Channel",
    categoria: "Eventi, concerti, festival, spettacoli e fiere.",
    collegamenti: [],
  },
  {
    slug: "touch-gourmet-cuisines",
    nome: "Touch Gourmet Cuisines Channel",
    categoria: "Gastronomia, chef, ricette, ristorazione e territori.",
    collegamenti: [],
  },
  {
    slug: "touch-beach",
    nome: "Touch Beach Channel",
    categoria: "Mare, spiagge, turismo, lifestyle ed eventi balneari.",
    collegamenti: [],
    daChiarire:
      "Nel Circuito esiste «Touch Beach & Sea» (stabilimento del gruppo, scheda /e/touch-beach-sea): da confermare se va collegato a questo Channel.",
  },
  {
    slug: "touch-f4",
    nome: "Touch F4 Channel",
    categoria: "Formula 4 automobilistica.",
    collegamenti: [
      { nome: "Formula 4 Italia — ACI Sport", href: "https://www.acisport.it", esterno: true, nota: "Sito ufficiale indicato in rete.ts." },
    ],
  },
  {
    slug: "touch-aci-sport",
    nome: "Touch ACI Sport Channel",
    categoria: "Competizioni automobilistiche.",
    collegamenti: [{ nome: "ACI Sport", href: "https://www.acisport.it", esterno: true, nota: "Sito ufficiale indicato in rete.ts." }],
    daChiarire: "Le istruzioni lo indicano come nuovo nome di «Touch ACI TV», che però non risulta da nessuna parte nel sito.",
  },
  {
    slug: "touch-civ",
    nome: "Touch CIV Channel",
    categoria: "Campionato Italiano Velocità motociclistico.",
    collegamenti: [
      { nome: "CIV — Campionato Italiano Velocità", href: "https://www.civ.tv", esterno: true, nota: "Sito ufficiale (FMI)." },
    ],
  },
];
