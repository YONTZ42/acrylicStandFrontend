// src/app/routes/app/room/components/RoomDrawer.tsx
import { motion, AnimatePresence } from "framer-motion";
import { X, ImagePlus } from "lucide-react";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  altarExhibits: any[];
  // ★ 引数に slotIndex を追加
  onNavigateToStudio: (slotIndex?: number) => void;
  onPreview: (ex: any) => void;
};

export function RoomDrawer({
  isOpen, onClose, altarExhibits, onNavigateToStudio, onPreview
}: Props) {
  const activeAltarCount = altarExhibits.filter(e => e).length;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 z-30 bg-black/40 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ y: "100%" }} animate={{ y: "0%" }} exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 220 }}
            className="absolute bottom-0 left-0 right-0 z-40 h-[75vh] bg-brand-bg border-t border-brand-border rounded-t-3xl flex flex-col shadow-elegant"
          >
            {/* ヘッダー */}
            <div className="flex justify-between items-center px-6 py-5 border-b border-brand-border/60 bg-white/50 rounded-t-3xl backdrop-blur-md shrink-0">
              <div>
                <h2 className="text-xl font-serif text-brand-text tracking-wide">Exhibition</h2>
                <p className="text-[11px] font-light tracking-wider text-brand-text-muted mt-1 uppercase">
                  {activeAltarCount} / 12 Slots filled
                </p>
              </div>
              <button 
                onClick={onClose} 
                className="p-2 rounded-full text-brand-text-muted hover:text-brand-text hover:bg-brand-bg-soft transition-colors"
              >
                <X size={24} strokeWidth={1.5} />
              </button>
            </div>

            {/* スクロールエリア (12マスのグリッド) */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pb-safe">
                {Array.from({ length: 12 }).map((_, idx) => {
                  const ex = altarExhibits[idx];

                  // すでに展示されている場合
                  if (ex) {
                    return (
                      <div 
                        key={`altar-${ex.id || idx}`} 
                        onClick={() => {
                          onClose();
                          onPreview(ex);
                        }}
                        className="group relative aspect-square bg-white border border-brand-border rounded-2xl flex items-center justify-center hover:border-brand-primary/50 hover:shadow-lg transition-all overflow-hidden cursor-pointer"
                      >
                        <img 
                          src={ex.imageForegroundUrl} 
                          alt={ex.title || ""} 
                          className="w-2/3 h-2/3 object-contain drop-shadow-md transition-transform duration-500 group-hover:scale-105" 
                        />
                        <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                          <p className="text-white text-[10px] font-bold truncate text-center drop-shadow-sm">
                            {ex.title || "Untitled"}
                          </p>
                        </div>
                      </div>
                    );
                  } 
                  
                  // 空きスロット（新規作成への導線）
                  return (
                    <div 
                      key={`empty-${idx}`} 
                      onClick={() => {
                        onClose();
                        // ★ 空きスロットの index を渡す
                        onNavigateToStudio(idx);
                      }}
                      className="aspect-square border border-dashed border-brand-border-strong text-brand-text-soft rounded-2xl flex flex-col items-center justify-center hover:bg-white hover:text-brand-primary hover:border-brand-primary transition-all cursor-pointer shadow-sm group"
                    >
                        <div className="w-10 h-10 rounded-full bg-brand-bg-soft flex items-center justify-center mb-2 group-hover:bg-brand-primary-soft transition-colors">
                          <ImagePlus size={20} strokeWidth={1.5} className="text-brand-text-muted group-hover:text-brand-primary transition-colors" />
                        </div>
                        <span className="text-[9px] tracking-widest uppercase font-light text-brand-text-muted group-hover:text-brand-primary transition-colors">
                          Add Artwork
                        </span>
                    </div>
                  );
                })}
              </div>
            </div>

          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}