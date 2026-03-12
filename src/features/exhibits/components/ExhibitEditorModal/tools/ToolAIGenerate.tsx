// src/features/exhibits/components/ExhibitEditorModal/tools/ToolAIGenerate.tsx
import React, { useState } from "react";
import { Sparkles, Wand2, Check } from "lucide-react";
import { runGemini } from "@/shared/utils/imageProcessingFromLambda";
import { useExhibitImageUpload } from "@/features/exhibits/hooks/useExhibitImageUpload";

type Props = {
  refBlob: Blob | null; // 参照用元画像
  onApply: (blob: Blob) => void;
  onProcessing: (isProcessing: boolean) => void;
};

export const ToolAIGenerate: React.FC<Props> = ({ refBlob, onApply, onProcessing }) => {
  const { uploadImageAndGetUrl } = useExhibitImageUpload();
  const [prompt, setPrompt] = useState("");
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    onProcessing(true);
    try {
      // refBlob（元画像）を渡すことで、i2i的（形状を維持した背景生成）な使い方も想定可能
      const blob = await runGemini(prompt, refBlob || undefined, uploadImageAndGetUrl);
      setResultBlob(blob);
    } catch (e) {
      console.error(e);
      alert("Failed to generate background.");
    } finally {
      onProcessing(false);
    }
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-4">
      
      {/* プレビューエリア */}
      {resultBlob ? (
        <div className="relative w-full max-w-lg aspect-square sm:aspect-video bg-black/50 rounded-2xl overflow-hidden shadow-2xl mb-6">
            <img src={URL.createObjectURL(resultBlob)} className="w-full h-full object-cover" />
            <button 
                onClick={() => onApply(resultBlob)}
                className="absolute bottom-4 right-4 px-4 py-2 bg-yellow-400 hover:bg-yellow-300 text-black font-bold text-sm rounded-full flex items-center gap-2 shadow-lg"
            >
                <Check size={16} /> Use this Background
            </button>
        </div>
      ) : (
        <div className="w-full max-w-lg aspect-square sm:aspect-video border-2 border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center text-white/20 mb-6 bg-white/5">
            <Sparkles size={48} className="mb-4 opacity-50" />
            <p>Generate a unique background using AI.</p>
        </div>
      )}

      {/* プロンプト入力エリア */}
      <div className="w-full max-w-lg bg-black/80 backdrop-blur p-4 rounded-xl border border-white/10 shadow-2xl flex flex-col gap-3">
          <label className="text-xs font-bold text-purple-400 flex items-center gap-1">
             <Wand2 size={14} /> Description
          </label>
          <textarea 
             value={prompt}
             onChange={(e) => setPrompt(e.target.value)}
             placeholder="e.g. A cyberpunk city street at night, neon lights, highly detailed, 4k"
             className="w-full h-24 bg-white/5 border border-white/10 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-purple-500/50 resize-none"
          />
          <button 
             onClick={handleGenerate}
             disabled={!prompt.trim()}
             className="w-full py-2.5 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-lg flex items-center justify-center gap-2 transition-colors"
          >
             <Sparkles size={16} /> Generate Image
          </button>
      </div>

    </div>
  );
};