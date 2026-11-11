/**
 * ────────────────────────────────────────────────────────────────────────────────
 * FONTI CALCIO DELLE SQUADRE — «PALINSESTO PARTITE» dei canali squadra (17/10/2026).
 *
 * Richiesta di Claudio del 17/10/2026: «LOGO TUTTO CAMPO · tuttocampo.it ·
 * romagnasport.com · CREA I PALINSESTI CHANNEL».
 *
 * Ogni canale squadra mostra calendario, prossima partita, ultimi risultati e
 * classifica LETTI DAL VIVO su Romagna Sport (lettura lato server, vedi
 * api/lib/romagnasport.ts). Nessun dato si inventa: se la lettura non riesce,
 * il canale scrive «dato da confermare».
 *
 * Codici `gir` e `idSquadra` presi il 17/10/2026 dalle pagine pubbliche di
 * romagnasport.com, stagione 2026/27 (anno=2026), scansione dei 240 gironi.
 *
 * Tutto Campo (tuttocampo.it) risponde 403 alla lettura automatica: si collega
 * soltanto. Gli indirizzi qui sotto sono quelli indicizzati dal motore di
 * ricerca il 17/10/2026 (pagina «Classifica» del girone), nessuno costruito a mano.
 *
 * DISCORDANZE DA CONFERMARE (sport.ts non è stato toccato):
 *  · San Marino Calcio: categoria RISOLTA il 17/10/2026 → Eccellenza girone B
 *    (confermata da Claudio). Resta da confermare il campo: sport.ts dice
 *    Serravalle, Romagna Sport indica «Cattolica Calbi 1 Sintetico».
 *  · Junior Gambettola: nel girone c'è anche una «Gambettola» (id 72) diversa.
 * ────────────────────────────────────────────────────────────────────────────────
 */

export type FonteCalcioSquadra = {
  /** Slug della società (sport.ts / CANALI_TELECOMANDO[].squadra). */
  squadra: string;
  /** Codice girone di Romagna Sport. */
  gir: number;
  /** Codice squadra di Romagna Sport. */
  idSquadra: number;
  /** Nome del campionato come lo scrive Romagna Sport (controllo, la pagina lo rilegge). */
  campionato: string;
  /** Pagina «Classifica» del girone su Tutto Campo (solo collegamento). */
  tuttocampo: string;
};

export const ANNO_STAGIONE = 2026;
export const ROMAGNA_SPORT = "https://www.romagnasport.com";
export const TUTTO_CAMPO = "https://www.tuttocampo.it";

const TC_1A_H = "https://www.tuttocampo.it/EmiliaRomagna/PrimaCategoria/GironeH/Classifica";
const TC_ECC_B = "https://www.tuttocampo.it/EmiliaRomagna/Eccellenza/GironeB/Classifica";

export const FONTI_CALCIO_SQUADRE: FonteCalcioSquadra[] = [
  { squadra: "verucchio", gir: 7, idSquadra: 22, campionato: "1a Categoria Girone H", tuttocampo: TC_1A_H },
  { squadra: "victoria-1968", gir: 7, idSquadra: 15696, campionato: "1a Categoria Girone H", tuttocampo: TC_1A_H },
  { squadra: "vis-novafeltria", gir: 4, idSquadra: 4137, campionato: "Eccellenza Girone B", tuttocampo: TC_ECC_B },
  { squadra: "pietracuta", gir: 4, idSquadra: 83, campionato: "Eccellenza Girone B", tuttocampo: TC_ECC_B },
  {
    squadra: "tropical-coriano",
    gir: 165,
    idSquadra: 51,
    campionato: "Serie D Girone D",
    tuttocampo: "https://www.tuttocampo.it/Italia/SerieD/GironeD/Classifica",
  },
  { squadra: "san-marino-calcio", gir: 4, idSquadra: 14323, campionato: "Eccellenza Girone B", tuttocampo: TC_ECC_B },
  {
    squadra: "gabicce-gradara",
    gir: 218,
    idSquadra: 2334,
    campionato: "Promozione A Marche",
    tuttocampo: "https://www.tuttocampo.it/Marche/Promozione/GironeA/Classifica",
  },
  {
    squadra: "bellaria-igea-marina",
    gir: 5,
    idSquadra: 41,
    campionato: "Promozione Girone D",
    tuttocampo: "https://www.tuttocampo.it/EmiliaRomagna/Promozione/GironeD/Classifica",
  },
  { squadra: "junior-gambettola", gir: 7, idSquadra: 11632, campionato: "1a Categoria Girone H", tuttocampo: TC_1A_H },
  { squadra: "rimini", gir: 4, idSquadra: 113, campionato: "Eccellenza Girone B", tuttocampo: TC_ECC_B },
];

export function fonteCalcioSquadra(squadra: string) {
  return FONTI_CALCIO_SQUADRE.find((f) => f.squadra === squadra) ?? null;
}

/** Loghi delle fonti, ritagliati dagli ORIGINALI inviati il 17/10/2026: in anteprima, da approvare. */
export const LOGHI_FONTI = {
  romagnaSport: "/brand/fonti/romagnasport.png",
  tuttoCampo: "/brand/fonti/tuttocampo.png",
} as const;
