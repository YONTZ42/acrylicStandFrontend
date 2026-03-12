// src/features/exhibits/components/ExhibitEditorModal/tools/ToolObjectRefine.tsx
import React, { useState, useRef, useEffect } from "react";
import { Check, Layers, AlertCircle } from "lucide-react";
import { runDetectObjectMasks, cutoutWithUnionMasks, type MaskLayer } from "@/shared/utils/imageCropMultiObjects";
import { useExhibitImageUpload } from "@/features/exhibits/hooks/useExhibitImageUpload";
import { PhotoCutoutStage } from "@/shared/components/PhotoCutoutPanel/PhotoCutoutStage";

type Props = {
  sourceBlob: Blob;
  onApply: (blob: Blob) => void;
  onProcessing: (isProcessing: boolean) => void;
};

export const ToolObjectRefine: React.FC<Props> = ({ sourceBlob, onApply, onProcessing }) => {
  const { uploadImageAndGetUrl } = useExhibitImageUpload();
  const [maskLayers, setMaskLayers] = useState<MaskLayer[]>([]);
  const [hasRun, setHasRun] = useState(false);

  // Stage参照用
  const imageRef = useRef<HTMLImageElement | null>(null);

  // YOLO実行
  const handleDetect = async () => {
    onProcessing(true);
    try {
      const layers = await runDetectObjectMasks({
        blob: sourceBlob,
        uploader: uploadImageAndGetUrl,
      });
      setMaskLayers(layers);
      setHasRun(true);
      if (layers.length === 0) alert("No separate objects detected. Try another tool.");
    } catch (e) {
      console.error(e);
      alert("Failed to detect objects.");
    } finally {
      onProcessing(false);
    }
  };

  // 選択されたマスクで切り抜き実行
  const handleApplyMasks = async () => {
    const img = imageRef.current;
    if (!img) return;

    const activeMasks = maskLayers.filter((m) => m.visible).map((m) => m.image);
    if (activeMasks.length === 0) {
      alert("Please select at least one object.");
      return;
    }

    onProcessing(true);
    try {
      const newBlob = await cutoutWithUnionMasks({ sourceImage: img, maskImages: activeMasks });
      onApply(newBlob);
    } catch (e) {
      console.error(e);
      alert("Failed to apply masks.");
    } finally {
      onProcessing(false);
    }
  };

  const toggleMask = (id: string, visible: boolean) => {
    setMaskLayers((prev) => prev.map((m) => (m.id === id ? { ...m, visible } : m)));
  };

  return (
    <div className="w-full h-full flex flex-col relative">
      <div className="flex-1 flex items-center justify-center overflow-hidden">
        {/* PhotoCutoutStage をプレビューおよびマスク描画用に再利用 */}
        <PhotoCutoutStage
          blob={sourceBlob}
          isLoading={false} // 親で管理しているためfalse
          mode="view" // 描画は行わない
          currentPoints={[]}
          onMouseDown={() => {}}
          onMouseMove={() => {}}
          onMouseUp={() => {}}
          onImageReady={(img) => { imageRef.current = img; }}
          onImageCleared={() => { imageRef.current = null; }}
          maskLayers={maskLayers}
        />
      </div>

      {/* Control Panel */}
      <div className="absolute top-4 right-4 z-40 bg-black/80 backdrop-blur p-4 rounded-xl border border-white/10 w-64 shadow-2xl">
        {!hasRun ? (
          <div className="text-center">
            <Layers size={32} className="mx-auto text-blue-400 mb-2 opacity-80" />
            <p className="text-xs text-gray-300 mb-4">
              AI will detect multiple objects in the image so you can select which ones to keep.
            </p>
            <button
              onClick={handleDetect}
              className="w-full py-2 bg-blue-500 hover:bg-blue-400 text-white text-sm font-bold rounded-lg transition-colors"
            >
              Run Detection
            </button>
          </div>
        ) : maskLayers.length > 0 ? (
          <div className="flex flex-col gap-3">
            <div className="text-xs font-bold text-gray-300 border-b border-white/10 pb-2">
              Select Objects to Keep
            </div>
            <div className="max-h-[200px] overflow-y-auto space-y-1 pr-1">
              {maskLayers.map((m, idx) => (
                <label
                  key={m.id}
                  className={`flex items-center gap-2 text-xs p-2 rounded cursor-pointer transition-colors ${
                    m.visible ? "bg-blue-500/20 text-white" : "hover:bg-white/5 text-gray-400"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={m.visible}
                    onChange={(e) => toggleMask(m.id, e.target.checked)}
                    className="accent-blue-500"
                  />
                  Object {idx + 1}
                </label>
              ))}
            </div>
            <button
              onClick={handleApplyMasks}
              disabled={maskLayers.filter(m => m.visible).length === 0}
              className="w-full py-2 bg-yellow-400 hover:bg-yellow-300 disabled:bg-gray-700 disabled:text-gray-500 text-black font-bold text-sm rounded-lg flex items-center justify-center gap-2 mt-2 transition-colors"
            >
              <Check size={16} /> Crop Selected
            </button>
          </div>
        ) : (
          <div className="text-center text-gray-400">
            <AlertCircle size={24} className="mx-auto mb-2 opacity-50" />
            <p className="text-xs">No objects found. Try another tool.</p>
          </div>
        )}
      </div>
    </div>
  );
};