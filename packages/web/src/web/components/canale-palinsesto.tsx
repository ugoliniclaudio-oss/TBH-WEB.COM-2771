import { useEffect, useRef, useState } from "react";
import { LayoutGrid, Megaphone, Music4, Play, Tv } from "lucide-react";
import type { CanaleTouchId } from "../../api/data/touch-canali";
import type { ElementoCanale } from "../../api/lib/touch-canali";
import { useCanaleAdesso } from "../hooks/use-canale-adesso";
import { oraRoma } from "../hooks/use-radio-adesso";
import { usePalinsestoCanale } from "../queries/canali-touch";
import { useSettimanaRadio } from "../queries/radio";
import { eDm, etichettaElemento, nomeRubrica } from "../lib/canali-touch";
import { COLORE_TBH } from "../lib/identita-tbh";

/**
 * A SEGUIRE e PALINSESTO DEL GIORNO di UN canale (TOUCH RADIO o TOUCH TV).
 * Con il palinsesto condiviso le due pagine mostrano la stessa scaletta; con i
 * palinsesti separati ognuna mostra la propria. Tutto dall'API `canaliTouch`.
 */

const GIALLO = COLORE_TBH;
const ROSSO_DM = "#ff2b2b";

const FASCE = [
  { id: "notte", nome: "Notte", da: 0, a: 6 },
  { id: "mattina", nome: "Mattina", da: 6, a: 12 },
  { id: "pomeriggio", nome: "Pomeriggio", da: 12, a: 18 },
  { id: "sera", nome: "Sera", da: 18, a: 24 },
] as const;

export function TitoloCanale({ id, children, icona: Icona }: { id?: string; children: string; icona: typeof Play }) {
  return (
    <h2 id={id} className="tbh-display tbh-h2 flex items-center gap-3 leading-none" style={{ color: GIALLO }}>
      <Icona className="h-6 w-6 shrink-0" /> {children}
    </h2>
  );
}

function dataBreve(d: string) {
  return `${d.slice(8)}/${d.slice(5, 7)}`;
}

function Icona({ e }: { e: ElementoCanale }) {
  if (e.tipo === "brano" && e.cover)
    return <img src={e.cover} alt="" loading="lazy" className="h-10 w-10 shrink-0 rounded-md object-cover" />;
  return (
    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-white/5">
      {e.rubrica === null ? (
        <Megaphone className="h-4 w-4 text-[var(--tbh-muted)]" />
      ) : eDm(e) ? (
        <Tv className="h-4 w-4" style={{ color: ROSSO_DM }} />
      ) : (
        <Music4 className="h-4 w-4 text-[var(--tbh-muted)]" />
      )}
    </span>
  );
}

export function ASeguireCanale({ canale }: { canale: CanaleTouchId }) {
  const { elementi, indice } = useCanaleAdesso(canale, 5000);
  const prossimi = indice >= 0 ? elementi.slice(indice + 1, indice + 9) : [];
  return (
    <div id="a-seguire" className="flex scroll-mt-40 flex-col gap-3" data-testid={`a-seguire-${canale}`}>
      <TitoloCanale icona={Play}>A SEGUIRE</TitoloCanale>
      <ol className="tbh-card flex min-w-0 flex-col divide-y divide-white/5 p-2 text-sm">
        {prossimi.length === 0 && <li className="p-3 text-[var(--tbh-muted)]">Caricamento…</li>}
        {prossimi.map((e) => (
          <li key={`${e.tipo}-${e.inizio}`} className="flex items-center gap-3 px-2 py-2">
            <span className="tbh-dato w-12 shrink-0 font-semibold" style={{ color: eDm(e) ? ROSSO_DM : GIALLO }}>
              {e.ora}
            </span>
            <Icona e={e} />
            <span className="min-w-0 flex-1">
              <span className="block truncate font-semibold text-[var(--tbh-platinum)]">{e.titolo}</span>
              <span className="block truncate text-xs text-[var(--tbh-muted)]">
                {nomeRubrica(e)} · {etichettaElemento(e)}
                {e.tipo === "brano" ? ` · ${e.artista ?? "J.C. Hugò"}` : e.tipo === "spot" ? ` · ${e.inserzionista}` : ""}
              </span>
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}

export function PalinsestoCanale({ canale }: { canale: CanaleTouchId }) {
  const settimana = useSettimanaRadio();
  const giorni = settimana.data?.giorni ?? [];
  const oggiData = giorni[0]?.data ?? null;
  const [giorno, setGiorno] = useState<string | null>(null);
  const scelto = giorno ?? oggiData;
  const palinsesto = usePalinsestoCanale(canale, scelto && scelto !== oggiData ? scelto : undefined);
  const { adesso } = useCanaleAdesso(canale, 15_000);
  const eOggi = !giorno || giorno === oggiData;
  const oraAdesso = Number(oraRoma(adesso).slice(0, 2)) % 24;

  const [fascia, setFascia] = useState<string | null>(null);
  const fasciaAttiva =
    fascia ?? (eOggi ? (FASCE.find((f) => oraAdesso >= f.da && oraAdesso < f.a)?.id ?? "notte") : "notte");
  const f = FASCE.find((x) => x.id === fasciaAttiva) ?? FASCE[0];

  const elementi = palinsesto.data?.elementi ?? [];
  const ora = (e: ElementoCanale) => Number(e.ora.slice(0, 2));
  const inFascia = elementi.filter((e) => ora(e) >= f.da && ora(e) < f.a);
  const conteggio = (x: (typeof FASCE)[number]) => elementi.filter((e) => ora(e) >= x.da && ora(e) < x.a).length;

  const lista = useRef<HTMLOListElement>(null);
  const corrente = useRef<HTMLLIElement>(null);
  const chiaveVista = `${scelto}-${fasciaAttiva}-${elementi.length}`;
  useEffect(() => {
    const l = lista.current;
    const c = corrente.current;
    if (l) l.scrollTop = c ? Math.max(0, c.offsetTop - 60) : 0;
  }, [chiaveVista]);

  const nomeScelto = giorni.find((g) => g.data === scelto);
  const fonte = palinsesto.data?.fonte;

  return (
    <div id="palinsesto" className="flex scroll-mt-40 flex-col gap-3" data-testid={`palinsesto-${canale}`}>
      <TitoloCanale icona={LayoutGrid}>{eOggi ? "PALINSESTO DI OGGI" : "PALINSESTO DEL GIORNO"}</TitoloCanale>
      <p className="text-sm text-[var(--tbh-muted)]">
        {nomeScelto ? (
          <span className="capitalize">
            {eOggi ? "Oggi, " : ""}
            {nomeScelto.giorno} {dataBreve(nomeScelto.data)}
          </span>
        ) : null}{" "}
        · ora di Roma · {elementi.length} passaggi ·{" "}
        {fonte === "proprio"
          ? "palinsesto proprio del canale"
          : "palinsesto generale TBH, oggi condiviso da TOUCH RADIO e TOUCH TV"}
      </p>

      <div className="flex gap-2 overflow-x-auto pb-1" role="tablist" aria-label="Giorno del palinsesto">
        {giorni.map((g, i) => {
          const attivo = g.data === scelto;
          return (
            <button
              key={g.data}
              type="button"
              role="tab"
              aria-selected={attivo}
              onClick={() => {
                setGiorno(i === 0 ? null : g.data);
                setFascia(null);
              }}
              className={`shrink-0 rounded-full border px-4 py-1.5 text-sm font-semibold capitalize ${
                attivo ? "border-transparent text-black" : "border-white/15 text-[var(--tbh-platinum)] hover:border-white/40"
              }`}
              style={attivo ? { background: GIALLO } : undefined}
            >
              {i === 0 ? "Oggi" : `${g.giorno.slice(0, 3)} ${g.data.slice(8)}`}
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4" role="tablist" aria-label="Fascia oraria">
        {FASCE.map((x) => {
          const attiva = x.id === fasciaAttiva;
          const adessoQui = eOggi && oraAdesso >= x.da && oraAdesso < x.a;
          return (
            <button
              key={x.id}
              type="button"
              role="tab"
              aria-selected={attiva}
              onClick={() => setFascia(x.id)}
              className={`flex flex-col items-start rounded-xl border px-3 py-2 text-left transition ${
                attiva ? "border-[#d7ff00] bg-[#d7ff00]/10" : "border-white/10 hover:border-white/30"
              }`}
            >
              <span className="text-sm font-bold text-[var(--tbh-platinum)]">
                {x.nome}
                {adessoQui && (
                  <span className="ml-2 text-[10px] tracking-[0.14em]" style={{ color: GIALLO }}>
                    ● ADESSO
                  </span>
                )}
              </span>
              <span className="tbh-dato text-xs text-[var(--tbh-muted)]">
                {String(x.da).padStart(2, "0")}:00–{String(x.a).padStart(2, "0")}:00 · {conteggio(x)} passaggi
              </span>
            </button>
          );
        })}
      </div>

      <ol ref={lista} className="tbh-card relative flex max-h-[560px] flex-col overflow-y-auto p-2 text-sm">
        {palinsesto.isLoading && <li className="p-3 text-[var(--tbh-muted)]">Caricamento del palinsesto…</li>}
        {inFascia.map((e, i) => {
          const inOnda = eOggi && e.inizio <= adesso && adesso < e.fine;
          const passato = eOggi && e.fine <= adesso;
          const nuovaOra = i === 0 || inFascia[i - 1]!.ora.slice(0, 2) !== e.ora.slice(0, 2);
          const dm = eDm(e);
          return (
            <li key={`${e.tipo}-${e.inizio}`} ref={inOnda ? corrente : undefined}>
              {nuovaOra && (
                <p className="sticky top-0 z-10 bg-[var(--tbh-surface)] px-2 pb-1 pt-3 text-[11px] font-bold tracking-[0.18em] text-[var(--tbh-muted)]">
                  ORE {e.ora.slice(0, 2)}
                </p>
              )}
              <div className={`flex items-center gap-3 rounded-lg px-2 py-1.5 ${inOnda ? "bg-[#d7ff00]/10" : ""} ${passato ? "opacity-50" : ""}`}>
                <span className="tbh-dato w-12 shrink-0 text-[var(--tbh-muted)]">{e.ora}</span>
                <span
                  className="hidden w-28 shrink-0 text-[10px] font-bold uppercase tracking-wider sm:block"
                  style={{ color: dm ? ROSSO_DM : e.rubrica === null ? "var(--tbh-gold)" : "var(--tbh-muted)" }}
                >
                  {nomeRubrica(e)}
                </span>
                <span className="min-w-0 flex-1 truncate text-[var(--tbh-platinum)]">
                  <span className={inOnda ? "font-bold" : ""}>{e.titolo}</span>
                  {e.tipo === "brano" && <span className="text-[var(--tbh-muted)]"> · {e.artista ?? "J.C. Hugò"}</span>}
                </span>
                {inOnda && (
                  <span className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-extrabold text-black" style={{ background: GIALLO }}>
                    IN ONDA
                  </span>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
