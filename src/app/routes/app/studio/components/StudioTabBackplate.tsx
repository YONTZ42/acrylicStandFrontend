import { useState } from "react";
import { Layers, Wand2, X } from "lucide-react";
import { useEditorContext } from "@/features/exhibits/hooks/useExhibitEditorStore";
import { runGemini } from "@/shared/utils/imageProcessingFromLambda";
import { useExhibitImageUpload } from "@/features/exhibits/hooks/useExhibitImageUpload";
import { useToast } from "@/app/providers/ToastProvider";

type Props = {
  onStartProcess: (msg: string) => void;
  onEndProcess: () => void;
};

const PRESETS =[
  { id: "cyber", name: "サイバー都市", icon: "🌃", prompt: "A neon lit cyberpunk city street background, matching the atmosphere of the subject." },
  { id: "dream", name: "ゆめかわ", icon: "🦄", prompt: "A pastel dreamy magical girl background with clouds and sparkles, matching the subject." },
  { id: "stage", name: "ライブステージ", icon: "🎤", prompt: "A gorgeous idol live stage with spotlights and audience glow sticks, matching the subject." },
  { id: "nature", name: "大自然", icon: "🌿", prompt: "A beautiful sunny nature background with trees and flowers, matching the subject." },
];

export function StudioTabBackplate({ onStartProcess, onEndProcess }: Props) {
  const store = useEditorContext();
  const toast = useToast();
  const { uploadImageAndGetUrl } = useExhibitImageUpload();
  
  const[customPrompt, setCustomPrompt] = useState("");

  // 背景の生成
  const generateBackground = async (prompt: string, useSubjectAsRef: boolean) => {
    onStartProcess("最高にエモい背景を錬成中... 🌃");
    try {
      const refBlob = useSubjectAsRef ? (store.originalBlob || undefined) : undefined;
      const resultBlob = await runGemini(prompt, refBlob, uploadImageAndGetUrl);
      store.setLayerBlob("background", resultBlob);
      toast.success("背景プレートが完成しました！");
    } catch (e) {
      console.error(e);
      toast.error("背景の生成に失敗しました");
    } finally {
      onEndProcess();
    }
  };

  const handleClearBackground = () => {
    store.updateState({ backgroundBlob: null, backgroundUrl: null });
  };

  return (
    <div className="space-y-6">
      {/* 被写体に合わせるおまかせ生成 (i2i) */}
      <section>
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-xs font-extrabold text-brand-text-muted flex items-center gap-1">
            <Layers size={14} /> おまかせ背景 (被写体に合わせる)
          </h3>
          {(store.backgroundBlob || store.backgroundUrl) && (
            <button onClick={handleClearBackground} className="text-[10px] font-bold text-brand-secondary bg-brand-secondary/10 px-2 py-1 rounded-md flex items-center gap-1">
              <X size={12} /> 背景を消す
            </button>
          )}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {PRESETS.map((p) => (
            <button 
              key={p.id}
              onClick={() => generateBackground(p.prompt, true)}
              className="border border-brand-border bg-brand-bg rounded-[1rem] p-4 flex flex-col items-center gap-2 hover:border-brand-primary/50 hover:bg-brand-primary-soft transition-colors active:scale-95 shadow-sm"
            >
              <span className="text-2xl">{p.icon}</span>
              <span className="text-xs font-extrabold text-brand-text">{p.name}</span>
            </button>
          ))}
        </div>
      </section>

      {/* 呪文でマニュアル生成 (t2i) */}
      <section className="bg-brand-bg-soft p-4 rounded-[1.5rem] border border-brand-border-strong">
        <h3 className="text-xs font-extrabold text-brand-text-muted mb-3 flex items-center gap-1">
          <Wand2 size={14} /> 呪文でゼロから錬成する
        </h3>
        <textarea
          value={customPrompt}
          onChange={(e) => setCustomPrompt(e.target.value)}
          placeholder="例：星空の下に咲く満開のひまわり畑、高品質"
          className="w-full p-3 rounded-xl border border-brand-border-strong text-sm font-bold text-brand-text focus:outline-none focus:border-brand-primary bg-white resize-none h-20 mb-3"
        />
        <button 
          onClick={() => customPrompt && generateBackground(customPrompt, false)}
          disabled={!customPrompt}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-brand-primary to-brand-mint text-white text-sm font-extrabold shadow-md active:scale-95 disabled:opacity-50 transition-all"
        >
          この呪文で生成！
        </button>
      </section>
    </div>
  );
}