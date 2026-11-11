import { Link } from "wouter";
import {
  ArrowLeft,
  CalendarCheck,
  Globe,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  PlayCircle,
  Sparkles,
} from "lucide-react";
import { MonitorLuogo, FasciaLuoghi, TESTO_MAPPA_MANCANTE } from "../components/card-luogo";
import { LogoBox } from "../components/logo-box";
import { RigaInAllestimento } from "../components/in-allestimento";
import { wa, waInfo } from "../lib/whatsapp";
import {
  attivita,
  attivitaCitta,
  categoria as categoriaTbh,
  citta as cittaTbh,
  cittaCapofila,
  etichettaLuogo,
  urlEmail,
  urlMappa,
  urlMappaIncorporata,
  urlTelefono,
  urlWhatsapp,
  type AttivitaTBH,
} from "../../api/data/territorio";

/* ────────────────────────────────────────────────────────────────────────────
   SCHEDA INTERNA DEL LUOGO — la mini-homepage dietro «APRI SCHEDA».

   Standard unico della direzione (18/09/2026): si apre DENTRO la piattaforma,
   non porta fuori, e presenta ogni posizione censita sempre nello stesso
   ordine, qualunque sia la categoria:

     1. HERO / MONITOR          2. NOME + MARCHIO
     3. CATEGORIA               4. DESCRIZIONE BREVE
     5. INDIRIZZO               6. CONTATTI DISPONIBILI
     7. SITO UFFICIALE          8. SOCIAL
     9. FOTO E VIDEO           10. SERVIZI
    11. MAPPA                  12. CHIAMATA ALL'AZIONE

   I pulsanti — MAPPA, SITO UFFICIALE, CHIAMA, WHATSAPP, EMAIL, PRENOTA,
   RICHIEDI INFO — compaiono SOLO se hanno una destinazione reale in scheda.
   Un dato che non c'è si scrive IN ALLESTIMENTO: non si riempie e non si
   nasconde. Nessun pulsante morto, nessun dato inventato.
   ──────────────────────────────────────────────────────────────────────────── */

/* ── PULSANTI ───────────────────────────────────────────────────────────── */

const BASE =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-[12px] font-extrabold uppercase tracking-[0.08em] transition";

function Azione({
  etichetta,
  url,
  icona,
  primaria = false,
  interna = false,
}: {
  etichetta: string;
  url: string | null;
  icona: React.ReactNode;
  primaria?: boolean;
  interna?: boolean;
}) {
  if (!url) return null;
  const classe = primaria
    ? "border-[var(--tbh-neon)] bg-[var(--tbh-neon)] text-black hover:brightness-110"
    : "border-[var(--tbh-line)] bg-black/40 text-white hover:border-[var(--tbh-neon)] hover:text-[var(--tbh-neon)]";

  if (interna) {
    return (
      <Link href={url} className={`${BASE} ${classe}`}>
        {icona} {etichetta}
      </Link>
    );
  }
  return (
    <a href={url} target="_blank" rel="noreferrer" className={`${BASE} ${classe}`}>
      {icona} {etichetta}
    </a>
  );
}

/* ── SEZIONE ────────────────────────────────────────────────────────────── */

function Sezione({
  titolo,
  children,
}: {
  titolo: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border-t border-[var(--tbh-line)] pt-6">
      <h2 className="tbh-dato mb-3 text-[11px] font-extrabold uppercase tracking-[0.18em] text-[var(--tbh-muted)]">
        {titolo}
      </h2>
      {children}
    </section>
  );
}

/* ── PAGINA ─────────────────────────────────────────────────────────────── */

export default function LuogoPage({ slug }: { slug: string }) {
  const a = attivita(slug);

  if (!a) {
    return (
      <div className="mx-auto max-w-[900px] px-4 py-16 md:px-8">
        <h1 className="tbh-display text-2xl">Scheda non trovata</h1>
        <p className="mt-3 text-sm text-[var(--tbh-muted)]">
          Questa posizione non è (ancora) nell'archivio del Territorio TBH.
        </p>
        <Link
          href="/territorio/spazi"
          className={`${BASE} mt-6 border-[var(--tbh-neon)] bg-[var(--tbh-neon)] text-black`}
        >
          <ArrowLeft size={14} /> Torna al Territorio
        </Link>
      </div>
    );
  }

  const c = cittaTbh(cittaCapofila(a.citta));
  const mappa = urlMappa(a);
  const incorporata = urlMappaIncorporata(a);
  const telefono = urlTelefono(a);
  const whatsapp = urlWhatsapp(a);
  const email = urlEmail(a);
  const prenota =
    a.prenotazione ??
    (a.prenotabile
      ? wa(
          `Buongiorno, vorrei prenotare presso ${a.nome}${
            a.indirizzo ? ` (${a.indirizzo})` : ""
          }${c ? ` a ${c.nome}` : ""}.`,
        )
      : null);
  const info = waInfo(`${a.nome}${c ? ` — ${c.nome}` : ""}`);

  /* Altre schede della stessa città: si resta dentro la piattaforma. */
  const vicini = attivitaCitta(cittaCapofila(a.citta))
    .filter((x) => x.id !== a.id)
    .slice(0, 12);

  return (
    <div className="mx-auto max-w-[1100px] px-4 py-8 md:px-8 md:py-12">
      {/* ritorno alla città: niente vicoli ciechi */}
      <Link
        href={c?.percorso ?? "/territorio/spazi"}
        className="tbh-dato inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--tbh-muted)] hover:text-[var(--tbh-neon)]"
      >
        <ArrowLeft size={13} /> {c ? c.nome : "Territorio TBH"}
      </Link>

      {/* 1 · HERO / MONITOR */}
      <div className="mt-4 overflow-hidden rounded-2xl border border-[var(--tbh-line)] bg-black">
        <MonitorLuogo luogo={a} altezza="h-56 sm:h-72 md:h-[380px]" />
      </div>

      <div className="mt-6 flex flex-col gap-6 md:flex-row md:items-start">
        {/* 2 · marchio ufficiale accanto al nome, se l'abbiamo */}
        {a.immagine && a.tipoImmagine === "logo" ? (
          <div className="w-40 shrink-0">
            <LogoBox
              nome={a.nome}
              logo={a.immagine}
              formato="scheda-attivita"
              altezzaClasse="h-24"
              fondo={a.fondoLogo ?? "chiaro"}
            />
          </div>
        ) : null}

        <div className="min-w-0 flex-1">
          {/* 2 · NOME */}
          <h1 className="tbh-display text-2xl leading-tight md:text-4xl">{a.nome}</h1>

          {/* 3 · CATEGORIA (tutte quelle in cui compare: un solo record, più fasce) */}
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {a.categorie.map((slugCat) => {
              const k = categoriaTbh(slugCat);
              return (
                <span
                  key={slugCat}
                  className="tbh-dato inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.14em]"
                  style={{ color: k.colore, borderColor: `${k.colore}66` }}
                >
                  <span aria-hidden>{k.emoji}</span> {k.titolo}
                </span>
              );
            })}
            <span className="tbh-dato text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--tbh-muted)]">
              • {etichettaLuogo(a)}
            </span>
          </div>

          {/* 4 · DESCRIZIONE BREVE */}
          <div className="mt-4 text-[15px] leading-relaxed text-white/85">
            {a.descrizione ? (
              <p>{a.descrizione}</p>
            ) : (
              <p className="flex items-center gap-2 text-sm text-[var(--tbh-muted)]">
                Descrizione <RigaInAllestimento cosa={`Descrizione ${a.nome}`} />
              </p>
            )}
          </div>

          {/* 5 · INDIRIZZO */}
          <div className="mt-4 flex items-start gap-2 text-sm leading-snug">
            <MapPin size={16} className="mt-0.5 shrink-0 text-[var(--tbh-gold)]" aria-hidden />
            <span>
              {a.indirizzo ? (
                <>
                  <span className="block text-white">{a.indirizzo}</span>
                  {a.localita ? (
                    <span className="block text-[var(--tbh-muted)]">{a.localita}</span>
                  ) : null}
                </>
              ) : (
                <span className="inline-flex items-center gap-2 text-[var(--tbh-muted)]">
                  Indirizzo <RigaInAllestimento cosa={`Indirizzo ${a.nome}`} />
                </span>
              )}
            </span>
          </div>

          {/* 12 · CHIAMATA ALL'AZIONE — solo pulsanti con destinazione reale */}
          <div className="mt-6 flex flex-wrap gap-2">
            <Azione
              etichetta="Google Map"
              url={mappa}
              icona={<MapPin size={14} />}
              primaria={!a.sito}
            />
            <Azione
              etichetta="Sito ufficiale"
              url={a.sito}
              icona={<Globe size={14} />}
              primaria={Boolean(a.sito)}
            />
            <Azione etichetta="Chiama" url={telefono} icona={<Phone size={14} />} />
            <Azione etichetta="WhatsApp" url={whatsapp} icona={<MessageCircle size={14} />} />
            <Azione etichetta="Email" url={email} icona={<Mail size={14} />} />
            <Azione etichetta="Prenota" url={prenota} icona={<CalendarCheck size={14} />} />
            <Azione etichetta="Richiedi info" url={info} icona={<Sparkles size={14} />} />
          </div>
          {!mappa ? (
            <p className="tbh-dato mt-2 text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--tbh-muted)]">
              {TESTO_MAPPA_MANCANTE}: senza indirizzo verificato la posizione non viene pubblicata.
            </p>
          ) : null}
        </div>
      </div>

      <div className="mt-10 flex flex-col gap-8">
        {/* 6 · CONTATTI DISPONIBILI */}
        <Sezione titolo="Contatti">
          <dl className="grid gap-3 sm:grid-cols-2">
            <Riga etichetta="Telefono" valore={a.telefono} nome={a.nome} />
            <Riga etichetta="WhatsApp" valore={a.whatsapp} nome={a.nome} />
            <Riga etichetta="Email" valore={a.email} nome={a.nome} />
            {/* 7 · SITO UFFICIALE */}
            <Riga etichetta="Sito ufficiale" valore={a.sito} nome={a.nome} />
          </dl>
        </Sezione>

        {/* 8 · SOCIAL */}
        <Sezione titolo="Canali social">
          {a.social.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {a.social.map((s) => (
                <a
                  key={s.url}
                  href={s.url}
                  target="_blank"
                  rel="noreferrer"
                  className={`${BASE} border-[var(--tbh-line)] bg-black/40 text-white hover:border-[var(--tbh-neon)] hover:text-[var(--tbh-neon)]`}
                >
                  {s.rete}
                </a>
              ))}
            </div>
          ) : (
            <RigaInAllestimento cosa={`Canali social ufficiali di ${a.nome}`} />
          )}
        </Sezione>

        {/* 9 · FOTO E VIDEO */}
        <Sezione titolo="Foto e video ufficiali">
          {a.gallery.length > 0 || a.video ? (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {a.video ? (
                <div className="relative overflow-hidden rounded-xl border border-white/10 bg-black">
                  <video src={a.video} controls preload="metadata" className="h-44 w-full object-cover" />
                  <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-black/70 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--tbh-neon)]">
                    <PlayCircle size={12} /> Video
                  </span>
                </div>
              ) : null}
              {a.gallery.map((src) => (
                <img
                  key={src}
                  src={src}
                  alt={`${a.nome} — fotografia ufficiale`}
                  loading="lazy"
                  className="h-44 w-full rounded-xl border border-white/10 object-cover"
                />
              ))}
            </div>
          ) : (
            <RigaInAllestimento cosa={`Foto e video ufficiali di ${a.nome}`} />
          )}
        </Sezione>

        {/* 10 · SERVIZI */}
        <Sezione titolo="Servizi">
          {a.servizi.length > 0 ? (
            <ul className="flex flex-wrap gap-2">
              {a.servizi.map((s) => (
                <li
                  key={s}
                  className="rounded-full border border-[var(--tbh-line)] px-3 py-1.5 text-[12px] text-white/85"
                >
                  {s}
                </li>
              ))}
            </ul>
          ) : (
            <RigaInAllestimento cosa={`Servizi dichiarati da ${a.nome}`} />
          )}
        </Sezione>

        {/* 11 · MAPPA */}
        <Sezione titolo="Dove si trova">
          {incorporata ? (
            <div className="overflow-hidden rounded-2xl border border-[var(--tbh-line)]">
              <iframe
                src={incorporata}
                title={`Mappa — ${a.nome}`}
                loading="lazy"
                className="h-[320px] w-full border-0"
              />
            </div>
          ) : (
            <p className="text-sm text-[var(--tbh-muted)]">
              {TESTO_MAPPA_MANCANTE}: la mappa compare quando l'indirizzo è confermato dalla fonte
              ufficiale. Nessun punto approssimato.
            </p>
          )}
          {a.fonteCoordinate ? (
            <p className="mt-2 text-[11px] text-[var(--tbh-muted)]">
              Posizione: {a.fonteCoordinate}.
            </p>
          ) : null}
          {mappa ? (
            <div className="mt-3">
              <Azione etichetta="Apri su Google Map" url={mappa} icona={<MapPin size={14} />} />
            </div>
          ) : null}
        </Sezione>

        {/* Tracciabilità: da dove viene il dato, e cosa manca ancora. */}
        {a.fonte || a.nota ? (
          <Sezione titolo="Fonte del dato">
            {a.fonte ? (
              <p className="text-[12px] leading-snug text-[var(--tbh-muted)]">Fonte: {a.fonte}.</p>
            ) : null}
            {a.nota ? (
              <p className="mt-1 text-[12px] leading-snug text-[var(--tbh-muted)]">{a.nota}</p>
            ) : null}
            <p className="tbh-dato mt-2 text-[10px] uppercase tracking-[0.14em] text-[var(--tbh-muted)]">
              ID TBH {a.id}
            </p>
          </Sezione>
        ) : null}

        {/* Altre posizioni della stessa città: stessa card, stesso standard. */}
        {vicini.length > 0 ? (
          <Sezione titolo={`Altre posizioni — ${c?.nome ?? "Territorio TBH"}`}>
            <FasciaLuoghi
              etichetta={`Altre posizioni a ${c?.nome ?? "Territorio TBH"}`}
              luoghi={vicini}
            />
          </Sezione>
        ) : null}
      </div>
    </div>
  );
}

/** Riga di contatto: il dato quando c'è, IN ALLESTIMENTO quando non c'è. */
function Riga({
  etichetta,
  valore,
  nome,
}: {
  etichetta: string;
  valore: string | null;
  nome: string;
}) {
  return (
    <div>
      <dt className="tbh-dato text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--tbh-muted)]">
        {etichetta}
      </dt>
      <dd className="mt-1 text-sm text-white/90">
        {valore ? valore : <RigaInAllestimento cosa={`${etichetta} di ${nome}`} />}
      </dd>
    </div>
  );
}

export type { AttivitaTBH };
