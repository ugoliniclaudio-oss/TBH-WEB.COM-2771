import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import { Link } from "wouter";
import {
  AudioLines,
  BadgeCheck,
  Copy,
  Disc3,
  ExternalLink,
  Eye,
  Facebook,
  Gamepad2,
  Globe,
  Headphones,
  Heart,
  Instagram,
  Linkedin,
  MessageCircle,
  Music2,
  Palette,
  Pin,
  Send,
  Share2,
  Twitch,
  Twitter,
  Users,
  Video,
  X,
  Youtube,
  Zap,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { QrLink } from "./qr-link";
import { registraClicSocial, useSocialCollegati, useTouchSocial, type VoceTouchSocial } from "../queries/touch-social";

/**
 * TOUCH SOCIAL — pezzi condivisi fra la pagina /contatti-social, le schede Channel e le altre pagine
 * che richiamano le STESSE voci (nessuna copia). Ogni pulsante apre la destinazione originale:
 * nessun follow simulato, nessun accesso al posto del visitatore.
 */

export const ICONE_SOCIAL: Record<string, LucideIcon> = {
  youtube: Youtube,
  facebook: Facebook,
  instagram: Instagram,
  tiktok: Music2,
  x: Twitter,
  linkedin: Linkedin,
  okru: Users,
  vk: Users,
  pinterest: Pin,
  bigo: Video,
  toptop: Video,
  bump: Zap,
  whatsapp: MessageCircle,
  telegram: Send,
  twitch: Twitch,
  discord: Gamepad2,
  spotify: Headphones,
  "apple-music": Disc3,
  suno: AudioLines,
  behance: Palette,
  altro: Globe,
};

export const COLORI_SOCIAL: Record<string, string> = {
  youtube: "#ff8a00",
  facebook: "#2f7bff",
  instagram: "#ff3df0",
  tiktok: "#33e0ff",
  x: "#e8e8e8",
  linkedin: "#33a0ff",
  okru: "#ff8a00",
  vk: "#4c8dff",
  pinterest: "#ff3df0",
  bigo: "#33e0ff",
  toptop: "#ff8a00",
  bump: "#d7ff00",
  whatsapp: "#25d366",
  telegram: "#33b5ff",
  twitch: "#a970ff",
  discord: "#7289ff",
  spotify: "#1ed760",
  "apple-music": "#ff3df0",
  suno: "#d4af37",
  behance: "#3d7bff",
  altro: "#d4af37",
};

export const NOMI_TIPO: Record<string, string> = {
  profilo: "Profilo",
  pagina: "Pagina",
  gruppo: "Gruppo",
  canale: "Canale",
  diretta: "Dirette",
  playlist: "Playlist",
  contatto: "Contatto diretto",
};

type VoceMin = Pick<VoceTouchSocial, "id" | "piattaforma" | "tipo" | "nome" | "url">;

/** Il pulsante principale, con il verbo che la piattaforma consente davvero. */
export function azionePrincipale(v: VoceMin): { etichetta: string; url: string } {
  const url = v.url;
  if (v.piattaforma === "youtube" && v.tipo === "canale") {
    // Link ufficiale di YouTube che apre la conferma d'iscrizione: decide sempre il visitatore.
    const sub = /youtube\.com\/(@[^/?#]+|channel\/[^/?#]+)\/?$/i.test(url) ? `${url.replace(/\/$/, "")}?sub_confirmation=1` : url;
    return { etichetta: "Iscriviti", url: sub };
  }
  if (v.tipo === "playlist") return { etichetta: "Guarda la playlist", url };
  if (v.tipo === "gruppo") return { etichetta: "Entra nel gruppo", url };
  if (v.tipo === "diretta") return { etichetta: "Guarda le dirette", url };
  if (v.tipo === "contatto") return { etichetta: v.piattaforma === "whatsapp" ? "Scrivi su WhatsApp" : "Contatta", url };
  if (v.tipo === "canale") return { etichetta: "Iscriviti al canale", url };
  if (["spotify", "apple-music", "suno"].includes(v.piattaforma)) return { etichetta: "Ascolta e segui", url };
  if (v.piattaforma === "bump" || v.piattaforma === "behance") return { etichetta: "Apri profilo", url };
  if (v.tipo === "pagina") return { etichetta: "Segui la pagina", url };
  return { etichetta: "Segui", url };
}

/* ── preferiti (solo su questo dispositivo) ──────────────────────────────── */

const CHIAVE_PREFERITI = "tbh-touch-social-preferiti";
const ascoltatori = new Set<() => void>();
function leggiPreferiti(): string[] {
  try {
    const a = JSON.parse(localStorage.getItem(CHIAVE_PREFERITI) ?? "[]") as unknown;
    return Array.isArray(a) ? a.filter((x): x is string => typeof x === "string") : [];
  } catch {
    return [];
  }
}
let istantanea = typeof window === "undefined" ? "[]" : JSON.stringify(leggiPreferiti());
function notifica() {
  istantanea = JSON.stringify(leggiPreferiti());
  for (const f of ascoltatori) f();
}
if (typeof window !== "undefined")
  window.addEventListener("storage", (e) => {
    if (e.key === CHIAVE_PREFERITI) notifica();
  });

export function usePreferitiSocial() {
  const raw = useSyncExternalStore(
    (f) => {
      ascoltatori.add(f);
      return () => ascoltatori.delete(f);
    },
    () => istantanea,
    () => "[]",
  );
  const elenco = JSON.parse(raw) as string[];
  const alterna = useCallback((id: string) => {
    const a = leggiPreferiti();
    const dopo = a.includes(id) ? a.filter((x) => x !== id) : [...a, id];
    try {
      localStorage.setItem(CHIAVE_PREFERITI, JSON.stringify(dopo));
    } catch {
      /* memoria del browser piena o disattivata */
    }
    if (!a.includes(id)) registraClicSocial(id, "preferito");
    notifica();
  }, []);
  return { elenco, alterna, ha: (id: string) => elenco.includes(id) };
}

/* ── copia e condividi ───────────────────────────────────────────────────── */

export async function copiaTesto(t: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(t);
    return true;
  } catch {
    try {
      const ta = document.createElement("textarea");
      ta.value = t;
      ta.setAttribute("readonly", "");
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand("copy");
      ta.remove();
      return ok;
    } catch {
      return false;
    }
  }
}

/** Condivisione nativa del dispositivo; dove manca, si copia il link. */
export async function condividi(titolo: string, url: string): Promise<"condiviso" | "copiato" | "annullato" | "errore"> {
  const dati = { title: titolo, text: `${titolo} — seguici anche qui!`, url };
  if (typeof navigator !== "undefined" && "share" in navigator && (!navigator.canShare || navigator.canShare(dati))) {
    try {
      await navigator.share(dati);
      return "condiviso";
    } catch (e) {
      if ((e as DOMException)?.name === "AbortError") return "annullato";
    }
  }
  return (await copiaTesto(url)) ? "copiato" : "errore";
}

/** Indirizzi di condivisione ufficiali delle piattaforme (nessuna API, nessun accesso). */
export function linkCondivisione(titolo: string, url: string) {
  const u = encodeURIComponent(url);
  const t = encodeURIComponent(`${titolo} — seguici anche qui!`);
  return [
    { nome: "WhatsApp", href: `https://wa.me/?text=${t}%20${u}` },
    { nome: "Telegram", href: `https://t.me/share/url?url=${u}&text=${t}` },
    { nome: "Facebook", href: `https://www.facebook.com/sharer/sharer.php?u=${u}` },
    { nome: "X", href: `https://x.com/intent/post?url=${u}&text=${t}` },
    { nome: "LinkedIn", href: `https://www.linkedin.com/sharing/share-offsite/?url=${u}` },
  ];
}

/** Avviso breve in basso (copiato, condiviso…). */
export function useAvviso() {
  const [testo, setTesto] = useState<string | null>(null);
  useEffect(() => {
    if (!testo) return;
    const t = setTimeout(() => setTesto(null), 2200);
    return () => clearTimeout(t);
  }, [testo]);
  const nodo = testo ? (
    <div
      role="status"
      className="fixed bottom-20 left-1/2 z-[130] -translate-x-1/2 rounded-full border border-[var(--tbh-neon)] bg-black/90 px-5 py-2.5 text-sm font-semibold text-[var(--tbh-neon)] shadow-lg"
      data-testid="avviso-social"
    >
      {testo}
    </div>
  ) : null;
  return { avvisa: setTesto, nodo };
}

/* ── anteprima del profilo ───────────────────────────────────────────────── */

export function iniziali(nome: string) {
  return nome
    .replace(/[^A-Za-zÀ-ÿ0-9 ]/g, " ")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
}

export function FotoProfilo({ v, lato = 68 }: { v: Pick<VoceTouchSocial, "nome" | "logo" | "immagine" | "piattaforma">; lato?: number }) {
  const [rotta, setRotta] = useState(false);
  const src = !rotta ? (v.immagine ?? v.logo) : v.logo && v.immagine ? v.logo : null;
  const Icona = ICONE_SOCIAL[v.piattaforma] ?? Globe;
  const colore = COLORI_SOCIAL[v.piattaforma] ?? "#d4af37";
  return (
    <div className="relative shrink-0" style={{ width: lato, height: lato }}>
      <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-2xl border border-[var(--tbh-line)] bg-black/60">
        {src ? (
          <img
            src={src}
            alt={v.nome}
            loading="lazy"
            referrerPolicy="no-referrer"
            onError={() => setRotta(true)}
            className="h-full w-full object-contain p-1.5"
          />
        ) : (
          <span className="tbh-display text-lg text-[var(--tbh-muted)]">{iniziali(v.nome)}</span>
        )}
      </div>
      <span
        className="absolute -left-2 -top-2 flex h-7 w-7 items-center justify-center rounded-lg border border-[var(--tbh-line)] bg-[#0d0d0d]"
        style={{ color: colore }}
        aria-hidden="true"
      >
        <Icona size={15} />
      </span>
    </div>
  );
}

export function AnteprimaSocial({
  v,
  nomePiattaforma,
  nomeCategoria,
  apriSu,
  onChiudi,
}: {
  v: VoceTouchSocial;
  nomePiattaforma: string;
  nomeCategoria: string;
  apriSu: "anteprima" | "qr";
  onChiudi: () => void;
}) {
  const { avvisa, nodo } = useAvviso();
  const pref = usePreferitiSocial();
  const az = azionePrincipale(v);
  const colore = COLORI_SOCIAL[v.piattaforma] ?? "#d4af37";
  const [player, setPlayer] = useState(false);

  useEffect(() => {
    const esc = (e: KeyboardEvent) => e.key === "Escape" && onChiudi();
    window.addEventListener("keydown", esc);
    const prima = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", esc);
      document.body.style.overflow = prima;
    };
  }, [onChiudi]);

  return (
    <div
      className="fixed inset-0 z-[120] flex items-end justify-center bg-black/85 sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-label={`Anteprima ${v.nome}`}
      onClick={onChiudi}
      data-testid="anteprima-social"
    >
      <div
        className="relative max-h-[92vh] w-full max-w-[640px] overflow-y-auto rounded-t-3xl border bg-[#0b0b0c] p-5 sm:rounded-3xl md:p-6"
        style={{ borderColor: colore }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onChiudi}
          className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full border border-[var(--tbh-line)] hover:border-white"
          aria-label="Chiudi anteprima"
          data-testid="chiudi-anteprima"
        >
          <X size={18} />
        </button>

        <div className="flex items-start gap-4 pr-10">
          <FotoProfilo v={v} lato={84} />
          <div className="min-w-0">
            <p className="text-[11px] uppercase tracking-[0.2em]" style={{ color: colore }}>
              {nomePiattaforma} · {NOMI_TIPO[v.tipo] ?? v.tipo}
            </p>
            <h2 className="tbh-display mt-1 break-words text-xl leading-tight md:text-2xl">{v.nome}</h2>
            {v.handle && <p className="mt-1 break-all text-sm text-[var(--tbh-muted)]">{v.handle}</p>}
            <p className="mt-1 text-xs text-[var(--tbh-muted)]">{nomeCategoria}</p>
          </div>
        </div>

        {v.descrizione && <p className="mt-4 text-sm leading-relaxed text-white/85">{v.descrizione}</p>}

        <p className="mt-3 inline-flex items-center gap-1.5 text-xs text-[var(--tbh-neon)]">
          <BadgeCheck size={14} /> Profilo ufficiale consegnato da TBH
          {v.verifica?.esito === "ok" && ` · link controllato il ${new Date(v.verifica.quando).toLocaleDateString("it-IT")}`}
        </p>

        {apriSu === "qr" ? (
          <div className="mt-5 flex flex-col items-center gap-2" data-testid="qr-social">
            <QrLink url={v.url} etichetta={`QR code di ${v.nome}`} lato={200} />
            <p className="text-xs text-[var(--tbh-muted)]">Inquadra con la fotocamera per aprire il profilo.</p>
          </div>
        ) : v.embed ? (
          <div className="mt-5">
            {player ? (
              <div className="overflow-hidden rounded-2xl border border-[var(--tbh-line)] bg-black" style={{ aspectRatio: v.piattaforma === "facebook" ? "5 / 6" : "16 / 9" }}>
                <iframe
                  src={v.embed}
                  title={`Anteprima ufficiale ${v.nome}`}
                  className="h-full w-full"
                  loading="lazy"
                  allow="autoplay; encrypted-media; picture-in-picture; clipboard-write"
                  allowFullScreen
                  referrerPolicy="strict-origin-when-cross-origin"
                />
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setPlayer(true)}
                className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-[var(--tbh-line)] px-4 py-6 text-sm font-semibold hover:border-[var(--tbh-neon)]"
                data-testid="carica-player"
              >
                <Eye size={16} /> Carica l'anteprima ufficiale di {nomePiattaforma}
              </button>
            )}
            <p className="mt-2 text-[11px] text-[var(--tbh-muted)]">Contenuto mostrato con il lettore ufficiale della piattaforma.</p>
          </div>
        ) : (
          <div className="mt-5 flex flex-col items-center gap-3 rounded-2xl border border-[var(--tbh-line)] bg-white/[0.03] p-4 sm:flex-row sm:items-start">
            <QrLink url={v.url} etichetta={`QR code di ${v.nome}`} lato={132} />
            <p className="text-xs leading-relaxed text-[var(--tbh-muted)]">
              {nomePiattaforma} non permette di mostrare il profilo dentro altri siti senza accesso: qui trovi la scheda informativa e il collegamento diretto. Si apre
              sulla piattaforma originale, dove puoi seguirci con il tuo account.
            </p>
          </div>
        )}

        <div className="mt-5 grid gap-2 sm:grid-cols-2">
          <a
            href={az.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => registraClicSocial(v.id, "segui")}
            className="tbh-neon-btn inline-flex items-center justify-center gap-1.5 px-4 py-3 text-sm uppercase"
          >
            {az.etichetta} <ExternalLink size={14} />
          </a>
          <a
            href={v.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => registraClicSocial(v.id, "apri")}
            className="inline-flex items-center justify-center gap-1.5 rounded-full border border-[var(--tbh-line)] px-4 py-3 text-sm font-bold uppercase hover:border-white"
            data-testid="apri-social"
          >
            Apri {nomePiattaforma} <ExternalLink size={14} />
          </a>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={async () => {
              registraClicSocial(v.id, "condividi");
              const e = await condividi(v.nome, v.url);
              if (e === "copiato") avvisa("Link copiato: incollalo dove vuoi condividerlo");
              if (e === "errore") avvisa("Condivisione non disponibile su questo dispositivo");
            }}
            className="inline-flex items-center gap-1.5 rounded-full border border-[var(--tbh-line)] px-3 py-2 text-xs font-semibold hover:border-[var(--tbh-neon)]"
          >
            <Share2 size={14} /> Condividi
          </button>
          <button
            type="button"
            onClick={async () => {
              registraClicSocial(v.id, "copia");
              avvisa((await copiaTesto(v.url)) ? "Link copiato" : "Copia non riuscita");
            }}
            className="inline-flex items-center gap-1.5 rounded-full border border-[var(--tbh-line)] px-3 py-2 text-xs font-semibold hover:border-[var(--tbh-neon)]"
            data-testid="copia-link-modale"
          >
            <Copy size={14} /> Copia link
          </button>
          <button
            type="button"
            onClick={() => pref.alterna(v.id)}
            aria-pressed={pref.ha(v.id)}
            className="inline-flex items-center gap-1.5 rounded-full border px-3 py-2 text-xs font-semibold"
            style={{ borderColor: pref.ha(v.id) ? "#ff3df0" : "var(--tbh-line)", color: pref.ha(v.id) ? "#ff3df0" : undefined }}
          >
            <Heart size={14} fill={pref.ha(v.id) ? "#ff3df0" : "none"} /> {pref.ha(v.id) ? "Nei preferiti" : "Aggiungi ai preferiti"}
          </button>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[var(--tbh-muted)]">
          <span>Condividi su:</span>
          {linkCondivisione(v.nome, v.url).map((l) => (
            <a key={l.nome} href={l.href} target="_blank" rel="noopener noreferrer" onClick={() => registraClicSocial(v.id, "condividi")} className="underline hover:text-white">
              {l.nome}
            </a>
          ))}
        </div>
        {nodo}
      </div>
    </div>
  );
}

/* ── blocco «Social ufficiali» per Channel e pagine ──────────────────────── */

export function SocialCollegati({ channel, pagina, titolo = "Social ufficiali", className = "" }: { channel?: string; pagina?: string; titolo?: string; className?: string }) {
  const q = useSocialCollegati({ channel, pagina });
  const voci = q.data ?? [];
  if (!voci.length) return null;
  return (
    <section className={`tbh-card p-4 md:p-5 ${className}`} data-testid="social-collegati">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h2 className="tbh-display text-lg uppercase tracking-wide" style={{ color: "#ff3df0" }}>
          {titolo}
        </h2>
        <Link href="/contatti-social" className="text-xs font-semibold uppercase tracking-wide text-[var(--tbh-neon)] hover:underline">
          Tutti su Touch Social →
        </Link>
      </div>
      <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {voci.map((v) => {
          const Icona = ICONE_SOCIAL[v.piattaforma] ?? Globe;
          const az = azionePrincipale(v);
          return (
            <li key={v.id} className="flex min-w-0 items-center gap-3 rounded-xl border border-[var(--tbh-line)] p-2.5">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-black/60" style={{ color: COLORI_SOCIAL[v.piattaforma] }}>
                <Icona size={17} />
              </span>
              <span className="min-w-0 grow">
                <span className="block truncate text-sm font-semibold">{v.nome}</span>
                {v.handle && <span className="block truncate text-[11px] text-[var(--tbh-muted)]">{v.handle}</span>}
              </span>
              <a
                href={az.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => registraClicSocial(v.id, "segui")}
                className="tbh-neon-btn shrink-0 px-3 py-1.5 text-[11px] uppercase"
              >
                {az.etichetta}
              </a>
            </li>
          );
        })}
      </ul>
    </section>
  );
}


/* ── striscia per la home e il mosaico dei Channel ───────────────────────── */

export function StrisciaTouchSocial() {
  const q = useTouchSocial();
  const voci = q.data?.voci ?? [];
  const piattaforme = (q.data?.piattaforme ?? []).filter((p) => voci.some((v) => v.piattaforma === p.id));
  return (
    <section className="mx-auto mt-10 max-w-[1500px] px-4 md:px-8" aria-label="Touch Social" data-testid="striscia-touch-social">
      <div
        className="flex flex-col gap-3 rounded-2xl border p-4 md:flex-row md:items-center md:gap-6 md:p-5"
        style={{ borderColor: "#ff3df0", background: "linear-gradient(120deg, rgba(255,61,240,.14), rgba(51,224,255,.08) 60%, rgba(255,138,0,.12))" }}
      >
        <Link href="/contatti-social" className="min-w-0 shrink-0 hover:opacity-90">
          <p className="text-[12px] font-black tracking-[0.2em]" style={{ color: "#ff3df0" }}>
            TOUCH SOCIAL — SEGUICI OVUNQUE!
          </p>
          <p className="mt-1 text-sm text-white/80">Un like non costa nulla, una condivisione ci aiuta a crescere!</p>
        </Link>
        <div className="flex min-w-0 grow flex-wrap gap-1.5">
          {piattaforme.map((p) => {
            const Icona = ICONE_SOCIAL[p.id] ?? Globe;
            return (
              <Link
                key={p.id}
                href={`/contatti-social?p=${p.id}`}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-black/50 hover:border-white"
                style={{ color: COLORI_SOCIAL[p.id] }}
                aria-label={`${p.nome} su Touch Social`}
                title={p.nome}
              >
                <Icona size={16} />
              </Link>
            );
          })}
        </div>
        <Link href="/contatti-social" className="tbh-neon-btn inline-flex shrink-0 items-center justify-center px-5 py-2.5 text-xs uppercase">
          {voci.length ? `Tutti i ${voci.length} profili` : "Apri Touch Social"}
        </Link>
      </div>
    </section>
  );
}
