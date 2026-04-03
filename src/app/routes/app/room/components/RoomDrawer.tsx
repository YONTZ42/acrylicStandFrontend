import { motion, AnimatePresence } from "framer-motion";
import { X, Box, ArrowUp, ArrowDown, Trash2, Loader2 } from "lucide-react";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  altarExhibits: any[];
  toyboxExhibits: any[];
  isMoving: boolean;
  onMoveToAltar: (ex: any) => void;
  onMoveToToybox: (ex: any) => void;
  onDelete: (ex: any) => void;
  onNavigateToStudio: () => void;
  onPreview: (ex: any) => void; // ★追加
};

export function RoomDrawer({
  isOpen, onClose, altarExhibits, toyboxExhibits, isMoving,
  onMoveToAltar, onMoveToToybox, onDelete, onNavigateToStudio, onPreview
}: Props) {
  const activeAltarCount = altarExhibits.filter(e => e).length;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => !isMoving && onClose()}
            className="absolute inset-0 z-30 bg-brand-text/60 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ y: "100%" }} animate={{ y: "0%" }} exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="absolute bottom-0 left-0 right-0 z-40 h-[75vh] bg-brand-surface/95 backdrop-blur-3xl border-t border-brand-border rounded-t-[2.5rem] p-6 shadow-[0_-10px_40px_rgba(0,0,0,0.2)] flex flex-col"
          >
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-xl font-extrabold text-brand-text tracking-tight">コレクション 🧸</h2>
                <p className="text-xs font-bold text-brand-text-soft mt-0.5">タップでプレビューを確認できます！</p>
              </div>
              <button 
                onClick={onClose} 
                disabled={isMoving}
                className="bg-brand-bg-soft p-2 rounded-full text-brand-text-muted hover:text-brand-text hover:bg-brand-border transition-colors disabled:opacity-50"
              >
                <X size={20} strokeWidth={2.5} />
              </button>
            </div>

            {isMoving && (
              <div className="absolute inset-0 z-50 bg-brand-surface/50 backdrop-blur-sm rounded-t-[2.5rem] flex flex-col items-center justify-center text-brand-primary">
                <Loader2 className="animate-spin mb-2" size={32} />
                <span className="font-bold text-sm">配置を変更中...</span>
              </div>
            )}

            <div className="flex-1 overflow-y-auto custom-scrollbar -mx-2 px-2 pb-12 space-y-8 relative">
              
              {/* --- 祭壇セクション --- */}
              <section>
                <h3 className="text-sm font-extrabold text-brand-primary mb-3 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-brand-primary animate-pulse" />
                  祭壇のアクスタ ({activeAltarCount}/12)
                </h3>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                  {altarExhibits.map((ex, idx) => {
                    if (!ex) return null;
                    return (
                      <div 
                        key={`altar-${ex.id || idx}`} 
                        onClick={() => onPreview(ex)} // ★プレビューを開く
                        className="group relative aspect-square bg-brand-bg border border-brand-border rounded-[1.5rem] flex items-center justify-center hover:border-brand-primary/50 transition-colors overflow-hidden shadow-sm cursor-pointer"
                      >
                        <img src={ex.imageForegroundUrl} alt="" className="w-2/3 h-2/3 object-contain drop-shadow-md transition-transform group-hover:scale-105" />
                        <div className="absolute inset-0 bg-brand-text/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-opacity backdrop-blur-[2px]">
                          <button 
                            onClick={(e) => { e.stopPropagation(); onMoveToToybox(ex); }} // ★親への伝播を止める
                            className="bg-white/20 hover:bg-white/40 text-white text-[10px] font-bold px-3 py-1.5 rounded-full backdrop-blur-md flex items-center gap-1 shadow-sm transition-colors"
                          >
                            <ArrowDown size={14} /> しまう
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>

              {/* --- おもちゃ箱セクション --- */}
              <section>
                <h3 className="text-sm font-extrabold text-brand-text-muted mb-3 flex items-center gap-2">
                  <Box size={14} /> おもちゃ箱の中身
                </h3>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                  
                  <div 
                    onClick={onNavigateToStudio}
                    className="aspect-square border-2 border-dashed border-brand-mint text-brand-mint rounded-[1.5rem] flex flex-col items-center justify-center hover:bg-brand-mint/10 cursor-pointer transition-colors shadow-sm"
                  >
                     <span className="text-3xl mb-0.5 leading-none font-light">+</span>
                     <span className="text-[10px] font-extrabold">新しく作る</span>
                  </div>

                  {toyboxExhibits.map((ex, idx) => (
                    <div 
                      key={`toy-${ex.id || idx}`} 
                      onClick={() => onPreview(ex)} // ★プレビューを開く
                      className="group relative aspect-square bg-brand-bg border border-brand-border rounded-[1.5rem] flex items-center justify-center hover:border-brand-primary/50 transition-colors overflow-hidden shadow-sm cursor-pointer"
                    >
                      <img src={ex.imageForegroundUrl} alt="" className="w-2/3 h-2/3 object-contain drop-shadow-md transition-transform group-hover:scale-105" />
                      <div className="absolute inset-0 bg-brand-text/70 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center gap-2 transition-opacity backdrop-blur-[2px]">
                        <button 
                          onClick={(e) => { e.stopPropagation(); onMoveToAltar(ex); }} // ★親への伝播を止める
                          className="bg-brand-primary hover:bg-brand-primary-hover text-white text-[10px] font-bold px-4 py-1.5 rounded-full shadow-md flex items-center gap-1 active:scale-95 transition-transform"
                        >
                          <ArrowUp size={14} /> 飾る
                        </button>
                        <button 
                          onClick={(e) => { e.stopPropagation(); onDelete(ex); }} // ★親への伝播を止める
                          className="bg-brand-secondary/80 hover:bg-brand-secondary text-white text-[10px] font-bold px-3 py-1.5 rounded-full shadow-md flex items-center gap-1 active:scale-95 transition-transform"
                        >
                          <Trash2 size={12} /> 捨てる
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}