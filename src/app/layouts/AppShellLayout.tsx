import { Outlet } from "react-router-dom";
import { AppHeader } from "./AppHeader";
import { AppBottomTabs } from "./AppBottomTabs";

export function AppShellLayout() {
  // TODO: Auth ready待ちやguest発行初期化ロジックはここに配置します。
  // const isAuthReady = useAuthReady();
  // if (!isAuthReady) return null;

  return (
    // 背景と文字色をブランドカラーに合わせ、選択時のハイライト色も追加
    <div className="min-h-dvh bg-brand-bg text-brand-text flex flex-col selection:bg-brand-primary-soft selection:text-brand-primary">
      <AppHeader />
      <main className="flex-1 pb-[68px]"> {/* AppBottomTabsの高さ分余白 */}
        <Outlet />
      </main>
      <AppBottomTabs />
    </div>
  );
}