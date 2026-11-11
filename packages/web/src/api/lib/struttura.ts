import { CHANNEL_REGISTRO, type ChannelRegistro } from "../data/channel-registro";
import { logoDelChannel } from "../data/loghi-channel";
import { REGISTRO_RISOLTO as REGISTRO } from "../data/identita";
import { QUALIFICA_LABEL, type Entita } from "../data/registro";
import { CANALI } from "../../web/lib/palinsesto";
import { ANTEPRIME_BRAND, ANTEPRIME_STEMMI } from "../../web/lib/anteprime-reali";

/**
 * STRUTTURA COMUNE Home → Canale → Attività → Scheda completa (28/10/2026).
 *
 * Nessun dato nuovo: si LEGGONO i dati già verificati del sito e si collegano fra loro.
 *   · Channel   = registro unico dei Channel (channel-registro.ts), logo da loghi-channel.ts.
 *   · Attività  = (1) la programmazione del canale del telecomando che ha come pagina canonica
 *                 la pagina del Channel (palinsesto.ts, solo corrispondenza ESATTA dell'URL);
 *                 (2) i collegamenti già registrati del Channel; (3) le entità del registro unico
 *                 pubblicate sulla pagina del Channel quando sono più di una (es. i partner del
 *                 Motorsport). Un Channel senza nessuna di queste fonti mostra «nessuna attività
 *                 registrata»: nulla viene inventato.
 *   · Scheda    = UNA sola destinazione per attività, la stessa da ogni Channel:
 *                 pagina del Channel se l'attività è a sua volta un Channel; altrimenti la scheda
 *                 dell'entità /e/<id> se una sola entità del registro è pubblicata a quell'URL;
 *                 altrimenti la pagina canonica già esistente. Gli URL esistenti non cambiano.
 *   · Ente      = la scheda /e/<id> che descrive il Channel stesso (id uguale allo slug, oppure
 *                 unica entità pubblicata sulla pagina / sul collegamento della società).
 */

export type ImmagineStruttura = { src: string; larghezza: number | null; altezza: number | null };

export type CardStruttura = {
  /** Destinazione unica (sempre la stessa da qualunque Channel). */
  href: string;
  titolo: string;
  /** Riga breve sopra il titolo (tipo di attività): mai una descrizione ripetuta. */
  etichetta: string | null;
  immagine: ImmagineStruttura | null;
  esterno: boolean;
  /** Entità del registro collegata (scheda completa), se c'è. */
  entita: string | null;
};

export type ChannelStruttura = {
  slug: string;
  nome: string;
  pagina: string | null;
  scheda: string;
  dm: boolean;
  logo: ImmagineStruttura | null;
  /** Scheda completa del Channel nel registro entità (/e/<id>), se esiste. */
  ente: { id: string; nome: string } | null;
  attivita: CardStruttura[];
};

const pulito = (u: string) => {
  const senza = u.split("#")[0]!.split("?")[0]!;
  return senza.length > 1 ? senza.replace(/\/$/, "") : senza;
};

const entitaPerHref = new Map<string, Entita[]>();
for (const e of REGISTRO)
  for (const p of e.pagine ?? []) {
    const h = pulito(p.href);
    const lista = entitaPerHref.get(h) ?? [];
    if (!lista.some((x) => x.id === e.id)) lista.push(e);
    entitaPerHref.set(h, lista);
  }
const entitaPerId = new Map(REGISTRO.map((e) => [e.id, e]));

const anteprimaPerHref = new Map<string, string>();
for (const a of [...ANTEPRIME_BRAND, ...ANTEPRIME_STEMMI]) if (!anteprimaPerHref.has(pulito(a.to))) anteprimaPerHref.set(pulito(a.to), a.src);

/** Channel registrati con una pagina interna: l'attività che punta lì è un Channel. */
const channelPerPagina = new Map<string, ChannelRegistro>();
for (const c of CHANNEL_REGISTRO) if (c.pagina && !channelPerPagina.has(pulito(c.pagina))) channelPerPagina.set(pulito(c.pagina), c);

function logoStruttura(slug: string, src: string | null): ImmagineStruttura | null {
  if (!src) return null;
  const l = logoDelChannel(slug);
  return l && l.src === src ? { src, larghezza: l.larghezza, altezza: l.altezza } : { src, larghezza: null, altezza: null };
}

const sola = (lista: Entita[] | undefined) => (lista && lista.length === 1 ? lista[0]! : null);

function enteDi(c: ChannelRegistro): Entita | null {
  const perId = entitaPerId.get(c.slug);
  if (perId) return perId;
  if (c.pagina) {
    const e = sola(entitaPerHref.get(pulito(c.pagina)));
    if (e) return e;
  }
  for (const k of c.collegamenti ?? []) {
    if (k.esterno) continue;
    const e = sola(entitaPerHref.get(pulito(k.href)));
    if (e) return e;
  }
  return null;
}

function etichettaEntita(e: Entita): string | null {
  const q = e.qualifiche[0];
  return q ? QUALIFICA_LABEL[q] : null;
}

/** La destinazione unica di un URL interno: Channel → sua pagina; una sola entità → /e/<id>; altrimenti l'URL. */
function cardDaUrl(url: string, titolo: string, etichetta: string | null, ente: Entita | null): CardStruttura | null {
  const h = pulito(url);
  const ch = channelPerPagina.get(h);
  if (ch) {
    return {
      href: ch.pagina!,
      titolo: ch.nome,
      etichetta: "Channel",
      /* Logo del Channel registrato; se manca, il marchio ufficiale già abbinato a quella pagina (anteprime-reali). */
      immagine: logoStruttura(ch.slug, ch.logo) ?? anteprima(h),
      esterno: false,
      entita: null,
    };
  }
  const e = sola(entitaPerHref.get(h));
  if (e && ente && e.id === ente.id) return null; // è il Channel stesso: già nella «scheda completa»
  if (e) {
    return {
      href: `/e/${e.id}`,
      titolo: e.nome,
      etichetta: etichettaEntita(e) ?? etichetta,
      immagine: e.logo ? { src: e.logo, larghezza: null, altezza: null } : anteprima(h),
      esterno: false,
      entita: e.id,
    };
  }
  return { href: url, titolo, etichetta, immagine: anteprima(h), esterno: false, entita: null };
}

const anteprima = (h: string): ImmagineStruttura | null => {
  const src = anteprimaPerHref.get(h);
  return src ? { src, larghezza: null, altezza: null } : null;
};

function attivitaDi(c: ChannelRegistro, ente: Entita | null): CardStruttura[] {
  const out: CardStruttura[] = [];
  const visti = new Set<string>();
  const aggiungi = (card: CardStruttura | null) => {
    if (!card) return;
    const k = card.esterno ? card.href : pulito(card.href);
    if (c.pagina && k === pulito(c.pagina)) return;
    if (visti.has(k)) return;
    visti.add(k);
    out.push(card);
  };
  const pagina = c.pagina ? pulito(c.pagina) : null;
  if (pagina) {
    const canale = CANALI.find((k) => k.numero !== 0 && pulito(k.url) === pagina);
    for (const p of canale?.programmazione ?? []) {
      if (pulito(p.url) === pagina) continue;
      aggiungi(cardDaUrl(p.url, p.titolo, p.etichetta, ente));
    }
  }
  for (const k of c.collegamenti ?? []) {
    if (k.esterno) {
      aggiungi({ href: k.href, titolo: k.nome, etichetta: null, immagine: null, esterno: true, entita: null });
      continue;
    }
    const ch = channelPerPagina.get(pulito(k.href));
    if (ch) {
      aggiungi(cardDaUrl(k.href, k.nome, null, ente));
      continue;
    }
    /* Il collegamento alla società è la sua pagina ufficiale: resta tale, con il logo dell'entità. */
    const e = sola(entitaPerHref.get(pulito(k.href)));
    aggiungi({
      href: k.href,
      titolo: e?.nome ?? k.nome.replace(/^Scheda della società · /, ""),
      etichetta: e ? etichettaEntita(e) : null,
      immagine: e?.logo ? { src: e.logo, larghezza: null, altezza: null } : anteprima(pulito(k.href)),
      esterno: false,
      entita: e?.id ?? null,
    });
  }
  /* Più entità pubblicate sulla pagina del Channel = attività/partner del Channel (es. Motorsport). */
  if (pagina) {
    const lista = entitaPerHref.get(pagina) ?? [];
    if (lista.length > 1)
      for (const e of lista)
        aggiungi({
          href: `/e/${e.id}`,
          titolo: e.nome,
          etichetta: etichettaEntita(e),
          immagine: e.logo ? { src: e.logo, larghezza: null, altezza: null } : null,
          esterno: false,
          entita: e.id,
        });
  }
  return out;
}

export function costruisciStruttura(): ChannelStruttura[] {
  return CHANNEL_REGISTRO.filter((c) => !c.slotVuoto).map((c) => {
    const ente = enteDi(c);
    return {
      slug: c.slug,
      nome: c.nome,
      pagina: c.pagina,
      scheda: c.scheda,
      dm: c.appartenenza === "DM",
      logo: logoStruttura(c.slug, c.logo),
      ente: ente ? { id: ente.id, nome: ente.nome } : null,
      attivita: attivitaDi(c, ente),
    };
  });
}

/** Calcolata una volta: i dati sono statici (file del sito). */
export const STRUTTURA: ChannelStruttura[] = costruisciStruttura();
