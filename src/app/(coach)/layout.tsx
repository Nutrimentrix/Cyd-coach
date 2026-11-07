import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { envCompleet } from "@/lib/env";
import { huidigeCoach } from "@/lib/supabase/server";
import { uitloggen } from "./acties";

export default async function CoachLayout({ children }: { children: React.ReactNode }) {
  if (!envCompleet) {
    return (
      <main className="mx-auto max-w-xl p-6">
        <h1 className="kop text-2xl">Nog niet gekoppeld</h1>
        <p className="mt-2">Vul de Supabase-gegevens in bij de omgevingsvariabelen. Zie de README.</p>
      </main>
    );
  }
  const coach = await huidigeCoach();
  if (!coach) redirect("/login");

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-lijn bg-white">
        <div className="mx-auto flex max-w-[1440px] flex-wrap items-center gap-5 px-6 py-3">
          <Link href="/klanten" aria-label="Naar klanten">
            <Image src="/cyd-logo.png" alt="Choose Your Diet" width={156} height={26} className="h-6 w-auto" priority />
          </Link>
          <nav aria-label="Hoofdmenu" className="flex flex-1 flex-wrap gap-1 text-sm font-semibold">
            <Link href="/klanten" className="rounded-lg bg-groen-zacht px-3 py-1.5">Klanten</Link>
            <span className="cursor-not-allowed rounded-lg px-3 py-1.5 text-mat/60" title="Volgt in een volgende stap">Recepten</span>
            <span className="cursor-not-allowed rounded-lg px-3 py-1.5 text-mat/60" title="Volgt in een volgende stap">Nieuwsbrief</span>
          </nav>
          <span className="text-sm text-mat">{coach.email}</span>
          <form action={uitloggen}>
            <button className="knop min-h-8 px-3">Uitloggen</button>
          </form>
        </div>
      </header>
      <main className="mx-auto w-full max-w-[1440px] flex-1 px-6 pb-12 pt-5">{children}</main>
    </div>
  );
}
