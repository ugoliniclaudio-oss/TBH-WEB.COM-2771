/* ────────────────────────────────────────────────────────────────────────────
   ANTEPRIME REALI — 06/09/2026.

   Ordine di Claudio: «almeno la prima pagina rendi visibile ciò che abbiamo,
   vedere le anteprime dove ci sono i link, o le immagini dei brand o stemmi
   squadre».

   Qui c'è SOLO materiale che esiste davvero in packages/web/public, con la sua
   destinazione già attiva nel sito. Regole rispettate:
     · nessun logo ricreato, nessuna immagine finta, nessun file inventato;
     · un logo si abbina a un canale SOLO quando è il marchio di quel canale.
       Dove il marchio non c'è, il canale tiene il suo slot numerato: è la verità,
       non un buco da riempire con un logo di un'altra società;
     · ogni tessera ha una destinazione interna esistente: nessun bottone morto.

   Le 24 immagini ufficiali dei canali NON sono ancora arrivate (domanda 121):
   quando arrivano prendono il posto dello slot senza toccare la struttura.
   ──────────────────────────────────────────────────────────────────────────── */

import { LOGHI_CHANNEL } from "../../api/data/loghi-channel";

export type Anteprima = {
  src: string;
  titolo: string;
  sottotitolo: string;
  to: string;
  colore: string;
};

/** Marchi del gruppo: file reale in /brand/loghi + pagina già attiva. */
export const ANTEPRIME_BRAND: Anteprima[] = [
  {
    src: "/brand/loghi/tbh-tondo.png",
    titolo: "Touch Business Holding",
    sottotitolo: "Il gruppo",
    to: "/tbh/societa/touch-business-holding",
    colore: "#d7ff00",
  },
  {
    src: "/brand/loghi/tbh-master-neon.png",
    titolo: "TBH Master",
    sottotitolo: "Marchio",
    to: "/tbh/brand-personalizzazioni",
    colore: "#d7ff00",
  },
  {
    src: "/brand/loghi/touch-production.png",
    titolo: "Touch Production",
    sottotitolo: "Produzioni",
    to: "/tbh/societa/tbh-004",
    colore: "#ff5bb0",
  },
  {
    src: "/brand/loghi/touch-cinema-studios.png",
    titolo: "Touch Cinema Studios",
    sottotitolo: "Produzioni",
    to: "/tbh/produzioni",
    colore: "#ff5bb0",
  },
  {
    src: "/brand/loghi/touch-metropolitan-media.png",
    titolo: "Touch Metropolitan Media",
    sottotitolo: "Media",
    to: "/tbh/societa/tbh-002",
    colore: "#9dff3c",
  },
  {
    src: LOGHI_CHANNEL["touch-tv"]!.src,
    titolo: "Touch TV",
    sottotitolo: "TV",
    to: "/media/streaming",
    colore: "#9dff3c",
  },
  {
    src: "/brand/loghi/touch-music-tv.png",
    titolo: "Touch Music TV",
    sottotitolo: "TV musicale",
    to: "/media/radio-tv",
    colore: "#b46bff",
  },
  {
    src: "/brand/loghi/touch-music-radio.png",
    titolo: "Touch Music Radio",
    sottotitolo: "Radio",
    to: "/media/radio-tv",
    colore: "#b46bff",
  },
  {
    src: "/brand/loghi/tbh-records.png",
    titolo: "TBH Records",
    sottotitolo: "Musica",
    to: "/musica",
    colore: "#b46bff",
  },
  {
    src: "/brand/loghi/deejay-hugo.png",
    titolo: "Deejay Hugò",
    sottotitolo: "Artista",
    to: "/musica/jc-hugo",
    colore: "#b46bff",
  },
  {
    src: "/brand/loghi/jc-hugo.png",
    titolo: "J.C. Hugò",
    sottotitolo: "Artista",
    to: "/musica/jc-hugo",
    colore: "#b46bff",
  },
  {
    src: "/brand/loghi/hugoland.png",
    titolo: "Hugoland",
    sottotitolo: "Entertainment",
    to: "/hugoland",
    colore: "#33e0ff",
  },
  {
    src: "/brand/loghi/hvs-master.png",
    titolo: "Touch High Visibility Scout",
    sottotitolo: "Visibilità",
    to: "/hvs",
    colore: "#d7ff00",
  },
  {
    src: LOGHI_CHANNEL["dm"]!.src,
    titolo: "DM Comunicazioni",
    sottotitolo: "Media partner",
    to: "/dm",
    colore: "#ff2b2b",
  },
];

/** Stemmi squadra: loghi ORIGINALI approvati il 18/10/2026 (loghi-channel.ts), pagina /sport/squadre/<slug>. */
export const ANTEPRIME_STEMMI: Anteprima[] = [
  { src: LOGHI_CHANNEL["rimini-calcio"]!.src, titolo: "Rimini", sottotitolo: "Territorio", to: "/sport/squadre/rimini", colore: "#2f7bff" },
  { src: LOGHI_CHANNEL["verucchio"]!.src, titolo: "Verucchio 1957", sottotitolo: "Squadra", to: "/sport/squadre/verucchio", colore: "#2f7bff" },
  { src: LOGHI_CHANNEL["victoria"]!.src, titolo: "Victoria 1968", sottotitolo: "Squadra", to: "/sport/squadre/victoria-1968", colore: "#2f7bff" },
  { src: LOGHI_CHANNEL["vis-novafeltria"]!.src, titolo: "Vis Novafeltria", sottotitolo: "Squadra", to: "/sport/squadre/vis-novafeltria", colore: "#2f7bff" },
  { src: LOGHI_CHANNEL["pietracuta"]!.src, titolo: "Pietracuta", sottotitolo: "Squadra", to: "/sport/squadre/pietracuta", colore: "#2f7bff" },
  { src: LOGHI_CHANNEL["san-marino"]!.src, titolo: "San Marino Calcio", sottotitolo: "Squadra", to: "/sport/squadre/san-marino-calcio", colore: "#2f7bff" },
  { src: LOGHI_CHANNEL["tropical-coriano"]!.src, titolo: "Tropical Coriano", sottotitolo: "Squadra", to: "/sport/squadre/tropical-coriano", colore: "#2f7bff" },
  { src: LOGHI_CHANNEL["gabicce-gradara"]!.src, titolo: "Gabicce Gradara", sottotitolo: "Squadra", to: "/sport/squadre/gabicce-gradara", colore: "#2f7bff" },
  { src: LOGHI_CHANNEL["bellaria-igea-marina"]!.src, titolo: "Bellaria Igea Marina", sottotitolo: "Squadra", to: "/sport/squadre/bellaria-igea-marina", colore: "#2f7bff" },
];

/**
 * LOGO DEL CANALE — solo dove il marchio è davvero quello del canale.
 * I canali che non compaiono qui NON hanno ancora il loro visual: lo slot resta
 * dichiarato in allestimento, senza prestiti da altre società.
 *
 * 28/09/2026 — UNA SOLA LISTA, NON DUE. Questa mappa era scritta due volte (qui
 * e in lib/palinsesto.ts come LOGO_CANALE_PALINSESTO) e si sarebbe disallineata
 * al primo logo nuovo, con l'effetto assurdo di un canale con il logo in Home e
 * senza logo nella guida. Ora l'originale sta nel palinsesto, che è il file
 * MASTER, e qui resta solo il nome storico per non toccare chi lo importa già.
 */

export { LOGO_CANALE_PALINSESTO as LOGO_CANALE } from "./palinsesto";
