/**
 * LETTURA DEI TITOLI DM — il pezzo che trasforma un titolo YouTube reale in
 * «squadra di casa · avversario · risultato», senza aggiungere niente.
 *
 * È tenuto separato da `partite-dm.ts` perché è la parte delicata: qui ogni
 * regola corrisponde a una forma di titolo REALMENTE presente sul canale
 * «Daniele Manuelli Official» (elenco estratto il 29/08/2026) ed è verificabile
 * una per una, titolo alla mano.
 *
 * FORME DI TITOLO OSSERVATE, e come vengono lette:
 *   «Highlights Promozione.␠␠Verucchio vs Riccione 1-2»          → casa/ospite/risultato
 *   «Interviste post Verucchio vs Riccione»                       → stessa partita, senza risultato
 *   «Intervista MANCINI post Verucchio vs Civitella»              → si tiene ciò che segue «post»
 *   «Interviste postgara␠␠Amore e Biagioni San Marino vs Imolese» → si taglia davanti al nome della società
 *   «Romagna First Category Soccer. Play-Offs Novafeltria vs …»   → «Play-Offs» è rubrica, non squadra
 *   «Interviste post Novafeltria vs Solarolo␠␠Costantini e Assirelli» → i nomi in coda non sono la squadra
 *   «HIGHLIGHTS PRIMA CATEGORIA.␠␠S.Ermete vs Bellaria…␠0 -2»     → abbreviazioni intatte
 *   «Intervista D'Agostino post Bellaria Igea Marina vs Bagno di Romagna» → «Romagna» qui è la squadra
 *   «Calcio Promozione Romagna.␠␠Verucchio - Forlimpopoli 1-2»    → trattino spaziato al posto di «vs»
 *
 * Ciò che non rientra in queste forme NON viene forzato: torna `null` e il
 * video resta un contenuto della società, dichiarato come tale.
 */

export const senzaAccenti = (s: string) => s.normalize("NFD").replace(/\p{Diacritic}/gu, "");

export const normalizza = (s: string) =>
  senzaAccenti(s)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

export const chiave = (s: string) => normalizza(s).replace(/\s+/g, "-");

const parole = (s: string) => normalizza(s).split(" ").filter(Boolean);

/** Parole che nei titoli del canale sono rubrica, campionato o fase, non squadre. */
const RUBRICA = new Set([
  "highlights",
  "highlight",
  "hl",
  "interviste",
  "intervista",
  "post",
  "postgara",
  "dopogara",
  "calcio",
  "soccer",
  "football",
  "promozione",
  "prima",
  "seconda",
  "categoria",
  "category",
  "first",
  "eccellenza",
  "serie",
  "girone",
  "juniores",
  "romagna",
  "marche",
  "coppa",
  "dm",
  "cura",
  "speciale",
  "summer",
  "amichevole",
  "playoff",
  "playoffs",
  "play",
  "off",
  "offs",
  "out",
  "outs",
  "finale",
  "final",
]);

/** Particelle che nei nomi di società tengono insieme le parole: «Bagno DI Romagna». */
const PARTICELLE = new Set(["di", "del", "della", "dello", "dei", "degli", "delle", "da", "d", "la", "il", "lo"]);

/** Competizioni riconosciute SOLO se il titolo le scrive. */
const COMPETIZIONI = [
  "Serie D",
  "Eccellenza",
  "Promozione",
  "Prima Categoria",
  "Seconda Categoria",
  "Juniores",
  "Coppa",
];

export function competizioneDichiarata(titolo: string): string | null {
  const t = normalizza(titolo);
  return COMPETIZIONI.find((c) => t.includes(normalizza(c))) ?? null;
}

const rifila = (s: string) => s.replace(/^[\s.,:;·|–—-]+|[\s.,:;·|–—-]+$/g, "").trim();

const soloLettera = (t: string) => normalizza(t).replace(/\s/g, "").length <= 1;

/**
 * Parola (o gruppo tipo «Play-Offs») che è rubrica. Si guarda ogni parola del
 * gruppo: «Play-Offs» diventa «play offs», entrambe di rubrica.
 */
const diRubrica = (t: string) => {
  const p = parole(t);
  return p.length > 0 && p.every((w) => RUBRICA.has(w));
};

/** Un segmento è tutta rubrica: «D Girone D», «Eccellenza Romagna», «Highlights». */
function segmentoDaButtare(seg: string): boolean {
  const tokens = seg.split(/\s+/).filter(Boolean);
  if (tokens.length === 0) return true;
  // Deve contenere almeno una parola di rubrica vera: così «S» di «S.Ermete» resta.
  if (!tokens.some(diRubrica)) return false;
  return tokens.every((t) => diRubrica(t) || soloLettera(t));
}

/** Toglie il risultato e i doppi spazi da un pezzo di titolo. */
const senzaRisultato = (s: string) =>
  rifila(s.replace(/\d{1,2}\s*-\s*\d{1,2}/g, " ").replace(/\s+/g, " "));

/** Lato SINISTRO del separatore: la squadra di casa. */
export function latoCasa(testo: string): string {
  // Il separatore vero fra rubrica e contenuto, nei titoli del canale, è il doppio spazio.
  const pezzi = testo.split(/\s{2,}/).map(rifila).filter(Boolean);
  let s = pezzi[pezzi.length - 1] ?? testo;

  // Segmenti separati da punto: si butta solo ciò che è rubrica per intero.
  const segmenti = s.split(/\./);
  while (segmenti.length > 1 && segmentoDaButtare(segmenti[0] ?? "")) segmenti.shift();
  s = segmenti.join(".");

  // «Intervista MANCINI post Verucchio» → la squadra è ciò che segue «post».
  const dopoPost = s.split(/\bpost(?:gara)?\b/i);
  if (dopoPost.length > 1) s = dopoPost[dopoPost.length - 1] ?? s;

  s = senzaRisultato(s);

  const tokens = s.split(" ").filter(Boolean);
  while (tokens.length > 1 && (diRubrica(tokens[0] ?? "") || soloLettera(tokens[0] ?? ""))) {
    tokens.shift();
  }
  if (tokens.length === 1 && diRubrica(tokens[0] ?? "")) return "";
  return rifila(tokens.join(" "));
}

/** Lato DESTRO del separatore: la squadra ospite. */
export function latoOspite(testo: string): string {
  let s = senzaRisultato(testo);

  // Dopo il doppio spazio, a destra, il canale mette i nomi degli intervistati:
  // «Solarolo␠␠Costantini e Assirelli». Si tiene il primo pezzo, e si continua
  // solo se finisce con un'abbreviazione («S␠␠Ermete»).
  const pezzi = testo.split(/\s{2,}/).map((x) => senzaRisultato(x)).filter(Boolean);
  if (pezzi.length > 1) {
    let unito = pezzi[0] ?? s;
    let i = 1;
    while (i < pezzi.length) {
      const ultimo = unito.split(/\s+/).filter(Boolean).pop() ?? "";
      if (!soloLettera(ultimo)) break;
      unito = `${unito} ${pezzi[i]}`;
      i++;
    }
    s = rifila(unito);
  }

  // Si taglia la coda di rubrica dopo il punto, tenendo intere le abbreviazioni
  // tipo «S.Ermete», «Y.Santarcangelo», «I.Marina», «R .S .Clemente»: si continua
  // a unire finché il pezzo appena unito è una sigla di una sola lettera.
  const segmenti = s.split(/\./).map((x) => x.trim());
  let fuori = segmenti[0] ?? s;
  let precedente = (fuori.split(/\s+/).filter(Boolean).pop() ?? "").trim();
  let i = 1;
  while (i < segmenti.length) {
    if (!soloLettera(precedente)) break; // l'abbreviazione è finita: il resto è rubrica
    const pezzo = segmenti[i] ?? "";
    fuori = `${fuori}.${pezzo}`;
    precedente = pezzo;
    i++;
  }
  s = rifila(fuori);

  const tokens = s.split(" ").filter(Boolean);
  // Si tolgono le parole di rubrica in coda, MA non quando reggono una particella:
  // in «Bagno di Romagna» la parola «Romagna» è la squadra, non la rubrica.
  while (tokens.length > 1) {
    const ultimo = tokens[tokens.length - 1] ?? "";
    const precedente = tokens[tokens.length - 2] ?? "";
    if (!diRubrica(ultimo) && !soloLettera(ultimo)) break;
    if (PARTICELLE.has(normalizza(precedente))) break;
    tokens.pop();
  }
  while (tokens.length > 1 && diRubrica(tokens[0] ?? "")) tokens.shift();
  if (tokens.length === 1 && diRubrica(tokens[0] ?? "")) return "";
  return rifila(tokens.join(" "));
}

/**
 * SOCIETÀ DEL SITO — usate per ricondurre le varianti di scrittura della STESSA
 * società alla sua pagina: «Novafeltria» e «Vis Novafeltria», «T.Coriano» e
 * «Tropical Coriano» sono le squadre che il sito già segue, scritte come le
 * scrive Daniele Manuelli. Non è un rinominare: la tabella contiene solo società
 * di cui abbiamo il record ufficiale sul sito.
 */
const NOTE_SOCIETA: { token: string; chiave: string; nome: string }[] = [
  { token: "verucchio", chiave: "verucchio", nome: "Verucchio" },
  { token: "victoria", chiave: "victoria-1968", nome: "Victoria 1968" },
  { token: "novafeltria", chiave: "vis-novafeltria", nome: "Vis Novafeltria" },
  { token: "pietracuta", chiave: "pietracuta", nome: "Pietracuta" },
  { token: "san marino", chiave: "san-marino-calcio", nome: "San Marino Calcio" },
  { token: "coriano", chiave: "tropical-coriano", nome: "Tropical Coriano" },
  { token: "gabicce", chiave: "gabicce-gradara", nome: "Gabicce Gradara" },
  { token: "bellaria", chiave: "bellaria-igea-marina", nome: "Bellaria Igea Marina 1956" },
];

/** Ricondice un avversario alla società vera quando è una delle nostre. */
export function avversarioCanonico(nome: string): { chiave: string; nome: string; nostra: boolean } {
  const n = normalizza(nome);
  const nota = NOTE_SOCIETA.find((s) => n.includes(s.token));
  if (nota) return { chiave: nota.chiave, nome: nota.nome, nostra: true };
  return { chiave: chiave(nome), nome, nostra: false };
}

/**
 * VOCABOLARIO DEGLI AVVERSARI — l'unico modo onesto di unire «Cava» a
 * «F.Cava Ronco» o «R .S .Clemente» a «Real San Clemente».
 *
 * Non c'è nessun elenco scritto a mano: il vocabolario si costruisce DAI TITOLI
 * PULITI della stessa squadra, quelli che dichiarano il risultato e in cui il
 * nome dell'avversario è scritto per intero. Le forme storpiate dei titoli delle
 * interviste vengono poi ricondotte a quei nomi, e solo quando la corrispondenza
 * è UNA SOLA. Il confronto resta chiuso dentro la squadra della pagina: «Ronco»
 * nei titoli del Verucchio non diventa «F.Cava Ronco», che il Verucchio non ha
 * mai incontrato sul canale.
 */
export type VoceVocabolario = { nome: string; chiave: string; tokens: string[] };
export type Vocabolario = VoceVocabolario[];

const tokenUtili = (nome: string) => parole(nome).filter((w) => w.length > 1);

export function vocabolarioDa(nomi: string[]): Vocabolario {
  const voci = new Map<string, VoceVocabolario>();
  for (const nome of nomi) {
    const tokens = tokenUtili(nome);
    if (tokens.length === 0) continue;
    const firma = [...tokens].sort().join(" ");
    if (!voci.has(firma)) {
      const c = avversarioCanonico(nome);
      voci.set(firma, { nome: c.nome, chiave: c.chiave, tokens });
    }
  }
  return [...voci.values()];
}

const sottoinsieme = (a: string[], b: string[]) => a.length > 0 && a.every((t) => b.includes(t));

/** Ricondice il nome letto alla forma completa, se il vocabolario ne ha una sola. */
export function risolviAvversario(
  nome: string,
  vocab: Vocabolario,
): { chiave: string; nome: string; risolto: boolean } {
  const nostra = avversarioCanonico(nome);
  if (nostra.nostra) return { chiave: nostra.chiave, nome: nostra.nome, risolto: false };

  const tokens = tokenUtili(nome);
  if (tokens.length === 0) return { chiave: nostra.chiave, nome: nostra.nome, risolto: false };

  const firma = [...tokens].sort().join(" ");
  const esatta = vocab.find((v) => [...v.tokens].sort().join(" ") === firma);
  if (esatta) return { chiave: esatta.chiave, nome: esatta.nome, risolto: false };

  const candidati = vocab.filter(
    (v) => sottoinsieme(v.tokens, tokens) || sottoinsieme(tokens, v.tokens),
  );
  const chiavi = [...new Set(candidati.map((v) => v.chiave))];
  if (chiavi.length === 1 && candidati[0]) {
    return { chiave: candidati[0].chiave, nome: candidati[0].nome, risolto: true };
  }
  return { chiave: nostra.chiave, nome: nostra.nome, risolto: false };
}

export function ruoloDi(titolo: string): "integrale" | "sintesi" | "interviste" {
  const t = normalizza(titolo);
  if (/\bintervist/.test(t) || /\bdopogara\b/.test(t) || /\bpostgara\b/.test(t)) {
    return "interviste";
  }
  if (/\bhighlight/.test(t) || /\bsintesi\b/.test(t)) return "sintesi";
  return "integrale";
}

/** Come si riconosce, dentro un titolo, la squadra della pagina. */
export type Profilo = {
  slug: string;
  nome: string;
  /** Parole singole che la identificano. */
  token: string[];
  /** Gruppi di parole consecutive del nome, dal più lungo: «san marino calcio», «san marino». */
  gruppi: string[][];
};

export function profiloSquadra(slug: string, nome: string): Profilo {
  const token = new Set<string>();
  for (const parola of `${slug} ${nome}`.split(/[^A-Za-z0-9]+/)) {
    const n = normalizza(parola);
    if (n.length >= 4 && !/^\d+$/.test(n)) token.add(n);
  }

  const p = parole(nome);
  const gruppi: string[][] = [];
  for (let len = p.length; len >= 1; len--) {
    for (let i = 0; i + len <= p.length; i++) {
      const g = p.slice(i, i + len);
      if (len === 1 && ((g[0] ?? "").length < 4 || /^\d+$/.test(g[0] ?? ""))) continue;
      gruppi.push(g);
    }
  }
  return { slug, nome, token: [...token], gruppi };
}

/** Compatibilità con la versione precedente del modulo. */
export function tokenSquadra(slug: string, nome: string): string[] {
  return profiloSquadra(slug, nome).token;
}

/**
 * Taglia ciò che sta davanti al nome della società: in
 * «Interviste postgara  Amore e Biagioni San Marino» i due nomi degli
 * intervistati stanno davanti a «San Marino», e vanno via.
 */
export function ritagliaDaSquadra(testo: string, profilo: Profilo): string {
  const tokens = testo.split(/\s+/).filter(Boolean);
  if (tokens.length <= 1) return testo;
  const normali = tokens.map((t) => normalizza(t));

  for (const gruppo of profilo.gruppi) {
    for (let i = 0; i + gruppo.length <= normali.length; i++) {
      const combacia = gruppo.every((g, k) => normali[i + k] === g);
      if (combacia) return i === 0 ? testo : rifila(tokens.slice(i).join(" "));
    }
  }
  return testo;
}

/** Divide il titolo nei due lati della partita. null = nessun separatore. */
function dividi(titolo: string): [string, string] | null {
  const vs = /\s+(?:vs\.?|contro)\s+/i;
  if (vs.test(titolo)) {
    const [sinistra, ...resto] = titolo.split(vs);
    if (!sinistra || resto.length === 0) return null;
    return [sinistra, resto.join(" vs ")];
  }

  // «Verucchio - Forlimpopoli 1-2»: si mascherano prima i risultati, così il
  // trattino del punteggio non viene preso per separatore.
  const mascherato = titolo.replace(/\d{1,2}\s*-\s*\d{1,2}/g, (m) => "#".repeat(m.length));
  const trovati = [...mascherato.matchAll(/\s+[-–—]\s+/g)];
  const solo = trovati.length === 1 ? trovati[0] : null;
  if (!solo || solo.index === undefined) return null;
  return [titolo.slice(0, solo.index), titolo.slice(solo.index + solo[0].length)];
}

export type TitoloLetto = {
  casa: string;
  ospite: string;
  inCasa: boolean;
  /** Nome dell'avversario come sta nel titolo, prima di ogni ricongiunzione. */
  avversarioGrezzo: string;
  avversario: string;
  avversarioChiave: string;
  risultato: string | null;
  competizione: string | null;
};

/** Legge una partita dal titolo. null = il titolo non dichiara una partita. */
export function leggiTitolo(
  titolo: string,
  profilo: Profilo,
  vocab: Vocabolario = [],
): TitoloLetto | null {
  const lati = dividi(titolo);
  if (!lati) return null;
  const [sinistra, destra] = lati;

  const ris = destra.match(/(\d{1,2})\s*-\s*(\d{1,2})/);
  let casa = latoCasa(sinistra);
  let ospite = latoOspite(destra);
  if (!casa || !ospite) return null;

  const inCasa = profilo.token.some((t) => normalizza(casa).includes(t));
  const fuori = profilo.token.some((t) => normalizza(ospite).includes(t));
  // Il titolo deve nominare la squadra della pagina: altrimenti non è una sua partita.
  if (!inCasa && !fuori) return null;

  // Si ripulisce il lato della squadra della pagina dai nomi degli intervistati.
  if (inCasa) casa = ritagliaDaSquadra(casa, profilo) || casa;
  else ospite = ritagliaDaSquadra(ospite, profilo) || ospite;

  const grezzo = inCasa ? ospite : casa;
  const avv = risolviAvversario(grezzo, vocab);

  return {
    casa,
    ospite,
    inCasa,
    avversarioGrezzo: grezzo,
    avversario: avv.nome,
    avversarioChiave: avv.chiave,
    risultato: ris ? `${ris[1]}-${ris[2]}` : null,
    competizione: competizioneDichiarata(titolo),
  };
}
