import { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
import { Download, QrCode } from "lucide-react";

/**
 * QR code generato dal vivo sul dominio in cui il sito sta girando.
 * In anteprima punta all'anteprima, una volta pubblicato punta da solo al dominio
 * definitivo: è la sincronizzazione chiesta da Claudio fra biglietto stampato e sito.
 */
export function QrSito({
  percorso = "/ceo",
  etichetta = "Inquadra e apri la pagina",
  nomeFile = "qr-claudio-ugolini",
}: {
  percorso?: string;
  etichetta?: string;
  nomeFile?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [url, setUrl] = useState<string>("");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const destinazione = `${window.location.origin}${percorso}`;
    setUrl(destinazione);
    const canvas = canvasRef.current;
    if (!canvas) return;
    QRCode.toCanvas(canvas, destinazione, {
      width: 320,
      margin: 1,
      color: { dark: "#000000", light: "#ffffff" },
      errorCorrectionLevel: "M",
    }).catch(() => {
      /* se fallisce resta il testo del link qui sotto */
    });
  }, [percorso]);

  function scarica() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const a = document.createElement("a");
    a.href = canvas.toDataURL("image/png");
    a.download = `${nomeFile}.png`;
    a.click();
  }

  return (
    <div className="tbh-card p-6 flex flex-col items-center text-center" data-qr-sito>
      <QrCode size={20} className="text-[var(--tbh-neon)] mb-3" />
      <div className="bg-white rounded-xl p-3">
        <canvas ref={canvasRef} className="block w-[200px] h-[200px]" aria-label="QR code del sito" />
      </div>
      <p className="tbh-body text-sm text-[var(--tbh-muted)] mt-4">{etichetta}</p>
      {url && <p className="text-xs text-[var(--tbh-gold)] break-all mt-1">{url}</p>}
      <button type="button" onClick={scarica} className="tbh-neon-btn mt-4 inline-flex items-center gap-2 text-xs">
        <Download size={14} /> SCARICA IL QR (PNG)
      </button>
    </div>
  );
}
