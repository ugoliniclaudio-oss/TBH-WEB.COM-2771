/* ────────────────────────────────────────────────────────────────────────────
   SCANSIONE DEL SITO — aggiornamento globale del 17/09/2026, punto 8.

   «Fai una scansione di tutto il sito e dammi l'elenco amministrativo dei difetti.»

   Questo file NON corregge e NON inventa: LEGGE le anagrafiche reali e segnala, una
   per una, le cose che non tornano, con il nome esatto dell'entità e l'anagrafica in
   cui sta il problema. È la lista di lavoro di chi allestisce: ogni riga dice
   che cosa manca e dove intervenire.

   Difetti cercati, esattamente quelli chiesti da Claudio:
     · logo mancante                → l'entità non ha nessun file originale
     · logo recuperato              → il logo c'era altrove: scheda completa in una
                                      pagina e vuota in un'altra (caso Verucchio)
     · logo duplicato               → lo stesso file usato da entità diverse
     · file del logo assente        → il percorso è scritto ma il file non esiste
     · logo troppo piccolo          → sotto la misura che serve ai formati grandi
     · pulsante senza link          → nessuna pagina interna e nessun sito
     · indirizzo scritto male       → link che non può funzionare
     · monitor vuoto                → riquadro video senza contenuto reale
     · nome scritto in più modi     → la stessa entità con più scritture
     · scheda incompleta            → dati minimi mancanti (settore, città, contatto)
   ──────────────────────────────────────────────────────────────────────────── */

import { COMPANIES, PRODUCTS, TEAMS } from "./catalog";
import { LUOGHI, PROSPECTS, PARTNER_TECNICI } from "./rete";
import { BRAND_PAGES } from "./tbh";
import { SQUADRE } from "./sport";
import { MEDIA_RECORDS } from "./medialibrary";
import { IDENTITA, identitaDiNome, risolviLogo } from "./identita";

/** Gravità: cosa va sistemato prima. */
export type Gravita = "bloccante" | "da-sistemare" | "da-completare";

export const GRAVITA_LABEL: Record<Gravita, string> = {
  bloccante: "Blocca la pagina",
  "da-sistemare": "Da sistemare",
  "da-completare": "Da completare",
};

export type TipoDifetto =
  | "logo-mancante"
  | "logo-recuperato"
  | "logo-duplicato"
  | "file-assente"
  | "logo-piccolo"
  | "pulsante-senza-link"
  | "indirizzo-scritto-male"
  | "monitor-vuoto"
  | "nome-in-piu-modi"
  | "scheda-incompleta";

export const TIPO_DIFETTO_LABEL: Record<TipoDifetto, string> = {
  "logo-mancante": "Logo originale mancante",
  "logo-recuperato": "Logo presente altrove nel sito",
  "logo-duplicato": "Stesso file di logo su più entità",
  "file-assente": "File del logo non trovato",
  "logo-piccolo": "Logo troppo piccolo per i formati grandi",
  "pulsante-senza-link": "Pulsante senza link",
  "indirizzo-scritto-male": "Indirizzo scritto male",
  "monitor-vuoto": "Monitor senza contenuto",
  "nome-in-piu-modi": "Stessa entità scritta in più modi",
  "scheda-incompleta": "Scheda incompleta",
};

export type Difetto = {
  tipo: TipoDifetto;
  gravita: Gravita;
  /** Nome per esteso dell'entità coinvolta: mai sigle da sole. */
  entita: string;
  /** Anagrafica in cui sta il problema. */
  anagrafica: string;
  /** Che cosa non torna, in italiano, senza gergo. */
  problema: string;
  /** Che cosa fare per chiuderlo. */
  cosaFare: string;
  /** Pagina interna dove si vede il difetto, quando è determinabile. */
  pagina: string | null;
  /** File o indirizzo coinvolto. */
  riferimento: string | null;
};

/** Un indirizzo utilizzabile: interno con `/`, oppure http(s) completo. */
function indirizzoValido(url: string) {
  const u = url.trim();
  if (!u) return false;
  if (u.startsWith("/")) return true;
  if (/^https?:\/\/[^\s./]+\.[^\s]{2,}/i.test(u)) return true;
  if (/^(mailto:|tel:)/i.test(u)) return true;
  return false;
}

type Voce = {
  nome: string;
  anagrafica: string;
  logo: string | null;
  pagina: string | null;
  sito: string | null;
  /** Dati minimi della scheda: se sono tutti vuoti la scheda è solo un nome. */
  dati?: (string | null | undefined)[];
  /** Le voci di servizio (prodotti, programmi) non hanno bisogno di un logo proprio. */
  logoNonRichiesto?: boolean;
};

/** Tutte le voci pubblicate dal sito, con la loro anagrafica di origine. */
function voci(): Voce[] {
  const out: Voce[] = [];

  for (const c of COMPANIES) {
    out.push({
      nome: c.name,
      anagrafica: "COMPANIES (società e attività del gruppo)",
      logo: c.logo,
      pagina: "/tbh/societa",
      sito: c.site,
      dati: [c.vat, c.sector, c.code],
    });
  }

  for (const s of SQUADRE) {
    out.push({
      nome: s.nome,
      anagrafica: "SQUADRE (area sport)",
      logo: s.logo,
      pagina: `/sport/squadre/${s.slug}`,
      sito: s.sito,
      dati: [s.categoria, s.campo, s.citta],
    });
  }

  for (const t of TEAMS) {
    out.push({
      nome: t.name,
      anagrafica: "TEAMS (società seguite)",
      logo: t.logo,
      pagina: "/sport/societa-seguite",
      sito: t.site,
      dati: [t.role, t.note],
    });
  }

  for (const b of BRAND_PAGES) {
    out.push({
      nome: b.name,
      anagrafica: "BRAND_PAGES (pagine dedicate)",
      logo: b.logo ?? null,
      pagina: `/tbh/p/${b.slug}`,
      sito: null,
      dati: [b.claim],
    });
  }

  for (const l of LUOGHI) {
    out.push({
      nome: l.nome,
      anagrafica: "LUOGHI (mappa del territorio)",
      logo: l.logo ?? null,
      pagina: "/territorio/mappa",
      sito: l.sito ?? null,
      dati: [l.citta, l.indirizzo, l.categoria],
    });
  }

  for (const p of PROSPECTS) {
    out.push({
      nome: p.azienda,
      anagrafica: "PROSPECTS (rete commerciale)",
      logo: p.logo ?? null,
      pagina: "/network/rete-commerciale",
      sito: p.sito ?? null,
      dati: [p.citta, p.settore],
    });
  }

  for (const p of PARTNER_TECNICI) {
    out.push({
      nome: p.nome,
      anagrafica: "PARTNER_TECNICI (motorsport)",
      logo: null,
      pagina: "/network/partner",
      sito: p.sito ?? null,
      dati: [p.nota],
    });
  }

  for (const m of MEDIA_RECORDS) {
    out.push({
      nome: m.nome,
      anagrafica: "MEDIA_RECORDS (media library)",
      logo: m.logoUrl,
      pagina: m.paginaTbh,
      sito: m.sito,
      dati: [m.categoria, m.fonte],
    });
  }

  for (const p of PRODUCTS) {
    out.push({
      nome: p.title,
      anagrafica: "PRODUCTS (listino Touch Plaza Shop)",
      logo: p.image,
      pagina: p.scheda ?? "/shop",
      sito: null,
      dati: [p.category, p.blurb],
      /* Un prodotto usa la foto del prodotto, non un marchio proprio. */
      logoNonRichiesto: true,
    });
  }

  return out;
}

/**
 * Scansione a livello di dati. I controlli che richiedono il disco (file davvero
 * presente, misura del file) li aggiunge la rotta: qui restano i dati puri.
 */
export function scansionaDati(): Difetto[] {
  const out: Difetto[] = [];
  const tutte = voci();

  /* ── Loghi: mancanti, recuperabili, duplicati ───────────────────────────── */
  const perFile = new Map<string, Set<string>>();

  for (const v of tutte) {
    if (v.logo) {
      /* Le foto di prodotto si ripetono legittimamente fra varianti dello stesso
         corso o articolo: non sono marchi e non entrano nel controllo doppioni. */
      if (v.logoNonRichiesto) continue;
      const gruppo = perFile.get(v.logo) ?? new Set<string>();
      /* Si raggruppa per IDENTITÀ, non per nome: la stessa società scritta in due
         modi usa legittimamente lo stesso file e non è un doppione. */
      gruppo.add(identitaDiNome(v.nome)?.id ?? v.nome);
      perFile.set(v.logo, gruppo);
      continue;
    }

    if (v.logoNonRichiesto) continue;

    const r = risolviLogo(v.nome, null);
    if (r.logo) {
      out.push({
        tipo: "logo-recuperato",
        gravita: "da-sistemare",
        entita: r.nome,
        anagrafica: v.anagrafica,
        problema: `Questa anagrafica non porta il logo, ma l'originale è già caricato nel sito (${r.fonte ?? "altra anagrafica"}). Prima della correzione la scheda risultava completa in una pagina e vuota in un'altra.`,
        cosaFare:
          "Nessun file da cercare: il logo viene già riusato automaticamente. Va solo scritto anche in questa anagrafica per chiarezza.",
        pagina: v.pagina,
        riferimento: r.logo,
      });
    } else {
      out.push({
        tipo: "logo-mancante",
        gravita: "da-completare",
        entita: v.nome,
        anagrafica: v.anagrafica,
        problema:
          "Nessun logo originale caricato per questa entità: in pagina compare il nome per esteso.",
        cosaFare:
          "Caricare il logo originale dal pannello (SVG, oppure PNG da almeno 2000 px). Nessun logo ridisegnato o generato.",
        pagina: v.pagina,
        riferimento: null,
      });
    }
  }

  for (const [file, entita] of perFile) {
    if (entita.size > 1) {
      out.push({
        tipo: "logo-duplicato",
        gravita: "da-sistemare",
        entita: [...entita].join(" · "),
        anagrafica: "più anagrafiche",
        problema: `Lo stesso file di logo è usato da ${entita.size} entità diverse.`,
        cosaFare:
          "Verificare quale entità è la proprietaria del marchio e caricare il file corretto per le altre.",
        pagina: null,
        riferimento: file,
      });
    }
  }

  /* ── Pulsanti senza link e indirizzi scritti male ───────────────────────── */
  for (const v of tutte) {
    const interna = v.pagina && indirizzoValido(v.pagina);
    const esterno = v.sito && indirizzoValido(v.sito);

    if (v.sito && !esterno) {
      out.push({
        tipo: "indirizzo-scritto-male",
        gravita: "bloccante",
        entita: v.nome,
        anagrafica: v.anagrafica,
        problema: `L'indirizzo indicato non è utilizzabile: «${v.sito}».`,
        cosaFare: "Correggere l'indirizzo completo (con https://) oppure lasciarlo vuoto.",
        pagina: v.pagina,
        riferimento: v.sito,
      });
    }

    if (!interna && !esterno) {
      out.push({
        tipo: "pulsante-senza-link",
        gravita: "da-sistemare",
        entita: v.nome,
        anagrafica: v.anagrafica,
        problema:
          "Questa voce non ha né una pagina interna né un sito ufficiale: il suo pulsante non porta in nessun posto.",
        cosaFare:
          "Collegarla alla sua pagina interna oppure indicare il sito ufficiale verificato.",
        pagina: null,
        riferimento: null,
      });
    }
  }

  /* ── Monitor senza contenuto reale ──────────────────────────────────────── */
  for (const s of SQUADRE) {
    const vuoti = s.monitor.filter((m) => !m.url);
    if (vuoti.length > 0) {
      out.push({
        tipo: "monitor-vuoto",
        gravita: "da-completare",
        entita: s.nome,
        anagrafica: "SQUADRE (area sport)",
        problema: `${vuoti.length} monitor su ${s.monitor.length} non hanno un video reale: ${vuoti
          .map((m) => m.titolo)
          .join(", ")}.`,
        cosaFare:
          "Collegare il video ufficiale dal pannello monitor, oppure lasciare la promo TBH di riserva in onda.",
        pagina: `/sport/squadre/${s.slug}`,
        riferimento: null,
      });
    }
  }

  /* ── Stessa entità scritta in più modi ──────────────────────────────────── */
  for (const i of IDENTITA) {
    if (i.nomi.length > 1) {
      out.push({
        tipo: "nome-in-piu-modi",
        gravita: "da-completare",
        entita: i.nome,
        anagrafica: i.anagrafiche.join(" + "),
        problema: `La stessa entità è scritta in ${i.nomi.length} modi diversi: ${i.nomi
          .map((n) => `«${n}»`)
          .join(", ")}.`,
        cosaFare:
          "Il sito le riconosce già come una sola e usa un unico logo. Per pulizia va scelto il nome per esteso definitivo.",
        pagina: null,
        riferimento: null,
      });
    }
  }

  /* ── Schede che sono solo un nome ───────────────────────────────────────── */
  for (const v of tutte) {
    const dati = (v.dati ?? []).filter((d) => d && String(d).trim().length > 0);
    if (dati.length === 0) {
      out.push({
        tipo: "scheda-incompleta",
        gravita: "da-completare",
        entita: v.nome,
        anagrafica: v.anagrafica,
        problema: "La scheda ha solo il nome: nessun dato descrittivo pubblicato.",
        cosaFare: "Aggiungere almeno settore, città e un contatto verificato.",
        pagina: v.pagina,
        riferimento: null,
      });
    }
  }

  return out;
}

/** Tutti i file di logo citati dalle anagrafiche: la rotta verifica che esistano. */
export function fileLoghiCitati(): { file: string; entita: string; anagrafica: string }[] {
  const out: { file: string; entita: string; anagrafica: string }[] = [];
  for (const v of voci()) {
    if (v.logo && v.logo.startsWith("/")) {
      out.push({ file: v.logo, entita: v.nome, anagrafica: v.anagrafica });
    }
  }
  return out;
}

export const SCANSIONE_NOTA =
  "Elenco generato leggendo le anagrafiche reali del sito: nessun difetto è ipotizzato e nessun dato è stato aggiunto. " +
  "Dove manca un logo o un dato la pagina continua a mostrare il nome per esteso o IN ALLESTIMENTO, mai un segnaposto inventato.";
