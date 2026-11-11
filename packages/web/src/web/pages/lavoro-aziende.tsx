/**
 * TBH Lavoro — Per le aziende turistiche (06/10/2026). Testo e 8 locandine come consegnati
 * da Claudio. WhatsApp +49 dedicato alle AZIENDE (non alle candidature delle persone).
 */
import { useState } from "react";
import { Link } from "wouter";
import { ArrowRight, MapPin, MessageCircle, X } from "lucide-react";
import { POSTER_AZIENDE, TestataLavoro } from "../components/tbh-lavoro";
import { WHATSAPP_AZIENDE } from "../lib/profili-claudio";

const AREE = [
  <>
    Riviera Romagnola, dai Lidi Ferraresi a Numana, con particolare attenzione a{" "}
    <b>Rimini Nord, Bellaria Igea Marina, Cesenatico, Cervia e alle aree di Cesena, Forlì e Ravenna</b>.
  </>,
  <>Area Adriatica, da Jesolo a Vieste.</>,
  <>Riviera Ligure, Ponente e Levante.</>,
  <>Fascia Tirrenica e Ionica, da Sanremo a Isola di Capo Rizzuto.</>,
  <>Sicilia, Sardegna e aree di montagna, ciascuna con uno spazio dedicato.</>,
];

export default function LavoroAziendePage() {
  const [aperta, setAperta] = useState<string | null>(null);
  const poster = POSTER_AZIENDE.find((p) => p.src === aperta);

  return (
    <div className="mx-auto max-w-[1300px] px-4 md:px-8 py-8 md:py-10">
      <TestataLavoro occhiello="TBH Lavoro · per le aziende" titolo="Hai un'attività nel settore turistico e cerchi personale?" />

      <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr] items-start">
        <section className="min-w-0">
          <p className="tbh-body text-white/90">
            Scopri la <b>Bacheca Lavoro TBH</b> e le opportunità commerciali del <b>Circuito Touch Business Holding</b> per
            hotel, strutture ricettive, stabilimenti balneari, ristoranti e imprese turistiche.
          </p>
          <ul className="mt-4 grid gap-2">
            {AREE.map((t, i) => (
              <li key={i} className="flex gap-2 text-sm">
                <MapPin size={16} className="text-[var(--tbh-neon)] shrink-0 mt-0.5" />
                <span>{t}</span>
              </li>
            ))}
          </ul>
          <p className="tbh-display text-xl md:text-2xl mt-6 leading-tight">
            Volete dare visibilità ai vostri annunci o conoscere servizi, prodotti e proposte per la vostra attività?
          </p>
          <div className="flex flex-wrap gap-3 mt-4">
            <a href={WHATSAPP_AZIENDE.url} target="_blank" rel="noreferrer" className="tbh-neon-btn px-6 py-3 inline-flex items-center gap-2">
              <MessageCircle size={17} /> Scriveteci su WhatsApp al {WHATSAPP_AZIENDE.numero}
            </a>
            <Link to="/lavoro-casting/bacheca" className="rounded-full border border-[var(--tbh-line)] px-6 py-3 font-semibold inline-flex items-center gap-2 hover:border-[var(--tbh-neon)]">
              Bacheca Lavoro TBH <ArrowRight size={15} />
            </Link>
          </div>
          <p className="text-sm text-[var(--tbh-muted)] mt-3">Un nostro incaricato si occuperà della vostra richiesta.</p>
          <p className="text-xs text-[var(--tbh-muted)] mt-1">
            Numero riservato alle aziende. Chi cerca lavoro si candida dalla Bacheca o a{" "}
            <a href="mailto:lavoro@tibihacca.com" className="text-[var(--tbh-neon)]">lavoro@tibihacca.com</a>.
          </p>
        </section>

        <button type="button" onClick={() => setAperta(POSTER_AZIENDE[0].src)} className="block rounded-2xl overflow-hidden border border-[var(--tbh-line)]">
          <img src={POSTER_AZIENDE[0].src} alt={POSTER_AZIENDE[0].titolo} className="w-full h-auto" />
        </button>
      </div>

      <h2 className="tbh-display text-2xl mt-10 mb-4">Le aree del Circuito TBH</h2>
      <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
        {POSTER_AZIENDE.slice(1).map((p) => (
          <figure key={p.src} className="min-w-0">
            <button type="button" onClick={() => setAperta(p.src)} className="block w-full rounded-xl overflow-hidden border border-[var(--tbh-line)] hover:border-[var(--tbh-neon)]">
              <img src={p.src} alt={p.titolo} loading="lazy" className="w-full h-auto" />
            </button>
            <figcaption className="text-xs text-[var(--tbh-muted)] mt-1.5">{p.titolo}</figcaption>
          </figure>
        ))}
      </div>

      {poster && (
        <div role="dialog" aria-modal="true" aria-label={poster.titolo} className="fixed inset-0 z-[80] bg-black/90 p-4 flex items-center justify-center" onClick={() => setAperta(null)}>
          <button type="button" aria-label="Chiudi" className="absolute top-4 right-4 rounded-full bg-white/10 p-2" onClick={() => setAperta(null)}>
            <X />
          </button>
          <img src={poster.src} alt={poster.titolo} className="max-h-full max-w-full object-contain" />
        </div>
      )}
    </div>
  );
}
