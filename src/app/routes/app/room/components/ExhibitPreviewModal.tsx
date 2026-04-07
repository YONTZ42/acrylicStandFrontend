import { X, Edit2 } from "lucide-react";
import { useExhibitEditorStore, EditorStoreContext } from "@/features/exhibits/hooks/useExhibitEditorStore";
import { ExhibitPreview3D } from "@/features/exhibits/components/ExhibitEditorModal/ExhibitPreview3D";

type Props = {
  exhibit: any | null;
  onClose: () => void;
  onEdit: (exhibit: any) => void;
};

export function ExhibitPreviewModal({ exhibit, onClose, onEdit }: Props) {
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
      <div className="fixed inset-0 z-[100] flex flex-col bg-[#050506]/90 backdrop-blur-xl text-white font-sans p-4 sm:p-8 animate-in fade-in zoom-in-95 duration-300">
        
        <div className="flex items-center justify-between mb-6 px-2">
          <div>
            <h2 className="text-xl font-serif tracking-wide text-white/90">
              {exhibit.title || "Untitled"}
            </h2>
            <p className="text-[10px] font-light tracking-widest text-white/50 uppercase mt-1">3D Preview</p>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 rounded-full text-white/50 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X size={24} strokeWidth={1.5} />
          </button>
        </div>

        <div className="flex-1 bg-black/40 rounded-3xl border border-white/10 overflow-hidden relative shadow-2xl">
          <ExhibitPreview3D />
        </div>

        <div className="mt-8 mb-4 flex justify-center pb-safe">
          <button 
            onClick={() => onEdit(exhibit)}
            className="flex items-center gap-2 px-8 py-3.5 bg-white/10 border border-white/20 text-white text-xs font-light tracking-widest uppercase rounded-full hover:bg-white hover:text-black active:scale-95 transition-all"
          >
            <Edit2 size={14} strokeWidth={1.5} />
            Edit Artwork
          </button>
        </div>

      </div>
    </EditorStoreContext.Provider>
  );
}