import { useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { cn } from "@/shared/utils/cn";
import { useGalleryDetail } from "@/features/galleries/hooks";
import { GallerySettingsModal } from "@/features/galleries/components";

import {
  ExhibitSlots2DModal,
  ExhibitEditorModal,
} from "@/features/exhibits/components";

import { GalleryDetailPreview3D } from "@/features/exhibits/components/playcanvas/GalleryDetailPreview3D";

export function GalleryWorkspacePage() {
  const { galleryId } = useParams<{ galleryId: string }>();
  const navigate = useNavigate();

  const[viewMode, setViewMode] = useState<"shelf" | "collection">("shelf");
  const[settingsOpen, setSettingsOpen] = useState(false);
  const [slotsOpen, setSlotsOpen] = useState(false);
  const [editorOpen, setEditorOpen] = useState(false);
  const[selectedSlotIndex, setSelectedSlotIndex] = useState<number | null>(null);

  const id = galleryId ?? null;
  const q = useGalleryDetail(id);

  const title = useMemo(() => {
    const t = (q.data as any)?.title;
    return (t && String(t).trim().length > 0 ? String(t) : "Untitled") as string;
  }, [q.data]);

  const slots = (q.normalizedExhibits ??[]) as Array<any | null>;
  const currentExhibit = selectedSlotIndex == null ? null : slots[selectedSlotIndex] ?? null;

  if (!id) {
    return (
      <div className="p-4 sm:p-8 bg-brand-bg min-h-full">
        <div className="rounded-3xl border border-brand-border bg-brand-surface p-6 text-brand-text font-bold text-sm shadow-sm">
          Select a gallery or invalid ID.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto h-full flex flex-col p-4 sm:p-8 bg-brand-bg">
      {/* Header Area */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-brand-surface p-5 sm:p-6 rounded-3xl border border-brand-border shadow-sm">
        <div className="min-w-0">
          <h1 className="truncate text-2xl font-extrabold text-brand-text tracking-tight">
            {title}
          </h1>
          <div className="mt-1.5 inline-flex items-center text-xs font-bold text-brand-text-muted bg-brand-bg-soft px-3 py-1 rounded-full border border-brand-border-strong">
            {q.isLoading ? "Loading..." : `slug: ${(q.data as any)?.slug}`}
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-3 w-full sm:w-auto">
          <button
            className="flex-1 sm:flex-none rounded-full bg-brand-bg-soft border border-brand-border px-6 py-2.5 text-sm font-bold text-brand-text hover:bg-brand-border-strong active:scale-95 transition-all"
            onClick={() => navigate("/app/galleries")}
          >
            Back
          </button>
          <button
            className="flex-1 sm:flex-none rounded-full bg-brand-primary px-6 py-2.5 text-sm font-bold text-white shadow-md shadow-brand-primary/20 hover:bg-brand-primary-hover active:scale-95 transition-all"
            onClick={() => setSettingsOpen(true)}
          >
            Settings
          </button>
        </div>
      </div>

      {q.isError && (
        <div className="rounded-2xl border border-brand-secondary/30 bg-brand-secondary/10 p-4 text-sm font-bold text-brand-secondary">
          Failed to fetch gallery detail.
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-3 pb-2">
        <button
          className={cn(
            "rounded-full px-6 py-2.5 text-sm font-bold transition-all duration-200 border",
            viewMode === "shelf" 
              ? "bg-brand-primary text-white border-brand-primary shadow-md shadow-brand-primary/20" 
              : "bg-brand-surface text-brand-text-muted border-brand-border hover:bg-brand-bg-soft hover:text-brand-text"
          )}
          onClick={() => setViewMode("shelf")}
        >
          Shelf View (3D)
        </button>
        <button
          className={cn(
            "rounded-full px-6 py-2.5 text-sm font-bold transition-all duration-200 border",
            viewMode === "collection" 
              ? "bg-brand-primary text-white border-brand-primary shadow-md shadow-brand-primary/20" 
              : "bg-brand-surface text-brand-text-muted border-brand-border hover:bg-brand-bg-soft hover:text-brand-text"
          )}
          onClick={() => setViewMode("collection")}
        >
          Collection View
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 relative min-h-[700px] rounded-3xl overflow-hidden shadow-sm border border-brand-border bg-brand-surface">
        {viewMode === "shelf" ? (
          <div className="absolute inset-0 overflow-hidden rounded-3xl bg-brand-bg-soft">
            <GalleryDetailPreview3D 
              slots={q.normalizedExhibits ??[]} 
              isPaused={editorOpen} 
            />
          </div>
        ) : (
          <div className="h-full flex flex-col p-6 sm:p-8 bg-brand-surface">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-xl font-extrabold text-brand-text tracking-tight">
                  Exhibits Collection
                </h2>
                <p className="text-sm font-medium text-brand-text-muted mt-1">
                  Manage exhibits in the 12 available slots.
                </p>
              </div>
            </div>

            {/* Collection 簡易グリッド */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 overflow-y-auto pb-6 pr-2">
              {slots.map((exhibit, idx) => (
                <div 
                  key={idx}
                  onClick={() => { setSelectedSlotIndex(idx); setEditorOpen(true); }}
                  className="aspect-square rounded-[2rem] border border-brand-border bg-brand-bg flex flex-col items-center justify-center cursor-pointer hover:border-brand-primary hover:bg-brand-primary-soft transition-all duration-200 relative group overflow-hidden"
                >
                  <div className="absolute top-4 left-4 text-[11px] font-extrabold text-brand-primary bg-white px-3 py-1 rounded-full shadow-sm border border-brand-border-strong z-10">
                    Slot {idx + 1}
                  </div>
                  {exhibit ? (
                    <>
                      <img src={exhibit.imageForegroundUrl} alt="" className="w-3/4 h-3/4 object-contain mb-2 drop-shadow-md group-hover:scale-105 transition-transform duration-300" />
                      <span className="text-sm font-bold text-brand-text truncate w-full text-center px-4 z-10 absolute bottom-0 pb-4">
                        {exhibit.title || "Untitled"}
                      </span>
                    </>
                  ) : (
                    <span className="text-sm text-brand-text-soft font-bold tracking-wide">Empty</span>
                  )}
                  
                  {/* アクリル・グラスモーフィズムなHover演出 */}
                  <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all duration-200 z-20">
                    <span className="text-sm font-bold text-white bg-brand-primary px-6 py-2.5 rounded-full shadow-md scale-95 group-hover:scale-100 transition-transform">
                      {exhibit ? "Edit" : "Create"}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <ExhibitSlots2DModal
              open={slotsOpen}
              onClose={() => setSlotsOpen(false)}
              slots={slots}
              selectedSlotIndex={selectedSlotIndex}
              onSelectSlot={(idx) => { 
                setSelectedSlotIndex(idx); 
                setEditorOpen(true); 
              }}
              onOpenEditor={() => {
                setSlotsOpen(false);
                setEditorOpen(true);
              }}
            />
          </div>
        )}

        <ExhibitEditorModal
          key={`${id}:${selectedSlotIndex ?? "none"}:${editorOpen ? "open" : "closed"}`}
          open={editorOpen}
          onClose={() => setEditorOpen(false)}
          galleryId={id}
          slotIndex={selectedSlotIndex ?? 0}
          current={currentExhibit}
        />
      </div>

      <GallerySettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} galleryId={id} />
    </div>
  );
}