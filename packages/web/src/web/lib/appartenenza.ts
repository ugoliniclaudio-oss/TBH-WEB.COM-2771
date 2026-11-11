/* ────────────────────────────────────────────────────────────────────────────
   APPARTENENZA — REGOLA GLOBALE TBH-WEB del 02/10/2026, punto 4.

     «Non applicare automaticamente TBH a tutto. Utilizzare l'appartenenza effettiva.
      NON INVENTARE appartenenze.»

     · tbh          → società, divisioni e attività del gruppo Touch Business Holding
     · dm           → programmi, media, sport e attività del circuito DM Comunicazioni
     · touch-plaza  → prodotti, articoli, negozi e servizi del circuito commerciale
                      TBH Touch Plaza
     · esterno      → partner, clienti, artisti, professionisti, altre realtà:
                      SOLO l'etichetta pertinente passata dalla pagina (es. «Partner»,
                      «Società seguita»), mai il marchio di un circuito a cui non
                      appartengono.

   Il marchio di ogni circuito è l'ASSET ORIGINALE già consegnato (punto 9):
   per Touch Plaza non esiste ancora un logo dedicato, quindi si usa il marchio
   TBH del gruppo con la scritta per esteso — nessun logo ricreato.
   ──────────────────────────────────────────────────────────────────────────── */

import { LOGHI_CHANNEL } from "../../api/data/loghi-channel";

export type Circuito = "tbh" | "dm" | "touch-plaza";

export type Appartenenza =
  | { circuito: Circuito }
  | { circuito: "esterno"; etichetta: string };

export const CIRCUITI: Record<
  Circuito,
  { sigla: string; nome: string; logo: string | null; colore: string }
> = {
  tbh: {
    sigla: "TBH",
    nome: "Touch Business Holding",
    logo: "/brand/loghi/tbh-tondo-256.png",
    colore: "var(--tbh-neon)",
  },
  dm: {
    sigla: "DM",
    nome: "DM Comunicazioni",
    logo: LOGHI_CHANNEL["dm"]!.src,
    colore: "#ff3b3b",
  },
  "touch-plaza": {
    sigla: "TBH Touch Plaza",
    nome: "Il Centro Commerciale Digitale",
    logo: "/brand/loghi/tbh-tondo-256.png",
    colore: "#a78bfa",
  },
};

export const TBH: Appartenenza = { circuito: "tbh" };
export const DM: Appartenenza = { circuito: "dm" };
export const TOUCH_PLAZA: Appartenenza = { circuito: "touch-plaza" };
export function esterno(etichetta: string): Appartenenza {
  return { circuito: "esterno", etichetta };
}

/** Testo leggibile dell'appartenenza: «Touch Business Holding», «Partner»… */
export function testoAppartenenza(a: Appartenenza) {
  if (a.circuito === "esterno") return { sigla: a.etichetta, nome: null, logo: null, colore: "var(--tbh-gold)" };
  const c = CIRCUITI[a.circuito];
  return { sigla: c.sigla, nome: c.nome, logo: c.logo, colore: c.colore };
}
