import { useEffect } from "react";
import { Link } from "wouter";
import { ExternalLink } from "lucide-react";
import { registroPerSlug } from "../../api/data/channel-registro";
import { logoDelChannel } from "../../api/data/loghi-channel";
import { NuoveUsciteDiscografiche } from "../components/discografia";
import { MonitorRotante } from "../components/monitor-rotante";
import { ETICHETTA_TIPO, testoSenzaContenuti, vociMonitorDaAnteprima } from "../components/card-channel";
import { Briciole, GIALLO, ROSSO_DM } from "../components/struttura";
import { useAnteprimaChannel, useRegistroChannel } from "../queries/channel-registro";

/* ────────────────────────────────────────────────────────────────────────────
   /channel/play/:slug — PLAYER DEL CHANNEL (28/10/2026, round 14).

   Il pulsante APRI CHANNEL delle card porta qui quando il Channel non ha una sua pagina.
   Il monitor manda il palinsesto VERO del Channel, nell'ordine della Regia:
     · contenuti di «Gestione contenuti e palinsesto» collocati sul Channel;
     · contenuti di /allestimento/channel (video, immagini, spot) con tipo, durata e ordine.
   Le immagini restano a schermo per la durata scelta in Regia; i video partono col Play e si
   susseguono (Ciclo continuo). Nessun contenuto = «PALINSESTO IN PREPARAZIONE»: niente inventato.
   ──────────────────────────────────────────────────────────────────────────── */

const durataLeggibile = (s: number | null) => (s == null ? null : s >= 60 ? `${Math.floor(s / 60)} min${s % 60 ? ` ${s % 60} s` : ""}` : `${s} s`);

export default function ChannelPlayerPage({ slug }: { slug: string }) {
  const reg = registroPerSlug(slug);
  const vivo = useRegistroChannel().data?.channel.find((x) => x.slug === slug);
  const q = useAnteprimaChannel(slug, !!reg);
  const voci = q.data?.voci ?? [];
  const nome = vivo?.nome ?? reg?.nome ?? slug;
  const dm = reg?.appartenenza === "DM";
  const colore = dm ? ROSSO_DM : GIALLO;
  const approvato = reg?.logo ? logoDelChannel(slug) : undefined;
  const logo = vivo?.logoRegia ?? approvato?.src ?? null;
  const pagina = vivo?.pagina ?? reg?.pagina ?? null;
  const esterno = !!vivo?.esterno;
  const sito = vivo?.sito ?? null;
  const collegamenti = [...(vivo?.collegamenti ?? reg?.collegamenti ?? []), ...(vivo?.collegamentiRegia ?? [])];

  useEffect(() => {
    document.title = `${nome} · Player · TBH-WEB`;
  }, [nome]);

  if (!reg) {
    return (
      <div className="mx-auto max-w-[900px] px-4 py-16 text-center" data-testid="player-non-trovato">
        <p className="text-sm text-white/60">Channel non trovato.</p>
        <Link href="/channel" className="mt-4 inline-block text-sm text-white underline">
          Torna a tutti i Channel
        </Link>
      </div>
    );
  }

  const pulsante = "inline-flex min-h-10 items-center gap-1 rounded-full px-5 py-2 text-[11px] font-extrabold tracking-[0.14em] transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2";

  return (
    <div className="mx-auto max-w-[1300px] px-4 py-8 md:px-8" data-testid={`channel-player-${slug}`} data-voci={voci.length}>
      <Briciole className="mb-4" voci={[{ label: "Home", href: "/" }, { label: "Channel", href: "/channel" }, { label: nome }]} />

      <header className="mb-6 grid items-center gap-5 md:grid-cols-[minmax(0,420px)_1fr]">
        <div className="relative aspect-[2/1] w-full overflow-hidden rounded-xl border bg-black" style={{ borderColor: dm ? ROSSO_DM : "rgba(255,255,255,0.14)" }}>
          {logo ? (
            <img src={logo} alt={`Logo ${nome}`} className="absolute inset-0 h-full w-full object-contain p-1" data-testid="logo-player" />
          ) : (
            <span className="absolute inset-0 grid place-items-center px-4 text-center text-lg font-black text-white">{nome}</span>
          )}
        </div>
        <div className="min-w-0">
          <p className="text-[11px] font-extrabold uppercase tracking-[0.3em] text-white/50">TBH · Player del Channel</p>
          <h1 className="tbh-display tbh-h1 mt-2 text-balance text-white">{nome}</h1>
          <p className="mt-2 text-xs font-extrabold tracking-[0.2em]" style={{ color: colore }} data-testid="stato-player">
            {voci.length ? `${voci.length} CONTENUTI IN PALINSESTO` : testoSenzaContenuti(q.data?.stato, q.isLoading)}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link href={reg.scheda} className={`${pulsante} border bg-black hover:bg-white/10`} style={{ borderColor: colore, color: colore, outlineColor: colore }} data-testid="player-scheda">
              APRI SCHEDA
            </Link>
            {pagina &&
              (esterno ? (
                <a href={pagina} target="_blank" rel="noopener noreferrer" className={`${pulsante} text-black`} style={{ background: colore, outlineColor: colore }}>
                  PAGINA DEL CHANNEL <ExternalLink className="h-3 w-3" aria-hidden />
                </a>
              ) : (
                <Link href={pagina} className={`${pulsante} text-black`} style={{ background: colore, outlineColor: colore }}>
                  PAGINA DEL CHANNEL
                </Link>
              ))}
            {sito && (
              <a href={sito} target="_blank" rel="noopener noreferrer" className={`${pulsante} border bg-black hover:bg-white/10`} style={{ borderColor: colore, color: colore, outlineColor: colore }} data-testid="player-sito">
                APRI IL SITO <ExternalLink className="h-3 w-3" aria-hidden />
              </a>
            )}
          </div>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
        <MonitorRotante
          voci={vociMonitorDaAnteprima(voci)}
          etichetta={nome}
          colore={colore}
          testid="monitor-player"
          sequenza
          ciclo
          vuoto={
            <span className="flex flex-col items-center gap-3 px-6 text-center">
              <span className="text-balance text-xl font-black tracking-[0.04em] text-white md:text-2xl">{nome.toUpperCase()}</span>
              <span className="rounded-full border px-6 py-2 text-xs font-extrabold tracking-[0.2em]" style={{ borderColor: colore, color: colore }} data-testid="player-vuoto">
                {testoSenzaContenuti(q.data?.stato, q.isLoading)}
              </span>
            </span>
          }
        />

        <section className="flex flex-col gap-3 rounded-xl border border-white/10 p-5" aria-label="Palinsesto" data-testid="scaletta-player">
          <h2 className="text-[12px] font-black tracking-[0.2em]" style={{ color: colore }}>
            PALINSESTO
          </h2>
          {voci.length === 0 ? (
            <p className="text-sm text-white/60">Palinsesto in preparazione: nessun contenuto inserito in Regia.</p>
          ) : (
            <ol className="flex max-h-[420px] flex-col gap-1.5 overflow-y-auto pr-1">
              {voci.map((v, i) => (
                <li key={v.id} className="flex items-baseline gap-2 rounded-lg bg-white/[0.03] px-3 py-2 text-[12px] text-white/80">
                  <span className="w-6 shrink-0 text-right font-bold text-white/40">{i + 1}</span>
                  <span className="min-w-0 flex-1 truncate">{v.titolo}</span>
                  <span className="shrink-0 text-[9.5px] font-extrabold tracking-[0.14em]" style={{ color: colore }}>
                    {ETICHETTA_TIPO[v.tipo] ?? v.tipo.toUpperCase()}
                    {durataLeggibile(v.durataSec) ? ` · ${durataLeggibile(v.durataSec)}` : ""}
                  </span>
                </li>
              ))}
            </ol>
          )}
          {collegamenti.length > 0 && (
            <>
              <h2 className="mt-2 text-[12px] font-black tracking-[0.2em]" style={{ color: colore }}>
                COLLEGAMENTI
              </h2>
              <ul className="flex flex-col gap-1.5 text-[12px]">
                {collegamenti.map((l, i) => (
                  <li key={`${l.href}-${i}`}>
                    {/^https?:\/\//.test(l.href) ? (
                      <a href={l.href} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-white underline-offset-2 hover:underline">
                        {l.nome} <ExternalLink className="h-3 w-3" aria-hidden />
                      </a>
                    ) : (
                      <Link href={l.href} className="text-white underline-offset-2 hover:underline">
                        {l.nome}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </>
          )}
        </section>
      </div>

      {/* 04/11/2026 (round 17): NUOVE USCITE DISCOGRAFICHE, sezione permanente subito sotto il player del Records Channel. */}
      {slug === "touch-music-records" && <NuoveUsciteDiscografiche className="mt-6" />}
    </div>
  );
}
