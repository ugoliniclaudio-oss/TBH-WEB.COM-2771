import { Link } from "wouter";
import { CAROSELLI_VISIBILI, CHANNEL_HOME, type CaroselloHome, type ChannelHome } from "../../api/data/channel-home";
import { useElencoChannel } from "../queries/channel";
import { useCaroselliHome } from "../queries/caroselli";
import { CaroselloFila, TesseraChannel } from "./check-web-home-ordine";

/* ────────────────────────────────────────────────────────────────────────────
   /check-web/pagine/1 — TBH-WEB 3.0, TEMPLATE PAGINATO DEI CHANNEL (23/10/2026).
   PRIMA FASE: solo l'anteprima privata della PAGINA 1. Nessuna pubblicazione.

   Template unico: massimo 15 Channel per pagina = 5 righe da 3 monitor; dopo OGNI riga un
   carosello indipendente (5 posizioni). Ogni monitor = TesseraChannel della home «Canale 0»
   (logo originale, nome, anteprima di stato) con APRI CANALE (pagina con monitor e
   palinsesto) e APRI SCHEDA (/check-web/channel/<slug>).

   Distribuzione (ordine ufficiale CHANNEL_HOME, numeri e slug invariati, nessun doppione):
     · TBH = tutti i Channel tranne DM (media partner esterno) e le squadre DM;
     · Pagina 1 = primi 15 TBH · Pagina 2 = DM (DM + squadre) · Pagina 3 = TBH successivi.
   Le pagine 2 e 3 NON sono ancora create (prima fase economica).

   Caroselli: i 4 caroselli ufficiali già esistenti (schede vive dal server, gestione e
   contatori invariati) + posizione 5 vuota «da assegnare». Autoplay 5 s, rotazione continua,
   pausa su interazione, frecce. Nessuna scheda pubblicitaria inventata.
   ──────────────────────────────────────────────────────────────────────────── */

const GIALLO = "#d7ff00";
const PER_PAGINA = 15;
const PER_RIGA = 3;

const eDm = (c: ChannelHome) => !!c.mediaPartnerEsterno || c.categoria === "squadra";
const CHANNEL_TBH = CHANNEL_HOME.filter((c) => !eDm(c));
const CHANNEL_DM = CHANNEL_HOME.filter(eDm);

/** Pagine nell'ordine richiesto: 1 = TBH 1–15, 2 = DM, 3+ = TBH successivi. */
const PAGINE_CHANNEL: ChannelHome[][] = [
  CHANNEL_TBH.slice(0, PER_PAGINA),
  CHANNEL_DM.slice(0, PER_PAGINA),
  ...Array.from({ length: Math.ceil(Math.max(0, CHANNEL_TBH.length - PER_PAGINA) / PER_PAGINA) }, (_, i) =>
    CHANNEL_TBH.slice(PER_PAGINA * (i + 1), PER_PAGINA * (i + 2)),
  ),
].filter((p) => p.length > 0);

const POSIZIONE_5: CaroselloHome = { slug: "pagina-1-posizione-5", titolo: "CAROSELLO 5 · DA ASSEGNARE", dopoFila: null, schede: [] };
const CAROSELLI_PAGINA_1: CaroselloHome[] = [...CAROSELLI_VISIBILI, POSIZIONE_5].slice(0, 5);

export default function CheckWebPaginaPage() {
  const elenco = useElencoChannel();
  const vivi = useCaroselliHome();
  const statoDi = new Map((elenco.data?.channel ?? []).map((c) => [c.slug, c]));
  const channel = PAGINE_CHANNEL[0] ?? [];
  const righe = Array.from({ length: Math.ceil(channel.length / PER_RIGA) }, (_, i) => channel.slice(i * PER_RIGA, (i + 1) * PER_RIGA));

  return (
    <div className="bg-black pb-16 text-white" data-testid="pagina-channel-1">
      <h1 className="sr-only">TBH-WEB 3.0 · Pagina 1 · anteprima</h1>
      <div className="mx-auto max-w-[1300px] px-4 pt-4 md:px-8">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 rounded-2xl border px-4 py-3 text-[12px]" style={{ borderColor: `${GIALLO}80` }}>
          <span className="font-extrabold tracking-[0.16em]" style={{ color: GIALLO }}>
            ANTEPRIMA PRIVATA · TBH-WEB 3.0 · PAGINA 1 DI {PAGINE_CHANNEL.length} · NON PUBBLICATA
          </span>
          <span className="text-white/60">
            Primi {channel.length} Channel TBH nell'ordine ufficiale · 5 righe da 3 · un carosello dopo ogni riga. Prossime: Pagina 2
            DM ({CHANNEL_DM.length} Channel), Pagina 3 TBH ({Math.max(0, CHANNEL_TBH.length - PER_PAGINA)} Channel) — non ancora
            create. La home vera (/) non cambia.
          </span>
        </div>
      </div>

      <div className="mx-auto mt-8 flex max-w-[1300px] flex-col gap-10 px-4 md:px-8">
        {righe.map((riga, i) => {
          const k = CAROSELLI_PAGINA_1[i];
          return (
            <div key={i} data-testid={`riga-${i + 1}`}>
              <section aria-label={`Channel riga ${i + 1}`} className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3">
                {riga.map((c) => (
                  <TesseraChannel key={c.slug} c={c} stato={statoDi.get(c.slug)} scheda={`/check-web/channel/${c.slug}`} />
                ))}
              </section>
              {k && <CaroselloFila k={k} vivo={vivi.data?.caroselli.find((x) => x.slug === k.slug)} autoplay={5000} />}
            </div>
          );
        })}
      </div>

      <p className="mx-auto mt-10 max-w-[1300px] px-4 text-[11px] text-white/40 md:px-8">
        Caroselli: contenuti e sequenza gestiti a parte per ciascuno (server, contatori vista/clic invariati). La pubblicità H24 entra
        solo con materiali autorizzati. <Link href="/check-web/home-ordine" className="underline hover:text-white">Home «Canale 0» attuale</Link>
      </p>
    </div>
  );
}
