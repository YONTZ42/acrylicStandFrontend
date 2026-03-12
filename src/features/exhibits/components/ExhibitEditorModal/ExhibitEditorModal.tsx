// src/features/exhibits/components/ExhibitEditorModal/ExhibitEditorModal.tsx
import React, { useState, useEffect } from "react";
import { X, Save, Loader2 } from "lucide-react";
import { clampSlotIndex } from "@/shared/utils/slot";
import { useUpsertExhibit, useDeleteExhibit } from "@/features/exhibits/hooks";
import { useExhibitImageUpload } from "@/features/exhibits/hooks/useExhibitImageUpload";
import type { UpsertExhibitReq } from "@/features/exhibits/api";

// Stores & Components
import { useExhibitEditorStore, EditorStoreContext } from "@/features/exhibits/hooks/useExhibitEditorStore";
import { LayerThumbCard } from "./LayerThumbCard";
import { ExhibitPreview3D } from "./ExhibitPreview3D";
import { TitleDescriptionForm } from "./TitleDescriptionForm";
import { LayerEditorModal } from "./LayerEditorModal"; // 後述

type Props = {
  open: boolean;
  onClose: () => void;
  galleryId: string;
  slotIndex: number;
  current: any | null; // Exhibit|null
};

export const ExhibitEditorModal: React.FC<Props> = ({ open, onClose, galleryId, slotIndex, current }) => {
  // Store初期化
  const store = useExhibitEditorStore({
    title: current?.title || "",
    description: current?.description || "",
    foregroundUrl: current?.imageForegroundUrl || current?.imageCutoutPngUrl || null,
    backgroundUrl: current?.imageBackgroundUrl || null,
    originalUrl: current?.imageOriginalUrl || null, // 互換性維持のため
    styleConfig: current?.styleConfig || { depth: 5, foregroundEffect: "none", backgroundEffect: "none" },
  });

  const upsert = useUpsertExhibit(galleryId);
  const del = useDeleteExhibit(galleryId);
  const { uploadImageAndGetUrl, isUploading } = useExhibitImageUpload();
  
  const [isSavingLocal, setIsSavingLocal] = useState(false);
  const normalizedSlotIndex = clampSlotIndex(slotIndex);

  // 保存処理 (S3アップロード -> API PUT)
  const handleSave = async () => {
    setIsSavingLocal(true);
    try {
      // 1. BlobがあればS3へアップロードしてURLを取得
      let fgUrl = store.foregroundUrl;
      let bgUrl = store.backgroundUrl;
      let origUrl = store.originalUrl; // バックアップ用

      if (store.foregroundBlob) {
        fgUrl = await uploadImageAndGetUrl(store.foregroundBlob);
        store.setLayerUrl("foreground", fgUrl);
      }
      if (store.backgroundBlob) {
        bgUrl = await uploadImageAndGetUrl(store.backgroundBlob);
        store.setLayerUrl("background", bgUrl);
      }
      if (store.originalBlob && !origUrl) {
         // 元画像も保存しておく（将来の再編集用）
         origUrl = await uploadImageAndGetUrl(store.originalBlob);
         store.updateState({ originalUrl: origUrl });
      }

      // 2. DBへPUT
      const body = {
        slotIndex: normalizedSlotIndex,
        title: store.title.trim() || "",
        description: store.description.trim() || "",
        imageOriginalUrl: origUrl || "", // ※モデル側で必須なら空文字不可だが、今回は仕様に合わせて調整
        imageForegroundUrl: fgUrl || "",
        imageBackgroundUrl: bgUrl || "",
        styleConfig: store.styleConfig,
      };

      await upsert.mutateAsync({
        slotIndex: normalizedSlotIndex,
        body: body as unknown as UpsertExhibitReq,
      });

      onClose();
    } catch (e) {
      console.error("Save failed:", e);
      alert("Failed to save exhibit.");
    } finally {
      setIsSavingLocal(false);
    }
  };

  const handleRemove = async () => {
    if (confirm("Are you sure you want to remove this exhibit?")) {
      await del.mutateAsync({ slotIndex: normalizedSlotIndex });
      onClose();
    }
  };

  if (!open) return null;

  const isProcessing = isSavingLocal || isUploading || upsert.isPending || del.isPending;
  // 保存可能条件：最低でも前景画像(URL or Blob)があること
  const canSave = !!(store.foregroundBlob || store.foregroundUrl);

  return (
    <EditorStoreContext.Provider value={store}>
      <div className="fixed inset-0 z-50 flex flex-col bg-black/95 text-white font-sans sm:p-4">
        
        {/* Modal Container */}
        <div className="flex-1 flex flex-col bg-zinc-950 sm:rounded-2xl sm:border sm:border-white/10 overflow-hidden relative shadow-2xl mx-auto w-full max-w-3xl">
          
          {/* Header */}
          <div className="flex items-center justify-between p-3 border-b border-white/10 bg-zinc-900/50">
            <div className="flex items-center gap-3">
              <button onClick={onClose} disabled={isProcessing} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                <X size={20} />
              </button>
              <div>
                <div className="text-sm font-bold">Slot {normalizedSlotIndex + 1}</div>
                <div className="text-[10px] text-gray-400">Edit Exhibit</div>
              </div>
            </div>
            <button
              onClick={handleSave}
              disabled={!canSave || isProcessing}
              className="flex items-center gap-2 px-4 py-1.5 bg-yellow-400 hover:bg-yellow-300 text-black text-sm font-bold rounded-full disabled:opacity-50 transition-colors"
            >
              {isProcessing ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              Save
            </button>
          </div>

          {/* Top Area: 3D Preview (固定) */}
          <div className="h-[35vh] sm:h-[40vh] bg-[#0a0a0a] border-b border-white/10 relative flex-shrink-0">
             <ExhibitPreview3D />
          </div>

          {/* Bottom Area: Scrollable Settings */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-8">
            
            {/* Layers Section */}
            <section>
              <h3 className="text-sm font-bold text-gray-200 mb-3 border-b border-white/10 pb-2">Layers</h3>
              <div className="flex gap-4">
                <LayerThumbCard 
                  title="Background" 
                  type="background"
                  blob={store.backgroundBlob} 
                  url={store.backgroundUrl} 
                  onClick={() => store.openLayerEditor("background")} 
                />
                <LayerThumbCard 
                  title="Foreground" 
                  type="foreground"
                  blob={store.foregroundBlob} 
                  url={store.foregroundUrl} 
                  onClick={() => store.openLayerEditor("foreground")} 
                />
              </div>
            </section>

            {/* Style Section */}
            <section>
              <h3 className="text-sm font-bold text-gray-200 mb-3 border-b border-white/10 pb-2">Style & Depth</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                 {/* Depth Slider */}
                 <div>
                    <div className="flex justify-between mb-1">
                      <label className="text-xs font-bold text-gray-400">Thickness (Depth)</label>
                      <span className="text-xs text-yellow-400">{store.styleConfig.depth}mm</span>
                    </div>
                    <input 
                      type="range" min="1" max="20" step="0.5"
                      value={store.styleConfig.depth}
                      onChange={(e) => store.updateStyleConfig({ depth: parseFloat(e.target.value) })}
                      className="w-full accent-yellow-400"
                    />
                 </div>

                 {/* Foreground Effect */}
                 <div>
                    <label className="block text-xs font-bold text-gray-400 mb-1">Foreground Effect</label>
                    <select 
                      value={store.styleConfig.foregroundEffect}
                      onChange={(e) => store.updateStyleConfig({ foregroundEffect: e.target.value as any })}
                      className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-sm focus:outline-none focus:border-yellow-400/50"
                    >
                      <option value="none">None</option>
                      <option value="hologram">Hologram</option>
                      <option value="glitter">Glitter</option>
                      <option value="emission">Emission</option>
                    </select>
                 </div>
              </div>
            </section>

            {/* Info Section */}
            <section>
              <h3 className="text-sm font-bold text-gray-200 mb-3 border-b border-white/10 pb-2">Details</h3>
              <TitleDescriptionForm
                title={store.title}
                description={store.description}
                onChange={({ title, description }) => store.updateState({ title, description })}
              />
            </section>

            {/* Danger Zone */}
            {current && (
               <div className="pt-8 pb-4 flex justify-center">
                  <button onClick={handleRemove} className="text-xs text-red-400/70 hover:text-red-400 underline">
                    Delete Exhibit
                  </button>
               </div>
            )}
          </div>
        </div>

        {/* Sub Modal: Layer Editor */}
        {store.editingLayer && (
           <LayerEditorModal />
        )}
      </div>
    </EditorStoreContext.Provider>
  );
};