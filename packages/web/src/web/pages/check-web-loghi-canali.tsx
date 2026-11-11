import { Link } from "wouter";
import { AlertTriangle, ArrowRight, Radio, Tv } from "lucide-react";
import { useInfoCanali } from "../queries/canali-touch";
import { SeguiDiretta } from "../components/segui-diretta";
import { COLORE_TBH } from "../lib/identita-tbh";
import { LOGHI_CHANNEL } from "../../api/data/loghi-channel";
import { CHANNEL_HOME, titoloChannel } from "../../api/data/channel-home";
import { schedaChannelInPreparazione } from "../../api/data/channel-in-preparazione";

/* ────────────────────────────────────────────────────────────────────────────
   BOZZA «LOGHI CANALI» — 15/10/2026.

   Regola di Claudio: TOUCH RADIO e TOUCH TV hanno ciascuno il proprio logo,
   il logo TOUCH MUSIC appartiene SOLO alla rubrica. Qui si mostrano i file
   ORIGINALI già presenti nel sito che potrebbero essere i loghi dei canali:
   è soltanto una proposta. Finché non arriva il sì, le pagine /radio e /tv
   mostrano lo slot «IN ATTESA DI APPROVAZIONE». Nessun logo generato.
   ──────────────────────────────────────────────────────────────────────────── */

const GIALLO = COLORE_TBH;
const ROSSO_DM = "#ff2b2b";

/* 18–19/10/2026 — LOGHI APPROVATI da Claudio: elenco letto dalla fonte unica
   (loghi-channel.ts), nell'ordine dei 28 Channel; in coda i loghi fuori elenco. */
function LoghiApprovati() {
  const voci = Object.entries(LOGHI_CHANNEL)
    .map(([slug, l]) => ({ slug, l, c: CHANNEL_HOME.find((x) => x.slug === slug) }))
    .sort((a, b) => (a.c?.numero ?? 999) - (b.c?.numero ?? 999));
  const senza = CHANNEL_HOME.filter((c) => c.categoria === "squadra" && !LOGHI_CHANNEL[c.slug]);
  return (
    <section className="flex flex-col gap-4 rounded-3xl border p-4 md:p-6" style={{ borderColor: `${GIALLO}88` }} data-testid="loghi-approvati">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="tbh-display text-3xl leading-none md:text-4xl" style={{ color: GIALLO }}>
          LOGHI APPROVATI · {voci.length}
        </h2>
        <span className="rounded-full border px-3 py-1 text-[11px] font-bold tracking-[0.12em]" style={{ borderColor: GIALLO, color: GIALLO }}>
          ORIGINALI · NESSUNA MODIFICA
        </span>
      </div>
      <p className="text-sm text-[var(--tbh-muted)]">
        Nessun ritaglio, ridimensionamento o ricostruzione. I primi 13 sono copiati byte per byte (stesso md5
        dell'allegato); per i 10 del 19/10 (PNG da 1,4–2,3 MB) l'originale identico è in archivio e il sito usa una copia
        ottimizzata con le stesse dimensioni in pixel. Ogni Channel usa lo stesso file su telecomando, anteprime e pagina.
        {senza.length > 0 && ` Senza logo per ora: ${senza.map((c) => titoloChannel(c)).join(", ")}.`}
      </p>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {voci.map(({ slug, l, c }) => (
          <figure
            key={slug}
            className="flex flex-col gap-3 rounded-2xl border p-4"
            style={{ borderColor: c?.mediaPartnerEsterno ? ROSSO_DM : "var(--tbh-line)" }}
            data-testid={`approvato-${slug}`}
          >
            {(() => {
              const scheda = l.inPreparazione ? schedaChannelInPreparazione(slug) : (c?.pagina ?? (l.fuoriElenco ? `/channel/scheda/${slug}` : null));
              const img = <img src={l.src} alt={`Logo ${c ? titoloChannel(c) : (l.nome ?? slug)}`} className="max-h-full max-w-full object-contain" />;
              return scheda ? (
                <Link to={scheda} className="grid h-40 place-items-center rounded-xl bg-black p-3" data-testid="apri-scheda" title="Apri la scheda">
                  {img}
                </Link>
              ) : (
                <div className="grid h-40 place-items-center rounded-xl bg-black p-3">{img}</div>
              );
            })()}
            <figcaption className="flex flex-col gap-1 text-sm">
              <strong className="text-[var(--tbh-platinum)]">
                {c ? titoloChannel(c) : (l.nome ?? slug)}
              </strong>
              <span className="text-xs font-bold tracking-[0.12em]" style={{ color: l.fuoriElenco || l.inPreparazione ? "var(--tbh-gold)" : GIALLO }}>
                {l.inPreparazione
                  ? "NUOVO CHANNEL · NESSUNA POSIZIONE · NON IN HOME · SOLO SCHEDA"
                  : l.fuoriElenco
                    ? `FUORI DALL'ELENCO DEI 28 · NESSUN NUMERO · APPROVATO IL ${l.approvato}`
                    : `APPROVATO IL ${l.approvato}`}
              </span>
              {l.originale && (
                <code className="break-all text-[10px] text-[var(--tbh-muted)]">
                  originale in archivio: {l.originale} · copia sito {((l.byteCopia ?? 0) / 1048576).toFixed(2)} MB · md5 {l.md5Copia}
                </code>
              )}
              <code className="break-all text-xs text-[var(--tbh-muted)]">{l.src}</code>
              <code className="break-all text-[10px] text-[var(--tbh-muted)]">
                {l.fileOriginale} · md5 {l.md5}
              </code>
              {l.tbh && (
                <div className="mt-2 flex flex-col gap-1 border-t border-[var(--tbh-line)] pt-2" data-testid={`tbh-${slug}`}>
                  <span className="text-xs font-bold tracking-[0.12em]" style={{ color: GIALLO }}>
                    LOGO CHANNEL · VERSIONE TBH · APPROVATO IL {l.tbh.approvato}
                  </span>
                  <div className="grid h-32 place-items-center rounded-xl bg-black p-2">
                    <img src={l.tbh.src} alt={`Logo TBH ${l.nome ?? slug}`} className="max-h-full max-w-full object-contain" />
                  </div>
                  <span className="text-[10px] text-[var(--tbh-muted)]">
                    Usato su tessere, schede e monitor del Channel. Il logo sopra resta archiviato; lo stemma della società non cambia.
                  </span>
                  <code className="break-all text-[10px] text-[var(--tbh-muted)]">
                    {l.tbh.src} · originale in archivio: {l.tbh.originale} · {l.tbh.fileOriginale} · md5 {l.tbh.md5}
                  </code>
                </div>
              )}
              {l.dmTv && (
                <div className="mt-2 flex flex-col gap-1 border-t border-[var(--tbh-line)] pt-2" data-testid={`dmtv-${slug}`}>
                  <span className="text-xs font-bold tracking-[0.12em]" style={{ color: ROSSO_DM }}>
                    LOGO CHANNEL · VERSIONE DM TV · APPROVATO IL {l.dmTv.approvato}
                  </span>
                  <div className="grid h-32 place-items-center rounded-xl bg-black p-2">
                    <img src={l.dmTv.src} alt={`Logo DM TV ${c ? titoloChannel(c) : slug}`} className="max-h-full max-w-full object-contain" />
                  </div>
                  <span className="text-[10px] text-[var(--tbh-muted)]">
                    Usato su tessere, schede, telecomando e monitor del Channel. Il logo sopra resta lo stemma della società / il logo aziendale.
                  </span>
                  <code className="break-all text-[10px] text-[var(--tbh-muted)]">
                    {l.dmTv.src} · originale in archivio: {l.dmTv.originale} · {l.dmTv.fileOriginale} · md5 {l.dmTv.md5}
                  </code>
                </div>
              )}
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}

/* 17/10/2026 — LOGHI DELLE FONTI inviati da Claudio (tuttocampo.it, romagnasport.com,
   foglio «SportApp 4 loghi HD»). Ritagliati dagli originali, nessun ridisegno.
   Sono loghi di FONTI/PARTNER: non diventano loghi di canali TBH. Oggi compaiono
   solo nel palinsesto partite dell'anteprima /check-web/canali/:slug. */
const LOGHI_FONTI_ANTEPRIMA = [
  { file: "/brand/fonti/tuttocampo.png", nome: "Tutto Campo", origine: "Originale inviato (758×99), identico", uso: "Collegamento al girone nel palinsesto partite" },
  { file: "/brand/fonti/romagnasport.png", nome: "Romagna Sport", origine: "Ritaglio dal foglio SportApp 4 loghi HD", uso: "Fonte di calendari e classifiche del palinsesto partite" },
  { file: "/brand/fonti/romagnasport-banner.png", nome: "Romagna Sport · banner", origine: "Originale inviato (474×175), identico", uso: "Nessun uso: da decidere" },
  { file: "/brand/fonti/marchesport.png", nome: "Marche Sport", origine: "Ritaglio dal foglio SportApp 4 loghi HD", uso: "Nessun uso: da decidere (Gabicce Gradara gioca nelle Marche)" },
  { file: "/brand/fonti/emiliaromagnasport.png", nome: "Emilia Romagna Sport", origine: "Ritaglio dal foglio SportApp 4 loghi HD", uso: "Nessun uso: da decidere" },
  { file: "/brand/fonti/sportapp-wordmark.png", nome: "SportApp · scritta", origine: "Ritaglio dal foglio SportApp 4 loghi HD", uso: "Nessun uso: da decidere" },
  { file: "/brand/fonti/sportapp-icona.png", nome: "SportApp · icona", origine: "Ritaglio dal foglio SportApp 4 loghi HD", uso: "Nessun uso: da decidere" },
];

export default function CheckWebLoghiCanaliPage() {
  const info = useInfoCanali();
  const d = info.data;

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-8 md:py-12" data-testid="check-loghi-canali">
      <header className="flex flex-col gap-3">
        <p className="text-[10px] uppercase tracking-[0.24em] text-[var(--tbh-muted)]">Bozza · proposta in attesa di approvazione</p>
        <h1 className="tbh-display tbh-h1 leading-none">LOGHI DEI CANALI · ANTEPRIMA</h1>
        <p className="tbh-body max-w-[80ch] text-[var(--tbh-muted)]">
          In alto i loghi approvati (13 originali identici + 10 del 19/10/2026 con originale in archivio e copia ottimizzata; il 28/10/2026 + 9 versioni DM TV e 9 card co-firmate TBH, di cui 8 Channel nuovi delle società e Touch Music Channel). TOUCH TV è assegnato a{" "}
          <Link to="/tv" className="text-[var(--tbh-platinum)] underline">/tv</Link>. Più sotto restano i vecchi
          candidati: la pagina{" "}
          <Link to="/radio" className="text-[var(--tbh-platinum)] underline">/radio</Link> mostra ancora lo slot
          «IN ATTESA DI APPROVAZIONE» finché non arriva il logo originale di TOUCH RADIO.
        </p>
        <p className="flex items-start gap-2 rounded-2xl border border-[var(--tbh-gold)]/50 p-3 text-sm text-[var(--tbh-gold)]">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          Due dei tre candidati contengono la parola «MUSIC». Visto che TOUCH MUSIC ora è una rubrica, va confermato se
          quei file vanno bene per i canali o se servono versioni «TOUCH RADIO» / «TOUCH TV».
        </p>
      </header>

      <LoghiApprovati />

      {info.isLoading && <p className="text-sm text-[var(--tbh-muted)]">Caricamento…</p>}

      {d &&
        d.canali.map((c) => {
          const candidati = d.loghiCandidati.filter((l) => l.perCanale === c.id);
          const Icona = c.id === "tv" ? Tv : Radio;
          return (
            <section key={c.id} className="flex flex-col gap-4 rounded-3xl border border-[var(--tbh-line)] p-4 md:p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="tbh-display flex items-center gap-2 text-3xl leading-none md:text-4xl" style={{ color: GIALLO }}>
                  <Icona className="h-7 w-7 shrink-0" /> {c.nome}
                </h2>
                <span className="rounded-full border border-[var(--tbh-gold)]/60 px-3 py-1 text-[11px] font-bold tracking-[0.12em] text-[var(--tbh-gold)]">
                  {c.logo ? "LOGO ASSEGNATO" : c.statoLogo}
                </span>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                {candidati.map((l, i) => (
                  <figure key={l.file} className="flex flex-col gap-3 rounded-2xl border border-dashed border-[var(--tbh-line)] p-4">
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--tbh-muted)]">
                      Candidato {i + 1} · proposta
                    </span>
                    <div className="grid aspect-[4/3] place-items-center rounded-xl bg-black p-4">
                      <img src={l.file} alt={l.scritta} className="max-h-full max-w-full object-contain" />
                    </div>
                    <figcaption className="flex flex-col gap-1 text-sm">
                      <strong className="text-[var(--tbh-platinum)]">{l.scritta}</strong>
                      <span className="text-[var(--tbh-muted)]">{l.proposta}</span>
                      <code className="break-all text-xs text-[var(--tbh-muted)]">{l.file}</code>
                    </figcaption>
                  </figure>
                ))}
              </div>
            </section>
          );
        })}

      {d && (
        <section className="flex flex-col gap-4 rounded-3xl border border-[var(--tbh-line)] p-4 md:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="tbh-display text-3xl leading-none md:text-4xl">RUBRICA TOUCH MUSIC</h2>
            <span className="rounded-full border border-[var(--tbh-neon)]/60 px-3 py-1 text-[11px] font-bold tracking-[0.12em] text-[var(--tbh-neon)]">
              SOLO PER LA RUBRICA · MAI SUI CANALI
            </span>
          </div>
          <div className="grid items-center gap-4 sm:grid-cols-[minmax(0,320px)_1fr]">
            <div className="grid aspect-square place-items-center overflow-hidden rounded-2xl bg-black">
              <img src={d.logoRubricaTouchMusic.file} alt="Logo rubrica TOUCH MUSIC" className="max-h-full max-w-full object-contain" />
            </div>
            <p className="text-sm text-[var(--tbh-muted)]">{d.logoRubricaTouchMusic.nota}</p>
          </div>
        </section>
      )}

      <section className="flex flex-col gap-4 rounded-3xl border border-[var(--tbh-line)] p-4 md:p-6" data-testid="loghi-fonti">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="tbh-display text-3xl leading-none md:text-4xl" style={{ color: GIALLO }}>
            LOGHI DELLE FONTI SPORTIVE
          </h2>
          <span className="rounded-full border border-[var(--tbh-gold)]/60 px-3 py-1 text-[11px] font-bold tracking-[0.12em] text-[var(--tbh-gold)]">
            ANTEPRIMA · DA APPROVARE
          </span>
        </div>
        <p className="text-sm text-[var(--tbh-muted)]">
          File inviati il 17/10/2026, ritagliati dagli originali senza ridisegnarli. Sono loghi di fonti esterne: non diventano
          loghi dei canali TBH. Per ora compaiono solo nel palinsesto partite delle pagine-canale squadra in anteprima.
        </p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {LOGHI_FONTI_ANTEPRIMA.map((l) => (
            <figure key={l.file} className="flex flex-col gap-3 rounded-2xl border border-dashed border-[var(--tbh-line)] p-4">
              <div className="h-32 rounded-xl bg-white p-4">
                <img src={l.file} alt={l.nome} className="h-full w-full object-contain" />
              </div>
              <figcaption className="flex flex-col gap-1 text-sm">
                <strong className="text-[var(--tbh-platinum)]">{l.nome}</strong>
                <span className="text-[var(--tbh-muted)]">{l.origine}</span>
                <span className="text-xs text-[var(--tbh-platinum)]">Uso: {l.uso}</span>
                <code className="break-all text-xs text-[var(--tbh-muted)]">{l.file}</code>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <p className="text-[10px] uppercase tracking-[0.22em] text-[var(--tbh-muted)]">
          Bozza · carosello globale «SEGUI LA DIRETTA ORA» (oggi solo su /radio, /tv e /rubriche)
        </p>
        <SeguiDiretta />
      </section>

      <div className="flex flex-wrap items-center gap-2.5">
        <Link to="/check-web" className="rounded-xl border border-[var(--tbh-line)] px-4 py-3 text-xs hover:border-[var(--tbh-neon)] hover:text-[var(--tbh-neon)]">
          ALTRE BOZZE · CHECK WEB
        </Link>
        <Link to="/rubriche" className="tbh-neon-btn inline-flex items-center gap-2 px-5 py-3 text-sm">
          RUBRICHE <ArrowRight size={14} />
        </Link>
      </div>
    </div>
  );
}
