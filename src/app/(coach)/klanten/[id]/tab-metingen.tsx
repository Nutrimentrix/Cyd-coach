import { Veld } from "@/components/veld";
import { berekenEnergie, leeftijdOp, type EnergieUitkomst } from "@/lib/energie";
import { datumNL, getalNL } from "@/lib/opties";
import type { Klant, Meting, Traject } from "@/lib/types";
import { verwijderMeting, voegMetingToe } from "../../acties";

const KOLOMMEN: [keyof Meting, string, number][] = [
  ["gewicht_kg", "Gewicht (kg)", 1], ["vet_pct", "Vet %", 1], ["spier_pct", "Spier %", 1], ["visceraal", "Visceraal", 0],
  ["taille_cm", "Taille", 1], ["heup_cm", "Heup", 1], ["borst_cm", "Borst", 1],
  ["biceps_mm", "Biceps", 0], ["triceps_mm", "Triceps", 0], ["rug_mm", "Rug", 0], ["buik_mm", "Buik", 0], ["pal", "PAL", 2],
];

function behoefte(klant: Klant, metingen: Meting[], traject: Traject | null):
  { uitkomst: EnergieUitkomst; meting: Meting; pal: number; palGeschat: boolean } | { ontbreekt: string[] } {
  const meting = metingen.find((m) => m.gewicht_kg != null);
  const lengte = metingen.find((m) => m.lengte_cm != null)?.lengte_cm ?? null;
  const palMeting = metingen.find((m) => m.pal != null)?.pal ?? null;
  const ontbreekt = [
    !meting && "gewicht",
    !lengte && "lengte",
    !klant.geboortedatum && "geboortedatum",
    !klant.geslacht && "geslacht",
  ].filter(Boolean) as string[];
  if (ontbreekt.length || !meting || !lengte || !klant.geboortedatum || !klant.geslacht) return { ontbreekt };
  const pal = Number(palMeting ?? 1.55);
  const uitkomst = berekenEnergie({
    geslacht: klant.geslacht,
    gewichtKg: Number(meting.gewicht_kg),
    lengteCm: Number(lengte),
    leeftijd: leeftijdOp(klant.geboortedatum, meting.datum),
    vetPct: meting.vet_pct != null ? Number(meting.vet_pct) : null,
    pal,
    aanpassingPct: traject ? Number(traject.aanpassing_pct) : 0,
    eiwitGPerKg: traject ? Number(traject.eiwit_g_per_kg) : 1.8,
    eiwitBasis: traject?.eiwit_basis ?? "gewicht",
    formule: traject?.energie_formule ?? "mifflin",
  });
  return { uitkomst, meting, pal, palGeschat: palMeting == null };
}

export function TabMetingen({ klant, metingen, traject }: { klant: Klant; metingen: Meting[]; traject: Traject | null }) {
  const b = behoefte(klant, metingen, traject);
  const vandaag = new Date().toISOString().slice(0, 10);
  const vorigeLengte = metingen.find((m) => m.lengte_cm != null)?.lengte_cm ?? undefined;

  return (
    <div className="flex flex-col gap-4">
      <section className="kaart flex flex-col gap-3 p-5">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="kop text-lg">Behoefte</h2>
          {"uitkomst" in b && <span className="text-sm text-mat">Op basis van de meting van {datumNL(b.meting.datum)}</span>}
        </div>
        {"ontbreekt" in b ? (
          <p className="text-[15px] text-mat">Voor de berekening ontbreekt nog: {b.ontbreekt.join(", ")}.</p>
        ) : (
          <>
            <div className="flex flex-wrap gap-x-8 gap-y-3">
              <Getal label="Mifflin-St Jeor" waarde={b.uitkomst.mifflin} actief={b.uitkomst.gekozenFormule === "mifflin"} />
              <Getal label="Katch-McArdle" waarde={b.uitkomst.katch} actief={b.uitkomst.gekozenFormule === "katch"} />
              <Getal label="PAL" waarde={b.pal} decimalen={2} />
              <Getal label="Behoefte" waarde={b.uitkomst.behoefte} />
              <Getal label={`Advies (${traject ? `${traject.aanpassing_pct > 0 ? "+" : ""}${traject.aanpassing_pct}%` : "geen traject"})`} waarde={b.uitkomst.advies} nadruk />
              <Getal label="Eiwit (g)" waarde={b.uitkomst.eiwitG} />
              {b.uitkomst.vetvrijeMassaKg != null && <Getal label="Vetvrije massa (kg)" waarde={b.uitkomst.vetvrijeMassaKg} decimalen={1} />}
            </div>
            <p className="text-sm text-mat">
              Rustverbruik volgens {b.uitkomst.gekozenFormule === "katch" ? "Katch-McArdle" : "Mifflin-St Jeor"}.
              {b.palGeschat && " Er is nog geen PAL ingevuld; er is gerekend met 1,55."}
              {!traject && " Maak een traject aan om het advies en eiwit per klant in te stellen."}
            </p>
          </>
        )}
      </section>

      <details className="kaart p-5" open={metingen.length === 0}>
        <summary className="kop cursor-pointer text-lg">Nieuwe meting</summary>
        <form action={voegMetingToe.bind(null, klant.id)} className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
          <Veld label="Datum" className="col-span-2"><input name="datum" type="date" className="veld" defaultValue={vandaag} /></Veld>
          <Veld label="Lengte (cm)"><input name="lengte_cm" inputMode="decimal" className="veld" defaultValue={vorigeLengte} /></Veld>
          <Veld label="Gewicht (kg)"><input name="gewicht_kg" inputMode="decimal" className="veld" /></Veld>
          <Veld label="Vet %"><input name="vet_pct" inputMode="decimal" className="veld" /></Veld>
          <Veld label="Spier %"><input name="spier_pct" inputMode="decimal" className="veld" /></Veld>
          <Veld label="Visceraal"><input name="visceraal" inputMode="decimal" className="veld" /></Veld>
          <Veld label="Taille (cm)"><input name="taille_cm" inputMode="decimal" className="veld" /></Veld>
          <Veld label="Heup (cm)"><input name="heup_cm" inputMode="decimal" className="veld" /></Veld>
          <Veld label="Borst (cm)"><input name="borst_cm" inputMode="decimal" className="veld" /></Veld>
          <Veld label="Biceps (mm)"><input name="biceps_mm" inputMode="decimal" className="veld" /></Veld>
          <Veld label="Triceps (mm)"><input name="triceps_mm" inputMode="decimal" className="veld" /></Veld>
          <Veld label="Rug (mm)"><input name="rug_mm" inputMode="decimal" className="veld" /></Veld>
          <Veld label="Buik (mm)"><input name="buik_mm" inputMode="decimal" className="veld" /></Veld>
          <Veld label="PAL" hint="1,2 tot 2,5"><input name="pal" inputMode="decimal" className="veld" /></Veld>
          <Veld label="Notitie" className="col-span-2 sm:col-span-4 lg:col-span-7"><input name="notitie" className="veld" /></Veld>
          <div className="col-span-2"><button className="knop-primair">Meting opslaan</button></div>
        </form>
      </details>

      <section className="kaart overflow-x-auto">
        <table className="w-full min-w-[900px] text-right text-sm tabular-nums">
          <thead className="border-b border-lijn">
            <tr>
              <th className="label px-3 py-3 text-left">Datum</th>
              {KOLOMMEN.map(([k, l]) => <th key={k} className="label px-3 py-3">{l}</th>)}
              <th className="px-3 py-3"><span className="sr-only">Acties</span></th>
            </tr>
          </thead>
          <tbody>
            {metingen.map((m) => (
              <tr key={m.id} className="border-b border-lijn last:border-0">
                <td className="px-3 py-2.5 text-left">{datumNL(m.datum)}</td>
                {KOLOMMEN.map(([k, , d]) => <td key={k} className="px-3 py-2.5">{getalNL(m[k] as number | null, d)}</td>)}
                <td className="px-3 py-2.5">
                  <form action={verwijderMeting.bind(null, m.id, klant.id)}>
                    <button className="text-xs font-semibold text-rood hover:underline">Verwijderen</button>
                  </form>
                </td>
              </tr>
            ))}
            {metingen.length === 0 && <tr><td colSpan={KOLOMMEN.length + 2} className="px-4 py-6 text-center text-mat">Nog geen metingen.</td></tr>}
          </tbody>
        </table>
      </section>
    </div>
  );
}

function Getal({ label, waarde, decimalen = 0, actief, nadruk }: { label: string; waarde: number | null; decimalen?: number; actief?: boolean; nadruk?: boolean }) {
  return (
    <div className="flex flex-col">
      <span className={`text-xs ${actief ? "font-bold text-groen-donker" : "text-mat"}`}>{label}{actief ? " · gebruikt" : ""}</span>
      <b className={`text-xl tabular-nums ${nadruk ? "text-groen-donker" : ""} ${waarde == null ? "text-mat" : ""}`}>{getalNL(waarde, decimalen)}</b>
    </div>
  );
}
