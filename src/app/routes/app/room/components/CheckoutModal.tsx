import { useState } from "react";
import { X, CreditCard, Truck, Hammer, Loader2 } from "lucide-react";
import { cn } from "@/shared/utils/cn";

type Props = {
  open: boolean;
  onClose: () => void;
  totalAmount: number;
};

export function CheckoutModal({ open, onClose, totalAmount }: Props) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const[showComingSoon, setShowComingSoon] = useState(false);

  const [form, setForm] = useState({ name: "", zip: "", address: "", card: "" });

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setShowComingSoon(true);
    }, 1500);
  };

  if (showComingSoon) {
    return (
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => { setShowComingSoon(false); onClose(); }} />
        <div className="relative w-full max-w-sm rounded-3xl bg-white p-8 shadow-2xl text-center border border-brand-border animate-in zoom-in-95">
          <div className="w-16 h-16 mx-auto bg-brand-bg rounded-full flex items-center justify-center mb-6 border border-brand-border">
            <Hammer size={28} strokeWidth={1.5} className="text-brand-primary" />
          </div>
          <h2 className="text-xl font-serif text-brand-text tracking-wide mb-4">
            Preparing for launch
          </h2>
          <div className="mb-8">
            <p className="text-xs font-light text-brand-text-muted leading-relaxed tracking-wider">
              現在、決済および製造システムの<br/>準備を進めております。<br/><br/>
              サービス開始まで、今しばらくお待ちください。
            </p>
          </div>
          <button 
            onClick={() => { setShowComingSoon(false); onClose(); }}
            className="w-full rounded-full border border-brand-border bg-brand-bg py-3 text-xs font-light tracking-widest uppercase text-brand-text hover:bg-white transition-all"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[50] flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-md max-h-[90vh] flex flex-col rounded-3xl border border-brand-border bg-white shadow-2xl animate-in zoom-in-95 overflow-hidden">
        
        <div className="flex items-center justify-between p-6 border-b border-brand-border">
          <h2 className="text-lg font-serif text-brand-text flex items-center gap-2">
            Checkout
          </h2>
          <button onClick={onClose} className="p-2 -mr-2 rounded-full text-brand-text-muted hover:text-brand-text transition-colors">
            <X size={20} strokeWidth={1.5} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
          <form id="checkout-form" onSubmit={handleSubmit} className="space-y-8">
            
            <section className="space-y-4">
              <h3 className="text-[10px] font-light tracking-widest text-brand-text-muted uppercase flex items-center gap-2">
                <Truck size={14} strokeWidth={1.5} /> Shipping Address
              </h3>
              <input required placeholder="Full Name" className="w-full rounded-xl border border-brand-border bg-brand-bg px-4 py-3 text-sm focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary/50 transition-all" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
              <div className="flex gap-3">
                <input required placeholder="Zip" className="w-1/3 rounded-xl border border-brand-border bg-brand-bg px-4 py-3 text-sm focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary/50 transition-all" value={form.zip} onChange={e => setForm({...form, zip: e.target.value})} />
                <input required placeholder="Address" className="w-2/3 rounded-xl border border-brand-border bg-brand-bg px-4 py-3 text-sm focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary/50 transition-all" value={form.address} onChange={e => setForm({...form, address: e.target.value})} />
              </div>
            </section>

            <section className="space-y-4">
              <h3 className="text-[10px] font-light tracking-widest text-brand-text-muted uppercase flex items-center gap-2">
                <CreditCard size={14} strokeWidth={1.5} /> Payment Method
              </h3>
              <div className="p-4 rounded-xl border border-brand-border bg-brand-bg focus-within:border-brand-primary focus-within:ring-1 focus-within:ring-brand-primary/50 transition-all">
                <input required placeholder="Card Number" className="w-full bg-transparent text-sm focus:outline-none mb-4 tracking-widest" value={form.card} onChange={e => setForm({...form, card: e.target.value})} />
                <div className="flex gap-4">
                  <input placeholder="MM/YY" className="w-1/2 bg-transparent text-sm focus:outline-none tracking-widest" />
                  <input placeholder="CVC" className="w-1/2 bg-transparent text-sm focus:outline-none tracking-widest" />
                </div>
              </div>
            </section>
          </form>
        </div>

        <div className="p-6 border-t border-brand-border bg-brand-bg">
          <div className="flex items-center justify-between mb-5 px-1">
            <span className="font-light tracking-widest text-xs uppercase text-brand-text-muted">Total</span>
            <span className="text-xl font-serif text-brand-secondary">¥{totalAmount.toLocaleString()}</span>
          </div>
          <button 
            type="submit"
            form="checkout-form"
            disabled={isSubmitting}
            className={cn(
              "w-full rounded-full bg-brand-secondary py-4 text-xs font-light tracking-widest uppercase text-white shadow-md transition-all active:scale-95 flex justify-center items-center gap-2",
              isSubmitting ? "opacity-50 cursor-not-allowed" : "hover:bg-black"
            )}
          >
            {isSubmitting && <Loader2 size={16} strokeWidth={1.5} className="animate-spin" />}
            {isSubmitting ? "Processing..." : "Place Order"}
          </button>
        </div>

      </div>
    </div>
  );
}