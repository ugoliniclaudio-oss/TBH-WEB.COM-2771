import { useMemo } from "react";

/**
 * SKYLINE TBH — ordine di Claudio del 29/08/2026: «crea un feeling con il design siti creando
 * veri e propri paesaggi e Skyline come sfondo a tema randomizzato».
 *
 * Lo skyline è DISEGNATO IN CODICE (SVG), non è una foto: pesa pochi kB, è nitido su TV e
 * smartphone e cambia a ogni caricamento. Riprende lo skyline che sta dentro il logo ufficiale
 * Touch Business Holding: grattacieli, ponte, ruota panoramica e riflesso sull'acqua.
 *
 * Il colore lo decide il mondo in cui ti trovi (Sport blu, DM rosso, Shop arancio, ecc.):
 * nessuno sfondo pieno, solo bagliore dietro ai contenuti, così il testo resta sempre leggibile.
 */

/** Generatore pseudo-casuale con seme: stessa sezione = stesso profilo finché non ricarichi. */
function rnd(seme: number) {
  let s = seme || 1;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

type Props = {
  /** Colore del mondo (bordo/glow). Default: giallo TBH. */
  colore?: string;
  /** Altezza dello skyline in px. */
  altezza?: number;
  /** Seme fisso: se non lo passi, il paesaggio cambia a ogni caricamento. */
  seme?: number;
  /** Aggiunge ruota panoramica e ponte, come nel logo ufficiale. */
  monumenti?: boolean;
  className?: string;
};

export function Skyline({
  colore = "#d7ff00",
  altezza = 260,
  seme,
  monumenti = true,
  className = "",
}: Props) {
  const dati = useMemo(() => {
    const r = rnd(seme ?? Math.floor(Math.random() * 1_000_000) + 1);
    const W = 1440;
    const palazzi: { x: number; w: number; h: number; finestre: number[][] }[] = [];
    let x = -20;
    while (x < W + 20) {
      const w = 26 + Math.floor(r() * 62);
      const h = 40 + Math.floor(r() * 190);
      const colonne = Math.max(1, Math.floor(w / 14));
      const righe = Math.max(1, Math.floor(h / 18));
      const finestre: number[][] = [];
      for (let c = 0; c < colonne; c++) {
        for (let f = 0; f < righe; f++) if (r() > 0.62) finestre.push([c, f]);
      }
      palazzi.push({ x, w, h, finestre });
      x += w + 4 + Math.floor(r() * 10);
    }
    return {
      W,
      palazzi,
      ruotaX: 140 + r() * 240,
      ponteX: 780 + r() * 380,
      stelle: Array.from({ length: 44 }, () => [r(), r() * 0.55] as [number, number]),
    };
  }, [seme]);

  const { W, palazzi, ruotaX, ponteX, stelle } = dati;
  const H = 300;
  const base = 250;

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="none"
      aria-hidden
      focusable="false"
      className={`pointer-events-none select-none ${className}`}
      style={{ height: altezza, width: "100%", display: "block" }}
    >
      <defs>
        <linearGradient id="tbh-sky-cielo" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={colore} stopOpacity="0.12" />
          <stop offset="70%" stopColor="#000000" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="tbh-sky-torri" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={colore} stopOpacity="0.55" />
          <stop offset="100%" stopColor={colore} stopOpacity="0.06" />
        </linearGradient>
      </defs>

      <rect x="0" y="0" width={W} height={H} fill="url(#tbh-sky-cielo)" />

      {stelle.map(([sx, sy], i) => (
        <circle key={i} cx={sx * W} cy={sy * H} r={i % 7 === 0 ? 1.6 : 1} fill={colore} opacity={0.35} />
      ))}

      {monumenti && (
        <g stroke={colore} strokeOpacity="0.4" fill="none" strokeWidth="1.6">
          {/* Ruota panoramica */}
          <circle cx={ruotaX} cy={base - 74} r="52" />
          <circle cx={ruotaX} cy={base - 74} r="8" />
          {Array.from({ length: 12 }, (_, i) => {
            const a = (i / 12) * Math.PI * 2;
            return (
              <line
                key={i}
                x1={ruotaX}
                y1={base - 74}
                x2={ruotaX + Math.cos(a) * 52}
                y2={base - 74 + Math.sin(a) * 52}
              />
            );
          })}
          <line x1={ruotaX} y1={base - 22} x2={ruotaX} y2={base} />
          {/* Ponte sospeso */}
          <path d={`M ${ponteX} ${base} L ${ponteX} ${base - 96} M ${ponteX + 190} ${base} L ${ponteX + 190} ${base - 96}`} />
          <path d={`M ${ponteX - 60} ${base - 40} Q ${ponteX + 95} ${base - 126} ${ponteX + 250} ${base - 40}`} />
          <line x1={ponteX - 60} y1={base - 26} x2={ponteX + 250} y2={base - 26} />
        </g>
      )}

      <g>
        {palazzi.map((p, i) => (
          <g key={i}>
            <rect
              x={p.x}
              y={base - p.h}
              width={p.w}
              height={p.h}
              fill="url(#tbh-sky-torri)"
              stroke={colore}
              strokeOpacity="0.45"
              strokeWidth="1"
            />
            {p.finestre.map(([c, f], j) => (
              <rect
                key={j}
                x={p.x + 5 + c * 14}
                y={base - p.h + 8 + f * 18}
                width="6"
                height="8"
                fill={colore}
                opacity="0.5"
              />
            ))}
          </g>
        ))}
      </g>

      {/* Riflesso sull'acqua, come nel logo ufficiale */}
      <g transform={`translate(0 ${base * 2}) scale(1 -1)`} opacity="0.16">
        {palazzi.map((p, i) => (
          <rect key={i} x={p.x} y={base - p.h * 0.5} width={p.w} height={p.h * 0.5} fill={colore} />
        ))}
      </g>
      <line x1="0" y1={base} x2={W} y2={base} stroke={colore} strokeOpacity="0.5" strokeWidth="1.2" />
    </svg>
  );
}

/**
 * Sfondo a tutta sezione: skyline in basso + alone del colore del mondo.
 * Va messo dentro un contenitore `relative`; i contenuti stanno sopra con `relative z-10`.
 */
export function SfondoSkyline({
  colore = "#d7ff00",
  altezza = 320,
  seme,
}: {
  colore?: string;
  altezza?: number;
  seme?: number;
}) {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(120% 80% at 50% 0%, ${colore}18 0%, transparent 60%)`,
        }}
      />
      <div className="absolute bottom-0 left-0 right-0 opacity-70">
        <Skyline colore={colore} altezza={altezza} seme={seme} />
      </div>
    </div>
  );
}
