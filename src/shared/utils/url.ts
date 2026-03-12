// src/shared/utils/url.ts
export function withQuery(path: string, query: Record<string, string | number | boolean | null | undefined>): string {
  const usp = new URLSearchParams();
  for (const [k, v] of Object.entries(query)) {
    if (v === null || v === undefined) continue;
    usp.set(k, String(v));
  }
  const qs = usp.toString();
  return qs ? `${path}?${qs}` : path;
}

export function absoluteUrl(path: string): string {
  // ブラウザ前提（SSRなし想定）
  return new URL(path, window.location.origin).toString();
}
