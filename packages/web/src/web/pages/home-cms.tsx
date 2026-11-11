import { useEffect } from "react";
import { Link, Redirect, useSearch } from "wouter";
import { ExternalLink, Loader2 } from "lucide-react";
import { CardModello, GIALLO, ROSSO_DM } from "../components/struttura";
import { FilaCms, SchedaCms, accentoCms } from "../components/cms-pubblico";
import { PlayerPlaylistCms } from "../components/playlist-cms-player";
import { useCodiceAllestimento } from "../lib/codice-allestimento";
import { useHomeCms, usePaginaCms, type HomeCmsDati } from "../queries/contenuti-palinsesto";

/**
 * /home/:slug — Home aggiunte dal pannello «Gestione contenuti e palinsesto» (Home 2.0, 3.0 e
 * successive, senza limite). Ogni Home ha i suoi blocchi di Channel, i suoi caroselli e i suoi
 * palinsesti; i Channel e le attività restano UNA scheda con UN URL, riusata in più Home.
 * Bozza = non visibile; con il codice di allestimento e «?anteprima=1» si vede la bozza.
 *
 * /pagina/:slug — Channel o pagina aggiunti dal pannello, con i contenuti collocati su di essi.
 */

type Pubblicata = Extract<HomeCmsDati, { pubblicata: true }>;
type Blocco = Pubblicata["blocchi"][number];
type ChannelCms = Blocco["channel"][number];

function useTitolo(t: string | null | undefined) {
  useEffect(() => {
    if (t) document.title = `${t} · TBH-WEB`;
  }, [t]);
}

export function TesseraChannelCms({ c }: { c: ChannelCms }) {
  const dm = c.sezione === "dm";
  const href = c.pagina ?? c.scheda;
  return (
    <CardModello
      href={href}
      esterno={c.esterno}
      titolo={c.nome}
      immagine={c.logo ? { src: c.logo } : null}
      colore={dm ? ROSSO_DM : GIALLO}
      bordo={dm ? ROSSO_DM : undefined}
      cta={c.pagina ? "APRI CHANNEL" : "APRI SCHEDA"}
      testid={`channel-${c.slug}`}
    />
  );
}

function Avviso({ titolo, testo }: { titolo: string; testo: string }) {
  return (
    <div className="mx-auto flex max-w-[900px] flex-col gap-3 px-4 py-16 text-center" data-testid="cms-avviso">
      <h1 className="tbh-display tbh-h2" style={{ color: GIALLO }}>
        {titolo}
      </h1>
      <p className="text-sm text-white/60">{testo}</p>
      <Link href="/" className="mx-auto mt-2 rounded-full px-5 py-2 text-xs font-extrabold tracking-[0.14em] text-black" style={{ background: GIALLO }}>
        TORNA ALLA HOME
      </Link>
    </div>
  );
}

export default function HomeCmsPage({ slug }: { slug: string }) {
  const search = useSearch();
  const { codice } = useCodiceAllestimento();
  const anteprima = new URLSearchParams(search).get("anteprima") === "1" && !!codice;
  const q = useHomeCms(slug, anteprima ? codice : undefined, anteprima);
  const d = q.data;
  useTitolo(d?.home?.nome);

  if (slug === "0") return <Redirect to="/" replace />;
  if (q.isLoading)
    return (
      <div className="flex justify-center py-24">
        <Loader2 className="h-6 w-6 animate-spin text-white/50" />
      </div>
    );
  if (q.isError) return <Avviso titolo="Home non raggiungibile" testo="Il server non ha risposto. Riprova fra qualche istante." />;
  if (!d?.home) return <Avviso titolo="Home inesistente" testo={`Nessuna Home con l'indirizzo /home/${slug}.`} />;
  if (!d.pubblicata) return <Avviso titolo={d.home.nome} testo="Questa Home non è ancora pubblicata." />;

  return (
    <div className="bg-black pb-16 text-white" data-testid={`home-cms-${d.home.slug}`}>
      {d.anteprima && (
        <div className="mx-auto max-w-[1500px] px-4 pt-4 md:px-8">
          <p className="rounded-2xl border px-4 py-3 text-[12px] font-extrabold tracking-[0.16em]" style={{ borderColor: `${GIALLO}80`, color: GIALLO }} data-testid="home-cms-anteprima">
            ANTEPRIMA DELLA BOZZA · {d.home.stato === "attivo" ? "il pubblico vede la versione pubblicata" : "non visibile al pubblico"}
          </p>
        </div>
      )}
      <header className="mx-auto max-w-[1500px] px-4 pt-6 md:px-8">
        <h1 className="tbh-display tbh-h1 leading-[0.95]" style={{ color: GIALLO }}>
          {d.home.nome}
        </h1>
      </header>

      {d.palinsesti.length > 0 && (
        <div className="mx-auto mt-6 grid max-w-[1500px] grid-cols-1 gap-6 px-4 md:px-8 lg:grid-cols-2">
          {d.palinsesti.map((p) => (
            <PlayerPlaylistCms key={p.id} playlist={p} dove={`/home/${d.home.slug}`} />
          ))}
        </div>
      )}

      <div className="mx-auto mt-10 flex max-w-[1500px] flex-col gap-10 px-4 md:px-8">
        {d.blocchi.map((b) => (
          <div key={b.id} data-testid={`blocco-${b.id}`}>
            {b.titolo && b.channel.length > 0 && <h2 className="mb-3 text-[13px] font-black tracking-[0.2em] text-white/80 md:text-sm">{b.titolo}</h2>}
            {b.channel.length > 0 && (
              <section aria-label={b.titolo} className="grid grid-cols-1 gap-4 min-[420px]:grid-cols-2 md:grid-cols-3 xl:grid-cols-6">
                {b.channel.map((c) => (
                  <TesseraChannelCms key={c.slug} c={c} />
                ))}
              </section>
            )}
            {b.carosello && (
              <div className="mt-6">
                <FilaCms titolo={b.carosello.nome} voci={b.carosello.voci} accento={accentoCms(b.carosello.accento)} testid={`carosello-${b.carosello.id}`} />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export function PaginaCmsPage({ slug }: { slug: string }) {
  const { codice } = useCodiceAllestimento();
  const q = usePaginaCms(slug, codice || undefined);
  const d = q.data;
  const p = d?.pagina;
  useTitolo(p?.nome);

  if (q.isLoading)
    return (
      <div className="flex justify-center py-24">
        <Loader2 className="h-6 w-6 animate-spin text-white/50" />
      </div>
    );
  if (q.isError) return <Avviso titolo="Pagina non raggiungibile" testo="Il server non ha risposto. Riprova fra qualche istante." />;
  if (!p) return <Avviso titolo="Pagina non disponibile" testo={d && "sospesa" in d && d.sospesa ? "Questa pagina è sospesa." : `Nessuna pagina con l'indirizzo /pagina/${slug}.`} />;

  const colore = p.sezione === "dm" ? ROSSO_DM : GIALLO;
  return (
    <div className="mx-auto flex max-w-[1500px] flex-col gap-6 px-4 py-8 text-white md:px-8" data-testid={`pagina-cms-${p.slug}`}>
      <header className="flex flex-col gap-4 md:flex-row md:items-center">
        {p.logo && <img src={p.logo} alt={p.nome} className="h-28 w-auto max-w-[280px] rounded-xl bg-black object-contain" />}
        <div className="flex flex-col gap-2">
          <h1 className="tbh-display tbh-h1 leading-[0.95]" style={{ color: colore }}>
            {p.nome}
          </h1>
          {p.descrizione && <p className="max-w-3xl whitespace-pre-line text-sm text-white/70">{p.descrizione}</p>}
          {p.pagina && (
            <a
              href={p.pagina}
              {...(p.esterno ? { target: "_blank", rel: "noopener noreferrer" } : {})}
              className="inline-flex w-fit items-center gap-1 rounded-full px-4 py-2 text-xs font-extrabold tracking-[0.14em] text-black"
              style={{ background: colore }}
            >
              APRI {p.tipo === "pagina" ? "IL SITO" : "IL CHANNEL"} {p.esterno && <ExternalLink className="h-3 w-3" />}
            </a>
          )}
        </div>
      </header>
      {d.voci.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 min-[560px]:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 [&>*]:w-full [&>*>div]:w-full" data-testid="pagina-cms-voci">
          {d.voci.map((v) => (
            <SchedaCms key={v.collocazione} v={v} accento={colore} />
          ))}
        </div>
      ) : (
        <p className="rounded-xl border border-dashed border-white/15 px-4 py-6 text-center text-[11px] font-bold uppercase tracking-[0.2em] text-white/40">Contenuti in allestimento</p>
      )}
    </div>
  );
}
