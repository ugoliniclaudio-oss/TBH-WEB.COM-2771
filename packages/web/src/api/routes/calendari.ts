import { z } from "zod";
import { base } from "../__core/app";
import { CANALI_TELECOMANDO } from "../data/telecomando";
import { FONTI_CALCIO_SQUADRE, LOGHI_FONTI, ROMAGNA_SPORT, TUTTO_CAMPO, fonteCalcioSquadra } from "../data/fonti-calcio-squadre";
import { gironeRomagnaSport, urlSquadra, type GironeRomagnaSport, type PartitaCalendario } from "../lib/romagnasport";
import { dataRoma } from "../lib/radio-palinsesto";

/**
 * PALINSESTO PARTITE DEI CANALI SQUADRA — anteprima /check-web/canali/:slug (17/10/2026).
 *
 * «CREA I PALINSESTI CHANNEL»: per ogni canale squadra, prossime partite, ultimi
 * risultati, giornata in corso e classifica del girone, LETTI su Romagna Sport
 * (api/lib/romagnasport.ts). Tutto Campo non si lascia leggere (403): solo collegamento.
 * Se una lettura non riesce, il campo resta null: la pagina scrive «dato da confermare».
 */

/** gg/mm/aaaa → aaaa-mm-gg, per confrontare con l'oggi di Roma. */
function iso(data: string) {
  const [g, m, a] = data.split("/");
  return `${a}-${m}-${g}`;
}

type PartitaSquadra = {
  giornata: number;
  data: string;
  /** Ora della partita: c'è solo per la giornata in corso (pagina classifica). */
  ora: string | null;
  /** true = data esatta della partita; false = data della giornata nel calendario. */
  dataEsatta: boolean;
  casa: string;
  ospite: string;
  inCasa: boolean;
  avversario: string;
  risultato: string | null;
  esito: "V" | "N" | "P" | null;
};

function partitaSquadra(p: PartitaCalendario, id: number, g: GironeRomagnaSport): PartitaSquadra {
  const inCasa = p.casaId === id;
  const t = g.turno.partite.find((x) => x.casaId === p.casaId && x.ospiteId === p.ospiteId);
  let esito: PartitaSquadra["esito"] = null;
  if (p.risultato) {
    const [a, b] = p.risultato.split("-").map((n) => Number(n.trim()));
    const mie = inCasa ? a! : b!;
    const loro = inCasa ? b! : a!;
    esito = mie > loro ? "V" : mie < loro ? "P" : "N";
  }
  return {
    giornata: p.giornata,
    data: t?.data ?? p.dataGiornata,
    ora: t?.ora ?? null,
    dataEsatta: Boolean(t?.data),
    casa: p.casa,
    ospite: p.ospite,
    inCasa,
    avversario: inCasa ? p.ospite : p.casa,
    risultato: p.risultato,
    esito,
  };
}

async function palinsesto(squadra: string) {
  const f = fonteCalcioSquadra(squadra);
  if (!f) return null;
  const g = await gironeRomagnaSport(f.gir);
  const fonte = {
    nome: "Romagna Sport",
    sito: ROMAGNA_SPORT,
    logo: LOGHI_FONTI.romagnaSport,
    calendario: g?.url.calendario ?? null,
    classifica: g?.url.classifica ?? null,
    squadra: urlSquadra(f.idSquadra),
    lettoIl: g?.lettoIl ?? null,
    copiaPrecedente: g?.copiaPrecedente ?? false,
  };
  const tuttoCampo = { nome: "Tutto Campo", sito: TUTTO_CAMPO, logo: LOGHI_FONTI.tuttoCampo, girone: f.tuttocampo };
  if (!g) return { squadra, campionato: f.campionato, letto: false as const, fonte, tuttoCampo };

  const oggi = dataRoma(Date.now());
  const mie = g.giornate.filter((p) => p.casaId === f.idSquadra || p.ospiteId === f.idSquadra);
  const giocate = mie.filter((p) => p.risultato).map((p) => partitaSquadra(p, f.idSquadra, g));
  const nonGiocate = mie.filter((p) => !p.risultato).map((p) => partitaSquadra(p, f.idSquadra, g));
  const prossime = nonGiocate.filter((p) => iso(p.data) >= oggi).slice(0, 4);
  /* «N.G.» con data già passata: rinviata o risultato non ancora inserito. Non si indovina. */
  const sospese = nonGiocate.filter((p) => iso(p.data) < oggi);
  const riga = g.classifica.find((r) => r.id === f.idSquadra) ?? null;

  return {
    squadra,
    campionato: g.campionato ?? f.campionato,
    letto: true as const,
    fonte,
    tuttoCampo,
    idSquadra: f.idSquadra,
    nomeFonte: riga?.squadra ?? mie[0]?.[mie[0].casaId === f.idSquadra ? "casa" : "ospite"] ?? null,
    prossime,
    ultimi: giocate.slice(-5).reverse(),
    sospese,
    turno: g.turno,
    classifica: g.classifica,
    aggiornataAlla: g.aggiornataAlla,
    posizione: riga,
    giornateTotali: g.giornate.reduce((m, p) => Math.max(m, p.giornata), 0),
  };
}

export const calendari = {
  /** Palinsesto partite di una società (slug di sport.ts / CANALI_TELECOMANDO[].squadra). */
  squadra: base.input(z.object({ squadra: z.string() })).handler(async ({ input }) => palinsesto(input.squadra)),

  /** Una riga per canale squadra: la prossima partita di ciascuno, nell'ordine del telecomando. */
  canali: base.handler(async () => {
    const voci = CANALI_TELECOMANDO.filter((c) => c.tipo === "squadra" && c.squadra && fonteCalcioSquadra(c.squadra));
    const righe = await Promise.all(
      voci.map(async (c) => {
        const p = await palinsesto(c.squadra!);
        return {
          slug: c.slug,
          nome: c.nome,
          logo: c.logo,
          campionato: p?.campionato ?? null,
          letto: p?.letto ?? false,
          prossima: p?.letto ? (p.prossime[0] ?? null) : null,
          ultima: p?.letto ? (p.ultimi[0] ?? null) : null,
          posizione: p?.letto ? (p.posizione?.posizione ?? null) : null,
          punti: p?.letto ? (p.posizione?.punti ?? null) : null,
          lettoIl: p?.fonte.lettoIl ?? null,
        };
      }),
    );
    return { righe, fonte: { nome: "Romagna Sport", sito: ROMAGNA_SPORT, logo: LOGHI_FONTI.romagnaSport }, totaleFonti: FONTI_CALCIO_SQUADRE.length };
  }),
};
