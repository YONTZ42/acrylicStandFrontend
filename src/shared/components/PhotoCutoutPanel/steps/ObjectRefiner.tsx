// src/shared/components/PhotoCutoutPanel/steps/ObjectRefiner.tsx

import React, { useRef, useState } from "react";
import { Loader2, Eraser, Layers, Check } from "lucide-react";
import { PhotoCutoutStage } from "../PhotoCutoutStage";
import { useKonvaDraw } from "@/shared/hooks/useKonvaDraw";
import { 
  runDetectObjectMasks, 
  cutoutWithUnionMasks, 
  type MaskLayer 
} from "@/shared/utils/imageCropMultiObjects";
import { applyEraser } from "@/shared/utils/imageProcessing";
import { useExhibitImageUpload } from "@/features/exhibits/hooks/useExhibitImageUpload";

// 前景Blobと履歴操作を受け取る
type Props = {
  blob: Blob;
  onUpdateBlob: (blob: Blob) => void;
  onNext: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
};

export const ObjectRefiner: React.FC<Props> = ({ 
  blob, onUpdateBlob, onNext, canUndo, canRedo, onUndo, onRedo 
}) => {
  const { mode, setMode, currentPoints, handleMouseDown, handleMouseMove, handleMouseUp, resetDraw } = useKonvaDraw();
  const { uploadImageAndGetUrl } = useExhibitImageUpload();
  
  const [isLoading, setIsLoading] = useState(false);
  const [maskLayers, setMaskLayers] = useState<MaskLayer[]>([]);

  // Stage参照
  const imageRef = useRef<HTMLImageElement | null>(null);
  const stageScaleRef = useRef<number>(1);

  // マスク検出 (初回のみ自動実行してもよいが、ボタン実行にする)
  const handleDetect = async () => {
    setIsLoading(true);
    try {
        // 現在のBlobに対して検出を実行
        const layers = await runDetectObjectMasks({
            blob,
            uploader: uploadImageAndGetUrl,
        });
        if (layers.length === 0) alert("No objects detected.");
        setMaskLayers(layers);
    } catch (e) {
        console.error(e);
        alert("Detection failed.");
    } finally {
        setIsLoading(false);
    }
  };

  // マスク適用
  const handleApplyMask = async () => {
    const img = imageRef.current;
    if (!img) return;
    
    const activeMasks = maskLayers.filter(m => m.visible).map(m => m.image);
    if (activeMasks.length === 0) return;

    setIsLoading(true);
    try {
        const newBlob = await cutoutWithUnionMasks({ sourceImage: img, maskImages: activeMasks });
        onUpdateBlob(newBlob);
        setMaskLayers([]); // 適用後はリセット
    } finally {
        setIsLoading(false);
    }
  };

  // 消しゴム適用
  const handleStageMouseUp = async () => {
    handleMouseUp();
    if (mode === 'erase' && currentPoints.length > 2 && imageRef.current) {
        setIsLoading(true);
        try {
            const scale = stageScaleRef.current || 1;
            const lineWidth = 20 / scale;
            const newBlob = await applyEraser(imageRef.current, [{ points: currentPoints, width: lineWidth }]);
            if (newBlob) {
                onUpdateBlob(newBlob);
                resetDraw();
            }
        } finally {
            setIsLoading(false);
        }
    }
  };
  
  const toggleMask = (id: string, visible: boolean) => {
      setMaskLayers(prev => prev.map(m => m.id === id ? { ...m, visible } : m));
  };


  return (
    <div className="relative w-full h-full flex flex-col">
      {/* Toolbar */}
      <div className="flex items-center justify-between p-2 bg-[#1a1a1a] border-b border-white/10 z-10">
         <div className="flex gap-2">
            <button onClick={onUndo} disabled={!canUndo} className="px-3 py-1 text-xs bg-white/5 rounded disabled:opacity-30">Undo</button>
            <button onClick={onRedo} disabled={!canRedo} className="px-3 py-1 text-xs bg-white/5 rounded disabled:opacity-30">Redo</button>
         </div>
         <div className="flex gap-2">
            <button 
                onClick={handleDetect} 
                disabled={isLoading}
                className="flex items-center gap-1 px-3 py-1 text-xs bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded hover:bg-blue-500/30"
            >
                <Layers size={14} /> Detect Objects
            </button>
            <button 
                onClick={() => setMode(mode === 'erase' ? 'view' : 'erase')} 
                className={`flex items-center gap-1 px-3 py-1 text-xs border rounded transition-colors ${
                    mode === 'erase' ? 'bg-red-500/20 text-red-400 border-red-500/30' : 'bg-white/5 border-white/10 text-gray-300'
                }`}
            >
                <Eraser size={14} /> Eraser
            </button>
         </div>
         <button onClick={onNext} className="px-4 py-1 text-xs font-bold bg-white text-black rounded-full">Next</button>
      </div>

      {/* Main Stage */}
      <div className="flex-1 relative bg-[#111] overflow-hidden flex items-center justify-center">
        {isLoading && <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/50"><Loader2 className="animate-spin text-white" /></div>}
        
        <PhotoCutoutStage
            blob={blob}
            isLoading={isLoading}
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
            maskLayers={maskLayers}
        />

        {/* Mask Selection Panel */}
        {maskLayers.length > 0 && (
            <div className="absolute top-4 right-4 z-40 bg-black/80 p-3 rounded-lg border border-white/10 w-64">
                <div className="text-xs font-bold mb-2 text-gray-300">Select objects to keep</div>
                <div className="space-y-1 max-h-40 overflow-y-auto">
                    {maskLayers.map((m, idx) => (
                        <label key={m.id} className="flex items-center gap-2 text-xs p-1 hover:bg-white/5 rounded cursor-pointer">
                            <input type="checkbox" checked={m.visible} onChange={e => toggleMask(m.id, e.target.checked)} />
                            Object {idx + 1}
                        </label>
                    ))}
                </div>
                <button 
                    onClick={handleApplyMask}
                    className="mt-2 w-full py-1 text-xs bg-green-600 hover:bg-green-500 text-white rounded flex items-center justify-center gap-1"
                >
                    <Check size={12} /> Crop Selected
                </button>
            </div>
        )}
      </div>
    </div>
  );
};