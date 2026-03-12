import { useMemo, useState } from "react";
import { cn } from "@/shared/utils/cn";
import { useGalleryDetail } from "@/features/galleries/hooks";
import { GallerySettingsModal } from "@/features/galleries/components";

import {
  ExhibitSlots2DModal,
  ExhibitEditorModal,
} from "@/features/exhibits/components";

import { PlaycanvasExhibits } from "@/features/exhibits/components/playcanvas/PlaycanvasExhibits";

type Props = {
  galleryId?: string | null;
  onBack?: () => void;
  className?: string;
};

/**
 * Gallery(1) = 12 slots
 * - q.normalizedExhibits が SSOT（null含む12要素）
 * - exhibits の操作は slot upsert/delete
 */
export function GalleryDetailTab(props: Props) {
  const [settingsOpen, setSettingsOpen] = useState(false);

  // exhibits UI state
  const [slotsOpen, setSlotsOpen] = useState(false);
  const [editorOpen, setEditorOpen] = useState(false);
  const [selectedSlotIndex, setSelectedSlotIndex] = useState<number | null>(null);

  const id = props.galleryId ?? null;
  const q = useGalleryDetail(id);

  const title = useMemo(() => {
    const t = (q.data as any)?.title;
    return (t && String(t).trim().length > 0 ? String(t) : "Untitled") as string;
  }, [q.data]);

  const slots = (q.normalizedExhibits ?? []) as Array<any | null>; // 12 fixed
  const currentExhibit = selectedSlotIndex == null ? null : slots[selectedSlotIndex] ?? null;

  function openSlots() {
    setSlotsOpen(true);
    // 初回の選択が無ければ 0 を選択しておく（UX）
    setSelectedSlotIndex((v) => (v == null ? 0 : v));
  }



  function closeEditor() {
    setEditorOpen(false);
  }
  if (!id) {
    return (
      <div className={cn("rounded-2xl border border-white/10 bg-white/5 p-6", props.className)}>
        <div className="text-base font-semibold text-white">Select a gallery</div>
        <div className="mt-1 text-sm text-white/70">Choose a gallery from the library tab.</div>
      </div>
    );
  }


  return (
    <div className={cn("space-y-4", props.className)}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="truncate text-base font-semibold text-white">{title}</div>
          <div className="mt-0.5 text-sm text-white/60">
            <span>
              {q.isLoading ? "Loading..." : q.isError ? "Failed to load" : `slug: ${(q.data as any)?.slug}`}
            </span>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {props.onBack ? (
            <button
              type="button"
              className={cn(
                "rounded-xl bg-white/10 px-3 py-2 text-sm font-semibold text-white/80",
                "hover:bg-white/15 active:scale-[0.99]",
                "focus:outline-none focus:ring-2 focus:ring-sky-400/50"
              )}
              onClick={props.onBack}
            >
              Back
            </button>
          ) : null}

          <button
            type="button"
            className={cn(
              "rounded-xl bg-white/10 px-3 py-2 text-sm font-semibold text-white/80",
              "hover:bg-white/15 active:scale-[0.99]",
              "focus:outline-none focus:ring-2 focus:ring-sky-400/50"
            )}
            onClick={openSlots}
            disabled={q.isLoading || q.isError}
            title="Edit exhibits in 12 slots"
          >
            展示する
          </button>

          <button
            type="button"
            className={cn(
              "rounded-xl bg-sky-500/20 px-3 py-2 text-sm font-semibold text-sky-200",
              "hover:bg-sky-500/25 active:scale-[0.99]",
              "focus:outline-none focus:ring-2 focus:ring-sky-400/50"
            )}
            onClick={() => setSettingsOpen(true)}
            disabled={q.isLoading || q.isError}
          >
            Settings
          </button>
        </div>
      </div>

      {q.isError ? (
        <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-100">
          Failed to fetch gallery detail.
        </div>
      ) : null}

      {/* WebGPU差し込み場所（今はプレースホルダ） */}
      <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-sm font-semibold text-white">Exhibits (slots)</div>
            <div className="mt-1 text-sm text-white/60">WebGPU view will be mounted here.</div>
          </div>

          <button
            type="button"
            className={cn(
              "rounded-xl bg-white/10 px-3 py-2 text-sm font-semibold text-white/80",
              "hover:bg-white/15 active:scale-[0.99]",
              "focus:outline-none focus:ring-2 focus:ring-sky-400/50"
            )}
            onClick={openSlots}
            disabled={q.isLoading || q.isError}
          >
            Slot一覧
          </button>
        </div>

        <div className="mt-6">
          <div className="mt-3">
            <PlaycanvasExhibits
              normalizedSlots={q.normalizedExhibits ?? []}
              revision={String(q.dataUpdatedAt ?? "")}
            />
          </div>
        </div>
      </div>

      <GallerySettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} galleryId={id} />

      {/* --- Exhibits UI --- */}
      <ExhibitSlots2DModal
        open={slotsOpen}
        onClose={() => setSlotsOpen(false)}
        slots={slots}
        selectedSlotIndex={selectedSlotIndex}
        onSelectSlot={(idx) => {setEditorOpen(true);setSelectedSlotIndex(idx);}}
        onOpenEditor={() => {
          setSlotsOpen(false);
          setEditorOpen(true);
        }}
      />

      <ExhibitEditorModal
        key={`${id}:${selectedSlotIndex ?? "none"}:${editorOpen ? "open" : "closed"}`}
        open={editorOpen}
        onClose={closeEditor}
        galleryId={id}
        slotIndex={selectedSlotIndex ?? 0}
        current={currentExhibit}
      />

    </div>
  
  );
}