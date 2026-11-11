import { useState } from "react";
import { Share2 } from "lucide-react";
import { linkCondivisione } from "../lib/anteprima-pagina";

/**
 * CONDIVIDI (28/10/2026) — condivide l'indirizzo /api/condividi/<percorso>: chi riceve il link su
 * WhatsApp, Facebook, Telegram o LinkedIn vede titolo, immagine e descrizione della pagina.
 */
export function PulsanteCondividi({
  percorso,
  titolo,
  compatto = false,
  testid = "condividi",
}: {
  percorso: string;
  titolo: string;
  /** 04/11/2026 (round 17) — versione piccola per le card della discografia. */
  compatto?: boolean;
  testid?: string;
}) {
  const [copiato, setCopiato] = useState(false);
  const url = linkCondivisione(percorso);
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          if (navigator.share) {
            await navigator.share({ title: titolo, url });
            return;
          }
          await navigator.clipboard.writeText(url);
          setCopiato(true);
          window.setTimeout(() => setCopiato(false), 2500);
        } catch {
          /* condivisione annullata */
        }
      }}
      className={`inline-flex items-center justify-center gap-1.5 rounded-full border border-white/30 font-extrabold tracking-[0.12em] text-white transition hover:border-white ${compatto ? "min-h-9 px-3 text-[10px]" : "min-h-11 px-5 text-[12px]"}`}
      data-testid={testid}
      data-url={url}
    >
      <Share2 size={14} aria-hidden /> {copiato ? "LINK COPIATO" : "CONDIVIDI"}
    </button>
  );
}
