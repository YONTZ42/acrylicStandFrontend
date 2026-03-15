import { NavLink } from "react-router-dom";
import { cn } from "@/shared/utils/cn";

export function AppBottomTabs() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 h-[68px] border-t border-brand-border bg-brand-surface/80 backdrop-blur-md pb-safe shadow-[0_-4px_20px_rgba(0,0,0,0.02)]">
      <div className="mx-auto flex h-full max-w-md items-center justify-between px-2">
        <TabItem to="/app/studio" label="Studio" />
        <TabItem to="/app/collection" label="Collection" />
        <TabItem to="/app/galleries" label="Gallery" />
        <TabItem to="/app/hub" label="Hub" />
      </div>
    </nav>
  );
}

function TabItem({ to, label }: { to: string; label: string }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        cn(
          "flex flex-col items-center justify-center flex-1 mx-1 rounded-2xl py-2.5 text-xs sm:text-sm transition-all duration-200",
          isActive 
            ? "text-brand-primary font-extrabold bg-brand-primary-soft/50 shadow-sm" 
            : "text-brand-text-muted font-bold hover:text-brand-text hover:bg-brand-bg-soft"
        )
      }
    >
      <span>{label}</span>
    </NavLink>
  );
}