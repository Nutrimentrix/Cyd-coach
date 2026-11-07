export const STATUSSEN = [
  ["lead", "Lead"],
  ["actief", "Actief"],
  ["gepauzeerd", "Gepauzeerd"],
  ["afgerond", "Afgerond"],
] as const;

export const DOELEN = [
  ["afvallen", "Afvallen"],
  ["aankomen", "Aankomen"],
  ["gewicht_behouden", "Gewicht behouden"],
  ["meer_energie", "Meer energie"],
  ["darmgezondheid", "Betere darmgezondheid"],
  ["sportprestatie", "Sportprestatie"],
] as const;

export const CATEGORIEEN = [
  ["normaal", "Normaal"],
  ["vegetarisch", "Vegetarisch"],
  ["veganistisch", "Veganistisch"],
  ["glutenvrij", "Glutenvrij"],
  ["lactosevrij", "Lactosevrij"],
  ["gluten_en_lactosevrij", "Gluten- en lactosevrij"],
  ["koolhydraatbeperkt", "Koolhydraatbeperkt"],
  ["geen_vis", "Geen vis"],
  ["geen_vlees", "Geen vlees"],
] as const;

// 0 = zondag, zoals in JavaScript en de database.
export const DAGEN = ["zondag", "maandag", "dinsdag", "woensdag", "donderdag", "vrijdag", "zaterdag"] as const;

export const label = (lijst: readonly (readonly [string, string])[], waarde: string | null | undefined) =>
  lijst.find(([k]) => k === waarde)?.[1] ?? waarde ?? "";

export const datumNL = (d: string | null | undefined) =>
  d ? new Date(d).toLocaleDateString("nl-NL", { day: "numeric", month: "short", year: "numeric" }) : "";

export const getalNL = (n: number | null | undefined, decimalen = 0) =>
  n == null ? "–" : n.toLocaleString("nl-NL", { maximumFractionDigits: decimalen, minimumFractionDigits: decimalen });
