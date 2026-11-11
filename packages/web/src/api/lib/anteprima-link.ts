import { CHANNEL_HOME, CHANNEL_HOME_AGGIUNTI, titoloChannel } from "../data/channel-home";
import { logoChannel } from "../data/loghi-channel";
import { FILM_TOUCH_CINEMA, durataLeggibile, schedaFilm } from "../data/touch-cinema-film";

/**
 * ANTEPRIME DEI LINK CONDIVISI (28/10/2026) — /api/condividi/<percorso>.
 *
 * Il sito è una pagina unica (SPA): ogni indirizzo riceve lo stesso index.html, quindi WhatsApp,
 * Facebook, Telegram e LinkedIn — che non eseguono JavaScript — vedrebbero sempre l'anteprima
 * generica. Questo indirizzo risponde con titolo, descrizione e immagine della pagina già scritti
 * nei meta og:/twitter:, poi porta subito il visitatore alla pagina vera.
 * Dati: solo quelli già nel sito (film di Touch Cinema, Channel, pagine principali). Un percorso
 * non censito riceve l'anteprima generale di TBH-WEB, mai testi inventati.
 */

export const SITO = "https://www.tbh-web.com";

type Anteprima = { titolo: string; descrizione: string; immagine: string };

const GENERALE: Anteprima = {
  titolo: "TBH-WEB · Touch Business Holding",
  descrizione: "United by passion, driven by values. Touch Plaza Shop, società del gruppo, attività, servizi, media partner e squadre partner.",
  immagine: "/og-tbh-web.png",
};

const PAGINE: Record<string, Anteprima> = {
  "/": GENERALE,
  "/channel": {
    titolo: "Tutti i Channel · TBH-WEB",
    descrizione: "I Channel di Touch Business Holding: TV, radio, editoria, musica, sport, eventi, casting e Touch Cinema.",
    immagine: "/og-tbh-web.png",
  },
  "/guida": {
    titolo: "Tutti i canali · TBH-WEB",
    descrizione: "La guida dei canali TBH-WEB: scegli il canale e entra.",
    immagine: "/og-tbh-web.png",
  },
  /* 04/11/2026 (round 17) — discografia del Touch Music Records Channel e prima uscita (dati verificati). */
  "/musica/discografia": {
    titolo: "Discografia · Touch Music Records Channel · TBH-WEB",
    descrizione: "Singoli, album e prossime uscite di Touch Music Records e DJ J.C. Hugò, con i collegamenti verificati alle piattaforme.",
    immagine: "/musica/uscite/tbh-happy-birthday-anthem.jpe",
  },
  "/musica/brano/mus-rzjkxt50": {
    titolo: "TBH - Happy Birthday Anthem (feat. Touch Music Channel) · DJ J.C. Hugò · TBH-WEB",
    descrizione: "Singolo · uscito il 02/11/2026 · Electronic / Dance / House. Ascolta su Spotify, Apple Music e iTunes.",
    immagine: "/musica/uscite/tbh-happy-birthday-anthem.jpe",
  },
  "/channel/touch-cinema": {
    titolo: "Touch Cinema · Proiezioni · TBH-WEB",
    descrizione: `Contenuti disponibili: ${FILM_TOUCH_CINEMA.map((f) => `«${f.titolo}»`).join(", ")}.`,
    immagine: FILM_TOUCH_CINEMA[0]!.miniatura,
  },
};

function breve(t: string, max = 180) {
  if (t.length <= max) return t;
  return `${t.slice(0, max).replace(/\s+\S*$/, "")}…`;
}

export function anteprimaDi(percorso: string): Anteprima {
  const p = percorso.length > 1 ? percorso.replace(/\/+$/, "") : "/";
  const film = FILM_TOUCH_CINEMA.find((f) => schedaFilm(f.slug) === p);
  if (film) {
    return {
      titolo: `${film.titolo} (${film.anno}) · Touch Cinema · TBH-WEB`,
      descrizione: breve(`Regia di ${film.regia} · ${durataLeggibile(film.durataSec)}. ${film.trama}`),
      immagine: film.miniatura,
    };
  }
  if (PAGINE[p]) return PAGINE[p]!;
  const ch = [...CHANNEL_HOME, ...CHANNEL_HOME_AGGIUNTI].find((c) => c.pagina === p);
  if (ch) {
    return {
      titolo: `${titoloChannel(ch)} · TBH-WEB`,
      descrizione: `${titoloChannel(ch)} su TBH-WEB, il portale di Touch Business Holding.`,
      immagine: logoChannel(ch.slug) ?? GENERALE.immagine,
    };
  }
  return GENERALE;
}

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const assoluto = (u: string) => (/^https?:\/\//.test(u) ? u : `${SITO}/${encodeURI(u.replace(/^\/+/, ""))}`);

/** Percorso interno sicuro: solo indirizzi del sito, mai un altro dominio. */
export function percorsoSicuro(grezzo: string) {
  const p = `/${grezzo.replace(/^\/+/, "")}`.split("#")[0]!.split("?")[0]!;
  if (!/^\/[\w\-./%]*$/.test(p) || p.includes("..") || p.startsWith("//")) return "/";
  return p;
}

export function paginaAnteprima(percorsoGrezzo: string, urlRichiesta: string): string {
  const percorso = percorsoSicuro(percorsoGrezzo);
  const a = anteprimaDi(percorso);
  const destinazione = `${SITO}${percorso}`;
  const img = assoluto(a.immagine);
  return `<!doctype html>
<html lang="it">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${esc(a.titolo)}</title>
<meta name="description" content="${esc(a.descrizione)}" />
<link rel="canonical" href="${esc(destinazione)}" />
<meta property="og:type" content="website" />
<meta property="og:site_name" content="TBH-WEB · Touch Business Holding" />
<meta property="og:locale" content="it_IT" />
<meta property="og:title" content="${esc(a.titolo)}" />
<meta property="og:description" content="${esc(a.descrizione)}" />
<meta property="og:url" content="${esc(urlRichiesta)}" />
<meta property="og:image" content="${esc(img)}" />
<meta property="og:image:alt" content="${esc(a.titolo)}" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="${esc(a.titolo)}" />
<meta name="twitter:description" content="${esc(a.descrizione)}" />
<meta name="twitter:image" content="${esc(img)}" />
<meta http-equiv="refresh" content="0;url=${esc(destinazione)}" />
<style>body{background:#000;color:#fff;font-family:system-ui,sans-serif;display:grid;place-items:center;min-height:100vh;margin:0}a{color:#d7ff00}</style>
</head>
<body>
<p><a href="${esc(destinazione)}">${esc(a.titolo)}</a></p>
<script>location.replace(${JSON.stringify(destinazione)});</script>
</body>
</html>`;
}
