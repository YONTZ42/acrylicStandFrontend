import { NavLink } from "react-router-dom";
import { cn } from "@/shared/utils/cn";

export function AppBottomTabs() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 h-[68px] border-t border-brand-border bg-brand-surface/80 backdrop-blur-md pb-safe shadow-[0_-4px_20px_rgba(0,0,0,0.02)]">
      <div className="mx-auto flex h-full max-w-md items-center justify-around px-4">
        <NavLink
          to="/app/galleries"
          className={({ isActive }) =>
            cn(
              "flex flex-col items-center justify-center gap-1 rounded-2xl px-6 py-2 text-sm transition-all duration-200",
              isActive 
                ? "text-brand-primary font-extrabold bg-brand-primary-soft/50" 
                : "text-brand-text-muted font-bold hover:text-brand-text hover:bg-brand-bg-soft"
            )
          }
        >
          <span>Galleries</span>
        </NavLink>

        <NavLink
          to="/app/studio"
          className={({ isActive }) =>
            cn(
              "flex flex-col items-center justify-center gap-1 rounded-2xl px-6 py-2 text-sm transition-all duration-200",
              isActive 
                ? "text-brand-primary font-extrabold bg-brand-primary-soft/50" 
                : "text-brand-text-muted font-bold hover:text-brand-text hover:bg-brand-bg-soft"
            )
          }
        >
          <span>Studio</span>
        </NavLink>
      </div>
    </nav>
  );
}