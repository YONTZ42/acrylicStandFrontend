import { useState } from "react";
import { Scissors, Sparkles } from "lucide-react";
import { cn } from "@/shared/utils/cn";
import { useEditorContext } from "@/features/exhibits/hooks/useExhibitEditorStore";
import { runRembg, runGemini, type RembgModel } from "@/shared/utils/imageProcessingFromLambda";
import { useExhibitImageUpload } from "@/features/exhibits/hooks/useExhibitImageUpload";
import { useToast } from "@/app/providers/ToastProvider";

type Props = {
  onStartProcess: (msg: string) => void;
  onEndProcess: () => void;
};

const REMBG_MODELS: { id: RembgModel; name: string; desc: string }[] =[
  { id: "isnet-general-use", name: "高精度 (汎用)", desc: "一番きれいに抜ける魔法" },
  { id: "isnet-anime", name: "イラスト特化", desc: "アニメ画像に最適" },
  { id: "birefnet-general-lite", name: "高速・軽量", desc: "サクッと切り抜く" },
];

export function StudioTabCutout({ onStartProcess, onEndProcess }: Props) {
  const store = useEditorContext();
  const toast = useToast();
  const { uploadImageAndGetUrl } = useExhibitImageUpload();
  const[selectedModel, setSelectedModel] = useState<RembgModel>("isnet-general-use");

  // 背景切り抜き (Rembg)
  const handleCutout = async () => {
    if (!store.originalBlob) return toast.error("画像がありません");
    onStartProcess("背景を魔法で消し去っています... 🪄");
    try {
      const resultBlob = await runRembg(store.originalBlob, selectedModel, uploadImageAndGetUrl);
      store.setLayerBlob("foreground", resultBlob);
      toast.success("きれいに切り抜けました！");
    } catch (e) {
      console.error(e);
      toast.error("切り抜きに失敗しました");
    } finally {
      onEndProcess();
    }
  };

  // 画風変換 (Gemini i2i)
  const handleAIStyle = async (prompt: string, styleName: string) => {
    if (!store.originalBlob) return;
    onStartProcess(`${styleName}風に変換中... ✨`);
    try {
      const resultBlob = await runGemini(prompt, store.originalBlob, uploadImageAndGetUrl);
      store.updateState({ originalBlob: resultBlob }); // 元画像を上書き
      // そのまま自動で切り抜きも走らせる
      onStartProcess("背景を整理しています... ✂️");
      const cutoutBlob = await runRembg(resultBlob, "isnet-anime", uploadImageAndGetUrl);
      store.setLayerBlob("foreground", cutoutBlob);
      toast.success(`${styleName}になりました！`);
    } catch (e) {
      console.error(e);
      toast.error("変換に失敗しました");
    } finally {
      onEndProcess();
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. 背景切り抜きセクション */}
      <section className="bg-brand-bg-soft p-4 rounded-[1.5rem] border border-brand-border-strong">
        <h3 className="text-xs font-extrabold text-brand-text-muted mb-3 flex items-center gap-1">
          <Scissors size={14} /> 背景を消してアクスタにする
        </h3>
        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {REMBG_MODELS.map((m) => (
              <button
                key={m.id}
                onClick={() => setSelectedModel(m.id)}
                className={cn(
                  "p-3 rounded-xl border text-left transition-all",
                  selectedModel === m.id 
                    ? "border-brand-primary bg-brand-primary-soft shadow-sm" 
                    : "border-brand-border bg-white hover:border-brand-primary/50"
                )}
              >
                <div className="text-xs font-extrabold text-brand-text">{m.name}</div>
                <div className="text-[10px] font-bold text-brand-text-muted mt-0.5">{m.desc}</div>
              </button>
            ))}
          </div>
          <button 
            onClick={handleCutout}
            className="w-full py-3 rounded-xl bg-brand-text text-white text-sm font-extrabold shadow-md active:scale-95 transition-transform"
          >
            切り抜く！
          </button>
        </div>
      </section>

      {/* 2. 画風変換セクション */}
      <section>
        <h3 className="text-xs font-extrabold text-brand-text-muted mb-3 flex items-center gap-1">
          <Sparkles size={14} /> 魔法のフィルター
        </h3>
        <div className="flex gap-3 overflow-x-auto pb-2 custom-scrollbar">
          <button 
            onClick={() => handleAIStyle("Transform the subject into high quality flat color anime style illustration.", "アニメ")}
            className="flex-shrink-0 w-28 aspect-square rounded-[1.5rem] border border-brand-border bg-brand-bg flex flex-col items-center justify-center gap-2 hover:border-brand-primary/50 hover:bg-brand-primary-soft transition-colors active:scale-95"
          >
            <span className="text-3xl">🌸</span>
            <span className="text-xs font-extrabold text-brand-text">アニメ風</span>
          </button>
          <button 
            onClick={() => handleAIStyle("Transform the subject into 16-bit retro pixel art.", "ピクセル")}
            className="flex-shrink-0 w-28 aspect-square rounded-[1.5rem] border border-brand-border bg-brand-bg flex flex-col items-center justify-center gap-2 hover:border-brand-primary/50 hover:bg-brand-primary-soft transition-colors active:scale-95"
          >
            <span className="text-3xl">👾</span>
            <span className="text-xs font-extrabold text-brand-text">ピクセル化</span>
          </button>
        </div>
      </section>
    </div>
  );
}