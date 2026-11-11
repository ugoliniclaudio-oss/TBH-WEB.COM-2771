import { Link } from "wouter";
import { Hammer, MessageCircle, Youtube, Phone, Mail } from "lucide-react";
import { useAllestimento } from "../queries/rete";

/**
 * "STIAMO LAVORANDO PER VOI" — pagina di cortesia per ogni sezione non ancora pronta
 * e catch-all del portale. Nessun contenuto inventato: solo contatti reali del gruppo.
 */
export default function InAllestimentoPage() {
  const q = useAllestimento();
  const c = q.data?.contatti;
  const spot = q.data?.spotAVista;

  return (
    <div className="mx-auto max-w-[1100px] px-4 md:px-8 py-16">
      <div className="tbh-card p-7 md:p-12 tbh-rise text-center">
        <span className="inline-flex items-center gap-2 text-[11px] tracking-[0.25em] uppercase text-black bg-[var(--tbh-neon)] px-3 py-1.5 rounded-full">
          <Hammer size={14} /> In allestimento
        </span>

        <h1 className="tbh-display tbh-h1 mt-6">Stiamo lavorando per voi</h1>
        <p className="tbh-body text-[var(--tbh-muted)] max-w-2xl mx-auto mt-4">
          Questa sezione è in costruzione: i contenuti definitivi arrivano nel prossimo
          aggiornamento. Nel frattempo scrivici su WhatsApp — rispondiamo noi, non un bot.
        </p>

        <div className="mt-9 flex flex-wrap justify-center gap-3">
          <a
            href={c?.whatsappUrl ?? "https://wa.me/393792088524"}
            target="_blank"
            rel="noreferrer"
            className="tbh-neon-btn px-6 py-3 flex items-center gap-2"
          >
            <MessageCircle size={18} /> WhatsApp {c?.whatsapp ?? "+39 379 208 8524"}
          </a>

          {spot?.url ? (
            <a
              href={spot.url}
              target="_blank"
              rel="noreferrer"
              className="px-6 py-3 rounded-full border border-[var(--tbh-line)] font-semibold flex items-center gap-2 hover:border-[var(--tbh-neon)]"
            >
              <Youtube size={18} /> Playlist «Spot a Vista»
            </a>
          ) : (
            <span className="px-6 py-3 rounded-full border border-[var(--tbh-line)] text-[var(--tbh-muted)] font-semibold flex items-center gap-2">
              <Youtube size={18} /> Playlist «Spot a Vista» — link da confermare
            </span>
          )}
        </div>

        <div className="mt-10 grid gap-3 sm:grid-cols-3 text-sm">
          <a
            className="rounded-xl border border-[var(--tbh-line)] py-3 flex items-center justify-center gap-2 hover:border-[var(--tbh-neon)]"
            href={`tel:${(c?.telItalia ?? "+39 327 123 7328").replace(/\s/g, "")}`}
          >
            <Phone size={15} /> Italia {c?.telItalia ?? "+39 327 123 7328"}
          </a>
          <a
            className="rounded-xl border border-[var(--tbh-line)] py-3 flex items-center justify-center gap-2 hover:border-[var(--tbh-neon)]"
            href={`tel:${(c?.telEstero ?? "+49 152 2212 3816").replace(/\s/g, "")}`}
          >
            <Phone size={15} /> Estero {c?.telEstero ?? "+49 152 2212 3816"}
          </a>
          <a
            className="rounded-xl border border-[var(--tbh-line)] py-3 flex items-center justify-center gap-2 hover:border-[var(--tbh-neon)]"
            href={`mailto:${c?.email ?? "supporto@touch-business.com"}`}
          >
            <Mail size={15} /> Scrivi una mail
          </a>
        </div>

        <div className="mt-10 flex flex-wrap justify-center gap-2 text-sm">
          {[
            { to: "/shop", label: "Touch Plaza Shop" },
            { to: "/mappa", label: "Mappa del territorio" },
            { to: "/rete-commerciale", label: "Rete commerciale" },
            { to: "/bacheca", label: "Bacheca lavoro" },
          ].map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 font-semibold"
            >
              {l.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
