import { useEffect, useState } from "react";
import { useCodiceAllestimento } from "../lib/codice-allestimento";
import { useImpostaSpazio } from "../queries/channel-registro";

/**
 * Compilazione di uno SPAZIO Channel vuoto (NOVA TV, BEST ENTERTAINMENT, spazio libero):
 * solo nome + indirizzo (https://… o pagina interna /…). Visibile solo col codice di
 * allestimento; i visitatori non vedono niente. Campi vuoti = spazio di nuovo libero.
 */
export function ModuloSpazio({ slug, nome, url }: { slug: string; nome: string; url: string }) {
  const { codice } = useCodiceAllestimento();
  const imposta = useImpostaSpazio();
  const [n, setN] = useState(nome);
  const [u, setU] = useState(url);
  useEffect(() => {
    setN(nome);
    setU(url);
  }, [nome, url]);

  if (!codice) return null;
  const campo = "w-full rounded-xl border border-white/15 bg-black/50 px-3 py-2 text-sm text-white outline-none focus:border-[#d7ff00]";
  return (
    <section className="mt-8 flex flex-col gap-3 rounded-xl border border-dashed border-[#d7ff00]/50 p-5" data-testid="modulo-spazio">
      <h2 className="text-[12px] font-black tracking-[0.2em] text-[#d7ff00]">COMPILA LO SPAZIO (ALLESTIMENTO)</h2>
      <p className="text-xs text-white/55">
        Inserire solo dati confermati dal media partner. Nome e indirizzo compaiono subito su /channel in questo ambito.
      </p>
      <div className="grid gap-3 md:grid-cols-2">
        <label className="flex flex-col gap-1 text-xs text-white/60">
          Nome del Channel
          <input className={campo} value={n} maxLength={120} onChange={(e) => setN(e.target.value)} />
        </label>
        <label className="flex flex-col gap-1 text-xs text-white/60">
          Indirizzo (https://… o /pagina)
          <input className={campo} value={u} maxLength={1000} onChange={(e) => setU(e.target.value)} placeholder="https://" />
        </label>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          disabled={imposta.isPending}
          onClick={() => imposta.mutate({ codice, slug, nome: n.trim(), url: u.trim() })}
          className="rounded-full bg-[#d7ff00] px-5 py-2 text-[11px] font-extrabold tracking-[0.14em] text-black disabled:opacity-40"
        >
          SALVA
        </button>
        {imposta.isSuccess && <span className="text-xs text-[#d7ff00]">Salvato.</span>}
        {imposta.isError && <span className="text-xs text-[#ff8a8a]">{imposta.error instanceof Error ? imposta.error.message : "Non salvato."}</span>}
      </div>
    </section>
  );
}
