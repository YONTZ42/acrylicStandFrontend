import { X, Edit2 } from "lucide-react";
import { useExhibitEditorStore, EditorStoreContext } from "@/features/exhibits/hooks/useExhibitEditorStore";
import { ExhibitPreview3D } from "@/features/exhibits/components/ExhibitEditorModal/ExhibitPreview3D";

type Props = {
  exhibit: any | null;
  onClose: () => void;
  onEdit: (exhibit: any) => void;
};

export function ExhibitPreviewModal({ exhibit, onClose, onEdit }: Props) {
  // 3Dプレビューを単独で表示するため、Storeを読み取り専用（初期値）として提供
  const store = useExhibitEditorStore({
    title: exhibit?.title || "",
    description: exhibit?.description || "",
    foregroundUrl: exhibit?.imageForegroundUrl || exhibit?.imageCutoutPngUrl || null,
    backgroundUrl: exhibit?.imageBackgroundUrl || null,
    originalUrl: exhibit?.imageOriginalUrl || null,
    styleConfig: exhibit?.styleConfig || { depth: 5, foregroundEffect: "none", backgroundEffect: "none" },
  });

  if (!exhibit) return null;

  return (
    <EditorStoreContext.Provider value={store}>
      <div className="fixed inset-0 z-[100] flex flex-col bg-[#050506]/95 backdrop-blur-md text-white font-sans p-4 sm:p-8 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-extrabold text-brand-surface tracking-tight">
              {exhibit.title || "Untitled"}
            </h2>
            <p className="text-xs font-bold text-brand-surface/60 mt-0.5">3D Preview</p>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors"
          >
            <X size={20} strokeWidth={2.5} />
          </button>
        </div>

        {/* 3D Canvas (PlayCanvas) */}
        <div className="flex-1 bg-black/50 rounded-[2rem] border border-white/10 overflow-hidden relative shadow-2xl">
          <ExhibitPreview3D />
        </div>

        {/* Footer Actions */}
        <div className="mt-6 mb-4 flex justify-center pb-safe">
          <button 
            onClick={() => onEdit(exhibit)}
            className="flex items-center gap-2 px-8 py-3.5 bg-brand-primary text-white text-sm font-extrabold rounded-full shadow-[0_0_20px_rgba(0,194,214,0.4)] hover:bg-brand-primary-hover hover:-translate-y-0.5 active:scale-95 transition-all"
          >
            <Edit2 size={18} strokeWidth={2.5} />
            編集ページへ移動する
          </button>
        </div>

      </div>
    </EditorStoreContext.Provider>
  );
}