// src/app/routes/marketing/LandingPage.tsx
import { useCallback, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthContext } from "@/features/auth/AuthProvider";
import { Sparkles, ArrowRight, CheckCircle2, Heart, Wand2, UserPlus } from "lucide-react";

/**
 * Geminiでの画像生成をサポートするプレースホルダーコンポーネント
 * ※ 画像を生成したら、このコンポーネントを <img src="..." className="..." alt="..." /> に差し替えてください。
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
  <div className={`relative overflow-hidden bg-brand-bg-soft border-2 border-dashed border-brand-primary/30 flex flex-col items-center justify-center p-6 text-center group ${className}`}>
    <div className="absolute inset-0 bg-gradient-to-tr from-brand-primary/10 to-transparent pointer-events-none" />
    <span className="text-brand-primary/80 font-black text-xl md:text-2xl tracking-wider mb-3">
      {text}
    </span>
    <div className="bg-white/80 backdrop-blur-sm p-4 rounded-xl border border-brand-primary/20 w-full max-w-sm">
      <p className="text-[10px] sm:text-xs text-brand-text-muted font-medium text-left leading-relaxed">
        <strong className="text-brand-primary block mb-1">🤖 Gemini プロンプト案:</strong>
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

  // ゲストとして開始する処理
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
    <div className="relative min-h-screen bg-white text-brand-text font-sans overflow-x-hidden selection:bg-brand-primary-soft selection:text-brand-primary">
      
      {/* 追従ヘッダー */}
      <header className="fixed z-50 w-full h-[72px] bg-white/90 backdrop-blur-md border-b border-brand-border px-4 sm:px-6 flex justify-between items-center shadow-sm">
        <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-primary to-brand-mint flex items-center justify-center text-white font-black text-[11px] shadow-sm">
            AP!
          </div>
          <span className="text-xl font-black text-brand-text tracking-tight hidden sm:block">
            あくすたポン！
          </span>
        </Link>
        
        <div className="flex gap-2 sm:gap-4 items-center">
          {isAuth ? (
            <Link 
              to="/app/room"
              className="px-6 py-2.5 rounded-full text-sm font-bold bg-brand-primary text-white hover:bg-brand-primary-hover transition-colors shadow-sm"
            >
              マイルームへ
            </Link>
          ) : (
            <>
              {/* PC向け: ログインと新規登録 */}
              <Link 
                to="/login"
                className="px-3 py-2 text-sm font-bold text-brand-text-muted hover:text-brand-primary transition-colors hidden md:block"
              >
                ログイン
              </Link>
              <Link 
                to="/register"
                className="px-4 py-2 rounded-full text-sm font-bold text-brand-primary border border-brand-primary/30 hover:bg-brand-primary-soft transition-colors hidden md:block"
              >
                新規登録
              </Link>

              {/* ゲスト開始ボタン */}
              <button 
                onClick={handleStartCreate}
                disabled={isNavigating}
                className="px-5 py-2.5 rounded-full text-sm font-bold bg-gradient-to-r from-brand-primary to-brand-mint text-white hover:opacity-90 transition-all shadow-md hover:shadow-lg disabled:opacity-50 flex items-center gap-2"
              >
                {isNavigating ? "準備中..." : "ゲストでお試し"}
                {!isNavigating && <ArrowRight size={16} />}
              </button>
            </>
          )}
        </div>
      </header>

      {/* メインコンテンツ（ヘッダー分の余白をとる） */}
      <main className="pt-[72px]">
        
        {/* 1. ヒーローセクション（ファーストビュー） */}
        <section className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 py-12 md:py-20 flex flex-col lg:flex-row items-center gap-12">
          {/* 左側：コピーとアクションボタン群 */}
          <div className="flex-1 text-center lg:text-left z-10 w-full">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-primary-soft text-brand-primary text-sm font-bold mb-6">
              <Sparkles size={16} />
              <span>スマホで1個から！専用アプリ不要</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold leading-[1.2] tracking-tight mb-6">
              思い出も、推しも。<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-primary to-brand-mint">
                アクリルに閉じ込めて。
              </span>
            </h1>
            
            <p className="text-brand-text-muted text-base md:text-lg leading-relaxed mb-8 font-medium">
              写真を選ぶだけで、AIが自動で背景を切り抜き。<br className="hidden md:block" />
              世界にひとつだけのアクリルスタンドを、<br className="hidden md:block" />
              スマホから簡単ステップでお届けします。
            </p>
            
            {/* アクションボタン群 */}
            <div className="flex flex-col sm:flex-row flex-wrap justify-center lg:justify-start gap-4 mt-8 w-full">
              <button
                onClick={handleStartCreate}
                disabled={isNavigating}
                className="px-8 py-4 rounded-full font-bold text-lg text-white bg-gradient-to-r from-brand-primary to-brand-mint hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-brand-primary/30 inline-flex items-center justify-center gap-2 w-full sm:w-auto"
              >
                {isNavigating ? "移動中..." : "ゲストとして作ってみる"}
                {!isNavigating && <ArrowRight size={20} />}
              </button>
              
              <Link
                to="/register"
                className="px-8 py-4 rounded-full font-bold text-lg text-brand-primary bg-white border-2 border-brand-primary/30 hover:border-brand-primary hover:bg-brand-primary-soft transition-all inline-flex items-center justify-center gap-2 w-full sm:w-auto"
              >
                <UserPlus size={20} />
                新規登録（無料）
              </Link>
            </div>
            
            <p className="mt-6 text-sm text-brand-text-muted font-medium">
              すでにアカウントをお持ちの方は <Link to="/login" className="text-brand-primary underline hover:text-brand-primary-hover font-bold">こちらからログイン</Link>
            </p>
            
            {/* 3つのメリットバッジ */}
            <div className="mt-10 flex flex-wrap justify-center lg:justify-start gap-4">
              {['AI自動切り抜き', '1個から作成OK', '最短3日でお届け'].map((text, i) => (
                <div key={i} className="flex items-center gap-1.5 text-sm font-bold text-brand-text">
                  <CheckCircle2 size={18} className="text-brand-mint" />
                  {text}
                </div>
              ))}
            </div>
          </div>

          {/* 右側：メインビジュアル */}
          <div className="flex-1 w-full relative">
            <div className="absolute inset-0 bg-gradient-to-tr from-brand-primary/20 to-y2k-pink/20 rounded-[3rem] transform rotate-3 scale-105" />
            <ImagePlaceholder 
              className="w-full aspect-square md:aspect-[4/3] rounded-[3rem] shadow-2xl relative z-10 bg-white"
              text="Hero Image"
              prompt="明るい窓際の白いテーブル。自然光を浴びてキラキラ輝く、透明なアクリルスタンド（幼児の可愛い写真と、アニメ風キャラクターのイラストのアクスタが並んでいる）。背景は少しボケていて爽やかで高品質な実写スタイル。"
            />
          </div>
        </section>

        {/* 2. 用途提案 */}
        <section className="w-full bg-brand-bg-soft py-20 md:py-32">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <h2 className="text-3xl md:text-4xl font-extrabold text-center mb-16 tracking-tight">
              あなたなら、何を飾る？
            </h2>

            <div className="space-y-20 md:space-y-32">
              <div className="flex flex-col md:flex-row items-center gap-10 md:gap-16">
                <div className="w-full md:w-1/2">
                  <ImagePlaceholder 
                    className="w-full aspect-[4/3] rounded-[2.5rem] shadow-xl"
                    text="Family & Kids"
                    prompt="おしゃれなカフェの木製テーブル。コーヒーカップの横に、笑顔の子供（幼児）のアクリルスタンドが飾られている。太陽の光が入り、暖かくノスタルジックな雰囲気の実写写真。"
                  />
                </div>
                <div className="w-full md:w-1/2 space-y-6">
                  <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center text-brand-primary shadow-md">
                    <Heart size={28} />
                  </div>
                  <h3 className="text-3xl font-bold">子どもの成長を、飾れる思い出に。</h3>
                  <p className="text-brand-text-muted text-lg leading-relaxed font-medium">
                    スマホの中に眠っている、とびきりの笑顔。卒園式や七五三の晴れ姿。<br />
                    アルバムに閉じるだけでなく、机の上でいつでも目が合うアクリルスタンドにしませんか？おじいちゃん・おばあちゃんへのプレゼントにも大人気です。
                  </p>
                </div>
              </div>

              <div className="flex flex-col md:flex-row-reverse items-center gap-10 md:gap-16">
                <div className="w-full md:w-1/2">
                  <ImagePlaceholder 
                    className="w-full aspect-[4/3] rounded-[2.5rem] shadow-xl"
                    text="Oshi & Anime"
                    prompt="薄暗い部屋のデスク周り。LEDネオンライト（ピンクや水色）に照らされた、アニメキャラクターの自作イラストのアクリルスタンド。周りには可愛い小物や缶バッジが並ぶ「祭壇」風のレイアウト。エモくてサイバーポップな雰囲気。"
                  />
                </div>
                <div className="w-full md:w-1/2 space-y-6">
                  <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center text-y2k-pink shadow-md">
                    <Sparkles size={28} />
                  </div>
                  <h3 className="text-3xl font-bold">世界にひとつの、私だけの祭壇。</h3>
                  <p className="text-brand-text-muted text-lg leading-relaxed font-medium">
                    頑張って描いたオリジナルイラストや、大好きな推しのベストショット。<br />
                    AIが髪の毛の先まで綺麗に透過し、ホログラムやY2K風のエフェクトでさらに可愛く盛れます。自分の部屋に最強の祭壇を作りましょう。
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 3. 作成ステップ */}
        <section className="w-full py-20 md:py-32 px-4 sm:px-6 max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-4">
              作り方は、とっても簡単
            </h2>
            <p className="text-brand-text-muted text-lg font-medium">
              アプリのインストール不要。Webブラウザから今すぐ作れます。
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 md:gap-12">
            <div className="flex flex-col">
              <ImagePlaceholder 
                className="w-full aspect-[4/5] rounded-[2rem] shadow-lg mb-8"
                text="Step 1: 画像を選ぶ"
                prompt="スマートフォンを手に持ち、写真フォルダから画像を選んでいる手元の実写写真。画面には可愛い写真が並んでいる。明るく清潔感のある背景。"
              />
              <div className="flex items-center gap-4 mb-3">
                <div className="w-8 h-8 rounded-full bg-brand-primary text-white font-bold flex items-center justify-center">1</div>
                <h4 className="text-xl font-bold">お気に入りの1枚を選ぶ</h4>
              </div>
              <p className="text-brand-text-muted font-medium leading-relaxed pl-12">
                スマホやパソコンに保存されている写真やイラストをアップロードします。
              </p>
            </div>

            <div className="flex flex-col">
              <ImagePlaceholder 
                className="w-full aspect-[4/5] rounded-[2rem] shadow-lg mb-8"
                text="Step 2: AI自動透過"
                prompt="スマートフォンの画面の中で、被写体（人物）の背景が魔法のようにキラキラとしたエフェクトと共に消え、透明に切り抜かれている合成イメージ。ポップな雰囲気。"
              />
              <div className="flex items-center gap-4 mb-3">
                <div className="w-8 h-8 rounded-full bg-brand-primary text-white font-bold flex items-center justify-center">2</div>
                <h4 className="text-xl font-bold">AIにおまかせ編集</h4>
              </div>
              <p className="text-brand-text-muted font-medium leading-relaxed pl-12">
                面倒な背景の切り抜きはAIが数秒で完了！3D画面で完成イメージをグリグリ動かして確認できます。
              </p>
            </div>

            <div className="flex flex-col">
              <ImagePlaceholder 
                className="w-full aspect-[4/5] rounded-[2rem] shadow-lg mb-8"
                text="Step 3: お家へお届け"
                prompt="クラフト素材の可愛い小さなダンボール箱が開いており、中から緩衝材と一緒に完成した透明なアクリルスタンドが顔を出している実写写真。届いたときのワクワク感。"
              />
              <div className="flex items-center gap-4 mb-3">
                <div className="w-8 h-8 rounded-full bg-brand-primary text-white font-bold flex items-center justify-center">3</div>
                <h4 className="text-xl font-bold">そのまま注文・届く</h4>
              </div>
              <p className="text-brand-text-muted font-medium leading-relaxed pl-12">
                カートに入れて購入すれば、数日後には高品質な実物がお手元に届きます。
              </p>
            </div>
          </div>
        </section>

        {/* 4. ボトムCTA（最終アクション） */}
        <section className="w-full px-4 sm:px-6 pb-24">
          <div className="max-w-5xl mx-auto bg-gradient-to-br from-brand-primary-soft to-brand-mint/20 rounded-[3rem] p-10 md:p-20 text-center shadow-2xl relative overflow-hidden border border-brand-primary/10">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/40 blur-3xl rounded-full pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-brand-primary/20 blur-3xl rounded-full pointer-events-none" />
            
            <h2 className="relative z-10 text-3xl md:text-5xl font-extrabold mb-6 tracking-tight">
              さあ、あなただけの<br className="sm:hidden" />アクスタを作ろう。
            </h2>
            <p className="relative z-10 text-brand-text-muted text-lg font-medium mb-12">
              シミュレーションと3Dギャラリーでの展示は完全無料です。
            </p>
            
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4 relative z-10 w-full max-w-2xl mx-auto">
              {/* ゲストボタン */}
              <button
                onClick={handleStartCreate}
                disabled={isNavigating}
                className="w-full sm:w-auto px-10 py-5 rounded-full font-bold text-xl text-white bg-gradient-to-r from-brand-primary to-brand-mint hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-brand-primary/30 inline-flex items-center justify-center gap-3"
              >
                {isNavigating ? "準備中..." : "ゲストでお試し"}
                {!isNavigating && <Wand2 size={24} />}
              </button>

              {/* 新規登録ボタン */}
              <Link
                to="/register"
                className="w-full sm:w-auto px-10 py-5 rounded-full font-bold text-xl text-brand-primary bg-white border-2 border-brand-primary/30 hover:border-brand-primary hover:bg-brand-primary-soft transition-all shadow-lg inline-flex items-center justify-center gap-3"
              >
                <UserPlus size={24} />
                アカウントを作る
              </Link>
            </div>

            {/* ログインリンク */}
            <div className="relative z-10 mt-8 text-brand-text-muted font-medium">
              登録済みの方は <Link to="/login" className="text-brand-primary underline hover:text-brand-primary-hover font-bold">こちらからログイン</Link>
            </div>
          </div>
        </section>

      </main>
    </div>
  );
}