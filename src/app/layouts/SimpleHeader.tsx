// src/components/SimpleHeader.tsx (または適切なコンポーネントディレクトリ)
import { Link } from "react-router-dom";
import { useAuthContext } from "@/features/auth/AuthProvider";

export function SimpleHeader() {
  const { status } = useAuthContext();
  const isAuth = status === "authenticated";

  return (
    <header className="sticky top-0 z-50 w-full h-16 bg-white/90 backdrop-blur-md border-b border-brand-border px-4 sm:px-6 flex justify-between items-center shadow-sm">
      <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-brand-primary to-brand-mint flex items-center justify-center text-white font-black text-[10px] shadow-sm">
          AP!
        </div>
        <span className="text-xl font-black text-brand-text tracking-tight">
          あくすたポン！
        </span>
      </Link>
      
      <div className="flex items-center gap-4">
        {isAuth ? (
          <Link to="/app/room" className="text-sm font-bold text-brand-primary hover:text-brand-primary-hover">マイルームへ</Link>
        ) : (
          <Link to="/login" className="text-sm font-bold text-brand-text-muted hover:text-brand-primary">ログイン</Link>
        )}
      </div>
    </header>
  );
}