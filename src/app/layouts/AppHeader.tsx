import { Link } from "react-router-dom";
import { UserCircle } from "lucide-react";
import { useAuthContext } from "@/features/auth/AuthProvider";

export function AppHeader() {
  // AuthProviderからユーザーのログイン状態を取得
  const { status, user } = useAuthContext();
  const isGuest = status === "guest";

  return (
    <header className="relative z-50 flex h-14 items-center justify-between border-b border-white/10 bg-[#050506]/80 px-4 sm:px-6 backdrop-blur-md shadow-sm">
      
      {/* ロゴエリア */}
      <Link to="/app/room" className="flex items-center gap-2 hover:opacity-80 active:scale-95 transition-all">
        {/* ロゴ画像の代わりとなるアイコン（後でimgタグに差し替え可能） */}
        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-brand-primary to-brand-mint flex items-center justify-center text-white font-black text-[10px] shadow-[0_0_10px_rgba(0,194,214,0.4)]">
          AP!
        </div>
        <span className="text-lg font-black text-white tracking-tight drop-shadow-md hidden sm:block">
          あくすたポン！
        </span>
      </Link>
      
      {/* ユーザー情報エリア */}
      <div className="flex items-center gap-3">
        <Link 
          to={isGuest ? "/login" : "/app/room"} 
          className="flex items-center gap-2 bg-white/5 hover:bg-white/10 transition-colors rounded-full pl-3 pr-1 py-1 border border-white/10 active:scale-95"
        >
          <div className="flex flex-col items-end justify-center mr-1">
            <span className="text-[10px] font-extrabold text-brand-primary leading-none mb-0.5">
              {isGuest ? "Guest" : "User"}
            </span>
            <span className="text-[11px] font-bold text-white/80 leading-none">
              {isGuest ? "ログインする" : (user?.email || "My Account")}
            </span>
          </div>
          <div className="w-8 h-8 rounded-full bg-brand-surface/20 text-brand-mint border border-brand-mint/30 flex items-center justify-center shadow-sm">
            <UserCircle size={18} strokeWidth={2.5} />
          </div>
        </Link>
      </div>

    </header>
  );
}