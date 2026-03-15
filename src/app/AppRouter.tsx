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
import { StudioPage } from "@/app/routes/app/studio/StudioPage";
import { CollectionPage } from "@/app/routes/app/collection/CollectionPage";
import { GalleriesPage } from "@/app/routes/app/galleries/GalleriesPage";
import { GalleryWorkspacePage } from "@/app/routes/app/galleries/GalleryWorkspacePage";
import { HubPage } from "@/app/routes/app/hub/HubPage";

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
            {/* 4タブ構成の最初は studio に設定 */}
            <Route index element={<Navigate to="studio" replace />} />

            <Route path="studio" element={<StudioPage />} />
            
            <Route path="collection" element={<CollectionPage />} />

            <Route path="galleries">
              <Route index element={<GalleriesPage />} />
              <Route path=":galleryId" element={<GalleryWorkspacePage />} />
            </Route>

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
            <Link to="/app/studio">/app</Link>
          </div>
        </div>
      ) : null}
    </BrowserRouter>
  );
}