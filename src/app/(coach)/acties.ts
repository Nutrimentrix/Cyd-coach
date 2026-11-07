"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getal, lijst, tekst, vinkje } from "@/lib/formulier";
import { supabaseServer } from "@/lib/supabase/server";

const pad = (id: string, tab?: string) => `/klanten/${id}${tab ? `?tab=${tab}` : ""}`;

function metFout(url: string, melding: string): never {
  const sep = url.includes("?") ? "&" : "?";
  redirect(`${url}${sep}fout=${encodeURIComponent(melding)}`);
}

export async function uitloggen() {
  const supabase = await supabaseServer();
  await supabase.auth.signOut();
  redirect("/login");
}

export async function maakKlant(fd: FormData) {
  const supabase = await supabaseServer();
  const voornaam = tekst(fd, "voornaam");
  const merk_id = tekst(fd, "merk_id");
  if (!voornaam || !merk_id) metFout("/klanten/nieuw", "Vul minimaal een voornaam en merk in.");
  const { data, error } = await supabase
    .from("klanten")
    .insert({
      merk_id,
      voornaam,
      achternaam: tekst(fd, "achternaam") ?? "",
      email: tekst(fd, "email"),
      telefoon: tekst(fd, "telefoon"),
      geboortedatum: tekst(fd, "geboortedatum"),
      geslacht: tekst(fd, "geslacht"),
      woonplaats: tekst(fd, "woonplaats"),
      bedrijf: tekst(fd, "bedrijf"),
    })
    .select("id")
    .single();
  if (error || !data) metFout("/klanten/nieuw", "Opslaan lukte niet.");
  redirect(pad(data.id));
}

export async function werkKlantBij(id: string, fd: FormData) {
  const supabase = await supabaseServer();
  const toestemming = vinkje(fd, "toestemming_gezondheid");
  const { data: huidig } = await supabase.from("klanten").select("toestemming_gezondheid_op").eq("id", id).single();
  const { error } = await supabase
    .from("klanten")
    .update({
      voornaam: tekst(fd, "voornaam") ?? "",
      achternaam: tekst(fd, "achternaam") ?? "",
      email: tekst(fd, "email"),
      telefoon: tekst(fd, "telefoon"),
      geboortedatum: tekst(fd, "geboortedatum"),
      geslacht: tekst(fd, "geslacht"),
      woonplaats: tekst(fd, "woonplaats"),
      bedrijf: tekst(fd, "bedrijf"),
      status: tekst(fd, "status") ?? "lead",
      factuur_naam: tekst(fd, "factuur_naam"),
      factuur_adres: tekst(fd, "factuur_adres"),
      factuur_email: tekst(fd, "factuur_email"),
      toestemming_ai: vinkje(fd, "toestemming_ai"),
      nieuwsbrief: vinkje(fd, "nieuwsbrief"),
      toestemming_gezondheid_op: toestemming ? (huidig?.toestemming_gezondheid_op ?? new Date().toISOString()) : null,
    })
    .eq("id", id);
  if (error) metFout(pad(id), "Opslaan lukte niet.");
  revalidatePath(pad(id));
  redirect(`${pad(id)}?opgeslagen=1`);
}

export async function maakTraject(klantId: string, fd: FormData) {
  const supabase = await supabaseServer();
  const start = tekst(fd, "start_datum");
  if (!start) metFout(pad(klantId), "Kies een startdatum.");
  const actief = vinkje(fd, "is_actief");
  if (actief) await supabase.from("trajecten").update({ is_actief: false }).eq("klant_id", klantId);
  const { error } = await supabase.from("trajecten").insert({
    klant_id: klantId,
    start_datum: start,
    duur_weken: getal(fd, "duur_weken"),
    doel: tekst(fd, "doel") ?? "afvallen",
    voedingscategorie: tekst(fd, "voedingscategorie") ?? "normaal",
    lust_niet: lijst(fd, "lust_niet"),
    allergieen: lijst(fd, "allergieen"),
    kooktijd_max_min: getal(fd, "kooktijd_max_min"),
    mealprep: vinkje(fd, "mealprep"),
    verzend_dag: getal(fd, "verzend_dag") ?? 0,
    verzend_tijd: tekst(fd, "verzend_tijd") ?? "18:00",
    energie_formule: tekst(fd, "energie_formule") ?? "mifflin",
    aanpassing_pct: getal(fd, "aanpassing_pct") ?? -15,
    eiwit_g_per_kg: getal(fd, "eiwit_g_per_kg") ?? 1.8,
    eiwit_basis: tekst(fd, "eiwit_basis") ?? "gewicht",
    is_actief: actief,
  });
  if (error) metFout(pad(klantId), "Traject opslaan lukte niet.");
  if (actief) await supabase.from("klanten").update({ status: "actief" }).eq("id", klantId);
  revalidatePath(pad(klantId));
  redirect(pad(klantId));
}

export async function zetTrajectActief(id: string, klantId: string, actief: boolean) {
  const supabase = await supabaseServer();
  if (actief) await supabase.from("trajecten").update({ is_actief: false }).eq("klant_id", klantId);
  await supabase.from("trajecten").update({ is_actief: actief }).eq("id", id);
  revalidatePath(pad(klantId));
}

export async function voegMetingToe(klantId: string, fd: FormData) {
  const supabase = await supabaseServer();
  const velden = ["lengte_cm", "gewicht_kg", "vet_pct", "spier_pct", "visceraal", "borst_cm", "taille_cm", "heup_cm",
    "biceps_mm", "triceps_mm", "rug_mm", "buik_mm", "pal"] as const;
  const rij: Record<string, unknown> = { klant_id: klantId, datum: tekst(fd, "datum") ?? new Date().toISOString().slice(0, 10), notitie: tekst(fd, "notitie") };
  for (const v of velden) rij[v] = getal(fd, v);
  if (rij.pal != null && ((rij.pal as number) < 1.2 || (rij.pal as number) > 2.5)) metFout(pad(klantId, "metingen"), "PAL moet tussen 1,2 en 2,5 liggen.");
  const { error } = await supabase.from("metingen").insert(rij);
  if (error) metFout(pad(klantId, "metingen"), "Meting opslaan lukte niet.");
  revalidatePath(pad(klantId));
  redirect(pad(klantId, "metingen"));
}

export async function verwijderMeting(id: string, klantId: string) {
  const supabase = await supabaseServer();
  await supabase.from("metingen").delete().eq("id", id);
  revalidatePath(pad(klantId));
}

export async function voegNotitieToe(klantId: string, fd: FormData) {
  const supabase = await supabaseServer();
  const onderwerp = tekst(fd, "onderwerp");
  if (!onderwerp) metFout(pad(klantId, "notities"), "Geef de notitie een onderwerp.");
  await supabase.from("notities").insert({
    klant_id: klantId,
    onderwerp,
    inhoud: tekst(fd, "inhoud") ?? "",
    datum: tekst(fd, "datum") ?? new Date().toISOString().slice(0, 10),
  });
  revalidatePath(pad(klantId));
  redirect(pad(klantId, "notities"));
}

export async function voegTaakToe(klantId: string, fd: FormData) {
  const supabase = await supabaseServer();
  const titel = tekst(fd, "titel");
  if (!titel) metFout(pad(klantId, "taken"), "Vul in wat er moet gebeuren.");
  const { data } = await supabase.auth.getUser();
  await supabase.from("taken").insert({ klant_id: klantId, titel, deadline: tekst(fd, "deadline"), coach_id: data.user?.id });
  revalidatePath(pad(klantId));
  redirect(pad(klantId, "taken"));
}

export async function wisselTaak(id: string, klantId: string, klaar: boolean) {
  const supabase = await supabaseServer();
  await supabase.from("taken").update({ klaar }).eq("id", id);
  revalidatePath(pad(klantId));
}
