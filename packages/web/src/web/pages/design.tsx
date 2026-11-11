import { LogoBox, ProductCard, LinkTile, euro } from "../components/tiles";
import { Ticker } from "../components/layout";
import { Check, X } from "lucide-react";
import { LOGHI_CHANNEL } from "../../api/data/loghi-channel";

const COLORS = [
  { token: "--tbh-black", hex: "#0a0a0b", use: "Fondo primario", dark: true },
  { token: "--tbh-surface", hex: "#141417", use: "Card, superfici", dark: true },
  { token: "--tbh-line", hex: "#26262b", use: "Bordi", dark: true },
  { token: "--tbh-neon", hex: "#e8ff00", use: "Accento primario · CTA · prezzi", dark: false },
  { token: "--tbh-gold", hex: "#d4af37", use: "Didascalie · premium", dark: false },
  { token: "--tbh-platinum", hex: "#dfe3e8", use: "Testo forte", dark: false },
  { token: "--tbh-muted", hex: "#8b8b96", use: "Testo secondario", dark: true },
];

const TYPE = [
  { cls: "tbh-display tbh-h1", label: "Display H1 · Anton", spec: "clamp(2.4rem → 5.5rem)", text: "Touch Plaza Shop" },
  { cls: "tbh-display tbh-h2", label: "Display H2 · Anton", spec: "clamp(1.7rem → 3rem)", text: "Squadre partner" },
  { cls: "tbh-display tbh-h3", label: "Display H3 · Anton", spec: "clamp(1.1rem → 1.5rem)", text: "Kit aggregazione business" },
  { cls: "tbh-body", label: "Body · Poppins 400", spec: "clamp(1rem → 1.15rem) · line-height 1.6", text: "Prodotti, servizi, kit e corsi del gruppo Touch Business Holding. Prezzi reali, pagamento con carta." },
  { cls: "text-xs tracking-[0.25em] uppercase text-[var(--tbh-gold)]", label: "Eyebrow · Poppins 500", spec: "12px · letter-spacing 0.25em · oro", text: "United by passion, driven by values" },
];

const DO = [
  "Layout tipo negozio: griglia pulita, ordinata, con respiro fra le card",
  "Logo grande + titolo per esteso su ogni riferimento (società, attività, squadra, prodotto)",
  "Tipografia fluida con clamp(): leggibile su TV, desktop, tablet, smartphone — mai bisogno di zoom",
  'Dove manca il dato reale si scrive "In allestimento", mai contenuto finto',
  "Accento neon solo su CTA e prezzi; oro/platino per le didascalie",
];

const DONT = [
  "Gradienti viola su bianco",
  "Griglie di card tutte identiche senza gerarchia",
  "Loghi micro, compressi o tagliati",
  "Font sovraesposti (Inter, Space Grotesk, Roboto)",
  "Spazi vuoti al posto di un logo mancante",
];

function Section({
  n,
  title,
  sub,
  children,
}: {
  n: string;
  title: string;
  sub?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="py-12 border-t border-[var(--tbh-line)]">
      <div className="flex items-baseline gap-4 mb-2">
        <span className="tbh-display text-[var(--tbh-neon)] text-xl">{n}</span>
        <h2 className="tbh-display tbh-h2">{title}</h2>
      </div>
      {sub && <p className="text-[var(--tbh-muted)] max-w-3xl mb-8">{sub}</p>}
      {children}
    </section>
  );
}

export default function DesignPage() {
  return (
    <div className="mx-auto max-w-[1500px] px-4 md:px-8 py-10">
      <header className="tbh-rise">
        <p className="text-xs tracking-[0.25em] text-[var(--tbh-gold)] uppercase mb-3">
          design.md · direzione visiva · 28.08.2026
        </p>
        <h1 className="tbh-display tbh-h1">
          TBH-WEB
          <br />
          <span className="text-[var(--tbh-neon)]">Design System</span>
        </h1>
        <p className="tbh-body text-[var(--tbh-muted)] max-w-3xl mt-4">
          Il documento <code>design.md</code> reso navigabile: colori, tipografia, componenti e regole
          applicate al sito. Ogni elemento qui sotto è il componente reale usato in produzione, non un
          mockup.
        </p>
        <div className="flex flex-wrap gap-3 mt-6">
          {["Layout tipo negozio", "Loghi grandi", "Zero zoom", "Zero contenuti finti"].map((t) => (
            <span
              key={t}
              className="px-4 py-2 rounded-full border border-[var(--tbh-line)] text-sm font-semibold"
            >
              {t}
            </span>
          ))}
        </div>
      </header>

      <Section
        n="01"
        title="Colori"
        sub="Fondo nero dominante. Neon giallo usato con parsimonia — solo CTA e prezzi. Oro e platino per didascalie e testo forte."
      >
        <div className="grid gap-5 grid-cols-2 md:grid-cols-4 xl:grid-cols-7">
          {COLORS.map((c) => (
            <div key={c.token} className="tbh-card overflow-hidden">
              <div
                className="h-28 border-b border-[var(--tbh-line)]"
                style={{ background: c.hex }}
              />
              <div className="p-4">
                <div className="tbh-display text-lg">{c.hex}</div>
                <code className="block text-[11px] text-[var(--tbh-neon)] break-all">{c.token}</code>
                <p className="text-xs text-[var(--tbh-muted)] mt-2">{c.use}</p>
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section
        n="02"
        title="Tipografia"
        sub="Anton per display (titoli, numeri, prezzi — impatto da insegna). Poppins per il corpo. Scala fluida su clamp(), line-height 1.6."
      >
        <div className="space-y-8">
          {TYPE.map((t) => (
            <div key={t.label} className="tbh-card p-6">
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <span className="text-xs tracking-[0.2em] uppercase text-[var(--tbh-gold)]">
                  {t.label}
                </span>
                <code className="text-[11px] text-[var(--tbh-muted)]">{t.spec}</code>
              </div>
              <div className={t.cls}>{t.text}</div>
            </div>
          ))}
        </div>
      </Section>

      <Section
        n="03"
        title="Ticker / gobbo"
        sub="Testo scorrevole con offerte e novità. Presente sotto la navbar su tutte le pagine."
      >
        <div className="tbh-card overflow-hidden">
          <Ticker />
        </div>
      </Section>

      <Section
        n="04"
        title="LogoBox"
        sub="Logo grande su fondo bianco (i loghi delle società sono quasi sempre su bianco). Se il logo manca, monogramma leggibile — mai un buco."
      >
        <div className="grid gap-6 grid-cols-2 md:grid-cols-4">
          <div>
            <LogoBox name="A.S.D. Verucchio Calcio" logo={LOGHI_CHANNEL["verucchio"]!.src} size="lg" />
            <p className="text-sm mt-3">Logo reale · size lg</p>
          </div>
          <div>
            <LogoBox name="A.S.D. Victoria 1968" logo={LOGHI_CHANNEL["victoria"]!.src} size="lg" />
            <p className="text-sm mt-3">Logo reale · size lg</p>
          </div>
          <div>
            <LogoBox name="Touch Communications" logo={null} size="lg" />
            <p className="text-sm mt-3">Fallback monogramma · size lg</p>
          </div>
          <div>
            <LogoBox name="Touch Street Food & Beverage" logo={null} />
            <p className="text-sm mt-3">Fallback monogramma · size md</p>
          </div>
        </div>
      </Section>

      <Section
        n="05"
        title="ProductCard"
        sub="Immagine 1:1, titolo per esteso, prezzo neon grande, CTA rotonda. Griglia 2 → 3 → 4 colonne, gap 24px."
      >
        <div className="grid gap-6 grid-cols-2 xl:grid-cols-4">
          <ProductCard
            title="KIT AGGREGAZIONE BUSINESS"
            category="Servizi"
            priceCents={152500}
            blurb="Combo: Accredito Partner Shop + All You Can Touch Fidelity in un unico kit."
            image={null}
            installments
            onBuy={() => {}}
            pending={false}
          />
          <ProductCard
            title="CORSO DI FORMAZIONE COMPLETO"
            category="Formazione"
            priceCents={61000}
            blurb="Qualsiasi corso del catalogo Touch Jobs. Esame a parte."
            image={null}
            installments
            onBuy={() => {}}
            pending={false}
          />
          <ProductCard
            title="ESAME DI CERTIFICAZIONE"
            category="Formazione"
            priceCents={7200}
            blurb="Quota esame finale con rilascio attestato."
            image={null}
            installments={false}
            onBuy={() => {}}
            pending={false}
          />
          <ProductCard
            title="STAND STREET FOOD — MISURA L"
            category="Street Food"
            priceCents={91500}
            blurb="Postazione espositore Touch Street Food & Beverage, misura L."
            image={null}
            installments
            onBuy={() => {}}
            pending={true}
          />
        </div>
        <p className="text-sm text-[var(--tbh-muted)] mt-4">
          Formato prezzo: <code className="text-[var(--tbh-neon)]">{euro(152500)}</code> — locale
          it-IT, sempre 2 decimali.
        </p>
      </Section>

      <Section
        n="06"
        title="LinkTile"
        sub="Usata per società, attività e squadre. Logo size lg, titolo per esteso, stato del sito esplicito."
      >
        <div className="grid gap-7 md:grid-cols-3">
          <LinkTile
            name="A.S.D. Verucchio Calcio"
            subtitle="Squadra partner · videoperatore ufficiale 2026/27"
            logo={LOGHI_CHANNEL["verucchio"]!.src}
            site="https://www.asdverucchio.it/"
            note="Prima Categoria — Stadio Comunale, Villa Verucchio (RN)."
          />
          <LinkTile
            name="A.S.D. Victoria 1968"
            subtitle="Squadra partner · riprese e produzione video"
            logo={LOGHI_CHANNEL["victoria"]!.src}
            site="https://www.asdvictoria1968.it/"
            note="Rimini Nord — Stadio Bani, Viserba."
          />
          <LinkTile
            name="R.F.A. Rimini Football Academy A.S.D."
            subtitle="TBH-008 · settore giovanile"
            logo={null}
            site={null}
            note="P.IVA 04124660400 — sito in allestimento."
          />
        </div>
      </Section>

      <Section n="07" title="Bottoni & stati">
        {/* CORREZIONE 29/09/2026 — controllo dei collegamenti, Priorità 1.
            Questa è la pagina-campionario dello stile: qui i bottoni sono ESEMPI
            da guardare, non comandi. Erano scritti come <button> veri e il
            controllo li segnava, giustamente, come «pulsanti che non fanno
            niente». Ora sono campioni dichiarati: stessa forma identica, ma non
            sono più pulsanti cliccabili che deludono chi li premeva. */}
        <div className="flex flex-wrap items-center gap-4">
          <span className="tbh-neon-btn px-6 py-3">CTA primaria</span>
          <span className="px-6 py-3 rounded-full border border-[var(--tbh-line)] font-semibold">
            CTA secondaria
          </span>
          <button className="tbh-neon-btn px-6 py-3 opacity-60" disabled>
            Disabilitata / in corso
          </button>
          <span className="px-4 py-2 rounded-full bg-[var(--tbh-neon)] text-black text-sm font-semibold">
            Filtro attivo
          </span>
          <span className="px-4 py-2 rounded-full bg-white/10 text-sm font-semibold">
            Filtro inattivo
          </span>
        </div>
      </Section>

      <Section n="08" title="Regole & anti-pattern">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="tbh-card p-6">
            <h3 className="tbh-display text-xl mb-4 text-[var(--tbh-neon)]">Si fa</h3>
            <ul className="space-y-3">
              {DO.map((d) => (
                <li key={d} className="flex gap-3 text-sm">
                  <Check size={18} className="text-[var(--tbh-neon)] shrink-0 mt-0.5" />
                  <span>{d}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="tbh-card p-6">
            <h3 className="tbh-display text-xl mb-4 text-[var(--tbh-gold)]">Non si fa</h3>
            <ul className="space-y-3">
              {DONT.map((d) => (
                <li key={d} className="flex gap-3 text-sm text-[var(--tbh-muted)]">
                  <X size={18} className="text-[var(--tbh-gold)] shrink-0 mt-0.5" />
                  <span>{d}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Section>
    </div>
  );
}
