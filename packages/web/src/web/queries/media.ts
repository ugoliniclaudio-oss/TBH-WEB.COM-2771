import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { orpc, client } from "../lib/api";
import { preparaImmagine } from "../lib/ottimizza-immagine";

/**
 * MEDIA MANAGER TBH — lato pannello.
 *
 * Un solo insieme di funzioni per tutto il sito: carica, sostituisci, riusa dalla libreria,
 * riordina, metti in bozza o pubblica, elimina con avviso. Le pagine non parlano più
 * direttamente con l'archivio: usano il componente unico, che usa questi hook.
 */

/** Il pannello di allestimento è attivo sul server? (e quali formati accetta) */
export function useStatoAllestimento() {
  return useQuery(orpc.media.stato.queryOptions());
}

/**
 * Materiali caricati su uno slot. Col codice di allestimento arrivano anche le BOZZE,
 * così il pannello vede quello che il pubblico non vede ancora.
 */
export function useMediaSlot(slot: string, codice?: string) {
  return useQuery(orpc.media.perSlot.queryOptions({ input: { slot, codice } }));
}

/** Tutti i materiali caricati, per il pannello. */
export function useMediaElenco() {
  return useQuery(orpc.media.elenco.queryOptions());
}

/** Materiali di tutti gli slot che iniziano per un prefisso (es. le copertine del magazine). */
export function useMediaPrefisso(prefisso: string, codice?: string) {
  return useQuery(orpc.media.perPrefisso.queryOptions({ input: { prefisso, codice } }));
}

/** Quanti materiali per slot, dato un prefisso: serve per scrivere «12 pagine caricate». */
export function useMediaConteggi(prefisso: string, codice?: string) {
  return useQuery(orpc.media.conteggi.queryOptions({ input: { prefisso, codice } }));
}

export type FiltriLibreria = {
  q?: string;
  categoria?: string;
  /**
   * I tipi sono quelli dell'archivio (api/routes/media.ts). Dal 29/09/2026 ci sono anche
   * `prodotto`, `locandina`, `copertina`, `thumbnail`, `servizio`: serviva distinguere
   * una foto da un logo, perché «non tutto deve avere un logo» (ordine di Claudio).
   */
  tipo?:
    | "logo"
    | "immagine"
    | "slide"
    | "documento"
    | "pulsante"
    | "prodotto"
    | "locandina"
    | "copertina"
    | "thumbnail"
    | "servizio";
  stato?: "bozza" | "pubblicato" | "archiviato";
  codice?: string;
  limite?: number;
  offset?: number;
};

/** LIBRERIA MEDIA TBH: ricerca su tutto l'archivio, per riusare quello che c'è già. */
export function useMediaLibreria(filtri: FiltriLibreria) {
  return useQuery(
    orpc.media.libreria.queryOptions({
      input: {
        q: filtri.q?.trim() || undefined,
        categoria: filtri.categoria || undefined,
        tipo: filtri.tipo,
        stato: filtri.stato,
        codice: filtri.codice || undefined,
        limite: filtri.limite ?? 120,
        offset: filtri.offset ?? 0,
      },
    }),
  );
}

/** Dove è usata un'immagine: serve per l'avviso prima di eliminare. */
export function useUsiMedia(chiave: string) {
  return useQuery({
    ...orpc.media.usi.queryOptions({ input: { chiave } }),
    enabled: chiave.trim().length > 0,
  });
}

function useInvalida() {
  const qc = useQueryClient();
  return () => {
    qc.invalidateQueries({ queryKey: orpc.media.elenco.queryKey() });
    qc.invalidateQueries({ queryKey: orpc.media.perSlot.key() });
    qc.invalidateQueries({ queryKey: orpc.media.perPrefisso.key() });
    qc.invalidateQueries({ queryKey: orpc.media.conteggi.key() });
    qc.invalidateQueries({ queryKey: orpc.media.libreria.key() });
    qc.invalidateQueries({ queryKey: orpc.media.usi.key() });
  };
}

export type TipoMediaCaricamento = "logo" | "immagine" | "slide" | "documento";

export type DatiCaricamento = {
  codice: string;
  slot: string;
  file: File;
  tipo: TipoMediaCaricamento;
  titolo?: string;
  descrizione?: string;
  tag?: string;
  indirizzo?: string;
  mapsUrl?: string;
  linkUrl?: string;
  /** bozza = salvato ma non ancora pubblico. Serve per «salva anche senza immagine definitiva». */
  stato?: "bozza" | "pubblicato" | "archiviato";
  ordine?: number;
};

/** Passo comune: chiedi il link firmato, metti il file nell'archivio, torna la chiave. */
async function mandaFile(
  codice: string,
  slot: string,
  file: File,
  tipo: TipoMediaCaricamento,
  originale: boolean,
) {
  const { url, chiave } = await client.media.presign({
    codice,
    slot,
    filename: file.name,
    contentType: file.type || "application/octet-stream",
    tipo,
    originale,
  });
  const r = await fetch(url, {
    method: "PUT",
    body: file,
    headers: { "Content-Type": file.type || "application/octet-stream" },
  });
  if (!r.ok) throw new Error(`Caricamento non riuscito (${r.status}).`);
  return chiave;
}

/**
 * CARICAMENTO REALE, in tre passi:
 * 1. la foto viene ottimizzata nel browser (i loghi e i documenti mai);
 * 2. il file va nell'archivio del portale — e l'originale a fianco, se è stato ridotto;
 * 3. nel database resta il riferimento, con titolo, descrizione, tag, link e stato.
 */
export function useCaricaMedia() {
  const invalida = useInvalida();
  return useMutation({
    mutationFn: async (d: DatiCaricamento) => {
      const pronta = await preparaImmagine(d.file, d.tipo);
      const chiave = await mandaFile(d.codice, d.slot, pronta.file, d.tipo, false);
      const chiaveOriginale = pronta.originale
        ? await mandaFile(d.codice, d.slot, pronta.originale, d.tipo, true)
        : undefined;
      return client.media.salva({
        codice: d.codice,
        slot: d.slot,
        chiave,
        chiaveOriginale,
        tipo: d.tipo,
        titolo: d.titolo,
        descrizione: d.descrizione,
        tag: d.tag,
        indirizzo: d.indirizzo,
        mapsUrl: d.mapsUrl,
        linkUrl: d.linkUrl,
        stato: d.stato ?? "pubblicato",
        ordine: d.ordine,
        mime: pronta.file.type || undefined,
        peso: pronta.file.size,
        larghezza: pronta.larghezza || undefined,
        altezza: pronta.altezza || undefined,
      });
    },
    onSuccess: invalida,
  });
}

/** SOSTITUISCI: cambia il file di un materiale, lasciando slot, titolo, link e posizione. */
export function useSostituisciMedia() {
  const invalida = useInvalida();
  return useMutation({
    mutationFn: async (d: {
      codice: string;
      id: number;
      slot: string;
      file: File;
      tipo: TipoMediaCaricamento;
    }) => {
      const pronta = await preparaImmagine(d.file, d.tipo);
      const chiave = await mandaFile(d.codice, d.slot, pronta.file, d.tipo, false);
      const chiaveOriginale = pronta.originale
        ? await mandaFile(d.codice, d.slot, pronta.originale, d.tipo, true)
        : undefined;
      return client.media.sostituisci({
        codice: d.codice,
        id: d.id,
        chiave,
        chiaveOriginale,
        mime: pronta.file.type || undefined,
        peso: pronta.file.size,
        larghezza: pronta.larghezza || undefined,
        altezza: pronta.altezza || undefined,
      });
    },
    onSuccess: invalida,
  });
}

/**
 * RIUSA: mette su un altro slot un'immagine già in archivio, senza ricaricarla.
 * Il file resta uno solo; i punti del sito che lo mostrano possono essere tanti.
 */
export function useRiusaMedia() {
  const invalida = useInvalida();
  return useMutation({ ...orpc.media.riusa.mutationOptions(), onSuccess: invalida });
}

/**
 * Alternativa al caricamento del file: si incolla il link di un'immagine già online.
 * Resta una scorciatoia: il file non è nostro e se la fonte lo toglie l'immagine sparisce.
 */
export function useSalvaLinkMedia() {
  const invalida = useInvalida();
  return useMutation({ ...orpc.media.salvaLink.mutationOptions(), onSuccess: invalida });
}

/** Pulsante pronto: logo (facoltativo) + titolo per esteso + link di destinazione. */
export function useSalvaPulsante() {
  const invalida = useInvalida();
  return useMutation({ ...orpc.media.salvaPulsante.mutationOptions(), onSuccess: invalida });
}

export function useAggiornaMedia() {
  const invalida = useInvalida();
  return useMutation({ ...orpc.media.aggiorna.mutationOptions(), onSuccess: invalida });
}

/**
 * INQUADRATURA (29/09/2026, Priorità 2bis): adattamento, focal point e zoom.
 * Salva SOLO come si vede l'immagine: titolo, prezzo, descrizione, link e checkout
 * non vengono toccati. Vale per tutte le misure insieme (card, hero, miniatura, mobile).
 */
export function useInquadraturaMedia() {
  const invalida = useInvalida();
  return useMutation({ ...orpc.media.inquadratura.mutationOptions(), onSuccess: invalida });
}

/** BOZZA → PUBBLICATO → ARCHIVIATO. */
export function usePubblicaMedia() {
  const invalida = useInvalida();
  return useMutation({ ...orpc.media.pubblica.mutationOptions(), onSuccess: invalida });
}

/** Riordino di una gallery: gli id nell'ordine in cui devono comparire. */
export function useRiordinaMedia() {
  const invalida = useInvalida();
  return useMutation({ ...orpc.media.riordina.mutationOptions(), onSuccess: invalida });
}

/**
 * ELIMINA con avviso. Se il file è usato anche altrove la risposta è
 * `{ ok: false, usato: [...] }` e NIENTE viene cancellato: il pannello mostra l'avviso
 * e ripete la chiamata con `forza: true` solo se Claudio conferma.
 */
export function useEliminaMedia() {
  const invalida = useInvalida();
  return useMutation({ ...orpc.media.elimina.mutationOptions(), onSuccess: invalida });
}

/**
 * Sposta i materiali da uno slot di bozza allo slot definitivo.
 * Serve alle schede nuove: si carica la copertina prima che il numero esista.
 */
export function useSpostaSlot() {
  const invalida = useInvalida();
  return useMutation({ ...orpc.media.spostaSlot.mutationOptions(), onSuccess: invalida });
}

export function useVerificaCodice() {
  return useMutation(orpc.media.verifica.mutationOptions());
}
