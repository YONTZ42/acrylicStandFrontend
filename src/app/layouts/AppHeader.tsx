import { Link } from "react-router-dom";
import { UserCircle } from "lucide-react";
import { useAuthContext } from "@/features/auth/AuthProvider";

export function AppHeader() {
  const { status, user } = useAuthContext();
  const isGuest = status === "guest";

  return (
    <header className="sticky top-0 z-50 flex h-11 sm:h-16 items-center justify-between border-b border-brand-border bg-white/90 px-6 sm:px-3 backdrop-blur-md shadow-sm">
      
      {/* ロゴエリア */}
      <Link to="/app/room" className="flex items-center gap-3 hover:opacity-80 active:scale-95 transition-all">
        <div className="w-8 h-8 rounded-lg bg-brand-primary flex items-center justify-center text-white font-serif font-bold text-xs shadow-sm">
          BX
        </div>
        <span className="text-lg font-serif font-bold text-brand-text tracking-widest hidden sm:block">
          バクスタ
        </span>
      </Link>
      
      {/* ユーザー情報エリア */}
      <div className="flex items-center gap-3">
        <Link 
          to={isGuest ? "/login" : "/app/room"} 
          className="flex items-center gap-3 bg-brand-bg hover:bg-brand-bg-soft transition-colors rounded-full pl-4 pr-1.5 py-1.5 border border-brand-border shadow-sm"
        >
          <div className="flex flex-col items-end justify-center mr-1">
            <span className="text-[9px] font-light tracking-widest text-brand-text-muted uppercase leading-none mb-1">
              {isGuest ? "Guest" : "Account"}
            </span>
            <span className="text-[11px] font-serif text-brand-text leading-none">
              {isGuest ? "Sign In" : (user?.email || "My Account")}
            </span>
          </div>
          <div className="w-8 h-6 sm:h-3 rounded-full bg-white text-brand-text-muted border border-brand-border flex items-center justify-center shadow-sm">
            <UserCircle size={18} strokeWidth={1.5} />
          </div>
        </Link>
      </div>

    </header>
  );
}