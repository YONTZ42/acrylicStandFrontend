import { cn } from "@/shared/utils/cn";

type Props = {
  slotIndex: number;
  exhibit: any | null; // GalleryDetailTab側の normalizedExhibits の要素（Exhibit|null）
  isSelected?: boolean;
  onClick?: () => void;
};

export function SlotCard({ slotIndex, exhibit, isSelected, onClick }: Props) {
  const title = exhibit?.title?.trim() || (exhibit ? "Untitled" : "Empty");
  const desc = exhibit?.description?.trim() || "";

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "w-full text-left rounded-xl border p-3 transition",
        "hover:bg-white/5",
        isSelected ? "border-white/50 bg-white/5" : "border-white/10"
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="text-xs opacity-70">Slot {slotIndex + 1}</div>
        <div
          className={cn(
            "text-xs px-2 py-0.5 rounded-full border",
            exhibit ? "border-emerald-400/40 text-emerald-200" : "border-white/15 text-white/70"
          )}
        >
          {exhibit ? "Filled" : "Empty"}
        </div>
      </div>

      <div className="mt-2 font-medium line-clamp-1">{title}</div>
      <div className="mt-1 text-xs opacity-70 line-clamp-2">
        {desc || (exhibit ? "—" : "Tap to add an exhibit")}
      </div>
    </button>
  );
}
