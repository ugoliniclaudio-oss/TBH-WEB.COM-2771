import { Link } from "wouter";
import {
  BriefcaseBusiness,
  FileSignature,
  Info,
  Music4,
  ShieldCheck,
  Store,
  Users,
  ExternalLink,
} from "lucide-react";
import { waInfo } from "../lib/whatsapp";

/** MANAGEMENT — sezione interna richiesta da Claudio il 30/08/2026.
 *  Raccoglie i contratti e i documenti che il gruppo usa con collaboratori, aziende,
 *  operatori di categoria e artisti.
 *
 *  REGOLA APPLICATA: qui NON viene pubblicato nessun testo contrattuale, nessun articolo di
 *  legge e nessun modello scritto dall'agente. Un contratto sbagliato fa danni veri. Per ogni
 *  voce si dichiara a cosa serve, cosa serve per compilarlo e come richiederlo: il file entra
 *  solo quando arriva validato dal consulente del lavoro o dal legale. */

const COLORE = "#e2c37a";

type Documento = {
  nome: string;
  aChiServe: string;
  contenuto: string[];
  stato: "Modello da validare" | "Da ricevere";
};

type Blocco = {
  titolo: string;
  icona: typeof FileSignature;
  colore: string;
  intro: string;
  documenti: Documento[];
};

const BLOCCHI: Blocco[] = [
  {
    titolo: "Collaborazioni con P.IVA",
    icona: BriefcaseBusiness,
    colore: "#d7ff00",
    intro:
      "Rapporti con professionisti e ditte individuali che fatturano al gruppo: agenti, videomaker, fotografi, tecnici, consulenti, PR.",
    documenti: [
      {
        nome: "Contratto di collaborazione con partita IVA",
        aChiServe: "Professionisti e ditte che fatturano prestazioni al gruppo.",
        contenuto: [
          "Oggetto della prestazione e perimetro del lavoro",
          "Compenso, tempi e modalità di fatturazione",
          "Durata, rinnovo e recesso",
          "Riservatezza e proprietà dei materiali prodotti",
        ],
        stato: "Modello da validare",
      },
      {
        nome: "Incarico di procacciamento d'affari · rete commerciale",
        aChiServe: "Chi porta clienti, sponsor e partner al Circuito TBH.",
        contenuto: [
          "Zona e settore di intervento",
          "Provvigioni e momento di maturazione",
          "Obblighi di rendiconto",
        ],
        stato: "Modello da validare",
      },
      {
        nome: "Lettera d'incarico occasionale",
        aChiServe: "Prestazioni singole e non continuative.",
        contenuto: ["Prestazione una tantum", "Compenso lordo e ritenuta", "Data e luogo"],
        stato: "Modello da validare",
      },
    ],
  },
  {
    titolo: "Lavoro subordinato · CCNL",
    icona: Users,
    colore: "#33e0ff",
    intro:
      "Assunzioni dirette e contratti di categoria. Vanno sempre passati dal consulente del lavoro: il CCNL applicabile cambia in base all'attività.",
    documenti: [
      {
        nome: "Contratto di assunzione (CCNL applicabile)",
        aChiServe: "Dipendenti a tempo determinato e indeterminato.",
        contenuto: [
          "CCNL di riferimento e livello di inquadramento",
          "Mansione, sede di lavoro e orario",
          "Retribuzione e periodo di prova",
        ],
        stato: "Da ricevere",
      },
      {
        nome: "Contratto a chiamata / intermittente",
        aChiServe: "Eventi, fiere, servizi stagionali.",
        contenuto: ["Periodi di disponibilità", "Preavviso di chiamata", "Trattamento economico"],
        stato: "Da ricevere",
      },
      {
        nome: "Tirocinio e apprendistato",
        aChiServe: "Percorsi formativi TBH Academy.",
        contenuto: ["Progetto formativo", "Tutor aziendale", "Durata e indennità"],
        stato: "Da ricevere",
      },
    ],
  },
  {
    titolo: "Liberatorie e privacy",
    icona: ShieldCheck,
    colore: "#9dff3c",
    intro:
      "Servono ogni volta che si riprende, fotografa o pubblica una persona: eventi, reality, riprese sportive, magazine, social.",
    documenti: [
      {
        nome: "Liberatoria immagine e voce (maggiorenni)",
        aChiServe: "Chiunque compaia in riprese, foto e trasmissioni TBH.",
        contenuto: [
          "Consenso all'uso di immagine e voce",
          "Ambito di diffusione: TV, web, social, magazine",
          "Durata del consenso e revoca",
        ],
        stato: "Modello da validare",
      },
      {
        nome: "Liberatoria per minori (firma dei genitori)",
        aChiServe: "Giovanili sportive, casting, eventi con minori.",
        contenuto: [
          "Dati del minore e di entrambi i genitori/tutori",
          "Ambito d'uso e limiti",
          "Documenti d'identità allegati",
        ],
        stato: "Modello da validare",
      },
      {
        nome: "Informativa privacy e consenso trattamento dati",
        aChiServe: "Candidature, newsletter, tesseramenti Club.",
        contenuto: ["Titolare del trattamento", "Finalità e base giuridica", "Diritti dell'interessato"],
        stato: "Modello da validare",
      },
    ],
  },
  {
    titolo: "Operatori di categoria e ambulanti",
    icona: Store,
    colore: "#ff8a00",
    intro:
      "Stand, street food, banchi, spazi espositivi e attività su area pubblica dentro eventi e fiere del gruppo.",
    documenti: [
      {
        nome: "Contratto di concessione spazio espositivo",
        aChiServe: "Ambulanti, street food, stand commerciali e artigianali.",
        contenuto: [
          "Metratura, posizione e allacci",
          "Canone e cauzione",
          "Orari di allestimento e smontaggio",
          "Obblighi assicurativi",
        ],
        stato: "Modello da validare",
      },
      {
        nome: "Checklist documenti per area pubblica",
        aChiServe: "Chi opera su suolo pubblico durante gli eventi.",
        contenuto: [
          "Autorizzazione al commercio su area pubblica",
          "SCIA e requisiti igienico-sanitari (HACCP)",
          "Certificazioni attrezzature e antincendio",
          "Polizza RC",
        ],
        stato: "Modello da validare",
      },
      {
        nome: "Regolamento interno dell'area espositiva",
        aChiServe: "Tutti gli operatori presenti in fiera o in evento.",
        contenuto: ["Norme di sicurezza", "Rifiuti e pulizia", "Sanzioni e allontanamento"],
        stato: "Modello da validare",
      },
    ],
  },
  {
    titolo: "Artisti, band, performer e DJ",
    icona: Music4,
    colore: "#b46bff",
    intro:
      "Ingaggi per serate, festival, tappe Hugoland, produzioni discografiche e riprese video.",
    documenti: [
      {
        nome: "Contratto di ingaggio artistico (serata / data)",
        aChiServe: "DJ, band, cantanti, performer, animazione.",
        contenuto: [
          "Data, luogo, orari di prova e di esibizione",
          "Cachet, rimborsi, ospitalità e viaggio",
          "Service audio/luci a carico di chi",
          "Adempimenti INPS ex ENPALS e SIAE",
        ],
        stato: "Modello da validare",
      },
      {
        nome: "Contratto di produzione e licenza fonografica",
        aChiServe: "Uscite TBH Records e produzioni originali.",
        contenuto: [
          "Titolarità del master e delle parti d'autore",
          "Territorio e durata della licenza",
          "Royalty e rendiconti",
        ],
        stato: "Modello da validare",
      },
      {
        nome: "Cessione diritti di ripresa e sfruttamento",
        aChiServe: "Riprese dei live, reality, videoclip.",
        contenuto: ["Diritti concessi", "Canali di diffusione", "Compenso o gratuità dichiarata"],
        stato: "Modello da validare",
      },
    ],
  },
];

export default function ManagementPage() {
  return (
    <div className="mx-auto max-w-[1500px] px-4 md:px-8 py-10">
      <header className="tbh-rise mb-8">
        <p className="text-xs tracking-[0.25em] uppercase mb-2" style={{ color: COLORE }}>
          Sezione interna · uso amministrativo
        </p>
        <h1 className="tbh-display tbh-h1">Management</h1>
        <p className="tbh-body text-[var(--tbh-muted)] max-w-4xl mt-3">
          Contratti, incarichi e liberatorie che il gruppo usa con collaboratori, aziende, operatori
          di categoria e artisti. Ogni voce dice a cosa serve e cosa deve contenere, così la
          struttura è pronta: i file entrano appena arrivano validati.
        </p>
      </header>

      <section
        className="tbh-card p-6 mb-10 border-l-4"
        style={{ borderLeftColor: "#ff2b2b" }}
      >
        <h2 className="tbh-display text-lg mb-2 flex items-center gap-2">
          <Info size={18} style={{ color: "#ff2b2b" }} /> Avvertenza — leggila prima di usare questa
          sezione
        </h2>
        <p className="tbh-body text-sm text-[var(--tbh-muted)]">
          In questa pagina <strong>non è pubblicato nessun testo contrattuale</strong>. I contratti di
          lavoro, i CCNL, le liberatorie e gli ingaggi artistici hanno effetti legali reali: devono
          essere redatti o validati dal <strong>consulente del lavoro</strong> e dal{" "}
          <strong>legale</strong> del gruppo. Qui c'è l'indice di ciò che serve, non un fac-simile
          scritto a caso.
        </p>
      </section>

      <div className="space-y-12">
        {BLOCCHI.map((b) => {
          const Icona = b.icona;
          return (
            <section key={b.titolo}>
              <h2
                className="tbh-display tbh-h2 mb-2 flex items-center gap-2"
                style={{ color: b.colore }}
              >
                <Icona size={22} /> {b.titolo}
              </h2>
              <p className="tbh-body text-sm text-[var(--tbh-muted)] max-w-4xl mb-4">{b.intro}</p>
              <div className="grid gap-4 md:grid-cols-3">
                {b.documenti.map((d) => (
                  <article
                    key={d.nome}
                    className="tbh-card p-5 flex flex-col gap-3 border-l-4"
                    style={{ borderLeftColor: b.colore }}
                  >
                    <div>
                      <span
                        className="text-[10px] uppercase tracking-wide rounded-full border px-2 py-1"
                        style={{ color: b.colore, borderColor: b.colore }}
                      >
                        {d.stato}
                      </span>
                      <h3 className="tbh-display text-base leading-tight mt-3 flex items-start gap-2">
                        <FileSignature size={16} className="mt-1 shrink-0" style={{ color: b.colore }} />
                        {d.nome}
                      </h3>
                    </div>
                    <p className="text-xs text-[var(--tbh-muted)]">{d.aChiServe}</p>
                    <ul className="text-xs text-[var(--tbh-muted)] list-disc pl-4 space-y-1 flex-1">
                      {d.contenuto.map((c) => (
                        <li key={c}>{c}</li>
                      ))}
                    </ul>
                    <div className="flex flex-wrap gap-2">
                      <a
                        href={waInfo(`Management TBH — richiesta documento: ${d.nome}`)}
                        target="_blank"
                        rel="noreferrer"
                        className="tbh-neon-btn px-4 py-2 text-xs font-semibold inline-flex items-center gap-2"
                      >
                        Richiedi il documento <ExternalLink size={13} />
                      </a>
                      <Link
                        to="/in-allestimento"
                        className="inline-flex items-center rounded-full border border-[var(--tbh-line)] px-4 py-2 text-xs font-semibold hover:border-[var(--tbh-neon)]"
                      >
                        Download in allestimento
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          );
        })}
      </div>

      <section className="tbh-card p-6 mt-12 border-l-4" style={{ borderLeftColor: COLORE }}>
        <h2 className="tbh-display text-lg mb-2">Cosa serve per attivare i download</h2>
        <ul className="tbh-body text-sm text-[var(--tbh-muted)] list-disc pl-5 space-y-1">
          <li>I modelli firmati o validati dal consulente del lavoro e dal legale (PDF o DOCX).</li>
          <li>Il CCNL applicato per ogni tipo di attività del gruppo.</li>
          <li>Ragione sociale, sede legale e P.IVA da inserire nell'intestazione dei contratti.</li>
          <li>Se questa sezione deve restare riservata: serve l'accesso con login per staff.</li>
        </ul>
        <div className="flex flex-wrap gap-3 mt-4">
          <Link
            to="/tbh-app"
            className="inline-flex items-center rounded-full border border-[var(--tbh-line)] px-5 py-2.5 text-sm font-semibold hover:border-[var(--tbh-neon)]"
          >
            TBH App · Download e archivio
          </Link>
          <Link
            to="/lavoro-casting"
            className="inline-flex items-center rounded-full border border-[var(--tbh-line)] px-5 py-2.5 text-sm font-semibold hover:border-[var(--tbh-neon)]"
          >
            Job &amp; Casting
          </Link>
        </div>
      </section>
    </div>
  );
}
