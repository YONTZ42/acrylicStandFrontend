// src/app/routes/marketing/LandingPage.tsx
import { cn } from "@/shared/utils/cn";
import { useLpExhibitStartFlow } from "@/app/routes/marketing/hooks/useLpExhibitStartFlow";

export function LandingPage() {
  const { 
    startFlow, 
    showPicker, 
    setShowPicker, 
    isLoading,
    error,
    status,
  } = useLpExhibitStartFlow();

  const isAuth = status === "authenticated";

  return (
    
    <div className="relative min-h-screen bg-[#080808] text-white flex flex-col items-center justify-center p-6">
      {/* ヒーローセクション */}
      <div className="max-w-2xl text-center space-y-8">
        <h1 className="text-5xl md:text-7xl font-light tracking-tighter">
          Digital <br />
          <span className="italic font-serif">Miniature</span> Museum
        </h1>
        
        <p className="text-white/60 text-lg font-light leading-relaxed">
          大切な一枚を、ガラスの中に封じ込める。 <br />
          あなただけの静かな展示空間を、今すぐここに。
        </p>

        {error && (
          <p className="mt-4 text-red-400 text-xs font-light">{error}</p>
        )}
        {/* メインアクション */}
        <div className="pt-10">
          <button
            onClick={startFlow}
            disabled={isLoading}
            className={cn(
              "px-10 py-4 rounded-full border border-white/20 bg-white/5 hover:bg-white/10 transition-all duration-500",
              "text-sm tracking-[0.2em] uppercase",
              isLoading && "opacity-50 cursor-not-allowed"
            )}
          >
            {isLoading ? "Preparing Room..." : isAuth ? "Enter Your Museum" : "Create Your First Exhibit"}
          </button>
        </div>
      </div>

      {/* ImagePicker モーダル (Guest用) */}
      {showPicker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4">
          <div className="w-full max-w-md space-y-6">
            <div className="flex justify-between items-end">
              <div>
                <h2 className="text-xl font-light">Select an Image</h2>
                <p className="text-xs text-white/40 mt-1">この画像が最初の展示物になります</p>
              </div>
              <button 
                onClick={() => setShowPicker(false)}
                className="text-xs uppercase tracking-widest text-white/60 hover:text-white"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ローディングオーバーレイ */}
      {isLoading && (
        <div className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center space-y-4">
          <div className="w-12 h-px bg-white/20 overflow-hidden">
            <div className="w-full h-full bg-white animate-[loading_1.5s_infinite]" />
          </div>
          <p className="text-[10px] uppercase tracking-[0.3em] text-white/40">Curating your space</p>
        </div>
      )}

      <style>{`
        @keyframes loading {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
}