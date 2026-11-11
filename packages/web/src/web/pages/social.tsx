import { useEffect, useMemo, useState } from "react";
import { Link } from "wouter";
import { Copy, ExternalLink, Eye, Globe, Heart, Loader2, MessageCircle, QrCode, Search, Share2, Sparkles, X } from "lucide-react";
import { waInfo } from "../lib/whatsapp";
import { SlotContenuti } from "../components/slot-contenuti";
import { QrLink } from "../components/qr-link";
import {
  AnteprimaSocial,
  COLORI_SOCIAL,
  FotoProfilo,
  ICONE_SOCIAL,
  NOMI_TIPO,
  azionePrincipale,
  condividi,
  copiaTesto,
  useAvviso,
  usePreferitiSocial,
} from "../components/touch-social";
import { registraClicSocial, useTouchSocial, type VoceTouchSocial } from "../queries/touch-social";

/**
 * TOUCH SOCIAL — SEGUICI OVUNQUE! (09/11/2026). Stessa pagina e stesso indirizzo di «Contatti social»
 * (/contatti-social, /social reindirizza qui): ora è la directory interattiva gestita dal pannello
 * /allestimento/touch-social. Si vedono solo i profili pubblicati e verificati; l'indirizzo non è in
 * vista, si apre con i pulsanti. Anteprima interna: player/plugin ufficiali dove la piattaforma li
 * offre, altrimenti scheda informativa con collegamento diretto.
 */

const FUCSIA = "#ff3df0";
const AZZURRO = "#33e0ff";
const ARANCIO = "#ff8a00";

const GENERI = [
  { id: "tutti", nome: "Tutti" },
  { id: "persone", nome: "Persone" },
  { id: "pagine", nome: "Pagine e marchi" },
  { id: "gruppi", nome: "Gruppi e community" },
  { id: "canali", nome: "Canali, playlist e dirette" },
] as const;
type Genere = (typeof GENERI)[number]["id"];

function genere(v: VoceTouchSocial): Exclude<Genere, "tutti"> {
  if (v.tipo === "gruppo") return "gruppi";
  if (v.tipo === "canale" || v.tipo === "playlist" || v.tipo === "diretta") return "canali";
  if (v.persona) return "persone";
  return "pagine";
}

const norm = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");

function parametro(nome: string) {
  if (typeof window === "undefined") return null;
  return new URLSearchParams(window.location.search).get(nome);
}

type Aperta = { v: VoceTouchSocial; su: "anteprima" | "qr" };

function CardSocial({
  v,
  nomePiattaforma,
  onApri,
  avvisa,
}: {
  v: VoceTouchSocial;
  nomePiattaforma: string;
  onApri: (a: Aperta) => void;
  avvisa: (t: string) => void;
}) {
  const pref = usePreferitiSocial();
  const colore = COLORI_SOCIAL[v.piattaforma] ?? "#d4af37";
  const az = azionePrincipale(v);
  const preferito = pref.ha(v.id);
  const piccolo = "flex h-9 w-9 items-center justify-center rounded-full border border-[var(--tbh-line)] hover:border-[var(--tbh-neon)] hover:text-[var(--tbh-neon)]";
  return (
    <article className="tbh-card flex h-full flex-col gap-3 p-4" style={{ borderColor: v.evidenza ? colore : undefined }} data-testid="card-social" data-id={v.id}>
      <div className="flex items-start gap-3">
        <FotoProfilo v={v} />
        <div className="min-w-0 grow">
          <p className="text-[10px] uppercase tracking-[0.18em]" style={{ color: colore }}>
            {nomePiattaforma} · {NOMI_TIPO[v.tipo] ?? v.tipo}
          </p>
          <h3 className="tbh-display mt-0.5 break-words text-base leading-tight md:text-lg">{v.nome}</h3>
          {v.handle && <p className="mt-1 break-all text-xs text-[var(--tbh-muted)]">{v.handle}</p>}
        </div>
        <button
          type="button"
          onClick={() => {
            pref.alterna(v.id);
            avvisa(preferito ? "Tolto dai preferiti" : "Aggiunto ai preferiti");
          }}
          aria-pressed={preferito}
          aria-label={preferito ? `Togli ${v.nome} dai preferiti` : `Aggiungi ${v.nome} ai preferiti`}
          className="-mr-1 -mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
          style={{ color: preferito ? FUCSIA : "var(--tbh-muted)" }}
          data-testid="preferito"
        >
          <Heart size={18} fill={preferito ? FUCSIA : "none"} />
        </button>
      </div>

      {v.campagna && (
        <p className="w-fit rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-black" style={{ background: ARANCIO }}>
          {v.campagna}
        </p>
      )}
      {v.descrizione && <p className="line-clamp-3 text-xs leading-snug text-[var(--tbh-muted)]">{v.descrizione}</p>}

      <div className="mt-auto flex flex-col gap-2 pt-1">
        <div className="grid grid-cols-[1fr_auto] gap-2">
          <a
            href={az.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => registraClicSocial(v.id, "segui")}
            className="tbh-neon-btn inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs uppercase"
            data-testid="azione-principale"
          >
            {az.etichetta} <ExternalLink size={13} />
          </a>
          <button
            type="button"
            onClick={() => {
              registraClicSocial(v.id, "anteprima");
              onApri({ v, su: "anteprima" });
            }}
            className="inline-flex items-center gap-1.5 rounded-full border border-[var(--tbh-line)] px-3 py-2 text-xs font-bold uppercase hover:border-white"
            data-testid="apri-anteprima"
          >
            <Eye size={14} /> Anteprima
          </button>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className={piccolo}
            aria-label={`Condividi ${v.nome}`}
            title="Condividi"
            onClick={async () => {
              registraClicSocial(v.id, "condividi");
              const e = await condividi(v.nome, v.url);
              if (e === "copiato") avvisa("Link copiato: incollalo dove vuoi condividerlo");
              if (e === "errore") avvisa("Condivisione non disponibile");
            }}
          >
            <Share2 size={15} />
          </button>
          <button
            type="button"
            className={piccolo}
            aria-label={`Copia il link di ${v.nome}`}
            title="Copia link"
            data-testid="copia-link"
            onClick={async () => {
              registraClicSocial(v.id, "copia");
              avvisa((await copiaTesto(v.url)) ? "Link copiato" : "Copia non riuscita");
            }}
          >
            <Copy size={15} />
          </button>
          <button
            type="button"
            className={piccolo}
            aria-label={`QR code di ${v.nome}`}
            title="QR code"
            data-testid="apri-qr"
            onClick={() => {
              registraClicSocial(v.id, "qr");
              onApri({ v, su: "qr" });
            }}
          >
            <QrCode size={15} />
          </button>
          <a
            href={v.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => registraClicSocial(v.id, "apri")}
            className="ml-auto inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wide text-[var(--tbh-muted)] hover:text-white"
          >
            Apri social <ExternalLink size={12} />
          </a>
        </div>
      </div>
    </article>
  );
}

export default function SocialPage() {
  const q = useTouchSocial();
  const d = q.data;
  const pref = usePreferitiSocial();
  const { avvisa, nodo } = useAvviso();

  const [cerca, setCerca] = useState(() => parametro("q") ?? "");
  const [piattaforma, setPiattaforma] = useState(() => parametro("p") ?? "tutte");
  const [categoria, setCategoria] = useState(() => parametro("c") ?? "tutte");
  const [tipo, setTipo] = useState("tutti");
  const [gen, setGen] = useState<Genere>("tutti");
  const [soloPreferiti, setSoloPreferiti] = useState(false);
  const [aperta, setAperta] = useState<Aperta | null>(null);
  const [qrPagina, setQrPagina] = useState(false);

  const voci = d?.voci ?? [];
  const nomePiatt = useMemo(() => new Map((d?.piattaforme ?? []).map((p) => [p.id, p.nome])), [d]);
  const nomeCat = useMemo(() => new Map((d?.categorie ?? []).map((c) => [c.id, c.nome])), [d]);

  // ?voce=<id> apre direttamente l'anteprima (link dalle schede Channel e dalle altre pagine).
  useEffect(() => {
    const id = parametro("voce");
    if (!id || !voci.length) return;
    const v = voci.find((x) => x.id === id);
    if (v) setAperta({ v, su: "anteprima" });
    // solo al primo caricamento dei dati
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [voci.length]);

  const filtrate = useMemo(() => {
    const t = norm(cerca.trim());
    return voci.filter((v) => {
      if (piattaforma !== "tutte" && v.piattaforma !== piattaforma) return false;
      if (categoria !== "tutte" && v.categoria !== categoria) return false;
      if (tipo !== "tutti" && v.tipo !== tipo) return false;
      if (gen !== "tutti" && genere(v) !== gen) return false;
      if (soloPreferiti && !pref.elenco.includes(v.id)) return false;
      if (!t) return true;
      return norm([v.nome, v.handle ?? "", v.descrizione ?? "", nomePiatt.get(v.piattaforma) ?? "", nomeCat.get(v.categoria) ?? "", v.campagna ?? ""].join(" ")).includes(t);
    });
  }, [voci, cerca, piattaforma, categoria, tipo, gen, soloPreferiti, pref.elenco, nomePiatt, nomeCat]);

  const piattaformePresenti = useMemo(() => {
    const n = new Map<string, number>();
    for (const v of voci) n.set(v.piattaforma, (n.get(v.piattaforma) ?? 0) + 1);
    return (d?.piattaforme ?? []).filter((p) => n.has(p.id)).map((p) => ({ ...p, n: n.get(p.id)! }));
  }, [voci, d]);
  const tipiPresenti = useMemo(() => (d?.tipi ?? []).filter((t) => voci.some((v) => v.tipo === t)), [voci, d]);
  const inEvidenza = voci.filter((v) => v.evidenza || v.campagna);
  const filtriAttivi = piattaforma !== "tutte" || categoria !== "tutte" || tipo !== "tutti" || gen !== "tutti" || soloPreferiti || cerca.trim() !== "";
  const azzera = () => {
    setCerca("");
    setPiattaforma("tutte");
    setCategoria("tutte");
    setTipo("tutti");
    setGen("tutti");
    setSoloPreferiti(false);
  };
  const urlPagina = typeof window !== "undefined" ? `${window.location.origin}/contatti-social` : "/contatti-social";

  const sel = "w-full rounded-xl border border-[var(--tbh-line)] bg-black/70 px-3 py-2.5 text-sm outline-none focus:border-[var(--tbh-neon)]";
  const chip = (on: boolean, colore = "var(--tbh-neon)") => ({
    className: "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors",
    style: on ? { borderColor: colore, color: "#000", background: colore } : { borderColor: "var(--tbh-line)" },
  });

  return (
    <div className="mx-auto max-w-[1400px] overflow-x-clip px-4 py-10 md:px-8" data-testid="touch-social">
      <header className="tbh-rise mb-6">
        <p className="mb-2 text-xs uppercase tracking-[0.25em] text-[var(--tbh-gold)]">Directory social del gruppo TBH</p>
        <h1 className="tbh-display tbh-h1 leading-[0.95]">
          <span style={{ color: FUCSIA }}>TOUCH SOCIAL</span> <span className="text-white/40">—</span> <span style={{ color: "var(--tbh-neon)" }}>SEGUICI OVUNQUE!</span>
        </h1>
        <p className="tbh-body mt-3 max-w-3xl text-[var(--tbh-muted)]">
          Tutti i nostri profili ufficiali, pagine, gruppi, canali, dirette e community in un unico posto.
        </p>
        {d && (
          <div className="mt-4 flex flex-wrap gap-2 text-xs">
            <span className="rounded-full border border-[var(--tbh-line)] px-3 py-1.5">{voci.length} profili ufficiali</span>
            <span className="rounded-full border px-3 py-1.5" style={{ borderColor: AZZURRO, color: AZZURRO }}>
              {piattaformePresenti.length} piattaforme
            </span>
            <span className="rounded-full border px-3 py-1.5" style={{ borderColor: FUCSIA, color: FUCSIA }}>
              {pref.elenco.filter((id) => voci.some((v) => v.id === id)).length} nei tuoi preferiti
            </span>
          </div>
        )}
      </header>

      {/* banner */}
      <section
        className="relative mb-8 overflow-hidden rounded-3xl border p-5 md:p-7"
        style={{ borderColor: FUCSIA, background: `linear-gradient(120deg, rgba(255,61,240,.16), rgba(51,224,255,.10) 55%, rgba(255,138,0,.14))` }}
        data-testid="banner-social"
      >
        <p className="tbh-display text-xl leading-tight md:text-3xl">
          UN LIKE NON COSTA NULLA, <span style={{ color: "var(--tbh-neon)" }}>UNA CONDIVISIONE CI AIUTA A CRESCERE!</span>
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <a href="#profili" className="tbh-neon-btn inline-flex items-center gap-1.5 px-4 py-2.5 text-xs uppercase">
            <Heart size={14} /> Like e seguici
          </a>
          <button
            type="button"
            onClick={async () => {
              const e = await condividi("TOUCH SOCIAL — SEGUICI OVUNQUE!", urlPagina);
              if (e === "copiato") avvisa("Link di Touch Social copiato");
            }}
            className="inline-flex items-center gap-1.5 rounded-full border border-white/40 px-4 py-2.5 text-xs font-bold uppercase hover:border-white"
            data-testid="condividi-pagina"
          >
            <Share2 size={14} /> Condividi
          </button>
          <button
            type="button"
            onClick={async () => avvisa((await copiaTesto(urlPagina)) ? "Link di Touch Social copiato" : "Copia non riuscita")}
            className="inline-flex items-center gap-1.5 rounded-full border border-white/40 px-4 py-2.5 text-xs font-bold uppercase hover:border-white"
            data-testid="copia-link-pagina"
          >
            <Copy size={14} /> Copia link
          </button>
          <button
            type="button"
            onClick={() => setQrPagina((x) => !x)}
            aria-expanded={qrPagina}
            className="inline-flex items-center gap-1.5 rounded-full border border-white/40 px-4 py-2.5 text-xs font-bold uppercase hover:border-white"
            data-testid="qr-pagina"
          >
            <QrCode size={14} /> QR code
          </button>
        </div>
        {qrPagina && (
          <div className="mt-4 flex items-center gap-3">
            <QrLink url={urlPagina} etichetta="QR code di Touch Social" lato={140} />
            <p className="max-w-xs text-xs text-white/75">Inquadra per aprire Touch Social dal telefono, o stampalo su locandine e biglietti.</p>
          </div>
        )}
      </section>

      {/* in evidenza */}
      {inEvidenza.length > 0 && (
        <section className="mb-8" aria-label="In evidenza">
          <h2 className="tbh-display mb-3 flex items-center gap-2 text-lg uppercase tracking-wide" style={{ color: "var(--tbh-gold)" }}>
            <Sparkles size={18} /> In evidenza
          </h2>
          <div className="flex gap-3 overflow-x-auto pb-2 [scrollbar-width:thin]">
            {inEvidenza.map((v) => {
              const Icona = ICONE_SOCIAL[v.piattaforma] ?? Globe;
              return (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => {
                    registraClicSocial(v.id, "anteprima");
                    setAperta({ v, su: "anteprima" });
                  }}
                  className="flex w-[230px] shrink-0 items-center gap-3 rounded-2xl border bg-black/50 p-3 text-left hover:bg-white/[0.04]"
                  style={{ borderColor: COLORI_SOCIAL[v.piattaforma] }}
                >
                  <FotoProfilo v={v} lato={48} />
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-semibold">{v.nome}</span>
                    <span className="flex items-center gap-1 text-[11px] text-[var(--tbh-muted)]">
                      <Icona size={12} /> {nomePiatt.get(v.piattaforma)}
                    </span>
                    {v.campagna && <span className="mt-0.5 block truncate text-[10px] font-bold uppercase" style={{ color: ARANCIO }}>{v.campagna}</span>}
                  </span>
                </button>
              );
            })}
          </div>
        </section>
      )}

      {/* ricerca e filtri */}
      <section id="profili" className="tbh-card mb-8 scroll-mt-24 p-4 md:p-5" aria-label="Cerca e filtra" data-testid="filtri-social">
        <div className="grid gap-3 md:grid-cols-[1.4fr_1fr_1fr]">
          <label className="relative block">
            <span className="sr-only">Cerca</span>
            <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--tbh-muted)]" />
            <input
              type="search"
              value={cerca}
              onChange={(e) => setCerca(e.target.value)}
              placeholder="Cerca un profilo, un marchio, un handle…"
              className={`${sel} pl-9`}
              data-testid="cerca-social"
            />
          </label>
          <label className="block">
            <span className="sr-only">Marchio o categoria</span>
            <select value={categoria} onChange={(e) => setCategoria(e.target.value)} className={sel} data-testid="filtro-categoria">
              <option value="tutte">Tutti i marchi e le categorie</option>
              {(d?.categorie ?? []).map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nome}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="sr-only">Tipo</span>
            <select value={tipo} onChange={(e) => setTipo(e.target.value)} className={sel} data-testid="filtro-tipo">
              <option value="tutti">Tutti i tipi</option>
              {tipiPresenti.map((t) => (
                <option key={t} value={t}>
                  {NOMI_TIPO[t] ?? t}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="mt-3 flex gap-2 overflow-x-auto pb-1" role="group" aria-label="Piattaforma" data-testid="filtro-piattaforma">
          <button type="button" onClick={() => setPiattaforma("tutte")} {...chip(piattaforma === "tutte")}>
            Tutte le piattaforme
          </button>
          {piattaformePresenti.map((p) => {
            const Icona = ICONE_SOCIAL[p.id] ?? Globe;
            const on = piattaforma === p.id;
            return (
              <button key={p.id} type="button" onClick={() => setPiattaforma(on ? "tutte" : p.id)} {...chip(on, COLORI_SOCIAL[p.id])} data-piattaforma={p.id}>
                <Icona size={13} style={on ? undefined : { color: COLORI_SOCIAL[p.id] }} /> {p.nome} <span className="opacity-60">{p.n}</span>
              </button>
            );
          })}
        </div>

        <div className="mt-2 flex flex-wrap items-center gap-2" role="group" aria-label="Persone, pagine, gruppi">
          {GENERI.map((g) => {
            // Un filtro senza profili non si mostra (es. «Gruppi» finché non c'è un gruppo pubblicato).
            const n = g.id === "tutti" ? voci.length : voci.filter((v) => genere(v) === g.id).length;
            if (!n && gen !== g.id) return null;
            return (
              <button key={g.id} type="button" onClick={() => setGen(g.id)} {...chip(gen === g.id, AZZURRO)} data-genere={g.id}>
                {g.nome} <span className="opacity-60">{n}</span>
              </button>
            );
          })}
          <button type="button" onClick={() => setSoloPreferiti((x) => !x)} {...chip(soloPreferiti, FUCSIA)} data-testid="solo-preferiti">
            <Heart size={13} /> Preferiti
          </button>
          {filtriAttivi && (
            <button type="button" onClick={azzera} className="inline-flex items-center gap-1 px-2 py-1.5 text-xs text-[var(--tbh-muted)] underline hover:text-white" data-testid="azzera-filtri">
              <X size={12} /> Azzera filtri
            </button>
          )}
          <span className="ml-auto text-xs text-[var(--tbh-muted)]" data-testid="conteggio-social">
            {filtrate.length} {filtrate.length === 1 ? "profilo" : "profili"}
          </span>
        </div>
      </section>

      {q.isLoading && (
        <p className="flex items-center gap-2 text-sm text-[var(--tbh-muted)]">
          <Loader2 size={16} className="animate-spin" /> Carico i profili…
        </p>
      )}
      {q.isError && <p className="text-sm text-[var(--tbh-muted)]">Profili non disponibili in questo momento: riprova tra poco.</p>}

      {d && filtrate.length === 0 && (
        <div className="tbh-card mb-10 p-6 text-center text-sm text-[var(--tbh-muted)]">
          {soloPreferiti && pref.elenco.length === 0 ? "Non hai ancora preferiti: tocca il cuore sulle schede che ti interessano." : "Nessun profilo con questi filtri."}{" "}
          <button type="button" onClick={azzera} className="font-semibold text-[var(--tbh-neon)] underline">
            Mostra tutti
          </button>
        </div>
      )}

      {(d?.categorie ?? []).map((c) => {
        const elenco = filtrate.filter((v) => v.categoria === c.id);
        if (!elenco.length) return null;
        return (
          <section key={c.id} className="mb-10" data-categoria={c.id}>
            <div className="mb-4 flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <h2 className="tbh-display tbh-h3 uppercase" style={{ color: c.id === "partner" ? "var(--tbh-gold)" : "var(--tbh-neon)" }}>
                {c.nome}
              </h2>
              <span className="text-xs text-[var(--tbh-muted)]">
                {elenco.length} {elenco.length === 1 ? "profilo" : "profili"}
              </span>
              {c.id === "partner" && <span className="text-xs text-[var(--tbh-muted)]">· realtà esterne, non proprietà TBH</span>}
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {elenco.map((v) => (
                <CardSocial key={v.id} v={v} nomePiattaforma={nomePiatt.get(v.piattaforma) ?? v.piattaforma} onApri={setAperta} avvisa={avvisa} />
              ))}
            </div>
          </section>
        );
      })}

      <section className="tbh-card flex flex-col gap-4 p-6 md:flex-row md:items-center">
        <div className="grow">
          <h2 className="tbh-display tbh-h3">Un profilo TBH che qui non c'è?</h2>
          <p className="mt-2 max-w-3xl text-sm text-[var(--tbh-muted)]">
            Pubblichiamo solo profili ufficiali con indirizzo verificato: nessun account inventato e nessun numero di follower stimato. Se gestisci un profilo del
            gruppo che manca, mandaci il link.
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap gap-3">
          <a
            href={waInfo("i link dei profili social da pubblicare su TOUCH SOCIAL")}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-xl border border-[var(--tbh-line)] px-5 py-3 text-sm font-semibold hover:border-[var(--tbh-neon)]"
          >
            <MessageCircle size={16} /> Manda il link
          </a>
          <Link to="/allestimento/touch-social" className="tbh-neon-btn px-5 py-3 text-sm">
            Pannello Touch Social
          </Link>
        </div>
      </section>

      <div className="mt-6 flex flex-wrap gap-3">
        <Link to="/contatti" className="rounded-full border border-[var(--tbh-line)] px-4 py-2 text-sm font-semibold hover:border-[var(--tbh-neon)]">
          Contatti telefonici ed email
        </Link>
        <Link to="/channel" className="rounded-full border border-[var(--tbh-line)] px-4 py-2 text-sm font-semibold hover:border-[var(--tbh-neon)]">
          Mosaico dei Channel
        </Link>
        <Link to="/media/libreria" className="rounded-full border border-[var(--tbh-line)] px-4 py-2 text-sm font-semibold hover:border-[var(--tbh-neon)]">
          Canali, radio e TV
        </Link>
        <Link to="/touch-academy" className="rounded-full border border-[var(--tbh-line)] px-4 py-2 text-sm font-semibold hover:border-[var(--tbh-neon)]">
          Touch Academy
        </Link>
      </div>

      <SlotContenuti
        slot="social:pulsanti"
        modo="pulsanti"
        titolo="Profili e link aggiunti dal portale"
        descrizione="Qui si incollano gli indirizzi dei profili che mancano: titolo per esteso, logo e link. Il pulsante compare subito e lo vedono tutti i visitatori."
      />

      {aperta && (
        <AnteprimaSocial
          v={aperta.v}
          apriSu={aperta.su}
          nomePiattaforma={nomePiatt.get(aperta.v.piattaforma) ?? aperta.v.piattaforma}
          nomeCategoria={nomeCat.get(aperta.v.categoria) ?? ""}
          onChiudi={() => setAperta(null)}
        />
      )}
      {nodo}
    </div>
  );
}
