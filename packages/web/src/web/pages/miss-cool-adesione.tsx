import { useCallback, useRef, useState } from "react";
import { Link } from "wouter";
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Info,
  Mail,
  MessageCircle,
  Phone,
  Send,
} from "lucide-react";

import CaricamentoCandidatura, {
  type ManiglieCaricamento,
} from "../components/caricamento-candidatura";
import { useInviaCandidatura, useModuliMissCool } from "../queries/miss-cool";

/* ────────────────────────────────────────────────────────────────────────────
   TOUCH MISS COOL — DOMANDA DI PARTECIPAZIONE (MODULO 01 + 03).

   Questo modulo scrive davvero nel database: non è una stampa da compilare a
   mano. Quattro cose che la pagina fa e dichiara:

   1. I CAMPI NON SONO INVENTATI. L'elenco arriva dal Kit (Modulo 01) via
      servizio: se il Kit aggiunge o toglie un campo, il form cambia da sé.
   2. LE TRE DICHIARAZIONI SONO SBARRAMENTO. Senza 18 anni, regolamento e
      privacy il pulsante non invia — e lo dice prima, non dopo il tentativo.
   3. I SEI CONSENSI SONO SEPARATI, come chiede il Modulo 03. A e F sono
      indispensabili; B, C, D, E sono facoltativi e la pagina scrive per
      ciascuno che cosa si perde dicendo no.
   4. IL MAGGIORE ETÀ LO RICALCOLA IL SERVER dalla data di nascita: la casella
      spuntata non basta (articolo 4).
   ──────────────────────────────────────────────────────────────────────────── */

const BASE = "/eventi/miss-cool";

type Percorso = "live" | "web" | "entrambi";

const PERCORSO_ETICHETTE: { valore: Percorso; titolo: string; cosa: string }[] = [
  { valore: "entrambi", titolo: "Entrambi", cosa: "Tappe live e voto Web" },
  { valore: "live", titolo: "Solo live", cosa: "Casting, tappe, finale" },
  { valore: "web", titolo: "Solo Web", cosa: "Profilo e voto verificato" },
];

/** Stato di tutti i campi testuali del Modulo 01. */
type Campi = Record<string, string>;

export default function MissCoolAdesionePage() {
  const q = useModuliMissCool();
  const invio = useInviaCandidatura();

  const [percorso, setPercorso] = useState<Percorso>("entrambi");
  const [campi, setCampi] = useState<Campi>({});
  const [dich, setDich] = useState({ maggiorenne: false, regolamento: false, privacy: false });
  const [cons, setCons] = useState<Record<string, boolean>>({
    A: false,
    B: false,
    C: false,
    D: false,
    E: false,
    F: false,
  });
  const [errore, setErrore] = useState<string | null>(null);

  /**
   * Maniglie del pannello di caricamento: il token della pratica da mandare insieme
   * al modulo e quanti file sono stati trasferiti. Tenute anche in un riferimento
   * così che `invia()` legga sempre il valore aggiornato.
   */
  const [maniglie, setManiglieStato] = useState<ManiglieCaricamento | null>(null);
  const maniglieRef = useRef<ManiglieCaricamento | null>(null);
  const setManiglie = useCallback((m: ManiglieCaricamento) => {
    maniglieRef.current = m;
    setManiglieStato((p) => (p && p.token === m.token && p.nFile === m.nFile ? p : m));
  }, []);

  const d = q.data;

  if (q.isLoading) {
    return (
      <div className="mx-auto max-w-[900px] px-4 py-16 md:px-8">
        <p className="tbh-body text-[var(--tbh-muted)]">Carico il modulo…</p>
      </div>
    );
  }

  if (q.isError || !d) {
    return (
      <div className="mx-auto max-w-[900px] px-4 py-16 md:px-8">
        <h1 className="tbh-display tbh-h1">DOMANDA DI PARTECIPAZIONE</h1>
        <p className="tbh-body mt-4 text-[var(--tbh-muted)]">
          Il modulo non è raggiungibile in questo momento. Per non perdere la candidatura,
          scrivere ai recapiti della pagina del concorso.
        </p>
        <Link href={BASE} className="tbh-body mt-6 inline-flex items-center gap-2 text-[var(--tbh-neon)]">
          <ArrowLeft className="size-4" /> Torna a Touch Miss Cool
        </Link>
      </div>
    );
  }

  /* ─── SCHERMATA DI CONFERMA ────────────────────────────────────────────── */
  if (invio.isSuccess && invio.data) {
    const esito = invio.data;
    return (
      <div className="mx-auto max-w-[900px] px-4 py-16 md:px-8">
        <div className="rounded-3xl border border-[var(--tbh-neon)]/40 bg-[var(--tbh-neon)]/[0.06] p-8">
          <CheckCircle2 className="size-10 text-[var(--tbh-neon)]" />
          <h1 className="tbh-display tbh-h2 mt-4">CANDIDATURA REGISTRATA</h1>
          <p className="tbh-body mt-3 text-[var(--tbh-muted)]">
            {esito.id !== null
              ? `Registrata con il riferimento interno n. ${esito.id}. Conservalo: è il numero con cui la segreteria ritrova la pratica.`
              : "Registrata. La segreteria prende in carico la pratica."}
          </p>
          <ol className="mt-6 space-y-3">
            {esito.prossimiPassi.map((p, i) => (
              <li key={i} className="flex gap-3">
                <span className="tbh-display shrink-0 text-[15px] text-[var(--tbh-neon)]">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="tbh-body text-[14px] text-[var(--tbh-muted)]">{p}</span>
              </li>
            ))}
          </ol>
          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href={`https://wa.me/${esito.contatti.whatsapp.replace(/[^\d]/g, "")}`}
              target="_blank"
              rel="noreferrer"
              className="tbh-body inline-flex items-center gap-2 rounded-xl border border-white/15 px-4 py-2.5 text-[13px] font-extrabold text-[var(--tbh-fg)] transition hover:border-[var(--tbh-neon)]/60"
            >
              <MessageCircle className="size-4" /> WhatsApp {esito.contatti.whatsapp}
            </a>
            <a
              href={`mailto:${esito.contatti.email}`}
              className="tbh-body inline-flex items-center gap-2 rounded-xl border border-white/15 px-4 py-2.5 text-[13px] font-extrabold text-[var(--tbh-fg)] transition hover:border-[var(--tbh-neon)]/60"
            >
              <Mail className="size-4" /> {esito.contatti.email}
            </a>
          </div>
        </div>
        <Link href={BASE} className="tbh-body mt-8 inline-flex items-center gap-2 text-[var(--tbh-neon)]">
          <ArrowLeft className="size-4" /> Torna a Touch Miss Cool
        </Link>
      </div>
    );
  }

  /* ─── CONTROLLI PRIMA DELL'INVIO ───────────────────────────────────────── */
  const obbligatori = d.adesione.campi.filter((c) => c.obbligatorio);
  const mancanti = obbligatori.filter((c) => !(campi[c.nome] ?? "").trim());
  const tutteDichiarazioni = dich.maggiorenne && dich.regolamento && dich.privacy;
  const consensiMinimi = cons.A && cons.F;
  const puoInviare =
    mancanti.length === 0 && tutteDichiarazioni && consensiMinimi && !invio.isPending;

  function set(nome: string, valore: string) {
    setCampi((p) => ({ ...p, [nome]: valore }));
  }

  function invia() {
    setErrore(null);
    if (!puoInviare) return;
    invio.mutate(
      {
        percorso,
        nome: (campi.nome ?? "").trim(),
        nomeArtistico: (campi.nomeArtistico ?? "").trim() || undefined,
        dataNascita: (campi.dataNascita ?? "").trim(),
        comune: (campi.comune ?? "").trim(),
        telefono: (campi.telefono ?? "").trim(),
        email: (campi.email ?? "").trim(),
        professione: (campi.professione ?? "").trim() || undefined,
        esperienze: (campi.esperienze ?? "").trim() || undefined,
        trasferte: (campi.trasferte ?? "").trim() || undefined,
        ruoli: (campi.ruoli ?? "").trim() || undefined,
        presentazione: (campi.presentazione ?? "").trim() || undefined,
        dichiaraMaggiorenne: dich.maggiorenne,
        accettaRegolamento: dich.regolamento,
        lettaPrivacy: dich.privacy,
        consensoA: cons.A,
        consensoB: cons.B,
        consensoC: cons.C,
        consensoD: cons.D,
        consensoE: cons.E,
        consensoF: cons.F,
        // Il materiale caricato viaggia con la domanda: il server sposta i file
        // sugli slot definitivi della candidatura e chiude la pratica.
        pratica: maniglieRef.current?.token || undefined,
      },
      {
        onSuccess: () => {
          // Pratica chiusa: il pannello si svuota, i file sono ormai della candidatura.
          maniglieRef.current?.azzera();
        },
        onError: (e: unknown) =>
          setErrore(
            e instanceof Error
              ? e.message
              : "Invio non riuscito. Riprova o scrivi ai recapiti del concorso.",
          ),
      },
    );
  }

  return (
    <div className="mx-auto max-w-[900px] px-4 py-10 md:px-8 md:py-16">
      <Link
        href={BASE}
        className="tbh-body inline-flex items-center gap-2 text-[var(--tbh-muted)] transition hover:text-[var(--tbh-fg)]"
      >
        <ArrowLeft className="size-4" /> Touch Miss Cool
      </Link>

      <header className="mt-6">
        <p className="tbh-body text-[11px] font-extrabold uppercase tracking-[0.22em] text-[var(--tbh-neon)]">
          {d.concorso.titolo} · Edizione {d.concorso.edizione} · Modulo 01
        </p>
        <h1 className="tbh-display tbh-h1 mt-2">{d.adesione.titolo}</h1>
        <p className="tbh-body mt-3 max-w-[70ch] text-[var(--tbh-muted)]">
          {d.adesione.sottotitolo} La domanda si invia da qui: arriva alla segreteria allo
          stato «inviata» e da lì segue i passaggi di verifica.
        </p>
      </header>

      <div className="mt-8 flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
        <Info className="mt-0.5 size-5 shrink-0 text-[var(--tbh-neon)]" />
        <p className="tbh-body text-[13px] text-[var(--tbh-muted)]">{d.concorso.notaBozza}</p>
      </div>

      {/* PERCORSO */}
      <section className="mt-10">
        <h2 className="tbh-body text-[12px] font-extrabold uppercase tracking-[0.18em] text-[var(--tbh-fg)]">
          1 · Percorso
        </h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {PERCORSO_ETICHETTE.map((p) => {
            const attivo = percorso === p.valore;
            return (
              <button
                key={p.valore}
                type="button"
                onClick={() => setPercorso(p.valore)}
                className={`rounded-2xl border p-4 text-left transition ${
                  attivo
                    ? "border-[var(--tbh-neon)] bg-[var(--tbh-neon)]/[0.08]"
                    : "border-white/10 bg-white/[0.02] hover:border-white/25"
                }`}
              >
                <p className="tbh-body text-[14px] font-extrabold text-[var(--tbh-fg)]">
                  {p.titolo}
                </p>
                <p className="tbh-body mt-1 text-[12px] text-[var(--tbh-muted)]">{p.cosa}</p>
              </button>
            );
          })}
        </div>
      </section>

      {/* CAMPI DEL MODULO 01 */}
      <section className="mt-10">
        <h2 className="tbh-body text-[12px] font-extrabold uppercase tracking-[0.18em] text-[var(--tbh-fg)]">
          2 · I tuoi dati
        </h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {d.adesione.campi.map((c) => {
            const lungo = c.tipo === "lungo";
            const tipoInput =
              c.tipo === "data"
                ? "date"
                : c.tipo === "email"
                  ? "email"
                  : c.tipo === "telefono"
                    ? "tel"
                    : "text";
            return (
              <div key={c.nome} className={lungo ? "sm:col-span-2" : ""}>
                <label
                  htmlFor={`c-${c.nome}`}
                  className="tbh-body block text-[12px] font-extrabold uppercase tracking-[0.1em] text-[var(--tbh-fg)]"
                >
                  {c.etichetta}
                  {c.obbligatorio && <span className="ml-1 text-[var(--tbh-neon)]">*</span>}
                </label>
                {lungo ? (
                  <textarea
                    id={`c-${c.nome}`}
                    rows={3}
                    value={campi[c.nome] ?? ""}
                    onChange={(e) => set(c.nome, e.target.value)}
                    className="tbh-body mt-2 w-full rounded-xl border border-white/15 bg-black/30 px-3 py-2 text-[14px] text-[var(--tbh-fg)] outline-none transition focus:border-[var(--tbh-neon)]"
                  />
                ) : (
                  <input
                    id={`c-${c.nome}`}
                    type={tipoInput}
                    value={campi[c.nome] ?? ""}
                    onChange={(e) => set(c.nome, e.target.value)}
                    className="tbh-body mt-2 w-full rounded-xl border border-white/15 bg-black/30 px-3 py-2 text-[14px] text-[var(--tbh-fg)] outline-none transition focus:border-[var(--tbh-neon)]"
                  />
                )}
                {c.aiuto && (
                  <p className="tbh-body mt-1.5 text-[12px] text-[var(--tbh-muted)]">{c.aiuto}</p>
                )}
              </div>
            );
          })}

          {/* Presentazione: campo della scheda digitale (slide 06), facoltativo. */}
          <div className="sm:col-span-2">
            <label
              htmlFor="c-presentazione"
              className="tbh-body block text-[12px] font-extrabold uppercase tracking-[0.1em] text-[var(--tbh-fg)]"
            >
              Presentazione
            </label>
            <textarea
              id="c-presentazione"
              rows={4}
              value={campi.presentazione ?? ""}
              onChange={(e) => set("presentazione", e.target.value)}
              className="tbh-body mt-2 w-full rounded-xl border border-white/15 bg-black/30 px-3 py-2 text-[14px] text-[var(--tbh-fg)] outline-none transition focus:border-[var(--tbh-neon)]"
            />
            <p className="tbh-body mt-1.5 text-[12px] text-[var(--tbh-muted)]">
              Il testo che comparirà sulla scheda digitale, se autorizzi la pubblicazione
              (consenso B).
            </p>
          </div>
        </div>
      </section>

      {/* MATERIALE DEL MODULO 02: ora si carica da qui, davvero. */}
      <section className="mt-10">
        <CaricamentoCandidatura
          ambito="miss-cool"
          titolo={`2b · ${d.portfolio.titolo}`}
          introduzione="Le foto e i documenti si caricano da qui: il file viene trasferito subito e resta allegato alla candidatura. Nulla è obbligatorio per inviare la domanda — se preferisci consegnare dopo, con la segreteria, puoi lasciare tutto vuoto."
          onManiglie={setManiglie}
        />
        <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.02] p-5">
          <p className="tbh-body text-[12px] font-extrabold uppercase tracking-[0.14em] text-[var(--tbh-fg)]">
            Materiale previsto dal Kit
          </p>
          <ul className="mt-3 flex flex-wrap gap-2">
            {d.portfolio.materiale.map((m) => (
              <li
                key={m}
                className="tbh-body rounded-full border border-white/12 px-3 py-1 text-[12px] text-[var(--tbh-muted)]"
              >
                {m}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* LE TRE DICHIARAZIONI */}
      <section className="mt-10">
        <h2 className="tbh-body text-[12px] font-extrabold uppercase tracking-[0.18em] text-[var(--tbh-fg)]">
          3 · Dichiarazioni obbligatorie
        </h2>
        <p className="tbh-body mt-2 text-[13px] text-[var(--tbh-muted)]">
          Tutte e tre sono necessarie: senza, la domanda non si invia. Il requisito dei 18
          anni viene comunque ricalcolato dalla data di nascita e verificato su documento.
        </p>
        <div className="mt-4 space-y-2">
          {d.adesione.dichiarazioni.map((x) => {
            const chiave = x.chiave as keyof typeof dich;
            return (
              <label
                key={x.chiave}
                className="flex cursor-pointer items-start gap-3 rounded-xl border border-white/10 bg-white/[0.02] p-4 transition hover:border-white/25"
              >
                <input
                  type="checkbox"
                  checked={dich[chiave]}
                  onChange={(e) => setDich((p) => ({ ...p, [chiave]: e.target.checked }))}
                  className="mt-0.5 size-4 accent-[var(--tbh-neon)]"
                />
                <span className="tbh-body text-[14px] text-[var(--tbh-fg)]">{x.testo}</span>
              </label>
            );
          })}
        </div>
      </section>

      {/* I SEI CONSENSI SEPARATI */}
      <section className="mt-10">
        <h2 className="tbh-body text-[12px] font-extrabold uppercase tracking-[0.18em] text-[var(--tbh-fg)]">
          4 · Consensi separati
        </h2>
        <p className="tbh-body mt-2 max-w-[75ch] text-[13px] text-[var(--tbh-muted)]">
          {d.consensiNota}
        </p>
        <div className="mt-4 space-y-3">
          {d.consensi.map((c) => {
            /* Tre gradi, non due: chiamare «facoltativo» il consenso B mentre il
               suo stesso testo dice che senza non si partecipa al percorso Web
               sarebbe fuorviante. A e F bloccano la candidatura; B e C bloccano
               un percorso; solo D ed E sono davvero senza conseguenze. */
            const necessario = c.lettera === "A" || c.lettera === "F";
            const condizionato = c.lettera === "B" || c.lettera === "C";
            const grado = necessario
              ? "indispensabile"
              : condizionato
                ? c.lettera === "B"
                  ? "serve per il percorso Web"
                  : "serve per casting e tappe live"
                : "facoltativo";
            const dato = cons[c.lettera] ?? false;
            return (
              <label
                key={c.lettera}
                className={`flex cursor-pointer items-start gap-4 rounded-2xl border p-4 transition ${
                  dato
                    ? "border-[var(--tbh-neon)]/40 bg-[var(--tbh-neon)]/[0.05]"
                    : "border-white/10 bg-white/[0.02] hover:border-white/25"
                }`}
              >
                <input
                  type="checkbox"
                  checked={dato}
                  onChange={(e) =>
                    setCons((p) => ({ ...p, [c.lettera]: e.target.checked }))
                  }
                  className="mt-1 size-4 accent-[var(--tbh-neon)]"
                />
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="tbh-display text-[16px] text-[var(--tbh-neon)]">
                      {c.lettera}
                    </span>
                    <span className="tbh-body text-[14px] font-extrabold text-[var(--tbh-fg)]">
                      {c.titolo}
                    </span>
                    <span
                      className={`tbh-body rounded-full px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-[0.12em] ${
                        necessario
                          ? "bg-[var(--tbh-neon)]/15 text-[var(--tbh-neon)]"
                          : condizionato
                            ? "bg-white/12 text-[var(--tbh-fg)]"
                            : "bg-white/8 text-[var(--tbh-muted)]"
                      }`}
                    >
                      {grado}
                    </span>
                  </div>
                  <p className="tbh-body mt-2 text-[13px] text-[var(--tbh-muted)]">
                    {c.finalita}
                  </p>
                  <p className="tbh-body mt-1.5 text-[12px] text-[var(--tbh-muted)]">
                    <span className="font-extrabold text-[var(--tbh-fg)]">Se non lo dai: </span>
                    {c.conseguenza}
                  </p>
                  <p className="tbh-body mt-1 text-[12px] text-[var(--tbh-muted)]">
                    <span className="font-extrabold text-[var(--tbh-fg)]">Revoca: </span>
                    {c.revocabile}
                  </p>
                </div>
              </label>
            );
          })}
        </div>
      </section>

      {/* INVIO */}
      <section className="mt-12 rounded-3xl border border-white/12 bg-white/[0.03] p-6">
        {mancanti.length > 0 && (
          <p className="tbh-body text-[13px] text-[var(--tbh-muted)]">
            Mancano ancora:{" "}
            <span className="font-extrabold text-[var(--tbh-fg)]">
              {mancanti.map((c) => c.etichetta).join(", ")}
            </span>
            .
          </p>
        )}
        {!tutteDichiarazioni && (
          <p className="tbh-body mt-2 text-[13px] text-[var(--tbh-muted)]">
            Servono tutte e tre le dichiarazioni obbligatorie.
          </p>
        )}
        {!consensiMinimi && (
          <p className="tbh-body mt-2 text-[13px] text-[var(--tbh-muted)]">
            Servono almeno il consenso A (gestione della candidatura) e il consenso F
            (comunicazioni organizzative).
          </p>
        )}

        {/* Quanto materiale parte insieme alla domanda: si vede prima di premere invia. */}
        <p className="tbh-body mt-3 text-[13px] text-[var(--tbh-muted)]">
          {maniglie && maniglie.nFile > 0 ? (
            <>
              Insieme alla domanda partono{" "}
              <span className="font-extrabold text-[var(--tbh-neon)]">
                {maniglie.nFile} file
              </span>{" "}
              già caricati. Foto e documenti restano allegati alla candidatura.
            </>
          ) : (
            "Nessun file allegato: la domanda si invia comunque e il materiale si consegna dopo, con la segreteria."
          )}
        </p>

        {errore && (
          <div className="mt-4 flex items-start gap-3 rounded-xl border border-[#ff8a8a]/40 bg-[#ff8a8a]/[0.08] p-4">
            <AlertTriangle className="mt-0.5 size-5 shrink-0 text-[#ff8a8a]" />
            <p className="tbh-body text-[13px] text-[var(--tbh-fg)]">{errore}</p>
          </div>
        )}

        <button
          type="button"
          onClick={invia}
          disabled={!puoInviare}
          className={`tbh-body mt-5 inline-flex items-center gap-2 rounded-xl px-6 py-3 text-[14px] font-extrabold uppercase tracking-[0.08em] transition ${
            puoInviare
              ? "bg-[var(--tbh-neon)] text-black hover:brightness-110"
              : "cursor-not-allowed bg-white/10 text-[var(--tbh-muted)]"
          }`}
        >
          <Send className="size-4" />
          {invio.isPending ? "Invio in corso…" : "Invia la domanda"}
        </button>

        <p className="tbh-body mt-4 text-[12px] text-[var(--tbh-muted)]">
          Preferisci scrivere? {d.concorso.contatti.email} è il recapito attivo delle
          candidature.{" "}
          <a
            href={`mailto:${d.concorso.contatti.email}`}
            className="font-extrabold text-[var(--tbh-neon)]"
          >
            Scrivi alla segreteria casting
          </a>
          .
        </p>
      </section>

      {/* RECAPITI */}
      <section className="mt-8 flex flex-wrap gap-3">
        <a
          href={`https://wa.me/${d.concorso.contatti.whatsapp.replace(/[^\d]/g, "")}`}
          target="_blank"
          rel="noreferrer"
          className="tbh-body inline-flex items-center gap-2 rounded-xl border border-white/15 px-4 py-2.5 text-[13px] text-[var(--tbh-fg)] transition hover:border-[var(--tbh-neon)]/60"
        >
          <MessageCircle className="size-4" /> {d.concorso.contatti.whatsapp}
        </a>
        <a
          href={`tel:${d.concorso.contatti.telefonoItalia.replace(/\s/g, "")}`}
          className="tbh-body inline-flex items-center gap-2 rounded-xl border border-white/15 px-4 py-2.5 text-[13px] text-[var(--tbh-fg)] transition hover:border-[var(--tbh-neon)]/60"
        >
          <Phone className="size-4" /> {d.concorso.contatti.telefonoItalia}
        </a>
      </section>

      <Link
        href={`${BASE}/regolamento`}
        className="tbh-body mt-8 inline-flex items-center gap-2 text-[var(--tbh-neon)]"
      >
        Leggi i 18 articoli del regolamento prima di accettarlo
      </Link>
    </div>
  );
}
