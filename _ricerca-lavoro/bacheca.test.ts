import { expect, test } from "bun:test";
import { filtraBacheca, FILTRI_VUOTI, TUTTI_ANNUNCI, ANNUNCI_TBH } from "/home/user/tbh-web/packages/web/src/web/lib/bacheca-annunci";
const oggi = "2026-10-14";
test("TBH prima, poi esterni dal più recente", () => {
  const { attivi } = filtraBacheca(TUTTI_ANNUNCI, FILTRI_VUOTI, oggi);
  const iPrimoEst = attivi.findIndex((a) => a.provenienza === "esterna");
  expect(attivi.slice(0, iPrimoEst).every((a) => a.provenienza === "tbh")).toBe(true);
  expect(attivi.slice(iPrimoEst).every((a) => a.provenienza === "esterna")).toBe(true);
  const date = attivi.slice(iPrimoEst).map((a) => a.pubblicato ?? "");
  expect([...date].sort().reverse()).toEqual(date);
  console.log("attivi", attivi.length, "tbh", iPrimoEst);
});
test("scaduti solo in archivio", () => {
  const { attivi, archivio } = filtraBacheca(TUTTI_ANNUNCI, FILTRI_VUOTI, oggi);
  expect(attivi.some((a) => a.slug === "operatori-cremona-circuit-2026")).toBe(false);
  expect(archivio.map((a) => a.slug)).toContain("operatori-cremona-circuit-2026");
});
test("TBH esclusi se non passano i filtri", () => {
  const { attivi } = filtraBacheca(TUTTI_ANNUNCI, { ...FILTRI_VUOTI, zona: "cesenatico" }, oggi);
  console.log("cesenatico", attivi.map((a) => a.slug + ":" + a.provenienza).slice(0, 20));
  expect(attivi.every((a) => a.provenienza === "esterna" || a.localita !== null)).toBe(true);
  const { attivi: a2 } = filtraBacheca(TUTTI_ANNUNCI, { ...FILTRI_VUOTI, q: "portiere" }, oggi);
  expect(a2.some((a) => a.provenienza === "tbh")).toBe(false);
  expect(a2.length).toBeGreaterThan(0);
});
test("solo tbh / costa", () => {
  const { attivi } = filtraBacheca(TUTTI_ANNUNCI, { ...FILTRI_VUOTI, provenienza: "tbh" }, oggi);
  expect(attivi.length).toBe(ANNUNCI_TBH.length - 1);
  const c = filtraBacheca(TUTTI_ANNUNCI, { ...FILTRI_VUOTI, zona: "costa" }, oggi).attivi.length;
  console.log("costa", c, "alloggio si", filtraBacheca(TUTTI_ANNUNCI, { ...FILTRI_VUOTI, alloggio: "si" }, oggi).attivi.length);
});
