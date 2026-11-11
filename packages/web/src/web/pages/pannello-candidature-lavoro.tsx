import { useState } from "react";
import { Link } from "wouter";
import { AlertTriangle, ArrowLeft, Download, FileText, Loader2, Lock } from "lucide-react";
import { SbloccoAllestimento, useCodiceAllestimento } from "../components/media-slot";
import { useCandidatureLavoro, useStatoCandidaturaLavoro } from "../queries/candidature-lavoro";
import type { StatoCandidaturaLavoro } from "../../api/data/annunci-lavoro";

/**
 * PANNELLO — CANDIDATURE ONLINE DELLA BACHECCA LAVORO (04/10/2026).
 * Dati personali: serve il codice di allestimento. Le candidature nascono solo dal
 * modulo pubblico /lavoro-casting/candidati/<annuncio>: qui si leggono, si scaricano
 * i file e si sposta lo stato.
 */

const NOMI_STATO: Record<string, string> = {
  ricevuta: "Ricevuta",
  "da-valutare": "Da valutare",
  contattata: "Contattata",
  colloquio: "Colloquio",
  selezionata: "Selezionata",
  "non-selezionata": "Non selezionata",
};

const CHIP = "tbh-body rounded-full px-3.5 py-1.5 text-[11px] font-extrabold uppercase tracking-[0.1em]";

export default function PannelloCandidatureLavoroPage() {
  const { codice } = useCodiceAllestimento();
  const [annuncio, setAnnuncio] = useState<string>("");
  const q = useCandidatureLavoro(codice, annuncio || undefined);
  const sposta = useStatoCandidaturaLavoro();
  const [note, setNote] = useState<Record<number, string>>({});

  if (!codice) {
    return (
      <div className="mx-auto max-w-[900px] px-4 py-16 md:px-8">
        <h1 className="tbh-display tbh-h1">CANDIDATURE LAVORO</h1>
        <p className="tbh-body mt-3 text-[var(--tbh-muted)]">
          Area riservata: mostra i dati personali di chi si candida. Serve il codice di allestimento.
        </p>
        <div className="mt-6">
          <SbloccoAllestimento />
        </div>
      </div>
    );
  }

  const d = q.data;
  const elenco = d?.candidature ?? [];

  return (
    <div className="mx-auto max-w-[1200px] px-4 py-10 md:px-8">
      <Link
        href="/allestimento"
        className="tbh-body mb-6 inline-flex items-center gap-2 text-[13px] text-[var(--tbh-muted)] hover:text-[var(--tbh-neon)]"
      >
        <ArrowLeft className="size-4" /> Pannello di allestimento
      </Link>
      <h1 className="tbh-display tbh-h1">CANDIDATURE LAVORO</h1>
      <p className="tbh-body mt-2 text-[14px] text-[var(--tbh-muted)]">
        Candidature arrivate dal modulo online degli annunci della bacheca. Destinatario: lavoro@tibihacca.com.
      </p>

      {d && !d.emailConfigurata && (
        <div className="mt-5 flex items-start gap-3 rounded-xl border border-[var(--tbh-gold)]/50 bg-[var(--tbh-gold)]/[0.06] p-4">
          <AlertTriangle className="mt-0.5 size-5 shrink-0 text-[var(--tbh-gold)]" />
          <p className="tbh-body text-[13px]">
            Avviso e-mail non attivo: manca il servizio di posta sul server (RESEND_API_KEY + EMAIL_MITTENTE).
            Le candidature si registrano comunque e si leggono qui.
          </p>
        </div>
      )}

      <div className="mt-6 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setAnnuncio("")}
          className={`${CHIP} ${annuncio === "" ? "bg-[var(--tbh-neon)] text-black" : "border border-[var(--tbh-line)] text-[var(--tbh-muted)]"}`}
        >
          Tutti gli annunci
        </button>
        {(d?.annunci ?? []).map((a) => (
          <button
            key={a.slug}
            type="button"
            onClick={() => setAnnuncio(a.slug)}
            className={`${CHIP} ${annuncio === a.slug ? "bg-[var(--tbh-neon)] text-black" : "border border-[var(--tbh-line)] text-[var(--tbh-muted)]"}`}
          >
            {a.titolo}
          </button>
        ))}
      </div>

      {q.isError ? (
        <p className="tbh-body mt-6 text-sm text-[#ff8a8a]">
          {q.error instanceof Error ? q.error.message : "Lettura non riuscita."}
        </p>
      ) : q.isLoading ? (
        <p className="tbh-body mt-6 inline-flex items-center gap-2 text-sm text-[var(--tbh-muted)]">
          <Loader2 className="size-4 animate-spin" /> Carico le candidature…
        </p>
      ) : elenco.length === 0 ? (
        <p className="tbh-body mt-6 text-sm text-[var(--tbh-muted)]">Nessuna candidatura ricevuta.</p>
      ) : (
        <div className="mt-6 grid gap-4">
          {elenco.map((c) => (
            <div key={c.id} className="rounded-2xl border border-[var(--tbh-line)] p-4">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0 grow basis-[260px]">
                  <p className="tbh-display text-[18px] [overflow-wrap:anywhere]">
                    #{c.id} · {c.nome} {c.cognome}
                  </p>
                  <p className="tbh-body mt-1 text-[13px] text-[var(--tbh-gold)]">
                    {c.titoloAnnuncio}
                    {c.ruolo !== c.titoloAnnuncio ? ` · ${c.ruolo}` : ""}
                  </p>
                  <p className="tbh-body mt-1 text-[13px] text-[var(--tbh-muted)]">
                    {[c.citta, c.zona && `zona: ${c.zona}`, c.dataNascita && `nata/o il ${c.dataNascita}`]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                  <p className="tbh-body mt-1 text-[13px] [overflow-wrap:anywhere]">
                    {c.telefono && (
                      <a href={`tel:${c.telefono}`} className="mr-3 text-[var(--tbh-neon)]">
                        {c.telefono}
                      </a>
                    )}
                    {c.email && (
                      <a href={`mailto:${c.email}`} className="text-[var(--tbh-neon)]">
                        {c.email}
                      </a>
                    )}
                  </p>
                  {(
                    [
                      ["Presentazione", c.presentazione],
                      ["Esperienze", c.esperienze],
                      ["Attrezzatura", c.attrezzatura],
                      ["Disponibilità", c.disponibilita],
                      ["Social", c.social],
                    ] as const
                  ).map(([k, v]) =>
                    v ? (
                      <p key={k} className="tbh-body mt-2 max-w-[75ch] text-[13px] text-[var(--tbh-muted)] [overflow-wrap:anywhere]">
                        <b className="text-[var(--tbh-fg)]">{k}:</b> {v}
                      </p>
                    ) : null,
                  )}
                  {c.linkLavori && (
                    <a
                      href={c.linkLavori}
                      target="_blank"
                      rel="noreferrer"
                      className="tbh-body mt-2 inline-block text-[13px] font-semibold text-[var(--tbh-neon)] [overflow-wrap:anywhere]"
                    >
                      Showreel / lavori →
                    </a>
                  )}
                  {c.files.length > 0 && (
                    <ul className="mt-3 flex flex-wrap gap-2">
                      {c.files.map((f) => (
                        <li key={f.id}>
                          <a
                            href={f.url}
                            target="_blank"
                            rel="noreferrer"
                            className="tbh-body inline-flex items-center gap-1.5 rounded-full border border-[var(--tbh-line)] px-3 py-1 text-[12px] hover:border-[var(--tbh-neon)]"
                          >
                            {f.riservato ? <Lock size={12} /> : <FileText size={12} />}
                            {f.campo} · {f.nome} <Download size={12} />
                          </a>
                        </li>
                      ))}
                    </ul>
                  )}
                  <p className="tbh-body mt-2 text-[11px] text-[var(--tbh-muted)]">
                    Ricevuta il {new Date(c.createdAt).toLocaleString("it-IT")} · avviso e-mail{" "}
                    {c.notificata ? "inviato" : "non inviato"} · consensi: {c.consensi.join(", ") || "—"}
                  </p>
                </div>
                <div className="flex w-full max-w-[320px] flex-col gap-2">
                  <select
                    value={c.stato}
                    onChange={(e) =>
                      sposta.mutate({
                        codice,
                        id: c.id,
                        stato: e.target.value as StatoCandidaturaLavoro,
                      })
                    }
                    className="tbh-body rounded-xl border border-[var(--tbh-line)] bg-black/30 px-3 py-2 text-[13px]"
                  >
                    {(d?.stati ?? []).map((s) => (
                      <option key={s} value={s}>
                        {NOMI_STATO[s] ?? s}
                      </option>
                    ))}
                  </select>
                  <textarea
                    rows={3}
                    placeholder="Note interne"
                    value={note[c.id] ?? c.noteInterne ?? ""}
                    onChange={(e) => setNote((p) => ({ ...p, [c.id]: e.target.value }))}
                    className="tbh-body rounded-xl border border-[var(--tbh-line)] bg-black/30 px-3 py-2 text-[13px]"
                  />
                  <button
                    type="button"
                    onClick={() => sposta.mutate({ codice, id: c.id, noteInterne: note[c.id] ?? "" })}
                    className="tbh-body rounded-full border border-[var(--tbh-line)] px-4 py-2 text-[12px] font-bold uppercase hover:border-[var(--tbh-neon)]"
                  >
                    Salva note
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
