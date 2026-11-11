import { DESTINATARIO_CANDIDATURE } from "../data/annunci-lavoro";

/* ────────────────────────────────────────────────────────────────────────────
   AVVISI E-MAIL (Resend) — condivisi da Candidature lavoro e Casting.

   · Parte SOLO se sul server ci sono RESEND_API_KEY + EMAIL_MITTENTE
     (mittente su dominio verificato, es. notifiche@tibihacca.com).
   · Senza configurazione restituisce false: il sito non finge l'invio e la
     candidatura resta comunque salvata nel pannello di allestimento.
   · Destinatario fisso: lavoro@tibihacca.com.
   ──────────────────────────────────────────────────────────────────────────── */

export function emailConfigurata() {
  return !!(process.env.RESEND_API_KEY ?? "").trim() && !!(process.env.EMAIL_MITTENTE ?? "").trim();
}

function esc(s: string) {
  return s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);
}

export async function avvisaPerEmail(
  oggetto: string,
  righe: [string, string | null][],
  replyTo: string | null,
  nota = "I file allegati sono nel pannello di allestimento.",
) {
  const chiave = (process.env.RESEND_API_KEY ?? "").trim();
  const mittente = (process.env.EMAIL_MITTENTE ?? "").trim();
  if (!chiave || !mittente) return false;
  const corpo = righe
    .filter(([, v]) => v)
    .map(
      ([k, v]) =>
        `<tr><td style="padding:4px 10px;color:#666">${esc(k)}</td><td style="padding:4px 10px">${esc(v!).replace(/\n/g, "<br>")}</td></tr>`,
    )
    .join("");
  try {
    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${chiave}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: mittente,
        to: [DESTINATARIO_CANDIDATURE],
        subject: oggetto,
        html: `<h2>${esc(oggetto)}</h2><table>${corpo}</table><p>${esc(nota)}</p>`,
        ...(replyTo ? { reply_to: replyTo } : {}),
      }),
    });
    return r.ok;
  } catch {
    return false;
  }
}
