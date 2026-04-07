import { useNavigate } from "react-router-dom";
import { Library, Wand2, ShoppingBag } from "lucide-react";

type Props = {
  collectionCount: number;
  onOpenDrawer: () => void;
  onOpenShop: () => void;
};

export function RoomBottomNav({ collectionCount, onOpenDrawer, onOpenShop }: Props) {
  const navigate = useNavigate();

  return (
    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 pointer-events-none w-full max-w-sm px-4">
      <div className="pointer-events-auto flex items-center justify-between bg-white/10 backdrop-blur-2xl px-8 py-4 rounded-full border border-white/20 shadow-glass">
        
        <button 
          onClick={onOpenDrawer}
          className="flex flex-col items-center justify-center gap-1.5 text-white/70 hover:text-white transition-colors relative w-16 group"
        >
          <Library size={22} strokeWidth={1.5} className="group-hover:scale-110 transition-transform" />
          <span className="text-[9px] font-light tracking-widest uppercase">Collection</span>
          {collectionCount > 0 && (
            <span className="absolute -top-1 -right-2 w-4 h-4 bg-brand-primary text-white rounded-full text-[9px] flex items-center justify-center shadow-md">
              {collectionCount}
            </span>
          )}
        </button>

        <div className="w-px h-8 bg-white/10" />

        <button 
          onClick={() => navigate('/app/studio')}
          className="flex flex-col items-center justify-center gap-1.5 text-brand-primary hover:text-[#E5C158] transition-colors w-16 group"
        >
          <Wand2 size={24} strokeWidth={1.5} className="group-hover:scale-110 transition-transform" />
          <span className="text-[9px] font-light tracking-widest uppercase">Studio</span>
        </button>

        <div className="w-px h-8 bg-white/10" />

        <button 
          onClick={onOpenShop} 
          className="flex flex-col items-center justify-center gap-1.5 text-white/70 hover:text-white transition-colors w-16 group"
        >
          <ShoppingBag size={22} strokeWidth={1.5} className="group-hover:scale-110 transition-transform" />
          <span className="text-[9px] font-light tracking-widest uppercase">Order</span>
        </button>
        
      </div>
    </div>
  );
}