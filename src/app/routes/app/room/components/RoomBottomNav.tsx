// src/app/routes/app/room/components/RoomBottomNav.tsx
import { useNavigate } from "react-router-dom";
import { Library, Wand2, ShoppingBag, Globe } from "lucide-react";

type Props = {
  collectionCount: number;
  onOpenDrawer: () => void;
  onOpenShop: () => void;
};

export function RoomBottomNav({ collectionCount, onOpenDrawer, onOpenShop }: Props) {
  const navigate = useNavigate();

  return (
    <div className="absolute bottom-1 sm:bottom-1 left-1/2 -translate-x-1/2 z-20 pointer-events-none w-full max-w-[28rem] px-4">
      {/* 高級感のあるガラスUI */}
      <div className="pointer-events-auto flex items-center justify-between bg-black/20 backdrop-blur-xl px-4 py-1 sm:px-6 sm:py-4 rounded-[2rem] border border-white/20 shadow-glass">
        
        <button 
          onClick={onOpenDrawer}
          className="flex flex-col items-center justify-center gap-1.5 text-white/70 hover:text-white transition-colors relative flex-1 group"
        >
          <Library size={18} strokeWidth={1.5} className="group-hover:-translate-y-1 transition-transform" />
          <span className="text-[11px] sm:text-xs font-medium tracking-wide">コレクション</span>
          {collectionCount > 0 && (
            <span className="absolute -top-1 right-2 sm:right-4 w-4 h-4 bg-brand-primary text-white rounded-full text-[9px] flex items-center justify-center shadow-md">
              {collectionCount}
            </span>
          )}
        </button>

        <div className="w-px h-8 bg-white/10" />

        <button 
          onClick={() => navigate('/app/studio')}
          className="flex flex-col items-center justify-center gap-1.5 text-brand-primary hover:text-[#E5C158] transition-colors flex-1 group"
        >
          <Wand2 size={18} strokeWidth={1.5} className="group-hover:-translate-y-1 transition-transform drop-shadow-md" />
          <span className="text-[12px] sm:text-xs font-bold tracking-wide drop-shadow-md">作る</span>
        </button>

        <div className="w-px h-8 bg-white/10" />

        <button 
          onClick={onOpenShop} 
          className="flex flex-col items-center justify-center gap-1.5 text-white/70 hover:text-white transition-colors flex-1 group"
        >
          <ShoppingBag size={19} strokeWidth={1.5} className="group-hover:-translate-y-1 transition-transform" />
          <span className="text-[10px] sm:text-xs font-medium tracking-wide">配送</span>
        </button>

        <div className="w-px h-8 bg-white/10" />

        <button 
          onClick={() => navigate('/app/hub')} 
          className="flex flex-col items-center justify-center gap-1.5 text-white/70 hover:text-white transition-colors flex-1 group"
        >
          <Globe size={18} strokeWidth={1.5} className="group-hover:-translate-y-1 transition-transform" />
          <span className="text-[10px] sm:text-xs font-medium tracking-wide whitespace-nowrap">みんなのアクスタ</span>
        </button>
        
      </div>
    </div>
  );
}