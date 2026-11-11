/* ────────────────────────────────────────────────────────────────────────────
   «DAL CIRCUITO TBH» NEI CANALI — ordine di Claudio del 04/10/2026:
   «Sì, procedi così» + «Dividi per genere e interesse».

   Ogni canale del palinsesto mostra le anteprime-pulsante (ANTEPRIMA → PULSANTE →
   SCHEDA) delle realtà che gli appartengono davvero, divise per GENERE. Regole:
     · solo materiale ufficiale già in public/: nessun logo ricreato o generato;
     · ogni voce apre la SUA scheda specifica, mai una homepage o una pagina vuota;
     · appartenenza reale (TBH, DM, Touch Plaza, esterno): mai inventata;
     · dove il logo manca resta il nome per esteso con «in allestimento»;
     · un canale senza materiale vero scrive «In allestimento · aggiornamento continuo».

   Le voci si risolvono nella pagina (components/canale-circuito.tsx): società e
   attività dal catalogo (stesso dato della directory), articoli da Touch Plaza.
   ──────────────────────────────────────────────────────────────────────────── */

import { LOGHI_CHANNEL } from "../../api/data/loghi-channel";

/** Annunci della Bacheca Lavoro TBH: locandina ufficiale + ancora in bacheca. */
export type AnnuncioBacheca = { id: string; nome: string; sottotitolo: string; locandina: string; ancora: string };

export const ANNUNCI_BACHECA: AnnuncioBacheca[] = [
  { id: "3-collaboratori", nome: "Cerchiamo 3 nuovi collaboratori", sottotitolo: "Bacheca lavoro", locandina: "/lavoro/3-collaboratori/entra-nel-team.jpg", ancora: "cerchiamo-3-collaboratori" },
  { id: "fissaggio-appuntamenti", nome: "Commerciale Fissaggio Appuntamenti", sottotitolo: "Bacheca lavoro", locandina: "/lavoro/fissaggio-appuntamenti/cerchiamo-commerciali.jpg", ancora: "commerciale-fissaggio-appuntamenti" },
  { id: "addette-b2b", nome: "Addette Commerciali B2B", sottotitolo: "Bacheca lavoro", locandina: "/lavoro/addette-b2b/locandina.jpg", ancora: "addette-commerciali-b2b" },
  { id: "ballerine-jc-hugo", nome: "Cercasi 4 ballerine · crew di J.C. Hugò", sottotitolo: "Casting", locandina: "/lavoro/ballerine-jc-hugo/locandina.jpg", ancora: "casting-ballerine-jc-hugo" },
  { id: "casting-inviate", nome: "Casting Inviate 2026-2027", sottotitolo: "Casting", locandina: "/lavoro/casting-inviate/locandina-principale.jpg", ancora: "casting-inviate-2026-2027" },
  { id: "videomaker", nome: "Ricerca Videomaker 2026/2027", sottotitolo: "Bacheca lavoro", locandina: "/lavoro/videomaker/videomaker-eventi-sportivo.jpg", ancora: "ricerca-videomaker-2026-2027" },
  { id: "assistente-produzione", nome: "Assistente di produzione", sottotitolo: "Bacheca lavoro", locandina: "/lavoro/assistente-produzione/locandina.jpg", ancora: "assistente-di-produzione" },
];

/** Marchi del gruppo con pagina propria ma senza codice societario. */
export type MarchioCircuito = { id: string; nome: string; sottotitolo: string; logo: string; pagina: string; circuito: "tbh" | "dm" };

export const MARCHI_CIRCUITO: MarchioCircuito[] = [
  { id: "tbh-records", nome: "TBH Records", sottotitolo: "Musica", logo: "/brand/loghi/tbh-records.png", pagina: "/musica", circuito: "tbh" },
  { id: "jc-hugo", nome: "J.C. Hugò", sottotitolo: "Artista", logo: "/brand/loghi/jc-hugo.png", pagina: "/musica/jc-hugo", circuito: "tbh" },
  { id: "hugoland", nome: "Hugoland Music Festival", sottotitolo: "Entertainment", logo: "/brand/loghi/hugoland.png", pagina: "/hugoland", circuito: "tbh" },
  { id: "hvs", nome: "Touch High Visibility Scout", sottotitolo: "Visibilità", logo: "/brand/loghi/hvs-master.png", pagina: "/hvs", circuito: "tbh" },
  /* Media partner, non società TBH: appartenenza DM. */
  { id: "dm", nome: "DM Comunicazioni", sottotitolo: "Media partner", logo: LOGHI_CHANNEL["dm"]!.src, pagina: "/dm", circuito: "dm" },
];

/** Società sportive seguite: stemma reale in /public/teams + pagina squadra. */
export const SQUADRE_SEGUITE = [
  { id: "rimini", nome: "Rimini", logo: LOGHI_CHANNEL["rimini-calcio"]!.src, pagina: "/sport/squadre/rimini" },
  { id: "verucchio", nome: "Verucchio 1957", logo: LOGHI_CHANNEL["verucchio"]!.src, pagina: "/sport/squadre/verucchio" },
  { id: "victoria-1968", nome: "Victoria 1968", logo: LOGHI_CHANNEL["victoria"]!.src, pagina: "/sport/squadre/victoria-1968" },
  { id: "vis-novafeltria", nome: "Vis Novafeltria", logo: LOGHI_CHANNEL["vis-novafeltria"]!.src, pagina: "/sport/squadre/vis-novafeltria" },
  { id: "pietracuta", nome: "Pietracuta", logo: LOGHI_CHANNEL["pietracuta"]!.src, pagina: "/sport/squadre/pietracuta" },
  { id: "san-marino-calcio", nome: "San Marino Calcio", logo: LOGHI_CHANNEL["san-marino"]!.src, pagina: "/sport/squadre/san-marino-calcio" },
  { id: "tropical-coriano", nome: "Tropical Coriano", logo: LOGHI_CHANNEL["tropical-coriano"]!.src, pagina: "/sport/squadre/tropical-coriano" },
  { id: "gabicce-gradara", nome: "Gabicce Gradara", logo: LOGHI_CHANNEL["gabicce-gradara"]!.src, pagina: "/sport/squadre/gabicce-gradara" },
  { id: "bellaria-igea-marina", nome: "Bellaria Igea Marina", logo: LOGHI_CHANNEL["bellaria-igea-marina"]!.src, pagina: "/sport/squadre/bellaria-igea-marina" },
] as const;

/**
 * Una voce del gruppo di genere:
 *   · societa:<codice>  → società/attività del catalogo (kit, logo, scheda /tbh/societa/…)
 *   · marchio:<id>      → MARCHI_CIRCUITO
 *   · annuncio:<id>     → ANNUNCI_BACHECA
 *   · squadra:<id>      → SQUADRE_SEGUITE
 *   · gruppo            → capogruppo + società nell'ordine di Claudio (ORDINE_GRUPPO)
 *   · squadre           → tutte le società sportive seguite
 */
export type RifVoce =
  | `societa:${string}`
  | `marchio:${string}`
  | `annuncio:${string}`
  | `squadra:${string}`
  | "gruppo"
  | "squadre";

export type GruppoGenere = {
  genere: string;
  voci?: RifVoce[];
  /** Articoli Touch Plaza: per categoria del negozio o per slug precisi.
   *  `{}` = tutti in una fila; `tutteLeCategorie` = una fila per categoria del negozio. */
  prodotti?: { categoria?: string; slug?: string[]; tutteLeCategorie?: boolean };
};

const SERVIZI: RifVoce[] = ["societa:TBH-005", "societa:TBH-007", "societa:TBH-A03", "societa:TBH-B04", "societa:TBH-B09", "societa:TBH-B11"];
const HOSPITALITY: RifVoce[] = ["societa:TBH-A01", "societa:TBH-A09", "societa:TBH-A16", "societa:TBH-B05", "societa:TBH-A02"];
const MEDIA: RifVoce[] = ["societa:TBH-002", "societa:TBH-001", "societa:TBH-A12", "societa:TBH-A13", "societa:TBH-A14", "societa:TBH-A15"];
const LAVORO: RifVoce[] = ["annuncio:3-collaboratori", "annuncio:fissaggio-appuntamenti", "annuncio:addette-b2b", "annuncio:videomaker", "annuncio:assistente-produzione"];
const CASTING: RifVoce[] = ["annuncio:casting-inviate", "annuncio:ballerine-jc-hugo"];
const MARSHALL = ["visita-medica-marshall-motorsport", "corso-marshall-auto", "corso-marshall-moto", "corso-marshall-auto-moto"];

/** Chiave = codice interno del canale (mai stampato a schermo). Assente = in allestimento. */
export const CIRCUITO_PER_CANALE: Record<number, GruppoGenere[]> = {
  1: [{ genere: "Business", voci: ["gruppo"] }],
  2: [
    { genere: "Business", voci: ["gruppo", "societa:TBH-001"] },
    { genere: "Media", voci: ["societa:TBH-A12", "societa:TBH-A13", "societa:TBH-A14", "societa:TBH-A15"] },
    { genere: "Entertainment", voci: ["societa:TBH-B01", "societa:TBH-B02", "societa:TBH-B10"] },
    { genere: "Servizi", voci: ["societa:TBH-A03", "societa:TBH-B04", "societa:TBH-B09", "societa:TBH-B11"] },
    { genere: "Hospitality", voci: HOSPITALITY },
    { genere: "Casting", voci: ["societa:TBH-B03"] },
  ],
  3: [
    { genere: "Servizi", voci: SERVIZI },
    { genere: "Hospitality", voci: HOSPITALITY },
    { genere: "Shop", prodotti: { categoria: "Servizi" } },
  ],
  5: [
    { genere: "Business", voci: ["gruppo"] },
    { genere: "Media partner", voci: ["marchio:dm"] },
  ],
  7: [{ genere: "Media partner", voci: ["marchio:dm"] }],
  8: [
    { genere: "Media", voci: MEDIA },
    { genere: "Musica", voci: ["marchio:tbh-records"] },
    { genere: "Media partner", voci: ["marchio:dm"] },
  ],
  9: [
    { genere: "Produzioni", voci: ["societa:TBH-004", "societa:TBH-A15"] },
    { genere: "Musica", voci: ["marchio:tbh-records"] },
  ],
  23: [
    { genere: "Entertainment", voci: ["marchio:jc-hugo", "societa:TBH-B01"] },
    { genere: "Casting", voci: ["annuncio:ballerine-jc-hugo"] },
    { genere: "Shop", prodotti: { slug: ["dj-set-con-crew"] } },
  ],
  10: [
    { genere: "Entertainment", voci: ["marchio:hugoland", "societa:TBH-003", "societa:TBH-B10"] },
    { genere: "Viaggi", voci: ["societa:TBH-A02"] },
  ],
  11: [
    { genere: "Sport", voci: ["societa:TBH-008"] },
    { genere: "Società seguite", voci: ["squadre"] },
    { genere: "Media partner", voci: ["marchio:dm"] },
  ],
  12: [{ genere: "Formazione", prodotti: { slug: MARSHALL } }],
  13: [{ genere: "Visibilità", voci: ["marchio:hvs"] }],
  14: [
    { genere: "Hospitality", voci: HOSPITALITY },
    { genere: "Shop", prodotti: { categoria: "Street Food" } },
  ],
  15: [
    { genere: "Lavoro", voci: LAVORO },
    { genere: "Recruiting", voci: ["societa:TBH-A03"] },
  ],
  16: [
    { genere: "Casting", voci: CASTING },
    { genere: "Talenti", voci: ["societa:TBH-B03"] },
  ],
  18: [{ genere: "Shop", prodotti: { tutteLeCategorie: true } }],
  19: [
    { genere: "Business", voci: ["gruppo"] },
    { genere: "Media", voci: ["societa:TBH-A12", "societa:TBH-A13", "societa:TBH-A14", "societa:TBH-A15"] },
    { genere: "Entertainment", voci: ["societa:TBH-B01", "societa:TBH-B02", "societa:TBH-B10"] },
    { genere: "Servizi", voci: ["societa:TBH-A03", "societa:TBH-B04", "societa:TBH-B09", "societa:TBH-B11"] },
    { genere: "Hospitality", voci: HOSPITALITY },
    { genere: "Media partner", voci: ["marchio:dm"] },
  ],
  20: [{ genere: "Fashion", voci: ["societa:TBH-B10", "societa:TBH-006"] }],
  99: [{ genere: "Business", voci: ["gruppo"] }],
};

export function circuitoDelCanale(numero: number): GruppoGenere[] {
  return CIRCUITO_PER_CANALE[numero] ?? [];
}
