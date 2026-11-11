import { useEffect } from "react";

/**
 * ANTEPRIMA DELLA PAGINA (28/10/2026) — titolo, descrizione e immagine della pagina aperta.
 *
 * Aggiorna nel browser <title>, description, og:* e twitter:* (utile a chi salva o condivide dal
 * browser e ai motori che eseguono JavaScript). I servizi di messaggistica (WhatsApp, Facebook,
 * Telegram, LinkedIn) NON eseguono JavaScript: per loro c'è l'indirizzo di condivisione
 * /api/condividi/<percorso> (api/lib/anteprima-link.ts), che risponde con i meta già scritti.
 */

export type Anteprima = { titolo: string; descrizione: string; immagine?: string | null };

const SITO = "https://www.tbh-web.com";

const assoluto = (u: string) => (/^https?:\/\//.test(u) ? u : `${SITO}${u.startsWith("/") ? "" : "/"}${u}`);

function meta(attr: "name" | "property", chiave: string, valore: string): () => void {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${chiave}"]`);
  const creato = !el;
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, chiave);
    document.head.appendChild(el);
  }
  const prima = el.getAttribute("content");
  el.setAttribute("content", valore);
  const nodo = el;
  return () => {
    if (creato) nodo.remove();
    else if (prima !== null) nodo.setAttribute("content", prima);
  };
}

export function useAnteprimaPagina(a: Anteprima | null) {
  const titolo = a?.titolo ?? null;
  const descrizione = a?.descrizione ?? null;
  const immagine = a?.immagine ?? null;
  useEffect(() => {
    if (!titolo || !descrizione || typeof document === "undefined") return;
    const titoloPrima = document.title;
    document.title = titolo;
    const url = `${SITO}${window.location.pathname}`;
    const ripristina = [
      meta("name", "description", descrizione),
      meta("property", "og:title", titolo),
      meta("property", "og:description", descrizione),
      meta("property", "og:url", url),
      meta("name", "twitter:title", titolo),
      meta("name", "twitter:description", descrizione),
      ...(immagine ? [meta("property", "og:image", assoluto(immagine)), meta("name", "twitter:image", assoluto(immagine))] : []),
    ];
    return () => {
      document.title = titoloPrima;
      for (const r of ripristina) r();
    };
  }, [titolo, descrizione, immagine]);
}

/** Indirizzo da condividere: i servizi di messaggistica leggono titolo, immagine e descrizione. */
export function linkCondivisione(percorso: string) {
  return `${SITO}/api/condividi${percorso.startsWith("/") ? "" : "/"}${percorso}`;
}
