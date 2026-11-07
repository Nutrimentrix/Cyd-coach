/**
 * Berekening van rustverbruik, energiebehoefte, advies en eiwit.
 *
 * - Mifflin-St Jeor (1990): standaard voor volwassenen.
 * - Katch-McArdle: op basis van vetvrije massa; alleen als er een vetpercentage is.
 * Alle uitkomsten zijn een voorstel. De coach kan per traject kiezen en bijstellen.
 */

export type Geslacht = "man" | "vrouw" | "anders";
export type Formule = "mifflin" | "katch";

export interface EnergieInvoer {
  geslacht: Geslacht;
  gewichtKg: number;
  lengteCm: number;
  leeftijd: number;
  vetPct?: number | null;
  pal: number;
  /** Procentuele aanpassing op de behoefte, bijv. -20 voor afvallen of +10 voor aankomen. */
  aanpassingPct?: number;
  /** Gram eiwit per kg. */
  eiwitGPerKg?: number;
  /** Rekenen met lichaamsgewicht of vetvrije massa voor eiwit. */
  eiwitBasis?: "gewicht" | "vetvrij";
  formule?: Formule;
}

export interface EnergieUitkomst {
  mifflin: number;
  katch: number | null;
  vetvrijeMassaKg: number | null;
  gekozenFormule: Formule;
  rustverbruik: number;
  behoefte: number;
  advies: number;
  eiwitG: number;
}

export const PAL_MIN = 1.2;
export const PAL_MAX = 2.5;

export function leeftijdOp(geboortedatum: string | Date, peildatum: string | Date = new Date()): number {
  const g = new Date(geboortedatum);
  const p = new Date(peildatum);
  let l = p.getFullYear() - g.getFullYear();
  const nogNietJarig = p.getMonth() < g.getMonth() || (p.getMonth() === g.getMonth() && p.getDate() < g.getDate());
  if (nogNietJarig) l -= 1;
  return l;
}

export function mifflinStJeor(geslacht: Geslacht, gewichtKg: number, lengteCm: number, leeftijd: number): number {
  const basis = 10 * gewichtKg + 6.25 * lengteCm - 5 * leeftijd;
  const correctie = geslacht === "man" ? 5 : geslacht === "vrouw" ? -161 : -78;
  return basis + correctie;
}

export function vetvrijeMassa(gewichtKg: number, vetPct: number): number {
  return gewichtKg * (1 - vetPct / 100);
}

export function katchMcArdle(vetvrijeMassaKg: number): number {
  return 370 + 21.6 * vetvrijeMassaKg;
}

const rond = (n: number, op: number) => Math.round(n / op) * op;

function controleer(invoer: EnergieInvoer) {
  const { gewichtKg, lengteCm, leeftijd, pal, vetPct } = invoer;
  if (!(gewichtKg > 20 && gewichtKg < 400)) throw new Error("Gewicht moet tussen 20 en 400 kg liggen.");
  if (!(lengteCm > 100 && lengteCm < 250)) throw new Error("Lengte moet tussen 100 en 250 cm liggen.");
  if (!(leeftijd >= 16 && leeftijd < 110)) throw new Error("Leeftijd moet tussen 16 en 110 jaar liggen.");
  if (!(pal >= PAL_MIN && pal <= PAL_MAX)) throw new Error(`PAL moet tussen ${PAL_MIN} en ${PAL_MAX} liggen.`);
  if (vetPct != null && !(vetPct > 2 && vetPct < 70)) throw new Error("Vetpercentage moet tussen 2 en 70 liggen.");
}

export function berekenEnergie(invoer: EnergieInvoer): EnergieUitkomst {
  controleer(invoer);
  const { geslacht, gewichtKg, lengteCm, leeftijd, vetPct, pal } = invoer;
  const mifflin = mifflinStJeor(geslacht, gewichtKg, lengteCm, leeftijd);
  const vvm = vetPct != null ? vetvrijeMassa(gewichtKg, vetPct) : null;
  const katch = vvm != null ? katchMcArdle(vvm) : null;

  // Katch alleen als er een vetpercentage is; anders valt het terug op Mifflin.
  const gekozenFormule: Formule = invoer.formule === "katch" && katch != null ? "katch" : "mifflin";
  const rust = gekozenFormule === "katch" && katch != null ? katch : mifflin;

  const behoefte = rust * pal;
  const advies = behoefte * (1 + (invoer.aanpassingPct ?? 0) / 100);
  const eiwitBasisKg = invoer.eiwitBasis === "vetvrij" && vvm != null ? vvm : gewichtKg;
  const eiwitG = eiwitBasisKg * (invoer.eiwitGPerKg ?? 1.8);

  return {
    mifflin: Math.round(mifflin),
    katch: katch != null ? Math.round(katch) : null,
    vetvrijeMassaKg: vvm != null ? Math.round(vvm * 10) / 10 : null,
    gekozenFormule,
    rustverbruik: Math.round(rust),
    behoefte: rond(behoefte, 5),
    advies: rond(advies, 10),
    eiwitG: rond(eiwitG, 5),
  };
}
