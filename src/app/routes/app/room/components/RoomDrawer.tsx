// src/app/routes/app/room/components/RoomDrawer.tsx
import { motion, AnimatePresence } from "framer-motion";
import { X, ImagePlus } from "lucide-react";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  exhibits: any[]; // altarExhibits (長さ12の配列)
  onNavigateToStudio: () => void;
  onPreview: (ex: any) => void;
};

export function RoomDrawer({
  isOpen, onClose, exhibits, onNavigateToStudio, onPreview
}: Props) {
  const activeCount = exhibits.filter(e => e).length;

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
            className="absolute bottom-0 left-0 right-0 z-40 h-[85vh] bg-brand-bg border-t border-brand-border rounded-t-3xl flex flex-col shadow-elegant"
          >
            <div className="flex justify-between items-center px-6 py-5 border-b border-brand-border/60 bg-white/50 rounded-t-3xl backdrop-blur-md shrink-0">
              <div>
                <h2 className="text-xl font-serif text-brand-text tracking-wide">Exhibition</h2>
                <p className="text-[11px] font-light tracking-wider text-brand-text-muted mt-1 uppercase">タップで詳細を確認</p>
              </div>
              <button 
                onClick={onClose} 
                className="p-2 rounded-full text-brand-text-muted hover:text-brand-text hover:bg-brand-bg-soft transition-colors"
              >
                <X size={24} strokeWidth={1.5} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar min-h-0">
              <div className="px-6 py-8">
                
                <div className="flex justify-between items-end mb-4 border-b border-brand-border pb-2">
                  <h3 className="text-sm font-serif text-brand-secondary tracking-wide">Slots</h3>
                  <span className="text-[10px] text-brand-text-soft tracking-widest uppercase">{activeCount} / 12 Slots</span>
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  
                  {/* 新規作成ボタンを常に表示 */}
                  {activeCount < 12 && (
                    <div 
                      onClick={onNavigateToStudio}
                      className="aspect-square border border-dashed border-brand-border-strong text-brand-text-soft rounded-2xl flex flex-col items-center justify-center hover:bg-white hover:text-brand-primary hover:border-brand-primary transition-all cursor-pointer shadow-sm"
                    >
                      <ImagePlus size={24} strokeWidth={1} className="mb-2" />
                      <span className="text-[10px] tracking-widest uppercase font-light">新規作成</span>
                    </div>
                  )}

                  {/* 有効なアクスタだけ描画 */}
                  {exhibits.map((ex, idx) => {
                    if (!ex) return null;
                    return (
                      <div 
                        key={`altar-${ex.id || idx}`} 
                        onClick={() => onPreview(ex)}
                        className="group relative aspect-square bg-white border border-brand-border rounded-2xl flex items-center justify-center hover:border-brand-primary/50 hover:shadow-lg transition-all overflow-hidden cursor-pointer"
                      >
                        <img 
                          src={ex.imageForegroundUrl} 
                          alt={ex.title || ""} 
                          className="w-2/3 h-2/3 object-contain drop-shadow-md transition-transform duration-500 group-hover:scale-105" 
                        />
                      </div>
                    );
                  })}
                  
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}