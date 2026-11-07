"use client";

import Image from "next/image";
import { useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "bezig" | "verstuurd" | "fout">("idle");
  const [fout, setFout] = useState("");

  async function verstuur(e: React.FormEvent) {
    e.preventDefault();
    setStatus("bezig");
    const { error } = await supabaseBrowser().auth.signInWithOtp({
      email,
      // Alleen bestaande coaches: nieuwe accounts maakt een beheerder aan in Supabase.
      options: { emailRedirectTo: `${window.location.origin}/auth/callback`, shouldCreateUser: false },
    });
    if (error) {
      setFout("Inloggen lukte niet. Controleer je e-mailadres of vraag een beheerder om toegang.");
      setStatus("fout");
    } else {
      setStatus("verstuurd");
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <div className="kaart w-full max-w-sm p-6">
        <Image src="/cyd-logo.png" alt="Choose Your Diet" width={180} height={30} className="h-7 w-auto" priority />
        <h1 className="kop mt-6 text-2xl">Coachomgeving</h1>
        {status === "verstuurd" ? (
          <p className="mt-3 text-[15px]">Check je mail. Je hebt een link ontvangen om in te loggen.</p>
        ) : (
          <form onSubmit={verstuur} className="mt-4 flex flex-col gap-3">
            <label className="flex flex-col gap-1">
              <span className="label">E-mailadres</span>
              <input className="veld" type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </label>
            <button className="knop-primair" disabled={status === "bezig"}>
              {status === "bezig" ? "Bezig…" : "Stuur inloglink"}
            </button>
            {status === "fout" && <p className="text-sm text-rood">{fout}</p>}
          </form>
        )}
      </div>
    </main>
  );
}
