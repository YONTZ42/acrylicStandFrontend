import { SlotGrid } from "./SlotGrid";

type Props = {
  open: boolean;
  onClose: () => void;
  slots: Array<any | null>; // 12
  selectedSlotIndex: number | null;
  onSelectSlot: (slotIndex: number) => void;
  onOpenEditor: () => void;
};

export function ExhibitSlots2DModal({
  open,
  onClose,
  slots,
  selectedSlotIndex,
  onSelectSlot,
  onOpenEditor,
}: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="absolute inset-x-0 bottom-0 sm:inset-0 sm:flex sm:items-center sm:justify-center p-3">
        <div className="w-full sm:max-w-3xl rounded-2xl border border-white/10 bg-zinc-950 text-white shadow-2xl">
          <div className="p-4 border-b border-white/10 flex items-center justify-between gap-3">
            <div>
              <div className="text-lg font-semibold">Exhibit Slots</div>
              <div className="text-xs opacity-70">Pick a slot to edit (12 fixed slots)</div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-white/15 px-3 py-1.5 text-sm hover:bg-white/5"
            >
              Close
            </button>
          </div>

          <div className="p-4">
            <SlotGrid
              slots={slots}
              selectedSlotIndex={selectedSlotIndex}
              onSelect={onSelectSlot}
            />

            <div className="mt-4 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={onOpenEditor}
                disabled={selectedSlotIndex == null}
                className="rounded-xl bg-white text-black px-4 py-2 text-sm font-semibold disabled:opacity-40"
              >
                Edit selected slot
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
