import { Link } from "wouter";
import { Eye } from "lucide-react";
import Index from "./index";
import { CanaliUfficialiHome, SezioneArtisticaJcHugo } from "../components/canali-ufficiali-home";

/**
 * /check-web/home-canali — ANTEPRIMA DELLA HOMEPAGE con TOUCH RADIO e TOUCH TV in primo piano.
 * La home vera (/) non cambia finché Claudio non approva: qui sopra i due canali ufficiali e la
 * sezione artistica DJ J.C. Hugò, sotto la homepage attuale così com'è.
 */
export default function CheckWebHomeCanaliPage() {
  return (
    <div>
      <div className="mx-auto max-w-[1500px] px-4 pt-4 md:px-8">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-2xl border border-[var(--tbh-gold)]/50 bg-black/70 px-4 py-3 text-[12px]">
          <span className="inline-flex items-center gap-2 font-extrabold tracking-[0.16em] text-[var(--tbh-gold)]">
            <Eye className="h-4 w-4" /> ANTEPRIMA HOMEPAGE · NON PUBBLICATA
          </span>
          <span className="min-w-0 text-[var(--tbh-muted)]">
            TOUCH TV usa il logo originale approvato il 19/10/2026 (<code>/channel/loghi/touch-tv.apng</code>). Per TOUCH RADIO negli asset non c'è nessun logo
            originale che legga «TOUCH RADIO»: lo slot resta vuoto, nessun sostituto. Candidati su{" "}
            <Link to="/check-web/loghi-canali" className="underline hover:text-[var(--tbh-neon)]">
              /check-web/loghi-canali
            </Link>
            .
          </span>
        </div>
      </div>

      <div className="mx-auto max-w-[1500px] px-4 pt-4 md:px-8">
        <Link
          to="/check-web/telecomando"
          className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[var(--tbh-neon)]/60 bg-black px-4 py-3 transition hover:bg-white/[0.04]"
          data-testid="link-telecomando"
        >
          <span className="min-w-0">
            <span className="block text-[10px] font-extrabold tracking-[0.3em] text-[var(--tbh-muted)]">TOUCH BUSINESS HOLDING</span>
            <span className="block text-lg font-black tracking-[0.06em] text-[var(--tbh-neon)]">TELECOMANDO CANALI</span>
            <span className="block text-[12px] text-[var(--tbh-platinum)]">Un unico pannello · Canali distinti · Contenuti automatici · 17 canali</span>
          </span>
          <span className="rounded-full bg-[var(--tbh-neon)] px-4 py-2 text-[11px] font-extrabold tracking-[0.14em] text-black">APRI IL TELECOMANDO</span>
        </Link>
      </div>

      <CanaliUfficialiHome />
      <SezioneArtisticaJcHugo />

      <div className="mx-auto max-w-[1500px] px-4 pt-8 md:px-8">
        <p className="border-t border-dashed border-white/15 pt-3 text-center text-[10px] font-bold uppercase tracking-[0.24em] text-[var(--tbh-muted)]">
          Da qui in giù: la homepage attuale, invariata
        </p>
      </div>
      <Index />
    </div>
  );
}
