import { useEffect } from "react";
import { Link } from "wouter";
import {
  ArrowRight,
  BadgeCheck,
  CalendarDays,
  ExternalLink,
  FileText,
  LayoutGrid,
  Link2,
  Megaphone,
  Play,
  Radio,
  Tv,
} from "lucide-react";
import type { CanaleTouchId } from "../../api/data/touch-canali";
import { CanalePlayer } from "../components/canale-player";
import { ASeguireCanale, PalinsestoCanale, TitoloCanale } from "../components/canale-palinsesto";
import { SeguiDiretta } from "../components/segui-diretta";
import { RubricaCard } from "../components/rubrica-card";
import { Appartiene } from "../components/appartiene";
import { SpazioPubblicitario, useCampagneSpazio } from "../components/spazio-pubblicitario";
import { useInfoCanali } from "../queries/canali-touch";
import { useSettimanaRadio } from "../queries/radio";
import { eventoAccendi, useCanaleAdesso } from "../hooks/use-canale-adesso";
import { TBH } from "../lib/appartenenza";
import { COLORE_TBH } from "../lib/identita-tbh";

/**
 * /radio → TOUCH RADIO (canale audio) · /tv → TOUCH TV (canale video).
 * Regola di Claudio del 15/10/2026: TBH è il gruppo, TOUCH RADIO e TOUCH TV sono
 * due canali distinti con logo proprio, TOUCH MUSIC è una RUBRICA del palinsesto.
 * Scheda del canale sul modello delle società TBH (logo, identità, appartenenza al
 * gruppo, collegamenti) + player del canale + palinsesto + rubriche.
 */

const GIALLO = COLORE_TBH;
const ROSSO_DM = "#ff2b2b";

function dataBreve(d: string) {
  return `${d.slice(8)}/${d.slice(5, 7)}`;
}

/** Slot del logo ufficiale del canale: vuoto e dichiarato finché Claudio non approva. */
function LogoCanale({ nome, logo, stato }: { nome: string; logo: string | null; stato: string }) {
  if (logo)
    return (
      <div className="mx-auto w-full max-w-[260px] md:max-w-[300px]">
        <img src={logo} alt={`Logo ufficiale ${nome}`} className="h-auto w-full" />
      </div>
    );
  return (
    <div
      className="mx-auto grid aspect-square w-full max-w-[170px] place-items-center rounded-3xl border-2 border-dashed p-4 text-center md:max-w-[260px] md:p-5"
      style={{ borderColor: `${GIALLO}66` }}
      data-testid="logo-canale-slot"
    >
      <div className="flex flex-col items-center gap-2">
        <span className="tbh-display text-2xl leading-none text-[var(--tbh-platinum)]">{nome}</span>
        <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--tbh-muted)]">Logo ufficiale</span>
        <span className="rounded-full border border-[var(--tbh-gold)]/60 px-2.5 py-0.5 text-[10px] font-bold tracking-[0.12em] text-[var(--tbh-gold)]">
          {stato}
        </span>
      </div>
    </div>
  );
}

/**
 * 28/10/2026 — ROTAZIONE PUBBLICITARIA di Touch TV / Touch Music Radio (promo TBH, compresa
 * l'Offerta 122 € a locandina intera). Sta nella scheda «Pubblicità», FUORI dal player:
 * il palinsesto condiviso TV/Radio e i suoi spot YouTube restano esattamente com'erano.
 */
function RotazionePubblicitaria({ canale, nome }: { canale: CanaleTouchId; nome: string }) {
  const spazio = `touch-${canale}-pubblicita`;
  const { campagne } = useCampagneSpazio({ spazio, massimo: 6 });
  if (campagne.length === 0) return null;
  return (
    <div className="flex flex-col gap-1.5" data-testid="rotazione-pubblicitaria">
      <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--tbh-muted)]">Rotazione pubblicitaria {nome}</span>
      <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-white/10 bg-black">
        <SpazioPubblicitario campagne={campagne} spazio={spazio} colore={GIALLO} />
      </div>
    </div>
  );
}

export default function CanaleTouchPage({ canale, ancora }: { canale: CanaleTouchId; ancora?: string }) {
  const info = useInfoCanali();
  const settimana = useSettimanaRadio();
  const { corrente } = useCanaleAdesso(canale, 5000);
  const c = info.data?.canali.find((x) => x.id === canale);
  const altro = info.data?.canali.find((x) => x.id !== canale);
  const s = settimana.data;
  const tv = canale === "tv";

  useEffect(() => {
    const raw = ancora ?? (window.location.hash ? window.location.hash.slice(1) : null);
    const id = raw === "radio-palinsesto" ? "palinsesto" : raw === "radio-in-onda" ? "in-onda" : raw;
    if (!id) return;
    const t = setTimeout(() => document.getElementById(id)?.scrollIntoView({ block: "start" }), 400);
    return () => clearTimeout(t);
  }, [ancora]);

  const vai = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  const accendi = () => {
    window.dispatchEvent(new Event(eventoAccendi(canale)));
    vai("in-onda");
  };

  const nome = c?.nome ?? (tv ? "TOUCH TV" : "TOUCH RADIO");
  const Icona = tv ? Tv : Radio;

  return (
    <div className="mx-auto flex max-w-[1500px] flex-col gap-10 px-4 py-8 md:px-8 md:py-10" data-testid={`canale-${canale}`}>
      {/* ── SCHEDA DEL CANALE (modello società TBH) ─────────────────────── */}
      <header className="grid items-center gap-6 md:grid-cols-[minmax(0,260px)_1fr]">
        <LogoCanale nome={nome} logo={c?.logo ?? null} stato={c?.statoLogo ?? "IN ATTESA DI APPROVAZIONE"} />
        <div className="flex min-w-0 flex-col gap-3">
          <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-[var(--tbh-neon)]/60 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-[var(--tbh-neon)]">
            <BadgeCheck size={13} /> TBH Official · Canale del gruppo
          </span>
          <h1 className="tbh-display tbh-h1 break-words leading-[0.95]" style={{ color: GIALLO }}>
            {nome}
          </h1>
          <Appartiene a={TBH} />
          <p className="flex items-center gap-2 text-sm uppercase tracking-[0.12em] text-[var(--tbh-gold)] md:text-base">
            <Icona className="h-4 w-4 shrink-0" /> {c ? `${c.tipo} · ${c.formato}` : ""}
          </p>
          <p className="max-w-3xl text-[var(--tbh-muted)]">
            {tv
              ? "Il canale video del gruppo TBH: spot, visual ufficiali e dirette DM a schermo. I brani solo audio vanno in onda con la copertina ufficiale. Rubriche: TOUCH MUSIC, DM ON AIR, DM HIGHLIGHTS."
              : "Il canale audio del gruppo TBH: musica, dirette e spot da ascoltare, 24 ore su 24. Rubriche: TOUCH MUSIC, DM ON AIR, DM HIGHLIGHTS."}
          </p>
          <div className="flex flex-wrap gap-3 pt-1">
            <button
              type="button"
              onClick={accendi}
              className="inline-flex min-h-11 items-center gap-2 rounded-full px-5 text-sm font-extrabold uppercase tracking-[0.08em] text-black"
              style={{ background: GIALLO }}
              data-testid="comando-canale"
            >
              <Play className="h-4 w-4 fill-current" /> {c?.comando ?? (tv ? "GUARDA TV" : "ASCOLTA RADIO")}
            </button>
            <button
              type="button"
              onClick={() => vai("palinsesto")}
              className="inline-flex min-h-11 items-center gap-2 rounded-full border border-[var(--tbh-line)] px-4 text-sm hover:border-[var(--tbh-neon)]"
            >
              <LayoutGrid size={15} /> Palinsesto
            </button>
            {altro && (
              <Link
                href={altro.percorso}
                className="inline-flex min-h-11 items-center gap-2 rounded-full border border-[var(--tbh-line)] px-4 text-sm hover:border-[var(--tbh-neon)]"
              >
                {altro.id === "tv" ? <Tv size={15} /> : <Radio size={15} />} {altro.nome}
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* ── SEGUI LA DIRETTA ORA ─────────────────────────────────────────── */}
      <SeguiDiretta />

      {/* ── ORA IN ONDA: il player di QUESTO canale ──────────────────────── */}
      <div id="in-onda" className="flex scroll-mt-32 flex-col gap-3">
        <TitoloCanale icona={Icona}>ORA IN ONDA</TitoloCanale>
        <CanalePlayer canale={canale} />
        {s && (
          <p className="text-xs text-[var(--tbh-muted)]">
            {s.braniInRotazione} brani originali J.C. Hugò nella rubrica TOUCH MUSIC, in rotazione automatica 24/7. Stessa
            scaletta per tutti, ora di Roma. Avvii e passaggi di questo player sono contati solo per {nome}.
          </p>
        )}
      </div>

      {/* ── A SEGUIRE + RUBRICHE ─────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
        <ASeguireCanale canale={canale} />
        <div className="flex flex-col gap-3">
          <TitoloCanale icona={FileText}>RUBRICHE</TitoloCanale>
          {(info.data?.rubriche ?? []).map((r) => (
            <RubricaCard key={r.id} r={r} inOnda={corrente?.rubrica === r.id} />
          ))}
          <Link href="/rubriche" className="inline-flex w-fit items-center gap-1.5 text-sm text-[var(--tbh-platinum)] hover:underline">
            Tutte le rubriche <ArrowRight className="h-4 w-4" style={{ color: GIALLO }} />
          </Link>
        </div>
      </div>

      {/* ── PALINSESTO DEL CANALE ────────────────────────────────────────── */}
      <PalinsestoCanale canale={canale} />

      {/* ── PROGRAMMI DELLA SETTIMANA (palinsesto generale) ──────────────── */}
      <div id="settimana" className="flex scroll-mt-40 flex-col gap-3">
        <TitoloCanale icona={CalendarDays}>PROGRAMMI DELLA SETTIMANA</TitoloCanale>
        <p className="text-sm text-[var(--tbh-muted)]">
          Fasce dei prossimi 7 giorni del palinsesto generale TBH. Le dirette DM ON AIR hanno la precedenza; nelle fasce
          TOUCH MUSIC brani in ordine diverso ogni giorno e pausa pubblicitaria ogni 12–15 minuti.
        </p>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
          {s?.giorni.map((g, i) => (
            <div key={g.data} className="tbh-card flex flex-col gap-2 p-3">
              <p className="text-sm font-bold capitalize text-[var(--tbh-platinum)]">
                {i === 0 ? "Oggi" : g.giorno} <span className="tbh-dato font-normal text-[var(--tbh-muted)]">{dataBreve(g.data)}</span>
              </p>
              <ul className="flex flex-col gap-1.5 text-xs">
                {g.blocchi.map((b) => (
                  <li key={b.da} className="flex flex-col">
                    <span className="tbh-dato text-[var(--tbh-muted)]">
                      {b.da}–{b.a}
                    </span>
                    <span
                      className={b.tipo === "dm" ? "font-semibold" : "text-[var(--tbh-platinum)]"}
                      style={{ color: b.tipo === "dm" ? ROSSO_DM : undefined }}
                    >
                      {b.titolo}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* ── IDENTITÀ + COLLEGAMENTI ──────────────────────────────────────── */}
      <section className="grid gap-6 lg:grid-cols-2">
        <div className="tbh-card p-5 md:p-6">
          <p className="mb-1 text-xs uppercase tracking-[0.25em] text-[var(--tbh-gold)]">Identità</p>
          <h2 className="tbh-display tbh-h3 mb-4">Scheda del canale</h2>
          <dl className="divide-y divide-[var(--tbh-line)]">
            {c?.identita.map((v) => (
              <div key={v.etichetta} className="grid grid-cols-1 gap-x-4 gap-y-0.5 py-2.5 sm:grid-cols-[170px_1fr]">
                <dt className="pt-0.5 text-xs uppercase tracking-widest text-[var(--tbh-gold)]">{v.etichetta}</dt>
                <dd className="break-words">{v.valore}</dd>
              </div>
            ))}
          </dl>
        </div>
        <div className="flex flex-col gap-6">
          <div className="tbh-card p-5 md:p-6">
            <p className="mb-1 flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-[var(--tbh-gold)]">
              <Link2 size={14} /> Collegamenti
            </p>
            <ul className="mt-3 flex flex-col divide-y divide-[var(--tbh-line)]">
              {c?.collegamenti.map((l) => (
                <li key={l.href}>
                  {l.esterno ? (
                    <a href={l.href} target="_blank" rel="noreferrer" className="flex items-center justify-between gap-3 py-2.5 hover:text-[var(--tbh-neon)]">
                      {l.label} <ExternalLink className="h-4 w-4 shrink-0" />
                    </a>
                  ) : (
                    <Link href={l.href} className="flex items-center justify-between gap-3 py-2.5 hover:text-[var(--tbh-neon)]">
                      {l.label} <ArrowRight className="h-4 w-4 shrink-0" style={{ color: GIALLO }} />
                    </Link>
                  )}
                </li>
              ))}
              {!tv &&
                /* 04/11/2026 (round 16): catalogo, calendario uscite e Records Channel — senza ripetere
                   un collegamento già presente nell'elenco del canale. */
                [
                  { href: "/musica/jc-hugo#brani", label: "Catalogo completo J.C. Hugò" },
                  { href: "/musica/calendario-uscite", label: "Calendario uscite" },
                  { href: "/musica/discografia", label: "Discografia" },
                  { href: "/channel/scheda/touch-music-records", label: "Touch Music Records Channel" },
                ]
                  .filter((v) => !c?.collegamenti.some((l) => l.href === v.href))
                  .map((v) => (
                    <li key={v.href}>
                      <Link href={v.href} className="flex items-center justify-between gap-3 py-2.5 hover:text-[var(--tbh-neon)]">
                        {v.label} <ArrowRight className="h-4 w-4 shrink-0" style={{ color: GIALLO }} />
                      </Link>
                    </li>
                  ))}
            </ul>
          </div>
          <div id="pubblicita" className="tbh-card flex scroll-mt-40 flex-col gap-3 p-5 md:p-6">
            <h2 className="tbh-display tbh-h3 flex items-center gap-2" style={{ color: GIALLO }}>
              <Megaphone className="h-5 w-5" /> Pubblicità su {nome}
            </h2>
            <p className="text-sm text-[var(--tbh-muted)]">{s?.spot.nota}</p>
            <ul className="grid gap-1.5 text-sm sm:grid-cols-2">
              {s?.spot.gruppo.map((g) => (
                <li key={g.id}>
                  <a href={g.youtube} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-[var(--tbh-platinum)] hover:underline">
                    <span className="truncate">{g.titolo}</span>
                    <span className="tbh-dato shrink-0 text-xs text-[var(--tbh-muted)]">
                      {Math.floor(g.durataSec / 60)}:{String(g.durataSec % 60).padStart(2, "0")}
                    </span>
                  </a>
                </li>
              ))}
            </ul>
            <RotazionePubblicitaria canale={canale} nome={nome} />
            <p className="border-t border-white/10 pt-3 text-xs text-[var(--tbh-muted)]">
              Statistiche e conteggio degli spot sono separati per canale: i passaggi su {nome} non si sommano a quelli di{" "}
              {altro?.nome ?? (tv ? "TOUCH RADIO" : "TOUCH TV")}. Spot degli inserzionisti: IN ALLESTIMENTO.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
