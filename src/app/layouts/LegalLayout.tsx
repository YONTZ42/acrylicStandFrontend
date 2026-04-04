// src/app/layouts/LegalLayout.tsx
import { Outlet } from "react-router-dom";
import { SimpleHeader } from "@/app/layouts/SimpleHeader"; // 先ほど作成したヘッダーのパス
import { AppFooter } from "@/app/layouts/AppFooter";       // フッターの実際のパスに合わせてください

export function LegalLayout() {
  return (
    <div className="min-h-screen bg-brand-bg-soft flex flex-col font-sans text-brand-text">
      <SimpleHeader />
      <main className="flex-1 w-full max-w-4xl mx-auto px-4 py-12 md:py-20">
        <Outlet />
      </main>
      <AppFooter />
    </div>
  );
}