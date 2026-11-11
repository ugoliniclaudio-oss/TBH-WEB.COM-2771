import { z } from "zod";
import { ORPCError } from "@orpc/server";
import { base } from "../__core/app";
import { AMBIENTE } from "../lib/ambiente";
import { logoDelChannel } from "../data/loghi-channel";
import {
  CAPACITA,
  CATEGORIE_TALENT,
  IMPOSTAZIONI_PREDEFINITE,
  SLUG_TALENT,
  aggiornaMonitor,
  aggiungiAlPalinsesto,
  aggiungiErroreTalent,
  analizzaTalent,
  creaMonitor,
  eliminaMonitor,
  impostazioni,
  infoTalent,
  leggiMetaMonitor,
  monitor,
  monitorPerId,
  palinsestoAggiornato,
  registroErroriTalent,
  rigeneraPalinsesto,
  righeTalent,
  salvaImpostazioni,
  scriviMetaMonitor,
  statoOnda,
  svuotaErroriTalent,
  type EsitoMonitor,
  type Monitor,
} from "../lib/touch-talent";

/**
 * TOUCH TALENT & PROFESSIONALS CHANNEL (28/10/2026).
 * Pubblico: monitor attivi, monitor IN ONDA calcolato dall'ora del server (palinsesto H24 memorizzato,
 * uguale per tutti), «A seguire», carosello degli ultimi 30. Riservato (codice di allestimento):
 * Aggiungi monitor → Incolla URL → Verifica → Attiva, modifica, disattiva, elimina, priorità, registro errori.
 */

const CODICE = () => (process.env.TBH_CODICE_ALLESTIMENTO ?? "").trim();
function controlla(codice: string) {
  const atteso = CODICE();
  if (!atteso) throw new ORPCError("SERVICE_UNAVAILABLE", { message: "Codice di allestimento non configurato sul server." });
  if (codice.trim() !== atteso) throw new ORPCError("UNAUTHORIZED", { message: "Codice di allestimento errato." });
}

const CATEGORIA = z.enum(CATEGORIE_TALENT);
const TESTO = (max: number) => z.string().max(max).nullable().optional();
/** Profilo del protagonista: solo pagine indicate dall'amministratore (percorso interno o https), mai generate. */
const LINK_PROFILO = z
  .string()
  .trim()
  .max(500)
  .refine((s) => s === "" || /^\/(?!\/)[^\s]*$/.test(s) || /^https:\/\/[^\s]+\.[^\s]+$/.test(s), "Profilo: percorso interno (/…) o indirizzo https.")
  .nullable()
  .optional();

const DATI_MONITOR = z.object({
  titolo: TESTO(300),
  miniatura: TESTO(1000),
  protagonista: TESTO(120),
  linkProtagonista: LINK_PROFILO,
  categorie: z.array(CATEGORIA).max(4).optional(),
  emergente: z.boolean().optional(),
  durataSec: z.number().int().min(1).max(6 * 3600).nullable().optional(),
  fonte: TESTO(160),
});

/** Un profilo esterno deve rispondere davvero: niente collegamenti a pagine inesistenti. */
async function profiloRaggiungibile(link: string | null | undefined) {
  if (!link || !link.startsWith("https://")) return;
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 8000);
    const r = await fetch(link, { redirect: "follow", signal: ctrl.signal, headers: { "user-agent": "Mozilla/5.0 (compatible; TBH-Talent/1.0)" } }).finally(() => clearTimeout(t));
    await r.body?.cancel().catch(() => undefined);
    if (r.status === 404 || r.status === 410) throw new ORPCError("BAD_REQUEST", { message: `Il profilo ${link} non esiste (HTTP ${r.status}).` });
  } catch (e) {
    if (e instanceof ORPCError) throw e;
    // rete lenta o sito che blocca i robot: il collegamento resta, la verifica è dichiarata non riuscita
  }
}

function pubblico(m: Monitor) {
  return {
    id: m.id,
    titolo: m.titolo,
    url: m.url,
    piattaforma: m.piattaforma,
    embedId: m.embedId,
    miniatura: m.miniatura,
    protagonista: m.protagonista,
    linkProtagonista: m.linkProtagonista,
    categorie: m.categorie,
    emergente: m.emergente,
    durataSec: m.durataSec,
    capacita: m.capacita,
    fonte: m.fonte,
    attivatoIl: m.attivatoIl ?? m.creato,
  };
}
export type MonitorPubblico = ReturnType<typeof pubblico>;

/** Ultimi 30 attivati, in ordine casuale STABILE: il seme è l'ultimo inserimento (cambia solo quando ne arriva uno nuovo). */
function ultimi(attivi: Monitor[]) {
  const recenti = [...attivi].sort((a, b) => (b.attivatoIl ?? b.creato) - (a.attivatoIl ?? a.creato) || b.id - a.id).slice(0, 30);
  const seme = recenti.reduce((s, m) => Math.max(s, m.id * 1_000 + ((m.attivatoIl ?? m.creato) % 1_000)), 0);
  let a = seme >>> 0 || 1;
  const r = () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  for (let i = recenti.length - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1));
    [recenti[i], recenti[j]] = [recenti[j]!, recenti[i]!];
  }
  return { voci: recenti.map(pubblico), seme };
}

const ultimeSegnalazioni = new Map<string, number>();

export const touchTalent = {
  canale: base.handler(async () => {
    const ora = Date.now();
    const { p, attivi } = await palinsestoAggiornato(ora);
    const logo = logoDelChannel(SLUG_TALENT);
    const perId = new Map(attivi.map((m) => [m.id, m]));
    const onda = p ? statoOnda(p, ora, 8) : null;
    const car = ultimi(attivi);
    return {
      nome: "TOUCH TALENT & PROFESSIONALS",
      logo: logo?.src ?? null,
      ora,
      giro: p?.giro ?? 0,
      monitor: attivi.map(pubblico),
      inOnda:
        onda && perId.has(onda.slot.id)
          ? {
              monitor: pubblico(perId.get(onda.slot.id)!),
              inizio: onda.inizio,
              fine: onda.fine,
              durataStimata: onda.slot.stimata,
              restantiNelGiro: onda.restanti,
              fineGiro: onda.fineGiro,
            }
          : null,
      seguenti: (onda?.seguenti ?? []).filter((s) => perId.has(s.slot.id)).map((s) => ({ monitor: pubblico(perId.get(s.slot.id)!), inizio: s.inizio, fine: s.inizio + s.slot.durata * 1000, stimata: s.slot.stimata })),
      ultimi: car.voci,
      semeUltimi: car.seme,
    };
  }),

  /** Il player non riesce a riprodurre il monitor: si registra e si ricontrolla la fonte (al massimo ogni 10 minuti). */
  segnalaErrore: base.input(z.object({ id: z.number().int(), codice: z.string().max(40), messaggio: z.string().max(300) })).handler(async ({ input }) => {
    const k = `${input.id}:${input.codice}`;
    const ora = Date.now();
    if (ora - (ultimeSegnalazioni.get(k) ?? 0) < 60_000) return { registrato: false, tolto: false };
    ultimeSegnalazioni.set(k, ora);
    const r = await monitorPerId(input.id);
    if (!r) return { registrato: false, tolto: false };
    const m = leggiMetaMonitor(r);
    m.errori += 1;
    m.ultimoErrore = { quando: ora, messaggio: `${input.codice}: ${input.messaggio}` };
    let esito = "segnalato dal player (fonte non ricontrollata: ultima verifica recente)";
    let tolto = false;
    if (!m.verifica || ora - m.verifica.quando > 10 * 60_000) {
      const a = analizzaTalent(r.link ?? r.sorgente);
      if ("piattaforma" in a) {
        const info = await infoTalent(a);
        m.verifica = { quando: info.quando, esito: info.esito, messaggio: info.messaggio };
        if (info.esito === "errore" && m.stato === "attivo") {
          m.stato = "non-disponibile";
          tolto = true;
          esito = `ricontrollato: ${info.messaggio} → NON DISPONIBILE, tolto dal palinsesto`;
        } else esito = `ricontrollato: ${info.messaggio} (resta in palinsesto: problema del dispositivo dello spettatore)`;
      }
    }
    await aggiornaMonitor(r.id, { descrizione: scriviMetaMonitor(m), ...(tolto ? { attivo: 0 } : {}) });
    await aggiungiErroreTalent({ quando: ora, id: r.id, titolo: r.titolo, codice: input.codice, messaggio: input.messaggio, esito });
    if (tolto) await palinsestoAggiornato();
    return { registrato: true, tolto };
  }),

  /** Durata letta dal player (file video, YouTube senza durata): solo se la fonte non l'aveva data. Vale dal giro successivo. */
  segnalaDurata: base.input(z.object({ id: z.number().int(), durataSec: z.number().min(1).max(6 * 3600) })).handler(async ({ input }) => {
    const r = await monitorPerId(input.id);
    if (!r || r.durataSec) return { ok: false };
    const m = leggiMetaMonitor(r);
    m.durataDa = "player";
    await aggiornaMonitor(r.id, { durataSec: Math.round(input.durataSec), descrizione: scriviMetaMonitor(m) });
    return { ok: true };
  }),
};

export const touchTalentAdmin = {
  quadro: base.input(z.object({ codice: z.string() })).handler(async ({ input }) => {
    controlla(input.codice);
    const ora = Date.now();
    const [{ p }, righe, imp, errori] = await Promise.all([palinsestoAggiornato(ora), righeTalent(), impostazioni(), registroErroriTalent()]);
    const tutti = righe.map(monitor);
    const perId = new Map(tutti.map((m) => [m.id, m]));
    const onda = p ? statoOnda(p, ora, 40) : null;
    return {
      ambiente: AMBIENTE,
      ora,
      monitor: tutti,
      impostazioni: imp,
      predefinite: IMPOSTAZIONI_PREDEFINITE,
      capacita: CAPACITA,
      palinsesto: p
        ? {
            giro: p.giro,
            visti: p.visti.length,
            slotNelGiro: p.visti.length + p.ordine.length,
            inOnda: onda ? { id: onda.slot.id, titolo: perId.get(onda.slot.id)?.titolo ?? "—", inizio: onda.inizio, fine: onda.fine, stimata: onda.slot.stimata } : null,
            seguenti: (onda?.seguenti ?? []).map((s) => ({ id: s.slot.id, titolo: perId.get(s.slot.id)?.titolo ?? "—", inizio: s.inizio, durata: s.slot.durata, stimata: s.slot.stimata })),
            fineGiro: onda?.fineGiro ?? null,
            aggiornato: p.aggiornato,
          }
        : null,
      errori: errori.slice(0, 100),
    };
  }),

  /** Verifica: anteprima di uno o più URL (uno per riga) senza inserirli. */
  analizza: base.input(z.object({ codice: z.string(), testo: z.string().max(30_000) })).handler(async ({ input }) => {
    controlla(input.codice);
    const urls = [...new Set(input.testo.split(/[\n\r]+/).map((s) => s.trim()).filter((s) => s.length > 3))];
    if (urls.length > 40) throw new ORPCError("BAD_REQUEST", { message: "Massimo 40 URL per volta." });
    const righe = await righeTalent();
    const visti = new Map<string, string>();
    const esiti = [];
    for (let i = 0; i < urls.length; i += 4) {
      esiti.push(
        ...(await Promise.all(
          urls.slice(i, i + 4).map(async (u) => {
            const a = analizzaTalent(u);
            if ("errore" in a) return { grezzo: u, valido: false as const, messaggio: a.errore };
            const doppio = righe.find((r) => r.sorgente === a.sorgente);
            const ripetuto = visti.get(a.sorgente);
            visti.set(a.sorgente, u);
            const info = await infoTalent(a);
            const cap = CAPACITA[a.piattaforma];
            return {
              grezzo: u,
              valido: true as const,
              ...a,
              ...info,
              nomePiattaforma: cap.nome,
              capacita: { durata: !!info.durataSec, seek: cap.seek, fine: cap.fine, autoplay: cap.autoplay },
              duplicato: doppio ? { id: doppio.id, titolo: doppio.titolo } : null,
              ripetuto: ripetuto && ripetuto !== u ? ripetuto : null,
            };
          }),
        )),
      );
    }
    return { esiti };
  }),

  /** Attiva (o salva in bozza) i monitor verificati: uno per URL. */
  crea: base
    .input(z.object({ codice: z.string(), attiva: z.boolean(), voci: z.array(DATI_MONITOR.extend({ url: z.string().min(3).max(1000) })).min(1).max(40) }))
    .handler(async ({ input }) => {
      controlla(input.codice);
      for (const v of input.voci) await profiloRaggiungibile(v.linkProtagonista);
      const righe = await righeTalent();
      const esiti: EsitoMonitor[] = [];
      for (const v of input.voci) esiti.push(await creaMonitor(v.url, v, input.attiva, righe));
      return {
        esiti,
        attivati: esiti.filter((e) => e.stato === "attivo").length,
        bozze: esiti.filter((e) => e.stato === "bozza").length,
        duplicati: esiti.filter((e) => e.esito === "duplicato").length,
        nonValidi: esiti.filter((e) => e.esito === "non-valido").length,
      };
    }),

  aggiorna: base.input(DATI_MONITOR.extend({ codice: z.string(), id: z.number().int(), url: z.string().min(3).max(1000).optional() })).handler(async ({ input }) => {
    controlla(input.codice);
    const r = await monitorPerId(input.id);
    if (!r) throw new ORPCError("NOT_FOUND", { message: "Monitor non trovato." });
    await profiloRaggiungibile(input.linkProtagonista);
    const m = leggiMetaMonitor(r);
    const set: Parameters<typeof aggiornaMonitor>[1] = {};
    if (input.url) {
      const a = analizzaTalent(input.url);
      if ("errore" in a) throw new ORPCError("BAD_REQUEST", { message: a.errore });
      if (a.sorgente !== r.sorgente) {
        if ((await righeTalent()).some((x) => x.id !== r.id && x.sorgente === a.sorgente)) throw new ORPCError("CONFLICT", { message: "URL già presente in un altro monitor." });
        Object.assign(set, { sorgente: a.sorgente, link: a.url, attivo: 0 });
        Object.assign(m, { piattaforma: a.piattaforma, embedId: a.embedId, verifica: null, stato: "bozza" });
        if (m.durataDa !== "manuale") {
          set.durataSec = null;
          m.durataDa = null;
        }
      }
    }
    if (input.titolo?.trim()) set.titolo = input.titolo.trim();
    if (input.fonte !== undefined) set.attribuzione = input.fonte?.trim() || null;
    if (input.miniatura !== undefined) m.miniatura = input.miniatura?.trim() || null;
    if (input.protagonista !== undefined) m.protagonista = input.protagonista?.trim() || null;
    if (input.linkProtagonista !== undefined) m.linkProtagonista = input.linkProtagonista?.trim() || null;
    if (input.categorie) m.categorie = [...new Set(input.categorie)];
    if (input.emergente !== undefined) m.emergente = input.emergente;
    if (input.durataSec !== undefined) {
      set.durataSec = input.durataSec;
      m.durataDa = input.durataSec ? "manuale" : null;
    }
    await aggiornaMonitor(r.id, { ...set, descrizione: scriviMetaMonitor(m) });
    await palinsestoAggiornato();
    return { ok: true };
  }),

  /** Ricontrolla la fonte: titolo, miniatura e durata si riempiono solo se mancanti. */
  verifica: base.input(z.object({ codice: z.string(), id: z.number().int() })).handler(async ({ input }) => {
    controlla(input.codice);
    const r = await monitorPerId(input.id);
    if (!r) throw new ORPCError("NOT_FOUND", { message: "Monitor non trovato." });
    const a = analizzaTalent(r.link ?? r.sorgente);
    if ("errore" in a) throw new ORPCError("BAD_REQUEST", { message: a.errore });
    const info = await infoTalent(a);
    const m = leggiMetaMonitor(r);
    m.verifica = { quando: info.quando, esito: info.esito, messaggio: info.messaggio };
    if (!m.miniatura && info.miniatura) m.miniatura = info.miniatura;
    const durata = info.durataSec && !r.durataSec ? info.durataSec : null;
    if (durata) m.durataDa = "fonte";
    await aggiornaMonitor(r.id, { descrizione: scriviMetaMonitor(m), ...(durata ? { durataSec: durata } : {}) });
    return m.verifica;
  }),

  /** Attiva / disattiva / riporta in bozza. Attivare richiede una verifica riuscita adesso (o la conferma dell'anteprima se la fonte non è verificabile). */
  stato: base
    .input(z.object({ codice: z.string(), id: z.number().int(), stato: z.enum(["attivo", "disattivato", "bozza"]), forza: z.boolean().optional() }))
    .handler(async ({ input }) => {
      controlla(input.codice);
      const r = await monitorPerId(input.id);
      if (!r) throw new ORPCError("NOT_FOUND", { message: "Monitor non trovato." });
      const m = leggiMetaMonitor(r);
      if (input.stato === "attivo") {
        const a = analizzaTalent(r.link ?? r.sorgente);
        if ("errore" in a) throw new ORPCError("BAD_REQUEST", { message: a.errore });
        const info = await infoTalent(a);
        m.verifica = { quando: info.quando, esito: info.esito, messaggio: info.messaggio };
        if (!m.miniatura && info.miniatura) m.miniatura = info.miniatura;
        if (info.esito === "errore") {
          await aggiornaMonitor(r.id, { descrizione: scriviMetaMonitor(m) });
          throw new ORPCError("BAD_REQUEST", { message: `Non riproducibile: ${info.messaggio}` });
        }
        if (info.esito === "non-verificabile" && !input.forza) {
          await aggiornaMonitor(r.id, { descrizione: scriviMetaMonitor(m) });
          throw new ORPCError("PRECONDITION_FAILED", { message: `${info.messaggio} Controllare l'anteprima e confermare.` });
        }
        if (info.durataSec && !r.durataSec) m.durataDa = "fonte";
        m.attivatoIl = m.attivatoIl ?? Date.now();
        m.stato = "attivo";
        await aggiornaMonitor(r.id, { descrizione: scriviMetaMonitor(m), attivo: 1, ...(info.durataSec && !r.durataSec ? { durataSec: info.durataSec } : {}) });
        await aggiungiAlPalinsesto(r.id);
        return { ok: true, verifica: m.verifica };
      }
      m.stato = input.stato;
      await aggiornaMonitor(r.id, { descrizione: scriviMetaMonitor(m), attivo: 0 });
      await palinsestoAggiornato();
      return { ok: true, verifica: m.verifica };
    }),

  elimina: base.input(z.object({ codice: z.string(), id: z.number().int() })).handler(async ({ input }) => {
    controlla(input.codice);
    const r = await monitorPerId(input.id);
    if (!r) throw new ORPCError("NOT_FOUND", { message: "Monitor non trovato." });
    await eliminaMonitor(r.id);
    await palinsestoAggiornato();
    return { ok: true };
  }),

  impostazioni: base
    .input(
      z.object({
        codice: z.string(),
        pesoEmergenti: z.number().int().min(0).max(5),
        pesoNuovi: z.number().int().min(0).max(5),
        giorniNuovo: z.number().int().min(1).max(90),
        durataPredefinita: z.number().int().min(15).max(1800),
        stacco: z.number().int().min(0).max(10),
      }),
    )
    .handler(async ({ input }) => {
      controlla(input.codice);
      const { codice: _c, ...imp } = input;
      await salvaImpostazioni(imp);
      await palinsestoAggiornato();
      return { ok: true };
    }),

  /** Nuovo ordine casuale da adesso (interrompe il monitor in onda: solo su richiesta). */
  rigenera: base.input(z.object({ codice: z.string() })).handler(async ({ input }) => {
    controlla(input.codice);
    await rigeneraPalinsesto();
    return { ok: true };
  }),

  svuotaErrori: base.input(z.object({ codice: z.string() })).handler(async ({ input }) => {
    controlla(input.codice);
    await svuotaErroriTalent();
    return { ok: true };
  }),
};
