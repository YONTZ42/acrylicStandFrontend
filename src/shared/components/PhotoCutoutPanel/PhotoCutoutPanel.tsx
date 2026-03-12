// src/shared/components/PhotoCutoutPanel/PhotoCutoutPanel.tsx

import React, { useState } from "react";
import { Scissors, Eraser, Sparkles, Layers } from "lucide-react";
import { runRembg } from "@/shared/utils/imageProcessingFromLambda";
import { useExhibitImageUpload } from "@/features/exhibits/hooks/useExhibitImageUpload";
// ... 他のインポート

type Props = {
  targetBlob: Blob | null;
  onUpdate: (newBlob: Blob) => void;
  mode: "foreground" | "background"; // モードによって使えるツールを変える
};

export const PhotoCutoutPanel: React.FC<Props> = ({ targetBlob, onUpdate, mode }) => {
  const [activeTool, setActiveTool] = useState<"cut" | "refine" | "gen" | null>(null);
  const { uploadImageAndGetUrl } = useExhibitImageUpload();
  const [isProcessing, setIsProcessing] = useState(false);

  if (!targetBlob && mode === 'foreground') return <div className="p-4 text-gray-500">No image selected</div>;

  // --- Actions ---
  const handleAutoCut = async () => {
    if (!targetBlob) return;
    setIsProcessing(true);
    try {
        const res = await runRembg(targetBlob, "isnet-general-use", uploadImageAndGetUrl);
        onUpdate(res);
    } finally {
        setIsProcessing(false);
    }
  };

  // ... Refine, Gen も同様に実装

  return (
    <div className="flex flex-col gap-4 p-4 bg-[#1a1a1a] rounded-xl border border-white/10">
       <div className="flex gap-2 border-b border-white/10 pb-2 overflow-x-auto">
          {mode === 'foreground' && (
              <>
                <button onClick={handleAutoCut} disabled={isProcessing} className="flex flex-col items-center gap-1 p-2 text-xs hover:bg-white/5 rounded">
                    <Scissors size={20} className="text-yellow-400" />
                    Auto Cut
                </button>
                <button onClick={() => setActiveTool('refine')} className="flex flex-col items-center gap-1 p-2 text-xs hover:bg-white/5 rounded">
                    <Layers size={20} className="text-blue-400" />
                    Refine
                </button>
              </>
          )}
          
          <button onClick={() => setActiveTool('gen')} className="flex flex-col items-center gap-1 p-2 text-xs hover:bg-white/5 rounded">
              <Sparkles size={20} className="text-purple-400" />
              AI Gen
          </button>
       </div>

       {/* Active Tool UI */}
       <div className="min-h-[200px] bg-[#111] rounded-lg relative overflow-hidden">
           {isProcessing && <div className="absolute inset-0 bg-black/50 flex items-center justify-center">Processing...</div>}
           
           {/* ここに PhotoCutoutStage などを埋め込む */}
           {activeTool === 'refine' && targetBlob && (
               <div className="text-center p-4 text-gray-500">Refine Tool UI Here (YOLO)</div>
           )}
           {activeTool === 'gen' && (
               <div className="text-center p-4 text-gray-500">Gemini Prompt UI Here</div>
           )}
           {!activeTool && targetBlob && (
               <img src={URL.createObjectURL(targetBlob)} className="w-full h-full object-contain" />
           )}
       </div>
    </div>
  );
};