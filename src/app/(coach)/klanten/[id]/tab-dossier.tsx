import { Veld } from "@/components/veld";
import { CATEGORIEEN, DAGEN, DOELEN, STATUSSEN, datumNL, label } from "@/lib/opties";
import type { Klant, Traject } from "@/lib/types";
import { maakTraject, werkKlantBij, zetTrajectActief } from "../../acties";

export function TabDossier({ klant, trajecten }: { klant: Klant; trajecten: Traject[] }) {
  const vandaag = new Date().toISOString().slice(0, 10);
  return (
    <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
      <form action={werkKlantBij.bind(null, klant.id)} className="kaart grid gap-4 p-5 sm:grid-cols-2">
        <h2 className="kop text-lg sm:col-span-2">Gegevens</h2>
        <Veld label="Voornaam"><input name="voornaam" className="veld" defaultValue={klant.voornaam} required /></Veld>
        <Veld label="Achternaam"><input name="achternaam" className="veld" defaultValue={klant.achternaam} /></Veld>
        <Veld label="E-mail"><input name="email" type="email" className="veld" defaultValue={klant.email ?? ""} /></Veld>
        <Veld label="Telefoon"><input name="telefoon" type="tel" className="veld" defaultValue={klant.telefoon ?? ""} /></Veld>
        <Veld label="Geboortedatum"><input name="geboortedatum" type="date" className="veld" defaultValue={klant.geboortedatum ?? ""} /></Veld>
        <Veld label="Geslacht" hint="Nodig voor de behoefteberekening.">
          <select name="geslacht" className="veld" defaultValue={klant.geslacht ?? ""}>
            <option value="">Onbekend</option><option value="man">Man</option><option value="vrouw">Vrouw</option><option value="anders">Anders</option>
          </select>
        </Veld>
        <Veld label="Woonplaats"><input name="woonplaats" className="veld" defaultValue={klant.woonplaats ?? ""} /></Veld>
        <Veld label="Via bedrijf (B2B)"><input name="bedrijf" className="veld" defaultValue={klant.bedrijf ?? ""} /></Veld>
        <Veld label="Status">
          <select name="status" className="veld" defaultValue={klant.status}>
            {STATUSSEN.map(([k, l]) => <option key={k} value={k}>{l}</option>)}
          </select>
        </Veld>

        <h3 className="label mt-2 sm:col-span-2">Facturatie</h3>
        <Veld label="Naam op factuur"><input name="factuur_naam" className="veld" defaultValue={klant.factuur_naam ?? ""} /></Veld>
        <Veld label="E-mail facturen"><input name="factuur_email" type="email" className="veld" defaultValue={klant.factuur_email ?? ""} /></Veld>
        <Veld label="Adres" className="sm:col-span-2"><input name="factuur_adres" className="veld" defaultValue={klant.factuur_adres ?? ""} /></Veld>

        <h3 className="label mt-2 sm:col-span-2">Toestemming</h3>
        <label className="flex items-start gap-2 text-[15px] sm:col-span-2">
          <input type="checkbox" name="toestemming_gezondheid" defaultChecked={!!klant.toestemming_gezondheid_op} className="mt-1 size-4 accent-groen-donker" />
          <span>Klant heeft uitdrukkelijk toestemming gegeven voor het verwerken van gezondheidsgegevens
            {klant.toestemming_gezondheid_op && <span className="text-mat"> (sinds {datumNL(klant.toestemming_gezondheid_op)})</span>}</span>
        </label>
        <label className="flex items-start gap-2 text-[15px] sm:col-span-2">
          <input type="checkbox" name="toestemming_ai" defaultChecked={klant.toestemming_ai} className="mt-1 size-4 accent-groen-donker" />
          <span>AI mag helpen bij het opstellen van het schema (zonder naam of contactgegevens)</span>
        </label>
        <label className="flex items-start gap-2 text-[15px] sm:col-span-2">
          <input type="checkbox" name="nieuwsbrief" defaultChecked={klant.nieuwsbrief} className="mt-1 size-4 accent-groen-donker" />
          <span>Ontvangt de nieuwsbrief</span>
        </label>
        <div className="sm:col-span-2"><button className="knop-primair">Opslaan</button></div>
      </form>

      <div className="flex flex-col gap-4">
        <section className="kaart flex flex-col gap-3 p-5">
          <h2 className="kop text-lg">Trajecten</h2>
          {trajecten.length === 0 && <p className="text-sm text-mat">Nog geen traject. Maak er hieronder een aan.</p>}
          {trajecten.map((t) => (
            <div key={t.id} className={`rounded-xl border p-3 ${t.is_actief ? "border-groen bg-groen-zacht/60" : "border-lijn"}`}>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <b>{label(DOELEN, t.doel)} · {label(CATEGORIEEN, t.voedingscategorie).toLowerCase()}</b>
                <form action={zetTrajectActief.bind(null, t.id, t.klant_id, !t.is_actief)}>
                  <button className="knop min-h-8 px-3 text-xs">{t.is_actief ? "Zet op inactief" : "Maak actief"}</button>
                </form>
              </div>
              <p className="mt-1 text-sm text-mat">
                Start {datumNL(t.start_datum)} · {t.duur_weken ? `${t.duur_weken} weken` : "doorlopend"} · schema op {DAGEN[t.verzend_dag]} {t.verzend_tijd.slice(0, 5)}
              </p>
              <p className="text-sm text-mat">
                Advies {t.aanpassing_pct > 0 ? "+" : ""}{t.aanpassing_pct}% · eiwit {t.eiwit_g_per_kg} g/kg ({t.eiwit_basis === "vetvrij" ? "vetvrije massa" : "gewicht"}) · {t.energie_formule === "katch" ? "Katch-McArdle" : "Mifflin-St Jeor"}
              </p>
              {(t.lust_niet.length > 0 || t.allergieen.length > 0) && (
                <p className="text-sm">
                  {t.allergieen.length > 0 && <span className="text-rood">Allergie: {t.allergieen.join(", ")}. </span>}
                  {t.lust_niet.length > 0 && <span>Lust niet: {t.lust_niet.join(", ")}.</span>}
                </p>
              )}
            </div>
          ))}
        </section>

        <details className="kaart p-5" open={trajecten.length === 0}>
          <summary className="kop cursor-pointer text-lg">Nieuw traject</summary>
          <form action={maakTraject.bind(null, klant.id)} className="mt-4 grid gap-4 sm:grid-cols-2">
            <Veld label="Startdatum"><input name="start_datum" type="date" className="veld" defaultValue={vandaag} required /></Veld>
            <Veld label="Duur in weken" hint="Leeg laten = doorlopend"><input name="duur_weken" type="number" min={1} className="veld" placeholder="12" /></Veld>
            <Veld label="Doel">
              <select name="doel" className="veld">{DOELEN.map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select>
            </Veld>
            <Veld label="Voedingscategorie">
              <select name="voedingscategorie" className="veld">{CATEGORIEEN.map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select>
            </Veld>
            <Veld label="Allergieën" hint="Gescheiden door komma's. Wordt altijd hard uitgefilterd."><input name="allergieen" className="veld" placeholder="pinda, schaaldieren" /></Veld>
            <Veld label="Lust niet" hint="Gescheiden door komma's."><input name="lust_niet" className="veld" placeholder="paprika, champignons" /></Veld>
            <Veld label="Kooktijd doordeweeks (max. min)"><input name="kooktijd_max_min" type="number" min={5} step={5} className="veld" placeholder="30" /></Veld>
            <label className="flex items-center gap-2 self-end pb-2 text-[15px]">
              <input type="checkbox" name="mealprep" className="size-4 accent-groen-donker" /> Wil mealpreppen
            </label>
            <Veld label="Schema versturen op">
              <select name="verzend_dag" className="veld" defaultValue={0}>{DAGEN.map((d, i) => <option key={d} value={i}>{d}</option>)}</select>
            </Veld>
            <Veld label="Om"><input name="verzend_tijd" type="time" className="veld" defaultValue="18:00" /></Veld>
            <Veld label="Formule rustverbruik">
              <select name="energie_formule" className="veld">
                <option value="mifflin">Mifflin-St Jeor (standaard)</option>
                <option value="katch">Katch-McArdle (met vetpercentage)</option>
              </select>
            </Veld>
            <Veld label="Aanpassing op behoefte (%)" hint="Bijv. -15 om af te vallen, +10 om aan te komen."><input name="aanpassing_pct" type="number" step={1} className="veld" defaultValue={-15} /></Veld>
            <Veld label="Eiwit (g per kg)"><input name="eiwit_g_per_kg" type="number" step={0.1} min={0.8} max={3} className="veld" defaultValue={1.8} /></Veld>
            <Veld label="Eiwit rekenen op">
              <select name="eiwit_basis" className="veld"><option value="gewicht">Lichaamsgewicht</option><option value="vetvrij">Vetvrije massa</option></select>
            </Veld>
            <label className="flex items-center gap-2 text-[15px] sm:col-span-2">
              <input type="checkbox" name="is_actief" defaultChecked className="size-4 accent-groen-donker" /> Direct actief maken
            </label>
            <div className="sm:col-span-2"><button className="knop-primair">Traject opslaan</button></div>
          </form>
        </details>
      </div>
    </div>
  );
}
