// src/app/AppRouter.tsx
import { BrowserRouter, Route, Routes, Navigate, Link } from "react-router-dom";

import { LandingPage } from "@/app/routes/marketing/LandingPage";
import { LoginPage } from "@/app/routes/auth/LoginPage";
import { RegisterPage } from "@/app/routes/auth/RegisterPage";
import { AppHome } from "@/app/routes/app/AppHome";
import { NotFoundPage } from "@/app/routes/misc/NotFoundPage";
import {PublicGalleryPage} from "@/app/routes/viewer/PublicGalleryPage";
export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/app" element={<AppHome />} />
        <Route path="/404" element={<NotFoundPage />} />
        <Route path="/g/:slug" element={<PublicGalleryPage/>}/>
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Routes>

      {/* 開発用の簡易ナビ（後で消す） */}
      {import.meta.env.DEV ? (
        <div className="fixed bottom-3 left-3 z-50 rounded-xl border border-white/10 bg-black/70 px-3 py-2 text-xs text-white shadow-lg">
          <div className="font-semibold opacity-90">DEV NAV</div>
          <div className="mt-1 flex gap-3 underline underline-offset-2 opacity-80">
            <Link to="/">/</Link>
            <Link to="/login">/login</Link>
            <Link to="/app">/app</Link>
          </div>
        </div>
      ) : null}
    </BrowserRouter>
  );
}
