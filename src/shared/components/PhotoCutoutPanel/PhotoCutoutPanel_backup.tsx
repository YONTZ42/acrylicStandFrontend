import React, { useEffect, useRef, useState } from "react";
import { Upload, Loader2, X } from "lucide-react";

import { useImageEditorState } from "@/shared/hooks/useImageEditorState";
import { useKonvaDraw } from "@/shared/hooks/useKonvaDraw";
import { useExhibitImageUpload } from "@/features/exhibits/hooks/useExhibitImageUpload"; // パスは適宜調整

// Utils
import { applyManualCutout, applyEraser } from "@/shared/utils/imageProcessing";
import {
  type MaskLayer,
  runDetectObjectMasks,
  cutoutWithUnionMasks,
} from "@/shared/utils/imageCropMultiObjects";

import { PhotoCutoutStage } from "./PhotoCutoutStage";
import { PhotoCutoutHeader } from "./PhotoCutoutHeader";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (imageBlob: Blob) => void;
  sourceBlob: Blob | null;
  sourceUrl: string | null;
};


export const PhotoCutoutPanel: React.FC<Props> = ({
  isOpen,
  onClose,
  onComplete,
  sourceBlob,
  sourceUrl,
}) => {
  // Hooks
  const { currentBlob, pushState, undo, redo, init, reset, canUndo, canRedo } = useImageEditorState();
  const { mode, setMode, currentPoints, handleMouseDown, handleMouseMove, handleMouseUp, resetDraw } = useKonvaDraw();
  
  // S3 Upload Hook (Detect時に大きい画像の場合に使用)
  const { uploadImageAndGetUrl, isUploading: isHookUploading } = useExhibitImageUpload();

  const [isProcessing, setIsProcessing] = useState(false);
  const isLoading = isProcessing || isHookUploading;

  // Refs
  const imageRef = useRef<HTMLImageElement | null>(null);
  const stageScaleRef = useRef<number>(1);

  // Mask State
  const [maskLayers, setMaskLayers] = useState<MaskLayer[]>([]);

  // Init
  useEffect(() => {
    if (isOpen) {
      if (sourceBlob) {
        init(sourceBlob);
      } else if (sourceUrl) {
        setIsProcessing(true);
        fetch(sourceUrl)
          .then((res) => res.blob())
          .then((blob) => init(blob))
          .catch((err) => console.error(err))
          .finally(() => setIsProcessing(false));
      }
    } else {
      reset();
      setMaskLayers([]);
      resetDraw();
    }
  }, [isOpen, sourceBlob, sourceUrl]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) init(file);
  };

  const handleSave = async () => {
    if (currentBlob) {
      onComplete(currentBlob);
      onClose();
    }
  };

  // --- Manual Cut / Erase ---
  const handleApplyCut = async () => {
    const img = imageRef.current;
    if (!img || mode !== "cut" || currentPoints.length < 6) return;

    setIsProcessing(true);
    try {
      const newBlob = await applyManualCutout(img, currentPoints);
      if (newBlob) {
        pushState(newBlob);
        resetDraw();
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleStageMouseUp = async () => {
    handleMouseUp(); // Konva hook
    
    // Eraserは描画終了時に適用
    const img = imageRef.current;
    if (!img || mode !== "erase" || currentPoints.length <= 2) return;

    setIsProcessing(true);
    try {
      const scale = stageScaleRef.current || 1;
      const lineWidth = 20 / scale;
      const newBlob = await applyEraser(img, [{ points: currentPoints, width: lineWidth }]);
      if (newBlob) {
        pushState(newBlob);
        resetDraw();
      }
    } finally {
      setIsProcessing(false);
    }
  };

  // --- Auto Background Removal (Legacy/Single) ---
  const handleRunAuto = async () => {
    if (!currentBlob) return;
    setIsProcessing(true);
    try {
      const newBlob = "";

      resetDraw();
    } finally {
      setIsProcessing(false);
    }
  };

  // --- Multi Mask Detection (New Feature) ---
  const handleDetectMasks = async () => {
    if (!currentBlob) return;
    
    // マスク表示中はリセット
    setMaskLayers([]); 
    setIsProcessing(true);

    try {
      const layers = await runDetectObjectMasks({
        blob: currentBlob,
        uploader: uploadImageAndGetUrl, // Hookの関数を注入
      });
      
      if (layers.length === 0) {
        alert("No objects detected.");
      }
      setMaskLayers(layers);
    } catch (error) {
      console.error(error);
      alert("Failed to detect masks.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleMaskCutout = async () => {
    const srcImg = imageRef.current;
    if (!srcImg) return;

    // 表示されているマスクのみを対象にする
    const activeMasks = maskLayers.filter((m) => m.visible).map((m) => m.image);
    if (activeMasks.length === 0) return;

    setIsProcessing(true);
    try {
      const outBlob = await cutoutWithUnionMasks({ 
        sourceImage: srcImg, 
        maskImages: activeMasks 
      });
      
      pushState(outBlob);
      // 適用後はマスクを消去
      setMaskLayers([]);
      resetDraw();
    } catch (e) {
      console.error(e);
      alert("Failed to apply mask cutout.");
    } finally {
      setIsProcessing(false);
    }
  };

  const removeMask = (id: string) => setMaskLayers((p) => p.filter((m) => m.id !== id));
  const toggleMask = (id: string, visible: boolean) =>
    setMaskLayers((p) => p.map((m) => (m.id === id ? { ...m, visible } : m)));

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex flex-col bg-black text-white">
      {/* Header */}
      <PhotoCutoutHeader
        isLoading={isLoading}
        onClose={onClose}
        onSave={handleSave}
        canSave={!!currentBlob}
        onUndo={undo}
        onRedo={redo}
        canUndo={canUndo}
        canRedo={canRedo}
        mode={mode}
        onChangeMode={(m) => {
          setMode(m);
          resetDraw();
        }}
        onRunAutoCutout={handleRunAuto}
        canRunAutoCutout={!!currentBlob}
        onApplyCut={handleApplyCut}
        canApplyCut={mode === "cut" && currentPoints.length >= 6}
        showApplyCut={mode === "cut"}
        
        // Multi Mask Props
        onDetectMasks={handleDetectMasks}
        canDetectMasks={!!currentBlob}
        onMaskCutout={handleMaskCutout}
        canMaskCutout={!!imageRef.current && maskLayers.some((m) => m.visible)}
        maskCount={maskLayers.length}
      />

      {/* Main Content */}
      <div className="flex-1 relative flex items-center justify-center bg-[#111] overflow-hidden">
        {!currentBlob ? (
          <label className="flex flex-col items-center gap-4 cursor-pointer p-12 border-2 border-dashed border-gray-700 rounded-2xl hover:border-gray-500 transition-colors">
            <Upload size={48} className="text-gray-500" />
            <span className="text-gray-400 font-bold">Upload Photo</span>
            <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
          </label>
        ) : (
          <>
            {isLoading && (
              <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                <Loader2 className="animate-spin text-white" size={48} />
              </div>
            )}

            <PhotoCutoutStage
              blob={currentBlob}
              isLoading={isLoading}
              mode={mode}
              currentPoints={currentPoints}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleStageMouseUp}
              onImageReady={(img, stageScale) => {
                imageRef.current = img;
                stageScaleRef.current = stageScale;
              }}
              onImageCleared={() => {
                imageRef.current = null;
                stageScaleRef.current = 1;
              }}
              maskLayers={maskLayers}
            />

            {/* Mask Selector UI */}
            {maskLayers.length > 0 && (
              <div className="absolute top-4 right-4 z-30 w-[260px] rounded-2xl border border-white/10 bg-black/80 backdrop-blur p-3 shadow-xl">
                <div className="flex items-center justify-between mb-2 pb-2 border-b border-white/10">
                  <span className="text-sm font-bold">Detected Objects</span>
                  <button 
                    onClick={() => setMaskLayers([])}
                    className="text-xs text-white/50 hover:text-white"
                  >
                    Close
                  </button>
                </div>
                
                <div className="space-y-1 max-h-[300px] overflow-y-auto pr-1">
                  {maskLayers.map((m, idx) => (
                    <div 
                      key={m.id} 
                      className={`flex items-center justify-between p-2 rounded transition-colors ${
                        m.visible ? "bg-white/10" : "hover:bg-white/5"
                      }`}
                    >
                      <label className="flex items-center gap-3 text-xs flex-1 cursor-pointer select-none">
                        <input 
                          type="checkbox" 
                          checked={m.visible} 
                          onChange={(e) => toggleMask(m.id, e.target.checked)} 
                          className="w-4 h-4 accent-yellow-400 rounded-sm"
                        />
                        <span>Mask {idx + 1}</span>
                      </label>
                      <button
                        className="text-white/40 hover:text-red-400 p-1"
                        onClick={() => removeMask(m.id)}
                        type="button"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="mt-2 text-[10px] text-white/40 text-center">
                  Select masks and click "Cutout Selection"
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};