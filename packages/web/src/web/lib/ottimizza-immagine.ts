/**
 * OTTIMIZZAZIONE IMMAGINI PRIMA DEL CARICAMENTO
 *
 * Ordine di Claudio del 28/09/2026: «Prevedere ridimensionamento e ottimizzazione automatica
 * delle immagini, mantenendo la versione originale disponibile quando serve. I loghi ufficiali
 * non devono mai essere modificati o ridisegnati automaticamente.»
 *
 * Come funziona:
 * · una FOTO grande (copertina, gallery, scatto di partita) viene rimpicciolita al lato massimo
 *   utile per il web e riscritta in WEBP: la pagina si apre in fretta;
 * · l'ORIGINALE viene caricato comunque, a fianco, e resta disponibile per la stampa o per
 *   scaricarlo (campo `chiaveOriginale` nel database);
 * · i LOGHI, i documenti, gli SVG, le GIF e i file già leggeri NON vengono toccati: il file
 *   che arriva sul sito è esattamente quello ufficiale, pixel per pixel.
 *
 * Tutto avviene nel browser (canvas): nessun servizio esterno, nessun ricampionamento nascosto
 * lato server.
 */

/** Lato massimo di una foto pubblicata: oltre non serve, sotto si vedrebbe sfocata. */
const LATO_MASSIMO = 2000;
/** Sotto questo peso non vale la pena riscrivere il file. */
const PESO_MINIMO = 400 * 1024;

export type ImmaginePronta = {
  /** Il file da pubblicare (ottimizzato oppure l'originale tale e quale). */
  file: File;
  larghezza: number;
  altezza: number;
  /** L'originale da conservare a fianco, solo se il file pubblicato è una versione ridotta. */
  originale: File | null;
};

/** Formati che non si toccano mai: loghi vettoriali, animazioni, documenti. */
function intoccabile(file: File, tipo: string) {
  if (tipo === "logo" || tipo === "documento") return true;
  const t = (file.type || "").toLowerCase();
  const n = file.name.toLowerCase();
  if (t.includes("svg") || n.endsWith(".svg")) return true;
  if (t.includes("gif") || n.endsWith(".gif")) return true;
  if (!t.startsWith("image/")) return true;
  return false;
}

function misura(file: File): Promise<{ larghezza: number; altezza: number } | null> {
  return new Promise((risolvi) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const m = { larghezza: img.naturalWidth, altezza: img.naturalHeight };
      URL.revokeObjectURL(url);
      risolvi(m);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      risolvi(null);
    };
    img.src = url;
  });
}

function disegna(
  file: File,
  larghezza: number,
  altezza: number,
): Promise<{ blob: Blob; larghezza: number; altezza: number } | null> {
  return new Promise((risolvi) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const tela = document.createElement("canvas");
      tela.width = larghezza;
      tela.height = altezza;
      const ctx = tela.getContext("2d");
      if (!ctx) {
        URL.revokeObjectURL(url);
        risolvi(null);
        return;
      }
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(img, 0, 0, larghezza, altezza);
      tela.toBlob(
        (blob) => {
          URL.revokeObjectURL(url);
          risolvi(blob ? { blob, larghezza, altezza } : null);
        },
        "image/webp",
        0.86,
      );
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      risolvi(null);
    };
    img.src = url;
  });
}

/**
 * Prepara un file per il caricamento.
 * Se qualcosa non va (formato esotico, canvas non disponibile) si carica l'originale:
 * meglio una foto pesante che una foto mancante.
 */
export async function preparaImmagine(file: File, tipo: string): Promise<ImmaginePronta> {
  const misure = intoccabile(file, tipo) ? null : await misura(file);
  if (!misure) {
    const m = (await misura(file)) ?? { larghezza: 0, altezza: 0 };
    return { file, larghezza: m.larghezza, altezza: m.altezza, originale: null };
  }

  const lato = Math.max(misure.larghezza, misure.altezza);
  const scala = lato > LATO_MASSIMO ? LATO_MASSIMO / lato : 1;
  const grande = scala < 1;
  const pesante = file.size > PESO_MINIMO;
  if (!grande && !pesante) {
    return { file, larghezza: misure.larghezza, altezza: misure.altezza, originale: null };
  }

  const esito = await disegna(
    file,
    Math.round(misure.larghezza * scala),
    Math.round(misure.altezza * scala),
  );
  if (!esito || esito.blob.size >= file.size) {
    // L'ottimizzazione non ha guadagnato niente: si tiene l'originale.
    return { file, larghezza: misure.larghezza, altezza: misure.altezza, originale: null };
  }

  const nome = file.name.replace(/\.[a-z0-9]+$/i, "") || "immagine";
  const ottimizzata = new File([esito.blob], `${nome}.webp`, { type: "image/webp" });
  return {
    file: ottimizzata,
    larghezza: esito.larghezza,
    altezza: esito.altezza,
    // L'originale si conserva solo quando la foto è stata davvero rimpicciolita.
    originale: grande ? file : null,
  };
}

/** Peso leggibile, per scrivere «2,4 MB» sotto l'anteprima. */
export function pesoLeggibile(byte: number | null | undefined) {
  const b = byte ?? 0;
  if (b <= 0) return "";
  if (b < 1024) return `${b} B`;
  if (b < 1024 * 1024) return `${Math.round(b / 1024)} KB`;
  return `${(b / (1024 * 1024)).toFixed(1).replace(".", ",")} MB`;
}
