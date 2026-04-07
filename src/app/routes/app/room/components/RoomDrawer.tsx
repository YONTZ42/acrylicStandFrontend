import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowUp, ArrowDown, Trash2, Loader2, ImagePlus } from "lucide-react";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  altarExhibits: any[];
  collectionExhibits: any[];
  isMoving: boolean;
  onMoveToAltar: (ex: any) => void;
  onMoveToCollection: (ex: any) => void;
  onDelete: (ex: any) => void;
  onNavigateToStudio: () => void;
  onPreview: (ex: any) => void;
};

export function RoomDrawer({
  isOpen, onClose, altarExhibits, collectionExhibits, isMoving,
  onMoveToAltar, onMoveToCollection, onDelete, onNavigateToStudio, onPreview
}: Props) {
  const activeAltarCount = altarExhibits.filter(e => e).length;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => !isMoving && onClose()}
            className="absolute inset-0 z-30 bg-black/40 backdrop-blur-sm"
          />
          
          {/* 高さ固定(85vh)で内部スクロールさせる構造 */}
          <motion.div
            initial={{ y: "100%" }} animate={{ y: "0%" }} exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 220 }}
            className="absolute bottom-0 left-0 right-0 z-40 h-[85vh] bg-brand-bg border-t border-brand-border rounded-t-3xl flex flex-col shadow-elegant"
          >
            {/* ヘッダー (固定) */}
            <div className="flex justify-between items-center px-6 py-5 border-b border-brand-border/60 bg-white/50 rounded-t-3xl backdrop-blur-md">
              <div>
                <h2 className="text-xl font-serif text-brand-text tracking-wide">Collection</h2>
                <p className="text-[11px] font-light tracking-wider text-brand-text-muted mt-1 uppercase">タップで詳細を確認</p>
              </div>
              <button 
                onClick={onClose} 
                disabled={isMoving}
                className="p-2 rounded-full text-brand-text-muted hover:text-brand-text hover:bg-brand-bg-soft transition-colors disabled:opacity-50"
              >
                <X size={24} strokeWidth={1.5} />
              </button>
            </div>

            {/* スクロールエリア */}
            <div className="flex-1 overflow-y-auto custom-scrollbar relative">
              {isMoving && (
                <div className="absolute inset-0 z-50 bg-brand-bg/60 backdrop-blur-sm flex flex-col items-center justify-center text-brand-primary">
                  <Loader2 className="animate-spin mb-3" size={28} strokeWidth={1.5} />
                  <span className="font-light tracking-widest text-xs uppercase">Updating...</span>
                </div>
              )}

              <div className="px-6 py-8 space-y-12">
                
                {/* --- 展示セクション --- */}
                <section>
                  <div className="flex justify-between items-end mb-4 border-b border-brand-border pb-2">
                    <h3 className="text-sm font-serif text-brand-secondary tracking-wide">Exhibition</h3>
                    <span className="text-[10px] text-brand-text-soft tracking-widest uppercase">{activeAltarCount} / 12 Slots</span>
                  </div>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {altarExhibits.map((ex, idx) => {
                      if (!ex) return null;
                      return (
                        <div 
                          key={`altar-${ex.id || idx}`} 
                          onClick={() => onPreview(ex)}
                          className="group relative aspect-square bg-white border border-brand-border rounded-2xl flex items-center justify-center hover:border-brand-primary/50 hover:shadow-lg transition-all overflow-hidden cursor-pointer"
                        >
                          <img src={ex.imageForegroundUrl} alt="" className="w-2/3 h-2/3 object-contain drop-shadow-md transition-transform duration-500 group-hover:scale-105" />
                          <div className="absolute inset-0 bg-brand-text/50 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-opacity backdrop-blur-[2px]">
                            <button 
                              onClick={(e) => { e.stopPropagation(); onMoveToCollection(ex); }}
                              className="bg-white/90 text-brand-text text-[11px] tracking-wider px-5 py-2 rounded-full shadow-sm flex items-center gap-1.5 hover:bg-white transition-colors"
                            >
                              <ArrowDown size={14} strokeWidth={1.5} /> 保管する
                            </button>
                          </div>
                        </div>
                      );
                    })}
                    {activeAltarCount === 0 && (
                      <div className="col-span-2 sm:col-span-3 text-center py-10 text-xs text-brand-text-soft tracking-wider">
                        展示中の作品はありません。
                      </div>
                    )}
                  </div>
                </section>

                {/* --- 保管庫セクション --- */}
                <section>
                  <div className="flex justify-between items-end mb-4 border-b border-brand-border pb-2">
                    <h3 className="text-sm font-serif text-brand-secondary tracking-wide">Storage</h3>
                    <span className="text-[10px] text-brand-text-soft tracking-widest uppercase">{collectionExhibits.length} Items</span>
                  </div>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    
                    <div 
                      onClick={onNavigateToStudio}
                      className="aspect-square border border-dashed border-brand-border-strong text-brand-text-soft rounded-2xl flex flex-col items-center justify-center hover:bg-white hover:text-brand-primary hover:border-brand-primary transition-all cursor-pointer shadow-sm"
                    >
                       <ImagePlus size={24} strokeWidth={1} className="mb-2" />
                       <span className="text-[10px] tracking-widest uppercase font-light">新規作成</span>
                    </div>

                    {collectionExhibits.map((ex, idx) => (
                      <div 
                        key={`col-${ex.id || idx}`} 
                        onClick={() => onPreview(ex)}
                        className="group relative aspect-square bg-white border border-brand-border rounded-2xl flex items-center justify-center hover:border-brand-primary/50 hover:shadow-lg transition-all overflow-hidden cursor-pointer"
                      >
                        <img src={ex.imageForegroundUrl} alt="" className="w-2/3 h-2/3 object-contain drop-shadow-md transition-transform duration-500 group-hover:scale-105" />
                        <div className="absolute inset-0 bg-brand-text/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center gap-3 transition-opacity backdrop-blur-[2px]">
                          <button 
                            onClick={(e) => { e.stopPropagation(); onMoveToAltar(ex); }}
                            className="bg-brand-primary text-white text-[11px] tracking-wider px-5 py-2 rounded-full shadow-md flex items-center gap-1.5 hover:bg-brand-primary-hover active:scale-95 transition-all"
                          >
                            <ArrowUp size={14} strokeWidth={1.5} /> 展示する
                          </button>
                          <button 
                            onClick={(e) => { e.stopPropagation(); onDelete(ex); }}
                            className="bg-brand-surface text-brand-text text-[11px] tracking-wider px-5 py-2 rounded-full shadow-md flex items-center gap-1.5 hover:bg-brand-bg-soft active:scale-95 transition-all"
                          >
                            <Trash2 size={14} strokeWidth={1.5} className="text-red-400" /> 削除
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
                
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}