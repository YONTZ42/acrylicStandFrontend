import { BrowserRouter, Route, Routes, Navigate, Link } from "react-router-dom";

import { LandingPage } from "@/app/routes/marketing/LandingPage";
import { LoginPage } from "@/app/routes/auth/LoginPage";
import { RegisterPage } from "@/app/routes/auth/RegisterPage";
import { NotFoundPage } from "@/app/routes/misc/NotFoundPage";
import { PublicGalleryPage } from "@/app/routes/viewer/PublicGalleryPage";

// Layouts
import { RootLayout } from "@/app/layouts/RootLayout";
import { MarketingLayout } from "@/app/layouts/MarketingLayout";
import { ViewerLayout } from "@/app/layouts/ViewerLayout";
import { AppShellLayout } from "@/app/layouts/AppShellLayout";

// App Pages
import { GalleriesPage } from "@/app/routes/app/galleries/GalleriesPage";
import { GalleryWorkspacePage } from "@/app/routes/app/galleries/GalleryWorkspacePage";
import { StudioPage } from "@/app/routes/app/studio/StudioPage";

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<RootLayout />}>
          <Route element={<MarketingLayout />}>
            <Route path="/" element={<LandingPage />} />
          </Route>

          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          <Route path="/g/:slug" element={<ViewerLayout />}>
            <Route index element={<PublicGalleryPage />} />
          </Route>

          <Route path="/app" element={<AppShellLayout />}>
            {/* /app 直アクセス時は galleries へリダイレクト */}
            <Route index element={<Navigate to="galleries" replace />} />

            <Route path="galleries">
              <Route index element={<GalleriesPage />} />
              <Route path=":galleryId" element={<GalleryWorkspacePage />} />
            </Route>

            <Route path="studio" element={<StudioPage />} />
          </Route>

          <Route path="/404" element={<NotFoundPage />} />
          <Route path="*" element={<Navigate to="/404" replace />} />
        </Route>
      </Routes>

      {/* 開発用の簡易ナビ（後で消す） */}
      {import.meta.env.DEV ? (
        <div className="fixed bottom-3 left-3 z-50 rounded-xl border border-white/10 bg-black/70 px-3 py-2 text-xs text-white shadow-lg">
          <div className="font-semibold opacity-90">DEV NAV</div>
          <div className="mt-1 flex gap-3 underline underline-offset-2 opacity-80">
            <Link to="/">/</Link>
            <Link to="/login">/login</Link>
            <Link to="/app">/app</Link>
            <Link to="/app/studio">/studio</Link>
          </div>
        </div>
      ) : null}
    </BrowserRouter>
  );
}