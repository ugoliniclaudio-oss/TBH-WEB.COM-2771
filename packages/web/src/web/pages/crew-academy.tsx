import { Link } from "wouter";
import {
  MessageCircle,
  GraduationCap,
  BookOpen,
  Wrench,
  Wallet,
  Handshake,
  Sparkles,
  Clapperboard,
  Crown,
  Briefcase,
  Route,
  Camera,
  Truck,
  Users,
  Flame,
} from "lucide-react";
import { useBrandList } from "../queries/tbh";
import { waInfo } from "../lib/whatsapp";
import { pathBrand } from "./pagine-tbh";
import { SezioneAmministrabile } from "../components/sezione-amministrabile";

/**
 * ORDINE 20 · CREW & ACADEMY — richiama le schede Master esistenti (Touch Crew
 * Entertainment, Touch Academy, Touch Spotlight), senza creare copie nuove.
 */
const SLUG_CREW = ["touch-crew-entertainment", "touch-academy", "touch-spotlight"];

export default function CrewAcademyPage() {
  const brand = useBrandList();
  const items = (brand.data?.items ?? []).filter((b) => SLUG_CREW.includes(b.slug));
  const altri = (brand.data?.items ?? []).filter((b) => !SLUG_CREW.includes(b.slug));

  return (
    <div className="mx-auto max-w-[1400px] px-4 md:px-8 py-10">
      <header className="tbh-rise mb-8">
        <p className="text-xs tracking-[0.25em] text-[var(--tbh-gold)] uppercase mb-2">
          Talenti &amp; produzioni
        </p>
        <h1 className="tbh-display tbh-h1">Crew &amp; Academy</h1>
        <p className="tbh-body text-[var(--tbh-muted)] max-w-3xl mt-3">
          Le squadre di lavoro e la formazione del gruppo. Ogni voce apre la sua unica scheda
          ufficiale: nessun doppione, nessuna pagina parallela.
        </p>
      </header>

      {brand.isLoading && <div className="tbh-card h-48 animate-pulse" />}

      <section className="grid gap-5 md:grid-cols-3 mb-12">
        {items.map((b) => (
          <Link
            key={b.slug}
            to={pathBrand(b.slug)}
            className="tbh-card p-6 hover:border-[var(--tbh-neon)] transition"
          >
            {b.logo && (
              <img
                src={b.logo}
                alt={b.name}
                className="w-[140px] max-w-full h-auto mb-4"
                loading="lazy"
              />
            )}
            <h2 className="tbh-display tbh-h2">{b.name}</h2>
            {b.claim && <p className="text-sm text-[var(--tbh-gold)] mt-1">{b.claim}</p>}
            <p className="text-sm text-[var(--tbh-muted)] mt-3">{b.descrizione}</p>
            <span className="mt-4 inline-block text-sm font-semibold text-[var(--tbh-neon)]">
              Apri la scheda
            </span>
          </Link>
        ))}
      </section>

      {/* ORDINE 04/09/2026 — corso TBH High Visibility Scout dentro la Touch Academy.
          Numeri dati da Claudio. Le condizioni (rientro caparra, criteri di qualificazione,
          forma di inserimento dei primi 3) NON sono scritte dal sito: regolamento in consegna. */}
      <section className="tbh-card p-6 md:p-8 mb-12 border-[var(--tbh-gold)]">
        <div className="flex flex-wrap items-center gap-5">
          <img
            src="/brand/hvs-logo.png"
            alt="TBH High Visibility Scout"
            className="w-[180px] max-w-full h-auto"
          />
          <div className="min-w-[240px] flex-1">
            <p className="text-xs tracking-[0.25em] text-[var(--tbh-gold)] uppercase mb-2">
              Touch Academy · percorso HVS
            </p>
            <h2 className="tbh-display tbh-h2">
              Corso TBH High Visibility Scout — 4 settimane
            </h2>
            <p className="tbh-body text-[var(--tbh-muted)] mt-2 max-w-2xl">
              Percorso a pagamento per entrare nella rete scout: Find • Connect • Earn.
            </p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3 mt-6">
          <div className="rounded-2xl border border-[var(--tbh-line)] p-5">
            <p className="text-xs uppercase tracking-widest text-[var(--tbh-muted)]">Durata</p>
            <p className="tbh-display tbh-h3 mt-1">4 settimane</p>
          </div>
          <div className="rounded-2xl border border-[var(--tbh-line)] p-5">
            <p className="text-xs uppercase tracking-widest text-[var(--tbh-muted)]">Quota corso</p>
            <p className="tbh-display tbh-h3 mt-1">72 €</p>
          </div>
          <div className="rounded-2xl border border-[var(--tbh-line)] p-5">
            <p className="text-xs uppercase tracking-widest text-[var(--tbh-muted)]">Caparra</p>
            <p className="tbh-display tbh-h3 mt-1">250 € · 500 € · 1.000 €</p>
          </div>
        </div>

        <ul className="mt-5 space-y-2">
          <li className="tbh-body text-sm">
            • <b>+25%</b> sui clienti acquisiti.
          </li>
          <li className="tbh-body text-sm">
            • <b>Cashback della caparra</b> previsto dal percorso.
          </li>
          <li className="tbh-body text-sm">
            • I <b>primi 3</b> saranno assunti e potranno iniziare a guadagnare da subito.
          </li>
        </ul>

        <p className="text-xs text-[var(--tbh-muted)] mt-4 max-w-3xl">
          Regolamento del percorso (modalità e tempi di rientro della caparra, criteri di
          qualificazione dei contatti, forma di inserimento dei primi 3): <b>in consegna</b>.
        </p>

        <div className="flex flex-wrap gap-3 mt-6">
          <Link to="/hvs#corso" className="tbh-neon-btn px-6 py-3 text-sm inline-flex items-center">
            Apri il corso HVS
          </Link>
          <a
            href={waInfo("Corso TBH High Visibility Scout")}
            target="_blank"
            rel="noreferrer"
            className="px-6 py-3 rounded-xl text-sm font-semibold border border-[var(--tbh-line)] hover:border-[var(--tbh-neon)] inline-flex items-center gap-2"
          >
            <MessageCircle size={16} /> Iscriviti al corso
          </a>
        </div>
      </section>

      {/* ORDINE 04/09/2026 — TOUCH ACADEMY: reclutamento interno + accademia vera
          (scritto, teoria, pratica, poi si guadagna). Nessuna quota o durata inventata:
          dove il dato non è confermato la card lo dichiara. */}
      <section id="touch-academy" className="mb-12">
        <div className="tbh-card p-6 md:p-8">
          <div className="flex flex-wrap items-center gap-4 mb-5">
            <span className="w-12 h-12 rounded-2xl border border-[var(--tbh-gold)] text-[var(--tbh-gold)] flex items-center justify-center shrink-0">
              <GraduationCap size={24} />
            </span>
            <div className="min-w-[240px] flex-1">
              <p className="text-xs tracking-[0.25em] text-[var(--tbh-gold)] uppercase mb-1">
                Reclutamento interno del gruppo
              </p>
              <h2 className="tbh-display tbh-h2">Touch Academy</h2>
            </div>
          </div>

          <p className="tbh-body text-[var(--tbh-muted)] max-w-4xl">
            Un'accademia vera, non un elenco di corsi: si entra, si studia, si fa pratica sul
            campo affiancati da chi lavora già nel gruppo, e poi si lavora e si guadagna. Il
            reclutamento è interno: chi finisce il percorso entra nelle produzioni, negli eventi e
            nei servizi delle società TBH.
          </p>

          {/* le 4 tappe */}
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4 mt-6">
            {[
              {
                n: "01",
                icona: BookOpen,
                titolo: "Scritto",
                testo:
                  "Iscrizione, colloquio conoscitivo e prova scritta: capiamo attitudini, disponibilità e area di destinazione.",
              },
              {
                n: "02",
                icona: GraduationCap,
                titolo: "Teoria",
                testo:
                  "Lezioni sul mestiere: linguaggio, regole di settore, sicurezza, rapporto con il cliente e con il pubblico.",
              },
              {
                n: "03",
                icona: Wrench,
                titolo: "Pratica",
                testo:
                  "Sul campo, in affiancamento: eventi, set, riprese, palchi, sale, allestimenti e logistica reali del gruppo.",
              },
              {
                n: "04",
                icona: Wallet,
                titolo: "Poi si guadagna",
                testo:
                  "Chi supera il percorso entra nelle produzioni e nei servizi TBH e viene retribuito per gli incarichi.",
              },
            ].map((t) => (
              <div key={t.n} className="rounded-2xl border border-[var(--tbh-line)] p-5">
                <div className="flex items-center gap-2 text-[var(--tbh-neon)]">
                  <t.icona size={18} />
                  <span className="text-xs tracking-[0.2em]">{t.n}</span>
                </div>
                <h3 className="tbh-display tbh-h3 mt-2">{t.titolo}</h3>
                <p className="text-sm text-[var(--tbh-muted)] mt-2">{t.testo}</p>
              </div>
            ))}
          </div>

          {/* le aree di reclutamento */}
          <h3 className="tbh-display tbh-h3 mt-10 mb-4">Aree di reclutamento e affiancamento</h3>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {[
              {
                icona: Handshake,
                titolo: "Affiancamento lavorativo",
                testo:
                  "Inserimento guidato accanto a chi già opera nel gruppo, con tutor di riferimento e incarichi progressivi.",
              },
              {
                icona: Sparkles,
                titolo: "Moda",
                testo:
                  "Modelle e modelli, sfilate, shooting, styling, backstage, assistenza sala e vetrina.",
              },
              {
                icona: Clapperboard,
                titolo: "Spettacolo",
                testo:
                  "Conduzione, animazione, palco, casting, corpo di ballo, artisti e performer per eventi e format.",
              },
              {
                icona: Crown,
                titolo: "VIP & ospiti",
                testo:
                  "Accoglienza ospiti, hospitality riservata, accompagnamento e gestione dell'agenda in evento.",
              },
              {
                icona: Briefcase,
                titolo: "Management",
                testo:
                  "Gestione artisti e progetti, contatti commerciali, coordinamento fornitori e rendicontazione.",
              },
              {
                icona: Route,
                titolo: "Turismo, eventi & entertainment",
                testo:
                  "Villaggi, hotel, stabilimenti, locali e feste: accoglienza, booking, animazione e assistenza cliente.",
              },
              {
                icona: Camera,
                titolo: "Crew audiovisiva",
                testo:
                  "Operatori, riprese multicamera, audio, luci, regia, montaggio e contenuti per i canali del gruppo.",
              },
              {
                icona: Truck,
                titolo: "Supporto logistico",
                testo:
                  "Allestimenti, carico e scarico, trasporti, magazzino, attrezzature e assistenza tecnica in loco.",
              },
              {
                icona: Users,
                titolo: "Rete e visibilità",
                testo:
                  "Promozione, PR, contatti sul territorio: il percorso dedicato è TBH High Visibility Scout.",
              },
            ].map((a) => (
              <div key={a.titolo} className="tbh-card p-5">
                <div className="flex items-center gap-2 text-[var(--tbh-gold)]">
                  <a.icona size={18} />
                  <h4 className="tbh-display text-lg leading-tight">{a.titolo}</h4>
                </div>
                <p className="text-sm text-[var(--tbh-muted)] mt-2">{a.testo}</p>
              </div>
            ))}
          </div>

          <p className="text-xs text-[var(--tbh-muted)] mt-6 max-w-3xl">
            Durata, quote e calendario di ogni area: <b>da confermare</b>. Il percorso già
            definito e a listino è il corso TBH High Visibility Scout qui sopra. I corsi
            certificati (AIBES, HACCP, antincendio, BLSD-DAE, salvataggio, cinofila, fitness)
            restano nella sezione formazione a listino.
          </p>

          {/* Corso a calendario con listino proprio, consegnato da Claudio il 15/09/2026. */}
          <Link
            to="/corsi/antincendio-livello-3"
            className="mt-6 tbh-card p-5 flex flex-wrap items-center gap-4 hover:border-[var(--tbh-neon)] transition"
          >
            <span className="w-12 h-12 rounded-2xl border border-[var(--tbh-gold)] text-[var(--tbh-gold)] flex items-center justify-center shrink-0">
              <Flame size={22} />
            </span>
            <div className="min-w-[240px] flex-1">
              <h4 className="tbh-display tbh-h3">
                Corso Addetto Antincendio — Livello 3 (ex Alto Rischio)
              </h4>
              <p className="text-sm text-[var(--tbh-muted)] mt-1">
                16 ore (12 teoria + 4 pratica), esame presso i Vigili del Fuoco, sedi Ravenna,
                Modena e Rimini. Tre formule di partecipazione, max 15 partecipanti.
              </p>
            </div>
            <span className="text-sm font-semibold text-[var(--tbh-neon)]">Apri il corso</span>
          </Link>

          <div className="flex flex-wrap gap-3 mt-6">
            <a
              href={waInfo("Touch Academy — candidatura e reclutamento interno")}
              target="_blank"
              rel="noreferrer"
              className="tbh-neon-btn px-6 py-3 text-sm inline-flex items-center gap-2"
            >
              <MessageCircle size={16} /> Candidati alla Touch Academy
            </a>
            <Link
              to="/lavoro-casting"
              className="px-6 py-3 rounded-xl text-sm font-semibold border border-[var(--tbh-line)] hover:border-[var(--tbh-neon)] inline-flex items-center"
            >
              Annunci e casting aperti
            </Link>
            <Link
              to="/hvs"
              className="px-6 py-3 rounded-xl text-sm font-semibold border border-[var(--tbh-line)] hover:border-[var(--tbh-neon)] inline-flex items-center"
            >
              Percorso High Visibility Scout
            </Link>
          </div>
        </div>
      </section>

      <section className="mb-12">
        <h2 className="tbh-display tbh-h2 mb-4">Collegamenti utili</h2>
        <div className="grid gap-4 md:grid-cols-3">
          <Link to="/lavoro-casting" className="tbh-card p-5 hover:border-[var(--tbh-neon)]">
            <h3 className="tbh-display tbh-h3">Job &amp; Casting</h3>
            <p className="text-sm text-[var(--tbh-muted)] mt-2">
              Annunci reali, candidature e provini.
            </p>
          </Link>
          <Link to="/tbh/produzioni" className="tbh-card p-5 hover:border-[var(--tbh-neon)]">
            <h3 className="tbh-display tbh-h3">Produzioni TBH</h3>
            <p className="text-sm text-[var(--tbh-muted)] mt-2">Chi realizza i contenuti.</p>
          </Link>
          <Link to="/shop" className="tbh-card p-5 hover:border-[var(--tbh-neon)]">
            <h3 className="tbh-display tbh-h3">Corsi &amp; servizi</h3>
            <p className="text-sm text-[var(--tbh-muted)] mt-2">
              Formazione a listino nel Touch Plaza Shop.
            </p>
          </Link>
        </div>
      </section>

      <section className="mb-10">
        <h2 className="tbh-display tbh-h2 mb-4">Altre pagine del gruppo</h2>
        <div className="flex flex-wrap gap-2">
          {altri.map((b) => (
            <Link
              key={b.slug}
              to={pathBrand(b.slug)}
              className="px-4 py-2 rounded-full text-sm font-semibold border border-[var(--tbh-line)] hover:border-[var(--tbh-neon)]"
            >
              {b.name}
            </Link>
          ))}
        </div>
      </section>

      <div className="tbh-card p-6 flex flex-wrap items-center justify-between gap-4">
        <p className="tbh-body max-w-2xl">
          Vuoi entrare nella crew, collaborare o iscriverti a un percorso di formazione?
        </p>
        <a
          href={waInfo("Crew & Academy TBH")}
          target="_blank"
          rel="noreferrer"
          className="tbh-neon-btn px-5 py-3 text-sm inline-flex items-center gap-2"
        >
          <MessageCircle size={16} /> Scrivici su WhatsApp
        </a>
      </div>
      <div className="mt-14 grid gap-12 border-t border-white/10 pt-10">
        <SezioneAmministrabile sezione="touch-academy" />
      </div>
    </div>
  );
}
