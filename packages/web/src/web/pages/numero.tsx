import { Link } from "wouter";
import { ArrowLeft, ArrowRight, BookOpen, MessageCircle, Star } from "lucide-react";
import { useNumero } from "../queries/editoria";
import { useMediaSlot } from "../queries/media";
import {
  CampoAllegati,
  CampoGallery,
  CampoImmagine,
  SbloccoSeServe,
} from "../components/media-manager";
import {
  slotCopertina,
  slotPagine,
  slotInsertoSport,
  slotSfogliabile,
  INSERTI_SPORT_DA,
  INSERTI_SPORT_ANNO,
} from "../lib/slot-magazine";
import { waInfo } from "../lib/whatsapp";

/**
 * FASE 7 — Scheda del singolo numero di Touch Influencity Magazine.
 * Nessuna copertina, nessun sommario e nessun titolo di articolo inventato: se il file non c'è,
 * la pagina lo dice e offre il canale per riceverlo.
 */
export default function NumeroPage({ slug }: { slug: string }) {
  const q = useNumero(slug);
  const item = q.data?.item ?? null;
  /* 28/09/2026 — gli spazi di caricamento (copertina, pagine, PDF, inserto) seguono sempre
     l'indirizzo canonico del numero: se si arriva da un vecchio indirizzo (alias) si lavora
     comunque sullo stesso numero, senza creare uno spazio doppio. */
  const chiave = q.data?.slugCanonico ?? item?.slug ?? slug;
  // Copertina caricata dal pannello: vince su quella eventualmente già nel codice.
  const copSlot = useMediaSlot(slotCopertina(chiave));
  const caricata = copSlot.data?.items?.find((i) => i.url)?.url ?? null;
  const copertina = caricata ?? item?.copertina ?? null;
  // Sfogliabile: vale prima il PDF caricato dal pannello, poi quello già nel codice.
  const pdfSlot = useMediaSlot(slotSfogliabile(chiave));
  const pdfCaricato = pdfSlot.data?.items?.find((i) => i.url)?.url ?? null;
  const pdf = pdfCaricato ?? item?.pdf ?? null;

  if (q.isLoading)
    return (
      <div className="mx-auto max-w-[1100px] px-4 md:px-8 py-14">
        <div className="tbh-card h-64 animate-pulse" />
      </div>
    );

  if (!item)
    return (
      <div className="mx-auto max-w-[1100px] px-4 md:px-8 py-14">
        <h1 className="tbh-display tbh-h1">Numero non trovato</h1>
        <p className="tbh-body text-[var(--tbh-muted)] mt-3">
          Questo numero non è nell'elenco ufficiale del magazine.
        </p>
        <Link to="/influencity" className="tbh-neon-btn px-5 py-3 inline-flex mt-6">
          Torna all'edicola
        </Link>
      </div>
    );

  return (
    <div className="mx-auto max-w-[1300px] px-4 md:px-8 py-10">
      <Link
        to="/influencity"
        className="text-sm text-[var(--tbh-muted)] inline-flex items-center gap-2"
      >
        <ArrowLeft size={15} /> Edicola Touch Influencity Magazine
      </Link>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,380px)_1fr] mt-6">
        <div className="flex flex-col gap-4">
        <div className="tbh-card overflow-hidden">
          <div className="aspect-[3/4] w-full bg-white relative grid place-items-center overflow-hidden p-6 text-center">
            {copertina ? (
              <img
                src={copertina}
                alt={`Copertina numero ${item.numero}`}
                className="absolute inset-0 h-full w-full object-contain p-6"
              />
            ) : (
              <div className="flex flex-col items-center gap-3">
                <BookOpen size={40} className="text-black/50" />
                <span className="tbh-display text-5xl text-black leading-none">
                  N°{item.numero}
                </span>
                <span className="text-sm font-semibold uppercase tracking-wide text-black/60">
                  {item.periodo}
                </span>
                <span className="text-[11px] text-black/40">
                  Copertina ufficiale da ricevere: non ne creiamo una al suo posto.
                </span>
              </div>
            )}
          </div>
        </div>

          <CampoImmagine
            slot={slotCopertina(chiave)}
            etichetta="Copertina di questo numero"
            aiuto="Si carica la foto della copertina, una per numero: appena salvata compare qui e nell'edicola. Si può anche riusare un file già in libreria."
            titolo={`Copertina N°${item.numero} — ${item.periodo}`}
            proporzione="3/4"
            nascondiSeVuoto
          />
        </div>

        <div className="flex flex-col gap-5">
          <div>
            <span className="text-[11px] uppercase tracking-[0.2em] text-[var(--tbh-gold)]">
              Touch Influencity Magazine · {item.anno}
            </span>
            <h1 className="tbh-display tbh-h1 mt-2">Numero {item.numero}</h1>
            <p className="tbh-body text-[var(--tbh-muted)] mt-2">{item.periodo}</p>
            {item.speciale && (
              <span className="inline-flex items-center gap-2 mt-3 text-sm font-bold uppercase text-[var(--tbh-gold)]">
                <Star size={15} /> Speciale di fine anno con gli highlights
              </span>
            )}
          </div>

          <section className="tbh-card p-5 md:p-6 flex flex-col gap-3">
            <h2 className="tbh-display tbh-h3">Sfogliabile</h2>
            {pdf ? (
              <a
                href={pdf}
                target="_blank"
                rel="noreferrer"
                className="tbh-neon-btn px-5 py-3 inline-flex items-center gap-2 self-start"
              >
                Apri il numero
              </a>
            ) : (
              <>
                <p className="text-sm text-[var(--tbh-muted)]">
                  Lo sfogliabile di questo numero non è ancora nel portale. Appena arriva il file
                  ufficiale compare qui, senza toccare nient'altro della pagina.
                </p>
                <a
                  href={waInfo(`numero ${item.numero} di Touch Influencity Magazine (${item.periodo})`)}
                  target="_blank"
                  rel="noreferrer"
                  className="tbh-neon-btn px-5 py-3 inline-flex items-center gap-2 self-start"
                >
                  <MessageCircle size={17} /> Richiedi o invia il file
                </a>
              </>
            )}
            {/* Il PDF ufficiale si carica da qui: allegato, separato dalle foto. */}
            <CampoAllegati
              slot={slotSfogliabile(chiave)}
              etichetta="File sfogliabile del numero (PDF)"
              aiuto="Appena il PDF è caricato, il pulsante «Apri il numero» punta a questo file."
              nascondiSeVuoto
            />
          </section>

          <section className="tbh-card p-5 md:p-6 flex flex-col gap-2">
            <h2 className="tbh-display tbh-h3">Dentro il magazine</h2>
            <p className="text-sm text-[var(--tbh-muted)]">
              Touch Spotlight è una rubrica interna al magazine, non una rivista separata: mette in
              vetrina sponsor, partner e imprese del Circuito con presentazione e intervista.
            </p>
            <Link
              to="/tbh/brand-personalizzazioni"
              className="text-sm font-semibold text-[var(--tbh-neon)] inline-flex items-center gap-2"
            >
              Vedi gli spazi di visibilità <ArrowRight size={15} />
            </Link>
          </section>

          <CampoGallery
            slot={slotPagine(chiave)}
            etichetta="Tutte le pagine di questo numero"
            aiuto="Le pagine si caricano anche tutte insieme, poi si riordinano con le frecce. La stella porta una pagina in testa."
            nascondiSeVuoto
          />

          <CampoGallery
            slot={slotInsertoSport(chiave)}
            etichetta="Inserto sportivo"
            aiuto={
              item.anno < INSERTI_SPORT_ANNO
                ? `Gli inserti sportivi partono da ${INSERTI_SPORT_DA}: in questo numero non c'era ancora.`
                : `Inserto sportivo del numero. Gli inserti sportivi partono da ${INSERTI_SPORT_DA}.`
            }
            nascondiSeVuoto
          />

          <div className="flex flex-wrap gap-3">
            {q.data?.precedente && (
              <Link
                to={`/influencity/${q.data.precedente.slug}`}
                className="tbh-card px-4 py-3 text-sm inline-flex items-center gap-2"
              >
                <ArrowLeft size={15} /> N°{q.data.precedente.numero}
              </Link>
            )}
            {q.data?.successivo && (
              <Link
                to={`/influencity/${q.data.successivo.slug}`}
                className="tbh-card px-4 py-3 text-sm inline-flex items-center gap-2"
              >
                N°{q.data.successivo.numero} <ArrowRight size={15} />
              </Link>
            )}
          </div>

          <p className="text-[11px] text-[var(--tbh-muted)]">{q.data?.nota}</p>

          {/* Ingresso discreto per l'amministratore: ai visitatori resta una riga di testo. */}
          <SbloccoSeServe />
        </div>
      </div>
    </div>
  );
}
