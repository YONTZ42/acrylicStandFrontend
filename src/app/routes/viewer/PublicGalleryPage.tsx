// src/app/routes/viewer/PublicGalleryPage.tsx
import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Loader2, ChevronRight, Sparkles, X } from "lucide-react";

import type { components } from "@/shared/types/fromBackend/schema";
import { cn } from "@/shared/utils/cn";
import { usePublicGallery } from "@/features/galleries/hooks/usePublicGallery";
import { GalleryDetailPreview3D } from "@/features/exhibits/components/playcanvas/GalleryDetailPreview3D";

// 3Dプレビュー用のフックとコンポーネントを追加
import { useExhibitEditorStore, EditorStoreContext } from "@/features/exhibits/hooks/useExhibitEditorStore";
import { ExhibitPreview3D } from "@/features/exhibits/components/ExhibitEditorModal/ExhibitPreview3D";

type ExhibitPublic = components["schemas"]["ExhibitPublic"];

type PlaycanvasNormalizedSlot = {
  imageOriginalUrl?: string | null;
  imageBackgroundUrl?: string | null;
  imageForegroundUrl?: string | null;
  title?: string | null;
  description?: string | null;
  styleConfig?: any | null;
} | null;

function normalizePublicSlots(
  exhibits: readonly ExhibitPublic[] | null | undefined,
): PlaycanvasNormalizedSlot[] {
  const slots: PlaycanvasNormalizedSlot[] = Array.from({ length: 12 }, () => null);

  for (const ex of exhibits ??[]) {
    if (typeof ex?.slotIndex !== "number") continue;
    if (ex.slotIndex < 0 || ex.slotIndex > 11) continue;

    slots[ex.slotIndex] = {
      imageOriginalUrl: ex.imageOriginalUrl ?? null,
      imageForegroundUrl: ex.imageForegroundUrl ?? null,
      imageBackgroundUrl: ex.imageBackgroundUrl ?? null,
      title: ex.title ?? null,
      description: ex.description ?? null,
      styleConfig: (ex.styleConfig as any) ?? { depth: 5, foregroundEffect: "none", backgroundEffect: "none" },
    };
  }

  return slots;
}

// ----------------------------------------------------------------------
// 1. Loading / Error State (フルスクリーン)
// ----------------------------------------------------------------------
function PublicViewerState({ 
  title, body, loading, actionHref, actionLabel 
}: { 
  title: string; body?: string; loading?: boolean; actionHref?: string; actionLabel?: string; 
}) {
  return (
    <div className="absolute inset-0 w-full h-full bg-[#050506] flex flex-col items-center justify-center text-white overflow-hidden font-sans">
      {loading ? (
        <div className="flex flex-col items-center">
          <Loader2 className="animate-spin mb-4 text-brand-primary" size={48} />
          <span className="font-bold text-sm tracking-widest text-brand-primary drop-shadow-[0_0_10px_rgba(167,139,250,0.5)]">
            Loading Gallery...
          </span>
        </div>
      ) : (
        <div className="w-full max-w-sm p-8 text-center bg-white/5 border border-white/10 rounded-3xl backdrop-blur-md">
          <div className="w-16 h-16 mx-auto mb-4 bg-brand-primary/20 rounded-full flex items-center justify-center">
            <Sparkles className="text-brand-primary" size={32} />
          </div>
          <h1 className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-brand-primary to-brand-accent mb-2">
            {title}
          </h1>
          {body && <p className="text-white/60 text-sm mb-8">{body}</p>}
          {actionHref && actionLabel && (
            <Link
              to={actionHref}
              className="inline-flex w-full justify-center items-center gap-2 py-3.5 bg-gradient-to-r from-brand-primary to-brand-accent text-white font-bold rounded-full shadow-[0_0_20px_rgba(167,139,250,0.4)] hover:scale-105 active:scale-95 transition-transform"
            >
              {actionLabel}
            </Link>
          )}
        </div>
      )}
    </div>
  );
}

// ----------------------------------------------------------------------
// 2. 閲覧専用 Drawer (展示アクスタリスト)
// ----------------------------------------------------------------------
function PublicDrawer({
  isOpen,
  onClose,
  exhibits,
  onPreview
}: {
  isOpen: boolean;
  onClose: () => void;
  exhibits: ExhibitPublic[];
  onPreview: (ex: ExhibitPublic) => void;
}) {
  return (
    <>
      <div
        className={cn(
          "absolute inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity duration-300 pointer-events-auto",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
      />
      <div
        className={cn(
          "absolute bottom-0 left-0 right-0 z-50 bg-brand-surface/90 backdrop-blur-xl border-t border-white/20 rounded-t-[2.5rem] shadow-[0_-10px_40px_rgba(0,0,0,0.5)] transition-transform duration-500 pointer-events-auto",
          isOpen ? "translate-y-0" : "translate-y-full"
        )}
        style={{ transitionTimingFunction: "cubic-bezier(0.34, 1.56, 0.64, 1)" }}
      >
        <div className="flex flex-col h-[50vh] max-h-[500px]">
          <div className="flex justify-center p-3 cursor-pointer" onClick={onClose}>
            <div className="w-12 h-1.5 bg-white/20 rounded-full" />
          </div>
          <div className="px-6 pb-4 flex justify-between items-end">
            <h2 className="text-xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-brand-primary to-brand-accent">
              飾られているアクスタ ✨
            </h2>
          </div>
          <div className="flex-1 overflow-y-auto px-4 pb-8 space-y-3">
             {exhibits.map((ex) => (
               <div key={ex.slotIndex} onClick={() => onPreview(ex)} className="bg-white/5 border border-white/10 rounded-2xl p-3 flex items-center gap-4 cursor-pointer hover:bg-white/10 active:scale-[0.98] transition-all">
                  <div className="w-16 h-16 rounded-xl bg-black/40 border border-white/10 flex items-center justify-center overflow-hidden shrink-0 relative">
                    {ex.imageForegroundUrl ? (
                      <img src={ex.imageForegroundUrl} className="w-full h-full object-contain absolute inset-0 m-auto drop-shadow-md" alt={ex.title ?? ""} />
                    ) : (
                      <Sparkles size={20} className="text-white/20" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-sm text-brand-text truncate">{ex.title || "No Title"}</div>
                    <div className="text-xs text-brand-text/50 truncate mt-1">{ex.description || "タップして詳細を見る"}</div>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center shrink-0">
                    <ChevronRight size={18} className="text-brand-text/50" />
                  </div>
               </div>
             ))}
             {exhibits.length === 0 && (
               <div className="text-center text-white/40 text-sm py-10">
                 展示されているアクスタはありません。
               </div>
             )}
          </div>
        </div>
      </div>
    </>
  );
}

// ----------------------------------------------------------------------
// 3. 閲覧専用 全画面 Preview Modal (3D対応版)
// ----------------------------------------------------------------------
function PublicExhibitPreview({
  exhibit,
  onClose
}: {
  exhibit: ExhibitPublic;
  onClose: () => void;
}) {
  // Storeの初期化 (閲覧専用として提供)
  const store = useExhibitEditorStore({
    title: exhibit.title || "",
    description: exhibit.description || "",
    foregroundUrl: exhibit.imageForegroundUrl || null,
    backgroundUrl: exhibit.imageBackgroundUrl || null,
    originalUrl: exhibit.imageOriginalUrl || null,
    styleConfig: (exhibit.styleConfig as any) || { depth: 5, foregroundEffect: "none", backgroundEffect: "none" },
  });

  return (
    <EditorStoreContext.Provider value={store}>
      <div className="absolute inset-0 z-[60] bg-[#050506]/95 backdrop-blur-xl flex flex-col pointer-events-auto animate-in fade-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <div className="flex items-center gap-2 text-brand-primary">
             <Sparkles size={18} />
             <span className="font-bold text-sm tracking-wider">ACRYLIC DETAIL</span>
          </div>
          <button 
            onClick={onClose}
            className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 active:scale-95 transition-all"
          >
            <X size={20} className="text-white" />
          </button>
        </div>

        {/* 3D Canvas Area */}
        <div className="flex-1 relative flex items-center justify-center p-6 min-h-0">
          <div className="absolute inset-0 flex items-center justify-center opacity-20 pointer-events-none">
            <div className="w-[120vw] h-[120vw] bg-brand-primary/30 blur-[100px] rounded-full" />
          </div>
          
          <div className="w-full h-full bg-black/50 rounded-[2rem] border border-white/10 overflow-hidden relative shadow-2xl z-10">
            <ExhibitPreview3D />
          </div>
        </div>

        {/* Info Area & CTA */}
        <div className="bg-gradient-to-t from-black via-black/80 to-transparent pt-4 pb-8 px-6 mt-auto border-t border-white/5">
           <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-white/60 mb-3 drop-shadow-sm">
             {exhibit.title || "No Title"}
           </h2>
           <p className="text-brand-text/70 text-sm leading-relaxed mb-6">
             {exhibit.description || "説明はありません。"}
           </p>

           <Link
              to="/"
              className="w-full py-4 bg-gradient-to-r from-brand-primary to-brand-accent rounded-2xl flex items-center justify-center gap-3 shadow-[0_10px_30px_rgba(167,139,250,0.3)] hover:opacity-90 active:scale-[0.98] transition-all"
           >
              <Sparkles size={20} className="text-white" />
              <span className="text-white font-bold text-base tracking-wide">
                自分も推しをアクスタにする
              </span>
           </Link>
        </div>
      </div>
    </EditorStoreContext.Provider>
  );
}

// ----------------------------------------------------------------------
// Main Page
// ----------------------------------------------------------------------
export function PublicGalleryPage() {
  const params = useParams<{ slug: string }>();
  const slug = (params.slug ?? "").trim();

  const q = usePublicGallery(slug || null);

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const[previewExhibit, setPreviewExhibit] = useState<ExhibitPublic | null>(null);

  if (!slug) {
    return <PublicViewerState title="Not Found" body="公開URLが不正です。" actionHref="/" actionLabel="トップへ戻る" />;
  }

  if (q.isLoading) {
    return <PublicViewerState title="" loading />;
  }

  if (q.isError || !q.data) {
    return <PublicViewerState title="Not Found" body="このギャラリーは存在しないか、現在は非公開です。" actionHref="/" actionLabel="トップへ戻る" />;
  }

  const gallery = q.data;
  const normalizedSlots = normalizePublicSlots(gallery.exhibits);

  // 祭壇（0〜11）に展示されている有効なアクスタのみを抽出（Drawer用）
  const validExhibits = (gallery.exhibits ??[]).filter(
    (ex) => typeof ex?.slotIndex === "number" && ex.slotIndex >= 0 && ex.slotIndex <= 11
  );

  return (
    <div className="absolute inset-0 w-full h-full bg-[#050506] overflow-hidden font-sans select-none">
      
      {/* 3D View (Background) 
          WebGPUの衝突（コンテキストロスト）を防ぐため、プレビューが開いている間は完全にアンマウントする */}
      <div className="absolute inset-0 z-0 bg-[#050506]">
         {!previewExhibit && (
           <GalleryDetailPreview3D slots={normalizedSlots} isPaused={false} />
         )}
      </div>

      {/* Header (Title & CTA) */}
      <div className="absolute top-4 sm:top-6 left-4 right-4 z-10 flex justify-between items-center pointer-events-none">
        <div className="pointer-events-auto bg-brand-surface/80 backdrop-blur-md pl-2 pr-5 py-2 rounded-full border border-white/50 shadow-glass flex items-center gap-3">
          {gallery.coverRenderUrl ? (
            <img src={gallery.coverRenderUrl} alt="Cover" className="w-8 h-8 rounded-full object-cover border border-white/20" />
          ) : (
            <div className="w-8 h-8 rounded-full bg-brand-primary/20 flex items-center justify-center border border-white/20">
              <Sparkles size={14} className="text-brand-primary" />
            </div>
          )}
          <div className="flex flex-col">
            <span className="text-brand-text font-extrabold text-sm drop-shadow-sm truncate max-w-[120px] sm:max-w-[200px]">
              {gallery.title?.trim() || "Public Gallery"}
            </span>
          </div>
        </div>

        <Link 
          to="/"
          className="pointer-events-auto bg-gradient-to-tr from-brand-primary to-brand-accent text-white px-4 py-2 rounded-full shadow-[0_0_15px_rgba(167,139,250,0.5)] hover:scale-105 active:scale-95 transition-transform flex items-center gap-2 font-bold text-xs sm:text-sm"
        >
          <Sparkles size={16} />
          <span className="hidden sm:inline">自分も作ってみる</span>
          <span className="sm:hidden">作る</span>
        </Link>
      </div>

      {/* Bottom Nav (Drawer Trigger) */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 w-full max-w-sm px-4 pointer-events-none">
        <div className="bg-brand-surface/80 backdrop-blur-md rounded-[2rem] p-2 flex items-center justify-between border border-white/20 shadow-glass pointer-events-auto">
          <button
            onClick={() => setIsDrawerOpen(true)}
            className="flex-1 flex justify-center items-center gap-2 py-3 bg-white/10 rounded-[1.5rem] hover:bg-white/20 active:scale-95 transition-all text-brand-text font-bold text-sm"
          >
            <Sparkles size={18} className="text-brand-primary" />
            <span>飾られているアクスタを見る</span>
          </button>
        </div>
      </div>

      {/* Public Drawer */}
      <PublicDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        exhibits={validExhibits}
        onPreview={(ex) => setPreviewExhibit(ex)}
      />

      {/* Fullscreen Preview Modal (3D対応) 
          previewExhibit が存在する場合のみマウントする */}
      {previewExhibit && (
        <PublicExhibitPreview
          key={previewExhibit.slotIndex || "preview"}
          exhibit={previewExhibit}
          onClose={() => setPreviewExhibit(null)}
        />
      )}
    </div>
  );
}