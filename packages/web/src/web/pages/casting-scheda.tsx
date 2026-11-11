import { useCallback, useRef, useState } from "react";
import { Link, useParams } from "wouter";
import {
  AlertTriangle,
  ArrowLeft,
  CalendarClock,
  CheckCircle2,
  Clapperboard,
  Coins,
  MapPin,
  Music4,
  Users,
} from "lucide-react";
import CaricamentoCandidatura, {
  type ManiglieCaricamento,
} from "../components/caricamento-candidatura";
import { useCandidatura, useSchedaCasting } from "../queries/casting";
import { StatoCastingBadge, NOMI_AMBITO_CASTING } from "../components/casting-tbh";

/* ────────────────────────────────────────────────────────────────────────────
   SCHEDA DI UN CASTING + CANDIDATURA ONLINE (Priorità 2quater, punti 5–7).

   Dati mostrati: solo quelli registrati dalla produzione. Compenso, location,
   periodo e scadenza appaiono soltanto se definiti: nessun campo viene riempito
   d'ufficio.

   I file (foto, CV, portfolio, showreel, documenti) si caricano davvero, con lo
   stesso sistema di Touch Miss Cool: all'invio la pratica si chiude e i file
   restano allegati alla candidatura, riservati.

   I CONSENSI sono spunte con la loro etichetta. I testi integrali di informativa
   e liberatorie sono quelli forniti dall'editore: il sito non ne scrive di propri.
   ──────────────────────────────────────────────────────────────────────────── */

const VUOTO = {
  nome: "",
  cognome: "",
  dataNascita: "",
  citta: "",
  telefono: "",
  email: "",
  ruolo: "",
  categoria: "",
  esperienze: "",
  presentazione: "",
  social: "",
  linkShowreel: "",
};

export default function CastingSchedaPage() {
  const { slug = "" } = useParams<{ slug: string }>();
  const q = useSchedaCasting(slug);
  const invio = useCandidatura();

  const [campi, setCampi] = useState<Record<string, string>>({ ...VUOTO });
  const [spunte, setSpunte] = useState<Record<string, boolean>>({});
  const [errore, setErrore] = useState<string | null>(null);

  const [maniglie, setManiglieStato] = useState<ManiglieCaricamento | null>(null);
  const maniglieRef = useRef<ManiglieCaricamento | null>(null);
  const setManiglie = useCallback((m: ManiglieCaricamento) => {
    maniglieRef.current = m;
    setManiglieStato((p) => (p && p.token === m.token && p.nFile === m.nFile ? p : m));
  }, []);

  function set(k: string, v: string) {
    setCampi((p) => ({ ...p, [k]: v }));
  }

  if (q.isLoading) {
    return (
      <div className="mx-auto max-w-[1100px] px-4 py-16 md:px-8">
        <p className="tbh-body text-[var(--tbh-muted)]">Carico il casting…</p>
      </div>
    );
  }

  if (q.isError || !q.data) {
    return (
      <div className="mx-auto max-w-[1100px] px-4 py-16 md:px-8">
        <h1 className="tbh-display tbh-h1">CASTING NON TROVATO</h1>
        <p className="tbh-body mt-4 text-[var(--tbh-muted)]">
          Questo casting non esiste o non è più pubblicato.
        </p>
        <Link
          href="/casting"
          className="tbh-body mt-6 inline-flex items-center gap-2 text-[var(--tbh-neon)]"
        >
          <ArrowLeft className="size-4" /> Tutti i casting
        </Link>
      </div>
    );
  }

  const { casting: c, consensi, consensiNota, categorie } = q.data;
  const immagine = c.locandina ?? c.brano?.cover ?? null;

  /* ─── CONFERMA D'INVIO ──────────────────────────────────────────────────── */
  if (invio.isSuccess && invio.data) {
    return (
      <div className="mx-auto max-w-[900px] px-4 py-16 md:px-8">
        <div className="rounded-3xl border border-[var(--tbh-neon)]/40 bg-[var(--tbh-neon)]/[0.06] p-8">
          <CheckCircle2 className="size-10 text-[var(--tbh-neon)]" />
          <h1 className="tbh-display tbh-h2 mt-4">CANDIDATURA REGISTRATA</h1>
          <p className="tbh-body mt-3 text-[14px]">
            Candidatura n. <b>{invio.data.numero}</b> per <b>{invio.data.casting}</b>.
          </p>
          <p className="tbh-body mt-2 text-[13px] text-[var(--tbh-muted)]">
            {invio.data.materiale.collegato
              ? `${invio.data.materiale.nFile} file allegati alla candidatura.`
              : "Nessun file allegato: il materiale si potrà consegnare alla produzione."}
          </p>
          <p className="tbh-body mt-4 text-[13px] text-[var(--tbh-muted)]">
            La produzione contatta solo i profili selezionati per il provino. Non vengono promessi
            tempi di risposta.
          </p>
          <Link
            href="/casting"
            className="tbh-body mt-6 inline-flex items-center gap-2 text-[var(--tbh-neon)]"
          >
            <ArrowLeft className="size-4" /> Torna ai casting
          </Link>
        </div>
      </div>
    );
  }

  const obbligatori = consensi.filter((x) => x.obbligatorio);
  const mancanti = obbligatori.filter((x) => !spunte[x.k]);
  const contatto = campi.telefono.trim().length > 0 || campi.email.trim().length > 0;
  const puoInviare =
    c.aperto &&
    campi.nome.trim().length > 0 &&
    campi.cognome.trim().length > 0 &&
    campi.ruolo.trim().length > 0 &&
    contatto &&
    mancanti.length === 0 &&
    !invio.isPending;

  function invia() {
    setErrore(null);
    if (!puoInviare) return;
    invio.mutate(
      {
        slug: c.slug,
        ruolo: campi.ruolo.trim(),
        categoria: campi.categoria.trim() || undefined,
        nome: campi.nome.trim(),
        cognome: campi.cognome.trim(),
        dataNascita: campi.dataNascita.trim() || undefined,
        citta: campi.citta.trim() || undefined,
        telefono: campi.telefono.trim() || undefined,
        email: campi.email.trim() || undefined,
        esperienze: campi.esperienze.trim() || undefined,
        presentazione: campi.presentazione.trim() || undefined,
        social: campi.social.trim() || undefined,
        linkShowreel: campi.linkShowreel.trim() || undefined,
        consensi: Object.keys(spunte).filter((k) => spunte[k]),
        tokenCaricamento: maniglieRef.current?.token || undefined,
      },
      {
        onSuccess: () => maniglieRef.current?.azzera(),
        onError: (e: unknown) =>
          setErrore(e instanceof Error ? e.message : "Invio non riuscito. Riprova."),
      },
    );
  }

  return (
    <div className="mx-auto max-w-[1200px] px-4 py-10 md:px-8">
      <Link
        href="/casting"
        className="tbh-body mb-6 inline-flex items-center gap-2 text-[13px] text-[var(--tbh-muted)] hover:text-[var(--tbh-neon)]"
      >
        <ArrowLeft className="size-4" /> Tutti i casting
      </Link>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,340px)_minmax(0,1fr)]">
        {/* LOCANDINA */}
        <div>
          <div className="tbh-card overflow-hidden">
            <div className="aspect-[4/5] w-full bg-black/40">
              {immagine ? (
                <img src={immagine} alt={c.titolo} className="size-full object-cover" />
              ) : (
                <div className="flex size-full flex-col items-center justify-center gap-2 px-6 text-center">
                  <Clapperboard className="size-8 text-[var(--tbh-muted)]" />
                  <p className="tbh-body text-[12px] text-[var(--tbh-muted)]">
                    Locandina non ancora pubblicata
                  </p>
                </div>
              )}
            </div>
          </div>

          {c.brano && (
            <div className="tbh-card mt-4 p-4">
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--tbh-gold)]">
                Brano del progetto
              </p>
              <p className="tbh-body mt-1.5 text-[14px] font-bold">{c.brano.titolo}</p>
              <p className="tbh-body text-[12px] text-[var(--tbh-muted)]">{c.brano.artista}</p>
              {c.brano.audioUrl && (
                <a
                  href={c.brano.audioUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="tbh-body mt-3 inline-flex items-center gap-2 rounded-xl border border-[var(--tbh-line)] px-4 py-2 text-[13px] font-bold hover:border-[var(--tbh-neon)]"
                >
                  <Music4 size={15} /> Ascolta il brano
                </a>
              )}
            </div>
          )}
        </div>

        {/* SCHEDA */}
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <StatoCastingBadge stato={c.stato} />
            <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--tbh-gold)]">
              {NOMI_AMBITO_CASTING[c.ambito] ?? c.ambito}
            </span>
          </div>
          <h1 className="tbh-display tbh-h1 mt-3">{c.titolo}</h1>
          {c.titoloProgetto && (
            <p className="tbh-body mt-2 text-[15px] text-[var(--tbh-muted)]">
              Videoclip: <b className="text-[var(--tbh-fg)]">{c.titoloProgetto}</b>
            </p>
          )}

          {c.descrizione && (
            <p className="tbh-body mt-5 whitespace-pre-line text-[14px]">{c.descrizione}</p>
          )}

          {c.ruoli.length > 0 && (
            <section className="mt-7">
              <h2 className="tbh-display tbh-h3 mb-3">RUOLI RICERCATI</h2>
              <ul className="grid gap-3 sm:grid-cols-2">
                {c.ruoli.map((r, i) => (
                  <li key={`${r.ruolo}-${i}`} className="tbh-card p-4">
                    <p className="tbh-body flex items-center gap-2 text-[14px] font-bold">
                      <Users size={15} className="text-[var(--tbh-neon)]" /> {r.ruolo}
                    </p>
                    {(r.categoria || r.quantita) && (
                      <p className="tbh-body mt-1 text-[12px] text-[var(--tbh-gold)]">
                        {[
                          categorie.find((x) => x.k === r.categoria)
                            ? `${categorie.find((x) => x.k === r.categoria)!.segno} ${
                                categorie.find((x) => x.k === r.categoria)!.nome
                              }`
                            : r.categoria,
                          r.quantita,
                        ]
                          .filter(Boolean)
                          .join(" · ")}
                      </p>
                    )}
                    {r.nota && (
                      <p className="tbh-body mt-1.5 text-[12px] text-[var(--tbh-muted)]">{r.nota}</p>
                    )}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {c.requisiti && (
            <section className="mt-7">
              <h2 className="tbh-display tbh-h3 mb-2">REQUISITI</h2>
              <p className="tbh-body whitespace-pre-line text-[14px]">{c.requisiti}</p>
            </section>
          )}

          <section className="mt-7 grid gap-3 sm:grid-cols-2">
            {c.location && (
              <p className="tbh-body flex items-center gap-2 text-[14px]">
                <MapPin size={16} className="text-[var(--tbh-gold)]" /> {c.location}
              </p>
            )}
            {c.periodo && (
              <p className="tbh-body flex items-center gap-2 text-[14px]">
                <CalendarClock size={16} className="text-[var(--tbh-gold)]" /> {c.periodo}
              </p>
            )}
            {c.scadenza && (
              <p className="tbh-body flex items-center gap-2 text-[14px]">
                <CalendarClock size={16} className="text-[var(--tbh-gold)]" /> Scadenza:{" "}
                {c.scadenza}
              </p>
            )}
            {c.produzione && (
              <p className="tbh-body flex items-center gap-2 text-[14px]">
                <Clapperboard size={16} className="text-[var(--tbh-gold)]" /> {c.produzione}
              </p>
            )}
            {/* Il compenso si pubblica SOLO se la produzione l'ha definito. */}
            {c.compenso && (
              <p className="tbh-body flex items-center gap-2 text-[14px]">
                <Coins size={16} className="text-[var(--tbh-gold)]" /> {c.compenso}
              </p>
            )}
          </section>
        </div>
      </div>

      {/* ─── MODULO DI CANDIDATURA ────────────────────────────────────────── */}
      <section id="candidati" className="mt-14 scroll-mt-24">
        <h2 className="tbh-display tbh-h2">CANDIDATI A QUESTO CASTING</h2>

        {!c.aperto ? (
          <div className="tbh-card mt-4 border-dashed p-6">
            <p className="tbh-body text-[14px] text-[var(--tbh-muted)]">
              Le candidature per questo casting sono chiuse.
            </p>
          </div>
        ) : (
          <>
            <p className="tbh-body mt-3 max-w-3xl text-[14px] text-[var(--tbh-muted)]">
              Compila i tuoi dati, indica il ruolo per cui ti candidi e allega il materiale. I campi
              contrassegnati servono per poterti ricontattare.
            </p>

            <div className="tbh-card mt-6 p-6">
              <h3 className="tbh-display tbh-h3 mb-4">1 · I tuoi dati</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <Campo etichetta="Nome *" v={campi.nome} on={(v) => set("nome", v)} />
                <Campo etichetta="Cognome *" v={campi.cognome} on={(v) => set("cognome", v)} />
                <Campo
                  etichetta="Data di nascita"
                  v={campi.dataNascita}
                  on={(v) => set("dataNascita", v)}
                  segnaposto="gg/mm/aaaa"
                />
                <Campo etichetta="Città" v={campi.citta} on={(v) => set("citta", v)} />
                <Campo etichetta="Telefono" v={campi.telefono} on={(v) => set("telefono", v)} />
                <Campo etichetta="Email" v={campi.email} on={(v) => set("email", v)} />
              </div>
              <p className="tbh-body mt-3 text-[12px] text-[var(--tbh-muted)]">
                Lascia almeno un contatto: telefono o email.
              </p>
            </div>

            <div className="tbh-card mt-5 p-6">
              <h3 className="tbh-display tbh-h3 mb-4">2 · Il ruolo</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="tbh-body text-[12px] font-bold uppercase tracking-[0.12em] text-[var(--tbh-muted)]">
                    Ruolo per cui ti candidi *
                  </label>
                  {c.ruoli.length > 0 ? (
                    <select
                      value={campi.ruolo}
                      onChange={(e) => {
                        const r = c.ruoli.find((x) => x.ruolo === e.target.value);
                        set("ruolo", e.target.value);
                        set("categoria", r?.categoria ?? "");
                      }}
                      className="tbh-body mt-2 w-full rounded-xl border border-white/15 bg-black/30 px-3 py-2 text-[14px] outline-none focus:border-[var(--tbh-neon)]"
                    >
                      <option value="">— scegli —</option>
                      {c.ruoli.map((r, i) => (
                        <option key={`${r.ruolo}-${i}`} value={r.ruolo}>
                          {r.ruolo}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      value={campi.ruolo}
                      onChange={(e) => set("ruolo", e.target.value)}
                      className="tbh-body mt-2 w-full rounded-xl border border-white/15 bg-black/30 px-3 py-2 text-[14px] outline-none focus:border-[var(--tbh-neon)]"
                    />
                  )}
                </div>
                <div>
                  <label className="tbh-body text-[12px] font-bold uppercase tracking-[0.12em] text-[var(--tbh-muted)]">
                    Categoria
                  </label>
                  <select
                    value={campi.categoria}
                    onChange={(e) => set("categoria", e.target.value)}
                    className="tbh-body mt-2 w-full rounded-xl border border-white/15 bg-black/30 px-3 py-2 text-[14px] outline-none focus:border-[var(--tbh-neon)]"
                  >
                    <option value="">— non indicata —</option>
                    {categorie.map((x) => (
                      <option key={x.k} value={x.k}>
                        {x.segno} {x.nome}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="mt-4 grid gap-4">
                <Area
                  etichetta="Esperienze"
                  v={campi.esperienze}
                  on={(v) => set("esperienze", v)}
                />
                <Area
                  etichetta="Presentazione"
                  v={campi.presentazione}
                  on={(v) => set("presentazione", v)}
                />
                <Campo
                  etichetta="Social / portfolio online"
                  v={campi.social}
                  on={(v) => set("social", v)}
                  segnaposto="Instagram, TikTok, sito…"
                />
                <Campo
                  etichetta="Link showreel"
                  v={campi.linkShowreel}
                  on={(v) => set("linkShowreel", v)}
                  segnaposto="YouTube, Vimeo, Drive…"
                />
              </div>
            </div>

            {/* 3 · MATERIALE — caricamento reale, stesso sistema di tutto il sito. */}
            <section className="mt-5">
              <CaricamentoCandidatura
                ambito="casting"
                titolo="3 · Materiale da allegare"
                introduzione="Foto, CV, portfolio e documenti si caricano da qui: il file viene trasferito subito e resta allegato alla candidatura, riservato."
                onManiglie={setManiglie}
              />
            </section>

            {/* 4 · CONSENSI — solo etichette di spunta. I testi arrivano dall'editore. */}
            <div className="tbh-card mt-5 p-6">
              <h3 className="tbh-display tbh-h3 mb-3">4 · Consensi</h3>
              <ul className="space-y-3">
                {consensi.map((x) => (
                  <li key={x.k}>
                    <label className="tbh-body flex cursor-pointer items-start gap-3 text-[13px]">
                      <input
                        type="checkbox"
                        checked={!!spunte[x.k]}
                        onChange={(e) =>
                          setSpunte((p) => ({ ...p, [x.k]: e.target.checked }))
                        }
                        className="mt-0.5 size-4 shrink-0 accent-[var(--tbh-neon)]"
                      />
                      <span>
                        {x.etichetta}
                        {x.obbligatorio ? (
                          <span className="text-[var(--tbh-gold)]"> *</span>
                        ) : null}
                      </span>
                    </label>
                  </li>
                ))}
              </ul>
              <p className="tbh-body mt-4 text-[12px] text-[var(--tbh-muted)]">{consensiNota}</p>
            </div>

            <div className="mt-6">
              {mancanti.length > 0 && (
                <p className="tbh-body text-[13px] text-[var(--tbh-muted)]">
                  Mancano i consensi obbligatori:{" "}
                  <span className="font-extrabold text-[var(--tbh-fg)]">
                    {mancanti.map((m) => m.etichetta).join(", ")}
                  </span>
                  .
                </p>
              )}
              {!contatto && (
                <p className="tbh-body mt-2 text-[13px] text-[var(--tbh-muted)]">
                  Serve almeno un contatto: telefono o email.
                </p>
              )}
              <p className="tbh-body mt-3 text-[13px] text-[var(--tbh-muted)]">
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
                {invio.isPending ? "Invio…" : "Invia la candidatura"}
              </button>
            </div>
          </>
        )}
      </section>
    </div>
  );
}

function Campo({
  etichetta,
  v,
  on,
  segnaposto,
}: {
  etichetta: string;
  v: string;
  on: (v: string) => void;
  segnaposto?: string;
}) {
  return (
    <div>
      <label className="tbh-body text-[12px] font-bold uppercase tracking-[0.12em] text-[var(--tbh-muted)]">
        {etichetta}
      </label>
      <input
        value={v}
        placeholder={segnaposto}
        onChange={(e) => on(e.target.value)}
        className="tbh-body mt-2 w-full rounded-xl border border-white/15 bg-black/30 px-3 py-2 text-[14px] outline-none focus:border-[var(--tbh-neon)]"
      />
    </div>
  );
}

function Area({
  etichetta,
  v,
  on,
}: {
  etichetta: string;
  v: string;
  on: (v: string) => void;
}) {
  return (
    <div>
      <label className="tbh-body text-[12px] font-bold uppercase tracking-[0.12em] text-[var(--tbh-muted)]">
        {etichetta}
      </label>
      <textarea
        rows={4}
        value={v}
        onChange={(e) => on(e.target.value)}
        className="tbh-body mt-2 w-full rounded-xl border border-white/15 bg-black/30 px-3 py-2 text-[14px] outline-none focus:border-[var(--tbh-neon)]"
      />
    </div>
  );
}
