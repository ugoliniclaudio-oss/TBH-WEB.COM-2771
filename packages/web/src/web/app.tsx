import { Redirect, Route, Switch } from "wouter";
import HomeSelettore from "./pages/home-selettore";
import HomeCmsPage, { PaginaCmsPage } from "./pages/home-cms";
import PannelloContenutiPalinsestoPage from "./pages/pannello-contenuti-palinsesto";
import ChannelInAllestimentoPage from "./pages/channel-in-allestimento";
import CanaleTematicoPage, { CanaliTematiciPage } from "./pages/canale-tematico";
import PannelloCanaliTematiciPage from "./pages/pannello-canali-tematici";
import PannelloTouchSocialPage from "./pages/pannello-touch-social";
import ChannelSchedaPage from "./pages/channel-scheda";
import ChannelPlayerPage from "./pages/channel-player";
import ChannelSezioniPage from "./pages/channel-sezioni";
import CheckWebPaginaPage from "./pages/check-web-pagina";
import SpotChannelPage from "./pages/spot-channel";
import { RitornoInAlto } from "./components/ritorno-in-alto";
import ChannelMondoOlisticoPage from "./pages/channel-mondo-olistico";
import ChannelTouchCinemaPage from "./pages/channel-touch-cinema";
import TouchCinemaFilmPage from "./pages/touch-cinema-film";
import ChannelTouchTalentPage from "./pages/channel-touch-talent";
import PannelloTouchTalentPage from "./pages/pannello-touch-talent";
import ShopPage from "./pages/shop";
import PrezziPromoVantaggiPage from "./pages/prezzi-promo-vantaggi";
import GadgetPage from "./pages/gadget";
import GadgetSchedaPage from "./pages/gadget-scheda";
import PannelloProdottiPage from "./pages/pannello-prodotti";
import PannelloStripePage from "./pages/pannello-stripe";
import OrdineConfermatoPage from "./pages/ordine-confermato";
import SocietaPage from "./pages/societa";
import SocietaSchedaPage from "./pages/societa-scheda";
import MediaPartnerPage from "./pages/media-partner";
import SocietaSeguitePage from "./pages/societa-seguite";
import PagineTbhPage from "./pages/pagine-tbh";
import AttivitaPage from "./pages/attivita";
import SquadrePage from "./pages/squadre";
import DesignPage from "./pages/design";
import ProspectPage from "./pages/prospect";
import MappaPage from "./pages/mappa";
import TerritoriPage from "./pages/territori";
import RiminiDoveDormirePage from "./pages/rimini-dove-dormire";
import MotorsportPage from "./pages/motorsport";
import CalcioPage from "./pages/calcio";
import MediaPage from "./pages/media";
import GiochiPage from "./pages/giochi";
import BachecaPage from "./pages/bacheca";
import AllestimentoPage from "./pages/allestimento";
import DmPage from "./pages/dm";
import DmProgrammiPage from "./pages/dm-programmi";
import DmCrewPage from "./pages/dm-crew";
import SportCalendarioPage from "./pages/sport-calendario";
import LivelliPage from "./pages/livelli";
import BrandPage from "./pages/brand";
import AcademyRealityPage from "./pages/academy-reality";
import MediaLibraryPage from "./pages/media-library";
import RadioTvCuriositaPage from "./pages/radio-tv-curiosita";
import StreamingPage from "./pages/streaming";
import LavoroCastingPage from "./pages/lavoro";
import BachecaSchedaPage from "./pages/bacheca-scheda";
import LavoroCandidaturePage from "./pages/lavoro-candidature";
import CanaleTouchPage from "./pages/canale-touch";
import { RubricheIndice, RubricaScheda } from "./pages/rubriche";
import PannelloCanaliTouchPage from "./pages/pannello-canali-touch";
import CheckWebLoghiCanaliPage from "./pages/check-web-loghi-canali";
import CheckWebCanali6173Page from "./pages/check-web-canali-61-73";
import CheckWebArchivio73Page from "./pages/check-web-archivio-73";
import CheckWebHomeCanaliPage from "./pages/check-web-home-canali";
import CheckWebHomeOrdinePage from "./pages/check-web-home-ordine";
import PannelloChannelPage from "./pages/pannello-channel";
import CheckWebTelecomandoPage from "./pages/check-web-telecomando";
import CheckWebCanaleTelecomandoPage from "./pages/check-web-canale-telecomando";
import TbhSportEsperienzePage from "./pages/tbh-sport-esperienze";
import LavoroFormazionePage from "./pages/lavoro-formazione";
import LavoroFontiPage from "./pages/lavoro-fonti";
import LavoroAziendePage from "./pages/lavoro-aziende";
import ContattiPage from "./pages/contatti";
import CeoPage from "./pages/ceo";
import AnagraficaPage from "./pages/anagrafica";
import SchedaMasterPage from "./pages/scheda-master";
import PannelloAllestimentoPage from "./pages/pannello-allestimento";
import PannelloMusicaPage from "./pages/pannello-musica";
import PannelloMediaPage from "./pages/pannello-media";
import PannelloSezioniPage from "./pages/pannello-sezioni";
import ContentHubPage from "./pages/content-hub";
import TbhAppPage from "./pages/tbh-app";
import ManagementPage from "./pages/management";
import IstituzioniPage from "./pages/istituzioni";
import ProduzioniPage from "./pages/produzioni";
import RegistroPage from "./pages/registro";
import ServiziPage from "./pages/servizi";
import GuidaCanaliPage from "./pages/guida-canali";
import CheckWebPage from "./pages/check-web";
import CheckLuoghiPage from "./pages/check-luoghi";
import CheckEdicolaPage from "./pages/check-edicola";
import CheckPartitePage from "./pages/check-partite";
import LuogoPage from "./pages/luogo";
import RegiaPage from "./pages/regia";
import AmbientePage from "./pages/ambiente";
import MappaSitoPage from "./pages/mappa-sito";
import CanalePage from "./pages/canale";
import CircuitoPage from "./pages/circuito";
import NetworkPage from "./pages/network";
import CercaPage from "./pages/cerca";
import CommunityPage from "./pages/community";
import CrewAcademyPage from "./pages/crew-academy";
import CorsoAntincendioPage from "./pages/corso-antincendio";
import HvsPage from "./pages/hvs";
import CremonaCircuitPage from "./pages/cremona-circuit";
import PrideVillagePage from "./pages/pride-village";
import FashionPage from "./pages/fashion";
import SocialPage from "./pages/social";
import BusinessDeskPage from "./pages/business-desk";
import SportHubPage from "./pages/sport-hub";
import NetworkHubPage from "./pages/network-hub";
import PagamentiPage from "./pages/pagamenti";
import BrandPersonalizzazioniPage from "./pages/brand-personalizzazioni";
import VisibilitaInOndaPage from "./pages/visibilita-in-onda";
import EntitaPage from "./pages/entita";
import ProdottoPage from "./pages/prodotto";
import ServizioPage from "./pages/servizio";
import ClubPage from "./pages/club";
import LivelloPage from "./pages/livello";
import HospitalityPage from "./pages/hospitality";
import HotelAuroraPage from "./pages/hotel-aurora";
import ServiziReferralPage from "./pages/servizi-referral";
import ServiziImpresePage from "./pages/servizi-imprese";
import TbhAssistPage from "./pages/tbh-assist";
import OffertePage from "./pages/offerte";
import InfluencityPage from "./pages/influencity";
import NumeroPage from "./pages/numero";
import NewsPage from "./pages/news";
/* EDICOLA TBH — rassegna quotidiana: home, sezioni, schede, oroscopo, giochi, fonti */
import EdicolaPage from "./pages/edicola";
import EdicolaCategoriaPage from "./pages/edicola-categoria";
import EdicolaContenutoPage from "./pages/edicola-contenuto";
import EdicolaOroscopoPage from "./pages/edicola-oroscopo";
import EdicolaGiochiPage from "./pages/edicola-giochi";
import EdicolaFontiPage from "./pages/edicola-fonti";
import SquadraPage from "./pages/squadra";
import HighlightsDmPage from "./pages/highlights-dm";
import SanremoPage from "./pages/sanremo";
import EsteroPage from "./pages/estero";
import LuogoSanremoPage from "./pages/luogo-sanremo";
import MusicaPage from "./pages/musica";
import SchedaBranoMusicaPage from "./pages/scheda-brano-musica";
import DiscografiaPage from "./pages/discografia";
import CalendarioUscitePage from "./pages/calendario-uscite";
import CastingPage from "./pages/casting";
import PannelloCastingPage from "./pages/pannello-casting";
import CastingSchedaPage from "./pages/casting-scheda";
import CandidaturaLavoroPage from "./pages/candidatura-lavoro";
import PannelloCandidatureLavoroPage from "./pages/pannello-candidature-lavoro";
import RoadTo2030Page from "./pages/road-to-2030";
import CapitanTouchPage from "./pages/capitan-touch";
import PannelloCapitanPage from "./pages/pannello-capitan";
import TvStreamingAdvPage from "./pages/tv-streaming-adv";
import LeMieCampagnePage from "./pages/le-mie-campagne";
import PannelloAdvPage from "./pages/pannello-adv";
import PannelloMonitorPage from "./pages/pannello-monitor";
import PannelloScansionePage from "./pages/pannello-scansione";
/* TOUCH MISS COOL — la master sta all'indirizzo storico /eventi/miss-cool
   (era già linkata da dieci punti del sito) e le sotto-pagine sono sue figlie. */
import MissCoolPage from "./pages/miss-cool";
import MissCoolPremiazioniPage from "./pages/miss-cool-premiazioni";
import MissCoolRegolamentoPage from "./pages/miss-cool-regolamento";
import MissCoolAdesionePage from "./pages/miss-cool-adesione";
import MissCoolSchedePage from "./pages/miss-cool-schede";
import PannelloMissCoolPage from "./pages/pannello-miss-cool";
import { Provider } from "./components/provider";
import { Layout } from "./components/layout";
import { AttivitaInPaginaChannel, PercorsoStruttura } from "./components/struttura";
import { ErrorBoundary } from "./components/error-boundary";
import { AgentFeedback, RunableBadge } from "@runablehq/website-runtime";

/** Punto 46 — URL SEO nuovi, vecchi mantenuti come redirect: nessun link si rompe. */
const REDIRECTS: [string, string][] = [
  ["/societa", "/tbh/societa"],
  ["/rete-commerciale", "/network/rete-commerciale"],
  ["/mappa", "/territorio/mappa"],
  ["/territori", "/territorio/spazi"],
  ["/squadre", "/sport/squadre"],
  ["/calcio", "/sport/calcio"],
  ["/motorsport", "/sport/motorsport"],
  ["/giochi", "/media/giochi"],
  ["/bacheca", "/lavoro-casting/bacheca"],
];

function App() {
  return (
    <Provider>
      <Layout>
        <RitornoInAlto />
        <ErrorBoundary>
        {/* 28/10/2026 — struttura comune Home → Canale → Attività: percorso sopra le pagine Channel/attività esistenti. */}
        <PercorsoStruttura />
        <Switch>
          {/* Fase 2 Canale 0: home precedente INVARIATA finché l'interruttore del proprio ambito non è su «canale0». */}
          <Route path="/" component={HomeSelettore} />
          {/* Home aggiunte dal pannello (Home 2.0, 3.0 e successive) e Channel/pagine nuovi: una scheda, un URL. */}
          <Route path="/home/:slug">{(p) => <HomeCmsPage slug={p.slug!} />}</Route>
          <Route path="/pagina/:slug">{(p) => <PaginaCmsPage slug={p.slug!} />}</Route>
          {/* Channel nuovi (decisioni del 18/10/2026): solo titolo + IN ALLESTIMENTO, o playlist reale. */}
          {/* 28/10/2026 — canali tematici: /arm-wrestling (URL invariato) mostra il canale ARM WRESTLING; se il canale è spento torna la pagina «in allestimento». */}
          <Route path="/arm-wrestling">{() => <CanaleTematicoPage slug="arm-wrestling" riserva={<ChannelInAllestimentoPage slug="touch-arm-wrestling" />} />}</Route>
          <Route path="/canali">{() => <CanaliTematiciPage />}</Route>
          <Route path="/canali/:slug">{(p) => <CanaleTematicoPage slug={p.slug ?? ""} />}</Route>
          <Route path="/spot" component={SpotChannelPage} />
          {/* 28/10/2026 — ampliamento: tutti i Channel in 5 sezioni + schede pubbliche dal registro unico. */}
          <Route path="/channel">{() => <ChannelSezioniPage />}</Route>
          <Route path="/channel/scheda/:slug">
            {(p) => <ChannelSchedaPage slug={p.slug ?? ""} pubblica />}
          </Route>
          {/* 28/10/2026 (round 14) — player del Channel: APRI CHANNEL delle card quando il Channel non ha una pagina. */}
          <Route path="/channel/play/:slug">{(p) => <ChannelPlayerPage slug={p.slug ?? ""} />}</Route>
          <Route path="/channel/mondo-olistico" component={ChannelMondoOlisticoPage} />
          <Route path="/channel/touch-cinema" component={ChannelTouchCinemaPage} />
          {/* 28/10/2026 — Touch Cinema · Proiezioni: una scheda per ciascuno dei tre film. */}
          <Route path="/channel/touch-cinema/film/:slug">{(p) => <TouchCinemaFilmPage slug={p.slug ?? ""} />}</Route>
          {/* 28/10/2026 — Channel TOUCH TALENT & PROFESSIONALS: monitor 9:16, palinsesto H24 memorizzato. */}
          <Route path="/channel/touch-talent-professionals" component={ChannelTouchTalentPage} />
          <Route path="/shop" component={ShopPage} />
          {/* 03/10/2026 — Regolamento Prezzi, Promo & Vantaggi Circuito TBH (banner Touch Plaza). */}
          <Route path="/shop/prezzi-promo-vantaggi" component={PrezziPromoVantaggiPage} />

          {/* PALINSESTO / ZAPPING — specifica MASTER del 05/09/2026.
              Canale 0 = home, canale 99 = TBH/CEO. Ogni canale porta alla pagina canonica. */}
          <Route path="/guida" component={GuidaCanaliPage} />

          {/* BOZZA «CHECK WEB» — proposta di homepage riproporzionata.
              Regola 0 (docs/regole-ferree.md): si propone qui, la home resta intatta. */}
          <Route path="/check-web" component={CheckWebPage} />
          {/* BOZZA «REGIA» — palinsesto visuale a schermi 16:9 e rulli orizzontali
              (specifica di Claudio dell'08/09/2026). Sta nell'area bozza: la home
              vera non viene toccata. */}
          <Route path="/check-web/regia" component={RegiaPage} />
          {/* BOZZA «STANDARD UNICO DELLE POSIZIONI CENSITE» — specifica della
              direzione del 18/09/2026: una sola card per ogni luogo fisico,
              monitor dominante + GOOGLE MAP + APRI SCHEDA. Sta nella bozza:
              le pagine pubbliche restano intatte finché non si approva. */}
          <Route path="/check-web/luoghi" component={CheckLuoghiPage} />
          {/* BOZZA «EDICOLA» — controllo di tutti gli indirizzi dell'Edicola,
              sezioni piene/vuote con i conteggi veri e anteprima del carosello
              «OGGI SU TBH» come apparirebbe in home. La home vera resta intatta
              finché Claudio non dà l'ok. */}
          <Route path="/check-web/edicola" component={CheckEdicolaPage} />
          {/* BOZZA «PARTITE IN EVIDENZA» — la sezione di home chiesta da Claudio
              il 29/09/2026: tre monitor della stessa partita (PARTITA INTEGRALE ·
              HIGHLIGHTS · INTERVISTE FINE GARA) e APRI SCHEDA che porta alla
              pagina della società già esistente, aperta sulla partita giusta.
              Resta in bozza: la home vera non si tocca senza ok esplicito. */}
          <Route path="/check-web/partite" component={CheckPartitePage} />
          {/* BOZZA «LOGHI CANALI» — anteprima dei file candidati per TOUCH RADIO e TOUCH TV:
              nessun logo viene assegnato senza approvazione. */}
          <Route path="/check-web/loghi-canali" component={CheckWebLoghiCanaliPage} />
          {/* Bozze importazione 15/10: 13 voci TBH-061…073 + archivio 73 asset. Non pubblicate. */}
          <Route path="/check-web/canali-61-73" component={CheckWebCanali6173Page} />
          <Route path="/check-web/archivio-73" component={CheckWebArchivio73Page} />
          <Route path="/check-web/home-canali" component={CheckWebHomeCanaliPage} />
          {/* BOZZA HOME «CANALE 0» (18/10/2026): 3 monitor + 28 Channel in 5 blocchi, solo testo + 4 caroselli. */}
          <Route path="/check-web/home-ordine" component={CheckWebHomeOrdinePage} />
          <Route path="/check-web/telecomando" component={CheckWebTelecomandoPage} />
          {/* 23/10/2026 — TBH-WEB 3.0: template paginato, prima fase = solo Pagina 1 in anteprima privata. */}
          <Route path="/check-web/pagine/1" component={CheckWebPaginaPage} />
          {/* 19/10/2026 — schede dei 9 Channel nuovi in preparazione (solo anteprima, nessuna posizione). */}
          <Route path="/check-web/channel/:slug">
            {(p) => <ChannelSchedaPage slug={p.slug ?? ""} />}
          </Route>
          <Route path="/check-web/canali/:slug">
            {(p) => <CheckWebCanaleTelecomandoPage slug={p.slug ?? ""} />}
          </Route>
          {/* Mini-homepage di ambiente: sta dentro la bozza, la produzione non si tocca. */}
          <Route path="/check-web/c/:slug">
            {(p) => <AmbientePage slug={p.slug ?? ""} />}
          </Route>
          {/* Mappa del sito: era l'unico link rotto del footer (05/09/2026). */}
          <Route path="/mappa-sito" component={MappaSitoPage} />
          <Route path="/canale/0">{() => <Redirect to="/" replace />}</Route>
          <Route path="/canale/:numero">
            {(p) => <CanalePage numero={p.numero ?? ""} />}
          </Route>

          {/* Ordine 4-5 — ricerca globale e nuove voci del menu principale */}
          <Route path="/cerca" component={CercaPage} />
          <Route path="/community" component={CommunityPage} />
          {/* BLOCCO 1 · doppione vero risolto (28/09/2026): /crew-academy e
              /touch-academy mostravano la STESSA pagina. Canonica: /touch-academy
              (nome del canale). Il vecchio indirizzo resta valido via redirect. */}
          <Route path="/crew-academy">{() => <Redirect to="/touch-academy" replace />}</Route>
          {/* Corso Addetto Antincendio Livello 3 — testo e locandina di Claudio (15/09/2026) */}
          <Route path="/corsi/antincendio-livello-3" component={CorsoAntincendioPage} />
          <Route path="/antincendio">{() => <Redirect to="/corsi/antincendio-livello-3" replace />}</Route>
          <Route path="/hvs" component={HvsPage} />
          <Route path="/high-visibility-scout">{() => <Redirect to="/hvs" replace />}</Route>
          {/* Cremona Circuit 2026 — ricerca operatori, annuncio del 04/09/2026 */}
          <Route path="/cremona-circuit-2026" component={CremonaCircuitPage} />
          <Route path="/cremona">{() => <Redirect to="/cremona-circuit-2026" replace />}</Route>
          <Route path="/cremona-circuit">{() => <Redirect to="/cremona-circuit-2026" replace />}</Route>
          {/* Pride Village Padova e area Fashion — link comunicati da Claudio il 05/09/2026 */}
          <Route path="/pride-village" component={PrideVillagePage} />
          <Route path="/pridevillage">{() => <Redirect to="/pride-village" replace />}</Route>
          <Route path="/fashion" component={FashionPage} />
          <Route path="/moda">{() => <Redirect to="/fashion" replace />}</Route>
          {/* Touch Academy — rotta CANONICA della formazione/crew TBH. */}
          <Route path="/touch-academy" component={CrewAcademyPage} />
          {/* Directory social — schema consegnato da Claudio il 04/09/2026 */}
          <Route path="/contatti-social" component={SocialPage} />
          <Route path="/social">{() => <Redirect to="/contatti-social" replace />}</Route>
          <Route path="/business-desk" component={BusinessDeskPage} />
          <Route path="/sport" component={SportHubPage} />
          <Route path="/network" component={NetworkHubPage} />
          <Route path="/touch-plaza">{() => <Redirect to="/shop" replace />}</Route>
          <Route path="/tv-radio-streaming">{() => <Redirect to="/media/streaming" replace />}</Route>
          <Route path="/job-casting">{() => <Redirect to="/lavoro-casting" replace />}</Route>

          {/* TBH */}
          <Route path="/tbh/societa" component={SocietaPage} />
          <Route path="/tbh/societa/:slug">{(p) => <SocietaSchedaPage slug={p.slug!} />}</Route>
          <Route path="/tbh/attivita" component={AttivitaPage} />
          <Route path="/tbh/livelli" component={LivelliPage} />
          <Route path="/tbh/touch-fashion">{() => <BrandPage slug="touch-fashion" />}</Route>
          <Route path="/tbh/produzioni" component={ProduzioniPage} />
          <Route path="/tbh/servizi" component={ServiziPage} />
          <Route path="/tbh/registro" component={RegistroPage} />
          <Route path="/tbh/pagine" component={PagineTbhPage} />
          <Route path="/tbh/brand-personalizzazioni" component={BrandPersonalizzazioniPage} />
          <Route path="/tbh/brand-personalizzazioni/visibilita-in-onda" component={VisibilitaInOndaPage} />
          <Route path="/brand-personalizzazioni">{() => <Redirect to="/tbh/brand-personalizzazioni" replace />}</Route>
          <Route path="/visibilita-in-onda">{() => <Redirect to="/tbh/brand-personalizzazioni/visibilita-in-onda" replace />}</Route>
          <Route path="/tbh/p/:slug">{(p) => <BrandPage slug={p.slug!} />}</Route>
          <Route path="/tbh/prodotti">{() => <Redirect to="/shop" replace />}</Route>

          {/* FASE 1 — pagina dedicata dell'entità (una scheda per entità reale) */}
          <Route path="/e/:slug" component={EntitaPage} />
          <Route path="/scheda/:slug">{(p) => <Redirect to={`/e/${p.slug}`} replace />}</Route>

          {/* Pannello riservato di allestimento: caricamento loghi, immagini, indirizzi, mappe */}
          {/* Il percorso piu specifico va dichiarato PRIMA di /allestimento */}
          <Route path="/allestimento/hub" component={ContentHubPage} />
          {/* ADMIN → SHOP → TV & STREAMING ADV: listino, add-on, registro Fidelity,
              pratiche e sincronizzazione Stripe. Protetto dal codice di allestimento. */}
          <Route path="/allestimento/tv-streaming-adv" component={PannelloAdvPage} />
          {/* ADMIN → GESTIONE MONITOR: campagne temporanee dei monitor ancora liberi,
              con viste e click reali. Protetto dal codice di allestimento. */}
          <Route path="/allestimento/monitor" component={PannelloMonitorPage} />
          <Route path="/allestimento/prodotti" component={PannelloProdottiPage} />
          <Route path="/allestimento/stripe" component={PannelloStripePage} />
          {/* SCANSIONE DEL SITO — elenco amministrativo dei difetti (17/09/2026, punto 8) */}
          <Route path="/allestimento/scansione" component={PannelloScansionePage} />
          {/* ADMIN → CANDIDATURE TOUCH MISS COOL: il flusso in otto passaggi del
              Kit 2027. Contiene dati personali, quindi codice di allestimento. */}
          <Route path="/allestimento/miss-cool" component={PannelloMissCoolPage} />
          {/* ADMIN → LIBRERIA MEDIA TBH: archivio unico delle immagini caricate,
              ricerca per categoria e stato, sostituzione, riuso e avviso prima di
              eliminare un file usato altrove. Protetto dal codice di allestimento.
              Non confondere con /media/libreria (vetrina pubblica statica). */}
          <Route path="/allestimento/media" component={PannelloMediaPage} />
          {/* ADMIN → SEZIONI AMMINISTRABILI: l'ingresso unico ai contenuti del sito
              (ordine del 28/09/2026). Si scegle la sezione, si aggiunge il contenuto,
              si caricano le foto, si scrive, si guarda l'anteprima e si pubblica.
              Protetto dal codice di allestimento. */}
          <Route path="/allestimento/sezioni" component={PannelloSezioniPage} />
          {/* ADMIN → PRODUZIONI → MUSICA → ROAD TO 2030 → CASTING: apertura e chiusura
              dei casting videoclip e pipeline delle candidature in sette fasi.
              Contiene dati personali, quindi codice di allestimento. */}
          <Route path="/allestimento/casting" component={PannelloCastingPage} />
          {/* Candidature online della bacheca lavoro (04/10/2026): dati personali, codice. */}
          <Route path="/allestimento/candidature-lavoro" component={PannelloCandidatureLavoroPage} />
          {/* Catalogo musicale: importazione da indirizzo, sorgenti, versioni, cover.
              Correzione del 29/09/2026: la musica si pubblica senza aspettare il video. */}
          <Route path="/allestimento/musica" component={PannelloMusicaPage} />
          {/* Canali TOUCH RADIO / TOUCH TV: modalità palinsesto, calendari separati, rendiconto. */}
          <Route path="/allestimento/canali-touch" component={PannelloCanaliTouchPage} />
          <Route path="/allestimento/channel" component={PannelloChannelPage} />
          <Route path="/allestimento/canali-tematici" component={PannelloCanaliTematiciPage} />
          <Route path="/allestimento/touch-social" component={PannelloTouchSocialPage} />
          <Route path="/allestimento/touch-talent" component={PannelloTouchTalentPage} />
          {/* GESTIONE CONTENUTI E PALINSESTO (28/10/2026): schede, collocazioni, playlist, Home, Channel e pagine, copie. */}
          <Route path="/allestimento/contenuti-palinsesto" component={PannelloContenutiPalinsestoPage} />
          <Route path="/allestimento" component={PannelloAllestimentoPage} />

          {/* Capitan Touch — a caccia dei neuroni perduti (gioco) + pannello dedicato */}
          <Route path="/allestimento/capitan-touch" component={PannelloCapitanPage} />
          <Route path="/capitan-touch" component={CapitanTouchPage} />
          <Route path="/neuroni">{() => <Redirect to="/capitan-touch" replace />}</Route>

          {/* PRODOTTI E GADGET dal pannello (specifica 16/09/2026, punti 4-6):
              schede vere, varianti, prezzi e acquisto con carta o WhatsApp.
              Convive con /shop, che resta il catalogo storico del Touch Plaza. */}
          <Route path="/gadget" component={GadgetPage} />
          <Route path="/gadget/:slug">{(p) => <GadgetSchedaPage slug={p.slug!} />}</Route>
          <Route path="/ordine-confermato" component={OrdineConfermatoPage} />

          {/* FASE 3 — pagina singola prodotto e servizio del Touch Plaza */}
          <Route path="/shop/p/:slug">{(p) => <ProdottoPage slug={p.slug!} />}</Route>
          <Route path="/shop/s/:slug">{(p) => <ServizioPage slug={p.slug!} />}</Route>

          {/* TV & STREAMING ADV — categoria Shop con configuratore e prezzi
              (pieno / promo / Fidelity TBH) decisi sempre lato server. */}
          <Route path="/tv-streaming-adv" component={TvStreamingAdvPage} />
          <Route path="/shop/tv-streaming-adv">
            {() => <Redirect to="/tv-streaming-adv" replace />}
          </Route>
          <Route path="/le-mie-campagne" component={LeMieCampagnePage} />

          {/* FASE 4 — Club, Circuito e i 25 Livelli */}
          <Route path="/club" component={ClubPage} />
          <Route path="/tbh/livelli/:slug">{(p) => <LivelloPage slug={p.slug!} />}</Route>

          {/* FASE 5 — Hospitality e TBH Assist */}
          <Route path="/hospitality" component={HospitalityPage} />
          <Route path="/hospitality/:categoria">{(p) => <HospitalityPage categoria={p.categoria!} />}</Route>
          <Route path="/hotel-aurora" component={HotelAuroraPage} />

          {/* Servizi & Referral — «Guadagna con noi» */}
          <Route path="/servizi-referral" component={ServiziReferralPage} />
          {/* «Hai un'attività? Dicci cosa ti serve.» — servizi TBH per le imprese (03/10/2026) */}
          <Route path="/servizi-imprese" component={ServiziImpresePage} />
          <Route path="/guadagna-con-noi">{() => <Redirect to="/servizi-referral" replace />}</Route>
          <Route path="/referral">{() => <Redirect to="/servizi-referral" replace />}</Route>
          <Route path="/tbh-assist" component={TbhAssistPage} />

          {/* FASE 6 — offerte del periodo, codici e spazi banner */}
          <Route path="/offerte" component={OffertePage} />

          {/* FASE 7 — edicola Touch Influencity Magazine, speciali annuali e News */}
          <Route path="/influencity" component={InfluencityPage} />
          <Route path="/influencity/speciali">{() => <InfluencityPage soloSpeciali />}</Route>
          <Route path="/influencity/:slug">{(p) => <NumeroPage slug={p.slug!} />}</Route>
          <Route path="/magazine">{() => <Redirect to="/influencity" replace />}</Route>
          <Route path="/news" component={NewsPage} />
          <Route path="/news/:categoria">{(p) => <NewsPage categoria={p.categoria!} />}</Route>

          {/* EDICOLA TBH — la rassegna quotidiana.
              Ordine obbligato: prima le pagine di servizio e le schede, per
              ultima /edicola/:categoria, altrimenti «oroscopo» o «giochi»
              verrebbero letti come se fossero il nome di una sezione.
              Un contenuto ha un solo indirizzo canonico: /edicola/articolo/:slug
              se è un articolo, /edicola/eventi/:slug se è un evento. */}
          <Route path="/edicola" component={EdicolaPage} />
          <Route path="/edicola/oroscopo">{() => <EdicolaOroscopoPage />}</Route>
          <Route path="/edicola/oroscopo/:segno">
            {(p) => <EdicolaOroscopoPage segno={p.segno!} />}
          </Route>
          <Route path="/edicola/giochi" component={EdicolaGiochiPage} />
          <Route path="/edicola/fonti" component={EdicolaFontiPage} />
          <Route path="/edicola/articolo/:slug">
            {(p) => <EdicolaContenutoPage slug={p.slug!} />}
          </Route>
          <Route path="/edicola/eventi/:slug">
            {(p) => <EdicolaContenutoPage slug={p.slug!} />}
          </Route>
          <Route path="/edicola/:categoria">
            {(p) => <EdicolaCategoriaPage categoria={p.categoria!} />}
          </Route>

          {/* Network */}
          <Route path="/network/rete-commerciale" component={ProspectPage} />
          <Route path="/network/media-partner" component={MediaPartnerPage} />
          <Route path="/network/circuito" component={CircuitoPage} />
          <Route path="/network/clienti">{() => <NetworkPage tipo="clienti" />}</Route>
          <Route path="/network/sponsor">{() => <NetworkPage tipo="sponsor" />}</Route>
          <Route path="/network/partner">{() => <NetworkPage tipo="partner" />}</Route>

          {/* SCHEDA INTERNA DI UNA POSIZIONE CENSITA — dove porta APRI SCHEDA.
              Standard unico: mini-homepage del luogo, dentro la piattaforma. */}
          <Route path="/luogo/:slug">{(p) => <LuogoPage slug={p.slug!} />}</Route>

          {/* Territorio */}
          <Route path="/territorio/mappa" component={MappaPage} />
          <Route path="/territorio/spazi" component={TerritoriPage} />
          <Route
            path="/territorio/rimini/dove-dormire-mangiare-divertirsi"
            component={RiminiDoveDormirePage}
          />

          {/* Sport — struttura fissa (15/09/2026): /sport, /sport/calcio,
              /sport/highlights, /sport/calendario, /sport/motorsport.
              Le rotte storiche restano valide: nessun link si rompe (§2). */}
          {/* TBH SPORT — le 4 esperienze per società sportive (listino 15/10/2026). */}
          <Route path="/sport/esperienze">{() => <TbhSportEsperienzePage />}</Route>
          <Route path="/sport/esperienze/:slug">{(p) => <TbhSportEsperienzePage ancora={p.slug} />}</Route>
          <Route path="/tbh-sport">{() => <Redirect to="/sport/esperienze" replace />}</Route>
          <Route path="/tbh-sport/esperienze">{() => <Redirect to="/sport/esperienze" replace />}</Route>
          <Route path="/sport/calendario" component={SportCalendarioPage} />
          <Route path="/sport/societa-seguite" component={SocietaSeguitePage} />
          <Route path="/sport/highlights-dm" component={HighlightsDmPage} />
          {/* BLOCCO 1 · doppione vero risolto: /sport/highlights mostrava la stessa
              pagina dell'archivio DM. Canonica: /sport/highlights-dm. */}
          <Route path="/sport/highlights">{() => <Redirect to="/sport/highlights-dm" replace />}</Route>
          <Route path="/sport/squadre" component={SquadrePage} />
          <Route path="/sport/squadre/junior-gambettola">{() => <ChannelInAllestimentoPage slug="junior-gambettola" />}</Route>
          <Route path="/sport/squadre/:slug">{(p) => <SquadraPage slug={p.slug!} />}</Route>
          <Route path="/sport/calcio" component={CalcioPage} />
          <Route path="/sport/motorsport" component={MotorsportPage} />

          {/* Hugoland — le fiere internazionali di Touch Travels (additivo: le rotte
              storiche restano tutte valide, si aggiunge solo il nuovo nome). */}
          {/* 18/10/2026: Touch Travels separato da Hugoland (che resta su /hugoland con EsteroPage). */}
          <Route path="/touch-travels">{() => <ChannelInAllestimentoPage slug="touch-travels" />}</Route>
          <Route path="/hugoland" component={EsteroPage} />
          {/* BLOCCO 1 · tre indirizzi mostravano la stessa pagina «fiere
              internazionali». Canonica: /eventi/fiere-internazionali (canale FIERE).
              I due indirizzi di marca restano validi come redirect. */}
          <Route path="/hugoland/fiere-internazionali">{() => <Redirect to="/eventi/fiere-internazionali" replace />}</Route>
          <Route path="/touch-travels/fiere-internazionali">{() => <Redirect to="/eventi/fiere-internazionali" replace />}</Route>
          <Route path="/eventi/fiere-internazionali" component={EsteroPage} />

          {/* Portale a monitor — Sanremo e Musica */}
          <Route path="/sanremo" component={SanremoPage} />
          <Route path="/sanremo/:slug">{(p) => <LuogoSanremoPage slug={p.slug!} />}</Route>
          {/* 04/11/2026 (round 16): scheda di ogni brano + calendario uscite */}
          <Route path="/musica/brano/:id" component={SchedaBranoMusicaPage} />
          <Route path="/musica/calendario-uscite" component={CalendarioUscitePage} />
          {/* 04/11/2026 (round 17): discografia del Touch Music Records Channel */}
          <Route path="/musica/discografia" component={DiscografiaPage} />
          <Route path="/musica" component={MusicaPage} />
          <Route path="/musica/jc-hugo" component={MusicaPage} />
          {/* TOUCH MUSIC RADIO TV (14/10/2026): pagina del format con il PALINSESTO 24/7 protagonista. */}
          {/* 15/10/2026 — TBH è il gruppo: TOUCH RADIO (audio) e TOUCH TV (video) sono due canali
              distinti; TOUCH MUSIC, DM ON AIR e DM HIGHLIGHTS sono RUBRICHE. La vecchia pagina
              pages/radio.tsx resta nel progetto (non si cancella nulla) ma non è più instradata. */}
          <Route path="/radio">{() => <CanaleTouchPage canale="radio" />}</Route>
          <Route path="/radio/palinsesto">{() => <CanaleTouchPage canale="radio" ancora="palinsesto" />}</Route>
          <Route path="/tv">{() => <CanaleTouchPage canale="tv" />}</Route>
          <Route path="/tv/palinsesto">{() => <CanaleTouchPage canale="tv" ancora="palinsesto" />}</Route>
          <Route path="/rubriche" component={RubricheIndice} />
          <Route path="/rubriche/:slug">{(p) => <RubricaScheda slug={p.slug ?? ""} />}</Route>
          <Route path="/touch-music-radio-tv">{() => <Redirect to="/radio" replace />}</Route>
          <Route path="/dj-hugo">{() => <Redirect to="/musica/jc-hugo" replace />}</Route>

          {/* Casting videoclip e Road to 2030 */}
          <Route path="/casting" component={CastingPage} />
          <Route path="/casting/:slug" component={CastingSchedaPage} />
          <Route path="/tbh/produzioni/road-to-2030" component={RoadTo2030Page} />
          <Route path="/road-to-2030">{() => <Redirect to="/tbh/produzioni/road-to-2030" replace />}</Route>

          {/* Media */}
          <Route path="/media/libreria" component={MediaLibraryPage} />
          <Route path="/media/streaming" component={StreamingPage} />
          <Route path="/media/radio-tv" component={RadioTvCuriositaPage} />
          {/* BLOCCO 1 · doppione vero risolto: canonica /media/radio-tv. */}
          <Route path="/media/curiosita">{() => <Redirect to="/media/radio-tv" replace />}</Route>
          <Route path="/media" component={MediaPage} />
          {/* DM — struttura fissa (15/09/2026): solo /dm e /dm/programmi.
              I singoli programmi sono una sezione di /dm/programmi (?p=slug),
              non una pagina nuova. Le vecchie rotte /media/dm/* restano
              raggiungibili come reindirizzamenti: nessun link si rompe (§2). */}
          <Route path="/dm" component={DmPage} />
          <Route path="/dm/programmi" component={DmProgrammiPage} />
          <Route path="/media/dm">{() => <Redirect to="/dm" replace />}</Route>
          <Route path="/media/dm/crew" component={DmCrewPage} />
          <Route path="/media/dm/programmi">{() => <Redirect to="/dm/programmi" replace />}</Route>
          <Route path="/media/dm/:slug">
            {(p) => <Redirect to={`/dm/programmi?p=${p.slug ?? ""}`} replace />}
          </Route>
          <Route path="/media/giochi" component={GiochiPage} />
          <Route path="/media/reality-show/academy" component={AcademyRealityPage} />
          {/* BLOCCO 1 · doppione vero risolto: canonica /media/reality-show/academy
              (sta dentro il brand Reality Show, come /sport/squadre per lo sport). */}
          <Route path="/academy-reclutamento">{() => <Redirect to="/media/reality-show/academy" replace />}</Route>
          <Route path="/media/reality-show">{() => <BrandPage slug="reality-show" />}</Route>
          <Route path="/media/heddy-video">{() => <BrandPage slug="heddy-video" />}</Route>

          {/* Eventi */}
          {/* Le sotto-pagine vanno dichiarate prima della master: wouter prende
              la prima corrispondenza e /eventi/miss-cool le coprirebbe tutte. */}
          <Route path="/eventi/miss-cool/adesione" component={MissCoolAdesionePage} />
          <Route path="/eventi/miss-cool/schede" component={MissCoolSchedePage} />
          <Route path="/eventi/miss-cool/regolamento" component={MissCoolRegolamentoPage} />
          <Route path="/eventi/miss-cool/premiazioni" component={MissCoolPremiazioniPage} />
          <Route path="/eventi/miss-cool" component={MissCoolPage} />

          {/* Lavoro & Casting */}
          <Route path="/lavoro-casting" component={LavoroCastingPage} />
          <Route path="/lavoro-casting/bacheca" component={BachecaPage} />
          {/* TBH Lavoro (06/10/2026): scheda annuncio + sezioni del contenitore. */}
          <Route path="/lavoro-casting/bacheca/:slug" component={BachecaSchedaPage} />
          <Route path="/lavoro-casting/candidature" component={LavoroCandidaturePage} />
          <Route path="/lavoro-casting/formazione" component={LavoroFormazionePage} />
          <Route path="/lavoro-casting/fonti-esterne" component={LavoroFontiPage} />
          <Route path="/lavoro-casting/aziende" component={LavoroAziendePage} />
          {/* Modulo online di un annuncio (04/10/2026): «Voglio il modulo online». */}
          <Route path="/lavoro-casting/candidati/:annuncio" component={CandidaturaLavoroPage} />
          <Route path="/istituzioni" component={IstituzioniPage} />

          {/* Contatti — mondo n.10 del menu (29/08/2026): solo contatti reali confermati */}
          <Route path="/contatti" component={ContattiPage} />

          {/* Editore · CEO · Artista · Imprenditore — pagina personale (05/09/2026) */}
          <Route path="/ceo" component={CeoPage} />
          <Route path="/claudio-ugolini">{() => <Redirect to="/ceo" replace />}</Route>
          <Route path="/editore">{() => <Redirect to="/ceo" replace />}</Route>

          {/* Anagrafica master + scheda master unica (motore anti-doppione, 30/08/2026) */}
          <Route path="/anagrafica" component={AnagraficaPage} />
          <Route path="/master/:slug" component={SchedaMasterPage} />

          {/* TBH App (download, archivio, documentazione) + Management (contratti) — 30/08/2026 */}
          <Route path="/tbh-app" component={TbhAppPage} />
          <Route path="/management" component={ManagementPage} />

          {/* Pagamenti e finanziamenti */}
          <Route path="/pagamenti" component={PagamentiPage} />
          <Route path="/finanziamenti">{() => <Redirect to="/pagamenti" replace />}</Route>
          <Route path="/touch-pay">{() => <Redirect to="/pagamenti" replace />}</Route>

          <Route path="/in-allestimento" component={AllestimentoPage} />
          <Route path="/design" component={DesignPage} />

          {/* Vecchi URL → nuovi (301 lato client) */}
          {REDIRECTS.map(([from, to]) => (
            <Route key={from} path={from}>
              {() => <Redirect to={to} replace />}
            </Route>
          ))}

          {/* Ogni link non ancora pronto atterra su "Stiamo lavorando per voi" */}
          <Route component={AllestimentoPage} />
        </Switch>
        {/* …e in fondo alle pagine Channel le loro attività nel modello comune (URL e contenuti invariati). */}
        <AttivitaInPaginaChannel />
        </ErrorBoundary>
      </Layout>
      {/* Do not remove — off by default, activated by parent iframe via postMessage */}
      {import.meta.env.DEV && <AgentFeedback />}
      {/* "Made with Runable" badge - if user asks to remove the runable badge, remove this code as well as comment */}
      {<RunableBadge />}
    </Provider>
  );
}

export default App;
