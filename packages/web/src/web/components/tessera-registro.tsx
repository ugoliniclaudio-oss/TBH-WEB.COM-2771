import type { ReactNode } from "react";
import { logoDelChannel } from "../../api/data/loghi-channel";
import { CardChannel, percorsoPlayer } from "./card-channel";
import { GrigliaChannelPaginata } from "./griglia-channel";
import type { ChannelDelRegistro } from "../queries/channel-registro";

/* ────────────────────────────────────────────────────────────────────────────
   TESSERA E SEZIONE DEL REGISTRO DEI CHANNEL — 04/11/2026 (round 18).
   Spostate qui da pages/channel-sezioni.tsx per usarle anche nella home «Canale 0» (/): dopo i 28 Channel
   ufficiali (blocchi A–E, invariati) la home mostra TUTTI gli altri Channel del registro e quelli aggiunti dal
   pannello, sezione per sezione, a pagine da 15 senza limite di numero (prima la home si fermava a 28 + 1).
   ──────────────────────────────────────────────────────────────────────────── */

const GIALLO = "#d7ff00";
const ROSSO_DM = "#ff2b2b";

export const ETICHETTA_STATO: Record<string, string> = {
  "PALINSESTO COMMERCIALE H24": "PALINSESTO COMMERCIALE H24",
  DIRETTA: "DIRETTA",
  REPLICA: "REPLICA",
  "PLAYLIST AUTOMATICA": "PLAYLIST AUTOMATICA",
  "PALINSESTO CONDIVISO": "PALINSESTO CONDIVISO TV · RADIO",
  "IN ALLESTIMENTO": "PALINSESTO IN ALLESTIMENTO",
};

/** 28/10/2026 (round 14) — Tessera = CardChannel, la stessa card della home «Canale 0». */
export function TesseraRegistro({ c, numeroInSezione }: { c: ChannelDelRegistro; numeroInSezione: number }) {
  const dm = c.appartenenza === "DM";
  const colore = dm ? ROSSO_DM : GIALLO;
  const approvato = c.logo ? logoDelChannel(c.slug) : undefined;
  const immagine = c.logoRegia
    ? { src: c.logoRegia }
    : approvato
      ? { src: approvato.src, larghezza: approvato.larghezza, altezza: approvato.altezza }
      : c.logo
        ? { src: c.logo }
        : null;
  const vuoto = c.slotVuoto && !c.compilato;
  const stato = ETICHETTA_STATO[c.stato] ?? c.stato;
  const apri = c.pagina ? { href: c.pagina, esterno: !!c.esterno } : vuoto ? null : { href: percorsoPlayer(c.slug) };
  return (
    <CardChannel
      slug={vuoto ? null : c.slug}
      apri={apri}
      scheda={c.scheda}
      sito={c.sito}
      titolo={vuoto ? c.nome.toUpperCase() : c.nome}
      sotto={vuoto ? "SPAZIO DISPONIBILE · DA COMPILARE" : stato}
      immagine={immagine}
      colore={colore}
      bordo={dm ? ROSSO_DM : vuoto ? "rgba(215,255,0,0.35)" : undefined}
      tratteggiato={vuoto}
      angoloSx={
        <span style={{ color: dm ? ROSSO_DM : "rgba(255,255,255,0.45)" }}>
          {String(numeroInSezione).padStart(2, "0")} · {c.appartenenza.toUpperCase()}
        </span>
      }
      angoloDx={c.ordineDaIndicare ? <span style={{ color: GIALLO }}>ORDINE DA INDICARE</span> : undefined}
      testid={`reg-${c.slug}`}
      dati={{ sezione: c.sezione, appartenenza: c.appartenenza }}
    />
  );
}

/** Logo ufficiale nell'intestazione di una sezione (solo file consegnati). */
export const LOGO_SEZIONE: Partial<Record<string, { src: string; alt: string }>> = {
  best: { src: "/channel/loghi/partner/best-entertainment.jpe", alt: "Best Entertainment Channel TV" },
};

/** Intestazione + griglia paginata (15 per pagina, blocchi da 6) di una sezione del registro. */
export function SezioneRegistro({
  id,
  titolo,
  sotto,
  lista,
  testid,
  extra,
}: {
  id: string;
  titolo: string;
  sotto: string;
  lista: ChannelDelRegistro[];
  testid: string;
  extra?: ReactNode;
}) {
  const dm = id === "dm";
  const logo = LOGO_SEZIONE[id];
  return (
    <div id={`sezione-${id}`} className="scroll-mt-24" data-testid={`sezione-${id}`}>
      <header className="mb-4 flex flex-wrap items-end justify-between gap-2 border-b pb-2" style={{ borderColor: dm ? `${ROSSO_DM}66` : "rgba(255,255,255,0.12)" }}>
        <div className="flex min-w-0 items-center gap-3">
          {logo && <img src={logo.src} alt={logo.alt} className="h-12 w-auto shrink-0 rounded bg-white p-1 md:h-14" loading="lazy" decoding="async" data-testid={`logo-sezione-${id}`} />}
          <div className="min-w-0">
            <h2 className="tbh-display text-2xl font-black tracking-[0.04em] md:text-3xl" style={{ color: dm ? ROSSO_DM : GIALLO }}>
              {titolo}
            </h2>
            <p className="text-[12px] text-white/55">{sotto}</p>
          </div>
        </div>
        <span className="text-[11px] font-bold tracking-[0.14em] text-white/45">{lista.length} CHANNEL</span>
      </header>
      {lista.length === 0 ? (
        <p className="text-sm text-white/50">Nessun Channel in questa sezione.</p>
      ) : (
        <GrigliaChannelPaginata
          lista={lista}
          chiave={(c) => c.slug}
          render={(c, n) => <TesseraRegistro c={c} numeroInSezione={n} />}
          etichetta={titolo}
          testid={testid}
          colore={dm ? ROSSO_DM : GIALLO}
        />
      )}
      {extra}
    </div>
  );
}
