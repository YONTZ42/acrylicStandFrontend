import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ShoppingBag, Plus, Minus, Check, Trash2 } from "lucide-react";
import { cn } from "@/shared/utils/cn";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  exhibits: any[];
  onProceedToCheckout: (cartItems: CartItem[], totalAmount: number) => void;
};

const SIZES =[
  { id: "S", name: "S (約5cm)", price: 800 },
  { id: "M", name: "M (約10cm)", price: 1500 },
  { id: "L", name: "L (約15cm)", price: 2200 },
];

export type CartItem = {
  exhibit: any;
  size: typeof SIZES[0];
  quantity: number;
};

export function ShopDrawer({ isOpen, onClose, exhibits, onProceedToCheckout }: Props) {
  const[cartItems, setCartItems] = useState<CartItem[]>([]);

  // ドロワーを開くたびにカートを空にする
  useEffect(() => {
    if (isOpen) {
      setCartItems([]);
    }
  }, [isOpen]);

  // 合計金額の計算
  const totalAmount = cartItems.reduce((acc, item) => acc + (item.size.price * item.quantity), 0);

  // アクスタの一意のキーを取得するヘルパー関数
  // バックエンド・フロントの型の揺らぎを吸収するため id を最優先で使用
  const getExKey = (ex: any) => ex.id ?? ex.slotIndex ?? ex.slot_index;

  // アクスタの選択・解除をトグル
  const toggleExhibit = (ex: any) => {
    const key = getExKey(ex);
    // カート内に既に同じキーのアイテムがあるか確認
    const isSelected = cartItems.some(item => getExKey(item.exhibit) === key);
    
    if (isSelected) {
      // 選択済みならカートから削除（チェック解除）
      setCartItems(cartItems.filter(item => getExKey(item.exhibit) !== key));
    } else {
      // 未選択ならカートに追加（デフォルトでMサイズ、1個）
      setCartItems([...cartItems, { exhibit: ex, size: SIZES[1], quantity: 1 }]);
    }
  };

  // カート内アイテムの更新（サイズ・個数）
  const updateCartItem = (key: string | number, updates: Partial<CartItem>) => {
    setCartItems(cartItems.map(item => 
      getExKey(item.exhibit) === key ? { ...item, ...updates } : item
    ));
  };

  // カートから直接削除
  const removeCartItem = (key: string | number) => {
    setCartItems(cartItems.filter(item => getExKey(item.exhibit) !== key));
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 z-30 bg-brand-text/60 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ y: "100%" }} animate={{ y: "0%" }} exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="absolute bottom-0 left-0 right-0 z-40 h-[85vh] bg-brand-surface/95 backdrop-blur-3xl border-t border-brand-border rounded-t-[2.5rem] flex flex-col shadow-[0_-10px_40px_rgba(0,0,0,0.2)]"
          >
            {/* ヘッダー */}
            <div className="flex justify-between items-center p-6 pb-4 border-b border-brand-border/50">
              <div>
                <h2 className="text-xl font-extrabold text-brand-text tracking-tight flex items-center gap-2">
                  <ShoppingBag className="text-brand-secondary" /> グッズを購入 🛒
                </h2>
                <p className="text-xs font-bold text-brand-text-soft mt-1">シミュレーションしたアクスタを実物でお届け！</p>
              </div>
              <button onClick={onClose} className="bg-brand-bg-soft p-2 rounded-full text-brand-text-muted hover:text-brand-text transition-colors">
                <X size={20} strokeWidth={2.5} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-8 relative">
              
              {/* ステップ1: アクスタを選ぶ (複数選択可) */}
              <section>
                <h3 className="text-sm font-extrabold text-brand-text-muted mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-brand-bg-soft flex items-center justify-center text-xs text-brand-text">1</span> 
                    アクスタを選ぶ（複数OK）
                  </div>
                </h3>
                {exhibits.length === 0 ? (
                  <div className="text-center text-xs font-bold text-brand-text-soft py-6 bg-brand-bg-soft rounded-2xl border border-dashed border-brand-border-strong">
                    まだアクスタがありません。新しく作ってみましょう！
                  </div>
                ) : (
                  <div className="flex gap-3 overflow-x-auto custom-scrollbar pb-4 snap-x">
                    {exhibits.map((ex, idx) => {
                      const exKey = getExKey(ex);
                      const isSelected = cartItems.some(item => getExKey(item.exhibit) === exKey);
                      
                      return (
                        <div 
                          key={exKey || idx}
                          onClick={() => toggleExhibit(ex)}
                          className={cn(
                            "flex-shrink-0 w-24 sm:w-28 aspect-square rounded-[1.5rem] border-2 cursor-pointer transition-all snap-center relative flex items-center justify-center group overflow-hidden",
                            isSelected 
                              ? "border-brand-secondary bg-brand-secondary/10 shadow-sm scale-100" 
                              : "border-brand-border bg-brand-bg hover:border-brand-secondary/40 hover:bg-brand-secondary/5 scale-95"
                          )}
                        >
                          <img src={ex.imageForegroundUrl} alt="" className="w-2/3 h-2/3 object-contain drop-shadow-md transition-transform group-hover:scale-105" />
                          
                          {/* 選択済みバッジ */}
                          {isSelected && (
                            <div className="absolute -top-1 -right-1 bg-brand-secondary text-white rounded-full p-1.5 shadow-sm animate-in zoom-in">
                              <Check size={14} strokeWidth={3} />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>

              {/* ステップ2: サイズと個数の調整 (カートの中身) */}
              <section className={cn("transition-opacity duration-300", cartItems.length === 0 && "opacity-30 pointer-events-none")}>
                <h3 className="text-sm font-extrabold text-brand-text-muted mb-3 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-brand-bg-soft flex items-center justify-center text-xs text-brand-text">2</span> 
                  カートの中身を調整
                </h3>
                
                <div className="space-y-4">
                  {cartItems.map((item) => {
                    const itemKey = getExKey(item.exhibit);
                    
                    return (
                      <div key={`cart-${itemKey}`} className="flex gap-4 p-4 border border-brand-border-strong rounded-[1.5rem] bg-white shadow-sm relative animate-in slide-in-from-right-4">
                        
                        {/* 削除ボタン */}
                        <button 
                          onClick={() => removeCartItem(itemKey)}
                          className="absolute top-3 right-3 text-brand-text-soft hover:text-brand-secondary transition-colors bg-brand-bg-soft hover:bg-brand-secondary/10 rounded-full p-1.5"
                        >
                          <Trash2 size={14} />
                        </button>

                        {/* サムネイル */}
                        <div className="w-20 h-20 bg-brand-bg rounded-[1rem] flex items-center justify-center p-2 flex-shrink-0 border border-brand-border">
                          <img src={item.exhibit.imageForegroundUrl} className="object-contain w-full h-full drop-shadow-sm" />
                        </div>

                        {/* 詳細設定 */}
                        <div className="flex-1 flex flex-col justify-between pr-6">
                          <span className="font-extrabold text-sm text-brand-text truncate pr-2">
                            {item.exhibit.title || "Untitled"}
                          </span>
                          
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-2">
                            {/* サイズ選択 */}
                            <div className="relative w-full sm:w-auto">
                              <select 
                                value={item.size.id} 
                                onChange={e => {
                                  const newSize = SIZES.find(s => s.id === e.target.value) || SIZES[1];
                                  updateCartItem(itemKey, { size: newSize });
                                }} 
                                className="appearance-none bg-brand-bg-soft border border-brand-border-strong rounded-xl text-xs font-bold py-2 pl-3 pr-8 w-full outline-none focus:border-brand-primary text-brand-text cursor-pointer"
                              >
                                {SIZES.map(s => (
                                  <option key={s.id} value={s.id}>{s.name} - ¥{s.price}</option>
                                ))}
                              </select>
                              {/* カスタム矢印 */}
                              <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-brand-text-muted">
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                              </div>
                            </div>

                            {/* 個数調整 */}
                            <div className="flex items-center justify-between sm:justify-start gap-4">
                              <div className="flex items-center bg-brand-bg border border-brand-border-strong rounded-full p-1 shadow-sm">
                                <button 
                                  onClick={() => updateCartItem(itemKey, { quantity: Math.max(1, item.quantity - 1) })}
                                  className="w-7 h-7 flex items-center justify-center text-brand-text-muted hover:bg-white rounded-full transition-colors"
                                >
                                  <Minus size={14} strokeWidth={3} />
                                </button>
                                <span className="text-xs font-black w-6 text-center text-brand-text">{item.quantity}</span>
                                <button 
                                  onClick={() => updateCartItem(itemKey, { quantity: item.quantity + 1 })}
                                  className="w-7 h-7 flex items-center justify-center text-brand-text-muted hover:bg-white rounded-full transition-colors"
                                >
                                  <Plus size={14} strokeWidth={3} />
                                </button>
                              </div>
                              
                              {/* 小計 */}
                              <div className="text-right text-brand-primary font-black text-sm whitespace-nowrap">
                                ¥{(item.size.price * item.quantity).toLocaleString()}
                              </div>
                            </div>
                          </div>

                        </div>
                      </div>
                    );
                  })}
                  
                  {cartItems.length === 0 && (
                    <div className="text-xs font-bold text-brand-text-muted bg-brand-bg-soft p-4 rounded-xl border border-brand-border text-center">
                      上のリストからアクスタをタップして追加してください。
                    </div>
                  )}
                </div>
              </section>

            </div>

            {/* フッター（お会計エリア） */}
            <div className="p-6 border-t border-brand-border bg-brand-surface pb-safe">
              <div className="flex items-center justify-between mb-4 px-2">
                <span className="font-extrabold text-brand-text-muted flex items-center gap-2">
                  合計 <span className="bg-brand-bg-soft text-[10px] px-2 py-0.5 rounded-full">{cartItems.length} アイテム</span>
                </span>
                <span className="text-2xl font-black text-brand-secondary flex items-baseline gap-1">
                  <span className="text-sm">¥</span>{totalAmount.toLocaleString()}
                </span>
              </div>
              <button 
                disabled={cartItems.length === 0}
                onClick={() => onProceedToCheckout(cartItems, totalAmount)}
                className="w-full rounded-full bg-gradient-to-r from-brand-secondary to-[#ff9a9e] py-4 text-sm font-extrabold text-white shadow-md shadow-brand-secondary/30 active:scale-95 transition-all disabled:opacity-50 disabled:grayscale flex items-center justify-center gap-2"
              >
                <ShoppingBag size={18} />
                レジに進む
              </button>
            </div>

          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}