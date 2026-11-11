import { Link, useSearchParams } from "wouter";
import { Clock, ExternalLink, Radio, Youtube, ArrowLeft } from "lucide-react";
import { useDm } from "../queries/tbh";
import { MonitorUrl } from "../components/monitor-url";

/**
 * /dm/programmi — indice unico dei programmi DM.
 *
 * Struttura ferrea (ordine di Claudio del 15/09/2026): l'area DM si limita a /dm e
 * /dm/programmi. Il singolo programma NON è una pagina nuova: è la sezione che si apre
 * qui con ?p=<slug>, una sola sezione aperta alla volta. Così l'archivio puntate sta in
 * un posto solo e non si creano doppioni.
 */

const STATO_STILE: Record<string, string> = {
  "ORA IN DIRETTA": "bg-red-600 text-white animate-pulse",
  "QUESTA SERA": "bg-[var(--tbh-neon)] text-black",
  "RIVEDI LA PUNTATA": "bg-white/15 text-[var(--tbh-platinum)]",
  PROSSIMAMENTE: "bg-white/10 text-[var(--tbh-muted)]",
};

function quando(p: { giornoLabel: string | null; ora: string | null }) {
  return p.giornoLabel && p.ora ? `Ogni ${p.giornoLabel} alle ${p.ora}` : "Programmazione da confermare";
}

function dataProssima(iso: string | null) {
  if (!iso) return null;
  return new Date(iso).toLocaleString("it-IT", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Rome",
  });
}

export default function DmProgrammiPage() {
  const q = useDm();
  const [params] = useSearchParams();
  const aperto = params.get("p");

  const tutti = q.data?.programmi ?? [];
  /** In vetrina solo i quattro programmi del palinsesto confermato. */
  const inPalinsesto = tutti.filter((p) => p.inPalinsesto);
  const fuoriPalinsesto = tutti.filter((p) => !p.inPalinsesto);
  const sito = q.data?.canale.sitoEditoriale;

  /* Gli slug storici continuano a funzionare: /media/dm/tg-sportivo resta valido. */
  const scelto = aperto
    ? (tutti.find((p) => p.slug === aperto) ?? tutti.find((p) => p.alias.includes(aperto)) ?? null)
    : null;

  return (
    <div className="mx-auto max-w-[1500px] px-4 md:px-8 py-10">
      <header className="tbh-rise mb-8">
        <p className="text-xs tracking-[0.25em] text-[#ff2b2b] uppercase mb-2">
          DM Comunicazioni · media partner autonomo
        </p>
        <h1 className="tbh-display tbh-h1">I programmi DM</h1>
        <p className="tbh-body text-[var(--tbh-muted)] max-w-3xl mt-3">
          Quattro programmi sul calcio dilettantistico, con giorno e orario confermati dal sito
          ufficiale DM Sport Live. Le puntate stanno nella pagina del programma: qui non
          ripetiamo l'archivio.
        </p>
        <div className="flex flex-wrap gap-2 mt-4">
          <Link
            to="/dm"
            className="px-4 py-2 rounded-full border border-[var(--tbh-line)] text-xs font-bold uppercase tracking-wide inline-flex items-center gap-1.5 hover:border-[var(--tbh-neon)]"
          >
            <ArrowLeft size={13} /> Home DM
          </Link>
          <Link
            to="/sport/calendario"
            className="px-4 py-2 rounded-full border border-[var(--tbh-line)] text-xs font-bold uppercase tracking-wide hover:border-[var(--tbh-neon)]"
          >
            Palinsesto completo
          </Link>
          {sito && (
            <a
              href={sito.url}
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2 rounded-full border border-[#ff2b2b66] text-xs font-bold uppercase tracking-wide text-[#ff2b2b] inline-flex items-center gap-1.5 hover:border-[#ff2b2b]"
            >
              Visita DM Sport Live <ExternalLink size={12} />
            </a>
          )}
        </div>
      </header>

      {q.isLoading && <div className="tbh-card h-64 animate-pulse" />}

      {/* ─── SEZIONE APERTA: un solo programma alla volta, nessuna pagina nuova ─── */}
      {scelto && (
        <section className="tbh-card p-5 md:p-7 mb-10" id="programma">
          <div className="flex flex-wrap items-center gap-3 mb-3">
            <span
              className={`text-[11px] font-bold tracking-wider px-3 py-1.5 rounded-full ${
                STATO_STILE[scelto.stato] ?? STATO_STILE.PROSSIMAMENTE
              }`}
            >
              {scelto.stato}
            </span>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#ff2b2b] border border-[#ff2b2b66] rounded-full px-3 py-1">
              Programma DM
            </span>
          </div>

          <h2 className="tbh-display tbh-h2">{scelto.name}</h2>
          <p className="tbh-body text-[var(--tbh-muted)] max-w-3xl mt-2">{scelto.descrizione}</p>

          <div className="grid gap-5 md:grid-cols-2 mt-6">
            <div className="flex flex-col gap-3">
              <p className="text-sm inline-flex items-center gap-2 text-[var(--tbh-gold)]">
                <Clock size={15} /> {quando(scelto)}
              </p>
              {dataProssima(scelto.prossima) && (
                <p className="text-sm">
                  Prossima diretta: <strong>{dataProssima(scelto.prossima)}</strong>
                </p>
              )}
              {scelto.ultimaPuntata ? (
                <div className="text-sm text-[var(--tbh-muted)]">
                  <p className="text-[var(--tbh-platinum)] font-semibold">
                    Ultima puntata: {scelto.ultimaPuntata.titolo}
                  </p>
                  <ul className="mt-1 space-y-0.5">
                    {scelto.ultimaPuntata.edizione && <li>Edizione {scelto.ultimaPuntata.edizione}</li>}
                    {scelto.ultimaPuntata.durata && <li>Durata {scelto.ultimaPuntata.durata}</li>}
                    {scelto.ultimaPuntata.canale && <li>Canale: {scelto.ultimaPuntata.canale}</li>}
                  </ul>
                </div>
              ) : (
                <p className="text-sm text-[var(--tbh-muted)]">
                  Ultima puntata: pubblichiamo il monitor appena arriva il link ufficiale. Nessun
                  video provvisorio.
                </p>
              )}
              <div className="flex flex-wrap gap-2 pt-1">
                {scelto.youtube && (
                  <a
                    href={scelto.youtube}
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2 rounded-full border border-[#ff2b2b66] text-xs font-bold uppercase tracking-wide text-[#ff2b2b] inline-flex items-center gap-1.5"
                  >
                    <Youtube size={14} /> Canale YouTube
                  </a>
                )}
                {sito && (
                  <a
                    href={sito.url}
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2 rounded-full border border-[var(--tbh-line)] text-xs font-bold uppercase tracking-wide inline-flex items-center gap-1.5 hover:border-[var(--tbh-neon)]"
                  >
                    DM Sport Live <ExternalLink size={12} />
                  </a>
                )}
              </div>
            </div>

            {/* Monitor: solo con il link ufficiale della puntata */}
            {scelto.ultimaPuntata?.video ? (
              <MonitorUrl
                titolo={scelto.ultimaPuntata.titolo}
                url={scelto.ultimaPuntata.video}
                chiave={`dm-programma:${scelto.slug}`}
                cta="Guarda la puntata"
                archivio={scelto.youtube}
                colore="#ff2b2b"
                argomento={`${scelto.name} — ${scelto.ultimaPuntata.titolo}`}
              />
            ) : (
              <div className="rounded-2xl border border-dashed border-[var(--tbh-line)] p-6 grid place-items-center text-center">
                <p className="text-sm text-[var(--tbh-muted)]">
                  Monitor in allestimento: la puntata compare qui quando DM fornisce il link
                  ufficiale.
                </p>
              </div>
            )}
          </div>

          <p className="text-xs text-[var(--tbh-muted)] mt-5">
            Archivio puntate: il canale YouTube ufficiale raccoglie tutte le dirette del programma.
            Non duplichiamo i video in altre pagine.
          </p>

          <Link
            to="/dm/programmi"
            className="text-xs font-bold uppercase tracking-wide text-[var(--tbh-neon)] inline-flex items-center gap-1.5 mt-4"
          >
            <ArrowLeft size={13} /> Chiudi e torna ai quattro programmi
          </Link>
        </section>
      )}

      {aperto && !scelto && !q.isLoading && (
        <p className="tbh-card p-5 text-sm text-[var(--tbh-muted)] mb-8">
          Programma non trovato: qui sotto trovi i programmi in palinsesto.
        </p>
      )}

      {/* ─── LE QUATTRO SCHEDE ─── */}
      <h2 className="tbh-display tbh-h2 mb-4 flex items-center gap-3">
        <Radio className="text-[#ff2b2b]" /> Palinsesto settimanale
      </h2>

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {inPalinsesto.map((p) => (
          <article key={p.slug} className="tbh-card p-5 flex flex-col gap-3">
            {/* Immagine ufficiale del programma non fornita: usiamo il logo ufficiale DM,
                nessuna grafica inventata. */}
            <div className="h-28 w-full rounded-2xl bg-white relative overflow-hidden">
              {q.data?.canale.logo && (
                <img
                  src={q.data.canale.logo}
                  alt="DM Comunicazioni"
                  className="absolute inset-0 h-full w-full object-contain p-3"
                  loading="eager"
                  decoding="async"
                  data-tessera-img
                />
              )}
            </div>
            <span
              className={`text-[11px] font-bold tracking-wider px-3 py-1 rounded-full w-fit ${
                STATO_STILE[p.stato] ?? STATO_STILE.PROSSIMAMENTE
              }`}
            >
              {p.stato}
            </span>
            <h3 className="tbh-display text-2xl leading-tight">{p.name}</h3>
            <p className="text-sm text-[var(--tbh-muted)] grow">{p.descrizione}</p>
            <p className="text-sm inline-flex items-center gap-2 text-[var(--tbh-gold)]">
              <Clock size={15} /> {quando(p)}
            </p>
            <p className="text-xs text-[var(--tbh-muted)]">
              Ultima puntata:{" "}
              {p.ultimaPuntata ? p.ultimaPuntata.titolo : "in attesa del link ufficiale"}
            </p>
            {dataProssima(p.prossima) && (
              <p className="text-xs text-[var(--tbh-muted)]">
                Prossima diretta: {dataProssima(p.prossima)}
              </p>
            )}
            <Link
              to={`/dm/programmi?p=${p.slug}`}
              className="tbh-neon-btn px-4 py-2 text-xs font-bold uppercase tracking-wide w-fit"
            >
              Apri il programma
            </Link>
          </article>
        ))}
      </div>

      {fuoriPalinsesto.length > 0 && (
        <p className="text-xs text-[var(--tbh-muted)] mt-6">
          Fuori dal palinsesto settimanale confermato:{" "}
          {fuoriPalinsesto.map((p) => p.name).join(", ")} — programmazione non confermata da DM, non
          la pubblichiamo con giorno e orario finché non arriva l'ufficialità.
        </p>
      )}
    </div>
  );
}
