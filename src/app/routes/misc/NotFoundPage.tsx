// src/app/routes/misc/NotFoundPage.tsx
import { Link } from "react-router-dom";

export function NotFoundPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="mx-auto max-w-2xl px-6 py-12">
        <div className="text-2xl font-bold">404</div>
        <div className="mt-2 text-white/70">ページが見つかりません。</div>

        <div className="mt-6">
          <Link
            to="/"
            className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-black hover:bg-white/90"
          >
            Go Home
          </Link>
        </div>
      </div>
    </div>
  );
}
