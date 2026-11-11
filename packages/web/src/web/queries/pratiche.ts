import { useCallback, useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { orpc, client } from "../lib/api";
import { preparaImmagine } from "../lib/ottimizza-immagine";

/**
 * CARICAMENTO FILE DAI MODULI PUBBLICI (candidature).
 *
 * Ordine di Claudio del 28/09/2026: «il modulo di candidatura deve permettere il
 * caricamento reale dei file […] niente upload finti: il file deve essere trasferito
 * e risultare visibile e scaricabile dal pannello».
 *
 * Chi compila un modulo non ha il codice di allestimento, quindi non può usare gli
 * hook del Media Manager. Usa una PRATICA: un permesso a tempo che il server apre
 * alla prima scelta di un file (api/routes/pratiche.ts). I file finiscono comunque
 * nella stessa tabella `media`, sugli stessi slot: non c'è un secondo archivio.
 *
 * Il token della pratica resta anche in sessionStorage: se la pagina si ricarica a
 * metà compilazione i file già trasferiti non si perdono.
 */

export type AmbitoPratica = "miss-cool" | "lavoro" | "casting";

export type FilePratica = {
  id: number;
  campo: string;
  nome: string;
  url: string;
  tipo: string;
  mime: string | null;
  peso: number | null;
  riservato: number;
  ordine: number;
};

function chiaveSessione(ambito: AmbitoPratica) {
  return `tbh:pratica:${ambito}`;
}

/** Campi e limiti del modulo, dichiarati dal server: la pagina non li riscrive. */
export function useConfigurazionePratica(ambito: AmbitoPratica) {
  return useQuery(orpc.pratiche.configurazione.queryOptions({ input: { ambito } }));
}

/**
 * La pratica di caricamento di questo modulo. Non apre niente da sola: il permesso
 * nasce al primo file scelto (`assicura()`), così chi guarda la pagina e non carica
 * nulla non lascia pratiche vuote.
 */
export function usePratica(ambito: AmbitoPratica) {
  const qc = useQueryClient();
  const [token, setToken] = useState<string>(() => {
    if (typeof sessionStorage === "undefined") return "";
    return sessionStorage.getItem(chiaveSessione(ambito)) ?? "";
  });
  const inApertura = useRef<Promise<string> | null>(null);

  useEffect(() => {
    if (typeof sessionStorage === "undefined") return;
    if (token) sessionStorage.setItem(chiaveSessione(ambito), token);
  }, [ambito, token]);

  const elenco = useQuery({
    ...orpc.pratiche.elenco.queryOptions({ input: { token } }),
    enabled: token.length > 0,
  });

  /** Ritorna il token, aprendo la pratica se non c'è ancora. Una sola apertura alla volta. */
  const assicura = useCallback(async () => {
    if (token) return token;
    if (!inApertura.current) {
      inApertura.current = client.pratiche
        .apri({ ambito })
        .then((r) => {
          setToken(r.token);
          return r.token;
        })
        .finally(() => {
          inApertura.current = null;
        });
    }
    return inApertura.current;
  }, [ambito, token]);

  const ricarica = useCallback(
    (t?: string) => {
      const usato = t || token;
      if (!usato) return;
      qc.invalidateQueries({ queryKey: orpc.pratiche.elenco.queryKey({ input: { token: usato } }) });
    },
    [qc, token],
  );

  /** Azzera il modulo dopo l'invio: la pratica è chiusa, il token non serve più. */
  const dimentica = useCallback(() => {
    if (typeof sessionStorage !== "undefined") sessionStorage.removeItem(chiaveSessione(ambito));
    setToken("");
  }, [ambito]);

  const items = (elenco.data?.items ?? []) as FilePratica[];

  return {
    token,
    assicura,
    ricarica,
    dimentica,
    caricamento: elenco.isLoading,
    /** Tutti i file già trasferiti, per campo. */
    perCampo: (campo: string) => items.filter((f) => f.campo === campo),
    items,
  };
}

/**
 * TRASFERIMENTO REALE DI UN FILE.
 * Passo 1: link firmato dal server (lo slot lo decide il server, non il browser).
 * Passo 2: PUT del file nell'archivio. Passo 3: registrazione nel portale.
 * Le foto passano prima dall'ottimizzazione nel browser, i documenti mai.
 */
export function useCaricaFilePratica() {
  return useMutation({
    mutationFn: async (d: {
      token: string;
      campo: string;
      file: File;
      tipo: "immagine" | "documento";
      /** id del file da rimpiazzare, per SOSTITUISCI. */
      sostituisce?: number;
    }) => {
      const pronto =
        d.tipo === "documento"
          ? { file: d.file, larghezza: 0, altezza: 0 }
          : await preparaImmagine(d.file, "immagine");

      const { url, chiave } = await client.pratiche.presign({
        token: d.token,
        campo: d.campo,
        filename: pronto.file.name,
        contentType: pronto.file.type || d.file.type || "",
        peso: pronto.file.size,
        sostituisce: d.sostituisce,
      });

      const risposta = await fetch(url, {
        method: "PUT",
        body: pronto.file,
        headers: { "Content-Type": pronto.file.type || "application/octet-stream" },
      });
      if (!risposta.ok) {
        throw new Error(
          "Il file non è arrivato nell'archivio: controlla la connessione e riprova.",
        );
      }

      return client.pratiche.salva({
        token: d.token,
        campo: d.campo,
        chiave,
        nome: d.file.name,
        mime: pronto.file.type || d.file.type || undefined,
        peso: pronto.file.size,
        larghezza: pronto.larghezza || undefined,
        altezza: pronto.altezza || undefined,
        sostituisce: d.sostituisce,
      });
    },
  });
}

/** Rimozione di un file caricato per errore, prima dell'invio. */
export function useEliminaFilePratica() {
  return useMutation({
    mutationFn: (d: { token: string; id: number }) => client.pratiche.elimina(d),
  });
}
