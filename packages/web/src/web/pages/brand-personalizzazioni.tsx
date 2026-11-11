import { Link } from "wouter";
import { MessageCircle, ArrowRight } from "lucide-react";
import { useVisibilita } from "../queries/visibilita";
import { wa } from "../lib/whatsapp";

/**
 * Hub "Brand & Personalizzazioni": raccoglie i modi in cui il marchio di un cliente
 * viene personalizzato sui nostri contenuti e sui nostri spazi.
 * Sottosezione principale: BRAND IN INTERVISTA · STUDIO · DIRETTA.
 * Nessun prezzo in pagina: la trattativa passa da WhatsApp.
 */

const ALTRE_AREE: { to: string; titolo: string; testo: string }[] = [
  {
    to: "/dm",
    titolo: "Programmi e canale DM Comunicazioni",
    testo:
      "Media partner autonomo: interviste, studio, dirette e programmi sportivi dove il marchio trova posto.",
  },
  {
    to: "/tbh/livelli",
    titolo: "Livelli di adesione",
    testo: "I 25 livelli TBH: benefit, bonus e cashback (prezzi da definire con Claudio).",
  },
  {
    to: "/tbh/pagine",
    titolo: "Pagine TBH",
    testo: "Ogni attività, produzione e piattaforma del gruppo con la sua scheda dedicata.",
  },
  {
    to: "/tbh/servizi",
    titolo: "Servizi & chi li eroga",
    testo: "Chi produce, gira, monta e distribuisce: società con P.IVA e attività del gruppo.",
  },
  {
    to: "/territorio/spazi",
    titolo: "Spazi sul territorio",
    testo: "Locali, negozi, strutture e piazze dove il marchio si vede dal vivo.",
  },
  {
    to: "/network/circuito",
    titolo: "Circuito e network",
    testo: "Clienti, sponsor e partner collegati: la rete su cui gira la visibilità.",
  },
];

export default function BrandPersonalizzazioniPage() {
  const q = useVisibilita();

  return (
    <div className="mx-auto max-w-[1500px] px-4 md:px-8 py-10">
      <header className="tbh-rise mb-8">
        <p className="text-xs tracking-[0.25em] text-[var(--tbh-gold)] uppercase mb-2">
          Mondo TBH · brand del cliente
        </p>
        <h1 className="tbh-display tbh-h1">Brand &amp; Personalizzazioni</h1>
        <p className="tbh-body text-[var(--tbh-muted)] max-w-4xl mt-3">
          Dove finisce il marchio di un cliente quando lavora con noi: superfici in scena, grafiche in
          onda, spazi fisici, contenuti che restano online. Qui si scelgono le posizioni, non un
          pacchetto preconfezionato.
        </p>
      </header>

      {/* Sottosezione principale */}
      <Link
        to="/tbh/brand-personalizzazioni/visibilita-in-onda"
        className="tbh-card block overflow-hidden hover:border-[var(--tbh-neon)] transition"
      >
        <div className="grid md:grid-cols-2">
          <img
            src="/brand-visibilita/studio.jpg"
            alt="Simulazione di studio televisivo con superfici sponsor libere"
            className="w-full h-full object-cover"
          />
          <div className="p-6 md:p-8">
            <p className="text-xs tracking-[0.25em] text-[var(--tbh-gold)] uppercase mb-2">
              Sottosezione
            </p>
            <h2 className="tbh-display text-3xl md:text-4xl leading-tight">
              Brand in intervista · studio · diretta
            </h2>
            <p className="tbh-body text-[var(--tbh-muted)] mt-3">
              Non è «uno spot». Da una sola trasmissione nascono decine di occasioni di visibilità:
              backdrop, microfono, lower third, led wall, desk, rubriche, replay e clip social.
            </p>
            {q.data && (
              <p className="text-sm text-[var(--tbh-neon)] mt-3">
                {q.data.conteggi.scene} scene · {q.data.conteggi.posizioni} posizioni numerate e
                spiegate
              </p>
            )}
            <span className="tbh-neon-btn px-5 py-3 text-sm inline-flex items-center gap-2 mt-6">
              Apri la sottosezione <ArrowRight size={16} />
            </span>
          </div>
        </div>
      </Link>

      {/* Altre aree già presenti nel sito: nulla viene sostituito */}
      <h2 className="tbh-display tbh-h2 mt-12 mb-4">Collegate a questa sezione</h2>
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {ALTRE_AREE.map((a) => (
          <Link
            key={a.to}
            to={a.to}
            className="tbh-card p-5 block hover:border-[var(--tbh-neon)] transition"
          >
            <h3 className="tbh-display text-xl md:text-2xl">{a.titolo}</h3>
            <p className="text-sm text-[var(--tbh-muted)] mt-2">{a.testo}</p>
            <span className="text-sm text-[var(--tbh-neon)] inline-flex items-center gap-1 mt-3">
              Vai <ArrowRight size={14} />
            </span>
          </Link>
        ))}
      </div>

      <section className="mt-12 tbh-card p-6 md:p-8 text-center">
        <h2 className="tbh-display text-2xl md:text-4xl">
          Vuoi vedere il tuo brand in una posizione precisa?
        </h2>
        <a
          href={wa("Vorrei personalizzare il mio brand sui contenuti e sugli spazi TBH.")}
          target="_blank"
          rel="noreferrer"
          className="tbh-neon-btn px-6 py-3.5 text-base inline-flex items-center gap-2 mt-5"
        >
          <MessageCircle size={18} /> Richiedi una simulazione
        </a>
        <p className="text-xs text-[var(--tbh-muted)] mt-3">WhatsApp +39 379 208 8524</p>
      </section>
    </div>
  );
}
