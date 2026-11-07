import { Veld } from "@/components/veld";
import { datumNL } from "@/lib/opties";
import type { Notitie } from "@/lib/types";
import { voegNotitieToe } from "../../acties";

export function TabNotities({ klantId, notities }: { klantId: string; notities: Notitie[] }) {
  const vandaag = new Date().toISOString().slice(0, 10);
  return (
    <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)]">
      <form action={voegNotitieToe.bind(null, klantId)} className="kaart flex flex-col gap-3 p-5">
        <h2 className="kop text-lg">Nieuwe notitie</h2>
        <div className="grid gap-3 sm:grid-cols-[150px_1fr]">
          <Veld label="Datum"><input name="datum" type="date" className="veld" defaultValue={vandaag} /></Veld>
          <Veld label="Onderwerp"><input name="onderwerp" className="veld" placeholder="Consult, telefoongesprek…" required /></Veld>
        </div>
        <Veld label="Samenvatting">
          <textarea name="inhoud" rows={8} className="veld py-2" />
        </Veld>
        <div><button className="knop-primair">Notitie opslaan</button></div>
      </form>

      <section className="flex flex-col gap-3">
        {notities.length === 0 && <p className="text-mat">Nog geen notities.</p>}
        {notities.map((n) => (
          <article key={n.id} className="kaart p-4">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h3 className="font-bold">{n.onderwerp}</h3>
              <span className="text-sm text-mat">{datumNL(n.datum)}</span>
            </div>
            {n.inhoud && <p className="mt-2 whitespace-pre-line text-[15px] leading-relaxed">{n.inhoud}</p>}
          </article>
        ))}
      </section>
    </div>
  );
}
