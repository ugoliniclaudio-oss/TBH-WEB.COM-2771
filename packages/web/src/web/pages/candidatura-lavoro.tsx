import { useCallback, useRef, useState } from "react";
import { Link, useParams } from "wouter";
import { AlertTriangle, ArrowLeft, CheckCircle2, Mail, MessageCircle, Send } from "lucide-react";
import CaricamentoCandidatura, {
  type ManiglieCaricamento,
} from "../components/caricamento-candidatura";
import { useInviaCandidaturaLavoro, useModuloLavoro } from "../queries/candidature-lavoro";

/* ────────────────────────────────────────────────────────────────────────────
   CANDIDATURA ONLINE — annunci della bacheca lavoro (04/10/2026).

   Claudio: «Voglio il modulo online». Una pagina per annuncio:
   /lavoro-casting/candidati/<annuncio>. Dati + ruolo + file reali (stesso sistema
   di caricamento di Miss Cool e dei casting) + consensi. La candidatura si
   registra nel portale; il pannello la mostra in /allestimento/candidature-lavoro.
   ──────────────────────────────────────────────────────────────────────────── */

const WA = "https://wa.me/393792088524";

const VUOTO = {
  ruolo: "",
  nome: "",
  cognome: "",
  dataNascita: "",
  citta: "",
  zona: "",
  telefono: "",
  email: "",
  esperienze: "",
  presentazione: "",
  attrezzatura: "",
  disponibilita: "",
  social: "",
  linkLavori: "",
};

type Campi = typeof VUOTO;

const ETICHETTA =
  "tbh-body text-[12px] font-bold uppercase tracking-[0.12em] text-[var(--tbh-muted)]";
const INPUT =
  "tbh-body mt-2 w-full min-w-0 rounded-xl border border-white/15 bg-black/30 px-3 py-2.5 text-[15px] outline-none focus:border-[var(--tbh-neon)]";

export default function CandidaturaLavoroPage() {
  const { annuncio = "" } = useParams<{ annuncio: string }>();
  const q = useModuloLavoro(annuncio);
  const invio = useInviaCandidaturaLavoro();

  const [campi, setCampi] = useState<Campi>({ ...VUOTO });
  const [spunte, setSpunte] = useState<Record<string, boolean>>({});
  const [errore, setErrore] = useState<string | null>(null);
  const [maniglie, setManiglieStato] = useState<ManiglieCaricamento | null>(null);
  const maniglieRef = useRef<ManiglieCaricamento | null>(null);
  const setManiglie = useCallback((m: ManiglieCaricamento) => {
    maniglieRef.current = m;
    setManiglieStato((p) => (p && p.token === m.token && p.nFile === m.nFile ? p : m));
  }, []);

  const set = (k: keyof Campi, v: string) => setCampi((p) => ({ ...p, [k]: v }));

  if (q.isLoading) {
    return (
      <div className="mx-auto max-w-[1100px] px-4 py-16 md:px-8">
        <p className="tbh-body text-[var(--tbh-muted)]">Carico il modulo…</p>
      </div>
    );
  }

  if (q.isError || !q.data) {
    return (
      <div className="mx-auto max-w-[1100px] px-4 py-16 md:px-8">
        <h1 className="tbh-display tbh-h1">ANNUNCIO NON TROVATO</h1>
        <p className="tbh-body mt-4 text-[var(--tbh-muted)]">
          Questo annuncio non ha un modulo online o non è più pubblicato.
        </p>
        <Link
          href="/lavoro-casting/bacheca"
          className="tbh-body mt-6 inline-flex items-center gap-2 text-[var(--tbh-neon)]"
        >
          <ArrowLeft className="size-4" /> Bacheca lavoro
        </Link>
      </div>
    );
  }

  const { annuncio: a, consensi, consensiNota, destinatario } = q.data;
  const torna = a.ritorno?.url ?? `/lavoro-casting/bacheca#${a.ancora}`;
  const tornaEtichetta = a.ritorno?.etichetta ?? "Torna all'annuncio";

  if (invio.isSuccess && invio.data) {
    return (
      <div className="mx-auto max-w-[900px] px-4 py-16 md:px-8" data-candidatura-inviata>
        <div className="rounded-3xl border border-[var(--tbh-neon)]/40 bg-[var(--tbh-neon)]/[0.06] p-6 md:p-8">
          <CheckCircle2 className="size-10 text-[var(--tbh-neon)]" />
          <h1 className="tbh-display tbh-h2 mt-4">CANDIDATURA REGISTRATA</h1>
          <p className="tbh-body mt-3 text-[15px]">
            Candidatura n. <b>{invio.data.numero}</b> · <b>{invio.data.annuncio}</b>
            {invio.data.ruolo !== invio.data.annuncio ? ` · ${invio.data.ruolo}` : ""}.
          </p>
          <p className="tbh-body mt-2 text-[14px] text-[var(--tbh-muted)]">
            {invio.data.nFile > 0
              ? `${invio.data.nFile} file allegati alla candidatura.`
              : "Nessun file allegato: CV e materiale si possono inviare anche via e-mail."}
          </p>
          <p className="tbh-body mt-4 text-[14px] text-[var(--tbh-muted)]">
            La selezione contatta i profili in linea con la posizione. Per informazioni:{" "}
            <a href={`mailto:${destinatario}`} className="text-[var(--tbh-neon)]">
              {destinatario}
            </a>
            .
          </p>
          <Link
            href={torna}
            className="tbh-body mt-6 inline-flex items-center gap-2 text-[var(--tbh-neon)]"
          >
            <ArrowLeft className="size-4" /> {tornaEtichetta}
          </Link>
        </div>
      </div>
    );
  }

  const conRuoli = a.ruoli.length > 0;
  const extra = new Set(a.extra);
  const mancanti = consensi.filter((x) => x.obbligatorio && !spunte[x.k]);
  const contatto = campi.telefono.trim().length > 0 || campi.email.trim().length > 0;
  const puoInviare =
    campi.nome.trim().length > 0 &&
    campi.cognome.trim().length > 0 &&
    (!conRuoli || campi.ruolo.length > 0) &&
    contatto &&
    mancanti.length === 0 &&
    !invio.isPending;

  function invia() {
    setErrore(null);
    if (!puoInviare) return;
    const t = (s: string) => s.trim() || undefined;
    invio.mutate(
      {
        annuncio: a.slug,
        ruolo: campi.ruolo,
        nome: campi.nome.trim(),
        cognome: campi.cognome.trim(),
        dataNascita: t(campi.dataNascita),
        citta: t(campi.citta),
        zona: t(campi.zona),
        telefono: t(campi.telefono),
        email: t(campi.email),
        esperienze: t(campi.esperienze),
        presentazione: t(campi.presentazione),
        attrezzatura: t(campi.attrezzatura),
        disponibilita: t(campi.disponibilita),
        social: t(campi.social),
        linkLavori: t(campi.linkLavori),
        consensi: Object.keys(spunte).filter((k) => spunte[k]),
        tokenCaricamento: maniglieRef.current?.token || undefined,
      },
      {
        onSuccess: () => {
          maniglieRef.current?.azzera();
          window.scrollTo({ top: 0 });
        },
        onError: (e: unknown) =>
          setErrore(e instanceof Error ? e.message : "Invio non riuscito. Riprova."),
      },
    );
  }

  return (
    <div className="mx-auto max-w-[1200px] px-4 py-8 md:px-8 md:py-10" data-modulo-lavoro={a.slug}>
      <Link
        href={torna}
        className="tbh-body mb-6 inline-flex items-center gap-2 text-[13px] text-[var(--tbh-muted)] hover:text-[var(--tbh-neon)]"
      >
        <ArrowLeft className="size-4" /> {tornaEtichetta}
      </Link>

      {/* Testata: locandina ufficiale + titolo dell'annuncio */}
      <div className="grid gap-6 md:grid-cols-[minmax(0,340px)_minmax(0,1fr)] items-start">
        {a.locandina ? (
          <Link href={torna} className="block overflow-hidden rounded-2xl border border-[var(--tbh-line)]">
            <img
              src={a.locandina}
              alt={a.titolo}
              className="w-full h-auto object-contain bg-black"
              loading="eager"
            />
          </Link>
        ) : (
          <Link
            href={torna}
            className="flex aspect-[4/5] max-h-[340px] w-full flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-[var(--tbh-line)] bg-black p-6 text-center"
          >
            <span className="tbh-display text-2xl text-[var(--tbh-neon)]">{a.oggetto}</span>
            <span className="tbh-body text-[12px] uppercase tracking-[0.16em] text-[var(--tbh-muted)]">
              Locandina ufficiale in allestimento
            </span>
          </Link>
        )}
        <div className="min-w-0">
          <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--tbh-gold)]">
            Candidatura online · Bacheca lavoro TBH
          </span>
          <h1 className="tbh-display tbh-h1 mt-2 [overflow-wrap:anywhere]">{a.titolo.toUpperCase()}</h1>
          <p className="tbh-body mt-2 text-[16px] text-[var(--tbh-muted)]">{a.sottotitolo}</p>
          <div className="tbh-card mt-5 p-4">
            <p className="tbh-body text-[13px] font-bold uppercase tracking-[0.12em] text-[var(--tbh-neon)]">
              L'annuncio chiede
            </p>
            <ul className="tbh-body mt-2 flex flex-wrap gap-2">
              {a.daInviare.map((d) => (
                <li
                  key={d}
                  className="rounded-full border border-[var(--tbh-line)] px-3 py-1 text-[13px]"
                >
                  {d}
                </li>
              ))}
            </ul>
          </div>
          <p className="tbh-body mt-4 text-[13px] text-[var(--tbh-muted)]">
            Preferisci l'e-mail? Scrivi a{" "}
            <a
              href={`mailto:${destinatario}?subject=${encodeURIComponent(a.oggetto)}`}
              className="text-[var(--tbh-neon)]"
            >
              {destinatario}
            </a>{" "}
            con oggetto «{a.oggetto}».
          </p>
        </div>
      </div>

      {/* 1 · DATI */}
      <div className="tbh-card mt-8 p-5 md:p-6">
        <h2 className="tbh-display tbh-h3 mb-4">1 · I tuoi dati</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Campo etichetta="Nome *" v={campi.nome} on={(v) => set("nome", v)} auto="given-name" />
          <Campo etichetta="Cognome *" v={campi.cognome} on={(v) => set("cognome", v)} auto="family-name" />
          <Campo
            etichetta="Data di nascita"
            v={campi.dataNascita}
            on={(v) => set("dataNascita", v)}
            segnaposto="gg/mm/aaaa"
          />
          <Campo etichetta="Città" v={campi.citta} on={(v) => set("citta", v)} auto="address-level2" />
          <Campo etichetta="Telefono" v={campi.telefono} on={(v) => set("telefono", v)} tipo="tel" auto="tel" />
          <Campo etichetta="Email" v={campi.email} on={(v) => set("email", v)} tipo="email" auto="email" />
        </div>
        <p className="tbh-body mt-3 text-[12px] text-[var(--tbh-muted)]">
          Lascia almeno un contatto: telefono o email.
        </p>
      </div>

      {/* 2 · POSIZIONE */}
      <div className="tbh-card mt-5 p-5 md:p-6">
        <h2 className="tbh-display tbh-h3 mb-4">2 · La posizione</h2>
        {conRuoli ? (
          <fieldset>
            <legend className={ETICHETTA}>Ruolo per cui ti candidi *</legend>
            <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {a.ruoli.map((r) => {
                const scelto = campi.ruolo === r;
                return (
                  <button
                    key={r}
                    type="button"
                    onClick={() => set("ruolo", r)}
                    aria-pressed={scelto}
                    className={`tbh-body rounded-xl border px-4 py-3 text-left text-[14px] font-semibold transition ${
                      scelto
                        ? "border-[var(--tbh-neon)] bg-[var(--tbh-neon)] text-black"
                        : "border-[var(--tbh-line)] hover:border-[var(--tbh-neon)]"
                    }`}
                  >
                    {r}
                  </button>
                );
              })}
            </div>
          </fieldset>
        ) : (
          <p className="tbh-body text-[15px]">
            Posizione: <b>{a.titolo}</b>
          </p>
        )}

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          {extra.has("zona") && (
            <Campo
              etichetta="Zona di disponibilità"
              v={campi.zona}
              on={(v) => set("zona", v)}
              segnaposto="es. Rimini e provincia"
            />
          )}
          {extra.has("disponibilita") && (
            <Campo
              etichetta="Disponibilità (weekend, trasferte)"
              v={campi.disponibilita}
              on={(v) => set("disponibilita", v)}
            />
          )}
        </div>
        <div className="mt-4 grid gap-4">
          <Area etichetta="Breve presentazione" v={campi.presentazione} on={(v) => set("presentazione", v)} />
          <Area etichetta="Esperienze" v={campi.esperienze} on={(v) => set("esperienze", v)} />
          {extra.has("attrezzatura") && (
            <Area
              etichetta="Attrezzatura disponibile"
              v={campi.attrezzatura}
              on={(v) => set("attrezzatura", v)}
            />
          )}
          <div className="grid gap-4 sm:grid-cols-2">
            <Campo
              etichetta="Social / profilo online"
              v={campi.social}
              on={(v) => set("social", v)}
              segnaposto="Instagram, TikTok, LinkedIn…"
            />
            {extra.has("linkLavori") && (
              <Campo
                etichetta="Link showreel / lavori precedenti"
                v={campi.linkLavori}
                on={(v) => set("linkLavori", v)}
                segnaposto="YouTube, Vimeo, Drive…"
              />
            )}
          </div>
        </div>
      </div>

      {/* 3 · FILE — caricamento reale */}
      <section className="mt-5">
        <CaricamentoCandidatura
          ambito="lavoro"
          titolo="3 · CV, foto e materiale"
          introduzione="Il file viene trasferito subito e resta allegato alla candidatura. CV e documenti restano riservati."
          onManiglie={setManiglie}
        />
      </section>

      {/* 4 · CONSENSI */}
      <div className="tbh-card mt-5 p-5 md:p-6">
        <h2 className="tbh-display tbh-h3 mb-3">4 · Consensi</h2>
        <ul className="space-y-3">
          {consensi.map((x) => (
            <li key={x.k}>
              <label className="tbh-body flex cursor-pointer items-start gap-3 text-[14px]">
                <input
                  type="checkbox"
                  checked={!!spunte[x.k]}
                  onChange={(e) => setSpunte((p) => ({ ...p, [x.k]: e.target.checked }))}
                  className="mt-0.5 size-5 shrink-0 accent-[var(--tbh-neon)]"
                />
                <span>
                  {x.etichetta}
                  {x.obbligatorio ? <span className="text-[var(--tbh-gold)]"> *</span> : null}
                </span>
              </label>
            </li>
          ))}
        </ul>
        <p className="tbh-body mt-4 text-[12px] text-[var(--tbh-muted)]">{consensiNota}</p>
      </div>

      {/* INVIO */}
      <div className="mt-6">
        {conRuoli && !campi.ruolo && (
          <p className="tbh-body text-[13px] text-[var(--tbh-muted)]">Scegli il ruolo per cui ti candidi.</p>
        )}
        {!contatto && (
          <p className="tbh-body mt-1 text-[13px] text-[var(--tbh-muted)]">
            Serve almeno un contatto: telefono o email.
          </p>
        )}
        {mancanti.length > 0 && (
          <p className="tbh-body mt-1 text-[13px] text-[var(--tbh-muted)]">
            Mancano i consensi obbligatori: <b>{mancanti.map((m) => m.etichetta).join(", ")}</b>.
          </p>
        )}
        <p className="tbh-body mt-2 text-[13px] text-[var(--tbh-muted)]">
          {maniglie && maniglie.nFile > 0
            ? `Insieme alla candidatura partono ${maniglie.nFile} file già caricati.`
            : "Nessun file allegato: la candidatura si invia comunque."}
        </p>

        {errore && (
          <div className="mt-4 flex items-start gap-3 rounded-xl border border-[#ff8a8a]/40 bg-[#ff8a8a]/[0.08] p-4">
            <AlertTriangle className="mt-0.5 size-5 shrink-0 text-[#ff8a8a]" />
            <p className="tbh-body text-[13px]">{errore}</p>
          </div>
        )}

        <div className="mt-5 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={invia}
            disabled={!puoInviare}
            data-invia-candidatura
            className={`tbh-body inline-flex items-center gap-2 rounded-full px-6 py-3 text-[14px] font-extrabold uppercase tracking-[0.08em] transition ${
              puoInviare
                ? "bg-[var(--tbh-neon)] text-black hover:brightness-110"
                : "cursor-not-allowed bg-white/10 text-[var(--tbh-muted)]"
            }`}
          >
            <Send size={16} /> {invio.isPending ? "Invio…" : "Invia la candidatura"}
          </button>
          <a
            href={`mailto:${destinatario}?subject=${encodeURIComponent(a.oggetto)}`}
            className="tbh-body inline-flex items-center gap-2 rounded-full border border-[var(--tbh-line)] px-5 py-3 text-[14px] font-semibold hover:border-[var(--tbh-neon)]"
          >
            <Mail size={16} /> Via e-mail
          </a>
          <a
            href={`${WA}?text=${encodeURIComponent(`${a.oggetto} — vorrei informazioni.`)}`}
            target="_blank"
            rel="noreferrer"
            className="tbh-body inline-flex items-center gap-2 rounded-full border border-[var(--tbh-line)] px-5 py-3 text-[14px] font-semibold hover:border-[var(--tbh-neon)]"
          >
            <MessageCircle size={16} /> Informazioni
          </a>
        </div>
      </div>
    </div>
  );
}

function Campo({
  etichetta,
  v,
  on,
  segnaposto,
  tipo = "text",
  auto,
}: {
  etichetta: string;
  v: string;
  on: (v: string) => void;
  segnaposto?: string;
  tipo?: string;
  auto?: string;
}) {
  return (
    <label className="block min-w-0">
      <span className={ETICHETTA}>{etichetta}</span>
      <input
        type={tipo}
        value={v}
        placeholder={segnaposto}
        autoComplete={auto}
        onChange={(e) => on(e.target.value)}
        className={INPUT}
      />
    </label>
  );
}

function Area({ etichetta, v, on }: { etichetta: string; v: string; on: (v: string) => void }) {
  return (
    <label className="block min-w-0">
      <span className={ETICHETTA}>{etichetta}</span>
      <textarea rows={4} value={v} onChange={(e) => on(e.target.value)} className={INPUT} />
    </label>
  );
}
