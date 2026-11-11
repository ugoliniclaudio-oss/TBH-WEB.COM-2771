import { useEffect } from "react";
import Index from "./index";
import CheckWebHomeOrdinePage from "./check-web-home-ordine";
import ChannelSezioniPage from "./channel-sezioni";
import { useHomeAttiva } from "../queries/channel";

/**
 * `/` — INTERRUTTORE DELLA HOME (fase 2 «Canale 0», 18/10/2026).
 *
 * Mostra la home precedente (pages/index.tsx, INVARIATA) finché nel pannello
 * /allestimento/channel l'interruttore del proprio ambito non è su «canale0».
 * Ripristino immediato: si rimette su «classica», senza nuova pubblicazione.
 * Se il server non risponde si mostra sempre la home precedente.
 * L'ultima scelta resta nel browser per evitare il cambio di pagina al caricamento.
 */

const MEMORIA = "tbh-home-attiva";

function ricordata(): "classica" | "canale0" | "tbh3" {
  try {
    const v = window.localStorage.getItem(MEMORIA);
    return v === "canale0" || v === "tbh3" ? v : "classica";
  } catch {
    return "classica";
  }
}

export default function HomeSelettore() {
  const q = useHomeAttiva();
  const attiva = q.data?.attiva ?? (q.isError ? "classica" : ricordata());

  useEffect(() => {
    if (!q.data) return;
    try {
      window.localStorage.setItem(MEMORIA, q.data.attiva);
    } catch {
      /* memoria del browser non disponibile */
    }
  }, [q.data]);

  /* 28/10/2026 — «tbh3» = HOME TBH a 5 sezioni (/channel). Le altre due restano riattivabili. */
  if (attiva === "tbh3") return <ChannelSezioniPage inHome />;
  return attiva === "canale0" ? <CheckWebHomeOrdinePage inHome /> : <Index />;
}
