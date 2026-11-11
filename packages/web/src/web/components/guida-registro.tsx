import { Tv } from "lucide-react";
import { Link } from "wouter";
import { logoDelChannel } from "../../api/data/loghi-channel";
import { CANALI } from "../lib/palinsesto";
import { useRegistroChannel, type ChannelDelRegistro } from "../queries/channel-registro";
import { percorsoPlayer } from "./card-channel";
import { ETICHETTA_STATO } from "./tessera-registro";

/* ────────────────────────────────────────────────────────────────────────────
   04/11/2026 (round 18) — I CHANNEL DEL REGISTRO NELLA GUIDA (/guida) E NELLO ZAPPING.
   La guida e il pannello «Tutti i canali» leggevano solo i 25 canali storici (lib/palinsesto.ts) + i Channel
   aggiunti dal pannello: Touch Music Records Channel, le società TBH, i Channel DM, NOVA TV e BEST non c'erano.
   Ora ci sono tutti, sezione per sezione, senza limite. Nessun doppione: si saltano i Channel la cui pagina è già
   uno dei canali storici, quelli aggiunti dal pannello (già nella sezione «Nuovi Channel e pagine») e gli spazi
   ancora vuoti. Numeri e pagine dei canali storici invariati.
   ──────────────────────────────────────────────────────────────────────────── */

const FLUO = "#d7ff00";
const ROSSO_DM = "#ff2b2b";
const URL_STORICI = new Set(CANALI.map((c) => c.url));

const daMostrare = (c: ChannelDelRegistro) =>
  !(c.slotVuoto && !c.compilato) && !(c.fonte === "slot" && !c.slotVuoto) && !(c.pagina && URL_STORICI.has(c.pagina));

export const destinazioneChannel = (c: ChannelDelRegistro) => c.pagina ?? percorsoPlayer(c.slug);

const logoDi = (c: ChannelDelRegistro) => c.logoRegia ?? (c.logo ? (logoDelChannel(c.slug)?.src ?? c.logo) : null);

export function useChannelRegistroGuida() {
  const reg = useRegistroChannel();
  const lista = (reg.data?.channel ?? []).filter(daMostrare);
  const sezioni = (reg.data?.sezioni ?? []).map((s) => ({ ...s, lista: lista.filter((c) => c.sezione === s.id) })).filter((s) => s.lista.length > 0);
  return { lista, sezioni, caricamento: reg.isLoading };
}

function Collegamento({ c, className, children, onClick, testid }: { c: ChannelDelRegistro; className: string; children: React.ReactNode; onClick?: () => void; testid: string }) {
  const to = destinazioneChannel(c);
  const dm = c.appartenenza === "DM";
  const stile = { borderColor: dm ? ROSSO_DM : undefined };
  return c.esterno ? (
    <a href={to} target="_blank" rel="noopener noreferrer" onClick={onClick} className={className} style={stile} data-guida-registro={testid}>
      {children}
    </a>
  ) : (
    <Link to={to} onClick={onClick} className={className} style={stile} data-guida-registro={testid}>
      {children}
    </Link>
  );
}

/** /guida — «TUTTI I CHANNEL», sezione per sezione. */
export function SezioneRegistroGuida() {
  const { lista, sezioni, caricamento } = useChannelRegistroGuida();
  if (caricamento) return <p className="mx-auto max-w-[1500px] px-4 py-4 text-sm text-white/50 md:px-8">Caricamento dei Channel…</p>;
  if (!lista.length) return null;
  return (
    <section className="mx-auto max-w-[1500px] px-4 py-8 md:px-8" data-testid="guida-registro" data-totale={lista.length}>
      <div className="mb-4 flex items-center gap-2">
        <Tv size={16} className="text-[var(--tbh-neon)]" />
        <h2 className="tbh-h2 tbh-display">TUTTI I CHANNEL · {lista.length}</h2>
      </div>
      <div className="flex flex-col gap-8">
        {sezioni.map((s) => {
          const dm = s.id === "dm";
          return (
            <div key={s.id} data-testid={`guida-sezione-${s.id}`}>
              <h3 className="mb-3 text-[12px] font-black tracking-[0.2em]" style={{ color: dm ? ROSSO_DM : FLUO }}>
                {s.titolo} · {s.lista.length}
              </h3>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {s.lista.map((c) => {
                  const logo = logoDi(c);
                  return (
                    <div key={c.slug} className="tbh-card flex flex-col gap-2 p-4" style={{ borderColor: dm ? ROSSO_DM : undefined }}>
                      <Collegamento c={c} className="flex items-center gap-3" testid={c.slug}>
                        <span className="grid h-12 w-16 shrink-0 place-items-center overflow-hidden rounded-md bg-black">
                          {logo ? <img src={logo} alt="" loading="lazy" className="h-12 w-16 object-contain" /> : <Tv size={16} style={{ color: dm ? ROSSO_DM : FLUO }} aria-hidden />}
                        </span>
                        <span className="min-w-0">
                          <span className="block text-[14px] font-extrabold uppercase leading-tight tracking-[0.06em] text-white">{c.nome}</span>
                          <span className="block truncate text-[11px] text-white/50">{c.appartenenza} · {ETICHETTA_STATO[c.stato] ?? c.stato}</span>
                        </span>
                      </Collegamento>
                      <div className="mt-auto flex gap-3 text-[11px] font-extrabold uppercase tracking-[0.14em]">
                        <Collegamento c={c} className="hover:underline" testid={`${c.slug}-apri`}>
                          <span style={{ color: dm ? ROSSO_DM : FLUO }}>Apri Channel</span>
                        </Collegamento>
                        <Link to={c.scheda} className="text-white/60 hover:text-white hover:underline">
                          Scheda
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

/** Zapping — voci del pannello «Tutti i canali». */
export function VociZappingRegistro({ onChiudi, percorso }: { onChiudi: () => void; percorso: string }) {
  const { lista } = useChannelRegistroGuida();
  return (
    <>
      {lista.map((c) => {
        const to = destinazioneChannel(c);
        const qui = percorso === to || percorso === c.scheda;
        const logo = logoDi(c);
        const dm = c.appartenenza === "DM";
        return (
          <li key={c.slug}>
            <Collegamento
              c={c}
              onClick={onChiudi}
              className={`flex min-h-14 items-center gap-3 rounded-xl border px-3 py-2 transition ${qui ? "bg-white/[0.07]" : "border-white/10 hover:border-white/30"}`}
              testid={`zap-${c.slug}`}
            >
              <span className="grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-lg bg-black">
                {logo ? <img src={logo} alt="" width={40} height={40} loading="lazy" className="h-10 w-10 object-contain" /> : <Tv size={16} style={{ color: dm ? ROSSO_DM : FLUO }} aria-hidden />}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[13px] font-extrabold uppercase tracking-[0.08em] text-white">{c.nome}</span>
                <span className="block truncate text-[11px] text-white/50">Channel · {c.appartenenza}</span>
              </span>
            </Collegamento>
          </li>
        );
      })}
    </>
  );
}
