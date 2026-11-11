/**
 * SBK CREMONA CIRCUIT 2026 — ricerca personale, 3 squadre operative.
 *
 * Fonte: testo ufficiale e 3 locandine consegnate da Claudio il 05/09/2026.
 * REGOLA: numeri, date, orari e requisiti sono riportati ALLA LETTERA.
 * Compenso, inquadramento e condizioni economiche NON sono nell'annuncio:
 * non li scrive il portale.
 */

export const SBK_EVENTO = "SBK Cremona Circuit 2026";
export const SBK_LUOGO = "Cremona Circuit";
export const SBK_DATE = "24 · 25 · 26 · 27 settembre 2026";
export const SBK_MAPPA = "https://www.google.com/maps/search/?api=1&query=Cremona+Circuit";

/** Ricerca complessiva dichiarata nell'annuncio. */
export const SBK_CANDIDATURE_CERCATE = 100;
export const SBK_OPERATORI_MASSIMI = 61;

export type SquadraSbk = {
  id: string;
  numero: number;
  nome: string;
  turno: "Diurno" | "Notturno";
  cercati: number;
  massimi: number;
  giorni: string;
  ritrovo: string;
  orari: string[];
  mansioni: string[];
  requisito?: string;
  colore: string;
  locandina: string;
};

export const SBK_SQUADRE: SquadraSbk[] = [
  {
    id: "antincendio-livello-3",
    numero: 1,
    nome: "Antincendio Livello 3",
    turno: "Diurno",
    cercati: 30,
    massimi: 20,
    giorni: "25 · 26 · 27 settembre 2026",
    ritrovo: "25 settembre — ritrovo obbligatorio ore 06:00",
    orari: [
      "25 settembre — servizio 07:00 – 18:00",
      "26 settembre — servizio 07:00 – 18:00",
      "27 settembre — servizio 07:00 – 18:00",
    ],
    mansioni: [
      "Operatore Servizio Antincendio — Livello 3",
      "Presidio e supporto alla sicurezza antincendio nelle postazioni assegnate all'interno del Cremona Circuit durante l'evento",
    ],
    requisito:
      "Obbligatorio possedere l'Attestato Antincendio Livello 3, da allegare alla candidatura per visione e verifica.",
    colore: "#ff8a00",
    locandina: "/cremona/sbk-2026-antincendio-livello-3.jpg",
  },
  {
    id: "ordinario-diurno",
    numero: 2,
    nome: "Servizio Ordinario",
    turno: "Diurno",
    cercati: 60,
    massimi: 35,
    giorni: "25 · 26 · 27 settembre 2026",
    ritrovo: "25 settembre — ritrovo obbligatorio ore 06:00",
    orari: [
      "25 settembre — servizio 07:00 – 18:00",
      "26 settembre — servizio 07:00 – 18:00",
      "27 settembre — servizio 07:00 – 18:00",
    ],
    mansioni: [
      "Presidio delle aree assegnate",
      "Controllo accessi e flussi",
      "Supporto organizzativo",
      "Assistenza e indicazioni al pubblico",
      "Rispetto delle disposizioni operative",
      "Permanenza nella postazione assegnata per tutta la durata del servizio",
    ],
    colore: "var(--tbh-gold)",
    locandina: "/cremona/sbk-2026-ordinario-diurno.jpg",
  },
  {
    id: "ordinario-notturno",
    numero: 3,
    nome: "Servizio Ordinario",
    turno: "Notturno",
    cercati: 10,
    massimi: 6,
    giorni: "24 · 25 · 26 settembre 2026",
    ritrovo: "24 settembre — ritrovo obbligatorio ore 17:00",
    orari: [
      "24 settembre — servizio 18:00 – 07:00 del 25 settembre",
      "25 settembre — servizio 18:00 – 07:00 del 26 settembre",
      "26 settembre — servizio 18:00 – 07:00 del 27 settembre",
    ],
    mansioni: [
      "Controllo accessi",
      "Presidio delle aree assegnate",
      "Gestione e controllo dei flussi",
      "Supporto organizzativo",
      "Assistenza e indicazioni",
      "Permanenza presso la postazione assegnata secondo le disposizioni operative",
    ],
    colore: "#33e0ff",
    locandina: "/cremona/sbk-2026-ordinario-notturno.jpg",
  },
];

export const SBK_DIVISA = {
  titolo: "Divisa obbligatoria per tutte le squadre",
  evidenza: "TOTAL BLACK",
  testo: "Presentarsi con abbigliamento completamente nero, ordinato e idoneo al servizio.",
};

export const SBK_APP = {
  titolo: "App SBK",
  voci: [
    "Scaricare l'App SBK sul proprio smartphone prima dell'evento",
    "Mantenerla disponibile durante le giornate operative",
    "Seguire le indicazioni ricevute per accredito e servizio",
  ],
};

export const SBK_DOCUMENTI = {
  base: [
    "Carta d'Identità fronte/retro",
    "Tessera Sanitaria fronte/retro",
    "Codice IBAN",
  ],
  antincendio: [
    "Copia dell'Attestato Antincendio Livello 3, da allegare per visione e verifica",
  ],
  stranieri: [
    "Passaporto",
    "Permesso di Soggiorno fronte/retro in corso di validità",
  ],
};

export const SBK_CONTEGGIO =
  "Il conteggio sarà effettuato sulla base delle ore effettivamente svolte.";

export const SBK_ITER = [
  {
    passo: 1,
    titolo: "Candidatura",
    testo: "Inviare la propria disponibilità indicando la squadra/ruolo per il quale ci si candida.",
  },
  {
    passo: 2,
    titolo: "Invio requisiti",
    testo:
      "Trasmettere tutta la documentazione richiesta, completa e leggibile. Per il servizio Antincendio è obbligatorio allegare anche l'attestato Livello 3.",
  },
  {
    passo: 3,
    titolo: "Conferma",
    testo:
      "La documentazione e i requisiti vengono controllati. I candidati selezionati ricevono la conferma definitiva di partecipazione al servizio.",
  },
  {
    passo: 4,
    titolo: "Assegnazione postazione",
    testo:
      "Dopo la conferma viene comunicata la postazione operativa assegnata all'interno del Cremona Circuit e le relative indicazioni di servizio.",
  },
];

export const SBK_AVVISO =
  "L'invio della candidatura non equivale automaticamente alla conferma del servizio. La procedura va completata interamente: candidatura → requisiti → conferma → postazione. Le disponibilità saranno selezionate in base ai requisiti richiesti e alle necessità organizzative.";
