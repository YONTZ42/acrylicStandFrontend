// src/app/routes/app/hub/HubPage.tsx
import { Link } from "react-router-dom";
import { Compass, ChevronLeft, Hammer } from "lucide-react";

export function HubPage() {
  return (
    <div className="relative w-full h-full min-h-0 overflow-hidden bg-[#050506] flex items-center justify-center font-sans select-none">
      
      {/* --- 背景: 開発中のブループリント（設計図）と光の演出 --- */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:3rem_3rem][mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />
      
      {/* オーロラのようなアンビエントライト */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] max-w-[600px] aspect-square bg-brand-primary/20 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[60vw] max-w-[400px] aspect-square bg-brand-accent/10 blur-[100px] rounded-full pointer-events-none" />

      {/* --- メインコンテンツ（グラスモーフィズムカード） --- */}
      <div className="relative z-10 flex flex-col items-center text-center px-6 py-12 sm:p-12 max-w-lg w-[calc(100%-2rem)] bg-white/5 border border-white/10 rounded-[3rem] shadow-[0_20px_60px_rgba(0,0,0,0.6)] backdrop-blur-2xl">
        
        {/* アイコン & 建築中アニメーション */}
        <div className="relative w-24 h-24 mb-8 flex items-center justify-center">
          {/* 回転する軌道（未来感・建築感） */}
          <div className="absolute inset-0 border border-brand-primary/40 rounded-full animate-[spin_8s_linear_infinite]" />
          <div className="absolute inset-2 border border-brand-accent/40 rounded-full animate-[spin_12s_linear_infinite_reverse]" />
          <div className="absolute inset-0 bg-gradient-to-tr from-brand-primary/20 to-brand-accent/20 rounded-full blur-md" />
          
          <Compass size={40} strokeWidth={1.5} className="text-white relative z-10 drop-shadow-md" />
          
          {/* ツールアイコン（ハンマー） */}
          <div className="absolute -top-1 -right-1 w-7 h-7 bg-brand-primary text-black rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(167,139,250,0.8)]">
             <Hammer size={14} strokeWidth={2.5} />
          </div>
        </div>
        
        {/* テキストメッセージ */}
        <h1 className="text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-white to-white/60 tracking-tight mb-6 drop-shadow-md">
          Hub is <span className="text-brand-primary">Building...</span>
        </h1>
        
        {/* ★ 暗い文字色を白系（text-white/90）にし、シャドウをつけて視認性向上 */}
        <p className="text-white/90 text-sm sm:text-base leading-relaxed mb-10 font-medium drop-shadow-md">
          絶賛開発中！🛠️<br />
          ここは世界中のユーザーが作ったギャラリーや、<br />
          お気に入りのアクスタと出会える場所になります。
        </p>

        {/* --- アクションボタン群 --- */}
        <div className="flex flex-col sm:flex-row gap-4 w-full">
           

           {/* 祭壇に戻る導線 */}
           <Link 
             to="/app/room"
             className="flex-1 flex items-center justify-center gap-2 py-4 rounded-full bg-white/10 border border-white/20 text-white text-sm font-bold shadow-sm hover:bg-white/20 active:scale-95 transition-all"
           >
              <ChevronLeft size={18} />
              <span>Studioに戻る</span>
           </Link>

        </div>

      </div>
    </div>
  );
}