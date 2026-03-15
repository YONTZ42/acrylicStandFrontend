import { Compass } from "lucide-react";

export function HubPage() {
  return (
    <div className="relative w-full h-[calc(100dvh-64px-68px)] overflow-hidden bg-brand-bg flex items-center justify-center">
      
      {/* 背景のダミーコンテンツ（ぼかし） */}
      <div className="absolute inset-0 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 p-6 opacity-30 blur-[6px] scale-105 pointer-events-none">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="aspect-[4/3] rounded-[2rem] bg-brand-surface border-2 border-brand-border flex items-center justify-center shadow-lg">
             <div className="w-1/2 h-1/2 bg-brand-primary-soft rounded-full animate-pulse"></div>
          </div>
        ))}
      </div>

      {/* 暗いオーバーレイ（夜っぽさ・ワクワク感） */}
      <div className="absolute inset-0 bg-brand-text/80 backdrop-blur-sm"></div>

      {/* メインメッセージ */}
      <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-md">
        <div className="w-20 h-20 rounded-full bg-brand-primary-soft/10 border-2 border-brand-primary flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(0,194,214,0.4)] relative">
          <Compass size={40} className="text-brand-primary animate-[spin_10s_linear_infinite]" />
          <div className="absolute top-0 right-0 w-3 h-3 bg-brand-mint rounded-full animate-ping"></div>
        </div>
        
        <h1 className="text-3xl font-extrabold text-white tracking-tight drop-shadow-lg">
          Hub is <span className="text-brand-primary">Coming Soon</span>
        </h1>
        
        <p className="mt-4 text-brand-text-soft font-bold leading-relaxed">
          絶賛開発中！🛠️<br/>
          ここは世界中のユーザーが作ったギャラリーや、<br/>
          お気に入りのアクスタと出会える場所になります。
        </p>

        <div className="mt-8 px-6 py-3 rounded-full bg-white/10 border border-white/20 text-white text-sm font-extrabold tracking-widest uppercase backdrop-blur-md">
          Stay Tuned
        </div>
      </div>
    </div>
  );
}