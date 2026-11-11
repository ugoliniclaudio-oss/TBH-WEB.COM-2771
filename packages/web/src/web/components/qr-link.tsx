import { useEffect, useRef } from "react";
import QRCode from "qrcode";

/**
 * QR generato DAL VIVO da un link ufficiale già in archivio (es. Payment Link Stripe).
 * 28/10/2026 — serve quando il QR stampato su una locandina non è leggibile a schermo:
 * la locandina resta intatta, questo QR punta allo STESSO indirizzo.
 */
export function QrLink({ url, etichetta, lato = 132 }: { url: string; etichetta: string; lato?: number }) {
  const ref = useRef<HTMLCanvasElement | null>(null);
  useEffect(() => {
    if (!ref.current) return;
    QRCode.toCanvas(ref.current, url, { width: lato * 2, margin: 1, color: { dark: "#000000", light: "#ffffff" }, errorCorrectionLevel: "M" }).catch(() => {
      /* se fallisce resta il pulsante */
    });
  }, [url, lato]);
  return (
    <span className="block shrink-0 rounded-2xl bg-white p-2" data-qr-link={url}>
      <canvas ref={ref} aria-label={etichetta} className="block" style={{ width: lato - 16, height: lato - 16 }} />
    </span>
  );
}
