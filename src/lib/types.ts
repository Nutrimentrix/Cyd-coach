// Handgeschreven types die overeenkomen met supabase/migrations. Later te vervangen door gegenereerde types.

export interface Klant {
  id: string;
  merk_id: string;
  voornaam: string;
  achternaam: string;
  email: string | null;
  telefoon: string | null;
  geboortedatum: string | null;
  geslacht: "man" | "vrouw" | "anders" | null;
  woonplaats: string | null;
  bedrijf: string | null;
  status: string;
  factuur_naam: string | null;
  factuur_adres: string | null;
  factuur_email: string | null;
  toestemming_gezondheid_op: string | null;
  toestemming_ai: boolean;
  nieuwsbrief: boolean;
}

export interface Traject {
  id: string;
  klant_id: string;
  start_datum: string;
  duur_weken: number | null;
  doel: string;
  voedingscategorie: string;
  lust_niet: string[];
  allergieen: string[];
  kooktijd_max_min: number | null;
  mealprep: boolean;
  verzend_dag: number;
  verzend_tijd: string;
  energie_formule: "mifflin" | "katch";
  aanpassing_pct: number;
  eiwit_g_per_kg: number;
  eiwit_basis: "gewicht" | "vetvrij";
  is_actief: boolean;
}

export interface Meting {
  id: string;
  datum: string;
  lengte_cm: number | null;
  gewicht_kg: number | null;
  vet_pct: number | null;
  spier_pct: number | null;
  visceraal: number | null;
  borst_cm: number | null;
  taille_cm: number | null;
  heup_cm: number | null;
  biceps_mm: number | null;
  triceps_mm: number | null;
  rug_mm: number | null;
  buik_mm: number | null;
  pal: number | null;
  notitie: string | null;
}

export interface Notitie { id: string; datum: string; onderwerp: string; inhoud: string }
export interface Taak { id: string; titel: string; deadline: string | null; klaar: boolean }
