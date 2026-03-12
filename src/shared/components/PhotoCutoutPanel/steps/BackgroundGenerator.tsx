// src/shared/components/PhotoCutoutPanel/steps/BackgroundGenerator.tsx

import React, { useState } from "react";
import { Loader2, Sparkles, Image as ImageIcon, Ban } from "lucide-react";
import { runGemini } from "@/shared/utils/imageProcessingFromLambda";
import { useExhibitImageUpload } from "@/features/exhibits/hooks/useExhibitImageUpload";

type Props = {
  originalBlob: Blob | null; // 元画像（参照用）
  onComplete: (bgBlob: Blob | null) => void; // null = 透過
};

export const BackgroundGenerator: React.FC<Props> = ({ originalBlob, onComplete }) => {
  const [prompt, setPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { uploadImageAndGetUrl } = useExhibitImageUpload();

  const handleGenerate = async () => {
    if (!prompt) return;
    setIsLoading(true);
    try {
        const blob = await runGemini(prompt, undefined, uploadImageAndGetUrl); // 参照画像なしで生成
        onComplete(blob);
    } catch (e) {
        console.error(e);
        alert("Failed to generate background.");
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full p-6 space-y-8">
      <div className="text-center">
        <h3 className="text-xl font-bold text-white">Choose Background</h3>
        <p className="text-sm text-gray-400">Select or generate a background for your exhibit.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 max-w-md mx-auto w-full">
        {/* Option 1: Transparent */}
        <button 
            onClick={() => onComplete(null)}
            className="flex items-center p-4 border border-white/10 rounded-xl bg-white/5 hover:bg-white/10 transition-all text-left group"
        >
            <div className="p-3 bg-black/30 rounded-lg mr-4 group-hover:text-gray-300"><Ban size={24} /></div>
            <div>
                <div className="font-bold text-white">Transparent</div>
                <div className="text-xs text-gray-400">No background (Standard Acrylic Stand)</div>
            </div>
        </button>

        {/* Option 2: AI Generation */}
        <div className="p-4 border border-white/10 rounded-xl bg-white/5">
            <div className="flex items-center mb-3">
                <div className="p-2 bg-purple-500/20 text-purple-400 rounded-lg mr-3"><Sparkles size={20} /></div>
                <span className="font-bold text-white">AI Generation</span>
            </div>
            <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe the background (e.g., 'Cyberpunk city street at night')"
                className="w-full h-24 bg-black/50 border border-white/10 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-purple-500 resize-none mb-3"
            />
            <button
                onClick={handleGenerate}
                disabled={!prompt || isLoading}
                className="w-full py-2 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-bold rounded-lg flex items-center justify-center gap-2"
            >
                {isLoading ? <Loader2 className="animate-spin" size={16} /> : <Sparkles size={16} />}
                Generate
            </button>
        </div>
      </div>
    </div>
  );
};