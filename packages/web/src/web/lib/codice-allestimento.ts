import { useEffect, useState } from "react";

/**
 * CODICE DI ALLESTIMENTO — chiave d'accesso alle funzioni amministrative.
 *
 * Il portale non ha ancora l'area riservata con login personale: il codice
 * (TBH_CODICE_ALLESTIMENTO, tenuto sul server) è l'unica barriera fra chi allestisce il sito e
 * chi lo guarda. Senza codice il pannello non compare e il server rifiuta ogni caricamento,
 * modifica o eliminazione.
 *
 * Lo stato è condiviso da tutti i componenti della pagina: appena il codice viene sbloccato,
 * i comandi di amministrazione compaiono in ogni riquadro — e nelle altre schede aperte,
 * grazie all'evento `storage`.
 *
 * Limite noto, da superare quando servirà: il codice è unico per tutti gli amministratori,
 * quindi non distingue le persone e non gestisce permessi diversi.
 */

export const CHIAVE_CODICE = "tbh-codice-allestimento";

let codiceCorrente = "";
let codiceLetto = false;
const ascoltatori = new Set<(v: string) => void>();

function leggiCodice() {
  if (codiceLetto) return codiceCorrente;
  codiceLetto = true;
  try {
    codiceCorrente = localStorage.getItem(CHIAVE_CODICE) ?? "";
  } catch {
    codiceCorrente = "";
  }
  return codiceCorrente;
}

function impostaCodice(v: string) {
  codiceLetto = true;
  codiceCorrente = v;
  for (const fn of ascoltatori) fn(v);
}

if (typeof window !== "undefined") {
  window.addEventListener("storage", (e) => {
    if (e.key === CHIAVE_CODICE) impostaCodice(e.newValue ?? "");
  });
}

/** Il codice salvato su questo dispositivo, con la funzione per cambiarlo o cancellarlo. */
export function useCodiceAllestimento() {
  const [codice, setCodice] = useState(() => leggiCodice());
  useEffect(() => {
    setCodice(leggiCodice());
    ascoltatori.add(setCodice);
    return () => {
      ascoltatori.delete(setCodice);
    };
  }, []);
  const salva = (v: string) => {
    try {
      if (v) localStorage.setItem(CHIAVE_CODICE, v);
      else localStorage.removeItem(CHIAVE_CODICE);
    } catch {
      /* niente da fare */
    }
    impostaCodice(v);
  };
  return { codice, salva };
}

/** Lettura secca fuori da React (per le chiamate una tantum). */
export function codiceAllestimento() {
  return leggiCodice();
}
