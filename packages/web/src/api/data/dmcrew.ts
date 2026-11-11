/**
 * DM CREW — «figurine» degli operatori e dei giornalisti che seguono le squadre.
 *
 * REGOLE RISPETTATE:
 * · nessun nome inventato: compaiono SOLO le persone il cui ruolo è già verificato;
 * · nessuna foto inventata o generata: `foto` è null finché non arriva lo scatto reale,
 *   la figurina mostra il NOME PER ESTESO e il ruolo (mai iniziali o monogrammi);
 * · DM Comunicazioni è media partner AUTONOMO, non una società del gruppo TBH;
 * · i posti ancora da assegnare restano dichiarati come tali: nessun riempimento fittizio.
 */

export type FigurinaCrew = {
  slug: string;
  /** Nome e cognome per esteso. */
  nome: string;
  /** Ruolo verificato. Niente titoli gonfiati. */
  ruolo: string;
  /** Foto reale in /public/crew. null = da ricevere. */
  foto: string | null;
  /** Squadre o programmi realmente seguiti. */
  segue: string[];
  /** Link ufficiali verificati. */
  esterni: { etichetta: string; url: string }[];
  note: string | null;
  /** Numero figurina: solo ordine di pubblicazione, nessuna classifica. */
  numero: number;
};

export const DM_CREW: FigurinaCrew[] = [
  {
    slug: "daniele-manuelli",
    nome: "Daniele Manuelli",
    ruolo: "Conduttore e responsabile DM Comunicazioni",
    foto: null,
    segue: [
      "SportUp",
      "Calcio di Rigore",
      "Anteprima SportUp",
      "Repliche su canale 88 (Made in Bo)",
    ],
    esterni: [
      {
        etichetta: "YouTube · Daniele Manuelli Official",
        url: "https://www.youtube.com/@DanieleManuelli1981",
      },
      { etichetta: "Facebook · Daniele Manuelli", url: "https://www.facebook.com/share/17pCJoQvh4" },
      { etichetta: "Facebook · Sport Up Rimini", url: "https://www.facebook.com/sportuprimini" },
    ],
    note: "Referente di DM Comunicazioni, media partner autonomo.",
    numero: 1,
  },
  {
    slug: "claudio-ugolini",
    nome: "Claudio Ugolini",
    ruolo: "Videoperatore",
    foto: null,
    segue: [
      "A.S.D. Verucchio Calcio 1957 — videoperatore ufficiale stagione 2026/27",
      "A.S.D. Victoria 1968 — riprese e produzione video",
      "Collaborazione riprese con DM Comunicazioni",
    ],
    esterni: [],
    note: "Fondatore di Touch Business Holding: collabora alle riprese, DM resta autonoma.",
    numero: 2,
  },
];

/** Posti figurina ancora da assegnare: dichiarati, non riempiti con nomi inventati. */
export const CREW_DA_CONFERMARE = 6;

export const CREW_NOTA =
  "L'album è aperto: operatori, giornalisti, telecronisti e collaboratori vengono pubblicati solo dopo conferma del nome, del ruolo e della foto reale. Nessuna figurina viene generata o ricostruita graficamente.";
