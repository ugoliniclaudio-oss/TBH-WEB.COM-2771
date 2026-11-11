import { Link } from "wouter";
import { RiquadroLogo } from "./tessera-logo";
import { LOGHI_CHANNEL } from "../../api/data/loghi-channel";

/**
 * NASTRO STEMMI ALTERNATI — ordine di Claudio del 29/08/2026:
 * «mettici a random, gli stemmi delle squadre ad esempio logo dm, poi verucchio, dm poi victoria
 *  e cosi via tutte le altre società di calcio, tranne rimini calcio».
 *
 * AGGIORNAMENTO 28/09/2026 — ordine di Claudio: «le squadre seguite non devono
 * essere ordinate casualmente: precedenza a quelle con materiale reale». Il
 * `random` del 29/08 è quindi caduto: l'alternanza DM → società resta, ma la
 * successione delle società è STABILE (prima chi ha lo stemma ufficiale, poi
 * ordine alfabetico). Così il nastro è sempre lo stesso a ogni visita, si può
 * verificare con uno screenshot e nessuna società sparisce in fondo per caso.
 *
 * Come funziona:
 * · si alterna SEMPRE logo DM → stemma società → logo DM → stemma società…;
 * · ordine fisso: materiale reale prima, poi alfabetico. Mai `Math.random`;
 * · il Rimini Calcio NON entra nel nastro: resta società di interesse del territorio;
 *   → SUPERATO il 16/10/2026, ordine di Claudio: «Rimini calcio lo metti alla fine del treno
 *   di tutte le squadre seguite da DM». Il Rimini entra nel nastro, SEMPRE per ultimo, dopo
 *   l'ordine fisso di tutte le altre società;
 * · compaiono solo gli stemmi realmente ricevuti (file in /public/teams estratti dai mockup
 *   confermati ufficiali). Chi non ha lo stemma non viene ricostruito: resta fuori dal nastro.
 */
export type StemmaSquadra = {
  slug: string;
  nome: string;
  nomeBreve: string;
  logo: string | null;
  colore: string;
};

const DM_LOGO = LOGHI_CHANNEL["dm"]!.src;

/**
 * Ordine editoriale del nastro: prima le società che hanno lo stemma ufficiale
 * (materiale reale), poi le altre, e a parità l'alfabeto. Deterministico.
 */
export function ordineStemmi<T extends { nome: string; logo?: string | null }>(
  lista: T[],
): T[] {
  return [...lista].sort(
    (a, b) =>
      Number(Boolean(b.logo)) - Number(Boolean(a.logo)) ||
      a.nome.localeCompare(b.nome, "it"),
  );
}

export function StemmiMarquee({
  squadre,
  titolo = "Società di calcio seguite da DM Comunicazioni",
}: {
  squadre: StemmaSquadra[];
  titolo?: string;
}) {
  const conStemma = squadre.filter((s) => !!s.logo);
  const validi = [
    ...ordineStemmi(conStemma.filter((s) => s.slug !== "rimini")),
    ...conStemma.filter((s) => s.slug === "rimini"),
  ];
  if (!validi.length) return null;

  /** Una passata = DM + squadra, ripetuta due volte per lo scorrimento continuo. */
  const passata = validi.flatMap((s) => [{ tipo: "dm" as const, s }, { tipo: "squadra" as const, s }]);
  const riga = [...passata, ...passata];

  return (
    <section className="flex flex-col gap-2">
      <p className="px-4 md:px-8 text-[11px] uppercase tracking-[0.22em] text-[var(--tbh-muted)]">
        {titolo}
      </p>
      <div className="border-y border-[var(--tbh-line)] bg-black/60 overflow-hidden py-3">
        <div className="tbh-marquee-track items-center">
          {riga.map((v, i) =>
            v.tipo === "dm" ? (
              <Link
                key={`dm-${i}`}
                to="/dm"
                aria-label="DM Comunicazioni"
                className="mx-5 shrink-0 grid place-items-center"
              >
                <RiquadroLogo
                  src={DM_LOGO}
                  alt="DM Comunicazioni"
                  misura="sm"
                  colore="#ff2b2b"
                />
              </Link>
            ) : (
              <Link
                key={`sq-${v.s.slug}-${i}`}
                to={`/sport/squadre/${v.s.slug}`}
                aria-label={v.s.nome}
                className="mx-5 shrink-0 grid place-items-center"
              >
                <RiquadroLogo
                  src={v.s.logo!}
                  alt={`Stemma ${v.s.nome}`}
                  misura="sm"
                  colore={v.s.colore}
                />
              </Link>
            ),
          )}
        </div>
      </div>
    </section>
  );
}
