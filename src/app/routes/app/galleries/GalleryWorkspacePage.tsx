import { useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useGalleryDetail } from "@/features/galleries/hooks";
import { GallerySettingsModal } from "@/features/galleries/components";
import { GalleryDetailPreview3D } from "@/features/exhibits/components/playcanvas/GalleryDetailPreview3D";

export function GalleryWorkspacePage() {
  const { galleryId } = useParams<{ galleryId: string }>();
  const navigate = useNavigate();

  const[settingsOpen, setSettingsOpen] = useState(false);
  const id = galleryId ?? null;
  const q = useGalleryDetail(id);

  const title = useMemo(() => {
    const t = (q.data as any)?.title;
    return (t && String(t).trim().length > 0 ? String(t) : "Untitled") as string;
  }, [q.data]);

  if (!id || q.isError) {
    return (
      <div className="p-4 sm:p-8 bg-brand-bg min-h-full flex items-center justify-center">
        <div className="rounded-3xl border border-brand-border bg-brand-surface p-6 text-brand-text font-bold text-sm shadow-sm flex flex-col items-center gap-4">
          <p>Failed to load gallery or invalid ID.</p>
          <button 
            onClick={() => navigate("/app/galleries")}
            className="px-6 py-2 bg-brand-bg-soft rounded-full font-bold hover:bg-brand-border transition"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    // マイナス余白と高さを調整して3Dビューを画面いっぱいに広げる
    <div className="relative w-full h-[calc(100dvh-64px-68px)] bg-black overflow-hidden">
      
      {/* 3D プレビュー領域（全画面） */}
      <div className="absolute inset-0">
        <GalleryDetailPreview3D 
          slots={q.normalizedExhibits ??[]} 
          isPaused={false} 
        />
      </div>

      {/* フローティングヘッダー (スマートに小さく) */}
      <div className="absolute top-4 left-4 right-4 flex items-start justify-between pointer-events-none z-10">
        <div className="pointer-events-auto bg-brand-surface/80 backdrop-blur-md p-3 pr-5 rounded-2xl border border-brand-border/50 shadow-lg flex items-center gap-3">
          <button
            className="w-8 h-8 flex items-center justify-center rounded-full bg-brand-bg-soft hover:bg-brand-border text-brand-text transition-colors"
            onClick={() => navigate("/app/galleries")}
            aria-label="Back"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
          </button>
          <div className="flex flex-col">
            <h1 className="text-sm font-extrabold text-brand-text tracking-tight max-w-[150px] truncate">
              {title}
            </h1>
            <span className="text-[10px] font-bold text-brand-text-muted">
              {q.isLoading ? "Loading..." : "3D Gallery Viewer"}
            </span>
          </div>
        </div>

        <button
          className="pointer-events-auto w-10 h-10 flex items-center justify-center rounded-full bg-brand-surface/80 backdrop-blur-md border border-brand-border/50 shadow-lg text-brand-text hover:text-brand-primary hover:bg-white transition-all active:scale-95"
          onClick={() => setSettingsOpen(true)}
          aria-label="Settings"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
        </button>
      </div>

      <GallerySettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} galleryId={id} />
    </div>
  );
}