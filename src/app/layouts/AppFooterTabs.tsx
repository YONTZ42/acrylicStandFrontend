
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
        "fixed inset-x-0 bottom-0 z-50 border-t border-white/10 bg-black/70 backdrop-blur",
        "pb-[env(safe-area-inset-bottom)]",
        className
      )}
    >
      <div className="mx-auto flex max-w-md items-stretch justify-between px-3 py-2">
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
        "flex-1 rounded-xl px-3 py-3 text-sm font-medium transition",
        "border border-white/10",
        active ? "bg-white/15 text-white" : "bg-white/5 text-white/70 hover:bg-white/10",
        disabled && "cursor-not-allowed opacity-40 hover:bg-white/5"
      )}
    >
      {label}
    </button>
  );
}
