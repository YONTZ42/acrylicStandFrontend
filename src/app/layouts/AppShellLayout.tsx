import { Outlet } from "react-router-dom";
import { AppHeader } from "./AppHeader";
import { AppFooter } from "./AppFooter";

export function AppShellLayout() {
  return (
    // 画面全体の高さを固定し、スクロールバーを出さずにFlexで分割する
    <div className="h-dvh bg-[#050506] text-brand-text flex flex-col selection:bg-brand-primary-soft selection:text-brand-primary overflow-hidden">
      
      {/* 1. 共通ヘッダー */}
      <AppHeader />

      {/* 2. メインコンテンツ領域（残りの高さをすべて埋める） */}
      {/* relativeを指定することで、RoomPage等の absolute inset-0 がこの枠内に収まります */}
      <main className="flex-1 relative w-full h-full flex flex-col">
        <Outlet />
      </main>

      {/* 3. 共通フッター */}
      <AppFooter />
      
    </div>
  );
}