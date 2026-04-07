// src/app/routes/marketing/LandingPage.tsx
import { useCallback, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthContext } from "@/features/auth/AuthProvider";
import { ArrowRight, CheckCircle, Heart, Camera, UserPlus, Sparkles, Wand2 } from "lucide-react";
import { cn } from "@/shared/utils/cn";

/**
 * Geminiでの画像生成をサポートするプレースホルダーコンポーネント
 */
const ImagePlaceholder = ({ 
  text, 
  prompt, 
  className = "" 
}: { 
  text: string; 
  prompt: string; 
  className?: string; 
}) => (
  <div className={cn("relative overflow-hidden bg-brand-bg border border-brand-border flex flex-col items-center justify-center p-8 text-center group", className)}>
    <div className="absolute inset-0 bg-gradient-to-tr from-brand-primary/5 to-transparent pointer-events-none" />
    <span className="text-brand-primary/60 font-serif text-2xl tracking-widest mb-4">
      {text}
    </span>
    <div className="bg-white/90 backdrop-blur-md p-5 rounded-xl border border-brand-border w-full max-w-sm shadow-sm">
      <p className="text-[10px] text-brand-text-muted font-light tracking-wide text-left leading-relaxed">
        <strong className="text-brand-primary block mb-1.5 uppercase tracking-widest">Prompt Idea:</strong>
        {prompt}
      </p>
    </div>
  </div>
);

export function LandingPage() {
  const navigate = useNavigate();
  const { status, ensureGuestId } = useAuthContext();
  const isAuth = status === "authenticated";
  
  const [isNavigating, setIsNavigating] = useState(false);

  const handleStartCreate = useCallback(async () => {
    setIsNavigating(true);
    try {
      await ensureGuestId();
      navigate("/app/studio");
    } catch (e) {
      console.error("Failed to ensure guest session:", e);
      setIsNavigating(false);
    }
  }, [ensureGuestId, navigate]);

  return (
    <div className="relative min-h-screen bg-brand-bg text-brand-text font-sans overflow-x-hidden selection:bg-brand-primary-soft selection:text-brand-text">
      
      {/* エレガントな追従ヘッダー */}
      <header className="fixed z-50 w-full h-16 bg-white/90 backdrop-blur-md border-b border-brand-border px-4 sm:px-6 flex justify-between items-center shadow-sm">
        <Link to="/" className="flex items-center gap-3 hover:opacity-70 transition-opacity">
          <div className="w-8 h-8 rounded-lg bg-brand-primary flex items-center justify-center text-white font-serif font-bold text-xs shadow-sm">
            BX
          </div>
          <span className="text-lg font-serif font-bold text-brand-text tracking-widest hidden sm:block">
            バクスタ
          </span>
        </Link>
        
        <div className="flex gap-4 items-center">
          {isAuth ? (
            <Link 
              to="/app/room"
              className="px-6 py-2.5 rounded-full text-[11px] font-light tracking-widest uppercase bg-brand-primary text-white hover:bg-brand-primary-hover transition-colors shadow-sm"
            >
              My Room
            </Link>
          ) : (
            <>
              <Link 
                to="/login"
                className="px-3 py-2 text-[11px] font-light tracking-widest uppercase text-brand-text-muted hover:text-brand-primary transition-colors hidden md:block"
              >
                Sign In
              </Link>
              <Link 
                to="/register"
                className="px-5 py-2.5 rounded-full text-[10px] font-light tracking-widest uppercase text-brand-text border border-brand-border hover:border-brand-primary hover:text-brand-primary transition-colors hidden md:block"
              >
                Create Account
              </Link>

              <button 
                onClick={handleStartCreate}
                disabled={isNavigating}
                className="px-6 py-2.5 rounded-full text-[11px] font-light tracking-widest uppercase bg-brand-secondary text-white hover:bg-black transition-all shadow-md disabled:opacity-50 flex items-center gap-2"
              >
                {isNavigating ? "Loading..." : "Try for Free"}
              </button>
            </>
          )}
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="pt-16">
        
        {/* 1. ヒーローセクション */}
        <section className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 py-16 md:py-24 flex flex-col lg:flex-row items-center gap-16">
          <div className="flex-1 text-center lg:text-left z-10 w-full mt-8 lg:mt-0">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-brand-primary/30 text-brand-primary text-[10px] font-light tracking-widest uppercase mb-8 bg-white/50 backdrop-blur-sm">
              <Sparkles size={12} strokeWidth={1.5} />
              <span>Premium Acrylic Art</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif leading-[1.3] tracking-wide mb-6 text-brand-text">
              色褪せない思い出を、<br />
              <span className="text-brand-primary italic">透き通るアクリルに。</span>
            </h1>
            
            <p className="text-brand-text-muted text-sm md:text-base leading-relaxed mb-10 font-light tracking-wider max-w-xl mx-auto lg:mx-0">
              特別な瞬間の写真も、心惹かれる愛おしい推しも。<br className="hidden md:block" />
              AIが背景を美しく取り除き、上質なアクリルスタンドへ仕立てます。<br className="hidden md:block" />
              あなたの日常に、触れられる形のアートを。
            </p>
            
            <div className="flex flex-col sm:flex-row flex-wrap justify-center lg:justify-start gap-4 mt-8 w-full">
              <button
                onClick={handleStartCreate}
                disabled={isNavigating}
                className="px-8 py-4 rounded-full font-light text-sm tracking-widest uppercase text-white bg-brand-primary hover:bg-brand-primary-hover active:scale-95 transition-all shadow-md inline-flex items-center justify-center gap-3 w-full sm:w-auto"
              >
                {isNavigating ? "Entering Studio..." : "Experience for free"}
                {!isNavigating && <ArrowRight size={16} strokeWidth={1.5} />}
              </button>
            </div>
            
            <div className="mt-12 flex flex-wrap justify-center lg:justify-start gap-6">
              {['AIで自動切り抜き', '1個からオーダー可能', '高品質なクリアアクリル'].map((text, i) => (
                <div key={i} className="flex items-center gap-2 text-[11px] font-light tracking-widest text-brand-text-muted">
                  <CheckCircle size={14} strokeWidth={1.5} className="text-brand-primary/70" />
                  {text}
                </div>
              ))}
            </div>
          </div>

          <div className="flex-1 w-full relative">
            <div className="absolute inset-0 bg-brand-primary/5 rounded-[2rem] transform rotate-3 scale-105" />
            <ImagePlaceholder 
              className="w-full aspect-square md:aspect-[4/3] rounded-[2rem] shadow-elegant relative z-10 bg-white"
              text="Hero Image"
              prompt="自然光が差し込むリビングの白い大理石のテーブル。ドライフラワーの横に飾られた、赤ちゃんの笑顔の透明なアクリルスタンドと、洗練されたアニメ風キャラクターのアクスタ。シネマティックで上質な、Vogueのインテリア誌のような実写スタイルの写真。"
            />
          </div>
        </section>

        {/* 2. ユースケース提案（思い出 ＆ 推し活） */}
        <section className="w-full bg-brand-bg-soft py-24 md:py-32 border-y border-brand-border">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-20">
              <h2 className="text-xs font-light tracking-widest text-brand-text-muted uppercase mb-3">Concept</h2>
              <p className="text-3xl md:text-4xl font-serif tracking-wide text-brand-text">
                あなたなら、何を飾りますか？
              </p>
            </div>

            <div className="space-y-24 md:space-y-32">
              {/* 思い出 */}
              <div className="flex flex-col md:flex-row items-center gap-12 md:gap-16">
                <div className="w-full md:w-1/2">
                  <ImagePlaceholder 
                    className="w-full aspect-[4/3] rounded-[2rem] shadow-elegant bg-white"
                    text="Memories"
                    prompt="おだやかな午後の光が入る窓際のアンティーク調のチェスト。お気に入りの香水瓶やアクセサリーケースの横に、子供の記念写真のアクリルスタンドが上品に飾られている。あたたかくノスタルジックな雰囲気の実写写真。"
                  />
                </div>
                <div className="w-full md:w-1/2 space-y-6">
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-brand-primary border border-brand-border shadow-sm">
                    <Camera size={20} strokeWidth={1.5} />
                  </div>
                  <h3 className="text-3xl font-serif tracking-wide text-brand-text leading-tight">
                    過ぎ去る時間を、<br />触れられる形に。
                  </h3>
                  <p className="text-brand-text-muted text-sm leading-relaxed font-light tracking-wider">
                    お子様の無邪気な笑顔、大切な家族との記念日、愛するペットの何気ない仕草。<br /><br />
                    スマートフォンの中に眠っているかけがえのない記憶を、インテリアとして美しく飾れるアクリルスタンドへ。目にするたびに、あたたかい気持ちが蘇ります。
                  </p>
                </div>
              </div>

              {/* 推し活 */}
              <div className="flex flex-col md:flex-row-reverse items-center gap-12 md:gap-16">
                <div className="w-full md:w-1/2">
                  <ImagePlaceholder 
                    className="w-full aspect-[4/3] rounded-[2rem] shadow-elegant bg-white"
                    text="Favorites"
                    prompt="シックなグレーのデスク。間接照明に照らされた、洗練されたアニメ風キャラクターのアクリルスタンド。周りには単行本や一輪挿しの花が美しく配置されている。大人の女性の推し活スペースを表現した、クリーンで高級感のある実写スタイルの写真。"
                  />
                </div>
                <div className="w-full md:w-1/2 space-y-6">
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-brand-primary border border-brand-border shadow-sm">
                    <Heart size={20} strokeWidth={1.5} />
                  </div>
                  <h3 className="text-3xl font-serif tracking-wide text-brand-text leading-tight">
                    あなたの「好き」を、<br />上質なアートワークに。
                  </h3>
                  <p className="text-brand-text-muted text-sm leading-relaxed font-light tracking-wider">
                    心を込めて描いたイラストや、大好きな推しのベストショット。<br /><br />
                    AIが髪の毛の先まで繊細に切り抜き、ホログラムなどのエフェクトで特別な作品に昇華します。大人の女性のお部屋にも馴染む、洗練されたコレクションスペースを作りませんか。
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 3. 作成ステップ */}
        <section className="w-full py-24 md:py-32 px-4 sm:px-6 max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-xs font-light tracking-widest text-brand-text-muted uppercase mb-3">How it works</h2>
            <h3 className="text-3xl md:text-4xl font-serif tracking-wide text-brand-text">
              洗練された体験を、3ステップで。
            </h3>
          </div>

          <div className="grid md:grid-cols-3 gap-10 md:gap-16">
            <div className="flex flex-col">
              <ImagePlaceholder 
                className="w-full aspect-[4/5] rounded-3xl shadow-sm mb-8 bg-brand-bg border-none"
                text="Step 1"
                prompt="清潔感のある手元。最新のスマートフォンを持ち、写真フォルダから綺麗な画像を選んでいる実写写真。背景は白基調でクリーン。"
              />
              <div className="flex items-center gap-4 mb-4">
                <div className="w-6 h-6 rounded-full border border-brand-text text-brand-text font-serif text-xs flex items-center justify-center">1</div>
                <h4 className="text-lg font-serif tracking-wide text-brand-text">Select an Image</h4>
              </div>
              <p className="text-brand-text-muted font-light text-[13px] tracking-wider leading-relaxed pl-10">
                スマートフォンやPCから、アクリルスタンドにしたいとっておきの写真やイラストを選びます。
              </p>
            </div>

            <div className="flex flex-col">
              <ImagePlaceholder 
                className="w-full aspect-[4/5] rounded-3xl shadow-sm mb-8 bg-brand-bg border-none"
                text="Step 2"
                prompt="スマートフォンの画面。画像の背景が透過され、美しいアクリルスタンドの3Dモデルとして表示されている様子。クリーンでミニマルなUI。"
              />
              <div className="flex items-center gap-4 mb-4">
                <div className="w-6 h-6 rounded-full border border-brand-text text-brand-text font-serif text-xs flex items-center justify-center">2</div>
                <h4 className="text-lg font-serif tracking-wide text-brand-text">AI Magic</h4>
              </div>
              <p className="text-brand-text-muted font-light text-[13px] tracking-wider leading-relaxed pl-10">
                面倒な背景の切り抜きはAIが数秒で完了。3Dプレビューで完成イメージを細部まで確認できます。
              </p>
            </div>

            <div className="flex flex-col">
              <ImagePlaceholder 
                className="w-full aspect-[4/5] rounded-3xl shadow-sm mb-8 bg-brand-bg border-none"
                text="Step 3"
                prompt="上質な白いギフトボックスが開いており、緩衝材に包まれた透明で美しいアクリルスタンドが顔を出している実写写真。届いたときの高揚感。"
              />
              <div className="flex items-center gap-4 mb-4">
                <div className="w-6 h-6 rounded-full border border-brand-text text-brand-text font-serif text-xs flex items-center justify-center">3</div>
                <h4 className="text-lg font-serif tracking-wide text-brand-text">Order & Delivery</h4>
              </div>
              <p className="text-brand-text-muted font-light text-[13px] tracking-wider leading-relaxed pl-10">
                お気に入りの作品ができたらオーダー。数日後、丁寧に梱包された実物がお手元に届きます。
              </p>
            </div>
          </div>
        </section>

        {/* 4. ボトムCTA */}
        <section className="w-full px-4 sm:px-6 pb-32">
          <div className="max-w-4xl mx-auto bg-white rounded-[2rem] p-12 md:p-20 text-center shadow-elegant border border-brand-border relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-brand-primary/5 blur-3xl rounded-full pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-brand-primary/5 blur-3xl rounded-full pointer-events-none" />
            
            <h2 className="relative z-10 text-3xl md:text-5xl font-serif tracking-wide mb-6 text-brand-text">
              さあ、あなただけの作品を。
            </h2>
            <p className="relative z-10 text-brand-text-muted text-sm font-light tracking-wider mb-12">
              シミュレーションから展示まで、無料でお楽しみいただけます。
            </p>
            
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4 relative z-10 w-full">
              <button
                onClick={handleStartCreate}
                disabled={isNavigating}
                className="w-full sm:w-auto px-10 py-4 rounded-full font-light text-sm tracking-widest uppercase text-white bg-brand-secondary hover:bg-black active:scale-95 transition-all shadow-md inline-flex items-center justify-center gap-3"
              >
                {isNavigating ? "Loading..." : "Try for Free"}
                {!isNavigating && <Wand2 size={16} strokeWidth={1.5} />}
              </button>

              <Link
                to="/register"
                className="w-full sm:w-auto px-10 py-4 rounded-full font-light text-sm tracking-widest uppercase text-brand-text bg-white border border-brand-border hover:border-brand-text transition-all inline-flex items-center justify-center gap-3"
              >
                <UserPlus size={16} strokeWidth={1.5} />
                Create Account
              </Link>
            </div>

            <div className="relative z-10 mt-10 text-[11px] text-brand-text-muted font-light tracking-widest uppercase">
              Already have an account? <Link to="/login" className="text-brand-primary border-b border-brand-primary pb-0.5 hover:text-brand-primary-hover">Sign in</Link>
            </div>
          </div>
        </section>

      </main>
    </div>
  );
}