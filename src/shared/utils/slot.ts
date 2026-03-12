// src/shared/utils/slot.ts
export const SLOT_COUNT = 12 as const;
export type SlotIndex = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11;

export function isValidSlotIndex(n: number): n is SlotIndex {
  return Number.isInteger(n) && n >= 0 && n < SLOT_COUNT;
}

export function clampSlotIndex(n: number): SlotIndex {
  const v = Math.max(0, Math.min(SLOT_COUNT - 1, Math.floor(n)));
  return v as SlotIndex;
}

type WithSlotIndex = { slotIndex: number } | { slot_index: number };
/**
 * 0..11 の 12枠に正規化して返す（存在しない枠は null）
 */
export function normalizeSlots<T extends WithSlotIndex>(items: T[]): Array<T | null> {
  const out: Array<T | null> = Array.from({ length: SLOT_COUNT }, () => null);

  for (const it of items) {
    const rawIdx = "slotIndex" in it ? it.slotIndex : it.slot_index;
    const idx = clampSlotIndex(rawIdx);
    out[idx] = it;
  }
  return out;
}
