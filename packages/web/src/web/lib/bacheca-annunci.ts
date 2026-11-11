/**
 * TBH Lavoro — modello, dati TBH e filtri della bacheca annunci (06/10/2026).
 *
 * Regole:
 * - nessun dato inventato: quello che l'annuncio non dice resta null / lista vuota;
 * - le «Opportunità TBH» attive stanno sempre in cima, ma SOLO se passano i filtri;
 * - gli annunci scaduti finiscono soltanto in archivio, senza pulsante di candidatura;
 * - candidature TBH solo a lavoro@tibihacca.com (+ moduli online già esistenti).
 */
import { ANNUNCI_HOTEL_RILEVATI } from "./bacheca-hotel-dati";
import { corrisponde } from "./fonti-lavoro";

export const EMAIL_LAVORO_TBH = "lavoro@tibihacca.com";

export type Provenienza = "tbh" | "esterna";

export interface Luogo {
  regione: string;
  /** Sigla provincia, se determinabile dal testo. */
  provincia: string | null;
  comune: string | null;
}

export interface AnnuncioBacheca {
  slug: string;
  provenienza: Provenienza;
  titolo: string;
  azienda: string;
  /** Località come la scrive l'annuncio. */
  localita: string | null;
  luoghi: Luogo[];
  settore: string;
  ruoli: string[];
  requisiti: string[] | null;
  /** Periodo di lavoro dichiarato, testo libero. */
  periodo: string | null;
  periodi: string[];
  tipoPeriodo: "stagionale" | "continuativo" | null;
  orario: ("full-time" | "part-time")[];
  alloggio: boolean | null;
  contratto: string | null;
  /** Condizioni economiche/contrattuali dichiarate. */
  condizioni: string | null;
  /** AAAA-MM-GG */
  pubblicato: string | null;
  scadenza: string | null;
  fonte: { nome: string; url: string | null };
  scheda: { tipo: "interna"; to: string } | { tipo: "esterna"; url: string };
  contatti: { email: string | null; telefoni: string[]; profilo?: string | null; modulo?: string | null };
  descrizione: string | null;
  immagine: string | null;
  /** Per gli annunci esterni: data in cui li abbiamo letti sulla fonte. */
  rilevato?: string;
  /** Oggetto dell'e-mail di candidatura chiesto dall'annuncio (se diverso da «Candidatura — titolo»). */
  oggettoMail?: string;
}

/* ───────────────────────── Zone adriatiche ───────────────────────── */

export const ZONE_ADRIATICHE: { id: string; nome: string; parole: string[] }[] = [
  { id: "comacchio", nome: "Comacchio e Lidi Ferraresi", parole: ["comacchio", "lidi ferraresi", "lido degli estensi", "lido di spina", "lido delle nazioni", "porto garibaldi"] },
  { id: "ravenna", nome: "Ravenna e lidi", parole: ["ravenna", "marina di ravenna", "punta marina", "lido adriano", "marina romea", "casal borsetti"] },
  { id: "cervia", nome: "Cervia · Milano Marittima", parole: ["cervia", "milano marittima", "pinarella", "tagliata"] },
  { id: "cesenatico", nome: "Cesenatico", parole: ["cesenatico", "valverde", "villamarina"] },
  { id: "gatteo", nome: "Gatteo a Mare", parole: ["gatteo"] },
  { id: "san-mauro", nome: "San Mauro Mare", parole: ["san mauro"] },
  { id: "bellaria", nome: "Bellaria-Igea Marina", parole: ["bellaria", "igea marina"] },
  { id: "rimini-nord", nome: "Rimini Nord (Viserba, Viserbella, Torre Pedrera)", parole: ["viserba", "viserbella", "torre pedrera", "rimini nord", "rivabella"] },
  { id: "rimini", nome: "Rimini", parole: ["rimini"] },
  { id: "riccione", nome: "Riccione", parole: ["riccione"] },
  { id: "misano", nome: "Misano Adriatico", parole: ["misano"] },
  { id: "cattolica", nome: "Cattolica", parole: ["cattolica"] },
  { id: "gabicce", nome: "Gabicce Mare", parole: ["gabicce"] },
  { id: "pesaro", nome: "Pesaro", parole: ["pesaro"] },
  { id: "fano", nome: "Fano", parole: ["fano"] },
  { id: "senigallia", nome: "Senigallia", parole: ["senigallia"] },
  { id: "ancona", nome: "Ancona", parole: ["ancona"] },
  { id: "sirolo-numana", nome: "Sirolo e Numana", parole: ["sirolo", "numana"] },
  { id: "porto-recanati", nome: "Porto Recanati", parole: ["porto recanati"] },
  { id: "marche-sud", nome: "Resto della costa marchigiana", parole: ["civitanova", "porto sant'elpidio", "porto san giorgio", "grottammare", "san benedetto del tronto", "cupra marittima", "pedaso"] },
  { id: "abruzzo", nome: "Costa abruzzese", parole: ["abruzzo", "pescara", "montesilvano", "giulianova", "roseto", "alba adriatica", "tortoreto", "silvi", "vasto", "francavilla al mare", "ortona"] },
  { id: "molise", nome: "Costa molisana", parole: ["molise", "termoli", "campomarino", "petacciato"] },
  { id: "gargano", nome: "Gargano (fino a Peschici e Vieste)", parole: ["gargano", "peschici", "vieste", "rodi garganico", "lesina", "san menaio"] },
];

/** Zone della Riviera Romagnola (per annunci che dichiarano «Romagna» o «Riviera Romagnola»). */
const ZONE_RIVIERA_ROMAGNOLA = [
  "ravenna", "cervia", "cesenatico", "gatteo", "san-mauro", "bellaria", "rimini-nord", "rimini", "riccione", "misano", "cattolica",
];

/** Zone servite da un annuncio, calcolate dal testo dichiarato (località + descrizione). */
export function zoneAnnuncio(a: AnnuncioBacheca): string[] {
  const testo = `${a.localita ?? ""} ${a.descrizione ?? ""} ${a.luoghi.map((l) => l.comune ?? "").join(" ")}`.toLowerCase();
  const z = new Set<string>();
  if (/riviera romagnola|\bromagna\b/.test(testo)) ZONE_RIVIERA_ROMAGNOLA.forEach((x) => z.add(x));
  if (/valmarecchia/.test(testo)) z.add("rimini");
  for (const zona of ZONE_ADRIATICHE) if (zona.parole.some((p) => testo.includes(p))) z.add(zona.id);
  // «Pesaro Urbino» / «Pesaro e Urbino» = provincia: comprende Pesaro, Fano, Gabicce.
  if (/pesaro (e )?urbino/.test(testo)) ["pesaro", "fano", "gabicce"].forEach((x) => z.add(x));
  return [...z];
}

/* ───────────────────────── Annunci TBH ───────────────────────── */

const RN: Luogo = { regione: "Emilia-Romagna", provincia: "RN", comune: "Rimini" };
const ROMAGNA: Luogo[] = [
  { regione: "Emilia-Romagna", provincia: "RN", comune: null },
  { regione: "Emilia-Romagna", provincia: "FC", comune: null },
  { regione: "Emilia-Romagna", provincia: "RA", comune: null },
];
const VALMARECCHIA: Luogo = { regione: "Emilia-Romagna", provincia: "RN", comune: null };
const PU: Luogo = { regione: "Marche", provincia: "PU", comune: null };
const SANREMO: Luogo = { regione: "Liguria", provincia: "IM", comune: "Sanremo" };
const MILANO: Luogo = { regione: "Lombardia", provincia: "MI", comune: "Milano" };
const CREMONA: Luogo = { regione: "Lombardia", provincia: "CR", comune: "Cremona" };
const PADOVA: Luogo = { regione: "Veneto", provincia: "PD", comune: "Padova" };
const ROMA: Luogo = { regione: "Lazio", provincia: "RM", comune: "Roma" };
const SAN_MARINO: Luogo = { regione: "San Marino", provincia: null, comune: "San Marino" };
const CALELLA: Luogo = { regione: "Spagna", provincia: null, comune: "Calella (Barcellona)" };

const TBH = "TBH – Touch Business Holding";
const FONTE_TBH = { nome: "TBH Lavoro", url: null };
const mail = (oggetto: string) => `mailto:${EMAIL_LAVORO_TBH}?subject=${encodeURIComponent(oggetto)}`;
const contattiTbh = (modulo: string | null = null) => ({ email: EMAIL_LAVORO_TBH, telefoni: [], modulo });
const interna = (slug: string) => ({ tipo: "interna" as const, to: `/lavoro-casting/bacheca/${slug}` });

export const ANNUNCI_TBH: AnnuncioBacheca[] = [
  {
    /* 15/10/2026 — «LAVORA CON NOI · Selezioni 2026–2027»: testo e locandina di Claudio,
       usati così come sono. Tre profili + ruolo combinato. Compensi NON indicati in cifre
       dall'annuncio: restano «da concordare / da definire». Candidature solo a
       lavoro@tibihacca.com con l'oggetto richiesto, oppure dal modulo online. */
    slug: "selezioni-audiovisivo-2026-2027",
    provenienza: "tbh",
    titolo: "Lavora con noi — Videomaker • Assistente alle riprese • Commerciale audiovisivo",
    azienda: TBH,
    localita:
      "Rimini e Riviera Romagnola • Valmarecchia • Misano Adriatico • Pesaro-Urbino • San Marino • Padova • Milano • Cremona • Sanremo • Roma • Calella (Spagna)",
    luoghi: [RN, ...ROMAGNA, VALMARECCHIA, PU, SAN_MARINO, PADOVA, MILANO, CREMONA, SANREMO, ROMA, CALELLA],
    settore: "Media e produzione",
    ruoli: ["Videomaker", "Assistente alle riprese", "Commerciale audiovisivo"],
    requisiti: [
      "Videomaker: conoscenza delle tecniche di ripresa, utilizzo di videocamere o attrezzature professionali, autonomia operativa, preferibilmente competenze di montaggio video",
      "Assistente alle riprese: anche senza esperienza avanzata",
    ],
    periodo: "Selezioni per attività 2026–2027, con inserimenti progressivi in base al calendario delle produzioni",
    periodi: [],
    tipoPeriodo: null,
    orario: [],
    alloggio: null,
    contratto: "Collaborazioni occasionali, a progetto o continuative, secondo le necessità operative e l'inquadramento concordato",
    condizioni:
      "Videomaker: da concordare · Assistente: da definire per singola uscita o incarico · Commerciale: provvigionale, da definire",
    pubblicato: "2026-10-15",
    scadenza: null,
    fonte: FONTE_TBH,
    scheda: interna("selezioni-audiovisivo-2026-2027"),
    contatti: contattiTbh("/lavoro-casting/candidati/selezioni-audiovisivo-2026-2027"),
    descrizione:
      "Touch Business Holding amplia la rete di collaboratori per produzioni audiovisive, contenuti digitali, format televisivi, videoclip musicali, servizi sportivi e progetti di comunicazione. Tre opportunità professionali, un unico mondo di produzione.",
    immagine: "/lavoro/selezioni-audiovisivo/locandina.jpg",
    oggettoMail: "CANDIDATURA AUDIOVISIVO TBH — [RUOLO SCELTO]",
  },
  {
    slug: "cerchiamo-videomaker",
    provenienza: "tbh",
    titolo: "Cerchiamo videomaker — riprese, montaggio, lavoro sul set",
    azienda: TBH,
    localita: "Rimini • Calella (Spagna) • Padova • Sanremo",
    luoghi: [RN, CALELLA, PADOVA, SANREMO],
    settore: "Media e produzione",
    ruoli: ["Videomaker"],
    requisiti: null,
    periodo: null,
    periodi: [],
    tipoPeriodo: null,
    orario: [],
    alloggio: null,
    contratto: null,
    condizioni: null,
    pubblicato: "2026-10-06",
    scadenza: null,
    fonte: FONTE_TBH,
    scheda: interna("cerchiamo-videomaker"),
    contatti: contattiTbh(),
    descrizione:
      "Riprese di motorsport e calcio, videoclip musicali, set cinematografici, format TV e radiovisione. Inviare CV, portfolio, città e disponibilità.",
    immagine: "/lavoro/cerchiamo-videomaker/locandina.jpg",
  },
  {
    slug: "tabella-fisso-premi-commerciali",
    provenienza: "tbh",
    titolo: "Content Creator / Assistente Digitale / Segreteria Smart Working — fisso + premi",
    azienda: TBH,
    localita: "Smart working",
    luoghi: [],
    settore: "Commerciale e digitale",
    ruoli: ["Content creator", "Assistente digitale", "Segreteria"],
    requisiti: null,
    periodo: null,
    periodi: [],
    tipoPeriodo: null,
    orario: ["part-time", "full-time"],
    alloggio: null,
    contratto: null,
    condizioni:
      "Fisso mensile garantito da €500 (2 h/giorno) a €2.000 (8 h/giorno), più premi da +€150 a +€1.200+ per 20–300 contatti qualificati. Importi lordi indicativi mensili.",
    pubblicato: "2026-10-06",
    scadenza: null,
    fonte: FONTE_TBH,
    scheda: interna("tabella-fisso-premi-commerciali"),
    contatti: contattiTbh(),
    descrizione: "5 traguardi commerciali: 20 • 50 • 100 • 200 • 300 contatti qualificati.",
    immagine: "/lavoro/tabella-premi/tabella-fisso-premi.jpg",
  },
  {
    slug: "casting-inviate-2026-2027",
    provenienza: "tbh",
    titolo: "Casting inviate 2026–2027 · fino a 14 posizioni",
    azienda: TBH,
    localita: null,
    luoghi: [],
    settore: "Media e produzione",
    ruoli: ["Inviata / collaboratrice audiovisiva"],
    requisiti: null,
    periodo: "Stagione 2026–2027 (una data, più date o tutto il calendario)",
    periodi: ["Stagione 2026/2027"],
    tipoPeriodo: "stagionale",
    orario: [],
    alloggio: null,
    contratto: null,
    condizioni: null,
    pubblicato: "2026-10-04",
    scadenza: null,
    fonte: FONTE_TBH,
    scheda: interna("casting-inviate-2026-2027"),
    contatti: contattiTbh("/lavoro-casting/candidati/casting-inviate-2026-2027"),
    descrizione: "Crew flessibile di inviate e collaboratrici audiovisive, assegnate in base a calendario, località e disponibilità.",
    immagine: "/lavoro/casting-inviate/locandina-principale.jpg",
  },
  {
    slug: "ricerca-videomaker-2026-2027",
    provenienza: "tbh",
    titolo: "Ricerca videomaker sportivo / eventi · stagione 2026/2027",
    azienda: TBH,
    localita: "Rimini · Valmarecchia · Pesaro e Urbino e zone limitrofe",
    luoghi: [RN, VALMARECCHIA, PU],
    settore: "Media e produzione",
    ruoli: ["Videomaker"],
    requisiti: null,
    periodo: "Stagione 2026/2027, inserimento immediato",
    periodi: ["Stagione 2026/2027"],
    tipoPeriodo: "stagionale",
    orario: [],
    alloggio: null,
    contratto: null,
    condizioni: "Quota di ingaggio per l'intera stagione / pacchetto di servizi (importo non indicato nell'annuncio).",
    pubblicato: "2026-10-04",
    scadenza: null,
    fonte: FONTE_TBH,
    scheda: interna("ricerca-videomaker-2026-2027"),
    contatti: contattiTbh("/lavoro-casting/candidati/ricerca-videomaker-2026-2027"),
    descrizione: "Riprese sportive ed eventi, con trasferte in Italia e all'estero.",
    immagine: "/lavoro/videomaker/videomaker-eventi-sportivo.jpg",
  },
  {
    slug: "assistente-di-produzione",
    provenienza: "tbh",
    titolo: "Ricerca assistente di produzione",
    azienda: TBH,
    localita: null,
    luoghi: [],
    settore: "Media e produzione",
    ruoli: ["Assistente di produzione"],
    requisiti: ["Precisione", "Puntualità", "Capacità organizzativa e relazionale", "Autonomia", "Problem solving", "Smartphone, e-mail e strumenti digitali"],
    periodo: null,
    periodi: [],
    tipoPeriodo: "continuativo",
    orario: ["part-time", "full-time"],
    alloggio: null,
    contratto: "Tempo determinato, successivo tempo indeterminato, apprendistato quando applicabile",
    condizioni: "CCNL e livello coerenti con le mansioni; condizioni economiche definite prima dell'assunzione.",
    pubblicato: "2026-10-04",
    scadenza: null,
    fonte: FONTE_TBH,
    scheda: interna("assistente-di-produzione"),
    contatti: contattiTbh("/lavoro-casting/candidati/assistente-di-produzione"),
    descrizione: "Figura stabile per sport, motorsport, eventi, spettacolo, territorio, produzioni audiovisive e musicali.",
    immagine: "/lavoro/assistente-produzione/locandina.jpg",
  },
  {
    slug: "addette-commerciali-b2b",
    provenienza: "tbh",
    titolo: "Addette/i commerciali B2B — presa appuntamenti",
    azienda: TBH,
    localita: null,
    luoghi: [],
    settore: "Commerciale e digitale",
    ruoli: ["Commerciale"],
    requisiti: null,
    periodo: null,
    periodi: [],
    tipoPeriodo: null,
    orario: ["part-time"],
    alloggio: null,
    contratto: "Lavoro subordinato part-time, 30 ore settimanali",
    condizioni: "€1.500 lordi mensili per 14 mensilità (€21.000 lordi annui) + 20% sul valore imponibile dei contratti attribuiti.",
    pubblicato: "2026-10-03",
    scadenza: null,
    fonte: FONTE_TBH,
    scheda: interna("addette-commerciali-b2b"),
    contatti: contattiTbh(),
    descrizione: "Possibilità di lavoro da remoto mediante accordo scritto.",
    immagine: "/lavoro/addette-b2b/locandina.jpg",
  },
  {
    slug: "casting-ballerine-jc-hugo",
    provenienza: "tbh",
    titolo: "Cercasi 4 ballerine — crew videoclip di J.C. Hugò",
    azienda: TBH,
    localita: "Rimini e Riviera Romagnola · Valmarecchia · San Marino · Padova · Milano · Roma · Sanremo",
    luoghi: [RN, ...ROMAGNA, VALMARECCHIA, SAN_MARINO, PADOVA, MILANO, ROMA, SANREMO],
    settore: "Spettacolo ed eventi",
    ruoli: ["Ballerina"],
    requisiti: ["Preparazione nella danza, senso del ritmo, espressività e presenza davanti alla telecamera"],
    periodo: null,
    periodi: [],
    tipoPeriodo: null,
    orario: [],
    alloggio: null,
    contratto: null,
    condizioni: null,
    pubblicato: "2026-10-03",
    scadenza: null,
    fonte: FONTE_TBH,
    scheda: interna("casting-ballerine-jc-hugo"),
    contatti: contattiTbh(),
    descrizione: "Stili commercial, hip hop, modern e proposte creative. Disponibilità e trasferte concordate per ogni produzione.",
    immagine: "/lavoro/ballerine-jc-hugo/locandina.jpg",
  },
  {
    slug: "cerchiamo-3-collaboratori",
    provenienza: "tbh",
    titolo: "Cerchiamo 3 nuovi collaboratori — commerciale e videomaker",
    azienda: TBH,
    localita: null,
    luoghi: [],
    settore: "Media e produzione",
    ruoli: ["Commerciale", "Videomaker"],
    requisiti: ["Serietà, disponibilità, capacità di lavorare con le persone"],
    periodo: null,
    periodi: [],
    tipoPeriodo: null,
    orario: [],
    alloggio: null,
    contratto: null,
    condizioni: null,
    pubblicato: "2026-10-02",
    scadenza: null,
    fonte: FONTE_TBH,
    scheda: interna("cerchiamo-3-collaboratori"),
    contatti: contattiTbh(),
    descrizione: "2 ragazze area commerciale e 1 operatore/operatrice videomaker per media, comunicazione, sport, eventi e produzioni audiovisive.",
    immagine: "/lavoro/3-collaboratori/entra-nel-team.jpg",
  },
  {
    slug: "commerciale-fissaggio-appuntamenti",
    provenienza: "tbh",
    titolo: "Commerciale fissaggio appuntamenti — smart working / tutto il territorio",
    azienda: TBH,
    localita: "In presenza: Romagna, Valmarecchia, Pesaro Urbino · Smart working: Italia e Spagna",
    luoghi: [...ROMAGNA, VALMARECCHIA, PU, CALELLA, RN, SANREMO, MILANO, CREMONA, PADOVA, ROMA],
    settore: "Commerciale e digitale",
    ruoli: ["Commerciale"],
    requisiti: null,
    periodo: null,
    periodi: [],
    tipoPeriodo: null,
    orario: [],
    alloggio: null,
    contratto: null,
    condizioni: "Cinque zone: dalla Zona 5 (€300, 20 appuntamenti, 20%) alla Zona 1 (€1.200, 200 appuntamenti, 30%).",
    pubblicato: "2026-10-02",
    scadenza: null,
    fonte: FONTE_TBH,
    scheda: interna("commerciale-fissaggio-appuntamenti"),
    contatti: contattiTbh(),
    descrizione: "Tutti partono dalla Zona 5: gli appuntamenti determinano lo scatto di livello.",
    immagine: "/lavoro/fissaggio-appuntamenti/cerchiamo-commerciali.jpg",
  },
  {
    slug: "tbh-high-visibility-scout",
    provenienza: "tbh",
    titolo: "Collaboratori e collaboratrici — TBH High Visibility Scout",
    azienda: TBH,
    localita: "On field · smart working · da remoto",
    luoghi: [],
    settore: "Commerciale e digitale",
    ruoli: ["Scout commerciale"],
    requisiti: null,
    periodo: null,
    periodi: [],
    tipoPeriodo: null,
    orario: [],
    alloggio: null,
    contratto: null,
    condizioni: "20 contatti €250 · 50 contatti €500 · 100 contatti €1.000 · +25% di bonus su ogni cliente acquisito.",
    pubblicato: null,
    scadenza: null,
    fonte: FONTE_TBH,
    scheda: { tipo: "interna", to: "/hvs" },
    contatti: contattiTbh(),
    descrizione: "Tu trovi le opportunità, TBH presenta, tratta e chiude.",
    immagine: "/brand/hvs-logo.png",
  },
  {
    slug: "pr-pride-village-2026",
    provenienza: "tbh",
    titolo: "Cerchiamo PR — Pride Village",
    azienda: TBH,
    localita: "Padova · Pride Summer Village",
    luoghi: [PADOVA],
    settore: "Spettacolo ed eventi",
    ruoli: ["PR"],
    requisiti: ["Predisposizione al contatto con il pubblico", "Disponibilità nelle serate evento", "Maggiore età"],
    periodo: null,
    periodi: [],
    tipoPeriodo: null,
    orario: [],
    alloggio: null,
    contratto: null,
    condizioni: null,
    pubblicato: null,
    scadenza: null,
    fonte: FONTE_TBH,
    scheda: { tipo: "interna", to: "/pride-village" },
    contatti: contattiTbh(),
    descrizione: "Promozione degli eventi del Village: vendita accrediti, tavoli e Village Card con formula You Pay To Cash Back.",
    immagine: null,
  },
  {
    slug: "operatori-cremona-circuit-2026",
    provenienza: "tbh",
    titolo: "Operatori Cremona Circuit — WorldSBK 2026",
    azienda: TBH,
    localita: "Cremona Circuit",
    luoghi: [CREMONA],
    settore: "Spettacolo ed eventi",
    ruoli: ["Operatore evento"],
    requisiti: null,
    periodo: "24–27 settembre 2026",
    periodi: [],
    tipoPeriodo: null,
    orario: [],
    alloggio: null,
    contratto: null,
    condizioni: null,
    pubblicato: null,
    scadenza: "2026-09-27",
    fonte: FONTE_TBH,
    scheda: { tipo: "interna", to: "/cremona-circuit-2026" },
    contatti: contattiTbh(),
    descrizione: "Evento concluso il 27 settembre 2026: candidature chiuse.",
    immagine: null,
  },
];

export const TUTTI_ANNUNCI: AnnuncioBacheca[] = [...ANNUNCI_TBH, ...ANNUNCI_HOTEL_RILEVATI];

/** Annunci TBH che hanno una scheda completa dentro la bacheca (componente originale). */
export function annuncioPerSlug(slug: string) {
  return TUTTI_ANNUNCI.find((a) => a.slug === slug) ?? null;
}

export function mailCandidatura(a: AnnuncioBacheca) {
  return mail(a.oggettoMail ?? `Candidatura — ${a.titolo}`);
}

/* ───────────────────────── Filtri ───────────────────────── */

export interface Filtri {
  q: string;
  provenienza: "tutte" | Provenienza;
  settore: string;
  ruolo: string;
  regione: string;
  provincia: string;
  comune: string;
  /** "" = tutta Italia · "costa" = tutta la costa adriatica · id zona */
  zona: string;
  tipoPeriodo: "" | "stagionale" | "continuativo";
  orario: "" | "full-time" | "part-time";
  periodo: string;
  alloggio: "" | "si" | "no";
  pubblicazione: "" | "7" | "30";
}

export const FILTRI_VUOTI: Filtri = {
  q: "",
  provenienza: "tutte",
  settore: "",
  ruolo: "",
  regione: "",
  provincia: "",
  comune: "",
  zona: "",
  tipoPeriodo: "",
  orario: "",
  periodo: "",
  alloggio: "",
  pubblicazione: "",
};

export function oggiIso(d = new Date()) {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

export function scaduto(a: AnnuncioBacheca, oggi: string) {
  return a.scadenza !== null && a.scadenza < oggi;
}

function giorniTra(da: string, a: string) {
  return Math.round((Date.parse(a) - Date.parse(da)) / 86_400_000);
}

export function testoRicerca(a: AnnuncioBacheca) {
  return [
    a.titolo, a.azienda, a.localita, a.settore, a.ruoli.join(" "), a.descrizione, a.condizioni, a.contratto,
    a.periodo, (a.requisiti ?? []).join(" "), a.luoghi.map((l) => `${l.comune ?? ""} ${l.regione}`).join(" "),
  ]
    .filter(Boolean)
    .join(" ");
}

export function passaFiltri(a: AnnuncioBacheca, f: Filtri, oggi: string) {
  if (f.provenienza !== "tutte" && a.provenienza !== f.provenienza) return false;
  if (f.settore && a.settore !== f.settore) return false;
  if (f.ruolo && !a.ruoli.includes(f.ruolo)) return false;
  if (f.regione && !a.luoghi.some((l) => l.regione === f.regione)) return false;
  if (f.provincia && !a.luoghi.some((l) => l.provincia === f.provincia)) return false;
  if (f.comune && !a.luoghi.some((l) => l.comune === f.comune)) return false;
  if (f.zona) {
    const z = zoneAnnuncio(a);
    if (f.zona === "costa" ? z.length === 0 : !z.includes(f.zona)) return false;
  }
  if (f.tipoPeriodo && a.tipoPeriodo !== f.tipoPeriodo) return false;
  if (f.orario && !a.orario.includes(f.orario)) return false;
  if (f.periodo && !a.periodi.includes(f.periodo)) return false;
  if (f.alloggio === "si" && a.alloggio !== true) return false;
  if (f.alloggio === "no" && a.alloggio !== false) return false;
  if (f.pubblicazione) {
    if (!a.pubblicato) return false;
    if (giorniTra(a.pubblicato, oggi) > Number(f.pubblicazione)) return false;
  }
  if (f.q && !corrisponde(testoRicerca(a), f.q)) return false;
  return true;
}

/** Più recente prima; senza data in fondo (a parità, per titolo). */
function perData(x: AnnuncioBacheca, y: AnnuncioBacheca) {
  if (x.pubblicato && y.pubblicato && x.pubblicato !== y.pubblicato) return x.pubblicato < y.pubblicato ? 1 : -1;
  if (x.pubblicato && !y.pubblicato) return -1;
  if (!x.pubblicato && y.pubblicato) return 1;
  return 0;
}

/**
 * Elenco attivo: Opportunità TBH che passano i filtri, poi gli esterni dal più recente.
 * Archivio: solo annunci scaduti (che passano gli stessi filtri), mai in elenco attivo.
 */
export function filtraBacheca(annunci: AnnuncioBacheca[], f: Filtri, oggi: string) {
  const ok = annunci.filter((a) => passaFiltri(a, f, oggi));
  const attivi = ok.filter((a) => !scaduto(a, oggi));
  const tbh = attivi.filter((a) => a.provenienza === "tbh").sort(perData);
  const esterni = attivi.filter((a) => a.provenienza === "esterna").sort(perData);
  const archivio = ok.filter((a) => scaduto(a, oggi)).sort((x, y) => ((x.scadenza ?? "") < (y.scadenza ?? "") ? 1 : -1));
  return { attivi: [...tbh, ...esterni], archivio };
}

/** Valori disponibili per i menu dei filtri, ricavati dai dati. */
export function opzioniFiltri(annunci: AnnuncioBacheca[]) {
  const uniq = (v: (string | null)[]) => [...new Set(v.filter((x): x is string => !!x))].sort((a, b) => a.localeCompare(b, "it"));
  return {
    settori: uniq(annunci.map((a) => a.settore)),
    ruoli: uniq(annunci.flatMap((a) => a.ruoli)),
    regioni: uniq(annunci.flatMap((a) => a.luoghi.map((l) => l.regione))),
    province: uniq(annunci.flatMap((a) => a.luoghi.map((l) => l.provincia))),
    comuni: uniq(annunci.flatMap((a) => a.luoghi.map((l) => l.comune))),
    periodi: uniq(annunci.flatMap((a) => a.periodi)),
  };
}

export function contaFiltriAttivi(f: Filtri) {
  return (Object.keys(f) as (keyof Filtri)[]).filter((k) => f[k] !== FILTRI_VUOTI[k]).length;
}
