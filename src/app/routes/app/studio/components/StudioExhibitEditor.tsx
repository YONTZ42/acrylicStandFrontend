import React, { useState } from "react";
import { Plus, Save, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useUpsertExhibit } from "@/features/exhibits/hooks";
import { useExhibitImageUpload } from "@/features/exhibits/hooks/useExhibitImageUpload";
import { useGalleriesList } from "@/features/galleries/hooks";
import type { UpsertExhibitReq } from "@/features/exhibits/api";

import { useExhibitEditorStore, EditorStoreContext } from "@/features/exhibits/hooks/useExhibitEditorStore";
import { LayerThumbCard } from "@/features/exhibits/components/ExhibitEditorModal/LayerThumbCard";
import { ExhibitPreview3D } from "@/features/exhibits/components/ExhibitEditorModal/ExhibitPreview3D";
import { TitleDescriptionForm } from "@/features/exhibits/components/ExhibitEditorModal/TitleDescriptionForm";
import { LayerEditorModal } from "@/features/exhibits/components/ExhibitEditorModal/LayerEditorModal";

export const StudioExhibitEditor: React.FC = () => {
  const navigate = useNavigate();
  const [isStarted, setIsStarted] = useState(false);

  const store = useExhibitEditorStore({
    title: "",
    description: "",
    foregroundUrl: null,
    backgroundUrl: null,
    originalUrl: null,
    styleConfig: { depth: 5, foregroundEffect: "none", backgroundEffect: "none" },
  });

  const galleriesQuery = useGalleriesList();
  const { uploadImageAndGetUrl, isUploading } = useExhibitImageUpload();
  
  const [selectedGalleryId, setSelectedGalleryId] = useState<string>("");
  const [selectedSlotIndex, setSelectedSlotIndex] = useState<number>(0);
  const[isSavingLocal, setIsSavingLocal] = useState(false);

  const upsert = useUpsertExhibit(selectedGalleryId || "dummy");

  const handleSave = async () => {
    if (!selectedGalleryId) {
      alert("Please select a target gallery.");
      return;
    }

    setIsSavingLocal(true);
    try {
      let fgUrl = store.foregroundUrl;
      let bgUrl = store.backgroundUrl;
      let origUrl = store.originalUrl;

      if (store.foregroundBlob) {
        fgUrl = await uploadImageAndGetUrl(store.foregroundBlob);
        store.setLayerUrl("foreground", fgUrl);
      }
      if (store.backgroundBlob) {
        bgUrl = await uploadImageAndGetUrl(store.backgroundBlob);
        store.setLayerUrl("background", bgUrl);
      }
      if (store.originalBlob && !origUrl) {
         origUrl = await uploadImageAndGetUrl(store.originalBlob);
         store.updateState({ originalUrl: origUrl });
      }

      const body = {
        slotIndex: selectedSlotIndex,
        title: store.title.trim() || "",
        description: store.description.trim() || "",
        imageOriginalUrl: origUrl || "",
        imageForegroundUrl: fgUrl || "",
        imageBackgroundUrl: bgUrl || "",
        styleConfig: store.styleConfig,
      };

      await upsert.mutateAsync({
        slotIndex: selectedSlotIndex,
        body: body as unknown as UpsertExhibitReq,
      });

      navigate(`/app/galleries/${selectedGalleryId}`);
    } catch (e) {
      console.error("Save failed:", e);
      alert("Failed to save exhibit.");
    } finally {
      setIsSavingLocal(false);
    }
  };

  const isProcessing = isSavingLocal || isUploading || upsert.isPending;
  const canSave = !!(store.foregroundBlob || store.foregroundUrl) && !!selectedGalleryId;

  return (
    <EditorStoreContext.Provider value={store}>
      <div className="flex flex-col h-full w-full max-w-3xl mx-auto bg-brand-surface border-x border-brand-border shadow-sm">
        
        {/* ==============================
            上部: 固定エリア (プレビュー / ボタン)
            ============================== */}
        <div className="flex-shrink-0 h-[40vh] min-h-[300px] border-b border-brand-border bg-brand-bg relative z-10 overflow-hidden">
          {!isStarted ? (
            <div className="absolute inset-0 p-6 flex items-center justify-center bg-brand-bg-soft">
              <button
                onClick={() => setIsStarted(true)}
                className="flex flex-col items-center justify-center w-full h-full max-w-sm max-h-64 rounded-3xl border-2 border-dashed border-brand-border-strong bg-white hover:border-brand-primary hover:bg-brand-primary-soft transition-all duration-200 group"
              >
                <div className="p-5 rounded-full bg-brand-primary-soft group-hover:bg-brand-primary text-brand-primary group-hover:text-white transition-colors duration-200 mb-5 shadow-sm">
                  <Plus size={40} strokeWidth={2.5} />
                </div>
                <span className="text-xl font-extrabold text-brand-text tracking-tight">アクスタを作る</span>
                <span className="mt-2 text-sm font-bold text-brand-text-muted">Tap to start editing</span>
              </button>
            </div>
          ) : (
            <div className="absolute inset-0 bg-brand-bg">
               <ExhibitPreview3D />
               
               <div className="absolute top-4 left-4 px-3 py-1.5 rounded-full bg-white/70 backdrop-blur-md text-[11px] font-extrabold text-brand-primary border border-white/40 shadow-sm pointer-events-none tracking-wide">
                 3D PREVIEW
               </div>
            </div>
          )}
        </div>

        {/* ==============================
            下部: 編集エリア (スクロール領域)
            ============================== */}
        {isStarted ? (
          <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-8 pb-12 bg-brand-bg">
            {/* Action Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 sticky top-0 z-20 pt-2 -mt-2 bg-brand-bg/90 backdrop-blur-xl border-b border-brand-border px-2">
              <h2 className="text-xl font-extrabold text-brand-text tracking-tight">Editor Menu</h2>
              <button
                onClick={handleSave}
                disabled={!canSave || isProcessing}
                className="flex items-center justify-center gap-2 px-8 py-3 bg-brand-primary hover:bg-brand-primary-hover text-white text-sm font-bold rounded-full disabled:opacity-50 transition-colors shadow-md w-full sm:w-auto active:scale-95"
              >
                {isProcessing ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} strokeWidth={2.5} />}
                {isProcessing ? "Saving..." : "Save to Gallery"}
              </button>
            </div>

            {/* Target Gallery Selection */}
            <section className="bg-white p-6 rounded-3xl border border-brand-border shadow-sm">
              <h3 className="text-sm font-extrabold text-brand-secondary mb-5 flex items-center gap-2 tracking-wide uppercase">
                <span className="w-2.5 h-2.5 rounded-full bg-brand-secondary"></span>
                Save Destination
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-brand-text-muted mb-2">Gallery</label>
                  <select 
                    value={selectedGalleryId}
                    onChange={(e) => setSelectedGalleryId(e.target.value)}
                    className="w-full bg-brand-bg-soft border border-brand-border-strong rounded-2xl p-3.5 text-sm font-bold text-brand-text focus:outline-none focus:border-brand-primary focus:bg-white transition-colors cursor-pointer appearance-none"
                  >
                    <option value="" disabled>Select Gallery...</option>
                    {(galleriesQuery.data ??[]).map((g: { id: string; title: string }) => (
                      <option key={g.id} value={g.id}>{g.title || 'Untitled'}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-brand-text-muted mb-2">Slot Index</label>
                  <select 
                    value={selectedSlotIndex}
                    onChange={(e) => setSelectedSlotIndex(Number(e.target.value))}
                    className="w-full bg-brand-bg-soft border border-brand-border-strong rounded-2xl p-3.5 text-sm font-bold text-brand-text focus:outline-none focus:border-brand-primary focus:bg-white transition-colors cursor-pointer appearance-none"
                  >
                    {Array.from({ length: 12 }).map((_, i) => (
                      <option key={i} value={i}>Slot {i + 1}</option>
                    ))}
                  </select>
                </div>
              </div>
            </section>

            {/* Layers Section */}
            <section className="bg-white p-6 rounded-3xl border border-brand-border shadow-sm">
              <h3 className="text-sm font-extrabold text-brand-accent mb-5 flex items-center gap-2 tracking-wide uppercase">
                <span className="w-2.5 h-2.5 rounded-full bg-brand-accent"></span>
                Layers
              </h3>
              <div className="flex flex-wrap sm:flex-nowrap gap-5">
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

            {/* Title & Style Section */}
            <section className="bg-white p-6 rounded-3xl border border-brand-border shadow-sm space-y-6">
              <h3 className="text-sm font-extrabold text-brand-mint mb-5 flex items-center gap-2 tracking-wide uppercase">
                <span className="w-2.5 h-2.5 rounded-full bg-brand-mint"></span>
                Details & Style
              </h3>
              
              <TitleDescriptionForm
                title={store.title}
                description={store.description}
                onChange={({ title, description }) => store.updateState({ title, description })}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-6 border-t border-brand-border">
                 {/* Depth Slider */}
                 <div>
                    <div className="flex justify-between items-center mb-3">
                      <label className="text-xs font-bold text-brand-text-muted">Thickness (Depth)</label>
                      <span className="text-xs font-bold text-brand-primary bg-brand-primary-soft border border-brand-border-strong px-2.5 py-1 rounded-full">{store.styleConfig.depth}mm</span>
                    </div>
                    <input 
                      type="range" min="1" max="20" step="0.5"
                      value={store.styleConfig.depth}
                      onChange={(e) => store.updateStyleConfig({ depth: parseFloat(e.target.value) })}
                      className="w-full accent-brand-primary h-2.5 bg-brand-border rounded-full appearance-none cursor-pointer"
                    />
                 </div>

                 {/* Foreground Effect */}
                 <div>
                    <label className="block text-xs font-bold text-brand-text-muted mb-3">Foreground Effect</label>
                    <select 
                      value={store.styleConfig.foregroundEffect}
                      onChange={(e) => store.updateStyleConfig({ foregroundEffect: e.target.value as any })}
                      className="w-full bg-brand-bg-soft border border-brand-border-strong rounded-2xl p-3.5 text-sm font-bold text-brand-text focus:outline-none focus:border-brand-primary focus:bg-white transition-colors cursor-pointer appearance-none"
                    >
                      <option value="none">None</option>
                      <option value="hologram">Hologram</option>
                      <option value="glitter">Glitter</option>
                      <option value="emission">Emission</option>
                    </select>
                 </div>
              </div>
            </section>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center opacity-40 pointer-events-none pb-20 bg-brand-bg">
             <div className="w-16 h-16 rounded-full border-4 border-dashed border-brand-primary-hover animate-[spin_10s_linear_infinite] mb-4"></div>
             <span className="text-brand-text text-sm font-extrabold tracking-widest uppercase">Ready to Create</span>
          </div>
        )}

        {/* Sub Modal: Layer Editor */}
        {store.editingLayer && (
           <LayerEditorModal />
        )}
      </div>
    </EditorStoreContext.Provider>
  );
};