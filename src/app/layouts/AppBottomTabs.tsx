import { NavLink } from "react-router-dom";
import { cn } from "@/shared/utils/cn";
import { ChevronRight, Sparkles } from "lucide-react";

export function AppBottomTabs() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 h-[50px] border-t border-brand-border bg-brand-surface/90 backdrop-blur-xl pb-safe shadow-[0_-4px_20px_rgba(0,0,0,0.03)] overflow-visible">
      <div className="mx-auto flex h-full max-w-md items-center justify-between pl-2 pr-4 relative">
        
        {/* -------------------------------------------------------------
            Flow Tabs: 巨大で極細の ">" でステップを区切る
        ------------------------------------------------------------- */}
        <div className="flex flex-1 items-center justify-between pr-4 h-full">
          <FlowTabItem to="/app/studio" label="Studio" />
          
          <ChevronRight 
            size={76} 
            strokeWidth={0.75} 
            className="text-brand-border-strong flex-shrink-0 -mx-5 opacity-70" 
          />
          
          <FlowTabItem to="/app/collection" label="Collection" />
          
          <ChevronRight 
            size={76} 
            strokeWidth={0.75} 
            className="text-brand-border-strong flex-shrink-0 -mx-5 opacity-70" 
          />
          
          <FlowTabItem to="/app/galleries" label="Gallery" />
        </div>

        {/* -------------------------------------------------------------
            Hub Tab: タブバーの上に突き出し、下半分が埋まる特別な丸ボタン
        ------------------------------------------------------------- */}
        <div className="relative flex-shrink-0 -top-5">
          <HubTabItem to="/app/hub" label="Hub" />
        </div>
        
      </div>
    </nav>
  );
}

// -----------------------------------------------------------------
// Sub Component: FlowTabItem (Studio, Collection, Gallery用)
// -----------------------------------------------------------------
function FlowTabItem({ to, label }: { to: string; label: string }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        cn(
          "flex flex-col items-center justify-center flex-1 h-full text-[13px] sm:text-sm transition-all duration-300 relative z-10",
          isActive 
            ? "text-brand-primary font-black scale-105" 
            : "text-brand-text-soft font-extrabold hover:text-brand-text-muted hover:scale-105"
        )
      }
    >
      <span className="tracking-wide truncate">{label}</span>
    </NavLink>
  );
}

// -----------------------------------------------------------------
// Sub Component: HubTabItem (突き出して埋まる丸ボタン)
// -----------------------------------------------------------------
function HubTabItem({ to, label }: { to: string; label: string }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        cn(
          "flex flex-col items-center justify-center w-[56px] h-[56px] rounded-full transition-all duration-300 shadow-xl",
          // 太い白いボーダーをつけることで、タブバーにめり込んでいる(切り抜かれている)ような視覚効果を出す
          "border-[6px] border-brand-surface/90 backdrop-blur-md",
          isActive 
            ? "bg-gradient-to-tr from-brand-primary to-brand-mint text-white ring-2 ring-brand-primary/20 scale-105" 
            : "bg-white text-brand-text-muted hover:text-brand-primary scale-100 hover:scale-105"
        )
      }
    >
      <Sparkles 
        size={24} 
        strokeWidth={2} 
        className={cn("mb-0.5 transition-transform duration-300")} 
      />
      <span className="text-[10px] font-black tracking-widest uppercase">{label}</span>
    </NavLink>
  );
}