import { createApp } from "./__core/app";
import { ping } from "./routes/ping";
import { catalog } from "./routes/catalog";
import { checkout } from "./routes/checkout";
import { rete } from "./routes/rete";
import { tbh } from "./routes/tbh";
import { registro } from "./routes/registro";
import { home } from "./routes/home";
import { ricerca } from "./routes/ricerca";
import { pagamenti } from "./routes/pagamenti";
import { visibilita } from "./routes/visibilita";
import { ecosistema } from "./routes/ecosistema";
import { editoria } from "./routes/editoria";
import { edicola, edicolaAdmin } from "./routes/edicola";
import { missCool, missCoolAdmin } from "./routes/miss-cool";
import { pratiche } from "./routes/pratiche";
import { portale } from "./routes/portale";
import { musica } from "./routes/musica";
import { casting } from "./routes/casting";
import { catalogoMusicale } from "./routes/catalogo-musicale";
import { usciteMusicali, usciteMusicaliAdmin } from "./routes/uscite-musicali";
import { travels } from "./routes/travels";
import { medialibrary } from "./routes/medialibrary";
import { statistiche } from "./routes/statistiche";
import { anagrafica } from "./routes/anagrafica";
import { media } from "./routes/media";
import { capitan } from "./routes/capitan";
import { hub } from "./routes/hub";
import { schede } from "./routes/schede";
import { adv } from "./routes/adv";
import { advAdmin } from "./routes/adv-admin";
import { campagne, campagneAdmin, registraEventoMonitor } from "./routes/campagne";
import { prodotti, prodottiAdmin } from "./routes/prodotti";
import { marchi, marchiAdmin } from "./routes/marchi";
import { scansioneAdmin } from "./routes/scansione";
import { webhookStripe } from "./lib/adv-webhook";
import { stripeSync } from "./routes/stripe-sync";
import { candidatureLavoro } from "./routes/candidature-lavoro";
import { radio } from "./routes/radio";
import { canaliTouch, canaliTouchAdmin } from "./routes/canali-touch";
import { telecomando } from "./routes/telecomando";
import { calendari } from "./routes/calendari";
import { channel, channelAdmin } from "./routes/channel";
import { channelRegistro, channelRegistroAdmin } from "./routes/channel-registro";
import { canaliTematici, canaliTematiciAdmin } from "./routes/canali-tematici";
import { touchSocial, touchSocialAdmin } from "./routes/touch-social";
import { touchTalent, touchTalentAdmin } from "./routes/touch-talent";
import { touchCinema } from "./routes/touch-cinema";
import { struttura } from "./routes/struttura";
import { monitor, monitorAdmin } from "./routes/monitor";
import { caroselli, caroselliAdmin } from "./routes/caroselli";
import { pubblicazioneAdmin } from "./routes/pubblicazione";
import { contenuti, contenutiAdmin } from "./routes/contenuti-palinsesto";
import { registraEventoCarosello } from "./lib/caroselli-eventi";
import { webhookCatalogo } from "./lib/stripe-sync";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { s3, BUCKET } from "./lib/s3";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { formatoLogo, NOMI_FORMATI } from "./data/formati-logo";
import { varianteLogo } from "./lib/varianti-logo";
import { paginaAnteprima } from "./lib/anteprima-link";

export const router = {
  ping,
  catalog,
  checkout,
  rete,
  tbh,
  registro,
  home,
  ricerca,
  pagamenti,
  visibilita,
  ecosistema,
  editoria,
  edicola,
  edicolaAdmin,
  missCool,
  missCoolAdmin,
  pratiche,
  portale,
  musica,
  casting,
  catalogoMusicale,
  usciteMusicali,
  usciteMusicaliAdmin,
  travels,
  medialibrary,
  statistiche,
  anagrafica,
  media,
  capitan,
  hub,
  schede,
  adv,
  advAdmin,
  campagne,
  campagneAdmin,
  prodotti,
  prodottiAdmin,
  marchi,
  marchiAdmin,
  scansioneAdmin,
  stripeSync,
  candidatureLavoro,
  radio,
  canaliTouch,
  canaliTouchAdmin,
  telecomando,
  calendari,
  channel,
  channelAdmin,
  channelRegistro,
  channelRegistroAdmin,
  canaliTematici,
  canaliTematiciAdmin,
  touchSocial,
  touchSocialAdmin,
  touchTalent,
  touchTalentAdmin,
  touchCinema,
  struttura,
  monitor,
  monitorAdmin,
  caroselli,
  caroselliAdmin,
  pubblicazioneAdmin,
  contenuti,
  contenutiAdmin,
};

export type AppRouter = typeof router;
export type AppRouterClient = import("@orpc/server").RouterClient<AppRouter>;

const app = createApp(router);

/**
 * WEBHOOK STRIPE — conferma d'incasso delle pratiche TV & STREAMING ADV.
 * È una route HTTP semplice perché serve il corpo grezzo per verificare la firma.
 */
app.post("/api/webhooks/stripe", async (c) => {
  const corpo = await c.req.text();
  const esito = await webhookStripe(corpo, c.req.header("stripe-signature") ?? null);
  return c.json(esito.corpo, esito.stato);
});

/**
 * WEBHOOK STRIPE → TOUCH PLAZA (03/10/2026) — un indirizzo per ogni account collegato,
 * ognuno col suo segreto `whsec_…`. Eventi: product.*, price.*, payment_link.*.
 * Per l'account «principale» vanno bene anche sull'indirizzo /api/webhooks/stripe.
 */
app.post("/api/webhooks/stripe-catalogo/:account", async (c) => {
  const corpo = await c.req.text();
  const esito = await webhookCatalogo(
    c.req.param("account"),
    corpo,
    c.req.header("stripe-signature") ?? null,
  );
  return c.json(esito.corpo, esito.stato);
});

/**
 * EVENTI DEI MONITOR — endpoint per `navigator.sendBeacon`: un click che porta
 * fuori dalla pagina viene registrato comunque, senza numeri stimati.
 */
app.post("/api/monitor/evento", async (c) => {
  const esito = await registraEventoMonitor(await c.req.text());
  return c.json(esito.corpo, esito.stato);
});

/**
 * EVENTI DEI CAROSELLI DI CANALE 0 — beacon vista/clic per scheda (sendBeacon).
 */
app.post("/api/caroselli/evento", async (c) => {
  const esito = await registraEventoCarosello(await c.req.text(), c.req.header("user-agent") ?? null);
  return c.json(esito.corpo, esito.stato);
});

/**
 * FILE CARICATI — servizio del sito, indirizzo stabile: /api/media/<chiave>.
 *
 * Serve perché l'archivio non è aperto in lettura pubblica (indirizzo diretto:
 * 403) e gli indirizzi firmati scadono. Così un logo o una foto caricati dal
 * pannello si vedono sempre, senza chiavi nell'indirizzo.
 */
app.get("/api/media/*", async (c) => {
  const chiave = decodeURIComponent(new URL(c.req.url).pathname.replace(/^\/api\/media\//, ""));
  if (!chiave || chiave.includes("..")) return c.text("Indirizzo del file non valido.", 400);
  try {
    /* 28/10/2026 — video caricati dal pannello contenuti: richieste parziali (Range) per avanzare e riprendere nel player. */
    const range = c.req.header("range");
    const parziale = range && /^bytes=\d*-\d*$/.test(range) ? range : undefined;
    const out = await s3.send(new GetObjectCommand({ Bucket: BUCKET, Key: chiave, Range: parziale }));
    if (!out.Body) return c.text("File non trovato.", 404);
    if (parziale && out.ContentRange)
      return new Response(out.Body.transformToWebStream(), {
        status: 206,
        headers: {
          "Content-Type": out.ContentType ?? "application/octet-stream",
          "Content-Range": out.ContentRange,
          "Accept-Ranges": "bytes",
          ...(out.ContentLength ? { "Content-Length": String(out.ContentLength) } : {}),
          "Cache-Control": "public, max-age=31536000, immutable",
        },
      });
    return new Response(out.Body.transformToWebStream(), {
      headers: {
        "Accept-Ranges": "bytes",
        "Content-Type": out.ContentType ?? "application/octet-stream",
        ...(out.ContentLength ? { "Content-Length": String(out.ContentLength) } : {}),
        // I nomi dei file portano l'orario del caricamento: mai due volte lo stesso.
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return c.text("File non trovato.", 404);
  }
});

/* ────────────────────────────────────────────────────────────────────────────
   VARIANTI AUTOMATICHE DEL LOGO — /api/logo/<formato>/<sorgente>

   «UN LOGO ORIGINALE, PIÙ ADATTAMENTI AUTOMATICI» (punto 3 del 17/09/2026).

   <formato>  uno dei nomi dichiarati in api/data/formati-logo.ts. Uno sconosciuto
              risponde 400 con l'elenco: nessuna misura si inventa nella pagina.
   <sorgente> la chiave di un file caricato nell'archivio (allestimento/…) oppure
              il percorso di un file già nel sito (brand/…, companies/…).

   Il marchio entra intero, centrato, su fondo trasparente, con l'area di rispetto
   del 10%: mai ritagliato, mai stirato. L'originale non viene toccato.
   ──────────────────────────────────────────────────────────────────────────── */
app.get("/api/logo/:formato/*", async (c) => {
  const nome = c.req.param("formato");
  const f = formatoLogo(nome);
  if (!f) {
    return c.json(
      { errore: `Formato «${nome}» non previsto.`, formatiAmmessi: NOMI_FORMATI },
      400,
    );
  }

  const pezzi = new URL(c.req.url).pathname.split("/").slice(4).map(decodeURIComponent);
  const sorgente = pezzi.join("/");
  if (!sorgente || sorgente.includes("..")) return c.text("Indirizzo del file non valido.", 400);

  /* Il master si legge dove sta: archivio del portale oppure cartella pubblica del sito. */
  let master: Uint8Array | null = null;
  try {
    const out = await s3.send(new GetObjectCommand({ Bucket: BUCKET, Key: sorgente }));
    if (out.Body) master = new Uint8Array(await out.Body.transformToByteArray());
  } catch {
    /* non è un file dell'archivio: si prova fra i file del sito */
  }

  if (!master) {
    try {
      const locale = resolve(process.cwd(), "public", sorgente.replace(/^\/+/, ""));
      if (!locale.startsWith(resolve(process.cwd(), "public"))) {
        return c.text("Indirizzo del file non valido.", 400);
      }
      master = new Uint8Array(await readFile(locale));
    } catch {
      /* DIAGNOSI 17/10/2026: sul server pubblico la cartella `public/` NON sta sul
         disco del server API (i file statici li serve la piattaforma a parte), quindi
         ogni logo del sito rispondeva 404 — 73 caricamenti rotti su 4 pagine.
         Il file originale però è online al suo indirizzo: si manda lì il browser.
         Nessuna copia, nessun segnaposto: è il marchio vero, alla sua misura. */
      const originale = `/${sorgente.replace(/^\/+/, "").split("/").map(encodeURIComponent).join("/")}`;
      return new Response(null, {
        status: 302,
        headers: {
          Location: originale,
          "Cache-Control": "public, max-age=3600",
          "X-TBH-Cache": "originale-statico",
        },
      });
    }
  }

  const esito = await varianteLogo(sorgente, master, f);
  if (!esito.ok) {
    /* La variante non si è potuta generare (es. un SVG, che non si rasterizza qui):
       si serve l'ORIGINALE così com'è. Meglio il marchio vero alla sua misura
       naturale — `object-contain` nel LogoBox lo tiene comunque intero — che un
       riquadro rotto. L'originale non viene toccato in nessun caso. */
    const ext = sorgente.split(".").pop()?.toLowerCase() ?? "";
    const tipi: Record<string, string> = {
      svg: "image/svg+xml",
      png: "image/png",
      jpg: "image/jpeg",
      jpeg: "image/jpeg",
      webp: "image/webp",
      gif: "image/gif",
      pdf: "application/pdf",
    };
    return new Response(master as unknown as BodyInit, {
      headers: {
        "Content-Type": tipi[ext] ?? "application/octet-stream",
        "Content-Length": String(master.length),
        "Cache-Control": "public, max-age=86400",
        "X-TBH-Formato": `${f.formato} ${f.larghezza}x${f.altezza}`,
        "X-TBH-Cache": "originale",
        "X-TBH-Avviso": esito.motivo.replace(/[^\x20-\x7E]/g, ""),
      },
    });
  }

  return new Response(esito.corpo as unknown as BodyInit, {
    headers: {
      "Content-Type": esito.tipo,
      "Content-Length": String(esito.corpo.length),
      "Cache-Control": "public, max-age=31536000, immutable",
      "X-TBH-Formato": `${f.formato} ${f.larghezza}x${f.altezza}`,
      "X-TBH-Cache": esito.daCache ? "riletta" : "generata",
    },
  });
});

/**
 * ANTEPRIME DEI LINK CONDIVISI (28/10/2026) — /api/condividi/<percorso>: titolo, immagine e
 * descrizione per WhatsApp, Facebook, Telegram, LinkedIn; poi apre la pagina vera.
 */
app.get("/api/condividi/*", (c) => {
  const u = new URL(c.req.url);
  const percorso = decodeURIComponent(u.pathname.replace(/^\/api\/condividi/, "")) || "/";
  return c.html(paginaAnteprima(percorso, `https://www.tbh-web.com${u.pathname}`), 200, {
    "Cache-Control": "public, max-age=600",
  });
});

export default app;