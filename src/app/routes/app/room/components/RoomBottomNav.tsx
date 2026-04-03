import { useNavigate } from "react-router-dom";
import { Box, Wand2, ShoppingCart } from "lucide-react";

type Props = {
  toyboxCount: number;
  onOpenDrawer: () => void;
  onOpenShop: () => void; // ★追加
};

export function RoomBottomNav({ toyboxCount, onOpenDrawer, onOpenShop }: Props) {
  const navigate = useNavigate();

  return (
    <div className="absolute bottom-8 left-0 right-0 z-20 flex justify-center pointer-events-none px-4">
      <div className="pointer-events-auto flex items-center gap-6 bg-brand-text/85 backdrop-blur-xl p-3 px-6 rounded-[2.5rem] border border-white/20 shadow-glass">
        
        {/* おもちゃ箱 */}
        <button 
          onClick={onOpenDrawer}
          className="flex flex-col items-center justify-center w-16 h-16 rounded-full hover:bg-white/10 text-white transition-colors relative group"
        >
          <Box size={24} className="mb-1 text-brand-mint drop-shadow-[0_0_8px_rgba(45,212,191,0.8)] group-hover:scale-110 transition-transform" />
          <span className="text-[10px] font-bold">おもちゃ箱</span>
          {toyboxCount > 0 && (
            <span className="absolute top-1 right-2 w-4 h-4 bg-brand-secondary rounded-full text-[9px] font-bold flex items-center justify-center shadow-md animate-bounce">
              {toyboxCount}
            </span>
          )}
        </button>

        {/* 錬成 (Studio) */}
        <button 
          onClick={() => navigate('/app/studio')}
          className="flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-tr from-brand-primary to-brand-mint shadow-[0_0_20px_rgba(0,194,214,0.6)] text-white -mt-10 hover:-translate-y-1 active:scale-90 transition-all border-4 border-brand-surface"
        >
          <Wand2 size={32} strokeWidth={2.5} />
        </button>

        {/* 買う (Shop) */}
        <button 
          onClick={onOpenShop} 
          className="flex flex-col items-center justify-center w-16 h-16 rounded-full hover:bg-white/10 text-white transition-colors group"
        >
          <ShoppingCart size={22} className="mb-1 text-brand-secondary drop-shadow-[0_0_8px_rgba(255,122,89,0.8)] group-hover:scale-110 transition-transform" />
          <span className="text-[10px] font-bold">買う</span>
        </button>
      </div>
    </div>
  );
}