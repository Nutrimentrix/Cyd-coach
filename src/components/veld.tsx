export function Veld({ label, children, className = "", hint }: { label: string; children: React.ReactNode; className?: string; hint?: string }) {
  return (
    <label className={`flex flex-col gap-1 ${className}`}>
      <span className="label">{label}</span>
      {children}
      {hint && <span className="text-xs text-mat">{hint}</span>}
    </label>
  );
}

export function Melding({ soort = "fout", children }: { soort?: "fout" | "ok"; children: React.ReactNode }) {
  return (
    <p role="status" className={`rounded-lg px-3 py-2 text-[15px] ${soort === "ok" ? "bg-groen-zacht text-groen-donker" : "bg-oranje-zacht text-oranje"}`}>
      {children}
    </p>
  );
}
