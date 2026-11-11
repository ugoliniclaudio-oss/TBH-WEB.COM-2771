/* ────────────────────────────────────────────────────────────────────────────
   VARIANTI AUTOMATICHE DEL LOGO — punto 3 dell'aggiornamento del 17/09/2026.

   Dal logo master si ricava ogni misura richiesta (icone, favicon, schede,
   banner, anteprima social) SENZA toccare l'originale.

   Come lavora, e perché così:
     · `-resize WxH` con il solo limite di ingombro → l'immagine entra intera e
       mantiene le sue proporzioni. Non si usa `^` né `!`: il primo riempirebbe
       ritagliando, il secondo stirerebbe il marchio. Nessuno dei due è ammesso.
     · `-background none -gravity center -extent WxH` → il marchio resta centrato
       su fondo trasparente dentro il contenitore della misura richiesta.
     · L'area di rispetto del 10% si ottiene ridimensionando dentro l'area utile
       e poi estendendo al contenitore pieno.
     · L'uscita è PNG a 8 bit con canale alpha: trasparenza conservata.

   L'originale resta nell'archivio così com'è: questa funzione non scrive mai
   sopra il file di partenza, produce un file derivato nella cache.
   ──────────────────────────────────────────────────────────────────────────── */

import { mkdir, readFile, writeFile, stat } from "node:fs/promises";
import { createHash } from "node:crypto";
import { spawn } from "node:child_process";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { areaUtile, type DefinizioneFormato } from "../data/formati-logo";

/** Cartella della cache delle varianti. Contiene solo file derivati, mai originali. */
const CACHE = join(tmpdir(), "tbh-varianti-logo");

/** ImageMagick 7 espone `magick`; la 6 espone `convert`. Si prova nell'ordine. */
const COMANDI = ["magick", "convert"];

let comandoDisponibile: string | null | undefined;

function esegui(cmd: string, args: string[], timeoutMs = 20000) {
  return new Promise<{ codice: number; errore: string }>((risolvi) => {
    const p = spawn(cmd, args, { stdio: ["ignore", "ignore", "pipe"] });
    let errore = "";
    p.stderr?.on("data", (d) => {
      errore += String(d);
    });
    const t = setTimeout(() => p.kill("SIGKILL"), timeoutMs);
    p.on("error", () => {
      clearTimeout(t);
      risolvi({ codice: -1, errore: "comando non disponibile" });
    });
    p.on("close", (codice) => {
      clearTimeout(t);
      risolvi({ codice: codice ?? -1, errore });
    });
  });
}

/** Trova una volta sola il comando di conversione presente sulla macchina. */
async function comando(): Promise<string | null> {
  if (comandoDisponibile !== undefined) return comandoDisponibile;
  for (const c of COMANDI) {
    const esito = await esegui(c, ["-version"], 5000);
    if (esito.codice === 0) {
      comandoDisponibile = c;
      return c;
    }
  }
  comandoDisponibile = null;
  return null;
}

/** Il motore di conversione è presente? Serve al controllo del sito. */
export async function motoreVariantiPronto() {
  return (await comando()) !== null;
}

function nomeCache(chiave: string, f: DefinizioneFormato) {
  const h = createHash("sha1").update(chiave).digest("hex").slice(0, 16);
  return join(CACHE, `${h}_${f.formato}_${f.larghezza}x${f.altezza}.png`);
}

export type EsitoVariante =
  | { ok: true; corpo: Uint8Array; tipo: string; daCache: boolean }
  | { ok: false; motivo: string };

/**
 * Genera (o rilegge dalla cache) la variante di un logo.
 *
 * @param chiave  identificativo stabile del file di partenza: serve solo a dare
 *                un nome alla variante in cache.
 * @param master  byte del file ORIGINALE. Non viene modificato.
 * @param f       formato richiesto.
 */
export async function varianteLogo(
  chiave: string,
  master: Uint8Array,
  f: DefinizioneFormato,
): Promise<EsitoVariante> {
  /* SVG: è già vettoriale, si adatta a qualunque misura senza perdere nulla, e
     il rasterizzatore di ImageMagick sbaglia le maschere di ritaglio (un marchio
     può uscire come un rettangolo pieno). Quindi NON si converte: si dichiara la
     variante non generabile e la rotta serve l'ORIGINALE, che il LogoBox tiene
     comunque intero e centrato con `object-contain`. */
  const testa = new TextDecoder().decode(master.slice(0, 400)).trimStart().toLowerCase();
  if (chiave.toLowerCase().endsWith(".svg") || testa.startsWith("<?xml") || testa.startsWith("<svg")) {
    return {
      ok: false,
      motivo:
        "Marchio vettoriale (SVG): si serve l'originale, che vale per tutte le misure senza conversione.",
    };
  }

  const cmd = await comando();
  if (!cmd) {
    return {
      ok: false,
      motivo:
        "Il motore di conversione delle immagini non è disponibile su questo server: la variante non si può generare.",
    };
  }

  const destinazione = nomeCache(chiave, f);

  // Già generata in precedenza: si rilegge, non si rifà il lavoro.
  try {
    const s = await stat(destinazione);
    if (s.size > 0) {
      return { ok: true, corpo: await readFile(destinazione), tipo: "image/png", daCache: true };
    }
  } catch {
    /* non in cache: si genera adesso */
  }

  await mkdir(CACHE, { recursive: true });

  // L'originale si copia in un file temporaneo: ImageMagick legge da disco e
  // così il file dell'archivio non viene mai aperto in scrittura.
  const sorgente = join(CACHE, `src_${createHash("sha1").update(chiave).digest("hex").slice(0, 16)}`);
  await writeFile(sorgente, master);

  const area = areaUtile(f);
  const misuraContenitore = `${f.larghezza}x${f.altezza}`;
  const misuraArea = `${area.larghezza}x${area.altezza}`;

  const esito = await esegui(cmd, [
    sorgente + "[0]", // [0] = prima pagina/primo fotogramma (PDF e GIF multipagina)
    "-background",
    "none",
    "-alpha",
    "on",
    // Limite di ingombro senza `!` e senza `^`: proporzioni intatte, nessun ritaglio.
    "-resize",
    misuraArea,
    "-gravity",
    "center",
    // Contenitore pieno con l'area di rispetto intorno al marchio.
    "-extent",
    misuraContenitore,
    "-strip",
    "PNG32:" + destinazione,
  ]);

  if (esito.codice !== 0) {
    return {
      ok: false,
      motivo:
        "Questo file non si riesce a convertire: potrebbe non essere un'immagine valida. " +
        (esito.errore.split("\n")[0] ?? ""),
    };
  }

  try {
    const corpo = await readFile(destinazione);
    if (corpo.length === 0) return { ok: false, motivo: "La variante generata è vuota." };
    return { ok: true, corpo, tipo: "image/png", daCache: false };
  } catch {
    return { ok: false, motivo: "La variante non è stata scritta correttamente." };
  }
}

/** Misure reali di un'immagine: servono agli avvisi sul file caricato (punto 2). */
export async function misureImmagine(byte: Uint8Array): Promise<{ larghezza: number; altezza: number } | null> {
  const cmd = await comando();
  if (!cmd) return null;
  await mkdir(CACHE, { recursive: true });
  const f = join(CACHE, `mis_${createHash("sha1").update(byte).digest("hex").slice(0, 16)}`);
  await writeFile(f, byte);
  return new Promise((risolvi) => {
    const p = spawn(cmd === "magick" ? "magick" : "identify", cmd === "magick" ? ["identify", "-format", "%w %h", f + "[0]"] : ["-format", "%w %h", f + "[0]"], {
      stdio: ["ignore", "pipe", "ignore"],
    });
    let out = "";
    p.stdout?.on("data", (d) => {
      out += String(d);
    });
    p.on("error", () => risolvi(null));
    p.on("close", () => {
      const [w, h] = out.trim().split(/\s+/).map((n) => Number.parseInt(n, 10));
      risolvi(Number.isFinite(w) && Number.isFinite(h) ? { larghezza: w, altezza: h } : null);
    });
  });
}
