import { useEffect, useMemo, useState } from "react";
import type { ElementoCanale } from "../../api/lib/touch-canali";
import type { CanaleTouchId } from "../../api/data/touch-canali";
import { usePalinsestoCanale } from "../queries/canali-touch";
import { giornoDopo } from "./use-radio-adesso";

/**
 * Orologio di UN canale (TOUCH RADIO o TOUCH TV): ora del dispositivo corretta con
 * quella del server + scaletta del canale di oggi e di domani. Con il palinsesto
 * condiviso i due canali leggono la stessa scaletta; con i palinsesti separati ognuno
 * legge la sua. Stessa logica di `useRadioAdesso`, che resta per le pagine esistenti.
 */

/** Evento con cui i pulsanti fuori dal player accendono il player del canale. */
export const eventoAccendi = (canale: CanaleTouchId) => `tbh-canale-accendi-${canale}`;

/** Chiave sessionStorage: il carosello chiede alla pagina del canale di partire subito. */
export const CHIAVE_AVVIO = "tbh-canale-avvio";

export function useCanaleAdesso(canale: CanaleTouchId, passoMs = 1000) {
  const oggi = usePalinsestoCanale(canale);
  const domani = usePalinsestoCanale(canale, oggi.data ? giornoDopo(oggi.data.giorno) : undefined);

  const scarto = useMemo(
    () => (oggi.data ? oggi.data.adesso - oggi.dataUpdatedAt : 0),
    [oggi.data, oggi.dataUpdatedAt],
  );
  const [ora, setOra] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setOra(Date.now()), passoMs);
    return () => clearInterval(t);
  }, [passoMs]);
  const adesso = ora + scarto;

  const elementi: ElementoCanale[] = useMemo(() => {
    const a = oggi.data?.elementi ?? [];
    const b = domani.data && domani.data.giorno !== oggi.data?.giorno ? domani.data.elementi : [];
    return [...a, ...b];
  }, [oggi.data, domani.data]);

  const indice = elementi.findIndex((e) => e.inizio <= adesso && adesso < e.fine);
  const corrente = indice >= 0 ? elementi[indice]! : null;

  const ultimaFine = oggi.data?.elementi.at(-1)?.fine ?? Infinity;
  useEffect(() => {
    if (oggi.data && adesso >= ultimaFine) void oggi.refetch();
  }, [adesso, ultimaFine, oggi]);

  return { oggi, scarto, adesso, elementi, indice, corrente };
}

/** Sessione anonima del browser per le statistiche del canale (nessun dato personale). */
export function sessioneCanale(): string {
  const k = "tbh-canale-sessione";
  try {
    let s = sessionStorage.getItem(k);
    if (!s) {
      s = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
      sessionStorage.setItem(k, s);
    }
    return s;
  } catch {
    return `anonima-${Math.random().toString(36).slice(2, 10)}`;
  }
}
