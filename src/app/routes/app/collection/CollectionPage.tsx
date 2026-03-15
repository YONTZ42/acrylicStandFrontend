import { useState, useEffect } from "react";
import { useGalleriesList, useGalleryDetail } from "@/features/galleries/hooks";
import { ExhibitEditorModal } from "@/features/exhibits/components";
import { cn } from "@/shared/utils/cn";
import { LayoutList, Grid2X2, RectangleHorizontal, Package, Check, Truck } from "lucide-react";

export function CollectionPage() {
  const galleriesQuery = useGalleriesList();
  
  // 状態管理
  const [selectedGalleryId, setSelectedGalleryId] = useState<string | null>(null);
  const[editorOpen, setEditorOpen] = useState(false);
  const [selectedSlotIndex, setSelectedSlotIndex] = useState<number | null>(null);

  // レイアウトモード: "list" (縦1列) | "grid" (縦2列) | "row" (横1列)
  const[layoutMode, setLayoutMode] = useState<"list" | "grid" | "row">("grid");

  // 家に配達モード（複数選択）の状態
  const [isDeliveryMode, setIsDeliveryMode] = useState(false);
  const [selectedExhibitIndices, setSelectedExhibitIndices] = useState<number[]>([]);
  
  // 配達プロトタイプモーダルの状態
  const [deliveryModalOpen, setDeliveryModalOpen] = useState(false);
  const [deliveryModalCount, setDeliveryModalCount] = useState(0);

  // ギャラリー一覧が取得できたら、最初のギャラリーをデフォルト選択
  useEffect(() => {
    if (!selectedGalleryId && galleriesQuery.data && galleriesQuery.data.length > 0) {
      setSelectedGalleryId(galleriesQuery.data[0].id);
    }
  },[galleriesQuery.data, selectedGalleryId]);

  const detailQuery = useGalleryDetail(selectedGalleryId);
  const slots = (detailQuery.normalizedExhibits ??[]) as Array<any | null>;
  const currentExhibit = selectedSlotIndex == null ? null : slots[selectedSlotIndex] ?? null;

  // 選択モードのトグル処理
  const toggleSelection = (idx: number) => {
    setSelectedExhibitIndices(prev => 
      prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx]
    );
  };

  const handleConfirmDelivery = () => {
    if (selectedExhibitIndices.length === 0) return;
    setDeliveryModalCount(selectedExhibitIndices.length);
    setIsDeliveryMode(false);
    setSelectedExhibitIndices([]);
    setDeliveryModalOpen(true);
  };

  return (
    <div className="p-4 sm:p-8 max-w-6xl mx-auto h-full flex flex-col bg-brand-bg min-h-full">
      {/* ページヘッダー＆操作エリア */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 bg-brand-surface p-6 rounded-3xl border border-brand-border shadow-sm mb-6 z-10">
        <div>
          <h1 className="text-2xl font-extrabold text-brand-text tracking-tight">Collection</h1>
          <p className="mt-1 text-sm font-medium text-brand-text-muted">
            Manage exhibits across your galleries.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full sm:w-auto">
          {/* Target Gallery 選択 */}
          <div className="w-full sm:w-48">
            <label className="block text-xs font-bold text-brand-text-muted mb-1.5 uppercase tracking-wide">
              Target Gallery
            </label>
            <select 
              value={selectedGalleryId || ""}
              onChange={(e) => {
                setSelectedGalleryId(e.target.value);
                setIsDeliveryMode(false); // ギャラリー切り替え時は選択モード解除
                setSelectedExhibitIndices([]);
              }}
              disabled={galleriesQuery.isLoading || isDeliveryMode}
              className="w-full bg-brand-bg-soft border border-brand-border-strong rounded-2xl p-2.5 text-sm font-bold text-brand-text focus:outline-none focus:border-brand-primary focus:bg-white transition-colors cursor-pointer appearance-none disabled:opacity-50"
            >
              {galleriesQuery.isLoading && <option value="">Loading...</option>}
              {!galleriesQuery.isLoading && galleriesQuery.data?.length === 0 && (
                <option value="">No galleries found</option>
              )}
              {(galleriesQuery.data ??[]).map((g: { id: string; title: string }) => (
                <option key={g.id} value={g.id}>{g.title || "Untitled"}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-3 self-start sm:self-end sm:mt-5 w-full sm:w-auto">
            {/* 家に配達 CTA ボタン */}
            {!isDeliveryMode && (
              <button
                onClick={() => { setIsDeliveryMode(true); setSelectedExhibitIndices([]); }}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-brand-secondary to-[#ff9a9e] px-5 py-2.5 text-sm font-extrabold text-white shadow-md shadow-brand-secondary/30 hover:shadow-brand-secondary/50 active:scale-95 transition-all"
              >
                <Package size={18} strokeWidth={2.5} />
                家に配達
              </button>
            )}

            {/* レイアウト切り替えトグル */}
            <div className="flex items-center gap-1 bg-brand-bg-soft p-1.5 rounded-2xl border border-brand-border-strong transition-opacity">
              <button
                onClick={() => setLayoutMode("list")}
                className={cn(
                  "p-2 rounded-xl transition-all duration-200",
                  layoutMode === "list" ? "bg-white text-brand-primary shadow-sm" : "text-brand-text-muted hover:text-brand-text"
                )}
              >
                <LayoutList size={20} strokeWidth={2.5} />
              </button>
              <button
                onClick={() => setLayoutMode("grid")}
                className={cn(
                  "p-2 rounded-xl transition-all duration-200",
                  layoutMode === "grid" ? "bg-white text-brand-primary shadow-sm" : "text-brand-text-muted hover:text-brand-text"
                )}
              >
                <Grid2X2 size={20} strokeWidth={2.5} />
              </button>
              <button
                onClick={() => setLayoutMode("row")}
                className={cn(
                  "p-2 rounded-xl transition-all duration-200",
                  layoutMode === "row" ? "bg-white text-brand-primary shadow-sm" : "text-brand-text-muted hover:text-brand-text"
                )}
              >
                <RectangleHorizontal size={20} strokeWidth={2.5} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* コレクショングリッド */}
      <div className="flex-1 bg-brand-surface rounded-3xl border border-brand-border shadow-sm p-4 sm:p-8 overflow-hidden flex flex-col relative z-0">
        {!selectedGalleryId ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center opacity-60">
            <div className="w-16 h-16 border-4 border-dashed border-brand-border-strong rounded-full mb-4"></div>
            <p className="font-bold text-brand-text">Please create a gallery first.</p>
          </div>
        ) : detailQuery.isLoading ? (
          <div className="flex-1 flex items-center justify-center font-bold text-brand-text-muted">
            Loading collection...
          </div>
        ) : (
          <div 
            className={cn(
              "flex-1 w-full custom-scrollbar",
              // 下部フローティングバー用の余白を大きく取る
              "pb-24",
              layoutMode === "row" 
                ? "flex flex-row gap-5 sm:gap-6 overflow-x-auto px-2 snap-x items-center" 
                : layoutMode === "list"
                ? "grid grid-cols-1 gap-6 overflow-y-auto pr-2 max-w-sm mx-auto w-full"
                : "grid grid-cols-2 gap-4 sm:gap-6 overflow-y-auto pr-2"
            )}
          >
            {slots.map((exhibit, idx) => {
              const isSelected = selectedExhibitIndices.includes(idx);

              return (
                <div 
                  key={idx}
                  onClick={() => { 
                    if (isDeliveryMode) {
                      if (exhibit) toggleSelection(idx);
                    } else {
                      setSelectedSlotIndex(idx); setEditorOpen(true); 
                    }
                  }}
                  className={cn(
                    "flex flex-col items-center justify-center relative overflow-hidden transition-all duration-300",
                    // 横・縦のサイズ制御
                    layoutMode === "row" 
                      ? "w-[75vw] sm:w-[280px] flex-shrink-0 aspect-square snap-center" 
                      : "w-full aspect-square",
                    // モード別のアピアランス
                    isDeliveryMode
                      ? exhibit
                        ? isSelected
                          ? "rounded-[2.5rem] border-2 border-brand-primary ring-4 ring-brand-primary/20 bg-brand-primary-soft scale-95 shadow-md"
                          : "rounded-[2rem] border border-brand-border bg-brand-surface hover:bg-brand-bg-soft cursor-pointer shadow-sm scale-100"
                        : "rounded-[2rem] border border-brand-border bg-brand-bg opacity-40 cursor-not-allowed grayscale"
                      : "rounded-[2rem] border border-brand-border bg-brand-bg cursor-pointer hover:border-brand-primary hover:bg-brand-primary-soft shadow-sm group"
                  )}
                >
                  {/* スロット番号バッジ */}
                  <div className="absolute top-4 left-4 text-[11px] font-extrabold text-brand-primary bg-white px-3 py-1.5 rounded-full shadow-sm border border-brand-border-strong z-10">
                    Slot {idx + 1}
                  </div>

                  {/* 選択モードのチェックアイコン */}
                  {isDeliveryMode && exhibit && (
                    <div className={cn(
                      "absolute top-4 right-4 w-7 h-7 rounded-full border-2 flex items-center justify-center z-20 transition-all duration-300 shadow-sm",
                      isSelected 
                        ? "bg-brand-primary border-brand-primary text-white scale-110" 
                        : "bg-white border-brand-border text-transparent scale-100"
                    )}>
                      <Check size={16} strokeWidth={3.5} />
                    </div>
                  )}

                  {exhibit ? (
                    <>
                      <img src={exhibit.imageForegroundUrl} alt="" className="w-2/3 h-2/3 object-contain mb-3 drop-shadow-md transition-transform duration-300 group-hover:scale-105" />
                      <span className="text-sm font-bold text-brand-text truncate w-full text-center px-4 z-10 absolute bottom-0 pb-4">
                        {exhibit.title || "Untitled"}
                      </span>
                    </>
                  ) : (
                    <span className="text-sm text-brand-text-soft font-bold tracking-wide">Empty</span>
                  )}
                  
                  {/* 通常モード時の Edit/Create オーバーレイ */}
                  {!isDeliveryMode && (
                    <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all duration-200 z-20">
                      <span className="text-sm font-bold text-white bg-brand-primary px-8 py-3 rounded-full shadow-md scale-95 group-hover:scale-100 transition-transform">
                        {exhibit ? "Edit ✨" : "Create 💖"}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* -----------------------------------------------------------------
          アクションバー (Delivery Mode 選択中)
      ----------------------------------------------------------------- */}
      {isDeliveryMode && (
        <div className="fixed bottom-[88px] left-1/2 -translate-x-1/2 z-40 flex items-center justify-between w-[90%] max-w-md bg-brand-surface/90 backdrop-blur-xl px-6 py-4 rounded-[2rem] shadow-[0_10px_40px_rgba(0,0,0,0.12)] border border-brand-border-strong animate-in slide-in-from-bottom-5">
          <div className="flex flex-col">
            <span className="text-[10px] font-extrabold text-brand-text-muted uppercase tracking-wider mb-0.5">Selected</span>
            <span className="text-xl font-black text-brand-primary leading-none">
              {selectedExhibitIndices.length} <span className="text-xs font-bold text-brand-text-muted">items</span>
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => { setIsDeliveryMode(false); setSelectedExhibitIndices([]); }}
              className="px-5 py-2.5 rounded-full bg-brand-bg-soft text-brand-text-muted font-bold text-sm hover:bg-brand-border hover:text-brand-text active:scale-95 transition-all"
            >
              Cancel
            </button>
            <button 
              onClick={handleConfirmDelivery}
              disabled={selectedExhibitIndices.length === 0}
              className="px-8 py-2.5 rounded-full bg-brand-primary text-white font-extrabold text-sm shadow-md shadow-brand-primary/30 disabled:opacity-50 disabled:grayscale disabled:shadow-none hover:bg-brand-primary-hover hover:-translate-y-0.5 active:scale-95 transition-all"
            >
              確定する
            </button>
          </div>
        </div>
      )}

      {/* Editor Modal (通常モード用) */}
      {selectedGalleryId && !isDeliveryMode && (
        <ExhibitEditorModal
          key={`${selectedGalleryId}:${selectedSlotIndex ?? "none"}:${editorOpen ? "open" : "closed"}`}
          open={editorOpen}
          onClose={() => setEditorOpen(false)}
          galleryId={selectedGalleryId}
          slotIndex={selectedSlotIndex ?? 0}
          current={currentExhibit}
        />
      )}

      {/* Delivery Prototoype Modal */}
      <DeliveryComingSoonModal 
        open={deliveryModalOpen} 
        onClose={() => setDeliveryModalOpen(false)} 
        count={deliveryModalCount} 
      />
    </div>
  );
}

// -----------------------------------------------------------------
// Sub Component: Delivery Coming Soon Modal
// -----------------------------------------------------------------
function DeliveryComingSoonModal({ open, onClose, count }: { open: boolean, count: number, onClose: () => void }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* 背景オーバーレイ */}
      <div 
        className="absolute inset-0 bg-brand-text/30 backdrop-blur-sm animate-in fade-in" 
        onClick={onClose} 
      />
      
      {/* モーダル本体 */}
      <div className="relative w-full max-w-sm rounded-[2.5rem] bg-brand-surface p-8 shadow-2xl text-center border border-brand-border animate-in zoom-in-95">
        <div className="w-24 h-24 mx-auto bg-brand-primary-soft rounded-full flex items-center justify-center mb-6 shadow-inner border-4 border-white relative">
          <Truck size={44} className="text-brand-primary" strokeWidth={2} />
          {/* 装飾のキラキラ */}
          <div className="absolute top-1 right-1 w-4 h-4 bg-brand-secondary rounded-full border-2 border-white animate-bounce" />
        </div>
        
        <h2 className="text-2xl font-extrabold text-brand-text tracking-tight mb-3">
          Coming Soon! 🚚
        </h2>
        
        <div className="bg-brand-bg-soft rounded-2xl p-5 mb-6 border border-brand-border">
          <p className="text-sm font-bold text-brand-text-muted leading-relaxed">
            絶賛開発中！🛠️<br/>
            あなたが選んだ <span className="text-brand-primary font-black text-lg">{count}</span> 個のアクスタを、<br/>
            現実世界でお家に直接お届けする機能を<br/>
            現在準備しています。お楽しみに！✨
          </p>
        </div>

        <button 
          onClick={onClose}
          className="w-full rounded-full bg-brand-primary px-6 py-3.5 text-sm font-extrabold text-white shadow-lg shadow-brand-primary/20 hover:shadow-brand-primary/40 hover:-translate-y-0.5 active:scale-95 transition-all"
        >
          ワクワクして待つ！
        </button>
      </div>
    </div>
  );
}