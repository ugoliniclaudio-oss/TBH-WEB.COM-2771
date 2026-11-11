/**
 * IMPORTAZIONE PROFILI SUNO → catalogo musicale (brani_master + brani_sorgenti).
 *
 * Uso (da packages/web):  bun --env-file=../../.env /home/user/tbh-web/_ricerca-radio/importa-suno.ts [--scrivi]
 * Senza --scrivi fa solo il conteggio (prova a secco).
 *
 * Fonte: suno.json (metadati pubblici scaricati da suno_fetch.py). Rieseguibile: le
 * sorgenti già presenti (stesso UUID Suno) non vengono mai duplicate.
 */
import { readFileSync } from "node:fs";
import { eq } from "drizzle-orm";
import { db } from "../packages/web/src/api/database";
import * as schema from "../packages/web/src/api/database/schema";
import { catalogoCompleto } from "../packages/web/src/api/lib/catalogo-musicale";
import {
  chiaveTitolo,
  nuovoIdBrano,
  titoloPulito,
} from "../packages/web/src/api/data/sorgenti-musicali";

type Clip = {
  id: string;
  title: string;
  image: string | null;
  duration: number | null;
  created_at: string;
  is_public: boolean;
  status: string;
  display_name: string;
  handle: string;
};

const scrivi = process.argv.includes("--scrivi");
const TORNATA = "IMPORTAZIONE PROFILI SUNO 14/10/2026";
const dati = JSON.parse(readFileSync("/home/user/tbh-web/_ricerca-radio/suno.json", "utf8")) as Record<
  string,
  { clips: Clip[] }
>;

const clips = Object.values(dati)
  .flatMap((p) => p.clips)
  .filter((c) => c.status === "complete" && c.is_public && c.title.trim());

const catalogo = await catalogoCompleto();
const perUuid = new Map<string, { branoId: string; sorgenteId: number | null }>();
for (const b of catalogo)
  for (const s of b.sorgenti)
    if (s.piattaforma === "suno" && s.idEsterno) perUuid.set(s.idEsterno, { branoId: b.id, sorgenteId: s.id });
const perChiave = new Map<string, string>();
for (const b of catalogo) if (b.chiaveTitolo && !perChiave.has(b.chiaveTitolo)) perChiave.set(b.chiaveTitolo, b.id);

// Gruppi per titolo: le due versioni che Suno genera insieme diventano un solo brano.
const gruppi = new Map<string, Clip[]>();
for (const c of clips) {
  const k = chiaveTitolo(titoloPulito(c.title)) || `uuid-${c.id}`;
  const l = gruppi.get(k) ?? [];
  l.push(c);
  gruppi.set(k, l);
}

let creati = 0;
let sorgentiNuove = 0;
let durateAggiornate = 0;
let giaPresenti = 0;

for (const [chiave, lista] of gruppi) {
  lista.sort((a, b) => a.created_at.localeCompare(b.created_at));
  const conVersioni = lista.length > 1;

  // Il brano: quello che ha già una di queste sorgenti, oppure lo stesso titolo, oppure nuovo.
  let branoId =
    lista.map((c) => perUuid.get(c.id)?.branoId).find((x): x is string => !!x) ??
    perChiave.get(chiave) ??
    null;

  if (!branoId) {
    const primo = lista[0]!;
    branoId = nuovoIdBrano();
    const titolo = titoloPulito(primo.title);
    const quando = new Date(lista[lista.length - 1]!.created_at);
    creati += 1;
    if (scrivi)
      await db.insert(schema.braniMaster).values({
        id: branoId,
        titolo,
        chiaveTitolo: chiaveTitolo(titolo),
        // Nome pubblico del profilo Suno: dato reale della piattaforma, non dedotto dal titolo.
        artista: primo.display_name || null,
        cover: primo.image,
        genere: null,
        anno: null,
        descrizione: null,
        notaInterna: `Importato dal profilo Suno @${primo.handle}.`,
        stato: "da-verificare",
        tornata: TORNATA,
        nascosto: false,
        ordine: 0,
        createdAt: quando,
        updatedAt: quando,
      });
    perChiave.set(chiave, branoId);
  }

  for (const [i, c] of lista.entries()) {
    const durata = c.duration ? Math.round(c.duration) : null;
    const esistente = perUuid.get(c.id);
    if (esistente) {
      giaPresenti += 1;
      if (esistente.sorgenteId && durata) {
        durateAggiornate += 1;
        if (scrivi)
          await db
            .update(schema.braniSorgenti)
            .set({ durataSec: durata })
            .where(eq(schema.braniSorgenti.id, esistente.sorgenteId));
      }
      continue;
    }
    sorgentiNuove += 1;
    if (scrivi)
      await db.insert(schema.braniSorgenti).values({
        branoId,
        tipo: "audio",
        piattaforma: "suno",
        url: `https://suno.com/song/${c.id}`,
        urlOriginale: `https://suno.com/song/${c.id}`,
        idEsterno: c.id,
        versione: conVersioni ? `Versione ${i + 1}` : null,
        cover: c.image,
        principale: i === 0 && !lista.some((x) => perUuid.has(x.id)),
        nota: null,
        ordine: i,
        durataSec: durata,
        createdAt: new Date(c.created_at),
      });
    perUuid.set(c.id, { branoId, sorgenteId: null });
  }
}

console.log(
  JSON.stringify(
    { scrivi, clip: clips.length, gruppi: gruppi.size, creati, sorgentiNuove, giaPresenti, durateAggiornate },
    null,
    1,
  ),
);
process.exit(0);
