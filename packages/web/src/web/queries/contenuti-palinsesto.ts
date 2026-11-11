import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { client, orpc } from "../lib/api";

/**
 * GESTIONE CONTENUTI E PALINSESTO (28/10/2026) — letture pubbliche e comandi del pannello Super Admin.
 * Le letture pubbliche si ricaricano ogni 60 s: ciò che si pubblica dal pannello compare senza ricaricare la pagina.
 */

export function useCatalogoCms() {
  return useQuery({ ...orpc.contenuti.catalogo.queryOptions(), staleTime: 60_000 });
}
export function useHomeCms(slug: string, codice?: string, anteprima = false) {
  return useQuery({ ...orpc.contenuti.home.queryOptions({ input: { slug, codice, anteprima } }), staleTime: 30_000, refetchInterval: 60_000 });
}
export function useLavoroCms(home = "0") {
  return useQuery({ ...orpc.contenuti.lavoro.queryOptions({ input: { home } }), staleTime: 30_000, refetchInterval: 60_000 });
}
export function usePlaylistCms(id: string) {
  return useQuery({ ...orpc.contenuti.playlist.queryOptions({ input: { id } }), staleTime: 30_000, refetchInterval: 60_000 });
}
export function usePaginaCms(slug: string, codice?: string) {
  return useQuery({ ...orpc.contenuti.pagina.queryOptions({ input: { slug, codice } }), staleTime: 30_000, refetchInterval: 60_000 });
}

export const segnalaErroreCms = (v: Parameters<typeof client.contenuti.segnalaErrore>[0]) => client.contenuti.segnalaErrore(v).catch(() => null);

export type HomeCmsDati = Awaited<ReturnType<typeof client.contenuti.home>>;
export type PlaylistCms = NonNullable<Awaited<ReturnType<typeof client.contenuti.playlist>>["playlist"]>;
export type VoceCms = PlaylistCms["sequenza"][number];
export type SchedaLavoro = Awaited<ReturnType<typeof client.contenuti.lavoro>>["schede"][number];

/* ── pannello ─────────────────────────────────────────────────────────────── */

export function useQuadroCms(codice: string) {
  return useQuery({ ...orpc.contenutiAdmin.quadro.queryOptions({ input: { codice } }), enabled: codice.trim().length > 0, retry: false });
}
export type QuadroCms = Awaited<ReturnType<typeof client.contenutiAdmin.quadro>>;
export type SchedaCms = QuadroCms["schede"][number];
export type CollocazioneCms = QuadroCms["collocazioni"][number];
export type SchedaInCms = Parameters<typeof client.contenutiAdmin.salvaScheda>[0]["scheda"];
export type AnalisiCms = Awaited<ReturnType<typeof client.contenutiAdmin.analizza>>;

export const analizzaUrlCms = (codice: string, url: string) => client.contenutiAdmin.analizza({ codice, url });
export const anteprimaSchedaCms = (codice: string, scheda: SchedaInCms) => client.contenutiAdmin.anteprima({ codice, scheda });

/** Caricamento reale: indirizzo firmato → PUT nell'archivio → il server conferma che il file c'è (e nei limiti). */
export async function caricaFileCms(codice: string, tipo: "immagine" | "video", file: File, avanzamento?: (p: number) => void) {
  const { url, chiave } = await client.contenutiAdmin.presign({ codice, tipo, filename: file.name, contentType: file.type || "application/octet-stream", peso: file.size });
  await new Promise<void>((ok, ko) => {
    const x = new XMLHttpRequest();
    x.open("PUT", url);
    x.setRequestHeader("Content-Type", file.type || "application/octet-stream");
    x.upload.onprogress = (e) => e.lengthComputable && avanzamento?.(Math.round((e.loaded / e.total) * 100));
    x.onload = () => (x.status >= 200 && x.status < 300 ? ok() : ko(new Error(`Caricamento non riuscito (HTTP ${x.status}).`)));
    x.onerror = () => ko(new Error("Caricamento interrotto: connessione assente o archivio non raggiungibile."));
    x.send(file);
  });
  return client.contenutiAdmin.conferma({ codice, tipo, chiave });
}

function mutazione<A, R>(fn: (a: A) => Promise<R>) {
  return function useMutazione() {
    const qc = useQueryClient();
    return useMutation({
      mutationFn: fn,
      onSuccess: () => {
        void qc.invalidateQueries({ queryKey: orpc.contenutiAdmin.key() });
        void qc.invalidateQueries({ queryKey: orpc.contenuti.key() });
        void qc.invalidateQueries({ queryKey: orpc.caroselli.key() });
        void qc.invalidateQueries({ queryKey: orpc.channelRegistro.key() });
      },
    });
  };
}
type P<K extends keyof typeof client.contenutiAdmin> = Parameters<(typeof client.contenutiAdmin)[K]>[0];

export const useSalvaSchedaCms = mutazione((v: P<"salvaScheda">) => client.contenutiAdmin.salvaScheda(v));
export const useStatoSchedaCms = mutazione((v: P<"statoScheda">) => client.contenutiAdmin.statoScheda(v));
export const useEliminaSchedaCms = mutazione((v: P<"eliminaScheda">) => client.contenutiAdmin.eliminaScheda(v));
export const useSalvaCollocazioneCms = mutazione((v: P<"salvaCollocazione">) => client.contenutiAdmin.salvaCollocazione(v));
export const useEliminaCollocazioneCms = mutazione((v: P<"eliminaCollocazione">) => client.contenutiAdmin.eliminaCollocazione(v));
export const useOrdinaCollocazioniCms = mutazione((v: P<"ordinaCollocazioni">) => client.contenutiAdmin.ordinaCollocazioni(v));
export const useSalvaPlaylistCms = mutazione((v: P<"salvaPlaylist">) => client.contenutiAdmin.salvaPlaylist(v));
export const useEliminaPlaylistCms = mutazione((v: P<"eliminaPlaylist">) => client.contenutiAdmin.eliminaPlaylist(v));
export const useSalvaCaroselloCms = mutazione((v: P<"salvaCarosello">) => client.contenutiAdmin.salvaCarosello(v));
export const useSalvaHomeCms = mutazione((v: P<"salvaHome">) => client.contenutiAdmin.salvaHome(v));
export const usePubblicaHomeCms = mutazione((v: P<"pubblicaHome">) => client.contenutiAdmin.pubblicaHome(v));
export const useStatoHomeCms = mutazione((v: P<"statoHome">) => client.contenutiAdmin.statoHome(v));
export const useOrdinaHomesCms = mutazione((v: P<"ordinaHomes">) => client.contenutiAdmin.ordinaHomes(v));
export const useSalvaCanaleCms = mutazione((v: P<"salvaCanale">) => client.contenutiAdmin.salvaCanale(v));
export const useModificaRegistroCms = mutazione((v: P<"modificaRegistro">) => client.contenutiAdmin.modificaRegistro(v));
export const useSpostaCanaleCms = mutazione((v: P<"spostaCanale">) => client.contenutiAdmin.spostaCanale(v));
export const useEliminaHomeCms = mutazione((v: P<"eliminaHome">) => client.contenutiAdmin.eliminaHome(v));
export const useEliminaCanaleCms = mutazione((v: P<"eliminaCanale">) => client.contenutiAdmin.eliminaCanale(v));
/* 04/11/2026 (round 18) — spazi vuoti in blocco (nessun limite totale). */
export const useAggiungiSpaziCms = mutazione((v: P<"aggiungiSpazi">) => client.contenutiAdmin.aggiungiSpazi(v));
export const useRimuoviSpaziVuotiCms = mutazione((v: P<"rimuoviSpaziVuoti">) => client.contenutiAdmin.rimuoviSpaziVuoti(v));
export const useSvuotaErroriCms = mutazione((v: P<"svuotaErrori">) => client.contenutiAdmin.svuotaErrori(v));

/* ── copie di sicurezza e pubblicazione dei dati (pubblicazioneAdmin) ─────── */

export function useCopieSicurezza(codice: string) {
  return useQuery({ ...orpc.pubblicazioneAdmin.copie.queryOptions({ input: { codice } }), enabled: codice.trim().length > 0, retry: false });
}
export function useConfrontoTematici(codice: string) {
  return useQuery({ ...orpc.pubblicazioneAdmin.confrontoTematici.queryOptions({ input: { codice } }), enabled: codice.trim().length > 0, retry: false });
}
function mutazioneCopie<A, R>(fn: (a: A) => Promise<R>) {
  return function useMutazione() {
    const qc = useQueryClient();
    return useMutation({ mutationFn: fn, onSuccess: () => void qc.invalidateQueries() });
  };
}
type PP<K extends keyof typeof client.pubblicazioneAdmin> = Parameters<(typeof client.pubblicazioneAdmin)[K]>[0];
export const useCreaCopia = mutazioneCopie((v: PP<"creaCopia">) => client.pubblicazioneAdmin.creaCopia(v));
export const useRipristinaCopia = mutazioneCopie((v: PP<"ripristina">) => client.pubblicazioneAdmin.ripristina(v));
export const usePromuoviTematici = mutazioneCopie((v: PP<"promuoviTematici">) => client.pubblicazioneAdmin.promuoviTematici(v));
