import { useState } from "react";
import { X, CreditCard, Truck, Hammer } from "lucide-react";
import { cn } from "@/shared/utils/cn";

type Props = {
  open: boolean;
  onClose: () => void;
  totalAmount: number;
};

export function CheckoutModal({ open, onClose, totalAmount }: Props) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showComingSoon, setShowComingSoon] = useState(false);

  // フォームステート（ダミー）
  const [form, setForm] = useState({ name: "", zip: "", address: "", card: "" });

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // 疑似的なロード時間のあと、開発中モーダルへ切り替え
    setTimeout(() => {
      setIsSubmitting(false);
      setShowComingSoon(true);
    }, 1000);
  };

  // 開発中モーダル表示時
  if (showComingSoon) {
    return (
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-brand-text/50 backdrop-blur-md" onClick={() => { setShowComingSoon(false); onClose(); }} />
        <div className="relative w-full max-w-sm rounded-[2.5rem] bg-brand-surface p-8 shadow-2xl text-center border border-brand-border animate-in zoom-in-95">
          <div className="w-24 h-24 mx-auto bg-brand-primary-soft rounded-full flex items-center justify-center mb-6 shadow-inner border-4 border-white relative">
            <Hammer size={44} className="text-brand-primary animate-bounce" strokeWidth={2} />
          </div>
          <h2 className="text-2xl font-extrabold text-brand-text tracking-tight mb-3">
            開発中！🚧
          </h2>
          <div className="bg-brand-bg-soft rounded-2xl p-5 mb-6 border border-brand-border">
            <p className="text-sm font-bold text-brand-text-muted leading-relaxed">
              ごめんなさい！<br/>
              現在、Stripe決済と工場への発注システムを全力で作っています🛠️<br/>
              完成したら、あなたの最高のアクスタを本当にお届けします！✨
            </p>
          </div>
          <button 
            onClick={() => { setShowComingSoon(false); onClose(); }}
            className="w-full rounded-full bg-brand-primary px-6 py-3.5 text-sm font-extrabold text-white shadow-lg shadow-brand-primary/20 hover:shadow-brand-primary/40 hover:-translate-y-0.5 active:scale-95 transition-all"
          >
            ワクワクして待つ！
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[50] flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-brand-text/50 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-md max-h-[90vh] overflow-y-auto custom-scrollbar rounded-[2rem] border border-brand-border bg-brand-surface p-6 shadow-2xl animate-in zoom-in-95">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-extrabold text-brand-text flex items-center gap-2">
            <Truck className="text-brand-primary" /> お届け先と決済
          </h2>
          <button onClick={onClose} className="p-2 rounded-full bg-brand-bg-soft text-brand-text-muted hover:text-brand-text">
            <X size={20} strokeWidth={2.5} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 配送先情報 */}
          <section className="space-y-4">
            <h3 className="text-xs font-extrabold tracking-wide text-brand-text-muted uppercase">配送先情報</h3>
            <input required placeholder="お名前" className="w-full rounded-xl border border-brand-border-strong bg-brand-bg-soft px-4 py-3 text-sm font-bold focus:outline-none focus:border-brand-primary" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
            <div className="flex gap-2">
              <input required placeholder="郵便番号" className="w-1/3 rounded-xl border border-brand-border-strong bg-brand-bg-soft px-4 py-3 text-sm font-bold focus:outline-none focus:border-brand-primary" value={form.zip} onChange={e => setForm({...form, zip: e.target.value})} />
              <input required placeholder="都道府県・市区町村" className="w-2/3 rounded-xl border border-brand-border-strong bg-brand-bg-soft px-4 py-3 text-sm font-bold focus:outline-none focus:border-brand-primary" value={form.address} onChange={e => setForm({...form, address: e.target.value})} />
            </div>
          </section>

          {/* クレジットカード (ダミーUI) */}
          <section className="space-y-4 pt-4 border-t border-brand-border">
            <h3 className="text-xs font-extrabold tracking-wide text-brand-text-muted uppercase flex items-center gap-1">
              <CreditCard size={14} /> お支払い情報
            </h3>
            <div className="p-4 rounded-xl border border-brand-border-strong bg-brand-bg-soft relative">
              <input required placeholder="カード番号 (ダミー)" className="w-full bg-transparent text-sm font-bold focus:outline-none mb-3" value={form.card} onChange={e => setForm({...form, card: e.target.value})} />
              <div className="flex gap-4">
                <input placeholder="MM/YY" className="w-1/2 bg-transparent text-sm font-bold focus:outline-none" />
                <input placeholder="CVC" className="w-1/2 bg-transparent text-sm font-bold focus:outline-none" />
              </div>
            </div>
          </section>

          {/* 合計と決済ボタン */}
          <div className="pt-6 mt-6 border-t border-brand-border">
            <div className="flex items-center justify-between mb-4">
              <span className="font-extrabold text-brand-text">ご請求金額</span>
              <span className="text-2xl font-black text-brand-secondary">¥{totalAmount.toLocaleString()}</span>
            </div>
            <button 
              type="submit"
              disabled={isSubmitting}
              className={cn(
                "w-full rounded-full bg-brand-primary py-4 text-sm font-extrabold text-white shadow-md transition-all active:scale-95 flex justify-center items-center gap-2",
                isSubmitting ? "opacity-70 cursor-not-allowed" : "hover:bg-brand-primary-hover hover:shadow-brand-primary/40"
              )}
            >
              {isSubmitting && <Hammer size={18} className="animate-bounce" />}
              {isSubmitting ? "処理中..." : `¥${totalAmount.toLocaleString()} を支払って確定する`}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}