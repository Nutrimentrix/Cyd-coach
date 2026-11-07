import { describe, expect, it } from "vitest";
import { berekenEnergie, katchMcArdle, leeftijdOp, mifflinStJeor, vetvrijeMassa } from "./energie";

describe("mifflinStJeor", () => {
  it("rekent voor een man", () => {
    // 10*90 + 6.25*180 - 5*40 + 5 = 1830
    expect(mifflinStJeor("man", 90, 180, 40)).toBeCloseTo(1830);
  });
  it("rekent voor een vrouw", () => {
    // 10*70 + 6.25*165 - 5*35 - 161 = 1395.25
    expect(mifflinStJeor("vrouw", 70, 165, 35)).toBeCloseTo(1395.25);
  });
});

describe("katchMcArdle", () => {
  it("rekent met vetvrije massa", () => {
    const vvm = vetvrijeMassa(100, 25); // 75 kg
    expect(vvm).toBeCloseTo(75);
    expect(katchMcArdle(vvm)).toBeCloseTo(370 + 21.6 * 75);
  });
});

describe("leeftijdOp", () => {
  it("telt pas een jaar op na de verjaardag", () => {
    expect(leeftijdOp("1980-06-15", "2026-06-14")).toBe(45);
    expect(leeftijdOp("1980-06-15", "2026-06-15")).toBe(46);
  });
});

describe("berekenEnergie", () => {
  const basis = { geslacht: "man" as const, gewichtKg: 96.6, lengteCm: 187, leeftijd: 54, vetPct: 22.9, pal: 1.55 };

  it("gebruikt standaard Mifflin-St Jeor", () => {
    const r = berekenEnergie({ ...basis, aanpassingPct: -20 });
    expect(r.gekozenFormule).toBe("mifflin");
    expect(r.rustverbruik).toBe(Math.round(mifflinStJeor("man", 96.6, 187, 54)));
    expect(r.advies % 10).toBe(0);
    expect(r.advies).toBeLessThan(r.behoefte);
  });

  it("kiest Katch-McArdle als dat gevraagd is en er een vetpercentage is", () => {
    const r = berekenEnergie({ ...basis, formule: "katch" });
    expect(r.gekozenFormule).toBe("katch");
    expect(r.katch).not.toBeNull();
    expect(r.rustverbruik).toBe(r.katch);
  });

  it("valt terug op Mifflin als Katch gevraagd is zonder vetpercentage", () => {
    const r = berekenEnergie({ ...basis, vetPct: null, formule: "katch" });
    expect(r.gekozenFormule).toBe("mifflin");
    expect(r.katch).toBeNull();
  });

  it("rekent eiwit op vetvrije massa als dat gekozen is", () => {
    const r = berekenEnergie({ ...basis, eiwitGPerKg: 2, eiwitBasis: "vetvrij" });
    expect(r.eiwitG).toBe(Math.round((96.6 * (1 - 0.229) * 2) / 5) * 5);
  });

  it("weigert onrealistische invoer", () => {
    expect(() => berekenEnergie({ ...basis, pal: 3 })).toThrow(/PAL/);
    expect(() => berekenEnergie({ ...basis, gewichtKg: 10 })).toThrow(/Gewicht/);
  });
});
