import { useEffect, useRef } from "react";
import { sessioneCanale } from "./use-canale-adesso";

/**
 * Contatori dei caroselli: beacon leggero verso /api/caroselli/evento.
 * · vista = scheda visibile almeno al 50% per 1 secondo (una volta per pagina);
 * · clic  = pressione del pulsante (sendBeacon parte anche se il link porta fuori).
 * Il server tiene una riga per sessione e giorno: i numeri non si gonfiano.
 */
export function inviaEventoCarosello(carosello: string, scheda: string, tipo: "vista" | "clic") {
  if (typeof navigator === "undefined") return;
  const corpo = JSON.stringify({ carosello, scheda, tipo, sessione: sessioneCanale() });
  try {
    if (navigator.sendBeacon && navigator.sendBeacon("/api/caroselli/evento", new Blob([corpo], { type: "application/json" }))) return;
  } catch {
    /* si prova con fetch */
  }
  void fetch("/api/caroselli/evento", { method: "POST", body: corpo, headers: { "content-type": "application/json" }, keepalive: true }).catch(
    () => undefined,
  );
}

export function useVistaCarosello<T extends HTMLElement>(carosello: string, scheda: string) {
  const ref = useRef<T | null>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    let timer: ReturnType<typeof setTimeout> | null = null;
    let fatto = false;
    const o = new IntersectionObserver(
      (voci) => {
        const dentro = voci.some((v) => v.isIntersecting && v.intersectionRatio >= 0.5);
        if (dentro && !fatto && !timer) {
          timer = setTimeout(() => {
            fatto = true;
            inviaEventoCarosello(carosello, scheda, "vista");
            o.disconnect();
          }, 1000);
        } else if (!dentro && timer) {
          clearTimeout(timer);
          timer = null;
        }
      },
      { threshold: [0, 0.5, 1] },
    );
    o.observe(el);
    return () => {
      if (timer) clearTimeout(timer);
      o.disconnect();
    };
  }, [carosello, scheda]);
  return ref;
}
