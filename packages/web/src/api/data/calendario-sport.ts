/**
 * CALENDARIO SPORT TBH — calendario UNICO ufficiale (ordine di Claudio del 15/09/2026).
 *
 * Regole applicate alla lettera:
 * - un solo calendario per tutto: partite, tornei, dirette, riprese, interviste, programmi DM,
 *   eventi, tappe, motorsport. Nessun calendario separato.
 * - quattro stati e solo questi: CONFERMATO · IN PROGRAMMAZIONE · IN VALUTAZIONE · CONCLUSO.
 *   Ciò che è soltanto possibile NON viene presentato come confermato.
 * - nessuna data, età, categoria o denominazione inventata: dove il dato manca resta «da definire».
 * - quando arrivano nuove informazioni si aggiorna QUESTA scheda, non se ne crea una seconda.
 */

export type StatoEvento = "CONFERMATO" | "IN PROGRAMMAZIONE" | "IN VALUTAZIONE" | "CONCLUSO";

/** I filtri del calendario sono esattamente quattro: TUTTO + queste tre categorie. */
export type CategoriaEvento = "CALCIO" | "PROGRAMMI" | "MOTORSPORT";

export type EventoSport = {
  id: string;
  /** Chiave di ordinamento cronologico (YYYY-MM), non mostrata. */
  ordine: string;
  /** Data o periodo, come comunicato: non si stringe a una data precisa se non c'è. */
  periodo: string;
  titolo: string;
  localita: string | null;
  categoria: CategoriaEvento;
  stato: StatoEvento;
  descrizione: string;
  /** Categorie coinvolte: solo la dicitura fornita, nessuna fascia d'età aggiunta. */
  categorieCoinvolte: string | null;
  /** Link ai dettagli: presente SOLO se esistono davvero dettagli in più. */
  dettagli: string | null;
  /** Iniziativa collegata: la scheda richiama l'altra invece di ripetere l'evento. */
  collegatoA: string | null;
  /** Badge «COLLABORAZIONE DM» sugli appuntamenti prodotti con il media partner. */
  dm: boolean;
  /** Ricorrenza settimanale (solo programmi TV). */
  ricorrenza: string | null;
};

export const EVENTI_SPORT: EventoSport[] = [
  {
    /* EICMA Italian Round del Mondiale Superbike al Cremona Circuit: date, denominazione e
       sede verificate il 15/09/2026 sulle fonti ufficiali (worldsbk.com e cremonacircuit.it).
       TBH è presente con il presidio operatori: i dettagli stanno sulla pagina dedicata,
       questa scheda non li ripete. */
    id: "worldsbk-cremona-2026",
    ordine: "2026-09",
    periodo: "25 · 26 · 27 settembre 2026",
    titolo: "WORLDSBK — EICMA ITALIAN ROUND AL CREMONA CIRCUIT",
    localita: "Cremona Circuit — San Martino del Lago (CR)",
    categoria: "MOTORSPORT",
    stato: "CONFERMATO",
    descrizione:
      "Round 10 del MOTUL FIM Superbike World Championship al Cremona Circuit. TBH è presente con il presidio operatori dal 24 al 27 settembre: mappa delle aree, parcheggi, paddock, Cremona Village, punti ristoro, tribune, biglietti e modulo di accredito lavoro sono sulla pagina dedicata.",
    categorieCoinvolte: null,
    dettagli: "/cremona-circuit-2026",
    collegatoA: null,
    dm: false,
    ricorrenza: null,
  },
  {
    id: "verucchio-dicembre-2026",
    ordine: "2026-12",
    periodo: "Dicembre 2026",
    titolo: "POSSIBILE TAPPA SPORTIVA A VERUCCHIO",
    localita: "Verucchio",
    categoria: "CALCIO",
    stato: "IN VALUTAZIONE",
    descrizione:
      "Possibile appuntamento sportivo TBH a Verucchio previsto per dicembre 2026. Programma, categorie, impianto, date e modalità di partecipazione saranno pubblicati dopo la conferma.",
    categorieCoinvolte: null,
    dettagli: null,
    collegatoA: null,
    dm: false,
    ricorrenza: null,
  },
  {
    id: "verucchio-torneo-giovanile-2027",
    ordine: "2027-04",
    periodo: "Aprile 2027",
    titolo: "TORNEO DI CALCIO GIOVANILE A VERUCCHIO",
    localita: "Verucchio",
    categoria: "CALCIO",
    stato: "IN PROGRAMMAZIONE",
    descrizione:
      "Progetto di torneo a Verucchio aperto alle diverse categorie del calcio giovanile, a partire dai Primi Calci e proseguendo con le categorie successive. Date, categorie definitive, campi, iscrizioni e calendario saranno comunicati dopo la conferma organizzativa.",
    categorieCoinvolte: "Dai Primi Calci alle categorie successive",
    dettagli: null,
    collegatoA: null,
    dm: false,
    ricorrenza: null,
  },
  {
    /* Stessa iniziativa del torneo di aprile: scheda collegata, NON evento ripetuto.
       Non viene chiamato qualificazione, selezione o finale finché non è confermato. */
    id: "verucchio-progetto-spagna",
    ordine: "2027-04",
    periodo: "Data da definire",
    titolo: "TORNEO A VERUCCHIO — PROGETTO SPAGNA",
    localita: "Verucchio",
    categoria: "CALCIO",
    stato: "IN VALUTAZIONE",
    descrizione:
      "Possibile torneo o appuntamento calcistico organizzato a Verucchio e collegato al progetto sportivo in Spagna. La formula, le categorie coinvolte e le modalità di accesso alla tappa spagnola devono essere pubblicate soltanto dopo conferma.",
    categorieCoinvolte: null,
    dettagli: null,
    collegatoA: "verucchio-torneo-giovanile-2027",
    dm: false,
    ricorrenza: null,
  },
  {
    id: "verucchio-estate-2027",
    ordine: "2027-07",
    periodo: "Estate 2027",
    titolo: "POSSIBILE TAPPA ESTIVA A VERUCCHIO",
    localita: "Verucchio",
    categoria: "CALCIO",
    stato: "IN VALUTAZIONE",
    descrizione:
      "Possibile nuova tappa sportiva a Verucchio durante l'estate 2027. Data, formula, categorie, partecipanti e programma sono ancora da definire.",
    categorieCoinvolte: null,
    dettagli: null,
    collegatoA: null,
    dm: false,
    ricorrenza: null,
  },
];

/** I quattro filtri del calendario, nell'ordine chiesto da Claudio. */
export const FILTRI_CALENDARIO = ["TUTTO", "CALCIO", "PROGRAMMI", "MOTORSPORT"] as const;

/** Nota unica del calendario: spiega gli stati senza ripetere i contenuti delle schede. */
export const NOTA_CALENDARIO =
  "Questo è il calendario unico dello sport TBH: partite, tornei, dirette, riprese, interviste, programmi DM, eventi, tappe e motorsport stanno qui. Gli stati sono quattro — CONFERMATO, IN PROGRAMMAZIONE, IN VALUTAZIONE, CONCLUSO — e non presentiamo come confermato ciò che è soltanto possibile. Ogni novità aggiorna la scheda esistente: nessun doppione.";
