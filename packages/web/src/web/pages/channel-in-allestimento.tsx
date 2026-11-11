import { Link } from "wouter";
import { CHANNEL_HOME, titoloChannel } from "../../api/data/channel-home";

/**
 * Pagina di un Channel senza ancora contenuti pubblicati (decisioni di Claudio, fase 2
 * del 18/10/2026): SOLO il titolo testuale e IN ALLESTIMENTO.
 * Nessun logo, stemma, immagine, icona, video o testo inventato.
 * Usata da: Touch Arm Wrestling (/arm-wrestling), Touch Travels (/touch-travels),
 * Junior Gambettola Calcio (/sport/squadre/junior-gambettola).
 */

const GIALLO = "#d7ff00";

export default function ChannelInAllestimentoPage({ slug }: { slug: string }) {
  const c = CHANNEL_HOME.find((x) => x.slug === slug);
  const titolo = c ? titoloChannel(c) : "Channel";
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-[1100px] flex-col items-center justify-center px-4 py-16 text-center md:px-8" data-testid={`channel-pagina-${slug}`}>
      <p className="text-[11px] font-extrabold uppercase tracking-[0.3em] text-white/50">TBH · Canale 0</p>
      <h1 className="tbh-display tbh-h1 mt-3 text-balance text-white">{titolo}</h1>
      <span
        className="mt-8 rounded-full border px-6 py-2.5 text-xs font-extrabold tracking-[0.2em]"
        style={{ borderColor: GIALLO, color: GIALLO }}
        data-testid="in-allestimento"
      >
        IN ALLESTIMENTO
      </span>
      <Link href="/" className="mt-10 text-sm text-[var(--tbh-muted)] underline-offset-4 hover:text-white hover:underline">
        Torna alla home
      </Link>
    </div>
  );
}
