/* ────────────────────────────────────────────────────────────────────────────
   IDENTITÀ UNICA — aggiornamento globale del 17/09/2026, punti 1, 8 e 9.

   REGOLA: «UN CONTENUTO, UN RECORD, UN LOGO ORIGINALE, PIÙ ADATTAMENTI AUTOMATICI».

   Il problema reale segnalato da Claudio: la stessa società compare scritta in modi
   diversi in anagrafiche diverse —
     · catalog.ts  → «A.S.D. Verucchio Calcio»        (con stemma)
     · sport.ts    → «A.S.D. Verucchio Calcio 1957»   (con stemma)
     · dm-video.ts → «Verucchio»                      (senza stemma)
   Il registro unico confronta i nomi normalizzati: tre nomi diversi = tre chiavi
   diverse = la stessa società risulta completa in una pagina e vuota in un'altra.

   Questo file NON aggiunge dati e NON inventa niente: costruisce gli ALIAS di uno
   stesso nome (anno sociale via, parole generiche via, nome breve incluso) e unisce
   i frammenti che condividono un alias. Poi risolve UN SOLO logo originale per
   identità: il primo file realmente presente fra le fonti, con la fonte dichiarata.

   Il logo non viene mai ridisegnato, ritoccato o sostituito con una ricerca online:
   si riusa l'ORIGINALE già caricato per quella identità. Se non esiste, resta null
   e la pagina mostra il nome per esteso (regola IN ALLESTIMENTO).
   ──────────────────────────────────────────────────────────────────────────── */

import { chiave } from "./registro";
import { REGISTRO } from "./registro";
import { SQUADRE } from "./sport";
import { DM_VIDEO_SQUADRE } from "./dm-video";
import { MEDIA_RECORDS } from "./medialibrary";

/** Anno sociale in coda al nome: «Victoria 1968» → «victoria». */
const ANNO_IN_CODA = /\s(1[89]\d{2}|20\d{2})$/;

/**
 * Parole che NON distinguono due società fra loro: compaiono o spariscono a seconda
 * dell'anagrafica che le ha scritte. Si usano solo per costruire un alias in più,
 * mai per fondere nomi che restano diversi anche senza di esse.
 */
const PAROLE_GENERICHE = new Set([
  "calcio",
  "football",
  "club",
  "sport",
  "sportiva",
  "sportivo",
  "dilettantistica",
  "polisportiva",
  "academy",
  "team",
  "fc",
  "ac",
  "us",
  "asd",
  "ssd",
]);

/**
 * ALIAS FORTI — identificano la stessa entità con certezza, quindi possono FONDERE
 * due record: la chiave piena del nome e la stessa chiave senza l'anno sociale
 * («A.S.D. Victoria 1968» e «Victoria 1968» sono la stessa società).
 * Il primo elemento è sempre la chiave piena: resta la chiave preferita.
 */
export function aliasForti(nome: string): string[] {
  const base = chiave(nome);
  if (!base) return [];

  const out = [base];
  const senzaAnno = base.replace(ANNO_IN_CODA, "").trim();
  if (senzaAnno && senzaAnno !== base) out.push(senzaAnno);
  return out;
}

/**
 * ALIAS DEBOLI — nome ridotto togliendo le parole che non distinguono una società
 * dall'altra («calcio», «academy», «football»). Servono SOLO a ritrovare una scheda
 * quando una pagina la chiama in forma abbreviata: NON fondono mai due record.
 *
 * Motivo, verificato sui dati reali: «Rimini Calcio» e «R.F.A. Rimini Football
 * Academy A.S.D.» si riducono entrambi a «rimini», ma sono due società diverse.
 * Un alias debole rivendicato da più di una identità viene quindi scartato.
 */
export function aliasDeboli(nome: string): string[] {
  const out: string[] = [];
  for (const partenza of aliasForti(nome)) {
    const ridotto = partenza
      .split(" ")
      .filter((p) => p && !PAROLE_GENERICHE.has(p))
      .join(" ")
      .trim();
    /* Sotto le 4 lettere («us», «ac») un alias non identifica nessuno. */
    if (ridotto && ridotto.length >= 4 && !out.includes(ridotto)) out.push(ridotto);
  }
  return out;
}

/** Tutti gli alias di un nome, forti prima: usato per la ricerca, non per la fusione. */
export function aliasNome(nome: string): string[] {
  const forti = aliasForti(nome);
  return [...forti, ...aliasDeboli(nome).filter((a) => !forti.includes(a))];
}

/** Fonti di logo per una identità: ognuna dichiara da dove arriva il file. */
export type FonteLogo = {
  /** Percorso del file originale così come è pubblicato (`/teams/verucchio-1957.png`). */
  logo: string;
  /** Nome con cui l'entità è scritta in quella anagrafica. */
  nome: string;
  /** Anagrafica di provenienza: si stampa nel pannello difetti. */
  anagrafica: string;
};

export type Identita = {
  /** Chiave preferita: alias più specifico del nome più completo trovato. */
  id: string;
  /** Nome più completo fra quelli incontrati: è quello che si mostra per esteso. */
  nome: string;
  /** Tutti i nomi con cui la stessa identità è scritta nel sito. */
  nomi: string[];
  /** Tutti gli alias che portano a questa identità. */
  alias: string[];
  /** Anagrafiche in cui compare. Più di una = la stessa entità è scritta più volte. */
  anagrafiche: string[];
  /** Loghi originali trovati, in ordine di priorità della fonte. */
  loghi: FonteLogo[];
};

type Frammento = {
  nome: string;
  anagrafica: string;
  logo: string | null;
  /** Nome breve, quando l'anagrafica lo dichiara: diventa un alias in più. */
  nomeBreve?: string | null;
};

/**
 * Frammenti da tutte le anagrafiche che pubblicano un nome e (a volte) un logo.
 * L'ordine conta: la prima fonte che porta un logo vince come originale.
 * Prima le anagrafiche curate a mano da Claudio, poi le derivate.
 */
function frammentiIdentita(): Frammento[] {
  const out: Frammento[] = [];

  for (const s of SQUADRE) {
    out.push({
      nome: s.nome,
      nomeBreve: s.nomeBreve,
      logo: s.logo,
      anagrafica: "SQUADRE (area sport)",
    });
  }

  for (const e of REGISTRO) {
    out.push({
      nome: e.nome,
      logo: e.logo,
      anagrafica: e.fonti.join(" + "),
    });
  }

  for (const m of MEDIA_RECORDS) {
    out.push({
      nome: m.nome,
      logo: m.logoUrl,
      anagrafica: "MEDIA_RECORDS (media library)",
    });
  }

  for (const v of DM_VIDEO_SQUADRE) {
    out.push({
      nome: v.nome,
      logo: null,
      anagrafica: "DM_VIDEO_SQUADRE (highlights)",
    });
  }

  return out;
}

/**
 * Indice delle identità: unisce i frammenti che condividono un ALIAS FORTE.
 * È costruito una sola volta all'avvio, come il registro.
 *
 * Il nome breve dichiarato dall'anagrafica («Verucchio» per «A.S.D. Verucchio Calcio
 * 1957») vale come alias forte: non è una riduzione automatica, è un dato scritto
 * da Claudio. Gli alias deboli finiscono in un secondo indice, solo per la ricerca.
 */
const {
  identita: IDENTITA_LISTA,
  indice: INDICE,
  indiceDebole: INDICE_DEBOLE,
} = (() => {
  const perAlias = new Map<string, Identita>();
  const tutte: Identita[] = [];
  /** Alias debole → identità che lo rivendicano. Più di una = alias ambiguo, si scarta. */
  const deboli = new Map<string, Set<Identita>>();

  for (const f of frammentiIdentita()) {
    const alias = [...aliasForti(f.nome), ...(f.nomeBreve ? aliasForti(f.nomeBreve) : [])];
    if (alias.length === 0) continue;

    /* Identità già viste che condividono un alias: si fondono tutte in una. */
    const trovate: Identita[] = [];
    for (const a of alias) {
      const esistente = perAlias.get(a);
      if (esistente && !trovate.includes(esistente)) trovate.push(esistente);
    }

    let corrente: Identita;
    if (trovate.length === 0) {
      corrente = {
        id: alias[0]!,
        nome: f.nome,
        nomi: [],
        alias: [],
        anagrafiche: [],
        loghi: [],
      };
      tutte.push(corrente);
    } else {
      corrente = trovate[0]!;
      /* Fusione delle identità che il nuovo frammento mette in comunicazione. */
      for (const altra of trovate.slice(1)) {
        for (const n of altra.nomi) if (!corrente.nomi.includes(n)) corrente.nomi.push(n);
        for (const a of altra.alias) if (!corrente.alias.includes(a)) corrente.alias.push(a);
        for (const s of altra.anagrafiche)
          if (!corrente.anagrafiche.includes(s)) corrente.anagrafiche.push(s);
        for (const l of altra.loghi)
          if (!corrente.loghi.some((x) => x.logo === l.logo)) corrente.loghi.push(l);
        for (const a of altra.alias) perAlias.set(a, corrente);
        const i = tutte.indexOf(altra);
        if (i >= 0) tutte.splice(i, 1);
      }
    }

    for (const a of alias) {
      if (!corrente.alias.includes(a)) corrente.alias.push(a);
      if (!perAlias.has(a)) perAlias.set(a, corrente);
    }
    if (!corrente.nomi.includes(f.nome)) corrente.nomi.push(f.nome);
    if (!corrente.anagrafiche.includes(f.anagrafica)) corrente.anagrafiche.push(f.anagrafica);
    if (f.logo && !corrente.loghi.some((x) => x.logo === f.logo)) {
      corrente.loghi.push({ logo: f.logo, nome: f.nome, anagrafica: f.anagrafica });
    }
    /* Il nome da mostrare è il più completo: contiene più informazione, non meno. */
    if (f.nome.length > corrente.nome.length) corrente.nome = f.nome;

    for (const d of [...aliasDeboli(f.nome), ...(f.nomeBreve ? aliasDeboli(f.nomeBreve) : [])]) {
      const gruppo = deboli.get(d) ?? new Set<Identita>();
      gruppo.add(corrente);
      deboli.set(d, gruppo);
    }
  }

  /* Alias debole valido solo se una sola identità lo rivendica e non è già forte. */
  const indiceDebole = new Map<string, Identita>();
  for (const [a, gruppo] of deboli) {
    if (perAlias.has(a)) continue;
    const vive = [...gruppo].filter((i) => tutte.includes(i));
    if (vive.length === 1) indiceDebole.set(a, vive[0]!);
  }

  return { identita: tutte, indice: perAlias, indiceDebole };
})();

export const IDENTITA: Identita[] = IDENTITA_LISTA.sort((a, b) =>
  a.nome.localeCompare(b.nome, "it"),
);

/**
 * Identità di un nome, qualunque forma sia scritta nella pagina.
 * Prima gli alias certi, poi — solo se non è ambiguo — l'alias abbreviato.
 */
export function identitaDiNome(nome: string): Identita | null {
  for (const a of aliasForti(nome)) {
    const trovata = INDICE.get(a);
    if (trovata) return trovata;
  }
  for (const a of aliasDeboli(nome)) {
    const trovata = INDICE_DEBOLE.get(a);
    if (trovata) return trovata;
  }
  return null;
}

export type LogoRisolto = {
  /** Il logo originale da usare, oppure null: nessun placeholder, nessun disegno nuovo. */
  logo: string | null;
  /** Anagrafica da cui arriva l'originale, per dichiararlo nel pannello. */
  fonte: string | null;
  /** Nome per esteso da mostrare quando il logo non c'è. */
  nome: string;
  /** true quando il logo NON era sul record chiesto ma esiste su un'altra scrittura. */
  recuperato: boolean;
};

/**
 * UN LOGO ORIGINALE PER IDENTITÀ.
 * Si passa il nome e, se la pagina ne ha già uno, il logo che ha in mano: se manca,
 * si riusa l'originale già caricato per la stessa identità altrove nel sito.
 */
export function risolviLogo(nome: string, logoDellaPagina?: string | null): LogoRisolto {
  const mio = logoDellaPagina?.trim() ? logoDellaPagina.trim() : null;
  const id = identitaDiNome(nome);

  if (mio) {
    return {
      logo: mio,
      fonte: id?.loghi.find((l) => l.logo === mio)?.anagrafica ?? null,
      nome: id?.nome ?? nome,
      recuperato: false,
    };
  }

  const primo = id?.loghi[0] ?? null;
  return {
    logo: primo?.logo ?? null,
    fonte: primo?.anagrafica ?? null,
    nome: id?.nome ?? nome,
    recuperato: Boolean(primo),
  };
}

/**
 * REGISTRO CON I LOGHI RISOLTI — è questo che devono servire le rotte pubbliche.
 * Stesso registro di sempre, stessi dati, ma il logo di ogni entità è l'unico
 * originale di quella identità: così la stessa società non è completa in una
 * pagina e vuota in un'altra (il caso segnalato da Claudio sul Verucchio).
 */
export const REGISTRO_RISOLTO: typeof REGISTRO = REGISTRO.map((e) => {
  const r = risolviLogo(e.nome, e.logo);
  return r.logo === e.logo ? e : { ...e, logo: r.logo };
});

/** Entità del registro il cui logo è stato recuperato da un'altra anagrafica. */
export const LOGHI_RECUPERATI = REGISTRO.filter(
  (e) => !e.logo && risolviLogo(e.nome, null).logo,
).map((e) => {
  const r = risolviLogo(e.nome, null);
  return { id: e.id, nome: e.nome, logo: r.logo!, fonte: r.fonte };
});

export const IDENTITA_NOTA =
  "Identità unica ricavata dalle anagrafiche esistenti: nessun nome, logo o dato è stato aggiunto a mano. " +
  "Gli alias servono solo a riconoscere la stessa entità scritta in modi diversi (anno sociale, sigle, nome breve) " +
  "e a riusare sempre lo stesso logo originale in tutte le pagine.";
