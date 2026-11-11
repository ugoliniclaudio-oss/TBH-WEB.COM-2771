import { useEffect, useMemo, useState } from "react";
import type { ElementoRadio } from "../../api/lib/radio-palinsesto";
import { usePalinsestoRadio } from "../queries/radio";

/**
 * Orologio condiviso della J.C. HUGÒ RADIO: l'ora del dispositivo corretta con quella
 * del server, più la scaletta di oggi e di domani (per il passaggio di mezzanotte).
 * Lo usano «ORA IN ONDA», «A SEGUIRE» e il palinsesto: tutti leggono lo stesso istante.
 */

/** Evento con cui i pulsanti fuori dal player accendono la radio. */
export const EVENTO_ACCENDI_RADIO = "tbh-radio-accendi";

/** Nome del programma in onda: musica automatica, pausa pubblicitaria o appuntamento DM. */
export function programmaDi(e: ElementoRadio): string {
  if (e.tipo === "dm") return `DM ON AIR — ${e.titolo}`;
  if (e.tipo === "spot") return "Pausa pubblicitaria";
  return "Musica originale J.C. Hugò · 24/7";
}

export function giornoDopo(data: string, n = 1): string {
  const [a, m, g] = data.split("-").map(Number);
  return new Date(Date.UTC(a!, m! - 1, g! + n, 12)).toISOString().slice(0, 10);
}

const FORMATO_ORA = new Intl.DateTimeFormat("it-IT", {
  timeZone: "Europe/Rome",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

/** HH:MM ora di Roma di un istante. */
export function oraRoma(ms: number): string {
  return FORMATO_ORA.format(new Date(ms));
}

/** Ora (0–23) di Roma di un istante. */
export function oraIntera(ms: number): number {
  return Number(oraRoma(ms).slice(0, 2)) % 24;
}

export function useRadioAdesso(passoMs = 1000) {
  const oggi = usePalinsestoRadio();
  const domani = usePalinsestoRadio(oggi.data ? giornoDopo(oggi.data.giorno) : undefined);

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

  const elementi: ElementoRadio[] = useMemo(() => {
    const a = oggi.data?.elementi ?? [];
    const b = domani.data && domani.data.giorno !== oggi.data?.giorno ? domani.data.elementi : [];
    return [...a, ...b];
  }, [oggi.data, domani.data]);

  const indice = elementi.findIndex((e) => e.inizio <= adesso && adesso < e.fine);
  const corrente = indice >= 0 ? elementi[indice]! : null;

  /* A mezzanotte si rilegge la scaletta del nuovo giorno. */
  const ultimaFine = oggi.data?.elementi.at(-1)?.fine ?? Infinity;
  useEffect(() => {
    if (oggi.data && adesso >= ultimaFine) void oggi.refetch();
  }, [adesso, ultimaFine, oggi]);

  return { oggi, scarto, adesso, elementi, indice, corrente };
}
