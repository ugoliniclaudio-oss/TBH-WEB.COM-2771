/**
 * POSIZIONAMENTO PRECISO SULLA MAPPA — ordine di Claudio (29/08/2026):
 * «METTERE IN MANIERA PRECISA SULLA MAPPA I CONTENUTI INSERITI».
 *
 * Le coordinate arrivano dai dati (geocodifica OpenStreetMap degli indirizzi reali già in scheda).
 * Qui c'è solo la matematica per trasformarle in posizione sulla pianta: proiezione Mercator,
 * la stessa usata dalle mappe, così le distanze relative sono corrette e non "a occhio".
 * Nessuna coordinata viene inventata: chi ha lat/lon null non viene posizionato.
 */

export type Punto = { lat: number; lon: number };

const merc = (lat: number) => Math.log(Math.tan(Math.PI / 4 + (lat * Math.PI) / 360));

export type Riquadro = { latMin: number; latMax: number; lonMin: number; lonMax: number };

/** Riquadro che contiene tutti i punti reali, con un margine di respiro. */
export function riquadro(punti: Punto[], margine = 0.12): Riquadro | null {
  if (punti.length === 0) return null;
  const lats = punti.map((p) => p.lat);
  const lons = punti.map((p) => p.lon);
  let latMin = Math.min(...lats);
  let latMax = Math.max(...lats);
  let lonMin = Math.min(...lons);
  let lonMax = Math.max(...lons);
  const dLat = Math.max(latMax - latMin, 0.004) * margine + 0.0006;
  const dLon = Math.max(lonMax - lonMin, 0.006) * margine + 0.0008;
  latMin -= dLat;
  latMax += dLat;
  lonMin -= dLon;
  lonMax += dLon;
  return { latMin, latMax, lonMin, lonMax };
}

/** Posizione in percentuale dentro il riquadro: x da ovest, y dall'alto (nord). */
export function posizione(p: Punto, r: Riquadro): { x: number; y: number } {
  const x = ((p.lon - r.lonMin) / (r.lonMax - r.lonMin)) * 100;
  const yTop = merc(r.latMax);
  const yBot = merc(r.latMin);
  const y = ((yTop - merc(p.lat)) / (yTop - yBot)) * 100;
  return { x, y };
}

/** Mappa OpenStreetMap ufficiale incorporata, centrata sul punto reale. */
export function osmEmbed(p: Punto, delta = 0.004) {
  const bbox = [p.lon - delta, p.lat - delta / 2, p.lon + delta, p.lat + delta / 2].join("%2C");
  return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${p.lat}%2C${p.lon}`;
}

/** Mappa OpenStreetMap ufficiale che inquadra tutti i punti reali. */
export function osmEmbedRiquadro(r: Riquadro) {
  const bbox = [r.lonMin, r.latMin, r.lonMax, r.latMax].join("%2C");
  return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik`;
}

/** Link per aprire il punto sulla mappa vera (OpenStreetMap). */
export function osmLink(p: Punto) {
  return `https://www.openstreetmap.org/?mlat=${p.lat}&mlon=${p.lon}#map=17/${p.lat}/${p.lon}`;
}

/** Indicazioni stradali con Google Maps, sull'indirizzo reale. */
export function indicazioni(p: Punto) {
  return `https://www.google.com/maps/dir/?api=1&destination=${p.lat},${p.lon}`;
}

/**
 * «MI TROVI QUI» — ordine di Claudio del 29/08/2026: «SE NON HAI URL, LINK, USA LA POSIZIONE SU
 * GOOGLE MAP OPPURE RICORDATI CHE CI DEVE ESSERE IL PULSANTE (MI TROVI QUI), COSÌ RENDI LA
 * NAVIGAZIONE + VELOCE».
 *
 * Ricerca su Google Maps: se ci sono le coordinate reali si usano quelle (posizione esatta),
 * altrimenti si cerca il nome + città + indirizzo così come sono in scheda. Nessun indirizzo
 * inventato: si passa solo testo che è già nei dati.
 */
export function mapsRicerca(termini: (string | null | undefined)[], punto?: Punto | null) {
  if (punto && Number.isFinite(punto.lat) && Number.isFinite(punto.lon)) {
    return `https://www.google.com/maps/search/?api=1&query=${punto.lat},${punto.lon}`;
  }
  const q = termini.filter((t) => t && t.trim().length > 0).join(", ");
  if (!q) return null;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`;
}

/**
 * WAZE — richiesta di Claudio del 30/08/2026: nella scheda master, accanto a Google Maps,
 * ci va anche Waze. Se ci sono le coordinate reali si apre il punto esatto, altrimenti la
 * ricerca per nome/indirizzo così come sono in scheda. Nessun dato inventato.
 */
export function wazeLink(termini: (string | null | undefined)[], punto?: Punto | null) {
  if (punto && Number.isFinite(punto.lat) && Number.isFinite(punto.lon)) {
    return `https://waze.com/ul?ll=${punto.lat},${punto.lon}&navigate=yes`;
  }
  const q = termini.filter((t) => t && t.trim().length > 0).join(", ");
  if (!q) return null;
  return `https://waze.com/ul?q=${encodeURIComponent(q)}&navigate=yes`;
}
