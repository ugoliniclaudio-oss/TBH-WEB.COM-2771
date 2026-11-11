import { useCallback, useMemo, useRef, useState } from "react";
import { ExternalLink, ListOrdered, Play, Repeat } from "lucide-react";
import { MonitorRotante, type ComandiMonitorRotante, type VoceMonitor } from "./monitor-rotante";
import { segnalaErroreTematico, type VideoTematico } from "../queries/canali-tematici";

/**
 * SCALETTA IN SEQUENZA dei canali tematici (Claudio, 28/10/2026 — prima: ARM WRESTLING).
 *  · all'apertura le miniature girano subito (secondi per anteprima configurabili dal pannello),
 *    con titolo e Play;
 *  · dopo il Play i video vanno in onda nell'ordine della scaletta, uno dopo l'altro nello stesso
 *    player, quando YouTube e il browser lo consentono; durante il caricamento resta la miniatura;
 *  · player bloccato → «Guarda su YouTube», «Successivo», «Riprendi rotazione»;
 *  · «Ciclo continuo H24»: dopo l'ultimo video si riparte dal primo. Non è una diretta sincronizzata:
 *    ogni spettatore parte dal punto in cui preme Play.
 */

const GIALLO = "#d7ff00";

export function testoDurata(sec: number | null | undefined) {
  if (!sec || sec <= 0) return "—";
  const s = Math.round(sec);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const r = s % 60;
  return h ? `${h}:${String(m).padStart(2, "0")}:${String(r).padStart(2, "0")}` : `${m}:${String(r).padStart(2, "0")}`;
}

export function ScalettaCanaleTematico({
  slug,
  nome,
  video,
  campi,
  ciclo,
  secondiImmagine,
  durataTotaleSec,
  senzaDurata,
}: {
  slug: string;
  nome: string;
  video: VideoTematico[];
  campi: { chiave: string; etichetta: string }[];
  ciclo: boolean;
  secondiImmagine: number;
  durataTotaleSec: number;
  senzaDurata: number;
}) {
  const comandi = useRef<ComandiMonitorRotante>(null);
  const [indice, setIndice] = useState(0);
  const voci = useMemo<VoceMonitor[]>(
    () =>
      video.map((v, k) => {
        const dettagli = [v.campi.atleti, v.campi.evento, v.campi.categoria].filter(Boolean).join(" · ");
        return {
          id: String(v.id),
          titolo: v.titolo,
          sotto: [`${k + 1}/${video.length}`, testoDurata(v.durataSec), dettagli || v.fonte].filter(Boolean).join(" · "),
          immagine: v.miniatura ?? (v.piattaforma === "youtube" && v.embedId ? `https://i.ytimg.com/vi/${v.embedId}/hqdefault.jpg` : null),
          youtube: v.piattaforma === "youtube" ? v.embedId : null,
          link: v.url,
          linkEtichetta: v.piattaforma === "youtube" ? "Guarda su YouTube" : "Apri la fonte",
        };
      }),
    [video],
  );
  const segnala = useCallback(
    (voce: VoceMonitor, motivo: string) => {
      void segnalaErroreTematico({ slug, id: Number(voce.id), codice: "monitor", messaggio: motivo.slice(0, 300) });
    },
    [slug],
  );
  const corrente = video[indice];
  const etichetta = (k: string) => campi.find((c) => c.chiave === k)?.etichetta ?? k;
  const dettagli = corrente ? Object.entries(corrente.campi).filter(([k, v]) => v && k !== "linkNumero") : [];

  return (
    <div className="flex flex-col gap-5" data-testid="tematico-scaletta-player">
      <MonitorRotante
        voci={voci}
        durataSec={secondiImmagine}
        etichetta={nome}
        testid="monitor-tematico"
        comandi={comandi}
        onIndice={setIndice}
        sequenza
        ciclo={ciclo}
        onErroreVoce={segnala}
        className="rounded-2xl"
      />

      {corrente && (
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[10px] font-extrabold tracking-[0.22em] text-white/50">
              VIDEO {indice + 1} DI {video.length} · {testoDurata(corrente.durataSec)}
            </p>
            <h2 className="mt-1 text-lg font-extrabold leading-tight text-white md:text-xl" data-testid="tematico-titolo">
              {corrente.titolo}
            </h2>
            {dettagli.length > 0 && (
              <p className="mt-1 text-xs text-white/70">
                {dettagli.map(([k, v]) => (
                  <span key={k} className="mr-3">
                    <span className="text-white/45">{etichetta(k)}:</span> {v}
                  </span>
                ))}
              </p>
            )}
            <p className="mt-1 text-[11px] text-white/45">
              Fonte: {corrente.fonte ?? "—"} ·{" "}
              <a href={corrente.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 underline hover:text-white">
                URL originale <ExternalLink className="h-3 w-3" />
              </a>
            </p>
          </div>
        </div>
      )}

      <section className="flex flex-col gap-3" data-testid="tematico-scaletta" aria-label={`Scaletta di ${nome}`}>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          <h2 className="inline-flex items-center gap-2 text-sm font-extrabold tracking-[0.18em] text-white">
            <ListOrdered className="h-4 w-4" style={{ color: GIALLO }} aria-hidden /> SCALETTA
          </h2>
          <span className="text-[11px] text-white/60" data-testid="tematico-durata-totale">
            {video.length} video · durata totale {testoDurata(durataTotaleSec)}
            {senzaDurata ? ` (+${senzaDurata} senza durata)` : ""}
          </span>
          {ciclo && (
            <span
              className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-extrabold tracking-[0.16em] text-black"
              style={{ background: GIALLO }}
              data-testid="tematico-ciclo-h24"
            >
              <Repeat className="h-3 w-3" aria-hidden /> CICLO CONTINUO H24
            </span>
          )}
        </div>
        <ol className="flex flex-col divide-y divide-white/10 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02]">
          {video.map((v, k) => {
            const attivo = k === indice;
            const img = voci[k]?.immagine;
            return (
              <li key={v.id}>
                <button
                  type="button"
                  onClick={() => (v.piattaforma === "youtube" && v.embedId ? comandi.current?.avvia(k) : comandi.current?.mostra(k))}
                  className={`flex w-full items-center gap-3 px-3 py-2.5 text-left transition hover:bg-white/[0.05] ${attivo ? "bg-white/[0.06]" : ""}`}
                  aria-current={attivo ? "true" : undefined}
                  data-testid={`scaletta-voce-${k + 1}`}
                >
                  <span className="w-6 shrink-0 text-center text-xs font-extrabold" style={{ color: attivo ? GIALLO : "rgba(255,255,255,.5)" }}>
                    {k + 1}
                  </span>
                  <span className="relative aspect-video w-24 shrink-0 overflow-hidden rounded-md bg-black sm:w-32">
                    {img && <img src={img} alt="" className="h-full w-full object-cover" loading="lazy" decoding="async" referrerPolicy="no-referrer" />}
                    <span className="absolute bottom-1 right-1 rounded bg-black/80 px-1 text-[10px] font-bold text-white">{testoDurata(v.durataSec)}</span>
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="line-clamp-2 text-[13px] font-bold leading-snug text-white sm:text-sm">{v.titolo}</span>
                    <span className="mt-0.5 block truncate text-[11px] text-white/50">{v.fonte ?? ""}</span>
                  </span>
                  <Play className="hidden h-4 w-4 shrink-0 sm:block" style={{ color: attivo ? GIALLO : "rgba(255,255,255,.4)" }} fill="currentColor" aria-hidden />
                </button>
              </li>
            );
          })}
        </ol>
        <p className="text-[11px] text-white/45">
          Dopo il Play i video vanno in onda in quest'ordine, uno dopo l'altro{ciclo ? "; dopo l'ultimo si riparte dal primo (Ciclo continuo H24)" : ""}. Non è una diretta: ogni spettatore parte da dove preme Play. Se YouTube o il browser bloccano il player compare «Guarda su YouTube».
        </p>
      </section>
    </div>
  );
}
