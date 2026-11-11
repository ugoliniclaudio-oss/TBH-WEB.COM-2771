import { useEffect, useMemo, useRef, useState } from "react";
import {
  Camera,
  Check,
  Download,
  Eye,
  FileText,
  Globe,
  Image as ImageIcon,
  Link2,
  Loader2,
  Play,
  Save,
  Trash2,
  Upload,
} from "lucide-react";
import { Link } from "wouter";
import { SbloccoAllestimento, useCodiceAllestimento } from "../components/media-slot";
import { AMBIENTI } from "../lib/ambienti-tbh";
import {
  useCambiaStato,
  useCaricaFileHub,
  useElencoContenuti,
  useEliminaContenuto,
  useImportaUrl,
  useSalvaContenuto,
  useStatoHub,
} from "../queries/hub";

/* ────────────────────────────────────────────────────────────────────────────
   TBH CONTENT HUB — PRE-ALLESTIMENTO (ordine di Claudio del 06/09/2026).

   SORGENTE → PRE-ALLESTIMENTO → CONTROLLO/ANTEPRIMA → RECORD CANONICO
   → HOME · CANALE · VETRINA (si carica una volta, si riusa ovunque).

   Regola non negoziabile: NIENTE PUBBLICAZIONE AUTOMATICA. Un contenuto nasce
   sempre in BOZZA e diventa visibile solo quando lo si porta ad «attivo» a mano.
   ──────────────────────────────────────────────────────────────────────────── */

type Pulsante = { testo: string; url: string };

type Scheda = {
  id: number | null;
  titolo: string;
  tipo: string;
  canale: string;
  categoria: string;
  urlPagina: string;
  sitoUrl: string;
  logoUrl: string;
  immagineUrl: string;
  videoUrl: string;
  documentoUrl: string;
  documentoNome: string;
  pulsanti: Pulsante[];
  testoBreve: string;
  note: string;
  appartenenza: string[];
  stato: string;
};

const VUOTA: Scheda = {
  id: null,
  titolo: "",
  tipo: "altro",
  canale: "",
  categoria: "",
  urlPagina: "",
  sitoUrl: "",
  logoUrl: "",
  immagineUrl: "",
  videoUrl: "",
  documentoUrl: "",
  documentoNome: "",
  pulsanti: [
    { testo: "", url: "" },
    { testo: "", url: "" },
    { testo: "", url: "" },
  ],
  testoBreve: "",
  note: "",
  appartenenza: [],
  stato: "bozza",
};

const TIPI = [
  "altro",
  "societa",
  "attivita",
  "servizio",
  "prodotto",
  "evento",
  "squadra",
  "luogo",
  "media",
  "documento",
] as const;

const STATI: { valore: string; etichetta: string; nota: string }[] = [
  { valore: "bozza", etichetta: "BOZZA", nota: "Solo qui dentro. Non si vede sul sito." },
  { valore: "allestimento", etichetta: "IN ALLESTIMENTO", nota: "Manca ancora materiale." },
  { valore: "attivo", etichetta: "ATTIVO", nota: "Pronto per essere esposto." },
  { valore: "nascosto", etichetta: "NASCOSTO", nota: "Archiviato, resta salvato." },
];

const APPARTENENZE = [
  { valore: "home", etichetta: "HOME" },
  { valore: "canale", etichetta: "CANALE" },
  { valore: "vetrina", etichetta: "VETRINA" },
  { valore: "territorio", etichetta: "TERRITORIO" },
];

const CAMPO =
  "w-full rounded-xl bg-black/50 border border-white/15 px-4 py-3 text-sm outline-none focus:border-[var(--tbh-neon)]";

function Etichetta({ children }: { children: React.ReactNode }) {
  return (
    <span className="block text-[11px] uppercase tracking-[0.18em] text-[var(--tbh-muted)] mb-2">
      {children}
    </span>
  );
}

/** Pulsante grande della barra sorgenti: apre il campo o il selettore file giusto. */
function PulsanteGrande({
  icona,
  titolo,
  nota,
  onClick,
  attivo,
}: {
  icona: React.ReactNode;
  titolo: string;
  nota: string;
  onClick: () => void;
  attivo?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`tbh-card p-4 text-left transition ${
        attivo ? "border-[var(--tbh-neon)]" : "hover:border-white/35"
      }`}
    >
      <span className="flex items-center gap-2 text-[var(--tbh-neon)] mb-2">{icona}</span>
      <span className="block font-bold text-sm leading-tight">{titolo}</span>
      <span className="block text-[11px] text-[var(--tbh-muted)] mt-1 leading-snug">{nota}</span>
    </button>
  );
}

export default function ContentHubPage() {
  const { codice } = useCodiceAllestimento();
  const stato = useStatoHub();
  const [filtro, setFiltro] = useState("");
  const elenco = useElencoContenuti(codice, filtro || undefined);
  const salva = useSalvaContenuto();
  const cambiaStato = useCambiaStato();
  const elimina = useEliminaContenuto();
  const carica = useCaricaFileHub();
  const importa = useImportaUrl();

  const [scheda, setScheda] = useState<Scheda>(VUOTA);
  const [messaggio, setMessaggio] = useState("");
  const [errore, setErrore] = useState("");
  const [anteprima, setAnteprima] = useState(false);
  const [urlDaImportare, setUrlDaImportare] = useState("");
  const [sopra, setSopra] = useState(false);
  const [campoAperto, setCampoAperto] = useState<string>("");

  const refLogo = useRef<HTMLInputElement>(null);
  const refImmagine = useRef<HTMLInputElement>(null);
  const refFoto = useRef<HTMLInputElement>(null);
  const refDocumento = useRef<HTMLInputElement>(null);

  const set = (v: Partial<Scheda>) => setScheda((s) => ({ ...s, ...v }));

  /* CONDIVIDI → TBH-WEB: il telefono passa titolo, testo e link nell'indirizzo. */
  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    const titolo = p.get("titolo") ?? p.get("title") ?? "";
    const testo = p.get("testo") ?? p.get("text") ?? "";
    const url = p.get("url") ?? "";
    if (!titolo && !testo && !url) return;
    const link = url || (/^https?:\/\//i.test(testo) ? testo : "");
    setScheda((s) => ({
      ...s,
      titolo: titolo || s.titolo,
      testoBreve: !/^https?:\/\//i.test(testo) ? testo : s.testoBreve,
      sitoUrl: link || s.sitoUrl,
    }));
    setMessaggio("Contenuto arrivato dalla condivisione del telefono: controlla e salva in bozza.");
  }, []);

  const ambiente = useMemo(
    () => AMBIENTI.find((a) => a.slug === scheda.canale),
    [scheda.canale],
  );
  const categorie = useMemo(() => {
    if (!ambiente) return [];
    return Array.from(new Set(ambiente.pulsanti.map((p) => p.categoria))).sort();
  }, [ambiente]);

  const cartella = (scheda.titolo || "nuovo").toLowerCase().replace(/[^a-z0-9]+/g, "-");

  async function caricaSu(campo: keyof Scheda, file: File | undefined | null, nome?: boolean) {
    if (!file) return;
    setErrore("");
    setMessaggio("");
    try {
      const r = await carica.mutateAsync({ codice, file, cartella });
      set({ [campo]: r.indirizzo, ...(nome ? { documentoNome: r.nome } : {}) } as Partial<Scheda>);
      setMessaggio(`Caricato: ${r.nome}`);
    } catch (e) {
      setErrore(e instanceof Error ? e.message : "Caricamento non riuscito.");
    }
  }

  /** TRASCINA QUI: smista il file nel campo giusto guardando che tipo è. */
  async function accogliFile(file: File) {
    const t = file.type;
    if (t.startsWith("video/")) return caricaSu("videoUrl", file);
    if (t.startsWith("image/")) {
      return caricaSu(scheda.logoUrl ? "immagineUrl" : "logoUrl", file);
    }
    return caricaSu("documentoUrl", file, true);
  }

  function apriRecord(id: number) {
    const item = elenco.data?.items.find((i) => i.id === id);
    if (!item) return;
    const p = [...item.pulsanti];
    while (p.length < 3) p.push({ testo: "", url: "" });
    setScheda({
      id: item.id,
      titolo: item.titolo,
      tipo: item.tipo,
      canale: item.canale ?? "",
      categoria: item.categoria ?? "",
      urlPagina: item.urlPagina ?? "",
      sitoUrl: item.sitoUrl ?? "",
      logoUrl: item.logoUrl ?? "",
      immagineUrl: item.immagineUrl ?? "",
      videoUrl: item.videoUrl ?? "",
      documentoUrl: item.documentoUrl ?? "",
      documentoNome: item.documentoNome ?? "",
      pulsanti: p.slice(0, 3),
      testoBreve: item.testoBreve ?? "",
      note: item.note ?? "",
      appartenenza: item.appartenenza,
      stato: item.stato,
    });
    setMessaggio("");
    setErrore("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function salvaScheda(nuovoStato: string) {
    setErrore("");
    setMessaggio("");
    if (!scheda.titolo.trim()) {
      setErrore("Il titolo è obbligatorio: è il nome del record canonico.");
      return;
    }
    try {
      const r = await salva.mutateAsync({
        codice,
        ...(scheda.id ? { id: scheda.id } : {}),
        titolo: scheda.titolo.trim(),
        tipo: scheda.tipo as (typeof TIPI)[number],
        canale: scheda.canale,
        categoria: scheda.categoria,
        urlPagina: scheda.urlPagina,
        sitoUrl: scheda.sitoUrl,
        logoUrl: scheda.logoUrl,
        immagineUrl: scheda.immagineUrl,
        videoUrl: scheda.videoUrl,
        documentoUrl: scheda.documentoUrl,
        documentoNome: scheda.documentoNome,
        pulsanti: scheda.pulsanti.filter((p) => p.testo.trim() && p.url.trim()),
        testoBreve: scheda.testoBreve,
        note: scheda.note,
        appartenenza: scheda.appartenenza,
        stato: nuovoStato as "bozza" | "allestimento" | "attivo" | "nascosto",
        sorgente: "pannello",
      });
      set({ id: r.id, stato: r.stato });
      setMessaggio(
        nuovoStato === "attivo"
          ? `Salvato e portato ad ATTIVO (record «${r.slug}»).`
          : `Salvato in ${nuovoStato.toUpperCase()} (record «${r.slug}»). Non è pubblicato.`,
      );
    } catch (e) {
      setErrore(e instanceof Error ? e.message : "Salvataggio non riuscito.");
    }
  }

  const conteggi = useMemo(() => {
    const items = elenco.data?.items ?? [];
    return STATI.map((s) => ({
      ...s,
      n: items.filter((i) => i.stato === s.valore).length,
    }));
  }, [elenco.data]);

  const pulsantiPieni = scheda.pulsanti.filter((p) => p.testo.trim() && p.url.trim());

  return (
    <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-10 sm:py-14">
      <p className="text-[11px] uppercase tracking-[0.28em] text-[var(--tbh-gold)]">
        Area riservata · TBH-WEB
      </p>
      <h1 className="tbh-h1 mt-2">TBH CONTENT HUB</h1>
      <p className="tbh-body text-[var(--tbh-muted)] mt-3 max-w-3xl">
        Pre-allestimento di URL, siti, loghi, foto, video, documenti e link esterni. Ogni
        caricamento crea o aggiorna <strong className="text-white">un solo record canonico</strong>,
        che poi alimenta Home, Canale e Vetrina senza essere ricaricato ogni volta.
      </p>
      <p className="mt-4 inline-flex flex-wrap items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-[var(--tbh-muted)]">
        <span>Sorgente</span> → <span>Pre-allestimento</span> → <span>Controllo</span> →{" "}
        <span className="text-[var(--tbh-neon)]">Pubblicazione</span>
      </p>
      <p className="mt-4 text-sm text-[var(--tbh-gold)] border border-[var(--tbh-gold)]/40 rounded-xl px-4 py-3 max-w-3xl">
        Niente viene pubblicato in automatico. Un contenuto nasce in BOZZA e si vede sul sito solo
        quando lo porti tu ad ATTIVO.
      </p>

      <div className="mt-8">
        <SbloccoAllestimento />
      </div>

      {stato.data && !stato.data.attivo && (
        <p className="mt-4 text-sm text-red-400">
          Il Content Hub è spento sul server: manca il codice di allestimento nelle impostazioni.
        </p>
      )}

      {!codice ? (
        <p className="mt-6 text-sm text-[var(--tbh-muted)]">
          Sblocca con il codice per usare il pre-allestimento.{" "}
          <Link href="/allestimento" className="underline hover:text-white">
            Torna al pannello di allestimento
          </Link>
        </p>
      ) : (
        <>
          {/* ── SORGENTI ─────────────────────────────────────────────────── */}
          <h2 className="tbh-h2 mt-12">+ NUOVO CONTENUTO</h2>
          <p className="text-sm text-[var(--tbh-muted)] mt-2">
            Da telefono: fotocamera, galleria o file. Da computer: trascina i file nel riquadro
            qui sotto, oppure incolla un indirizzo.
          </p>

          <div className="mt-5 grid gap-3 [grid-template-columns:repeat(auto-fill,minmax(min(100%,215px),1fr))]">
            <PulsanteGrande
              icona={<Link2 size={20} />}
              titolo="COLLEGA URL"
              nota="Pagina interna del portale o indirizzo esterno"
              attivo={campoAperto === "url"}
              onClick={() => setCampoAperto(campoAperto === "url" ? "" : "url")}
            />
            <PulsanteGrande
              icona={<Globe size={20} />}
              titolo="COLLEGA SITO"
              nota="Sito ufficiale del soggetto"
              attivo={campoAperto === "sito"}
              onClick={() => setCampoAperto(campoAperto === "sito" ? "" : "sito")}
            />
            <PulsanteGrande
              icona={<Upload size={20} />}
              titolo="CARICA LOGO"
              nota="Da computer, galleria o file del telefono"
              onClick={() => refLogo.current?.click()}
            />
            <PulsanteGrande
              icona={<ImageIcon size={20} />}
              titolo="CARICA IMMAGINE"
              nota="Dalla galleria del dispositivo"
              onClick={() => refImmagine.current?.click()}
            />
            <PulsanteGrande
              icona={<Camera size={20} />}
              titolo="SCATTA FOTO"
              nota="Apre la fotocamera del telefono"
              onClick={() => refFoto.current?.click()}
            />
            <PulsanteGrande
              icona={<FileText size={20} />}
              titolo="CARICA DOCUMENTO"
              nota="PDF, Word, Excel, brochure, listino, regolamento"
              onClick={() => refDocumento.current?.click()}
            />
            <PulsanteGrande
              icona={<Play size={20} />}
              titolo="COLLEGA VIDEO"
              nota="YouTube, Vimeo o indirizzo diretto del file"
              attivo={campoAperto === "video"}
              onClick={() => setCampoAperto(campoAperto === "video" ? "" : "video")}
            />
            <PulsanteGrande
              icona={<Link2 size={20} />}
              titolo="PULSANTE ESTERNO"
              nota="Testo + indirizzo: VAI AL SITO, PRENOTA, CANDIDATI…"
              attivo={campoAperto === "pulsanti"}
              onClick={() => setCampoAperto(campoAperto === "pulsanti" ? "" : "pulsanti")}
            />
          </div>

          {/* selettori file nascosti */}
          <input
            ref={refLogo}
            aria-label="Carica logo"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => caricaSu("logoUrl", e.target.files?.[0])}
          />
          <input
            ref={refImmagine}
            aria-label="Carica immagine dalla galleria"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => caricaSu("immagineUrl", e.target.files?.[0])}
          />
          <input
            ref={refFoto}
            aria-label="Scatta foto con la fotocamera"
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={(e) => caricaSu("immagineUrl", e.target.files?.[0])}
          />
          <input
            ref={refDocumento}
            aria-label="Carica documento"
            type="file"
            accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
            className="hidden"
            onChange={(e) => caricaSu("documentoUrl", e.target.files?.[0], true)}
          />

          {/* ── TRASCINA QUI + IMPORTA DA URL ────────────────────────────── */}
          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setSopra(true);
              }}
              onDragLeave={() => setSopra(false)}
              onDrop={(e) => {
                e.preventDefault();
                setSopra(false);
                const f = e.dataTransfer.files?.[0];
                if (f) void accogliFile(f);
              }}
              className={`rounded-2xl border-2 border-dashed p-8 text-center transition ${
                sopra
                  ? "border-[var(--tbh-neon)] bg-[var(--tbh-neon)]/5"
                  : "border-white/20 bg-black/30"
              }`}
            >
              <p className="font-bold tracking-[0.18em] text-sm">TRASCINA QUI</p>
              <p className="text-xs text-[var(--tbh-muted)] mt-2">
                DROP FILE HERE — logo, foto, PDF o documento. Il file va nel campo giusto da solo:
                la prima immagine come logo, la seconda come immagine principale.
              </p>
              {carica.isPending && (
                <p className="text-xs text-[var(--tbh-neon)] mt-3 inline-flex items-center gap-2">
                  <Loader2 size={14} className="animate-spin" /> Caricamento in corso…
                </p>
              )}
            </div>

            <div className="tbh-card p-5">
              <Etichetta>Importa da indirizzo</Etichetta>
              <div className="flex flex-wrap gap-3">
                <input
                  aria-label="Indirizzo da importare"
                  type="url"
                  value={urlDaImportare}
                  onChange={(e) => setUrlDaImportare(e.target.value)}
                  placeholder="https://…"
                  className={`${CAMPO} min-w-[200px] grow`}
                />
                <button
                  type="button"
                  className="tbh-neon-btn px-5 py-3 text-sm disabled:opacity-40"
                  disabled={!urlDaImportare.trim() || importa.isPending}
                  onClick={async () => {
                    setErrore("");
                    try {
                      const r = await importa.mutateAsync({
                        codice,
                        url: urlDaImportare.trim(),
                      });
                      set({
                        titolo: scheda.titolo || r.titoloProposto,
                        ...(r.genere === "video"
                          ? { videoUrl: r.url }
                          : r.genere === "documento"
                            ? { documentoUrl: r.url }
                            : r.genere === "immagine"
                              ? { immagineUrl: r.url }
                              : { sitoUrl: r.url }),
                      });
                      setMessaggio(`Importato da ${r.dominio} come ${r.genere}.`);
                    } catch (e) {
                      setErrore(e instanceof Error ? e.message : "Importazione non riuscita.");
                    }
                  }}
                >
                  Importa
                </button>
              </div>
              <p className="text-[11px] text-[var(--tbh-muted)] mt-3 leading-snug">
                Funziona anche con i link di condivisione di Google Drive, OneDrive e Dropbox. I
                selettori nativi dei tre servizi sono{" "}
                <span className="text-[var(--tbh-gold)]">in allestimento</span>: servono le chiavi
                API degli account.
              </p>
            </div>
          </div>

          {/* ── SCHEDA ───────────────────────────────────────────────────── */}
          <h2 className="tbh-h2 mt-12">SCHEDA CONTENUTO</h2>
          {scheda.id && (
            <p className="text-xs text-[var(--tbh-neon)] mt-2">
              Stai modificando il record n° {scheda.id} — stato attuale:{" "}
              {scheda.stato.toUpperCase()}
            </p>
          )}

          <div className="mt-5 grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(min(100%,280px),1fr))]">
            <label className="block">
              <Etichetta>Titolo per esteso *</Etichetta>
              <input
                aria-label="Titolo del contenuto"
                type="text"
                value={scheda.titolo}
                onChange={(e) => set({ titolo: e.target.value })}
                placeholder="Es. HOTEL AURORA"
                className={CAMPO}
              />
            </label>

            <label className="block">
              <Etichetta>Tipo</Etichetta>
              <select
                aria-label="Tipo di contenuto"
                value={scheda.tipo}
                onChange={(e) => set({ tipo: e.target.value })}
                className={CAMPO}
              >
                {TIPI.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <Etichetta>Canale</Etichetta>
              <select
                aria-label="Canale di appartenenza"
                value={scheda.canale}
                onChange={(e) => set({ canale: e.target.value, categoria: "" })}
                className={CAMPO}
              >
                <option value="">— da scegliere —</option>
                {AMBIENTI.map((a) => (
                  <option key={a.slug} value={a.slug}>
                    {a.numero} · {a.nome}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <Etichetta>Categoria</Etichetta>
              {categorie.length > 0 ? (
                <select
                  aria-label="Categoria"
                  value={scheda.categoria}
                  onChange={(e) => set({ categoria: e.target.value })}
                  className={CAMPO}
                >
                  <option value="">— da scegliere —</option>
                  {categorie.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  aria-label="Categoria"
                  type="text"
                  value={scheda.categoria}
                  onChange={(e) => set({ categoria: e.target.value })}
                  placeholder="Scegli prima il canale, oppure scrivila"
                  className={CAMPO}
                />
              )}
            </label>

            <label className="block">
              <Etichetta>Pagina del portale</Etichetta>
              <input
                aria-label="Pagina del portale"
                type="text"
                value={scheda.urlPagina}
                onChange={(e) => set({ urlPagina: e.target.value })}
                placeholder="/hotel-aurora"
                className={CAMPO}
              />
            </label>

            <label className="block">
              <Etichetta>Sito ufficiale</Etichetta>
              <input
                aria-label="Sito ufficiale"
                type="url"
                value={scheda.sitoUrl}
                onChange={(e) => set({ sitoUrl: e.target.value })}
                placeholder="https://…"
                className={CAMPO}
              />
            </label>

            <label className="block">
              <Etichetta>Logo (indirizzo)</Etichetta>
              <div className="flex gap-2">
                <input
                  aria-label="Indirizzo del logo"
                  type="text"
                  value={scheda.logoUrl}
                  onChange={(e) => set({ logoUrl: e.target.value })}
                  placeholder="Carica o incolla l'indirizzo"
                  className={CAMPO}
                />
                <button
                  type="button"
                  onClick={() => refLogo.current?.click()}
                  className="shrink-0 rounded-xl border border-white/20 px-4 text-xs uppercase tracking-wide hover:border-[var(--tbh-neon)]"
                >
                  Carica
                </button>
              </div>
            </label>

            <label className="block">
              <Etichetta>Immagine principale (indirizzo)</Etichetta>
              <div className="flex gap-2">
                <input
                  aria-label="Indirizzo dell'immagine principale"
                  type="text"
                  value={scheda.immagineUrl}
                  onChange={(e) => set({ immagineUrl: e.target.value })}
                  placeholder="Carica, fotografa o incolla"
                  className={CAMPO}
                />
                <button
                  type="button"
                  onClick={() => refFoto.current?.click()}
                  className="shrink-0 rounded-xl border border-white/20 px-4 text-xs uppercase tracking-wide hover:border-[var(--tbh-neon)]"
                >
                  Foto
                </button>
              </div>
            </label>

            {(campoAperto === "video" || scheda.videoUrl) && (
              <label className="block">
                <Etichetta>Video</Etichetta>
                <input
                  aria-label="Indirizzo del video"
                  type="url"
                  value={scheda.videoUrl}
                  onChange={(e) => set({ videoUrl: e.target.value })}
                  placeholder="https://youtube.com/…"
                  className={CAMPO}
                />
              </label>
            )}

            <label className="block">
              <Etichetta>Documento</Etichetta>
              <div className="flex gap-2">
                <input
                  aria-label="Indirizzo del documento"
                  type="text"
                  value={scheda.documentoUrl}
                  onChange={(e) => set({ documentoUrl: e.target.value })}
                  placeholder="Carica il PDF o incolla l'indirizzo"
                  className={CAMPO}
                />
                <button
                  type="button"
                  onClick={() => refDocumento.current?.click()}
                  className="shrink-0 rounded-xl border border-white/20 px-4 text-xs uppercase tracking-wide hover:border-[var(--tbh-neon)]"
                >
                  Carica
                </button>
              </div>
            </label>

            <label className="block">
              <Etichetta>Nome del documento da scaricare</Etichetta>
              <input
                aria-label="Nome del documento da scaricare"
                type="text"
                value={scheda.documentoNome}
                onChange={(e) => set({ documentoNome: e.target.value })}
                placeholder="Es. Listino 2026"
                className={CAMPO}
              />
            </label>
          </div>

          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <label className="block">
              <Etichetta>Testo breve</Etichetta>
              <textarea
                aria-label="Testo breve"
                value={scheda.testoBreve}
                onChange={(e) => set({ testoBreve: e.target.value })}
                rows={4}
                placeholder="Due righe che spiegano chi è e cosa offre."
                className={CAMPO}
              />
            </label>
            <label className="block">
              <Etichetta>Note interne (non vanno sul sito)</Etichetta>
              <textarea
                aria-label="Note interne"
                value={scheda.note}
                onChange={(e) => set({ note: e.target.value })}
                rows={4}
                placeholder="Cosa manca, chi ha mandato il materiale, cosa verificare."
                className={CAMPO}
              />
            </label>
          </div>

          {/* PULSANTI */}
          <h3 className="tbh-h3 mt-8">PULSANTI DELLA CARD</h3>
          <p className="text-xs text-[var(--tbh-muted)] mt-1">
            Fino a tre. Testo + indirizzo: https://… oppure una pagina interna che inizia con /.
            Senza indirizzo il pulsante non viene creato: nessun bottone morto.
          </p>
          <div className="mt-4 grid gap-3">
            {scheda.pulsanti.map((p, i) => (
              <div key={i} className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
                <input
                  aria-label={`Testo del pulsante ${i + 1}`}
                  type="text"
                  value={p.testo}
                  onChange={(e) => {
                    const v = [...scheda.pulsanti];
                    v[i] = { ...v[i], testo: e.target.value };
                    set({ pulsanti: v });
                  }}
                  placeholder={i === 0 ? "SCOPRI…" : i === 1 ? "RICHIEDI INFORMAZIONI" : "PRENOTA"}
                  className={CAMPO}
                />
                <input
                  aria-label={`Indirizzo del pulsante ${i + 1}`}
                  type="text"
                  value={p.url}
                  onChange={(e) => {
                    const v = [...scheda.pulsanti];
                    v[i] = { ...v[i], url: e.target.value };
                    set({ pulsanti: v });
                  }}
                  placeholder="https://…  oppure  /hotel-aurora"
                  className={CAMPO}
                />
              </div>
            ))}
          </div>

          {/* APPARTENENZA + STATO */}
          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            <div>
              <Etichetta>Appartenenza — dove si espone quando è attivo</Etichetta>
              <div className="flex flex-wrap gap-2">
                {APPARTENENZE.map((a) => {
                  const scelto = scheda.appartenenza.includes(a.valore);
                  return (
                    <label
                      key={a.valore}
                      className={`cursor-pointer rounded-xl border px-4 py-3 text-xs uppercase tracking-wide ${
                        scelto
                          ? "border-[var(--tbh-neon)] text-[var(--tbh-neon)]"
                          : "border-white/20 text-[var(--tbh-muted)]"
                      }`}
                    >
                      <input
                        aria-label={`Appartenenza ${a.etichetta}`}
                        type="checkbox"
                        className="sr-only"
                        checked={scelto}
                        onChange={() =>
                          set({
                            appartenenza: scelto
                              ? scheda.appartenenza.filter((x) => x !== a.valore)
                              : [...scheda.appartenenza, a.valore],
                          })
                        }
                      />
                      {scelto ? "✓ " : ""}
                      {a.etichetta}
                    </label>
                  );
                })}
              </div>
            </div>

            <div>
              <Etichetta>Stato</Etichetta>
              <div className="grid gap-2">
                {STATI.map((s) => (
                  <label
                    key={s.valore}
                    className={`cursor-pointer rounded-xl border px-4 py-3 text-xs ${
                      scheda.stato === s.valore
                        ? "border-[var(--tbh-neon)]"
                        : "border-white/15"
                    }`}
                  >
                    <input
                      aria-label={`Stato ${s.etichetta}`}
                      type="radio"
                      name="stato-contenuto"
                      className="sr-only"
                      checked={scheda.stato === s.valore}
                      onChange={() => set({ stato: s.valore })}
                    />
                    <span className="uppercase tracking-wide font-bold">
                      {scheda.stato === s.valore ? "◉ " : "○ "}
                      {s.etichetta}
                    </span>
                    <span className="block text-[11px] text-[var(--tbh-muted)] mt-1">{s.nota}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* AZIONI */}
          <div className="mt-8 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => void salvaScheda("bozza")}
              disabled={salva.isPending}
              className="rounded-xl border border-white/25 px-6 py-3 text-sm uppercase tracking-wide hover:border-white/60 disabled:opacity-40 inline-flex items-center gap-2"
            >
              <Save size={16} /> Salva bozza
            </button>
            <button
              type="button"
              onClick={() => setAnteprima((v) => !v)}
              className="rounded-xl border border-[var(--tbh-gold)]/60 text-[var(--tbh-gold)] px-6 py-3 text-sm uppercase tracking-wide hover:border-[var(--tbh-gold)] inline-flex items-center gap-2"
            >
              <Eye size={16} /> {anteprima ? "Chiudi anteprima" : "Anteprima"}
            </button>
            <button
              type="button"
              onClick={() => void salvaScheda("attivo")}
              disabled={salva.isPending}
              className="tbh-neon-btn px-6 py-3 text-sm disabled:opacity-40 inline-flex items-center gap-2"
            >
              <Check size={16} /> Pubblica
            </button>
            <button
              type="button"
              onClick={() => {
                setScheda(VUOTA);
                setAnteprima(false);
                setMessaggio("");
                setErrore("");
              }}
              className="rounded-xl border border-white/15 px-6 py-3 text-sm uppercase tracking-wide text-[var(--tbh-muted)] hover:text-white"
            >
              Scheda nuova
            </button>
          </div>

          {messaggio && <p className="mt-4 text-sm text-[var(--tbh-neon)]">{messaggio}</p>}
          {errore && <p className="mt-4 text-sm text-red-400">{errore}</p>}

          {/* ANTEPRIMA */}
          {anteprima && (
            <section className="mt-8">
              <h3 className="tbh-h3">ANTEPRIMA — come esce la card</h3>
              <div className="tbh-card p-5 mt-4 max-w-md">
                <div className="flex items-center gap-3">
                  {scheda.logoUrl ? (
                    <img
                      src={scheda.logoUrl}
                      alt={scheda.titolo || "Logo"}
                      className="h-14 w-14 object-contain bg-black/40 rounded-lg"
                    />
                  ) : (
                    <span className="h-14 w-14 grid place-items-center rounded-lg border border-white/15 text-[10px] text-[var(--tbh-muted)] text-center leading-tight">
                      logo<br />mancante
                    </span>
                  )}
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.18em] text-[var(--tbh-muted)]">
                      {scheda.categoria || scheda.tipo}
                    </p>
                    <p className="font-bold">{scheda.titolo || "Titolo mancante"}</p>
                  </div>
                </div>
                {scheda.immagineUrl && (
                  <img
                    src={scheda.immagineUrl}
                    alt={scheda.titolo || "Immagine"}
                    className="mt-4 w-full rounded-xl object-cover max-h-56"
                  />
                )}
                <p className="text-sm text-[var(--tbh-muted)] mt-4">
                  {scheda.testoBreve || "In allestimento."}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {pulsantiPieni.map((p) => (
                    <span
                      key={p.testo}
                      className="rounded-lg border border-[var(--tbh-neon)]/60 text-[var(--tbh-neon)] px-3 py-2 text-xs uppercase tracking-wide"
                    >
                      {p.testo}
                    </span>
                  ))}
                  {scheda.documentoUrl && (
                    <span className="rounded-lg border border-white/25 px-3 py-2 text-xs uppercase tracking-wide inline-flex items-center gap-2">
                      <Download size={14} /> Scarica documento
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-[var(--tbh-gold)] mt-4">
                  Stato: {scheda.stato.toUpperCase()} — {scheda.stato === "attivo" ? "esposto" : "non esposto sul sito"}
                </p>
              </div>
            </section>
          )}

          {/* ── ELENCO ───────────────────────────────────────────────────── */}
          <h2 className="tbh-h2 mt-14">CONTENUTI IN PRE-ALLESTIMENTO</h2>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <label className="inline-flex items-center gap-2">
              <span className="text-[11px] uppercase tracking-[0.18em] text-[var(--tbh-muted)]">
                Filtra per stato
              </span>
              <select
                aria-label="Filtra per stato"
                value={filtro}
                onChange={(e) => setFiltro(e.target.value)}
                className="rounded-xl bg-black/50 border border-white/15 px-4 py-2 text-sm"
              >
                <option value="">tutti</option>
                {STATI.map((s) => (
                  <option key={s.valore} value={s.valore}>
                    {s.etichetta}
                  </option>
                ))}
              </select>
            </label>
            {conteggi.map((c) => (
              <span key={c.valore} className="text-xs text-[var(--tbh-muted)]">
                {c.etichetta}: <strong className="text-white">{c.n}</strong>
              </span>
            ))}
          </div>

          <div className="mt-5 grid gap-3">
            {elenco.isLoading && <p className="text-sm text-[var(--tbh-muted)]">Carico…</p>}
            {elenco.data && elenco.data.items.length === 0 && (
              <p className="text-sm text-[var(--tbh-muted)]">In allestimento.</p>
            )}
            {elenco.data?.items.map((i) => (
              <div
                key={i.id}
                className="tbh-card p-4 flex flex-wrap items-center gap-3 justify-between"
              >
                <div className="flex items-center gap-3 min-w-0">
                  {i.logoUrl ? (
                    <img
                      src={i.logoUrl}
                      alt={i.titolo}
                      className="h-10 w-10 object-contain bg-black/40 rounded"
                    />
                  ) : (
                    <span className="h-10 w-10 grid place-items-center rounded border border-white/15 text-[10px] text-[var(--tbh-muted)]">
                      —
                    </span>
                  )}
                  <div className="min-w-0">
                    <p className="font-bold truncate">{i.titolo}</p>
                    <p className="text-[11px] text-[var(--tbh-muted)] truncate">
                      n° {i.id} · {i.tipo}
                      {i.canale ? ` · ${i.canale}` : ""} · {i.stato.toUpperCase()}
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => apriRecord(i.id)}
                    className="rounded-lg border border-white/20 px-3 py-2 text-xs uppercase tracking-wide hover:border-white/60"
                  >
                    Apri
                  </button>
                  <select
                    aria-label={`Stato del contenuto ${i.titolo}`}
                    value={i.stato}
                    onChange={(e) =>
                      cambiaStato.mutate({
                        codice,
                        id: i.id,
                        stato: e.target.value as "bozza" | "allestimento" | "attivo" | "nascosto",
                      })
                    }
                    className="rounded-lg bg-black/50 border border-white/20 px-3 py-2 text-xs"
                  >
                    {STATI.map((s) => (
                      <option key={s.valore} value={s.valore}>
                        {s.etichetta}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => elimina.mutate({ codice, id: i.id })}
                    className="rounded-lg border border-red-500/40 text-red-400 px-3 py-2 text-xs uppercase tracking-wide hover:border-red-500 inline-flex items-center gap-1"
                  >
                    <Trash2 size={13} /> Elimina
                  </button>
                </div>
              </div>
            ))}
          </div>

          <p className="mt-10 text-xs text-[var(--tbh-muted)] max-w-3xl leading-relaxed">
            Sul telefono: installa TBH-WEB dal menu del browser («Aggiungi a schermata Home») e poi
            usa Condividi → TBH-WEB per mandare qui un link. La condivisione dei FILE (foto e PDF)
            dalla scheda Condividi è <span className="text-[var(--tbh-gold)]">in allestimento</span>:
            per ora si caricano dai pulsanti qui sopra.
          </p>
        </>
      )}
    </div>
  );
}
