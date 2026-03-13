import { Outlet } from "react-router-dom";

export function ViewerLayout() {
  return (
    <div className="min-h-dvh bg-brand-bg text-brand-text selection:bg-brand-primary-soft selection:text-brand-primary">
      <Outlet />
    </div>
  );
}