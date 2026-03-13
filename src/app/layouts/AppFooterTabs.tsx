import { cn } from "@/shared/utils/cn";

export type AppTabKey = "library" | "detail";

type Props = {
  active: AppTabKey;
  onChange: (tab: AppTabKey) => void;
  detailEnabled: boolean;
  className?: string;
};

export function AppFooterTabs({ active, onChange, detailEnabled, className }: Props) {
  return (
    <footer
      className={cn(
        "fixed inset-x-0 bottom-0 z-50 border-t border-brand-border bg-brand-surface/80 backdrop-blur-md shadow-[0_-4px_20px_rgba(0,0,0,0.02)]",
        "pb-[env(safe-area-inset-bottom)]",
        className
      )}
    >
      <div className="mx-auto flex max-w-md items-stretch justify-between gap-3 px-4 py-3">
        <TabButton
          label="Library"
          active={active === "library"}
          onClick={() => onChange("library")}
        />
        <TabButton
          label="Viewer"
          active={active === "detail"}
          disabled={!detailEnabled}
          onClick={() => onChange("detail")}
        />
      </div>
    </footer>
  );
}

function TabButton({
  label,
  active,
  disabled,
  onClick,
}: {
  label: string;
  active: boolean;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "flex-1 rounded-full px-4 py-3 text-sm font-bold transition-all duration-200 shadow-sm",
        "border",
        active 
          ? "bg-brand-primary border-brand-primary text-white shadow-brand-primary/20" 
          : "bg-brand-surface border-brand-border text-brand-text-muted hover:bg-brand-bg-soft hover:text-brand-text",
        disabled && "cursor-not-allowed opacity-40 hover:bg-brand-surface hover:text-brand-text-muted"
      )}
    >
      {label}
    </button>
  );
}