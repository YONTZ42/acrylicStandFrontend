export function AppHeader() {
  return (
    <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-brand-border bg-brand-surface/80 px-6 backdrop-blur-md shadow-sm">
      <div className="text-xl font-extrabold text-brand-primary tracking-tight">
        あくすたポン！
      </div>
      <div className="text-xs font-bold text-brand-text-muted bg-brand-bg-soft px-3 py-1 rounded-full border border-brand-border-strong tracking-wide">
        UserMode
      </div>
    </header>
  );
}