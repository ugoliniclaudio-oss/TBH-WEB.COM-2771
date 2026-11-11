/**
 * LOGHI UFFICIALI TBH — file consegnati da Claudio il 29/08/2026.
 *
 * Provenienza: i due layout ufficiali «tutti i brand» su fondo nero e su fondo bianco,
 * più il logo tondo Touch Business Holding e la copertina Touch Influencity N°31.
 * I singoli marchi sono stati RITAGLIATI dal layout su fondo nero (il sito ha fondo nero):
 * nessun logo è stato ridisegnato o reinventato. Se un ritaglio non va bene, basta mandare
 * il file singolo e viene sostituito.
 */

import { LOGHI_CHANNEL } from "../../api/data/loghi-channel";
export type LogoTbh = {
  slug: string;
  nome: string;
  file: string;
  claim: string | null;
  colore: string;
  /** Dove porta il logo dentro il portale. Mai un bottone morto. */
  to: string;
};

/** Logo unico del gruppo: tondo, il più leggibile in piccolo (header, footer, favicon). */
export const LOGO_TBH = "/brand/loghi/tbh-tondo.png";
export const LOGO_TBH_PICCOLO = "/brand/loghi/tbh-tondo-256.png";

/**
 * LOGHI UFFICIALI DEL NUOVO SITO TBH-WEB.COM — file consegnati da Claudio il 04/09/2026.
 * Usati così come sono: icona quadrata (icona app, favicon, header, footer) e
 * logo orizzontale con la scritta TOUCH BUSINESS HOLDING (immagine di condivisione, brand).
 */
export const LOGO_TBH_ICONA = "/brand/tbh-icona-app.png";
export const LOGO_TBH_ORIZZONTALE = "/brand/tbh-logo-orizzontale.png";

/** Le quattro versioni ufficiali ricevute, tenute tutte: si usano dove serve il formato giusto. */
export const LOGO_TBH_VERSIONI = [
  { file: "/brand/tbh-icona-app.png", label: "Icona ufficiale TBH-WEB.com" },
  { file: "/brand/tbh-logo-orizzontale.png", label: "Logo orizzontale TBH-WEB.com" },
  { file: "/brand/tbh-logo-skyline-nero.jpg", label: "Skyline su fondo nero" },
  { file: "/brand/tbh-logo-cromato-nero.png", label: "Cromato su fondo nero" },
  { file: "/brand/tbh-logo-bianco-fascia.png", label: "Skyline su fondo bianco" },
  { file: "/brand/tbh-logo-cromato-bianco.png", label: "Cromato su fondo bianco" },
];

export const LOGHI_TBH: LogoTbh[] = [
  {
    slug: "touch-business-holding",
    nome: "Touch Business Holding",
    file: "/brand/loghi/tbh-tondo.png",
    claim: "Business · Media · Events · Marketing · Entertainment",
    colore: "#d7ff00",
    to: "/tbh/societa/touch-business-holding",
  },
  {
    slug: "touch-metropolitan-media",
    nome: "Touch Metropolitan Media",
    file: "/brand/loghi/touch-metropolitan-media.png",
    claim: "See the future · Live the experience",
    colore: "#ff8a00",
    to: "/tbh/societa/tbh-002",
  },
  {
    slug: "touch-production",
    nome: "Touch Production Ltd",
    file: "/brand/loghi/touch-production.png",
    claim: "La vetrina · L'insegna · La voce",
    colore: "#ff2b2b",
    to: "/tbh/societa/tbh-004",
  },
  {
    slug: "touch-music-radio",
    nome: "Touch Music Radio",
    file: "/brand/loghi/touch-music-radio.png",
    claim: "Feel the music · Live the moment",
    colore: "#b46bff",
    to: "/media/radio-tv",
  },
  {
    slug: "touch-music-tv",
    nome: "Touch Music TV",
    file: "/brand/loghi/touch-music-tv.png",
    claim: "Feel the music · Live the moment",
    colore: "#ff3df0",
    to: "/media/radio-tv",
  },
  {
    slug: "touch-tv",
    nome: "Touch TV",
    file: LOGHI_CHANNEL["touch-tv"]!.src,
    claim: "See the future · Live the experience",
    colore: "#33e0ff",
    to: "/media/radio-tv",
  },
  {
    slug: "touch-cinema-studios",
    nome: "Touch Cinema Studios",
    file: "/brand/loghi/touch-cinema-studios.png",
    claim: "We create stories that inspire",
    colore: "#9dff3c",
    to: "/media/libreria",
  },
  {
    slug: "deejay-hugo",
    nome: "Deejay Hugò",
    file: "/brand/loghi/deejay-hugo.png",
    claim: "Feel the music · Live the moment",
    colore: "#ffb400",
    to: "/musica/jc-hugo",
  },
  {
    slug: "jc-hugo",
    nome: "J.C. Hugò",
    file: "/brand/loghi/jc-hugo.png",
    claim: "DJ · VJ · Producer",
    colore: "#ff2b2b",
    to: "/musica/jc-hugo",
  },
  {
    slug: "tbh-records",
    nome: "TBH Records",
    file: "/brand/loghi/tbh-records.png",
    claim: "Publishing · Music production · Etichetta discografica",
    colore: "#b46bff",
    to: "/musica",
  },
  {
    slug: "hugoland",
    nome: "Hugoland Music Festival",
    file: "/brand/loghi/hugoland.png",
    claim: "Music Festival · Fiere internazionali",
    colore: "#33e0ff",
    to: "/hugoland",
  },
];

/** Materiale ufficiale a pagina intera (locandine e copertine reali, non mockup). */
export const MATERIALE_TBH = {
  locandinaDeejayHugo: "/brand/deejay-hugo-locandina.png",
  layoutJcHugo: "/brand/jc-hugo-layout-brand.png",
  serviziDeejayHugo: "/brand/deejay-hugo-servizi.jpg",
  copertinaInfluencity31: "/brand/influencity-n31-cover.jpg",
  layoutLoghiNero: "/brand/loghi-brand-fondo-nero.png",
  layoutLoghiBianco: "/brand/loghi-brand-fondo-bianco.png",
};

export const NOTA_LOGHI =
  "Loghi ufficiali forniti da Touch Business Holding. I singoli marchi sono ritagliati dal layout ufficiale su fondo nero: nessun logo è stato ridisegnato. Se un ritaglio non corrisponde, inviare il file singolo e viene sostituito.";
