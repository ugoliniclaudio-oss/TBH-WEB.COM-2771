/* ────────────────────────────────────────────────────────────────────────────
   INDIRIZZI DEI FILE CARICATI — un indirizzo stabile, servito dal sito.

   Perché esiste questo file (verificato col browser il 16/09/2026):
   l'archivio (Tigris, S3-compatibile) NON è aperto in lettura pubblica: gli
   indirizzi diretti tipo https://<endpoint>/<bucket>/<chiave> rispondono 403.
   Gli indirizzi firmati, invece, scadono (7 giorni) e quindi un'immagine
   caricata oggi smetterebbe di vedersi fra una settimana.

   Soluzione: ogni file caricato si serve dal sito stesso, su
   /api/media/<chiave>. L'indirizzo non scade, non dipende dalle chiavi
   dell'archivio e continua a valere se domani si cambia archivio.

   Qui dentro non si inventa niente: si traduce solo l'indirizzo di un file
   che esiste davvero nell'archivio.
   ──────────────────────────────────────────────────────────────────────────── */

/** Prefisso del servizio file del sito. */
export const PREFISSO_MEDIA = "/api/media/";

/** Le chiavi scritte dal portale iniziano tutte così. */
const CARTELLE = ["allestimento/", "media/", "monitor/", "prodotto/"];

function endpointPulito() {
  return (process.env.S3_ENDPOINT ?? "").replace(/^https?:\/\//, "").replace(/\/+$/, "");
}

/** Indirizzo stabile di un file dell'archivio, servito dal sito. */
export function indirizzoMedia(chiave: string): string {
  return PREFISSO_MEDIA + chiave.split("/").map(encodeURIComponent).join("/");
}

/**
 * Riporta al servizio del sito gli indirizzi diretti dell'archivio già scritti
 * nel database nelle settimane scorse (rispondono 403) e quelli firmati (scadono).
 * Tutto il resto — indirizzi esterni davvero pubblici — resta com'è.
 */
export function mediaServito(url: string | null | undefined): string | null {
  const v = (url ?? "").trim();
  if (!v) return null;
  if (v.startsWith(PREFISSO_MEDIA)) return v;
  if (!/^https?:\/\//i.test(v)) return v;

  let u: URL;
  try {
    u = new URL(v);
  } catch {
    return v;
  }

  const endpoint = endpointPulito();
  const bucket = (process.env.S3_BUCKET ?? "").trim();
  const ospite = u.host.toLowerCase();
  const suArchivio =
    (endpoint && ospite === endpoint.toLowerCase()) ||
    ospite.endsWith(".storage.dev") ||
    ospite === "storage.dev" ||
    (bucket.length > 0 && ospite.startsWith(`${bucket.toLowerCase()}.`));
  if (!suArchivio) return v;

  // /<bucket>/<chiave> oppure, col bucket nel sottodominio, /<chiave>
  let percorso = decodeURIComponent(u.pathname.replace(/^\/+/, ""));
  if (bucket && percorso.startsWith(`${bucket}/`)) percorso = percorso.slice(bucket.length + 1);
  else if (!CARTELLE.some((c) => percorso.startsWith(c))) {
    // bucket sconosciuto nel percorso: si taglia il primo segmento se dopo c'è
    // una delle cartelle del portale, altrimenti si lascia l'indirizzo com'è.
    const tagliato = percorso.split("/").slice(1).join("/");
    if (CARTELLE.some((c) => tagliato.startsWith(c))) percorso = tagliato;
    else return v;
  }
  if (!percorso) return v;
  return indirizzoMedia(percorso);
}

/**
 * Stessa cosa su un elenco di indirizzi scritti uno per riga (galleria,
 * carosello): le righe vuote restano fuori, l'ordine non cambia.
 */
export function mediaServitoElenco(testo: string | null | undefined): string | null {
  const v = (testo ?? "").trim();
  if (!v) return null;
  const righe = v
    .split(/[\n,;]+/)
    .map((r) => r.trim())
    .filter(Boolean)
    .map((r) => mediaServito(r) ?? r);
  return righe.length > 0 ? righe.join("\n") : null;
}
