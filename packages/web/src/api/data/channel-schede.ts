import { TBH_CONTACTS } from "./catalog";
import { CIRCUITI } from "./rete";
import { SQUADRE } from "./sport";
import { TAPPE_ESTERO } from "./travels";

/**
 * SCHEDE INFORMATIVE DEI CHANNEL — 29/10/2026 (round 15, Claudio: «Schede: descrizione, servizi, telefono,
 * email, social, Maps e indicazioni»).
 *
 * La SCHEDA (informazioni) è separata dal PALINSESTO (contenuti in onda): qui solo dati già presenti e
 * verificati nel sito, ciascuno con la sua fonte. Un campo senza dato resta vuoto e la scheda mostra
 * «da fornire». Nessun indirizzo, telefono, social o sito inventato.
 *
 * In Regia (/allestimento/channel → «Scheda informativa») ogni campo si può sovrascrivere: il valore
 * della Regia (chiave condivisa cms_v1:canali) vale su anteprima e www e prevale su quello di base.
 */

export type LinkScheda = { nome: string; href: string };
export type GruppoLinkScheda = { titolo: string; voci: (LinkScheda & { nota?: string; maps?: string | null })[] };

export type InfoSchedaChannel = {
  descrizione: string | null;
  servizi: string[];
  telefono: string | null;
  whatsapp: string | null;
  email: string | null;
  social: LinkScheda[];
  indirizzo: string | null;
  /** Link Google Maps: solo se costruito da un indirizzo vero o inserito in Regia. */
  maps: string | null;
  /** Indicazioni testuali (come arrivare, orari d'accesso…): solo se fornite. */
  indicazioni: string | null;
  /** Sito ufficiale VERO per «Apri il Sito»; null = pulsante non attivo. */
  sito: string | null;
  /** Da dove arrivano i dati di base. */
  fonte: string;
  /** Gruppi di collegamenti a pagine esistenti (es. hub Touch Travels). */
  gruppi: GruppoLinkScheda[];
};

export const mapsDa = (q: string) => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`;

/** Contatti centrali del gruppo (catalog.ts TBH_CONTACTS + Instagram ufficiale @touchbusinessholding). */
export const CONTATTI_CENTRALI_TBH = {
  telefono: `${TBH_CONTACTS.telItalia} · estero ${TBH_CONTACTS.telEstero}`,
  /** Link wa.me (il numero è quello della pagina Contatti). */
  whatsapp: TBH_CONTACTS.whatsappUrl,
  email: TBH_CONTACTS.email,
  social: [{ nome: "Instagram · @touchbusinessholding", href: "https://www.instagram.com/touchbusinessholding/" }],
};

const vuota = (fonte: string): InfoSchedaChannel => ({
  descrizione: null,
  servizi: [],
  telefono: null,
  whatsapp: null,
  email: null,
  social: [],
  indirizzo: null,
  maps: null,
  indicazioni: null,
  sito: null,
  fonte,
  gruppi: [],
});

/** Base per i Channel del gruppo TBH: contatti centrali (reali) + i dati propri del Channel. */
const tbh = (x: Partial<InfoSchedaChannel>): InfoSchedaChannel => ({
  ...vuota("Contatti centrali Touch Business Holding (pagina Contatti)."),
  telefono: CONTATTI_CENTRALI_TBH.telefono,
  whatsapp: CONTATTI_CENTRALI_TBH.whatsapp,
  email: CONTATTI_CENTRALI_TBH.email,
  social: CONTATTI_CENTRALI_TBH.social,
  ...x,
});

/* ── Touch Travels: hub verso pagine GIÀ esistenti (nessun Channel territoriale nuovo) ── */
const campiSquadre = SQUADRE.filter((s) => s.campo).map((s) => ({
  nome: `${s.nomeBreve ?? s.nome} · ${s.campo}`,
  href: `/sport/squadre/${s.slug}`,
  maps: mapsDa(s.campo!),
}));
const tappeLogistiche = TAPPE_ESTERO.map((t) => ({
  nome: `${t.citta} (${t.paese}) · ${t.nome}`,
  href: "/eventi/fiere-internazionali",
  nota: t.indirizzo ? t.indirizzo : t.puntoRiferimento ? `Riferimento provvisorio: ${t.puntoRiferimento} (non è un indirizzo verificato)` : "Indirizzo da verificare",
  maps: t.indirizzo ? mapsDa(t.indirizzo) : t.puntoRiferimento ? mapsDa(t.puntoRiferimento) : null,
}));

export const GRUPPI_TRAVELS: GruppoLinkScheda[] = [
  {
    titolo: "SCHEDE CITTÀ",
    voci: [
      { nome: "Rimini · dove dormire, mangiare e divertirsi", href: "/territorio/rimini/dove-dormire-mangiare-divertirsi" },
      { nome: "Sanremo · portale della città", href: "/sanremo" },
      { nome: "Mappa del territorio TBH", href: "/territorio/mappa" },
      { nome: "Spazi e territori", href: "/territorio/spazi" },
    ],
  },
  {
    titolo: "HOSPITALITY",
    voci: [
      { nome: "Hospitality · tutte le categorie", href: "/hospitality" },
      { nome: "Hotel", href: "/hospitality/hotel" },
      { nome: "Ristoranti", href: "/hospitality/ristoranti" },
      { nome: "Esperienze", href: "/hospitality/esperienze" },
      { nome: "Transfer", href: "/hospitality/transfer" },
    ],
  },
  {
    titolo: "FIERE",
    voci: [
      { nome: "Fiere internazionali e tappe estere", href: "/eventi/fiere-internazionali" },
      { nome: "Touch Hugoland", href: "/hugoland" },
    ],
  },
  {
    titolo: "CIRCUITI",
    voci: [
      { nome: "Cremona Circuit 2026", href: "/cremona-circuit-2026", maps: mapsDa("Cremona Circuit") },
      { nome: "Touch Motorsport · circuiti e campionati", href: "/sport/motorsport" },
      { nome: "Circuito TBH · rete delle attività convenzionate", href: "/network/circuito" },
    ],
  },
  { titolo: "CAMPI SPORTIVI", voci: campiSquadre },
  { titolo: "TAPPE LOGISTICHE", voci: tappeLogistiche },
];

/** Dati di base per Channel (slug del registro). Chi non è qui ha la scheda base della sua appartenenza. */
const SCHEDE: Record<string, InfoSchedaChannel> = {
  "touch-miss-cool": tbh({
    descrizione:
      "Concorso di bellezza del gruppo TBH, edizione 2027. Si corre su due percorsi paralleli — le tappe live e la versione Touch Miss Cool Web con voto verificato — che confluiscono nella finale ufficiale e nell'assegnazione degli 11 incarichi annuali.",
    servizi: ["Tappe live", "Touch Miss Cool Web · il concorso on line con voto verificato", "Finale ufficiale e 11 incarichi annuali", "Regolamento in 18 articoli e moduli di candidatura"],
  }),
  "touch-project": tbh({
    descrizione: "«Dove i progetti nascono · I sogni diventano realtà» (dal banner approvato il 29/10/2026). Descrizione completa e servizi da fornire.",
  }),
  "touch-hugoland": tbh({
    descrizione:
      "Format di eventi e serate del gruppo TBH, presente anche nella mappa del territorio come luogo del Circuito TBH. Calendario delle date da confermare.",
    servizi: ["Divertimento", "Eventi", "Parco tematico", "Esperienze", "Prenotazioni e informazioni via WhatsApp"],
  }),
  "touch-spotlight": tbh({
    descrizione:
      "Rubrica/inserto interno di Touch Influencity Magazine: mette in vetrina sponsor, partner e aziende con intervista dedicata. Non è una rivista separata.",
    servizi: ["Interviste", "Reportage", "Approfondimenti", "Vetrina e primo piano dentro Touch Influencity Magazine"],
  }),
  "touch-casting": tbh({
    descrizione: "Casting videoclip: partecipa ai prossimi progetti musicali di J.C. Hugò / Touch Music. Oggi nessun casting aperto.",
    servizi: ["Casting videoclip", "Selezioni per cinema, TV e reality (bacheca TBH Lavoro)"],
  }),
  "touch-lavoro": tbh({
    descrizione:
      "Offerte di lavoro reali: Opportunità TBH e annunci di fonti esterne con link originale. Nessuna posizione inventata. Touch Lavoro e Touch Human Resources sono lo stesso Channel.",
    servizi: ["Bacheca annunci", "Candidature (e-mail e moduli online)", "Casting", "Formazione", "Fonti esterne: Centri per l'impiego e Federalberghi", "Per le aziende"],
    email: `lavoro@tibihacca.com · ${TBH_CONTACTS.email}`,
  }),
  "giovanile-rimini-show": tbh({
    descrizione:
      "Format di reality giovanile prodotto dal gruppo (Reality Show Giovanile Rimini). Lo scudetto del Channel è quello originale di Giovanile Rimini, senza marchio TBH.",
    servizi: ["Puntate e partite integrali (archivio in allestimento)", "Staff, giocatori e collaboratori", "Academy e reclutamento giocatori tramite colloqui"],
    social: [{ nome: "YouTube · ASD Giovanile Rimini Football", href: "https://www.youtube.com/@asdgovanileriminifootball7338" }],
    sito: "https://www.giovanilerimini.org/",
    fonte: "Link verificati il 29/08/2026 (sito Giovanili Rimini, YouTube) + contatti centrali TBH.",
  }),
  "touch-reality-show": tbh({
    descrizione:
      "Touch Reality Show Channel: Academy e reclutamento dei giocatori attraverso colloqui. Le candidature si inviano con il modulo online TBH Lavoro oppure via e-mail.",
    servizi: ["Academy", "Reclutamento giocatori tramite colloqui", "Candidature con modulo online TBH Lavoro"],
    email: `lavoro@tibihacca.com · ${TBH_CONTACTS.email}`,
  }),
  "touch-motorsport": tbh({
    descrizione: "Motorsport: circuiti, campionati e partner tecnici seguiti dal gruppo, con la Cremona Circuit 2026.",
    servizi: ["Circuiti", "Campionati", "Partner tecnici", "Cremona Circuit 2026"],
    gruppi: [
      {
        titolo: "CIRCUITI",
        voci: CIRCUITI.map((c) => ({ nome: `${c.nome} · ${c.citta}`, href: c.sito ?? "/sport/motorsport", nota: c.sito ? "Sito ufficiale del circuito" : "Sito ufficiale non indicato", maps: mapsDa(`${c.nome} ${c.citta}`) })),
      },
    ],
  }),
  "touch-travels": tbh({
    descrizione:
      "Touch Travels: fiere internazionali, tappe estere, hospitality e logistica del gruppo. Collega le schede città, l'hospitality, le fiere, i circuiti, i campi e le tappe già presenti nel sito.",
    servizi: ["Schede città", "Hospitality", "Fiere", "Circuiti", "Campi sportivi", "Tappe logistiche"],
    gruppi: GRUPPI_TRAVELS,
  }),
};

/** Scheda di base di un Channel: dati propri se presenti, altrimenti contatti centrali (solo TBH) o vuota. */
export function schedaBaseChannel(slug: string, appartenenza: string): InfoSchedaChannel {
  return SCHEDE[slug] ?? (appartenenza === "TBH" ? tbh({}) : vuota("Nessun dato fornito."));
}
