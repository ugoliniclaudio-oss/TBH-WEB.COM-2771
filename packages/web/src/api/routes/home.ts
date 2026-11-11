import { base } from "../__core/app";
import { DM_CANALE, PROGRAMMI_DM, BRAND_PAGES, ANNUNCI, ATTIVITA_GRUPPO } from "../data/tbh";
import { TBH_CONTACTS, COMPANIES, PRODUCTS, TEAMS } from "../data/catalog";
import { LUOGHI, PARTNER_TECNICI, RADIO, TV, RIVISTE, CIRCUITI } from "../data/rete";
import { GIORNI, statoPuntata } from "../data/palinsesto";
import { risolviLogo } from "../data/identita";

/**
 * HOME (ordini 1-40 sullo schema del mockup).
 * Tutti i blocchi sono alimentati dalle anagrafiche già esistenti: nessun contenuto
 * scritto a mano nella Home, nessun dato inventato. Quando un dato manca, il blocco
 * espone `null` e la UI scrive "in allestimento" / "da definire".
 */
export const home = {
  feed: base.handler(() => {
    const programmi = PROGRAMMI_DM.map((p) => ({
      slug: p.slug,
      name: p.name,
      giornoLabel: p.giorno ? GIORNI[p.giorno]! : null,
      ora: p.ora,
      ...statoPuntata(p.giorno, p.ora, p.durataMin),
    }));

    const inOnda = programmi.filter((p) => p.stato === "ORA IN DIRETTA");
    const questaSera = programmi.filter((p) => p.stato === "QUESTA SERA");

    /* ---- 7 · Colonna LIVE: solo ciò che è davvero disponibile ---- */
    const live = [
      {
        titolo: DM_CANALE.name,
        sottotitolo: DM_CANALE.ruolo,
        stato: inOnda.length
          ? "ORA IN DIRETTA"
          : questaSera.length
            ? "QUESTA SERA"
            : "PALINSESTO COMPLETO",
        dettaglio:
          inOnda[0]?.name ??
          questaSera[0]?.name ??
          programmi.map((p) => p.name).join(" · "),
        /** Link vero al canale ufficiale: nessun player finto. */
        href: DM_CANALE.youtube,
        interna: "/dm",
        logo: risolviLogo(DM_CANALE.name, DM_CANALE.logo).logo,
      },
      {
        titolo: "Touch TV · Touch Music TV",
        sottotitolo: "Canali del gruppo",
        stato: "IN ALLESTIMENTO",
        dettaglio: "Il canale non è ancora online: nessun player attivo finché non lo è davvero.",
        href: null as string | null,
        interna: "/media/radio-tv",
        logo: null as string | null,
      },
    ];

    /* ---- 9 · Breaking news alimentata automaticamente ---- */
    const breaking: { tag: string; testo: string; to: string }[] = [];
    for (const p of programmi) {
      if (p.stato === "ORA IN DIRETTA")
        breaking.push({ tag: "ORA IN DIRETTA", testo: `${p.name} su DM Comunicazioni`, to: `/dm/programmi?p=${p.slug}` });
      else if (p.stato === "QUESTA SERA")
        breaking.push({
          tag: "QUESTA SERA",
          testo: `${p.name}${p.ora ? ` · ore ${p.ora}` : ""}`,
          to: `/dm/programmi?p=${p.slug}`,
        });
    }
    for (const a of ANNUNCI)
      breaking.push({ tag: "LAVORO & CASTING", testo: a.titolo, to: "/lavoro-casting" });
    for (const b of BRAND_PAGES.slice(0, 4))
      breaking.push({ tag: "MEDIA HUB", testo: b.name, to: `/tbh/p/${b.slug}` });
    for (const t of TEAMS.slice(0, 3))
      breaking.push({ tag: "SPORT", testo: `${t.name} — ${t.role}`, to: "/sport/societa-seguite" });
    for (const p of PRODUCTS.slice(0, 3))
      breaking.push({
        tag: "TOUCH PLAZA",
        testo: `${p.title} — ${(p.priceCents / 100).toLocaleString("it-IT", {
          style: "currency",
          currency: "EUR",
        })}`,
        to: "/shop",
      });

    /* ---- 8 · Fascia partner: prima le realtà TBH, poi i partner esterni ---- */
    const partnerTbh = [
      { nome: "Touch Plaza Shop", dettaglio: "Il centro commerciale digitale", to: "/shop", logo: null as string | null },
      { nome: DM_CANALE.name, dettaglio: DM_CANALE.ruolo, to: "/dm", logo: DM_CANALE.logo },
      ...BRAND_PAGES.slice(0, 6).map((b) => ({
        nome: b.name,
        dettaglio: b.claim ?? b.kind,
        to: `/tbh/p/${b.slug}`,
        /* UN LOGO ORIGINALE PER IDENTITÀ: se questa anagrafica non porta il file,
           si riusa l'originale già caricato per la stessa entità altrove. */
        logo: risolviLogo(b.name, b.logo).logo,
      })),
    ];

    const partnerEsterni = [
      ...TEAMS.map((t) => ({
        nome: t.name,
        dettaglio: t.role,
        to: "/sport/societa-seguite",
        sito: t.site,
        logo: risolviLogo(t.name, t.logo).logo,
      })),
      ...PARTNER_TECNICI.map((p) => ({
        nome: p.nome,
        dettaglio: p.nota,
        to: "/network/partner",
        sito: p.sito,
        logo: risolviLogo(p.nome, null).logo,
      })),
    ];

    return {
      live,
      programmi,
      breaking,
      partnerTbh,
      partnerEsterni,
      conteggi: {
        societa: COMPANIES.filter((c) => c.kind === "societa").length,
        attivita: COMPANIES.filter((c) => c.kind === "attivita").length + ATTIVITA_GRUPPO.length,
        prodotti: PRODUCTS.length,
        squadre: TEAMS.length,
        luoghi: LUOGHI.length,
        circuiti: CIRCUITI.length,
        radio: RADIO.length,
        tv: TV.length,
        riviste: RIVISTE.length,
        brand: BRAND_PAGES.length,
      },
      magazine: RIVISTE.find((r) => r.nome === "Touch Influencity Magazine") ?? null,
      contatti: TBH_CONTACTS,
    };
  }),
};
