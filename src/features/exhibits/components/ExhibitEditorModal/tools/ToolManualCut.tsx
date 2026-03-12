// src/features/exhibits/components/ExhibitEditorModal/tools/ToolManualCut.tsx
import React, { useRef } from "react";
import { Undo, Redo, Check } from "lucide-react";
import { useKonvaDraw } from "@/shared/hooks/useKonvaDraw";
import { applyEraser } from "@/shared/utils/imageProcessing";
import { PhotoCutoutStage } from "@/shared/components/PhotoCutoutPanel/PhotoCutoutStage";
import { useImageEditorState } from "@/shared/hooks/useImageEditorState";

type Props = {
  sourceBlob: Blob;
  onApply: (blob: Blob) => void;
  onProcessing: (isProcessing: boolean) => void;
};

export const ToolManualCut: React.FC<Props> = ({ sourceBlob, onApply, onProcessing }) => {
  // ローカル履歴管理（消しゴムのUndo/Redo用）
  const { currentBlob, pushState, undo, redo, canUndo, canRedo } = useImageEditorState();
  const activeBlob = currentBlob || sourceBlob;

  const { mode, setMode, currentPoints, handleMouseDown, handleMouseMove, handleMouseUp, resetDraw } = useKonvaDraw();
  
  // 初期モードをEraserに固定
  React.useEffect(() => { setMode("erase"); }, [setMode]);

  const imageRef = useRef<HTMLImageElement | null>(null);
  const stageScaleRef = useRef<number>(1);

  // マウスを離した瞬間に消しゴム適用
  const handleStageMouseUp = async () => {
    handleMouseUp(); // hook側完了

    if (mode === "erase" && currentPoints.length > 2 && imageRef.current) {
      onProcessing(true);
      try {
        const scale = stageScaleRef.current || 1;
        const lineWidth = 20 / scale; // Konva側の線の太さと合わせる
        const newBlob = await applyEraser(imageRef.current, [{ points: currentPoints, width: lineWidth }]);
        if (newBlob) {
          pushState(newBlob);
        }
        resetDraw();
      } catch (e) {
        console.error(e);
      } finally {
        onProcessing(false);
      }
    }
  };

  return (
    <div className="w-full h-full flex flex-col relative">
       {/* Top Toolbar (Undo/Redo) */}
       <div className="absolute top-4 left-4 z-40 flex gap-2">
          <button 
             onClick={undo} disabled={!canUndo} 
             className="p-2 bg-black/50 hover:bg-white/10 rounded-lg text-white disabled:opacity-30 backdrop-blur"
          >
             <Undo size={18} />
          </button>
          <button 
             onClick={redo} disabled={!canRedo} 
             className="p-2 bg-black/50 hover:bg-white/10 rounded-lg text-white disabled:opacity-30 backdrop-blur"
          >
             <Redo size={18} />
          </button>
       </div>

       {/* Stage */}
       <div className="flex-1 flex items-center justify-center overflow-hidden cursor-crosshair">
           <PhotoCutoutStage
              blob={activeBlob}
              isLoading={false}
              mode={mode}
              currentPoints={currentPoints}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleStageMouseUp}
              onImageReady={(img, scale) => {
                  imageRef.current = img;
                  stageScaleRef.current = scale;
              }}
              onImageCleared={() => {
                  imageRef.current = null;
              }}
           />
       </div>

       {/* Bottom Floating Apply Button */}
       {currentBlob && (
           <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-40">
               <button 
                  onClick={() => onApply(activeBlob)}
                  className="px-6 py-3 bg-yellow-400 hover:bg-yellow-300 text-black font-bold rounded-full shadow-2xl flex items-center gap-2 transition-transform hover:scale-105"
               >
                   <Check size={20} /> Apply Changes
               </button>
           </div>
       )}
    </div>
  );
};