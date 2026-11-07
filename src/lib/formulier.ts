/** Kleine helpers om FormData veilig uit te lezen. */

export function tekst(fd: FormData, sleutel: string): string | null {
  const v = fd.get(sleutel);
  if (typeof v !== "string") return null;
  const t = v.trim();
  return t === "" ? null : t;
}

export function getal(fd: FormData, sleutel: string): number | null {
  const t = tekst(fd, sleutel);
  if (t == null) return null;
  const n = Number(t.replace(",", "."));
  return Number.isFinite(n) ? n : null;
}

export function lijst(fd: FormData, sleutel: string): string[] {
  const t = tekst(fd, sleutel);
  return t ? t.split(",").map((s) => s.trim().toLowerCase()).filter(Boolean) : [];
}

export function vinkje(fd: FormData, sleutel: string): boolean {
  return fd.get(sleutel) === "on";
}
