import { useEffect, useRef } from "react";
import { useLocation } from "wouter";

/**
 * Al cambio di pagina riporta la finestra in alto (18/10/2026, Canale 0): senza, chi apre
 * un Channel dal fondo della home atterrava a metà della pagina di destinazione.
 * Non interviene sui link con ancora (#…) né sul primo caricamento; le pagine che scorrono
 * da sole a una sezione (es. /tbh/produzioni?ambito=cinema) lo fanno dopo questo effetto.
 */
export function RitornoInAlto() {
  const [percorso] = useLocation();
  const primo = useRef(true);
  useEffect(() => {
    if (primo.current) {
      primo.current = false;
      return;
    }
    if (window.location.hash) return;
    window.scrollTo(0, 0);
  }, [percorso]);
  return null;
}
