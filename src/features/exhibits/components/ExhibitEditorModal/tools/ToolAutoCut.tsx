// src/features/exhibits/components/ExhibitEditorModal/tools/ToolAutoCut.tsx
import React, { useState } from "react";
import { runRembg, type RembgModel } from "@/shared/utils/imageProcessingFromLambda";
import { useExhibitImageUpload } from "@/features/exhibits/hooks/useExhibitImageUpload";
import { Scissors, Check } from "lucide-react";

type Props = {
  sourceBlob: Blob;
  onApply: (blob: Blob) => void;
  onProcessing: (isProcessing: boolean) => void;
};

const MODELS: { id: RembgModel; label: string; desc: string }[] = [
  { id: "birefnet-general-lite", label: "General High Quality", desc: "標準的な切り抜き。少し遅いが高精度。" },
  { id: "isnet-general-use", label: "Fast & Lite", desc: "軽量・高速。輪郭がシンプルな画像向け。" },
  { id: "isnet-anime", label: "Anime / Illustration", desc: "イラストやアニメ調の画像に特化。" },
];

export const ToolAutoCut: React.FC<Props> = ({ sourceBlob, onApply, onProcessing }) => {
  const { uploadImageAndGetUrl } = useExhibitImageUpload();
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);

  const handleRun = async (modelId: RembgModel) => {
    onProcessing(true);
    try {
      const blob = await runRembg(sourceBlob, modelId, uploadImageAndGetUrl);
      setResultBlob(blob);
    } catch (e) {
      console.error(e);
      alert("Auto Cut failed. Please try another model.");
    } finally {
      onProcessing(false);
    }
  };

  return (
    <div className="w-full h-full flex flex-col relative">
       {/* Preview Area */}
       <div className="flex-1 flex items-center justify-center p-4">
           {resultBlob ? (
               <img src={URL.createObjectURL(resultBlob)} className="max-w-full max-h-full object-contain bg-[url('https://placehold.co/20x20/222/333/png')] bg-repeat shadow-2xl rounded-lg" />
           ) : (
               <img src={URL.createObjectURL(sourceBlob)} className="max-w-full max-h-full object-contain opacity-50 grayscale" />
           )}
       </div>

       {/* Control Panel */}
       <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/80 backdrop-blur border border-white/10 p-4 rounded-2xl w-full max-w-sm flex flex-col gap-3">
           <div className="text-xs font-bold text-center text-gray-300">Select AI Model</div>
           <div className="grid grid-cols-1 gap-2">
               {MODELS.map(m => (
                   <button 
                      key={m.id} 
                      onClick={() => handleRun(m.id)}
                      className="flex items-center justify-between p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-transparent hover:border-yellow-400/30 transition-colors text-left"
                   >
                       <div>
                           <div className="text-sm font-bold text-white">{m.label}</div>
                           <div className="text-[10px] text-gray-400">{m.desc}</div>
                       </div>
                       <Scissors size={16} className="text-gray-500" />
                   </button>
               ))}
           </div>
           
           {resultBlob && (
               <button 
                  onClick={() => onApply(resultBlob)}
                  className="mt-2 w-full py-2 bg-yellow-400 hover:bg-yellow-300 text-black font-bold text-sm rounded-xl flex items-center justify-center gap-2"
               >
                   <Check size={18} /> Apply Cutout
               </button>
           )}
       </div>
    </div>
  );
};