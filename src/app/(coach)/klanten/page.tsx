import Link from "next/link";
import { STATUSSEN, label } from "@/lib/opties";
import { supabaseServer } from "@/lib/supabase/server";

type Props = { searchParams: Promise<{ q?: string; status?: string }> };

export default async function KlantenPage({ searchParams }: Props) {
  const { q = "", status = "actief" } = await searchParams;
  const supabase = await supabaseServer();
  let query = supabase
    .from("klanten")
    .select("id, voornaam, achternaam, email, status, bedrijf, merken(naam), trajecten(doel, start_datum, is_actief)")
    .order("voornaam");
  if (status !== "alle") query = query.eq("status", status);
  if (q) query = query.or(`voornaam.ilike.%${q.replace(/[%,()]/g, "")}%,achternaam.ilike.%${q.replace(/[%,()]/g, "")}%,email.ilike.%${q.replace(/[%,()]/g, "")}%`);
  const { data: klanten, error } = await query;

  const filters = [["actief", "Actief"], ["lead", "Lead"], ["gepauzeerd", "Gepauzeerd"], ["afgerond", "Afgerond"], ["alle", "Alle"]];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="kop text-3xl">Klanten</h1>
          <p className="text-sm text-mat">{klanten?.length ?? 0} klanten</p>
        </div>
        <Link href="/klanten/nieuw" className="knop-primair">Nieuwe klant</Link>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <form className="flex gap-2">
          <input type="hidden" name="status" value={status} />
          <label className="sr-only" htmlFor="q">Zoeken</label>
          <input id="q" name="q" defaultValue={q} placeholder="Zoek op naam of e-mail" className="veld w-72" />
          <button className="knop">Zoek</button>
        </form>
        <nav aria-label="Status" className="flex flex-wrap gap-1">
          {filters.map(([k, l]) => (
            <Link key={k} href={`/klanten?status=${k}${q ? `&q=${encodeURIComponent(q)}` : ""}`}
              className={`rounded-full px-3 py-1 text-sm font-semibold ${status === k ? "bg-inkt text-white" : "bg-white text-mat border border-lijn"}`}>
              {l}
            </Link>
          ))}
        </nav>
      </div>

      {error && <p className="text-rood">Klanten laden lukte niet.</p>}

      <div className="kaart overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-[15px]">
          <thead className="border-b border-lijn">
            <tr>
              <th className="label px-4 py-3">Naam</th>
              <th className="label px-4 py-3">Merk</th>
              <th className="label px-4 py-3">Doel</th>
              <th className="label px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {(klanten ?? []).map((k) => {
              const actief = (k.trajecten as { doel: string; is_actief: boolean }[] | null)?.find((t) => t.is_actief);
              const merk = (k.merken as unknown as { naam: string } | null)?.naam;
              return (
                <tr key={k.id} className="border-b border-lijn last:border-0 hover:bg-groen-zacht/50">
                  <td className="px-4 py-3">
                    <Link href={`/klanten/${k.id}`} className="font-semibold hover:text-groen-donker">
                      {k.voornaam} {k.achternaam}
                    </Link>
                    {k.bedrijf && <span className="ml-2 text-sm text-mat">{k.bedrijf}</span>}
                  </td>
                  <td className="px-4 py-3 text-mat">{merk}</td>
                  <td className="px-4 py-3">{actief ? actief.doel.replace("_", " ") : <span className="text-mat">–</span>}</td>
                  <td className="px-4 py-3">{label(STATUSSEN, k.status)}</td>
                </tr>
              );
            })}
            {klanten?.length === 0 && (
              <tr><td colSpan={4} className="px-4 py-8 text-center text-mat">Geen klanten gevonden.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
