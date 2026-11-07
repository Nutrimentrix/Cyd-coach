import Link from "next/link";
import { notFound } from "next/navigation";
import { Melding } from "@/components/veld";
import { leeftijdOp } from "@/lib/energie";
import { CATEGORIEEN, DOELEN, STATUSSEN, label } from "@/lib/opties";
import { supabaseServer } from "@/lib/supabase/server";
import { TabDossier } from "./tab-dossier";
import { TabMetingen } from "./tab-metingen";
import { TabNotities } from "./tab-notities";
import { TabTaken } from "./tab-taken";

const TABS = [
  ["dossier", "Dossier"],
  ["metingen", "Metingen"],
  ["notities", "Notities"],
  ["taken", "Taken"],
] as const;

type Props = { params: Promise<{ id: string }>; searchParams: Promise<{ tab?: string; fout?: string; opgeslagen?: string }> };

export default async function KlantPage({ params, searchParams }: Props) {
  const { id } = await params;
  const { tab = "dossier", fout, opgeslagen } = await searchParams;
  const supabase = await supabaseServer();

  const [{ data: klant }, { data: trajecten }, { data: metingen }, { data: notities }, { data: taken }] = await Promise.all([
    supabase.from("klanten").select("*, merken(naam)").eq("id", id).maybeSingle(),
    supabase.from("trajecten").select("*").eq("klant_id", id).order("start_datum", { ascending: false }),
    supabase.from("metingen").select("*").eq("klant_id", id).order("datum", { ascending: false }),
    supabase.from("notities").select("*").eq("klant_id", id).order("datum", { ascending: false }),
    supabase.from("taken").select("*").eq("klant_id", id).order("klaar").order("deadline", { nullsFirst: false }),
  ]);
  if (!klant) notFound();

  const actief = trajecten?.find((t) => t.is_actief) ?? null;
  const merk = (klant.merken as { naam: string } | null)?.naam;
  const chips = [
    klant.geboortedatum ? `${leeftijdOp(klant.geboortedatum)} jaar` : null,
    label(STATUSSEN, klant.status),
    actief ? `Doel: ${label(DOELEN, actief.doel).toLowerCase()}` : null,
    actief ? `Categorie: ${label(CATEGORIEEN, actief.voedingscategorie).toLowerCase()}` : null,
    merk ? `Merk: ${merk}` : null,
    klant.bedrijf ? `Via ${klant.bedrijf}` : null,
  ].filter(Boolean) as string[];

  return (
    <div className="flex flex-col gap-4">
      <Link href="/klanten" className="text-sm text-mat hover:text-inkt">← Klanten</Link>
      <div className="flex flex-col gap-2">
        <h1 className="kop text-3xl">{klant.voornaam} {klant.achternaam}</h1>
        <div className="flex flex-wrap gap-1.5">
          {chips.map((c) => <span key={c} className="rounded-full bg-groen-zacht px-3 py-1 text-sm">{c}</span>)}
          {!klant.toestemming_gezondheid_op && <span className="rounded-full bg-oranje-zacht px-3 py-1 text-sm text-oranje">Nog geen toestemming gezondheidsgegevens</span>}
        </div>
      </div>

      <nav aria-label="Dossier" className="flex flex-wrap gap-6 border-b border-lijn">
        {TABS.map(([k, l]) => (
          <Link key={k} href={`/klanten/${id}?tab=${k}`}
            className={`-mb-px border-b-[3px] py-2.5 text-sm font-semibold ${tab === k ? "border-groen text-inkt" : "border-transparent text-mat hover:text-inkt"}`}>
            {l}
            {k === "taken" && (taken?.filter((t) => !t.klaar).length ?? 0) > 0 && (
              <span className="ml-1.5 rounded-full bg-oranje-zacht px-1.5 text-xs text-oranje">{taken?.filter((t) => !t.klaar).length}</span>
            )}
          </Link>
        ))}
      </nav>

      {fout && <Melding>{fout}</Melding>}
      {opgeslagen && <Melding soort="ok">Opgeslagen.</Melding>}

      {tab === "metingen" ? (
        <TabMetingen klant={klant} metingen={metingen ?? []} traject={actief} />
      ) : tab === "notities" ? (
        <TabNotities klantId={id} notities={notities ?? []} />
      ) : tab === "taken" ? (
        <TabTaken klantId={id} taken={taken ?? []} />
      ) : (
        <TabDossier klant={klant} trajecten={trajecten ?? []} />
      )}
    </div>
  );
}
