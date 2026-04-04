// src/app/AppRouter.tsx
import { BrowserRouter, Route, Routes, Navigate, Link } from "react-router-dom";

import { LandingPage } from "@/app/routes/marketing/LandingPage";
import { LoginPage } from "@/app/routes/auth/LoginPage";
import { RegisterPage } from "@/app/routes/auth/RegisterPage";
import { NotFoundPage } from "@/app/routes/misc/NotFoundPage";
import { PublicGalleryPage } from "@/app/routes/viewer/PublicGalleryPage";

import { TermsPage } from "@/app/routes/misc/TermsPage";
import { PrivacyPage } from "@/app/routes/misc/PrivacyPage";
import { LawPage } from "@/app/routes/misc/LawPage";
import { ContactPage } from "@/app/routes/misc/ContactPage";

// Layouts
import { RootLayout } from "@/app/layouts/RootLayout";
import { MarketingLayout } from "@/app/layouts/MarketingLayout";
import { ViewerLayout } from "@/app/layouts/ViewerLayout";
import { AppShellLayout } from "@/app/layouts/AppShellLayout";
import { LegalLayout } from "@/app/layouts/LegalLayout"; // --- 新しく追加 ---

// App Pages (統合後の新設計)
import { RoomPage } from "@/app/routes/app/room/RoomPage";
import { StudioPage } from "@/app/routes/app/studio/StudioPage";
import { HubPage } from "@/app/routes/app/hub/HubPage";

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<RootLayout />}>
          <Route element={<MarketingLayout />}>
            <Route path="/" element={<LandingPage />} />
          </Route>

          {/* 法務・汎用ページ用ルーティング */}
          <Route element={<LegalLayout />}>
            <Route path="/terms" element={<TermsPage />} />
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route path="/law" element={<LawPage />} />
            <Route path="/contact" element={<ContactPage />} />
          </Route>

          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />


          <Route path="/g/:slug" element={<ViewerLayout />}>
            <Route index element={<PublicGalleryPage />} />
          </Route>

          <Route path="/app" element={<AppShellLayout />}>
            {/* メイン画面を room に設定 */}
            <Route index element={<Navigate to="room" replace />} />

            <Route path="room" element={<RoomPage />} />
            <Route path="studio" element={<StudioPage />} />
            <Route path="hub" element={<HubPage />} />
          </Route>

          <Route path="/404" element={<NotFoundPage />} />
          <Route path="*" element={<Navigate to="/404" replace />} />
        </Route>
      </Routes>

      {import.meta.env.DEV ? (
        <div className="fixed bottom-[80px] left-3 z-50 rounded-xl border border-brand-border-strong bg-brand-surface/90 px-3 py-2 text-xs text-brand-text shadow-lg backdrop-blur-md">
          <div className="font-bold opacity-90 text-brand-primary">DEV NAV</div>
          <div className="mt-1 flex gap-3 underline underline-offset-2 opacity-80 font-semibold">
            <Link to="/">/</Link>
            <Link to="/app/room">/app</Link>
          </div>
        </div>
      ) : null}
    </BrowserRouter>
  );
}