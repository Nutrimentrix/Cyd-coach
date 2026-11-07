import Link from "next/link";
import { supabaseServer } from "@/lib/supabase/server";
import { maakKlant } from "../../acties";
import { Melding, Veld } from "@/components/veld";

type Props = { searchParams: Promise<{ fout?: string }> };

export default async function NieuweKlantPage({ searchParams }: Props) {
  const { fout } = await searchParams;
  const supabase = await supabaseServer();
  const { data: merken } = await supabase.from("merken").select("id, naam").order("naam");

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-4">
      <Link href="/klanten" className="text-sm text-mat hover:text-inkt">← Klanten</Link>
      <h1 className="kop text-3xl">Nieuwe klant</h1>
      {fout && <Melding>{fout}</Melding>}
      {merken?.length === 0 && (
        <Melding>Je bent nog niet aan een merk gekoppeld. Vraag een beheerder om toegang.</Melding>
      )}
      <form action={maakKlant} className="kaart grid gap-4 p-5 sm:grid-cols-2">
        <Veld label="Merk" className="sm:col-span-2">
          <select name="merk_id" className="veld" required defaultValue={merken?.[0]?.id}>
            {merken?.map((m) => <option key={m.id} value={m.id}>{m.naam}</option>)}
          </select>
        </Veld>
        <Veld label="Voornaam"><input name="voornaam" className="veld" required /></Veld>
        <Veld label="Achternaam"><input name="achternaam" className="veld" /></Veld>
        <Veld label="E-mail"><input name="email" type="email" className="veld" /></Veld>
        <Veld label="Telefoon"><input name="telefoon" type="tel" className="veld" /></Veld>
        <Veld label="Geboortedatum"><input name="geboortedatum" type="date" className="veld" /></Veld>
        <Veld label="Geslacht">
          <select name="geslacht" className="veld" defaultValue="">
            <option value="">Onbekend</option><option value="man">Man</option><option value="vrouw">Vrouw</option><option value="anders">Anders</option>
          </select>
        </Veld>
        <Veld label="Woonplaats"><input name="woonplaats" className="veld" /></Veld>
        <Veld label="Via bedrijf (B2B)"><input name="bedrijf" className="veld" /></Veld>
        <div className="sm:col-span-2"><button className="knop-primair">Klant aanmaken</button></div>
      </form>
    </div>
  );
}

