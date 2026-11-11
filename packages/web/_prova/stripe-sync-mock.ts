/**
 * Prova locale della sincronizzazione Stripe → Touch Plaza SENZA chiavi vere.
 * Stripe è simulato intercettando fetch verso api.stripe.com.
 * Uso: cd packages/web && bun --env-file=../../.env _prova/stripe-sync-mock.ts
 * Alla fine cancella tutto ciò che ha creato (account, schede, eventi, ordini).
 */
import { call } from "@orpc/server";
import { eq, inArray } from "drizzle-orm";
import { db } from "../src/api/database";
import * as schema from "../src/api/database/schema";
import { sincronizzaAccount, webhookCatalogo } from "../src/api/lib/stripe-sync";
import { catalogoCompleto, vetrinaTouchPlaza, articoloTouchPlaza, dimenticaCatalogo } from "../src/api/lib/catalogo-touch-plaza";
import { trovaAccount } from "../src/api/lib/stripe-account";
import { stripeSync } from "../src/api/routes/stripe-sync";

const ACC = "prova-mock";
const SEGRETO = "whsec_prova_mock_123";
const MARSHALL = "https://buy.stripe.com/4gM8wJ6Ul4wpg0b42sfQI04";

type P = { id: string; name: string; description: string | null; images: string[]; active: boolean; livemode: boolean };
type Pr = { id: string; active: boolean; currency: string; unit_amount: number; type: "one_time" | "recurring"; recurring: { interval: "month"; interval_count: number } | null; nickname: string | null; product: string };
const prodotti: P[] = [
  { id: "prod_MARSH", name: "Visita Medica Marshall Motorsport", description: "Visita medica", images: [], active: true, livemode: false },
  { id: "prod_PROVA", name: "Prodotto di prova TBH", description: "Articolo di prova della sync", images: ["https://files.stripe.com/prova-1.png"], active: true, livemode: false },
  { id: "prod_MULTI", name: "Abbonamento prova TBH", description: "Due varianti", images: ["https://files.stripe.com/multi.png"], active: true, livemode: false },
  { id: "prod_INCOMP", name: "Articolo incompleto prova", description: null, images: [], active: true, livemode: false },
  { id: "prod_ARCH", name: "Articolo archiviato prova", description: "x", images: ["https://files.stripe.com/x.png"], active: false, livemode: false },
];
const prezzi: Pr[] = [
  { id: "price_MARSH", active: true, currency: "eur", unit_amount: 7200, type: "one_time", recurring: null, nickname: null, product: "prod_MARSH" },
  { id: "price_PROVA1", active: true, currency: "eur", unit_amount: 1000, type: "one_time", recurring: null, nickname: null, product: "prod_PROVA" },
  { id: "price_MULTI_A", active: true, currency: "eur", unit_amount: 2900, type: "one_time", recurring: null, nickname: "Annuale", product: "prod_MULTI" },
  { id: "price_MULTI_M", active: true, currency: "eur", unit_amount: 490, type: "recurring", recurring: { interval: "month", interval_count: 1 }, nickname: "Mensile", product: "prod_MULTI" },
  { id: "price_INCOMP", active: true, currency: "eur", unit_amount: 500, type: "one_time", recurring: null, nickname: null, product: "prod_INCOMP" },
];
const link = [
  { id: "plink_MARSH", url: MARSHALL, active: true, righe: ["price_MARSH"] },
  { id: "plink_MULTI_A", url: "https://buy.stripe.com/test_multi_annuale", active: true, righe: ["price_MULTI_A"] },
  // link con DUE articoli: non va mai usato
  { id: "plink_DOPPIO", url: "https://buy.stripe.com/test_doppio", active: true, righe: ["price_PROVA1", "price_MULTI_M"] },
];
const sessioniCreate: string[] = [];

const fetchVero = globalThis.fetch;
globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
  const url = new URL(String(input));
  if (url.hostname !== "api.stripe.com") return fetchVero(input, init);
  const ok = (j: unknown) => new Response(JSON.stringify(j), { status: 200 });
  const ko = (m: string) => new Response(JSON.stringify({ error: { message: m } }), { status: 404 });
  const lista = (d: unknown[]) => ok({ data: d, has_more: false });
  const p = url.pathname.replace(/^\/v1/, "");
  const q = url.searchParams;
  if ((init?.method ?? "GET") === "POST" && p === "/checkout/sessions") {
    const body = String(init?.body);
    sessioniCreate.push(decodeURIComponent(body));
    return ok({ id: `cs_test_${sessioniCreate.length}`, url: `https://checkout.stripe.com/c/pay/cs_test_${sessioniCreate.length}` });
  }
  if (p === "/products") return lista(prodotti);
  let m = p.match(/^\/products\/(.+)$/);
  if (m) return prodotti.find((x) => x.id === m![1]) ? ok(prodotti.find((x) => x.id === m![1])) : ko(`No such product: '${m[1]}'`);
  if (p === "/prices")
    return lista(prezzi.filter((x) => (q.get("active") !== "true" || x.active) && (!q.get("product") || x.product === q.get("product"))));
  m = p.match(/^\/prices\/(.+)$/);
  if (m) return ok(prezzi.find((x) => x.id === m![1]));
  if (p === "/payment_links") return lista(link.filter((l) => l.active).map(({ righe: _r, ...l }) => l));
  m = p.match(/^\/payment_links\/(.+)\/line_items$/);
  if (m) return lista((link.find((l) => l.id === m![1])?.righe ?? []).map((id) => ({ price: { id }, quantity: 1 })));
  return ko(`mock: ${p} non previsto`);
}) as typeof fetch;

let errori = 0;
function verifica(cond: unknown, msg: string) {
  console.log(`${cond ? "OK  " : "FAIL"} ${msg}`);
  if (!cond) errori += 1;
}

async function firma(corpo: string, segreto = SEGRETO) {
  const t = Math.floor(Date.now() / 1000);
  const k = await crypto.subtle.importKey("raw", new TextEncoder().encode(segreto), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const s = await crypto.subtle.sign("HMAC", k, new TextEncoder().encode(`${t}.${corpo}`));
  return `t=${t},v1=${[...new Uint8Array(s)].map((b) => b.toString(16).padStart(2, "0")).join("")}`;
}

async function vetrina() {
  dimenticaCatalogo();
  return vetrinaTouchPlaza();
}

const ordiniCreati: number[] = [];
async function acquista(slug: string, priceId: string) {
  try {
    const r = await call(stripeSync.acquista, { slug, priceId, origin: "https://tbh-web.com" });
    const n = Number(String(r?.url).match(/tp-ordine-(\d+)/)?.[1] ?? sessioniCreate.at(-1)?.match(/tp-ordine-(\d+)/)?.[1]);
    if (n) ordiniCreati.push(n);
    return r;
  } catch (e) {
    return { errore: (e as { code?: string }).code ?? (e as Error).message };
  }
}

async function pulisci() {
  const eventi = await db.select().from(schema.stripeEventi).where(eq(schema.stripeEventi.account, ACC));
  if (eventi.length) await db.delete(schema.stripeEventi).where(eq(schema.stripeEventi.account, ACC));
  await db.delete(schema.stripeProdotti).where(eq(schema.stripeProdotti.account, ACC));
  await db.delete(schema.stripeAccount).where(eq(schema.stripeAccount.nome, ACC));
  if (ordiniCreati.length) await db.delete(schema.orders).where(inArray(schema.orders.id, ordiniCreati));
  dimenticaCatalogo();
}

try {
  await pulisci();
  await db.insert(schema.stripeAccount).values({ nome: ACC, origine: "pannello", chiave: "sk_test_prova_mock_0000", segretoWebhook: SEGRETO });
  verifica(await trovaAccount(ACC), "account di prova collegato (chiave solo lato server)");

  /* 1. prima importazione */
  const r = await sincronizzaAccount((await trovaAccount(ACC))!);
  console.log("   sync:", JSON.stringify(r));
  verifica(r.ok && r.creati === 4, "prima importazione: 4 Product attivi importati, l'archiviato ignorato");

  let v = await vetrina();
  const marsh = v.filter((p) => /marshall/i.test(p.title));
  verifica(marsh.length === 1, `Marshall compare UNA volta in vetrina (${marsh.length})`);
  verifica(marsh[0]?.slug === "visita-medica-marshall-motorsport", "la scheda del sito è stata AGGANCIATA al Product (stesso slug, niente doppione)");
  verifica(marsh[0]?.stripe?.varianti[0]?.importoCents === 7200, "prezzo Marshall confermato da Stripe: 72,00 €");
  verifica(marsh[0]?.stripe?.stato === "pubblicato", `Marshall pubblicato (${marsh[0]?.stripe?.stato})`);
  verifica(marsh[0]?.image === "/shop/visita-medica-marshall-motorsport.jpg", "Marshall tiene la slide del sito");

  const prova = v.filter((p) => p.stripe?.productId === "prod_PROVA");
  verifica(prova.length === 1, "prodotto di prova compare UNA volta");
  verifica(prova[0]?.stripe?.stato === "pubblicato", `prova pubblicato (${prova[0]?.stripe?.stato} ${prova[0]?.stripe?.mancanti})`);
  verifica(prova[0]?.stripe?.varianti[0]?.paymentLink === null, "il link con due articoli NON è stato legato al prodotto di prova");

  const multi = v.find((p) => p.stripe?.productId === "prod_MULTI");
  verifica(multi?.stripe?.varianti.length === 2, "abbonamento: 2 varianti (scelta prima dell'acquisto)");
  verifica(multi?.stripe?.varianti.find((x) => x.priceId === "price_MULTI_M")?.tipo === "ricorrente", "variante mensile = ricorrente");

  const inc = v.find((p) => p.stripe?.productId === "prod_INCOMP");
  verifica(inc?.stripe?.stato === "in-allestimento", `incompleto = in allestimento (mancano: ${inc?.stripe?.mancanti?.join(", ")})`);
  verifica(!v.some((p) => p.stripe?.productId === "prod_ARCH"), "Product archiviato su Stripe non in vetrina");

  /* 2. webhook: firma e doppioni */
  const corpoFalso = JSON.stringify({ id: "evt_prova_falso", type: "product.updated", data: { object: { id: "prod_PROVA" } } });
  const falso = await webhookCatalogo(ACC, corpoFalso, await firma(corpoFalso, "whsec_sbagliato"));
  verifica(falso.stato === 400, `firma non valida → ${falso.stato}`);
  const senza = await webhookCatalogo(ACC, corpoFalso, null);
  verifica(senza.stato === 400, `senza firma → ${senza.stato}`);

  // Modifica su Stripe: nuovo prezzo e nuova immagine
  prezzi.find((x) => x.id === "price_PROVA1")!.active = false;
  prezzi.push({ id: "price_PROVA2", active: true, currency: "eur", unit_amount: 1500, type: "one_time", recurring: null, nickname: null, product: "prod_PROVA" });
  prodotti.find((x) => x.id === "prod_PROVA")!.images = ["https://files.stripe.com/prova-2.png"];
  const corpo = JSON.stringify({ id: "evt_prova_1", type: "price.created", data: { object: { id: "price_PROVA2", product: "prod_PROVA" } } });
  const e1 = await webhookCatalogo(ACC, corpo, await firma(corpo));
  verifica(e1.stato === 200 && (e1.corpo as { esito?: string }).esito === "aggiornato", `evento firmato elaborato → ${JSON.stringify(e1.corpo)}`);
  const e2 = await webhookCatalogo(ACC, corpo, await firma(corpo));
  verifica((e2.corpo as { esito?: string }).esito === "gia-elaborato", `stesso evento ripetuto → ${JSON.stringify(e2.corpo)}`);

  v = await vetrina();
  const prova2 = v.filter((p) => p.stripe?.productId === "prod_PROVA");
  verifica(prova2.length === 1, "dopo la modifica: ancora UNA scheda");
  verifica(prova2[0]?.stripe?.varianti.length === 1 && prova2[0]?.stripe?.varianti[0].importoCents === 1500, "prezzo aggiornato a 15,00 €");
  verifica(prova2[0]?.image === "https://files.stripe.com/prova-2.png", `immagine aggiornata (${prova2[0]?.image})`);

  /* 3. pagamento giusto per ogni articolo */
  const aProva = await acquista(prova2[0]!.slug, "price_PROVA2");
  verifica((aProva as { tipo?: string }).tipo === "checkout-session", `prova senza link → Checkout Session (${JSON.stringify(aProva)})`);
  const ultima = sessioniCreate.at(-1) ?? "";
  verifica(ultima.includes("line_items[0][price]=price_PROVA2") && /client_reference_id=tp-ordine-\d+/.test(ultima), "sessione col SUO Price e riferimento ordine");
  const vecchio = await acquista(prova2[0]!.slug, "price_PROVA1");
  verifica((vecchio as { errore?: string }).errore === "BAD_REQUEST", `vecchio prezzo rifiutato (${JSON.stringify(vecchio)})`);
  const aMarsh = await acquista("visita-medica-marshall-motorsport", "price_MARSH");
  verifica(String((aMarsh as { url?: string }).url).startsWith(`${MARSHALL}?client_reference_id=tp-ordine-`), `Marshall → il suo Payment Link (${(aMarsh as { url?: string }).url})`);
  const aMultiA = await acquista(multi!.slug, "price_MULTI_A");
  verifica(String((aMultiA as { url?: string }).url).startsWith("https://buy.stripe.com/test_multi_annuale"), "variante annuale → il suo link");
  const nSess = sessioniCreate.length;
  const aMultiM = await acquista(multi!.slug, "price_MULTI_M");
  verifica((aMultiM as { tipo?: string }).tipo === "checkout-session" && sessioniCreate.length === nSess + 1 && sessioniCreate.at(-1)!.includes("mode=subscription"), "variante mensile → sessione in abbonamento");
  const aInc = await acquista(inc!.slug, "price_INCOMP");
  verifica((aInc as { errore?: string }).errore === "FORBIDDEN", `incompleto: acquisto bloccato (${JSON.stringify(aInc)})`);

  /* 4. archiviazione */
  prodotti.find((x) => x.id === "prod_PROVA")!.active = false;
  const corpoA = JSON.stringify({ id: "evt_prova_2", type: "product.updated", data: { object: { id: "prod_PROVA", active: false } } });
  const ea = await webhookCatalogo(ACC, corpoA, await firma(corpoA));
  verifica((ea.corpo as { esito?: string }).esito === "archiviato", `disattivato su Stripe → ${JSON.stringify(ea.corpo)}`);
  v = await vetrina();
  verifica(!v.some((p) => p.stripe?.productId === "prod_PROVA"), "archiviato: fuori dalla vetrina");
  const scheda = await articoloTouchPlaza(prova2[0]!.slug);
  console.log("   scheda archiviata:", scheda ? `stato=${scheda.stripe?.stato}` : "non trovata");
  const totale = (await catalogoCompleto()).tutti.filter((p) => /marshall/i.test(p.title)).length;
  verifica(totale === 1, "catalogo completo: Marshall ancora una sola volta");
} catch (e) {
  console.error("ERRORE", e);
  errori += 1;
} finally {
  await pulisci();
  const resti = await db.select().from(schema.stripeProdotti).where(eq(schema.stripeProdotti.account, ACC));
  console.log(`pulizia: ${resti.length} righe rimaste`);
  console.log(errori ? `\n${errori} verifiche FALLITE` : "\nTUTTE LE VERIFICHE OK");
  process.exit(errori ? 1 : 0);
}
