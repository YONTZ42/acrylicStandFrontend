// src/shared/components/PhotoCutoutPanel/steps/CutoutSelector.tsx

import React, { useState } from "react";
import { Loader2, Scissors } from "lucide-react";
import { runRembg, type RembgModel } from "@/shared/utils/imageProcessingFromLambda";
import { useExhibitImageUpload } from "@/features/exhibits/hooks/useExhibitImageUpload";

type Props = {
  originalBlob: Blob;
  onComplete: (blob: Blob) => void;
};

const MODELS: { id: RembgModel; label: string; desc: string }[] = [
  { id: "isnet-general-use", label: "General (ISNet)", desc: "標準的な切り抜き精度" },
  { id: "birefnet-general-lite", label: "General (BiRefNet)", desc: "軽量・高速モデル" },
  { id: "isnet-anime", label: "Anime (ISNet)", desc: "イラスト・アニメ調に特化" },
];

export const CutoutSelector: React.FC<Props> = ({ originalBlob, onComplete }) => {
  const [isLoading, setIsLoading] = useState(false);
  const { uploadImageAndGetUrl } = useExhibitImageUpload();

  const handleSelect = async (model: RembgModel) => {
    setIsLoading(true);
    try {
      // 4.5MB超え対策のuploaderを渡す
      const blob = await runRembg(originalBlob, model, uploadImageAndGetUrl);
      onComplete(blob);
    } catch (e) {
      console.error(e);
      alert("Failed to cutout image.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-full p-6 text-center space-y-6">
      <h3 className="text-xl font-bold text-white">Select AI Model</h3>
      <p className="text-sm text-gray-400">
        Choose the best AI model for your image type.
      </p>

      {isLoading ? (
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="animate-spin text-yellow-400" size={48} />
          <span className="text-white/70 animate-pulse">Processing...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 w-full max-w-md">
          {MODELS.map((m) => (
            <button
              key={m.id}
              onClick={() => handleSelect(m.id)}
              className="group relative flex items-center p-4 border border-white/10 rounded-xl bg-white/5 hover:bg-white/10 hover:border-yellow-400/50 transition-all text-left"
            >
              <div className="p-3 bg-black/30 rounded-lg mr-4 group-hover:bg-yellow-400/20 group-hover:text-yellow-400 transition-colors">
                <Scissors size={24} />
              </div>
              <div>
                <div className="font-bold text-white">{m.label}</div>
                <div className="text-xs text-gray-400">{m.desc}</div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};