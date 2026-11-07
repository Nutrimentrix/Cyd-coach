import { Veld } from "@/components/veld";
import { datumNL } from "@/lib/opties";
import type { Taak } from "@/lib/types";
import { voegTaakToe, wisselTaak } from "../../acties";

export function TabTaken({ klantId, taken }: { klantId: string; taken: Taak[] }) {
  const vandaag = new Date().toISOString().slice(0, 10);
  return (
    <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)]">
      <form action={voegTaakToe.bind(null, klantId)} className="kaart flex flex-col gap-3 p-5">
        <h2 className="kop text-lg">Nieuwe taak</h2>
        <Veld label="Wat moet er gebeuren"><input name="titel" className="veld" placeholder="Bijv. lunch aanpassen in schema" required /></Veld>
        <Veld label="Deadline"><input name="deadline" type="date" className="veld" /></Veld>
        <div><button className="knop-primair">Taak toevoegen</button></div>
      </form>

      <section className="kaart flex flex-col p-2">
        {taken.length === 0 && <p className="p-3 text-mat">Geen taken.</p>}
        {taken.map((t) => {
          const telaat = !t.klaar && t.deadline != null && t.deadline < vandaag;
          return (
            <form key={t.id} action={wisselTaak.bind(null, t.id, klantId, !t.klaar)} className="flex items-center gap-3 border-b border-lijn p-3 last:border-0">
              <button aria-label={t.klaar ? "Markeer als open" : "Markeer als klaar"}
                className={`flex size-6 flex-none items-center justify-center rounded-md border-2 ${t.klaar ? "border-groen-donker bg-groen-donker text-white" : "border-mat"}`}>
                {t.klaar && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" aria-hidden="true"><path d="M20 6 9 17l-5-5" /></svg>}
              </button>
              <span className={`flex-1 ${t.klaar ? "text-mat line-through" : ""}`}>{t.titel}</span>
              {t.deadline && <span className={`text-sm ${telaat ? "font-bold text-oranje" : "text-mat"}`}>{datumNL(t.deadline)}</span>}
            </form>
          );
        })}
      </section>
    </div>
  );
}
