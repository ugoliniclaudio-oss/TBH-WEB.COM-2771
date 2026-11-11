import type { ElementoCanale } from "../../api/lib/touch-canali";

/** Etichette comuni dei passaggi dei canali TOUCH RADIO / TOUCH TV. */

export function nomeRubrica(e: ElementoCanale): string {
  if (e.rubrica === "touch-music") return "TOUCH MUSIC";
  if (e.rubrica === "dm-on-air") return "DM ON AIR";
  if (e.rubrica === "dm-highlights") return "DM HIGHLIGHTS";
  return "PAUSA PUBBLICITARIA";
}

export function etichettaElemento(e: ElementoCanale): string {
  if (e.tipo === "spot") return e.sigla ? "Sigla spot" : "Spot";
  if (e.tipo === "dm") return "Diretta DM";
  if (e.tipo === "programma") return e.formato === "spot" ? "Spot" : e.formato === "diretta" ? "Diretta" : "Programma";
  return "Brano";
}

export function eDm(e: ElementoCanale) {
  return e.rubrica === "dm-on-air" || e.rubrica === "dm-highlights";
}
