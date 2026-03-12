// src/shared/utils/cn.ts
export function cn(...parts: Array<string | null | undefined | false>): string {
  return parts.filter(Boolean).join(" ");
}
