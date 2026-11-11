import { Link } from "wouter";
import { ArrowRight, CalendarDays, ImageOff, ListOrdered, Play, Radio, Tv } from "lucide-react";
import type { CanaleTouchId } from "../../api/data/touch-canali";
import type { ElementoCanale } from "../../api/lib/touch-canali";
import { CanalePlayer } from "./canale-player";
import { eventoAccendi, useCanaleAdesso } from "../hooks/use-canale-adesso";
import { eDm, etichettaElemento, nomeRubrica } from "../lib/canali-touch";
import { COLORE_TBH } from "../lib/identita-tbh";
import { LOGHI_CHANNEL } from "../../api/data/loghi-channel";

/**
 * HOME · I DUE CANALI UFFICIALI — TOUCH RADIO e TOUCH TV in primo piano (15/10/2026).
 * SOLO ANTEPRIMA su /check-web/home-canali: la home vera resta invariata finché Claudio
 * non approva.
 *
 *   · due monitor/player INDIPENDENTI, ognuno legato al PROPRIO palinsesto (API canaliTouch);
 *   · pulsanti ASCOLTA RADIO / GUARDA TV, PALINSESTO 24/7, ORA IN ONDA, A SEGUIRE;
 *   · dirette DM in simultanea sui due canali (il motore dei canali dà sempre la precedenza
 *     alla diretta DM, anche con i palinsesti separati);
 *   · DJ J.C. Hugò resta una sezione artistica a parte, fuori dai canali.
 *
 * LOGHI. Solo file ORIGINALI già negli asset, nessun logo generato o ridisegnato:
 *   TOUCH TV    → /channel/loghi/touch-tv.apng (originale approvato da Claudio il 19/10/2026);
 *   TOUCH RADIO → NESSUN file originale che legga «TOUCH RADIO»: slot dichiarato, niente
 *                 sostituti (i file «TOUCH MUSIC RADIO» non vanno sui canali).
 * In anteprima per l'approvazione: `CANALI_TOUCH[*].logo` resta null finché Claudio non dice sì.
 */

const GIALLO = COLORE_TBH;
const ROSSO_DM = "#ff2b2b";

type Scheda = {
  nome: string;
  tipo: string;
  percorso: string;
  comando: string;
  logo: string | null;
  icona: typeof Radio;
};

export const CANALI_HOME: Record<CanaleTouchId, Scheda> = {
  radio: {
    nome: "TOUCH RADIO",
    tipo: "Canale audio · streaming 24/7",
    percorso: "/radio",
    comando: "ASCOLTA RADIO",
    logo: null,
    icona: Radio,
  },
  tv: {
    nome: "TOUCH TV",
    tipo: "Canale video · streaming 24/7",
    percorso: "/tv",
    comando: "GUARDA TV",
    logo: LOGHI_CHANNEL["touch-tv"]!.src,
    icona: Tv,
  },
};

function LogoOriginale({ s }: { s: Scheda }) {
  if (s.logo)
    return (
      <img
        src={s.logo}
        alt={`Logo ufficiale ${s.nome}`}
        className="h-24 w-auto max-w-[150px] shrink-0 object-contain md:h-32 md:max-w-[200px]"
        data-testid="logo-originale"
      />
    );
  return (
    <div
      className="grid h-24 w-[126px] shrink-0 place-items-center rounded-2xl border-2 border-dashed px-2 text-center md:h-32 md:w-[168px]"
      style={{ borderColor: `${GIALLO}66` }}
      data-testid="logo-mancante"
      role="note"
      aria-label={`Logo originale ${s.nome} non presente negli asset`}
    >
      <span className="flex flex-col items-center gap-1">
        <ImageOff className="h-4 w-4 text-[var(--tbh-muted)]" aria-hidden />
        <span className="text-[9px] font-bold uppercase leading-tight tracking-[0.12em] text-[var(--tbh-gold)]">
          Logo originale non presente negli asset
        </span>
      </span>
    </div>
  );
}

function Pulsante({ to, children, icona: Icona }: { to: string; children: string; icona: typeof Play }) {
  return (
    <Link
      to={to}
      className="inline-flex min-w-0 items-center justify-center gap-2 rounded-full border border-white/20 px-3 py-2.5 text-[11px] font-bold tracking-[0.12em] text-[var(--tbh-platinum)] hover:border-[var(--tbh-neon)] hover:text-[var(--tbh-neon)]"
    >
      <Icona className="h-3.5 w-3.5 shrink-0" /> {children}
    </Link>
  );
}

function Prossimi({ lista }: { lista: ElementoCanale[] }) {
  if (!lista.length) return <p className="px-1 text-xs text-[var(--tbh-muted)]">Caricamento…</p>;
  return (
    <ol className="flex flex-col divide-y divide-white/5">
      {lista.map((e) => (
        <li key={`${e.tipo}-${e.inizio}`} className="flex min-w-0 items-center gap-3 py-1.5 text-sm">
          <span className="tbh-dato w-11 shrink-0 font-semibold" style={{ color: eDm(e) ? ROSSO_DM : GIALLO }}>
            {e.ora}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate font-semibold text-[var(--tbh-platinum)]">{e.titolo}</span>
            <span className="block truncate text-[11px] text-[var(--tbh-muted)]">
              {nomeRubrica(e)} · {etichettaElemento(e)}
            </span>
          </span>
        </li>
      ))}
    </ol>
  );
}

/** Un monitor: logo originale + nome ufficiale + player del canale + i quattro pulsanti. */
function MonitorCanale({ canale }: { canale: CanaleTouchId }) {
  const s = CANALI_HOME[canale];
  const { elementi, indice } = useCanaleAdesso(canale, 5000);
  const prossimi = indice >= 0 ? elementi.slice(indice + 1, indice + 4) : [];
  const Icona = s.icona;

  return (
    <article
      className="flex min-w-0 flex-col gap-4 rounded-3xl border bg-black/70 p-4 md:p-5"
      style={{ borderColor: `color-mix(in srgb, ${GIALLO} 40%, transparent)` }}
      data-testid={`monitor-home-${canale}`}
    >
      <header className="flex min-w-0 items-center gap-4">
        <LogoOriginale s={s} />
        <div className="min-w-0">
          <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.22em] text-[var(--tbh-muted)]">
            <Icona className="h-3.5 w-3.5" style={{ color: GIALLO }} aria-hidden /> Canale ufficiale TBH
          </p>
          <h3 className="tbh-display mt-1 text-3xl leading-none text-[var(--tbh-platinum)] md:text-4xl" data-testid="nome-canale">
            {s.nome}
          </h3>
          <p className="mt-1 text-xs text-[var(--tbh-muted)]">{s.tipo}</p>
        </div>
      </header>

      <CanalePlayer canale={canale} compatto />

      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => window.dispatchEvent(new Event(eventoAccendi(canale)))}
          className="col-span-2 inline-flex items-center justify-center gap-2 rounded-full px-4 py-3 text-sm font-extrabold tracking-[0.14em] text-black sm:col-span-1"
          style={{ background: GIALLO }}
          data-testid={`comando-${canale}`}
        >
          <Play className="h-4 w-4 fill-current" /> {s.comando}
        </button>
        <Link
          to={`${s.percorso}/palinsesto`}
          className="col-span-2 inline-flex items-center justify-center gap-2 rounded-full border-2 px-4 py-2.5 text-sm font-extrabold tracking-[0.14em] sm:col-span-1"
          style={{ borderColor: GIALLO, color: GIALLO }}
        >
          <CalendarDays className="h-4 w-4" /> PALINSESTO 24/7
        </Link>
        <Pulsante to={`${s.percorso}#in-onda`} icona={Icona}>
          ORA IN ONDA
        </Pulsante>
        <Pulsante to={`${s.percorso}#a-seguire`} icona={ListOrdered}>
          A SEGUIRE
        </Pulsante>
      </div>

      <div className="rounded-2xl border border-white/10 p-3">
        <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: GIALLO }}>
          A seguire su {s.nome}
        </p>
        <Prossimi lista={prossimi} />
      </div>
    </article>
  );
}

function giornoBreve(ms: number) {
  return new Intl.DateTimeFormat("it-IT", { timeZone: "Europe/Rome", weekday: "short", day: "2-digit", month: "2-digit" }).format(ms);
}

/** Striscia DM: la diretta in corso o la prossima, uguale sui due canali. */
function DiretteDm() {
  const radio = useCanaleAdesso("radio", 5000);
  const tv = useCanaleAdesso("tv", 5000);
  const ora = radio.adesso;
  const inCorso = radio.corrente?.tipo === "dm" ? radio.corrente : tv.corrente?.tipo === "dm" ? tv.corrente : null;
  const prossima = [...radio.elementi, ...tv.elementi]
    .filter((e) => e.tipo === "dm" && e.inizio > ora)
    .sort((a, b) => a.inizio - b.inizio)[0];

  return (
    <div
      className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-2xl border px-4 py-3 text-sm"
      style={{ borderColor: `${ROSSO_DM}66` }}
      data-testid="dirette-dm"
    >
      <span className="inline-flex items-center gap-2 text-[11px] font-extrabold tracking-[0.16em]" style={{ color: ROSSO_DM }}>
        <span className="h-2 w-2 rounded-full" style={{ background: ROSSO_DM }} /> DIRETTE DM
      </span>
      {inCorso ? (
        <span className="min-w-0 text-[var(--tbh-platinum)]">
          <strong>In onda ora</strong> «{inCorso.titolo}» — in simultanea su TOUCH RADIO e TOUCH TV.
        </span>
      ) : prossima ? (
        <span className="min-w-0 text-[var(--tbh-platinum)]">
          Prossima diretta: <strong>{giornoBreve(prossima.inizio)} · {prossima.ora}</strong> «{prossima.titolo}» — in simultanea su
          TOUCH RADIO e TOUCH TV.
        </span>
      ) : (
        <span className="min-w-0 text-[var(--tbh-muted)]">
          Nessuna diretta DM in programma oggi e domani. Quando c'è, va in onda in simultanea sui due canali.
        </span>
      )}
    </div>
  );
}

export function CanaliUfficialiHome() {
  return (
    <section className="mx-auto max-w-[1500px] px-4 pt-5 md:px-8" aria-label="Canali ufficiali TOUCH RADIO e TOUCH TV">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-[0.28em]" style={{ color: GIALLO }}>
            Touch Business Holding · i canali ufficiali
          </p>
          <h2 className="tbh-display tbh-h2 mt-1 leading-none">TOUCH RADIO · TOUCH TV</h2>
          <p className="mt-1.5 max-w-[70ch] text-[13px] text-[var(--tbh-muted)]">
            Due canali, due player indipendenti: ognuno segue il proprio palinsesto 24/7 (ora di Roma).
          </p>
        </div>
      </div>
      <div className="grid min-w-0 gap-5 lg:grid-cols-2">
        <MonitorCanale canale="radio" />
        <MonitorCanale canale="tv" />
      </div>
      <div className="mt-4">
        <DiretteDm />
      </div>
    </section>
  );
}

/** DJ J.C. Hugò: sezione ARTISTICA, separata dai canali (logo originale già nel sito). */
export function SezioneArtisticaJcHugo() {
  return (
    <section className="mx-auto max-w-[1500px] px-4 pt-6 md:px-8" aria-label="DJ J.C. Hugò · sezione artistica">
      <div className="flex flex-col items-start gap-4 rounded-3xl border border-[var(--tbh-line)] bg-black/50 p-4 sm:flex-row sm:items-center md:p-5">
        <img
          src="/brand/loghi/jc-hugo.png"
          alt="Logo ufficiale J.C. Hugò"
          loading="lazy"
          className="h-20 w-auto max-w-[140px] shrink-0 object-contain md:h-24"
        />
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-[var(--tbh-muted)]">Sezione artistica</p>
          <h2 className="tbh-display tbh-h3 mt-1 leading-none">DJ J.C. HUGÒ</h2>
          <p className="mt-1.5 max-w-[70ch] text-[13px] text-[var(--tbh-muted)]">
            DJ · VJ · Producer. L'artista ha la sua pagina, separata dai canali: i suoi brani vanno in onda nella rubrica
            TOUCH MUSIC di TOUCH RADIO e TOUCH TV.
          </p>
        </div>
        <Link
          to="/musica/jc-hugo"
          className="inline-flex shrink-0 items-center gap-2 rounded-full border border-[var(--tbh-neon)] px-4 py-2.5 text-[11px] font-bold tracking-[0.14em] text-[var(--tbh-neon)] hover:bg-[var(--tbh-neon)] hover:text-black"
        >
          SCOPRI DI PIÙ <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </section>
  );
}
