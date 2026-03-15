// src/features/exhibits/components/ExhibitEditorModal/LayerEditorModal.tsx
import React, { useState, useMemo } from "react";
import { X, Upload, Scissors, Eraser, Layers, Sparkles, Loader2 } from "lucide-react";
import { useEditorContext } from "@/features/exhibits/hooks/useExhibitEditorStore";
import { LayerPreview3D } from "./LayerPreview3D";
// Tools
import { ToolAutoCut } from "./tools/ToolAutoCut";
import { ToolObjectRefine } from "./tools/ToolObjectRefine";
import { ToolManualCut } from "./tools/ToolManualCut";
import { ToolAIGenerate } from "./tools/ToolAIGenerate";

type ToolType = "preview" | "manual" | "auto" | "refine" | "aigen";

// 画像を2MB以下に圧縮するユーティリティ関数（背景透過を維持するため image/webp を使用）
const compressImage = async (file: File | Blob, maxSizeMB: number = 2): Promise<Blob> => {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  if (file.size <= maxSizeBytes) return file; // 既にサイズ以下ならそのまま返す

  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) return reject(new Error("Canvas context is not available"));

      let { width, height } = img;
      
      // 初期リサイズ (最大2048pxに抑える)
      const MAX_SIZE = 2048;
      if (width > MAX_SIZE || height > MAX_SIZE) {
        if (width > height) {
          height = Math.round(height * (MAX_SIZE / width));
          width = MAX_SIZE;
        } else {
          width = Math.round(width * (MAX_SIZE / height));
          height = MAX_SIZE;
        }
      }

      canvas.width = width;
      canvas.height = height;
      ctx.drawImage(img, 0, 0, width, height);

      let quality = 0.9;
      
      // 圧縮を試行する再帰関数
      const attemptCompress = () => {
        canvas.toBlob(
          (blob) => {
            if (!blob) return reject(new Error("Blob generation failed"));
            
            // 目標サイズに収まった、またはこれ以上画質を下げられない場合
            if (blob.size <= maxSizeBytes || quality <= 0.1) {
              resolve(blob);
            } else {
              quality -= 0.1; // 画質を下げて再試行
              attemptCompress();
            }
          },
          "image/webp", // 透過情報を保持しつつ圧縮可能
          quality
        );
      };

      attemptCompress();
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Image load failed"));
    };
    img.src = url;
  });
};

export const LayerEditorModal: React.FC = () => {
  const store = useEditorContext();
  const layerType = store.editingLayer; // "foreground" | "background"

  const [activeTool, setActiveTool] = useState<ToolType>("preview");
  const [isProcessing, setIsProcessing] = useState(false);

  // 編集中の画像（Blobを優先、なければURL、両方なければnull）
  const currentBlob = layerType ? (store[`${layerType}Blob`] as Blob | null) : null;
  const currentUrl = layerType ? (store[`${layerType}Url`] as string | null) : null;
  
  // 編集のベースにする画像 (対象がなければoriginalを使用)
  const baseImageBlob = currentBlob || store.originalBlob; 

  const previewSrc = useMemo(() => {
    if (currentBlob) return URL.createObjectURL(currentBlob);
    if (currentUrl) return currentUrl;
    return null;
  }, [currentBlob, currentUrl]);

  // 画像アップロードハンドラ (2MB圧縮処理を追加)
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !layerType) return;

    setIsProcessing(true); // 処理中スピナーを表示
    try {
      // 2MB以下に圧縮
      const processedBlob = await compressImage(file, 2);

      // originalBlobがない場合は、最初のアップロード画像をoriginalとしても保持
      if (!store.originalBlob) store.updateState({ originalBlob: processedBlob });
      store.setLayerBlob(layerType, processedBlob);
      setActiveTool("preview"); // アップロード後はプレビューに戻す
    } catch (error) {
      console.error("Image compression failed:", error);
      alert("画像の圧縮処理に失敗しました。");
    } finally {
      setIsProcessing(false);
      e.target.value = ""; // 同じファイルを選択し直せるようにリセット
    }
  };

  // ツールから確定した画像を受け取る
  const handleApplyTool = (newBlob: Blob) => {
    if (layerType) store.setLayerBlob(layerType, newBlob);
    setActiveTool("preview");
  };

  if (!layerType) return null; // モーダル非表示

  // ツール定義
  const FgTools = [
    { id: "auto", icon: Scissors, label: "Auto Cut" },
    { id: "refine", icon: Layers, label: "Refine Objects" },
    { id: "aigen", icon: Sparkles, label: "AI Generate" },
    { id: "manual", icon: Eraser, label: "Manual Edit" },
  ] as const;

  const BgTools = [
    { id: "auto", icon: Scissors, label: "Auto Cut" },
    { id: "refine", icon: Layers, label: "Refine Objects" },
    { id: "aigen", icon: Sparkles, label: "AI Generate" },
    { id: "manual", icon: Eraser, label: "Manual Edit" },
  ] as const;

  const availableTools = layerType === "foreground" ? FgTools : BgTools;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4">
      <div className="bg-zinc-950 flex flex-col w-full max-w-lg h-[80%] rounded-2xl shadow-2xl animate-in fade-in zoom-in-95 slide-in-from-bottom-4 duration-200">      
        {/* モーダル枠 (スマホは全画面、PCは角丸ウィンドウ) */}
        <div className="bg-zinc-950 flex flex-col w-full h-full max-w-4xl mx-auto bg-zinc-900 sm:rounded-2xl overflow-hidden border border-white/10 shadow-2xl relative">
          
          {/* Header (固定) */}
          <div className="flex-shrink-0 flex items-center justify-between p-3 border-b border-white/10 bg-zinc-950">
            <div className="text-sm font-bold capitalize text-white flex items-center gap-2">
               <button onClick={store.closeLayerEditor} className="p-1.5 hover:bg-white/10 rounded-full mr-1 transition-colors">
                 <X size={18} />
               </button>
               Edit {layerType}
            </div>
            {activeTool !== "preview" && (
               <button 
                 onClick={() => setActiveTool("preview")}
                 className="text-xs text-gray-400 hover:text-white px-3 py-1 bg-white/5 rounded-full border border-white/10"
               >
                 Cancel Tool
               </button>
            )}
          </div>

          {/* Main Area (flex-1 min-h-0 でフッターを押し出さない) */}
          <div className="flex-1 min-h-0 relative bg-[#0a0a0a] flex flex-col items-center justify-center overflow-hidden">
            
            {/* ローディングオーバーレイ */}
            {isProcessing && (
               <div className="absolute inset-0 z-50 bg-black/70 backdrop-blur-sm flex flex-col items-center justify-center gap-4">
                  <Loader2 className="animate-spin text-yellow-400" size={32} />
                  <span className="text-white text-sm font-bold animate-pulse">Processing Image...</span>
               </div>
            )}

            {/* ツール領域 */}
            {activeTool === "preview" && (
              <div className="w-full h-full p-4 flex items-center justify-center">
                 {previewSrc ? (
                     <LayerPreview3D previewSrc={previewSrc} />
                 ) : (
                     <label className="flex flex-col items-center justify-center gap-4 cursor-pointer p-12 border-2 border-dashed border-white/20 rounded-2xl hover:bg-white/5 hover:border-yellow-400/50 transition-colors group w-full max-w-sm aspect-square">
                        <div className="p-4 bg-white/5 rounded-full group-hover:bg-yellow-400/20 group-hover:text-yellow-400 transition-colors">
                            <Upload size={32} />
                        </div>
                        <span className="text-gray-400 font-bold group-hover:text-white">Upload {layerType} Image</span>
                        <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
                     </label>
                 )}
              </div>
            )}

            {/* 各ツールのマウント */}
            {activeTool === "auto" && baseImageBlob && (
               <ToolAutoCut sourceBlob={baseImageBlob} onApply={handleApplyTool} onProcessing={setIsProcessing} />
            )}

            {activeTool === "refine" && baseImageBlob && (
               <ToolObjectRefine sourceBlob={baseImageBlob} onApply={handleApplyTool} onProcessing={setIsProcessing} />
            )}

            {activeTool === "manual" && baseImageBlob && (
                <ToolManualCut sourceBlob={baseImageBlob} onApply={handleApplyTool} onProcessing={setIsProcessing} />
            )}

            {activeTool === "aigen" && (
               <ToolAIGenerate refBlob={store.originalBlob} onApply={handleApplyTool} onProcessing={setIsProcessing} />
            )}
          </div>

          {/* Footer Toolbar (flex-shrink-0 で高さを固定) */}
          <div className="flex-shrink-0 p-2 bg-zinc-950 border-t border-white/10 overflow-x-auto no-scrollbar pb-safe">
             <div className="flex gap-2 min-w-max justify-center sm:justify-start">
                
                {/* Upload Button */}
                <label className="flex flex-col items-center justify-center gap-1 p-2 w-20 h-16 text-xs rounded-xl hover:bg-white/5 cursor-pointer text-gray-400 hover:text-white transition-colors border border-transparent">
                    <Upload size={20} />
                    <span className="text-[10px] mt-1">Change</span>
                    <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
                </label>
                
                <div className="w-px h-10 bg-white/10 my-auto mx-1" />

                {/* Feature Tools */}
                {availableTools.map(tool => {
                   const Icon = tool.icon;
                   const isActive = activeTool === tool.id;
                   const disabled = !baseImageBlob && tool.id !== "aigen"; // 画像がない場合はAIGen以外無効

                   return (
                     <button
                       key={tool.id}
                       onClick={() => setActiveTool(tool.id as ToolType)}
                       disabled={disabled || isProcessing}
                       className={`flex flex-col items-center justify-center gap-1 p-2 w-20 h-16 text-xs rounded-xl transition-all ${
                         isActive 
                           ? "bg-yellow-400/10 text-yellow-400 border border-yellow-400/30" 
                           : "bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white border border-transparent disabled:opacity-30 disabled:hover:bg-white/5"
                       }`}
                     >
                       <Icon size={20} />
                       <span className="text-[10px] text-center leading-tight mt-1">{tool.label}</span>
                     </button>
                   )
                })}
             </div>
          </div>

        </div>
      </div>
    </div>
  );
};