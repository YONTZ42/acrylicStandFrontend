import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ShoppingBag, Plus, Minus, Check, Trash2, ChevronDown } from "lucide-react";
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

  useEffect(() => {
    if (isOpen) setCartItems([]);
  }, [isOpen]);

  const totalAmount = cartItems.reduce((acc, item) => acc + (item.size.price * item.quantity), 0);
  const getExKey = (ex: any) => ex.id ?? ex.slotIndex ?? ex.slot_index;

  const toggleExhibit = (ex: any) => {
    const key = getExKey(ex);
    const isSelected = cartItems.some(item => getExKey(item.exhibit) === key);
    if (isSelected) {
      setCartItems(cartItems.filter(item => getExKey(item.exhibit) !== key));
    } else {
      setCartItems([...cartItems, { exhibit: ex, size: SIZES[1], quantity: 1 }]);
    }
  };

  const updateCartItem = (key: string | number, updates: Partial<CartItem>) => {
    setCartItems(cartItems.map(item => 
      getExKey(item.exhibit) === key ? { ...item, ...updates } : item
    ));
  };

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
            className="absolute inset-0 z-30 bg-black/40 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ y: "100%" }} animate={{ y: "0%" }} exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 220 }}
            className="absolute bottom-0 left-0 right-0 z-40 h-[90vh] sm:h-[85vh] bg-brand-bg border-t border-brand-border rounded-t-3xl flex flex-col shadow-elegant"
          >
            {/* ヘッダー (固定) */}
            <div className="flex justify-between items-center px-6 py-5 border-b border-brand-border/60 bg-white/50 rounded-t-3xl backdrop-blur-md">
              <div>
                <h2 className="text-xl font-serif text-brand-text tracking-wide flex items-center gap-2">
                  Order
                </h2>
                <p className="text-[11px] font-light tracking-wider text-brand-text-muted mt-1 uppercase">実物のアクスタを注文</p>
              </div>
              <button onClick={onClose} className="p-2 rounded-full text-brand-text-muted hover:text-brand-text hover:bg-brand-bg-soft transition-colors">
                <X size={24} strokeWidth={1.5} />
              </button>
            </div>

            {/* スクロールエリア */}
            <div className="flex-1 overflow-y-auto custom-scrollbar px-4 sm:px-6 py-8 space-y-10 relative">
              
              <section>
                <h3 className="text-xs font-light tracking-widest text-brand-text-muted mb-4 uppercase border-b border-brand-border pb-2">
                  1. Select Items
                </h3>
                {exhibits.length === 0 ? (
                  <div className="text-center text-xs font-light tracking-wider text-brand-text-soft py-10 bg-white rounded-2xl border border-brand-border">
                    作品がありません。Studioから作成してください。
                  </div>
                ) : (
                  <div className="flex gap-4 overflow-x-auto custom-scrollbar pb-6 snap-x">
                    {exhibits.map((ex, idx) => {
                      const exKey = getExKey(ex);
                      const isSelected = cartItems.some(item => getExKey(item.exhibit) === exKey);
                      
                      return (
                        <div 
                          key={exKey || idx}
                          onClick={() => toggleExhibit(ex)}
                          className={cn(
                            "flex-shrink-0 w-28 sm:w-32 aspect-square rounded-2xl border transition-all snap-center relative flex items-center justify-center group overflow-hidden cursor-pointer",
                            isSelected 
                              ? "border-brand-primary bg-white shadow-md scale-100" 
                              : "border-brand-border bg-white hover:border-brand-primary/50 scale-95"
                          )}
                        >
                          <img src={ex.imageForegroundUrl} alt="" className="w-2/3 h-2/3 object-contain drop-shadow-md transition-transform duration-500 group-hover:scale-105" />
                          {isSelected && (
                            <div className="absolute top-2 right-2 bg-brand-primary text-white rounded-full p-1 shadow-sm animate-in zoom-in">
                              <Check size={12} strokeWidth={3} />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>

              <section className={cn("transition-opacity duration-300", cartItems.length === 0 && "opacity-30 pointer-events-none")}>
                <h3 className="text-xs font-light tracking-widest text-brand-text-muted mb-4 uppercase border-b border-brand-border pb-2">
                  2. Review Order
                </h3>
                
                <div className="space-y-4">
                  {cartItems.map((item) => {
                    const itemKey = getExKey(item.exhibit);
                    return (
                      <div key={`cart-${itemKey}`} className="flex gap-5 p-4 border border-brand-border rounded-2xl bg-white shadow-sm relative animate-in slide-in-from-right-4">
                        
                        <button 
                          onClick={() => removeCartItem(itemKey)}
                          className="absolute top-3 right-3 text-brand-text-soft hover:text-brand-secondary transition-colors p-1"
                        >
                          <Trash2 size={16} strokeWidth={1.5} />
                        </button>

                        <div className="w-20 h-20 bg-brand-bg rounded-xl flex items-center justify-center p-2 border border-brand-border shrink-0">
                          <img src={item.exhibit.imageForegroundUrl} className="object-contain w-full h-full drop-shadow-sm" />
                        </div>

                        <div className="flex-1 flex flex-col justify-between py-1 pr-6">
                          <span className="font-serif text-sm text-brand-text truncate pr-2 tracking-wide">
                            {item.exhibit.title || "Untitled"}
                          </span>
                          
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-3">
                            <div className="relative w-full sm:w-auto">
                              <select 
                                value={item.size.id} 
                                onChange={e => {
                                  const newSize = SIZES.find(s => s.id === e.target.value) || SIZES[1];
                                  updateCartItem(itemKey, { size: newSize });
                                }} 
                                className="appearance-none bg-brand-bg border border-brand-border rounded-lg text-xs font-light tracking-wider py-2 pl-3 pr-8 w-full outline-none focus:border-brand-primary text-brand-text cursor-pointer"
                              >
                                {SIZES.map(s => (
                                  <option key={s.id} value={s.id}>{s.name} - ¥{s.price}</option>
                                ))}
                              </select>
                              <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-brand-text-soft">
                                <ChevronDown size={14} strokeWidth={1.5} />
                              </div>
                            </div>

                            <div className="flex items-center justify-between sm:justify-start gap-6">
                              <div className="flex items-center bg-brand-bg border border-brand-border rounded-full p-0.5">
                                <button 
                                  onClick={() => updateCartItem(itemKey, { quantity: Math.max(1, item.quantity - 1) })}
                                  className="w-7 h-7 flex items-center justify-center text-brand-text-muted hover:bg-white hover:shadow-sm rounded-full transition-all"
                                >
                                  <Minus size={14} strokeWidth={1.5} />
                                </button>
                                <span className="text-xs font-medium w-6 text-center text-brand-text">{item.quantity}</span>
                                <button 
                                  onClick={() => updateCartItem(itemKey, { quantity: item.quantity + 1 })}
                                  className="w-7 h-7 flex items-center justify-center text-brand-text-muted hover:bg-white hover:shadow-sm rounded-full transition-all"
                                >
                                  <Plus size={14} strokeWidth={1.5} />
                                </button>
                              </div>
                              
                              <div className="text-right text-brand-secondary font-serif text-sm whitespace-nowrap">
                                ¥{(item.size.price * item.quantity).toLocaleString()}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  {cartItems.length === 0 && (
                    <div className="text-xs font-light tracking-wider text-brand-text-soft py-6 text-center">
                      アイテムを選択してください。
                    </div>
                  )}
                </div>
              </section>
            </div>

            {/* フッター (固定) */}
            <div className="p-6 border-t border-brand-border bg-white pb-safe">
              <div className="flex items-center justify-between mb-5 px-1">
                <span className="font-light tracking-widest text-xs uppercase text-brand-text-muted flex items-center gap-2">
                  Total <span className="bg-brand-bg border border-brand-border text-[9px] px-2 py-0.5 rounded-full">{cartItems.length} items</span>
                </span>
                <span className="text-2xl font-serif text-brand-secondary flex items-baseline gap-1">
                  <span className="text-sm font-sans font-light">¥</span>{totalAmount.toLocaleString()}
                </span>
              </div>
              <button 
                disabled={cartItems.length === 0}
                onClick={() => onProceedToCheckout(cartItems, totalAmount)}
                className="w-full rounded-full bg-brand-secondary py-4 text-sm font-light tracking-widest uppercase text-white shadow-md active:scale-95 transition-all disabled:opacity-30 disabled:grayscale flex items-center justify-center gap-2 hover:bg-black"
              >
                <ShoppingBag size={16} strokeWidth={1.5} />
                Proceed to Checkout
              </button>
            </div>

          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}