import { describe, expect, it } from "vitest";
import { getal, lijst, tekst, vinkje } from "./formulier";

describe("formulier", () => {
  const fd = new FormData();
  fd.set("naam", "  Mark ");
  fd.set("leeg", "   ");
  fd.set("gewicht", "96,6");
  fd.set("lust", "Paprika, champignons ,");
  fd.set("actief", "on");

  it("leest tekst en negeert lege velden", () => {
    expect(tekst(fd, "naam")).toBe("Mark");
    expect(tekst(fd, "leeg")).toBeNull();
    expect(tekst(fd, "bestaat_niet")).toBeNull();
  });
  it("leest getallen met een komma", () => {
    expect(getal(fd, "gewicht")).toBe(96.6);
    expect(getal(fd, "naam")).toBeNull();
  });
  it("maakt een lijst van komma-gescheiden tekst", () => {
    expect(lijst(fd, "lust")).toEqual(["paprika", "champignons"]);
  });
  it("leest een vinkje", () => {
    expect(vinkje(fd, "actief")).toBe(true);
    expect(vinkje(fd, "naam")).toBe(false);
  });
});
