import { z } from "zod";
import { ORPCError } from "@orpc/server";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { base } from "../__core/app";
import {
  GRAVITA_LABEL,
  SCANSIONE_NOTA,
  TIPO_DIFETTO_LABEL,
  fileLoghiCitati,
  scansionaDati,
  type Difetto,
  type Gravita,
} from "../data/scansione";
import { misureImmagine } from "../lib/varianti-logo";
import { FORMATI_LOGO } from "../data/formati-logo";

/**
 * SCANSIONE DEL SITO — specifica 17/09/2026, punto 8.
 *
 * «Fai una scansione di tutto il sito e dammi l'elenco amministrativo dei difetti:
 *  loghi mancanti, duplicati o deformati, pulsanti senza link, indirizzi rotti,
 *  monitor vuoti, schede complete in una pagina e vuote in un'altra.»
 *
 * Qui si uniscono due controlli:
 *   · quelli sui DATI, fatti da `scansionaDati()` (api/data/scansione.ts);
 *   · quelli sul DISCO, fatti solo qui perché servono i file veri: il percorso
 *     scritto nell'anagrafica esiste davvero? il file è abbastanza grande per il
 *     formato più largo previsto dal motore delle varianti?
 *
 * Non corregge niente e non inventa niente: è l'elenco di lavoro di chi allestisce.
 */

const CODICE = () => (process.env.TBH_CODICE_ALLESTIMENTO ?? "").trim();

function controlla(codice: string) {
  const atteso = CODICE();
  if (!atteso) {
    throw new ORPCError("SERVICE_UNAVAILABLE", {
      message: "Codice di allestimento non configurato sul server (TBH_CODICE_ALLESTIMENTO).",
    });
  }
  if (codice.trim() !== atteso) {
    throw new ORPCError("UNAUTHORIZED", { message: "Codice di allestimento errato." });
  }
}

const auth = z.object({ codice: z.string().min(1).max(120) });

/**
 * Misura minima utile del file originale.
 *
 * Non è una soglia decisa a caso: è il lato del formato quadrato più grande fra
 * quelli generati automaticamente (`app-512` e l'apertura `hero` 600×600). Sotto
 * questa misura il marchio, tenuto intero e centrato, va ingrandito oltre i suoi
 * pixel e si vede sfocato. Nei banner larghi il logo non occupa tutta la
 * larghezza, quindi la larghezza del banner NON è il riferimento.
 */
const MISURA_MINIMA = FORMATI_LOGO.filter((f) => f.larghezza === f.altezza).reduce(
  (m, f) => Math.max(m, f.larghezza),
  0,
);

const FORMATO_DI_RIFERIMENTO =
  FORMATI_LOGO.find((f) => f.larghezza === MISURA_MINIMA && f.larghezza === f.altezza)?.formato ??
  "app-512";

/** Controlli che richiedono i file veri nella cartella pubblica del sito. */
async function scansionaFile(): Promise<Difetto[]> {
  const out: Difetto[] = [];
  const radice = resolve(process.cwd(), "public");
  const visti = new Set<string>();

  for (const r of fileLoghiCitati()) {
    if (visti.has(r.file)) continue;
    visti.add(r.file);

    const locale = resolve(radice, r.file.replace(/^\/+/, ""));
    if (!locale.startsWith(radice)) {
      out.push({
        tipo: "indirizzo-scritto-male",
        gravita: "bloccante",
        entita: r.entita,
        anagrafica: r.anagrafica,
        problema: `Il percorso del file esce dalla cartella del sito: «${r.file}».`,
        cosaFare: "Ricaricare il file dal pannello, così il percorso viene scritto dal sito.",
        pagina: null,
        riferimento: r.file,
      });
      continue;
    }

    let byte: Uint8Array | null = null;
    try {
      byte = new Uint8Array(await readFile(locale));
    } catch {
      byte = null;
    }

    if (!byte) {
      out.push({
        tipo: "file-assente",
        gravita: "bloccante",
        entita: r.entita,
        anagrafica: r.anagrafica,
        problema: `L'anagrafica indica il file «${r.file}», ma quel file non è nel sito: il riquadro resta vuoto.`,
        cosaFare:
          "Caricare l'originale dal pannello, oppure togliere il percorso finché il file non c'è.",
        pagina: null,
        riferimento: r.file,
      });
      continue;
    }

    /* Un SVG non ha pixel: va bene a qualsiasi misura, non si controlla. */
    if (r.file.toLowerCase().endsWith(".svg")) continue;

    const m = await misureImmagine(byte);
    if (!m) continue;

    const lato = Math.max(m.larghezza, m.altezza);
    if (lato < MISURA_MINIMA) {
      out.push({
        tipo: "logo-piccolo",
        gravita: "da-sistemare",
        entita: r.entita,
        anagrafica: r.anagrafica,
        problema: `Il file è ${m.larghezza}×${m.altezza} px: sotto i ${MISURA_MINIMA} px richiesti dal formato «${FORMATO_DI_RIFERIMENTO}», quindi nei riquadri grandi il marchio si vede sfocato. Nei riquadri piccoli va bene così com'è.`,
        cosaFare: `Chiedere alla società l'originale in SVG, oppure un PNG da almeno ${MISURA_MINIMA} px di lato. Il file non viene stirato né ridisegnato: resta intero e centrato.`,
        pagina: null,
        riferimento: r.file,
      });
    }
  }

  return out;
}

const ORDINE: Record<Gravita, number> = { bloccante: 0, "da-sistemare": 1, "da-completare": 2 };

export const scansioneAdmin = {
  /** Dice solo se il pannello è utilizzabile: nessun dato esce senza codice. */
  stato: base.input(auth.partial()).handler(() => ({
    configurato: CODICE().length > 0,
    nota: SCANSIONE_NOTA,
  })),

  /**
   * Elenco completo dei difetti, già ordinato per gravità, con il riepilogo per
   * tipo così il pannello può mostrare i totali senza ricontare.
   */
  elenco: base.input(auth).handler(async ({ input }) => {
    controlla(input.codice);

    const difetti = [...scansionaDati(), ...(await scansionaFile())].sort(
      (a, b) =>
        ORDINE[a.gravita] - ORDINE[b.gravita] ||
        a.tipo.localeCompare(b.tipo) ||
        a.entita.localeCompare(b.entita),
    );

    const perTipo = new Map<string, number>();
    const perGravita = new Map<string, number>();
    for (const d of difetti) {
      perTipo.set(d.tipo, (perTipo.get(d.tipo) ?? 0) + 1);
      perGravita.set(d.gravita, (perGravita.get(d.gravita) ?? 0) + 1);
    }

    return {
      totale: difetti.length,
      difetti,
      riepilogoTipi: [...perTipo].map(([tipo, quanti]) => ({
        tipo,
        etichetta: TIPO_DIFETTO_LABEL[tipo as keyof typeof TIPO_DIFETTO_LABEL] ?? tipo,
        quanti,
      })),
      riepilogoGravita: (["bloccante", "da-sistemare", "da-completare"] as Gravita[]).map((g) => ({
        gravita: g,
        etichetta: GRAVITA_LABEL[g],
        quanti: perGravita.get(g) ?? 0,
      })),
      eseguitaIl: new Date().toISOString(),
      nota: SCANSIONE_NOTA,
    };
  }),
};
