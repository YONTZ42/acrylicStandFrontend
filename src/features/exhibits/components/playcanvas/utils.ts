export function clamp(v: number, a: number, b: number) {
  return Math.max(a, Math.min(b, v));
}

export function safeText(v: unknown, fallback = ""): string {
  const s = typeof v === "string" ? v : v == null ? "" : String(v);
  return s.trim().length ? s : fallback;
}