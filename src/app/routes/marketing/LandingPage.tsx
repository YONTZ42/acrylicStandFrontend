// src/app/routes/marketing/LandingPage.tsx
import { Link } from "react-router-dom";
import { useLpExhibitStartFlow } from "@/app/routes/marketing/hooks/useLpExhibitStartFlow";
import { ImageUploadCTA } from "@/app/routes/marketing/components/ImageUploadCTA";

export function LandingPage() {
  const { 
    status,
    error,
    isLoading,
    previewUrl,
    handleImageSelect,
    clearSelection,
    finalizeExhibition,
  } = useLpExhibitStartFlow();

  const isAuth = status === "authenticated";

  return (
    <div className="relative min-h-screen bg-brand-bg text-brand-text overflow-hidden font-sans selection:bg-brand-primary-soft selection:text-brand-primary flex flex-col">
      
      {/* エモいオーラ背景（推しカラーグラデーション） */}
      <div className="fixed top-[-20%] left-[-10%] w-[70vw] h-[70vw] bg-brand-primary/15 rounded-full blur-[120px] mix-blend-multiply opacity-80 pointer-events-none animate-pulse-slow" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[80vw] h-[80vw] bg-brand-accent/10 rounded-full blur-[150px] mix-blend-multiply opacity-70 pointer-events-none" />

      {/* ヘッダー */}
      <header className="relative w-full p-6 flex justify-between items-center z-50">
        <div className="text-xl font-bold tracking-tight text-brand-text flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-brand-primary animate-pulse"></span>
          Miniature Museum
        </div>
        
        <div className="flex gap-4">
          {isAuth ? (
            <Link 
              to="/app/galleries"
              className="px-6 py-2.5 rounded-full text-sm font-bold bg-brand-surface/80 backdrop-blur-md border border-brand-border text-brand-primary hover:bg-brand-primary-soft transition-colors shadow-sm"
            >
              マイルームへ
            </Link>
          ) : (
            <Link 
              to="/login"
              className="px-6 py-2.5 rounded-full text-sm font-bold bg-white/50 backdrop-blur-md border border-brand-border text-brand-text hover:bg-white/80 transition-colors shadow-sm"
            >
              ログイン
            </Link>
          )}
        </div>
      </header>

      {/* メインコンテンツ（中央配置） */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 pb-20 w-full max-w-3xl mx-auto">
        
        <div className="text-center space-y-6 mb-12 animate-fade-in-up">
          <h2 className="text-brand-accent font-bold tracking-[0.2em] text-sm uppercase">
            Digital Oshi Stand
          </h2>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-[1.2] tracking-tight">
            デジタル空間に、<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-primary to-brand-accent">
              あなただけの祭壇
            </span>を。
          </h1>
          <p className="text-brand-text-muted text-base md:text-lg leading-relaxed max-w-xl mx-auto font-medium">
            お気に入りの一枚をアップロードするだけ。<br />
            スマホの中に、光と影が美しい3Dのアクリルスタンドを飾りましょう。<br />
            いつでも推しに会える、静かで尊い空間へ。
          </p>
        </div>

        {error && (
          <div className="mb-6 text-brand-secondary text-sm font-bold bg-brand-secondary/10 py-3 px-6 rounded-xl animate-fade-in-up">
            {error}
          </div>
        )}

        {/* アクスタ作成CTAエリア */}
        <div className="w-full animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
          <ImageUploadCTA 
            previewUrl={previewUrl}
            isLoading={isLoading}
            onImageSelect={handleImageSelect}
            onClear={clearSelection}
            onSubmit={finalizeExhibition}
          />
        </div>

      </main>

      {/* カスタムアニメーション */}
      <style>{`
        .animate-fade-in-up { 
          animation: fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) both; 
        }
        .animate-pulse-slow { 
          animation: pulseOpacity 8s ease-in-out infinite; 
        }
        
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulseOpacity {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 0.9; }
        }
      `}</style>
    </div>
  );
}