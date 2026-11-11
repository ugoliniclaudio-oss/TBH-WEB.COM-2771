/**
 * Stato automatico della puntata (ordini 7 e 9 del mockup HOME):
 * PROSSIMAMENTE → QUESTA SERA → ORA IN DIRETTA → RIVEDI LA PUNTATA.
 * Nessun orario inventato: se giorno/ora non sono confermati resta "PROSSIMAMENTE".
 */

export const GIORNI = [
  "",
  "lunedì",
  "martedì",
  "mercoledì",
  "giovedì",
  "venerdì",
  "sabato",
  "domenica",
];

export type StatoPuntata =
  | "PROSSIMAMENTE"
  | "QUESTA SERA"
  | "ORA IN DIRETTA"
  | "RIVEDI LA PUNTATA";

export function statoPuntata(giorno: number | null, ora: string | null, durataMin: number) {
  if (!giorno || !ora) return { stato: "PROSSIMAMENTE" as StatoPuntata, prossima: null };

  const now = new Date();
  // Ora italiana (Europe/Rome) indipendente dal fuso del server.
  const romeNow = new Date(now.toLocaleString("en-US", { timeZone: "Europe/Rome" }));
  const isoDay = romeNow.getDay() === 0 ? 7 : romeNow.getDay();
  const [h, m] = ora.split(":").map(Number);

  const start = new Date(romeNow);
  start.setHours(h ?? 0, m ?? 0, 0, 0);
  const end = new Date(start.getTime() + durataMin * 60_000);

  let stato: StatoPuntata = "PROSSIMAMENTE";
  if (isoDay === giorno) {
    if (romeNow >= start && romeNow <= end) stato = "ORA IN DIRETTA";
    else if (romeNow < start) stato = "QUESTA SERA";
    else stato = "RIVEDI LA PUNTATA";
  }

  const delta = (giorno - isoDay + 7) % 7;
  const prossima = new Date(start);
  prossima.setDate(start.getDate() + (delta === 0 && romeNow > end ? 7 : delta));

  return { stato, prossima: prossima.toISOString() };
}
