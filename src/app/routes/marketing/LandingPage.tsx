// src/app/routes/marketing/LandingPage.tsx
import { useCallback, useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthContext } from "@/features/auth/AuthProvider";
import { ArrowRight, CheckCircle, Heart, Camera, UserPlus, Sparkles, Wand2, MousePointer2, X, Loader2, UploadCloud } from "lucide-react";
import { cn } from "@/shared/utils/cn";

// --- 3DプレビューとAI処理用のインポート ---
import { useExhibitEditorStore, EditorStoreContext } from "@/features/exhibits/hooks/useExhibitEditorStore";
import { ExhibitPreview3D } from "@/features/exhibits/components/ExhibitEditorModal/ExhibitPreview3D";
import { runRembg } from "@/shared/utils/imageProcessingFromLambda";
import { useExhibitImageUpload } from "@/features/exhibits/hooks/useExhibitImageUpload";

/**
 * Geminiでの画像生成をサポートするプレースホルダーコンポーネント
 */
const ImagePlaceholder = ({ 
  text, prompt, className = "" 
}: { text: string; prompt: string; className?: string; }) => (
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

// --- ダミーの3Dアクスタ用画像（上品なゴールド系のSVG） ---
const DUMMY_FG_IMG = "data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='500' viewBox='0 0 400 500'%3E%3Cdefs%3E%3ClinearGradient id='grad' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' style='stop-color:%23C5A880;stop-opacity:1' /%3E%3Cstop offset='100%25' style='stop-color:%23D9C5B2;stop-opacity:1' /%3E%3C/linearGradient%3E%3C/defs%3E%3Cpath d='M200,50 C300,50 350,150 350,250 C350,350 300,450 200,450 C100,450 50,350 50,250 C50,150 100,50 200,50 Z' fill='url(%23grad)' opacity='0.9'/%3E%3Ctext x='200' y='240' font-family='serif' font-size='28' fill='%23ffffff' text-anchor='middle' letter-spacing='4'%3E3D PREVIEW%3C/text%3E%3Ctext x='200' y='270' font-family='sans-serif' font-size='11' fill='%23ffffff' text-anchor='middle' opacity='0.8' letter-spacing='2'%3ESAMPLE ARTWORK%3C/text%3E%3C/svg%3E";

/**
 * LP上で安全に3D体験をさせるためのインタラクティブコンポーネント
 * ユーザーが画像をアップロードし、その場でAI透過を体験できます。
 */
const Interactive3DHero = ({ onStartCreate }: { onStartCreate: () => void }) => {
  const { ensureGuestId } = useAuthContext();
  const { uploadImageAndGetUrl } = useExhibitImageUpload();
  
  const [isInteractive, setIsInteractive] = useState(false);
  const[isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // 3Dプレビューに渡すダミーデータストア
  const store = useExhibitEditorStore({
    foregroundUrl: DUMMY_FG_IMG,
    styleConfig: { depth: 8, foregroundEffect: "none", backgroundEffect: "none" },
  });

  // 画像アップロード＆透過処理
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // ファイル選択時点でインタラクティブモードとローディングをオン
    setIsInteractive(true);
    setIsProcessing(true);

    try {
      // S3アップロード用の認可情報を取得するためゲストIDを確保
      await ensureGuestId();
      
      // Rembgで自動切り抜き（大サイズ用に uploader も渡す）
      const resultBlob = await runRembg(file, "isnet-general-use", uploadImageAndGetUrl);
      
      // 処理結果を3Dプレビューの前景として適用
      store.setLayerBlob("foreground", resultBlob);
    } catch (err) {
      console.error("Cutout error:", err);
      alert("画像の処理に失敗しました。別の画像をお試しください。");
    } finally {
      setIsProcessing(false);
      // 同じ画像を再度選べるようにinputをリセット
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  // 3D操作中はページ全体のスクロールをロックする
  useEffect(() => {
    if (isInteractive) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  },[isInteractive]);

  return (
    <div className="relative w-full aspect-square md:aspect-[4/3] rounded-[2rem] shadow-elegant bg-brand-bg-soft overflow-hidden border border-brand-border">
      
      {/* 3Dキャンバス本体 */}
      <EditorStoreContext.Provider value={store}>
        <div className={cn("w-full h-full transition-all duration-500", !isInteractive && "pointer-events-none opacity-90 blur-[2px]")}>
          <ExhibitPreview3D />
        </div>
      </EditorStoreContext.Provider>
      
      {/* オーバーレイUI */}
      {!isInteractive ? (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-transparent gap-4">
           {/* タッチして操作 */}
           <button 
             onClick={() => setIsInteractive(true)}
             className="bg-white/90 backdrop-blur-sm px-8 py-3.5 rounded-full shadow-lg border border-brand-border text-brand-text font-serif tracking-widest text-[16px] flex items-center gap-3 hover:bg-brand-primary hover:text-white hover:border-brand-primary transition-all duration-300 transform hover:scale-105"
           >
             <MousePointer2 size={16} strokeWidth={1.5} />
             3Dを触る
           </button>
           
           {/* 画像をアップロードして試す */}
           <label className="bg-brand-secondary/90 text-white backdrop-blur-sm px-8 py-3.5 rounded-full shadow-lg border border-brand-secondary font-serif tracking-widest text-[16px] flex items-center gap-3 hover:bg-black transition-all duration-300 transform hover:scale-105 cursor-pointer">
             <UploadCloud size={16} strokeWidth={1.5} />
             アクスタ試作
             <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleFileUpload} />
           </label>
        </div>
      ) : (
        <>
          {/* ローディングオーバーレイ */}
          {isProcessing && (
            <div className="absolute inset-0 z-30 bg-white/70 backdrop-blur-md flex flex-col items-center justify-center transition-all animate-in fade-in">
              <Loader2 className="animate-spin text-brand-primary mb-4" size={32} strokeWidth={1.5} />
              <div className="text-brand-text font-serif text-sm tracking-widest uppercase animate-pulse">
                AI Magic in Progress...
              </div>
            </div>
          )}

          {/* 閉じるボタン */}
          <div className="absolute top-4 right-4 z-20 animate-in fade-in zoom-in duration-300">
            <button 
              onClick={() => setIsInteractive(false)}
              className="bg-brand-secondary text-white px-5 py-2.5 rounded-full font-serif tracking-widest text-[10px] uppercase shadow-lg border border-brand-secondary hover:bg-black transition-colors flex items-center gap-2"
            >
              <X size={14} strokeWidth={1.5} />
              Close
            </button>
          </div>
          
          {/* ダイレクト誘導ボタンと再アップロード */}
          {!isProcessing && (
            <div className="absolute bottom-6 left-0 right-0 z-20 flex flex-wrap gap-3 animate-in fade-in duration-500 justify-center px-4">
              <button 
                onClick={(e) => { e.stopPropagation(); onStartCreate(); }}
                className="bg-brand-primary text-white px-6 py-3 rounded-full font-serif tracking-widest text-[10px] uppercase shadow-lg hover:bg-brand-primary-hover transition-colors flex items-center gap-2"
              >
                <Wand2 size={14} strokeWidth={1.5} />
                Create Yours
              </button>
              <label className="bg-white text-brand-text px-5 py-3 rounded-full font-serif tracking-widest text-[10px] uppercase shadow-lg border border-brand-border hover:border-brand-primary hover:text-brand-primary transition-colors flex items-center gap-2 cursor-pointer">
                <UploadCloud size={14} strokeWidth={1.5} />
                Try Another
                <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
              </label>
            </div>
          )}

          {/* 操作ヒント */}
          <div className="absolute top-6 left-6 text-center pointer-events-none z-10 animate-in fade-in duration-500 delay-300 hidden sm:block">
            <span className="bg-white/80 text-brand-text px-4 py-2 rounded-full backdrop-blur-md border border-brand-border font-light tracking-widest text-[9px] uppercase shadow-sm">
              Drag to rotate / Scroll to zoom
            </span>
          </div>
        </>
      )}
    </div>
  );
};


export function LandingPage() {
  const navigate = useNavigate();
  const { status, ensureGuestId } = useAuthContext();
  const isAuth = status === "authenticated";
  
  const [isNavigating, setIsNavigating] = useState(false);

  const handleStartCreate = useCallback(async () => {
    setIsNavigating(true);
    try {
      await ensureGuestId();
      navigate("/app/room");
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
                onClick={() => navigate("/login")}
                disabled={isNavigating}
                className="px-6 py-2.5 rounded-full text-[11px] font-light tracking-widest uppercase bg-brand-secondary text-white hover:bg-black transition-all shadow-md disabled:opacity-50 flex items-center gap-2"
              >
                {isNavigating ? "Loading..." : "ログイン / 登録"}
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
                {isNavigating ? "Entering Studio..." : "爆速アクスタシミュレーション"}
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
            {/* 新しいインタラクティブ3Dプレビュー */}
            <Interactive3DHero onStartCreate={handleStartCreate} />
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
                {isNavigating ? "Loading..." : "ゲストログイン"}
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